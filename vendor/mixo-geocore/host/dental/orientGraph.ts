/*
 * ONE JOB: hand the engine the Orient graph (mixoDental docs/ORIENT-NODES.md U4/U5, engine 71) and read back what
 * each of its nodes made, for the review canvas to draw.
 *
 * Step 1 IS this graph. With none set the engine runs today's default (arch frame -> up decision -> upright pose),
 * so results are unchanged. A graph is validated when SET: one that cannot run is refused with the node named and
 * the previous graph stays in force - a run never fails halfway. One slot, like the zone graph: the caller sets it
 * before the jobs that should use it.
 */
import { dentalEngine, withDentalMesh } from './dentalEngine';
import type { TriangleMesh } from '../core/analysis/types';
import type { Vector } from '../core/vec3';

/** A graph the engine refused, with the node and reason in `detail`. */
export class OrientGraphRefused extends Error {
  constructor(readonly detail: string) {
    super(`The engine refused the Orient graph: ${detail}`);
    this.name = 'OrientGraphRefused';
  }
}

/** Make `graph` the Orient graph the next denture orientations evaluate, or `null` for today's. Returns the digest in force. */
export function setOrientGraph(graph: unknown): string {
  try {
    return dentalEngine().set_orient_graph(graph === null ? '' : JSON.stringify(graph));
  } catch (error) {
    const detail = (error as { detail?: unknown })?.detail;
    if ((error as Error)?.message === 'ORIENT_GRAPH_INVALID' && typeof detail === 'string') throw new OrientGraphRefused(detail);
    throw error;
  }
}

/** The digest of the Orient graph in force, or "default". */
export function orientGraphDigest(): string {
  return dentalEngine().orient_graph_digest();
}

/** What one node made. A region's faces are the FILE's face ids. */
export type OrientNodeValue =
  | { type: 'frame'; centroid: Vector; up: Vector; lean: Vector; across: Vector; decided: boolean }
  | { type: 'pose'; up: Vector; lean: Vector; across: Vector }
  | { type: 'region'; centroid: Vector; normal: Vector; areaMm2: number; protrusionMm: number; faces: number[] };

/** Every node of the graph in force on `mesh`, by id - or the engine's refusal code when the graph cannot orient it. */
export function orientNodes(mesh: TriangleMesh, profile: string): { nodes: Record<string, OrientNodeValue> } | { refused: string } {
  return withDentalMesh(mesh, (session, model) => JSON.parse(session.denture_orient_nodes(model, profile)));
}
