import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import { reviewCase } from './reviewCase';

/*
 * The folder review end to end: batch.ts' per-file pipeline on the reference aligner, and batch.ts
 * itself as a process (a broken import there once killed the tool, and then hung instead of exiting).
 */
const scratch = mkdtempSync(join(tmpdir(), 'batch-review-test-'));
afterAll(() => rmSync(scratch, { recursive: true, force: true }));

describe('folder review', () => {
  it('builds a review GLB for the reference aligner', async () => {
    const row = await reviewCase(resolve('docs/dental-reference/reference-aligner.stl'), 'case-001', scratch);
    expect(row.reason).toBe('');
    expect(row.result).toBe('built');
    expect(row.glb).toBe('case-001.glb');
    expect(row.printAngleDeg).not.toBeNull();
    expect(row.tipsPlaced).toBeGreaterThan(0);
    const glb = readFileSync(join(scratch, 'case-001.glb'));
    expect(glb.toString('latin1', 0, 4)).toBe('glTF');
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
