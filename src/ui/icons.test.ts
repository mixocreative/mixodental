import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

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
 * The one size token left, and why there is only one. The glyphs in THIS folder are smooth line icons
 * drawn in the Lucide house style, so no grid binds them; the coloured art in `assets/art/` is pixel
 * art on a 48 grid and must be shown at a whole multiple of it, or every cell straddles a real pixel
 * and the edges blur - which reads as a badly DRAWN icon when it is only a badly SIZED one.
 *
 * This test once asserted 24 for both sets while the key art was on a 64 grid: it would have passed
 * the wrong 96px and failed the right 128px. A guard that is right about the wrong thing is worse than
 * none, because it argues confidently against the fix.
 */
describe('the pixel-art display size in src/styles.css', () => {
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
  it('shows the key art at a whole multiple of its grid', () => {
    expect(px('--pixel-icon-key') % 48).toBe(0);      // src/ui/assets/art, 48 grid
  });

  // The whole point of the tokens: a pixel-art icon shown at a fraction of its grid has blurred edges and
  // no redrawing fixes it. 18px on the rail - 0.75 of a pixel each - is the mistake they exist to stop.
  it('declares it', () => {
    expect(px('--pixel-icon-key')).toBeGreaterThan(0);
  });
});
