import { afterEach, describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { setLanguage } from '../i18n';
import { Catalogue } from './Catalogue';
import { ICON_CATALOGUE } from '../ui/iconCatalogue';

describe('the designer catalogue page', () => {
  afterEach(() => setLanguage('en'));

  it('renders every section without throwing', () => {
    const html = renderToStaticMarkup(<Catalogue />);
    for (const section of ['kit-icons-key', 'kit-icons-inline', 'kit-icons-free', 'kit-buttons', 'kit-fields', 'kit-dial', 'kit-status', 'kit-progress', 'kit-panels']) expect(html).toContain(`data-ui="${section}"`);
    // ONE CARD PER ICON, and it carries the path. The sheet exists to tell a designer which file to edit,
    // so a card that renders a drawing and no path is the sheet failing at its only job.
    for (const entry of ICON_CATALOGUE) {
      expect(html, entry.name).toContain(`data-ui="kit-icon-${entry.name}"`);
      expect(html, entry.name).toContain(`src/ui/assets/icons/${entry.name}.svg`);
    }
    expect(html.match(/icon-sheet-card/g)).toHaveLength(ICON_CATALOGUE.length);
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
