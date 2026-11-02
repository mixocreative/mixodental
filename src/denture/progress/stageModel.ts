import type { StagePlan } from './stagePlans';

/*
 * The staged progress of one job as a pure model (P8): which stage runs, how far the bar is, how long the job has run.
 * The bar advances by stage, each weighted by its typical share. Inside a stage it eases toward the stage's end with
 * time (or follows the real fraction the worker posts) but never reaches the next stage's boundary until the worker
 * enters that stage; it never goes back; `finish` fills it, `fail` and `cancel` freeze it. No clock, no DOM: callers
 * pass `now` (ms).
 */

export type ProgressStatus = 'running' | 'done' | 'failed' | 'cancelled';

export interface StageState {
  readonly plan: StagePlan;
  readonly status: ProgressStatus;
  readonly startedAt: number;
  readonly endedAt: number | null;
  /** Index of the stage that runs now. */
  readonly stage: number;
  readonly stageStartedAt: number;
  /** The real fraction (0..1) of the running stage, when the worker posts one; else 0. */
  readonly inner: number;
  /** The bar so far (0..1), only ever raised. */
  readonly fraction: number;
}

/** What a worker report carries: the stage string it entered (or null) and the stage's own fraction (or null). */
export interface StageReport {
  stage?: string | null;
  fraction?: number | null;
}

export interface StageView {
  status: ProgressStatus;
  /** 1-based step number and the number of steps ("Step 2 of 4"). */
  step: number;
  steps: number;
  stageId: string;
  labelKey: string;
  /** The bar, 0..1. */
  fraction: number;
  elapsedMs: number;
}

/** In-stage easing never passes this share of the stage, so the bar waits at the boundary for the next stage. */
export const EASE_CAP = 0.95;
/** A running job's bar never shows complete; only `finish` does. */
export const RUNNING_CAP = 0.99;

const clamp01 = (value: number): number => Math.max(0, Math.min(1, value));
const totalWeight = (plan: StagePlan): number => plan.stages.reduce((sum, stage) => sum + stage.weight, 0);
const weightBefore = (plan: StagePlan, index: number): number => plan.stages.slice(0, index).reduce((sum, stage) => sum + stage.weight, 0);

/** A job that has just begun, in its first stage. */
export function startProgress(plan: StagePlan, now: number): StageState {
  return { plan, status: 'running', startedAt: now, endedAt: null, stage: 0, stageStartedAt: now, inner: 0, fraction: 0 };
}

/** The share of the running stage reached at `now`: the real fraction if there is one, else the time easing. */
function stageShare(state: StageState, now: number): number {
  if (state.inner > 0) return state.inner;
  const tau = state.plan.stages[state.stage]!.typicalMs / 2;
  return EASE_CAP * (1 - Math.exp(-Math.max(0, now - state.stageStartedAt) / tau));
}

/**
 * Folds a worker report (and the passing of time up to `now`) into the state. A stage string of a later stage enters
 * it (earlier ones count as done); a string of the running or an earlier stage, or none the plan knows, changes nothing.
 * A terminal state ignores everything.
 */
export function observe(state: StageState, report: StageReport, now: number): StageState {
  if (state.status !== 'running') return state;
  let next = state;
  const entered = report.stage ? state.plan.stages.findIndex((stage) => stage.enteredBy === report.stage) : -1;
  if (entered > state.stage) next = { ...next, stage: entered, stageStartedAt: now, inner: 0 };
  if (typeof report.fraction === 'number' && Number.isFinite(report.fraction)) next = { ...next, inner: Math.max(next.inner, clamp01(report.fraction)) };
  const { plan } = next;
  const total = totalWeight(plan);
  const boundary = (weightBefore(plan, next.stage) + plan.stages[next.stage]!.weight) / total;
  const reached = (weightBefore(plan, next.stage) + plan.stages[next.stage]!.weight * stageShare(next, now)) / total;
  return { ...next, fraction: Math.max(next.fraction, Math.min(reached, boundary, RUNNING_CAP)) };
}

/** The job completed: the bar is full. */
export function finish(state: StageState, now: number): StageState {
  return state.status === 'running' ? { ...state, status: 'done', endedAt: now, fraction: 1 } : state;
}

/** The job failed: the bar stays where it was. */
export function fail(state: StageState, now: number): StageState {
  return state.status === 'running' ? { ...state, status: 'failed', endedAt: now } : state;
}

/** The job was cancelled: the bar stays where it was. */
export function cancel(state: StageState, now: number): StageState {
  return state.status === 'running' ? { ...state, status: 'cancelled', endedAt: now } : state;
}

/** Starts the same plan over (a job that runs again). */
export const reset = (state: StageState, now: number): StageState => startProgress(state.plan, now);

export function view(state: StageState, now: number): StageView {
  const stage = state.plan.stages[state.stage]!;
  return {
    status: state.status,
    step: state.stage + 1,
    steps: state.plan.stages.length,
    stageId: stage.id,
    labelKey: stage.labelKey,
    fraction: state.fraction,
    elapsedMs: Math.max(0, (state.endedAt ?? now) - state.startedAt),
  };
}
