/**
 * Step 1 (orientation) viewport rules (PD.11), and what Steps 1-2 leave out of the view. Step 1 draws the model and the Debug layers only: no supports, no raft,
 * and the bottom-right view buttons are hidden. Inputs: the session's `mode` and `dentalStage`. No units.
 */

/** True while the session is in Step 1 (dental aligner stage). */
export function isOrientationStep(s: { mode: string; dentalStage?: string }): boolean {
  return s.mode === 'dental' && s.dentalStage === 'aligner';
}

/** The support meshes Step 1 passes to the viewport: none. */
export const NO_SUPPORT_MESHES: ReadonlyMap<string, never> = new Map<string, never>();

const NO_PROBLEMS: readonly never[] = [];

/**
 * CHECK FINDINGS ARE DRAWN ONLY WHERE THE BUILD THEY DESCRIBE IS DRAWN. In a dental session that is Step 3
 * alone: Steps 1 and 2 draw no support meshes (the unit keeps its supports in data, they are just not shown),
 * so a check run at Step 3 and then Back left its markers on a model whose supports had vanished from view -
 * reproduced 2026-11-21 (app UX review finding 3): 2 findings at Step 3, still 2 handed to the viewport at
 * Step 2 and at Step 1. The findings are not forgotten - Step 3 shows them again - only not drawn meanwhile.
 * Outside a dental session the rule does not apply: an unsupported spot on a model with no supports at all is
 * exactly what the editor's check exists to show.
 */
export function shownProblems<T>(s: { mode: string; dentalStage?: string }, listed: readonly T[]): readonly T[] {
  return s.mode === 'dental' && s.dentalStage !== 'review' ? NO_PROBLEMS : listed;
}
