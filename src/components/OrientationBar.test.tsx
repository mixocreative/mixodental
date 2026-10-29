import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { OrientationBar } from './OrientationBar';
import type { UiState } from '@mixo-geocore/editing/commands';

describe('OrientationBar', () => {
  it('lists Auto orientation, then Back and Next as the last row, and no Exit', () => {
    const ui = { mode: 'dental', dentalStage: 'aligner', dentalAlignerReady: true, dentalProposed: true } as UiState;
    const html = renderToStaticMarkup(<OrientationBar notices={[]} profile="reference-aligner" lang="en" ui={ui} send={() => {}} run={() => {}} />);
    const order = ['Auto orientation', 'Back', 'Next'].map((word) => html.indexOf(word));
    expect(order.every((at) => at >= 0)).toBe(true);
    expect(order[0]).toBeLessThan(order[1]!);
    expect(order[1]).toBeLessThan(order[2]!);
    expect(html).toContain('orient-nav');
    // Auto orientation is the primary red button with its icon.
    expect(html).toMatch(/<button class="primary orient-auto"[^>]*>Auto orientation<svg/);
    expect(html).not.toContain('Exit');
    expect(html).not.toContain('Detector confidence');
  });
});
