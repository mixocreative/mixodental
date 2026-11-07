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
   * One model, and the screen already knows the type: straight into the flow. The profile travels
   * WITH the action so the caller needs no non-null assertion to read it back — the condition that
   * produced this action is the only proof it is set, and that proof should not have to be restated.
   */
  | { kind: 'start'; file: File; profile: string }
  /** One model, type not chosen yet: hold it and ask. */
  | { kind: 'hold'; file: File }
  /**
   * More than one model. Several models are not an aligner, so they never enter the dental flow —
   * they are imported together and chosen among on the plate. The Items page takes this over (§8 7b).
   */
  | { kind: 'many'; files: readonly File[] }
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
  options: { screen: 'drop' | 'type' | 'file'; chosen: string | undefined; isProject: (name: string) => boolean },
): DropAction {
  if (files.length === 0) return { kind: 'ignore' };
  const project = files.find((file) => options.isProject(file.name));
  if (project) return { kind: 'project', file: project };
  const models = files.filter(isModelFile);
  if (models.length === 0) return { kind: 'unsupported' };
  if (models.length > 1) return { kind: 'many', files: models };
  const only = models[0]!;
  return options.screen === 'file' && options.chosen !== undefined
    ? { kind: 'start', file: only, profile: options.chosen }
    : { kind: 'hold', file: only };
}
