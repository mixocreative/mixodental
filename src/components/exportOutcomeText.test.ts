import { describe, expect, it } from 'vitest';
import { EXPORT_PARTIAL_CODE, EXPORT_REFUSED_CODE, exportPartialText, exportRefusalText, storedExportOutcome, type ExportRefusalReason } from './exportOutcomeText';

const REASONS: readonly ExportRefusalReason[] = ['stale', 'failed', 'inconclusive', 'replant', 'nothing-built'];

describe('what an export wrote, or did not', () => {
  /*
   * THE RULE THIS GUARDS (W-05): a refusal is said on two screens and must say the SAME thing on
   * both. The status line reads `exportRefusalText` directly; the activity list reaches it through
   * `storedExportOutcome` from a row it stored earlier. A drift between the two is the "one thing,
   * two names" defect, and it would be invisible - each screen looks right on its own.
   */
  it('gives the activity list the same sentence the status line got', () => {
    for (const reason of REASONS) {
      const said = exportRefusalText(reason, 'upper.stl');
      const stored = storedExportOutcome({ code: EXPORT_REFUSED_CODE, vars: { reason, name: 'upper.stl' } });
      expect(stored).toEqual(said);
    }
  });

  /*
   * Every sentence must carry the three things an operator half-reading a status line still needs:
   * which model, that NOTHING was written, and what to do next. Asserted as a property over all
   * four rather than four copies of one expected string, so a fifth reason cannot be added without
   * meeting the same bar.
   */
  it('names the model, says nothing was written, and ends with the next step', () => {
    for (const reason of REASONS) {
      const { key } = exportRefusalText(reason, 'upper.stl');
      expect(key).toContain('{name}');
      expect(key).toMatch(/nothing was written|Nothing was written/);
      expect(key).toMatch(/export again|then export|use fewer supports/);
    }
  });

  it('fills the model name', () => {
    expect(exportRefusalText('replant', 'lower-arch.stl').vars).toEqual({ name: 'lower-arch.stl' });
  });


  /*
   * THE PARTIAL WRITE IS THE OPPOSITE EVENT, AND MUST NOT BORROW THE REFUSAL VOCABULARY (walk `r1`,
   * G1). Some files are on the operator's disk, so the one thing every refusal sentence promises -
   * that nothing was written - would be a lie. These two assertions are what that costs: the
   * sentence must never claim nothing was saved, and it must name both sides of the split.
   */
  it('says what landed and what did not, and never that nothing was saved', () => {
    const { key, vars } = exportPartialText(['upper.stl', 'lower.stl'], 'bite.stl');
    expect(key).toContain('{saved}');
    expect(key).toContain('{name}');
    expect(key).not.toMatch(/nothing was (saved|written)/i);
    expect(key).toMatch(/one at a time/);
    expect(vars).toEqual({ saved: 'upper.stl, lower.stl', name: 'bite.stl' });
  });

  it('gives the activity list the partial sentence the status line got', () => {
    const said = exportPartialText(['upper.stl'], 'lower.stl');
    expect(storedExportOutcome({ code: EXPORT_PARTIAL_CODE, vars: { saved: 'upper.stl', name: 'lower.stl' } })).toEqual(said);
  });

  /*
   * A row that is NOT one of these four must fall through to the generic failure text rather than be
   * given a sentence this module invented. Three ways a row can fail that test, and all three return
   * undefined: another code, a reason this module does not know, and a reason that is not a string
   * at all (the vars come off a stored row, so the type is a promise rather than a guarantee).
   */
  it('declines any row that is not one of its four refusals', () => {
    expect(storedExportOutcome({ code: 'timeout', vars: { reason: 'stale' } })).toBeUndefined();
    expect(storedExportOutcome({ code: null })).toBeUndefined();
    expect(storedExportOutcome({ code: EXPORT_REFUSED_CODE, vars: { reason: 'invented' } })).toBeUndefined();
    expect(storedExportOutcome({ code: EXPORT_REFUSED_CODE, vars: { reason: 7 } })).toBeUndefined();
    expect(storedExportOutcome({ code: EXPORT_REFUSED_CODE })).toBeUndefined();
  });
});
