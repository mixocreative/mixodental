import { describe, expect, it } from 'vitest';
import type { DentalTiltState } from '../../../components/useDentalFlow';
import { dialFollowsPose } from './dialSync';

const rows = [0, 1, 2].map((i) => ({ tiltDeg: i * 5, rotation: [i * 0.1, 0, 0] as [number, number, number] }));
const ready = (index: number, hand = false) => ({ status: 'ready', unitId: 'u', scan: { kind: 'scan', rows, order: [1] }, index, hand, confirming: false }) as unknown as Extract<DentalTiltState, { status: 'ready' }>;

describe('dialFollowsPose', () => {
  it('keeps the dial when it already shows the pose', () => {
    const tilt = ready(2, true);
    expect(dialFollowsPose(tilt, [0.2, 0, 0])).toBe(tilt);
  });
  it('Undo of a dial turn moves the dial to the row of the pose now shown', () => {
    const turned = dialFollowsPose(ready(2, true), [0.1, 0, 0]);
    expect(turned.index).toBe(1);
    expect(turned.hand).toBe(false);
  });
  it('a pose that is no row marks the dial as hand-set and keeps its index', () => {
    const turned = dialFollowsPose(ready(1), [0.55, 0.2, 0]);
    expect(turned.index).toBe(1);
    expect(turned.hand).toBe(true);
  });
});
