import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/*
 * The coloured pixel-art set (`src/ui/assets/art/`, drawn by `src/ui/Art.tsx`).
 *
 * It exists because the one-ink rule that is right for a glyph beside a word is wrong for a picture of an
 * object: six rounds proved a dental arch in a single colour is indistinguishable from an archway. So this
 * folder is allowed colour - and gives up the guard that came with one ink, that nothing can ever be
 * off-palette. These checks are what is left holding it: the GRID, which is what keeps it crisp, and the
 * size, which is what keeps it on the grid.
 *
 * Read from disk, not through `import.meta.glob(...?raw)`: under the test runner that served a forged
 * file's previous contents while the real one was broken, and a guard that reads a cache is not a guard.
 */
const DIR = 'src/ui/assets/art';
const FILES = Object.fromEntries(
  readdirSync(DIR).filter((name) => name.endsWith('.svg'))
    .map((name) => [name, new TextDecoder().decode(readFileSync(join(DIR, name)))]),
);
const names = Object.keys(FILES);

/** The grid a file is drawn on: a fake pixel is ten units, on every grid, so the artboard says which. */
const GRID = 64;
const CELL = 10;

describe('the coloured art folder', () => {
  it('holds the three item types the start screen draws', () => {
    for (const name of ['aligner.svg', 'denture.svg', 'generic.svg']) expect(names).toContain(name);
  });

  it('draws every one on the same artboard', () => {
    expect(names.filter((n) => !FILES[n].includes(`viewBox="0 0 ${GRID * CELL} ${GRID * CELL}"`))).toEqual([]);
  });

  it('lets the CSS size every one', () => {
    expect(names.filter((n) => /<svg[^>]*\s(width|height)=/.test(FILES[n]))).toEqual([]);
  });

  /*
   * Every number outside the root tag is a whole fake pixel. This is the one check that still means
   * something now that colour is allowed here: a file that has drifted off the grid will not line up with
   * the others and will blur at any size, and nothing else would say so.
   */
  it('keeps every shape on the grid', () => {
    // ONLY the rect coordinates. "Every number in the file" works for the one-ink icons, where the only
    // numbers ARE geometry; here the colours are hex and `#1a2b3c` is full of digits that are not
    // coordinates at all. The tracer emits nothing but rects, so this reads exactly what it should.
    const offenders = names
      .map((n) => {
        const bad: string[] = [];
        for (const [tag] of FILES[n].matchAll(/<rect[^>]*>/g)) {
          for (const attr of ['x', 'y', 'width', 'height']) {
            const v = new RegExp(`[ ]${attr}="([^"]*)"`).exec(tag)?.[1];
            if (v !== undefined && Number(v) % CELL !== 0) bad.push(`${attr}=${v}`);
          }
        }
        return [n, bad] as const;
      })
      .filter(([, bad]) => bad.length > 0)
      .map(([n, bad]) => `${n}: ${bad.slice(0, 4).join(' ')}`);
    expect(offenders).toEqual([]);
  });

  // Few colours on purpose: more does not survive the grid, and at this size near-duplicates read as
  // noise rather than as shading. The tracer merges them; this is the backstop.
  it('keeps the palette small', () => {
    const offenders = names
      .map((n) => [n, new Set((FILES[n].match(/#[0-9a-fA-F]{6}\b/g) ?? []).map((c) => c.toLowerCase())).size] as const)
      .filter(([, count]) => count > 16);
    expect(offenders).toEqual([]);
  });
});
