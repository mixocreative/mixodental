import { EventEmitter } from 'node:events';
import { describe, expect, it, vi } from 'vitest';
import { guardRun, refusalReason, rerunOutcome } from './rerunReport.mjs';

describe('the reason a refused run gives (cia F1)', () => {
  it('names the problem under benchwork\'s header, not just the header', () => {
    const log = 'starting\nNothing ran. 1 problem(s):\n  --set noSupportSteepDeg=30: the engine reads anything outside 45-90 (exclusive) as OFF\n';
    expect(refusalReason(log)).toBe('Nothing ran. 1 problem(s): --set noSupportSteepDeg=30: the engine reads anything outside 45-90 (exclusive) as OFF');
  });

  it('prefers the engine\'s own refusal of a graph', () => {
    expect(refusalReason('a\nThe zone graph was refused: NS: input "b" is not connected\nexit 2')).toBe('The zone graph was refused: NS: input "b" is not connected');
  });

  it('falls back to the last line, and says nothing about an empty log', () => {
    expect(refusalReason('one\ntwo\n')).toBe('two');
    expect(refusalReason(undefined)).toBeUndefined();
  });
});

describe('what "Done" may claim (cia F2)', () => {
  it('says an edited graph was NOT applied when the run reports the default', () => {
    const out = rerunOutcome({ graphEdited: true, summaryGraph: 'default', names: 'the edited zone graph' });
    expect(out.applied).toBe(false);
    expect(out.text).toMatch(/NOT applied/);
  });

  it('names the graph from the run\'s own summary', () => {
    const out = rerunOutcome({ graphEdited: true, summaryGraph: 'd7dc809c75a39f5e', names: 'the edited zone graph' });
    expect(out).toEqual({ applied: true, text: 'Done — showing the re-run with the edited zone graph (graph d7dc809c). The earlier review is still in its own folder.' });
  });

  it('a rules-only run on the default graph is plainly done', () => {
    expect(rerunOutcome({ graphEdited: false, summaryGraph: 'default', names: 'overhangAngleDeg=50' }).text).toBe('Done — showing the re-run with overhangAngleDeg=50. The earlier review is still in its own folder.');
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
