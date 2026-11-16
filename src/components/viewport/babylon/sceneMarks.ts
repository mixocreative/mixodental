import { Color3, Constants, MeshBuilder, Quaternion, StandardMaterial, Vector3, type Mesh, type Scene, type TransformNode } from '@babylonjs/core';
import type { PlateSize } from '@mixo-geocore/editing/arrange';
import type { AddedAt } from '../AddFlash';
import { flashLook } from '../flash';

/*
 * Two marks that belong to the scene rather than to any one unit: the build plate's outline, and
 * the ring that opens at a support the moment it is added.
 */

/** three lifts the outline off the floor by this much so it does not z-fight the grid. */
const PLATE_LIFT = 0.02;

/** The printer's build plate, centred on the origin. Returns its disposer. */
export function drawPlateOutline(scene: Scene, name: string, plate: PlateSize, colour: string): () => void {
  const x = plate.widthMm / 2;
  const z = plate.depthMm / 2;
  // Closed: the last point repeats the first, which is what three's `lineLoop` does for free.
  const corners: ReadonlyArray<readonly [number, number]> = [[-x, z], [x, z], [x, -z], [-x, -z], [-x, z]];
  const outline = MeshBuilder.CreateLines(name, {
    points: corners.map(([cx, cz]) => new Vector3(cx, PLATE_LIFT, cz)),
    updatable: false,
  }, scene);
  outline.color = Color3.FromHexString(colour);
  outline.isPickable = false;
  return () => outline.dispose();
}

export interface AddFlashInput {
  name: string;
  parent: TransformNode;
  at: AddedAt;
  radius: number;
  /** `--mark-remove`, as three's flash uses. */
  colour: string;
}

/*
 * A ring that opens and fades at the tip of a support just added, so the click is SEEN where the
 * eye already is rather than only in a panel.
 *
 * THE CURVE IS SHARED, not re-timed: `flashLook(elapsed)` in `flash.ts` gives the scale and the
 * opacity and returns undefined once it is over, so both renderers play the same flash for the
 * same length. Only the ticking is Babylon's.
 */
export function drawAddFlash(scene: Scene, input: AddFlashInput): () => void {
  const tube = Math.max(0.15, input.radius * 0.1);
  const ring: Mesh = MeshBuilder.CreateTorus(input.name, {
    diameter: input.radius * 2,
    thickness: tube * 2,
    tessellation: 32,
  }, scene);
  ring.position.set(input.at.point[0]!, input.at.point[1]!, input.at.point[2]!);
  // three turns +Z onto the normal because its torus lies in the XY plane; Babylon's lies in XZ
  // with its axis on +Y, so the `from` vector differs and the ring ends up in the same plane.
  const normal = new Vector3(input.at.normal[0]!, input.at.normal[1]!, input.at.normal[2]!).normalize();
  ring.rotationQuaternion = Quaternion.Identity();
  Quaternion.FromUnitVectorsToRef(Vector3.Up(), normal, ring.rotationQuaternion);
  ring.parent = input.parent;
  ring.isPickable = false;

  const material = new StandardMaterial(`${input.name}-material`, scene);
  material.disableLighting = true;
  material.diffuseColor = Color3.Black();
  material.emissiveColor = Color3.FromHexString(input.colour);
  material.disableDepthWrite = true;
  // three draws the flash with depthTest off, so it reads over the support it marks.
  material.depthFunction = Constants.ALWAYS;
  ring.material = material;
  ring.renderingGroupId = 1;

  const started = performance.now();
  const tick = scene.onBeforeRenderObservable.add(() => {
    const look = flashLook(performance.now() - started);
    if (!look) {
      ring.isVisible = false;
      return;
    }
    ring.scaling.setAll(look.scale);
    material.alpha = look.opacity;
  });

  return () => {
    scene.onBeforeRenderObservable.remove(tick);
    material.dispose();
    ring.dispose();
  };
}
