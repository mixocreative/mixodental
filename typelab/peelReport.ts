/*
 * Peel and strength report (batch review only), in plain words.
 *
 * Peel: while a resin layer is printed the whole cross-section of that layer sticks to the film and has to be
 * pulled off, so the peel force grows with the layer area. This slices OUR print (model + our supports, raft
 * included) and the OWNER print (the "YOUR SUPPORTS" layer, which holds the model too) along the print up
 * axis and reports the area of each layer. More branches in one layer = more area = more peel load.
 * The raft (a solid slab of thousands of mm² in the first ~1.5 mm of ours) is left out of every maximum and count
 * (raftLayers: the first big area drop), for both prints; the owner file has its own thin base, so it is not a fair peak.
 * The up axis is the GLB world Y (the review frame the GLB is written with; the plate is y = 0).
 *
 * Trunk load: for each support tree that reaches the plate, how many tips it carries and how thick the trunk is
 * compared with the sum of the necks it feeds.
 *
 * Area of a slice: each triangle crossing the plane gives one directed segment (direction from the triangle
 * normal); the shoelace sum over the segments of one welded shell is the signed area of its closed loops (outer
 * loops plus, holes minus). The owner file mixes shell windings, which cancelled in one global sum, so each shell
 * is signed on its own (positive total). No loop chaining, so an open loop only costs its gap. O(triangles).
 */
import type { SupportComponent, SupportPart } from '@mixo-geocore/host/core/supports/mesh';
import { readGlbWorldMeshes, type WorldMesh } from './glbWorld';

export const PEEL_LAYER_MM = 0.05;
/** Our layer counts as worse than the owner layer when it is more than this share larger. */
export const PEEL_OVER_RATIO = 1.1;
/** Default neck and pillar diameters (mm); the build data carries no per-part diameter. */
export const NECK_DIAMETER_MM = 0.3;
export const PILLAR_DIAMETER_MM = 1.1;
const CHART_POINTS = 240;

/** Welded shell index of every triangle of a mesh (vertices equal within 0.005 mm join; unindexed STL-style meshes work too). */
function shellOfTriangles(p: Float64Array, ix: Uint32Array): Int32Array {
  const parent: number[] = [];
  const ids = new Map<number, number>();
  const find = (x: number): number => { while (parent[x] !== x) { parent[x] = parent[parent[x]!]!; x = parent[x]!; } return x; };
  const byIndex = new Map<number, number>();
  const vertex = (v: number): number => {
    const known = byIndex.get(v);
    if (known !== undefined) return known;
    const q = (o: number) => Math.round(p[v * 3 + o]! * 200) + 65536;
    const key = (q(0) * 131072 + q(1)) * 131072 + q(2);
    let id = ids.get(key);
    if (id === undefined) { id = parent.length; parent.push(id); ids.set(key, id); }
    byIndex.set(v, id);
    return id;
  };
  const tri = new Int32Array(ix.length / 3);
  for (let t = 0; t < ix.length; t += 3) {
    const r = find(vertex(ix[t]!));
    for (const k of [1, 2]) { const o = find(vertex(ix[t + k]!)); if (o !== r) parent[o] = r; }
  }
  for (let t = 0; t < ix.length; t += 3) tri[t / 3] = find(vertex(ix[t]!));
  return tri;
}

/**
 * Area (mm²) of every layer of `meshes` cut at the layer middles; index k is the layer [k, k+1) * layerMm above y = 0.
 * Each connected shell is summed on its own and given the sign that makes its total positive, so a file whose
 * shells are wound in mixed directions (the owner's -sup file) does not cancel; a shell inside another shell
 * (a cavity) therefore counts as solid, which is not a case in these prints.
 */
export function sliceAreas(meshes: WorldMesh[], layerMm: number, layerCount: number): Float64Array {
  const total = new Float64Array(layerCount);
  for (const { positions: p, indices: ix } of meshes) {
    const shell = shellOfTriangles(p, ix);
    const series = new Map<number, Float64Array>();
    for (let t = 0; t < ix.length; t += 3) {
      const a = ix[t]! * 3, b = ix[t + 1]! * 3, c = ix[t + 2]! * 3;
      const ya = p[a + 1]!, yb = p[b + 1]!, yc = p[c + 1]!;
      const lo = Math.min(ya, yb, yc), hi = Math.max(ya, yb, yc);
      if (hi <= lo) continue;
      // The normal's horizontal part gives the segment direction (the same sign for every triangle).
      const ux = p[b]! - p[a]!, uy = yb - ya, uz = p[b + 2]! - p[a + 2]!, vx = p[c]! - p[a]!, vy = yc - ya, vz = p[c + 2]! - p[a + 2]!;
      const nx = uy * vz - uz * vy, nz = ux * vy - uy * vx;
      const first = Math.max(0, Math.ceil(lo / layerMm - 0.5)), last = Math.min(layerCount - 1, Math.ceil(hi / layerMm - 0.5) - 1);
      if (last < first) continue;
      let sum = series.get(shell[t / 3]!);
      if (!sum) series.set(shell[t / 3]!, sum = new Float64Array(layerCount));
      for (let k = first; k <= last; k++) {
        const y = (k + 0.5) * layerMm;
        const hit: number[] = [];
        for (const [i, j] of [[a, b], [b, c], [c, a]] as const) {
          const yi = p[i + 1]!, yj = p[j + 1]!;
          if ((yi <= y) === (yj <= y)) continue;
          const f = (y - yi) / (yj - yi);
          hit.push(p[i]! + f * (p[j]! - p[i]!), p[i + 2]! + f * (p[j + 2]! - p[i + 2]!));
        }
        if (hit.length < 4) continue;
        let [x1, z1, x2, z2] = hit as [number, number, number, number];
        // Direction: perpendicular to the normal's horizontal part (nx, nz).
        if ((x2 - x1) * nz - (z2 - z1) * nx < 0) [x1, z1, x2, z2] = [x2, z2, x1, z1];
        sum[k]! += (x1 * z2 - x2 * z1) / 2;
      }
    }
    for (const sum of series.values()) {
      const flip = sum.reduce((s, v) => s + v, 0) < 0 ? -1 : 1;
      for (let k = 0; k < layerCount; k++) total[k]! += sum[k]! * flip;
    }
  }
  return total.map((v) => Math.max(0, v));
}

/** Layers [0, result) are the raft: the first layer inside the first 4 mm whose area falls below a quarter of the largest area before it (0 when there is no such drop). */
export function raftLayers(areas: Float64Array, layerMm: number): number {
  let peak = 0;
  for (let k = 0; k < Math.min(areas.length, Math.ceil(4 / layerMm)); k++) {
    if (peak > 0 && areas[k]! < peak * 0.25) return k;
    peak = Math.max(peak, areas[k]!);
  }
  return 0;
}

export interface TrunkLoad {
  /** Plate-reaching support trees (groups of tip/neck/pillar/branch/trunk parts joined to a foot). */
  trunks: number;
  maxTipsPerTrunk: number;
  /** Trunk cross-section / sum of the necks it feeds, for the tree with the most tips (default diameters); null without one. */
  trunkToNeckArea: number | null;
  note: string;
}

const JOINED: ReadonlySet<SupportPart> = new Set(['tip', 'neck', 'pillar', 'foot', 'tree-branch', 'tree-trunk']);

/** Tips per support tree, from the build's component tags: parts join where they share a vertex position (0.01 mm); raft and braces do not join. */
export function trunkLoad(positions: ArrayLike<number>, indices: ArrayLike<number>, components: SupportComponent[]): TrunkLoad {
  if (components.length === 0) return { trunks: 0, maxTipsPerTrunk: 0, trunkToNeckArea: null, note: 'no component tags in this build' };
  const ids = new Map<string, number>();
  const parent: number[] = [];
  const find = (x: number): number => { while (parent[x] !== x) { parent[x] = parent[parent[x]!]!; x = parent[x]!; } return x; };
  const vertex = (v: number): number => {
    const key = `${Math.round(positions[v * 3]! * 100)},${Math.round(positions[v * 3 + 1]! * 100)},${Math.round(positions[v * 3 + 2]! * 100)}`;
    let id = ids.get(key);
    if (id === undefined) { id = parent.length; parent.push(id); ids.set(key, id); }
    return id;
  };
  const joined = components.filter((c) => JOINED.has(c.part) && c.count > 0);
  for (const c of joined) {
    for (let i = c.start; i < c.start + c.count; i += 3) {
      const r = find(vertex(indices[i]!));
      for (const k of [1, 2]) parent[find(vertex(indices[i + k]!))] = r;
    }
  }
  // This build has no separate 'tip' parts (the contact tip is part of the neck), so a neck counts as one tip then.
  const tipPart: SupportPart = joined.some((c) => c.part === 'tip') ? 'tip' : 'neck';
  const tree = new Map<number, { tips: Set<string>; foot: boolean }>();
  for (const c of joined) {
    const root = find(vertex(indices[c.start]!));
    let s = tree.get(root);
    if (!s) tree.set(root, s = { tips: new Set(), foot: false });
    if (c.part === tipPart) s.tips.add(c.contactId ?? `${c.start}`);
    if (c.part === 'foot') s.foot = true;
  }
  const reaching = [...tree.values()].filter((s) => s.foot && s.tips.size > 0);
  if (reaching.length === 0) return { trunks: 0, maxTipsPerTrunk: 0, trunkToNeckArea: null, note: 'no support tree with a foot and tips found' };
  const best = reaching.reduce((m, s) => (s.tips.size > m.tips.size ? s : m));
  const ratio = (PILLAR_DIAMETER_MM / NECK_DIAMETER_MM) ** 2 / best.tips.size;
  return { trunks: reaching.length, maxTipsPerTrunk: best.tips.size, trunkToNeckArea: +ratio.toFixed(2),
    note: `default diameters: neck ${NECK_DIAMETER_MM} mm, pillar/trunk ${PILLAR_DIAMETER_MM} mm` };
}

export interface PeelReport {
  layerMm: number;
  layers: number;
  /** Height (mm) of the raft top: layers below it are left out of every number here (null: no raft found). */
  raftTopMm: number | null;
  /** Largest layer area (mm²) above the raft, ours / the owner print, and the height (mm above the plate) of each. */
  peelMaxOurs: number;
  peelMaxOursAtMm: number;
  peelMaxOwner: number | null;
  peelMaxOwnerAtMm: number | null;
  /** Layers above the raft where our area is more than 10% above the owner layer (null without an owner print). */
  peelLayersOver: number | null;
  /** Check: layers above the raft where our supports are absent (model only): their count and the median of our area / owner area there (null when none or no owner). */
  modelOnlyLayers: number;
  modelOnlyRatio: number | null;
  /** Most tips on one support tree; null when the build data carries no usable tree (shown as n/a). */
  maxTipsPerTrunk: number | null;
  trunkToNeckArea: number | null;
  trunkNote: string;
  /** Chart data: height of each point (mm) and the area of ours / the owner print there (the largest layer of its bin; the raft layers are included, so the chart shows them). */
  chart: { heightMm: number[]; ours: number[]; owner: number[] | null };
}

const round = (v: number) => +v.toFixed(2);

/** The report from the written review GLB and our built supports (unit-local mesh with its component tags). */
export function peelReport(glb: Buffer, supports: { positions: ArrayLike<number>; indices: ArrayLike<number>; components: SupportComponent[] }, layerMm = PEEL_LAYER_MM): PeelReport {
  const world = readGlbWorldMeshes(glb);
  const model = world.filter((m) => m.name.startsWith('TEAL denture model'));
  const pillars = world.filter((m) => m.name.startsWith('SUPPORT PILLARS (ours)'));
  const owner = world.filter((m) => m.name.startsWith('YOUR SUPPORTS'));
  let top = 0;
  for (const m of [...model, ...pillars, ...owner]) for (let i = 1; i < m.positions.length; i += 3) top = Math.max(top, m.positions[i]!);
  const layers = Math.max(1, Math.ceil(top / layerMm));
  const modelA = sliceAreas(model, layerMm, layers), pillarA = sliceAreas(pillars, layerMm, layers);
  const a = modelA.map((v, k) => v + pillarA[k]!);
  const o = owner.length > 0 ? sliceAreas(owner, layerMm, layers) : null;
  // The raft is the same for both prints (one plate): found on our series, cut from both.
  const raft = raftLayers(a, layerMm);
  let maxAt = raft, ownerAt = raft;
  for (let k = raft; k < layers; k++) { if (a[k]! > a[maxAt]!) maxAt = k; if (o && o[k]! > o[ownerAt]!) ownerAt = k; }
  const ratios: number[] = [];
  for (let k = raft; k < layers; k++) if (o && pillarA[k]! < 1e-6 && modelA[k]! > 1 && o[k]! > 1) ratios.push(a[k]! / o[k]!);
  ratios.sort((x, y) => x - y);
  const bin = Math.max(1, Math.ceil(layers / CHART_POINTS));
  const bins = Math.ceil(layers / bin);
  const binned = (s: Float64Array) => Array.from({ length: bins }, (_, n) => round(s.subarray(n * bin, (n + 1) * bin).reduce((m, v) => Math.max(m, v), 0)));
  const trunks = trunkLoad(supports.positions, supports.indices, supports.components);
  return {
    layerMm, layers, raftTopMm: raft > 0 ? round(raft * layerMm) : null,
    peelMaxOurs: round(a[maxAt]!), peelMaxOursAtMm: round((maxAt + 0.5) * layerMm),
    peelMaxOwner: o ? round(o[ownerAt]!) : null, peelMaxOwnerAtMm: o ? round((ownerAt + 0.5) * layerMm) : null,
    peelLayersOver: o ? a.reduce((n, v, k) => n + (k >= raft && v > o[k]! * PEEL_OVER_RATIO ? 1 : 0), 0) : null,
    modelOnlyLayers: ratios.length, modelOnlyRatio: ratios.length > 0 ? round(ratios[Math.floor(ratios.length / 2)]!) : null,
    maxTipsPerTrunk: trunks.trunks > 0 ? trunks.maxTipsPerTrunk : null, trunkToNeckArea: trunks.trunkToNeckArea, trunkNote: trunks.note,
    chart: { heightMm: Array.from({ length: bins }, (_, n) => round((n * bin + bin / 2) * layerMm)), ours: binned(a), owner: o ? binned(o) : null },
  };
}
