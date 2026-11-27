// Copyright (c) Mixo Creative.

/*
 * ONE JOB: the check Fable and Codex set before the composer's engine request may be sent (2026-11-27): re-score each
 * pair with some tips dropped - by the ENGINE's own area comparison, no new geometry - and first CALIBRATE on a mark
 * whose full run is already known. Diagnostic only: it writes to its own folder, never to the result cache, and never
 * changes a type.
 *
 *   node typelab/whatif.mjs --type <winner.type.json> [--band 26,51] [--node NS]
 *
 * Prints, per pair, the area-match score as built, with the calibration drop, and with the band drop; then the verdict:
 * the calibration must reproduce the known full-run result (it got WORSE), else the re-scorer is blind too and the band
 * result means nothing.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sampleScans } from '../scripts/samples.mjs';
import { stampNow } from './rules.mjs';
import { targetFor } from './targetMatch.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const valueOf = (flag) => { const at = args.indexOf(flag); return at < 0 ? undefined : args[at + 1]; };
const typeFile = valueOf('--type');
if (!typeFile || !existsSync(typeFile)) { console.error('--type <a type file, e.g. a fit folder\'s winner.type.json>'); process.exit(2); }
const band = (valueOf('--band') ?? '26,51').split(',').map(Number);
const node = valueOf('--node') ?? 'NS';
const gated = ['dental rim', 'hole', 'area']; // what a no-support mark with "rim obeys no-support" on takes away
const rules = [
  { name: `calibration: no-support on ${node}`, streams: gated, node },
  { name: `height band [${band[0]}, ${band[1]})`, streams: ['dental rim'], heightBand: band },
];
const out = join(here, 'output', `whatif-${stampNow()}`);
mkdirSync(out, { recursive: true });
const scans = sampleScans('denture').filter((scan) => targetFor(scan)?.status === 'ok');
const rows = [];
for (const [at, scan] of scans.entries()) {
  const dir = join(out, `scan-${at + 1}`);
  spawnSync(process.execPath, [join(here, 'cli.mjs'), '--kind', 'denture', '--type', resolve(typeFile), '--out', dir, scan],
    { cwd: join(here, '..'), env: { ...process.env, MIXO_WHATIF: JSON.stringify(rules) }, encoding: 'utf8', maxBuffer: 64e6 });
  try {
    const row = JSON.parse(readFileSync(join(dir, 'summary.json'), 'utf8')).cases[0];
    const ev = row.evidenceFile ? JSON.parse(readFileSync(join(dir, row.evidenceFile), 'utf8')) : null;
    if (ev?.whatIf) rows.push({ scan: at + 1, whatIf: ev.whatIf });
    else console.log(`scan ${at + 1}: not compared (${row.result}${row.reason ? `, ${row.reason}` : ''})`);
  } catch (error) { console.log(`scan ${at + 1}: no result (${error.message})`); }
}
const mean = (k) => Math.round((rows.reduce((s, r) => s + r.whatIf[k].score, 0) / rows.length) * 10) / 10;
for (const r of rows) console.log(`scan ${r.scan}: ${r.whatIf.map((w) => `${w.name} ${w.score}${w.dropped !== undefined ? ` (-${w.dropped} tips)` : ''}`).join(' | ')}`);
if (rows.length === 0) process.exit(1);
const [built, calib, banded] = [mean(0), mean(1), mean(2)];
console.log(`\nmean score: as built ${built} | ${rules[0].name} ${calib} | ${rules[1].name} ${banded}`);
const calibrated = calib < built;
const everyPair = rows.every((r) => r.whatIf[2].score > r.whatIf[0].score);
console.log(calibrated
  ? `calibration OK: the re-scorer also sees the known-bad mark as worse (${built} -> ${calib}).`
  : `calibration FAILED: the re-scorer sees the known-bad mark as better (${built} -> ${calib}) - it is blind to what the full run saw; the band result below means nothing.`);
console.log(calibrated && everyPair ? `height band: BETTER on every pair (${built} -> ${banded}) - meets the check.` : `height band: does not meet the check (${calibrated ? `not better on every pair` : 'calibration failed'}).`);
