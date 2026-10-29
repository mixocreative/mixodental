import { describe, expect, it } from 'vitest';
import type { DentalRim } from '@mixo-geocore/host/dental/dental';
import type { DentalAllowStamp } from '@mixo-geocore/host/dental/dentalPolicy';
import type { TriangleMesh } from '@mixo-geocore/host/core/analysis/types';
import { nodeEngine } from '../../scripts/node-engine';
import { areaRisks, outsideLowPoints, permittedFaces } from './areaRisk';
import { manualAreaPolicy } from './manualArea';
import { REFERENCE_PROFILE } from '../../scripts/test-support/referenceProfile';

const rim: DentalRim = {
  boundaryKind: 'projection-fallback', points: new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]),
  openingDirection: [0, -1, 0], centroid: [0, 0, 0], tangent: [1, 0, 0], bitangent: [0, 0, 1],
  visibilityMask: new Uint8Array([1, 1, 1, 1]), visibilityResolution: 2, visibilityMin: [-5, -5], visibilityMax: [5, 5],
};

/** A closed pyramid hanging apex down at (cx, 0, 0): flat sides, so its apex is the lowest point of an overhang region. */
function pyramid(cx: number, base: number): { positions: number[]; indices: number[] } {
  const s = 8;
  const h = 3;
  const positions = [cx, 0, 0, cx - s, h, -s, cx + s, h, -s, cx + s, h, s, cx - s, h, s];
  return { positions, indices: [0, 1, 2, 0, 2, 3, 0, 3, 4, 0, 4, 1, 1, 4, 3, 1, 3, 2].map((i) => i + base) };
}

/** Two hanging pyramids 40 mm apart: apexes at (-20, 0, 0) (the left one) and (20, 0, 0). */
function twoApexes(): TriangleMesh {
  const left = pyramid(-20, 0);
  const right = pyramid(20, 5);
  return { positions: Float32Array.from([...left.positions, ...right.positions]), indices: Uint32Array.from([...left.indices, ...right.indices]) };
}

const settings = { overhangAngleDegrees: 45, spacing: 2, edgeInset: 0, sharpEdgeAngleDegrees: 45, includeIslands: true };
const orientation = { position: [0, 0, 0] as [number, number, number], rotation: [0, 0, 0] as [number, number, number] };
const down: [number, number, number] = [0, -1, 0];
const allowAt = (x: number): DentalAllowStamp => ({ center: [x, 0, 0], radius: 12, normal: down, kind: 'allow' });

describe('overhang low points outside the permitted area', () => {
  const mesh = twoApexes();

  it('paints exactly one blue spot, at the apex that lies outside the area (the other is covered)', () => {
    const policy = { ...manualAreaPolicy(rim, false, REFERENCE_PROFILE), stamps: [allowAt(-20)] };
    const risks = areaRisks({ mesh, orientation, dental: policy, settings, radius: 3 }, nodeEngine);
    expect(risks).toHaveLength(1);
    const risk = risks[0]!;
    expect(risk.position[0]).toBeCloseTo(20, 1);
    expect(risk.position[1]).toBeCloseTo(0, 1);
    // The disc stays on the right pyramid's overhang faces (faces 6..11 are its sides; 12, 13 its lid).
    expect(risk.faces.length).toBeGreaterThan(0);
    expect([...risk.faces].every((face) => face >= 6 && face < 10)).toBe(true);
  });

  it('flips with the area: cover the right apex and the left one is the spot', () => {
    const policy = { ...manualAreaPolicy(rim, false, REFERENCE_PROFILE), stamps: [allowAt(20)] };
    const risks = areaRisks({ mesh, orientation, dental: policy, settings, radius: 3 }, nodeEngine);
    expect(risks.map((risk) => Math.round(risk.position[0]))).toEqual([-20]);
  });

  it('lists both low points when nothing is permitted, and none when both are', () => {
    const none = manualAreaPolicy(rim, false, REFERENCE_PROFILE);
    expect(areaRisks({ mesh, orientation, dental: none, settings, radius: 3 }, nodeEngine)).toHaveLength(2);
    const both = { ...none, stamps: [allowAt(-20), allowAt(20)] };
    expect(areaRisks({ mesh, orientation, dental: both, settings, radius: 3 }, nodeEngine)).toHaveLength(0);
  });

  it('erase takes the area back: the last stamp wins', () => {
    const policy = { ...manualAreaPolicy(rim, false, REFERENCE_PROFILE), stamps: [allowAt(-20), allowAt(20), { ...allowAt(20), kind: 'erase' as const }] };
    expect(areaRisks({ mesh, orientation, dental: policy, settings, radius: 3 }, nodeEngine).map((risk) => Math.round(risk.position[0]))).toEqual([20]);
  });

  it('selects by faces: a point whose faces are all unpermitted is outside, one touching a permitted face is not', () => {
    const regions = [{ faceIndices: [0, 1, 2, 3] }, { faceIndices: [6, 7, 8, 9] }];
    const permitted = new Uint8Array(12);
    permitted[0] = 1; // one face of the left apex
    const spots = outsideLowPoints(mesh, [{ position: [-20, 0, 0], height: 0 }, { position: [20, 0, 0], height: 0 }], regions, permitted, 3,
      nodeEngine.vertex_normals(mesh.positions, mesh.indices));
    expect(spots.map((spot) => spot.region)).toEqual([1]);
    expect(permittedFaces(mesh, { ...manualAreaPolicy(rim, false, REFERENCE_PROFILE), stamps: [allowAt(-20)] }, orientation).slice(0, 4)).toEqual(Uint8Array.of(1, 1, 1, 1));
  });
});
