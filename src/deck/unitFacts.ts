// Copyright (c) Mixo Creative.

import type { DetectState } from '../items/detectState';
import type { PrintUnit } from '../state/project';
import { staleTools } from '../state/revisions';
import type { ToolFacts } from './toolState';

/**
 * WHAT A UNIT PRESENTS TO THE RAIL. The one place that reads the scene's own fields and answers the
 * questions `toolState` asks, so the rule stays pure and this stays the only thing to change when
 * the scene's shape moves.
 */

/**
 * ORIENTED MEANS THE DETECTOR HAS LOOKED AT THE MODEL, which is what Rim actually waits for.
 *
 * Two earlier readings of this were wrong, in opposite directions:
 *   - Reading `revisions.orient` alone reported false for every unit the batch had just oriented,
 *     because the batch dispatches no `transform/set`. The rail then told the operator to turn a
 *     model that was already upright.
 *   - Inferring it from a hand-drawn rim was backwards: rim drawing is entered from
 *     `dentalRimNeeded` precisely when detection found NO rim, so a drawn rim is evidence the
 *     detector came back empty, not that a pose was accepted.
 *
 * `no-rim` counts for the same reason the flow hands over to rim drawing on it: the detector ran and
 * produced a usable answer about this mesh. `failed` does not - the job could not run, so there is
 * nothing to build a rim on. An accepted footprint counts too, since the flow cannot reach one
 * without passing Orient, and that is what carries a reopened project.
 */
const oriented = (unit: PrintUnit, detected?: DetectState): boolean =>
  detected?.kind === 'oriented' || detected?.kind === 'no-rim'
  || unit.revisions?.orient !== undefined || hasAcceptedArea(unit);

const hasRim = (unit: PrintUnit): boolean => unit.rimDraft?.closed === true || unit.dental !== undefined;

/**
 * A DENTURE HAS NO AREA STEP, and reading only `unit.dental` made the rail lie about one: a denture
 * that was oriented and supported showed Area and Supports greyed, with the line "The area is
 * measured from the rim, so draw the rim first." on a job that never draws a rim. Its accepted
 * policy is `unit.denture` (`denture/set`), and `stageAfterOrientation` sends it straight from Orient
 * to its supports.
 */
const isDenture = (unit: PrintUnit): boolean => unit.denture !== undefined;
/** Any accepted footprint, of either job kind. */
const hasAcceptedArea = (unit: PrintUnit): boolean => unit.dental !== undefined || isDenture(unit);

export function unitFacts(unit: PrintUnit, detected?: DetectState): ToolFacts {
  const stale = staleTools(unit.revisions ?? {});
  return {
    oriented: oriented(unit, detected),
    // A denture draws no rim, so the rim tool is not something it is waiting for: reporting the rim
    // as present is what keeps the rail from instructing about a step the job does not have.
    hasRim: isDenture(unit) || hasRim(unit),
    // The accepted footprint. A rim being drawn, closed or not, is not an area.
    areaAccepted: hasAcceptedArea(unit),
    // A detection running IS the Orient tool working, and it is the only busy state the deck can
    // report. There was a parameter here for a caller to override it; nothing ever passed one.
    ...(detected?.kind === 'running' ? { runningTool: 'orient' as const } : {}),
    ...(stale.length > 0 ? { stale } : {}),
  };
}
