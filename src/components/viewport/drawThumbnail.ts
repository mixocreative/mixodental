// Copyright (c) Mixo Creative.

import * as THREE from 'three';
import { toGeometry } from './geometry';
import { deckRig, sizeRig } from './deckRig';
import { thumbFraming, THUMB_SIZE } from '../../items/thumbnail';
import type { TriangleMesh } from '@mixo-geocore/host/core/analysis/types';

/**
 * DRAWING ONE CARD'S STILL. The GL half of `items/thumbnail.ts`, which holds the judgement.
 *
 * It lives HERE, under the viewport, and not beside the rest of the deck, because `threeBoundary.ts`
 * keeps three.js in the view layer. That guard caught the first attempt to put it in `src/items/`,
 * and it was right to: this file and `liveCardView.ts` are the only two of the feature that touch a
 * renderer, and they share one - `deckRig.ts`, which carries the long note on why.
 *
 * Each model is uploaded, drawn and DISPOSED in turn, so the peak cost is one model's geometry and
 * not the deck's. What is kept per card is the PNG: tens of kilobytes beside a ~6.4 MiB mesh (the
 * reference aligner, welded and indexed at 18 B/triangle - `src/items/deckBudget.ts` shows the
 * arithmetic. This line said 12.2 MB until that was measured, which is the unwelded figure).
 */

/**
 * A PNG data URL for one model, or `undefined` where there is no WebGL to draw it with.
 *
 * `transform` is the unit's placement, so the picture shows the model AS PLACED — a model the flow
 * turned upright looks upright on its row. Framing it in the file's own frame would undo the very
 * work the row is reporting.
 */
export function drawThumbnail(mesh: TriangleMesh, transform: { position: readonly number[]; rotation: readonly number[] }): string | undefined {
  const rig = deckRig();
  if (rig === null) return undefined;
  const { renderer, scene, camera, material } = rig;
  // The live view resizes the shared canvas, so a still puts it back to its own square - through
  // `sizeRig`, which only calls `setSize` when the size actually changed. Calling it unconditionally
  // reallocated the drawing buffer twice per card while a live card was open.
  sizeRig(rig, THUMB_SIZE);

  const geometry = toGeometry(mesh);
  const object = new THREE.Mesh(geometry, material);
  object.position.set(transform.position[0]!, transform.position[1]!, transform.position[2]!);
  object.rotation.set(transform.rotation[0]!, transform.rotation[1]!, transform.rotation[2]!);
  scene.add(object);
  try {
    object.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(object);
    if (box.isEmpty()) return undefined;
    const framing = thumbFraming({ min: box.min.toArray(), max: box.max.toArray() });
    camera.position.set(...framing.position);
    camera.lookAt(...framing.target);
    renderer.render(scene, camera);
    return renderer.domElement.toDataURL('image/png');
  } finally {
    // The model leaves the rig whatever happened: the next row must not photograph this one too.
    scene.remove(object);
    geometry.dispose();
  }
}
