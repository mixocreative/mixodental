import { Matrix, Vector3 } from '@babylonjs/core/Maths/math.vector';
import type { Vector } from '@mixo-geocore/host/core/vec3';
import type { BrushView, Point2 } from '@mixo-geocore/editing/screenBrush';
import type { SurfacePick, ViewportPort, ViewportSize, ViewRay } from '@mixo-geocore/editing/ViewportPort';
import { enginePick, type EnginePickOptions } from './enginePick';

/*
 * The Babylon.js implementation of the shared editing seam (mixo-geocore editing/ViewportPort,
 * D22) — the twin of `viewportPort.ts`, built so the two can be read side by side and so the same
 * test can hold both to the same answers. Picking goes through the engine session, not Babylon's
 * own `scene.pick`, so both renderers hit the same triangle.
 *
 * THE SCENE MUST BE RIGHT-HANDED: `scene.useRightHandedSystem = true`. Babylon's default is
 * left-handed, and in a left-handed scene every value crossing this port needs mirroring in Z
 * (`src/core/handedness.ts` is that mirror, written for exactly this case). Right-handed keeps the
 * core's frame, three.js' frame and the Rust engine's frame as one frame, so nothing is converted
 * and no sign can be forgotten on one path and not another.
 */

/** Babylon's `Camera.PERSPECTIVE_CAMERA`, inlined so this module imports no camera class. */
const PERSPECTIVE = 0;

/**
 * What the port needs of a Babylon camera. A real `Camera` satisfies this structurally, and so
 * does a pair of matrices built straight from `Matrix.LookAtRH` / `Matrix.PerspectiveFovRH`, which
 * is how the shared test drives it with no Engine and no Scene.
 */
export interface BabylonCameraView {
  getViewMatrix(): Matrix;
  getProjectionMatrix(): Matrix;
  readonly globalPosition: Vector3;
  /** 0 perspective, 1 orthographic. */
  readonly mode: number;
}

export interface BabylonPortOptions extends EnginePickOptions {
  camera: BabylonCameraView;
  /** The canvas (or anything with its CSS size); read on every call, so a resize needs no rebuild. */
  canvas: { clientWidth: number; clientHeight: number };
  devicePixelRatio?: () => number;
  /** Clip matrix and eye for the support group (see `useScreenBrush`). */
  brushView: () => BrushView;
}

const cameraSpace = new Vector3();
const clip = new Vector3();
const direction = new Vector3();
const world = new Matrix();

export function createBabylonViewportPort(options: BabylonPortOptions): ViewportPort {
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
      const nx = (x / width) * 2 - 1;
      const ny = -(y / height) * 2 + 1;
      // Only the projection's x and y scales are read, never its depth row: Babylon maps near and
      // far to a different range than three.js does, and a port that read it would answer
      // differently from its twin for the same camera.
      const p = camera.getProjectionMatrix().m;
      const [sx, sy] = [p[0]!, p[5]!];
      if (!sx || !sy) return undefined;
      camera.getViewMatrix().invertToRef(world);
      if (camera.mode === PERSPECTIVE) {
        // Camera space looks down -z, so the ray through (nx, ny) leaves the eye along
        // (nx / sx, ny / sy, -1).
        direction.set(nx / sx, ny / sy, -1);
        Vector3.TransformNormalToRef(direction, world, direction);
        const length = direction.length();
        if (!length || !Number.isFinite(length)) return undefined;
        direction.scaleInPlace(1 / length);
        const eye = camera.globalPosition;
        if (![eye.x, eye.y, eye.z, direction.x, direction.y, direction.z].every(Number.isFinite)) return undefined;
        return { origin: [eye.x, eye.y, eye.z], direction: [direction.x, direction.y, direction.z] };
      }
      // Orthographic: every ray runs down -z, and the off-centre shift lives in m[12] and m[13].
      cameraSpace.set((nx - p[12]!) / sx, (ny - p[13]!) / sy, 0);
      Vector3.TransformCoordinatesToRef(cameraSpace, world, cameraSpace);
      direction.set(0, 0, -1);
      Vector3.TransformNormalToRef(direction, world, direction);
      direction.normalize();
      if (![cameraSpace.x, cameraSpace.y, cameraSpace.z, direction.x, direction.y, direction.z].every(Number.isFinite)) return undefined;
      return { origin: [cameraSpace.x, cameraSpace.y, cameraSpace.z], direction: [direction.x, direction.y, direction.z] };
    },
    worldToScreen(point: Vector): Point2 | undefined {
      const { width, height } = size();
      cameraSpace.set(point[0], point[1], point[2]);
      Vector3.TransformCoordinatesToRef(cameraSpace, camera.getViewMatrix(), cameraSpace);
      // Camera space looks down -z: a point at z >= 0 is behind a perspective camera.
      if (camera.mode === PERSPECTIVE && cameraSpace.z >= 0) return undefined;
      Vector3.TransformCoordinatesToRef(cameraSpace, camera.getProjectionMatrix(), clip);
      if (!Number.isFinite(clip.x) || !Number.isFinite(clip.y)) return undefined;
      return [(clip.x * 0.5 + 0.5) * width, (-clip.y * 0.5 + 0.5) * height];
    },
    pick(handle: number, ray: ViewRay): SurfacePick | undefined {
      return enginePick(options, handle, ray);
    },
    brushView: options.brushView,
  };
}
