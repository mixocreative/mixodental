import { createHash } from 'node:crypto';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import { sampleByContent, sampleCategories, sampleFiles, sampleScans } from './samples.mjs';

// A fake samples/ tree shaped the way the owner keeps it: <category>/<type>/<file>, or no type folder.
const root = mkdtempSync(join(tmpdir(), 'samples-test-'));
const put = (path: string, text: string) => { mkdirSync(dirname(join(root, path)), { recursive: true }); writeFileSync(join(root, path), text); };
put('aligner/g/b.stl', 'bb');
put('aligner/g/b-sup.stl', 'bbsup');
put('aligner/g/b-sup.contacts.json', '{}');
put('aligner/a.glb', 'aa');
put('retainer/r.STL', 'rr');
put('README.md', '#');
afterAll(() => rmSync(root, { recursive: true, force: true }));
const names = (paths: string[]) => paths.map((path) => relative(root, path).replace(/\\/g, '/'));

describe('samples/ is read by category at any depth', () => {
  it('lists the category folders, not loose files', () => expect(sampleCategories(root)).toEqual(['aligner', 'retainer']));
  it('finds scans with or without a type folder, -sup targets and contacts left out', () => {
    expect(names(sampleScans('aligner', root))).toEqual(['aligner/a.glb', 'aligner/g/b.stl']);
    expect(names(sampleScans('retainer', root))).toEqual(['retainer/r.STL']);
  });
  it('sampleFiles keeps the -sup target', () => expect(names(sampleFiles('aligner', root))).toEqual(['aligner/a.glb', 'aligner/g/b-sup.stl', 'aligner/g/b.stl']));
  it('a category this machine lacks is empty, not an error', () => expect(sampleScans('crown', root)).toEqual([]));
  it('finds a scan by its bytes wherever it moved, and nothing when no file has them', () => {
    const sha256 = createHash('sha256').update('bb').digest('hex');
    expect(names([sampleByContent({ bytes: 2, sha256 }, root)!])).toEqual(['aligner/g/b.stl']);
    expect(sampleByContent({ bytes: 2, sha256: '0'.repeat(64) }, root)).toBeUndefined();
  });
});
