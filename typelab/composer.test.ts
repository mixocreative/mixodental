import { describe, expect, it } from 'vitest';
import { candidateMasks, rankByRescore, rankCandidates, reachableCeiling, tally } from './composer.mjs';

describe('ranking by the re-score', () => {
  const pair = (asBuilt: number, scores: Record<string, [number, number]>) => ({ asBuilt, tips: 100,
    candidates: Object.entries(scores).map(([id, [score, dropped]]) => ({ build: { id }, score, dropped })) });
  it('keeps a candidate only if it helps on EVERY pair, by its worst pair, and flags big drops as low confidence', () => {
    const ranked = rankByRescore([pair(10, { A: [14, 5], B: [20, 40], C: [9, 1] }), pair(20, { A: [23, 5], B: [19, 40], C: [25, 1] })]);
    expect(ranked.map((c) => c.build.id)).toEqual(['A']); // B is worse on pair 2, C on pair 1
    expect(ranked[0]).toMatchObject({ gains: [4, 3], worst: 3, lowConfidence: false });
    const big = rankByRescore([pair(10, { B: [20, 40] })]);
    expect(big[0].lowConfidence).toBe(true);
  });
});

// classes per face: 0 neither, 1 target only, 2 ours only, 3 both
const classes = Uint8Array.of(2, 2, 2, 3, 3, 1, 0, 2);
const A = Uint8Array.of(1, 1, 1, 0, 0, 0, 0, 0); // the ours-only faces, cleanly
const B = Uint8Array.of(1, 0, 0, 1, 1, 0, 0, 1); // mixes ours-only with both

describe('a Mark no-support over a mask', () => {
  it('predicts ours-only cleaned minus both lost', () => {
    expect(tally(classes, A)).toMatchObject({ oursOnly: 3, both: 0, gain: 3 });
    expect(tally(classes, B)).toMatchObject({ oursOnly: 2, both: 2, gain: 0 });
  });
  it('builds NOTs and booleans, and keeps a mask identical per face once', () => {
    const masks = candidateMasks(classes, [{ id: 'A', values: A }, { id: 'A2', values: A }, { id: 'B', values: B }]);
    const builds = masks.map((m) => JSON.stringify(m.build));
    expect(builds).toContain('{"id":"A"}');
    expect(builds).not.toContain('{"id":"A2"}'); // same faces as A
    expect(builds).toContain('{"op":"not","a":"B"}');
    expect(builds.some((b) => b.includes('"op":"subtract"'))).toBe(true);
  });
});

describe('the reachable ceiling', () => {
  it('is what the best arrangement of the masks could clean, without a run', () => {
    expect(reachableCeiling(classes, [{ bits: A }])).toEqual({ oursOnly: 4, reachable: 3, share: 0.75 });
    // with no mask, everything sits in one group of 4 ours-only and 2 both: 2 reachable at best
    expect(reachableCeiling(classes, [])).toEqual({ oursOnly: 4, reachable: 2, share: 0.5 });
  });
});

describe('candidates across pairs', () => {
  it('keeps only a mask that clears the charge on EVERY pair', () => {
    const pair = { classes, nodes: [{ id: 'A', values: A }, { id: 'B', values: B }] };
    const weak = { classes: Uint8Array.of(2, 3, 3, 3, 3, 1, 0, 2), nodes: pair.nodes }; // A gains 1 - 2 = -1 here
    expect(rankCandidates([pair], { charge: 1 }).map((c) => c.build)).toContainEqual({ id: 'A' });
    expect(rankCandidates([pair, weak], { charge: 1 }).map((c) => c.build)).not.toContainEqual({ id: 'A' });
  });
});
