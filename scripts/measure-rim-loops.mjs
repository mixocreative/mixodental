// Copyright (c) Mixo Creative.
//
// THE FILL LIMIT'S EVIDENCE. `repair_mesh`'s third argument is the longest boundary rim (mm) the host
// permits the engine to close, and the engine has NO default for it on purpose: the number belongs to
// measured rim lengths, not to anyone's judgement. This script is where it comes from.
//
//   node scripts/measure-rim-loops.mjs
//
// It runs `diagnose_mesh` over every STL in the local real scans and prints the distribution of open
// boundary-rim lengths, plus the per-model retained size the row cap needs.
//
// PATIENT DATA. `dentalwork/fixtures/case-*` is git-ignored clinical data. This script prints a short
// content hash per file and never a filename, matching how `real-scan-gate.mjs` reports, and it writes
// nothing except its own summary to stdout. Do not change that.
//
// Local only: with no scans present it says so and exits 0, the same contract as the real-scan gate.

import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const packagePath = new URL('../vendor/mixo-geocore/pkg-node/mixo_geometry_wasm.js', import.meta.url);
if (!existsSync(fileURLToPath(packagePath))) {
  console.error('vendor/mixo-geocore/pkg-node is missing. Run npm run vendor:geometry first.');
  process.exit(1);
}
const require = createRequire(import.meta.url);
// `diagnose_mesh` is a FREE function in the ABI, not a `GeometrySession` method.
const { engine_version: engineVersion, BinaryStlSession, diagnose_mesh: diagnoseMesh } = require(fileURLToPath(packagePath));

const CASES = ['case-aligner', 'case-denture', 'case-emaaligner', 'case-001'];
const CHUNK = 1 << 22;

/** Every STL in the local scan folders, with a short content hash instead of its name. */
function scans() {
  const found = [];
  for (const dir of CASES) {
    const full = path.join(ROOT, 'dentalwork', 'fixtures', dir);
    if (!existsSync(full)) continue;
    for (const name of readdirSync(full).filter((file) => file.toLowerCase().endsWith('.stl')).sort()) {
      const bytes = readFileSync(path.join(full, name));
      found.push({ kind: dir.replace(/^case-/, ''), bytes, id: createHash('sha256').update(bytes).digest('hex').slice(0, 12) });
    }
  }
  return found;
}

/** Positions and indices of a binary STL, read the way the import worker reads one. */
function readStl(bytes) {
  const triangles = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(80, true);
  const session = new BinaryStlSession(triangles);
  try {
    const view = new Uint8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    for (let offset = 0; offset < view.length; offset += CHUNK) session.push(view.subarray(offset, offset + CHUNK));
    const mesh = session.finish();
    try {
      return { positions: mesh.take_positions(), indices: mesh.take_indices() };
    } finally { mesh.free(); }
  } finally { session.free(); }
}

/** `take_loops()` is 2 f64 per boundary loop: body id, then its summed edge length in mm. */
function loopLengths(result) {
  const flat = result.take_loops();
  const out = [];
  for (let at = 0; at + 1 < flat.length; at += 2) out.push(flat[at + 1]);
  return out;
}

const percentile = (sorted, p) => (sorted.length === 0 ? 0 : sorted[Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1)]);
const mm = (value) => value.toFixed(2);

const files = scans();
if (files.length === 0) {
  console.log('rim-loop measurement: skipped, no local scans (dentalwork/fixtures/case-*).');
  process.exit(0);
}

console.log(`rim-loop measurement against engine ${engineVersion()}, ${files.length} file(s)\n`);
const every = [];
let retainedBytes = 0;
let needsRepair = 0;
{
  for (const file of files) {
    const { positions, indices } = readStl(file.bytes);
    // A triangle costs 3 f32 of position per unshared vertex plus 3 u32 of index: what a held model is.
    const bytes = positions.byteLength + indices.byteLength;
    retainedBytes = Math.max(retainedBytes, bytes);
    const result = diagnoseMesh(positions, indices);
    try {
      const roll = result.take_mesh();
      const lengths = loopLengths(result).sort((a, b) => a - b);
      every.push(...lengths);
      // Roll-up layout (12 scalars) per crates/geometry-wasm/src/repair.rs; bodies and loops are the
      // two this script needs, so only those are read by index here.
      /*
       * Roll-up offsets taken from the vendored decoder's `decodeReport`
       * (vendor/mixo-geocore/host/core/repairMesh.ts), NOT guessed: mesh[0] triangles, [1] vertices,
       * [2] bodies, [3] boundary loops, [5] non-manifold edges, [8] winding consistent,
       * [9] watertight. The first pass of this script guessed [0] for bodies and printed the
       * TRIANGLE COUNT as a body count - the sort of slip that makes a measurement worthless.
       */
      const bodies = roll[2];
      const nonManifold = roll[5];
      const wound = roll[8] === 1;
      const watertight = roll[9] === 1;
      if (nonManifold > 0 || !wound) needsRepair += 1;
      const loops = roll[3];
      console.log(`  ${file.kind.padEnd(11)} ${file.id}  ${String(indices.length / 3).padStart(8)} tri  `
        + `${String(bodies).padStart(3)} bodies  ${String(loops).padStart(4)} loops  `
        + `${String(nonManifold).padStart(4)} non-manifold  ${wound ? 'wound' : 'UNWOUND'}  `
        + `${watertight ? 'watertight' : 'NOT watertight'}  ${(bytes / 1e6).toFixed(1)} MB`
        + (lengths.length > 0 ? `  rims ${mm(lengths[0])}–${mm(lengths.at(-1))} mm` : ''));
    } finally { result.free(); }
  }
}

const sorted = every.sort((a, b) => a - b);
console.log(`\nopen boundary rims: ${sorted.length} across ${files.length} file(s)`);
if (sorted.length === 0) {
  console.log('NO FILE HERE HAS AN OPEN BOUNDARY RIM, so the fill limit cannot be measured from this');
  console.log('corpus and hole filling has no demonstrated need on it. 0 - fill nothing - is the honest');
  console.log('limit until a holed scan exists. That is NOT the same as watertight: see the non-manifold');
  console.log('count above, which is what repair is actually for on this path.');
  console.log('');
  console.log('MAX_FILL_LOOP_MM = 0.0   (no rim measured; every loop then reports fill-disabled)');
} else {
  for (const p of [50, 75, 90, 95, 99]) console.log(`  p${p}  ${mm(percentile(sorted, p))} mm`);
  console.log(`  max  ${mm(sorted.at(-1))} mm`);
  // THE RULE, stated in the plan and applied here rather than chosen by eye: p95, rounded DOWN to
  // 0.1 mm. p95 so one pathological scan cannot authorise filling a rim nobody has judged; down
  // because a filled patch is never intersection-tested against the model (plan section 3, limit 1).
  const limit = Math.floor(percentile(sorted, 95) * 10) / 10;
  console.log(`\nMAX_FILL_LOOP_MM = ${limit.toFixed(1)}   (p95 ${mm(percentile(sorted, 95))} mm, rounded down to 0.1 mm)`);
}
console.log(`
files with a defect repair could fix (non-manifold or inconsistent winding): ${needsRepair} of ${files.length}`);
console.log(`\nlargest model held: ${(retainedBytes / 1e6).toFixed(1)} MB of positions + indices`);
console.log(`a row cap of N holds about ${(retainedBytes / 1e6).toFixed(1)} MB x N in host memory, before supports.`);
