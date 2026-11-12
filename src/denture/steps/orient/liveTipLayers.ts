import type { TiltPaths, TipPathState } from '@mixo-geocore/host/dental/dentureTilt';
import type { OrientationLayer } from '../../../dental/orientationEvidence';

/*
 * The live angle step's tip marks (Round C): every tip of the tilt shown, coloured by its path state (a route to
 * the plate at full clearance, only the fallback clearance, or none). Drawn as small octahedra through the Debug
 * layer renderer, in the unit's own frame (the engine reports the tips unit-local), so they follow the model.
 */

/** Layer colours by path state (0xRRGGBB), read from the CSS tokens by `tipColours`. */
export type TipColours = Record<TipPathState, number>;

/** What the bar says about one tilt: tips per path state. */
export function tipCounts(paths: Extract<TiltPaths, { kind: 'paths' }>): Record<TipPathState, number> {
  const counts: Record<TipPathState, number> = { path: 0, fallback: 0, none: 0, unknown: 0 };
  for (const tip of paths.tips) counts[tip.state] += 1;
  return counts;
}

// 'unknown' is in the list on purpose: a tip whose state this build does not recognise still
// EXISTS, and a tip that renders nothing is exactly the silent failure this app audits for.
const STATES: readonly TipPathState[] = ['path', 'fallback', 'none', 'unknown'];
/** Octahedron corners (unit radius) and faces. */
const CORNERS = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]] as const;
const FACES = [0, 2, 4, 2, 1, 4, 1, 3, 4, 3, 0, 4, 2, 0, 5, 1, 2, 5, 3, 1, 5, 0, 3, 5];

/** One layer per path state that has tips: an octahedron of radius `radiusMm` at every tip. */
export function liveTipLayers(paths: Extract<TiltPaths, { kind: 'paths' }>, colours: TipColours, radiusMm = 0.45): OrientationLayer[] {
  return STATES.flatMap((state) => {
    const tips = paths.tips.filter((tip) => tip.state === state);
    if (tips.length === 0) return [];
    const positions = new Float32Array(tips.length * CORNERS.length * 3);
    const indices = new Uint32Array(tips.length * FACES.length);
    tips.forEach((tip, k) => {
      CORNERS.forEach((corner, c) => corner.forEach((value, axis) => { positions[(k * CORNERS.length + c) * 3 + axis] = tip.position[axis]! + value * radiusMm; }));
      FACES.forEach((corner, f) => { indices[k * FACES.length + f] = k * CORNERS.length + corner; });
    });
    return [{ name: `Live tips: ${state}`, color: colours[state], positions, indices }];
  });
}
