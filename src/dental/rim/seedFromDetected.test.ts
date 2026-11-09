import { describe, expect, it } from 'vitest';
import type { DentalRim } from '@mixo-geocore/host/dental/dental';
import { pathProblems } from '../../core/surfacePath/validate';
import { SEED_MAX_ANCHORS, SEED_MIN_ANCHORS, SEED_SPACING_MM, seedRimDraft } from './seedFromDetected';

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
  it('spaces the anchors along the rim, with no pair on top of each other', () => {
    const seeded = seedRimDraft(ringRim(400))!;
    for (const gap of spacings(seeded)) {
      expect(gap).toBeGreaterThan(SEED_SPACING_MM / 2);
      expect(gap).toBeLessThan(SEED_SPACING_MM * 2);
    }
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
