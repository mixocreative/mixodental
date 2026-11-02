import { describe, expect, it } from 'vitest';
import type { TriangleMesh } from '@mixo-geocore/host/core/analysis/types';
import { jobActivity } from '@mixo-geocore/host/workers/jobActivity';
import type { WorkerLike } from '@mixo-geocore/host/workers/WorkerTask';
import type { DentureJob } from './dentureCore';
import { DentureClient } from './dentureClient';

/*
 * Audit 2026-11-02 #3: a denture job that hangs or runs long could not be cancelled, and leaving the step left it
 * running, so every later denture job (the next file's scan, an export) waited behind it for up to ten minutes.
 */

/** Workers that never answer until `answer` is called; each records what it was sent and whether it was stopped. */
function hungWorkers() {
  const made: { sent: { id: number; payload: { kind: string } }[]; stopped: boolean; worker: WorkerLike }[] = [];
  const create = (): WorkerLike => {
    const entry = { sent: [] as { id: number; payload: { kind: string } }[], stopped: false, worker: undefined as unknown as WorkerLike };
    entry.worker = {
      onmessage: null, onerror: null,
      postMessage(message) { entry.sent.push(message as { id: number; payload: { kind: string } }); },
      terminate() { entry.stopped = true; },
    };
    made.push(entry);
    return entry.worker;
  };
  const answer = (at: number, result: unknown) => {
    const entry = made[at]!;
    const job = entry.sent.at(-1)!;
    entry.worker.onmessage?.({ data: { id: job.id, type: 'done', result } });
  };
  return { made, create, answer };
}

const mesh = (): TriangleMesh => ({ positions: new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]), indices: new Uint32Array([0, 1, 2]) });
const job = (): DentureJob => ({ mesh: mesh(), mode: 'preview' }) as unknown as DentureJob;
const label = { key: 'Building supports for {name}', vars: { name: 'D' } };
const tick = () => new Promise((resolve) => setTimeout(resolve, 0));
const row = (key: string) => jobActivity.view(Date.now() + 60_000).find((candidate) => candidate.label.key === key);

describe('DentureClient cancel', () => {
  it('a running build can be cancelled from the activity list; the worker is replaced and the next job runs', async () => {
    const workers = hungWorkers();
    const client = new DentureClient(workers.create);
    const build = client.build('u1', job(), label);
    const next = client.place('u1', { mesh: mesh() } as never, { key: 'Placing support tips on {name}', vars: { name: 'D' } });
    await tick();
    const running = row('Building supports for {name}');
    expect(running?.cancellable).toBe(true);
    expect(jobActivity.cancel(running!.id)).toBe(true);
    await expect(build).rejects.toMatchObject({ name: 'AbortError' });
    await tick();
    // The hung worker is stopped; the queued placement runs on a fresh one instead of waiting behind it.
    expect(workers.made[0]!.stopped).toBe(true);
    expect(workers.made[1]?.sent.map((sent) => sent.payload.kind)).toEqual(['place']);
    workers.answer(1, { kind: 'placed', points: [], parts: {} });
    expect(await next).toEqual({ points: [], parts: {} });
    client.dispose();
  });

  it('leaving a step stops its running job quietly and drops its queued ones', async () => {
    const workers = hungWorkers();
    const client = new DentureClient(workers.create);
    const orient = client.orient('u1', mesh(), 'p', {} as never, { key: 'Orienting {name}', vars: { name: 'D' } });
    const place = client.place('u1', { mesh: mesh() } as never, { key: 'Placing support tips on {name}', vars: { name: 'D' } });
    const other = client.build('u2', job(), label);
    await tick();
    client.cancel('orient:');
    client.cancel('place:');
    await expect(orient).rejects.toMatchObject({ name: 'AbortError' });
    expect(await place).toBeUndefined();
    await tick();
    // Left quietly: no failed or cancelled row stays behind for a step the operator left.
    expect(row('Orienting {name}')).toBeUndefined();
    // The other unit's build was not touched and runs next.
    expect(workers.made.at(-1)!.sent.map((sent) => sent.payload.kind)).toEqual(['build']);
    workers.answer(workers.made.length - 1, { kind: 'built', mesh: { ok: true } });
    expect(await other).toEqual({ ok: true });
    client.dispose();
  });

  it('a live tilt is not offered for cancel (it answers in milliseconds)', async () => {
    const workers = hungWorkers();
    const client = new DentureClient(workers.create);
    void client.liveAt('u1', 5).catch(() => undefined);
    await tick();
    expect(jobActivity.view(Date.now() + 60_000).some((candidate) => candidate.cancellable)).toBe(false);
    client.dispose();
  });
});
