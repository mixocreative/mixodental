import { describe, expect, it } from 'vitest';
import type { Vector } from '@mixo-geocore/host/core/vec3';
import type { SurfaceAnchor, SurfacePath } from '../../core/surfacePath/path';
import { RIM_INSERT_CLEAR_MM, RIM_LINE_REACH_MM, rimTargetAt } from './rimTarget';

const anchor = (x: number, z: number): SurfaceAnchor => ({ position: [x, 0, z], normal: [0, 1, 0] });
const square = (closed: boolean): SurfacePath =>
  ({ anchors: [anchor(0, 0), anchor(20, 0), anchor(20, 20), anchor(0, 20)], closed });

describe('what a press on the rim means', () => {
  /*
   * THE RULE THE WHOLE GRAMMAR RESTS ON: a handle always wins. A press that nearly hits one must
   * become a DRAG of it, never a new handle a fraction of a millimetre away - the operator would not
   * see that until the shape went wrong, which is the silent-failure shape this project keeps
   * finding. Both routes to it are tested: inside the marker's grab reach, and on the line but too
   * close to a handle to be a new one.
   */
  it('gives a near miss on a handle to that handle, not to a new one', () => {
    expect(rimTargetAt(square(true), [0.3, 0, 0])).toEqual({ kind: 'handle', at: 0 });
    // On the line between handle 0 and 1, but within the insert clearance of handle 0.
    expect(rimTargetAt(square(true), [RIM_INSERT_CLEAR_MM / 2, 0, 0])).toEqual({ kind: 'handle', at: 0 });
    expect(rimTargetAt(square(true), [20 - RIM_INSERT_CLEAR_MM / 2, 0, 0])).toEqual({ kind: 'handle', at: 1 });
  });

  /*
   * A RING, NOT THE SQUARE, AND THE FIRST VERSION OF THIS TEST GOT IT WRONG. The curve between two
   * corners of a square bows well away from the chord between them, so a press on the chord's
   * midpoint is nowhere near the line and correctly resolved to nothing. On a ring of anchors the
   * curve runs within microns of the circle through them, so a press at that radius is independent
   * ground truth for "on the line" rather than the code checked against itself.
   */
  const ring = (count: number, radius: number): SurfacePath => ({
    anchors: Array.from({ length: count }, (_, at) => {
      const angle = (at / count) * Math.PI * 2;
      return anchor(Math.cos(angle) * radius, Math.sin(angle) * radius);
    }),
    closed: true,
  });

  it('inserts where the line is pressed, clear of the handles, and says where it goes', () => {
    const loop = ring(8, 20);
    // Midway between handles 0 and 1 in angle, at the ring's own radius: on the curve, far from both.
    const half = Math.PI / 8;
    const target = rimTargetAt(loop, [Math.cos(half) * 20, 0, Math.sin(half) * 20]);
    expect(target.kind, JSON.stringify(target)).toBe('insert');
    if (target.kind !== 'insert') return;
    // Between handles 0 and 1, so it takes index 1 and pushes the rest along.
    expect(target.at).toBe(1);
    /*
     * AND THE POINT SITS WHERE THE DOCUMENTED CURVE PUTS IT. A centripetal Catmull-Rom span runs
     * slightly INSIDE the arc through its anchors, by about `3*R*theta^4/128` at mid-span - the
     * formula `spline.ts` justifies the 12 mm seeding spacing with. At eight handles on a 20 mm ring
     * that predicts 0.178 mm and the curve delivers 0.17. Asserting the prediction rather than a
     * rounded radius makes this a check of the claim, not just of the arithmetic.
     */
    const theta = (Math.PI * 2) / 8;
    const predicted = (3 * 20 * theta ** 4) / 128;
    const undershoot = 20 - Math.hypot(target.position[0], target.position[2]);
    expect(undershoot, `undershoot ${undershoot}, predicted ${predicted}`).toBeGreaterThan(predicted * 0.7);
    expect(undershoot, `undershoot ${undershoot}, predicted ${predicted}`).toBeLessThan(predicted * 1.3);
  });

  /*
   * A press that is on NEITHER falls through, and what it falls through to is the whole difference
   * between a loop still being drawn and one being corrected. On a closed loop nothing is appended -
   * the model becomes the camera handle, which is the drawing-program behaviour reached without an
   * empty hand.
   */
  it('appends on an open loop and does nothing on a closed one', () => {
    expect(rimTargetAt(square(false), [50, 0, 50])).toEqual({ kind: 'append' });
    expect(rimTargetAt(square(true), [50, 0, 50])).toEqual({ kind: 'none' });
  });

  it('starts a rim from nothing by appending', () => {
    expect(rimTargetAt({ anchors: [], closed: false }, [1, 0, 1])).toEqual({ kind: 'append' });
  });

  /*
   * THE ONE ASYMMETRY THAT STAYS, and it is inherent rather than a mode: while a loop is open its
   * first handle is the way to CLOSE it. Relocating that handle waits until the loop is joined, and
   * the same press on a closed loop grabs it as any other.
   */
  it('closes an open loop from its first handle, and grabs it once closed', () => {
    expect(rimTargetAt(square(false), [0.2, 0, 0])).toEqual({ kind: 'close' });
    expect(rimTargetAt(square(true), [0.2, 0, 0])).toEqual({ kind: 'handle', at: 0 });
  });

  it('will not close a loop that has too few points to be one', () => {
    const two: SurfacePath = { anchors: [anchor(0, 0), anchor(20, 0)], closed: false };
    expect(rimTargetAt(two, [0.2, 0, 0])).toEqual({ kind: 'handle', at: 0 });
  });

  it('ignores the line beyond its reach', () => {
    const beyond: Vector = [10, 0, RIM_LINE_REACH_MM * 3];
    expect(rimTargetAt(square(true), beyond).kind).toBe('none');
  });
});
