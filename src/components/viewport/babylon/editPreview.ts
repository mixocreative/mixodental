import { Color3, MeshBuilder, Quaternion, StandardMaterial, Vector3, type Mesh, type Scene } from '@babylonjs/core';
import type { LiveSupportSettings } from '@mixo-geocore/host/core/supports/settings';
import type { Gesture } from '@mixo-geocore/editing/gesture';
import type { PreviewColours } from '../sceneColours';
import type { SurfacePointer } from './surfacePointer';

/*
 * The Support Edit Mode preview under the pointer: the port of `EditPreview` in
 * `supportLayers.tsx`, which draws a RING and, when a click would add rather than remove, a cone.
 *
 * WHY THESE ARE UNLIT. All of `EditPreview`'s parts are `MeshBasicMaterial` with their own depth
 * and opacity rules -- the ring does not even depth-test. They are instruments laid over the work,
 * not objects in the scene, and lighting them makes them dim exactly where the model is dark, which
 * is where the operator most needs to see them. Babylon's equivalent of a basic material is a
 * StandardMaterial with `disableLighting` and the colour in `emissiveColor`.
 *
 * THE TWO TURNS ARE DIFFERENT, and swapping them is the easy mistake:
 *   - the RING lies in its own plane, so its axis is turned to the surface normal;
 *   - the CONE points INTO the surface, so its axis is turned to the NEGATED normal, and it sits
 *     half its length out along the normal so its apex meets the surface.
 * three's torus has its axis on +Z and Babylon's on +Y, which is why the ring's `from` vector
 * differs from the three.js code it is ported from while the result is the same.
 *
 * NOT PIXEL-VERIFIED, and said plainly. The draw path is proven -- the same Babylon mesh-and-
 * material path renders the models, the grid, the supports and the zone overlay, and an enlarged
 * marker produced 5,384 unmistakable pixels. What is NOT confirmed by measurement is this layer's
 * FIDELITY: the sizes taken from the unit's settings, the two turns, and the unlit materials. The
 * Babylon canvas alternates between two frames about 605 pixels apart, so a hairline ring cannot be
 * told from that noise; the design doc records the floor. Verify it by eye in a wide window, or by
 * enlarging the ring until it clears the floor.
 *
 * STILL MISSING: the doomed marker -- the sphere on the contact a remove click would take
 * (`contactToRemove` in geocore `editing/removal`). It needs the unit's contacts plumbed through,
 * which this does not have yet, so a remove click still gives no sign of WHICH support would go.
 */

const RING_TESSELLATION = 48;
const CONE_TESSELLATION = 16;
/** `ringMaterial` in `warmMaterials.ts`. */
const RING_OPACITY = 0.85;
/** `EditPreview`'s add cone. */
const CONE_OPACITY = 0.55;

export interface EditPreviewInput {
  canvas: HTMLCanvasElement;
  pointer: SurfacePointer;
  gesture: () => Gesture;
  colours: () => PreviewColours;
  /** The hovered unit's resolved settings, for the sizes. Undefined while it has none. */
  settingsFor: (unitId: string) => LiveSupportSettings | undefined;
}

/** An unlit flat colour, Babylon's stand-in for three's MeshBasicMaterial. */
function flat(name: string, scene: Scene, opacity: number, depthTest: boolean): StandardMaterial {
  const material = new StandardMaterial(name, scene);
  material.disableLighting = true;
  material.diffuseColor = Color3.Black();
  material.alpha = opacity;
  material.disableDepthWrite = true;
  // `depthTest: false` in three becomes an ALWAYS depth function here, so the ring reads over the
  // model instead of being buried in it. 519 is GL_ALWAYS; Babylon has no named constant for it on
  // the material.
  if (!depthTest) material.depthFunction = 519;
  return material;
}

/** Attaches the edit preview and returns its detacher. */
export function attachEditPreview(scene: Scene, input: EditPreviewInput): () => void {
  const { canvas, pointer } = input;

  const ringMaterial = flat('edit-ring-material', scene, RING_OPACITY, false);
  /*
   * The ring is REBUILT when its radius changes, not scaled. `EditPreview`'s tube is
   * `max(0.03, radius * 0.025)`, and no scaling of one torus produces that: a uniform scale ties
   * the tube to the radius and loses the 0.03 floor, and a non-uniform one makes the tube thinner
   * on two sides than the other two. The radius is a setting, so it changes when an operator moves
   * a slider -- not per pointer move.
   */
  let ring: Mesh | undefined;
  let builtRadius = Number.NaN;
  const ringFor = (radius: number): Mesh => {
    if (ring && builtRadius === radius) return ring;
    ring?.dispose();
    const tube = Math.max(0.03, radius * 0.025);
    ring = MeshBuilder.CreateTorus('edit-ring', { diameter: radius * 2, thickness: tube * 2, tessellation: RING_TESSELLATION }, scene);
    ring.material = ringMaterial;
    ring.rotationQuaternion = Quaternion.Identity();
    ring.isPickable = false;
    builtRadius = radius;
    return ring;
  };

  const cone: Mesh = MeshBuilder.CreateCylinder('edit-cone', { diameterTop: 0, diameterBottom: 1, height: 1, tessellation: CONE_TESSELLATION }, scene);
  const coneMaterial = flat('edit-cone-material', scene, CONE_OPACITY, true);
  cone.material = coneMaterial;
  cone.rotationQuaternion = Quaternion.Identity();
  cone.isPickable = false;
  cone.isVisible = false;

  const hide = () => {
    if (ring) ring.isVisible = false;
    cone.isVisible = false;
  };

  const onMove = (event: PointerEvent) => {
    const gesture = input.gesture();
    if (gesture.kind !== 'add') return hide();
    const hit = pointer.hitAt(event.offsetX, event.offsetY);
    if (!hit) return hide();
    const settings = input.settingsFor(hit.unitId);
    if (!settings) return hide();

    const colours = input.colours();
    const removing = gesture.remove;
    const radius = settings.eraseRadius;
    const normal = new Vector3(...hit.world.normal).normalize();
    const point = new Vector3(...hit.world.point);

    const drawn = ringFor(radius);
    ringMaterial.emissiveColor = Color3.FromHexString(removing ? colours.remove : colours.ring);
    // three's torus has its axis on +Z; Babylon's is on +Y. Same ring, different `from`.
    Quaternion.FromUnitVectorsToRef(Vector3.Up(), normal, drawn.rotationQuaternion!);
    drawn.position.copyFrom(point);
    drawn.isVisible = true;

    if (removing) {
      cone.isVisible = false;
      return;
    }
    const length = settings.neckLength;
    coneMaterial.emissiveColor = Color3.FromHexString(colours.add);
    cone.scaling.set(settings.pillarDiameter, length, settings.pillarDiameter);
    // Half a length out along the normal, pointing back INTO the surface, so its apex meets it.
    cone.position.copyFrom(point.add(normal.scale(length / 2)));
    Quaternion.FromUnitVectorsToRef(Vector3.Up(), normal.scale(-1), cone.rotationQuaternion!);
    cone.isVisible = true;
  };

  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerleave', hide);
  return () => {
    canvas.removeEventListener('pointermove', onMove);
    canvas.removeEventListener('pointerleave', hide);
    ringMaterial.dispose();
    coneMaterial.dispose();
    ring?.dispose();
    cone.dispose();
  };
}
