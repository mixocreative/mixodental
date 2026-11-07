import { describe, expect, it } from 'vitest';
import { railReason, railStates, TOOL_ORDER, toolState, type ToolFacts, type ToolId } from './toolState';

/** A fresh import: oriented by nothing, no rim, no area. */
const fresh: ToolFacts = { oriented: false, hasRim: false, areaAccepted: false };
const oriented: ToolFacts = { ...fresh, oriented: true };
const withRim: ToolFacts = { ...oriented, hasRim: true };
const withArea: ToolFacts = { ...withRim, areaAccepted: true };

const kinds = (facts: ToolFacts) => Object.fromEntries(railStates(facts).map(({ tool, state }) => [tool, state.kind]));

describe('the rail carries the order', () => {
  it('offers only Orient on a model nothing has been done to', () => {
    expect(kinds(fresh)).toEqual({ orient: 'ready', rim: 'unavailable', area: 'unavailable', supports: 'unavailable' });
  });

  it('opens each tool as its own prerequisite is met, one at a time', () => {
    expect(kinds(oriented)).toEqual({ orient: 'ready', rim: 'ready', area: 'unavailable', supports: 'unavailable' });
    expect(kinds(withRim)).toEqual({ orient: 'ready', rim: 'ready', area: 'ready', supports: 'unavailable' });
    expect(kinds(withArea)).toEqual({ orient: 'ready', rim: 'ready', area: 'ready', supports: 'ready' });
  });

  it('never withholds Orient, which is where every model starts', () => {
    expect(toolState('orient', fresh)).toEqual({ kind: 'ready' });
  });

  it('draws the rail in dependency order, so the order is readable without pressing anything', () => {
    expect(TOOL_ORDER).toEqual(['orient', 'rim', 'area', 'supports']);
    expect(railStates(fresh).map(({ tool }) => tool)).toEqual(TOOL_ORDER);
  });
});

describe('a greyed tool says what to do about it', () => {
  // THE RULE THIS PROTECTS: a disabled control with no explanation is worse than a step, because the
  // operator sees grey and does not know the fix. Every unavailable tool must carry its own line.
  it.each(['rim', 'area', 'supports'] as const)('%s explains itself when it cannot be used', (tool) => {
    const state = toolState(tool, fresh);
    expect(state.kind).toBe('unavailable');
    expect(state.kind === 'unavailable' && state.because.key.length).toBeGreaterThan(10);
  });

  it('gives each tool a DIFFERENT line, because one generic sentence teaches nothing', () => {
    const lines = (['rim', 'area', 'supports'] as const).map((tool) => {
      const state = toolState(tool, fresh);
      return state.kind === 'unavailable' ? state.because.key : '';
    });
    expect(new Set(lines).size).toBe(3);
  });

  it('names the thing to do first, not the thing that is wrong', () => {
    const area = toolState('area', oriented);
    // The area is measured FROM the rim: the line has to point at the rim, which is the fix.
    expect(area.kind === 'unavailable' && area.because.key).toMatch(/rim/i);
  });
});

describe('being made right now is not the same as not yet possible', () => {
  // RULE 2: conflate these and the operator presses a tool, sees grey, and concludes it failed.
  it('shows a generating tool as busy rather than greyed', () => {
    expect(toolState('supports', { ...withArea, busy: 'supports' })).toEqual({ kind: 'busy' });
  });

  it('leaves the other tools alone while one is busy', () => {
    expect(kinds({ ...withArea, busy: 'supports' })).toEqual({ orient: 'ready', rim: 'ready', area: 'ready', supports: 'busy' });
  });

  it('reads BUSY, not stale, for work that is being brought up to date right now', () => {
    // Both are true of it. Telling the operator it is out of date while it is being rebuilt is
    // exactly the confusion rule 2 exists to prevent, so busy wins.
    expect(toolState('supports', { ...withArea, busy: 'supports', stale: ['supports'] })).toEqual({ kind: 'busy' });
  });
});

describe('upstream changing does not throw the downstream work away', () => {
  it('marks a tool stale rather than greying it, because its work is still there', () => {
    expect(kinds({ ...withArea, stale: ['area', 'supports'] }))
      .toEqual({ orient: 'ready', rim: 'ready', area: 'stale', supports: 'stale' });
  });

  it('prefers unavailable to stale, since a missing prerequisite leaves nothing worth opening', () => {
    // An area that was never accepted cannot be "out of date": there is nothing to be out of date.
    expect(toolState('supports', { ...withRim, stale: ['supports'] }).kind).toBe('unavailable');
  });
});

describe('every tool is accounted for', () => {
  it('gives a state to all four, so none can be forgotten by the rail', () => {
    const facts: ToolFacts = { ...withArea, busy: 'orient', stale: ['area'] };
    const seen = railStates(facts).map(({ tool }) => tool);
    expect(new Set(seen)).toEqual(new Set<ToolId>(['orient', 'rim', 'area', 'supports']));
    expect(railStates(facts).every(({ state }) => ['ready', 'busy', 'stale', 'unavailable'].includes(state.kind))).toBe(true);
  });
});

describe('the one line the rail shows', () => {
  it('is the NEXT thing to do, not every missing prerequisite at once', () => {
    // Rim, Area and Supports are all unavailable on a fresh import. Saying all three would be noise.
    const rim = toolState('rim', fresh);
    expect(rim.kind).toBe('unavailable');
    expect(railReason(fresh)).toEqual(rim.kind === 'unavailable' ? rim.because : undefined);
    // And it is NOT one of the two further down the chain.
    expect(railReason(fresh)?.key).not.toMatch(/support area/i);
  });

  it('moves on as each prerequisite is met', () => {
    expect(railReason(fresh)?.key).toMatch(/right way up/i);
    expect(railReason(oriented)?.key).toMatch(/rim/i);
    expect(railReason(withRim)?.key).toMatch(/support area/i);
  });

  it('says nothing when every tool is open, because there is nothing to do first', () => {
    expect(railReason(withArea)).toBeUndefined();
  });

  it('says nothing about a BUSY tool: that is progress, not a prerequisite', () => {
    expect(railReason({ ...withArea, busy: 'supports' })).toBeUndefined();
  });
});
