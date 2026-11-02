import { describe, expect, it } from 'vitest';
import { GENERATE_PHASES, type GeneratePhase } from '@mixo-geocore/host/core/progress';
import { phaseStages } from './phaseStages';
import { observe, startProgress, view } from './stageModel';
import { BUILD_PLAN, DENTURE_STAGE } from './stagePlans';

type Post = [number, string];
/** Feeds `phases` (name, done, total) through the mapper, returning what it posted. */
function run(phases: ReadonlyArray<readonly [GeneratePhase, number?, number?]>): Post[] {
  const posts: Post[] = [];
  const onPhase = phaseStages((fraction, stage) => posts.push([fraction, stage]));
  for (const [name, done = 0, total = 0] of phases) onPhase(name, done, total);
  return posts;
}

describe('phase to stage mapping', () => {
  it('folds the nine phases into the build stages', () => {
    const stages = run(GENERATE_PHASES.map((name) => [name] as const)).map(([, stage]) => stage);
    expect(stages).toEqual([
      DENTURE_STAGE.preparing, DENTURE_STAGE.routing, DENTURE_STAGE.bracing, DENTURE_STAGE.bracing, DENTURE_STAGE.bracing,
      DENTURE_STAGE.checking, DENTURE_STAGE.checking, DENTURE_STAGE.checking, DENTURE_STAGE.checking,
    ]);
  });

  it('gives routing the counted fraction, clamped', () => {
    expect(run([['routing', 0, 40], ['routing', 10, 40], ['routing', 40, 40], ['routing', 50, 40]]).map(([fraction]) => fraction)).toEqual([0, 0.25, 1, 1]);
    expect(run([['routing']])[0]![0]).toBe(0);
  });

  it('posts the repair string for a round that re-enters routing, until judging', () => {
    const stages = run([['preparing'], ['routing', 5, 10], ['placing'], ['bracing'], ['raft'], ['checking'], ['routing', 1, 10], ['placing'], ['raft'], ['checking'], ['judging'], ['finishing'], ['writing']]).map(([, stage]) => stage);
    expect(stages).toEqual([
      DENTURE_STAGE.preparing, DENTURE_STAGE.routing, DENTURE_STAGE.bracing, DENTURE_STAGE.bracing, DENTURE_STAGE.bracing, DENTURE_STAGE.checking,
      DENTURE_STAGE.repairing, DENTURE_STAGE.repairing, DENTURE_STAGE.repairing, DENTURE_STAGE.repairing,
      DENTURE_STAGE.checking, DENTURE_STAGE.checking, DENTURE_STAGE.checking,
    ]);
  });

  it('keeps the bar monotonic through a repair round, with the sub-label on and then off', () => {
    let state = startProgress(BUILD_PLAN, 0);
    let last = 0;
    let at = 0;
    const sawRepairing: boolean[] = [];
    const onPhase = phaseStages((fraction, stage) => {
      at += 1000;
      state = observe(state, { stage, fraction }, at);
      expect(state.fraction).toBeGreaterThanOrEqual(last);
      last = state.fraction;
      sawRepairing.push(view(state, at).repairing);
    });
    const feed: ReadonlyArray<readonly [GeneratePhase, number, number]> = [['preparing', 0, 0], ['routing', 0, 10], ['routing', 10, 10], ['placing', 0, 0], ['raft', 0, 0], ['checking', 0, 0],
      ['routing', 0, 10], ['routing', 6, 10], ['placing', 0, 0], ['checking', 0, 0], ['judging', 0, 0], ['writing', 0, 0]];
    for (const [name, done, total] of feed) onPhase(name, done, total);
    expect(sawRepairing).toEqual([false, false, false, false, false, false, true, true, true, true, false, false]);
    expect(view(state, at).stageId).toBe('checking');
  });

  it('ignores a phase the plan does not know', () => {
    const before = observe(startProgress(BUILD_PLAN, 0), { stage: DENTURE_STAGE.routing, fraction: 0.4 }, 10);
    const posts = run([['made-up-phase' as GeneratePhase, 3, 9]]);
    expect(posts).toEqual([]);
    expect(observe(before, { stage: 'Something unknown' }, 20).stage).toBe(before.stage);
  });
});
