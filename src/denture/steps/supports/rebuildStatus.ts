import type { PrintUnit } from '../../../state/project';
import type { DentureMesh } from '../../engine/dentureCore';

/*
 * The status line of a resolve that waits for its rebuild (Step 2, Round D). A bubble click or "Resolve all" puts points on the
 * allow list and says "…Rebuilding the supports…"; the rebuild runs by itself once the scene changed. This module turns the line
 * into a finished one when THAT rebuild lands: the build of the unit as it is after the allow (not the unit the allow replaced,
 * not a build a newer edit already outdated), read against the build's own unresolved report. The engine's reasons stay in
 * English for the batch, so the line points at the bubble for why a point is still open.
 */

/** A status line as `setStatus` takes it. */
export interface StatusLine {
  key: string;
  vars?: Record<string, string | number>;
  other?: string;
}

/** A line that waits for the unit's next build: `before` is the unit the allow replaced, `finish` reads the landed build. */
export interface PendingRebuild {
  unitId: string;
  before: PrintUnit;
  /** The finished line, or undefined to keep the line already shown. */
  finish: (mesh: DentureMesh) => StatusLine | undefined;
}

/** Whether `unit`'s build is the one `pending` waits for: the same unit, changed by the allow, and still the scene's (`current`). */
export const awaitedBuild = (pending: PendingRebuild, unit: PrintUnit, current: PrintUnit | undefined): boolean =>
  pending.unitId === unit.id && unit !== pending.before && current === unit;

const still = (mesh: DentureMesh, ids: readonly string[]): number => ids.filter((id) => (mesh.unresolved ?? []).some((point) => point.id === id)).length;

/** The point is still in the rebuilt report. */
export const STILL_OPEN = 'Supports rebuilt. The point is still unresolved; its bubble says why.';

/** One point allowed by a click (a bare island or a lowest point with no tip yet): supported, or still open. */
export function pointFinish(id: string, island: boolean): PendingRebuild['finish'] {
  return (mesh) => (still(mesh, [id]) > 0 ? { key: STILL_OPEN }
    : { key: island ? 'Island supported from the model surface. Supports rebuilt.' : 'Lowest point supported from the model surface. Supports rebuilt.' });
}

/** A left-out tip whose landing the edit path already found (its tier line is shown): that line stays unless the rebuild still lists it. */
export function landedFinish(id: string): PendingRebuild['finish'] {
  return (mesh) => (still(mesh, [id]) > 0 ? { key: STILL_OPEN } : undefined);
}

/** "Resolve all": how many of the allowed points the rebuild still lists. */
export function allFinish(ids: readonly string[]): PendingRebuild['finish'] {
  return (mesh) => {
    const n = still(mesh, ids);
    return n === 0 ? { key: 'Supports rebuilt. Every allowed point is supported.' }
      : { key: 'Supports rebuilt. 1 allowed point is still unresolved; its bubble says why.', vars: { n }, other: 'Supports rebuilt. {n} allowed points are still unresolved; their bubbles say why.' };
  };
}

/** Every sentence a finished line can use (the i18n test checks each has a translation). */
export const REBUILD_STATUS_KEYS: readonly string[] = [
  STILL_OPEN,
  'Island supported from the model surface. Supports rebuilt.',
  'Lowest point supported from the model surface. Supports rebuilt.',
  'Supports rebuilt. Every allowed point is supported.',
  'Supports rebuilt. 1 allowed point is still unresolved; its bubble says why.',
  'Supports rebuilt. {n} allowed points are still unresolved; their bubbles say why.',
];
