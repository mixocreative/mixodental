import type { GenerateRules } from '@mixo-geocore/host/supports/generateRules';
import { defaultSupportSettings } from '@mixo-geocore/host/core/supports/settings';
import type { PrintUnit } from '../../state/project';
import { DEFAULT_DENTURE_OPTIONS, type DentureOptions } from './dentureOptions';
import { typeRulesOf } from '../../dentalTypes/typeRules';

/*
 * The engine rules a denture unit is scanned, placed, built and checked with: its denture settings mapped onto
 * the rule names (mixo-geocore docs/rules.md). Only a value that differs from the engine default is sent, so a
 * unit at the defaults builds exactly as the batch does.
 *   modelLanding        -> dentalModelLanding 0 off / 1 lowest points and islands / 2 any left-out tip
 *   lowOutsideAllowed   -> lowOutsideAllowed 1 anywhere but a no-support zone (default) / 0 only in the allowed area or near the rim
 *   lastResortClearance -> lastResortClearanceMm (default 1.0)
 * The unit's one Overhang angle setting (scatterAngle) is also the denture's global rule overhangAngleDeg: sent only when it
 * differs from the default (45), so a unit at the defaults builds exactly as the batch does. One setting, every stream inherits it.
 */

const LANDING_RULE = { off: 0, lows: 1, any: 2 } as const;

export function rulesOfOptions(options: Readonly<DentureOptions>): GenerateRules {
  return {
    ...(options.modelLanding !== DEFAULT_DENTURE_OPTIONS.modelLanding ? { dentalModelLanding: LANDING_RULE[options.modelLanding] } : {}),
    ...(options.lowOutsideAllowed !== DEFAULT_DENTURE_OPTIONS.lowOutsideAllowed ? { lowOutsideAllowed: options.lowOutsideAllowed ? 1 : 0 } : {}),
    ...(options.lastResortClearanceMm !== DEFAULT_DENTURE_OPTIONS.lastResortClearanceMm ? { lastResortClearanceMm: options.lastResortClearanceMm } : {}),
  };
}

/** The Overhang angle of a unit's settings when it is not the default (the rule overhangAngleDeg), else nothing. */
export function overhangRuleOf(settings: PrintUnit['settings'] | undefined): GenerateRules {
  const angle = (settings as { scatterAngle?: unknown } | undefined)?.scatterAngle;
  return typeof angle === 'number' && Number.isFinite(angle) && angle !== defaultSupportSettings.scatterAngle ? { overhangAngleDeg: angle } : {};
}

/**
 * The rules of a unit: its type's pinned rules (a saved type's, `typeRules.ts`), then its stored options and its Overhang
 * angle - the four rules a type may NOT pin, so neither can hide the other. At the defaults with a built-in type: the
 * engine rules unchanged.
 */
export function dentureRulesOf(unit: Pick<PrintUnit, 'denture'> & Partial<Pick<PrintUnit, 'settings'>> | undefined, profileId?: string, settings?: PrintUnit['settings']): GenerateRules {
  // `profileId` and `settings`: Step 1 scans the type being chosen with the settings it will start from (a saved type
  // may seed the Overhang angle), which are not yet the unit's accepted ones - the scan must use what the build will.
  return { ...typeRulesOf(profileId ?? unit?.denture?.policy.profileId), ...rulesOfOptions(unit?.denture?.options ?? DEFAULT_DENTURE_OPTIONS), ...overhangRuleOf(settings ?? unit?.settings) };
}
