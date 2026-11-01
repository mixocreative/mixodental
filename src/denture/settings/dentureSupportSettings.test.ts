import { describe, expect, it } from 'vitest';
import { dentureProfileData } from '@mixo-geocore/host/dental/dentureProfiles';
import { defaultSupportSettings, settingLimits, type LiveSupportSettings } from '@mixo-geocore/host/core/supports/settings';
import { DENTURE_RAFT, dentureSupportSettings } from './dentureSupportSettings';

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

  it('uses the solid raft: 2 mm floor, edge 40 degrees from the plate, no rim', () => {
    const settings = dentureSupportSettings('reference-denture');
    expect(settings.raftEnabled).toBe(true);
    expect(settings.raftFloorThickness).toBe(2);
    // raftWallAngle counts from vertical: 50 from vertical is 40 from the plate.
    expect(90 - settings.raftWallAngle).toBe(40);
    // The classic raft builds a rim only above the floor.
    expect(settings.raftWallHeight).toBeLessThanOrEqual(settings.raftFloorThickness);
    for (const key of ['raftFloorThickness', 'raftWallHeight', 'raftWallAngle'] as const) {
      const limits = (settingLimits as Record<string, { min: number; max: number }>)[key]!;
      expect(DENTURE_RAFT[key]).toBeGreaterThanOrEqual(limits.min);
      expect(DENTURE_RAFT[key]).toBeLessThanOrEqual(limits.max);
    }
  });
});
