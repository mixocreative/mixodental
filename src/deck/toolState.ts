// Copyright (c) Mixo Creative.

import type { Message } from '../i18n';
import { TOOL_ORDER, type ToolId } from '../state/tools';

/**
 * THE RAIL CARRIES THE ORDER — by what the operator can press, not by marching them through steps.
 *
 * With the wizard gone, the dependency between the four tools has to be visible somewhere. It is the
 * rail: a tool whose prerequisite is not met is disabled, the order reads left to right, and nothing
 * is enforced beyond what is genuinely impossible. This module is that rule and nothing else — no
 * React, no scene, no strings of its own.
 *
 * TWO THINGS GO WRONG WITH DISABLED CONTROLS, and both are why this is a module rather than a
 * condition inside a button:
 *
 * 1. **Greyed must say why, and what to do.** A disabled control with no explanation is WORSE than a
 *    step: the operator sees grey and does not know the fix. That line does the teaching the wizard
 *    used to do, so `unavailable` cannot exist without it — the type makes it impossible.
 * 2. **"Not yet possible" and "being made right now" must not look alike.** A tool whose work is
 *    generating is BUSY: enterable, showing progress. Conflate them and the operator presses a tool,
 *    sees grey and concludes something failed.
 *
 * STALE earns its place for the same reason: re-orienting does not grey the tools downstream,
 * because their work still exists. It says so instead.
 */

export type ToolState =
  /** Pressable, with nothing outstanding. */
  | { readonly kind: 'ready' }
  /** Its own job is running. NOT greyed: it opens and shows progress. */
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
  /** The detector has looked at this model and come back with a usable answer (`unitFacts`). */
  readonly oriented: boolean;
  /** A rim exists — detected and accepted, or drawn by hand. */
  readonly hasRim: boolean;
  /** A support area has been accepted. */
  readonly areaAccepted: boolean;
  /**
   * The tool whose job is running right now, if any. Named for the JOB rather than `busy`, because
   * `busy` is also a `ToolState`, and one word for the input and the verdict reads as if the fact
   * decided the state — it does not: `toolState` tests the prerequisite first.
   */
  readonly runningTool?: ToolId;
  /** Tools whose work predates the upstream it was made from. */
  readonly stale?: readonly ToolId[];
}

/**
 * WHAT EACH TOOL WAITS FOR, AND THE LINE IT SHOWS MEANWHILE — one entry per tool.
 *
 * A prerequisite and the sentence explaining it are one thing, so they are one record. Two parallel
 * maps needed a cast to bridge them (`tool as Exclude<ToolId, 'orient'>`) — the compiler told to
 * stop checking at exactly the place a fifth tool gets added.
 *
 * `undefined` for Orient is deliberate, not missing: nothing comes first, and it is where every
 * model starts.
 */
const PREREQUISITE: {
  readonly [K in ToolId]: { readonly met: (facts: ToolFacts) => boolean; readonly because: Message } | undefined;
} = {
  orient: undefined,
  rim: {
    met: (facts) => facts.oriented,
    because: { key: 'Turn the model the right way up first.' },
  },
  area: {
    met: (facts) => facts.hasRim,
    because: { key: 'The area is measured from the rim, so draw the rim first.' },
  },
  supports: {
    met: (facts) => facts.areaAccepted,
    because: { key: 'Mark the support area first.' },
  },
};

/**
 * One tool's state.
 *
 * THE ORDER OF THESE TESTS IS THE RULE, so it is spelled out rather than left to read off:
 * unavailable, then busy, then stale, then ready.
 *
 * - **Unavailable first.** An earlier version tested busy first, assuming a tool can only be busy
 *   once its prerequisite is met — and nothing enforces that. `runningTool` is a free field, so
 *   `{ oriented: false, runningTool: 'rim' }` drew Rim as working, hid its own reason, and left
 *   `railReason` showing the AREA's line: the rail instructing about the area on a model that was
 *   not even oriented. Testing the prerequisite first makes the invariant hold instead of assuming
 *   it, and costs nothing in the legitimate states.
 * - **Busy before stale**, because a tool rebuilding after a change is both, and what the operator
 *   needs to see is that the work is happening — calling it out of date while it is being brought up
 *   to date is the confusion rule 2 exists to prevent.
 * - **Stale last of the three**: a missing prerequisite and a running job are stronger statements.
 */
export function toolState(tool: ToolId, facts: ToolFacts): ToolState {
  const prerequisite = PREREQUISITE[tool];
  if (prerequisite && !prerequisite.met(facts)) return { kind: 'unavailable', because: prerequisite.because };
  if (facts.runningTool === tool) return { kind: 'busy' };
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
 * so its line is the instruction — one at a time, which is the one thing the wizard did well.
 *
 * `undefined` when every tool is open: there is nothing to do first, so there is nothing to say.
 */
export function railReason(facts: ToolFacts): Message | undefined {
  for (const { state } of railStates(facts)) if (state.kind === 'unavailable') return state.because;
  return undefined;
}
