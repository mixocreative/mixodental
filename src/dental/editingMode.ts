import { entryReason, generatingReason, heavyReason, registerCommands, registerStepHints, type Command, type UiState } from '@mixo-geocore/editing/commands';
import { editGesture, type EditGesture, type Gesture } from '@mixo-geocore/editing/gesture';
import { runKey } from '@mixo-geocore/editing/keys';
import { rimDeleteReason, rimDoneReason } from './rim/rimStepText';
import { registerEditMode, type SessionKit } from '@mixo-geocore/editing/modes';
import type { EditSession, SessionEvent } from '@mixo-geocore/editing/session';
import type { EditTool, StatusMessage } from '@mixo-geocore/editing/types';
import type { DentalProposal } from '@mixo-geocore/host/dental/dental';
import { stageAfterOrientation, stageBeforeSupports } from '../denture/state/dentureStages';
import '../denture/state/dentureCommands';
import { kindText } from '../denture/kindText';
import { onBench } from '../bench/benchScene';
import { flowEndsAtExport } from '../scenes/sceneMap';

/*
 * The dental flow as an app mode of the shared editor (mixo-geocore editing/modes.ts): its session
 * fields and events, its own tools (Step 2's Paint and Erase), gestures, keys, status lines, locks
 * and command rows. Importing this module registers it; the app entry and the test setup import it
 * before the first session is made. The generic Support Edit Mode and zones come from the package.
 */

/**
 * The dental flow's steps: 1 aligner (drop, check, orient), 2 support area, 3 supports, plus `rim` -
 * a detour out of Step 1 when detection finds no rim and the operator draws it by hand.
 *
 * THERE IS NO LONGER A TYPE STEP. The appliance kind is chosen per run on the Drop page, because
 * detection takes the profile as an ARGUMENT - there is nothing to detect against until the purpose
 * is known, so asking inside the flow was always one screen too late (design doc §10, E1).
 */
export type DentalStage = 'aligner' | 'rim' | 'area' | 'review';
/**
 * Rim define mode's two tools. Deliberately NOT called Paint or Select: those words belong to marking a
 * surface and to picking objects, and reusing either for placing boundary points would tell a reader the
 * wrong thing about what the drag does.
 */
export type DentalRimTool = 'place' | 'adjust';
/** Step 1 itself: waiting for a file, reading and orienting it, or showing the oriented aligner. */
export type DentalAligner = 'prompt' | 'loading' | 'ready';
/** A message the dental bar shows in a step; `bad-file` carries the import error line. */
export type DentalNotice =
  | { kind: 'bad-file'; message: StatusMessage }
  | { kind: 'failed' } | { kind: 'denture-failed' } | { kind: 'uncertain' } | { kind: 'holes' } | { kind: 'mismatch' } | { kind: 'no-area' }
  /** Step 2: the print-angle confirm moved the automatic pick to this tilt (degrees, shown to 0.1). */
  | { kind: 'angle-moved'; deg: number };

type Proposal = Extract<DentalProposal, { kind: 'proposal' }>;

export type DentalEvent =
  /**
   * The full-screen start (components/StartScreen): straight to Step 1 with this type; `file` is read
   * by the app once Step 1 waits for it.
   *
   * `resume` says this is ANOTHER ITEM OF THE SAME CASE rather than a new one, and it exists because
   * mode `off` does not mean "nothing finished". `finishDental` leaves the mode off and KEEPS
   * `dentalFinished`, so opening the next row from the deck came through here and cleared the list -
   * the finished rows lost their mark, "items left" went back up, and `exitCommands` no longer spared
   * them, so Exit on a reopened one removed the supports it had already exported.
   */
  | { type: 'startDental'; profile: string; file?: File; resume?: true }
  | { type: 'switchDentalProfile'; id: string }
  /** `unitId`: the aligner is read and on the plate (Step 1 is now working on it). */
  | { type: 'dentalLoading'; unitId?: string }
  | { type: 'dentalOriented'; proposal: Proposal; notices: readonly DentalNotice[] }
  | { type: 'dentalOrientFailed'; notices: readonly DentalNotice[] }
  /**
   * Orientation could not find a rim, so Step 1 hands straight over to rim define mode rather than leaving
   * a notice with no way on. The notices still travel, because the mode says in words why it opened.
   */
  | { type: 'dentalRimNeeded'; notices: readonly DentalNotice[] }
  /**
   * THE WAY BACK IN. Step 1 reopens rim define mode for an aligner whose rim is the operator to draw.
   *
   * A SEPARATE EVENT from `dentalRimNeeded`, which means "detection ran and found no rim" and is
   * accepted only while the aligner is still loading. Widening that guard would have made one event
   * mean both "the detector gave up" and "the operator asked to come back", and the notices it
   * carries belong only to the first. Both are live, and they say different things.
   */
  | { type: 'dentalRimReopen'; tool?: DentalRimTool }
  | { type: 'setDentalRimTool'; tool: DentalRimTool }
  /**
   * Picks out one anchor of the drawing, or lets go of it (`undefined`). Set by Adjust picking an anchor
   * up, so the gesture that moves a point is the same one that chooses it - there is no separate select
   * tool in a mode whose whole job is one loop.
   */
  | { type: 'setDentalRimSelected'; at: number | undefined }
  /**
   * Picks a tool in a dental step AND arms it. A step opens with no tool in hand, the way a drawing program
   * does: until the operator chooses one, a drag on the model does nothing and the view turns instead.
   */
  | { type: 'setDentalTool'; tool: EditTool }
  /**
   * Done in rim define mode: the drawn rim is the aligner's, and Step 1 takes it from there. What marks
   * the aligner as hand-drawn from then on is the unit's own manual-area policy, not any session flag:
   * `next()` asks `isManualArea(unit.dental)`, which survives Cancel, a reopen and a reload.
   */
  | { type: 'dentalRimDefined' }
  /** A denture is upright and its print angles are scanned (it has no aligner proposal). */
  | { type: 'dentureOriented'; notices?: readonly DentalNotice[] }
  | { type: 'dentalBadFile'; message: StatusMessage }
  | { type: 'dismissDentalNotice'; kind: DentalNotice['kind'] }
  | { type: 'acceptDentalOrientation'; noArea?: boolean; angleMovedDeg?: number }
  | { type: 'acceptDentalArea' }
  /** OK in Step 3: this aligner is finished and the flow ends; it stays on the plate. */
  | { type: 'finishDental'; unitId: string }
  /**
   * THE STEP EXPORTED ITS ALIGNER, so that aligner is finished even though the flow stays open.
   *
   * Without this, Export STL wrote a correct file and then Exit THREW THE WORK AWAY: `exitCommands`
   * removes the supports and the dental policy of any unit not in `dentalFinished`, and OK was the
   * only thing that ever put one there. With OK gone under FLOW_END, the one remaining way out of
   * Step 3 destroyed what had just been exported. The STL survived; the plate did not.
   *
   * It touches the SESSION ONLY - no scene command - on purpose. Finishing also arranges the plate,
   * and arranging moves the unit, which drops the build the export is reading and makes `runExport`
   * refuse it as stale. So the bookkeeping that keeps the work safe happens here, and arranging
   * stays with Add another aligner, which is where the next object makes room necessary.
   */
  | { type: 'exportedDental'; unitId: string }
  /** Add another aligner in Step 3: this one is finished, Step 1 opens again with the same type. */
  | { type: 'addAnotherDental'; unitId: string }
  | { type: 'backDental' }
  | { type: 'setDentalRadius'; radius: number };

/**
 * What a press does in the dental flow. Step 2: `brush` is the area brush while Paint or Erase is on
 * (`kind` is the stamp's `allow`); with Add or Select it is undefined and `edit` is the tool, working
 * on the suggested tips. Step 3: the Support Edit Mode tools (`edit`) work inside the step.
 */
export type DentalGesture =
  | { kind: 'dental-aligner'; phase: DentalAligner; proposal: Proposal | undefined; notices: readonly DentalNotice[]; profile: string | undefined }
  | { kind: 'dental-area'; brush: { radius: number; kind: 'allow' | 'erase' } | undefined; edit: EditGesture | undefined; notices: readonly DentalNotice[] }
  /** Rim define mode. The drawn path itself is scene state, so it reaches the panel as a prop, not through here. */
  | { kind: 'dental-rim'; tool: DentalRimTool; selected: number | undefined; notices: readonly DentalNotice[] }
  /** Step 3 always has a tool in hand: it rests on Select, which changes nothing until asked. */
  | { kind: 'dental-review'; edit: EditGesture | undefined };

declare module '@mixo-geocore/editing/types' {
  interface ExtraEditModes { dental: true }
  /** `paint` and `erase` are dental Step 2's support-area brushes (Step 2 offers all four). */
  interface ExtraEditTools { paint: true; erase: true }
  interface ExtraStepKinds { dentalArea: true }
}

declare module '@mixo-geocore/editing/session' {
  interface EditSession {
    dentalStage: DentalStage;
    /** The chosen aligner profile id; the last choice outlasts the mode (Step 0 highlights it). */
    dentalProfile: string | undefined;
    dentalAligner: DentalAligner;
    dentalNotices: readonly DentalNotice[];
    dentalProposal: Proposal | undefined;
    dentalRadius: number;
    /** Aligners finished in this visit of the flow (OK, or Add another aligner): Exit keeps them as they are. */
    dentalFinished: readonly string[];
    /** The aligner Steps 1 to 3 work on, once it is read (Exit clears only this one). */
    dentalUnitId: string | undefined;
    /** Rim define mode's current tool. */
    dentalRimTool: DentalRimTool;
    /**
     * Rim define mode: which anchor is picked out, as an index into the drawn path, or none.
     *
     * SESSION STATE, NOT SCENE STATE. The drawing itself is scene state so app history undoes an
     * anchor like anything else; a selection is not an edit and must not land on that history, or every
     * Undo would step back through anchors the operator merely looked at.
     */
    dentalRimSelected: number | undefined;
  }
  interface ExtraSessionEvents { dental: DentalEvent }
}

declare module '@mixo-geocore/editing/gesture' {
  interface ExtraGestures { dental: DentalGesture }
}

declare module '@mixo-geocore/editing/commands' {
  interface ExtraCommandIds {
    'supports.dentalAuto': true;
    'dental.useDetected': true; 'dental.next': true; 'dental.generate': true; 'dental.back': true; 'dental.exit': true; 'dental.finish': true; 'dental.addAnother': true; 'dental.export': true;
    'dental.tool.paint': true; 'dental.tool.erase': true; 'dental.tool.add': true; 'dental.tool.select': true;
    'dental.rim.enter': true; 'dental.rim.place': true; 'dental.rim.adjust': true; 'dental.rim.close': true; 'dental.rim.clear': true; 'dental.rim.deletePoint': true; 'dental.rim.done': true;
  }
  interface UiState {
    /** The reviewed dental contact placement matches the current model and paint. */
    dentalPreviewReady?: boolean;
    /** Dental Step 1: an aligner is read and oriented (or orientation failed), so Next may go on. */
    dentalAlignerReady?: boolean;
    /** Step 1: the print-angle search or its confirm is still running (Next waits for it). */
    dentalTiltBusy?: boolean;
    /** Dental Step 1: the detector proposed an orientation (Auto orientation can re-apply it). */
    dentalProposed?: boolean;
    /** The dental step: Back is offered from Step 1 on. */
    dentalStage?: DentalStage;
    /** Dental Step 3: the supports are built for the current model and settings, so the aligner can be finished. */
    dentalReviewReady?: boolean;
    /** Dental Step 3: the last build of the current model and settings failed or was cancelled; no build is coming until a change. */
    dentalBuildFailed?: boolean;
    /** Rim define mode: the tool in hand. */
    dentalRimTool?: DentalRimTool;
    /** Rim define mode: the anchor picked out, so Delete point has a subject (and a reason when it has none). */
    dentalRimSelected?: number;
    /** Rim define mode: how many anchors the operator has placed. */
    dentalRimAnchors?: number;
    /** Rim define mode: the drawn path is a closed loop. */
    dentalRimClosed?: boolean;
    /**
     * Rim define mode: why the drawn loop cannot be used yet (a `SurfacePathProblem` code), or absent when
     * it can. Keeping the CODE, not a sentence, keeps the reason translatable where it is shown.
     */
    dentalRimProblem?: string;
  }
}

const isDentalEvent = (event: SessionEvent): event is DentalEvent => DENTAL_EVENTS.has(event.type);
const DENTAL_EVENTS = new Set<string>(['startDental', 'switchDentalProfile', 'dentalLoading', 'dentalOriented',
  'dentalOrientFailed', 'dentalRimNeeded', 'dentalRimReopen', 'setDentalRimTool', 'setDentalRimSelected', 'setDentalTool', 'dentalRimDefined', 'dentureOriented', 'dentalBadFile', 'dismissDentalNotice', 'acceptDentalOrientation', 'acceptDentalArea', 'finishDental',
  'addAnotherDental', 'exportedDental', 'backDental', 'setDentalRadius']);

const finished = (state: EditSession, unitId: string): readonly string[] => (state.dentalFinished.includes(unitId) ? state.dentalFinished : [...state.dentalFinished, unitId]);

function reduceDental(state: EditSession, event: DentalEvent, { withMode, set, emptySelection: NO_SELECTION }: SessionKit): EditSession {
  switch (event.type) {
    case 'startDental':
      return state.mode === 'off'
        // The finished list belongs to the CASE, not to this visit: `resume` keeps it (see the event).
        ? { ...withMode(state, 'dental'), dentalStage: 'aligner', dentalProfile: event.profile, dentalAligner: 'prompt', dentalNotices: [], dentalProposal: undefined, dentalFinished: event.resume ? state.dentalFinished : [], dentalUnitId: undefined }
        : state;
    case 'switchDentalProfile':
      return state.mode === 'dental' && state.dentalStage === 'aligner'
        ? { ...state, dentalProfile: event.id, dentalAligner: 'loading', dentalNotices: [], dentalProposal: undefined }
        : state;
    case 'dentalLoading':
      return state.mode === 'dental' && state.dentalStage === 'aligner'
        ? { ...state, dentalAligner: 'loading', dentalNotices: [], dentalProposal: undefined, dentalUnitId: event.unitId }
        : state;
    case 'dentalOriented':
      return state.mode === 'dental' && state.dentalStage === 'aligner' && state.dentalAligner === 'loading'
        ? { ...state, dentalAligner: 'ready', dentalProposal: event.proposal, dentalNotices: event.notices }
        : state;
    case 'dentalOrientFailed':
      return state.mode === 'dental' && state.dentalStage === 'aligner' && state.dentalAligner === 'loading'
        ? { ...state, dentalAligner: 'ready', dentalProposal: undefined, dentalNotices: event.notices }
        : state;
    /*
      * Detection found no rim, so Step 1 does not stop at a notice with no way on: it hands over to rim
      * define mode.
      * aligner while the operator is still drawing it.
      */
    case 'dentalRimNeeded':
      return state.mode === 'dental' && state.dentalStage === 'aligner' && state.dentalAligner === 'loading'
        ? { ...state, dentalStage: 'rim', dentalAligner: 'ready', dentalProposal: undefined, dentalNotices: event.notices, dentalRimTool: 'place', dentalRimSelected: undefined }
        : state;
    case 'setDentalTool':
      /*
       * PICKING A TOOL ONLY EVER PICKS IT, however many times the same one is chosen. It was briefly a
       * toggle - press the pressed tool to clear the switch - and that was wrong twice over. The keys
       * P/E/A/S run this same path, so "press A to make sure Add is in hand" stopped being true and
       * started depending on what was in hand before; the walk caught it at once. And a segment that is
       * pressed to UNpress it is a checkbox wearing a radio button's clothes, and operators double-click.
       *
       * THERE IS NO EMPTY HAND TO RETURN TO. A step rests on Select, which changes nothing until the
       * operator asks it to - the way every drawing program rests on the arrow - so the way out of a tool
       * is to pick up the harmless one, not to empty the hand. Esc goes back to Select.
       */
      return state.mode === 'dental' ? { ...state, tool: event.tool } : state;
    /*
     * PICKING A TOOL LETS GO OF THE ANCHOR. The selection belongs to Adjust - it is set by Adjust picking
     * an anchor up and acted on by Delete point - so carrying it into Place would leave a ring on the
     * drawing with no tool that answers to it, and an index that Place could push out from under.
     */
    /*
     * Reopening keeps whatever is already drawn: the draft lives on the UNIT, and nothing here
     * touches it. After Cancel that is the loop the operator stepped away from, which is the whole
     * point of coming back; after Done it is empty, because Done turned it into the rim.
     *
     * Nothing is flagged on the session: whether this aligner is hand-drawn is the unit policy, and
     * `next()` reads that.
     */
    /*
     * THE TOOL IS CHOSEN BY THE DRAWING, NOT BY HABIT. `appendAnchor` refuses a CLOSED path, so
     * opening on Place over a closed loop - which is every seeded rim, and every saved drawing come
     * back to - hands the operator a tool that cannot act. That is the dead-control rule this
     * codebase has now paid for twice. The caller knows the draft, so it says which tool; `place`
     * remains the default for an empty or open one, where it is the only thing that can do anything.
     */
    case 'dentalRimReopen':
      return state.mode === 'dental' && state.dentalStage === 'aligner' && state.dentalAligner === 'ready'
        ? { ...state, dentalStage: 'rim', dentalRimTool: event.tool ?? 'place', dentalRimSelected: undefined }
        : state;
    case 'setDentalRimTool':
      return state.mode === 'dental' && state.dentalStage === 'rim'
        ? { ...state, dentalRimTool: event.tool, dentalRimSelected: undefined } : state;
    case 'setDentalRimSelected':
      return state.mode === 'dental' && state.dentalStage === 'rim' ? { ...state, dentalRimSelected: event.at } : state;
    // Done: back to Step 1 with the operator's rim; the unit policy is what records that it is theirs.
    case 'dentalRimDefined':
      return state.mode === 'dental' && state.dentalStage === 'rim'
        ? { ...state, dentalStage: 'aligner', dentalAligner: 'ready', dentalNotices: [], dentalRimSelected: undefined }
        : state;
    case 'dentureOriented':
      return state.mode === 'dental' && state.dentalStage === 'aligner' && state.dentalAligner === 'loading'
        ? { ...state, dentalAligner: 'ready', dentalProposal: undefined, dentalNotices: event.notices ?? [] }
        : state;
    case 'dentalBadFile':
      return state.mode === 'dental' && state.dentalStage === 'aligner'
        ? { ...state, dentalAligner: 'prompt', dentalProposal: undefined, dentalNotices: [{ kind: 'bad-file', message: event.message }] }
        : state;
    case 'dismissDentalNotice':
      return state.mode === 'dental' && state.dentalNotices.some((notice) => notice.kind === event.kind)
        ? { ...state, dentalNotices: state.dentalNotices.filter((notice) => notice.kind !== event.kind) }
        : state;
    case 'acceptDentalOrientation':
      // A denture goes straight to its supports (no support-area step), on Add like Step 3 of an aligner.
      if (state.mode === 'dental' && state.dentalStage === 'aligner' && state.dentalAligner === 'ready' && stageAfterOrientation(state.dentalProfile) === 'review') {
        return { ...state, dentalStage: 'review', dentalNotices: [], tool: 'select', selectStyle: 'click', addAction: 'add', selection: NO_SELECTION };
      }
      return state.mode === 'dental' && state.dentalStage === 'aligner' && state.dentalAligner === 'ready'
        ? { ...state, dentalStage: 'area', tool: 'select', addAction: 'add', selection: NO_SELECTION, dentalNotices: [...(event.noArea ? [{ kind: 'no-area' as const }] : []), ...(event.angleMovedDeg === undefined ? [] : [{ kind: 'angle-moved' as const, deg: event.angleMovedDeg }])] }
        : state;
    case 'acceptDentalArea':
      return state.mode === 'dental' && state.dentalStage === 'area'
        // Step 3 rests on Select, whatever Step 2 left on: a step opens on the tool that changes nothing.
        ? { ...state, dentalStage: 'review', dentalNotices: [], tool: 'select', selectStyle: 'click', addAction: 'add', selection: NO_SELECTION }
        : state;
    case 'finishDental':
      return state.mode === 'dental' && state.dentalStage === 'review'
        ? withMode({ ...state, dentalFinished: finished(state, event.unitId) }, 'off')
        : state;
    case 'exportedDental':
      // The stage does NOT move: the operator is still on Step 3 and may Add another or Exit from it.
      return state.mode === 'dental' && state.dentalStage === 'review'
        ? { ...state, dentalFinished: finished(state, event.unitId) }
        : state;
    case 'addAnotherDental':
      return state.mode === 'dental' && state.dentalStage === 'review'
        ? { ...state, dentalStage: 'aligner', dentalAligner: 'prompt', dentalNotices: [], dentalProposal: undefined, dentalUnitId: undefined, dentalFinished: finished(state, event.unitId), selection: NO_SELECTION, shiftHeld: false }
        : state;
    case 'backDental':
      if (state.mode !== 'dental') return state;
      switch (state.dentalStage) {
        case 'review': return stageBeforeSupports(state.dentalProfile) === 'aligner'
          ? { ...state, dentalStage: 'aligner', dentalAligner: 'ready', dentalNotices: [], selection: NO_SELECTION, shiftHeld: false }
          : { ...state, dentalStage: 'area', tool: 'select', selection: NO_SELECTION, shiftHeld: false };
        case 'area': return { ...state, dentalStage: 'aligner', dentalAligner: 'ready', dentalNotices: [] };
        /*
         * Back out of rim define mode returns to Step 1 and its failure notice - the honest parent of this
         * detour - with the aligner still on the plate, so the way on from there is Back again or Exit.
         * The DRAWING IS KEPT, and Draw the rim in Step 1 comes back to it. Cancel leaves the mode; it
         * does not throw the work away, and no session flag is left to get out of step with the unit -
         * this used to clear `dentalRimOwn`, which after a reopen would have stranded an aligner whose
         * rim was already saved.
         */
        case 'rim': return { ...state, dentalStage: 'aligner', dentalAligner: 'ready', dentalRimSelected: undefined };
        /*
         * BACK AT STEP 1 PUTS STEP 1 BACK TO WAITING, and leaves the rest of the session alone. The
         * command handler in `App.tsx` shows the Items page alongside this; what it no longer does is
         * send `exit`, which used to discard `dentalFinished` and with it every item the operator had
         * already finished in this case.
         *
         * The stage does NOT change - Step 1 is where the flow waits for an aligner, and that is
         * exactly the state being returned to. `dentalProfile` survives on purpose: the next row the
         * operator opens is the same kind of job, and `startItem` reads it.
         */
        case 'aligner': return { ...state, dentalAligner: 'prompt', dentalProposal: undefined, dentalNotices: [], dentalUnitId: undefined };
      }
      return state;
    case 'setDentalRadius': return set(state, 'dentalRadius', event.radius);
  }
}

/** Step 1 takes a dropped or chosen file only while it waits for one (not while reading the last). */
export function acceptsDentalDrop(state: EditSession): boolean {
  return state.mode === 'dental' && state.dentalStage === 'aligner' && state.dentalAligner !== 'loading';
}

function areaGesture(session: EditSession): Gesture {
  const brushing = session.tool === 'paint' || session.tool === 'erase';
  return {
    kind: 'dental-area',
    brush: brushing ? { radius: session.dentalRadius, kind: session.tool === 'paint' ? 'allow' : 'erase' } : undefined,
    // Step 2 has no Remove, so a Remove left on in Step 3 does not follow.
    edit: brushing ? undefined : editGesture(session, true),
    notices: session.dentalNotices,
  };
}

function dentalGesture(session: EditSession): Gesture {
  switch (session.dentalStage) {
    case 'aligner': return { kind: 'dental-aligner', phase: session.dentalAligner, proposal: session.dentalProposal, notices: session.dentalNotices, profile: session.dentalProfile };
    case 'rim': return { kind: 'dental-rim', tool: session.dentalRimTool, selected: session.dentalRimSelected, notices: session.dentalNotices };
    case 'area': return areaGesture(session);
    case 'review': return { kind: 'dental-review', edit: editGesture(session) };
  }
}

/** Supports can be picked, added and deleted in dental Step 3, which reuses the Support Edit Mode tools. */
const reviewing = (s: Pick<UiState, 'mode' | 'dentalStage'>) => s.mode === 'dental' && s.dentalStage === 'review';
/** Dental Step 2: the area and its suggested tips (its four tools). */
const area = (s: Pick<UiState, 'mode' | 'dentalStage'>) => s.mode === 'dental' && s.dentalStage === 'area';
/** Rim define mode: Step 1's detour where the operator draws the rim detection could not find. */
const rim = (s: Pick<UiState, 'mode' | 'dentalStage'>) => s.mode === 'dental' && s.dentalStage === 'rim';

registerEditMode({
  id: 'dental',
  initial: { dentalStage: 'aligner', dentalProfile: undefined, dentalAligner: 'prompt', dentalNotices: [], dentalProposal: undefined, dentalRadius: 2, dentalFinished: [], dentalUnitId: undefined, dentalRimTool: 'place', dentalRimSelected: undefined },
  // Paint and Erase are Step 2's own tools: no other mode starts on one.
  tools: ['paint', 'erase'],
  reduce: (state, event, kit) => (isDentalEvent(event) ? reduceDental(state, event, kit) : undefined),
  editsSupports: (s) => s.mode === 'dental' && s.dentalStage === 'review',
  // Tips can be selected in dental Step 2 (its tips, under Select).
  selectsTips: (s) => s.mode === 'dental' && s.dentalStage === 'area',
  gesture: dentalGesture,
  gestureKinds: ['dental-aligner', 'dental-rim', 'dental-area', 'dental-review'],
  // Step 3, and Step 2 under Add or Select, hand the canvas a Support Edit Mode tool.
  canvasGesture: (press) => (press.kind === 'dental-area' ? press.edit ?? press : press.kind === 'dental-review' ? press.edit : undefined),
  gestureStatus: {
    'dental-aligner': 'Drop an aligner STL, or choose one. It is oriented automatically; adjust with the gizmo, then press Next.',
    'dental-rim': 'Click along the rim to place points; they land on the model. Close the loop, then press Done. Drag off the model to turn the view.',
    'dental-area': 'Paint where dental supports may grow, anywhere on the aligner; Erase takes area away. Drag on the model.',
    'dental-review': 'Review the supports: change the settings, add or delete supports, fix the problems, then press OK.',
  },
  exitStatus: { key: 'Left the aligner on the plate without supports.' },
  // A new dental step starts with its own line: an error or result of the last step does not follow.
  restatesStatus: (previous, next) => next.dentalStage !== previous.dentalStage || next.dentalAligner !== previous.dentalAligner,
  busy: { key: 'Use the dental step controls, or press Esc to exit.' },
  locks: () => true,
  keys: ({ key, ctrl, ui }, { lower, hasSelection }) => {
    // Dental Step 2 has four tools (P, E, A, S); Step 3 reuses the support tools. In both, Delete removes the selection and the first Esc drops it.
    const inArea = area(ui);
    const inReview = reviewing(ui);
    // The two tools of rim define mode. Each of these also has a visible button in the bar.
    if (rim(ui) && !ctrl && lower === 'p') return runKey('dental.rim.place');
    if (rim(ui) && !ctrl && lower === 'a') return runKey('dental.rim.adjust');
    if (inArea && !ctrl && lower === 'p') return runKey('dental.tool.paint');
    if (inArea && !ctrl && lower === 'e') return runKey('dental.tool.erase');
    if (inArea && !ctrl && lower === 'a') return runKey('dental.tool.add');
    if (inArea && !ctrl && lower === 's') return runKey('dental.tool.select');
    /*
     * Delete in rim define mode takes the picked anchor out, the same key that deletes a selection in the
     * steps either side of it. `keyAction` drops a command that is not enabled, so with no anchor picked
     * this falls through and the key does nothing - which is what the greyed button already says.
     */
    if (rim(ui) && (key === 'Delete' || key === 'Backspace')) return runKey('dental.rim.deletePoint');
    if ((inArea || inReview) && hasSelection && (key === 'Delete' || key === 'Backspace')) return runKey('edit.deleteSelection');
    if ((inArea || inReview) && hasSelection && key === 'Escape') return runKey('edit.clearSelection');
    /*
     * ESC GOES BACK OUT ONE LEVEL, never further. Before this, one Esc anywhere in the flow left the whole
     * flow - from inside a tool, or from inside rim define mode - which is a long way to travel for a key
     * a drawing program uses to put the brush down. The rungs, innermost first: a live selection clears
     * (above); a tool that is not Select goes BACK TO SELECT, which is where the step opened and where a
     * drawing program rests; a mode is left; and only then does Esc leave the flow, which is what the
     * dental lock note promises (the aligner stays on the plate without supports).
     */
    if ((inArea || inReview) && key === 'Escape' && ui.tool !== 'select') return runKey('dental.tool.select');
    if (rim(ui) && key === 'Escape') return runKey('dental.back');
    if (key === 'Escape') return runKey('dental.exit');
    return undefined;
  },
  uiEditsSupports: reviewing,
  uiSelectsTips: area,
});

const always = () => true;
const never = () => undefined;

/** One of Step 2's four tools: Paint, Erase, Add, Select (keys P, E, A, S). */
/*
 * One of the four tool keys in Step 2. `alsoInStep3` belongs to Select alone. The switch stays Step 2
 * only (Step 3 draws its own, carrying Add and Select), but Esc in Step 3 runs this command to go back
 * to Select, and `keyAction` drops any command that is not ENABLED. So Select is enabled in both steps
 * and shown in one: a key with no button of its own here, because the switch in Step 3 already has it.
 */
function areaTool(tool: EditTool, label: string, hint: string, shortcut: string, alsoInStep3 = false): Command {
  const where = (s: Pick<UiState, 'mode' | 'dentalStage'>) => area(s) || (alsoInStep3 && reviewing(s));
  return {
    role: 'secondary', shortcut, label: () => label, hint: () => hint,
    visible: area, enabled: (s) => where(s) && s.heavy === undefined,
    disabledReason: (s) => (where(s) && s.heavy === undefined ? undefined : s.heavy !== undefined ? heavyReason(s) : undefined),
    pressed: (s) => s.tool === tool,
  };
}

/** Why OK and Add another are off in Step 3: a build running, a failed build (nothing is coming until a change), or one not landed yet. */
const reviewReason = (s: UiState) => (s.generating ? generatingReason : s.dentalReviewReady ? undefined
  : s.dentalBuildFailed ? { key: 'The supports could not be built. Change a setting to build them again, or press Back.' }
    : { key: 'Wait until the supports are built.' });

/**
 * THE WAY ON FROM STEP 3, decided once. OK while there is a bench to hand the operator back to, and
 * the export of this step when there is not (src/scenes/sceneMap.ts). Both review footers ask this
 * rather than naming a command, so the scene flag moves them together and neither is left behind.
 *
 * (No apostrophes above on purpose: i18n.test.ts scrapes single-quoted runs out of this file, and a
 * pair of them in a comment reads as a UI string that wants translating into three languages.)
 */
export const reviewWayOn = (): 'dental.finish' | 'dental.export' => (flowEndsAtExport() ? 'dental.export' : 'dental.finish');

registerCommands({
  'supports.dentalAuto': {
    role: 'secondary', label: () => 'Aligner Support Production', hint: () => 'Detect an aligner lower opening, review orientation, then limit supports to its approved lower area',
    visible: always, enabled: (s) => onBench(s) && !s.generating,
    disabledReason: (s) => (s.generating ? generatingReason : s.mode !== 'off' ? entryReason(s) : undefined),
  },
  'dental.useDetected': {
    role: 'primary', label: () => 'Auto orientation', hint: (s) => kindText('Rotate the aligner to the proposed orientation again', s.dentalKind),
    visible: (s) => s.mode === 'dental' && s.dentalStage === 'aligner', enabled: (s) => Boolean(s.dentalProposed),
    disabledReason: (s) => (s.dentalProposed ? undefined : { key: kindText('No orientation was proposed for this aligner.', s.dentalKind) }),
  },
  'dental.next': {
    role: 'primary', label: () => 'Next', hint: () => 'Keep the current orientation and review the proposed support area',
    visible: (s) => s.mode === 'dental', enabled: (s) => Boolean(s.dentalAlignerReady) && !s.dentalTiltBusy,
    disabledReason: (s) => (!s.dentalAlignerReady ? { key: kindText('Add an aligner first.', s.dentalKind) } : s.dentalTiltBusy ? { key: 'Wait until the print angles are checked.' } : undefined),
  },
  'dental.generate': {
    role: 'primary', label: () => 'Next',
    hint: () => 'Build supports from the reviewed dental tips and continue to final review',
    visible: (s) => s.mode === 'dental', enabled: (s) => !s.generating && Boolean(s.dentalPreviewReady),
    disabledReason: (s) => (s.generating ? generatingReason : s.dentalPreviewReady ? undefined : { key: 'Wait for safe dental tips before continuing.' }),
  },
  /*
   * One control, two honest readings, because the flow holds two kinds of place. In a STEP it is step
   * navigation: the arrow beside Next, back to the step before. In a MODE - rim define mode is the flow's
   * one such detour - it is the way OUT OF THE MODE, the counterpart of that mode's Done, so it is worded
   * Cancel, carries Esc, and says what leaving costs. The same key never means both at once: a mode is
   * never on screen at the same time as the step dock that owns the arrow.
   */
  'dental.back': {
    role: 'secondary',
    shortcut: (s) => (rim(s) ? 'Esc' : undefined),
    label: (s) => (rim(s) ? 'Cancel' : 'Back'),
    hint: (s) => (rim(s)
      ? 'Leave rim define mode. Your drawing is kept, and Step 1 offers Draw the rim to come back to it'
      : 'Return to the previous step and keep your edits'),
    // Shown in EVERY dental step. This used to read `dentalStage !== 'type'`, which with the type
    // step gone is simply "in dental mode" - Step 1's Back is a real way out, handled in `App.tsx`.
    visible: (s) => s.mode === 'dental', enabled: always, disabledReason: never,
  },
  'dental.exit': {
    role: 'secondary', label: () => 'Exit', hint: (s) => kindText('Leave the dental flow. The aligner stays on the plate without supports', s.dentalKind),
    visible: (s) => s.mode === 'dental', enabled: always, disabledReason: never,
  },
  /*
   * OK HANDS THE OPERATOR THE BENCH to finish in, which is what the flow no longer does: `FLOW_END`
   * in src/scenes/sceneMap.ts routes the end of Step 3 to its own export instead. OK comes back the
   * moment that route does. One flag decides which of the two Step 3 offers.
   */
  'dental.finish': {
    role: 'primary', label: () => 'OK', hint: (s) => kindText('Finish this aligner. It stays on the plate with its supports', s.dentalKind),
    visible: (s) => !flowEndsAtExport() && s.mode === 'dental' && s.dentalStage === 'review',
    enabled: (s) => Boolean(s.dentalReviewReady) && !s.generating,
    disabledReason: reviewReason,
  },
  /*
   * THE END OF THE FLOW. The export used to live only in the bench right panel, so a flow that stops
   * handing the bench back has to carry the export itself or a finished aligner has no way out.
   *
   * It writes the file and STAYS ON STEP 3. It does not also navigate: `runExport` reports a refusal
   * (the model changed, the supports did not build, the safety check could not judge) through the
   * status line and returns the same way it does on success, so a press that navigated would walk
   * the operator away from a file that was never written. Add another aligner and Exit remain the
   * two ways on, and both of them are already honest about where they go.
   */
  'dental.export': {
    role: 'primary', label: () => 'Export STL',
    hint: (s) => kindText('Write this aligner and its supports to one STL file. The aligner stays on this step', s.dentalKind),
    visible: (s) => flowEndsAtExport() && s.mode === 'dental' && s.dentalStage === 'review',
    enabled: (s) => Boolean(s.dentalReviewReady) && !s.generating && !s.exporting,
    disabledReason: reviewReason,
  },
  'dental.addAnother': {
    role: 'secondary', label: (s) => kindText('Add another aligner', s.dentalKind),
    hint: (s) => kindText('Finish this aligner and add the next one of the same type', s.dentalKind),
    visible: (s) => s.mode === 'dental' && s.dentalStage === 'review', enabled: (s) => Boolean(s.dentalReviewReady) && !s.generating,
    disabledReason: reviewReason,
  },
  /*
   * THE WAY BACK INTO THE MODE, from Step 1. Without it the mode was a one-way door: Cancel left the
   * operator in a Step 1 with no rim and no way to get another, and a rim whose side the engine could
   * not settle could never be redrawn. Three separate faults, one missing control.
   *
   * OFFERED EXACTLY WHERE THE DEAD END IS: an aligner that is read and has no detected orientation.
   * That one condition covers all three ways an operator arrives there - detection found no rim and
   * they cancelled out of the drawing, they drew a rim and want it back, detection could not look at
   * all, or - since 2026-11-09 - detection DID find a rim and the operator wants to correct it.
   * Dentures do not have this mode.
   *
   * It needs no flag of its own. A flag written and never read is what this feature has now had to
   * delete twice, and the state it would describe is already readable from the step itself.
   */
  'dental.rim.enter': {
    role: 'secondary',
    /*
     * A DETECTED RIM MAY NOW BE REDRAWN (owner, 2026-11-09), and the words change with the case
     * because the two presses are not the same act. On an aligner with no proposal this starts a
     * drawing. On a detected one it REPLACES a rim that already works, and the operator is owed that
     * fact before they press it: `seedRimDraft` hands them detection's own loop as anchors, but the
     * moment they finish, the rim is rebuilt from their curve and its plane is theirs - measured at
     * 5.60 degrees from detection's axis on the reference aligner, masks agreeing in 8,919 of 9,216
     * cells (`docs/handoff/geocore-rim-from-points.md`). Small, and not nothing, so it is said rather
     * than discovered.
     */
    label: (s) => (s.dentalProposed ? 'Redraw the rim' : 'Draw the rim'),
    hint: (s) => (s.dentalProposed
      ? 'Edit the detected rim by hand. Its points become yours to drag; the support area shifts slightly, because a drawn rim sets its own plane.'
      : 'Draw this aligner rim by hand, keeping anything already drawn'),
    visible: (s) => s.mode === 'dental' && s.dentalStage === 'aligner' && s.dentalKind !== 'denture',
    enabled: (s) => s.mode === 'dental' && s.dentalStage === 'aligner' && s.dentalKind !== 'denture'
      && Boolean(s.dentalAlignerReady),
    disabledReason: (s) => (s.mode === 'dental' && s.dentalStage === 'aligner' && s.dentalKind !== 'denture'
      && !s.dentalAlignerReady ? { key: 'Wait for the aligner to finish reading.' } : undefined),
  },
  /*
   * Rim define mode. Two tools with two different words: Place and Adjust. Not Paint (which marks a
   * surface) and not Select (which picks objects) - a reader who sees a familiar word expects the familiar
   * gesture, and these are neither.
   */
  'dental.rim.place': {
    role: 'secondary', shortcut: 'P', label: () => 'Place', hint: () => 'Click along the rim; each click puts a point on the model',
    visible: rim, enabled: rim, disabledReason: never, pressed: (s) => s.dentalRimTool === 'place',
  },
  'dental.rim.adjust': {
    role: 'secondary', shortcut: 'A', label: () => 'Adjust', hint: () => 'Drag a point to move it along the model',
    visible: rim, enabled: (s) => rim(s) && (s.dentalRimAnchors ?? 0) > 0,
    disabledReason: (s) => (rim(s) && (s.dentalRimAnchors ?? 0) === 0 ? { key: 'Place a point first.' } : undefined),
    pressed: (s) => s.dentalRimTool === 'adjust',
  },
  'dental.rim.close': {
    role: 'secondary', label: () => 'Close loop', hint: () => 'Join the last point back to the first',
    // Shown only while there is a loop left to close: a key that can never apply again is noise.
    visible: (s) => rim(s) && !s.dentalRimClosed,
    enabled: (s) => rim(s) && !s.dentalRimClosed && (s.dentalRimAnchors ?? 0) >= 3,
    disabledReason: (s) => (rim(s) && !s.dentalRimClosed && (s.dentalRimAnchors ?? 0) < 3 ? { key: 'A rim needs at least three points.' } : undefined),
  },
  'dental.rim.clear': {
    role: 'secondary', label: () => 'Clear', hint: () => 'Take every point away and start the rim again',
    visible: rim, enabled: (s) => rim(s) && (s.dentalRimAnchors ?? 0) > 0,
    disabledReason: (s) => (rim(s) && (s.dentalRimAnchors ?? 0) === 0 ? { key: 'There are no points to clear.' } : undefined),
  },
  /*
   * DELETE POINT acts on the anchor Adjust picked up. Shown always, enabled only with a subject, which is
   * the shape Clear and Adjust already have in this same panel - a control that vanished and came back as
   * the operator touched anchors would make the row jump under the pointer. `.danger` OUTLINE, never a
   * filled red: the house rule keeps the filled one for the mode primary, which here is Done.
   */
  'dental.rim.deletePoint': {
    role: 'destructive', shortcut: 'Delete', label: () => 'Delete point', hint: () => 'Take the picked point out of the rim',
    visible: rim, enabled: (s) => rim(s) && rimDeleteReason(s) === undefined,
    disabledReason: (s) => {
      if (!rim(s)) return undefined;
      const reason = rimDeleteReason(s);
      return reason === undefined ? undefined : { key: reason };
    },
  },
  /*
   * The mode's ONE primary, and the one that refuses honestly: a drawn loop becomes a rim only once the
   * engine can fit its frame and rasterise the opening's visibility mask, which the host cannot compute.
   * `rimDoneReason` says which of the three things is in the way, in the operator's own language.
   */
  'dental.rim.done': {
    role: 'primary', label: () => 'Done', hint: () => 'Use this rim, then turn the aligner by hand',
    visible: rim, enabled: (s) => rim(s) && rimDoneReason(s) === undefined,
    disabledReason: (s) => {
      if (!rim(s)) return undefined;
      const reason = rimDoneReason(s);
      return reason === undefined ? undefined : { key: reason };
    },
  },
  'dental.tool.paint': areaTool('paint', 'Paint', 'Paint dental support area anywhere on the aligner', 'P'),
  'dental.tool.erase': areaTool('erase', 'Erase', 'Erase dental support area and its tips anywhere on the aligner', 'E'),
  'dental.tool.add': areaTool('add', 'Add', 'Click the model to add a tip by hand; it snaps to a nearby suggested tip', 'A'),
  'dental.tool.select': areaTool('select', 'Select', 'Click or drag over tips to select them, then delete them', 'S', true),
});

registerStepHints({ dentalArea: { undo: 'Undo the support area change', redo: 'Redo the support area change' } });
