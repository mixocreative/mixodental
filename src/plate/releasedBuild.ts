// Copyright (c) Mixo Creative.

import type { GeneratedSupportMesh } from '@mixo-geocore/host/core/supports/mesh';
import { currentBuild, type BuiltSupports, type UnitBuild } from '@mixo-geocore/host/supports/unitSupports';
import type { PrintUnit } from '../state/project';

/**
 * RELEASING A FINISHED BUILD'S GEOMETRY, keeping the few facts the plate still needs.
 *
 * A generated support mesh is the largest thing the app holds per unit: positions, indices, parts and
 * components. Once a unit is finished and exported, nothing draws those again — but the plate still
 * has to pack around its outline, and the check list still has to know which contacts the build left
 * out. So the geometry goes and three fields stay.
 *
 * THIS IS WHAT MAKES A DECK OF N ROWS AFFORDABLE. One inspect page is open at a time, so one unit
 * needs its geometry; the other N-1 are finished work whose meshes are dead weight. Without this,
 * a case of eight holds eight support meshes for the whole session.
 *
 * WHAT THE PLAN GOT WRONG, twice, and why this file is small:
 *
 * The plan said the map's value had to become a discriminated union because "five consumers need full
 * meshes". Traced against the code, three of them merely DECLARE `GeneratedSupportMesh` while reading
 * only small fields — `plateLayout` reads `footprint` and nothing else, `usePlateArrange` forwards the
 * map without reading it, `useExport` passes through to `planExport` whose own parameter is
 * `BuiltSupports` — one compares identity, and the fifth, `src/viewport/types.ts`, does not exist.
 * The single real geometry reader is the active unit's mesh in `App.tsx`.
 *
 * It also said this needed `UnitBuild` to be widened. `UnitBuild<T extends BuiltSupports>` was already
 * generic, so there was no machinery to add.
 */

/** What a released build keeps: the dropped lists the check list reads, and the outline the plate packs by. */
export type KeptBuild = Pick<GeneratedSupportMesh, 'dropped' | 'droppedByZones' | 'footprint'>;

/** A build the app holds: either its full geometry, or the kept facts of a released one. */
export type HeldBuild = GeneratedSupportMesh | KeptBuild;

/**
 * Whether this build still carries geometry. Keyed on `positions`, which only a real mesh has — not on
 * a flag, because a flag can be set wrongly while the arrays are still there, and then the type says
 * one thing and the memory another.
 */
export const hasGeometry = (mesh: HeldBuild | undefined): mesh is GeneratedSupportMesh =>
  mesh !== undefined && 'positions' in mesh;

/**
 * The released form of a build. Idempotent: releasing a released build returns it unchanged rather
 * than rebuilding an equal object, so a map updated with the result is reference-equal and React does
 * not re-render on a no-op.
 *
 * `footprint` and `droppedByZones` are copied only when present: writing `footprint: undefined` would
 * make `'footprint' in mesh` true for a build that never had one, and `plateFootprints` keys on the
 * value's length rather than the key, but a reader that checks the key would be misled.
 */
export function releaseBuild(build: UnitBuild<HeldBuild>): UnitBuild<KeptBuild> {
  const { mesh } = build;
  if (!hasGeometry(mesh)) return build as UnitBuild<KeptBuild>;
  return {
    unit: build.unit,
    mesh: {
      dropped: mesh.dropped,
      ...(mesh.droppedByZones === undefined ? {} : { droppedByZones: mesh.droppedByZones }),
      ...(mesh.footprint === undefined ? {} : { footprint: mesh.footprint }),
    },
  };
}

/**
 * Release every build whose unit is finished, keeping the one named by `keep` — the unit being looked
 * at, which still needs its geometry drawn. Returns the same map when nothing changed.
 */
export function releaseFinished(
  built: ReadonlyMap<string, UnitBuild<HeldBuild>>,
  finished: readonly string[],
  keep: readonly (string | undefined)[],
): ReadonlyMap<string, UnitBuild<HeldBuild>> {
  let next: Map<string, UnitBuild<HeldBuild>> | undefined;
  for (const id of finished) {
    // KEEP IS A LIST, not one id, and that is the fix for a real bug. `exportedDental` marks a unit
    // finished WITHOUT leaving review, so the unit being looked at is finished and on screen. With
    // only `activeUnitId` kept, a click on empty space cleared the selection, the on-screen unit was
    // released, and its supports vanished while the operator was looking at them - and with one
    // aligner and no deck, that is the ordinary case rather than an edge.
    if (keep.includes(id)) continue;
    const build = built.get(id);
    if (!build || !hasGeometry(build.mesh)) continue;
    next ??= new Map(built);
    next.set(id, releaseBuild(build));
  }
  return next ?? built;
}

/**
 * THE CURRENT BUILD'S GEOMETRY, or undefined — the one function both the support check and its
 * staleness test must use.
 *
 * They used to disagree. The check narrowed a released build to `undefined` and recorded that; the
 * staleness test compared that record against `currentBuild(...)`, which returns the **truthy**
 * `KeptBuild` because releasing preserves the unit reference. `undefined !== KeptBuild` is always
 * true, so a released unit was permanently stale — and `problems` is in the effect's own dependency
 * list, so every completed check scheduled another one. A worker check every 600 ms, forever.
 *
 * Two readers asking the same question in two different ways is how that happened, so there is now
 * one way to ask it.
 */
export function builtGeometry(
  unit: PrintUnit,
  entry: UnitBuild<HeldBuild> | undefined,
): GeneratedSupportMesh | undefined {
  const current = currentBuild(unit, entry);
  return hasGeometry(current) ? current : undefined;
}

/** Bytes of mesh a build is holding, for the memory note. 0 once released. */
export const buildBytes = (mesh: HeldBuild | undefined): number =>
  (hasGeometry(mesh) ? mesh.positions.byteLength + mesh.indices.byteLength : 0);

export type { BuiltSupports };
