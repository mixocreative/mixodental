// Three.js GLB builder for the Step 1 evidence layers (batch review only). Data comes from
// src/dental/orientationEvidence.ts, which stays renderer-free so the app can share it.
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import type { JobTransform } from '@mixo-geocore/host/core/jobs';
import type { OrientationLayer } from '../../src/dental/orientationEvidence';

/** A review layer: triangles (unindexed when `indices` is empty), or with `lines` line segments (two points each). */
export type ReviewLayer = OrientationLayer & { lines?: boolean };

/**
 * The companion GLB of the evidence layers in `frame` (the review GLB's frame: its lift and pose
 * rotation, so both load into one scene). Names carry no file or patient data.
 */
export async function orientationGlb(layers: ReviewLayer[], frame: JobTransform): Promise<ArrayBuffer> {
  const scene = new THREE.Group();
  scene.name = 'Step 1 orientation evidence (review only)';
  for (const layer of layers) {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(layer.positions, 3));
    if (layer.indices.length > 0) geometry.setIndex(new THREE.BufferAttribute(layer.indices, 1));
    const visual = layer.lines
      ? new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({ color: layer.color }))
      : new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: layer.color, side: THREE.DoubleSide }));
    visual.name = layer.name;
    scene.add(visual);
  }
  scene.position.set(...frame.position);
  scene.rotation.set(...frame.rotation);
  const root = new THREE.Group();
  root.add(scene);
  // GLTFExporter reads its binary Blob through FileReader, which Node does not provide.
  class BinaryFileReader {
    result: ArrayBuffer | null = null;
    onloadend: (() => void) | null = null;
    async readAsArrayBuffer(blob: Blob): Promise<void> {
      this.result = await blob.arrayBuffer();
      this.onloadend?.();
    }
  }
  const host = globalThis as unknown as { FileReader?: typeof FileReader };
  const prior = host.FileReader;
  if (!prior) host.FileReader = BinaryFileReader as unknown as typeof FileReader;
  try {
    const binary = await new GLTFExporter().parseAsync(root, { binary: true });
    if (!(binary instanceof ArrayBuffer)) throw new Error('Expected binary GLB');
    return binary;
  } finally {
    if (!prior) delete host.FileReader;
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh || object instanceof THREE.LineSegments) {
        object.geometry.dispose();
        (object.material as THREE.Material).dispose();
      }
    });
  }
}
