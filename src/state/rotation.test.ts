// Copyright (c) Mixo Creative.

import { describe, expect, it } from 'vitest';
import { reorients, rotationChanged } from './rotation';

/**
 * THE ONE RULE THAT DECIDES WHETHER A TURN COSTS THE OPERATOR THEIR SUPPORTS.
 *
 * Both halves matter and they pull in opposite directions, which is why they are tested together: a
 * rule that cleared too eagerly would throw away a finished denture's supports on a plate
 * re-arrangement (proved valid to 1e-5 mm by `rigidMove.real.test.ts`), and a rule that cleared too
 * little would leave an operator looking at supports planted for a pose that no longer exists.
 */

describe('whether the rotation changed at all', () => {
  it('says no for a pure slide, so nudging a model across the plate costs nothing', () => {
    expect(rotationChanged([0.3, 0.2, 0.1], [0.3, 0.2, 0.1])).toBe(false);
  });

  it('says yes for any of the three angles, by exact equality rather than a tolerance', () => {
    expect(rotationChanged([0, 0, 0], [1e-15, 0, 0])).toBe(true);
    expect(rotationChanged([0, 0, 0], [0, 0, -1e-15])).toBe(true);
  });
});

describe('what counts as a re-orient', () => {
  it('spares a slide and a spin, which is the denture keep-and-move rule the reducer must not break', () => {
    expect(reorients([0, 0, 0], [0, 0, 0])).toBe(false);
    expect(reorients([0, 0.4, 0], [0, 2.1, 0])).toBe(false);
  });

  /*
   * THE EULER ANGLES ARE NOT THE TURN, and this is the trap the matrix comparison exists for: from a
   * TILTED pose, nudging the middle Euler number spins the model about its OWN axis, not the plate's
   * vertical, and the supports really are invalid afterwards. `rigidMove.test.ts` states the same
   * thing from the other side.
   */
  it('is not fooled by a Euler Y nudge from a tilted pose, which is a turn about the model s own axis', () => {
    expect(reorients([0.3, 0.2, 0.1], [0.3, 0.9, 0.1])).toBe(true);
  });

  it('is any other turn: the supports were planted for a pose that no longer exists', () => {
    // The print-angle tilt Step 1 applies is exactly this, and so is dragging the rotate gizmo.
    expect(reorients([0, 0, 0], [0.2, 0, 0])).toBe(true);
    expect(reorients([0, 0, 0], [0, 0, Math.PI])).toBe(true);
  });
});
