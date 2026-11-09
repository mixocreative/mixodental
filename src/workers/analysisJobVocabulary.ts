// Copyright (c) Mixo Creative.

import { ERROR_CONTEXTS, errorCode, type ErrorContext } from '@mixo-geocore/editing/errors';
import type { AnalysisTask } from './analysisProtocol';
import type { Message } from '../i18n';

/**
 * WHICH VOCABULARY EXPLAINS A FAILED BACKGROUND JOB, when the job is one of the analysis worker's.
 *
 * `AnalysisClient.submit` reports each job to the activity list with `context: task.kind`
 * (`dental-orient`, `dental-tilt-scan`, …), and the shared error vocabulary knows five contexts -
 * import, place, build, check, export. None of the dental kinds is one of them, so
 * `JobActivity.failureText` fell through to its default and explained every one of them as a SUPPORT
 * BUILD: "The support worker stopped unexpectedly. Change a setting or generate again to rebuild the
 * supports." for a row on the deck that has no supports and is not in a build (found by audit, walk
 * `r3`, G5).
 *
 * It had been invisible because the background-work list was not mounted on the deck at all, which
 * was the defect that pass started on. Fixing the first one put the wrong sentence on screen, and
 * that is why both are fixed together.
 *
 * Pure: a kind in, a vocabulary out; an error in, a sentence out. No React, no worker, no scene.
 */

/** The analysis jobs that detect something ABOUT THE MODEL, which none of the five shared contexts describes. */
export const DETECT_CONTEXT = 'detect';

/**
 * Every analysis job kind, mapped to the vocabulary that tells the truth about its failure. Total by
 * type, not by habit: a tenth kind added to `AnalysisTask` will not compile until it is given one.
 *
 * The placements really are placements and the risk search really is a check, so those four reuse
 * the shared sentences. The four that look at the model itself get `DETECT_CONTEXT` below.
 */
const VOCABULARY: { readonly [K in AnalysisTask['kind']]: ErrorContext | typeof DETECT_CONTEXT } = {
  place: 'place',
  'dental-place': 'place',
  'dental-retune-place': 'place',
  check: 'check',
  'dental-risk': 'check',
  'dental-orient': DETECT_CONTEXT,
  'dental-region': DETECT_CONTEXT,
  'dental-tilt-scan': DETECT_CONTEXT,
  'dental-confirm-tilt': DETECT_CONTEXT,
};

/**
 * The vocabulary for a row's stored context, or `undefined` when it is neither an analysis kind nor
 * one of the five shared contexts - which is the only case left for a last-resort sentence, and the
 * caller then has to choose one knowingly instead of inheriting "build" by accident.
 */
export function jobVocabulary(context: string | null | undefined): ErrorContext | typeof DETECT_CONTEXT | undefined {
  if (context && context in VOCABULARY) return VOCABULARY[context as AnalysisTask['kind']];
  return (ERROR_CONTEXTS as readonly string[]).includes(context ?? '') ? context as ErrorContext : undefined;
}

/**
 * The three ways a detection ends badly. Each names what was being looked at, says the model is
 * untouched, and ends with the one thing the operator can do about it - opening the model, which
 * runs the same detection again inside the step where they can watch it.
 */
const DETECT_FAILURE = {
  timeout: 'Checking this model took too long and was stopped. The model is unchanged; open it to run the check again.',
  stopped: 'The check of this model stopped unexpectedly. The model is unchanged; open it to run the check again.',
  failed: 'The check of this model failed ({error}). The model is unchanged; open it to run the check again.',
} as const;

/** Why a detection failed, in the operator's words. */
export function detectFailureText(error: unknown): Message {
  const code = errorCode(error);
  if (code === 'timeout') return { key: DETECT_FAILURE.timeout };
  if (code === 'worker-stopped') return { key: DETECT_FAILURE.stopped };
  return { key: DETECT_FAILURE.failed, vars: { error: error instanceof Error ? error.message : String(error) } };
}
