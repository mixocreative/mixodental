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
    && press.selected && press.tool === 'select' && press.selectStyle === 'click';
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
  if (input.cancelled) return 'cancel';
  if (input.travel <= CLICK_TOLERANCE) return 'click';
  return input.onModel ? 'move' : 'cancel';
}

/** Where a move puts the tip, in the unit's own space. */
export interface TipTarget {
  position: Vector;
  normal: Vector;
}

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
