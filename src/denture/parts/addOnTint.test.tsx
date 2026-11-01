import { describe, expect, it } from 'vitest';
import type { DenturePart } from '@mixo-geocore/host/dental/dentureParts';
import type { DentureMesh } from '../engine/dentureCore';
import { dentureAddOnTint } from './addOnTint';

const mesh = { positions: new Float32Array(12), indices: Uint32Array.of(0, 1, 2, 1, 2, 3) };
const part = (id: number, role: DenturePart['role']): DenturePart => ({ id, role, triangles: 1, volumeMm3: 1, areaMm2: 1, tips: 0 });
const built = (parts: DenturePart[]) => ({ dentureParts: { parts, faceParts: Uint32Array.of(0, 1) } }) as unknown as DentureMesh;

describe('dentureAddOnTint', () => {
  it('tints only when the build reports an add-on part', () => {
    expect(dentureAddOnTint(mesh, undefined)).toBeUndefined();
    expect(dentureAddOnTint(mesh, built([part(0, 'target')]))).toBeUndefined();
    expect(dentureAddOnTint(mesh, built([part(0, 'target'), part(1, 'debris')]))).toBeUndefined();
    expect(dentureAddOnTint(mesh, built([part(0, 'target'), part(1, 'addOn')]))).toBeDefined();
  });
});
