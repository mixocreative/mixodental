import '../scripts/test-support/useNodeEngine';
import { describe, expect, it } from 'vitest';
import { setZoneGraph } from '@mixo-geocore/host/dental/zoneGraph';
import { alignerGraph, defaultGraph, setParam, upgradeGraph, validate } from './nodeGraph.mjs';

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
// The host as it really runs: every graph it loads goes through `upgradeGraph` first (viewer, typeInForce).
const hostAccepts = (g: Graph): boolean => validate(upgradeGraph(g)).problems.length === 0;
/** `g` with Mark `mark`'s faces wired to `from` - how an edit reaches the Zone since plan D1. */
const faces = (g: Graph, mark: string, from: string): Graph => { const out = clone(g); (out.nodes.find((n) => n.id === mark)!.inputs as Record<string, string | null>).faces = from; return out; };
const withNode = (g: Graph, node: Node): Graph => { const out = clone(g); out.nodes.push(node); return out; };

/** The corpus: name -> graph. Built from the default graph by small edits a person could make in the editor. */
function corpus(): [string, Graph][] {
  const d = defaultGraph();
  const cases: [string, Graph][] = [['the default graph', d]];
  // An unknown kind wired into a free output: both must refuse.
  const unknown = withNode(d, { id: 'X', kind: 'noSuchKind', inputs: {}, params: {} } as unknown as Node);
  cases.push(['an unknown kind marked as support', faces(unknown, 'Z3', 'X')]);
  // A free output pointing at a node that does not exist: both must refuse.
  cases.push(['a Mark fed a node that does not exist', faces(d, 'Z1', 'NOPE')]);
  // A combine node fed a position (the crossing) instead of a mask.
  const typeMix = withNode(d, { id: 'U', kind: 'union', inputs: { a: 'ORIGIN', b: 'NS' }, params: {} } as unknown as Node);
  cases.push(['union fed a position', faces(typeMix, 'Z1', 'U')]);
  // A tilt outside 0-180 degrees on the parallel rays.
  cases.push(['parallel rays tilted 200 degrees', setParam(clone(d), 'R1', 'deg', 200)]);
  // A strip around the rim line (2 mm) used as a free output.
  cases.push(['the rim strip marked as support', faces(d, 'Z3', 'RIMBAND')]);
  // Step 9's rim side (off by default): wired into allowed it runs; a bad side or width is refused by both.
  const side = (which: unknown, mm: unknown) => {
    const g = withNode(withNode(d, { id: 'IN', kind: 'rimSide', inputs: { rim: 'RIM' }, params: { which, mm } } as unknown as Node),
      { id: 'AL2', kind: 'union', inputs: { a: 'AL', b: 'IN' }, params: {} } as unknown as Node);
    return faces(g, 'Z3', 'AL2');
  };
  cases.push(['the inner rim side added to allowed', side('inner', 2)]);
  cases.push(['a rim side of no known side', side('middle', 2)]);
  cases.push(['a rim side 0 mm wide', side('outer', 0)]);
  // C3: the Rim node's settings - the corpus had none, which is how an engine that ignored `source` passed (Fable).
  const rim = (params: Record<string, unknown>): Graph => { const out = clone(d); (out.nodes.find((n) => n.id === 'RIM')!.params as Record<string, unknown>) = params; return out; };
  cases.push(['the rim from the flat area\'s edge', rim({ source: 'flatEdge' })]);
  cases.push(['the rim from no known source', rim({ source: 'edge' })]);
  cases.push(['a rim search step of 20 degrees', rim({ binDeg: 20 })]);
  cases.push(['a rim open gap under two search steps', rim({ binDeg: 6, openGapDeg: 8 })]);
  cases.push(['a rim setting the rim does not read', rim({ widthMm: 3 })]);
  cases.push(['the rim settings at other legal values', rim({ binDeg: 5, shellMm: 3, openGapDeg: 30 })]);
  // Plan D1, the one-zone form: each Mark wiring both validators must agree on.
  const zoneFrom = clone(d); (zoneFrom.outputs as Record<string, string>).zone = 'NS';
  cases.push(['the zone output fed a set of faces', zoneFrom]);
  const underMask = clone(d); (underMask.nodes.find((n) => n.id === 'Z2')!.inputs as Record<string, string>).under = 'NS';
  cases.push(['a Mark with a set of faces under it', underMask]);
  cases.push(['a seen switch that is text', setParam(clone(d), 'Z2', 'seen', 'yes')]);
  // The hole strip's width (owner 2026-11-23): free between 0 and 20 mm; a rim strip's stays the profile's.
  cases.push(['a 3 mm hole strip', setParam(clone(d), 'BAND', 'mm', 3)]);
  cases.push(['a hole strip 0 mm wide', setParam(clone(d), 'BAND', 'mm', 0)]);
  cases.push(['a hole strip 25 mm wide', setParam(clone(d), 'BAND', 'mm', 25)]);  // Not here: a rim strip node's own `mm`. The engine never reads it (the profile's width wins) and so accepts any;
  // the canvas shows it as "set on 2 Rim" and refuses an edit. A known difference on a field no one can edit.
  const both = clone(d); (both.outputs as Record<string, string>).allowed = 'AL';
  cases.push(['the zone and an old output wired together', both]);
  const firstMark = clone(d); delete (firstMark.nodes.find((n) => n.id === 'Z2')!.inputs as Record<string, string>).under;
  cases.push(['a stack starting at the cavity Mark, nothing under it', firstMark]);
  const markInUnion = withNode(d, { id: 'U2', kind: 'union', inputs: { a: 'Z1', b: 'NS' }, params: {} } as unknown as Node);
  cases.push(['a Mark fed into a combine node', faces(markInUnion, 'Z3', 'U2')]);
  // A graph saved before D1, with the three old outputs: the engine runs it as it is, the host upgrades it first.
  const old = clone(d);
  old.nodes = old.nodes.filter((n) => !n.kind.startsWith('mark'));
  const { zone: _zone, ...rest } = old.outputs as Record<string, string>;
  old.outputs = { no_support: 'NS', allowed: 'AL', allowed_cavity: 'SIGHT', ...rest } as never;
  cases.push(['a graph saved with the three old outputs', old]);
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
