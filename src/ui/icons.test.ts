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
