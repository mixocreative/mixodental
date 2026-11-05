import { anchorsInPlane, pathFrame, pathLength } from './frame';
import { MIN_CLOSED_ANCHORS, MIN_OPEN_ANCHORS, segments, type SurfacePath } from './path';

/*
 * Why a drawn path cannot be used, as a CODE rather than a sentence: this tree is portable and carries no
 * i18n, and the app ships in three languages, so the words belong to whoever shows them.
 *
 * The refusals are the ones that make a loop meaningless rather than merely ugly. A loop that crosses
 * itself has no inside, so anything built from its interior - the dental rim's visibility mask above all -
 * would be nonsense rather than wrong by a little. A sliver loop has an inside too small to mean anything.
 * Both are cheap to check here and expensive to discover later.
 */

export type SurfacePathProblem =
  | 'TOO_FEW_POINTS'
  | 'COLLINEAR'
  | 'DEGENERATE_AREA'
  | 'SELF_INTERSECTING';

/**
 * How thin a closed loop may be before its inside stops meaning anything, as `4 * PI * area / perimeter^2`
 * (1 for a circle, 0 for a line doubled back on itself). A hand-drawn rim round a dental arch is a long
 * thin ring and scores low on purpose, so this only has to catch the shapes with no interior at all.
 */
export const MIN_SHAPE_RATIO = 0.002;

/** Whether the two plane segments `p->p2` and `q->q2` properly cross. Shared endpoints do not count. */
function crosses(p: readonly [number, number], p2: readonly [number, number],
  q: readonly [number, number], q2: readonly [number, number]): boolean {
  const side = (a: readonly [number, number], b: readonly [number, number], c: readonly [number, number]): number =>
    (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
  const d1 = side(p, p2, q);
  const d2 = side(p, p2, q2);
  const d3 = side(q, q2, p);
  const d4 = side(q, q2, p2);
  // Strictly opposite sides on both segments: a clean crossing.
  if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) return true;
  // Collinear and overlapping counts too: a loop that doubles back along itself has no inside either.
  const between = (a: readonly [number, number], b: readonly [number, number], c: readonly [number, number]): boolean =>
    Math.min(a[0], b[0]) <= c[0] && c[0] <= Math.max(a[0], b[0]) && Math.min(a[1], b[1]) <= c[1] && c[1] <= Math.max(a[1], b[1]);
  if (d1 === 0 && between(p, p2, q)) return true;
  if (d2 === 0 && between(p, p2, q2)) return true;
  if (d3 === 0 && between(q, q2, p)) return true;
  return d4 === 0 && between(q, q2, p2);
}

/**
 * Whether any two non-adjacent segments cross, in the loop's own plane. Tested on the ANCHOR segments, not
 * on a resampled curve: a few dozen anchors make this cheap, and it is the operator's own shape that has
 * to make sense.
 */
export function selfIntersects(path: SurfacePath): boolean {
  const frame = pathFrame(path);
  if (!frame) return false;
  const flat = anchorsInPlane(path, frame);
  const edges = segments(path);
  for (let a = 0; a < edges.length; a += 1) {
    for (let b = a + 1; b < edges.length; b += 1) {
      const [a1, a2] = edges[a]!;
      const [b1, b2] = edges[b]!;
      // Segments sharing an anchor always "touch"; only a crossing elsewhere is a fault.
      if (a1 === b1 || a1 === b2 || a2 === b1 || a2 === b2) continue;
      if (crosses(flat[a1]!, flat[a2]!, flat[b1]!, flat[b2]!)) return true;
    }
  }
  return false;
}

/**
 * Everything wrong with `path`, worst first, or an empty list when it may be used. An OPEN path is only
 * asked for its two ends: a line lies in no particular plane, cannot enclose an area, and may legitimately
 * cross itself.
 */
export function pathProblems(path: SurfacePath): readonly SurfacePathProblem[] {
  const least = path.closed ? MIN_CLOSED_ANCHORS : MIN_OPEN_ANCHORS;
  if (path.anchors.length < least) return ['TOO_FEW_POINTS'];
  if (!path.closed) return [];

  // No plane at all: the anchors lie on a line. `pathFrame` fits the plane from the widest-spread
  // anchors precisely so that a loop CROSSING itself still gets one and is told so below, instead of
  // being called collinear.
  const frame = pathFrame(path);
  const perimeter = pathLength(path);
  if (!frame || !(perimeter > 0)) return ['COLLINEAR'];

  const problems: SurfacePathProblem[] = [];
  const ratio = (4 * Math.PI * (frame.planarDoubleArea / 2)) / (perimeter * perimeter);
  if (ratio < MIN_SHAPE_RATIO) problems.push('DEGENERATE_AREA');
  if (selfIntersects(path)) problems.push('SELF_INTERSECTING');
  return problems;
}

/** Whether `path` may be used as it is. */
export const pathUsable = (path: SurfacePath): boolean => pathProblems(path).length === 0;
