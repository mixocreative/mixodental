// Copyright (c) Mixo Creative.

import type { PrintUnit } from '../state/project';

/**
 * WHICH ITEM THE LOOP GOES TO NEXT, and nothing else.
 *
 * The plan said the Items loop "needs one new session event" to get from item 1 to item 2. It does
 * not. `addAnotherDental` already makes exactly that transition — stage `review` to stage `aligner`,
 * `dentalAligner` back to `prompt`, and `dentalFinished` preserved through `finished()`, which
 * `src/dental/editing/session.test.ts` has proven since before this feature existed. What was
 * genuinely missing is this: the answer to *which unit*, which no existing code had to ask because
 * the old flow only ever had one.
 *
 * So a *Next item* press is three ordinary calls in this order, and the order is the whole subtlety:
 *
 *   1. `selection/set` with `activeUnitId` on the next unit — `startAligner`'s own staleness check
 *      reads `sceneRef.current.activeUnitId` and abandons the orient job if it is not the unit it was
 *      given, so the scene has to point at the next item BEFORE the job starts.
 *   2. `addAnotherDental` with the unit just finished — this is what returns the stage to `aligner`.
 *      `dentalLoading` is a no-op outside that stage (`editingMode.ts`), so a job started first would
 *      die silently.
 *   3. `startDentalAligner(next)`.
 *
 * Nothing here touches the session or the scene; it only reads them.
 */

/**
 * The next unit to work on: the first on the plate that is neither finished nor the one just done.
 * `undefined` means every item has been through the flow, which is what ends the loop.
 *
 * Plate order, not drop order, because the plate is what the operator is looking at — and
 * `placeImportedUnits` appends in drop order anyway, so for one import they are the same. They stop
 * being the same as soon as a unit is deleted or a second drop lands, and then the plate wins.
 */
export function nextItem(
  units: readonly PrintUnit[],
  finished: readonly string[],
  justDone: string | undefined,
): PrintUnit | undefined {
  return units.find((unit) => unit.id !== justDone && !finished.includes(unit.id));
}

/**
 * How many items are still to do, for the row's own count. Counts the same set `nextItem` draws from,
 * so "3 left" and the unit the press goes to can never disagree — the two must come from one rule or
 * the page can say one thing and do another.
 */
export const itemsLeft = (
  units: readonly PrintUnit[],
  finished: readonly string[],
  justDone?: string,
): number => units.filter((unit) => unit.id !== justDone && !finished.includes(unit.id)).length;
