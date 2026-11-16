import { describe, expect, it } from 'vitest';
import { filledTriangles } from './surfaceStamps';

/*
 * The rule this guards: a small painted spot on a large model must stay a SMALL draw. If
 * `filledTriangles` ever returned the whole index list, nothing would look wrong -- the overlay
 * would be drawn correctly, over every triangle, and only the frame rate would say so. That is
 * exactly the kind of defect a picture does not catch, so it gets a test instead.
 */

/** Six triangles over eight vertices; which come back depends only on the filled flags. */
const INDICES = Uint32Array.from([
  0, 1, 2,
  1, 2, 3,
  3, 4, 5,
  4, 5, 6,
  5, 6, 7,
  0, 4, 7,
]);

const filledAt = (...vertices: number[]) => {
  const out = new Uint8Array(8);
  for (const v of vertices) out[v] = 1;
  return out;
};

describe('filledTriangles', () => {
  it('returns nothing when no vertex is filled', () => {
    expect(filledTriangles(INDICES, filledAt()).length).toBe(0);
  });

  it('takes a triangle when ANY of its three vertices is filled', () => {
    expect([...filledTriangles(INDICES, filledAt(3))]).toEqual([1, 2, 3, 3, 4, 5]);
  });

  it('keeps each triangle once however many of its vertices are filled', () => {
    const out = filledTriangles(INDICES, filledAt(3, 4, 5));
    expect(out.length % 3).toBe(0);
    const seen = new Set(Array.from({ length: out.length / 3 }, (_, t) => out.slice(t * 3, t * 3 + 3).join(',')));
    expect(seen.size).toBe(out.length / 3);
  });

  it('stays SMALL for a small spot, which is the whole point', () => {
    const out = filledTriangles(INDICES, filledAt(7));
    expect(out.length).toBeLessThan(INDICES.length);
    expect(out.length / 3).toBe(2);
  });

  it('returns everything only when every triangle really is touched', () => {
    expect(filledTriangles(INDICES, filledAt(0, 1, 2, 3, 4, 5, 6, 7)).length).toBe(INDICES.length);
  });

  it('ignores a trailing partial triangle rather than reading past the end', () => {
    expect([...filledTriangles(Uint32Array.from([0, 1, 2, 3, 4]), filledAt(0, 3, 4))]).toEqual([0, 1, 2]);
  });
});
