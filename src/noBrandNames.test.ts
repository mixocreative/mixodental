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
   * THE OPPOSITE FAILURE, and it needs guarding as much as the first. PRINTER HARDWARE IS NOT A
   * SLICER: a plate size belongs to a named machine and the operator picks theirs by name, so the
   * printer list must keep naming them. Over-applying the rule would leave the picker nameless, which
   * is why `BRANDS` lists slicers and not manufacturers.
   */
  it('still name the printers, because the operator picks theirs by name', () => {
    const printers = Object.entries(TEXTS).find(([path]) => path.endsWith('config/printers.json'));
    expect(printers, 'src/config/printers.json').toBeDefined();
    expect(printers![1]).toContain('Form 4');
    expect(BRANDS.test(printers![1])).toBe(false);
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
