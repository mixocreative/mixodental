import { describe, expect, it } from 'vitest';
import { setLanguage, t } from '../../i18n';
import { rimBadgeText, rimDoneReason, rimLoopText, rimProblemText } from './rimStepText';

describe('rim define mode words', () => {
  /*
   * The three SHAPE faults are the ones an operator actually meets - a loop they drew that lies flat, is a
   * sliver, or crosses itself - so each has to say what to do about it, not only what is wrong.
   * `TOO_FEW_POINTS` is a backstop: `rimDoneReason` answers "not closed yet" before it could ever be
   * reached, and both `closePath` and the scene's own clone refuse a closed loop under three anchors. It
   * states the rule, which is all a sentence nobody should see needs to do.
   */
  it('tells the operator what to do about every shape fault they can meet', () => {
    for (const problem of ['COLLINEAR', 'DEGENERATE_AREA', 'SELF_INTERSECTING'] as const) {
      expect(rimProblemText(problem)).toMatch(/Place|Move/);
    }
    expect(rimProblemText('TOO_FEW_POINTS')).toBe('A rim needs at least three points.');
  });

  /*
   * The order is the point. A reader should be told the thing they can act on first - finish the loop, then
   * fix its shape - and only be told about the engine once there is nothing left for them to do. Reversing
   * that would greet a first point with a sentence about engine versions.
   */
  it('says what to do next, in the order the operator can act on it', () => {
    expect(rimDoneReason({ dentalRimAnchors: 0 })).toBe('Place at least three points, then close the loop.');
    expect(rimDoneReason({ dentalRimAnchors: 2 })).toBe('Place at least three points, then close the loop.');
    expect(rimDoneReason({ dentalRimAnchors: 3 })).toBe('Close the loop to finish the rim.');
    // Closed but crossing: the shape fault is the last thing in the way.
    expect(rimDoneReason({ dentalRimClosed: true, dentalRimAnchors: 4, dentalRimProblem: 'SELF_INTERSECTING' }))
      .toBe(rimProblemText('SELF_INTERSECTING'));
  });

  /*
   * A SOUND LOOP IS DONE, with nothing left in the way. This used to refuse every sound loop, because
   * no engine entry point could build a rim's visibility mask from arbitrary points - the mode shipped
   * before the thing that finishes it. Engine 61 added `dental_rim_from_points`, so the refusal and the
   * flag that carried it are gone rather than left permanently true.
   */
  it('lets a sound loop through, with nothing left to say', () => {
    expect(rimDoneReason({ dentalRimClosed: true, dentalRimAnchors: 8 })).toBeUndefined();
  });

  /*
   * ONE TOOL, SO ONE SENTENCE - and it has to be true of all three things a press can do. An open loop
   * is still being drawn, so it leads with adding points and names its own way to finish; a closed one
   * cannot be extended, so it does not offer. Both say that the LINE takes a point, which is the act
   * that has no other way to be discovered.
   */
  it('says what a press will do, and never offers what the path cannot take', () => {
    expect(rimBadgeText(true)).not.toBe(rimBadgeText(false));
    expect(rimBadgeText(true)).toMatch(/Drag a point/);
    expect(rimBadgeText(true)).not.toMatch(/close the loop/);
    expect(rimBadgeText(false)).toMatch(/close the loop/);
    for (const closed of [true, false]) expect(rimBadgeText(closed), String(closed)).toMatch(/line/);
  });

  /*
   * Two readouts, not one sentence. "Loop closed, 14 points" buried the two facts an operator checks most
   * often in a line of prose; they are read at a glance, over and over, and a sentence is the wrong shape.
   */
  it('reports the loop state as a value of its own', () => {
    expect(rimLoopText(true)).toBe('Closed');
    expect(rimLoopText(false)).toBe('Open');
  });

  it('has all of it in Taiwan Chinese and Japanese', () => {
    try {
      for (const lang of ['zh-Hant', 'ja'] as const) {
        setLanguage(lang);
        const keys = [
          rimProblemText('SELF_INTERSECTING'), rimProblemText('COLLINEAR'), rimProblemText('DEGENERATE_AREA'),
          rimBadgeText(true), rimBadgeText(false), rimLoopText(true), rimLoopText(false),
          rimDoneReason({ dentalRimAnchors: 0 })!, rimDoneReason({ dentalRimAnchors: 3 })!,
        ];
        for (const key of keys) expect(t(key), `${lang}: ${key}`).not.toBe(key);
      }
    } finally {
      setLanguage('en');
    }
  });
});
