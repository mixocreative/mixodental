import { describe, expect, it } from 'vitest';
import { facesIn, facesInNone, maskLayers, maskOfNone } from './maskLayers';

/** Colour resolution is injected, so a test needs no tokens.css and no DOM. */
const resolve = (token: string): number => ({ '--layer-allowed': 0x2e9e5b, '--layer-no-support': 0xc0392b, '--layer-undefined': 0x6e6a86 })[token] ?? 0;

describe('facesIn', () => {
  it('takes any non-zero as in the mask', () => {
    expect(facesIn([0, 1, 0, 1])).toEqual([1, 3]);
    // The masks arrive as Uint8Array from the engine, and a decoder may write 2 for "in, by the second route".
    expect(facesIn(Uint8Array.from([2, 0, 1]))).toEqual([0, 2]);
    expect(facesIn([])).toEqual([]);
  });
});

describe('facesInNone — the undecided faces', () => {
  it('is the complement of every mask together', () => {
    const allowed = [1, 0, 0, 0];
    const noSupport = [0, 1, 0, 0];
    // Face 2 and 3 were reached by neither ray: the outcome matches no-support, the fact does not.
    expect(facesInNone([allowed, noSupport], 4)).toEqual([2, 3]);
  });

  it('counts a face in both as decided, not undecided', () => {
    // `allowed overrides no-support` (ruled_tips.rs): an overridden face is still a DECIDED face.
    expect(facesInNone([[1, 0], [1, 1]], 2)).toEqual([]);
  });

  it('is every face when nothing was reached, and none when everything was', () => {
    expect(facesInNone([[0, 0, 0]], 3)).toEqual([0, 1, 2]);
    expect(facesInNone([[1, 1, 1]], 3)).toEqual([]);
    // No masks at all means nothing has been decided about anything - not "all fine".
    expect(facesInNone([], 2)).toEqual([0, 1]);
  });

  it('refuses a mask that is not for this mesh, rather than returning a shorter answer', () => {
    // The failure this guards: a truncated decode would quietly shrink the undecided set, which is the
    // same silence the layer exists to end.
    expect(() => facesInNone([[0, 0]], 3)).toThrow(/for a different mesh/);
    expect(() => facesInNone([[0, 0, 0, 0]], 3)).toThrow(/4 faces, the mesh has 3/);
  });
});

describe('maskOfNone', () => {
  it('is the same answer as a mask, so it drops into a spec list', () => {
    expect([...maskOfNone([[1, 0, 0, 0], [0, 1, 0, 0]], 4)]).toEqual([0, 0, 1, 1]);
    expect([...maskOfNone([[1, 1]], 2)]).toEqual([0, 0]);
  });
});

describe('maskLayers', () => {
  it('resolves the colour by token and sorts so decided zones draw over undecided', () => {
    const layers = maskLayers([
      { name: 'Allowed area', mask: [1, 0, 0], token: '--layer-allowed', lift: 0.1 },
      { name: 'Undefined', mask: [0, 0, 1], token: '--layer-undefined', lift: 0.04 },
      { name: 'No-support zone', mask: [0, 1, 0], token: '--layer-no-support', lift: 0.05 },
    ], resolve);
    expect(layers.map((l) => l.name)).toEqual(['Undefined', 'No-support zone', 'Allowed area']);
    expect(layers[0]!.color).toBe(0x6e6a86);
    expect(layers.map((l) => l.faces)).toEqual([[2], [1], [0]]);
  });

  it('leaves out a mask that holds nothing', () => {
    const layers = maskLayers([{ name: 'Empty', mask: [0, 0], token: '--layer-allowed', lift: 0.1 }], resolve);
    expect(layers).toEqual([]);
  });
});
