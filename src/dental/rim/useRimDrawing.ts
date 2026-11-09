import { useCallback } from 'react';
import type { EditSession, SessionEvent } from '@mixo-geocore/editing/session';
import { withDentalMesh } from '@mixo-geocore/host/dental/dentalEngine';
import { inverseTransformDirection, inverseTransformPoint } from '@mixo-geocore/host/state/transform';
import { appendAnchor, closePath, emptyPath, hasAnchor, removeAnchor, type SurfaceAnchor, type SurfacePath } from '../../core/surfacePath/path';
import type { Message } from '../../i18n';
import type { PrintScene, SceneCommand } from '../../state/project';
import { presetCommands } from '../../components/useDentalFlow';
import { manualAreaPolicy } from '../manualArea';
import { drawnRim } from './drawnRim';
import { rimProblemText } from './rimStepText';
import { closesLoop } from './rimDraftGeometry';

/*
 * What rim define mode DOES: the edits the viewport and the dock make to the drawing, and Done.
 *
 * Here rather than in `App.tsx` so that the whole of rim define mode lives under `src/dental/rim/` -
 * its words, its dock, its geometry, its engine call and its actions - and App keeps a call site
 * instead of the feature. The one piece outside is `RimDraftLayer`, which belongs with the other
 * viewport layers.
 *
 * The two edits are ordinary scene commands, which is the whole reason the drawing is scene state: the
 * app's own history undoes an anchor the way it undoes anything else, and the mode needs no private
 * undo stack that could interleave with it.
 */
export function useRimDrawing({ session, scene, dispatch, send, setStatus }: {
  /** Live refs, not state: a pointer handler must read what is true NOW, not what it closed over. */
  session: { readonly current: EditSession };
  scene: { readonly current: PrintScene };
  dispatch: (command: SceneCommand, edit?: string) => void;
  send: (event: SessionEvent) => void;
  setStatus: (key: string, vars?: Message['vars'], other?: string) => void;
}) {
  /** Only while the mode is open: a stale pointer event must not edit a drawing nobody is looking at. */
  const drawing = () => session.current.mode === 'dental' && session.current.dentalStage === 'rim';

  /**
   * Place: one hit on the model becomes one anchor.
   *
   * A hit ON THE FIRST ANCHOR closes the loop instead of adding another, because that is the gesture
   * every drawing program uses to finish a shape - and Close loop is the button beside it, as the
   * house rule requires. A closed loop takes no more anchors: `appendAnchor` refuses, and refusing
   * quietly is right, since the operator can see the loop is shut.
   */
  const onRimPoint = useCallback((unitId: string, point: [number, number, number], normal: [number, number, number]) => {
    if (!drawing()) return;
    const unit = scene.current.units.find((candidate) => candidate.id === unitId);
    if (!unit) return;
    // Unit-local, like every anchor: the drawing survives the model being moved or turned later.
    const anchor: SurfaceAnchor = {
      position: inverseTransformPoint(unit.transform, point),
      normal: inverseTransformDirection(unit.transform, normal),
    };
    const path = unit.rimDraft ?? emptyPath();
    const next = closesLoop(path, anchor.position) ? closePath(path) : appendAnchor(path, anchor);
    if (!next) return;
    dispatch({ type: 'rim/set', unitId, path: next });
  }, [dispatch, scene, session]);

  /**
   * Adjust picks an anchor up: the press that starts a drag is also the one that chooses the subject of
   * Delete point. One gesture, two uses, and no third tool in a mode whose whole job is a single loop.
   *
   * The ring this leaves SURVIVES A VIEW TURN, which is why the selection is not dropped on a press over
   * bare surface. A rim runs all the way round a shell, so the operator turns the model constantly to
   * reach the far side; a selection that fell off every time they looked from another angle would make
   * Delete point unusable exactly where it is needed most.
   */
  const onRimSelect = useCallback((at: number | undefined) => {
    if (!drawing()) return;
    send({ type: 'setDentalRimSelected', at });
  }, [send, session]);

  /**
   * DELETE POINT: the picked anchor leaves the drawing, and the ring with it.
   *
   * `removeAnchor` refuses to take the third anchor out of a closed loop - opening the loop silently
   * would throw away what the operator meant by closing it - and the dock has already said so on the
   * greyed button. Reaching the refusal here means the drawing changed underfoot, so it is answered
   * rather than swallowed.
   */
  const onRimDeletePoint = useCallback(() => {
    if (!drawing()) return;
    const unitId = session.current.dentalUnitId;
    const at = session.current.dentalRimSelected;
    const unit = scene.current.units.find((candidate) => candidate.id === unitId);
    const path = unit?.rimDraft;
    if (!unitId || !path || at === undefined || !hasAnchor(path, at)) return;
    const next = removeAnchor(path, at);
    if (!next) return setStatus('A closed rim needs at least three points. Press Clear to start this rim again.');
    dispatch({ type: 'rim/set', unitId, path: next });
    // Nothing is picked once the picked thing is gone: a ring left on the anchor that shuffled into its
    // index would point at a point the operator never chose.
    send({ type: 'setDentalRimSelected', at: undefined });
  }, [dispatch, scene, send, session, setStatus]);

  /** Adjust: the whole drawing as the drag left it, stored in one command and so undone in one. */
  const onRimPath = useCallback((unitId: string, path: SurfacePath) => {
    if (!drawing()) return;
    dispatch({ type: 'rim/set', unitId, path });
  }, [dispatch, session]);

  /**
   * DONE: the drawing becomes the aligner's rim, and Step 1 takes it from there.
   *
   * The engine is asked in a ONE-SHOT session (`withDentalMesh` loads the mesh, runs, frees
   * everything). This happens once on a button press; the alternative is holding a second copy of the
   * model for the life of the app against a call that may never come again.
   *
   * What lands is a `manualAreaPolicy`: the rim is the operator's, and there is no detected area to go
   * with it - but the operator's PAINT is carried across, because redrawing a boundary is no reason to
   * delete the area they marked by hand (see `manualAreaPolicy`). The same presets a detected rim sets are set here, through the same exported function, so
   * the two ways into Step 1 cannot drift apart. The draft is cleared - it has become the rim, and a
   * leftover drawing would be shown over the thing it turned into.
   *
   * EVERY REFUSAL SAYS SOMETHING. The dock already refuses Done for most of these before the press, so
   * reaching one here means something changed underfoot - which is exactly when silence is worst.
   */
  const onRimDone = useCallback(() => {
    if (!drawing()) return;
    const unitId = session.current.dentalUnitId;
    const unit = scene.current.units.find((candidate) => candidate.id === unitId);
    const profile = session.current.dentalProfile;
    const draft = unit?.rimDraft;
    if (!unit || !unitId || !profile || !draft) return;

    const outcome = withDentalMesh(unit.source, (engine, mesh) => drawnRim(engine as never, mesh, draft, profile));

    if (outcome.kind === 'unusable') return setStatus(rimProblemText(outcome.problem));
    if (outcome.kind === 'empty') return setStatus('Place at least three points, then close the loop.');
    if (outcome.kind === 'refused') return setStatus('This rim could not be built from the points as drawn. Move a point and try again.');

    dispatch({ type: 'batch', commands: [
      ...presetCommands(unit, profile),
      // The operator's paint survives the redraw: it is their work, and it is not a function of the rim.
      { type: 'dental/set', unitId, policy: manualAreaPolicy(outcome.rim, false, profile, unit.dental?.stamps ?? []) },
      { type: 'rim/clear', unitId },
    ] });
    send({ type: 'dentalRimDefined' });
    /*
     * The side is the one thing the engine will not guess at, so it is said out loud rather than left
     * to a flip control that does not exist yet. The operator can turn the aligner over in Step 1 and
     * look; a silent wrong side would put every support on the fitting surface.
     */
    setStatus(outcome.sideUncertain
      ? 'Rim saved, but which way the opening faces was unclear. Check the aligner is the right way up before going on.'
      : 'Rim saved.');
  }, [dispatch, scene, send, session, setStatus]);

  return { onRimPoint, onRimPath, onRimSelect, onRimDeletePoint, onRimDone };
}
