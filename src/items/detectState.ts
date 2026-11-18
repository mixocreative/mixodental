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

export type DetectState =
  /** Dropped, purpose chosen, job not started yet. The gate decides when (see below). */
  | { readonly kind: 'waiting' }
  /** Its job is running. */
  | { readonly kind: 'running' }
  /** Detection found the rim and a pose. `turned` is false when the file was already upright. */
  | { readonly kind: 'oriented'; readonly turned: boolean }
  /**
   * Detection ran and found no rim. NOT an error: it is the ordinary answer for a trimmed arch, and
   * the flow's own response is to hand over to rim drawing rather than to stop.
   */
  | { readonly kind: 'no-rim' }
  /** The job could not run or came back unusable. */
  | { readonly kind: 'failed' };

/** What the worker's answer means for a row. `undefined` is a job that produced nothing. */
export function detectStateOf(result: DentalOrientation | undefined): DetectState {
  if (!result) return { kind: 'failed' };
  // A failed detection with a usable mesh is "no rim here", which the flow answers by offering to
  // draw one. An unusable mesh is a different thing and the health verdict already says so.
  if (result.kind === 'failed') return result.meshOk ? { kind: 'no-rim' } : { kind: 'failed' };
  return { kind: 'oriented', turned: result.rotation !== undefined };
}

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
    case 'failed': return { key: 'Could not check the orientation. Press Retry, or open it to orient by hand.' };
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
    case 'oriented': return { key: 'Ready' };
    // Named for THIS job's next step: a denture has no Rim tool to send anyone to.
    case 'no-rim': return kind === 'denture' ? { key: 'Needs orienting' } : { key: 'Needs rim' };
    case 'failed': return { key: 'Failed' };
  }
}
