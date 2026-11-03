import { afterEach, describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { setLanguage } from '../i18n';
import { Catalogue } from './Catalogue';

describe('the designer catalogue page', () => {
  afterEach(() => setLanguage('en'));

  it('renders every section without throwing', () => {
    const html = renderToStaticMarkup(<Catalogue />);
    for (const section of ['kit-buttons', 'kit-fields', 'kit-dial', 'kit-status', 'kit-progress', 'kit-panels']) expect(html).toContain(`data-ui="${section}"`);
    // Six dials, the staged bars, the status dots in every state.
    expect(html.match(/data-ui="tilt-dial"/g)).toHaveLength(6);
    expect(html.match(/data-ui="staged-progress"/g)).toHaveLength(5);
    for (const state of ['is-ready', 'is-look', 'is-fix', 'is-failed', 'is-building']) expect(html).toContain(`review-summary ${state}`);
  });

  it('renders in Japanese and Traditional Chinese too', () => {
    for (const lang of ['ja', 'zh-Hant'] as const) {
      setLanguage(lang);
      expect(() => renderToStaticMarkup(<Catalogue />)).not.toThrow();
    }
  });
});
