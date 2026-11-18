import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { ItemsPage } from './ItemsPage';
import type { DetectState } from './detectState';
import type { PrintUnit } from '../state/project';
import type { ImportDiagnosis } from '../state/diagnosis';
import type { ImportRefusal } from './rowState';
import type { Vector } from '@mixo-geocore/host/core/vec3';

const mesh = { positions: new Float32Array([0, 0, 0, 10, 20, 30, 0, 20, 0]), indices: new Uint32Array([0, 1, 2]) };
const verdict = (over: Partial<ImportDiagnosis> = {}): ImportDiagnosis => ({
  triangles: 1, watertight: true, boundaryLoops: 0, longestRimMm: 0,
  nonManifoldEdges: 0, windingConsistent: true, bodyCount: 1, ...over,
});
const unit = (id: string, name: string, diagnosis?: ImportDiagnosis) =>
  ({ id, name, source: mesh, ...(diagnosis ? { diagnosis } : {}) } as PrintUnit);

/** Every unit named as an aligner: the ordinary state of a case being worked. */
const named = (units: PrintUnit[]) => new Map(units.map((unit) => [unit.id, 'reference-aligner']));
/** The same, for a render that builds its units inline. */
const namedIds = (...ids: string[]) => new Map(ids.map((id) => [id, 'reference-aligner']));

const render = (units: PrintUnit[], finished: string[] = [], refused: { name: string; refusal: ImportRefusal }[] = []) =>
  renderToStaticMarkup(<ItemsPage purposes={named(units)} onPurpose={() => {}} onPurposeAll={() => {}} onAnyModel={() => {}} units={units} refused={refused} detected={new Map()} thumbnails={new Map()} finished={finished} lang="en" onSelect={() => {}} onStart={() => {}} onRemove={() => {}} onFiles={() => {}} onBack={() => {}} onArrange={() => {}} onExport={() => {}} onRetry={() => {}} />);

/** The deck as a drop lands on it: files in hand, nobody has said what they are yet. */
const unasked = (units: PrintUnit[]) =>
  renderToStaticMarkup(<ItemsPage purposes={new Map()} onPurpose={() => {}} onPurposeAll={() => {}} onAnyModel={() => {}} units={units} refused={[]} detected={new Map()} thumbnails={new Map()} finished={[]} lang="en" onSelect={() => {}} onStart={() => {}} onRemove={() => {}} onFiles={() => {}} onBack={() => {}} onArrange={() => {}} onExport={() => {}} onRetry={() => {}} />);

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
   * THE FILES ARRIVE FIRST AND NOTHING IS ASKED ABOUT "ALL FILES" (owner, 2026-11-18: *"each file
   * has a category and type, but it ask me what i am making for all files, which is wrong"*).
   *
   * The page opens with the ROWS - no question gating the screen - and the naming happens per row.
   * The guard is on what is NOT offered while a row is unnamed: the rail and the primary act through
   * one unit's profile, so offering them earlier would be offering a press that can only run against
   * a guess. Arrange is NOT gated: moving objects so none overlaps is pure geometry.
   */
  it('shows the files at once, names them per row, and offers nothing that needs a name', () => {
    const html = unasked([unit('u-a', 'upper.stl', verdict()), unit('u-b', 'lower.stl', verdict())]);

    // No case-level question at all - it was the wrong shape for data that belongs to each file.
    expect(html).not.toContain('data-ui="items-ask"');
    expect(html).toContain('data-ui="items-row-u-a"');
    expect(html).toContain('data-ui="items-row-u-b"');
    // Every row carries its own control, and says so in the footer count.
    expect(html).toContain('data-ui="items-purpose-u-a"');
    expect(html).toContain('data-ui="items-purpose-u-b"');
    expect(html).toContain('data-ui="items-unanswered"');
    // Nothing that needs a name is offered; Arrange, which does not, stays live.
    expect(html).not.toContain('data-ui="items-start"');
    expect(html).not.toMatch(/data-ui="items-arrange"[^>]*disabled/);
  });

  /*
   * SET ALL IS THE CONVENIENCE, NOT THE QUESTION. A stage case is 10-30 models of one kind, so
   * naming each would be twenty-four presses to say one word. It is offered only when there is more
   * than one row, because on a single file it would be the same press twice over.
   */
  it('offers Set all for a case, and not for one file', () => {
    expect(unasked([unit('u-a', 'a.stl'), unit('u-b', 'b.stl')])).toContain('data-ui="items-set-all"');
    expect(unasked([unit('u-a', 'a.stl')])).not.toContain('data-ui="items-set-all"');
  });

  /*
   * ONE PRESS SETS THE CASE, A ROW CAN BE RE-ANSWERED (owner's ruling, 2026-11-18). The guard is on
   * both halves: the row control must exist once the case is answered, must show THIS row's answer
   * rather than the case's when they differ, and must not exist before the case is answered at all -
   * a select has to show one of its options, so an unanswered row would display a default nobody
   * chose, which is the entry defect this screen was built to remove.
   */
  it('shows each row its own answer, and a readable prompt on one nobody has named', () => {
    const units = [unit('u-a', 'upper.stl', verdict()), unit('u-b', 'base.stl', verdict())];

    // Two rows of the same drop, named differently - the mixed case the per-file answer exists for.
    const html = renderToStaticMarkup(<ItemsPage onPurpose={() => {}} onPurposeAll={() => {}} onAnyModel={() => {}}
      purposes={new Map([['u-a', 'reference-aligner'], ['u-b', 'reference-denture']])}
      units={units} refused={[]} detected={new Map()} thumbnails={new Map()} finished={[]} lang="en"
      onSelect={() => {}} onStart={() => {}} onRemove={() => {}} onFiles={() => {}} onBack={() => {}}
      onArrange={() => {}} onExport={() => {}} onRetry={() => {}} />);

    /* The key SAYS what it is drawing, because what it draws is a picture: the title and the
       aria-label carry the category's word, which is the only part a test (or a screen reader) can
       read. The type beside it names the profile the engine will run. */
    expect(html).toMatch(/data-ui="items-purpose-u-b-category-key"[^>]*title="Denture"/);
    expect(html).toMatch(/data-ui="items-purpose-u-a-category-key"[^>]*title="Aligner"/);
    expect(html).toMatch(/data-ui="items-purpose-u-a-type-key"[^>]*title="Generic aligner"/);
    expect(html).toMatch(/data-ui="items-purpose-u-b-type-key"[^>]*title="Generic denture"/);
    // Both named, so nothing is outstanding.
    expect(html).not.toContain('data-ui="items-unanswered"');

    /*
     * AN UNNAMED ROW GETS A READABLE PROMPT, NOT A PICTURE. The compact icon control can only draw
     * an answer that exists; the first build of it fell back to the generic cube, which is the ANY
     * MODEL art, so an unnamed row looked exactly like one named "Any model" - the silent-default
     * defect rebuilt inside its own fix.
     */
    const none = unasked(units);
    expect(none).toMatch(/data-ui="items-purpose-u-a-category"[\s\S]*?Choose…/);
    expect(none).not.toMatch(/data-ui="items-purpose-u-a-category-key"[^>]*title="Aligner"/);
    // And no type readout either: there is no profile in force until a category is chosen.
    expect(none).not.toContain('data-ui="items-purpose-u-a-type"');
  });

  it('lights the primary once the row it acts on has been named', () => {
    const html = render([unit('u-a', 'upper.stl', verdict())]);

    expect(html).toContain('data-ui="items-start"');
    expect(html).not.toMatch(/data-ui="items-arrange"[^>]*disabled/);
  });

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

  it('shows one row per file, in plate order, with its size and only a verdict worth reading', () => {
    const html = render([unit('u-a', 'upper.stl', verdict()), unit('u-b', 'lower.stl', verdict({ watertight: false, nonManifoldEdges: 7 }))]);

    expect(html.indexOf('upper.stl')).toBeLessThan(html.indexOf('lower.stl'));
    expect(html).toContain('1 triangles');
    expect(html).toContain('10 × 20 × 30 mm');
    // The sound one is SILENT and the one with a defect speaks: a worklist row earns its height by
    // having something to report, and the footer's tally counts the ones that do.
    expect(html).not.toContain('Ready to print.');
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

  /*
   * IT USED TO DROP THE PRIMARY once every row was through, and that is the assertion this replaces.
   * A case ENDS in that state, so the page's main key disappeared exactly when the operator might
   * want to open a model again - a failed print, a replaced file, supports that were wrong. On the
   * owner's ruling of 2026-11-18 a done mark informs and never blocks a redo, so the key stays and
   * offers the last row. The count still tells the truth: nothing is left to do for the first time.
   */
  it('keeps the primary when every item is through, because finished is not a lock', () => {
    const done = render([unit('a', 'a.stl')], ['a']);
    expect(done).toContain('data-ui="items-start"');
    expect(done).toContain('0 items left');
    expect(render([unit('a', 'a.stl')])).toContain('data-ui="items-start"');
  });

  /*
   * TWENTY-FOUR CARDS, which is the case this screen exists for and was laid out for four. All three
   * of these were written because the browser could not prove them: a three-cube drop detects too
   * fast to catch the progress line, and a line nobody ever sees is the defect this guards against.
   */
  describe('a case too big to read row by row', () => {
    const detecting = (states: [string, DetectState][]) => renderToStaticMarkup(
      <ItemsPage purposes={new Map([['a', 'reference-aligner'], ['b', 'reference-aligner'], ['c', 'reference-aligner']])}
        onPurpose={() => {}} onPurposeAll={() => {}} onAnyModel={() => {}} units={[unit('a', 'a.stl'), unit('b', 'b.stl'), unit('c', 'c.stl')]}
        refused={[]} detected={new Map(states)} thumbnails={new Map()} finished={[]} lang="en"
        onSelect={() => {}} onStart={() => {}} onRemove={() => {}} onFiles={() => {}} onBack={() => {}}
        onArrange={() => {}} onExport={() => {}} onRetry={() => {}} />);

    it('says how far the robot has got, instead of one Checking and the rest Waiting', () => {
      const html = detecting([['a', { kind: 'oriented', turned: false }], ['b', { kind: 'running' }], ['c', { kind: 'waiting' }]]);
      expect(html).toContain('data-ui="items-progress"');
      expect(html).toContain('Checking 2 of 3');
    });

    it('counts the rows a person must handle, and says nothing when there are none', () => {
      const needs = detecting([['a', { kind: 'no-rim' }], ['b', { kind: 'failed' }], ['c', { kind: 'oriented', turned: false }]]);
      expect(needs).toContain('2 need you');
      const clean = detecting([['a', { kind: 'oriented', turned: false }]]);
      expect(clean).not.toContain('data-ui="items-attention"');
    });

    it('puts the rows that need a person first, and leaves the rest in the order they were dropped', () => {
      const html = detecting([['a', { kind: 'oriented', turned: false }], ['b', { kind: 'failed' }], ['c', { kind: 'waiting' }]]);
      const order = [...html.matchAll(/data-ui="items-row-([a-c])"/g)].map((hit) => hit[1]);
      expect(order).toEqual(['b', 'a', 'c']);
    });

    it('offers Retry on a failed row only: no-rim is an answer, not a failure', () => {
      const html = detecting([['a', { kind: 'failed' }], ['b', { kind: 'no-rim' }], ['c', { kind: 'oriented', turned: false }]]);
      expect(html).toContain('data-ui="items-retry-a"');
      expect(html).not.toContain('data-ui="items-retry-b"');
      expect(html).not.toContain('data-ui="items-retry-c"');
    });
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
    // The good file is still there beside them - and says NOTHING about its health, because it has
    // nothing to report. Twenty-four rows reading "Ready to print." is how little is wrong said
    // twenty-four times; the footer's tally counts the ones that are not.
    expect(html).toContain('good.stl');
    expect(html).not.toContain('Ready to print.');
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
  /*
   * START SAYS WHICH ROW IT WILL OPEN. It used to open the first UNFINISHED row whatever was
   * highlighted, with the same label either way - and with the rail's buttons inert, that made rows
   * reachable only in list order: a flagged row in the middle could not be opened until every row
   * above it was finished or destroyed with Remove.
   */
  it('names the chosen row on the Start button, not "the first item"', () => {
    const units = [unit('u-a', 'first.stl', verdict()), unit('u-b', 'second.stl', verdict())];
    const asList = renderToStaticMarkup(<ItemsPage purposes={named(units)} onPurpose={() => {}} onPurposeAll={() => {}} onAnyModel={() => {}} units={units} refused={[]} detected={new Map()}
      thumbnails={new Map()} finished={[]} lang="en" onSelect={() => {}} onStart={() => {}}
      onRemove={() => {}} onFiles={() => {}} onBack={() => {}} onArrange={() => {}} onExport={() => {}} onRetry={() => {}} />);

    expect(asList).toContain('Start with the first item');
    const chosen = renderToStaticMarkup(<ItemsPage purposes={named(units)} onPurpose={() => {}} onPurposeAll={() => {}} onAnyModel={() => {}} units={units} refused={[]} detected={new Map()}
      thumbnails={new Map()} finished={[]} lang="en" selectedUnitId="u-b" onSelect={() => {}} onStart={() => {}}
      onRemove={() => {}} onFiles={() => {}} onBack={() => {}} onArrange={() => {}} onExport={() => {}} onRetry={() => {}} />);

    expect(chosen).toContain('Start this item');
    expect(chosen).not.toContain('Start with the first item');
    // A FINISHED row IS what the press means when it is the one picked out (owner's ruling,
    // 2026-11-18). This used to fall back to the next unfinished row, so choosing a done model and
    // pressing Start quietly opened someone else's.
    const finishedPick = renderToStaticMarkup(<ItemsPage purposes={named(units)} onPurpose={() => {}} onPurposeAll={() => {}} onAnyModel={() => {}} units={units} refused={[]} detected={new Map()}
      thumbnails={new Map()} finished={['u-b']} lang="en" selectedUnitId="u-b" onSelect={() => {}} onStart={() => {}}
      onRemove={() => {}} onFiles={() => {}} onBack={() => {}} onArrange={() => {}} onExport={() => {}} onRetry={() => {}} />);

    expect(finishedPick).toContain('Start this item');
    expect(finishedPick).not.toContain('Start with the first item');
  });

  /*
   * FOUND BY AUDIT (ledger F6, F7). Two defects on one span: every detect line rendered in the same
   * muted grey, so a failure read like a success and eight rows had to be read one by one; and the
   * line came from the batch's map, which is never written again - so a row whose rim the operator had
   * since drawn by hand still told them to draw it, disagreeing with the rail beside it.
   */
  it('marks a row that needs the operator differently from one that is fine', () => {
    const html = renderToStaticMarkup(<ItemsPage purposes={namedIds('u-a', 'u-b', 'u-c')} onPurpose={() => {}} onPurposeAll={() => {}} onAnyModel={() => {}}
      units={[unit('u-a', 'ok.stl', verdict()), unit('u-b', 'norim.stl', verdict()), unit('u-c', 'bad.stl', verdict())]}
      refused={[]} finished={[]} lang="en" thumbnails={new Map()}
      detected={new Map([['u-a', { kind: 'oriented', turned: true }], ['u-b', { kind: 'no-rim' }], ['u-c', { kind: 'failed' }]])}
      onSelect={() => {}} onStart={() => {}} onRemove={() => {}} onFiles={() => {}} onBack={() => {}} onArrange={() => {}} onExport={() => {}} onRetry={() => {}} />);

    const toneOf = (id: string) => html.match(new RegExp(`class="detect([^"]*)"[^>]*data-ui="items-detect-${id}"`))?.[1] ?? 'absent';
    expect(toneOf('u-a')).toBe('');
    expect(toneOf('u-b')).toBe(' detect--todo');
    expect(toneOf('u-c')).toBe(' detect--bad');
  });

  it('stops telling a row to draw a rim once the rim is drawn', () => {
    const drawn = { ...unit('u-b', 'norim.stl', verdict()), rimDraft: { anchors: [], closed: true } } as unknown as PrintUnit;
    const html = renderToStaticMarkup(<ItemsPage purposes={namedIds('u-b')} onPurpose={() => {}} onPurposeAll={() => {}} onAnyModel={() => {}} units={[drawn]} refused={[]} finished={[]}
      lang="en" thumbnails={new Map()} detected={new Map([['u-b', { kind: 'no-rim' }]])}
      onSelect={() => {}} onStart={() => {}} onRemove={() => {}} onFiles={() => {}} onBack={() => {}} onArrange={() => {}} onExport={() => {}} onRetry={() => {}} />);

    expect(html).not.toContain('Draw one to continue');
    // "Already upright." is NOT superseded by progress, so only the instructions are withdrawn.
    const upright = renderToStaticMarkup(<ItemsPage purposes={namedIds('u-b')} onPurpose={() => {}} onPurposeAll={() => {}} onAnyModel={() => {}} units={[drawn]} refused={[]} finished={[]}
      lang="en" thumbnails={new Map()} detected={new Map([['u-b', { kind: 'oriented', turned: false }]])}
      onSelect={() => {}} onStart={() => {}} onRemove={() => {}} onFiles={() => {}} onBack={() => {}} onArrange={() => {}} onExport={() => {}} onRetry={() => {}} />);

    expect(upright).toContain('Already upright');
  });

  it('shows each row its own detection result, not one answer for the list', () => {
    const html = renderToStaticMarkup(<ItemsPage purposes={namedIds('u-a', 'u-b')} onPurpose={() => {}} onPurposeAll={() => {}} onAnyModel={() => {}}
      units={[unit('u-a', 'upper.stl', verdict()), unit('u-b', 'lower.stl', verdict())]}
     
      refused={[]} detected={new Map([['u-a', { kind: 'oriented', turned: true }], ['u-b', { kind: 'no-rim' }]])}
      thumbnails={new Map()} finished={[]} lang="en" onSelect={() => {}} onStart={() => {}} onRemove={() => {}} onFiles={() => {}} onBack={() => {}} onArrange={() => {}} onExport={() => {}} onRetry={() => {}} />);


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
    const html = renderToStaticMarkup(<ItemsPage purposes={namedIds('u-a', 'u-b')} onPurpose={() => {}} onPurposeAll={() => {}} onAnyModel={() => {}}
      units={[a, b]} refused={[]} detected={new Map()}
      thumbnails={new Map([['u-a', { mesh: a.source, rotation: [0, 0, 0] as Vector, url: 'data:image/png;base64,AAA' }]])}
      finished={[]} lang="en" onSelect={() => {}} onStart={() => {}} onRemove={() => {}} onFiles={() => {}} onBack={() => {}} onArrange={() => {}} onExport={() => {}} onRetry={() => {}} />);


    expect(html).toContain('data-ui="items-shot-u-a"');
    expect(html).toContain('src="data:image/png;base64,AAA"');
    /*
     * The card with no picture yet still has its frame and NO image in it - the frame holds the
     * grid steady while the stills arrive one at a time, so a blank one means "not drawn yet"
     * rather than "nothing to see". It is no longer empty markup: every card also carries the 2D
     * canvas the live view copies frames into, hidden until that card is the one being looked at.
     */
    expect(html).toContain('data-ui="items-shot-u-b"');
    expect(html).toContain('data-ui="items-live-u-b"');
    expect(html).not.toMatch(/data-ui="items-shot-u-b"[\s\S]*?<img/);
  });

  it('gives the picture an empty alt, because the name and the sentences already say it in words', () => {
    const a = unit('u-a', 'upper.stl', verdict());
    const html = renderToStaticMarkup(<ItemsPage purposes={namedIds('u-a')} onPurpose={() => {}} onPurposeAll={() => {}} onAnyModel={() => {}}
      units={[a]} refused={[]} detected={new Map()}
      thumbnails={new Map([['u-a', { mesh: a.source, rotation: [0, 0, 0] as Vector, url: 'data:image/png;base64,AAA' }]])}
      finished={[]} lang="en" onSelect={() => {}} onStart={() => {}} onRemove={() => {}} onFiles={() => {}} onBack={() => {}} onArrange={() => {}} onExport={() => {}} onRetry={() => {}} />);


    expect(html).toContain('alt=""');
  });

  /*
   * THE RAIL IS ABOUT ONE ROW, and which row matters. The fallback is `nextItem` - where work
   * RESUMES - not the first row, so a returning operator sees the state of the model they are about
   * to pick up rather than one they already finished.
   */
  it('says what the case costs and what is left, before anyone presses anything', () => {
    /*
     * THE SURFACE, not the arithmetic - `deckBudget.test.ts` owns the numbers. What this pins is
     * that the deck SHOWS them: an out-of-memory tab is the purest silent death this app has, and
     * the one screen that knows how big a case is has to say so while it can still be acted on.
     */
    const html = render([unit('u-a', 'a.stl', verdict())]);

    expect(html).toContain('data-ui="items-budget"');
    expect(html).toContain('data-ui="items-memory"');
    expect(html).toMatch(/1 of \d+ models/);
  });

  it('marks the row Start will open as the selected one', () => {
    const html = renderToStaticMarkup(<ItemsPage purposes={namedIds('u-a', 'u-b')} onPurpose={() => {}} onPurposeAll={() => {}} onAnyModel={() => {}}
      units={[unit('u-a', 'a.stl', verdict()), unit('u-b', 'b.stl', verdict())]}
     
      refused={[]} detected={new Map()} thumbnails={new Map()} finished={[]} lang="en"
      selectedUnitId="u-b"
      onSelect={() => {}} onStart={() => {}} onRemove={() => {}} onFiles={() => {}} onBack={() => {}} onArrange={() => {}} onExport={() => {}} onRetry={() => {}} />);


    expect(rowTag(html, 'u-b')).toContain('items-row--next');
    expect(rowTag(html, 'u-a')).not.toContain('items-row--next');
  });

  it('falls back to where work resumes, not to the first row', () => {
    // u-a is finished, so the next item is u-b: that is the row the rail should be about.
    const html = renderToStaticMarkup(<ItemsPage purposes={namedIds('u-a', 'u-b')} onPurpose={() => {}} onPurposeAll={() => {}} onAnyModel={() => {}}
      units={[unit('u-a', 'a.stl', verdict()), unit('u-b', 'b.stl', verdict())]}
     
      refused={[]} detected={new Map()} thumbnails={new Map()} finished={['u-a']} lang="en"
      onSelect={() => {}} onStart={() => {}} onRemove={() => {}} onFiles={() => {}} onBack={() => {}} onArrange={() => {}} onExport={() => {}} onRetry={() => {}} />);


    expect(rowTag(html, 'u-b')).toContain('items-row--next');
    expect(rowTag(html, 'u-a')).not.toContain('items-row--next');
  });

  it('draws no rail when there is no row to be about', () => {
    const html = renderToStaticMarkup(<ItemsPage purposes={new Map()} onPurpose={() => {}} onPurposeAll={() => {}} onAnyModel={() => {}}
      units={[]} refused={[]} detected={new Map()} thumbnails={new Map()} finished={[]} lang="en"
      onSelect={() => {}} onStart={() => {}} onRemove={() => {}} onFiles={() => {}} onBack={() => {}} onArrange={() => {}} onExport={() => {}} onRetry={() => {}} />);


    expect(html).not.toContain('data-ui="tool-orient"');
  });

  /*
   * THE JOB LINE, CHECKED AGAINST ACTUAL RENDERED ROWS. It had no page-level test at all, so the
   * claim that the panel cannot disagree with the list was pinned only at the pure-function level.
   */
  it('says how many files need a look, counting the rows it is shown beside', () => {
    const holed = { ...verdict(), watertight: false, boundaryLoops: 2, longestRimMm: 9 };
    const html = renderToStaticMarkup(<ItemsPage purposes={namedIds('u-a', 'u-b')} onPurpose={() => {}} onPurposeAll={() => {}} onAnyModel={() => {}}
      units={[unit('u-a', 'a.stl', verdict()), unit('u-b', 'b.stl', holed)]}
      refused={[{ name: 'bad.stl', refusal: { kind: 'unreadable', code: 'stl-empty' } }]}
      detected={new Map()} thumbnails={new Map()} finished={[]} lang="en"
      onSelect={() => {}} onStart={() => {}} onRemove={() => {}} onFiles={() => {}} onBack={() => {}} onArrange={() => {}} onExport={() => {}} onRetry={() => {}} />);


    // One defective unit and one refused file: two need a look.
    expect(html).toContain('data-ui="items-tally"');
    expect(html).toMatch(/2 of these files need a look/);
  });

  it('stays silent about a drop where every row is sound', () => {
    const html = renderToStaticMarkup(<ItemsPage purposes={namedIds('u-a')} onPurpose={() => {}} onPurposeAll={() => {}} onAnyModel={() => {}}
      units={[unit('u-a', 'a.stl', verdict())]} refused={[]}
      detected={new Map()} thumbnails={new Map()} finished={[]} lang="en"
      onSelect={() => {}} onStart={() => {}} onRemove={() => {}} onFiles={() => {}} onBack={() => {}} onArrange={() => {}} onExport={() => {}} onRetry={() => {}} />);


    expect(html).not.toContain('data-ui="items-tally"');
  });

  /*
   * `shows Orient as busy while that row is still being checked` LEFT WITH THE RAIL (2026-11-18).
   * It asserted `tool--busy` on the rail's Orient button, and the deck has no rail any more. What a
   * row says while it is being checked is still covered, in its own words rather than a tool's:
   * `detectState.test.ts` on the chip, and the aggregate line's "Checking 3 of 24" above.
   */
  it('still marks a row on a page whose every row is finished, rather than marking none', () => {
    // `nextItem` is undefined once nothing is left, and a page of rows with none of them marked
    // reads as a fault rather than as "nothing left to do" - so it falls back to the last row.
    const html = renderToStaticMarkup(<ItemsPage purposes={namedIds('u-a', 'u-b')} onPurpose={() => {}} onPurposeAll={() => {}} onAnyModel={() => {}}
      units={[unit('u-a', 'a.stl', verdict()), unit('u-b', 'b.stl', verdict())]} refused={[]}
      detected={new Map()} thumbnails={new Map()} finished={['u-a', 'u-b']} lang="en"
      onSelect={() => {}} onStart={() => {}} onRemove={() => {}} onFiles={() => {}} onBack={() => {}} onArrange={() => {}} onExport={() => {}} onRetry={() => {}} />);


    expect(rowTag(html, 'u-b')).toContain('items-row--next');
  });
});
