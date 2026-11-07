// Copyright (c) Mixo Creative.

/**
 * THE FOUR TOOLS AND THE ORDER THEY DEPEND ON — declared once, for both layers.
 *
 * It lives UNDER the deck rather than in it because the reducer needs it too, and the deck is the
 * view. The other way round was a cycle: `project.ts` reached up into `deck/toolState.ts` for
 * `TOOL_ORDER` while `deck/unitFacts.ts` reached back down for `PrintUnit`.
 * `src/deckBoundary.test.ts` keeps the direction one-way.
 */

/** The tools whose work a unit can carry. */
export type ToolId = 'orient' | 'rim' | 'area' | 'supports';

/**
 * The chain, upstream first — the dependency between pieces of work and the rail's left-to-right
 * order at once. Three readers must not disagree about it: `staleTools` takes "above me in the
 * chain" from it, `railStates` draws it, and `revisionsField` validates a loaded record against it.
 */
export const TOOL_ORDER: readonly ToolId[] = ['orient', 'rim', 'area', 'supports'];
