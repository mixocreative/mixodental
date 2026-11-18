// Deck scale: what generating supports for a whole CASE costs, and whether the cost per item grows.
// Run: npx vite-node scripts/perf/deck-scale.ts [items]
//
// THE QUESTION THIS ANSWERS, and it is the one that decides whether "auto-gen all" can ship.
//
// The deck is a worklist of 10-60 models. The plan is a button that generates supports for every
// one of them. The owner asked the right question before any of it was built: *"if user auto gen
// all listed files, can browser handle them ... becuz it sounds like there be memory issue."*
//
// A review of the code named the suspected mechanism: `meshWorker.ts` keeps ONE WASM BUILD SESSION
// PER UNIT in `BuildSessions`, freed only when its 512 MB source cache trims - and at ~6.7 MB a
// welded aligner that cache does not trim until about 80 units. So sixty sessions would accumulate
// inside one wasm instance, and wasm memory never shrinks. That is a hypothesis, not a measurement,
// and this file is the measurement.
//
// TWO MODES, which is the whole point:
//   pile    - a session per unit, never forgotten. What the worker does TODAY.
//   oneshot - `sessions.forget(id)` after each item. What the deck's queue would do.
// If the two curves are the same, the hypothesis is wrong and `forget` buys nothing. If `pile`
// climbs and `oneshot` is flat, the fix is one line in the queue and the plan is safe.
//
// WHAT IT DOES NOT MEASURE. Every item here builds the SAME mesh, on purpose: that isolates the
// cost of the SESSIONS from the cost of holding sixty different models, which is a separate
// question with its own answer (`vendor/.../core/budget.ts`: the scene keeps an indexed mesh at
// 18 B/triangle, so sixty aligners at rest are ~385 MiB, not the 1.5 GB a triangle-soup estimate
// suggests). It also runs in node, where `process.memoryUsage()` is the honest proxy for a figure
// a browser would read from `WebAssembly.Memory.buffer.byteLength`: `external` and `arrayBuffers`
// are where wasm linear memory lands.
import { performance } from 'node:perf_hooks';
import './../test-support/useNodeEngine';
import { runSupportJob } from '@mixo-geocore/host/supports/jobRunner';
import { BuildSessions } from '@mixo-geocore/host/workers/buildSessions';
import { base, jobAt, mesh, placed } from '../test-support/referenceStep3';

const ITEMS = Number(process.argv[2] ?? 60);
const MB = (bytes: number) => Math.round(bytes / 1048576);

interface Row { item: number; ms: number; rss: number; external: number; arrayBuffers: number }

/** One case, generated item by item. `keep` is today's worker; dropping each session is the fix. */
function run(mode: 'pile' | 'oneshot'): Row[] {
  const sessions = new BuildSessions();
  const rows: Row[] = [];
  for (let item = 0; item < ITEMS; item += 1) {
    // A DISTINCT UNIT ID PER ITEM, which is what makes this a case rather than one model rebuilt:
    // `BuildSessions` keys on the unit id, so sixty ids are sixty sessions.
    const id = `unit-${item}`;
    const started = performance.now();
    runSupportJob(jobAt(base), undefined, 0, sessions.site(id, 1, mesh, 1));
    const ms = Math.round(performance.now() - started);
    if (mode === 'oneshot') sessions.forget(id);
    const memory = process.memoryUsage();
    rows.push({ item: item + 1, ms, rss: MB(memory.rss), external: MB(memory.external), arrayBuffers: MB(memory.arrayBuffers) });
  }
  sessions.clear();
  return rows;
}

/** First, last, worst and the slope: four numbers are the result, not a wall of rows. */
function summary(rows: readonly Row[]) {
  const first = rows[0]!;
  const last = rows[rows.length - 1]!;
  return {
    items: rows.length,
    msFirst: first.ms,
    msLast: last.ms,
    msTotal: rows.reduce((sum, row) => sum + row.ms, 0),
    rssFirstMB: first.rss,
    rssLastMB: last.rss,
    rssPeakMB: Math.max(...rows.map((row) => row.rss)),
    rssGrowthPerItemMB: +((last.rss - first.rss) / Math.max(1, rows.length - 1)).toFixed(2),
    externalLastMB: last.external,
    arrayBuffersLastMB: last.arrayBuffers,
  };
}

const pile = run('pile');
const oneshot = run('oneshot');

console.log(JSON.stringify({
  method: 'vite-node, pkg-node build, reference aligner, runSupportJob per item through BuildSessions, '
    + 'one unit id per item. pile = a session per unit never forgotten (what meshWorker does today); '
    + 'oneshot = sessions.forget(id) after each item. Node memoryUsage stands in for wasm buffer size.',
  triangles: mesh.indices ? mesh.indices.length / 3 : 'unknown',
  contacts: placed.points.length,
  pile: summary(pile),
  oneshot: summary(oneshot),
  verdict: {
    sessionsPileUp: summary(pile).rssGrowthPerItemMB > summary(oneshot).rssGrowthPerItemMB + 0.5,
    note: 'sessionsPileUp true means the deck queue MUST forget each item; false means the hypothesis was wrong.',
  },
  rows: { pile, oneshot },
}, null, 2));
