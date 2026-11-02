import type { Vector } from '@mixo-geocore/host/core/vec3';
import type { RuleReason } from './ruleSpots';

/*
 * Splits the check's overhang spots of a denture into the ones the denture rules deliberately leave unsupported
 * (shown grey, "accepted by rule", one row per reason) and the real problems (shown as before). The decision is
 * the engine's masks (`ruleSpots.ts`); this only groups what it said.
 */

export interface AcceptedGroup {
  reason: RuleReason;
  /** Every accepted spot of this reason (unit-local), the first is where Show me frames. */
  points: Vector[];
}

/** The order the rows are listed in. */
const ORDER: readonly RuleReason[] = ['outside-allowed', 'no-support', 'rim'];

/** `reasons[k]` is the reason of `spots[k]` (null: a real problem). Returns the real ones and the accepted groups. */
export function splitByRule<S extends { position: Vector }>(spots: readonly S[], reasons: readonly (RuleReason | null)[]): { real: S[]; accepted: AcceptedGroup[] } {
  const real: S[] = [];
  const grouped = new Map<RuleReason, Vector[]>();
  spots.forEach((spot, k) => {
    const reason = reasons[k] ?? null;
    if (!reason) return void real.push(spot);
    grouped.set(reason, [...(grouped.get(reason) ?? []), spot.position]);
  });
  return { real, accepted: ORDER.filter((reason) => grouped.has(reason)).map((reason) => ({ reason, points: grouped.get(reason)! })) };
}
