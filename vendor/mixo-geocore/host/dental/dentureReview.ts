import type { TriangleMesh } from '../core/analysis/types';
import type { Vector } from '../core/vec3';
import { withDentalMesh, type DentureReviewResultLike } from './dentalEngine';

/*
 * Review layers of the owner denture rules (Rust `dental::denture::review` through
 * `denture_review`): the no-support and allowed face masks, every hard edge, the down-facing hard edges, the middle
 * plane (and the chains it is fitted through), the tight box  and the generated tips with their pillar inputs, all in the unit-local mesh frame (mm),
 * independent of how the file was oriented. The host only decodes; the batch draws layers.
 */

/** Stream codes of a tip's `stream`. */
/** Source tags: `low` low point, `area` down-facing area grid, `rim` along the rim, `hole` around a hole loop (`bar`, `light` are the old streams). */
export const TIP_STREAM = ['low', 'area', 'bar', 'light', 'rim', 'hole'] as const;

/** One line segment. */
export type Segment = [Vector, Vector];

export interface DentureReview {
  /** Step 1, per face: 1 when a 45 degree front-top parallel ray hits it first (NO_SUPPORT before the override), else 0. */
  noSupportMask: Uint8Array;
  /** Step 2, per face: 1 when a ray from the back origin reaches it first (ALLOWED; overrides no-support; tips stand only here), else 0. */
  allowedMask: Uint8Array;
  /** Every hard edge. */
  hardEdges: Segment[];
  /** The hard edges that face down in the oriented pose (before the print tilt): the support candidates. */
  downEdges: Segment[];
  /** The down-facing hard edges joined into continuous lines (gaps bridged), each a polyline to draw as one line; `length` in mm. */
  downChains: { points: Vector[]; length: number }[];
  /** The tight oriented box; `centre` is the point rays are cast from. */
  box: { centre: Vector; axes: [Vector, Vector, Vector]; half: Vector };
  /** Oral cavity ray origin: on the rim plane, at the back edge of the tight box, on the symmetry plane; the allowed-area rays start here. */
  oralCavityRay: Vector;
  /** The unit 45 degree no-support ray direction (front-top toward back-bottom). */
  noSupportDir: Vector;
  /** Overhang candidates, per face: 1 when within 60 degrees of straight down for the reviewed plate normal. */
  downMask: Uint8Array;
  /** Tips on an overhang with no free path to the plate: not built, never rooted on the model. */
  unsupportable: { position: Vector; normal: Vector; stream: (typeof TIP_STREAM)[number]; face: number }[];
  /** Low points after the tilt outside the allowed area (left unsupported), with the face each sits on. */
  lowsOutside: { position: Vector; face: number }[];
  /** Lowest points that got a tip and the clause that admitted each (`lowTipReason`): in the allowed area, outside the no-support zone, or within profile `lowRimBandMm` of the rim. A low point in the no-support zone and farther from the rim gets none and stays in `lowsOutside`. */
  lowTips: { position: Vector; lowTipReason: 'allowed' | 'outsideNoSupport' | 'rimBand' }[];
  /** Allowed low points no tip reaches. */
  lowsUnreached: { position: Vector; face: number }[];
  /** Candidates released because their face is not an overhang for the plate normal. */
  released: number;
  /** Rim plane (least squares through the rim loop points, normal to the top), absent without a rim. */
  rimPlane?: { point: Vector; normal: Vector };
  /** Symmetry plane: the upright plane that splits the U left/right (normal = the left-right axis). */
  symmetryPlane: { point: Vector; normal: Vector };
  /** The oriented pose's plate normal in the mesh frame; down is its reverse. */
  up: Vector;
  /** The tips; `face` is the mesh face each stands on. */
  tips: { position: Vector; normal: Vector; stream: (typeof TIP_STREAM)[number]; face: number }[];
  /** The rim (low points joined over the mesh edges, engine 20): one or more ordered polylines; `edges` are the mesh edge ids (segment k joins point k and k + 1, a closed line's last segment closes it). Absent without a rim. */
  rimLoops?: { lines: { points: Vector[]; edges: number[]; closed: boolean }[]; lengthMm: number; allTheWayRound: boolean; largestGapDeg: number };
  /** Hole outlines (hit points around each hole seen along the teeth axis, canonical pose) with the hole area and the count of faces next to it. */
  holeOutlines: { points: Vector[]; areaMm2: number; faceCount: number }[];
  /** Per face: 1 within 5 mm along the surface of a hole (support-allowed). */
  holeBandMask: Uint8Array;
  /** Per face: 1 within the rim band (profile `rimBandMm`) of the rim line: support-allowed outside the oral cavity area. */
  rimBandMask: Uint8Array;
  /** The ray test's up decision (absent for a mesh with no box): the median travel before the first hit near the + and the - end of the up axis (the end whose rays reach farther is the top), their margin, and the arch frame's up before it. */
  upDecision?: {
    /** T1b ray-median numbers: diagnostic only since ABI 23 (axis, medians at the + / - end, margin, hits). */
    axis: number; medianMm: [number, number]; marginMm: number; hits: [number, number];
    decided: boolean; flipped: boolean;
    /** Up as decided by the front/back result (from the back, the open end of the U, toward the front). */
    up: Vector; archUpBefore: Vector;
    /** Section slices: how many name the chosen top, name the other side, did not vote. */
    sliceVotes: { for: number; against: number; abstain: number };
    /** Share of voting slices that agree (0 when none voted: the arch frame's teeth side was kept). */
    confidence: number;
    /** The crown (top) side. */
    top: Vector;
    teethFlipped: boolean;
    /** Front/back from the arch footprint; absent for a mesh with no footprint. */
    frontBack?: { back: Vector; widthMargin: number; crossCheckAgrees: boolean; endWidthMm: [number, number] };
  };
  /** Pillar geometry inputs, mm: contact ball, frustum base, neck length, pillar diameter, lift off the plate. */
  pillar: { tipBall: number; frustumBase: number; neckLength: number; pillarDiameter: number; lift: number };
}

const triple = (a: ArrayLike<number>, at: number): Vector => [a[at]!, a[at + 1]!, a[at + 2]!];
const lows = (flat: ArrayLike<number>, faces: ArrayLike<number>) => Array.from({ length: faces.length }, (_, k) => ({ position: triple(flat, k * 3), face: faces[k]! }));
const segments = (flat: ArrayLike<number>): Segment[] => Array.from({ length: flat.length / 6 }, (_, k) => [triple(flat, k * 6), triple(flat, k * 6 + 3)]);

/** Decodes and frees a `denture_review` result. */
export function decodeDentureReview(result: DentureReviewResultLike): DentureReview {
  try {
    const box = result.box_();
    const rimPlane = result.rim_plane();
    const symmetry = result.symmetry_plane();
    const tips = result.tips();
    const faces = result.tip_faces();
    const pillar = result.pillar();
    const rimFlat = result.rim_loops();
    const rimSizes = result.rim_sizes();
    const rimClosed = result.rim_closed();
    const rimEdges = result.rim_edges();
    const rimInfo = result.rim_info();
    const holeFlat = result.hole_outlines();
    const holeSizes = result.hole_sizes();
    const holeInfo = result.hole_info();
    const decision = result.up_decision();
    return {
      rimLoops: rimSizes.length === 0 ? undefined : (() => {
        let at = 0;
        let edgeAt = 0;
        const lines = Array.from(rimSizes, (n, k) => {
          const closed = rimClosed[k] === 1;
          const edgeCount = closed ? n : n - 1;
          const points = Array.from({ length: n }, (_, i) => triple(rimFlat, (at + i) * 3));
          const edges = Array.from(rimEdges.slice(edgeAt, edgeAt + edgeCount));
          at += n;
          edgeAt += edgeCount;
          return { points, edges, closed };
        });
        return { lines, lengthMm: rimInfo[0]!, allTheWayRound: rimInfo[2] === 1, largestGapDeg: rimInfo[3]! };
      })(),
      holeOutlines: (() => {
        let at = 0;
        return Array.from(holeSizes, (n, k) => {
          const points = Array.from({ length: n }, (_, i) => triple(holeFlat, (at + i) * 3));
          at += n;
          return { points, areaMm2: holeInfo[k * 2]!, faceCount: holeInfo[k * 2 + 1]! };
        });
      })(),
      holeBandMask: result.hole_band_mask(),
      rimBandMask: result.rim_band_mask(),
      upDecision: decision.length === 0 ? undefined : {
        axis: decision[0]!, decided: decision[1] === 1, flipped: decision[2] === 1, medianMm: [decision[3]!, decision[4]!], marginMm: decision[5]!,
        hits: [decision[6]!, decision[7]!], up: triple(decision, 8), archUpBefore: triple(decision, 11),
        sliceVotes: { for: decision[14]!, against: decision[15]!, abstain: decision[16]! },
        confidence: decision[17]!, top: triple(decision, 18), teethFlipped: decision[21] === 1,
        frontBack: Number.isNaN(decision[22]) ? undefined : {
          back: triple(decision, 22), widthMargin: decision[25]!, crossCheckAgrees: decision[26] === 1, endWidthMm: [decision[27]!, decision[28]!],
        },
      },
      noSupportMask: result.no_support_mask(),
      allowedMask: result.allowed_mask(),
      hardEdges: segments(result.hard_edges()),
      downEdges: segments(result.down_edges()),
      downChains: (() => {
        const flat = result.chain_points();
        const sizes = result.chain_sizes();
        const lengths = result.chain_lengths();
        let at = 0;
        return Array.from(sizes, (n, k) => {
          const points = Array.from({ length: n }, (_, i) => triple(flat, (at + i) * 3));
          at += n;
          return { points, length: lengths[k]! };
        });
      })(),
      box: { centre: triple(box, 0), axes: [triple(box, 3), triple(box, 6), triple(box, 9)], half: triple(box, 12) },
      oralCavityRay: triple(result.oral_cavity_ray(), 0),
      noSupportDir: triple(result.no_support_dir(), 0),
      lowsOutside: lows(result.lows_outside(), result.lows_outside_faces()),
      lowTips: (() => {
        const flat = result.low_tip_points();
        const reasons = result.low_tip_reasons();
        return Array.from(reasons, (reason, k) => ({ position: triple(flat, k * 3), lowTipReason: reason === 0 ? 'allowed' as const : reason === 1 ? 'outsideNoSupport' as const : 'rimBand' as const }));
      })(),
      lowsUnreached: lows(result.lows_unreached(), result.lows_unreached_faces()),
      downMask: result.down_mask(),
      unsupportable: (() => {
        const u = result.unsupportable();
        return Array.from({ length: u.length / 7 }, (_, k) => ({ position: triple(u, k * 7), normal: triple(u, k * 7 + 3), stream: TIP_STREAM[u[k * 7 + 6]!]!, face: -1 }));
      })(),
      released: result.released(),
      rimPlane: rimPlane.length === 6 ? { point: triple(rimPlane, 0), normal: triple(rimPlane, 3) } : undefined,
      symmetryPlane: { point: triple(symmetry, 0), normal: triple(symmetry, 3) },
      up: triple(result.up(), 0),
      tips: Array.from({ length: tips.length / 7 }, (_, k) => ({ position: triple(tips, k * 7), normal: triple(tips, k * 7 + 3), stream: TIP_STREAM[tips[k * 7 + 6]!]!, face: faces[k]! })),
      pillar: { tipBall: pillar[0]!, frustumBase: pillar[1]!, neckLength: pillar[2]!, pillarDiameter: pillar[3]!, lift: pillar[4]! },
    };
  } finally {
    result.free();
  }
}

/** The review of `mesh` (unit-local) for the denture type `profile`, or `undefined` for a mesh too small to have a box. */
export function reviewDenture(mesh: TriangleMesh, profile: string, tiltDeg = 0): DentureReview | undefined {
  return withDentalMesh(mesh, (session, model) => {
    const result = session.denture_review(model, profile, tiltDeg);
    return result ? decodeDentureReview(result) : undefined;
  });
}

/** Face classes of `compareDentureAreas`: neither, owner only, generated only, both (paint in three colours). */
export const AREA_CLASS = { neither: 0, ownerOnly: 1, generatedOnly: 2, both: 3 } as const;

export interface DentureAreaComparison {
  /** Per face, an `AREA_CLASS` code. */
  mask: Uint8Array;
  ownerMm2: number;
  generatedMm2: number;
  bothMm2: number;
  /** Share (0..1) of the owner area also in the generated area. */
  coverage: number;
  /** Share (0..1) of the generated area outside the owner area. */
  extra: number;
}

/**
 * Support areas compared: faces whose centroid lies within `radiusMm` (2 by the owner) of the owner
 * contacts, of the generated tips, of both. Points are in the unit-local mesh frame.
 */
export function compareDentureAreas(mesh: TriangleMesh, owner: readonly Vector[], generated: readonly Vector[], radiusMm = 2): DentureAreaComparison {
  return withDentalMesh(mesh, (session, model) => {
    const result = session.denture_compare_areas(model, Float64Array.from(owner.flat()), Float64Array.from(generated.flat()), radiusMm);
    try {
      const [ownerMm2, generatedMm2, bothMm2] = result.areas() as unknown as [number, number, number];
      return { mask: result.mask(), ownerMm2, generatedMm2, bothMm2,
        coverage: bothMm2 / Math.max(ownerMm2, 1e-12), extra: (generatedMm2 - bothMm2) / Math.max(generatedMm2, 1e-12) };
    } finally {
      result.free();
    }
  });
}
