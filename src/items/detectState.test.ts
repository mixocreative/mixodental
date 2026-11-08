import { describe, expect, it } from 'vitest';
import { detectSentence, detectStateOf, type DetectState } from './detectState';
import type { DentalOrientation } from '@mixo-geocore/host/dental/dentalOrient';
import { translateMessage } from '../i18n';
import { ja } from '../locales/ja';
import { zhHant } from '../locales/zh-Hant';

const oriented = (rotation: [number, number, number] | undefined): DentalOrientation => ({
  kind: 'oriented', proposal: {} as never, rotation, opening: 'present', meshOk: true, matchesProfile: true, arch: 'ring',
});
const say = (state: DetectState) => { const m = detectSentence(state); return m ? translateMessage(m) : undefined; };

describe('what a row shows about its own orientation', () => {
  it('tells "turned" from "already upright", because an inconsistent batch is worth seeing', () => {
    expect(detectStateOf(oriented([0, 180, 0]))).toEqual({ kind: 'oriented', turned: true });
    expect(detectStateOf(oriented(undefined))).toEqual({ kind: 'oriented', turned: false });
    expect(say({ kind: 'oriented', turned: true })).toBe('Turned upright.');
    expect(say({ kind: 'oriented', turned: false })).toBe('Already upright.');
  });

  /*
   * NO RIM IS NOT AN ERROR. It is the ordinary answer for a trimmed arch, and the flow's own response
   * is to hand over to rim drawing rather than to stop - so the row must not say something that reads
   * as a fault. An UNUSABLE mesh is a different thing, and the health verdict already covers it.
   */
  it('separates "no rim here" from "could not look at all"', () => {
    expect(detectStateOf({ kind: 'failed', reason: 'no-cavity', meshOk: true })).toEqual({ kind: 'no-rim' });
    expect(detectStateOf({ kind: 'failed', reason: 'bad-mesh', meshOk: false })).toEqual({ kind: 'failed' });
    expect(detectStateOf(undefined)).toEqual({ kind: 'failed' });
    expect(say({ kind: 'no-rim' })).toBe('No rim found. Draw one to continue.');
    expect(say({ kind: 'no-rim' })).not.toMatch(/error|failed|could not/i);
  });

  /*
   * A QUEUED ROW SAYS SO (gap register W-03). This used to assert the opposite - `waiting` returned
   * `undefined` - and the assertion was written from the state's name rather than from the screen:
   * a row the batch has not reached and a row the batch has never heard of drew the SAME blank. The
   * batch drains one row at a time, so on a case of eight the later rows sit here for minutes, and a
   * stalled job ahead of them holds them until the analysis worker's own per-job timeout fires.
   * Either way the operator was shown nothing and had nothing to wait for.
   */
  it('says a queued row is queued, rather than drawing the same blank as a row it has never heard of', () => {
    expect(say({ kind: 'waiting' })).toBe('Waiting its turn…');
    expect(say({ kind: 'running' })).toBe('Checking the orientation…');
    expect(say({ kind: 'waiting' })).not.toBe(say({ kind: 'running' }));
  });

  /*
   * EVERY KIND, ENFORCED BY THE COMPILER. This was a hand-written list of five states, and `waiting`
   * was not on it - so the one state whose sentence was missing was also the one the translation
   * check could not see. A `Record` keyed by `DetectState['kind']` cannot be short: adding a kind
   * without adding it here fails the build, which is cheaper and more certain than remembering.
   */
  const EVERY_KIND: Record<DetectState['kind'], DetectState> = {
    waiting: { kind: 'waiting' },
    running: { kind: 'running' },
    oriented: { kind: 'oriented', turned: true },
    'no-rim': { kind: 'no-rim' },
    failed: { kind: 'failed' },
  };

  it('has a sentence for every state it can be in', () => {
    for (const [kind, state] of Object.entries(EVERY_KIND)) {
      expect(detectSentence(state), `${kind}: no sentence`).toBeDefined();
    }
    // Both `oriented` sentences, which the record can only carry one of.
    expect(say({ kind: 'oriented', turned: false })).toBe('Already upright.');
  });

  it('translates every sentence it can produce, into both languages', () => {
    const keys = [...Object.values(EVERY_KIND), { kind: 'oriented', turned: false } as DetectState]
      .map((state) => detectSentence(state)!.key);

    // Six states, six distinct sentences: a shared sentence would hide one state behind another.
    expect(new Set(keys).size).toBe(6);
    for (const [lang, dictionary] of [['ja', ja], ['zh-Hant', zhHant]] as const) {
      expect(keys.filter((key) => !(key in dictionary)), `${lang}: missing`).toEqual([]);
      // Present is not translated: an entry equal to its key is the commonest way this ships undone.
      expect(keys.filter((key) => dictionary[key] === key), `${lang}: untranslated`).toEqual([]);
    }
  });
});
