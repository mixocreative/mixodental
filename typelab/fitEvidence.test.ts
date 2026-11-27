import { describe, expect, it } from 'vitest';
import { CLASS, faceDescriptors, fitEvidence, probeBand, streamsOutside } from './fitEvidence.mjs';

describe('the gap probes', () => {
  it('measures a face\'s slope from horizontal (0 up, 90 wall, 180 down) and its height in the model\'s range', () => {
    // three faces: one facing up at y=0, one wall, one facing down at y=10
    const positions = [0, 0, 0, 0, 0, 1, 1, 0, 0, /* up */ 0, 0, 0, 0, 1, 0, 1, 0, 0, /* wall */ 0, 10, 0, 1, 10, 0, 0, 10, 1 /* down */];
    const { slope, height } = faceDescriptors(positions, [0, 1, 2, 3, 4, 5, 6, 7, 8]);
    expect([...slope]).toEqual([0, 90, 180]);
    expect(height[0]).toBe(0);
    expect(height[2]).toBe(255);
  });
  it('finds the band that cleans ours-only faces on EVERY pair, not the one a single pair likes', () => {
    const classes = Uint8Array.of(CLASS.oursOnly, CLASS.oursOnly, CLASS.both, CLASS.both);
    const pairA = { classes, values: Uint8Array.of(170, 175, 10, 20) };
    const pairB = { classes, values: Uint8Array.of(165, 172, 30, 40) };
    const best = probeBand([pairA, pairB], [0, 60, 120, 181]);
    expect(best).toMatchObject({ lo: 120, hi: 181, gains: [2, 2], worst: 2 });
  });
});

const faces = Uint8Array.of(CLASS.targetOnly, CLASS.oursOnly, CLASS.both, CLASS.neither, CLASS.oursOnly);

describe('the fit evidence of one run', () => {
  it('says how much of each source\'s support area is outside the target', () => {
    const e = fitEvidence({ streams: [{ stream: 'rim', tips: 10, oursMm2: 40, bothMm2: 30 }, { stream: 'area', tips: 5, oursMm2: 20, bothMm2: 4 }], faceClass: faces, nodes: [] });
    expect(e.streams).toEqual([
      { stream: 'rim', tips: 10, oursMm2: 40, insideMm2: 30, outsideMm2: 10, outsideShare: 0.25 },
      { stream: 'area', tips: 5, oursMm2: 20, insideMm2: 4, outsideMm2: 16, outsideShare: 0.8 },
    ]);
  });
  it('counts what each node holds in each area class, and refuses a node with the wrong face count', () => {
    const e = fitEvidence({ streams: [], faceClass: faces, nodes: [{ id: 'R1', values: Uint8Array.of(1, 1, 0, 1, 0) }] });
    expect(e.nodes).toEqual([{ id: 'R1', holds: 3, targetOnly: 1, oursOnly: 1, both: 0 }]);
    expect(e.faces).toEqual({ targetOnly: 1, oursOnly: 2, both: 1 });
    expect(() => fitEvidence({ streams: [], faceClass: faces, nodes: [{ id: 'X', values: Uint8Array.of(1) }] })).toThrow(/1 values for 5 faces/);
  });
});

describe('across the pairs', () => {
  it('sums each source and puts the biggest area outside the target first', () => {
    const one = fitEvidence({ streams: [{ stream: 'rim', tips: 10, oursMm2: 40, bothMm2: 30 }, { stream: 'area', tips: 5, oursMm2: 20, bothMm2: 4 }], faceClass: faces, nodes: [] });
    expect(streamsOutside([one, one]).map((s) => [s.stream, s.outsideMm2])).toEqual([['area', 32], ['rim', 20]]);
  });
});
