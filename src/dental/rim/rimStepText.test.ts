import { describe, expect, it } from 'vitest';
import { setLanguage, t } from '../../i18n';
import { rimCountText, rimDoneReason, rimProblemText, rimToolText } from './rimStepText';

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
    // Closed but crossing: the shape fault, not the engine.
    expect(rimDoneReason({ dentalRimClosed: true, dentalRimAnchors: 4, dentalRimProblem: 'SELF_INTERSECTING', dentalRimEngineReady: false }))
      .toBe(rimProblemText('SELF_INTERSECTING'));
  });

  /*
   * The honest refusal, and the reason this mode can be built before the engine can finish it: a drawn loop
   * becomes a rim only once the engine fits its frame and rasterises the opening's visibility mask. Done
   * must SAY that rather than go on with a rim that would quietly be wrong.
   */
  it('refuses a sound loop plainly while the engine cannot build a rim from one', () => {
    const sound = { dentalRimClosed: true, dentalRimAnchors: 8 };
    const refusal = rimDoneReason({ ...sound, dentalRimEngineReady: false });
    expect(refusal).toContain('cannot be used yet');
    // And it clears the moment the engine can: nothing else is in the way.
    expect(rimDoneReason({ ...sound, dentalRimEngineReady: true })).toBeUndefined();
  });

  it('tells the two tools apart in words', () => {
    expect(rimToolText('place')).not.toBe(rimToolText('adjust'));
    expect(rimToolText('place')).toMatch(/Click/);
    expect(rimToolText('adjust')).toMatch(/Drag/);
  });

  it('reads the count out, and says when the loop is joined', () => {
    expect(rimCountText(1, false)).toMatchObject({ key: '{n} point', n: 1 });
    expect(rimCountText(5, false)).toMatchObject({ n: 5 });
    expect(rimCountText(5, true).key).toContain('Loop closed');
  });

  it('has all of it in Taiwan Chinese and Japanese', () => {
    try {
      for (const lang of ['zh-Hant', 'ja'] as const) {
        setLanguage(lang);
        const keys = [
          rimProblemText('SELF_INTERSECTING'), rimProblemText('COLLINEAR'), rimProblemText('DEGENERATE_AREA'),
          rimToolText('place'), rimToolText('adjust'),
          rimDoneReason({ dentalRimClosed: true, dentalRimAnchors: 8, dentalRimEngineReady: false })!,
        ];
        for (const key of keys) expect(t(key), `${lang}: ${key}`).not.toBe(key);
      }
    } finally {
      setLanguage('en');
    }
  });
});
