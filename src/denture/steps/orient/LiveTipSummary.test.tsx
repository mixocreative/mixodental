import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { LiveTipSummary } from './LiveTipSummary';

describe('LiveTipSummary', () => {
  it('lists the tips per path state with named swatches', () => {
    const html = renderToStaticMarkup(<LiveTipSummary counts={{ path: 90, fallback: 5, none: 2, unknown: 0 }} />);
    expect(html).toContain('data-ui="denture-live-tips"');
    expect(html).toContain('90 with a path');
    expect(html).toContain('tip-swatch--none');
    expect(html).toContain('data-ui="denture-live-tips-fallback"');
  });

  it('says it is checking while no answer has come', () => {
    expect(renderToStaticMarkup(<LiveTipSummary counts={undefined} />)).toContain('Checking support paths');
  });
});
