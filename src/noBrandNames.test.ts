import { describe, expect, it } from 'vitest';

const BRANDS = /chitubox|lychee|prusaslicer|uvtools/i;

/*
 * THE BOUNDARY IS WHAT THE APP SHIPS FROM. Research against other slicers was done and is fine; their
 * names are not the app's vocabulary. Dev-only material - tests' own fixtures, the batch-review
 * viewer, scratch directories - may name whatever it needs, because none of it reaches `dist/`.
 *
 * The vendored host is included: it ships too, and a name could arrive through a vendor update.
 */
const TEXTS = import.meta.glob<string>(
  ['./**/*.{ts,tsx,css,json,snap}', '../README*.md', '!./noBrandNames.test.ts'],
  { query: '?raw', import: 'default', eager: true },
);
const VENDORED = import.meta.glob<string>(
  '../vendor/mixo-geocore/{host,editing}/**/*.ts',
  { query: '?raw', import: 'default', eager: true },
);

describe('third-party slicer brand names', () => {
  it('appear nowhere in src, the locales or the READMEs', () => {
    expect(Object.keys(TEXTS).length).toBeGreaterThan(50);
    const hits = Object.entries(TEXTS).filter(([, text]) => BRANDS.test(text)).map(([path]) => path);
    expect(hits).toEqual([]);
  });

  it('appear nowhere in the vendored host either, which ships with the app', () => {
    expect(Object.keys(VENDORED).length).toBeGreaterThan(20);
    expect(Object.entries(VENDORED).filter(([, text]) => BRANDS.test(text)).map(([path]) => path)).toEqual([]);
  });

  /*
   * THE OPPOSITE FAILURE: over-applying the rule. PRINTER HARDWARE IS NOT A SLICER, so the printer
   * profiles are PERMITTED to name machines — `BRANDS` lists slicers, not manufacturers.
   *
   * Permitted, not required. An earlier version of this asserted the printers MUST be named, on the
   * reasoning that the operator picks theirs by name. The build plate was retired an hour later and
   * the picker went with it, so that assertion would have blocked the very change it was written
   * alongside. A guard should forbid what is wrong, not freeze what happened to be true the day it
   * was written.
   */
  it('permit the printer profiles to name machines, since hardware is not a slicer', () => {
    const printers = Object.entries(TEXTS).find(([path]) => path.endsWith('config/printers.json'));
    if (!printers) return; // The profiles are a dormant seam; they may be absent one day.
    expect(BRANDS.test(printers[1])).toBe(false);
  });

  /*
   * `dentalwork/fixtures/case-*` is git-ignored clinical data. A LOCAL TEST may resolve one by path -
   * it is skipped when absent and never bundled - but nothing the app ships from may mention one.
   */
  it('and no patient scan file is named in anything that ships', () => {
    const scan = /case-\d{3}\/|aligner\d{3}\.stl/;
    const shipped = Object.entries(TEXTS).filter(([path]) => !/\.test\.tsx?$/.test(path));
    expect(shipped.filter(([, text]) => scan.test(text)).map(([path]) => path)).toEqual([]);
  });
});
