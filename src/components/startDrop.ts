// Copyright (c) Mixo Creative.

/**
 * WHAT A DROP ON A START SCREEN MEANS — the decision, with no DOM in it.
 *
 * This was four nested conditions inside `StartScreen`'s drop handler, which is how it came to
 * `files.find(isStl)`: taking the first model and **silently discarding the rest**. A drop of five
 * aligners looked exactly like a drop of one. Parsing a `DataTransfer` and deciding what a drop means
 * are two jobs, and only the second has rules worth testing.
 *
 * The screen names (plan §1) and the per-file refusal rule (§6) are the policy; this is where they
 * are written once.
 */

/** What the screen should do with a drop. */
export type DropAction =
  /** A saved project was in the drop: it wins over any model, because opening replaces the scene. */
  | { kind: 'project'; file: File }
  /** Files were dropped and none was a model the app takes. */
  | { kind: 'unsupported' }
  /**
   * EVERY MODEL DROP IS A CASE — one file or twenty, on either screen. There is no other outcome,
   * and that is the entry's invariant (owner's ruling, 2026-11-18): *one destination.* Files are
   * imported and the deck is shown; the only thing that varies is whether the purpose is answered
   * when you get there.
   *
   * THIS REPLACED `hold`, `many` AND `start`, and with them the fork that was the parent of four
   * separate defects. A single dropped model used to be `hold`, which the screen turned into
   * `onStart(defaultProfileId('aligner'), file)` on the spot — so a dropped denture went into the
   * ALIGNER flow and was asked for a rim, the purpose having been answered invisibly by a guess. One
   * file went somewhere several files could not, the deck had no door on the commonest run, and the
   * file step bypassed the deck entirely. All four were one fork wearing four faces, and it survived
   * review because it had been written up as a feature: "the fast path, the ordinary single-aligner
   * case". A reviewer audits against the rationale you hand them.
   *
   * `profile` is undefined for a drop on the Drop page: nothing has been chosen, and nothing may be
   * guessed. It carries the chosen type when the operator answered FIRST and then gave files on the
   * file step — keeping an answer they gave is not guessing, it is the preselect that answer buys.
   */
  | { kind: 'case'; files: readonly File[]; profile: string | undefined }
  /** Nothing in the drop at all (a drag that carried no files). */
  | { kind: 'ignore' };

/** The models this app accepts. Binary STL only, as the file input's `accept` says. */
export const isModelFile = (file: File): boolean => /\.stl$/i.test(file.name);

/**
 * `isProject` is passed in rather than imported so the rule stays one function; `StartScreen` hands
 * it `isProjectFile`. `chosen` is the type already picked, if any — on the file screen it is what
 * makes a single model startable.
 */
export function dropAction(
  files: readonly File[],
  options: { screen: 'drop' | 'file'; chosen: string | undefined; isProject: (name: string) => boolean },
): DropAction {
  if (files.length === 0) return { kind: 'ignore' };
  const project = files.find((file) => options.isProject(file.name));
  if (project) return { kind: 'project', file: project };
  const models = files.filter(isModelFile);
  if (models.length === 0) return { kind: 'unsupported' };
  // ONE DESTINATION. Count does not branch here and neither does the screen: the deck takes them.
  return { kind: 'case', files: models, profile: options.screen === 'drop' ? undefined : options.chosen };
}
