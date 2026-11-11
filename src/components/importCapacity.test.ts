import { describe, expect, it } from 'vitest';

/*
 * EVERY CAPACITY RULE APPLIED TO A FILE'S CLAIMED SIZE MUST ALSO BE APPLIED TO ITS REAL ONE.
 *
 * `useImportFiles` refuses a file twice: once from the header's estimate, before anything is parsed,
 * and once from the triangles actually read. The first pass is a guess - an STL header can lie, and a
 * glTF's estimate may not be readable at all - so a rule enforced only there is a rule the real file
 * can walk past. The 2026-11-11 audit found exactly that (`cia-audit-report.md` MIXO-01): the
 * triangle and plate caps were re-asserted after the read and the MEMORY cap was not, so a mesh too
 * large for the device reached the scene whenever the header understated it.
 *
 * This is a source-reading guard rather than a hook test because the rule is about which asserts the
 * two passes share, and that is a property of the code's shape. It fires on a restructure as well as
 * on a regression: if the two passes are deliberately reorganised, re-point the two region markers
 * below rather than widening what the test accepts.
 */
const PATH = './useImportFiles.ts';
const SOURCE = import.meta.glob<string>('./useImportFiles.ts', { query: '?raw', import: 'default', eager: true })[PATH];

/** Source with comments and string bodies blanked, so brace matching cannot be fooled by either. */
function code(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, (m) => ' '.repeat(m.length))
    .replace(/(^|[^:])\/\/[^\n]*/gm, (m, lead: string) => lead + ' '.repeat(m.length - lead.length))
    .replace(/(['"`])(?:\\.|(?!\1)[\s\S])*\1/g, (m) => m[0] + ' '.repeat(m.length - 2) + m[0]);
}

/** From `opener` to the brace that closes the block it opens. */
function blockAt(source: string, opener: string): { text: string; end: number } {
  const start = source.indexOf(opener);
  expect(start, `\`${opener}\` is no longer in ${PATH} - the import flow was restructured`).toBeGreaterThanOrEqual(0);
  let depth = 0;
  for (let i = source.indexOf('{', start); i < source.length; i += 1) {
    if (source[i] === '{') depth += 1;
    else if (source[i] === '}') {
      depth -= 1;
      if (depth === 0) return { text: source.slice(start, i + 1), end: i + 1 };
    }
  }
  throw new Error(`\`${opener}\` block is never closed in ${PATH}`);
}

/** The capacity asserts named in a stretch of source, e.g. `assertMemoryCapacity`. */
const capacityAsserts = (text: string): Set<string> => new Set([...text.matchAll(/\bassert\w*Capacity\b/g)].map((m) => m[0]));

describe('the import budget is enforced on what was READ, not only on what the header claimed', () => {
  it('has a source to read (the glob key must match the file)', () => {
    expect(SOURCE, `${PATH} did not glob - fix the key, do not delete the guard`).toBeTypeOf('string');
    expect(SOURCE).toContain('assertMemoryCapacity');
  });

  it('applies every assert from the estimate pass to the counted pass as well', () => {
    const source = code(SOURCE!);
    const estimate = blockAt(source, 'if (estimate) {');
    // The counted pass is everything from the end of the estimate block to the per-file catch.
    const catchAt = source.indexOf('} catch (error) {', estimate.end);
    expect(catchAt, `the per-file catch is no longer after the estimate block in ${PATH}`).toBeGreaterThan(estimate.end);
    const counted = source.slice(estimate.end, catchAt);

    const onEstimate = capacityAsserts(estimate.text);
    const onCount = capacityAsserts(counted);
    expect(onEstimate.size, 'the estimate pass asserts nothing - that is a different bug').toBeGreaterThan(0);
    const missing = [...onEstimate].filter((name) => !onCount.has(name)).sort();
    expect(missing, `${missing.join(', ')} runs on the header's estimate but never on the triangles actually read`).toEqual([]);
  });

  it('measures the memory cap against the FILE, never the drop\'s running total', () => {
    // `assertMemoryCapacity(fileName, triangles, …)` is per file (host/core/budget.ts): handing it
    // `adding` - the triangles of every file read so far in this drop - would refuse a legal file
    // because an earlier one was large. The plate cap is the one that is cumulative, by design.
    const source = code(SOURCE!);
    const call = /assertMemoryCapacity\(\s*[^,]+,\s*([^,]+),/g;
    const args = [...source.matchAll(call)].map((m) => m[1]!.trim());
    expect(args.length, 'no assertMemoryCapacity call found').toBeGreaterThan(0);
    expect(args, 'assertMemoryCapacity was handed the cumulative `adding`').not.toContain('adding');
  });
});
