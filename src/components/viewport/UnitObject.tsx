import { useThree, type ThreeEvent } from '@react-three/fiber';
import type { DentalPolicy } from '@mixo-geocore/host/dental/dentalPolicy';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import type { SupportProblem } from '@mixo-geocore/host/core/analysis/supportCheck';
import type { GeneratedSupportMesh } from '@mixo-geocore/host/core/supports/mesh';
import { contactAtTriangle, tipsOf } from '@mixo-geocore/host/core/supports/meshQuery';
import type { ZoneStamp } from '@mixo-geocore/host/core/supports/zones';
import type { DentalAllowStamp } from '@mixo-geocore/host/dental/dentalPolicy';
import type { Vector } from '@mixo-geocore/host/core/vec3';
import { gestureMode } from '@mixo-geocore/editing/gesture';
import { clickTool, pickAction, type PickInput } from '@mixo-geocore/editing/pick';
import { brushPreview } from '@mixo-geocore/editing/selection';
import { appendSurfaceStamps } from '@mixo-geocore/editing/surfaceBrush';
import { createStroke, zoneFill } from '@mixo-geocore/editing/stroke';
import { displayMesh } from '../../state/meshExtras';
import type { PrintUnit } from '../../state/project';
import { resolveSettings, unitContacts } from '@mixo-geocore/host/supports/unitSupports';
import { AddFlash, type AddedAt } from './AddFlash';
import { ZONE_OPACITY, SEE_THROUGH } from './style';
import { useViewportColours } from './sceneColours';
import { useGeometry } from './geometry';
import { rustRaycast } from './rustRaycast';
import { type Hover, EditPreview, SupportBodies, ZoneLayer, useDoomed, useWarmZoneOverlay, ProblemMarkers, CustomisedMarks, useSelectionColors } from './supportLayers';
import type { AreaRisk } from '../../dental/areaRisk';
import type { OrientationLayer } from '../../dental/orientationEvidence';
import { DebugLayerMeshes } from './DebugLayerMeshes';
import { DentalFaceLayer, DentalPaintLayer, DentalRiskLayer, DentalRegionLines, DentalRimOutline, DentalStampLayer, DentalTipMarkers, type TipMark } from './dentalLayers';
import { RimDraftLayer } from './RimDraftLayer';
import { rimTargetAt } from '../../dental/rim/rimTarget';

/** A rim not started yet: an open path with nothing on it, so the first press appends. */
const EMPTY_RIM: SurfacePath = { anchors: [], closed: false };
import { insertAnchor, moveAnchor, type SurfacePath } from '../../core/surfacePath/path';
import type { ObjectViewportProps } from './types';
import { MODEL_MESH, SUPPORT_MESH, useScreenBrush } from './useScreenBrush';

function toVector(vector: THREE.Vector3): Vector {
  return [vector.x, vector.y, vector.z];
}

/** The viewport settings and callbacks one object takes, plus its own unit, supports and state. */
interface UnitObjectProps extends Pick<ObjectViewportProps,
  | 'gesture' | 'liveTool' | 'selection' | 'tipsView' | 'modelVisible' | 'wireframe'
  | 'onSelect' | 'onPickTip' | 'onAddContact' | 'onRimPoint' | 'onRimPath' | 'onRimSelect' | 'onRemoveContact' | 'onErase' | 'onEditMiss' | 'onToggleContact' | 'onPaint' | 'onShift' | 'onZoneStroke' | 'onDentalStroke' | 'onNoBodies'> {
  problems: readonly SupportProblem[];
  /** Step 1's detected area, drawn while the scene has none of its own (src/components/useDentalFlow.ts). */
  dentalAreaPreview?: DentalPolicy;
  /** A support just added to this object: a ring flashes at its tip. */
  added?: AddedAt;
  unit: PrintUnit;
  supports?: GeneratedSupportMesh;
  dentalTips?: readonly TipMark[];
  /** Dental Step 2: low points of overhang regions outside the permitted area. */
  dentalRisks?: readonly AreaRisk[];
  /** Debug section: Step 1 evidence layers drawn inside this object's group, so they follow its transform. */
  debugLayers?: readonly OrientationLayer[];
  /** Dental Step 2, whichever tool: tips and the area are drawn, no support bodies, and Select works on the tips. */
  dentalArea?: boolean;
  selected: boolean;
  active: boolean;
  /** The unit's group, with the unit it belongs to, so a stale group of a removed unit is never taken for the active one. */
  onGroup?: (group: { unitId: string; group: THREE.Group } | null) => void;
  /** A brush (Drag over circle, or the zone brush on the model) is over this object, reported for the canvas cursor. */
  onBrushOver?: (over: boolean) => void;
}

export function UnitObject(props: UnitObjectProps) {
  const { unit, gesture } = props;
  const editMode = gestureMode(gesture);
  const editing = editMode !== 'off' && props.active;
  // The tips view draws (and picks) only the contact tips of the built supports.
  const tips = useMemo(() => (props.tipsView && props.supports ? tipsOf(props.supports) : undefined), [props.tipsView, props.supports]);
  const stepTwo = props.dentalArea === true;
  /*
   * Step 1, where the reader is choosing the print angle. THE CANVAS TAKES NO EDITS HERE: the pointer turns
   * the camera and nothing else, because there is nothing on this step to paint or pick. The hover marker and
   * the stroke handlers are off, so the model does not answer the pointer with a circle it cannot act on.
   */
  const stepOne = gesture.kind === 'dental-aligner';
  /** What the area layers draw: the accepted policy, or Step 1's preview while there is none yet. */
  const areaPolicy = unit.dental ?? props.dentalAreaPreview;
  /** The step takes strokes: Step 1 does not, and neither does a step with no editing gesture at all. */
  const takesEdits = editing && !stepOne;
  const supports = gesture.kind === 'dental-area' || stepTwo ? undefined : tips ?? props.supports;
  // A heavy model draws its simplified copy (it takes no hand edits); supports and export use the full one.
  const shown = displayMesh(unit.source);
  const model = useGeometry(shown);
  useWarmZoneOverlay(shown === unit.source ? shown : undefined, props.supports !== undefined);
  // Painting zones: supports are drawn but take no pointer events (presses reach the model).
  const zoning = editing && gesture.kind === 'zones';
  const dentalPainting = editing && gesture.kind === 'dental-area';
  /** Rim define mode: the model is a surface to draw a loop on, and nothing else this object does applies. */
  const rimDrawing = gesture.kind === 'dental-rim';
  /** Step 2's area layers and tip markers show under every tool. */
  const areaShown = editing && (stepTwo || stepOne);
  const surfacePainting = zoning || dentalPainting;
  const supportGeometry = useGeometry(supports);
  // Select supports: Click picks one support at a time; Drag over (the brush) owns the left button.
  const selecting = gesture.kind === 'pick' || gesture.kind === 'drag';
  const clickSelecting = gesture.kind === 'pick';
  /** Drag over settings, only while this object is the one edited. */
  const brush = editing && gesture.kind === 'drag' ? gesture.brush : undefined;
  /** The same brush with the switch's own mode: the viewport adds Shift from the pointer. */
  const switchRadius = brush?.radius;
  const switchMode = editing && gesture.kind === 'drag' ? gesture.base : undefined;
  const switchBrush = useMemo(() => (switchRadius !== undefined && switchMode ? { radius: switchRadius, mode: switchMode } : undefined), [switchRadius, switchMode]);
  /** Zone brush settings, only while this object's zones are painted. */
  const zoneBrush = zoning && gesture.kind === 'zones' ? gesture.brush : undefined;
  const dentalBrush = dentalPainting && gesture.kind === 'dental-area' ? gesture.brush : undefined;
  /** Stamps of the zone stroke in progress (the ref is what the stroke end hands on). */
  const strokeStamps = useRef<ZoneStamp[]>([]);
  const [stroke, setStroke] = useState<readonly ZoneStamp[]>([]);
  const dentalStrokeStamps = useRef<DentalAllowStamp[]>([]);
  const [dentalStroke, setDentalStroke] = useState<readonly DentalAllowStamp[]>([]);
  const zones = useMemo(() => (stroke.length ? [...unit.zones, ...stroke] : unit.zones), [unit.zones, stroke]);
  const dentalStamps = useMemo(() => unit.dental && (dentalStroke.length ? [...unit.dental.stamps, ...dentalStroke] : unit.dental.stamps), [unit.dental, dentalStroke]);
  // The contacts the shown build kept (its zoned landings dropped).
  const contacts = useMemo(() => unitContacts(unit, props.supports), [unit, props.supports]);
  const [hover, setHover] = useState<Hover | null>(null);
  /*
   * A rim anchor being dragged, and the drawing as it looks mid-drag.
   *
   * The moved path is kept HERE and not dispatched on every pointer move, so the whole drag is ONE
   * entry on the app's history - a stroke of Adjust undoes the way a paint stroke does, in one press,
   * instead of unwinding a hundred micro-moves. The scene keeps the drawing as it was until the drag
   * ends, and this local copy is what gets drawn in the meantime.
   */
  const controls = useThree((state) => state.controls) as unknown as { enabled: boolean } | null;
  const [rimDrag, setRimDrag] = useState<{ at: number; path: SurfacePath } | null>(null);
  /*
   * WHICH ANCHOR WEARS THE RING. Mid-drag it is the one the pointer is carrying, which `rimDrag` knows
   * and the session does not (the drag commits once, on release, so the session is deliberately behind).
   * Otherwise it is the session pick, which outlasts the drag and is what Delete point acts on.
   */
  const rimPicked = rimDrag?.at ?? (gesture.kind === 'dental-rim' ? gesture.selected : undefined);
  /*
   * The release is listened for on the WINDOW, not on the mesh. A drag that ends with the pointer off
   * the model - past the edge of the aligner, or outside the canvas - still has to end, and a mesh
   * handler would never hear it: the anchor would stay glued to the pointer with no button held.
   * The dispatch happens exactly once here, which is what makes one drag one step on the history.
   */
  const onRimPath = props.onRimPath;
  useEffect(() => {
    if (!rimDrag) return undefined;
    const drop = () => {
      onRimPath(unit.id, rimDrag.path);
      setRimDrag(null);
    };
    window.addEventListener('pointerup', drop);
    window.addEventListener('pointercancel', drop);
    return () => {
      window.removeEventListener('pointerup', drop);
      window.removeEventListener('pointercancel', drop);
      /*
       * AND THE CAMERA COMES BACK, here rather than in `drop`, so it comes back however the drag ends -
       * released, cancelled, or the unit unmounted mid-drag. Leaving the orbit switched off would be a
       * worse fault than the one this fixes: a viewport that silently stops turning.
       */
      if (controls) controls.enabled = true;
    };
  }, [rimDrag, onRimPath, unit.id, controls]);
  /** Select supports → Click: the contact whose support is under the pointer. */
  const [pointed, setPointed] = useState<string | null>(null);
  const leave = () => {
    setHover(null);
    setPointed(null);
  };
  useEffect(leave, [editing, zoning, selecting, clickSelecting]);
  const doomed = useDoomed(unit, contacts, editing && hover?.remove ? hover.point : undefined);

  // A brush stroke (Drag over, or the zone brush): the rules are editing/stroke; this wires the
  // pointer and window events to it. A zone stroke is handed on once, when it ends.
  // The orbit is off for the stroke (the r3f canvas listener runs before the OrbitControls one,
  // so the press that starts a stroke never starts a rotation).
  /** Runs once when a stroke ends (release, cancel, blur, a move with no button, the brush gone). */
  const strokeEnded = useRef(() => {});
  const [brushStroke] = useState(() => createStroke(() => strokeEnded.current()));
  const release = useCallback(() => void brushStroke.end(), [brushStroke]);
  strokeEnded.current = () => {
    window.removeEventListener('pointerup', release);
    window.removeEventListener('pointercancel', release);
    window.removeEventListener('blur', release);
    if (controls) controls.enabled = true;
    const stamps = strokeStamps.current;
    if (stamps.length > 0) {
      strokeStamps.current = [];
      props.onZoneStroke(unit.id, stamps);
      setStroke([]);
    }
    const dentalStamps = dentalStrokeStamps.current;
    if (dentalStamps.length > 0) {
      dentalStrokeStamps.current = [];
      props.onDentalStroke(unit.id, dentalStamps);
      setDentalStroke([]);
    }
  };
  useEffect(() => () => void brushStroke.end(), [brushStroke]);
  /** A stroke starts: the orbit is off and the release is caught anywhere until it ends. */
  const beginStroke = () => {
    if (controls) controls.enabled = false;
    window.addEventListener('pointerup', release);
    window.addEventListener('pointercancel', release);
    window.addEventListener('blur', release);
  };
  const groupRef = useRef<THREE.Group | null>(null);
  const { onGroup, onBrushOver } = props;
  const { preview: marks, model: modelColours, support: supportColours } = useViewportColours();
  const supportColor = props.selected ? supportColours.selectedObject : supportColours.idle;
  const setGroup = useCallback((group: THREE.Group | null) => {
    groupRef.current = group;
    onGroup?.(group && { unitId: props.unit.id, group });
  }, [onGroup, props.unit.id]);
  const { brushed, over: circleOver } = useScreenBrush({
    brush: switchBrush,
    supports,
    tips: stepTwo ? props.dentalTips : undefined,
    group: groupRef,
    selection: props.selection,
    stroke: brushStroke,
    beginStroke,
    onShift: props.onShift,
    onPaint: (ids, mode) => props.onPaint(unit.id, ids, mode),
    onNoBodies: props.onNoBodies,
  });
  const brushOver = circleOver || Boolean(hover && (zoneBrush || dentalBrush));
  useEffect(() => {
    onBrushOver?.(brushOver);
    return () => onBrushOver?.(false);
  }, [brushOver, onBrushOver]);
  const preview = useMemo(() => brushPreview(props.selection, brushed, brush?.mode), [props.selection, brushed, brush?.mode]);
  const tipMarks = useMemo(() => (stepTwo ? { solid: preview.solid, ghost: preview.ghost, ghostTone: preview.ghostTone === 'ring' ? 'ring' as const : 'remove' as const } : undefined), [stepTwo, preview]);
  const selectionColored = useSelectionColors(supportGeometry, supports, editing && !surfacePainting, preview.solid, supportColor);
  // The brush going away mid-stroke (tool or mode changed, another object made active) ends the
  // stroke at once, so the orbit is back without waiting for the release.
  const brushing = Boolean(brush || zoneBrush || dentalBrush);
  useEffect(() => {
    if (!brushing) brushStroke.end();
  }, [brushing, brushStroke]);
  /** Surface brush: unit-local point under the pointer and its surface normal. */
  const paint = (event: ThreeEvent<PointerEvent>) => {
    const surfaceBrush = zoneBrush ?? dentalBrush;
    if (!surfaceBrush) return;
    const at: Hover = { point: event.object.worldToLocal(event.point.clone()), normal: event.face?.normal.clone() ?? new THREE.Vector3(0, -1, 0), remove: false };
    setHover(at);
    if (brushStroke.move((event.buttons & 1) !== 0) !== 'sample') return;
    const center = toVector(at.point);
    const { radius } = surfaceBrush;
    // New stamps (a fast drag's gap filled) share this hit's normal.
    const centers = brushStroke.samples(center, zoneFill(radius));
    if (centers.length === 0) return;
    const normal = toVector(at.normal.clone().normalize());
    if (zoneBrush) {
      const stamps: ZoneStamp[] = appendSurfaceStamps(zoneBrush.kind, radius, centers.map((point) => ({ point, normal })));
      strokeStamps.current = [...strokeStamps.current, ...stamps];
      setStroke(strokeStamps.current);
    } else if (dentalBrush) {
      const stamps: DentalAllowStamp[] = appendSurfaceStamps(dentalBrush.kind, radius, centers.map((point) => ({ point, normal })));
      dentalStrokeStamps.current = [...dentalStrokeStamps.current, ...stamps];
      setDentalStroke(dentalStrokeStamps.current);
    }
  };
  /** Zone strokes start on the model; Drag over strokes start on the model or a support (`useScreenBrush`). */
  const startStroke = (event: ThreeEvent<PointerEvent>) => {
    /*
     * THE TARGET UNDER THE PRESS DECIDES, NOT AN ARMED TOOL (`rim/rimTarget.ts`). A handle is picked
     * up; the drawn line takes a new handle where it was pressed and picks THAT up, so inserting and
     * dragging are one gesture; anything else picks up nothing and is left alone, so it reaches the
     * camera and the view orbits - the house rule that where the drag starts decides.
     */
    if (rimDrawing && gesture.kind === 'dental-rim' && unit.rimDraft) {
      const local = event.object.worldToLocal(event.point.clone());
      const target = rimTargetAt(unit.rimDraft, [local.x, local.y, local.z]);
      // Append and close are taps, not drags, and the click handler below still does them.
      if (target.kind !== 'handle' && target.kind !== 'insert') return;
      const normal = (event.face?.normal.clone() ?? new THREE.Vector3(0, -1, 0)).normalize();
      const held = target.kind === 'insert'
        ? insertAnchor(unit.rimDraft, target.at, { position: target.position, normal: [normal.x, normal.y, normal.z] })
        : unit.rimDraft;
      if (!held) return;
      const at = target.at;
      // A new handle is a scene edit of its own, so it is on the undo stack before the drag moves it.
      if (target.kind === 'insert') props.onRimPath(unit.id, held);
      event.stopPropagation();
      /*
       * THE CAMERA IS OUT OF THIS GESTURE, and it takes more than `stopPropagation` to do it.
       * OrbitControls listens on the canvas element itself, not on the r3f object tree, so stopping
       * r3f propagation leaves it listening - which is exactly why `beginStroke` below turns it off
       * by hand for a paint stroke. Without this the view orbited under every anchor drag, and the
       * walk could not see it: the anchor still moves and its old spot is still vacated.
       */
      if (controls) controls.enabled = false;
      setRimDrag({ at, path: held });
      // The same press picks the anchor out, so Delete point has a subject without a third tool. A press
      // on bare surface leaves the pick alone and orbits: see `onRimSelect` for why it must survive that.
      props.onRimSelect(at);
      return;
    }
    if (brush) return event.stopPropagation();
    if (!zoneBrush && !dentalBrush || !brushStroke.begin(event.button)) return;
    event.stopPropagation();
    beginStroke();
    paint(event);
  };

  const hoverModel = (event: ThreeEvent<PointerEvent>) => {
    if (!editing) return;
    event.stopPropagation();
    // Mid-drag the pointer is carrying an anchor: every hit on the model is where that anchor now sits.
    if (rimDrag) {
      const local = event.object.worldToLocal(event.point.clone());
      const normal = (event.face?.normal.clone() ?? new THREE.Vector3(0, -1, 0)).normalize();
      const moved = moveAnchor(rimDrag.path, rimDrag.at, { position: [local.x, local.y, local.z], normal: [normal.x, normal.y, normal.z] });
      if (moved) setRimDrag({ at: rimDrag.at, path: moved });
      return;
    }
    if (zoneBrush || dentalBrush) return paint(event);
    // Drag over previews through its own circle; the model under the pointer shows nothing.
    if (brush || zoning) return leave();
    // Selecting previews supports only: the model under the pointer shows nothing.
    if (selecting) return leave();
    setHover({
      point: event.object.worldToLocal(event.point.clone()),
      normal: event.face?.normal.clone() ?? new THREE.Vector3(0, -1, 0),
      remove: event.ctrlKey || event.metaKey || (gesture.kind === 'add' && gesture.remove),
    });
  };
  const hoverSupport = (event: ThreeEvent<PointerEvent>) => {
    if (!editing || !supports || event.faceIndex == null) return;
    if (brush) {
      event.stopPropagation();
      return leave();
    }
    const contactId = contactAtTriangle(supports, event.faceIndex);
    const contact = contactId && contacts.find((candidate) => candidate.id === contactId);
    if (!contact) return; // braces and raft: the model behind takes the hover
    event.stopPropagation();
    if (selecting) return setPointed(clickSelecting ? contact.id : null);
    setHover({ point: new THREE.Vector3(...contact.position), normal: new THREE.Vector3(...contact.normal).normalize(), remove: true });
  };
  const surfaceNormal = (event: ThreeEvent<MouseEvent>): Vector => {
    const normal = event.face?.normal.clone().transformDirection(event.object.matrixWorld).normalize() ?? new THREE.Vector3(0, -1, 0);
    return [normal.x, normal.y, normal.z];
  };

  /** The click rules (editing/pick) for a hit on this object; `contact` only matters on supports. */
  const pickFor = (event: ThreeEvent<MouseEvent>, hit: PickInput['hit'], right: boolean, contact: boolean) => pickAction({
    hit,
    button: right ? 'right' : 'left',
    ctrl: event.ctrlKey || event.metaKey,
    shift: event.shiftKey,
    travel: event.delta,
    mode: editMode,
    ...clickTool(props.liveTool?.(), { tool: gesture.kind === 'add' ? 'add' : 'select', brush: gesture.kind === 'drag', remove: gesture.kind === 'add' && gesture.remove }),
    active: props.active,
    contact,
  });

  const clickModel = (event: ThreeEvent<MouseEvent>, right: boolean) => {
    /*
     * RIM DEFINE MODE TAKES THE CLICK WHOLE. A left click on the model is an anchor; a right click is
     * nothing, because this mode has no remove-by-right-click and a menu-button press should not place
     * a point the operator did not mean. Returning before `pickFor` keeps every other reading of a click
     * - select, erase, add a tip - out of a mode where none of them exists.
     */
    if (rimDrawing) {
      event.stopPropagation();
      /*
       * ONLY PLACE PLACES. In Adjust the click arrives at the END OF A DRAG - the browser fires it on
       * release - so letting it through would drop a fresh anchor every time the operator finished
       * moving one. A right click does nothing in either tool: this mode has no remove-by-right-click,
       * and a menu-button press should not leave a point behind.
       */
      if (!right && gesture.kind === 'dental-rim') {
        const local = event.object.worldToLocal(event.point.clone());
        // An empty drawing is an OPEN path with no anchors, so the first press appends. Guarding on
        // `unit.rimDraft` here meant the first point of a rim could never be placed at all.
        const tapped = rimTargetAt(unit.rimDraft ?? EMPTY_RIM, [local.x, local.y, local.z]).kind;
        // Extending an open loop, or joining it: `onRimPoint` already tells those two apart.
        if (tapped === 'append' || tapped === 'close') {
          props.onRimPoint(unit.id, [event.point.x, event.point.y, event.point.z], surfaceNormal(event));
        }
      }
      return;
    }
    // Paint and Erase work through the stroke; the click that ends one is not an Add.
    if (dentalPainting) return;
    const action = pickFor(event, 'model', right, false);
    if (action.type === 'pass') return;
    // Step 2 removes only through a selection and Delete: a right or Ctrl click does nothing there.
    if (stepTwo && action.type === 'erase') return;
    event.stopPropagation();
    const point: Vector = [event.point.x, event.point.y, event.point.z];
    // Step 2, Select → Click: the tip nearest the click (within Click reach) is picked.
    if (stepTwo && action.type === 'miss' && gesture.kind === 'pick') return props.onPickTip(unit.id, point);
    if (action.type === 'select') props.onSelect(unit.id, action.additive);
    else if (action.type === 'erase') props.onErase(unit.id, point);
    else if (action.type === 'miss') props.onEditMiss();
    else if (action.type === 'add') props.onAddContact(unit.id, point, surfaceNormal(event));
  };

  /** Right-click removes the support it hits (nearest within Click reach for the model) in every tool; a left click selects (Click) or, with Ctrl or in Remove, removes (Add). */
  const clickSupport = (event: ThreeEvent<MouseEvent>, right: boolean) => {
    if (!supports || event.faceIndex == null) return;
    // Braces, raft and labels belong to no contact: the pick continues behind them.
    const contactId = contactAtTriangle(supports, event.faceIndex);
    const action = pickFor(event, 'support', right, Boolean(contactId));
    if (action.type === 'pass' || !contactId) return;
    event.stopPropagation();
    if (action.type === 'toggle') return props.onToggleContact(unit.id, contactId);
    event.nativeEvent.preventDefault?.();
    props.onRemoveContact(unit.id, contactId);
  };

  return <group ref={setGroup} position={unit.transform.position} rotation={unit.transform.rotation} name={unit.id}>
    {model && <mesh
      geometry={model}
      visible={props.modelVisible}
      userData={MODEL_MESH}
      // Painting zones: other objects take no pointer events (a press passes through to the active one).
      raycast={(gesture.kind === 'zones' || gesture.kind === 'dental-area' || stepTwo) && !props.active ? () => undefined : rustRaycast}
      onClick={(event) => clickModel(event, false)}
      onContextMenu={(event) => clickModel(event, true)}
      {...(takesEdits ? { onPointerDown: startStroke, onPointerMove: hoverModel, onPointerOut: leave } : {})}
    >
      {/*
        The aligner is the clear thermoformed plastic it is made of, so a technician reads its form and can see
        a support standing under the shell.

        TRANSMISSION IS OFF WHILE THE SUPPORT AREA IS SHOWN. three renders transmissive materials LAST, after
        every transparent object, so the shell drew over the area layers - which are transparent at .7 - and the
        painted band all but vanished. The supports survive it because they are OPAQUE, and opaque geometry IS
        captured in the transmission pass. In Step 2 the reader is painting ON the surface, so the surface has to
        take paint; the clear coat and the roughness stay, so it is the same plastic either way.
      */}
      <meshPhysicalMaterial
        color={props.active ? modelColours.active : props.selected ? modelColours.selected : modelColours.idle}
        emissive={props.active ? modelColours.activeGlow : modelColours.glowOff}
        emissiveIntensity={props.active ? 0.06 : 0}
        metalness={0}
        roughness={0.32}
        transmission={areaShown ? 0 : 0.42}
        thickness={1.8}
        ior={1.52}
        clearcoat={1}
        clearcoatRoughness={0.1}
        transparent
        wireframe={props.wireframe}
      />
    </mesh>}
    {model && editing && shown === unit.source && zones.length > 0 && <group visible={props.modelVisible}>
      <ZoneLayer mesh={unit.source} geometry={model} zones={zones} opacity={ZONE_OPACITY[zoning ? 'full' : 'faint']} />
    </group>}
    {model && areaShown && shown === unit.source && areaPolicy && <group visible={props.modelVisible}>
      {areaPolicy.kind === 'two-contour'
        ? <><DentalFaceLayer mesh={unit.source} policy={{ ...areaPolicy, stamps: dentalStamps ?? areaPolicy.stamps }} opacity={0.7} />
          {(dentalStamps ?? areaPolicy.stamps).some((stamp) => stamp.kind === 'allow') &&
            <DentalPaintLayer mesh={unit.source} geometry={model} stamps={dentalStamps ?? areaPolicy.stamps} opacity={0.7} />}
          <DentalRegionLines mesh={unit.source} policy={areaPolicy} /></>
        : <><DentalStampLayer mesh={unit.source} geometry={model} policy={{ ...areaPolicy, stamps: dentalStamps ?? areaPolicy.stamps }} opacity={0.7} />
          <DentalRimOutline rim={areaPolicy.rim} /></>}
    </group>}
    {areaShown && props.dentalRisks && props.dentalRisks.length > 0 && shown === unit.source && <group visible={props.modelVisible}>
      <DentalRiskLayer mesh={unit.source} risks={props.dentalRisks} opacity={0.85} />
    </group>}
    {/*
      The rim being drawn, whenever the unit holds one - not only while the mode is open. CANCEL KEEPS THE
      DRAWING: it leaves the mode, it does not throw the work away, and Step 1 offers Draw the rim to come
      back to it. Hiding it in Step 1 would make Cancel look as though the work had been lost.

      This comment used to say the opposite - that Cancel cleared the drawing - which was never true of any
      code in this repository. `rim/clear` is dispatched by Clear and by Done, and by nothing else. The
      drawing outlived Cancel the whole time, with no way back into the mode to edit it and no control that
      could remove it, because Clear is `visible: rim`. The way back in is what makes keeping it right.
      The preview anchor appears only in Place, and only with the pointer on the model.
    */}
    {(rimDrag?.path ?? unit.rimDraft) && <RimDraftLayer path={rimDrag?.path ?? unit.rimDraft!}
      {...(rimPicked === undefined ? {} : { selected: rimPicked })}
      {...(() => {
        /*
         * THE GHOST IS HOW THE THREE TARGETS TEACH THEMSELVES. It used to appear only in Place, which
         * meant it only ever said "a point will go here". Now it follows what a press would actually
         * do: over the drawn line it SNAPS to the line, so the operator sees where a new handle would
         * land before committing; over bare model on an open loop it sits under the pointer, as
         * before; over a handle, or over bare model on a closed loop, it is absent - because nothing
         * would be placed, and the view will turn instead.
         */
        if (!rimDrawing || gesture.kind !== 'dental-rim' || !hover || rimDrag) return {};
        const path = unit.rimDraft;
        const normal = toVector(hover.normal.clone().normalize());
        if (!path || path.anchors.length === 0) return { preview: { position: toVector(hover.point), normal } };
        const target = rimTargetAt(path, toVector(hover.point));
        if (target.kind === 'insert') return { preview: { position: target.position, normal } };
        if (target.kind === 'append') return { preview: { position: toVector(hover.point), normal } };
        return {};
      })()} />}
    {props.debugLayers && props.debugLayers.length > 0 && <DebugLayerMeshes layers={props.debugLayers} />}
    {areaShown && props.dentalTips && <DentalTipMarkers points={props.dentalTips} {...(tipMarks ? { marks: tipMarks } : {})} />}
    {supportGeometry && <mesh
      geometry={supportGeometry}
      userData={SUPPORT_MESH}
      raycast={surfacePainting ? () => undefined : rustRaycast}
      // Supports take pointer events only while edited (not while painting zones), so they cost no raycasts otherwise.
      {...(editing && !surfacePainting ? {
        onClick: (event: ThreeEvent<MouseEvent>) => clickSupport(event, false),
        onContextMenu: (event: ThreeEvent<MouseEvent>) => clickSupport(event, true),
        onPointerDown: startStroke,
        onPointerMove: hoverSupport,
        onPointerOut: leave,
      } : {})}
    >
      {/* Edited: per-vertex colour carries the selection (`useSelectionColors`); white lets it through. */}
      {/* Keyed: three compiles vertex colours into the shader, so turning them on needs a new material. */}
      <meshPhysicalMaterial key={selectionColored ? 'selection' : 'plain'} color={selectionColored ? modelColours.vertexBase : supportColor} vertexColors={selectionColored}
        metalness={0} roughness={0.38} clearcoat={0.7} clearcoatRoughness={0.25} sheen={0} />
    </mesh>}
    {takesEdits && hover && !brush && <EditPreview hover={hover} unit={unit} contacts={contacts} {...(zoneBrush || dentalBrush
      ? { brush: { radius: (zoneBrush ?? dentalBrush)!.radius, color: zoneBrush?.kind === 'paint' ? marks.zone : dentalBrush?.kind === 'allow' ? marks.areaPermitted : marks.ring } }
      : {})} />}
    {editing && !surfacePainting && supports && supportGeometry && <>
      <SupportBodies supports={supports} geometry={supportGeometry} ids={doomed} opacity={1} />
      {pointed && !props.selection.has(pointed) && <SupportBodies supports={supports} geometry={supportGeometry} ids={[pointed]} opacity={SEE_THROUGH} />}
      <SupportBodies supports={supports} geometry={supportGeometry} ids={preview.ghost} opacity={SEE_THROUGH} color={marks[preview.ghostTone]} />
    </>}
    {editing && !surfacePainting && <CustomisedMarks unit={unit} contacts={contacts} />}
    {props.added && <AddFlash key={props.added.seq} at={props.added} radius={Math.max(2, resolveSettings(unit.settings).eraseRadius)} />}
    {props.problems.length > 0 && <ProblemMarkers problems={props.problems} />}
  </group>;
}
