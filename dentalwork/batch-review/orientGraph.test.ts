import { describe, expect, it } from 'vitest';
import { OrientGraphRefused, setOrientGraph } from '@mixo-geocore/host/dental/orientGraph';
import * as orient from './orientGraph.mjs';

type Graph = ReturnType<typeof orient.defaultGraph>;
const clone = (g: Graph): Graph => JSON.parse(JSON.stringify(g));

describe('the Orient graph model (U6)', () => {
  it('every kind has words, a group and a known output type; every parameter has words and limits', () => {
    for (const [kind, spec] of Object.entries(orient.KINDS)) {
      expect(orient.KIND_WORDS[kind as keyof typeof orient.KIND_WORDS]?.title, kind).toBeTruthy();
      expect(orient.NODE_GROUPS[orient.KIND_GROUP[kind as keyof typeof orient.KIND_GROUP] as keyof typeof orient.NODE_GROUPS], kind).toBeTruthy();
      expect(orient.TYPES).toContain(spec.out);
      for (const key of Object.keys(spec.params)) {
        expect(orient.PARAM_WORDS[key as keyof typeof orient.PARAM_WORDS], key).toBeTruthy();
        expect(orient.LIMITS[key as keyof typeof orient.LIMITS], key).toBeTruthy();
      }
    }
    for (const name of Object.keys(orient.REQUIRED_OUTPUTS)) expect(orient.OUTPUT_WORDS[name as keyof typeof orient.OUTPUT_WORDS]).toBeTruthy();
  });

  it('the default is today and complete; the flat-base recipe is complete; edits name the node', () => {
    expect(orient.validate(orient.defaultGraph()).ok).toBe(true);
    expect(orient.isDefault(orient.defaultGraph())).toBe(true);
    expect(orient.validate(orient.flatBaseGraph()).ok).toBe(true);
    expect(orient.isDefault(orient.flatBaseGraph())).toBe(false);
    const added = orient.addNode(orient.defaultGraph(), 'flatRegion');
    expect(added.nodes.at(-1)).toMatchObject({ kind: 'flatRegion', params: { toleranceDeg: 5, minAreaMm2: 20, rank: 1 } });
    const removed = orient.removeNode(orient.defaultGraph(), 'UP');
    expect(orient.validate(removed).problems).toEqual(expect.arrayContaining(['POSE: input "frame" is not connected', 'output "frame" is not filled']));
  });
});

/**
 * HOST AND ENGINE AGREE (as zoneGraphParity.test.ts does for the zones): each graph goes through the canvas's
 * `validate` and the vendored engine's `setOrientGraph`; the two verdicts must match, so a graph the canvas calls
 * complete is one the engine runs, and one it refuses is refused there too.
 */
describe('the canvas and the engine judge an Orient graph alike', () => {
  const engineAccepts = (g: Graph): boolean => {
    try { setOrientGraph(g); return true; } catch (error) { if (error instanceof OrientGraphRefused) return false; throw error; } finally { setOrientGraph(null); }
  };
  const corpus: [string, Graph][] = [
    ['the default', orient.defaultGraph()],
    ['the flat-base recipe', orient.flatBaseGraph()],
    ['a lean of 200 degrees', (() => { const g = orient.flatBaseGraph(); (g.nodes[2]!.params as Record<string, number>).angleDeg = 200; return g; })()],
    ['an unknown parameter', (() => { const g = orient.flatBaseGraph(); (g.nodes[0]!.params as Record<string, number>).size = 3; return g; })()],
    ['a pose fed a region', (() => { const g = clone(orient.defaultGraph()); g.nodes.push({ id: 'F', kind: 'flatRegion', params: {}, inputs: {} }); (g.nodes[2]!.inputs as Record<string, string>).frame = 'F'; return g; })()],
    ['the pose output left empty', (() => { const g = clone(orient.defaultGraph()); (g.outputs as Record<string, string | null>).pose = null; return g; })()],
    ['a zone kind in an Orient graph', (() => { const g = clone(orient.defaultGraph()); g.nodes.push({ id: 'X', kind: 'parallelCast', params: {}, inputs: {} }); return g; })()],
  ];
  for (const [name, graph] of corpus) {
    it(name, () => expect(engineAccepts(graph)).toBe(orient.validate(graph).ok));
  }
  it('the corpus covers both verdicts', () => {
    const verdicts = new Set(corpus.map(([, g]) => orient.validate(g).ok));
    expect(verdicts).toEqual(new Set([true, false]));
  });
});
