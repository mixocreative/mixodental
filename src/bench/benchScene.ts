/*
 * THE BENCH: the app with no mode in hand.
 *
 * It had no name. In code it is `mode: 'off'`, which says what it is NOT; in
 * docs/design/ui-structure.md it was "No mode (setup)", which says when you are first there and not
 * that you come back. So the one scene an operator sees most could only be referred to by negation,
 * and the question "what is the screen after the last step called?" had no answer.
 *
 * It is called the bench, after the surface a technician's work sits on. Every other state in this
 * app is something you are DOING - Support Edit Mode, no-support zones, a dental step. The bench is
 * where the work rests while you are doing none of them, and it is one place reached three ways:
 *
 *   1. On opening, with a model imported and nothing started. (The old "setup".)
 *   2. Out of a mode: Exit, Done, Escape - `exit` and `leave`.
 *   3. OFF THE END OF THE LAST STEP. OK in dental Step 3 (`finishDental`) finishes the aligner and
 *      lands here. There is no Step 4, and this is the fact the name exists to make sayable.
 *
 * A fourth, not an arrival anyone asks for: the active object going away (delete, undo) ends the
 * mode that belonged to it and drops you here.
 *
 * Pure - no React, no DOM - so the three properties below can be tested without a browser.
 */

import type { EditMode } from '@mixo-geocore/editing/types';
import type { Panel, PanelSection } from '@mixo-geocore/editing/locks';

/** The session mode the bench IS. Nothing else in the app may claim this value. */
export const BENCH_MODE: EditMode = 'off';

/** Whether the app is resting on the bench. The positive form of `mode === 'off'`. */
export const onBench = (state: { readonly mode: EditMode }): boolean => state.mode === BENCH_MODE;

/**
 * THE THREE THINGS THAT MAKE IT THE BENCH, each already true in the code and none of them written
 * down anywhere until now. They are what a reader needs to predict the scene without running it,
 * and `benchScene.test.ts` holds the app to all three.
 *
 *   NOTHING IS LOCKED.    `sectionLocked(section, 'off')` is false for every section and
 *                         `lockNote` is undefined for both panels. The bench is the only state in
 *                         which no region is dimmed and inert - every control on screen works.
 *   THE CANVAS IS QUIET.  `gesture()` is `{ kind: 'none' }`: a press orbits, a drag orbits, and
 *                         nothing is painted, added or picked. No tool is in hand because no mode is.
 *   EVERY WAY OUT ENDS HERE. There is no mode you can leave that leaves you in another mode.
 *
 * The first two are why it reads as a resting state rather than a mode that happens to be blank.
 */
export const BENCH_PROPERTIES = ['nothing-locked', 'quiet-canvas', 'every-exit-lands-here'] as const;

/** One of the bench's three defining properties. */
export type BenchProperty = (typeof BENCH_PROPERTIES)[number];

/** A region of the app shell, and what the bench puts in it. */
export interface BenchRegionSpec {
  /** The region's name in the shell. `left` and `right` are the two `Panel`s; the rest are the frame. */
  readonly region: 'header' | Panel | 'viewport' | 'footer';
  /** Where it sits. Not read by any code; it is the answer to "where on screen is this". */
  readonly place: string;
  /** What the bench puts there, in an operator's words. */
  readonly holds: string;
  /** The panel sections live here, all of them unlocked (see `BENCH_PROPERTIES`). Empty for the frame regions. */
  readonly sections: readonly PanelSection[];
}

/**
 * The bench, region by region (docs/design/ui-styling.md, and the wireframe in
 * docs/design/ui-structure.md 2.3). This is the whole scene: there is no overlay, badge, veil or bar
 * that belongs to the bench alone.
 */
export const BENCH_REGIONS: readonly BenchRegionSpec[] = [
  { region: 'header', place: 'Across the top, 56 px.', sections: [],
    holds: 'Wordmark, the language switch, Undo and Redo, and the model view toggles. The same header every state has.' },
  { region: 'left', place: 'Left panel, 268 px wide.', sections: ['import', 'objects', 'transform', 'supports', 'check'],
    holds: 'Import, the object list, Transform, the supports actions with Regenerate as the one primary, the two mode buttons, and Check.' },
  { region: 'viewport', place: 'The middle, the whole height between header and footer.', sections: [],
    holds: 'The plate with the models on it. The ACTIVE OBJECT NAME sits top left, where a mode would put its step badge, and the view toggles take the top-right corner.' },
  { region: 'right', place: 'Right panel, 300 px wide.', sections: ['settings', 'export'],
    holds: 'The support settings for the active object, and Export STL.' },
  { region: 'footer', place: 'Across the bottom, 32 px.', sections: [],
    holds: 'Object count, the active object’s triangles, the contact counts, and the status line.' },
];

/** One way of arriving at the bench: the event that lands you there and what it means. */
export interface BenchArrival {
  /** The session event, as `reduceSession` names it. */
  readonly event: 'start' | 'exit' | 'leave' | 'finishDental' | 'activeUnitChanged';
  /** What the operator did. */
  readonly from: string;
}

/**
 * HOW YOU GET HERE. `start` is not an event - it is the state the session is constructed in, and it
 * is listed because "the app opens on the bench" is part of what the name means.
 */
export const BENCH_ARRIVALS: readonly BenchArrival[] = [
  { event: 'start', from: 'Opening the app, or importing a model with nothing started.' },
  { event: 'exit', from: 'Exit or Escape out of Support Edit Mode, no-support zones, or a dental step.' },
  { event: 'leave', from: 'Done out of a mode that finished its own work.' },
  { event: 'finishDental', from: 'OK in dental Step 3. The aligner is finished and keeps its supports. There is no step after this one.' },
  { event: 'activeUnitChanged', from: 'The active object going away - deleted, or undone - which ends the mode that belonged to it.' },
];
