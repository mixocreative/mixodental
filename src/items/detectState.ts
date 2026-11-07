// Copyright (c) Mixo Creative.

import type { DentalOrientation } from '@mixo-geocore/host/dental/dentalOrient';
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

/** The row's line, or `undefined` while nothing has happened to it yet. */
export function detectSentence(state: DetectState): Message | undefined {
  switch (state.kind) {
    case 'waiting': return undefined;
    case 'running': return { key: 'Checking the orientation…' };
    // "Turned" is the fact an operator checks against the model in front of them; "already upright"
    // tells them the file arrived that way, which is worth knowing when a batch is inconsistent.
    case 'oriented': return { key: state.turned ? 'Turned upright.' : 'Already upright.' };
    case 'no-rim': return { key: 'No rim found. Draw one to continue.' };
    case 'failed': return { key: 'Could not check the orientation.' };
  }
}

/** How many rows are still to be looked at: what a deck shows as its own progress. */
export const stillToDetect = (states: Iterable<DetectState>): number =>
  [...states].filter((state) => state.kind === 'waiting' || state.kind === 'running').length;
