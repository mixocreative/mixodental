import type { PrintUnit } from '../../../state/project';

/*
 * A denture's preview build reads the model, policy, settings, hand work and the generation frame the supports
 * were accepted at (`dentureJobOf`), never where the unit stands on the plate, and its mesh is unit-local. A move
 * that only slides the denture over the plate, or turns it about the plate's vertical, therefore asks the worker
 * for exactly the build it already has (proved on the real scan by rigidMove.real.test.ts). OK's re-arrangement
 * of the plate is such a move. This decides whether a scene change is one, so the build can be kept and moved
 * with the denture instead of rebuilt.
 */

const TOLERANCE = 1e-9;

type Euler = readonly number[];

/** The rotation matrix of an XYZ Euler angle triple (three.js order, the one the viewport applies), row-major. */
function matrixOf([x, y, z]: Euler): number[] {
  const [a, b, c, d, e, f] = [Math.cos(x!), Math.sin(x!), Math.cos(y!), Math.sin(y!), Math.cos(z!), Math.sin(z!)];
  return [c * e, -c * f, d, b * d * e + a * f, -b * d * f + a * e, -b * c, -a * d * e + b * f, a * d * f + b * e, a * c];
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
 * Whether `after` is `before` slid over the plate and/or turned about the vertical: every field but the transform is
 * the same object, the height is unchanged, and the turn (if any) is about the vertical.
 */
export function isRigidPlateMove(before: PrintUnit, after: PrintUnit): boolean {
  if (before === after || !before.denture || !before.supports || before.transform === after.transform) return false;
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  for (const key of keys) {
    if (key === 'transform') continue;
    if ((before as unknown as Record<string, unknown>)[key] !== (after as unknown as Record<string, unknown>)[key]) return false;
  }
  if (Math.abs(before.transform.position[1] - after.transform.position[1]) > TOLERANCE) return false;
  return turnsAboutVertical(before.transform.rotation, after.transform.rotation);
}

/**
 * The build to keep for `unit` when the scene changed from `previous` to it: the finished build of `previous` if the
 * change is a rigid plate move of a denture (`built` is that build's entry, its unit being `previous`), else undefined
 * and the unit is built again. The mesh is unit-local, so the same mesh is right for the unit where it now stands.
 */
export function keptBuild<M>(previous: PrintUnit | undefined, unit: PrintUnit, built: { unit: PrintUnit; mesh: M } | undefined): { unit: PrintUnit; mesh: M } | undefined {
  if (!previous || !built || built.unit !== previous || !isRigidPlateMove(previous, unit)) return undefined;
  return { unit, mesh: built.mesh };
}
