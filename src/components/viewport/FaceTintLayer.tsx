import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import type { TriangleMesh } from '@mixo-geocore/host/core/analysis/types';
import { faceMaskOverlay } from './faceMaskOverlay';

/** How strongly the tint shows over the model (subtle: the model colour stays readable). */
export const FACE_TINT_OPACITY = 0.32;

/**
 * A subtle tint over some faces of a model (the denture's add-on parts, Step 2): the faces of `mask` (1 = tinted face of
 * `mesh`, unit-local) drawn once more, see-through, in `colour` (a CSS token as a number). Rendered inside the unit's
 * group, so it follows the model; never picked. The overlay geometry is the engine's (`face_mask_overlay`).
 */
export function FaceTintLayer({ mesh, mask, colour }: { mesh: TriangleMesh; mask: Uint8Array; colour: number }) {
  const object = useMemo(() => {
    const { positions, normals } = faceMaskOverlay(mesh, mask);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
    const material = new THREE.MeshBasicMaterial({ color: colour, transparent: true, opacity: FACE_TINT_OPACITY, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1, side: THREE.DoubleSide });
    const tint = new THREE.Mesh(geometry, material);
    tint.name = 'face-tint';
    tint.raycast = () => undefined;
    return tint;
  }, [colour, mask, mesh]);
  useEffect(() => () => {
    object.geometry.dispose();
    (object.material as THREE.Material).dispose();
  }, [object]);
  return <primitive object={object} />;
}
