import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { Progress } from './progress/Progress';
import { useSlowJob } from './ui/useSlowJob';
import { angleEvidence } from './dental/angleEvidence';
import { SceneLegend } from './components/SceneLegend';
import { labelForIndex } from '@mixo-geocore/host/core/analysis/mesh';
import type { PlacementResult } from '@mixo-geocore/host/core/analysis/types';
import type { Vector } from '@mixo-geocore/host/core/vec3';
import JobActivityPanel from './components/JobActivity';
import { stagedJobBar } from './denture/progress/StagedProgress';
import { AnalysisClient } from './workers/analysisClient';
import { ImportClient } from './workers/importClient';
import { createAnalysisWorker, createImportWorker, createMeshWorker } from './workers/factories';
import { SupportMeshClient } from '@mixo-geocore/host/workers/meshClient';
import ObjectViewport from './components/ObjectViewport';
import DebugSection from './components/DebugSection';
import { useDebugLayers, visibleLayers } from './components/useDebugLayers';
import { CirclePreview } from './components/viewport/CirclePreview';
import type { GizmoMode, ViewRequest } from './components/viewport/types';
import SettingsPanel from './components/SettingsPanel';
import { ShapeBand } from './components/ShapeBand';
import { BrandLogo } from './components/BrandLogo';
import { EditBar } from './components/EditBar';
import { DentalBar } from './components/DentalBar';
import { CommandButton } from './components/CommandButton';
import { ModeSections } from './components/ModeEntry';
import { ObjectList } from './components/ObjectList';
import { PlatePanel } from './components/PlatePanel';
import { usePlateArrange } from './components/usePlateArrange';
import { ProblemList } from './components/ProblemList';
import { ZonesBar } from './components/ZonesBar';
import { Segmented } from './components/Segmented';
import { RUNTIME, triangleCount } from './components/appShared';
import { useSupportChecks } from './components/useSupportChecks';
import { useExport } from './components/useExport';
import { useImportFiles } from './components/useImportFiles';
import { useRegenerate } from './components/useRegenerate';
import { currentDentalPreview, shownDentalPreview, useDentalPreview } from './components/useDentalPreview';
import { useDentalTuning } from './components/useDentalTuning';
import { useAreaRisks } from './components/useAreaRisks';
import { useDentalFlow } from './components/useDentalFlow';
import { useDentureJob } from './denture/useDentureJob';
import { isDentureJob, jobKindOf } from './denture/jobKind';
import { kindMessage, kindText } from './denture/kindText';
import type { DentalKind } from '@mixo-geocore/host/dental/dentalKind';
import { fileStepText } from './denture/steps/start/startText';
import { LiveTipSummary } from './denture/steps/orient/LiveTipSummary';
import { useAutoCheck } from './denture/steps/supports/useAutoCheck';
import { dentureAddOnTint } from './denture/parts/addOnTint';
import { PartsList } from './denture/parts/PartsList';
import { placementParts } from './denture/parts/partRoles';
import type { UnresolvedPoint } from '@mixo-geocore/host/core/supports/mesh';
import { useFreeTransform } from './components/useFreeTransform';
import type { DentalFreeControls } from './components/OrientationBar';
import { useProjectFile } from './components/useProjectFile';
import { publishSceneSave } from './rescue';
import { isProjectFile } from './state/projectFile';
import { hint } from './components/hint';
import { isOrientationStep, NO_SUPPORT_MESHES } from './dental/step1View';
import { LanguageSelect } from './components/LanguageSelect';
import { cancelSceneEdit, canUndo as historyCanUndo, createSceneHistory, redoScene, replaceScene, restoreScene, sameData, undoScene, withSceneCommand, type SceneHistory } from './state/history';
import { meshTier, refusalLimit } from '@mixo-geocore/host/core/budget';
import { TriangleGate } from '@mixo-geocore/host/core/jobGate';
import { emptyScene, reduceScene, type ContactSettings, type PrintScene, type PrintUnit, type SceneCommand, type SupportSettings } from './state/project';
import type { ModelTransform } from '@mixo-geocore/host/state/transform';
import { closePath } from './core/surfacePath/path';
import { useRimDrawing } from './dental/rim/useRimDrawing';
import { useSupportEdits } from './supports/useSupportEdits';
import { pathProblems } from './core/surfacePath/validate';
import type { ExportKind } from '@mixo-geocore/host/supports/export';
import type { SupportContact } from '@mixo-geocore/host/core/supports/mesh';
import { type ZoneStamp } from '@mixo-geocore/host/core/supports/zones';
import type { DentalAllowStamp, DentalPolicy } from '@mixo-geocore/host/dental/dentalPolicy';
import { defaultDentalStructure } from '@mixo-geocore/host/dental/dentalPolicy';
import { deleteCommands } from './supports/selection';
import { canvasGesture, gesture, type GestureKind } from '@mixo-geocore/editing/gesture';
import { TIPS_START, tipsButton, tipsCamera, tipsPress } from '@mixo-geocore/editing/view';
import { applyPreset, setRoofMode, updateSetting, withShape, type LiveSupportSettings, type SettingKey, type ShapeKey } from '@mixo-geocore/host/core/supports/settings';
import { contactsWith, currentBuild, hiddenByZones, liftCommands, placementPending, PLACEMENT_KEYS, resolveSettings, unitContacts, unitRemovedCount, withRekeyedHandWork, type UnitBuild } from '@mixo-geocore/host/supports/unitSupports';
import { COMMAND_IDS, resolve, type CommandId, type UiState } from '@mixo-geocore/editing/commands';
import { effectiveBrushMode } from '@mixo-geocore/editing/selection';
import { keyAction } from '@mixo-geocore/editing/keys';
import { customisedAmong, liveSelection, scopeCounts, shapePatch, shapeView } from '@mixo-geocore/editing/shapeEdit';
import { lockNote, sectionLocked, type Panel } from '@mixo-geocore/editing/locks';
import { editsSupports, initialSession, reduceSession, selectsTips, startsEditing, type SessionEvent } from '@mixo-geocore/editing/session';
import { acceptsDentalDrop } from './dental/editingMode';
import { StartScreen, type ChooserScreen, type StartScreenId } from './components/StartScreen';
import { seedRimDraft } from './dental/rim/seedFromDetected';
import { ItemsPage } from './items/ItemsPage';
import { useThumbnails } from './items/useThumbnails';
import { useBatchDetect } from './items/useBatchDetect';
import type { ToolId } from './state/tools';
import type { ImportRefusal } from './items/rowState';
import { hasGeometry, type HeldBuild } from './plate/releasedBuild';
import { useSupportBuilds } from './components/useSupportBuilds';
import { isBuilding, meshesOf, rimGap, withGeometry } from './plate/buildViews';
import { DEFAULT_PROFILE_ID } from '@mixo-geocore/host/dental/alignerProfiles';
import { arrangeCommands as arrangeAlignerCommands } from '@mixo-geocore/editing/arrange';
import { stepPanelInset } from './dental/stepPanelInset';
import { backNeedsConfirm, discardManualCommands, exitCommands, manualEditCounts, startsDentalStep } from './dental/flow';
import { dentalLabelOf } from '@mixo-geocore/host/dental/label';
import type { DentalReview } from './components/DentalSupports';
import { BUILDING_STATUS, busyStatus, sessionStatus } from '@mixo-geocore/editing/status';
import { CodedError, errorStatus } from '@mixo-geocore/editing/errors';
import { stepKind } from './state/stepKind';
import { toastAlive, undoToast, type UndoAction, type UndoToast as UndoToastState } from '@mixo-geocore/editing/toast';
import UndoToast from './components/UndoToast';
import TermsDialog from './components/TermsDialog';
import { onBench } from './bench/benchScene';
import type { BrushMode } from '@mixo-geocore/editing/types';
import { detectLanguage, plural, setLanguage, t, translateMessage, type Lang, type Message } from './i18n';

type HistoryAction = { type: 'command'; command: SceneCommand; edit?: string } | { type: 'cancelEdit'; edit: string } | { type: 'undo' } | { type: 'redo' } | { type: 'replace'; scene: PrintScene } | { type: 'restore'; scene: PrintScene };

function historyReducer(history: SceneHistory, action: HistoryAction): SceneHistory {
  if (action.type === 'undo') return undoScene(history);
  if (action.type === 'redo') return redoScene(history);
  if (action.type === 'replace') return replaceScene(history, action.scene);
  if (action.type === 'restore') return restoreScene(history, action.scene);
  if (action.type === 'cancelEdit') return cancelSceneEdit(history, action.edit);
  return withSceneCommand(history, action.command, action.edit);
}

const NO_OVERRIDES: ContactSettings = {};
const NO_CONTACTS: readonly SupportContact[] = [];

/** Settings edits come in bursts (typing a value); a unit's preview rebuild waits this long. */
/** The footer line of each start screen (i18n keys). */
const START_HINT: Record<Exclude<StartScreenId, 'file'>, string> = { drop: 'Drop one or more files, or choose what to make.', items: 'Work through the files one at a time.' };

/** The Export STL commands (editing/commands): `export.` and the kind. */
const EXPORT_IDS = COMMAND_IDS.filter((id): id is Extract<CommandId, `export.${string}`> => id.startsWith('export.'));
const exportKindOf = (id: CommandId) => id.slice('export.'.length) as ExportKind;

/** The viewport's mode chrome classes per gesture. */
const VIEWPORT_CLASS: Record<GestureKind, string> = {
  none: '',
  zones: ' viewport--editing viewport--zones',
  'dental-aligner': ' viewport--editing viewport--dental',
  'dental-rim': ' viewport--editing viewport--dental',
  'dental-area': ' viewport--editing viewport--dental',
  'dental-review': ' viewport--editing viewport--dental',
  add: ' viewport--editing',
  pick: ' viewport--editing',
  drag: ' viewport--editing',
};

/** Heavy-job admission for the whole app: placements, preview builds and exports share it. */
const HEAVY_JOBS = new TriangleGate(refusalLimit(RUNTIME));
/** A stable empty list, so the batch hook's effect does not re-run on every render. */
const NO_UNITS: readonly PrintUnit[] = [];

export default function App() {
  const [history, dispatchHistory] = useReducer(historyReducer, emptyScene, createSceneHistory);
  const scene = history.present;
  const sceneRef = useRef(scene);
  sceneRef.current = scene;
  /** `edit`: commands of one edit that share one undo step (a number field's typing). */
  const dispatch = useCallback((command: SceneCommand, edit?: string) => dispatchHistory({ type: 'command', command, ...(edit ? { edit } : {}) }), []);

  const cancelEdit = useCallback((edit: string) => dispatchHistory({ type: 'cancelEdit', edit }), []);

  const [lang, setLang] = useState<Lang>(detectLanguage);
  const [termsOpen, setTermsOpen] = useState(false);
  setLanguage(lang);
  const chooseLanguage = (next: Lang) => {
    setLanguage(next, true);
    setLang(next);
  };
  const [status, setStatusMessage] = useState<Message>({ key: START_HINT.drop });
  const setStatus = useCallback((key: string, vars?: Message['vars'], other?: string) => setStatusMessage({ key, ...(vars ? { vars } : {}), ...(other ? { other } : {}) }), []);
  // Support Edit Mode / zones mode, tools and selection (src/editing/session): view state of the
  // active object, never in history. `send` steps it and says what changed on the status line.
  const [session, setSession] = useState(initialSession);
  /** The full-screen start in front of the workspace (docs/ROADMAP.md ST); null: the editor. */
  const [startScreen, setStartScreen] = useState<StartScreenId | null>('drop');
  /** Files of the last drop that never became units: rows on the Items page, not a lost status line. */
  const [refusedFiles, setRefusedFiles] = useState<readonly { name: string; refusal: ImportRefusal }[]>([]);
  /** The purpose pressed for a multi-file drop: what the batch detects against (plan §0b step 2). */
  const [batchProfile, setBatchProfile] = useState<string>();
  /** The next dental import replaces the plate (a file chosen on the start screens). */
  const freshStart = useRef(false);
  const importRef = useRef<(files: readonly File[]) => Promise<void>>();
  const sessionRef = useRef(session);
  const { mode: editMode, selection } = session;
  const press = gesture(session);
  /** Support Edit Mode, or dental Step 3 which reuses its tools. */
  const editing = editsSupports(session);
  /** The tool as it is now, for canvas clicks (the canvas renders a step behind the DOM). */
  const liveTool = useCallback(() => sessionRef.current, []);
  // Like Blender's Support Edit Mode, undo inside the mode stops at the scene it was entered with.
  const historyRef = useRef(history);
  historyRef.current = history;
  /** The scene the mode was entered with (a snapshot, so it survives the history cap). */
  const undoFloor = useRef<PrintScene | undefined>(undefined);
  /** A dental step began and its floor waits for the render that holds the step's opening commands (src/dental/flow.ts). */
  const stepFloorDue = useRef(false);
  /** Renders Undo again once a step's floor is set (the floor is a ref). */
  const [, setFloorSet] = useState(0);
  const send = useCallback((event: SessionEvent) => {
    const previous = sessionRef.current;
    const next = reduceSession(previous, event);
    if (next === previous) {
      const refusal = sessionStatus(previous, next, event);
      if (refusal) setStatusMessage(refusal);
      return;
    }
    if (startsEditing(previous, next)) undoFloor.current = historyRef.current.present;
    // A dental step began: its floor is the scene once this event's commands have landed (the effect below).
    if (startsDentalStep(previous, next)) stepFloorDue.current = true;
    sessionRef.current = next;
    setSession(next);
    // A new dental step starts clean: the last step's undo toast and notices do not follow.
    if (next.mode === 'dental' && (next.dentalStage !== previous.dentalStage || next.dentalAligner !== previous.dentalAligner)) { setToast(undefined); setBackAsk(false); }
    if (event.type === 'startDental') {
      setDoneHint(undefined);
      if (event.file) void importRef.current?.([event.file]);
    }
    const message = sessionStatus(previous, next, event);
    if (message) setStatusMessage(message);
  }, []);
  useEffect(() => {
    if (!stepFloorDue.current) return;
    stepFloorDue.current = false;
    undoFloor.current = history.present;
    setFloorSet((count) => count + 1);
  }, [history, session]);
  const canUndo = historyCanUndo(history, editMode === 'off' ? undefined : undoFloor.current);
  const undoStep = canUndo ? stepKind(history.past.at(-1), history.present) : undefined;
  const redoStep = stepKind(history.present, history.future[0]);
  /** Steps back unless the mode's floor stops it; false when nothing was undone. */
  const undo = useCallback((): boolean => {
    if (!historyCanUndo(historyRef.current, sessionRef.current.mode === 'off' ? undefined : undoFloor.current)) return false;
    dispatchHistory({ type: 'undo' });
    return true;
  }, []);
  /** Restore step: the step is changed from the way it began (its floor), so there is something to put back. */
  const stepRestorable = session.mode === 'dental' && undoFloor.current !== undefined && !sameData(history.present, undoFloor.current);
  /** Returns the current dental step to the exact scene it began with, as one undo step. */
  const restoreStep = useCallback(() => {
    const floor = undoFloor.current;
    if (sessionRef.current.mode !== 'dental' || !floor) return;
    dispatchHistory({ type: 'restore', scene: floor });
    setStatus('Step restored. Undo brings your changes back.');
  }, [setStatus]);
  // Destructive actions run at once and offer Undo on a toast (editing/toast) instead of asking first.
  const [toast, setToast] = useState<UndoToastState>();
  /** Back from Step 3 is waiting for the answer: it would discard hand work. */
  const [backAsk, setBackAsk] = useState(false);
  /** After OK: how many aligners were finished, until the hint is dismissed. */
  const [doneHint, setDoneHint] = useState<number>();
  const toastSeq = useRef(0);
  const offerUndo = useCallback((action: UndoAction) => setToast(undoToast(++toastSeq.current, action)), []);
  const closeToast = useCallback(() => setToast(undefined), []);
  const [gizmoMode, setGizmoMode] = useState<GizmoMode>('translate');
  const [focus, setFocus] = useState<{ point: [number, number, number]; area: number; seq: number }>();
  /** The support just added (its object, tip and a counter): the viewport flashes a ring there. */
  const [added, setAdded] = useState<{ unitId: string; point: Vector; normal: Vector; seq: number }>();
  const [viewRequest, setViewRequest] = useState<ViewRequest>();
  const requestView = useCallback((kind: ViewRequest['kind'], rightInset?: number) => setViewRequest((current) => ({ kind, seq: (current?.seq ?? 0) + 1, ...(rightInset ? { rightInset } : {}) })), []);
  // Contact tips view (Blender: Only Tip + Ctrl+Numpad 7): view only, settings and export untouched.
  /** Tips only: the user's choice, else on by itself below the plate (editing/view). */
  const [tips, setTips] = useState(TIPS_START);
  const onBelowPlate = useCallback((below: boolean) => setTips((state) => tipsCamera(state, below)), []);
  const [modelVisible, setModelVisible] = useState(true);
  const [wireframe, setWireframe] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  /** The last click on a locked region: its panel's lock note pulses (a new seq restarts the pulse). */
  const [pulse, setPulse] = useState<{ panel: Panel; seq: number }>({ panel: 'left', seq: 0 });

  const activeUnit = scene.units.find((unit) => unit.id === scene.activeUnitId);
  const activeIndex = activeUnit ? scene.units.indexOf(activeUnit) : -1;
  // Debug section (dental only): the Step 1 evidence of the active model; shown only while its section is open.
  const debug = useDebugLayers(activeUnit?.source, session.mode === 'dental' ? session.dentalProfile : undefined);
  const debugShown = debug.open ? visibleLayers(debug.layers, debug.visible) : [];
  // Step 1 shows the model and the Debug layers only (PD.11).
  const orienting = isOrientationStep(session);
  /** Triangles of a heavy active object: the session refuses hand edits on it (Edit Mode, zones); generation and export still run. */
  const activeHeavy = activeUnit && meshTier(triangleCount(activeUnit), RUNTIME) === 'heavy' ? triangleCount(activeUnit) : undefined;
  const tipsContext = { zones: editMode === 'zones' };
  const tipsOnly = tipsButton(tips, tipsContext);
  // Support Edit Mode belongs to the active unit: it ends when that unit goes (delete, undo).
  // The selection empties on leaving a mode or changing the active object; ids that no longer
  // exist (undo, regeneration) drop out.
  useEffect(() => send({ type: 'activeUnitChanged', id: activeUnit?.id, heavy: activeHeavy }), [activeUnit?.id, activeHeavy, send]);
  // ---- Support meshes ------------------------------------------------------------------
  // Built in the preview worker from scene state; a unit keeps showing its previous mesh until
  // the new one arrives, and units that did not change are not rebuilt. Each mesh keeps the unit
  // version it was built from: its `dropped` contacts (zoned landings) decide the unit's contacts,
  // counts, checks and export plan, and a unit edited since shows its counts as still building.
  /**
   * A build is held with its geometry while its unit is being worked on, and RELEASED to its kept
   * facts once the unit is finished (`src/plate/releasedBuild.ts`). The map's value is the union, so
   * every reader has to say which it needs — and all but one need only the small fields.
   */
  const [built, setBuilt] = useState<ReadonlyMap<string, UnitBuild<HeldBuild>>>(new Map());
  const builtRef = useRef(built);
  builtRef.current = built;
  /** Unit versions whose build failed (the error is in the status line): their counts stop waiting. */
  const [failedBuilds, setFailedBuilds] = useState<ReadonlyMap<string, PrintUnit>>(new Map());
  /**
   * THE BUILDS THAT STILL CARRY GEOMETRY, and the meshes the viewport draws from them. A released
   * build is absent from both, which is what releasing MEANS - `plate/buildViews` says why, and
   * holds the rest of what is read off a build, tested without React.
   */
  const heldBuilds = useMemo(() => withGeometry(built), [built]);
  const supportMeshes = useMemo(() => meshesOf(heldBuilds), [heldBuilds]);
  /*
   * THE RELEASE IS BUILT AND NOT YET TRIGGERED, and that is deliberate.
   *
   * `releaseFinished` is correct and tested (`src/plate/releasedBuild.ts`). Its TRIGGER was wrong for
   * the app as it stands. `ObjectViewport` draws `supportMeshes.get(unit.id)` for EVERY unit on the
   * plate, so releasing a finished unit made its supports vanish from the plate — and after *Add
   * another aligner* the finished aligners sit there with their supports visible. That is a visible
   * regression on the flow that ships today, not a saving.
   *
   * The premise "one unit needs geometry because one inspect page is open at a time" is the JOB
   * DECK's premise (plan §0b), and the deck does not exist yet. Releasing on `dentalFinished` while
   * every unit is still drawn is releasing something still in use.
   *
   * TURN IT ON when a row's geometry is no longer drawn — i.e. when the deck shows thumbnails and one
   * inspected row carries the live mesh. Two things must land with it, both found by review:
   *   1. `problems` holds the full mesh per checked unit (`setProblems(... { unit, mesh, items })`),
   *      pruned only when the unit leaves the scene. Releasing the build frees nothing while that
   *      entry still points at the mesh, so the problems entry must be released in the same step.
   *   2. A released unit must be rebuildable: `useSupportBuilds`'s `requested` map refuses to rebuild
   *      an unchanged unit and `buildSettled` reports it settled, so returning to a released row would
   *      show no supports for ever. Its `requested` entry has to be cleared when it is re-opened.
   *
   * Shipping the mechanism without the trigger is the honest half: the saving is not claimed, and
   * nothing regresses.
   */
  /** The unit's contacts as its latest build left them (see `built`). */
  const contactsOf = useCallback((unit: PrintUnit) => {
    const { inArea: stepTwo, dentalPreview: preview } = areaRef.current;
    // Step 2 works on the tip preview's tips; the build of an earlier Step 3 does not count.
    if (stepTwo && unit.id === preview?.unitId) return contactsWith(withRekeyedHandWork(unit, preview.localPoints), preview.localPoints);
    return stepTwo ? NO_CONTACTS : unitContacts(unit, builtRef.current.get(unit.id)?.mesh);
  }, []);
  /** Whether the unit changed since its shown supports were built (counts follow once the build returns). */
  const building = (unit: PrintUnit) => isBuilding(built, failedBuilds, unit);
  // Build plate (Round C): the printer's plate, "Arrange plate" and the re-pack of an edited case.
  const plate = usePlateArrange({ units: scene.units, dispatch, setStatus });
  /** The active unit's build, geometry or not: what `unitContacts` and `hiddenByZones` read. */
  const activeBuild = activeUnit ? built.get(activeUnit.id)?.mesh : undefined;
  /**
   * THE ONE PLACE GEOMETRY IS ACTUALLY READ — `dentalRimCoverage`, `unresolved`,
   * `dentalStructureFallback` are all fields of a real mesh. Narrowed by a guard rather than cast, so
   * a released build reads as absent here and keeps its contacts everywhere else.
   */
  const activeMesh = hasGeometry(activeBuild) ? activeBuild : undefined;
  /** Step 3's rim verdict: a measured gap, nothing to say, or "could not measure" (`plate/buildViews`). */
  const dentalRimGap = rimGap(activeUnit, activeUnit ? built.get(activeUnit.id) : undefined);
  const targets = useCallback((current: PrintScene) => {
    const selected = current.units.filter((unit) => current.selectedUnitIds.includes(unit.id));
    return selected.length > 0 ? selected : current.units;
  }, []);

  // ---- Progress ------------------------------------------------------------------------
  // Every worker job reports to the job activity list (workers/jobActivity) by itself.
  const unitName = useCallback((unitId: string) => {
    const index = sceneRef.current.units.findIndex((unit) => unit.id === unitId);
    const unit = sceneRef.current.units[index];
    return unit ? `${resolveSettings(unit.settings).labelText || labelForIndex(index)} ${unit.name}` : 'unit';
  }, []);
  /** A unit's dental kind for the kind-aware problem lines: a denture unit says so, any other unit keeps the aligner words. */
  const unitKind = useCallback((unitId: string): DentalKind | undefined => (sceneRef.current.units.find((unit) => unit.id === unitId)?.denture ? 'denture' : undefined), []);

  // Step 1 Free transform (PD.11 S6): confirm marks the rotation as the operator's; Auto orient restores the stored pose.
  const free = useFreeTransform(`${session.dentalStage}:${session.dentalUnitId}`);
  // The denture job (src/denture) runs its steps, builds and exports in its own worker.
  const denture = useDentureJob({ dispatch, send, sceneRef, sessionRef, session, freeTransform: free.free, rotation: activeUnit?.transform.rotation, setStatus, requestView });

  // ---- Background work -----------------------------------------------------------------
  // Heavy work runs in workers by role: preview supports, export (full-resolution supports and
  // STL files), placement and checks (a small pool, one model per worker) and imports. Every
  // job reports to the job activity list; stale jobs are dropped or stopped.
  const workers = useRef<{ preview?: SupportMeshClient; export?: SupportMeshClient; analysis?: AnalysisClient; importer?: ImportClient }>({});
  const preview = useCallback(() => (workers.current.preview ??= new SupportMeshClient({ create: createMeshWorker, gate: HEAVY_JOBS })), []);
  const exporter = useCallback(() => (workers.current.export ??= new SupportMeshClient({ create: createMeshWorker, mode: 'per-job', gate: HEAVY_JOBS })), []);
  const analysis = useCallback(() => (workers.current.analysis ??= new AnalysisClient(createAnalysisWorker, undefined, undefined, HEAVY_JOBS)), []);
  /**
   * THE BATCH (plan §0b step 3): one orientation detection per row once the purpose is pressed. Runs
   * only while the Items page is up — a batch for a list nobody is looking at would spend the
   * triangle budget the flow itself needs.
   */
  const batchDetected = useBatchDetect({
    units: startScreen === 'items' ? scene.units : NO_UNITS,
    profile: batchProfile,
    analysis,
    unitName,
  });
  /**
   * THE ROW PICTURES (plan §0b increment C), drawn one row at a time while the deck is on screen.
   * Same gate as the batch above and for the same reason: the dental flow shows no rows, so drawing
   * for it would spend time and GPU on pictures nobody sees.
   */
  const thumbnails = useThumbnails(scene.units, startScreen === 'items');
  const importer = useCallback(() => (workers.current.importer ??= new ImportClient(createImportWorker)), []);
  useEffect(() => () => {
    // An import worker lives only while its import runs.
    const { preview: p, export: e, analysis: a } = workers.current;
    p?.dispose(); e?.dispose(); a?.dispose();
  }, []);

  const { generate, generateDental, landRetuned, generating, regenQueued, scheduleRegenerate, forgetPlacing } = useRegenerate({
    sceneRef, mode: editMode, targets, analysis, unitName, dispatch, offerUndo, setStatus, setStatusMessage,
  });
  // A density change in Step 3 lands the contacts the retune placed with the new strip, in one batch
  // (one rebuild); hand edits are kept where they still fit. Step 2 shows them as the tip preview.
  const dentalTuning = useDentalTuning(activeUnit, editMode === 'dental' && (session.dentalStage === 'area' || session.dentalStage === 'review'), analysis, dispatch, unitName,
    useCallback((unit: PrintUnit, policy: DentalPolicy, placement: PlacementResult | undefined) => {
      if (sessionRef.current.mode !== 'dental' || sessionRef.current.dentalStage !== 'review') return false;
      if (placement && landRetuned(unit, policy, placement)) return true;
      dispatch({ type: 'dental/set', unitId: unit.id, policy });
      scheduleRegenerate([unit.id]);
      return true;
    }, [dispatch, landRetuned, scheduleRegenerate]));
  const onDentalStructureChange = useCallback((structure: { treeEnabled: boolean; bracesEnabled: boolean }) => {
    const unit = sceneRef.current.units.find((candidate) => candidate.id === sceneRef.current.activeUnitId);
    if (unit?.dental?.kind !== 'two-contour' || (sessionRef.current.dentalStage !== 'area' && sessionRef.current.dentalStage !== 'review')) return;
    // `settingsOnly`: the region is carried through untouched, so the supports built from it are
    // still current and must not be marked out of date (see the command's own doc).
    dispatch({ type: 'dental/set', unitId: unit.id, policy: { ...unit.dental, structure }, settingsOnly: true });
  }, [dispatch, sceneRef, sessionRef]);
  const dentalPreviewState = useDentalPreview(activeUnit, editMode === 'dental' && session.dentalStage === 'area' && !dentalTuning.busy, analysis, unitName);
  const areaRisks = useAreaRisks(activeUnit, editMode === 'dental' && session.dentalStage === 'area' && !dentalTuning.busy, analysis, unitName);
  const dentalPreview = dentalPreviewState.kind === 'ready' ? currentDentalPreview(activeUnit, dentalPreviewState.preview) : undefined;

  /*
   * STEPS 1 AND 2 OPEN AT THE SIDE VIEW. The print angle is an angle to the BUILD PLATE, and the only view
   * that shows it as the angle it is, is the one where the plate is edge-on: from the front the tilt is a
   * foreshortening the eye cannot measure. It is requested once as the step opens, not held, so the reader
   * keeps whatever view they turn to afterwards.
   */
  const sideViewStage = editMode === 'dental' && session.dentalAligner === 'ready'
    && (session.dentalStage === 'aligner' || session.dentalStage === 'area') ? session.dentalStage : undefined;
  const openedAtSide = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (sideViewStage && sideViewStage !== openedAtSide.current) requestView('side', stepPanelInset(sessionRef.current));
    openedAtSide.current = sideViewStage;
  }, [sideViewStage, requestView]);

  // The tips that can be picked, deleted and counted: in Step 2 the tip preview's (with the unit's deletions and manual tips applied), else the build's.
  const inArea = editMode === 'dental' && session.dentalStage === 'area';
  // While a new preview loads, the last one's tips stay shown and pickable (a click in that window acts on them).
  const shownPreview = shownDentalPreview(dentalPreviewState, activeUnit);
  const areaContacts = useMemo(() => (inArea && activeUnit && shownPreview ? contactsWith(withRekeyedHandWork(activeUnit, shownPreview.localPoints), shownPreview.localPoints) : NO_CONTACTS), [inArea, activeUnit, shownPreview]);
  const builtContacts = useMemo(() => (activeUnit ? unitContacts(activeUnit, activeBuild) : []), [activeUnit, activeBuild]);
  const activeContacts = inArea ? areaContacts : builtContacts;
  const areaRef = useRef({ inArea, dentalPreview: shownPreview });
  areaRef.current = { inArea, dentalPreview: shownPreview };
  useEffect(() => send({ type: 'contactsChanged', contacts: activeContacts }), [activeContacts, send]);
  /** Supports the active object's zones hide, in the build the viewport shows. */
  const zonesHidden = useMemo(() => (activeUnit ? hiddenByZones(activeUnit, activeBuild) : 0), [activeUnit, activeBuild]);
  const activeSettings = useMemo(() => resolveSettings(activeUnit?.settings), [activeUnit?.settings]);
  // The Support shape region and the header count (editing/shapeEdit): the supports selected in Support Edit Mode, else the defaults.
  const activeIds = useMemo(() => activeContacts.map((contact) => contact.id), [activeContacts]);
  const selectedIds = useMemo(() => (editing ? liveSelection(selection, activeIds) : []), [activeIds, editing, selection]);
  const activeOverrides = activeUnit?.contactSettings ?? NO_OVERRIDES;
  const customisedActive = customisedAmong(activeOverrides, activeIds).length;
  const customisedSelected = customisedAmong(activeOverrides, selectedIds).length;
  const shapeRegion = useMemo(() => ({
    view: shapeView(activeSettings, activeOverrides, selectedIds),
    rep: selectedIds[0] === undefined ? activeSettings : withShape(activeSettings, activeOverrides[selectedIds[0]]) as LiveSupportSettings,
  }), [activeOverrides, activeSettings, selectedIds]);
  /** The objects the header count speaks of: the selected objects, else the active one; in Support Edit Mode the active one. */
  const bandCounts = useMemo(() => {
    const scoped = !editing && scene.selectedUnitIds.length > 0 ? scene.units.filter((unit) => scene.selectedUnitIds.includes(unit.id)) : activeUnit ? [activeUnit] : [];
    return scopeCounts(scoped.map((unit) => ({ ids: unitContacts(unit, built.get(unit.id)?.mesh).map((contact) => contact.id), overrides: unit.contactSettings })));
  }, [activeUnit, built, editing, scene.selectedUnitIds, scene.units]);

  // ---- Support check (components/useSupportChecks) -------------------------------------
  /** Frame a check finding in the viewport. The seq is what makes a repeat press a fresh request. */
  const focusSpot = useCallback((point: [number, number, number], area: number) =>
    setFocus((current) => ({ point, area, seq: (current?.seq ?? 0) + 1 })), []);
  const {
    problems, listedProblems, outOfDate, runCheck, checkSupports, showProblem, fixProblem, noteAdded, isRechecking, forgetProblems,
  } = useSupportChecks({
    sceneRef, sessionRef, units: scene.units, activeUnitId: scene.activeUnitId,
    editMode: editing ? 'edit' : editMode, analysis, dentureClient: denture.client,
    built, failedBuilds, builtRef, targets, unitName, send, dispatch, focusSpot, setStatus, setStatusMessage,
  });

  /** A unit left the scene: stop its work and free what the workers hold for it. */
  /** A unit left the scene: free what the workers and the other hooks hold for it. */
  const forgetUnit = useCallback((unitId: string) => {
    workers.current.preview?.forget(unitId);
    workers.current.export?.forget(unitId);
    workers.current.analysis?.cancel(`place:${unitId}`);
    workers.current.analysis?.cancel(`dental-place:${unitId}`);
    workers.current.analysis?.cancel(`check:${unitId}`);
    forgetPlacing(unitId);
    forgetProblems(unitId);
  }, [forgetPlacing, forgetProblems]);

  /**
   * WHEN SUPPORTS GET REBUILT: the settling delay, the build a slid denture keeps, and the pruning
   * of a unit that has left (`components/useSupportBuilds`). The maps stay here because their
   * readers are here; the rules about when to ask for a build do not belong in a component.
   */
  useSupportBuilds({
    units: scene.units, builtRef, setBuilt, setFailedBuilds, preview,
    dentureBuild: denture.supports.build, unitName, forgetUnit, setStatusMessage,
  });


  // ---- Dental Steps 1 and 2 (orient, detect the area): components/useDentalFlow ------------
  const dentalFlow = useDentalFlow({ analysis, dispatch, send, sceneRef, sessionRef, session, setStatus, requestView, setGizmoMode, unitName });
  // `orientFlow` is the Step 1 flow of the job in the step (the denture job's own, src/denture).
  const orientFlow = denture.active ? denture.orient : dentalFlow;
  const orientRef = useRef(orientFlow);
  orientRef.current = orientFlow;
  const dentalFree: DentalFreeControls = { on: free.free, asking: free.asking, ask: free.ask, cancel: free.cancel,
    confirm: () => { orientFlow.markHand(); free.confirm(); }, autoOrient: () => { orientFlow.useDetected(); free.leave(); } };
  // Read at call time: the start screen sends the job and its file in one step, before a render.
  const startDentalAligner = useCallback((unit: PrintUnit) => (isDentureJob(sessionRef.current.dentalProfile) ? denture.orient.start(unit) : dentalFlow.startAligner(unit)), [denture.orient.start, dentalFlow.startAligner]);

  /*
   * STEP 1 SHOWS THE SUPPORTS THE ANGLE WOULD NEED, AND PLACES THEM AGAIN EVERY TIME THE ALIGNER TURNS.
   * Judging a print angle means judging the supports it calls for, and until now Step 1 showed none: the
   * cones only appeared in Step 2, after the angle had already been accepted.
   *
   * The placement is the SAME job Step 2 runs, on the SAME hook, so there is no second placement path to
   * keep in step. All it needed was a unit carrying the area Step 1 detected as a preview (held in the flow
   * hook, deliberately out of the scene and so out of undo) in place of an accepted policy. The unit object
   * is rebuilt whenever the aligner's rotation changes, which is what makes `useDentalPreview` run again -
   * debounced by 180 ms there, so a drag places once when it settles and not once per frame, and the last
   * placement stays on screen until the new one lands rather than blinking out.
   */
  const stepOneArea = editMode === 'dental' && session.dentalStage === 'aligner' && session.dentalAligner === 'ready'
    ? dentalFlow.areaPreview : undefined;
  const stepOneUnit = useMemo(() => (
    activeUnit && stepOneArea?.unitId === activeUnit.id ? { ...activeUnit, dental: stepOneArea.policy } : undefined
  ), [activeUnit, stepOneArea]);
  const stepOnePreviewState = useDentalPreview(stepOneUnit, Boolean(stepOneUnit), analysis, unitName);
  const stepOneTips = shownDentalPreview(stepOnePreviewState, stepOneUnit)?.localPoints;
  // Only once the placement has outstayed a reader's patience: a bar flashing on every nudge of the dial
  // would make a steady scene flicker. See src/ui/useSlowJob.ts.
  const stepOnePlacing = useSlowJob(stepOnePreviewState.kind === 'loading');
  /*
   * WHY THIS ANGLE, for the debug tool: what the print-angle search measured at the row the dial is on.
   * The scan is already in memory, so this reads it and runs nothing (src/dental/angleEvidence.ts).
   */
  const stepOneTilt = orientFlow.tilt;
  const stepOneAngle = useMemo(() => (
    editMode === 'dental' && session.dentalStage === 'aligner' && stepOneTilt?.status === 'ready'
      ? angleEvidence(stepOneTilt.scan, stepOneTilt.index) : undefined
  ), [editMode, session.dentalStage, stepOneTilt]);

  /*
   * THE ANGLE MARK IN THE SCENE - the arc, its two lines and the big reading - and WHEN IT IS OFF.
   *
   * It reads out the angle the SEARCH settled on. In Free transform the reader has taken the aligner off
   * that pose and is turning it by hand with the gizmo, so a large number still standing in the scene would
   * be reporting an angle that is no longer the one on screen - the worst kind of wrong, because it is
   * drawn in the place the reader learned to trust. The dial hides in Free transform for exactly this
   * reason; the reading now hides with it, from the moment the confirm prompt opens.
   */
  const sceneAngle = editMode === 'dental' && session.dentalStage === 'aligner' && !free.free && !free.asking
    && activeUnit && orientFlow.tilt?.unitId === activeUnit.id && orientFlow.tilt.status === 'ready'
    ? { unitId: activeUnit.id, deg: orientFlow.tilt.scan.rows[orientFlow.tilt.index]!.tiltDeg }
    : undefined;

  // ---- Import (components/useImportFiles) ---------------------------------------------
  /**
   * A refusal because a mode owns the scene pulses the left panel, whose lock note says why and how
   * out. One callback, because both an import and a project opened mid-mode refuse that way.
   */
  const pulseLeftPanel = useCallback(() => setPulse((current) => ({ panel: 'left', seq: current.seq + 1 })), []);
  const { importFiles, useSelectedAligner } = useImportFiles({
    sceneRef, sessionRef, units: scene.units, freshStart, send, dispatch, importer, startDentalAligner,
    pulseLeftPanel, setStatus, setStatusMessage,
  });

  importRef.current = importFiles;

  const replaceWith = useCallback((next: PrintScene) => dispatchHistory({ type: 'replace', scene: next }), []);
  const refuseWhileBusy = useCallback((message: Message) => {
    pulseLeftPanel();
    setStatusMessage(message);
  }, [pulseLeftPanel]);
  const closeStart = useCallback(() => setStartScreen(null), []);
  const { openProject, saveProject, chooseProject } = useProjectFile({ sceneRef, modeRef: sessionRef, replace: replaceWith, setStatusMessage, offerUndo, refused: refuseWhileBusy, scene, onOpened: closeStart });

  /*
   * THE SAVE, LEFT WHERE A CRASH CAN STILL REACH IT (audit MIXO-04, `src/rescue.ts`).
   *
   * An uncaught render error unmounts this whole tree, so `AppBoundary` renders with no way back
   * into this component - and the scene lives here and nowhere else. Published only while there IS
   * something to lose, so the stopped screen never shows a Save button over an empty plate.
   *
   * NO CLEANUP, deliberately: the unmount this has to survive IS the crash. Clearing the slot on
   * the way out would take the save away at the one moment it is needed.
   */
  useEffect(() => { publishSceneSave(scene.units.length > 0 ? saveProject : undefined); }, [saveProject, scene.units.length]);

  // ---- Commands ------------------------------------------------------------------------
  const forTargets = useCallback((make: (unit: PrintUnit) => SceneCommand | undefined, edit?: string) => {
    const commands = targets(sceneRef.current).map(make).filter((command): command is SceneCommand => command !== undefined);
    if (commands.length > 0) dispatch({ type: 'batch', commands }, edit);
    return commands.length;
  }, [dispatch, targets]);

  const changeSettings = useCallback((change: (settings: LiveSupportSettings) => LiveSupportSettings, regenerate: boolean, edit?: string) => {
    const units = targets(sceneRef.current);
    forTargets((unit) => ({ type: 'settings/set', unitId: unit.id, settings: change(resolveSettings(unit.settings)) as SupportSettings }), edit);
    // Support Edit Mode keeps the supports it shows: a placement change waits for the next Generate.
    if (regenerate && sessionRef.current.mode !== 'edit') scheduleRegenerate(units.filter((unit) => unit.supports).map((unit) => unit.id));
  }, [forTargets, scheduleRegenerate, targets]);

  /**
   * Lift height outside Support Edit Mode: placement never depends on it, so a placed unit is only
   * raised or lowered, in the batch that sets it (one rebuild, no placement job); a unit with other
   * placement changes pending is placed again as before.
   */
  const changeLift = useCallback((value: number, edit?: string) => {
    const commands: SceneCommand[] = [];
    const again: string[] = [];
    for (const unit of targets(sceneRef.current)) {
      const settings = updateSetting(resolveSettings(unit.settings), 'liftHeight', value);
      commands.push({ type: 'settings/set', unitId: unit.id, settings: settings as SupportSettings });
      const lifted = liftCommands(unit, settings);
      if (lifted) commands.push(...lifted);
      else if (unit.supports) again.push(unit.id);
    }
    if (commands.length > 0) dispatch({ type: 'batch', commands }, edit);
    scheduleRegenerate(again);
  }, [dispatch, scheduleRegenerate, targets]);

  const onSettingChange = useCallback(<K extends SettingKey>(key: K, value: LiveSupportSettings[K], edit?: string) => {
    if (key === 'liftHeight' && sessionRef.current.mode !== 'edit') return changeLift(value as number, edit);
    changeSettings((settings) => updateSetting(settings, key, value), PLACEMENT_KEYS.includes(key), edit);
  }, [changeLift, changeSettings]);

  const removeSupports = () => {
    send({ type: 'leave' });
    const count = forTargets((unit) => (unit.supports ? { type: 'supports/remove', unitId: unit.id } : undefined));
    if (!count) return setStatus('No supports to remove.');
    setStatusMessage(undoToast(0, { kind: 'removeSupports', count }).message);
    offerUndo({ kind: 'removeSupports', count });
  };
  const clearManual = () => {
    const cleared = { added: 0, removed: 0, customised: 0 };
    const count = forTargets((unit) => {
      /*
       * ONE PREDICATE DECIDES WHETHER A UNIT CARRIES HAND WORK, and this used to be a second copy of
       * it written inline. `backNeedsConfirm` is the same question Back out of Step 3 asks before it
       * discards, and two spellings of one rule are two things that can drift apart - with the guard
       * as the half that matters.
       */
      if (!backNeedsConfirm(unit)) return undefined;
      /*
       * THE COUNTS ARE NOT THE PREDICATE, and the difference is deliberate rather than an oversight.
       * `unitRemovedCount` counts the deletions that actually HIDE a placed point, which is what the
       * operator will see come back; the predicate reads `deleted.length`, which is whether any hand
       * work is recorded at all. A deletion of a point that is not currently placed hides nothing, so
       * a unit can truthfully carry hand work and report 0 removed.
       */
      cleared.added += unit.manual.length;
      cleared.removed += unitRemovedCount(unit);
      cleared.customised += Object.keys(unit.contactSettings).length;
      return { type: 'supports/clear-manual', unitId: unit.id };
    });
    if (!count) return setStatus('No manual edits to clear.');
    setStatusMessage(undoToast(0, { kind: 'clearManual', ...cleared }).message);
    offerUndo({ kind: 'clearManual', ...cleared });
  };
  const deleteUnits = useCallback(() => {
    const ids = sceneRef.current.selectedUnitIds;
    if (ids.length === 0) return;
    dispatch({ type: 'batch', commands: ids.map((unitId) => ({ type: 'unit/remove' as const, unitId })) });
    setStatusMessage(undoToast(0, { kind: 'deleteObjects', count: ids.length }).message);
    offerUndo({ kind: 'deleteObjects', count: ids.length });
  }, [dispatch, offerUndo]);
  /** One stroke is one undo step, on the active object only. */
  const onZoneStroke = useCallback((unitId: string, stamps: ZoneStamp[]) => {
    if (sessionRef.current.mode !== 'zones' || unitId !== sceneRef.current.activeUnitId || stamps.length === 0) return;
    dispatch({ type: 'zones/add', unitId, stamps });
    setStatus(stamps[stamps.length - 1]!.kind === 'paint' ? 'Zone painted: automatic supports inside are hidden.' : 'Zone erased.');
  }, [dispatch, setStatus]);
  /** One Dental surface stroke is one undo step and never shares no-support-zone commands. */
  const onDentalStroke = useCallback((unitId: string, stamps: DentalAllowStamp[]) => {
    if (sessionRef.current.mode !== 'dental' || sessionRef.current.dentalStage !== 'area' || unitId !== sceneRef.current.activeUnitId || stamps.length === 0) return;
    dispatch({ type: 'dental/stamps/add', unitId, stamps });
    setStatus(stamps[stamps.length - 1]!.kind === 'allow' ? 'Dental support area painted.' : 'Dental support area erased.');
  }, [dispatch, setStatus]);
  const clearActiveZones = useCallback(() => {
    const unitId = sceneRef.current.activeUnitId;
    if (!unitId || !sceneRef.current.units.find((unit) => unit.id === unitId)?.zones.length) return;
    dispatch({ type: 'zones/clear', unitId });
    setStatus('No-support zones cleared.');
    offerUndo({ kind: 'clearZones', hidden: zonesHidden });
  }, [dispatch, offerUndo, setStatus, zonesHidden]);

  const onSelect = useCallback((unitId: string | null, additive: boolean) => {
    const current = sceneRef.current;
    const { mode } = sessionRef.current;
    if (mode !== 'off') {
      if (unitId !== current.activeUnitId) setStatusMessage(busyStatus(mode));
      return;
    }
    if (unitId === null) return dispatch({ type: 'selection/set', unitIds: [] });
    const ids = additive
      ? (current.selectedUnitIds.includes(unitId) ? current.selectedUnitIds.filter((id) => id !== unitId) : [...current.selectedUnitIds, unitId])
      : [unitId];
    const active = ids.includes(unitId) ? unitId : ids[ids.length - 1];
    if (ids.join() === current.selectedUnitIds.join() && active === current.activeUnitId) return;
    dispatch({ type: 'selection/set', unitIds: ids, ...(active ? { activeUnitId: active } : {}) });
  }, [dispatch]);

  const onTransform = useCallback((unitId: string, transform: ModelTransform) => {
    dispatch({ type: 'transform/set', unitId, transform });
    setStatus('Object moved with its supports. Regenerate to re-plant supports after a rotation.');
  }, [dispatch]);

  /**
   * Step 2, Add: a manual tip at the click, snapped to the nearest suggested or shown tip within Click
   * reach (it takes that tip's point and normal, and that tip is deleted in the same step so the two never
   * stand together); otherwise at the exact hit. A spot that faces up gets a warning on the status line.
   */
  // The two edits of rim define mode; its own module owns them (src/dental/rim/useRimDrawing.ts).
  const { onRimPoint, onRimPath, onRimSelect, onRimDeletePoint, onRimDone } = useRimDrawing({ session: sessionRef, scene: sceneRef, dispatch, send, setStatus });

  /*
   * What a pointer does to supports - add, remove, pick - in one module (src/supports/useSupportEdits.ts).
   * The dependency list is long on purpose: it names what support editing actually reaches for, which
   * was invisible while these nine callbacks sat loose among everything else in this file.
   */
  const { onAddContact, onRemoveContact, onEditMiss, onPickTip, onErase, onToggleContact } = useSupportEdits({
    session: sessionRef, scene: sceneRef, area: areaRef, dispatch, send, setStatus, setStatusMessage, contactsOf, setAdded, noteAdded,
  });

  /** A Drag over press with no support bodies to hit: while the object's supports are being built, say so. */
  const onNoBodies = () => {
    if (activeUnit && building(activeUnit)) setStatusMessage(BUILDING_STATUS);
  };

  const onShift = useCallback((held: boolean) => send({ type: 'shift', held }), [send]);
  const onPaint = useCallback((unitId: string, ids: readonly string[], mode: BrushMode) => {
    const unit = sceneRef.current.units.find((candidate) => candidate.id === unitId);
    if (!selectsTips(sessionRef.current) || !unit || unit.id !== sceneRef.current.activeUnitId) return;
    // A support deleted a moment ago can still be drawn until the mesh rebuilds.
    const alive = new Set(contactsOf(unit).map((contact) => contact.id));
    send({ type: 'paint', ids: ids.filter((id) => alive.has(id)), mode });
  }, [contactsOf, send]);

  /** Clear selection (button or Esc): at once, with Undo on a toast when anything was selected. */
  const clearSelection = useCallback(() => {
    const ids = [...sessionRef.current.selection];
    const unitId = sessionRef.current.activeUnitId;
    send({ type: 'clearSelection' });
    if (ids.length > 0 && unitId) offerUndo({ kind: 'clearSelection', ids, unitId });
  }, [offerUndo, send]);

  const undoToastAction = useCallback(() => {
    const current = toast;
    setToast(undefined);
    if (!current) return;
    if (current.action.kind !== 'clearSelection') {
      if (!undo()) setStatus('Nothing to undo here: leave the mode to undo earlier steps.');
      return;
    }
    // Supports deleted since are not selected again.
    const unit = sceneRef.current.units.find((candidate) => candidate.id === sessionRef.current.activeUnitId);
    const alive = new Set(unit ? contactsOf(unit).map((contact) => contact.id) : []);
    send({ type: 'restoreSelection', ids: current.action.ids.filter((id) => alive.has(id)) });
  }, [contactsOf, send, setStatus, toast, undo]);
  // The toast goes once its Undo would undo something else (a later edit, undo, leaving the mode).
  useEffect(() => {
    if (!toast) return;
    const now = { scene: history.present, mode: editMode, activeUnitId: activeUnit?.id, selectionSize: selection.size };
    if (!toastAlive(toast, now)) setToast(undefined);
    else if (toast.action.kind !== 'clearSelection' && toast.scene === undefined) setToast({ ...toast, scene: history.present });
  }, [activeUnit?.id, editMode, history.present, selection.size, toast]);

  // Exactly the selected supports go, in one undo step; the tool stays as it was.
  const deleteSelected = useCallback(() => {
    const unit = sceneRef.current.units.find((candidate) => candidate.id === sceneRef.current.activeUnitId);
    if (!unit) return;
    const alive = new Set(contactsOf(unit).map((contact) => contact.id));
    const ids = [...selection].filter((id) => alive.has(id));
    send({ type: 'clearSelection' });
    if (ids.length === 0) return;
    dispatch({ type: 'batch', commands: deleteCommands(unit, ids) });
    setStatus('Deleted 1 support.', { n: ids.length }, 'Deleted {n} supports.');
  }, [contactsOf, dispatch, selection, send, setStatus]);

  /** A committed Support shape value: the selected supports' own, or, with none selected, the object's defaults. */
  const onShapeChange = useCallback(<K extends SettingKey>(key: K, value: LiveSupportSettings[K], edit?: string) => {
    const unit = sceneRef.current.units.find((candidate) => candidate.id === sceneRef.current.activeUnitId);
    const ids = unit && editsSupports(sessionRef.current) ? liveSelection(sessionRef.current.selection, contactsOf(unit).map((contact) => contact.id)) : [];
    if (!unit || ids.length === 0) return onSettingChange(key, value, edit);
    const patch = shapePatch(shapeView(resolveSettings(unit.settings), unit.contactSettings, ids), key as ShapeKey, value as never);
    if (patch) dispatch({ type: 'contactSettings/set', unitId: unit.id, contactIds: ids, patch }, edit);
  }, [contactsOf, dispatch, onSettingChange]);

  const resetSelected = useCallback(() => {
    const unit = sceneRef.current.units.find((candidate) => candidate.id === sceneRef.current.activeUnitId);
    if (!unit || !editsSupports(sessionRef.current)) return;
    const ids = customisedAmong(unit.contactSettings, liveSelection(sessionRef.current.selection, contactsOf(unit).map((contact) => contact.id)));
    if (ids.length === 0) return;
    dispatch({ type: 'contactSettings/reset', unitId: unit.id, contactIds: ids });
    const message = { key: 'Reset 1 support to the defaults.', other: 'Reset {n} supports to the defaults.', vars: { n: ids.length } };
    setStatusMessage(message);
    offerUndo({ kind: 'resetCustomised', count: ids.length });
  }, [contactsOf, dispatch, offerUndo]);

  /**
   * The customised supports, selected: outside Support Edit Mode it enters the mode first. The mode
   * edits one object, so with none on the active object it makes the first selected object (in
   * list order) that has some active, and says how many sit on the others.
   */
  const selectCustomised = useCallback(() => {
    const current = sceneRef.current;
    const customisedOf = (unit: PrintUnit) => customisedAmong(unit.contactSettings, contactsOf(unit).map((contact) => contact.id));
    let unit = current.units.find((candidate) => candidate.id === current.activeUnitId);
    if (!unit) return;
    let ids = customisedOf(unit);
    let others = 0;
    let change: SceneCommand | undefined;
    if (ids.length === 0 && onBench(sessionRef.current)) {
      const withSome = current.units.filter((candidate) => current.selectedUnitIds.includes(candidate.id)).map((candidate) => ({ candidate, found: customisedOf(candidate) })).filter(({ found }) => found.length > 0);
      if (withSome.length === 0) return;
      const [first, ...rest] = withSome;
      unit = first!.candidate;
      ids = first!.found;
      others = rest.reduce((sum, { found }) => sum + found.length, 0);
      change = { type: 'selection/set', unitIds: current.selectedUnitIds, activeUnitId: unit.id };
      dispatch(change);
      // The session follows the scene in an effect; step it now so the mode can start on this object.
      send({ type: 'activeUnitChanged', id: unit.id, heavy: meshTier(triangleCount(unit), RUNTIME) === 'heavy' ? triangleCount(unit) : undefined });
    }
    if (onBench(sessionRef.current)) send({ type: 'enterEdit' });
    // Undo inside the mode stops at the scene it began with: the one with this object active.
    if (change) undoFloor.current = reduceScene(historyRef.current.present, change);
    if (!editsSupports(sessionRef.current)) return;
    send({ type: 'restoreSelection', ids });
    if (unit.id !== current.activeUnitId) {
      const vars = { n: ids.length, m: others, object: unit.name };
      setStatus(others > 0 ? '1 customised support selected on {object}. {m} more on other objects.' : '1 customised support selected on {object}.', vars, others > 0 ? '{n} customised supports selected on {object}. {m} more on other objects.' : '{n} customised supports selected on {object}.');
    } else setStatus('Selected 1 customised support.', { n: ids.length }, 'Selected {n} customised supports.');
  }, [contactsOf, dispatch, send, setStatus]);

  const { exporting, runExport } = useExport({ sceneRef, builtRef, exporter, dentureExport: denture.supports.exportFiles, runCheck, setStatus, setStatusMessage });

  // ---- Commands and keyboard -----------------------------------------------------------
  // Buttons and keys run registry commands (editing/commands); the key rules live in editing/keys.
  // The aliases (Done, the viewport Edit supports) run the command the registry says they run.
  const runCommand = useCallback((id: CommandId) => {
    switch (id) {
      case 'history.undo': return void undo();
      case 'history.redo': return dispatchHistory({ type: 'redo' });
      case 'view.models': return setModelVisible((visible) => !visible);
      case 'view.wireframe': return setWireframe((value) => !value);
      case 'objects.delete': return deleteUnits();
      case 'transform.select': return setGizmoMode('none');
      case 'transform.move': return setGizmoMode('translate');
      case 'transform.rotate': return setGizmoMode('rotate');
      case 'supports.generate': return generate();
      /*
       * "Aligner Support Production", so it starts an ALIGNER run. It used to open the in-flow type
       * card, which is gone (design doc §10, E1): detection takes the profile as an argument, so the
       * purpose has to be known before Step 1 rather than asked inside it. The batch's profile is
       * kept when the operator chose one and it is not a denture - this button's own label rules a
       * denture out - and otherwise the default aligner profile stands in.
       */
      case 'supports.dentalAuto':
        return send({ type: 'startDental', profile: batchProfile && !isDentureJob(batchProfile) ? batchProfile : DEFAULT_PROFILE_ID });
      case 'dental.useDetected': return orientRef.current.useDetected();
      case 'denture.resolveAll': {
        const unit = sceneRef.current.units.find((candidate) => candidate.id === sceneRef.current.activeUnitId);
        const entry = unit ? builtRef.current.get(unit.id) : undefined;
        // Resolving denture spots needs the build's own `unresolved` list, which a released build
        // does not carry: there is nothing to resolve on a unit that is already finished.
        return unit && entry?.unit === unit && hasGeometry(entry.mesh)
          ? denture.supports.resolveAll(unit.id, entry.mesh.unresolved ?? [])
          : undefined;
      }
      case 'dental.next': return orientRef.current.next();
      case 'dental.generate': {
        const unit = sceneRef.current.units.find((candidate) => candidate.id === sceneRef.current.activeUnitId);
        if (!unit || sessionRef.current.mode !== 'dental' || sessionRef.current.dentalStage !== 'area') return;
        const reviewed = currentDentalPreview(unit, dentalPreview);
        if (!reviewed || reviewed.result.points.length === 0) return setStatus('No safe dental tips are ready. Review the marked area.');
        if (!generateDental(reviewed)) return setStatus('The model changed while dental tips were reviewed. Wait for the new preview.');
        // The label starts as X (the field's default) and is stored with the aligner's settings.
        dispatch({ type: 'settings/set', unitId: unit.id, settings: { ...resolveSettings(unit.settings), labelText: dentalLabelOf(resolveSettings(unit.settings).labelText) } as SupportSettings });
        send({ type: 'acceptDentalArea' });
        // Step 3's panel covers the right of the viewport: the aligner is framed in what is left.
        return requestView('fit', stepPanelInset({ mode: 'dental', dentalStage: 'review' }));
      }
      case 'dental.back': {
        // Going back from Step 3 throws its hand work away: ask first.
        const unit = sceneRef.current.units.find((candidate) => candidate.id === sceneRef.current.activeUnitId);
        if (sessionRef.current.dentalStage === 'review' && backNeedsConfirm(unit)) return setBackAsk(true);
        /*
         * BACK AT STEP 1 STEPS OUT TO THE CASE, not out of the session (E1b). It used to send `exit`
         * and show the Drop page, which discarded `dentalFinished` - so with a case of eight, going
         * back from the second item lost the first one's finished mark. Now the session stays and the
         * Items page comes up over it, which is the first time a LIVE dental session and a start
         * screen are on screen together.
         *
         * What that costs, stated rather than assumed: the workspace unmounts with the start screen,
         * and the only `<Canvas>` is inside it, so the renderer is disposed and the models re-upload
         * when a row is opened. That is the same cost the workspace already pays on every mount, and
         * nothing the SESSION holds lives in the canvas. The jobs do not survive, and must not: both
         * flows are invalidated right here, because the orientation being computed belongs to the unit
         * the operator is walking away from.
         *
         * `startItem` already re-enters without exiting, so the way back needed no change.
         *
         * An EMPTY plate goes to Drop instead: Items with no rows is a page about a case that does not
         * exist yet, and its own Back would be the only thing on it.
         */
        if (sessionRef.current.dentalStage === 'aligner') {
          dentalFlow.invalidate();
          denture.orient.invalidate();
          setBackAsk(false);
          send({ type: 'backDental' });
          return setStartScreen(sceneRef.current.units.length > 0 ? 'items' : 'drop');
        }
        return send({ type: 'backDental' });
      }
      case 'dental.exit': {
        // Whatever Step 1 or Step 2 still reads or detects is dropped.
        dentalFlow.invalidate();
        denture.orient.invalidate();
        // The aligner being worked on goes back to a normal model without supports; finished aligners stay as they are.
        const { dentalUnitId, dentalFinished } = sessionRef.current;
        const current = sceneRef.current.units.find((candidate) => candidate.id === dentalUnitId);
        if (current && !dentalFinished.includes(current.id)) denture.supports.leave(current.id);
        const cleanup = exitCommands(current, dentalFinished);
        if (cleanup.length > 0) dispatch({ type: 'batch', commands: cleanup });
        setBackAsk(false);
        /*
         * STRAIGHT TO THE WORKSPACE, and FLOW_END does NOT change that. Routing Exit to the start
         * screen was tried and the walk caught it: this command's own hint promises "the aligner
         * stays on the plate without supports", which is a promise about the workspace, and landing
         * on the start screen hides the very object it just told the operator about. FLOW_END is
         * about where the LAST STEP ends, not about the escape hatch.
         */
        return send({ type: 'exit' });
      }
      case 'dental.finish': case 'dental.addAnother': {
        const { dentalUnitId, dentalFinished, dentalStage } = sessionRef.current;
        const unit = sceneRef.current.units.find((candidate) => candidate.id === dentalUnitId);
        if (!unit || dentalStage !== 'review' || !unit.supports) return;
        const label = dentalLabelOf(resolveSettings(unit.settings).labelText);
        const commands: SceneCommand[] = [
          ...(resolveSettings(unit.settings).labelText === label ? [] : [{ type: 'settings/set' as const, unitId: unit.id, settings: { ...resolveSettings(unit.settings), labelText: label } as SupportSettings }]),
          ...arrangeAlignerCommands(sceneRef.current.units, [...dentalFinished, unit.id]),
        ];
        if (commands.length > 0) dispatch({ type: 'batch', commands });
        const count = new Set([...dentalFinished, unit.id]).size;
        if (id === 'dental.addAnother') {
          send({ type: 'addAnotherDental', unitId: unit.id });
          requestView('fit');
          return setStatus('{name} finished. Add the next aligner of the same type.', { name: unit.name });
        }
        send({ type: 'finishDental', unitId: unit.id });
        requestView('fit');
        setDoneHint(count);
        return setStatus('Finished {n} aligner on the plate. Export STL or Save project to keep it.', { n: count }, 'Finished {n} aligners on the plate. Export STL or Save project to keep them.');
      }
      case 'mode.edit': {
        send({ type: 'enterEdit' });
        const unit = sceneRef.current.units.find((candidate) => candidate.id === sceneRef.current.activeUnitId);
        if (sessionRef.current.mode === 'edit' && unit && !unit.supports) setStatus('No supports on {name} yet. Click the model to add one, or press Generate in the bar.', { name: unit.name });
        return;
      }
      case 'edit.generate': return generate(sceneRef.current.activeUnitId ? [sceneRef.current.activeUnitId] : undefined);
      case 'mode.zones': return send({ type: 'enterZones' });
      case 'mode.exit': return send({ type: 'exit' });
      // `setDentalTool`, not `setTool`: a dental step opens with no tool in hand, and choosing one ARMS it.
      case 'dental.tool.paint': return send({ type: 'setDentalTool', tool: 'paint' });
      case 'dental.tool.erase': return send({ type: 'setDentalTool', tool: 'erase' });
      case 'dental.tool.add': return send({ type: 'setDentalTool', tool: 'add' });
      case 'dental.tool.select': return send({ type: 'setDentalTool', tool: 'select' });
      // Rim define mode. Place and Adjust only change what the next drag means; the drawing itself is
      // scene state, so Close and Clear go through scene commands and the ordinary history undoes them.
      /*
       * The way back in. A drawing already on the unit is left alone - that is what coming back is
       * for - but an aligner whose rim was DETECTED has none, so it is seeded with detection's own
       * loop (`seedRimDraft`). Without that, "Redraw the rim" would throw away a working rim and
       * hand back an empty model, which is a different and much worse offer than correcting one.
       *
       * THE WAY BACK IS CANCEL, NOT UNDO, and this comment said the opposite until walk `u9c` proved
       * it wrong. The history is scoped to the mode ("Nothing to undo here: leave the mode to undo
       * earlier steps"), and the seed goes in as the mode opens, so Ctrl+Z inside rim define mode
       * does not reach it. Cancel does, and leaves the detected rim exactly as it was - which is the
       * property that actually matters, and the one `u9c` now asserts.
       */
      case 'dental.rim.enter': {
        const unit = sceneRef.current.units.find((candidate) => candidate.id === sessionRef.current.dentalUnitId);
        /*
         * THE UNIT'S OWN RIM IS A SEED TOO, and without it "edit the rim I just confirmed" meant
         * drawing it again from nothing. Done stores the drawing in the policy and CLEARS the draft,
         * so on the way back in there is no draft - and on a shape detection could not orient there is
         * no proposal either, which is exactly the case rim define mode exists for. The operator's own
         * rim was sitting in `unit.dental.rim` and nothing read it.
         */
        const detectedRim = sessionRef.current.dentalProposal?.rim ?? unit?.dental?.rim;
        /*
         * SEED WHEN THERE IS NOTHING, AND RE-SEED WHEN WHAT IS THERE IS ONLY AN OLD SEED.
         *
         * The second half is the fix for a stale trace. `rim/clear` runs on Clear and Done only, so a
         * seed survives Cancel; re-orienting then changes the detected rim and this opened on a loop
         * tracing the rim that had been replaced. An UNTOUCHED seed is not the operator's work - the
         * first edit drops `rimDraftSeeded` - so replacing it destroys nothing, and re-seeding is
         * idempotent when detection has not moved. A draft the operator has touched is never replaced.
         */
        if (unit && detectedRim && (!unit.rimDraft || unit.rimDraftSeeded === true)) {
          const seeded = seedRimDraft(detectedRim);
          if (seeded) dispatch({ type: 'rim/set', unitId: unit.id, path: seeded, seeded: true });
        }
        /*
         * NOTHING IS CHOSEN ON THE WAY IN. This used to send the tool a closed loop needed, because
         * `appendAnchor` refuses a closed path and opening on Place handed over a control that could
         * not act. One tool did not fix that, it made it unsayable: the target under the press decides
         * (`dental/rim/rimTarget.ts`), so a closed loop simply has nothing to append to. The event has
         * no payload - it was still being passed one, silently dropped, when this was cleaned up.
         */
        return send({ type: 'dentalRimReopen' });
      }
      case 'dental.rim.close': {
        const unit = sceneRef.current.units.find((candidate) => candidate.id === sessionRef.current.dentalUnitId);
        const closed = unit?.rimDraft && closePath(unit.rimDraft);
        if (unit && closed) dispatch({ type: 'rim/set', unitId: unit.id, path: closed });
        return;
      }
      case 'dental.rim.deletePoint': return onRimDeletePoint();
      // Done: the drawing becomes the rim, and Step 1 takes it from there.
      case 'dental.rim.done': return onRimDone();
      case 'dental.rim.clear': {
        const unitId = sessionRef.current.dentalUnitId;
        if (unitId) dispatch({ type: 'rim/clear', unitId });
        /*
         * AND THE PICK GOES WITH THE POINTS. `rimDeleteReason` only bounds-checks the picked index, so
         * a pick left behind by Clear reads as "nothing picked" while the drawing is empty and comes
         * BACK the moment enough new points exist to fill its index - Delete point then lights up
         * aimed at a point the operator never touched (walk `u5e2`). The Adjust button used to reset
         * the pick as a side effect of choosing a tool; with the tools gone, Clear has to say so itself.
         */
        send({ type: 'setDentalRimSelected', at: undefined });
        return;
      }
      case 'edit.add': return send({ type: 'setAddAction', action: 'add' });
      case 'edit.remove': return send({ type: 'setAddAction', action: 'remove' });
      case 'edit.dragSelect': return send({ type: 'setBrushMode', mode: 'select' });
      case 'edit.dragUnselect': return send({ type: 'setBrushMode', mode: 'unselect' });
      case 'setting.clickReach': return; // a field: set through its input
      case 'edit.clearSelection': return clearSelection();
      case 'edit.deleteSelection': return deleteSelected();
      case 'shape.reset': return resetSelected();
      case 'shape.selectCustomised': return selectCustomised();
      case 'objects.selectAll': return dispatch({ type: 'selection/set', unitIds: sceneRef.current.units.map((unit) => unit.id), ...(sceneRef.current.units[0] ? { activeUnitId: sceneRef.current.activeUnitId ?? sceneRef.current.units[0].id } : {}) });
      case 'supports.clearManual': return clearManual();
      case 'supports.remove': return removeSupports();
      case 'check.run': return checkSupports();
      case 'project.open': return chooseProject();
      case 'project.save': return void saveProject();
      case 'view.fit': return requestView('fit', stepPanelInset(sessionRef.current));
      case 'view.bottom': return requestView('bottom');
      case 'zones.clearAll': return clearActiveZones();
      /*
       * STEP 3'S OWN EXPORT: the aligner and its supports, one file, and the step stays up (FLOW_END).
       *
       * IT MARKS THE ALIGNER FINISHED FIRST, and that is not bookkeeping tidiness - it is the whole
       * reason this case is more than one line. `exitCommands` (dental/flow.ts) removes the supports
       * and the dental policy of any unit NOT in `dentalFinished`, and OK was the only thing that
       * ever added one. With OK gone, Export wrote the file and then Exit stripped the plate of what
       * had just been written. A review caught it; no walk check did, because none of them pressed
       * Exit after Export - the handover, not the step.
       *
       * Session event only, before the export, deliberately: it changes no unit, so the build the
       * export is about to read stays valid. Marking it finished by ARRANGING the plate instead
       * would move the unit, drop its build, and make `runExport` refuse the export as stale.
       */
      case 'dental.export': {
        const { dentalUnitId, dentalStage } = sessionRef.current;
        const unit = sceneRef.current.units.find((candidate) => candidate.id === dentalUnitId);
        if (!unit || dentalStage !== 'review' || !unit.supports) return;
        send({ type: 'exportedDental', unitId: unit.id });
        return void runExport('active-printable');
      }
      case 'export.active-printable': case 'export.active-supports': case 'export.separate-printable': case 'export.separate-supports': case 'export.whole-printable': return void runExport(exportKindOf(id));
    }
  }, [checkSupports, chooseProject, saveProject, clearActiveZones, clearManual, clearSelection, deleteSelected, deleteUnits, dentalPreview, dispatch, generate, generateDental, removeSupports, requestView, resetSelected, runExport, selectCustomised, send, setStatus, undo]);

  /** A start screen was reached. Back goes one step and removes nothing: the loaded aligner stays on the plate. */
  const [startKind, setStartKind] = useState<DentalKind>('aligner');
  const goStart = (next: ChooserScreen, kind: DentalKind = 'aligner') => { setStartKind(kind); setStartScreen(next); };
  /**
   * Begin the dental flow on one item of the Items page. THE ORDER IS THE WHOLE SUBTLETY, and
   * `src/items/nextItem.ts` records why:
   *
   *  1. the scene must point at this unit FIRST — `startAligner`'s staleness check reads
   *     `sceneRef.current.activeUnitId` and abandons the orient job if it is not the unit it was given;
   *  2. then the session has to be in stage `aligner`, because `dentalLoading` is a no-op outside it.
   *     From `review` that is `addAnotherDental`, which preserves `dentalFinished`; on the first item
   *     the session is still `off`, so `startDental` opens the flow — and resetting `dentalFinished`
   *     is correct there, since nothing has been finished yet.
   */
  const startItem = (unit: PrintUnit, tool?: ToolId) => {
    /*
     * NO SYNCHRONOUS GUARD HERE, AND THE REASON IS WORTH MORE THAN THE GUARD WAS.
     *
     * Remove and Start reach one unit in a single tick easily: both controls are on screen, both
     * aimed at the row the rail shows, and `onStart` closes over a unit OBJECT rather than a live
     * lookup. The obvious guard - look the unit up in `sceneRef.current` and refuse if it has gone -
     * was written here first and **it cannot fire**. `sceneRef.current` is updated on RENDER, and
     * the render has not happened when the second click of the same tick runs, so the removed unit
     * is still in it. (`useImportFiles` carries the same warning about the same ref; I read it and
     * made the mistake anyway, which is why it is restated at the second site.) A guard that can
     * never fire is a dead control wearing safety's clothes, so it is gone rather than kept.
     *
     * What actually holds this is the invariant effect further down ("the flow cannot be open on a
     * unit that is not on the plate"), which runs on RENDERED state where the scene is current - and
     * which recovers from every way a unit can leave under the flow, not just from this race.
     */
    dispatch({ type: 'selection/set', unitIds: [unit.id], activeUnitId: unit.id });
    const live = sessionRef.current;
    /*
     * THE PRESSED TOOL, FOR THE ROWS THE DETECTOR FLAGGED (increment E4).
     *
     * `rimPressed` is true only when the operator pressed RIM on a row whose batch detection came
     * back `no-rim` - the deck's own "No rim found. Draw one to continue." Opening that row at Step 1
     * re-ran `dentalOrient` to be told what the row already said, and only then handed over to
     * drawing. Any other tool, and any row the detector did not flag, keeps today's behaviour: the
     * model opens at the start of its flow. Whether a rim that WAS detected may be redrawn is the
     * owner's call and is not decided here.
     */
    const rimPressed = tool === 'rim' && batchDetected.get(unit.id)?.kind === 'no-rim' && !isDentureJob(live.dentalProfile);
    if (live.mode !== 'dental') {
      setStartScreen(null);
      /*
       * TWO FIXES LIVE IN THIS BRANCH, and the comment above this function used to state the premise
       * that made both wrong: "on the first item the session is still `off`". Mode `off` does NOT
       * mean nothing has been finished - `finishDental` leaves the mode off and keeps the finished
       * list - so this branch is also how the SECOND and later items of a case are opened.
       *
       *   - `resume` keeps `dentalFinished`. Without it the finished rows lost their mark and
       *     `exitCommands` stopped sparing them, so Exit on a reopened one removed supports that had
       *     already been exported.
       *   - `startDentalAligner` is called here too. It used to `return` instead, and nothing else
       *     starts the read: the auto-start effect in `useDentalFlow` fires only on a profile CHANGE
       *     while already loading. So the press landed on Step 1's "choose a file" prompt with the
       *     row's model already on the plate, and the way on was a second control.
       */
      send({ type: 'startDental', profile: live.dentalProfile ?? batchProfile ?? DEFAULT_PROFILE_ID, resume: true });
      return rimPressed ? dentalFlow.startRimDrawing(unit) : startDentalAligner(unit);
    }
    setStartScreen(null);
    if (live.dentalStage === 'review' && live.dentalUnitId) send({ type: 'addAnotherDental', unitId: live.dentalUnitId });
    if (rimPressed) return dentalFlow.startRimDrawing(unit);
    startDentalAligner(unit);
  };
  /*
   * A RAIL PRESS, from the deck: it opens the MODEL, at the start of its flow.
   *
   * There WAS a `toolEntry` module here that walked `backDental` to the pressed tool, and it is
   * deleted rather than fixed. Three independent reasons, all found by review after it shipped:
   *   - It was unreachable. The rail lives on the deck, the deck renders only while
   *     `startScreen === 'items'`, and every route to a start screen sends `exit` first - so
   *     `mode === 'dental'` and the deck on screen cannot both be true. The branch never ran.
   *   - It hard-coded the aligner stage spine. A denture skips `area` (`stageBeforeSupports`), so
   *     one press too many would have thrown the operator onto the type screen with `dentalUnitId`
   *     cleared and an orient job still live.
   *   - It bypassed a guard it claimed to respect. Back out of Step 3 asks for confirmation and
   *     discards hand work (`dental/flow.ts`), and that guard lives in the COMMAND handler, not the
   *     reducer - so sending `backDental` straight at the reducer skipped both.
   * Per-tool entry belongs with the workspace, where the rail is on screen during the flow and the
   * press can go through the same command the operator's own Back does.
   */
  // The footer says what each start screen asks for (the file step in the job kind's words).
  useEffect(() => { if (startScreen !== null) setStatusMessage({ key: startScreen === 'file' ? fileStepText(startKind).status : START_HINT[startScreen] }); }, [startScreen, startKind]);
  const startDental = (profile: string, file?: File) => {
    freshStart.current = file !== undefined;
    setStartScreen(null);
    send({ type: 'startDental', profile, ...(file ? { file } : {}) });
  };
  /*
   * THE FLOW CANNOT BE OPEN ON A UNIT THAT IS NOT ON THE PLATE (gap register W-09, walk `q6`).
   *
   * WHAT THE FAULT LOOKED LIKE. Remove and Start on one row in one tick: the removal and the flow
   * entry both go through, and then every downstream guard works exactly as written and still leaves
   * the operator somewhere no screen describes. The selection reducer drops an id the scene has not
   * got, so `activeUnitId` is empty; `startAligner` abandons its orient job because the active unit
   * is not the one it was handed; `setStartScreen(null)` had already shut the deck; and the gesture
   * that draws the dental bar needs an active unit, so no step is drawn either. The probe found the
   * deck gone, no badge, the GENERIC editor panels on screen, two models on the plate, nothing
   * selected - and the status line still saying "Drop an aligner STL... then press Next". The mode
   * was on underneath with nothing drawn to leave it by.
   *
   * WHY IT IS AN EFFECT AND NOT A GUARD. `startItem`'s comment has the long version: a guard there
   * reads `sceneRef.current`, which is a render behind, so it cannot see a removal from the same
   * tick. This runs on RENDERED state, where `scene` and `session` are both current - so it does not
   * care which of the two actors won, or in what order, or by what route the unit left. A dropped
   * unit, an undone import and this race all converge here.
   *
   * RECOVERY, NOT A REFUSAL. The flow closes and the deck comes back, which is a world every
   * observer agrees on and one the operator can read: their row is visibly gone from a list they
   * were already looking at. `START_HINT` then writes the deck's own line, which is true, so this
   * deliberately adds no sentence of its own - an explanation nobody needs is one more thing to
   * translate and keep true.
   */
  useEffect(() => {
    if (session.mode !== 'dental' || !session.dentalUnitId) return;
    if (scene.units.some((unit) => unit.id === session.dentalUnitId)) return;
    send({ type: 'exit' });
    setStartScreen(scene.units.length > 0 ? 'items' : 'drop');
  }, [scene.units, session.mode, session.dentalUnitId, send]);

  // Closing the last model returns to the start and leaves any step, so the next type choice starts afresh.
  const unitCount = scene.units.length;
  const lastUnitCount = useRef(unitCount);
  useEffect(() => {
    if (lastUnitCount.current > 0 && unitCount === 0) {
      send({ type: 'exit' });
      setStartScreen('drop');
    }
    lastUnitCount.current = unitCount;
  }, [unitCount, send]);

  const dropImport = (event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();
    setIsDraggingOver(false);
    const files = [...event.dataTransfer.files];
    const project = files.find((file) => isProjectFile(file.name));
    void (project ? openProject(project, files.length > 1) : importFiles(files));
  };

  const contactCounts = activeUnit ? {
    auto: activeContacts.filter((contact) => !contact.id.startsWith('manual-')).length,
    manual: activeUnit.manual.length,
    removed: unitRemovedCount(activeUnit),
  } : undefined;
  const selectedCount = scene.selectedUnitIds.length;
  const scopeLabel = selectedCount > 0 ? t('{n} selected', { n: selectedCount }) : t('all {n}', { n: scene.units.length });
  // Once every unit in scope has supports, the one generate action becomes Regenerate.
  const scopeUnits = targets(scene);
  const scopeGenerated = scopeUnits.length > 0 && scopeUnits.every((unit) => unit.supports);
  // A placement setting changed in Support Edit Mode waits for Regenerate; leaving the mode does not run it.
  const scopePending = !generating && !regenQueued && scopeUnits.some(placementPending);
  // What the registry's rules read (editing/commands); Undo stops at the mode's floor.
  const ui: UiState = {
    mode: editMode, activeName: activeUnit?.name, supported: scene.units.some((unit) => unit.supports), zones: activeUnit?.zones.length ?? 0, exporting, active: Boolean(activeUnit), heavy: activeHeavy, units: scene.units.length, selectedObjects: selectedCount, tool: session.tool, addAction: session.addAction, method: session.selectStyle, dragAction: effectiveBrushMode(session.brushMode, session.shiftHeld),
    selection: selection.size, customisedActive, customisedSelected, customisedTargeted: bandCounts.customised, customisedOthers: Math.max(0, bandCounts.customised - customisedActive), activeSupported: Boolean(activeUnit?.supports), generating, dentalPreviewReady: Boolean(dentalPreview?.result.points.length), dentalReviewReady: Boolean(activeUnit?.supports && built.get(activeUnit.id)?.unit === activeUnit), dentalBuildFailed: Boolean(activeUnit && failedBuilds.get(activeUnit.id) === activeUnit), dentalStage: session.dentalStage, ...(session.dentalRimSelected === undefined ? {} : { dentalRimSelected: session.dentalRimSelected }),
    dentalRimAnchors: activeUnit?.rimDraft?.anchors.length ?? 0, dentalRimClosed: activeUnit?.rimDraft?.closed ?? false,
    ...(activeUnit?.rimDraft && pathProblems(activeUnit.rimDraft)[0] ? { dentalRimProblem: pathProblems(activeUnit.rimDraft)[0] } : {}), dentalAlignerReady: session.dentalAligner === 'ready', dentalTiltBusy: orientFlow.tilt?.unitId === activeUnit?.id && (orientFlow.tilt?.status === 'scanning' || (orientFlow.tilt?.status === 'ready' && orientFlow.tilt.confirming)), dentalProposed: Boolean(session.dentalProposal) || (denture.active && denture.orient.proposed), dentalKind: denture.active ? 'denture' : 'aligner', dentureResolvable: activeMesh?.unresolved?.filter(denture.supports.resolvable).length ?? 0, canUndo, canRedo: history.future.length > 0, undoStep, redoStep, modelsVisible: modelVisible, wireframe, generated: scopeGenerated,
  };
  const command = (id: CommandId) => resolve(id, ui);
  // Denture Step 2: the add-on parts of a multi-part file, tinted on the model (src/denture/parts).
  const addOnTint = denture.active && activeUnit?.denture ? dentureAddOnTint(activeUnit.source, currentBuild(activeUnit, heldBuilds.get(activeUnit.id))) : undefined;
  // Dental Step 3's settings, findings and the answer to Back (see components/DentalSupports).
  const reviewTuning = dentalTuning.tuning;
  const verdictEntry = activeUnit ? problems.get(activeUnit.id) : undefined;
  const verdictBehind = Boolean(activeUnit && verdictEntry && (verdictEntry.unit !== activeUnit || verdictEntry.mesh !== currentBuild(activeUnit, built.get(activeUnit.id))));
  // The Tree and Brace switches of an aligner, or the lattice of a denture (its Cross-braces).
  const reviewStructure = activeUnit?.dental?.kind === 'two-contour' && reviewTuning
    ? { structure: activeUnit.dental.structure ?? defaultDentalStructure, onStructure: onDentalStructureChange }
    : activeUnit?.denture ? { structure: { treeEnabled: false, bracesEnabled: activeUnit.denture.policy.lattice }, onStructure: (next: { bracesEnabled: boolean }) => denture.supports.setLattice(activeUnit.id, next.bracesEnabled) } : undefined;
  const dentalReview: DentalReview | undefined = activeUnit && reviewStructure ? {
    settings: activeSettings,
    onSetting: onSettingChange,
    ...reviewStructure,
    clickReach: { value: activeSettings.eraseRadius, onChange: (value, edit) => onSettingChange('eraseRadius', value, edit) },
    verdictPending: generating || regenQueued || dentalTuning.busy || verdictBehind || building(activeUnit),
    /*
     * A build has landed for this object at some point. `built` keeps its entry when a settings change makes
     * that entry stale, which is exactly the window the panels need to dim rather than blank; `problems` (the
     * check's verdict) is the WRONG signal here, because Step 3 shows a verdict before anyone presses Check.
     */
    buildLanded: Boolean(activeUnit && built.get(activeUnit.id)),
    rimGap: dentalRimGap,
    structureFallback: activeMesh?.dentalStructureFallback,
    problems: listedProblems,
    outOfDate,
    rechecking: isRechecking,
    unitName,
    onShow: showProblem,
    onFix: fixProblem,
    onShowRim: () => requestView('bottom'),
    finishedCount: session.dentalFinished.length,
    backAsk: backAsk ? manualEditCounts(activeUnit) : undefined,
    onBackConfirm: () => { setBackAsk(false); const commands = discardManualCommands(activeUnit); if (commands.length > 0) dispatch({ type: 'batch', commands }); send({ type: 'backDental' }); },
    onBackCancel: () => setBackAsk(false),
  } : undefined;
  // Denture Step 2 checks each finished build by itself: its status line counts the problems.
  const dentureBuild = denture.active && session.mode === 'dental' && session.dentalStage === 'review' && activeUnit?.denture && ui.dentalReviewReady ? currentBuild(activeUnit, built.get(activeUnit.id)) : undefined;
  useAutoCheck({ build: dentureBuild, checked: Boolean(dentureBuild && verdictEntry?.unit === activeUnit && verdictEntry?.mesh === dentureBuild), canRun: command('check.run').enabled && !generating, run: () => runCommand('check.run') });
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      // A modal dialog owns the keyboard while it is open: Escape has to close it, and an editor shortcut
      // that calls preventDefault() behind it would stop the browser doing so.
      if (document.querySelector('dialog[open]')) return;
      const action = keyAction({
        key: event.key,
        ctrl: event.ctrlKey || event.metaKey,
        shift: event.shiftKey,
        target: event.target as HTMLElement | null,
        ui,
      });
      if (action.preventDefault) event.preventDefault();
      if (action.command) runCommand(action.command);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [runCommand, ui]);
  const locked = (section: Parameters<typeof sectionLocked>[0]) => sectionLocked(section, editMode);
  /** Locked sections are inert, so a click on one falls through to its panel: say why and pulse the note. */
  const blockedClick = (panel: Panel) => (event: React.MouseEvent<HTMLElement>) => {
    const { mode } = sessionRef.current;
    if (mode === 'off') return;
    const onLocked = [...event.currentTarget.querySelectorAll('[inert]')].some((element) => {
      const box = element.getBoundingClientRect();
      return event.clientX >= box.left && event.clientX <= box.right && event.clientY >= box.top && event.clientY <= box.bottom;
    });
    if (!onLocked) return;
    setStatusMessage(busyStatus(mode));
    setPulse((current) => ({ panel, seq: current.seq + 1 }));
  };
  const lockNoteOf = (panel: Panel) => {
    const note = lockNote(panel, editMode);
    return note && <p key={pulse.panel === panel ? pulse.seq : 0} className="lock-note" role="note">{translateMessage(note)}</p>;
  };

  return <main>
    <header>
      <div className="brand"><h1><BrandLogo /></h1><small>{t('Resin Support Studio')}</small></div>
      <div className="header-actions">
        <LanguageSelect lang={lang} onChange={chooseLanguage} />
        {startScreen === null ? <>
          {/*
            NO UNDO IN STEP 1. There is nothing to undo there: the step changes no scene state of its own,
            and the support area it detects is deliberately held outside the undo stack, so the two keys
            would stand permanently dead. The step's own way back is Restore, in its panel.
          */}
          {editMode === 'dental' && session.dentalStage === 'aligner' ? null : <div className="toolbar-group">
            <CommandButton command={command('history.undo')} run={runCommand} />
            <CommandButton command={command('history.redo')} run={runCommand} />
          </div>}
          <div className="toolbar-group">
            <CommandButton command={command('view.wireframe')} run={runCommand} />
          </div>
        </> : null}
        {session.mode === 'dental' ? <CommandButton command={command('dental.exit')} run={runCommand} className="nav-exit" /> : null}
      </div>
    </header>
    {/*
      * THE BACKGROUND-WORK LIST IS MOUNTED ON THE DECK TOO (found by audit, walk `r3`, G5).
      *
      * It lives inside the viewport, and the viewport is not rendered while a start screen is up - so
      * on the deck, which is where the LONGEST background work in the app runs (one orient per row,
      * minutes on a full case), the one screen that remembers a failure did not exist. A crashed
      * analysis worker left its mark on one row's sentence and nowhere else, and W-05's and W-07's
      * whole argument is that a sentence which the next message can replace is not a screen.
      *
      * Two mount points for one panel, and they are exclusive: these branches never render together,
      * and `jobActivity` is a module singleton, so there is one list either way.
      *
      * THE DEBT WAS FILED AGAINST THE WRONG THING. It said the proper fix was to hoist this to the app
      * root, and that `.job-activity` being positioned by three viewport-state rules
      * (`viewport--editing`, `viewport--step3`, `workspace--dental`) made it a layout change. But the
      * root is where those ancestor classes are NOT, so hoisting would mean re-expressing every one of
      * them on the element itself - work with no behaviour to show for it. Two mounts in exclusive
      * branches are not the problem.
      *
      * WHAT THEY DIFFERED IN WAS, and it was the same silence W-12 is about. The viewport passed
      * `stagedBar` and this did not, so an ORIENT - the one analysis job a drop or a purpose press
      * starts here (`useDentalFlow`, label `Orienting {name}`, which `stagePlanOf` gives SCAN_PLAN) -
      * drew its staged progress in the viewport and a bare row on the deck. The deck is where orients
      * actually run. Both pass it now, so the two mounts are the same panel rather than two that have
      * drifted.
      */}
    {startScreen === 'items' ? <><JobActivityPanel stagedBar={stagedJobBar} /><ItemsPage units={scene.units} finished={session.dentalFinished} lang={lang}
      refused={refusedFiles} detected={batchDetected} thumbnails={thumbnails}
      selectedUnitId={scene.activeUnitId}
      onSelect={(unit) => dispatch({ type: 'selection/set', unitIds: [unit.id], activeUnitId: unit.id })}
      denture={isDentureJob(session.dentalProfile ?? batchProfile)}
      onStart={startItem}
      /*
       * REMOVE OFFERS UNDO, because deleting on the plate already does and this takes the same thing
       * away (found by audit, W-06). A finished, exported row and its supports went in one click with
       * no confirmation and no way back; `deleteUnits` has offered an undo for the same command all
       * along. An offer rather than a confirm: the press is deliberate, and a dialog on every removal
       * of a bad file would be in the way.
       */
      onRemove={(unit) => {
        dispatch({ type: 'unit/remove', unitId: unit.id });
        setStatusMessage(undoToast(0, { kind: 'deleteObjects', count: 1 }).message);
        offerUndo({ kind: 'deleteObjects', count: 1 });
      }}
      onBack={() => setStartScreen('drop')}
      onFiles={(files) => void importFiles(files, { takesOne: false, onRefused: setRefusedFiles })} /></>
      : startScreen !== null ? <StartScreen screen={startScreen} profile={session.dentalProfile} lang={lang}
      onScreen={goStart} onAnyModel={() => setStartScreen(null)} onOpenProject={() => runCommand('project.open')}
      onProjectFile={(file) => void openProject(file)} onStart={startDental}
      onFiles={(files, profile) => {
        // The purpose pressed for the whole batch. Held here rather than in the session, because the
        // session's profile is set by entering a unit's flow and this batch has started none - and
        // `dentalOrient` needs it the moment the batch runs (plan §0b step 2).
        setBatchProfile(profile);
        // ONLY GO TO THE ITEMS PAGE IF SOMETHING ARRIVED. `importFiles` reports a refusal through the
        // status line and resolves normally, so switching unconditionally landed a drop of entirely
        // bad files on an EMPTY page with no way back: the auto-escape only fires when the count
        // falls from above zero, and this page had no Back. It now has one, and this is the second
        // guard rather than the only one.
        setRefusedFiles([]);
        void importFiles(files, {
          onAdded: (count) => { if (count > 0) setStartScreen('items'); },
          // A refused file is a ROW, so a drop where every file fails still has somewhere to say so.
          onRefused: (refusals) => { setRefusedFiles(refusals); if (refusals.length > 0) setStartScreen('items'); },
        });
      }}
      onUnsupported={() => setStatusMessage(errorStatus('import', new CodedError('file-type', 'file-type')))} /> : <>
    <section className={`workspace${editMode === 'dental' ? ' workspace--dental' : ''}`}>
      {editMode !== 'dental' ? <aside className="panel left" onClick={blockedClick('left')}>
        {lockNoteOf('left')}
        <label className="drop" {...(locked('import') ? { inert: '' } : {})} title={t('Choose STL, GLB or glTF files, or drop them on the viewport')}>
          <input type="file" aria-description={t('Choose STL, GLB or glTF files, or drop them on the viewport')} multiple accept=".stl,.glb,.gltf" onChange={(event) => { void importFiles([...(event.target.files ?? [])]); event.target.value = ''; }} />
          <strong>{t('Import models')}</strong>
          <small>{t('STL, GLB or glTF. Files stay on this device.')}</small>
        </label>
        <div className="project-row" {...(locked('import') ? { inert: '' } : {})}>
          <CommandButton command={command('project.open')} run={runCommand} />
          <CommandButton command={command('project.save')} run={runCommand} />
        </div>
        <ObjectList
          scene={scene}
          supportCount={(unit) => unitContacts(unit, built.get(unit.id)?.mesh).length}
          building={building}
          onSelect={onSelect}
          selectAllCommand={command('objects.selectAll')}
          deleteCommand={command('objects.delete')}
          locked={locked('objects')}
          run={runCommand}
        />
        <PlatePanel cases={scene.units.length} locked={locked('objects')} onArrange={plate.arrange} />
        <section {...(locked('transform') ? { inert: '' } : {})}>
          <h3>{t('Transform')}</h3>
          <Segmented value={gizmoMode} onChange={setGizmoMode} disabled={!command('transform.move').enabled} options={([['none', 'transform.select'], ['translate', 'transform.move'], ['rotate', 'transform.rotate']] as const).map(([value, id]) => {
            const { label, hint: text, shortcut } = command(id);
            return { value, label: t(label), hint: text, ...(shortcut ? { shortcut } : {}) };
          })} />
        </section>
        <section {...(locked('supports') ? { inert: '' } : {})}>
          <h3>{t('Supports for {scope}', { scope: scopeLabel })}</h3>
          <CommandButton command={command('supports.generate')} run={runCommand} {...(scopeGenerated ? { className: scopePending ? 'regen attention' : 'regen' } : {})} />
          <CommandButton command={command('supports.dentalAuto')} run={runCommand} />
          <CommandButton command={command('supports.clearManual')} run={runCommand} />
          <CommandButton command={command('supports.remove')} run={runCommand} />
        </section>
        <ModeSections ui={ui} run={runCommand} zones={activeUnit?.zones.length} />
        <section className="support-check" {...(locked('check') ? { inert: '' } : {})}>
          <h3>{t('Check supports')}</h3>
          <CommandButton command={command('check.run')} run={runCommand} />
          <ProblemList problems={listedProblems} outOfDate={outOfDate} rechecking={isRechecking} unitName={unitName} kindOf={unitKind} onShow={showProblem} onFix={fixProblem} />
          <p className="help">{t('Finds islands and overhangs no contact reaches, before you print.')}</p>
        </section>
      </aside> : null}
      <section
        className={`viewport${isDraggingOver ? ' viewport--dropping' : ''}${VIEWPORT_CLASS[press.kind]}${editMode === 'dental' && session.dentalStage === 'review' ? ' viewport--step3' : ''}`}
        onDragOver={(event) => { event.preventDefault(); setIsDraggingOver(onBench(sessionRef.current) || acceptsDentalDrop(sessionRef.current)); }}
        onDragLeave={(event) => { if (event.currentTarget === event.target) setIsDraggingOver(false); }}
        onDrop={dropImport}
      >
        <ObjectViewport
          scene={scene}
          supportMeshes={orienting ? NO_SUPPORT_MESHES : supportMeshes}
          {...(shownPreview ? { dentalTips: { unitId: shownPreview.unitId, points: areaContacts } }
            : stepOneUnit && stepOneTips ? { dentalTips: { unitId: stepOneUnit.id, points: stepOneTips } } : {})}
          {...(inArea ? { dentalArea: true } : {})}
          {...(editMode === 'dental' && session.dentalStage === 'aligner' && dentalFlow.areaPreview
            ? { dentalAreaPreview: { unitId: dentalFlow.areaPreview.unitId, policy: dentalFlow.areaPreview.policy } }
            : {})}
          {...(inArea && activeUnit && areaRisks.length > 0 ? { dentalRisks: { unitId: activeUnit.id, risks: areaRisks } } : {})}
          {...(sceneAngle ? { printAngle: sceneAngle } : {})}
          onPickTip={onPickTip}
          gesture={canvasGesture(press)}
          gizmoMode={gizmoMode}
          rotationGizmo={orienting && free.free}
          {...(denture.active && activeUnit && session.dentalStage === 'review' && addOnTint ? { unitOverlay: { unitId: activeUnit.id, node: addOnTint } } : {})}
          {...(denture.active && activeUnit?.denture && editMode === 'dental' && session.dentalStage === 'review' ? { bubbleResolve: { unitId: activeUnit.id, resolvable: denture.supports.resolvable, onResolve: (point: UnresolvedPoint) => denture.supports.resolve(activeUnit.id, point) } } : {})}
          modelVisible={modelVisible}
          wireframe={wireframe}
          onSelect={onSelect}
          onTransform={onTransform}
          onAddContact={onAddContact}
          onRimPoint={onRimPoint}
          onRimPath={onRimPath}
          onRimSelect={onRimSelect}
          onRemoveContact={onRemoveContact}
          onErase={onErase}
          onEditMiss={onEditMiss}
          liveTool={liveTool}
          selection={selection}
          onToggleContact={onToggleContact}
          onPaint={onPaint}
          onShift={onShift}
          onZoneStroke={onZoneStroke}
          onDentalStroke={onDentalStroke}
          onNoBodies={onNoBodies}
          problems={listedProblems}
          {...(added ? { added } : {})}
          {...(focus ? { focus } : {})}
          {...(viewRequest ? { viewRequest } : {})}
          tipsView={tipsOnly.shown}
          onBelowPlate={onBelowPlate}
          {...(activeUnit && debugShown.length + (denture.orient.tipLayers?.layers.length ?? 0) > 0 ? { debugLayers: { unitId: activeUnit.id, layers: [...debugShown, ...(denture.orient.tipLayers?.unitId === activeUnit.id ? denture.orient.tipLayers.layers : [])] } } : {})}
        />
        {activeUnit && session.mode === 'dental' && session.dentalProfile ? <DebugSection open={debug.open} onOpenChange={debug.setOpen} status={debug.status} layers={debug.layers} visible={debug.visible} onToggle={debug.toggle} {...(stepOneAngle ? { angle: stepOneAngle } : {})} /> : null}
        {orienting ? null : (
          <div className="viewport-view" role="group" aria-label={t('View')}>
            {/* Forced by zones, the button stays focusable (its hint says why) but does nothing. */}
            <button aria-pressed={tipsOnly.shown} aria-disabled={tipsOnly.forced} onClick={() => setTips((state) => tipsPress(state, tipsContext))} {...hint(tipsOnly.hint)}>{t('Tips only')}</button>
            <CommandButton command={command('view.fit')} run={runCommand} />
            <CommandButton command={command('view.bottom')} run={runCommand} />
          </div>
        )}
        <CirclePreview gesture={canvasGesture(press)} />
        {isDraggingOver && <div className="viewport-drop-overlay">{t('Drop to import')}</div>}
        {/* The legend is DOM: it is a sibling of the canvas, never a child of it - everything inside the
            r3f Canvas has to be a THREE object. */}
        {editMode === 'dental' && (session.dentalStage === 'aligner' || session.dentalStage === 'area' || session.dentalStage === 'review')
          ? <SceneLegend supports={session.dentalStage !== 'aligner' || Boolean(stepOneTips)} /> : null}
        <JobActivityPanel stagedBar={stagedJobBar} />
        {/* The area detector is ONE call into the core: it reports a start and an end and nothing between,
            so this one paces and shows no number. See src/components/SceneProgress.tsx. */}
        {dentalFlow.detectingArea ? <Progress type="step" label={t('Detecting the support area')} />
          : stepOnePlacing ? <Progress type="step" label={t('Placing the supports this angle needs')} /> : null}
        <div className="undo-toast-region" role="status" aria-live="polite">
          {toast && <UndoToast key={toast.id} toast={toast} onUndo={undoToastAction} onClose={closeToast} />}
          {doneHint !== undefined && onBench({ mode: editMode }) && <div className="dental-done" role="status">
            <span>{plural(doneHint, kindText('{n} aligner finished and ready on the plate. Export STL (right panel) or Save project to keep your work.', jobKindOf(session.dentalProfile)), kindText('{n} aligners finished and ready on the plate. Export STL (right panel) or Save project to keep your work.', jobKindOf(session.dentalProfile)))}</span>
            <button type="button" onClick={() => setDoneHint(undefined)} {...hint('Close this note')}>{t('Dismiss')}</button>
          </div>}
        </div>
        {press.kind === 'none' ? <>
          <div className="viewport-object-status">{activeUnit ? activeUnit.name : t('Nothing selected')}</div>
          <div className="viewport-note">{t('Millimetres. Build plate at zero.')}</div>
        </> : press.kind === 'zones'
          ? <ZonesBar brush={press.brush} unitName={activeUnit?.name} belowPlate={tips.below} hidden={zonesHidden} ui={ui} send={send} run={runCommand} />
          : press.kind === 'dental-aligner' || press.kind === 'dental-rim' || press.kind === 'dental-area' || press.kind === 'dental-review' ? <DentalBar gesture={press} lang={lang} selectedName={activeUnit && !session.dentalFinished.includes(activeUnit.id) ? activeUnit.name : undefined} onFiles={(files) => void importFiles(files)} onUseSelected={useSelectedAligner} unitName={activeUnit?.name} ui={ui} tipCount={dentalPreview ? areaContacts.length : 0} risks={areaRisks} onShowRisk={(risk) => activeUnit && showProblem({ unitId: activeUnit.id, position: risk.position, area: 0 })} previewStatus={dentalPreviewState.kind} reviewReady={ui.dentalReviewReady ?? false} review={dentalReview} clickReach={{ value: activeSettings.eraseRadius, onChange: (value, edit) => onSettingChange('eraseRadius', value, edit) }} tuning={dentalTuning.tuning} tuningLimits={dentalTuning.limits} tuningBusy={dentalTuning.busy} tuningError={dentalTuning.error} tuningFixed={!dentalTuning.tunable} onTuningChange={dentalTuning.change} tilt={orientFlow.tilt?.unitId === activeUnit?.id ? orientFlow.tilt : undefined} onTilt={orientFlow.chooseTilt} free={dentalFree} restore={{ can: stepRestorable, run: restoreStep }} orientExtra={denture.active ? <LiveTipSummary counts={denture.orient.counts} /> : undefined} areaExtra={denture.active ? undefined : <PartsList kind="aligner" parts={placementParts(dentalPreview?.result)} />} dentureReview={denture.active && activeUnit?.denture ? { mesh: currentBuild(activeUnit, heldBuilds.get(activeUnit.id)), options: activeUnit.denture.options, onOptions: (options) => denture.supports.setOptions(activeUnit.id, options) } : undefined} send={send} run={runCommand} />
          : <EditBar gesture={press} unitName={activeUnit?.name} ui={ui} clickReach={{ value: activeSettings.eraseRadius, onChange: (value, edit) => onSettingChange('eraseRadius', value, edit) }} send={send} run={runCommand} />}
      </section>
      {editMode !== 'dental' ? <aside className="panel right" onClick={blockedClick('right')}>
        {lockNoteOf('right')}
        {!activeUnit && <p className="help">{t('Select an object to edit its settings. Changes apply to every selected object.')}</p>}
        <SettingsPanel
          settings={activeSettings}
          shape={{ selected: selectedIds.length, ...shapeRegion, onChange: onShapeChange, run: runCommand, band: activeUnit && <ShapeBand supports={bandCounts.supports} customised={bandCounts.customised} ui={ui} run={runCommand} /> }}
          ui={ui}
          scope={activeUnit ? `${activeUnit.name}${selectedCount > 1 ? ` ${t('and {n} more', { n: selectedCount - 1 })}` : ''}` : t('Nothing selected')}
          deferPlacement={editMode === 'edit'}
          placementPending={!generating && !regenQueued && Boolean(activeUnit && placementPending(activeUnit))}
          autoLabel={activeIndex >= 0 ? labelForIndex(activeIndex) : 'A'}
          disabled={!activeUnit}
          locked={locked('settings')}
          onChange={onSettingChange}
          onCancelEdit={cancelEdit}
          onPreset={(preset) => changeSettings((settings) => applyPreset(preset, settings), false)}
          onRoofMode={(mode) => changeSettings((settings) => setRoofMode(settings, mode), false)}
        />
        <section className="export" {...(locked('export') ? { inert: '' } : {})}>
          <h3>{t('Export STL')}</h3>
          {EXPORT_IDS.map((id) => <CommandButton key={id} command={command(id)} run={runCommand} />)}
          <p className="help">{t('Exports match the viewport at full resolution. Source models are never changed.')}</p>
        </section>
      </aside> : null}
    </section>
    </>}
    {/* A band under the first page, an overlay on the scene once the workspace is up (src/styles.css). */}
    <footer className={startScreen === null ? 'on-scene' : undefined}>
      <span>{plural(scene.units.length, '1 object', '{n} objects')}</span>
      {activeUnit && <span>{t('{n} triangles', { n: (activeUnit.source.indices.length / 3).toLocaleString() })}</span>}
      {contactCounts && <span className={building(activeUnit!) ? 'building' : undefined} aria-busy={building(activeUnit!) || undefined} {...hint('Automatic supports you removed by hand. Clear manual edits brings them back')}>{t('{auto} automatic, {manual} manual, {removed} removed', contactCounts)}</span>}
      {/* Announced to screen readers, so errors and step results are heard too. */}
      <strong role="status" aria-live="polite">{translateMessage(kindMessage(status, jobKindOf(session.dentalProfile)))}</strong>
      <button type="button" className="link-button" onClick={() => setTermsOpen(true)} {...hint('Read the terms of use')}>{t('Terms')}</button>
    </footer>
    {termsOpen && <TermsDialog lang={lang} onClose={() => setTermsOpen(false)} />}
  </main>;
}
