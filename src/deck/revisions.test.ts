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

  it('says nothing about work with NOTHING above it, which is a missing prerequisite not an age', () => {
    // Supports recorded and nothing else: the prerequisite is MISSING, which greys the tool.
    expect(staleTools({ supports: 2 })).toEqual([]);
  });

  /*
   * ACROSS A GAP. The first version walked one link and gave up where that link had no work, so this
   * reported nothing stale - Supports read ready although a re-orient had left it five revisions
   * behind. `revisionsField` accepts gapped records (it checks key names and positive integers, not
   * contiguity), so this is a record a saved project can really hold.
   */
  it('reaches past a tool that has no work of its own', () => {
    expect(staleTools({ orient: 5, area: 1 })).toEqual(['area']);
    expect(staleTools({ orient: 7, supports: 2 })).toEqual(['supports']);
    expect(staleTools({ rim: 4, supports: 1 })).toEqual(['supports']);
  });

  it('carries past a middle link whose own numbers look fine', () => {
    // supports(6) is NEWER than area(5), so its direct comparison is clean - the staleness can only
    // come from orient(9) further up. The first version got this right only by accident, because its
    // test case had supports older than area too.
    expect(staleTools({ orient: 9, rim: 2, area: 5, supports: 6 })).toEqual(['rim', 'area', 'supports']);
  });

  it('leaves work alone that is newer than everything above it', () => {
    expect(staleTools({ orient: 1, rim: 2, area: 3, supports: 9 })).toEqual([]);
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
