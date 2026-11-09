import { describe, expect, it } from 'vitest';
import type { DentalRim } from '@mixo-geocore/host/dental/dental';
import { pathProblems } from '../../core/surfacePath/validate';
import { resamplePath } from '../../core/surfacePath/resample';
import { SEED_MAX_ANCHORS, SEED_MIN_ANCHORS, SEED_MIN_GAP_MM, SEED_SPACING_MM, seedRimDraft } from './seedFromDetected';

/** A detected rim as a circle of `count` points of radius `radius` mm in the y = 0 plane. */
function ringRim(count: number, radius = 12.6): DentalRim {
  const points = new Float32Array(count * 3);
  for (let index = 0; index < count; index += 1) {
    const angle = (index / count) * Math.PI * 2;
    points[index * 3] = Math.cos(angle) * radius;
    points[index * 3 + 2] = Math.sin(angle) * radius;
  }
  return { boundaryKind: 'lower-edge-loop', points, openingDirection: [0, 1, 0], centroid: [0, 0, 0],
    tangent: [1, 0, 0], bitangent: [0, 0, 1], visibilityMask: new Uint8Array(0), visibilityResolution: 0,
    visibilityMin: [0, 0], visibilityMax: [0, 0] };
}

/** Half the length of the stadium's straight sides, mm. */
const STADIUM_HALF = 30;

/** Two straight runs joined by two semicircles: the shape where "by arc length" and "by heading" differ. */
function stadiumRim(radius = 6): DentalRim {
  const points: number[] = [];
  const push = (x: number, z: number) => points.push(x, 0, z);
  const step = 0.5;
  for (let x = -STADIUM_HALF; x < STADIUM_HALF; x += step) push(x, radius);
  for (let angle = 0; angle < Math.PI; angle += step / radius) push(STADIUM_HALF + Math.sin(angle) * radius, Math.cos(angle) * radius);
  for (let x = STADIUM_HALF; x > -STADIUM_HALF; x -= step) push(x, -radius);
  for (let angle = 0; angle < Math.PI; angle += step / radius) push(-STADIUM_HALF - Math.sin(angle) * radius, -Math.cos(angle) * radius);
  return { ...ringRim(3), points: new Float32Array(points) };
}

/** A long straight run with scanner-sized noise on it, and short ends to close the loop. */
function jitteredStraight(): DentalRim {
  const points: number[] = [];
  let seed = 7;
  const noise = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return ((seed / 2147483648) - 0.5) * 0.1; };
  for (let x = -STADIUM_HALF; x < STADIUM_HALF; x += 0.5) points.push(x, 0, noise());
  for (let x = STADIUM_HALF; x > -STADIUM_HALF; x -= 0.5) points.push(x, 0, 8 + noise());
  return { ...ringRim(3), points: new Float32Array(points) };
}

const spacings = (path: { anchors: readonly { position: readonly number[] }[] }): number[] =>
  path.anchors.map((anchor, index) => {
    const next = path.anchors[(index + 1) % path.anchors.length]!.position;
    return Math.hypot(anchor.position[0]! - next[0]!, anchor.position[1]! - next[1]!, anchor.position[2]! - next[2]!);
  });

describe('a detected rim as a drawing the operator can edit', () => {
  /*
   * THE RULE: what comes back has to be a rim the drawing mode would ACCEPT. Rim define mode refuses
   * a path `pathProblems` complains about, and Done refuses one that is not closed with at least
   * three anchors - so a seed that produced either would show the operator a rim they could not
   * finish, which is worse than not offering the press.
   */
  it('gives back a closed path the drawing mode accepts', () => {
    for (const count of [3, 8, 158, 2665]) {
      const seeded = seedRimDraft(ringRim(count));
      expect(seeded, `count ${count}`).toBeDefined();
      expect(seeded!.closed, `count ${count}`).toBe(true);
      expect(seeded!.anchors.length, `count ${count}`).toBeGreaterThanOrEqual(SEED_MIN_ANCHORS);
      expect(pathProblems(seeded!), `count ${count}`).toEqual([]);
    }
  });

  /*
   * Spaced by ARC LENGTH, not by index. A ring is the case where the two agree, so the assertion
   * that earns its place is the bound: no gap much larger than the spacing (the projection between
   * two anchors has to be a correction, not a rescue) and none at zero (two handles in one place).
   */
  it('never puts two handles inside the grab reach of each other', () => {
    for (const rim of [ringRim(400), stadiumRim(), jitteredStraight()]) {
      const seeded = seedRimDraft(rim);
      if (!seeded) continue;
      for (const between of spacings(seeded)) expect(between).toBeGreaterThanOrEqual(SEED_MIN_GAP_MM * 0.99);
    }
  });

  /*
   * THE RULE, ON A SHAPE THAT HAS BOTH: a stadium is two straight runs joined by two semicircles.
   * The straights must be spaced by arc length alone and the bends must be denser, because that is
   * the whole point of measuring heading - an arc-length stride would space them identically and
   * miss the corners, which is exactly where an operator reaches first.
   */
  it('puts more handles on the bends than on the straights', () => {
    const seeded = seedRimDraft(stadiumRim())!;
    const onBend = seeded.anchors.filter((anchor) => Math.abs(anchor.position[0]!) > STADIUM_HALF - 0.001).length;
    const onStraight = seeded.anchors.length - onBend;
    /*
     * DENSITY, NOT SHARE, and the first version of this test got that wrong. This stadium's straights
     * are 120 mm against 37.7 mm of bend, so even spacing already gives the bends only ~24% of the
     * anchors and a "more than half" assertion fails on a rule that is working perfectly. What the
     * rule promises is handles per millimetre WHERE THE RIM TURNS, so that is what is measured.
     */
    const bendDensity = onBend / (2 * Math.PI * 6);
    const straightDensity = onStraight / (STADIUM_HALF * 4);
    expect(onStraight).toBeGreaterThan(0);
    expect(bendDensity / straightDensity).toBeGreaterThan(1.2);
  });

  /*
   * AND THE TRAP THAT RULE WALKS INTO IF IT IS WRITTEN THE OBVIOUS WAY. Detection's points sit about
   * 0.5 mm apart on a real scan and they JITTER; summing the turn between neighbouring segments is
   * mostly noise, and it sprinkles handles along a dead straight run - clutter the operator meets as
   * a defect. Heading is measured over a millimetre of curve for this reason, and this is the test
   * that fails if that ever becomes a per-point difference again.
   */
  it('is not fooled by scanner jitter on a straight run', () => {
    const seeded = seedRimDraft(jitteredStraight())!;
    const straightRun = seeded.anchors.filter((anchor) => Math.abs(anchor.position[2]!) < 0.4).length;
    const ideal = (STADIUM_HALF * 2) / SEED_SPACING_MM;
    expect(straightRun).toBeLessThan(ideal * 2);
  });

  it('stays workable on a rim long enough to flood it with handles', () => {
    const seeded = seedRimDraft(ringRim(5000, 400))!;
    expect(seeded.anchors.length).toBeLessThanOrEqual(SEED_MAX_ANCHORS);
    expect(pathProblems(seeded)).toEqual([]);
  });

  /*
   * The anchors are detection's OWN points, not an approximation of them: they are already on the
   * surface, which is what lets `resamplePath` keep them exactly and only project what lies between.
   */
  it('keeps detection’s own points rather than inventing new ones', () => {
    const rim = ringRim(120);
    const seeded = seedRimDraft(rim)!;
    const detected = Array.from({ length: 120 }, (_, index) => [rim.points[index * 3], rim.points[index * 3 + 1], rim.points[index * 3 + 2]].join(','));
    for (const anchor of seeded.anchors) expect(detected).toContain(anchor.position.join(','));
  });

  it('declines a rim with too little curve to make a loop from', () => {
    expect(seedRimDraft(ringRim(2))).toBeUndefined();
    expect(seedRimDraft(ringRim(0))).toBeUndefined();
    // A rim far smaller than the spacing collapses to fewer than three anchors rather than pretending.
    expect(seedRimDraft(ringRim(8, 0.05))).toBeUndefined();
  });
});

/*
 * THE GATE ON THE CURVE ITSELF: how far the drawn rim strays from the one detection traced.
 *
 * This is the measurement that lets the thresholds be 12 mm and 45 degrees instead of 3 mm and 20.
 * Ground truth is detection's OWN loop - the points the seed was taken from - which beats comparing
 * visibility-mask cells, because a drawn rim's plane already differs from detection's by 5.6 degrees
 * and that pollutes any mask count before the curve is even considered.
 *
 * The distance is SIGNED about the loop's centre: positive is a BULGE away from it, negative a
 * cut-in. They are reported apart because they are not equally bad - a bulge puts the support band
 * off the trim, a cut-in of the same size lands it a little inside, and only the first is the error
 * this spline was chosen to avoid.
 */
describe('how far the drawn curve strays from the rim detection traced', () => {
  /** The seeded anchors, resampled the way `drawnRim` resamples them, with no surface to project onto. */
  const curveOf = (rim: DentalRim, spacing = 0.5) => {
    const path = seedRimDraft(rim)!;
    return resamplePath(path, spacing, (point) => point)!.points;
  };

  /*
   * DISTANCE TO THE TRUTH LINE, NOT TO ITS SAMPLES - and the first version of this got that wrong.
   * Detection's points sit about 1 mm apart, so measuring to the NEAREST POINT charges every sample
   * up to half that spacing for being between two of them: it scored a perfect curve at 0.38 mm and
   * failed a 32 um error. The truth is the polyline those points describe, so the distance is to its
   * SEGMENTS.
   */
  const toSegment = (p: [number, number], a: [number, number], b: [number, number]): number => {
    const vx = b[0] - a[0];
    const vz = b[1] - a[1];
    const len2 = vx * vx + vz * vz;
    const t = len2 > 0 ? Math.max(0, Math.min(1, ((p[0] - a[0]) * vx + (p[1] - a[1]) * vz) / len2)) : 0;
    return Math.hypot(p[0] - (a[0] + t * vx), p[1] - (a[1] + t * vz));
  };

  const strayOf = (rim: DentalRim) => {
    const count = Math.floor(rim.points.length / 3);
    const truth: [number, number][] = Array.from({ length: count }, (_, at) => [rim.points[at * 3]!, rim.points[at * 3 + 2]!]);
    const centre = truth.reduce((sum, [x, z]) => [sum[0] + x / count, sum[1] + z / count], [0, 0]) as [number, number];
    const truthRadius = truth.reduce((sum, [x, z]) => sum + Math.hypot(x - centre[0], z - centre[1]) / count, 0);
    const readings = curveOf(rim).map((point) => {
      const here: [number, number] = [point[0], point[2]];
      let nearest = Infinity;
      for (let at = 0; at < truth.length; at += 1) nearest = Math.min(nearest, toSegment(here, truth[at]!, truth[(at + 1) % truth.length]!));
      // Signed about the loop's centre: positive is a bulge away from it, negative a cut-in.
      return { nearest, signed: Math.hypot(here[0] - centre[0], here[1] - centre[1]) - truthRadius };
    });
    const sorted = readings.map((entry) => entry.nearest).sort((a, b) => a - b);
    return {
      median: sorted[Math.floor(sorted.length / 2)]!,
      max: Math.max(...readings.map((entry) => entry.nearest)),
      bulge: Math.max(...readings.map((entry) => entry.signed)),
      cutIn: -Math.min(...readings.map((entry) => entry.signed)),
    };
  };

  it('tracks a smooth arch within half a mask cell, on a dozen handles', () => {
    const arch = ringRim(158, 25);
    const seeded = seedRimDraft(arch)!;
    const stray = strayOf(arch);
    expect(seeded.anchors.length, `handles ${seeded.anchors.length}`).toBeGreaterThanOrEqual(8);
    expect(seeded.anchors.length, `handles ${seeded.anchors.length}`).toBeLessThanOrEqual(16);
    expect(stray.median, `median ${stray.median}`).toBeLessThan(0.05);
    expect(stray.max, `max ${stray.max}`).toBeLessThan(0.2);
  });

  /*
   * THE OVERSHOOT GUARD, and the reason the spline is centripetal rather than uniform. A hairpin is
   * where an unevenly-spaced curve bulges if it is going to, and a bulge off the trim is the error
   * that reaches the supports. Measured outward, gated well under half a mask cell.
   */
  it('does not bulge off a hairpin', () => {
    const stray = strayOf(ringRim(80, 5));
    expect(stray.bulge, `bulge ${stray.bulge}, cut-in ${stray.cutIn}`).toBeLessThan(0.1);
  });
});
