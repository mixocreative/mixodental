/*
 * ONE JOB: a saved type's pinned rules in the app (WORKBENCH-TABS-PLAN E1, the rules half) - which ones a type may pin,
 * and the ones a loaded type pinned, by profile id, for every job on it.
 *
 * WHY SOME ARE REFUSED. Four rules are each unit's own settings in the app (`denture/settings/dentureRules.ts`): the
 * Overhang angle and the three denture options. A type that put one in its jobs would have its number used while the
 * unit's control showed another - a control that lies. So a type's jobs carry every OTHER rule it pins; the Overhang
 * angle SEEDS the unit's control instead (`SEEDED_RULES`), and the three options are refused when the type loads.
 * `typeRules.test.ts` fails if `dentureRulesOf` gains a rule `UNIT_OWNED_RULES` does not name.
 *
 * WHY THE MAIN THREAD IS ENOUGH. Rules travel IN each job (`dentureRulesOf` builds them on the main thread), unlike the
 * graphs, which are engine slots each realm sets itself (`typeGraphs.ts`).
 */
import type { GenerateRules } from '@mixo-geocore/host/supports/generateRules';

/** The rules the unit's own settings set in the app: a type does not put these in a job itself. */
export const UNIT_OWNED_RULES: readonly string[] = ['overhangAngleDeg', 'dentalModelLanding', 'lowOutsideAllowed', 'lastResortClearanceMm'];

/**
 * The unit-owned rules a type may still pin, because they SEED the unit's control instead: the type's number becomes the
 * control's starting value for a new unit of that type, the control shows it, and from there the unit owns it. The
 * Overhang angle is the one with a unit setting to seed (`scatterAngle`); the three denture options stay refused.
 */
export const SEEDED_RULES: Readonly<Record<string, 'scatterAngle'>> = { overhangAngleDeg: 'scatterAngle' };

const byProfile = new Map<string, GenerateRules>();
const seeds = new Map<string, Partial<Record<'scatterAngle', number>>>();

/** Remember a loaded type's pinned rules for its jobs (none: its jobs run the engine's) and its settings seeds. */
export function rememberTypeRules(profileId: string, rules: Readonly<Record<string, number | boolean>>): void {
  const own = Object.fromEntries(Object.entries(rules).filter(([name]) => !UNIT_OWNED_RULES.includes(name)));
  const seed = Object.fromEntries(Object.entries(rules).filter(([name, v]) => name in SEEDED_RULES && typeof v === 'number').map(([name, v]) => [SEEDED_RULES[name], v]));
  if (Object.keys(own).length > 0) byProfile.set(profileId, own as GenerateRules);
  else byProfile.delete(profileId);
  if (Object.keys(seed).length > 0) seeds.set(profileId, seed);
  else seeds.delete(profileId);
}

/** The rules `profileId`'s type puts in its jobs, or none (never a unit-owned one). */
export const typeRulesOf = (profileId: string | undefined): GenerateRules => (profileId === undefined ? {} : byProfile.get(profileId) ?? {});

/** The unit settings a new unit of `profileId`'s type starts from (its seeded rules), or none. */
export const typeSettingsSeedOf = (profileId: string | undefined): Partial<Record<'scatterAngle', number>> => (profileId === undefined ? {} : seeds.get(profileId) ?? {});
