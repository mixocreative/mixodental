import { describe, expect, it } from 'vitest';
import { bannerOf, newSession, resultId, rowsOf, totalsOf } from './reviewSession.mjs';

const summary = (tips: number) => ({ cases: [{ case: 'case-001', source: 'x', result: 'built', glb: 'case-001.glb', needsLook: tips < 10 }] });

describe('the scan session: imported scans, the type they run with, and what each came to', () => {
  it('shows a scan done with this type as its run\'s own row, and every other scan by its state', () => {
    const session = newSession({ kind: 'denture', scans: ['a.stl', 'b.stl', 'c.stl'] });
    session.results.set(resultId('a.stl', 'soft', 'p1'), { state: 'done', url: '/cache/k1/', summary: summary(5) });
    session.results.set(resultId('b.stl', 'soft', 'p1'), { state: 'running', since: 0 });
    const rows = rowsOf(session, 'soft', 'p1');
    expect(rows.map((r) => [r.case, r.result])).toEqual([['case-001', 'built'], ['case-002', 'running'], ['case-003', 'not run']]);
    expect(rows[0]).toMatchObject({ glb: 'case-001.glb', source: 'a.stl', needsLook: true, session: { url: '/cache/k1/', at: 0 } });
    expect(totalsOf(rows)).toBe('1 of 3 run, 1 need a look, 1 running');
  });

  it('never shows one type\'s result under another type, or under an edited version of the same type', () => {
    const session = newSession({ kind: 'denture', scans: ['a.stl'] });
    session.results.set(resultId('a.stl', 'soft', 'p1'), { state: 'done', url: '/cache/k1/', summary: summary(20) });
    expect(rowsOf(session, 'firm', 'p2')[0]!.result).toBe('not run');
    expect(rowsOf(session, 'soft', 'p-edited')[0]!.result).toBe('not run');
    expect(rowsOf(session, 'soft', 'p1')[0]!.result).toBe('built');
  });

  it('says in the banner which scan, which type, and what the picture is', () => {
    const base = { at: 1, count: 3, typeName: 'Soft denture' };
    expect(bannerOf({ ...base, run: { state: 'done' } })).toBe('Scan 2 of 3 with Soft denture - current');
    expect(bannerOf({ ...base, run: { state: 'running', since: 1000 }, now: 13_400 })).toBe('Scan 2 of 3 with Soft denture - running, 12 s');
    expect(bannerOf({ ...base, run: { state: 'queued' } })).toMatch(/waiting for a free run slot/);
    expect(bannerOf({ ...base, run: { state: 'failed', error: 'no rim found' } })).toMatch(/the run failed: no rim found/);
    expect(bannerOf({ ...base, run: { state: 'not run' } })).toMatch(/not run yet/);
  });
});
