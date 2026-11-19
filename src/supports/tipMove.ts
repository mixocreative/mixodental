import { CLICK_TOLERANCE } from '@mixo-geocore/editing/pick';
import { deleteCommands } from './selection';
import type { EditTool, SelectStyle } from '@mixo-geocore/editing/types';
import type { SupportPoint } from '@mixo-geocore/host/core/analysis/types';
import type { Vector } from '@mixo-geocore/host/core/vec3';
import type { PrintUnit, SceneCommand } from '../state/project';

/*
 * WHAT A DRAG ON A SUPPORT TIP MEANS. No renderer, no refs, no React.
 *
 * WHY THIS FILE EXISTS. The owner's requirement is that the two renderers behave identically, and
 * the way to get that is not to match behaviour but to share it - the rule this repo writes down
 * everywhere and breaks about once a week. So the three decisions live here and BOTH viewports ask:
 * may this press begin a move, what did this release mean, and what commands does the move make.
 * `editing/pick.ts` has exactly this arrangement with `babylon/editClicks.ts`, and `rimTarget.ts`
 * with `babylon/rimDraw.ts`; this is the third instance of the same seam, not a new idea.
 *
 * THE TEST OF WHETHER THE SEAM HELD: if either renderer's adapter grows an `if` about what the
 * gesture MEANS - the tolerance, selected-only, off-model - the rule has leaked and this file has
 * failed at its one job. Listeners, the camera lock, the raycast and the drawing are theirs; the
 * meaning is ours.
 */

/** What the viewport knows about a press, at the moment the button goes down on a support. */
export interface TipPress {
  hit: 'model' | 'support';
  button: 'left' | 'right';
  tool: EditTool;
  selectStyle: SelectStyle;
  /** The object under the pointer is the active one. */
  active: boolean;
  /** The support hit belongs to a CONTACT - not a brace, a raft or a label. */
  contact: boolean;
  /**
   * NOTHING STANDS IN FRONT OF THAT SUPPORT: it is the nearest thing under the press.
   *
   * THE TWO RENDERERS DISAGREED HERE UNTIL THIS FIELD EXISTED, which is the exact failure this seam
   * is built to prevent. r3f offers one pointerdown to every object under it, nearest first, and the
   * model's own handler declines a Select-Click press without stopping propagation - so the press
   * reached the supports mesh behind it and armed a move on a tip the operator could not even see,
   * while Babylon, which takes the nearest candidate and no other, orbited. Reported rather than
   * decided in each view: three.js compares r3f's own intersection list, Babylon the one hit it took.
   */
  nearest: boolean;
  /** That contact is in the session's selection. */
  selected: boolean;
}

/**
 * MAY THIS PRESS BEGIN A TIP MOVE?
 *
 * ONLY A SELECTED TIP, and that is the load-bearing condition rather than a nicety. Step 3 looks at
 * a forest of pillars, and the whole BODY of a support maps back to its contact
 * (`contactAtTriangle`), so without this every orbit that happened to start on a pillar would drag
 * a support off its spot. Requiring the tip to be selected first makes a move a deliberate two-part
 * act - click it, then drag it - and costs only that an orbit cannot begin on a selected support.
 *
 * SELECT + CLICK ONLY. Under Drag over the left button already owns a rubber-band stroke, so a
 * press on a tip there is the start of a selection and must stay one.
 */
export function movePress(press: TipPress): boolean {
  return press.hit === 'support' && press.button === 'left' && press.contact && press.active
    && press.nearest && press.selected && press.tool === 'select' && press.selectStyle === 'click';
}

/** A release, once a press was allowed to arm a move. `click` means: leave it to the ordinary click path. */
export type TipRelease = 'move' | 'click' | 'cancel';

/**
 * WHAT THE RELEASE MEANT.
 *
 * ARMED ON TRAVEL, NOT ON PRESS, because a press on a tip is ALREADY something: `pickAction` returns
 * `toggle` for it. `CLICK_TOLERANCE` is the same four pixels that separate a click from an orbit
 * everywhere else in this app, so a move and a click can never both happen from one press - which is
 * the failure this app is most likely to produce here, two listeners hearing one pointerup.
 *
 * OFF THE MODEL CANCELS, and this is where a tip differs from a rim anchor. `rimDraw` commits its
 * last valid point; a tip must not, because the last valid point on the way off a model is the
 * SILHOUETTE EDGE - a grazing face, and the worst place in the scene to stand a support. Cancelling
 * leaves the tip where it was, which is a state the operator can see and understand.
 */
export function moveRelease(input: { travel: number; onModel: boolean; cancelled: boolean }): TipRelease {
  /*
   * TRAVEL IS TESTED FIRST, AND `cancelled` SECOND, which was the wrong way round until 2026-11-19.
   * A press that never travelled is not a drag at all, so Escape or a lost pointer on one is a
   * CLICK - and the app said "Support left where it was: a tip moves only onto the model" about a
   * gesture the operator never made. A `cancel` now always means a real drag that came to nothing,
   * which is what both viewports' comments claim and what makes the message worth showing.
   */
  if (input.travel <= CLICK_TOLERANCE) return 'click';
  if (input.cancelled) return 'cancel';
  return input.onModel ? 'move' : 'cancel';
}

/**
 * Where a move puts the tip, IN THE UNIT'S OWN SPACE - the only frame the scene stores.
 *
 * `TipDrop` below is the same shape in WORLD space, and the two are kept apart by name because
 * TypeScript cannot keep them apart by type: they are structurally identical, so a viewport that
 * passed a local point would be converted a second time and land somewhere else entirely. A fixture
 * at the origin cannot tell the two frames apart, so nothing would catch it (Fable, 2026-11-19).
 */
export interface TipTarget {
  position: Vector;
  normal: Vector;
}

/**
 * The same pair in WORLD space: what a viewport reads off its pointer, before any conversion.
 * `onMoveTip` is the one place that converts, with `inverseTransformPoint` /
 * `inverseTransformDirection`, exactly as `onAddContact` does for a hand-added support.
 *
 * WHAT COUNTS AS A DROP, which is a rule and not an implementation detail - a second renderer must
 * obey it rather than invent it:
 *   - the nearest hit on the TIP'S OWN unit's model, and nothing else;
 *   - supports, braces, raft and labels are not the model: a drop cannot land on the thing being
 *     carried or on its neighbours;
 *   - ANOTHER UNIT standing in front is passed through, not treated as off the model, which is what
 *     `objectAt` in `viewport/babylon/brushBodies.ts` already does for a stroke;
 *   - no hit at all means `undefined`, and `moveRelease` then cancels.
 * three.js gets this by casting at one mesh; a renderer with a candidate list has to filter for it.
 */
export type TipDrop = TipTarget;

/**
 * THE COMMANDS ONE MOVE MAKES, and the id the selection must follow afterwards.
 *
 * A MANUAL TIP MOVES IN PLACE. It keeps its id, so its own `contactSettings` entry - which is keyed
 * by id - comes with it untouched. That is the whole reason `manual/move` exists instead of the
 * delete-and-add this app could already express: the settings and the single undo step.
 *
 * AN AUTOMATIC TIP CANNOT STAY AUTOMATIC. Automatic tips are the placement's output and are
 * re-derived on every regenerate, so a moved one has nowhere to live in `placement.points`: the next
 * build would simply put it back where the placement says. So it becomes a manual tip at the new
 * spot plus a deletion at the old one - the shape `addTip` already dispatches - and its settings are
 * re-applied under the new id, because `deletion/add` strips the old id's entry on the way past.
 *
 * WHY THE SELECTION HAS TO FOLLOW. The moved tip gets a fresh `manual-...` id, and `movePress` above
 * will only drag a SELECTED tip - so without re-selecting it, every further nudge of the same
 * support would need another click first. The caller is told the id rather than left to guess it.
 */
export function moveCommands(
  unit: Pick<PrintUnit, 'id' | 'manual' | 'deleted' | 'contactSettings'>,
  pointId: string,
  to: TipTarget,
  createId: () => string,
): { commands: SceneCommand[]; selectId: string } {
  if (unit.manual.some((point) => point.id === pointId)) {
    return { commands: [{ type: 'manual/move', unitId: unit.id, pointId, position: to.position, normal: to.normal }], selectId: pointId };
  }
  // Read BEFORE the batch: `deletion/add` below drops this id's entry as it removes the contact.
  const settings = unit.contactSettings[pointId];
  const selectId = createId();
  const point: SupportPoint = { id: selectId, regionId: -1, position: to.position, normal: to.normal, source: 'interior' };
  return {
    commands: [
      ...deleteCommands(unit, [pointId]),
      { type: 'manual/add', unitId: unit.id, point },
      ...(settings ? [{ type: 'contactSettings/set' as const, unitId: unit.id, contactIds: [selectId], patch: settings }] : []),
    ],
    selectId,
  };
}
