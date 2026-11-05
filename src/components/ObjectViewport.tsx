import { Grid, OrbitControls, TransformControls } from '@react-three/drei';
import { PrintAngleMark } from './viewport/PrintAngleArc';
import { Canvas } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { TransformControls as TransformControlsImpl } from 'three-stdlib';
import { hoverRotateRing, styleRotateGizmo } from './viewport/gizmoStyle';
import { gestureMode, type Gesture } from '@mixo-geocore/editing/gesture';
import { missAction } from '@mixo-geocore/editing/pick';
import type { ModelTransform } from '@mixo-geocore/host/state/transform';
import { ViewCamera, PlateSide, FocusCamera } from './viewport/cameras';
import type { GizmoMode, ObjectViewportProps } from './viewport/types';
import { canvasCursor } from './viewport/style';
import { useViewportColours } from './viewport/sceneColours';
import { UnitObject } from './viewport/UnitObject';
import { PlateOutline } from './viewport/PlateOutline';
import { UnresolvedBubbles } from './viewport/UnresolvedBubbles';
import { generationTransform } from '@mixo-geocore/host/supports/unitSupports';

export function acceptModelFile(file: File): boolean {
  return /\.(stl|glb|gltf)$/i.test(file.name);
}

export function isTransformMode(mode: GizmoMode): mode is 'translate' | 'rotate' {
  return mode !== 'none';
}

/**
 * The transform gizmo drawn on the active object: the rotation-only gizmo of Step 1's Free transform
 * when `rotationGizmo` is on; otherwise the chosen mode, and only in the plain viewer (no gesture).
 * Undefined: no gizmo.
 */
export function gizmoShown(gesture: Gesture, gizmoMode: GizmoMode, rotationGizmo: boolean): 'translate' | 'rotate' | undefined {
  if (rotationGizmo) return 'rotate';
  return gesture.kind === 'none' && isTransformMode(gizmoMode) ? gizmoMode : undefined;
}

/** A gizmo-moved object's placement (Euler XYZ, the three.js default order this app keeps). */
export function transformFromObject(object: THREE.Object3D): ModelTransform {
  return {
    position: [object.position.x, object.position.y, object.position.z],
    rotation: [object.rotation.x, object.rotation.y, object.rotation.z],
  };
}


function UnitTransformControls({ mode, object, onDraggingChanged, onCommit }: {
  mode: 'translate' | 'rotate';
  object: THREE.Group;
  onDraggingChanged: (dragging: boolean) => void;
  onCommit: (transform: ModelTransform) => void;
}) {
  const controls = useRef<TransformControlsImpl>(null);
  /*
   * THE GIZMO IS PAINTED IN THE APP'S OWN COLOURS, and the screen-plane ring is taken off it. Both live in
   * `gizmoStyle.ts` with the explanation of why three's gizmo resists each - it repaints its handles from a
   * cache every frame, and it shares one material across the move, rotate and scale gizmos.
   */
  useEffect(() => { styleRotateGizmo(controls.current); }, []);
  /*
   * THE RING UNDER THE POINTER TAKES THE HOVER COLOUR. three announces what the pointer is over through an
   * `axis-changed` event, and handles the GLOW itself - it forces the hovered handle's opacity to 1, which
   * is exactly when the glow behind that ring should appear. Only the colour is ours to carry, because
   * three's own hover treatment is to wash a handle towards white, and on three rings of ONE colour that
   * wash would be the only thing separating the hovered one.
   */
  useEffect(() => {
    const control = controls.current as unknown as THREE.EventDispatcher<{ 'axis-changed': { value: string | null } }> | null;
    if (!control) return;
    const hover = (event: { value: string | null }) => hoverRotateRing(controls.current, event.value);
    control.addEventListener('axis-changed', hover);
    return () => control.removeEventListener('axis-changed', hover);
  }, []);
  useEffect(() => {
    const control = controls.current as unknown as THREE.EventDispatcher<{ 'dragging-changed': { value: boolean } }> | null;
    if (!control) return;
    // One history step per drag: the gizmo moves the group live; the scene commits on release.
    const handle = (event: { value: boolean }) => {
      onDraggingChanged(event.value);
      if (!event.value) onCommit(transformFromObject(object));
    };
    control.addEventListener('dragging-changed', handle);
    return () => control.removeEventListener('dragging-changed', handle);
  }, [object, onCommit, onDraggingChanged]);
  /*
   * `space="local"` - THE GIZMO TURNS WITH THE ALIGNER, NOT WITH THE WORLD. In world space the rings stay
   * fixed to the plate's axes however the model is posed, so after one turn the ring a reader grabs no
   * longer lines up with anything they can see on the part. In local space each ring stays bound to the
   * aligner's own axes: the flat ring stays the one that spins it where it lies.
   *
   * A quarter larger than three's default: the rings sit clear of the model instead of cutting across it,
   * and the grab knobs become a target for a finger rather than for a surgeon.
   */
  return <TransformControls ref={controls} mode={mode} object={object} size={1.25} space="local" />;
}

export default function ObjectViewport(props: ObjectViewportProps) {
  const [dragging, setDragging] = useState(false);
  const [overBrush, setOverBrush] = useState(false);
  const [activeGroup, setActiveGroup] = useState<{ unitId: string; group: THREE.Group } | null>(null);
  const { scene } = props;
  const colours = useViewportColours();
  const selected = new Set(scene.selectedUnitIds);
  const activeId = scene.activeUnitId;
  const gizmo = gizmoShown(props.gesture, props.gizmoMode, props.rotationGizmo === true);

  return <Canvas
    style={{ cursor: canvasCursor(props.gesture, overBrush) }}
    camera={{ position: [70, 60, 90], fov: 40, near: 0.5, far: 4000 }}
    onCreated={({ raycaster }) => {
      // The nearest hit per mesh is all picking needs (and much faster with a BVH).
      (raycaster as THREE.Raycaster & { firstHitOnly?: boolean }).firstHitOnly = true;
    }}
    onPointerMissed={(event) => {
      const action = missAction({ mode: gestureMode(props.gesture), button: event.button === 0 ? 'left' : event.button === 2 ? 'right' : 'middle', gizmoDragging: dragging });
      if (action.type === 'miss') props.onEditMiss();
      else if (action.type === 'deselect') props.onSelect(null, false);
    }}
    onContextMenu={(event) => event.preventDefault()}
  >
    <color attach="background" args={[colours.scene.background]} />
    <hemisphereLight args={[colours.scene.lightSky, colours.scene.lightGround, 1.3]} />
    <directionalLight position={[40, 80, 30]} intensity={1.4} />
    <directionalLight position={[-50, 30, -40]} intensity={0.45} />
    <Grid args={[240, 240]} cellSize={5} cellThickness={0.5} cellColor={colours.scene.gridCell} sectionSize={25} sectionThickness={0.9} sectionColor={colours.scene.gridSection} fadeDistance={400} fadeStrength={1.5} infiniteGrid />
    {props.plate ? <PlateOutline plate={props.plate} /> : null}
    <OrbitControls makeDefault enabled={!dragging} />
    <FocusCamera focus={props.focus} />
    <PlateSide onChange={props.onBelowPlate} />
    <ViewCamera view={props.viewRequest} unitIds={scene.selectedUnitIds.length > 0 ? scene.selectedUnitIds : scene.units.map((unit) => unit.id)} />
    {scene.units.map((unit) => <UnitObject
      key={unit.id}
      unit={unit}
      supports={props.supportMeshes.get(unit.id)}
      {...(props.dentalTips?.unitId === unit.id ? { dentalTips: props.dentalTips.points } : {})}
      {...(props.dentalAreaPreview?.unitId === unit.id ? { dentalAreaPreview: props.dentalAreaPreview.policy } : {})}
      {...(props.dentalRisks?.unitId === unit.id ? { dentalRisks: props.dentalRisks.risks } : {})}
      {...(props.debugLayers?.unitId === unit.id ? { debugLayers: props.debugLayers.layers } : {})}
      tipsView={props.tipsView}
      selected={selected.has(unit.id)}
      active={unit.id === activeId}
      gesture={props.gesture}
      modelVisible={props.modelVisible}
      {...(props.added?.unitId === unit.id ? { added: props.added } : {})}
      wireframe={props.wireframe}
      onSelect={props.onSelect}
      onPickTip={props.onPickTip}
      {...(props.dentalArea ? { dentalArea: true } : {})}
      onAddContact={props.onAddContact}
      onRimPoint={props.onRimPoint}
      onRimPath={props.onRimPath}
      onRemoveContact={props.onRemoveContact}
      onErase={props.onErase}
      onEditMiss={props.onEditMiss}
      {...(props.liveTool ? { liveTool: props.liveTool } : {})}
      selection={props.selection}
      onToggleContact={props.onToggleContact}
      onPaint={props.onPaint}
      onShift={props.onShift}
      onZoneStroke={props.onZoneStroke}
      onDentalStroke={props.onDentalStroke}
      onNoBodies={props.onNoBodies}
      problems={props.problems.filter((problem) => problem.unitId === unit.id)}
      {...(unit.id === activeId ? { onGroup: setActiveGroup, onBrushOver: setOverBrush } : {})}
    />)}
    {/* Unresolved points and model-landed supports (Round C), wherever support bodies are drawn. */}
    {props.dentalArea ? null : scene.units.map((unit) => {
      const mesh = props.supportMeshes.get(unit.id);
      return mesh && unit.supports && (mesh.unresolved?.length || mesh.modelLanded?.length)
        ? <group key={`unresolved:${unit.id}`} position={unit.transform.position} rotation={unit.transform.rotation}><UnresolvedBubbles mesh={mesh} frame={generationTransform(unit)} resolve={props.bubbleResolve?.unitId === unit.id ? props.bubbleResolve : undefined} /></group>
        : null;
    })}
    {props.printAngle ? <PrintAngleMark unitId={props.printAngle.unitId} deg={props.printAngle.deg} /> : null}
    {props.unitOverlay ? scene.units.filter((unit) => unit.id === props.unitOverlay!.unitId).map((unit) => <group key={`overlay:${unit.id}`} position={unit.transform.position} rotation={unit.transform.rotation}>{props.unitOverlay!.node}</group>) : null}
    {activeId && activeGroup?.unitId === activeId && gizmo && <UnitTransformControls
      mode={gizmo}
      object={activeGroup.group}
      onDraggingChanged={setDragging}
      onCommit={(transform) => props.onTransform(activeId, transform)}
    />}
  </Canvas>;
}
