import { Color3, Matrix, MeshBuilder, PBRMaterial, Quaternion, Vector3, type Mesh, type Scene } from '@babylonjs/core';
import type { Gesture } from '@mixo-geocore/editing/gesture';
import type { SurfacePointer } from './surfacePointer';

/*
 * The ghost tip: the marker under the pointer in Support Edit Mode showing where a support would
 * land, and in which colour -- the add tone normally, the remove tone when the click would take one
 * away. Layer 2 of the Babylon port.
 *
 * THE SHAPE IS NOT DECORATION. The three.js view uses `ConeGeometry(1, 2, 10)` turned so the APEX
 * sits at the origin and the body runs along +Y, so the point of the cone marks the exact spot the
 * support would meet the model and the body shows which way it would leave. Babylon's cone is
 * built apex-down and centred, so the translation below moves the apex to the origin to match. Get
 * this wrong by one half-height and the marker sits inside the model, which reads as a picking
 * fault rather than a drawing one.
 */

/** Matching `TIP_MARKER_GEOMETRY` in `warmMaterials.ts`: radius 1 mm, height 2 mm, 10 sides. */
const TIP = { diameterTop: 2, diameterBottom: 0, height: 2, tessellation: 10 } as const;
const UP = Vector3.Up();

export interface GhostTipInput {
  canvas: HTMLCanvasElement;
  pointer: SurfacePointer;
  gesture: () => Gesture;
  /** `--mark-support-tip` and `--mark-remove`, read from the tokens by the caller. */
  colours: () => { add: string; remove: string };
}

/** Attaches the ghost tip and returns its detacher. */
export function attachGhostTip(scene: Scene, input: GhostTipInput): () => void {
  const { canvas, pointer } = input;

  const marker: Mesh = MeshBuilder.CreateCylinder('ghost-tip', { ...TIP }, scene);
  // Apex to the origin: Babylon centres the cone, so its point sits at -height/2 until this.
  marker.bakeTransformIntoVertices(Matrix.Translation(0, TIP.height / 2, 0));
  marker.rotationQuaternion = Quaternion.Identity();
  marker.isPickable = false;
  marker.isVisible = false;

  const material = new PBRMaterial('ghost-tip-material', scene);
  material.metallic = 0;
  material.roughness = 0.65;
  marker.material = material;

  const removing = (gesture: Gesture) => gesture.kind === 'add' && gesture.remove;
  const wanted = (gesture: Gesture) => gesture.kind === 'add';

  const onMove = (event: PointerEvent) => {
    const gesture = input.gesture();
    if (!wanted(gesture)) {
      marker.isVisible = false;
      return;
    }
    const hit = pointer.hitAt(event.offsetX, event.offsetY);
    if (!hit) {
      marker.isVisible = false;
      return;
    }
    const tone = removing(gesture) ? input.colours().remove : input.colours().add;
    // No emissive, deliberately. `TIP_MATERIALS` in `warmMaterials.ts` is a plain standard material
    // at roughness 0.65; adding glow here (as the zone overlay legitimately does) pushed the marker
    // through ACES to near-white, so it read as a pale blob rather than as the tip colour.
    material.albedoColor = Color3.FromHexString(tone);
    marker.position.set(...hit.world.point);
    // The body leaves the surface along its normal, so the marker leans the way a support would.
    Quaternion.FromUnitVectorsToRef(UP, new Vector3(...hit.world.normal).normalize(), marker.rotationQuaternion!);
    marker.isVisible = true;
  };

  const onLeave = () => {
    marker.isVisible = false;
  };

  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerleave', onLeave);
  return () => {
    canvas.removeEventListener('pointermove', onMove);
    canvas.removeEventListener('pointerleave', onLeave);
    material.dispose();
    marker.dispose();
  };
}
