import { describe, expect, it } from 'vitest';
import { setLanguage, t } from '../../i18n';
import { rimBadgeText, rimDoneReason, rimLoopText, rimProblemText , rimNowText } from './rimStepText';

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

describe('the badge says what to do now, not just how the tool works', () => {
  /*
   * The owner, using it on 2026-11-17: "it is unclear when to close loop, or not, if not how to
   * accept and done". Both facts were already computed and neither was on screen - the blocker lived
   * on a disabled button's hover tip, which is nowhere.
   */
  it('names the blocker while the loop is open, instead of the tool grammar', () => {
    expect(rimNowText({ dentalRimAnchors: 0 })).toBe('Place at least three points, then close the loop.');
    expect(rimNowText({ dentalRimAnchors: 2 })).toBe('Place at least three points, then close the loop.');
    expect(rimNowText({ dentalRimAnchors: 4 })).toBe('Close the loop to finish the rim.');
  });

  it('names the fault when the loop is closed but will not build', () => {
    expect(rimNowText({ dentalRimClosed: true, dentalRimAnchors: 5, dentalRimProblem: 'SELF_INTERSECTING' }))
      .toBe('This loop crosses itself, so it has no inside. Move the points that cross.');
  });

  it('tells the operator how to ACCEPT once nothing is in the way', () => {
    const ready = rimNowText({ dentalRimClosed: true, dentalRimAnchors: 6 });
    expect(ready).toContain('Done');
    // And it still carries the grammar, which is the other half of what a first-timer needs.
    expect(ready).toContain('Drag a point');
  });

  it('never returns an empty line: there is always a next thing to do', () => {
    for (const state of [{}, { dentalRimAnchors: 3 }, { dentalRimClosed: true, dentalRimAnchors: 3 }]) {
      expect(rimNowText(state).trim().length).toBeGreaterThan(0);
    }
  });
});
