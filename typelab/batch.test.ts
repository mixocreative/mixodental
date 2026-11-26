import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import { viteNodeCli } from '../scripts/viteNodeCli.mjs';

// Guard: a folder handed to batch.ts (typelab/cli.mjs and run-batch-review.bat both do) never runs a -sup target.
// Until 2026-11-26 it did: 12 cases for 6 dentures. A folder holding only a target must run NOTHING and say why.
const scratch = mkdtempSync(join(tmpdir(), 'batch-test-'));
afterAll(() => rmSync(scratch, { recursive: true, force: true }));

describe('batch.ts on a folder', () => {
  it('keeps a -sup target aside and runs nothing when that is all there is', () => {
    const folder = join(scratch, 'only-target');
    mkdirSync(folder, { recursive: true });
    writeFileSync(join(folder, 'scan-sup.stl'), Buffer.alloc(84));
    const run = spawnSync(process.execPath, [viteNodeCli, '--script', 'typelab/batch.ts', '--out', join(scratch, 'out'), folder],
      { encoding: 'utf8', timeout: 100_000 });
    expect(run.error).toBeUndefined();
    expect(run.stdout).toMatch(/only 1 supported target file\(s\) \(-sup\), which are never run/);
    expect(run.status).toBe(1);
  }, 120_000);
});
