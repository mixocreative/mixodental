import { defaultDentalTuning } from '@mixo-geocore/host/dental/tuning';

/** The review renders the reference aligner fixture with its own aligner profile and default strip. */
export const REFERENCE_PROFILE = 'reference-aligner';
export const referenceTuning = defaultDentalTuning(REFERENCE_PROFILE);
