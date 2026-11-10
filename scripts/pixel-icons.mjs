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
