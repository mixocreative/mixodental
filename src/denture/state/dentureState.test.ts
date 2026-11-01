import { describe, expect, it } from 'vitest';
import { normalizeDentureState } from './dentureState';

describe('normalizeDentureState', () => {
  it('copies a denture policy and drops repeated allow-list ids', () => {
    const state = normalizeDentureState({ policy: { kind: 'denture', profileId: 'reference-denture', lattice: true, modelLandingAllow: ['a', 'a', 'b'] } });
    expect(state.policy.modelLandingAllow).toEqual(['a', 'b']);
    expect(normalizeDentureState({ policy: { kind: 'denture', profileId: 'reference-denture', lattice: false, modelLandingAllow: [] } }).policy).toEqual({ kind: 'denture', profileId: 'reference-denture', lattice: false });
  });

  it('refuses an aligner profile or a malformed list', () => {
    expect(() => normalizeDentureState({ policy: { kind: 'denture', profileId: 'reference-aligner', lattice: true } })).toThrow();
    expect(() => normalizeDentureState({ policy: { kind: 'denture', profileId: 'reference-denture', lattice: true, modelLandingAllow: [1 as unknown as string] } })).toThrow();
  });
});
