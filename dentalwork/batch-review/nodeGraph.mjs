/*
 * ONE JOB: the zone graph an operator composes - its nodes, what they connect to, and whether it is
 * a graph the engine could run. Pure: no DOM, no engine, no mesh. `nodeGraph.test.ts` exercises it.
 *
 * WHY A GRAPH AND NOT A FIXED CHAIN (docs/NODE-PLAN.md). A zone is not one decision: several rays
 * and bands produce allowed and forbidden areas that overlap and cancel, and the order they combine
 * in IS the design. Today that composition is five fixed statements in `ruled_tips.rs:151-163` -
 * pure per-face boolean algebra, no state - so it can be data. `defaultGraph()` is those statements,
 * node for node, and it is the graph that has to reproduce today's behaviour exactly.
 *
 * ORDER IS STRUCTURE. Subtraction does not commute, and here that shows as which input feeds which
 * side of a SUBTRACT - never as a position in a list, so inserting a node cannot silently change what
 * another node means.
 *
 * WHAT THIS DOES NOT DO: run anything. Evaluating a custom graph needs the engine to take one, which
 * is the next engine change. Until then the editor composes and validates, and only the default graph
 * runs - and the UI must say so rather than imply an edited graph took effect.
 */

/** Socket types. A wire is only legal between matching types: the connection you cannot make beats the error you would read later. */
export const TYPES = ['mask', 'depthMap', 'position', 'curve'];

/**
 * Every node kind: its inputs (name -> type), its output type, its parameters with units, and the
 * engine unit it stands for. `stage` is the owner's three stages; only `zones` kinds are editable here.
 */
export const KINDS = {
  rimCurve: { stage: 'orient', label: 'Rim curve', out: 'curve', inputs: {}, params: {}, fixed: true,
    reads: 'denture/rim_lowpoints.rs - found by stage 1, not authored here' },
  intersection: { stage: 'zones', label: 'Intersection', out: 'position', inputs: {},
    params: { planeA: 'rim', planeB: 'symmetry', face: 'back' },
    reads: 'oral_cavity_ray.rs:49-70 - the two planes meet the box face; three fallbacks when they cannot' },
  planePoint: { stage: 'zones', label: 'Point on plane', out: 'position', inputs: {},
    params: { plane: 'rim', xPct: 50, yPct: 50 },
    reads: 'new - x/y as % of the part extent along the two frame axes in that plane; cannot reproduce today\'s origin' },
  parallelCast: { stage: 'zones', label: 'Parallel cast', out: 'mask', inputs: {},
    params: { from: 'back', toward: 'tissue', deg: 45, pitchMm: 0.1 },
    reads: 'no_support.rs:21; direction = normalize(back·cos θ − top·sin θ) - it leans to TISSUE, not top' },
  sightCast: { stage: 'zones', label: 'Sight cast', out: 'mask', inputs: { origin: 'position' }, params: {},
    reads: 'zones.rs:19 - a face is seen if 2 of 4 samples reach it; uncapped cost' },
  depthCast: { stage: 'zones', label: 'Depth cast', out: 'depthMap', inputs: {},
    params: { axis: 'teeth', side: 'tissue', pitchMm: 0.3 },
    reads: 'holes_axis.rs:83 - returns a DEPTH MAP, not a mask' },
  holes: { stage: 'zones', label: 'Holes', out: 'mask', inputs: { map: 'depthMap' }, params: { minAreaMm2: 0.5 },
    reads: 'holes_axis.rs:166' },
  basinFill: { stage: 'zones', label: 'Basin fill', out: 'mask', inputs: { map: 'depthMap' }, params: { minDepthMm: 1 },
    reads: 'sockets.rs:100 - the socket basins, before any cancel' },
  band: { stage: 'zones', label: 'Band', out: 'mask', inputs: { seeds: 'mask|curve' }, params: { mm: 5 },
    reads: 'rim_graph.rs:112 - grows along mesh edges from faces OR a curve\'s vertices' },
  union: { stage: 'zones', label: 'Union', out: 'mask', inputs: { a: 'mask', b: 'mask' }, params: {}, reads: 'A or B, per face' },
  subtract: { stage: 'zones', label: 'Subtract', out: 'mask', inputs: { a: 'mask', b: 'mask' }, params: {},
    reads: 'A and not B. A is the minuend: swapping them is a different zone' },
  intersect: { stage: 'zones', label: 'Intersect', out: 'mask', inputs: { a: 'mask', b: 'mask' }, params: {}, reads: 'A and B, per face' },
  not: { stage: 'zones', label: 'Not', out: 'mask', inputs: { a: 'mask' }, params: {},
    reads: 'every face A does not hold - forced by the engine: low admission tests !no_support (ruled_tips.rs:191)' },
};

/**
 * The names the engine reads. Placement never looks at the graph: it asks for these BY NAME, the way
 * a render only reads Blender's Material Output. Every one must be filled, or the run is refused -
 * never quietly defaulted, because a graph that fell back to today's behaviour would report a clean
 * run having done nothing it was asked to.
 */
export const REQUIRED_OUTPUTS = {
  no_support: 'mask', allowed: 'mask', allowed_cavity: 'mask', hole_band: 'mask',
  rim: 'curve', rim_band: 'mask', low_rim_band: 'mask', sockets: 'mask',
};

/**
 * The print-angle search, which is an ORIENT-stage node (the owner: it sets the range auto-detection
 * searches). The denture stands on the plate teeth end DOWN; 0 deg is bolt upright, and a positive
 * angle leans it so the teeth side tips UP toward the viewer (`denture/tilt.rs:1-3`). The search
 * tries every step from start to end and keeps the best by an ordered preference (`tilt.rs:16-19`).
 *
 * These are PROFILE fields, not rules, so they are read-only until `register_profile` exists. The
 * numbers must match the shipped profile: `nodeGraph.test.ts` reads the vendored profile and fails if
 * they drift, because a node showing 45 while the engine searches 30 would be lying.
 */
export const PRINT_ANGLE_SEARCH = { startDeg: 0, endDeg: 45, stepDeg: 2, marginDeg: 2 };

/** Today's denture, node for node (`ruled_tips.rs:151-163`, `:126-143`, `:113-115`). Must reproduce today exactly. */
export function defaultGraph() {
  const nodes = [
    { id: 'R1', kind: 'parallelCast', params: { from: 'back', toward: 'tissue', deg: 45, pitchMm: 0.1 }, inputs: {} },
    { id: 'R1b', kind: 'parallelCast', params: { from: 'back', toward: 'tissue', deg: 0, pitchMm: 0.1 }, inputs: {}, note: 'steep ray; 0 = off' },
    { id: 'ORIGIN', kind: 'intersection', params: { planeA: 'rim', planeB: 'symmetry', face: 'back' }, inputs: {} },
    { id: 'SIGHT', kind: 'sightCast', params: {}, inputs: { origin: 'ORIGIN' } },
    { id: 'MAP', kind: 'depthCast', params: { axis: 'teeth', side: 'tissue', pitchMm: 0.3 }, inputs: {} },
    { id: 'HOLES', kind: 'holes', params: { minAreaMm2: 0.5 }, inputs: { map: 'MAP' } },
    { id: 'BAND', kind: 'band', params: { mm: 5 }, inputs: { seeds: 'HOLES' } },
    { id: 'RIM', kind: 'rimCurve', params: {}, inputs: {} },
    { id: 'RIMBAND', kind: 'band', params: { mm: 2 }, inputs: { seeds: 'RIM' } },
    { id: 'LOWRIMBAND', kind: 'band', params: { mm: 1 }, inputs: { seeds: 'RIM' } },
    { id: 'BASINS', kind: 'basinFill', params: { minDepthMm: 1 }, inputs: { map: 'MAP' } },
    { id: 'NS', kind: 'union', params: {}, inputs: { a: 'R1', b: 'R1b' } },
    { id: 'AL', kind: 'union', params: {}, inputs: { a: 'SIGHT', b: 'BAND' } },
    { id: 'SOCK', kind: 'subtract', params: {}, inputs: { a: 'BASINS', b: 'AL' } },
  ];
  const outputs = {
    no_support: 'NS', allowed: 'AL', allowed_cavity: 'SIGHT', hole_band: 'BAND',
    rim: 'RIM', rim_band: 'RIMBAND', low_rim_band: 'LOWRIMBAND', sockets: 'SOCK',
  };
  return { nodes, outputs };
}

const byId = (graph, id) => graph.nodes.find((n) => n.id === id);

/** A fresh id for a new node of `kind`: its initials and the next free number - sightCast -> SC1, union -> U1. */
function freshId(graph, kind) {
  const stem = (kind[0] + kind.slice(1).replace(/[a-z]/g, '')).toUpperCase();
  for (let k = 1; ; k += 1) if (!byId(graph, `${stem}${k}`)) return `${stem}${k}`;
}

/** A new graph with one more node of `kind`, unwired, at its default parameters. */
export function addNode(graph, kind) {
  const spec = KINDS[kind];
  if (!spec) throw new Error(`no node kind "${kind}"`);
  if (spec.fixed) throw new Error(`${spec.label} is found by stage 1, not added here`);
  const id = freshId(graph, kind);
  const inputs = Object.fromEntries(Object.keys(spec.inputs).map((name) => [name, null]));
  return { ...graph, nodes: [...graph.nodes, { id, kind, params: { ...spec.params }, inputs }] };
}

/**
 * A new graph without `id`. Wires that pointed at it become EMPTY rather than vanishing, and output
 * bindings to it are cleared - so `validate` names exactly what the deletion broke, instead of the
 * graph quietly reshaping itself around the hole.
 */
export function removeNode(graph, id) {
  if (!byId(graph, id)) throw new Error(`no node ${id}`);
  if (KINDS[byId(graph, id).kind].fixed) throw new Error(`${id} is found by stage 1 and cannot be removed here`);
  const nodes = graph.nodes.filter((n) => n.id !== id).map((n) => ({
    ...n, inputs: Object.fromEntries(Object.entries(n.inputs).map(([k, v]) => [k, v === id ? null : v])),
  }));
  const outputs = Object.fromEntries(Object.entries(graph.outputs).map(([k, v]) => [k, v === id ? null : v]));
  return { nodes, outputs };
}

/** A new graph with input `input` of node `id` wired to `from` (or emptied with null). */
export function rewire(graph, id, input, from) {
  const node = byId(graph, id);
  if (!node) throw new Error(`no node ${id}`);
  if (!(input in node.inputs)) throw new Error(`${id} has no input "${input}"`);
  return { ...graph, nodes: graph.nodes.map((n) => (n.id === id ? { ...n, inputs: { ...n.inputs, [input]: from } } : n)) };
}

/** A new graph with output `name` bound to node `from` (or emptied). */
export function bindOutput(graph, name, from) {
  if (!(name in REQUIRED_OUTPUTS)) throw new Error(`"${name}" is not an output the engine reads`);
  return { ...graph, outputs: { ...graph.outputs, [name]: from } };
}

/** A new graph with one parameter of `id` set. */
export function setParam(graph, id, key, value) {
  return { ...graph, nodes: graph.nodes.map((n) => (n.id === id ? { ...n, params: { ...n.params, [key]: value } } : n)) };
}

const accepts = (want, got) => want.split('|').includes(got);

/**
 * Everything wrong with a graph, each problem naming the node, so the operator is told what to fix
 * before any engine time is spent. Empty means the engine could run it.
 *
 * It also reports WARNINGS, which are graphs that are structurally valid and still wrong in fact - an
 * output wired to something that can never hold a face. Refusal is the wrong tool for those, because
 * nothing is malformed; they must be visible instead.
 */
export function validate(graph) {
  const problems = [];
  const warnings = [];
  for (const node of graph.nodes) {
    const spec = KINDS[node.kind];
    if (!spec) { problems.push(`${node.id}: unknown kind "${node.kind}"`); continue; }
    for (const [name, want] of Object.entries(spec.inputs)) {
      const from = node.inputs[name];
      if (from === null || from === undefined) { problems.push(`${node.id}: input "${name}" is not connected`); continue; }
      const source = byId(graph, from);
      if (!source) { problems.push(`${node.id}: input "${name}" points at ${from}, which does not exist`); continue; }
      const got = KINDS[source.kind].out;
      if (!accepts(want, got)) problems.push(`${node.id}: input "${name}" takes ${want.replace('|', ' or ')}, but ${from} gives ${got}`);
    }
  }
  for (const [name, want] of Object.entries(REQUIRED_OUTPUTS)) {
    const from = graph.outputs[name];
    if (!from) { problems.push(`output "${name}" is not filled - the engine reads it by name`); continue; }
    const source = byId(graph, from);
    if (!source) { problems.push(`output "${name}" points at ${from}, which does not exist`); continue; }
    const got = KINDS[source.kind].out;
    if (got !== want) problems.push(`output "${name}" needs a ${want}, but ${from} gives ${got}`);
  }
  // A cycle, by depth-first search over the input wires.
  const state = new Map();
  const visit = (id, path) => {
    if (state.get(id) === 'done') return null;
    if (state.get(id) === 'open') return [...path, id];
    state.set(id, 'open');
    const node = byId(graph, id);
    for (const from of Object.values(node?.inputs ?? {})) {
      if (!from || !byId(graph, from)) continue;
      const loop = visit(from, [...path, id]);
      if (loop) return loop;
    }
    state.set(id, 'done');
    return null;
  };
  for (const node of graph.nodes) {
    const loop = visit(node.id, []);
    if (loop) { problems.push(`cycle: ${loop.join(' -> ')}`); break; }
  }
  // Valid but suspect: a parallel cast at 0 degrees is OFF, and an output fed only by it is empty.
  for (const node of graph.nodes) {
    if (node.kind === 'parallelCast' && Number(node.params.deg) === 0) warnings.push(`${node.id}: a parallel cast at 0 deg casts nothing - it is off`);
  }
  return { problems, warnings, ok: problems.length === 0 };
}

/** The nodes no output reaches. They are not evaluated - an added cast costs rays only once it is wired in. */
export function unreached(graph) {
  const seen = new Set();
  const walk = (id) => {
    if (!id || seen.has(id)) return;
    seen.add(id);
    for (const from of Object.values(byId(graph, id)?.inputs ?? {})) walk(from);
  };
  for (const from of Object.values(graph.outputs)) walk(from);
  return graph.nodes.filter((n) => !seen.has(n.id)).map((n) => n.id);
}

/** True when `graph` is the default, node for node - the only graph that runs today. */
export function isDefault(graph) {
  return JSON.stringify(graph) === JSON.stringify(defaultGraph());
}
