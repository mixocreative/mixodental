/*
 * ONE JOB: register a denture type's whole profile with the engine AND the host, together, or neither.
 *
 * The workbench saves a type as one profile text (mixoDental docs/TYPE-PIPELINE.md). The engine has to
 * know it to run it, and the host has to know it to route it: `kindOfProfile` is what keeps a denture
 * id off the aligner path. So the order is fixed - the host parses (the same strict parser as the
 * built-ins), the engine registers (and may refuse), and only then does the host list change. A
 * registration the engine refuses leaves both exactly as they were.
 */
import { dentalEngine } from './dentalEngine';
import { keepRegisteredAlignerProfile, parseAlignerProfile, type AlignerProfileData } from './alignerProfiles';
import { keepRegisteredDentureProfile, parseDentureProfile, type DentureProfileData } from './dentureProfiles';

/** A profile the engine refused, with the problem in `detail`. */
export class ProfileRefused extends Error {
  constructor(readonly detail: string) {
    super(`The engine refused the profile: ${detail}`); // denture or aligner: the detail names which
    this.name = 'ProfileRefused';
  }
}

/**
 * Register the denture profile in `text` (its whole JSON) and return its data. Throws `TypeError` when
 * the host's parser refuses it, `ProfileRefused` naming the problem when the engine does.
 */
export function registerDentureProfile(text: string): DentureProfileData {
  const profile = parseDentureProfile(JSON.parse(text), 'registered profile');
  engineRegisters(() => dentalEngine().register_denture_profile(text));
  keepRegisteredDentureProfile(profile);
  return profile;
}

/** The same for an aligner profile: engine first, then the host lists `kindOfProfile` reads. */
export function registerAlignerProfile(text: string): AlignerProfileData {
  const profile = parseAlignerProfile(JSON.parse(text), 'registered profile');
  engineRegisters(() => dentalEngine().register_aligner_profile(text));
  keepRegisteredAlignerProfile(profile);
  return profile;
}

/** Run the engine's registration, turning its `PROFILE_INVALID` into `ProfileRefused` with the detail. */
function engineRegisters(call: () => string): void {
  try {
    call();
  } catch (error) {
    const detail = (error as { detail?: unknown })?.detail;
    if ((error as Error)?.message === 'PROFILE_INVALID' && typeof detail === 'string') throw new ProfileRefused(detail);
    throw error;
  }
}
