import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SupportSettingsBlock, reviewNotes, type DentalReview } from './DentalReviewBlocks';
import { setLanguage } from '../i18n';
import { defaultSupportSettings } from '@mixo-geocore/host/core/supports/settings';

/*
 * Why this file exists rather than another case in `DentalBar.test.tsx`: Step 3 folds the settings
 * behind Adjust, and the fold is the panel's own state - so the markup `DentalBar` renders does not
 * contain these two switches at all (that test asserts their ABSENCE). The block is exported, so
 * the switches are checked where they are drawn.
 */
const review = {
  settings: defaultSupportSettings, onSetting: () => {},
  structure: { treeEnabled: true, bracesEnabled: true }, onStructure: () => {}, structureFixed: false,
  clickReach: { value: 1, onChange: () => {} },
  verdictPending: false, buildLanded: true, checked: true, rimGap: undefined, structureFallback: undefined, problems: [],
  outOfDate: false, rechecking: () => false, unitName: () => 'sample',
  onShow: () => {}, onFix: () => {}, onShowRim: () => {}, finishedCount: 0, backAsk: undefined,
  onBackConfirm: () => {}, onBackCancel: () => {},
} satisfies DentalReview;

const html = (over: Partial<DentalReview> = {}) =>
  renderToStaticMarkup(<SupportSettingsBlock review={{ ...review, ...over }} kind="aligner" onAdjust={() => {}} />);

describe('SupportSettingsBlock', () => {
  it('offers Tree and Brace as live switches on a detected area', () => {
    const live = html();
    for (const word of ['Tree branches', 'Cross-braces']) expect(live).toContain(word);
    expect(live).not.toContain('data-ui="aligner-structure-fixed"');
    expect(live).not.toMatch(/aligner-tree-branches[\s\S]*?<input[^>]*disabled/);
  });

  /*
   * THE RULE: a switch that cannot change anything is shown as a readout WITH ITS REASON.
   *
   * A painted or hand-drawn area is a `legacy` policy with nowhere to store a structure, so
   * `onDentalStructureChange` returns without dispatching. Left live, these two checkboxes were dead
   * controls - clicked, unchanged, unexplained. This test fails if either the `disabled` or the
   * sentence goes, because the pair is the behaviour: greyed out with no reason is its own defect.
   */
  it('shows Tree and Brace disabled, with the reason, on an area made by hand', () => {
    const fixed = html({ structureFixed: true });
    expect(fixed).toMatch(/aligner-tree-branches[\s\S]*?<input[^>]*disabled/);
    expect(fixed).toMatch(/aligner-cross-braces[\s\S]*?<input[^>]*disabled/);
    expect(fixed).toContain('data-ui="aligner-structure-fixed"');
    expect(fixed).toContain('This area was made by hand');
    // Still a readout of what the build will do, not a blank: the defaults it resolves to.
    expect(fixed).toMatch(/aligner-tree-branches[\s\S]*?<input[^>]*checked/);
  });
});

/*
 * THE RIM NOTE IS ONLY ON SCREEN WHEN A BUILD NEEDS A RIM LOOK, and the walk's builds did not (walk `l4`
 * passed on its quiet branch), so the 2026-11-21 wording was never drawn by a run. Checked here instead:
 * the sentence, both measured gaps rounded to 0.1 mm, and the Taiwan Chinese with the numbers in place.
 */
describe('reviewNotes - the rim gap', () => {
  it('says where the gaps are and what to do, with both measured gaps', () => {
    const notes = reviewNotes({ rimGap: { outerMm: 42.24, openingMm: 3.6 }, structureFallback: undefined }, 'aligner');
    expect(notes).toEqual([{ key: 'rim', text: 'The supports leave gaps along the rim: up to 42.2 mm on the outer edge and 3.6 mm at the opening. Look along the rim and add supports where a gap is too wide.' }]);
  });

  it('has its own line when the rim could not be measured, and none when the rim is fine', () => {
    expect(reviewNotes({ rimGap: 'unavailable', structureFallback: undefined }, 'aligner')[0]?.text).toMatch(/^Rim coverage could not be verified/);
    expect(reviewNotes({ rimGap: undefined, structureFallback: undefined }, 'aligner')).toEqual([]);
  });

  it('reads in Taiwan Chinese with the numbers in place', () => {
    setLanguage('zh-Hant');
    try {
      expect(reviewNotes({ rimGap: { outerMm: 42.24, openingMm: 3.6 }, structureFallback: undefined }, 'aligner')[0]?.text)
        .toBe('支撐沿著邊緣留有空隙：外緣最多 42.2 mm，中央開口最多 3.6 mm。請沿著邊緣檢查，並在空隙過寬處新增支撐。');
    } finally {
      setLanguage('en');
    }
  });
});
