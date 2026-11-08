import { describe, expect, it } from 'vitest';
import { EXPORT_REFUSED_CODE, exportRefusalText, storedExportRefusal, type ExportRefusalReason } from './exportRefusalText';

const REASONS: readonly ExportRefusalReason[] = ['stale', 'failed', 'inconclusive', 'replant'];

describe('why an export wrote nothing', () => {
  /*
   * THE RULE THIS GUARDS (W-05): a refusal is said on two screens and must say the SAME thing on
   * both. The status line reads `exportRefusalText` directly; the activity list reaches it through
   * `storedExportRefusal` from a row it stored earlier. A drift between the two is the "one thing,
   * two names" defect, and it would be invisible - each screen looks right on its own.
   */
  it('gives the activity list the same sentence the status line got', () => {
    for (const reason of REASONS) {
      const said = exportRefusalText(reason, 'upper.stl');
      const stored = storedExportRefusal({ code: EXPORT_REFUSED_CODE, vars: { reason, name: 'upper.stl' } });
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
   * A row that is NOT one of these four must fall through to the generic failure text rather than be
   * given a sentence this module invented. Three ways a row can fail that test, and all three return
   * undefined: another code, a reason this module does not know, and a reason that is not a string
   * at all (the vars come off a stored row, so the type is a promise rather than a guarantee).
   */
  it('declines any row that is not one of its four refusals', () => {
    expect(storedExportRefusal({ code: 'timeout', vars: { reason: 'stale' } })).toBeUndefined();
    expect(storedExportRefusal({ code: null })).toBeUndefined();
    expect(storedExportRefusal({ code: EXPORT_REFUSED_CODE, vars: { reason: 'invented' } })).toBeUndefined();
    expect(storedExportRefusal({ code: EXPORT_REFUSED_CODE, vars: { reason: 7 } })).toBeUndefined();
    expect(storedExportRefusal({ code: EXPORT_REFUSED_CODE })).toBeUndefined();
  });
});
