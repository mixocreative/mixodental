// Real-scan gate: every local real scan through the batch review, diffed against a saved baseline.
//
//   npm run gate:real                       compare; exit 1 on any difference
//   npm run gate:real -- --kinds denture    subset (denture, aligner, multipart)
//   npm run gate:real -- --update           write a new baseline (only when explicitly wanted)
//
// Local only, never CI: the scans are patient data and live in git-ignored dentalwork/fixtures. One scan
// at a time (peak memory). Scans are read in place. The baseline holds numbers and hashes only, keyed by
// kind + a truncated SHA-256 of the scan's bytes, so no file name appears in it.
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { compareRuns, formatDifferences, recordOf } from './real-scan-gate-lib.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const BASELINE = join(root, 'dentalwork', 'baselines', 'real-scan-baseline.json');
/** kind label -> fixture folder and the pipeline kind the batch is told. */
const SETS = {
  denture: { dir: 'dentalwork/fixtures/case-denture', batchKind: 'denture' },
  aligner: { dir: 'dentalwork/fixtures/case-aligner', batchKind: 'aligner' },
  multipart: { dir: 'dentalwork/fixtures/case-emaaligner', batchKind: 'aligner' },
};

const args = process.argv.slice(2);
const update = args.includes('--update');
const kindsAt = args.indexOf('--kinds');
const kinds = kindsAt < 0 ? Object.keys(SETS) : (args[kindsAt + 1] ?? '').split(',').filter(Boolean);
for (const kind of kinds) if (!SETS[kind]) { console.error(`Unknown kind "${kind}". Use: ${Object.keys(SETS).join(', ')}`); process.exit(2); }

const sha = (bytes) => createHash('sha256').update(bytes).digest('hex');
const scans = [];
for (const kind of kinds) {
  const dir = join(root, SETS[kind].dir);
  if (!existsSync(dir)) continue;
  for (const name of readdirSync(dir).sort()) {
    if (!name.toLowerCase().endsWith('.stl') || name.toLowerCase().includes('-sup')) continue;
    const file = join(dir, name);
    scans.push({ kind, file, id: `${kind}-${sha(readFileSync(file)).slice(0, 12)}` });
  }
}
if (scans.length === 0) { console.log('real-scan gate: skipped, no local scans (dentalwork/fixtures/case-*).'); process.exit(0); }

function hashOutputs(out) {
  const hashes = {};
  const walk = (dir, prefix) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) walk(join(dir, entry.name), `${prefix}${entry.name}/`);
      else if (/\.glb$|-peel\.json$/.test(entry.name)) hashes[`${prefix}${entry.name}`] = sha(readFileSync(join(dir, entry.name)));
    }
  };
  walk(out, '');
  return hashes;
}

const work = mkdtempSync(join(tmpdir(), 'mixo-real-gate-'));
const runs = {};
const started = Date.now();
try {
  for (const [k, scan] of scans.entries()) {
    const out = join(work, 'out');
    rmSync(out, { recursive: true, force: true });
    mkdirSync(out, { recursive: true });
    process.stdout.write(`[${k + 1}/${scans.length}] ${scan.id} ... `);
    const run = spawnSync(process.execPath, [join(root, 'node_modules', 'vite-node', 'vite-node.mjs'), '--script', join(root, 'dentalwork', 'batch-review', 'batch.ts'),
      '--kind', SETS[scan.kind].batchKind, '--out', out, scan.file], { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
    const summaryFile = join(out, 'summary.json');
    if (!existsSync(summaryFile)) { console.log('FAILED (no summary)'); console.error((run.stderr || '').slice(-600)); process.exit(1); }
    const row = JSON.parse(readFileSync(summaryFile, 'utf8')).cases[0];
    runs[scan.id] = { kind: scan.kind, record: recordOf(row, hashOutputs(out)) };
    console.log(`${row.result}${row.verdict ? ` / ${row.verdict}` : ''}`);
  }
} finally {
  rmSync(work, { recursive: true, force: true });
}
console.log(`ran ${scans.length} scan(s) in ${Math.round((Date.now() - started) / 1000)} s`);

const saved = existsSync(BASELINE) ? JSON.parse(readFileSync(BASELINE, 'utf8')) : { cases: {}, nondeterministic: {} };
if (update) {
  const cases = { ...saved.cases };
  for (const id of Object.keys(cases)) if (kinds.includes(cases[id].kind)) delete cases[id];
  for (const [id, run] of Object.entries(runs)) cases[id] = run;
  const next = { note: 'Numbers and hashes only; keyed by kind + SHA-256 of the scan bytes. Written by npm run gate:real -- --update.', nondeterministic: saved.nondeterministic ?? {}, cases };
  const changes = compareRuns(saved, runs, kinds);
  console.log(saved.cases && Object.keys(saved.cases).length ? formatDifferences(changes.differences) : `new baseline: ${Object.keys(runs).length} case(s)`);
  mkdirSync(dirname(BASELINE), { recursive: true });
  writeFileSync(BASELINE, JSON.stringify(next, null, 2) + '\n');
  console.log(`baseline written: ${BASELINE}`);
  process.exit(0);
}
if (Object.keys(saved.cases).length === 0) { console.error('No baseline yet. Create it with: npm run gate:real -- --update'); process.exit(1); }
const result = compareRuns(saved, runs, kinds);
console.log(formatDifferences(result.differences));
console.log(result.ok ? `real-scan gate: PASS (${scans.length} scans)` : `real-scan gate: FAIL (${result.differences.length} case(s) differ)`);
process.exit(result.ok ? 0 : 1);
