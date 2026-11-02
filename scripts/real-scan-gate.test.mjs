import { describe, expect, it } from 'vitest';
import { compareRuns, diffRecords, formatDifferences, recordOf } from './real-scan-gate-lib.mjs';

const row = { tipsPlaced: 10, tipsLeftOut: 2, islandsUnresolved: 1, printAngleDeg: 30, tipsBySource: 'rim 4 / area 6', unresolvedIslands: '', verdict: 'ok', result: 'built', reason: '', seconds: 12 };
const rec = (patch = {}, hashes = { 'case-001.glb': 'a'.repeat(64) }) => recordOf({ ...row, ...patch }, hashes);
const base = (extra = {}) => ({ cases: { d1: { kind: 'denture', record: rec() }, a1: { kind: 'aligner', record: rec() } }, ...extra });

describe('real-scan gate compare', () => {
  it('ignores timings and passes identical runs', () => {
    const runs = { d1: { kind: 'denture', record: rec({ seconds: 99 }) }, a1: { kind: 'aligner', record: rec() } };
    expect(compareRuns(base(), runs).ok).toBe(true);
  });
  it('reports a changed number, text and hash', () => {
    const changed = recordOf({ ...row, tipsPlaced: 9, verdict: 'look' }, { 'case-001.glb': 'b'.repeat(64) });
    const fields = diffRecords(rec(), changed).map((d) => d.field);
    expect(fields).toEqual(['tipsPlaced', 'verdict', 'sha256 case-001.glb']);
  });
  it('reports a missing peel file hash', () => {
    const d = diffRecords(rec({}, { a: '1', 'p.json': '2' }), rec({}, { a: '1' }));
    expect(d).toEqual([{ field: 'sha256 p.json', was: '2', now: '(none)' }]);
  });
  it('compares nondeterministic cases on numbers only', () => {
    const b = base({ nondeterministic: { d1: 'glb bytes vary' } });
    const runs = { d1: { kind: 'denture', record: rec({}, { 'case-001.glb': 'c'.repeat(64) }) }, a1: { kind: 'aligner', record: rec() } };
    expect(compareRuns(b, runs).ok).toBe(true);
    runs.d1.record = rec({ tipsLeftOut: 3 });
    expect(compareRuns(b, runs).ok).toBe(false);
  });
  it('flags missing and new cases; a kinds subset ignores the others', () => {
    const runs = { d1: { kind: 'denture', record: rec() }, n1: { kind: 'denture', record: rec() } };
    const r = compareRuns(base(), runs, ['denture']);
    expect(r.differences.map((d) => d.id)).toEqual(['n1']);
    expect(compareRuns(base(), {}, ['aligner']).differences.map((d) => d.id)).toEqual(['a1']);
    expect(formatDifferences(r.differences)).toContain('denture n1');
    expect(formatDifferences([])).toBe('No differences.');
  });
});
