// Copyright (c) Mixo Creative.
//
// ONE TYPE, ITS OWN FILE, and the reason is the shape of the dependency graph rather than taste.
// The verdict is produced in `src/workers/`, persisted on `PrintUnit` in `src/state/project.ts`,
// read by `src/items/rowState.ts`, and carried onto the unit by `src/state/import.ts`, which already
// imports from `project.ts`. Declaring it in `project.ts` would pull the whole scene module into the
// import worker's bundle; declaring it in `import.ts` would make `project.ts` import back from a
// module that imports it. A leaf is the only home with neither problem.

import type { RepairReport } from '@mixo-geocore/host/core/repairMesh';

/**
 * WHAT THE WORKER SAYS ABOUT A MESH'S HEALTH: the verdict, not the report.
 *
 * `diagnose_mesh` returns a `RepairReport` whose `bodies` is a per-body array carrying each body's
 * rim lengths. None of that crosses the worker boundary. The Items row needs these six facts, so six
 * facts travel: all plain numbers and booleans, so the verdict structured-clones with no transfer
 * list and is small enough to save on the unit it describes.
 *
 * FOUR OF THEM ARE PICKED FROM THE VENDORED REPORT rather than re-declared. The first version of
 * this file spelled them out again, and `noDuplicatePackages.test.ts` refused it: it shared 57 % of
 * its lines with `host/core/repairMesh.ts`. Picking them means the engine owns their meaning and
 * their doc comments, and a rename or a retype on that side breaks the build here instead of
 * quietly leaving a second definition behind.
 *
 * `triangles` is here to make the verdict SELF-CHECKING rather than for display. It is saved on the
 * unit, and a saved verdict that outlived the mesh it describes would have a row state "Clean" about
 * geometry it never saw. Nothing replaces a unit's `source` in the build as it stands, so the only
 * way to go stale is a future change - and step 9's repair is exactly that change. Carrying the count
 * lets `normalizeUnit` compare the verdict against the mesh it is attached to and drop a mismatch,
 * so the invariant is checked rather than remembered.
 *
 * `watertight` is NOT "no holes": a mesh with non-manifold edges and no open rim at all is not
 * watertight, and `scripts/measure-rim-loops.mjs` found exactly that on 8 of the 18 real scans. Both
 * fields are here because the row has to tell those two apart.
 */
export interface ImportDiagnosis
  extends Pick<RepairReport, 'triangles' | 'watertight' | 'boundaryLoops' | 'nonManifoldEdges' | 'windingConsistent'> {
  /** Longest open rim in mm, 0 when there is none: the longest `loopLengthsMm` across every body. */
  longestRimMm: number;
  /**
   * How many physical bodies the engine separated; a plate of fragments reports many. Named for the
   * count because the report's own `bodies` is the array this reduces away.
   */
  bodyCount: number;
}
