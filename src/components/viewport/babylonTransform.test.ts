import * as THREE from 'three';
import { Matrix, Vector3 } from '@babylonjs/core/Maths/math.vector';
import { describe, expect, it } from 'vitest';
import type { ModelTransform } from '@mixo-geocore/host/state/transform';
import { babylonPlacement, rotationQuaternion } from './babylonTransform';

/*
 * The contract: a unit placed by the Babylon path lands exactly where the three.js path puts it.
 * Compared against three's own matrix rather than against hand-written numbers, so this stays
 * honest if either library changes its mind about Euler order.
 *
 * The two libraries' arrays compare ELEMENT FOR ELEMENT, which is not obvious and is worth knowing
 * once: three is column-major over column vectors, Babylon is row-major over row vectors, and the
 * two transposes cancel. Both therefore hold the translation at offsets 12..14. Writing a transpose
 * in here "to be safe" is what made the first draft of this file fail.
 */

const ONE = new Vector3(1, 1, 1);

function threeElements(transform: ModelTransform): Float32Array | number[] {
  const object = new THREE.Object3D();
  object.position.set(...transform.position);
  object.rotation.set(...transform.rotation);
  object.updateMatrix();
  return object.matrix.elements;
}

function babylonMatrix(transform: ModelTransform): Matrix {
  const { position, rotationQuaternion: q } = babylonPlacement(transform);
  const out = Matrix.Identity();
  Matrix.ComposeToRef(ONE, q, position, out);
  return out;
}

const TRANSFORMS: Array<[string, ModelTransform]> = [
  ['identity', { position: [0, 0, 0], rotation: [0, 0, 0] }],
  ['translation only', { position: [12, -3.5, 40], rotation: [0, 0, 0] }],
  ['one axis', { position: [0, 0, 0], rotation: [Math.PI / 3, 0, 0] }],
  ['two axes', { position: [0, 0, 0], rotation: [0.4, -1.1, 0] }],
  ['all three, the case a naive copy gets wrong', { position: [5, 1, -2], rotation: [0.4, -1.1, 2.3] }],
];

describe('a unit placed on a Babylon mesh', () => {
  it.each(TRANSFORMS)('matches the three.js matrix: %s', (_name, transform) => {
    const three = threeElements(transform);
    const babylon = babylonMatrix(transform);
    for (let at = 0; at < 16; at += 1) {
      expect(babylon.m[at]).toBeCloseTo(three[at]!, 6);
    }
  });

  it('does not lean on Babylon’s own Euler order', () => {
    // Proof the conversion is doing work rather than passing numbers through: Babylon's
    // yaw-pitch-roll reading of the SAME three numbers is a different rotation, so copying
    // `rotation` onto `mesh.rotation` would have placed the model wrongly.
    const rotation: ModelTransform['rotation'] = [0.4, -1.1, 2.3];
    const naive = Matrix.RotationYawPitchRoll(rotation[1], rotation[0], rotation[2]);
    const correct = Matrix.Identity();
    rotationQuaternion(rotation).toRotationMatrix(correct);
    expect(naive.m[0]).not.toBeCloseTo(correct.m[0]!, 3);
  });
});
