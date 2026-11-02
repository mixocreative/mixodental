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
