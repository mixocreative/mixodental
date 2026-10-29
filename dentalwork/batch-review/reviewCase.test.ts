import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import { orientDentalAligner } from '@mixo-geocore/host/dental/dentalOrient';
import { proposeDentalSupportRegion } from '@mixo-geocore/host/dental/dentalRegion';
import { defaultDentalTuning } from '@mixo-geocore/host/dental/tuning';
import { nodeEngine, parseStl } from '../../scripts/node-engine';
import { explainReason } from './reasons';
import { reviewCase } from './reviewCase';
import { distancesToSurface, readGlbWorldMeshes } from './glbWorld';

/*
 * The folder review end to end: batch.ts' per-file pipeline on the reference aligner, and batch.ts
 * itself as a process (a broken import there once killed the tool, and then hung instead of exiting).
 */
const scratch = mkdtempSync(join(tmpdir(), 'batch-review-test-'));
afterAll(() => rmSync(scratch, { recursive: true, force: true }));

/*
 * The Step 1 evidence must sit on the model in the review GLB's own frame (node transforms applied).
 * The drawn trim line is lifted off the ridge on purpose (about 0.3 mm), and each U-end marker sits at
 * the turn's centre (about 1 mm off the surface), hence the limits. The reference is posed at about
 * zero; a real scan with a large print angle is what proves the overlays follow the rotation.
 */
async function expectEvidenceOnModel(file: string, name: string, dir: string): Promise<void> {
  mkdirSync(dir, { recursive: true });
  const row = await reviewCase(file, name, dir);
  expect(row.result).toBe('built');
  const model = readGlbWorldMeshes(readFileSync(join(dir, `${name}.glb`))).filter((m) => /^(TEAL|NEUTRAL)/.test(m.name));
  const evidence = readGlbWorldMeshes(readFileSync(join(dir, `${name}-orientation.glb`)));
  const pointsOf = (prefix: string) => Float64Array.from(evidence.filter((m) => m.name.startsWith(prefix)).flatMap((m) => [...m.positions]));
  const trim = pointsOf('TRIM');
  const uEnds = pointsOf('UEND');
  expect(trim.length).toBeGreaterThan(0);
  expect(uEnds.length).toBeGreaterThan(0);
  expect(Math.max(...distancesToSurface(trim, model))).toBeLessThanOrEqual(0.5);
  expect(Math.max(...distancesToSurface(uEnds, model))).toBeLessThanOrEqual(1.5);
}

describe('folder review', () => {
  it('builds a review GLB for the reference aligner', async () => {
    const row = await reviewCase(resolve('docs/dental-reference/reference-aligner.stl'), 'case-001', scratch);
    expect(row.reason).toBe('');
    expect(row.result).toBe('built');
    expect(row.glb).toBe('case-001.glb');
    expect(row.cleanedDegenerateTriangles).toBe(0);
    expect(row.printAngleDeg).not.toBeNull();
    expect(row.tipsPlaced).toBeGreaterThan(0);
    const glb = readFileSync(join(scratch, 'case-001.glb'));
    expect(glb.toString('latin1', 0, 4)).toBe('glTF');
    // Step 1 evidence: the reference is a U bridged by its palatal plate (a ring), the floor rule
    // and the trim plane agree on up, and the evidence GLB stands beside the review GLB.
    expect(row.archKind).toBe('ring');
    expect(row.upCrossCheck).toBe('agrees');
    expect(row.floorOffsetRatio).toBeGreaterThan(0.3);
    expect(row.orientationNote).toBe('');
    expect(row.orientationGlb).toBe('case-001-orientation.glb');
    const evidence = readFileSync(join(scratch, 'case-001-orientation.glb'));
    expect(evidence.toString('latin1', 0, 4)).toBe('glTF');
    for (const layer of ['TRIM detected trim chains', 'UEND trim U ends', 'PLANE bottom plane outline']) expect(evidence.toString('latin1')).toContain(layer);
    expect(evidence.toString('latin1')).not.toContain('BACK arrow');
  }, 120_000);

  it('puts the Step 1 evidence on the reference model (trim <= 0.5 mm, U ends <= 1.5 mm)', async () => {
    await expectEvidenceOnModel(resolve('docs/dental-reference/reference-aligner.stl'), 'case-004', join(scratch, 'frame-reference'));
  }, 300_000);

  it('removes collapsed triangles before processing and counts them', async () => {
    const source = readFileSync(resolve('docs/dental-reference/reference-aligner.stl'));
    const count = source.readUInt32LE(80);
    expect(84 + count * 50).toBe(source.length); // binary STL
    // Two extra triangles with a repeated corner, drawn on the first triangle's corners.
    const extra = Buffer.alloc(100);
    for (let t = 0; t < 2; t++) {
      for (let k = 0; k < 3; k++) {
        const corner = [0, 1, 0][k]!;
        for (let axis = 0; axis < 3; axis++) extra.writeFloatLE(source.readFloatLE(84 + 12 + corner * 12 + axis * 4), t * 50 + 12 + k * 12 + axis * 4);
      }
    }
    const file = join(scratch, 'collapsed.stl');
    const out = Buffer.concat([source, extra]);
    out.writeUInt32LE(count + 2, 80);
    writeFileSync(file, out);
    const row = await reviewCase(file, 'case-003', scratch);
    expect(row.reason).toBe('');
    expect(row.result).toBe('built');
    expect(row.cleanedDegenerateTriangles).toBe(2);
  }, 120_000);

  it('reports an unreadable file as an error row instead of throwing', async () => {
    const bad = join(scratch, 'bad.stl');
    writeFileSync(bad, 'not an stl');
    const row = await reviewCase(bad, 'case-002', scratch);
    expect(row.result).toBe('error');
    expect(row.reason).not.toBe('');
    expect(existsSync(join(scratch, 'case-002.glb'))).toBe(false);
  });

  it('batch.ts exits non-zero when the folder holds no STL', () => {
    const run = spawnSync(process.execPath, ['node_modules/vite-node/vite-node.mjs', '--script', 'dentalwork/batch-review/batch.ts', '--out', join(scratch, 'none'), scratch + '/empty-folder'],
      { encoding: 'utf8', timeout: 60_000 });
    expect(run.error).toBeUndefined();
    expect(run.status).toBe(1);
    expect(run.stderr).toContain('No .stl files');
  }, 90_000);
});

/*
 * case-002: an owner-supplied real aligner scan (customer data, git-ignored under dentalwork/fixtures/case-*).
 * Local only: skipped when the file is absent, so CI never needs it. It once came back as
 * `non-manifold-or-degenerate-mesh` in 0.6 s: the 1e-4 mm grid import weld merged 12 vertex pairs of
 * sub-0.1 um edges (engine 12 welds duplicates only: the file comes in exactly as it is). Its trim is sharp all the way round, which the reference
 * detector does not take; the review and the app's own Step 1 / Step 2 calls must say the same.
 */
const CASE_002 = resolve('dentalwork/fixtures/case-002/aligner002.stl');
describe.skipIf(!existsSync(CASE_002))('case-002 (local real scan)', () => {
  it('imports as a closed two-manifold and the review gives the same precise reason as the app', async () => {
    const bytes = readFileSync(CASE_002);
    const mesh = parseStl(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer);
    nodeEngine.center_positions_in_place(mesh.positions);
    expect(mesh.indices.length / 3).toBe(336_386);
    expect(mesh.positions.length / 3).toBe(168_195);
    // The app's Step 1 (analysis worker): the mesh check passes, so no "holes or non-manifold" notice.
    const oriented = orientDentalAligner(mesh, 'reference-aligner');
    expect(oriented.meshOk).toBe(true);
    // The app's Step 2 detection (analysis worker): no area, so Step 2 opens empty for painting.
    const region = proposeDentalSupportRegion(mesh, defaultDentalTuning('reference-aligner'), 'reference-aligner');
    expect(region).toEqual({ kind: 'inconclusive', reason: 'outer-ridge-sharp-all-round' });
    const row = await reviewCase(CASE_002, 'case-002', scratch);
    expect(row).toMatchObject({ result: 'inconclusive', reason: 'outer-ridge-sharp-all-round', glb: '' });
    expect(row.explanation).toBe(explainReason('outer-ridge-sharp-all-round'));
    expect(row.explanation).toContain('sharp all the way round');
  }, 120_000);
});

/*
 * The first scan of dentalwork/fixtures/case-aligner (sorted), read in place: a real scan with a large
 * print angle (about 36.5 deg), so the overlays must follow the rotation. Local only; skipped when absent.
 */
const CASE_ALIGNER_DIR = resolve('dentalwork/fixtures/case-aligner');
const CASE_ALIGNER_FIRST = existsSync(CASE_ALIGNER_DIR) ? readdirSync(CASE_ALIGNER_DIR).filter((n) => n.toLowerCase().endsWith('.stl')).sort()[0] : undefined;
describe.skipIf(!CASE_ALIGNER_FIRST)('case-aligner first scan (local real scan)', () => {
  it('puts the Step 1 evidence on the model after a large print-angle rotation', async () => {
    await expectEvidenceOnModel(join(CASE_ALIGNER_DIR, CASE_ALIGNER_FIRST!), 'case-005', join(scratch, 'frame-real'));
  }, 300_000);
});
