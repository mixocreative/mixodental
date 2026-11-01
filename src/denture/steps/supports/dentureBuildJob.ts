import type { GenerateRules } from '@mixo-geocore/host/supports/generateRules';
import { DEFAULT_DENTAL_LABEL } from '@mixo-geocore/host/dental/label';
import { generationPlate, generationTransform, resolveSettings } from '@mixo-geocore/host/supports/unitSupports';
import type { PrintUnit } from '../../../state/project';
import type { DentureJob } from '../../engine/dentureCore';

/*
 * A denture unit as a denture build job (the denture counterpart of the shared `supportJobOf`): its model, its
 * stored policy, the generation frame and plate its supports were accepted at, its settings and rules, and its
 * hand work. Pure: the same unit gives the same job, so a rebuild with the old inputs is an exact undo.
 */
export function dentureJobOf(unit: PrintUnit, mode: 'preview' | 'export', rules: GenerateRules, revision?: number): DentureJob | undefined {
  if (!unit.denture || !unit.supports) return undefined;
  const settings = resolveSettings(unit.settings);
  return {
    mesh: unit.source,
    policy: unit.denture.policy,
    frame: generationTransform(unit),
    plateY: generationPlate(unit),
    settings,
    rules,
    hand: { manual: unit.manual, deleted: unit.deleted, zones: unit.zones, contactSettings: unit.contactSettings },
    labelText: settings.labelText || DEFAULT_DENTAL_LABEL,
    mode,
    ...(revision === undefined ? {} : { revision }),
  };
}
