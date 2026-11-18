import { describe, expect, it } from 'vitest';
import { purposeOfUnit, purposesOf } from './rowPurpose';
import type { PrintUnit } from '../state/project';

const unit = (over: Partial<PrintUnit> = {}) => ({ id: 'u-a', ...over } as PrintUnit);

describe('what a row is', () => {
  it('takes the operator s answer first, because it is the most recent thing a person said', () => {
    expect(purposeOfUnit(unit({ dental: { kind: 'two-contour', profileId: 'reference-aligner' } as never }), 'reference-denture'))
      .toBe('reference-denture');
  });

  /*
   * THE BUG THIS EXISTS FOR, caught by the walk at `u5l`+1. Back out of Step 1 lands on the deck with
   * one row; that row had been worked on, nothing had been typed into the per-unit map this sitting,
   * so the row counted as UNNAMED and the deck drew no Start key at all - on the one model the
   * operator was in the middle of. A reopened project had the same hole: the scene is serialised, the
   * session's answers are not.
   */
  it('falls back to the work the unit already carries, so a worked-on row is never unnamed', () => {
    expect(purposeOfUnit(unit({ dental: { kind: 'two-contour', profileId: 'reference-aligner' } as never }), undefined))
      .toBe('reference-aligner');
    expect(purposeOfUnit(unit({ denture: {} as never }), undefined)).toBe('reference-denture');
  });

  it('says nothing for a unit with no work and no answer, rather than guessing a family', () => {
    expect(purposeOfUnit(unit(), undefined)).toBeUndefined();
    // An older saved policy with no profile on it names no family either: guessing one here is the
    // exact defect the question was added to remove.
    expect(purposeOfUnit(unit({ dental: { kind: 'legacy' } as never }), undefined)).toBeUndefined();
  });

  it('leaves an unanswered unit OUT of the map, never present and undefined', () => {
    const map = purposesOf(
      [unit({ id: 'u-a' }), unit({ id: 'u-b', dental: { kind: 'two-contour', profileId: 'reference-aligner' } as never })],
      new Map(),
    );

    expect(map.has('u-a')).toBe(false);
    expect(map.get('u-b')).toBe('reference-aligner');
  });
});
