import type { DentalTiltState } from '../../../components/useDentalFlow';

/** A rotation as the scene stores it (x, y, z radians). */
type Vector = readonly [number, number, number];

type Ready = Extract<DentalTiltState, { status: 'ready' }>;

const SAME_RAD = 1e-6;

function samePose(a: Vector, b: Vector): boolean {
  return a.every((value, axis) => Math.abs(value - b[axis]!) <= SAME_RAD);
}

/**
 * The dial after the denture's pose changed from outside the dial (Undo, Redo, Restore step): the row whose
 * rotation is the pose now shown. A pose that is no row's (a hand turn) keeps the dial and marks it as by hand.
 * Returns the same object when the dial already agrees.
 */
export function dialFollowsPose(tilt: Ready, rotation: Vector): Ready {
  if (samePose(tilt.scan.rows[tilt.index]!.rotation, rotation)) return tilt;
  const index = tilt.scan.rows.findIndex((row) => samePose(row.rotation, rotation));
  if (index < 0) return tilt.hand ? tilt : { ...tilt, hand: true };
  return { ...tilt, index, hand: index !== tilt.scan.order[0] };
}
