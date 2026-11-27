// Copyright (c) Mixo Creative.

/*
 * ONE JOB: from the fit's evidence, which zone edits are WORTH a full run - and the best any arrangement of today's
 * masks could reach. Pure: per-face arrays in, ranked candidates out (composer.test.ts). No geometry: faces are counted.
 *
 * The design Fable and Codex both agreed (typelab/CLI.md "When the fit finds nothing"):
 *  - a candidate is a Mark NO-SUPPORT on top of the zone over a mask's faces. For one tip source, marking faces F
 *    no-support takes away our support on F: faces that were OURS ONLY become clean (good), faces that were BOTH lose
 *    the support the target has there (bad). PREDICTED gain = oursOnly(F) - both(F), in faces. A prediction, never proof:
 *    full runs decide (fitScore), and every run logs predicted against measured.
 *  - masks: every zone node that gives faces, its NOT, and pairwise INTERSECT / SUBTRACT of the strongest few; masks
 *    identical per face are kept once (the simplest wins).
 *  - the REACHABLE CEILING: group faces by their signature across all masks - any arrangement of these masks marks a
 *    union of groups, so the best reachable reduction is the sum over groups of max(0, oursOnly - both). When that is
 *    far below the source's ours-only faces, no arrangement of today's nodes gets there: "no separating mask in the
 *    tested vocabulary" (never "impossible") - the cue for a new procedural node (gap report).
 */

/** Area classes as the engine codes them (AREA_CLASS). */
const NEITHER = 0, TARGET_ONLY = 1, OURS_ONLY = 2, BOTH = 3;

/** A mask's counts for one source's class map: faces in it per class. */
export function tally(classes, mask) {
  let oursOnly = 0, both = 0, targetOnly = 0, size = 0;
  for (let face = 0; face < classes.length; face += 1) {
    if (!mask[face]) continue;
    size += 1;
    const c = classes[face];
    if (c === OURS_ONLY) oursOnly += 1; else if (c === BOTH) both += 1; else if (c === TARGET_ONLY) targetOnly += 1;
  }
  return { size, oursOnly, both, targetOnly, gain: oursOnly - both };
}

const asBits = (values) => Uint8Array.from(values, (v) => (v > 0 ? 1 : 0));
const signature = (bits) => {
  // A cheap exact key: the faces it holds, joined. Masks are compared whole, so equal keys = identical masks.
  let key = '';
  for (let face = 0; face < bits.length; face += 1) if (bits[face]) key += `${face},`;
  return key;
};

/**
 * The masks a candidate may mark: each node's faces, its NOT, and INTERSECT / SUBTRACT of the `pairOf` strongest
 * (by gain on `classes`). Each mask carries how to BUILD it in the graph: { id } for a node, or { op, a, b }.
 * @param {Uint8Array} classes one source's per-face classes (the one the misses come from)
 * @param {{ id: string, values: Uint8Array }[]} nodes the zone nodes that give faces (zones.bin)
 */
export function candidateMasks(classes, nodes, { pairOf = 4 } = {}) {
  const base = nodes.map(({ id, values }) => ({ build: { id }, bits: asBits(values) }));
  const nots = base.map(({ build, bits }) => ({ build: { op: 'not', a: build.id }, bits: bits.map((b) => 1 - b) }));
  const strongest = [...base].sort((x, y) => tally(classes, y.bits).gain - tally(classes, x.bits).gain).slice(0, pairOf);
  const pairs = [];
  for (const x of strongest) {
    for (const y of strongest) {
      if (x === y) continue;
      pairs.push({ build: { op: 'subtract', a: x.build.id, b: y.build.id }, bits: x.bits.map((b, k) => b & (1 - y.bits[k])) });
      if (x.build.id < y.build.id) pairs.push({ build: { op: 'intersect', a: x.build.id, b: y.build.id }, bits: x.bits.map((b, k) => b & y.bits[k]) });
    }
  }
  // Identical per face -> kept once, the first (simplest) form: a node before a NOT before a boolean.
  const seen = new Set();
  return [...base, ...nots, ...pairs].filter(({ bits }) => {
    const key = signature(bits);
    if (key === '' || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** The best reduction ANY arrangement of `masks` could reach on `classes` (faces), and the source's total ours-only. */
export function reachableCeiling(classes, masks) {
  const groups = new Map();
  for (let face = 0; face < classes.length; face += 1) {
    const c = classes[face];
    if (c !== OURS_ONLY && c !== BOTH) continue;
    let key = '';
    for (const { bits } of masks) key += bits[face] ? '1' : '0';
    const g = groups.get(key) ?? { oursOnly: 0, both: 0 };
    if (c === OURS_ONLY) g.oursOnly += 1; else g.both += 1;
    groups.set(key, g);
  }
  let reachable = 0, oursOnly = 0;
  for (const g of groups.values()) { reachable += Math.max(0, g.oursOnly - g.both); oursOnly += g.oursOnly; }
  return { oursOnly, reachable, share: oursOnly ? Math.round((reachable / oursOnly) * 1000) / 1000 : 0 };
}

/**
 * RANKING BY THE RE-SCORE (Fable + Codex, 2026-11-27, after the face counts mispredicted three times and the tip-drop
 * re-score reproduced both known full runs: 15.6 -> 14.9 exactly, 15.6 -> -4.1 against -5.2). Each pair's review
 * re-scored every candidate (dentureReviewLayers `composeScores`: the gated tips whose face is in the mask dropped,
 * the engine's area comparison run again). Gain = re-score minus the pair's score as built; a candidate is eligible
 * only if its WORST pair gain clears `charge` points per added node. Ranked by that worst gain, then fewer nodes. A
 * candidate that drops over `lowShare` of a pair's tips is flagged low-confidence: there the engine would most likely
 * place other tips instead, which the re-score cannot see. Full runs still decide.
 * @param {{ asBuilt: number, tips: number, candidates: { build: object, score: number, dropped: number }[] }[]} perPair
 */
export function rankByRescore(perPair, { charge = 0.5, top = 3, lowShare = 0.3 } = {}) {
  if (perPair.length === 0) return [];
  const key = (build) => JSON.stringify(build);
  const added = (build) => (build.op ? 2 : 1);
  const keys = perPair[0].candidates.map((c) => key(c.build)).filter((k) => perPair.every((p) => p.candidates.some((c) => key(c.build) === k)));
  return keys.map((k) => {
    const each = perPair.map((p) => ({ p, c: p.candidates.find((c) => key(c.build) === k) }));
    const gains = each.map(({ p, c }) => Math.round((c.score - p.asBuilt) * 10) / 10);
    const build = JSON.parse(k);
    return { build, gains, worst: Math.min(...gains), nodes: added(build),
      lowConfidence: each.some(({ p, c }) => p.tips > 0 && c.dropped / p.tips > lowShare) };
  }).filter((c) => c.worst > charge * c.nodes)
    .sort((a, b) => (b.worst - a.worst) || (a.nodes - b.nodes))
    .slice(0, top);
}

/**
 * Candidates over SEVERAL pairs (FACE COUNTS - kept as a logged column since the ranking moved to rankByRescore): a mask is kept only if its predicted gain clears `charge` (faces per added node) on
 * EVERY pair - the agreed rule: a gain one scan carries is not a gain. Ranked by the smallest per-pair gain, then by
 * fewer added nodes. `perPair` = [{ classes, nodes }] in the same node order on every pair.
 */
export function rankCandidates(perPair, { charge = 5, top = 3 } = {}) {
  if (perPair.length === 0) return [];
  const added = (build) => (build.op ? 2 : 1); // a NOT or boolean adds its node and the Mark
  const lists = perPair.map(({ classes, nodes }) => candidateMasks(classes, nodes));
  const byKey = (build) => JSON.stringify(build);
  const common = lists[0].map((m) => byKey(m.build)).filter((key) => lists.every((list) => list.some((m) => byKey(m.build) === key)));
  return common.map((key) => {
    const gains = perPair.map(({ classes }, k) => tally(classes, lists[k].find((m) => byKey(m.build) === key).bits).gain);
    const build = JSON.parse(key);
    return { build, gains, worst: Math.min(...gains), nodes: added(build) };
  }).filter((c) => c.worst > charge * c.nodes)
    .sort((a, b) => (b.worst - a.worst) || (a.nodes - b.nodes))
    .slice(0, top);
}
