import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import { parseKind, reviewProfileId } from './profileSelect';
import { reviewCase } from './reviewCase';

const scratch = mkdtempSync(join(tmpdir(), 'profile-select-test-'));
afterAll(() => rmSync(scratch, { recursive: true, force: true }));

describe('kind selection', () => {
  it('defaults to aligner and accepts the two kinds', () => {
    expect(parseKind(undefined)).toBe('aligner');
    expect(parseKind('aligner')).toBe('aligner');
    expect(parseKind('denture')).toBe('denture');
  });
  it('rejects anything else', () => {
    expect(() => parseKind('retainer')).toThrow(/--kind/);
  });
  it('maps each kind to its reference profile', () => {
    expect(reviewProfileId('aligner')).toBe('reference-aligner');
    expect(reviewProfileId('denture')).toBe('reference-denture');
  });
});

describe('kind in the review row', () => {
  it('records the kind and flags a denture run on an aligner-looking file only when it did not build', async () => {
    const row = await reviewCase(resolve('docs/dental-reference/reference-aligner.stl'), 'case-001', scratch, 'aligner');
    expect(row.kind).toBe('aligner');
    expect(row.shapeNote).toBe('');
  });
  it('batch.ts rejects an unknown --kind', () => {
    const run = spawnSync(process.execPath, ['node_modules/vite-node/vite-node.mjs', '--script', 'dentalwork/batch-review/batch.ts',
      '--kind', 'bogus', '--out', scratch, 'docs/dental-reference'], { encoding: 'utf8', timeout: 100_000 });
    expect(run.status).not.toBe(0);
    expect(run.stderr).toMatch(/--kind/);
  });
});

// Customer scan: local only, skipped when the fixture is absent (never copied or committed).
const dentureDir = resolve('dentalwork/fixtures/case-denture');
// The first scan by name (case #1); file names are customer data and never written in code.
const dentureScan = existsSync(dentureDir) ? (readdirSync(dentureDir).filter((f) => f.toLowerCase().endsWith('.stl') && !f.includes('-sup')).sort().map((f) => join(dentureDir, f))[0] ?? '') : '';
describe.skipIf(!existsSync(dentureScan))('denture path (local fixture)', () => {
  it('builds with tips and a review GLB', async () => {
    const row = await reviewCase(dentureScan, 'case-001', scratch, 'denture');
    expect(row.reason).not.toMatch(/^denture-/);
    expect(row.result).toBe('built');
    expect(row.kind).toBe('denture');
    // Engine 16 (vendored) places tips on this scan (56 placed in the 2026-10-30 denture batch).
    expect(row.tipsPlaced).toBeGreaterThan(0);
    expect(row.printAngleDeg).not.toBeNull();
    expect(readFileSync(join(scratch, 'case-001.glb')).toString('latin1', 0, 4)).toBe('glTF');
  }, 300_000);
});
