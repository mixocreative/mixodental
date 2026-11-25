import { describe, expect, it } from 'vitest';
import { idLooksDated, saveName, saveOf, saveRefusal, savesByType, stampWords } from './typeSaves.mjs';

describe('which save of a type is in force (append-only saves, newest by name)', () => {
  it('reads a dated save, an old undated one, and refuses what is not a type file', () => {
    expect(saveOf('/types/denture/soft.20261125-210430.type.json')).toEqual({ category: 'denture', id: 'soft', stamp: '20261125-210430' });
    expect(saveOf('types\\denture\\soft.type.json')).toEqual({ category: 'denture', id: 'soft', stamp: '' });
    expect(saveOf('types/denture/README.md')).toBeNull();
    expect(saveOf('types/soft.type.json')).toBeNull();
  });

  it('puts the newest save first, an undated file last, and keeps types apart', () => {
    const { types, strays } = savesByType([
      'types/denture/soft.20261120-090000.type.json',
      'types/denture/soft.type.json',
      'types/denture/soft.20261125-210430.type.json',
      'types/aligner/soft.20261101-000000.type.json',
      'types/denture/notes.txt',
    ]);
    expect(strays).toEqual(['types/denture/notes.txt']);
    expect(types.map((t) => `${t.category}/${t.id}`)).toEqual(['aligner/soft', 'denture/soft']);
    expect(types[1]!.saves.map((s) => s.stamp)).toEqual(['20261125-210430', '20261120-090000', '']);
  });

  it('deleting the newest file is the rollback: the one before it is in force', () => {
    const before = savesByType(['types/denture/soft.20261120-090000.type.json', 'types/denture/soft.20261125-210430.type.json']);
    const after = savesByType(['types/denture/soft.20261120-090000.type.json']);
    expect(before.types[0]!.saves[0]!.stamp).toBe('20261125-210430');
    expect(after.types[0]!.saves[0]!.stamp).toBe('20261120-090000');
  });

  it('refuses an id that ends like a stamp, which would make a name mean two things', () => {
    expect(idLooksDated('soft.20261125-210430')).toBe(true);
    expect(idLooksDated('soft.v2')).toBe(false);
    expect(() => saveName('soft.20261125-210430', '20261126-000000')).toThrow(/may not end like a save stamp/);
    expect(() => saveName('soft', '2026-11-26')).toThrow(/YYYYMMDD-HHMMSS/);
    expect(saveName('soft', '20261126-080102')).toBe('soft.20261126-080102.type.json');
  });

  it('a save may only follow the newest save, never hide one (owner, 2026-11-25)', () => {
    // Nothing saved yet: any save is fine.
    expect(saveRefusal({ id: 'soft', newest: null, opened: null })).toBeNull();
    // Opened the newest, saved after it: fine.
    expect(saveRefusal({ id: 'soft', newest: '20261125-210430', opened: '20261125-210430' })).toBeNull();
    // A new draft (a built-in's edit, a duplicate) under an id that is already saved: refused - open it instead.
    expect(saveRefusal({ id: 'soft', newest: '20261125-210430', opened: null })).toMatch(/already exists.*open it/);
    // Opened an older save, someone saved since: refused, naming both.
    expect(saveRefusal({ id: 'soft', newest: '20261125-210430', opened: '20261120-090000' }))
      .toMatch(/newer save \(25 Nov 2026 21:04 UTC\) than the one you opened \(20 Nov 2026 09:00 UTC\)/);
  });

  it('says a stamp in words a person reads', () => {
    expect(stampWords('20261125-210430')).toBe('25 Nov 2026 21:04 UTC');
    expect(stampWords('')).toBe('an undated save');
  });
});
