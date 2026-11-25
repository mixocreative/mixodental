// Local viewer for one folder-review output: serves the viewer page, three.js from node_modules
// and the review files on 127.0.0.1 only, then opens the browser. Ctrl+C (or closing the window)
// stops it. Without a folder the viewer opens empty and takes a run dropped onto the page.
// Usage: node dentalwork/batch-review/serve.mjs [output folder] [--no-open] [--lan]
// --lan also listens on the local network (e.g. to look from a phone); review files hold patient scans,
// so use it only on a trusted home/office network.
import { createServer } from 'node:http';
import { createHash } from 'node:crypto';
import { createReadStream, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, watch, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { exec, spawn } from 'node:child_process';
import { stampNow } from '../../benchwork/rules.mjs';
import { guardRun, notApplied, refusalReason } from './rerunReport.mjs';
import { scanSet, scanSetWords } from './scanSet.mjs';
import { createQueue, resultKey } from './runQueue.mjs';
import { runPrint } from './typeDraft.mjs';
import { clashRefusal, idLooksDated, saveName, saveRefusal, savesByType } from '../../src/dentalTypes/typeSaves.mjs';
import { proofOf, typeFileText } from '../../src/dentalTypes/typeText.mjs';
import { HOST_GEOMETRY_VERSION } from '../../vendor/mixo-geocore/host/geometryVersion.js';
import { RIM_PLACEMENT } from './nodeGraph.mjs';
import { viteNodeCli } from '../../scripts/viteNodeCli.mjs';

const here = dirname(fileURLToPath(import.meta.url));
// The first argument that is not a --flag, nor the value of --port.
const [folder] = process.argv.slice(2).filter((arg, k, all) => !arg.startsWith('--') && all[k - 1] !== '--port');
const lan = process.argv.includes('--lan');
if (folder && !existsSync(join(resolve(folder), 'summary.json'))) {
  console.error('Give an output folder that holds summary.json (made by run-batch-review.bat), or none to drop one in the viewer.');
  process.exit(1);
}
/*
 * `/out/` ALWAYS HOLDS ITS SLOT, even with no folder yet, because these are matched by INSERTION
 * ORDER: `'/out/x'.startsWith('/')` is true, so an `/out/` added after `/` would never win and the
 * review folder's files would silently be looked up in the viewer's own directory instead. `/out/` is the folder given
 * on the command line and nothing else: Apply runs in the scan session (POST /run into the cache), never over it.
 */
// The Zones tab's live previews (plan D3) land in one folder per server, outside every review folder, so a preview
// never writes into the review on screen.
const previewDir = mkdtempSync(join(tmpdir(), 'mixo-preview-'));
const roots = {
  '/three/': join(here, '..', '..', 'node_modules', 'three'),
  '/benchwork/': join(here, '..', '..', 'benchwork'),
  '/out/': folder ? resolve(folder) : undefined,
  '/preview/': previewDir,
  // typeDraft.mjs imports '../../src/dentalTypes/typeText.mjs'; from a page at '/' that resolves here. Only the plain
  // JavaScript modules there are useful to the page; the folder holds no patient data.
  '/src/dentalTypes/': join(here, '..', '..', 'src', 'dentalTypes'),
  // Every run the workbench made, by its key (POST /run): before '/', which would otherwise match first.
  '/cache/': join(here, '..', 'output', 'review-cache'),
  '/': here,
};
const types = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.glb': 'model/gltf-binary', '.csv': 'text/csv' };

/*
 * THE LIVE PREVIEWS (plan D3), each a short engine run with no build, in seconds:
 * - POST /zone-preview - the Zones tab: every zone node's value for the page's graph (zonePreviewRun.ts);
 * - POST /tilt-preview - tabs 4 and 5: the print-angle search with the page's settings and the tips at its pick
 *   (tiltPreviewRun.ts), given the page's edits as benchwork takes them (MIXO_RULES, a draft type's files).
 * ONE of each at a time: a newer request stops the one of its kind still running, because only the page as it is now
 * is worth showing. Each run writes to its own folder, so a stopped one that finishes late cannot overwrite a newer
 * result. Same source check as POST /run.
 */
const previews = { zone: { child: null, seq: 0 }, tilt: { child: null, seq: 0 } };
/** Stops a running preview or run - its whole tree on Windows, where a run starts processes of its own (benchwork starts vite-node) and kill() would stop only the first. */
function stopPreview(child) {
  if (!child || child.exitCode !== null) return;
  if (process.platform === 'win32' && child.pid) exec(`taskkill /pid ${child.pid} /T /F`, () => undefined);
  else child.kill();
}
/** Writes `value` as JSON into the run's folder and returns the file, for a script argument or an env variable. */
function fileOf(out, name, value) {
  const file = join(out, name);
  writeFileSync(file, JSON.stringify(value));
  return file;
}
/**
 * Runs one preview of `kind`: `prepare(ask, out)` gives the script, its extra arguments and env (or throws a
 * TypeError naming a bad input, answered 400); the answer is the script's `<meta>` JSON, with `bin` turned into its URL.
 */
function runPreview(kind, request, response, prepare) {
  let body = '';
  request.on('data', (chunk) => { body += chunk; if (body.length > 64_000) request.destroy(); });
  request.on('end', () => {
    const send = (code, payload) => response.writeHead(code, { 'content-type': 'application/json', 'cache-control': 'no-store' }).end(JSON.stringify(payload));
    let ask;
    try { ask = JSON.parse(body); } catch { send(400, { error: 'not JSON' }); return; }
    const source = typeof ask?.source === 'string' ? resolve(ask.source) : '';
    if (!source.toLowerCase().endsWith('.stl') || !existsSync(source) || !statSync(source).isFile()) {
      send(400, { error: `not an STL on this machine: ${ask?.source ?? '(none)'}` });
      return;
    }
    const slot = previews[kind];
    const seq = ++slot.seq;
    const folder = `${kind}-${seq}`;
    const out = join(previewDir, folder);
    mkdirSync(out, { recursive: true });
    let plan;
    try { plan = prepare(ask, out); } catch (error) { send(400, { error: error.message }); return; }
    const args = ['--script', join('dentalwork', 'batch-review', plan.script), '--source', source, '--out', out, ...(plan.args ?? [])];
    stopPreview(slot.child);
    // Only the variables this preview sets: a MIXO_* left in the server's own environment must not ride along.
    const env = { ...Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith('MIXO_'))), ...(plan.env ?? {}) };
    // vite-node's entry under this node, no shell: a shell joined the arguments unquoted on Windows, so a scan path
    // with a space split in two (benchwork/cli.mjs has the same note).
    const child = spawn(process.execPath, [viteNodeCli, ...args], { cwd: join(here, '..', '..'), stdio: ['ignore', 'pipe', 'pipe'], env });
    slot.child = child;
    let log = '';
    child.stdout.on('data', (chunk) => { log += chunk; });
    child.stderr.on('data', (chunk) => { log += chunk; });
    guardRun(child, 5 * 60 * 1000, {
      timeout: () => { stopPreview(child); send(500, { error: 'the preview took over 5 minutes and was stopped', log: log.slice(-2000) }); },
      error: (error) => send(500, { error: `the preview could not start: ${error.message}`, log: log.slice(-2000) }),
      exit: (code) => {
        if (slot.child === child) slot.child = null;
        if (seq !== slot.seq) { send(409, { error: 'replaced by a newer preview' }); return; }
        const meta = join(out, plan.meta);
        if (code !== 0 || !existsSync(meta)) { send(500, { error: refusalReason(log) ?? `the preview did not finish (exit ${code})`, log: log.slice(-2000) }); return; }
        const read = JSON.parse(readFileSync(meta, 'utf8'));
        send(200, { ok: true, ...read, ...(read.bin ? { bin: `/preview/${folder}/${read.bin}` } : {}) });
      },
    });
  });
}
const zonePreview = (request, response) => runPreview('zone', request, response, (ask, out) => {
  const graph = ask?.zoneGraph && typeof ask.zoneGraph === 'object' ? fileOf(out, 'zone-graph.json', ask.zoneGraph) : null;
  // The Rim tab's belt widths (RIM_PLACEMENT keys only, as /tilt-preview checks them) make the preview a draft type.
  const placement = Object.fromEntries(Object.entries(ask?.placement && typeof ask.placement === 'object' ? ask.placement : {}).filter(([k, v]) => k in RIM_PLACEMENT && Number.isFinite(v)));
  const draft = Object.keys(placement).length > 0;
  return {
    script: 'zonePreviewRun.ts', meta: 'zone-preview.json',
    args: [...(graph && !draft ? ['--graph', graph] : []), ...(Number.isFinite(ask?.steepDeg) ? ['--steep', String(ask.steepDeg)] : [])],
    env: draft ? { MIXO_TYPE_ID: 'preview', MIXO_PLACEMENT_FILE: fileOf(out, 'placement.json', placement), ...(graph ? { MIXO_ZONE_GRAPH_FILE: graph } : {}) } : {},
  };
});
const tiltPreview = (request, response) => runPreview('tilt', request, response, (ask, out) => {
  // The checks benchwork makes: a rule name is a plain identifier (packRules refuses an unknown one
  // with its name), the search keys are tilt*Deg, the placement keys are the Rim tab's (RIM_PLACEMENT).
  const rules = Object.fromEntries(Object.entries(ask?.rules && typeof ask.rules === 'object' ? ask.rules : {})
    .filter(([name, value]) => /^[A-Za-z][A-Za-z0-9]*$/.test(name) && (typeof value === 'boolean' || Number.isFinite(value))));
  const pose = Object.fromEntries(Object.entries(ask?.pose && typeof ask.pose === 'object' ? ask.pose : {}).filter(([k, v]) => /^tilt[A-Za-z]+Deg$/.test(k) && Number.isFinite(v)));
  const placement = Object.fromEntries(Object.entries(ask?.placement && typeof ask.placement === 'object' ? ask.placement : {}).filter(([k, v]) => k in RIM_PLACEMENT && Number.isFinite(v)));
  const draft = Object.keys(pose).length > 0 || Object.keys(placement).length > 0;
  const frame = ask?.frame;
  if (frame !== undefined && frame !== null && !(Array.isArray(frame.position) && Array.isArray(frame.rotation))) throw new TypeError('frame must have a position and a rotation');
  return {
    script: 'tiltPreviewRun.ts', meta: 'tilt-preview.json',
    args: frame ? ['--frame', fileOf(out, 'frame.json', { position: frame.position.map(Number), rotation: frame.rotation.map(Number) })] : [],
    env: {
      ...(Object.keys(rules).length > 0 ? { MIXO_RULES: JSON.stringify(rules) } : {}),
      // A draft type, only when the search or the strip widths are edited: that is how a run gets them (typeInForce.ts).
      ...(draft ? { MIXO_TYPE_ID: 'preview' } : {}),
      ...(Object.keys(pose).length > 0 ? { MIXO_POSE_FILE: fileOf(out, 'pose.json', pose) } : {}),
      ...(Object.keys(placement).length > 0 ? { MIXO_PLACEMENT_FILE: fileOf(out, 'placement.json', placement) } : {}),
      ...(ask?.zoneGraph && typeof ask.zoneGraph === 'object' ? { MIXO_ZONE_GRAPH_FILE: fileOf(out, 'zone-graph.json', ask.zoneGraph) } : {}),
      ...(ask?.orientGraph && typeof ask.orientGraph === 'object' ? { MIXO_ORIENT_GRAPH_FILE: fileOf(out, 'orient-graph.json', ask.orientGraph) } : {}),
    },
  };
});

/*
 * GET /types - every type the workbench can open (typeCatalog.ts): each category's built-in and the save in force of
 * every saved type, each as its whole type file, plus every file that could not load and why. Read once at start and
 * again after a Save (`catalog = null`), through typeCatalogRun.ts: the built-ins and the type file's checks are
 * TypeScript this plain-Node server cannot import. A failure is answered as an error the page shows, never as an
 * empty list - "no types" and "could not read the types" must not look the same.
 */
let catalog = null;
function readCatalog() {
  catalog ??= new Promise((done) => {
    const file = join(previewDir, `catalog-${Date.now()}.json`);
    const env = Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith('MIXO_')));
    const child = spawn(process.execPath, [viteNodeCli, '--script', join('dentalwork', 'batch-review', 'typeCatalogRun.ts'), '--out', file],
      { cwd: join(here, '..', '..'), stdio: ['ignore', 'pipe', 'pipe'], env });
    let log = '';
    child.stdout.on('data', (chunk) => { log += chunk; });
    child.stderr.on('data', (chunk) => { log += chunk; });
    const fail = (error) => { catalog = null; done({ error, log: log.slice(-2000) }); };
    guardRun(child, 2 * 60 * 1000, {
      timeout: () => { stopPreview(child); fail('reading the types took over 2 minutes and was stopped'); },
      error: (error) => fail(`the type list could not start: ${error.message}`),
      exit: (code) => {
        if (code !== 0 || !existsSync(file)) { fail(refusalReason(log) ?? `the type list did not finish (exit ${code})`); return; }
        done(JSON.parse(readFileSync(file, 'utf8')));
      },
    });
  });
  return catalog;
}
// Read again after ANY change in types/ - a file deleted by hand is how a save is rolled back (owner, 2026-11-25),
// and a list read once kept offering the deleted save until the server restarted (seen 2026-11-26).
try {
  watch(join(here, '..', '..', 'types'), { recursive: true }, () => { catalog = null; });
} catch (error) {
  console.warn(`types/ is not watched (${error.message}): a type file changed by hand shows after a restart or a Save.`);
}
function typeList(response) {
  readCatalog().then((read) => response.writeHead(read.error ? 500 : 200, { 'content-type': 'application/json', 'cache-control': 'no-store' }).end(JSON.stringify(read)));
}

/*
 * IMPORT (reviewer overhaul step 5): the workbench takes scans itself - a folder chosen in the system's own dialog, or a
 * pasted path - instead of needing a batch run first. Scans are READ WHERE THEY ARE, never copied (patient data), and
 * `scanSet.mjs` decides which are cases (an owner's -sup.stl is a reference, never a case). Both routes are refused when
 * the server listens on the network (--lan): they list and open folders on this machine (plan decision 10).
 */
const MAX_FILES = 5000;
/** Every file under `path` (a file, or a folder walked recursively), at most MAX_FILES. */
function filesUnder(path, found = []) {
  if (found.length >= MAX_FILES) return found;
  const stat = statSync(path, { throwIfNoEntry: false });
  if (!stat) return found;
  if (stat.isFile()) { found.push(path); return found; }
  if (stat.isDirectory()) for (const name of readdirSync(path).sort()) filesUnder(join(path, name), found);
  return found;
}
// 2 MB: a review folder of a few hundred scans sends every path to /import; 64 KB cut that off (Fable, 2026-11-26).
const BODY_LIMIT = 2_000_000;
function readBody(request, done) {
  let body = '';
  request.on('data', (chunk) => { body += chunk; if (body.length > BODY_LIMIT) request.destroy(); });
  request.on('end', () => { try { done(JSON.parse(body || '{}')); } catch { done(null); } });
}
const sendJson = (response, code, payload) => response.writeHead(code, { 'content-type': 'application/json', 'cache-control': 'no-store' }).end(JSON.stringify(payload));
function importScans(request, response) {
  if (lan) { sendJson(response, 403, { error: 'importing is off while the workbench is open to the network (--lan)' }); return; }
  readBody(request, (ask) => {
    // `path`: one folder or file. `paths`: the scans a review folder ran (its summary's sources), so a batch's cases
    // open as a session - a scan no longer at its path is counted and said, never dropped silently.
    const asked = (Array.isArray(ask?.paths) ? ask.paths : [ask?.path]).filter((p) => typeof p === 'string' && p.trim() !== '');
    const paths = [...new Set(asked.map((p) => resolve(p.trim().replace(/^"|"$/g, ''))))];
    const found = paths.filter((p) => existsSync(p));
    if (found.length === 0) { sendJson(response, 400, { error: `nothing at ${asked.join(', ') || '(no path)'}` }); return; }
    const files = found.reduce((all, p) => filesUnder(p, all), []);
    const set = scanSet(files);
    const missing = paths.length - found.length;
    const gone = missing ? ` ${missing} scan(s) are no longer at their path and are left out.` : '';
    sendJson(response, 200, { root: found.length === 1 ? found[0] : null, ...set, missing, words: `${scanSetWords(set)}${gone}`, truncated: files.length >= MAX_FILES });
  });
}
/** The system's own folder dialog (Windows), as run-batch-review.bat opens it. Answers { path } or { cancelled }. */
function pickFolder(response) {
  if (lan) { sendJson(response, 403, { error: 'choosing a folder is off while the workbench is open to the network (--lan)' }); return; }
  if (process.platform !== 'win32') { sendJson(response, 501, { error: 'the folder dialog is Windows only here - paste the folder path instead' }); return; }
  const script = "Add-Type -AssemblyName System.Windows.Forms; $f = New-Object System.Windows.Forms.Form -Property @{ TopMost = $true }; $d = New-Object System.Windows.Forms.FolderBrowserDialog; $d.Description = 'Folder with the scans to review (subfolders are included)'; $d.ShowNewFolderButton = $false; if ($d.ShowDialog($f) -eq [System.Windows.Forms.DialogResult]::OK) { $d.SelectedPath }";
  const child = spawn('powershell', ['-NoProfile', '-STA', '-Command', script], { stdio: ['ignore', 'pipe', 'pipe'] });
  let out = '';
  child.stdout.on('data', (chunk) => { out += chunk; });
  child.on('error', (error) => sendJson(response, 500, { error: `the folder dialog could not open: ${error.message}` }));
  child.on('exit', () => { const path = out.trim(); sendJson(response, 200, path ? { path } : { cancelled: true }); });
}

/*
 * RUNS AND THEIR CACHE (reviewer overhaul step 6). POST /run runs ONE scan with ONE type and answers with the folder
 * that holds the result, at most 2 builds at once (runQueue.mjs). A result is kept under its key - the scan's bytes,
 * the type's run fingerprint and the engine version (resultKey) - in dentalwork/output/review-cache (git-ignored), so
 * switching back to a type already run on a scan is instant, and undoing an edit finds the earlier result. A run is a
 * RESULT only once `finished.json` is written beside it, last: a stopped or failed run never looks like one. (Not a
 * rename of a finished folder: on Windows a just-exited build can still hold its files, and the rename fails EPERM.)
 *
 * A BUILT-IN runs as the plain built-in run (no type file - what gate:real measures), and only when the page's copy
 * of it is unchanged: a built-in is read-only, so a built-in that differs is refused rather than run as something else.
 */
const CACHE = roots['/cache/'];
const FINISHED = 'finished.json';
mkdirSync(CACHE, { recursive: true });
const scanPrints = new Map();
/** A scan's fingerprint (its bytes, never its name: patient data), remembered by path, size and time. */
function scanPrintOf(path) {
  const stat = statSync(path);
  const memo = `${path}|${stat.size}|${stat.mtimeMs}`;
  if (!scanPrints.has(memo)) scanPrints.set(memo, createHash('sha256').update(readFileSync(path)).digest('hex').slice(0, 16));
  return scanPrints.get(memo);
}
const queue = createQueue({
  limit: 2,
  start: (job, finish) => {
    const part = join(CACHE, job.key);
    try {
      rmSync(part, { recursive: true, force: true });
      mkdirSync(part, { recursive: true });
    } catch (error) {
      finish({ error: `the run's folder could not be cleared: ${error.message}` });
      return () => undefined;
    }
    const args = [];
    if (job.type) { writeFileSync(join(part, 'type-in.json'), `${JSON.stringify(job.type, null, 2)}\n`); args.push('--type', join(part, 'type-in.json')); }
    const child = spawn(process.execPath, [join(here, '..', '..', 'benchwork', 'cli.mjs'), '--kind', job.kind, '--out', part, ...args, job.source],
      { cwd: join(here, '..', '..'), stdio: ['ignore', 'pipe', 'pipe'] });
    let log = '';
    child.stdout.on('data', (chunk) => { log += chunk; });
    child.stderr.on('data', (chunk) => { log += chunk; });
    guardRun(child, 15 * 60 * 1000, {
      timeout: () => { stopPreview(child); finish({ error: 'the run took over 15 minutes and was stopped', log: log.slice(-4000) }); },
      error: (error) => finish({ error: `the run could not start: ${error.message}`, log: log.slice(-4000) }),
      exit: (code) => {
        if (code !== 0 || !existsSync(join(part, 'summary.json'))) { finish({ error: refusalReason(log) ?? `the run stopped with exit ${code}`, log: log.slice(-4000) }); return; }
        // A run that finished without applying the graph its type carried is NOT that type's result (cia F2): no
        // finished.json, so it is never served, cached or counted as Save's proof.
        let skipped = null;
        try { skipped = job.type ? notApplied(job.type, JSON.parse(readFileSync(join(part, 'summary.json'), 'utf8'))) : null; } catch (error) { skipped = `its summary could not be read: ${error.message}`; }
        if (skipped) { finish({ error: skipped, log: log.slice(-4000) }); return; }
        writeFileSync(join(part, FINISHED), JSON.stringify({ at: new Date().toISOString() }));
        finish({ ok: true, key: job.key, url: `/cache/${job.key}/` });
      },
    });
    return () => stopPreview(child);
  },
});
function runScan(request, response) {
  readBody(request, async (ask) => {
    const kind = ask?.kind === 'aligner' ? 'aligner' : 'denture';
    const source = typeof ask?.source === 'string' ? resolve(ask.source) : '';
    if (!source.toLowerCase().endsWith('.stl') || !existsSync(source) || !statSync(source).isFile()) { sendJson(response, 400, { error: `not an STL on this machine: ${ask?.source ?? '(none)'}` }); return; }
    const type = ask?.type;
    if (!type || typeof type !== 'object' || type.category !== kind) { sendJson(response, 400, { error: `send the whole ${kind} type file to run` }); return; }
    let runType = type;
    if (ask.builtIn) {
      const read = await readCatalog();
      const builtIn = read.types?.find((t) => t.builtIn && t.id === type.id && t.category === kind);
      if (!builtIn || runPrint(builtIn.type) !== runPrint(type)) { sendJson(response, 400, { error: `${type.id} is a built-in type and is read-only - Duplicate it to edit` }); return; }
      runType = null;
    }
    const key = resultKey({ scan: scanPrintOf(source), type: runPrint(type), engine: HOST_GEOMETRY_VERSION });
    if (existsSync(join(CACHE, key, FINISHED))) { sendJson(response, 200, { ok: true, key, url: `/cache/${key}/`, cached: true }); return; }
    const result = await queue.submit(key, { key, kind, source, type: runType, label: ask?.label });
    sendJson(response, result.ok ? 200 : result.stopped ? 409 : 500, result);
  });
}
function stopRun(request, response) {
  readBody(request, (ask) => sendJson(response, 200, { stopped: queue.stop(String(ask?.key ?? '')) }));
}
/** The cache's size on disk, so it never grows unseen (plan risk: dentalwork/output already holds gigabytes). */
function cacheSize() {
  let bytes = 0;
  let runs = 0;
  for (const name of existsSync(CACHE) ? readdirSync(CACHE) : []) {
    runs += 1;
    for (const file of filesUnder(join(CACHE, name))) bytes += statSync(file).size;
  }
  return { bytes, runs };
}
function clearCache(response) {
  if (queue.busy()) { sendJson(response, 409, { error: 'a run is going - stop it or let it finish, then clear' }); return; }
  try {
    rmSync(CACHE, { recursive: true, force: true });
  } catch (error) {
    // Windows can hold a file a moment after a build: say so rather than claim it is cleared.
    sendJson(response, 500, { error: `some of the cache could not be removed yet (${error.code ?? error.message}) - try again`, ...cacheSize() });
    return;
  } finally {
    mkdirSync(CACHE, { recursive: true });
  }
  sendJson(response, 200, cacheSize());
}

/*
 * SAVE A TYPE (reviewer overhaul step 9; owner, 2026-11-25): APPEND-ONLY. Every save writes a NEW file,
 * types/<category>/<id>.<YYYYMMDD-HHMMSS>.type.json (typeSaves.mjs), and never touches an older one: the newest is in
 * force, deleting it is the rollback, older ones stay to reuse. What is saved is the page's whole draft with its proof
 * record - the scans it ran on, by their bytes' fingerprint, from the kept runs.
 *
 * REFUSED, by name, when:
 * - the draft never ran on a scan as it stands (Apply first): a saved type is always one that was looked at;
 * - a NEWER save of that id exists than the one the page opened - saving would hide it (two people, or two tabs);
 * - the id is new to the page (a built-in's edit, a duplicate) but a saved type already has it;
 * - the id is a built-in's, or the name reads the same as another listed type's (typeSaves.mjs clashRefusal) - the app
 *   would refuse one of the two, so it is caught BEFORE anything is written.
 * The same contents as the newest save write nothing. Save does not commit or push: the answer names the file and the
 * commands, and pushing stays a person's act.
 */
function saveDraft(request, response) {
  readBody(request, async (ask) => {
    const draft = ask?.draft;
    if (!draft || typeof draft !== 'object' || !/^(denture|aligner)$/.test(draft.category ?? '') || !/^[a-z0-9][a-z0-9.-]*$/.test(draft.id ?? '') || idLooksDated(draft.id)) {
      sendJson(response, 400, { error: 'the draft must be a whole type file with a category and an id (lower-case letters, digits, dots, dashes; not ending like a date stamp)' });
      return;
    }
    const print = runPrint(draft);
    const tail = `-${print}-e${HOST_GEOMETRY_VERSION}`;
    const scans = (existsSync(CACHE) ? readdirSync(CACHE) : []).filter((name) => name.endsWith(tail) && existsSync(join(CACHE, name, FINISHED))).map((name) => name.slice(0, -tail.length));
    if (scans.length === 0) { sendJson(response, 400, { error: 'it has not run on any scan as it stands - Apply first, so a saved type is always one that was looked at' }); return; }
    const dir = join(here, '..', '..', 'types', draft.category);
    const { types: saved } = savesByType(existsSync(dir) ? readdirSync(dir).map((name) => `types/${draft.category}/${name}`) : []);
    const newest = saved.find((t) => t.id === draft.id)?.saves[0];
    const opened = typeof ask?.openedStamp === 'string' ? ask.openedStamp : null;
    const listed = await readCatalog();
    if (listed.error) { sendJson(response, 500, { error: `the type list could not be read to check the name: ${listed.error}` }); return; }
    const others = (listed.types ?? []).map((t) => ({ id: t.id, builtIn: t.builtIn, names: t.type?.profile?.name ?? { en: t.name } }));
    const refusal = clashRefusal({ id: draft.id, names: draft.profile?.name ?? {}, others })
      ?? saveRefusal({ id: draft.id, newest: newest?.stamp ?? null, opened });
    if (refusal) { sendJson(response, 409, { error: refusal }); return; }
    const { proved: _proved, ...clean } = draft;
    const type = { ...clean, validation: proofOf(clean, { engineVersion: HOST_GEOMETRY_VERSION, scans, at: new Date().toISOString() }) };
    if (newest) {
      const before = JSON.parse(readFileSync(join(here, '..', '..', newest.path), 'utf8'));
      const same = (t) => typeFileText({ ...t, validation: null });
      if (same(before) === same(type)) { sendJson(response, 200, { ok: true, same: true, path: newest.path, stamp: newest.stamp }); return; }
    }
    const stamp = stampNow();
    const path = `types/${draft.category}/${saveName(draft.id, stamp)}`;
    try {
      mkdirSync(dir, { recursive: true });
      writeFileSync(join(here, '..', '..', path), typeFileText(type), { flag: 'wx' }); // never over an existing file
    } catch (error) {
      sendJson(response, 500, { error: `${path} could not be written: ${error.message}` });
      return;
    }
    // Whether the APP will load it, by the app's own rule: the type list read again, its refusal for this file if any.
    catalog = null;
    const read = await readCatalog();
    const refused = read.refused?.find((r) => r.file === path);
    sendJson(response, 200, { ok: true, path, stamp, scans: scans.length, typeLoad: refused ? { loads: false, reason: refused.reason } : { loads: true } });
  });
}

/*
 * DRAFTS KEPT (reviewer overhaul step 8, plan decision 5): a type's edits not saved yet, one file per type in
 * dentalwork/output/review-drafts (git-ignored), so a reload, a restart or a cleared browser keeps them. POST /draft
 * { key, draft } writes one (draft null removes it); GET /drafts answers them all. A key is `<category>-<id>`.
 */
const DRAFTS = join(here, '..', 'output', 'review-drafts');
const DRAFT_KEY = /^(denture|aligner)-[a-z0-9][a-z0-9.-]*$/;
function keepDraft(request, response) {
  readBody(request, (ask) => {
    const key = String(ask?.key ?? '');
    if (!DRAFT_KEY.test(key)) { sendJson(response, 400, { error: 'a draft key is <category>-<type id>' }); return; }
    const file = join(DRAFTS, `${key}.json`);
    try {
      if (ask.draft && typeof ask.draft === 'object') { mkdirSync(DRAFTS, { recursive: true }); writeFileSync(file, JSON.stringify(ask.draft)); }
      else rmSync(file, { force: true });
      sendJson(response, 200, { ok: true });
    } catch (error) {
      sendJson(response, 500, { error: `the draft could not be kept: ${error.message}` });
    }
  });
}
function listDrafts(response) {
  const drafts = {};
  for (const name of existsSync(DRAFTS) ? readdirSync(DRAFTS).filter((n) => n.endsWith('.json')) : []) {
    try { drafts[name.slice(0, -'.json'.length)] = JSON.parse(readFileSync(join(DRAFTS, name), 'utf8')); } catch { /* a half-written draft is skipped */ }
  }
  sendJson(response, 200, { drafts });
}

const server = createServer((request, response) => {
  const path = decodeURIComponent(new URL(request.url ?? '/', 'http://localhost').pathname);
  if (request.method === 'POST' && path === '/zone-preview') { zonePreview(request, response); return; }
  if (request.method === 'POST' && path === '/tilt-preview') { tiltPreview(request, response); return; }
  if (request.method === 'GET' && path === '/types') { typeList(response); return; }
  if (request.method === 'POST' && path === '/import') { importScans(request, response); return; }
  if (request.method === 'POST' && path === '/pick-folder') { pickFolder(response); return; }
  if (request.method === 'POST' && path === '/run') { runScan(request, response); return; }
  if (request.method === 'POST' && path === '/save-draft') { saveDraft(request, response); return; }
  if (request.method === 'POST' && path === '/draft') { keepDraft(request, response); return; }
  if (request.method === 'GET' && path === '/drafts') { listDrafts(response); return; }
  if (request.method === 'POST' && path === '/run-stop') { stopRun(request, response); return; }
  if (request.method === 'GET' && path === '/jobs') { sendJson(response, 200, { jobs: queue.list() }); return; }
  if (request.method === 'GET' && path === '/cache-size') { sendJson(response, 200, cacheSize()); return; }
  if (request.method === 'POST' && path === '/cache-clear') { clearCache(response); return; }
  const [prefix, root] = Object.entries(roots).find(([prefix, root]) => root !== undefined && path.startsWith(prefix));
  const file = normalize(join(root, path === '/' ? 'viewer.html' : path.slice(prefix.length)));
  if (!file.startsWith(normalize(root + sep)) || !existsSync(file) || !statSync(file).isFile()) {
    response.writeHead(404).end('Not found');
    return;
  }
  response.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream', 'cache-control': 'no-store' });
  createReadStream(file).pipe(response);
});

/*
 * A FIXED PORT (reviewer overhaul step 8): the page keeps its per-viewer state (stage, layout, edits) in the browser
 * by ORIGIN, and a random port made every start a new origin - the edits were gone. 6705 unless --port says otherwise;
 * when it is taken (a second workbench), the next free port is used and the line below says which.
 */
const portArg = process.argv.indexOf('--port');
const wanted = portArg >= 0 ? Number(process.argv[portArg + 1]) : 6705;
function listen(port) {
  server.once('error', (error) => {
    if (error.code === 'EADDRINUSE' && port !== 0) { console.log(`Port ${port} is taken (another workbench?) - using a free one; edits kept in this browser start empty there.`); listen(0); return; }
    throw error;
  });
  server.listen(port, lan ? '0.0.0.0' : '127.0.0.1', () => {
    const url = `http://127.0.0.1:${server.address().port}/`;
    console.log(`Review viewer: ${url}  (keep this window open while you look; Ctrl+C to stop)`);
    const open = process.platform === 'win32' ? `start "" "${url}"` : process.platform === 'darwin' ? `open "${url}"` : `xdg-open "${url}"`;
    if (!process.argv.includes('--no-open')) exec(open);
  });
}
listen(Number.isInteger(wanted) && wanted >= 0 ? wanted : 6705);
