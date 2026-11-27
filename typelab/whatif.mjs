// Copyright (c) Mixo Creative.

/*
 * ONE JOB: the check Fable and Codex set before the composer's engine request may be sent (2026-11-27): re-score each
 * pair with some tips dropped - by the ENGINE's own area comparison, no new geometry - and first CALIBRATE on a mark
 * whose full run is already known. Diagnostic only: it writes to its own folder, never to the result cache, and never
 * changes a type. `rescore` is the function (the fit's gap report calls it to confirm a probe band); run directly:
 *
 *   node typelab/whatif.mjs --type <winner.type.json> [--band 26,51] [--node NS] [--rules '<json>']
 *
 * Prints, per pair, the area-match score as built and under each rule; the first rule is the calibration and must come
 * out WORSE (it reproduces a known full run), else the re-scorer is blind and the rest means nothing.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sampleScans } from '../scripts/samples.mjs';
import { stampNow } from './rules.mjs';
import { targetFor } from './targetMatch.mjs';

const here = dirname(fileURLToPath(import.meta.url));

/**
 * Re-score every compared denture pair under `rules` ([{ name, streams, node?, invert?, heightBand?, slopeBand? }]).
 * @returns {{ scan: number, whatIf: { name: string, score: number, dropped?: number }[] }[]} whatIf[0] = as built
 */
export function rescore({ typeFile, rules, out = join(here, 'output', `whatif-${stampNow()}`), log = () => undefined, scans: given }) {
  mkdirSync(out, { recursive: true });
  const scans = (given ?? sampleScans('denture')).filter((scan) => targetFor(scan)?.status === 'ok');
  const rows = [];
  for (const [at, scan] of scans.entries()) {
    const dir = join(out, `scan-${at + 1}`);
    spawnSync(process.execPath, [join(here, 'cli.mjs'), '--kind', 'denture', '--type', resolve(typeFile), '--out', dir, scan],
      { cwd: join(here, '..'), env: { ...process.env, MIXO_WHATIF: JSON.stringify(rules) }, encoding: 'utf8', maxBuffer: 64e6 });
    try {
      const row = JSON.parse(readFileSync(join(dir, 'summary.json'), 'utf8')).cases[0];
      const ev = row.evidenceFile ? JSON.parse(readFileSync(join(dir, row.evidenceFile), 'utf8')) : null;
      if (ev?.whatIf) rows.push({ scan: at + 1, whatIf: ev.whatIf });
      else log(`scan ${at + 1}: not compared (${row.result}${row.reason ? `, ${row.reason}` : ''})`);
    } catch (error) { log(`scan ${at + 1}: no result (${error.message})`); }
  }
  return rows;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const valueOf = (flag) => { const at = args.indexOf(flag); return at < 0 ? undefined : args[at + 1]; };
  const typeFile = valueOf('--type');
  if (!typeFile || !existsSync(typeFile)) { console.error('--type <a type file, e.g. a fit folder\'s winner.type.json>'); process.exit(2); }
  const band = (valueOf('--band') ?? '26,51').split(',').map(Number);
  const node = valueOf('--node') ?? 'NS';
  const gated = ['dental rim', 'hole', 'area']; // what a no-support mark with "rim obeys no-support" on takes away
  const rules = valueOf('--rules') ? JSON.parse(valueOf('--rules')) : [
    { name: `calibration: no-support on ${node}`, streams: gated, node },
    { name: `height band [${band[0]}, ${band[1]})`, streams: ['dental rim'], heightBand: band },
  ];
  const rows = rescore({ typeFile, rules, log: (line) => console.log(line) });
  for (const r of rows) console.log(`scan ${r.scan}: ${r.whatIf.map((w) => `${w.name} ${w.score}${w.dropped !== undefined ? ` (-${w.dropped} tips)` : ''}`).join(' | ')}`);
  if (rows.length === 0) process.exit(1);
  const mean = (k) => Math.round((rows.reduce((s, r) => s + r.whatIf[k].score, 0) / rows.length) * 10) / 10;
  console.log(`\nmean score: as built ${mean(0)} | ${rules.map((rule, k) => `${rule.name} ${mean(k + 1)}`).join(' | ')}`);
  const calibrated = mean(1) < mean(0);
  console.log(calibrated
    ? `calibration OK: the re-scorer also sees the known-bad mark as worse (${mean(0)} -> ${mean(1)}).`
    : `calibration FAILED: the re-scorer sees the known-bad mark as better (${mean(0)} -> ${mean(1)}) - it is blind to what the full run saw; the rest means nothing.`);
  for (let k = 1; k < rules.length; k += 1) {
    const better = rows.every((r) => r.whatIf[k + 1].score > r.whatIf[0].score);
    console.log(`${rules[k].name}: ${calibrated && better ? `BETTER on every pair (${mean(0)} -> ${mean(k + 1)})` : `does not meet the check${calibrated ? ' (not better on every pair)' : ' (calibration failed)'}`}`);
  }
}
