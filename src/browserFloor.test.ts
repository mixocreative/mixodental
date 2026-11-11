import { describe, expect, it } from 'vitest';

/*
 * THE BROWSER FLOOR IS DECLARED TWICE, SO SOMETHING HAS TO KEEP THE TWO HONEST.
 *
 * `vite.config.ts` sets `build.target` and `package.json` sets `browserslist`. Neither can import
 * the other - a `browserslist` field has to be static JSON - so the floor genuinely lives in two
 * places and this is the guard that makes that safe (audit MIXO-03).
 *
 * THE LIMIT OF THIS TEST, WRITTEN DOWN because 56 of 58 source-reading guards in this repo had no
 * written limit and the audit said so (MIXO-12): the forbidden list below is a LIST, not a
 * derivation. It catches the APIs named in it and nothing else. A fourth API that ships above the
 * floor and is not listed here passes. Keeping it useful means adding a row when a new API is
 * reached for - which is cheap, and much cheaper than the alternative, which is parsing every
 * member expression in the tree and owning a browser-compatibility database to check it against.
 */

const SRC = import.meta.glob<string>(['./**/*.ts', './**/*.tsx', '!./**/*.test.ts', '!./**/*.test.tsx'], { query: '?raw', import: 'default', eager: true });
// Through `import.meta.glob(?raw)`, not `node:fs`: `src/testFs.d.ts` declares a one-argument
// `readFileSync` on purpose, because the project carries no Node types.
const ROOT = import.meta.glob<string>(['../vite.config.ts', '../package.json'], { query: '?raw', import: 'default', eager: true });
const VITE_CONFIG = ROOT['../vite.config.ts']!;
const PACKAGE = JSON.parse(ROOT['../package.json']!) as { browserslist?: string[] };

/** The floor, as `build.target` spells it. One row per engine the browserslist also names. */
const FLOOR: Readonly<Record<string, string>> = { chrome: '93', edge: '93', firefox: '114', safari: '15.4' };

describe('the browser floor', () => {
  it('is declared in the build at all - it used to be Vite\'s default, which was Safari 14', () => {
    expect(VITE_CONFIG).toMatch(/target:\s*\[/);
    expect(PACKAGE.browserslist, 'package.json needs a browserslist').toBeDefined();
  });

  it('says the same numbers in vite.config.ts and package.json', () => {
    const target = /target:\s*\[([^\]]+)\]/.exec(VITE_CONFIG)?.[1] ?? '';
    const inTarget = Object.fromEntries([...target.matchAll(/'([a-z]+)([\d.]+)'/g)].map((m) => [m[1]!, m[2]!]));
    const inBrowserslist = Object.fromEntries((PACKAGE.browserslist ?? [])
      .map((row) => /^([a-z_]+)\s*>=\s*([\d.]+)$/.exec(row))
      .filter((m): m is RegExpExecArray => m !== null)
      .map((m) => [m[1]!, m[2]!]));
    for (const [engine, version] of Object.entries(FLOOR)) {
      expect(inTarget[engine], `build.target ${engine}`).toBe(version);
      expect(inBrowserslist[engine], `browserslist ${engine}`).toBe(version);
    }
    // iOS is the README's promise of phones and tablets, and it is Safari's number.
    expect(inBrowserslist['ios_saf'], 'browserslist ios_saf').toBe(FLOOR['safari']);
  });

  /*
   * Each row: the API, and the Safari version that shipped it. Safari is the binding engine for
   * every one of them, which is why one column is enough.
   */
  const ABOVE_THE_FLOOR: readonly (readonly [string, string])[] = [
    ['Object.groupBy', '17.4'],
    ['Map.groupBy', '17.4'],
    ['Array.prototype.toSorted', '16.4'],
    ['Array.prototype.toReversed', '16.4'],
    ['Array.prototype.with', '16.4'],
    ['Array.prototype.findLast', '15.4'],
    ['String.prototype.isWellFormed', '17.0'],
    ['Promise.withResolvers', '17.4'],
    ['navigator.clipboard.read', '13.1'],
    ['URL.canParse', '17.0'],
    ['RegExp.prototype.hasIndices', '17.0'],
  ];

  it('is not crossed by any API this test knows to be newer than it', () => {
    const floor = Number.parseFloat(FLOOR['safari']!);
    const reached: string[] = [];
    for (const [api, shipped] of ABOVE_THE_FLOOR) {
      if (Number.parseFloat(shipped) <= floor) continue; // at or below the floor: allowed
      // The member name alone, so `x.toSorted(` is found as well as `Array.prototype.toSorted`.
      const member = api.replace(/^.*\./, '');
      const pattern = new RegExp(`\\b(?:${api.replace(/\./g, '\\.')}|\\.${member}\\s*\\()`);
      for (const [file, code] of Object.entries(SRC)) {
        if (file.startsWith('./kit/')) continue; // the designer's style book, not shipped to an operator
        if (pattern.test(code)) reached.push(`${api} (Safari ${shipped}) in ${file}`);
      }
    }
    expect(reached, 'either lower the floor or stop using these').toEqual([]);
  });

  it('still needs every API that sets it, so the floor cannot quietly become too high', () => {
    const all = Object.values(SRC).join('\n');
    // If one of these ever leaves the source, the floor it bought can come down - and a floor kept
    // higher than the code needs turns devices away for nothing.
    for (const api of ['crypto.randomUUID', 'Object.hasOwn']) {
      expect(all, `${api} no longer used: re-check the floor`).toContain(api);
    }
    // Module workers are what make Firefox 114 the floor, and they are the least obvious of the lot.
    // Not `[^)]*`: the first argument is `new URL('./w.ts', import.meta.url)`, whose own `)` ends
    // that class before `type:` is ever reached. Cost of learning this: one red test.
    expect(all).toMatch(/new Worker\([\s\S]{0,160}?type:\s*'module'/);
  });
});
