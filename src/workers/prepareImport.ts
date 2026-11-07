import type { TriangleMesh } from '@mixo-geocore/host/core/analysis/types';
import { assertTriangleCapacity, meshTier, TRIANGLE_BUDGET, type Runtime } from '@mixo-geocore/host/core/budget';
import type { ImportedMesh, RawMesh } from '../state/import';
import type { ImportDiagnosis } from '../state/diagnosis';
import type { PreparedMesh } from './importProtocol';
import { diagnoseMesh } from '@mixo-geocore/host/core/repairMesh';
import type { GeometryEngine } from '@mixo-geocore/host/workers/geometryClient';
import { nonFiniteError } from './stlSession';

export type Progress = (fraction: number, stage: string) => void;

/** Bulk glTF position transform and first-seen weld, preserving the existing import result. */
export function weldRawWithWasm(raw: RawMesh, engine: GeometryEngine): ImportedMesh {
  try {
    const result = engine.weld_positions_in_place(raw.positions, raw.indices ?? new Uint32Array(), new Float64Array(raw.matrix));
    try {
      return { name: raw.name, mesh: { positions: result.take_positions(), indices: result.take_indices() } };
    } finally {
      result.free();
    }
  } catch (error) {
    if ((error as { code?: string } | null)?.code === 'NON_FINITE') {
      throw nonFiniteError(raw.name);
    }
    throw error;
  }
}

/** The import worker uses this bulk WASM operation; no per-vertex JS/WASM calls. */
export function centerImportedWithWasm(item: ImportedMesh, engine: GeometryEngine): ImportedMesh {
  const data = engine.center_positions_in_place(item.mesh.positions);
  const triplet = (offset: number): [number, number, number] => [data[offset]!, data[offset + 1]!, data[offset + 2]!];
  return { ...item, centred: { center: triplet(0), bounds: { min: triplet(3), max: triplet(6) } } };
}

/** Keep only one Rust result copy; the full-resolution input remains the support/export source. */
export function decimateWithWasm(mesh: TriangleMesh, engine: Pick<GeometryEngine, 'decimate_display'>, maxTriangles: number): TriangleMesh {
  const result = engine.decimate_display(mesh.positions, mesh.indices, maxTriangles);
  try {
    return { positions: result.take_positions(), indices: result.take_indices() };
  } finally {
    result.free();
  }
}

/** Centre, check the size, simplify a heavy mesh for display. */
export function prepare(item: ImportedMesh, runtime: Runtime, progress: Progress, center: (item: ImportedMesh) => ImportedMesh, simplify: (mesh: TriangleMesh, maxTriangles: number) => TriangleMesh): PreparedMesh {
  const triangles = item.mesh.indices.length / 3;
  // Backstop for formats estimated (or not counted) before parsing.
  assertTriangleCapacity(item.name, triangles, runtime, true);
  const centred = center(item);
  let display: TriangleMesh | undefined;
  if (meshTier(triangles, runtime) === 'heavy') {
    progress(0.8, 'Simplifying display copy');
    display = simplify(centred.mesh, Math.floor(TRIANGLE_BUDGET[runtime] / 2));
  }
  return { ...centred, ...(display ? { display } : {}) };
}

/**
 * The mesh's health, read in the worker on the FULL-RESOLUTION mesh, after the weld.
 *
 * Here and not on the main thread: the worker already holds the full-resolution arrays and already
 * has a progress channel, so diagnosing here costs no copy across the boundary. `diagnose_mesh`
 * allocates no mesh of its own, which is why it is safe to run on every import; `repair_mesh` does
 * allocate one, which is why it runs only when the operator asks.
 *
 * The display copy is never diagnosed: it is a decimation, so its topology is not the file's.
 */
/*
 * The decoder keeps its engine type private, so take it from the function rather than restate a shape
 * that would then drift. NOT narrowed to `Pick<…, 'diagnose_mesh'>` even though that is all this uses:
 * the vendored `diagnoseMesh` asks for the whole engine, and casting around a vendored signature to
 * make a tidier parameter here is how a cast becomes a lie later.
 */
type DiagnoseEngine = Parameters<typeof diagnoseMesh>[0];

export function diagnoseImported(mesh: TriangleMesh, engine: DiagnoseEngine): ImportDiagnosis {
  const report = diagnoseMesh(engine, mesh.positions, mesh.indices);
  const rims = report.bodies.flatMap((body) => body.loopLengthsMm);
  return {
    watertight: report.watertight,
    boundaryLoops: report.boundaryLoops,
    longestRimMm: rims.length > 0 ? Math.max(...rims) : 0,
    nonManifoldEdges: report.nonManifoldEdges,
    windingConsistent: report.windingConsistent,
    triangles: report.triangles,
    bodyCount: report.bodies.length,
  };
}

/** Every buffer of the prepared meshes, each once, to transfer. */
export function buffers(prepared: PreparedMesh[]): Transferable[] {
  return prepared.flatMap(({ mesh, display, pickIndex }) => [
    mesh.positions.buffer,
    mesh.indices.buffer,
    ...(display ? [display.positions.buffer, display.indices.buffer] : []),
    ...(pickIndex ? [pickIndex.bounds.buffer, pickIndex.links.buffer, pickIndex.order.buffer] : []),
  ]);
}

