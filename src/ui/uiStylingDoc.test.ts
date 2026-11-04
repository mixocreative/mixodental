import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import doc from '../../docs/ui-styling.md?raw';

/*
 * docs/ui-styling.md is the designer's list of every CSS custom property. This test fails when the code uses or
 * declares a token the page does not name. A token counts as used when it is declared (`--x: ...`) or read
 * (`var(--x)`) in a stylesheet, read as `var(--x)` in TS/TSX, or passed by name as a quoted string (`'--x'`, which
 * is how tokenColour / tokenCss / sceneColours name a token).
 */

/** Stylesheets are read from disk (the test runner returns nothing for a `.css?raw`); every stylesheet of the app and the batch viewer is listed. */
const STYLESHEETS = ['src/styles.css', 'src/styles/layout.css', 'src/styles/theme.css', 'src/fonts.css', 'src/kit/kit.css', 'dentalwork/batch-review/tokens.css', 'dentalwork/batch-review/base.css'];
const SOURCES: Record<string, string> = {
  ...import.meta.glob<string>('../**/*.{ts,tsx}', { query: '?raw', import: 'default', eager: true }),
  ...Object.fromEntries(STYLESHEETS.map((path) => [path, new TextDecoder().decode(readFileSync(path))])),
};
const isTest = (path: string) => /\.test\.tsx?$/.test(path);

function tokensIn(path: string, text: string): string[] {
  const found = new Set<string>();
  for (const match of text.matchAll(/var\(\s*(--[a-z][a-z0-9-]*)/g)) found.add(match[1]!);
  if (path.endsWith('.css')) for (const match of text.matchAll(/^\s*(--[a-z][a-z0-9-]*)\s*:/gm)) found.add(match[1]!);
  else for (const match of text.matchAll(/['"`](--[a-z][a-z0-9-]*)['"`]/g)) found.add(match[1]!);
  return [...found];
}

const USED = new Map<string, string>();
for (const [path, text] of Object.entries(SOURCES)) {
  if (isTest(path)) continue;
  for (const token of tokensIn(path, text)) if (!USED.has(token)) USED.set(token, path);
}

/** A token named in the doc as `--name` (not as the start of a longer name). */
const documented = (token: string) => new RegExp(`${token}(?![a-z0-9-])`).test(doc);

describe('docs/ui-styling.md', () => {
  it('finds the tokens the code uses', () => {
    expect(USED.size).toBeGreaterThan(60);
    for (const token of ['--tip-path', '--mark-remove', '--scene-bg', '--layer-allowed']) expect(USED.has(token), token).toBe(true);
  });

  it('names every CSS custom property the code declares or reads', () => {
    const missing = [...USED].filter(([token]) => !documented(token)).map(([token, path]) => `${token} (${path})`);
    expect(missing).toEqual([]);
  });

  it('points a designer at the files they edit', () => {
    for (const name of ['src/styles.css', 'src/ui/tokenColour.ts', 'src/ui/assets/icons', 'src/ui/Icon.tsx', 'src/denture/README.md', 'data-ui']) expect(doc).toContain(name);
  });
});
