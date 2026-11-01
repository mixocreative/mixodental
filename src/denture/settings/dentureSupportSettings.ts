import { defaultSupportSettings, type LiveSupportSettings } from '@mixo-geocore/host/core/supports/settings';
import { dentureProfileData, dentureSupportPreset } from '@mixo-geocore/host/dental/dentureProfiles';

/*
 * The support settings a denture is built with: the engine defaults, then the preset of the denture profile
 * (thin tapered contact, pillar, lattice braces, lift), then the denture raft. A unit that is
 * already a denture of this profile keeps the values the operator set.
 */

/** The denture raft's slope, degrees from the plate (owner 2026-11-02). */
export const DENTURE_RAFT_EDGE_FROM_PLATE_DEG = 40;

/**
 * The denture raft (owner 2026-11-02): the classic SOLID raft, one 2 mm floor whose edge leans out 40 degrees from the
 * plate, no rim. The classic raft counts `raftWallAngle` from VERTICAL (default 30), so 40 from the plate is 50; its floor
 * edge flares by floor x tan(angle). A rim is built only above the floor, so a wall height equal to the floor builds none.
 * The grid raft (rule `raftGrid`) stays off.
 */
export const DENTURE_RAFT: Readonly<Pick<LiveSupportSettings, 'raftEnabled' | 'raftFloorThickness' | 'raftWallHeight' | 'raftWallAngle'>> = {
  raftEnabled: true,
  raftFloorThickness: 2,
  raftWallHeight: 2,
  raftWallAngle: 90 - DENTURE_RAFT_EDGE_FROM_PLATE_DEG,
};

/** The profile's settings for a new denture unit; `labelText` (the ID label) is kept from `current`. */
export function dentureSupportSettings(profileId: string, current: Readonly<LiveSupportSettings> = defaultSupportSettings as LiveSupportSettings): LiveSupportSettings {
  return { ...defaultSupportSettings, roofSeededModes: [], ...dentureSupportPreset(dentureProfileData(profileId)), contactShape: 'NONE', ...DENTURE_RAFT, labelText: current.labelText };
}
