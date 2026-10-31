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
  /** A branch joins at least this far (mm) under the trunk's pillar top, clear of its bend. Also the merge node and leg attach distance. */
  routeJoinBelowTopMm?: number;
  /** A branch joins at least this far (mm) under the trunk's own contact, never beside its tip. */
  routeJoinBelowTipMm?: number;
  /** Most tips one pillar carries, its own included. One value for route, outline and merge. */
  tipsPerPillar?: number;
  /** Joints on one pillar are either one shared node or at least this far apart (mm, along the pillar). One value for route, outline, merge and legs. */
  jointGapMm?: number;
  /** Lower joins tried on a trunk (each jointGapMm lower) after the highest the lean limit allows. */
  routeDeeperJoins?: number;
  /** A trunk carrying more branches than this is built thicker (thickFactor); also the branch count above which a trunk gets a leg. */
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
  /** Edge (mm) of a footprint cell; also the pillar spots' pitch. */
  outlineGridMm?: number;
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
  /** A trunk whose pillar top stands higher than this above the foot top (mm) gets a leg. */
  legOverHeightMm?: number;
  /** A trunk carrying more branches than this gets a leg. */
  legOverBranches?: number;
  /** Steepest lean from vertical (degrees) of a leg or X-brace. */
  legMaxAngleDeg?: number;
  /** Longest leg (mm). */
  legMaxMm?: number;
  /** The leg attaches at least this far (mm) under the pillar top, clear of its bend. */
  legAttachBelowTopMm?: number;
  /** Directions tried around the trunk for the leg's foot. */
  legDirections?: number;
  /** A leg's foot stands at least this far from every other pillar, in pillar diameters (default 3). */
  legSpacingDiameters?: number;
  /** Lower leg attach points tried (each jointGapMm lower) when the highest one is taken by a joint. */
  legDeeperAttach?: number;
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
}

/** The override array's layout; mirrors Rust `supports::rules::NAMES` exactly (a test checks it against the wasm's `rule_names()`). */
export const RULE_NAMES: readonly string[] = [
  'routeMaxBends', 'routeFineDirections', 'routeCoarseDirections', 'routeShiftStepMm', 'routeBranchMaxMm', 'routeJoinBelowTopMm', 'routeJoinBelowTipMm',
  'tipsPerPillar', 'jointGapMm', 'routeDeeperJoins', 'thickOverBranches', 'thickFactor', 'capsuleJudge', 'neckPretest',
  'lowMinTipHeightMm', 'lowMinNodeHeightMm',
  'outlineRodMaxMm', 'outlineBracedOverMm', 'outlineMaxAngleDeg', 'outlineGridMm', 'outlineRodMarginMm', 'outlinePillarSpacingMm', 'outlineDeeperJoints', 'outlineDeeperBraces',
  'capsuleMarginMm',
  'mergeSpacingDiameters', 'mergeMaxAngleDeg', 'mergeRodMaxMm', 'mergePasses', 'mergeDeeperNodes',
  'legOverHeightMm', 'legOverBranches', 'legMaxAngleDeg', 'legMaxMm', 'legAttachBelowTopMm', 'legDirections', 'legSpacingDiameters', 'legDeeperAttach',
  'neckRampSlope', 'neckGapMm', 'neckLiftTries', 'neckGapTargetMm', 'tipTimeMs', 'treesForExactContactOnly',
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
