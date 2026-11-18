// Copyright (c) Mixo Creative.

import { defaultDentalTuning } from '@mixo-geocore/host/dental/tuning';
import { resolveSettings } from '@mixo-geocore/host/supports/unitSupports';
import { dentalStructureOf, dentalSupportSettings } from './supportPreset';
import { applyRecipe, isTypeDefault, matchesRecipe, type SupportRecipe } from '../recipes/supportRecipe';
import { keptDentalWork } from './flow';
import { manualAreaPolicy } from './manualArea';
import { dentalLabelOf } from '@mixo-geocore/host/dental/label';
import { arrangeCommands as arrangeAlignerCommands } from '@mixo-geocore/editing/arrange';
import type { PrintUnit, SceneCommand, SupportSettings } from '../state/project';
import type { DentalNotice } from './editingMode';
import type { DentalOrientation } from '@mixo-geocore/host/dental/dentalOrient';
import type { Vector } from '@mixo-geocore/host/core/vec3';
import type { DentalPolicy, DentalStructure } from '@mixo-geocore/host/dental/dentalPolicy';
import type { LiveSupportSettings } from '@mixo-geocore/host/core/supports/settings';

/**
 * THE DENTAL FLOW'S STAGES, AS PLAIN FUNCTIONS. No React, no worker client, no refs.
 *
 * WHY THIS FILE EXISTS, and it is not tidiness. The deck is getting a queue that generates supports
 * without the step screens (`docs/design/2026-11-18-card-deck-plan.md`). The danger in that is not
 * where the code sits - it is the queue RE-IMPLEMENTING what the step flow does when it builds each
 * stage's options. Two implementations of one decision drift, and the symptom is the worst this app
 * has: **auto-gen quietly making different supports from the editor, for the same model.**
 *
 * So the decisions come out here and BOTH paths call them. `useDentalFlow` keeps what is genuinely
 * its own - sequence tokens, stale checks, tilt state, the view and the session - and asks this file
 * what to build. Parity then holds by construction rather than by a test alone, and the test guards
 * the seam instead of carrying it.
 *
 * Everything here is pure: a unit, a profile and one engine result in; settings, a policy or scene
 * commands out. That is what lets it be tested without a browser, a worker or a GPU - and what lets
 * the queue be tested at all.
 */

/** A settled aligner policy: the shape every stage below produces or refines. */
type TwoContour = Extract<DentalPolicy, { kind: 'two-contour' }>;

/**
 * THE SUPPORT SETTINGS AND SWITCHES THIS ALIGNER WILL BE BUILT WITH - the one resolver, and since
 * 2026-11-19 the one place a support RECIPE is applied (`src/recipes/`).
 *
 * Without a recipe this is what it always was: the type's numbers for a new aligner, the operator's
 * own once they have set them.
 *
 * WITH ONE, THE RECIPE WINS - over the type AND over the unit's stored settings. That is not an
 * oversight about the operator's work: choosing a recipe for a card IS the instruction, and the
 * alternative is a card labelled "Thin" that builds with whatever happened to be on the unit, which
 * is this feature's worst defect (the card naming one recipe while the supports came from another).
 * `presetCommands` below writes the same answer onto the unit, so nothing downstream has to know.
 */
export function alignerSettings(unit: PrintUnit, profile: string, recipe?: SupportRecipe): { settings: LiveSupportSettings; structure: DentalStructure } {
  const own = unit.dental?.profileId === profile;
  const typed = own ? resolveSettings(unit.settings) : dentalSupportSettings(profile, resolveSettings(unit.settings));
  const kept = own && unit.dental?.kind === 'two-contour' ? unit.dental.structure : undefined;
  if (recipe === undefined || isTypeDefault(recipe)) return { settings: typed, structure: kept ?? dentalStructureOf(profile) };
  return { settings: applyRecipe(typed, recipe), structure: { ...recipe.structure } };
}

/**
 * The type's Step 3 settings for a new aligner, or one whose type changed; otherwise the operator's
 * are kept.
 *
 * It has three callers already - Step 2's Next, its no-area branch, and rim define mode's Done,
 * which lands in the same place a detected rim does and must set the same presets. A second copy
 * would drift the moment one of them changed, which is this whole file's argument in miniature.
 */
export function presetCommands(unit: PrintUnit, profile: string, recipe?: SupportRecipe): SceneCommand[] {
  /*
   * IT EMITS THE RESOLVER'S ANSWER, and calling `dentalSupportSettings` itself was a real trap
   * waiting for recipes to arrive. With a recipe chosen, this function wrote the TYPE's numbers onto
   * the unit at accept time - and the placement job reads `unit.settings` - so the print-angle scan
   * and the confirm would have judged the recipe while the supports were built from type defaults.
   * The two look equally plausible on screen, which is why Fable called it the defect nobody would
   * notice for weeks.
   */
  const { settings } = alignerSettings(unit, profile, recipe);
  const settled = unit.dental?.profileId === profile;
  // Nothing to write: this unit is already of this type and already carries this recipe's numbers.
  if (settled && (recipe === undefined || isTypeDefault(recipe) || matchesRecipe(resolveSettings(unit.settings), recipe))) return [];
  return [{ type: 'settings/set', unitId: unit.id, settings: settings as SupportSettings }];
}

/**
 * What the print-angle scan is asked to try, derived from the settings the aligner will be built
 * with. The scan is judging poses for THESE supports, so it has to be given them rather than the
 * profile's defaults - an aligner whose neck or pillar the operator changed scores its angles
 * differently.
 */
export function tiltScanSettings(unit: PrintUnit, profile: string, recipe?: SupportRecipe): {
  neckLengthMm: number; pillarDiameterMm: number; liftMm: number; braced: boolean;
} {
  const { settings, structure } = alignerSettings(unit, profile, recipe);
  return {
    neckLengthMm: settings.neckLength,
    pillarDiameterMm: settings.pillarDiameter,
    liftMm: settings.liftHeight,
    braced: structure.treeEnabled || structure.bracesEnabled,
  };
}

/**
 * The policy a freshly detected area becomes.
 *
 * A new aligner - or one whose type changed - starts from its type's Step 3 settings and Tree/Brace
 * switches; once set, the operator's own choices are kept, including the painted area and the
 * tuning, which an earlier version discarded in silence (`keptDentalWork` carries that story).
 */
export function acceptedPolicy(unit: PrintUnit, profile: string, rim: TwoContour['rim'], region: TwoContour['region'], recipe?: SupportRecipe): TwoContour {
  const { structure } = alignerSettings(unit, profile, recipe);
  const kept = keptDentalWork(unit, profile);
  return {
    kind: 'two-contour', profileId: profile, rim, region,
    stamps: kept?.stamps ?? [], tuning: kept?.tuning ?? defaultDentalTuning(profile), structure,
  };
}

/**
 * THE AREA GOES BACK WITH THE TUNING IT WAS DRAWN FOR, when the orientation did not move.
 *
 * `acceptedPolicy` carries the operator's kept tuning over a FRESHLY DETECTED region, and those two
 * only mean anything together: the number is the shape of a strip, not a setting read later. A
 * policy that disagrees with itself places no tips at all - measured on case-001, nudging Area width
 * and then pressing Back and Next took the preview from 104 tips to ZERO, with the stamps and the
 * number both still stored and the preview reporting itself ready.
 *
 * Only when nothing moved. `angleMovedDeg` is a number exactly when the tilt confirm settled on a
 * different row and the aligner has been turned, and a turn really does invalidate the area it was
 * detected for. The tilt CHECK still runs against the freshly detected region, so this never hands
 * the checker an area from before a turn.
 */
export function settledPolicy(unit: PrintUnit, profile: string, policy: TwoContour, angleMovedDeg: number | undefined): TwoContour {
  const kept = keptDentalWork(unit, profile);
  return angleMovedDeg === undefined && kept?.region ? { ...policy, region: kept.region } : policy;
}

/** Put a settled policy on the unit, with the type's presets ahead of it where they are owed. */
export function acceptCommands(unit: PrintUnit, profile: string, policy: DentalPolicy, recipe?: SupportRecipe): SceneCommand[] {
  return [...presetCommands(unit, profile, recipe), { type: 'dental/set', unitId: unit.id, policy }];
}

/**
 * CHOOSING A RECIPE IN STEP 3 PUTS ITS NUMBERS ON THE MODEL NOW.
 *
 * Without this the select was a DEAD CONTROL in the plainest sense: it recorded a choice, the
 * sliders did not move, the supports did not change, and nothing on screen differed - the recipe
 * would only have taken effect at the next accept, which Step 3 never performs. A control that
 * looks like it did something is worse than one that is greyed out.
 *
 * TYPE DEFAULT MEANS THE TYPE'S OWN NUMBERS, not "leave whatever is there". It is the one choice
 * that restores rather than applies, and an operator who picks it after trying a recipe means
 * exactly that. `alignerSettings` deliberately does NOT do this for a recipe it was merely handed -
 * there, keeping the operator's own settings is the rule `keptDentalWork` exists to protect - which
 * is why applying one is its own function rather than a flag on that one.
 */
export function applyRecipeCommands(unit: PrintUnit, profile: string, recipe: SupportRecipe): SceneCommand[] {
  const current = resolveSettings(unit.settings);
  const settings = isTypeDefault(recipe) ? dentalSupportSettings(profile, current) : applyRecipe(current, recipe);
  return [{ type: 'settings/set', unitId: unit.id, settings: settings as SupportSettings }];
}

/**
 * No area was detected, so Step 2 opens empty and the operator paints one.
 *
 * THE PAINT IS CARRIED, as it is everywhere else a policy is replaced (`useRimDrawing` does the
 * same). Reaching here with stamps means the type changed under a painted area; dropping them would
 * be W-01 again, and the paint is the operator's work, not a function of the rim.
 */
export function manualAreaCommands(unit: PrintUnit, profile: string, rim: TwoContour['rim'], recipe?: SupportRecipe): SceneCommand[] {
  return acceptCommands(unit, profile, manualAreaPolicy(rim, false, profile, unit.dental?.stamps ?? []), recipe);
}

/**
 * A TURN, AND EVERY ALIGNER LAID OUT AGAIN because this one's footprint moved.
 *
 * The pairing is the decision, and it was written three times: inside `orientOutcome` below, in the
 * flow's `turnTo`, and - the moment a queue existed - in the auto-gen pipeline. A turn committed
 * WITHOUT the re-layout leaves aligners overlapping on the plate, which is a quiet defect: the plate
 * still renders, and the export is what finds out.
 */
export function turnCommands(units: readonly PrintUnit[], unit: PrintUnit, rotation: Vector): SceneCommand[] {
  const turned = { ...unit, transform: { ...unit.transform, rotation } };
  const laidOut = units.map((candidate) => (candidate.id === unit.id ? turned : candidate));
  return [
    { type: 'transform/set', unitId: unit.id, transform: turned.transform },
    ...arrangeAlignerCommands(laidOut, [unit.id]),
  ];
}

/**
 * WHAT STEP 1'S ORIENTATION MEANS, decided once.
 *
 * Three outcomes, and the difference between the first two is the whole of why this is not a
 * boolean. "We could not look" (no profile chosen, no answer from the worker) is not "this aligner
 * has no rim": only the second hands over to rim drawing, because only the second has learned
 * something about the shape in front of the operator.
 *
 * The notices travel with every outcome, because they stay true whatever happens next - a mesh with
 * holes is still a mesh with holes on the screen where the operator is about to draw a rim.
 */
export type OrientOutcome =
  /** Nothing was learned. No drawing mode: there is nothing to tell the operator about the shape. */
  | { readonly kind: 'failed'; readonly notices: DentalNotice[] }
  /** Detection ran and found no rim: hand over to drawing rather than stop at a dead notice. */
  | { readonly kind: 'rim-needed'; readonly notices: DentalNotice[] }
  | {
    readonly kind: 'oriented';
    readonly notices: DentalNotice[];
    /** Undefined when the pose could not be decided - which is the `uncertain` notice. */
    readonly rotation: Vector | undefined;
    /**
     * The aligner was actually TURNED: a pose was decided AND the unit was still on the plate to
     * apply it to. Not the same as `rotation !== undefined` - a unit removed between asking and
     * answering has a pose and nowhere to put it - and it is what decides whether the print-angle
     * scan can run, because that needs the aligner's own frame.
     */
    readonly turned: boolean;
    readonly proposal: Extract<DentalOrientation, { kind: 'oriented' }>['proposal'];
    /** The turn, and every aligner laid out again without overlap because this one's footprint moved. */
    readonly commands: SceneCommand[];
  };

export function orientOutcome(unit: PrintUnit, units: readonly PrintUnit[], result: DentalOrientation | undefined): OrientOutcome {
  if (!result) return { kind: 'failed', notices: [{ kind: 'failed' }] };
  const notices: DentalNotice[] = result.meshOk ? [] : [{ kind: 'holes' }];
  if (result.kind === 'failed') return { kind: 'rim-needed', notices };
  // Whether the opening fits the chosen type is the profile's call, made in Rust.
  if (!result.matchesProfile) notices.push({ kind: 'mismatch' });
  const current = units.find((candidate) => candidate.id === unit.id);
  const turned = result.rotation && current
    ? { ...current, transform: { ...current.transform, rotation: result.rotation } }
    : undefined;
  if (!turned) notices.push({ kind: 'uncertain' });
  return {
    kind: 'oriented', notices, rotation: result.rotation, proposal: result.proposal, turned: turned !== undefined,
    // No pose to apply still lays the plate out: the aligner was added to it and may be overlapping.
    commands: turned && result.rotation
      ? turnCommands(units, turned, result.rotation)
      : arrangeAlignerCommands(units, [unit.id]),
  };
}

/**
 * The print angles the confirm step will try, from the row it is starting at.
 *
 * `from` can be negative when the chosen row is the first one, and a negative `slice` counts from
 * the END - which would hand the checker the WORST angles instead of the best. The clamp is the
 * whole function, which is exactly why it is worth having one.
 */
export function confirmOrder(order: readonly number[], from: number): number[] {
  return order.slice(Math.max(0, from));
}

/**
 * THE LABEL AN ALIGNER STARTS WITH when its area is accepted - X, the field's default, stored with
 * the aligner's own settings.
 *
 * Small, and extracted anyway: it is a decision the deck's queue would otherwise copy, and a copy
 * is how the queue ends up producing an aligner that differs from the editor's in one field nobody
 * thinks to check. It already has two callers in the UI before the queue arrives.
 *
 * The landing it sits beside is NOT here. `landPlacements` is already the shared implementation,
 * and what wraps it is staleness checking - "is the scene I am about to write to still the scene I
 * computed from" - which belongs to whoever owns the sequence, and there are legitimately two of
 * those. A shared version would have to take either a React ref or a snapshot, and would then be a
 * different check from the one a queue needs.
 *
 * THE TRAP, which is why `unit` is spelled out rather than taken from the scene: this spreads the
 * unit's WHOLE settings object back, and it is dispatched AFTER the landing. Hand it a unit read
 * before the landing and any settings the landing itself changed are overwritten by this. Pass the
 * same pre-landing unit the caller used, so the two agree - and if `landPlacements` is ever made to
 * emit a settings change, this is where it breaks. Unverified today: nothing checks that it does
 * not.
 */
export function dentalLabelCommands(unit: PrintUnit): SceneCommand[] {
  const settings = resolveSettings(unit.settings);
  return [{ type: 'settings/set', unitId: unit.id, settings: { ...settings, labelText: dentalLabelOf(settings.labelText) } as SupportSettings }];
}
