import type { Gesture } from '@mixo-geocore/editing/gesture';
import { tokenCss } from '../../ui/tokenColour';
import cursorRimFile from '../../ui/assets/icons/cursor-rim.svg?raw';

/** Opacity of the no-support zone layer in zones mode (`full`) and in Support Edit Mode (`faint`). */
export const ZONE_OPACITY = { full: 0.7, faint: 0.3 } as const;
/** Opacity of a support body previewed (not yet selected) in red. */
export const SEE_THROUGH = 0.45;
/** Brush cursor over the active object: a brush icon (tip at the hot spot), crosshair where unsupported. Colours come from the cursor and mark tokens. */
const brushCursor = (tip: string) => `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${tokenCss('--cursor-outline')}" stroke-width="1.6" stroke-linejoin="round"><path d="M20.5 3.5 11 13l-1.9-1.9 9.5-9.5z" fill="${tokenCss('--cursor-fill')}"/><path d="M9.1 11.1 11 13c0 3-2.4 5.6-7.5 7.5 0-4.6 1.8-8.6 5.6-9.4z" fill="${tip}"/></svg>`)}") 3 21, crosshair`;
/** The brush icon with a grey tip and a "−" beside it: Unselect, told apart from Select by shape as well as colour. */
const unselectCursor = () => `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="24" viewBox="0 0 32 24" fill="none" stroke="${tokenCss('--cursor-outline')}" stroke-width="1.6" stroke-linejoin="round"><path d="M20.5 3.5 11 13l-1.9-1.9 9.5-9.5z" fill="${tokenCss('--cursor-fill')}"/><path d="M9.1 11.1 11 13c0 3-2.4 5.6-7.5 7.5 0-4.6 1.8-8.6 5.6-9.4z" fill="${tokenCss('--mark-ring')}"/><path d="M23 19h7" stroke-width="2.4" stroke-linecap="round"/></svg>`)}") 3 21, crosshair`;
/** Drag over (red tip, with its circle: `useScreenBrush`; grey tip and minus for Unselect), Paint zones (blue) and Erase zones (grey). Read when asked, so a token edit shows at the next cursor change. */
const brushCursors = () => ({ select: brushCursor(tokenCss('--mark-remove')), unselect: unselectCursor(), paint: brushCursor(tokenCss('--mark-zone')), erase: brushCursor(tokenCss('--mark-ring')) });

/**
 * The rim cursor: the crosshair with an open square at its centre, drawn from the icon FILE.
 *
 * It is read from `src/ui/assets/icons/cursor-rim.svg` rather than written out here like the brush cursors
 * above, because that file is the one a designer can replace - the whole point of the icon folder. The two
 * substitutions are what a cursor needs and a page icon does not: a standalone SVG has no `currentColor` to
 * inherit, so the token is written in, and a data-URI cursor needs a real pixel size.
 *
 * `12 12` is the hot spot: the centre of the open square, which is where the point lands.
 */
const rimCursor = () => `url("data:image/svg+xml,${encodeURIComponent(
  cursorRimFile.replace(/<\?xml[^>]*\?>/, '').replace(/currentColor/g, tokenCss('--cursor-outline'))
    .replace('<svg ', '<svg width="24" height="24" ').trim(),
)}") 12 12, crosshair`;

/**
 * The canvas cursor: WHAT IS IN YOUR HAND, under the pointer, so the dock never has to be read to know
 * it. The brush icon while a brush is over the object, a crosshair where a click would place something,
 * the plain arrow for Select - and a grab hand off the model, because there a drag orbits whatever is
 * in hand.
 */
export function canvasCursor(gesture: Gesture, overBrush: boolean): string {
  switch (gesture.kind) {
    case 'none': return '';
    case 'pick': return 'default';
    case 'add': return 'crosshair';
    case 'zones': return overBrush ? brushCursors()[gesture.brush.kind] : 'crosshair';
    case 'dental-aligner': return 'default';
    /*
     * Rim define mode: the cursor shows only over the model, where a drag is the tool; off it a drag orbits.
     * A press here means three things - grab a point, insert one on the line, add one at the end - and the
     * plain crosshair said none of them. The square at the centre says "a point is what lands here".
     */
    case 'dental-rim': return overBrush ? rimCursor() : 'grab';
    case 'dental-review': return gesture.edit?.kind === 'add' ? (overBrush ? 'crosshair' : 'grab') : 'default';
    /*
     * Step 2's four tools, each with its own pointer. This was one crosshair for all of them - and for
     * no tool at all, which invited a click that could not do anything.
     */
    case 'dental-area':
      if (gesture.brush) return overBrush ? brushCursors()[gesture.brush.kind === 'allow' ? 'paint' : 'erase'] : 'grab';
      if (gesture.edit?.kind === 'add') return overBrush ? 'crosshair' : 'grab';
      if (gesture.edit?.kind === 'drag') return overBrush ? brushCursors()[gesture.edit.brush.mode] : 'grab';
      return 'default';
    case 'drag': return overBrush ? brushCursors()[gesture.brush.mode] : 'grab';
  }
}
