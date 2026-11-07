import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { ItemsPage } from './ItemsPage';
import type { PrintUnit } from '../state/project';
import type { ImportDiagnosis } from '../state/diagnosis';

const mesh = { positions: new Float32Array([0, 0, 0, 10, 20, 30, 0, 20, 0]), indices: new Uint32Array([0, 1, 2]) };
const verdict = (over: Partial<ImportDiagnosis> = {}): ImportDiagnosis => ({
  triangles: 1, watertight: true, boundaryLoops: 0, longestRimMm: 0,
  nonManifoldEdges: 0, windingConsistent: true, bodyCount: 1, ...over,
});
const unit = (id: string, name: string, diagnosis?: ImportDiagnosis) =>
  ({ id, name, source: mesh, ...(diagnosis ? { diagnosis } : {}) } as PrintUnit);

const render = (units: PrintUnit[], finished: string[] = []) =>
  renderToStaticMarkup(<ItemsPage units={units} finished={finished} lang="en" onStart={() => {}} onRemove={() => {}} onFiles={() => {}} onBack={() => {}} />);

describe('the Items page', () => {
  /*
   * THE NAMING RULE, and it is not a style point. `src/progress/README.md` records a walk check that
   * looked at the FIRST of a set of identically-named elements and reported the rest as missing - a
   * false gap that cost a round of investigation. An index-keyed name would be worse still: removing
   * one row re-points every later one, so a check would silently follow a different row.
   */
  it('names every row part for its unit, never for its position', () => {
    const html = render([unit('u-a', 'upper.stl', verdict()), unit('u-b', 'lower.stl', verdict())]);

    for (const id of ['u-a', 'u-b']) {
      for (const part of ['row', 'preview', 'verdict', 'remove']) {
        expect(html, `${part}-${id}`).toContain(`data-ui="items-${part}-${id}"`);
      }
    }
    // No name carries an index, so no name moves when a row is removed.
    expect(html).not.toMatch(/data-ui="items-[a-z]+-\d"/);
    // Every data-ui on the page is unique.
    const names = [...html.matchAll(/data-ui="([^"]+)"/g)].map((match) => match[1]);
    expect(new Set(names).size).toBe(names.length);
  });

  it('shows one row per file, in plate order, with its size and verdict', () => {
    const html = render([unit('u-a', 'upper.stl', verdict()), unit('u-b', 'lower.stl', verdict({ watertight: false, nonManifoldEdges: 7 }))]);

    expect(html.indexOf('upper.stl')).toBeLessThan(html.indexOf('lower.stl'));
    expect(html).toContain('1 triangles');
    expect(html).toContain('10 × 20 × 30 mm');
    expect(html).toContain('Ready to print.');
    expect(html).toContain('Has 7 edges shared by more than two faces.');
  });

  it('says nothing about health when no verdict was stored, rather than guessing', () => {
    // A unit that never went through the import worker. The size is still true; the health is unknown.
    const html = render([unit('u-a', 'old.stl')]);

    expect(html).toContain('data-ui="items-verdict-u-a"');
    expect(html).toContain('10 × 20 × 30 mm');
    expect(html).not.toContain('Ready to print.');
  });

  it('counts what is left from the same rule the press follows', () => {
    expect(render([unit('a', 'a.stl'), unit('b', 'b.stl'), unit('c', 'c.stl')])).toContain('3 items left');
    expect(render([unit('a', 'a.stl'), unit('b', 'b.stl')], ['a'])).toContain('1 item left');
  });

  it('drops the primary when every item is through, so the page cannot offer a next that does not exist', () => {
    const done = render([unit('a', 'a.stl')], ['a']);
    expect(done).not.toContain('data-ui="items-start"');
    expect(done).toContain('0 items left');
    expect(render([unit('a', 'a.stl')])).toContain('data-ui="items-start"');
  });

  it('marks a finished row without removing it', () => {
    const html = render([unit('a', 'a.stl', verdict()), unit('b', 'b.stl', verdict())], ['a']);
    expect(html).toContain('items-row items-row--done');
    expect(html).toContain('a.stl');
  });

  /*
   * A PAGE WITH NO WAY OUT IS A TRAP. Every other start screen has Back; this one shipped without it,
   * and a drop of entirely unreadable files landed here EMPTY - the auto-escape only fires when the
   * unit count falls from above zero, which it never had.
   */
  it('always offers a way back, even with no rows at all', () => {
    for (const rows of [[], [unit('a', 'a.stl')]]) {
      const html = render(rows);
      expect(html, `${rows.length} rows`).toContain('data-ui="items-back"');
    }
  });

  it('keeps Remove a danger outline, never a filled red', () => {
    // House rule: a destructive action is an outline. noColourLiterals covers the CSS; this covers the class.
    expect(render([unit('a', 'a.stl')])).toContain('class="danger remove"');
  });
});
