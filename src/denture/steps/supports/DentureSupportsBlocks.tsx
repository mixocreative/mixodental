import type { CommandId, UiState } from '@mixo-geocore/editing/commands';
import type { DentureMesh } from '../../engine/dentureCore';
import { DentureSettingsSection } from '../../settings/DentureSettingsSection';
import { DEFAULT_DENTURE_OPTIONS, type DentureOptions } from '../../settings/dentureOptions';
import { ResolveSection } from './ResolveSection';
import { PartsList } from '../../parts/PartsList';

/**
 * The denture blocks of the shared supports panel (Step 2), in order: unresolved points with Resolve all, the parts
 * of a multi-part file, then the denture settings. Inputs: `mesh`, the current build (absent while it builds); `options`, the unit's denture settings
 * (absent: the defaults) and `onOptions`; `ui` and `run` for the command buttons.
 */
export function DentureSupportsBlocks({ mesh, options, onOptions, ui, run }: {
  mesh: DentureMesh | undefined;
  options: Readonly<DentureOptions> | undefined;
  onOptions: (options: DentureOptions) => void;
  ui: UiState;
  run: (id: CommandId) => void;
}) {
  return <>
    <ResolveSection mesh={mesh} ui={ui} run={run} />
    <PartsList parts={mesh?.dentureParts} />
    <DentureSettingsSection options={options ?? DEFAULT_DENTURE_OPTIONS} onChange={onOptions} />
  </>;
}
