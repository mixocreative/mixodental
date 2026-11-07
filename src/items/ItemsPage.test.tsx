import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { ItemsPage } from './ItemsPage';
import type { PrintUnit } from '../state/project';
import type { ImportDiagnosis } from '../state/diagnosis';
import type { ImportRefusal } from './rowState';
import type { DetectState } from './detectState';

const mesh = { positions: new Float32Array([0, 0, 0, 10, 20, 30, 0, 20, 0]), indices: new Uint32Array([0, 1, 2]) };
const verdict = (over: Partial<ImportDiagnosis> = {}): ImportDiagnosis => ({
  triangles: 1, watertight: true, boundaryLoops: 0, longestRimMm: 0,
  nonManifoldEdges: 0, windingConsistent: true, bodyCount: 1, ...over,
});
const unit = (id: string, name: string, diagnosis?: ImportDiagnosis) =>
  ({ id, name, source: mesh, ...(diagnosis ? { diagnosis } : {}) } as PrintUnit);

const render = (units: PrintUnit[], finished: string[] = [], refused: { name: string; refusal: ImportRefusal }[] = []) =>
  renderToStaticMarkup(<ItemsPage units={units} refused={refused} detected={new Map()} thumbnails={new Map()} finished={finished} lang="en" onSelect={() => {}} onStart={() => {}} onRemove={() => {}} onFiles={() => {}} onBack={() => {}} />);

/*
 * The <li> tag for one row, so a class can be checked against the RIGHT row. It is a helper because
 * the obvious regex - `data-ui` followed by the class - silently never matches: React renders
 * `class` BEFORE `data-ui`, so the assertion passed whatever the code did. Caught by mutating the
 * code and watching the test stay green.
 */
function rowTag(html: string, unitId: string): string {
  const tags = [...html.matchAll(/<li\b[^>]*>/g)].map((match) => match[0]);
  return tags.find((tag) => tag.includes(`data-ui="items-row-${unitId}"`)) ?? '';
}

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

  /*
   * A REFUSED FILE IS A ROW. Before this it was reported on the status line, which can say only one
   * thing - so a drop of eight with two bad files named one and lost the other. `verdictOfRefusal`
   * had no production caller at all, which is why two of the five sentences were text for rows that
   * could not exist.
   */
  it('shows a row for a file that never became a unit, naming it and why', () => {
    const html = render([unit('u-a', 'good.stl', verdict())], [], [
      { name: 'broken.stl', refusal: { kind: 'unreadable', code: 'no-mesh' } },
      { name: 'huge.stl', refusal: { kind: 'too-big', limit: 'memory' } },
    ]);

    expect(html).toContain('broken.stl');
    expect(html).toContain('Could not be read.');
    expect(html).toContain('huge.stl');
    expect(html).toContain('Too large to hold in memory.');
    // The good file is still there beside them.
    expect(html).toContain('good.stl');
    expect(html).toContain('Ready to print.');
  });

  it('gives a refused row no Remove, because there is no unit to remove', () => {
    const html = render([], [], [{ name: 'broken.stl', refusal: { kind: 'unreadable', code: 'no-mesh' } }]);
    expect(html).toContain('items-row--refused');
    expect(html).not.toContain('items-remove-');
    // And the page still offers its way out, with no units at all.
    expect(html).toContain('data-ui="items-back"');
  });

  /*
   * EACH ROW SHOWS ITS OWN ORIENTATION. Upper and lower arches in one drop orient differently, so a
   * single answer imposed on the list would be wrong for half of it - and spotting that row 5 came
   * out unlike rows 1-8 is the thing a list can do that eight sequential wizards cannot.
   */
  it('shows each row its own detection result, not one answer for the list', () => {
    const html = renderToStaticMarkup(<ItemsPage
      units={[unit('u-a', 'upper.stl', verdict()), unit('u-b', 'lower.stl', verdict())]}
      refused={[]} detected={new Map([['u-a', { kind: 'oriented', turned: true }], ['u-b', { kind: 'no-rim' }]])}
      thumbnails={new Map()} finished={[]} lang="en" onSelect={() => {}} onStart={() => {}} onRemove={() => {}} onFiles={() => {}} onBack={() => {}} />);

    expect(html).toContain('data-ui="items-detect-u-a"');
    expect(html).toContain('Turned upright.');
    expect(html).toContain('data-ui="items-detect-u-b"');
    expect(html).toContain('No rim found. Draw one to continue.');
  });

  it('says nothing about a row the batch has not reached', () => {
    const html = render([unit('u-a', 'a.stl', verdict())]);
    // The element is there - its name is stable - but it carries no claim yet.
    expect(html).toContain('data-ui="items-detect-u-a"');
    expect(html).not.toMatch(/upright|No rim|Checking the orientation/);
  });

  it('keeps Remove a danger outline, never a filled red', () => {
    // House rule: a destructive action is an outline. noColourLiterals covers the CSS; this covers the class.
    expect(render([unit('a', 'a.stl')])).toContain('class="danger remove"');
  });

  /*
   * THE ROW PICTURE. It arrives separately from the row (`useThumbnails` draws one at a time), so the
   * two states have to be distinguishable: a frame with a picture in it, and a frame with none yet.
   * A row that only appeared once its picture did would make the list jump as a drop fills in.
   */
  it('puts a drawn picture on its own row and leaves the others framed but empty', () => {
    const a = unit('u-a', 'upper.stl', verdict());
    const b = unit('u-b', 'lower.stl', verdict());
    const html = renderToStaticMarkup(<ItemsPage
      units={[a, b]} refused={[]} detected={new Map()}
      thumbnails={new Map([['u-a', { mesh: a.source, url: 'data:image/png;base64,AAA' }]])}
      finished={[]} lang="en" onSelect={() => {}} onStart={() => {}} onRemove={() => {}} onFiles={() => {}} onBack={() => {}} />);

    expect(html).toContain('data-ui="items-shot-u-a"');
    expect(html).toContain('src="data:image/png;base64,AAA"');
    // The row with no picture yet still has its frame, and nothing inside it.
    expect(html).toMatch(/data-ui="items-shot-u-b"><\/span>/);
  });

  it('gives the picture an empty alt, because the name and the sentences already say it in words', () => {
    const a = unit('u-a', 'upper.stl', verdict());
    const html = renderToStaticMarkup(<ItemsPage
      units={[a]} refused={[]} detected={new Map()}
      thumbnails={new Map([['u-a', { mesh: a.source, url: 'data:image/png;base64,AAA' }]])}
      finished={[]} lang="en" onSelect={() => {}} onStart={() => {}} onRemove={() => {}} onFiles={() => {}} onBack={() => {}} />);

    expect(html).toContain('alt=""');
  });

  /*
   * THE RAIL IS ABOUT ONE ROW, and which row matters. The fallback is `nextItem` - where work
   * RESUMES - not the first row, so a returning operator sees the state of the model they are about
   * to pick up rather than one they already finished.
   */
  it('shows the rail for the selected row', () => {
    const html = renderToStaticMarkup(<ItemsPage
      units={[unit('u-a', 'a.stl', verdict()), unit('u-b', 'b.stl', verdict())]}
      refused={[]} detected={new Map()} thumbnails={new Map()} finished={[]} lang="en"
      selectedUnitId="u-b"
      onSelect={() => {}} onStart={() => {}} onRemove={() => {}} onFiles={() => {}} onBack={() => {}} />);

    expect(html).toContain('data-ui="tool-orient"');
    expect(rowTag(html, 'u-b')).toContain('items-row--on-rail');
    expect(rowTag(html, 'u-a')).not.toContain('items-row--on-rail');
  });

  it('falls back to where work resumes, not to the first row', () => {
    // u-a is finished, so the next item is u-b: that is the row the rail should be about.
    const html = renderToStaticMarkup(<ItemsPage
      units={[unit('u-a', 'a.stl', verdict()), unit('u-b', 'b.stl', verdict())]}
      refused={[]} detected={new Map()} thumbnails={new Map()} finished={['u-a']} lang="en"
      onSelect={() => {}} onStart={() => {}} onRemove={() => {}} onFiles={() => {}} onBack={() => {}} />);

    expect(rowTag(html, 'u-b')).toContain('items-row--on-rail');
    expect(rowTag(html, 'u-a')).not.toContain('items-row--on-rail');
  });

  it('draws no rail when there is no row to be about', () => {
    const html = renderToStaticMarkup(<ItemsPage
      units={[]} refused={[]} detected={new Map()} thumbnails={new Map()} finished={[]} lang="en"
      onSelect={() => {}} onStart={() => {}} onRemove={() => {}} onFiles={() => {}} onBack={() => {}} />);

    expect(html).not.toContain('data-ui="tool-orient"');
  });

  /*
   * THE JOB LINE, CHECKED AGAINST ACTUAL RENDERED ROWS. It had no page-level test at all, so the
   * claim that the panel cannot disagree with the list was pinned only at the pure-function level.
   */
  it('says how many files need a look, counting the rows it is shown beside', () => {
    const holed = { ...verdict(), watertight: false, boundaryLoops: 2, longestRimMm: 9 };
    const html = renderToStaticMarkup(<ItemsPage
      units={[unit('u-a', 'a.stl', verdict()), unit('u-b', 'b.stl', holed)]}
      refused={[{ name: 'bad.stl', refusal: { kind: 'unreadable', code: 'stl-empty' } }]}
      detected={new Map()} thumbnails={new Map()} finished={[]} lang="en"
      onSelect={() => {}} onStart={() => {}} onRemove={() => {}} onFiles={() => {}} onBack={() => {}} />);

    // One defective unit and one refused file: two need a look.
    expect(html).toContain('data-ui="items-tally"');
    expect(html).toMatch(/2 of these files need a look/);
  });

  it('stays silent about a drop where every row is sound', () => {
    const html = renderToStaticMarkup(<ItemsPage
      units={[unit('u-a', 'a.stl', verdict())]} refused={[]}
      detected={new Map()} thumbnails={new Map()} finished={[]} lang="en"
      onSelect={() => {}} onStart={() => {}} onRemove={() => {}} onFiles={() => {}} onBack={() => {}} />);

    expect(html).not.toContain('data-ui="items-tally"');
  });

  it('shows Orient as busy while that row is still being checked', () => {
    const html = renderToStaticMarkup(<ItemsPage
      units={[unit('u-a', 'a.stl', verdict())]} refused={[]}
      detected={new Map([['u-a', { kind: 'running' }]])} thumbnails={new Map()} finished={[]} lang="en"
      onSelect={() => {}} onStart={() => {}} onRemove={() => {}} onFiles={() => {}} onBack={() => {}} />);

    expect(html).toMatch(/data-ui="tool-orient"[^>]*tool--busy/);
  });

  it('keeps the rail on a page whose every row is finished, rather than vanishing', () => {
    // `nextItem` is undefined once nothing is left, and a rail that disappears from a page that
    // still has rows reads as a fault rather than as "nothing left to do".
    const html = renderToStaticMarkup(<ItemsPage
      units={[unit('u-a', 'a.stl', verdict()), unit('u-b', 'b.stl', verdict())]} refused={[]}
      detected={new Map()} thumbnails={new Map()} finished={['u-a', 'u-b']} lang="en"
      onSelect={() => {}} onStart={() => {}} onRemove={() => {}} onFiles={() => {}} onBack={() => {}} />);

    expect(html).toContain('data-ui="tool-orient"');
    expect(rowTag(html, 'u-b')).toContain('items-row--on-rail');
  });
});
