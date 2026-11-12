import { describe, expect, it } from 'vitest';
import type { TiltPaths } from '@mixo-geocore/host/dental/dentureTilt';
import { liveTipLayers, tipCounts } from './liveTipLayers';

const paths: Extract<TiltPaths, { kind: 'paths' }> = { kind: 'paths', tiltDeg: 10, rotation: [0, 0, 0], overhangMm2: 0, counts: { lowsWithout: 0, without: 1, fallbacks: 1, tips: 3 },
  tips: [
    { position: [0, 0, 0], normal: [0, -1, 0], stream: 0, state: 'path' },
    { position: [1, 2, 3], normal: [0, -1, 0], stream: 0, state: 'path' },
    { position: [5, 5, 5], normal: [0, -1, 0], stream: 1, state: 'none' },
  ] };

describe('liveTipLayers', () => {
  it('counts tips per path state', () => {
    expect(tipCounts(paths)).toEqual({ path: 2, fallback: 0, none: 1, unknown: 0 });
  });

  it('draws one coloured layer per state that has tips, an octahedron on each tip', () => {
    const layers = liveTipLayers(paths, { path: 1, fallback: 2, none: 3, unknown: 4 }, 0.5);
    expect(layers.map((layer) => [layer.name, layer.color])).toEqual([['Live tips: path', 1], ['Live tips: none', 3]]);
    expect(layers[0]!.positions.length).toBe(2 * 6 * 3);
    expect(layers[0]!.indices.length).toBe(2 * 24);
    // The second tip's first corner sits 0.5 mm along +X of the tip.
    expect([...layers[0]!.positions.slice(18, 21)]).toEqual([1.5, 2, 3]);
    expect(Math.max(...layers[1]!.indices)).toBe(5);
  });
});
