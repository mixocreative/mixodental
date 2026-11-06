/*
 * HOW MANY KINDS OF WAITING THERE ARE, and what each one looks like. Pure: no React, no DOM, so the
 * rules below can be tested without a browser and a designer can read them without running the app.
 *
 * THREE, because there are exactly three things an operator can do while waiting:
 *
 *   1. `blocking` - nothing. The whole screen is held until this finishes.
 *   2. `step`     - watch. They can still turn the model; the step just cannot move on.
 *   3. `ledger`   - ignore. Work that runs behind them, with times and a way to cancel.
 *
 * The count is the point. Before this, one piece of work announced itself in up to FOUR places at
 * once - the dock note, the box on the scene, the job label and the worker stage - in three different
 * sentences needing three dictionary keys per language. Nothing said which surface owned what, so
 * each new job was told wherever somebody happened to need it.
 *
 * THE RULE THAT MAKES IT HOLD: one piece of work belongs to exactly one type. A job that blocks is
 * not also narrated in the ledger; a step job is not also a row. Where to say something is a decision
 * taken once, here, and not again at each call site.
 */

/** Which kind of waiting this is. */
export type ProgressType = 'blocking' | 'step' | 'ledger';

/** Every type, in the order a reader meets them (most demanding first). */
export const PROGRESS_TYPES: readonly ProgressType[] = ['blocking', 'step', 'ledger'];

/**
 * How a type is drawn. This is the whole of its look: change a row and every instance of that type
 * moves with it, which is the same bargain `tokens.css` makes for colour.
 */
export interface ProgressStyle {
  /** The colour token the indicator fills with. Named, never a literal - `docs/ui-styling.md` lists it. */
  readonly tone: string;
  /**
   * WHAT TO SHOW WHEN THERE IS NOTHING TO MEASURE. Work that reports a fraction always gets a bar,
   * because only a bar can show a measure. This is the other case: a `spinner` that turns and claims
   * nothing, or a `bar` that paces across without filling. Never a bar that sits at a number.
   */
  readonly waiting: 'spinner' | 'bar';
  /** `above`: label over the indicator, centred. `leading`: label first on one line, meta after it. */
  readonly labelPlacement: 'above' | 'leading';
  /** The label size. `large` is for the one an operator reads from across the room. */
  readonly size: 'large' | 'normal' | 'small';
  /** A veil over the rest of the screen, so nothing behind it looks clickable. */
  readonly veil: boolean;
  /** Where it sits on screen. Not read by any code; it is the answer to "where does this go". */
  readonly place: string;
}

/**
 * WHAT EVERY TYPE IS, BEFORE IT IS ANYTHING IN PARTICULAR. A quiet thing in ink, label above, that
 * spins when it cannot count. Each type below states only what it CHANGES, so the differences between
 * them are the whole of what a reader has to hold - and a new type starts from something sane.
 */
export const PROGRESS_BASE: Omit<ProgressStyle, 'place'> = {
  tone: '--ink', waiting: 'spinner', labelPlacement: 'above', size: 'normal', veil: false,
};

/**
 * What each type changes, and where it goes. Read with `PROGRESS_BASE` above.
 *
 * `blocking` is the only type that holds the screen, and so the only one with a veil and a large
 * label: a word read from across the room belongs to the one state where nothing else can be done.
 * `step` changes nothing but its place - it IS the quiet default. `ledger` reads along one line,
 * because it is a row in a list beside other rows, and paces rather than spins so that a column of
 * rows does not become a column of turning circles.
 */
const PROGRESS_DELTA: Readonly<Record<ProgressType, Partial<ProgressStyle> & Pick<ProgressStyle, 'place'>>> = {
  blocking: { size: 'large', veil: true,
    place: 'Centred in the middle of the view, over a veil that dims everything behind it. Nothing else is reachable while it shows.' },
  step: {
    place: 'Top left of the 3D view, under the step badge, over the scene. The model still turns behind it.' },
  ledger: { tone: '--red', waiting: 'bar', labelPlacement: 'leading', size: 'small',
    place: 'Bottom left of the 3D view, as one row of the background-work list. Carries the time, Cancel and failures.' },
};

/** Each type as it finally stands: the base, with that type's own changes over it. */
export const PROGRESS_STYLE: Readonly<Record<ProgressType, ProgressStyle>> = Object.freeze(
  Object.fromEntries(PROGRESS_TYPES.map((type) => [type, { ...PROGRESS_BASE, ...PROGRESS_DELTA[type] }])),
) as Readonly<Record<ProgressType, ProgressStyle>>;

/**
 * The percentage to show, or `undefined` for none.
 *
 * NOT A STYLE OPTION, and that is deliberate. A job that counts its own work reports a real fraction
 * and gets a real number; a job that is one call into the core reports a start and an end, and that
 * one gets no number at all. The app never shows a percentage it had to invent - a bar that sits at
 * 40 percent while the work is already done, or still running, teaches a reader to stop believing the
 * next one. Making this a per-type toggle would let somebody switch a number on for a job that cannot
 * count, which is the one mistake this rule exists to prevent.
 */
export function progressMeasure(fraction: number | undefined): number | undefined {
  if (typeof fraction !== 'number' || !Number.isFinite(fraction)) return undefined;
  return Math.max(0, Math.min(100, Math.round(fraction * 100)));
}

/**
 * THE SHAPE FOLLOWS THE MEASURE, not the type. With a fraction it is a bar, because only a bar can
 * show one. With none it is whatever that type chose to wait as - a spinner by default, which claims
 * nothing at all. So no type can draw a bar that looks like a measure it does not have.
 */
export const progressShape = (type: ProgressType, fraction: number | undefined): 'bar' | 'spinner' =>
  (progressMeasure(fraction) === undefined ? PROGRESS_STYLE[type].waiting : 'bar');

/** Whether the indicator fills to a measure, or only says that work is happening. */
export const progressFill = (fraction: number | undefined): 'measured' | 'pacing' =>
  (progressMeasure(fraction) === undefined ? 'pacing' : 'measured');

/*
 * OVERRIDING, AND THE ONE KIND THAT IS REFUSED.
 *
 * COLOUR AND SIZE CASCADE. They reach CSS as custom properties on the type class, so any ancestor can
 * set `--progress-tone` or `--progress-label-size` and the instances inside it follow - a designer
 * changes one in context without editing this file, exactly the way a theme overrides `tokens.css`.
 *
 * STRUCTURE DOES NOT. Whether the label sits above or leads, whether a veil covers the screen, and
 * whether waiting spins or paces are not values that cascade: they are different markup, and "this
 * one blocks" is a statement about what the operator can do, not about how it looks.
 *
 * AND NO CALL SITE OVERRIDES A TYPE. That is the hole this module was built to close. Three surfaces
 * drifted apart precisely because each site styled its own waiting, and handing back a per-instance
 * override would re-open it one call at a time. A site chooses its TYPE; the type decides the rest.
 */

/** The class names one instance wears, so the component holds no styling decisions of its own. */
export function progressClasses(type: ProgressType, fraction: number | undefined): {
  readonly root: string; readonly indicator: string;
} {
  const style = PROGRESS_STYLE[type];
  return {
    root: `progress progress--${type} progress--label-${style.labelPlacement} progress--${style.size}`,
    indicator: `progress-indicator progress-indicator--${progressShape(type, fraction)} is-${progressFill(fraction)}`,
  };
}
