import { describe, expect, it } from 'vitest';
import { ICON_CATALOGUE } from './iconCatalogue';

/*
 * The catalogue is the list the style book renders, so it has to BE the folder. Both directions matter and
 * only one of them is obvious: an entry with no file draws nothing, which a designer notices, while a file
 * with no entry is simply absent from the style book - invisible, and exactly how the README's prose table
 * came to be missing three icons that had shipped.
 */
/*
 * BOTH FOLDERS, because the catalogue covers both sets and the slot says which: `key` is the coloured
 * art, everything else is the one-ink icons. Checking only `assets/icons/` would have reported the three
 * item types as missing the moment they moved, which is the catalogue being wrong about the thing it
 * exists to be right about.
 */
const named = (dir: string) => Object.keys(import.meta.glob('./assets/*/*.svg', { eager: true }))
  .filter((path) => path.includes(`/${dir}/`))
  .map((path) => path.replace(/.*\//, '').replace(/\.svg$/, ''));
const ICON_FILES = named('icons');
const ART_FILES = named('art');
const FILES = [...ICON_FILES, ...ART_FILES];
const folderOf = (slot: string) => (slot === 'key' ? ART_FILES : ICON_FILES);

describe('the icon catalogue', () => {
  it('has an entry for every file in the folder', () => {
    const listed = new Set(ICON_CATALOGUE.map((entry) => entry.name));
    expect(FILES.filter((name) => !listed.has(name))).toEqual([]);
  });

  it('has a file for every entry, in the folder its slot says', () => {
    const wrong = ICON_CATALOGUE.filter((entry) => !folderOf(entry.slot).includes(entry.name)).map((entry) => entry.name);
    expect(wrong).toEqual([]);
  });

  it('names each icon once', () => {
    const names = ICON_CATALOGUE.map((entry) => entry.name);
    expect(names.length).toBe(new Set(names).size);
  });

  it('says where every icon appears', () => {
    expect(ICON_CATALOGUE.filter((entry) => entry.where.trim().length < 12).map((entry) => entry.name)).toEqual([]);
  });
});
