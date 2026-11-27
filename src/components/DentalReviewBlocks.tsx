import { resolve, type CommandId, type UiState } from '@mixo-geocore/editing/commands';
import type { EditGesture } from '@mixo-geocore/editing/gesture';
import { FIX_TOOL_EVENTS, type SessionEvent } from '@mixo-geocore/editing/session';
import type { DentalStructure } from '@mixo-geocore/host/dental/dentalPolicy';
import type { SupportProblem } from '@mixo-geocore/host/core/analysis/supportCheck';
import { settingLimits, type LiveSupportSettings, type SettingKey } from '@mixo-geocore/host/core/supports/settings';
import { DENTAL_LABEL_MAX, DEFAULT_DENTAL_LABEL, filterDentalLabel } from '@mixo-geocore/host/dental/label';
import type { DentalKind } from '@mixo-geocore/host/dental/dentalKind';
import { t } from '../i18n';
import { kindText } from '../denture/kindText';
import type { RuleReason } from '../denture/check/ruleSpots';
import { CommandButton } from './CommandButton';
import { EditTools } from './EditBar';
import { Field } from './Field';
import { hint } from './hint';
import { Panel } from './Panel';
import { RecipeRow } from '../recipes/RecipeRow';
import type { ComponentProps } from 'react';
import { ProblemList } from './ProblemList';
import { RangeField } from './RangeField';

/*
 * The blocks of the supports step's side panel, shared by the aligner's Step 3 (`DentalSupports.tsx`, every block open)
 * and the denture's Step 2 (`denture/steps/supports/DentureReviewPanel.tsx`, the blocks behind Details and Adjust).
 * Each block is one section with its own heading; the panel that composes them decides the order and what is folded.
 */

/** Rim coverage as the support build reports it, or `unavailable` when it could not be measured. */
export type RimGap = { outerMm: number; openingMm: number } | 'unavailable';

export type ReviewProblem = SupportProblem & { unitId: string; inZone: boolean; rule?: RuleReason };

/** What the supports step needs from the host: the active unit's settings, results and the actions on them. */
export interface DentalReview {
  settings: Readonly<LiveSupportSettings>;
  onSetting: <K extends SettingKey>(key: K, value: LiveSupportSettings[K], edit?: string) => void;
  structure: Readonly<DentalStructure>;
  onStructure: (structure: DentalStructure) => void;
  /**
   * THE SWITCHES ARE A READOUT, NOT A CONTROL, on a painted or hand-drawn area.
   *
   * Only a two-contour policy carries a `structure` field; a legacy one (painted from scratch, or a
   * rim drawn by hand - `dental/manualArea.ts`) has nowhere to put the answer, so the build uses
   * `defaultDentalStructure` and `onDentalStructureChange` returns without dispatching. Shown live,
   * the two checkboxes would therefore be dead controls: clicked, unchanged, no explanation.
   *
   * So they show what WILL be built, disabled, with the reason beside them - the same bargain
   * `tuningFixed` already strikes for the contact strip on a painted area. Giving the legacy policy
   * a `structure` field instead is a change to saved project data, recorded as debt in
   * `src/recipes/README.md`.
   */
  structureFixed: boolean;
  clickReach: { value: number; onChange: (value: number, edit?: string) => void };
  /** A change is on its way to a new verdict (rebuild, re-check, retune): the Problems section shows stale. */
  verdictPending: boolean;
  /**
   * A support BUILD has landed for this object at least once, so the verdict line on screen is a real
   * result worth keeping (dimmed) while its replacement is on the way - whether or not a check has run,
   * since "Supports ready. Every point is held." is already a verdict before anyone presses Check.
   * False only before the first build, where the line is "Building supports".
   */
  buildLanded: boolean;
  /** The support check has run on the build on screen (a check result exists and is not behind the build). */
  checked: boolean;
  rimGap: RimGap | undefined;
  structureFallback: readonly ('tree' | 'brace' | 'brace-pruned')[] | undefined;
  problems: readonly ReviewProblem[];
  outOfDate: boolean;
  rechecking: (problem: ReviewProblem) => boolean;
  unitName: (unitId: string) => string;
  onShow: (problem: ReviewProblem) => void;
  onFix: (problem: ReviewProblem) => void;
  onShowRim: () => void;
  /** Finished aligners already on the plate, for the Add another aligner line. */
  finishedCount: number;
  /**
   * Back would lose work: what it would throw away, until the user answers.
   *
   * `reorients` IS NOT "this unit has supports". It is "this Back reaches the ORIENT step AND there
   * is a build to lose", which for an aligner is never - its Back lands on Step 2 and the supports
   * stay. Naming the field for the consequence rather than for the unit's state is what stops the
   * dialog claiming a re-orient that is not going to happen, which is exactly what it did.
   */
  backAsk: { added: number; removed: number; customised: number; reorients: boolean } | undefined;
  /**
   * The support recipe row under the settings (`src/recipes/`), or absent where it has no meaning -
   * a denture, which builds through its own flow and is not in the deck's queue.
   */
  recipes?: ComponentProps<typeof RecipeRow>;
  onBackConfirm: () => void;
  onBackCancel: () => void;
}

/** The rim and structure findings of the build, as notes listed with the check's findings (the aligner sentence is the key). */
export function reviewNotes(review: Pick<DentalReview, 'rimGap' | 'structureFallback'>, kind: DentalKind): { key: string; text: string }[] {
  const fallback = review.structureFallback ?? [];
  const rimNote = review.rimGap === 'unavailable'
    ? t('Rim coverage could not be verified. Review the rim and supports before finishing.')
    : review.rimGap ? t('The supports leave gaps along the rim: up to {outer} mm on the outer edge and {opening} mm at the opening. Look along the rim and add supports where a gap is too wide.', { outer: review.rimGap.outerMm.toFixed(1), opening: review.rimGap.openingMm.toFixed(1) }) : undefined;
  return [
    ...(rimNote ? [{ key: 'rim', text: rimNote }] : []),
    ...(fallback.includes('tree') ? [{ key: 'tree', text: t('Tree branches were omitted because they crossed the model. Review the supports before finishing.') }] : []),
    ...(fallback.includes('brace') ? [{ key: 'brace', text: t(kindText('Cross-braces were omitted because they crossed the model. Review the supports before finishing.', kind)) }] : []),
    ...(fallback.includes('brace-pruned') ? [{ key: 'brace-pruned', text: t(kindText('Some cross-braces were left out where they crossed the model. Review the supports before finishing.', kind)) }] : []),
  ];
}

/** One finding of the rim or the structure, listed with the check's findings: Show frames the rim, Fix opens Add supports. */
function NoteProblem({ text, onShow, onFix }: { text: string; onShow: () => void; onFix: () => void }) {
  return <li className="dental-problem-row">
    <span className="problem-kind overhang" aria-hidden="true" />
    <span className="problem-text">{text}</span>
    <button type="button" onClick={onShow} {...hint('Frame the camera on this spot')}>{t('Show me')}</button>
    <button type="button" onClick={onFix} {...hint('Add a support by hand where one is missing')}>{t('Fix')}</button>
  </li>;
}

/**
 * The key support settings (Tip size, Pillar size, Lift height, Raft, Tree branches for an aligner, Cross-braces). A denture
 * names them in its plain words (`kindText`: Support thickness, Lift from plate, Extra bracing). `onAdjust` hears a slider held.
 */
export function SupportSettingsBlock({ review, kind, onAdjust }: { review: DentalReview; kind: DentalKind; onAdjust: (adjusting: boolean) => void }) {
  const { settings, onSetting } = review;
  const tipKey: 'pointDiameter' | 'touchDiameter' = settings.contactShape === 'SPHERE' ? 'touchDiameter' : 'pointDiameter';
  return <Panel title={t('Support settings')} ui={`${kind}-support-settings`}>
    <RangeField layout="stack" label="Tip size" ui={`${kind}-tip-size`} unit="{n} mm" hint={kindText('Diameter of each support tip where it touches the aligner', kind)}
      min={0.1} max={1} step={0.05} value={Number(settings[tipKey].toFixed(2))}
      onChange={(value) => onSetting(tipKey, value, `dental-${tipKey}`)} onAdjust={onAdjust} />
    <RangeField layout="stack" label={kindText('Pillar size', kind)} ui={`${kind}-pillar-size`} unit="{n} mm" hint="Diameter of each support pillar"
      min={0.8} max={2.5} step={0.1} value={settings.pillarDiameter}
      onChange={(v) => onSetting('pillarDiameter', v, 'dental-pillarDiameter')} onAdjust={onAdjust} />
    <RangeField layout="stack" label={kindText('Lift height', kind)} ui={`${kind}-lift-height`} unit="{n} mm" hint={kindText('How high the aligner stands above the plate. Supports are placed again', kind)}
      min={settingLimits.liftHeight.min} max={15} step={0.5} value={settings.liftHeight}
      onChange={(value) => onSetting('liftHeight', value, 'dental-lift')} onAdjust={onAdjust} />
    <Field label={t('Raft')} ui={`${kind}-raft`} hint={t('Build a raft under the supports. The ID label needs it')}>
      <input type="checkbox" checked={settings.raftEnabled} onChange={(event) => onSetting('raftEnabled', event.target.checked)} />
    </Field>
    {kind === 'denture' ? null : <Field label={t('Tree branches')} ui={`${kind}-tree-branches`}>
      <input type="checkbox" checked={review.structure.treeEnabled} disabled={review.structureFixed} onChange={(event) => review.onStructure({ ...review.structure, treeEnabled: event.target.checked })} />
    </Field>}
    <Field label={t(kindText('Cross-braces', kind))} ui={`${kind}-cross-braces`}>
      <input type="checkbox" checked={review.structure.bracesEnabled} disabled={review.structureFixed} onChange={(event) => review.onStructure({ ...review.structure, bracesEnabled: event.target.checked })} />
    </Field>
    {review.structureFixed && <p className="edit-note" role="note" data-ui={`${kind}-structure-fixed`}>{t('These switches shape supports grown from a detected edge. This area was made by hand, so they are built as shown and cannot be changed here.')}</p>}
    {/*
      THE RECIPE ROW SITS UNDER THE SETTINGS IT SAVES, which is the whole argument for it being here
      rather than on a screen of its own: "remember these" is a sentence an operator says while
      looking at the numbers (`src/recipes/README.md`).

      ONLY FOR AN ALIGNER for now: auto-gen is the aligner's queue, and a denture's Step 2 builds
      through its own flow with its own policy. Offering a control that nothing downstream reads
      would be a dead control, which this app's own standard forbids.
    */}
    {kind === 'denture' || !review.recipes ? null : <RecipeRow {...review.recipes} />}
  </Panel>;
}

/** The Support Edit Mode tools (Add supports, Select supports and their options) inside the step. */
export function EditSupportsBlock({ gesture, ui, review, send, run, kind }: {
  /** Undefined until the operator picks a tool: a step opens with none in hand. */
  gesture: EditGesture | undefined; ui: UiState; review: DentalReview; send: (event: SessionEvent) => void; run: (id: CommandId) => void; kind: DentalKind;
}) {
  return <Panel title={t('Edit supports')} ui={`${kind}-edit-supports`}>
    <div className="dental-tools">
      <EditTools gesture={gesture} ui={ui} clickReach={review.clickReach} send={send} run={run} engaged
        onPickTool={(tool) => send({ type: 'setDentalTool', tool })} />
    </div>
  </Panel>;
}

/**
 * The Check key, for the verdict's action row (ReviewSummary `action`). It used to sit inside Details, behind a fold,
 * while the line above already said "Every point is held" (Fable + Codex review, 2026-11-27): the one action that
 * makes the line true now sits beside it. ONE key per step, so its data-ui stays unique.
 */
export function CheckKey({ ui, run, kind }: { ui: UiState; run: (id: CommandId) => void; kind: DentalKind }) {
  return <CommandButton command={resolve('check.run', ui)} run={run} uiName={`${kind}-check-run`} />;
}

/** The evidence behind Details: the build's notes, the findings with Show me and Fix. `stale` greys it while a verdict is on its way. */
export function ProblemsBlock({ review, send, kind, stale }: {
  review: DentalReview; send: (event: SessionEvent) => void; kind: DentalKind; stale: boolean;
}) {
  const notes = reviewNotes(review, kind);
  const fixHere = () => FIX_TOOL_EVENTS.forEach(send);
  return <Panel title={t('Problems')} ui={`${kind}-problems`} busy={stale}>
    {notes.length > 0 && <ul className="problems">
      {notes.map((note) => <NoteProblem key={note.key} text={note.text} onShow={review.onShowRim} onFix={fixHere} />)}
    </ul>}
    <ProblemList problems={review.problems} outOfDate={review.outOfDate} rechecking={review.rechecking} unitName={review.unitName} kindOf={() => kind} onShow={review.onShow} onFix={review.onFix} />
    {notes.length === 0 && review.problems.length === 0 && <p className="help">{t('No problems listed. Press Check supports to look for islands and overhangs.')}</p>}
  </Panel>;
}

/** The ID label embossed on the raft (letters, digits and "-", up to 8), with the note when the raft is off. */
export function IdLabelBlock({ review, kind }: { review: DentalReview; kind: DentalKind }) {
  const { settings, onSetting } = review;
  // ONE COMPACT ROW ABOVE ADJUST (Fable + Codex review, 2026-11-27): the label is typed on every file, and it was the
  // last thing inside a fold, so a file could be exported without anyone seeing it. Same input, same names.
  return <section className="dental-block id-label-row" data-ui={`${kind}-id-label`}>
    <Field label={t('ID label')} ui={`${kind}-id-label-text`} layout="row"
      hint={t(kindText('Letters, digits and "-" only, up to 8. Embossed on the raft so printed aligners can be told apart', kind))}>
      <input className="dental-label" type="text" inputMode="text" autoComplete="off" spellCheck={false} value={settings.labelText}
        placeholder={DEFAULT_DENTAL_LABEL} aria-label={t('ID label')} data-max={DENTAL_LABEL_MAX}
        onChange={(event) => onSetting('labelText', filterDentalLabel(event.target.value), 'dental-label')} />
    </Field>
    {!settings.raftEnabled && <p className="help" role="note">{t('The ID label is embossed on the raft. Turn the raft on to print it.')}</p>}
  </section>;
}

/**
 * Back would lose work: the question, with Stay and Discard and go back.
 *
 * TWO SENTENCES, NOT ONE WITH A ZERO IN IT. With a build standing, the supports are what Back costs
 * and the counts would read "0 added, 0 removed, 0 with own settings" - a dialog that lists nothing
 * while deleting the operator's whole build. The hand-edit counts are still said when the hand edits
 * are the only thing at stake, which is the case this dialog was written for.
 */
export function BackAskBlock({ review }: { review: DentalReview }) {
  if (!review.backAsk) return null;
  const { reorients, ...counts } = review.backAsk;
  return <section className="dental-block dental-confirm" role="alertdialog" aria-label={t('Go back?')}>
    <p className="edit-note" role="alert">{reorients
      ? t('Going back re-orients this model, which removes its supports and any manual edits. Undo brings them back. Continue?')
      : t('Going back discards your manual support edits ({added} added, {removed} removed, {customised} with own settings). Continue?', counts)}</p>
    <div className="edit-row">
      <button type="button" onClick={review.onBackCancel}>{t('Stay')}</button>
      <button type="button" className="danger" onClick={review.onBackConfirm}>{t('Discard and go back')}</button>
    </div>
  </section>;
}
