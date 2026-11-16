import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import type { TriangleMesh } from '@mixo-geocore/host/core/analysis/types';
import { vertexNormals } from './vertexNormals';

/*
 * Held against three.js' own `computeVertexNormals()`, not against hand-written numbers, because
 * the point of this module is that the Babylon view gets EXACTLY the normals the three.js view
 * already works with. If the two ever disagree, the zone brush paints different vertices in the
 * two renderers, and that is the kind of difference nobody sees until a print comes out wrong.
 */
function threeNormals(mesh: TriangleMesh): Float32Array {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(mesh.positions, 3));
  geometry.setIndex(new THREE.BufferAttribute(mesh.indices, 1));
  geometry.computeVertexNormals();
  return geometry.getAttribute('normal').array as Float32Array;
}

/** A unit cube's two-triangle top face plus a slanted skirt, so vertices are shared and weighted. */
const MESH: TriangleMesh = {
  positions: Float32Array.from([
    0, 0, 0, 10, 0, 0, 10, 0, 10, 0, 0, 10, // a flat square on y = 0
    0, 6, 0, 10, 6, 0, // a raised edge, so the shared vertices get two very different faces
  ]),
  indices: Uint32Array.from([
    0, 1, 2, 0, 2, 3, // the square
    0, 4, 5, 0, 5, 1, // the skirt, sharing vertices 0 and 1
  ]),
};

describe('area-weighted vertex normals', () => {
  it('matches three.js on a mesh with shared vertices and faces of different areas', () => {
    const mine = vertexNormals(MESH);
    const theirs = threeNormals(MESH);
    expect(mine.length).toBe(theirs.length);
    for (let i = 0; i < mine.length; i += 1) expect(mine[i]).toBeCloseTo(theirs[i]!, 5);
  });

  it('gives a unit normal to every vertex a triangle touches', () => {
    for (const mesh of [MESH, { positions: MESH.positions, indices: Uint32Array.from([0, 1, 2]) }]) {
      const normals = vertexNormals(mesh);
      const touched = new Set<number>();
      for (const index of mesh.indices) touched.add(index);
      for (const vertex of touched) {
        const at = vertex * 3;
        expect(Math.hypot(normals[at]!, normals[at + 1]!, normals[at + 2]!)).toBeCloseTo(1, 6);
      }
    }
  });

  it('weights by area rather than by face count, which is the whole reason for the formula', () => {
    // Vertex 0 is shared by the big square and the skirt. If faces were normalised before being
    // added, its normal would sit halfway between them; area weighting pulls it toward the larger.
    const normals = vertexNormals(MESH);
    const unweighted = [0, 0, 0];
    const faces: Array<[number, number, number]> = [[0, 1, 2], [0, 2, 3], [0, 4, 5], [0, 5, 1]];
    for (const [a, b, c] of faces) {
      const p = MESH.positions;
      const u = [p[c * 3]! - p[b * 3]!, p[c * 3 + 1]! - p[b * 3 + 1]!, p[c * 3 + 2]! - p[b * 3 + 2]!];
      const v = [p[a * 3]! - p[b * 3]!, p[a * 3 + 1]! - p[b * 3 + 1]!, p[a * 3 + 2]! - p[b * 3 + 2]!];
      const n = [u[1]! * v[2]! - u[2]! * v[1]!, u[2]! * v[0]! - u[0]! * v[2]!, u[0]! * v[1]! - u[1]! * v[0]!];
      const l = Math.hypot(n[0]!, n[1]!, n[2]!) || 1;
      for (let k = 0; k < 3; k += 1) unweighted[k]! += n[k]! / l;
    }
    const l = Math.hypot(...unweighted) || 1;
    const theirs = unweighted.map((v) => v / l);
    const mine = [normals[0]!, normals[1]!, normals[2]!];
    // Compare the whole vector: picking one component can land on an axis where both are zero,
    // and then the assertion passes while proving nothing.
    const apart = Math.max(...mine.map((v, k) => Math.abs(v - theirs[k]!)));
    expect(apart).toBeGreaterThan(0.01);
  });

  it('leaves an unreferenced vertex at zero rather than inventing a direction', () => {
    const normals = vertexNormals({ positions: MESH.positions, indices: Uint32Array.from([0, 1, 2]) });
    expect([normals[12], normals[13], normals[14]]).toEqual([0, 0, 0]);
  });
});
