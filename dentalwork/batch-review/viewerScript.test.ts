import { readFileSync } from 'node:fs';
import { transformSync } from 'esbuild';
import { describe, expect, it } from 'vitest';

/*
 * THE REVIEW PAGE'S SCRIPT PARSES. viewer.html carries its logic in one inline <script type="module">,
 * which no type checker or bundler reads, so a syntax error there showed only as a blank page in the
 * browser: on 2026-11-20 a second `const picked` in the same function stopped the whole page, and
 * nothing in `npm test` could have said so. esbuild (Vite's own parser) reads it here instead.
 */
describe('the folder review page script', () => {
  const page = readFileSync(new URL('./viewer.html', import.meta.url), 'utf8');
  const scripts = [...page.matchAll(/<script type="module">([\s\S]*?)<\/script>/g)].map(([, code]) => code);

  it('is found, so this test is reading something', () => {
    expect(scripts.length).toBeGreaterThan(0);
    expect(scripts.join('').length).toBeGreaterThan(10_000);
  });

  it('parses as an ES module - a duplicate declaration or a stray bracket fails here, not in the browser', () => {
    for (const code of scripts) expect(() => transformSync(code, { loader: 'js', format: 'esm' })).not.toThrow();
  });

  /*
   * THE FACT FILTERS NAME ROWS THAT EXIST. The denture facts table keeps only the labels in DENTURE_ROWS, and the
   * groups place rows by the labels in FACT_GROUPS - by string, so renaming a row's label and not these lists drops the
   * row without a word: on 2026-11-22 "Dental rim plane" became "Rim plane" and the denture rim plane fact vanished
   * (found by Fable's review). Every listed label must be a row the table can produce: `['<label>', <value>`.
   */
  it('lists in DENTURE_ROWS and FACT_GROUPS only labels the facts table actually produces', () => {
    const code = scripts.join('\n');
    const listOf = (start: RegExp) => {
      const at = code.search(start);
      expect(at, String(start)).toBeGreaterThan(-1);
      const body = code.slice(at, code.indexOf('];', at));
      return [...body.matchAll(/'([^']+)'/g)].map(([, label]) => label!);
    };
    const denture = listOf(/const DENTURE_ROWS = \[/);
    // FACT_GROUPS rows are [id, title, open, [row names]]: only the inner name lists are row labels.
    const groupsAt = code.search(/const FACT_GROUPS = \[/);
    const groupsBody = code.slice(groupsAt, code.indexOf('];', groupsAt));
    const grouped = [...groupsBody.matchAll(/\[\s*'[^']+',\s*'[^']+',\s*(?:true|false),\s*\[([^\]]*)\]/g)]
      .flatMap(([, names]) => [...names!.matchAll(/'([^']+)'/g)].map(([, label]) => label!));
    expect(grouped.length).toBeGreaterThan(10);
    const produced = (label: string) => code.includes(`['${label}', `) && code.split(`['${label}', `).length - 1 >= 1;
    const missing = [...new Set([...denture, ...grouped])].filter((label) => !produced(label));
    expect(denture.length).toBeGreaterThan(10);
    expect(missing).toEqual([]);
  });
});
