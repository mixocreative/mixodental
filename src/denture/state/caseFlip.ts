import type { CaseFlip } from '@mixo-geocore/host/dental/orientGraph';

/*
 * ONE JOB: the sides the operator turned round on ONE denture scan (`PrintUnit.dentureFlip`; docs/WORKBENCH-TABS-PLAN.md
 * C2, owner 2026-11-23: "it should let user choose which side is top and which side is front"; Fable's D3, per case
 * first).
 *
 * The detector decides the front and the teeth side; this turns either round for this scan only, never for a type
 * (a type runs on every scan, so a type-wide override lives on the Orient graph's "Name the sides" node instead).
 * Every denture job carries `engineCaseFlip(unit)` and the worker sets the engine's ONE flip slot from it first,
 * beside the drawn rim (`engine/dentureCore.ts` `withPolicy`, `orientAndScan`; the worker for the rest).
 */

export type DentureFlip = CaseFlip;

/** The flip as the engine reads it, or undefined when nothing is turned round. */
export const engineCaseFlip = (unit: { dentureFlip?: DentureFlip }): DentureFlip | undefined =>
  unit.dentureFlip && (unit.dentureFlip.front || unit.dentureFlip.teeth) ? unit.dentureFlip : undefined;

/** A saved flip, checked: anything but two true/false values is refused, so a bad file stops the load. */
export function normalizeFlip(value: DentureFlip): DentureFlip {
  if (typeof value?.front !== 'boolean' || typeof value?.teeth !== 'boolean') throw new TypeError('a denture flip must say true or false for front and teeth');
  return { front: value.front, teeth: value.teeth };
}

/** The flip after turning one side round once more; turning a side twice is no flip. */
export const toggledFlip = (flip: DentureFlip | undefined, side: 'front' | 'teeth'): DentureFlip | undefined => {
  const next = { front: Boolean(flip?.front), teeth: Boolean(flip?.teeth), [side]: !flip?.[side] };
  return next.front || next.teeth ? next : undefined;
};
