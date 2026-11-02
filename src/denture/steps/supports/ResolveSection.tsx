import type { GeneratedSupportMesh } from '@mixo-geocore/host/core/supports/mesh';
import { plural, t } from '../../../i18n';
import { isResolvable } from './resolvePoint';

/**
 * Denture Step 2's unresolved-points block, under Details (Round C, islands since Round D, folded in P7c): how many points
 * have no support from the plate (tips, lowest points and islands; each shows a bubble on the model, a click supports it
 * from the model surface), how many islands no tip can stand on (the lowest point faces sideways), and how many supports
 * stand on the model surface. Fix (registry command `denture.resolveAll`) sits on the step's status line
 * (`DentureReviewPanel`). Input: `mesh`, the unit's current build (absent while it builds).
 */
export function ResolveSection({ mesh }: { mesh: Pick<GeneratedSupportMesh, 'unresolved' | 'modelLanded'> | undefined }) {
  const points = mesh?.unresolved ?? [];
  const { resolvable, refused } = unresolvedCounts(mesh);
  const landed = mesh?.modelLanded?.length ?? 0;
  return <section className="dental-block denture-resolve" data-ui="denture-resolve" aria-label={t('Unresolved points')}>
    <h3>{t('Unresolved points')}</h3>
    {!mesh ? <p className="help" role="status">{t('Building supports…')}</p>
      : points.length === 0 ? <p className="help" data-ui="denture-resolve-none">{t('Every tip and island has a support.')}</p>
        : <>
          {resolvable > 0 ? <p className="edit-note" data-ui="denture-resolve-count">{plural(resolvable, '1 point has no route from the plate. Click its bubble to support it from the model surface.', '{n} points have no route from the plate. Click a bubble to support it from the model surface.')}</p> : null}
          {refused > 0 ? <p className="edit-note" data-ui="denture-resolve-islands-sideways">{plural(refused, '1 island faces sideways: no support tip can stand on it.', '{n} islands face sideways: no support tip can stand on them.')}</p> : null}
        </>}
    {landed > 0 ? <p className="help" data-ui="denture-resolve-landed">{plural(landed, '1 support stands on the model surface (coloured dot).', '{n} supports stand on the model surface (coloured dots).')}</p> : null}
  </section>;
}

/** The unresolved points of `mesh` a click supports (`resolvable`) and the islands no tip can stand on (`refused`). */
export function unresolvedCounts(mesh: Pick<GeneratedSupportMesh, 'unresolved'> | undefined): { resolvable: number; refused: number } {
  const points = mesh?.unresolved ?? [];
  const resolvable = points.filter(isResolvable).length;
  return { resolvable, refused: points.length - resolvable };
}
