import { defaultProfileId, kindOfProfile, type DentalKind } from '@mixo-geocore/host/dental/dentalKind';
import { profileData } from '@mixo-geocore/host/dental/alignerProfiles';
import { dentureProfileData } from '@mixo-geocore/host/dental/dentureProfiles';

/*
 * The dental job kind of a run (PD.6): the caller chooses it once (the start screen's card), and the
 * profile id carries it from then on. Nothing here looks at a mesh. The aligner flow is the default
 * for an id neither family knows, so older sessions keep working.
 */

/** The profile a denture job starts with: the vendored reference denture (`profiles/reference-denture.json`). */
export const DENTURE_PROFILE_ID: string = defaultProfileId('denture');

/** The job kind of a profile id: `denture` for a denture profile, else `aligner`. */
export function jobKindOf(profileId: string | undefined): DentalKind {
  return kindOfProfile(profileId) ?? 'aligner';
}

/** Whether the dental flow runs the denture pipeline for this profile id. */
export const isDentureJob = (profileId: string | undefined): boolean => jobKindOf(profileId) === 'denture';

/** The print-angle scan's step (degrees) of either family's profile: the dial snaps to it. */
export const tiltStepOf = (profileId: string): number =>
  (isDentureJob(profileId) ? dentureProfileData(profileId).pose.tiltStepDeg : profileData(profileId).pose.tiltStepDeg);
