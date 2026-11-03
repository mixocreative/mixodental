import type { ReactNode } from 'react';
import { t } from '../i18n';

/**
 * The verdict of a supports step: one sentence with a coloured dot, the one action that answers it, and a
 * Details fold holding the evidence. It is the first thing in the step, because the question a reader opens
 * the step with is "is this build sound?" - the settings answer a later question and sit under it.
 *
 * Both supports steps use this: the denture's Step 2 and the aligner's Step 3. The `kind` only names the
 * parts (`{kind}-review-summary`, `-line`, `-details-toggle`, `-details`); the shape is the same, so a
 * change here reaches both steps.
 *
 * `tone` colours the dot (`ready`, `look`, `fix`, `failed`, `building`), `stale` dims the line while a
 * verdict is on its way, and `action` is the single command that resolves the line, where there is one.
 */
export function ReviewSummary({ kind, tone, line, stale = false, open, onToggle, action, children }: {
  /** `denture` or `aligner`: names the parts, nothing else. */
  kind: string;
  tone: 'building' | 'failed' | 'fix' | 'look' | 'ready';
  /** The verdict, already translated. */
  line: string;
  stale?: boolean;
  /** Whether Details is open; absent means there is nothing to show yet (the build is still running). */
  open?: boolean;
  onToggle?: (open: boolean) => void;
  /** The one action that answers the line (the denture's Fix), where the state has one. */
  action?: ReactNode;
  /** The evidence behind Details. */
  children?: ReactNode;
}) {
  const settled = open !== undefined && onToggle !== undefined;
  return <section className={`review-summary is-${tone}${stale && settled ? ' is-stale' : ''}`} data-ui={`${kind}-review-summary`} aria-busy={stale || undefined}>
    <p className="review-line" role="status" data-ui={`${kind}-review-line`}>{line}</p>
    {settled ? <div className="orient-row review-actions">
      {action}
      <button type="button" className="review-details-toggle" data-ui={`${kind}-review-details-toggle`} aria-expanded={open}
        onClick={() => onToggle(!open)}>{open ? t('Hide details') : t('Details')}</button>
    </div> : null}
    {settled && open ? <div className="review-details" data-ui={`${kind}-review-details`}>{children}</div> : null}
  </section>;
}
