import { Matrix, Vector3, type TransformNode } from '@babylonjs/core';
import type { TriangleMesh } from '@mixo-geocore/host/core/analysis/types';
import { brushHits, type BodySegments, type BrushOccluder, type BrushView } from '@mixo-geocore/editing/screenBrush';
import { sharedSession } from '@mixo-geocore/host/workers/geometryClient';
import type { BabylonCameraView } from '../babylonViewportPort';
import { AROUND_ANGLES, SUPPORT_REACH, type BrushBodyView } from '../useBrushOverlay';
import { handleFor } from './sessionHandles';
import type { SurfacePointer } from './surfacePointer';

/*
 * The two Babylon answers Drag over needs: the hit test over a unit's support bodies, and whether
 * the object is under a screen point. The rest of the brush is `useBrushOverlay.ts`, shared with
 * the three.js view; this is the twin of the two functions left in `useScreenBrush.ts`.
 *
 * THE MATRIX ORDER IS THE WHOLE RISK HERE, and it is invisible until a unit is off the origin.
 * Babylon stores a transform in the same memory order three.js does -- both upload `m` / `elements`
 * straight to a GL `mat4` -- but it MULTIPLIES the other way round: Babylon's `A.multiply(B)` is
 * "A then B" (row vectors), so its result is the memory of three's `B.multiply(A)`. The Rust core
 * wants three's column-major `projection x view x world`, which is written here as
 * `world.multiply(view).multiply(projection)`. Get it backwards and the brush answers confidently
 * about the wrong place, which reads as a picking bug and is a frame bug. `brushBodies.test.ts`
 * holds this against three.js' own matrices so it cannot drift.
 *
 * WHY `objectAt` FILTERS TO ONE UNIT. The three.js test raycasts from the brushed unit's OWN group,
 * so another unit standing in front does not block a stroke from starting. `hitAll` answers for
 * the whole scene, so the brushed unit's nearest hit is taken and the rest ignored -- the same
 * answer, not a similar one.
 */

/** `projection x view x world`, column-major, as `brushHits` wants it. */
export function brushClip(world: Matrix, camera: BabylonCameraView): number[] {
  return Array.from(world.multiply(camera.getViewMatrix()).multiply(camera.getProjectionMatrix()).m);
}

/** The eye in the support group's own space: `brushHits` works in support-local coordinates. */
export function eyeIn(world: Matrix, camera: BabylonCameraView): readonly [number, number, number] {
  const eye = Vector3.TransformCoordinates(camera.globalPosition, Matrix.Invert(world));
  return [eye.x, eye.y, eye.z];
}

/** A unit on screen: its model (the occluder geometry) and the node carrying its transform. */
export interface BrushUnit {
  id: string;
  source: TriangleMesh;
  node: TransformNode;
}

export interface BrushBodiesInput {
  camera: () => BabylonCameraView | null;
  pointer: () => SurfacePointer | null;
  /** Every unit drawn, for the occluders. */
  units: () => readonly BrushUnit[];
  /** The unit being brushed (the active one), or undefined when none is. */
  brushed: () => BrushUnit | undefined;
  /** Models hide supports only while the models are drawn (`modelVisible`). */
  modelVisible: () => boolean;
}

export function createBrushBodies(input: BrushBodiesInput): {
  makeView: (bodies: BodySegments) => BrushBodyView;
  objectAt: (at: readonly [number, number], radius: number) => boolean;
} {
  /*
   * Occluders: every drawn model, with its own frame. `toLocal` takes a point from the brushed
   * unit's space into the occluding model's space -- support-local -> world -> model-local, a rigid
   * placement, so distances carry over. `side` is 0 (front faces only) because the three.js view's
   * model material leaves `side` at its default `THREE.FrontSide`; it is read as a number by the
   * core, so matching the other view's value is the only thing that keeps the two in step.
   */
  const occludersFor = (world: Matrix): BrushOccluder[] => {
    if (!input.modelVisible()) return [];
    const found: BrushOccluder[] = [];
    for (const unit of input.units()) {
      const handle = handleFor(unit.source);
      if (handle === undefined) continue;
      unit.node.computeWorldMatrix(true);
      found.push({
        handle,
        toLocal: Array.from(world.multiply(Matrix.Invert(unit.node.getWorldMatrix())).m),
        side: 0,
      });
    }
    return found;
  };

  const makeView = (bodies: BodySegments): BrushBodyView => {
    let size = { width: 0, height: 0 };
    return {
      resize(width, height) {
        size = { width, height };
      },
      frame() {
        const session = sharedSession();
        const camera = input.camera();
        const unit = input.brushed();
        if (!session || !camera || !unit) return undefined;
        unit.node.computeWorldMatrix(true);
        const world = unit.node.getWorldMatrix();
        const view: BrushView = { clip: brushClip(world, camera), eye: eyeIn(world, camera), width: size.width, height: size.height };
        const occluders = occludersFor(world);
        return (job, want) => ({ hits: brushHits(session, bodies, occluders, view, job.from, job.to, job.radius, job.next, want), next: bodies.ids.length });
      },
    };
  };

  const objectAt = (at: readonly [number, number], radius: number): boolean => {
    const pointer = input.pointer();
    const unit = input.brushed();
    if (!pointer || !unit) return false;
    // `hitAll` is nearest-first, so the first of this unit's hits IS its nearest one.
    const nearest = (x: number, y: number) => pointer.hitAll(x, y).find((candidate) => candidate.unitId === unit.id);
    if (nearest(at[0], at[1])) return true;
    // A support is a thin line, so the circle grabs one from nearby; the model does not count out there.
    return SUPPORT_REACH.some((share) => AROUND_ANGLES.some((angle) =>
      nearest(at[0] + Math.cos(angle) * radius * share, at[1] + Math.sin(angle) * radius * share)?.kind === 'support'));
  };

  return { makeView, objectAt };
}
