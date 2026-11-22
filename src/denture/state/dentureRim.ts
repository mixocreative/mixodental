import type { Vector } from '@mixo-geocore/host/core/vec3';
import type { DrawnDentureRim } from '@mixo-geocore/host/dental/dentureDrawnRim';
import { MIN_CLOSED_ANCHORS, MIN_OPEN_ANCHORS, type SurfacePath } from '../../core/surfacePath/path';

/*
 * ONE JOB: the rim the operator drew on a denture, as the unit stores it (`PrintUnit.dentureRim`).
 *
 * docs/ORIENT-NODES.md section 10 step 10; owner 2026-11-23: "the drawn rim should replace the detected". It
 * REPLACES the detected rim in every denture job on the unit - each job carries `engineDrawnRim(unit)` and the
 * worker sets the engine's one drawn-rim slot from it first (`engine/dentureCore.ts` `withPolicy`).
 *
 * A unit field of its own, NOT part of `DentureState`: Step 1's Next writes the denture state afresh, and a rim
 * drawn before the first Next has no denture state to live in yet. Undo, Redo and the project file carry it
 * like any other unit field (`state/project.ts`, command `dentureRim/set`).
 */

/** A drawn denture rim: the handles (so Redraw opens on the operator's own work) and the curve through them laid on the surface (unit-local mm, what the engine reads). Closed = `path.closed`. */
export interface DentureDrawnRim {
  path: SurfacePath;
  points: Vector[];
}

/** The unit's drawn rim as the engine reads it, or undefined for the detected rim. */
export const engineDrawnRim = (unit: { dentureRim?: DentureDrawnRim }): DrawnDentureRim | undefined =>
  unit.dentureRim ? { points: unit.dentureRim.points, closed: unit.dentureRim.path.closed } : undefined;

const triple = (value: unknown, label: string): Vector => {
  if (!Array.isArray(value) || value.length !== 3 || value.some((n) => typeof n !== 'number' || !Number.isFinite(n))) throw new TypeError(`${label} must be three finite numbers`);
  return [value[0], value[1], value[2]];
};

/** A drawn rim, checked and copied: it reaches the engine, so a bad one stops the load rather than printing on it. */
export function normalizeDrawnRim(value: DentureDrawnRim): DentureDrawnRim {
  const { path, points } = value ?? ({} as DentureDrawnRim);
  if (!path || !Array.isArray(path.anchors) || typeof path.closed !== 'boolean' || !Array.isArray(points)) throw new TypeError('a drawn denture rim must have a path and points');
  const anchors = path.anchors.map((anchor) => ({ position: triple(anchor?.position, 'drawn rim anchor'), normal: triple(anchor?.normal, 'drawn rim anchor normal') }));
  if (anchors.length < (path.closed ? MIN_CLOSED_ANCHORS : MIN_OPEN_ANCHORS) || points.length < anchors.length) throw new TypeError('a drawn denture rim is too short');
  return { path: { anchors, closed: path.closed }, points: points.map((p) => triple(p, 'drawn rim point')) };
}
