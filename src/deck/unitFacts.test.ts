import { describe, expect, it } from 'vitest';
import type { PrintUnit } from '../state/project';
import { railStates } from './toolState';
import { unitFacts } from './unitFacts';

const unit = (over: Partial<PrintUnit> = {}) => ({ id: 'u', name: 'n', ...over } as PrintUnit);
const policy = {} as PrintUnit['dental'];
const draft = {} as PrintUnit['rimDraft'];
const kinds = (u: PrintUnit) => Object.fromEntries(railStates(unitFacts(u)).map(({ tool, state }) => [tool, state.kind]));

describe('what a unit presents to the rail', () => {
  it('reads a fresh import as nothing done', () => {
    expect(unitFacts(unit())).toEqual({ oriented: false, hasRim: false, areaAccepted: false });
  });

  it('counts a hand-drawn rim as a rim, and NOT as an accepted area', () => {
    expect(unitFacts(unit({ rimDraft: draft }))).toMatchObject({ hasRim: true, areaAccepted: false });
  });

  it('counts an accepted policy as both a rim and an area, since the policy carries its rim', () => {
    expect(unitFacts(unit({ dental: policy }))).toMatchObject({ hasRim: true, areaAccepted: true });
  });

  /*
   * THE INFERENCE THAT KEEPS OLD PROJECTS USABLE. A project saved before `revisions` existed records
   * no orientation. Reading `oriented` from the record alone would come back with Rim greyed and the
   * operator told to redo work sitting in front of them.
   */
  it('infers orienting from work that could not exist without it', () => {
    expect(unitFacts(unit({ rimDraft: draft })).oriented).toBe(true);
    expect(unitFacts(unit({ dental: policy })).oriented).toBe(true);
  });

  it('takes a recorded orientation on a unit with nothing else done', () => {
    expect(unitFacts(unit({ revisions: { orient: 1 } })).oriented).toBe(true);
  });

  it('opens the rail for a project saved before revisions existed', () => {
    // The whole point of the inference, stated as the rail the operator actually sees.
    expect(kinds(unit({ dental: policy })))
      .toEqual({ orient: 'ready', rim: 'ready', area: 'ready', supports: 'ready' });
  });
});

describe('staleness comes from the revisions and nothing else', () => {
  it('is quiet on a unit with no record', () => {
    expect(unitFacts(unit({ dental: policy }))).not.toHaveProperty('stale');
  });

  it('reports the tools a re-orient left behind', () => {
    const facts = unitFacts(unit({ dental: policy, revisions: { orient: 9, rim: 2, area: 3, supports: 4 } }));
    expect(facts.stale).toEqual(['rim', 'area', 'supports']);
    expect(kinds(unit({ dental: policy, revisions: { orient: 9, rim: 2, area: 3, supports: 4 } })))
      .toEqual({ orient: 'ready', rim: 'stale', area: 'stale', supports: 'stale' });
  });

  it('carries the busy tool through, and only when there is one', () => {
    expect(unitFacts(unit(), 'orient').busy).toBe('orient');
    expect(unitFacts(unit())).not.toHaveProperty('busy');
  });
});
