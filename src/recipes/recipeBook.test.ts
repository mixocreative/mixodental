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
    saveRecipes(() => book(), store);

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
  });

  /*
   * BLOCKED STORAGE IS AN EMPTY BOOK, NOT A LOST ONE, and the difference decides whether a case can
   * be generated at all. A problem stops every card, because the operator's instruction is unknown.
   * Storage that throws on read throws on write too, so nothing was ever saved on that device and
   * nothing is unknown - reporting a problem would refuse to generate anything in a private window,
   * over data that cannot exist.
   */
  /*
   * BLOCKED STORAGE IS A PROBLEM, not an empty book. A first version reasoned that storage throwing
   * on read throws on write too, so nothing could have been saved - but site data can be blocked
   * AFTER recipes were saved, and the book is then still there and still unreadable. A stored
   * default of "Thin" silently becoming Type default on every card is the failure this guards.
   */
  it('reports blocked storage as unreadable, because a saved book may still be there', () => {
    const blocked = loadRecipes(fakeStorage(undefined, 'read'));

    expect(blocked.problem).toBe('unreadable');
    expect(blocked.book.recipes.map((recipe) => recipe.id)).toEqual([TYPE_DEFAULT_ID]);
  });

  it('treats a book from a newer version as read-only, not as rubbish', () => {
    expect(parseRecipeBook('{"version":2,"defaultId":"x","recipes":[]}').problem).toBe('newer');
  });

  it('drops a row it cannot use and keeps the rest, rather than failing the whole book', () => {
    const text = JSON.stringify({ version: 1, defaultId: 'r1', recipes: [{ id: 'r1', name: 'Thin', settings: { pillarDiameter: 1.1 } }, { name: 'no id' }] });

    expect(parseRecipeBook(text).book.recipes.map((recipe) => recipe.id)).toEqual([TYPE_DEFAULT_ID, 'r1']);
  });

  it('drops a number the engine would reject, which would fail the build with no mention of why', () => {
    const text = JSON.stringify({ version: 1, recipes: [{ id: 'r1', name: 'Odd', settings: { pillarDiameter: -3, neckLength: 1e999, liftHeight: 4 } }] });
    const stored = parseRecipeBook(text).book.recipes[1]!;

    expect(stored.settings).not.toHaveProperty('pillarDiameter');
    expect(stored.settings).not.toHaveProperty('neckLength');
    expect(stored.settings.liftHeight).toBe(4);
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

    expect(saveRecipes(() => book(), store)).toBe(false);
    expect(store.read()).toBe('{not json');
  });

  it('refuses to write over a book from a newer version', () => {
    const newer = JSON.stringify({ version: 2, defaultId: 'x', recipes: [] });
    const store = fakeStorage(newer);

    expect(saveRecipes(() => book(), store)).toBe(false);
    expect(store.read()).toBe(newer);
  });

  /*
   * THE EDIT IS APPLIED TO A FRESHLY READ BOOK, which is what makes both of these true at once: a
   * row another tab added is still there, AND a deletion is still a deletion. The first version
   * took the caller's whole list and merged back anything only the stored copy had - so a deleted
   * row looked exactly like another tab's addition and was written straight back. Delete never
   * worked, and `saveRecipes` said it had.
   */
  it('adds to what another tab stored, rather than clobbering it with a stale list', () => {
    const store = fakeStorage(JSON.stringify({ version: 1, defaultId: TYPE_DEFAULT_ID, recipes: [{ id: 'other', name: 'From another tab', settings: {}, structure: {} }] }));
    const thin = book().recipes[1]!;

    expect(saveRecipes((stored) => ({ ...stored, recipes: [...stored.recipes, thin] }), store)).toBe(true);
    expect(loadRecipes(store).book.recipes.map((recipe) => recipe.id)).toEqual([TYPE_DEFAULT_ID, 'other', 'r1']);
  });

  it('DELETES, which the merge made impossible', () => {
    const store = fakeStorage();
    saveRecipes(() => book(), store);

    expect(saveRecipes((stored) => ({ ...stored, recipes: stored.recipes.filter((recipe) => recipe.id !== 'r1') }), store)).toBe(true);
    expect(loadRecipes(store).book.recipes.map((recipe) => recipe.id)).toEqual([TYPE_DEFAULT_ID]);
  });

  it('does not resurrect a row this tab deleted while another tab was adding one', () => {
    const store = fakeStorage();
    saveRecipes(() => book(), store);
    // Another tab adds one, under this tab's feet.
    const other = { id: 'other', name: 'From another tab', settings: {}, structure: { treeEnabled: false, bracesEnabled: false } };
    saveRecipes((stored) => ({ ...stored, recipes: [...stored.recipes, other] }), store);
    // This tab now deletes the one it was looking at.
    saveRecipes((stored) => ({ ...stored, recipes: stored.recipes.filter((recipe) => recipe.id !== 'r1') }), store);

    expect(loadRecipes(store).book.recipes.map((recipe) => recipe.id)).toEqual([TYPE_DEFAULT_ID, 'other']);
  });

  it('says false when the write itself failed, so the caller does not claim it stuck', () => {
    expect(saveRecipes(() => book(), fakeStorage(undefined, 'write'))).toBe(false);
    expect(saveRecipes(() => book(), undefined)).toBe(false);
  });

  it('does not store Type default, which is this app s behaviour rather than the operator s data', () => {
    const store = fakeStorage();
    saveRecipes(() => book(), store);

    expect(JSON.parse(store.read()!).recipes.map((recipe: { id: string }) => recipe.id)).toEqual(['r1']);
    // And it comes back all the same.
    expect(loadRecipes(store).book.recipes[0]!.id).toBe(TYPE_DEFAULT_ID);
  });

  it('writes under the one key the app reads', () => {
    const store = fakeStorage();
    let written = '';
    saveRecipes(() => book(), { getItem: () => null, setItem: (key, value) => { written = key; void value; } });
    void store;

    expect(written).toBe(STORAGE_KEY);
  });
});
