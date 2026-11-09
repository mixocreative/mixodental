import { describe, expect, it } from 'vitest';

/*
 * WHEN THE ENGINE GIVES US SOMETHING WE ARE WAITING ON, THE SUITE SAYS SO.
 *
 * `vendor/mixo-geocore` is consumed AS BUILT: a gap there is a handoff doc, never an edit here
 * (`CLAUDE.md`). That leaves a silence this project otherwise refuses to tolerate - the host works
 * around a missing capability, the engine ships it one day, and nobody notices, because the
 * workaround keeps passing. The workaround is the thing that goes quiet, not the gap.
 *
 * So each entry below is a capability the host has ALREADY paid for in a visible way, with what to
 * undo the day it arrives. These tests fail when the capability APPEARS - a deliberately inverted
 * check, and the only kind that can catch this. A vendor bump that turns one red is good news with
 * instructions attached, and `npm run vendor:check` hashes every vendored file, so the surface this
 * reads cannot change without a bump.
 *
 * Read from the TypeScript surface rather than by loading the WASM: the declaration is what the host
 * compiles against, it needs no engine build, and it costs a file read.
 */
const ENGINE_SURFACE = import.meta.glob<string>(
  ['../vendor/mixo-geocore/host/dental/dentalEngine.ts'],
  { query: '?raw', import: 'default', eager: true },
)['../vendor/mixo-geocore/host/dental/dentalEngine.ts']!;

interface AwaitedCapability {
  /** The symbol the engine would declare, as `docs/handoff/geocore-*.md` asked for it. */
  readonly symbol: string;
  /** The handoff that asked for it. */
  readonly handoff: string;
  /** What the host does instead today, and what to undo once the symbol exists. */
  readonly undo: string;
}

const AWAITED: readonly AwaitedCapability[] = [
  {
    symbol: 'dental_region_from_rim',
    handoff: 'docs/handoff/geocore-region-from-drawn-rim.md',
    undo: [
      'The three Step 2 strip controls (Area width, Area position, Support density) are shown-and-disabled',
      'whenever the support area is PAINT rather than a strip around a detected edge - which is both a',
      'hand-drawn rim and, more often, detection finding a rim but no area. With this symbol the band can',
      'be proposed from a given rim, so: make `useDentalTuning.tunable` true for a manual-area policy,',
      'delete the `tuningFixed` branch in `DentalBar` with its note and the `.dental-tuning.is-fixed`',
      'rules, drop the string from `src/glossary.ts`\'s allowlist and from both locale files, and retire',
      'the DentalBar test that pins the disabled state.',
    ].join(' '),
  },
];

describe('capabilities the host is waiting on from the vendored engine', () => {
  it.each(AWAITED)('$symbol has not arrived yet - when it does, this fails on purpose', ({ symbol, handoff, undo }) => {
    expect(
      ENGINE_SURFACE.includes(symbol),
      `GOOD NEWS, NOT A BREAKAGE: the vendored engine now declares \`${symbol}\` (asked for in ${handoff}).\n\n${undo}\n\nThen remove this entry from AWAITED.`,
    ).toBe(false);
  });

  /*
   * The watch is only as honest as its ability to see the surface at all. A moved or renamed vendor
   * file would make every entry above pass by reading an empty string - the vacuous green this
   * project treats as worse than a red.
   */
  it('is actually reading the engine surface', () => {
    expect(ENGINE_SURFACE.length).toBeGreaterThan(1000);
    expect(ENGINE_SURFACE, 'the known entry point should be declared').toContain('propose_dental_region');
  });
});
