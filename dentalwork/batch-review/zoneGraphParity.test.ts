import '../../scripts/test-support/useNodeEngine';
import { describe, expect, it } from 'vitest';
import { setZoneGraph } from '@mixo-geocore/host/dental/zoneGraph';
import { defaultGraph, setParam, validate } from './nodeGraph.mjs';

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
  return cases;
}

/** Where the two validators knowingly disagree today, and why. Empty is the goal of the typed evaluator. */
const KNOWN_DISAGREEMENTS: Record<string, string> = {
  'the rim strip as the allowed output': 'BY DESIGN (nodeGraph.mjs header): the host lets a graph be authored ahead of the engine; the engine refuses a band whose seeds are not holes at 5 mm and says why',
};

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
