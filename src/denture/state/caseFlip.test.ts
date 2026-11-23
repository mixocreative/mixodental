import { describe, expect, it } from 'vitest';
import { engineCaseFlip, normalizeFlip, toggledFlip } from './caseFlip';

describe('a denture case flip (WORKBENCH-TABS-PLAN C2)', () => {
  it('turning a side round twice is no flip, and the engine is told only a real one', () => {
    const once = toggledFlip(undefined, 'front');
    expect(once).toEqual({ front: true, teeth: false });
    expect(toggledFlip(once, 'teeth')).toEqual({ front: true, teeth: true });
    expect(toggledFlip(once, 'front')).toBeUndefined();
    expect(engineCaseFlip({ dentureFlip: { front: false, teeth: false } })).toBeUndefined();
    expect(engineCaseFlip({ dentureFlip: once })).toEqual(once);
    expect(engineCaseFlip({})).toBeUndefined();
  });
  it('a saved flip is checked', () => {
    expect(normalizeFlip({ front: true, teeth: false })).toEqual({ front: true, teeth: false });
    expect(() => normalizeFlip({ front: 'yes' } as never)).toThrow(/true or false/);
  });
});
