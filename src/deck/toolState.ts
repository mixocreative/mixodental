// Copyright (c) Mixo Creative.

import type { Message } from '../i18n';

/**
 * THE RAIL CARRIES THE ORDER — by what the operator can press, not by marching them through steps.
 *
 * With the wizard gone, the dependency between the four tools has to be visible somewhere. It is the
 * rail: a tool whose prerequisite is not met is disabled, the order reads left to right, and nothing
 * is enforced beyond what is genuinely impossible. This module is that rule and nothing else — no
 * React, no scene, no strings of its own.
 *
 * TWO THINGS THAT GO WRONG WITH DISABLED CONTROLS, and both are the reason this is a module rather
 * than a condition inside a button:
 *
 * 1. **Greyed must say why, and what to do.** A disabled control with no explanation is WORSE than a
 *    step: the operator sees grey and does not know the fix. That one line is doing the teaching the
 *    wizard used to do, so `unavailable` cannot exist without it — the type makes it impossible.
 *
 * 2. **"Not yet possible" and "being made right now" must not look alike.** Greyed means *cannot yet,
 *    do this first*. A tool whose work is generating is BUSY: enterable, showing progress. Conflate
 *    them and the operator presses a tool, sees grey and concludes something failed.
 *
 * A fourth state earns its place for the same reason: re-orienting does NOT grey the tools
 * downstream, because their work still exists. It marks them STALE.
 */

export type ToolId = 'orient' | 'rim' | 'area' | 'supports';

/** The rail, left to right. The order is the dependency, so it is declared once, here. */
export const TOOL_ORDER: readonly ToolId[] = ['orient', 'rim', 'area', 'supports'];

export type ToolState =
  /** Pressable, with nothing outstanding. */
  | { readonly kind: 'ready' }
  /**
   * Its own job is running. NOT greyed: it opens and shows progress. A tool can only be busy once
   * its prerequisite was met, so this never hides an `unavailable` the operator needed to see.
   */
  | { readonly kind: 'busy' }
  /**
   * The prerequisite is missing. `because` is not optional chrome — it is the sentence that replaces
   * the wizard, and it says what to do rather than what is wrong.
   */
  | { readonly kind: 'unavailable'; readonly because: Message }
  /**
   * Upstream changed and this tool's work predates it. The work is STILL THERE and the tool still
   * opens; the operator is told it no longer matches.
   */
  | { readonly kind: 'stale' };

/** What a unit presents about its own progress. Every field is a fact, not a decision. */
export interface ToolFacts {
  /** An orientation has been accepted for this unit. */
  readonly oriented: boolean;
  /** A rim exists — detected and accepted, or drawn by hand. */
  readonly hasRim: boolean;
  /** A support area has been accepted. */
  readonly areaAccepted: boolean;
  /** The tool whose job is running right now, if any. */
  readonly busy?: ToolId;
  /** Tools whose work predates the upstream it was made from. */
  readonly stale?: readonly ToolId[];
}

/** What each tool needs, and the line it shows when it does not have it. */
const NEEDS: { readonly [K in ToolId]: ((facts: ToolFacts) => boolean) | undefined } = {
  // Always available: there is nothing to do first, and it is where every model starts.
  orient: undefined,
  rim: (facts) => facts.oriented,
  area: (facts) => facts.hasRim,
  supports: (facts) => facts.areaAccepted,
};

const BECAUSE: { readonly [K in Exclude<ToolId, 'orient'>]: Message } = {
  rim: { key: 'Turn the model the right way up first.' },
  area: { key: 'The area is measured from the rim, so draw the rim first.' },
  supports: { key: 'Mark the support area first.' },
};

/**
 * One tool's state.
 *
 * THE ORDER OF THESE TESTS IS THE RULE, so it is spelled out rather than left to read off:
 * busy, then unavailable, then stale, then ready.
 *
 * - **Busy first**, because a tool rebuilding after a change is busy AND stale, and what the operator
 *   needs to see is that the work is happening — telling them it is out of date while it is being
 *   brought up to date is the confusion rule 2 exists to prevent.
 * - **Unavailable before stale**, because a missing prerequisite is the stronger statement: there is
 *   nothing useful to open, so "out of date" would be beside the point.
 */
export function toolState(tool: ToolId, facts: ToolFacts): ToolState {
  if (facts.busy === tool) return { kind: 'busy' };
  const needs = NEEDS[tool];
  if (needs && !needs(facts)) return { kind: 'unavailable', because: BECAUSE[tool as Exclude<ToolId, 'orient'>] };
  if (facts.stale?.includes(tool)) return { kind: 'stale' };
  return { kind: 'ready' };
}

/** The whole rail in order, which is what the UI draws. */
export const railStates = (facts: ToolFacts): readonly { readonly tool: ToolId; readonly state: ToolState }[] =>
  TOOL_ORDER.map((tool) => ({ tool, state: toolState(tool, facts) }));

/**
 * THE ONE LINE THE RAIL SHOWS: the reason the first unavailable tool cannot be used.
 *
 * Four reason lines at once is noise, and a reason that lives only in a `title` is invisible on a
 * touch screen and easy to miss with a pointer. The first unavailable tool IS the next thing to do,
 * so its line is the instruction - one at a time, which is the one thing the wizard did well.
 *
 * `undefined` when every tool is open: there is nothing to do first, so there is nothing to say.
 */
export function railReason(facts: ToolFacts): Message | undefined {
  for (const { state } of railStates(facts)) if (state.kind === 'unavailable') return state.because;
  return undefined;
}
