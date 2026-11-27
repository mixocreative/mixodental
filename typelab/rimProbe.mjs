// Copyright (c) Mixo Creative.

/*
 * ONE JOB: the rim-only probes of 2026-11-27 - would a no-support zone that ONLY the rim tips obey (the owner's "rim
 * tips as a node in the stack, a later no-support cancels them") get closer to the -sup targets? Diagnostic only: it
 * re-scores each compared denture pair with some RIM tips dropped (whatif.mjs, the engine's own area comparison) and
 * never changes a type or the result cache. Run from the repo root:
 *
 *   node typelab/rimProbe.mjs --type <a fit folder's best.type.json> [--out <folder>] [--pose]
 *
 * Default: every slope / height / rim-distance / sector band and a set of parallel casts, each as "hit" and "NOT hit".
 * The casts are wired into an EMPTY Mark no-support on top (subtract(U, U)) - an unwired node is never evaluated
 * (nodeGraph.mjs `unreached`), and an empty mark changes no result. `--pose`: drop the rim tips whose face does not
 * overhang in the OWNER's print pose, read from the matcher's transform per pair.
 *
 * What it found (typelab/CLI.md "When the fit finds nothing"): nothing separates on every pair; dropping all rim tips
 * splits the pairs per CASE; the print pose is not the cause. Engine request: mixo-geocore docs/requests/
 * zone-stack-edge-tip-marks.md.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sampleScans } from '../scripts/samples.mjs';
import { validate } from './nodeGraph.mjs';
import { stampNow } from './rules.mjs';
import { targetFor } from './targetMatch.mjs';
import { rescore } from './whatif.mjs';

const RIM = ['dental rim'];
const CALIBRATION = { name: 'calibration: no-support on NS', streams: ['dental rim', 'hole', 'area'], node: 'NS' };
const BANDS = {
  slopeBand: [0, 20, 40, 60, 80, 100, 120, 140, 160, 181], heightBand: [0, 26, 51, 77, 102, 128, 154, 179, 205, 230, 256],
  rimDistanceBand: [0, 5, 10, 20, 30, 50, 80, 120, 256], sectorBand: [0, 32, 64, 96, 128, 160, 192, 224, 256],
};

/** The casts probed. `deg` 0 means "off" to the engine (no rays), so a straight cast is `deg` 1. */
export function probeCasts() {
  const casts = [];
  for (const from of ['back', 'front', 'teeth', 'tissue', 'across', '-across']) casts.push({ from, toward: from === 'tissue' || from === 'teeth' ? 'back' : 'tissue', deg: 1 });
  for (const deg of [15, 30, 60, 75]) casts.push({ from: 'back', toward: 'tissue', deg });
  for (const deg of [30, 60]) for (const toward of ['back', 'front', 'across']) casts.push({ from: 'tissue', toward, deg });
  for (const deg of [30, 60]) casts.push({ from: 'front', toward: 'tissue', deg });
  return casts;
}

/** `type` with the casts evaluated but inert: unioned into an empty Mark no-support on top. Returns their node ids. */
export function withInertCasts(type, casts) {
  const out = structuredClone(type);
  const g = out.zoneGraph;
  // pitchMm is fixed at 0.1 in this version (nodeGraph fixedParam) - any other value refuses the type.
  const ids = casts.map((c, k) => { const id = `P${k + 1}`; g.nodes.push({ id, kind: 'parallelCast', params: { ...c, pitchMm: 0.1 }, inputs: {} }); return id; });
  let u = ids[0];
  ids.slice(1).forEach((id, k) => { const nid = `PU${k + 1}`; g.nodes.push({ id: nid, kind: 'union', params: {}, inputs: { a: u, b: id } }); u = nid; });
  g.nodes.push({ id: 'PE', kind: 'subtract', params: {}, inputs: { a: u, b: u } });
  g.nodes.push({ id: 'PZ', kind: 'markNoSupport', params: {}, inputs: { under: g.outputs.zone, faces: 'PE' } });
  g.outputs.zone = 'PZ';
  return { type: out, ids };
}

/**
 * The owner's print-plate DOWN in the review mesh's frame, from the matcher's transform (p_sup = R p_bare + t, slicer Z
 * up). TRAP (cost one wrong run, 2026-11-27): the review mesh is Y-up - a bare point (x, y, z) is (x, z, -y) there
 * (dentureReviewLayers.ts toMeshFrame) - so the bare-frame down R^T (0, 0, -1) = -(third row of R) must be converted.
 */
export function ownerDownInMesh(transform) {
  const [x, y, z] = [-transform[2][0], -transform[2][1], -transform[2][2]];
  return [x, z, -y];
}

const gainsOf = (rows, k) => rows.map((r) => Math.round((r.whatIf[k + 1].score - r.whatIf[0].score) * 10) / 10);

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const valueOf = (flag) => { const at = args.indexOf(flag); return at < 0 ? undefined : args[at + 1]; };
  const typeFile = valueOf('--type');
  if (!typeFile) { console.error('--type <a fit folder\'s best.type.json>'); process.exit(2); }
  const out = valueOf('--out') ?? join('typelab', 'output', `rimprobe-${stampNow()}`);
  mkdirSync(out, { recursive: true });
  const type = JSON.parse(readFileSync(typeFile, 'utf8'));
  const log = (line) => console.log(line);
  if (args.includes('--pose')) {
    // One re-score per pair: each pair has its own owner pose.
    const scans = sampleScans('denture').filter((scan) => targetFor(scan)?.status === 'ok');
    const limits = [45, 60, 75, 90];
    for (const [at, scan] of scans.entries()) {
      const down = ownerDownInMesh(targetFor(scan).transform_bare_to_sup);
      const rules = [CALIBRATION, ...limits.map((lim) => ({ name: `not overhanging at ${lim} deg in the owner's pose`, streams: RIM, notOverhangingAlong: [...down, lim] }))];
      const rows = rescore({ typeFile, rules, out: join(out, `pair-${at + 1}`), scans: [scan],
        log: (line) => log(line.replace(/^scan 1:/, `scan ${at + 1}:`)) }); // one scan per call, so rescore numbers it 1
      for (const r of rows) console.log(`scan ${at + 1}: as built ${r.whatIf[0].score} | ${rules.map((rule, k) => `${rule.name} ${gainsOf([r], k)[0]} (-${r.whatIf[k + 1].dropped})`).join(' | ')}`);
    }
  } else {
    const { type: probe, ids } = withInertCasts(type, probeCasts());
    const { problems } = validate(probe.zoneGraph);
    if (problems.length) { console.error(`the probe graph does not validate: ${problems.join('; ')}`); process.exit(1); }
    const probeFile = join(out, 'probe.type.json');
    writeFileSync(probeFile, JSON.stringify(probe, null, 2));
    const rules = [CALIBRATION, { name: 'empty mark (must equal as built)', streams: RIM, node: 'PE' }, { name: 'all rim tips', streams: RIM, node: 'RIMBAND' }];
    probeCasts().forEach((c, k) => {
      const label = `cast ${c.from}->${c.toward} ${c.deg}`;
      rules.push({ name: `${label} hit`, streams: RIM, node: ids[k] }, { name: `${label} NOT hit`, streams: RIM, node: ids[k], invert: true });
    });
    for (const [key, grid] of Object.entries(BANDS)) for (let i = 0; i + 1 < grid.length; i += 1) rules.push({ name: `${key} [${grid[i]}, ${grid[i + 1]})`, streams: RIM, [key]: [grid[i], grid[i + 1]] });
    const rows = rescore({ typeFile: probeFile, rules, out, log });
    writeFileSync(join(out, 'rows.json'), JSON.stringify({ rules, rows }, null, 1));
    console.log(`as built per pair: ${rows.map((r) => r.whatIf[0].score).join(' / ')}`);
    const table = rules.map((rule, k) => ({ name: rule.name, gains: gainsOf(rows, k), dropped: rows.map((r) => r.whatIf[k + 1].dropped) }))
      .sort((a, b) => Math.min(...b.gains) - Math.min(...a.gains));
    for (const t of table) console.log(`${t.gains.every((g) => g > 1) ? 'SEPARATES ' : '          '}${t.name.padEnd(40)} gain ${t.gains.join(' / ')}   (rim tips dropped ${t.dropped.join('/')})`);
  }
}
