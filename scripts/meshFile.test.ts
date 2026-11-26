import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { describe, expect, it } from 'vitest';
import type { TriangleMesh } from '@mixo-geocore/host/core/analysis/types';
import { joinMeshes, readMeshFile } from './meshFile';
import { parseStl } from './node-engine';

/** Meshes as one GLB, the way any exporter would write a scan (GLTFExporter needs a FileReader Node lacks). */
async function glbOf(meshes: readonly TriangleMesh[]): Promise<Uint8Array> {
  const root = new THREE.Group();
  for (const mesh of meshes) {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(mesh.positions, 3));
    geometry.setIndex(new THREE.BufferAttribute(mesh.indices, 1));
    root.add(new THREE.Mesh(geometry, new THREE.MeshBasicMaterial()));
  }
  const host = globalThis as unknown as { FileReader?: unknown };
  host.FileReader ??= class { result: ArrayBuffer | null = null; onloadend: (() => void) | null = null;
    async readAsArrayBuffer(blob: Blob) { this.result = await blob.arrayBuffer(); this.onloadend?.(); } };
  return new Uint8Array(await new GLTFExporter().parseAsync(root, { binary: true }) as ArrayBuffer);
}

const bounds = (m: TriangleMesh) => [0, 1, 2].map((axis) => {
  let lo = Infinity; let hi = -Infinity;
  for (let k = axis; k < m.positions.length; k += 3) { lo = Math.min(lo, m.positions[k]!); hi = Math.max(hi, m.positions[k]!); }
  return [lo, hi];
});

describe('a scan file of any format the app imports, as one mesh', () => {
  const stl = readFileSync(resolve('docs/dental-reference/reference-aligner.stl'));
  const fromStl = parseStl(stl);

  it('reads the same scan as GLB into the same mesh, in the same frame, as its STL', async () => {
    const fromGlb = await readMeshFile(await glbOf([fromStl]), 'scan.glb');
    expect(fromGlb.indices.length).toBe(fromStl.indices.length);
    const a = bounds(fromStl).flat();
    bounds(fromGlb).flat().forEach((v, k) => expect(v).toBeCloseTo(a[k]!, 4));
  });

  it('joins a glTF scene of several meshes into one case', async () => {
    const half = { positions: fromStl.positions, indices: fromStl.indices };
    const joined = await readMeshFile(await glbOf([half, half]), 'two.glb');
    expect(joined.indices.length).toBe(2 * fromStl.indices.length);
    expect(joined.indices.reduce((a, b) => Math.max(a, b), 0)).toBe(joined.positions.length / 3 - 1);
  });

  it('refuses in words a file the app cannot open, and a .gltf whose buffers are elsewhere', async () => {
    await expect(readMeshFile(new Uint8Array(4), 'scan.obj')).rejects.toThrow(/not a model file the app opens/);
    const external = new TextEncoder().encode(JSON.stringify({ asset: { version: '2.0' }, buffers: [{ uri: 'scan.bin', byteLength: 36 }],
      bufferViews: [{ buffer: 0, byteLength: 36 }], accessors: [{ bufferView: 0, componentType: 5126, count: 3, type: 'VEC3', min: [0, 0, 0], max: [1, 1, 0] }],
      meshes: [{ primitives: [{ attributes: { POSITION: 0 } }] }], nodes: [{ mesh: 0 }], scenes: [{ nodes: [0] }], scene: 0 }));
    await expect(readMeshFile(external, 'scan.gltf')).rejects.toThrow(/export it as one \.glb/);
  });

  it('moves each joined mesh past the vertices before it', () => {
    const tri = { positions: new Float32Array(9), indices: new Uint32Array([0, 1, 2]) };
    expect([...joinMeshes([tri, tri]).indices]).toEqual([0, 1, 2, 3, 4, 5]);
  });
});
