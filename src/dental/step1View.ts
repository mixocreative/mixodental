/**
 * Step 1 (orientation) viewport rules (PD.11). Step 1 draws the model and the Debug layers only: no supports, no raft,
 * and the bottom-right view buttons are hidden. Inputs: the session's `mode` and `dentalStage`. No units.
 */

/** True while the session is in Step 1 (dental aligner stage). */
export function isOrientationStep(s: { mode: string; dentalStage?: string }): boolean {
  return s.mode === 'dental' && s.dentalStage === 'aligner';
}

/** The support meshes Step 1 passes to the viewport: none. */
export const NO_SUPPORT_MESHES: ReadonlyMap<string, never> = new Map<string, never>();
