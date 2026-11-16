import { Matrix, Vector3 } from '@babylonjs/core';
import type { ArcRotateCamera } from '@babylonjs/core';
import type { TriangleMesh } from '@mixo-geocore/host/core/analysis/types';
import type { Vector } from '@mixo-geocore/host/core/vec3';
import type { ModelTransform } from '@mixo-geocore/host/state/transform';
import { sharedSession } from '@mixo-geocore/host/workers/geometryClient';
import type { ViewportPort, ViewRay } from '@mixo-geocore/editing/ViewportPort';
import { babylonPlacement } from '../babylonTransform';
import { createBabylonViewportPort } from '../babylonViewportPort';
import { handleFor } from './sessionHandles';

/*
 * One job: what is under a screen point, for every Babylon layer that needs to know.
 *
 * THE FRAME RULE THIS MODULE EXISTS TO HOLD IN ONE PLACE. `port.pick` works in the PICKED UNIT'S
 * OWN frame, not world space, whatever `ViewportPort`'s comment says: the engine's session mesh is
 * loaded from that unit's positions. So the world ray is converted per unit before picking, and the
 * hit comes back unit-local. Both frames are then handed out, because they are wanted for different
 * things and converting in each caller is how one of them would come to disagree with the others:
 *
 *   - `point` / `normal` are UNIT-LOCAL, which is what a stamp or an edit stores;
 *   - `world` is the same hit in world space, which is where a marker is drawn.
 */

export interface PointerUnit {
  id: string;
  source: TriangleMesh;
  transform: ModelTransform;
}

export interface SurfaceHit {
  unitId: string;
  /** Unit-local, the frame edits are stored in. */
  point: Vector;
  /** Unit-local surface normal. */
  normal: Vector;
  /** The same hit in world space, for drawing. */
  world: { point: Vector; normal: Vector };
  distance: number;
}

export interface SurfacePointer {
  /** The nearest unit under a canvas point, or undefined for a miss. */
  hitAt(x: number, y: number): SurfaceHit | undefined;
  /** The port itself, for the few things that want a ray or a projection rather than a hit. */
  port: ViewportPort;
}

const worldMatrix = (transform: ModelTransform): Matrix => {
  const { position, rotationQuaternion } = babylonPlacement(transform);
  const out = Matrix.Identity();
  Matrix.ComposeToRef(new Vector3(1, 1, 1), rotationQuaternion, position, out);
  return out;
};

const rayInto = (ray: ViewRay, inverse: Matrix): ViewRay => {
  const origin = Vector3.TransformCoordinates(new Vector3(...ray.origin), inverse);
  const direction = Vector3.TransformNormal(new Vector3(...ray.direction), inverse).normalize();
  return { origin: [origin.x, origin.y, origin.z], direction: [direction.x, direction.y, direction.z] };
};

export function createSurfacePointer(options: {
  canvas: HTMLCanvasElement;
  camera: ArcRotateCamera;
  units: () => readonly PointerUnit[];
}): SurfacePointer {
  const { canvas, camera } = options;
  /** handle -> the mesh behind it, so the port can read the triangle it picked. */
  const meshes = new Map<number, TriangleMesh>();

  const port = createBabylonViewportPort({
    camera,
    canvas,
    session: () => sharedSession() ?? undefined,
    mesh: (handle) => meshes.get(handle),
    // The support brush's clip and eye. The zone and tip paths do not read it, but it is part of
    // the port, and a stub here would be a trap set for whoever wires the support brush next.
    brushView: () => ({
      clip: Array.from(camera.getViewMatrix().multiply(camera.getProjectionMatrix()).m),
      eye: [camera.globalPosition.x, camera.globalPosition.y, camera.globalPosition.z],
      width: canvas.clientWidth,
      height: canvas.clientHeight,
    }),
  });

  return {
    port,
    hitAt(x, y) {
      const ray = port.screenToRay([x, y]);
      if (!ray) return undefined;
      let best: SurfaceHit | undefined;
      for (const unit of options.units()) {
        const handle = handleFor(unit.source);
        if (handle === undefined) continue;
        meshes.set(handle, unit.source);
        const world = worldMatrix(unit.transform);
        const hit = port.pick(handle, rayInto(ray, world.clone().invert()));
        if (!hit || (best && hit.distance >= best.distance)) continue;
        const point = Vector3.TransformCoordinates(new Vector3(...hit.point), world);
        const normal = Vector3.TransformNormal(new Vector3(...hit.normal), world).normalize();
        best = {
          unitId: unit.id,
          point: hit.point,
          normal: hit.normal,
          world: { point: [point.x, point.y, point.z], normal: [normal.x, normal.y, normal.z] },
          distance: hit.distance,
        };
      }
      return best;
    },
  };
}
