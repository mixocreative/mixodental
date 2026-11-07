// Copyright (c) Mixo Creative.

import type { Message } from '../i18n';
import { verdictOfDiagnosis, verdictOfRefusal, type ImportRefusal, type RowState } from '../items/rowState';
import type { PrintUnit } from '../state/project';

/**
 * THE JOB PANEL'S VALIDATION LINE: every row's verdict, counted once, at job level.
 *
 * The reference tool this layout came from has a validation section — per-check warnings with a
 * summary — and that is our per-row verdict surface raised a level. The row still says its own
 * sentence; this says how the DROP is doing, which is the question a deck of eight asks and a list of
 * eight sentences does not answer.
 *
 * WHAT IT DELIBERATELY DOES NOT DO is invent a second opinion. Every count here comes from the same
 * `verdictOfDiagnosis` / `verdictOfRefusal` the rows use, so the panel and the rows cannot disagree —
 * which is the failure worth designing out, because a summary that contradicts the list it summarises
 * destroys trust in both.
 *
 * Pure: no React, and it owns no words beyond picking which `Message` fits the counts.
 */

/** How many rows fall in each class the operator can act on. */
export interface JobTally {
  /** Verdicts saying the mesh is sound. */
  readonly clean: number;
  /** Open rims, or winding and non-manifold trouble. Reported, never repaired in this release. */
  readonly defective: number;
  /** Files that never became units: unreadable, or over a capacity limit. */
  readonly refused: number;
  /** Units carrying no verdict at all — imported before the check existed, or it never ran. */
  readonly unchecked: number;
}

/*
 * The two states `verdictOfDiagnosis` can return that mean trouble. `repaired-open` is NOT here: it
 * comes only from `verdictOfRepair`, and repair is cut from this release, so listing it would imply
 * a path that cannot run.
 */
const DEFECTIVE: readonly RowState['state'][] = ['holes', 'malformed'];

export function jobTally(units: readonly PrintUnit[], refused: readonly { refusal: ImportRefusal }[]): JobTally {
  let clean = 0, defective = 0, unchecked = 0, turnedAway = 0;
  for (const unit of units) {
    if (!unit.diagnosis) { unchecked += 1; continue; }
    const verdict = verdictOfDiagnosis(unit.diagnosis);
    if (DEFECTIVE.includes(verdict.state)) defective += 1;
    else if (verdict.state === 'clean') clean += 1;
    // Any other state is not reachable from a diagnosis, so it is counted nowhere rather than
    // folded into "clean" — a wrong count is worse than a missing one.
  }
  /*
   * COUNTED THROUGH THE ROW'S OWN CLASSIFIER, not as `refused.length`. The length was the same
   * number today and the comment above still claimed every count came from the row verdicts - a
   * claim the code did not keep. Going through `verdictOfRefusal` makes it true, and it means a
   * refusal state that ever stops being a problem stops being counted as one here too.
   */
  for (const entry of refused) {
    const verdict = verdictOfRefusal(entry.refusal);
    if (verdict.state === 'unreadable' || verdict.state === 'too-big') turnedAway += 1;
  }
  return { clean, defective, refused: turnedAway, unchecked };
}

/**
 * The one sentence the panel shows, or `undefined` when there is nothing worth saying.
 *
 * SILENT WHEN EVERYTHING IS SOUND. A panel that says "0 problems" on every drop trains the operator
 * to stop reading it, and then it says nothing on the drop that matters. It speaks only when a row
 * needs attention.
 */
export function jobSentence(tally: JobTally): Message | undefined {
  const trouble = tally.defective + tally.refused;
  if (trouble === 0) return undefined;
  return trouble === 1
    ? { key: '1 of these files needs a look.' }
    : { key: '{n} of these files need a look.', vars: { n: trouble } };
}
