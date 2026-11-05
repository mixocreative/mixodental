import { describe, expect, it } from 'vitest';
import type { Vector } from '@mixo-geocore/host/core/vec3';
import type { SurfacePath } from './path';
import { anchorsInPlane, facingNormal, pathCentroid, pathFrame, pathLength, toPlane } from './frame';

const pathOf = (closed: boolean, ...positions: Vector[]): SurfacePath =>
  ({ anchors: positions.map((position) => ({ position, normal: [0, 0, 1] as Vector })), closed });
const square = (closed = true): SurfacePath => pathOf(closed, [0, 0, 0], [2, 0, 0], [2, 2, 0], [0, 2, 0]);

describe('surface path frame', () => {
  it('centres on the mean of the anchors', () => {
    expect(pathCentroid(square())).toEqual([1, 1, 0]);
    expect(pathCentroid(pathOf(true))).toBeUndefined();
  });

  it('fits the plane of a closed loop and measures its area in it', () => {
    const frame = pathFrame(square());
    expect(frame).toBeDefined();
    expect(frame!.centroid).toEqual([1, 1, 0]);
    // The side is arbitrary; the axis is not.
    expect(Math.abs(frame!.normal[2]!)).toBeCloseTo(1, 12);
    // A 2x2 square: area 4, so twice that.
    expect(frame!.planarDoubleArea).toBeCloseTo(8, 10);
    // The basis spans the plane and is right-handed about the normal.
    expect(frame!.tangent[2]).toBeCloseTo(0, 12);
    expect(frame!.bitangent[2]).toBeCloseTo(0, 12);
  });

  it('has no frame for an open path, which lies in no plane of its own', () => {
    expect(pathFrame(square(false))).toBeUndefined();
  });

  it('has no frame for collinear anchors', () => {
    expect(pathFrame(pathOf(true, [0, 0, 0], [1, 0, 0], [2, 0, 0], [3, 0, 0]))).toBeUndefined();
  });

  /*
   * The case that made this stop using Newell's method. A symmetric bowtie's signed areas CANCEL, so
   * Newell's normal is exactly zero and the frame would be undefined - which would report the loop as
   * collinear, the one diagnosis a reader cannot act on, for the one shape they most need told about.
   * Its four anchors share a perfectly good plane, and this must find it.
   */
  it('still fits a plane for a loop that crosses itself and cancels its own area', () => {
    const bowtie = pathOf(true, [0, 0, 0], [1, 1, 0], [1, 0, 0], [0, 1, 0]);
    const frame = pathFrame(bowtie);
    expect(frame).toBeDefined();
    expect(Math.abs(frame!.normal[2]!)).toBeCloseTo(1, 12);
    // The area really is zero - that is what makes it degenerate - but the PLANE exists.
    expect(frame!.planarDoubleArea).toBeCloseTo(0, 10);
  });

  it('projects into the plane about the centroid, and back out in order', () => {
    const frame = pathFrame(square())!;
    expect(toPlane(frame, frame.centroid)).toEqual([0, 0]);
    const flat = anchorsInPlane(square(), frame);
    expect(flat).toHaveLength(4);
    // Each corner of a 2x2 square sits one unit out along each plane axis.
    for (const [u, v] of flat) expect(Math.hypot(u, v)).toBeCloseTo(Math.SQRT2, 10);
  });

  it('turns the normal to the side the caller names, and never guesses the side itself', () => {
    const frame = pathFrame(square())!;
    const up = facingNormal(frame, [0, 0, 1]);
    const down = facingNormal(frame, [0, 0, -1]);
    expect(up![2]).toBeCloseTo(1, 12);
    expect(down![2]).toBeCloseTo(-1, 12);
    // A side that says nothing is refused rather than resolved.
    expect(facingNormal(frame, [0, 0, 0])).toBeUndefined();
    expect(facingNormal(frame, [Number.NaN, 0, 1])).toBeUndefined();
  });

  it('measures the perimeter of a loop and the run of a line', () => {
    expect(pathLength(square(true))).toBeCloseTo(8, 10);
    expect(pathLength(square(false))).toBeCloseTo(6, 10);
  });
});
