import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { PlatePanel } from './PlatePanel';

const render = (cases: number, locked = false) =>
  renderToStaticMarkup(<PlatePanel cases={cases} locked={locked} onArrange={() => {}} />);

describe('PlatePanel', () => {
  it('offers one button to lay the objects out, and counts them', () => {
    const html = render(3);
    expect(html).toContain('data-ui="plate-arrange"');
    expect(html).toContain('Arrange objects');
    expect(html).toContain('3 objects');
  });

  it('disables the button with nothing on the plate', () => {
    expect(render(0)).toContain('disabled');
    expect(render(1)).not.toContain('disabled');
    expect(render(1)).toContain('1 object');
  });

  /*
   * THE BUILD PLATE IS RETIRED HERE. Exports are per-object, so the slicer packs the real plate;
   * packing to a build volume this app does not own decided nothing. The printer picker and the plate
   * size existed only to feed that packer, and with no bounds nothing can fail to fit, so the
   * "does not fit" list went too. The seam - printerProfiles, printers.json, PlateOutline,
   * arrangeOnPlate in the core - is kept unwired and still tested.
   */
  it('names no printer and no plate size', () => {
    const html = render(2);
    for (const gone of ['plate-printer', 'plate-size', 'plate-unplaced', 'Build plate', 'Form 4']) {
      expect(html, gone).not.toContain(gone);
    }
  });

  it('goes inert when a mode owns the scene', () => {
    expect(render(2, true)).toContain('inert');
    expect(render(2, false)).not.toContain('inert');
  });
});
