// Copyright (c) Mixo Creative.

import type { Message } from '../i18n';

/**
 * WHAT AN EXPORT WROTE, OR DID NOT, IN ONE VOCABULARY FOR EVERY SCREEN THAT SAYS IT.
 *
 * These four sentences were constants inside `useExport.ts`, said once to the status line and then
 * replaced by whatever message came next - so the operator could press Export, be refused, press
 * something else, and be left with no record that nothing had been written (gap register W-05). The
 * fix is to say it in a second place that KEEPS it: the job activity list, which never drops a
 * failed row and surfaces one even if it ended inside the show delay.
 *
 * Which is why this is a module and not two copies of four strings. The activity list builds its
 * failure text from an error's CODE (`JobActivity.failureText`), and the generic export failure it
 * would otherwise reach says "the export failed" - a second, vaguer vocabulary for an event the
 * status line describes exactly. One thing, one name: both screens read these sentences, from here.
 *
 * Pure, as the rules under `src/components` are meant to be: a reason and a name in, a `Message`
 * out, no React and no scene. The output is narrower than the input, which is the test this repo
 * applies before any extraction - a reason plus a name becomes one sentence.
 *
 * IT WAS `exportRefusalText.ts`, AND THE NAME HAD TO GO. A refusal is decided before anything is
 * written, which is why all four of its sentences can promise that nothing was. The partial write
 * below is the opposite event - some files ARE on the operator's disk - and filing it under
 * "refusal" would have been the same mistake the module exists to undo: two vocabularies for one
 * question, which is "what came out of the export I just pressed".
 */

/**
 * Why nothing was written. `stale`, `failed` and `inconclusive` come from the export gate
 * (`host/supports/exportGate`); `replant` is refused before the job starts, by the orientation
 * revision, so it is not one of the gate's.
 */
export type ExportRefusalReason = 'stale' | 'failed' | 'inconclusive' | 'replant';

/** The code the activity list recognises as "one of these four", so it does not fall back to the generic failure. */
export const EXPORT_REFUSED_CODE = 'export-refused';

/**
 * Every sentence names the unit, says that NOTHING was written, and ends with the next thing to do.
 * The order of those three is deliberate: an operator reading half a status line must still learn
 * that the files are not there.
 */
const REFUSAL: { readonly [K in ExportRefusalReason]: string } = {
  stale: 'Export refused: {name} changed while it was being exported, so the files would not match what you see. Nothing was written; export again.',
  failed: 'Export refused: the supports of {name} were not built, so nothing was written. Generate again, then export.',
  replant: 'Export refused: the supports on {name} were planted before the model was turned, so they would not hold. Nothing was written; regenerate them, then export.',
  inconclusive: 'Export refused: the safety check of {name} could not reach a verdict (it ran out of time or could not judge a crossing), so nothing was written. Generate again, or use fewer supports.',
};

/** The refusal sentence for `reason`, naming `name`. */
export const exportRefusalText = (reason: ExportRefusalReason, name: string): Message =>
  ({ key: REFUSAL[reason], vars: { name } });

/** The code for a write that stopped PART WAY, which is not a refusal and must not read as one. */
export const EXPORT_PARTIAL_CODE = 'export-partial';

/**
 * ONE FILE LANDED AND THE NEXT WAS REFUSED (walk `r1`, G1).
 *
 * `useExport` hands each finished file to the browser in a loop, so by the time the second hand-over
 * is refused the first file is already in the operator's downloads. Every other export failure
 * sentence in the app ends "Nothing was saved" - true for a refusal and for a worker that failed,
 * and FALSE here. The walk caught it saying exactly that with `r-cube-printable.stl` already on
 * disk, and offering "try again", which would have written that file a second time.
 *
 * So this sentence carries three facts and a trap: which files are on disk, which one is not, what
 * to do, and why repeating the whole export is not it.
 */
const PARTIAL = 'Export incomplete: {saved} saved, {name} refused by the browser. Export the remaining objects one at a time - exporting again would save a second copy of what is already there.';

/** The partial-write sentence: the files that landed, and the one that did not. */
export const exportPartialText = (saved: readonly string[], name: string): Message =>
  ({ key: PARTIAL, vars: { saved: saved.join(', '), name } });

/**
 * The same sentence from what an activity row stored, or `undefined` when the row is neither of
 * these outcomes - which is how `failureText` decides whether to use this module at all.
 *
 * The vars are read defensively because they come back off a stored row rather than from a call: an
 * outcome this module does not know is not one it can explain, and inventing a sentence for it would
 * be worse than letting the generic failure text have it.
 */
export function storedExportOutcome(stored: { code: string | null; vars?: Record<string, string | number> }): Message | undefined {
  const name = String(stored.vars?.name ?? '');
  if (stored.code === EXPORT_PARTIAL_CODE) return exportPartialText(String(stored.vars?.saved ?? '').split(', ').filter(Boolean), name);
  if (stored.code !== EXPORT_REFUSED_CODE) return undefined;
  const reason = stored.vars?.reason;
  if (typeof reason !== 'string' || !(reason in REFUSAL)) return undefined;
  return exportRefusalText(reason as ExportRefusalReason, name);
}
