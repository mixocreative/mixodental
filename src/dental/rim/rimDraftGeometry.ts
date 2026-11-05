import type { SurfaceAnchor, SurfacePath } from '../../core/surfacePath/path';
import { segments } from '../../core/surfacePath/path';

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
 * The chord run as a flat position array: one pair of points per segment, for a `lineSegments`.
 *
 * SEGMENTS, not one continuous strip, because `segments()` already says which pairs are joined and
 * whether the closing pair exists. Drawing it as a strip would mean a second rule about the loop here,
 * and the two could drift apart - the line would close when the path did not, or the reverse.
 *
 * This is the straight chord between anchors, NOT the finished rim. The rim is the chord resampled onto
 * the surface (`resamplePath`), which needs the mesh; until Done can build that, the chord is an honest
 * sketch of what the operator has said so far and never pretends to lie on the model.
 */
export function chordPositions(path: SurfacePath, liftMm = RIM_DRAFT_LIFT_MM): Float32Array {
  const centres = anchorCentres(path, liftMm);
  const pairs = segments(path);
  const out = new Float32Array(pairs.length * 6);
  pairs.forEach(([from, to], index) => {
    const a = centres[from]!;
    const b = centres[to]!;
    out.set(a, index * 6);
    out.set(b, index * 6 + 3);
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
