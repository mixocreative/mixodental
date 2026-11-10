import { describe, expect, it } from 'vitest';
import { ICON_CATALOGUE } from './iconCatalogue';

/*
 * The catalogue is the list the style book renders, so it has to BE the folder. Both directions matter and
 * only one of them is obvious: an entry with no file draws nothing, which a designer notices, while a file
 * with no entry is simply absent from the style book - invisible, and exactly how the README's prose table
 * came to be missing three icons that had shipped.
 */
const FILES = Object.keys(import.meta.glob('./assets/icons/*.svg', { eager: true }))
  .map((path) => path.replace(/.*\//, '').replace(/\.svg$/, ''));

describe('the icon catalogue', () => {
  it('has an entry for every file in the folder', () => {
    const listed = new Set(ICON_CATALOGUE.map((entry) => entry.name));
    expect(FILES.filter((name) => !listed.has(name))).toEqual([]);
  });

  it('has a file for every entry', () => {
    const onDisk = new Set(FILES);
    expect(ICON_CATALOGUE.filter((entry) => !onDisk.has(entry.name)).map((entry) => entry.name)).toEqual([]);
  });

  it('names each icon once', () => {
    const names = ICON_CATALOGUE.map((entry) => entry.name);
    expect(names.length).toBe(new Set(names).size);
  });

  it('says where every icon appears', () => {
    expect(ICON_CATALOGUE.filter((entry) => entry.where.trim().length < 12).map((entry) => entry.name)).toEqual([]);
  });
});
