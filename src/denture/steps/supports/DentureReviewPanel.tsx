import { useState } from 'react';
import { resolve, type CommandId, type UiState } from '@mixo-geocore/editing/commands';
import type { EditGesture } from '@mixo-geocore/editing/gesture';
import type { SessionEvent } from '@mixo-geocore/editing/session';
import { plural, t } from '../../../i18n';
import { CommandButton } from '../../../components/CommandButton';
import { Panel } from '../../../components/Panel';
import { RestoreStepButton, type StepRestore } from '../../../components/RestoreStepButton';
import { BackAskBlock, EditSupportsBlock, IdLabelBlock, ProblemsBlock, SupportSettingsBlock, reviewNotes, type DentalReview } from '../../../components/DentalReviewBlocks';
import type { DentureMesh } from '../../engine/dentureCore';
import { PartsList } from '../../parts/PartsList';
import { DentureSettingsSection } from '../../settings/DentureSettingsSection';
import { DEFAULT_DENTURE_OPTIONS, type DentureOptions } from '../../settings/dentureOptions';
import { kindText } from '../../kindText';
import { adjustRemembered, rememberAdjust } from '../../../dental/adjustMemory';
import { ReviewSummary } from '../../../components/ReviewSummary';
import { ResolveSection, unresolvedCounts } from './ResolveSection';
import { reviewLine } from './reviewLineText';

/** The denture's own part of Step 2: its current build (absent while it builds), its settings and their change. */
export interface DentureReviewInput {
  mesh: DentureMesh | undefined;
  options: Readonly<DentureOptions> | undefined;
  onOptions: (options: DentureOptions) => void;
}

/**
 * Denture Step 2 (P7c), laid out like the aligner's tilt step: one plain status line with its one action (Fix supports
 * every point a click could; Details opens the counts, the parts and the check's findings), one folded Adjust section
 * (the support settings, the denture settings, the edit tools and the ID label; closed by default, remembered for the
 * session), then the quiet Restore step and Add another denture, and Back | OK. Behaviour is the shared one: the
 * blocks are `components/DentalReviewBlocks.tsx`, the commands the registry's.
 */
export function DentureReviewPanel({ gesture, ui, review, ready, send, run, restore, denture }: {
  gesture: EditGesture;
  ui: UiState;
  review: DentalReview;
  ready: boolean;
  send: (event: SessionEvent) => void;
  run: (id: CommandId) => void;
  restore?: StepRestore | undefined;
  denture: DentureReviewInput;
}) {
  const [adjusting, setAdjusting] = useState(false);
  const [adjustOpen, setAdjustOpen] = useState(() => adjustRemembered('denture'));
  const [detailsOpen, setDetailsOpen] = useState(false);
  const stale = adjusting || review.verdictPending;
  const { mesh } = denture;
  const { resolvable, refused } = unresolvedCounts(mesh);
  // Grey "accepted by rule" spots are the denture rules' own choice: never counted as a problem.
  const findings = review.problems.filter((problem) => !problem.rule).length;
  const built = ready && mesh !== undefined;
  const line = reviewLine({ built, failed: Boolean(ui.dentalBuildFailed), resolvable, problems: refused + findings + reviewNotes(review, 'denture').length });
  return <aside className="dental-side denture-review" data-ui="denture-supports-panel" aria-label={t('Step 2 · Supports')}>
    <div className="dental-scroll">
      <ReviewSummary kind="denture" tone={line.kind} stale={stale} line={line.other ? plural(line.n, line.key, line.other) : t(line.key)}
        {...(built ? { open: detailsOpen, onToggle: setDetailsOpen } : {})}
        action={line.kind === 'fix' ? <CommandButton command={resolve('denture.resolveAll', ui)} run={run} uiName="denture-resolve-all" /> : undefined}>
        <ResolveSection mesh={mesh} />
        <PartsList parts={mesh?.dentureParts} />
        <ProblemsBlock review={review} ui={ui} send={send} run={run} kind="denture" stale={stale} />
      </ReviewSummary>
      <Panel ui="denture-adjust" title={t('Adjust')} collapsible open={adjustOpen} onToggle={(open) => { rememberAdjust('denture', open); setAdjustOpen(open); }}>
        <SupportSettingsBlock review={review} kind="denture" onAdjust={setAdjusting} />
        <DentureSettingsSection options={denture.options ?? DEFAULT_DENTURE_OPTIONS} onChange={denture.onOptions} />
        <EditSupportsBlock gesture={gesture} ui={ui} review={review} send={send} run={run} kind="denture" />
        <IdLabelBlock review={review} kind="denture" />
      </Panel>
    </div>
    <div className="dental-footer denture-review-footer" data-ui="denture-review-footer">
      {review.backAsk ? <BackAskBlock review={review} /> : <>
        {review.finishedCount > 0 ? <p className="help" data-ui="denture-finished-count">{t(kindText('Aligners finished so far: {n}', 'denture'), { n: review.finishedCount })}</p> : null}
        <div className="orient-row denture-review-more">
          {restore ? <RestoreStepButton restore={restore} unique="restore-step-2" /> : null}
          <CommandButton command={resolve('dental.addAnother', ui)} run={run} className="orient-free-btn" uiName="denture-add-another" />
        </div>
        <div className="orient-row orient-nav" data-ui="denture-review-nav">
          <CommandButton command={resolve('dental.back', ui)} run={run} uiName="denture-review-back" />
          <CommandButton command={resolve('dental.finish', ui)} run={run} uiName="denture-review-ok" />
        </div>
      </>}
    </div>
  </aside>;
}
