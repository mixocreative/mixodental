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

  // A project made with a saved type whose file is gone names the file to restore (docs/TYPE-PIPELINE.md 8a).
  it('names the missing saved type file when a project uses a type this app does not have', () => {
    expect(() => normalizeDentureState({ policy: { kind: 'denture', profileId: 'soft-denture', lattice: true } }))
      .toThrow(/restore types\/denture\/soft-denture\.type\.json/);
  });
});
