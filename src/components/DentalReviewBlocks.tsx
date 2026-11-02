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
import { hint } from './hint';
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
  clickReach: { value: number; onChange: (value: number, edit?: string) => void };
  /** A change is on its way to a new verdict (rebuild, re-check, retune): the Problems section shows stale. */
  verdictPending: boolean;
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
  /** Back would discard hand work: what it would throw away, until the user answers. */
  backAsk: { added: number; removed: number; customised: number } | undefined;
  onBackConfirm: () => void;
  onBackCancel: () => void;
}

/** The rim and structure findings of the build, as notes listed with the check's findings (the aligner sentence is the key). */
export function reviewNotes(review: Pick<DentalReview, 'rimGap' | 'structureFallback'>, kind: DentalKind): { key: string; text: string }[] {
  const fallback = review.structureFallback ?? [];
  const rimNote = review.rimGap === 'unavailable'
    ? t('Rim coverage could not be verified. Review the rim and supports before finishing.')
    : review.rimGap ? t('Automatic dental rim gaps: outer {outer} mm, opening {opening} mm. Review the rim; omitted contacts were not forced.', { outer: review.rimGap.outerMm.toFixed(1), opening: review.rimGap.openingMm.toFixed(1) }) : undefined;
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
  return <section className="dental-block" data-ui={`${kind}-support-settings`} aria-label={t('Support settings')}>
    <h3>{t('Support settings')}</h3>
    <RangeField layout="stack" label="Tip size" unit="{n} mm" hint={kindText('Diameter of each support tip where it touches the aligner', kind)}
      min={0.1} max={1} step={0.05} value={Number(settings[tipKey].toFixed(2))}
      onChange={(value) => onSetting(tipKey, value, `dental-${tipKey}`)} onAdjust={onAdjust} />
    <RangeField layout="stack" label={kindText('Pillar size', kind)} unit="{n} mm" hint="Diameter of each support pillar"
      min={0.8} max={2.5} step={0.1} value={settings.pillarDiameter}
      onChange={(v) => onSetting('pillarDiameter', v, 'dental-pillarDiameter')} onAdjust={onAdjust} />
    <RangeField layout="stack" label={kindText('Lift height', kind)} unit="{n} mm" hint={kindText('How high the aligner stands above the plate. Supports are placed again', kind)}
      min={settingLimits.liftHeight.min} max={15} step={0.5} value={settings.liftHeight}
      onChange={(value) => onSetting('liftHeight', value, 'dental-lift')} onAdjust={onAdjust} />
    <label className="check" {...hint('Build a raft under the supports. The ID label needs it')}>
      <input type="checkbox" checked={settings.raftEnabled} onChange={(event) => onSetting('raftEnabled', event.target.checked)} />{t('Raft')}
    </label>
    {kind === 'denture' ? null : <label className="check"><input type="checkbox" checked={review.structure.treeEnabled}
      onChange={(event) => review.onStructure({ ...review.structure, treeEnabled: event.target.checked })} />{t('Tree branches')}</label>}
    <label className="check"><input type="checkbox" checked={review.structure.bracesEnabled}
      onChange={(event) => review.onStructure({ ...review.structure, bracesEnabled: event.target.checked })} />{t(kindText('Cross-braces', kind))}</label>
  </section>;
}

/** The Support Edit Mode tools (Add supports, Select supports and their options) inside the step. */
export function EditSupportsBlock({ gesture, ui, review, send, run, kind }: {
  gesture: EditGesture; ui: UiState; review: DentalReview; send: (event: SessionEvent) => void; run: (id: CommandId) => void; kind: DentalKind;
}) {
  return <section className="dental-block" data-ui={`${kind}-edit-supports`} aria-label={t('Edit supports')}>
    <h3>{t('Edit supports')}</h3>
    <div className="dental-tools">
      <EditTools gesture={gesture} ui={ui} clickReach={review.clickReach} send={send} run={run} engaged />
    </div>
  </section>;
}

/** The support check inside the step: Check, the build's notes, the findings with Show me and Fix. `stale` greys it while a verdict is on its way. */
export function ProblemsBlock({ review, ui, send, run, kind, stale }: {
  review: DentalReview; ui: UiState; send: (event: SessionEvent) => void; run: (id: CommandId) => void; kind: DentalKind; stale: boolean;
}) {
  const notes = reviewNotes(review, kind);
  const fixHere = () => FIX_TOOL_EVENTS.forEach(send);
  return <section className={stale ? 'dental-block is-stale' : 'dental-block'} data-ui={`${kind}-problems`} aria-label={t('Problems')} aria-busy={stale}>
    <h3>{t('Problems')}</h3>
    <CommandButton command={resolve('check.run', ui)} run={run} uiName={`${kind}-check-run`} />
    {notes.length > 0 && <ul className="problems">
      {notes.map((note) => <NoteProblem key={note.key} text={note.text} onShow={review.onShowRim} onFix={fixHere} />)}
    </ul>}
    <ProblemList problems={review.problems} outOfDate={review.outOfDate} rechecking={review.rechecking} unitName={review.unitName} kindOf={() => kind} onShow={review.onShow} onFix={review.onFix} />
    {notes.length === 0 && review.problems.length === 0 && <p className="help">{t('No problems listed. Press Check supports to look for islands and overhangs.')}</p>}
  </section>;
}

/** The ID label embossed on the raft (letters, digits and "-", up to 8), with the note when the raft is off. */
export function IdLabelBlock({ review, kind }: { review: DentalReview; kind: DentalKind }) {
  const { settings, onSetting } = review;
  return <section className="dental-block" data-ui={`${kind}-id-label`} aria-label={t('ID label')}>
    <label className="field-row" {...hint(kindText('Letters, digits and "-" only, up to 8. Embossed on the raft so printed aligners can be told apart', kind))}>
      <span>{t('Text')}</span>
      <input className="text dental-label" type="text" inputMode="text" autoComplete="off" spellCheck={false} value={settings.labelText}
        placeholder={DEFAULT_DENTAL_LABEL} aria-label={t('ID label')} data-max={DENTAL_LABEL_MAX}
        onChange={(event) => onSetting('labelText', filterDentalLabel(event.target.value), 'dental-label')} />
    </label>
    {!settings.raftEnabled && <p className="help" role="note">{t('The ID label is embossed on the raft. Turn the raft on to print it.')}</p>}
  </section>;
}

/** Back would discard hand work: the question, with Stay and Discard and go back. */
export function BackAskBlock({ review }: { review: DentalReview }) {
  if (!review.backAsk) return null;
  return <section className="dental-block dental-confirm" role="alertdialog" aria-label={t('Go back?')}>
    <p className="edit-note" role="alert">{t('Going back discards your manual support edits ({added} added, {removed} removed, {customised} with own settings). Continue?', review.backAsk)}</p>
    <div className="edit-row">
      <button type="button" onClick={review.onBackCancel}>{t('Stay')}</button>
      <button type="button" className="danger" onClick={review.onBackConfirm}>{t('Discard and go back')}</button>
    </div>
  </section>;
}
