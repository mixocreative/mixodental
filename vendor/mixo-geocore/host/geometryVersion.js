// Ported from mixodental src/workers/geometryVersion.ts. The version is bumped with every ABI change
// (9 at the port, 10 since P5.14, 11 with the repair budget, 12: STL import drops weld-collapsed
// triangles, 13: Step 1 orientation by the trim - the orient result carries the arch kind and the
// up/down cross-check, the rim scalars its front (22 values), and `diagnose_orientation` exists; now
// 14: the denture profile - `orient_denture`, `denture_tilt_scan`, `denture_policy`, `denture_profile_ids`).
// 19: denture review rim loop, hole loops + band, up decision; tip source tags low/area/rim/hole.
// 26: `generate` takes `rules` (planner rule overrides, Float64Array in `rule_names()` order) after `limits`; `rule_names()`, `reroute_support`, `pillar_reach` exist.
// 25: `generate` takes `limits` (time-rule overrides, Float64Array) in place of `timeout_ms`; the result has `stop_reason()`.
// 24: denture rim band (profile placement.rimBandMm, review rim_band_mask): overhang faces within 2 mm of the rim line are support-allowed.
// 23: denture review up decision by dental/arch_slices (front/back from the arch footprint, crown side from 11 section slices); up_decision array 29 values (slice votes, confidence, top, back, cross-check); T1b numbers kept as a diagnostic.
// 22: settings layout 68 (neckMaxShift, minClearance: angled neck offset + min gap), denture profile supports minClearanceMm/neckMaxShiftMm.
// 21: denture review: up decision by the T1b ray median test (run first, up_decision layout changed), rim_plane / symmetry_plane / oral_cavity_ray + no_support_dir replace middle_plane / ray_origin; middle_edges, middle_chain_of_edge, box_face, face_scores removed.
// 20: denture review rim = low points joined over the mesh (rim_loops/rim_sizes/rim_closed/rim_edges/rim_info), holes by an axis ray grid (hole_outlines/hole_sizes/hole_info/hole_band_mask); rim_loop, rim_bridged, hole_loops, hole_edges removed.

/** Must equal the Rust `engine_version()`; both change together on any ABI change. */
export const HOST_GEOMETRY_VERSION = 26;

/** Thrown when the loaded engine's `engine_version()` is not `HOST_GEOMETRY_VERSION` (code 'geometry-version-mismatch'). */
export class GeometryVersionMismatch extends Error {
  /** @param {number} actual */
  constructor(actual) {
    super(`Geometry core schema ${actual} does not match host schema ${HOST_GEOMETRY_VERSION}`);
    this.name = 'GeometryVersionMismatch';
    this.code = 'geometry-version-mismatch';
    this.actual = actual;
  }
}

/** @param {number} actual */
/** Throws `GeometryVersionMismatch` unless `actual` equals `HOST_GEOMETRY_VERSION`. */
export function assertGeometryVersion(actual) {
  if (actual !== HOST_GEOMETRY_VERSION) throw new GeometryVersionMismatch(actual);
}

/**
 * Awaits `ready()` (the realm's engine load), then runs `work`, so a worker never calls the
 * engine before it is loaded. meshWorker wraps every engine task (all but `forget`) in it.
 *
 * @template T
 * @param {() => Promise<unknown>} ready
 * @param {() => T | Promise<T>} work
 * @returns {Promise<T>}
 */
export async function runAfterGeometryReady(ready, work) {
  await ready();
  return work();
}
