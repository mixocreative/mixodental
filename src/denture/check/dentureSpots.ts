import type { Vector } from '@mixo-geocore/host/core/vec3';
import type { PrintUnit } from '../../state/project';
import type { DentureClient } from '../engine/dentureClient';
import { dentureRulesOf } from '../settings/dentureRules';
import { splitByRule, type AcceptedGroup } from './acceptedSpots';

/*
 * The denture's side of "Check for unsupported spots": asks the denture worker which of the shared check's overhang
 * spots the denture rules leave unsupported on purpose. A failed or cancelled question leaves every spot a problem:
 * the check never hides a spot it could not judge.
 */

export interface SpotSplit<S> {
  real: S[];
  accepted: AcceptedGroup[];
}

/** `spots` are unit-local. A unit without a denture policy (an aligner) has nothing accepted. */
export async function splitDentureSpots<S extends { position: Vector }>(client: DentureClient, unit: PrintUnit, spots: readonly S[], label: Parameters<DentureClient['classifySpots']>[5]): Promise<SpotSplit<S>> {
  if (!unit.denture || spots.length === 0) return { real: [...spots], accepted: [] };
  const reasons = await client.classifySpots(unit.id, unit.source, unit.denture.policy.profileId, spots.map((spot) => spot.position), dentureRulesOf(unit), label).catch(() => undefined);
  return reasons ? splitByRule(spots, reasons) : { real: [...spots], accepted: [] };
}
