import { describe, expect, it } from 'vitest';
import { detectSentence, detectStateOf, stillToDetect, type DetectState } from './detectState';
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

  it('says nothing for a row nothing has happened to yet', () => {
    expect(say({ kind: 'waiting' })).toBeUndefined();
    expect(say({ kind: 'running' })).toBe('Checking the orientation…');
  });

  it('counts the rows still to be looked at, which is the deck’s own progress', () => {
    const states: DetectState[] = [
      { kind: 'waiting' }, { kind: 'running' }, { kind: 'oriented', turned: true }, { kind: 'no-rim' }, { kind: 'failed' },
    ];
    expect(stillToDetect(states)).toBe(2);
    expect(stillToDetect([])).toBe(0);
    // A finished batch counts zero, however its rows turned out.
    expect(stillToDetect(states.slice(2))).toBe(0);
  });

  it('translates every sentence it can produce, into both languages', () => {
    const keys = ([
      { kind: 'running' }, { kind: 'oriented', turned: true }, { kind: 'oriented', turned: false },
      { kind: 'no-rim' }, { kind: 'failed' },
    ] as DetectState[]).map((state) => detectSentence(state)!.key);

    expect(new Set(keys).size).toBe(5);
    for (const [lang, dictionary] of [['ja', ja], ['zh-Hant', zhHant]] as const) {
      expect(keys.filter((key) => !(key in dictionary)), `${lang}: missing`).toEqual([]);
      // Present is not translated: an entry equal to its key is the commonest way this ships undone.
      expect(keys.filter((key) => dictionary[key] === key), `${lang}: untranslated`).toEqual([]);
    }
  });
});
