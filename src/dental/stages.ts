// Copyright (c) Mixo Creative.

import { defaultDentalTuning } from '@mixo-geocore/host/dental/tuning';
import { resolveSettings } from '@mixo-geocore/host/supports/unitSupports';
import { dentalStructureOf, dentalSupportSettings } from './supportPreset';
import { keptDentalWork } from './flow';
import { manualAreaPolicy } from './manualArea';
import type { PrintUnit, SceneCommand, SupportSettings } from '../state/project';
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

/** The support settings and switches this aligner will be built with in Step 3 (the type's preset for a new aligner). */
export function alignerSettings(unit: PrintUnit, profile: string): { settings: LiveSupportSettings; structure: DentalStructure } {
  const own = unit.dental?.profileId === profile;
  const settings = own ? resolveSettings(unit.settings) : dentalSupportSettings(profile, resolveSettings(unit.settings));
  const kept = own && unit.dental?.kind === 'two-contour' ? unit.dental.structure : undefined;
  return { settings, structure: kept ?? dentalStructureOf(profile) };
}

/**
 * The type's Step 3 settings for a new aligner, or one whose type changed; otherwise the operator's
 * are kept.
 *
 * It has three callers already - Step 2's Next, its no-area branch, and rim define mode's Done,
 * which lands in the same place a detected rim does and must set the same presets. A second copy
 * would drift the moment one of them changed, which is this whole file's argument in miniature.
 */
export function presetCommands(unit: PrintUnit, profile: string): SceneCommand[] {
  if (unit.dental?.profileId === profile) return [];
  return [{ type: 'settings/set', unitId: unit.id, settings: dentalSupportSettings(profile, resolveSettings(unit.settings)) as SupportSettings }];
}

/**
 * What the print-angle scan is asked to try, derived from the settings the aligner will be built
 * with. The scan is judging poses for THESE supports, so it has to be given them rather than the
 * profile's defaults - an aligner whose neck or pillar the operator changed scores its angles
 * differently.
 */
export function tiltScanSettings(unit: PrintUnit, profile: string): {
  neckLengthMm: number; pillarDiameterMm: number; liftMm: number; braced: boolean;
} {
  const { settings, structure } = alignerSettings(unit, profile);
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
export function acceptedPolicy(unit: PrintUnit, profile: string, rim: TwoContour['rim'], region: TwoContour['region']): TwoContour {
  const { structure } = alignerSettings(unit, profile);
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
export function acceptCommands(unit: PrintUnit, profile: string, policy: DentalPolicy): SceneCommand[] {
  return [...presetCommands(unit, profile), { type: 'dental/set', unitId: unit.id, policy }];
}

/**
 * No area was detected, so Step 2 opens empty and the operator paints one.
 *
 * THE PAINT IS CARRIED, as it is everywhere else a policy is replaced (`useRimDrawing` does the
 * same). Reaching here with stamps means the type changed under a painted area; dropping them would
 * be W-01 again, and the paint is the operator's work, not a function of the rim.
 */
export function manualAreaCommands(unit: PrintUnit, profile: string, rim: TwoContour['rim']): SceneCommand[] {
  return acceptCommands(unit, profile, manualAreaPolicy(rim, false, profile, unit.dental?.stamps ?? []));
}
