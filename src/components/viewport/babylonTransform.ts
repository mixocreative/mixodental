import { Matrix, Quaternion, Vector3 } from '@babylonjs/core/Maths/math.vector';
import type { ModelTransform } from '@mixo-geocore/host/state/transform';

/*
 * One job: a unit's transform placed on a Babylon mesh.
 *
 * THE TRAP THIS EXISTS FOR. A `ModelTransform` rotation is a three.js Euler in XYZ order. Babylon's
 * `mesh.rotation` is NOT the same thing: it is yaw-pitch-roll, applied Y then X then Z. Copying the
 * three numbers across gives the right answer for a rotation about one axis and a silently wrong
 * one for any compound rotation — the exact defect that looks like "the model is slightly off" and
 * gets chased in the engine for a day. So the rotation is converted through a quaternion, and
 * `babylonTransform.test.ts` holds the result against three's own matrix, element by element.
 */

/** The unit's rotation as a quaternion, from a three.js XYZ Euler. */
export function rotationQuaternion(rotation: ModelTransform['rotation']): Quaternion {
  const [x, y, z] = rotation;
  // three's 'XYZ' Euler is Rx · Ry · Rz on column vectors, so on Babylon's row vectors the same
  // rotation composes in the reverse order: Rz, then Ry, then Rx.
  return Quaternion.FromRotationMatrix(
    Matrix.RotationZ(z).multiply(Matrix.RotationY(y)).multiply(Matrix.RotationX(x)),
  );
}

/** What a Babylon mesh needs to sit where the unit sits. `rotation` is left unset on purpose. */
export function babylonPlacement(transform: ModelTransform): { position: Vector3; rotationQuaternion: Quaternion } {
  const [px, py, pz] = transform.position;
  return { position: new Vector3(px, py, pz), rotationQuaternion: rotationQuaternion(transform.rotation) };
}
