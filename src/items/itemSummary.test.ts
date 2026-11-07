import { describe, expect, it } from 'vitest';
import { sizeSummary, triangleSummary } from './itemSummary';
import { translateMessage } from '../i18n';

/** A box from (0,0,0) to (x,y,z), as two triangles: enough for bounds, which is all this reads. */
const box = (x: number, y: number, z: number) => ({
  positions: new Float32Array([0, 0, 0, x, y, z, 0, y, 0]),
  indices: new Uint32Array([0, 1, 2]),
});

describe("the row's text preview", () => {
  it('reads the size in whole millimetres, which is how a lab reads it', () => {
    expect(translateMessage(sizeSummary(box(31.4172, 62.6, 18.2)))).toBe('31 × 63 × 18 mm');
  });

  it('counts triangles from the mesh, so a unit with no stored verdict still has the number', () => {
    expect(translateMessage(triangleSummary(box(1, 1, 1)))).toBe('1 triangles');
    const two = { positions: new Float32Array(18), indices: new Uint32Array([0, 1, 2, 3, 4, 5]) };
    expect(translateMessage(triangleSummary(two))).toBe('2 triangles');
  });

  it('never reports a negative span', () => {
    // An empty mesh leaves meshBounds at +/-Infinity; the row must not print "-Infinity mm".
    const text = translateMessage(sizeSummary({ positions: new Float32Array(0), indices: new Uint32Array(0) }));
    expect(text).toBe('0 × 0 × 0 mm');
    expect(text).not.toContain('-');
    expect(text).not.toContain('Infinity');
  });
});
