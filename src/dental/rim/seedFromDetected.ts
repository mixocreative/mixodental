// Copyright (c) Mixo Creative.

import type { DentalRim } from '@mixo-geocore/host/dental/dental';
import type { Vector } from '@mixo-geocore/host/core/vec3';
import type { SurfaceAnchor, SurfacePath } from '../../core/surfacePath/path';

/**
 * A DETECTED RIM, TURNED BACK INTO SOMETHING THE OPERATOR CAN DRAG.
 *
 * Detection returns a dense closed curve (`DentalRim.points`, about 0.5 mm apart). Rim define mode
 * works in ANCHORS - a handful of points, placed and dragged - so a detected rim cannot be edited
 * until it is expressed in those terms. This is that translation, and it is the whole reason
 * redrawing a detected rim is possible at all rather than starting from an empty model.
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
 * cavity, so it meets the rim from the side the camera is on.
 */

/**
 * The longest a run goes without a handle, mm.
 *
 * TWELVE, BECAUSE THE SPAN IS A CURVE. It was 3 while `resamplePath` joined anchors with chords, and
 * that bought the reference aligner 35 handles - which the owner met and called near-impossible to
 * edit, correctly. A centripetal Catmull-Rom span misses an arc by about `3*R*theta^4/128` against a
 * chord's `R*theta^2/8`, so on the arch front (R about 25 mm) 12 mm of curve is 31 um where 3 mm of
 * chord was 45 um: four times the spacing and a truer line. What decides this number now is where a
 * human wants something to grab, not how far a straight line strays.
 */
export const SEED_SPACING_MM = 12;

/**
 * How much the rim may turn between two handles, degrees - the rule that puts anchors where the
 * curve actually bends instead of spreading them evenly and missing the corners.
 *
 * FORTY-FIVE, and this threshold changed its meaning rather than its value alone. At 20 it was
 * bounded by the sagitta of a CHORD across the turn; with a curve between the handles that bound is
 * gone - at a molar hairpin (R about 5 mm) a 45-degree step costs about 45 um, a sixth of what 3 mm
 * chords cost there. So it is set by where a person expects a handle: a corner. Eight handles for a
 * full 360 degrees of turning, wherever the turning happens to be.
 */
export const SEED_TURN_DEG = 45;

/**
 * No two handles closer than this, mm. The marker radius is 0.42 and `RIM_GRAB_REACH_MM` is 0.84, so
 * at 2 mm two handles are visibly separate and can be picked apart even where a hairpin earns three
 * of them in quick succession.
 */
export const SEED_MIN_GAP_MM = 2;

/** Never fewer than a rim needs to be closed at all, and never more than a person can work with. */
export const SEED_MIN_ANCHORS = 3;
export const SEED_MAX_ANCHORS = 48;

/**
 * How far either side of a point its heading is measured over, mm.
 *
 * NOT the step between two neighbouring points, and this is the trap the first version walked into.
 * Detection's points sit about 0.5 mm apart on a real scan and they JITTER; the angle between two
 * adjacent segments is mostly noise, and summing it drops anchors all along a straight run - clutter
 * the operator meets as a defect, not as help. Measured over a millimetre, the jitter averages out
 * and what is left is the heading of the rim.
 */
const HEADING_SPAN_MM = 1;

const at = (points: Float32Array, index: number): Vector =>
  [points[index * 3] ?? 0, points[index * 3 + 1] ?? 0, points[index * 3 + 2] ?? 0];

const gap = (a: Vector, b: Vector): number => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

/** The rim's heading at `index`, as a unit vector across `HEADING_SPAN_MM` of curve either side. */
function headingAt(points: Float32Array, count: number, index: number): Vector | undefined {
  const step = (from: number, direction: 1 | -1): number => {
    let walked = 0;
    let cursor = from;
    while (walked < HEADING_SPAN_MM / 2) {
      const next = (cursor + direction + count) % count;
      walked += gap(at(points, cursor), at(points, next));
      cursor = next;
      if (cursor === from) break;
    }
    return cursor;
  };
  const behind = at(points, step(index, -1));
  const ahead = at(points, step(index, 1));
  const length = gap(behind, ahead);
  if (!(length > 0)) return undefined;
  return [(ahead[0] - behind[0]) / length, (ahead[1] - behind[1]) / length, (ahead[2] - behind[2]) / length];
}

const degreesBetween = (a: Vector, b: Vector): number =>
  (Math.acos(Math.min(1, Math.max(-1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]))) * 180) / Math.PI;

/** One pass of the walk at the given thresholds; `undefined` when there is not enough curve. */
function walkLoop(rim: DentalRim, spacingMm: number, turnDeg: number): SurfaceAnchor[] | undefined {
  const count = Math.floor(rim.points.length / 3);
  if (count < SEED_MIN_ANCHORS) return undefined;
  const normal = rim.openingDirection;
  const kept: SurfaceAnchor[] = [{ position: at(rim.points, 0), normal }];
  let heading = headingAt(rim.points, count, 0);
  let since = 0;
  for (let index = 1; index < count; index += 1) {
    since += gap(at(rim.points, index - 1), at(rim.points, index));
    // Nothing is ever placed inside the grab reach of the last handle, whatever the curve is doing.
    if (since < SEED_MIN_GAP_MM) continue;
    const here = headingAt(rim.points, count, index);
    const turned = heading && here ? degreesBetween(heading, here) : 0;
    if (since < spacingMm && turned < turnDeg) continue;
    kept.push({ position: at(rim.points, index), normal });
    heading = here;
    since = 0;
  }
  /*
   * The loop closes back to the first anchor, so a last point that landed almost on top of it is
   * dropped: two anchors a hair apart are one handle the operator cannot separate, and `pathProblems`
   * would rightly complain about the zero-length segment between them.
   */
  if (kept.length > SEED_MIN_ANCHORS && gap(kept[kept.length - 1]!.position, kept[0]!.position) < SEED_MIN_GAP_MM) kept.pop();
  return kept.length < SEED_MIN_ANCHORS ? undefined : kept;
}

/**
 * The detected rim as a closed drawing, or `undefined` when there is not enough curve to make one.
 *
 * Walks the loop by ARC LENGTH **and by HEADING**, so the handles land where the rim actually bends:
 * an index stride would crowd them where detection's points are dense and strand them where they are
 * sparse, and an arc-length stride alone spaces them evenly and misses the corners - which is exactly
 * where an operator reaches first.
 *
 * TOO MANY HANDLES IS ITS OWN FAILURE, and the way out of it matters. On overflow the thresholds are
 * raised and the walk is run again, rather than thinning what was kept: thinning removes anchors
 * evenly, which takes them from the corners that earned them and leaves the straight runs alone -
 * the opposite of the rule.
 */
export function seedRimDraft(rim: DentalRim, spacingMm = SEED_SPACING_MM, turnDeg = SEED_TURN_DEG): SurfacePath | undefined {
  let anchors = walkLoop(rim, spacingMm, turnDeg);
  for (let relax = 0; anchors && anchors.length > SEED_MAX_ANCHORS && relax < 8; relax += 1) {
    spacingMm *= 1.5;
    turnDeg *= 1.5;
    anchors = walkLoop(rim, spacingMm, turnDeg);
  }
  if (!anchors) return undefined;
  return { anchors: anchors.slice(0, SEED_MAX_ANCHORS), closed: true };
}
