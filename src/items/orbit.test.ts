// Copyright (c) Mixo Creative.

import { describe, expect, it } from 'vitest';
import { NO_TURN, orbitPosition, RADIANS_PER_PIXEL, turnedBy, type Orbit } from './orbit';
import { thumbFraming } from './thumbnail';
import type { Vector } from '@mixo-geocore/host/core/vec3';

/** A model about the size of an arch, off the origin so a bug that assumes it is centred shows. */
const framing = thumbFraming({ min: [10, -4, 2] as unknown as Vector, max: [72, 54, 23] as unknown as Vector });
const radiusOf = (p: Vector) => Math.hypot(p[0] - framing.target[0], p[1] - framing.target[1], p[2] - framing.target[2]);

describe('turning a card model', () => {
  it('starts exactly where the still was drawn from, so going live never makes the model jump', () => {
    /*
     * THE PROPERTY THAT MATTERS. A card shows a PNG until the operator points at it, then the same
     * model live. If the first live frame is framed even slightly differently, the model appears to
     * move on its own at the moment of handover - and an operator reading a worklist will take that
     * as the model having shifted, which is the one thing this screen must never imply.
     */
    const at = orbitPosition(framing, NO_TURN);

    expect(at[0]).toBeCloseTo(framing.position[0], 6);
    expect(at[1]).toBeCloseTo(framing.position[1], 6);
    expect(at[2]).toBeCloseTo(framing.position[2], 6);
  });

  it('turns without ever changing the distance, because this rotates and does not zoom', () => {
    const start = radiusOf(orbitPosition(framing, NO_TURN));

    for (const orbit of [{ yaw: 0.7, pitch: 0 }, { yaw: -2.4, pitch: 0.5 }, { yaw: 9, pitch: -1.2 }]) {
      expect(radiusOf(orbitPosition(framing, orbit))).toBeCloseTo(start, 6);
    }
  });

  it('comes back to where it started after a full turn', () => {
    const full = orbitPosition(framing, { yaw: Math.PI * 2, pitch: 0 });
    const none = orbitPosition(framing, NO_TURN);

    [0, 1, 2].forEach((axis) => expect(full[axis]).toBeCloseTo(none[axis]!, 6));
  });

  it('never passes over the poles, however far the drag goes', () => {
    /*
     * At exactly up or down the azimuth stops meaning anything and the model snaps round, which
     * reads as the preview breaking. A drag can carry any distance - a trackpad flick is hundreds
     * of pixels - so the clamp has to hold at absurd values, not just plausible ones.
     */
    const up = orbitPosition(framing, { yaw: 0, pitch: 50 });
    const down = orbitPosition(framing, { yaw: 0, pitch: -50 });
    const radius = radiusOf(up);

    // Still off the pole: the camera keeps a ring radius rather than collapsing onto the axis.
    expect(Math.hypot(up[0] - framing.target[0], up[2] - framing.target[2])).toBeGreaterThan(radius * 0.05);
    expect(Math.hypot(down[0] - framing.target[0], down[2] - framing.target[2])).toBeGreaterThan(radius * 0.05);
    expect(up[1]).toBeGreaterThan(framing.target[1]);
    expect(down[1]).toBeLessThan(framing.target[1]);
  });

  it('accumulates drag without clamping, so a drag up and back down returns to where it was', () => {
    // Clamping while accumulating is the classic version of this bug: the model sticks at the top
    // and the operator has to drag back twice as far to free it.
    const turned: Orbit = turnedBy(turnedBy(NO_TURN, 0, 4000), 0, -4000);

    expect(turned.pitch).toBeCloseTo(0, 9);
  });

  it('turns at the same rate as the viewport, so a hand that learned the editor is not surprised', () => {
    /*
     * PINNED, because it drifted. The first value here was `Math.PI / 320` under a comment claiming
     * "a little over half a turn" across a card - the arithmetic gives 124 degrees, a third - and
     * against the viewport's `angularSensibilityFor` (a whole turn per canvas height) the card
     * turned three times slower than the view it is a preview of. Nothing tested it, so nothing
     * said so.
     */
    const cardWidth = 228;

    expect(RADIANS_PER_PIXEL * cardWidth).toBeCloseTo(2 * Math.PI, 6);
  });

  it('turns the model the way the pointer moves', () => {
    // Drag right, the model turns right. Nothing else here is checkable by reasoning, and a sign
    // error is invisible in a screenshot but immediately wrong under a hand.
    const right = turnedBy(NO_TURN, 100, 0);
    const left = turnedBy(NO_TURN, -100, 0);

    expect(right.yaw).toBeLessThan(0);
    expect(left.yaw).toBeGreaterThan(0);
    expect(right.yaw).toBeCloseTo(-left.yaw, 9);
  });
});
