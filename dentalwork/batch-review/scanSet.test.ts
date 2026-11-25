import { describe, expect, it } from 'vitest';
import { fileName, scanSet, scanSetWords } from './scanSet.mjs';

describe('which imported files are cases to run', () => {
  it('runs every STL but an owner -sup reference, and counts the rest', () => {
    const set = scanSet(['b/case-2.stl', 'a/case-1.STL', 'a/case-1-sup.stl', 'a/notes.txt', 'a/case-1-contacts.json']);
    expect(set.cases).toEqual(['a/case-1.STL', 'b/case-2.stl']);
    expect(set.references).toEqual(['a/case-1-sup.stl']);
    expect(set.skipped).toEqual(['a/case-1-contacts.json', 'a/notes.txt']);
    expect(scanSetWords(set)).toBe('2 scan(s) to run; 1 reference file(s) with supports (-sup) kept as references, not run; 2 other file(s) skipped.');
  });

  it('says why nothing runs, never an empty list without a word', () => {
    expect(scanSetWords(scanSet([]))).toBe('No STL files there.');
    expect(scanSetWords(scanSet(['x-sup.stl']))).toMatch(/only 1 reference file\(s\)/);
  });

  it('names a file by its last part on either separator', () => {
    expect(fileName('C:\\scans\\one.stl')).toBe('one.stl');
    expect(fileName('/scans/two.stl')).toBe('two.stl');
  });
});
