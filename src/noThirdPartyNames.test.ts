import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/*
 * THE SHIPPED APP NAMES NO SLICER. Research against other slicers is fine and was done; their names
 * are not the app's vocabulary, and a licence audit found them spread through preset names, tooltips
 * and the Japanese locale before they were cleaned out. Nothing has stopped them coming back since.
 *
 * "Detachable at launch, never referred to": dev-only material may name whatever it needs, and the
 * boundary is what the app SHIPS from. So this scrapes `src/` and the vendored host, and excludes
 * tests, the batch-review viewer and scratch directories - none of which reach `dist/`.
 */

const SLICERS = ['Chitubox', 'Lychee', 'PrusaSlicer', 'Bambu Studio', 'OrcaSlicer', 'PreForm'];

/**
 * PRINTER HARDWARE IS NOT A SLICER, and this distinction is the whole reason the rule needs a list
 * rather than a blanket ban. A plate size belongs to a named machine and the operator picks theirs by
 * name, so `src/config/printers.json` must say "Form 4" and cannot be neutralised without leaving the
 * printer picker nameless. A comment citing a printer's raft height as the origin of a default is the
 * same kind of reference: nominative, factual, about hardware we target rather than software we
 * compete with.
 */
const HARDWARE_ALLOWED = ['src/config/printers.json', 'host/supports/generateRules.ts'];

const SHIPPED = {
  ...import.meta.glob<string>('./**/*.{ts,tsx,css,json}', { query: '?raw', import: 'default', eager: true }),
  ...import.meta.glob<string>('../vendor/mixo-geocore/{host,editing}/**/*.ts', { query: '?raw', import: 'default', eager: true }),
};

const shippedFiles = Object.entries(SHIPPED).filter(([path]) =>
  !/\.test\.tsx?$/.test(path) && !path.includes('/kit/') && !HARDWARE_ALLOWED.some((allowed) => path.endsWith(allowed)));

describe('the shipped app names no third-party slicer', () => {
  it('scrapes a real set of files, so a passing result means something', () => {
    // Without this, a broken glob would make every assertion below vacuously true.
    expect(shippedFiles.length).toBeGreaterThan(200);
  });

  it('carries no slicer product name anywhere it ships from', () => {
    const found: string[] = [];
    for (const [path, text] of shippedFiles) {
      for (const name of SLICERS) if (text.includes(name)) found.push(`${name} in ${path}`);
    }
    expect(found).toEqual([]);
  });

  it('keeps naming the printers, because the operator picks theirs by name', () => {
    // The opposite failure: over-applying the rule and leaving the printer picker nameless.
    const printers = readFileSync('src/config/printers.json', 'utf8');
    expect(printers).toContain('Form 4');
    expect(JSON.parse(printers).printers.length).toBeGreaterThan(1);
  });

  it('names no patient scan file in anything that ships', () => {
    // `dentalwork/fixtures/case-*` is clinical data. A test may resolve one by path (it is skipped
    // when absent and never bundled); the app must never mention one.
    const found = shippedFiles.filter(([, text]) => /case-\d{3}\/|aligner\d{3}\.stl/.test(text));
    expect(found.map(([path]) => path)).toEqual([]);
  });
});
