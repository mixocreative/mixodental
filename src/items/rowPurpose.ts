// Copyright (c) Mixo Creative.

import { DENTURE_PROFILE_ID } from '../denture/jobKind';
import type { PrintUnit } from '../state/project';

/**
 * WHAT ONE ROW IS, from the two places that can know it.
 *
 * THE UNIT'S OWN WORK WINS (Fable's end-to-end audit, 2026-11-23). A unit that has been through the flow carries the
 * type it was BUILT with - `dental.profileId` when an orientation was accepted, `denture.policy.profileId` when a
 * denture job was - and the row must name that type, or it names numbers its supports were not made with. With one
 * type per category that could not happen; with saved types it did: Auto-gen under "Check aligner", then picking
 * Generic on the row, left "94 supports placed" under the wrong name. Changing the type of a worked row is
 * therefore an ACTION with a confirmation (App `setRowPurpose`: it removes the old work, undoably, as Exit does), and
 * this read only ever has one answer for a unit with work on it.
 *
 * `chosen` - the row's own control or `Set all` - answers for a unit with no work yet.
 *
 * And a unit with work is never unnamed: the walk caught that at `u5l`+1 (Back out of Step 1 lands on the deck with
 * one worked row, nothing typed into the per-unit map, no Start key), and a reopened project has the same hole - the
 * scene is serialised, the session's answers are not.
 */
export function purposeOfUnit(unit: Pick<PrintUnit, 'dental' | 'denture'>, chosen: string | undefined): string | undefined {
  // A denture unit names ITS type (a saved one too); a policy from before profiles is the reference denture.
  if (unit.denture !== undefined) return unit.denture.policy?.profileId ?? DENTURE_PROFILE_ID;
  // Only a policy that names its profile: an older saved policy without one says nothing rather
  // than guessing a family, which is the whole point of asking in the first place.
  if (unit.dental !== undefined && 'profileId' in unit.dental) return unit.dental.profileId;
  return chosen;
}

/**
 * Whether `unit` carries work made with a dental type - what a type change would have to remove (with its supports,
 * `flow.ts` `exitCommands`). Generic supports on a plain model are not typed work and are left alone.
 */
export const holdsTypedWork = (unit: Pick<PrintUnit, 'dental' | 'denture' | 'dentureRim'>): boolean =>
  unit.denture !== undefined || unit.dental !== undefined || unit.dentureRim !== undefined;

/**
 * The type a row opens with: ITS OWN, never the last row's. The session's profile used to come first, and it is kept
 * on purpose across rows (editingMode `dentalProfile`), so opening row B after row A ran B under A's type - and a
 * reopened project, whose answers are not saved, opened a denture as an aligner. The session's profile is only the
 * fallback for a row nothing names (Fable's audit, 2026-11-23).
 */
export function profileToOpen(unitId: string, purposes: ReadonlyMap<string, string>, sessionProfile: string | undefined, fallback: string): string {
  return purposes.get(unitId) ?? sessionProfile ?? fallback;
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

/**
 * The one type every row is on, or undefined when any row is unanswered or they differ. Set all shows its type list
 * only then: on mixed rows no single type would be a true readout.
 */
export function commonPurpose(units: readonly Pick<PrintUnit, 'id'>[], purposes: ReadonlyMap<string, string>): string | undefined {
  const first = units[0] && purposes.get(units[0].id);
  return first !== undefined && units.every((unit) => purposes.get(unit.id) === first) ? first : undefined;
}
