// Copyright (c) Mixo Creative.

import { RECIPE_KEYS, TYPE_DEFAULT_ID, typeDefaultRecipe, type SupportRecipe } from './supportRecipe';
import { defaultSupportSettings, settingLimits, type LiveSupportSettings } from '@mixo-geocore/host/core/supports/settings';

/**
 * THE OPERATOR'S RECIPES, ON THEIR OWN DEVICE. There is no server in this app and there is not going
 * to be one, so "remembered across sessions" means `localStorage` and nothing else.
 *
 * ONE KEY, A WHOLE BOOK, following `src/plate/printerProfiles.ts` - the pattern this repo already
 * uses for the one other thing it remembers: an injected `Pick<Storage>` so it can be tested without
 * a browser, and try/catch on every access because a private window, a blocked origin or a full
 * quota all throw rather than returning null.
 *
 * TWO THINGS THAT MUST NEVER HAPPEN, and both are this feature's silent deaths:
 *
 *   1. **A selection that cannot be resolved quietly becoming "the defaults".** An operator who
 *      chose "Thin" and gets type defaults has supports they did not ask for on a model they will
 *      print. So an unreadable book does NOT pretend to be an empty one: `problem` says so, the UI
 *      offers only Type default, and a card whose chosen recipe is missing stops rather than guesses.
 *   2. **A failed read followed by a write**, which replaces the operator's list with whatever this
 *      session happens to hold. `save` refuses unless the book it was given came from a clean read.
 *
 * A BOOK FROM A NEWER VERSION IS READ-ONLY. Writing a v1 book over a v2 one is the same destruction
 * as 2, arriving through a second tab or an older build left open.
 */

export interface RecipeBook {
  readonly version: 1;
  /** The recipe a card uses when nobody has chosen one. Always resolvable within `recipes`. */
  readonly defaultId: string;
  /** Type default first, then the operator's own in the order they made them. */
  readonly recipes: readonly SupportRecipe[];
}

/** Why the stored book could not be used. `undefined` is a clean read, including "nothing stored yet". */
export type RecipeProblem = 'unreadable' | 'newer';

export const STORAGE_KEY = 'mixodental.recipes';

const isObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);

/** The empty book: Type default and nothing else, which is what this app did before recipes existed. */
export const emptyBook = (): RecipeBook => ({ version: 1, defaultId: TYPE_DEFAULT_ID, recipes: [typeDefaultRecipe()] });

/**
 * One stored recipe, or `undefined` for a row this version cannot use.
 *
 * UNKNOWN KEYS ARE DROPPED AND TYPES ARE CHECKED per key, rather than trusting the shape: this is
 * the one input to the app that a person can edit by hand, and a string where the engine wants a
 * number reaches Rust as a flat array.
 */
function parseRecipe(raw: unknown): SupportRecipe | undefined {
  if (!isObject(raw) || typeof raw.id !== 'string' || raw.id === '' || typeof raw.name !== 'string') return undefined;
  if (!isObject(raw.settings)) return undefined;
  const settings: Partial<LiveSupportSettings> = {};
  for (const key of RECIPE_KEYS) {
    const value = (raw.settings as Record<string, unknown>)[key];
    /*
     * THE TYPE IS CHECKED AGAINST THE ENGINE'S OWN, not merely "is a primitive". A hand-edited
     * `"2.4"` where a number belongs would otherwise be stored, never equal the number the unit
     * carries, and make every card on that recipe read "edited" for ever - while the engine, which
     * rejects out-of-shape settings, failed the build with no mention of the recipe.
     */
    if (typeof value !== typeof defaultSupportSettings[key]) continue;
    /*
     * AND A NUMBER MUST BE A REAL ONE, IN RANGE. `typeof` alone let `1e999` through as Infinity and
     * a negative pillar through as a pillar - both of which the engine rejects, so the build failed
     * with no mention of the recipe that caused it. `settingLimits` is the same table the sliders
     * clamp to, so a hand-edited file cannot ask for what the UI cannot.
     */
    if (typeof value === 'number') {
      const limit = (settingLimits as Record<string, { min: number; max: number } | undefined>)[key];
      if (!Number.isFinite(value)) continue;
      if (limit && (value < limit.min || value > limit.max)) continue;
    }
    (settings as Record<string, unknown>)[key] = value;
  }
  const structure = isObject(raw.structure) ? raw.structure : {};
  return {
    id: raw.id,
    name: raw.name,
    settings,
    structure: { treeEnabled: structure.treeEnabled === true, bracesEnabled: structure.bracesEnabled === true },
  };
}

/**
 * A stored document, or the problem with it. **Never a silent empty book** - see the header.
 *
 * Type default is put back whatever the document said, because it is this app's behaviour rather
 * than the operator's data: a book that lost it would leave a case with no way to say "just use the
 * type".
 */
export function parseRecipeBook(text: string | null): { book: RecipeBook; problem?: RecipeProblem } {
  if (text === null || text === '') return { book: emptyBook() };
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { book: emptyBook(), problem: 'unreadable' };
  }
  if (!isObject(raw) || typeof raw.version !== 'number') return { book: emptyBook(), problem: 'unreadable' };
  if (raw.version > 1) return { book: emptyBook(), problem: 'newer' };
  if (!Array.isArray(raw.recipes)) return { book: emptyBook(), problem: 'unreadable' };
  const mine = raw.recipes.map(parseRecipe).filter((recipe): recipe is SupportRecipe => recipe !== undefined && recipe.id !== TYPE_DEFAULT_ID);
  const recipes = [typeDefaultRecipe(), ...mine];
  const defaultId = typeof raw.defaultId === 'string' && recipes.some((recipe) => recipe.id === raw.defaultId)
    ? raw.defaultId
    : TYPE_DEFAULT_ID;
  return { book: { version: 1, defaultId, recipes } };
}

/**
 * The book on this device, with the problem that stopped it being read.
 *
 * `globalThis.localStorage` IS READ INSIDE THE TRY, and as a default parameter it was not - so the
 * one case this catch exists for never reached it. Chrome and Firefox with site data blocked throw
 * on the PROPERTY ACCESS, which a default parameter performs before the function body runs: the
 * error escaped to the `useState` initialiser that calls this. Injected-storage tests cannot see
 * that, because they never touch the global.
 *
 * AND BLOCKED STORAGE IS A PROBLEM, not an empty book. A first version reasoned that storage which
 * throws on read throws on write, so nothing could have been saved - but storage can be blocked
 * AFTER recipes were saved, by a policy change or by cookies being switched off, and the book is
 * then still there and still unreadable. A stored default of "Thin" silently becoming Type default
 * on every card is exactly the failure this module is written against. Choosing Type default on a
 * card is the deliberate way through.
 */
export function loadRecipes(storage?: Pick<Storage, 'getItem'>): { book: RecipeBook; problem?: RecipeProblem } {
  try {
    const store = storage ?? globalThis.localStorage;
    return parseRecipeBook(store?.getItem(STORAGE_KEY) ?? null);
  } catch {
    return { book: emptyBook(), problem: 'unreadable' };
  }
}

/**
 * Apply one edit to the stored book.
 *
 * IT TAKES A CHANGE, NOT A BOOK, and that is a correction rather than a style. The first version
 * took the caller's whole list and merged anything only the stored copy had - so a DELETE could
 * never work: the row the caller had just removed looked exactly like a row another tab had just
 * added, and was written straight back. `saveRecipes` returned true, nothing said otherwise, and
 * the recipe was still in the list. Fable found it by running it.
 *
 * Handing the edit in instead settles both at once: it is applied to a FRESHLY READ book, so a
 * recipe another tab added a minute ago is still there and a deletion is still a deletion. The
 * caller never holds a stale list long enough to write it.
 *
 * IT REFUSES AFTER A FAILED READ, which is the other half: writing over a book this version could
 * not parse would destroy the only copy of the operator's list.
 *
 * Returns false when nothing was written, so the caller can say so rather than assume it stuck.
 */
export function saveRecipes(edit: (stored: RecipeBook) => RecipeBook, storage?: Pick<Storage, 'getItem' | 'setItem'>): boolean {
  try {
    // Inside the try for the same reason as `loadRecipes`: blocked site data throws on the access.
    const store = storage ?? globalThis.localStorage;
    if (!store) return false;
    const { problem, book: stored } = parseRecipeBook(store.getItem(STORAGE_KEY) ?? null);
    if (problem !== undefined) return false;
    const next = edit(stored);
    const defaultId = next.recipes.some((recipe) => recipe.id === next.defaultId) ? next.defaultId : TYPE_DEFAULT_ID;
    store.setItem(STORAGE_KEY, JSON.stringify({
      version: 1,
      defaultId,
      // Type default is this app's behaviour, not the operator's data: it is rebuilt on read.
      recipes: next.recipes.filter((recipe) => recipe.id !== TYPE_DEFAULT_ID),
    }));
    return true;
  } catch {
    return false;
  }
}

/** The recipe `id` names, or `undefined` - which the caller must treat as a stop, never as "defaults". */
export const recipeById = (book: RecipeBook, id: string | undefined): SupportRecipe | undefined =>
  book.recipes.find((recipe) => recipe.id === id);
