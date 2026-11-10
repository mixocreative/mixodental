/*
 * cia audit probe, 2026-11-11: WHAT DOES A PERSON SEE WHEN THE BROWSER HAS NO WebGL?
 *
 * The README promises the app "runs in the browser on Windows, macOS, Linux, ChromeOS, tablets and
 * phones. Open the link and start." A tablet or an old phone with no WebGL2, a blocked context, or
 * a GPU the browser has blacklisted is the ordinary way that promise fails, and `src/` holds no
 * capability check, no error boundary and no `window.onerror` — so this probe asks the only
 * question that settles it: load the app with `getContext('webgl*')` returning null, walk to the
 * workspace, and read what is on screen.
 *
 * TWO PASSES ON PURPOSE. The control pass runs the same steps with WebGL intact; without it, a
 * blank page proves the probe broke rather than the app. Every number below is reported per pass.
 *
 * Usage: node artefacts/2026-11-11-screen/probe-nogl.mjs
 */
import { spawn, execFileSync } from 'node:child_process';
import { createServer } from 'node:net';
import { existsSync, mkdtempSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const OUT = path.dirname(fileURLToPath(import.meta.url));

/** A two-triangle-per-face cube as ASCII STL, the same shape the walk builds for its own fixtures. */
function cubeStl(scale = 10) {
  const p = [-1, -1, -1, 1, -1, -1, 1, 1, -1, -1, 1, -1, -1, -1, 1, 1, -1, 1, 1, 1, 1, -1, 1, 1].map((v) => v * scale);
  const i = [0, 2, 1, 0, 3, 2, 4, 5, 6, 4, 6, 7, 0, 1, 5, 0, 5, 4, 1, 2, 6, 1, 6, 5, 2, 3, 7, 2, 7, 6, 3, 0, 4, 3, 4, 7];
  const at = (n) => [p[n * 3], p[n * 3 + 1], p[n * 3 + 2]];
  let text = 'solid cube\n';
  for (let t = 0; t < i.length; t += 3) {
    text += '  facet normal 0 0 0\n    outer loop\n';
    for (const n of [i[t], i[t + 1], i[t + 2]]) text += `      vertex ${at(n).join(' ')}\n`;
    text += '    endloop\n  endfacet\n';
  }
  return `${text}endsolid cube\n`;
}

async function freePort(from) {
  for (let port = from; port < from + 40; port += 1) {
    const free = await new Promise((resolve) => {
      const server = createServer().once('error', () => resolve(false)).once('listening', () => server.close(() => resolve(true)));
      server.listen(port, '127.0.0.1');
    });
    if (free) return port;
  }
  throw new Error('no free port');
}

const startVite = (port) => spawn(process.execPath, [path.join(ROOT, 'node_modules', 'vite', 'bin', 'vite.js'), '--port', String(port), '--strictPort', '--host', '127.0.0.1'], { cwd: ROOT, stdio: 'ignore' });

async function waitFor(url) {
  for (let i = 0; i < 120; i += 1) {
    try { if ((await fetch(url)).ok) return; } catch { /* not up */ }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error('vite did not serve');
}

/** Runs before any app code: every WebGL context request answers null, as a device without it does. */
const blockWebGL = () => {
  const real = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (kind, ...rest) {
    if (/webgl/i.test(String(kind))) return null;
    return real.call(this, kind, ...rest);
  };
  delete window.WebGL2RenderingContext;
  delete window.WebGLRenderingContext;
};

async function pass(browser, url, file, { nogl }) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  await context.addInitScript(() => { try { localStorage.setItem('mixodental.lang', 'en'); } catch { /* storage off */ } });
  if (nogl) await context.addInitScript(blockWebGL);
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 300)); });
  page.on('pageerror', (e) => pageErrors.push(String(e.message).slice(0, 300)));
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForTimeout(1500);

  const read = async (where) => ({
    where,
    rootChildren: await page.evaluate(() => document.getElementById('root')?.childElementCount ?? -1),
    canvases: await page.evaluate(() => document.querySelectorAll('canvas').length),
    text: (await page.evaluate(() => document.body.innerText.replace(/\s+/g, ' ').trim())).slice(0, 400),
  });

  const atStart = await read('start screen');
  // The workspace, and the only <Canvas>, mount once a purpose is chosen and a model lands.
  let clicked = false;
  const any = page.locator('[data-ui="start-any-model"]');
  if (await any.count() > 0) { await any.click(); clicked = true; await page.waitForTimeout(500); }
  const input = page.locator('input[type="file"]').first();
  let dropped = false;
  if (await input.count() > 0) { await input.setInputFiles(file); dropped = true; }
  await page.waitForTimeout(6000);
  const atWorkspace = await read('after a model is dropped');
  await page.screenshot({ path: path.join(OUT, `nogl-${nogl ? 'blocked' : 'control'}.png`) });
  await context.close();
  return { nogl, clicked, dropped, atStart, atWorkspace, consoleErrors, pageErrors };
}

const port = await freePort(5290);
const vite = startVite(port);
const url = `http://127.0.0.1:${port}/mixodental/`;
const scratch = mkdtempSync(path.join(tmpdir(), 'cia-probe-'));
const file = path.join(scratch, 'cube.stl');
writeFileSync(file, cubeStl());
mkdirSync(OUT, { recursive: true });
let browser;
try {
  await waitFor(url);
  browser = await chromium.launch({ headless: true, args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
  const control = await pass(browser, url, file, { nogl: false });
  const blocked = await pass(browser, url, file, { nogl: true });
  const report = { head: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: ROOT, encoding: 'utf8' }).trim(), url, control, blocked };
  writeFileSync(path.join(OUT, 'probe-nogl.json'), `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser?.close();
  if (vite.exitCode === null) {
    if (process.platform === 'win32') { try { execFileSync('taskkill', ['/PID', String(vite.pid), '/T', '/F'], { stdio: 'ignore' }); } catch { /* gone */ } }
    else vite.kill('SIGKILL');
  }
  if (existsSync(scratch)) { /* left for inspection */ }
}
