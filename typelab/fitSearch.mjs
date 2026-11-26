// Copyright (c) Mixo Creative.

/*
 * ONE JOB: the setups a fit tries, and the search over them - on WHOLE TYPE FILES, so every setup tried is a type the
 * review page can open and Save can prove. Running one is not done here: `search` is handed an `evaluate(type)` that
 * answers the run's rows (fit.mjs runs them through the shared result cache, runCache.mjs). Pure otherwise, so the
 * grammar and the search are tested without the engine (fitSearch.test.ts).
 *
 * THE GRAMMAR (Fable + Codex review, 2026-11-27): a small, named set of edits, each one a value or a STRUCTURE change,
 * never a free-form graph. Three families:
 *   rule       a named engine rule (rules.mjs), pinned in the type
 *   profile    a profile number: the Rim tab's strip widths for a denture, the strip numbers for an aligner
 *   graph      the denture zone graph: a node's number, or a Mark added to / removed from the zone stack - the
 *              "rethink, not just tune" part (owner, 2026-11-27). Every graph edit is validated (nodeGraph.mjs) before
 *              it may run, and only kinds the engine runs are used.
 * Not tilt, not height over the plate: the owner ruled neither is a match term (2026-11-27).
 *
 * THE SEARCH: start from the given type; each pass tries every edit's other values on top of the best so far, and
 * keeps one only when fitScore's `refusals` is empty (higher score, nothing disqualified, no pair clearly worse,
 * survives leave-one-out). Stops when a pass keeps nothing, or after `passes`.
 */
import { defaultGraph, steepAngleProblem, upgradeGraph, validate } from './nodeGraph.mjs';
import { refusals, scoreRun } from './fitScore.mjs';

const clone = (value) => structuredClone(value);

/** The zone graph a type runs with (its own, else the standard one), upgraded to the one-zone stack. */
export const graphOf = (type) => upgradeGraph(clone(type.zoneGraph ?? defaultGraph()));

/** A fresh node id for `graph`, `F1`, `F2`... */
const freshId = (graph, stem = 'F') => {
  let n = 1;
  while (graph.nodes.some((node) => node.id === `${stem}${n}`)) n += 1;
  return `${stem}${n}`;
};

/** Put a Mark on TOP of the zone stack: it wins over every Mark under it. `extra` = helper nodes it reads. */
export function markOnTop(graph, kind, facesOf, extra = []) {
  const out = clone(graph);
  for (const node of extra) out.nodes.push(node);
  const id = freshId(out);
  out.nodes.push({ id, kind, params: kind === 'markSupport' ? { seen: true } : {}, inputs: { under: out.outputs.zone, faces: facesOf } });
  out.outputs.zone = id;
  return out;
}

/** Take one Mark out of the stack: what stood on it stands on what was under it. */
export function removeMark(graph, id) {
  const out = clone(graph);
  const node = out.nodes.find((n) => n.id === id);
  if (!node || !/^mark/.test(node.kind)) return null;
  const under = node.inputs.under;
  for (const other of out.nodes) if (other.inputs?.under === id) { if (under) other.inputs.under = under; else delete other.inputs.under; }
  if (out.outputs.zone === id) { if (!under) return null; out.outputs.zone = under; }
  out.nodes = out.nodes.filter((n) => n.id !== id);
  return out;
}

/** Set one node's parameter. */
export function nodeParam(graph, id, key, value) {
  const out = clone(graph);
  const node = out.nodes.find((n) => n.id === id);
  if (!node) return null;
  node.params = { ...node.params, [key]: value };
  return out;
}

const rimSide = (graph, which, mm) => ({ id: freshId(graph, which === 'inner' ? 'RSI' : 'RSO'), kind: 'rimSide', params: { which, mm }, inputs: { rim: graph.outputs.rim } });

/**
 * The edits per kind. Each: `name`, its `values` (what it is set to; `true` for a structure change), and `apply(type,
 * value)` -> a new type, or null when it does not apply to this type (e.g. the node is gone).
 */
export const EDITS = {
  denture: [
    rule('overhangAngleDeg', [45, 55, 60]),
    rule('dentalRimOverhangAngleDeg', [60, 45, 40]),
    rule('rimRespectsNoSupport', [0, 1]),
    placement('rimBandMm', [1, 3]),
    placement('lowRimBandMm', [3, 7]),
    graph('R1.deg', [35, 55, 60], (g, v) => nodeParam(g, 'R1', 'deg', v)),
    graph('BAND.mm', [3, 7], (g, v) => nodeParam(g, 'BAND', 'mm', v)),
    // STRUCTURE: what the stack says, not how much.
    graph('rays win over every support mark', [true], (g) => markOnTop(g, 'markNoSupport', 'NS')),
    graph('no support strip round the holes', [true], (g) => removeMark(g, 'Z3')),
    graph('no support on the rim\'s inner side', [true], (g) => { const s = rimSide(g, 'inner', 2); return markOnTop(g, 'markNoSupport', s.id, [s]); }),
    graph('support on the rim\'s outer side', [true], (g) => { const s = rimSide(g, 'outer', 2); return markOnTop(g, 'markSupport', s.id, [s]); }),
    graph('no support on the low rim belt', [true], (g) => markOnTop(g, 'markNoSupport', 'LOWRIMBAND')),
  ],
  // The aligner reads no rules that were seen to move it and no graph; its STRIP numbers are profile fields
  // (profile.defaults), which a type carries to the engine (probe 2026-11-27, typelab/CLI.md).
  aligner: [
    alignerDefault('positionMm', [0, 0.6, 1.2]),
    alignerDefault('stripWidthMm', [0.3, 1, 1.6]),
    alignerDefault('density', [0.7, 1.5]),
    alignerDefault('outerSpacingMm', [2, 4]),
    alignerDefault('innerSpacingMm', [3, 5]),
  ],
};

function rule(name, values) {
  return { name, family: 'rule', values, apply: (type, value) => ({ ...clone(type), rules: { ...type.rules, [name]: value } }) };
}
function placement(key, values) {
  return { name: key, family: 'profile', values, apply: (type, value) => { const t = clone(type); t.profile.placement = { ...t.profile.placement, [key]: value }; return t; } };
}
function alignerDefault(key, values) {
  return { name: key, family: 'profile', values, apply: (type, value) => { const t = clone(type); t.profile.defaults = { ...t.profile.defaults, [key]: value }; return t; } };
}
function graph(name, values, edit) {
  return {
    name, family: 'graph', values,
    apply: (type, value) => {
      const next = edit(graphOf(type), value);
      return next ? { ...clone(type), zoneGraph: next } : null;
    },
  };
}

/** Why `type` may not run, or null: a graph the editor's own checks refuse never reaches the engine. */
export function typeProblem(type) {
  if (type.category !== 'denture' || type.zoneGraph == null) return null;
  const check = validate(type.zoneGraph);
  if (!check.ok) return check.problems.join('; ');
  return steepAngleProblem(type.zoneGraph, type.rules);
}

/** The edits of `type` against `start`, in words, for the ranked list (e.g. "overhangAngleDeg=60, rays win..."). */
export const describe = (steps) => (steps.length ? steps.map(({ name, value }) => (value === true ? name : `${name}=${value}`)).join(', ') : '(starting setup)');

/**
 * The search. `evaluate(type)` -> Promise<rows> (a run's summary cases for every scan). `log(line)` reports progress.
 * @returns {Promise<{ start: object, best: object, tried: object[] }>} each tried = { steps, type, result, refused, problem, moved }
 */
export async function search({ start, kind, evaluate, passes = 2, log = () => undefined, edits = EDITS[kind] }) {
  const startRows = await evaluate(start);
  const first = { steps: [], type: start, rows: startRows, result: scoreRun(startRows, startRows), refused: [], problem: null, moved: true };
  log(first);
  const tried = [first];
  let best = first;
  for (let pass = 1; pass <= passes; pass += 1) {
    const before = best;
    for (const edit of edits) {
      for (const value of edit.values) {
        const steps = [...best.steps.filter((s) => s.name !== edit.name), { name: edit.name, value }];
        if (best.steps.some((s) => s.name === edit.name && s.value === value)) continue;
        if (tried.some((t) => describe(t.steps) === describe(steps))) continue;
        const type = edit.apply(best.type, value);
        if (!type) continue;
        const problem = typeProblem(type);
        if (problem) { const skip = { steps, type, rows: [], result: null, refused: [`not runnable: ${problem}`], problem, moved: false }; tried.push(skip); log(skip); continue; }
        const rows = await evaluate(type);
        const result = scoreRun(rows, startRows);
        const why = refusals(result, best.result);
        // "Nothing moved" is evidence too: an edit that changes no pair's numbers is unproven on these scans, not neutral.
        const moved = JSON.stringify(result.perPair) !== JSON.stringify(best.result.perPair) || result.score !== best.result.score;
        const entry = { steps, type, rows, result, refused: why, problem: null, moved };
        tried.push(entry);
        log(entry);
        if (why.length === 0) best = entry;
      }
    }
    if (best === before) break;
  }
  return { start: first, best, tried };
}
