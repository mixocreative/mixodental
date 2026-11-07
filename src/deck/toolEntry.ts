// Copyright (c) Mixo Creative.

import type { DentalStage } from '../dental/editingMode';
import type { ToolId } from './toolState';

/**
 * OPENING A TOOL FROM THE RAIL: which session events get there from where the operator is now.
 *
 * The rail replaces Next and Back, but the flow's stages are still the state underneath, and this is
 * the one place that knows how the two line up. Pure: it returns event NAMES and sends nothing, so
 * the mapping is tested rather than walked.
 *
 * ONLY BACKWARDS, AND THAT IS NOT A LIMITATION — it is the direction the rail is for.
 *
 * Going forward is an ACCEPT: the area is measured from a rim the operator approved, the supports are
 * built from an area they approved. Those approvals are the tool's own primary action and they do
 * real work, so a rail press must not perform them on the operator's behalf. Going BACK is what the
 * operator needs the rail for — a tool that reads *stale* is precisely one whose work is out of date
 * and must be revisited, and before this they had to press Back the right number of times to get
 * there.
 *
 * It also needs no new transitions and loosens no guard. `backDental` already walks the stages
 * (review → area → aligner), and `dentalRimReopen` already reopens the drawing from `aligner` — both
 * with their own conditions intact. Adding a "jump to this stage" event would have meant writing
 * prerequisite checks a second time, next to the ones `toolState` already makes.
 */

/** The stage each tool's work happens in. */
const TOOL_STAGE: { readonly [K in ToolId]: DentalStage } = {
  orient: 'aligner',
  rim: 'rim',
  area: 'area',
  supports: 'review',
};

/**
 * The spine `backDental` walks. `rim` is NOT on it: it is a detour off `aligner` (entered when
 * detection finds no rim, left by `dentalRimDefined`), and backing out of it returns to `aligner`.
 * So for the purpose of counting steps back, being in `rim` is being at `aligner`.
 */
const SPINE: readonly DentalStage[] = ['type', 'aligner', 'area', 'review'];
const onSpine = (stage: DentalStage): DentalStage => (stage === 'rim' ? 'aligner' : stage);
const depth = (stage: DentalStage): number => SPINE.indexOf(onSpine(stage));

/** The events that open `tool` from `stage`, or `undefined` when it cannot be opened from there. */
export function entryEvents(tool: ToolId, stage: DentalStage): readonly ('backDental' | 'dentalRimReopen')[] | undefined {
  const target = TOOL_STAGE[tool];
  if (stage === target) return [];

  // The rim is the detour: get back to its parent stage first, then reopen the drawing.
  if (target === 'rim') {
    const back = entryEvents('orient', stage);
    return back === undefined ? undefined : [...back, 'dentalRimReopen'];
  }

  /*
   * LEAVING THE RIM DETOUR IS ONE BACK, and that is where the first version of this was wrong. It
   * counted on the spine alone, where `rim` and `aligner` sit at the same depth - so opening Orient
   * from the rim drawing came out as zero steps and read as "cannot get there", when one Back does
   * exactly that.
   */
  const backs = stage === 'rim'
    // From the detour: one Back reaches `aligner`, and everything past it is forward.
    ? (target === 'aligner' ? 1 : 0)
    : depth(stage) - depth(target);

  // Forward is an accept, which belongs to the tool and not to the rail.
  if (backs <= 0) return undefined;
  return Array.from({ length: backs }, () => 'backDental' as const);
}
