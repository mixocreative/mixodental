/*
 * Kind selection of the folder review (PD.6): the operator picks aligner or denture once per run
 * (`--kind`), and this module is the only place the review branches on it. The aligner path stays
 * in reviewCase.ts / scripts/dental-region-review; the denture path is the vendored host/dental
 * denture functions. The shape check only VERIFIES the choice, it never switches the kind.
 */
import type { PlacementResult, TriangleMesh } from '@mixo-geocore/host/core/analysis/types';
import type { JobTransform } from '@mixo-geocore/host/core/jobs';
import type { GeneratedSupportMesh } from '@mixo-geocore/host/core/supports/mesh';
import { defaultSupportSettings } from '@mixo-geocore/host/core/supports/settings';
import { applyTransform, inverseTransformDirection, inverseTransformPoint } from '@mixo-geocore/host/state/transform';
import { defaultProfileId, isDentalKind, type DentalKind } from '@mixo-geocore/host/dental/dentalKind';
import { proposeDentalOrientation } from '@mixo-geocore/host/dental/dental';
import { dentureProfileData, dentureSupportPreset } from '@mixo-geocore/host/dental/dentureProfiles';
import { orientDenture, type DentureOrientation } from '@mixo-geocore/host/dental/dentureOrient';
import { scanDentureTilts } from '@mixo-geocore/host/dental/dentureTilt';
import { withDentalMesh } from '@mixo-geocore/host/dental/dentalEngine';
import { defaultDenturePolicy, denturePlacement, denturePolicy, makeDenturePolicy } from '@mixo-geocore/host/dental/denturePolicy';
import { GENERATE_LIMITS } from '@mixo-geocore/host/supports/generateLimits';
import { generateSupports, type MakePolicy } from '@mixo-geocore/host/supports/generateSupports';
import type { LiftAttempt } from '@mixo-geocore/host/dental/dentureGenerate';
import { supportMeshToUnitLocal } from '@mixo-geocore/host/supports/supportFrame';
import type { TiltScan } from '@mixo-geocore/host/dental/dentalTilt';
import type { Vector } from '@mixo-geocore/host/core/vec3';
import { LAYER_COLOURS } from './layerColours';

export type { DentalKind };

/** The kind from the `--kind` value: absent means aligner; anything else but aligner/denture is an error. */
export function parseKind(value: string | undefined): DentalKind {
  if (value === undefined) return 'aligner';
  if (!isDentalKind(value)) throw new Error(`--kind must be 'aligner' or 'denture' (got '${value}')`);
  return value;
}

/** The profile the review uses for `kind` (the reference profile of that family). */
export const reviewProfileId = (kind: DentalKind): string => defaultProfileId(kind);

/**
 * Whether the scan's shape contradicts the chosen kind, from the other kind's Step 1. Called only
 * when the chosen kind's own pipeline did not build; returns a note, or '' (no contradiction).
 * Denture chosen but the aligner trim is found: "looks like an aligner"; aligner chosen but the
 * denture upright succeeds: "looks like a denture".
 */
export function shapeNote(kind: DentalKind, mesh: TriangleMesh): string {
  try {
    if (kind === 'aligner') return orientDenture(mesh, defaultProfileId('denture')).kind === 'oriented' ? 'looks like a denture' : '';
    return proposeDentalOrientation(mesh, defaultProfileId('aligner')).kind === 'proposal' ? 'looks like an aligner' : '';
  } catch {
    return '';
  }
}

export type DentureReview =
  | { kind: 'built'; orientation: Extract<DentureOrientation, { kind: 'oriented' }>; scan: Extract<TiltScan, { kind: 'scan' }>; index: number;
    frame: JobTransform; placement: PlacementResult; supports: GeneratedSupportMesh;
    /** The tips the supports were built from, in unit-local coordinates (the same contacts as `supports`). */
    placed: Array<{ position: Vector; normal: Vector }>;
    /** The policy's candidate ids in order (an island's `tipIndex` indexes them) and the tips the build left out, for `settleIslands`. */
    candidateIds: string[]; leftOut: Array<{ id: string; reason: string }>;
    /** The contacts the build left out (no support built, any source), unit-local, each with the engine's reason. */
    leftOutTips: Array<{ position: Vector; normal: Vector; reason: string }>;
    /** Extra lift (mm over the profile's) of the kept build and every attempt of the extra-lift retry (+2.5, +5 mm when tips are left out). */
    extraLiftMm: number; liftAttempts: LiftAttempt[] }
  | { kind: 'inconclusive'; reason: string };

/** The denture flow on a centred `mesh`: upright, print angle, tips, supports (one pipeline, no UI). */
export function buildDentureReview(mesh: TriangleMesh, profileId = reviewProfileId('denture')): DentureReview {
  const orientation = orientDenture(mesh, profileId);
  if (orientation.kind !== 'oriented') return { kind: 'inconclusive', reason: `denture-orient-${orientation.reason}` };
  // Engine 14 finding: with the preset's contactShape SPHERE the denture build drops every tip (149 of 149 on the
  // reference scan, empty support mesh), so the review builds with the preset's other values and no contact ball.
  const settings = { ...defaultSupportSettings, ...dentureSupportPreset(dentureProfileData(profileId)), contactShape: 'NONE' as const, roofSeededModes: [] };
  const scan = scanDentureTilts(mesh, profileId, { neckLengthMm: settings.neckLength, pillarDiameterMm: settings.pillarDiameter,
    liftMm: settings.liftHeight, braced: settings.trussEnabled });
  if (scan.kind !== 'scan') return { kind: 'inconclusive', reason: `denture-tilt-scan-${scan.reason}` };
  const index = scan.order[0]!;
  const rotation = scan.rows[index]!.rotation as Vector;
  const turnedOnly: JobTransform = { position: [0, 0, 0], rotation };
  let lowestY = Infinity;
  const turned = applyTransform(mesh, turnedOnly);
  for (let at = 1; at < turned.positions.length; at += 3) lowestY = Math.min(lowestY, turned.positions[at]!);
  if (!Number.isFinite(lowestY)) return { kind: 'inconclusive', reason: 'empty-or-invalid-mesh' };
  const frame: JobTransform = { position: [0, settings.liftHeight - lowestY, 0], rotation };
  const policy = defaultDenturePolicy(profileId, settings.trussEnabled);
  const placement = denturePlacement(mesh, policy, turnedOnly);
  if (placement.points.length === 0) return { kind: 'inconclusive', reason: 'no-proposed-dental-tips' };
  // The policy names its candidates 'denture-min-0'...; `generate` keeps a contact only under that id, at the
  // policy's own position in the build frame. So the contacts are the policy's candidates as `frame` sees them.
  const contacts = withDentalMesh(mesh, (session, model) => {
    const handle = makeDenturePolicy(session, model, policy, frame);
    try {
      const ids = handle.candidate_ids();
      const flat = handle.candidate_points();
      return ids.map((id, k) => ({ id, origin: 'auto' as const, position: [flat[k * 6]!, flat[k * 6 + 1]!, flat[k * 6 + 2]!] as Vector,
        normal: [flat[k * 6 + 3]!, flat[k * 6 + 4]!, flat[k * 6 + 5]!] as Vector }));
    } finally {
      handle.free();
    }
  });
  const make: MakePolicy = denturePolicy(policy, frame);
  // One build at the profile lift. The extra-lift retry (`dentureGenerate.ts`) measured no gain on any case (2026-10-30) and tripled the build time.
  const out = generateSupports(contacts, settings, make, { mode: 'export', model: mesh, frame, plateY: 0, labelText: '', zones: [], limits: GENERATE_LIMITS });
  // Our placed tips: the build's contacts that the repair did not leave out, back in unit-local coordinates
  // (the frame the supports and the review layers are drawn in). A left-out tip has no pillar, so no cone.
  const leftOut = new Set(out.mesh.dropped);
  const placed = contacts.filter((contact) => !leftOut.has(contact.id))
    .map((contact) => ({ position: inverseTransformPoint(frame, contact.position), normal: inverseTransformDirection(frame, contact.normal) }));
  const reasons = new Map((out.mesh.leftOut ?? []).map((entry) => [entry.id, entry.reason]));
  const leftOutTips = contacts.filter((contact) => leftOut.has(contact.id))
    .map((contact) => ({ position: inverseTransformPoint(frame, contact.position), normal: inverseTransformDirection(frame, contact.normal), reason: reasons.get(contact.id) ?? 'dropped (policy, landing rule or no-support zone)' }));
  return { kind: 'built', orientation, scan, index, frame, placement, supports: supportMeshToUnitLocal(out.mesh, frame), placed, leftOutTips,
    candidateIds: contacts.map((contact) => contact.id), leftOut: (out.mesh.leftOut ?? []).map(({ id, reason }) => ({ id, reason })), extraLiftMm: 0, liftAttempts: [{ extraLiftMm: 0, leftOut: out.mesh.leftOut?.length ?? out.mesh.dropped.length }] };
}

/** Review layers of a built denture, in the unit-local frame (the GLB node carries `review.frame`): model, supports, upright (arch) plane. */
export function dentureLayers(mesh: TriangleMesh, review: Extract<DentureReview, { kind: 'built' }>): Array<{ name: string; color: number; positions: Float32Array; indices: Uint32Array }> {
  let half = 0;
  for (let at = 0; at < mesh.positions.length; at += 3) {
    half = Math.max(half, Math.hypot(mesh.positions[at]!, mesh.positions[at + 1]!, mesh.positions[at + 2]!));
  }
  const { frame } = review.orientation;
  const corner = (a: number, b: number) => [0, 1, 2].map((k) => frame.centroid[k]! + frame.across[k]! * half * a + frame.up[k]! * half * b);
  const plane = [corner(-1, -1), corner(1, -1), corner(1, 1), corner(-1, 1)].flat();
  const { supports } = review;
  return [
    { name: 'TEAL denture model', color: 0x2aa198, positions: Float32Array.from(mesh.positions), indices: Uint32Array.from(mesh.indices) },
    { name: 'SUPPORT PILLARS (ours)', color: LAYER_COLOURS.pillars, positions: Float32Array.from(supports.positions), indices: Uint32Array.from(supports.indices) },
    { name: 'UPRIGHT PLANE (arch; teeth side is its normal)', color: 0x6c7a89, positions: Float32Array.from(plane), indices: Uint32Array.of(0, 1, 2, 0, 2, 3) },
  ];
}
