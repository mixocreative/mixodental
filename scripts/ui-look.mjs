// Makes the pictures the human-test list asks a person to look at: `npm run look`.
//
// THREE OF THE FOUR THINGS ON THAT LIST ARE LOOKING, NOT JUDGING, and a thing nobody can see is a
// thing nobody checks. The icon test is "cover the words and name each" - so this covers them. The
// rim cursor had never been seen over a model by anyone, because a CSS cursor NEVER appears in a
// screenshot: this composites it from the same SVG file the app loads, at the same 24 px, with its
// hot spot where it claims to be. The item drawings are asked to be judged "as a set", so they are
// laid out as one.
//
// It does not judge anything. It puts the three questions in front of eyes, and the eyes may be
// anyone's - which is the point of the style book too.
//
// Output: `.stitch/look/` (ignored by git, as `.stitch/` is). Re-run it; never edit what it writes.
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import { cubeStl } from './walk/fixtures.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, '.stitch', 'look');
const ART = path.join(ROOT, 'src', 'ui', 'assets', 'art');
const CURSOR = path.join(ROOT, 'src', 'ui', 'assets', 'icons', 'cursor-rim.svg');

/** A port nothing else is on, so a walk running beside this does not lose its server. */
async function freePort(from) {
  for (let port = from; port < from + 40; port += 1) {
    const free = await new Promise((resolve) => {
      const probe = createServer().once('error', () => resolve(false)).once('listening', () => probe.close(() => resolve(true))).listen(port, '127.0.0.1');
    });
    if (free) return port;
  }
  throw new Error('no free port');
}

const port = await freePort(5380);
const vite = spawn(process.execPath, [path.join(ROOT, 'node_modules', 'vite', 'bin', 'vite.js'), '--port', String(port), '--strictPort', '--host', '127.0.0.1'], { cwd: ROOT, stdio: 'ignore' });
const base = `http://127.0.0.1:${port}/mixodental/`;
const stop = () => { try { process.kill(vite.pid); } catch { /* already gone */ } };

try {
  for (let tries = 0; tries < 120; tries += 1) {
    try { if ((await fetch(base)).ok) break; } catch { /* not up yet */ }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });

  /*
   * 1. THE KEYS WITH THEIR WORDS COVERED. `visibility: hidden` rather than `display: none`, so the
   * key keeps the size and the spacing it really has - a picture judged in a box of the wrong shape
   * is a different picture.
   */
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
    await page.goto(base);
    await page.waitForSelector('.choice-key');
    await page.addStyleTag({ content: '.choice-key-words { visibility: hidden !important; }' });
    await page.waitForTimeout(500);
    const keys = page.locator('.choice-key');
    const boxes = [];
    for (let k = 0; k < await keys.count(); k += 1) boxes.push(await keys.nth(k).boundingBox());
    const clip = {
      x: Math.min(...boxes.map((b) => b.x)) - 8,
      y: Math.min(...boxes.map((b) => b.y)) - 8,
      width: Math.max(...boxes.map((b) => b.x + b.width)) - Math.min(...boxes.map((b) => b.x)) + 16,
      height: Math.max(...boxes.map((b) => b.y + b.height)) - Math.min(...boxes.map((b) => b.y)) + 16,
    };
    await page.screenshot({ path: path.join(OUT, 'keys-unlabelled.png'), clip });
    console.log(`keys-unlabelled.png  ${boxes.length} keys, in the order the screen shows them - name each`);
    await page.close();
  }

  // 2. THE ITEM DRAWINGS AS A SET, at the size a key draws them.
  {
    const files = readdirSync(ART).filter((name) => name.endsWith('.svg')).sort();
    const page = await browser.newPage({ viewport: { width: 200 + files.length * 162, height: 260 }, deviceScaleFactor: 2 });
    await page.setContent(`<!doctype html><meta charset="utf-8"><style>
      body { margin: 0; background: #fff; font: 13px system-ui, sans-serif; color: #1d2b2b; }
      .row { display: flex; gap: 18px; padding: 24px; align-items: flex-end; }
      figure { margin: 0; text-align: center; }
      .art { width: 144px; height: 144px; display: grid; place-items: center; border: 1px solid #dfe8e8; border-radius: 10px; }
      .art svg { width: 120px; height: 120px; }
      figcaption { margin-top: 8px; color: #5a6e6e; }
    </style><div class="row">${files.map((name) => `<figure><div class="art">${readFileSync(path.join(ART, name), 'utf8')}</div><figcaption>${name.replace('.svg', '')}</figcaption></figure>`).join('')}</div>`);
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(OUT, 'art-set.png'), fullPage: true });
    console.log(`art-set.png          ${files.length} drawings - one style, or ${files.length}?`);
    await page.close();
  }

  /*
   * 3. THE RIM CURSOR OVER A MODEL. Three anchors go down first, so it can be seen over bare model
   * AND over the line it is about to be used on - which is the moment it has to stay legible.
   */
  {
    const fixture = path.join(OUT, 'roomy-cube.stl');
    writeFileSync(fixture, cubeStl(6));
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(base);
    await page.getByRole('button', { name: 'Any model', exact: true }).click();
    await page.waitForSelector('.workspace');
    await page.getByRole('button', { name: 'Aligner Support Production', exact: true }).click();
    await page.waitForFunction(() => /Step 1 . Aligner/i.test(document.querySelector('.edit-badge')?.textContent ?? ''), null, { timeout: 30000 });
    await page.setInputFiles('input[aria-label="Choose aligner file"]', fixture);
    await page.waitForFunction(() => /Define the rim/.test(document.querySelector('.edit-badge')?.innerText ?? ''), null, { timeout: 90000 });
    await page.waitForTimeout(2500);
    const box = await page.locator('canvas').first().boundingBox();
    for (const [fx, fy] of [[0.46, 0.44], [0.54, 0.44], [0.50, 0.54]]) {
      await page.mouse.move(box.x + box.width * fx, box.y + box.height * fy);
      await page.mouse.down();
      await page.mouse.up();
      await page.waitForTimeout(400);
    }
    await page.waitForTimeout(800);
    const shot = (await page.locator('canvas').first().screenshot()).toString('base64');
    const outline = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--cursor-outline').trim());
    await page.close();

    // The same file the app loads, with the same substitution and the same size (`viewport/style.ts`).
    const svg = readFileSync(CURSOR, 'utf8').replace(/<\?xml[^>]*\?>/, '')
      .replace(/currentColor/g, outline).replace('<svg ', '<svg width="24" height="24" ').trim();
    const spots = [[0.42, 0.38], [0.50, 0.49], [0.58, 0.62]];
    const show = await browser.newPage({ viewport: { width: 1200, height: 780 }, deviceScaleFactor: 2 });
    await show.setContent(`<!doctype html><meta charset="utf-8"><style>
      body { margin: 0; font: 13px/1.4 system-ui, sans-serif; background: #fff; color: #1d2b2b; }
      h2 { font-size: 13px; font-weight: 600; margin: 14px 16px 6px; }
      .stage { position: relative; width: 1160px; margin: 0 16px; }
      .stage img { width: 1160px; display: block; }
      .cur { position: absolute; width: 24px; height: 24px; margin: -12px 0 0 -12px; }
      .zooms { display: flex; gap: 28px; margin: 10px 16px 18px; }
      .zoom { position: relative; width: 192px; height: 192px; overflow: hidden; outline: 1px solid #c8d4d4; }
      .zoom img { position: absolute; width: ${1160 * 6}px; image-rendering: pixelated; }
      .zoom .cur { width: 144px; height: 144px; margin: -72px 0 0 -72px; left: 96px; top: 96px; }
      small { color: #5a6e6e; margin-left: 16px; }
    </style>
    <h2>The rim cursor over the model, at the size it is drawn (24 px; the hot spot is the middle of the square)</h2>
    <div class="stage"><img src="data:image/png;base64,${shot}">
      ${spots.map(([x, y]) => `<div class="cur" style="left:${x * 100}%; top:${y * 100}%">${svg}</div>`).join('')}</div>
    <h2>The same three, six times bigger — is it too heavy over the operator's own work?</h2>
    <div class="zooms">${spots.map(([x, y]) => `<div class="zoom"><img src="data:image/png;base64,${shot}" style="left:${-(x * 1160 * 6 - 96)}px; top:${-(y * 844 * (1160 / 1440) * 6 - 96)}px"><div class="cur">${svg}</div></div>`).join('')}</div>
    <small>Composited from ${path.relative(ROOT, CURSOR).replace(/\\/g, '/')} with --cursor-outline = ${outline}; a CSS cursor never appears in a screenshot.</small>`);
    await show.waitForTimeout(400);
    await show.screenshot({ path: path.join(OUT, 'rim-cursor.png'), fullPage: true });
    console.log('rim-cursor.png       over bare model, over the drawn line, and off the model');
    await show.close();
  }

  await browser.close();
  console.log(`\nin ${path.relative(ROOT, OUT).replace(/\\/g, '/')}  (re-run with \`npm run look\`; never edit what it writes)`);
} finally {
  stop();
}
if (!existsSync(path.join(OUT, 'rim-cursor.png'))) process.exit(1);
process.exit(0);
