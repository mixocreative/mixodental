import { describe, expect, it } from 'vitest';
import type { ImportDiagnosis } from '../state/diagnosis';
import type { PrintUnit } from '../state/project';
import { jobSentence, jobTally } from './jobSummary';

const sound: ImportDiagnosis = {
  triangles: 12, watertight: true, boundaryLoops: 0, longestRimMm: 0,
  nonManifoldEdges: 0, windingConsistent: true, bodyCount: 1,
};
const holed: ImportDiagnosis = { ...sound, watertight: false, boundaryLoops: 2, longestRimMm: 9 };
const knotted: ImportDiagnosis = { ...sound, watertight: false, nonManifoldEdges: 40 };
const unit = (id: string, diagnosis?: ImportDiagnosis) => ({ id, name: id, ...(diagnosis ? { diagnosis } : {}) } as PrintUnit);
const unreadable = { refusal: { kind: 'unreadable', code: 'stl-empty' } } as const;

describe('the job-level tally', () => {
  it('counts a sound mesh as clean', () => {
    expect(jobTally([unit('a', sound)], [])).toEqual({ clean: 1, defective: 0, refused: 0, unchecked: 0 });
  });

  it('counts open rims and non-manifold trouble together, as rows needing a look', () => {
    expect(jobTally([unit('a', holed), unit('b', knotted)], []))
      .toEqual({ clean: 0, defective: 2, refused: 0, unchecked: 0 });
  });

  it('keeps a unit with NO verdict in its own count, rather than calling it clean', () => {
    // Folding it into "clean" would have the panel vouch for geometry nothing has looked at.
    expect(jobTally([unit('a')], [])).toEqual({ clean: 0, defective: 0, refused: 0, unchecked: 1 });
  });

  it('counts refused files, which never became units at all', () => {
    expect(jobTally([], [unreadable])).toEqual({ clean: 0, defective: 0, refused: 1, unchecked: 0 });
  });

  it('adds up a mixed drop without losing a row', () => {
    const tally = jobTally([unit('a', sound), unit('b', holed), unit('c')], [unreadable]);
    expect(tally).toEqual({ clean: 1, defective: 1, refused: 1, unchecked: 1 });
  });

  /*
   * EVERY DIAGNOSIS LANDS SOMEWHERE, proved over the states `verdictOfDiagnosis` can actually
   * return rather than by restating one example's arithmetic. A unit that fell through every branch
   * would be invisible on the panel while its row shouted.
   */
  it('puts every verdict a diagnosis can produce into exactly one count', () => {
    for (const diagnosis of [sound, holed, knotted]) {
      const tally = jobTally([unit('x', diagnosis)], []);
      expect(tally.clean + tally.defective + tally.unchecked).toBe(1);
    }
  });

  it('counts a refusal through the row classifier, so the panel and the rows cannot drift apart', () => {
    // `refused.length` gave the same number and let the module claim something it was not doing.
    const tooBig = { refusal: { kind: 'too-big', limit: 'triangles' } } as const;
    expect(jobTally([], [unreadable, tooBig]).refused).toBe(2);
  });

  /*
   * THE PROPERTY THAT MATTERS MOST: the panel and the rows cannot disagree, because both come from
   * `verdictOfDiagnosis`. A summary that contradicts the list it summarises destroys trust in both.
   */
  it('calls clean exactly what the row calls clean', async () => {
    const { verdictOfDiagnosis } = await import('../items/rowState');
    expect(verdictOfDiagnosis(sound).state).toBe('clean');
    expect(jobTally([unit('a', sound)], []).clean).toBe(1);
    expect(verdictOfDiagnosis(holed).state).not.toBe('clean');
    expect(jobTally([unit('a', holed)], []).clean).toBe(0);
  });
});

describe('the one sentence the panel shows', () => {
  it('says nothing when every row is sound, so the panel is not noise on a good drop', () => {
    // A panel that says "0 problems" every time trains the operator to stop reading it - and then it
    // says nothing on the drop that matters.
    expect(jobSentence({ clean: 3, defective: 0, refused: 0, unchecked: 0 })).toBeUndefined();
  });

  it('says nothing about rows that are merely unchecked: that is not a problem found', () => {
    expect(jobSentence({ clean: 0, defective: 0, refused: 0, unchecked: 4 })).toBeUndefined();
  });

  it('counts refused files and defective ones together, because both need a look', () => {
    expect(jobSentence({ clean: 0, defective: 1, refused: 2, unchecked: 0 })?.vars).toEqual({ n: 3 });
  });

  it('has its own sentence for one, rather than saying "1 files"', () => {
    const one = jobSentence({ clean: 0, defective: 1, refused: 0, unchecked: 0 });
    expect(one?.key).toBe('1 of these files needs a look.');
    expect(one?.vars).toBeUndefined();
  });
});
