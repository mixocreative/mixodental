import type { ProgressCallback, SupportPoint, TriangleMesh } from '@mixo-geocore/host/core/analysis/types';
import type { ContactInputs, JobTransform } from '@mixo-geocore/host/core/jobs';
import type { GeneratedSupportMesh } from '@mixo-geocore/host/core/supports/mesh';
import type { LiveSupportSettings } from '@mixo-geocore/host/core/supports/settings';
import type { Vector } from '@mixo-geocore/host/core/vec3';
import { orientDenture, type DentureOrientation } from '@mixo-geocore/host/dental/dentureOrient';
import { scanDentureTilts } from '@mixo-geocore/host/dental/dentureTilt';
import type { TiltScan, TiltScanSettings } from '@mixo-geocore/host/dental/dentalTilt';
import type { DentalSession } from '@mixo-geocore/host/dental/dentalEngine';
import { makeDenturePolicy, policyParts, type DenturePolicy } from '@mixo-geocore/host/dental/denturePolicy';
import type { DenturePart } from '@mixo-geocore/host/dental/dentureParts';
import { positionIds } from '@mixo-geocore/host/supports/contactEdits';
import { jobContacts } from '@mixo-geocore/host/supports/genericPolicy';
import { generateSupports, withOneShotSite, type BuildSite, type PolicyHandle } from '@mixo-geocore/host/supports/generateSupports';
import type { GenerateRules } from '@mixo-geocore/host/supports/generateRules';
import { GENERATE_LIMITS } from '@mixo-geocore/host/supports/generateLimits';
import { rerouteSupport, type EditSession, type RerouteResult } from '@mixo-geocore/host/supports/editSupport';
import { supportMeshToUnitLocal } from '@mixo-geocore/host/supports/supportFrame';
import { inverseTransformDirection, inverseTransformPoint, transformDirection, transformPoint, transformedMinY } from '@mixo-geocore/host/state/transform';

/*
 * The denture pipeline on one thread (the denture worker runs it; tests run it under Node): Step 1's
 * upright and print-angle search, the accepted pose's tips, the support build and the one-tip
 * model-surface check. It is the batch review's flow (dentalwork/batch-review/profileSelect.ts) with
 * the unit's hand work added: automatic tips are the denture policy's candidates, re-made in every
 * build from the same pose, so a deleted tip (by its unit-local position id), a manual tip and a
 * no-support zone apply as in the aligner flow. Nothing about placement or routes is decided here.
 */

/** The file's parts as the denture policy reports them (engine 50), and the part id of every face. */
export interface DentureParts {
  parts: DenturePart[];
  faceParts: Uint32Array;
}

/** A denture build: the support mesh in unit-local space plus the file's parts. */
export type DentureMesh = GeneratedSupportMesh & { dentureParts?: DentureParts };

/** Everything a denture placement or build reads, unit-local except `frame`. */
export interface DentureJob {
  mesh: TriangleMesh;
  policy: DenturePolicy;
  /** The generation frame: the unit's transform when the pose was accepted (its +Y is the plate normal). */
  frame: JobTransform;
  /** The plate's height in `frame` (a lift change moves the plate, as `generationPlate`). */
  plateY: number;
  settings: Readonly<LiveSupportSettings>;
  rules: GenerateRules;
  /** The unit's hand work: manual tips, deleted ids, no-support zones, per-support shapes. */
  hand: Omit<ContactInputs, 'points'>;
  labelText: string;
  mode: 'preview' | 'export';
  /** The request's revision: `generate` echoes it so an export can tell a stale build (see `exportRefusal`). */
  revision?: number;
}

/** Step 1 in one job: the upright frame, then the print-angle search (`onTilt(done, total)` per tilt). */
export function orientAndScan(mesh: TriangleMesh, profileId: string, settings: TiltScanSettings, onTilt?: (done: number, total: number) => void): { orientation: DentureOrientation; scan: TiltScan } {
  const orientation = orientDenture(mesh, profileId);
  if (orientation.kind !== 'oriented') return { orientation, scan: { kind: 'failed', reason: orientation.reason } };
  return { orientation, scan: scanDentureTilts(mesh, profileId, settings, onTilt) };
}

/** The tilt-scan settings of a unit's support settings: the neck, pillar and lift the routes are judged with. */
export function scanSettingsOf(settings: Readonly<LiveSupportSettings>, rules: Float64Array | undefined): TiltScanSettings {
  return { neckLengthMm: settings.neckLength, pillarDiameterMm: settings.pillarDiameter, liftMm: settings.liftHeight, braced: settings.trussEnabled, ...(rules ? { rules } : {}) };
}

/** The frame that turns `mesh` by `rotation` and lifts its lowest point `liftMm` above the plate, at plan position (x, z). */
export function liftedFrame(mesh: TriangleMesh, rotation: Vector, liftMm: number, plan: readonly [number, number] = [0, 0]): JobTransform {
  const lowest = transformedMinY(mesh.positions, { position: [0, 0, 0], rotation: [...rotation] });
  if (!Number.isFinite(lowest)) throw new TypeError('empty or invalid mesh');
  return { position: [plan[0], liftMm - lowest, plan[1]], rotation: [...rotation] };
}

/** The policy's candidates as unit-local points keyed by position id, and the policy id behind each. */
function candidatesOf(handle: PolicyHandle, frame: JobTransform): { points: SupportPoint[]; policyIds: Map<string, string> } {
  const ids = handle.candidate_ids();
  const flat = handle.candidate_points();
  const at = (k: number, offset: number): Vector => [flat[k * 6 + offset]!, flat[k * 6 + offset + 1]!, flat[k * 6 + offset + 2]!];
  const positions = ids.map((_, k) => inverseTransformPoint(frame, at(k, 0)));
  const local = positionIds(positions);
  const policyIds = new Map(local.map((id, k) => [id, ids[k]!]));
  const points = ids.map((_, k): SupportPoint => ({ id: local[k]!, regionId: -1, position: positions[k]!, normal: inverseTransformDirection(frame, at(k, 3)), source: 'interior' }));
  return { points, policyIds };
}

/** Runs `use` with the job's denture policy made in a session holding the model; the handle is freed after. */
function withPolicy<T>(job: Pick<DentureJob, 'mesh' | 'policy' | 'frame' | 'rules' | 'hand'>, use: (site: BuildSite, handle: PolicyHandle) => T): T {
  return withOneShotSite(job.mesh, (site) => {
    const handle = makeDenturePolicy(site.session as unknown as Pick<DentalSession, 'denture_policy_ruled'>, site.source, job.policy, job.frame, job.hand.manual, job.rules);
    try {
      return use(site, handle);
    } finally {
      handle.free();
    }
  });
}

/** The accepted pose's automatic tips (unit-local, position ids) and the file's parts. */
export function placeDenture(job: Pick<DentureJob, 'mesh' | 'policy' | 'frame' | 'rules' | 'hand'>): { points: SupportPoint[]; parts: DentureParts } {
  return withPolicy(job, (_site, handle) => ({ points: candidatesOf(handle, job.frame).points, parts: policyParts(handle) }));
}

/** Renames the contact ids a build reports from the policy's names back to the unit's (position ids); others stay. */
export function withUnitIds(mesh: GeneratedSupportMesh, unitIdOf: ReadonlyMap<string, string>): GeneratedSupportMesh {
  const rename = (id: string) => unitIdOf.get(id) ?? id;
  return {
    ...mesh,
    dropped: mesh.dropped.map(rename),
    ...(mesh.droppedByZones ? { droppedByZones: mesh.droppedByZones.map(rename) } : {}),
    ...(mesh.leftOut ? { leftOut: mesh.leftOut.map((entry) => ({ ...entry, id: rename(entry.id) })) } : {}),
    components: mesh.components.map((component) => (component.contactId ? { ...component, contactId: rename(component.contactId) } : component)),
  };
}

/**
 * One denture support build in unit-local space. The automatic tips are the policy's candidates minus the
 * unit's deletions and zones, plus its manual tips; `unresolved` and `modelLanded` keep the policy's ids
 * (the allow list names them) and stay in the build frame, as every build reports them.
 */
export function buildDenture(job: DentureJob, onProgress?: ProgressCallback): DentureMesh {
  const { frame } = job;
  return withPolicy(job, (site, handle) => {
    const { points, policyIds } = candidatesOf(handle, frame);
    const contacts = jobContacts({ ...job.hand, points }, job.settings).map((contact) => ({
      ...contact, id: policyIds.get(contact.id) ?? contact.id, position: transformPoint(frame, contact.position), normal: transformDirection(frame, contact.normal),
    }));
    const zones = job.hand.zones.map((stamp) => ({ ...stamp, center: transformPoint(frame, stamp.center), normal: transformDirection(frame, stamp.normal) }));
    const out = generateSupports(contacts, job.settings, () => handle, {
      mode: job.mode, model: job.mesh, frame, plateY: job.plateY, labelText: job.labelText, zones, limits: GENERATE_LIMITS, rules: job.rules,
      ...(job.revision === undefined ? {} : { revision: job.revision }),
      site: { session: site.session, source: site.source, placed: site.placed, policy: () => ({ handle, release() { /* withPolicy frees it */ } }) },
      ...(onProgress ? { onProgress } : {}),
    });
    const unitIdOf = new Map([...policyIds].map(([local, policy]) => [policy, local]));
    return { ...supportMeshToUnitLocal(withUnitIds(out.mesh, unitIdOf), frame), dentureParts: policyParts(handle) };
  });
}

/**
 * Whether one point can be supported from the model surface (Round C, the edit path: wasm `reroute_support`
 * with `allowModelLanding`, no build). `tip` and `normal` are in the build frame, as the unresolved report gives them.
 * Answers the landing tier, or the engine's refusal.
 */
export function checkModelLanding(job: Pick<DentureJob, 'mesh' | 'policy' | 'frame' | 'rules' | 'hand' | 'settings' | 'plateY'>, tip: Vector, normal: Vector): RerouteResult {
  const zones = job.hand.zones.map((stamp) => ({ ...stamp, center: transformPoint(job.frame, stamp.center), normal: transformDirection(job.frame, stamp.normal) }));
  return withPolicy(job, (site, handle) => rerouteSupport(site.session as unknown as EditSession, site.placed(job.frame), job.settings, tip, normal, null,
    { allowModelLanding: { policy: handle, zones }, rules: job.rules, plateY: job.plateY }));
}
