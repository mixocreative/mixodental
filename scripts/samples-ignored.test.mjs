// Guard: nothing under samples/ but its README can ever be committed, whatever the folders are called.
// samples/ holds patient scans and the owner keeps renaming and adding folders; an ignore pattern on
// folder NAMES (samples/case-*/) stopped covering them the day they became aligner/, denture/, retainer/.
import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

const ignored = (path) => {
  try {
    execFileSync('git', ['check-ignore', '-q', '--no-index', path]);
    return true;
  } catch {
    return false;
  }
};

describe('samples/ is never committed', () => {
  it.each(['samples/aligner/g/scan.stl', 'samples/a-new-kind/scan.glb', 'samples/loose.stl', 'samples/x/y/z-sup.contacts.json'])(
    '%s is git-ignored', (path) => expect(ignored(path)).toBe(true));
  it('the README stays tracked', () => expect(ignored('samples/README.md')).toBe(false));
});
