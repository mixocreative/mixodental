import { describe, expect, it } from 'vitest';
import { createQueue, resultKey } from './runQueue.mjs';

/** A queue whose runs finish only when the test says so. */
function harness(limit: number) {
  const finishers = new Map<string, (result: object) => void>();
  const stopped: string[] = [];
  const queue = createQueue({
    limit,
    now: () => 1000,
    start: (job: { key: string }, finish: (result: object) => void) => { finishers.set(job.key, finish); return () => { stopped.push(job.key); }; },
  });
  return { queue, finish: (key: string) => finishers.get(key)!({ ok: key }), stopped, started: () => [...finishers.keys()] };
}

describe('the order the workbench runs scans in', () => {
  it('runs at most the limit at once, and the next starts when one finishes', async () => {
    const h = harness(2);
    const a = h.queue.submit('a', { key: 'a' });
    h.queue.submit('b', { key: 'b' });
    h.queue.submit('c', { key: 'c' });
    expect(h.started()).toEqual(['a', 'b']);
    expect(h.queue.list().map((r) => [r.key, r.state])).toEqual([['a', 'running'], ['b', 'running'], ['c', 'queued']]);
    h.finish('a');
    await expect(a).resolves.toEqual({ ok: 'a' });
    expect(h.started()).toEqual(['a', 'b', 'c']);
  });

  it('joins a run already under way for the same scan and type instead of building it twice', async () => {
    const h = harness(1);
    const first = h.queue.submit('a', { key: 'a' });
    const second = h.queue.submit('a', { key: 'a' });
    expect(h.queue.list()).toHaveLength(1);
    h.finish('a');
    await expect(Promise.all([first, second])).resolves.toEqual([{ ok: 'a' }, { ok: 'a' }]);
    expect(h.queue.busy()).toBe(false);
  });

  it('stops a running run and drops a queued one, telling every waiter', async () => {
    const h = harness(1);
    const running = h.queue.submit('a', { key: 'a' });
    const queued = h.queue.submit('b', { key: 'b' });
    expect(h.queue.stop('b')).toBe(true);
    await expect(queued).resolves.toEqual({ stopped: true });
    expect(h.queue.stop('a')).toBe(true);
    await expect(running).resolves.toEqual({ stopped: true });
    expect(h.stopped).toEqual(['a']);
    expect(h.queue.stop('a')).toBe(false);
    // A run that finishes after it was stopped cannot answer again.
    h.finish('a');
    expect(h.queue.busy()).toBe(false);
  });

  it('keys a result on the scan, the type and the engine', () => {
    expect(resultKey({ scan: 'abc', type: 'def', engine: 71 })).toBe('abc-def-e71');
  });
});
