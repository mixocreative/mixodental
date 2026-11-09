import { add, distance, normalize, scale, type Vector } from '@mixo-geocore/host/core/vec3';
import { centripetalPoint, neighbourIndexes } from './spline';
import { segments, type SurfacePath } from './path';

/*
 * The dense curve between the anchors, following the model instead of cutting through it.
 *
 * A straight line between two anchors on a curved surface sinks into it, so each segment is walked at a
 * fixed spacing and every sample in between is put back ON the surface. Putting it back needs the mesh,
 * which this tree cannot have, so the caller passes the projection in: in the app that is the same pick
 * the rest of the editor uses, and in a test it is a function with a known answer.
 *
 * The anchors are what the operator edits. These points are the OUTPUT - what a dental rim is made of, or
 * what an open run is drawn along - and are never edited directly.
 */

/**
 * Puts `point` back on the surface, searching along `normal` (the surface normal the nearest anchor
 * reported, which is the direction the surface is most likely to be found in). Undefined when the surface
 * is not there - off an edge, or through a hole.
 */
export type ProjectToSurface = (point: Vector, normal: Vector) => Vector | undefined;

export interface ResampledPath {
  /** The dense curve, in order. A closed path does NOT repeat its first point, matching `DentalRim.points`. */
  points: readonly Vector[];
  /** How many in-between samples were asked for, and how many the surface was actually found for. */
  samples: number;
  projected: number;
}

/** Samples wanted along a segment of `span` at `spacing`, excluding both ends: at least none, never unbounded. */
function stepsFor(span: number, spacing: number, limit: number): number {
  if (!(span > 0) || !(spacing > 0)) return 0;
  return Math.max(0, Math.min(limit, Math.ceil(span / spacing) - 1));
}

/**
 * The anchors joined by surface-following samples at about `spacingMm`.
 *
 * A sample the surface could not be found for keeps its straight-line position rather than voiding the
 * whole curve: one unreachable spot on a long rim should not throw away the operator's work, and the
 * counts returned say how much of the curve is really on the model so the caller can speak up. Undefined
 * only when the path is too short to have a segment at all.
 *
 * `maxPerSegment` stops a pathological spacing (or two anchors a metre apart) from producing a curve big
 * enough to stall the frame; it bounds the work, it is not a quality setting.
 */
export function resamplePath(path: SurfacePath, spacingMm: number, project: ProjectToSurface,
  maxPerSegment = 512): ResampledPath | undefined {
  const edges = segments(path);
  if (edges.length === 0) return undefined;

  const points: Vector[] = [];
  let samples = 0;
  let projected = 0;

  for (const [i, j] of edges) {
    const from = path.anchors[i]!;
    const to = path.anchors[j]!;
    // The anchor itself is already on the surface: it is kept exactly, never re-projected.
    points.push(from.position);

    /*
     * THE SPAN IS A CURVE, NOT A CHORD (2026-11-09), and the reason is editability rather than
     * smoothness. The anchors are what the operator drags, so their NUMBER decides whether a rim can
     * be corrected by hand; joined by chords the only way to hug a curving rim is to crowd them, and
     * adaptive seeding needed 35 on the reference aligner. A curve carries the same shape on about a
     * dozen. It is also strictly truer for the SAME anchors: a hand-drawn rim at 6.6 mm spacing goes
     * from roughly 220 um of chord error to about 10 um.
     *
     * Centripetal, because seeded anchors are deliberately uneven - dense at a hairpin, sparse along
     * a run - and the uniform variant can bulge or cusp between unevenly spaced points, which on a
     * rim puts the support band off the trim. See `spline.ts`.
     */
    const [before, after] = neighbourIndexes(i, j, path.anchors.length, path.closed);
    const p0 = path.anchors[before]!.position;
    const p3 = path.anchors[after]!.position;

    const steps = stepsFor(distance(from.position, to.position), spacingMm, maxPerSegment);
    for (let step = 1; step <= steps; step += 1) {
      const t = step / (steps + 1);
      const along = centripetalPoint(p0, from.position, to.position, p3, t);
      // The normal is carried across the segment the same way the point is, so a sample near either anchor
      // searches the way that anchor's surface faced.
      const normal = normalize(add(scale(from.normal, 1 - t), scale(to.normal, t)));
      samples += 1;
      const landed = project(along, normal);
      if (landed) projected += 1;
      points.push(landed ?? along);
    }
  }

  // An open path ends at its last anchor; a closed one has already come back round to its first.
  if (!path.closed) points.push(path.anchors[path.anchors.length - 1]!.position);
  return { points, samples, projected };
}

/** The resampled curve as the flat `Float32Array` the engine's rim calls take (xyz per point). */
export function pathPointArray(resampled: ResampledPath): Float32Array {
  const out = new Float32Array(resampled.points.length * 3);
  resampled.points.forEach((point, at) => out.set(point, at * 3));
  return out;
}
