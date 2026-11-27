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
