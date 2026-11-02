import { useRef, type ReactNode } from 'react';
import type { JobRow } from '@mixo-geocore/host/workers/jobActivity';
import { t } from '../../i18n';
import { formatTime } from '../../components/formatTime';
import { cancel, fail, finish, observe, startProgress, view, type StageState } from './stageModel';
import { stagePlanOf, type StagePlan } from './stagePlans';

/*
 * The staged bar of a long denture job (P8): "Step 2 of 4", the stage's name, a bar that moves by stage, the elapsed
 * time. It lives inside the job's row in the background-work list (components/JobActivity.tsx), which keeps the job's
 * label and its Cancel button; this only replaces the plain bar. The row is the source: its stage string and fraction
 * (posted by the denture worker) feed the pure model in stageModel.ts, and the list's own tick (250 ms) advances the easing.
 */

/** The model of one row, kept between renders; the clock is read here, once per render. */
function useStageState(row: JobRow, plan: StagePlan): StageState {
  const state = useRef<StageState>();
  const now = Date.now();
  let next = state.current ?? startProgress(plan, now - row.elapsedMs);
  next = observe(next, { stage: row.stage, fraction: row.fraction }, now);
  if (row.state === 'done') next = finish(next, now);
  else if (row.state === 'failed') next = fail(next, now);
  else if (row.state === 'cancelled') next = cancel(next, now);
  state.current = next;
  return next;
}

function StagedBar({ row, plan }: { row: JobRow; plan: StagePlan }) {
  const state = useStageState(row, plan);
  const shown = view(state, Date.now());
  const percent = Math.max(Math.round(shown.fraction * 100), 2);
  const ended = shown.status === 'failed' || shown.status === 'cancelled';
  return <div className="staged-progress" data-ui="staged-progress" data-stage={shown.stageId} data-status={shown.status} data-step={shown.step}>
    <div className="staged-progress-head" data-ui="staged-progress-head">
      <span className="staged-progress-step" data-ui="staged-progress-step">{t('Step {n} of {total}', { n: shown.step, total: shown.steps })}</span>
      <span className="staged-progress-stage" data-ui="staged-progress-stage">{row.cancelling && !ended ? t('Cancelling…') : t(shown.labelKey)}</span>
      <span className="staged-progress-time" data-ui="staged-progress-time">{formatTime(shown.elapsedMs)}</span>
    </div>
    <div className="progress-track staged-progress-track" data-ui="staged-progress-track" role="progressbar" aria-label={t(shown.labelKey)} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}
      aria-valuetext={t('Step {n} of {total}', { n: shown.step, total: shown.steps })}>
      <div className="progress-fill staged-progress-fill" data-ui="staged-progress-fill" style={{ width: `${percent}%` }} />
    </div>
  </div>;
}

/** The staged bar for a job row, or nothing when the job has no stages (every job but the denture scan and build). */
export function stagedJobBar(row: JobRow): ReactNode {
  const plan = stagePlanOf(row.label.key);
  return plan ? <StagedBar key={row.id} row={row} plan={plan} /> : null;
}
