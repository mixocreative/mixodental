import type { GenerateRules } from '@mixo-geocore/host/supports/generateRules';
import type { PrintUnit } from '../../state/project';
import { DEFAULT_DENTURE_OPTIONS, type DentureOptions } from './dentureOptions';

/*
 * The engine rules a denture unit is scanned, placed, built and checked with: its denture settings mapped onto
 * the rule names (mixo-geocore docs/rules.md). Only a value that differs from the engine default is sent, so a
 * unit at the defaults builds exactly as the batch does.
 *   modelLanding        -> dentalModelLanding 0 off / 1 lowest points and islands / 2 any left-out tip
 *   lowOutsideAllowed   -> lowOutsideAllowed 1 anywhere but a no-support zone (default) / 0 only in the allowed area or near the rim
 *   lastResortClearance -> lastResortClearanceMm (default 1.0)
 */

const LANDING_RULE = { off: 0, lows: 1, any: 2 } as const;

export function rulesOfOptions(options: Readonly<DentureOptions>): GenerateRules {
  return {
    ...(options.modelLanding !== DEFAULT_DENTURE_OPTIONS.modelLanding ? { dentalModelLanding: LANDING_RULE[options.modelLanding] } : {}),
    ...(options.lowOutsideAllowed !== DEFAULT_DENTURE_OPTIONS.lowOutsideAllowed ? { lowOutsideAllowed: options.lowOutsideAllowed ? 1 : 0 } : {}),
    ...(options.lastResortClearanceMm !== DEFAULT_DENTURE_OPTIONS.lastResortClearanceMm ? { lastResortClearanceMm: options.lastResortClearanceMm } : {}),
  };
}

/** The rules of a unit (its stored options, else the defaults: the engine rules unchanged). */
export function dentureRulesOf(unit: Pick<PrintUnit, 'denture'> | undefined): GenerateRules {
  return rulesOfOptions(unit?.denture?.options ?? DEFAULT_DENTURE_OPTIONS);
}
