// Copyright (c) Mixo Creative.

import { defaultSupportSettings } from '@mixo-geocore/host/core/supports/settings';
import type { LiveSupportSettings, SettingKey } from '@mixo-geocore/host/core/supports/settings';
import type { DentalStructure } from '@mixo-geocore/host/dental/dentalPolicy';

/**
 * A SUPPORT RECIPE: a named set of build settings the operator keeps, and auto-gen builds with.
 *
 * Owner, 2026-11-19: *"Autogen also need a profile system to set default support settings and shall
 * be remembered across sessions on user browser cache. Use be able to add new support setting
 * profile so auto gen use it and can be switched for each item auto gen."*
 *
 * WHY IT IS CALLED A RECIPE AND NOT A PROFILE, which is the first thing this feature had to settle.
 * In this app **"profile" already means the aligner TYPE** (`reference-aligner`,
 * `reference-denture`) - it decides geometry rules and is chosen per card on the deck - and
 * **"preset" already means LIGHT / MIDDLE / HEAVY**. A third thing wearing either word would be
 * audit MIXO-14 again, where "Step 1" named two different screens and cost a release to untangle.
 * `recipe` appears nowhere else in this repo, so a grep can keep it that way.
 *
 * WHAT IT PINS, and the two things it must never pin:
 *
 *   - **not `labelText`.** It is per-unit: `dentalLabelCommands` keeps whatever label the settings
 *     carry, so a pinned one would be embossed on every aligner in the case. This is the single
 *     worst field to get wrong here and it is why "pin the whole settings object" is not the answer.
 *   - **not the viewport's or the editor's own state** - `previewMode`, `eraseRadius`, `autoSnap`,
 *     `lowPolyMode`, `preset`, `roofSeededModes`. None of them changes a support; all of them would
 *     follow a recipe from one operator's screen to another's.
 *
 * Everything else IS a build key, so the list below is written as what is NOT pinned - short enough
 * to read and to argue with. `supportRecipe.test.ts` pins the resulting key list exactly, so the
 * day the engine gains a setting the test fails and a person has to say which kind it is. A new
 * build key silently left out of recipes is the quiet version of this feature not working.
 */
export interface SupportRecipe {
  readonly id: string;
  /** What the operator typed. Never translated - it is their word for their own numbers. */
  readonly name: string;
  /** The build settings this recipe pins, always a subset of `RECIPE_KEYS`. */
  readonly settings: Readonly<Partial<LiveSupportSettings>>;
  /** Tree branches and cross-braces, which Step 3 builds with and which are not in `settings`. */
  readonly structure: DentalStructure;
}

/** Keys a recipe must never carry: per-unit work, or one operator's view of it. */
const NOT_PINNED = ['preset', 'roofSeededModes', 'labelText', 'previewMode', 'eraseRadius', 'autoSnap', 'lowPolyMode'] as const;

/** Every setting a recipe pins: all of them except `NOT_PINNED`. Order is the settings type's own. */
export const RECIPE_KEYS: readonly SettingKey[] = (Object.keys(defaultSupportSettings) as SettingKey[])
  .filter((key) => !(NOT_PINNED as readonly string[]).includes(key));

/**
 * The built-in entry: "use whatever the aligner TYPE says", which is what auto-gen did before
 * recipes existed and what a case of unanswered cards still does.
 *
 * It pins nothing, it cannot be edited and it cannot be deleted. Its id is stable so a stored
 * selection survives; its name uses the deck's own word for the type.
 */
export const TYPE_DEFAULT_ID = 'type-default';

export const typeDefaultRecipe = (): SupportRecipe =>
  ({ id: TYPE_DEFAULT_ID, name: 'Type default', settings: {}, structure: { treeEnabled: false, bracesEnabled: false } });

export const isTypeDefault = (recipe: Pick<SupportRecipe, 'id'>): boolean => recipe.id === TYPE_DEFAULT_ID;

/** One recipe from a unit's current settings: the build keys only, with the Tree and Brace switches. */
export function recipeFrom(id: string, name: string, settings: LiveSupportSettings, structure: DentalStructure): SupportRecipe {
  const pinned: Partial<LiveSupportSettings> = {};
  for (const key of RECIPE_KEYS) (pinned as Record<string, unknown>)[key] = settings[key];
  return { id, name, settings: pinned, structure: { ...structure } };
}

/**
 * `base` with this recipe's values on top.
 *
 * THE RECIPE WINS over what the type would have chosen, deliberately: pillar, tip, lift, raft, Tree
 * and Brace are exactly what an operator makes a recipe FOR, and the card names which one ran. The
 * caller resolves the type's defaults first and passes them as `base`, so a key the recipe does not
 * carry - including one the engine added after the recipe was saved - comes from the type.
 *
 * UNKNOWN KEYS ARE DROPPED here as well as at parse time, because a book written by a newer version
 * of the app can reach this function on an older one.
 */
export function applyRecipe(base: LiveSupportSettings, recipe: Pick<SupportRecipe, 'settings'>): LiveSupportSettings {
  const next = { ...base };
  for (const key of RECIPE_KEYS) {
    const value = recipe.settings[key];
    if (value !== undefined && typeof value === typeof base[key]) (next as Record<string, unknown>)[key] = value;
  }
  return next;
}

/** Whether a unit's settings still match the recipe it is labelled with (the card says "edited" when not). */
export function matchesRecipe(settings: LiveSupportSettings, recipe: Pick<SupportRecipe, 'settings'>): boolean {
  return RECIPE_KEYS.every((key) => {
    const value = recipe.settings[key];
    return value === undefined || value === settings[key];
  });
}
