import { registerCommands, registerStepHints, type UiState } from '@mixo-geocore/editing/commands';

/*
 * The denture job's rows in the shared command registry (mixo-geocore editing/commands): "Fix" (resolve all) in Step 2,
 * and the undo/redo hint of a denture policy change (a model-landing resolve, a denture setting). Importing this
 * module registers them; src/dental/editingMode.ts imports it, so the app entry and the test setup have them.
 */

declare module '@mixo-geocore/editing/types' {
  interface ExtraStepKinds { dentureChange: true }
}

declare module '@mixo-geocore/editing/commands' {
  interface ExtraCommandIds { 'denture.resolveAll': true }
  interface UiState {
    /** Denture Step 2: how many unresolved points of the current build a click can support from the model surface. */
    dentureResolvable?: number;
    /** The dental job kind of the step (from its profile). */
    dentalKind?: 'aligner' | 'denture';
  }
}

const inDentureSupports = (s: Pick<UiState, 'mode' | 'dentalStage' | 'dentalKind'>) => s.mode === 'dental' && s.dentalStage === 'review' && s.dentalKind === 'denture';

registerCommands({
  'denture.resolveAll': {
    role: 'secondary', label: () => 'Fix', hint: () => 'Support every unresolved point from the model surface. One undo step',
    visible: inDentureSupports, enabled: (s) => inDentureSupports(s) && (s.dentureResolvable ?? 0) > 0 && !s.generating,
    disabledReason: (s) => (!inDentureSupports(s) ? undefined : s.generating ? { key: 'Wait until the supports are built.' } : (s.dentureResolvable ?? 0) > 0 ? undefined : { key: 'No unresolved points to support.' }),
  },
});

registerStepHints({ dentureChange: { undo: 'Undo the denture support change', redo: 'Redo the denture support change' } });
