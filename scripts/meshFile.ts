import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { Object3D } from 'three';
import type { TriangleMesh } from '@mixo-geocore/host/core/analysis/types';
import { gltfRawMeshes } from '../src/state/import';
import { weldRawWithWasm } from '../src/workers/prepareImport';
import { nodeEngine, parseStl } from './node-engine';

/*
 * ONE JOB: a scan file of any format the app imports (STL, GLB, glTF) as ONE welded Y-up mesh, under
 * Node, through the same steps as the app's import (src/components/useImportFiles.ts): STL through
 * Rust, glTF through GLTFLoader's scene graph and the same wasm weld. So the review workbench runs
 * exactly what the app would load - a format the app cannot open is refused here too.
 *
 * TRAP: a glTF scene can hold several meshes, where the app makes one unit each. A review case is ONE
 * scan, so they are joined into one mesh here, as an STL with several shells already is.
 */

/** Throws, in words, on a file the app cannot open or a glTF with no mesh. */
export async function readMeshFile(bytes: Uint8Array, name: string): Promise<TriangleMesh> {
  if (/\.stl$/i.test(name)) return parseStl(bytes, name);
  if (!/\.(glb|gltf)$/i.test(name)) throw new Error(`${name}: not a model file the app opens (STL, GLB or glTF)`);
  const data = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
  // A .gltf whose buffers sit in separate .bin files cannot be read from bytes alone: say so, never a bare fetch error.
  const gltf = await new Promise<{ scene: Object3D }>((done, fail) => new GLTFLoader().parse(data, '', done, (error) =>
    fail(new Error(`${name}: the glTF could not be read (${String((error as Error)?.message ?? error)}). A .gltf with separate .bin files: export it as one .glb`))));
  const meshes = gltfRawMeshes(gltf, name).map((raw) => weldRawWithWasm(raw, nodeEngine).mesh);
  if (meshes.length === 0) throw new Error(`${name} contains no mesh`);
  return meshes.length === 1 ? meshes[0]! : joinMeshes(meshes);
}

/** Several meshes as one: positions end to end, each mesh's indices moved past the ones before. */
export function joinMeshes(meshes: readonly TriangleMesh[]): TriangleMesh {
  const positions = new Float32Array(meshes.reduce((sum, m) => sum + m.positions.length, 0));
  const indices = new Uint32Array(meshes.reduce((sum, m) => sum + m.indices.length, 0));
  let p = 0;
  let i = 0;
  for (const mesh of meshes) {
    positions.set(mesh.positions, p);
    for (let k = 0; k < mesh.indices.length; k += 1) indices[i + k] = mesh.indices[k]! + p / 3;
    p += mesh.positions.length;
    i += mesh.indices.length;
  }
  return { positions, indices };
}
