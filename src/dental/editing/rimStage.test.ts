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
   * `dentalRimOwn` is what switches auto orientation off for this aligner, and it goes on when the mode
   * OPENS rather than when Done is pressed - otherwise a detection could land on top of a half-drawn rim.
   */
  it('marks the aligner as having the operator rim from the moment the mode opens', () => {
    expect(drawing.dentalRimOwn).toBe(true);
    expect(run(drawing, { type: 'dentalRimDefined' }).dentalRimOwn).toBe(true);
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
  it('goes back to Step 1 and forgets the unfinished rim', () => {
    const back = run(drawing, { type: 'backDental' });
    expect(back.dentalStage).toBe('aligner');
    expect(back.dentalRimOwn).toBe(false);
  });

  it('hands the canvas its own gesture, and so no support tool and no gizmo', () => {
    const press = gesture(drawing);
    expect(press).toMatchObject({ kind: 'dental-rim', tool: 'place' });
    // `gizmoShown` only shows a gizmo for gesture kind 'none' or Free transform: this is neither.
    expect(press.kind).not.toBe('none');
  });
});

describe('rim define mode: its keys', () => {
  it('offers both tools, and Adjust only once there is a point to adjust', () => {
    const empty = at({ dentalRimAnchors: 0 });
    expect(resolve('dental.rim.place', empty).enabled).toBe(true);
    expect(resolve('dental.rim.adjust', empty).enabled).toBe(false);
    expect(resolve('dental.rim.adjust', empty).disabledReason).toBeTruthy();
    expect(resolve('dental.rim.adjust', at({ dentalRimAnchors: 1 })).enabled).toBe(true);
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
   * Done is the mode's one primary, and the honest refusal: it stays off, with a sentence saying why, until
   * the loop is closed, sound, AND the engine can turn a drawn loop into a rim. Shipping it enabled against
   * an engine that cannot build the rim would hand the operator an aligner with no supportable area and no
   * error to explain it.
   */
  it('keeps Done off, with a reason, until the loop and the engine are both ready', () => {
    const open = at({ dentalRimAnchors: 4 });
    expect(resolve('dental.rim.done', open).enabled).toBe(false);
    expect(resolve('dental.rim.done', open).disabledReason).toBeTruthy();

    const crossing = at({ dentalRimAnchors: 4, dentalRimClosed: true, dentalRimProblem: 'SELF_INTERSECTING', dentalRimEngineReady: true });
    expect(resolve('dental.rim.done', crossing).enabled).toBe(false);

    const noEngine = at({ dentalRimAnchors: 8, dentalRimClosed: true, dentalRimEngineReady: false });
    expect(resolve('dental.rim.done', noEngine).enabled).toBe(false);
    expect(resolve('dental.rim.done', noEngine).disabledReason).toBeTruthy();

    const ready = at({ dentalRimAnchors: 8, dentalRimClosed: true, dentalRimEngineReady: true });
    expect(resolve('dental.rim.done', ready).enabled).toBe(true);
    expect(resolve('dental.rim.done', ready).disabledReason).toBeUndefined();
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
    expect(back.hint).toBe('Leave rim define mode without a rim. Step 1 keeps the notice that sent you here');
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
    for (const stage of ['type', 'aligner', 'area', 'review'] as const) {
      const elsewhere = at({ dentalStage: stage });
      for (const id of ['dental.rim.place', 'dental.rim.adjust', 'dental.rim.close', 'dental.rim.clear', 'dental.rim.done'] as const) {
        expect(resolve(id, elsewhere).visible, `${id} in ${stage}`).toBe(false);
      }
    }
  });
});
