import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { TransformControls } from 'three-stdlib';
import { DROPPED_HANDLE, FREE_HANDLE, FREE_TOKEN, RING_HOVER_TOKEN, RING_STYLES, RING_TOKEN, dropScreenRing, hoverRotateRing, paintHandle, styleRotateGizmo, thickenRotateRings } from './gizmoStyle';

/*
 * These run against a REAL `TransformControls`, not a stand-in, because everything this module does depends
 * on three's own internals: where the rotate handles live, what they are named, that several meshes share
 * one name, that materials are shared between gizmos, and that colours are restored from a cache every
 * frame. A mock would agree with whatever this module believes and would go on agreeing after a three
 * upgrade moved the ground. These fail instead.
 */

const RING = '#17334e';
const HOVER = '#214b6e';
const PAINT = (token: string) => ({ [RING_TOKEN]: RING, [RING_HOVER_TOKEN]: HOVER, [FREE_TOKEN]: '#9aa3a8' }[token] ?? '#000000');

/** The drawn ring of an axis, as opposed to three's own knob sitting at its midpoint. */
const ringOf = (group: THREE.Object3D, axis: string) => group.children.find((c) => c.name === axis && c.userData.gizmoRing) as THREE.Mesh | undefined;

/*
 * The tests run under vitest's `node` environment, which has no DOM. TransformControls only stores the
 * element it is given and attaches listeners to it, so a stub that can take listeners is enough to build
 * the gizmo - and the gizmo is the whole subject here.
 */
// `connect()` compares the element against the global `document`; the node environment has none.
(globalThis as { document?: unknown }).document ??= { addEventListener() {}, removeEventListener() {} };

const stubCanvas = () => ({ addEventListener() {}, removeEventListener() {}, style: {}, setPointerCapture() {}, releasePointerCapture() {}, ownerDocument: { addEventListener() {}, removeEventListener() {} } }) as unknown as HTMLElement;

function control() {
  return new TransformControls(new THREE.PerspectiveCamera(), stubCanvas());
}
/** Total area of a mesh's triangles. For a tube of fixed thickness this is proportional to its length. */
function surfaceOf(mesh: THREE.Mesh) {
  const position = mesh.geometry.getAttribute('position');
  const index = mesh.geometry.getIndex()!;
  const a = new THREE.Vector3(); const b = new THREE.Vector3(); const c = new THREE.Vector3();
  let total = 0;
  for (let at = 0; at < index.count; at += 3) {
    a.fromBufferAttribute(position, index.getX(at));
    b.fromBufferAttribute(position, index.getX(at + 1));
    c.fromBufferAttribute(position, index.getX(at + 2));
    total += b.clone().sub(a).cross(c.clone().sub(a)).length() / 2;
  }
  return total;
}

function rotateGroup(made: ReturnType<typeof control>) {
  return (made as unknown as { gizmo: { gizmo: Record<string, THREE.Object3D>; picker: Record<string, THREE.Object3D> } }).gizmo;
}

describe('rotate gizmo styling', () => {
  it('finds three\'s rotate handles where this module expects them', () => {
    const names = new Set(rotateGroup(control()).gizmo.rotate!.children.map((child) => child.name));
    // If a three upgrade renames or drops these, every other test here is meaningless, so check first.
    for (const name of Object.keys(RING_STYLES)) expect(names, name).toContain(name);
    expect(names).toContain(FREE_HANDLE);
    expect(names).toContain(DROPPED_HANDLE);
  });

  it('takes the screen-plane ring out of the drawn gizmo AND the picker', () => {
    const made = control();
    const parts = rotateGroup(made);
    // three builds this handle out of several meshes that all carry the name; one is not enough.
    expect(parts.gizmo.rotate!.children.filter((c) => c.name === DROPPED_HANDLE).length).toBeGreaterThan(1);
    const report = styleRotateGizmo(made, PAINT);
    expect(report.dropped).toBeGreaterThan(1);
    expect(parts.gizmo.rotate!.children.some((c) => c.name === DROPPED_HANDLE)).toBe(false);
    // The invisible picker too: a handle you cannot see but can still grab is worse than a cluttered one.
    expect(parts.picker.rotate!.children.some((c) => c.name === DROPPED_HANDLE)).toBe(false);
  });

  it('paints every ring one colour, so pattern is what tells them apart', () => {
    const made = control();
    styleRotateGizmo(made, PAINT);
    const group = rotateGroup(made).gizmo.rotate!;
    for (const axis of Object.keys(RING_STYLES)) {
      expect('#' + (ringOf(group, axis)!.material as THREE.MeshBasicMaterial).color.getHexString(), axis).toBe(RING);
    }
    // The free-rotation circle keeps its own quiet colour; it is an outline, not one of the three.
    const free = group.children.find((c) => c.name === FREE_HANDLE)!;
    expect('#' + ((free as THREE.Mesh).material as THREE.MeshBasicMaterial).color.getHexString()).toBe(PAINT(FREE_TOKEN));
  });

  it('leaves one drawn mesh per ring, so nothing is stacked behind it', () => {
    const made = control();
    styleRotateGizmo(made, PAINT);
    const group = rotateGroup(made).gizmo.rotate!;
    for (const axis of Object.keys(RING_STYLES)) {
      expect(group.children.filter((c) => c.name === axis && c.userData.gizmoRing).length, axis).toBe(1);
    }
  });

  it('gives the hovered ring the hover colour, and puts the others back', () => {
    const made = control();
    styleRotateGizmo(made, PAINT);
    const group = rotateGroup(made).gizmo.rotate!;
    // Rings AND the knobs beside them: both carry the axis name and three lights them together, so one
    // handle must never end up showing two colours.
    expect(hoverRotateRing(made, 'X', PAINT)).toBeGreaterThan(Object.keys(RING_STYLES).length);
    expect('#' + (ringOf(group, 'X')!.material as THREE.MeshBasicMaterial).color.getHexString()).toBe(HOVER);
    const knob = group.children.find((c) => c.name === 'X' && !c.userData.gizmoRing) as THREE.Mesh;
    expect('#' + (knob.material as THREE.MeshBasicMaterial).color.getHexString()).toBe(HOVER);
    expect('#' + (ringOf(group, 'Z')!.material as THREE.MeshBasicMaterial).color.getHexString()).toBe(RING);
    // The colour has to go into the cache too, or three paints over it on the very next frame.
    const material = ringOf(group, 'X')!.material as THREE.MeshBasicMaterial & { tempColor?: THREE.Color };
    expect('#' + material.tempColor!.getHexString()).toBe(HOVER);
    hoverRotateRing(made, null, PAINT);
    expect('#' + (ringOf(group, 'X')!.material as THREE.MeshBasicMaterial).color.getHexString()).toBe(RING);
  });

  /*
   * The two traps this module exists for. Both are silent when got wrong: the colour simply reverts on the
   * next frame, or the move gizmo quietly changes colour somewhere else in the app.
   */
  it('survives three repainting the handles from its cache every frame', () => {
    const made = control();
    styleRotateGizmo(made, PAINT);
    const handle = ringOf(rotateGroup(made).gizmo.rotate!, 'X')!;
    const material = handle.material as THREE.MeshBasicMaterial & { tempColor?: THREE.Color };
    expect(material.tempColor).toBeDefined();
    // This is what three does each frame before it lerps towards white for the hovered axis.
    material.color.copy(material.tempColor!);
    expect('#' + material.color.getHexString()).toBe(RING);
  });

  it('does not repaint the move gizmo, which shares three\'s materials', () => {
    const made = control();
    const parts = rotateGroup(made);
    const move = parts.gizmo.translate!.children.find((child) => child.name === 'X')!;
    const before = ((move as THREE.Mesh).material as THREE.MeshBasicMaterial).color.getHexString();
    styleRotateGizmo(made, PAINT);
    expect(((move as THREE.Mesh).material as THREE.MeshBasicMaterial).color.getHexString()).toBe(before);
  });

  it('swaps every hairline axis arc for a tube, and leaves the knob beside it alone', () => {
    const made = control();
    const group = rotateGroup(made).gizmo.rotate!;
    const knobsBefore = group.children.filter((c) => !(c as THREE.Line).isLine && RING_STYLES[c.name]).length;
    const report = styleRotateGizmo(made, PAINT);
    expect(report.thickened).toBe(3);
    // Not one hairline arc left on an axis: a line is a pixel wide and disappears edge-on.
    expect(group.children.some((c) => (c as THREE.Line).isLine && c.name in { X: 0, Y: 0, Z: 0 })).toBe(false);
    // Each ring is now a solid, and the knob that shares its name survived untouched.
    for (const axis of ['X', 'Y', 'Z']) {
      expect(ringOf(group, axis), axis).toBeDefined();
    }
    expect(group.children.filter((c) => !(c as THREE.Line).isLine && RING_STYLES[c.name]).length).toBeGreaterThanOrEqual(knobsBefore);
  });

  /*
   * The rings must be told apart WITHOUT relying on colour: a solid ring and a broken one stay different
   * for a reader who cannot separate the hues, and on a screen whose colours already mean other things.
   */
  it('draws one ring solid, one dashed and one dotted', () => {
    const made = control();
    styleRotateGizmo(made, PAINT);
    const group = rotateGroup(made).gizmo.rotate!;
    // All three patterns are used, so no two rings are distinguishable by colour alone.
    expect(new Set(Object.values(RING_STYLES))).toEqual(new Set(['solid', 'dashed', 'dotted']));
    const solidAxis = Object.keys(RING_STYLES).find((a) => RING_STYLES[a] === 'solid')!;
    const solid = ringOf(group, solidAxis)!;
    expect(solid).toBeDefined();
    expect(solid.userData.gizmoRing.style).toBe('solid');
    for (const axis of Object.keys(RING_STYLES).filter((a) => a !== solidAxis)) {
      const broken = ringOf(group, axis)!;
      expect(broken, axis).toBeDefined();
      expect(broken.userData.gizmoRing.style, axis).not.toBe('solid');
      // A broken ring really is broken. Vertex count will not show it - the dashes duplicate vertices at
      // every end, so the broken ring has MORE of them. The tube's surface area is what tracks arc length,
      // so the dashes together must cover materially less of the circle than the unbroken ring does.
      expect(surfaceOf(broken) / surfaceOf(solid), axis).toBeLessThan(0.8);
      expect(surfaceOf(broken) / surfaceOf(solid), axis).toBeGreaterThan(0.2);
    }
  });

  /*
   * three marks the hovered handle by lerping its colour half way to WHITE, every frame. That made the
   * ring go pale and chalky instead of taking a colour of its own, and there is no flag to turn it off, so
   * the handle's `Color` is given a `lerp` that does nothing. If that ever stops holding, the hover colour
   * silently washes out again - which is exactly the complaint this was built to answer.
   */
  it('does not let three wash a handle towards white', () => {
    const made = control();
    styleRotateGizmo(made, PAINT);
    const ring = ringOf(rotateGroup(made).gizmo.rotate!, 'X')!;
    const material = ring.material as THREE.MeshBasicMaterial & { tempColor?: THREE.Color };
    // Exactly what three does to the hovered handle on every frame.
    material.color.copy(material.tempColor!);
    material.color.lerp(new THREE.Color(1, 1, 1), 0.5);
    expect('#' + material.color.getHexString()).toBe(RING);
    // Other Colors in the app must be untouched by this: it is one instance, not the prototype.
    const plain = new THREE.Color(RING);
    plain.lerp(new THREE.Color(1, 1, 1), 0.5);
    expect('#' + plain.getHexString()).not.toBe(RING);
  });

  it('leaves the free-rotation circle as a hairline outline', () => {
    const made = control();
    styleRotateGizmo(made, PAINT);
    const free = rotateGroup(made).gizmo.rotate!.children.find((c) => c.name === FREE_HANDLE)!;
    expect((free as THREE.Line).isLine).toBe(true);
  });

  it('reports nothing rather than throwing when the internals are not what it expects', () => {
    expect(styleRotateGizmo(null, PAINT)).toEqual({ painted: 0, dropped: 0, thickened: 0 });
    expect(styleRotateGizmo({}, PAINT)).toEqual({ painted: 0, dropped: 0, thickened: 0 });
    expect(thickenRotateRings(undefined)).toBe(0);
    expect(dropScreenRing(undefined)).toBe(0);
    expect(paintHandle(new THREE.Object3D(), '#fff')).toBe(false);
  });
});
