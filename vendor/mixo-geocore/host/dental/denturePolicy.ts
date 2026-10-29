import type { PlacementResult, SupportPoint, TriangleMesh } from '../core/analysis/types';
import type { JobTransform } from '../core/jobs';
import { orientationOnly } from '../core/jobs';
import { positionIds } from '../supports/contactEdits';
import { frameArray, type MakePolicy, type PolicyHandle } from '../supports/generateSupports';
import { withDentalMesh, type DentalSession } from './dentalEngine';

/*
 * Host side of the denture policy (Rust `dental::denture::policy` through `denture_policy`): the
 * unit's pose and switches are packed as numbers and Rust returns the `PolicyResult` handle
 * `generate` takes (every face permitted, the pose's tips as candidates, pillars may land on the
 * model). Nothing about the policy is decided here.
 */

/** What a denture unit saves about its supports: the profile and the lattice switch. */
export interface DenturePolicy {
  kind: 'denture';
  profileId: string;
  /** Lattice bracing between pillars (the profile default unless the operator switched it). */
  lattice: boolean;
}

/** A unit's policy from its profile, lattice on as the profile says. */
export function defaultDenturePolicy(profileId: string, lattice = true): DenturePolicy {
  return { kind: 'denture', profileId, lattice };
}

/**
 * The unit's denture policy made in Rust, expressed in `frame` (its +Y is the plate normal the
 * tips are placed for). `manual` are the unit's manual tips (unit-local): no automatic tip within
 * the pitch of one.
 */
export function makeDenturePolicy(session: Pick<DentalSession, 'denture_policy'>, model: number, policy: DenturePolicy, frame: JobTransform,
  manual: readonly Pick<SupportPoint, 'position'>[] = []): PolicyHandle {
  return session.denture_policy(model, policy.profileId, frameArray(frame), policy.lattice, Float64Array.from(manual.flatMap((point) => point.position)));
}

/** `makeDenturePolicy` for `generateSupports`. */
export const denturePolicy = (policy: DenturePolicy, frame: JobTransform, manual: readonly Pick<SupportPoint, 'position'>[] = []): MakePolicy =>
  (session, model) => makeDenturePolicy(session as unknown as Pick<DentalSession, 'denture_policy'>, model, policy, frame, manual);

/** Points (xyz then normal xyz each) with position ids. */
function pointsOf(flat: Float64Array): SupportPoint[] {
  const count = flat.length / 6;
  const at = (k: number, offset: number): [number, number, number] => [flat[k * 6 + offset]!, flat[k * 6 + offset + 1]!, flat[k * 6 + offset + 2]!];
  const ids = positionIds(Array.from({ length: count }, (_, k) => at(k, 0)));
  return Array.from({ length: count }, (_, k) => ({ id: ids[k]!, regionId: -1, position: at(k, 0), normal: at(k, 3), source: 'interior' as const }));
}

/**
 * Automatic contacts of a denture unit in the frame of the turned model (`orientation`'s rotation,
 * no translation), as a placement result: the policy's own candidates (lowest points, bottom band,
 * bar undersides, light fill). The batch and the app call this where the aligner flow calls
 * `filterDentalPlacement`.
 */
export function denturePlacement(mesh: TriangleMesh, policy: DenturePolicy, orientation: JobTransform, manual: readonly SupportPoint[] = []): PlacementResult {
  const candidates = withDentalMesh(mesh, (session, model) => {
    const handle = makeDenturePolicy(session, model, policy, orientationOnly(orientation), manual);
    try {
      return handle.candidate_points();
    } finally {
      handle.free();
    }
  });
  const points = pointsOf(candidates);
  return { points, regions: [],
    contactPositions: new Float32Array(points.flatMap((point) => point.position)),
    contactNormals: new Float32Array(points.flatMap((point) => point.normal)) };
}
