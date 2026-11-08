// Copyright (c) Mixo Creative.

import type { DetectState } from '../items/detectState';
import type { PrintUnit } from '../state/project';
import { staleTools } from '../state/revisions';
import { toolsFor } from '../state/tools';
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
  || unit.revisions?.orient !== undefined || acceptedPolicy(unit);

const hasRim = (unit: PrintUnit): boolean => unit.rimDraft?.closed === true || unit.dental !== undefined;

/**
 * AN ACCEPTED POLICY OF EITHER JOB KIND, which is evidence the flow passed Orient to get there. It is
 * not an accepted AREA: a denture has no area step, and conflating the two is what used to make the
 * rail instruct about a rim on a job that never draws one.
 */
const acceptedPolicy = (unit: PrintUnit): boolean => unit.dental !== undefined || unit.denture !== undefined;

/**
 * WHICH JOB THIS ROW IS, and why it takes BOTH a flag and the unit.
 *
 * `unit.denture` is the ACCEPTED policy, written by `denture/set` on acceptance - so it is empty for
 * a denture that has been dropped and oriented but not yet accepted. Reading only the unit therefore
 * treated a denture as an aligner for the whole of that window, and the rail told the operator to
 * draw a rim on it. The run's profile is what knows the purpose from the start, so it is passed in;
 * the unit's own policy still counts, so a saved project with no run profile is read correctly.
 */
const isDenture = (unit: PrintUnit, denture: boolean): boolean => denture || unit.denture !== undefined;

export function unitFacts(unit: PrintUnit, detected?: DetectState, denture = false): ToolFacts {
  const stale = staleTools(unit.revisions ?? {});
  return {
    // The job's own chain, so every prerequisite below is the one THIS job has (`state/tools.ts`).
    tools: toolsFor(isDenture(unit, denture)),
    oriented: oriented(unit, detected),
    hasRim: hasRim(unit),
    // The accepted footprint, of an ALIGNER. A rim being drawn, closed or not, is not an area, and a
    // denture never has one - its Supports waits on the orientation instead, which the chain says.
    areaAccepted: unit.dental !== undefined,
    // A detection running IS the Orient tool working, and it is the only busy state the deck can
    // report. There was a parameter here for a caller to override it; nothing ever passed one.
    ...(detected?.kind === 'running' ? { runningTool: 'orient' as const } : {}),
    ...(stale.length > 0 ? { stale } : {}),
  };
}
