/**
 * The tool icons, drawn as PIXEL ART IN VECTOR: one grid, one fake pixel size, every icon.
 *
 *   node scripts/pixel-icons.mjs            write the SVGs
 *   node scripts/pixel-icons.mjs --preview  print them as text and write nothing
 *
 * WHY A GENERATOR. A set stops looking like a set the moment two icons are drawn at different grids,
 * and that drift is invisible until they sit side by side. Here the grid is one constant and a new
 * icon is a few lines. `--preview` exists because the only honest check on an icon is LOOKING at it:
 * it killed two wrong approaches before a single file was written.
 *
 * THE CONSTRAINTS COME FROM THE LOADER, not from taste. `scopeIcon` rewrites every fill and stroke to
 * `currentColor`, so an icon is ONE colour - the colour of the place it sits in. That is why the
 * colourful reference art could never have been used as files, however good it looked.
 *
 * THE FAKE PIXEL IS 10 UNITS on a 240 artboard: a 24 x 24 grid, shared by every icon here.
 */
import { writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const INTO = join(ROOT, 'src', 'ui', 'assets', 'icons');

const N = 24;
const CELL = 10;

const blank = () => Array.from({ length: N }, () => Array.from({ length: N }, () => 0));
const put = (g, x, y, on = 1) => { if (y >= 0 && y < N && x >= 0 && x < N) g[y][x] = on; };

/**
 * Points along the arch - the horseshoe every dental shape here follows - STAMPED ALONG A PATH.
 *
 * Never rasterised as one ellipse minus a smaller one. That was the first attempt and the preview
 * killed it: a notch subtracted from a band severs the arch wherever the gap lines up with a leg, and
 * what survives reads as noise. A path cannot sever itself.
 */
const arcPoints = (count, { cx, cy, rx, ry, from = 180, to = 360 }) =>
  Array.from({ length: count }, (_, i) => {
    const t = ((from + ((to - from) * i) / (count - 1)) * Math.PI) / 180;
    return [cx + Math.cos(t) * rx, cy + Math.sin(t) * ry];
  });

/**
 * The horseshoe: a half-arc over the top, then STRAIGHT LEGS down from its ends.
 *
 * Not a squashed ellipse, which was the first attempt - an ellipse's ends curve back inward, so the
 * shape sat in the top half of the canvas with no legs to speak of, and the preview showed it at once.
 * A real aligner arch is round at the back and parallel down the sides, and so is this.
 */
function horseshoe(count, { cx = 11.5, cy = 10, rx = 7.5, ry = 7, legTo = 19 } = {}) {
  const arc = arcPoints(Math.round(count * 0.72), { cx, cy, rx, ry });
  const [lx] = arc[0];
  const [rxEnd] = arc[arc.length - 1];
  const legs = [];
  const steps = Math.round(count * 0.14);
  for (let i = 1; i <= steps; i += 1) {
    const y = cy + ((legTo - cy) * i) / steps;
    legs.push([lx, y], [rxEnd, y]);
  }
  return [...arc, ...legs];
}

/** The points a handle or a hole sits on: evenly along the arc, plus one at each leg end. */
function marks(count, opts = {}) {
  const { cx = 11.5, cy = 10, rx = 7.5, ry = 7, legTo = 19 } = opts;
  const arc = arcPoints(count, { cx, cy, rx, ry });
  return [[arc[0][0], legTo], ...arc, [arc[arc.length - 1][0], legTo]];
}

/** A filled (or cleared) square of `size`, as centred as a pixel grid allows. */
function square(g, cx, cy, size, on = 1) {
  const x0 = Math.round(cx - size / 2);
  const y0 = Math.round(cy - size / 2);
  for (let dy = 0; dy < size; dy += 1) for (let dx = 0; dx < size; dx += 1) put(g, x0 + dx, y0 + dy, on);
  return g;
}

const rect = (g, x0, y0, x1, y1, on = 1) => {
  for (let y = y0; y <= y1; y += 1) for (let x = x0; x <= x1; x += 1) put(g, x, y, on);
  return g;
};


/*
 * RULE B: THE ITEM TYPES, DRAWN ISOMETRIC.
 *
 * These are the art on a choice key, shown at 72px - three CSS pixels per fake pixel - and that is the
 * only reason an isometric drawing is possible at all. At the rail's 24px the same shape loses its own
 * edges, which is why the four icons above are flat and front-on. One grid, two rules, and the size
 * decides which: `src/ui/assets/icons/README.md`.
 *
 * THE PROJECTION IS 2:1, the pixel-art isometric: depth counts for about 0.62 of a row, so a circle in
 * plan becomes a squashed ellipse on screen.
 *
 * WHAT THE PREVIEW KILLED, in order, because none of it is obvious from the code:
 *  - Extruding a wall from EVERY point of the arch. In plan the back of the arch is deep, and the
 *    projection stacks those walls into a solid slab: the arch filled itself in.
 *  - Defining the top face as an annulus in plan. Beyond the inner radius an annulus has no hole, so the
 *    back half came out as a solid cap. The top face has to be a TUBE of constant thickness instead.
 *  - Cutting tooth gaps INTO the band. At this size a notch reads as damage or as dithering - the same
 *    lesson the flat icons taught. A tooth that STANDS ON the skyline reads, the way a crown does.
 */

/** The arch centreline in plan: x across, y depth, y < 0 being the back of the mouth. */
function centreline(count, r, legTo) {
  const out = [];
  const arcN = Math.round(count * 0.72);
  for (let i = 0; i < arcN; i += 1) {
    const t = Math.PI + (Math.PI * i) / (arcN - 1);
    out.push({ px: Math.cos(t) * r, py: Math.sin(t) * r, ny: Math.sin(t) });
  }
  const legN = Math.round(count * 0.14);
  for (let i = 1; i <= legN; i += 1) {
    const y = (legTo * i) / legN;
    out.push({ px: -r, py: y, ny: 0 }, { px: r, py: y, ny: 0 });
  }
  return out;
}

/**
 * Fills any single empty pixel that is boxed in on all four sides.
 *
 * Geometry produces these honestly - where the arch's inner opening begins, the hole is one pixel wide for
 * one row before it widens - and at a fake-pixel scale an honest one-pixel hole reads as a CRACK in the
 * drawing. Nothing else in the icon is one pixel of anything, so there is no legitimate hole to protect.
 */
function despeckle(g) {
  const out = g.map((row) => [...row]);
  for (let y = 1; y < N - 1; y += 1) for (let x = 1; x < N - 1; x += 1) {
    if (!g[y][x] && g[y - 1][x] && g[y + 1][x] && g[y][x - 1] && g[y][x + 1]) out[y][x] = 1;
  }
  return out;
}

/** Centres what was drawn, so no icon touches the edge whatever its parameters were. */
function centred(g) {
  let top = N, bottom = -1, left = N, right = -1;
  for (let y = 0; y < N; y += 1) for (let x = 0; x < N; x += 1) if (g[y][x]) {
    top = Math.min(top, y); bottom = Math.max(bottom, y); left = Math.min(left, x); right = Math.max(right, x);
  }
  if (bottom < 0) return g;
  const dy = Math.round((N - 1 - bottom - top) / 2);
  const dx = Math.round((N - 1 - right - left) / 2);
  const out = blank();
  for (let y = 0; y < N; y += 1) for (let x = 0; x < N; x += 1) if (g[y][x]) put(out, x + dx, y + dy);
  return out;
}

const SQUASH = 0.62;

/** An arch standing in 2:1 isometric: top face, the wall that faces the viewer, and whatever stands on it. */
function archShell({ r, legTo, wall, band, teeth = 0, toothH = 0, plinth = 0 }) {
  const g = blank();
  const cx = 11.5;
  const cy = 9;
  const sy = (py) => cy + py * SQUASH;
  const lip = Math.floor(band / 2);
  // The top face, as a tube of constant thickness along the centreline.
  // Densely sampled: at 700 the aligner's thin band left a one-pixel seam at the apex, which reads as a crack.
  for (const p of centreline(1600, r, legTo)) square(g, cx + p.px, sy(p.py), band);
  // The wall, ONLY where the outward face turns toward the viewer. The back arc's wall sits behind its own
  // top face in a real isometric view, and drawing it anyway is what filled the arch in.
  for (const p of centreline(700, r, legTo)) {
    if (p.ny <= -0.25) continue;
    for (let d = 1; d <= wall; d += 1) put(g, Math.round(cx + p.px), Math.round(sy(p.py)) + lip + d);
  }
  // Teeth stand ON the band, two fake pixels wide, so the skyline reads as a row rather than as fringe.
  for (let i = 0; i < teeth; i += 1) {
    const t = Math.PI + (Math.PI * (i + 0.5)) / teeth;
    const px = Math.cos(t) * r;
    const py = Math.sin(t) * r;
    for (let d = 1; d <= toothH; d += 1) {
      put(g, Math.round(cx + px - 0.5), Math.round(sy(py)) - lip - d);
      put(g, Math.round(cx + px + 0.5), Math.round(sy(py)) - lip - d);
    }
  }
  // The plinth: a slab the arch stands on, with its front edge stepped in so it reads as a solid block.
  if (plinth) {
    const top = Math.round(sy(legTo)) + lip + wall + 1;
    for (let y = top; y < top + plinth; y += 1) {
      const inset = Math.max(0, y - (top + plinth - 2));
      for (let x = 2 + inset; x <= 21 - inset; x += 1) put(g, x, y);
    }
  }
  return centred(despeckle(g));
}

const ICONS = {
  /*
   * RIM: the trim edge as a PATH WITH HANDLES - the pen-tool idea, because that is what the operator
   * does here. A thin line, nothing filled, and squares big enough to read as something you grab.
   * If it looks like an object you could pick up, it is the wrong icon.
   */
  'tool-rim': () => {
    const g = blank();
    for (const [x, y] of horseshoe(160)) put(g, Math.round(x), Math.round(y));
    for (const [x, y] of marks(3)) square(g, x, y, 3);
    return g;
  },

  /*
   * AREA: the narrow strip just outside the rim where tips may touch, with the tips ON its middle
   * line - punched out as HOLES, not drawn as dots. In one colour a filled dot on a filled band is
   * invisible; a hole reads. The dots are the whole icon, so they have to be the thing you see.
   */
  'tool-area': () => {
    const g = blank();
    const band = { rx: 8, ry: 7.5 };
    // Densely sampled, or consecutive stamps leave gaps at the apex that read as unintended holes.
    for (const [x, y] of horseshoe(600, band)) square(g, x, y, 4);
    // Holes along the WHOLE path, legs included - punched only on the arc, the legs came out solid.
    for (const [x, y] of horseshoe(15, band)) square(g, x, y, 2, 0);
    return g;
  },

  /*
   * SUPPORTS: the pillars holding the part off the plate. The ONLY side view in the set, which is most
   * of what tells it from the two arches beside it on the rail.
   */
  'tool-supports': () => {
    const g = blank();
    rect(g, 2, 5, 21, 8);                                     // the part resting on top
    for (const x of [6, 12, 18]) rect(g, x, 9, x + 2, 17);    // pillars
    rect(g, 2, 18, 21, 20);                                   // the build plate
    return g;
  },

  /*
   * RIM CURSOR: a press in rim mode means three things - grab a point, insert one on the line, add one
   * at the end - and all three show a plain system crosshair today, which says none of it. Sparse on
   * purpose: a cursor sits over artwork and must not blot it out.
   */
  'cursor-rim': () => {
    const g = blank();
    for (let i = 0; i <= 5; i += 1) { put(g, 11, i); put(g, 11, 23 - i); put(g, i, 11); put(g, 23 - i, 11); }
    rect(g, 8, 8, 14, 8); rect(g, 8, 14, 14, 14); rect(g, 8, 8, 8, 14); rect(g, 14, 8, 14, 14);
    return g;
  },
  /*
   * THE THREE ITEM TYPES WERE HERE, AND WERE WITHDRAWN ON 2026-11-10. Keeping the reason, because the
   * next person will have the same idea.
   *
   * They were built on the arch helpers above, in 2:1 isometric, and they came out as ARCHWAYS - the
   * owner's words were a croquet hoop, a shaggy arch and a tombstone on a plinth. The cause is not the
   * code: A DENTAL ARCH IS RECOGNISED FROM ABOVE. Tilt it and the teeth go over the horizon, and what
   * is left is the silhouette of a doorway, which every arch shares. The three distinguishing features
   * the brief names - thin, bulky, on a plinth - are all still there and none of them survives the
   * projection.
   *
   * What also failed, in the same session, was judging them from `--preview`. ASCII at 1:1 shows INTENT
   * and the eye fills in the rest; the same grids at 96px on a white key did not read at all. The
   * preview is still the right tool for the flat glyphs above, where the shape IS the silhouette.
   *
   * So isometric is not banned - it earned `generic`'s plinth, the one part that read - but an isometric
   * dental arch is a dead end, and an item icon has to be judged by eye, side by side, at its real size,
   * BEFORE it is wired into the app. That is what the style book's icon sheet exists for.
   *
   * The arch helpers below are left in place: they cost nothing and the next attempt will want them.
   */
};

/** Horizontal runs, so a row of pixels is one rect instead of twenty-four. */
function rects(grid) {
  const out = [];
  for (let y = 0; y < N; y += 1) {
    let run = 0;
    for (let x = 0; x <= N; x += 1) {
      if (grid[y][x]) { run += 1; continue; }
      if (run) out.push(`<rect x="${(x - run) * CELL}" y="${y * CELL}" width="${run * CELL}" height="${CELL}"/>`);
      run = 0;
    }
  }
  return out;
}

const svg = (grid) => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${N * CELL} ${N * CELL}" fill="currentColor" shape-rendering="crispEdges">
  <g>
    ${rects(grid).join('\n    ')}
  </g>
</svg>
`;

const preview = process.argv.includes('--preview');
const force = process.argv.includes('--force');
for (const [name, build] of Object.entries(ICONS)) {
  const grid = build();
  if (preview) {
    console.log(`\n${name}`);
    for (const row of grid) console.log(row.map((on) => (on ? '##' : '. ')).join(''));
    continue;
  }
  const file = join(INTO, `${name}.svg`);
  // A drawing in the folder outranks this script: see the header. --force is for changing the
  // generator itself, and it says out loud that it is throwing away whatever was there.
  if (existsSync(file) && !force) {
    console.log(`${name}.svg: KEPT - the file exists and IS the source. --force to overwrite`);
    continue;
  }
  writeFileSync(file, svg(grid));
  console.log(`${name}.svg: ${force ? 'OVERWRITTEN' : 'written'} - ${rects(grid).length} rects, ${N}x${N} grid, ${CELL} units a pixel`);
}
