// Copyright (c) Mixo Creative.

import { DENTURE_PROFILE_ID } from '../denture/jobKind';
import type { PrintUnit } from '../state/project';

/**
 * WHAT ONE ROW IS, from the two places that can know it.
 *
 * `chosen` is the operator's answer for this unit — the row's own control, or `Set all`. It wins,
 * because it is the most recent thing a person said.
 *
 * THE UNIT'S OWN POLICY IS THE FALLBACK, AND LEAVING IT OUT WAS A BUG. A unit that has been through
 * the flow already carries what it is: `dental.profileId` is written when an orientation is accepted,
 * and `denture` when a denture job is. The walk caught it at `u5l`+1 — Back out of Step 1 lands on
 * the deck with one row, that row had been worked on, nothing had been typed into the new per-unit
 * map, so the row counted as UNNAMED and the deck drew no Start key at all. A case re-entered from
 * the workspace, or reopened from a saved project, hit the same hole: the scene is serialised, the
 * session's answers are not.
 *
 * So the row reads the unit, which is the fact, rather than a map of what was said this sitting. The
 * two can never disagree about a unit that has work on it, because only one of them is consulted.
 */
export function purposeOfUnit(unit: Pick<PrintUnit, 'dental' | 'denture'>, chosen: string | undefined): string | undefined {
  if (chosen !== undefined) return chosen;
  if (unit.denture !== undefined) return DENTURE_PROFILE_ID;
  // Only a policy that names its profile: an older saved policy without one says nothing rather
  // than guessing a family, which is the whole point of asking in the first place.
  return unit.dental !== undefined && 'profileId' in unit.dental ? unit.dental.profileId : undefined;
}

/** Every unit's answer, for the deck. Units with no answer are absent, never present-and-undefined. */
export function purposesOf(units: readonly PrintUnit[], chosen: ReadonlyMap<string, string>): ReadonlyMap<string, string> {
  const out = new Map<string, string>();
  for (const unit of units) {
    const purpose = purposeOfUnit(unit, chosen.get(unit.id));
    if (purpose !== undefined) out.set(unit.id, purpose);
  }
  return out;
}
