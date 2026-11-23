import { useCallback, useEffect, useRef, type MutableRefObject } from 'react';
import type { EditSession, SessionEvent } from '@mixo-geocore/editing/session';
import { withDentalMesh } from '@mixo-geocore/host/dental/dentalEngine';
import type { PrintScene, PrintUnit, SceneCommand } from '../../../state/project';
import type { SurfacePath } from '../../../core/surfacePath/path';
import { resamplePath } from '../../../core/surfacePath/resample';
import { pathProblems } from '../../../core/surfacePath/validate';
import { RIM_SAMPLE_SPACING_MM, projectOntoMesh, type RimSession } from '../../../dental/rim/drawnRim';
import { seedDentureRimDraft } from '../../../dental/rim/seedFromDetected';
import { rimProblemText } from '../../../dental/rim/rimStepText';
import type { DentureClient } from '../../engine/dentureClient';
import { engineCaseFlip } from '../../state/caseFlip';

/*
 * ONE JOB: a denture's drawn rim in Step 1 (docs/ORIENT-NODES.md section 10 step 10; owner 2026-11-23: "the drawn
 * rim should replace the detected"). The drawing tool itself is the aligner's (`src/dental/rim/`, one tool); this
 * hook is only what differs for a denture:
 *   - ENTER seeds the drawing from the operator's own earlier rim, else from DETECTION's rim (a worker job, since
 *     the denture rim lives in the engine's analysis, not on the unit);
 *   - DONE lays the drawing on the surface and stores it on the unit (`dentureRim/set`, one undo step);
 *   - a changed drawn rim - Done, Undo, Redo, Restore - SCANS THE PRINT ANGLES AGAIN: the rim decides the rim tips,
 *     and the tips decide the angle, so an angle picked on the old rim would be a stale answer on screen.
 */
export function useDentureRim({ client, dispatch, send, sceneRef, sessionRef, session, setStatus, rescan }: {
  client: () => DentureClient;
  dispatch: (command: SceneCommand) => void;
  send: (event: SessionEvent) => void;
  sceneRef: MutableRefObject<PrintScene>;
  sessionRef: MutableRefObject<EditSession>;
  session: EditSession;
  setStatus: (key: string, vars?: Record<string, string | number>, other?: string) => void;
  /** Step 1's scan (`useDentureOrient.start`). */
  rescan: (unit: PrintUnit) => void;
}) {
  const unitOf = useCallback((unitId: string | undefined) => sceneRef.current.units.find((candidate) => candidate.id === unitId), [sceneRef]);

  /** Redraw the rim: open the mode on a drawing - the operator's untouched draft, their stored rim, or detection's. */
  const enter = useCallback(() => {
    const unit = unitOf(sessionRef.current.dentalUnitId);
    const profile = sessionRef.current.dentalProfile;
    if (!unit || !profile) return;
    // A draft the operator touched is theirs: never replaced (the aligner's rule, `App.tsx` dental.rim.enter).
    if (unit.rimDraft && unit.rimDraftSeeded !== true) return send({ type: 'dentalRimReopen' });
    if (unit.dentureRim) {
      dispatch({ type: 'rim/set', unitId: unit.id, path: unit.dentureRim.path });
      return send({ type: 'dentalRimReopen' });
    }
    setStatus('Reading the detected rim…');
    void client().detectedRim(unit.id, unit.source, profile, { key: 'Reading the rim of {name}', vars: { name: unit.name } }, engineCaseFlip(unit)).then((found) => {
      // Left Step 1 or moved to another unit while it ran: the answer is for a screen nobody is on.
      if (sessionRef.current.dentalStage !== 'aligner' || sessionRef.current.dentalUnitId !== unit.id) return;
      const seeded = found && seedDentureRimDraft(found.lines, found.normal);
      if (seeded) dispatch({ type: 'rim/set', unitId: unit.id, path: seeded, seeded: true });
      send({ type: 'dentalRimReopen' });
      setStatus(seeded ? 'Drag the points to move the rim; press the line to add one.' : 'No rim was detected on this denture. Place points along the rim, then press Done.');
    }, () => setStatus('The detected rim could not be read. Press Redraw the rim again.'));
  }, [client, dispatch, send, sessionRef, setStatus, unitOf]);

  /** Done: the drawing, laid on the surface, becomes the unit's rim; the draft goes, Step 1 takes it from there. */
  const done = useCallback((unit: PrintUnit, path: SurfacePath) => {
    const problem = pathProblems(path)[0];
    if (problem) return setStatus(rimProblemText(problem));
    const resampled = withDentalMesh(unit.source, (engine, mesh) => resamplePath(path, RIM_SAMPLE_SPACING_MM, projectOntoMesh(engine as unknown as RimSession, mesh)));
    if (!resampled || resampled.points.length < 2) return setStatus('Place at least two points along the rim.');
    dispatch({ type: 'batch', commands: [
      { type: 'dentureRim/set', unitId: unit.id, rim: { path, points: resampled.points.map((p) => [p[0], p[1], p[2]]) } },
      { type: 'rim/clear', unitId: unit.id },
    ] });
    send({ type: 'dentalRimDefined' });
    setStatus('Rim saved. Checking the print angles again with your rim…');
  }, [dispatch, send, setStatus]);

  // The re-scan. Keyed by unit, so moving to another denture is not mistaken for a changed rim.
  const unitId = session.dentalUnitId;
  const unitNow = unitOf(unitId);
  // The rim AND the flip: either changes the rim tips, and the tips decide the angle. One object per change, so a
  // reference compare sees every Done, Undo and Redo of either.
  const rimNow = unitNow ? `${JSON.stringify(unitNow.dentureRim ?? null)}|${JSON.stringify(unitNow.dentureFlip ?? null)}` : undefined;
  const seen = useRef<{ unitId: string | undefined; rim: unknown }>({ unitId, rim: rimNow });
  const ready = session.mode === 'dental' && session.dentalStage === 'aligner' && session.dentalAligner === 'ready';
  useEffect(() => {
    const before = seen.current;
    seen.current = { unitId, rim: rimNow };
    if (before.unitId !== unitId || before.rim === rimNow || !ready) return;
    const unit = unitOf(unitId);
    if (unit) rescan(unit);
  }, [ready, rescan, rimNow, unitId, unitOf]);

  return { enter, done };
}
