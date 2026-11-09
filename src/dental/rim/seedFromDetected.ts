// Copyright (c) Mixo Creative.

import type { DentalRim } from '@mixo-geocore/host/dental/dental';
import type { Vector } from '@mixo-geocore/host/core/vec3';
import type { SurfaceAnchor, SurfacePath } from '../../core/surfacePath/path';

/**
 * A DETECTED RIM, TURNED BACK INTO SOMETHING THE OPERATOR CAN DRAG.
 *
 * Detection returns a dense closed curve (`DentalRim.points`, 158 of them on the reference aligner).
 * Rim define mode works in ANCHORS - a dozen or so points, placed and dragged - so a detected rim
 * cannot be edited until it is expressed in those terms. This is that translation, and it is the
 * whole reason redrawing a detected rim is possible at all rather than starting from an empty model.
 *
 * WHAT THE OPERATOR IS TRADING, AND WHY THE UI HAS TO SAY SO. A drawn rim does not reproduce a
 * detected one, and that is measured, not feared: feeding the reference aligner's OWN detected loop
 * back through `dental_rim_from_points` returns an axis **5.60 degrees** from detection's, because
 * detection's axis is the shell's least-variance axis and a drawn rim's is the plane of the loop it
 * traced (`docs/handoff/geocore-rim-from-points.md`, delivered engine 61). The masks agree in 8,919
 * of 9,216 cells. So this is not a lossless edit of the detected rim - it REPLACES it with a hand
 * one whose support area sits slightly differently, and the command's own words say that before the
 * operator commits to it.
 *
 * WHY EVERY ANCHOR GETS THE SAME NORMAL, which looks wrong and is not. `SurfaceAnchor.normal` is
 * documented as the normal the pick reported, and these anchors were never picked. It is used for
 * two things: pushing the marker out so it is visible (`rimDraftGeometry.anchorCentre`), and
 * steering the ray that puts RESAMPLED points back on the surface (`drawnRim.projectOntoMesh`).
 * The anchors themselves are never re-projected - `resamplePath` keeps them exactly - and they came
 * off the detected curve, so they are already on the surface to begin with. That leaves the samples
 * BETWEEN them, and the opening direction is the right ray for those: it is the way out of the
 * cavity, so it meets the rim from the side the camera is on. Spacing the anchors closely keeps
 * those chords short enough that the projection has little work to do.
 */

/**
 * How far apart the seeded anchors sit along the rim, mm.
 *
 * Close enough that the chord between two of them hugs a curving rim (the projection of the samples
 * between them is then a correction, not a rescue), and far enough apart that the operator is given
 * a loop they can actually grab rather than a bead of overlapping markers. On the reference aligner's
 * ~79 mm rim this lands around 26 anchors.
 */
export const SEED_SPACING_MM = 3;

/** Never fewer than a rim needs to be closed at all, and never more than a person can work with. */
export const SEED_MIN_ANCHORS = 3;
export const SEED_MAX_ANCHORS = 48;

const at = (points: Float32Array, index: number): Vector =>
  [points[index * 3] ?? 0, points[index * 3 + 1] ?? 0, points[index * 3 + 2] ?? 0];

const gap = (a: Vector, b: Vector): number => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

/**
 * The detected rim as a closed drawing, or `undefined` when there is not enough curve to make one.
 *
 * Walks the loop by ARC LENGTH rather than taking every n-th point: detection's points are not
 * evenly spaced, so an index stride would crowd the anchors where the curve is dense and strand them
 * where it is sparse - which is exactly where an operator wants a handle.
 */
export function seedRimDraft(rim: DentalRim, spacingMm = SEED_SPACING_MM): SurfacePath | undefined {
  const count = Math.floor(rim.points.length / 3);
  if (count < SEED_MIN_ANCHORS) return undefined;
  const normal = rim.openingDirection;
  const kept: SurfaceAnchor[] = [{ position: at(rim.points, 0), normal }];
  let since = 0;
  for (let index = 1; index < count; index += 1) {
    const previous = at(rim.points, index - 1);
    const here = at(rim.points, index);
    since += gap(previous, here);
    if (since < spacingMm) continue;
    since = 0;
    kept.push({ position: here, normal });
  }
  /*
   * The loop closes back to the first anchor, so a last point that landed almost on top of it is
   * dropped: two anchors a hair apart are one handle the operator cannot separate, and `pathProblems`
   * would rightly complain about the zero-length segment between them.
   */
  if (kept.length > SEED_MIN_ANCHORS && gap(kept[kept.length - 1]!.position, kept[0]!.position) < spacingMm / 2) kept.pop();
  if (kept.length < SEED_MIN_ANCHORS) return undefined;
  // Too dense to work with (a very long rim, or a tiny spacing): thin it evenly rather than refuse.
  if (kept.length > SEED_MAX_ANCHORS) {
    const stride = kept.length / SEED_MAX_ANCHORS;
    return { anchors: Array.from({ length: SEED_MAX_ANCHORS }, (_, slot) => kept[Math.floor(slot * stride)]!), closed: true };
  }
  return { anchors: kept, closed: true };
}
