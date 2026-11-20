import { isManualArea } from '@mixo-geocore/host/dental/dentalPolicy';
import { isDentureJob } from '../denture/jobKind';
import { stageBeforeSupports } from '../denture/state/dentureStages';
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
 * THE SUPPORTS ARE NO LONGER IN THAT MODEL, and this comment claimed they were. Since the owner's
 * ruling of 2026-11-18 a re-orient DELETES the supports and the hand edits keyed to their positions
 * (`transform/set` in `src/state/project.ts`); staleness marks now cover what survives a turn - the
 * rim and the area - and nothing else. W-01 was about `dental.stamps` and `tuning`, which is what
 * the paragraphs above and below are about, and those are still kept.
 *
 * THE REGION COMES BACK WITH THEM, and leaving it out was half a fix. A tuning number is not a
 * setting the app reads later -- it is the shape of the strip that was DRAWN for it, and the two
 * only mean anything together. Carrying the number over a freshly detected region left a policy
 * whose tuning said one width and whose area was another, and a placement on a policy that
 * disagrees with itself puts a tip nowhere: measured on case-001, nudging Area width and then
 * pressing Back and Next took the tip preview from 104 to ZERO, with the stamps and the number both
 * still there and the preview reporting itself ready. The caller takes the region only when the
 * orientation did NOT move, because a tilt that moved really does invalidate the area.
 *
 * Only a policy of the same kind AND profile carries over: a different appliance type measures a
 * different area, and marks made for the old one would mean nothing on the new.
 */
export function keptDentalWork(unit: Pick<PrintUnit, 'dental'>, profileId: string) {
  const policy = unit.dental;
  return policy !== undefined && policy.kind === 'two-contour' && policy.profileId === profileId
    ? { stamps: policy.stamps, tuning: policy.tuning, region: policy.region }
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

type BackFields = Pick<PrintUnit, 'id' | 'supports' | 'manual' | 'deleted' | 'contactSettings'>;

/**
 * WHETHER BACK OUT OF STEP 3 REACHES THE ORIENT STEP - which for an ALIGNER IT DOES NOT, and
 * assuming it did was the worst defect of the 2026-11-18 increment.
 *
 * The owner's rule is that a model with supports standing does not enter the orient step ("once
 * support generated, orienting is not allowed and it will remove all support"), and I read "Back
 * from Step 3" as that step. It is not: `backDental` sends an aligner from `review` to `area` -
 * **Step 2** - and only a job with no area step (a denture) lands on the orient stage. The repo's
 * own `dentureStages.test.ts` says so in one line: `stageBeforeSupports('reference-aligner')` is
 * `'area'`.
 *
 * So for an aligner, Back costs the hand work it has always cost and nothing more - the supports
 * are still there at Step 2 - and the dialog must not claim a re-orient that is not going to happen.
 * Found by Fable reading the diff; the walk check I wrote had asserted the false sentence, which is
 * how a guard enshrines a bug instead of catching it.
 */
export function backEntersOrient(profile: string | undefined): boolean {
  return stageBeforeSupports(profile) === 'aligner';
}

/** What `opensAtSupports` reads: the supports, and each kind's own record of an accepted policy. */
export type OpenFields = Pick<PrintUnit, 'supports' | 'dental' | 'denture'>;

/**
 * WHETHER OPEN LANDS ON THE SUPPORTS STEP rather than on orient - owner's ruling 2, and the only
 * door that does not destroy the thing it was pressed to show.
 *
 * IT HAS TO ASK A DIFFERENT FIELD PER KIND, which is the whole reason this is a function and not an
 * expression at the call site. An aligner records its accepted policy in `unit.dental`; a DENTURE
 * records its own in `unit.denture` and never sets `unit.dental` at all.
 *
 * THE TRAP THIS REPLACES, because it cost a day and two retractions. The test was
 * `supports !== undefined && dental !== undefined`, guarded by `&& !isDentureJob(profile)`. That
 * guard reads as protection for dentures and was DEAD CODE: a denture fails the `dental` half
 * anyway, so it always took the ordinary door - and the ordinary door runs the orient scan, turns
 * the model to the automatic pick, and `transform/set` then deletes the supports AND the operator's
 * chosen print angle with them. Confirmed in a browser, 3 runs of 3, on 2026-11-20. It needs the
 * stored pose to differ from a fresh scan's pick, which is the ordinary case, because choosing that
 * angle is what Step 1 exists for - press Next on the automatic pick and `reorients()` spares
 * everything, which is why one earlier run looked clean and the defect was wrongly retracted.
 *
 * LANDING A DENTURE THERE IS SAFE, both halves checked: the denture's Step 2 IS this same `review`
 * stage (`stageAfterOrientation` in `../denture/state/dentureStages.ts`), and `useDentureSupports`
 * reads the unit out of the scene on every call rather than holding state from the way in.
 */
export function opensAtSupports(unit: OpenFields, profile: string | undefined): boolean {
  if (unit.supports === undefined) return false;
  return isDentureJob(profile) ? unit.denture !== undefined : unit.dental !== undefined;
}

/**
 * Whether Back out of Step 3 has something to lose: the hand work always, and the BUILD only when
 * this Back really does reach the orient step (see above).
 */
export function backLosesWork(unit: BackFields | undefined, profile: string | undefined): boolean {
  if (!unit) return false;
  return (backEntersOrient(profile) && Boolean(unit.supports)) || backNeedsConfirm(unit);
}

/**
 * Back from Step 3 once confirmed.
 *
 * The supports go ONLY where Back enters the orient step; everywhere else they stay, because
 * nothing is about to turn the model and removing them would be destroying work for no reason. The
 * reducer is the rule that matters either way (`transform/set` in `src/state/project.ts`): whenever
 * a re-orient actually happens, through any door, the supports go with it.
 */
export function backCommands(unit: BackFields | undefined, profile: string | undefined): SceneCommand[] {
  if (!unit) return [];
  return [
    ...(backEntersOrient(profile) && unit.supports ? [{ type: 'supports/remove' as const, unitId: unit.id }] : []),
    ...discardManualCommands(unit),
  ];
}

/**
 * Whether leaving the flow should ask first - because it would throw the operator's work away.
 *
 * THE CONTROL WAS CALLED EXIT AND READ AS NAVIGATION. It is not: `exitCommands` below removes the
 * worked-on unit's supports, clears its hand edits and drops its dental policy. Back out of Step 3
 * has asked before discarding hand work since it was written (`backNeedsConfirm`), while this -
 * which discards MORE, and is bound to Esc's last rung - asked nothing at all. A destructive action
 * that looks like a way out is worse than one that looks destructive, because nobody braces for it.
 *
 * IT ASKS ONLY WHEN THERE IS SOMETHING TO LOSE. Leaving at Step 1 with a detected orientation and
 * nothing else costs the operator a redetect, which is seconds and is the commonest way out of the
 * flow; a dialog there would train them to dismiss the one that matters. So: built supports, hand
 * edits, or an area they painted themselves.
 *
 * A HAND-DRAWN RIM IS COUNTED, and this paragraph used to say it was not. The claim was that
 * `drawnRim` builds an ordinary `two-contour` policy no different from a detected one. It does not:
 * `drawnRim` has one caller, `rim/useRimDrawing.ts`, and Done stores `manualAreaPolicy(...)`, which
 * is `{ kind: 'legacy', origin: 'manual-area' }` - precisely what `isManualArea` tests for. So the
 * drawn rim already reaches the confirm below, and already blocks auto-gen's `own-area`.
 *
 * It was true once, before a DETECTED rim could be redrawn. The trap is the shape of the note, not
 * its subject: a debt paragraph is read as evidence and survives the fix it was waiting for, so the
 * next reader builds on a gap that closed. Debt gets re-checked against the code, like any claim.
 */
export function exitNeedsConfirm(
  unit: Pick<PrintUnit, 'id' | 'dental' | 'supports' | 'manual' | 'deleted' | 'contactSettings'> | undefined,
): boolean {
  if (!unit) return false;
  return Boolean(unit.supports) || backNeedsConfirm(unit)
    || (unit.dental !== undefined && isManualArea(unit.dental));
}

/**
 * Exit leaves the worked-on model as a normal one: the dental policy and the supports go.
 *
 * IT NO LONGER SPARES A "FINISHED" UNIT, and that is the owner's ruling of 2026-11-18: a done mark
 * informs, it never blocks a redo. Sparing was protection built before the control asked anything -
 * it meant the press did NOTHING on a model finished earlier, with no word about why. The
 * confirmation (`exitNeedsConfirm`) now protects every unit the same way, by telling the operator
 * what will go and letting them answer. A model whose print failed, whose file was replaced, or
 * whose supports were wrong is exactly the one you need this press for.
 */
export function exitCommands(unit: Pick<PrintUnit, 'id' | 'dental' | 'denture' | 'supports' | 'manual' | 'deleted' | 'contactSettings'> | undefined): SceneCommand[] {
  if (!unit) return [];
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
