// Local viewer for one folder-review output: serves the viewer page, three.js from node_modules
// and the review files on 127.0.0.1 only, then opens the browser. Ctrl+C (or closing the window)
// stops it. Without a folder the viewer opens empty and takes a run dropped onto the page.
// Usage: node dentalwork/batch-review/serve.mjs [output folder] [--no-open] [--lan]
// --lan also listens on the local network (e.g. to look from a phone); review files hold patient scans,
// so use it only on a trusted home/office network.
import { createServer } from 'node:http';
import { createReadStream, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { exec, spawn } from 'node:child_process';
import { stampNow } from '../../benchwork/rules.mjs';
import { guardRun } from './rerunReport.mjs';
import { saveVerdict } from './saveType.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const [folder] = process.argv.slice(2).filter((arg) => !arg.startsWith('--'));
const lan = process.argv.includes('--lan');
if (folder && !existsSync(join(resolve(folder), 'summary.json'))) {
  console.error('Give an output folder that holds summary.json (made by run-batch-review.bat), or none to drop one in the viewer.');
  process.exit(1);
}
/*
 * `/out/` IS REASSIGNABLE, so a benchwork re-run can be looked at without restarting the server: the
 * POST below runs the tool into a FRESH folder (never over the one being read - a review of patient
 * scans is not something to overwrite in place) and then points `/out/` at it. `/benchwork/` is
 * served so the page imports the rule shortlist from the same module the CLI uses, rather than
 * keeping a second copy of thirteen names that would drift.
 */
/*
 * `/out/` ALWAYS HOLDS ITS SLOT, even with no folder yet, because these are matched by INSERTION
 * ORDER: `'/out/x'.startsWith('/')` is true, so an `/out/` added after `/` would never win and every
 * re-run would silently serve the viewer's own directory instead of the review.
 */
const roots = {
  '/three/': join(here, '..', '..', 'node_modules', 'three'),
  '/benchwork/': join(here, '..', '..', 'benchwork'),
  '/out/': folder ? resolve(folder) : undefined,
  '/': here,
};
const types = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.glb': 'model/gltf-binary', '.csv': 'text/csv' };

/*
 * POST /rerun - run benchwork with the panel's rules and show the result.
 *
 * It runs into a FRESH folder and then re-points `/out/` at it, so the review being read is never
 * overwritten: these are patient scans and a re-run is an experiment, not a correction.
 *
 * IT VALIDATES THE SOURCE rather than passing the page's string to a child process. The server is
 * bound to 127.0.0.1 and this is a local dev tool, but the page is the only thing that supplies this
 * path, and "a local tool so it does not matter" is how a shell injection ships.
 */
/**
 * POST /save-type - copy the type the review on screen RAN (its out folder's type.json, with the proof
 * record the batch wrote) into `types/<category>/<id>.type.json` in this repo, to be committed
 * (owner ruling 2: types live in committed files). It saves only what ran - never a page's unrun edits -
 * so a saved type is always one that was proved on at least the scans of that run.
 */
function saveType(response, replace) {
  const send = (code, payload) => response.writeHead(code, { 'content-type': 'application/json', 'cache-control': 'no-store' }).end(JSON.stringify(payload));
  const from = roots['/out/'] ? join(roots['/out/'], 'type.json') : '';
  if (!from || !existsSync(from)) { send(400, { error: 'the review on screen ran no type - Apply with a type name first' }); return; }
  let type;
  try { type = JSON.parse(readFileSync(from, 'utf8')); } catch { send(500, { error: 'type.json is not readable' }); return; }
  if (!/^(denture|aligner)$/.test(type?.category) || !/^[a-z0-9][a-z0-9.-]*$/.test(type?.id ?? '')) { send(500, { error: 'type.json does not name a category and id' }); return; }
  const dir = join(here, '..', '..', 'types', type.category);
  mkdirSync(dir, { recursive: true });
  const to = join(dir, `${type.id}.type.json`);
  const text = readFileSync(from, 'utf8');
  // A different file already at that path is REPLACED only when the page says so (`?replace=1`, after asking) - the
  // rule and its test are saveType.mjs.
  if (saveVerdict({ existing: existsSync(to) ? readFileSync(to, 'utf8') : null, text, replace }) === 'ask') {
    send(409, { exists: true, path: `types/${type.category}/${type.id}.type.json` });
    return;
  }
  writeFileSync(to, text);
  // Whether the APP will load it (typeInForce.ts appLoadVerdict, written beside type.json by the run): returned here so
  // the Save message says it even after a page reload, when the page no longer holds the run's answer.
  const verdictFile = join(roots['/out/'], 'type-load.json');
  let typeLoad = null;
  try { typeLoad = existsSync(verdictFile) ? JSON.parse(readFileSync(verdictFile, 'utf8')) : null; } catch { typeLoad = null; }
  send(200, { ok: true, path: `types/${type.category}/${type.id}.type.json`, typeLoad });
}

function rerun(request, response) {
  let body = '';
  request.on('data', (chunk) => { body += chunk; if (body.length > 64_000) request.destroy(); });
  request.on('end', () => {
    const send = (code, payload) => response.writeHead(code, { 'content-type': 'application/json', 'cache-control': 'no-store' }).end(JSON.stringify(payload));
    let ask;
    try { ask = JSON.parse(body); } catch { send(400, { error: 'not JSON' }); return; }
    const kind = ask?.kind === 'aligner' ? 'aligner' : 'denture';
    const source = typeof ask?.source === 'string' ? resolve(ask.source) : '';
    if (!source.toLowerCase().endsWith('.stl') || !existsSync(source) || !statSync(source).isFile()) {
      send(400, { error: `not an STL on this machine: ${ask?.source ?? '(none)'}` });
      return;
    }
    const rules = ask?.rules && typeof ask.rules === 'object' ? ask.rules : {};
    const sets = Object.entries(rules).flatMap(([name, value]) => (/^[A-Za-z][A-Za-z0-9]*$/.test(name)
      ? ['--set', `${name}=${typeof value === 'boolean' ? (value ? 1 : 0) : value}`] : []));
    const out = join(here, '..', 'output', `bench-${stampNow()}`);
    // The node editor's zone graph, when the page sent an edited one. Written into the run's own folder
    // (so the run carries what it was asked to do) and handed over as a file; the engine validates it.
    const graphArgs = [];
    if (ask?.zoneGraph && typeof ask.zoneGraph === 'object') {
      mkdirSync(out, { recursive: true });
      const file = join(out, 'zone-graph.json');
      writeFileSync(file, JSON.stringify(ask.zoneGraph, null, 2));
      graphArgs.push('--zone-graph', file);
    }
    // The Orient canvas's graph (U6), the same way: only an EDITED Step 1 is sent; absent, the default runs.
    if (ask?.orientGraph && typeof ask.orientGraph === 'object') {
      mkdirSync(out, { recursive: true });
      const file = join(out, 'orient-graph.json');
      writeFileSync(file, JSON.stringify(ask.orientGraph, null, 2));
      graphArgs.push('--orient-graph', file);
    }
    // The type this run is (Orient's print-angle edits + a name): benchwork makes a draft from the
    // built-in and the batch writes what ran to type.json, which Save type copies (TYPE-PIPELINE R1).
    const typeArgs = [];
    const typeId = typeof ask?.typeId === 'string' && /^[a-z0-9][a-z0-9.-]*$/.test(ask.typeId) ? ask.typeId : null;
    if (ask?.typeId !== undefined && !typeId) { send(400, { error: 'a type name is lower-case letters, digits, dots and dashes' }); return; }
    if (typeId) {
      typeArgs.push('--type-id', typeId);
      // The badge is checked by the type file reader the draft goes through (1-5 characters, no spaces).
      if (typeof ask?.badge === 'string' && ask.badge.trim() !== '') typeArgs.push('--type-badge', ask.badge.trim());
      // The full name is checked where the draft is made (typeInForce.ts typeNameOf: one line, at most 60 characters).
      if (typeof ask?.name === 'string' && ask.name.trim() !== '') typeArgs.push('--type-name', ask.name.trim());
      const pose = ask?.pose && typeof ask.pose === 'object' ? Object.fromEntries(Object.entries(ask.pose).filter(([k, v]) => /^tilt[A-Za-z]+Deg$/.test(k) && Number.isFinite(v))) : {};
      if (Object.keys(pose).length > 0) {
        mkdirSync(out, { recursive: true });
        const file = join(out, 'pose.json');
        writeFileSync(file, JSON.stringify(pose));
        typeArgs.push('--pose', file);
      }
    }
    const child = spawn(process.execPath, [join(here, '..', '..', 'benchwork', 'cli.mjs'), '--kind', kind, '--out', out, ...sets, ...graphArgs, ...typeArgs, source],
      { cwd: join(here, '..', '..'), stdio: ['ignore', 'pipe', 'pipe'] });
    let log = '';
    child.stdout.on('data', (chunk) => { log += chunk; process.stdout.write(chunk); });
    child.stderr.on('data', (chunk) => { log += chunk; process.stderr.write(chunk); });
    // ONE answer: the exit, a spawn error, or the 15-minute limit, whichever comes first (cia F3; the
    // rule and its tests are rerunReport.mjs).
    guardRun(child, 15 * 60 * 1000, {
      timeout: () => send(500, { error: 'the re-run took over 15 minutes and was stopped', log: log.slice(-4000) }),
      error: (error) => send(500, { error: `the re-run could not start: ${error.message}`, log: log.slice(-4000) }),
      exit: (code) => {
        if (code !== 0 || !existsSync(join(out, 'summary.json'))) { send(500, { error: `benchwork exited ${code}`, log: log.slice(-4000) }); return; }
        // shortcut: one /out/ for the whole server, so two tabs re-running at once see whichever finished
        // last (cia F6). One operator, one tab today; return `out` and fetch from it if that changes.
        roots['/out/'] = out;
        send(200, { ok: true, out, log: log.slice(-4000) });
      },
    });
  });
}

const server = createServer((request, response) => {
  const path = decodeURIComponent(new URL(request.url ?? '/', 'http://localhost').pathname);
  if (request.method === 'POST' && path === '/rerun') { rerun(request, response); return; }
  if (request.method === 'POST' && path === '/save-type') { saveType(response, new URL(request.url ?? '/', 'http://localhost').searchParams.get('replace') === '1'); return; }
  const [prefix, root] = Object.entries(roots).find(([prefix, root]) => root !== undefined && path.startsWith(prefix));
  const file = normalize(join(root, path === '/' ? 'viewer.html' : path.slice(prefix.length)));
  if (!file.startsWith(normalize(root + sep)) || !existsSync(file) || !statSync(file).isFile()) {
    response.writeHead(404).end('Not found');
    return;
  }
  response.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream', 'cache-control': 'no-store' });
  createReadStream(file).pipe(response);
});

server.listen(0, lan ? '0.0.0.0' : '127.0.0.1', () => {
  const url = `http://127.0.0.1:${server.address().port}/`;
  console.log(`Review viewer: ${url}  (keep this window open while you look; Ctrl+C to stop)`);
  const open = process.platform === 'win32' ? `start "" "${url}"` : process.platform === 'darwin' ? `open "${url}"` : `xdg-open "${url}"`;
  if (!process.argv.includes('--no-open')) exec(open);
});
