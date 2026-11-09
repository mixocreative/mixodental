// Copyright (c) Mixo Creative.

import { add, distance, scale, type Vector } from '@mixo-geocore/host/core/vec3';

/**
 * A CENTRIPETAL CATMULL-ROM CURVE THROUGH THE ANCHORS, which is what lets a dozen handles describe a
 * rim that needed thirty-five as straight chords.
 *
 * WHY THIS EXISTS AT ALL, since "the curve is smoother" is not a reason on its own. The anchors are
 * what the operator drags, so their NUMBER decides whether the loop can be edited by hand. Joined by
 * chords, the only way to hug a curving rim is to put handles close together: the adaptive seeding
 * gave the reference aligner 35, and nobody corrects a 35-handle loop. Joined by a curve, the same
 * fidelity survives at three or four times the spacing.
 *
 * The arithmetic, for points on an arc of radius R at angular step theta: a CHORD misses the arc at
 * mid-span by `R*theta^2/8`; this curve misses it by about `3*R*theta^4/128`. On the arch front
 * (R about 25 mm) that is 45 um for chords at 3 mm spacing against **31 um for the curve at 12 mm**.
 * On a molar hairpin (R about 5 mm) it is 225 um for chords at 3 mm against **45 um for the curve at
 * a 45-degree step**. Fewer handles AND a truer line; the fidelity argument and the editability
 * argument point the same way once the curve is doing the work.
 *
 * WHY CENTRIPETAL (alpha = 0.5) AND NOT THE UNIFORM KIND, which is the one most people write.
 * Adaptive seeding produces anchors that are deliberately UNEVENLY spaced - dense at a hairpin,
 * sparse along a run - and uniform Catmull-Rom through uneven points can cusp, loop, or bulge within
 * a segment. On a rim a bulge is not cosmetic: it puts the band's middle line off the trim, which is
 * where the supports go. Centripetal parameterisation is the variant proved to have no cusps or
 * self-intersections inside a segment and to stay near its control polygon (Yuksel, Schaefer and
 * Keyser, 2011), so it is the only one considered here.
 *
 * It is NOT "never outside the true arc": on a circle it runs slightly INSIDE at mid-span, the same
 * side as a chord and far smaller, and it can run a little outside near a sharp asymmetric corner.
 * That is measured rather than assumed - `seedFromDetected`'s tests compare the curve against
 * detection's own loop and bound the outward bulge.
 */

/** Knot spacing exponent: 0.5 is the centripetal variant (0 uniform, 1 chordal). */
const ALPHA = 0.5;

/**
 * The point at `s` (0..1) along the span from `p1` to `p2`, curved by its neighbours `p0` and `p3`.
 *
 * Barry-Goldman's pyramid rather than the matrix form, because it is the one that stays correct when
 * two knots coincide - which happens the moment two anchors land on the same spot, and a NaN in a rim
 * is a curve that silently disappears.
 */
export function centripetalPoint(p0: Vector, p1: Vector, p2: Vector, p3: Vector, s: number): Vector {
  const next = (knot: number, a: Vector, b: Vector): number => knot + Math.pow(distance(a, b), ALPHA);
  const t0 = 0;
  const t1 = next(t0, p0, p1);
  const t2 = next(t1, p1, p2);
  const t3 = next(t2, p2, p3);
  // A zero-length span has no interior to interpolate; the anchors themselves are kept by the caller.
  if (!(t2 > t1)) return p1;
  const t = t1 + s * (t2 - t1);
  const between = (a: Vector, b: Vector, ta: number, tb: number): Vector => {
    if (!(tb > ta)) return b;
    const f = (t - ta) / (tb - ta);
    return add(scale(a, 1 - f), scale(b, f));
  };
  const a1 = between(p0, p1, t0, t1);
  const a2 = between(p1, p2, t1, t2);
  const a3 = between(p2, p3, t2, t3);
  const b1 = between(a1, a2, t0, t2);
  const b2 = between(a2, a3, t1, t3);
  return between(b1, b2, t1, t2);
}

/**
 * The neighbours of the span `from`..`to` in a path of `count` anchors.
 *
 * A closed loop wraps, so every span has two real neighbours and the curve closes on itself with no
 * seam. An open path has no anchor beyond its ends, so the end anchor stands in for its own
 * neighbour - which makes the first and last spans behave like the chord they are today rather than
 * inventing a direction the operator never drew.
 */
export function neighbourIndexes(from: number, to: number, count: number, closed: boolean): [number, number] {
  const before = closed ? (from - 1 + count) % count : Math.max(0, from - 1);
  const after = closed ? (to + 1) % count : Math.min(count - 1, to + 1);
  return [before, after];
}
