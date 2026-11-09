import { describe, expect, it } from 'vitest';
import { DETECT_CONTEXT, detectFailureText, jobVocabulary } from './analysisJobVocabulary';
import { rebuiltJobError } from './jobErrors';
import type { AnalysisTask } from './analysisProtocol';

/** Every kind `AnalysisTask` has. Listed here so a kind added there fails this file, not just the map. */
const KINDS: readonly AnalysisTask['kind'][] = [
  'place', 'dental-place', 'dental-orient', 'dental-region', 'dental-retune-place',
  'dental-tilt-scan', 'dental-confirm-tilt', 'dental-risk', 'check',
];

describe('which vocabulary explains a failed analysis job', () => {
  /*
   * THE DEFECT THIS GUARDS (walk `r3`, G5): every dental analysis kind inherited the "support build"
   * sentences, so a failed orientation check on the deck told the operator to "generate again to
   * rebuild the supports" for a row with no supports. The rule is not "orient maps to detect" - it
   * is that NO analysis kind may fall through to the default, because falling through is what went
   * wrong and a map with a hole in it looks exactly like a map without one.
   */
  it('gives every analysis kind a vocabulary of its own', () => {
    for (const kind of KINDS) {
      expect(jobVocabulary(kind), kind).toBeDefined();
      expect(jobVocabulary(kind), kind).not.toBe('build');
    }
  });

  it('keeps the five shared contexts, and claims nothing for a context it does not know', () => {
    expect(jobVocabulary('export')).toBe('export');
    expect(jobVocabulary('import')).toBe('import');
    expect(jobVocabulary('build')).toBe('build');
    expect(jobVocabulary('something-new')).toBeUndefined();
    expect(jobVocabulary(null)).toBeUndefined();
    expect(jobVocabulary(undefined)).toBeUndefined();
  });

  it('sends the jobs that look at the model to the detection vocabulary, and the others to the shared one', () => {
    expect(jobVocabulary('dental-orient')).toBe(DETECT_CONTEXT);
    expect(jobVocabulary('dental-tilt-scan')).toBe(DETECT_CONTEXT);
    expect(jobVocabulary('dental-place')).toBe('place');
    expect(jobVocabulary('dental-risk')).toBe('check');
  });

  /*
   * The sentence must not borrow the support vocabulary, which is the whole finding, and it must end
   * with something the operator can do. Asserted as a property over all three codes rather than
   * three copies of an expected string, so a fourth cannot be added below the bar.
   */
  it('never explains a detection failure in terms of supports, and always ends with the next step', () => {
    /*
     * Fed through `rebuiltJobError`, which is the pipeline `failureText` uses: the activity list
     * stores a code and a message, and that function turns the pair back into a coded error. Handing
     * these sentences a raw `WorkerTaskError` instead tested a call the app never makes - and the
     * first version of this test did exactly that, and failed for it.
     */
    const errors: readonly unknown[] = [
      rebuiltJobError({ code: 'timeout', message: 'Support analysis timed out after 600000 ms' }),
      rebuiltJobError({ code: 'crashed', message: 'Support analysis crashed' }),
      rebuiltJobError({ code: null, message: 'something the app has never seen' }),
    ];
    for (const error of errors) {
      const { key } = detectFailureText(error);
      expect(key, key).not.toMatch(/support|generate|rebuild/i);
      expect(key, key).toMatch(/open it to run the check again/);
      expect(key, key).toMatch(/model is unchanged/);
    }
  });

  it('fills the raw message only into the sentence that asks for it', () => {
    expect(detectFailureText(rebuiltJobError({ code: null, message: 'bad mesh' })).vars).toEqual({ error: 'bad mesh' });
    expect(detectFailureText(rebuiltJobError({ code: 'timeout', message: 'x' })).vars).toBeUndefined();
  });
});
