import { entryReason, generatingReason, heavyReason, registerCommands, registerStepHints, type Command, type UiState } from '@mixo-geocore/editing/commands';
import { editGesture, type EditGesture, type Gesture } from '@mixo-geocore/editing/gesture';
import { runKey } from '@mixo-geocore/editing/keys';
import { registerEditMode, type SessionKit } from '@mixo-geocore/editing/modes';
import type { EditSession, SessionEvent } from '@mixo-geocore/editing/session';
import type { EditTool, StatusMessage } from '@mixo-geocore/editing/types';
import type { DentalProposal } from '@mixo-geocore/host/dental/dental';

/*
 * The dental flow as an app mode of the shared editor (mixo-geocore editing/modes.ts): its session
 * fields and events, its own tools (Step 2's Paint and Erase), gestures, keys, status lines, locks
 * and command rows. Importing this module registers it; the app entry and the test setup import it
 * before the first session is made. The generic Support Edit Mode and zones come from the package.
 */

/** The dental flow's steps: 0 aligner type, 1 aligner (drop, check, orient), 2 support area, 3 supports. */
export type DentalStage = 'type' | 'aligner' | 'area' | 'review';
/** Step 1 itself: waiting for a file, reading and orienting it, or showing the oriented aligner. */
export type DentalAligner = 'prompt' | 'loading' | 'ready';
/** A message the dental bar shows in a step; `bad-file` carries the import error line. */
export type DentalNotice =
  | { kind: 'bad-file'; message: StatusMessage }
  | { kind: 'failed' } | { kind: 'uncertain' } | { kind: 'holes' } | { kind: 'mismatch' } | { kind: 'no-area' }
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
  | { kind: 'dental-review'; edit: EditGesture };

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
    'dental.tool.paint': true; 'dental.tool.erase': true; 'dental.tool.add': true; 'dental.tool.select': true;
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
  }
}

const isDentalEvent = (event: SessionEvent): event is DentalEvent => DENTAL_EVENTS.has(event.type);
const DENTAL_EVENTS = new Set<string>(['enterDental', 'chooseDentalProfile', 'startDental', 'switchDentalProfile', 'dentalLoading', 'dentalOriented',
  'dentalOrientFailed', 'dentalBadFile', 'dismissDentalNotice', 'acceptDentalOrientation', 'acceptDentalArea', 'finishDental',
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
    case 'dentalBadFile':
      return state.mode === 'dental' && state.dentalStage === 'aligner'
        ? { ...state, dentalAligner: 'prompt', dentalProposal: undefined, dentalNotices: [{ kind: 'bad-file', message: event.message }] }
        : state;
    case 'dismissDentalNotice':
      return state.mode === 'dental' && state.dentalNotices.some((notice) => notice.kind === event.kind)
        ? { ...state, dentalNotices: state.dentalNotices.filter((notice) => notice.kind !== event.kind) }
        : state;
    case 'acceptDentalOrientation':
      return state.mode === 'dental' && state.dentalStage === 'aligner' && state.dentalAligner === 'ready'
        ? { ...state, dentalStage: 'area', tool: 'paint', addAction: 'add', selection: NO_SELECTION, dentalNotices: [...(event.noArea ? [{ kind: 'no-area' as const }] : []), ...(event.angleMovedDeg === undefined ? [] : [{ kind: 'angle-moved' as const, deg: event.angleMovedDeg }])] }
        : state;
    case 'acceptDentalArea':
      return state.mode === 'dental' && state.dentalStage === 'area'
        // Step 3 always starts on Add (add action), whatever Step 2 left on.
        ? { ...state, dentalStage: 'review', dentalNotices: [], tool: 'add', selectStyle: 'click', addAction: 'add', selection: NO_SELECTION }
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
        case 'review': return { ...state, dentalStage: 'area', tool: 'paint', selection: NO_SELECTION, shiftHeld: false };
        case 'area': return { ...state, dentalStage: 'aligner', dentalAligner: 'ready', dentalNotices: [] };
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
    case 'area': return areaGesture(session);
    case 'review': return { kind: 'dental-review', edit: editGesture(session) };
  }
}

/** Supports can be picked, added and deleted in dental Step 3, which reuses the Support Edit Mode tools. */
const reviewing = (s: Pick<UiState, 'mode' | 'dentalStage'>) => s.mode === 'dental' && s.dentalStage === 'review';
/** Dental Step 2: the area and its suggested tips (its four tools). */
const area = (s: Pick<UiState, 'mode' | 'dentalStage'>) => s.mode === 'dental' && s.dentalStage === 'area';

registerEditMode({
  id: 'dental',
  initial: { dentalStage: 'type', dentalProfile: undefined, dentalAligner: 'prompt', dentalNotices: [], dentalProposal: undefined, dentalRadius: 2, dentalFinished: [], dentalUnitId: undefined },
  // Paint and Erase are Step 2's own tools: no other mode starts on one.
  tools: ['paint', 'erase'],
  reduce: (state, event, kit) => (isDentalEvent(event) ? reduceDental(state, event, kit) : undefined),
  editsSupports: (s) => s.mode === 'dental' && s.dentalStage === 'review',
  // Tips can be selected in dental Step 2 (its tips, under Select).
  selectsTips: (s) => s.mode === 'dental' && s.dentalStage === 'area',
  gesture: dentalGesture,
  gestureKinds: ['dental-type', 'dental-aligner', 'dental-area', 'dental-review'],
  // Step 3, and Step 2 under Add or Select, hand the canvas a Support Edit Mode tool.
  canvasGesture: (press) => (press.kind === 'dental-area' ? press.edit ?? press : press.kind === 'dental-review' ? press.edit : undefined),
  gestureStatus: {
    'dental-type': 'Choose the aligner type to begin.',
    'dental-aligner': 'Drop an aligner STL, or choose one. It is oriented automatically; adjust with the gizmo, then press Next.',
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
    if (inArea && !ctrl && lower === 'p') return runKey('dental.tool.paint');
    if (inArea && !ctrl && lower === 'e') return runKey('dental.tool.erase');
    if (inArea && !ctrl && lower === 'a') return runKey('dental.tool.add');
    if (inArea && !ctrl && lower === 's') return runKey('dental.tool.select');
    if ((inArea || inReview) && hasSelection && (key === 'Delete' || key === 'Backspace')) return runKey('edit.deleteSelection');
    if ((inArea || inReview) && hasSelection && key === 'Escape') return runKey('edit.clearSelection');
    // The dental flow's lock note promises Esc: it leaves with the aligner on the plate and no supports.
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
    pressed: (s) => s.tool === tool,
  };
}

registerCommands({
  'supports.dentalAuto': {
    role: 'secondary', label: () => 'Aligner Support Production', hint: () => 'Detect an aligner lower opening, review orientation, then limit supports to its approved lower area',
    visible: always, enabled: (s) => s.mode === 'off' && !s.generating,
    disabledReason: (s) => (s.generating ? generatingReason : s.mode !== 'off' ? entryReason(s) : undefined),
  },
  'dental.useDetected': {
    role: 'primary', label: () => 'Auto orientation', hint: () => 'Rotate the aligner to the proposed orientation again',
    visible: (s) => s.mode === 'dental' && s.dentalStage === 'aligner', enabled: (s) => Boolean(s.dentalProposed),
    disabledReason: (s) => (s.dentalProposed ? undefined : { key: 'No orientation was proposed for this aligner.' }),
  },
  'dental.next': {
    role: 'primary', label: () => 'Next', hint: () => 'Keep the current orientation and review the proposed support area',
    visible: (s) => s.mode === 'dental', enabled: (s) => Boolean(s.dentalAlignerReady) && !s.dentalTiltBusy,
    disabledReason: (s) => (!s.dentalAlignerReady ? { key: 'Add an aligner first.' } : s.dentalTiltBusy ? { key: 'Wait until the print angles are checked.' } : undefined),
  },
  'dental.generate': {
    role: 'primary', label: () => 'Next',
    hint: () => 'Build supports from the reviewed dental tips and continue to final review',
    visible: (s) => s.mode === 'dental', enabled: (s) => !s.generating && Boolean(s.dentalPreviewReady),
    disabledReason: (s) => (s.generating ? generatingReason : s.dentalPreviewReady ? undefined : { key: 'Wait for safe dental tips before continuing.' }),
  },
  'dental.back': {
    role: 'secondary', label: () => 'Back', hint: () => 'Return to the previous step and keep your edits',
    visible: (s) => s.mode === 'dental' && s.dentalStage !== 'type', enabled: always, disabledReason: never,
  },
  'dental.exit': {
    role: 'secondary', label: () => 'Exit', hint: () => 'Leave the dental flow. The aligner stays on the plate without supports',
    visible: (s) => s.mode === 'dental', enabled: always, disabledReason: never,
  },
  'dental.finish': {
    role: 'primary', label: () => 'OK', hint: () => 'Finish this aligner. It stays on the plate with its supports',
    visible: (s) => s.mode === 'dental' && s.dentalStage === 'review', enabled: (s) => Boolean(s.dentalReviewReady) && !s.generating,
    disabledReason: (s) => (s.generating ? generatingReason : s.dentalReviewReady ? undefined : { key: 'Wait until the supports are built.' }),
  },
  'dental.addAnother': {
    role: 'secondary', label: () => 'Add another aligner', hint: () => 'Finish this aligner and add the next one of the same type',
    visible: (s) => s.mode === 'dental' && s.dentalStage === 'review', enabled: (s) => Boolean(s.dentalReviewReady) && !s.generating,
    disabledReason: (s) => (s.generating ? generatingReason : s.dentalReviewReady ? undefined : { key: 'Wait until the supports are built.' }),
  },
  'dental.tool.paint': areaTool('paint', 'Paint', 'Paint dental support area anywhere on the aligner', 'P'),
  'dental.tool.erase': areaTool('erase', 'Erase', 'Erase dental support area and its tips anywhere on the aligner', 'E'),
  'dental.tool.add': areaTool('add', 'Add', 'Click the model to add a tip by hand; it snaps to a nearby suggested tip', 'A'),
  'dental.tool.select': areaTool('select', 'Select', 'Click or drag over tips to select them, then delete them', 'S'),
});

registerStepHints({ dentalArea: { undo: 'Undo the support area change', redo: 'Redo the support area change' } });
