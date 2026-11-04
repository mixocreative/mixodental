import { t } from '../i18n';

/**
 * WORK IN PROGRESS, SHOWN ON THE SCENE: what the app is doing to the model the reader is looking at, over
 * the model itself rather than in a panel they would have to find.
 *
 * `fraction` IS OPTIONAL ON PURPOSE, and this is the whole design of it. A job that counts its own work
 * reports a real fraction and gets a real percentage; a job that is one call into the core reports only its
 * start and its end, and that one gets a moving bar with NO NUMBER. The app never shows a percentage it had
 * to invent - a bar that sits at 40% while the work is already done, or still running, teaches a reader to
 * stop believing the next one.
 */
export function SceneProgress({ stage, fraction }: {
  /** What is being done, in the reader's language. */
  stage: string;
  /** 0..1 when the job counts its own work; left out when it cannot. */
  fraction?: number | undefined;
}) {
  const known = typeof fraction === 'number' && Number.isFinite(fraction);
  const percent = known ? Math.max(0, Math.min(100, Math.round(fraction * 100))) : undefined;
  return <div className="scene-progress" role="status" aria-live="polite" data-ui="scene-progress">
    <div className="scene-progress-words">
      <span className="scene-progress-stage">{stage}</span>
      {percent !== undefined ? <span className="scene-progress-percent">{percent}%</span> : null}
    </div>
    <div className={`scene-progress-track${known ? '' : ' is-waiting'}`}
      role="progressbar" aria-label={stage}
      {...(percent === undefined ? {} : { 'aria-valuenow': percent, 'aria-valuemin': 0, 'aria-valuemax': 100 })}>
      <div className="scene-progress-run" {...(known ? { style: { width: `${percent}%` } } : {})} />
    </div>
    {known ? null : <span className="visually-hidden">{t('Working…')}</span>}
  </div>;
}
