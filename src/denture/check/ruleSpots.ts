import type { TriangleMesh } from '@mixo-geocore/host/core/analysis/types';
import type { Vector } from '@mixo-geocore/host/core/vec3';
import type { GenerateRules } from '@mixo-geocore/host/supports/generateRules';
import { reviewDenture } from '@mixo-geocore/host/dental/dentureReview';

/*
 * The denture policy's verdict on the spots the support check finds (runs in the denture worker). The check itself
 * is the shared overhang check: it lists every down-facing patch far from a tip. A denture is not supported that
 * way: its tips stand only in the allowed area, around holes and along the rim (the engine's review masks), so a
 * patch elsewhere is left unsupported on purpose. This tells which spots those are and why, from the same masks
 * the build reads, so the check and the build report never disagree. Pure over a mesh, a profile and points.
 */

/** Why a spot is accepted: the denture rules leave it unsupported on purpose. */
export type RuleReason = 'no-support' | 'outside-allowed' | 'rim';

/** Index of the face whose centroid is nearest to each point (unit-local mm). */
function nearestFaces(mesh: TriangleMesh, points: readonly Vector[]): Int32Array {
  const best = new Int32Array(points.length).fill(-1);
  const bestDistance = new Float64Array(points.length).fill(Infinity);
  const { positions, indices } = mesh;
  for (let face = 0; face < indices.length / 3; face += 1) {
    const a = indices[face * 3]! * 3;
    const b = indices[face * 3 + 1]! * 3;
    const c = indices[face * 3 + 2]! * 3;
    const x = (positions[a]! + positions[b]! + positions[c]!) / 3;
    const y = (positions[a + 1]! + positions[b + 1]! + positions[c + 1]!) / 3;
    const z = (positions[a + 2]! + positions[b + 2]! + positions[c + 2]!) / 3;
    for (let k = 0; k < points.length; k += 1) {
      const p = points[k]!;
      const distance = (x - p[0]) ** 2 + (y - p[1]) ** 2 + (z - p[2]) ** 2;
      if (distance < bestDistance[k]!) { bestDistance[k] = distance; best[k] = face; }
    }
  }
  return best;
}

/** The reason of a face the review masks leave unsupported on purpose, or null when the denture rules support it. */
export function reasonOfFace(masks: { allowed: number; holeBand: number; noSupport: number; rimBand: number }): RuleReason | null {
  if (masks.allowed || masks.holeBand) return null;
  if (masks.noSupport) return 'no-support';
  return masks.rimBand ? 'rim' : 'outside-allowed';
}

/**
 * For each point (unit-local) its reason when the denture rules deliberately leave it unsupported, else null.
 * The masks do not depend on the print tilt, so the upright review serves every pose. A mesh the review cannot
 * judge (too small for a box) leaves every point as it was: null.
 */
export function ruleReasons(mesh: TriangleMesh, profileId: string, points: readonly Vector[], rules?: GenerateRules): (RuleReason | null)[] {
  if (points.length === 0) return [];
  const review = reviewDenture(mesh, profileId, 0, rules);
  if (!review) return points.map(() => null);
  const faces = nearestFaces(mesh, points);
  return Array.from(faces, (face) => (face < 0 ? null : reasonOfFace({
    allowed: review.allowedMask[face] ?? 0, holeBand: review.holeBandMask[face] ?? 0, noSupport: review.noSupportMask[face] ?? 0, rimBand: review.rimBandMask[face] ?? 0,
  })));
}
