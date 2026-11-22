import type { DenturePolicy } from '@mixo-geocore/host/dental/denturePolicy';
import { kindOfProfile, requireKind } from '@mixo-geocore/host/dental/dentalKind';
import { normalizeDentureOptions, type DentureOptions } from '../settings/dentureOptions';

/*
 * What a denture unit stores beside the shared unit fields (src/state/project.ts `PrintUnit.denture`): the
 * accepted denture policy (profile, lattice, the per-tip model-landing allow list) and its denture settings. Its tips live in the shared
 * `placement`, its generation frame in the shared `supports.data.transform`. Plain JSON, so it saves and undoes
 * like every other unit field.
 */

export interface DentureState {
  policy: DenturePolicy;
  /** The denture settings (absent: the defaults, `settings/dentureOptions.ts`). */
  options?: DentureOptions;
}

/** A saved or handed-in denture state, checked and copied (an unknown profile or a malformed list throws). */
export function normalizeDentureState(value: DentureState): DentureState {
  const { policy } = value;
  if (policy?.kind !== 'denture' || typeof policy.profileId !== 'string') throw new TypeError('denture state must name a denture profile');
  // A project made with a saved type whose file was later removed: name the file to restore (docs/TYPE-PIPELINE.md 8a;
  // the lasting fix is unit A2 - the project carries its own copy of the type).
  if (!kindOfProfile(policy.profileId)) throw new TypeError(`this project uses the denture type '${policy.profileId}', which this app does not have - restore types/denture/${policy.profileId}.type.json and rebuild`);
  if (requireKind(policy.profileId) !== 'denture') throw new TypeError('denture state must name a denture profile');
  if (typeof policy.lattice !== 'boolean') throw new TypeError('denture lattice must be true or false');
  const allow = policy.modelLandingAllow ?? [];
  if (!Array.isArray(allow) || allow.some((id) => typeof id !== 'string')) throw new TypeError('denture model-landing allow list must be tip ids');
  return {
    policy: { kind: 'denture', profileId: policy.profileId, lattice: policy.lattice, ...(allow.length > 0 ? { modelLandingAllow: [...new Set(allow)] } : {}) },
    ...(value.options === undefined ? {} : { options: normalizeDentureOptions(value.options) }),
  };
}
