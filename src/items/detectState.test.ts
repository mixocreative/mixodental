import { describe, expect, it } from 'vitest';
import { detectChip, detectSentence, detectStateOf, type DetectState, type OrientDoubt } from './detectState';
import type { DentalOrientation } from '@mixo-geocore/host/dental/dentalOrient';
import { translateMessage } from '../i18n';
import { ja } from '../locales/ja';
import { zhHant } from '../locales/zh-Hant';

/*
 * THE PROPOSAL IS NO LONGER A STUB, and it had to stop being one. It was `{} as never`, which was
 * enough while the state read two fields; the gate now reads the engine's up/down cross-check, and a
 * fixture with no diagnostics was not an engine answer at all - it was a shape that happened to
 * survive the old code.
 */
const oriented = (rotation: [number, number, number] | undefined): DentalOrientation => ({
  kind: 'oriented',
  proposal: { kind: 'proposal', rim: {}, diagnostics: { confidence: 1, floorOffsetRatio: 0.1, axialVarianceRatio: 0.1, crossCheck: 'agrees' } } as never,
  rotation, opening: 'present', meshOk: true, matchesProfile: true, arch: 'ring',
});
const say = (state: DetectState) => { const m = detectSentence(state); return m ? translateMessage(m) : undefined; };

describe('what a row shows about its own orientation', () => {
  it('tells "turned" from "already upright", because an inconsistent batch is worth seeing', () => {
    expect(detectStateOf(oriented([0, 180, 0]))).toEqual({ kind: 'oriented', turned: true });
    /*
     * AN IDENTITY POSE IS WHAT "ALREADY UPRIGHT" IS. This line used to pass `undefined`, which means
     * the engine could not decide at all - so the row that needed the operator most was the one
     * saying everything was fine. An absent pose is a doubt now (below).
     */
    expect(detectStateOf(oriented([0, 0, 0]))).toEqual({ kind: 'oriented', turned: false });
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
    check: { kind: 'check', doubts: ['pose'] },
    'no-rim': { kind: 'no-rim' },
    failed: { kind: 'failed' },
  };

  /*
   * AND EVERY DOUBT, for the same reason one step down. `check` carries five different sentences and
   * the record above can only hold one of them, so a doubt added without a sentence would ship with
   * no words and no translation. Keyed by `OrientDoubt`, so the compiler refuses a short list.
   */
  const EVERY_DOUBT: Record<OrientDoubt, DetectState> = {
    mesh: { kind: 'check', doubts: ['mesh'] },
    pose: { kind: 'check', doubts: ['pose'] },
    profile: { kind: 'check', doubts: ['profile'] },
    'up-down': { kind: 'check', doubts: ['up-down'] },
    opening: { kind: 'check', doubts: ['opening'] },
  };

  it('has a sentence for every state it can be in', () => {
    for (const [kind, state] of Object.entries(EVERY_KIND)) {
      expect(detectSentence(state), `${kind}: no sentence`).toBeDefined();
    }
    // Both `oriented` sentences, which the record can only carry one of.
    expect(say({ kind: 'oriented', turned: false })).toBe('Already upright.');
  });

  it('sends a mesh doubt to the mesh and every other doubt to the orientation', () => {
    // The chip's words are the instruction. "Check orientation" on an unusable mesh is the wrong one.
    expect(detectChip(EVERY_DOUBT.mesh)!.key).toBe('Check mesh');
    for (const [doubt, state] of Object.entries(EVERY_DOUBT)) {
      if (doubt !== 'mesh') expect(detectChip(state)!.key, doubt).toBe('Check orientation');
    }
  });

  /*
   * A TIMEOUT IS NOT A GENERIC FAILURE, and the operator's next move is not the same: Retry on a
   * model that ran past its deadline will run past it again. The batch used to throw the reason
   * away (`useBatchDetect`), so the two drew one line.
   */
  it('tells a job that ran out of time from one that failed outright', () => {
    expect(say({ kind: 'failed', because: 'timeout' })).toMatch(/took too long/);
    expect(say({ kind: 'failed', because: 'timeout' })).not.toBe(say({ kind: 'failed' }));
  });

  it('translates every sentence and chip it can produce, into both languages', () => {
    const states = [...Object.values(EVERY_KIND), ...Object.values(EVERY_DOUBT),
      { kind: 'oriented', turned: false } as DetectState, { kind: 'failed', because: 'timeout' } as DetectState];
    const keys = [
      ...states.map((state) => detectSentence(state)!.key),
      ...states.flatMap((state) => { const chip = detectChip(state); return chip ? [chip.key] : []; }),
    ];

    // Twelve distinct sentences: six states, five doubts inside one of them, and the timeout a
    // failure can carry. A shared sentence would hide one of them behind another.
    expect(new Set(states.map((state) => detectSentence(state)!.key)).size).toBe(12);
    for (const [lang, dictionary] of [['ja', ja], ['zh-Hant', zhHant]] as const) {
      expect(keys.filter((key) => !(key in dictionary)), `${lang}: missing`).toEqual([]);
      // Present is not translated: an entry equal to its key is the commonest way this ships undone.
      expect(keys.filter((key) => dictionary[key] === key), `${lang}: untranslated`).toEqual([]);
    }
  });
});
