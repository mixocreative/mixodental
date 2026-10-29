import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { TiltDial } from './TiltDial';

describe('TiltDial', () => {
  const base = { min: -10, max: 10, step: 1, value: 2, label: 'Print angle', onChange: () => {} };

  it('is a slider whose value is the one given', () => {
    const html = renderToStaticMarkup(<TiltDial {...base} />);
    expect(html).toContain('role="slider"');
    expect(html).toContain('aria-valuenow="2"');
    expect(html).toContain('aria-valuemin="-10"');
    expect(html).toContain('aria-valuemax="10"');
    expect(html).toContain('class="tilt-dial-track"');
    expect(html).toContain('class="tilt-dial-knob"');
  });

  it('draws the stable band only when a band is given', () => {
    expect(renderToStaticMarkup(<TiltDial {...base} />)).not.toContain('tilt-dial-band');
    expect(renderToStaticMarkup(<TiltDial {...base} band={[-4, 4]} />)).toContain('class="tilt-dial-band"');
  });
});
