import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/*
 * Audit 2026-11-02 #5: at 900 x 700 the dental workspace stopped at 58 % of the window (160 px blank under it),
 * Step 1's bar spanned the whole viewport and hid the denture and the step badge, and the background-work list lay
 * over the bar's Back button (Back could not be clicked while a scan ran). The scripted walk measured each; this test
 * keeps the rules that fixed them.
 */

const css = new TextDecoder().decode(readFileSync('src/styles.css'));

/** The declarations of `selector` inside every `@media` block whose query is exactly `query`. */
function rulesIn(query: string, selector: string): string {
  const out: string[] = [];
  for (const block of css.split('@media ').slice(1)) {
    if (!block.startsWith(`${query} {`)) continue;
    const body = block.slice(query.length + 2);
    const at = body.indexOf(`${selector} {`);
    if (at >= 0) out.push(body.slice(at, body.indexOf('}', at)));
  }
  return out.join('\n');
}

describe('dental steps in a narrow window (900 x 700)', () => {
  /*
   * This used to be written as `max(calc(100vh - 140px), 520px)`: the window less a GUESS at the chrome. The
   * guess was wrong - the chrome is 143px, and on this window the row came out 560px inside a 643px box, so
   * some of the gap the audit found was still there. The shell is a column now (`main` in src/styles.css) and
   * measures its own parts, so the row simply takes what it is given and never drops under its floor.
   */
  it('the dental viewport fills what the shell gives it, not 58 % of the window', () => {
    // Two rules in this query set the rows: the narrow stacking rule (58 % of the window) and the dental
    // override after it. The LAST one wins, and it must be the override.
    const rule = rulesIn('(max-width: 1100px)', '.workspace--dental');
    const rows = [...rule.matchAll(/grid-template-rows:\s*([^;]+)/g)].map((found) => found[1].trim());
    expect(rows.at(-1)).toMatch(/^minmax\(\d+px, 1fr\)$/);
    expect(rule).not.toContain('100vh');
  });

  it('the background-work list sits above the docked edit bar, not over its Back button', () => {
    expect(rulesIn('(max-width: 1100px)', '.viewport--editing .job-activity')).toMatch(/bottom: auto;\s*top: \d+px/);
  });

  it('Step 1 bar stays on the right below the badge on a tablet-wide window', () => {
    const rule = rulesIn('(min-width: 721px) and (max-width: 1100px)', '.edit-bar--orient');
    expect(rule).toContain('left: auto');
    expect(rule).toContain('bottom: auto');
    expect(rule).toMatch(/width: \d+px/);
  });
});
