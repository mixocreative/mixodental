import type { TriangleMesh } from '@mixo-geocore/host/core/analysis/types';
import type { Runtime } from '@mixo-geocore/host/core/budget';
import type { ImportedMesh, RawMesh } from '../state/import';
import type { PickIndexData } from './pickIndexes';

export type ImportTask =
  /** An STL file, read by the worker slice by slice (a File crosses to the worker without a copy). */
  | { kind: 'stl'; name: string; file: Blob; runtime: Runtime }
  /** glTF meshes already parsed on the main thread (GLTFLoader needs it), to weld. */
  | { kind: 'weld'; meshes: RawMesh[]; runtime: Runtime };

/** A welded, centred mesh with what the viewport needs: when heavy, a display copy. */
/**
 * WHAT THE WORKER SAYS ABOUT A MESH'S HEALTH - the verdict, not the report.
 *
 * `diagnose_mesh` returns a per-body report with an array of rim lengths per body. None of that
 * crosses the boundary: the Items row needs five facts, so five facts travel. Plain numbers and
 * booleans, so it structured-clones with no transfer list.
 *
 * `watertight` is NOT "no holes": a mesh with non-manifold edges and no open rim at all is not
 * watertight, and `scripts/measure-rim-loops.mjs` found exactly that on 8 of the 18 real scans. Both
 * fields are here because the row has to tell those two apart.
 */
export interface ImportDiagnosis {
  /** Every body closed. False for an open rim OR for non-manifold geometry. */
  watertight: boolean;
  boundaryLoops: number;
  /** Longest open rim in mm, 0 when there is none. The measurement a fill limit is chosen from. */
  longestRimMm: number;
  nonManifoldEdges: number;
  windingConsistent: boolean;
  /** Physical bodies the engine separated: a plate of fragments reports many. */
  bodies: number;
}

export interface PreparedMesh extends ImportedMesh {
  /** The worker's health verdict for the FULL-RESOLUTION mesh (never the display copy). */
  diagnosis?: ImportDiagnosis;
  /** Simplified copy to draw (heavy tier only). */
  display?: TriangleMesh;
  /** Rust pick index of the mesh that is drawn (the display copy when there is one), built here so the first click does not build it. */
  pickIndex?: PickIndexData;
}
