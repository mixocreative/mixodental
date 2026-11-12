import { describe, expect, it } from 'vitest';
import type { SupportProblem } from '@mixo-geocore/host/core/analysis/supportCheck';
import { setLanguage } from '../i18n';
import { ja } from '../locales/ja';
import { zhHant } from '../locales/zh-Hant';
import { hasNoFix, problemText } from './problemText';

const KINDS: SupportProblem['kind'][] = ['island', 'overhang', 'unjudged', 'outside', 'omitted', 'buried'];
const row = (kind: SupportProblem['kind'], points = 2) =>
  ({ kind, area: 12, points: Array.from({ length: points }, () => [0, 0, 0] as [number, number, number]), unitId: 'u' });

describe('problemText', () => {
  it('gives every kind a sentence, and never leaves a placeholder in it', () => {
    setLanguage('en');
    for (const kind of KINDS) {
      const text = problemText(row(kind));
      expect(text, kind).toBeTruthy();
      expect(text, kind).not.toMatch(/\{\w+\}/);
    }
  });

  it('counts the points it stands for', () => {
    setLanguage('en');
    expect(problemText(row('buried', 1))).toContain('1 contact was left out');
    expect(problemText(row('buried', 7))).toContain('7 contacts were left out');
  });

  it('words the overlap finding apart from the build leaving a support out', () => {
    setLanguage('en');
    // `omitted` is the BUILD's doing and another setting might bring it back; `buried` is the
    // model's own shape. Wording them alike would send an operator into the settings for nothing.
    expect(problemText(row('buried'))).toContain('inside another mesh');
    expect(problemText(row('omitted'))).toContain('placement rule');
    expect(problemText(row('buried'))).not.toContain('placement rule');
  });

  it('a rule reason outranks the kind', () => {
    setLanguage('en');
    expect(problemText({ ...row('island'), rule: 'rim-low' })).toContain('accepted by the denture rules');
  });

  it('every sentence is translated in both languages', () => {
    // These keys reach the dictionaries through this module only, so no scanner of the JSX sees
    // them: assert them here. A missing one shows as the English sentence at runtime, which looks
    // deliberate and is not.
    for (const [name, dictionary] of [['ja', ja], ['zh-Hant', zhHant]] as const) {
      for (const kind of KINDS) {
        setLanguage('en');
        const english = problemText(row(kind));
        setLanguage(name);
        const translated = problemText(row(kind));
        expect(translated, `${name} is missing the ${kind} sentence`).not.toBe(english);
        expect(dictionary, `${name} dictionary`).toBeTruthy();
      }
    }
    setLanguage('en');
  });
});

describe('hasNoFix', () => {
  it('is true exactly for the findings nothing can fix', () => {
    expect(KINDS.filter(hasNoFix)).toEqual(['outside', 'buried']);
  });
});
