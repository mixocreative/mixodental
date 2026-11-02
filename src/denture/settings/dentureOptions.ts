/*
 * The denture settings the operator sees (Round C, owner: few settings, sensible defaults), stored on the unit with
 * its policy (`PrintUnit.denture.options`, absent = the defaults). `settings/dentureRules.ts` maps them onto the
 * engine rules; nothing here knows a rule name.
 */

/** "Supports may touch the denture" as a default for every build: off (only bubbles clicked), lowest points and islands, any left-out tip. */
export type ModelLandingDefault = 'off' | 'lows' | 'any';

export interface DentureOptions {
  modelLanding: ModelLandingDefault;
  /** A tip on a lowest point or island may stand outside the allowed area (anywhere but a no-support zone). */
  lowOutsideAllowed: boolean;
  /** The last resort's lowest pillar and rod clearance from the model, mm. */
  lastResortClearanceMm: number;
}

/** The engine's own behaviour: model landing only where clicked, low tips outside the area allowed, 1.0 mm floor. */
export const DEFAULT_DENTURE_OPTIONS: Readonly<DentureOptions> = { modelLanding: 'off', lowOutsideAllowed: true, lastResortClearanceMm: 1 };

/** The clearance floor the field offers, mm (below 0.5 a support may fuse with the model; above the normal 1.5 it is no last resort). */
export const CLEARANCE_FLOOR_LIMITS = { min: 0.5, max: 1.5, step: 0.05 } as const;

const LANDINGS: readonly ModelLandingDefault[] = ['off', 'lows', 'any'];

/** Saved or handed-in options, checked: an unknown value throws; a missing one reads as its default. */
export function normalizeDentureOptions(value: Partial<DentureOptions> | undefined): DentureOptions {
  const out = { ...DEFAULT_DENTURE_OPTIONS, ...(value ?? {}) };
  if (!LANDINGS.includes(out.modelLanding)) throw new TypeError('denture model landing must be off, lows or any');
  if (typeof out.lowOutsideAllowed !== 'boolean') throw new TypeError('denture lowOutsideAllowed must be true or false');
  const { min, max } = CLEARANCE_FLOOR_LIMITS;
  if (typeof out.lastResortClearanceMm !== 'number' || !(out.lastResortClearanceMm >= min && out.lastResortClearanceMm <= max)) throw new TypeError(`denture clearance floor must be ${min} to ${max} mm`);
  return { modelLanding: out.modelLanding, lowOutsideAllowed: out.lowOutsideAllowed, lastResortClearanceMm: out.lastResortClearanceMm };
}
