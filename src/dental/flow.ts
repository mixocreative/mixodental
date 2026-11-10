import { isManualArea } from '@mixo-geocore/host/dental/dentalPolicy';
import type { PrintUnit, SceneCommand } from '../state/project';

/** How much hand work Step 3 holds on an aligner: supports added, automatic ones removed, supports with their own settings. */
export function manualEditCounts(unit: Pick<PrintUnit, 'manual' | 'deleted' | 'contactSettings'>): { added: number; removed: number; customised: number } {
  return { added: unit.manual.length, removed: unit.deleted.length, customised: Object.keys(unit.contactSettings).length };
}

/** Back from Step 3 asks first when it would throw hand work away. */
export function backNeedsConfirm(unit: Pick<PrintUnit, 'manual' | 'deleted' | 'contactSettings'> | undefined): boolean {
  if (!unit) return false;
  const { added, removed, customised } = manualEditCounts(unit);
  return added + removed + customised > 0;
}

/**
 * WHAT A RE-ACCEPTED ORIENTATION CARRIES OVER from the policy already on the unit: the painted area
 * and the Step 3 tuning.
 *
 * Found by audit (W-01). Accepting an orientation built a fresh policy with `stamps: []` and a
 * default tuning unconditionally, so re-entering a unit and pressing Next threw away the painted
 * support area and the tuning with no warning - directly under a comment claiming "once set, the
 * operator's own choices are kept". `backNeedsConfirm` could not catch it either: it reads `manual`,
 * `deleted` and `contactSettings`, and never `dental.stamps`.
 *
 * KEPT, not re-asked. The stamps are unit-local marks on the mesh, and a re-orient changes the
 * TRANSFORM rather than the mesh, so they are still exactly where the operator put them. What a
 * re-orient invalidates is the AREA derived from them, and `revisions` already marks that stale. The
 * staleness model exists precisely so this does not have to be a deletion.
 *
 * Only a policy of the same kind AND profile carries over: a different appliance type measures a
 * different area, and marks made for the old one would mean nothing on the new.
 */
export function keptDentalWork(unit: Pick<PrintUnit, 'dental'>, profileId: string) {
  const policy = unit.dental;
  return policy !== undefined && policy.kind === 'two-contour' && policy.profileId === profileId
    ? { stamps: policy.stamps, tuning: policy.tuning }
    : undefined;
}

/**
 * Whether Step 1's Next should go STRAIGHT ON with the area this unit already has, instead of
 * detecting over the top of it.
 *
 * THE RULE IS THE UNIT'S OWN WORK WINS, and the flow used to express it as "there is no proposal".
 * That held only while a hand-drawn rim implied a failed detection. The moment a DETECTED rim could be
 * redrawn, Done left a proposal in hand, the test said no, and detection rebuilt the policy over the
 * loop the operator had just drawn - taking their paint with it, because the rebuild carries no stamps.
 *
 * The profile is what `!proposal` was standing in for. Re-detecting is worth it when the aligner TYPE
 * changed, since another type may find an area where this one found none; it is never worth it to
 * overwrite the operator. Same shape as `keptDentalWork` above, and for the same reason.
 */
export function keepsManualArea(unit: Pick<PrintUnit, 'dental'>, profileId: string | undefined): boolean {
  const policy = unit.dental;
  return policy !== undefined && profileId !== undefined && isManualArea(policy) && policy.profileId === profileId;
}

/** Back from Step 3 once confirmed: the hand work goes, the supports follow the next Generate. */
export function discardManualCommands(unit: Pick<PrintUnit, 'id' | 'manual' | 'deleted' | 'contactSettings'>): SceneCommand[] {
  return backNeedsConfirm(unit) ? [{ type: 'supports/clear-manual', unitId: unit.id }] : [];
}

/**
 * Exit leaves the aligner being worked on as a normal model: the dental policy and the supports
 * go. An aligner already finished (OK, or Add another aligner) is kept as it is.
 */
export function exitCommands(unit: Pick<PrintUnit, 'id' | 'dental' | 'denture' | 'supports' | 'manual' | 'deleted' | 'contactSettings'> | undefined, finished: readonly string[]): SceneCommand[] {
  if (!unit || finished.includes(unit.id)) return [];
  const commands: SceneCommand[] = [];
  if (unit.supports) commands.push({ type: 'supports/remove', unitId: unit.id });
  if (backNeedsConfirm(unit)) commands.push({ type: 'supports/clear-manual', unitId: unit.id });
  if (unit.dental) commands.push({ type: 'dental/clear', unitId: unit.id });
  if (unit.denture) commands.push({ type: 'denture/clear', unitId: unit.id });
  return commands;
}

/** The session fields a dental step is told apart by. */
type StepFields = { mode: string; dentalStage?: string | undefined; dentalAligner?: string | undefined; dentalUnitId?: string | undefined };

/**
 * A dental step began: the flow was entered, its stage changed, or Step 1 took a new object or finished loading it.
 * Undo inside the step stops at the scene the step began with (App's undo floor), so Undo never takes back the
 * import, the pose Next accepted or the supports a step built while the screen stays on a later step; Back is the
 * way to an earlier step.
 */
export function startsDentalStep(previous: StepFields, next: StepFields): boolean {
  if (next.mode !== 'dental') return false;
  return previous.mode !== 'dental' || next.dentalStage !== previous.dentalStage || next.dentalAligner !== previous.dentalAligner || next.dentalUnitId !== previous.dentalUnitId;
}
