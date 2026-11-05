import { entryReason, generatingReason, heavyReason, registerCommands, registerStepHints, type Command, type UiState } from '@mixo-geocore/editing/commands';
import { editGesture, type EditGesture, type Gesture } from '@mixo-geocore/editing/gesture';
import { runKey } from '@mixo-geocore/editing/keys';
import { rimDoneReason } from './rim/rimStepText';
import { registerEditMode, type SessionKit } from '@mixo-geocore/editing/modes';
import type { EditSession, SessionEvent } from '@mixo-geocore/editing/session';
import type { EditTool, StatusMessage } from '@mixo-geocore/editing/types';
import type { DentalProposal } from '@mixo-geocore/host/dental/dental';
import { stageAfterOrientation, stageBeforeSupports } from '../denture/state/dentureStages';
import '../denture/state/dentureCommands';
import { kindText } from '../denture/kindText';

/*
 * The dental flow as an app mode of the shared editor (mixo-geocore editing/modes.ts): its session
 * fields and events, its own tools (Step 2's Paint and Erase), gestures, keys, status lines, locks
 * and command rows. Importing this module registers it; the app entry and the test setup import it
 * before the first session is made. The generic Support Edit Mode and zones come from the package.
 */

/**
 * The dental flow's steps: 0 aligner type, 1 aligner (drop, check, orient), 2 support area, 3 supports,
 * plus `rim` - a detour out of Step 1 when detection finds no rim and the operator draws it by hand.
 */
export type DentalStage = 'type' | 'aligner' | 'rim' | 'area' | 'review';
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
  | { type: 'enterDental' }
  | { type: 'chooseDentalProfile'; id: string }
  /** The full-screen start (components/StartScreen): straight to Step 1 with this type; `file` is read by the app once Step 1 waits for it. */
  | { type: 'startDental'; profile: string; file?: File }
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
  | { type: 'setDentalRimTool'; tool: DentalRimTool }
  /**
   * Picks a tool in a dental step AND arms it. A step opens with no tool in hand, the way a drawing program
   * does: until the operator chooses one, a drag on the model does nothing and the view turns instead.
   */
  | { type: 'setDentalTool'; tool: EditTool }
  /**
   * Puts the tool down without picking another: the step stays, the model goes inert and a drag turns the
   * view again. This is the first rung of GOING BACK OUT ONE LEVEL - Esc, and the dock's own Put it down
   * key - so that leaving a tool never also leaves the step, and leaving a step never also leaves the flow.
   */
  | { type: 'dropDentalTool' }
  /**
   * Done in rim define mode: the drawn rim is the aligner's. Back to Step 1, and `dentalRimOwn` stays on,
   * which is what switches auto orientation OFF for this aligner - the operator's rim is not re-detected,
   * and there is no print-angle scan to run without a detected arch front.
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
  | { kind: 'dental-type'; profile: string | undefined }
  | { kind: 'dental-aligner'; phase: DentalAligner; proposal: Proposal | undefined; notices: readonly DentalNotice[]; profile: string | undefined }
  | { kind: 'dental-area'; brush: { radius: number; kind: 'allow' | 'erase' } | undefined; edit: EditGesture | undefined; notices: readonly DentalNotice[] }
  /** Rim define mode. The drawn path itself is scene state, so it reaches the panel as a prop, not through here. */
  | { kind: 'dental-rim'; tool: DentalRimTool; notices: readonly DentalNotice[] }
  /** `edit` is absent until a tool is armed: a step opens with none in hand. */
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
     * A tool is in hand in this dental step. False when a step opens: `tool` still names which tool WOULD
     * be picked, but nothing is armed, so the model is inert and a drag turns the view. The operator arms
     * one by choosing it, as they would in a drawing program.
     */
    dentalToolArmed: boolean;
    /**
     * The rim of this aligner was drawn by hand, by the operator. Auto orientation is off for it: no
     * second detection, no print-angle scan, and nothing detected for "Use detected" to re-apply.
     */
    dentalRimOwn: boolean;
  }
  interface ExtraSessionEvents { dental: DentalEvent }
}

declare module '@mixo-geocore/editing/gesture' {
  interface ExtraGestures { dental: DentalGesture }
}

declare module '@mixo-geocore/editing/commands' {
  interface ExtraCommandIds {
    'supports.dentalAuto': true;
    'dental.useDetected': true; 'dental.next': true; 'dental.generate': true; 'dental.back': true; 'dental.exit': true; 'dental.finish': true; 'dental.addAnother': true;
    'dental.tool.paint': true; 'dental.tool.erase': true; 'dental.tool.add': true; 'dental.tool.select': true; 'dental.toolDown': true;
    'dental.rim.place': true; 'dental.rim.adjust': true; 'dental.rim.close': true; 'dental.rim.clear': true; 'dental.rim.done': true;
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
    /** A dental step has a tool in hand; false while the step is only being looked at. */
    dentalToolArmed?: boolean;
    /** Rim define mode: how many anchors the operator has placed. */
    dentalRimAnchors?: number;
    /** Rim define mode: the drawn path is a closed loop. */
    dentalRimClosed?: boolean;
    /**
     * Rim define mode: why the drawn loop cannot be used yet (a `SurfacePathProblem` code), or absent when
     * it can. Keeping the CODE, not a sentence, keeps the reason translatable where it is shown.
     */
    dentalRimProblem?: string;
    /**
     * Rim define mode: the engine can turn a drawn loop into a rim. False until geocore grows the call
     * (docs/handoff/geocore-rim-from-points.md), which is why Done refuses rather than pretending.
     */
    dentalRimEngineReady?: boolean;
  }
}

const isDentalEvent = (event: SessionEvent): event is DentalEvent => DENTAL_EVENTS.has(event.type);
const DENTAL_EVENTS = new Set<string>(['enterDental', 'chooseDentalProfile', 'startDental', 'switchDentalProfile', 'dentalLoading', 'dentalOriented',
  'dentalOrientFailed', 'dentalRimNeeded', 'setDentalRimTool', 'setDentalTool', 'dropDentalTool', 'dentalRimDefined', 'dentureOriented', 'dentalBadFile', 'dismissDentalNotice', 'acceptDentalOrientation', 'acceptDentalArea', 'finishDental',
  'addAnotherDental', 'backDental', 'setDentalRadius']);

const finished = (state: EditSession, unitId: string): readonly string[] => (state.dentalFinished.includes(unitId) ? state.dentalFinished : [...state.dentalFinished, unitId]);

function reduceDental(state: EditSession, event: DentalEvent, { withMode, set, emptySelection: NO_SELECTION }: SessionKit): EditSession {
  switch (event.type) {
    case 'enterDental':
      // Entry needs no object: Step 0 and the drop in Step 1 come first.
      return state.mode === 'off'
        ? { ...withMode(state, 'dental'), dentalStage: 'type', dentalAligner: 'prompt', dentalNotices: [], dentalProposal: undefined, dentalFinished: [], dentalUnitId: undefined }
        : state;
    case 'startDental':
      return state.mode === 'off'
        ? { ...withMode(state, 'dental'), dentalStage: 'aligner', dentalProfile: event.profile, dentalAligner: 'prompt', dentalNotices: [], dentalProposal: undefined, dentalFinished: [], dentalUnitId: undefined }
        : state;
    case 'chooseDentalProfile':
      return state.mode === 'dental' && state.dentalStage === 'type'
        ? { ...state, dentalStage: 'aligner', dentalProfile: event.id, dentalAligner: 'prompt', dentalNotices: [], dentalProposal: undefined }
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
      * define mode. `dentalRimOwn` goes on here rather than on Done, so that nothing re-detects this
      * aligner while the operator is still drawing it.
      */
    case 'dentalRimNeeded':
      return state.mode === 'dental' && state.dentalStage === 'aligner' && state.dentalAligner === 'loading'
        ? { ...state, dentalStage: 'rim', dentalAligner: 'ready', dentalProposal: undefined, dentalNotices: event.notices, dentalRimTool: 'place', dentalRimOwn: true }
        : state;
    case 'setDentalTool':
      /*
       * PICKING A TOOL ARMS IT, AND NEVER PUTS IT DOWN, however many times the same one is picked. It was
       * briefly a toggle - press the pressed tool to clear the switch - and that was wrong twice over.
       * The keys P/E/A/S run the same path, so "press A to make sure Add is in hand" stopped being true
       * and started depending on what was in hand before; the walk caught it at once, by pressing `a`
       * before setting Click reach and getting the field taken away instead. And a segment in a switch
       * that is pressed to UNpress it is a checkbox wearing a radio button's clothes: a double-click,
       * which operators do, would silently empty the operator's hand.
       *
       * The way out of a tool is therefore explicit and never ambiguous: Esc, or the Put it down key
       * (`dental.toolDown`) that sits beside the switch while a tool is in hand.
       */
      return state.mode === 'dental' ? { ...state, tool: event.tool, dentalToolArmed: true } : state;
    case 'dropDentalTool':
      return state.mode === 'dental' && state.dentalToolArmed ? { ...state, dentalToolArmed: false } : state;
    case 'setDentalRimTool':
      return state.mode === 'dental' && state.dentalStage === 'rim' ? { ...state, dentalRimTool: event.tool } : state;
    // Done: back to Step 1 with the operator's rim, and `dentalRimOwn` left on so nothing detects over it.
    case 'dentalRimDefined':
      return state.mode === 'dental' && state.dentalStage === 'rim'
        ? { ...state, dentalStage: 'aligner', dentalAligner: 'ready', dentalNotices: [] }
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
        return { ...state, dentalStage: 'review', dentalNotices: [], tool: 'add', selectStyle: 'click', addAction: 'add', selection: NO_SELECTION, dentalToolArmed: false };
      }
      return state.mode === 'dental' && state.dentalStage === 'aligner' && state.dentalAligner === 'ready'
        ? { ...state, dentalStage: 'area', tool: 'paint', addAction: 'add', selection: NO_SELECTION, dentalToolArmed: false, dentalNotices: [...(event.noArea ? [{ kind: 'no-area' as const }] : []), ...(event.angleMovedDeg === undefined ? [] : [{ kind: 'angle-moved' as const, deg: event.angleMovedDeg }])] }
        : state;
    case 'acceptDentalArea':
      return state.mode === 'dental' && state.dentalStage === 'area'
        // Step 3 always starts on Add (add action), whatever Step 2 left on.
        ? { ...state, dentalStage: 'review', dentalNotices: [], tool: 'add', selectStyle: 'click', addAction: 'add', selection: NO_SELECTION, dentalToolArmed: false }
        : state;
    case 'finishDental':
      return state.mode === 'dental' && state.dentalStage === 'review'
        ? withMode({ ...state, dentalFinished: finished(state, event.unitId) }, 'off')
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
          : { ...state, dentalStage: 'area', tool: 'paint', selection: NO_SELECTION, shiftHeld: false, dentalToolArmed: false };
        case 'area': return { ...state, dentalStage: 'aligner', dentalAligner: 'ready', dentalNotices: [] };
        /*
         * Back out of rim define mode returns to Step 1 and its failure notice - the honest parent of this
         * detour - with the aligner still on the plate, so the way on from there is Back again or Exit.
         * `dentalRimOwn` is cleared: leaving the mode without finishing means there is no operator rim.
         */
        case 'rim': return { ...state, dentalStage: 'aligner', dentalAligner: 'ready', dentalRimOwn: false };
        case 'aligner': return { ...state, dentalStage: 'type', dentalAligner: 'prompt', dentalProposal: undefined, dentalNotices: [], dentalUnitId: undefined };
        case 'type': return state;
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
  // No tool in hand: the step shows its dock and the model is inert, so a drag turns the view.
  if (!session.dentalToolArmed) return { kind: 'dental-area', brush: undefined, edit: undefined, notices: session.dentalNotices };
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
    case 'type': return { kind: 'dental-type', profile: session.dentalProfile };
    case 'aligner': return { kind: 'dental-aligner', phase: session.dentalAligner, proposal: session.dentalProposal, notices: session.dentalNotices, profile: session.dentalProfile };
    case 'rim': return { kind: 'dental-rim', tool: session.dentalRimTool, notices: session.dentalNotices };
    case 'area': return areaGesture(session);
    case 'review': return { kind: 'dental-review', edit: session.dentalToolArmed ? editGesture(session) : undefined };
  }
}

/** Supports can be picked, added and deleted in dental Step 3, which reuses the Support Edit Mode tools. */
const reviewing = (s: Pick<UiState, 'mode' | 'dentalStage'>) => s.mode === 'dental' && s.dentalStage === 'review';
/** Dental Step 2: the area and its suggested tips (its four tools). */
const area = (s: Pick<UiState, 'mode' | 'dentalStage'>) => s.mode === 'dental' && s.dentalStage === 'area';
/** Rim define mode: Step 1's detour where the operator draws the rim detection could not find. */
const rim = (s: Pick<UiState, 'mode' | 'dentalStage'>) => s.mode === 'dental' && s.dentalStage === 'rim';
/** A tool is in hand in one of the two steps that have tools, so there is something to put down. */
const toolInHand = (s: UiState) => (area(s) || reviewing(s)) && Boolean(s.dentalToolArmed);

registerEditMode({
  id: 'dental',
  initial: { dentalStage: 'type', dentalProfile: undefined, dentalAligner: 'prompt', dentalNotices: [], dentalProposal: undefined, dentalRadius: 2, dentalFinished: [], dentalUnitId: undefined, dentalRimTool: 'place', dentalRimOwn: false, dentalToolArmed: false },
  // Paint and Erase are Step 2's own tools: no other mode starts on one.
  tools: ['paint', 'erase'],
  reduce: (state, event, kit) => (isDentalEvent(event) ? reduceDental(state, event, kit) : undefined),
  editsSupports: (s) => s.mode === 'dental' && s.dentalStage === 'review',
  // Tips can be selected in dental Step 2 (its tips, under Select).
  selectsTips: (s) => s.mode === 'dental' && s.dentalStage === 'area',
  gesture: dentalGesture,
  gestureKinds: ['dental-type', 'dental-aligner', 'dental-rim', 'dental-area', 'dental-review'],
  // Step 3, and Step 2 under Add or Select, hand the canvas a Support Edit Mode tool.
  canvasGesture: (press) => (press.kind === 'dental-area' ? press.edit ?? press : press.kind === 'dental-review' ? press.edit : undefined),
  gestureStatus: {
    'dental-type': 'Choose the aligner type to begin.',
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
    if ((inArea || inReview) && hasSelection && (key === 'Delete' || key === 'Backspace')) return runKey('edit.deleteSelection');
    if ((inArea || inReview) && hasSelection && key === 'Escape') return runKey('edit.clearSelection');
    /*
     * ESC GOES BACK OUT ONE LEVEL, never further. Before this, one Esc anywhere in the flow left the whole
     * flow - from inside a tool, or from inside rim define mode - which is a long way to travel for a key
     * a drawing program uses to put the brush down. So: the tool in hand goes down first; from a mode, the
     * mode is left; and only with nothing in hand and no mode to leave does Esc leave the flow, which is
     * what the dental lock note promises (the aligner stays on the plate without supports).
     */
    if ((inArea || inReview) && key === 'Escape' && ui.dentalToolArmed) return runKey('dental.toolDown');
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
function areaTool(tool: EditTool, label: string, hint: string, shortcut: string): Command {
  return {
    role: 'secondary', shortcut, label: () => label, hint: () => hint,
    visible: area, enabled: (s) => area(s) && s.heavy === undefined,
    disabledReason: (s) => (area(s) && s.heavy === undefined ? undefined : s.heavy !== undefined ? heavyReason(s) : undefined),
    pressed: (s) => Boolean(s.dentalToolArmed) && s.tool === tool,
  };
}

/** Why OK and Add another are off in Step 3: a build running, a failed build (nothing is coming until a change), or one not landed yet. */
const reviewReason = (s: UiState) => (s.generating ? generatingReason : s.dentalReviewReady ? undefined
  : s.dentalBuildFailed ? { key: 'The supports could not be built. Change a setting to build them again, or press Back.' }
    : { key: 'Wait until the supports are built.' });

registerCommands({
  'supports.dentalAuto': {
    role: 'secondary', label: () => 'Aligner Support Production', hint: () => 'Detect an aligner lower opening, review orientation, then limit supports to its approved lower area',
    visible: always, enabled: (s) => s.mode === 'off' && !s.generating,
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
      ? 'Leave rim define mode without a rim. Step 1 keeps the notice that sent you here'
      : 'Return to the previous step and keep your edits'),
    visible: (s) => s.mode === 'dental' && s.dentalStage !== 'type', enabled: always, disabledReason: never,
  },
  /*
   * Put it down: the first rung of going back out one level. It is shown only while a tool IS in hand,
   * beside the switch that picked it, which is the other way to the same place (press the pressed tool).
   */
  'dental.toolDown': {
    role: 'secondary',
    /*
     * The cap goes AWAY while a selection is live, because then Esc clears the selection instead - it is
     * the rung above this one. A key advertised on a button that the press would not reach is a lie, and
     * the registry's own rule (commands.test: "does not advertise a key a command does not run on") is
     * only checked over non-dental states, so this one has to be got right by hand.
     */
    shortcut: (s) => (s.selection > 0 ? undefined : 'Esc'),
    label: () => 'Put it down',
    hint: () => 'Put the tool down. The model goes inert and a drag turns the view',
    visible: toolInHand, enabled: toolInHand, disabledReason: never,
  },
  'dental.exit': {
    role: 'secondary', label: () => 'Exit', hint: (s) => kindText('Leave the dental flow. The aligner stays on the plate without supports', s.dentalKind),
    visible: (s) => s.mode === 'dental', enabled: always, disabledReason: never,
  },
  'dental.finish': {
    role: 'primary', label: () => 'OK', hint: (s) => kindText('Finish this aligner. It stays on the plate with its supports', s.dentalKind),
    visible: (s) => s.mode === 'dental' && s.dentalStage === 'review', enabled: (s) => Boolean(s.dentalReviewReady) && !s.generating,
    disabledReason: reviewReason,
  },
  'dental.addAnother': {
    role: 'secondary', label: (s) => kindText('Add another aligner', s.dentalKind),
    hint: (s) => kindText('Finish this aligner and add the next one of the same type', s.dentalKind),
    visible: (s) => s.mode === 'dental' && s.dentalStage === 'review', enabled: (s) => Boolean(s.dentalReviewReady) && !s.generating,
    disabledReason: reviewReason,
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
  'dental.tool.select': areaTool('select', 'Select', 'Click or drag over tips to select them, then delete them', 'S'),
});

registerStepHints({ dentalArea: { undo: 'Undo the support area change', redo: 'Redo the support area change' } });
