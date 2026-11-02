import { describe, expect, it } from 'vitest';
import { DICTIONARY } from '../../i18n';
import { EASE_CAP, RUNNING_CAP, cancel, fail, finish, observe, reset, startProgress, view } from './stageModel';
import { BUILD_PLAN, DENTURE_STAGE, SCAN_PLAN, stagePlanOf, type StagePlan } from './stagePlans';

const total = (plan: StagePlan) => plan.stages.reduce((sum, stage) => sum + stage.weight, 0);
/** The bar at the end of stage `index`. */
const boundary = (plan: StagePlan, index: number) => plan.stages.slice(0, index + 1).reduce((sum, stage) => sum + stage.weight, 0) / total(plan);

describe('stage plans', () => {
  it('names a plan for the two denture jobs only', () => {
    expect(stagePlanOf('Orienting {name}')).toBe(SCAN_PLAN);
    expect(stagePlanOf('Building supports for {name}')).toBe(BUILD_PLAN);
    expect(stagePlanOf('Importing {name}')).toBeUndefined();
  });

  it('gives every stage a positive weight and its own entering string', () => {
    for (const plan of [SCAN_PLAN, BUILD_PLAN]) {
      expect(new Set(plan.stages.map((stage) => stage.enteredBy)).size).toBe(plan.stages.length);
      for (const stage of plan.stages) {
        expect(stage.weight).toBeGreaterThan(0);
        expect(stage.typicalMs).toBeGreaterThan(0);
      }
    }
  });

  it('translates every stage name', () => {
    for (const plan of [SCAN_PLAN, BUILD_PLAN]) {
      for (const stage of plan.stages) for (const lang of ['ja', 'zh-Hant'] as const) expect(DICTIONARY[lang][stage.labelKey], `${lang}: ${stage.labelKey}`).toBeTruthy();
    }
  });
});

describe('repair rounds', () => {
  const routing = observe(startProgress(BUILD_PLAN, 0), { stage: DENTURE_STAGE.checking }, 100);

  it('shows "repairing" without moving the bar back, and clears it when the running stage is posted again', () => {
    const repairing = observe(routing, { stage: DENTURE_STAGE.repairing, fraction: 0.3 }, 200);
    expect(view(repairing, 200)).toMatchObject({ repairing: true, stageId: 'checking' });
    expect(repairing.fraction).toBeGreaterThanOrEqual(routing.fraction);
    expect(repairing.inner).toBe(routing.inner);
    const done = observe(repairing, { stage: DENTURE_STAGE.checking }, 300);
    expect(view(done, 300).repairing).toBe(false);
    expect(done.fraction).toBeGreaterThanOrEqual(repairing.fraction);
  });

  it('ignores an unknown stage string', () => {
    const same = observe(routing, { stage: 'Not a stage' }, 200);
    expect(same.stage).toBe(routing.stage);
    expect(same.repairing).toBe(false);
  });

  it('a plan without repairs never repairs', () => {
    expect(observe(startProgress(SCAN_PLAN, 0), { stage: DENTURE_STAGE.repairing }, 5).repairing).toBe(false);
  });
});

describe('stage model', () => {
  it('starts at step 1 with an empty bar', () => {
    const shown = view(startProgress(BUILD_PLAN, 1000), 1000);
    expect(shown).toMatchObject({ status: 'running', step: 1, steps: 5, stageId: 'placing', fraction: 0, elapsedMs: 0 });
  });

  it('eases inside a stage with time and stays under the next boundary', () => {
    let state = startProgress(BUILD_PLAN, 0);
    let previous = 0;
    for (const at of [500, 2000, 8000, 600_000]) {
      state = observe(state, {}, at);
      expect(state.fraction).toBeGreaterThan(previous);
      expect(state.fraction).toBeLessThanOrEqual(boundary(BUILD_PLAN, 0));
      previous = state.fraction;
    }
    expect(previous).toBeCloseTo(boundary(BUILD_PLAN, 0) * EASE_CAP, 2);
    expect(view(state, 600_000).step).toBe(1);
  });

  it('enters a stage only when the worker names it, and the bar moves to at least its start', () => {
    let state = observe(startProgress(BUILD_PLAN, 0), {}, 100);
    state = observe(state, { stage: DENTURE_STAGE.routing }, 200);
    const shown = view(state, 200);
    expect(shown).toMatchObject({ step: 3, stageId: 'routing' });
    expect(shown.fraction).toBeGreaterThanOrEqual(boundary(BUILD_PLAN, 1));
    expect(shown.fraction).toBeLessThan(boundary(BUILD_PLAN, 2));
    state = observe(state, {}, 60_000);
    expect(state.fraction).toBeGreaterThan(boundary(BUILD_PLAN, 1));
    const counted = observe(observe(startProgress(BUILD_PLAN, 0), { stage: DENTURE_STAGE.routing }, 10), { fraction: 0.5 }, 20);
    expect(counted.fraction).toBeCloseTo(0.09 + 0.5 * 0.5, 2);
  });

  it('never goes back: an earlier or unknown stage string and a smaller fraction change nothing', () => {
    let state = observe(startProgress(SCAN_PLAN, 0), { stage: DENTURE_STAGE.scanning, fraction: 0.6 }, 100);
    const before = state;
    state = observe(state, { stage: DENTURE_STAGE.reading, fraction: 0.1 }, 200);
    state = observe(state, { stage: 'Something else' }, 300);
    expect(state.stage).toBe(before.stage);
    expect(state.fraction).toBeGreaterThanOrEqual(before.fraction);
    expect(state.inner).toBe(0.6);
  });

  it('follows a real fraction inside a stage and clamps it', () => {
    let state = observe(startProgress(SCAN_PLAN, 0), { stage: DENTURE_STAGE.scanning }, 10);
    const startOfStage = state.fraction;
    state = observe(state, { fraction: 0.5 }, 20);
    expect(state.fraction).toBeCloseTo(0.15 + 0.85 * 0.5, 2);
    state = observe(state, { fraction: 7 }, 30);
    expect(state.inner).toBe(1);
    expect(state.fraction).toBeLessThanOrEqual(RUNNING_CAP);
    expect(state.fraction).toBeGreaterThan(startOfStage);
    expect(observe(state, { fraction: Number.NaN }, 40).inner).toBe(1);
    expect(observe(startProgress(SCAN_PLAN, 0), { fraction: -3 }, 5).inner).toBe(0);
  });

  it('is monotonic over a whole run, whatever the order of reports', () => {
    let state = startProgress(BUILD_PLAN, 0);
    let last = 0;
    const reports = [{}, { stage: DENTURE_STAGE.preparing }, { stage: DENTURE_STAGE.placing }, {}, { stage: DENTURE_STAGE.routing }, { fraction: 0.2 }, {}, { stage: DENTURE_STAGE.checking }, { fraction: 0 }, {}];
    reports.forEach((report, at) => {
      state = observe(state, report, at * 5000);
      expect(state.fraction).toBeGreaterThanOrEqual(last);
      last = state.fraction;
    });
    expect(last).toBeLessThanOrEqual(RUNNING_CAP);
  });

  it('shows a complete bar only after finish, and the elapsed time stops', () => {
    const state = finish(observe(startProgress(SCAN_PLAN, 0), { stage: DENTURE_STAGE.scanning, fraction: 1 }, 4000), 5000);
    expect(view(state, 9000)).toMatchObject({ status: 'done', fraction: 1, elapsedMs: 5000 });
  });

  it('freezes on cancel and on failure, and ignores later reports', () => {
    const running = observe(startProgress(BUILD_PLAN, 0), { stage: DENTURE_STAGE.preparing }, 3000);
    for (const [end, status] of [[cancel, 'cancelled'], [fail, 'failed']] as const) {
      const stopped = end(running, 4000);
      expect(observe(stopped, { stage: DENTURE_STAGE.checking }, 9000)).toBe(stopped);
      expect(finish(stopped, 9000)).toBe(stopped);
      expect(view(stopped, 9000)).toMatchObject({ status, step: 2, fraction: running.fraction, elapsedMs: 4000 });
    }
  });

  it('resets to the first stage, empty, with a new clock', () => {
    const stopped = cancel(observe(startProgress(BUILD_PLAN, 0), { stage: DENTURE_STAGE.routing }, 3000), 4000);
    expect(view(reset(stopped, 10_000), 10_500)).toMatchObject({ status: 'running', step: 1, fraction: 0, elapsedMs: 500 });
  });
});
