import { describe, expect, it } from 'vitest';
import { targetPairs } from './targetPairs.mjs';

describe('pairing scans with their -sup targets', () => {
  it('pairs a scan with the -sup of the same name in the same folder, any case, either separator', () => {
    const set = targetPairs(['a/x.stl', 'a/X-SUP.STL', 'b\\y.stl', 'b\\y-sup.stl', 'a/notes.txt']);
    expect(set.pairs).toEqual([{ scan: 'a/x.stl', target: 'a/X-SUP.STL' }, { scan: 'b\\y.stl', target: 'b\\y-sup.stl' }]);
    expect(set.noTarget).toEqual([]);
    expect(set.orphanTargets).toEqual([]);
  });
  it('never pairs across folders, and lists what was left alone', () => {
    const set = targetPairs(['a/x.stl', 'b/x-sup.stl', 'c/z.stl']);
    expect(set.pairs).toEqual([]);
    expect(set.noTarget).toEqual(['a/x.stl', 'c/z.stl']);
    expect(set.orphanTargets).toEqual(['b/x-sup.stl']);
  });
  it('a GLB on either side is named as unsupported, never dropped as "no target"', () => {
    const set = targetPairs(['a/x.glb', 'a/x-sup.stl', 'a/y.stl', 'a/y-sup.glb']);
    expect(set.pairs).toEqual([]);
    expect(set.unsupported.map((u) => u.scan)).toEqual(['a/x.glb', 'a/y.stl']);
    expect(set.unsupported[0].reason).toMatch(/STL/);
  });
  it('a target alone is not a scan, and a name that only CONTAINS -sup is not a target', () => {
    const set = targetPairs(['a/x-sup.stl', 'a/x-support.stl']);
    expect(set.pairs).toEqual([]);
    expect(set.noTarget).toEqual(['a/x-support.stl']);
    expect(set.orphanTargets).toEqual(['a/x-sup.stl']);
  });
});
