import type { UnresolvedPoint } from '@mixo-geocore/host/core/supports/mesh';
import type { PrintUnit, SceneCommand } from '../../../state/project';
import { isUnreachedLow } from '../../../supports/unresolved/unresolvedText';

/*
 * "Support from the model surface" for unresolved points (Round C bubble): the point's id joins the unit's
 * denture policy allow list (`modelLandingAllow`), so the next build tries the plate first, then lands that tip
 * on the model (allowed area, other surface, no-support zone). One scene command: Undo and Redo of the scene
 * history take it back and forth, and the rebuild follows by itself (a build is a pure function of the unit).
 *
 * An island with no tip of its own (`island-<vertex>`) is not resolvable here: the engine's allow list (engine 53)
 * admits tip ids and unplaced lowest points (`denture-low-unreached-*`), not island ids.
 */

/** Whether a click can resolve the point (any left-out tip or lowest point; not a bare island). */
export const isResolvable = (point: Pick<UnresolvedPoint, 'id' | 'kind'>): boolean => point.kind !== 'island' && !point.id.startsWith('island-');

/**
 * Whether the edit-path check (`reroute_support` with `allowModelLanding`) runs before the point is allowed. A lowest point
 * with no tip yet (`denture-low-unreached-*`) has no tip to re-route: it goes on the list and the build places it.
 */
export const checksLandingFirst = (point: Pick<UnresolvedPoint, 'id'>): boolean => !isUnreachedLow(point.id);

/** The command that allows `ids` to land on the model, or undefined when the unit is no denture or every id is already allowed. */
export function resolveCommand(unit: Pick<PrintUnit, 'id' | 'denture'>, ids: readonly string[]): SceneCommand | undefined {
  if (!unit.denture) return undefined;
  const allowed = unit.denture.policy.modelLandingAllow ?? [];
  const added = ids.filter((id, k) => !allowed.includes(id) && ids.indexOf(id) === k);
  if (added.length === 0) return undefined;
  return { type: 'denture/set', unitId: unit.id, denture: { ...unit.denture, policy: { ...unit.denture.policy, modelLandingAllow: [...allowed, ...added] } } };
}

/** The points "Resolve all" allows: every resolvable point of the build, in report order. */
export const resolvableIds = (points: readonly Pick<UnresolvedPoint, 'id' | 'kind'>[]): string[] => points.filter(isResolvable).map((point) => point.id);
