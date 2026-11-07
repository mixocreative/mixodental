import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import type { PlateSize } from '@mixo-geocore/editing/arrange';
import { usePreviewColours } from './sceneColours';

/** The printer's build plate as a rectangle on the floor (x width, z depth, centred on the origin), where "Arrange plate" packs. */
/*
 * RETIRED, AND KEPT ON PURPOSE. Nothing passes `plate` to `ObjectViewport` any more, so this never
 * renders: exports are per-object, the slicer packs the real plate, and drawing a build volume this
 * app does not own promised something it could not keep.
 *
 * It is the seam, not dead weight. Reviving plate packing is: pass `plate` here again, give
 * `usePlateArrange` a printer from `src/plate/printerProfiles.ts` (still tested), and call
 * `arrangeOnPlate` instead of `arrangeCommands`. Three call sites, nothing rebuilt - which is the
 * whole reason it was left standing rather than deleted.
 */
export function PlateOutline({ plate }: { plate: PlateSize }) {
  const preview = usePreviewColours();
  const geometry = useMemo(() => {
    const x = plate.widthMm / 2, z = plate.depthMm / 2;
    // A hair above the grid so the line never flickers through it.
    return new THREE.BufferGeometry().setFromPoints([[-x, z], [x, z], [x, -z], [-x, -z]].map(([px, pz]) => new THREE.Vector3(px, 0.02, pz)));
  }, [plate.widthMm, plate.depthMm]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return <lineLoop name="plate-outline" geometry={geometry} renderOrder={1}>
    <lineBasicMaterial color={preview.plate} />
  </lineLoop>;
}
