/*
 * Layer colours of the batch review, shared by the GLB writers (dentureReviewLayers.ts, profileSelect.ts,
 * reviewCase.ts) and named in tokens.css as --layer-* for the viewer. The two lists MUST match:
 * change a colour in both places, in the same commit.
 */
/** Colours a ray layer shares with the area it decides (one source of truth: change here, the rays follow). */
const NO_SUPPORT = 0xc0392b, ALLOWED = 0x2e9e5b, HOLE_BAND = 0xb2ebf2, DOWN_FACING = 0x6d8fb0, LEFT_OUT = 0xff1744, PLATE = 0x3b4a5c;
/** Dull plastic yellow of resin/ABS supports (owner 2026-11-01): muted, warm, not saturated. */
const PLASTIC_YELLOW = 0xd2bb70;

export const LAYER_COLOURS = {
  /** Denture steps: the allowed area (where tips may stand; green) and the no-support zone (red). */
  allowed: ALLOWED,
  noSupport: NO_SUPPORT,
  /** Low points: outside the allowed area (orange) and inside it but with no support (purple). */
  lowOutside: 0xff7f11,
  lowUnsupported: 0x8e44ad,
  /** Engine islands (the lowest point of a region that starts mid-air): served by a built tip (calm, --success) and not served (warning, --warning; not the left-out red, purple or orange). */
  islandResolved: 0x4a6b3a,
  islandUnresolved: 0xb07a12,
  /** Overhang regions that need no tips (the self-supporting rule): a calm sage green, apart from the allowed green and the down-facing blue. */
  selfSupporting: 0x8fb8a0,
  /** Tooth sockets (blind craters on the teeth side, engine 42): a muted plum. Fitting surface found as a basin from the tissue side (cross-check only): a steel blue. */
  sockets: 0x7d5a8c,
  fitting: 0x7fa7c9,
  /** Traps at the chosen tilt (engine 44): suction cups a warm amber, drain / clean pockets a muted teal-grey. */
  suction: 0xd08a2e,
  drain: 0x5f8f8a,
  /** Our tips (yellow cones, the default for a tip stream with no colour of its own); tips that cannot reach the plate (black cones, not built). */
  ourTips: 0xf1c40f,
  unsupportableTips: 0x1f1f1f,
  /** Tips left out (no support built, any source): one warning red-magenta, distinct from the rim pink and the purple mark. */
  tipsLeftOut: LEFT_OUT,
  /** Rim: thick continuous line(s), closed or open. Hole: a thick outline round each hole, and its 5 mm band. */
  rimEdge: 0xd81b60,
  rimEdgeBridged: 0xf48fb1,
  holeEdge: 0x00acc1,
  holeBand: HOLE_BAND,
  /** Tips by source, one palette shared with the viewer (--layer-source-*): rim, hole, area, low. */
  sourceRim: 0xd81b60,
  sourceHole: 0x00acc1,
  sourceArea: 0x7cb342,
  sourceLow: 0xfdd835,
  /** Our pillars: dull plastic yellow. */
  pillars: PLASTIC_YELLOW,
  /** Owner: -sup supports and contacts (light blue). */
  owner: 0x7fd3f7,
  /** Overhang candidates, and the hard edges that face down. */
  downFacing: DOWN_FACING,
  downEdges: 0x1f3f66,
  /** Box, middle plane, print tilt plate, ray direction arrows, ray origin. */
  tightBox: 0x3b4a5c,
  middlePlane: 0x6c7a89,
  symmetryPlane: 0x2a9d8f,
  printTilt: PLATE,
  rays: 0x3b4a5c,
  rayOrigin: 0xff00ff,
  /** Ray arrows R1..R8 (docs/rays.md of mixo-geocore): each takes the colour of the area it decides (R1/R1b no-support zone, R2 allowed area, R3 hole band, R4 own grey: decides nothing, R5 down-facing, R6 tips left out, R7 build plate, R8 pillars). */
  rayR1: NO_SUPPORT,
  rayR1b: NO_SUPPORT,
  rayR2: ALLOWED,
  rayR3: HOLE_BAND,
  rayR4: 0x90a4ae,
  rayR5: DOWN_FACING,
  rayR6: LEFT_OUT,
  rayR7: PLATE,
  rayR8: PLASTIC_YELLOW,
  /** Area compare, one set for both: both areas, owner only, ours only. */
  compareBoth: 0x1f7a6d,
  compareOwnerOnly: 0x3b6fd0,
  compareOursOnly: 0xa0522d,
} as const;
