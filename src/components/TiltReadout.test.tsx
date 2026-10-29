import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { TiltReadout } from './TiltReadout';

describe('TiltReadout', () => {
  it('shows the angle with one decimal and a degree sign', () => {
    const html = renderToStaticMarkup(<TiltReadout deg={12.345} />);
    expect(html).toContain('tilt-readout-num">12.3<');
    expect(html).toContain('tilt-readout-deg">°<');
    expect(html).toContain('role="status"');
  });
});
