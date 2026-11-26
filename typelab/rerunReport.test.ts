import { EventEmitter } from 'node:events';
import { describe, expect, it, vi } from 'vitest';
import { guardRun, notApplied, refusalReason } from './rerunReport.mjs';
import { defaultGraph } from './nodeGraph.mjs';
import { defaultGraph as orientDefault } from './orientGraph.mjs';

describe('the reason a refused run gives (cia F1)', () => {
  it('names the problem under typelab\'s header, not just the header', () => {
    const log = 'starting\nNothing ran. 1 problem(s):\n  --set noSupportSteepDeg=30: the engine reads anything outside 45-90 (exclusive) as OFF\n';
    expect(refusalReason(log)).toBe('Nothing ran. 1 problem(s): --set noSupportSteepDeg=30: the engine reads anything outside 45-90 (exclusive) as OFF');
  });

  it('prefers the engine\'s own refusal of a graph', () => {
    expect(refusalReason('a\nThe zone graph was refused: NS: input "b" is not connected\nexit 2')).toBe('The zone graph was refused: NS: input "b" is not connected');
  });

  it('names a refused type, not the exit line after it', () => {
    const log = 'out: x\nThe type was refused: denture profile id "reference-denture" is a built-in\n\nThe review did not finish (exit 2).\n';
    expect(refusalReason(log)).toBe('The type was refused: denture profile id "reference-denture" is a built-in');
  });

  it('falls back to the last line, and says nothing about an empty log', () => {
    expect(refusalReason('one\ntwo\n')).toBe('two');
    expect(refusalReason(undefined)).toBeUndefined();
  });
});

describe('whether a finished run applied what it was given (cia F2)', () => {
  const graph = { nodes: [], outputs: {} };
  const denture = (extra: object) => ({ category: 'denture', ...extra });
  it('says a type\'s zone graph was NOT applied when the run reports the default', () => {
    expect(notApplied(denture({ zoneGraph: graph }), { zoneGraph: 'default' })).toMatch(/zone graph was NOT applied/);
    expect(notApplied(denture({ zoneGraph: graph }), {})).toMatch(/NOT applied/);
    expect(notApplied(denture({ zoneGraph: graph }), { zoneGraph: 'd7dc809c75a39f5e' })).toBeNull();
  });

  // U6: the Orient canvas's graph is checked against the run's own `orientGraph` the same way.
  it('says a type\'s Orient graph was NOT applied when the run reports the standard Step 1', () => {
    expect(notApplied(denture({ orientGraph: graph }), { orientGraph: 'default' })).toMatch(/Orient graph was NOT applied/);
    expect(notApplied(denture({ orientGraph: graph }), { orientGraph: 'a1b2c3d4e5' })).toBeNull();
    expect(refusalReason('x\nThe Orient graph was refused: POSE: "angleDeg" must be between -90 and 90, got 200\nexit 2')).toMatch(/^The Orient graph was refused: POSE/);
  });

  it('a type with neither graph, an aligner type (whose run always records "default"), or one that writes the standard graphs out, is plainly applied', () => {
    expect(notApplied(denture({ zoneGraph: null }), { zoneGraph: 'default' })).toBeNull();
    expect(notApplied({ category: 'aligner', zoneGraph: graph }, { zoneGraph: 'default' })).toBeNull();
    expect(notApplied(denture({ zoneGraph: defaultGraph(), orientGraph: orientDefault() }), { zoneGraph: 'default', orientGraph: 'default' })).toBeNull();
  });
});

describe('one answer per run (cia F3)', () => {
  const fakeChild = () => Object.assign(new EventEmitter(), { kill: vi.fn() });

  it('stops a run that outlives its limit, and answers once', async () => {
    const child = fakeChild();
    const calls: string[] = [];
    guardRun(child, 20, { exit: () => calls.push('exit'), error: () => calls.push('error'), timeout: () => calls.push('timeout') });
    await new Promise((r) => setTimeout(r, 60));
    child.emit('exit', null); // the kill's own exit arrives after the answer
    expect(calls).toEqual(['timeout']);
    expect(child.kill).toHaveBeenCalledOnce();
  });

  it('stops a run past its limit the way the caller says (a tree kill on Windows), not by killing the parent alone', async () => {
    const child = fakeChild();
    const kill = vi.fn();
    guardRun(child, 20, { exit: () => undefined, error: () => undefined, timeout: () => undefined, kill });
    await new Promise((r) => setTimeout(r, 60));
    expect(kill).toHaveBeenCalledOnce();
    expect(child.kill).not.toHaveBeenCalled();
  });

  it('answers a spawn error, then ignores the exit that follows', async () => {
    const child = fakeChild();
    const calls: string[] = [];
    guardRun(child, 1000, { exit: () => calls.push('exit'), error: () => calls.push('error'), timeout: () => calls.push('timeout') });
    child.emit('error', new Error('ENOENT'));
    child.emit('exit', 1);
    await new Promise((r) => setTimeout(r, 20));
    expect(calls).toEqual(['error']);
  });

  it('a run that exits in time is answered by its exit, and the limit never fires', async () => {
    const child = fakeChild();
    const calls: unknown[] = [];
    guardRun(child, 30, { exit: (code: unknown) => calls.push(code), error: () => calls.push('error'), timeout: () => calls.push('timeout') });
    child.emit('exit', 0);
    await new Promise((r) => setTimeout(r, 60));
    expect(calls).toEqual([0]);
    expect(child.kill).not.toHaveBeenCalled();
  });
});
