import { describe, expect, it } from 'vitest';
import { stamped, staleTools, supportsNeedReplanting, type Revisions } from './revisions';

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
    expect(staleTools(stamped(inOrder, 'orient', true)!)).toEqual(['rim', 'area', 'supports']);
  });

  it('leaves the rim alone when only the area was redone, because the rim was not affected', () => {
    // The lie worth avoiding: marking everything stale on any change makes the operator work out
    // which of it actually matters.
    expect(staleTools(stamped(inOrder, 'area', true)!)).toEqual(['supports']);
  });

  it('reaches the supports when the rim is redone, through the area between them', () => {
    expect(staleTools(stamped(inOrder, 'rim', true)!)).toEqual(['area', 'supports']);
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

describe('the one question the export gate asks', () => {
  /*
   * FOUND BY AUDIT (`docs/reviews/2026-11-08-cia-deck-and-flow.md` F5). Export wrote supports planted
   * before the model was turned, with no refusal: the only warning was a status line that the next
   * message replaced. The signal existed the whole time - this is it, named and consulted.
   */
  it('is true exactly when the supports predate something above them', () => {
    expect(supportsNeedReplanting({ orient: 2, supports: 1 })).toBe(true);
    expect(supportsNeedReplanting({ orient: 1, supports: 2 })).toBe(false);
    // Re-painting the area is also above the supports, and is also a reason to re-plant.
    expect(supportsNeedReplanting({ orient: 1, area: 3, supports: 2 })).toBe(true);
  });

  it('is false when there are no supports to re-plant, and on a unit with no record at all', () => {
    // Staleness is a statement about work that EXISTS: a unit with no supports is not stale, it is
    // unsupported, and refusing its export would be refusing the wrong thing.
    expect(supportsNeedReplanting({ orient: 5 })).toBe(false);
    expect(supportsNeedReplanting({})).toBe(false);
    expect(supportsNeedReplanting(undefined)).toBe(false);
  });
});

describe('stamping work as accepted', () => {
  it('takes a number above everything already recorded', () => {
    expect(stamped(inOrder, 'orient', true)!.orient).toBe(5);
    expect(stamped({}, 'orient', true)!.orient).toBe(1);
  });

  it('counts from the highest, not from the tool being stamped', () => {
    // Were it per-tool, re-accepting Orient would give it 2 - below the supports' 4 - and the
    // supports would not go stale. The counter is per UNIT for exactly this reason.
    expect(stamped(inOrder, 'orient', true)!.orient).toBeGreaterThan(inOrder.supports!);
  });

  it('leaves the other tools untouched, so their work is kept rather than cleared', () => {
    const after = stamped(inOrder, 'orient', true)!;
    expect({ rim: after.rim, area: after.area, supports: after.supports })
      .toEqual({ rim: 2, area: 3, supports: 4 });
  });

  it('takes a revision away when its work is removed, leaving nothing behind at the last one', () => {
    expect(stamped(inOrder, 'supports', false)).toEqual({ orient: 1, rim: 2, area: 3 });
    expect(stamped({ orient: 1 }, 'orient', false)).toBeUndefined();
    // Removing what was never recorded changes nothing, rather than inventing an empty record.
    expect(stamped({ orient: 1 }, 'supports', false)).toEqual({ orient: 1 });
  });
});
