import type { Scene } from '@babylonjs/core';
import type { ViewportPort } from '@mixo-geocore/editing/ViewportPort';
import type { Vector } from '@mixo-geocore/host/core/vec3';

/*
 * DOM anchored to a point in the 3D scene: the print angle's reading, and the unresolved-point
 * bubbles.
 *
 * THIS IS THE ONE MECHANISM THAT IS GENUINELY DIFFERENT between the two renderers. The three.js
 * view uses drei's `<Html>`, which mounts real DOM and moves it to follow a 3D position. Babylon
 * has no React reconciler, so the same job is done directly: project the point with the port's
 * `worldToScreen` and move an absolutely positioned element over the canvas. That is what drei does
 * internally, so this is a different route to the same place rather than a substitute for it.
 *
 * WHY DOM AT ALL, rather than drawing the text into the scene: it is real text in the page, so it
 * takes the app's fonts and colours, it can be read by a screen reader, and the bubbles can be
 * focused and pressed. A label painted into a texture is none of those things.
 */

export interface DomAnchors {
  /**
   * Follows `at` with `element`, centred on that point, until the returned function is called.
   * An anchor whose point is behind the camera is hidden rather than left at a stale place.
   */
  follow(element: HTMLElement, at: () => Vector | undefined): () => void;
  dispose(): void;
}

export function createDomAnchors(scene: Scene, port: ViewportPort): DomAnchors {
  const anchors = new Map<HTMLElement, () => Vector | undefined>();

  const place = () => {
    if (anchors.size === 0) return;
    for (const [element, at] of anchors) {
      const point = at();
      const screen = point ? port.worldToScreen(point) : undefined;
      if (!screen) {
        element.style.visibility = 'hidden';
        continue;
      }
      element.style.visibility = 'visible';
      // Centred on the point, as drei's `center` does, and rounded so text does not sit on a
      // half-pixel and blur.
      element.style.transform = `translate(-50%, -50%) translate(${Math.round(screen[0])}px, ${Math.round(screen[1])}px)`;
    }
  };

  const tick = scene.onBeforeRenderObservable.add(place);

  return {
    follow(element, at) {
      anchors.set(element, at);
      place();
      return () => {
        anchors.delete(element);
      };
    },
    dispose() {
      scene.onBeforeRenderObservable.remove(tick);
      anchors.clear();
    },
  };
}
