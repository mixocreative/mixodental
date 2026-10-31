import { describe, expect, it } from 'vitest';
import { raftLayers, sliceAreas, trunkLoad } from './peelReport';
import type { WorldMesh } from './glbWorld';
import type { SupportComponent } from '@mixo-geocore/host/core/supports/mesh';

/** Closed box with a square base `w` (centred on x, z = 0) from y0 to y1; `topW` makes it a pyramid frustum. */
function frustum(w: number, topW: number, y0: number, y1: number): WorldMesh {
  const h = w / 2, t = topW / 2;
  const positions = Float64Array.from([-h, y0, -h, h, y0, -h, h, y0, h, -h, y0, h, -t, y1, -t, t, y1, -t, t, y1, t, -t, y1, t]);
  const quad = (a: number, b: number, c: number, d: number) => [a, b, c, a, c, d];
  const indices = Uint32Array.from([...quad(0, 1, 2, 3), ...quad(7, 6, 5, 4), ...quad(0, 4, 5, 1), ...quad(1, 5, 6, 2), ...quad(2, 6, 7, 3), ...quad(3, 7, 4, 0)]);
  return { name: 'box', positions, indices };
}
const flipped = (m: WorldMesh): WorldMesh => ({ ...m, indices: m.indices.map((_, i) => m.indices[i - (i % 3) + [0, 2, 1][i % 3]!]!) });

describe('peel report slicing', () => {
  it('a 10 x 10 x 10 cube is 100 mm² in every layer', () => {
    const areas = sliceAreas([frustum(10, 10, 0, 10)], 0.05, 200);
    expect(areas.length).toBe(200);
    for (const v of areas) expect(v).toBeCloseTo(100, 6);
  });
  it('the result does not depend on the winding direction', () => {
    expect(sliceAreas([flipped(frustum(10, 10, 0, 10))], 0.05, 200)[10]!).toBeCloseTo(100, 6);
  });
  it('a pyramid frustum decreases with height', () => {
    const areas = sliceAreas([frustum(10, 2, 0, 10)], 0.05, 200);
    expect(areas[0]!).toBeGreaterThan(areas[100]!);
    expect(areas[100]!).toBeGreaterThan(areas[199]!);
    expect(areas[100]!).toBeCloseTo(36, 0); // side 6 at half height
  });
  it('shells wound in opposite directions both add (no cancelling)', () => {
    const areas = sliceAreas([frustum(10, 10, 0, 10), flipped({ ...frustum(4, 4, 0, 10), positions: frustum(4, 4, 0, 10).positions.map((v, i) => (i % 3 === 0 ? v + 20 : v)) })], 0.05, 200);
    expect(areas[50]!).toBeCloseTo(116, 6);
  });
  it('a bent-open shell still gives its area (an open loop costs its gap only)', () => {
    const box = frustum(10, 10, 0, 10);
    const open: WorldMesh = { ...box, indices: box.indices.slice(0, 6 * 5) }; // drop the last side face
    const area = sliceAreas([open], 0.05, 200)[50]!;
    expect(area).toBeGreaterThan(50);
    expect(area).toBeLessThanOrEqual(100);
  });
});

describe('raft detection', () => {
  it('finds the first big area drop, and none on a plain taper', () => {
    expect(raftLayers(Float64Array.from([100, 90, 80, 10, 10, 12]), 0.05)).toBe(3);
    expect(raftLayers(Float64Array.from([10, 20, 30, 40, 50]), 0.05)).toBe(0);
  });
});

describe('trunk load', () => {
  it('counts tips per tree that reaches a foot', () => {
    // Two triangles sharing an edge = one tree with two tips and a foot; a separate triangle = one tip, no foot.
    const positions = [0, 0, 0, 1, 0, 0, 0, 1, 0, 2, 0, 0, 5, 5, 5, 6, 5, 5, 5, 6, 5];
    const indices = [0, 1, 2, 1, 3, 2, 4, 5, 6];
    const part = (p: SupportComponent['part'], start: number, contactId?: string): SupportComponent => ({ part: p, start, count: 3, ...(contactId ? { contactId } : {}) });
    const load = trunkLoad(positions, indices, [part('tip', 0, 'a'), part('tip', 3, 'b'), part('foot', 0), part('tip', 6, 'c')]);
    expect(load.trunks).toBe(1);
    expect(load.maxTipsPerTrunk).toBe(2);
    expect(load.trunkToNeckArea).toBeCloseTo(13.44 / 2, 1);
  });
  it('counts a neck as a tip when the build has no separate tip parts', () => {
    const positions = [0, 0, 0, 1, 0, 0, 0, 1, 0, 2, 0, 0];
    const indices = [0, 1, 2, 1, 3, 2];
    const part = (p: SupportComponent['part'], start: number, contactId?: string): SupportComponent => ({ part: p, start, count: 3, ...(contactId ? { contactId } : {}) });
    expect(trunkLoad(positions, indices, [part('neck', 0, 'a'), part('neck', 3, 'b'), part('foot', 0)]).maxTipsPerTrunk).toBe(2);
  });
});
