// Copyright (c) Mixo Creative.

/*
 * ONE JOB: when the composer finds no arrangement of today's nodes that reaches the target, write it down as the start
 * of an ENGINE REQUEST - in the handoff shape (docs/handoff/*.md) - so the next step is a new procedural node with
 * evidence, never a host-side stand-in (docs/GEOCORE-BOUNDARY.md rules 1, 6, 8; the composer design Fable and Codex
 * agreed, typelab/CLI.md). Pure: the composer's result and the evidence summary in, markdown out (gapReport.test.ts).
 *
 * It states only what was measured. The procedural nodes it lists are the CANDIDATES to probe next (the common
 * vocabulary of procedural tools); a probe that separates the misses on every pair is what turns this draft into a
 * request worth sending.
 */

/** The common procedural masks to probe when no arrangement of the existing ones separates the misses. */
export const PROCEDURAL_CANDIDATES = [
  ['slope band', 'faces whose surface angle from horizontal lies in a range (the overhang angle, as a mask)'],
  ['height band', 'faces within a height range above the plate or below the rim'],
  ['distance from a feature', 'faces within / beyond a distance from the rim, a hole or the lowest point (geodesic)'],
  ['curvature', 'faces on ridges or in valleys above a curvature'],
  ['component size', 'connected patches of a mask kept or dropped by their area'],
  ['grow / shrink', 'a mask widened or narrowed by a distance along the surface'],
];

const pct = (share) => `${Math.round(share * 100)}%`;
/** Faces a probe's band must clean beyond its cost on every pair: the composer's charge (5 per node) x the 2 nodes it adds. */
export const PROBE_BAR = 10;

/**
 * @param {{ kind: string, stream: string, outside: { stream: string, outsideMm2: number, tips: number }[],
 *   ceilings: { share: number, oursOnly: number }[], refusedOnly?: boolean,
 *   tried: { steps: string[], result: { score: number } | null, refused: string[], predicted?: number[] }[], startScore: number }} input
 */
export function gapReport({ kind, stream, outside, ceilings, refusedOnly = false, tried, startScore, probes = [] }) {
  const total = outside.reduce((sum, s) => sum + s.outsideMm2, 0);
  const focus = outside.find((s) => s.stream === stream);
  // A probe "separates" when its band, as a no-support mark, cleans more ours-only faces than it costs both-faces on
  // EVERY pair, by more than the composer's charge for the two nodes it adds (the band and its mark).
  const passed = probes.filter((p) => p.worst > PROBE_BAR);
  const lines = [
    `# geocore: a procedural mask so the ${kind} "${stream}" tips can follow the targets (DRAFT)`,
    '',
    passed.length
      ? `STATUS: draft; a probe SEPARATES the misses on every pair (${passed.map((p) => p.name).join(', ')}) - ready for Fable and Codex to decide whether to send.`
      : 'STATUS: draft written by the Type Lab composer; NOT SENT. Send only with a probe below that separates the misses on every pair',
    '(owner delegation: Fable and Codex decide).',
    '',
    '## As the operator meets it',
    '',
    `Against the owner's -sup targets, ${focus ? `${focus.outsideMm2} mm2 of our support area (${total ? pct(focus.outsideMm2 / total) : '-'} of all of it outside the targets)` : 'most of our support area outside the targets'} comes from the "${stream}" tips.`,
    '',
    '## Why no arrangement of today\'s nodes gets there',
    '',
    refusedOnly
      ? 'Candidates that looked right on the face counts were run in full and REFUSED (they lowered the score or broke a guarded rule):'
      : 'No candidate cleared the agreed bar (predicted gain on every pair after the per-node charge).',
    ...tried.map((t) => `- ${t.steps.at(-1)}: predicted ${t.predicted?.join('/') ?? '-'} faces, measured score ${startScore} -> ${t.result?.score ?? '-'}${t.refused.length ? ` (refused: ${t.refused.join('; ')})` : ''}`),
    '',
    `Reachable ceiling - the most ANY arrangement of today's masks could clean, per pair: ${ceilings.map((c) => pct(c.share)).join(' / ')} of the ours-only faces. "No separating mask in the tested vocabulary", not "impossible".`,
    '',
    '## The ask (generic, to be narrowed by a probe)',
    '',
    'A mask node from the common procedural vocabulary that separates the faces these tips should keep from the ones they should not. Candidates to probe (diagnostic only, in the Type Lab, on the same faces across every pair):',
    ...PROCEDURAL_CANDIDATES.map(([name, what]) => `- **${name}** - ${what}`),
    '',
    ...(probes.length ? [
      '## Probes run (diagnostic only, in the Type Lab)',
      '',
      ...probes.map((p) => `- **${p.name}** best band [${p.lo}, ${p.hi}) ${p.unit}: predicted faces per pair ${p.gains.join(' / ')} - ${p.worst > PROBE_BAR ? 'SEPARATES on every pair' : 'does not separate on every pair'}`),
      '',
      'Not probed yet: distance from a feature, curvature, component size, grow / shrink (they need surface neighbourhoods).',
      '',
    ] : []),
    'Evidence to attach when picked up: the fit folder\'s evidence.json and compose.json (scans named by hash only).',
  ];
  return `${lines.join('\n')}\n`;
}
