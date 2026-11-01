import type { GenerateRules } from '@mixo-geocore/host/supports/generateRules';
import type { PrintUnit } from '../../state/project';

/*
 * The engine rules a denture unit is built, scanned and checked with. Today the engine defaults: every denture
 * call reads this one function, so the denture settings section has a single place to map onto the rules.
 */
export function dentureRulesOf(_unit: Pick<PrintUnit, 'denture'> | undefined): GenerateRules {
  return {};
}
