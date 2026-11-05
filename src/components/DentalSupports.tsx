import { useState } from 'react';
import { Icon } from '../ui/Icon';
import { resolve, type CommandId, type UiState } from '@mixo-geocore/editing/commands';
import type { EditGesture } from '@mixo-geocore/editing/gesture';
import type { SessionEvent } from '@mixo-geocore/editing/session';
import { plural, t } from '../i18n';
import { kindText } from '../denture/kindText';
import { adjustRemembered, rememberAdjust } from '../dental/adjustMemory';
import { reviewLine } from '../denture/steps/supports/reviewLineText';
import { CommandButton } from './CommandButton';
import { BackAskBlock, EditSupportsBlock, IdLabelBlock, ProblemsBlock, SupportSettingsBlock, reviewNotes, type DentalReview } from './DentalReviewBlocks';
import { Panel } from './Panel';
import { ReviewSummary } from './ReviewSummary';
import { RestoreStepButton, type StepRestore } from './RestoreStepButton';

export type { DentalReview, RimGap } from './DentalReviewBlocks';

/**
 * The aligner Step 3, in the same shape as denture Step 2 and the tilt step before it: the verdict
 * first, then the evidence behind Details, then the settings behind a folded Adjust, then the two ways to
 * finish. A reader opens this step to learn whether the build is sound, so that is what it says first; what
 * they would change in response is one fold away, and Adjust remembers whether they left it open.
 *
 * The blocks are shared with the denture's Step 2 (`DentalReviewBlocks.tsx`, `ReviewSummary.tsx`), so the two
 * supports steps keep the same shape by construction rather than by agreement.
 */
export function DentalSupportsStep({ gesture, ui, review, ready, send, run, restore }: {
  /** The tool in hand, or undefined until one is picked: a step opens with none. */
  gesture: EditGesture | undefined;
  ui: UiState;
  review: DentalReview;
  ready: boolean;
  send: (event: SessionEvent) => void;
  run: (id: CommandId) => void;
  restore?: StepRestore | undefined;
}) {
  const [adjusting, setAdjusting] = useState(false);
  const [adjustOpen, setAdjustOpen] = useState(() => adjustRemembered('aligner'));
  const [detailsOpen, setDetailsOpen] = useState(false);
  /*
   * A verdict already on screen STAYS on screen while its replacement is on the way, dimmed. `ready` goes
   * false the instant any setting changes (the build no longer belongs to the object as it is now), so
   * reading the line from `ready` alone replaced the verdict with "Building supports" and took Details away
   * with it - a reader lost the verdict instead of being told it was out of date. The findings themselves
   * outlive the rebuild (`review.problems` holds the last check's, marked out of date), so there is
   * something true to show the whole time. "Building supports" is for the FIRST build, which has no previous
   * result: that is what `buildLanded` tells apart.
   */
  const shown = ready || review.buildLanded;
  /*
   * `shown && !ready` IS the definition of out of date - a result is on screen and it is not the one the
   * object would build now - so it needs no rebuild to have started and no pointer to be held. Leaning on
   * `verdictPending` alone left a gap: the rebuild job starts in an effect, and before Check has ever run
   * there is no stored verdict for `verdictBehind` to compare, so nothing marked the panel stale at all.
   */
  const stale = adjusting || review.verdictPending || (shown && !ready);
  // A build that FAILED outranks the verdict it was meant to replace: there is nothing sound to keep reading.
  const failed = Boolean(ui.dentalBuildFailed);
  // Spots a rule accepts on purpose are the rules' own choice and are never counted as a problem.
  const findings = review.problems.filter((problem) => !problem.rule).length;
  const line = reviewLine({ built: shown && !failed, failed, resolvable: 0, problems: findings + reviewNotes(review, 'aligner').length });
  return <aside className="dental-side" data-ui="dental-supports-panel" aria-label={t('Step 3 · Supports')}>
    <div className="dental-scroll">
    <ReviewSummary kind="aligner" tone={line.kind} stale={stale} line={line.other ? plural(line.n, line.key, line.other) : t(line.key)}
      {...(shown ? { open: detailsOpen, onToggle: setDetailsOpen } : {})}>
      <ProblemsBlock review={review} ui={ui} send={send} run={run} kind="aligner" stale={stale} />
    </ReviewSummary>
    <Panel ui="aligner-adjust" title={t('Adjust')} collapsible open={adjustOpen} onToggle={(open) => { rememberAdjust('aligner', open); setAdjustOpen(open); }}>
      <SupportSettingsBlock review={review} kind="aligner" onAdjust={setAdjusting} />
      <EditSupportsBlock gesture={gesture} ui={ui} review={review} send={send} run={run} kind="aligner" />
      <IdLabelBlock review={review} kind="aligner" />
    </Panel>
    </div>
    <div className="dental-footer">
    {review.backAsk ? <BackAskBlock review={review} /> : <section className="dental-block dental-finish">
      {review.finishedCount > 0 && <p className="help">{t(kindText('Aligners finished so far: {n}', 'aligner'), { n: review.finishedCount })}</p>}
      {restore ? <RestoreStepButton restore={restore} unique="restore-step-2" /> : null}
      <div className="edit-row">
        <CommandButton command={resolve('dental.addAnother', ui)} run={run} />
      </div>
      {/* The way back and the way on, as one block: OK is this step's way on. */}
      <div className="edit-row step-nav">
        <CommandButton command={resolve('dental.back', ui)} run={run} className="back-key back-key--arrow" labelHidden><Icon name="back" /></CommandButton>
        <CommandButton command={resolve('dental.finish', ui)} run={run} />
      </div>
    </section>}
    </div>
  </aside>;
}
