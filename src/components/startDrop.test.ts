import { describe, expect, it } from 'vitest';
import { dropAction, isModelFile } from './startDrop';

const file = (name: string) => new File([new Uint8Array(1)], name);
const isProject = (name: string) => name.toLowerCase().endsWith('.mixo');
const act = (names: string[], over: { screen?: 'drop' | 'file'; chosen?: string } = {}) =>
  dropAction(names.map(file), { screen: over.screen ?? 'drop', chosen: over.chosen, isProject });

describe('what a drop on a start screen means', () => {
  it('takes EVERY model in a multi-file drop, which is the bug this replaced', () => {
    // `files.find(isStl)` made a five-file drop indistinguishable from a one-file drop.
    const action = act(['a.stl', 'b.stl', 'c.stl', 'd.stl', 'e.stl']);

    expect(action.kind).toBe('case');
    expect(action.kind === 'case' && action.files.map((item) => item.name))
      .toEqual(['a.stl', 'b.stl', 'c.stl', 'd.stl', 'e.stl']);
  });

  it('sends EVERY model drop to one destination, and never guesses a purpose', () => {
    // The entry's invariant (owner's ruling, 2026-11-18): a drop is a case and the deck takes it.
    // One file dropped on the Drop page used to become `hold`, which the screen started in the
    // aligner flow on a guessed profile - so a dropped denture was detected as an aligner with
    // nothing said. A case with no profile cannot detect at all, which is the point.
    expect(act(['one.stl'])).toMatchObject({ kind: 'case', profile: undefined });
    // Even an answer already given is not carried on THIS page: nothing on screen shows it.
    expect(act(['one.stl'], { chosen: 'reference-aligner' })).toMatchObject({ kind: 'case', profile: undefined });
  });

  it('carries the answer from the file step, where the operator gave it first', () => {
    // Choosing the purpose first buys ONE thing: the deck opens with it already filled in. It is a
    // preselect, not a second route - the destination is the same for one file and for twenty.
    for (const names of [['one.stl'], ['a.stl', 'b.stl']]) {
      expect(act(names, { screen: 'file', chosen: 'reference-aligner' }))
        .toMatchObject({ kind: 'case', profile: 'reference-aligner' });
    }
  });

  it('lets a saved project win over any model in the same drop', () => {
    // Opening a project replaces the scene, so importing alongside it would be undone immediately.
    const action = act(['case.mixo', 'extra.stl']);
    expect(action).toMatchObject({ kind: 'project' });
    expect(action.kind === 'project' && action.file.name).toBe('case.mixo');
  });

  it('separates "nothing I can read" from "nothing at all"', () => {
    // A drag carrying no files is not a refusal: saying "unsupported" to it would be a lie.
    expect(act(['notes.txt'])).toEqual({ kind: 'unsupported' });
    expect(act([])).toEqual({ kind: 'ignore' });
    // Mixed: the models are taken and the rest is left to the importer's per-file refusal (§6).
    expect(act(['notes.txt', 'a.stl', 'b.stl'])).toMatchObject({ kind: 'case' });
  });

  /*
   * THE ENTRY'S INVARIANT, WRITTEN AS A TEST BECAUSE IT WAS NOT WRITTEN AT ALL.
   *
   * ONE DESTINATION: whatever the screen, whatever was already chosen, however many models are in
   * the drop, the answer is a case and the deck takes it. Nothing branches on the COUNT.
   *
   * This is here because of how the fork survived review. Four Fable passes and an EGM round all
   * read a map that described the single-file shortcut as a feature - "the fast path, the ordinary
   * single-aligner case" - and audited against that rationale, so the shortcut was never a suspect.
   * The owner found it in one sentence. What was missing was not a reviewer: it was a stated rule
   * for a review to fail against. This matrix is that rule. A future shortcut for "just one file"
   * fails here before it reaches a screen.
   */
  it('has ONE destination: every model drop is a case, on every screen, at every count', () => {
    const screens = ['drop', 'file'] as const;
    const chosens = [undefined, 'reference-aligner', 'reference-denture'];
    const counts = [1, 2, 5, 24];

    for (const screen of screens) {
      for (const chosen of chosens) {
        for (const count of counts) {
          const names = Array.from({ length: count }, (_, index) => `m${index}.stl`);
          const action = act(names, { screen, chosen });
          expect(action.kind, `${screen} / ${String(chosen)} / ${count}`).toBe('case');
          expect(action.kind === 'case' && action.files.length, `${screen} / ${count} keeps every file`).toBe(count);
          // And the answer is carried only where the operator actually gave one.
          expect(action.kind === 'case' && action.profile, `${screen} / ${String(chosen)} profile`)
            .toBe(screen === 'drop' ? undefined : chosen);
        }
      }
    }
  });

  it('accepts .stl in any case and nothing else', () => {
    expect(isModelFile(file('A.STL'))).toBe(true);
    expect(isModelFile(file('a.stl'))).toBe(true);
    expect(isModelFile(file('a.stl.txt'))).toBe(false);
    expect(isModelFile(file('a.obj'))).toBe(false);
  });
});
