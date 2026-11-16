import type { GestureKind } from '@mixo-geocore/editing/gesture';

/*
 * Which modes take a click WHOLE, so the Support Edit readings of it -- select, add, erase, toggle,
 * the miss -- never run.
 *
 * ONE LINE, AND IT IS HERE BECAUSE LEAVING IT OUT OF THE SECOND VIEW COST A WHOLE WALK. The Babylon
 * view ran its edit clicks in rim define mode, so every click that placed a rim anchor ALSO added a
 * support. Fifteen supports later the unit's bounding box was four times the cube, the camera fit
 * framed the box rather than the model, and the walk's canvas-fraction clicks started missing it
 * altogether -- five rim checks failing with "points 1", none of them about the rim.
 *
 * So the rule is named once and both views ask it:
 *
 *   - RIM DEFINE MODE: the model is a surface to draw a loop on. A left click is an anchor and a
 *     right click is nothing -- this mode has no remove-by-right-click, and a menu-button press
 *     should not place a point the operator did not mean.
 *   - THE DENTAL AREA BRUSH: Paint and Erase work through the stroke, and the click a stroke's
 *     release fires is not an Add.
 *
 * Zones are deliberately NOT here. `pickAction` already knows the `zones` mode and answers for it,
 * so adding it would be a second rule saying the same thing in a different place.
 */
export function modeOwnsClick(kind: GestureKind): boolean {
  return kind === 'dental-rim' || kind === 'dental-area';
}
