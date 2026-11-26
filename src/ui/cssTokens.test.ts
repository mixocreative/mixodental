import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/*
 * EVERY `var(--x)` THE CSS READS IS DECLARED SOMEWHERE.
 *
 * This exists because of a silent, total failure it would have caught. `--pixel-icon-inline` was deleted
 * when the inline glyphs stopped being pixel art, and `src/kit/kit.css` went on sizing the style book's
 * icon cards with it. An undefined custom property makes the whole `width` declaration invalid, so the
 * svg collapsed to nothing and EVERY card in that group rendered empty - on the page whose one job is to
 * show the designer what the icons look like.
 *
 * Nothing could see it. The markup was perfectly correct, so the render test passed; the token-doc test
 * only asks whether a token is NAMED in the page, and a deleted one simply stops being checked. It took
 * the owner opening the page. A missing colour degrades quietly, but a missing size deletes the element,
 * so this is cheap insurance against a class of fault that is invisible to every other test here.
 */
const STYLESHEETS = [
  'src/styles.css', 'src/styles/layout.css', 'src/styles/theme.css', 'src/fonts.css', 'src/kit/kit.css',
  'typelab/tokens.css', 'typelab/base.css',
];
// Comments stripped first: this very file's explanation of the fault names the deleted token, and a
// guard that cannot tell code from a note about code reports the note.
const CSS = Object.fromEntries(STYLESHEETS.map((path) =>
  [path, new TextDecoder().decode(readFileSync(path)).replace(/\/\*[\s\S]*?\*\//g, ' ')]));

/**
 * Tokens declared anywhere: in any stylesheet (`--x: ...`), or named as a string in TS/TSX, which is how
 * a value that changes per element is set - `TiltDial` writes `--tick-angle` onto each tick inline, and
 * no stylesheet ever declares it. Reading only the CSS reported four of those as missing.
 *
 * COMMENTS ARE STRIPPED FROM THE TS TOO, and that is not tidiness - without it this test cannot catch the
 * one fault it was written for. A TS comment naming a token in BACKTICKS looks exactly like a declaration
 * to the pattern below, and the paragraph above explaining the deletion of `--pixel-icon-inline` named it
 * in backticks. So the deleted token counted as declared, and the regression would have passed again.
 *
 * It was proved "working" against `var(--gone-token)` - a name appearing nowhere - which only showed that
 * an UNKNOWN token fails. The real fault is a token that was deleted and is still TALKED ABOUT, and a
 * forgery has to reproduce the fault, not a cousin of it.
 */
const SOURCES: Record<string, string> = import.meta.glob<string>('../**/*.{ts,tsx}', { query: '?raw', import: 'default', eager: true });
const uncommented = (text: string) => text.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\/\/[^\n]*/g, ' ');
const declared = new Set<string>();
for (const text of Object.values(CSS)) for (const [, name] of text.matchAll(/^\s*(--[a-z][a-z0-9-]*)\s*:/gm)) declared.add(name);
for (const text of Object.values(SOURCES)) for (const [, name] of uncommented(text).matchAll(/['"`](--[a-z][a-z0-9-]*)['"`]/g)) declared.add(name);

describe('the CSS custom properties', () => {
  it('declares some, or this test is reading nothing', () => {
    expect(declared.size).toBeGreaterThan(60);
  });

  it('declares every one that is read', () => {
    const missing: string[] = [];
    for (const [path, text] of Object.entries(CSS)) {
      for (const [, name] of text.matchAll(/var\(\s*(--[a-z][a-z0-9-]*)\s*([,)])/g)) {
        if (!declared.has(name)) missing.push(`${name} (${path})`);
      }
    }
    // A `var(--x, fallback)` is deliberate and safe; only a bare read of an undeclared token is a fault.
    expect([...new Set(missing)]).toEqual([]);
  });
});

/*
 * THE FOLDER REVIEW READS ONLY WHAT IT LOADS. Its page links tokens.css and base.css and nothing else,
 * so a token the APP declares is no help to it - and the global check above cannot see that, because
 * it pools every declaration. On 2026-11-20 fourteen reads of `--accent` and `--panel` in the page's
 * inline <style> drew the node canvas, the print-angle figure and the stage divider with no colour at
 * all; `--accent` is declared by the app, so the pooled check passed.
 */
describe('the folder review page', () => {
  const page = new TextDecoder().decode(readFileSync('typelab/viewer.html'));
  const style = [...page.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(([, css]) => css).join('\n').replace(/\/\*[\s\S]*?\*\//g, ' ');
  const own = new Set<string>();
  for (const text of [CSS['typelab/tokens.css'], CSS['typelab/base.css'], style]) {
    for (const [, name] of text.matchAll(/^\s*(--[a-z][a-z0-9-]*)\s*:/gm)) own.add(name);
  }
  // Set from the page's script (`setProperty('--chain-h', ...)`), which is how the divider works.
  for (const [, name] of page.matchAll(/setProperty\(\s*['"`](--[a-z][a-z0-9-]*)['"`]/g)) own.add(name);

  it('reads every token from a stylesheet it actually loads', () => {
    // A read with a fallback (`var(--x, y)`) is deliberate and safe; a BARE read of an unloaded token is the fault.
    const missing = [...style.matchAll(/var\(\s*(--[a-z][a-z0-9-]*)\s*\)/g)].map(([, name]) => name).filter((name) => !own.has(name));
    expect([...new Set(missing)]).toEqual([]);
  });
});
