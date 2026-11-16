import type { TriangleMesh } from '@mixo-geocore/host/core/analysis/types';

/*
 * One job: area-weighted vertex normals for an indexed triangle mesh. Renderer-free, and pure, so
 * it can be tested without a canvas.
 *
 * It exists because the editing code needs normals the three.js view gets for free from
 * `computeVertexNormals()`. The Babylon view could ask `VertexData.ComputeNormals` for them, but
 * then the SIGN of every normal would depend on a convention inside a renderer, and these normals
 * are not for shading: `zonedVertices` compares them against each zone stamp's own normal to decide
 * which vertices a brush dab covers. A flipped normal there does not look wrong, it silently paints
 * the wrong side of the model.
 *
 * The cross product is `(c - b) x (a - b)` -- the same one `enginePick.ts` uses for a picked
 * triangle's normal, and the same one three.js uses, so all three agree by construction rather
 * than by luck. Face normals are NOT normalised before they are accumulated: their length is twice
 * the triangle's area, which is exactly the area weighting.
 */
export function vertexNormals(mesh: TriangleMesh): Float32Array {
  const { positions, indices } = mesh;
  const normals = new Float32Array(positions.length);
  for (let t = 0; t + 2 < indices.length; t += 3) {
    const a = indices[t]! * 3;
    const b = indices[t + 1]! * 3;
    const c = indices[t + 2]! * 3;
    const ux = positions[c]! - positions[b]!;
    const uy = positions[c + 1]! - positions[b + 1]!;
    const uz = positions[c + 2]! - positions[b + 2]!;
    const vx = positions[a]! - positions[b]!;
    const vy = positions[a + 1]! - positions[b + 1]!;
    const vz = positions[a + 2]! - positions[b + 2]!;
    const nx = uy * vz - uz * vy;
    const ny = uz * vx - ux * vz;
    const nz = ux * vy - uy * vx;
    for (const at of [a, b, c]) {
      normals[at] += nx;
      normals[at + 1] += ny;
      normals[at + 2] += nz;
    }
  }
  for (let i = 0; i < normals.length; i += 3) {
    const length = Math.hypot(normals[i]!, normals[i + 1]!, normals[i + 2]!);
    if (length > 0) {
      normals[i] /= length;
      normals[i + 1] /= length;
      normals[i + 2] /= length;
    }
  }
  return normals;
}
