import type { Vector } from '@mixo-geocore/host/core/vec3';
import type { SurfaceAnchor, SurfacePath } from '../../core/surfacePath/path';
import { segments } from '../../core/surfacePath/path';
import { SPAN_SAMPLES, spanCurve } from '../../core/surfacePath/spline';

/*
 * The drawn rim's geometry, as plain numbers.
 *
 * Pure on purpose: the component around it is three meshes and a line, and everything that could be
 * WRONG - where an anchor sits, which pairs are joined, whether the loop closes - is decided here, where
 * a test can read it without a browser or a GPU.
 */

/** How far off the surface an anchor and the chord sit, in mm, so they are not swallowed by the model. */
export const RIM_DRAFT_LIFT_MM = 0.06;

/** The radius of an anchor's marker, mm. Big enough to hit at a glance, small enough to see the curve under it. */
export const RIM_ANCHOR_RADIUS_MM = 0.42;

/**
 * An anchor's marker centre: the surface point pushed out along its own normal.
 *
 * Along the NORMAL, not along the camera or the opening direction, because the operator reads an anchor
 * as sitting ON the surface at that spot. On a steep wall a camera-facing offset would slide the marker
 * off the point it names.
 */
export function anchorCentre(anchor: SurfaceAnchor, liftMm = RIM_DRAFT_LIFT_MM): readonly [number, number, number] {
  const [x, y, z] = anchor.position;
  const [nx, ny, nz] = anchor.normal;
  const length = Math.hypot(nx, ny, nz);
  // A zero-length normal cannot say which way is out; leave the point where it is rather than guess.
  if (!(length > 0)) return [x, y, z];
  const scale = liftMm / length;
  return [x + nx * scale, y + ny * scale, z + nz * scale];
}

/** Every anchor's marker centre, in order. */
export const anchorCentres = (path: SurfacePath, liftMm = RIM_DRAFT_LIFT_MM): readonly (readonly [number, number, number])[] =>
  path.anchors.map((anchor) => anchorCentre(anchor, liftMm));

/**
 * The drawn line as a flat position array: `SPAN_SAMPLES` pairs per segment, for a `lineSegments`.
 *
 * THE CURVE, NOT THE CHORD, and the reason is not how it looks. A press is resolved against the same
 * `spanCurve` (`rimTarget.nearestOnCurve`), so a straight line drawn here meant the operator could
 * press the line they could SEE and have nothing happen: 1.14 mm of disagreement on a 15 mm radius at
 * the seeded 12 mm spacing, past the 1 mm `RIM_LINE_REACH_MM` allows. One sampler now serves the
 * drawing and the pick, which is what makes that gap unable to come back; `SPAN_SAMPLES` carries the
 * measurements.
 *
 * SEGMENTS, not one continuous strip, because `segments()` already says which pairs are joined and
 * whether the closing pair exists. Drawing it as a strip would mean a second rule about the loop here,
 * and the two could drift apart - the line would close when the path did not, or the reverse.
 *
 * It runs through the LIFTED anchor centres, so it passes exactly through the markers the operator
 * sees. That leaves it `RIM_DRAFT_LIFT_MM` (0.06 mm) off the curve the pick measures - two orders of
 * magnitude inside the pick's reach, and the lift is what stops the line being swallowed by the model.
 * It is still NOT the finished rim: the rim is this curve resampled ONTO the surface (`resamplePath`),
 * which needs the mesh, so between the handles this runs through the model rather than over it.
 */
export function linePositions(path: SurfacePath, liftMm = RIM_DRAFT_LIFT_MM): Float32Array {
  // The curve is taken through the lifted centres, so the drawn line meets the drawn markers exactly.
  const lifted: SurfacePath = {
    closed: path.closed,
    anchors: path.anchors.map((anchor) => {
      const [x, y, z] = anchorCentre(anchor, liftMm);
      return { position: [x, y, z] as Vector, normal: anchor.normal };
    }),
  };
  const spans = segments(path);
  const out = new Float32Array(spans.length * SPAN_SAMPLES * 6);
  let at = 0;
  spans.forEach(([from, to]) => {
    const curve = spanCurve(lifted, from, to);
    // One pair per sub-chord: sample n to sample n+1, so `lineSegments` draws an unbroken span.
    for (let step = 0; step < SPAN_SAMPLES; step += 1) {
      out.set(curve[step]!, at);
      out.set(curve[step + 1]!, at + 3);
      at += 6;
    }
  });
  return out;
}

/** The anchor nearest a unit-local point, and how far it is, or undefined when the path is empty. */
export function nearestAnchor(path: SurfacePath, point: readonly [number, number, number]): { at: number; distanceMm: number } | undefined {
  let best: { at: number; distanceMm: number } | undefined;
  path.anchors.forEach((anchor, at) => {
    const distanceMm = Math.hypot(anchor.position[0] - point[0], anchor.position[1] - point[1], anchor.position[2] - point[2]);
    if (best === undefined || distanceMm < best.distanceMm) best = { at, distanceMm };
  });
  return best;
}

/**
 * How near a press must be to an anchor, in mm, to pick it up for a drag.
 *
 * A LITTLE WIDER than the marker itself: the operator aims at a sphere they can see, and asking them to
 * hit its exact radius turns a drag into a test of aim. It is deliberately NOT a screen-pixel reach -
 * that would mean anchors became easier to grab the further you zoomed in, and this way what can be
 * grabbed is the same wherever the camera is. Zoomed far out it is small on screen; so is the anchor.
 */
export const RIM_GRAB_REACH_MM = RIM_ANCHOR_RADIUS_MM * 2;

/** The anchor a press at `point` picks up, or undefined when the press is on bare surface. */
export function grabAnchor(path: SurfacePath, point: readonly [number, number, number], reachMm = RIM_GRAB_REACH_MM): number | undefined {
  const near = nearestAnchor(path, point);
  return near && near.distanceMm <= reachMm ? near.at : undefined;
}

/**
 * Whether a click at `point` lands on the FIRST anchor, which is how a loop is closed by gesture.
 *
 * Only the first, and only while the path is open and has enough anchors to enclose anything. The reach
 * is the marker's own radius and a little over, so what closes the loop is what the operator can see.
 */
export function closesLoop(path: SurfacePath, point: readonly [number, number, number], reachMm = RIM_ANCHOR_RADIUS_MM * 1.6): boolean {
  if (path.closed || path.anchors.length < 3) return false;
  const first = path.anchors[0]!;
  return Math.hypot(first.position[0] - point[0], first.position[1] - point[1], first.position[2] - point[2]) <= reachMm;
}
