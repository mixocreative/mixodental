// THE JIG: author how a type is decided, on the bench, outside the app.
//
// A jig is the workshop fixture that holds a piece and guides a repeated cut - you shape it once and
// every part made against it comes out the same. That is what authoring a type is, so that is the
// name. It runs the REAL engine on real scans, never an approximation of it.
//
//   npm run jig -- --list                                       the rules this tool offers
//   npm run jig -- --kind denture --set overhangAngleDeg=50 "<stl folder>"
//   npm run jig -- --kind denture --set socketNoSupport=1 --set noSupportSteepDeg=67.5 "<folder>" --open
//
// WHAT IT ADDS, and it is deliberately only this: the folder review already runs the engine and the
// viewer already draws its masks (`README.md`, `serve.mjs`). What was missing is the AUTHORING layer
// around them - a shortlist of the rules worth turning out of ~130 named ones, validation before a
// run is spent, a reproducible record of what was turned, and the recompute cost printed so nobody
// designs an interaction around a number they have not measured.
//
// WHY ONLY NAMED RULES, which is the constraint that shapes the whole tool. No dental ABI call
// accepts profile JSON: every entry point takes a profile id string and looks it up in a registry
// COMPILED INTO THE WASM. So a profile NUMBER cannot be previewed at all - changing one needs
// profiles:gen, wasm:build, a commit and vendor:geometry, a Rust rebuild per knob. The one live
// channel is the engine's host-overridable rules, passed by name (`RULE_NAMES` / `packRules`), which
// `profileSelect.ts` already threads through `MIXO_RULES`. The Jig turns those and nothing else.
//
// THE ALIGNER HAS NO LIVE CHANNEL. `denture_policy_ruled`, `denture_review_ruled` and
// `denture_tilt_scan_ruled` take a rules array; the aligner's `dental_policy` does not. So
// `--kind aligner` runs and is useful for looking, but `--set` cannot change an aligner's masks, and
// this refuses the combination rather than silently ignoring it.
//
// WHY .mjs AND NOT TypeScript. This file is pure orchestration: parse, validate, spawn, report. It
// imports nothing from the engine and does no geometry, which is architecture rule 3's whole point -
// and `scripts/geometry-guard.mjs` does not scan this folder, so the rule is on the author here. Keep
// it that way: if the Jig ever needs a vector, it is asking the engine the wrong question.
import { spawn } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { JIG_RULES, parseSets } from './jigRules.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..', '..');
const args = process.argv.slice(2);
const has = (flag) => args.includes(flag);
const valueOf = (flag) => { const at = args.indexOf(flag); return at < 0 ? undefined : args[at + 1]; };

if (has('--list') || args.length === 0) {
  console.log('\nThe Jig - the rules it offers. Everything else in the engine stays as the profile sets it.\n');
  for (const rule of JIG_RULES) console.log(`  ${rule.name.padEnd(28)} ${`(${rule.type})`.padEnd(8)} ${rule.says}`);
  console.log('\n  A flag takes 1 or 0. A mode takes a whole number. Everything else takes a number.');
  console.log('  Only a DENTURE responds to these: the aligner pipeline has no rules channel (see the header).');
  console.log('\n  npm run jig -- --kind denture --set overhangAngleDeg=50 "S:\\path\\to\\stl folder" --open\n');
  process.exit(0);
}

const sets = args.map((arg, k) => (arg === '--set' ? args[k + 1] : undefined)).filter((value) => value !== undefined);
const { rules, problems } = parseSets(sets);
if (problems.length > 0) {
  console.error(`\nNothing ran. ${problems.length} problem(s):\n`);
  for (const problem of problems) console.error(`  ${problem}`);
  console.error('');
  process.exit(2);
}

const kind = valueOf('--kind') ?? 'denture';
if (kind !== 'denture' && kind !== 'aligner') { console.error("--kind must be 'denture' or 'aligner'"); process.exit(2); }
if (kind === 'aligner' && Object.keys(rules).length > 0) {
  console.error('\n--kind aligner ignores every --set: the aligner pipeline has no rules channel (dental_policy takes no');
  console.error('rules array, where the denture has denture_policy_ruled). Run it without --set to look, or use --kind denture.\n');
  process.exit(2);
}

const skip = new Set(['--kind', valueOf('--kind'), '--out', valueOf('--out'), ...sets, '--set', '--open', '--list']);
const folders = args.filter((arg) => !skip.has(arg) && !arg.startsWith('--'));
if (folders.length === 0) {
  console.error('Give the folder holding the STL files (subfolders included). Run --list to see the rules.');
  process.exit(2);
}
const missing = folders.filter((folder) => !existsSync(resolve(folder)));
if (missing.length > 0) {
  /*
   * A FRESH CLONE HAS NO SCANS. Every case folder is git-ignored (patient data), so the Jig must say
   * what is absent and stop, the way `gate:real` reports an owner-only scan rather than failing.
   */
  console.error(`\nNot on this machine: ${missing.join(', ')}`);
  console.error('Every scan folder is git-ignored, so a fresh clone has none. Point the Jig at a folder of STL files.\n');
  process.exit(3);
}

const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, '').replace('T', '-');
const out = resolve(valueOf('--out') ?? join(here, '..', 'output', `jig-${stamp}`));
const vite = join(root, 'node_modules', '.bin', process.platform === 'win32' ? 'vite-node.cmd' : 'vite-node');

console.log(`\nThe Jig - ${kind}, ${Object.keys(rules).length} rule(s) turned`);
for (const [name, value] of Object.entries(rules)) console.log(`  ${name} = ${value}`);
if (Object.keys(rules).length === 0) console.log('  (none - the profile as it ships, which is the baseline worth looking at first)');
console.log(`  out: ${out}\n`);

const child = spawn(vite, ['--script', join('dentalwork', 'batch-review', 'batch.ts'), '--kind', kind, '--out', out, ...folders], {
  cwd: root, stdio: 'inherit', shell: process.platform === 'win32',
  // MIXO_TIMERS makes every row report its stage seconds, which is the measurement the interaction design waits on.
  env: { ...process.env, MIXO_RULES: JSON.stringify(rules), MIXO_TIMERS: '1' },
});

child.on('exit', (code) => {
  if (code !== 0) { console.error(`\nThe review did not finish (exit ${code}). Nothing to look at in ${out}.\n`); process.exit(code ?? 1); }
  const summaryAt = join(out, 'summary.json');
  if (!existsSync(summaryAt)) { console.error(`\nThe review finished but wrote no summary.json to ${out}.\n`); process.exit(1); }
  const summary = JSON.parse(readFileSync(summaryAt, 'utf8'));
  // `cases`, and each row's time is `seconds` - NOT `rows`/`stageSeconds`, which is the shape the
  // internal `DentureReview` carries. The first version of this file read the internal names, found
  // nothing, and cheerfully reported "cases 0" after a successful run: a report that looks like an
  // answer and measured nothing, which is the exact failure the validation above exists to prevent.
  const rows = Array.isArray(summary.cases) ? summary.cases : [];

  /*
   * THE AUTHORED RULE SET, written beside the review it produced. This is the Jig's durable output
   * and what a type is eventually burned from: the rules, the kind, the engine that ran them and the
   * scans they were judged on. A run nobody can reproduce is an opinion, not evidence.
   */
  const record = { tool: 'jig', at: new Date().toISOString(), kind, rules,
    engine: existsSync(join(root, 'vendor', 'mixo-geocore', 'VERSION'))
      ? readFileSync(join(root, 'vendor', 'mixo-geocore', 'VERSION'), 'utf8').trim() : 'unknown',
    folders: folders.map((folder) => resolve(folder)), cases: rows.length };
  writeFileSync(join(out, 'jig.json'), `${JSON.stringify(record, null, 2)}\n`, 'utf8');

  /*
   * THE RECOMPUTE COST, printed every run. Whether this tool can ever be LIVE turns on this number
   * and nobody had measured it: if a case is seconds, the interaction is Apply and wait, and that is
   * a finding about the engine rather than a reason to fake responsiveness.
   */
  const seconds = rows.map((row) => row.seconds).filter((value) => typeof value === 'number');
  const sum = (field) => rows.reduce((total, row) => total + (typeof row[field] === 'number' ? row[field] : 0), 0);
  console.log('\n--- the Jig ---------------------------------------------------------------');
  console.log(`cases      ${rows.length}  (${rows.filter((row) => row.result === 'built').length} built, ${rows.filter((row) => row.needsLook).length} need a look)`);
  /*
   * THE NUMBERS A RULE CHANGE MOVES, so two runs can be compared without opening the viewer. These
   * are the whole point of turning a rule: if none of them differs between two rule sets, the rule
   * did nothing on these scans and that is the finding.
   */
  console.log(`tips       ${sum('tipsPlaced')} placed, ${sum('tipsLeftOut')} left out`);
  console.log(`islands    ${sum('islandsUnresolved')} unresolved, ${sum('islandsResolved')} resolved, ${sum('islandsOutsideArea')} outside the area`);
  console.log(`safety     ${rows.filter((row) => row.verdict === 'clear').length} clear, ${rows.filter((row) => row.verdict === 'blocked').length} blocked, ${sum('crossings')} crossings`);
  for (const row of rows) console.log(`  ${String(row.case ?? '?').padEnd(10)} ${String(row.result).padEnd(13)} ${row.printAngleDeg ?? '-'}°  ${row.tipsPlaced ?? '-'} tips  ${typeof row.seconds === 'number' ? `${row.seconds.toFixed(1)} s` : ''}`);
  if (seconds.length > 0) {
    const total = seconds.reduce((all, value) => all + value, 0);
    const each = total / seconds.length;
    console.log(`recompute  ${each.toFixed(1)} s per case (slowest ${Math.max(...seconds).toFixed(1)} s, ${total.toFixed(1)} s for the run)`);
    console.log(`           ${each > 2 ? 'TOO SLOW TO BE LIVE: a panel applies and waits.' : 'Fast enough that a live panel is worth designing.'}`);
  }
  console.log(`authored   ${join(out, 'jig.json')}`);
  console.log(`look       node dentalwork/batch-review/serve.mjs "${out}"`);
  console.log('           Review only: inspect every result before printing. Not clinically validated.');
  console.log('---------------------------------------------------------------------------\n');

  if (has('--open')) spawn('node', [join(here, 'serve.mjs'), out], { cwd: root, stdio: 'inherit' });
});
