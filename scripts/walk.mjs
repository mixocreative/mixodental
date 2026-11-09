// Browser walk: `npm run walk`. Starts Vite, drives headless Chromium through the editor on a fixture
// model, prints PASS/FAIL lines with numbers, exits 1 on any FAIL, and always stops Vite.
import { spawn, execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { createServer } from 'node:net';
import { homedir, tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FIXTURE = path.join(ROOT, 'scripts', 'fixtures', 'knot.stl');
/**
 * The aligner the dental sections walk, in order of preference:
 *   1. DENTAL_WALK_FIXTURE, when the caller names one;
 *   2. case 01 of dentalwork/fixtures, when it is on this machine - the owner's local comparison case. The
 *      case directories are git-ignored and READ IN PLACE: no scan is ever copied into this repository;
 *   3. the already-approved public reference that ships with the repo, so a fresh clone still walks.
 */
const PUBLIC_ALIGNER = path.join(ROOT, 'docs', 'dental-reference', 'reference-aligner.stl');
const CASE_01_ALIGNER = path.join(ROOT, 'dentalwork', 'fixtures', 'case-001', 'aligner.stl');
const VIEWPORT = { width: 1440, height: 900 };

/**
 * Page script: the levers on what a worker's replies do, and on what the browser accepts. All off by
 * default. They are the condition of §6 of the wiring review: a fault class with no lever is reported
 * `UNPROVEN`, never "skipped", so each lever here exists to retire one of those rows.
 *
 * `window.__meshDelay` holds the MESH worker's replies back that many ms, so the first build can be
 * pressed on while it runs. The reply is swallowed and re-dispatched later: it arrives LATE, once.
 *
 * `window.__replayWorker` is the G2 lever (section `q`): every reply from the worker whose URL
 * contains that substring is dispatched a SECOND time, without the first being swallowed. So the job
 * settles and is then told again that it has settled, which is what a duplicate message from a
 * channel actually looks like. `window.__replayed` counts them.
 *
 * `window.__faultHold` is the other half of a channel's vocabulary, and section `r`'s whole lever:
 * every SETTLING reply (`done`, `error`) from the named worker is swallowed and KEPT, and the walk
 * decides when - and in what order - each one is delivered. Progress replies still arrive, so the
 * fault is "the work finished and this side was never told", not "the worker went quiet".
 *
 *   window.__faultHold = 'analysisWorker'   nothing settles from that worker until released
 *   window.__faultRelease('lifo')           the NEWEST held reply first  -> G3, a reply before its predecessor
 *   window.__faultCrash()                   the worker fails on this side -> G5, far side's answer still held
 *   (never releasing)                       the detector has stopped      -> G7
 *
 * One hold-and-release pair covers three fault classes because all three ask the same question of a
 * channel - of order, of disagreement, of silence. There is deliberately no `fail` or `reorder` mode:
 * holding expresses both, and a lever no probe uses is a dead control wearing safety's clothes.
 *
 * `window.__faultDownload = n` is the G1 lever, and it is not a worker fault at all. The export hands
 * each finished file to the browser in a LOOP of `<a download>.click()` (`useExport.ts`), so the
 * reply has long settled by the time the first file commits; no worker lever can reach the write
 * that follows it. Refusing the n-th download is also not contrived - Chrome blocks multiple
 * automatic downloads from one gesture on its own, which is this fault arriving unbidden.
 *
 * Every lever counts what it did (`__replayed`, `__faultSeen`, `__downloads`), so a probe can prove
 * the fault ARRIVED rather than assume it. An injection test that never injected is the vacuous pass
 * this section exists to avoid.
 */
function faultLevers() {
  const Real = window.Worker;
  window.__meshDelay = 0;
  window.__replayWorker = '';
  window.__replayed = 0;
  window.__faultHold = '';
  window.__faultSeen = 0;
  window.__faultDownload = 0;
  window.__downloads = 0;
  /** Settling replies the hold is keeping, oldest first, each with the worker it has to go back to. */
  const held = [];
  /** Every worker made since load, so `__faultCrash` can reach the ones under test. */
  const live = [];
  const deliver = (entry) => {
    const again = new MessageEvent('message', { data: entry.data });
    again.redelivered = true;
    entry.target.dispatchEvent(again);
  };
  /**
   * Deliver held replies and say how many went: 'lifo' newest first (which is a reply arriving
   * before the one it was supposed to follow), 'fifo' in the order they were produced.
   */
  window.__faultRelease = (order = 'fifo', count = held.length) => {
    const batch = [];
    for (let at = 0; at < count && held.length > 0; at += 1) batch.push(order === 'lifo' ? held.pop() : held.shift());
    for (const entry of batch) deliver(entry);
    return batch.length;
  };
  /** How many settled replies this side has not been told about. */
  window.__faultHeld = () => held.length;
  /** The worker fails on THIS side while its answer is still held: the local half of G5. */
  window.__faultCrash = (which = window.__faultHold) => {
    const targets = live.filter((entry) => which && entry.name.includes(which));
    for (const entry of targets) entry.target.dispatchEvent(new ErrorEvent('error', { message: 'worker crashed (injected)' }));
    return targets.length;
  };
  window.Worker = class extends Real {
    constructor(url, options) {
      super(url, options);
      const name = String(url);
      live.push({ name, target: this });
      this.addEventListener('message', (event) => {
        if (event.redelivered) return;
        const reply = event.data;
        const type = reply && typeof reply === 'object' ? reply.type : undefined;
        if (window.__faultHold && name.includes(window.__faultHold) && (type === 'done' || type === 'error')) {
          event.stopImmediatePropagation();
          window.__faultSeen += 1;
          held.push({ target: this, data: reply });
          return;
        }
        if (window.__replayWorker && name.includes(window.__replayWorker)) {
          window.__replayed += 1;
          setTimeout(() => { const again = new MessageEvent('message', { data: reply }); again.redelivered = true; this.dispatchEvent(again); }, 0);
          return;
        }
        if (!name.includes('meshWorker') || !window.__meshDelay) return;
        event.stopImmediatePropagation();
        setTimeout(() => { const again = new MessageEvent('message', { data: reply }); again.redelivered = true; this.dispatchEvent(again); }, window.__meshDelay);
      });
    }
  };
  /*
   * The write boundary. Only anchors carrying a `download` are touched, so an ordinary link click is
   * never affected - the lever has to be aimed at the export's write loop and nothing else.
   */
  const click = HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click = function patchedClick() {
    if (!this.download) return click.call(this);
    window.__downloads += 1;
    if (window.__faultDownload && window.__downloads >= window.__faultDownload) throw new Error(`download of ${this.download} refused (injected)`);
    return click.call(this);
  };
}

/**
 * The plate-quota fixture for section `q`: one binary STL of about 3.19M triangles, so two of them
 * cross the 6M plate refusal limit while either alone fits. Git-ignored and about 152 MiB, so it is
 * made on demand rather than committed; the generator streams it, which is why a 6M-triangle fault
 * injection costs twenty seconds and not a gigabyte of memory.
 */
const HEAVY_PLATE_STL = path.join(ROOT, '.playwright-mcp', 'heavy', 'heavy-3_2m.stl');
function heavyPlateFixture() {
  if (existsSync(HEAVY_PLATE_STL)) return HEAVY_PLATE_STL;
  note('making the plate-quota fixture (3.2M triangles, ~152 MiB, git-ignored) - this happens once per clone');
  execFileSync('npx', ['vite-node', 'scripts/make-heavy-meshes.ts', '3200000'], { cwd: ROOT, stdio: 'inherit', shell: true });
  if (!existsSync(HEAVY_PLATE_STL)) throw new Error(`the plate-quota fixture was not made at ${HEAVY_PLATE_STL}`);
  return HEAVY_PLATE_STL;
}
const FIRST_PORT = 5260;

/** ASCII STL text of an indexed mesh (the walk's synthetic aligner stand-ins). */
function asciiStl(name, positions, indices) {
  const lines = [`solid ${name}`];
  for (let at = 0; at < indices.length; at += 3) {
    lines.push('facet normal 0 0 0', 'outer loop');
    for (let k = 0; k < 3; k += 1) lines.push(`vertex ${[0, 1, 2].map((axis) => positions[indices[at + k] * 3 + axis]).join(' ')}`);
    lines.push('endloop', 'endfacet');
  }
  lines.push(`endsolid ${name}`);
  return lines.join('\n');
}
/** A closed unit cube: no cavity, so orientation fails. */
const CUBE_POSITIONS = [-1, -1, -1, 1, -1, -1, 1, 1, -1, -1, 1, -1, -1, -1, 1, 1, -1, 1, 1, 1, 1, -1, 1, 1];
const CUBE_INDICES = [0, 2, 1, 0, 3, 2, 4, 5, 6, 4, 6, 7, 0, 1, 5, 0, 5, 4, 1, 2, 6, 1, 6, 5, 2, 3, 7, 2, 7, 6, 3, 0, 4, 3, 4, 7];
function cubeStl() {
  return asciiStl('cube', CUBE_POSITIONS, CUBE_INDICES);
}
/**
 * The same cube with its last face left off: ten triangles instead of twelve, so the solid is OPEN.
 *
 * It exists for section `r`'s G3 probe, which needs two models whose detection answers DIFFER - a
 * reply crossed with another is invisible if both say the same thing. A closed cube comes back "No
 * rim found. Draw one to continue."; an open one fails the dental mesh check, so `detectStateOf`
 * calls it unusable and the row reads "Could not check the orientation." Two answers, two screens.
 */
function openCubeStl() {
  return asciiStl('open-cube', CUBE_POSITIONS, CUBE_INDICES.slice(0, 30));
}
/** A closed, manifold thick cup: it has a cavity opening but no central opening, so a type that insists on one is offered a switch. */
function cupStl() {
  const segments = 16;
  const positions = [0, -2, 0, 0, -4, 0];
  // Rings: outer bottom, outer top, inner top, inner bottom.
  for (const [radius, y] of [[10, -4], [10, 4], [8, 4], [8, -2]]) {
    for (let segment = 0; segment < segments; segment += 1) {
      const angle = segment * Math.PI * 2 / segments;
      positions.push(radius * Math.cos(angle), y, radius * Math.sin(angle));
    }
  }
  const at = (ring, segment) => 2 + ring * segments + ((segment + segments) % segments);
  const indices = [];
  const quad = (a, b, c, e) => indices.push(a, b, c, a, c, e);
  for (let segment = 0; segment < segments; segment += 1) {
    const next = segment + 1;
    quad(at(0, segment), at(0, next), at(1, next), at(1, segment));
    quad(at(1, segment), at(1, next), at(2, next), at(2, segment));
    quad(at(2, segment), at(2, next), at(3, next), at(3, segment));
    indices.push(0, at(3, segment), at(3, next));
    indices.push(1, at(0, next), at(0, segment));
  }
  return asciiStl('cup', positions, indices);
}


/**
 * Numbers measured on `scripts/fixtures/knot.stl` at 1440x900 with the software GL below. They move
 * only when the support generator or the brush rules change on purpose; update them then.
 */
// Engine 10 (P5.14): 1167 -> 1200 automatic contacts (corner samples kept, geodesic insets, 1 um
// quantising), so the drag, bottom-view and occlusion counts move with them.
// Engine 12 (proximity weld): 1200 -> 1197. The old 1e-4 mm grid weld merged one pair of distinct knot
// vertices (43,595 -> 43,596 vertices, one four-faced edge fewer); placement no longer snaps to 1 um.
/**
 * The numbers this fixture settles on. They are the BUILT supports, not the contacts the scatter proposes: a
 * generate reports the proposed count first (1194 here) and settles on what the mesh built, so every count is
 * read through the driver's `counts()`, which waits for it to stop moving.
 */
const BASE = {
  auto: 429,
  dragSelected: [57, 57, 57],
};

/*
 * NAMED DEBT: THIS FILE IS OVER THREE THOUSAND LINES, and the repo's rule is that past ~1000 the cut
 * is taken rather than named. It is named instead, with the reason and the cut, because this file IS
 * the release gate: a restructure that silently drops a check would be the one defect nothing else
 * here could catch, and it must not ride along with an audit of the app.
 *
 * The cut, when it is taken: `walk()` is already a list of independent `if (runs('<letter>'))`
 * blocks that share only `page`, `url`, `d`, `scratch` and the fixture paths. Each becomes
 * `scripts/walk/<letter>-<name>.mjs` exporting `run(context)`; this file keeps the launcher, the
 * driver, the page helpers, the `--only`/`--locales` parsing and the summary. The section letters
 * are already the natural boundary, which is why the split is mechanical rather than a redesign.
 *
 * WHICH SECTIONS RUN.
 *
 *   npm run walk                 every section, as always
 *   npm run walk -- --only=u,x   the dental sections only
 *
 * A full walk takes half an hour, because between its checks it does the app's real work: reading a
 * 374k-triangle aligner, orienting it, scanning every print angle, detecting the area, generating
 * supports - several times over. That is the right price for a release gate and the wrong price for a
 * question, and chasing one failure costs many runs.
 *
 * A FILTERED RUN CAN NEVER BE MISTAKEN FOR A FULL ONE. The sections that ran are named in the summary
 * line, and a filtered run says SOME PASS rather than ALL PASS however green it is. That distinction is
 * the whole reason this is safe to add: the danger of a filter is not that it skips work, it is that
 * someone later reads a green line and believes the walk passed.
 *
 * The section letters are the ones the comments in `walk()` already use: `a` for the plain editor (a-k
 * and i), `u` for the dental flow up to Step 2 on the reference aligner, `x` for Step 3 and finishing,
 * `l` for the same flow against the real case fixture where the machine has one, `s` for the start screen,
 * `m` for the drop and the deck, and `q` and `r` for the deliberate fault injection that turns the
 * wiring walk's gap register from READ into reproduced: `q` for G2 (replay) and G4 (two actors on
 * one scarce resource), `r` for G1 (a write refused after an earlier one committed), G3 (a reply
 * before its predecessor), G5 (the far side succeeded while this side gave up) and G7 (the
 * background job stops).
 */
const ONLY = new Set((process.argv.find((arg) => arg.startsWith('--only='))?.slice('--only='.length) ?? '')
  .split(',').map((name) => name.trim()).filter(Boolean));
/** True when `section` is one the caller asked for; with no `--only` every section runs. */
const runs = (section) => ONLY.size === 0 || ONLY.has(section);
/*
 * AND WITHIN THE FAULT-INJECTION SECTIONS, ONE PROBE AT A TIME.
 *
 *   npm run walk -- --only=q                 all six probes, about eight minutes
 *   npm run walk -- --only=q --probes=q6     one probe, about thirty seconds
 *   npm run walk -- --only=r --probes=r2     the same, in the second pass
 *
 * `--only` cut a full walk to a section and that saved a day; this cuts a section to a probe, for
 * the same reason and with the same danger. q1 and q2 are one group because q2 reads the world q1
 * made. The names that ran are printed, and a filtered run can never be read as the whole section.
 *
 * It exists because iterating on ONE fault cost eight minutes a turn, almost all of it q1's
 * 3.19M-triangle read - and a diagnosis that costs eight minutes a question gets guessed at instead.
 */
const PROBES = new Set((process.argv.find((arg) => arg.startsWith('--probes='))?.slice('--probes='.length) ?? '')
  .split(',').map((name) => name.trim()).filter(Boolean));
const probes = (name) => PROBES.size === 0 || PROBES.has(name);
/*
 * The locale pass, by flag as well as by env var. `WALK_LOCALES=…` works on a POSIX shell and not
 * in an npm script on Windows, so `--locales=en,ja,zh-Hant` is the portable form and is what
 * `npm run walk:locales` uses. Same shape as `--only=` above; no new dependency.
 */
const LOCALES = process.argv.find((arg) => arg.startsWith('--locales='))?.slice('--locales='.length)
  ?? process.env.WALK_LOCALES;

/*
 * A BRUSH IS NOT A TRANSACTION.
 *
 * Paint and Erase both ADD stamps (`dental/stamps/add`): erasing does not delete the stamp painting left,
 * it lays an opposing one over it. So dragging back over "the same place" is a second freehand drag, it
 * samples the surface at slightly different points, and it can leave a sliver of area behind - worth a tip
 * or two. That is the tool working as designed, not a fault.
 *
 * The erase checks therefore ask that erasing UNDOES THE PAINTING - the count comes back down, and down
 * past what the painting added - and not that it lands on the exact digit it started from, which a
 * freehand brush cannot promise. Asking for the digit is how both checks came to fail on a difference of
 * one while erase was plainly working.
 */
const ERASE_RESIDUE = 2;

/*
 * THE WAY ON FROM STEP 3. The flow ends at its own export rather than handing back the workspace
 * (FLOW_END, src/scenes/sceneMap.ts), so the primary there reads Export STL instead of OK. Set
 * FLOW_END back to 'bench' and this becomes 'OK' again - it is one name in one place for exactly
 * that reason, since five checks across three sections press it.
 */
const WAY_ON = 'Export STL';

const results = [];
const started = Date.now();
function check(name, ok, detail = '') {
  results.push({ name, ok });
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ` | ${detail}` : ''}`);
}
const note = (text) => console.log(`     ${text}`);

async function freePort(from) {
  for (let port = from; port < from + 40; port += 1) {
    const free = await new Promise((resolve) => {
      const server = createServer().once('error', () => resolve(false)).once('listening', () => server.close(() => resolve(true)));
      server.listen(port, '127.0.0.1');
    });
    if (free) return port;
  }
  throw new Error(`no free port from ${from}`);
}

function startVite(port) {
  const vite = path.join(ROOT, 'node_modules', 'vite', 'bin', 'vite.js');
  const child = spawn(process.execPath, [vite, '--port', String(port), '--strictPort', '--host', '127.0.0.1'], { cwd: ROOT, stdio: 'ignore' });
  child.exited = new Promise((resolve) => child.once('exit', resolve));
  return child;
}

function stopVite(child) {
  if (!child || child.exitCode !== null) return;
  try {
    if (process.platform === 'win32') execFileSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
    else child.kill('SIGKILL');
  } catch { /* already gone */ }
}

async function waitFor(url, child) {
  for (let i = 0; i < 120; i += 1) {
    if (child.exitCode !== null) throw new Error('Vite exited before it served');
    try { if ((await fetch(url)).ok) return; } catch { /* not up yet */ }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error('Vite did not serve in 60 s');
}

/** The newest Chromium that Playwright installed, when the one this playwright-core expects is missing. */
function installedChromium() {
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH ?? (process.platform === 'win32' ? path.join(process.env.LOCALAPPDATA ?? '', 'ms-playwright') : path.join(homedir(), process.platform === 'darwin' ? 'Library/Caches/ms-playwright' : '.cache/ms-playwright'));
  if (!existsSync(base)) return undefined;
  const exe = process.platform === 'win32' ? 'chrome-win64/chrome.exe' : process.platform === 'darwin' ? 'chrome-mac/Chromium.app/Contents/MacOS/Chromium' : 'chrome-linux/chrome';
  return readdirSync(base).filter((name) => /^chromium-\d+$/.test(name)).sort((a, b) => Number(b.split('-')[1]) - Number(a.split('-')[1])).map((name) => path.join(base, name, exe)).find(existsSync);
}

async function launch() {
  const args = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'];
  // WALK_CHROMIUM names a browser to use; otherwise Playwright's own install is tried, then the newest one on disk.
  if (process.env.WALK_CHROMIUM) return chromium.launch({ headless: true, executablePath: process.env.WALK_CHROMIUM, args });
  try {
    return await chromium.launch({ headless: true, args });
  } catch (error) {
    const executablePath = installedChromium();
    if (!executablePath) {
      throw new Error(`No Chromium for Playwright. Run: npx playwright-core install chromium\n${error.message.split('\n')[0]}`);
    }
    return chromium.launch({ headless: true, executablePath, args });
  }
}

/** The start screen (docs/ROADMAP.md ST) is the first thing the app shows: "Any model" opens the empty editor the scenarios below begin in. */
async function enterEditor(page) {
  await page.getByRole('button', { name: 'Any model', exact: true }).click();
  await page.waitForSelector('.workspace');
}

// ---- page helpers -----------------------------------------------------------------------------

/** Runs in the page: the React props of the viewport (selection, built support meshes) and of the scene owner. */
function readProps() {
  const root = document.getElementById('root');
  const key = Object.keys(root).find((k) => k.startsWith('__reactContainer'));
  const stack = [root[key].stateNode?.current ?? root[key]];
  const out = {};
  while (stack.length) {
    const fiber = stack.pop();
    if (!fiber) continue;
    const p = fiber.memoizedProps;
    if (p && typeof p === 'object' && 'supportMeshes' in p) {
      if ('selection' in p) out.selection = [...p.selection].sort();
      if ('scene' in p) out.scene = p.scene;
      out.meshes = p.supportMeshes;
    }
    if (fiber.child) stack.push(fiber.child);
    if (fiber.sibling) stack.push(fiber.sibling);
  }
  const hash = (ids) => { let h = 2166136261; for (const ch of ids.join('|')) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0; return h.toString(16); };
  const mesh = out.meshes ? [...out.meshes.values()][0] : undefined;
  const unit = out.scene?.units?.[0];
  const active = out.scene?.units?.find((candidate) => candidate.id === out.scene.activeUnitId);
  const drawn = mesh ? new Set(mesh.components.map((c) => c.contactId).filter(Boolean)) : new Set();
  return {
    selected: out.selection?.length ?? -1,
    hash: out.selection ? hash(out.selection) : '',
    tris: mesh ? mesh.indices.length / 3 : -1,
    drawn: drawn.size,
    dropped: mesh ? mesh.dropped.length : -1,
    droppedDrawn: mesh ? mesh.dropped.filter((id) => drawn.has(id)).length : -1,
    islands: mesh?.islands ? (mesh.islands.status === 'ok' ? { resolved: mesh.islands.islands.filter((i) => i.status === 'resolved').length, unresolved: mesh.islands.islands.filter((i) => i.status === 'unresolved').length, manualOnly: mesh.islands.islands.filter((i) => i.status === 'manual-only').length } : 'inconclusive') : undefined,
    dentalReviewGap: mesh?.dentalRimCoverage?.opening.reviewGapMm ?? -1,
    dentalNeedsReview: mesh?.dentalRimCoverage?.needsReview ?? null,
    customised: unit ? Object.keys(unit.contactSettings).length : -1,
    activeRotation: active ? [...active.transform.rotation] : undefined,
    active: out.scene?.activeUnitId,
    first: unit?.id,
    point: unit?.settings?.pointDiameter,
    zones: unit ? unit.zones.length : -1,
    dentalBoundary: unit?.dental?.rim.boundaryKind ?? '',
    dentalKind: unit?.dental?.kind ?? '',
    activeDental: active?.dental ? { kind: active.dental.kind ?? 'legacy', origin: active.dental.origin ?? '', stamps: active.dental.stamps.length,
      tuning: active.dental.tuning, faces: active.dental.region?.contactFaces?.reduce((sum, face) => sum + face, 0) ?? -1,
      tips: hash((active.dental.region?.contacts ?? []).map((contact) => String(contact.face))) } : undefined,
    dentalStamps: unit?.dental?.stamps.length ?? -1,
    dentalFaces: unit?.dental?.kind === 'two-contour' ? unit.dental.region.contactFaces?.reduce((sum, face) => sum + face, 0) ?? -1 : -1,
    dentalContacts: unit?.dental?.kind === 'two-contour' ? unit.dental.region.contacts?.length ?? -1 : -1,
    dentalTuning: unit?.dental?.kind === 'two-contour' ? unit.dental.tuning : undefined,
    ids: out.selection ?? [],
    units: (out.scene?.units ?? []).map((u) => ({ id: u.id, label: u.settings?.labelText ?? '', supports: Boolean(u.supports), dental: Boolean(u.dental), pos: [...u.transform.position], manual: u.manual.length, deleted: u.deleted.length })),
  };
}


/**
 * How many pixels of the 3D view are within `tolerance` of `hex`, and where they sit.
 *
 * THE ONLY HONEST WAY TO ASK WHETHER THE OPERATOR CAN SEE SOMETHING. The viewport's overlays are
 * three.js objects in r3f's own fiber tree, which `readProps` cannot reach (it walks the react-dom
 * tree under #root), and the GL canvas is made without `preserveDrawingBuffer`, so the page cannot
 * read its own pixels back. Playwright's screenshot goes through the compositor, which DOES capture
 * WebGL - so the shot is taken here and handed back to Chromium to decode, where `createImageBitmap`
 * and an OffscreenCanvas do the work no dependency here would otherwise do.
 *
 * `without` names DOM elements lying OVER the canvas whose boxes are skipped, because a screenshot
 * of the canvas catches whatever the page composites on top of it. The scene legend is the reason
 * this exists: it shows a swatch of the rim colour a few pixels wide, which would answer "can the
 * operator see the rim on the model" with the legend that merely names it.
 *
 * Returns the count and the hits' bounding box in image pixels, so a check can say the colour is
 * present AND roughly where.
 */
async function canvasColour(page, hex, { tolerance = 26, without = [] } = {}) {
  const shot = await page.locator('canvas').first().screenshot();
  return page.evaluate(async ({ png, hex, tolerance, without }) => {
    const bitmap = await createImageBitmap(await (await fetch(png)).blob());
    const surface = new OffscreenCanvas(bitmap.width, bitmap.height);
    const context = surface.getContext('2d');
    context.drawImage(bitmap, 0, 0);
    const { data } = context.getImageData(0, 0, bitmap.width, bitmap.height);
    // CSS pixels to image pixels: the shot is the canvas's own box, at whatever scale it came back.
    const frame = document.querySelector('canvas').getBoundingClientRect();
    const scale = bitmap.width / frame.width;
    const masks = without.flatMap((selector) => [...document.querySelectorAll(selector)].map((node) => {
      const box = node.getBoundingClientRect();
      return [(box.left - frame.left) * scale, (box.top - frame.top) * scale,
        (box.right - frame.left) * scale, (box.bottom - frame.top) * scale];
    }));
    const want = [1, 3, 5].map((at) => parseInt(hex.slice(at, at + 2), 16));
    let count = 0, left = Infinity, top = Infinity, right = -1, bottom = -1;
    for (let at = 0; at < data.length; at += 4) {
      if (Math.abs(data[at] - want[0]) > tolerance || Math.abs(data[at + 1] - want[1]) > tolerance
        || Math.abs(data[at + 2] - want[2]) > tolerance) continue;
      const pixel = at / 4, x = pixel % bitmap.width, y = Math.floor(pixel / bitmap.width);
      if (masks.some((box) => x >= box[0] && x <= box[2] && y >= box[1] && y <= box[3])) continue;
      count += 1;
      if (x < left) left = x;
      if (x > right) right = x;
      if (y < top) top = y;
      if (y > bottom) bottom = y;
    }
    return { count, box: count ? [left, top, right, bottom] : null, width: bitmap.width, height: bitmap.height, masked: masks.length };
  }, { png: `data:image/png;base64,${shot.toString('base64')}`, hex, tolerance, without });
}

/** A viewport colour as the page's tokens hold it right now, so a token edit moves the check with it. */
const sceneToken = (page, token) => page.evaluate((name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim(), token);

/** Waits until Step 2's tip preview is ready again after an edit (no "Updating" or "Finding" note, tips counted). */
async function previewReady(page) {
  await page.evaluate(() => new Promise((resolve) => setTimeout(resolve, 400)));
  /*
   * Waits on the TIP COUNT ITSELF, by its name. This used to wait for any digit to turn up in an
   * `.edit-note`, which worked only because the count was written inside a sentence there; when the count
   * became a readout of its own the notes held no digits at all and this waited out its full two minutes.
   * A named element is the thing to wait on - the words around it are free to change.
   */
  await page.waitForFunction(() => !/Updating support area|Finding safe/.test(document.body.innerText)
    && Number(document.querySelector('[data-ui="dental-tip-count"] .num')?.textContent ?? 0) > 0, null, { timeout: 120000 });
}

/**
 * Step 2, Add: orbits the view from below to look down on the aligner (a vertical drag across empty
 * canvas), then clicks a grid of spots until one answers with `expected` (the "faces up" line).
 * Every tip added on the way, the one with the warning too, is undone. Returns what was seen.
 */
async function addOnUpFacingSpot(page, expected) {
  const idle = (ms) => page.evaluate((span) => new Promise((resolve) => setTimeout(resolve, span)), ms);
  const box = await page.locator('canvas').first().boundingBox();
  const at = (fx, fy) => [box.x + box.width * fx, box.y + box.height * fy];
  const manual = async () => (await page.evaluate(readProps)).units[0]?.manual ?? -1;
  const status = () => page.evaluate(() => document.querySelector('footer strong')?.innerText ?? '');
  const tried = [];
  /*
   * WHERE THE EMPTY CANVAS IS, ASKED RATHER THAN ASSUMED.
   *
   * This used to turn the view by dragging down the right edge at x = 0.97, which was empty canvas when the
   * edit bar was a strip across the top. The dental dock is a COLUMN on the right now, so that drag lands
   * on the panel, the view never turns, and this hunts for an up-facing spot from a camera that cannot see
   * one - failing with a list of spots that all took a tip and never a warning.
   *
   * So the page is asked: walk in from the left and take the first line where the top element under the
   * pointer is the canvas itself. That holds whatever the docks are doing, at any window size.
   */
  const orbitX = await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    const box = canvas.getBoundingClientRect();
    for (const fx of [0.24, 0.28, 0.22, 0.32, 0.2, 0.36, 0.75, 0.7]) {
      const x = box.x + box.width * fx;
      const clear = [0.45, 0.6, 0.75].every((fy) => document.elementFromPoint(x, box.y + box.height * fy) === canvas);
      if (clear) return fx;
    }
    return 0.24;
  });
  // The first drag turns the view one way; if it was already there, the second turns it the other way.
  for (const [from, to] of [[0.4, 0.85], [0.85, 0.4]]) {
  for (let sweep = 0; sweep < 2; sweep += 1) {
    await page.mouse.move(...at(orbitX, from));
    await page.mouse.down();
    for (let k = 0; k <= 20; k += 1) await page.mouse.move(...at(orbitX, from + (to - from) * k / 20));
    await page.mouse.up();
  }
  await idle(1000);
  for (const fy of [0.5, 0.4, 0.6, 0.3, 0.7]) {
    for (const fx of [0.5, 0.4, 0.6, 0.3, 0.7]) {
      await previewReady(page);
      const was = await manual();
      await page.mouse.click(...at(fx, fy));
      await idle(700);
      const line = await status();
      const now = await manual();
      tried.push(`${fx},${fy}:${now > was ? 'added' : 'none'}`);
      if (now > was) {
        await page.keyboard.press('Control+z');
        for (let wait = 0; wait < 20 && (await manual()) !== was; wait += 1) await idle(300);
      }
      if (line === expected) return { found: true, added: now > was, status: line, tried };
    }
  }
  }
  return { found: false, added: false, status: await status(), tried };
}

/** One Chromium page with the helpers the checks share. */
function makeDriver(page) {
  const idle = (ms) => page.evaluate((span) => new Promise((resolve) => setTimeout(resolve, span)), ms);
  const props = () => page.evaluate(readProps);
  const footer = () => page.evaluate(() => document.querySelector('footer')?.innerText ?? '');
  const status = () => page.evaluate(() => document.querySelector('footer strong')?.innerText ?? '');
  const readCounts = async () => {
    const match = (await footer()).match(/([\d,]+) automatic, ([\d,]+) manual, ([\d,]+) removed/);
    const n = (i) => (match ? Number(match[i].replace(/,/g, '')) : -1);
    return { auto: n(1), manual: n(2), removed: n(3) };
  };
  /**
   * The footer counts once they have STOPPED MOVING. A generate first reports every contact the scatter
   * proposed and then settles on the supports the mesh actually built, which for this fixture is a third of
   * them; a count read between the two is a real number that is not the answer, and a baseline taken there
   * flaps. Everything that asserts on a count goes through here.
   */
  const counts = async () => {
    let last = await readCounts();
    let same = 0;
    const t0 = Date.now();
    while (same < 4) {
      if (Date.now() - t0 > 120000) throw new Error(`counts never settled (last ${JSON.stringify(last)})`);
      await idle(500);
      const now = await readCounts();
      same = now.auto === last.auto && now.manual === last.manual && now.removed === last.removed ? same + 1 : 0;
      last = now;
    }
    return last;
  };
  const quiet = () => page.waitForFunction(() => !!document.querySelector('.job-activity')?.hidden, null, { timeout: 300000 });
  /** Waits until the selection stops changing (a queued stroke drained). */
  const settle = async () => {
    let last = '';
    let same = 0;
    const t0 = Date.now();
    while (same < 5) {
      if (Date.now() - t0 > 180000) throw new Error('selection never settled');
      await idle(400);
      const p = await props();
      const s = `${p.selected}#${p.hash}`;
      same = s === last ? same + 1 : 0;
      last = s;
    }
    return props();
  };
  const settled = async () => { await idle(1000); await quiet(); await idle(400); };
  const button = (name, exact = true) => page.getByRole('button', { name, exact }).first();
  /**
   * Strokes across the canvas until one selects something, and returns what it selected. Each line
   * is a different height and width, so between them they cross the model wherever it sits and
   * whatever shape it is. Throws when every line comes up empty, which is a real failure.
   */
  /**
   * Paints a no-support zone ON the model and returns how many strokes landed. A zone only paints where
   * the model is under the pointer, and supports attach UNDERNEATH (the app tells the user exactly that in
   * Step 2), so this works from Bottom view and hunts for a spot that registers on the unit's own zone
   * count - which moves the moment a stroke lands, unlike the badge, which waits for a rebuild.
   */
  const paintZoneOnModel = async () => {
    await zonesButton().click();
    await idle(800);
    await button('Bottom view').click();
    await idle(1500);
    const zones = async () => (await props()).zones;
    const before = await zones();
    hunt: for (const fy of [0.42, 0.48, 0.36, 0.54, 0.30, 0.60, 0.66, 0.72]) {
      for (const fx of [0.36, 0.48, 0.60, 0.30, 0.66, 0.24, 0.72]) {
        await stroke([fx - 0.04, fy], [fx + 0.04, fy], 10);
        await idle(250);
        if ((await zones()) > before) {
          // It lands here: paint a cross around it, so the zone covers enough supports to assert on.
          for (const dy of [-0.06, -0.03, 0, 0.03, 0.06]) { await stroke([fx - 0.10, fy + dy], [fx + 0.10, fy + dy], 20); await idle(200); }
          break hunt;
        }
      }
    }
    await quiet();
    return (await zones()) - before;
  };

  const strokeUntilSelected = async (want = 3) => {
    const lines = [
      [[0.30, 0.50], [0.72, 0.50]], [[0.30, 0.42], [0.72, 0.42]], [[0.30, 0.58], [0.72, 0.58]],
      [[0.30, 0.35], [0.72, 0.35]], [[0.30, 0.65], [0.72, 0.65]], [[0.20, 0.50], [0.80, 0.50]],
      [[0.25, 0.30], [0.75, 0.70]], [[0.25, 0.70], [0.75, 0.30]],
    ];
    let best = { line: undefined, selected: 0 };
    for (const [from, to] of lines) {
      await stroke(from, to, 30);
      const picked = await settle();
      if (picked.selected >= want) return picked;
      if (picked.selected > best.selected) best = { line: [from, to], selected: picked.selected };
      await button('Clear selection').click({ timeout: 3000 }).catch(() => {});
      await idle(300);
    }
    if (!best.line) throw new Error('no stroke over the canvas selected a single support');
    // None reached `want`, so take the best line again and keep what it picks up.
    await stroke(best.line[0], best.line[1], 30);
    return settle();
  };
  const editButton = () => page.locator('.panel.left .mode-button').locator('xpath=preceding-sibling::button[1]');
  const zonesButton = () => page.locator('aside.left h3', { hasText: /^Modes$/ }).locator('xpath=..').locator('button').nth(1);
  let box;
  const at = (fx, fy) => [box.x + box.width * fx, box.y + box.height * fy];
  const stroke = async (from, to, moves, { button: which, pace } = {}) => {
    await page.mouse.move(...at(...from));
    await idle(200);
    await page.mouse.down({ button: which ?? 'left' });
    for (let i = 0; i <= moves; i += 1) {
      await page.mouse.move(...at(from[0] + (to[0] - from[0]) * i / moves, from[1] + (to[1] - from[1]) * i / moves));
      // `pace` spaces the moves out. Under the CPU throttle below, moves sent as fast as the driver can
      // send them are simply dropped, and the stroke selects nothing at all - which is not the queue this
      // check is about.
      if (pace) await idle(pace);
    }
    await page.mouse.up({ button: which ?? 'left' });
  };
  return {
    page, idle, props, footer, status, counts, quiet, settle, settled, button, editButton, zonesButton, stroke, strokeUntilSelected, paintZoneOnModel,
    async measureCanvas() { box = await page.locator('canvas').first().boundingBox(); },
    at,
    /** Generates the supports; with `whileBuilding`, presses Drag over in the window where the first build is still running. */
    async generate(url, whileBuilding) {
      await page.goto(url);
      await enterEditor(page);
      await page.setInputFiles('.drop input[type=file]', FIXTURE);
      await page.waitForFunction(() => document.body.innerText.includes('knot'), null, { timeout: 60000 });
      if (whileBuilding) await page.evaluate(() => { window.__meshDelay = 8000; });
      await page.locator('.panel.left .primary').first().click();
      if (whileBuilding) {
        await this.measureCanvas();
        await page.waitForFunction(() => document.querySelector('footer .building'), null, { polling: 'raf', timeout: 240000 });
        const reached = await page.evaluate(async () => {
          const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
          // textContent, not innerText: innerText is the PAINTED text, and the theme uppercases a tool key, so an
          // exact match on innerText misses without saying so - the tool then stays on Add supports and the press
          // below adds a support instead of asking an empty Drag over what it hit.
          const press = (name) => {
            const button = [...document.querySelectorAll('button')].find((b) => (b.textContent ?? '').trim().toLowerCase() === name.toLowerCase());
            button?.click();
            return !!button;
          };
          document.querySelector('.panel.left .mode-button').previousElementSibling.click();
          await pause(150);
          press('Select supports');
          await pause(150);
          press('Drag over');
          await pause(250);
          // Drag over really is the engaged tool: otherwise the check below would read the status of something else.
          return [...document.querySelectorAll('.edit-bar button[aria-pressed="true"]')]
            .some((b) => (b.textContent ?? '').trim().toLowerCase() === 'drag over');
        });
        await page.mouse.move(...this.at(0.5, 0.5));
        await page.mouse.down();
        await page.mouse.up();
        whileBuilding({ reached, status: await this.status(), building: await page.evaluate(() => !!document.querySelector('footer .building')) });
        await page.evaluate(() => { window.__meshDelay = 0; });
        await this.quiet();
        await this.idle(800);
        await this.exitMode();
      }
      await page.waitForFunction(() => /[1-9][\d,]* automatic/.test(document.querySelector('footer')?.innerText ?? '') && ![...document.querySelectorAll('button')].some((b) => /Generating/.test(b.innerText)), null, { timeout: 240000 });
      await quiet();
      await idle(800);
      // The number above is the proposed one; wait for the built one before anyone reads it.
      await this.counts();
      await this.measureCanvas();
    },
    async enterDragOver(mode = 'Select supports') {
      await editButton().click();
      await button(mode).click();
      await button('Drag over').click();
      await button('Select').click();
      await idle(2500);
    },
    async exitMode() {
      await page.locator('.edit-done').click();
      await idle(600);
    },
  };
}

// ---- the walk ---------------------------------------------------------------------------------

/** Triangle count of an STL file, binary or ASCII. */
function stlTriangles(buffer) {
  if (buffer.length >= 84 && 84 + 50 * buffer.readUInt32LE(80) === buffer.length) return buffer.readUInt32LE(80);
  return (buffer.toString('latin1').match(/facet normal/g) ?? []).length;
}

/** Every vertex x of a binary STL (the whole-plate export), for the arrangement checks. */
function stlVertexXs(buffer) {
  const count = buffer.readUInt32LE(80);
  const xs = [];
  for (let at = 0; at < count; at += 1) for (let k = 0; k < 3; k += 1) xs.push(buffer.readFloatLE(84 + at * 50 + 12 + k * 12));
  return { count, xs };
}

async function exportSupports(d, dir) {
  const download = d.page.waitForEvent('download', { timeout: 600000 });
  await d.page.locator('.export button').nth(1).click();
  const file = path.join(dir, 'supports.stl');
  await (await download).saveAs(file);
  return stlTriangles(readFileSync(file));
}

/** The browser and Vite the run owns, so a signal or a throw anywhere still stops both. */
let browser;
let vite;

async function walk(url, scratch, dentalFixture) {
  browser = await launch();
  const context = await browser.newContext({ viewport: VIEWPORT, acceptDownloads: true });
  await context.addInitScript(() => { try { localStorage.setItem('mixodental.lang', 'en'); } catch { /* storage off */ } });
  await context.addInitScript(faultLevers);
  const page = await context.newPage();
  const errors = [];
  /** Set by the `crash` listener below; a failure reported after it is a symptom of the crash. */
  let crashed = false;
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errors.push(`${m.type()}: ${m.text()}`); });
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  /*
   * A CRASHED TAB MUST SAY SO, because its symptom is a lie. When the renderer dies, every call
   * after it fails as whatever Playwright happened to be doing: the first run that hit this reported
   * `locator.click: Timeout 30000ms exceeded` on a Drag over button that was perfectly fine, and the
   * next run on the same build reported `Target crashed` from a different call. Two symptoms, one
   * cause, and the first of them sends the reader after the button.
   */
  page.on('crash', () => { crashed = true; errors.push('pageerror: THE BROWSER TAB CRASHED - the failure reported after this is a symptom, not a cause'); });
  const outside = [];
  page.on('request', (r) => {
    const u = new URL(r.url());
    if (/^https?:$/.test(u.protocol) && u.hostname !== '127.0.0.1' && u.hostname !== 'localhost') outside.push(r.url());
  });
  const d = makeDriver(page);
  try {
    /*
     * a-k and i: THE PLAIN EDITOR, on the knot fixture - generate, select, delete, zones, per-support
     * settings, export, save and open. It is one section under `--only=a`, because everything in it works
     * on the same plate built by the same first generate, and the dental sections below share nothing
     * with it (checked: not one of its names is read after this block ends).
     */
    if (runs('a')) {
      let early;
      await d.generate(url, (seen) => { early = seen; });
      check('i Drag over pressed while the first build runs says so',
        early?.reached === true && early.building && early.status === 'Supports are still building.',
        `status "${early?.status}", build still running at the press ${early?.building}, Drag over engaged while building ${early?.reached}`);

      /*
       * a0. THE EDITOR FITS THE WINDOW. This is checked before anything strokes the canvas, because a canvas
       * taller than the screen breaks every stroke at once and does it SILENTLY: the strokes below aim at
       * fractions of the canvas box, so a canvas running past the bottom of the window sends them into empty
       * space, no pointer event reaches the page, and five checks fail looking like five separate bugs.
       *
       * It happened: `main` had `min-height: 100vh` and no definite height, which left `.workspace`'s
       * `flex-basis: 0%` unresolvable, so it sized to its tallest panel's content instead. At 1440x900 the
       * canvas measured 2063 px inside a 900 px window with the page scrolling.
       */
      const fit = await d.page.evaluate(() => {
        const box = document.querySelector('canvas').getBoundingClientRect();
        return { height: Math.round(box.height), bottom: Math.round(box.bottom), page: document.documentElement.scrollHeight, window: window.innerHeight };
      });
      check('a0 the editor fits the window: the canvas does not run past the bottom of the screen',
        fit.bottom <= fit.window + 1 && fit.page <= fit.window + 1,
        `canvas ${fit.height} px tall, bottom at ${fit.bottom}, page ${fit.page}, window ${fit.window}`);

      // a. Generate and Drag over.
      const first = await d.counts();
      check('a1 generate: automatic count', first.auto === BASE.auto, `auto ${first.auto} (baseline ${BASE.auto}), manual ${first.manual}, removed ${first.removed}`);
      await d.enterDragOver();
      const strokes = [
        ['select, front', [[0.3, 0.5], [0.72, 0.5]], 30],
        ['select, upper part', [[0.32, 0.42], [0.7, 0.42]], 25],
      ];
      const picked = [];
      for (const [, [from, to], moves] of strokes) {
        await d.stroke(from, to, moves);
        picked.push((await d.settle()).selected);
      }
      await d.button('Unselect').click();
      await d.stroke([0.4, 0.45], [0.6, 0.55], 15);
      picked.push((await d.settle()).selected);
      check('a2 drag over: fixed selection counts', picked.join() === BASE.dragSelected.join(), `selected ${picked.join(', ')} (baseline ${BASE.dragSelected.join(', ')})`);
      await d.quiet();
      await page.keyboard.press('Delete');
      await d.settled();
      const deleted = await d.counts();
      check('a3 Delete removes exactly the selection', deleted.removed === picked.at(-1) && deleted.auto === first.auto - picked.at(-1), `removed ${deleted.removed} of ${picked.at(-1)} selected, auto ${deleted.auto}`);
      await page.keyboard.press('Control+z');
      await d.settled();
      const undone = await d.counts();
      check('a4 Undo brings them back', undone.removed === 0 && undone.auto === first.auto, `removed ${undone.removed}, auto ${undone.auto}`);
      await d.exitMode();

      // b. Occlusion had a second half - press Hide models, drag the same line again, and see the supports that
      // were behind the model come into the selection. That control left the app in f716eb4 (PD.11 S1) and nothing
      // else clears `modelsVisible`, so the comparison cannot be made any more; what was left of the check only
      // repeated a2's front drag from a less settled state, and pinning that number would be coverage in name
      // only. Removed with the control. If Hide models ever comes back, so does this check.

      // c. Zone landing, then d. export after zone + Delete.
      const beforeZone = await d.props();
      const countsBefore = await d.counts();
      const painted = await d.paintZoneOnModel();
      note(`zones painted over ${painted > 0 ? 'the model' : 'nothing'} (${painted} strokes landed)`);
      await page.waitForFunction(() => document.querySelector('.edit-badge b') && !/^0 /.test(document.querySelector('.edit-badge b').innerText), null, { timeout: 90000 }).catch(() => {});
      await d.settled();
      const zoned = await d.props();
      const countsZoned = await d.counts();
      // The badge counts the supports the zones hide. "0" means the strokes never landed on the model, which is
      // a different failure from "zones landed and removed nothing".
      const zoneBadge = await page.evaluate(() => document.querySelector('.edit-badge')?.innerText.replace(/\s+/g, ' ') ?? '');
      check('c zone landing: the count and the drawn supports both lose the zoned ones',
        zoned.dropped > 0 && countsZoned.auto < countsBefore.auto && countsZoned.auto === zoned.drawn && zoned.droppedDrawn === 0,
        `auto ${countsBefore.auto} -> ${countsZoned.auto}, drawn supports ${beforeZone.drawn} -> ${zoned.drawn}, dropped by a landing ${zoned.dropped}, dropped still drawn ${zoned.droppedDrawn}; badge "${zoneBadge}"`);
      await d.exitMode();

      await d.enterDragOver();
      await d.stroke([0.3, 0.5], [0.7, 0.5], 30);
      const forDelete = await d.settle();
      await page.keyboard.press('Delete');
      await d.settled();
      const afterDelete = await d.props();
      await d.exitMode();
      const exported = await exportSupports(d, scratch);
      check('d export after zone + Delete matches the build on screen', exported === afterDelete.tris, `exported ${exported} triangles, on screen ${afterDelete.tris} (deleted ${forDelete.selected}, drawn supports ${afterDelete.drawn})`);
      await page.keyboard.press('Control+z');
      await d.settled();
      const restored = await d.counts();
      check('d2 Undo after the export brings the deleted supports back', restored.removed === 0, `removed ${restored.removed}`);

      // e. Right-click remove, then add at the same spot; Undo and Redo.
      await d.editButton().click();
      await d.button('Add supports').click();
      await d.idle(2000);
      const base = await d.counts();
      // The spot has to be ON THE MODEL, and the only way to know that is that a click adds a support there.
      // Finding it by right-clicking until a support vanished pointed at the SUPPORT instead, so the re-add
      // afterwards landed on empty space and the app rightly said "Nothing under the cursor".
      let spot;
      search: for (const fy of [0.42, 0.48, 0.36, 0.54, 0.30, 0.60, 0.66]) {
        for (const fx of [0.36, 0.48, 0.60, 0.30, 0.66, 0.24, 0.72]) {
          await page.mouse.move(...d.at(fx, fy));
          await d.idle(200);
          await page.mouse.click(...d.at(fx, fy));
          await d.idle(800);
          await d.quiet();
          if ((await d.counts()).manual !== base.manual + 1) continue;
          // On the model. Now it also has to carry an automatic support within click reach, or the removal
          // below is a no-op and there is nothing for Undo and Redo to walk.
          await page.keyboard.press('Control+z');
          await d.settled();
          await page.mouse.click(...d.at(fx, fy), { button: 'right' });
          await d.settled();
          if ((await d.counts()).removed === base.removed + 1) {
            await page.keyboard.press('Control+z');
            await d.settled();
            spot = [fx, fy];
            break search;
          }
        }
      }
      if (!spot) check('e right-click remove', false, 'no spot on the model took a support');
      else {
        const step = async () => { await d.settled(); return d.counts(); };
        // The spot is on the model, so a right-click there takes the AUTOMATIC support within click reach -
        // which is what this check has always been about: a removal and a manual add at the same place, both
        // surviving undo and redo.
        await page.mouse.click(...d.at(...spot), { button: 'right' });
        const removed = await step();
        await page.mouse.click(...d.at(...spot));
        const added = await step();
        // What the app said about that click: "Support added..." or a miss. Without it a failure here cannot be
        // told apart from the click landing on empty space where the removed support used to be drawn.
        const addSaid = await d.status();
        const keeps = added.manual === 1 && added.removed === removed.removed;
        await page.keyboard.press('Control+z');
        const undoAdd = await step();
        await page.keyboard.press('Control+z');
        const undoRemove = await step();
        await page.keyboard.press('Control+Shift+z');
        const redoRemove = await step();
        await page.keyboard.press('Control+Shift+z');
        const redoAdd = await step();
        check('e remove then add at the same spot keeps the manual support', keeps, `at ${spot}: removed ${removed.removed}, then manual ${added.manual} removed ${added.removed}; the app said "${addSaid}"`);
        check('e Undo and Redo walk both steps',
          undoAdd.manual === 0 && undoAdd.removed === removed.removed && undoRemove.removed === base.removed && redoRemove.removed === removed.removed && redoRemove.manual === 0 && redoAdd.manual === 1 && redoAdd.removed === removed.removed,
          `undo add ${undoAdd.manual}/${undoAdd.removed}, undo remove ${undoRemove.manual}/${undoRemove.removed}, redo remove ${redoRemove.manual}/${redoRemove.removed}, redo add ${redoAdd.manual}/${redoAdd.removed} (manual/removed)`);
      }
      await d.exitMode();

      // f. Per-support settings.
      // From below, where the supports are. c has just taken a zone out of the middle of the model, which is
      // where the front view's strokes used to land, and supports attach underneath anyway: a5 picks up 67 tips
      // from this view and none from the front. g and k stroke after this and inherit it.
      await d.button('Bottom view').click();
      await d.idle(1500);
      await d.measureCanvas();
      const shape = page.locator('.panel.right section').filter({ has: page.locator('h3', { hasText: /Support shape/ }) });
      const pointField = () => shape.locator('[data-ui="setting-pointDiameter"] input');
      const setPoint = async (value) => { await pointField().fill(value); await pointField().press('Enter'); await d.idle(2500); };
      await d.enterDragOver();
      await d.strokeUntilSelected();
      const chosen = await d.settle();
      const defaults = await d.props();
      await setPoint('0.6');
      const custom = await d.props();
      check('f1 Point Ø on the selection customises exactly those', custom.customised === chosen.selected && custom.point === defaults.point, `selected ${chosen.selected}, customised ${custom.customised}, object Point Ø ${custom.point}`);
      await d.button('Clear selection').click({ timeout: 3000 }).catch(() => {});
      await d.exitMode();
      await setPoint('0.35');
      const changed = await d.props();
      check('f2 changing the default leaves them customised', changed.customised === chosen.selected && changed.point === 0.35, `customised ${changed.customised}, default Point Ø ${changed.point}`);
      await page.locator('.shape-band button').click();
      await d.idle(1200);
      await d.settle();
      await shape.locator('.shape-head button').click();
      await d.idle(1500);
      const reset = await d.props();
      check('f3 Reset clears them', reset.customised === 0, `customised ${reset.customised}`);
      await page.keyboard.press('Control+z');
      await d.idle(1500);
      const unreset = await d.props();
      check('f4 Undo brings them back', unreset.customised === chosen.selected, `customised ${unreset.customised}`);
      await d.exitMode();

      // g. Select to Unselect mid-queue, under CPU throttle: the same result as the steps one after the other.
      await d.enterDragOver();
      const A = [[0.3, 0.5], [0.7, 0.5]];
      const B = [[0.45, 0.4], [0.55, 0.6]];
      /*
       * START ON SELECT, SAID OUT LOUD. The switch survives mode changes by design
       * (docs/design/ui-structure.md 4.1: the tool, method, switch and sizes all do), and `a2` above
       * ENDS with Unselect pressed. So this check used to begin on whatever a2 left behind: the first
       * stroke unselected from an empty selection, `sequential` came back 0, and the second pair gave
       * the same 0 with the same hash - which reads as a broken app and is a broken test.
       *
       * The Select press below (before the throttled pair) was already here. It was just on the wrong
       * side of the measurement it protects.
       */
      await d.button('Select', true).click().catch(() => {});
      await d.idle(300);
      await d.stroke(A[0], A[1], 30);
      await d.settle();
      await d.button('Unselect').click();
      await d.stroke(B[0], B[1], 15);
      const sequential = await d.settle();
      await d.button('Clear selection').click({ timeout: 3000 }).catch(() => {});
      await d.button('Select', true).click().catch(() => {});
      await d.idle(500);
      const cdp = await context.newCDPSession(page);
      /*
       * ONE throttled stroke, not a hunt for the right rate.
       *
       * This check needs the machine slowed enough for a queue of brush steps to form, so the tool switch
       * has something to land in the middle of. Too slow and the pointer moves are dropped outright and
       * the stroke selects nothing - which is how this failed on this machine at 4x, after already being
       * lowered from 6x for the same reason.
       *
       * Trying several rates in turn looked like the answer and was worse: three 30-move strokes under
       * heavy throttle exhausted the renderer and CRASHED the tab, which costs every check after it rather
       * than one line of red. One attempt, and if no queue formed the check says so instead of blaming the
       * app for the machine it ran on.
       */
      // 6x was too slow, then 4x was too slow on a busier machine (the pointer moves are dropped
      // outright and the stroke selects nothing, which `g-pre` now reports as its own failure). 2x is
      // the next step down. If this ever reports 0 again, lower it rather than reading it as the app.
      const throttle = 2;
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: throttle });
      await d.stroke(A[0], A[1], 30, { pace: 40 });
      const pendingAtSwitch = (await d.props()).selected;
      await d.button('Unselect').click();
      await d.stroke(B[0], B[1], 15, { pace: 40 });
      // Let it run at full speed again BEFORE settling: the queue formed under throttle, which is the point,
      // but it has to finish for the check to see where the switch landed.
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
      const switched = await d.settle();
      // A queue that never formed cannot answer the question, and saying so is better than a red line that
      // blames the app for the machine.
      /*
       * TWO CHECKS, BECAUSE THIS WAS TWO QUESTIONS IN ONE LINE - and that is why `g` spent this whole
       * session being called flaky, then deterministic, then flaky again. The conflated form failed
       * whenever EITHER the app disagreed with itself OR the harness could not slow the machine enough
       * to build a queue, and the failure text could not tell you which.
       *
       * Measured, not reasoned: at the run that prompted this split, both hashes were #811c9dc5 -
       * identical, so the app assertion HELD - while `pendingAtSwitch` was 0, meaning no queue ever
       * formed. One number says the app is right; the other says the test could not run. They cannot
       * share a verdict.
       *
       * `g` is still the real assertion and still has to pass. `g-pre` is the precondition, and it
       * fails loudly rather than silently, because a check that cannot run is not a check that passed.
       */
      check('g-pre the machine slowed enough for a brush queue to form (precondition, not the app)',
        pendingAtSwitch > 0,
        `${pendingAtSwitch} steps pending at the switch, ${throttle}x throttle. 0 means the pointer moves were dropped outright - the machine was too loaded, so g below could not be answered.`);
      /*
       * AND g IS NOT REPORTED AT ALL WHEN NO QUEUE FORMED. Splitting the precondition out fixed the
       * attribution and immediately introduced a worse fault: with 0 steps pending, both strokes
       * compare the EMPTY state, the hashes match trivially, and `g` printed PASS - a vacuous pass,
       * claiming the app is right about something it never exercised. A green that means nothing is
       * more dangerous than a red that means the machine, because only one of them gets investigated.
       */
      if (pendingAtSwitch > 0) {
        check('g Select to Unselect mid-queue keeps the earlier steps as Select',
          switched.hash === sequential.hash,
          `one after the other ${sequential.selected} (#${sequential.hash}), switched mid-queue ${switched.selected} (#${switched.hash}), selected when switching ${pendingAtSwitch} at ${throttle}x`);
      } else {
        note(`g could not be judged: no queue formed, so both strokes compared the empty state (#${sequential.hash}). The app was not exercised, so nothing is claimed about it.`);
      }
      await d.exitMode();

      // k. Select them from another object: the active object has none, the first selected object with customised supports takes over.
      await page.setInputFiles('.drop input[type=file]', FIXTURE);
      await page.waitForFunction(() => document.querySelector('footer')?.innerText.includes('2 objects'), null, { timeout: 60000 });
      await d.settled();
      await d.button('Select all').click();
      await d.idle(500);
      const beforeSelectThem = await d.props();
      await page.locator('.shape-band button').click();
      await d.idle(1500);
      const afterSelectThem = await d.props();
      const selectStatus = await d.status();
      check('k Select them with the active object bare switches to the first object with customised supports',
        beforeSelectThem.active !== beforeSelectThem.first && afterSelectThem.active === afterSelectThem.first && afterSelectThem.selected === chosen.selected && new RegExp(`^${chosen.selected} customised supports selected on .+\.$`).test(selectStatus),
        `active was ${beforeSelectThem.active === beforeSelectThem.first ? 'first' : 'second'}, now ${afterSelectThem.active === afterSelectThem.first ? 'first' : 'second'}, selected ${afterSelectThem.selected} of ${chosen.selected}, status "${selectStatus}"`);
      await d.exitMode();
      for (let step = 0; step < 8 && !(await d.footer()).includes('1 object'); step += 1) {
        await page.keyboard.press('Control+z');
        await d.idle(700);
      }
      check('k2 Undo takes the second object away again', (await d.footer()).includes('1 object') && (await d.props()).customised === chosen.selected, `footer ${(await d.footer()).includes('1 object') ? '1 object' : 'more objects'}, customised ${(await d.props()).customised}`);

      // a5. Drag over from Bottom view (the camera stays there, so it runs last).
      await d.enterDragOver();
      await d.button('Clear selection').click({ timeout: 3000 }).catch(() => {});
      await d.button('Bottom view').click();
      await d.idle(1500);
      const fromBelow = await d.strokeUntilSelected(1);
      check('a5 drag over from Bottom view picks up the tips it can see', fromBelow.selected > 0, `selected ${fromBelow.selected}`);
      await d.exitMode();

      // i. Save project, reload, Open it: the same work comes back; Open over objects is one Undo.
      // The delete here only adds to the removals; e has already made some, which is what i1 asserts. If no
      // stroke finds anything this late - the zone and the earlier deletes have taken a lot out - say so and
      // carry on rather than losing the save and open checks over it.
      await d.enterDragOver();
      try {
        await d.strokeUntilSelected();
        await d.settle();
        await page.keyboard.press('Delete');
        await d.settled();
      } catch {
        note('no stroke found supports to delete before the save; the earlier removals carry i1');
      }
      await d.exitMode();
      const projectStats = async () => ({ ...(await d.counts()), customised: (await d.props()).customised, zones: (await d.props()).zones });
      // The undos above can walk back into the zone painting from c, and i1 is about the saved file holding
      // every kind of hand edit. Paint one again if the undos took them all.
      if ((await d.props()).zones === 0) {
        const again = await d.paintZoneOnModel();
        await d.exitMode();
        note(`zones repainted before the save (${again} strokes landed, ${(await d.props()).zones} on the unit)`);
      }
      const leavePrompt = () => page.evaluate(() => { const event = new Event('beforeunload', { cancelable: true }); window.dispatchEvent(event); return event.defaultPrevented; });
      const before = await projectStats();
      check('i1 the work to save has every kind of hand edit', before.manual > 0 && before.removed > 0 && before.customised > 0 && before.zones > 0, JSON.stringify(before));
      const unsaved = await leavePrompt();
      const download = page.waitForEvent('download', { timeout: 120000 });
      await d.button('Save project').click();
      const projectFile = path.join(scratch, 'knot.mixodental');
      const saved = await download;
      await saved.saveAs(projectFile);
      await d.settled();
      const bytes = readFileSync(projectFile);
      const raw = gunzipSync(bytes);
      note(`project file ${saved.suggestedFilename()}: ${bytes.length} bytes gzip, ${raw.length} bytes plain`);
      const header = JSON.parse(raw.toString('utf8').slice(0, 200).replace(/,"scene".*$/s, '}'));
      check('i2 Save writes knot.mixodental with the format header, and the leave prompt follows it',
        saved.suggestedFilename() === 'knot.mixodental' && header.app === 'mixodental' && header.version === 1 && unsaved === true && (await leavePrompt()) === false && (await d.status()) === 'Saved knot.mixodental.',
        `file ${saved.suggestedFilename()}, header ${JSON.stringify(header)}, prompt before the save ${unsaved}, status "${await d.status()}"`);

      await page.goto(url);

      await enterEditor(page);
      await d.idle(1500);
      await page.evaluate(() => {
        window.__longTasks = [];
        new PerformanceObserver((list) => { for (const entry of list.getEntries()) window.__longTasks.push(Math.round(entry.duration)); }).observe({ type: 'longtask', buffered: false });
      });
      const chooser = page.waitForEvent('filechooser');
      await d.button('Open project').click();
      await (await chooser).setFiles(projectFile);
      await page.waitForFunction(() => /[1-9][\d,]* automatic/.test(document.querySelector('footer')?.innerText ?? ''), null, { timeout: 120000 });
      await d.settled();
      note(`Open project main-thread long tasks (ms): ${JSON.stringify(await page.evaluate(() => window.__longTasks))}`);
      const after = await projectStats();
      check('i3 Open after a reload: automatic, manual, removed, customised and zones are identical', JSON.stringify(after) === JSON.stringify(before), `before ${JSON.stringify(before)}, after ${JSON.stringify(after)}`);
      check('i4 a freshly opened project has nothing unsaved', (await leavePrompt()) === false && (await d.status()) === 'Opened knot.mixodental.', `status "${await d.status()}"`);

      await page.goto(url);

      await enterEditor(page);
      await page.setInputFiles('.drop input[type=file]', FIXTURE);
      await page.waitForFunction(() => document.body.innerText.includes('knot'), null, { timeout: 60000 });
      await d.settled();
      const chooser2 = page.waitForEvent('filechooser');
      await d.button('Open project').click();
      await (await chooser2).setFiles(projectFile);
      await page.waitForFunction(() => document.querySelector('.undo-toast'), null, { timeout: 120000 });
      // The toast counts down 6 s; hold it with the pointer while the plate settles. A slow machine outlasts
      // it, and then there is nothing left to hover: that is not a failure, it is the toast doing its job, and
      // the Undo below already falls back to the keyboard. Tolerated here exactly as it is tolerated there.
      await page.locator('.undo-toast').hover({ timeout: 5000 }).catch(() => {});
      await d.settled();
      const over = await projectStats();
      await page.locator('.undo-toast').hover().catch(() => {});
      const byToast = await page.locator('.undo-toast button').click({ timeout: 5000 }).then(() => true).catch(() => false);
      if (!byToast) {
        note('the Undo toast counted out while the plate settled; undoing with the keyboard instead');
        await page.keyboard.press('Control+z');
      }
      await d.settled();
      const undoneOpen = await projectStats();
      check('i5 Open over an object offers Undo, and Undo restores the plate as it was',
        over.auto === before.auto && undoneOpen.auto === 0 && undoneOpen.manual === 0 && undoneOpen.zones === 0 && (await page.locator('footer').innerText()).includes('1 object'),
        `opened ${JSON.stringify(over)}, after Undo ${JSON.stringify(undoneOpen)}`);

      const wrong = path.join(scratch, 'wrong.mixodental');
      writeFileSync(wrong, JSON.stringify({ app: 'mixodental', version: 99, scene: { units: [], selectedUnitIds: [] } }));
      const chooser3 = page.waitForEvent('filechooser');
      await d.button('Open project').click();
      await (await chooser3).setFiles(wrong);
      await d.idle(1000);
      check('i6 a newer file is refused with a message and the plate stays', /newer version/.test(await d.status()) && (await page.locator('footer').innerText()).includes('1 object'), `status "${await d.status()}"`);

    }

    // m. A drop of several files where one is bad: its own section, so it can be re-run in a minute.
    if (runs('m')) {
      /*
       * ONE BAD FILE IN A DROP IS ITS OWN FAILURE, NOT THE DROP'S. The read loop used to sit in a
       * single try, so any refusal aborted the whole drop and added NOTHING - throwing away the files
       * that were fine because one was not. With a single file that is the same behaviour; with a case
       * of several it is the thing a per-file row cannot be built on.
       *
       * NO `quiet()` HERE. It waits for the activity list to hide, and after a deliberate failure that
       * list is SUPPOSED to keep the failure visible - waiting for it to go away timed this check out
       * at 300 s the first time, which was the check being wrong and not the app.
       */
      await page.goto(url);
      await enterEditor(page);
      const halfGood = path.join(scratch, 'half-good.stl');
      writeFileSync(halfGood, 'solid x\nthis is not a mesh\n');
      await page.setInputFiles('.drop input[type=file]', [FIXTURE, halfGood, FIXTURE]);
      await page.waitForFunction(() => /2 objects/.test(document.querySelector('footer')?.innerText ?? ''), null, { timeout: 180000 }).catch(() => {});
      await d.idle(2000);
      const mixedDrop = await d.props();
      check('m1 one damaged file in a drop of three refuses only itself: the other two import',
        mixedDrop.units.length === 2 && /half-good/.test(await d.status()),
        `units ${mixedDrop.units.length}, status "${await d.status()}"`);

      /*
       * THE ITEMS PAGE. A drop of several models on the Drop page must yield one ROW PER FILE, which is
       * the thing two separate bugs used to prevent: `StartScreen` took `files.find(isStl)` and threw
       * the rest away, and `importFiles` sliced a drop to one file whenever Step 1 was waiting. Either
       * one alone made a five-file drop indistinguishable from a one-file drop.
       */
      await page.goto(url);
      // The Drop page has to be mounted before a synthetic drop has anything to dispatch on: the
      // first version of this went straight from `goto` to `evaluate` and read `null.dispatchEvent`.
      await page.waitForSelector('.start-screen', { timeout: 60000 });
      const dropModels = (names) => page.evaluate(({ files }) => {
        const transfer = new DataTransfer();
        for (const file of files) transfer.items.add(new File([file.text], file.name));
        document.querySelector('.start-screen').dispatchEvent(new DragEvent('drop', { dataTransfer: transfer, bubbles: true, cancelable: true }));
      }, { files: names });
      const cube = cubeStl();
      await dropModels([{ name: 'one.stl', text: cube }, { name: 'two.stl', text: cube }, { name: 'three.stl', text: cube }]);
      /*
       * SEVERAL FILES WAIT FOR THE PURPOSE. A multi-file drop used to import immediately and ask
       * nothing, which cannot work: `dentalOrient` takes the profile as an ARGUMENT, so there is
       * nothing to detect against until the purpose is answered. One file still goes straight in on
       * the default aligner type - that is the fast path, and the ordinary single-aligner case.
       */
      check('m1b several dropped files wait on the Drop page and say how many',
        await page.locator('[data-ui="start-held"]').isVisible()
        && /3 files ready/.test(await page.locator('[data-ui="start-held"]').innerText())
        && (await page.locator('.items-page').count()) === 0,
        `held "${await page.locator('[data-ui="start-held"]').innerText().catch(() => 'absent')}", items page ${await page.locator('.items-page').count()}`);
      await page.getByRole('button', { name: 'Aligner', exact: true }).click();
      // The rows exist only AFTER the purpose press: that press is what starts the import.
      const rows = await page.waitForFunction(() => document.querySelectorAll('.items-row').length === 3, null, { timeout: 180000 })
        .then(() => true, () => false);
      check('m2 a drop of three models on the Drop page gives three rows, not one',
        rows, `rows ${await page.locator('.items-row').count()}`);
      check('m3 every row is named for its unit, so removing one cannot re-point the others',
        (await page.locator('.items-row[data-ui^="items-row-unit-"]').count()) === 3
        && (await page.locator('[data-ui^="items-preview-unit-"]').count()) === 3,
        `named rows ${await page.locator('.items-row[data-ui^="items-row-unit-"]').count()}`);
      /*
       * EVERY row, and the triangle count too. This read `.first()` only - so two rows could have
       * shown nothing and it would have passed - and it never checked the triangle count although
       * its own name claimed to. The three cubes are identical, so every row must read the same.
       */
      const previews = await page.locator('.items-row .preview').allInnerTexts();
      check('m4 every row carries its own triangle count and size, and the page says how many are left',
        previews.length === 3
        && previews.every((text) => /\d+ triangles/.test(text) && /\d+ × \d+ × \d+ mm/.test(text))
        && new Set(previews).size === 1
        && /3 items left/.test(await page.locator('.items-left').innerText()),
        `${JSON.stringify(previews)} / ${await page.locator('.items-left').innerText()}`);
      /*
       * THE BATCH RUNS, ROW BY ROW. One `dentalOrient` per row once the purpose is pressed - it takes
       * the profile as an argument, which is why the purpose had to come first. Cubes have no rim, so
       * every row here settles on "No rim found", and what this proves is that each row got its OWN
       * answer rather than one imposed on the list.
       */
      const detected = await page.waitForFunction(
        () => [...document.querySelectorAll('[data-ui^="items-detect-"]')].filter((node) => (node.textContent ?? '').trim().length > 0).length === 3,
        null, { timeout: 240000 }).then(() => true, () => false);
      const lines = await page.locator('[data-ui^="items-detect-"]').allInnerTexts();
      check('m4b the batch gives every row its own orientation result',
        detected && lines.length === 3 && lines.every((text) => /No rim found/.test(text)),
        `detect lines ${JSON.stringify(lines)}; rows ${await page.locator('.items-row').count()}, unit rows ${await page.locator('.items-row:not(.items-row--refused)').count()}, detect spans ${await page.locator('[data-ui^="items-detect-"]').count()}, names ${JSON.stringify(await page.locator('.items-row .name').allInnerTexts())}`);

      /*
       * EVERY ROW GETS A PICTURE, AND THE MODEL IS IN IT. The pictures are drawn one row per task, so
       * the wait is for all three rather than for the first.
       *
       * "A picture exists" would be a weak check: an empty frame renders a perfectly valid PNG of the
       * paper background. So this reads the pixels back - the CENTRE of each picture against its
       * CORNER. The corner is background; the centre is the cube. If they match, nothing was drawn,
       * whatever the data URL says.
       */
      const drawn = await page.waitForFunction(
        () => [...document.querySelectorAll('[data-ui^="items-shot-unit-"] img')].filter((node) => (node.getAttribute('src') ?? '').startsWith('data:image/png')).length === 3,
        null, { timeout: 240000 }).then(() => true, () => false);
      const shots = drawn ? await page.evaluate(async () => {
        const read = (source) => new Promise((resolve) => {
          const image = new Image();
          image.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = canvas.height = image.naturalWidth;
            // `willReadFrequently`, because this reads pixels straight back and Chrome warns about
            // exactly that - a warning check `h` would report as if the APP had logged it.
            const context = canvas.getContext('2d', { willReadFrequently: true });
            context.drawImage(image, 0, 0);
            const at = (x, y) => [...context.getImageData(x, y, 1, 1).data].slice(0, 3).join(',');
            resolve({ size: image.naturalWidth, corner: at(2, 2), centre: at(Math.floor(image.naturalWidth / 2), Math.floor(image.naturalWidth / 2)) });
          };
          image.onerror = () => resolve({ size: 0, corner: '', centre: '' });
          image.src = source;
        });
        return Promise.all([...document.querySelectorAll('[data-ui^="items-shot-unit-"] img')].map((node) => read(node.getAttribute('src'))));
      }) : [];
      check('m4c every row carries its own drawn picture, with the model actually in it',
        drawn && shots.length === 3 && shots.every((shot) => shot.size > 0 && shot.centre !== shot.corner),
        `shots ${JSON.stringify(shots)}`);

      /*
       * THE RAIL IS ON THE DECK, AND IT TEACHES THE ORDER — by what is pressable and by the ONE line
       * underneath, rather than by three complaints at once.
       *
       * THIS CHECK USED TO ASSERT THE OPPOSITE, AND IT PASSED BECAUSE OF A BUG. It read "three fresh
       * cubes: nothing is oriented, so Orient is the only tool open and the other three are greyed".
       * But it runs AFTER `m4b`, which waits for the batch to finish all three rows — so these cubes
       * have been through detection and came back "No rim found". Nothing was fresh. It passed only
       * because `oriented` was read off `revisions.orient`, which the batch never writes, so every
       * row the batch had just oriented still reported as unoriented. A review found that; the rail
       * was telling the operator to turn a model it had already turned.
       *
       * SO THE HONEST EXPECTATION AFTER THE BATCH IS: Orient open, and **Rim open too** — the flow's
       * own answer to "no rim found" is to hand over to rim drawing, so greying Rim here would
       * withhold the one tool the operator is being sent to. Area and Supports stay greyed, because
       * the area really is measured from a rim that does not exist yet.
       *
       * The reason line is asserted as the AREA's sentence rather than as "two words", because the
       * property worth pinning is WHICH tool is the next thing to do — the first unavailable one.
       */
      const railOpen = await page.locator('[data-ui="tool-orient"]').isDisabled();
      const railRim = await page.locator('[data-ui="tool-rim"]').isDisabled();
      const railBlocked = await Promise.all(['area', 'supports'].map((tool) => page.locator(`[data-ui="tool-${tool}"]`).isDisabled()));
      const railReason = await page.locator('[data-ui="tool-reason"]').innerText().catch(() => '');
      check('m4d the rail opens what the batch unlocked, greys what is not reachable yet, and names the one next thing',
        railOpen === false && railRim === false && railBlocked.every((blocked) => blocked === true)
        && /The area is measured from the rim, so draw the rim first\./.test(railReason),
        `orient disabled ${railOpen}, rim disabled ${railRim}, area+supports ${JSON.stringify(railBlocked)}, reason ${JSON.stringify(railReason)}`);

      /*
       * THE RAIL IS DOWN THE LEFT, with the models beside it. Checked as geometry rather than by
       * class name: what matters is that the rail sits clear to the LEFT of the list and shares its
       * top, which is what the design asks for and what a stray `display: block` would undo
       * silently.
       */
      const boxes = await page.evaluate(() => {
        const rail = document.querySelector('.tool-rail')?.getBoundingClientRect();
        const list = document.querySelector('.items-list')?.getBoundingClientRect();
        return rail && list
          ? { railRight: Math.round(rail.right), listLeft: Math.round(list.left), railWidth: Math.round(rail.width), sameBand: Math.abs(rail.top - list.top) < 40 }
          : undefined;
      });
      check('m4e the rail sits down the left with the models beside it, not under them',
        boxes !== undefined && boxes.railWidth > 40 && boxes.railRight <= boxes.listLeft && boxes.sameBand,
        `boxes ${JSON.stringify(boxes)}`);

      /*
       * START SAYS WHICH ROW IT WILL OPEN, and opens that one. It used to open the first UNFINISHED
       * row whatever was highlighted, with a label that said "the first item" either way - and with
       * the rail's buttons inert, that made rows reachable only in list order: a flagged row in the
       * middle of a case could not be opened until every row above it was finished or removed.
       *
       * The label is the cheap half of the check and it is the one that would have caught it: no
       * navigation, no detection, just the press's own scope stated on the press.
       */
      const startLabelFirst = await page.locator('[data-ui="items-start"]').innerText();
      await page.locator('.items-row').nth(1).click();
      await d.idle(300);
      const startLabelPicked = await page.locator('[data-ui="items-start"]').innerText();
      check('m4f Start names what it will open, and a chosen row is what it opens',
        /first/i.test(startLabelFirst) && !/first/i.test(startLabelPicked) && startLabelPicked.trim().length > 0,
        `label with nothing chosen ${JSON.stringify(startLabelFirst)}, with row 2 chosen ${JSON.stringify(startLabelPicked)}`);

      // Remove takes one row off and leaves the rest; the count follows the same rule the press does.
      await page.locator('.items-row .remove').first().click();
      await d.idle(500);
      check('m5 Remove takes off one row and the count follows',
        (await page.locator('.items-row').count()) === 2 && /2 items left/.test(await page.locator('.items-left').innerText()),
        `rows ${await page.locator('.items-row').count()}, ${await page.locator('.items-left').innerText()}`);

      /*
       * STARTING A ROW READS THAT ROW. The press used to `return` before `startDentalAligner`, and
       * nothing else starts the read - the auto-start effect fires only on a profile CHANGE while
       * already loading. So the operator arrived at Step 1's "choose a file" prompt with the row's
       * model already on the plate, and the way on was a different control entirely.
       *
       * Asserting the ABSENCE of the prompt is the point: the badge said "Step 1" in both the broken
       * and the fixed app, so a check that read only the badge would have passed throughout.
       */
      await page.locator('[data-ui="items-start"]').click();
      await page.waitForFunction(() => /Step 1/.test(document.querySelector('.edit-badge')?.textContent ?? ''), null, { timeout: 30000 });
      const askedForFile = await page.getByText('Place the aligner file here').count();
      check('m5b Start opens the row and reads it, rather than asking for a file already on the plate',
        askedForFile === 0, `"choose a file" prompts on screen ${askedForFile}`);

      /*
       * A DROP WHERE EVERY FILE IS REFUSED MUST NOT OPEN AN EMPTY PAGE. It used to: the switch was
       * unconditional, the auto-escape only fires when the unit count falls FROM above zero, and the
       * page had no Back - so the operator was stranded on a blank list. Two guards now, and this
       * checks the first: nothing arrived, so the Drop page stays.
       */
      await page.goto(url);
      await page.waitForSelector('.start-screen');
      await dropModels([{ name: 'bad-one.stl', text: 'solid x\nnot a mesh\n' }, { name: 'bad-two.stl', text: 'solid y\nalso not\n' }]);
      await d.idle(2500);
      /*
       * REWRITTEN, because the behaviour it asserted was right only while a refused file had nowhere
       * to go. It used to demand that an all-refused drop STAY on the Drop page - the fix for landing
       * on a BLANK list. Refused files are rows now, so the list is not blank: it names every file
       * that failed, which is the thing an operator dropping eight actually needs.
       */
      await page.getByRole('button', { name: 'Aligner', exact: true }).click();
      await page.waitForSelector('.items-page', { timeout: 60000 });
      const allRefused = await page.locator('.items-row--refused').allInnerTexts();
      check('m6 a drop where every file is refused opens the list and names them all',
        allRefused.length === 2 && allRefused.every((text) => /[Cc]ould not be read/.test(text))
        && (await page.locator('.items-row:not(.items-row--refused)').count()) === 0
        && (await page.locator('[data-ui="items-back"]').count()) === 1,
        `refused ${JSON.stringify(allRefused)}, good ${await page.locator('.items-row:not(.items-row--refused)').count()}`);
      /*
       * And the second guard: the page always has a way out. TWO files, because ONE goes straight
       * into the flow and never reaches the list - the first version of this check dropped one, found
       * no page, and passed through its own escape clause. A check that passes when the thing it
       * examines is absent examines nothing.
       */
      await page.goto(url);
      await page.waitForSelector('.start-screen', { timeout: 60000 });
      await dropModels([{ name: 'good-a.stl', text: cube }, { name: 'good-b.stl', text: cube }]);
      await page.getByRole('button', { name: 'Aligner', exact: true }).click();
      await page.waitForSelector('.items-page', { timeout: 180000 });
      check('m7 the Items page always offers a way back',
        (await page.locator('[data-ui="items-back"]').count()) === 1,
        `rows ${JSON.stringify(await page.locator('.items-row .name').allInnerTexts())}, back ${await page.locator('[data-ui="items-back"]').count()}`);

      /*
       * A REFUSED FILE IS A ROW, naming WHICH one failed. The status line can say only one thing, so a
       * drop of eight with two bad files named one and lost the other. `verdictOfRefusal` had no
       * production caller before this, which is why two of the five row sentences were text for rows
       * that could not exist.
       */
      // Back to Drop first: m6 left the Items page up, and `dropModels` dispatches onto `.start-screen`.
      await page.goto(url);
      await page.waitForSelector('.start-screen', { timeout: 60000 });
      await dropModels([
        { name: 'fine-a.stl', text: cube },
        { name: 'broken.stl', text: 'solid x\nnot a mesh\n' },
        { name: 'fine-b.stl', text: cube },
      ]);
      await page.getByRole('button', { name: 'Aligner', exact: true }).click();
      await page.waitForSelector('.items-page', { timeout: 180000 });
      await d.idle(1500);
      const refusedRows = await page.locator('.items-row--refused').allInnerTexts();
      check('m8 a bad file among good ones is a row that names it, beside the two that imported',
        refusedRows.length === 1 && /broken\.stl/.test(refusedRows[0] ?? '')
        && /[Cc]ould not be read/.test(refusedRows[0] ?? '')
        && (await page.locator('.items-row:not(.items-row--refused)').count()) === 2,
        `refused ${JSON.stringify(refusedRows)}, good rows ${await page.locator('.items-row:not(.items-row--refused)').count()}`);

      /*
       * A RAIL PRESS DOES SOMETHING. Until 2026-11-09 `ToolRail` destructured `onPick` and never
       * called it, and its buttons carried no `onClick`: four tools drawn in four states, none of
       * them pressable, while `src/deck/README.md` said pressing one works. Two document reviews,
       * two readings of that file and a long subagent audit all missed it; `noUnusedParameters`
       * named it in one line, which is why that flag is now on.
       *
       * The press opens the MODEL at the start of its flow - what the call site passes and what the
       * README describes. Opening the pressed TOOL is per-tool entry, and is not built.
       *
       * LAST IN THE SECTION on purpose. It navigates off the deck, and an earlier attempt sat in the
       * middle and tried to come back with Back: that click timed out and took the twelve checks
       * below it with it. A check whose own cleanup can fail is worse than no check. Here the deck
       * m8 left up is all it needs, and nothing after it wants the deck back.
       */
      await page.locator('[data-ui="tool-orient"]').click();
      const railOpened = await page.waitForFunction(() => /Step 1/.test(document.querySelector('.edit-badge')?.textContent ?? ''), null, { timeout: 30000 })
        .then(() => true, () => false);
      /*
       * WHAT THIS CHECK PROVES, AND WHAT IT DOES NOT. It proves the press REACHES the flow, which is
       * the whole of the defect: the button had no handler, so it did nothing at all.
       *
       * It does NOT prove the row's model was read. Two attempts to make it do so both failed and the
       * reason is worth keeping: the badge reads "Step 1" as soon as the dock mounts, before the model
       * is handed over, so the badge text at that instant is not evidence either way - and waiting for
       * the jobs to settle instead (`d.quiet()`) hung for its full five minutes, because pressing
       * Orient on a CUBE starts a detection that ends in rim-define rather than a quiet queue.
       *
       * `m5b` already proves the read, through `startItem`, which is the same function this press
       * calls. One check per claim; this one does not borrow the other's.
       */
      check('m9 a rail press reaches the flow, rather than doing nothing at all',
        railOpened, `reached Step 1: ${railOpened}`);

      /*
       * THE PRESSED TOOL IS WHAT OPENS (increment E4), and only this check can tell the difference.
       *
       * W-02 had two halves. The buttons had no handler at all - `m9` covers that - and `ItemsPage`
       * then THREW THE TOOL ARGUMENT AWAY, so all four buttons did the one thing: open the model at
       * Step 1. `m9` passes either way, because Orient's own entry IS Step 1. Rim is the button that
       * can tell them apart.
       *
       * These rows are cubes, so the batch came back "No rim found. Draw one to continue." - the
       * state Step 1 answers by handing over to rim drawing. Pressing Rim therefore has a right
       * answer that is NOT Step 1: the rim panel, reached without running `dentalOrient` a second
       * time to be told what the row already says.
       *
       * `rim-why` is the assertion rather than the badge, for the reason `m5b` records about Step 1's
       * prompt: the badge is written as soon as the dock mounts, so its text at that instant is not
       * evidence either way. The panel's own line is only there in rim stage.
       */
      await page.goto(url);
      await page.waitForSelector('.start-screen', { timeout: 60000 });
      await dropModels([{ name: 'rim-one.stl', text: cube }, { name: 'rim-two.stl', text: cube }]);
      await page.getByRole('button', { name: 'Aligner', exact: true }).click();
      await page.waitForFunction(() => document.querySelectorAll('.items-row').length === 2, null, { timeout: 180000 });
      // The rail's Rim is only pressable once the batch has answered for the row it is showing.
      await page.waitForFunction(
        () => [...document.querySelectorAll('[data-ui^="items-detect-"]')].filter((node) => /No rim found/.test(node.textContent ?? '')).length === 2,
        null, { timeout: 240000 }).catch(() => {});
      const rimHint = await page.locator('[data-ui="tool-rim"]').getAttribute('title')
        ?? await page.locator('[data-ui="tool-rim"]').getAttribute('aria-label');
      await page.locator('[data-ui="tool-rim"]').click();
      const inRim = await page.waitForSelector('[data-ui="rim-why"]', { timeout: 60000 }).then(() => true, () => false);
      check('m10 Rim on a row the detector flagged opens rim drawing, not Step 1 over again',
        inRim && (await page.getByText('Place the aligner file here').count()) === 0,
        `rim panel ${inRim}, badge ${JSON.stringify((await page.locator('.edit-badge').textContent().catch(() => '')) ?? '')}, hint ${JSON.stringify(rimHint ?? '')}, file prompts ${await page.getByText('Place the aligner file here').count()}`);
    }

    /*
     * q. FAULT INJECTION: G2 (replay) and G4 (two actors on one scarce resource).
     *
     * WHY THIS SECTION EXISTS. `docs/reviews/2026-11-09-wiring-walk-dental-flow.md` mapped every
     * connection of the deck -> flow -> deck journeys and then graded every gap-register row READ.
     * A register where every row is READ is a code review, by that doctrine's own rule, and these
     * are the two faults its own "what runs next" named as the floor. They are run here through the
     * FRONT DOOR - the file input, the purpose button, the row's own controls - because a fault
     * injected through an internal call proves the function and not the wiring.
     *
     * THE ONLY TWO ACCEPTABLE OUTCOMES, for every check below: the system recovers by itself to a
     * state every observer agrees on, or the problem is on the operator's screen in words they can
     * act on. A silent wrong state passes neither, and a status line the next message replaces is
     * not a screen - q2 is exactly that case.
     *
     * ONE CHECK PER CLAIM. q1 asks whether the ledger admitted one; q2 asks whether the loser is
     * still accountable afterwards. The first can pass while the second fails, which is the whole
     * reason they are not one check.
     */
    if (runs('q')) {
      const qCube = cubeStl();
      const dropOnStart = (names) => page.evaluate(({ files }) => {
        const transfer = new DataTransfer();
        for (const file of files) transfer.items.add(new File([file.text], file.name));
        document.querySelector('.start-screen').dispatchEvent(new DragEvent('drop', { dataTransfer: transfer, bubbles: true, cancelable: true }));
      }, { files: names });
      /** Three cubes on the deck, ready for a replay to be aimed at. */
      const threeRowDeck = async () => {
        await page.goto(url);
        await page.waitForSelector('.start-screen', { timeout: 60000 });
        await dropOnStart([{ name: 'q-one.stl', text: qCube }, { name: 'q-two.stl', text: qCube }, { name: 'q-three.stl', text: qCube }]);
        await page.getByRole('button', { name: 'Aligner', exact: true }).click();
        await page.waitForFunction(() => document.querySelectorAll('.items-row').length === 3, null, { timeout: 180000 });
      };

      /*
       * G4.1 - TWO ACTORS ON THE PLATE QUOTA. The plate holds at most the runtime's refusal limit
       * (6M triangles, `host/core/budget.refusalLimit`), and `src/core/plateLedger.ts` exists so
       * that two imports in flight count each other rather than each believing the plate has room.
       * Its own unit test proves the CLASS; this proves the CONNECTION, which is a different claim:
       * the ledger is only reached if `useImportFiles` opens a reservation and holds on it before
       * it parses, and only the front door shows whether it does.
       *
       * THE FIXTURE IS TWO COPIES OF ONE 3.19M-TRIANGLE MESH. Each alone fits (3.19M < 6M); the
       * pair does not (6.39M > 6M). The refusal is decided from the binary STL's 84-byte header
       * before a single triangle is parsed, so the loser costs nothing and only the winner pays for
       * a read - which is what makes a 6M-triangle fault injection affordable at all.
       *
       * TWO `setInputFiles` CALLS, NOT ONE WITH TWO FILES. One call with both files is a single
       * drop: it shares one reservation, and a file that is refused never raises what the drop is
       * holding - so the two files would not contend and the check would prove nothing. Playwright
       * resolves `setInputFiles` when the change event is dispatched, not when the app has
       * finished, so the second drop starts while the first is still inside its first await. That
       * is two actors on one ledger, which is the fault.
       */
      if (probes('q1')) {
      const heavy = heavyPlateFixture();
      await page.goto(url);
      await enterEditor(page);
      await page.setInputFiles('.drop input[type=file]', [heavy]);
      await page.setInputFiles('.drop input[type=file]', [heavy]);
      /*
       * The loser's sentence is caught WHILE IT IS ON SCREEN. The winner's own success line
       * replaces it when its read finishes half a minute later, so a check that read the status
       * only at the end would record the refusal as never having been said. Catching it here and
       * reading it again at the end is what lets q1 and q2 disagree.
       */
      const refusalSaid = await page.waitForFunction(() => {
        const line = document.querySelector('footer strong')?.innerText ?? '';
        return /plate would hold/i.test(line) ? line : false;
      }, null, { timeout: 180000 }).then((handle) => handle.jsonValue(), () => '');
      await page.waitForFunction(() => /\b1 object\b/.test(document.querySelector('footer')?.innerText ?? ''), null, { timeout: 420000 }).catch(() => {});
      await d.idle(2500);
      const racedPlate = await d.props();
      const racedFooter = await d.footer();
      const racedStatus = await d.status();
      check('q1 G4 two drops in flight on one plate quota admit exactly one, and the loser is refused in words',
        racedPlate.units.length === 1 && /plate would hold/i.test(refusalSaid),
        `units on the plate ${racedPlate.units.length}, footer ${JSON.stringify((racedFooter.split('\n')[0] ?? '').trim())}, the refusal said ${JSON.stringify(refusalSaid)}`);
      /*
       * G4.1, SECOND CLAIM: IS THE LOSER STILL ACCOUNTABLE? The operator dropped two files and one
       * of them is not on the plate. A refusal that lived in the status line until the winner's
       * success replaced it leaves them with one object, a cheerful sentence, and no way to learn
       * that the second drop was refused or why. This is W-05's class reached from the import side:
       * the refusal reaches a line the next message overwrites, with no flag on anything that
       * stays.
       */
      const loserFlagged = await page.evaluate(() => ({
        refusalOnScreen: /plate would hold|was refused|could not be added/i.test(document.body.innerText),
        alerts: [...document.querySelectorAll('[role="alert"]')].map((node) => (node.textContent ?? '').trim()),
      }));
      check('q2 G4 the refused drop is still accountable once the plate has settled',
        loserFlagged.refusalOnScreen || loserFlagged.alerts.length > 0,
        `status now ${JSON.stringify(racedStatus)}, refusal still on screen ${loserFlagged.refusalOnScreen}, alerts ${JSON.stringify(loserFlagged.alerts)}`);
      }


      /*
       * G2.1 - THE PURPOSE PRESSED TWICE. The purpose press is what starts the import of a held
       * batch (`startDental` / `batchProfile`), so it is the deck journey's one replayable request:
       * a double click, a key repeat, or an impatient operator sends it twice. Exactly one effect
       * at every observer means three files give three rows, whatever the press count.
       *
       * Both presses go out in ONE `page.evaluate`, so they land in the same tick - two Playwright
       * clicks would be two tasks with a render between them, which is a different and weaker
       * fault.
       */
      if (probes('q3')) {
      await page.goto(url);
      await page.waitForSelector('.start-screen', { timeout: 60000 });
      await dropOnStart([{ name: 'r-one.stl', text: qCube }, { name: 'r-two.stl', text: qCube }, { name: 'r-three.stl', text: qCube }]);
      await page.waitForSelector('[data-ui="start-held"]', { timeout: 60000 });
      /*
       * BOTH PRESSES IN ONE TICK, through the element Playwright itself resolves. The first version
       * of this hunted for a button whose textContent was exactly "Aligner" and found none - the
       * purpose keys carry more than their label - so it reported `presses 0` and failed a check
       * about the app on a fault in the check. The count is returned and asserted for exactly that
       * reason: a replay test that never replayed is a vacuous pass, and it has to be able to say so.
       */
      const purposeKey = await page.getByRole('button', { name: 'Aligner', exact: true }).elementHandle();
      const pressedTwice = purposeKey ? await purposeKey.evaluate((node) => { node.click(); node.click(); return 2; }) : 0;
      await page.waitForFunction(() => document.querySelectorAll('.items-row').length >= 3, null, { timeout: 180000 }).catch(() => {});
      await d.idle(3000);
      const replayRows = await page.locator('.items-row').count();
      const replayNames = await page.locator('.items-row .name').allInnerTexts();
      check('q3 G2 the purpose pressed twice imports the held files once',
        pressedTwice === 2 && replayRows === 3 && new Set(replayNames).size === replayNames.length,
        `presses ${pressedTwice}, rows ${replayRows}, names ${JSON.stringify(replayNames)}`);
      }


      /*
       * G2.2 - REMOVE PRESSED TWICE ON ONE ROW. A destructive command replayed in one tick, and the
       * sharpest version of it: the second press lands on a DOM node the first press is about to
       * re-render. If the handler closed over a row INDEX, the replay takes the neighbour as well,
       * and the operator loses a row they never pointed at. `m3` proves every row is named for its
       * unit; this proves the press is too, which is the same rule one layer down.
       */
      if (probes('q4')) {
      await threeRowDeck();
      const beforeRemove = await page.locator('.items-row .name').allInnerTexts();
      await page.evaluate(() => {
        const remove = document.querySelectorAll('.items-row')[1]?.querySelector('.remove');
        remove?.click();
        remove?.click();
      });
      await d.idle(1500);
      const afterRemove = await page.locator('.items-row .name').allInnerTexts();
      const expectedAfterRemove = beforeRemove.filter((_, at) => at !== 1);
      check('q4 G2 Remove pressed twice in one tick takes off one row, not the neighbour as well',
        afterRemove.length === 2 && afterRemove.join('|') === expectedAfterRemove.join('|'),
        `was ${JSON.stringify(beforeRemove)}, now ${JSON.stringify(afterRemove)}, expected ${JSON.stringify(expectedAfterRemove)}`);
      }


      /*
       * G2.3 - A WORKER REPLY DELIVERED TWICE. The analysis worker's reply is the batch's and the
       * flow's only channel inward, and a duplicate message is the plainest thing a channel can do
       * wrong. `window.__replayWorker` re-dispatches every reply from the named worker a second
       * time WITHOUT swallowing the first, so each job settles and is then told again that it has
       * settled. Exactly one effect means three rows still carry three sentences and nothing on the
       * page throws.
       *
       * The console is read here rather than left to section `h`: `h` runs at the end of the whole
       * walk and would attribute a throw to whatever ran last. One check per claim.
       */
      if (probes('q5')) {
      const replayErrors = [];
      const onConsole = (message) => { if (message.type() === 'error') replayErrors.push(message.text()); };
      const onPageError = (error) => replayErrors.push(String(error));
      page.on('console', onConsole);
      page.on('pageerror', onPageError);
      await page.goto(url);
      await page.waitForSelector('.start-screen', { timeout: 60000 });
      await page.evaluate(() => { window.__replayWorker = 'analysisWorker'; });
      await dropOnStart([{ name: 'w-one.stl', text: qCube }, { name: 'w-two.stl', text: qCube }, { name: 'w-three.stl', text: qCube }]);
      await page.getByRole('button', { name: 'Aligner', exact: true }).click();
      await page.waitForFunction(() => document.querySelectorAll('.items-row').length === 3, null, { timeout: 180000 }).catch(() => {});
      const replayedSettled = await page.waitForFunction(
        () => [...document.querySelectorAll('[data-ui^="items-detect-"]')].filter((node) => (node.textContent ?? '').trim().length > 0).length === 3,
        null, { timeout: 240000 }).then(() => true, () => false);
      await d.idle(2000);
      const replayedLines = await page.locator('[data-ui^="items-detect-"]').allInnerTexts();
      const replayCount = await page.evaluate(() => window.__replayed ?? 0);
      page.off('console', onConsole);
      page.off('pageerror', onPageError);
      await page.evaluate(() => { window.__replayWorker = ''; });
      check('q5 G2 every analysis reply delivered twice settles each row once and throws nothing',
        replayCount > 0 && replayedSettled && replayedLines.length === 3 && replayErrors.length === 0,
        `replies redelivered ${replayCount}, rows settled ${replayedSettled}, lines ${JSON.stringify(replayedLines)}, console errors ${JSON.stringify(replayErrors)}`);
      }


      /*
       * G4.2 - TWO ACTORS ON ONE UNIT. The scarce resource on the deck is not a quota, it is the
       * ROW: the list owns it and the flow is about to take it. Remove and Start are aimed at the
       * same unit in the same tick, which is the editor's form of two workers claiming one job
       * (`browser-walks.md` §12, "two writers edit one object in the same frame").
       *
       * EITHER OUTCOME IS A PASS, and saying so is the point: the flow may refuse and stay on the
       * deck, or it may open the row the list still has. What fails is landing on NEITHER - and that
       * is the assertion, not a list of the bad screens I could think of.
       *
       * THE FIRST VERSION OF THIS CHECK FAILED THAT WAY AND PASSED ANYWAY. It looked for one named
       * third outcome - Step 1 with the "choose a file" prompt - and the run came back `rows 0,
       * badge "", units 2, active ""`: the deck shut, no step opened, two models on the plate and
       * nothing selected. Green, on the exact dead end the check existed to find. So the assertion
       * is now the POSITIVE one: after the contest the operator is on the deck (it has rows) or in a
       * step (the badge says so). A check that enumerates the bad states can only find the bad
       * states its author imagined.
       */
      if (probes('q6')) {
      await threeRowDeck();
      await page.locator('.items-row').nth(1).click();
      await d.idle(500);
      const contestedName = (await page.locator('.items-row .name').allInnerTexts())[1] ?? '';
      await page.evaluate(() => {
        document.querySelectorAll('.items-row')[1]?.querySelector('.remove')?.click();
        document.querySelector('[data-ui="items-start"]')?.click();
      });
      await d.idle(3000);
      /*
       * WHAT THE OPERATOR CAN SEE, AND WHAT THE SESSION THINKS, in one read.
       *
       * The first fix for this failed because it was written from a guess about which state the app
       * lands in. `session` walks the react tree for the props carrying `dentalStage` - the same
       * trick `readProps` uses for the viewport - and `screen` is the first of what is actually on
       * the page. Diagnose from a probe, not from a reading of the source (S10).
       */
      const contested = await page.evaluate(() => {
        const root = document.getElementById('root');
        const key = Object.keys(root).find((k) => k.startsWith('__reactContainer'));
        const stack = [root[key].stateNode?.current ?? root[key]];
        let session;
        while (stack.length) {
          const fiber = stack.pop();
          if (!fiber) continue;
          const props = fiber.memoizedProps;
          if (props && typeof props === 'object') {
            for (const value of Object.values(props)) {
              if (value && typeof value === 'object' && 'dentalStage' in value && 'mode' in value) session ??= { mode: value.mode, stage: value.dentalStage, aligner: value.dentalAligner, unitId: value.dentalUnitId, finished: value.dentalFinished?.length };
            }
          }
          if (fiber.child) stack.push(fiber.child);
          if (fiber.sibling) stack.push(fiber.sibling);
        }
        return {
          badge: (document.querySelector('.edit-badge')?.textContent ?? '').trim(),
          rows: document.querySelectorAll('.items-row').length,
          deck: document.querySelectorAll('.items-page').length,
          asksForFile: /Place the aligner file here/.test(document.body.innerText),
          session: session ?? null,
          status: document.querySelector('footer strong')?.innerText ?? '',
        };
      });
      /*
       * THE DETAIL IS THE OPERATOR'S FACTS ONLY. It used to print `d.props().units.length` too, and
       * on a PASS that read "rows 2, units 0" - because `readProps` walks to the viewport's scene
       * prop and the viewport is not mounted while the deck is up. A reader would have taken it for
       * an empty plate. A number that means "the reader was not there" must not sit beside numbers
       * that mean what they say; the footer is where the plate's count belongs.
       */
      check('q6 G4 Remove and Start on one unit in one tick leave the operator on the deck or in a step',
        (contested.rows > 0 || /Step/.test(contested.badge)) && !contested.asksForFile,
        `contested row ${JSON.stringify(contestedName)}, badge ${JSON.stringify(contested.badge)}, rows ${contested.rows}, deck pages ${contested.deck}, asked for a file ${contested.asksForFile}, session ${JSON.stringify(contested.session)}, status ${JSON.stringify(contested.status)}`);
      }
      if (PROBES.size > 0) note(`fault injection filtered to ${[...PROBES].join(', ')} - not the whole section`);
    }

    /*
     * r. DELIBERATE FAULT INJECTION, SECOND PASS: G1 (a write rejected after an earlier one
     * committed), G3 (a reply before its predecessor), G5 (a dependency times out while the far side
     * succeeded) and G7 (the background job stops).
     *
     * These four stood as `UNPROVEN` in §6 of the wiring review for one reason: the walk's only
     * worker lever DELAYED a reply, and none of these faults is a delay. `window.__faultHold` and
     * `window.__faultDownload` (see `faultLevers` at the top of this file) are the missing
     * conditions, and this section is what they were built for.
     *
     * The two acceptable outcomes are §6's, unchanged: the system recovers by itself to a state every
     * observer agrees on, or the problem is on the operator's screen in words they can act on. A
     * status line the next message replaces is not a screen - W-05 and W-07 were both that.
     *
     * HOLDING EVERY ANALYSIS REPLY IS SAFE ON THIS JOURNEY, which is why the lever needs no filter
     * beyond the worker's name: the only analysis jobs a drop and a purpose press start are the
     * batch's orients and the flow's. Placement goes through the same worker but is only reached by
     * generating supports (`useRegenerate`) or the denture orient, neither of which happens here.
     */
    if (runs('r')) {
      const rCube = cubeStl();
      const rCup = cupStl();
      const rOpenCube = openCubeStl();
      const twoModels = [path.join(scratch, 'r-cube.stl'), path.join(scratch, 'r-cup.stl')];
      writeFileSync(twoModels[0], rCube);
      writeFileSync(twoModels[1], rCup);
      /**
       * Two models on the deck with their purpose chosen, and the detection about to run. The pair is
       * a parameter because G3 needs the two answers to DIFFER and the other probes do not care:
       * `[rAligner, rCube]` is a real aligner against a cube, which orient to visibly different
       * things, while a cube and a cup are seconds cheaper and enough for G5 and G7.
       *
       * `hold` is set AFTER the navigation on purpose: the lever script runs on every page load, so a
       * hold set before a `goto` is wiped by it - which cost one run to learn.
       */
      const twoRowDeck = async ({ hold = false, files = [{ name: 'r-cube.stl', text: rCube }, { name: 'r-cup.stl', text: rCup }] } = {}) => {
        await page.goto(url);
        await page.waitForSelector('.start-screen', { timeout: 60000 });
        if (hold) await page.evaluate(() => { window.__faultHold = 'analysisWorker'; });
        await page.evaluate(({ dropped }) => {
          const transfer = new DataTransfer();
          for (const file of dropped) transfer.items.add(new File([file.text], file.name));
          document.querySelector('.start-screen').dispatchEvent(new DragEvent('drop', { dataTransfer: transfer, bubbles: true, cancelable: true }));
        }, { dropped: files });
        await page.getByRole('button', { name: 'Aligner', exact: true }).click();
        await page.waitForFunction((count) => document.querySelectorAll('.items-row').length === count, files.length, { timeout: 180000 });
      };
      /** What the rows say about themselves, in row order: the deck's only answer per model. */
      const detectLines = () => page.locator('[data-ui^="items-detect-"]').allInnerTexts();
      /** The background-work list, which is the screen that REMEMBERS a failure (W-05, W-07). */
      const activityRows = () => page.evaluate(() => [...document.querySelectorAll('.job-activity .job-row')]
        .map((row) => `${row.dataset.state}: ${(row.textContent ?? '').trim()}`));
      /**
       * Every row carries a VERDICT, which is the terminal-state claim three probes make.
       *
       * It used to ask only for non-empty text, and r2 passed on the strength of it: with the lever
       * holding every answer, the rows read "Checking the orientation…" and "Waiting its turn…" -
       * both non-empty, so "settled" was true and "the two rows say different things" was true, and
       * the probe proved nothing about either. A pending sentence is the system saying it does not
       * know yet, and it must never satisfy a check about what it decided.
       */
      const PENDING = 'Checking the orientation|Waiting its turn';
      const allSettled = (count = 2, ms = 240000) => page.waitForFunction(({ count: want, pending }) => {
        const lines = [...document.querySelectorAll('[data-ui^="items-detect-"]')].map((node) => (node.textContent ?? '').trim());
        return lines.length === want && lines.every((line) => line.length > 0 && !new RegExp(pending, 'i').test(line));
      }, { count, pending: PENDING }, { timeout: ms }).then(() => true, () => false);

      /*
       * G1 - A WRITE REFUSED AFTER AN EARLIER ONE COMMITTED.
       *
       * "Each object with model" plans ONE FILE PER OBJECT (`planExport`), and `useExport` hands them
       * over in a loop: a Blob URL, an `<a download>`, `.click()`, one file at a time. The first
       * click has already put a file in the operator's downloads by the time the second runs, so this
       * is the journey's one true multi-step commit - and the step after the first commit can fail.
       *
       * THE INJECTION IS NOT HYPOTHETICAL. Chrome refuses multiple automatic downloads from a single
       * gesture unless the site is allowed them; `window.__faultDownload = 2` is that refusal, made
       * deterministic. What is being asked is not whether the browser can refuse - it is whether the
       * operator can tell afterwards WHICH of the two files they now have.
       *
       * No supports are generated: a model-and-supports plan includes the model part whether or not
       * the unit has supports, so two objects give two files either way, and the probe costs seconds.
       */
      if (probes('r1')) {
      await page.goto(url);
      await enterEditor(page);
      await page.setInputFiles('.drop input[type=file]', twoModels);
      await page.waitForFunction(() => /2 objects/.test(document.querySelector('footer')?.innerText ?? ''), null, { timeout: 180000 });
      await d.quiet();
      await d.idle(500);
      const firstFile = page.waitForEvent('download', { timeout: 120000 }).then((download) => download.suggestedFilename(), () => '');
      await page.evaluate(() => { window.__faultDownload = 2; });
      await page.getByRole('button', { name: 'Each object with model' }).click();
      const landed = await firstFile;
      await d.idle(4000);
      const partial = await page.evaluate(() => ({
        attempted: window.__downloads ?? 0,
        status: document.querySelector('footer strong')?.innerText ?? '',
      }));
      const partialRows = await activityRows();
      await page.evaluate(() => { window.__faultDownload = 0; });
      /*
       * THE ASSERTION IS THE POSITIVE ONE (q6's lesson). Not "the status line does not lie" - a list
       * of the wrong screens I can imagine - but: can the operator find out that one file was written
       * and one was not? Naming the file that landed, or saying the export was partial, either
       * passes. A single generic failure sentence after a file has already been written does not: it
       * says nothing came out, and something did.
       */
      const saysPartial = (text) => {
        const said = String(text ?? '').toLowerCase();
        return (landed.length > 0 && said.includes(landed.toLowerCase())) || /partly|partial|1 of 2|one of the two|some of the files/.test(said);
      };
      check('r1 G1 a download refused after the first file landed tells the operator which files were written',
        partial.attempted >= 2 && landed.length > 0 && (saysPartial(partial.status) || partialRows.some(saysPartial)),
        `downloads attempted ${partial.attempted}, file that landed ${JSON.stringify(landed)}, status ${JSON.stringify(partial.status)}, activity ${JSON.stringify(partialRows)}`);
      }

      /*
       * G3 - A REPLY BEFORE ITS PREDECESSOR.
       *
       * Two replies are in flight at once in exactly one place on the deck journey, and finding that
       * out was most of this probe's work: the batch loop is strictly SERIAL by design
       * (`useBatchDetect`: a row's "Checking the orientation…" must be true when it says so) and
       * `meshClient` runs one job at a time, so neither has a pair to reorder. The pair is the batch's
       * orient of one row and the FLOW's orient of another, which the analysis pool runs side by side
       * under different keys (`batch-orient:<id>` and `dental-orient:<id>`).
       *
       * So: hold both settling replies, then release the NEWER one first. The flow's answer arrives
       * before the batch's, which was produced first - a reply before its predecessor, injected at
       * the channel instead of hoped for from a timing race.
       *
       * THE TWO MODELS MUST ORIENT TO DIFFERENT THINGS, which is what `openCubeStl` is for. A closed
       * cube answers "No rim found. Draw one to continue." and the flow hands over to rim drawing; an
       * open one fails the mesh check, so the row reads "Could not check the orientation." and the
       * flow says so instead. With two identical answers a crossed reply would look exactly like a
       * correct one, and this probe would be unfalsifiable.
       *
       * THE PROBE COMPUTES ITS OWN EXPECTATION. A clean run of the same two files records both row
       * verdicts and where the flow lands on row 2; the faulted run must reproduce them. Nothing here
       * hard-codes what a cube orients to - and the check asserts that the two baseline verdicts
       * DIFFER, so the discrimination is proved in the same run that relies on it.
       *
       * THE FIRST VERSION OF THIS CHECK PASSED AND PROVED NOTHING, for the third time in two days in
       * this family. the settled reader asked only for non-empty row text, so with the lever holding every
       * answer the baseline read ["Checking the orientation…", "Waiting its turn…"] - and "the two
       * rows differ" was satisfied by two sentences that both mean "I do not know yet". The settled
       * reader now refuses a pending sentence, and the precondition is part of the claim rather than
       * a hope: `settledClean`, `bothHeld` and `baseline[0] !== baseline[1]` all have to hold.
       */
      if (probes('r2')) {
      const pair = [{ name: 'r-closed.stl', text: rCube }, { name: 'r-open.stl', text: rOpenCube }];
      await twoRowDeck({ files: pair });
      const settledClean = await allSettled();
      const baseline = await detectLines();
      await page.locator('.items-row').nth(1).click();
      await page.locator('[data-ui="items-start"]').click();
      await page.waitForFunction(() => /Step|could not|unusable/i.test(document.body.innerText), null, { timeout: 240000 }).catch(() => {});
      await d.idle(2000);
      const baselineScreen = await page.evaluate(() => ({
        badge: (document.querySelector('.edit-badge')?.textContent ?? '').trim(),
        alerts: [...document.querySelectorAll('[role="alert"]')].map((node) => (node.textContent ?? '').trim()).join(' | '),
        rotation: null,
      }));
      baselineScreen.rotation = (await d.props()).activeRotation ?? null;

      await twoRowDeck({ hold: true, files: pair });
      // The batch's orient of row 1 has been produced and held; the row still says it is checking.
      await page.waitForFunction(() => (window.__faultHeld?.() ?? 0) >= 1, null, { timeout: 240000 }).catch(() => {});
      const heldWhileWaiting = await detectLines();
      await page.locator('.items-row').nth(1).click();
      await page.locator('[data-ui="items-start"]').click();
      // And now the flow's orient of row 2, produced second.
      const bothHeld = await page.waitForFunction(() => (window.__faultHeld?.() ?? 0) >= 2, null, { timeout: 240000 }).then(() => true, () => false);
      // The newer reply first, then the older: the flow is answered before the batch that asked first.
      const releasedLate = await page.evaluate(() => ({ newest: window.__faultRelease('lifo', 1), rest: window.__faultRelease('fifo') }));
      await page.evaluate(() => { window.__faultHold = ''; });
      await page.waitForFunction(() => /Step|could not|unusable/i.test(document.body.innerText), null, { timeout: 120000 }).catch(() => {});
      await d.idle(2500);
      const reordered = await page.evaluate(() => ({
        badge: (document.querySelector('.edit-badge')?.textContent ?? '').trim(),
        alerts: [...document.querySelectorAll('[role="alert"]')].map((node) => (node.textContent ?? '').trim()).join(' | '),
        rotation: null,
      }));
      reordered.rotation = (await d.props()).activeRotation ?? null;
      const injected = await page.evaluate(() => window.__faultSeen ?? 0);
      check('r2 G3 two orients in flight and the newer answered first: every observer still gets its own answer',
        settledClean && bothHeld && injected >= 2 && baseline.length === 2 && baseline[0] !== baseline[1]
          && reordered.badge === baselineScreen.badge && reordered.alerts === baselineScreen.alerts
          && JSON.stringify(reordered.rotation) === JSON.stringify(baselineScreen.rotation),
        `settled cleanly ${settledClean}, replies held ${injected}, released ${JSON.stringify(releasedLate)}, baseline verdicts ${JSON.stringify(baseline)}, rows while held ${JSON.stringify(heldWhileWaiting)}, flow after the reorder ${JSON.stringify(reordered)}, flow in the clean run ${JSON.stringify(baselineScreen)}`);
      }

      /*
       * G5 - THE FAR SIDE SUCCEEDED AND THIS SIDE GAVE UP.
       *
       * The app's real form of this is `ANALYSIS_TIMEOUT_MS`: ten minutes, after which the worker is
       * restarted and the job fails - while that worker may well have finished the work and posted
       * its answer. A walk cannot wait ten minutes, so the local half is injected as a CRASH on this
       * side (`window.__faultCrash`, which is what `WorkerTask.wire`'s `onerror` sees) with the far
       * side's answer still held. Same disagreement, same handler (`restart`), seconds instead of
       * minutes. The condition that was swapped is named rather than hidden: it is a crash, not a
       * timeout, so a TIMEOUT at this tier stays UNPROVEN and says so in the report.
       *
       * Then the held answer is released INTO a client that has already given up on it. Three things
       * must hold: the row reaches a terminal state with words, the answer that arrived too late does
       * not land as well (one effect per event, never two), and the rest of the batch still drains - a
       * dependency that failed must not take the queue with it.
       */
      if (probes('r3')) {
      const lateErrors = [];
      const onLateConsole = (message) => { if (message.type() === 'error') lateErrors.push(message.text()); };
      const onLatePageError = (error) => lateErrors.push(String(error));
      page.on('console', onLateConsole);
      page.on('pageerror', onLatePageError);
      await twoRowDeck({ hold: true });
      const firstHeld = await page.waitForFunction(() => (window.__faultHeld?.() ?? 0) >= 1, null, { timeout: 240000 }).then(() => true, () => false);
      const crashed = await page.evaluate(() => window.__faultCrash());
      await d.idle(2500);
      const afterCrash = await detectLines();
      // The answer the worker had already produced, handed to a client that has given up on it.
      const releasedAfterCrash = await page.evaluate(() => window.__faultRelease('fifo'));
      await page.evaluate(() => { window.__faultHold = ''; });
      await d.idle(2000);
      const settled = await allSettled();
      const lateRows = await detectLines();
      const lateActivity = await activityRows();
      /*
       * The list is mounted on the deck by a SECOND mount point (`App.tsx`), and `.job-activity` is
       * absolutely positioned against the viewport it normally lives in - so where it lands here is a
       * question a reading of the CSS cannot answer. The shot is the answer, and the box is checked
       * against the deck's own rows below.
       */
      await page.screenshot({ path: path.join(scratch, 'r3-deck-activity.png') });
      const panel = await page.evaluate(() => {
        const node = document.querySelector('.job-activity');
        const rows = document.querySelector('.items-list');
        const box = (element) => (element ? element.getBoundingClientRect() : null);
        const one = box(node);
        const list = box(rows);
        return !one || !list ? null : {
          panel: { x: Math.round(one.x), y: Math.round(one.y), w: Math.round(one.width), h: Math.round(one.height) },
          rows: { x: Math.round(list.x), y: Math.round(list.y), w: Math.round(list.width), h: Math.round(list.height) },
          onScreen: one.top >= 0 && one.left >= 0 && one.bottom <= window.innerHeight && one.right <= window.innerWidth,
          overlapsRows: one.left < list.right && one.right > list.left && one.top < list.bottom && one.bottom > list.top,
        };
      });
      page.off('console', onLateConsole);
      page.off('pageerror', onLatePageError);
      /*
       * BOTH ROWS, not just the one that failed: the second row is how the queue proves it survived
       * the first row's failure. `lateErrors` is read here rather than left to section `h`, which runs
       * at the end of the whole walk and would attribute a throw to whatever ran last.
       */
      check('r3 G5 a crash with the far side answer still in flight settles each row once, and the queue drains',
        firstHeld && crashed > 0 && settled && lateRows.length === 2 && lateRows.every((line) => line.trim().length > 0) && lateErrors.length === 0,
        `workers crashed ${crashed}, rows right after the crash ${JSON.stringify(afterCrash)}, late answers released ${releasedAfterCrash}, rows now ${JSON.stringify(lateRows)}, console errors ${JSON.stringify(lateErrors)}`);
      /*
       * THE SECOND CLAIM, AND IT IS A DIFFERENT ONE (q1/q2's rule). The first asks what the SYSTEM did
       * with a failure; this asks whether the operator can read it. Both halves were defects:
       * the background-work list was not mounted on the deck at all, so a crashed analysis worker left
       * its mark on one row's sentence and nowhere else; and once mounted it explained an orientation
       * check as a support build, because the activity list defaulted an unknown context to "build".
       * So the check reads the words as well as the box - a list in the right corner saying the wrong
       * thing is not a screen either.
       */
      check('r3b G5 and the failure is readable on the deck: in the background-work list, in its own words',
        lateActivity.length > 0 && lateActivity.every((row) => !/rebuild the supports|generate again/i.test(row))
          && Boolean(panel?.onScreen) && !panel?.overlapsRows,
        `activity ${JSON.stringify(lateActivity)}, panel ${JSON.stringify(panel)}`);
      }

      /*
       * G7 - THE BACKGROUND JOB STOPS, for longer than its period.
       *
       * `window.__faultHold` and no release: every orient the worker finishes is swallowed, so the
       * batch loop blocks on its first row for ever. A cube's detection takes a second or two, so
       * twenty seconds is already far past its period.
       *
       * WHAT THE DOCTRINE ASKS IS NOT "IS THERE A SPINNER". It is whether the good day and the bad day
       * look different, and whether the operator can act. So the claim has three parts: the pending
       * work still reads as pending, no row has been given a verdict it never received, and the deck
       * is still usable - the operator can start the row themselves instead of waiting on a detector
       * that has stopped.
       *
       * TWO THINGS I HAD WRONG UNTIL THE PROBE ANSWERED, and they are the reason the detail prints
       * more than the check asserts (S10: diagnose from a probe, not from a reading).
       *
       * 1. I expected NO Cancel, because `useBatchDetect` passes no AbortSignal. One is offered:
       *    `AnalysisClient.submit` passes a controller of its own, so `cancellable` is true. The
       *    operator is not trapped, and the detail counts them rather than assuming.
       * 2. The background-work row reads `Aligner oriented · 100%` and goes on reading it for as long
       *    as the job is stuck, with no elapsed time - a finished job and a job that will never
       *    finish draw the same row. `JobActivity.view` has the signal for this and wires it to
       *    `state === 'indeterminate'`, which is the one state that cannot happen here: a job that
       *    reported progress and then stopped is determinate. That control cannot fire for the
       *    failure it was written for, and it lives in vendored geocore, which this repo consumes as
       *    built - so it is handed over rather than patched: `docs/handoff/geocore-stuck-job-elapsed.md`.
       *    The check below does not fail on it; the release gate must not go red on a known gap in
       *    someone else's code, and the detail and the note are how it stays known.
       */
      if (probes('r4')) {
      await twoRowDeck({ hold: true });
      await page.waitForFunction(() => (window.__faultHeld?.() ?? 0) >= 1, null, { timeout: 240000 }).catch(() => {});
      await d.idle(20000);
      const stalled = await page.evaluate(() => ({
        held: window.__faultHeld?.() ?? 0,
        lines: [...document.querySelectorAll('[data-ui^="items-detect-"]')].map((node) => (node.textContent ?? '').trim()),
        startEnabled: !document.querySelector('[data-ui="items-start"]')?.disabled,
        removable: document.querySelectorAll('.items-row .remove:not([disabled])').length,
        activity: [...document.querySelectorAll('.job-activity .job-row')].map((row) => (row.textContent ?? '').trim()),
        cancels: document.querySelectorAll('.job-activity .job-row button').length,
      }));
      // Pending, never a verdict: the words a settled row uses must not be on screen for these.
      const verdicts = /upright|turned|no rim found|could not/i;
      const stillPending = stalled.lines.every((line) => line.length === 0 || !verdicts.test(line));
      await page.evaluate(() => { window.__faultHold = ''; });
      check('r4 G7 a detector that has stopped reads as pending, not as a verdict, and the deck still works',
        stalled.held >= 1 && stillPending && stalled.startEnabled && stalled.removable === 2,
        `answers swallowed ${stalled.held}, rows ${JSON.stringify(stalled.lines)}, Start enabled ${stalled.startEnabled}, rows removable ${stalled.removable}, background work ${JSON.stringify(stalled.activity)}, cancels offered ${stalled.cancels}`);
      if (stalled.activity.some((row) => /100%/.test(row))) note('r4 known gap: the stalled job still reads 100% with no elapsed time - docs/handoff/geocore-stuck-job-elapsed.md');
      }
      if (PROBES.size > 0) note(`fault injection filtered to ${[...PROBES].join(', ')} - not the whole section`);
    }

    // u. Dental flow, Step 1 to Step 2 (the repo's reference aligner; synthetic files for the failure branches).
    if (runs('u')) {
      const reference = PUBLIC_ALIGNER;
      const cube = path.join(scratch, 'cube.stl');
      const cup = path.join(scratch, 'cup.stl');
      const badStl = path.join(scratch, 'broken.stl');
      const notModel = path.join(scratch, 'notes.txt');
      const holed = path.join(scratch, 'holed.stl');
      writeFileSync(cube, cubeStl());
      writeFileSync(cup, cupStl());
      writeFileSync(badStl, 'solid x\nthis is not a mesh\n');
      writeFileSync(notModel, 'not a model');
      const whole = readFileSync(reference);
      // Binary STL (84-byte head, 50 bytes a triangle): the last 40 triangles cut off leaves a hole.
      const count = whole.readUInt32LE(80);
      const cut = Buffer.from(whole.subarray(0, 84 + (count - 40) * 50));
      cut.writeUInt32LE(count - 40, 80);
      writeFileSync(holed, cut);
      const drop = (file) => page.setInputFiles('input[aria-label="Choose aligner file"]', file);
      const badge = () => page.locator('.edit-badge').textContent();
      const objects = async () => (await page.locator('footer').innerText()).match(/(\d+) objects?/)?.[1];
      const stepTo = async (text, ms = 20000) => page.waitForFunction((word) => (document.querySelector('.edit-badge')?.textContent ?? '').toLowerCase().includes(word.toLowerCase()), text, { timeout: ms });
      const noticeShown = (text, ms = 120000) => page.waitForFunction((word) => [...document.querySelectorAll('[role="alert"]')].some((node) => node.textContent.includes(word)), text, { timeout: ms });
      /** Every alert on screen, for a failure that needs to say what the app DID say. */
      const alertsNow = () => page.evaluate(() => [...document.querySelectorAll('[role="alert"]')].map((node) => node.textContent.trim()).join(' | '));
      /** Back to Step 1 from wherever a scenario left off, so one bad scenario does not end the walk. */
      const backToStepOne = async () => {
        await page.goto(url);
        await enterEditor(page);
        await d.button('Aligner Support Production').click();
        await stepTo('Step 1 · Aligner');
      };

      await page.goto(url);

      await enterEditor(page);
      await d.button('Aligner Support Production').click();
      /*
       * STRAIGHT TO STEP 1. The in-flow type card is gone (design doc §10, E1): detection takes the
       * profile as an argument, so the purpose arrives with the run from the Drop page. u0 therefore
       * asserts the ABSENCE of a card as well as the badge, because "no card" is the whole change and
       * a check that only read the badge would still pass with a card sitting under it.
       */
      await stepTo('Step 1 · Aligner');
      const panelsShown = await page.locator('.panel.left, .panel.right').count();
      check('u0 Aligner Support Production enters at Step 1 with no type card and no generic side panels (U1)',
        panelsShown === 0 && await page.locator('.choice-key').count() === 0 && await page.getByText('Place the aligner file here').isVisible(),
        `panels ${panelsShown}, cards ${await page.locator('.choice-key').count()}`);
      await page.screenshot({ path: path.join(scratch, 'ux-a-step1-entry.png') });
      await d.button('Exit').click();
      await page.waitForFunction(() => !document.querySelector('.edit-badge'), null, { timeout: 5000 });
      check('u1 Exit at Step 1 leaves the flow with the plate untouched', (await objects()) === '0' && (await page.locator('.panel.left [inert]').count()) === 0, `objects ${await objects()}`);

      await d.button('Aligner Support Production').click();
      await stepTo('Step 1 · Aligner');
      // Back IS offered at Step 1: it leaves for the Drop page rather than stepping backwards, which
      // is why removing the type step did not remove the button.
      check('u2 Step 1 asks for the aligner file and still offers a way out', await page.getByText('Place the aligner file here').isVisible() && await d.button('Back').isVisible());

      // The 3D view's chrome sits in grid columns, so two panels CANNOT overlap however their words wrap.
      // This measures the real boxes rather than trusting the rules: the title block on the left, the
      // controls on the right, the widgets at the foot and the status strip between them.
      const docked = async () => page.evaluate(() => {
        const box = (selector) => { const el = document.querySelector(selector); if (!el) return null; const r = el.getBoundingClientRect(); return r.width && r.height ? [r.left, r.top, r.right, r.bottom] : null; };
        // `.edit-frame` is left out on purpose: it is the decorative border around the whole view, drawn
        // under everything, so it is meant to lie across all of them.
        const parts = { title: box('.edit-badge'), controls: box('.dental-side') ?? box('.edit-bar'), widgets: box('.debug-section'),
          status: box('footer.on-scene'), views: box('.viewport-view'), work: box('.job-activity'), note: box('.viewport-note'), toast: box('.undo-toast-region') };
        const hit = (a, b) => a && b && a[0] < b[2] && b[0] < a[2] && a[1] < b[3] && b[1] < a[3];
        const names = Object.keys(parts), clashes = [];
        for (let i = 0; i < names.length; i += 1) for (let j = i + 1; j < names.length; j += 1) if (hit(parts[names[i]], parts[names[j]])) clashes.push(`${names[i]} over ${names[j]}`);
        const right = parts.controls, scene = document.querySelector('.viewport').getBoundingClientRect();
        return { clashes, controlsOnTheRight: !!right && right[0] > scene.left + scene.width / 2, shown: Object.entries(parts).filter(([, at]) => at).map(([name]) => name) };
      });
      {
        const seen = await docked();
        check('u2b the 3D view is docked: nothing overlaps anything, and the controls are on the right',
          seen.clashes.length === 0 && seen.controlsOnTheRight, `showing ${seen.shown.join(', ')}; ${seen.clashes.join(' | ') || 'no overlap'}`);
      }
      await page.screenshot({ path: path.join(scratch, 'ux-a-step1-drop.png') });

      /*
       * Out of rim define mode if the drop landed there. A mesh with no findable rim is handed to the
       * mode now, and the mode's way out is Cancel - it has no Back, deliberately: Cancel and Done are a
       * mode's two ends, while Back belongs to the steps. Fixtures that are not aligners hit this often.
       */
      const leaveRimIfOpen = async () => {
        if ((await page.locator('[data-ui="rim-why"]').count()) === 0) return;
        await d.button('Cancel').click();
        await page.waitForFunction(() => /Step 1 . Aligner/.test(document.querySelector('.edit-badge')?.innerText ?? ''), null, { timeout: 20000 });
      };

      await drop(notModel);
      await noticeShown('STL');
      check('u3 a file that is no model is refused in place, Step 1 stays', (await badge()).includes('Step 1 · Aligner') && await page.getByText('Place the aligner file here').isVisible() && (await objects()) === '0', `status "${await d.status()}"`);
      await drop(badStl);
      await noticeShown('');
      await d.idle(1500);
      check('u4 a broken STL is refused in place, Step 1 stays, nothing is added', (await badge()).includes('Step 1 · Aligner') && await page.getByText('Place the aligner file here').isVisible() && (await objects()) === '0', `status "${await d.status()}", objects ${await objects()}`);

      await drop(cube);
      /*
       * NO RIM FOUND IS NO LONGER A DEAD END. Step 1 used to stop at "could not be oriented
       * automatically" and let Next refuse with "No aligner opening was found" - a notice with nowhere
       * to go. It now hands over to rim define mode, where the operator draws the rim themselves.
       *
       * The notice is gone ON PURPOSE: the mode replaces it, and a line saying detection failed sitting
       * over a dock that asks you to draw would be telling the operator off for arriving. So the dock
       * has to carry the reason instead, and that line is the thing this check is really about - an
       * unexplained drawing mode appearing by itself reads as a fault in the app.
       */
      await page.waitForFunction(() => /Define the rim/.test(document.querySelector('.edit-badge')?.innerText ?? ''), null, { timeout: 60000 });
      const rimWhy = await page.locator('[data-ui="rim-why"]').innerText();
      check('u5 a shape with no detectable rim hands over to rim define mode, and the dock says why',
        (await badge()).includes('Define the rim') && /could not find a rim/i.test(rimWhy),
        `badge "${(await badge()).slice(0, 30)}", why "${rimWhy.slice(0, 44)}"`);
      /*
       * DRAWING, FOR REAL. Three clicks on the model put three anchors down; then Adjust drags one of
       * them somewhere else. The count is what both checks read, and on the drag it is the ENTIRE
       * point: a browser fires a click when a drag releases, so a tool that did not tell the two apart
       * would quietly leave a fourth anchor behind every time the operator moved one.
       */
      await d.measureCanvas();
      const rimSpots = [[0.42, 0.44], [0.52, 0.44], [0.47, 0.54]];
      for (const spot of rimSpots) { await d.stroke(spot, spot, 1); await d.idle(300); }
      const rimPoints = async () => ((await page.locator('[data-ui="rim-point-count-control"]').innerText()) ?? '').trim();
      check('u5c Place puts one anchor down per click on the model', (await rimPoints()) === '3', `points ${await rimPoints()}`);
      await d.button('Adjust').click();
      /*
       * A LONG DRAG, AND THE REASON IS A BUG THAT USED TO HELP. This dragged to [0.37, 0.38], about
       * 0.33 mm on a 2 mm cube - inside `closesLoop`'s reach of 0.67 mm - and u5e below still saw the
       * old spot as bare. It passed only because the VIEW ORBITED during the drag, which carried the
       * anchor further than the pointer did. With the orbit properly suppressed the anchor goes where
       * the pointer goes, so the drag has to be long enough to mean something on its own: this one is
       * about 1.6 mm, clear of both the close reach and `grabAnchor`'s 0.84 mm.
       */
      await d.stroke(rimSpots[0], [0.60, 0.70], 10);
      await d.idle(500);
      check('u5d a drag in Adjust adds nothing: the click the release fires is not a new anchor', (await rimPoints()) === '3', `points ${await rimPoints()}`);

      /*
       * AND THE ANCHOR REALLY LEFT. The count alone cannot show that - an anchor that never moved would
       * also read 3 - so this asks the dock a question only a vacated spot can answer. Back in Place, a
       * click where the first anchor USED to be either lands on it and closes the loop (if it is still
       * sitting there) or finds bare surface and adds a fourth. Four points, still open, means it moved.
       */
      await d.button('Place').click();
      await d.stroke(rimSpots[0], rimSpots[0], 1);
      await d.idle(400);
      const rimLoop = ((await page.locator('[data-ui="rim-loop-state-control"]').innerText()) ?? '').trim();
      check('u5e the dragged anchor really left its old spot, which is now bare surface',
        (await rimPoints()) === '4' && /open/i.test(rimLoop), `points ${await rimPoints()}, loop "${rimLoop}"`);

      /*
       * DELETE POINT, which needs a subject before it will do anything. Adjust picking an anchor up is
       * also what picks it OUT, so the press that would start a drag is the one that arms this - there is
       * no third tool in a mode whose whole job is one loop.
       *
       * ITS OWN SQUARE, WELL SPREAD, and that is the whole reason this clears first. `grabAnchor` takes
       * the nearest anchor within `RIM_GRAB_REACH_MM` (0.84 mm), and the cube is 2 mm across: the spots
       * the checks above use sit about 0.5 mm apart, so EVERY anchor is within reach of every other and
       * a press can never say which one it found. At this zoom 0.84 mm is about 182 canvas pixels, so
       * these four are laid out at least 250 apart - far enough that a press answers about ONE anchor.
       */
      await d.button('Clear').click();
      await d.idle(300);
      const squareSpots = [[0.40, 0.36], [0.60, 0.36], [0.60, 0.64], [0.40, 0.64]];
      for (const spot of squareSpots) { await d.stroke(spot, spot, 1); await d.idle(300); }
      await d.button('Adjust').click();
      await d.idle(200);
      const deleteKey = d.button('Delete point');
      check('u5e2 Delete point waits for a point to be picked, and is shown greyed rather than hidden',
        (await deleteKey.isVisible()) && !(await deleteKey.isEnabled()) && (await rimPoints()) === '4',
        `points ${await rimPoints()}`);

      await d.stroke(squareSpots[1], squareSpots[1], 1);
      await d.idle(300);
      check('u5e3 picking a point with Adjust turns Delete point on', await deleteKey.isEnabled());

      await deleteKey.click();
      await d.idle(400);
      check('u5e4 Delete point takes one point out and lets go of it',
        (await rimPoints()) === '3' && !(await deleteKey.isEnabled()), `points ${await rimPoints()}`);

      /*
       * AND THE PICKED ONE IS THE ONE THAT LEFT. A count of 3 reads the same whichever anchor went, so
       * this asks the dock a question only a vacated spot can answer: press where the deleted anchor used
       * to be and Delete point stays OFF, because nothing is in reach to pick up. The second press, on a
       * corner never touched, turns it back on - without which the first half would also pass if picking
       * had simply stopped working.
       */
      await d.stroke(squareSpots[1], squareSpots[1], 1);
      await d.idle(300);
      const goneSpotOff = !(await deleteKey.isEnabled());
      await d.stroke(squareSpots[3], squareSpots[3], 1);
      await d.idle(300);
      check('u5e5 the deleted point really left its own spot, and the others stayed',
        goneSpotOff && (await deleteKey.isEnabled()) && (await rimPoints()) === '3',
        `old spot picks ${goneSpotOff ? 'nothing' : 'something'}, points ${await rimPoints()}`);

      // BACK INTO PLACE before anything below draws again: a click in Adjust moves points, it does not
      // make them, so the triangle below would never be placed and Close loop would wait out its timeout.
      await d.button('Place').click();
      await d.idle(200);

      /*
       * AND THE WHOLE WAY THROUGH, on THIS first entry, while the cube is alone on the plate and the
       * fit has it centred. Close the loop, press Done, and the drawing becomes the aligner's rim
       * through `dental_rim_from_points` (engine 61). Until that landed Done refused every sound loop,
       * so this is the check that could not be written before.
       */
      /*
       * CLEAR FIRST, and draw a clean triangle. The loop left by the checks above is deliberately a
       * mess - an anchor dragged outside and a fresh one dropped where it used to be - so it crosses
       * itself, and Done refuses it CORRECTLY. Pressing Done there would have tested the refusal, not
       * the rim. Clear is exercised on the way through.
       */
      /*
       * THE CONTROL for u5j below, taken here because there is no rim on the model yet - a draft is
       * drawn in its own colour by `RimDraftLayer`, and `areaPolicy` does not exist until Done. A bare
       * count at Step 2 would prove nothing: GL, lighting and the legend all put stray pixels on screen.
       */
      const rimInk = await sceneToken(page, '--mark-area-edge');
      const noRimYet = await canvasColour(page, rimInk, { without: ['.scene-legend'] });

      await d.button('Clear').click();
      await d.idle(300);
      check('u5f0 Clear takes the whole drawing away', (await rimPoints()) === '0', `points ${await rimPoints()}`);
      for (const spot of [[0.42, 0.42], [0.54, 0.44], [0.47, 0.55]]) { await d.stroke(spot, spot, 1); await d.idle(300); }

      await d.button('Close loop').click();
      await d.idle(300);
      const closedLoop = ((await page.locator('[data-ui="rim-loop-state-control"]').innerText()) ?? '').trim();
      check('u5f Close loop joins the last point back to the first', /closed/i.test(closedLoop), `loop "${closedLoop}"`);

      const doneKey = d.button('Done');
      check('u5g a sound loop lets Done through, with nothing left in the way', await doneKey.isEnabled());
      await doneKey.click();
      await page.waitForFunction(() => /Step 1 . Aligner/.test(document.querySelector('.edit-badge')?.innerText ?? ''), null, { timeout: 60000 });
      check('u5h Done turns the drawing into the rim and hands Step 1 back',
        (await badge()).includes('Step 1 · Aligner') && /rim saved/i.test(await d.status()), `status "${await d.status()}"`);

      /*
       * AND THE OPERATOR CAN GO ON. This is the check the feature exists for: a hand-drawn rim has to
       * reach Step 2, or the mode has only moved the dead end one screen later. The walk pressed Back
       * here before and never found out.
       */
      await d.button('Next').click();
      await stepTo('Step 2 · Support area', 120000);
      check('u5i Next carries a hand-drawn rim through to Step 2',
        (await badge()).includes('Step 2'), `badge "${(await badge()).slice(0, 34)}", status "${await d.status()}"`);

      /*
       * AND THE OPERATOR CAN SEE WHAT THEY DREW. `DentalRimOutline` used to return null for anything
       * but a `lower-edge-loop`, so a drawn rim - always a `projection-fallback`, because a drawn loop
       * claims no detection it did not earn - left no mark once the mode closed. The drawing was saved
       * and invisible. This measures the rim colour ON THE MODEL against the control above, with the
       * legend's own swatch of that colour masked out, so it answers the operator's question rather
       * than the renderer's.
       */
      const rimDrawn = await canvasColour(page, rimInk, { without: ['.scene-legend'] });
      await page.screenshot({ path: path.join(scratch, 'ux-a-step2-drawn-rim.png') });
      check('u5j the drawn rim is visible on the model in Step 2, in the colour the legend names',
        rimDrawn.count > noRimYet.count + 60,
        `${rimDrawn.count} px of ${rimInk} with the rim vs ${noRimYet.count} without, box ${JSON.stringify(rimDrawn.box)}`);
      await d.button('Back').click();
      await stepTo('Step 1 · Aligner');

      /*
       * AND THE DOOR OPENS BOTH WAYS. Rim define mode used to be one-way: once it was left there was
       * no event that could reopen it, so Cancel stranded the operator, an abandoned drawing could
       * not be reached, and a rim whose side the engine could not settle could never be redrawn.
       *
       * The last check here is the one that matters most. Reopening and then cancelling used to clear
       * `dentalRimOwn`, which was `next()`'s only test for a hand-drawn rim - so this exact sequence
       * would have thrown away a rim that was already saved and sound. `next()` asks the unit policy
       * now, and this is what holds it to that.
       */
      const drawAgain = d.button('Draw the rim');
      check('u5k Step 1 offers the way back into the drawing for a hand-drawn aligner',
        (await drawAgain.isVisible()) && (await drawAgain.isEnabled()));
      await drawAgain.click();
      await page.waitForFunction(() => /Define the rim/.test(document.querySelector('.edit-badge')?.innerText ?? ''), null, { timeout: 20000 });
      check('u5k2 Draw the rim reopens the mode', (await badge()).includes('Define the rim'), `badge "${(await badge()).slice(0, 34)}"`);
      await d.button('Cancel').click();
      await stepTo('Step 1 · Aligner');
      await d.button('Next').click();
      await stepTo('Step 2 · Support area', 120000);
      check('u5k3 a rim already saved survives a reopen and a cancel, and still reaches Step 2',
        (await badge()).includes('Step 2'), `badge "${(await badge()).slice(0, 34)}", status "${await d.status()}"`);
      await d.button('Back').click();
      await stepTo('Step 1 · Aligner');

      await d.button('Back').click();
      /*
       * BACK AT STEP 1 STEPS OUT TO THE CASE (E1b), not out of the session. The Items page comes up
       * over a LIVE flow, which is a shape the app could not be in before: every earlier route to a
       * start screen sent `exit` first. The rows ARE the case, so the object just worked on is still
       * listed - had Back exited, the finished marks would have gone with it.
       *
       * Checking for the absence of `.start-task` matters as much as the presence of the rows: the old
       * behaviour landed on the Drop page, and a check that only looked for "some start screen" would
       * have passed either way.
       */
      await page.waitForSelector('.items-page', { timeout: 20000 });
      check('u5l Back at Step 1 shows the case instead of ending it: the rows, not the Drop page',
        (await page.locator('.items-list li').count()) > 0 && (await page.locator('.start-task').count()) === 0,
        `rows ${await page.locator('.items-list li').count()}, drop pages ${await page.locator('.start-task').count()}`);
      // A CLEAN PLATE for the next fixture, and a reload is deterministic where re-entering a row is
      // not: the rows carry two cubes from above, and everything below assumes one object.
      await backToStepOne();

      /*
       * Cancel gets its OWN entry and needs no anchors, which is why it goes second: a second cube is
       * laid out BESIDE the first, so the fixed canvas fractions above would miss it. Drawing has to
       * happen while the plate holds one object.
       */
      await drop(cube);
      await page.waitForFunction(() => /Define the rim/.test(document.querySelector('.edit-badge')?.innerText ?? ''), null, { timeout: 60000 });
      await d.button('Cancel').click();
      await page.waitForFunction(() => /Step 1 . Aligner/.test(document.querySelector('.edit-badge')?.innerText ?? ''), null, { timeout: 20000 });
      check('u5b Cancel leaves rim define mode and lands back in Step 1, still in the flow',
        (await badge()).includes('Step 1 · Aligner') && await d.button('Exit').isVisible(), `badge "${(await badge()).slice(0, 30)}"`);

      /*
       * AND STEP 1 SAYS WHAT TO DO. Cancelling with nothing drawn used to leave the operator on a
       * screen whose only advice was to choose another file or leave - a worse dead end than the one
       * this whole feature exists to remove, since at least that one came with an explanation.
       */
      check('u5b2 after Cancel, Step 1 still offers the way back in', await d.button('Draw the rim').isVisible());
      await d.button('Next').click();
      await d.idle(600);
      const strandedStatus = await d.status();
      check('u5b3 Next names the way forward instead of sending the operator away',
        /Draw the rim/.test(strandedStatus) && (await badge()).includes('Step 1 · Aligner'), `status "${strandedStatus}"`);

      /*
       * A CLEAN PLATE before the next fixture. Two cubes were dropped above - one kept its drawn rim,
       * one was cancelled - and everything below assumes a plate holding a single object, because a
       * second is laid out beside the first and every canvas fraction here is fixed.
       */
      await backToStepOne();

      await drop(holed);
      await noticeShown('holes or non-manifold');
      /*
       * The holes warning survives the handover. This mesh has no findable rim either, so it ends in rim
       * define mode - and what orientation DID find about it still applies to the shape being drawn on,
       * so the mode carries the notice in rather than dropping it on the way.
       */
      check('u6 a mesh with holes is warned about before detection is trusted', await page.getByText('holes or non-manifold').isVisible());
      await leaveRimIfOpen();
      // Back lands on the case's rows now (u5l); the next fixture wants a clean plate, so reload in.
      await backToStepOne();
      await drop(cup);
      // The cup is a closed, manifold thick cup: a cavity opening but no CENTRAL opening, so the type that
      // insists on one should offer a switch. Its own scenario, and a failure here used to end the walk
      // before everything below - which is most of the dental flow.
      // Set once u7 has had its say, so a throw further down cannot re-report a check that already PASSED.
      let u7Reported = false;
      try {
        /*
         * TWO honest endings, not one. The engine either ORIENTS the cup and says the opening contradicts
         * the chosen type (the mismatch notice, which Keep dismisses), or it cannot find a rim at all -
         * and THAT ending is no longer a notice. It hands over to rim define mode, where the operator
         * draws the rim themselves. The `orient-ways-failed` row is gone from this path with it.
         *
         * What the check is really about survives both endings, which is why it is written this way:
         * Step 1 OFFERS A WAY OUT rather than continuing as if nothing were wrong. On the mismatch
         * ending the way out is naming the aligner type; on the rim ending it is the mode itself.
         */
        await page.waitForSelector('[data-ui="orient-ways-mismatch"], [data-ui="rim-why"]', { timeout: 30000 });
        const ways = (await page.locator('[data-ui="rim-why"]').count()) > 0 ? 'rim' : 'mismatch';
        // One profile is embedded and it insists on an opening, so the row explains itself instead of switching.
        const offered = ways === 'rim' ? 1
          : await page.locator('[data-ui="orient-ways-mismatch"] [data-ui="orient-only-type"], [data-ui="orient-ways-mismatch"] [data-ui^="orient-switch-"]').count();
        check('u7 a model with no central opening is offered a way out instead of silently continuing', offered > 0,
          ways === 'rim' ? 'handed over to rim define mode' : 'mismatch notice, ' + offered + ' way(s) out');
        u7Reported = true;
        if (ways === 'mismatch') {
          await page.getByRole('button', { name: /^Keep / }).click();
          check('u7b Keep dismisses the type prompt', (await page.getByText('different aligner type').count()) === 0);
        } else {
          // Rim define mode is not an opinion to disagree with, so it carries no Keep: the way on is to draw.
          check('u7b Keep dismisses the type prompt', (await page.locator('[data-ui="orient-keep-type"]').count()) === 0,
            'no rim was found, so the step handed over to drawing one and there was no type prompt to keep');
        }
        /*
         * u8 and u8b are about the ORIENTED ending. Step 2 opening empty needs a rim from the orientation
         * proposal to build its manual area from (`manualAreaPolicy(proposal.rim, ...)`), so a FAILED
         * orientation has no Step 2 to look at: `next()` returns a status instead of advancing. The two
         * checks are SAID to be skipped rather than silently dropped or counted as passing.
         */
        if (ways === 'mismatch') {
          await d.button('Next').click();
          await stepTo('Step 2 · Support area', 120000);
          check('u8 no detected area: Step 2 opens with its message and Next stays off',
            await page.getByText('No support area was detected').first().isVisible() && await d.button('Next').isDisabled(), `status "${await d.status()}"`);
          const unpainted = (await d.props()).activeDental;
          check('u8b no detected area: paint starts from an empty manual-area policy, not from the cavity footprint', unpainted?.kind === 'legacy' && unpainted.origin === 'manual-area' && unpainted.stamps === 0, `policy ${JSON.stringify(unpainted)}`);
          await d.button('Back').click();
          await stepTo('Step 1 · Aligner');
        } else {
          note('u8 / u8b skipped: both need the oriented ending (Step 2 builds its empty area from the orientation proposal), and this fixture was handed to rim define mode instead');
          /*
           * THE OLD DILEMMA HERE IS ANSWERED. This used to press Next against a failure notice whose own
           * words said "rotate it with the gizmo, then press Next" while Next could not possibly advance,
           * and recorded the contradiction for the owner to settle. The handover settles it: there is no
           * notice to press Next on any more, so the step no longer tells the operator to do something it
           * will refuse. What is left to check is that the mode's own way out works.
           */
          await d.button('Cancel').click();
          await page.waitForFunction(() => /Step 1 . Aligner/.test(document.querySelector('.edit-badge')?.innerText ?? ''), null, { timeout: 20000 });
        }
        // BOTH BRANCHES MUST LEAVE THE APP IN THE SAME PLACE. `backToStepOne` reloads and re-enters
        // the flow, so it converges from either branch whatever Back left on screen.
        await d.button('Back').click();
        await backToStepOne();
      } catch (error) {
        const said = `the app said "${await alertsNow()}" (${error.message.split('\n')[0]})`;
        if (u7Reported) note(`u7's scenario could not be left cleanly: ${said}`);
        else check('u7 a model with no central opening names the aligner type as a way out instead of silently continuing', false, said);
        await backToStepOne();
      }

      const dropped = Date.now();
      // Step 1's print-angle search (F): record whether its progress line showed.
      await page.evaluate(() => { window.__scanSeen = false; new MutationObserver(() => { if (/Scanning print angles \d+\/\d+/.test(document.body.innerText)) window.__scanSeen = true; }).observe(document.body, { subtree: true, childList: true, characterData: true }); });
      /*
       * THE BLOCKING KIND OF WAITING, as the operator meets it (src/progress/README.md). Reading a
       * file is the one moment nothing else can be done, so it is `blocking`: one word in the middle
       * of the view, the sentence under it, and an indicator saying the app has not stopped. It was a
       * heading on a veil with NO indicator at all - the reader was told what was happening and given
       * no sign it was still going. Watched for BEFORE the drop, because it is gone within seconds.
       */
      const waiting = (type) => page.locator(`[data-ui="progress-${type}"]`);
      const blockingSeen = page.waitForSelector('[data-ui="progress-blocking"]', { timeout: 30000 })
        .then(async () => ({
          text: (await waiting('blocking').innerText()).replace(/\s+/g, ' ').trim(),
          spins: await waiting('blocking').locator('.progress-indicator--spinner').count(),
        }))
        .catch(() => null);
      /*
       * AND THE STEP KIND, which follows it: the print-angle scan. The model is being worked on and
       * the view still turns under it. The scan counts its own work, so this one is allowed a number
       * and a bar - a job that cannot count gets neither.
       *
       * WATCHED FROM INSIDE THE PAGE, not with `waitForSelector`. The indicator lives for as long as
       * the scan does and the page reloads around it, and a selector wait rejects on a navigation
       * rather than carrying on. A MutationObserver just records that it was there, the way the scan
       * text is already recorded for f1.
       */
      await page.evaluate(() => {
        window.__stepWaits = [];
        const look = () => {
          /*
           * EVERY step wait on screen, not `querySelector`'s first. Two can show at once - the area
           * detector spinning while the print-angle scan counts - and looking at only the first made
           * the scan invisible to this check and produced a reported gap that did not exist.
           */
          for (const at of document.querySelectorAll('[data-ui="progress-step"]')) {
            const seen = {
              measured: at.querySelectorAll('.progress-indicator--bar.is-measured').length,
              spinner: at.querySelectorAll('.progress-indicator--spinner').length,
              percent: at.querySelectorAll('.progress-percent').length,
              // Without the number, so a percentage ticking does not fill this with one entry per tick.
              text: at.innerText.replace(/\s+/g, ' ').replace(/\d+%/, '').trim().slice(0, 40),
            };
            if (!window.__stepWaits.some((was) => was.text === seen.text && was.measured === seen.measured)) {
              window.__stepWaits.push(seen);
            }
          }
        };
        new MutationObserver(look).observe(document.body, { subtree: true, childList: true, attributes: true });
        look();
      });
      await drop(reference);
      const blocking = await blockingSeen;
      check('u8c reading a file blocks, with one word, the sentence under it and a live indicator',
        Boolean(blocking) && /LOADING|読み込み|載入/i.test(blocking.text)
          && /Checking and orienting/i.test(blocking.text) && blocking.spins === 1,
        blocking ? `"${blocking.text.slice(0, 64)}", spinners ${blocking.spins}` : 'never appeared');
      await stepTo('Review the orientation', 180000);
      check('u8d the blocking wait is gone once the aligner is read', (await waiting('blocking').count()) === 0);
      /*
       * Read AFTER the step settles: the work being watched for runs on the way here, so asking any
       * earlier asks before it has had a chance to happen.
       *
       * THE RULE, BOTH WAYS, IN THE RUNNING APP rather than only in a unit test. One load shows both
       * kinds of step job, and each must say exactly what it knows:
       *   - "Detecting the support area" is ONE call into the core - a start, an end, nothing between.
       *     It spins, with no number and no filling bar. A number here would be one nobody measured.
       *   - "Scanning print angles" counts its own tilts, so it gets a real percentage and a bar.
       */
      const steps = await page.evaluate(() => window.__stepWaits ?? []);
      const told = steps.map((seen) => `"${seen.text}" measured=${seen.measured} percent=${seen.percent} spinner=${seen.spinner}`).join(' | ') || 'none';
      const unmeasured = steps.filter((seen) => seen.measured === 0);
      const measured = steps.filter((seen) => seen.measured === 1);
      check('u8e a step job says exactly what it knows: a number only when it counted one',
        unmeasured.length > 0 && unmeasured.every((seen) => seen.percent === 0 && seen.spinner === 1)
          && measured.length > 0 && measured.every((seen) => seen.percent === 1 && seen.spinner === 0),
        `${steps.length} step waits: ${told}`);
      /** The angle the dial shows in its middle, e.g. "44.5" + the degree sign. */
      const angleText = () => page.locator('.print-angle [data-ui="tilt-dial-value"]').textContent().catch(() => '');
      /** The stable band, which used to be part of the same sentence. */
      const rangeText = () => page.locator('.print-angle .orient-range').textContent().catch(() => '');
      /*
       * WHY THIS ANGLE, read where it now lives. `.tilt-flags` was a line under the dial and went when Step 1
       * was rebuilt around the dial; the verdict and the broken rules are in the debug tool now. The tool
       * opens shut on purpose (it is a tool for looking into the app, not part of it), so this opens it once
       * and leaves it open for the checks that follow.
       */
      const debugTitle = page.locator('[data-ui="debug-layers-title"]');
      const openDebug = async () => {
        if ((await debugTitle.getAttribute('aria-expanded')) !== 'true') { await debugTitle.click(); await d.idle(300); }
      };
      const angleVerdict = async () => {
        await openDebug();
        return page.locator('[data-ui="debug-angle"]').innerText().catch(() => '');
      };
      await page.waitForSelector('.print-angle', { timeout: 120000 });
      note(`reference aligner read, oriented and its print angles scanned in ${Math.round((Date.now() - dropped) / 1000)} s`);
      check('u9 the dropped aligner is oriented with no button pressed, and the mesh check is clean', (await page.getByText('holes or non-manifold').count()) === 0 && (await page.getByText('could not be oriented').count()) === 0 && await d.button('Next').isEnabled());
      const angleDial = page.locator('.print-angle [data-ui="tilt-dial"]');
      const litTicks = await page.locator('.print-angle .tilt-dial-tick.is-on').count();
      const dialRange = await angleDial.evaluate((el) => [Number(el.getAttribute('aria-valuemin')), Number(el.getAttribute('aria-valuemax'))]);
      check('f1 Step 1 scans the print angles ("Scanning print angles i/n"), then shows the pick with its stable band',
        await page.evaluate(() => window.__scanSeen) && (await angleText()).startsWith('44.5') && (await rangeText()).includes('26.5') && (await rangeText()).includes('44.5'),
        `dial "${await angleText()}", band "${await rangeText()}"`);
      // The 1° step is what f3 proves, by pressing the arrow once and reading 45.5°.
      check('f2 the print-angle dial spans start ± 22° with the stable band lit around its arc',
        Math.abs(dialRange[0] - 24.4577512332) < 1e-6 && Math.abs(dialRange[1] - 68.4577512332) < 1e-6 && litTicks > 0,
        `range ${JSON.stringify(dialRange)}, lit ticks ${litTicks}`);
      await page.screenshot({ path: path.join(scratch, 'ux-a-step1-print-angle.png') });
      const pickRotation = (await d.props()).activeRotation;
      await angleDial.focus();
      await angleDial.press('ArrowRight');
      await page.waitForFunction(() => (document.querySelector('.print-angle [data-ui="tilt-dial-value"]')?.textContent ?? '').startsWith('45.5'), null, { timeout: 10000 }).catch(() => {});
      const turnedRotation = (await d.props()).activeRotation;
      check('f3 turning the dial one step turns the preview to that tilt and shows its rule flags (no tips in Step 1)',
        (await angleText()).startsWith('45.5') && JSON.stringify(turnedRotation) !== JSON.stringify(pickRotation)
          && /passes every rule/i.test(await angleVerdict()) && (await page.getByText('Proposed support tips').count()) === 0,
        `"${await angleText()}", verdict "${(await angleVerdict()).replace(/\s+/g, ' ').slice(0, 120)}", rotation ${JSON.stringify(pickRotation)} -> ${JSON.stringify(turnedRotation)}`);
      await angleDial.press('End');
      await page.waitForFunction(() => (document.querySelector('.print-angle [data-ui="tilt-dial-value"]')?.textContent ?? '').startsWith('68.5'), null, { timeout: 10000 }).catch(() => {});
      const steep = await angleVerdict();
      // The rules are named in words a technician reads, not by the engine's own short ids (RULE_WORDS,
      // src/dental/angleEvidence.ts). The steepest tilt traps resin and sends supports through the shell.
      check('f4 the steepest tilt shows its failed rules by name',
        /breaks a rule/i.test(steep) && /Resin would be trapped/i.test(steep) && /Supports would cross/i.test(steep),
        `verdict "${steep.replace(/\s+/g, ' ').slice(0, 160)}"`);
      await d.button('Auto orientation').click();
      await page.waitForFunction(() => (document.querySelector('.print-angle [data-ui="tilt-dial-value"]')?.textContent ?? '').startsWith('44.5'), null, { timeout: 10000 }).catch(() => {});
      check('f5 Auto orientation returns the dial and the preview to the automatic pick',
        (await angleText()).startsWith('44.5') && JSON.stringify((await d.props()).activeRotation) === JSON.stringify(pickRotation), `"${await angleText()}"`);
      await d.button('Next').click();
      await stepTo('Step 2 · Support area', 180000);
      await page.waitForFunction(() => Number(document.querySelector('[data-ui="dental-tip-count"] .num')?.textContent ?? 0) > 0, null, { timeout: 240000 });
      check('u10 Step 2 shows the detected area with tips, and Next is on', await d.button('Next').isEnabled() && (await page.getByText('No support area was detected').count()) === 0);
      check('u1b in Step 2 the generic left and right panels are absent and the viewport buttons stay', (await page.locator('.panel.left, .panel.right').count()) === 0 && await page.getByRole('button', { name: 'Fit view', exact: true }).isVisible());
      // F's confirm rule: the pick holds, or the angle moves to the next tilt and says so (D15).
      const movedNotes = await page.getByText('Print angle moved to').allInnerTexts();
      const movedTo = movedNotes.map((note) => note.match(/([\d.]+)°/)?.[1]).find(Boolean);
      const shownAngle = await angleText().catch(() => '');
      const held = movedNotes.length === 0 && JSON.stringify((await d.props()).activeRotation) === JSON.stringify(pickRotation);
      // After Next the Step 1 label is gone: a move shows as the notice plus a rotation other than the pick's.
      const movedAndShown = movedTo !== undefined && JSON.stringify((await d.props()).activeRotation) !== JSON.stringify(pickRotation);
      check('f6 Next confirmed the automatic pick with a real build: it held, or it moved with the notice and a new rotation', held || movedAndShown, `moved notes ${movedNotes}, angle ${shownAngle}, rotation ${JSON.stringify((await d.props()).activeRotation)} vs ${JSON.stringify(pickRotation)}`);
      await page.screenshot({ path: path.join(scratch, 'ux-a-step2.png') });
      // PD.1: the area is vermilion; overhang low points outside it come from the worker ~0.5 s after the area last changed, listed with Show me.
      await page.waitForTimeout(2500);
      const riskRows = await page.locator('.dental-risks li').count();
      const riskShows = await page.locator('.dental-risks li button').count();
      note(`PD.1 overhang low points outside the default area on the reference aligner: ${riskRows}`);
      check('u10c Step 2 lists each low point outside the area with a Show me button', riskRows === riskShows, `${riskRows} rows, ${riskShows} buttons`);
      await page.screenshot({ path: path.join(scratch, 'pd1-step2-area.png') });
      // Step 2 controls (unit B): Paint / Erase anywhere, Area width, Area position and Support density, all live.
      const bar = page.locator('.dental-brush');
      check('u10b Step 2 offers Paint and Erase and the Area width, Area position and Support density sliders (no hidden setback)',
        await bar.getByRole('button', { name: 'Paint', exact: true }).isVisible() && await bar.getByRole('button', { name: 'Erase', exact: true }).isVisible() &&
        await page.locator('.dental-tuning label').filter({ hasText: 'Area width' }).isVisible() && await page.locator('.dental-tuning label').filter({ hasText: 'Area position' }).isVisible() &&
        await page.locator('.dental-tuning label').filter({ hasText: 'Support density' }).isVisible() && (await page.getByText('Rim setback').count()) === 0);
      const tipCount = async () => Number((await page.locator('[data-ui="dental-tip-count"] .num').innerText().catch(() => '0')) || 0);
      /** Waits for the retune and the tip preview it starts to finish; returns the time since `t0`. */
      const step2Settled = async (t0) => {
        await page.waitForFunction(() => /Updating support area|Finding safe/.test(document.body.innerText), null, { timeout: 5000 }).catch(() => {});
        await page.waitForFunction(() => !/Updating support area|Finding safe/.test(document.body.innerText) && Number(document.querySelector('[data-ui="dental-tip-count"] .num')?.textContent ?? 0) > 0, null, { timeout: 120000 });
        return Date.now() - t0;
      };
      const nudge = async (name, presses) => {
        const input = page.locator('.dental-tuning label').filter({ hasText: name }).locator('input');
        await input.focus();
        const t0 = Date.now();
        for (let k = 0; k < presses; k += 1) await input.press('ArrowRight');
        return step2Settled(t0);
      };
      const area0 = (await d.props()).activeDental;
      const widthMs = await nudge('Area width', 2);
      const area1 = (await d.props()).activeDental;
      check('u10c Area width widens the area and moves the tip preview onto its middle line',
        area1.tuning?.stripWidthMm > area0.tuning?.stripWidthMm && area1.faces > area0.faces && area1.tips !== area0.tips,
        `width ${area0.tuning?.stripWidthMm} -> ${area1.tuning?.stripWidthMm} mm, faces ${area0.faces} -> ${area1.faces}, tips ${area0.tips} -> ${area1.tips}, ${widthMs} ms`);
      const positionMs = await nudge('Area position', 3);
      const area2 = (await d.props()).activeDental;
      check('u10d Area position moves the area off the edge and the tips with it',
        area2.tuning?.positionMm > area1.tuning?.positionMm && area2.faces !== area1.faces && area2.tips !== area1.tips,
        `position ${area1.tuning?.positionMm} -> ${area2.tuning?.positionMm} mm, faces ${area1.faces} -> ${area2.faces}, tips ${area1.tips} -> ${area2.tips}, ${positionMs} ms`);
      note(`u10 live Step 2 updates (key press to tip preview, one debounce and one worker job included): width ${widthMs} ms, position ${positionMs} ms`);
      // Paint on the aligner body, well away from both edges (bottom view): new tips there; Erase the same stroke removes them.
      const bodyStrokes = [[[0.37, 0.47], [0.42, 0.52]], [[0.57, 0.62], [0.62, 0.55]], [[0.38, 0.42], [0.43, 0.47]]];
      /*
       * A STEP OPENS ON SELECT, the way a drawing program opens on the arrow: Select reads the model
       * without changing it, so until the operator picks a brush a drag marks nothing.
       *
       * This has to run HERE, at Step 2's own entry, before anything picks a tool - every other check in
       * this section clicks its tool first, which is exactly why the whole suite went on passing while the
       * app still opened on Paint. Checking it anywhere later would mean re-entering a step, and entering
       * Step 3 starts a support build just to read a button.
       */
      {
        const pressedNow = async () => {
          for (const name of ['Paint', 'Erase', 'Add', 'Select']) {
            if ((await bar.getByRole('button', { name, exact: true }).getAttribute('aria-pressed')) === 'true') return name;
          }
          return '';
        };
        const opened = await pressedNow();
        check('u10g Step 2 opens on Select, the tool that changes nothing', opened === 'Select', `pressed "${opened}"`);
        const quiet = (await d.props()).activeDental?.stamps ?? 0;
        await d.measureCanvas();
        await d.stroke(...bodyStrokes[0], 20);
        await d.idle(600);
        const inert = (await d.props()).activeDental?.stamps ?? 0;
        check('u10h resting on Select, a drag on the model marks nothing', inert === quiet, `stamps ${quiet} -> ${inert}`);
        /*
         * That drag TURNED THE VIEW, which is exactly what it is meant to do - and it leaves the model at a
         * new angle for everything below, which aims at the canvas by fraction. Drag the same stroke
         * BACKWARDS to put the camera where it was: the orbit follows the pointer, so the reverse undoes
         * it. (A Fit view key would reframe rather than restore, and is not in this step's chrome.)
         */
        await d.stroke(bodyStrokes[0][1], bodyStrokes[0][0], 20);
        await d.idle(600);
        await d.measureCanvas();

        /*
         * GOING BACK GOES OUT ONE LEVEL, AND THE STEP RESTS ON SELECT. Esc used to leave the WHOLE dental
         * flow from inside a tool; then it emptied the hand, which is a state no drawing program has. Now
         * it picks Select back up - the tool that changes nothing - and only leaves the flow from there.
         * The badge check is the point of the whole case: if Esc took the flow with it, there would be no
         * Step 2 badge left to read.
         */
        const stepBadge = async () => (await page.locator('.edit-badge').first().textContent()) ?? '';
        const putDown = () => bar.getByRole('button', { name: 'Put it down', exact: true });

        check('u10i there is no separate way to put a tool down: Select is on the switch',
          (await putDown().count()) === 0, `Put it down keys: ${await putDown().count()}`);

        await bar.getByRole('button', { name: 'Paint', exact: true }).click();
        await page.keyboard.press('Escape');
        await d.idle(300);
        const afterEsc = await pressedNow();
        check('u10j Esc goes back to Select and the step stays',
          afterEsc === 'Select' && /Step 2/i.test(await stepBadge()),
          `pressed "${afterEsc}", badge "${(await stepBadge()).slice(0, 24)}"`);

        /*
         * Picking a tool only ever picks it: the keys P/E/A/S run the same path, so a toggle would make
         * "press A to put Add in hand" depend on what was in hand before - which this walk caught once,
         * pressing `a` before setting Click reach and finding the field gone.
         */
        await bar.getByRole('button', { name: 'Paint', exact: true }).click();
        const armedAgain = await pressedNow();
        await bar.getByRole('button', { name: 'Paint', exact: true }).click();
        await d.idle(300);
        const stillArmed = await pressedNow();
        check('u10k picking the tool already in hand leaves it in hand, so its key stays idempotent',
          armedAgain === 'Paint' && stillArmed === 'Paint', `armed "${armedAgain}" -> pressed "${stillArmed}"`);

        // Select is the first segment, and one of the four is always pressed: the switch is never empty.
        const tools = bar.locator('[aria-label="Dental area tools"] button');
        const first = ((await tools.first().textContent()) ?? '').trim();
        await bar.getByRole('button', { name: 'Select', exact: true }).click();
        await d.idle(300);
        const afterKey = await pressedNow();
        check('u10l Select comes first on the switch and the switch always has one pressed',
          first === 'Select' && afterKey === 'Select', `first "${first}", pressed "${afterKey}"`);
      }

      const paintStroke = async (kind) => {
        await bar.getByRole('button', { name: kind, exact: true }).click();
        await d.measureCanvas();
        for (const [from, to] of bodyStrokes) {
          const stamps = (await d.props()).activeDental?.stamps ?? 0;
          const t0 = Date.now();
          await d.stroke(from, to, 20);
          // The drag itself is one frame per pointer move (about 0.1 s each in software GL); the
          // update is timed from the release.
          const released = Date.now();
          if (((await d.props()).activeDental?.stamps ?? 0) > stamps) return { stroke: [from, to], ms: await step2Settled(t0), drag: released - t0, update: Date.now() - released };
          // The drag began off the model and turned the view: put the view back and try the next spot.
          await page.getByRole('button', { name: 'Bottom view', exact: true }).click();
          await d.idle(800);
        }
        return undefined;
      };
      const tipsBefore = await tipCount();
      const painted = await paintStroke('Paint');
      const paintedTips = await tipCount();
      await page.screenshot({ path: path.join(scratch, 'ux-a-step2-painted.png') });
      check('u10e Paint outside the detected strip adds support tips there, and the status says so',
        painted !== undefined && paintedTips > tipsBefore && /Dental support area painted/.test(await d.status()),
        `tips ${tipsBefore} -> ${paintedTips}, ${painted ? `${painted.ms} ms (drag ${painted.drag} ms, release to tip preview ${painted.update} ms)` : 'no stroke reached the model'}`);
      if (painted) {
        await bar.getByRole('button', { name: 'Erase', exact: true }).click();
        const t0 = Date.now();
        await d.stroke(...painted.stroke, 20);
        const released = Date.now();
        const eraseMs = await step2Settled(t0);
        const erasedTips = await tipCount();
        check('u10f Erase over the same place removes the area and its tips again',
          erasedTips < paintedTips && erasedTips <= tipsBefore + ERASE_RESIDUE && /Dental support area erased/.test(await d.status()),
          `tips ${paintedTips} -> ${erasedTips} (before paint ${tipsBefore}), ${eraseMs} ms (drag ${released - t0} ms, release to tip preview ${t0 + eraseMs - released} ms)`);
      }

      // B3: Step 2's four tools, their keys, Add (exact hit, snapping, the up-facing warning) and Select with Delete.
      {
        const tools = bar.getByRole('group', { name: 'Dental area tools' });
        const pressedTool = async () => { for (const name of ['Paint', 'Erase', 'Add', 'Select']) if ((await tools.getByRole('button', { name, exact: true }).getAttribute('aria-pressed')) === 'true') return name; return ''; };

        // TRIMMED. Each tool key carries its picture as well as its word, so the raw text of the button is
        // the label wrapped in the whitespace around the icon. This check is about WHICH TOOLS ARE OFFERED,
        // not about how the markup is laid out, and it failed for years' worth of runs on that difference
        // alone - reporting an empty list, which said nothing about why.
        const toolNames = (await tools.getByRole('button').allTextContents()).map((name) => name.trim());
        // SELECT FIRST: the switch opens where a drawing program opens, on the tool that changes nothing.
        check('b3a Step 2 offers the four tools, Select first, then Paint, Erase and Add',
          toolNames.join('|') === 'Select|Paint|Erase|Add', `[${toolNames.join('|')}]`);
        const byKey = [];
        for (const key of ['p', 'e', 'a', 's']) { await page.keyboard.press(key); byKey.push(await pressedTool()); }
        check('b3b the keys P, E, A and S switch the tools', byKey.join('|') === 'Paint|Erase|Add|Select', byKey.join('|'));
        const unitNow = async () => (await d.props()).units[0];
        const reach = bar.locator('[data-ui="click-reach"] input');
        const setReach = async (value) => { await page.keyboard.press('a'); await reach.fill(value); await reach.press('Enter'); await previewReady(page); };
        const spots = [[0.38, 0.47], [0.42, 0.52], [0.57, 0.62], [0.5, 0.5], [0.44, 0.55], [0.53, 0.45], [0.47, 0.6], [0.62, 0.55]];
        /** Add at the first spot from `skip` on that takes a tip: the unit before and after, and the status line. */
        const addSomewhere = async (skip = 0) => {
          for (const spot of spots.slice(skip)) {
            await previewReady(page);
            const was = await unitNow();
            await page.mouse.click(...d.at(...spot));
            await d.idle(700);
            const now = await unitNow();
            if (now.manual === was.manual + 1) return { was, now, status: await d.status(), spot };
          }
          return undefined;
        };
        if (painted) {
          await page.keyboard.press('p');
          const shownBefore = await tipCount();
          const t0 = Date.now();
          await d.stroke(...painted.stroke, 20);
          await step2Settled(t0);
          const shownAfter = await tipCount();
          await page.keyboard.press('e');
          const t1 = Date.now();
          await d.stroke(...painted.stroke, 20);
          await step2Settled(t1);
          const hiddenAgain = await tipCount();
          check('b3c with the keys: Paint reveals suggested tips, Erase hides them again',
            shownAfter > shownBefore && hiddenAgain < shownAfter && hiddenAgain <= shownBefore + ERASE_RESIDUE,
            `tips ${shownBefore} -> ${shownAfter} -> ${hiddenAgain} (residue allowed ${ERASE_RESIDUE})`);
        }
        // Add with a tiny reach lands on the exact hit; the tip is a manual one and survives a density change.
        await setReach('0.1');
        const exact = await addSomewhere();
        check('b3d Add on the aligner places a manual tip at the hit and says so', exact !== undefined && exact.now.deleted === exact.was.deleted && exact.status === 'Support added.', exact ? `manual ${exact.was.manual} -> ${exact.now.manual}, deleted ${exact.was.deleted} -> ${exact.now.deleted}, status "${exact.status}"` : 'no spot took a tip');
        await nudge('Support density', 1);
        const kept = await unitNow();
        check('b3e a manual tip survives a density change', exact !== undefined && kept.manual === exact.now.manual, `manual ${exact?.now.manual} -> ${kept.manual}`);
        // Add within Click reach of a suggested tip (shown or hidden) lands on it: that tip is deleted in the same step, so the two never stand together.
        await setReach('40');
        const snapped = await addSomewhere(1);
        let undone;
        if (snapped) {
          await page.keyboard.press('Control+z');
          await d.idle(800);
          undone = await unitNow();
        }
        check('b3f Add within Click reach of a suggested tip takes its place in one step (manual +1, that tip deleted; one Undo gives both back)',
          snapped !== undefined && snapped.now.deleted === snapped.was.deleted + 1 && undone?.manual === snapped.was.manual && undone?.deleted === snapped.was.deleted,
          snapped ? `manual ${snapped.was.manual} -> ${snapped.now.manual} -> ${undone?.manual}, deleted ${snapped.was.deleted} -> ${snapped.now.deleted} -> ${undone?.deleted}` : 'no spot took a tip');
        // Select a tip (Click) and Delete: it is gone, and stays gone after the next rebuild.
        await previewReady(page);
        await page.keyboard.press('s');
        const tipsBeforeDelete = await tipCount();
        const beforeDelete = await unitNow();
        let picked = 0;
        for (const spot of spots) {
          await page.mouse.click(...d.at(...spot));
          await d.idle(500);
          picked = (await d.props()).selected;
          if (picked > 0) break;
        }
        await page.keyboard.press('Delete');
        await d.idle(500);
        await previewReady(page);
        const afterDelete = await unitNow();
        const tipsAfterDelete = await tipCount();
        check('b3g Select (Click) a tip and Delete removes it', picked === 1 && (await d.props()).selected === 0 && (beforeDelete.manual - afterDelete.manual) + (afterDelete.deleted - beforeDelete.deleted) === 1 && tipsAfterDelete === tipsBeforeDelete - 1,
          `selected ${picked}, manual ${beforeDelete.manual} -> ${afterDelete.manual}, deleted ${beforeDelete.deleted} -> ${afterDelete.deleted}, tips ${tipsBeforeDelete} -> ${tipsAfterDelete}`);
        await setReach('0.1');
        const rebuilt = await addSomewhere(2);
        await previewReady(page);
        const tipsAfterRebuild = await tipCount();
        check('b3h a deleted tip stays removed after the next rebuild', rebuilt !== undefined && tipsAfterRebuild === tipsAfterDelete + 1 && rebuilt.now.deleted === afterDelete.deleted, `tips ${tipsAfterDelete} -> ${tipsAfterRebuild}, deleted ${afterDelete.deleted} -> ${rebuilt?.now.deleted}`);
        // Select (Drag over) takes several tips, and Esc drops the selection before it leaves the step.
        await page.keyboard.press('s');
        const howToSelect = page.getByRole('group', { name: 'How to select' });
        await howToSelect.getByRole('button', { name: 'Drag over', exact: true }).click();
        await d.idle(500);
        await d.stroke([0.38, 0.5], [0.62, 0.5], 25);
        const swept = await d.settle();
        await page.keyboard.press('Escape');
        await d.idle(400);
        check('b3i Select (Drag over) takes several tips, and Esc drops the selection first', swept.selected > 1 && (await d.props()).selected === 0 && (await page.locator('.edit-badge').textContent()).toLowerCase().includes('step 2'), `selected ${swept.selected}`);
        await howToSelect.getByRole('button', { name: 'Click', exact: true }).click();
        // Add on a spot that faces up shows the warning on the status line.
        await page.keyboard.press('a');
        const up = await addOnUpFacingSpot(page, 'This spot faces up, so a tip here may not hold.');
        check('b3j Add on an up-facing spot still adds, and the status line warns that it may not hold', up.found && up.added, `${up.status} (${up.tried.join(' ')})`);
        await page.getByRole('button', { name: 'Bottom view', exact: true }).click();
        await d.idle(600);
      }
      await d.button('Back').click();
      await stepTo('Step 1 · Aligner');
      check('u11 Back from Step 2 returns to Step 1 with the oriented aligner kept', await d.button('Next').isEnabled() && (await page.getByText('Place the aligner file here').count()) === 0);
      await d.button('Exit').click();
      await page.waitForFunction(() => !document.querySelector('.edit-badge'), null, { timeout: 5000 });
      const left = await d.counts();
      check('u12 Exit leaves the aligners on the plate without supports', (await page.locator('.panel.left [inert]').count()) === 0 && Number(await objects()) >= 1 && left.auto === 0, `objects ${await objects()}, automatic supports ${left.auto}`);
    }

    // x. Dental flow, Step 3 and finish: two aligners end to end (the repo's reference aligner twice).
    if (runs('x')) {
      const reference = PUBLIC_ALIGNER;
      const drop = (file) => page.setInputFiles('input[aria-label="Choose aligner file"]', file);
      const stepTo = async (text, ms = 20000) => page.waitForFunction((word) => (document.querySelector('.edit-badge')?.textContent ?? '').toLowerCase().includes(word.toLowerCase()), text, { timeout: ms });
      const objects = async () => (await page.locator('footer').innerText()).match(/(\d+) objects?/)?.[1];
      const label = page.locator('.dental-side input.dental-label');
      /** A Step 3 control by its stable name, e.g. `aligner-tip-size` (docs/ui-styling.md). */
      const named = (ui) => page.locator(`.dental-side [data-ui="${ui}"] input`);
      /**
       * Step 3 leads with the verdict and keeps the settings behind a folded Adjust, as denture Step 2 does,
       * so anything that reads a setting opens Adjust first. It remembers its state for the session, hence
       * the check before the click.
       */
      const openAdjust = async (name = 'aligner-adjust') => {
        const title = page.locator(`[data-ui="${name}-title"]`);
        if ((await title.getAttribute('aria-expanded')) === 'false') await title.click();
        await d.idle(400);
      };
      /** The same, for the step's verdict line. */
      const openDetails = async (name = 'aligner') => {
        const toggle = page.locator(`[data-ui="${name}-review-details-toggle"]`);
        if ((await toggle.count()) > 0 && (await toggle.getAttribute('aria-expanded')) === 'false') await toggle.click();
        await d.idle(400);
      };
      const slider = (ui) => named(ui);
      /** One aligner from a fresh entry (first) or from Step 1 through to Step 3, supports built. */
      const toStep3 = async (first) => {
        if (first) {
          await page.goto(url);
          await enterEditor(page);
          await d.button('Aligner Support Production').click();
        }
        await stepTo('Step 1 · Aligner');
        await drop(reference);
        await stepTo('Review the orientation', 180000);
        await d.button('Next').click();
        await stepTo('Step 2 · Support area', 180000);
        await page.waitForFunction(() => Number(document.querySelector('[data-ui="dental-tip-count"] .num')?.textContent ?? 0) > 0, null, { timeout: 240000 });
        if (first) check('x0 Step 2 no longer carries the Tree and Brace toggles', (await page.getByText('Tree branches').count()) === 0 && (await page.getByText('Cross-braces').count()) === 0);
        await d.button('Next').click();
        await stepTo('Step 3 · Supports', 240000);
        await page.waitForFunction((want) => { const on = [...document.querySelectorAll('button')].find((b) => (b.textContent ?? '').trim().toLowerCase() === want); return on && !on.disabled; }, WAY_ON.toLowerCase(), { timeout: 300000 });
        await d.quiet();
      };
      const wait = async (ok, what, ms = 240000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await ok()) return true; await d.idle(300); } throw new Error(`timed out: ${what}`); };

      await toStep3(true);
      await d.measureCanvas();
      await page.screenshot({ path: path.join(scratch, 'ux-c-step3-1440x900.png') });
      // The finish controls stay in view without scrolling, at the walk size and at 1280x720.
      const finishInView = () => page.evaluate(({ back, wayOn, another }) => {
        const side = document.querySelector('.dental-side');
        // Exit lives in the header, not in the step panel, so it is always on screen and not checked here.
        const names = [back, wayOn, another];
        const boxes = names.map((name) => [...side.querySelectorAll('button')].find((b) => (b.textContent ?? '').trim().toLowerCase() === name.toLowerCase())?.getBoundingClientRect());
        // The ID label moved into Adjust when Step 3 took the denture Step 2 shape, so it is no longer one
        // of the controls that has to be in view to finish.
        return boxes.every((r) => r && r.top >= 0 && r.bottom <= window.innerHeight && r.height > 0);
      }, { back: 'Back', wayOn: WAY_ON, another: 'Add another aligner' });
      const at1440 = await finishInView();
      await page.setViewportSize({ width: 1280, height: 720 });
      await d.idle(600);
      await page.getByRole('button', { name: 'Fit view', exact: true }).click({ timeout: 5000 });
      await d.idle(1200);
      await page.screenshot({ path: path.join(scratch, 'ux-c-step3-1280x720.png') });
      const at1280 = await finishInView();
      await page.setViewportSize(VIEWPORT);
      await d.idle(600);
      await d.measureCanvas();
      check(`x1b Step 3 finish controls (Back, Exit, ${WAY_ON}, Add another aligner) are in view without scrolling at 1440x900 and 1280x720`, at1440 && at1280, `1440x900 ${at1440}, 1280x720 ${at1280}`);
      await openDetails();
      await openAdjust();
      // textContent, not innerText: the theme sets every panel title in caps, so "Problems" reads "PROBLEMS".
      const side = (await page.locator('.dental-side').textContent()).toLowerCase();
      check(`x1 Step 3 lists tip size, lift height, raft, Tree, Brace, the support tools, problems, the ID label, ${WAY_ON} and Add another aligner`,
        ['tip size', 'lift height', 'raft', 'tree branches', 'cross-braces', 'add supports', 'problems', 'id label', WAY_ON.toLowerCase(), 'add another aligner'].every((word) => side.includes(word)), side.replace(/\s+/g, ' ').slice(0, 200));
      // U1: every notice in the panel uses its full width, its buttons on their own row below the text, inside the scroll content.
      const notices = await page.evaluate(() => {
        const panel = document.querySelector('.dental-side');
        const box = panel.getBoundingClientRect();
        const rows = [...panel.querySelectorAll('.dental-block li')];
        return {
          count: rows.length,
          scrolls: getComputedStyle(panel).overflowY === 'auto' && [...panel.querySelectorAll('.dental-scroll, .dental-block')].every((el) => getComputedStyle(el).overflowY === 'visible'),
          bad: rows.filter((row) => {
            const r = row.getBoundingClientRect();
            const text = row.querySelector('.problem-text')?.getBoundingClientRect();
            const buttons = [...row.querySelectorAll('button')].map((b) => b.getBoundingClientRect());
            const inside = r.left >= box.left && r.right <= box.right + 1 && row.offsetTop + row.offsetHeight <= panel.scrollHeight + panel.scrollTop + 1000;
            return !(inside && text && text.right <= box.right + 1 && buttons.every((b) => b.top >= text.bottom - 1 && b.right <= box.right + 1 && b.bottom <= r.bottom + 1));
          }).length,
        };
      });
      check('u1c Step 3 panel is one scroll area (the blocks do not scroll) and each notice shows in full: text on top, buttons on their own row below', notices.scrolls && notices.bad === 0, JSON.stringify(notices));
      check('b3k Step 3 shows no Paint, Erase or density', (await page.getByRole('button', { name: 'Paint', exact: true }).count()) === 0 && (await page.getByRole('button', { name: 'Erase', exact: true }).count()) === 0 && !side.includes('Support density') && !side.includes('Dental area tools'), side.replace(/\s+/g, ' ').slice(0, 160));
      const switchOn = (ui) => named(ui).isChecked();
      await openAdjust();
      const startValues = { tip: await slider('aligner-tip-size').inputValue(), lift: await slider('aligner-lift-height').inputValue(), tree: await switchOn('aligner-tree-branches'), brace: await switchOn('aligner-cross-braces'), raft: await switchOn('aligner-raft') };
      check('x1c Step 3 starts with the aligner type defaults: 0.45 mm tip, 3.5 mm lift, raft on, Tree off, Brace on (D21)',
        Number(startValues.tip) === 0.45 && Number(startValues.lift) === 3.5 && startValues.raft && !startValues.tree && startValues.brace, JSON.stringify(startValues));
      check('x2 the ID label field starts as X and is reachable by its name', (await label.inputValue()) === 'X' && (await page.getByLabel('ID label', { exact: true }).count()) >= 1, `value "${await label.inputValue()}"`);
      await label.fill('');
      await label.pressSequentially('a-1b_$%é .');
      const typed = await label.inputValue();
      await label.fill('abcdefghijkl');
      const capped = await label.inputValue();
      check('x3 the Label field takes only A-Z 0-9 and -, uppercases letters, and stops at 8 characters', typed === 'A-1B' && capped === 'ABCDEFGH', `typed "${typed}", long "${capped}"`);
      await label.fill('L-1');
      await d.idle(500);
      check('x4 the typed label is stored with the aligner', (await d.props()).units[0]?.label === 'L-1', `label "${(await d.props()).units[0]?.label}"`);

      // Delete a drag-selected group of supports, then add one by hand.
      await d.button('Select supports').click();
      await d.button('Drag over').click();
      await d.idle(2500);
      const before = await d.counts();
      /*
       * SWEEP WHERE THE SUPPORTS ARE. These three lines ran from x 0.15 to 0.55 and found nothing, because
       * the aligner sits right of centre in Step 3 - its supports fall between about x 0.5 and x 0.76 - so
       * the strokes crossed empty plate and barely clipped its left edge. The Step 3 panel starts around
       * x 0.8, so the band from 0.3 to 0.78 is canvas the pointer can use.
       *
       * It sweeps a ladder of lines across that band rather than trusting any one of them: where the model
       * lands depends on the print angle the step was entered with.
       */
      let picked = { selected: 0 };
      const sweeps = [0.42, 0.52, 0.62, 0.34, 0.7].map((fy) => [[0.32, fy], [0.78, fy]]);
      for (const [from, to] of [...sweeps, [[0.34, 0.34], [0.76, 0.68]], [[0.34, 0.68], [0.76, 0.34]]]) {
        await d.stroke(from, to, 24);
        picked = await d.settle();
        if (picked.selected > 0) break;
      }
      await page.screenshot({ path: path.join(scratch, 'ux-b-x6.png') });
      note(`x6 edit-count "${(await page.locator('.edit-count').allInnerTexts()).join('|')}", status "${await d.status()}"`);
      check('x6 Step 3 selects supports with the Support Edit Mode tools', picked.selected > 0, `selected ${picked.selected}`);
      // Delete is disabled with nothing selected, so clicking it would wait 30 s and then throw, taking
      // every check below it down with the run. If x6 found nothing, x7 has nothing to test and says so.
      const canDelete = picked.selected > 0 && await d.button('Delete').isEnabled().catch(() => false);
      if (canDelete) { await d.button('Delete').click(); await d.idle(800); }
      const afterDelete = await d.counts();
      check('x7 Delete removes the selected supports', canDelete && afterDelete.removed > before.removed,
        canDelete ? `removed ${before.removed} -> ${afterDelete.removed}` : 'nothing was selected to delete');
      await d.button('Add supports').click();
      let added = false;
      // The print angle (F) decides where the aligner sits in view: a few fixed spots, then a grid,
      // all left of the Step 3 panel (a click on the panel would change the tool).
      const grid = Array.from({ length: 12 }, (_, i) => 0.08 + i * 0.04).flatMap((x) => Array.from({ length: 8 }, (_, j) => [x, 0.36 + j * 0.04]));
      for (const point of [[0.5, 0.3], [0.5, 0.7], [0.3, 0.5], [0.4, 0.4], [0.35, 0.65], ...grid]) {
        const [px, py] = d.at(...point);
        await page.mouse.click(px, py);
        await d.idle(500);
        if ((await d.counts()).manual > afterDelete.manual) { added = true; break; }
      }
      const handWork = await d.counts();
      await page.screenshot({ path: path.join(scratch, 'ux-b-x8.png') });
      check('x8 Add supports adds one by hand', added, `manual ${afterDelete.manual} -> ${handWork.manual}, status "${await d.status()}"`);

      const raft = named('aligner-raft');
      await raft.uncheck();
      check('x5 raft off says the label needs it', await page.getByText('Turn the raft on to print it').isVisible());
      await raft.check();
      await d.quiet();
      // The raft switch rebuilt the supports: wait until the build is on screen before the brush needs it.
      await page.waitForFunction(() => !document.querySelector('footer .building'), null, { timeout: 120000 });
      await d.idle(2500);

      // A setting change regenerates and keeps the hand work.
      const yBefore = (await d.props()).units[0].pos[1];
      await slider('aligner-lift-height').focus();
      await slider('aligner-lift-height').press('ArrowRight');
      await wait(async () => Math.abs((await d.props()).units[0].pos[1] - yBefore) > 0.2, 'lift regenerated');
      await d.quiet();
      const afterLift = await d.counts();
      check('x9 a lift change regenerates the supports and keeps the manual edits', afterLift.manual === handWork.manual, `manual ${handWork.manual} -> ${afterLift.manual}, removed ${handWork.removed} -> ${afterLift.removed}, status "${await d.status()}"`);

      // Every Step 3 control: the Problems section greys while its change is on the way to a new verdict, then clears.
      {
        const problems = page.locator('.dental-side section[aria-busy]');
        await page.evaluate(() => {
          window.__staleSeen = 0;
          /*
           * RACE-FREE. This used to look the DOM up inside the callback and count what it found there.
           * MutationObserver BATCHES: if the panel greys and clears again between two batches, the lookup
           * at callback time sees neither state and the greying goes unrecorded - the check then reports
           * "stale seen 0x" for a panel that greyed perfectly well.
           *
           * The record's OLD VALUE cannot be missed that way. A class list that used to carry `is-stale`
           * is proof the panel was stale at that moment, whatever it says by the time this runs.
           */
          new MutationObserver((records) => {
            for (const record of records) {
              const was = record.oldValue ?? '';
              const now = record.target instanceof Element ? record.target.className : '';
              if (/\bis-stale\b/.test(was) || (typeof now === 'string' && /\bis-stale\b/.test(now))) window.__staleSeen += 1;
            }
          }).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['class', 'aria-busy'], attributeOldValue: true });
        });
        const verdictBack = async () => {
          await d.quiet();
          await page.waitForFunction(() => { const el = document.querySelector('.dental-side section[aria-busy]'); return el && !el.classList.contains('is-stale') && el.getAttribute('aria-busy') === 'false'; }, null, { timeout: 120000 });
        };
        const controls = [
          ['Tip size', async () => { await slider('aligner-tip-size').focus(); await slider('aligner-tip-size').press('ArrowRight'); }],
          ['Pillar size', async () => { await slider('aligner-pillar-size').focus(); await slider('aligner-pillar-size').press('ArrowRight'); }],
          ['Lift height', async () => { await slider('aligner-lift-height').focus(); await slider('aligner-lift-height').press('ArrowLeft'); }],
          ['Raft', async () => { const box = named('aligner-raft'); await box.uncheck(); await d.idle(700); await verdictBack(); await box.check(); }],
          ['Tree branches', async () => { await named('aligner-tree-branches').click(); }],
          ['Cross-braces', async () => { await named('aligner-cross-braces').click(); }],
        ];
        const outcome = [];
        for (const [name, act] of controls) {
          await page.evaluate(() => { window.__staleSeen = 0; });
          await act();
          await verdictBack();
          outcome.push(`${name}: stale seen ${await page.evaluate(() => window.__staleSeen)}x`);
        }
        const seenAll = outcome.every((line) => !line.endsWith(' 0x'));
        check('x9b each Step 3 control (Tip size, Pillar size, Lift height, Raft, Tree branches, Cross-braces) greys the Problems section until its new verdict arrives, then clears it', seenAll && (await problems.getAttribute('aria-busy')) === 'false', outcome.join('; '));
      }

      // Problems: the check runs inside the step and lists what it finds with Show and Fix.
      await d.button('Check for unsupported spots').click();
      await d.quiet();
      await d.idle(800);
      const listed = await page.locator('.dental-side .problems li').count();
      // The one outside-the-support-area note is informational: Show me only, no Fix.
      const notes = await page.locator('.dental-side .problems li:has(.problem-kind.outside)').count();
      check('x10 Check supports inside Step 3 reports into the problem list (each finding has Show me and Fix; the outside-area note only Show me)', listed === 0 || (await page.locator('.dental-side .problems li button').count()) >= 2 * listed - notes, `${listed} listed, ${notes} outside-area note`);
      if (listed > notes) {
        const addButton = page.locator('.dental-side').getByRole('button', { name: 'Add supports' });
        await page.locator('.dental-side').getByRole('button', { name: 'Select supports', exact: true }).click();
        await d.idle(300);
        const addBefore = await addButton.getAttribute('aria-pressed');
        await page.locator('.dental-side .problems li').first().getByRole('button', { name: 'Fix' }).click();
        await d.idle(400);
        const addAfter = await addButton.getAttribute('aria-pressed');
        check('x11 Fix opens Add supports at the spot', addBefore === 'false' && addAfter === 'true', `Add supports pressed ${addBefore} -> ${addAfter}, status "${await d.status()}"`);
      }

      // Back asks first because hand work would be lost; Stay keeps it.
      await d.button('Back').click();
      check('x12 Back from Step 3 asks before discarding manual edits', await page.getByText('Discard and go back').isVisible());
      await page.getByRole('button', { name: 'Stay' }).click();
      check('x13 Stay keeps Step 3 and the edits', (await page.locator('.edit-badge').textContent()).toLowerCase().includes('step 3 · supports') && (await d.counts()).manual === afterLift.manual);

      // First aligner finished with Add another aligner: back to Step 1 with the same type.
      await d.button('Add another aligner').click();
      await stepTo('Step 1 · Aligner');
      check('x14 Add another aligner returns to Step 1 and asks for the next file, same type',
        await page.getByText('Place the aligner file here').isVisible() && (await page.getByRole('button', { name: 'Use the selected model' }).count()) === 0 && (await objects()) === '1');

      // Second aligner.
      await toStep3(false);
      await label.fill('R-2');
      await d.idle(500);
      await page.screenshot({ path: path.join(scratch, 'ux-b-step3-second.png') });
      /*
       * THE END OF THE FLOW (FLOW_END, src/scenes/sceneMap.ts). Step 3 exports the aligner itself
       * instead of handing back the workspace, so what used to be checked here - the plate with both
       * aligners as ordinary objects, the left panel live again, the done note pointing at the right
       * panel's Export STL - no longer happens, and that is not a gap: those were checks of the
       * hand-off, and the hand-off is what was removed. The workspace itself is untouched and the
       * x section still covers it in full, reached by Any model as before. What replaces them is the
       * export this step now does, and the fact that the step SURVIVES it.
       */
      await d.quiet();
      await d.idle(800);
      await page.screenshot({ path: path.join(scratch, 'ux-c-step3-end.png') });
      const finished = await d.props();
      check('x15 both aligners are on the plate with their supports while Step 3 is still up',
        (await objects()) === '2' && finished.units.length === 2 && finished.units.every((unit) => unit.supports && unit.dental), `objects ${await objects()}`);
      check('x16 both aligners carry their own label', finished.units[0].label === 'L-1' && finished.units[1].label === 'R-2', `labels ${finished.units.map((unit) => unit.label).join(', ')}`);

      // The step's own export: one file, the active aligner and its supports.
      const download = page.waitForEvent('download', { timeout: 600000 });
      await d.button(WAY_ON).click();
      const exported = path.join(scratch, 'step3-export.stl');
      await (await download).saveAs(exported);
      const { count } = stlVertexXs(readFileSync(exported));
      check(`x17 ${WAY_ON} at the end of Step 3 writes the aligner and its supports as one file`, count > 1000, `triangles ${count}`);
      /*
       * AND IT DOES NOT NAVIGATE. `runExport` reports a refusal (the model changed, the supports did
       * not build, the safety check could not judge) through the status line and returns the same way
       * it does on success, so a press that also moved the operator on would walk them away from a
       * file that was never written. The step staying up is the whole guard against that.
       */
      await d.idle(800);
      check('x18 the step stays up after the export, so a refused export can never strand the operator',
        /step 3/i.test((await page.locator('.edit-badge').textContent()) ?? ''), `badge "${((await page.locator('.edit-badge').textContent()) ?? '').trim().slice(0, 40)}"`);
      /*
       * THE HANDOVER, NOT THE STEP - the lesson this project already wrote down and I repeated.
       *
       * Export writes the file; Exit is the way out of the step. `exitCommands` strips the supports
       * and the dental policy of any aligner the flow has not FINISHED, and OK was the only thing
       * that ever finished one. With OK gone under FLOW_END, Export wrote a correct STL and Exit
       * then emptied the plate behind it. x15-x18 all passed, because not one of them pressed Exit
       * after Export. This check is that press.
       *
       * Both aligners must survive it, by two different routes: the first was finished by Add
       * another aligner, the second by the export. Before the fix this came back 1 of 2.
       */
      await d.button('Exit').click();
      await d.idle(1200);
      await d.quiet();
      const afterExit = await d.props();
      const kept = afterExit.units.filter((unit) => unit.supports && unit.dental).length;
      check('x18b Exit after Export keeps the exported aligner with its supports and its policy',
        afterExit.units.length === 2 && kept === 2, `units ${afterExit.units.length}, still supported and dental ${kept}`);
      const [first, second] = finished.units;
      check('x19 the two aligners sit apart on the plate', Math.abs(first.pos[0] - second.pos[0]) > 20 || Math.abs(first.pos[2] - second.pos[2]) > 20, `centres ${first.pos.map((v) => v.toFixed(0))} / ${second.pos.map((v) => v.toFixed(0))}`);
    }

    // l. The dental flow against the REAL case fixture, when this machine has one - a separate section from
    // `u`, which runs the same flow on the reference aligner that ships with the repo.
    if (runs('l') && dentalFixture) {
      // The Dental lane never checks a patient model into the repository: the fixture is read in place from
      // wherever it already lives (see PUBLIC_ALIGNER / CASE_01_ALIGNER at the top).
      await page.goto(url);
      await enterEditor(page);
      await d.button('Aligner Support Production').click();
      await page.setInputFiles('input[aria-label="Choose aligner file"]', dentalFixture);
      await page.waitForFunction(() => document.body.innerText.includes('Review the orientation'), null, { timeout: 180000 });
      await page.screenshot({ path: path.join(scratch, 'dental-orientation.png') });
      check('l0 Step 1 offers orientation and Next without premature Done',
        await d.button('Auto orientation').isVisible() && await d.button('Next').isVisible() && await d.button('Done', false).count() === 0);
      await d.button('Auto orientation').click();
      check('l1 automatic orientation stays in Step 1', (await page.locator('.edit-badge').textContent()).toLowerCase().includes('step 1 · aligner'));
      await d.button('Next').click();
      await page.waitForFunction(() => document.body.innerText.includes('Step 2 · Support area'), null, { timeout: 90000 });
      await d.idle(1000);
      const approved = await d.props();
      check('l2 dental area holds the two-contour face mask', approved.dentalKind === 'two-contour' && approved.dentalStamps === 0, `policy "${approved.dentalKind}", manual markers ${approved.dentalStamps}`);
      await page.waitForFunction(() => Number(document.querySelector('[data-ui="dental-tip-count"] .num')?.textContent ?? 0) > 0, null, { timeout: 180000 });
      await page.screenshot({ path: path.join(scratch, 'dental-area.png') });
      check('l2b Step 2 offers paint and Next without premature Done',
        await d.button('Paint').isVisible() && await d.button('Erase').isVisible() && await d.button('Next').isVisible() && await d.button('Done', false).count() === 0);
      const baseline = await d.props();
      const waitForTuning = async (key, value) => {
        for (let attempt = 0; attempt < 300; attempt += 1) {
          const props = await d.props();
          if (props.dentalTuning?.[key] === value) return props;
          await d.idle(200);
        }
        throw new Error(`Dental ${key} did not update to ${value}`);
      };
      const stripWidth = page.locator('.dental-tuning label').filter({ hasText: 'Area width' }).locator('input');
      await stripWidth.focus();
      await stripWidth.press('ArrowRight');
      const widened = await waitForTuning('stripWidthMm', 0.6);
      check('l2c strip width updates the live painted face mask',
        widened.dentalFaces !== baseline.dentalFaces, `faces ${baseline.dentalFaces} -> ${widened.dentalFaces}`);
      const density = page.locator('.dental-tuning label').filter({ hasText: 'Support density' }).locator('input');
      await density.focus();
      await density.press('ArrowRight');
      const denser = await waitForTuning('density', 1.1);
      await page.waitForFunction(() => Number(document.querySelector('[data-ui="dental-tip-count"] .num')?.textContent ?? 0) > 0, null, { timeout: 180000 });
      check('l2d support density updates the live tip preview',
        denser.dentalContacts !== widened.dentalContacts,
        `candidate tips ${widened.dentalContacts} -> ${denser.dentalContacts}`);
      check('l2f Tree and Brace moved out of Step 2 (they are in Step 3)', (await page.getByText('Tree branches').count()) === 0);
      /*
       * The generic right panel is not SHOWN in the dental flow at all - the dental workspace is the scene
       * with its own dock and nothing else - so there is nothing left for it to contradict. This used to
       * read that panel's words, which meant waiting out a 30 s timeout on an element that is not there.
       * Absence is the stronger guarantee, so absence is what is checked.
       */
      const genericPanels = await page.locator('.panel.right').count();
      check('l2g the generic structure panel is not shown beside dental Step 2, so it cannot contradict it',
        genericPanels === 0, `right panels on screen ${genericPanels}`);
      const areaPosition = page.locator('.dental-tuning label').filter({ hasText: 'Area position' }).locator('input');
      await areaPosition.focus();
      await areaPosition.press('ArrowRight');
      const shifted = await waitForTuning('positionMm', 0.3);
      check('l2e area position moves the live permitted area',
        shifted.dentalFaces !== denser.dentalFaces,
        `faces ${denser.dentalFaces} -> ${shifted.dentalFaces}`);
      await d.button('Next').click();
      await page.waitForFunction(() => document.body.innerText.includes('Step 3 · Supports'), null, { timeout: 240000 });
      await page.waitForFunction(() => /[1-9][\d,]* automatic/.test(document.querySelector('footer')?.innerText ?? '') && ![...document.querySelectorAll('button')].some((b) => /Generating dental supports/.test(b.innerText)), null, { timeout: 240000 });
      await d.quiet();
      await d.button(WAY_ON).waitFor({ state: 'visible', timeout: 300000 });
      await page.screenshot({ path: path.join(scratch, 'dental-generated.png') });
      /*
       * WAIT FOR THE MESH, not just for the button. The checks below are about the support mesh generation
       * produced, and the way-on button appears as the step settles - which is not the same moment the mesh
       * finishes filling. Read too early and the mesh object is there but EMPTY: no triangles, no
       * components, no rim coverage, which reads as a total failure of generation rather than as a race.
       *
       * If it never fills, the wait runs out and the note says so - that is the answer, not a workaround.
       */
      let placed = await d.props();
      for (let tries = 0; tries < 60 && !(placed.tris > 0); tries += 1) {
        await d.idle(1000);
        placed = await d.props();
      }
      if (!(placed.tris > 0)) note('l3 waited 60 s and the support mesh was still empty');
      const dentalSupports = await d.counts();
      check('l3 dental generation finishes a support mesh only after the approved-area stage',
        // The review gap shows the TUNING REACHED THE FINAL MESH: the checks above raised the support
        // density, so the gap must have tightened below the 8 mm it starts at. It used to be pinned to
        // exactly 8 / 1.1, an arithmetic constant true only for one particular run of slider nudges - and
        // the nudges before it have changed since (b3e now moves the density too), so the constant broke
        // while nothing about generation had.
        dentalSupports.auto > 0 && placed.dentalKind === 'two-contour' && placed.tris > 0 && placed.drawn > 0
          && placed.droppedDrawn === 0 && placed.dentalReviewGap > 0 && placed.dentalReviewGap < 8,
        `automatic ${dentalSupports.auto}, mesh triangles ${placed.tris}, drawn ${placed.drawn}, forbidden secondary landings dropped ${placed.dropped}, dropped still drawn ${placed.droppedDrawn}, tuned review gap ${placed.dentalReviewGap}`);
      /*
       * A CHECK THAT CANNOT READ ITS SUBJECT MUST FAIL, NOT THROW. This read the note with a bare
       * `innerText()`, which waits 30 s and then throws if the note is not on screen - and a throw here
       * abandons every check after it, so one missing sentence cost the whole rest of the walk. The review
       * notes also appear only once the review has finished, so it is given time to arrive first.
       */
      const rimNote = page.locator('.dental-side').getByText(/Automatic dental rim gaps/).first();
      const rimShown = await rimNote.waitFor({ state: 'visible', timeout: 60000 }).then(() => true).catch(() => false);
      const rimWarning = rimShown ? await rimNote.innerText() : '(no rim gap note on screen)';
      /*
       * DISCLOSED WHEN THERE IS SOMETHING TO DISCLOSE. The app raises this note only when the build says
       * the rim NEEDS A LOOK (`dentalRimCoverage.needsReview`), which is right: a warning that appears
       * when nothing is wrong teaches the reader to ignore it. This check used to demand the note on every
       * run, so it failed the moment the tuning before it produced coverage good enough not to need one.
       *
       * Both halves are checked, because both are promises: say it when it matters, stay quiet when it
       * does not.
       */
      const needsReview = placed.dentalNeedsReview === true;
      check('l4 the final rim gap is disclosed when the build says the rim needs a look, and not otherwise',
        needsReview
          ? rimShown && /Automatic dental rim gaps: outer [\d.]+ mm, opening [\d.]+ mm/.test(rimWarning) && /Review the rim/.test(rimWarning)
          : !rimShown,
        `needs review ${placed.dentalNeedsReview}, note "${rimWarning.replace(/\s+/g, ' ')}"`);
    }

    // s. The full-screen start (ST): task, aligner type, file; Back and Escape; drops; Any model.
    if (runs('s')) {
      const reference = dentalFixture ?? PUBLIC_ALIGNER;
      /*
       * ONE SELECTOR PER PAGE, each matching only that page. The old map had
       * `type: '.start-screen .choice-keys'`, which the DROP page also matches - both it and the
       * type step render a `.choice-keys` container - so a wait for the type screen was satisfied by
       * the page before it. That selector would have gone on passing after 7c removed the type
       * screen entirely, which is the opposite of what a check is for.
       */
      const onScreen = (which) => page.waitForSelector({ drop: '.start-task', items: '.items-page', file: '.start-screen .dental-drop' }[which], { timeout: 10000 });
      const unitsOnPlate = async () => Number((await page.locator('footer').innerText()).match(/(\d+) objects?/)?.[1] ?? -1);
      /*
       * BACK AT STEP 1 LEAVES VIA THE CASE now (E1b): the Items page comes up over the live session
       * rather than the Drop page, and the rows' own Back reaches Drop. Two checks below want to be
       * standing on Drop afterwards, so the pair of presses lives here instead of being spelled out
       * at each one. `s10` keeps its presses inline, because what it checks IS the Items page.
       */
      const backFromStepOneToDrop = async () => {
        await d.button('Back').click();
        await page.waitForSelector('.items-page', { timeout: 20000 });
        await page.locator('[data-ui="items-back"]').click();
        await onScreen('drop');
      };
      /** The footer count once the dropped file has been read onto the plate. */
      const plateHas = (n) => page.waitForFunction((count) => new RegExp(`(^|\\D)${count} objects?`).test(document.querySelector('footer')?.innerText ?? ''), n, { timeout: 60000 }).then(() => true, () => false);
      const dropOnStart = (name, content) => page.evaluate(({ fileName, text }) => {
        const transfer = new DataTransfer();
        transfer.items.add(new File([text], fileName));
        document.querySelector('.start-screen').dispatchEvent(new DragEvent('drop', { dataTransfer: transfer, bubbles: true, cancelable: true }));
      }, { fileName: name, text: content });
      const atStep1 = (ms = 180000) => page.waitForFunction(() => (document.querySelector('.edit-badge')?.textContent ?? '').toLowerCase().includes('step 1 · aligner'), null, { timeout: ms });
      const supports = () => page.getByRole('button', { name: 'Aligner', exact: true });

      await page.goto(url);
      await onScreen('drop');
      /*
       * READ THE LABEL ELEMENT, not the button's whole text.
       *
       * `textContent` is used here rather than `innerText` on purpose - the theme sets a key's word in
       * caps, and this check is about the WORDS, not the painting. But a choice key holds its icon as an
       * inline SVG, and that SVG carries a `<style>` block: `textContent` scoops the CSS up with the word,
       * so the names came back as stylesheet rules with "Aligner" stuck on the end.
       *
       * `.choice-key-label` is the element that holds exactly the word (src/ui/ChoiceKey.tsx), so it is
       * read directly. "Open a saved project" is a plain button with no icon and is read as it always was.
       */
      const names = [
        ...await page.locator('.start-task .choice-key-label').allTextContents(),
        ...await page.locator('.start-task button:not(.choice-key)').allTextContents(),
      ].map((name) => name.trim());
      check('s1 the app opens on the task screen: the three choices drawn alike, Open a saved project, and no workspace',
        names.join('|') === 'Aligner|Denture|Any model|Open a saved project' && (await page.locator('.start-task .primary').count()) === 0 && (await page.locator('.workspace').count()) === 0, names.join('|'));
      check('u1a on the Drop page the header has no Undo, Redo, Hide models or Wireframe, the language switch stays, the heading is present, and the footer says what to do',
        (await page.locator('header').getByRole('button', { name: /^(Undo|Redo|Hide models|Wireframe)/ }).count()) === 0 && await page.locator('header').getByLabel('Language').isVisible() &&
        await page.getByRole('heading', { name: 'What are you making?' }).isVisible() && (await page.locator('footer strong').innerText()) === 'Drop one or more files, or choose what to make.', await page.locator('footer strong').innerText());
      await supports().click();
      await onScreen('file');
      check('s2 Aligner goes straight to the file screen, full-screen with Back, and no type cards remain',
        (await page.locator('.start-screen .dental-drop').count()) === 1 && await d.button('Back').isVisible()
        && (await page.locator('.workspace').count()) === 0 && (await page.locator('.start-screen .choice-key').count()) === 0,
        `type cards ${await page.locator('.start-screen .choice-key').count()}`);

      // The screen's heading is ranged left inside a box that is centred - which only LOOKS centred while the
      // box is exactly as wide as its longest line. No CSS width does that to wrapped text, so the component
      // measures its own line boxes; this is what notices if that ever stops working. jsdom cannot see layout,
      // so it cannot be a unit test.
      {
        const fit = await page.evaluate(async () => {
          await document.fonts.ready;
          const heading = document.querySelector('.screen-heading');
          if (!heading) return null;
          const box = heading.getBoundingClientRect();
          const range = document.createRange();
          range.selectNodeContents(heading);
          const widest = Math.max(0, ...[...range.getClientRects()].map((line) => line.width));
          return { box: Math.round(box.width), widest: Math.round(widest), offCentre: Math.abs((box.left + box.width / 2) - window.innerWidth / 2) };
        });
        check('s2b the screen heading is a box the width of its own longest line, centred',
          !!fit && Math.abs(fit.box - fit.widest) <= 2 && fit.offCentre <= 2,
          fit ? `box ${fit.box}px, longest line ${fit.widest}px, ${fit.offCentre.toFixed(1)}px off centre` : 'no heading');
      }
      await page.keyboard.press('Escape');
      await onScreen('drop');
      check('s3 Escape on the file screen is Back to the Drop page', await page.locator('.start-task').isVisible());
      await supports().click();
      await onScreen('file');
      await d.button('Back').click();
      await onScreen('drop');
      check('s4 Back on the file screen returns to the Drop page', await page.locator('.start-task').isVisible());
      await page.keyboard.press('Escape');
      check('s5 Escape on the Drop page does nothing', await page.locator('.start-task').isVisible());

      await supports().click();
      await onScreen('file');
      /*
       * The hint says the file can be DRAGGED here as well as chosen, which the old wording left out - so
       * the sentence this asked for no longer exists. It is matched on its lasting half rather than word
       * for word: that the file is checked and turned the right way up, and that dragging is offered.
       */
      const fileHint = await page.locator('.start-screen').innerText();
      check('s6 Aligner opens the file screen: the instruction, its hint, a file button and Back',
        await page.getByText('Place the aligner file here').isVisible()
          && /[Dd]rag an STL here/.test(fileHint) && /checked and turned the right way up/.test(fileHint)
          && await d.button('Choose STL file').isVisible() && await d.button('Back').isVisible(),
        fileHint.replace(/\s+/g, ' ').slice(0, 140));
      /*
       * THE TYPE SCREEN IS GONE (7c), so both ways off the file screen land on Drop. These two used to
       * assert a return to the type screen "which keeps the chosen type pressed" - a card that no
       * longer exists. There is no type to keep pressed now: it is derived by `defaultProfileId`.
       */
      await page.keyboard.press('Escape');
      await onScreen('drop');
      // NOT a `.choice-key` count: the Drop page has three of its own (Aligner, Denture, Any model).
      // What marks the absent type screen is that Drop is up and the file screen is gone.
      check('s7 Escape on the file screen returns to the Drop page, with no type screen in between',
        await page.locator('.start-task').isVisible() && (await page.locator('.start-screen .dental-drop').count()) === 0);
      await supports().click();
      await onScreen('file');
      await d.button('Back').click();
      await onScreen('drop');
      check('s8 Back on the file screen returns to the Drop page', await page.locator('.start-task').isVisible());

      // The reference aligner chosen on the file screen enters Step 1.
      await supports().click();
      await onScreen('file');
      await page.setInputFiles('input[aria-label="Choose aligner file"]', reference);
      await page.waitForFunction(() => (document.querySelector('.edit-badge')?.textContent ?? '').toLowerCase().includes('step 1 · aligner') && document.body.innerText.toLowerCase().includes('review the orientation'), null, { timeout: 180000 });
      check('s9 the reference aligner chosen on the file screen reaches Step 1 with its type, in the editor', (await page.locator('.start-screen').count()) === 0 && (await page.locator('.workspace').count()) === 1 && await unitsOnPlate() === 1);
      await d.button('Back').click();
      /*
       * BACK AT STEP 1 SHOWS THE CASE, not the Drop page (E1b). This check used to wait on
       * `.start-task` and timed out the moment that changed - which is the walk doing its job, but it
       * also cost the eight checks below it, so the wait is on the page that actually comes up.
       *
       * The aligner stays on the plate either way, and that half of the old check is the half worth
       * keeping: stepping out of a flow must never remove the model it was working on.
       */
      await page.waitForSelector('.items-page', { timeout: 20000 });
      check('s10 Back from Step 1 shows the case, and the aligner stays on the plate',
        (await page.locator('.items-list li').count()) === 1 && await unitsOnPlate() === 1 && (await page.locator('.workspace').count()) === 0);
      await page.locator('[data-ui="items-back"]').click();
      await onScreen('drop');
      await page.getByRole('button', { name: 'Any model', exact: true }).click();
      await page.waitForSelector('.workspace');
      check('s11 reaching the task screen removed nothing: Any model opens the editor with the aligner still on the plate', await unitsOnPlate() === 1 && (await page.locator('footer').innerText()).includes('1 object'));

      // Any model: the empty generic editor, unchanged.
      await page.goto(url);
      await onScreen('drop');
      await page.getByRole('button', { name: 'Any model', exact: true }).click();
      await page.waitForSelector('.workspace');
      check('s12 Any model opens the empty generic editor with its import control', await unitsOnPlate() === 0 && await page.locator('.panel.left .drop').isVisible() && await d.button('Aligner Support Production').isVisible());
      await page.setInputFiles('.drop input[type=file]', FIXTURE);
      await page.waitForFunction(() => document.body.innerText.includes('knot'), null, { timeout: 60000 });
      await page.locator('.panel.left').getByRole('button', { name: 'Delete', exact: false }).first().click();
      await page.waitForSelector('.start-task', { timeout: 10000 }).catch(() => {});
      check('s13 closing the last model returns to the task screen', (await page.locator('.start-task').count()) === 1);

      // Drops: an STL on the task screen is held, the type step follows, choosing the type goes straight to Step 1.
      await page.goto(url);
      await onScreen('drop');
      await dropOnStart('notes.txt', 'not a model');
      await d.idle(500);
      check('s14 a non-STL dropped on the task screen is refused and the screen stays', await page.locator('.start-task').isVisible() && /Unsupported|not supported|file type|STL/i.test(await d.status()), `status "${await d.status()}"`);
      /*
       * ONE STL DROPPED ON DROP GOES STRAIGHT IN. These were two checks - the file was held, then the
       * type step followed, then choosing the type reached Step 1. With the type screen gone (7c) the
       * type is derived by `defaultProfileId('aligner')`, so the drop has nothing left to ask and the
       * two middle presses are gone with it.
       */
      await dropOnStart('cube.stl', cubeStl());
      await atStep1();
      check('s15 an STL dropped on the Drop page goes straight to Step 1, with no type step to answer',
        (await page.locator('.start-screen').count()) === 0 && (await page.locator('.start-task').count()) === 0);
      check('s16 and the dropped aligner is on the plate', await plateHas(1));
      /*
       * WAIT FOR THE STEP BEFORE PRESSING ITS BACK. s16 arrives at Step 1 through a HELD file, so the
       * aligner is still being read when the check passes: the import is a blocking job and the step
       * panel is still mounting. Clicking Back into that races the re-render, and Playwright reports
       * exactly that - "element is not stable", then "element was detached from the DOM" - until it
       * gives up 30 s later.
       *
       * It is why s17 alone flaked (2 of 5 runs at one commit) while s18 and s19 never did: both of
       * those already wait on `atStep1()` before their Back. Measured, not guessed - and only after a
       * single-run comparison had me blaming an app change that turned out to be innocent.
       */
      /*
       * SETTLE THE DOCK BEFORE PRESSING ITS BACK. s16 drops a CUBE, which has no findable rim, so
       * orientation FAILS and rim define mode opens - asynchronously, after s16's check has already
       * passed. That swaps the whole dock under the Back click, and Playwright reports exactly that:
       * "element is not stable", then "element was detached from the DOM", until it gives up 30 s
       * later. s17 passed whenever it won the race and failed whenever it lost: 2 of 5 runs at one
       * commit.
       *
       * Two weaker settles were tried and both failed, which is worth recording because each looked
       * right. `atStep1()` + `d.quiet()` does not help: `quiet()` waits on the job list, and what
       * re-renders here is the dock. Waiting for "Step 1 OR rim mode" is worse - it matches the badge
       * BEFORE the mode opens, skips the Cancel, and then the mode removes Back entirely, so the
       * click fails with no element at all rather than an unstable one.
       *
       * A cube ALWAYS fails orientation, so rim mode always opens: wait FOR it, rather than for
       * whichever arrives first. Section `u` has the same helper (`leaveRimIfOpen`) for the same
       * reason; it is local to that block.
       */
      await page.waitForSelector('[data-ui="rim-why"]', { timeout: 30000 });
      await d.button('Cancel').click();
      await page.waitForFunction(() => /Step 1/i.test(document.querySelector('.edit-badge')?.textContent ?? ''), null, { timeout: 20000 });
      await d.quiet();
      await d.idle(300);
      await backFromStepOneToDrop();
      await page.getByRole('button', { name: 'Any model', exact: true }).click();
      await page.waitForSelector('.workspace');
      check('s17 stepping back out of Step 1 keeps the loaded file on the plate', await unitsOnPlate() === 1);
      /*
       * s18 used to drop on the TYPE screen and then press its card. That screen is gone (7c), so what
       * is left to prove is the pair the type screen used to sit between: a drop on the file screen
       * enters Step 1 on the derived type, and stepping back from there keeps the aligner on the plate
       * (by way of the case now, not straight to Drop - E1b).
       */
      await page.goto(url);
      await supports().click();
      await onScreen('file');
      await dropOnStart('cube.stl', cubeStl());
      await atStep1();
      check('s18 an STL dropped on the file screen enters Step 1 on the derived type',
        (await page.locator('.start-screen').count()) === 0);
      // The cube fails orientation and opens rim define mode, which takes Back away: leave it first.
      await page.waitForSelector('[data-ui="rim-why"]', { timeout: 30000 });
      await d.button('Cancel').click();
      await page.waitForFunction(() => /Step 1/i.test(document.querySelector('.edit-badge')?.textContent ?? ''), null, { timeout: 20000 });
      await d.quiet();
      await d.idle(300);
      await backFromStepOneToDrop();
      await supports().click();
      await onScreen('file');
      await dropOnStart('cube.stl', cubeStl());
      await atStep1();
      check('s19 dropping again on the file screen enters Step 1, replacing the aligner that stayed', await plateHas(1));
      // Leave the flow so the checks after this block start with no mode on.
      await d.button('Exit').click();
    }
  } catch (error) {
    // The tab's death is reported ONCE, as itself, rather than as whichever control was unlucky.
    check('walk ran to the end', false, crashed ? `the browser tab CRASHED; the call that reported it was ${error.message}` : error.message);
    await page.screenshot({ path: path.join(scratch, 'walk-error.png') }).catch(() => {});
    note(`screenshot ${path.join(scratch, 'walk-error.png')}`);
  }
  try {
    await page.locator('footer').getByRole('button', { name: 'Terms' }).click();
    const dialog = page.locator('dialog.terms');
    await dialog.waitFor({ state: 'visible', timeout: 5000 });
    // Case-insensitive: innerText is the painted text and the theme sets the title in caps.
    check('j Terms opens the bundled terms in a dialog', /Terms of Use/i.test(await dialog.innerText()));
    await page.keyboard.press('Escape');
    await dialog.waitFor({ state: 'hidden', timeout: 5000 });
    check('j Escape closes the Terms dialog', true);
  } catch (error) {
    check('j Terms dialog', false, error.message);
  }
  check('h no request leaves localhost', outside.length === 0, outside.length ? outside.slice(0, 3).join(' || ') : '0 external requests');
  check('h no console errors or warnings', errors.length === 0, errors.length ? errors.slice(0, 3).join(' || ') : '0 messages');
}


// ---- locale walk ------------------------------------------------------------------------------
// WALK_LOCALES=en,ja,zh-Hant node scripts/walk.mjs: instead of the English walk, one short pass per
// language (generic Generate + Check on the knot, then the dental Steps 0-3 on the reference aligner
// + Check), driven by the translated labels read from src/locales, with screenshots named
// <lang>-<flow>-<step>.png in WALK_OUT. The full English walk stays the behaviour walk.

/** The translator of one language, read from src/locales/<lang>.ts (English text is the key). */
function translator(lang) {
  if (lang === 'en') return (key) => key;
  const source = readFileSync(path.join(ROOT, 'src', 'locales', `${lang}.ts`), 'utf8');
  const unquote = (text) => text.replace(/\\(['"\\])/g, '$1').replace(/\\n/g, '\n');
  const table = new Map();
  /*
   * BOTH QUOTE STYLES. This matched only '...' entries, and the locale files hold 137 per language
   * written with "..." - 14% of the dictionary invisible to the walk. Because the lookup below
   * ends in `?? key`, a key it could not see came back as its own ENGLISH text, so a check
   * comparing the page against `tr(key)` compared Japanese against English and reported the APP
   * at fault. That is how t1 failed for ja and zh while passing for en: tr('Denture') returned
   * 'Denture'. The silent fallback is what let it survive unnoticed for so long.
   */
  for (const m of source.matchAll(/^ {2}(['"])((?:[^'"\\]|\\.)*)\1:\s*(['"])((?:[^'"\\]|\\.)*)\3,\s*$/gm)) table.set(unquote(m[2]), unquote(m[4]));
  return (key) => table.get(key) ?? key;
}

async function walkLocale(url, scratch, lang, dentalFixture) {
  const tr = translator(lang);
  const tag = (name) => `[${lang}] ${name}`;
  const shot = (page, name) => page.screenshot({ path: path.join(scratch, `${lang}-${name}.png`) });
  const context = await browser.newContext({ viewport: VIEWPORT, acceptDownloads: true });
  await context.addInitScript((value) => { try { localStorage.setItem('mixodental.lang', value); } catch { /* storage off */ } }, lang);
  const page = await context.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errors.push(`${m.type()}: ${m.text()}`); });
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  const button = (key) => page.getByRole('button', { name: tr(key), exact: true }).first();
  const badgeHas = (key, ms = 20000) => page.waitForFunction((word) => (document.querySelector('.edit-badge')?.textContent ?? '').toLowerCase().includes(word.toLowerCase()), tr(key), { timeout: ms });
  const quiet = () => page.waitForFunction(() => !!document.querySelector('.job-activity')?.hidden, null, { timeout: 300000 });
  const idle = (ms) => page.evaluate((span) => new Promise((resolve) => setTimeout(resolve, span)), ms);
  try {
    // The full-screen start (ST): the three screens in the language, then Any model for the generic walk.
    await page.goto(url);
    await page.waitForSelector('.start-task');
    const labels = await page.locator('.start-task button').allInnerTexts();
    /*
     * THE KEYS AS THE TASK SCREEN ACTUALLY DRAWS THEM. This read 'Aligner supports' and listed three
     * keys; `StartScreen.tsx` draws `t('Aligner')` and there are FOUR buttons, Denture among them.
     * 'Aligner supports' is in no dictionary and in no component - it is a label from an older task
     * screen. So t1 failed for every language INCLUDING en, and the click under it looked for a
     * button that does not exist, which killed the locale pass at its second step.
     *
     * Nothing caught it because `walkLocale` runs only under WALK_LOCALES and `npm run walk` does
     * not set it: the locale pass is outside the gate. Worth remembering before trusting it.
     */
    const KEYS = ['Aligner', 'Denture', 'Any model', 'Open a saved project'];
    const wanted = KEYS.map(tr);
    check(tag('t1 the Drop page is in the language'), labels.join('|') === wanted.join('|') && (lang === 'en' || !labels.some((label) => wanted.indexOf(label) >= 0 && KEYS.includes(label))),
      `drawn ${labels.join('|')} :: wanted ${wanted.join('|')}`);
    await shot(page, 'start-1-drop');
    // Aligner goes straight to the file screen: the type screen it used to pass through is gone (7c),
    // and with it t2's "Choose the aligner type" heading. The file screen's own heading is checked here.
    await button('Aligner').click();
    await page.waitForSelector('.start-screen .dental-drop');
    const backLabel = await page.locator('.start-back').getAttribute('aria-label');
    const heading = await page.locator('.dental-stage h2').innerText();
    check(tag('t2 the file screen is in the language, reached straight from Drop'),
      backLabel === tr('Back') && heading === tr('Place the aligner file here'), `${backLabel} / ${heading}`);
    await shot(page, 'start-3-file');
    const fileTexts = await page.locator('.dental-drop').innerText();
    check(tag('t3 the file screen is in the language'), fileTexts.includes(tr('Place the aligner file here')) && fileTexts.includes(tr('Drag an STL here, or choose one below. It is checked and turned the right way up automatically.')) && fileTexts.includes(tr('Choose STL file')), fileTexts.replace(/\s+/g, ' '));
    await page.keyboard.press('Escape');
    await page.waitForSelector('.start-task');
    await button('Any model').click();
    await page.waitForSelector('.workspace');
    // Generic: knot -> Generate -> Check supports. The knot's island verdict is inconclusive (non-manifold tube).
    await page.setInputFiles('.drop input[type=file]', FIXTURE);
    await page.waitForFunction(() => document.body.innerText.includes('knot'), null, { timeout: 60000 });
    const htmlLang = await page.evaluate(() => document.documentElement.lang);
    check(tag('g0 the page is in the language'), htmlLang === lang && (lang === 'en' || (await button('Aligner Support Production').count()) > 0), `html lang ${htmlLang}`);
    await shot(page, 'generic-1-imported');
    await page.locator('.panel.left .primary').first().click();
    const countsText = tr('{auto} automatic, {manual} manual, {removed} removed');
    // Literal text between the numbers (the separators differ by language); the counts are digits.
    const generated = countsText.split(/\{(?:auto|manual|removed)\}/).map((part) => [...part].map((ch) => (/[A-Za-z0-9\s]/.test(ch) || ch.charCodeAt(0) > 127 ? ch : `\\${ch}`)).join('')).reduce((out, part, k) => out + (k === 0 ? '' : k === 1 ? '[1-9][\\d,]*' : '[\\d,]+') + part, '');
    await page.waitForFunction((source) => new RegExp(source).test(document.querySelector('footer')?.innerText ?? ''), generated, { timeout: 600000 });
    await quiet();
    await idle(800);
    await shot(page, 'generic-2-generated');
    await page.evaluate(() => { window.__statuses = []; new MutationObserver(() => { const text = document.querySelector('footer strong')?.innerText ?? ''; if (text && window.__statuses.at(-1) !== text) window.__statuses.push(text); }).observe(document.querySelector('footer'), { subtree: true, childList: true, characterData: true }); });
    // A Check pressed before the preview build lands says "did not finish" (never clean); press it again once the build is in.
    const unfinished = tr('The check did not finish for 1 object: run it again.');
    for (let attempt = 0; attempt < 6; attempt += 1) {
      await button('Check for unsupported spots').click();
      await idle(1500);
      await quiet();
      await idle(500);
      if ((await page.evaluate(() => document.querySelector('footer strong')?.innerText ?? '')) !== unfinished) break;
      note(`[${lang}] Check pressed before the build landed: "${unfinished}", pressing again`);
      await idle(3000);
    }
    await page.waitForSelector('.problems li', { timeout: 300000 });
    await quiet();
    await idle(500);
    const rows = await page.locator('.problems li').evaluateAll((items) => items.map((li) => ({ text: li.innerText, buttons: li.querySelectorAll('button').length })));
    const unjudged = rows.find((row) => row.text.includes(tr('Could not judge islands on this mesh')));
    const status = await page.evaluate(() => document.querySelector('footer strong')?.innerText ?? '');
    check(tag('g1 Check lists "could not judge islands" for the knot, with no Show or Fix on it'), Boolean(unjudged) && unjudged.buttons === 0 && unjudged.text.includes(tr('This mesh has defects, such as edges shared by more than two faces, so no island is called supported. Repair the model, then check again.')), `rows ${rows.length}, first "${rows[0]?.text.replace(/\s+/g, ' ')}"`);
    const said = status.includes(tr('Islands could not be judged on 1 object.')) || status.includes(tr('Islands could not be judged on 1 object: see Check supports.'));
    check(tag('g2 the status line never says clean while islands are unjudged'), status !== tr('No unsupported spots found.') && said, `status "${status}"`);
    await page.locator('.problems li').last().scrollIntoViewIfNeeded();
    await shot(page, 'generic-3-problem-list');
    note(`[${lang}] statuses after Check: ${JSON.stringify(await page.evaluate(() => window.__statuses))}`);
    note(`[${lang}] problem rows: ${JSON.stringify(rows.map((row) => row.text.replace(/\s+/g, ' ')))}`);

    // Dental: Step 1 -> 3 on the reference aligner, then Check.
    const reference = dentalFixture ?? PUBLIC_ALIGNER;
    await page.goto(url);
    await button('Any model').click();
    await page.waitForSelector('.workspace');
    await button('Aligner Support Production').click();
    await badgeHas('Step 1 · Aligner');
    await shot(page, 'dental-step1');
    await page.setInputFiles(`input[aria-label="${tr('Choose aligner file')}"]`, reference);
    await badgeHas('Review the orientation. Turn the aligner with the gizmo if needed.', 180000);
    await page.waitForSelector('.print-angle [data-ui="tilt-dial"]', { timeout: 120000 });
    const angle = await page.locator('.print-angle [data-ui="tilt-dial-value"]').textContent();
    const range = await page.locator('.print-angle .orient-range').textContent();
    const rangeLead = tr('Stable {a}–{b}°').split('{a}')[0];
    check(tag('d0 Step 1 shows the print angle and its stable band in the language'),
      angle.includes('44.5') && range.startsWith(rangeLead) && (lang === 'en' || !range.includes('Stable')), `"${angle}" / "${range}"`);
    await shot(page, 'dental-step1-print-angle');
    await button('Next').click();
    await badgeHas('Step 2 · Support area', 180000);
    /*
     * `previewReady` WAITS ON THE NAMED TIP COUNT. This line was the unfixed copy of the mistake that
     * function already documents: it waited for any digit inside an `.edit-note`, which worked only
     * while the count sat in a sentence there. The count became a readout of its own, the notes were
     * left holding no digits, and this waited out its full 240 s - in every language, every run,
     * because the locale pass is outside `npm run walk`.
     */
    await previewReady(page);
    await idle(800);
    await shot(page, 'dental-step2');
    // B3: the four tools and the up-facing warning in the language.
    {
      const tools = page.locator('.dental-brush').getByRole('group', { name: tr('Dental area tools') });
      const names = await tools.getByRole('button').allInnerTexts();
      /*
       * THE ORDER IS THE APP'S: `AREA_TOOLS` in DentalBar.tsx is ['select','paint','erase','add'],
       * and Select leads because it is the tool a step opens on. This listed Paint first - the order
       * before Select was added - so it compared four correct Japanese labels against four correct
       * Japanese labels in the wrong sequence and called the app wrong. Both sides are reported now.
       */
      const wantedTools = ['Select', 'Paint', 'Erase', 'Add'].map(tr);
      check(tag('b1 Step 2 offers the four tools in the language'), names.join('|') === wantedTools.join('|'),
        `drawn ${names.join('|')} :: wanted ${wantedTools.join('|')}`);
      await page.keyboard.press('a');
      const english = 'This spot faces up, so a tip here may not hold.';
      const facesUp = tr(english);
      const up = await addOnUpFacingSpot(page, facesUp);
      check(tag('b2 the up-facing warning is in the language'), up.found && up.added && (lang === 'en' || facesUp !== english), `${up.status} (${up.tried.join(' ')})`);
      await shot(page, 'dental-step2-add');
      await previewReady(page);
    }
    await button('Next').click();
    await badgeHas('Step 3 · Supports', 240000);
    await page.waitForFunction((ok) => { const b = [...document.querySelectorAll('button')].find((x) => (x.textContent ?? '').trim().toLowerCase() === ok.toLowerCase()); return b && !b.disabled; }, tr(WAY_ON), { timeout: 300000 });
    await quiet();
    await idle(800);
    await shot(page, 'dental-step3');
    // NOT scoped to `.dental-side`: the button is not inside it, so this waited out its 30 s on a
    // locator that can never resolve. The unscoped `button()` helper is what the generic pass above
    // already uses for the same control, and `d.button(...)` is what section `u` uses in English.
    /*
     * ONE MISSING CONTROL IS ITS OWN FAILURE, NOT THE PASS'S - the same rule the import drop loop
     * follows. This was a bare `.click()`, so when the button did not resolve the 30 s timeout threw
     * out of the whole locale pass and every check after it was never reached. Now the absence is
     * reported as one result and the pass carries on, which is what makes the rest of the language
     * coverage worth running at all.
     *
     * It does not resolve here while English section `x` clicks the same label happily, so Step 3's
     * side panel is reaching a different state in this pass. That is a real gap and it is recorded as
     * one rather than hidden behind a thrown timeout.
     */
    /*
     * OPEN THE REVIEW DETAILS FIRST. Step 3's Problems section lives inside the review summary's
     * collapsible, so the check control is not in the DOM until `Details` is pressed - which is why
     * the button list this reported held `詳細` and no check button at all. English section `x`
     * reaches it only because its longer sequence has already opened the panel.
     *
     * Pressed by `data-ui`, not by its word: the toggle's label flips between Details and Hide
     * details, so matching on text would depend on which state it happened to be in.
     */
    const reviewDetails = page.locator('[data-ui="aligner-review-details-toggle"]');
    if ((await reviewDetails.count()) > 0 && (await reviewDetails.getAttribute('aria-expanded')) === 'false') {
      await reviewDetails.click();
      await idle(300);
    }
    const checkSpots = button('Check for unsupported spots');
    const hasCheckSpots = (await checkSpots.count()) > 0;
    check(tag('d0b Step 3 offers the unsupported-spots check'), hasCheckSpots,
      hasCheckSpots ? 'present'
        : `not found. Step 3 buttons: ${JSON.stringify(await page.locator('button').allInnerTexts())}`);
    if (hasCheckSpots) await checkSpots.click();
    const none = tr('No problems listed. Press Check supports to look for islands and overhangs.');
    await idle(1500);
    await quiet();
    await page.waitForFunction((word) => document.querySelector('.dental-side .problems li') || document.querySelector('.dental-side')?.innerText.includes(word), none, { timeout: 120000 }).catch(() => {});
    await idle(800);
    const side = await page.locator('.dental-side').innerText();
    const listed = await page.locator('.dental-side .problems li').evaluateAll((items) => items.map((li) => li.innerText.replace(/\s+/g, ' ')));
    if (hasCheckSpots) {
      check(tag('d1 Step 3 Check ends in the problem list (rows) or the translated empty note'), listed.length > 0 || side.includes(none), `rows ${JSON.stringify(listed)}`);
    }
    const badge = (await page.locator('.edit-badge').textContent()).replace(/\s+/g, ' ');
    check(tag('d2 Step 3 badge is in the language'), lang === 'en' ? badge.includes('Step 3 ·') : !badge.includes('Step 3 ·'), badge);
    await page.locator('.dental-side .problems li').last().scrollIntoViewIfNeeded().catch(() => {});
    note(`[${lang}] dental island verdict: ${JSON.stringify((await page.evaluate(readProps)).islands)}`);
    await shot(page, 'dental-step3-problems');
  } catch (error) {
    check(tag('locale walk'), false, error.message);
    await shot(page, 'error').catch(() => {});
  }
  check(tag('h no console errors or warnings'), errors.length === 0, errors.length ? errors.slice(0, 3).join(' || ') : '0 messages');
  await context.close();
}

// WALK_OUT: where a run leaves its screenshots and files for review; ordinary passing runs remove them.
const scratch = LOCALES && process.env.WALK_OUT ? (mkdirSync(path.resolve(process.env.WALK_OUT), { recursive: true }), path.resolve(process.env.WALK_OUT)) : process.env.WALK_OUT ? (mkdirSync(path.resolve(process.env.WALK_OUT), { recursive: true }), mkdtempSync(path.join(path.resolve(process.env.WALK_OUT), 'run-'))) : mkdtempSync(path.join(tmpdir(), 'mixo-walk-'));
async function stopAll() {
  await browser?.close().catch(() => {});
  stopVite(vite);
}
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => { stopAll().finally(() => process.exit(130)); });
}
try {
  const port = await freePort(FIRST_PORT);
  vite = startVite(port);
  const url = `http://127.0.0.1:${port}/mixodental/`;
  await waitFor(url, vite);
  console.log(`walk on ${url}`);
  const dentalFixture = process.env.DENTAL_WALK_FIXTURE ?? (existsSync(CASE_01_ALIGNER) ? CASE_01_ALIGNER : undefined);
  if (dentalFixture) console.log(`dental fixture: ${path.relative(ROOT, dentalFixture)}`);
  if (LOCALES) {
    browser = await launch();
    for (const lang of LOCALES.split(',').map((item) => item.trim()).filter(Boolean)) await walkLocale(url, scratch, lang, dentalFixture);
  } else await walk(url, scratch, dentalFixture);
} catch (error) {
  check('walk setup', false, error.message);
} finally {
  await stopAll();
}
const failed = results.filter((r) => !r.ok).length;
if (failed === 0 && !process.env.WALK_OUT && !LOCALES) rmSync(scratch, { recursive: true, force: true });
// A filtered run never says ALL PASS: it covered part of the walk, and the line has to say so.
const scope = ONLY.size === 0 ? '' : ` [only ${[...ONLY].join(',')}]`;
const verdict = failed > 0 ? `${failed} FAIL` : ONLY.size === 0 ? 'ALL PASS' : 'SOME PASS';
console.log(`${verdict} (${results.length} checks, ${Math.round((Date.now() - started) / 1000)} s)${scope}`);
process.exit(failed === 0 ? 0 : 1);
