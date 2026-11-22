import { describe, expect, it } from 'vitest';
import { DENTURE_PROFILE_ID, isDentureJob, jobKindOf, tiltStepOf } from './jobKind';

describe('jobKind', () => {
  it('starts a denture job on the reference denture profile', () => {
    expect(DENTURE_PROFILE_ID).toBe('reference-denture');
    expect(jobKindOf(DENTURE_PROFILE_ID)).toBe('denture');
    expect(isDentureJob(DENTURE_PROFILE_ID)).toBe(true);
  });

  it('keeps aligner profiles and no profile on the aligner flow', () => {
    expect(jobKindOf('reference-aligner')).toBe('aligner');
    expect(jobKindOf(undefined)).toBe('aligner');
  });

  // An unknown id used to run as an aligner without a word; a saved type missing from a realm would have done so.
  it('refuses an id no profile has, naming it, instead of running it as an aligner', () => {
    expect(() => jobKindOf('no-such-profile')).toThrow(/unknown dental profile 'no-such-profile'/);
    expect(() => isDentureJob('no-such-profile')).toThrow(/no-such-profile/);
  });

  it('reads the dial step from the profile family of the job', () => {
    expect(tiltStepOf(DENTURE_PROFILE_ID)).toBe(2);
    expect(tiltStepOf('reference-aligner')).toBeGreaterThan(0);
  });
});
