import { profileById } from '@mixo-geocore/host/dental/alignerProfiles';
import { dentureProfileData } from '@mixo-geocore/host/dental/dentureProfiles';
import type { Lang } from '../../../i18n';
import { isDentureJob } from '../../jobKind';

/*
 * Step 1's badge words for either job kind (English keys; the caller translates): the step's JOB (its title,
 * "Print angle" - the badge adds "1 / 3" itself; owner 2026-11-21: a step number alone says nothing), the profile's
 * own name in `lang`, and the line asking for the file or for a look at the pose.
 */

export interface StepOneText {
  title: string;
  profileName: string | undefined;
  ready: string;
  waiting: string;
}

export function stepOneText(profileId: string | undefined, lang: Lang): StepOneText {
  if (isDentureJob(profileId)) {
    return { title: 'Print angle', profileName: dentureProfileData(profileId!).name[lang],
      ready: 'Review the print angle. Drag the dial: tips turn green with a path to the plate.', waiting: 'Add the denture STL.' };
  }
  return { title: 'Print angle', profileName: profileById(profileId)?.name[lang],
    ready: 'Review the orientation. Turn the aligner with the gizmo if needed.', waiting: 'Add the aligner STL.' };
}
