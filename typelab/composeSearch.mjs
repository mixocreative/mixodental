// Copyright (c) Mixo Creative.

/*
 * ONE JOB: the composer's search - the rule Fable and Codex agreed (typelab/CLI.md "When the fit finds nothing"):
 * greedy, one edit per step, depth at most 3; candidates ranked offline (composer.mjs) and eligible only if predicted
 * to help on EVERY pair after a charge per added node; the top 3 per step get a full run; at most 8 full runs; a setup
 * moves on only if fitScore accepts it (refusals + leave-one-out); every run logs predicted against measured. When no
 * candidate is eligible it says so with the reachable ceiling - the gap report's first line.
 *
 * Runs and files are injected (fit.mjs supplies them), so the rule is tested without the engine.
 */
import { rankCandidates, reachableCeiling, candidateMasks } from './composer.mjs';
import { refusals, scoreRun } from './fitScore.mjs';
import { graphOf, markOnTop, typeProblem } from './fitSearch.mjs';
import { KINDS } from './nodeGraph.mjs';

/** Which zone change reaches a tip source: the area stream obeys the zone; rim and hole tips only with this rule on. */
export const GATE = {
  area: {},
  'dental rim': { rule: 'rimRespectsNoSupport', value: 1 },
  hole: { rule: 'rimRespectsNoSupport', value: 1 },
};

/** The graph edit for one candidate: a Mark no-support on top, fed by the node or by a new NOT / boolean of nodes. */
export function applyCandidate(type, build, stream) {
  let graph = graphOf(type);
  let faces = build.id;
  const extra = [];
  if (build.op) {
    let n = 1;
    while (graph.nodes.some((node) => node.id === `C${n}`)) n += 1;
    const id = `C${n}`;
    extra.push(build.op === 'not'
      ? { id, kind: 'not', params: {}, inputs: { a: build.a } }
      : { id, kind: build.op, params: {}, inputs: { a: build.a, b: build.b } });
    faces = id;
  }
  graph = markOnTop(graph, 'markNoSupport', faces, extra);
  const gate = GATE[stream] ?? {};
  const rules = gate.rule ? { ...type.rules, [gate.rule]: gate.value } : { ...type.rules };
  return { ...structuredClone(type), rules, zoneGraph: graph };
}

const describeBuild = (b) => (b.op ? `${b.op}(${b.a}${b.b ? `, ${b.b}` : ''})` : b.id);

/**
 * @param {{ start: object, startRows: object[], evaluate: (type) => Promise<object[]>,
 *   evidenceOf: (rows) => { pairs: { classes: Uint8Array, nodes: { id: string, values: Uint8Array }[] }[], stream: string } | null,
 *   log: (line: string) => void, depth?: number, cap?: number, top?: number, charge?: number }} opts
 */
export async function composeSearch({ start, startRows, evaluate, evidenceOf, log, depth = 3, cap = 8, top = 3, charge = 5 }) {
  let best = { type: start, rows: startRows, result: scoreRun(startRows, startRows), steps: [] };
  const tried = [];
  let runs = 0;
  for (let step = 1; step <= depth && runs < cap; step += 1) {
    const ev = evidenceOf(best.rows);
    if (!ev || ev.pairs.length === 0) { log('compose: no evidence to work from (no compared pair)'); break; }
    if (!(ev.stream in GATE)) { log(`compose: the misses come mostly from "${ev.stream}", which the zone does not gate - a rule or engine question, not a node arrangement`); break; }
    // Only nodes that GIVE FACES may feed a Mark (a Mark's own zone values are not a mask).
    const graph = graphOf(best.type);
    const maskIds = new Set(graph.nodes.filter((node) => KINDS[node.kind]?.out === 'mask').map((node) => node.id));
    const pairs = ev.pairs.map((p) => ({ classes: p.classes, nodes: p.nodes.filter((n) => maskIds.has(n.id)) }));
    const candidates = rankCandidates(pairs, { charge, top });
    if (candidates.length === 0) {
      const ceilings = pairs.map((p) => reachableCeiling(p.classes, candidateMasks(p.classes, p.nodes)));
      log(`compose: no separating mask in the tested vocabulary for "${ev.stream}" - the best arrangement of today's masks could clean ${ceilings.map((c) => `${Math.round(c.share * 100)}%`).join(' / ')} of its ours-only faces per pair. Gap report: a new procedural node is the next question.`);
      return { best, tried, gap: { stream: ev.stream, ceilings } };
    }
    let kept = null;
    for (const candidate of candidates) {
      if (runs >= cap) break;
      const type = applyCandidate(best.type, candidate.build, ev.stream);
      const problem = typeProblem(type);
      const name = `no-support on ${describeBuild(candidate.build)} for ${ev.stream}`;
      if (problem) { log(`  ${name}: not runnable - ${problem}`); continue; }
      runs += 1;
      const rows = await evaluate(type);
      const result = scoreRun(rows, startRows);
      const why = refusals(result, best.result);
      const entry = { type, rows, result, refused: why, steps: [...best.steps, name], predicted: candidate.gains };
      tried.push(entry);
      log(`  ${name}: predicted faces ${candidate.gains.join('/')} -> measured score ${best.result.score} -> ${result.score}${why.length ? `  refused: ${why.join('; ')}` : '  ACCEPTED'}`);
      if (why.length === 0 && (!kept || result.score > kept.result.score)) kept = entry;
    }
    if (!kept) { log('compose: no candidate was accepted this step - stop'); break; }
    best = kept;
  }
  return { best, tried, gap: null };
}
