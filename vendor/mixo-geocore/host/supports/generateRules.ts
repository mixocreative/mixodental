/*
 * The tunable rules of the support planner, host side. The defaults and the rules live in Rust
 * (`supports::rules`, `SupportRules`); the host only passes overrides, by name, in `RULE_NAMES` order.
 * No heavy imports here: the main thread reads it too.
 */

/**
 * The planner's rules, each optional (absent: the engine's default, set in Rust `supports::rules`).
 * Counts are rounded by the engine and negative counts are ignored; non-finite values keep the default.
 * The two on/off rules (`capsuleJudge`, `neckPretest`) take a boolean here and are sent as 1 or 0.
 */
export interface GenerateRules {
  /** Most leaning segments before the vertical drop: 1 (one lean) or 2 (two leans). Capped at 2. */
  routeMaxBends?: number;
  /** Directions tried for one lean (11.25 degrees apart by default; a coarser step moves the pillar more than its diameter at 6 mm). */
  routeFineDirections?: number;
  /** Directions tried for the first of two leans and for a branch (22.5 degrees apart by default; the second lean refines). */
  routeCoarseDirections?: number;
  /** Sideways shift step of a pillar top, mm (default half a pillar diameter). */
  routeShiftStepMm?: number;
  /** Longest branch (mm), neck end to join: the longest leaning segment; the join braces it. */
  routeBranchMaxMm?: number;
  /** A branch joins at least this far (mm) under the trunk's pillar top, clear of its bend. Also the merge node distance. */
  routeJoinBelowTopMm?: number;
  /** A branch joins at least this far (mm) under the trunk's own contact, never beside its tip. */
  routeJoinBelowTipMm?: number;
  /** Most tips one pillar carries, its own included. One value for route, outline and merge. */
  tipsPerPillar?: number;
  /** Joints on one pillar are either one shared node or at least this far apart (mm, along the pillar). One value for route, outline, merge and trunk support. */
  jointGapMm?: number;
  /** Lower joins tried on a trunk (each jointGapMm lower) after the highest the lean limit allows. */
  routeDeeperJoins?: number;
  /** A trunk carrying more branches than this is built thicker (thickFactor). */
  thickOverBranches?: number;
  /** Pillar diameter factor of a trunk carrying more than thickOverBranches branches. */
  thickFactor?: number;
  /** Judge candidates on their skeleton (capsules, one BVH walk per piece) instead of building and checking the real column. The export's mesh verdict stays mandatory either way. */
  capsuleJudge?: boolean;
  /** Run the planner's own cone test before the judge's neck verdict. Off, every neck axis goes straight to the judge (slower, never stricter). Applies to route and outline. */
  neckPretest?: boolean;
  /** A tip lower than this (mm) never branches, never joins another tip's pillar and never merges; the pillar spacing rule does not apply to its pillar. */
  lowMinTipHeightMm?: number;
  /** No branch join or merge node lower than this (mm). */
  lowMinNodeHeightMm?: number;
  /** Longest outline rod (mm), start to joint (or to the foot). */
  outlineRodMaxMm?: number;
  /** An outline rod longer than this (mm) needs a brace. */
  outlineBracedOverMm?: number;
  /** Steepest lean from vertical (degrees) of an outline rod or brace. */
  outlineMaxAngleDeg?: number;
  /** Extra radius (mm) the rod and brace tests give the tube, so a rod that passes also passes the judge's test of the built column. */
  outlineRodMarginMm?: number;
  /** Centres of two pillars (outline pillars, feet, trunks) are at least this far apart (mm). */
  outlinePillarSpacingMm?: number;
  /** Deeper joints (each jointGapMm lower) tried per spot after the highest one allowed. */
  outlineDeeperJoints?: number;
  /** Lower brace ends (each jointGapMm lower) tried per brace pillar after the highest one allowed. */
  outlineDeeperBraces?: number;
  /** Added to every radius (mm) before the capsule clearance test, so the capsule verdict is never looser than the mesh verdict. */
  capsuleMarginMm?: number;
  /** Two pillars nearer than this in plan merge into a tree, in pillar diameters (the engine multiplies by the pillar diameter; default 3). */
  mergeSpacingDiameters?: number;
  /** Steepest lean from vertical (degrees) of the rod from the merged column's top to the node. */
  mergeMaxAngleDeg?: number;
  /** Longest merge rod (mm). */
  mergeRodMaxMm?: number;
  /** Most merge passes; each pass merges every pair it can, nearest first. */
  mergePasses?: number;
  /** Lower merge nodes tried (each jointGapMm lower) when the highest node the lean allows is taken by a joint. */
  mergeDeeperNodes?: number;
  /** Trunk support (engine 29, replacing the long trunk legs): a trunk gets a helper pillar beside it only when it stands higher than this above the foot top (mm) ... */
  trunkSupportOverMm?: number;
  /** ... AND carries more tips than this (its own included, default 3). */
  trunkSupportOverTips?: number;
  /** Steepest lean from vertical (degrees) of the helper's neck and braces (default 45). */
  trunkNeckAngleDeg?: number;
  /** Free length (mm) of the short thin neck between the helper and the trunk (default 2.5: the helper stands about 2.9 mm from the trunk). */
  trunkNeckMm?: number;
  /** The support point on the trunk lies at least this far (mm) under the trunk's lowest joint (default 2). */
  trunkSupportBelowJointMm?: number;
  /** Directions tried around the trunk for the helper (the side with the most room first). */
  trunkDirections?: number;
  /** The helper stands at least this far from every other pillar, in pillar diameters (default 3). */
  trunkSpacingDiameters?: number;
  /** Support points tried: at most this many steps (each jointGapMm) down from the highest allowed, the lowest that works wins (default 6). */
  trunkDeeperSupport?: number;
  /** Slope of the neck's clearance ramp (mm of gap per mm past the bite patch). */
  neckRampSlope?: number;
  /** The neck gap (mm) a neck keeps from faces it runs along (default 1.0). */
  neckGapMm?: number;
  /** Neck lift: when the straight neck is clear but its gap 1-2 mm from the tip is under neckGapTargetMm, up to this many short leans are judged and the clear one with the widest gap replaces it. 0 turns the lift off. */
  neckLiftTries?: number;
  /** The neck gap (mm, 1-2 mm from the tip) the lift aims for; a neck at or over it is left as it is. */
  neckGapTargetMm?: number;
  /** Most time (ms) one tip's search may take before it is given up as hopeless and the build goes on (default 10 000). 0: no window. */
  tipTimeMs?: number;
  /** 1 (default): tree merge and trunk legs run only for exact-contact (denture) builds; generic builds keep their Auto Trees and truss. 0: for every build. */
  treesForExactContactOnly?: number;
  /** Denture tilt scan: among tilts that pass the safety rules the pick prefers the fewest lowest points no support can reach. 0 turns the preference off; any positive value keeps it on (default 1). */
  boxedInTiltWeight?: number;
  /** Denture policy and review: 1 (default) puts one tip at the lowest vertex of every island of the posed model (source "island"), unless a tip already stands within `islandReuseMm`; 0 turns it off. Booleans are sent as 1 or 0. */
  islandTips?: number | boolean;
  /** Islands whose footprint (the area, seen from above, of their lowest `islandSlabMm` of surface) is smaller than this get no tip (mm2, default 0.05). */
  islandMinAreaMm2?: number;
  /** Where a low or island tip may stand outside the allowed area: 0 nowhere (only inside the allowed area or within the profile's lowRimBandMm of the rim), 1 anywhere except the no-support zone (default, the behaviour before engine 28), 2 everywhere. */
  lowOutsideAllowed?: number;
  /** A tip already planned within this distance (mm, default 0.5) of an island's lowest point serves it; also the radius of the report's resolved. */
  islandReuseMm?: number;
  /** Thickness (mm, default 0.2) of the lowest slab whose footprint is an island's size. */
  islandSlabMm?: number;
  /** A helper taller than this (mm, default 25) gets a second helper on the opposite side of the trunk. */
  trunkSecondHelperOverMm?: number;
  /** The support point lies at most this fraction of the trunk's height above the foot top (default 2/3) ... */
  trunkSupportMaxFrac?: number;
  /** ... and the helper's brace to the trunk comes every this many mm of height (default 8; 0 none). With the truss on the ordinary brace pass braces the helper to its neighbours and this is not used. */
  trunkBraceStepMm?: number;
  /** ... and at least this far (mm, default 10) above the foot top, so a helper is a pillar and not a stub. */
  trunkSupportMinMm?: number;
  /** Denture builds only: longest branch onto a trunk and longest merge rod (mm, default 8); the smaller of this and routeBranchMaxMm / mergeRodMaxMm applies. A tip whose only trunk is farther is left out, and the reason says the cap. Aligner builds are not capped. */
  branchRodMaxMm?: number;
  /** Denture builds only: longest last-resort outline rod (mm, default 15); the smaller of this and outlineRodMaxMm applies. */
  outlineRodCapMm?: number;
  /** Denture builds only: longest rod (mm, default 8) of the helper stage, a new pillar beside a tip that has no own route, tried before any branch; a rod over outlineBracedOverMm is braced. 0 turns the stage off. */
  helperRodMaxMm?: number;
  /** Edge (mm) of a cell of the space map (default 0.5): the plan grid every placement question reads; also the outline's pillar-spot pitch. */
  spaceCellMm?: number;
  /** Least free border (mm, default 6) the space map keeps around the model's plan bounds. */
  spaceMarginMm?: number;
  /** Denture last resort for a tip still left out (dentures only, default on): one more attempt with limits relaxed for that tip's route alone. */
  lastResort?: boolean;
  /** Last resort tier 1: the outline route's steepest lean from vertical, degrees (default 60; the normal limit is `outlineMaxAngleDeg`). */
  lastResortOutlineAngleDeg?: number;
  /** Last resort tier 2: the lowest pillar/rod clearance a tip may get, mm (default 1.0, the floor; the largest that fits is kept). */
  lastResortClearanceMm?: number;
  /** Dental rim lows (default on): a local low of the dental rim line is forced past the overhang test only when its face is an overhang; one facing up gets no tip and is counted (`rimLowsFacingUp`). */
  rimLowNeedsOverhang?: boolean;
  /** Last resort tier 2: how far the clearance steps down from the build's at each try, mm (default 0.25: 1.25 then 1.0). */
  lastResortClearanceStepMm?: number;
}

/** The override array's layout; mirrors Rust `supports::rules::NAMES` exactly (a test checks it against the wasm's `rule_names()`). */
export const RULE_NAMES: readonly string[] = [
  'routeMaxBends', 'routeFineDirections', 'routeCoarseDirections', 'routeShiftStepMm', 'routeBranchMaxMm', 'routeJoinBelowTopMm', 'routeJoinBelowTipMm',
  'tipsPerPillar', 'jointGapMm', 'routeDeeperJoins', 'thickOverBranches', 'thickFactor', 'capsuleJudge', 'neckPretest',
  'lowMinTipHeightMm', 'lowMinNodeHeightMm',
  'outlineRodMaxMm', 'outlineBracedOverMm', 'outlineMaxAngleDeg', 'spaceCellMm', 'outlineRodMarginMm', 'outlinePillarSpacingMm', 'outlineDeeperJoints', 'outlineDeeperBraces',
  'capsuleMarginMm',
  'mergeSpacingDiameters', 'mergeMaxAngleDeg', 'mergeRodMaxMm', 'mergePasses', 'mergeDeeperNodes',
  'trunkSupportOverMm', 'trunkSupportOverTips', 'trunkNeckAngleDeg', 'trunkNeckMm', 'trunkSupportBelowJointMm', 'trunkDirections', 'trunkSpacingDiameters', 'trunkDeeperSupport',
  'neckRampSlope', 'neckGapMm', 'neckLiftTries', 'neckGapTargetMm', 'tipTimeMs', 'treesForExactContactOnly', 'boxedInTiltWeight',
  'islandTips', 'islandMinAreaMm2', 'lowOutsideAllowed', 'islandReuseMm', 'islandSlabMm',
  'trunkSecondHelperOverMm', 'trunkSupportMaxFrac', 'trunkBraceStepMm', 'trunkSupportMinMm',
  'branchRodMaxMm', 'outlineRodCapMm', 'helperRodMaxMm',
  'spaceMarginMm',
  'lastResort', 'lastResortOutlineAngleDeg', 'lastResortClearanceMm', 'rimLowNeedsOverhang', 'lastResortClearanceStepMm',
];

/** `rules` as the engine reads it: one entry per `RULE_NAMES` name; NaN keeps the engine's default, booleans become 1 or 0. */
export function packRules(rules?: GenerateRules): Float64Array {
  const values = new Float64Array(RULE_NAMES.length).fill(NaN);
  if (!rules) return values;
  const given = rules as Record<string, number | boolean | undefined>;
  RULE_NAMES.forEach((name, k) => {
    const v = given[name];
    if (v !== undefined) values[k] = typeof v === 'boolean' ? (v ? 1 : 0) : v;
  });
  return values;
}

/**
 * The overrides every `generate` call uses; empty, so the engine's defaults apply. Put values here to
 * tune the planner without a Rust rebuild.
 */
export const GENERATE_RULES: GenerateRules = {};
