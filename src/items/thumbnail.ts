// Copyright (c) Mixo Creative.

import type { TriangleMesh } from '@mixo-geocore/host/core/analysis/types';
import type { Vector } from '@mixo-geocore/host/core/vec3';
import type { PrintUnit } from '../state/project';

/**
 * THE PICTURE ON A ROW, and why it is a cached image rather than a viewport.
 *
 * The design doc's §7 ruled the row preview must be text, on the grounds that a 3D preview per row is
 * the release's only new per-row memory cost. That objection holds against N LIVE VIEWPORTS and not
 * against N cached images: a 160 px bitmap is tens of kilobytes beside a 12.2 MB model, and it is
 * drawn ONCE from the display copy the scene already owns. §0b reverses the ruling on exactly that
 * distinction.
 *
 * IT HAS ITS OWN RENDERER, and the first draft of this was wrong about that. Borrowing the app's
 * renderer from inside the one `<Canvas>` (the `PlateSide` pattern) cannot work here: the workspace,
 * and so the Canvas, is mounted only when no start screen is up (`App.tsx`, `startScreen === null`),
 * and the deck is a start screen. Mounting the workspace always would be a wide behaviour change that
 * walk checks `u1a` and `l2g` rest on — the start screens have no panels — which is far more than a
 * row picture should cost.
 *
 * So: ONE renderer for the app, made on first use and kept (`drawThumbnail.ts`), never one per row.
 * Browsers cap GL contexts near sixteen, so per-row contexts would lose a long drop; one is a fixed
 * price. Each model is uploaded, drawn and disposed in turn, so the peak is one model's geometry
 * rather than the whole deck's.
 *
 * This module is the part with no GL in it: WHICH row needs a picture, WHERE the camera goes, and the
 * row order the GPU hands back. Pure, so the judgement is tested rather than walked.
 */

/**
 * A drawn thumbnail, held against the mesh it was drawn from so a replaced model redraws.
 *
 * `url` IS OPTIONAL, and that is load-bearing rather than defensive: an entry records that the row
 * was DRAWN, not that a picture came back. A device with no WebGL returns none, and if a pictureless
 * row stayed uncached `nextThumbnailToDraw` would hand it over again on every pass — a draw loop that
 * never settles. The same shape of bug cost this release a 600 ms re-check that ran for ever.
 */
export interface Thumbnail { readonly mesh: TriangleMesh; readonly rotation: Vector; readonly url?: string }

export type ThumbCache = ReadonlyMap<string, Thumbnail>;

/** The square a thumbnail is drawn at. One size: the rows are a list, not a gallery. */
export const THUMB_SIZE = 160;

/**
 * The viewport's own field of view and camera direction (`ObjectViewport`'s
 * `camera={{ position: [70, 60, 90], fov: 40 }}`), so a row's picture is the view the operator gets
 * when they open it. A thumbnail drawn from some other angle would be a second, competing idea of
 * which way the model faces.
 */
export const THUMB_FOV = 40;
const THUMB_DIRECTION: Vector = [70, 60, 90];

/**
 * The rotation a picture was drawn at, compared BY VALUE.
 *
 * Not by identity: `transform/set` clones the transform on every write (`state/project.ts`), so an
 * identity test would redraw every row on a write that changed nothing. And only the ROTATION can
 * change the picture - `thumbFraming` centres the camera on the model's own box, so a move is
 * invisible in it, and `ModelTransform` carries no scale.
 */
const sameRotation = (a: Vector, b: Vector): boolean => a[0] === b[0] && a[1] === b[1] && a[2] === b[2];

/**
 * The next unit whose picture is missing or out of date, or `undefined` when every row has one.
 *
 * The MODEL is compared by identity, the same rule `useGeometry` uses for GPU geometry: the scene
 * replaces `source` wholesale rather than mutating it, so identity is the honest test of "this is a
 * different model now" and costs one comparison per row.
 *
 * THE ROTATION IS COMPARED TOO, and leaving it out was a defect rather than an economy. The deck
 * draws its pictures as soon as it is on screen, tens of milliseconds each; the batch then orients
 * one row at a time, seconds each, writing a new `transform` to the SAME `source`. So on an
 * ordinary case of eight, every row the batch turned kept its pre-orientation picture while the
 * line beneath it read "Turned upright." and the rail called the orient step done. This file's own
 * `thumbFraming` says why that matters: the camera frames the model AS PLACED, so the picture is
 * one of the row's three statements about orientation, and it was the one that lied.
 */
export function nextThumbnailToDraw(units: readonly PrintUnit[], cache: ThumbCache): PrintUnit | undefined {
  return units.find((unit) => {
    const drawn = cache.get(unit.id);
    return drawn === undefined || drawn.mesh !== unit.source || !sameRotation(drawn.rotation, unit.transform.rotation);
  });
}

/** Pictures for units that are no longer in the scene are dropped: a closed model keeps no bitmap. */
export function prunedThumbnails(cache: ThumbCache, units: readonly PrintUnit[]): ThumbCache {
  const live = new Set(units.map((unit) => unit.id));
  if ([...cache.keys()].every((id) => live.has(id))) return cache;
  return new Map([...cache].filter(([id]) => live.has(id)));
}

/** Where the thumbnail camera sits and what it looks at. */
export interface ThumbFraming { readonly position: Vector; readonly target: Vector }

/**
 * The camera that fits a box in a square frame, whatever its size: a 2 mm test cube and a 90 mm arch
 * both fill the picture, because a thumbnail that scaled with the model would draw most dental work
 * as a speck.
 *
 * It takes BOUNDS rather than a mesh because the caller frames the model as PLACED — the box of the
 * mesh with the unit's transform applied — not as the file happened to store it. A model the flow turned upright should
 * look upright on its row; framing the mesh in its own frame would undo exactly the work the row is
 * reporting.
 *
 * Distance comes from the box's bounding SPHERE rather than the box itself, so turning the model
 * cannot push a corner out of frame.
 */
export function thumbFraming(bounds: { min: Vector; max: Vector }, fov = THUMB_FOV, margin = 1.1): ThumbFraming {
  const { min, max } = bounds;
  const target: Vector = [0, 1, 2].map((axis) => (min[axis]! + max[axis]!) / 2) as unknown as Vector;
  const radius = Math.hypot(max[0]! - min[0]!, max[1]! - min[1]!, max[2]! - min[2]!) / 2;
  // A sphere of radius r fills a frame of half-angle f/2 at this distance. `margin` leaves it air.
  const distance = (radius / Math.sin((fov * Math.PI) / 360)) * margin;
  const length = Math.hypot(...THUMB_DIRECTION);
  const position = [0, 1, 2].map((axis) => target[axis]! + (THUMB_DIRECTION[axis]! / length) * distance) as unknown as Vector;
  return { position, target };
}
