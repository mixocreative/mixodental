// Copyright (c) Mixo Creative.

import { distance, type Vector } from '@mixo-geocore/host/core/vec3';
import { CLICK_TOLERANCE } from '@mixo-geocore/editing/pick';
import { spanCurve } from '../../core/surfacePath/spline';
import { segments, type SurfacePath } from '../../core/surfacePath/path';
import { RIM_ANCHOR_RADIUS_MM, RIM_GRAB_REACH_MM, grabAnchor } from './rimDraftGeometry';

/**
 * WHAT A PRESS ON THE RIM MEANS: the target decides the act, not an armed tool.
 *
 * Rim define mode used to carry two tools, Place and Adjust, whose meaning flipped on whether the
 * loop was open or closed - Place could append to an open path and did nothing at all to a closed
 * one, so a seeded rim (always closed) opened on a tool that could not act. The owner named the real
 * problem: **creating a rim and correcting one should be the same interaction.** Whether the loop is
 * closed is a fact about the path, not a mode the operator should have to hold in their head.
 *
 * So there is one tool and this function is its whole grammar. Every press that lands something
 * picks it up in the same press - append-and-drag, insert-and-drag, grab-and-drag are one gesture.
 * That was first written up as the reason the old "ONLY PLACE PLACES" rule could go, and it was
 * wrong by one event: the BROWSER still fires a click on every release, and judges nothing. The
 * click's own guard is `rimTapAt` below; walk `u5d` is how the gap was found.
 *
 * Pure on purpose: a path and a point in, a verdict out, no React, no three.js, no pick. The whole
 * grammar is therefore testable without a browser, which matters because the suite cannot click.
 */

/** Where a press landed, and what it therefore does. */
export type RimTarget =
  /** On a handle: pick it up and drag it. */
  | { readonly kind: 'handle'; readonly at: number }
  /** On the drawn line: put a handle in at `at` (the index it takes) and pick it up. */
  | { readonly kind: 'insert'; readonly at: number; readonly position: Vector }
  /** On the first handle of an open loop with three or more points: join the loop. */
  | { readonly kind: 'close' }
  /** On bare model, loop still open: add a point at the end. */
  | { readonly kind: 'append' }
  /** On bare model, loop closed: nothing to do here, so the press turns the view instead. */
  | { readonly kind: 'none' };

/**
 * How far from the drawn line a press still counts as being ON it, mm.
 *
 * Wider than a handle's grab reach (0.84) because a line is a thinner thing to hit than a marker and
 * the cost of missing it is only that the press falls through to the camera.
 */
export const RIM_LINE_REACH_MM = 1;

/**
 * No handle is inserted within this of one that already exists, mm along the line.
 *
 * THE GUARD ON THE ONE WAY THIS GRAMMAR CAN BITE. A press that just misses a handle is within reach
 * of the line running through it, so without this rule it would silently drop a NEW handle a
 * fraction of a millimetre from the one the operator meant to drag - and they would not see it until
 * the shape went wrong. Inside this distance the press grabs the existing handle instead. It is the
 * same 2 mm `seedFromDetected` uses to say two handles that close together are one handle nobody can
 * separate; the reverse miss (an intended insert becomes a drag) is visible as it happens and undone
 * with one key.
 */
export const RIM_INSERT_CLEAR_MM = 2;

/**
 * The nearest point on the drawn curve: which span, where along it, and how far the press was.
 *
 * Walks `spanCurve`, which is the SAME sampler `rimDraftGeometry.linePositions` draws with. That is
 * not tidiness: a press is judged on exactly the points the operator was shown, so the two cannot
 * drift apart the way a chord drawn against a measured curve did (see `SPAN_SAMPLES`).
 */
function nearestOnCurve(path: SurfacePath, point: Vector): { span: [number, number]; position: Vector; away: number } | undefined {
  let best: { span: [number, number]; position: Vector; away: number } | undefined;
  for (const [from, to] of segments(path)) {
    for (const along of spanCurve(path, from, to)) {
      const away = distance(along, point);
      if (!best || away < best.away) best = { span: [from, to], position: along, away };
    }
  }
  return best;
}

/**
 * What a press at `point` does to `path`.
 *
 * Resolution order, and it matters: a handle always wins, because a press that nearly hits one must
 * become a drag of it rather than a new handle beside it. Closing comes first on an open loop, since
 * the first handle is the closing target while the loop is open and only becomes draggable once it
 * is joined.
 */
export function rimTargetAt(path: SurfacePath, point: Vector,
  { grabMm = RIM_GRAB_REACH_MM, lineMm = RIM_LINE_REACH_MM, clearMm = RIM_INSERT_CLEAR_MM } = {}): RimTarget {
  const anchors = path.anchors.length;
  if (anchors === 0) return path.closed ? { kind: 'none' } : { kind: 'append' };

  const held = grabAnchor(path, point, grabMm);
  // An open loop's first handle is the way to CLOSE it, which is what a press there has always meant.
  if (!path.closed && anchors >= 3 && held === 0
    && distance(path.anchors[0]!.position, point) <= RIM_ANCHOR_RADIUS_MM * 1.6) return { kind: 'close' };
  if (held !== undefined) return { kind: 'handle', at: held };

  const onLine = nearestOnCurve(path, point);
  if (onLine && onLine.away <= lineMm) {
    const [from, to] = onLine.span;
    // Too near a handle to be a new one: the operator was reaching for that handle, so hand it over.
    const nearFrom = distance(path.anchors[from]!.position, onLine.position);
    const nearTo = distance(path.anchors[to]!.position, onLine.position);
    if (nearFrom < clearMm) return { kind: 'handle', at: from };
    if (nearTo < clearMm) return { kind: 'handle', at: to };
    // The new handle takes the index after `from`, pushing the rest along.
    return { kind: 'insert', at: from + 1, position: onLine.position };
  }

  return path.closed ? { kind: 'none' } : { kind: 'append' };
}

/**
 * What a CLICK does - the event the browser fires on release - as opposed to a press.
 *
 * A CLICK THAT ENDS A DRAG IS NOT A TAP, and it cannot be told from one by looking at the path.
 * The browser fires `click` on release after every drag, and it arrives BEFORE React has rendered
 * the drag's result: the path the handler sees is the one from before the press, in which the
 * dragged handle still sits at its old spot and the release point reads as bare surface. Judged by
 * target alone, every drag of a handle on an open loop therefore ended by appending a new handle
 * under the pointer - which is exactly what walk `u5d` found when the two-tool guard ("only Place
 * places") came out. Pointer travel is the one fact the click carries that the path does not, so a
 * click that travelled further than the house click tolerance does nothing, whatever it landed on.
 * The same rule means a view turn that starts on the model no longer drops a point on release.
 */
export function rimTapAt(path: SurfacePath, point: Vector, travelPx: number): RimTarget {
  if (travelPx > CLICK_TOLERANCE) return { kind: 'none' };
  return rimTargetAt(path, point);
}
