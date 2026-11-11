import { describe, expect, it } from 'vitest';
import { compareRuns, diffRecords, formatDifferences, recordOf, scanCoverage } from './real-scan-gate-lib.mjs';

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
  it('already fails a run that covered only part of the baseline', () => {
    // Worth pinning next to scanCoverage below: a PARTIAL run was never the silent case. A baseline
    // case in scope that did not run is a difference, so a half-present fixture set fails by name.
    expect(compareRuns(base(), { d1: { kind: 'denture', record: rec() } }).differences)
      .toEqual([{ id: 'a1', kind: 'aligner', problems: [{ field: 'case', was: 'in baseline', now: 'not found / not run' }] }]);
  });
});

describe('a gate that verified nothing never says PASS', () => {
  it('calls an empty run blind unless the operator asked for it, and never calls it PASS', () => {
    expect(scanCoverage(13, false)).toBe('run');
    expect(scanCoverage(1, false)).toBe('run');
    // The audit's hole (MIXO-07): this used to be an exit 0 with a tidy "skipped" line.
    expect(scanCoverage(0, false)).toBe('blind');
    // Allowed, but still not a pass: the caller must print NOT RUN for this.
    expect(scanCoverage(0, true)).toBe('not-run');
    // The opt-out cannot change the verdict of a run that did look at something.
    expect(scanCoverage(13, true)).toBe('run');
  });
});
