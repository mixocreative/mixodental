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

/**
 * The inverse of `rotationQuaternion`: a Babylon quaternion read back as a three.js XYZ Euler,
 * which is the order `ModelTransform` is stored in.
 *
 * It is written out rather than taken from Babylon's `toEulerAngles`, which returns yaw-pitch-roll
 * (Y, X, Z) -- a DIFFERENT decomposition of the same rotation. Feed that into a `ModelTransform`
 * and the numbers look reasonable, round-trip through `rotationQuaternion` into a different
 * rotation, and the model jumps the moment anything re-reads its transform.
 */
export function eulerFromQuaternion(quaternion: Quaternion): [number, number, number] {
  const m = Matrix.Identity();
  quaternion.toRotationMatrix(m);
  const e = m.m;
  // Babylon stores row-major over row vectors and three column-major over column vectors, so the
  // two transposes cancel and these are three's own indices (see babylonTransform.test.ts).
  const [m11, m12, m13] = [e[0]!, e[4]!, e[8]!];
  const [m22, m23] = [e[5]!, e[9]!];
  const [m32, m33] = [e[6]!, e[10]!];
  const y = Math.asin(Math.min(1, Math.max(-1, m13)));
  // Near a pole the other two axes are no longer separable; three resolves it the same way, by
  // folding the rotation into x and leaving z at zero.
  if (Math.abs(m13) < 0.9999999) return [Math.atan2(-m23, m33), y, Math.atan2(-m12, m11)];
  return [Math.atan2(m32, m22), y, 0];
}

/** A gizmo-moved Babylon mesh's placement, in the frame `ModelTransform` is stored in. */
export function transformFromMesh(mesh: { position: Vector3; rotationQuaternion: Quaternion | null }): ModelTransform {
  const { position, rotationQuaternion } = mesh;
  return {
    position: [position.x, position.y, position.z],
    rotation: rotationQuaternion ? eulerFromQuaternion(rotationQuaternion) : [0, 0, 0],
  };
}
