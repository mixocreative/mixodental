import { describe, expect, it } from 'vitest';
import { dentureProfileData } from '@mixo-geocore/host/dental/dentureProfiles';
import { defaultSupportSettings, type LiveSupportSettings } from '@mixo-geocore/host/core/supports/settings';
import { dentureSupportSettings } from './dentureSupportSettings';

describe('dentureSupportSettings', () => {
  it('builds a denture with the profile preset and the thin contact', () => {
    const profile = dentureProfileData('reference-denture');
    const settings = dentureSupportSettings('reference-denture', { ...defaultSupportSettings, labelText: 'D1' } as LiveSupportSettings);
    expect(settings.contactShape).toBe('NONE');
    expect(settings.pillarDiameter).toBe(profile.supports.pillarDiameterMm);
    expect(settings.liftHeight).toBe(profile.supports.liftHeightMm);
    expect(settings.trussEnabled).toBe(profile.supports.lattice);
    expect(settings.labelText).toBe('D1');
  });
});
