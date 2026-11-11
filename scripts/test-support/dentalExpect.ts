import { cross, dot, length, normalize, type Vector } from '@mixo-geocore/host/core/vec3';

/*
 * One pure helper for dental tests and the disposable orientation probe (kept when the TS oracle was
 * removed: the production detector lives in Rust, this only expresses an expectation).
 *
 * `rimContainsPoint` used to sit beside it and was deleted at MIXO-09: U8 ported the visibility
 * footprint to Rust `dental/legacy.rs`, and the TS copy stayed behind with no caller for a month
 * while `docs/SHIP-PLAN.md` still listed it as production code.
 */

/** The shortest Euler XYZ rotation that maps an accepted cavity opening to plate-down. */
export function rotationToPlateDown(openingDirection: Vector): Vector {
  if (!Number.isFinite(openingDirection[0]) || !Number.isFinite(openingDirection[1]) || !Number.isFinite(openingDirection[2]) || length(openingDirection) === 0) {
    throw new RangeError('openingDirection must be a finite non-zero vector');
  }
  const from = normalize(openingDirection);
  const to: Vector = [0, -1, 0];
  const alignment = Math.max(-1, Math.min(1, dot(from, to)));
  if (alignment > 1 - 1e-12) return [0, 0, 0];
  let axis = cross(from, to);
  let w = 1 + alignment;
  if (w < 1e-10) {
    axis = Math.abs(from[0]) < 0.9 ? normalize(cross(from, [1, 0, 0])) : normalize(cross(from, [0, 0, 1]));
    w = 0;
  }
  const size = Math.hypot(axis[0], axis[1], axis[2], w);
  const [x, y, z] = axis.map((value) => value / size) as Vector;
  const qw = w / size;
  const m11 = 1 - 2 * (y * y + z * z);
  const m12 = 2 * (x * y - z * qw);
  const m13 = 2 * (x * z + y * qw);
  const m23 = 2 * (y * z - x * qw);
  const m33 = 1 - 2 * (x * x + y * y);
  return [
    Math.atan2(-m23, m33),
    Math.asin(Math.max(-1, Math.min(1, m13))),
    Math.atan2(-m12, m11),
  ];
}
