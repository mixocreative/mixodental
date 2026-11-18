import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SupportSettingsBlock, type DentalReview } from './DentalReviewBlocks';
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
  verdictPending: false, buildLanded: true, rimGap: undefined, structureFallback: undefined, problems: [],
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
