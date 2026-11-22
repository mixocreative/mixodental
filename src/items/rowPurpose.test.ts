import { describe, expect, it } from 'vitest';
import { commonPurpose, holdsTypedWork, profileToOpen, purposeOfUnit, purposesOf } from './rowPurpose';

describe('the type Set all shows', () => {
  it('is the rows\' common type, and nothing when they differ, one is unanswered, or there are none', () => {
    const rows = [{ id: 'a' }, { id: 'b' }];
    expect(commonPurpose(rows, new Map([['a', 'x'], ['b', 'x']]))).toBe('x');
    expect(commonPurpose(rows, new Map([['a', 'x'], ['b', 'y']]))).toBeUndefined();
    expect(commonPurpose(rows, new Map([['a', 'x']]))).toBeUndefined();
    expect(commonPurpose([], new Map())).toBeUndefined();
  });
});
import type { PrintUnit } from '../state/project';

const unit = (over: Partial<PrintUnit> = {}) => ({ id: 'u-a', ...over } as PrintUnit);

describe('what a row is', () => {
  /*
   * THE UNIT'S WORK WINS (Fable's audit, 2026-11-23): supports made with one type, shown under the name of another,
   * were the gap. A worked row changes type only through App's confirmed action, which removes the old work.
   */
  it('names the type a worked unit was built with, whatever was picked since', () => {
    expect(purposeOfUnit(unit({ dental: { kind: 'two-contour', profileId: 'check-aligner' } as never }), 'reference-aligner'))
      .toBe('check-aligner');
    expect(purposeOfUnit(unit({ denture: { policy: { profileId: 'soft-denture' } } as never }), 'reference-denture')).toBe('soft-denture');
  });

  it('takes the operator s answer for a unit with no work yet', () => {
    expect(purposeOfUnit(unit(), 'reference-denture')).toBe('reference-denture');
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
    // A saved denture type reads back as itself, not as Generic (the audit's finding 3).
    expect(purposeOfUnit(unit({ denture: { policy: { profileId: 'soft-denture' } } as never }), undefined)).toBe('soft-denture');
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

describe('the type a row opens with', () => {
  // The bug: the session kept the LAST row's profile, so row B opened under row A's type (audit finding 2).
  it('is the row s own, never the previous row s', () => {
    const purposes = new Map([['u-a', 'check-aligner'], ['u-b', 'reference-denture']]);
    expect(profileToOpen('u-b', purposes, 'check-aligner', 'reference-aligner')).toBe('reference-denture');
  });

  it('falls back to the session, then the default, only for a row nothing names', () => {
    expect(profileToOpen('u-c', new Map(), 'check-aligner', 'reference-aligner')).toBe('check-aligner');
    expect(profileToOpen('u-c', new Map(), undefined, 'reference-aligner')).toBe('reference-aligner');
  });
});

describe('work a type change would remove', () => {
  it('is a dental policy or a denture job - generic supports on a plain model are not', () => {
    expect(holdsTypedWork(unit())).toBe(false);
    expect(holdsTypedWork(unit({ supports: {} as never }))).toBe(false);
    expect(holdsTypedWork(unit({ dental: { kind: 'legacy' } as never }))).toBe(true);
    expect(holdsTypedWork(unit({ denture: {} as never }))).toBe(true);
  });
});
