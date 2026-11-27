import { describe, expect, it } from 'vitest';
import { CLASS, fitEvidence, streamsOutside } from './fitEvidence.mjs';

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
