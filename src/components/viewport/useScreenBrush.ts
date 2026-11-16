import { useThree } from '@react-three/fiber';
import { useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { brushHits, type BodySegments, type BrushOccluder } from '@mixo-geocore/editing/screenBrush';
import { sharedSession } from '@mixo-geocore/host/workers/geometryClient';
import { sessionHandle } from './sessionMesh';
import { AROUND_ANGLES, SUPPORT_REACH, useBrushOverlay, type BrushBodyView, type BrushOverlayOptions } from './useBrushOverlay';
import { createThreeViewportPort } from './viewportPort';

/*
 * Drag over for the three.js view: the THREE things `useBrushOverlay` needs from a renderer, and
 * nothing else. Everything about the brush that is not three -- the circle, the listeners, the
 * hover probe, the resting point -- lives in `useBrushOverlay.ts` and is shared with the Babylon
 * view, so the two cannot drift apart.
 */

/**
 * Marks on the model mesh and the support mesh of an object (their `userData`). Models hide
 * supports from Drag over, supports never hide each other; a stroke starts only on one of the
 * two (`strokeStart`), a press anywhere else orbits.
 */
export const MODEL_MESH = { occluder: true, strokeStart: 'model' };
export const SUPPORT_MESH = { strokeStart: 'support' };

/**
 * Whether a point on the canvas is on the object: its model or a support under the pointer, or
 * a support the circle reaches (a support is a thin line, so the circle grabs it from nearby;
 * a support behind the model does not count, the model in front is what is under the pointer).
 * The raycaster, the pointer vector and the target list are made once and reused by every test.
 */
function createObjectTest() {
  const raycaster = new THREE.Raycaster() as THREE.Raycaster & { firstHitOnly?: boolean };
  raycaster.firstHitOnly = true;
  const pointer = new THREE.Vector2();
  const targets: THREE.Object3D[] = [];
  const collect = (object: THREE.Object3D) => {
    if (object.userData.strokeStart) targets.push(object);
  };
  return (root: THREE.Object3D, camera: THREE.Camera, size: { width: number; height: number }, at: readonly [number, number], radius: number): boolean => {
    targets.length = 0;
    root.traverseVisible(collect);
    if (targets.length === 0) return false;
    const first = (x: number, y: number): unknown => {
      raycaster.setFromCamera(pointer.set((x / size.width) * 2 - 1, 1 - (y / size.height) * 2), camera);
      return raycaster.intersectObjects(targets, false)[0]?.object.userData.strokeStart;
    };
    if (first(at[0], at[1])) return true;
    return SUPPORT_REACH.some((share) => AROUND_ANGLES.some((angle) => first(at[0] + Math.cos(angle) * radius * share, at[1] + Math.sin(angle) * radius * share) === 'support'));
  };
}

/**
 * Drag over's hit test for one support mesh: the Rust core (`project_brush`) projects the support
 * bodies and tests visibility with rays against the visible models, one batched call per brush
 * step. The host supplies what is on screen: the view-projection with the object's world matrix,
 * the camera in support-local space, and each visible model's mesh with its support → model matrix.
 * The view reaches the shared brush through the three.js ViewportPort (`viewportPort.ts`, the editing seam).
 */
function screenBrushView(bodies: BodySegments, camera: THREE.Camera, scene: THREE.Scene, group: { current: THREE.Group | null }, canvas: HTMLCanvasElement): BrushBodyView {
  const matrix = new THREE.Matrix4();
  const inverseGroup = new THREE.Matrix4();
  const toModel = new THREE.Matrix4();
  const eye = new THREE.Vector3();
  let size = { width: canvas.clientWidth, height: canvas.clientHeight };
  const visibleOccluders = (): BrushOccluder[] => {
    const found: BrushOccluder[] = [];
    scene.traverseVisible((object) => {
      const mesh = object as THREE.Mesh;
      if (!object.userData.occluder || !mesh.geometry) return;
      const handle = sessionHandle(mesh.geometry);
      if (handle === undefined) return;
      object.updateWorldMatrix(true, false);
      // support-local → world → model-local (a rigid placement: distances carry over).
      toModel.copy(object.matrixWorld).invert().multiply(group.current!.matrixWorld);
      found.push({ handle, toLocal: toModel.elements.slice(), side: (mesh.material as THREE.Material).side });
    });
    return found;
  };
  const port = createThreeViewportPort({
    camera, canvas, session: sharedSession, mesh: () => undefined,
    // Clip matrix of the support group and the eye in its space, at the canvas size the pointer last saw.
    brushView: () => {
      group.current!.updateWorldMatrix(true, false);
      camera.updateMatrixWorld();
      matrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse).multiply(group.current!.matrixWorld);
      eye.copy(camera.position).applyMatrix4(inverseGroup.copy(group.current!.matrixWorld).invert());
      return { clip: matrix.elements.slice(), eye: [eye.x, eye.y, eye.z] as const, width: size.width, height: size.height };
    },
  });
  return {
    /** The canvas size the pointer last saw. */
    resize(width: number, height: number) {
      size = { width, height };
    },
    frame() {
      const session = sharedSession();
      if (!group.current || !session) return undefined;
      const view = port.brushView();
      const occluders = visibleOccluders();
      return (job, want) => ({ hits: brushHits(session, bodies, occluders, view, job.from, job.to, job.radius, job.next, want), next: bodies.ids.length });
    },
  };
}

/** Drag over over the three.js canvas. The rules are `useBrushOverlay`'s; this supplies the three. */
export function useScreenBrush(options: Omit<BrushOverlayOptions, 'canvas' | 'makeView' | 'objectAt'> & {
  group: { current: THREE.Group | null };
}): { brushed: readonly string[]; over: boolean } {
  const gl = useThree((state) => state.gl);
  const camera = useThree((state) => state.camera);
  const scene = useThree((state) => state.scene);
  const { group, ...rest } = options;
  const makeView = useCallback(
    (bodies: BodySegments) => screenBrushView(bodies, camera, scene, group, gl.domElement),
    [camera, scene, group, gl]);
  const objectTest = useMemo(() => createObjectTest(), []);
  const objectAt = useCallback((at: readonly [number, number], radius: number) => {
    const root = group.current;
    const canvas = gl.domElement;
    return Boolean(root) && objectTest(root!, camera, { width: canvas.clientWidth, height: canvas.clientHeight }, at, radius);
  }, [objectTest, camera, gl, group]);
  return useBrushOverlay({ ...rest, canvas: gl.domElement, makeView, objectAt });
}
