import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { ICON_CATALOGUE } from './iconCatalogue';

/*
 * The house rules for the icon folder (src/ui/assets/icons/README.md), held to by a test so the set stays a
 * set. `scopeIcon` repairs most of this at runtime, which is what let a filled clone of the aligner icon sit
 * in the folder for weeks painting a solid blob on the type card: the app coped, so nobody saw the file was
 * wrong. These rules are about the FILES.
 */

/**
 * Every icon file, as text, keyed by its name - read FROM DISK, not through `import.meta.glob(...?raw)`.
 *
 * The glob is what the app uses and it is right for the app, but under the test runner it is not a
 * trustworthy read: `uiStylingDoc.test.ts` already notes that a `.css?raw` comes back empty there, and
 * while proving these guards a forged icon file came back as its previous contents, so the guard passed
 * on a file that was broken on disk. A guard that reads a cache is not a guard. `readdirSync` also means
 * a file added to the folder is seen without a rebuild.
 */
const DIR = 'src/ui/assets/icons';
const ICONS = Object.fromEntries(
  readdirSync(DIR).filter((name) => name.endsWith('.svg'))
    .map((name) => [name, new TextDecoder().decode(readFileSync(join(DIR, name)))]),
);

const names = Object.keys(ICONS);

describe('the icon folder', () => {
  it('holds the icons the app draws with', () => {
    expect(names.length).toBeGreaterThan(0);
    // The three item types moved to `assets/art/` when they became coloured; `src/ui/art.test.ts`
    // holds that folder. What is left here is the one-ink set, and these are its load-bearing files.
    for (const name of ['back.svg', 'next.svg', 'orient.svg', 'tool-rim.svg']) expect(names).toContain(name);
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
 * `scripts/pixel-icons.mjs` scaffolds a few icons as pixel art in vector: a 24 x 24 grid, ten units a fake
 * pixel, on a 240 artboard. Two things can quietly break that and neither shows up as an error - a hand
 * edit that lands a shape off the grid, and a CSS size that is not a whole multiple of 24, which makes
 * every fake pixel straddle a real one. The second one is what made the rail's icons look badly drawn
 * when they were only badly sized, so both are held here rather than in a comment.
 *
 * WHICH FILES ARE PIXEL ART IS DECLARED, in `src/ui/iconCatalogue.ts`, and is deliberately not read from
 * the file. It used to be read from `shape-rendering="crispEdges"`, and that is an attribute a vector tool
 * drops on export: a designer who opened one of these and saved it would have silently taken the file out
 * of the guarded set at exactly the moment the guard was needed. The attribute stays in the files, but the
 * CSS sets it too (`--pixel-icon-*` rules), so an export without it still renders crisp.
 */
const GRID = 24;
const CELL = 10;
const PIXEL_ART = ICON_CATALOGUE.filter((entry) => entry.pixel).map((entry) => `${entry.name}.svg`);

/**
 * Every number in a pixel-art file that is NOT a whole fake pixel.
 *
 * Deliberately not read attribute by attribute. A pixel-art icon is made of whole fake pixels and nothing
 * else, so EVERY number in it is a multiple of ten - which means the check needs no list of attributes to
 * keep up to date, and catches a run of squares however the exporter chose to write it: `<rect>`, a
 * `<path>` with a `d`, a `<polygon>` with `points`. The attribute-by-attribute version of this missed a
 * `<path>` outright.
 *
 * The root `<svg>` tag is dropped first: its viewBox is the artboard, not a shape, and `0 0 240 240` would
 * otherwise be read as geometry. Anything else with a number in it - a stroke width, an opacity - is a
 * thing a pixel-art file should not have, so being told about it is the point rather than a false alarm.
 */
function offGrid(file: string): string[] {
  // Everything after the root tag's closing `>`: its viewBox is the artboard and `w3.org` holds a 3.
  const body = file.slice(file.indexOf('>', file.indexOf('<svg')) + 1);
  return [...body.matchAll(/-?\d+(?:\.\d+)?/g)].map(([n]) => n).filter((n) => Number(n) % CELL !== 0);
}

describe('the pixel-art icons', () => {
  it('has some, and every declared one is really in the folder', () => {
    expect(PIXEL_ART.length).toBeGreaterThan(0);
    expect(PIXEL_ART.filter((name) => !names.includes(name))).toEqual([]);
  });

  it('draws every one on the same artboard', () => {
    const wrong = PIXEL_ART.filter((name) => !ICONS[name].includes(`viewBox="0 0 ${GRID * CELL} ${GRID * CELL}"`));
    expect(wrong).toEqual([]);
  });

  // One off-grid number and the icon no longer lines up with the others at any size.
  it('keeps every shape on the grid', () => {
    const offenders = PIXEL_ART
      .map((name) => [name, offGrid(ICONS[name])] as const)
      .filter(([, bad]) => bad.length > 0)
      .map(([name, bad]) => `${name}: ${bad.join(' ')}`);
    expect(offenders).toEqual([]);
  });
});

describe('the pixel-art display sizes in src/styles.css', () => {
  const CSS = new TextDecoder().decode(readFileSync('src/styles.css'));
  // A template literal eats a lone backslash, so `\s` there is just the letter s and the pattern
  // matched nothing. Build the pattern from a plain string instead of fighting the escaping.
  const px = (token: string) => Number(new RegExp(token + ':\\s*(\\d+)px').exec(CSS)?.[1]);

  /*
   * TWO SETS, TWO GRIDS, and each display size has to be a whole multiple of ITS OWN grid - not of 24.
   * This test asserted 24 for both while the key art moved to a 64 grid, which would have passed the
   * old 72px and 96px and failed the correct 128px. A guard that is right about the wrong thing is
   * worse than none, because it argues confidently against the fix.
   */
  it('shows each set at a whole multiple of its own grid', () => {
    expect(px('--pixel-icon-inline') % 24).toBe(0);   // src/ui/assets/icons, 24 grid
    expect(px('--pixel-icon-key') % 64).toBe(0);      // src/ui/assets/art, 64 grid
  });

  // The whole point of the tokens: a pixel-art icon shown at a fraction of its grid has blurred edges and
  // no redrawing fixes it. 18px on the rail - 0.75 of a pixel each - is the mistake they exist to stop.
  it('declares both of them', () => {
    expect(px('--pixel-icon-inline')).toBeGreaterThan(0);
    expect(px('--pixel-icon-key')).toBeGreaterThan(0);
  });
});
