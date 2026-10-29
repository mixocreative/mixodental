import { readFileSync } from 'node:fs';
import { BufferGeometry } from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { TriangleMesh } from '@mixo-geocore/host/core/analysis/types';

/*
 * The knot fixture exactly as the recorded parity goldens saw it: three.js STLLoader, rotateX(-PI/2),
 * mergeVertices(1e-4), the import the TS oracle used (and the Rust import up to engine 11, bit for bit).
 * Its 1e-4 mm grid collapsed 282 of the knot's triangles (two corners in one cell); the engine 12
 * import (proximity weld) keeps them as distinct, non-degenerate faces, so its vertices differ.
 * Tests of the functions after import (picking, normals, overlay refine) feed this mesh so their
 * recorded face ids and outputs stay comparable; the import itself is tested
 * against the same oracle in src/state/weldParity.test.ts.
 */
export function knotAsRecorded(): TriangleMesh {
  const bytes = readFileSync('scripts/fixtures/knot.stl');
  const geometry = new STLLoader().parse(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer).rotateX(-Math.PI / 2);
  const positionsOnly = new BufferGeometry();
  positionsOnly.setAttribute('position', geometry.getAttribute('position').clone());
  const welded = mergeVertices(positionsOnly, 1e-4);
  return { positions: new Float32Array(welded.getAttribute('position').array), indices: new Uint32Array(welded.index!.array) };
}
