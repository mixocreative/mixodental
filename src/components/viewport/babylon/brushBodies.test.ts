import { Matrix, Vector3 } from '@babylonjs/core/Maths/math.vector';
import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { babylonPlacement } from '../babylonTransform';
import { brushClip, eyeIn } from './brushBodies';

/*
 * ONE THING IS TESTED HERE, and it is the one that cannot be seen: the ORDER of the brush's clip
 * chain. Babylon multiplies the opposite way round from three.js, so the correct Babylon
 * expression is the mirror of the three.js one -- and the wrong one still produces a plausible
 * matrix, a confident hit, and supports that select where the pointer is not, only once a unit is
 * off the origin.
 *
 * So the test builds the SAME camera and the SAME unit placement in both libraries and asserts the
 * two flat matrices agree. Both are driven from plain matrices with no renderer: `brushClip` takes
 * the structural `BabylonCameraView`, which is what makes that possible.
 */

const POSITION = [11, -4, 7] as const;
const EULER = [0.2, -0.35, 0.5] as const;
const EYE = [40, 60, 90] as const;

/*
 * The unit's placement. The Babylon side goes through `babylonPlacement`, the app's own three-Euler
 * to Babylon-quaternion conversion, because Babylon's `Quaternion.FromEulerAngles` is a DIFFERENT
 * decomposition (yaw-pitch-roll) and composing with it here would test a rotation the app never
 * builds. An early draft of this test did exactly that and failed on a correct clip chain.
 */
const babylonWorld = () => {
  const { position, rotationQuaternion } = babylonPlacement({ position: [...POSITION], rotation: [...EULER] });
  const out = Matrix.Identity();
  Matrix.ComposeToRef(new Vector3(1, 1, 1), rotationQuaternion, position, out);
  return out;
};

const threeWorld = () => new THREE.Matrix4().compose(
  new THREE.Vector3(POSITION[0], POSITION[1], POSITION[2]),
  new THREE.Quaternion().setFromEuler(new THREE.Euler(EULER[0], EULER[1], EULER[2], 'XYZ')),
  new THREE.Vector3(1, 1, 1));

/** A right-handed perspective camera at `EYE` looking at the origin, in each library's own terms. */
const babylonCamera = () => {
  const view = Matrix.LookAtRH(new Vector3(EYE[0], EYE[1], EYE[2]), Vector3.Zero(), Vector3.Up());
  const projection = Matrix.PerspectiveFovRH((40 * Math.PI) / 180, 16 / 9, 0.5, 4000);
  return {
    getViewMatrix: () => view,
    getProjectionMatrix: () => projection,
    globalPosition: new Vector3(EYE[0], EYE[1], EYE[2]),
    mode: 0,
  };
};

const threeCamera = () => {
  const camera = new THREE.PerspectiveCamera(40, 16 / 9, 0.5, 4000);
  camera.position.set(EYE[0], EYE[1], EYE[2]);
  camera.up.set(0, 1, 0);
  camera.lookAt(0, 0, 0);
  camera.updateMatrixWorld(true);
  camera.updateProjectionMatrix();
  return camera;
};

describe('the brush clip chain', () => {
  it('agrees with three.js, element for element', () => {
    const camera = threeCamera();
    // Exactly what `screenBrushView` in useScreenBrush.ts builds: projection x view x group world.
    const expected = new THREE.Matrix4()
      .multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse)
      .multiply(threeWorld())
      .elements;
    const actual = brushClip(babylonWorld(), babylonCamera());
    expect(actual).toHaveLength(16);
    actual.forEach((value, at) => expect(value).toBeCloseTo(expected[at]!, 4));
  });

  it('puts the eye in the unit\'s own space, as three.js does', () => {
    const expected = new THREE.Vector3(EYE[0], EYE[1], EYE[2]).applyMatrix4(threeWorld().invert());
    const actual = eyeIn(babylonWorld(), babylonCamera());
    expect(actual[0]).toBeCloseTo(expected.x, 4);
    expect(actual[1]).toBeCloseTo(expected.y, 4);
    expect(actual[2]).toBeCloseTo(expected.z, 4);
  });

  // The order that would be written by habit, and the reason the test above exists.
  it('is NOT the three.js spelling of the same chain', () => {
    const camera = babylonCamera();
    const world = babylonWorld();
    const reversed = Array.from(camera.getProjectionMatrix().multiply(camera.getViewMatrix()).multiply(world).m);
    expect(reversed).not.toEqual(brushClip(world, camera));
  });
});
