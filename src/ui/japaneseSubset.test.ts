import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/*
 * The Japanese title face is Noto Serif JP CUT DOWN to the characters src/locales/ja.ts contains (about five
 * hundred glyphs out of some seventeen thousand, which is how a CJK face fits in a web app at all). The cut is
 * made by `npm run fonts` from that file, so the two must stay in step: a Japanese string added later with a
 * character the subset does not carry would fall out of the bundled face and be drawn by whatever the reader's
 * machine happens to have, in the middle of a word, at whatever weight that face can manage.
 *
 * This test is the thing that notices.
 */

/*
 * WHITESPACE IS NOT A GLYPH, and a checkout's line endings are not the locale's. With `core.autocrlf`
 * on, a Windows checkout can hold `ja.ts` as CRLF while the subset file (written LF by `npm run
 * fonts`) stays LF, and this test then reported `\r` as "a character the font does not carry" - a red
 * that meant the machine, on a file nobody had touched. Both sides are compared without whitespace.
 */
const glyphs = (text: string): string => text.replace(/\s/g, '');
const ja = glyphs(new TextDecoder().decode(readFileSync('src/locales/ja.ts')));
const subset = glyphs(new TextDecoder().decode(readFileSync('src/assets/fonts/japanese-subset.txt')));

describe('the bundled Japanese title face', () => {
  it('carries every character the Japanese locale uses', () => {
    const have = new Set(subset);
    const missing = [...new Set(ja)].filter((character) => !have.has(character));
    expect(missing, `src/locales/ja.ts uses ${missing.length} character(s) the subset font does not carry: ${missing.join('')}. Run \`npm run fonts\` to cut the face again.`).toEqual([]);
  });

  it('carries no more than the locale needs', () => {
    const used = new Set(ja);
    const spare = [...new Set(subset)].filter((character) => !used.has(character));
    expect(spare).toEqual([]);
  });
});
