// Copyright (c) Mixo Creative.

import { describe, expect, it } from 'vitest';
import { acceptCommands, acceptedPolicy, alignerSettings, manualAreaCommands, matchesApplied, presetCommands, settledPolicy } from './stages';
import { defaultSupportSettings } from '@mixo-geocore/host/core/supports/settings';
import { RECIPE_KEYS, recipeFrom, typeDefaultRecipe } from '../recipes/supportRecipe';
import type { PrintUnit, SceneCommand } from '../state/project';
import type { DentalPolicy } from '@mixo-geocore/host/dental/dentalPolicy';

/**
 * THE DENTAL FLOW'S DECISIONS, TESTED WITHOUT A BROWSER OR A WORKER.
 *
 * This is the point of lifting them out of `useDentalFlow`: the step screens and the deck's coming
 * auto-gen queue call the SAME functions, so they cannot drift into making different supports for
 * the same model - and a plain function can be checked here in milliseconds where a hook could only
 * be walked in a browser.
 */

const PROFILE = 'reference-aligner';
/*
 * THE TYPE-CHANGED BRANCH, EXERCISED WITHOUT A SECOND PROFILE. There is exactly one aligner profile
 * today, and asking for a made-up one throws in `dentalSupportSettings` - rightly. But every
 * function here compares the unit's STORED profile id against the one being asked for, so a unit
 * carrying an older id and a request for the real profile is the same branch, with real profile data
 * on the side that has to resolve.
 */
const OLDER = 'an-older-type';

/** A light unit: these functions read a handful of fields and nothing else. */
const unit = (over: Partial<PrintUnit> = {}): PrintUnit =>
  ({ id: 'u-a', name: 'a.stl', settings: {}, manual: [], deleted: [], zones: [], contactSettings: {}, ...over } as unknown as PrintUnit);

const rim = { anchors: [], closed: true } as unknown as Extract<DentalPolicy, { kind: 'two-contour' }>['rim'];
const region = { id: 'fresh' } as unknown as Extract<DentalPolicy, { kind: 'two-contour' }>['region'];
const keptRegion = { id: 'kept' } as unknown as Extract<DentalPolicy, { kind: 'two-contour' }>['region'];

/** A unit that already carries accepted work for `PROFILE`. */
const worked = (over: Record<string, unknown> = {}) => unit({
  dental: { kind: 'two-contour', profileId: PROFILE, rim, region: keptRegion, stamps: [{ id: 's1' }], tuning: { areaWidthMm: 9 }, structure: { treeEnabled: true, bracesEnabled: false }, ...over },
} as unknown as Partial<PrintUnit>);

const policyOf = (commands: readonly SceneCommand[]) =>
  commands.find((command) => command.type === 'dental/set') as Extract<SceneCommand, { type: 'dental/set' }> | undefined;

describe('the type presets', () => {
  it('sets them for a model that has never been this type, and leaves a settled one alone', () => {
    // The operator's own Step 3 numbers are theirs once they exist; the preset is for a fresh model.
    expect(presetCommands(unit(), PROFILE)).toHaveLength(1);
    expect(presetCommands(worked(), PROFILE)).toEqual([]);
    // A model whose TYPE changed starts again from the new type's numbers.
    expect(presetCommands(worked({ profileId: OLDER }), PROFILE)).toHaveLength(1);
  });

  it('puts the presets BEFORE the policy, so one batch lands in the order the flow means', () => {
    const commands = acceptCommands(unit(), PROFILE, { kind: 'two-contour' } as DentalPolicy);

    expect(commands.map((command) => command.type)).toEqual(['settings/set', 'dental/set']);
  });
});

describe('the policy a detected area becomes', () => {
  it('keeps the work the operator already did under this type', () => {
    const policy = acceptedPolicy(worked(), PROFILE, rim, region);

    expect(policy.stamps).toHaveLength(1);
    expect(policy.tuning).toMatchObject({ areaWidthMm: 9 });
    // The FRESH region, which is the whole reason `settledPolicy` exists below.
    expect(policy.region).toBe(region);
  });

  it('starts a model of a new type from that type s own tuning, not the last type s', () => {
    const policy = acceptedPolicy(worked({ profileId: OLDER }), PROFILE, rim, region);

    expect(policy.tuning).not.toMatchObject({ areaWidthMm: 9 });
  });
});

describe('the area goes back with the tuning it was drawn for', () => {
  /*
   * THE DEFECT THIS EXISTS FOR, measured on case-001: nudging Area width and then pressing Back and
   * Next took the preview from 104 tips to ZERO. The kept tuning number is the shape of a strip, not
   * a setting read later, so a kept tuning over a freshly detected region is a policy that disagrees
   * with itself and places nothing - while still reporting itself ready.
   */
  it('restores the kept region when the orientation did NOT move', () => {
    const fresh = acceptedPolicy(worked(), PROFILE, rim, region);

    expect(settledPolicy(worked(), PROFILE, fresh, undefined).region).toBe(keptRegion);
  });

  it('keeps the freshly detected region when the aligner was turned', () => {
    // A turn really does invalidate the area it was detected for, so the fresh one is the right one.
    const fresh = acceptedPolicy(worked(), PROFILE, rim, region);

    expect(settledPolicy(worked(), PROFILE, fresh, 4.5).region).toBe(region);
  });

  it('has nothing to restore on a model with no kept work, and says so by changing nothing', () => {
    const fresh = acceptedPolicy(unit(), PROFILE, rim, region);

    expect(settledPolicy(unit(), PROFILE, fresh, undefined)).toBe(fresh);
  });
});

describe('when no area was detected', () => {
  it('carries the painted stamps, because the paint is the operator s work and not a function of the rim', () => {
    // Reaching here with stamps means the type changed under a painted area. Dropping them would be
    // W-01 again - the audit finding this whole kept-work model exists to answer.
    const commands = manualAreaCommands(worked({ profileId: OLDER }), PROFILE, rim);
    const policy = policyOf(commands)?.policy as { stamps?: readonly unknown[] } | undefined;

    expect(policy?.stamps).toHaveLength(1);
  });
});

/**
 * WHAT A RECIPE PUTS ON A MODEL - the one answer three readers share (`alignerSettings`).
 *
 * The control that applies it, the accept that writes it and the card that says whether the model
 * still matches all ask this. An earlier version had the first two disagreeing about Type default,
 * which is how a card came to read "Type default" over another recipe's supports.
 */
describe('what a recipe would put on this model', () => {
  const thin = recipeFrom('r1', 'Thin', { ...defaultSupportSettings, pillarDiameter: 1.1, braceAngle: 12 }, { treeEnabled: true, bracesEnabled: false });

  it('lets a named recipe beat the unit s own numbers, which is what choosing one means', () => {
    const settled = unit({ settings: { pillarDiameter: 2.5 }, dental: { kind: 'two-contour', profileId: PROFILE } } as unknown as Partial<PrintUnit>);

    expect(alignerSettings(settled, PROFILE, thin).settings.pillarDiameter).toBe(1.1);
    expect(alignerSettings(settled, PROFILE, thin).structure).toEqual({ treeEnabled: true, bracesEnabled: false });
  });

  /*
   * TYPE DEFAULT RESTORES EVERY PINNED KEY, not the handful the type's own preset happens to name.
   * The first version resolved it over the unit's CURRENT settings, so a key the type does not set
   * kept whatever the last recipe left there - and the card said "Type default" over it.
   *
   * Asserted as a property rather than by naming keys: the answer must not depend on what the unit
   * was carrying, which is true however the type's preset is written today.
   */
  it('restores EVERY pinned key for Type default, whatever the model was carrying', () => {
    const carrying = unit({
      settings: { pillarDiameter: 2.5, braceAngle: 12, trussSpacing: 9, labelText: 'Q' },
      dental: { kind: 'two-contour', profileId: PROFILE },
    } as unknown as Partial<PrintUnit>);
    const fresh = alignerSettings(unit(), PROFILE, typeDefaultRecipe()).settings;
    const restored = alignerSettings(carrying, PROFILE, typeDefaultRecipe()).settings;

    for (const key of RECIPE_KEYS) expect(restored[key], key).toEqual(fresh[key]);
    // And what a recipe never owned stays the model's own.
    expect(restored.labelText).toBe('Q');
  });

  it('knows when the model already carries what the recipe would put on it, switches included', () => {
    const applied = unit({
      settings: alignerSettings(unit(), PROFILE, thin).settings,
      dental: { kind: 'two-contour', profileId: PROFILE, structure: { treeEnabled: true, bracesEnabled: false } },
    } as unknown as Partial<PrintUnit>);

    expect(matchesApplied(applied, PROFILE, thin)).toBe(true);
    // A switch toggled afterwards is a difference: auto-gen would change it back.
    const toggled = unit({
      settings: applied.settings,
      dental: { kind: 'two-contour', profileId: PROFILE, structure: { treeEnabled: false, bracesEnabled: false } },
    } as unknown as Partial<PrintUnit>);

    expect(matchesApplied(toggled, PROFILE, thin)).toBe(false);
  });
});
