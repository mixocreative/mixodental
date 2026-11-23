import { describe, expect, it } from 'vitest';
import { LABEL_GAP_MM, readoutLines, sideAnchors } from './orientReadout';

describe('the six named sides (B3)', () => {
  it('each label sits just past the part along its side, Left = +across seen from the front, teeth up', () => {
    // A 20 x 10 x 6 box centred at the origin: front = +x, teeth = +y, across = +z.
    const corners = [-10, 10].flatMap((x) => [-5, 5].flatMap((y) => [-3, 3].flatMap((z) => [x, y, z])));
    const anchors = sideAnchors(corners, { up: [1, 0, 0], lean: [0, 1, 0], across: [0, 0, 1] });
    const at = Object.fromEntries(anchors.map((a) => [a.name, a.position]));
    expect(at.Front).toEqual([10 + LABEL_GAP_MM, 0, 0]);
    expect(at.Back).toEqual([-10 - LABEL_GAP_MM, 0, 0]);
    expect(at['Teeth side']).toEqual([0, 5 + LABEL_GAP_MM, 0]);
    expect(at['Tissue side']).toEqual([0, -5 - LABEL_GAP_MM, 0]);
    expect(at.Left).toEqual([0, 0, 3 + LABEL_GAP_MM]);
    expect(at.Right).toEqual([0, 0, -3 - LABEL_GAP_MM]);
    expect(sideAnchors([], { up: [1, 0, 0], lean: [0, 1, 0], across: [0, 0, 1] })).toEqual([]);
  });
});

describe('what each Orient node says (B3)', () => {
  const arch = { flatness: 0.0412, legsGapRatio: 0.63, teethOffsetMm: 2.4, teethGuessSure: false };
  it('Arch shape: its measurements and how sure the first guess was', () => {
    expect(readoutLines({ type: 'frame', centroid: [0, 0, 0], up: [1, 0, 0], lean: [0, 1, 0], across: [0, 0, 1], decided: false, arch })).toEqual([
      'flatness 0.041 (lower = flatter)', 'legs gap ratio 0.63', 'teeth side guess: not sure (offset 2.4 mm)',
    ]);
  });
  it('Name the sides: the widths, the vote, and what it turned round', () => {
    const lines = readoutLines({ type: 'frame', centroid: [0, 0, 0], up: [1, 0, 0], lean: [0, 1, 0], across: [0, 0, 1], decided: true, arch,
      sides: { frontBack: { widthMm: [28.9, 41.2], margin: 0.3, crossCheckAgrees: true }, sliceVotes: { forTeethSide: 8, against: 1, notVoting: 2 }, confidence: 0.888, frontTurnedRound: false, teethSideTurnedRound: true } });
    expect(lines).toEqual(['back is the wider end: back 41.2 mm, front 28.9 mm', 'teeth side: 8 of 9 voting slices agree (89%), 2 not voting', 'turned round from the first guess: teeth side']);
  });
  it('a flat area and a base frame say what they are; a pose says nothing more than its words', () => {
    expect(readoutLines({ type: 'region', centroid: [0, 0, 0], normal: [0, -1, 0], areaMm2: 799.6, protrusionMm: 0, faces: [] })).toEqual(['area 800 mm2', 'pokes out 0.00 mm past it']);
    expect(readoutLines({ type: 'frame', centroid: [0, 0, 0], up: [0, 1, 0], lean: [1, 0, 0], across: [0, 0, 1], decided: false, arch: { flatness: 0, legsGapRatio: 0, teethOffsetMm: 0, teethGuessSure: true } })).toEqual(['a frame from the base: no arch was measured']);
    expect(readoutLines({ type: 'pose', up: [0, 1, 0], lean: [1, 0, 0], across: [0, 0, 1] })).toEqual([]);
    expect(readoutLines(undefined)).toEqual([]);
  });
});
