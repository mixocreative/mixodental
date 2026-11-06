import { describe, expect, it } from 'vitest';
import { diagnose_mesh, repair_mesh } from '../../vendor/mixo-geocore/pkg-node/mixo_geometry_wasm.js';
import { diagnoseImported } from './prepareImport';

/*
 * THE VERDICT AGAINST THE REAL ENGINE, not a stand-in. `diagnoseImported` reduces a per-body report
 * to the five facts that cross the worker boundary, and the only way to know the mapping is right is
 * to hand the real engine real meshes. `src/items/rowState.test.ts` covers what the row then SAYS;
 * this covers whether the facts arriving are true.
 */
// The real pair: the decoder's engine type wants both, and handing it the real ones beats a cast.
const engine = { diagnose_mesh, repair_mesh };
const mesh = (positions: number[], indices: number[]) =>
  ({ positions: new Float32Array(positions), indices: new Uint32Array(indices) });

/** A closed tetrahedron: four faces, every edge shared by exactly two. */
const TETRA_POINTS = [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1];
const TETRA_FACES = [0, 2, 1, 0, 1, 3, 0, 3, 2, 1, 2, 3];

describe('the import verdict, against the real engine', () => {
  it('calls a closed tetrahedron watertight, with no rim', () => {
    const found = diagnoseImported(mesh(TETRA_POINTS, TETRA_FACES), engine);
    expect(found.watertight).toBe(true);
    expect(found.boundaryLoops).toBe(0);
    expect(found.longestRimMm).toBe(0);
    expect(found.nonManifoldEdges).toBe(0);
    expect(found.bodies).toBe(1);
  });

  it('reports an open rim on a single triangle, and measures it', () => {
    // One triangle is three boundary edges: one loop, and its length is the perimeter.
    const found = diagnoseImported(mesh([0, 0, 0, 3, 0, 0, 0, 4, 0], [0, 1, 2]), engine);
    expect(found.watertight).toBe(false);
    expect(found.boundaryLoops).toBe(1);
    // 3 + 4 + 5, the right triangle's perimeter: the rim length is real millimetres, not a count.
    expect(found.longestRimMm).toBeCloseTo(12, 3);
  });

  it('separates two bodies, and reports the rim of each', () => {
    const far = TETRA_POINTS.map((value, at) => (at % 3 === 0 ? value + 50 : value));
    const found = diagnoseImported(
      mesh([...TETRA_POINTS, ...far], [...TETRA_FACES, ...TETRA_FACES.map((i) => i + 4)]),
      engine,
    );
    expect(found.bodies).toBe(2);
    expect(found.watertight).toBe(true);
  });

  /*
   * THE CASE THE 18 REAL SCANS LAND IN, and the reason the row cannot key on holes alone: three
   * triangles sharing one edge makes that edge non-manifold while leaving rims open too. What matters
   * here is that `watertight` is false and `nonManifoldEdges` is carried, because
   * `scripts/measure-rim-loops.mjs` found 8 of 18 scans not watertight with ZERO open rims.
   */
  it('carries the non-manifold count, which is what repair is actually for on this path', () => {
    const found = diagnoseImported(
      mesh([0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, -1, 0], [0, 1, 2, 0, 1, 3, 0, 1, 4]),
      engine,
    );
    expect(found.watertight).toBe(false);
    expect(found.nonManifoldEdges).toBeGreaterThan(0);
  });
});
