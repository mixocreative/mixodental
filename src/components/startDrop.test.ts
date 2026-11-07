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

    expect(action.kind).toBe('many');
    expect(action.kind === 'many' && action.files.map((item) => item.name))
      .toEqual(['a.stl', 'b.stl', 'c.stl', 'd.stl', 'e.stl']);
  });

  it('keeps one model on the single-file path, because the dental flow takes one aligner', () => {
    expect(act(['one.stl'])).toMatchObject({ kind: 'hold' });
    expect(act(['one.stl'], { screen: 'file', chosen: 'reference-aligner' }))
      .toMatchObject({ kind: 'start', profile: 'reference-aligner' });
    // On the file screen with no type chosen there is nothing to start, so it is still held.
    expect(act(['one.stl'], { screen: 'file' })).toMatchObject({ kind: 'hold' });
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
    expect(act(['notes.txt', 'a.stl', 'b.stl'])).toMatchObject({ kind: 'many' });
  });

  it('accepts .stl in any case and nothing else', () => {
    expect(isModelFile(file('A.STL'))).toBe(true);
    expect(isModelFile(file('a.stl'))).toBe(true);
    expect(isModelFile(file('a.stl.txt'))).toBe(false);
    expect(isModelFile(file('a.obj'))).toBe(false);
  });
});
