// Copyright (c) Mixo Creative.

import type { GeneratedSupportMesh } from '@mixo-geocore/host/core/supports/mesh';
import type { UnitBuild } from '@mixo-geocore/host/supports/unitSupports';
import type { PrintUnit } from '../state/project';
import { hasGeometry, type HeldBuild } from './releasedBuild';

/**
 * WHAT THE APP READS OFF THE SUPPORT BUILDS — every question that is a pure function of the build
 * map and one unit, and nothing else.
 *
 * These lived as inline `useMemo`s and nested ternaries in `App.tsx`. They are here because none of
 * them needs React: given the same map and the same unit they give the same answer, so they can be
 * tested directly, which is the whole reason for the move. The map itself STAYS in `App.tsx` — it has
 * thirty-odd read sites there and three hooks already take it as input, so it is a hub rather than a
 * job, and wrapping it in a module would hand back almost everything it was handed.
 *
 * The companion file is `releasedBuild.ts`: it decides what a build KEEPS when its geometry is freed,
 * and this one decides what the app can SAY about a build it holds. Both turn on `hasGeometry`.
 */

/** A rim measured and found wanting, or a rim that could not be measured at all. */
export type RimGap = { outerMm: number; openingMm: number } | 'unavailable';

/**
 * The unit's build has finished, or failed, FOR THE UNIT AS IT IS NOW.
 *
 * Both halves compare unit identity, not id: a unit edited since its build landed is a different
 * object under the same id, so it reads as unsettled and its counts go back to waiting. That is the
 * point — an id match would call a stale build current.
 */
export const isSettled = (
  built: ReadonlyMap<string, UnitBuild<HeldBuild>>,
  failedBuilds: ReadonlyMap<string, PrintUnit>,
  unit: PrintUnit,
): boolean => built.get(unit.id)?.unit === unit || failedBuilds.get(unit.id) === unit;

/**
 * The unit changed since the supports on screen were built, so its counts are still coming.
 *
 * `unit.supports !== undefined` first: a unit that has never asked for supports is not "building",
 * it simply has none, and without that test every plain imported object would report as busy.
 */
export const isBuilding = (
  built: ReadonlyMap<string, UnitBuild<HeldBuild>>,
  failedBuilds: ReadonlyMap<string, PrintUnit>,
  unit: PrintUnit,
): boolean => unit.supports !== undefined && !isSettled(built, failedBuilds, unit);

/**
 * THE BUILDS THAT STILL CARRY GEOMETRY. A released build (its unit finished, geometry freed —
 * `releasedBuild.ts`) is absent here, so a finished unit draws no supports: that is what releasing
 * MEANS, and it is a visible change rather than a no-op. Its outline survives in `built`, which is
 * what the plate packs by.
 */
export function withGeometry(
  built: ReadonlyMap<string, UnitBuild<HeldBuild>>,
): ReadonlyMap<string, UnitBuild<GeneratedSupportMesh>> {
  const out = new Map<string, UnitBuild<GeneratedSupportMesh>>();
  for (const [id, entry] of built) if (hasGeometry(entry.mesh)) out.set(id, { unit: entry.unit, mesh: entry.mesh });
  return out;
}

/** Just the meshes of `withGeometry`, which is what the viewport draws per unit. */
export const meshesOf = (
  held: ReadonlyMap<string, UnitBuild<GeneratedSupportMesh>>,
): ReadonlyMap<string, GeneratedSupportMesh> =>
  new Map([...held].map(([id, entry]) => [id, entry.mesh]));

/**
 * THE DENTAL RIM VERDICT for the unit under review: a measured gap, nothing to say, or "could not
 * measure". Step 3's review notes are the only reader (`components/DentalReviewBlocks.tsx`).
 *
 * TWO DIFFERENT SITUATIONS RETURN `undefined`, deliberately:
 *   - there is no verdict to give yet (not a two-contour aligner, or the build on hand belongs to an
 *     older version of this unit), and
 *   - the rim WAS measured and is fine.
 * Both mean "print no rim note", which is the right outcome for each, so collapsing them loses
 * nothing a reader could act on. The third outcome is the one that must stay distinct: `'unavailable'`
 * says the coverage was never computed — a released build, or a mesh built before the rim pass — and
 * the note then tells the operator to look at the rim themselves rather than implying it passed.
 * Silence and "I could not check" are not the same sentence.
 */
export function rimGap(
  unit: PrintUnit | undefined,
  entry: UnitBuild<HeldBuild> | undefined,
): RimGap | undefined {
  if (unit?.dental?.kind !== 'two-contour') return undefined;
  // The build must be of THIS version of the unit; an older build's rim says nothing about this one.
  if (entry?.unit !== unit) return undefined;
  const coverage = hasGeometry(entry.mesh) ? entry.mesh.dentalRimCoverage : undefined;
  if (coverage?.needsReview) return { outerMm: coverage.outer.maxGapMm, openingMm: coverage.opening.maxGapMm };
  return coverage ? undefined : 'unavailable';
}
