import { describe, expect, it } from 'vitest';
import { acceptModelFile } from '../src/components/ObjectViewport';
import { fileName, SCAN_FILE, scanSet, scanSetWords } from './scanSet.mjs';

describe('which imported files are cases to run', () => {
  it('runs every STL but an owner -sup target, and counts the rest', () => {
    const set = scanSet(['b/case-2.stl', 'a/case-1.STL', 'a/case-1-sup.stl', 'a/notes.txt', 'a/case-1-contacts.json']);
    expect(set.cases).toEqual(['a/case-1.STL', 'b/case-2.stl']);
    expect(set.references).toEqual(['a/case-1-sup.stl']);
    expect(set.skipped).toEqual(['a/case-1-contacts.json', 'a/notes.txt']);
    expect(scanSetWords(set)).toBe('2 scan(s) to run; 1 supported target file(s) (-sup) kept aside, not run; 2 other file(s) skipped.');
  });

  it('runs a GLB or glTF scan too, and a -sup GLB is a target', () => {
    const set = scanSet(['a/one.glb', 'a/two.gltf', 'a/one-sup.glb', 'a/model.obj']);
    expect(set.cases).toEqual(['a/one.glb', 'a/two.gltf']);
    expect(set.references).toEqual(['a/one-sup.glb']);
    expect(set.skipped).toEqual(['a/model.obj']);
  });

  it('never runs a result the reviewer wrote as a scan', () => {
    const isResult = (p: string) => p.startsWith('out/');
    const set = scanSet(['out/case-001.glb', 'out/case-001-sup.glb', 'scans/a.stl'], isResult);
    expect(set.cases).toEqual(['scans/a.stl']);
    expect(set.results).toEqual(['out/case-001-sup.glb', 'out/case-001.glb']);
    expect(scanSetWords(scanSet(['out/case-001.glb'], isResult))).toMatch(/^No scans to run: only 1 review result file/);
  });

  it('takes exactly the model formats the app imports', () => {
    for (const name of ['a.stl', 'A.STL', 'b.glb', 'c.gltf', 'd.obj', 'e.3mf', 'f.ply', 'g.json']) {
      expect(SCAN_FILE.test(name), name).toBe(acceptModelFile({ name } as File));
    }
  });

  it('says why nothing runs, never an empty list without a word', () => {
    expect(scanSetWords(scanSet([]))).toBe('No scan files there (STL, GLB or glTF).');
    expect(scanSetWords(scanSet(['x-sup.stl']))).toMatch(/only 1 supported target file\(s\)/);
  });

  it('names a file by its last part on either separator', () => {
    expect(fileName('C:\\scans\\one.stl')).toBe('one.stl');
    expect(fileName('/scans/two.stl')).toBe('two.stl');
  });
});
