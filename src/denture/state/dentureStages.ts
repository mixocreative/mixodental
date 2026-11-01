import type { DentalStage } from '../../dental/editingMode';
import { isDentureJob } from '../jobKind';

/*
 * The denture job's steps inside the dental mode: Step 1 is the shared orientation stage (`aligner`), Step 2 is
 * the shared supports stage (`review`). A denture has no support-area step, so Next from Step 1 and Back from
 * Step 2 skip `area`. The aligner flow keeps all three.
 */

/** The stage Next leads to from the orientation step. */
export const stageAfterOrientation = (profileId: string | undefined): DentalStage => (isDentureJob(profileId) ? 'review' : 'area');

/** The stage Back leads to from the supports step. */
export const stageBeforeSupports = (profileId: string | undefined): DentalStage => (isDentureJob(profileId) ? 'aligner' : 'area');
