import { describe, expect, it } from 'vitest';
import { DENTURE_PROFILE_ID, isDentureJob, jobKindOf } from './jobKind';

describe('jobKind', () => {
  it('starts a denture job on the reference denture profile', () => {
    expect(DENTURE_PROFILE_ID).toBe('reference-denture');
    expect(jobKindOf(DENTURE_PROFILE_ID)).toBe('denture');
    expect(isDentureJob(DENTURE_PROFILE_ID)).toBe(true);
  });

  it('keeps aligner profiles and unknown ids on the aligner flow', () => {
    expect(jobKindOf('reference-aligner')).toBe('aligner');
    expect(jobKindOf(undefined)).toBe('aligner');
    expect(isDentureJob('no-such-profile')).toBe(false);
  });
});
