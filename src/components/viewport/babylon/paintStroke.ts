import type { ArcRotateCamera } from '@babylonjs/core';
import { createStroke, zoneFill } from '@mixo-geocore/editing/stroke';
import { appendSurfaceStamps, type SurfaceStamp } from '@mixo-geocore/editing/surfaceBrush';
import type { Vector } from '@mixo-geocore/host/core/vec3';
import { attachOrbit } from './orbit';
import type { SurfacePointer } from './surfacePointer';

/*
 * A brush stroke painted on a model's surface: the no-support zones, and the dental support area.
 *
 * ONE HANDLER, NOT ONE PER BRUSH. Both strokes are the same gesture on the same canvas and only
 * one can be live at a time, so the caller resolves which brush is active -- and where its finished
 * stroke goes -- and this module runs it. Two handlers both taking pointer capture on the same
 * canvas would fight over the same press.
 *
 * IT RUNS THE SAME STROKE OBJECT AND THE SAME FILL RULE AS `UnitObject`, and the first draft did
 * not. That draft recorded one hit per press plus one every half radius, and turned the lot into
 * stamps on release. It looked right and it was not, in two ways the walk measured as "2 stamps
 * where three lays 1":
 *
 *   - IT LEFT GAPS. `zoneFill` fills the space between two samples with `stampsAlong`, so a fast
 *     drag paints a continuous band. Sampling alone paints a dotted line, and the faster the drag
 *     the more it looks like a different tool;
 *   - IT SPACED ITS OWN SAMPLES. `createStroke` remembers the last centre it laid and `zoneFill`
 *     decides when the next one is due; a second rule doing that outside the stroke is a second
 *     answer to the same question.
 *
 * THE PRESS ITSELF LAYS A STAMP, and that is three's behaviour, not a convenience: `startStroke`
 * calls `paint(event)` straight after `begin`, so a press and release without moving leaves one
 * dab. Leaving it out here made a short stroke paint nothing where the other view painted a dot.
 *
 * Both rules are geocore's and renderer-free, which is the whole point: the stamps this lays are
 * the stamps the other view lays, because they come out of the same function rather than out of two
 * readings of it.
 *
 * The domain's own vocabulary is kept: a zone stamp is `paint`/`erase` and a dental one is
 * `allow`/`erase`, and neither is translated here.
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
  /**
   * The stamps laid SO FAR in the stroke, so the view can draw them while the pointer is still
   * down. `UnitObject` keeps the same list in state and draws `[...unit.zones, ...stroke]`; without
   * it the paint would not appear until the release, which is a different tool to use.
   */
  onLive: (unitId: string | undefined, stamps: readonly SurfaceStamp<string>[]) => void;
}

/** Attaches the surface brush and returns its detacher. */
export function attachSurfaceBrush(input: SurfaceBrushInput): () => void {
  const { canvas, camera, pointer } = input;
  let held: { unitId: string; brush: ActiveBrush; stamps: SurfaceStamp<string>[] } | undefined;
  let pointerId: number | undefined;

  /** Runs once each time an open stroke ends, however it ends. */
  const finish = () => {
    const stroke = held;
    held = undefined;
    if (pointerId !== undefined) {
      try {
        canvas.releasePointerCapture(pointerId);
      } catch {
        // The capture was never taken, or the pointer has already gone.
      }
      pointerId = undefined;
    }
    // The camera comes back however the stroke ends -- released, cancelled, the window blurred, or
    // the brush taken out of the operator's hand. Leaving the orbit off would be a worse fault than
    // the one this guards: a viewport that silently stops turning.
    attachOrbit(camera, canvas);
    input.onLive(undefined, []);
    if (stroke && stroke.stamps.length > 0) stroke.brush.commit(stroke.unitId, stroke.stamps);
  };

  const stroke = createStroke(finish);

  /** One hit on the surface, turned into however many stamps the stroke says are due. */
  const sample = (hit: { unitId: string; point: Vector; normal: Vector }) => {
    if (!held || hit.unitId !== held.unitId) return;
    const centres = stroke.samples(hit.point, zoneFill(held.brush.radius));
    if (centres.length === 0) return;
    // The filled-in centres share this hit's normal, exactly as `UnitObject` shares it: they are
    // points along one short step of a surface, not separate hits of their own.
    const fresh = appendSurfaceStamps(held.brush.kind, held.brush.radius, centres.map((point) => ({ point, normal: hit.normal })));
    held.stamps = [...held.stamps, ...fresh];
    input.onLive(held.unitId, held.stamps);
  };

  const onDown = (event: PointerEvent) => {
    const brush = input.brush();
    if (!brush || event.button !== 0) return;
    const hit = pointer.hitAt(event.offsetX, event.offsetY);
    if (!hit) return;
    if (!stroke.begin(event.button)) return;
    camera.detachControl();
    canvas.setPointerCapture(event.pointerId);
    pointerId = event.pointerId;
    held = { unitId: hit.unitId, brush, stamps: [] };
    sample(hit);
  };

  const onMove = (event: PointerEvent) => {
    if (!held) return;
    // A move with no button held is a release the window never saw; the stroke ends on it.
    if (stroke.move((event.buttons & 1) !== 0) !== 'sample') return;
    const hit = pointer.hitAt(event.offsetX, event.offsetY);
    // A drag that leaves the model PAUSES the stroke rather than ending it, so going round a curve
    // and coming back is one stroke and one undo step.
    if (hit) sample(hit);
  };

  const end = () => void stroke.end();

  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointercancel', end);
  window.addEventListener('blur', end);
  return () => {
    canvas.removeEventListener('pointerdown', onDown);
    canvas.removeEventListener('pointermove', onMove);
    canvas.removeEventListener('pointerup', end);
    canvas.removeEventListener('pointercancel', end);
    window.removeEventListener('blur', end);
    stroke.end();
  };
}
