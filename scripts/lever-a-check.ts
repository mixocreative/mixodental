/*
 * Lever A, before any engine work (docs/ORIENT-NODES.md section 9): would the denture angle scan pick the
 * steep angles M1 v2 found better, if it ALSO counted the small pieces' overhang? The scan ranks tilts in one
 * safety tier by overhang area (geocore `dental/denture/tilt.rs` `pick`), measured on the largest part only.
 * This adds the other parts' downward area per tilt and reports where body-only and body+pieces bottom out.
 *
 *   npx vite-node --script scripts/lever-a-check.ts [--only 1,3,5]
 *
 * shortcut: every non-largest face counts, hidden or not (the engine skips faces inside or against another
 * part, `supports/file_parts.rs`), and self-supporting regions are not excluded - an upper bound on the
 * pieces' term, good enough to see whether the minimum MOVES; the engine change would use the real masks.
 * Scans are named by index, never by file (patient data).
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseStl, useNodeEngine } from './node-engine';
import { defaultSupportSettings } from '@mixo-geocore/host/core/supports/settings';
import { applyTransform } from '@mixo-geocore/host/state/transform';
import { dentureProfileData, dentureSupportPreset } from '@mixo-geocore/host/dental/dentureProfiles';
import { orientDenture } from '@mixo-geocore/host/dental/dentureOrient';
import { scanDentureTilts } from '@mixo-geocore/host/dental/dentureTilt';
import { reviewProfileId } from '../dentalwork/batch-review/profileSelect';

useNodeEngine();
const args = process.argv.slice(2);
const at = args.indexOf('--only');
const only = at < 0 ? [1, 3, 5] : args[at + 1]!.split(',').map(Number);
const dir = 'dentalwork/fixtures/case-denture';
const files = readdirSync(dir).filter((f) => f.toLowerCase().endsWith('.stl')).sort();
const profileId = reviewProfileId('denture');
const profile = dentureProfileData(profileId);
const settings = { ...defaultSupportSettings, ...dentureSupportPreset(profile) };
const limit = -Math.sin((profile.pose.overhangAngleDeg * Math.PI) / 180);

/** Per face: true when it belongs to the part with the most triangles (union-find over shared vertices). */
function onLargest(indices: ArrayLike<number>, vertexCount: number): boolean[] {
  const parent = Int32Array.from({ length: vertexCount }, (_, k) => k);
  const find = (x: number): number => { while (parent[x] !== x) { parent[x] = parent[parent[x]!]!; x = parent[x]!; } return x; };
  for (let t = 0; t < indices.length; t += 3) for (const o of [indices[t + 1]!, indices[t + 2]!]) { const x = find(indices[t]!), y = find(o); if (x !== y) parent[x] = y; }
  const count = new Map<number, number>();
  for (let t = 0; t < indices.length; t += 3) { const r = find(indices[t]!); count.set(r, (count.get(r) ?? 0) + 1); }
  const largest = [...count.entries()].sort((a, b) => b[1] - a[1])[0]![0];
  const out: boolean[] = [];
  for (let t = 0; t < indices.length; t += 3) out.push(find(indices[t]!) === largest);
  return out;
}

for (const [k, file] of files.entries()) {
  if (!only.includes(k + 1)) continue;
  const mesh = parseStl(readFileSync(join(dir, file)));
  const body = onLargest(mesh.indices, mesh.positions.length / 3);
  if (orientDenture(mesh, profileId).kind !== 'oriented') { console.log(`scan ${k + 1}: not oriented`); continue; }
  const scan = scanDentureTilts(mesh, profileId, { neckLengthMm: settings.neckLength, pillarDiameterMm: settings.pillarDiameter, liftMm: settings.liftHeight, braced: settings.trussEnabled });
  if (scan.kind !== 'scan') { console.log(`scan ${k + 1}: ${scan.reason}`); continue; }
  const rows = scan.rows.map((row, index) => {
    const turned = applyTransform(mesh, { position: [0, 0, 0], rotation: row.rotation as [number, number, number] });
    const p = turned.positions, ix = turned.indices;
    let bodyArea = 0, pieceArea = 0;
    for (let t = 0, f = 0; t < ix.length; t += 3, f++) {
      const a = ix[t]! * 3, b = ix[t + 1]! * 3, c = ix[t + 2]! * 3;
      const ux = p[b]! - p[a]!, uy = p[b + 1]! - p[a + 1]!, uz = p[b + 2]! - p[a + 2]!;
      const vx = p[c]! - p[a]!, vy = p[c + 1]! - p[a + 1]!, vz = p[c + 2]! - p[a + 2]!;
      const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
      const size = Math.hypot(nx, ny, nz);
      if (size > 0 && ny / size <= limit) { if (body[f]) bodyArea += size / 2; else pieceArea += size / 2; }
    }
    return { index, deg: row.tiltDeg, rank: scan.order.indexOf(index) + 1, robust: row.robust, bodyArea, pieceArea };
  });
  const by = (key: (r: (typeof rows)[number]) => number) => [...rows].filter((r) => r.robust).sort((a, b) => key(a) - key(b))[0]!;
  const bodyMin = by((r) => r.bodyArea), sumMin = by((r) => r.bodyArea + r.pieceArea), pieceMin = by((r) => r.pieceArea);
  console.log(`scan ${k + 1}: quick pick ${rows[scan.order[0]!]!.deg} deg | least body overhang ${bodyMin.deg} deg | least body+pieces ${sumMin.deg} deg | least pieces ${pieceMin.deg} deg`);
  for (const r of rows) console.log(`  ${String(r.deg).padStart(2)} deg  rank ${String(r.rank).padStart(2)}  body ${r.bodyArea.toFixed(0).padStart(6)}  pieces ${r.pieceArea.toFixed(0).padStart(6)}  sum ${(r.bodyArea + r.pieceArea).toFixed(0).padStart(6)}${r.robust ? '' : '  (not robust)'}`);
}
