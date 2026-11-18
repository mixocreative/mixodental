import { DEFAULT_DENTAL_LABEL } from '@mixo-geocore/host/dental/label';
import { resolveSettings } from '@mixo-geocore/host/supports/unitSupports';
import { turnsAboutVertical } from '../../../state/rotation';
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

/*
 * THE VERTICAL-TURN TEST MOVED OUT, to `src/state/rotation.ts`, and this file is now a caller like
 * any other. The reducer needs the same question - a turn that is not about the vertical is a
 * re-orient and takes the supports with it - and two copies of one piece of rotation maths is two
 * things that drift, with this file's real-scan proof as the half that looks right either way.
 */

/**
 * Whether `after` is `before` slid over the plate and/or turned about the vertical: every field but the transform is
 * the same object, the height is unchanged, and the turn (if any) is about the vertical.
 */
export function isRigidPlateMove(before: PrintUnit, after: PrintUnit): boolean {
  return keepsBuild(before, after) && before.transform !== after.transform;
}

/**
 * Whether the build of `before` is also the build of `after`: the denture and its finished supports are the same,
 * every field but the transform, the settings and the tool revisions is the same object, the transform only slid or
 * turned the unit about the vertical, and the settings differ at most in an ID label that builds the same (empty is
 * the default label: OK writes it out, and the build already used it).
 *
 * `revisions` IS SKIPPED, and it has to be. It is bookkeeping about the ORDER work was accepted in
 * (`src/state/revisions.ts`) and says nothing about geometry, but a turn stamped it - so comparing
 * it here made every rigid turn of a denture look like a different build and threw away supports
 * that were still perfectly valid. A real-scan parity test caught it. Anything that asks "is this
 * the same build" must ignore this field for the same reason.
 *
 * SINCE 2026-11-19 A VERTICAL TURN NO LONGER STAMPS IT at all (`transform/set` in
 * `src/state/project.ts`), so this skip has less to do - but it stays, because the rule here is
 * about what the field MEANS, not about which writers happen to touch it today.
 */
export function keepsBuild(before: PrintUnit, after: PrintUnit): boolean {
  if (before === after || !before.denture || !before.supports) return false;
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  for (const key of keys) {
    if (key === 'transform' || key === 'settings' || key === 'revisions') continue;
    if ((before as unknown as Record<string, unknown>)[key] !== (after as unknown as Record<string, unknown>)[key]) return false;
  }
  if (!sameBuildSettings(before, after)) return false;
  if (Math.abs(before.transform.position[1] - after.transform.position[1]) > TOLERANCE) return false;
  return turnsAboutVertical(before.transform.rotation, after.transform.rotation);
}

/** The settings of both units build the same: equal, or equal but for a label that is the same text once the default is filled in. */
function sameBuildSettings(before: PrintUnit, after: PrintUnit): boolean {
  if (before.settings === after.settings) return true;
  const a = resolveSettings(before.settings) as unknown as Record<string, unknown>;
  const b = resolveSettings(after.settings) as unknown as Record<string, unknown>;
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const key of keys) {
    if (key === 'labelText') continue;
    if (JSON.stringify(a[key]) !== JSON.stringify(b[key])) return false;
  }
  return (a.labelText || DEFAULT_DENTAL_LABEL) === (b.labelText || DEFAULT_DENTAL_LABEL);
}

/**
 * The build to keep for `unit` when the scene changed from `previous` to it: the finished build of `previous` if the
 * change is a rigid plate move of a denture (`built` is that build's entry, its unit being `previous`), else undefined
 * and the unit is built again. The mesh is unit-local, so the same mesh is right for the unit where it now stands.
 */
export function keptBuild<M>(previous: PrintUnit | undefined, unit: PrintUnit, built: { unit: PrintUnit; mesh: M } | undefined): { unit: PrintUnit; mesh: M } | undefined {
  if (!previous || !built || built.unit !== previous || !keepsBuild(previous, unit)) return undefined;
  return { unit, mesh: built.mesh };
}
