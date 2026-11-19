// Copyright (c) Mixo Creative.

/**
 * WHAT A TURN DOES TO THE SUPPORTS ALREADY BUILT - the one rule, in one place.
 *
 * The owner's ruling (`docs/design.md#2026-11-18-card-deck-plan`, ruling 1): re-orienting clears
 * supports, because supports are planted for ONE pose against gravity and a model that has been
 * turned is a different print. Industry standard, and it also deletes a defect class - the hand
 * edits keyed to those supports' positions go with them, visibly, so nothing is left to re-key in
 * silence.
 *
 * NOT EVERY TURN, and this is the part a blanket rule would have got wrong. A turn about the
 * PLATE'S VERTICAL changes nothing about which way gravity pulls on the model: the supports go
 * round with it and the build is bit-for-bit the one already in hand. That is not an opinion -
 * `rigidMove.real.test.ts` proves it on a real denture scan, to 1e-5 mm in every support position
 * and exactly in the exported bytes, and `keepsBuild` relies on it to move a finished denture
 * across the plate without a rebuild. A rule that cleared on any rotation would throw away supports
 * that are still correct, and break that proof.
 *
 * So the test is: the rotation changed, AND the change is not a turn about the vertical.
 */

const TOLERANCE = 1e-9;

type Euler = readonly number[];

/** The rotation matrix of an XYZ Euler angle triple (three.js order, the one the viewport applies), row-major. */
function matrixOf([x, y, z]: Euler): number[] {
  const [a, b, c, d, e, f] = [Math.cos(x!), Math.sin(x!), Math.cos(y!), Math.sin(y!), Math.cos(z!), Math.sin(z!)];
  return [c * e, -c * f, d, b * d * e + a * f, -b * d * f + a * e, -b * c, -a * d * e + b * f, a * d * f + b * e, a * c];
}

/**
 * Whether this transform change touched the rotation at all.
 *
 * EXACT EQUALITY ON THE THREE NUMBERS, not a tolerance, and deliberately: the question is "did this
 * command change the rotation", which identical numbers answer without an epsilon anyone would have
 * to defend. Ordinary plate moves carry the rotation through unchanged, so they answer no and a
 * nudge across the view never dates anything.
 */
export function rotationChanged(before: Euler, after: Euler): boolean {
  return after.some((angle, axis) => angle !== before[axis]);
}

/** Whether turning from rotation `before` to `after` is a turn about the vertical (Y) axis alone. */
export function turnsAboutVertical(before: Euler, after: Euler): boolean {
  const a = matrixOf(before);
  const b = matrixOf(after);
  // relative = after * before^T
  const rel = (row: number, col: number) => [0, 1, 2].reduce((sum, k) => sum + b[row * 3 + k]! * a[col * 3 + k]!, 0);
  return Math.abs(rel(1, 1) - 1) < TOLERANCE && Math.abs(rel(0, 1)) < TOLERANCE && Math.abs(rel(1, 0)) < TOLERANCE && Math.abs(rel(1, 2)) < TOLERANCE && Math.abs(rel(2, 1)) < TOLERANCE;
}

/**
 * Whether going from `before` to `after` is a RE-ORIENT: a turn that leaves the supports already
 * built belonging to a pose that no longer exists, so they have to go.
 *
 * The reducer applies this (`transform/set` in `project.ts`), which is what makes it unskippable -
 * every door into a rotation goes through one command. The UI asks this same function what it is
 * about to cost, so the warning and the deletion can never disagree.
 */
export function reorients(before: Euler, after: Euler): boolean {
  return rotationChanged(before, after) && !turnsAboutVertical(before, after);
}
