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
const GRID = 48;
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

  /*
   * AT MOST FIVE COLOURS, one of them the outline. More does not survive the grid: at this size
   * near-duplicate tones read as noise rather than as shading, and the tracer's own quantiser is set to
   * four body colours plus the keyline. This is the backstop for a file replaced by hand.
   */
  it('keeps the palette to five', () => {
    const offenders = names
      .map((n) => [n, new Set((FILES[n].match(/#[0-9a-fA-F]{6}/g) ?? []).map((c) => c.toLowerCase())).size] as const)
      .filter(([, count]) => count > 5)
      .map(([n, count]) => `${n}: ${count}`);
    expect(offenders).toEqual([]);
  });

  /*
   * A CLEAR OUTLINE, and it has to be the darkest thing in the file. A broken or pale keyline is what
   * makes pixel art read as a smudge rather than an object, and it is the first thing to go when a file
   * is re-exported from a drawing tool. Checking that SOME colour is near-black is weak but it is the
   * part a test can see; whether the ring is unbroken is what the style book is for.
   */
  it('gives every one a near-black outline colour', () => {
    /** How dark a `#rrggbb` is: 0 for black, 765 for white. */
    const darkness = (hex: string) => [1, 3, 5].reduce((sum, at) => sum + parseInt(hex.slice(at, at + 2), 16), 0);
    const darkest = names.map((n) => {
      const hexes = [...new Set(FILES[n].match(/#[0-9a-fA-F]{6}/g) ?? [])];
      return [n, hexes.length === 0 ? -1 : Math.min(...hexes.map(darkness))] as const;
    });
    // -1 is no colour found at all, which would make every other check in this file vacuous.
    expect(darkest.filter(([, d]) => d < 0)).toEqual([]);
    expect(darkest.filter(([, d]) => d > 180)).toEqual([]);
  });

  /*
   * NO HOLES INSIDE THE OUTLINE. Everything the keyline encloses is filled, so the key's paper never
   * shows through the middle of the drawing - an opening that really is open, like the mouth of the U,
   * reaches the edge of the artboard and is not a hole.
   *
   * Checked the way the tracer builds it: lay the rects onto the grid, flood in from the border, and
   * any empty cell the flood cannot reach is a hole. That also catches a BROKEN outline for free, since
   * a gap lets the flood into the middle and leaves nothing unreached.
   */
  it('leaves no hole inside the outline', () => {
    const offenders = names.filter((name) => {
      const cells = Array.from({ length: GRID }, () => Array.from({ length: GRID }, () => false));
      for (const [tag] of FILES[name].matchAll(/<rect[^>]*>/g)) {
        const at = (attr: string) => Number(new RegExp(`[ ]${attr}="([^"]*)"`).exec(tag)?.[1] ?? 0) / CELL;
        // Rounded, and the row looked up before it is written to. An off-grid file gives a fractional
        // index here, and `cells[12.3][x] = true` threw `Cannot set properties of undefined` - the run
        // still went red, but with a message naming nothing. The grid test above is what reports that
        // fault properly; this one must not die on its way to asking a different question.
        const [x, y, w, h] = [at('x'), at('y'), at('width'), at('height')].map(Math.round);
        for (let dy = 0; dy < h; dy += 1) for (let dx = 0; dx < w; dx += 1) {
          const row = cells[y + dy];
          if (row && x + dx < GRID) row[x + dx] = true;
        }
      }
      const seen = Array.from({ length: GRID }, () => Array.from({ length: GRID }, () => false));
      const stack: [number, number][] = [];
      for (let i = 0; i < GRID; i += 1) stack.push([i, 0], [i, GRID - 1], [0, i], [GRID - 1, i]);
      while (stack.length > 0) {
        const [y, x] = stack.pop()!;
        if (y < 0 || y >= GRID || x < 0 || x >= GRID || seen[y][x] || cells[y][x]) continue;
        seen[y][x] = true;
        stack.push([y - 1, x], [y + 1, x], [y, x - 1], [y, x + 1]);
      }
      return cells.some((row, y) => row.some((on, x) => !on && !seen[y][x]));
    });
    expect(offenders).toEqual([]);
  });

  /*
   * ONLY THE OUTLINE IS BLACK. Black between one tooth and the next reads as DECAY at the size this
   * ships at - the owner's word was rotten - so the interior separations are a dark TINT of the body's
   * own colour instead. One near-black is the outline; two means the quantiser put the rot back,
   * which it will do unprompted because the reference's interior keyline pixels are dark enough to
   * win a palette slot. `scripts/trace-art.py` lifts any body colour above a floor for this reason.
   */
  it('uses black for the outline and nothing else', () => {
    const darkness = (hex: string) => [1, 3, 5].reduce((sum, at) => sum + parseInt(hex.slice(at, at + 2), 16), 0);
    const offenders = names
      .map((n) => {
        const hexes = [...new Set(FILES[n].match(/#[0-9a-fA-F]{6}/g) ?? [])];
        return [n, hexes.filter((h) => darkness(h) < 230)] as const;
      })
      .filter(([, dark]) => dark.length !== 1)
      .map(([n, dark]) => `${n}: ${dark.length} near-black (${dark.join(' ')})`);
    expect(offenders).toEqual([]);
  });
});
