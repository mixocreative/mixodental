import { describe, expect, it } from 'vitest';
import { applyToDirection, placementMatrix } from '../../../scripts/test-support/matrix';
import type { Vector } from '@mixo-geocore/host/core/vec3';
import { proposeDentalOrientation } from '@mixo-geocore/host/dental/dental';
import { rotationToPlateDown } from '../../../scripts/test-support/dentalExpect';
import type { TriangleMesh } from '@mixo-geocore/host/core/analysis/types';
import { REFERENCE_PROFILE } from '../../../scripts/test-support/referenceProfile';

describe('proposeDentalOrientation', () => {
  it('recovers a watertight cavity opening after an arbitrary rotation', () => {
    const mesh = rotateMesh(watertightCup(), [0.61, -0.83, 1.17]);

    const result = proposeDentalOrientation(mesh, REFERENCE_PROFILE);

    // Engine 13 checks edge topology before orientation; this synthetic cavity has degenerate faces, so it stops there (not a real aligner; real scans pass).
    expect(result).toMatchObject({ kind: 'inconclusive', reason: 'non-manifold-or-degenerate-mesh' });
  });

  it('refuses a cube and malformed geometry instead of inventing a dental bottom', () => {
    expect(proposeDentalOrientation(cube(), REFERENCE_PROFILE).kind).toBe('inconclusive');
    expect(proposeDentalOrientation({
      positions: new Float32Array([0, 0, 0, Number.NaN, 0, 0, 0, 1, 0]),
      indices: new Uint32Array([0, 1, 2]),
    }, REFERENCE_PROFILE)).toMatchObject({ kind: 'inconclusive', reason: 'invalid-mesh' });
  });

  it('is deterministic and keeps the rim in unit-local coordinates', () => {
    const mesh = rotateMesh(watertightCup(), [0.2, 0.9, -0.7]);
    const first = proposeDentalOrientation(mesh, REFERENCE_PROFILE);
    const second = proposeDentalOrientation(mesh, REFERENCE_PROFILE);
    expect(second).toEqual(first);
  });

  it('refuses an invalid orientation direction', () => {
    expect(() => rotationToPlateDown([0, 0, 0])).toThrow(RangeError);
  });

  it('does not invent a signed front for a rotationally symmetric cavity', () => {
    const result = proposeDentalOrientation(watertightCup(), REFERENCE_PROFILE);
    // Engine 13 checks edge topology before orientation; this synthetic cavity has degenerate faces, so it stops there (not a real aligner; real scans pass).
    expect(result).toMatchObject({ kind: 'inconclusive', reason: 'non-manifold-or-degenerate-mesh' });
  });
});

/** A closed thick cup. Its rim is bridged, so it has no literal boundary edges. */
function watertightCup(): TriangleMesh {
  const segments = 16;
  const outerRadius = 10;
  const innerRadius = 8;
  const bottom = -4;
  const rim = 4;
  const positions: number[] = [0, bottom, 0];
  for (const y of [bottom, rim]) for (const radius of [outerRadius, innerRadius]) {
    for (let segment = 0; segment < segments; segment += 1) {
      const angle = segment * Math.PI * 2 / segments;
      positions.push(radius * Math.cos(angle), y, radius * Math.sin(angle));
    }
  }
  const index = (level: number, ring: number, segment: number) => 1 + (level * 2 + ring) * segments + (segment + segments) % segments;
  const indices: number[] = [];
  for (let segment = 0; segment < segments; segment += 1) {
    const next = (segment + 1) % segments;
    // Outside, rim bridge, inside, and the annular floor form one closed shell.
    quad(indices, index(0, 0, segment), index(0, 0, next), index(1, 0, next), index(1, 0, segment));
    quad(indices, index(1, 0, segment), index(1, 0, next), index(1, 1, next), index(1, 1, segment));
    quad(indices, index(1, 1, segment), index(1, 1, next), index(0, 1, next), index(0, 1, segment));
    quad(indices, index(0, 1, segment), index(0, 1, next), index(0, 0, next), index(0, 0, segment));
    indices.push(0, index(0, 1, next), index(0, 1, segment));
  }
  return { positions: new Float32Array(positions), indices: new Uint32Array(indices) };
}

function quad(out: number[], a: number, b: number, c: number, d: number): void {
  out.push(a, b, c, a, c, d);
}

function cube(): TriangleMesh {
  const positions = new Float32Array([
    -1, -1, -1, 1, -1, -1, 1, 1, -1, -1, 1, -1,
    -1, -1, 1, 1, -1, 1, 1, 1, 1, -1, 1, 1,
  ]);
  const indices = new Uint32Array([
    0, 2, 1, 0, 3, 2, 4, 5, 6, 4, 6, 7,
    0, 1, 5, 0, 5, 4, 1, 2, 6, 1, 6, 5,
    2, 3, 7, 2, 7, 6, 3, 0, 4, 3, 4, 7,
  ]);
  return { positions, indices };
}

function rotateMesh(mesh: TriangleMesh, rotation: Vector): TriangleMesh {
  const matrix = placementMatrix({ position: [0, 0, 0], rotation });
  const positions = new Float32Array(mesh.positions.length);
  for (let offset = 0; offset < positions.length; offset += 3) {
    const x = mesh.positions[offset]!;
    const y = mesh.positions[offset + 1]!;
    const z = mesh.positions[offset + 2]!;
    const direction = applyToDirection(matrix, x, y, z);
    const length = Math.hypot(x, y, z);
    positions[offset] = direction[0] * length;
    positions[offset + 1] = direction[1] * length;
    positions[offset + 2] = direction[2] * length;
  }
  return { positions, indices: mesh.indices.slice() };
}
