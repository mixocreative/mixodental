// Copyright (c) Mixo Creative.

import type { Vector } from '@mixo-geocore/host/core/vec3';

/**
 * TURNING A CARD'S MODEL. Pure: a framing and two angles in, a camera position out. No GL, no DOM.
 *
 * The owner asked for a preview the operator can rotate to inspect (2026-11-18). The GL half is
 * `components/viewport/liveCardView.ts`; this is the part worth testing, and it is all of the part
 * that can be got wrong in a way nobody notices - a camera that drifts off the model, a pitch that
 * flips the world upside down at the poles, a first frame that does not match the still it replaced.
 *
 * IT STARTS FROM THE STILL'S OWN FRAMING, which is the property that matters: `thumbFraming` placed
 * the camera for the picture already on the card, so `orbitPosition(framing, NO_TURN)` must return
 * exactly that position. Otherwise the model visibly jumps the instant a card goes live, and the
 * operator reads the jump as the model having moved.
 */
export interface Orbit {
  /** Turn about the model's up axis, radians. Unbounded: a model can be spun round and round. */
  readonly yaw: number;
  /** Tilt above and below, radians. Clamped when applied, never while accumulating. */
  readonly pitch: number;
}

export const NO_TURN: Orbit = { yaw: 0, pitch: 0 };

/**
 * How far one pixel of drag turns the model, and it is the VIEWPORT'S OWN RATE, not a number picked
 * for this card.
 *
 * `components/viewport/babylon/orbit.ts` turns the editor all the way round over one canvas height
 * (`angularSensibilityFor`: `height / 2π` pixels per radian). A card's picture is the same model in
 * the same light, so a hand that has learned the editor must not find the card turning at a
 * different speed - and it did: the first value here was `π / 320`, which is 0.0098 rad/px against
 * the viewport's 0.0305 at a 206px card, so the card turned THREE TIMES SLOWER than the view it is
 * a preview of. Nothing pinned it, which is how it drifted; `orbit.test.ts` pins it now.
 *
 * At a 228px card a full drag across it is a full turn, which is what the editor does.
 */
export const RADIANS_PER_PIXEL = (2 * Math.PI) / 228;

/**
 * The camera may not pass over the poles. At exactly up or down the azimuth becomes meaningless and
 * the model appears to snap round; a few degrees of margin keeps every drag continuous.
 */
const POLAR_MARGIN = 0.12;

const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value));

/** Accumulate a drag. Clamping lives in `orbitPosition`, so a long drag up and back down returns. */
export function turnedBy(orbit: Orbit, dxPixels: number, dyPixels: number): Orbit {
  return { yaw: orbit.yaw - dxPixels * RADIANS_PER_PIXEL, pitch: orbit.pitch + dyPixels * RADIANS_PER_PIXEL };
}

/**
 * Where the camera sits for `orbit`, given the framing the still was drawn with.
 *
 * The radius never changes: this turns the model, it does not zoom. A card is for recognising which
 * model this is and which way up it sits, and a zoom that can be left somewhere odd is one more
 * state to put back.
 */
export function orbitPosition(framing: { position: Vector; target: Vector }, orbit: Orbit): Vector {
  const { position, target } = framing;
  const dx = position[0] - target[0];
  const dy = position[1] - target[1];
  const dz = position[2] - target[2];
  const radius = Math.hypot(dx, dy, dz);
  if (radius === 0) return [...position] as unknown as Vector;

  // Spherical, with Y up: azimuth round Y from +Z, polar down from +Y.
  const azimuth = Math.atan2(dx, dz) + orbit.yaw;
  const polar = clamp(Math.acos(clamp(dy / radius, -1, 1)) - orbit.pitch, POLAR_MARGIN, Math.PI - POLAR_MARGIN);
  const ring = radius * Math.sin(polar);
  return [
    target[0] + ring * Math.sin(azimuth),
    target[1] + radius * Math.cos(polar),
    target[2] + ring * Math.cos(azimuth),
  ] as unknown as Vector;
}
