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
import type { DentalSession } from '@mixo-geocore/host/dental/dentalEngine';
import { defaultDenturePolicy, makeDenturePolicy, placementOfCandidates } from '@mixo-geocore/host/dental/denturePolicy';
import { GENERATE_LIMITS } from '@mixo-geocore/host/supports/generateLimits';
import { generateSupports, withOneShotSite } from '@mixo-geocore/host/supports/generateSupports';
import { packRules } from '@mixo-geocore/host/supports/generateRules';
import type { LiftAttempt } from '@mixo-geocore/host/dental/dentureGenerate';
import { supportMeshToUnitLocal } from '@mixo-geocore/host/supports/supportFrame';
import type { TiltScan } from '@mixo-geocore/host/dental/dentalTilt';
import type { Vector } from '@mixo-geocore/host/core/vec3';
import { LAYER_COLOURS } from './layerColours';

export type { DentalKind };

/** Batch experiment switch: MIXO_STEEP_NO_SUPPORT=67.5 adds R1b, the steep no-support ray (rule noSupportSteepDeg), to the tilt scan, the policy, the build and the review layers. */
export const steepRule = (): { noSupportSteepDeg?: number } => (Number(process.env.MIXO_STEEP_NO_SUPPORT) > 0 ? { noSupportSteepDeg: Number(process.env.MIXO_STEEP_NO_SUPPORT) } : {});

/** The engine 56 rule names that engine 57 replaced, for a MIXO_RULES saved before: same number, new name (both were degrees of slope from horizontal: from straight down X = slope X). */
export const LEGACY_RULE_NAMES: Readonly<Record<string, string>> = { tipMaxFromDownDeg: 'overhangAngleDeg', islandMaxFromDownDeg: 'islandOverhangAngleDeg' };

/** `rules` with each removed name renamed to its replacement (a value already given under the new name wins). */
export function currentRuleNames<T extends Record<string, unknown>>(rules: T): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [name, value] of Object.entries(rules)) if (!(name in LEGACY_RULE_NAMES) || !(LEGACY_RULE_NAMES[name]! in rules)) out[LEGACY_RULE_NAMES[name] ?? name] = value;
  return out;
}

/** Batch experiment switch: MIXO_SELF_SUPPORT=1 turns on the self-supporting overhang rule (rule overhangSelfSupport); MIXO_SELF_AREA / MIXO_SELF_REACH / MIXO_SELF_ANGLE override the thresholds. Read by the tilt scan, the policy, the build and the review. */
export const selfSupportRule = (): { overhangSelfSupport?: boolean; overhangMinAreaMm2?: number; overhangMaxReachMm?: number; overhangMinAngleDeg?: number; overhangSelfSupportStreams?: boolean; rimRespectsNoSupport?: boolean; socketNoSupport?: boolean; overhangAngleDeg?: number } => {
  // MIXO_SELF_STREAMS=1 (rule overhangSelfSupportStreams: the self-support test also filters rim and hole-band tips, needs MIXO_SELF_SUPPORT) and MIXO_RIM_NO_SUPPORT=1 (rule rimRespectsNoSupport) are independent switches.
  const streams = {
    ...(process.env.MIXO_SELF_STREAMS ? { overhangSelfSupportStreams: true } : {}),
    ...(process.env.MIXO_RIM_NO_SUPPORT ? { rimRespectsNoSupport: true } : {}),
    ...(process.env.MIXO_SOCKETS ? { socketNoSupport: true } : {}),
    // MIXO_OVERHANG_ANGLE=45: the one Overhang angle rule (rule overhangAngleDeg, slope from horizontal; engine 57, was MIXO_TIP_MAX = tipMaxFromDownDeg).
    ...(Number(process.env.MIXO_OVERHANG_ANGLE) > 0 ? { overhangAngleDeg: Number(process.env.MIXO_OVERHANG_ANGLE) } : {}),
    // MIXO_RULES='{"areaDensity":true,"contactFit":true}': any engine rules by name, for one-off experiments. A removed engine 56 name is mapped to its engine 57 one.
    ...(process.env.MIXO_RULES ? currentRuleNames(JSON.parse(process.env.MIXO_RULES) as Record<string, never>) : {}),
  };
  if (!process.env.MIXO_SELF_SUPPORT) return streams;
  const num = (v: string | undefined) => (v !== undefined && v !== '' && Number.isFinite(Number(v)) ? Number(v) : undefined);
  const [a, r, g] = [num(process.env.MIXO_SELF_AREA), num(process.env.MIXO_SELF_REACH), num(process.env.MIXO_SELF_ANGLE)];
  return { ...streams, overhangSelfSupport: true, ...(a !== undefined ? { overhangMinAreaMm2: a } : {}), ...(r !== undefined ? { overhangMaxReachMm: r } : {}), ...(g !== undefined ? { overhangMinAngleDeg: g } : {}) };
};

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
    /** Seconds per stage of this flow (tilt scan, policy, generate, total), always measured; the row reports them when MIXO_TIMERS is set. */
    stageSeconds: { scan: number; policy: number; generate: number; total: number };
    /** The contacts the build left out (no support built, any source), unit-local, each with the engine's reason. */
    leftOutTips: Array<{ position: Vector; normal: Vector; reason: string }>;
    /** Extra lift (mm over the profile's) of the kept build and every attempt of the extra-lift retry (+2.5, +5 mm when tips are left out). */
    extraLiftMm: number; liftAttempts: LiftAttempt[] }
  | { kind: 'inconclusive'; reason: string };

/** The denture flow on a centred `mesh`: upright, print angle, tips, supports (one pipeline, no UI). */
export function buildDentureReview(mesh: TriangleMesh, profileId = reviewProfileId('denture')): DentureReview {
  const started = performance.now();
  const lap = (from: number) => +((performance.now() - from) / 1000).toFixed(2);
  const orientation = orientDenture(mesh, profileId);
  if (orientation.kind !== 'oriented') return { kind: 'inconclusive', reason: `denture-orient-${orientation.reason}` };
  // Engine 14 finding: with the preset's contactShape SPHERE the denture build drops every tip (149 of 149 on the
  // reference scan, empty support mesh), so the review builds with the preset's other values and no contact ball.
  const settings = { ...defaultSupportSettings, ...dentureSupportPreset(dentureProfileData(profileId)), contactShape: 'NONE' as const, roofSeededModes: [] };
  // MIXO_LANDING=1 picks the tilt by the landing-circle path score (rule landingTiltWeight); unset keeps the old pick.
  // TEMP experiment envs (not committed): MIXO_TILT_ALLOWED=1 -> tiltAllowedLowsOnly, MIXO_TILT_ORDER=1 -> tiltPickOrder 1.
  const rules = process.env.MIXO_LANDING || process.env.MIXO_TILT_ALLOWED || process.env.MIXO_TILT_ORDER || process.env.MIXO_STEEP_NO_SUPPORT || process.env.MIXO_SELF_SUPPORT || process.env.MIXO_SELF_STREAMS || process.env.MIXO_RIM_NO_SUPPORT || process.env.MIXO_SOCKETS || process.env.MIXO_OVERHANG_ANGLE || process.env.MIXO_RULES
    ? packRules({ ...steepRule(), ...selfSupportRule(), ...(process.env.MIXO_LANDING ? { landingTiltWeight: 1 } : {}), ...(process.env.MIXO_TILT_ALLOWED ? { tiltAllowedLowsOnly: true } : {}), ...(process.env.MIXO_TILT_ORDER ? { tiltPickOrder: 1 as const } : {}) })
    : undefined;
  const scanStarted = performance.now();
  const scan = scanDentureTilts(mesh, profileId, { neckLengthMm: settings.neckLength, pillarDiameterMm: settings.pillarDiameter,
    liftMm: settings.liftHeight, braced: settings.trussEnabled, ...(rules ? { rules } : {}) });
  const scanSeconds = lap(scanStarted);
  if (scan.kind !== 'scan') return { kind: 'inconclusive', reason: `denture-tilt-scan-${scan.reason}` };
  if (process.env.MIXO_TILT_ORDER || process.env.MIXO_TILT_ALLOWED) console.log('TILTDUMP', JSON.stringify({ deg: scan.rows.map((r) => r.tiltDeg), tips: scan.boxed.tips, lows: scan.boxed.lows, picked: scan.rows[scan.order[0]!]!.tiltDeg, robust: scan.rows.map((r) => r.robust) }));
  const index = scan.order[0]!;
  const rotation = scan.rows[index]!.rotation as Vector;
  const turnedOnly: JobTransform = { position: [0, 0, 0], rotation };
  let lowestY = Infinity;
  const turned = applyTransform(mesh, turnedOnly);
  for (let at = 1; at < turned.positions.length; at += 3) lowestY = Math.min(lowestY, turned.positions[at]!);
  if (!Number.isFinite(lowestY)) return { kind: 'inconclusive', reason: 'empty-or-invalid-mesh' };
  const frame: JobTransform = { position: [0, settings.liftHeight - lowestY, 0], rotation };
  const policy = defaultDenturePolicy(profileId, settings.trussEnabled);
  // Accept: the policy is made ONCE (its per-model part comes from the engine's cache) and that one handle gives the placement, the
  // contacts and the policy `generate` reads. The policy names its candidates 'denture-min-0'...; `generate` keeps a contact only under
  // that id, at the policy's own position in the build frame, so the contacts are the policy's candidates as `frame` sees them.
  return withOneShotSite(mesh, (site) => {
    const policyStarted = performance.now();
    const handle = makeDenturePolicy(site.session as unknown as Pick<DentalSession, 'denture_policy_ruled'>, site.source, policy, frame, [], { ...steepRule(), ...selfSupportRule() });
    try {
      const ids = handle.candidate_ids();
      const flat = handle.candidate_points();
      const contacts = ids.map((id, k) => ({ id, origin: 'auto' as const, position: [flat[k * 6]!, flat[k * 6 + 1]!, flat[k * 6 + 2]!] as Vector,
        normal: [flat[k * 6 + 3]!, flat[k * 6 + 4]!, flat[k * 6 + 5]!] as Vector }));
      // The placement result of the turned model (no lift): the same tips with the frame's lift taken off.
      const lift = frame.position;
      const placement = placementOfCandidates(Float64Array.from({ length: flat.length }, (_, k) => (k % 6 < 3 ? flat[k]! - lift[k % 3]! : flat[k]!)));
      if (placement.points.length === 0) return { kind: 'inconclusive', reason: 'no-proposed-dental-tips' } as DentureReview;
      const policySeconds = lap(policyStarted);
      // One build at the profile lift. The extra-lift retry (`dentureGenerate.ts`) measured no gain on any case (2026-10-30) and tripled the build time.
      const generateStarted = performance.now();
      const out = generateSupports(contacts, settings, () => { throw new Error('policy is supplied by the site'); },
        { mode: 'export', model: mesh, frame, plateY: 0, labelText: '', zones: [], limits: GENERATE_LIMITS,
          // MIXO_MODEL_LANDING=1|2 tries the dental model-surface landing (rule dentalModelLanding); unset keeps plate-only.
          ...(process.env.MIXO_MODEL_LANDING || process.env.MIXO_STEEP_NO_SUPPORT || process.env.MIXO_SELF_SUPPORT || process.env.MIXO_SELF_STREAMS || process.env.MIXO_RIM_NO_SUPPORT || process.env.MIXO_SOCKETS || process.env.MIXO_OVERHANG_ANGLE || process.env.MIXO_RULES ? { rules: { ...steepRule(), ...selfSupportRule(), ...(process.env.MIXO_MODEL_LANDING ? { dentalModelLanding: Number(process.env.MIXO_MODEL_LANDING) } : {}) } } : {}),
          site: { session: site.session, source: site.source, placed: site.placed, policy: () => ({ handle, release() { /* the caller frees the one handle */ } }) } });
      const generateSeconds = lap(generateStarted);
      // Our placed tips: the build's contacts that the repair did not leave out, back in unit-local coordinates
      // (the frame the supports and the review layers are drawn in). A left-out tip has no pillar, so no cone.
      const leftOut = new Set(out.mesh.dropped);
      const placed = contacts.filter((contact) => !leftOut.has(contact.id))
        .map((contact) => ({ position: inverseTransformPoint(frame, contact.position), normal: inverseTransformDirection(frame, contact.normal) }));
      const reasons = new Map((out.mesh.leftOut ?? []).map((entry) => [entry.id, entry.reason]));
      const leftOutTips = contacts.filter((contact) => leftOut.has(contact.id))
        .map((contact) => ({ position: inverseTransformPoint(frame, contact.position), normal: inverseTransformDirection(frame, contact.normal), reason: reasons.get(contact.id) ?? 'dropped (policy, landing rule or no-support zone)' }));
      return { kind: 'built', orientation, scan, index, frame, placement, supports: supportMeshToUnitLocal(out.mesh, frame), placed, leftOutTips,
        candidateIds: contacts.map((contact) => contact.id), leftOut: (out.mesh.leftOut ?? []).map(({ id, reason }) => ({ id, reason })), extraLiftMm: 0, liftAttempts: [{ extraLiftMm: 0, leftOut: out.mesh.leftOut?.length ?? out.mesh.dropped.length }],
        stageSeconds: { scan: scanSeconds, policy: policySeconds, generate: generateSeconds, total: lap(started) } } as DentureReview;
    } finally {
      handle.free();
    }
  });
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
