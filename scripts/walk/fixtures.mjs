// The walk's fixtures: the synthetic meshes it imports, and the one big generated STL.
//
// One job, and it is the only part of walk.mjs that has one: these build bytes. Nothing here opens
// a page, drives a browser or knows what a check is, which is why it could move while the rest of
// that file could not (`docs/size-debt.md` carries the measurement -- the walk's later blocks
// reference up to 114 bindings declared earlier in it, and this block referenced five).
//
// `heavyPlateFixture` takes `note` rather than importing it: the walk owns how it talks to the
// operator, and a fixture module that reaches back into the walk for a logger would re-create the
// coupling this move removed.

import path from 'node:path';
import { existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '../..');

/**
 * The plate-quota fixture for section `q`: one binary STL of about 3.19M triangles, so two of them
 * cross the 6M plate refusal limit while either alone fits. Git-ignored and about 152 MiB, so it is
 * made on demand rather than committed; the generator streams it, which is why a 6M-triangle fault
 * injection costs twenty seconds and not a gigabyte of memory.
 */
export const HEAVY_PLATE_STL = path.join(ROOT, '.playwright-mcp', 'heavy', 'heavy-3_2m.stl');
export function heavyPlateFixture(note) {
  if (existsSync(HEAVY_PLATE_STL)) return HEAVY_PLATE_STL;
  note('making the plate-quota fixture (3.2M triangles, ~152 MiB, git-ignored) - this happens once per clone');
  execFileSync('npx', ['vite-node', 'scripts/make-heavy-meshes.ts', '3200000'], { cwd: ROOT, stdio: 'inherit', shell: true });
  if (!existsSync(HEAVY_PLATE_STL)) throw new Error(`the plate-quota fixture was not made at ${HEAVY_PLATE_STL}`);
  return HEAVY_PLATE_STL;
}

/** ASCII STL text of an indexed mesh (the walk's synthetic aligner stand-ins). */
export function asciiStl(name, positions, indices) {
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
export function cubeStl(scale = 1) {
  return asciiStl('cube', CUBE_POSITIONS.map((value) => value * scale), CUBE_INDICES);
}
/**
 * The same cube with its last face left off: ten triangles instead of twelve, so the solid is OPEN.
 *
 * It exists for section `r`'s G3 probe, which needs two models whose detection answers DIFFER - a
 * reply crossed with another is invisible if both say the same thing. A closed cube comes back "No
 * rim found. Draw one to continue."; an open one fails the dental mesh check, so `detectStateOf`
 * calls it unusable and the row reads "Could not check the orientation." Two answers, two screens.
 */
export function openCubeStl() {
  return asciiStl('open-cube', CUBE_POSITIONS, CUBE_INDICES.slice(0, 30));
}
/** A closed, manifold thick cup: it has a cavity opening but no central opening, so a type that insists on one is offered a switch. */
export function cupStl() {
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
