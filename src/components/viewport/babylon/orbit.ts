import type { ArcRotateCamera } from '@babylonjs/core';

/*
 * One job: how the Babylon camera answers the pointer, set in ONE place because five pieces of this
 * view hand the orbit back and forth (the surface brush, Drag over, a rim drag, the gizmo, the
 * scene itself) and every one of them used to decide the terms again.
 *
 * ALL OF IT IS MEASURED AGAINST drei's OrbitControls, which is what the three.js view uses. "Largely
 * the same layout" has to include how the view MOVES, because turning, panning and zooming are the
 * gestures an operator makes a thousand times a day and the ones a different feel is noticed in
 * first. The numbers below are OrbitControls' own, read out of `three-stdlib`:
 *
 *   turn   `2 * PI * dx / clientHeight` radians -- a whole turn per screen height
 *   pan    `2 * distance * tan(fov / 2) / clientHeight` world units per pixel
 *   zoom   one wheel notch multiplies the distance by 0.95, whatever size the delta reports
 *
 * Babylon expresses the first two as SENSIBILITIES -- pixels per radian, pixels per world unit --
 * so they are reciprocals of three's, and the panning one depends on the distance, so it has to be
 * recomputed as the camera moves. The zoom is not expressible at all: Babylon's wheel input scales
 * by the raw event delta, which differs between a mouse, a trackpad and a tilting wheel, where
 * OrbitControls reads only the SIGN. So the wheel is handled here instead of by that input.
 *
 * NO INERTIA, and this one is a correctness matter rather than a feel one. Babylon keeps nine
 * tenths of the last movement every FRAME, which decays per frame rather than per second: on a slow
 * renderer the camera glides for seconds after the pointer stops. The walk measured a click landing
 * 0.7 mm away from where it landed on the previous run, drifting steadily, until one run drifted
 * onto a face pointing the other way and the app -- correctly -- warned about it. A view that is
 * still moving when the operator clicks is wrong in any renderer.
 */

/** OrbitControls' `getZoomScale()` with the default `zoomSpeed` of 1. */
const ZOOM_STEP = 0.95;

/**
 * Attaches the orbit.
 *
 * `useCtrlForPanning` is OFF: OrbitControls has no ctrl gesture at all, and in this app ctrl+click
 * toggles a support's selection -- a ctrl drag that panned would slide the view under that click.
 */
export function attachOrbit(camera: ArcRotateCamera, canvas: HTMLCanvasElement): void {
  camera.attachControl(canvas, true, false);
}

/** The panning sensibility for a camera this far from its target: three's formula, inverted. */
export function panningSensibilityFor(radius: number, fovRadians: number, heightPx: number): number {
  const perPixel = (2 * Math.max(radius, 1e-3) * Math.tan(fovRadians / 2)) / Math.max(heightPx, 1);
  return 1 / Math.max(perPixel, 1e-9);
}

/** Pixels per radian, so a drag of the canvas's height turns the view all the way round. */
export function angularSensibilityFor(heightPx: number): number {
  return Math.max(heightPx, 1) / (2 * Math.PI);
}

/** The distance after one wheel notch: `up` is towards the model. */
export function zoomedRadius(radius: number, towards: boolean): number {
  return towards ? radius * ZOOM_STEP : radius / ZOOM_STEP;
}
