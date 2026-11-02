import type { SupportSettings } from './project';

/*
 * One Overhang angle (engine 58). Before it, a unit saved the generic `scatterAngle` with the old default 50; the new default is 45
 * and the same value is the denture's global rule. A saved 50 is the old default, so it is dropped and the unit follows the
 * default again; any other saved value is the user's choice and stays (it now also drives the denture rule).
 */
export const OLD_SCATTER_ANGLE_DEFAULT = 50;

export function migrateOverhangAngle(settings: SupportSettings): SupportSettings {
  const { scatterAngle, ...rest } = settings as SupportSettings & { scatterAngle?: unknown };
  return scatterAngle === OLD_SCATTER_ANGLE_DEFAULT ? (rest as SupportSettings) : settings;
}
