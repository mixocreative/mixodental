// Copyright (c) Mixo Creative.

import type { DentalOrientation } from '@mixo-geocore/host/dental/dentalOrient';
import type { DentalKind } from '@mixo-geocore/host/dental/dentalKind';
import type { Message } from '../i18n';

/**
 * WHAT A ROW SHOWS ABOUT ITS OWN ORIENTATION, while the batch runs and after it.
 *
 * The batch is one `dentalOrient` per row (plan §0b step 3). Every row keeps ITS OWN result, which is
 * the point: upper and lower arches in one drop orient differently, so a single answer imposed on the
 * list would be wrong for half of it. A row that came out odd is the one the operator opens.
 *
 * Pure: no React, no worker, no strings of its own. The UI picks the words, as `rowState.ts` does for
 * the health verdict — these two sit side by side on a row and must not grow into each other.
 */

/**
 * What the engine told us that a human has to settle. Ordered worst first in `doubts`.
 *
 * `mesh` IS FIRST AND IT IS NOT AN ORIENTATION PROBLEM, which is why it changes the chip's words:
 * supports on a mesh that is not closed cannot be trusted whatever the pose, and sending the
 * operator to look at the orientation would be the wrong instruction. Owner's ruling 6: the gate is
 * the engine's own `meshOk` ("usable: closed, non-degenerate"), NOT a watertight test - a trimmed
 * aligner is legitimately open and its boundary loop is the feature Step 1 exists to find.
 */
export type OrientDoubt =
  /** `meshOk` false: not closed or degenerate. Nothing built on it can be trusted. */
  | 'mesh'
  /** No rotation came back: the pose was ambiguous. This is the one that used to read "Already upright." */
  | 'pose'
  /** `matchesProfile` false: the opening found contradicts the type the operator chose. */
  | 'profile'
  /** The floor rule and the trim plane disagree about which way is up. */
  | 'up-down'
  /** The central opening could not be called present or absent. */
  | 'opening';

export type DetectState =
  /** Dropped, purpose chosen, job not started yet. The gate decides when (see below). */
  | { readonly kind: 'waiting' }
  /** Its job is running. */
  | { readonly kind: 'running' }
  /**
   * Detection found the rim and a pose AND the engine agreed with itself about all of it. `turned` is
   * false when the file was already upright - which now means the pose it returned was the identity,
   * not that it could not decide on one (see `doubt` below).
   */
  | { readonly kind: 'oriented'; readonly turned: boolean }
  /**
   * The check RAN and produced something the operator must settle before this model is generated.
   *
   * THIS STATE IS THE OWNER'S RULING 5, and before it 'Ready' meant only "the detector did not
   * crash": `detectStateOf` mapped every non-failed answer to `oriented`, so a model whose pose
   * could not be decided, whose opening contradicted the chosen type, whose two up/down rules
   * disagreed, or whose mesh was not even closed, all showed Ready - and the worst of those read
   * "Already upright.", because an absent rotation was being told as good news.
   *
   * `doubts` is ordered, worst first, and the card shows the first one. Several can be true at once
   * and listing them all on a row in a deck of thirty is what the chip exists to avoid.
   */
  | { readonly kind: 'check'; readonly doubts: readonly OrientDoubt[] }
  /**
   * Detection ran and found no rim. NOT an error: it is the ordinary answer for a trimmed arch, and
   * the flow's own response is to hand over to rim drawing rather than to stop.
   */
  | { readonly kind: 'no-rim' }
  /**
   * The job could not run or came back unusable.
   *
   * `because` IS THE REASON THE BATCH USED TO THROW AWAY. `useBatchDetect` caught every error with
   * `.catch(() => undefined)`, so a job the worker killed for taking too long and a job that failed
   * on the first instruction drew the same line - and the one an operator can act on differently
   * (wait less, simplify the model) was the one being hidden. `undefined` is "we do not know",
   * which is honest for a result that simply came back unusable.
   */
  | { readonly kind: 'failed'; readonly because?: 'timeout' };

/**
 * Everything the engine's answer says a human must settle, worst first. Empty is the ready answer.
 *
 * ONE PLACE, because the queue and the row must not disagree about what Ready means - that is the
 * whole of `src/autoGen/eligibility.ts`, which reads this state and nothing else.
 */
function orientDoubts(result: Extract<DentalOrientation, { kind: 'oriented' }>): OrientDoubt[] {
  const doubts: OrientDoubt[] = [];
  if (!result.meshOk) doubts.push('mesh');
  if (result.rotation === undefined) doubts.push('pose');
  if (!result.matchesProfile) doubts.push('profile');
  if (result.proposal.diagnostics.crossCheck === 'disagrees') doubts.push('up-down');
  if (result.opening === 'ambiguous') doubts.push('opening');
  return doubts;
}

/** What the worker's answer means for a row. `undefined` is a job that produced nothing. */
export function detectStateOf(result: DentalOrientation | undefined): DetectState {
  if (!result) return { kind: 'failed' };
  // A failed detection with a usable mesh is "no rim here", which the flow answers by offering to
  // draw one. An unusable mesh is a different thing and the health verdict already says so.
  if (result.kind === 'failed') return result.meshOk ? { kind: 'no-rim' } : { kind: 'failed' };
  const doubts = orientDoubts(result);
  const { rotation } = result;
  // `rotation === undefined` is already the `pose` doubt above; it is repeated here only so the
  // compiler can narrow, and the test below pins that the two never disagree.
  if (doubts.length > 0 || rotation === undefined) return { kind: 'check', doubts };
  /*
   * `turned` IS NOW READ FROM THE POSE, not from whether there is one. It used to be
   * `rotation !== undefined`, and an undefined rotation means the engine COULD NOT DECIDE - so the
   * one state that needed the operator was the one reporting "Already upright." An identity pose is
   * what "the file arrived upright" actually looks like, and it is only reachable here because a
   * missing pose is now a doubt above.
   */
  return { kind: 'oriented', turned: rotation.some((angle) => angle !== 0) };
}

/**
 * The sentence for each doubt: what was found, and the next thing to do about it.
 *
 * NONE OF THEM PROMISES A REPAIR. The hole-filling step is cut from this release (owner's
 * correction to ruling 6), so `mesh` says to look rather than offering a fix that does not exist.
 */
const DOUBT_SENTENCE: Record<OrientDoubt, string> = {
  mesh: 'This model is not closed, so supports cannot be trusted on it. Open it before generating.',
  pose: 'Could not decide which way is up. Open it to orient by hand.',
  profile: 'The opening found does not match the type chosen. Check the type, or open it by hand.',
  'up-down': 'Up and down need a look: the two rules disagree. Open it and check which side is up.',
  opening: 'The central opening is unclear. Open it and check the orientation.',
};

/**
 * The row's line, or `undefined` for a row that has no detection state at all.
 *
 * `waiting` SAYS SO (gap register W-03). It used to return `undefined`, which drew the same blank as
 * a row the batch has never heard of - so "queued behind the others" and "nothing is happening to
 * this row" were one picture. The batch drains one row at a time (`useBatchDetect`), so on a case of
 * eight the later rows sit in `waiting` for minutes, and a stalled job ahead of them holds them
 * there for as long as the analysis worker's own per-job timeout allows (10 minutes, then the job
 * fails and the queue moves on - so the queue cannot block for ever, which is the half of W-03 the
 * register had wrong). Either way the operator was shown nothing and had nothing to wait for.
 */
export function detectSentence(state: DetectState, kind: DentalKind = 'aligner'): Message | undefined {
  switch (state.kind) {
    case 'waiting': return { key: 'Waiting its turn…' };
    case 'running': return { key: 'Checking the orientation…' };
    // "Turned" is the fact an operator checks against the model in front of them; "already upright"
    // tells them the file arrived that way, which is worth knowing when a batch is inconsistent.
    case 'oriented': return { key: state.turned ? 'Turned upright.' : 'Already upright.' };
    // The worst doubt names the problem; the rest are the same instruction - open it and look.
    case 'check': return { key: DOUBT_SENTENCE[state.doubts[0] ?? 'pose'] };
    /*
     * THE LINE NAMES THE JOB'S OWN NEXT STEP, and until 2026-11-18 it named the ALIGNER'S whatever
     * the job was. "No rim found. Draw one to continue." was shown on a denture row - and a denture's
     * rail has no Rim button at all, so the one instruction on screen pointed at a control that does
     * not exist for that job.
     *
     * The flow map blamed the DETECTION for this ("the case runs the aligner's detection whatever
     * the purpose"). That was wrong, and reading the code is what settled it: `useBatchDetect`
     * passes each row's own queued profile to `dentalOrient`, so the detection has always been
     * per-purpose. Only the sentence was blind. The fix is therefore this one argument rather than
     * the per-purpose orient stage the map scheduled.
     */
    case 'no-rim': return kind === 'denture'
      ? { key: 'Could not stand this upright. Open it to orient by hand.' }
      : { key: 'No rim found. Draw one to continue.' };
    // It names the next thing to do, because the row is one of the few the operator must handle.
    // A TIMEOUT SAYS SO, in the words every other timed-out job in this app uses (`errors.ts`): the
    // operator's next move is different, and "could not check" invites a retry that will also time out.
    case 'failed': return state.because === 'timeout'
      ? { key: 'Checking this model took too long and was stopped. The model is unchanged; open it to run the check again.' }
      : { key: 'Could not check the orientation. Press Retry, or open it to orient by hand.' };
  }
}

/**
 * THE SAME ANSWER IN ONE OR TWO WORDS, for the row in a list of thirty.
 *
 * `detectSentence` above teaches - it names the next thing to do, which is right for the row being
 * worked on and for a tooltip. It is wrong as the only form: two full sentences on every line turned
 * the deck into a spreadsheet 109px tall per file, and the owner's standard for this app is
 * *"neat, compact, and as simple as a game interface"* (2026-11-18).
 *
 * So the row shows the CHIP and carries the SENTENCE in its `title`. Nothing is lost and nothing is
 * collapsed: the health verdict keeps its own mark beside this one (`src/items/README.md`), and the
 * instruction is still one hover - or one glance at the rail, which states it in full for the row
 * being worked on.
 */
export function detectChip(state: DetectState, kind: DentalKind = 'aligner'): Message | undefined {
  switch (state.kind) {
    // A row merely queued says nothing: the footer counts those once for the whole case.
    case 'waiting': return undefined;
    case 'running': return { key: 'Checking…' };
    // "Oriented", not "Ready" (Fable + Codex, 2026-11-27): the chip only says the orientation check passed; beside
    // "Supports built - review needed", "Ready" read as ready to print.
    case 'oriented': return { key: 'Oriented' };
    /*
     * TWO CHIPS, BECAUSE THEY SEND THE OPERATOR TO DIFFERENT PLACES. An unusable mesh is not an
     * orientation problem and "Check orientation" would be the wrong instruction on it; every other
     * doubt is settled by looking at which way the model is standing.
     */
    case 'check': return state.doubts[0] === 'mesh' ? { key: 'Check mesh' } : { key: 'Check orientation' };
    // Named for THIS job's next step: a denture has no Rim tool to send anyone to.
    case 'no-rim': return kind === 'denture' ? { key: 'Needs orienting' } : { key: 'Needs rim' };
    case 'failed': return { key: 'Failed' };
  }
}
