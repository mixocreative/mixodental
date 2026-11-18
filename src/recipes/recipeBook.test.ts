// Copyright (c) Mixo Creative.

import { describe, expect, it } from 'vitest';
import { STORAGE_KEY, loadRecipes, parseRecipeBook, saveRecipes } from './recipeBook';
import { TYPE_DEFAULT_ID } from './supportRecipe';
import type { RecipeBook } from './recipeBook';

/**
 * THE OPERATOR'S LIST, ON THEIR OWN DEVICE - and the two ways this feature could lose it.
 *
 * There is no server, so `localStorage` is the only copy there will ever be. Every test below is
 * about one of the two silent deaths the module's header names: a selection quietly becoming "the
 * defaults", and a write that destroys a list this version could not read.
 */

/** A storage that can be made to throw, which is what a private window and a blocked origin do. */
const fakeStorage = (initial?: string, broken: 'none' | 'read' | 'write' = 'none') => {
  let value = initial ?? null;
  return {
    getItem: () => { if (broken === 'read') throw new Error('blocked'); return value; },
    setItem: (_key: string, next: string) => { if (broken === 'write') throw new Error('quota'); value = next; },
    read: () => value,
  };
};

const book = (over: Partial<RecipeBook> = {}): RecipeBook => ({
  version: 1,
  defaultId: TYPE_DEFAULT_ID,
  recipes: [
    { id: TYPE_DEFAULT_ID, name: 'Type default', settings: {}, structure: { treeEnabled: false, bracesEnabled: false } },
    { id: 'r1', name: 'Thin', settings: { pillarDiameter: 1.1 }, structure: { treeEnabled: true, bracesEnabled: false } },
  ],
  ...over,
});

describe('reading the book', () => {
  it('starts every device with Type default and nothing else', () => {
    expect(parseRecipeBook(null).book.recipes.map((recipe) => recipe.id)).toEqual([TYPE_DEFAULT_ID]);
    expect(parseRecipeBook(null).problem).toBeUndefined();
  });

  it('round-trips a saved book', () => {
    const store = fakeStorage();
    saveRecipes(book(), store);

    const read = loadRecipes(store);
    expect(read.problem).toBeUndefined();
    expect(read.book.recipes.map((recipe) => recipe.name)).toEqual(['Type default', 'Thin']);
    expect(read.book.recipes[1]!.settings.pillarDiameter).toBe(1.1);
  });

  /*
   * A BROKEN BOOK IS NOT AN EMPTY BOOK, and this is the first of the two deaths. An operator whose
   * list failed to parse and who is silently handed "the defaults" generates supports they did not
   * choose, on a model they are about to print. The problem travels with the book so the UI can say
   * so and offer only Type default.
   */
  it('says when it could not read, rather than looking like a new device', () => {
    expect(parseRecipeBook('{not json').problem).toBe('unreadable');
    expect(parseRecipeBook('{"recipes":[]}').problem).toBe('unreadable');
    expect(parseRecipeBook('["a"]').problem).toBe('unreadable');
    expect(loadRecipes(fakeStorage(undefined, 'read')).problem).toBe('unreadable');
  });

  it('treats a book from a newer version as read-only, not as rubbish', () => {
    expect(parseRecipeBook('{"version":2,"defaultId":"x","recipes":[]}').problem).toBe('newer');
  });

  it('drops a row it cannot use and keeps the rest, rather than failing the whole book', () => {
    const text = JSON.stringify({ version: 1, defaultId: 'r1', recipes: [{ id: 'r1', name: 'Thin', settings: { pillarDiameter: 1.1 } }, { name: 'no id' }] });

    expect(parseRecipeBook(text).book.recipes.map((recipe) => recipe.id)).toEqual([TYPE_DEFAULT_ID, 'r1']);
  });

  it('drops a hand-edited value of the wrong type', () => {
    const text = JSON.stringify({ version: 1, recipes: [{ id: 'r1', name: 'Thin', settings: { pillarDiameter: {}, neckLength: 4 } }] });
    const stored = parseRecipeBook(text).book.recipes[1]!;

    expect(stored.settings).not.toHaveProperty('pillarDiameter');
    expect(stored.settings.neckLength).toBe(4);
  });

  it('falls back to Type default when the stored default names a recipe that has gone', () => {
    const text = JSON.stringify({ version: 1, defaultId: 'deleted', recipes: [] });

    expect(parseRecipeBook(text).book.defaultId).toBe(TYPE_DEFAULT_ID);
  });
});

describe('writing it', () => {
  /*
   * THE SECOND DEATH: a write after a failed read replaces the operator's list with whatever this
   * session happens to hold. The list is the only copy there is.
   */
  it('refuses to write over a book this version could not read', () => {
    const store = fakeStorage('{not json');

    expect(saveRecipes(book(), store)).toBe(false);
    expect(store.read()).toBe('{not json');
  });

  it('refuses to write over a book from a newer version', () => {
    const newer = JSON.stringify({ version: 2, defaultId: 'x', recipes: [] });
    const store = fakeStorage(newer);

    expect(saveRecipes(book(), store)).toBe(false);
    expect(store.read()).toBe(newer);
  });

  it('keeps a recipe another tab added, instead of clobbering it with a stale list', () => {
    const store = fakeStorage(JSON.stringify({ version: 1, defaultId: TYPE_DEFAULT_ID, recipes: [{ id: 'other', name: 'From another tab', settings: {}, structure: {} }] }));

    expect(saveRecipes(book(), store)).toBe(true);
    expect(loadRecipes(store).book.recipes.map((recipe) => recipe.id)).toEqual([TYPE_DEFAULT_ID, 'r1', 'other']);
  });

  it('says false when the write itself failed, so the caller does not claim it stuck', () => {
    expect(saveRecipes(book(), fakeStorage(undefined, 'write'))).toBe(false);
    expect(saveRecipes(book(), undefined)).toBe(false);
  });

  it('does not store Type default, which is this app s behaviour rather than the operator s data', () => {
    const store = fakeStorage();
    saveRecipes(book(), store);

    expect(JSON.parse(store.read()!).recipes.map((recipe: { id: string }) => recipe.id)).toEqual(['r1']);
    // And it comes back all the same.
    expect(loadRecipes(store).book.recipes[0]!.id).toBe(TYPE_DEFAULT_ID);
  });

  it('writes under the one key the app reads', () => {
    const store = fakeStorage();
    let written = '';
    saveRecipes(book(), { getItem: () => null, setItem: (key, value) => { written = key; void value; } });
    void store;

    expect(written).toBe(STORAGE_KEY);
  });
});
