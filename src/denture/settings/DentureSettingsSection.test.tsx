import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { DEFAULT_DENTURE_OPTIONS } from './dentureOptions';
import { DentureSettingsSection } from './DentureSettingsSection';

describe('DentureSettingsSection', () => {
  it('shows the three settings with their defaults and stable names', () => {
    const html = renderToStaticMarkup(<DentureSettingsSection options={DEFAULT_DENTURE_OPTIONS} onChange={() => {}} />);
    for (const name of ['denture-settings', 'denture-model-landing', 'denture-model-landing-select', 'denture-low-outside', 'denture-clearance-floor']) expect(html).toContain(`data-ui="${name}"`);
    expect(html).toContain('Supports may touch the denture');
    expect(html).toContain('<option value="off" selected="">');
    expect(html).toContain('checked=""');
    expect(html).toContain('Last-resort clearance');
  });

  it('shows a changed setting', () => {
    const html = renderToStaticMarkup(<DentureSettingsSection options={{ modelLanding: 'any', lowOutsideAllowed: false, lastResortClearanceMm: 0.8 }} onChange={() => {}} />);
    expect(html).toContain('<option value="any" selected="">');
    expect(html).not.toContain('checked=""');
    expect(html).toContain('0.8');
  });
});
