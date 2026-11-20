// Local viewer for one folder-review output: serves the viewer page, three.js from node_modules
// and the review files on 127.0.0.1 only, then opens the browser. Ctrl+C (or closing the window)
// stops it. Without a folder the viewer opens empty and takes a run dropped onto the page.
// Usage: node dentalwork/batch-review/serve.mjs [output folder] [--no-open] [--lan]
// --lan also listens on the local network (e.g. to look from a phone); review files hold patient scans,
// so use it only on a trusted home/office network.
import { createServer } from 'node:http';
import { createReadStream, existsSync, mkdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { exec, spawn } from 'node:child_process';
import { stampNow } from '../../benchwork/rules.mjs';

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
    const child = spawn(process.execPath, [join(here, '..', '..', 'benchwork', 'cli.mjs'), '--kind', kind, '--out', out, ...sets, ...graphArgs, source],
      { cwd: join(here, '..', '..'), stdio: ['ignore', 'pipe', 'pipe'] });
    let log = '';
    // ONE answer per request, whichever comes first: the exit, a spawn error, or the time limit. Without
    // the last two a run that never started or never ended left the page on "Running..." with Apply
    // disabled, and a spawn error would have crashed this server (cia F3).
    let answered = false;
    const answer = (code, body) => { if (answered) return; answered = true; clearTimeout(limit); send(code, body); };
    const limit = setTimeout(() => { child.kill(); answer(500, { error: 'the re-run took over 15 minutes and was stopped', log: log.slice(-4000) }); }, 15 * 60 * 1000);
    child.on('error', (error) => answer(500, { error: `the re-run could not start: ${error.message}`, log: log.slice(-4000) }));
    child.stdout.on('data', (chunk) => { log += chunk; process.stdout.write(chunk); });
    child.stderr.on('data', (chunk) => { log += chunk; process.stderr.write(chunk); });
    child.on('exit', (code) => {
      if (code !== 0 || !existsSync(join(out, 'summary.json'))) { answer(500, { error: `benchwork exited ${code}`, log: log.slice(-4000) }); return; }
      // shortcut: one /out/ for the whole server, so two tabs re-running at once see whichever finished
      // last (cia F6). One operator, one tab today; return `out` and fetch from it if that changes.
      roots['/out/'] = out;
      answer(200, { ok: true, out, log: log.slice(-4000) });
    });
  });
}

const server = createServer((request, response) => {
  const path = decodeURIComponent(new URL(request.url ?? '/', 'http://localhost').pathname);
  if (request.method === 'POST' && path === '/rerun') { rerun(request, response); return; }
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
