import type { Vector } from '@mixo-geocore/host/core/vec3';

/*
 * A run of points the operator placed ON a model's surface, open or closed.
 *
 * Closed is what the dental rim needs (`src/dental/rim`): a loop round the aligner's opening, drawn when
 * detection could not find one. Open is the same thing without the join, kept here because the two differ
 * only in whether the last anchor leads back to the first - a measuring line, a trim line or a marked run
 * on any model is the same list with `closed: false`.
 *
 * Nothing here knows about aligners, dentures, three.js or React. Every edit returns a NEW path, so the
 * host can make one edit one undo step; nothing mutates in place.
 */

/** One point the operator placed: where it landed on the surface, and the surface normal there. */
export interface SurfaceAnchor {
  /** Unit-local, on the surface (a pick hit, not a point floating in space). */
  position: Vector;
  /** Unit-local surface normal at that point, as the pick reported it. */
  normal: Vector;
}

/** An ordered run of anchors on one model's surface; `closed` joins the last anchor back to the first. */
export interface SurfacePath {
  anchors: readonly SurfaceAnchor[];
  closed: boolean;
}

/** The fewest anchors each shape can have: a line needs two ends, a loop needs three sides. */
export const MIN_OPEN_ANCHORS = 2;
export const MIN_CLOSED_ANCHORS = 3;

export const emptyPath = (): SurfacePath => ({ anchors: [], closed: false });

/** Whether `at` names an anchor of `path`. */
export const hasAnchor = (path: SurfacePath, at: number): boolean => Number.isInteger(at) && at >= 0 && at < path.anchors.length;

/**
 * The anchor pairs each segment runs between, as index pairs. A closed path has one segment per anchor
 * (the last joins back to the first); an open path has one fewer. Every other module reads the shape of
 * the path through this, so "closed" is decided in one place.
 */
export function segments(path: SurfacePath): readonly [number, number][] {
  const n = path.anchors.length;
  const count = path.closed ? n : n - 1;
  const out: [number, number][] = [];
  for (let i = 0; i < count; i += 1) out.push([i, (i + 1) % n]);
  return out;
}

/** Adds an anchor at the end. A closed path has no end to add to: open it, or insert into a segment. */
export function appendAnchor(path: SurfacePath, anchor: SurfaceAnchor): SurfacePath | undefined {
  if (path.closed) return undefined;
  return { ...path, anchors: [...path.anchors, anchor] };
}

/**
 * Puts an anchor into the path at `at`, pushing the rest along: `at` 0 puts it first, `at` length puts it
 * last. This is how a drawn loop is refined without starting again - insert into the segment that strays
 * from the surface and move it onto it.
 */
export function insertAnchor(path: SurfacePath, at: number, anchor: SurfaceAnchor): SurfacePath | undefined {
  if (!Number.isInteger(at) || at < 0 || at > path.anchors.length) return undefined;
  const anchors = [...path.anchors];
  anchors.splice(at, 0, anchor);
  return { ...path, anchors };
}

/** Moves one anchor. The host calls this once when a drag ENDS, so the drag is one undo step. */
export function moveAnchor(path: SurfacePath, at: number, anchor: SurfaceAnchor): SurfacePath | undefined {
  if (!hasAnchor(path, at)) return undefined;
  const anchors = [...path.anchors];
  anchors[at] = anchor;
  return { ...path, anchors };
}

/**
 * Removes one anchor. Refused when it would leave a CLOSED path with fewer than three anchors: silently
 * opening the loop instead would throw away the operator's "this is a loop" with no sign of it. Open the
 * path first if that is what is meant.
 */
export function removeAnchor(path: SurfacePath, at: number): SurfacePath | undefined {
  if (!hasAnchor(path, at)) return undefined;
  if (path.closed && path.anchors.length - 1 < MIN_CLOSED_ANCHORS) return undefined;
  return { ...path, anchors: path.anchors.filter((_, index) => index !== at) };
}

/** Joins the last anchor back to the first. Refused below three anchors: two anchors enclose nothing. */
export function closePath(path: SurfacePath): SurfacePath | undefined {
  if (path.closed || path.anchors.length < MIN_CLOSED_ANCHORS) return undefined;
  return { ...path, closed: true };
}

/** Breaks the join, leaving the same anchors as a line. */
export function openPath(path: SurfacePath): SurfacePath | undefined {
  return path.closed ? { ...path, closed: false } : undefined;
}
