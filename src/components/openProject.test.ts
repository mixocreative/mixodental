import { describe, expect, it, vi } from 'vitest';
import { emptyScene } from '../state/project';
import { encodeProject } from '../state/projectFile';
import { JobActivity } from '@mixo-geocore/host/workers/jobActivity';
import { ProjectClient } from '../workers/projectClient';
import { openProjectFile, type OpenHost } from './openProject';

let now = 1000;
const goodFile = new File([encodeProject(emptyScene)], 'knot.mixodental');
const junkFile = new File(['not json'], 'junk.mixodental');

/** Open runs through the real client (no Worker, so the main-thread reader), which owns the blocking job row. */
function host(over: Partial<OpenHost> = {}) {
  const jobs = new JobActivity(() => now);
  const client = new ProjectClient(null, jobs);
  const calls = { replace: vi.fn(), refused: vi.fn(), status: vi.fn() };
  const base: OpenHost = {
    runtime: 'web', read: (file, limit) => client.open(file, limit), mode: () => 'off', hadObjects: () => false,
    replace: calls.replace, markSaved: () => {}, setStatusMessage: calls.status, offerUndo: () => {}, refused: calls.refused,
  };
  return { jobs, calls, host: { ...base, ...over } };
}
const idle = (jobs: JobActivity) => { now += 60_000; return jobs.view(); };

describe('open project', () => {
  it('replaces the plate and leaves no job row', async () => {
    const { jobs, calls, host: h } = host();
    await openProjectFile(goodFile, h);
    expect(calls.replace).toHaveBeenCalledTimes(1);
    expect(calls.status).toHaveBeenCalledWith({ key: 'Opened {name}.', vars: { name: 'knot.mixodental' } });
    expect(idle(jobs)).toEqual([]);
  });

  it('ends its blocking job when a mode began while the file was read, and leaves the plate alone', async () => {
    let mode: 'off' | 'edit' = 'off';
    const { jobs, calls, host: h } = host({ mode: () => mode });
    const read = h.read;
    h.read = async (file, limit) => { const scene = await read(file, limit); mode = 'edit'; return scene; };
    await openProjectFile(goodFile, h);
    expect(calls.refused).toHaveBeenCalledTimes(1);
    expect(calls.replace).not.toHaveBeenCalled();
    expect(idle(jobs)).toEqual([]);
  });

  it('reports a file that cannot be read, leaves the plate alone and ends the job', async () => {
    const { jobs, calls, host: h } = host();
    await openProjectFile(junkFile, h);
    // The key is parameterised now (GEO-011), so the guard moved to what actually matters: the app
    // passes its OWN product name and extension into the shared sentence. A key check alone would
    // pass with the vars empty, which on screen reads "is not a {product} project".
    expect(calls.status).toHaveBeenCalledWith(expect.objectContaining({
      key: expect.stringContaining('is not a {product} project'),
      vars: expect.objectContaining({ product: 'mixoDental', ext: '.mixodental' }),
    }));
    expect(calls.replace).not.toHaveBeenCalled();
    expect(idle(jobs)).toMatchObject([{ state: 'failed' }]);
  });

  it('refuses a project over the triangle limit by its size', async () => {
    const { calls, host: h } = host({ runtime: 'web' });
    await openProjectFile(goodFile, { ...h, read: (file) => new ProjectClient(null).open(file, 0.0001) });
    expect(calls.status).toHaveBeenCalledWith(expect.objectContaining({ key: expect.stringContaining('too large to open here') }));
  });

  it('says the models were not imported when they were dropped with the project', async () => {
    const { calls, host: h } = host();
    await openProjectFile(goodFile, h, true);
    expect(calls.status).toHaveBeenCalledWith({ key: 'Open the project alone; models were not imported.' });
    expect(calls.replace).toHaveBeenCalledTimes(1);
  });
});
