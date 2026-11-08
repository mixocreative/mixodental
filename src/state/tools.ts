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

/**
 * THE TOOLS THIS JOB HAS, in order - `TOOL_ORDER` FILTERED, never a list of its own.
 *
 * A denture has neither a rim nor an area step: `denture/state/dentureStages.ts` sends it straight
 * from Orient to its supports. A rail that listed them offered two tools the job cannot use, and the
 * facts had to lie about a rim and an area being present to stop it instructing about them.
 *
 * A FILTER, not a parallel list, and the difference is the whole reason this is one line. The order
 * IS the dependency, and three readers must agree about it (`staleTools`, the rail, `revisionsField`).
 * A per-job list would be a second truth, free to drift; a filter cannot disagree with what it
 * filters.
 */
export const toolsFor = (denture: boolean): readonly ToolId[] =>
  (denture ? TOOL_ORDER.filter((tool) => tool !== 'rim' && tool !== 'area') : TOOL_ORDER);
