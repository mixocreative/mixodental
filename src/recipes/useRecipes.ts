// Copyright (c) Mixo Creative.

import { useCallback, useMemo, useState } from 'react';
import { loadRecipes, recipeById, saveRecipes, type RecipeBook, type RecipeProblem } from './recipeBook';
import { TYPE_DEFAULT_ID, isTypeDefault, recipeFrom, typeDefaultRecipe, type SupportRecipe } from './supportRecipe';
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

  /**
   * Apply one edit to the STORED book and keep the result only if it was written.
   *
   * It hands the change down rather than a finished list, because `saveRecipes` applies it to a
   * freshly read book - which is what makes a deletion a deletion and still keeps a row another tab
   * added. Handing it a whole list is what made Delete silently do nothing.
   */
  const commit = useCallback((edit: (stored: RecipeBook) => RecipeBook): boolean => {
    if (!saveRecipes(edit, storage)) return false;
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
    /*
     * A BOOK THIS DEVICE COULD NOT READ MAKES EVERY CARD UNKNOWN, including the ones nobody has
     * chosen for - and the first version had this exactly the wrong way round. It stopped a card
     * with an explicit choice and RAN the ones whose instruction it could not know, which is the
     * silent death this module is written against: the stored default may well have been "Thin",
     * and every card would have been built as Type default without a word.
     *
     * The one way through is to choose Type default on the card, deliberately, now.
     */
    if (problem !== undefined) return chosen.get(unitId) === TYPE_DEFAULT_ID ? typeDefaultRecipe() : 'missing';
    const wanted = chosen.get(unitId) ?? book.defaultId;
    return recipeById(book, wanted) ?? 'missing';
  }, [book, chosen, problem]);

  /** Save the settings in front of the operator as a new recipe, and point this card at it. */
  const addRecipe = useCallback((name: string, settings: LiveSupportSettings, structure: DentalStructure, unitId?: string): SupportRecipe | undefined => {
    const id = `recipe-${crypto.randomUUID()}`;
    const recipe = recipeFrom(id, name.trim() || 'Recipe', settings, structure);
    if (!commit((stored) => ({ ...stored, recipes: [...stored.recipes, recipe] }))) return undefined;
    if (unitId) choose(unitId, id);
    return recipe;
  }, [book, choose, commit]);

  /** Replace one recipe's numbers with what is in front of the operator. Type default cannot be changed. */
  const updateRecipe = useCallback((id: string, settings: LiveSupportSettings, structure: DentalStructure): boolean => {
    const existing = recipeById(book, id);
    if (!existing || isTypeDefault(existing)) return false;
    const next = recipeFrom(id, existing.name, settings, structure);
    return commit((stored) => ({ ...stored, recipes: stored.recipes.map((recipe) => (recipe.id === id ? next : recipe)) }));
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
    if (!commit((stored) => ({
      ...stored,
      defaultId: stored.defaultId === id ? TYPE_DEFAULT_ID : stored.defaultId,
      recipes: stored.recipes.filter((recipe) => recipe.id !== id),
    }))) return false;
    setChosen((current) => new Map([...current].filter(([, recipeId]) => recipeId !== id)));
    return true;
  }, [book, commit]);

  /** "Use this one from now on": the only part of the selection that is remembered across sittings. */
  const setDefault = useCallback((id: string): boolean =>
    (recipeById(book, id) ? commit((stored) => ({ ...stored, defaultId: id })) : false), [book, commit]);

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
