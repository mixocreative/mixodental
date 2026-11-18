// Copyright (c) Mixo Creative.

import { t } from '../i18n';
import { isTypeDefault, type SupportRecipe } from './supportRecipe';
import type { RecipeBook } from './recipeBook';

/**
 * WHICH SUPPORT RECIPE THIS CARD WILL BUILD WITH, in as few pixels as a worklist can spare.
 *
 * Owner, 2026-11-19: *"can be switched for each item auto gen (show which is in-use)"* - so it is
 * both the readout and the control, because a card is ~208px wide and two of them would not fit.
 *
 * A NATIVE `<select>`, for the reason `LanguageSelect` gives at length: the list, the keyboard, the
 * type-ahead and the screen-reader announcement stay the platform's own. The category control next
 * to it is a hand-built listbox only because its list carries pictures; this one is names.
 *
 * AFTER A RUN IT NAMES WHAT THE RUN USED, not what is selected now. `ran` comes from the finished
 * card rather than from the current default, because changing the default would otherwise relabel
 * every card in the case - telling the operator that supports already on the plate were built with
 * something they have never used.
 */
export function RecipeChip({ unitId, book, problem, selectedId, ran, edited, onChoose }: {
  readonly unitId: string;
  readonly book: RecipeBook;
  /** The stored list could not be read: only Type default is offered, and the chip says why. */
  readonly problem: boolean;
  /** This card's own choice, or `undefined` to follow the book's default. */
  readonly selectedId: string | undefined;
  /** The recipe a finished run actually used. Once set, it is what the chip says. */
  readonly ran: string | undefined;
  /**
   * The model's settings no longer match the recipe this card names.
   *
   * IT MATTERS BECAUSE AUTO-GEN WILL OVERWRITE THEM. `presetCommands` writes the recipe onto the
   * unit at accept time, so an operator who opened this card, moved a slider and came back would
   * lose those numbers to a press of Auto-gen - with the chip calmly naming the recipe all along.
   * Saying "edited" is what turns that from a surprise into a choice: Update the recipe, or save a
   * new one.
   */
  readonly edited: boolean;
  readonly onChoose: (recipeId: string) => void;
}) {
  const value = selectedId ?? book.defaultId;
  const chosen: SupportRecipe | undefined = book.recipes.find((recipe) => recipe.id === value);
  /*
   * A SELECTION THAT RESOLVES TO NOTHING IS SHOWN AS ITSELF, never as the default. The queue stops
   * on it (`AutoGenStop` `recipe/missing`); the card must not meanwhile display a recipe it is not
   * going to use.
   */
  const name = problem ? t('Recipe missing') : chosen?.name ?? t('Recipe missing');
  const label = ran ?? (edited ? t('{name}, edited', { name }) : name);
  const title = problem
    ? t('Your saved support recipes could not be read on this device, so only the type default is offered.')
    : ran !== undefined
      ? t('These supports were built with {name}.', { name: ran })
      : edited
        ? t('This model s settings no longer match {name}. Auto-gen will use the recipe, not the changes.', { name })
        : t('The support settings auto-gen will build this model with: {name}.', { name: label });

  /*
   * ONCE A RUN HAS HAPPENED THIS IS A READOUT, not a control. The supports on the plate were built
   * with `ran`, the key that would build them again is gone (a re-run would re-orient and destroy
   * them), and the editor has its own recipe row - so a select here could only record a choice that
   * changes nothing on screen. That is the dead control this app's own standard forbids.
   */
  if (ran !== undefined) {
    return <span className="recipe-chip recipe-chip--ran" data-ui={`card-recipe-${unitId}`} title={title}>
      <span className="recipe-chip-name">{ran}</span>
    </span>;
  }

  /*
   * ON AN UNREADABLE BOOK THE CONTROL STARTS ON NOTHING, which is what makes the one way through
   * reachable. With a problem, every card resolves to `'missing'` and stops - unless the operator
   * chooses Type default HERE, deliberately. Preselecting Type default would mean `onChange` could
   * never fire, so that choice could not be made and the queue would be stuck with no way out.
   */
  const unresolved = problem || !chosen;

  return <span className="recipe-chip" data-ui={`card-recipe-${unitId}`} title={title}>
    <span className="recipe-chip-name">{label}</span>
    <select
      data-ui={`card-recipe-select-${unitId}`}
      aria-label={t('Support recipe')}
      value={unresolved && selectedId === undefined ? '' : value}
      onChange={(event) => onChoose(event.target.value)}
    >
      {/* The unresolvable selection, so the control shows the truth rather than silently re-pointing. */}
      {unresolved && selectedId === undefined ? <option value="" disabled>{t('Recipe missing')}</option> : null}
      {book.recipes.map((recipe) => (
        <option key={recipe.id} value={recipe.id}>
          {isTypeDefault(recipe) ? t('Type default') : recipe.name}
        </option>
      ))}
    </select>
  </span>;
}
