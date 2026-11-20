import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SceneLegend, legendRows } from './SceneLegend';

const at = (over: Partial<Parameters<typeof legendRows>[0]>) =>
  legendRows({ stage: 'aligner', rimMode: false, areaPreview: false, tips: false, ...over });

describe('the scene legend lists only what the step draws', () => {
  it('Step 3 draws no area, no edge and no tip cones, so it has no legend', () => {
    expect(at({ stage: 'review', areaPreview: true, tips: true })).toEqual([]);
    expect(renderToStaticMarkup(<SceneLegend rows={[]} />)).toBe('');
  });

  it('Step 2 draws all three', () => {
    expect(at({ stage: 'area' })).toEqual(['area', 'rim', 'tip']);
  });

  it('Step 1 names the area only when its preview is out, and tips only when they are', () => {
    expect(at({})).toEqual([]);
    expect(at({ areaPreview: true })).toEqual(['area', 'rim']);
    expect(at({ areaPreview: true, tips: true })).toEqual(['area', 'rim', 'tip']);
  });

  it('rim define mode draws the rim in the edge colour, and nothing else', () => {
    expect(at({ rimMode: true, areaPreview: true, tips: true })).toEqual(['rim']);
  });

  it('draws each row with the swatch of its own token', () => {
    const html = renderToStaticMarkup(<SceneLegend rows={['rim', 'tip']} />);
    expect(html).toContain('scene-legend-swatch--rim');
    expect(html).toContain('scene-legend-swatch--support');
    expect(html).not.toContain('scene-legend-swatch--area');
  });
});
