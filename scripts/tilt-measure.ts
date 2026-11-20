/*
 * M1 (docs/ORIENT-NODES.md section 9): is the print angle the engine picks by its QUICK score also the
 * angle whose FULL support build is best? For every local denture scan, full-build EVERY scanned angle
 * and record what a build knows that the quick score does not. Hours of work, no engine change.
 *
 *   npx vite-node --script scripts/tilt-measure.ts [--only 1,3] [--out <file.json>]
 *
 * Scans are named by their index in dentalwork/fixtures/case-denture (sorted), NEVER by file name:
 * these are patient scans, and the output may be shared. Results are written after every angle, so a
 * run stopped part way still leaves everything it measured.
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseStl, useNodeEngine } from './node-engine';
import { buildDentureReview } from '../dentalwork/batch-review/profileSelect';

useNodeEngine();
const args = process.argv.slice(2);
const valueOf = (flag: string) => { const at = args.indexOf(flag); return at < 0 ? undefined : args[at + 1]; };
const only = valueOf('--only')?.split(',').map(Number);
const outFile = valueOf('--out') ?? 'tilt-measure.json';
const dir = 'dentalwork/fixtures/case-denture';
const files = readdirSync(dir).filter((f) => f.toLowerCase().endsWith('.stl')).sort();

/** Signed volume of a closed triangle mesh, mm3 (the supports' resin). */
function volume(positions: ArrayLike<number>, indices: ArrayLike<number>): number {
  let v = 0;
  for (let t = 0; t < indices.length; t += 3) {
    const [a, b, c] = [indices[t]! * 3, indices[t + 1]! * 3, indices[t + 2]! * 3];
    v += (positions[a]! * (positions[b + 1]! * positions[c + 2]! - positions[b + 2]! * positions[c + 1]!)
      - positions[a + 1]! * (positions[b]! * positions[c + 2]! - positions[b + 2]! * positions[c]!)
      + positions[a + 2]! * (positions[b]! * positions[c + 1]! - positions[b + 1]! * positions[c]!)) / 6;
  }
  return Math.abs(v);
}

type Row = Record<string, unknown>;
const results: Row[] = [];
const save = () => writeFileSync(outFile, JSON.stringify({ created: new Date().toISOString(), rows: results }, null, 1));

for (const [k, file] of files.entries()) {
  if (only && !only.includes(k + 1)) continue;
  const mesh = parseStl(readFileSync(join(dir, file)));
  // The quick pick and the angle list, from one ordinary review.
  const first = buildDentureReview(mesh);
  if (first.kind !== 'built') { results.push({ scan: k + 1, error: first.reason }); save(); continue; }
  const { scan } = first;
  const quickRank = new Map(scan.order.map((row, rank) => [row, rank + 1]));
  for (let index = 0; index < scan.rows.length; index++) {
    const started = performance.now();
    const review = index === first.index ? first : buildDentureReview(mesh, undefined, index);
    const row = scan.rows[index]!;
    const base: Row = {
      scan: k + 1, angle: row.tiltDeg, quickRank: quickRank.get(index) ?? null, picked: index === first.index,
      // What the quick score saw at this angle (TiltRow, host/dental/dentalTilt.ts).
      quick: { failed: row.failed.map((f) => f.rule), robust: row.robust, heightMm: row.heightMm, largestLayerMm2: row.largestLayerMm2,
        largestSlenderness: row.largestSlenderness, boxedIn: scan.boxed.counts[index] ?? null },
    };
    if (review.kind !== 'built') { results.push({ ...base, built: false, reason: review.reason }); save(); continue; }
    const s = review.supports;
    let top = -Infinity;
    for (let at = 1; at < s.positions.length; at += 3) top = Math.max(top, s.positions[at]!);
    results.push({
      ...base, built: true,
      tipsPlaced: review.placed.length, tipsLeftOut: review.leftOutTips.length,
      supportVolumeMm3: +volume(s.positions, s.indices).toFixed(1), supportTopMm: +top.toFixed(2),
      parts: s.components?.length ?? null, seconds: +((performance.now() - started) / 1000).toFixed(1),
    });
    save();
    console.log(`scan ${k + 1} angle ${row.tiltDeg} (quick #${quickRank.get(index)}): ${review.placed.length} placed, ${review.leftOutTips.length} left out`);
  }
}
console.log(`M1 done: ${results.length} rows -> ${outFile}`);
