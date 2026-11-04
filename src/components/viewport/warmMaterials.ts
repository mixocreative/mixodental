import * as THREE from 'three';
import type { PreviewColours } from './sceneColours';

/*
 * Materials of overlays that come and go with the pointer or with each tip preview (the brush ring,
 * the Step 2 tip markers). Three.js frees a shader program when the last material using it is
 * disposed, so a marker or ring made afresh on every mount had its program compiled again each time:
 * 0.3 to 0.7 s per compile in software GL, on every stroke and every preview. These live for the
 * page and are passed as props (React Three Fiber does not dispose objects it did not create).
 */

/*
 * A SUPPORT, DRAWN AS THE CONE IT IS PRINTED AS. It was a sphere, which said "a point was chosen here" but
 * not what would be built there; a support is a tapering pillar that meets the part at its tip, and the
 * reader judging a print angle is judging those pillars. The apex is at the ORIGIN and the body runs along
 * +Y, so placing an instance at the contact point and turning +Y onto the OUTWARD surface normal stands the
 * cone on the model with its tip touching and its body in the air the support would rise through;
 * `TipInstances` does exactly that. Radius 1, height 2, scaled per marker.
 */
export const TIP_MARKER_GEOMETRY = new THREE.ConeGeometry(1, 2, 10).rotateX(Math.PI).translate(0, 1, 0);
const TIP_MATERIALS = {
  plain: new THREE.MeshStandardMaterial({ roughness: 0.65 }),
  remove: new THREE.MeshStandardMaterial({ roughness: 0.65 }),
  ring: new THREE.MeshStandardMaterial({ roughness: 0.65 }),
};

/** The tip markers' shared materials (plain, solid red, grey), coloured from the current preview tokens so a token edit shows at once. */
export function tipMarkerMaterials(preview: PreviewColours): typeof TIP_MATERIALS {
  TIP_MATERIALS.plain.color.set(preview.supportTip);
  TIP_MATERIALS.remove.color.set(preview.remove);
  TIP_MATERIALS.ring.color.set(preview.ring);
  return TIP_MATERIALS;
}

const rings = new Map<string, THREE.MeshBasicMaterial>();

/** The brush or remove ring's material in `color` (one per colour, all one program). */
export function ringMaterial(color: string): THREE.MeshBasicMaterial {
  let material = rings.get(color);
  if (!material) {
    material = new THREE.MeshBasicMaterial({ color, depthTest: false, transparent: true, opacity: 0.85 });
    rings.set(color, material);
  }
  return material;
}
