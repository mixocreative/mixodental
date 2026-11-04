import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { DentureChoice } from './DentureChoice';

describe('DentureChoice', () => {
  it('is one named start button', () => {
    const html = renderToStaticMarkup(<DentureChoice onChoose={() => {}} />);
    expect(html).toContain('data-ui="start-denture"');
    expect(html).toContain('Denture');
    expect(html).toContain('choice-key');
  });
});
