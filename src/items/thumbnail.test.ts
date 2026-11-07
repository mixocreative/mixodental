import { describe, expect, it } from 'vitest';
import type { TriangleMesh } from '@mixo-geocore/host/core/analysis/types';
import type { Vector } from '@mixo-geocore/host/core/vec3';
import type { PrintUnit } from '../state/project';
import { prunedThumbnails, THUMB_FOV, thumbFraming, thumbnailNeeded, type ThumbCache } from './thumbnail';

const mesh = (positions: number[]): TriangleMesh => ({ positions: new Float32Array(positions), indices: new Uint32Array([0, 1, 2]) });
const unit = (id: string, source: TriangleMesh) => ({ id, source } as PrintUnit);
/** A unit's model: the cache only ever compares these by identity. */
const box = (min: number, max: number) => mesh([min, min, min, max, max, max]);
/** An axis-aligned box as the scene measures it, which is what the camera is framed from. */
const bounds = (min: number, max: number) => ({ min: [min, min, min] as Vector, max: [max, max, max] as Vector });

const cacheOf = (entries: readonly (readonly [string, TriangleMesh])[]): ThumbCache =>
  new Map(entries.map(([id, source]) => [id, { mesh: source, url: `drawn:${id}` }]));

describe('which row needs a picture', () => {
  it('is none, once every row has one', () => {
    const a = box(0, 1), b = box(0, 2);
    expect(thumbnailNeeded([unit('a', a), unit('b', b)], cacheOf([['a', a], ['b', b]]))).toBeUndefined();
  });

  it('is the first row without one', () => {
    const a = box(0, 1), b = box(0, 2);
    expect(thumbnailNeeded([unit('a', a), unit('b', b)], cacheOf([['a', a]]))?.id).toBe('b');
  });

  it('is a row whose model was REPLACED, even though it has a picture under that id', () => {
    const before = box(0, 1);
    const after = box(0, 1); // same numbers, a different mesh: the scene replaced `source`.
    expect(thumbnailNeeded([unit('a', after)], cacheOf([['a', before]]))?.id).toBe('a');
  });
});

describe('pictures of models that are gone', () => {
  it('are dropped when a model is closed', () => {
    const a = box(0, 1), b = box(0, 2);
    expect([...prunedThumbnails(cacheOf([['a', a], ['b', b]]), [unit('a', a)]).keys()]).toEqual(['a']);
  });

  it('leave the cache ALONE when nothing was closed, so a row does not redraw on every render', () => {
    const a = box(0, 1);
    const cache = cacheOf([['a', a]]);
    expect(prunedThumbnails(cache, [unit('a', a)])).toBe(cache);
  });
});

describe('the thumbnail camera', () => {
  it('looks at the middle of the model, wherever the model sits', () => {
    expect(thumbFraming(bounds(10, 20)).target).toEqual([15, 15, 15]);
  });

  it('backs off twice as far for a model twice the size, so both fill the frame', () => {
    const near = thumbFraming(bounds(0, 1));
    const far = thumbFraming(bounds(0, 2));
    const reach = (framing: { position: readonly number[]; target: readonly number[] }) =>
      Math.hypot(...[0, 1, 2].map((axis) => framing.position[axis]! - framing.target[axis]!));
    expect(reach(far) / reach(near)).toBeCloseTo(2, 6);
  });

  it('fits the bounding SPHERE, so turning the model cannot push a corner out of frame', () => {
    const side = 1;
    const reach = Math.hypot(...[0, 1, 2].map((axis) => thumbFraming(bounds(0, side)).position[axis]! - side / 2));
    // The half-DIAGONAL of a unit cube is 0.866, not its half-side 0.5. A camera placed for the
    // half-side would clip the corners the moment the model turned.
    const halfDiagonal = (Math.sqrt(3) * side) / 2;
    expect(reach).toBeGreaterThan(halfDiagonal / Math.sin((THUMB_FOV * Math.PI) / 360));
    expect(reach).toBeLessThan((halfDiagonal / Math.sin((THUMB_FOV * Math.PI) / 360)) * 1.25);
  });
});
