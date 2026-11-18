// Copyright (c) Mixo Creative.

import * as THREE from 'three';
import { toGeometry } from './geometry';
import { deckRig, sizeRig } from './deckRig';
import { NO_TURN, orbitPosition, turnedBy, type Orbit } from '../../items/orbit';
import { thumbFraming } from '../../items/thumbnail';
import type { TriangleMesh } from '@mixo-geocore/host/core/analysis/types';
import type { Vector } from '@mixo-geocore/host/core/vec3';

/**
 * THE ONE CARD THE OPERATOR IS LOOKING AT, live and turnable. The GL half; `items/orbit.ts` holds
 * the maths and is where the behaviour is tested.
 *
 * Owner, 2026-11-18: *"the model thumnal is a 3d live render 3d space, not an image, it should
 * allow user to rotate the 3d model, and large enough to look around."*
 *
 * ONE MODEL IS LIVE AT A TIME, and that is the whole design rather than a limitation grudgingly
 * accepted. Sixty live canvases would be sixty WebGL contexts against a cap near sixteen, and sixty
 * uploaded meshes against a budget that fits one. So the deck's single rig (`deckRig.ts`) renders
 * this model and the result is COPIED into the card's own 2D canvas. The rig's canvas never enters
 * the document; the card owns a cheap 2D surface that holds the last frame for free.
 *
 * THE COPY IS SYNCHRONOUS, in the same task as the render. That is what lets `useThumbnails` carry
 * on drawing other cards' stills through the same rig between frames: by the time it draws another
 * model, this card's pixels are already its own. Without that, pointing at one card would
 * occasionally show another card's model in it.
 *
 * THERE IS NO ANIMATION LOOP. A frame is drawn when the operator drags or presses a key and at no
 * other time, so an idle deck of sixty cards costs nothing at all and a walk has no frame race to
 * lose. Nothing here moves on its own.
 */
interface Live {
  readonly canvas: HTMLCanvasElement;
  readonly geometry: THREE.BufferGeometry;
  readonly object: THREE.Mesh;
  readonly framing: { position: Vector; target: Vector };
  orbit: Orbit;
}

let live: Live | undefined;

/** The last frame, copied out of the rig into the card's own surface. */
function paint(current: Live): void {
  const rig = deckRig();
  if (rig === null) return;
  const { renderer, scene, camera } = rig;
  const size = Math.max(1, Math.round(current.canvas.getBoundingClientRect().width));
  sizeRig(rig, size);
  const pixels = renderer.domElement.width;
  if (current.canvas.width !== pixels || current.canvas.height !== pixels) {
    current.canvas.width = pixels;
    current.canvas.height = pixels;
  }
  camera.aspect = 1;
  camera.position.set(...orbitPosition(current.framing, current.orbit));
  camera.lookAt(...current.framing.target);
  camera.updateProjectionMatrix();
  scene.add(current.object);
  try {
    renderer.render(scene, camera);
    current.canvas.getContext('2d')?.drawImage(renderer.domElement, 0, 0);
  } finally {
    // OUT AGAIN IMMEDIATELY. A still drawn through the same rig between frames must not find this
    // model still in the scene and photograph both.
    scene.remove(current.object);
  }
}

/**
 * Put `mesh` on `canvas` and draw the first frame, which is framed exactly as the still it replaces
 * (`orbit.ts` is tested on that property). Any model already live is closed first.
 *
 * Returns false where there is no WebGL, so the caller can leave the still showing and say why.
 */
export function openLiveCard(
  canvas: HTMLCanvasElement,
  mesh: TriangleMesh,
  transform: { position: readonly number[]; rotation: readonly number[] },
): boolean {
  closeLiveCard();
  const rig = deckRig();
  if (rig === null) return false;

  const geometry = toGeometry(mesh);
  const object = new THREE.Mesh(geometry, rig.material);
  object.position.set(transform.position[0]!, transform.position[1]!, transform.position[2]!);
  object.rotation.set(transform.rotation[0]!, transform.rotation[1]!, transform.rotation[2]!);
  object.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(object);
  if (box.isEmpty()) {
    geometry.dispose();
    return false;
  }
  live = {
    canvas, geometry, object, orbit: NO_TURN,
    framing: thumbFraming({ min: box.min.toArray() as unknown as Vector, max: box.max.toArray() as unknown as Vector }),
  };
  paint(live);
  return true;
}

/** Drag by this many pixels. Does nothing when no card is live, so a stray pointer event is safe. */
export function turnLiveCard(dxPixels: number, dyPixels: number): void {
  if (!live) return;
  live.orbit = turnedBy(live.orbit, dxPixels, dyPixels);
  paint(live);
}

/** Give the GPU the model back. The card's canvas keeps its last frame until the card hides it. */
export function closeLiveCard(): void {
  if (!live) return;
  live.geometry.dispose();
  live = undefined;
}

