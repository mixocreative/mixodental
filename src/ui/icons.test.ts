import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/*
 * The house rules for the icon folder (src/ui/assets/icons/README.md), held to by a test so the set stays a
 * set. `scopeIcon` repairs most of this at runtime, which is what let a filled clone of the aligner icon sit
 * in the folder for weeks painting a solid blob on the type card: the app coped, so nobody saw the file was
 * wrong. These rules are about the FILES.
 */

/** Every icon file, as text, keyed by its name. */
const ICONS = Object.fromEntries(
  Object.entries(import.meta.glob<string>('./assets/icons/*.svg', { query: '?raw', import: 'default', eager: true }))
    .map(([path, text]) => [path.replace(/.*\//, ''), text]),
);

const names = Object.keys(ICONS);

describe('the icon folder', () => {
  it('holds the icons the app draws with', () => {
    expect(names.length).toBeGreaterThan(0);
    for (const name of ['aligner.svg', 'denture.svg', 'generic.svg', 'back.svg']) expect(names).toContain(name);
  });

  // The size comes from the app's CSS (`.choice-key-art`, `.start-back-art`...). A width or height on the root
  // fights it, and an icon then draws at its own size inside a box meant to hold it.
  it('lets the CSS size every icon', () => {
    const offenders = names.filter((name) => /<svg[^>]*\s(width|height)=/.test(ICONS[name]));
    expect(offenders).toEqual([]);
  });

  it('gives every icon a viewBox to scale by', () => {
    expect(names.filter((name) => !/<svg[^>]*\sviewBox=/.test(ICONS[name]))).toEqual([]);
  });

  // ONE colour. An icon takes the colour of the place it sits in, so it can never be off-palette and can turn
  // paper-coloured on a pressed key. A literal written into a file is a second opinion about that.
  it('writes no colour into any file', () => {
    const offenders = names
      .map((name) => [name, ICONS[name].match(/#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?)\([^)]*\)/g) ?? []] as const)
      .filter(([, found]) => found.length > 0)
      .map(([name, found]) => `${name}: ${[...new Set(found)].join(' ')}`);
    expect(offenders).toEqual([]);
  });
});

/*
 * THE PIXEL-ART SET, and the one rule the rest of the folder does not have to keep.
 *
 * `scripts/pixel-icons.mjs` draws a few icons as pixel art in vector: a 24 x 24 grid, ten units a fake
 * pixel, on a 240 artboard. Two things can quietly break that and neither shows up as an error - a hand
 * edit that lands a rect off the grid, and a CSS size that is not a whole multiple of 24, which makes
 * every fake pixel straddle a real one. The second one is what made the rail's icons look badly drawn
 * when they were only badly sized, so both are held here rather than in a comment.
 *
 * A pixel-art file is the one marked `shape-rendering="crispEdges"`; the Lucide and hand-drawn icons in
 * the same folder are not pixel art and none of this binds them.
 */
const GRID = 24;
const CELL = 10;
const PIXEL_ART = names.filter((name) => ICONS[name].includes('shape-rendering="crispEdges"'));

describe('the pixel-art icons', () => {
  it('has some, or the generator stopped being used', () => {
    expect(PIXEL_ART.length).toBeGreaterThan(0);
  });

  it('draws every one on the same artboard', () => {
    const wrong = PIXEL_ART.filter((name) => !ICONS[name].includes(`viewBox="0 0 ${GRID * CELL} ${GRID * CELL}"`));
    expect(wrong).toEqual([]);
  });

  // Every rect is a whole number of fake pixels, at a whole fake pixel: one off-grid value and the icon
  // no longer lines up with the others at any size.
  it('keeps every rect on the grid', () => {
    const offenders: string[] = [];
    for (const name of PIXEL_ART) {
      for (const [tag] of ICONS[name].matchAll(/<rect\b[^>]*>/g)) {
        const off = ['x', 'y', 'width', 'height']
          .map((attr) => [attr, new RegExp(` ${attr}="([^"]*)"`).exec(tag)?.[1]] as const)
          .filter(([, value]) => value !== undefined && Number(value) % CELL !== 0);
        if (off.length > 0) offenders.push(`${name}: ${off.map(([attr, value]) => `${attr}=${value}`).join(' ')}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});

describe('the pixel-art display sizes in src/styles.css', () => {
  const CSS = new TextDecoder().decode(readFileSync('src/styles.css'));
  const sizes = [...CSS.matchAll(/--pixel-icon-[\w-]+:\s*(\d+)px/g)].map(([whole, px]) => [whole.split(':')[0]!.trim(), Number(px)] as const);

  it('declares them', () => {
    expect(sizes.length).toBeGreaterThan(0);
  });

  // The whole point of the token: a pixel-art icon shown at a fraction of its grid has blurred edges, and
  // no redrawing fixes it. 18px (0.75 of a pixel each) is the mistake this test exists to stop repeating.
  it('makes every one a whole multiple of the grid', () => {
    expect(sizes.filter(([, px]) => px % GRID !== 0)).toEqual([]);
  });
});
