// Ported from mixodental src/workers/geometryVersion.ts. The version is bumped with every ABI change
// (9 at the port, 10 since P5.14, 11 with the repair budget, 12: STL import drops weld-collapsed
// triangles, now 13: Step 1 orientation by the trim - the orient result carries the arch kind and the
// up/down cross-check, the rim scalars its front (22 values), and `diagnose_orientation` exists).

/** Must equal the Rust `engine_version()`; both change together on any ABI change. */
export const HOST_GEOMETRY_VERSION = 13;

/** Thrown when the loaded engine's `engine_version()` is not `HOST_GEOMETRY_VERSION` (code 'geometry-version-mismatch'). */
export class GeometryVersionMismatch extends Error {
  /** @param {number} actual */
  constructor(actual) {
    super(`Geometry core schema ${actual} does not match host schema ${HOST_GEOMETRY_VERSION}`);
    this.name = 'GeometryVersionMismatch';
    this.code = 'geometry-version-mismatch';
    this.actual = actual;
  }
}

/** @param {number} actual */
/** Throws `GeometryVersionMismatch` unless `actual` equals `HOST_GEOMETRY_VERSION`. */
export function assertGeometryVersion(actual) {
  if (actual !== HOST_GEOMETRY_VERSION) throw new GeometryVersionMismatch(actual);
}

/**
 * Awaits `ready()` (the realm's engine load), then runs `work`, so a worker never calls the
 * engine before it is loaded. meshWorker wraps every engine task (all but `forget`) in it.
 *
 * @template T
 * @param {() => Promise<unknown>} ready
 * @param {() => T | Promise<T>} work
 * @returns {Promise<T>}
 */
export async function runAfterGeometryReady(ready, work) {
  await ready();
  return work();
}
