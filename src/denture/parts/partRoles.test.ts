import { describe, expect, it } from 'vitest';
import type { DenturePart } from '@mixo-geocore/host/dental/dentureParts';
import { addOnFaceMask, orderedParts, roleCounts, showsPartsList } from './partRoles';

const part = (id: number, role: DenturePart['role'], volumeMm3: number): DenturePart => ({ id, role, triangles: 10, volumeMm3, areaMm2: 1, tips: 0 });
const parts = [part(4, 'debris', 0.1), part(2, 'addOn', 12), part(0, 'target', 3400), part(7, 'addOn', 40)];

describe('partRoles', () => {
  it('shows only for a file with more than one part', () => {
    expect(showsPartsList(undefined)).toBe(false);
    expect(showsPartsList({ parts: [part(0, 'target', 1)], faceParts: new Uint32Array() })).toBe(false);
    expect(showsPartsList({ parts, faceParts: new Uint32Array() })).toBe(true);
  });

  it('orders target, add-ons (larger first), debris and counts the roles', () => {
    expect(orderedParts(parts).map((entry) => entry.id)).toEqual([0, 7, 2, 4]);
    expect(roleCounts(parts)).toEqual({ target: 1, addOn: 2, debris: 1 });
  });

  it('marks the faces of add-on parts only', () => {
    const mask = addOnFaceMask({ parts, faceParts: Uint32Array.of(0, 0, 2, 7, 4, 0) }, 6);
    expect([...mask!]).toEqual([0, 0, 1, 1, 0, 0]);
    expect(addOnFaceMask({ parts, faceParts: Uint32Array.of(0, 2) }, 6)).toBeUndefined();
    expect(addOnFaceMask({ parts: [part(0, 'target', 1)], faceParts: Uint32Array.of(0) }, 1)).toBeUndefined();
  });
});
