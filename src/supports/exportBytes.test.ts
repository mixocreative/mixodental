import { describe, expect, it } from 'vitest';
import type { TriangleMesh } from '@mixo-geocore/host/core/analysis/types';
import { encodeStl } from '@mixo-geocore/host/supports/export';

/*
 * THE EXPORTED STL, READ BY SOMETHING THAT IS NOT THE WRITER.
 *
 * The product's one deliverable is the file a slicer opens, and until 2026-11-11 everything that
 * proved it was ours on both ends: `export.test.ts`'s "writes STL Z-up and reads it back Y-up
 * unchanged" writes with `encodeStl` and reads with our own importer. That shows the two halves
 * agree with each other and nothing more - a self-consistent codec (audit MIXO-13). A reflection in
 * the write would pass it and arrive at the slicer inside-out.
 *
 * So this file imports `encodeStl` - the subject - and NOTHING that parses. The reader below is
 * written from the binary-STL format alone, and the four properties are restated from geometry
 * rather than copied from the writer: the divergence theorem for volume, directed-edge counting for
 * winding, and the conventional (b-a) x (c-a) for a facet normal, where `encodeStl` computes the
 * algebraically equal (c-b) x (a-b).
 *
 * `artefacts/2026-11-11-screen/verify-exported-stl.py` remains the stronger, occasional check: it
 * reads a real multi-hundred-thousand-triangle export with trimesh, a library nobody here wrote.
 * This test is the one that runs on every change.
 */

/** Binary STL parsed from the format: 80-byte header, u32 count, then 50 bytes per facet. */
function readBinaryStl(buffer: ArrayBuffer) {
  const view = new DataView(buffer);
  const facets: { normal: number[]; vertices: number[][] }[] = [];
  let offset = 84;
  while (offset + 50 <= buffer.byteLength) {
    const at = (byte: number): number => view.getFloat32(offset + byte, true);
    facets.push({
      normal: [at(0), at(4), at(8)],
      vertices: [[at(12), at(16), at(20)], [at(24), at(28), at(32)], [at(36), at(40), at(44)]],
    });
    offset += 50;
  }
  return { declared: view.getUint32(80, true), facets, bytesLeftOver: buffer.byteLength - offset };
}

const cross = (u: number[], v: number[]): number[] => [u[1]! * v[2]! - u[2]! * v[1]!, u[2]! * v[0]! - u[0]! * v[2]!, u[0]! * v[1]! - u[1]! * v[0]!];
const minus = (a: number[], b: number[]): number[] => [a[0]! - b[0]!, a[1]! - b[1]!, a[2]! - b[2]!];
const dot = (a: number[], b: number[]): number => a[0]! * b[0]! + a[1]! * b[1]! + a[2]! * b[2]!;

/**
 * Signed volume by the divergence theorem: the sum of a . (b x c) / 6 over the facets. Positive when
 * the normals point outward, NEGATIVE when the solid was written inside out - which is the one
 * failure a round trip through our own reader cannot see.
 */
const signedVolume = (facets: { vertices: number[][] }[]): number =>
  facets.reduce((sum, { vertices: [a, b, c] }) => sum + dot(a!, cross(b!, c!)) / 6, 0);

/** The facet's own outward normal, by the conventional formula rather than the writer's. */
const geometricNormal = (v: number[][]): number[] => {
  const n = cross(minus(v[1]!, v[0]!), minus(v[2]!, v[0]!));
  const length = Math.hypot(...n) || 1;
  return n.map((component) => component / length);
};

/**
 * Edges that are not traversed exactly once in each direction. A closed, consistently wound surface
 * has none: every edge is shared by two facets that walk it in opposite directions.
 */
function windingProblems(facets: { vertices: number[][] }[]): string[] {
  const key = (v: number[]): string => v.map((n) => Math.round(n * 1e4)).join(',');
  const directed = new Map<string, number>();
  for (const { vertices } of facets) {
    for (let i = 0; i < 3; i += 1) {
      const edge = `${key(vertices[i]!)}|${key(vertices[(i + 1) % 3]!)}`;
      directed.set(edge, (directed.get(edge) ?? 0) + 1);
    }
  }
  const problems: string[] = [];
  for (const [edge, count] of directed) {
    const [from, to] = edge.split('|');
    const back = directed.get(`${to}|${from}`) ?? 0;
    if (count !== 1 || back !== 1) problems.push(`${edge} forward ${count}, back ${back}`);
  }
  return problems;
}

const bounds = (facets: { vertices: number[][] }[]) => {
  const lo = [Infinity, Infinity, Infinity];
  const hi = [-Infinity, -Infinity, -Infinity];
  for (const { vertices } of facets) {
    for (const v of vertices) for (let axis = 0; axis < 3; axis += 1) { lo[axis] = Math.min(lo[axis]!, v[axis]!); hi[axis] = Math.max(hi[axis]!, v[axis]!); }
  }
  return { lo, hi };
};

/*
 * A 4 mm cube in PLATE space (y up), standing on y = 0, wound outward. The winding was derived face
 * by face from (b-a) x (c-a), and the first assertion below re-derives its volume as 64 mm3 - so the
 * oracle's input is proved before the oracle is trusted with the writer's output.
 */
const CUBE: TriangleMesh = {
  positions: new Float32Array([
    0, 0, 0, 4, 0, 0, 4, 0, 4, 0, 0, 4,
    0, 4, 0, 4, 4, 0, 4, 4, 4, 0, 4, 4,
  ]),
  indices: new Uint32Array([
    0, 1, 2, 0, 2, 3, // bottom, -y
    4, 6, 5, 4, 7, 6, // top, +y
    0, 4, 5, 0, 5, 1, // front, -z
    3, 2, 6, 3, 6, 7, // back, +z
    0, 3, 7, 0, 7, 4, // left, -x
    1, 5, 6, 1, 6, 2, // right, +x
  ]),
};
const still = { position: [0, 0, 0] as [number, number, number], rotation: [0, 0, 0] as [number, number, number] };

describe('the exported STL, checked by a reader that is not ours', () => {
  it('is a cube the oracle agrees is 64 mm3 and closed, before it judges the writer', () => {
    // Plate space, not the file: this proves the FIXTURE, using the same maths on the same winding.
    const facets = [];
    for (let t = 0; t < CUBE.indices.length; t += 3) {
      facets.push({ vertices: [0, 1, 2].map((k) => [0, 1, 2].map((axis) => CUBE.positions[CUBE.indices[t + k]! * 3 + axis]!)) });
    }
    expect(facets).toHaveLength(12);
    expect(signedVolume(facets)).toBeCloseTo(64, 6);
    expect(windingProblems(facets)).toEqual([]);
  });

  it('declares the facets it actually wrote, with no bytes left over', () => {
    const file = readBinaryStl(encodeStl([{ mesh: CUBE, transform: still }]));
    expect(file.declared).toBe(12);
    expect(file.facets).toHaveLength(file.declared);
    // 84 + 50n exactly: a short count would leave a tail, a long one would read past the end.
    expect(file.bytesLeftOver).toBe(0);
  });

  it('stands on z = 0 and rises in +z, which plate space (y up) is not', () => {
    const { lo, hi } = bounds(readBinaryStl(encodeStl([{ mesh: CUBE, transform: still }])).facets);
    expect(lo[2]).toBeCloseTo(0, 6);
    expect(hi[2]).toBeCloseTo(4, 6);
    // The swap is (x, y, z) -> (x, -z, y), so plate +z becomes file -y. `+ 0` normalises the -0
    // that negating a zero coordinate produces; the repo's other export test does the same.
    expect([lo[0]! + 0, hi[0]! + 0]).toEqual([0, 4]);
    expect([lo[1]! + 0, hi[1]! + 0]).toEqual([-4, 0]);
  });

  it('writes the solid outward, not inside out, and keeps every edge shared once each way', () => {
    const file = readBinaryStl(encodeStl([{ mesh: CUBE, transform: still }]));
    expect(windingProblems(file.facets)).toEqual([]);
    // The (x, -z, y) swap has determinant +1, so it is a rotation and the sign must survive it. A
    // reflection would give -64 here and pass every round trip through our own reader.
    expect(signedVolume(file.facets)).toBeCloseTo(64, 5);
  });

  it('stores a normal that agrees with the three vertices beside it', () => {
    const file = readBinaryStl(encodeStl([{ mesh: CUBE, transform: still }]));
    for (const [index, facet] of file.facets.entries()) {
      const expected = geometricNormal(facet.vertices);
      for (let axis = 0; axis < 3; axis += 1) {
        expect(facet.normal[axis], `facet ${index} axis ${axis}: stored ${facet.normal} vs geometry ${expected}`).toBeCloseTo(expected[axis]!, 5);
      }
    }
  });

  it('survives a rotated part: a transform must not turn the solid inside out', () => {
    // A quarter turn about the plate's up axis. `transformPoint` is where a reflection could enter,
    // and the only symptom would be a model the slicer hollows out.
    const turned = { position: [10, 0, 0] as [number, number, number], rotation: [0, Math.PI / 2, 0] as [number, number, number] };
    const file = readBinaryStl(encodeStl([{ mesh: CUBE, transform: turned }]));
    expect(file.declared).toBe(12);
    expect(windingProblems(file.facets)).toEqual([]);
    expect(signedVolume(file.facets)).toBeCloseTo(64, 4);
    expect(bounds(file.facets).lo[2]).toBeCloseTo(0, 5);
  });

  it('would catch a reflected export - otherwise it proves nothing', () => {
    // A guard nobody has watched fail is a guard nobody has. The fault this file exists for is a
    // REFLECTION in the write: the model arrives mirrored and hollow, and a round trip through our
    // own reader cannot see it because both halves would mirror together.
    const file = readBinaryStl(encodeStl([{ mesh: CUBE, transform: still }]));
    const mirrored = file.facets.map(({ normal, vertices }) => ({ normal, vertices: vertices.map(([x, y, z]) => [-x!, y!, z!]) }));
    expect(signedVolume(mirrored)).toBeCloseTo(-64, 5);
    // And this is why signed volume is the test that matters: edge counting is BLIND to a mirror,
    // because the vertices are still visited in the same order. Winding alone would pass it.
    expect(windingProblems(mirrored)).toEqual([]);
  });

  it('keeps both properties when two parts share one file', () => {
    const file = readBinaryStl(encodeStl([
      { mesh: CUBE, transform: still },
      { mesh: CUBE, transform: { position: [20, 0, 0], rotation: [0, 0, 0] } },
    ]));
    expect(file.declared).toBe(24);
    expect(file.bytesLeftOver).toBe(0);
    // Two disjoint closed solids: volumes add, and no edge is shared between them.
    expect(signedVolume(file.facets)).toBeCloseTo(128, 5);
    expect(windingProblems(file.facets)).toEqual([]);
  });
});
