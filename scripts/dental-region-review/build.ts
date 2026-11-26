import { useNodeEngine } from '../node-engine';
import { proposeDentalOrientation, rotationToDentalPose } from '@mixo-geocore/host/dental/dental';
import { proposeDentalSupportRegion, type DentalRegionProposal } from '@mixo-geocore/host/dental/dentalRegion';
import { dentalAreaBand, diagnosticDentalSideBands, type DentalDiagnosticBands } from '@mixo-geocore/host/dental/dentalContactBand';
import { profileData } from '@mixo-geocore/host/dental/alignerProfiles';
import { sampleDiagnosticContourContacts, type DiagnosticContourContact } from '@mixo-geocore/host/dental/dentalContourContacts';
import type { PlacementResult, TriangleMesh } from '@mixo-geocore/host/core/analysis/types';
import type { JobTransform } from '@mixo-geocore/host/core/jobs';
import type { GeneratedSupportMesh } from '@mixo-geocore/host/core/supports/mesh';
import { defaultSupportSettings, toPlacementSettings } from '@mixo-geocore/host/core/supports/settings';
import { runSupportJob } from '@mixo-geocore/host/supports/jobRunner';
import type { GenerateRules } from '@mixo-geocore/host/supports/generateRules';
import { filterDentalPlacement } from '@mixo-geocore/host/dental/placement';
import { dentalStructureOf, dentalSupportSettings } from '../../src/dental/supportPreset';
import { applyTransform, inverseTransformDirection, inverseTransformPoint } from '@mixo-geocore/host/state/transform';
import { REFERENCE_PROFILE, referenceTuning } from './profile';
import { scanDentalTilts, type TiltScan } from '@mixo-geocore/host/dental/dentalTilt';
import { confirmPick } from '../../src/dental/confirmTilt';
import type { Vector } from '@mixo-geocore/host/core/vec3';

useNodeEngine();

type Region = Extract<DentalRegionProposal, { kind: 'proposal' }>;
export type DiagnosticReviewContacts = {
  outer: { contacts: DiagnosticContourContact[]; skippedSamples: number };
  inner: { contacts: DiagnosticContourContact[]; skippedSamples: number };
};
/*
 * `bands` and `diagnosticContacts` are DIAGNOSTIC drawings for the review file; placement never reads them. Absent when
 * the band could not be built, and `diagnosticNote` then says why - the review goes on (see buildDentalReview).
 */
export type DentalReviewBuild =
  | { kind: 'proposal'; region: Region; bands?: DentalDiagnosticBands; diagnosticContacts?: DiagnosticReviewContacts; diagnosticNote: string;
    frame: JobTransform; placement: PlacementResult; supports: GeneratedSupportMesh }
  | { kind: 'inconclusive'; reason: string };

/** The aligner type's Step 3 settings and switches, as the app gives a new aligner. */
function appSettings(profileId: string) {
  return { ...dentalSupportSettings(profileId, defaultSupportSettings), roofSeededModes: [] };
}

export type PrintAngle =
  | { kind: 'angle'; scan: Extract<TiltScan, { kind: 'scan' }>; index: number; rotation: Vector; confirmed: boolean; tried: number }
  | { kind: 'inconclusive'; reason: string };

/**
 * The app's Step 1 print angle: the scan with the new aligner's settings, then the confirm builds
 * of the automatic pick (the pick, then at most two more tilts in pick order).
 */
// `profileId` defaults to the reference aligner, which is every caller today; a registered aligner
// type (docs/TYPE-PIPELINE.md) passes its own id, which is how the parity proof P1 runs a whole review.
export function pickPrintAngle(mesh: TriangleMesh, profileId: string = REFERENCE_PROFILE): PrintAngle {
  const settings = appSettings(profileId);
  const structure = dentalStructureOf(profileId);
  const scan = scanDentalTilts(mesh, profileId, { neckLengthMm: settings.neckLength, pillarDiameterMm: settings.pillarDiameter,
    liftMm: settings.liftHeight, braced: structure.treeEnabled || structure.bracesEnabled });
  if (scan.kind !== 'scan') return { kind: 'inconclusive', reason: `tilt-scan-${scan.reason}` };
  const region = proposeDentalSupportRegion(mesh, referenceTuning, profileId);
  const orientation = proposeDentalOrientation(mesh, profileId);
  const pick = scan.order[0]!;
  if (region.kind !== 'proposal' || orientation.kind !== 'proposal') return { kind: 'angle', scan, index: pick, rotation: scan.rows[pick]!.rotation, confirmed: false, tried: 0 };
  const dental = { kind: 'two-contour' as const, profileId, rim: orientation.rim, region, stamps: [], structure };
  const { confirmed, tried } = confirmPick({ mesh, dental, settings, labelText: 'A' }, scan.order.map((index) => scan.rows[index]!.rotation));
  const index = confirmed === undefined ? pick : scan.order[confirmed]!;
  return { kind: 'angle', scan, index, rotation: scan.rows[index]!.rotation, confirmed: confirmed !== undefined, tried };
}

/**
 * Runs the same detector, dental placement filter, and support builder used by the app, at the
 * profile's pose or at `poseRotation` (Euler XYZ, e.g. the print angle `pickPrintAngle` chose).
 */
/*
 * `rules` ARE THE ENGINE'S NAMED OVERRIDES, and they were missing here, which is the only reason
 * typelab could not turn a rule on an aligner. The engine has taken rules for every kind all
 * along - `host/supports/jobRunner.ts` passes `rules: job.rules ?? GENERATE_RULES` whatever the
 * dental kind - and this review simply never handed any over, so every aligner run used the
 * defaults and looked as though the aligner had no channel at all.
 *
 * The caller decides WHICH rules: only the ones an aligner actually reads should arrive here
 * (`readBy('aligner', …)` in `typelab/rules.mjs`). Passing a denture-only rule would change
 * nothing and read as "this rule does nothing", which is the opposite of the truth.
 */
export function buildDentalReview(mesh: TriangleMesh, poseRotation?: Vector, rules?: GenerateRules, profileId: string = REFERENCE_PROFILE): DentalReviewBuild {
  const region = proposeDentalSupportRegion(mesh, referenceTuning, profileId);
  if (region.kind !== 'proposal') return region;
  // The diagnostic strips and samples use the profile's own area and spacing (the app's defaults).
  const { defaults } = profileData(profileId);
  const [low, high] = dentalAreaBand(referenceTuning, profileId);
  /*
   * TRAP (2026-11-27, docs/GEOCORE-BOUNDARY.md section 3): the band is a diagnostic drawing over the WHOLE file and needs a
   * two-manifold face graph (geocore surface/side_bands.rs). An aligner with attached hooks has non-manifold edges where
   * they meet it, so the band failed - and this returned "inconclusive" for a scan whose region the engine HAD found and
   * which the app builds from that region alone. A missing drawing now costs the drawing, not the review.
   */
  const bands = diagnosticDentalSideBands(mesh, region, { setback: Math.max(0, low), width: high });
  let diagnostic: { bands?: DentalDiagnosticBands; diagnosticContacts?: DiagnosticReviewContacts; diagnosticNote: string };
  if (bands.kind !== 'proposal') diagnostic = { diagnosticNote: `diagnostic band not drawn: ${bands.reason}` };
  else {
    const outer = sampleDiagnosticContourContacts(mesh, region.outerEdges, bands.outerOtherSide,
      { spacing: defaults.outerSpacingMm / referenceTuning.density, maxSearchDistance: defaults.maxSearchMm });
    // An open arch has no central opening (empty opening contour): there is no inner rim to sample, so
    // it has no inner contacts. Any other opening contour still has to be one valid closed loop.
    const inner = region.openingEdges.length === 0
      ? { kind: 'proposal' as const, contacts: [], skippedSamples: 0, perimeter: 0 }
      : sampleDiagnosticContourContacts(mesh, region.openingEdges, bands.innerOtherSide,
        { spacing: defaults.innerSpacingMm / referenceTuning.density, maxSearchDistance: defaults.maxSearchMm });
    // Kept fatal on purpose: it also checks the opening contour is one valid closed loop (openArch.test.ts guards it).
    if (outer.kind !== 'proposal' || inner.kind !== 'proposal') {
      return { kind: 'inconclusive', reason: `diagnostic-contact-${outer.kind !== 'proposal' ? outer.reason : inner.kind !== 'proposal' ? inner.reason : 'unknown'}` };
    }
    diagnostic = { bands, diagnosticContacts: { outer, inner }, diagnosticNote: '' };
  }
  const orientation = proposeDentalOrientation(mesh, profileId);
  if (orientation.kind !== 'proposal') return { kind: 'inconclusive', reason: `orientation-${orientation.reason}` };
  const rotation = poseRotation ?? rotationToDentalPose(mesh, orientation.rim, profileId);
  if (!rotation) return { kind: 'inconclusive', reason: 'dental-pose-inconclusive' };

  const settings = appSettings(profileId);
  const orientationOnly: JobTransform = { position: [0, 0, 0], rotation };
  const turned = applyTransform(mesh, orientationOnly);
  let lowestY = Infinity;
  for (let at = 1; at < turned.positions.length; at += 3) lowestY = Math.min(lowestY, turned.positions[at]!);
  if (!Number.isFinite(lowestY)) return { kind: 'inconclusive', reason: 'empty-or-invalid-mesh' };
  const frame: JobTransform = {
    position: [0, settings.liftHeight - lowestY, 0], rotation,
  };
  const dental = { kind: 'two-contour' as const, profileId, rim: orientation.rim, region, stamps: [], structure: dentalStructureOf(profileId) };
  const empty: PlacementResult = { points: [], regions: [], contactPositions: new Float32Array(), contactNormals: new Float32Array() };
  const placement = filterDentalPlacement({ mesh, orientation: orientationOnly,
    settings: toPlacementSettings(settings), dental }, empty);
  if (placement.points.length === 0) return { kind: 'inconclusive', reason: 'no-proposed-dental-tips' };
  const localPoints = placement.points.map((point) => ({ ...point,
    position: inverseTransformPoint(orientationOnly, point.position),
    normal: inverseTransformDirection(orientationOnly, point.normal),
  }));
  const supports = runSupportJob({ mesh, dental, frame, settings,
    contacts: { points: localPoints, manual: [], deleted: [], zones: [], contactSettings: {} },
    /*
     * EMPTY MUST MEAN ABSENT, not "no rules". `jobRunner` reads `job.rules ?? GENERATE_RULES`, and
     * `{}` is not nullish - handing it one would replace the engine's whole default set with nothing
     * and quietly change every aligner review. So the guard is on CONTENT, not on existence.
     */
    labelText: 'A', mode: 'export', ...(rules && Object.keys(rules).length > 0 ? { rules } : {}) });
  return { kind: 'proposal', region, ...diagnostic, frame, placement, supports };
}
