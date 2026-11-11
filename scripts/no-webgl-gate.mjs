/*
 * THE NO-WebGL GATE: a browser without WebGL2 must be TOLD, never shown a blank page.
 *
 *   npm run gate:nogl
 *
 * This is the audit probe `artefacts/2026-11-11-screen/probe-nogl.mjs` turned from a question into a
 * guard. That probe asked what a person sees when `getContext('webgl*')` returns null and found the
 * answer: `#root` with 0 children, 0 canvases and no text at all - a blank white screen, with two
 * uncaught "Error creating WebGL context." in a console no operator opens (MIXO-04). The probe
 * stays where it is as the evidence for that finding; this file is what stops it coming back.
 *
 * TWO PASSES, AND THE CONTROL IS NOT OPTIONAL. Without a pass where WebGL works, a blank page proves
 * the gate broke rather than the app. So the control pass must reach a real workspace with a real
 * canvas, and this gate FAILS when it does not - a green line from a probe that never loaded the app
 * is the exact shape of lie the audit was looking for everywhere else.
 *
 * It needs a dev server and a real browser, so it is not part of `npm test` (vitest, node
 * environment). It belongs beside `npm run walk` in a release run, and folding it in as a walk
 * section is written up in the handoff as the next step - `scripts/walk.mjs` is 4448 lines and the
 * release gate itself, and its own comments ask that nothing be restructured there in passing.
 */
import { spawn, execFileSync } from 'node:child_process';
import { createServer } from 'node:net';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** A two-triangle-per-face cube as ASCII STL, the shape the walk builds for its own fixtures. */
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
    try { if ((await fetch(url)).ok) return; } catch { /* not up yet */ }
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
  const pageErrors = [];
  page.on('pageerror', (e) => pageErrors.push(String(e.message).slice(0, 200)));
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForTimeout(2000);

  const read = async () => ({
    rootChildren: await page.evaluate(() => document.getElementById('root')?.childElementCount ?? -1),
    canvases: await page.evaluate(() => document.querySelectorAll('canvas').length),
    text: (await page.evaluate(() => document.body.innerText.replace(/\s+/g, ' ').trim())).slice(0, 300),
    stoppedReason: await page.evaluate(() => document.querySelector('[data-ui="stopped-screen"]')?.getAttribute('data-reason') ?? null),
    stoppedTitle: await page.evaluate(() => document.querySelector('[data-ui="stopped-title"]')?.textContent?.trim() ?? ''),
    stoppedSentence: await page.evaluate(() => document.querySelector('[data-ui="stopped-sentence"]')?.textContent?.trim() ?? ''),
  });

  const atLoad = await read();
  // With WebGL working, walk on to the workspace: that is where the only <Canvas> mounts.
  const any = page.locator('[data-ui="start-any-model"]');
  if (await any.count() > 0) {
    await any.click();
    await page.waitForTimeout(500);
    const input = page.locator('input[type="file"]').first();
    if (await input.count() > 0) await input.setInputFiles(file);
    await page.waitForTimeout(6000);
  }
  const atWorkspace = await read();
  await context.close();
  return { nogl, atLoad, atWorkspace, pageErrors };
}

const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok });
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ` | ${detail}` : ''}`);
};

const port = await freePort(5290);
const vite = startVite(port);
const url = `http://127.0.0.1:${port}/mixodental/`;
const file = path.join(mkdtempSync(path.join(tmpdir(), 'nogl-gate-')), 'cube.stl');
writeFileSync(file, cubeStl());
let browser;
try {
  await waitFor(url);
  browser = await chromium.launch({ headless: true, args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });

  // THE CONTROL FIRST. If this fails, nothing below means anything.
  const control = await pass(browser, url, file, { nogl: false });
  check('control: WebGL works, so the workspace mounts a canvas', control.atWorkspace.canvases > 0, `canvases ${control.atWorkspace.canvases}`);
  check('control: the app renders and never shows the stopped screen', control.atWorkspace.rootChildren > 0 && control.atWorkspace.stoppedReason === null,
    `rootChildren ${control.atWorkspace.rootChildren}, stopped ${control.atWorkspace.stoppedReason ?? 'none'}`);
  check('control: no uncaught page error', control.pageErrors.length === 0, control.pageErrors.join(' / '));

  const blocked = await pass(browser, url, file, { nogl: true });
  // THE FINDING, INVERTED INTO A GUARD: this is the exact measurement that read 0 / 0 / "" before.
  check('no WebGL2: the page is NOT empty', blocked.atLoad.rootChildren > 0, `rootChildren ${blocked.atLoad.rootChildren}`);
  check('no WebGL2: there are words on it', blocked.atLoad.text.length > 20, `${blocked.atLoad.text.length} chars`);
  check('no WebGL2: it says WHY, before anything is clicked', blocked.atLoad.stoppedReason === 'no-webgl2', `reason ${blocked.atLoad.stoppedReason ?? 'none'}`);
  check('no WebGL2: a heading', blocked.atLoad.stoppedTitle.length > 0, blocked.atLoad.stoppedTitle);
  // A sentence, not a word: this is the line that has to explain the situation to an operator.
  check('no WebGL2: a sentence that explains it', blocked.atLoad.stoppedSentence.split(/\s+/).length > 4, blocked.atLoad.stoppedSentence);
  check('no WebGL2: it never silently tries to draw', blocked.atLoad.canvases === 0, `canvases ${blocked.atLoad.canvases}`);

  const failed = results.filter((r) => !r.ok);
  console.log(`\nno-webgl gate: ${results.length - failed.length}/${results.length} PASS at ${execFileSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: ROOT, encoding: 'utf8' }).trim()}`);
  if (failed.length) {
    console.error(`FAILED: ${failed.map((r) => r.name).join('; ')}`);
    process.exitCode = 1;
  }
} finally {
  await browser?.close();
  if (vite.exitCode === null) {
    if (process.platform === 'win32') { try { execFileSync('taskkill', ['/PID', String(vite.pid), '/T', '/F'], { stdio: 'ignore' }); } catch { /* gone */ } }
    else vite.kill('SIGKILL');
  }
}
