import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { BufferGeometry, Matrix4, TorusKnotGeometry } from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import type { TriangleMesh } from '@mixo-geocore/host/core/analysis/types';
import { nodeEngine, parseStl, weldPositions } from '../../scripts/test-support/rustImport';
import { finishStl, openStlSession, pushStl } from '../workers/stlSession';

/*
 * The import weld contract (engine 12, mixo-geocore core/proximity.rs). The transform still matches
 * three.js bit for bit (STLLoader, rotateX(-PI/2); Matrix4 for glTF). The weld is no longer three.js
 * mergeVertices (a 1e-4 mm hash grid that also merged the two ends of genuine sub-0.1 um edges of
 * dense scans): bit-identical corners merge first-seen, then copies within the weld distance
 * (max(1e-7 mm, 1e-6 x bounding-box diagonal)) merge only when they share no face and no edge
 * ends up on more than two faces. Checked here against an exact first-seen weld (the oracle for
 * clean meshes) and, for noisy copies, by the contract's properties.
 */

/** Exact first-seen weld by f32 bits (-0 folded into +0), one index per corner. */
function exactWeld(corners: Float32Array, indices?: Uint32Array): TriangleMesh {
  const seen = new Map<string, number>();
  const positions: number[] = [];
  const count = indices ? indices.length : corners.length / 3;
  const out = new Uint32Array(count);
  for (let k = 0; k < count; k += 1) {
    const v = indices ? indices[k]! : k;
    const p = [corners[v * 3]! + 0, corners[v * 3 + 1]! + 0, corners[v * 3 + 2]! + 0];
    const key = p.map((x) => new Uint32Array(Float32Array.of(x).buffer)[0]).join(',');
    let id = seen.get(key);
    if (id === undefined) {
      id = positions.length / 3;
      seen.set(key, id);
      positions.push(corners[v * 3]!, corners[v * 3 + 1]!, corners[v * 3 + 2]!);
    }
    out[k] = id;
  }
  return { positions: Float32Array.from(positions), indices: out };
}

/** The corners of an STL as three.js reads and turns them (the transform the import must match). */
function stlCorners(buffer: ArrayBuffer): Float32Array {
  return new Float32Array(new STLLoader().parse(buffer).rotateX(-Math.PI / 2).getAttribute('position').array);
}

function weldDistance(positions: Float32Array): number {
  const low = [Infinity, Infinity, Infinity];
  const high = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < positions.length; i += 1) {
    low[i % 3] = Math.min(low[i % 3]!, positions[i]!);
    high[i % 3] = Math.max(high[i % 3]!, positions[i]!);
  }
  return Math.max(1e-7, 1e-6 * Math.hypot(high[0]! - low[0]!, high[1]! - low[1]!, high[2]! - low[2]!));
}

/** Deterministic pseudo-random numbers. */
function random(seed: number) {
  return () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 2 ** 32);
}

function binaryStl(soup: Float32Array): ArrayBuffer {
  const triangles = soup.length / 9;
  const view = new DataView(new ArrayBuffer(84 + triangles * 50));
  view.setUint32(80, triangles, true);
  for (let t = 0; t < triangles; t += 1) {
    for (let k = 0; k < 9; k += 1) view.setFloat32(84 + t * 50 + 12 + k * 4, soup[t * 9 + k]!, true);
  }
  return view.buffer;
}

function asciiStl(soup: Float32Array): ArrayBuffer {
  const lines = ['solid test'];
  for (let t = 0; t < soup.length / 9; t += 1) {
    lines.push(' facet normal 0 0 1', '  outer loop');
    for (let v = 0; v < 3; v += 1) lines.push(`   vertex ${soup[t * 9 + v * 3]} ${soup[t * 9 + v * 3 + 1]!.toExponential(6)} ${soup[t * 9 + v * 3 + 2]}`);
    lines.push('  endloop', ' endfacet');
  }
  lines.push('endsolid test');
  return new TextEncoder().encode(lines.join('\n')).buffer as ArrayBuffer;
}

/** A triangle soup from a three geometry, every corner of 30 % of them moved by up to +-jitter/2 per axis. */
function soupOf(geometry: BufferGeometry, jitter: number, seed = 1): Float32Array {
  const next = random(seed);
  const flat = geometry.index ? geometry.toNonIndexed() : geometry;
  const positions = flat.getAttribute('position').array as Float32Array;
  return positions.map((value) => value + (next() < 0.3 ? (next() - 0.5) * jitter : 0));
}

function expectSame(actual: TriangleMesh, expected: TriangleMesh): void {
  expect(actual.indices.length).toBe(expected.indices.length);
  expect(actual.positions.length).toBe(expected.positions.length);
  // Bit for bit (toEqual on floats would let -0 equal 0).
  expect(new Uint32Array(actual.positions.slice().buffer)).toEqual(new Uint32Array(expected.positions.slice().buffer));
  expect(actual.indices).toEqual(expected.indices);
}

/**
 * The weld contract on noisy input: one index per input corner; every kept position is one of the
 * input corners, bit for bit; each corner moved at most one weld distance (no chaining); and no face whose
 * corners were distinct comes out with a repeated vertex (no collapsed triangle, by construction).
 */
function expectWeldContract(actual: TriangleMesh, corners: Float32Array, indices?: Uint32Array): void {
  const count = indices ? indices.length : corners.length / 3;
  expect(actual.indices.length).toBe(count);
  const bits = (a: Float32Array, v: number) => Array.from(new Uint32Array(a.slice(v * 3, v * 3 + 3).buffer)).join(',');
  const inputs = new Set(Array.from({ length: corners.length / 3 }, (_, v) => bits(corners, v)));
  for (let v = 0; v < actual.positions.length / 3; v += 1) expect(inputs.has(bits(actual.positions, v))).toBe(true);
  const limit = weldDistance(corners) * (1 + 1e-9);
  let worst = 0;
  for (let k = 0; k < count; k += 1) {
    const v = indices ? indices[k]! : k;
    const o = actual.indices[k]!;
    worst = Math.max(worst, Math.hypot(...[0, 1, 2].map((a) => actual.positions[o * 3 + a]! - corners[v * 3 + a]!)));
  }
  expect(worst).toBeLessThanOrEqual(limit);
  for (let t = 0; t + 2 < count; t += 3) {
    const corner = (k: number) => bits(corners, indices ? indices[t + k]! : t + k);
    if (corner(0) === corner(1) || corner(1) === corner(2) || corner(0) === corner(2)) continue;
    const [a, b, c] = [actual.indices[t]!, actual.indices[t + 1]!, actual.indices[t + 2]!];
    expect(a !== b && b !== c && a !== c, `face ${t / 3}`).toBe(true);
  }
}

describe('import weld contract (engine 12)', () => {
  it('binary STL of a clean knot: exactly the exact first-seen weld of the three.js corners', () => {
    const buffer = binaryStl(soupOf(new TorusKnotGeometry(10, 3, 120, 16), 0));
    expectSame(parseStl(buffer), exactWeld(stlCorners(buffer)));
  });

  it('noise below the weld distance folds every seam copy: the clean topology', () => {
    const clean = exactWeld(stlCorners(binaryStl(soupOf(new TorusKnotGeometry(10, 3, 120, 16), 0))));
    const buffer = binaryStl(soupOf(new TorusKnotGeometry(10, 3, 120, 16), 1e-5));
    const noisy = parseStl(buffer);
    expectWeldContract(noisy, stlCorners(buffer));
    expect(noisy.indices).toEqual(clean.indices);
  });

  it('noise around and above the weld distance keeps the contract', () => {
    for (const jitter of [2e-4, 5e-5]) {
      const buffer = binaryStl(soupOf(new TorusKnotGeometry(10, 3, 120, 16), jitter));
      expectWeldContract(parseStl(buffer), stlCorners(buffer));
    }
  });

  it('binary STL fed in odd-sized chunks equals the one-chunk import', () => {
    const buffer = binaryStl(soupOf(new TorusKnotGeometry(10, 3, 64, 8), 1e-4, 7));
    const bytes = new Uint8Array(buffer);
    const stream = openStlSession(nodeEngine, bytes.subarray(0, 84), bytes.length);
    for (let offset = 0; offset < bytes.length; offset += 997) pushStl(stream, bytes.subarray(offset, offset + 997), 'chunks');
    expectSame(finishStl(stream, 'chunks'), parseStl(buffer));
  });

  it('binary STL with trailing padding (header count read, tail ignored, as STLLoader)', () => {
    const exact = new Uint8Array(binaryStl(soupOf(new TorusKnotGeometry(10, 3, 32, 6), 0)));
    const padded = new Uint8Array(exact.length + 13);
    padded.set(exact);
    expectSame(parseStl(padded.buffer), exactWeld(stlCorners(exact.buffer)));
  });

  it('edge cases: signed zeros, duplicate and degenerate triangles, table growth', () => {
    const next = random(5);
    const triangles: number[][] = [
      [0, 0, 0, -0, 0, 1, 1, -0, 0],
      [0, 0, 0, -0, 0, 1, 1, -0, 0], // duplicate
      [2, 2, 2, 2, 2, 2, 3, 3, 3], // degenerate in the file (two equal corners): kept as it is
    ];
    // Many distinct vertices: the weld table grows past its first size.
    for (let t = 0; t < 4000; t += 1) triangles.push(Array.from({ length: 9 }, () => (next() - 0.5) * 100));
    const buffer = binaryStl(new Float32Array(triangles.flat()));
    const mesh = parseStl(buffer);
    expectSame(mesh, exactWeld(stlCorners(buffer)));
    expect(Array.from(mesh.indices.slice(6, 9))).toEqual([3, 3, 4]);
  });

  it('a genuine sub-0.1 um edge is never welded shut (the dense-scan case)', () => {
    // A closed tetrahedron with edge a-b split 30 nm from a: six faces, all kept, every edge two-faced.
    const [a, b, c, d, p] = [[0, 0, 0], [10, 0, 0], [0, 10, 0], [0, 0, 10], [3e-5, 0, 0]];
    const soup = new Float32Array([a, c, p, p, c, b, p, b, d, a, p, d, a, d, c, b, c, d].flat());
    const mesh = parseStl(binaryStl(soup));
    expect(mesh.indices.length).toBe(18);
    expect(mesh.positions.length).toBe(15);
    const edges = new Map<string, number>();
    for (let t = 0; t < 18; t += 3) {
      for (let k = 0; k < 3; k += 1) {
        const [x, y] = [mesh.indices[t + k]!, mesh.indices[t + ((k + 1) % 3)]!];
        const key = `${Math.min(x, y)}-${Math.max(x, y)}`;
        edges.set(key, (edges.get(key) ?? 0) + 1);
      }
    }
    expect([...edges.values()].every((n) => n === 2)).toBe(true);
  });

  it('the knot fixture: all 89,472 triangles kept (the 1e-4 grid used to collapse 282 of them)', () => {
    const bytes = readFileSync('scripts/fixtures/knot.stl');
    const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
    const mesh = parseStl(buffer);
    expect(mesh.indices.length / 3).toBe(89_472);
    expectWeldContract(mesh, stlCorners(buffer));
  });

  it('ASCII STL: same contract (text round trip of the corners)', () => {
    const buffer = asciiStl(soupOf(new TorusKnotGeometry(10, 3, 40, 8), 2e-4, 3));
    const corners = new Float32Array(new STLLoader().parse(buffer).rotateX(-Math.PI / 2).getAttribute('position').array);
    expectWeldContract(parseStl(buffer), corners);
  });

  it('indexed glTF-style mesh with a world matrix (transformed in place, bit for bit)', () => {
    const geometry = new TorusKnotGeometry(8, 2, 50, 10);
    const matrix = new Matrix4().makeRotationY(0.7).setPosition(3, -2, 11.5).scale({ x: 1.5, y: 1.5, z: 1.5 } as never);
    const reference = geometry.clone().applyMatrix4(matrix);
    const positions = new Float32Array(geometry.getAttribute('position').array);
    const indices = Uint32Array.from(geometry.index!.array);
    const welded = weldPositions(positions, indices, matrix.toArray());
    expect(new Uint32Array(positions.buffer)).toEqual(new Uint32Array(new Float32Array(reference.getAttribute('position').array).buffer));
    expectWeldContract(welded, positions, indices);
  });

  it('unindexed raw positions with near-duplicates keep the contract', () => {
    const next = random(11);
    const positions = new Float32Array(3 * 3000).map(() => Math.round(next() * 20) / 10 + (next() - 0.5) * 3e-4);
    expectWeldContract(weldPositions(positions.slice()), positions);
  });
});
