// The FIT MODE: try setups on every scan whose -sup target lined up, and rank them by how close their supported area
// comes to the targets - without letting our own safety rules slip. It never saves a type: it prints the winner and the
// command to open it in the Type Lab, and the owner decides.
//
//   node typelab/fit.mjs --kind denture                    every denture sample with a lined-up target
//   node typelab/fit.mjs --kind denture --zone-graph g.json --passes 1
//   node typelab/fit.mjs --kind aligner --category retainer
//
// How it searches (coordinate descent, bounded): run the starting setup once; then for each setting in FIT_SPACE, try
// its other values one at a time on top of the best so far and keep a value only if it BEATS the best (fitScore.mjs:
// higher score, nothing disqualified). Repeat for --passes rounds (default 2), stop early when a round changes nothing.
// Cost: one Type Lab run of all the pairs per try (about 35 s for the three usable dentures today).
//
// Why these settings and these values: the rules the sweep of 2026-11-27 showed move the match (overhang angle, the
// rim's own overhang angle, rim tips obeying no-support), at the steps that sweep used. Not tilt or height: the owner
// ruled neither is a match term. A node graph is passed whole with --zone-graph; searching node edits is a later step.
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sampleScans } from '../scripts/samples.mjs';
import { beats, scoreRun } from './fitScore.mjs';
import { stampNow } from './rules.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const valueOf = (flag) => { const at = args.indexOf(flag); return at < 0 ? undefined : args[at + 1]; };
const kind = valueOf('--kind') ?? 'denture';
const category = valueOf('--category') ?? kind;
const passes = Number(valueOf('--passes') ?? 2);
const zoneGraph = valueOf('--zone-graph');
const out = resolve(valueOf('--out') ?? join(here, 'output', `fit-${category}-${stampNow()}`));

/** Settings the search turns, per kind: name -> values to try (the first is NOT a default; the start is the engine's own). */
const FIT_SPACE = {
  denture: { overhangAngleDeg: [45, 55, 60], dentalRimOverhangAngleDeg: [60, 45, 40], rimRespectsNoSupport: [0, 1] },
  // The aligner reads only the shared overhang angle (rules.mjs), and it was never seen to move a result: tried anyway,
  // and an unchanged score says so rather than being taken as proof.
  aligner: { overhangAngleDeg: [35, 45, 55] },
};
if (!FIT_SPACE[kind]) { console.error(`--kind must be ${Object.keys(FIT_SPACE).join(' or ')}`); process.exit(2); }

/** A scan is a pair when its -sup contacts were extracted, lined up, and gave contacts (scripts/extract-sup-contacts.py). */
function linedUp(scan) {
  if (!/\.stl$/i.test(scan)) return false;
  const contacts = scan.replace(/\.stl$/i, '-sup.contacts.json');
  if (!existsSync(contacts)) return false;
  const file = JSON.parse(readFileSync(contacts, 'utf8'));
  return file.registration !== 'failed' && Array.isArray(file.contacts) && file.contacts.length > 0;
}
const pairs = sampleScans(category).filter(linedUp);
if (pairs.length === 0) {
  console.error(`No ${category} scan with a lined-up target. Extract contacts first: python -I scripts/extract-sup-contacts.py samples`);
  process.exit(1);
}
mkdirSync(out, { recursive: true });
console.log(`fit: ${pairs.length} ${category} pair(s), kind ${kind}${zoneGraph ? `, zone graph ${zoneGraph}` : ''} -> ${out}`);

let runs = 0;
/** One Type Lab run of every pair with `rules`; its rows from summary.json. */
function run(rules) {
  const dir = join(out, `run-${String(++runs).padStart(2, '0')}`);
  const sets = Object.entries(rules).flatMap(([name, value]) => ['--set', `${name}=${value}`]);
  const child = spawnSync(process.execPath, [join(here, 'cli.mjs'), '--kind', kind, ...(zoneGraph ? ['--zone-graph', zoneGraph] : []), ...sets, '--out', dir, ...pairs],
    { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  const summary = join(dir, 'summary.json');
  if (!existsSync(summary)) throw new Error(`run ${runs} wrote no summary:\n${(child.stderr || child.stdout || '').slice(-800)}`);
  return { dir, rows: JSON.parse(readFileSync(summary, 'utf8')).cases };
}

const label = (rules) => (Object.keys(rules).length ? Object.entries(rules).map(([k, v]) => `${k}=${v}`).join(' ') : '(starting setup)');
const tried = [];
const record = (rules, { dir, rows }, baselineRows) => {
  const result = { rules, dir, ...scoreRun(rows, baselineRows) };
  tried.push(result);
  const flag = result.disqualified.length ? `  DISQUALIFIED: ${result.disqualified.join('; ')}` : '';
  console.log(`  score ${String(result.score).padStart(6)}  covered ${result.covered}%  outside ${result.outside}%  ${label(rules)}${flag}`);
  return result;
};

const start = run({});
let best = record({}, start, start.rows);
for (let pass = 1; pass <= passes; pass++) {
  const before = best;
  for (const [name, values] of Object.entries(FIT_SPACE[kind])) {
    for (const value of values) {
      if (best.rules[name] === value) continue;
      const rules = { ...best.rules, [name]: value };
      if (tried.some((t) => label(t.rules) === label(rules))) continue;
      const candidate = record(rules, run(rules), start.rows);
      if (beats(candidate, best)) best = candidate;
    }
  }
  if (best === before) break;
}

const ranked = [...tried].sort((a, b) => (a.disqualified.length - b.disqualified.length) || (b.score - a.score));
writeFileSync(join(out, 'fit.json'), JSON.stringify({ kind, category, pairs: pairs.length, zoneGraph: zoneGraph ?? null, start: tried[0], best, ranked }, null, 1));
console.log(`\nbest: ${label(best.rules)}  score ${best.score} (start ${tried[0].score}): covered ${best.covered}% (was ${tried[0].covered}%), outside ${best.outside}% (was ${tried[0].outside}%)`);
console.log(`look:  node typelab/serve.mjs "${best.dir}"   (press Compare with target on each case)`);
console.log(`again: node typelab/cli.mjs --kind ${kind}${zoneGraph ? ` --zone-graph ${zoneGraph}` : ''} ${Object.entries(best.rules).map(([k, v]) => `--set ${k}=${v}`).join(' ')} <scans>`);
console.log('Nothing is saved as a type: open the winner, look at it, and save it yourself if it is right.');
