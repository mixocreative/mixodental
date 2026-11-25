import { describe, expect, it } from 'vitest';
import { diffText, runDiffs } from './compareRuns.mjs';

describe('what differs between one scan run with two types', () => {
  it('lists the result fields that moved, never the run\'s own names, files or time', () => {
    const a = { case: 'case-001', source: 'a.stl', glb: 'x.glb', peelFile: 'p.json', seconds: 34, stageTimes: 'scan 8', tipsPlaced: 180, stableBand: '0-44', verdict: 'clear', lean: 8.0001 };
    const b = { case: 'case-001', source: 'a.stl', glb: 'y.glb', peelFile: 'q.json', seconds: 39, tipsPlaced: 209, stableBand: '0-30', verdict: 'clear', lean: 8.0002 };
    expect(runDiffs(a, b)).toEqual([{ key: 'stableBand', a: '0-44', b: '0-30' }, { key: 'tipsPlaced', a: 180, b: 209 }]);
  });

  it('compares lists by their contents and counts a field only one run has', () => {
    expect(runDiffs({ tips: [1, 2] }, { tips: [1, 2] })).toEqual([]);
    expect(runDiffs({ tips: [1, 2] }, { tips: [1, 3] })).toHaveLength(1);
    expect(runDiffs({ islands: 2 }, {})).toEqual([{ key: 'islands', a: 2, b: undefined }]);
  });

  it('says a value in one short line', () => {
    expect(diffText(undefined)).toBe('-');
    expect(diffText(0.123456)).toBe('0.123');
    expect(diffText({ long: 'x'.repeat(80) }).endsWith('...')).toBe(true);
  });
});
