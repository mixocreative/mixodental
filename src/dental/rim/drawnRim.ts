import type { DentalRim } from '@mixo-geocore/host/dental/dental';
import { rimOf, type RimCarrier } from '@mixo-geocore/host/dental/dentalEngine';
import type { SurfacePath } from '../../core/surfacePath/path';
import { MIN_CLOSED_ANCHORS } from '../../core/surfacePath/path';
import { resamplePath, pathPointArray, type ProjectToSurface } from '../../core/surfacePath/resample';
import { pathProblems, type SurfacePathProblem } from '../../core/surfacePath/validate';

/*
 * A DRAWN LOOP BECOMES A REAL RIM (engine 61).
 *
 * The operator places a dozen anchors; `DentalRim.points` is a dense closed curve (the reference rim
 * has 158). So this resamples along the surface between the anchors, then hands the curve to
 * `dental_rim_from_points`, which fits its plane, decides which way the opening faces, and builds the
 * 96x96 visibility mask with the engine's own rasteriser.
 *
 * WHY THE MASK CANNOT BE BUILT HERE, since it is the obvious shortcut: it is read even for a painted
 * area, and getting it wrong is silent in one direction and unsafe in the other - a blank mask permits
 * nothing at all (painting stops working), a full one permits supports where the opening cannot reach.
 * A TypeScript raster would be a second source of truth for that, tracking the Rust one through every
 * engine bump with no test that could prove they agree. Hence the engine call.
 */

/**
 * Spacing of the resampled curve, mm.
 *
 * Chosen so the point count lands near what detection produces on the reference (158 points over its
 * rim), because every consumer downstream was written against curves of that density. It is a constant
 * rather than a profile field only because no profile has needed a different one yet.
 */
export const RIM_SAMPLE_SPACING_MM = 0.5;

/**
 * How far back along the normal a projection ray starts, mm.
 *
 * The ray has to begin OFF the surface or it starts inside the triangle it is looking for. Far enough
 * to clear the shell's own thickness where the curve cuts a corner, short enough not to find the far
 * wall first on a thin aligner.
 */
const PROJECT_BACKOFF_MM = 2;

/** `GeometrySession`, narrowed to the two calls this needs, so a test can stand in for the engine. */
export interface RimSession {
  pick(handle: number, rays: Float64Array, near: number, far: number, side: number): Float64Array;
  dental_rim_from_points(model: number, points: Float32Array, flip: boolean, profile: string):
  RimCarrier & { ok(): boolean; reason(): string; floor_offset(): number; flipped(): boolean };
}

/** What the engine made of the drawing. */
export type DrawnRimOutcome =
  /**
   * A usable rim. `sideUncertain` means the engine could not tell which way the opening faces from the
   * floor rule - the rim is complete, but the operator must be shown the flip rather than left to
   * assume. `floorOffset` is how strongly the floor leaned, for saying so in words.
   */
  | { kind: 'rim'; rim: DentalRim; sideUncertain: boolean; floorOffset: number; flipped: boolean }
  /** The drawing itself is not a rim: `pathProblems` says why, in a code the dock already has words for. */
  | { kind: 'unusable'; problem: SurfacePathProblem }
  /** The engine refused a loop that passed our own checks. `rim-collinear` is the only reason it gives. */
  | { kind: 'refused'; reason: string }
  /** The curve could not be built at all - too few anchors to have a segment. */
  | { kind: 'empty' };

/**
 * Puts a point back on the surface by casting through it along its own normal.
 *
 * Backs off along the normal and looks inward first, which is where the surface is when the straight
 * chord has cut INSIDE a convex stretch - the common case. Failing that it looks outward, for the
 * concave stretch where the chord stands proud. A miss both ways returns undefined, and `resamplePath`
 * keeps the straight-line position and counts it, so one unreachable spot does not void the drawing.
 */
export function projectOntoMesh(session: RimSession, handle: number): ProjectToSurface {
  return (point, normal) => {
    const [nx, ny, nz] = normal;
    const length = Math.hypot(nx, ny, nz);
    if (!(length > 0)) return undefined;
    const [ux, uy, uz] = [nx / length, ny / length, nz / length];
    const [px, py, pz] = point;
    const cast = (sign: number): [number, number, number] | undefined => {
      const origin = [px + ux * PROJECT_BACKOFF_MM * sign, py + uy * PROJECT_BACKOFF_MM * sign, pz + uz * PROJECT_BACKOFF_MM * sign];
      // Double-sided: a rim runs round a shell, and half of it is approached from the inside.
      const hit = session.pick(handle, Float64Array.of(origin[0]!, origin[1]!, origin[2]!, -ux * sign, -uy * sign, -uz * sign), 0, PROJECT_BACKOFF_MM * 2, 2);
      return hit[0] !== undefined && hit[0] >= 0 ? [hit[2]!, hit[3]!, hit[4]!] : undefined;
    };
    return cast(1) ?? cast(-1);
  };
}

/**
 * The drawn loop as a `DentalRim`, or why it is not one.
 *
 * Our own checks run FIRST, so the common refusals (too few anchors, a figure-eight, a loop with no
 * area) come back as codes the dock already has sentences for, in the operator's language. The engine
 * is asked only about the things only it can answer: the plane, the side, and the mask.
 */
export function drawnRim(session: RimSession, handle: number, model: number, path: SurfacePath,
  profile: string, flip = false): DrawnRimOutcome {
  if (!path.closed || path.anchors.length < MIN_CLOSED_ANCHORS) return { kind: 'empty' };
  const problem = pathProblems(path)[0];
  if (problem) return { kind: 'unusable', problem };

  const resampled = resamplePath(path, RIM_SAMPLE_SPACING_MM, projectOntoMesh(session, handle));
  if (!resampled) return { kind: 'empty' };
  const points = pathPointArray(resampled);
  // The ABI throws INVALID_LENGTH below six points rather than returning a reason; never let it.
  if (points.length < 6 * 3) return { kind: 'empty' };

  const result = session.dental_rim_from_points(model, points, flip, profile);
  if (!result.ok()) return { kind: 'refused', reason: result.reason() };
  return {
    kind: 'rim',
    rim: rimOf(result),
    sideUncertain: result.reason() === 'rim-side-uncertain',
    floorOffset: result.floor_offset(),
    flipped: result.flipped(),
  };
}
