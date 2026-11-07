// Copyright (c) Mixo Creative.

import type { DetectState } from '../items/detectState';
import type { PrintUnit } from '../state/project';
import { staleTools } from './revisions';
import type { ToolFacts, ToolId } from './toolState';

/**
 * WHAT A UNIT PRESENTS TO THE RAIL. The one place that reads the scene's own fields and answers the
 * questions `toolState` asks, so the rule stays pure and this stays the only thing to change when
 * the scene's shape moves.
 */

/**
 * ORIENTING IS A FACT THE DECK ALREADY HAS, and the first version of this got it wrong in a way
 * worth recording. It read `revisions.orient`, `rimDraft` and `dental` only - and **nothing in the
 * app writes `revisions`** - so a unit the batch had just oriented reported `oriented: false`, and
 * the rail told the operator to turn a model that was already upright. The inference meant to save
 * legacy projects delivered that failure to every unit in a normal session instead.
 *
 * The honest source is the detection result the deck is already showing on the row: `oriented` means
 * the detector found a pose. A hand-drawn rim or an accepted area still counts, because neither can
 * be reached without having oriented first.
 */
const oriented = (unit: PrintUnit, detected?: DetectState): boolean =>
  detected?.kind === 'oriented' || unit.revisions?.orient !== undefined || hasRim(unit);

/**
 * A RIM MEANS A CLOSED RIM. `rimDraft` is written on EVERY anchor (`src/dental/rim/useRimDrawing.ts`
 * dispatches `rim/set` per press, starting from `emptyPath()`), so testing it for existence opened
 * Area on a single unclosed point - and an area cannot be measured from one point. That contradicted
 * the rail's own promise that nothing is withheld except what is genuinely impossible, in the
 * direction that matters: it let the operator into a tool that could not work.
 *
 * An accepted policy carries its own rim, so it counts whatever the draft says.
 */
const hasRim = (unit: PrintUnit): boolean => unit.rimDraft?.closed === true || unit.dental !== undefined;

export function unitFacts(unit: PrintUnit, detected?: DetectState, busy?: ToolId): ToolFacts {
  const stale = staleTools(unit.revisions ?? {});
  return {
    oriented: oriented(unit, detected),
    hasRim: hasRim(unit),
    // The accepted footprint. A rim being drawn, closed or not, is not an area.
    areaAccepted: unit.dental !== undefined,
    // A detection running IS the Orient tool working, which is the one busy state the deck can
    // honestly report today. Passed explicitly so a caller cannot forget it is per unit.
    ...(busy ? { busy } : detected?.kind === 'running' ? { busy: 'orient' as const } : {}),
    ...(stale.length > 0 ? { stale } : {}),
  };
}
