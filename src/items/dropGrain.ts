// Copyright (c) Mixo Creative.

/**
 * DOES THIS DROP KEEP ONE FILE, OR ALL OF THEM?
 *
 * Step 1 takes one aligner: it orients the file as it reads it, so a second file would have nothing
 * to be. A drop onto a LIST adds to the list. That is the whole rule, and it lived as an inline
 * expression in `importFiles` with no test — while two separate bugs had already made a five-file
 * drop indistinguishable from a one-file drop (`StartScreen` took `files.find(isStl)`, and this
 * slice applied whenever Step 1 was waiting, including on the Items page).
 *
 * It is a function so the test and the app share ONE definition. A test that restates the rule
 * passes even when the rule is deleted, which is the fault this module's tests keep finding.
 */

/**
 * `waiting` is `acceptsDentalDrop(session)`: Step 1 is open and not already reading. `takesOne`
 * is the caller's override — the Items page passes `false`, because a drop there adds rows.
 *
 * The default is the STEP 1 rule, and that direction matters: a caller that forgets the option gets
 * the safe answer (one file into a step that takes one), not N files into a step that cannot hold them.
 */
export const dropKeepsOneFile = (waiting: boolean, takesOne?: boolean): boolean => waiting && (takesOne ?? true);

/** The accepted files a drop actually imports, under that rule. */
export const filesToImport = <T>(accepted: readonly T[], keepsOne: boolean): readonly T[] =>
  (keepsOne ? accepted.slice(0, 1) : accepted);
