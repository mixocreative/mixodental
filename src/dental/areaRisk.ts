import type { PlacementSettings, TriangleMesh } from '@mixo-geocore/host/core/analysis/types';
import type { JobTransform } from '@mixo-geocore/host/core/jobs';
import type { Vector } from '@mixo-geocore/host/core/vec3';
import { stampVertices } from '@mixo-geocore/host/core/supports/zones';
import { withDentalMesh } from '@mixo-geocore/host/dental/dentalEngine';
import type { DentalPolicy } from '@mixo-geocore/host/dental/dentalPolicy';
import { makeDentalPolicy, orientationOnly } from '@mixo-geocore/host/dental/placement';
import { geometryNow, type GeometryEngine } from '@mixo-geocore/host/workers/geometryClient';
import { placedPoints } from '@mixo-geocore/host/supports/unitSupports';
import { runPlacementJob } from '@mixo-geocore/host/supports/jobRunner';

/*
 * Risks outside the permitted dental area (PD.1): where an unsupported print would start.
 * The engine decides everything geometric (SHIP-PLAN rule 3): the generic placement with islands on
 * (`generic_place`) gives the lowest point of every downward overhang region and the faces of each
 * region; `dental_policy` gives the permitted faces (area, brush strokes, rules, as the build
 * reads them); `vertex_normals` and the brush-stamp rule give the disc. This file only picks: a
 * region's lowest island vertex whose faces are all outside the area is a risk. Display only: the
 * export never reads this.
 */

/** One low point outside the permitted area, with the faces of its overhang region that are within reach of it. */
export interface AreaRisk {
  /** Stable for the same spot: the position rounded to 0.01 mm. */
  id: string;
  /** Unit-local position of the low point. */
  position: Vector;
  /** The overhang region the point belongs to (placement order). */
  region: number;
  /** Face indices of the disc: faces of that region within the click reach of the point (source mesh faces). */
  faces: Uint32Array;
}

export interface AreaRiskJob {
  mesh: TriangleMesh;
  orientation: JobTransform;
  dental: DentalPolicy;
  settings: PlacementSettings;
  /** Disc radius in mm (the unit's click reach). */
  radius: number;
}

/** A low point: unit-local position and its height in the print frame (Y up). */
export interface LowPoint { position: Vector; height: number }

/** Island points of one region within this height of the region's lowest one are its lowest points. */
const LOWEST_BAND_MM = 0.1;
/** A low point and the mesh vertex it stands on agree to this, per axis. */
const SAME_VERTEX_MM = 1e-3;

/** One byte per face: 1 where the permitted area covers the face (Rust `dental_policy`, the area the build reads). */
export function permittedFaces(mesh: TriangleMesh, policy: DentalPolicy, orientation: JobTransform): Uint8Array {
  const faces = mesh.indices.length / 3;
  const mask = withDentalMesh(mesh, (session, model) => {
    const handle = makeDentalPolicy(session, model, policy, orientationOnly(orientation));
    try {
      return handle.permitted_faces().slice();
    } finally {
      handle.free();
    }
  });
  return mask.length === faces ? mask : new Uint8Array(faces);
}

/**
 * Which low points lie outside the permitted area: pure selection, given the engine's island points
 * (unit-local, with their print-frame height), the overhang regions' faces, the permitted-face mask and
 * the mesh's vertex normals. Per region only its lowest island points count; one is a risk when it
 * stands on a vertex none of whose faces is permitted. Its disc is the region's faces whose corners the
 * brush stamp of `radius` at that vertex covers.
 */
export function outsideLowPoints(mesh: TriangleMesh, lowPoints: readonly LowPoint[], regions: readonly { faceIndices: readonly number[] }[],
  permitted: Uint8Array, radius: number, normals: Float32Array): AreaRisk[] {
  // Vertices of the regions by 0.01 mm cell, so a low point finds its vertex without scanning every face.
  const cell = (value: number) => Math.round(value * 100);
  const byCell = new Map<string, { vertex: number; region: number }[]>();
  regions.forEach((region, id) => region.faceIndices.forEach((face) => {
    for (let k = 0; k < 3; k += 1) {
      const vertex = mesh.indices[face * 3 + k]!;
      const key = [0, 1, 2].map((axis) => cell(mesh.positions[vertex * 3 + axis]!)).join(',');
      const entries = byCell.get(key) ?? [];
      if (!entries.some((entry) => entry.vertex === vertex)) entries.push({ vertex, region: id });
      byCell.set(key, entries);
    }
  }));
  const found = lowPoints.flatMap(({ position, height }) => {
    const [cx, cy, cz] = position.map(cell) as [number, number, number];
    for (let dx = -1; dx <= 1; dx += 1) for (let dy = -1; dy <= 1; dy += 1) for (let dz = -1; dz <= 1; dz += 1) {
      for (const { vertex, region } of byCell.get(`${cx + dx},${cy + dy},${cz + dz}`) ?? []) {
        if ([0, 1, 2].every((axis) => Math.abs(mesh.positions[vertex * 3 + axis]! - position[axis]!) <= SAME_VERTEX_MM)) return [{ position, height, vertex, region }];
      }
    }
    return [];
  });
  const lowest = new Map<number, number>();
  for (const { region, height } of found) lowest.set(region, Math.min(lowest.get(region) ?? Infinity, height));
  const touching = new Map<number, number[]>();
  const risks: AreaRisk[] = [];
  const seen = new Set<string>();
  for (const { position, height, vertex, region } of found) {
    if (height > lowest.get(region)! + LOWEST_BAND_MM) continue;
    if (!touching.has(vertex)) {
      const faces: number[] = [];
      for (let corner = 0; corner < mesh.indices.length; corner += 1) if (mesh.indices[corner] === vertex) faces.push(Math.floor(corner / 3));
      touching.set(vertex, faces);
    }
    if (touching.get(vertex)!.some((face) => permitted[face])) continue;
    const id = position.map((value) => Math.round(value * 100)).join(',');
    if (seen.has(id)) continue;
    seen.add(id);
    const covered = new Uint8Array(mesh.positions.length / 3);
    stampVertices({ center: position, radius, normal: [normals[vertex * 3]!, normals[vertex * 3 + 1]!, normals[vertex * 3 + 2]!], kind: 'paint' },
      mesh.positions, normals, covered);
    const inRegion = new Set(regions[region]!.faceIndices);
    const faces = new Set([...touching.get(vertex)!.filter((face) => inRegion.has(face)),
      ...regions[region]!.faceIndices.filter((face) => [0, 1, 2].every((k) => covered[mesh.indices[face * 3 + k]!]))]);
    risks.push({ id, position, region, faces: Uint32Array.from(faces) });
  }
  return risks;
}

/**
 * The risks of one aligner (engine placement with islands on, in the worker): the lowest points of
 * its downward overhang regions that lie outside the permitted area.
 */
export function areaRisks(job: AreaRiskJob, engine: Pick<GeometryEngine, 'vertex_normals'> | undefined = geometryNow()): AreaRisk[] {
  const placement = runPlacementJob({ mesh: job.mesh, orientation: job.orientation,
    settings: { ...job.settings, includeIslands: true, includeDownward: false, reinforceEdges: false } });
  const islands = placement.points.filter((point) => point.source === 'island');
  if (islands.length === 0) return [];
  const local = placedPoints(job.orientation, { points: islands });
  const lows = local.map((point, k): LowPoint => ({ position: point.position, height: islands[k]!.position[1] }));
  if (!engine) throw new Error('Geometry engine is not ready');
  return outsideLowPoints(job.mesh, lows, placement.regions, permittedFaces(job.mesh, job.dental, job.orientation), job.radius,
    engine.vertex_normals(job.mesh.positions, job.mesh.indices));
}
