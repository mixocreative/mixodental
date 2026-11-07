import { describe, expect, it } from 'vitest';
import { dropKeepsOneFile, filesToImport } from './dropGrain';

/*
 * The real functions `importFiles` calls — not a restatement of the rule. The first version of this
 * test re-implemented `waiting && (takesOne ?? true)` and asserted against its own copy, so it would
 * have passed with the rule deleted from the app entirely. That is the same fault that let the
 * verdict pipeline ship with no test: every piece covered, the thing itself not.
 */
describe('when a drop keeps one file and when it keeps all of them', () => {
  it('keeps one for Step 1, which orients the aligner as it reads it', () => {
    expect(dropKeepsOneFile(true, undefined)).toBe(true);
    expect(filesToImport(['a', 'b', 'c'], dropKeepsOneFile(true, undefined))).toEqual(['a']);
  });

  it('keeps ALL of them when the caller says the drop is a list', () => {
    // The Items page passes takesOne: false, because a drop onto a list adds rows to it.
    expect(dropKeepsOneFile(true, false)).toBe(false);
    expect(filesToImport(['a', 'b', 'c'], dropKeepsOneFile(true, false))).toEqual(['a', 'b', 'c']);
  });

  it('keeps all of them when no dental session is waiting, whatever the caller says', () => {
    // The default must not slice outside Step 1: the bench and the Drop page take many files.
    for (const takesOne of [undefined, true, false]) {
      expect(dropKeepsOneFile(false, takesOne), `takesOne ${String(takesOne)}`).toBe(false);
      expect(filesToImport(['a', 'b'], dropKeepsOneFile(false, takesOne))).toEqual(['a', 'b']);
    }
  });

  it('defaults to the Step 1 rule, so a caller that forgets the option is safe', () => {
    // The dangerous default is the other way: a forgotten option feeding Step 1 N files.
    expect(dropKeepsOneFile(true)).toBe(true);
  });

  it('never invents or drops a file beyond the slice', () => {
    expect(filesToImport([], true)).toEqual([]);
    expect(filesToImport([], false)).toEqual([]);
    expect(filesToImport(['only'], true)).toEqual(['only']);
  });
});
