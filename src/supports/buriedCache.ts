import type { Vector } from '@mixo-geocore/host/core/vec3';

/*
 * Where the overlap rule last dropped contacts, per unit, in the UNIT frame.
 *
 * Runtime only, never state and never saved: it is derived from the placement, and a placement that
 * runs again replaces it. It exists because the dropped contacts are gone from the unit's record by
 * design — dropping them after placement is what keeps every contact id, and so every saved
 * `deleted`, `overrides` and manual entry, valid — so the check has no other way to learn that an
 * overlap is deliberately unsupported.
 *
 * Stored in the unit frame, mapped once where the placement's orientation is known, so every reader
 * is in the same frame as the check's other findings and no second frame question exists.
 */

const buried = new Map<string, readonly Vector[]>();

/** What the placement of `unitId` left out; `undefined` or empty clears the entry. */
export function rememberBuried(unitId: string, positions: readonly Vector[] | undefined): void {
  if (positions && positions.length > 0) buried.set(unitId, positions);
  else buried.delete(unitId);
}

export function buriedOf(unitId: string): readonly Vector[] | undefined {
  return buried.get(unitId);
}

/** A unit left the scene, or a project was closed: its positions go with it. */
export function forgetBuried(unitId?: string): void {
  if (unitId === undefined) buried.clear();
  else buried.delete(unitId);
}
