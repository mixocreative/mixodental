import { useCallback } from 'react';
import type { EditSession } from '@mixo-geocore/editing/session';
import { inverseTransformDirection, inverseTransformPoint } from '@mixo-geocore/host/state/transform';
import { appendAnchor, closePath, emptyPath, type SurfaceAnchor, type SurfacePath } from '../../core/surfacePath/path';
import type { PrintScene, SceneCommand } from '../../state/project';
import { closesLoop } from './rimDraftGeometry';

/*
 * What the viewport does to the drawing, in rim define mode.
 *
 * Here rather than in `App.tsx` so that the whole of rim define mode lives under `src/dental/rim/` -
 * its words, its dock, its geometry, its engine call and now its two edits - and App keeps a call
 * site instead of the feature. The one piece outside is `RimDraftLayer`, which belongs with the other
 * viewport layers.
 *
 * Both edits are ordinary scene commands, which is the whole reason the drawing is scene state: the
 * app's own history undoes an anchor the way it undoes anything else, and the mode needs no private
 * undo stack that could interleave with it.
 */
export function useRimDrawing({ session, scene, dispatch }: {
  /** Live refs, not state: a pointer handler must read what is true NOW, not what it closed over. */
  session: { readonly current: EditSession };
  scene: { readonly current: PrintScene };
  dispatch: (command: SceneCommand, edit?: string) => void;
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

  /** Adjust: the whole drawing as the drag left it, stored in one command and so undone in one. */
  const onRimPath = useCallback((unitId: string, path: SurfacePath) => {
    if (!drawing()) return;
    dispatch({ type: 'rim/set', unitId, path });
  }, [dispatch, session]);

  return { onRimPoint, onRimPath };
}
