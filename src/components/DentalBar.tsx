import type { ReactNode } from 'react';
import { resolve, type CommandId, type UiState } from '@mixo-geocore/editing/commands';
import type { Gesture } from '@mixo-geocore/editing/gesture';
import type { SessionEvent } from '@mixo-geocore/editing/session';
import { stepOneText } from '../denture/steps/orient/stepOneText';
import { jobKindOf } from '../denture/jobKind';
import { t, type Lang } from '../i18n';
import type { DentalTuning } from '@mixo-geocore/host/dental/dentalTuning';
import type { ProfileDefaults } from '@mixo-geocore/host/dental/alignerProfiles';
import { CommandButton } from './CommandButton';
import { DentalAlignerPrompt, DentalTypeStep, noticeText } from './DentalSteps';
import { OrientationBar, type DentalFreeControls } from './OrientationBar';
import { DentalSupportsStep, type DentalReview } from './DentalSupports';
import { DentalRimStep } from '../dental/rim/DentalRimStep';
import { rimToolText } from '../dental/rim/rimStepText';
import { RangeField } from './RangeField';
import { ClickReachField, SelectStyleSwitch } from './EditBar';
import { Segmented } from './Segmented';
import { Panel } from './Panel';
import { Field } from './Field';
import { Icon } from '../ui/Icon';
import type { DentalTiltState } from './useDentalFlow';
import type { AreaRisk } from '../dental/areaRisk';
import { hint } from './hint';
import { RestoreStepButton, type StepRestore } from './RestoreStepButton';
import { DentureReviewPanel, type DentureReviewInput } from '../denture/steps/supports/DentureReviewPanel';
import { kindText } from '../denture/kindText';

/** Step 2's tools, in the order of their keys. */
const AREA_TOOLS = ['paint', 'erase', 'add', 'select'] as const;

/** Dental Auto Generate chrome: review the detector first, then mark only permitted support area. */
export function DentalBar({ gesture, unitName, ui, tipCount = 0, previewStatus = 'loading', reviewReady = true,
  lang = 'en', selectedName, onFiles, onUseSelected, tuning, tuningLimits, tuningBusy = false, tuningError = false, onTuningChange,
  review, clickReach, tilt, onTilt, free, restore, orientExtra, dentureReview, areaExtra, risks, onShowRisk, send, run }: {
  gesture: Extract<Gesture, { kind: 'dental-type' | 'dental-aligner' | 'dental-rim' | 'dental-area' | 'dental-review' }>;
  lang?: Lang;
  /** Step 1: the object selected on the plate, offered as the aligner without a drop. */
  selectedName?: string;
  onFiles?: (files: File[]) => void;
  onUseSelected?: () => void;
  unitName: string | undefined;
  ui: UiState;
  tipCount?: number;
  previewStatus?: 'idle' | 'loading' | 'ready' | 'error';
  reviewReady?: boolean;
  /** The area's strip controls and their limits (the aligner profile); absent: no controls. */
  tuning?: DentalTuning | undefined;
  tuningLimits?: Readonly<ProfileDefaults> | undefined;
  tuningBusy?: boolean;
  tuningError?: boolean;
  onTuningChange?: (tuning: DentalTuning) => void;
  /** Step 3's settings, results and actions. */
  review?: DentalReview;
  /** The Click reach of the active object, for Add and Select in Step 2. */
  clickReach?: { value: number; onChange: (value: number, edit?: string) => void };
  /** Step 1's print-angle search (of the aligner in the step) and its slider. */
  tilt?: DentalTiltState | undefined;
  onTilt?: (index: number) => void;
  /** Step 1: Free transform (PD.11 S6); the big print-angle number is hidden while it is on. */
  free?: DentalFreeControls;
  /** The step's Restore action (back to the way the step began); absent where a step has none. */
  restore?: StepRestore;
  /** Step 1: the job's own lines under the dial (the denture's live tip legend). */
  orientExtra?: ReactNode;
  /** The denture's supports step: its build, settings and their change (its own panel, `DentureReviewPanel`). */
  dentureReview?: DentureReviewInput | undefined;
  /** Step 2: the job's own blocks above Back | Next (the aligner's parts list of a multi-part file). */
  areaExtra?: ReactNode;
  /** Step 2: overhang low points outside the permitted area (the blue spots), listed with Show me. */
  risks?: readonly AreaRisk[];
  onShowRisk?: (risk: AreaRisk) => void;
  send: (event: SessionEvent) => void;
  run: (id: CommandId) => void;
}) {
  if (gesture.kind === 'dental-type') return <>
    <div className="edit-frame" aria-hidden="true" />
    <div className="edit-badge" role="status">
      {t('Step 0 · Aligner type')}
      <b>{t('Choose the aligner type to begin.')}</b>
    </div>
    <DentalTypeStep profile={gesture.profile} lang={lang} send={send} />
  </>;
  if (gesture.kind === 'dental-aligner') {
    const words = stepOneText(gesture.profile, lang);
    return <>
    <div className="edit-frame" aria-hidden="true" />
    <div className="edit-badge" role="status">
      {t(words.title)}<span>{gesture.phase === 'ready' ? unitName : words.profileName}</span>
      <b>{gesture.phase === 'ready' ? t(words.ready) : t(words.waiting)}</b>
    </div>
    {gesture.phase === 'ready'
      ? <OrientationBar notices={gesture.notices} profile={gesture.profile} lang={lang} ui={ui} send={send} run={run}
        tilt={tilt} onTilt={onTilt} free={free} restore={restore}>{orientExtra}</OrientationBar>
      : <>
        <div className="edit-bar"><div className="edit-row">
          <CommandButton command={resolve('dental.back', ui)} run={run} className="back-key back-key--arrow" labelHidden><Icon name="back" /></CommandButton>
        </div></div>
        <DentalAlignerPrompt phase={gesture.phase} notices={gesture.notices} selectedName={selectedName} kind={jobKindOf(gesture.profile)}
          onFiles={(files) => onFiles?.(files)} onUseSelected={() => onUseSelected?.()} />
      </>}
  </>;
  }
  /*
   * Rim define mode. Its badge names the mode and what the tool in hand does, as every tool mode's does,
   * and it says WHY it opened: the operator did not choose this detour, orientation handed them it.
   */
  if (gesture.kind === 'dental-rim') return <>
    <div className="edit-frame" aria-hidden="true" />
    <div className="edit-badge" role="status">
      {t('Step 1 · Define the rim')}<span>{unitName}</span>
      <b>{t(rimToolText(gesture.tool))}</b>
    </div>
    <DentalRimStep ui={ui} run={run} />
  </>;
  if (gesture.kind === 'dental-review') {
    const kind = ui.dentalKind ?? 'aligner';
    return <>
    <div className="edit-frame" aria-hidden="true" />
    <div className="edit-badge" role="status">
      {t(kind === 'denture' ? 'Step 2 · Supports' : 'Step 3 · Supports')}<span>{unitName}</span>
      <b>{t(kindText('Review the supports, adjust the settings, then press OK.', kind))}</b>
    </div>
    {review && kind === 'denture' && dentureReview
      ? <DentureReviewPanel gesture={gesture.edit} ui={ui} review={review} ready={reviewReady} send={send} run={run} restore={restore} denture={dentureReview} />
      : review ? <DentalSupportsStep gesture={gesture.edit} ui={ui} review={review} ready={reviewReady} send={send} run={run} restore={restore} /> : null}
  </>;
  }
  return <>
    <div className="edit-frame" aria-hidden="true" />
    <div className="edit-badge" role="status">
      {t('Step 2 · Support area')}<span>{unitName}</span>
      <b>{gesture.notices.some((notice) => notice.kind === 'no-area') ? t('No support area was detected. Mark it, then press Next.') : t('Support area is marked. Press Next, or paint to adjust.')}</b>
    </div>
    <div className="edit-bar dental-brush">
      {/*
        STEP 2 IS BUILT THE WAY STEP 1 IS: titled widgets down the dock, not a flat run of rows. Each widget
        holds one idea - the tool in hand, then the shape of the area - so the reader can find the one thing
        they came to change. `Panel` falls back to a single column on its own when the dock is narrow, which
        is what makes the dock responsive without a width being chosen for it anywhere.
      */}
      <Panel title={t('Tool')} ui="dental-tool">
      <div className="edit-row">
        {/* Undefined until a tool is armed: `ui.tool` only names which one WOULD be picked. */}
        <Segmented label={t('Dental area tools')} value={ui.dentalToolArmed ? ui.tool : undefined} onChange={(tool) => run(`dental.tool.${tool}` as CommandId)}
          options={AREA_TOOLS.map((tool) => {
            const command = resolve(`dental.tool.${tool}`, ui);
            // Every tool key carries its picture. The icon file is named after the tool, so adding a tool
            // adds `tool-<name>.svg` to src/ui/assets/icons and needs no change here.
            return { value: tool, label: t(command.label), icon: <Icon name={`tool-${tool}`} className="tool-icon" />, hint: command.hint, ...(command.shortcut ? { shortcut: command.shortcut } : {}) };
          })} />
        {gesture.brush && <RangeField layout="row" label="Brush size" ui="dental-brush-size" unit="{n} mm" hint="Radius of the surface brush" min={0.5} max={10} step={0.5} value={gesture.brush.radius}
          onChange={(radius) => send({ type: 'setDentalRadius', radius })} />}
        {gesture.edit && gesture.edit.kind !== 'add' && <SelectStyleSwitch gesture={gesture.edit} ui={ui} send={send} run={run} />}
        {gesture.edit && clickReach && (gesture.edit.kind === 'add' || gesture.edit.kind === 'pick') && <ClickReachField ui={ui} {...clickReach} />}
        {gesture.edit && ui.selection > 0 && <span className="edit-count">{t('{n} selected', { n: ui.selection })}</span>}
        {gesture.edit && ['edit.clearSelection', 'edit.deleteSelection'].map((id) => resolve(id as CommandId, ui)).filter((command) => command.visible).map((command) => <CommandButton key={command.id} command={command} run={run} />)}
        {/* The way out of the tool, at the row's end: the visible twin of Esc, shown only with one in hand. */}
        {resolve('dental.toolDown', ui).visible
          && <CommandButton command={resolve('dental.toolDown', ui)} run={run} uiName="dental-tool-down" />}
      </div>
      </Panel>
      {tuning && tuningLimits && <Panel title={t('Support area')} ui="dental-area-shape">
      <div className="edit-row dental-tuning" role="group" aria-label={t('Aligner contact strip')}>
        <RangeField layout="row" label="Area width" ui="dental-area-width" unit="{n} mm" hint="Width of the support area along each edge"
          min={tuningLimits.stripWidthMinMm} max={tuningLimits.stripWidthMaxMm} step={0.1} value={tuning.stripWidthMm}
          onChange={(stripWidthMm) => onTuningChange?.({ ...tuning, stripWidthMm })} />
        <RangeField layout="row" label="Area position" ui="dental-area-position" unit="{n} mm" hint="Higher moves the support area farther onto the outer surface; lower moves it toward and across the edge"
          min={tuningLimits.positionMinMm} max={tuningLimits.positionMaxMm} step={0.05} value={tuning.positionMm}
          onChange={(positionMm) => onTuningChange?.({ ...tuning, positionMm })} />
        <RangeField layout="row" label="Support density" ui="dental-support-density" unit="{n}×" hint="Higher density places proposed tips closer together"
          min={tuningLimits.densityMin} max={tuningLimits.densityMax} step={0.1} value={tuning.density}
          onChange={(density) => onTuningChange?.({ ...tuning, density })} />
      </div>
      </Panel>}
      {tuningBusy && <p className="edit-note" role="status">{t('Updating support area and tips…')}</p>}
      {tuningError && <p className="edit-note" role="alert">{t('Could not update the support strip. The previous area is still active.')}</p>}
      {gesture.notices.map((notice) => <p key={notice.kind} className="edit-note" role="alert">{noticeText(notice)}</p>)}
      {risks && risks.length > 0 && <>
        <p className="edit-note" role="note">{t('Blue spots are overhang low points outside the support area. Extend the area over them, or leave them to the aligner shape.')}</p>
        <ul className="problems dental-risks" aria-label={t('Low points outside the support area')}>
          {risks.map((risk) => <li key={risk.id}>
            <span className="problem-kind risk" aria-hidden="true" />
            <span className="problem-text">{t('Low point outside the support area')}</span>
            <button type="button" onClick={() => onShowRisk?.(risk)} {...hint('Frame the camera on this spot')}>{t('Show me')}</button>
          </li>)}
        </ul>
      </>}
      {/*
        THE ONE NUMBER THIS STEP IS ABOUT, read as a number. It used to sit in the middle of a sentence with
        two other thoughts - how to paint, and a caveat about the final build - where it could not be set in
        the app's figure face and could not be found at a glance. The sentence keeps the guidance; the count
        is a readout, the way Step 1 gives the print angle its own face.
      */}
      <Field label={t('Proposed support tips')} ui="dental-tip-count" layout="row" className="dental-tip-count">
        <span className="num">{tipCount}</span>
      </Field>
      <p className="edit-note" role="note">{t('Drag on the model to paint; drag empty space to rotate the view. The final generation may leave out tips whose supports touch an unapproved face.')}</p>
      {!gesture.notices.some((notice) => notice.kind === 'no-area') && (previewStatus !== 'ready' || tipCount === 0) ? <p className="edit-note" role="status">{t(previewStatus === 'error'
        ? 'Could not preview safe support tips. Adjust the area or retry.'
        : previewStatus === 'ready' ? 'No safe support tips were found. Automatic placement is paused.'
          : 'Finding safe support tips…')}</p> : null}
      {areaExtra}

      {/*
        PUT IT BACK, as the same round key Step 1 uses rather than a full-width word, which read as a fifth
        action competing with Back and Next. It sits in its own row and NOT inside a widget: the Support
        area widget is only drawn when there is an area to shape, and the step that most needs a way back is
        the one with no area at all.
      */}
      {restore ? <div className="edit-row restore-row"><RestoreStepButton restore={restore} unique="restore-step-area" round /></div> : null}
      <div className="edit-row step-nav">
        <CommandButton command={resolve('dental.back', ui)} run={run} className="back-key back-key--arrow" labelHidden><Icon name="back" /></CommandButton>
        <CommandButton command={resolve('dental.generate', tuningBusy ? { ...ui, dentalPreviewReady: false } : ui)} run={run} className="next-key"><Icon name="next" /></CommandButton>
      </div>
    </div>
  </>;
}
