import { describe, expect, it } from 'vitest';
import { applyCandidate, composeSearch } from './composeSearch.mjs';
import { typeProblem } from './fitSearch.mjs';

const denture = { category: 'denture', id: 't', profile: { placement: {} }, rules: {}, zoneGraph: null };

describe('a composer candidate in the graph', () => {
  it('is a Mark no-support on top, fed by a node, a NOT or a boolean - and the graph still validates', () => {
    for (const build of [{ id: 'SIGHT' }, { op: 'not', a: 'BAND' }, { op: 'subtract', a: 'SIGHT', b: 'BAND' }, { op: 'intersect', a: 'SIGHT', b: 'BAND' }]) {
      const type = applyCandidate(denture, build, 'area');
      expect(typeProblem(type), JSON.stringify(build)).toBeNull();
      const top = type.zoneGraph.nodes.find((n) => n.id === type.zoneGraph.outputs.zone);
      expect(top.kind).toBe('markNoSupport');
    }
  });
  it('turns on "rim obeys no-support" for rim tips, which the zone otherwise does not reach', () => {
    expect(applyCandidate(denture, { id: 'SIGHT' }, 'dental rim').rules).toEqual({ rimRespectsNoSupport: 1 });
    expect(applyCandidate(denture, { id: 'SIGHT' }, 'area').rules).toEqual({});
  });
});

describe('the composer search', () => {
  // classes: 2 ours only, 3 both; node A holds exactly the ours-only faces.
  const classes = Uint8Array.of(2, 2, 2, 2, 2, 2, 3, 3);
  const A = Uint8Array.of(1, 1, 1, 1, 1, 1, 0, 0);
  const row = (covered, outside) => ({ case: 'c', source: 'c', result: 'built', verdict: 'clear', tipsLeftOut: 0, islandsUnresolved: 0, targetState: 'ok', ownerAreaCoveredPct: covered, outsideOwnerAreaPct: outside });
  const rowsOf = (outside) => [{ ...row(70, outside), source: 'a' }, { ...row(70, outside), source: 'b' }];

  it('keeps the evidence-ranked edit when the full run confirms it, and logs predicted against measured', async () => {
    const lines: string[] = [];
    const evaluate = async (type: any) => rowsOf(type.zoneGraph?.nodes.some((n: any) => n.kind === 'markNoSupport' && n.inputs.faces === 'SIGHT' && n.id.startsWith('F')) ? 40 : 60);
    const { best } = await composeSearch({ start: denture, startRows: rowsOf(60), evaluate, depth: 1, charge: 1,
      evidenceOf: () => ({ stream: 'area', pairs: [{ classes, nodes: [{ id: 'SIGHT', values: A }] }, { classes, nodes: [{ id: 'SIGHT', values: A }] }] }),
      log: (line: string) => lines.push(line) });
    expect(best.steps).toEqual(['no-support on SIGHT for area']);
    expect(lines.some((l) => l.includes('predicted faces 6/6') && l.includes('ACCEPTED'))).toBe(true);
  });

  it('says there is no separating mask, with the reachable ceiling, when nothing is eligible', async () => {
    const lines: string[] = [];
    const mixed = Uint8Array.of(1, 1, 0, 0, 0, 0, 1, 1); // holds both classes alike: no gain
    const { gap } = await composeSearch({ start: denture, startRows: rowsOf(60), evaluate: async () => rowsOf(60), charge: 1,
      evidenceOf: () => ({ stream: 'area', pairs: [{ classes: Uint8Array.of(2, 3, 2, 3, 2, 3, 2, 3), nodes: [{ id: 'SIGHT', values: mixed }] }] }),
      log: (line: string) => lines.push(line) });
    expect(gap?.stream).toBe('area');
    expect(lines.join('\n')).toMatch(/no separating mask in the tested vocabulary/);
  });
});
