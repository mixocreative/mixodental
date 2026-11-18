// Copyright (c) Mixo Creative.

import { useState } from 'react';
import { t } from '../i18n';
import { isTypeDefault } from './supportRecipe';
import type { RecipeBook } from './recipeBook';

/**
 * MAKING AND KEEPING A SUPPORT RECIPE, in Step 3 where the settings already are.
 *
 * Owner, 2026-11-19: *"Use be able to add new support setting profile so auto gen use it."* This is
 * the whole of that, in one row under the sliders.
 *
 * WHY HERE AND NOT A MANAGER SCREEN. The numbers are on this panel; "remember these" is the sentence
 * an operator says while looking at them. A separate screen would mean leaving the model, finding
 * the settings again out of context, and typing them a second time - which is how a recipe comes to
 * differ from the supports it was named after.
 *
 * EDITING IS PICK, ADJUST, UPDATE. There is no edit mode and no second form: the sliders above ARE
 * the editor, so a recipe is changed by selecting it, moving a slider and pressing Update. Type
 * default is the one entry that cannot be updated or deleted - it is this app's behaviour rather
 * than the operator's data.
 *
 * EVERY WRITE REPORTS WHETHER IT STUCK. `saveRecipes` refuses to write over a book it could not read
 * or one from a newer version, and an operator who is not told is an operator who finds out a week
 * later that their recipe was never there.
 */
export function RecipeRow({ book, problem, selectedId, onChoose, onSaveAs, onUpdate, onDelete, onSetDefault }: {
  readonly book: RecipeBook;
  /** The stored list could not be read, so only Type default is offered and nothing may be written. */
  readonly problem: boolean;
  readonly selectedId: string;
  readonly onChoose: (recipeId: string) => void;
  /** Save what is on screen as a new recipe. Returns false when nothing was written. */
  readonly onSaveAs: (name: string) => boolean;
  readonly onUpdate: (recipeId: string) => boolean;
  readonly onDelete: (recipeId: string) => boolean;
  readonly onSetDefault: (recipeId: string) => boolean;
}) {
  const [name, setName] = useState('');
  const [failed, setFailed] = useState(false);
  const selected = book.recipes.find((recipe) => recipe.id === selectedId);
  const builtIn = selected === undefined || isTypeDefault(selected);
  /** Run a write and remember whether it stuck, so the row can say so rather than look successful. */
  const attempt = (write: () => boolean) => { setFailed(!write()); };

  return <div className="recipe-row" data-ui="recipe-row">
    <label className="recipe-row-pick">
      <span>{t('Support recipe')}</span>
      <select data-ui="recipe-row-select" value={selectedId} onChange={(event) => onChoose(event.target.value)}>
        {book.recipes.map((recipe) => (
          <option key={recipe.id} value={recipe.id}>{isTypeDefault(recipe) ? t('Type default') : recipe.name}</option>
        ))}
      </select>
    </label>

    {/*
      THE NAME FIELD IS THE ONLY INPUT, and Save as new is off until it holds something: a list of
      recipes called "Recipe" is a list nobody can choose from.
    */}
    <div className="recipe-row-keys">
      <input className="recipe-row-name" data-ui="recipe-row-name" value={name} maxLength={40}
        aria-label={t('Name for a new support recipe')} placeholder={t('New recipe name')}
        onChange={(event) => setName(event.target.value)} />
      <button type="button" data-ui="recipe-row-save" disabled={problem || name.trim() === ''}
        title={problem ? t('Your saved support recipes could not be read on this device, so nothing can be saved.') : t('Save these settings under this name, and use it for this model.')}
        onClick={() => { attempt(() => onSaveAs(name)); setName(''); }}>{t('Save as new')}</button>
      <button type="button" data-ui="recipe-row-update" disabled={problem || builtIn}
        title={builtIn ? t('The type default cannot be changed. Save these settings as a new recipe instead.') : t('Replace this recipe s settings with the ones on screen.')}
        onClick={() => attempt(() => onUpdate(selectedId))}>{t('Update')}</button>
      <button type="button" className="danger" data-ui="recipe-row-delete" disabled={problem || builtIn}
        title={builtIn ? t('The type default cannot be removed.') : t('Remove this recipe from this device.')}
        onClick={() => attempt(() => onDelete(selectedId))}>{t('Delete')}</button>
      <button type="button" data-ui="recipe-row-default" disabled={problem || book.defaultId === selectedId}
        title={t('Use this recipe for models nobody has chosen one for.')}
        onClick={() => attempt(() => onSetDefault(selectedId))}>{t('Use as default')}</button>
    </div>

    {problem ? <p className="help" role="note" data-ui="recipe-row-problem">
      {t('Your saved support recipes could not be read on this device, so only the type default is offered.')}
    </p> : null}
    {failed ? <p className="edit-note" role="alert" data-ui="recipe-row-failed">
      {t('That could not be saved on this device, so nothing was changed.')}
    </p> : null}
  </div>;
}
