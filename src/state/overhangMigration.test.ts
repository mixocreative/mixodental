import { describe, expect, it } from 'vitest';
import { defaultSupportSettings } from '@mixo-geocore/host/core/supports/settings';
import { migrateOverhangAngle } from './overhangMigration';

describe('one Overhang angle, old saved scatterAngle', () => {
  it('the new default is 45 everywhere', () => {
    expect(defaultSupportSettings.scatterAngle).toBe(45);
  });

  it('drops the old default 50 so the unit follows the default, keeps any chosen value', () => {
    expect(migrateOverhangAngle({ scatterAngle: 50, scatterSpacing: 3 })).toEqual({ scatterSpacing: 3 });
    expect(migrateOverhangAngle({ scatterAngle: 38 })).toEqual({ scatterAngle: 38 });
    const none = { scatterSpacing: 3 };
    expect(migrateOverhangAngle(none)).toBe(none);
  });
});
