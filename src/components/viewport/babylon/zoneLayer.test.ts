import { describe, expect, it } from 'vitest';
import { zonedTriangles } from './zoneLayer';

/*
 * The rule this guards: a small painted spot on a large model must stay a SMALL draw. If
 * `zonedTriangles` ever returned the whole index list, nothing would look wrong -- the overlay
 * would be drawn correctly, over every triangle, and only the frame rate would say so. That is
 * exactly the kind of defect a picture does not catch, so it gets a test instead.
 */

/** Six triangles over eight vertices; which ones come back depends only on the zoned flags. */
const INDICES = Uint32Array.from([
  0, 1, 2,
  1, 2, 3,
  3, 4, 5,
  4, 5, 6,
  5, 6, 7,
  0, 4, 7,
]);

const zonedAt = (...vertices: number[]) => {
  const out = new Uint8Array(8);
  for (const v of vertices) out[v] = 1;
  return out;
};

describe('zonedTriangles', () => {
  it('returns nothing when no vertex is zoned', () => {
    expect(zonedTriangles(INDICES, zonedAt()).length).toBe(0);
  });

  it('takes a triangle when ANY of its three vertices is zoned', () => {
    // Vertex 3 is in triangles 1 (1,2,3) and 2 (3,4,5) and no others.
    expect([...zonedTriangles(INDICES, zonedAt(3))]).toEqual([1, 2, 3, 3, 4, 5]);
  });

  it('keeps each triangle once however many of its vertices are zoned', () => {
    // Triangle 2 is (3,4,5) -- all three zoned, and it must still appear exactly once.
    const out = zonedTriangles(INDICES, zonedAt(3, 4, 5));
    const triangles = out.length / 3;
    expect(triangles).toBe(new Set(Array.from({ length: triangles }, (_, t) => out.slice(t * 3, t * 3 + 3).join(','))).size);
    expect(out.length % 3).toBe(0);
  });

  it('stays SMALL for a small spot, which is the whole point', () => {
    // One zoned vertex out of eight must not drag the whole mesh into the draw.
    const out = zonedTriangles(INDICES, zonedAt(7));
    expect(out.length).toBeLessThan(INDICES.length);
    expect(out.length / 3).toBe(2); // triangles (5,6,7) and (0,4,7)
  });

  it('returns everything only when every triangle really is touched', () => {
    expect(zonedTriangles(INDICES, zonedAt(0, 1, 2, 3, 4, 5, 6, 7)).length).toBe(INDICES.length);
  });

  it('ignores a trailing partial triangle rather than reading past the end', () => {
    const ragged = Uint32Array.from([0, 1, 2, 3, 4]);
    expect([...zonedTriangles(ragged, zonedAt(0, 3, 4))]).toEqual([0, 1, 2]);
  });
});
