import { resolve, type CommandId, type UiState } from '@mixo-geocore/editing/commands';
import type { GeneratedSupportMesh } from '@mixo-geocore/host/core/supports/mesh';
import { plural, t } from '../../../i18n';
import { CommandButton } from '../../../components/CommandButton';
import { isResolvable } from './resolvePoint';

/**
 * Denture Step 2's unresolved-points block (Round C): how many points have no support from the plate (each shows a
 * bubble on the model; a click supports it from the model surface), how many islands need a support by hand, how
 * many supports stand on the model surface, and "Resolve all" (registry command `denture.resolveAll`). Input: `mesh`,
 * the unit's current build (absent while it builds); `ui` and `run` as for every command button.
 */
export function ResolveSection({ mesh, ui, run }: { mesh: Pick<GeneratedSupportMesh, 'unresolved' | 'modelLanded'> | undefined; ui: UiState; run: (id: CommandId) => void }) {
  const points = mesh?.unresolved ?? [];
  const resolvable = points.filter(isResolvable).length;
  const islands = points.length - resolvable;
  const landed = mesh?.modelLanded?.length ?? 0;
  return <section className="dental-block denture-resolve" data-ui="denture-resolve" aria-label={t('Unresolved points')}>
    <h3>{t('Unresolved points')}</h3>
    {!mesh ? <p className="help" role="status">{t('Building supports…')}</p>
      : points.length === 0 ? <p className="help" data-ui="denture-resolve-none">{t('Every tip and island has a support.')}</p>
        : <>
          {resolvable > 0 ? <p className="edit-note" data-ui="denture-resolve-count">{plural(resolvable, '1 point has no route from the plate. Click its bubble to support it from the model surface.', '{n} points have no route from the plate. Click a bubble to support it from the model surface.')}</p> : null}
          {islands > 0 ? <p className="edit-note" data-ui="denture-resolve-islands">{plural(islands, '1 island has no support. Add one by hand.', '{n} islands have no support. Add them by hand.')}</p> : null}
        </>}
    {landed > 0 ? <p className="help" data-ui="denture-resolve-landed">{plural(landed, '1 support stands on the model surface (coloured dot).', '{n} supports stand on the model surface (coloured dots).')}</p> : null}
    <CommandButton command={resolve('denture.resolveAll', ui)} run={run} uiName="denture-resolve-all" />
  </section>;
}
