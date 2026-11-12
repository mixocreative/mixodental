import type { DenturePart, PartRole } from '@mixo-geocore/host/dental/dentureParts';
import type { DentalPlacementResult } from '@mixo-geocore/host/dental/placement';
import type { DentureParts } from '../engine/dentureCore';

/*
 * The parts of a multi-part dental file as the parts list shows them (Round B, PD.7, P5.15; aligners since engine 56): the
 * engine splits the file and gives each part a role (the largest by volume is the target and gets the dental tips; a part that
 * overlaps or touches it is fused: printed with it, generic tips on its exposed faces only; a free smaller part is an add-on
 * with generic tips on its own faces; a part smaller across than the debris rule gets none). Nothing is decided here: this only
 * orders the engine's list and finds the faces to tint.
 */

/** The list's words per role (English keys). */
export const ROLE_LABEL: Record<PartRole, string> = { target: 'Target', fused: 'Fused', addOn: 'Add-on', debris: 'Debris', unknown: 'Unrecognised part' };
// `unknown` sorts last: `debris` says "ignore this", `unknown` says "this build cannot say what it
// is", which is less information rather than more, and it must never outrank a part with a role.
const ROLE_ORDER: Record<PartRole, number> = { target: 0, fused: 1, addOn: 2, debris: 3, unknown: 4 };

/** The list shows only when the file has more than one part. */
export const showsPartsList = (parts: DentureParts | undefined): parts is DentureParts => (parts?.parts.length ?? 0) > 1;

/** Target first, then fused parts, add-ons, debris; larger parts first within a role. */
export function orderedParts(parts: readonly DenturePart[]): DenturePart[] {
  return [...parts].sort((a, b) => ROLE_ORDER[a.role] - ROLE_ORDER[b.role] || b.volumeMm3 - a.volumeMm3 || a.id - b.id);
}

/** How many parts of each role. */
export function roleCounts(parts: readonly DenturePart[]): Record<PartRole, number> {
  const counts: Record<PartRole, number> = { target: 0, fused: 0, addOn: 0, debris: 0, unknown: 0 };
  for (const part of parts) counts[part.role] += 1;
  return counts;
}

/** 1 on every face of a part with generic tips (add-on or fused: the faces the viewport tints); undefined when there is none or the face list does not match the model. */
export function addOnFaceMask(parts: DentureParts, faceCount: number): Uint8Array | undefined {
  const addOns = new Set(parts.parts.filter((part) => part.role === 'addOn' || part.role === 'fused').map((part) => part.id));
  if (addOns.size === 0 || parts.faceParts.length !== faceCount) return undefined;
  const mask = new Uint8Array(faceCount);
  parts.faceParts.forEach((part, face) => { if (addOns.has(part)) mask[face] = 1; });
  return mask;
}

/** The file's parts an aligner placement reports (engine 56, `filterDentalPlacement`), or undefined (a legacy area, an older engine). */
export function placementParts(result: Partial<DentalPlacementResult> | undefined): DentureParts | undefined {
  return result?.parts;
}
