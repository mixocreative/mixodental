import * as THREE from 'three';
import type { Vector } from '@mixo-geocore/host/core/vec3';
import type { BrushView, Point2 } from '@mixo-geocore/editing/screenBrush';
import type { SurfacePick, ViewportPort, ViewportSize, ViewRay } from '@mixo-geocore/editing/ViewportPort';
import { enginePick, type EnginePickOptions } from './enginePick';

/*
 * The three.js implementation of the shared editing seam (mixo-geocore editing/ViewportPort, D22):
 * everything the renderer-free editing code asks of the view, answered from the app's camera and
 * canvas. Picking goes through the engine session (`GeometrySession.pick`), like `rustRaycast`, so
 * both apps hit the same triangle. Drawing (rings, ghost tips, overlays) stays in the components.
 *
 * `babylonViewportPort.ts` is its twin, and `viewportPort.test.ts` holds both to the same answers.
 * Anything true of the view rather than of three.js belongs in `enginePick.ts`, where one copy
 * serves both, rather than here.
 */

export type { PickSession } from './enginePick';

export interface ThreePortOptions extends EnginePickOptions {
  camera: THREE.Camera;
  /** The canvas (or anything with its CSS size); read on every call, so a resize needs no rebuild. */
  canvas: { clientWidth: number; clientHeight: number };
  devicePixelRatio?: () => number;
  /** Clip matrix and eye for the support group (see `useScreenBrush`). */
  brushView: () => BrushView;
}

const point = new THREE.Vector3();
const raycaster = new THREE.Raycaster();

export function createThreeViewportPort(options: ThreePortOptions): ViewportPort {
  const { camera, canvas } = options;
  const size = (): ViewportSize => ({
    width: canvas.clientWidth,
    height: canvas.clientHeight,
    devicePixelRatio: options.devicePixelRatio?.() ?? (typeof window === 'undefined' ? 1 : window.devicePixelRatio),
  });
  return {
    size,
    screenToRay([x, y]: Point2): ViewRay | undefined {
      const { width, height } = size();
      if (width <= 0 || height <= 0) return undefined;
      camera.updateMatrixWorld();
      raycaster.setFromCamera(new THREE.Vector2((x / width) * 2 - 1, -(y / height) * 2 + 1), camera);
      const { origin, direction } = raycaster.ray;
      if (![origin.x, origin.y, origin.z, direction.x, direction.y, direction.z].every(Number.isFinite)) return undefined;
      return { origin: [origin.x, origin.y, origin.z], direction: [direction.x, direction.y, direction.z] };
    },
    worldToScreen(world: Vector): Point2 | undefined {
      const { width, height } = size();
      camera.updateMatrixWorld();
      point.set(world[0], world[1], world[2]).applyMatrix4(camera.matrixWorldInverse);
      // Camera space looks down -z: a point at z >= 0 is behind a perspective camera.
      if ((camera as THREE.PerspectiveCamera).isPerspectiveCamera && point.z >= 0) return undefined;
      point.applyMatrix4(camera.projectionMatrix);
      if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) return undefined;
      return [(point.x * 0.5 + 0.5) * width, (-point.y * 0.5 + 0.5) * height];
    },
    pick(handle: number, ray: ViewRay): SurfacePick | undefined {
      return enginePick(options, handle, ray);
    },
    brushView: options.brushView,
  };
}
