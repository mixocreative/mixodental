import { add, cross, distance, dot, length, normalize, scale, subtract, type Vector } from '@mixo-geocore/host/core/vec3';
import { segments, type SurfacePath } from './path';

/*
 * The plane a closed surface path lies in, and the 2D frame on it.
 *
 * A drawn loop is never exactly planar - it follows a curved surface - so this is a best-fit plane through
 * its anchors. Everything that needs the loop as a flat shape (its area, whether it crosses itself, which
 * way the opening faces) reads it through this frame, so "the loop's plane" is decided once.
 *
 * NOT by Newell's method, which is the usual answer for a nearly planar polygon and is wrong here. Newell
 * sums signed areas, so a loop that crosses itself cancels: a symmetric bowtie returns a ZERO normal even
 * though its four anchors share a perfectly good plane. The frame would then be undefined and the loop
 * would be reported as collinear - the one diagnosis a reader cannot act on, for the one shape they most
 * need told about. So the plane is spanned by the anchors that are furthest apart, which no winding can
 * cancel, and the area is measured separately IN that plane (`planarDoubleArea`).
 */

/**
 * How far the widest anchor must sit off the line through the two furthest apart, as a fraction of the
 * distance between those two, before the anchors are taken to span a plane at all. Below it they are a
 * line with wobble, and any normal fitted to them is noise.
 */
export const MIN_PLANE_SPAN_RATIO = 1e-6;

/** A closed path's plane and the orthonormal frame on it. */
export interface PathFrame {
  centroid: Vector;
  /** Unit normal of the fitted plane. Its SIDE is arbitrary here - see `facingNormal`. */
  normal: Vector;
  /** Unit vectors spanning the plane, with `cross(tangent, bitangent)` equal to `normal`. */
  tangent: Vector;
  bitangent: Vector;
  /** Twice the plane-projected (shoelace) area: zero for a line, and for a loop whose windings cancel. */
  planarDoubleArea: number;
}

/** Mean of the anchor positions. Undefined for an empty path. */
export function pathCentroid(path: SurfacePath): Vector | undefined {
  if (path.anchors.length === 0) return undefined;
  const total = path.anchors.reduce<Vector>((sum, anchor) => add(sum, anchor.position), [0, 0, 0]);
  return scale(total, 1 / path.anchors.length);
}

/**
 * The three anchors that span the path most widely: the two furthest apart, and the one furthest from the
 * line between them. Their plane is the path's. Two passes, and no winding to cancel.
 */
function spanningThree(path: SurfacePath): readonly [Vector, Vector, Vector] | undefined {
  const points = path.anchors.map((anchor) => anchor.position);
  if (points.length < 3) return undefined;

  let a = points[0]!;
  let b = points[1]!;
  let widest = -1;
  for (let i = 0; i < points.length; i += 1) {
    for (let j = i + 1; j < points.length; j += 1) {
      const span = distance(points[i]!, points[j]!);
      if (span > widest) { widest = span; a = points[i]!; b = points[j]!; }
    }
  }
  if (!(widest > 0)) return undefined;

  const along = scale(subtract(b, a), 1 / widest);
  let c: Vector | undefined;
  let furthest = -1;
  for (const point of points) {
    const offset = subtract(point, a);
    // Distance from the line, as the part of the offset square to it.
    const aside = length(subtract(offset, scale(along, dot(offset, along))));
    if (aside > furthest) { furthest = aside; c = point; }
  }
  return c && furthest > MIN_PLANE_SPAN_RATIO * widest ? [a, b, c] : undefined;
}

/**
 * An orthonormal pair spanning the plane of `normal`, chosen from the world axis LEAST aligned with it so
 * the cross product never collapses. The pair's own rotation in the plane is arbitrary and nothing here
 * depends on it.
 */
function basisOf(normal: Vector): { tangent: Vector; bitangent: Vector } {
  const [x, y, z] = [Math.abs(normal[0]), Math.abs(normal[1]), Math.abs(normal[2])];
  const axis: Vector = x <= y && x <= z ? [1, 0, 0] : y <= z ? [0, 1, 0] : [0, 0, 1];
  const tangent = normalize(cross(axis, normal));
  return { tangent, bitangent: normalize(cross(normal, tangent)) };
}

/** Twice the shoelace area of the plane coordinates `flat`, signed by their winding. */
function shoelaceDouble(flat: readonly (readonly [number, number])[]): number {
  let sum = 0;
  for (let i = 0; i < flat.length; i += 1) {
    const [x1, y1] = flat[i]!;
    const [x2, y2] = flat[(i + 1) % flat.length]!;
    sum += x1 * y2 - x2 * y1;
  }
  return sum;
}

/**
 * The frame of a CLOSED path. Undefined for an open path (a line lies in many planes and none of them is
 * the line's own), and when the anchors are collinear, where there is no plane to speak of. Callers that
 * want to tell a reader WHY use `validate.ts`.
 */
export function pathFrame(path: SurfacePath): PathFrame | undefined {
  if (!path.closed) return undefined;
  const centroid = pathCentroid(path);
  const spanning = spanningThree(path);
  if (!centroid || !spanning) return undefined;

  const [a, b, c] = spanning;
  const perpendicular = cross(subtract(b, a), subtract(c, a));
  if (!(length(perpendicular) > 0)) return undefined;
  const normal = normalize(perpendicular);
  if (!normal.every(Number.isFinite)) return undefined;

  const basis = basisOf(normal);
  const partial: PathFrame = { centroid, normal, ...basis, planarDoubleArea: 0 };
  return { ...partial, planarDoubleArea: Math.abs(shoelaceDouble(anchorsInPlane(path, partial))) };
}

/** A point in the frame's plane coordinates, measured from the centroid. */
export const toPlane = (frame: PathFrame, point: Vector): readonly [number, number] => {
  const offset = subtract(point, frame.centroid);
  return [dot(offset, frame.tangent), dot(offset, frame.bitangent)];
};

/** The path's anchors as plane coordinates, in order. */
export const anchorsInPlane = (path: SurfacePath, frame: PathFrame): readonly (readonly [number, number])[] =>
  path.anchors.map((anchor) => toPlane(frame, anchor.position));

/**
 * `frame.normal` turned to the side `facing` points at, since a fitted plane's normal has two directions
 * and cannot say which one is wanted. This is how the dental rim gets its opening direction, where the side
 * is the OPERATOR's answer and must never be inferred from the drawing order: which way a loop winds
 * depends on which side it was drawn from, so inferring it would hand back whatever the camera happened to
 * be doing. A normal exactly square to `facing` is left as it is.
 */
export function facingNormal(frame: PathFrame, facing: Vector): Vector | undefined {
  if (!facing.every(Number.isFinite) || !(length(facing) > 0)) return undefined;
  return dot(frame.normal, facing) < 0 ? scale(frame.normal, -1) : frame.normal;
}

/** The length of the path's segments: the perimeter of a closed loop, the run of an open line. */
export function pathLength(path: SurfacePath): number {
  let total = 0;
  for (const [i, j] of segments(path)) total += distance(path.anchors[j]!.position, path.anchors[i]!.position);
  return total;
}
