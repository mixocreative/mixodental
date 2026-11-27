// Copyright (c) Mixo Creative.

/*
 * THE FIT: try setups on every scan of a category and rank them by how close their supported area comes to the -sup
 * targets - without letting our own safety rules slip. It never saves a type: it writes the winner as a type file
 * and the command to look at it, and the owner decides.
 *
 *   node typelab/fit.mjs --kind denture                          from the built-in denture type
 *   node typelab/fit.mjs --kind denture --type types/denture/x.type.json --passes 1
 *   node typelab/fit.mjs --kind aligner --category retainer
 *
 * The pieces, one job each: targetMatch.mjs (which scans have a target that lines up, and why not), fitSearch.mjs
 * (the edits tried - values AND zone-graph structure - and the search), fitScore.mjs (score, per-pair and
 * leave-one-out acceptance), runCache.mjs (each run of one scan with one type is kept where the review page finds it,
 * so the page opens any setup tried here instantly, and Save finds its proof).
 *
 * EVERY scan of the category runs, paired or not: a scan without a target adds nothing to the score, but a setup that
 * stops it building is still disqualified (Codex review, 2026-11-27).
 */
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sampleScans } from '../scripts/samples.mjs';
import { viteNodeCli } from '../scripts/viteNodeCli.mjs';
import { PROVISIONAL_UNDER } from './fitScore.mjs';
import { probeBand, streamsOutside } from './fitEvidence.mjs';
import { composeSearch } from './composeSearch.mjs';
import { gapReport, PROBE_BAR } from './gapReport.mjs';
import { describe, EDITS, search } from './fitSearch.mjs';
import { stampNow } from './rules.mjs';
import { CACHE, finishRun, isKept, runKey } from './runCache.mjs';
import { targetFor } from './targetMatch.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const repo = join(here, '..');
const args = process.argv.slice(2);
const valueOf = (flag) => { const at = args.indexOf(flag); return at < 0 ? undefined : args[at + 1]; };
const kind = valueOf('--kind') ?? 'denture';
const category = valueOf('--category') ?? kind;
const passes = Number(valueOf('--passes') ?? 2);
const typeArg = valueOf('--type');
const out = resolve(valueOf('--out') ?? join(here, 'output', `fit-${category}-${stampNow()}`));
// Scans given by path (the review page's session) run instead of the category's samples.
const VALUED = new Set(['--kind', '--category', '--passes', '--type', '--out']);
const given = args.filter((arg, at) => !arg.startsWith('--') && !VALUED.has(args[at - 1]));
const AT_ONCE = 2; // as the review server: two builds at a time is what this machine holds
if (!EDITS[kind]) { console.error(`--kind must be ${Object.keys(EDITS).join(' or ')}`); process.exit(2); }

/** The starting type: a type file, or the built-in of the kind (read through the app's own type list). */
function startType() {
  if (typeArg && existsSync(typeArg)) return JSON.parse(readFileSync(typeArg, 'utf8'));
  const file = join(out, 'catalog.json');
  const run = spawnSync(process.execPath, [viteNodeCli, '--script', join('typelab', 'typeCatalogRun.ts'), '--out', file], { cwd: repo, encoding: 'utf8' });
  if (run.status !== 0 || !existsSync(file)) throw new Error(`the type list could not be read: ${(run.stderr || run.stdout).slice(-600)}`);
  const types = JSON.parse(readFileSync(file, 'utf8')).types.filter((t) => t.category === kind);
  const pick = typeArg ? types.find((t) => t.id === typeArg) : types.find((t) => t.builtIn);
  if (!pick) throw new Error(`no ${kind} type ${typeArg ?? '(built-in)'} - give --type <file> or a listed id`);
  if (!pick.builtIn) return pick.type;
  // A built-in's own id is read-only to a type file; a copy under another id runs the same (runPrint ignores the id).
  const id = `${pick.type.id}-fit`;
  return { ...pick.type, id, basedOn: pick.type.id, profile: { ...pick.type.profile, id } };
}

/** One run of one scan with one type, kept in the shared cache; the summary row. */
function runOne(source, type) {
  const key = runKey(source, type);
  const part = join(CACHE, key);
  const row = () => ({ ...JSON.parse(readFileSync(join(part, 'summary.json'), 'utf8')).cases[0], source, dir: part });
  if (isKept(key, source)) return Promise.resolve(row());
  rmSync(part, { recursive: true, force: true });
  mkdirSync(part, { recursive: true });
  writeFileSync(join(part, 'type-in.json'), `${JSON.stringify(type, null, 2)}\n`);
  return new Promise((done) => {
    const child = spawn(process.execPath, [join(here, 'cli.mjs'), '--kind', kind, '--out', part, '--type', join(part, 'type-in.json'), source], { cwd: repo, stdio: ['ignore', 'pipe', 'pipe'] });
    let log = '';
    child.stdout.on('data', (c) => { log += c; });
    child.stderr.on('data', (c) => { log += c; });
    child.on('exit', (code) => {
      const refused = code === 0 ? finishRun(part, source, type) : `the run stopped with exit ${code}`;
      // A run that could not finish is a row that did not build - with the reason - never a missing row.
      done(refused ? { case: source, source, result: 'error', reason: `${refused}: ${log.slice(-300)}`, targetState: 'not-compared' } : row());
    });
  });
}

/** Every scan with `type`, AT_ONCE at a time, in scan order. */
async function evaluate(type) {
  const rows = new Array(scans.length);
  let next = 0;
  const worker = async () => { while (next < scans.length) { const at = next++; rows[at] = { ...(await runOne(scans[at], type)), case: `scan ${at + 1}` }; } };
  await Promise.all(Array.from({ length: AT_ONCE }, worker));
  return rows;
}

mkdirSync(out, { recursive: true });
const scans = given.length ? given.map((p) => resolve(p)) : sampleScans(category);
// Which scans are compared, and why the others are not: a fit ranked on a quietly smaller set reads as one of all.
const matches = scans.map((scan) => targetFor(scan));
const paired = matches.filter((m) => m?.status === 'ok').length;
matches.forEach((m, at) => { if (m && m.status !== 'ok') console.log(`  scan ${at + 1}: target not used - ${m.reason}`); });
if (paired === 0) { console.error(`No ${category} scan has a target that lines up (node typelab/targetMatch.mjs samples says why).`); process.exit(1); }
const start = startType();
console.log(`fit: ${scans.length} ${category} scan(s), ${paired} with a target; from type ${start.id}${paired < PROVISIONAL_UNDER ? ` - PROVISIONAL: under ${PROVISIONAL_UNDER} pairs` : ''} -> ${out}`);

const line = (t) => {
  const r = t.result;
  const head = r ? `score ${String(r.score).padStart(6)}  covered ${r.covered}%  outside ${r.outside}%` : 'not run';
  const tail = t.refused.length ? `  refused: ${t.refused.join('; ')}${r?.disqualified.length ? ` (${r.disqualified.join('; ')})` : ''}` : (t.steps.length ? '  KEPT' : '');
  console.log(`  ${head}  ${describe(t.steps)}${t.moved ? '' : '  (moved nothing)'}${tail}`);
};
const { start: first, best, tried } = await search({ start, kind, evaluate, passes, log: line });

const winnerId = start.id.endsWith('-fit') ? start.id : `${start.id}-fit`;
const winner = { ...best.type, id: winnerId, basedOn: start.basedOn ?? start.id, validation: null,
  profile: { ...best.type.profile, id: winnerId, name: Object.fromEntries(Object.entries(start.profile.name ?? { en: start.id }).map(([k, v]) => [k, `${v} (fit)`])) } };
writeFileSync(join(out, 'winner.type.json'), `${JSON.stringify(winner, null, 2)}\n`);
const slim = (t) => ({ setup: describe(t.steps), steps: t.steps, result: t.result, refused: t.refused, moved: t.moved });
writeFileSync(join(out, 'fit.json'), JSON.stringify({ kind, category, scans: scans.length, paired, start: start.id, best: slim(best), tried: tried.map(slim) }, null, 1));
/*
 * WHERE THE MISSES COME FROM (fitEvidence.mjs): per tip source, the support area outside the target, summed over the
 * pairs - for the starting setup and the winner. The first thing to read when the fit "moved nothing": a source whose
 * area outside does not shrink under zone edits is one the zone does not gate, and the next move is a node that gates
 * it, or an engine request - not more of the same edits.
 */
const evidenceOf = (rows) => rows.filter((row) => row?.evidenceFile && row.dir)
  .map((row) => { try { return JSON.parse(readFileSync(join(row.dir, row.evidenceFile), 'utf8')); } catch { return null; } }).filter(Boolean);
const outsideBy = (rows) => streamsOutside(evidenceOf(rows));
const startOutside = outsideBy(first.rows);
const bestOutside = outsideBy(best.rows);
writeFileSync(join(out, 'evidence.json'), JSON.stringify({ start: startOutside, best: bestOutside }, null, 1));
if (startOutside.length) {
  console.log('\nwhere our support area outside the target comes from (mm2, all pairs; start -> best):');
  for (const s of startOutside) {
    const b = bestOutside.find((x) => x.stream === s.stream);
    console.log(`  ${s.stream.padEnd(16)} ${String(s.outsideMm2).padStart(8)} -> ${String(b?.outsideMm2 ?? '-').padStart(8)}   (${s.tips} tips)`);
  }
}
/*
 * --compose: the composer (composeSearch.mjs) from the value fit's winner - Mark no-support edits chosen from the
 * evidence, for the source the misses mostly come from, under the agreed search rule.
 */
let composed = null;
if (args.includes('--compose')) {
  const read = (dir, file) => readFileSync(join(dir, file));
  const evidenceFor = (rows) => {
    const pairs = [];
    for (const row of rows) {
      if (!row?.evidenceFile || !row.zonesFile || !row.dir) continue;
      try {
        const ev = JSON.parse(read(row.dir, row.evidenceFile).toString('utf8'));
        const zones = JSON.parse(read(row.dir, row.zonesFile).toString('utf8'));
        const bin = read(row.dir, ev.bin);
        const zbin = read(row.dir, zones.bin);
        const slice = (buf, at, n) => new Uint8Array(buf.buffer, buf.byteOffset + at * n, n);
        pairs.push({ ev, classesOf: (stream) => slice(bin, ev.binOrder.indexOf(stream), ev.faceCount),
          nodes: zones.ids.map((id, k) => ({ id, values: slice(zbin, k, zones.faces) })) });
      } catch { /* a row whose files cannot be read is not evidence */ }
    }
    if (pairs.length === 0) return null;
    const stream = streamsOutside(pairs.map((p) => p.ev))[0]?.stream;
    // TRAP (first real run, 2026-11-27): the gain must be predicted on ALL sources' classes. A no-support mark takes
    // away every gated source's support under it, so judging it on the rim source alone predicted a large gain for
    // "no support everywhere but the rim band" - which wiped out the area and hole tips the target needs (refused).
    // The source the misses come from still names the rule the mark needs (GATE).
    return { stream, pairs: pairs.filter((p) => p.ev.binOrder.includes('all')).map((p) => ({ classes: p.classesOf('all'), nodes: p.nodes,
      ...(p.ev.binOrder.includes('slope') ? { slope: p.classesOf('slope'), height: p.classesOf('height') } : {}) })) };
  };
  console.log('\ncompose (from the winner above):');
  composed = await composeSearch({ start: best.type, startRows: best.rows, evaluate, evidenceOf: evidenceFor, log: (line) => console.log(line) });
  if (composed.best.steps.length) {
    console.log(`compose kept: ${composed.best.steps.join(' + ')} - score ${composed.best.result.score}`);
    writeFileSync(join(out, 'composed.type.json'), `${JSON.stringify({ ...composed.best.type, validation: null }, null, 2)}\n`);
  }
  // No arrangement of today's nodes got there: the draft engine request for a procedural node (gapReport.mjs).
  if (composed.gap) {
    // THE PROBES (fitEvidence.mjs probeBand): would a slope band or a height band, as a no-support mark, clean the misses
    // on EVERY pair? Same absolute bands on every pair; a band must clear the same per-node charge as a candidate.
    const ev = evidenceFor(composed.best.rows);
    const probing = (ev?.pairs ?? []).filter((p) => p.slope);
    const probes = probing.length ? [
      { name: 'slope band', unit: 'deg from horizontal', ...probeBand(probing.map((p) => ({ classes: p.classes, values: p.slope })), [0, 20, 40, 60, 80, 100, 120, 140, 160, 181]) },
      { name: 'height band', unit: '/255 of the model height', ...probeBand(probing.map((p) => ({ classes: p.classes, values: p.height })), [0, 26, 51, 77, 102, 128, 154, 179, 205, 230, 256]) },
    ] : [];
    for (const p of probes) console.log(`  probe ${p.name} [${p.lo}, ${p.hi}) ${p.unit}: per-pair predicted faces ${p.gains.join('/')} ${p.worst > PROBE_BAR ? 'SEPARATES on every pair' : '- does not separate on every pair'}`);
    writeFileSync(join(out, 'gap-report.md'), gapReport({ kind, stream: composed.gap.stream, outside: streamsOutside(evidenceOf(composed.best.rows)),
      ceilings: composed.gap.ceilings, refusedOnly: composed.gap.refusedOnly, tried: composed.tried, startScore: composed.best.result.score, probes }));
    console.log(`gap report (draft engine request, not sent): ${join(out, 'gap-report.md')}`);
  }
  writeFileSync(join(out, 'compose.json'), JSON.stringify({ steps: composed.best.steps, gap: composed.gap,
    tried: composed.tried.map((t) => ({ steps: t.steps, result: t.result, refused: t.refused, predicted: t.predicted })) }, null, 1));
}
const unmoved = tried.filter((t) => !t.moved && !t.problem).map((t) => describe(t.steps.slice(-1)));
console.log(`\nbest: ${describe(best.steps)}  score ${best.result.score} (start ${first.result.score}); covered ${best.result.covered}% (was ${first.result.covered}%), outside ${best.result.outside}% (was ${first.result.outside}%)`);
if (unmoved.length) console.log(`changed nothing on these scans (unproven, not neutral): ${unmoved.join('; ')}`);
console.log(`winner type: ${join(out, 'winner.type.json')}`);
console.log(`look:  node typelab/cli.mjs --kind ${kind} --type "${join(out, 'winner.type.json')}" --open <scans>`);
console.log('Nothing is saved as a type: look at the winner, then save it yourself if it is right.');
