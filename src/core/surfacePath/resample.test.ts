import { describe, expect, it } from 'vitest';
import type { Vector } from '@mixo-geocore/host/core/vec3';
import type { SurfacePath } from './path';
import { pathPointArray, resamplePath, type ProjectToSurface } from './resample';

const pathOf = (closed: boolean, ...positions: Vector[]): SurfacePath =>
  ({ anchors: positions.map((position) => ({ position, normal: [0, 0, 1] as Vector })), closed });

/** A surface that is everywhere z = 1: every sample moves, so it is obvious which points were projected. */
const onZ1: ProjectToSurface = (point) => [point[0], point[1], 1];
const nowhere: ProjectToSurface = () => undefined;

describe('surface path resampling', () => {
  it('has nothing to resample without a segment', () => {
    expect(resamplePath(pathOf(false, [0, 0, 0]), 1, onZ1)).toBeUndefined();
    expect(resamplePath(pathOf(false), 1, onZ1)).toBeUndefined();
  });

  it('keeps the anchors exactly and never re-projects them', () => {
    const line = pathOf(false, [0, 0, 0], [1, 0, 0]);
    // Spacing wider than the segment: the ends and nothing between them.
    const out = resamplePath(line, 10, onZ1)!;
    expect(out.points).toEqual([[0, 0, 0], [1, 0, 0]]);
    expect(out.samples).toBe(0);
    expect(out.projected).toBe(0);
  });

  it('fills a segment at about the spacing asked for, and puts every sample on the surface', () => {
    const line = pathOf(false, [0, 0, 0], [4, 0, 0]);
    const out = resamplePath(line, 1, onZ1)!;
    // Four units at a spacing of one: three samples between the two ends.
    expect(out.samples).toBe(3);
    expect(out.projected).toBe(3);
    expect(out.points).toHaveLength(5);
    expect(out.points[0]).toEqual([0, 0, 0]);
    expect(out.points[4]).toEqual([4, 0, 0]);
    // The in-between points were moved onto the surface; the anchors were not.
    for (const point of out.points.slice(1, 4)) expect(point[2]).toBe(1);
  });

  /*
   * One unreachable spot must not void the whole curve. A rim can run past a hole or off an edge, and
   * throwing away the operator's drawing for it would be the wrong trade - so the sample keeps its
   * straight-line position and the counts say how much of the curve really sits on the model.
   */
  it('falls back to the straight line where the surface is not found, and says how often', () => {
    const line = pathOf(false, [0, 0, 0], [4, 0, 0]);
    const out = resamplePath(line, 1, nowhere)!;
    expect(out.samples).toBe(3);
    expect(out.projected).toBe(0);
    expect(out.points).toHaveLength(5);
    for (const point of out.points) expect(point[2]).toBe(0);
  });

  it('comes back round a closed path without repeating its first point', () => {
    const triangle = pathOf(true, [0, 0, 0], [3, 0, 0], [0, 3, 0]);
    const out = resamplePath(triangle, 10, onZ1)!;
    // One point per anchor, and no closing duplicate: `DentalRim.points` has the same rule.
    expect(out.points).toEqual([[0, 0, 0], [3, 0, 0], [0, 3, 0]]);
    const open = resamplePath({ ...triangle, closed: false }, 10, onZ1)!;
    expect(open.points).toHaveLength(3);
  });

  it('bounds the work a silly spacing can ask for', () => {
    const line = pathOf(false, [0, 0, 0], [1000, 0, 0]);
    const out = resamplePath(line, 1e-6, onZ1, 16)!;
    expect(out.samples).toBe(16);
    expect(out.points).toHaveLength(18);
  });

  it('flattens to the xyz array the engine takes', () => {
    const out = resamplePath(pathOf(true, [0, 0, 0], [1, 0, 0], [0, 1, 0]), 10, onZ1)!;
    const flat = pathPointArray(out);
    expect(flat).toBeInstanceOf(Float32Array);
    expect(flat).toHaveLength(9);
    expect([...flat.slice(0, 3)]).toEqual([0, 0, 0]);
    expect([...flat.slice(3, 6)]).toEqual([1, 0, 0]);
  });
});
