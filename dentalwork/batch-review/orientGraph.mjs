// ONE JOB: the Orient graph as the review page's canvas edits it (docs/ORIENT-NODES.md sections 3 and 5, U6) - its
// node kinds, their plain words, today's default, and the same refusals the engine makes
// (mixo-geocore `dental/denture/orient_graph.rs`), so a graph the canvas calls complete is one the engine runs.
//
// The SAME shape of library as `nodeGraph.mjs` (the zone graph), so the same canvas component draws both
// (`nodeEditor/ZoneEditor.tsx` takes a `lib`). Nothing in it is denture-specific except the default graph: the owner's
// ruling of 2026-11-23 is that the flat-base nodes are made for a NEW kind (a dental model with a flat base) and stay
// usable by every other kind.
//
// Step 1 IS this graph: the default reproduces today exactly (arch shape -> front/back and top -> upright pose), and
// `orientGraph.test.ts` holds the canvas's verdict to the engine's on a corpus of graphs.
import { rewire, setParam, unreached } from './nodeGraph.mjs';

export { rewire, setParam, unreached };

/** The value types a wire carries. */
export const TYPES = ['frame', 'pose', 'region'];

/** Every kind: what it reads, what it gives, its parameters' defaults. Mirrors `orient_graph.rs` `spec` and `PARAMS`. */
export const KINDS = {
  archFrame: { stage: 'orient', label: 'Arch shape', out: 'frame', inputs: {}, params: {}, reads: 'upright.rs arch_frame - the arch plane and the two legs' },
  upDecision: { stage: 'orient', label: 'Front/back and top', out: 'frame', inputs: { frame: 'frame' }, params: {}, reads: 'up_decision.rs decide - arch_slices: the open end of the U is the back, the slices\' domes point to the teeth (the ray test is a diagnostic only)' },
  uprightPose: { stage: 'orient', label: 'Upright from frame', out: 'pose', inputs: { frame: 'frame' }, params: {}, reads: 'pose.rs PrintPose::from - up is the frame\'s up, lean is its teeth side' },
  flatRegion: { stage: 'orient', label: 'Largest flat area', out: 'region', inputs: {}, params: { toleranceDeg: 5, minAreaMm2: 20, rank: 1 }, reads: 'flat_regions.rs - faces joined by angle to the REGION\'s normal, ranked by total area' },
  boxFrame: { stage: 'orient', label: 'Box-and-base frame', out: 'frame', inputs: { base: 'region' }, params: {}, reads: 'orient_graph.rs box_frame - up into the part from the base, lean along the box\'s long side' },
  setBottom: { stage: 'orient', label: 'Set as bottom', out: 'pose', inputs: { base: 'region', frame: 'frame' }, params: { angleDeg: 0, maxProtrusionMm: 0.5 }, reads: 'orient_graph.rs set_bottom - the base faces the plate, leaning toward the frame\'s lean side' },
};

/** The limits the engine holds each parameter to (`orient_graph.rs` PARAMS): [lowest, highest]. */
export const LIMITS = {
  toleranceDeg: [0.5, 30], minAreaMm2: [0, 1e6], rank: [1, 50], angleDeg: [-90, 90], maxProtrusionMm: [0, 50],
};

export const NODE_GROUPS = {
  find: { title: 'Find', says: 'Look at the part and find something on it.', token: '--node-maps' },
  frames: { title: 'Frames', says: 'Which way is up, front and across on the part.', token: '--node-orient' },
  pose: { title: 'Pose', says: 'How the part sits on the plate before the print angle is searched.', token: '--node-points' },
};

export const KIND_GROUP = { archFrame: 'frames', upDecision: 'frames', boxFrame: 'frames', flatRegion: 'find', uprightPose: 'pose', setBottom: 'pose' };

export const KIND_WORDS = {
  archFrame: { title: 'Arch shape', says: 'Finds the flat plane of the arch and its two legs - a denture\'s own frame. Not yet told which end is the top.' },
  upDecision: { title: 'Front/back and top', says: 'The open end of the U (where the two legs are) is the back. Eleven slices across the arch each look like an n; the side their domes point to is the teeth side. The frame is turned to match.' },
  uprightPose: { title: 'Upright from frame', says: 'Stands the part on its frame: up is the frame\'s up, and the print angle leans it toward the teeth side. Today\'s denture pose.' },
  flatRegion: { title: 'Largest flat area', says: 'The biggest near-flat area of the part, by total size. A face joins when it is within the tolerance of the AREA\'s direction, so a round side never counts as flat. Rank 2 is the next largest.' },
  boxFrame: { title: 'Box-and-base frame', says: 'A frame for a part with no arch: up points into the part from the base, and the lean side runs along the part\'s longest side.' },
  setBottom: { title: 'Set as bottom', says: 'Puts the base on the plate (supports and lift as usual), leaning toward the frame\'s lean side by the angle. Refused when the part pokes out past the base by more than the limit - it would sit inside the plate.' },
};

export const PARAM_WORDS = {
  toleranceDeg: { label: 'flat within (deg)', help: 'How far a face may turn from the area\'s direction and still count as flat.' },
  minAreaMm2: { label: 'smallest area (mm2)', help: 'Areas smaller than this are ignored.' },
  rank: { label: 'which area', help: '1 = the largest flat area, 2 = the next largest, and so on.' },
  angleDeg: { label: 'lean (deg)', help: 'Tilts the part toward its lean side before the print-angle search starts. Positive raises the lean side. With the default lean this overlaps the search\'s own start angle.' },
  maxProtrusionMm: { label: 'may poke out (mm)', help: 'How far the part may reach past the base on the plate side before Set as bottom refuses.' },
};

export const OUTPUT_WORDS = {
  frame: { title: 'Frame', says: 'Which way is up, front and across on the part. The zones and references are measured in it.' },
  pose: { title: 'Pose', says: 'How the part sits on the plate at print angle 0. The print-angle search leans it from here.' },
};

/** The outputs the engine reads, by name. Both must be filled, or the run is refused. */
export const REQUIRED_OUTPUTS = { frame: 'frame', pose: 'pose' };

/** What each value type is called on a node's output ("gives a frame"), for the canvas. */
export const TYPE_WORDS = { frame: 'a frame', pose: 'a pose', region: 'a flat area' };

/** The output node's own words on the canvas. */
export const OUTPUT_NODE = { title: 'Orient output', says: 'What Step 1 hands on: the frame the zones are measured in, and how the part sits on the plate.' };

/** Nothing in an Orient graph is fixed in this version: every parameter shown is one the engine reads. */
export const FIXED = { params: {}, outputs: [] };

/** Today's Step 1, node for node - the engine's `orient_graph::default_graph`. */
export function defaultGraph() {
  return {
    nodes: [
      { id: 'ARCH', kind: 'archFrame', params: {}, inputs: {} },
      { id: 'UP', kind: 'upDecision', params: {}, inputs: { frame: 'ARCH' } },
      { id: 'POSE', kind: 'uprightPose', params: {}, inputs: { frame: 'UP' } },
    ],
    outputs: { frame: 'UP', pose: 'POSE' },
  };
}

/** The flat-base recipe the owner's new kind starts from (section 3), offered on the canvas as one press. */
export function flatBaseGraph() {
  return {
    nodes: [
      { id: 'FLAT', kind: 'flatRegion', params: { ...KINDS.flatRegion.params }, inputs: {} },
      { id: 'FR', kind: 'boxFrame', params: {}, inputs: { base: 'FLAT' } },
      { id: 'POSE', kind: 'setBottom', params: { ...KINDS.setBottom.params }, inputs: { base: 'FLAT', frame: 'FR' } },
    ],
    outputs: { frame: 'FR', pose: 'POSE' },
  };
}

/** Whether `graph` is today's Step 1 (so nothing needs sending). */
export function isDefault(graph) {
  return JSON.stringify(graph) === JSON.stringify(defaultGraph());
}

const freshId = (graph, kind) => {
  const stem = kind.replace(/[a-z]/g, '').toUpperCase() || kind.slice(0, 3).toUpperCase();
  for (let k = 1; ; k++) if (!graph.nodes.some((n) => n.id === `${stem}${k}`)) return `${stem}${k}`;
};

/** A new graph with one node of `kind` added, its inputs empty and its parameters at their defaults. */
export function addNode(graph, kind) {
  const spec = KINDS[kind];
  if (!spec) throw new Error(`no Orient node kind "${kind}"`);
  const inputs = Object.fromEntries(Object.keys(spec.inputs).map((name) => [name, null]));
  return { ...graph, nodes: [...graph.nodes, { id: freshId(graph, kind), kind, params: { ...spec.params }, inputs }] };
}

/**
 * A new graph without `id`; wires and outputs that pointed at it become empty, so `validate` names what broke.
 * Not the zone graph's `removeNode`: that one looks the kind up in the ZONE table and throws on every Orient kind.
 */
export function removeNode(graph, id) {
  if (!graph.nodes.some((n) => n.id === id)) throw new Error(`no node ${id}`);
  const nodes = graph.nodes.filter((n) => n.id !== id).map((n) => ({
    ...n, inputs: Object.fromEntries(Object.entries(n.inputs).map(([k, v]) => [k, v === id ? null : v])),
  }));
  const outputs = Object.fromEntries(Object.entries(graph.outputs).map(([k, v]) => [k, v === id ? null : v]));
  return { nodes, outputs };
}

/** A new graph with output `name` bound to node `from` (or emptied). */
export function bindOutput(graph, name, from) {
  if (!(name in REQUIRED_OUTPUTS)) throw new Error(`"${name}" is not an Orient output`);
  return { ...graph, outputs: { ...graph.outputs, [name]: from } };
}

/** Everything wrong with `graph`, each naming the node - the engine's refusals, before any engine time is spent. */
export function validate(graph) {
  const problems = [];
  const byId = new Map(graph.nodes.map((n) => [n.id, n]));
  if (byId.size !== graph.nodes.length) problems.push('two nodes share an id');
  for (const node of graph.nodes) {
    const spec = KINDS[node.kind];
    if (!spec) { problems.push(`${node.id}: a ${node.kind} node is not an Orient node in this version`); continue; }
    for (const key of Object.keys(node.params ?? {})) {
      if (!(key in spec.params)) { problems.push(`${node.id}: a ${node.kind} has no parameter "${key}"`); continue; }
      const v = Number(node.params[key]);
      const [low, high] = LIMITS[key];
      if (!Number.isFinite(v) || v < low || v > high) problems.push(`${node.id}: "${key}" must be between ${low} and ${high}, got ${node.params[key]}`);
    }
    for (const [name, want] of Object.entries(spec.inputs)) {
      const from = node.inputs?.[name];
      if (!from) { problems.push(`${node.id}: input "${name}" is not connected`); continue; }
      const source = byId.get(from);
      if (!source) { problems.push(`${node.id}: input "${name}" points at ${from}, which does not exist`); continue; }
      const got = KINDS[source.kind]?.out;
      if (got !== undefined && got !== want) problems.push(`${node.id}: input "${name}" takes a ${want}, but ${from} gives a ${got}`);
    }
  }
  for (const [name, want] of Object.entries(REQUIRED_OUTPUTS)) {
    const from = graph.outputs[name];
    if (!from) { problems.push(`output "${name}" is not filled`); continue; }
    const source = byId.get(from);
    if (!source) { problems.push(`output "${name}" points at ${from}, which does not exist`); continue; }
    const got = KINDS[source.kind]?.out;
    if (got !== want) problems.push(`output "${name}" needs a ${want}, but ${from} gives a ${got ?? 'nothing'}`);
  }
  const state = new Map();
  const visit = (id, path) => {
    if (state.get(id) === 'done') return null;
    if (state.get(id) === 'open') return [...path, id];
    state.set(id, 'open');
    for (const from of Object.values(byId.get(id)?.inputs ?? {})) {
      if (!from || !byId.has(from)) continue;
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
  return { problems, warnings: [], ok: problems.length === 0 };
}
