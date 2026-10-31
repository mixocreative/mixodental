import { describe, expect, it } from 'vitest';
import type { DentureIsland } from '@mixo-geocore/host/dental/dentureIslands';
import { describeUnresolved, islandPoints, summariseIslands } from './islandReport';

const island = (over: Partial<DentureIsland>): DentureIsland => ({ position: [0, 0, 0], heightMm: 1, areaMm2: 0.5, state: 'tipped', resolved: true, reason: 'own tip at the lowest point', tipIndex: 0, ...over });

describe('island report', () => {
  const islands = [
    island({}),
    island({ state: 'servedNearby', reason: 'served by a tip nearby', tipIndex: 1, position: [1, 0, 0] }),
    island({ state: 'belowMinSize', resolved: false, reason: 'below min size', tipIndex: undefined, position: [2, 0, 0], heightMm: 2.34, areaMm2: 0.02 }),
    island({ state: 'outsideAllowed', resolved: false, reason: 'outside allowed area', tipIndex: undefined, position: [3, 0, 0] }),
  ];

  it('counts islands not tipped or served as unresolved, from the one report', () => {
    const summary = summariseIslands(islands);
    expect(summary.resolved).toHaveLength(2);
    expect(summary.unresolved.map((i) => i.state)).toEqual(['belowMinSize', 'outsideAllowed']);
    expect(summary.outsideAllowed).toBe(1);
    expect(islandPoints(summary.unresolved)).toEqual([[2, 0, 0], [3, 0, 0]]);
  });

  it('moves an island whose serving tip the build left out to unresolved, with the reason', () => {
    const summary = summariseIslands(islands, { candidateIds: ['denture-min-0', 'denture-min-1'], leftOut: [{ id: 'denture-min-1', reason: 'leave-out:pillar 3' }] });
    expect(summary.resolved).toHaveLength(1);
    expect(summary.unresolved).toHaveLength(3);
    expect(summary.islands[1]).toMatchObject({ state: 'leftOut', resolved: false, reason: 'left out: leave-out:pillar 3' });
  });

  it('writes the unresolved islands with height, size and reason', () => {
    expect(describeUnresolved([])).toBe('none');
    expect(describeUnresolved(summariseIslands(islands).unresolved)).toBe('#1: 2.3 mm high, 0.02 mm², below min size; #2: 1.0 mm high, 0.50 mm², outside allowed area');
  });
});
