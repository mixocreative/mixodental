import { describe, expect, it } from 'vitest';
import { EDITS, describe as words, graphOf, removeMark, search, typeProblem } from './fitSearch.mjs';
import { defaultGraph, validate } from './nodeGraph.mjs';

const denture = { category: 'denture', id: 't', profile: { placement: {} }, rules: {}, zoneGraph: null };

describe('the fit grammar', () => {
  it('every denture graph edit gives a graph the editor accepts', () => {
    for (const edit of EDITS.denture.filter((e) => e.family === 'graph')) {
      for (const value of edit.values) {
        const type = edit.apply(denture, value);
        expect(type, edit.name).not.toBeNull();
        expect(validate(type.zoneGraph).problems, edit.name).toEqual([]);
        expect(typeProblem(type), edit.name).toBeNull();
      }
    }
  });
  it('removing a Mark re-seats what stood on it, and the bottom Mark of a one-Mark stack cannot go', () => {
    const g = removeMark(graphOf(denture), 'Z2');
    expect(g.nodes.find((n) => n.id === 'Z3').inputs.under).toBe('Z1');
    expect(removeMark({ nodes: [{ id: 'A', kind: 'markSupport', inputs: { faces: 'X' } }], outputs: { zone: 'A' } }, 'A')).toBeNull();
  });
  it('never edits the starting type in place', () => {
    const before = JSON.stringify(denture);
    EDITS.denture.forEach((e) => e.apply(denture, e.values[0]));
    expect(JSON.stringify(denture)).toBe(before);
    expect(JSON.stringify(graphOf(denture))).toBe(JSON.stringify(defaultGraph()));
  });
});

describe('the search', () => {
  const row = (source: string, covered: number) => ({ case: source, source, result: 'built', verdict: 'clear', tipsLeftOut: 0, islandsUnresolved: 0,
    targetState: 'ok', ownerAreaCoveredPct: covered, outsideOwnerAreaPct: 50 });
  const edits = [
    { name: 'good', family: 'rule', values: [1], apply: (t: any) => ({ ...t, rules: { ...t.rules, good: 1 } }) },
    { name: 'one-scan', family: 'rule', values: [1], apply: (t: any) => ({ ...t, rules: { ...t.rules, oneScan: 1 } }) },
  ];
  it('keeps a gain shared by the scans and refuses one carried by a single scan', async () => {
    const evaluate = async (t: any) => ['a', 'b', 'c'].map((s) => row(s, 60 + (t.rules.good ? 10 : 0) + (t.rules.oneScan && s === 'a' ? 30 : 0)));
    const { best, tried } = await search({ start: { ...denture, rules: {} }, kind: 'denture', evaluate, edits });
    expect(words(best.steps)).toBe('good=1');
    expect(tried.find((t: any) => words(t.steps) === 'good=1, one-scan=1').refused).toEqual(['the gain rests on one pair alone (leave-one-out)']);
  });
});
