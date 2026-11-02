import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import type { PlateSize } from '@mixo-geocore/editing/arrange';
import { usePreviewColours } from './sceneColours';

/** The printer's build plate as a rectangle on the floor (x width, z depth, centred on the origin), where "Arrange plate" packs. */
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
