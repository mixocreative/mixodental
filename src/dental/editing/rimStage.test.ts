import { describe, expect, it } from 'vitest';
import { gesture } from '@mixo-geocore/editing/gesture';
import { resolve, type UiState } from '@mixo-geocore/editing/commands';
import { keyAction } from '@mixo-geocore/editing/keys';
import { initialSession, reduceSession, type EditSession, type SessionEvent } from '@mixo-geocore/editing/session';
import { READY } from './uiFixture';
import '../editingMode';

/*
 * Rim define mode as a STEP: how Step 1 hands over to it, what its keys do at each stage of a drawing, and
 * the way back out. The drawing itself is `src/core/surfacePath`; the panel is `DentalRimStep`.
 */

const run = (state: EditSession, ...events: SessionEvent[]) => events.reduce(reduceSession, state);
const loading = run(initialSession,
  { type: 'activeUnitChanged', id: 'u1' },
  { type: 'startDental', profile: 'reference-aligner' },
  { type: 'dentalLoading', unitId: 'u1' });
const drawing = run(loading, { type: 'dentalRimNeeded', notices: [{ kind: 'failed' }] });

/** The ui the registry reads while drawing a rim; `at` varies one drawing from another. */
const at = (change: Partial<UiState>): UiState => ({ ...READY, mode: 'dental', dentalStage: 'rim', dentalRimTool: 'place', dentalRimAnchors: 0, ...change });

describe('rim define mode: the stage', () => {
  /*
   * The whole point of the detour. Step 1 used to stop at a notice saying the aligner could not be
   * oriented, with a Next that then declined because a support area needs a rim nobody found. Detection
   * failing now hands straight over to the operator.
   */
  it('is entered by orientation finding no rim, not chosen from a menu', () => {
    expect(drawing.dentalStage).toBe('rim');
    expect(drawing.dentalAligner).toBe('ready');
    expect(drawing.dentalNotices).toEqual([{ kind: 'failed' }]);
    // There is no detector proposal to carry: that is why the operator is here.
    expect(drawing.dentalProposal).toBeUndefined();
    // It opens on Place, because there is nothing yet to adjust.
    expect(drawing.dentalRimTool).toBe('place');
  });

  /*
   * NO SESSION FLAG SAYS THE RIM IS THE OPERATOR. There used to be one, `dentalRimOwn`, and `next()`
   * was its only reader; it was wrong as soon as Step 1 could reopen the mode, because reopening a
   * saved rim and then cancelling cleared it and stranded the aligner. The durable answer is the
   * unit's own manual-area policy, which Cancel, a reopen and a reload all leave alone.
   */
  it('carries no detection proposal into or out of the mode', () => {
    expect(drawing.dentalProposal).toBeUndefined();
    expect(run(drawing, { type: 'dentalRimDefined' }).dentalProposal).toBeUndefined();
  });

  it('only opens from Step 1 while it is still reading the aligner', () => {
    // Not from Step 2, and not from a Step 1 that already has its answer.
    const ready = run(loading, { type: 'dentalOrientFailed', notices: [] });
    expect(run(ready, { type: 'dentalRimNeeded', notices: [] })).toBe(ready);
  });

  it('switches tool, and only inside the mode', () => {
    expect(run(drawing, { type: 'setDentalRimTool', tool: 'adjust' }).dentalRimTool).toBe('adjust');
    const left = run(drawing, { type: 'dentalRimDefined' });
    expect(run(left, { type: 'setDentalRimTool', tool: 'adjust' })).toBe(left);
  });

  it('hands Done back to Step 1, where the aligner is turned by hand', () => {
    const done = run(drawing, { type: 'dentalRimDefined' });
    expect(done.dentalStage).toBe('aligner');
    expect(done.dentalAligner).toBe('ready');
    // The failure notice has done its job and goes: the operator answered it.
    expect(done.dentalNotices).toEqual([]);
  });

  /*
   * Back is the way out of a detour nobody chose, so it returns to the notice that sent them here with the
   * aligner still on the plate - and drops the operator-rim mark, because leaving without finishing means
   * there is no operator rim to protect from detection.
   */
  /*
   * Cancel leaves the MODE, not the work. The drawing lives on the unit and nothing here touches it,
   * which is what makes Draw the rim in Step 1 a way back to it rather than a blank sheet.
   */
  it('goes back to Step 1 and leaves the drawing where it is', () => {
    const back = run(drawing, { type: 'backDental' });
    expect(back.dentalStage).toBe('aligner');
    expect(back.dentalAligner).toBe('ready');
    expect(back.dentalRimSelected).toBeUndefined();
  });

  it('hands the canvas its own gesture, and so no support tool and no gizmo', () => {
    const press = gesture(drawing);
    expect(press).toMatchObject({ kind: 'dental-rim', tool: 'place' });
    // `gizmoShown` only shows a gizmo for gesture kind 'none' or Free transform: this is neither.
    expect(press.kind).not.toBe('none');
  });
});

describe('rim define mode: the way back in', () => {
  /*
   * WITHOUT THIS THE MODE WAS A ONE-WAY DOOR, and three separate faults came of it: Cancel left the
   * operator in a Step 1 with no rim and no way to get one, the drawing it left behind could not be
   * reached, and a rim whose side the engine could not settle could never be redrawn.
   */
  const step1 = (change: Partial<UiState> = {}): UiState =>
    ({ ...READY, mode: 'dental', dentalStage: 'aligner', dentalAlignerReady: true, dentalKind: 'aligner', ...change });

  it('is offered exactly where the dead end is: a read aligner with no detected orientation', () => {
    expect(resolve('dental.rim.enter', step1()).visible).toBe(true);
    expect(resolve('dental.rim.enter', step1()).enabled).toBe(true);
    // A detected aligner has a proposal and is never asked.
    expect(resolve('dental.rim.enter', step1({ dentalProposed: true })).visible).toBe(false);
    // Dentures do not have this mode at all.
    expect(resolve('dental.rim.enter', step1({ dentalKind: 'denture' })).visible).toBe(false);
    // Nor is it offered from any other step.
    expect(resolve('dental.rim.enter', step1({ dentalStage: 'area' })).visible).toBe(false);
    expect(resolve('dental.rim.enter', step1({ dentalStage: 'rim' })).visible).toBe(false);
  });

  it('waits, with a reason, while the aligner is still being read', () => {
    const reading = step1({ dentalAlignerReady: false });
    expect(resolve('dental.rim.enter', reading).enabled).toBe(false);
    expect(resolve('dental.rim.enter', reading).disabledReason?.key).toBe('Wait for the aligner to finish reading.');
  });

  /*
   * A SEPARATE EVENT from `dentalRimNeeded`, which means "detection ran and found no rim" and is
   * accepted only while the aligner is still loading. Widening that guard would have made one event
   * carry two meanings, and the notices it brings belong only to the first.
   */
  it('reopens the mode from a ready Step 1, where the handover event is refused', () => {
    const ready = run(drawing, { type: 'backDental' });
    expect(ready.dentalStage).toBe('aligner');
    expect(ready.dentalAligner).toBe('ready');
    // The handover event cannot do this: it is for a aligner still being read.
    expect(run(ready, { type: 'dentalRimNeeded', notices: [] }).dentalStage).toBe('aligner');
    const back = run(ready, { type: 'dentalRimReopen' });
    expect(back.dentalStage).toBe('rim');
    expect(back.dentalRimTool).toBe('place');
    expect(back.dentalRimSelected).toBeUndefined();
  });

  it('cannot reopen from anywhere but a ready Step 1', () => {
    expect(run(loading, { type: 'dentalRimReopen' }).dentalStage).toBe('aligner');
    expect(run(drawing, { type: 'dentalRimReopen' }).dentalStage).toBe('rim');
    expect(run(initialSession, { type: 'dentalRimReopen' }).mode).toBe('off');
  });
});

describe('rim define mode: picking an anchor', () => {
  /*
   * THE PICK BELONGS TO ADJUST. It is set by Adjust picking an anchor up, so switching tool lets go of it:
   * carrying it into Place would leave a ring on the drawing with no tool that answers to it, and an index
   * that the next Place could push out from under.
   */
  it('is let go of when the tool changes', () => {
    const picked = run(drawing, { type: 'setDentalRimTool', tool: 'adjust' }, { type: 'setDentalRimSelected', at: 3 });
    expect(picked.dentalRimSelected).toBe(3);
    expect(run(picked, { type: 'setDentalRimTool', tool: 'place' }).dentalRimSelected).toBeUndefined();
  });

  it('is let go of on the way out of the mode, either way out', () => {
    const picked = run(drawing, { type: 'setDentalRimTool', tool: 'adjust' }, { type: 'setDentalRimSelected', at: 1 });
    expect(run(picked, { type: 'backDental' }).dentalRimSelected).toBeUndefined();
    expect(run(picked, { type: 'dentalRimDefined' }).dentalRimSelected).toBeUndefined();
  });

  /** Nothing outside the mode may pick an anchor: there is no drawing to pick one from. */
  it('cannot be set from outside rim define mode', () => {
    expect(run(loading, { type: 'setDentalRimSelected', at: 2 }).dentalRimSelected).toBeUndefined();
  });
});

describe('rim define mode: its keys', () => {
  it('offers both tools, and Adjust only once there is a point to adjust', () => {
    const empty = at({ dentalRimAnchors: 0 });
    expect(resolve('dental.rim.place', empty).enabled).toBe(true);
    // Nothing drawn: there is no anchor to pick up, and the reason says the thing to do about it.
    expect(resolve('dental.rim.adjust', empty).enabled).toBe(false);
    expect(resolve('dental.rim.adjust', empty).disabledReason?.key).toBe('Place a point first.');
    const drawn = at({ dentalRimAnchors: 4 });
    expect(resolve('dental.rim.adjust', drawn).enabled).toBe(true);
    expect(resolve('dental.rim.adjust', drawn).disabledReason).toBeUndefined();
  });

  it('shows which tool is in hand', () => {
    expect(resolve('dental.rim.place', at({ dentalRimTool: 'place' })).pressed).toBe(true);
    expect(resolve('dental.rim.adjust', at({ dentalRimTool: 'place' })).pressed).toBe(false);
  });

  it('offers Close loop from three points, and stops offering it once the loop is closed', () => {
    expect(resolve('dental.rim.close', at({ dentalRimAnchors: 2 })).enabled).toBe(false);
    expect(resolve('dental.rim.close', at({ dentalRimAnchors: 3 })).enabled).toBe(true);
    // Not merely disabled: a key that can never apply again is taken away.
    expect(resolve('dental.rim.close', at({ dentalRimAnchors: 4, dentalRimClosed: true })).visible).toBe(false);
  });

  it('offers Clear only when there is something to clear', () => {
    expect(resolve('dental.rim.clear', at({ dentalRimAnchors: 0 })).enabled).toBe(false);
    expect(resolve('dental.rim.clear', at({ dentalRimAnchors: 1 })).enabled).toBe(true);
  });

  /*
   * DELETE POINT, and the two refusals it has to be honest about. The control is always SHOWN - it sits
   * beside Clear and Adjust, which are shown-and-disabled on the same panel, and a key that came and went
   * as the operator touched anchors would make the row jump under the pointer.
   */
  it('offers Delete point only once an anchor is picked, and says which to do first', () => {
    const nothingPicked = at({ dentalRimTool: 'adjust', dentalRimAnchors: 5 });
    expect(resolve('dental.rim.deletePoint', nothingPicked).visible).toBe(true);
    expect(resolve('dental.rim.deletePoint', nothingPicked).enabled).toBe(false);
    expect(resolve('dental.rim.deletePoint', nothingPicked).disabledReason?.key).toBe('Pick a point with Adjust first.');

    const picked = at({ dentalRimTool: 'adjust', dentalRimAnchors: 5, dentalRimSelected: 2 });
    expect(resolve('dental.rim.deletePoint', picked).enabled).toBe(true);
    expect(resolve('dental.rim.deletePoint', picked).disabledReason).toBeUndefined();
    // A danger OUTLINE, never a filled red: the one filled control in this mode is Done.
    expect(resolve('dental.rim.deletePoint', picked).role).toBe('destructive');
  });

  /*
   * THE THIRD ANCHOR OF A CLOSED LOOP STAYS. `removeAnchor` refuses it rather than quietly opening the
   * loop, so the button has to refuse too - and say what the operator can do instead, since there is no
   * control that opens a loop back up.
   */
  it('will not take the third point out of a closed loop, and says what to do instead', () => {
    const three = at({ dentalRimTool: 'adjust', dentalRimAnchors: 3, dentalRimClosed: true, dentalRimSelected: 0 });
    expect(resolve('dental.rim.deletePoint', three).enabled).toBe(false);
    expect(resolve('dental.rim.deletePoint', three).disabledReason?.key)
      .toBe('A closed rim needs at least three points. Press Clear to start this rim again.');
    // Four is one to spare, so it goes.
    expect(resolve('dental.rim.deletePoint', { ...three, dentalRimAnchors: 4 }).enabled).toBe(true);
    // An OPEN path has no such floor: a line of two points is still a line.
    expect(resolve('dental.rim.deletePoint', { ...three, dentalRimClosed: false }).enabled).toBe(true);
  });

  /*
   * THE PICK IS AN INDEX INTO A PATH THE APP HISTORY CAN REWRITE. Pick the last anchor, press the
   * app Undo, and that anchor is gone while the pick still names its slot. Delete point must go off,
   * not stay lit over nothing and then do nothing when pressed.
   */
  it('goes off when the picked point is no longer there', () => {
    const picked = at({ dentalRimTool: 'adjust', dentalRimAnchors: 4, dentalRimSelected: 3 });
    expect(resolve('dental.rim.deletePoint', picked).enabled).toBe(true);
    const undone = at({ dentalRimTool: 'adjust', dentalRimAnchors: 3, dentalRimSelected: 3 });
    expect(resolve('dental.rim.deletePoint', undone).enabled).toBe(false);
    expect(resolve('dental.rim.deletePoint', undone).disabledReason?.key).toBe('Pick a point with Adjust first.');
  });

  it('deletes the picked point with the Delete key, the same key the steps either side use', () => {
    const picked = at({ dentalRimTool: 'adjust', dentalRimAnchors: 5, dentalRimSelected: 2 });
    for (const key of ['Delete', 'Backspace']) {
      expect(keyAction({ key, ctrl: false, shift: false, target: null, ui: picked }).command).toBe('dental.rim.deletePoint');
    }
    /*
     * And with nothing picked the key does NOTHING, rather than falling through to something else:
     * `keyAction` drops a command that is not enabled, and Delete must never reach the step beneath.
     */
    const nothingPicked = at({ dentalRimTool: 'adjust', dentalRimAnchors: 5 });
    expect(keyAction({ key: 'Delete', ctrl: false, shift: false, target: null, ui: nothingPicked }).command).toBeUndefined();
  });

  /*
   * Done is the mode's one primary, and the honest refusal: it stays off, with a sentence saying why, until
   * the loop is closed, sound, AND the engine can turn a drawn loop into a rim. Shipping it enabled against
   * an engine that cannot build the rim would hand the operator an aligner with no supportable area and no
   * error to explain it.
   */
  it('keeps Done off, with a reason, until the loop itself is sound', () => {
    const open = at({ dentalRimAnchors: 4 });
    expect(resolve('dental.rim.done', open).enabled).toBe(false);
    expect(resolve('dental.rim.done', open).disabledReason).toBeTruthy();

    const crossing = at({ dentalRimAnchors: 4, dentalRimClosed: true, dentalRimProblem: 'SELF_INTERSECTING' });
    expect(resolve('dental.rim.done', crossing).enabled).toBe(false);
    expect(resolve('dental.rim.done', crossing).disabledReason).toBeTruthy();

    /*
     * A SOUND LOOP IS NOW DONE. Until engine 61 this still refused, because nothing could build a
     * rim's visibility mask from arbitrary points; `dental_rim_from_points` can, so the loop is the
     * only thing left to be right about.
     */
    const sound = at({ dentalRimAnchors: 8, dentalRimClosed: true });
    expect(resolve('dental.rim.done', sound).enabled).toBe(true);
    expect(resolve('dental.rim.done', sound).disabledReason).toBeUndefined();
  });

  /*
   * THE WAY OUT OF A MODE IS OUT OF THE MODE. Rim define mode is the flow's one modal detour, so its back
   * control is the counterpart of its Done - worded Cancel, carrying Esc, saying what leaving costs -
   * rather than the step arrow, which in every other dock means "the step before this one". And Esc here
   * leaves the MODE and nothing more: it used to leave the whole dental flow from inside a drawing.
   */
  it('wears the mode\'s own words on the way out, not the step arrow\'s', () => {
    const back = resolve('dental.back', at({}));
    expect(back).toMatchObject({ label: 'Cancel', shortcut: 'Esc', visible: true, enabled: true });
    /*
     * The hint has to be TRUE. It used to promise "Step 1 keeps the notice that sent you here", and the
     * handover deliberately drops that notice (`useDentalFlow`, with a comment on why showing it would
     * be telling the operator off for arriving). There was nothing to keep, in three languages.
     */
    expect(back.hint).toBe('Leave rim define mode. Your drawing is kept, and Step 1 offers Draw the rim to come back to it');
    // Everywhere else the same control is step navigation, and says so.
    const inStep = resolve('dental.back', at({ dentalStage: 'area' }));
    expect(inStep).toMatchObject({ label: 'Back', shortcut: undefined });
    expect(inStep.hint).toBe('Return to the previous step and keep your edits');
  });

  it('leaves the mode on Esc, and does not leave the flow', () => {
    const action = keyAction({ key: 'Escape', ctrl: false, shift: false, target: null, ui: at({ dentalRimAnchors: 6 }) });
    expect(action.command).toBe('dental.back');
    // The step it lands on is Step 1, the notice that sent the operator here included.
    expect(run(drawing, { type: 'backDental' }).dentalStage).toBe('aligner');
  });

  it('keeps its keys out of every other step', () => {
    for (const stage of ['aligner', 'area', 'review'] as const) {
      const elsewhere = at({ dentalStage: stage });
      for (const id of ['dental.rim.place', 'dental.rim.adjust', 'dental.rim.close', 'dental.rim.clear', 'dental.rim.done'] as const) {
        expect(resolve(id, elsewhere).visible, `${id} in ${stage}`).toBe(false);
      }
    }
  });
});
