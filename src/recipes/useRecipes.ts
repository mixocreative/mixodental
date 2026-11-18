// Copyright (c) Mixo Creative.

import { useCallback, useMemo, useState } from 'react';
import { emptyBook, loadRecipes, recipeById, saveRecipes, type RecipeBook, type RecipeProblem } from './recipeBook';
import { TYPE_DEFAULT_ID, isTypeDefault, recipeFrom, type SupportRecipe } from './supportRecipe';
import type { LiveSupportSettings } from '@mixo-geocore/host/core/supports/settings';
import type { DentalStructure } from '@mixo-geocore/host/dental/dentalPolicy';

/**
 * THE RECIPE BOOK AS THE APP HOLDS IT: the stored list, which card is set to which, and the five
 * things Step 3 can do to it. The rules are in `supportRecipe.ts` and `recipeBook.ts`; this is the
 * React layer and nothing else.
 *
 * THE SELECTION IS NOT PERSISTED, and that is deliberate rather than unfinished. It is keyed by
 * UNIT id, and units live for one sitting - a reopened project has new ids, so a stored map would
 * be a growing list of keys that match nothing. What IS remembered is the DEFAULT, which is the
 * thing an operator means when they say "use this one from now on".
 *
 * EVERY WRITE GOES THROUGH `saveRecipes`, which re-reads first and refuses to write over a book it
 * could not read. When it refuses, the in-memory book is NOT advanced either: the operator must be
 * able to tell that their change did not stick, and a UI showing a recipe that was never stored is
 * how they find out a week later that it was never there.
 */
export function useRecipes(storage?: Pick<Storage, 'getItem' | 'setItem'>) {
  const [stored, setStored] = useState<{ book: RecipeBook; problem?: RecipeProblem }>(() => loadRecipes(storage));
  /** `unitId -> recipeId`, for this sitting. Absent means "whatever the default is". */
  const [chosen, setChosen] = useState<ReadonlyMap<string, string>>(new Map());

  const { book, problem } = stored;

  /** Store `next` and keep it only if it was actually written. Returns whether it stuck. */
  const commit = useCallback((next: RecipeBook): boolean => {
    if (!saveRecipes(next, storage)) return false;
    setStored(loadRecipes(storage));
    return true;
  }, [storage]);

  const choose = useCallback((unitId: string, recipeId: string) => {
    setChosen((current) => new Map(current).set(unitId, recipeId));
  }, []);

  /**
   * WHAT THIS CARD WILL BUILD WITH, or `'missing'`.
   *
   * `'missing'` is never softened into the default. A selection that cannot be resolved - deleted in
   * another tab, a book this version cannot read - means the operator's instruction is unknown, and
   * generating supports anyway is the silent death `recipeBook.ts` is written against. The queue
   * turns it into a stop the card can say out loud.
   */
  const resolve = useCallback((unitId: string): SupportRecipe | 'missing' => {
    if (problem !== undefined && chosen.get(unitId) !== undefined) return 'missing';
    const wanted = chosen.get(unitId) ?? book.defaultId;
    return recipeById(book, wanted) ?? (wanted === TYPE_DEFAULT_ID ? recipeById(emptyBook(), TYPE_DEFAULT_ID)! : 'missing');
  }, [book, chosen, problem]);

  /** Save the settings in front of the operator as a new recipe, and point this card at it. */
  const addRecipe = useCallback((name: string, settings: LiveSupportSettings, structure: DentalStructure, unitId?: string): SupportRecipe | undefined => {
    const id = `recipe-${crypto.randomUUID()}`;
    const recipe = recipeFrom(id, name.trim() || 'Recipe', settings, structure);
    if (!commit({ ...book, recipes: [...book.recipes, recipe] })) return undefined;
    if (unitId) choose(unitId, id);
    return recipe;
  }, [book, choose, commit]);

  /** Replace one recipe's numbers with what is in front of the operator. Type default cannot be changed. */
  const updateRecipe = useCallback((id: string, settings: LiveSupportSettings, structure: DentalStructure): boolean => {
    const existing = recipeById(book, id);
    if (!existing || isTypeDefault(existing)) return false;
    const next = recipeFrom(id, existing.name, settings, structure);
    return commit({ ...book, recipes: book.recipes.map((recipe) => (recipe.id === id ? next : recipe)) });
  }, [book, commit]);

  /**
   * Remove one. Type default cannot be removed.
   *
   * CARDS POINTING AT IT ARE RE-POINTED at the default in the same step, so no card is left holding
   * an id that resolves to nothing - which would stop its next run with "recipe missing" for a
   * deletion the operator had already been told about.
   */
  const removeRecipe = useCallback((id: string): boolean => {
    const existing = recipeById(book, id);
    if (!existing || isTypeDefault(existing)) return false;
    const recipes = book.recipes.filter((recipe) => recipe.id !== id);
    const defaultId = book.defaultId === id ? TYPE_DEFAULT_ID : book.defaultId;
    if (!commit({ ...book, defaultId, recipes })) return false;
    setChosen((current) => new Map([...current].filter(([, recipeId]) => recipeId !== id)));
    return true;
  }, [book, commit]);

  /** "Use this one from now on": the only part of the selection that is remembered across sittings. */
  const setDefault = useCallback((id: string): boolean =>
    (recipeById(book, id) ? commit({ ...book, defaultId: id }) : false), [book, commit]);

  return useMemo(() => ({
    book,
    /** Set when the stored list could not be used: the UI says so and offers only Type default. */
    problem,
    chosen,
    choose,
    resolve,
    addRecipe,
    updateRecipe,
    removeRecipe,
    setDefault,
  }), [addRecipe, book, choose, chosen, problem, removeRecipe, resolve, setDefault, updateRecipe]);
}

export type Recipes = ReturnType<typeof useRecipes>;
