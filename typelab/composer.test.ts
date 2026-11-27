import { describe, expect, it } from 'vitest';
import { candidateMasks, rankCandidates, reachableCeiling, tally } from './composer.mjs';

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
