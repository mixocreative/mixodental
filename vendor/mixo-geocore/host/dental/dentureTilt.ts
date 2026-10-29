import { withDentalMesh } from './dentalEngine';
import { decodeTiltScan, type TiltScan, type TiltScanSettings } from './dentalTilt';
import type { TriangleMesh } from '../core/analysis/types';

/*
 * The denture print-angle search (Rust `dental::denture::tilt`): tilts from upright (0) to the
 * profile's range, leaning the teeth side up by the tilt, judged by the crossing and slenderness
 * rules and scored by the overhang area. The result is the aligner scan's shape (`TiltScan`), so
 * the decoder is shared; `fittingSideTips` and `largestGapMm` are always 0 for a denture, the
 * rules `resin-trap` and `rim-gap` never fail, and `startDeg` is 0 (upright).
 */

/** Scans `mesh` (unit-local) for the denture type `profile`; `onTilt(done, total)` after each tilt. */
export function scanDentureTilts(mesh: TriangleMesh, profile: string, settings: TiltScanSettings,
  onTilt?: (done: number, total: number) => void): TiltScan {
  return withDentalMesh(mesh, (session, model) => decodeTiltScan(session.denture_tilt_scan(model, profile,
    settings.neckLengthMm, settings.pillarDiameterMm, settings.liftMm, settings.braced, onTilt)));
}
