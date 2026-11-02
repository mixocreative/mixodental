import { describe, expect, it } from 'vitest';
import { STEP_PANEL_INSET_PX, stepPanelInset } from './stepPanelInset';

const review = { mode: 'dental', dentalStage: 'review' };

describe('stepPanelInset', () => {
  it('the panel docks right from 721 px up, tablet-wide windows included', () => {
    expect(stepPanelInset(review, 900)).toBe(STEP_PANEL_INSET_PX);
    expect(stepPanelInset(review, 1280)).toBe(STEP_PANEL_INSET_PX);
    expect(stepPanelInset(review, 721)).toBe(STEP_PANEL_INSET_PX);
  });
  it('a phone-width window stacks the panel at the bottom: no inset', () => {
    expect(stepPanelInset(review, 720)).toBe(0);
  });
  it('other steps have no panel on the right', () => {
    expect(stepPanelInset({ mode: 'dental', dentalStage: 'aligner' }, 1280)).toBe(0);
    expect(stepPanelInset({ mode: 'off' }, 1280)).toBe(0);
  });
});
