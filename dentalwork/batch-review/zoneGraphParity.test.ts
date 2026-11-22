import '../../scripts/test-support/useNodeEngine';
import { describe, expect, it } from 'vitest';
import { setZoneGraph } from '@mixo-geocore/host/dental/zoneGraph';
import { alignerGraph, defaultGraph, setParam, validate } from './nodeGraph.mjs';

/*
 * HOST AND ENGINE VALIDATE THE SAME GRAPHS - the parity check build step 3 of docs/ORIENT-NODES.md section 10 needs
 * before the typed evaluator is written. The host palette (`nodeGraph.mjs`) and the engine (`zone_graph.rs`, called
 * through the vendored `setZoneGraph`) each judge a graph; a corpus of graphs goes through both.
 *
 * Today they disagree in known ways (Fable's end-to-end review, 2026-11-22: the engine does not type-check inputs,
 * accepts only some wirings, and reads only nodes reachable from its free outputs). Each disagreement is LISTED with
 * its reason, so this test fails when a NEW one appears and when a listed one goes away - either means the contract
 * moved and section 10 must say how. One entry remains, BY DESIGN; the engine's missing input type check, the other,
 * closed with geocore 0301bfe (MASK_KINDS).
 */

type Graph = ReturnType<typeof defaultGraph>;
type Node = Graph['nodes'][number];
const clone = (g: Graph): Graph => JSON.parse(JSON.stringify(g));
const engineAccepts = (g: Graph): boolean => { try { setZoneGraph(g); return true; } catch { return false; } };
const hostAccepts = (g: Graph): boolean => validate(g).problems.length === 0;
const withNode = (g: Graph, node: Node): Graph => { const out = clone(g); out.nodes.push(node); return out; };

/** The corpus: name -> graph. Built from the default graph by small edits a person could make in the editor. */
function corpus(): [string, Graph][] {
  const d = defaultGraph();
  const cases: [string, Graph][] = [['the default graph', d]];
  // An unknown kind wired into a free output: both must refuse.
  const unknown = withNode(d, { id: 'X', kind: 'noSuchKind', inputs: {}, params: {} } as unknown as Node);
  unknown.outputs.allowed = 'X';
  cases.push(['an unknown kind on a free output', unknown]);
  // A free output pointing at a node that does not exist: both must refuse.
  const dangling = clone(d); dangling.outputs.no_support = 'NOPE';
  cases.push(['a free output pointing at nothing', dangling]);
  // A combine node fed a position (the crossing) instead of a mask.
  const typeMix = withNode(d, { id: 'U', kind: 'union', inputs: { a: 'ORIGIN', b: 'NS' }, params: {} } as unknown as Node);
  typeMix.outputs.no_support = 'U';
  cases.push(['union fed a position', typeMix]);
  // A tilt outside 0-180 degrees on the parallel rays.
  cases.push(['parallel rays tilted 200 degrees', setParam(clone(d), 'R1', 'deg', 200)]);
  // A strip around the rim line (2 mm) used as a free output.
  const rimStrip = clone(d); rimStrip.outputs.allowed = 'RIMBAND';
  cases.push(['the rim strip as the allowed output', rimStrip]);
  // Step 9's rim side (off by default): wired into allowed it runs; a bad side or width is refused by both.
  const side = (which: unknown, mm: unknown) => {
    const g = withNode(withNode(d, { id: 'IN', kind: 'rimSide', inputs: { rim: 'RIM' }, params: { which, mm } } as unknown as Node),
      { id: 'AL2', kind: 'union', inputs: { a: 'AL', b: 'IN' }, params: {} } as unknown as Node);
    g.outputs.allowed = 'AL2';
    return g;
  };
  cases.push(['the inner rim side added to allowed', side('inner', 2)]);
  cases.push(['a rim side of no known side', side('middle', 2)]);
  cases.push(['a rim side 0 mm wide', side('outer', 0)]);
  // The aligner's locked graph (step 4.4b): host `alignerGraph` against engine `dental/aligner_graph.rs`.
  const a = (): Graph => alignerGraph() as unknown as Graph;
  cases.push(['the aligner default graph', a()]);
  const aParam = a(); (aParam.nodes.find((n) => n.id === 'AREA')!.params as Record<string, unknown>).widthMm = 3;
  cases.push(['an aligner node given a parameter', aParam]);
  const aKind = a(); aKind.nodes.find((n) => n.id === 'RIM')!.kind = 'rimLowPoints';
  cases.push(['an aligner node of another kind', aKind]);
  const aExtra = withNode(a(), { id: 'R1', kind: 'parallelCast', inputs: {}, params: {} } as unknown as Node);
  cases.push(['an aligner graph with a node added', aExtra]);
  const aRewired = a(); (aRewired.outputs as Record<string, string>).allowed = 'AREA';
  cases.push(['an aligner output rewired', aRewired]);
  cases.push(['a graph of an unknown kind', { ...a(), kind: 'crown' } as unknown as Graph]);
  return cases;
}

/**
 * Where the two validators knowingly disagree today, and why. Step 3's target was this one BY DESIGN entry, not
 * an empty list (docs/ORIENT-NODES.md section 10): the host authors ahead of the engine on purpose.
 */
// EMPTY since step 7.3: the one by-design entry ("the rim strip as the allowed output") went away when the engine
// freed the rim strips - the engine now runs a rim strip wherever it is wired, as the host always allowed.
const KNOWN_DISAGREEMENTS: Record<string, string> = {};

describe('zone graph parity - host and engine', () => {
  const results = corpus().map(([name, graph]) => ({ name, host: hostAccepts(graph), engine: engineAccepts(graph) }));

  it('the corpus covers both verdicts', () => {
    // A corpus where everything passes (or everything fails) proves nothing about agreement.
    expect(results.some((r) => r.host && r.engine)).toBe(true);
    expect(results.some((r) => !r.host && !r.engine)).toBe(true);
  });

  it('host and engine agree on every graph except the listed ones, and every listed one still disagrees', () => {
    const disagree = results.filter((r) => r.host !== r.engine).map((r) => r.name).sort();
    expect(disagree).toEqual(Object.keys(KNOWN_DISAGREEMENTS).sort());
  });

  it('the default graph is accepted by both', () => {
    expect(results.find((r) => r.name === 'the default graph')).toEqual({ name: 'the default graph', host: true, engine: true });
  });
});
