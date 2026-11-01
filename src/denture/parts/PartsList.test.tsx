import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import type { DenturePart } from '@mixo-geocore/host/dental/dentureParts';
import { PartsList } from './PartsList';

const part = (id: number, role: DenturePart['role'], volumeMm3: number, tips: number): DenturePart => ({ id, role, triangles: 10, volumeMm3, areaMm2: 1, tips });

describe('PartsList', () => {
  it('lists a multi-part file target first with roles, sizes and tips', () => {
    const html = renderToStaticMarkup(<PartsList parts={{ parts: [part(3, 'debris', 0.2, 0), part(1, 'addOn', 14, 4), part(0, 'target', 3400, 106)], faceParts: new Uint32Array() }} />);
    expect(html).toContain('data-ui="denture-parts"');
    expect(html).toContain('1 target, 1 add-on, 1 debris');
    expect(html.indexOf('data-role="target"')).toBeLessThan(html.indexOf('data-role="addOn"'));
    expect(html.indexOf('data-role="addOn"')).toBeLessThan(html.indexOf('data-role="debris"'));
    expect(html).toContain('106 tips');
    expect(html).toContain('3400 mm³');
    expect(html).toContain('no supports');
    expect(html).toContain('part-swatch--addOn');
  });

  it('renders nothing for a one-part file', () => {
    expect(renderToStaticMarkup(<PartsList parts={{ parts: [part(0, 'target', 1, 1)], faceParts: new Uint32Array() }} />)).toBe('');
    expect(renderToStaticMarkup(<PartsList parts={undefined} />)).toBe('');
  });
});
