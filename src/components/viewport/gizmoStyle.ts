import * as THREE from 'three';
import { mergeBufferGeometries } from 'three-stdlib';
import { tokenCss } from '../../ui/tokenColour';

/*
 * THE ROTATE GIZMO, REDRAWN IN THE APP'S OWN LANGUAGE.
 *
 * three ships a gizmo in full-strength red, green and blue, hairline thin, with a yellow ring over the top.
 * It is the look of a 3D package, and on this screen it was the loudest thing in a scene whose other
 * colours all MEAN something - pink for where supports may grow, magenta for the edge of that area,
 * orange-yellow for a support. A control must not shout louder than the information it sits on.
 *
 * So the rings are all ONE colour, the app's primary, and they are told apart by PATTERN instead:
 *
 *   - the flat ring, which spins the aligner where it lies on the plate, is UNBROKEN;
 *   - of the two that tip the part off the plate, one is DASHED and the other DOTTED.
 *
 * Pattern over colour is the point. The scene's hues are already spoken for, and a reader who cannot
 * separate hues still gets three controls they can tell apart. The rings are also tubes rather than lines:
 * `THREE.Line` is one pixel wide on nearly every platform whatever width is asked for, so three's rings
 * disappear when seen edge-on - and Step 1 opens at the side view, where two of the three always are.
 *
 * Every colour is a CSS token, set in src/styles.css like the rest of the scene and never in here.
 *
 * THREE THINGS ABOUT THREE'S GIZMO make this less obvious than it looks, and are why this is a module with
 * tests rather than a few lines in a component. Each one fails SILENTLY if got wrong.
 *
 * 1. THE HANDLES ARE REPAINTED EVERY FRAME. On its first frame three caches each handle's colour and
 *    opacity on the material as `tempColor` / `tempOpacity`, then every frame copies those back before
 *    altering them to show what the pointer is on. Setting `color` alone is undone on the next frame; the
 *    cache has to be set too.
 * 2. THE MATERIALS ARE SHARED. Handles are made with `Mesh.clone()`, which copies the object but keeps a
 *    REFERENCE to the same material, and those few materials are reused across the move, rotate and scale
 *    gizmos. Recolouring in place would repaint the move gizmo elsewhere in the app. Each gets its own clone.
 * 3. A HANDLE IS SEVERAL MESHES SHARING ONE NAME. three builds `E` from a ring and four arrow caps, all
 *    named `E`. Anything done by name must be done to every match, not the first one found.
 */

/** How thick a ring is, as a fraction of its radius. Thin: it is a handle, not a hoop. */
const RING_THICKNESS = 0.012;
/** How a ring is drawn. */
export type RingStyle = 'solid' | 'dashed' | 'dotted';

/*
 * WHICH RING IS DRAWN WHICH WAY. `Y` is the axis standing up out of the build plate, so turning about it
 * spins the aligner where it lies, like a turntable - the one rotation a technician thinks in, and so the
 * unbroken one. The other two tip the part off the plate and are the broken pair.
 */
export const RING_STYLES: Record<string, RingStyle> = { Y: 'solid', X: 'dashed', Z: 'dotted' };

/** The dashes and dots a broken ring is drawn in; `DASH_DUTY` is how much of each step is tube, not gap. */
const DASH_COUNT = 9;
const DASH_DUTY = 0.55;
const DOT_COUNT = 13;
/** A dot's radius, as a multiple of the ring's thickness: round and legible, not a short line. */
const DOT_SCALE = 1.9;

/** The token every ring is painted in, and the one it takes when the pointer is on it. */
export const RING_TOKEN = '--gizmo-ring';
export const RING_HOVER_TOKEN = '--gizmo-ring-hover';
/** The free-rotation circle: left a hairline, because it is the outline of the ball and not a thing to aim at. */
export const FREE_TOKEN = '--gizmo-free';

/** The handle three draws for turning in the plane of the screen: removed, ring and arrow caps alike. */
export const DROPPED_HANDLE = 'E';
/** three's name for the free-rotation circle. */
export const FREE_HANDLE = 'XYZE';

interface Painted extends THREE.Material {
  color?: THREE.Color;
  tempColor?: THREE.Color;
  tempOpacity?: number;
}

/**
 * STOPS THREE WASHING THIS HANDLE TOWARDS WHITE.
 *
 * three shows what the pointer is on by lerping the handle's colour half way to white, every frame, right
 * after restoring it from the cache. On a gizmo of one colour that wash was the hover state - and it made
 * the ring go pale and chalky instead of taking a colour of its own.
 *
 * There is no flag for it, so the one `Color` instance on this material is given a `lerp` that does
 * nothing. It is surgical: the colour three sets is exactly the colour we cached, every other `Color` in
 * the app is untouched, and the hover state becomes ours to paint (`hoverRotateRing`). Opacity is left to
 * three, which dims the rings the pointer is NOT on - a second, quieter signal that costs us nothing.
 */
function holdColour(material: Painted): void {
  if (material.color) material.color.lerp = function keep(this: THREE.Color) { return this; };
}

/**
 * Paints one handle, and makes the paint survive three's per-frame repaint.
 *
 * Returns false when the handle has no colour to set, so a three upgrade that changes the gizmo's makeup
 * shows up as a count rather than as a silent no-op.
 */
export function paintHandle(handle: THREE.Object3D, colour: string): boolean {
  const mesh = handle as THREE.Mesh;
  const material = mesh.material;
  if (!material || Array.isArray(material)) return false;
  // Its own copy: the stock materials are shared with the move and scale gizmos.
  const own = material.clone() as Painted;
  if (!own.color) return false;
  own.color.set(colour);
  // The caches three restores from each frame, so this is not painted over on the next one.
  own.tempColor = own.color.clone();
  own.tempOpacity = own.opacity;
  holdColour(own);
  mesh.material = own;
  return true;
}

/*
 * THE SHAPE OF A RING, on the path three bakes into its own handles.
 *
 * three's arc is drawn in the YZ plane, from +Y through +Z to -Y. `TorusGeometry` is built in the XY plane
 * from +X, so the tube is turned to land on the same path: X onto Y, Y onto Z, Z onto X. The per-axis turns
 * are the ones three itself bakes into its Y and Z handles, so every ring sits where its line sat.
 *
 * A broken ring is that half-circle cut into pieces and merged back into ONE geometry, so the handle stays
 * a single object: three steers handles by name and walks every child every frame.
 */
function ringGeometry(turn: THREE.Euler | undefined, style: RingStyle, thickness: number): THREE.BufferGeometry {
  const arc = Math.PI;
  const pieces: THREE.BufferGeometry[] = [];
  if (style === 'solid') {
    pieces.push(new THREE.TorusGeometry(1, thickness, 8, 64, arc));
  } else if (style === 'dashed') {
    const step = arc / DASH_COUNT;
    for (let dash = 0; dash < DASH_COUNT; dash += 1) {
      pieces.push(new THREE.TorusGeometry(1, thickness, 6, 8, step * DASH_DUTY).rotateZ(step * dash));
    }
  } else {
    // Dots are round, not short lines: a sphere sitting on the circle at each step.
    const step = arc / (DOT_COUNT - 1);
    for (let dot = 0; dot < DOT_COUNT; dot += 1) {
      const at = step * dot;
      pieces.push(new THREE.SphereGeometry(thickness * DOT_SCALE, 8, 6).translate(Math.cos(at), Math.sin(at), 0));
    }
  }
  const ring = (pieces.length === 1 ? pieces[0]! : mergeBufferGeometries(pieces)!)
    .rotateX(Math.PI / 2)
    .rotateZ(Math.PI / 2);
  return turn ? ring.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(turn)) : ring;
}

/** The turn three bakes into each axis handle when it builds the gizmo; X is built without one. */
const RING_TURNS: Record<string, THREE.Euler | undefined> = {
  X: undefined,
  Y: new THREE.Euler(0, 0, -Math.PI / 2),
  Z: new THREE.Euler(0, Math.PI / 2, 0),
};

function ringMaterial(colour: string): THREE.MeshBasicMaterial {
  const material = new THREE.MeshBasicMaterial({
    color: new THREE.Color(colour),
    depthTest: false, depthWrite: false, transparent: true, side: THREE.DoubleSide, fog: false, toneMapped: false,
    opacity: 1,
  });
  const painted = material as Painted;
  painted.tempColor = material.color.clone();
  painted.tempOpacity = material.opacity;
  holdColour(painted);
  return material;
}

/**
 * Swaps each axis ring from a hairline to a patterned tube. Returns how many rings were swapped.
 *
 * Only the ARC is replaced - the small knob at its midpoint is already a solid and is left alone. The new
 * mesh keeps the handle's NAME, which is what three steers by: it spins each handle about its own axis
 * every frame so the arc faces the reader, and it decides what the pointer is over, by name.
 */
export function thickenRotateRings(group: THREE.Object3D | undefined, read: (token: string) => string = tokenCss): number {
  let swapped = 0;
  for (const handle of [...(group?.children ?? [])]) {
    const style = RING_STYLES[handle.name];
    // `isLine` is what separates the arc from the solid knob that shares its name.
    if (!style || !(handle as THREE.Line).isLine) continue;
    const mesh = new THREE.Mesh(ringGeometry(RING_TURNS[handle.name], style, RING_THICKNESS), ringMaterial(read(RING_TOKEN)));
    mesh.name = handle.name;
    // Marked so this module and its tests find a ring without guessing from vertex counts.
    mesh.userData.gizmoRing = { style };
    mesh.renderOrder = Infinity;
    group!.add(mesh);
    handle.removeFromParent();
    swapped += 1;
  }
  return swapped;
}

/**
 * Takes the screen-plane ring out of a gizmo group, drawn or picker, and says how many meshes went.
 *
 * The PICKER matters as much as the drawn gizmo: leave its invisible torus behind and the reader has a
 * handle they cannot see but can still grab, which is worse than the clutter that was removed.
 */
export function dropScreenRing(group: THREE.Object3D | undefined): number {
  const doomed = group?.children.filter((child) => child.name === DROPPED_HANDLE) ?? [];
  for (const child of doomed) child.removeFromParent();
  return doomed.length;
}

/** What a styling pass did, for a test to assert on and for a three upgrade to fail loudly against. */
export interface GizmoStyleReport {
  painted: number;
  dropped: number;
  thickened: number;
}

/**
 * Styles the rotate gizmo of a `TransformControls`. Safe to call on a control whose internals have moved:
 * it reports zeroes rather than throwing, and `gizmoStyle.test.ts` fails on a report of zeroes.
 *
 * `read` is how a token becomes a colour; the default reads the live CSS so an edit to a token recolours
 * the open gizmo, like every other colour in the scene.
 */
export function styleRotateGizmo(control: unknown, read: (token: string) => string = tokenCss): GizmoStyleReport {
  const parts = (control as { gizmo?: { gizmo?: Record<string, THREE.Object3D>; picker?: Record<string, THREE.Object3D> } } | null)?.gizmo;
  const dropped = dropScreenRing(parts?.gizmo?.rotate) + dropScreenRing(parts?.picker?.rotate);
  const thickened = thickenRotateRings(parts?.gizmo?.rotate, read);
  let painted = 0;
  for (const handle of parts?.gizmo?.rotate?.children ?? []) {
    // The rings and glows are already painted, with their own opacities; only three's own parts remain.
    if (handle.userData.gizmoRing) continue;
    const token = handle.name === FREE_HANDLE ? FREE_TOKEN : RING_STYLES[handle.name] ? RING_TOKEN : undefined;
    if (token && paintHandle(handle, read(token))) painted += 1;
  }
  return { painted, dropped, thickened };
}

/**
 * The pointer moved onto a ring, or off every ring: repaints so the handle under it takes the hover colour
 * and the rest go back to the plain one.
 *
 * This is the whole hover state now. three's own was to wash the handle towards white, which went pale and
 * chalky on a gizmo of one colour; `holdColour` turns that off, and this paints the real thing instead.
 *
 * It repaints the KNOB as well as the ring. Both carry the axis's name and three lights them together, so
 * painting only the ring would leave one handle showing two colours at once.
 */
export function hoverRotateRing(control: unknown, axis: string | null, read: (token: string) => string = tokenCss): number {
  const handles = (control as { gizmo?: { gizmo?: Record<string, THREE.Object3D> } } | null)?.gizmo?.gizmo?.rotate?.children ?? [];
  let repainted = 0;
  for (const handle of handles) {
    if (!RING_STYLES[handle.name]) continue;
    const material = (handle as THREE.Mesh).material as Painted;
    if (!material?.color) continue;
    material.color.set(read(handle.name === axis ? RING_HOVER_TOKEN : RING_TOKEN));
    material.tempColor = material.color.clone();
    repainted += 1;
  }
  return repainted;
}
