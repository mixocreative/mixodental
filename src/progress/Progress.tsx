import { PROGRESS_STYLE, progressClasses, progressMeasure, type ProgressType } from './progressTypes';
import { t } from '../i18n';

/*
 * ONE COMPONENT FOR EVERY KIND OF WAITING. What it looks like comes from `progressTypes.ts`, not from
 * here: this file decides nothing about colour, shape, size or where the label sits, so a designer
 * changes the table and every instance moves together.
 *
 * It replaces three separate implementations that had drifted apart - a full-screen heading, a box on
 * the scene, and a row in the job list - each with its own markup, its own bar and its own idea of
 * where the label went.
 */

/**
 * THE INDICATOR ON ITS OWN, for a caller that already has a place for the words.
 *
 * The ledger is the one: a job row is a composite - label, elapsed time, Cancel, a failure sentence,
 * sometimes a staged bar - and pushing all of that through `Progress` would grow it a set of
 * row-shaped props, which is worse than the duplication it set out to remove. So the row keeps the
 * row and borrows the indicator, and the type still decides its shape, its tone and whether it may
 * show a measure.
 *
 * The width is a plain `style=` on purpose. Spreading it would slip past `noColourLiterals.test.ts`,
 * whose regex looks for `style={`, and evading a guard whose rule this follows is worse than being
 * listed by it. A bar width IS the job percentage, the exact case its exception list is for.
 */
export function ProgressIndicator({ type, label, fraction }: {
  type: ProgressType;
  /** Only for the accessible name; the caller draws the words it already has. */
  label: string;
  fraction?: number | undefined;
}) {
  const percent = progressMeasure(fraction);
  const measured = percent !== undefined;
  return <div className={progressClasses(type, fraction).indicator} role="progressbar" aria-label={label}
    {...(measured ? { 'aria-valuenow': percent, 'aria-valuemin': 0, 'aria-valuemax': 100 } : {})}>
    <div className="progress-run" style={measured ? { width: `${percent}%` } : undefined} />
  </div>;
}

export function Progress({ type, label, fraction, children }: {
  type: ProgressType;
  /** What is being waited on, already in the reader's language. */
  label: string;
  /** 0..1 when the job counts its own work; left out when it cannot, and then no number is shown. */
  fraction?: number | undefined;
  /** Anything the type carries beside the label: the ledger puts its meta and its Cancel here. */
  children?: React.ReactNode;
}) {
  const style = PROGRESS_STYLE[type];
  const percent = progressMeasure(fraction);
  const classes = progressClasses(type, fraction);
  const measured = percent !== undefined;
  /*
   * THE ONLY INLINE STYLE HERE IS THE BAR WIDTH, which is the job percentage and so cannot be a class.
   * The TONE is not inline: it is one of three fixed values, which a class holds perfectly well, and
   * `noColourLiterals.test.ts` is right to refuse a colour here. The table still owns it -
   * `progressTypes.test.ts` reads the table and asserts the stylesheet declares the token it names, so
   * the entry is not decoration that nothing reads.
   */
  return <div className={classes.root} data-ui={`progress-${type}`} data-progress-type={type}
    role="status" aria-live="polite" {...(type === 'blocking' ? { 'aria-busy': true } : {})}>
    {style.veil ? <div className="progress-veil" aria-hidden="true" /> : null}
    <div className="progress-body">
      <div className="progress-words">
        <span className="progress-label">{label}</span>
        {measured ? <span className="progress-percent">{percent}%</span> : null}
        {children}
      </div>
      <ProgressIndicator type={type} label={label} fraction={fraction} />
      {/*
        A job with no number says so to a screen reader, which cannot see a bar pacing. The sighted
        reader already has the pacing, so nothing is printed for them.
      */}
      {measured ? null : <span className="visually-hidden">{t('Working…')}</span>}
    </div>
  </div>;
}
