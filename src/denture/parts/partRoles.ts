import type { DenturePart, PartRole } from '@mixo-geocore/host/dental/dentureParts';
import type { DentureParts } from '../engine/dentureCore';

/*
 * The parts of a multi-part denture file as the parts list shows them (Round B, PD.7, P5.15): the engine splits the
 * file and gives each part a role (the largest by volume is the target and gets the dental tips; a smaller part is an
 * add-on with generic tips on its own faces; a part smaller across than the debris rule gets none). Nothing is decided
 * here: this only orders the engine's list and finds the add-on faces to tint.
 */

/** The list's words per role (English keys). */
export const ROLE_LABEL: Record<PartRole, string> = { target: 'Target', addOn: 'Add-on', debris: 'Debris' };
const ROLE_ORDER: Record<PartRole, number> = { target: 0, addOn: 1, debris: 2 };

/** The list shows only when the file has more than one part. */
export const showsPartsList = (parts: DentureParts | undefined): parts is DentureParts => (parts?.parts.length ?? 0) > 1;

/** Target first, then add-ons, then debris; larger parts first within a role. */
export function orderedParts(parts: readonly DenturePart[]): DenturePart[] {
  return [...parts].sort((a, b) => ROLE_ORDER[a.role] - ROLE_ORDER[b.role] || b.volumeMm3 - a.volumeMm3 || a.id - b.id);
}

/** How many parts of each role. */
export function roleCounts(parts: readonly DenturePart[]): Record<PartRole, number> {
  const counts: Record<PartRole, number> = { target: 0, addOn: 0, debris: 0 };
  for (const part of parts) counts[part.role] += 1;
  return counts;
}

/** 1 on every face of an add-on part (the faces the viewport tints); undefined when there is none or the face list does not match the model. */
export function addOnFaceMask(parts: DentureParts, faceCount: number): Uint8Array | undefined {
  const addOns = new Set(parts.parts.filter((part) => part.role === 'addOn').map((part) => part.id));
  if (addOns.size === 0 || parts.faceParts.length !== faceCount) return undefined;
  const mask = new Uint8Array(faceCount);
  parts.faceParts.forEach((part, face) => { if (addOns.has(part)) mask[face] = 1; });
  return mask;
}
