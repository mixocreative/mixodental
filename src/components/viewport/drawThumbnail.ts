// Copyright (c) Mixo Creative.

import * as THREE from 'three';
import { toGeometry } from './geometry';
import { viewportColours } from './sceneColours';
import type { TriangleMesh } from '@mixo-geocore/host/core/analysis/types';
import { THUMB_FOV, THUMB_SIZE, thumbFraming } from '../../items/thumbnail';

/**
 * DRAWING ONE ROW PICTURE. The GL half of `items/thumbnail.ts`, which holds the judgement.
 *
 * It lives HERE, under the viewport, and not beside the rest of the deck, because `threeBoundary.ts`
 * keeps three.js in the view layer. That guard caught the first attempt to put it in `src/items/`,
 * and it was right to: this is the only file of the feature that touches a renderer.
 *
 * One renderer for the app, made on first use and then kept. Not one per row: browsers cap GL
 * contexts near sixteen, and a drop of twenty files would start losing them. Not the app's own
 * renderer either — the reason is in `thumbnail.ts`, and it is that the workspace is not mounted
 * while a start screen is up.
 *
 * Each model is uploaded, drawn and DISPOSED in turn, so the peak cost is one model's geometry and
 * not the deck's. What is kept per row is the 160 px PNG: tens of kilobytes beside a 12.2 MB mesh.
 *
 * The lights and the background are the viewport's own tokens, so a row's picture is recognisably
 * the same object the operator sees when they open it, in the same light.
 */

interface Rig {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  material: THREE.MeshStandardMaterial;
}

/** `null` once creation has failed: a device with no WebGL is asked once, not on every row. */
let rig: Rig | null | undefined;

function build(): Rig | null {
  const colours = viewportColours();
  let renderer: THREE.WebGLRenderer;
  try {
    // Off-screen and never in the document: this canvas is a source of bitmaps, not a view.
    //
    // `preserveDrawingBuffer` is what lets `toDataURL` read the canvas AFTER the render returns;
    // without it the buffer may already be cleared. It costs the browser a kept copy of a 160 px
    // square, and it saves reading the pixels back, flipping their rows (the GPU hands them over
    // bottom-up) and blitting them through a second 2D canvas - three places to be subtly wrong.
    renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, canvas: document.createElement('canvas') });
  } catch {
    // No WebGL (a test environment, a blocked context). Rows simply have no picture.
    return null;
  }
  renderer.setSize(THUMB_SIZE, THUMB_SIZE, false);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(colours.scene.background);
  // The viewport's own lighting, intensities included, so the shading matches.
  scene.add(new THREE.HemisphereLight(colours.scene.lightSky, colours.scene.lightGround, 1.3));
  // Colour left at three's default white, exactly as the viewport's own `<directionalLight>` does:
  // the two lights carry intensity and direction, and all the scene's COLOUR comes from the tokens.
  const key = new THREE.DirectionalLight();
  key.intensity = 1.4;
  key.position.set(40, 80, 30);
  scene.add(key);
  const fill = new THREE.DirectionalLight();
  fill.intensity = 0.45;
  fill.position.set(-50, 30, -40);
  scene.add(fill);

  return {
    renderer, scene,
    camera: new THREE.PerspectiveCamera(THUMB_FOV, 1, 0.1, 10000),
    material: new THREE.MeshStandardMaterial({ color: colours.model.idle, roughness: 0.65 }),
  };
}

/**
 * A PNG data URL for one model, or `undefined` where there is no WebGL to draw it with.
 *
 * `transform` is the unit's placement, so the picture shows the model AS PLACED — a model the flow
 * turned upright looks upright on its row. Framing it in the file's own frame would undo the very
 * work the row is reporting.
 */
export function drawThumbnail(mesh: TriangleMesh, transform: { position: readonly number[]; rotation: readonly number[] }): string | undefined {
  if (rig === undefined) rig = build();
  if (rig === null) return undefined;
  const { renderer, scene, camera, material } = rig;

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
