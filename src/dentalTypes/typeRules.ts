/*
 * ONE JOB: a saved type's pinned rules in the app (WORKBENCH-TABS-PLAN E1, the rules half) - which ones a type may pin,
 * and the ones a loaded type pinned, by profile id, for every job on it and every new unit of it.
 *
 * TWO KINDS OF PINNED RULE. Four rules are each unit's own settings in the app (`denture/settings/dentureRules.ts`): the
 * Overhang angle and the three denture options. A type that put one in its jobs would have its number used while the
 * unit's control showed another - a control that lies. So those four SEED the unit's controls instead: the type's value
 * is where a new unit of the type starts, the control shows it, and from there the unit owns it (`typeSettingsSeedOf`,
 * `typeOptionsSeedOf`). Every OTHER pinned rule rides in each job on the type (`typeRulesOf`). A seeded value the
 * unit's control cannot show is refused when the type loads (`typeRuleProblem`). `typeRules.test.ts` fails if
 * `dentureRulesOf` gains a rule `UNIT_OWNED_RULES` does not name.
 *
 * WHY THE MAIN THREAD IS ENOUGH. Rules travel IN each job (`dentureRulesOf` builds them on the main thread), unlike the
 * graphs, which are engine slots each realm sets itself (`typeGraphs.ts`).
 */
import type { GenerateRules } from '@mixo-geocore/host/supports/generateRules';
import { normalizeDentureOptions, type DentureOptions, type ModelLandingDefault } from '../denture/settings/dentureOptions';

/** The rules the unit's own settings set in the app: a type never puts these in a job itself, it seeds them. */
export const UNIT_OWNED_RULES: readonly string[] = ['overhangAngleDeg', 'dentalModelLanding', 'lowOutsideAllowed', 'lastResortClearanceMm'];

/** `dentalModelLanding`'s numbers as the unit's dropdown values (the inverse of dentureRules.ts LANDING_RULE). */
const LANDING_OF: Readonly<Record<number, ModelLandingDefault>> = { 0: 'off', 1: 'lows', 2: 'any' };

/** The denture options a type's pinned rules seed: each option rule as the field its control shows. */
function optionsOfRules(rules: Readonly<Record<string, number | boolean>>): Partial<DentureOptions> {
  const out: Partial<DentureOptions> = {};
  if ('dentalModelLanding' in rules) out.modelLanding = LANDING_OF[Number(rules.dentalModelLanding)] ?? ('?' as ModelLandingDefault);
  if ('lowOutsideAllowed' in rules) out.lowOutsideAllowed = Number(rules.lowOutsideAllowed) !== 0;
  if ('lastResortClearanceMm' in rules) out.lastResortClearanceMm = Number(rules.lastResortClearanceMm);
  return out;
}

/**
 * Why the app cannot take `rules` as a type's, or null: a seeded option the unit's control cannot show (a landing
 * mode that is not 0, 1 or 2, a clearance outside the field's range). Pure, so `shippedTypes.ts` refuses with it.
 */
export function typeRuleProblem(rules: Readonly<Record<string, number | boolean>>): string | null {
  try {
    normalizeDentureOptions(optionsOfRules(rules));
    return null;
  } catch (error) {
    return `its pinned denture option cannot start a unit's control: ${(error as Error).message}`;
  }
}

const byProfile = new Map<string, GenerateRules>();
const settingsSeeds = new Map<string, Partial<Record<'scatterAngle', number>>>();
const optionsSeeds = new Map<string, Partial<DentureOptions>>();

/** Remember a loaded type's pinned rules: the ones its jobs carry, and the ones that seed a new unit's controls. */
export function rememberTypeRules(profileId: string, rules: Readonly<Record<string, number | boolean>>): void {
  const own = Object.fromEntries(Object.entries(rules).filter(([name]) => !UNIT_OWNED_RULES.includes(name)));
  const angle = rules.overhangAngleDeg;
  const options = optionsOfRules(rules);
  const put = <T extends object>(map: Map<string, T>, value: T) => (Object.keys(value).length > 0 ? map.set(profileId, value) : map.delete(profileId));
  put(byProfile, own as GenerateRules);
  put(settingsSeeds, typeof angle === 'number' ? { scatterAngle: angle } : {});
  put(optionsSeeds, options);
}

/** The rules `profileId`'s type puts in its jobs, or none (never a unit-owned one). */
export const typeRulesOf = (profileId: string | undefined): GenerateRules => (profileId === undefined ? {} : byProfile.get(profileId) ?? {});

/** The unit settings a new unit of `profileId`'s type starts from (its pinned Overhang angle), or none. */
export const typeSettingsSeedOf = (profileId: string | undefined): Partial<Record<'scatterAngle', number>> => (profileId === undefined ? {} : settingsSeeds.get(profileId) ?? {});

/** The denture options a new unit of `profileId`'s type starts from (its pinned option rules), or none. */
export const typeOptionsSeedOf = (profileId: string | undefined): Partial<DentureOptions> => (profileId === undefined ? {} : optionsSeeds.get(profileId) ?? {});
