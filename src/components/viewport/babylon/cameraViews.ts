import { Vector3, type ArcRotateCamera, type Scene, type TransformNode } from '@babylonjs/core';
import { belowPlate, boundsSphere, frameView, spotView } from '@mixo-geocore/editing/view';
import type { Vector } from '@mixo-geocore/host/core/vec3';
import type { ViewRequest } from '../types';

/*
 * The framed views -- Fit, Bottom, side -- the "Show me" focus, and the report that the camera has
 * crossed the plate. Ports `ViewCamera`, `FocusCamera` and `PlateSide` from `cameras.tsx`.
 *
 * ALL THE ARITHMETIC IS geocore's: `boundsSphere`, `frameView`, `spotView` and `belowPlate` are
 * renderer-free and shared with the three.js view, so the two frame a model identically rather
 * than similarly. Only two things are copied from `cameras.tsx` instead, because they live there:
 * the `side` case and the right-inset pan.
 *
 * ONE CONVERSION THAT WOULD SILENTLY MIS-FRAME EVERYTHING: three's `camera.fov` is in DEGREES and
 * Babylon's is in RADIANS, and `frameView` takes degrees. Hand it Babylon's number raw and every
 * framing is out by a factor of about 57 -- which does not look like a unit bug, it looks like the
 * camera stopping in the wrong place.
 */

/** Babylon's fov is radians; `frameView` and `spotView` want degrees, as three stores them. */
const degrees = (camera: ArcRotateCamera) => (camera.fov * 180) / Math.PI;

/** Point the camera at `target` from `position`, in the order an ArcRotateCamera needs. */
function place(camera: ArcRotateCamera, position: Vector, target: Vector): void {
  // Target first: `setPosition` derives alpha, beta and radius FROM the current target, so setting
  // position first and target second silently discards the position.
  camera.setTarget(new Vector3(...target));
  camera.setPosition(new Vector3(...position));
}

export interface CameraViewsInput {
  camera: ArcRotateCamera;
  canvas: HTMLCanvasElement;
  /** The node carrying each unit's transform, for the bounds of what is being framed. */
  nodeFor: (unitId: string) => TransformNode | undefined;
  onBelowPlate: (below: boolean) => void;
}

export interface CameraViews {
  /** Frames `unitIds`. `fit` keeps the current direction; `bottom` looks straight up; `side` is level. */
  frame(view: ViewRequest, unitIds: readonly string[]): void;
  /** Frames a check finding from the current direction (Show me). */
  focus(at: { point: Vector; area: number }): void;
  dispose(): void;
}

export function attachCameraViews(scene: Scene, input: CameraViewsInput): CameraViews {
  const { camera, canvas } = input;

  // The plate crossing is watched per frame, as three watches it with `useFrame`.
  let below = false;
  const watch = scene.onBeforeRenderObservable.add(() => {
    const now = belowPlate(camera.position.y);
    if (now === below) return;
    below = now;
    input.onBelowPlate(now);
  });

  return {
    frame(view, unitIds) {
      let min: Vector3 | undefined;
      let max: Vector3 | undefined;
      for (const id of unitIds) {
        const node = input.nodeFor(id);
        if (!node) continue;
        const bounds = node.getHierarchyBoundingVectors(true);
        min = min ? Vector3.Minimize(min, bounds.min) : bounds.min;
        max = max ? Vector3.Maximize(max, bounds.max) : bounds.max;
      }
      if (!min || !max) return;

      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      // A panel over the right edge: the model is fitted into the width left of it, and sits in
      // the middle of that.
      const inset = view.kind === 'fit' || view.kind === 'side'
        ? Math.min(Math.max(view.rightInset ?? 0, 0), width * 0.6)
        : 0;
      const sphere = boundsSphere({ min: [min.x, min.y, min.z], max: [max.x, max.y, max.z] });
      const free = Math.max(width - inset, 1);
      const radius = sphere.radius * Math.max(1, height / free);
      const fov = degrees(camera);

      // SIDE is its own case because `frameView` KEEPS the current direction for `fit`, and the
      // whole point of side is to leave the current direction for a known one: level with the
      // model, so the plate is edge-on and the print angle reads as the angle it is.
      const framed = view.kind === 'side'
        ? {
          position: [sphere.center[0] + Math.max(radius, 1) / Math.sin((fov * Math.PI) / 180 / 2) * 1.25, sphere.center[1], sphere.center[2]] as Vector,
          target: [...sphere.center] as Vector,
        }
        : frameView(
          { ...sphere, radius },
          fov,
          view.kind,
          { position: [camera.position.x, camera.position.y, camera.position.z], target: [camera.target.x, camera.target.y, camera.target.z] },
        );
      place(camera, framed.position, framed.target);

      if (inset > 0) {
        // Slide both camera and target along the camera's own right axis by half the hidden width,
        // so the model centres in what is left. three reads column 0 of the world matrix; Babylon's
        // row-major storage over row vectors puts the same three numbers at the same offsets.
        const world = camera.getWorldMatrix().m;
        const right = new Vector3(world[0]!, world[1]!, world[2]!).normalize();
        const perPixel = (2 * Vector3.Distance(camera.position, camera.target) * Math.tan((fov * Math.PI) / 180 / 2)) / height;
        right.scaleInPlace((inset / 2) * perPixel);
        place(
          camera,
          [camera.position.x + right.x, camera.position.y + right.y, camera.position.z + right.z],
          [camera.target.x + right.x, camera.target.y + right.y, camera.target.z + right.z],
        );
      }
    },

    focus(at) {
      const framed = spotView(at.point, at.area, degrees(camera), {
        position: [camera.position.x, camera.position.y, camera.position.z],
        target: [camera.target.x, camera.target.y, camera.target.z],
      });
      place(camera, framed.position, framed.target);
    },

    dispose() {
      scene.onBeforeRenderObservable.remove(watch);
    },
  };
}
