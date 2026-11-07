import { describe, expect, it } from 'vitest';
import { accepted, nextRevision, staleTools, type Revisions } from './revisions';

/** Everything accepted in the rail's own order, nothing out of date. */
const inOrder: Revisions = { orient: 1, rim: 2, area: 3, supports: 4 };

describe('whose work is out of date', () => {
  it('is nobody, when every tool was accepted after the one above it', () => {
    expect(staleTools(inOrder)).toEqual([]);
  });

  it('is nobody on a model nothing has been done to', () => {
    expect(staleTools({})).toEqual([]);
  });

  it('does not call a tool with no work stale: that is greyed, not aged', () => {
    // Orient accepted, nothing else done. The rim is unavailable, and saying "out of date" about
    // work that was never made would be a sentence with no meaning behind it.
    expect(staleTools({ orient: 1 })).toEqual([]);
  });

  it('CASCADES from a re-orient, so the supports three links down are told', () => {
    // Orient accepted again: its number is now above all three below it.
    expect(staleTools(accepted(inOrder, 'orient'))).toEqual(['rim', 'area', 'supports']);
  });

  it('leaves the rim alone when only the area was redone, because the rim was not affected', () => {
    // The lie worth avoiding: marking everything stale on any change makes the operator work out
    // which of it actually matters.
    expect(staleTools(accepted(inOrder, 'area'))).toEqual(['supports']);
  });

  it('reaches the supports when the rim is redone, through the area between them', () => {
    expect(staleTools(accepted(inOrder, 'rim'))).toEqual(['area', 'supports']);
  });

  it('says nothing about work whose upstream was never accepted at all', () => {
    // Supports recorded, no area: the prerequisite is MISSING, which greys the tool. Staleness is a
    // statement about work that exists and this is a different failure.
    expect(staleTools({ supports: 2 })).toEqual([]);
  });

  it('cascades even when the middle link is itself still newer than its own work', () => {
    // area(5) is newer than supports(4), and rim(2) is older than orient(9): every link below the
    // re-orient is stale, and the cascade has to carry past area rather than stopping at the first
    // link whose own numbers happen to look fine.
    expect(staleTools({ orient: 9, rim: 2, area: 5, supports: 4 })).toEqual(['rim', 'area', 'supports']);
  });
});

describe('stamping work as accepted', () => {
  it('takes a number above everything already recorded', () => {
    expect(nextRevision(inOrder)).toBe(5);
    expect(nextRevision({})).toBe(1);
  });

  it('counts from the highest, not from the tool being stamped', () => {
    // Were it per-tool, re-accepting Orient would give it 2 - below the supports' 4 - and the
    // supports would not go stale. The counter is per UNIT for exactly this reason.
    expect(accepted(inOrder, 'orient').orient).toBeGreaterThan(inOrder.supports!);
  });

  it('leaves the other tools untouched, so their work is kept rather than cleared', () => {
    const after = accepted(inOrder, 'orient');
    expect({ rim: after.rim, area: after.area, supports: after.supports })
      .toEqual({ rim: 2, area: 3, supports: 4 });
  });
});
