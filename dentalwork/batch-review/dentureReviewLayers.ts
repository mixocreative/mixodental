/*
 * Denture review layers (batch review only): the host's denture review (vendor host/dental/dentureReview.ts,
 * engine 20), the owner's contacts and -sup supports when the bare scan has them beside it, and the area
 * comparison. Everything is in the unit-local mesh frame (the import's Y-up, centred). reviewCase.ts writes
 * every layer into one GLB under the review frame, so what the viewer shows is the same transform for all of them.
 *
 * Owner files are in the bare scan's own Z-up STL coordinates. Their Y-up mapping is (x, y, z) -> (x, z, -y),
 * then the import's centring subtracts the bounding-box centre. The -sup STL sits in its own frame, shifted by
 * transform_bare_to_sup (a pure translation, checked); its vertices go back to the bare frame first.
 *
 * The mapping is checked on the displayed model: the displayed transform is the GLB scene transform (position,
 * then Euler XYZ rotation, as orientationGlb sets it), applied to the scan and to each owner contact. Each
 * contact must lie on the displayed scan, median distance <= 1 mm, or the owner layers are not drawn.
 * `displayedContactCheck` reads the written GLB back and measures the same thing from the file.
 *
 * Names carry no file or patient data. Layer names start with the prefixes viewer.html's GROUPS list.
 */
import { existsSync, readFileSync } from 'node:fs';
import * as THREE from 'three';
import type { TriangleMesh } from '@mixo-geocore/host/core/analysis/types';
import type { Vector } from '@mixo-geocore/host/core/vec3';
import type { JobTransform } from '@mixo-geocore/host/core/jobs';
import { AREA_CLASS, compareDentureAreas, reviewDenture, type DentureAreaComparison, type DentureReview } from '@mixo-geocore/host/dental/dentureReview';
import { parseStl } from '../../scripts/node-engine';
import { distancesToSurface, readGlbWorldMeshes } from './glbWorld';
import type { ReviewLayer } from './orientationEvidenceGlb';
import { LAYER_COLOURS as C } from './layerColours';
import { describeUnresolved, islandPoints, summariseIslands, type IslandSettle, type IslandSummary } from './islandReport';

export const CONTACTS_FORMAT = 'mixo-sup-contacts/1';
/** The largest median distance (mm) from an owner contact to the displayed scan that the mapping may have. */
export const CONTACT_MAPPING_LIMIT_MM = 1;
/** Lift (mm) of the face-class and area patches off the model, so they do not z-fight with it. The allowed area sits above the no-support zone, so it paints over it. */
const FACE_LIFT_MM = 0.05;
const ALLOWED_LIFT_MM = 0.1;
const DOWN_LIFT_MM = 0.08;
const AREA_LIFT_MM = 0.12;
const BAND_LIFT_MM = 0.11;
/** Radius (mm) of the thick rim and hole lines (tubes, not 1 px GL lines). */
const RIM_TUBE_MM = 0.3;
const HOLE_TUBE_MM = 0.25;
/** Tip stream -> the shared source colour (layerColours.ts); other streams draw in the tip colour. */
const SOURCE_COLOUR: Record<string, number> = { rim: C.sourceRim, hole: C.sourceHole, area: C.sourceArea, low: C.sourceLow };
/** Tip streams in the order the facts line lists them. */
const SOURCE_ORDER = ['rim', 'hole', 'area', 'low'];
/** Vertices per owner-contact marker (markerPositions: 8 octants x 3 corners); their mean is the contact. */
const MARKER_VERTICES = 24;

/** A placed tip in unit-local coordinates: the touch point and the contact normal. */
export interface PlacedTip { position: Vector; normal: Vector }

/** A tip the build left out, with the engine's reason. */
export interface LeftOutTip extends PlacedTip { reason: string }

/** What the denture review adds to the review row and GLB (all null / '' when it does not apply). */
export interface DentureDetail {
  layers: ReviewLayer[];
  ownerContacts: number | null;
  /** Median distance (mm) from the owner contacts to the displayed scan, computed before the GLB is written. */
  ownerContactsMedianMm: number | null;
  ownerAreaCoveredPct: number | null;
  outsideOwnerAreaPct: number | null;
  /** The middle plane's state for the facts rows. */
  middlePlane: string;
  /** Step 1 text: the up decision from the rim ('' when there is no review or no rim). */
  upDecision: string;
  /** Tips per source, e.g. 'rim 12 / hole 3 / area 40 / low 2' ('' without a review). */
  tipsBySource: string;
  /** Tips on an overhang with no free path to the plate (not built). */
  unsupportableTips: number;
  /** Left-out tips per engine reason, e.g. 'leave-out:pillar 3 / build-omission 1' ('' when none). */
  tipsLeftOutReasons: string;
  /** The engine's island report after the build (`settleIslands`), or undefined when the review or its island report is not available. */
  islands: IslandSummary | undefined;
  /** Facts row: the unresolved islands with height, size and reason ('none', or why the report is missing). */
  unresolvedIslands: string;
}

/** The up decision as one plain line (the rim's, from up_decision). */
function describeUp(decision: NonNullable<DentureReview['upDecision']>): string {
  const v = decision.sliceVotes;
  const fb = decision.frontBack ? `back from U opening (margin ${decision.frontBack.widthMargin.toFixed(2)}${decision.frontBack.crossCheckAgrees ? ', cross-check agrees' : ', cross-check DISAGREES'}); ` : '';
  return `${fb}top from 11 slices: ${v.for} agree / ${v.against} disagree / ${v.abstain} no clear n, confidence ${Math.round(decision.confidence * 100)}%${decision.teethFlipped ? ', flipped' : ''}`;
}
const decided = (ok: boolean) => (ok ? 'decided' : 'not decided');

/** The owner's -sup.contacts.json beside a bare STL path. */
export function ownerContactsPath(bare: string): string {
  return bare.replace(/\.stl$/i, '-sup.contacts.json');
}

/** The owner's -sup.stl beside a bare STL path. */
export function ownerSupportsPath(bare: string): string {
  return bare.replace(/\.stl$/i, '-sup.stl');
}

/** Bounding-box centre of flat xyz positions: the import's centring (engine center_positions), before it is applied. */
export function boundsCentre(positions: ArrayLike<number>): Vector {
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (let at = 0; at < positions.length; at += 3) {
    for (let axis = 0; axis < 3; axis++) {
      min[axis] = Math.min(min[axis]!, positions[at + axis]!);
      max[axis] = Math.max(max[axis]!, positions[at + axis]!);
    }
  }
  return [0, 1, 2].map((axis) => (min[axis]! + max[axis]!) / 2) as Vector;
}

const median = (values: number[]): number => {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = sorted.length >> 1;
  return sorted.length === 0 ? Number.NaN : sorted.length % 2 ? sorted[mid]! : (sorted[mid - 1]! + sorted[mid]!) / 2;
};

interface OwnerFile { contacts: number[][]; transform: number[][] }

function readOwnerFile(path: string): OwnerFile | undefined {
  if (!existsSync(path)) return undefined;
  const json = JSON.parse(readFileSync(path, 'utf8')) as { format?: string; contacts?: number[][]; transform_bare_to_sup?: number[][] };
  if (json.format !== CONTACTS_FORMAT || !Array.isArray(json.contacts)) throw new Error('owner contacts file has an unexpected format');
  return { contacts: json.contacts, transform: json.transform_bare_to_sup ?? [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]] };
}

/** Bare-scan Z-up mm (x, y, z) to the review's Y-up mesh frame, minus the import centre. */
const toMeshFrame = ([x, y, z]: number[], centre: Vector): Vector => [x!, z!, -y!].map((v, axis) => v - centre[axis]!) as Vector;

/**
 * The -sup-to-bare shift in the Y-up frame. transform_bare_to_sup must be a pure translation (identity
 * linear part), otherwise the owner supports cannot be mapped and this throws.
 */
function supToBareShift(transform: number[][]): Vector {
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
    if (Math.abs(transform[r]![c]! - (r === c ? 1 : 0)) > 1e-9) throw new Error('owner -sup transform is not a pure translation');
  }
  // Z-up (x, y, z) -> Y-up (x, z, -y) applied to the translation column.
  return [transform[0]![3]!, transform[2]![3]!, -transform[1]![3]!];
}

/** The displayed transform: the GLB scene node (translation, then Euler XYZ rotation), as orientationGlb sets it. */
export function displayedMatrix(frame: JobTransform): THREE.Matrix4 {
  return new THREE.Matrix4().compose(
    new THREE.Vector3(...frame.position),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(...frame.rotation)),
    new THREE.Vector3(1, 1, 1),
  );
}

/** Flat Float64 positions of `mesh` after `matrix` (the displayed scan). */
function displayedPositions(mesh: TriangleMesh, matrix: THREE.Matrix4): Float64Array {
  const out = new Float64Array(mesh.positions.length);
  const v = new THREE.Vector3();
  for (let at = 0; at < mesh.positions.length; at += 3) {
    v.set(mesh.positions[at]!, mesh.positions[at + 1]!, mesh.positions[at + 2]!).applyMatrix4(matrix);
    out.set([v.x, v.y, v.z], at);
  }
  return out;
}

/** Outward-facing sign: +1 when the triangles wind outward (positive signed volume), else -1. Patches lift along it. */
function outwardSign(mesh: TriangleMesh): number {
  let volume = 0;
  const p = mesh.positions;
  for (let t = 0; t < mesh.indices.length; t += 3) {
    const [a, b, c] = [0, 1, 2].map((k) => mesh.indices[t + k]! * 3);
    volume += p[a]! * (p[b + 1]! * p[c + 2]! - p[b + 2]! * p[c + 1]!)
      - p[a + 1]! * (p[b]! * p[c + 2]! - p[b + 2]! * p[c]!)
      + p[a + 2]! * (p[b]! * p[c + 1]! - p[b + 1]! * p[c]!);
  }
  return volume >= 0 ? 1 : -1;
}

/** Unindexed triangles of the faces in `faces`, each vertex lifted along the outward unit normal by `lift` mm. */
function patchPositions(mesh: TriangleMesh, faces: number[], lift: number, sign: number): Float32Array {
  const out = new Float32Array(faces.length * 9);
  const p = mesh.positions;
  faces.forEach((face, k) => {
    const v = [0, 1, 2].map((j) => mesh.indices[face * 3 + j]! * 3);
    const [a, b, c] = v.map((at) => [p[at]!, p[at + 1]!, p[at + 2]!]);
    const e1 = [0, 1, 2].map((i) => b![i]! - a![i]!);
    const e2 = [0, 1, 2].map((i) => c![i]! - a![i]!);
    const n = [e1[1]! * e2[2]! - e1[2]! * e2[1]!, e1[2]! * e2[0]! - e1[0]! * e2[2]!, e1[0]! * e2[1]! - e1[1]! * e2[0]!];
    const length = Math.hypot(n[0]!, n[1]!, n[2]!) || 1;
    [a, b, c].forEach((corner, j) => {
      for (let i = 0; i < 3; i++) out[k * 9 + j * 3 + i] = corner![i]! + (sign * n[i]! / length) * lift;
    });
  });
  return out;
}

/** Faces whose value passes `keep`. */
const facesWhere = (values: ArrayLike<number>, keep: (value: number) => boolean): number[] => {
  const out: number[] = [];
  for (let face = 0; face < values.length; face++) if (keep(values[face]!)) out.push(face);
  return out;
};

/** Small line segments: the flat positions of each segment's two ends. */
const linePositions = (segments: Array<[Vector, Vector]>): Float32Array => Float32Array.from(segments.flat(2));

/** Small octahedra (a marker dot) of radius `r` at each point: MARKER_VERTICES vertices per point. */
function markerPositions(points: Vector[], r: number): Float32Array {
  const out: number[] = [];
  for (const [x, y, z] of points) {
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) {
      out.push(x + sx * r, y, z, x, y + sy * r, z, x, y, z + sz * r);
    }
  }
  return Float32Array.from(out);
}

/** Thick lines: a four-sided tube of `radius` mm along each segment, as unindexed triangles. */
function tubePositions(segments: Array<[Vector, Vector]>, radius: number): Float32Array {
  const out: number[] = [];
  for (const [a, b] of segments) {
    const [u, w] = planeBasis(unit([0, 1, 2].map((i) => b[i]! - a[i]!) as Vector));
    const ring = (p: Vector): number[][] => [0, 1, 2, 3].map((k) => {
      const t = (k * Math.PI) / 2;
      return [0, 1, 2].map((i) => p[i]! + radius * (Math.cos(t) * u[i]! + Math.sin(t) * w[i]!));
    });
    const ringA = ring(a), ringB = ring(b);
    for (let k = 0; k < 4; k++) {
      const k1 = (k + 1) % 4;
      out.push(...ringA[k]!, ...ringA[k1]!, ...ringB[k1]!, ...ringA[k]!, ...ringB[k1]!, ...ringB[k]!);
    }
  }
  return Float32Array.from(out);
}

/** The closed polyline through `points` as segments (the last joins the first). */
const loopSegments = (points: Vector[]): Array<[Vector, Vector]> => points.map((p, k) => [p, points[(k + 1) % points.length]!] as [Vector, Vector]);
/** Segments of a polyline: an open line has n - 1, a closed one n (its last segment closes it). */
const polylineSegments = (points: Vector[], closed: boolean): Array<[Vector, Vector]> =>
  closed ? loopSegments(points) : points.slice(0, -1).map((p, k) => [p, points[k + 1]!] as [Vector, Vector]);

/** A UV sphere of radius `r` at `centre`, with indices. */
function sphereMesh(centre: Vector, r: number, rings = 8, sectors = 12): { positions: Float32Array; indices: Uint32Array } {
  const positions: number[] = [];
  const indices: number[] = [];
  for (let i = 0; i <= rings; i++) {
    const phi = (i / rings) * Math.PI;
    for (let j = 0; j <= sectors; j++) {
      const theta = (j / sectors) * 2 * Math.PI;
      positions.push(centre[0] + r * Math.sin(phi) * Math.cos(theta), centre[1] + r * Math.cos(phi), centre[2] + r * Math.sin(phi) * Math.sin(theta));
    }
  }
  for (let i = 0; i < rings; i++) for (let j = 0; j < sectors; j++) {
    const a = i * (sectors + 1) + j, b = a + sectors + 1;
    indices.push(a, b, a + 1, b, b + 1, a + 1);
  }
  return { positions: Float32Array.from(positions), indices: Uint32Array.from(indices) };
}

/** Cones with the apex at the touch point and the axis along the normal, `length` mm long, base radius `radius`. */
function coneTriangles(tips: PlacedTip[], length: number, radius: number): Float32Array {
  const SEGMENTS = 12;
  const out: number[] = [];
  const add = (...p: number[]) => out.push(...p);
  for (const { position: [px, py, pz], normal } of tips) {
    const len = Math.hypot(...normal) || 1;
    const n = normal.map((v) => v / len) as Vector;
    const helper: Vector = Math.abs(n[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0];
    const u0 = [n[1] * helper[2] - n[2] * helper[1], n[2] * helper[0] - n[0] * helper[2], n[0] * helper[1] - n[1] * helper[0]];
    const u1 = Math.hypot(...u0) || 1;
    const u = u0.map((v) => v / u1);
    const w = [n[1] * u[2]! - n[2] * u[1]!, n[2] * u[0]! - n[0] * u[2]!, n[0] * u[1]! - n[1] * u[0]!];
    const base = [px + n[0] * length, py + n[1] * length, pz + n[2] * length];
    const ring = Array.from({ length: SEGMENTS }, (_, k) => {
      const theta = (k / SEGMENTS) * 2 * Math.PI;
      const c = Math.cos(theta) * radius, s = Math.sin(theta) * radius;
      return [0, 1, 2].map((i) => base[i]! + c * u[i]! + s * w[i]!);
    });
    for (let k = 0; k < SEGMENTS; k++) {
      const a = ring[k]!, b = ring[(k + 1) % SEGMENTS]!;
      add(px, py, pz, ...a, ...b);
      add(base[0]!, base[1]!, base[2]!, ...b, ...a);
    }
  }
  return Float32Array.from(out);
}

/** Two unit vectors spanning the plane perpendicular to `n` (any unit `n`). */
function planeBasis(n: Vector): [Vector, Vector] {
  const helper: Vector = Math.abs(n[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0];
  const u0 = [n[1] * helper[2] - n[2] * helper[1], n[2] * helper[0] - n[0] * helper[2], n[0] * helper[1] - n[1] * helper[0]];
  const len = Math.hypot(...u0) || 1;
  const u = u0.map((v) => v / len) as Vector;
  const w = [n[1] * u[2] - n[2] * u[1], n[2] * u[0] - n[0] * u[2], n[0] * u[1] - n[1] * u[0]] as Vector;
  return [u, w];
}

/** A line layer (segments drawn as lines), skipped when there are none. */
function edgesLayer(layers: ReviewLayer[], segments: Array<[Vector, Vector]>, name: string, color: number): void {
  if (segments.length > 0) layers.push({ name, color, positions: linePositions(segments), indices: new Uint32Array(0), lines: true });
}

const unit = (v: Vector): Vector => {
  const len = Math.hypot(...v) || 1;
  return v.map((x) => x / len) as Vector;
};

/** The 12 edges of the tight box (centre, three axes, half-sizes). */
function boxEdges(box: { centre: Vector; axes: [Vector, Vector, Vector]; half: Vector }): Array<[Vector, Vector]> {
  const corner = (s: number[]): Vector => [0, 1, 2].map((i) => box.centre[i]! + [0, 1, 2].reduce((acc, k) => acc + s[k]! * box.half[k]! * box.axes[k]![i]!, 0)) as Vector;
  const edges: Array<[Vector, Vector]> = [];
  const signs = [[-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1], [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]];
  for (let a = 0; a < 8; a++) for (let b = a + 1; b < 8; b++) {
    const diff = signs[a]!.map((v, k) => Math.abs(v - signs[b]![k]!));
    if (diff.reduce((x, y) => x + y, 0) === 2) edges.push([corner(signs[a]!), corner(signs[b]!)]);
  }
  return edges;
}

/** Arrowed segments (shaft + two barbs) for parallel rays along `direction`, tails `length` mm before the given points. */
function rayArrows(points: Vector[], direction: Vector, length: number): Array<[Vector, Vector]> {
  const d = unit(direction);
  const [u] = planeBasis(d);
  const head = length * 0.15;
  const out: Array<[Vector, Vector]> = [];
  for (const p of points) {
    const tail: Vector = [0, 1, 2].map((i) => p[i]! - d[i]! * length) as Vector;
    out.push([tail, p]);
    for (const side of [1, -1]) {
      const barb: Vector = [0, 1, 2].map((i) => p[i]! - d[i]! * head + side * u[i]! * head * 0.5) as Vector;
      out.push([p, barb]);
    }
  }
  return out;
}

/**
 * The denture review layers and facts. `frame` is the review frame the GLB is written with; `leftOutTips` the tips with no support built; `placed` are
 * our placed tips in unit-local coordinates (the contacts the supports were built from). `tiltDeg` is the
 * print angle the case chose: the review is run at that tilt.
 */
export function dentureReviewDetail(bare: string, mesh: TriangleMesh, centre: Vector, frame: JobTransform, placed: PlacedTip[], profile: string, tiltDeg: number, leftOutTips: LeftOutTip[] = [], settle?: IslandSettle): DentureDetail {
  const review = reviewDenture(mesh, profile, tiltDeg);
  const islands = review && !review.islandsNote ? summariseIslands(review.islands, settle) : undefined;
  const layers: ReviewLayer[] = [];
  const sign = outwardSign(mesh);
  if (review) {
    // Rim edge (ABI 20): each rim polyline as one thick continuous line, closed when the rim closes on itself. The
    // layer name says how many lines there are and how many are closed (the viewer shows it). Hole outlines: a thick
    // loop round each hole. Hole band: the 5 mm face band (allowed where it overhangs).
    const rimLines = (review.rimLoops?.lines ?? []).filter((line) => line.points.length > 1);
    if (rimLines.length > 0) {
      const closedCount = rimLines.filter((line) => line.closed).length;
      const rimSegments = rimLines.flatMap((line) => polylineSegments(line.points, line.closed));
      const name = `Rim edge (continuous hard edge): ${rimLines.length} ${rimLines.length === 1 ? 'line' : 'lines'}, ${closedCount} closed, ${rimLines.length - closedCount} open`;
      layers.push({ name, color: C.rimEdge, positions: tubePositions(rimSegments, RIM_TUBE_MM), indices: new Uint32Array(0) });
    }
    const holeLoops = review.holeOutlines.filter((loop) => loop.points.length > 1);
    if (holeLoops.length > 0) {
      const holeSegments = holeLoops.flatMap((loop) => loopSegments(loop.points));
      const name = `Hole outlines (around ${holeLoops.length} ${holeLoops.length === 1 ? 'hole' : 'holes'})`;
      layers.push({ name, color: C.holeEdge, positions: tubePositions(holeSegments, HOLE_TUBE_MM), indices: new Uint32Array(0) });
    }
    const holeBand = facesWhere(review.holeBandMask, (value) => value === 1);
    if (holeBand.length > 0) layers.push({ name: 'Hole band (5 mm, allowed if overhang)', color: C.holeBand, positions: patchPositions(mesh, holeBand, BAND_LIFT_MM, sign), indices: new Uint32Array(0) });
    // Step 2: the no-support zone (red), before the override. Step 4: the allowed area (green) lifted above it.
    const noSupport = facesWhere(review.noSupportMask, (value) => value === 1);
    if (noSupport.length > 0) layers.push({ name: 'No-support zone (hit by 45° rays)', color: C.noSupport, positions: patchPositions(mesh, noSupport, FACE_LIFT_MM, sign), indices: new Uint32Array(0) });
    const allowed = facesWhere(review.allowedMask, (value) => value === 1);
    if (allowed.length > 0) layers.push({ name: 'Allowed area (seen from the oral cavity ray)', color: C.allowed, positions: patchPositions(mesh, allowed, ALLOWED_LIFT_MM, sign), indices: new Uint32Array(0) });
    // Step 2: a few arrows for the parallel 45-degree rays: a 3x3 grid on the front-top side of the box,
    // tips where the rays enter the box, so the arrows show where the rays come from and where they go.
    const origin = review.oralCavityRay;
    const direction = review.noSupportDir;
    const d = unit(direction);
    const [bu, bw] = planeBasis(d);
    const spread = Math.max(...review.box.half);
    const grid: Vector[] = [];
    for (const a of [-0.6, 0, 0.6]) for (const b of [-0.6, 0, 0.6]) {
      grid.push([0, 1, 2].map((i) => review.box.centre[i]! - d[i]! * spread + a * spread * bu[i]! + b * spread * bw[i]!) as Vector);
    }
    edgesLayer(layers, rayArrows(grid, direction, spread * 1.5), 'Ray directions (45°, parallel)', C.noSupport);
    // Downward-facing faces (the overhang candidates) and the hard edges that face down.
    const downFaces = facesWhere(review.downMask, (value) => value === 1);
    if (downFaces.length > 0) {
      layers.push({ name: 'Down-facing area (≤60° from down)', color: C.downFacing, positions: patchPositions(mesh, downFaces, DOWN_LIFT_MM, sign), indices: new Uint32Array(0) });
    }
    edgesLayer(layers, review.downEdges, 'DOWN-FACING hard edges', C.downEdges);
    edgesLayer(layers, review.hardEdges, 'ALL hard edges (thin)', 0x222222);
    // Step 1: the tight oriented box around the model, and the middle plane fitted to the hard edges.
    edgesLayer(layers, boxEdges(review.box), 'TIGHT BOX (oriented, around the model)', C.tightBox);
    const planeLayer = (plane: { point: Vector; normal: Vector }, name: string, color: number) => {
      const { point, normal } = plane;
      const n = unit(normal);
      const [u, w] = planeBasis(n);
      const h = Math.max(...review.box.half);
      const corner = (a: number, b: number): Vector => [0, 1, 2].map((i) => point[i]! + a * h * u[i]! + b * h * w[i]!) as Vector;
      const [c0, c1, c2, c3] = [corner(-1, -1), corner(1, -1), corner(1, 1), corner(-1, 1)];
      edgesLayer(layers, [[c0, c1], [c1, c2], [c2, c3], [c3, c0]], name, color);
    };
    if (review.rimPlane) planeLayer(review.rimPlane, 'RIM PLANE (level fit through the rim)', C.middlePlane);
    planeLayer(review.symmetryPlane, 'SYMMETRY PLANE (left / right split)', C.symmetryPlane);
    // Step 5: the print tilt, as the build plate (a square lying on the plate, normal = the plate's normal `up`).
    {
      const n = unit(review.up);
      const [u, w] = planeBasis(n);
      const h = Math.max(...review.box.half);
      const corner = (a: number, b: number): Vector => [0, 1, 2].map((i) => review.box.centre[i]! + a * h * u[i]! + b * h * w[i]!) as Vector;
      const [c0, c1, c2, c3] = [corner(-1, -1), corner(1, -1), corner(1, 1), corner(-1, 1)];
      edgesLayer(layers, [[c0, c1], [c1, c2], [c2, c3], [c3, c0]], 'Print tilt: build plate (normal = up)', C.printTilt);
    }
    // Step 3: the oral cavity ray origin: on the rim plane, at the back edge of the box, on the symmetry plane.
    const originSphere = sphereMesh(origin, 0.7);
    layers.push({ name: 'Oral cavity ray (rim plane, back edge)', color: C.rayOrigin, positions: originSphere.positions, indices: originSphere.indices });
    // Step 6: low points outside the allowed area (orange) and inside it with no tip reaching them (purple).
    const markers = (points: Vector[], name: string, color: number) => {
      if (points.length > 0) layers.push({ name, color, positions: markerPositions(points, 0.45), indices: new Uint32Array(0) });
    };
    markers(review.lowsOutside.map((low) => low.position), 'MARK low point outside the allowed area', C.lowOutside);
    markers(review.lowsUnreached.map((low) => low.position), 'MARK low point with no support (inside the allowed area)', C.lowUnsupported);
    // Islands (engine report, after the build): one marker at each island's lowest point; the same list the count and the facts row use.
    if (islands) {
      markers(islandPoints(islands.resolved), 'ISLAND resolved (a built tip serves the lowest point)', C.islandResolved);
      markers(islandPoints(islands.unresolved), 'ISLAND NOT resolved (no built tip serves the lowest point)', C.islandUnresolved);
    }
    // Step 7: tips on an overhang with no free path to the plate: black cones, not built.
    if (review.unsupportable.length > 0) {
      layers.push({ name: 'Tips that cannot reach the plate', color: C.unsupportableTips, positions: coneTriangles(review.unsupportable, 1.5, 0.35), indices: new Uint32Array(0) });
    }
  }

  // Owner files: contacts, then the -sup supports, both mapped to the unit-local frame and checked on the displayed scan.
  const ownerFile = readOwnerFile(ownerContactsPath(bare));
  const matrix = displayedMatrix(frame);
  let points: Vector[] | undefined;
  let medianMm: number | undefined;
  if (ownerFile) {
    points = ownerFile.contacts.map((c) => toMeshFrame(c, centre));
    const shown = points.map((p) => new THREE.Vector3(...p).applyMatrix4(matrix));
    const distances = distancesToSurface(Float64Array.from(shown.flatMap((v) => [v.x, v.y, v.z])),
      [{ name: 'displayed scan', positions: displayedPositions(mesh, matrix), indices: mesh.indices }]);
    medianMm = median(distances);
  }
  const ownerOk = points !== undefined && points.length > 0 && medianMm! <= CONTACT_MAPPING_LIMIT_MM;
  if (ownerOk) {
    const supsPath = ownerSupportsPath(bare);
    if (existsSync(supsPath) && ownerFile) {
      const sups = parseStl(readFileSync(supsPath));
      const shift = supToBareShift(ownerFile.transform);
      const positions = new Float32Array(sups.positions.length);
      for (let at = 0; at < sups.positions.length; at += 3) {
        for (let axis = 0; axis < 3; axis++) positions[at + axis] = sups.positions[at + axis]! - shift[axis]! - centre[axis]!;
      }
      layers.push({ name: 'YOUR SUPPORTS (from -sup file)', color: C.owner, positions, indices: Uint32Array.from(sups.indices) });
    }
  }
  const pct = (share: number) => Math.round(share * 1000) / 10;
  let comparison: DentureAreaComparison | undefined;
  if (ownerOk) {
    comparison = compareDentureAreas(mesh, points!, placed.map((tip) => tip.position));
    const areas: Array<[number, string, number]> = [
      [AREA_CLASS.both, 'AREA both (owner and ours)', C.compareBoth],
      [AREA_CLASS.ownerOnly, 'AREA owner only (yours)', C.compareOwnerOnly],
      [AREA_CLASS.generatedOnly, 'AREA ours only', C.compareOursOnly],
    ];
    for (const [code, name, color] of areas) {
      const faces = facesWhere(comparison.mask, (value) => value === code);
      if (faces.length > 0) layers.push({ name, color, positions: patchPositions(mesh, faces, AREA_LIFT_MM, sign), indices: new Uint32Array(0) });
    }
  }

  // Tips by source (the review's tips, each tagged rim / hole / area / low): a cone each in that source's colour.
  const tipsByStream = new Map<string, Array<{ position: Vector; normal: Vector }>>();
  for (const tip of review?.tips ?? []) {
    tipsByStream.set(tip.stream, [...(tipsByStream.get(tip.stream) ?? []), tip]);
  }
  for (const [stream, tips] of tipsByStream) {
    layers.push({ name: `Tips: ${stream}`, color: SOURCE_COLOUR[stream] ?? C.ourTips, positions: coneTriangles(tips, 1.5, 0.35), indices: new Uint32Array(0) });
  }
  const rank = (stream: string) => (SOURCE_ORDER.includes(stream) ? SOURCE_ORDER.indexOf(stream) : SOURCE_ORDER.length);
  const ordered = [...tipsByStream.keys()].sort((a, b) => rank(a) - rank(b));
  const tipsBySource = ordered.map((stream) => `${stream} ${tipsByStream.get(stream)!.length}`).join(' / ');
  // Tips left out (no support built, any source): one warning colour. Empty = every tip is supported.
  if (leftOutTips.length > 0) {
    layers.push({ name: 'Tips left out', color: C.tipsLeftOut, positions: coneTriangles(leftOutTips, 1.5, 0.35), indices: new Uint32Array(0) });
  }
  const byReason = new Map<string, number>();
  for (const tip of leftOutTips) byReason.set(tip.reason, (byReason.get(tip.reason) ?? 0) + 1);
  if (ownerOk) {
    layers.push({ name: 'YOUR CONTACTS (dots)', color: C.owner, positions: markerPositions(points!, 0.35), indices: new Uint32Array(0) });
  }
  return {
    layers,
    ownerContacts: points ? points.length : null,
    ownerContactsMedianMm: medianMm === undefined ? null : Math.round(medianMm * 100) / 100,
    ownerAreaCoveredPct: comparison ? pct(comparison.coverage) : null,
    outsideOwnerAreaPct: comparison ? pct(comparison.extra) : null,
    middlePlane: review ? (review.rimPlane ? 'Rim plane fitted' : 'none (no rim)') : 'not computed',
    upDecision: review ? (review.upDecision ? describeUp(review.upDecision) : 'no box, so no up decision') : '',
    tipsBySource,
    unsupportableTips: review?.unsupportable.length ?? 0,
    tipsLeftOutReasons: [...byReason].map(([reason, count]) => `${reason} ${count}`).join(' / '),
    islands,
    unresolvedIslands: islands ? describeUnresolved(islands.unresolved) : review?.islandsNote ? `island report not available: ${review.islandsNote}` : 'island report not available',
  };
}

/**
 * The owner contacts' median distance (mm) to the displayed denture, measured on the written GLB (world space,
 * node transforms applied). null when the GLB has no contacts layer. (Not the supports: the -sup supports have
 * large triangles, and the distance grid is too slow on them.)
 */
export function displayedContactCheck(glb: Buffer): { count: number; medianMm: number } | null {
  const worlds = readGlbWorldMeshes(glb);
  const dots = worlds.find((m) => m.name.startsWith('YOUR CONTACTS'));
  const model = worlds.find((m) => m.name.startsWith('TEAL'));
  if (!dots || !model) return null;
  // Each contact is MARKER_VERTICES vertices whose mean is the contact itself.
  const contacts: Float64Array[] = [];
  for (let at = 0; at < dots.positions.length; at += MARKER_VERTICES * 3) {
    const c = new Float64Array(3);
    for (let v = 0; v < MARKER_VERTICES; v++) for (let axis = 0; axis < 3; axis++) c[axis]! += dots.positions[at + v * 3 + axis]! / MARKER_VERTICES;
    contacts.push(c);
  }
  const flat = Float64Array.from(contacts.flatMap((c) => [c[0]!, c[1]!, c[2]!]));
  const medianMm = median(distancesToSurface(flat, [model]));
  return { count: contacts.length, medianMm: Math.round(medianMm * 100) / 100 };
}
