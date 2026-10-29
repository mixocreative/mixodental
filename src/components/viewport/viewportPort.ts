import * as THREE from 'three';
import type { Vector } from '@mixo-geocore/host/core/vec3';
import type { BrushView, Point2 } from '@mixo-geocore/editing/screenBrush';
import type { PointerRecord, SurfacePick, ViewportPort, ViewportSize, ViewRay } from '@mixo-geocore/editing/ViewportPort';

/*
 * The three.js implementation of the shared editing seam (mixo-geocore editing/ViewportPort, D22):
 * everything the renderer-free editing code asks of the view, answered from the app's camera and
 * canvas. Picking goes through the engine session (`GeometrySession.pick`), like `rustRaycast`, so
 * both apps hit the same triangle. Drawing (rings, ghost tips, overlays) stays in the components.
 */

/** What the port needs of the engine session. */
export interface PickSession {
  pick(handle: number, rays: Float64Array, near: number, far: number, side: number): Float64Array;
}

export interface ThreePortOptions {
  camera: THREE.Camera;
  /** The canvas (or anything with its CSS size); read on every call, so a resize needs no rebuild. */
  canvas: { clientWidth: number; clientHeight: number };
  devicePixelRatio?: () => number;
  /** The engine session that owns the picked meshes; undefined before the engine is ready. */
  session: () => PickSession | undefined;
  /** A session mesh's triangles (unit-local), for the hit normal. */
  mesh: (handle: number) => { positions: ArrayLike<number>; indices: ArrayLike<number> } | undefined;
  /** Clip matrix and eye for the support group (see `useScreenBrush`). */
  brushView: () => BrushView;
  /** 0 front, 1 back, 2 double sided (default). */
  side?: number;
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
      const session = options.session();
      if (!session) return undefined;
      const out = session.pick(handle, Float64Array.of(...ray.origin, ...ray.direction), 0, Infinity, options.side ?? 2);
      const face = out[0]!;
      if (face < 0) return undefined;
      const mesh = options.mesh(handle);
      if (!mesh) return undefined;
      const corner = (k: number): Vector => {
        const at = mesh.indices[face * 3 + k]! * 3;
        return [mesh.positions[at]!, mesh.positions[at + 1]!, mesh.positions[at + 2]!];
      };
      const [a, b, c] = [corner(0), corner(1), corner(2)];
      // Normal of (c - b) x (a - b): the winding the viewport renders and the exports write.
      const u = [c[0] - b[0], c[1] - b[1], c[2] - b[2]];
      const v = [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
      const n = [u[1]! * v[2]! - u[2]! * v[1]!, u[2]! * v[0]! - u[0]! * v[2]!, u[0]! * v[1]! - u[1]! * v[0]!];
      const length = Math.hypot(n[0]!, n[1]!, n[2]!) || 1;
      return { point: [out[2]!, out[3]!, out[4]!], normal: [n[0]! / length + 0, n[1]! / length + 0, n[2]! / length + 0], triangle: face, distance: out[1]! };
    },
    brushView: options.brushView,
  };
}

/** A DOM pointer event reduced to what editing needs, relative to `element`'s top-left corner. */
export function pointerRecord(event: PointerEvent, element: { getBoundingClientRect(): { left: number; top: number } }): PointerRecord {
  const box = element.getBoundingClientRect();
  return {
    pointerId: event.pointerId,
    x: event.clientX - box.left,
    y: event.clientY - box.top,
    button: event.button === 2 ? 'right' : event.button === 1 ? 'middle' : 'left',
    buttons: event.buttons,
    shiftKey: event.shiftKey,
    ctrlKey: event.ctrlKey,
    altKey: event.altKey,
    metaKey: event.metaKey,
    timeStamp: event.timeStamp,
  };
}
