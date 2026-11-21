/*
 * M1 (docs/ORIENT-NODES.md section 9): is the print angle the engine picks by its QUICK score also the
 * angle whose FULL support build is best? For every local denture scan, full-build EVERY scanned angle
 * and record what a build knows that the quick score does not. Hours of work, no engine change.
 *
 *   npx vite-node --script scripts/tilt-measure.ts [--only 1,3] [--pick] [--out <file.json>]
 *
 * `--pick` builds the quick pick only - for comparing RULES at the angle the app would use (lever B of
 * docs/ORIENT-NODES.md section 9): set MIXO_RULES='{"branchRodMaxMm":15}' and the row records it under `rules`.
 *
 * Scans are named by their index in dentalwork/fixtures/case-denture (sorted), NEVER by file name:
 * these are patient scans, and the output may be shared. Results are written after every angle, so a
 * run stopped part way still leaves everything it measured.
 *
 * WHAT A ROW HOLDS, and why each field was added (first run 2026-11-21, read with Fable): the quick scan
 * runs on a file's LARGEST PART only (geocore `tilt_scan_ruled`), so a left-out tip on another piece is one
 * the angle choice never saw - `leftOutOnLargest` splits them. `candidates` (placed + left out) shows when
 * fewer tips left out only means fewer tips ASKED for. `leftOutByReason` names the routing cause, because
 * "model in the way" and "pillars full" need different fixes. `maxSnapMm` is the check on the piece
 * lookup itself: a tip should sit ON the mesh, so a large value means the split is wrong, not the build.
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseStl, useNodeEngine } from './node-engine';
import { buildDentureReview } from '../dentalwork/batch-review/profileSelect';

useNodeEngine();
const args = process.argv.slice(2);
const valueOf = (flag: string) => { const at = args.indexOf(flag); return at < 0 ? undefined : args[at + 1]; };
const only = valueOf('--only')?.split(',').map(Number);
const pickOnly = args.includes('--pick');
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

/** Each vertex's connected piece, and the piece with the most triangles (the one the quick scan reads). */
function piecesOf(positions: ArrayLike<number>, indices: ArrayLike<number>): { piece: Int32Array; largest: number; count: number } {
  const parent = new Int32Array(positions.length / 3).map((_, i) => i);
  const find = (a: number): number => { while (parent[a] !== a) { parent[a] = parent[parent[a]!]!; a = parent[a]!; } return a; };
  for (let t = 0; t < indices.length; t += 3) {
    for (const other of [indices[t + 1]!, indices[t + 2]!]) { const x = find(indices[t]!), y = find(other); if (x !== y) parent[x] = y; }
  }
  const piece = parent.map((_, v) => find(v));
  const tris = new Map<number, number>();
  for (let t = 0; t < indices.length; t += 3) tris.set(piece[indices[t]!]!, (tris.get(piece[indices[t]!]!) ?? 0) + 1);
  let largest = -1, most = -1;
  for (const [root, n] of tris) if (n > most) { most = n; largest = root; }
  return { piece, largest, count: tris.size };
}

/**
 * The piece a point lies on, by its nearest vertex, and how far that vertex is.
 * shortcut: a linear scan of every vertex per tip (about a second per angle at 700k vertices), fine for an
 * overnight measurement; a grid would be the upgrade if this ever runs inside a gate.
 */
function pieceAt(positions: ArrayLike<number>, piece: Int32Array, point: readonly number[]): { piece: number; mm: number } {
  let best = 0, bestD = Infinity;
  for (let v = 0; v < piece.length; v++) {
    const dx = positions[v * 3]! - point[0]!, dy = positions[v * 3 + 1]! - point[1]!, dz = positions[v * 3 + 2]! - point[2]!;
    const d = dx * dx + dy * dy + dz * dz;
    if (d < bestD) { bestD = d; best = v; }
  }
  return { piece: piece[best]!, mm: Math.sqrt(bestD) };
}

type Row = Record<string, unknown>;
const results: Row[] = [];
const save = () => writeFileSync(outFile, JSON.stringify({ created: new Date().toISOString(), rows: results }, null, 1));

for (const [k, file] of files.entries()) {
  if (only && !only.includes(k + 1)) continue;
  const mesh = parseStl(readFileSync(join(dir, file)));
  const pieces = piecesOf(mesh.positions, mesh.indices);
  // The quick pick and the angle list, from one ordinary review.
  const first = buildDentureReview(mesh);
  if (first.kind !== 'built') { results.push({ scan: k + 1, error: first.reason }); save(); continue; }
  const { scan } = first;
  const quickRank = new Map(scan.order.map((row, rank) => [row, rank + 1]));
  for (let index = 0; index < scan.rows.length; index++) {
    if (pickOnly && index !== first.index) continue;
    const started = performance.now();
    const review = index === first.index ? first : buildDentureReview(mesh, undefined, index);
    const row = scan.rows[index]!;
    const base: Row = {
      scan: k + 1, angle: row.tiltDeg, quickRank: quickRank.get(index) ?? null, picked: index === first.index, rules: process.env.MIXO_RULES ?? null,
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
      candidates: review.placed.length + review.leftOutTips.length, meshPieces: pieces.count,
      ...leftOutDetail(review.leftOutTips, mesh.positions, pieces),
      extraLiftMm: review.extraLiftMm,
      supportVolumeMm3: +volume(s.positions, s.indices).toFixed(1), supportTopMm: +top.toFixed(2),
      parts: s.components?.length ?? null, seconds: +((performance.now() - started) / 1000).toFixed(1),
    });
    save();
    console.log(`scan ${k + 1} angle ${row.tiltDeg} (quick #${quickRank.get(index)}): ${review.placed.length} placed, ${review.leftOutTips.length} left out`);
  }
}
/** Left-out tips by reason, how many stand on the largest piece, and the worst snap distance of the lookup. */
function leftOutDetail(tips: ReadonlyArray<{ position: readonly number[]; reason: string }>, positions: ArrayLike<number>,
  pieces: { piece: Int32Array; largest: number }): Row {
  const leftOutByReason: Record<string, number> = {};
  let leftOutOnLargest = 0, maxSnapMm = 0;
  for (const tip of tips) {
    // Grouped by the reason's WORDS: the engine writes counts into it ("all 438 rods within 1.5 mm"), and
    // one key per count turned 249 tips into 150 keys that said the same three things.
    const kind = tip.reason.replace(/[0-9]+([.][0-9]+)?/g, '#');
    leftOutByReason[kind] = (leftOutByReason[kind] ?? 0) + 1;
    const at = pieceAt(positions, pieces.piece, tip.position);
    if (at.piece === pieces.largest) leftOutOnLargest += 1;
    maxSnapMm = Math.max(maxSnapMm, at.mm);
  }
  return { leftOutByReason, leftOutOnLargest, maxSnapMm: +maxSnapMm.toFixed(3) };
}

console.log(`M1 done: ${results.length} rows -> ${outFile}`);
