import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import type { OrientationLayer } from '../../dental/orientationEvidence';

/* Step 1 evidence layers as three.js meshes. Rendered inside the model's own group, so they follow its transform. Display only. */

/** One mesh per layer, named by the engine's name and coloured by it. Pure: the caller owns disposal through the component. */
export function debugMeshes(layers: readonly OrientationLayer[]): THREE.Mesh[] {
  return layers.map((layer) => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(layer.positions, 3));
    if (layer.indices.length > 0) geometry.setIndex(new THREE.BufferAttribute(layer.indices, 1));
    const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: layer.color, side: THREE.DoubleSide }));
    mesh.name = layer.name;
    mesh.raycast = () => undefined;
    return mesh;
  });
}

export function DebugLayerMeshes({ layers }: { layers: readonly OrientationLayer[] }) {
  const meshes = useMemo(() => debugMeshes(layers), [layers]);
  useEffect(() => () => meshes.forEach((mesh) => {
    mesh.geometry.dispose();
    (mesh.material as THREE.Material).dispose();
  }), [meshes]);
  return <>{meshes.map((mesh) => <primitive key={mesh.name} object={mesh} />)}</>;
}
