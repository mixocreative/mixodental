import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { LanguageSelect } from './LanguageSelect';

describe('LanguageSelect', () => {
  it('renders one dropdown with one option per language, and selects the active one', () => {
    const html = renderToStaticMarkup(<LanguageSelect lang="ja" onChange={() => {}} />);
    expect(html).toContain('<select');
    expect(html.match(/<option/g)).toHaveLength(3);
    expect(html).toMatch(/<option value="ja" lang="ja" selected=""/);
    expect(html).not.toMatch(/<option value="en"[^>]*selected/);
    expect(html).not.toMatch(/<option value="zh-Hant"[^>]*selected/);
  });
});
