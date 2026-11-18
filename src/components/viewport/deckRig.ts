// Copyright (c) Mixo Creative.

import * as THREE from 'three';
import { viewportColours } from './sceneColours';
import { THUMB_FOV, THUMB_SIZE } from '../../items/thumbnail';

/**
 * THE DECK'S ONE RENDERER. Every picture the deck draws comes through this, still or live.
 *
 * It was private to `drawThumbnail.ts` until the cards needed a view the operator can ROTATE
 * (owner, 2026-11-18). Two renderers would have been two WebGL contexts for one screen, and the
 * lighting would have been written twice - so the rig moved out and both callers share it:
 *
 *   `drawThumbnail.ts`   renders one model and reads the canvas back as a PNG for a card's still.
 *   `liveCardView.ts`    renders the focused card's model on demand and copies the canvas into it.
 *
 * ONE CONTEXT, NOT N. Browsers cap live contexts near sixteen and a case is up to sixty cards, so a
 * canvas per card loses the case. This canvas is never in the document either way: callers copy out
 * of it, which is what lets one rig serve a list.
 *
 * NOT THE APP'S OWN RENDERER. `App.tsx` mounts the workspace only when no start screen is up, and
 * the deck IS a start screen, so the app's `<Canvas>` does not exist while any of this is on screen.
 *
 * The lights and the background are the viewport's own tokens, so a card's picture is recognisably
 * the same object the operator sees when they open it, in the same light.
 */
export interface DeckRig {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene: THREE.Scene;
  readonly camera: THREE.PerspectiveCamera;
  readonly material: THREE.MeshStandardMaterial;
}

/** `null` once creation has failed: a device with no WebGL is asked once, not on every card. */
let rig: DeckRig | null | undefined;

/**
 * TOLD, NOT POLLED. Anyone holding pictures this rig drew subscribes, and is called when the
 * context goes away so it can throw them out and draw again.
 *
 * This replaces a `rigGeneration()` counter that a comment said callers compared - and that NOTHING
 * in the repo ever read. A documented safeguard with no implementation is worse than none: it reads
 * as covered. The real failure it is for: a driver reset or a sleeping laptop takes the context,
 * `toDataURL` on the dead canvas returns a blank PNG, and `useThumbnails` caches that blank as a
 * valid picture FOR THE LIFE OF THE PAGE - cards come back empty after a sleep with no message and
 * no way to force a redraw short of removing and re-dropping them.
 */
const resetListeners = new Set<() => void>();

/** Subscribe to the rig being thrown away. Returns the unsubscribe, for an effect's cleanup. */
export function onRigReset(listener: () => void): () => void {
  resetListeners.add(listener);
  return () => resetListeners.delete(listener);
}

function build(): DeckRig | null {
  const colours = viewportColours();
  let renderer: THREE.WebGLRenderer;
  const canvas = document.createElement('canvas');
  try {
    /*
     * Off-screen and never in the document: this canvas is a SOURCE of pixels, not a view.
     *
     * `preserveDrawingBuffer` is what lets `toDataURL` read the canvas AFTER the render returns;
     * without it the buffer may already be cleared. It costs the browser a kept copy of the canvas,
     * and it saves reading the pixels back, flipping their rows (the GPU hands them over bottom-up)
     * and blitting them through a second 2D canvas - three places to be subtly wrong.
     */
    renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, canvas });
  } catch {
    // No WebGL (a test environment, a blocked context). Cards simply have no picture.
    return null;
  }
  /*
   * A LOST CONTEXT IS NOT A DEAD DECK. A browser may take the context back at any time - another
   * tab, a driver reset, a sleeping laptop. Without this the rig would keep a dead renderer for the
   * life of the page and every card would silently stop drawing, which is precisely the kind of
   * quiet failure this app refuses. The next caller rebuilds.
   */
  canvas.addEventListener('webglcontextlost', (event) => {
    /*
     * `preventDefault` is what allows a context to come back at all. This rig does not wait for
     * `webglcontextrestored` on THIS canvas, though: it drops the whole renderer and the next
     * caller builds a fresh one, which is simpler than restoring state onto a revived context and
     * cannot half-succeed. The listeners are what make that visible rather than silent.
     */
    event.preventDefault();
    rig = undefined;
    for (const listener of resetListeners) listener();
  });
  // A starting size only; every caller sets its own through `sizeRig`, which applies the ratio.
  sizeRigCanvas(renderer, THUMB_SIZE);

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

/** The rig, built on first use, or `null` where there is no WebGL to build one with. */
export function deckRig(): DeckRig | null {
  if (rig === undefined) rig = build();
  return rig;
}

/**
 * Square and sharp on this display, resized only when it has to be: `setSize` reallocates.
 *
 * `cssSize` IS CSS PIXELS and the ratio is applied here. Both callers pass the size their surface is
 * SHOWN at, so a still and the live view of the same card are the same pixels - which is what makes
 * the handover between them invisible rather than a visible sharpening.
 */
export function sizeRig(rigToSize: DeckRig, cssSize: number): void {
  sizeRigCanvas(rigToSize.renderer, cssSize);
}

function sizeRigCanvas(renderer: THREE.WebGLRenderer, cssSize: number): void {
  const ratio = Math.min(typeof devicePixelRatio === 'number' ? devicePixelRatio : 1, 2);
  const pixels = Math.max(1, Math.round(cssSize * ratio));
  const canvas = renderer.domElement;
  if (canvas.width !== pixels || canvas.height !== pixels) renderer.setSize(pixels, pixels, false);
}
