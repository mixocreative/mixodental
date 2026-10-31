/*
 * Layer colours of the batch review, shared by the GLB writers (dentureReviewLayers.ts, profileSelect.ts,
 * reviewCase.ts) and named in tokens.css as --layer-* for the viewer. The two lists MUST match:
 * change a colour in both places, in the same commit.
 */
export const LAYER_COLOURS = {
  /** Denture steps: the allowed area (where tips may stand; green) and the no-support zone (red). */
  allowed: 0x2e9e5b,
  noSupport: 0xc0392b,
  /** Low points: outside the allowed area (orange) and inside it but with no support (purple). */
  lowOutside: 0xff7f11,
  lowUnsupported: 0x8e44ad,
  /** Engine islands (the lowest point of a region that starts mid-air): served by a built tip (calm, --success) and not served (warning, --warning; not the left-out red, purple or orange). */
  islandResolved: 0x4a6b3a,
  islandUnresolved: 0xb07a12,
  /** Our tips (yellow cones, the default for a tip stream with no colour of its own); tips that cannot reach the plate (black cones, not built). */
  ourTips: 0xf1c40f,
  unsupportableTips: 0x1f1f1f,
  /** Tips left out (no support built, any source): one warning red-magenta, distinct from the rim pink and the purple mark. */
  tipsLeftOut: 0xff1744,
  /** Rim: thick continuous line(s), closed or open. Hole: a thick outline round each hole, and its 5 mm band. */
  rimEdge: 0xd81b60,
  rimEdgeBridged: 0xf48fb1,
  holeEdge: 0x00acc1,
  holeBand: 0xb2ebf2,
  /** Tips by source, one palette shared with the viewer (--layer-source-*): rim, hole, area, low. */
  sourceRim: 0xd81b60,
  sourceHole: 0x00acc1,
  sourceArea: 0x7cb342,
  sourceLow: 0xfdd835,
  /** Our pillars: plastic. */
  pillars: 0xc8ccd0,
  /** Owner: -sup supports and contacts (light blue). */
  owner: 0x7fd3f7,
  /** Overhang candidates, and the hard edges that face down. */
  downFacing: 0x6d8fb0,
  downEdges: 0x1f3f66,
  /** Box, middle plane, print tilt plate, ray direction arrows, ray origin. */
  tightBox: 0x3b4a5c,
  middlePlane: 0x6c7a89,
  symmetryPlane: 0x2a9d8f,
  printTilt: 0x3b4a5c,
  rays: 0x3b4a5c,
  rayOrigin: 0xff00ff,
  /** Area compare, one set for both: both areas, owner only, ours only. */
  compareBoth: 0x1f7a6d,
  compareOwnerOnly: 0x3b6fd0,
  compareOursOnly: 0xa0522d,
} as const;
