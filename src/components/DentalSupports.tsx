import { useState } from 'react';
import { resolve, type CommandId, type UiState } from '@mixo-geocore/editing/commands';
import type { EditGesture } from '@mixo-geocore/editing/gesture';
import type { SessionEvent } from '@mixo-geocore/editing/session';
import { t } from '../i18n';
import { kindText } from '../denture/kindText';
import { CommandButton } from './CommandButton';
import { BackAskBlock, EditSupportsBlock, IdLabelBlock, ProblemsBlock, SupportSettingsBlock, type DentalReview } from './DentalReviewBlocks';
import { RestoreStepButton, type StepRestore } from './RestoreStepButton';

export type { DentalReview, RimGap } from './DentalReviewBlocks';

/**
 * The aligner's Step 3: the supports as built, their key settings, the Support Edit Mode tools, the problem list, the
 * label, and the two ways to finish, every block open. Settings are the active aligner's own. The blocks are shared
 * (`DentalReviewBlocks.tsx`); the denture's Step 2 folds them behind Details and Adjust (`denture/steps/supports/DentureReviewPanel.tsx`).
 */
export function DentalSupportsStep({ gesture, ui, review, ready, send, run, restore }: {
  gesture: EditGesture;
  ui: UiState;
  review: DentalReview;
  ready: boolean;
  send: (event: SessionEvent) => void;
  run: (id: CommandId) => void;
  restore?: StepRestore | undefined;
}) {
  const [adjusting, setAdjusting] = useState(false);
  const stale = adjusting || review.verdictPending;
  return <aside className="dental-side" data-ui="dental-supports-panel" aria-label={t('Step 3 · Supports')}>
    <div className="dental-scroll">
    {!ready && <p className="edit-note" role="status">{t('Building supports…')}</p>}
    <SupportSettingsBlock review={review} kind="aligner" onAdjust={setAdjusting} />
    <EditSupportsBlock gesture={gesture} ui={ui} review={review} send={send} run={run} kind="aligner" />
    <ProblemsBlock review={review} ui={ui} send={send} run={run} kind="aligner" stale={stale} />
    </div>
    <div className="dental-footer">
    <IdLabelBlock review={review} kind="aligner" />
    {review.backAsk ? <BackAskBlock review={review} /> : <section className="dental-block dental-finish">
      {review.finishedCount > 0 && <p className="help">{t(kindText('Aligners finished so far: {n}', 'aligner'), { n: review.finishedCount })}</p>}
      {restore ? <RestoreStepButton restore={restore} unique="restore-step-2" /> : null}
      <div className="edit-row">
        <CommandButton command={resolve('dental.back', ui)} run={run} />
      </div>
      <div className="edit-row">
        <CommandButton command={resolve('dental.addAnother', ui)} run={run} />
        <CommandButton command={resolve('dental.finish', ui)} run={run} />
      </div>
    </section>}
    </div>
  </aside>;
}
