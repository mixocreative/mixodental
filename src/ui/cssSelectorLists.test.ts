// Copyright (c) Mixo Creative.

import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * NO SELECTOR LIST MAY RUN INTO THE NEXT RULE. One test, for the one fault it exists for.
 *
 * On 2026-11-18 `src/styles/theme.css` held this, after a third selector and its body were deleted
 * in an earlier edit:
 *
 *     [data-theme='instrument'] button:focus-visible,
 *     [data-theme='instrument'] input:focus-visible,
 *
 *     // ---- The three text styles ----
 *     [data-theme='instrument'] .title { font-family: …; font-size: var(--title-size); … }
 *
 * **A comment is not a separator in CSS.** The list continued past it and took `.title`'s body, so
 * every keyboard-focused button and input in the app was drawn as a 30px screen title. On the entry
 * screen — where `StartScreen` focuses the first button on mount — that was the one key the screen
 * exists to offer: 309x52, 30px Roboto Mono, navy text on its own navy fill, correcting itself the
 * moment focus moved, which is why it read as a mysterious few-second delay rather than as a style
 * bug. It cost a day of browser experiments, six wrong hypotheses and two changes made for causes
 * that had not happened.
 *
 * It was INVISIBLE to every tool in the repo. CSS is not type-checked; the file parses; the walk
 * asserts behaviour and text; the unit suite renders to a string with no stylesheet at all. Nothing
 * reads this file for meaning. So this is the thing that reads it.
 *
 * WHAT IT LOOKS FOR, and why that is the right signal: a line whose last non-space character is a
 * comma, followed by a blank line or a comment. Inside a healthy selector list the next line is
 * always another selector. The browser ignores the gap and joins them; a reader sees two separate
 * rules. That difference between what the machine does and what a person sees IS the bug, and it is
 * exactly what this looks for — not "a trailing comma", which is legal and common mid-list.
 */
const CSS_DIRS = ['src', join('src', 'styles')];

/** Every stylesheet the app ships, found rather than listed, so a new one is covered on arrival. */
function sheets(): readonly { file: string; text: string }[] {
  const found: { file: string; text: string }[] = [];
  for (const dir of CSS_DIRS) {
    for (const name of readdirSync(dir)) {
      if (!name.endsWith('.css')) continue;
      // Decoded rather than read with an encoding argument: the same form `art.test.ts` uses, and
      // the one this repo's `tsc` accepts for `node:fs` under the test runner's types.
      found.push({ file: join(dir, name), text: new TextDecoder().decode(readFileSync(join(dir, name))) });
    }
  }
  return found;
}

describe('no selector list runs into the next rule', () => {
  it('finds the stylesheets at all, so an empty pass cannot look like a clean one', () => {
    // A test that scanned nothing would report success for ever. S21: a vacuous pass is a defect.
    expect(sheets().length).toBeGreaterThanOrEqual(4);
  });

  it('has no selector line ending in a comma before a blank line or a comment', () => {
    const breaks: string[] = [];
    for (const { file, text } of sheets()) {
      /*
       * PROSE IS NOT CODE. The first run of this flagged three COMMENT lines that happen to end in
       * a comma mid-sentence. Block comments are blanked out - line by line, so the line numbers in
       * a failure still point at the real file - and only then is the stylesheet read.
       */
      const bare = text.replace(/\/\*[\s\S]*?\*\//g, (block) => block.replace(/[^\n]/g, ' '));
      const lines = bare.split('\n');
      for (let at = 0; at < lines.length; at += 1) {
        const line = (lines[at] ?? '').trim();
        if (!line.endsWith(',')) continue;
        // A declaration can also end in a comma (`font-family: a, b,`), and those are inside a
        // block. Only a SELECTOR line is at risk, and a selector line carries no colon-value pair.
        if (line.includes(':') && line.includes(';')) continue;
        const next = (lines[at + 1] ?? '').trim();
        if (next === '' || next.startsWith('/*') || next.startsWith('*') || next.startsWith('//')) {
          breaks.push(`${file}:${at + 1}  ${line}`);
        }
      }
    }
    expect(breaks).toEqual([]);
  });
});
