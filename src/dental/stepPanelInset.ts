/** Windows narrower than this stack the step panel along the bottom (phones); from here up it docks on the right. */
export const STEP_PANEL_BOTTOM_BELOW_PX = 721;

/** Px of the viewport a docked step panel covers: its 300 px plus the margins. */
export const STEP_PANEL_INSET_PX = 328;

/**
 * Px of the viewport Step 2's panel (the denture) or Step 3's (the aligner) covers on the right, for the fit-view
 * inset, so the model frames in the free area. None while the panel docks at the bottom of a phone-width window.
 */
export function stepPanelInset(session: { mode: string; dentalStage?: string | undefined }, windowWidth?: number): number {
  if (session.mode !== 'dental' || session.dentalStage !== 'review') return 0;
  const width = windowWidth ?? (typeof window !== 'undefined' ? window.innerWidth : 1280);
  return width < STEP_PANEL_BOTTOM_BELOW_PX ? 0 : STEP_PANEL_INSET_PX;
}
