import type { SupportPoint } from '@mixo-geocore/host/core/analysis/types';

/*
 * Which of Step 2's tip markers are drawn plain, solid or see-through -- the decision, with no
 * renderer in it, so the three.js view and the Babylon view show the same cones in the same three
 * states rather than two sets that resemble each other.
 *
 * It is here rather than inside `DentalTipMarkers` because that component is three.js to the bone
 * (instanced meshes, three materials) while the RULE is three set memberships. Everything the two
 * views must agree about lives on this side of that line.
 *
 * THE ORDER OF THE TESTS IS THE RULE: solid wins over ghost. A tip that is already selected and
 * also under the circle stays solid, because `brushPreview` has already decided what the circle
 * would do to it -- an Unselect sweep takes it OUT of `solid` and puts it in `ghost`, and a Select
 * sweep leaves it solid because selecting it again changes nothing.
 */

/** A tip as the markers need it (the preview's points and Step 2's contacts both fit). */
export type TipMark = Pick<SupportPoint, 'id' | 'position' | 'normal'>;

/** Tips shown selected (solid red), or previewed under Drag over (`ghost`, red to select or grey to unselect). */
export interface TipMarks {
  solid: ReadonlySet<string>;
  ghost: readonly string[];
  ghostTone: 'remove' | 'ring';
}

export interface TipMarkSets {
  /** Drawn small, in the tip colour. */
  plain: TipMark[];
  /** Drawn large, solid, in the remove colour. */
  solid: TipMark[];
  /** Drawn large, see-through, in `ghostTone`'s colour. */
  ghost: TipMark[];
}

/** Splits `points` three ways. With no marks every tip is plain, which is the no-brush case. */
export function splitTipMarks(points: readonly TipMark[], marks: TipMarks | undefined): TipMarkSets {
  if (!marks) return { plain: [...points], solid: [], ghost: [] };
  const ghosted = new Set(marks.ghost);
  const out: TipMarkSets = { plain: [], solid: [], ghost: [] };
  for (const point of points) (marks.solid.has(point.id) ? out.solid : ghosted.has(point.id) ? out.ghost : out.plain).push(point);
  return out;
}

/** three's sizes: the plain set small, the two marked sets larger so a sweep is read at a glance. */
export const TIP_SCALE = { plain: 0.42, marked: 0.6 } as const;
