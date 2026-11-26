import { describe, expect, it } from 'vitest';
import { beats, comparedRows, refusals, scoreRun } from './fitScore.mjs';

const row = (source: string, over: Record<string, unknown> = {}) => ({ case: `case-${source}`, source, result: 'built', verdict: 'clear', tipsLeftOut: 0,
  islandsUnresolved: 0, targetState: 'ok', ownerAreaCoveredPct: 70, outsideOwnerAreaPct: 60, ...over });

describe('scoring a setup against the targets', () => {
  it('is mean covered minus mean outside, over the compared pairs only', () => {
    const rows = [row('a', { ownerAreaCoveredPct: 80, outsideOwnerAreaPct: 40 }), row('b', { ownerAreaCoveredPct: 60, outsideOwnerAreaPct: 20 }),
      row('c', { targetState: 'none', ownerAreaCoveredPct: null, outsideOwnerAreaPct: null })];
    expect(comparedRows(rows)).toHaveLength(2);
    expect(scoreRun(rows)).toEqual({ score: 40, covered: 70, outside: 30, pairs: 2, perPair: { a: 40, b: 40 }, disqualified: [] });
  });
  it('disqualifies a better match that breaks our own rules', () => {
    const base = [row('a'), row('b')];
    const worse = [row('a', { verdict: 'blocked', ownerAreaCoveredPct: 99, outsideOwnerAreaPct: 0 }), row('b', { tipsLeftOut: 3 })];
    const run = scoreRun(worse, base);
    expect(run.disqualified).toEqual(['case-a: verdict blocked, was clear', 'case-b: 3 tips left out, was 0']);
    expect(beats(run, scoreRun(base))).toBe(false);
  });
  it('disqualifies a run where a pair stops building or stops being compared', () => {
    const base = [row('a'), row('b')];
    const run = scoreRun([row('a', { result: 'inconclusive', reason: 'x', targetState: 'not-compared' }), row('b', { islandsUnresolved: 1 })], base);
    expect(run.disqualified).toEqual(['case-a: no longer builds (x)', 'case-a: no longer compared with its target', 'case-b: 1 islands unserved, was 0']);
  });
  it('a clean, strictly higher score beats; a tie keeps what it had', () => {
    const base = scoreRun([row('a')]);
    expect(beats(scoreRun([row('a', { ownerAreaCoveredPct: 71 })], [row('a')]), base)).toBe(true);
    expect(beats(scoreRun([row('a')], [row('a')]), base)).toBe(false);
  });
  it('a case missing from the run disqualifies it: a smaller set must not score higher', () => {
    const base = [row('a'), row('b', { ownerAreaCoveredPct: 10 })];
    expect(scoreRun([row('a')], base).disqualified).toEqual(['case-b: missing from the run']);
  });
  it('a higher mean that makes one pair clearly worse is refused', () => {
    const base = [row('a'), row('b'), row('c')];
    const better = scoreRun([row('a', { ownerAreaCoveredPct: 95 }), row('b', { ownerAreaCoveredPct: 95 }), row('c', { ownerAreaCoveredPct: 60 })], base);
    expect(refusals(better, scoreRun(base))).toEqual(['a pair got worse (10 -> 0)']);
  });
  it('a gain carried by one pair alone is refused (leave-one-out); the same gain on two pairs is kept', () => {
    const base = [row('a'), row('b'), row('c')];
    const one = scoreRun([row('a', { ownerAreaCoveredPct: 90 }), row('b'), row('c')], base);
    expect(refusals(one, scoreRun(base))).toEqual(['the gain rests on one pair alone (leave-one-out)']);
    const two = scoreRun([row('a', { ownerAreaCoveredPct: 80 }), row('b', { ownerAreaCoveredPct: 80 }), row('c')], base);
    expect(refusals(two, scoreRun(base))).toEqual([]);
  });
});
