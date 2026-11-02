import { defaultSupportSettings } from '@mixo-geocore/host/core/supports/settings';

/*
 * The overhang rule defaults the viewer's texts quote (summary.json `ruleDefaults`), so the numbers in the words
 * cannot drift from the engine. The global angle is the host setting every stream inherits (engine 58: the one
 * Overhang angle). The vendored host has no table for the dental rim angle (its default lives in the engine, and in
 * the rule's doc comment in vendor/mixo-geocore/host/supports/generateRules.ts), so it is named once here and
 * ruleDefaults.test.ts fails if that doc comment ever says another number.
 */

/** Engine 57 default of the rule `dentalRimOverhangAngleDeg` (slope from horizontal, degrees). */
export const DENTAL_RIM_OVERHANG_ANGLE_DEG = 60;

export const RULE_DEFAULTS = {
  overhangAngleDeg: defaultSupportSettings.scatterAngle,
  dentalRimOverhangAngleDeg: DENTAL_RIM_OVERHANG_ANGLE_DEG,
} as const;
