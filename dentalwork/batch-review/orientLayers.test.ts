import { describe, expect, it } from 'vitest';
import { UP_LINE_MM, orientLayers } from './orientLayers';

describe('the Orient graph as review layers (U6)', () => {
  it('a flat region becomes its faces and a pose its up line, anchored on the region', () => {
    const layers = orientLayers({
      FLAT: { type: 'region', centroid: [1, 2, 3], normal: [0, -1, 0], areaMm2: 800.4, protrusionMm: 0, faces: [4, 5] },
      POSE: { type: 'pose', up: [0, 1, 0], lean: [1, 0, 0], across: [0, 0, 1] },
      FR: { type: 'frame', centroid: [0, 0, 0], up: [0, 1, 0], lean: [1, 0, 0], across: [0, 0, 1], decided: true },
    }, [9, 9, 9]);
    expect(layers).toEqual([
      { kind: 'faces', name: 'Orient FLAT: flat area (800 mm2, pokes out 0.00 mm)', faces: [4, 5] },
      { kind: 'lines', name: 'Orient POSE: up at tilt 0 (away from the plate)', segments: [[[1, 2, 3], [1, 2 + UP_LINE_MM, 3]]] },
    ]);
  });

  it('with no flat region the up line starts at the given centre, and a frame draws nothing', () => {
    const layers = orientLayers({ POSE: { type: 'pose', up: [0, 0, 1], lean: [1, 0, 0], across: [0, 1, 0] } }, [5, 5, 5]);
    expect(layers).toEqual([{ kind: 'lines', name: 'Orient POSE: up at tilt 0 (away from the plate)', segments: [[[5, 5, 5], [5, 5, 5 + UP_LINE_MM]]] }]);
  });
});
