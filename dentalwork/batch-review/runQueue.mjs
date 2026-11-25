// Copyright (c) Mixo Creative.

/*
 * ONE JOB: the order the review workbench's runs happen in (docs/REVIEWER-OVERHAUL-PLAN.md section 3a, build step 6).
 *
 * - AT MOST `limit` RUNS AT ONCE (plan decision 4: 2). A support build is the biggest thing this machine does; the
 *   memory-first rule says two, raised only after measuring.
 * - ONE RUN PER KEY. A key is a scan with a type (`resultKey`); asking for one that is already queued or running
 *   joins it instead of starting a second build of the same thing - switching back and forth between two types while
 *   one runs must not stack up copies.
 * - STOP is per key: a queued run is dropped, a running one stopped; everyone waiting on it is told "stopped".
 *
 * The run itself is handed in (`start(job, finish) -> stop`), so the order rules are tested without a build.
 */

/**
 * The cache key of a scan run with a type: the scan's bytes, the type's run fingerprint (`typeDraft.mjs` runPrint -
 * a rename keeps it, a setting changes it) and the engine version, so an engine update never serves an old result.
 * @param {{ scan: string, type: string, engine: number }} parts
 */
export const resultKey = ({ scan, type, engine }) => `${scan}-${type}-e${engine}`;

/**
 * @param {{ limit: number, start: (job: object, finish: (result: object) => void) => () => void, now?: () => number }} options
 */
export function createQueue({ limit, start, now = Date.now }) {
  /** key -> { job, state: 'queued' | 'running', waiters: Function[], stop?: Function, startedAt?: number } */
  const runs = new Map();

  const running = () => [...runs.values()].filter((r) => r.state === 'running').length;
  function settle(key, result) {
    const run = runs.get(key);
    if (!run) return;
    runs.delete(key);
    for (const waiter of run.waiters) waiter(result);
    pump();
  }
  function pump() {
    for (const [key, run] of runs) {
      if (running() >= limit) return;
      if (run.state !== 'queued') continue;
      run.state = 'running';
      run.startedAt = now();
      let done = false;
      run.stop = start(run.job, (result) => { if (!done) { done = true; settle(key, result); } });
    }
  }

  return {
    /** Run `job` under `key`, or join the run already queued or running under it. Resolves with its result. */
    submit(key, job) {
      return new Promise((resolve) => {
        const run = runs.get(key);
        if (run) { run.waiters.push(resolve); return; }
        runs.set(key, { job, state: 'queued', waiters: [resolve] });
        pump();
      });
    },
    /** Stop the run under `key`: dropped if queued, stopped if running. False when there is none. */
    stop(key) {
      const run = runs.get(key);
      if (!run) return false;
      if (run.state === 'running') run.stop?.();
      settle(key, { stopped: true });
      return true;
    },
    /** Every queued and running run, in order, for the page's case chips. */
    list() {
      return [...runs.entries()].map(([key, run]) => ({ key, state: run.state, ...(run.startedAt ? { startedAt: run.startedAt } : {}), ...(run.job.label ? { label: run.job.label } : {}) }));
    },
    busy: () => runs.size > 0,
  };
}
