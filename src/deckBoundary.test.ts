import { describe, expect, it } from 'vitest';

/*
 * THE DECK SITS ABOVE THE STATE, so nothing under `src/state/` may import from `src/deck/`.
 *
 * It did once, both ways at the same time: `state/project.ts` reached up for `TOOL_ORDER` and
 * `stamped` while `deck/unitFacts.ts` reached down for `PrintUnit`. A cycle between two directories
 * is not caught by the compiler — the bundler resolves it, and it only shows up as a module
 * initialising half-built. The fix was to move what both layers need (`state/tools.ts`,
 * `state/revisions.ts`) to the lower one; this test is what keeps it there, because the next person
 * to want `TOOL_ORDER` in the reducer will reach for the deck's copy if nothing stops them.
 */
const SOURCES = import.meta.glob<string>(
  ['./state/**/*.ts', './state/**/*.tsx', '!./**/*.test.ts', '!./**/*.test.tsx'],
  { query: '?raw', import: 'default', eager: true },
);
const DECK_IMPORT = /\b(?:import|export)\s[^'"`;]*?\sfrom\s*['"][^'"]*\/deck\/[^'"]*['"]|\bimport\(\s*['"][^'"]*\/deck\/[^'"]*['"]/;

describe('the deck is above the state layer', () => {
  it('scans the state sources', () => {
    expect(Object.keys(SOURCES)).toContain('./state/project.ts');
  });

  it('has nothing under src/state importing from src/deck', () => {
    const reaching = Object.entries(SOURCES)
      .filter(([, source]) => DECK_IMPORT.test(source))
      .map(([file]) => file);
    expect(reaching).toEqual([]);
  });
});
