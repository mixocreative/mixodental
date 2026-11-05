import type { SurfacePathProblem } from '../../core/surfacePath/validate';

/*
 * Rim define mode's words. Pure, so the sentences can be tested without a browser and the step component
 * holds no wording of its own.
 *
 * `src/core/surfacePath` reports CODES, not sentences, because it is portable and carries no i18n. This is
 * where a code becomes something an operator reads, in their language.
 */

/** What the mode says is wrong with the loop as drawn, as an i18n key. */
export function rimProblemText(problem: SurfacePathProblem): string {
  switch (problem) {
    case 'TOO_FEW_POINTS': return 'A rim needs at least three points.';
    case 'COLLINEAR': return 'These points lie in a line, so they enclose nothing. Place points around the opening.';
    case 'DEGENERATE_AREA': return 'This loop is too thin to hold an area. Place points around the opening, not along one edge.';
    case 'SELF_INTERSECTING': return 'This loop crosses itself, so it has no inside. Move the points that cross.';
  }
}

/**
 * Why Done is off, as an i18n key, or undefined when it is on. In order of what the operator should do
 * next: finish the loop, then fix it, and only then the one thing they cannot do anything about.
 */
export function rimDoneReason(state: {
  dentalRimClosed?: boolean; dentalRimAnchors?: number; dentalRimProblem?: string; dentalRimEngineReady?: boolean;
}): string | undefined {
  if (!state.dentalRimClosed) {
    return (state.dentalRimAnchors ?? 0) >= 3
      ? 'Close the loop to finish the rim.'
      : 'Place at least three points, then close the loop.';
  }
  if (state.dentalRimProblem) return rimProblemText(state.dentalRimProblem as SurfacePathProblem);
  /*
   * The honest refusal. A drawn loop becomes a rim only once the engine can fit its frame and rasterise
   * the opening's visibility mask (docs/handoff/geocore-rim-from-points.md): the host cannot compute that
   * mask, and a blank or filled one would either permit nothing at all or permit supports the opening
   * cannot reach. So the mode lets the rim be drawn and checked, and says plainly that it cannot be used
   * yet, rather than going on with a rim that would quietly be wrong.
   */
  if (!state.dentalRimEngineReady) return 'This rim cannot be used yet: the engine does not build a rim from a drawn loop in this version.';
  return undefined;
}

/** The mode's badge: what the current tool does, in words. */
export function rimToolText(tool: 'place' | 'adjust'): string {
  return tool === 'place'
    ? 'Click along the rim to place points.'
    : 'Drag a point to move it along the model.';
}

/** The readout under the tools: how many points are placed, and whether the loop is joined. */
export function rimCountText(anchors: number, closed: boolean): { key: string; other?: string; n: number } {
  if (closed) return { key: 'Loop closed, {n} point', other: 'Loop closed, {n} points', n: anchors };
  return { key: '{n} point', other: '{n} points', n: anchors };
}
