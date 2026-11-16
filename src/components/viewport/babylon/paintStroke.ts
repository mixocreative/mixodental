import type { ArcRotateCamera } from '@babylonjs/core';
import type { Vector } from '@mixo-geocore/host/core/vec3';
import { nextStamp } from '@mixo-geocore/host/core/supports/zones';
import { appendSurfaceStamps, type SurfaceHit, type SurfaceStamp } from '@mixo-geocore/editing/surfaceBrush';
import type { SurfacePointer } from './surfacePointer';

/*
 * A brush stroke painted on a model's surface: the no-support zones, and the dental support area.
 *
 * ONE HANDLER, NOT ONE PER BRUSH. Both strokes are the same gesture on the same canvas and only
 * one can be live at a time, so the caller resolves which brush is active -- and where its finished
 * stroke goes -- and this module runs it. Two handlers both taking pointer capture on the same
 * canvas would fight over the same press.
 *
 * The domain's own vocabulary is kept: a zone stamp is `paint`/`erase` and a dental one is
 * `allow`/`erase`, and neither is translated here. geocore owns both halves of the rest --
 * `nextStamp` decides when the brush has moved far enough for another dab (half a radius), and
 * `appendSurfaceStamps` turns the finished stroke's hits into stamps. Building the stamps here by
 * hand would be a second copy of a rule that already exists, and it would skip that function's
 * guard against a non-positive radius.
 *
 * THE CAMERA LETS GO ONLY AFTER A PRESS THAT HIT THE MODEL, so a press on empty space still orbits.
 * That is the house rule: where the drag starts decides.
 */

export interface ActiveBrush<K extends string = string> {
  radius: number;
  kind: K;
  /** Where the finished stroke goes: `onZoneStroke` or `onDentalStroke`. */
  commit: (unitId: string, stamps: SurfaceStamp<K>[]) => void;
}

export interface SurfaceBrushInput {
  canvas: HTMLCanvasElement;
  camera: ArcRotateCamera;
  pointer: SurfacePointer;
  /** The brush in hand, or undefined when this gesture does not paint. Read live. */
  brush: () => ActiveBrush | undefined;
}

/** Attaches the surface brush and returns its detacher. */
export function attachSurfaceBrush(input: SurfaceBrushInput): () => void {
  const { canvas, camera, pointer } = input;
  let stroke: { unitId: string; brush: ActiveBrush; hits: SurfaceHit[]; last: Vector } | undefined;

  const onDown = (event: PointerEvent) => {
    const brush = input.brush();
    if (!brush || event.button !== 0) return;
    const hit = pointer.hitAt(event.offsetX, event.offsetY);
    if (!hit) return;
    camera.detachControl();
    canvas.setPointerCapture(event.pointerId);
    stroke = { unitId: hit.unitId, brush, hits: [], last: hit.point };
    stroke.hits.push({ point: hit.point, normal: hit.normal });
  };

  const onMove = (event: PointerEvent) => {
    if (!stroke) return;
    const hit = pointer.hitAt(event.offsetX, event.offsetY);
    // A drag that leaves the model PAUSES the stroke rather than ending it, so going round a curve
    // and coming back is one stroke and one undo step.
    if (!hit || hit.unitId !== stroke.unitId) return;
    if (!nextStamp(stroke.last, hit.point, stroke.brush.radius)) return;
    stroke.hits.push({ point: hit.point, normal: hit.normal });
    stroke.last = hit.point;
  };

  const finish = (event: PointerEvent) => {
    if (!stroke) return;
    const { unitId, brush, hits } = stroke;
    stroke = undefined;
    try {
      canvas.releasePointerCapture(event.pointerId);
    } catch {
      // The capture was never taken, or the pointer has already gone.
    }
    camera.attachControl(canvas, true);
    if (hits.length > 0) brush.commit(unitId, appendSurfaceStamps(brush.kind, brush.radius, hits));
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
