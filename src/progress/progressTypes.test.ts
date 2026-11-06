import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PROGRESS_BASE, PROGRESS_STYLE, PROGRESS_TYPES, progressClasses, progressFill, progressMeasure, progressShape } from './progressTypes';

/*
 * The three kinds of waiting, and the two rules that keep them honest: a percentage is never invented,
 * and the table in `progressTypes.ts` is the one source of a type's look.
 */

const CSS = new TextDecoder().decode(readFileSync('src/styles.css'));

describe('the waiting types', () => {
  it('has three, because there are three things an operator can do while waiting', () => {
    expect(PROGRESS_TYPES).toEqual(['blocking', 'step', 'ledger']);
    for (const type of PROGRESS_TYPES) expect(PROGRESS_STYLE[type], type).toBeTruthy();
  });

  /*
   * THE TABLE IS NOT DECORATION. Its `tone` names a token, and the stylesheet has to declare that very
   * token for that type - otherwise the entry a designer reads and the colour the app draws are two
   * different things, and the table becomes a value written and never read.
   */
  it('declares each type tone in the stylesheet, with the token the table names', () => {
    for (const type of PROGRESS_TYPES) {
      const token = PROGRESS_STYLE[type].tone;
      const rule = new RegExp(`\\.progress--${type}\\s*\\{[^}]*--progress-tone:\\s*var\\(${token}\\)`);
      expect(rule.test(CSS), `${type} should declare --progress-tone: var(${token})`).toBe(true);
    }
  });

  it('tells a designer where every type goes', () => {
    for (const type of PROGRESS_TYPES) expect(PROGRESS_STYLE[type].place.length, type).toBeGreaterThan(20);
  });

  /** Only one type may hold the screen, and only that one may wear the large label. */
  it('keeps the veil and the large label for the one type nothing can be done during', () => {
    expect(PROGRESS_STYLE.blocking).toMatchObject({ veil: true, size: 'large' });
    expect(PROGRESS_STYLE.step.veil).toBe(false);
    expect(PROGRESS_STYLE.ledger.veil).toBe(false);
    expect(PROGRESS_STYLE.step.size).not.toBe('large');
    expect(PROGRESS_STYLE.ledger.size).not.toBe('large');
  });
});

describe('a type inherits, then changes only what differs', () => {
  it('starts every type from the base', () => {
    for (const type of PROGRESS_TYPES) {
      const style = PROGRESS_STYLE[type];
      for (const key of Object.keys(PROGRESS_BASE) as (keyof typeof PROGRESS_BASE)[]) {
        expect(style[key], `${type}.${key}`).toBeDefined();
      }
    }
  });

  /** `step` is the quiet default: it changes nothing but where it goes, which is what makes it the base. */
  it('leaves the step type as the base, so the base is a real thing and not an average', () => {
    const { place, ...look } = PROGRESS_STYLE.step;
    expect(place.length).toBeGreaterThan(20);
    expect(look).toEqual(PROGRESS_BASE);
  });

  it('changes only what it says it changes', () => {
    expect(PROGRESS_STYLE.blocking).toMatchObject({ ...PROGRESS_BASE, size: 'large', veil: true });
    expect(PROGRESS_STYLE.ledger).toMatchObject({ ...PROGRESS_BASE, tone: '--red', waiting: 'bar', labelPlacement: 'leading', size: 'small' });
  });

  it('cannot be changed from outside: the table is frozen', () => {
    expect(Object.isFrozen(PROGRESS_STYLE)).toBe(true);
  });
});

describe('the shape follows the measure, not the type', () => {
  /*
   * With a fraction every type draws a bar, because only a bar can show a measure. Without one it
   * draws whatever that type chose to WAIT as - so no type can draw a bar that looks like a measure
   * it does not have.
   */
  it('is always a bar when there is something to measure', () => {
    for (const type of PROGRESS_TYPES) expect(progressShape(type, 0.5), type).toBe('bar');
  });

  it('spins when it cannot count, unless the type asked to pace instead', () => {
    expect(progressShape('blocking', undefined)).toBe('spinner');
    expect(progressShape('step', undefined)).toBe('spinner');
    // A column of rows should not become a column of turning circles.
    expect(progressShape('ledger', undefined)).toBe('bar');
  });

  it('puts the shape on the indicator class, so the stylesheet needs no rule of its own', () => {
    expect(progressClasses('step', undefined).indicator).toContain('progress-indicator--spinner');
    expect(progressClasses('step', 0.5).indicator).toContain('progress-indicator--bar');
    expect(progressClasses('ledger', undefined).indicator).toContain('progress-indicator--bar');
  });
});

describe('a percentage is never invented', () => {
  it('shows one only when the job reports a real fraction', () => {
    expect(progressMeasure(0.37)).toBe(37);
    expect(progressMeasure(0)).toBe(0);
    expect(progressMeasure(1)).toBe(100);
    expect(progressMeasure(undefined)).toBeUndefined();
    expect(progressMeasure(Number.NaN)).toBeUndefined();
    expect(progressMeasure(Number.POSITIVE_INFINITY)).toBeUndefined();
  });

  it('clamps a fraction that came back outside its range rather than drawing past the end', () => {
    expect(progressMeasure(-0.5)).toBe(0);
    expect(progressMeasure(1.4)).toBe(100);
  });

  /*
   * And the SHAPE follows the measure. A bar that fills says how far along the work is; with no
   * fraction it paces instead, which says only that work is happening. Letting a type choose to fill
   * without a measure is the one mistake this rule exists to prevent.
   */
  it('paces instead of filling when there is nothing to measure', () => {
    expect(progressFill(0.4)).toBe('measured');
    expect(progressFill(undefined)).toBe('pacing');
    expect(progressClasses('step', undefined).indicator).toContain('is-pacing');
    expect(progressClasses('step', 0.4).indicator).toContain('is-measured');
  });
});

describe('the classes one instance wears', () => {
  it('carries the type, the label placement and the size, and nothing else', () => {
    const { root } = progressClasses('blocking', 0.5);
    expect(root).toContain('progress--blocking');
    expect(root).toContain('progress--label-above');
    expect(root).toContain('progress--large');
  });

  it('gives the ledger its own label placement, because a row reads along one line', () => {
    expect(PROGRESS_STYLE.ledger.labelPlacement).toBe('leading');
    expect(progressClasses('ledger', 0.5).root).toContain('progress--label-leading');
  });
});
