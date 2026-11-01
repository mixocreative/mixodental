/*
 * Ray arrows of the denture review (batch review only): one layer per named ray (S:\ai\mixo-geocore\docs\rays.md),
 * each a set of thin line arrows (a line from the ray's start to its real hit point, ending in an open V head, the
 * same line width and head proportion for every ray) in the colour of the area the ray decides (layerColours.ts), in
 * the same unit-local mesh frame as the other layers. Each arrow is exactly ARROW_VERTICES vertices (3 segments), so
 * the viewer finds the arrow under the pointer by vertex index and reads its length from the first vertex to the shaft end
 * (6 vertices per solid arrow; a dashed arrow, R1b, says its layout in the layer's `info`). R1 is the guide arrows: parallel, with a run-up.
 * Directions and origins come from the engine's review result (noSupportDir, oralCavityRay, upDecision.top / back,
 * up, holeOutlines, tips); the hit points are found here with a plain ray-triangle test on the same mesh, so an
 * arrow ends where its ray lands. Layer names start with the ray code so the viewer toggles them one by one.
 *
 * R9 (aligner crossing rays) is not drawn: it is aligner-only. R5 is omitted when the review has no bar-underside
 * tip. R1b is omitted when the rule is off.
 */
import type { TriangleMesh } from '@mixo-geocore/host/core/analysis/types';
import type { Vector } from '@mixo-geocore/host/core/vec3';
import type { DentureReview } from '@mixo-geocore/host/dental/dentureReview';
import { LAYER_COLOURS as C } from './layerColours';
import type { ReviewLayer } from './orientationEvidenceGlb';

type Arrow = { from: Vector; to: Vector };

const sub = (a: Vector, b: Vector): Vector => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add = (a: Vector, b: Vector, k = 1): Vector => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];
const dot = (a: Vector, b: Vector): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: Vector, b: Vector): Vector => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a: Vector): Vector => { const l = Math.hypot(...a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const neg = (a: Vector): Vector => [-a[0], -a[1], -a[2]];

/** Two unit vectors perpendicular to unit `n`. */
function basis(n: Vector): [Vector, Vector] {
  const helper: Vector = Math.abs(n[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0];
  const u = norm(cross(n, helper));
  return [u, cross(n, u)];
}

/** Nearest hit distance of the ray `origin + t * dir` (t > minT) on the mesh, or undefined (Moller-Trumbore, both sides). */
export function castRay(mesh: TriangleMesh, origin: Vector, dir: Vector, minT = 1e-3): number | undefined {
  const p = mesh.positions, ix = mesh.indices;
  let best = Infinity;
  for (let f = 0; f < ix.length; f += 3) {
    const a = ix[f]! * 3, b = ix[f + 1]! * 3, c = ix[f + 2]! * 3;
    const e1: Vector = [p[b]! - p[a]!, p[b + 1]! - p[a + 1]!, p[b + 2]! - p[a + 2]!];
    const e2: Vector = [p[c]! - p[a]!, p[c + 1]! - p[a + 1]!, p[c + 2]! - p[a + 2]!];
    const h = cross(dir, e2);
    const det = dot(e1, h);
    if (Math.abs(det) < 1e-12) continue;
    const s: Vector = [origin[0] - p[a]!, origin[1] - p[a + 1]!, origin[2] - p[a + 2]!];
    const u = dot(s, h) / det;
    if (u < 0 || u > 1) continue;
    const q = cross(s, e1);
    const v = dot(dir, q) / det;
    if (v < 0 || u + v > 1) continue;
    const t = dot(e2, q) / det;
    if (t > minT && t < best) best = t;
  }
  return best === Infinity ? undefined : best;
}

/** Vertices per arrow: the shaft and two head strokes, two vertices each. The viewer relies on this (hover tooltip). */
export const ARROW_VERTICES = 6;
/** Open V head: stroke length as a share of the arrow length (same for every ray) and the half-angle of the V. */
const HEAD_SHARE = 0.1;
const HEAD_HALF_ANGLE = (25 * Math.PI) / 180;

/**
 * Line segments of one arrow: `from` to `to`, then two short strokes back from `to` (an open V, no solid head). Empty for a zero-length arrow.
 * With `dashes` > 0 the shaft is that many dashes (the last one ends at `to`), 2 * dashes + 4 vertices per arrow.
 */
function arrowSegments({ from, to }: Arrow, dashes = 0): number[] {
  const axis = sub(to, from);
  const length = Math.hypot(...axis);
  if (length < 1e-6) return [];
  const d = norm(axis);
  const [u] = basis(d);
  const head = length * HEAD_SHARE;
  const barb = (side: number): Vector => add(add(to, d, -Math.cos(HEAD_HALF_ANGLE) * head), u, side * Math.sin(HEAD_HALF_ANGLE) * head);
  const shaft: number[] = [];
  if (dashes <= 0) shaft.push(...from, ...to);
  else {
    const unit = 1 / (2 * dashes - 1);
    for (let k = 0; k < dashes; k++) shaft.push(...add(from, axis, 2 * k * unit), ...add(from, axis, (2 * k + 1) * unit));
  }
  return [...shaft, ...to, ...barb(1), ...to, ...barb(-1)];
}

/** One line layer of arrows, or none when there are no arrows. Dashed arrows carry their vertex layout in `info` for the hover tooltip. */
function layer(name: string, color: number, arrows: Arrow[], dashes = 0): ReviewLayer[] {
  const positions = Float32Array.from(arrows.flatMap((arrow) => arrowSegments(arrow, dashes)));
  if (positions.length === 0) return [];
  const info = dashes > 0 ? { verticesPerArrow: 2 * dashes + 4, shaftEndVertex: 2 * dashes - 1 } : undefined;
  return [{ name, color, positions, indices: new Uint32Array(0), lines: true, ...(info ? { info } : {}) }];
}

/** Dashes in an R1b shaft, so R1 (solid) and R1b (dashed, same colour) are told apart. */
const DASHES = 14;
/** Run-up of a parallel ray before its hit, as a share of the tight box diagonal (the same for every parallel ray). */
const RUN_UP = 0.35;

/** Evenly spread `count` items of `list` (all of them when fewer). */
const spread = <T>(list: T[], count: number): T[] => (list.length <= count ? list : Array.from({ length: count }, (_, k) => list[Math.floor((k * list.length) / count)]!));

/**
 * Parallel rays along `dir` over a grid in the plane across the box centre, starting outside the box: each arrow runs
 * from its start to the first hit (rays that miss are dropped). Up to `count` arrows, spread over the grid.
 */
function parallelArrows(mesh: TriangleMesh, review: DentureReview, dir: Vector, count: number, reach = 0.7): { arrows: Arrow[]; hits: Vector[] } {
  const d = norm(dir);
  const [u, w] = basis(d);
  const size = Math.max(...review.box.half);
  const found: Array<{ arrow: Arrow; hit: Vector }> = [];
  const steps = [-1, -0.5, 0, 0.5, 1];
  for (const a of steps) for (const b of steps) {
    const start = add(add(add(review.box.centre, d, -size * 1.6), u, a * size * reach), w, b * size * reach);
    const t = castRay(mesh, start, d);
    if (t === undefined) continue;
    const hit = add(start, d, t);
    // A clear run-up before the hit: at least RUN_UP of the box diagonal, and never shorter than the grid start.
    found.push({ arrow: { from: add(hit, d, -Math.max(t, RUN_UP * 2 * Math.hypot(...review.box.half))), to: hit }, hit });
  }
  const chosen = spread(found, count);
  return { arrows: chosen.map((f) => f.arrow), hits: chosen.map((f) => f.hit) };
}

/** From a run-up outside the model, through the first hit, to where the ray leaves the model (the next face), or `fallback` mm when it never does. */
function travelArrow(mesh: TriangleMesh, hit: Vector, dir: Vector, fallback: number, runUp: number): Arrow {
  const t = castRay(mesh, hit, dir, 0.05);
  return { from: add(hit, dir, -runUp), to: add(hit, dir, t ?? fallback) };
}

export interface RayInputs {
  mesh: TriangleMesh;
  review: DentureReview;
  /** Tips with no support built, and our placed tips (unit-local). */
  leftOut: Array<{ position: Vector }>;
  placed: Array<{ position: Vector }>;
}

/** The R1..R8 layers (R9 is aligner only). */
export function rayLayers({ mesh, review, leftOut, placed }: RayInputs): ReviewLayer[] {
  const size = 2 * Math.max(...review.box.half);
  const top = review.upDecision?.top ? norm(review.upDecision.top) : undefined;
  const back = review.upDecision?.frontBack?.back ? norm(review.upDecision.frontBack.back) : undefined;
  const up = norm(review.up);
  const down = neg(up);
  const layers: ReviewLayer[] = [];

  // R1 no-support ray: parallel, 45 degrees, from the front-top toward the back-bottom.
  const r1 = parallelArrows(mesh, review, review.noSupportDir, 9);
  layers.push(...layer('R1 no-support ray (45°)', C.rayR1, r1.arrows));

  // R1b steep no-support ray: only when the rule is on; d = cos(a) back - sin(a) top.
  if (review.noSupportSteepDeg > 0 && top && back) {
    const a = (review.noSupportSteepDeg * Math.PI) / 180;
    const dir = norm(add([back[0] * Math.cos(a), back[1] * Math.cos(a), back[2] * Math.cos(a)], top, -Math.sin(a)));
    const r1b = parallelArrows(mesh, review, dir, 9);
    layers.push(...layer(`R1b steep no-support ray (${review.noSupportSteepDeg}°, dashed)`, C.rayR1b, r1b.arrows, DASHES));
  }

  // R2 oral cavity ray: from its origin to the centroid of faces the allowed mask says it reaches first.
  {
    const origin = review.oralCavityRay;
    const p = mesh.positions, ix = mesh.indices;
    const allowed: Vector[] = [];
    for (let f = 0; f < review.allowedMask.length; f++) {
      if (review.allowedMask[f] !== 1) continue;
      const [a, b, c] = [0, 1, 2].map((k) => ix[f * 3 + k]! * 3);
      allowed.push([0, 1, 2].map((i) => (p[a! + i]! + p[b! + i]! + p[c! + i]!) / 3) as Vector);
    }
    layers.push(...layer('R2 oral cavity ray (fan to allowed faces)', C.rayR2, spread(allowed, 10).map((hit) => ({ from: origin, to: hit }))));
  }

  // R3 hole ray: along the teeth axis (into the model, -top). Through up to 3 holes the ray misses and runs across the box;
  // one ray through solid material runs from its start to its first hit.
  if (top) {
    const axis = neg(top);
    const reach = Math.max(...review.box.half);
    const holes = [...review.holeOutlines].filter((h) => h.points.length > 0).sort((x, y) => y.areaMm2 - x.areaMm2).slice(0, 3);
    const through: Arrow[] = holes.map((h) => {
      const centre = h.points.reduce<Vector>((s, q) => add(s, q, 1 / h.points.length), [0, 0, 0]);
      return { from: add(centre, axis, -RUN_UP * 2 * Math.hypot(...review.box.half)), to: add(centre, axis, reach) };
    });
    const solid = parallelArrows(mesh, review, axis, 1, 0.3);
    layers.push(...layer('R3 hole ray (teeth axis)', C.rayR3, [...through, ...solid.arrows]));

    // R4 up-check ray (diagnostic): from the teeth-side face, its travel through the model along the teeth axis.
    const up4 = parallelArrows(mesh, review, axis, 1, 0.8);
    layers.push(...layer('R4 up-check ray (diagnostic)', C.rayR4, up4.hits.map((hit) => travelArrow(mesh, hit, axis, size * 0.3, RUN_UP * 2 * Math.hypot(...review.box.half)))));
  }

  // R5 thickness ray: at bar-underside tips, inward along the reversed normal to the far side (omitted without such tips).
  {
    const bars = review.tips.filter((t) => t.stream === 'bar');
    const arrows = spread(bars, 5).map((t) => {
      const inward = neg(norm(t.normal));
      const run = castRay(mesh, t.position, inward, 0.05) ?? 4;
      return { from: t.position, to: add(t.position, inward, run) };
    });
    layers.push(...layer('R5 thickness ray (bar underside)', C.rayR5, arrows));
  }

  // R6 corridor rays: at each left-out tip, the centre ray and a ring at the pillar radius, straight down to the first hit or the plate.
  {
    const radius = review.pillar.pillarDiameter / 2;
    const [u, w] = basis(down);
    const plate = lowestAlong(mesh, up);
    const arrows: Arrow[] = [];
    for (const tip of leftOut.slice(0, 40)) {
      for (const k of [-1, 0, 1, 2, 3, 4, 5]) {
        const t = (k / 6) * 2 * Math.PI;
        const start = k < 0 ? tip.position : add(add(tip.position, u, Math.cos(t) * radius), w, Math.sin(t) * radius);
        arrows.push(downArrow(mesh, start, up, plate));
      }
    }
    layers.push(...layer('R6 corridor rays (left-out tips, centre + ring)', C.rayR6, arrows));
  }

  // R7 plate-drop ray (space map): one cell, a pair of vertical arrows: plate up to the model underside, and from above the model down to its top.
  {
    const base = review.box.centre;
    const [u, w] = basis(up);
    const plate = lowestAlong(mesh, up);
    const ceiling = -lowestAlong(mesh, down) + size * 0.1;
    let best: Arrow[] = [];
    const reach = Math.max(...review.box.half) * 0.5;
    search: for (const r of [0, 0.3, 0.6, 1]) for (let k = 0; k < 8; k++) {
      const t = (k / 8) * 2 * Math.PI;
      const cell = add(add(base, u, Math.cos(t) * r * reach), w, Math.sin(t) * r * reach);
      const floor = add(cell, up, plate - dot(cell, up)); // the point of this plan cell on the plate
      const hit = castRay(mesh, floor, up);
      if (hit === undefined) continue;
      const skyStart = add(floor, up, ceiling - plate);
      const topT = castRay(mesh, skyStart, down);
      if (topT === undefined) continue;
      best = [{ from: floor, to: add(floor, up, hit) }, { from: skyStart, to: add(skyStart, down, topT) }];
      break search;
    }
    layers.push(...layer('R7 plate-drop ray (space map, one cell)', C.rayR7, best));
  }

  // R8 landing ray: from a placed pillar's top straight down to where it lands (model or plate).
  {
    const plate = lowestAlong(mesh, up);
    layers.push(...layer('R8 landing ray (pillar top down)', C.rayR8, spread(placed, 8).map((tip) => downArrow(mesh, tip.position, up, plate))));
  }

  return layers;
}

/** The plate height along `up`: the smallest `dot(v, up)` over the mesh. */
function lowestAlong(mesh: TriangleMesh, up: Vector): number {
  const p = mesh.positions;
  let m = Infinity;
  for (let i = 0; i < p.length; i += 3) m = Math.min(m, p[i]! * up[0] + p[i + 1]! * up[1] + p[i + 2]! * up[2]);
  return m;
}

/** An arrow from `start` straight down (reverse of `up`) to the first hit or the plate. */
function downArrow(mesh: TriangleMesh, start: Vector, up: Vector, plate: number): Arrow {
  const down = neg(up);
  const t = castRay(mesh, start, down, 0.05);
  return { from: start, to: add(start, down, Math.max(0.1, t ?? dot(start, up) - plate)) };
}
