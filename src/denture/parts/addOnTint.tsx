import type { ReactNode } from 'react';
import type { TriangleMesh } from '@mixo-geocore/host/core/analysis/types';
import { tokenColour } from '../../ui/tokenColour';
import type { DentureMesh } from '../engine/dentureCore';
import { FaceTintLayer } from '../../components/viewport/FaceTintLayer';
import { addOnFaceMask } from './partRoles';

const masks = new WeakMap<Uint32Array, Uint8Array | undefined>();

/**
 * The viewport node that tints a denture's add-on parts, or undefined when the build has none (a one-part file, or a
 * build still running). The face mask is worked out once per build. Input: the unit's model and its current build.
 */
export function dentureAddOnTint(mesh: TriangleMesh, built: DentureMesh | undefined): ReactNode | undefined {
  const parts = built?.dentureParts;
  if (!parts || parts.parts.length < 2) return undefined;
  if (!masks.has(parts.faceParts)) masks.set(parts.faceParts, addOnFaceMask(parts, mesh.indices.length / 3));
  const mask = masks.get(parts.faceParts);
  return mask ? <FaceTintLayer mesh={mesh} mask={mask} colour={tokenColour('--part-addon')} /> : undefined;
}
