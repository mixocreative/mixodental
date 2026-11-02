import { describe, expect, it } from 'vitest';
import { reasonOfFace } from './ruleSpots';
import { splitByRule } from './acceptedSpots';

const spot = (x: number) => ({ position: [x, 0, 0] as [number, number, number], area: 5, kind: 'overhang' as const });

describe('reasonOfFace', () => {
  const none = { allowed: 0, holeBand: 0, noSupport: 0, rimBand: 0 };
  it('a face the rules support is a real problem', () => {
    expect(reasonOfFace({ ...none, allowed: 1 })).toBeNull();
    expect(reasonOfFace({ ...none, holeBand: 1, noSupport: 1 })).toBeNull();
  });
  it('a face the rules leave unsupported says why', () => {
    expect(reasonOfFace({ ...none, noSupport: 1 })).toBe('no-support');
    expect(reasonOfFace({ ...none, rimBand: 1 })).toBe('rim');
    expect(reasonOfFace(none)).toBe('outside-allowed');
  });
});

describe('splitByRule', () => {
  it('keeps real problems and groups the accepted ones by reason', () => {
    const spots = [spot(1), spot(2), spot(3), spot(4)];
    const { real, accepted } = splitByRule(spots, ['outside-allowed', null, 'rim', 'outside-allowed']);
    expect(real).toEqual([spots[1]]);
    expect(accepted).toEqual([{ reason: 'outside-allowed', points: [[1, 0, 0], [4, 0, 0]] }, { reason: 'rim', points: [[3, 0, 0]] }]);
  });
  it('lists nothing accepted when every spot is real', () => {
    expect(splitByRule([spot(1)], [null]).accepted).toEqual([]);
  });
});
