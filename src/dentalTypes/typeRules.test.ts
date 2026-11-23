import { describe, expect, it } from 'vitest';
import { DEFAULT_DENTURE_OPTIONS, type DentureOptions } from '../denture/settings/dentureOptions';
import { overhangRuleOf, rulesOfOptions } from '../denture/settings/dentureRules';
import { defaultSupportSettings } from '@mixo-geocore/host/core/supports/settings';
import { dentureSupportSettings } from '../denture/settings/dentureSupportSettings';
import { UNIT_OWNED_RULES, rememberTypeRules, typeRulesOf, typeSettingsSeedOf } from './typeRules';

/*
 * A type may pin every rule but the ones a unit's own controls set (typeRules.ts). This turns EVERY unit option away
 * from its default and reads which rules come out, so a new unit control that sends a new rule fails here until
 * UNIT_OWNED_RULES names it - instead of a type silently overriding a control that shows something else.
 */
describe('the rules a type may not pin', () => {
  it('are exactly the rules the unit\'s own settings send', () => {
    const flip = (value: unknown): unknown => (typeof value === 'boolean' ? !value : typeof value === 'number' ? value + 1 : value === 'any' ? 'lows' : 'any');
    const turned = Object.fromEntries(Object.entries(DEFAULT_DENTURE_OPTIONS).map(([key, value]) => [key, flip(value)])) as unknown as DentureOptions;
    const sent = Object.keys({ ...rulesOfOptions(turned), ...overhangRuleOf({ scatterAngle: 55 } as never) }).sort();
    expect(sent).toEqual([...UNIT_OWNED_RULES].sort());
  });

  it('a loaded type\'s rules are found by its profile id, and none for any other', () => {
    rememberTypeRules('test-ruled', { rimRespectsNoSupport: true });
    expect(typeRulesOf('test-ruled')).toEqual({ rimRespectsNoSupport: true });
    // The Overhang angle never rides in the jobs: it seeds the unit's control, which then sends it as the unit's own.
    rememberTypeRules('test-seeded', { overhangAngleDeg: 55, rimRespectsNoSupport: true });
    expect(typeRulesOf('test-seeded')).toEqual({ rimRespectsNoSupport: true });
    expect(typeSettingsSeedOf('test-seeded')).toEqual({ scatterAngle: 55 });
    expect(dentureSupportSettings('reference-denture').scatterAngle).toBe(defaultSupportSettings.scatterAngle);
    expect(typeRulesOf('reference-denture')).toEqual({});
    expect(typeRulesOf(undefined)).toEqual({});
    rememberTypeRules('test-ruled', {});
    expect(typeRulesOf('test-ruled')).toEqual({});
  });
});
