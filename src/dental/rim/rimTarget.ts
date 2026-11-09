// Copyright (c) Mixo Creative.

import { distance, type Vector } from '@mixo-geocore/host/core/vec3';
import { centripetalPoint, neighbourIndexes } from '../../core/surfacePath/spline';
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
 * picks it up in the same press - append-and-drag, insert-and-drag, grab-and-drag are one gesture -
 * which is also why the old "ONLY PLACE PLACES" rule could go: there is never a release with
 * anything left to drop.
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

/** How many points each span is sampled at when looking for the nearest point on the drawn curve. */
const SPAN_SAMPLES = 12;

/** The nearest point on the drawn curve: which span, where along it, and how far the press was. */
function nearestOnCurve(path: SurfacePath, point: Vector): { span: [number, number]; position: Vector; away: number } | undefined {
  let best: { span: [number, number]; position: Vector; away: number } | undefined;
  for (const [from, to] of segments(path)) {
    const [before, after] = neighbourIndexes(from, to, path.anchors.length, path.closed);
    const p0 = path.anchors[before]!.position;
    const p1 = path.anchors[from]!.position;
    const p2 = path.anchors[to]!.position;
    const p3 = path.anchors[after]!.position;
    for (let step = 0; step <= SPAN_SAMPLES; step += 1) {
      const along = centripetalPoint(p0, p1, p2, p3, step / SPAN_SAMPLES);
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
