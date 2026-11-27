// Copyright (c) Mixo Creative.

/*
 * ONE JOB: the EVIDENCE a fit needs to act with sense rather than blindly - what each tip SOURCE and each zone-graph
 * NODE has to do with the misses against the -sup target. Pure: numbers in, a table out (fitEvidence.test.ts). Plain
 * JavaScript so the review (TypeScript, dentureReviewLayers.ts) and the fit (plain Node, fit.mjs) share one copy.
 *
 * WHY (owner, 2026-11-27: "a way for AI or script to intelligently figure out how nodes [are] arranged"; the composer
 * design Fable and Codex both put FIRST). The denture fit of 2026-11-27 found most zone edits "moved nothing": the
 * supports outside the target came from tip sources the zone may not gate, and nothing said so. This says so:
 *   streams  per tip source: tips, our support area, how much of it is inside / outside the target (mm2 - measured by
 *            the ENGINE's own comparison, called once per source, so the Type Lab does no geometry of its own)
 *   nodes    per zone-graph node: how many faces it holds in each area class (target only / ours only / both) - FACE
 *            COUNTS, a prediction of what a Mark fed by that node could change, never proof (Codex)
 * The composer reads it to rank edits before spending a full run; an AI reads it to propose them.
 */

/** Per-face area classes as the engine codes them (AREA_CLASS: neither 0, target only 1, ours only 2, both 3). */
export const CLASS = { neither: 0, targetOnly: 1, oursOnly: 2, both: 3 };

const round1 = (value) => Math.round(value * 10) / 10;

/**
 * The evidence of one run of one scan. `faceClass` and every node's `values` are per face, in the same face order.
 * @param {{ streams: { stream: string, tips: number, oursMm2: number, bothMm2: number }[], faceClass: Uint8Array,
 *   nodes: { id: string, values: Uint8Array }[] }} input
 * @returns {{ streams: { stream: string, tips: number, oursMm2: number, insideMm2: number, outsideMm2: number, outsideShare: number }[],
 *   nodes: { id: string, holds: number, targetOnly: number, oursOnly: number, both: number }[],
 *   faces: { targetOnly: number, oursOnly: number, both: number } }}
 */
export function fitEvidence({ streams, faceClass, nodes }) {
  const count = (where) => {
    const out = { targetOnly: 0, oursOnly: 0, both: 0 };
    for (let face = 0; face < faceClass.length; face += 1) {
      if (!where(face)) continue;
      const code = faceClass[face];
      if (code === CLASS.targetOnly) out.targetOnly += 1;
      else if (code === CLASS.oursOnly) out.oursOnly += 1;
      else if (code === CLASS.both) out.both += 1;
    }
    return out;
  };
  return {
    streams: streams.map(({ stream, tips, oursMm2, bothMm2 }) => ({
      stream, tips, oursMm2: round1(oursMm2), insideMm2: round1(bothMm2), outsideMm2: round1(oursMm2 - bothMm2),
      outsideShare: oursMm2 > 0 ? Math.round(((oursMm2 - bothMm2) / oursMm2) * 1000) / 1000 : 0,
    })),
    nodes: nodes.map(({ id, values }) => {
      // TRAP: a node's values must be per FACE in the comparison's face order; a mismatch is a wrong table, so it is refused.
      if (values.length !== faceClass.length) throw new Error(`node ${id}: ${values.length} values for ${faceClass.length} faces`);
      let holds = 0;
      for (const value of values) if (value > 0) holds += 1;
      return { id, holds, ...count((face) => values[face] > 0) };
    }),
    faces: count(() => true),
  };
}

/**
 * PER-FACE DESCRIPTORS FOR THE GAP PROBES - diagnostic only (docs/GEOCORE-BOUNDARY.md rule 6: review tooling may live
 * here; it never feeds placement). Each is a byte per face: `slope` = the face's angle from horizontal, 0-180 degrees
 * (0 = facing straight up, 90 = a wall, 180 = facing straight down), in the review's unit frame (Y up, BEFORE the print
 * tilt - a pose-free mask, which is what a node would be); `height` = the face's height in the model's own range,
 * 0-255. A probe that separates the misses with one of these is EVIDENCE for asking the engine for that node.
 * @param {ArrayLike<number>} positions flat xyz @param {ArrayLike<number>} indices three per face
 */
export function faceDescriptors(positions, indices, rimPoints = []) {
  const faces = indices.length / 3;
  const slope = new Uint8Array(faces);
  const heightRaw = new Float32Array(faces);
  // Two more for the rim (2026-11-27, the probe the rim gap needed): `rimDistance` = straight-line distance from the
  // face to the nearest rim point, 0.1 mm per step (0-25.5 mm, capped) - a first stand-in for a geodesic distance;
  // `sector` = where the face sits AROUND THE ARCH (its angle about the model's centre in the horizontal plane,
  // 0-255 for 0-360 deg) - the targets support some parts of the rim and not others.
  const rimDistance = new Uint8Array(faces).fill(255);
  const sector = new Uint8Array(faces);
  let cx = 0, cz = 0;
  for (let v = 0; v < positions.length; v += 3) { cx += positions[v]; cz += positions[v + 2]; }
  cx /= positions.length / 3 || 1; cz /= positions.length / 3 || 1;
  let lo = Infinity, hi = -Infinity;
  for (let f = 0; f < faces; f += 1) {
    const [a, b, c] = [indices[f * 3] * 3, indices[f * 3 + 1] * 3, indices[f * 3 + 2] * 3];
    const ux = positions[b] - positions[a], uy = positions[b + 1] - positions[a + 1], uz = positions[b + 2] - positions[a + 2];
    const vx = positions[c] - positions[a], vy = positions[c + 1] - positions[a + 1], vz = positions[c + 2] - positions[a + 2];
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    const len = Math.hypot(nx, ny, nz) || 1;
    slope[f] = Math.round((Math.acos(Math.max(-1, Math.min(1, ny / len))) * 180) / Math.PI);
    const h = (positions[a + 1] + positions[b + 1] + positions[c + 1]) / 3;
    heightRaw[f] = h; lo = Math.min(lo, h); hi = Math.max(hi, h);
    const mx = (positions[a] + positions[b] + positions[c]) / 3, mz = (positions[a + 2] + positions[b + 2] + positions[c + 2]) / 3;
    sector[f] = Math.round(((Math.atan2(mz - cz, mx - cx) + Math.PI) / (2 * Math.PI)) * 255);
    let near = Infinity;
    for (const [px, py, pz] of rimPoints) near = Math.min(near, (mx - px) ** 2 + (h - py) ** 2 + (mz - pz) ** 2);
    if (rimPoints.length) rimDistance[f] = Math.min(255, Math.round(Math.sqrt(near) * 10));
  }
  const span = hi - lo || 1;
  const height = Uint8Array.from(heightRaw, (h) => Math.round(((h - lo) / span) * 255));
  return { slope, height, rimDistance, sector };
}

/**
 * The best BAND of one descriptor as a no-support mark, judged on EVERY pair (the composer's rule): over a fixed grid of
 * [lo, hi) bands (same absolute values on every pair), the band whose WORST per-pair gain (ours-only faces in it minus
 * both-faces in it) is highest. `grid` = band edges.
 * @param {{ classes: Uint8Array, values: Uint8Array }[]} pairs
 */
export function probeBand(pairs, grid) {
  let best = null;
  for (let i = 0; i < grid.length - 1; i += 1) {
    for (let j = i + 1; j < grid.length; j += 1) {
      const [lo, hi] = [grid[i], grid[j]];
      const gains = pairs.map(({ classes, values }) => {
        let gain = 0;
        for (let f = 0; f < classes.length; f += 1) {
          if (values[f] < lo || values[f] >= hi) continue;
          if (classes[f] === CLASS.oursOnly) gain += 1; else if (classes[f] === CLASS.both) gain -= 1;
        }
        return gain;
      });
      const worst = Math.min(...gains);
      // A tie goes to the NARROWER band: the same faces cleaned by a tighter mask is the more specific ask.
      if (!best || worst > best.worst || (worst === best.worst && hi - lo < best.hi - best.lo)) best = { lo, hi, gains, worst };
    }
  }
  return best;
}

/**
 * Many runs' evidence summed per source (the fit reads it across the pairs): where the area outside the target COMES
 * FROM, the source to look at first on top.
 * @param {ReturnType<typeof fitEvidence>[]} runs
 */
export function streamsOutside(runs) {
  const by = new Map();
  for (const run of runs) {
    for (const s of run.streams) {
      const sum = by.get(s.stream) ?? { stream: s.stream, tips: 0, outsideMm2: 0, oursMm2: 0 };
      sum.tips += s.tips; sum.outsideMm2 = round1(sum.outsideMm2 + s.outsideMm2); sum.oursMm2 = round1(sum.oursMm2 + s.oursMm2);
      by.set(s.stream, sum);
    }
  }
  return [...by.values()].sort((a, b) => b.outsideMm2 - a.outsideMm2);
}
