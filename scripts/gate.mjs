/*
 * THE GATE, AND THE RECEIPT IT LEAVES.
 *
 *   npm run gate              every check below, then a receipt under artefacts/gate/
 *   npm run gate -- --list    print the steps and what each one is, run nothing
 *
 * WHY THIS EXISTS. The audit's MIXO-05: nothing outside the person running it could tell a gated
 * revision from an ungated one. Every check here already existed and every one of them was run by
 * remembering to. Two of the strongest - `gate:real` over the local patient scans and the trimesh
 * verification of a real export - ran once each, by hand, in a session nobody else can see.
 *
 * So this runs them in one command and writes down WHICH revision was gated, what each step exited
 * with, and the counts. A receipt is not a certificate: it says what happened, including what did
 * not.
 *
 * WHAT IT DELIBERATELY DOES NOT RUN, and says so in the receipt rather than leaving it to be
 * assumed - the two that must not share a machine with anything else:
 *
 *   npm run walk        186 browser checks, about half an hour, and the owner's rule is that no
 *                       other work happens while it runs. A receipt that quietly omitted it would
 *                       read as a full pass.
 *   npm run fonts       it REWRITES the subset faces. A gate must not change the tree it gates.
 *
 * NEVER PIPE A STEP THROUGH `tail`. The exit code becomes tail's, which has caught three runs in
 * this family of repos - once through a background-task notification that reported "exit 0" for a
 * walk that exited 1. Every step below is spawned directly and its own status is read.
 */
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'artefacts', 'gate');
const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';

/**
 * `count` pulls one number out of the step's own output so the receipt carries evidence and not
 * just a zero. A step with no count is not worse - it simply has no number to give.
 */
const STEPS = [
  { id: 'tsc', what: 'types', cmd: [npx, 'tsc', '--noEmit'] },
  { id: 'vendor', what: 'the vendored engine matches SOURCE.json', cmd: ['node', 'scripts/vendor-geometry.mjs', '--check'] },
  { id: 'test', what: 'the unit and guard suite', cmd: [npx, 'vitest', 'run'], count: /Tests\s+(\d+) passed/ },
  { id: 'duplicates', what: 'no duplicated vendored code', cmd: ['npm', 'run', 'check:duplicates'] },
  { id: 'screens', what: 'the screenshot set', cmd: ['npm', 'run', 'screens'] },
  { id: 'build', what: 'the production bundle', cmd: ['npm', 'run', 'build'], count: /(\d+) modules transformed/ },
  { id: 'wasm', what: 'the engine smoke', cmd: ['npm', 'run', 'wasm:test'] },
  { id: 'nogl', what: 'every way the app can fail to START says so', cmd: ['npm', 'run', 'gate:nogl'], count: /gate: (\d+)\/\d+ PASS/ },
  { id: 'real', what: 'the local real scans against their baseline', cmd: ['npm', 'run', 'gate:real'], count: /ran (\d+) scan/ },
];

/** Not run by this command, named so the receipt cannot be read as more than it is. */
const NOT_RUN = {
  walk: 'npm run walk - 186 browser checks, ~30 min, must run with nothing else on the machine',
  fonts: 'npm run fonts - rewrites the subset faces; a gate must not change the tree it gates',
};

if (process.argv.includes('--list')) {
  for (const step of STEPS) console.log(`${step.id.padEnd(11)} ${step.what}`);
  console.log('\nnot run:');
  for (const [id, why] of Object.entries(NOT_RUN)) console.log(`${id.padEnd(11)} ${why}`);
  process.exit(0);
}

const head = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: ROOT, encoding: 'utf8' }).trim();
const dirty = execFileSync('git', ['status', '--porcelain'], { cwd: ROOT, encoding: 'utf8' }).trim();
mkdirSync(OUT, { recursive: true });

const started = Date.now();
const results = [];
for (const step of STEPS) {
  const at = Date.now();
  const run = spawnSync(step.cmd[0], step.cmd.slice(1), { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 28, shell: process.platform === 'win32' });
  const output = `${run.stdout ?? ''}${run.stderr ?? ''}`;
  const logged = path.join(OUT, `${step.id}.log`);
  writeFileSync(logged, output);
  const matched = step.count ? step.count.exec(output) : null;
  const row = { id: step.id, exit: run.status, seconds: Math.round((Date.now() - at) / 1000), ...(matched ? { count: Number(matched[1]) } : {}), log: path.relative(ROOT, logged).replace(/\\/g, '/') };
  results.push(row);
  console.log(`${row.exit === 0 ? 'PASS' : 'FAIL'} ${step.id.padEnd(11)} exit ${row.exit}${row.count === undefined ? '' : ` | ${row.count}`} | ${row.seconds}s`);
  // Carry on after a failure: a receipt that stops at the first red tells you less than one that
  // names every red. The exit code below is what fails the command.
}

const failed = results.filter((row) => row.exit !== 0);
const receipt = {
  head,
  /* A gate run against a dirty tree did not gate `head`. Saying so is the whole point of a receipt. */
  tree: dirty === '' ? 'clean' : 'DIRTY - this receipt does not describe HEAD alone',
  ...(dirty === '' ? {} : { uncommitted: dirty.split(/\r?\n/).length }),
  when: new Date().toISOString(),
  seconds: Math.round((Date.now() - started) / 1000),
  steps: results,
  notRun: NOT_RUN,
  verdict: failed.length === 0 ? 'PASS' : `FAIL: ${failed.map((row) => row.id).join(', ')}`,
};
const file = path.join(OUT, `${head.slice(0, 7)}.json`);
writeFileSync(file, `${JSON.stringify(receipt, null, 2)}\n`);

console.log(`\n${receipt.verdict} - ${head.slice(0, 7)}, tree ${receipt.tree}, ${receipt.seconds}s`);
console.log(`receipt: ${path.relative(ROOT, file).replace(/\\/g, '/')}`);
console.log(`NOT run: ${Object.keys(NOT_RUN).join(', ')} (see the receipt for why)`);

/*
 * AND THE LINE TO PASTE, because `artefacts/` is git-ignored.
 *
 * The receipt and the step logs stay local - they are large and one of them lists the local patient
 * scans. What has to travel is the sentence, and the thing that stops it travelling is having to
 * assemble it by hand from nine scrollbacks. So it is assembled here, ready for `docs/HANDOFF.md`.
 */
const said = results.map((row) => `${row.id} ${row.exit}${row.count === undefined ? '' : ` (${row.count})`}`).join(' · ');
console.log(`\nfor the handoff:\n**Gate on \`${head.slice(0, 7)}\` (${receipt.tree}): ${receipt.verdict}.** ${said}. NOT run: ${Object.keys(NOT_RUN).join(', ')}.`);
if (failed.length) process.exitCode = 1;
