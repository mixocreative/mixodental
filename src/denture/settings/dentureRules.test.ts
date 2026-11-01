import { describe, expect, it } from 'vitest';
import { packRules } from '@mixo-geocore/host/supports/generateRules';
import { DEFAULT_DENTURE_OPTIONS, normalizeDentureOptions } from './dentureOptions';
import { dentureRulesOf, rulesOfOptions } from './dentureRules';

describe('denture settings to engine rules', () => {
  it('sends nothing at the defaults, so the build is the batch build', () => {
    expect(rulesOfOptions(DEFAULT_DENTURE_OPTIONS)).toEqual({});
    expect(dentureRulesOf(undefined)).toEqual({});
    expect(dentureRulesOf({ denture: { policy: { kind: 'denture', profileId: 'reference-denture', lattice: true } } })).toEqual({});
  });

  it('maps each setting onto its rule', () => {
    expect(rulesOfOptions({ ...DEFAULT_DENTURE_OPTIONS, modelLanding: 'lows' })).toEqual({ dentalModelLanding: 1 });
    expect(rulesOfOptions({ ...DEFAULT_DENTURE_OPTIONS, modelLanding: 'any' })).toEqual({ dentalModelLanding: 2 });
    expect(rulesOfOptions({ ...DEFAULT_DENTURE_OPTIONS, lowOutsideAllowed: false })).toEqual({ lowOutsideAllowed: 0 });
    expect(rulesOfOptions({ ...DEFAULT_DENTURE_OPTIONS, lastResortClearanceMm: 0.8 })).toEqual({ lastResortClearanceMm: 0.8 });
    // Every mapped name is a rule the engine packs (an unknown name would throw).
    expect(() => packRules(rulesOfOptions({ modelLanding: 'any', lowOutsideAllowed: false, lastResortClearanceMm: 0.75 }))).not.toThrow();
  });

  it('reads saved options strictly, a missing value as its default', () => {
    expect(normalizeDentureOptions({ modelLanding: 'any' })).toEqual({ ...DEFAULT_DENTURE_OPTIONS, modelLanding: 'any' });
    expect(() => normalizeDentureOptions({ modelLanding: 'all' as never })).toThrow();
    expect(() => normalizeDentureOptions({ lastResortClearanceMm: 0.1 })).toThrow();
  });
});
