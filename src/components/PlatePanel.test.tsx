import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { PlatePanel } from './PlatePanel';
import { printerById, PRINTERS } from '../plate/printerProfiles';
import { LandingMark, UnresolvedBubble } from './viewport/UnresolvedBubbles';

const noop = () => {};

describe('PlatePanel', () => {
  it('lists every printer, shows the plate size and the Arrange plate action, with stable names', () => {
    const html = renderToStaticMarkup(<PlatePanel printer={printerById(undefined)} unplaced={[]} cases={2} locked={false} onPrinter={noop} onArrange={noop} onSelect={noop} />);
    for (const name of ['plate-panel', 'plate-printer-select', 'plate-size', 'plate-arrange']) expect(html).toContain(`data-ui="${name}"`);
    expect(html.match(/<option /g)?.length).toBe(PRINTERS.printers.length);
    expect(html).toContain('211.68 × 118.37 mm');
    expect(html).toContain('Arrange plate');
    expect(html).not.toContain('plate-unplaced');
  });

  it('names the cases that do not fit, each one selectable; Arrange is off with an empty plate', () => {
    const html = renderToStaticMarkup(<PlatePanel printer={printerById(undefined)} unplaced={[{ id: 'u1', name: 'Upper' }]} cases={0} locked={false} onPrinter={noop} onArrange={noop} onSelect={noop} />);
    expect(html).toContain('data-ui="plate-unplaced"');
    expect(html).toContain('1 case does not fit on the plate.');
    expect(html).toContain('data-ui="plate-unplaced-item"');
    expect(html).toContain('>Upper</button>');
    expect(html).toMatch(/data-ui="plate-arrange" disabled=""/);
  });
});

describe('unresolved-point marks', () => {
  it('a bubble carries the warning sign, its kind and the plain-language reason', () => {
    const html = renderToStaticMarkup(<UnresolvedBubble point={{ id: 'denture-low-1', kind: 'lowest', stream: 'low', position: [0, 16, 0], normal: [0, -1, 0], heightMm: 16, reason: 'x', bestGapMm: 0.8, neededMm: 1 }} />);
    expect(html).toContain('data-ui="unresolved-bubble"');
    expect(html).toContain('data-kind="lowest"');
    expect(html).toContain('<svg');
    expect(html).toContain('title="Lowest point 16 mm up: no route from the plate, best gap 0.8 mm (1.0 needed)."');
  });

  it('a resolved mark is coloured by its landing tier (CSS reads data-tier)', () => {
    const html = renderToStaticMarkup(<LandingMark landed={{ id: 'a', tier: 'no-support', position: [0, 0, 0] }} />);
    expect(html).toContain('data-ui="landing-mark"');
    expect(html).toContain('data-tier="no-support"');
    expect(html).toContain('in a no-support zone');
  });
});
