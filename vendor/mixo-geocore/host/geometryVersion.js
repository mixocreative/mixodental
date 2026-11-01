// Ported from mixodental src/workers/geometryVersion.ts. The version is bumped with every ABI change
// (9 at the port, 10 since P5.14, 11 with the repair budget, 12: STL import drops weld-collapsed
// triangles, 13: Step 1 orientation by the trim - the orient result carries the arch kind and the
// up/down cross-check, the rim scalars its front (22 values), and `diagnose_orientation` exists; now
// 14: the denture profile - `orient_denture`, `denture_tilt_scan`, `denture_policy`, `denture_profile_ids`).
// 19: denture review rim loop, hole loops + band, up decision; tip source tags low/area/rim/hole.
// 35: denture tilt pick can count only allowed-area lowest points (rule tiltAllowedLowsOnly, appended: 76 rule names in total, tiltPickOrder 1 = fewest tips first; the scan result has `counted_lows()` and `tip_counts()`).
// 34: route judging: the capsule judge asks first and the mesh judge only for what it takes (rules capsuleFilter 1 default for dentures / judgeAgreement 0 / capsuleFilterMarginMm unset = derived, appended: 71 rule names), landing-circle rules appended in the same engine (see generateRules.ts).
// 33: dentures: the dental-only model landing for tips left out (rule dentalModelLanding 0 off / 1 lowest points + islands / 2 any left-out tip, appended: 68 rule names; allow list `PolicyHandle.set_model_landing_allow`; `reroute_support` takes `allow_model_landing`, `policy`, `zones` and a NaN pillar spot, its result `landing_tier()` / `landing_point()`; `GeometrySession.empty_policy()`; the generate result lists take_model_landed_ids/tiers/points and the unresolved report take_unresolved_ids/streams/points/reasons/best_gaps/needed).
// 32: denture speed round: `denture_tilt_paths` (the live tilt view: tips of one tilt with a path state each, by the landing circle), the scan result's `path_counts()`, rules landingTiltWeight / landingRodMaxDeg / landingCellStepMm / landingRodSampleMm (67 rule names); the per-model analysis is cached by the engine; the dental crease midlines are computed once per edge (same results).
// 31: dentures: the last-resort tier for tips left out (rules lastResort, lastResortOutlineAngleDeg, lastResortClearanceMm, lastResortClearanceStepMm; the generate result lists them: take_last_resort_ids/tiers/clearances) and the dental rim low rule rimLowNeedsOverhang (denture policy/review report rim_lows_facing_up): 63 rule names.
// 30: the space map (supports/skeleton/space.rs) replaces the route drop map and the outline footprint raster: rule outlineGridMm is now spaceCellMm (same slot, the map's cell edge), new spaceMarginMm (58 rule names); support placement is meant to stay equal.
// 29: support rules - the trunk legs are replaced by the trunk support (helper pillar + short neck + braces): rule names legOverHeightMm..legDeeperAttach are now trunkSupportOverMm, trunkSupportOverTips, trunkNeckAngleDeg, trunkNeckMm, trunkSupportBelowJointMm, trunkDirections, trunkSpacingDiameters, trunkDeeperSupport (same slots); new trunkSecondHelperOverMm, trunkSupportMaxFrac, trunkBraceStepMm, trunkSupportMinMm, branchRodMaxMm, outlineRodCapMm, helperRodMaxMm (57 rule names); denture builds cap branch/merge rods at 8 mm and the outline rod at 15 mm and run the helper stage.
// 28: denture island tips: `denture_policy_ruled` / `denture_review_ruled` take `rules` (rule names islandTips, islandMinAreaMm2, lowOutsideAllowed, islandReuseMm, islandSlabMm: 50 rule names); tip source `island` (stream 6); `PolicyHandle.island_facts()` / `islands_note()` and the review's `islands()` / `islands_note()`; low-tip reason 3 (lowOutsideAllowed 2).
// 27: denture tilt scan prefers tilts whose lowest points a support can reach: `denture_tilt_scan_ruled` (takes `rules`), result `boxed_counts()` / `boxed_points()` / `boxed_reasons()`; rule `boxedInTiltWeight` (45 rule names).
// 26: `generate` takes `rules` (planner rule overrides, Float64Array in `rule_names()` order) after `limits`; `rule_names()`, `reroute_support`, `pillar_reach` exist.
// 25: `generate` takes `limits` (time-rule overrides, Float64Array) in place of `timeout_ms`; the result has `stop_reason()`.
// 24: denture rim band (profile placement.rimBandMm, review rim_band_mask): overhang faces within 2 mm of the rim line are support-allowed.
// 23: denture review up decision by dental/arch_slices (front/back from the arch footprint, crown side from 11 section slices); up_decision array 29 values (slice votes, confidence, top, back, cross-check); T1b numbers kept as a diagnostic.
// 22: settings layout 68 (neckMaxShift, minClearance: angled neck offset + min gap), denture profile supports minClearanceMm/neckMaxShiftMm.
// 21: denture review: up decision by the T1b ray median test (run first, up_decision layout changed), rim_plane / symmetry_plane / oral_cavity_ray + no_support_dir replace middle_plane / ray_origin; middle_edges, middle_chain_of_edge, box_face, face_scores removed.
// 20: denture review rim = low points joined over the mesh (rim_loops/rim_sizes/rim_closed/rim_edges/rim_info), holes by an axis ray grid (hole_outlines/hole_sizes/hole_info/hole_band_mask); rim_loop, rim_bridged, hole_loops, hole_edges removed.

/** Must equal the Rust `engine_version()`; both change together on any ABI change. */
// 45: Round A6, both opt-in (defaults unchanged): tips by overhang area (dental/denture/area_density.rs; rules areaDensity, areaRefMm2, areaDenseFloor, areaSteepLighten, areaMinPitchMm, areaMaxPitchMm) and the controlled contact loop (supports/parts/contact_ring.rs, contact_fit.rs; rules contactFit, contactFitTolMm, contactFitRays, contactFitMaxIters, contactFitMaxBiteFactor), appended: 120 rule names; the review result has `area_regions()`, the generate result `contact_fits()`.
// 44: resin-trap checks at the chosen print tilt, once per review (dental/denture/print_basins.rs, suction.rs, drain.rs; surface/view_grid.rs): rules trapCheck, trapMinDepthMm, trapVentMaxMm2, suctionAreaMm2, suctionVolumeMm3, drainAspectRatio, drainVolumeMm3, drainSocketDepthMm (appended: 109 rule names); the review result has `suction_cups()`, `suction_mask()`, `drain_pockets()`, `drain_sockets()`, `drain_mask()`. No tip or tilt changes.
// 43: owner defaults: tipMaxFromDownDeg 60 (was 45), islandMaxFromDownDeg 60 (was 50), socketNoSupport ON; the oral cavity ray R2 cancels the socket mask (the review result has `sockets_cancelled_by_r2()`).
// 42: basins seen along the teeth axis (surface::basins, dental/denture/sockets.rs), once per model before any tilt: tooth sockets (rules socketNoSupport opt-in, socketMinDepthMm 1, socketTunnelMaxMm2 25; appended: 101 rule names) keep rim, area and hole-band tips off when on; the review result has `socket_mask()`, `fitting_mask()` (the fitting surface as a tissue-side basin, a cross-check), `fitting_check()`, `tips_dropped_socket()`, `lows_in_sockets()`.
// 41: the owner's hard tip rules for every tip (supports::tip_orient, supports::tip_check; rules tipInsideCheck, tipInsideSkipMm, islandMaxFromDownDeg, tipSkinFromMm appended: 98 rule names): every path leaves the surface outward and its centre line and neck-cone flank stay outside the model (route stages, model landing, live edit); generate leaves out automatic tips that do not face down (island tips within 50 degrees) and hand-placed tips whose path would enter the model; generic and aligner face/edge tips take the averaged normal; the far side of a thin lip no longer votes in the average. `left_out` names the rule (tip-check:facing / fold / neck-inward / inside / cone).
// 40: opt-in rules overhangSelfSupportStreams and rimRespectsNoSupport (appended: 94 rule names): the self-support test also filters dental-rim, rim-band and hole-band tips; those tips stay off no-support-zone faces the oral cavity ray does not see. Off by default, so a build without them is unchanged.
// 39: correctness rules tipMaxFromDownDeg (45) and rimApproachOutside (on), appended: 92 rule names (tipNormalRadiusMm 0.5: a tip's direction is the area-weighted average of the face normals within that radius; a knife-sharp fold gets no tip). ON by default: after the tilt a rim, hole-band or area tip stands only on a face within 45 degrees of straight down, and a rim sample on a knife-edge lip whose neck would enter the far face is skipped; the review result has `tips_dropped_facing_up()`, `tips_skipped_fold()` and `lows_not_down_facing()`.
// 38: the self-supporting overhang rule (rules overhangSelfSupport, overhangMinAreaMm2, overhangMaxReachMm, overhangMinAngleDeg, appended: 89 rule names); off by default, so a build without it is unchanged; the review result has `self_support_faces()` and `self_support_info()`; the tilt scan honours it.
// 37: the plate outline and the grid raft (rules raftGrid, raftMapOutline, raftGridBottomMm, raftGridTopMm, raftRibMm, raftRibPitchMm, raftRimMm, raftPadMarginMm, appended: 85 rule names); both switches default off, so a build without them is unchanged.
// 36: opt-in R1b, the steep no-support ray (rule noSupportSteepDeg, appended: 77 rule names; the review result has `no_support_steep_mask()` and `no_support_steep_deg()`).
export const HOST_GEOMETRY_VERSION = 45;

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
