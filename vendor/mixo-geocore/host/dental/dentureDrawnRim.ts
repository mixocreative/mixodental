/*
 * ONE JOB: hand the engine the denture rim the operator drew (engine 71; mixoDental docs/ORIENT-NODES.md section 10
 * step 10 - owner 2026-11-23: "the drawn rim should replace the detected").
 *
 * The engine holds ONE drawing in force, not one per model: the analysis runs on the file's target part, so a
 * per-mesh store would miss on a multi-part file. So the caller sets it - or clears it with `null` - before EVERY
 * denture job on a model; a job that skips the call runs with whatever the last job left.
 *
 * A drawing the model cannot carry is not refused here (that needs the mesh): the analysis falls back to the
 * detected rim and the result says so (`rim_source()` / `drawn_rim_problem()`), which the caller must show.
 */
import { dentalEngine } from './dentalEngine';
import type { Vector } from '../core/vec3';

/** A drawing the engine refused (too few points, a non-number), with the reason in `detail`. */
export class DrawnRimRefused extends Error {
  constructor(readonly detail: string) {
    super(`The engine refused the drawn rim: ${detail}`);
    this.name = 'DrawnRimRefused';
  }
}

/** The drawn rim: mesh-frame points in drawn order, and whether the last joins the first. */
export interface DrawnDentureRim {
  points: readonly Vector[];
  closed: boolean;
}

/** Make `rim` the drawn rim the next denture analyses use, or `null` for the detected rim. Returns the digest now in force ("none" when cleared). */
export function setDentureDrawnRim(rim: DrawnDentureRim | null): string {
  const flat = new Float64Array(rim === null ? 0 : rim.points.length * 3);
  rim?.points.forEach((p, k) => flat.set(p, k * 3));
  try {
    return dentalEngine().set_denture_drawn_rim(flat, rim?.closed ?? false);
  } catch (error) {
    const detail = (error as { detail?: unknown })?.detail;
    if ((error as Error)?.message === 'DRAWN_RIM_INVALID' && typeof detail === 'string') throw new DrawnRimRefused(detail);
    throw error;
  }
}
