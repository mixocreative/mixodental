import { defaultSupportSettings, type LiveSupportSettings } from '@mixo-geocore/host/core/supports/settings';
import { dentureProfileData, dentureSupportPreset } from '@mixo-geocore/host/dental/dentureProfiles';

/*
 * The support settings a denture is built with: the engine defaults, then the preset of the denture profile
 * (thin tapered contact, pillar, lattice braces, raft, lift), as the batch review builds it. A unit that is
 * already a denture of this profile keeps the values the operator set.
 */

/** The profile's settings for a new denture unit; `labelText` (the ID label) is kept from `current`. */
export function dentureSupportSettings(profileId: string, current: Readonly<LiveSupportSettings> = defaultSupportSettings as LiveSupportSettings): LiveSupportSettings {
  return { ...defaultSupportSettings, roofSeededModes: [], ...dentureSupportPreset(dentureProfileData(profileId)), contactShape: 'NONE', labelText: current.labelText };
}
