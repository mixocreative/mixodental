// Copyright (c) Mixo Creative.

import { describe, expect, it } from 'vitest';
import { defaultSupportSettings } from '@mixo-geocore/host/core/supports/settings';
import { RECIPE_KEYS, applyRecipe, isTypeDefault, matchesRecipe, recipeFrom, typeDefaultRecipe } from './supportRecipe';
import type { LiveSupportSettings } from '@mixo-geocore/host/core/supports/settings';
import type { DentalStructure } from '@mixo-geocore/host/dental/dentalPolicy';

/**
 * WHAT A RECIPE PINS, which is the whole of whether this feature is safe.
 *
 * A recipe is applied to every model an operator auto-generates, so a key in it that should not be
 * there follows their screen onto someone else's print, and a build key missing from it is a
 * setting their recipe quietly stops controlling.
 */

const structure: DentalStructure = { treeEnabled: true, bracesEnabled: false };
const settings = (over: Partial<LiveSupportSettings> = {}): LiveSupportSettings =>
  ({ ...defaultSupportSettings, ...over });

describe('the keys a recipe pins', () => {
  /*
   * THE COUNT IS PINNED ON PURPOSE. The list is built by excluding the per-unit and view-only keys,
   * so an engine release that adds a SETTING adds it to every recipe without anyone deciding that
   * it should be there - and the opposite choice, an allowlist, would silently leave a new build key
   * out instead. Either way a person has to classify it, so this test exists to make them: it fails
   * on the next engine update, and the fix is one line plus a reason.
   */
  it('is every setting except the per-unit and view-only ones, and the number is checked', () => {
    expect(RECIPE_KEYS).toHaveLength(63);
    expect(new Set(RECIPE_KEYS).size).toBe(RECIPE_KEYS.length);
  });

  it('never pins the label, which is per unit and would be embossed on the whole case', () => {
    // `dentalLabelCommands` keeps whatever label the settings carry. This is the worst field to get
    // wrong here and the reason "pin the whole settings object" is not the answer.
    expect(RECIPE_KEYS).not.toContain('labelText');
  });

  it('never pins where ONE model s label had to be nudged to clear something', () => {
    // Per-unit work by the same argument as `labelText`. How the labels are MADE is pinned.
    expect(RECIPE_KEYS).not.toContain('labelOffsetX');
    expect(RECIPE_KEYS).not.toContain('labelOffsetY');
    expect(RECIPE_KEYS).toContain('labelSize');
  });

  it('never pins one operator s view of the model, or the editor s own tools', () => {
    for (const key of ['preset', 'roofSeededModes', 'previewMode', 'eraseRadius', 'autoSnap', 'lowPolyMode']) {
      expect(RECIPE_KEYS, key).not.toContain(key);
      // And each is a real settings key, so a rename upstream fails here rather than silently
      // widening what a recipe carries.
      expect(defaultSupportSettings, key).toHaveProperty(key);
    }
  });

  it('pins the numbers an operator actually makes a recipe for', () => {
    for (const key of ['pillarDiameter', 'touchDiameter', 'neckLength', 'liftHeight', 'raftEnabled']) {
      expect(RECIPE_KEYS, key).toContain(key);
    }
  });
});

describe('making one from a unit s settings', () => {
  it('takes the build keys and the Tree and Brace switches, and nothing else', () => {
    const recipe = recipeFrom('r1', 'Thin', settings({ pillarDiameter: 1.1, labelText: 'Q' }), structure);

    expect(recipe.settings.pillarDiameter).toBe(1.1);
    expect(recipe.settings).not.toHaveProperty('labelText');
    expect(recipe.structure).toEqual(structure);
  });

  it('copies the structure rather than holding the caller s object', () => {
    const live = { ...structure };
    const recipe = recipeFrom('r1', 'Thin', settings(), live);
    live.treeEnabled = false;

    expect(recipe.structure.treeEnabled).toBe(true);
  });
});

describe('applying one', () => {
  it('beats the type s own value, which is what a recipe is for', () => {
    const recipe = recipeFrom('r1', 'Thin', settings({ pillarDiameter: 1.1 }), structure);

    expect(applyRecipe(settings({ pillarDiameter: 2.5 }), recipe).pillarDiameter).toBe(1.1);
  });

  it('leaves a key it does not carry to the type, which is how an old recipe meets a new setting', () => {
    const older = { id: 'r1', name: 'Old', settings: { pillarDiameter: 1.1 }, structure };

    expect(applyRecipe(settings({ neckLength: 4.2 }), older).neckLength).toBe(4.2);
  });

  it('drops a stored value of the wrong type, because this is the one input a person can hand-edit', () => {
    const bad = { id: 'r1', name: 'Bad', settings: { pillarDiameter: 'thick' as never }, structure };

    expect(applyRecipe(settings({ pillarDiameter: 2.5 }), bad).pillarDiameter).toBe(2.5);
  });

  it('changes nothing for Type default, which is the behaviour this app had before recipes', () => {
    const base = settings({ pillarDiameter: 2.5 });

    expect(applyRecipe(base, typeDefaultRecipe())).toEqual(base);
    expect(isTypeDefault(typeDefaultRecipe())).toBe(true);
  });
});

describe('whether a unit still matches the recipe it is labelled with', () => {
  it('says so, and says no once a pinned number is edited', () => {
    const recipe = recipeFrom('r1', 'Thin', settings({ pillarDiameter: 1.1 }), structure);

    expect(matchesRecipe(settings({ pillarDiameter: 1.1 }), recipe)).toBe(true);
    expect(matchesRecipe(settings({ pillarDiameter: 1.2 }), recipe)).toBe(false);
  });

  it('ignores a key the recipe does not pin, so a label or a view change is not an edit', () => {
    const recipe = recipeFrom('r1', 'Thin', settings(), structure);

    expect(matchesRecipe(settings({ labelText: 'Z' }), recipe)).toBe(true);
  });
});
