import { describe, expect, it } from 'vitest';
import type { SurfaceAnchor, SurfacePath } from '../../core/surfacePath/path';
import { SPAN_SAMPLES } from '../../core/surfacePath/spline';
import { RIM_ANCHOR_RADIUS_MM, RIM_DRAFT_LIFT_MM, RIM_GRAB_REACH_MM, anchorCentre, anchorCentres, closesLoop, grabAnchor, linePositions, nearestAnchor } from './rimDraftGeometry';

/** Float32 keeps about seven digits, and a spline endpoint is a mix of two equal values, not a copy. */
const closeToAll = (got: Float32Array, want: readonly number[], from = 0) =>
  want.forEach((value, i) => expect(got[from + i]).toBeCloseTo(value, 5));

const at = (x: number, y: number, z: number, normal: readonly [number, number, number] = [0, 1, 0]): SurfaceAnchor =>
  ({ position: [x, y, z], normal: [...normal] });
const path = (anchors: readonly SurfaceAnchor[], closed = false): SurfacePath => ({ anchors: [...anchors], closed });

describe('the drawn rim as geometry', () => {
  it('lifts an anchor off the surface along its OWN normal, by the lift distance exactly', () => {
    expect(anchorCentre(at(1, 2, 3), 0.5)).toEqual([1, 2.5, 3]);
    // A slanted wall: the marker leaves along the wall's normal, not straight up.
    const slanted = at(0, 0, 0, [Math.SQRT1_2, Math.SQRT1_2, 0]);
    const [x, y, z] = anchorCentre(slanted, 1);
    expect(x).toBeCloseTo(Math.SQRT1_2, 12);
    expect(y).toBeCloseTo(Math.SQRT1_2, 12);
    expect(z).toBeCloseTo(0, 12);
    // The lift is a DISTANCE, so an unnormalised normal must not stretch it.
    const long = at(0, 0, 0, [0, 7, 0]);
    expect(anchorCentre(long, 0.25)).toEqual([0, 0.25, 0]);
  });

  it('leaves a point alone when its normal says nothing', () => {
    // A zero normal cannot point out of anything. Guessing a direction would move the marker off the
    // spot it names, which is worse than letting it sit exactly on the surface.
    expect(anchorCentre(at(4, 5, 6, [0, 0, 0]))).toEqual([4, 5, 6]);
  });

  it('defaults the lift to the shared constant, so the line and the markers never disagree', () => {
    const only = path([at(0, 0, 0)]);
    expect(anchorCentres(only)[0]).toEqual([0, RIM_DRAFT_LIFT_MM, 0]);
  });

  it('draws a run of pairs per segment, and the closing run only when the loop is closed', () => {
    const three = [at(0, 0, 0), at(1, 0, 0), at(1, 0, 1)];
    const open = linePositions(path(three), 0);
    // Two segments, `SPAN_SAMPLES` sub-chords each, six numbers a sub-chord.
    expect(open).toHaveLength(2 * SPAN_SAMPLES * 6);
    // The line starts ON the first anchor and ends ON the last: a span's ends are its anchors exactly,
    // which is what lets the drawn line meet the markers and the pick agree about where a span is.
    closeToAll(open, [0, 0, 0]);
    closeToAll(open, [1, 0, 1], open.length - 3);
    // Closed: a third segment appears, and it comes back round to the first anchor.
    const closed = linePositions(path(three, true), 0);
    expect(closed).toHaveLength(3 * SPAN_SAMPLES * 6);
    closeToAll(closed, [0, 0, 0], closed.length - 3);
  });

  /*
   * A CURVE THROUGH POINTS IN A LINE MUST STAY IN THAT LINE. Nothing here is bending, so a sample off
   * the axis would be the spline inventing a shape the operator never drew - and since a press is
   * measured against these same samples, it would move the pressable line away from the handles. This
   * is the cheap guard on the centripetal choice: the uniform variant can bulge between uneven points.
   */
  it('draws a straight run straight', () => {
    const line = linePositions(path([at(0, 0, 0), at(1, 0, 0), at(3, 0, 0)]), 0);
    for (let i = 0; i < line.length; i += 3) {
      expect(line[i + 1], `sample ${i / 3} left the axis`).toBeCloseTo(0, 6);
      expect(line[i + 2], `sample ${i / 3} left the axis`).toBeCloseTo(0, 6);
      expect(line[i]!, `sample ${i / 3} ran past the ends`).toBeGreaterThanOrEqual(-1e-5);
      expect(line[i]!, `sample ${i / 3} ran past the ends`).toBeLessThanOrEqual(3 + 1e-5);
    }
  });

  it('draws nothing for a path that cannot have a segment yet', () => {
    expect(linePositions(path([]), 0)).toHaveLength(0);
    expect(linePositions(path([at(0, 0, 0)]), 0)).toHaveLength(0);
  });

  it('finds the nearest anchor, and nothing at all on an empty path', () => {
    const three = path([at(0, 0, 0), at(10, 0, 0), at(0, 0, 10)]);
    expect(nearestAnchor(three, [9, 0, 0])).toEqual({ at: 1, distanceMm: 1 });
    expect(nearestAnchor(path([]), [0, 0, 0])).toBeUndefined();
  });

  it('picks up the anchor under the press, and nothing on bare surface', () => {
    const three = path([at(0, 0, 0), at(10, 0, 0), at(0, 0, 10)]);
    expect(grabAnchor(three, [10, 0, 0])).toBe(1);
    // A little wide of the marker still counts: the operator aims at a sphere, not at its exact radius.
    expect(grabAnchor(three, [10 - RIM_GRAB_REACH_MM * 0.9, 0, 0])).toBe(1);
    // Bare surface picks up nothing, so the press belongs to whatever else wants it.
    expect(grabAnchor(three, [5, 0, 0])).toBeUndefined();
    expect(grabAnchor(path([]), [0, 0, 0])).toBeUndefined();
    // The reach is wider than the marker, which is the whole point of having its own constant.
    expect(RIM_GRAB_REACH_MM).toBeGreaterThan(RIM_ANCHOR_RADIUS_MM);
  });

  it('closes the loop only on the FIRST anchor, only when open, and only from three anchors', () => {
    const three = [at(0, 0, 0), at(10, 0, 0), at(0, 0, 10)];
    const reach = RIM_ANCHOR_RADIUS_MM * 1.6;
    expect(closesLoop(path(three), [reach * 0.5, 0, 0])).toBe(true);
    // Just outside the marker: this is a new anchor, not a close. What closes the loop is what is seen.
    expect(closesLoop(path(three), [reach * 1.5, 0, 0])).toBe(false);
    // The LAST anchor is not the first: clicking it adds, it does not join.
    expect(closesLoop(path(three), [0, 0, 10])).toBe(false);
    // Two anchors enclose nothing, and an already-closed loop has nothing left to close.
    expect(closesLoop(path(three.slice(0, 2)), [0, 0, 0])).toBe(false);
    expect(closesLoop(path(three, true), [0, 0, 0])).toBe(false);
  });
});
