import type { ArcRotateCamera } from '@babylonjs/core';
import type { Vector } from '@mixo-geocore/host/core/vec3';
import { insertAnchor, moveAnchor, type SurfacePath } from '../../../core/surfacePath/path';
import { rimTapAt, rimTargetAt } from '../../../dental/rim/rimTarget';
import type { SurfacePointer } from './surfacePointer';

/*
 * Rim define mode: placing anchors, picking one up, inserting one into the drawn line and dragging
 * it. Ports the rim half of `UnitObject`'s pointer handling.
 *
 * THE HOUSE RULE, and everything here follows from it: THE TARGET UNDER THE PRESS DECIDES, not an
 * armed tool. A handle is picked up. Bare line takes a NEW handle and picks that up, so inserting
 * and dragging are one gesture. Anything else picks up nothing and is left alone, so it reaches
 * the camera and the view orbits -- where the drag starts decides.
 *
 * THE DECISIONS ARE `rimTapAt` AND `rimTargetAt`, both renderer-free, so this view and the three.js
 * one place and grab anchors in exactly the same places.
 *
 * A CLICK THAT ENDS A DRAG IS NOT A TAP. The browser fires a click on release after every drag, so
 * the tap path is guarded by how far the pointer travelled -- `rimTapAt` takes that distance and
 * decides. Without it, dragging a handle would drop a fresh anchor wherever it was released.
 *
 * ONE DRAG IS ONE STEP ON THE HISTORY. `onRimPath` fires once, on release. An inserted anchor is
 * the exception and gets its own step BEFORE the drag moves it, because it is an edit in its own
 * right. And the release is heard on the WINDOW, not the canvas: a drag that ends off the canvas
 * would otherwise leave the anchor glued to the pointer with no button held.
 */

/** A rim with nothing in it: an OPEN path with no anchors, so the first press appends. */
const EMPTY_RIM: SurfacePath = { anchors: [], closed: false };

export interface RimDrawInput {
  canvas: HTMLCanvasElement;
  camera: ArcRotateCamera;
  pointer: SurfacePointer;
  /** True only while rim define mode has the pointer. */
  drawing: () => boolean;
  /** The unit being drawn on, and its draft, or undefined when neither applies. */
  draft: () => { unitId: string; path: SurfacePath | undefined } | undefined;
  onRimPoint: (unitId: string, point: Vector, normal: Vector) => void;
  onRimPath: (unitId: string, path: SurfacePath) => void;
  onRimSelect: (at: number | undefined) => void;
  /** The path to draw while a drag is carrying an anchor, so the line follows the pointer. */
  onDragPath: (path: SurfacePath | undefined) => void;
}

/** Attaches rim drawing and returns its detacher. */
export function attachRimDraw(input: RimDrawInput): () => void {
  const { canvas, camera, pointer } = input;
  let drag: { unitId: string; at: number; path: SurfacePath } | undefined;
  let press: { x: number; y: number } | undefined;

  const releaseCamera = () => {
    camera.attachControl(canvas, true);
  };

  const drop = () => {
    if (!drag) return;
    const { unitId, path } = drag;
    drag = undefined;
    input.onDragPath(undefined);
    input.onRimPath(unitId, path);
    // The camera comes back however the drag ends -- released, cancelled, or torn down mid-drag.
    // Leaving the orbit off would be a worse fault than the one this guards: a viewport that
    // silently stops turning.
    releaseCamera();
  };

  const onDown = (event: PointerEvent) => {
    press = { x: event.clientX, y: event.clientY };
    if (!input.drawing() || event.button !== 0) return;
    const draft = input.draft();
    if (!draft?.path) return;
    const hit = pointer.hitAt(event.offsetX, event.offsetY);
    if (!hit || hit.unitId !== draft.unitId) return;
    const target = rimTargetAt(draft.path, hit.point);
    // Append and close are TAPS, not drags; the click handler does those.
    if (target.kind !== 'handle' && target.kind !== 'insert') return;
    const held = target.kind === 'insert'
      ? insertAnchor(draft.path, target.at, { position: target.position, normal: hit.normal })
      : draft.path;
    if (!held) return;
    // A new handle is a scene edit of its own, so it is on the undo stack before the drag moves it.
    if (target.kind === 'insert') input.onRimPath(draft.unitId, held);
    camera.detachControl();
    drag = { unitId: draft.unitId, at: target.at, path: held };
    input.onDragPath(held);
    // The same press picks the anchor out, so Delete point has a subject without a third tool.
    input.onRimSelect(target.at);
  };

  const onMove = (event: PointerEvent) => {
    if (!drag) return;
    const hit = pointer.hitAt(event.offsetX, event.offsetY);
    if (!hit || hit.unitId !== drag.unitId) return;
    const moved = moveAnchor(drag.path, drag.at, { position: hit.point, normal: hit.normal });
    if (!moved) return;
    drag = { ...drag, path: moved };
    input.onDragPath(moved);
  };

  const onClick = (event: PointerEvent) => {
    const start = press;
    press = undefined;
    if (drag || !input.drawing() || event.button !== 0) return;
    const draft = input.draft();
    if (!draft) return;
    const hit = pointer.hitAt(event.offsetX, event.offsetY);
    if (!hit || hit.unitId !== draft.unitId) return;
    const travel = start ? Math.hypot(event.clientX - start.x, event.clientY - start.y) : 0;
    const tapped = rimTapAt(draft.path ?? EMPTY_RIM, hit.point, travel).kind;
    // `onRimPoint` already tells extending an open line from closing it apart.
    if (tapped === 'append' || tapped === 'close') {
      input.onRimPoint(draft.unitId, hit.world.point, hit.world.normal);
    }
  };

  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerup', onClick);
  // On the WINDOW, so a drag that ends outside the canvas still ends.
  window.addEventListener('pointerup', drop);
  window.addEventListener('pointercancel', drop);
  return () => {
    canvas.removeEventListener('pointerdown', onDown);
    canvas.removeEventListener('pointermove', onMove);
    canvas.removeEventListener('pointerup', onClick);
    window.removeEventListener('pointerup', drop);
    window.removeEventListener('pointercancel', drop);
    if (drag) releaseCamera();
  };
}
