import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { TriangleMesh } from '@mixo-geocore/host/core/analysis/types';
import { placementMatrix, transformPositions } from '../../scripts/test-support/matrix';
import { REFERENCE_PROFILE } from '../../scripts/test-support/referenceProfile';
import { parseStl } from '../../scripts/test-support/rustImport';
import { orientationEvidence, orientationLayers } from './orientationEvidence';

type Vec = [number, number, number];

/** Closest point distance from `p` to triangle abc (Ericson, Real-Time Collision Detection 5.1.5). */
function pointTriangleDistance(p: Vec, a: Vec, b: Vec, c: Vec): number {
  const sub = (u: Vec, v: Vec): Vec => [u[0] - v[0], u[1] - v[1], u[2] - v[2]];
  const dot = (u: Vec, v: Vec) => u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
  const ab = sub(b, a), ac = sub(c, a), ap = sub(p, a);
  const d1 = dot(ab, ap), d2 = dot(ac, ap);
  let closest: Vec;
  const at = (s: number, t: number): Vec => [a[0] + ab[0] * s + ac[0] * t, a[1] + ab[1] * s + ac[1] * t, a[2] + ab[2] * s + ac[2] * t];
  if (d1 <= 0 && d2 <= 0) closest = a;
  else {
    const bp = sub(p, b), d3 = dot(ab, bp), d4 = dot(ac, bp);
    const cp = sub(p, c), d5 = dot(ab, cp), d6 = dot(ac, cp);
    const vc = d1 * d4 - d3 * d2, vb = d5 * d2 - d1 * d6, va = d3 * d6 - d5 * d4;
    if (d3 >= 0 && d4 <= d3) closest = b;
    else if (d6 >= 0 && d5 <= d6) closest = c;
    else if (vc <= 0 && d1 >= 0 && d3 <= 0) closest = at(d1 / (d1 - d3), 0);
    else if (vb <= 0 && d2 >= 0 && d6 <= 0) closest = at(0, d2 / (d2 - d6));
    else if (va <= 0 && d4 - d3 >= 0 && d5 - d6 >= 0) { const w = (d4 - d3) / (d4 - d3 + (d5 - d6)); closest = [b[0] + (c[0] - b[0]) * w, b[1] + (c[1] - b[1]) * w, b[2] + (c[2] - b[2]) * w]; }
    else { const denom = 1 / (va + vb + vc); closest = at(vb * denom, vc * denom); }
  }
  const d = sub(p, closest);
  return Math.sqrt(dot(d, d));
}

/** Distance from each point to the nearest triangle of `surface` (a 1 mm grid of triangle centroids; 3 mm reach is far beyond the 0.5 mm test). */
function nearestDistances(points: Float32Array, surface: { positions: Float32Array; indices: ArrayLike<number> }): number[] {
  const { positions, indices } = surface;
  const cell = 1;
  const key = (x: number, y: number, z: number) => `${x},${y},${z}`;
  const grid = new Map<string, number[]>();
  const triangles = indices.length / 3;
  for (let t = 0; t < triangles; t += 1) {
    const corner = [indices[t * 3]! * 3, indices[t * 3 + 1]! * 3, indices[t * 3 + 2]! * 3];
    const cx = (positions[corner[0]!]! + positions[corner[1]!]! + positions[corner[2]!]!) / 3;
    const cy = (positions[corner[0]! + 1]! + positions[corner[1]! + 1]! + positions[corner[2]! + 1]!) / 3;
    const cz = (positions[corner[0]! + 2]! + positions[corner[1]! + 2]! + positions[corner[2]! + 2]!) / 3;
    const bucket = key(Math.floor(cx / cell), Math.floor(cy / cell), Math.floor(cz / cell));
    const list = grid.get(bucket);
    if (list) list.push(t); else grid.set(bucket, [t]);
  }
  const vertex = (index: number): Vec => [positions[index * 3]!, positions[index * 3 + 1]!, positions[index * 3 + 2]!];
  return Array.from({ length: points.length / 3 }, (_, at) => {
    const p: Vec = [points[at * 3]!, points[at * 3 + 1]!, points[at * 3 + 2]!];
    const gx = Math.floor(p[0] / cell), gy = Math.floor(p[1] / cell), gz = Math.floor(p[2] / cell);
    let best = Infinity;
    for (let dx = -3; dx <= 3; dx += 1) for (let dy = -3; dy <= 3; dy += 1) for (let dz = -3; dz <= 3; dz += 1) {
      for (const t of grid.get(key(gx + dx, gy + dy, gz + dz)) ?? []) {
        best = Math.min(best, pointTriangleDistance(p, vertex(indices[t * 3]!), vertex(indices[t * 3 + 1]!), vertex(indices[t * 3 + 2]!)));
      }
    }
    return best;
  });
}

function referenceAligner(): TriangleMesh {
  const bytes = readFileSync('docs/dental-reference/reference-aligner.stl');
  return parseStl(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer);
}

describe('Step 1 evidence layers on the reference aligner', () => {
  it('the trim-line layer lies on the model surface (within 0.5 mm) once the app pose is applied', () => {
    // As imported, then turned by a scramble so the pose is not the identity; the app's "Use detected" pose is Step 1's rotation.
    const source = referenceAligner();
    const turned: TriangleMesh = { ...source, positions: transformPositions(source.positions, placementMatrix({ position: [0, 0, 0], rotation: [0.61, -0.83, 1.17] })) };
    const evidence = orientationEvidence(turned, REFERENCE_PROFILE);
    expect(evidence.rotation).toBeDefined();
    const layers = orientationLayers(turned, REFERENCE_PROFILE);
    const trim = layers.find((layer) => layer.name.startsWith('TRIM'));
    expect(trim).toBeDefined();
    if (!trim || !evidence.rotation) return;

    const pose = placementMatrix({ position: [0, 0, 0], rotation: evidence.rotation });
    const surface = { positions: transformPositions(turned.positions, pose), indices: turned.indices };
    const points = transformPositions(trim.positions, pose);
    const distances = nearestDistances(points, surface).filter((_, at) => at % 7 === 0);
    const worst = Math.max(...distances);
    // Control: the same points moved 2 mm off the surface must NOT pass, so the bound is not vacuous.
    const moved = Float32Array.from(points, (value, at) => (at % 3 === 0 ? value + 2 : value));
    const control = nearestDistances(moved, surface).filter((_, at) => at % 7 === 0).sort((a, b) => a - b);
    expect(distances.length).toBeGreaterThan(100);
    expect(control[Math.floor(control.length / 2)]!).toBeGreaterThan(0.5);
    expect(worst, `worst ${worst}`).toBeLessThanOrEqual(0.5);
  }, 60000);
});

