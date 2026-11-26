import { describe, expect, it } from 'vitest';
import { supToBare, targetStateOf } from './dentureReviewLayers';

describe('why a case can or cannot be compared with its -sup target', () => {
  it('no target at all, versus a target whose contacts were never extracted', () => {
    expect(targetStateOf(false, null, false)).toBe('none');
    expect(targetStateOf(true, null, false)).toBe('no-contacts');
  });
  it('contacts that are empty or do not sit on the scan say the target could not be lined up', () => {
    expect(targetStateOf(true, 0, false)).toBe('not-lined-up');
    expect(targetStateOf(true, 40, false)).toBe('not-lined-up');
    expect(targetStateOf(true, 0, true)).toBe('not-lined-up');
  });
  it('compared only with contacts that line up', () => expect(targetStateOf(true, 40, true)).toBe('ok'));
});

describe('a -sup point back on the bare scan (Y-up both sides)', () => {
  const close = (got: number[], want: number[]) => got.forEach((v, k) => expect(v).toBeCloseTo(want[k]!, 9));
  it('a pure lift gives what the old shift gave: minus the lift, in Y-up', () => {
    // transform_bare_to_sup in Z-up: lifted 3.5 mm along z, shifted 1 mm along x.
    const lift = [[1, 0, 0, 1], [0, 1, 0, 0], [0, 0, 1, 3.5], [0, 0, 0, 1]];
    close(supToBare(lift)([2, 13.5, 4], 0), [1, 10, 4]);
  });
  it('a turned target maps back instead of throwing (the old code threw on any rotation)', () => {
    // 90 degrees about Z-up z: (x, y, z) -> (-y, x, z). A bare Z-up point (1, 2, 3) lands at (-2, 1, 3) on the target,
    // which is (-2, 3, -1) in Y-up; mapping it back must give the bare point's Y-up (1, 3, -2).
    const turn = [[0, -1, 0, 0], [1, 0, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]];
    close(supToBare(turn)(Float32Array.of(9, -2, 3, -1), 1), [1, 3, -2]);
  });
});
