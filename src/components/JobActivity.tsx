import { useEffect, useReducer, useRef, type ReactNode } from 'react';
import { ERROR_CONTEXTS, errorStatus, type ErrorContext } from '@mixo-geocore/editing/errors';
import { ProgressIndicator } from '../progress/Progress';
import { t, translateMessage } from '../i18n';
import { jobActivity, type JobActivity, type JobRow } from '@mixo-geocore/host/workers/jobActivity';
import { PROGRESS_STAGE } from '@mixo-geocore/host/core/progress';
import { rebuiltJobError } from '../workers/jobErrors';
import { formatTime } from './formatTime';
import { storedExportOutcome } from './exportOutcomeText';

/** Re-render this often while jobs are listed: the show delay, linger and times are time-driven. */
const TICK_MS = 250;

/**
 * A failure in plain words with the next step, in the user's language: the same message the status
 * line gives (editing/errors), from the job's context and the error's code and values.
 *
 * AN EXPORT REFUSAL SAYS ITS OWN SENTENCE, not the generic one. `errorStatus` maps an unknown code
 * to "the export failed", which is true and useless beside four sentences that each name the cause
 * and the next step. `exportOutcomeText` owns those four, and `useExport` writes the row with the
 * code that leads back to them - so the status line and this list say the same thing about the same
 * event (one thing, one name) instead of the list paraphrasing it.
 */
export function failureText(row: JobRow): string {
  const refused = row.error ? storedExportOutcome(row.error) : undefined;
  if (refused) return translateMessage(refused);
  const context: ErrorContext = (ERROR_CONTEXTS as readonly string[]).includes(row.context ?? '') ? row.context as ErrorContext : 'build';
  const name = row.label.vars?.name;
  const error = rebuiltJobError(row.error ?? { code: null, message: '' });
  return translateMessage(errorStatus(context, error, name === undefined ? {} : { name: String(name) }));
}

/** The shared host reports its own stages as codes (no English in shared code); the engine and this app's workers post the English key. */
const HOST_STAGES: Readonly<Record<string, string>> = {
  [PROGRESS_STAGE.writingStl]: 'Writing STL',
  [PROGRESS_STAGE.samplingNormals]: 'Sampling surface normals',
  [PROGRESS_STAGE.findingOverhangs]: 'Finding overhangs',
  [PROGRESS_STAGE.done]: 'Done',
};

/** The i18n key of a progress stage. */
export const stageKey = (stage: string): string => HOST_STAGES[stage] ?? stage;

/** Row text: what runs (and its stage), and the numbers (percent, time left or elapsed). */
export function rowText(row: JobRow): { label: string; meta: string } {
  const label = translateMessage(row.label);
  if (row.state === 'failed') return { label: failureText(row), meta: '' };
  if (row.state === 'cancelled') return { label: t('{label}: cancelled. Supports unchanged.', { label }), meta: '' };
  if (row.cancelling) return { label, meta: t('Cancelling…') };
  const meta: string[] = [];
  if (row.percent !== null) meta.push(`${row.percent}%`);
  if (row.remainingMs !== null) meta.push(t('about {time} left', { time: formatTime(row.remainingMs) }));
  else if (row.showElapsed) meta.push(t('{time} so far', { time: formatTime(row.elapsedMs) }));
  return { label: row.stage ? `${label} · ${t(stageKey(row.stage))}` : `${label}…`, meta: meta.join(' · ') };
}

/**
 * The one place every background job shows (shared heavy-mesh spec §5): nothing for the first
 * 400 ms, then an indeterminate bar with a plain label, a determinate bar with percent and stage
 * once the worker reports progress, Cancel for cancellable jobs, and failures in plain words with
 * the next step. Non-blocking (the viewport stays usable), except a job that changes what the user
 * edits (an import): a veil over the viewport, with Cancel, while it shows.
 */
export default function JobActivityPanel({ activity = jobActivity, stagedBar }: { activity?: JobActivity; stagedBar?: (row: JobRow) => ReactNode }) {
  const [, rerender] = useReducer((count: number) => count + 1, 0);
  useEffect(() => activity.subscribe(rerender), [activity]);
  const busy = activity.hasJobs();
  useEffect(() => {
    if (!busy) return;
    const timer = window.setInterval(rerender, TICK_MS);
    return () => window.clearInterval(timer);
  }, [busy]);
  const rows = activity.view();
  const blocking = rows.some((row) => row.blocking && (row.state === 'indeterminate' || row.state === 'determinate'));
  // Announced politely, once each: a job that appears, and how a job ended badly; never the ticking percent.
  const announced = useRef(new Map<number, string>());
  const lastAnnouncement = useRef('');
  const fresh: string[] = [];
  for (const row of rows) {
    const phase = row.state === 'failed' || row.state === 'cancelled' ? row.state : 'running';
    if (row.state === 'done' || announced.current.get(row.id) === phase) continue;
    announced.current.set(row.id, phase);
    fresh.push(phase === 'running' ? `${translateMessage(row.label)}…` : rowText(row).label);
  }
  if (fresh.length > 0) lastAnnouncement.current = fresh.join(' ');
  const announcement = lastAnnouncement.current;
  return <>
    {blocking && <div className="job-veil" aria-hidden="true" />}
    <section className="job-activity" aria-label={t('Background work')} hidden={rows.length === 0}>
      <ul>
        {rows.map((row) => {
          const text = rowText(row);
          const ended = row.state === 'failed' || row.state === 'cancelled';
          const determinate = row.state === 'determinate' || row.state === 'done';
          const percent = row.state === 'done' ? 100 : row.percent ?? 0;
          // A job with its own stages (denture scan and build) shows them in place of the plain bar and its numbers.
          const staged = stagedBar?.(row) ?? null;
          return <li key={row.id} className="job-row" data-state={row.state}>
            <div className="job-head">
              <span className="job-label" title={text.label}>{staged && !ended ? translateMessage(row.label) : text.label}</span>
              {text.meta && !staged && <span className="job-meta">{text.meta}</span>}
              {row.cancellable && !ended && <button onClick={() => activity.cancel(row.id)} aria-label={t('Cancel {label}', { label: translateMessage(row.label) })}>{t('Cancel')}</button>}
              {row.state === 'failed' && <button onClick={() => activity.dismiss(row.id)} aria-label={t('Dismiss {label}', { label: translateMessage(row.label) })}>{t('Dismiss')}</button>}
            </div>
            {staged}
            {/*
              THE LEDGER KIND OF WAITING (src/progress/README.md). The row keeps its own shape - a
              label, a time, Cancel, a failure sentence - and borrows only the indicator, so the type
              decides the tone, the shape and whether a measure may be shown, while the row stays a
              row. A job with its own stages draws those instead; one that has ended draws nothing,
              because there is nothing left to wait for.
            */}
            {!staged && !ended && <ProgressIndicator type="ledger"
              label={translateMessage(row.label)}
              {...(determinate ? { fraction: percent / 100 } : {})} />}
          </li>;
        })}
      </ul>
    </section>
    <div className="visually-hidden" role="status" aria-live="polite">{announcement}</div>
  </>;
}
