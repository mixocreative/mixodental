import type { ArcRotateCamera } from '@babylonjs/core';
import type { Vector } from '@mixo-geocore/host/core/vec3';
import { nextStamp, type ZoneStamp } from '@mixo-geocore/host/core/supports/zones';
import type { Gesture } from '@mixo-geocore/editing/gesture';
import type { SurfacePointer } from './surfacePointer';

/*
 * Layer 0 of the Babylon port: the zone brush, the smallest pointer path that proves the whole
 * input chain -- screen point, engine pick, unit-local stamp, one stroke on the history.
 *
 * The frame rule lives in `surfacePointer.ts`, which hands back the hit in BOTH frames; a stamp
 * stores the unit-local one. What is left here is the gesture: when a drag paints, how far the
 * brush must move before the next dab, and when the camera is allowed to have the pointer back.
 */

export interface ZoneBrushInput {
  canvas: HTMLCanvasElement;
  camera: ArcRotateCamera;
  pointer: SurfacePointer;
  /** Read live: the gesture changes without this handler being rebuilt. */
  gesture: () => Gesture;
  /** One call per finished drag, so one drag is one step on the history. */
  onZoneStroke: (unitId: string, stamps: ZoneStamp[]) => void;
}

/** Attaches the zone brush and returns its detacher. */
export function attachZoneBrush(input: ZoneBrushInput): () => void {
  const { canvas, camera, pointer } = input;
  let stroke: { unitId: string; stamps: ZoneStamp[]; last: Vector } | undefined;

  const zoneBrush = () => {
    const gesture = input.gesture();
    return gesture.kind === 'zones' ? gesture.brush : undefined;
  };

  const onDown = (event: PointerEvent) => {
    const brush = zoneBrush();
    if (!brush || event.button !== 0) return;
    const hit = pointer.hitAt(event.offsetX, event.offsetY);
    if (!hit) return;
    // Only now does the camera let go: a press that MISSED the model should still orbit.
    camera.detachControl();
    canvas.setPointerCapture(event.pointerId);
    stroke = { unitId: hit.unitId, stamps: [], last: hit.point };
    stroke.stamps.push({ center: hit.point, normal: hit.normal, radius: brush.radius, kind: brush.kind });
  };

  const onMove = (event: PointerEvent) => {
    const brush = zoneBrush();
    if (!stroke || !brush) return;
    const hit = pointer.hitAt(event.offsetX, event.offsetY);
    // A drag that leaves the model PAUSES the stroke rather than ending it, so going round a curve
    // and coming back is one stroke and one undo step.
    if (!hit || hit.unitId !== stroke.unitId) return;
    // geocore owns the spacing: a new dab once the brush has moved half a radius.
    if (!nextStamp(stroke.last, hit.point, brush.radius)) return;
    stroke.stamps.push({ center: hit.point, normal: hit.normal, radius: brush.radius, kind: brush.kind });
    stroke.last = hit.point;
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
