import type { TriangleMesh } from '@mixo-geocore/host/core/analysis/types';
import { tokenCss } from '../../ui/tokenColour';
import type { DentureMesh } from '../engine/dentureCore';
import { addOnFaceMask } from './partRoles';

const masks = new WeakMap<Uint32Array, Uint8Array | undefined>();

/**
 * Which faces of a denture's model are add-on parts, and the colour to tint them: the viewport's
 * input for that tint, or undefined when the build has none (a one-part file, or a build still
 * running). The face mask is worked out once per build.
 */
export interface AddOnTint {
  /** 1 per tinted face of the unit's model, in its own triangle order. */
  mask: Uint8Array;
  /** `--part-addon`, as `#rrggbb`. */
  colour: string;
}

/*
 * THIS RETURNS DATA, NOT A VIEWPORT NODE, and that is the point of it.
 *
 * It used to return `<FaceTintLayer …/>` -- an r3f element -- which made `unitTint` the one prop of
 * the 3D view that no second renderer could ever draw: the INTERFACE was bound to three.js, not
 * just the implementation. A mask and a colour are what the tint actually is, and each view draws
 * it with its own geometry (`FaceTintLayer` in three, `babylon/faceTint.ts` in Babylon).
 */
export function dentureAddOnTint(mesh: TriangleMesh, built: DentureMesh | undefined): AddOnTint | undefined {
  const parts = built?.dentureParts;
  if (!parts || parts.parts.length < 2) return undefined;
  if (!masks.has(parts.faceParts)) masks.set(parts.faceParts, addOnFaceMask(parts, mesh.indices.length / 3));
  const mask = masks.get(parts.faceParts);
  return mask ? { mask, colour: tokenCss('--part-addon') } : undefined;
}
