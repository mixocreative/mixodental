import { defaultProfileId, kindOfProfile, type DentalKind } from '@mixo-geocore/host/dental/dentalKind';
import { profileData } from '@mixo-geocore/host/dental/alignerProfiles';
import { dentureProfileData } from '@mixo-geocore/host/dental/dentureProfiles';

/*
 * The dental job kind of a run (PD.6): the caller chooses it once (the start screen's card), and the
 * profile id carries it from then on. Nothing here looks at a mesh.
 *
 * NO SILENT FALLBACK (docs/TYPE-PIPELINE.md section 8a). An id neither family knows used to run as an ALIGNER. With
 * saved types registered per realm (`src/dentalTypes/typesReady.ts`), an unknown id means a type this realm never
 * registered - running it down the aligner pipeline would hand a denture aligner numbers without a word. So an id
 * that is GIVEN but unknown throws, naming it; no id at all (`undefined`) still means the aligner flow. Old projects
 * with an unknown id are refused earlier, at load (`project.ts`, `dentureState.ts`).
 */

/** The profile a denture job starts with: the vendored reference denture (`profiles/reference-denture.json`). */
export const DENTURE_PROFILE_ID: string = defaultProfileId('denture');

/** The job kind of a profile id: `denture` or `aligner` by its family; `aligner` with no id; throws for an unknown id. */
export function jobKindOf(profileId: string | undefined): DentalKind {
  if (profileId === undefined) return 'aligner';
  const kind = kindOfProfile(profileId);
  if (!kind) throw new TypeError(`unknown dental profile '${profileId}': no built-in profile or saved type in types/ has this id`);
  return kind;
}

/** Whether the dental flow runs the denture pipeline for this profile id. */
export const isDentureJob = (profileId: string | undefined): boolean => jobKindOf(profileId) === 'denture';

/** The print-angle scan's step (degrees) of either family's profile: the dial snaps to it. */
export const tiltStepOf = (profileId: string): number =>
  (isDentureJob(profileId) ? dentureProfileData(profileId).pose.tiltStepDeg : profileData(profileId).pose.tiltStepDeg);
