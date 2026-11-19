/*
 * ONE JOB: HOLD A DRAG. Take the orbit away on press, hear the release wherever it happens, give
 * the orbit back exactly once however the drag ends.
 *
 * WHY THIS FILE EXISTS, and it is not tidiness. Four gestures in this app take the camera away and
 * hand it back, and before this module each had its own set of endings: the support tip heard
 * pointerup, pointercancel, blur and Escape; the rim anchor heard two of those; `babylon/rimDraw.ts`
 * heard the same two and no blur. An ending nobody wired is not a missing feature - it is a viewport
 * that silently stops turning, or a drag glued to a pointer with no button held - and the walk cannot
 * see either, because the thing being dragged still arrives where it was dropped. Two defects had
 * already grown in that gap: the tip drag's cleanup handed the orbit back on every pointer move, and
 * the rim drag's did the same, unnoticed for longer.
 *
 * WHAT IS DELIBERATELY NOT HERE. No drag state: what is being carried, where it is now and what to
 * draw stay with the caller, in React where the preview is rendered or in the closure of a Babylon
 * attach function. A module that took those would need most of a viewport handed in to give two
 * values back, which is the hub this repo's rule forbids. In: four callbacks and an optional move.
 * Out: one `end`.
 *
 * NOT THE BRUSHES, yet. Every brush ending COMMITS its stroke (`createStroke` has one `onEnd` and no
 * discard), so Escape through here would commit a stroke the operator asked to abandon. They join
 * when a stroke can be discarded, which is a change in `@mixo-geocore`. Agreed with Fable, 2026-11-19.
 */

export interface DragEndings {
  /** Take the orbit away: `controls.enabled = false` in three.js, `detachControl` in Babylon. */
  lock: () => void;
  /** Give it back. Called exactly once, however the drag ends - including an unmount mid-drag. */
  unlock: () => void;
  /** The button came up: commit whatever the drag was carrying. */
  release: () => void;
  /**
   * The drag was abandoned - pointercancel, the window losing focus, or Escape - and nothing is
   * committed.
   *
   * CANCEL ABANDONS, IT DOES NOT COMMIT, and that is a rule rather than a default. Escape arrives
   * here, and a cancel that committed would make Escape mean the opposite of what the key means
   * everywhere else. `pointercancel` and blur are not the operator's choice either: the browser or
   * the OS took the pointer, so the scene should look as it did and the history should hold nothing
   * they did not ask for. A release OFF the model is a different question, decided by the gesture's
   * own rules (`tipMove.ts` cancels, `rimTarget.ts` commits the last valid point) - not here.
   */
  cancel: () => void;
  /**
   * Every pointer move while the drag runs. Optional: the tip drag casts its own ray on each move,
   * the rim anchor is told where it is by the mesh it is being dragged over.
   */
  move?: (event: PointerEvent) => void;
}

/**
 * Where the drag listens. `window` in both viewports; a test passes its own, because this repo's
 * suite runs in node with no DOM and one module is no reason for a DOM to be installed.
 */
export interface DragTarget {
  addEventListener(type: string, listener: (event: Event) => void, options?: { capture?: boolean }): void;
  removeEventListener(type: string, listener: (event: Event) => void, options?: { capture?: boolean }): void;
}

/**
 * Starts a drag. Returns `end`: silent and idempotent - it gives the orbit back and removes the
 * listeners, and calls NEITHER `release` nor `cancel`, because an unmount is not an operator's
 * decision about what the drag meant. Call it from the caller's unmount path.
 */
export function beginDrag(endings: DragEndings, target: DragTarget = window): () => void {
  let live = true;

  const end = () => {
    if (!live) return;
    live = false;
    for (const [type, listener, capture] of listeners) target.removeEventListener(type, listener, { capture });
    // Before the callback, not after: a throwing `release` must not be able to leave the view unable
    // to turn. That failure outlives the gesture and looks like a broken app, not a failed drag.
    endings.unlock();
  };

  const finish = (decide: (it: DragEndings) => () => void) => () => {
    if (!live) return;
    end();
    decide(endings)();
  };

  const release = finish((it) => it.release);
  const cancel = finish((it) => it.cancel);

  /*
   * ESC CANCELS THE INNERMOST THING IN FLIGHT, and that takes the CAPTURE phase to arrange.
   *
   * `App.tsx` answers Escape on a window listener registered at mount: in Support Edit Mode it
   * clears the selection, in a dental step it steps back. This listener is added when the drag
   * begins, so on the bubble phase the app's would run FIRST, and cancelling a drag would also throw
   * away the selection the drag needs (a tip must be selected to be dragged at all) or leave the
   * step. A capture listener on `window` runs before every bubble listener on `window`.
   */
  const escape = (event: Event) => {
    if ((event as KeyboardEvent).key !== 'Escape') return;
    event.preventDefault();
    event.stopPropagation();
    cancel();
  };

  /*
   * KEYDOWN IS THE ONLY CAPTURE LISTENER, and the test asserts these flags rather than the browser's
   * dispatch, because the phases are the DOM's contract and not this module's behaviour.
   *
   * `pointerup` must stay in the BUBBLE phase. `babylon/rimDraw.ts` has a canvas `pointerup` handler
   * that returns early while a drag is running, and it runs before the window's bubble listener;
   * taken in capture, the drag would be cleared first and a finished anchor drag would also append or
   * close a rim point. (three.js reaches the same end by a different road - `rimTapAt` takes the
   * pointer's travel and refuses a tap - so this phase is load-bearing in one view and harmless in
   * the other, which is the kind of difference that makes a shared module worth having.)
   *
   * ONE DRAG, ONE POINTER'S WORTH OF EVENTS, and the events are not filtered by `pointerId`: a second
   * finger lifting would end the drag as a release. This app is driven by a mouse and a pen, where a
   * second pointer cannot arrive while a button is held; filtering is the fix if that ever changes.
   */
  const listeners: readonly [string, (event: Event) => void, boolean][] = [
    ['pointermove', (event) => void (live && endings.move?.(event as PointerEvent)), false],
    ['pointerup', release, false],
    ['pointercancel', cancel, false],
    ['blur', cancel, false],
    ['keydown', escape, true],
  ];

  endings.lock();
  for (const [type, listener, capture] of listeners) target.addEventListener(type, listener, { capture });
  return end;
}
