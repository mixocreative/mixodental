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
      <div className={classes.indicator} role="progressbar" aria-label={label}
        {...(measured ? { 'aria-valuenow': percent, 'aria-valuemin': 0, 'aria-valuemax': 100 } : {})}>
        {/*
          Written as a plain `style=` on purpose. Spreading it instead would slip past
          `noColourLiterals.test.ts`, whose regex looks for `style={` - and evading a guard whose rule
          this follows is worse than being listed by it. The width is the job percentage, which is the
          exact case its exception list is for, and it is listed there with that reason.
        */}
        <div className="progress-run" style={measured ? { width: `${percent}%` } : undefined} />
      </div>
      {/*
        A job with no number says so to a screen reader, which cannot see a bar pacing. The sighted
        reader already has the pacing, so nothing is printed for them.
      */}
      {measured ? null : <span className="visually-hidden">{t('Working…')}</span>}
    </div>
  </div>;
}
