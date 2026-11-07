import { describe, expect, it } from 'vitest';
import { ROW_STATES, type RowState } from './rowState';
import { rowIsReachable, rowSentence } from './rowText';
import { setLanguage, translateMessage } from '../i18n';
import { ja } from '../locales/ja';
import { zhHant } from '../locales/zh-Hant';

const say = (row: RowState) => {
  const message = rowSentence(row);
  return message ? translateMessage(message) : undefined;
};

describe('what a row says', () => {
  it('says only what is true, and never offers a fix this release cannot do', () => {
    expect(say({ state: 'clean' })).toBe('Ready to print.');
    // Repair is cut, so no defect sentence tells the operator to fix anything.
    for (const row of [
      { state: 'holes', loops: 2, longestMm: 0 },
      { state: 'malformed', nonManifoldEdges: 5547, windingConsistent: true },
    ] as RowState[]) {
      expect(say(row)).toContain('It can still be printed, but check the result.');
      expect(say(row)).not.toMatch(/repair|fix/i);
    }
  });

  /*
   * THE CASE THE WRITTEN SPEC GOT WRONG. `malformed` has two causes, and a file whose only fault is
   * inverted winding reports `nonManifoldEdges: 0`. The single sentence the plan specified would have
   * read "Has 0 edges shared by more than two faces." - absurd, and about the wrong defect.
   */
  it('tells the two causes of malformed apart', () => {
    expect(say({ state: 'malformed', nonManifoldEdges: 3, windingConsistent: true }))
      .toBe('Has 3 edges shared by more than two faces. It can still be printed, but check the result.');
    expect(say({ state: 'malformed', nonManifoldEdges: 0, windingConsistent: false }))
      .toBe('Some faces point inwards. It can still be printed, but check the result.');
    expect(say({ state: 'malformed', nonManifoldEdges: 0, windingConsistent: false })).not.toContain('0');
  });

  it('counts in singular and plural', () => {
    expect(say({ state: 'holes', loops: 1, longestMm: 4 })).toContain('Has one open edge loop.');
    expect(say({ state: 'holes', loops: 3, longestMm: 4 })).toContain('Has 3 open edge loops.');
    expect(say({ state: 'malformed', nonManifoldEdges: 1, windingConsistent: true }))
      .toContain('Has one edge shared by more than two faces.');
  });

  it('gives each capacity limit its own sentence, because the file is fine and does not fit', () => {
    const limits = (['triangles', 'memory', 'plate'] as const).map((limit) => say({ state: 'too-big', limit }));
    expect(new Set(limits).size).toBe(3);
    for (const text of limits) expect(text).toBeTruthy();
    expect(say({ state: 'unreadable', code: 'stl-empty' })).toBe('Could not be read.');
  });

  it('has exactly the five reachable states, and the four repair states have none', () => {
    const reachable = ROW_STATES.filter((state) => {
      const row = { state, loops: 1, longestMm: 0, nonManifoldEdges: 1, windingConsistent: true, code: 'x', limit: 'plate', step: 'weld', reasons: [] } as unknown as RowState;
      return rowIsReachable(row);
    });
    expect(reachable).toEqual(['unreadable', 'too-big', 'clean', 'holes', 'malformed']);
    // When repair returns, each of these needs its own sentence; until then they cannot occur.
    expect(ROW_STATES.length - reachable.length).toBe(4);
  });

  it('translates every sentence into Chinese and Japanese', () => {
    // The i18n guard scrapes `t('...')` literals and cannot see these, which are built as Messages.
    const keys = new Set<string>();
    for (const row of [
      { state: 'clean' }, { state: 'unreadable', code: 'x' },
      { state: 'too-big', limit: 'triangles' }, { state: 'too-big', limit: 'memory' }, { state: 'too-big', limit: 'plate' },
      { state: 'holes', loops: 1, longestMm: 0 }, { state: 'holes', loops: 2, longestMm: 0 },
      { state: 'malformed', nonManifoldEdges: 1, windingConsistent: true },
      { state: 'malformed', nonManifoldEdges: 2, windingConsistent: true },
      { state: 'malformed', nonManifoldEdges: 0, windingConsistent: false },
    ] as RowState[]) {
      const message = rowSentence(row)!;
      keys.add(message.key);
      if (message.other) keys.add(message.other);
      if (message.then) keys.add(message.then.key);
    }
    // 11, not 10: `holes` and `malformed` each contribute a singular AND a plural key, and the
    // shared "check the result" advice is its own key. An exact number here is what notices a key
    // that stops being reachable, which is how a translated string would quietly go stale.
    expect(keys.size).toBe(11);
    for (const [lang, dictionary] of [['ja', ja], ['zh-Hant', zhHant]] as const) {
      expect([...keys].filter((key) => !(key in dictionary)), lang).toEqual([]);
    }
  });

  it('reads in Taiwan Chinese and Japanese', () => {
    setLanguage('zh-Hant');
    expect(say({ state: 'clean' })).toBe('可列印。');
    setLanguage('ja');
    expect(say({ state: 'clean' })).toBe('プリント準備完了。');
    setLanguage('en');
  });
});
