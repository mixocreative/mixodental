import { Matrix, Vector3 } from '@babylonjs/core';
import type { ArcRotateCamera } from '@babylonjs/core';
import type { TriangleMesh } from '@mixo-geocore/host/core/analysis/types';
import type { Vector } from '@mixo-geocore/host/core/vec3';
import type { ModelTransform } from '@mixo-geocore/host/state/transform';
import { nextStamp, type ZoneStamp } from '@mixo-geocore/host/core/supports/zones';
import { sharedSession } from '@mixo-geocore/host/workers/geometryClient';
import type { Gesture } from '@mixo-geocore/editing/gesture';
import type { ViewRay } from '@mixo-geocore/editing/ViewportPort';
import { babylonPlacement } from '../babylonTransform';
import { createBabylonViewportPort } from '../babylonViewportPort';
import { handleFor } from './sessionHandles';

/*
 * Layer 0 of the Babylon port: the zone brush, which is the smallest pointer path that proves the
 * whole input chain -- screen point, engine pick, unit-local stamp, one stroke on the history.
 *
 * TWO THINGS HERE ARE EASY TO GET WRONG AND LOOK RIGHT.
 *
 * 1. `port.pick` works in the PICKED UNIT'S OWN FRAME, not world space, whatever `ViewportPort`'s
 *    comment says: the session mesh is loaded from the unit's own positions. So the world ray from
 *    `screenToRay` is converted per unit before picking, and the hit comes back already unit-local,
 *    which is exactly the frame a `ZoneStamp` wants. Skip the conversion and every unit that is not
 *    at the origin gets a confident hit on the wrong triangle.
 * 2. The camera must let go. `attachControl` otherwise keeps the drag and the model simply orbits
 *    while nothing is painted -- which is what this view did before this module existed.
 */

export interface ZoneBrushUnit {
  id: string;
  source: TriangleMesh;
  transform: ModelTransform;
}

export interface ZoneBrushInput {
  canvas: HTMLCanvasElement;
  camera: ArcRotateCamera;
  /** Read live: the units and the gesture change without this handler being rebuilt. */
  units: () => readonly ZoneBrushUnit[];
  gesture: () => Gesture;
  /** One call per finished drag, so one drag is one step on the history. */
  onZoneStroke: (unitId: string, stamps: ZoneStamp[]) => void;
}

interface Hit {
  unitId: string;
  point: Vector;
  normal: Vector;
  distance: number;
}

const toLocal = (ray: ViewRay, world: Matrix): ViewRay => {
  const inverse = world.clone().invert();
  const origin = Vector3.TransformCoordinates(new Vector3(...ray.origin), inverse);
  const direction = Vector3.TransformNormal(new Vector3(...ray.direction), inverse).normalize();
  return { origin: [origin.x, origin.y, origin.z], direction: [direction.x, direction.y, direction.z] };
};

const worldMatrix = (transform: ModelTransform): Matrix => {
  const { position, rotationQuaternion } = babylonPlacement(transform);
  const out = Matrix.Identity();
  Matrix.ComposeToRef(new Vector3(1, 1, 1), rotationQuaternion, position, out);
  return out;
};

/** Attaches the zone brush and returns its detacher. */
export function attachZoneBrush(input: ZoneBrushInput): () => void {
  const { canvas, camera } = input;
  /** handle -> the mesh behind it, so the port can read the triangle it picked. */
  const meshes = new Map<number, TriangleMesh>();

  const port = createBabylonViewportPort({
    camera,
    canvas,
    session: () => sharedSession() ?? undefined,
    mesh: (handle) => meshes.get(handle),
    // The support brush's clip and eye. Nothing in the zone path reads it, but it is part of the
    // port, and a lie here would be waiting for whoever wires the support brush next.
    brushView: () => ({
      clip: Array.from(camera.getViewMatrix().multiply(camera.getProjectionMatrix()).m),
      eye: [camera.globalPosition.x, camera.globalPosition.y, camera.globalPosition.z],
      width: canvas.clientWidth,
      height: canvas.clientHeight,
    }),
  });

  /** The nearest unit under the screen point, with the hit in that unit's own frame. */
  const hitAt = (x: number, y: number): Hit | undefined => {
    const ray = port.screenToRay([x, y]);
    if (!ray) return undefined;
    let best: Hit | undefined;
    for (const unit of input.units()) {
      const handle = handleFor(unit.source);
      if (handle === undefined) continue;
      meshes.set(handle, unit.source);
      const hit = port.pick(handle, toLocal(ray, worldMatrix(unit.transform)));
      if (hit && (!best || hit.distance < best.distance)) {
        best = { unitId: unit.id, point: hit.point, normal: hit.normal, distance: hit.distance };
      }
    }
    return best;
  };

  let stroke: { unitId: string; stamps: ZoneStamp[]; last: Vector } | undefined;

  const zoneBrush = () => {
    const gesture = input.gesture();
    return gesture.kind === 'zones' ? gesture.brush : undefined;
  };

  const lay = (hit: Hit, brush: { radius: number; kind: ZoneStamp['kind'] }) => {
    stroke!.stamps.push({ center: hit.point, normal: hit.normal, radius: brush.radius, kind: brush.kind });
    stroke!.last = hit.point;
  };

  const onDown = (event: PointerEvent) => {
    const brush = zoneBrush();
    if (!brush || event.button !== 0) return;
    const hit = hitAt(event.offsetX, event.offsetY);
    if (!hit) return;
    // Only now does the camera let go: a press that missed the model should still orbit.
    camera.detachControl();
    canvas.setPointerCapture(event.pointerId);
    stroke = { unitId: hit.unitId, stamps: [], last: hit.point };
    lay(hit, brush);
  };

  const onMove = (event: PointerEvent) => {
    const brush = zoneBrush();
    if (!stroke || !brush) return;
    const hit = hitAt(event.offsetX, event.offsetY);
    // A drag that leaves the model pauses the stroke rather than ending it, so going around a
    // curve and coming back is one stroke and one undo step.
    if (!hit || hit.unitId !== stroke.unitId) return;
    // geocore owns the spacing: a new dab once the brush has moved half a radius.
    if (nextStamp(stroke.last, hit.point, brush.radius)) lay(hit, brush);
  };

  const finish = (event: PointerEvent) => {
    if (!stroke) return;
    const { unitId, stamps } = stroke;
    stroke = undefined;
    try {
      canvas.releasePointerCapture(event.pointerId);
    } catch {
      // The capture was never taken, or the pointer has already gone.
    }
    camera.attachControl(canvas, true);
    if (stamps.length > 0) input.onZoneStroke(unitId, stamps);
  };

  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerup', finish);
  canvas.addEventListener('pointercancel', finish);
  return () => {
    canvas.removeEventListener('pointerdown', onDown);
    canvas.removeEventListener('pointermove', onMove);
    canvas.removeEventListener('pointerup', finish);
    canvas.removeEventListener('pointercancel', finish);
  };
}
