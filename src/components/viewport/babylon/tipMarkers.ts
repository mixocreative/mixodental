import { Color3, Matrix, MeshBuilder, PBRMaterial, Quaternion, Vector3, type Mesh, type Scene, type TransformNode } from '@babylonjs/core';

/*
 * Step 2's reviewed contacts, drawn as cone markers without building any support body. Ports
 * `DentalTipMarkers` / `TipInstances` from `dentalLayers.tsx`.
 *
 * THIN INSTANCES, not a mesh each. A reviewed aligner carries a hundred-odd tips and this redraws
 * whenever the set changes; one mesh per tip would mean a hundred draw calls and a hundred
 * allocations per change. Babylon's thin instances are the counterpart of three's `InstancedMesh`:
 * one geometry, one material, one buffer of per-instance matrices.
 *
 * EACH CONE STANDS ON THE SURFACE IT TOUCHES, and this is the part that is easy to get wrong and
 * looks almost right. The geometry's apex sits at its origin with the body along +Y, so turning +Y
 * onto the contact's outward normal lays the cone the way the printed support will stand: tip on
 * the model, body in the air. A marker that ignores the normal stands upright everywhere and looks
 * plausible on a flat top while being wrong on every slope -- which is most of an aligner.
 */

/** Matching `TIP_MARKER_GEOMETRY` in `warmMaterials.ts`: radius 1 mm, height 2 mm, 10 sides. */
const CONE = { diameterTop: 2, diameterBottom: 0, height: 2, tessellation: 10 } as const;
/** Lifted a hair along the normal so the apex is not co-planar with the face it sits on. */
const LIFT = 0.02;
/** `TIP_MATERIALS`' roughness in `warmMaterials.ts`. */
const ROUGHNESS = 0.65;

export interface TipMark {
  id: string;
  position: readonly number[];
  normal: readonly number[];
}

export interface TipMarkersInput {
  name: string;
  parent: TransformNode;
  points: readonly TipMark[];
  colour: string;
  /** three uses 0.42 for plain tips and 0.6 for the solid ones. */
  scale: number;
}

/** Draws one set of tip markers and returns its disposer. Draws nothing for an empty set. */
export function drawTipMarkers(scene: Scene, input: TipMarkersInput): () => void {
  if (input.points.length === 0) return () => {};

  const cone: Mesh = MeshBuilder.CreateCylinder(input.name, { ...CONE }, scene);
  // Apex to the origin: Babylon centres the cone, so its point sits at -height/2 until this.
  cone.bakeTransformIntoVertices(Matrix.Translation(0, CONE.height / 2, 0));
  cone.parent = input.parent;
  cone.isPickable = false;
  // These are markers on a model that may be anywhere; culling them by the cone's own tiny bounds
  // makes them flicker out at the edges of the view.
  cone.alwaysSelectAsActiveMesh = true;

  const size = new Vector3(input.scale, input.scale, input.scale);
  const turn = new Quaternion();
  const at = new Vector3();
  const normal = new Vector3();
  const matrix = Matrix.Identity();
  const buffer = new Float32Array(input.points.length * 16);
  input.points.forEach((point, index) => {
    normal.set(point.normal[0] ?? 0, point.normal[1] ?? 0, point.normal[2] ?? 0);
    // A normal that arrives zero length leaves the cone upright rather than collapsing it to
    // nothing -- an invisible marker is a worse answer than a mis-angled one.
    if (normal.lengthSquared() < 0.5) normal.set(0, 1, 0);
    else normal.normalize();
    Quaternion.FromUnitVectorsToRef(Vector3.Up(), normal, turn);
    at.set(point.position[0] ?? 0, point.position[1] ?? 0, point.position[2] ?? 0).addInPlace(normal.scale(LIFT));
    Matrix.ComposeToRef(size, turn, at, matrix);
    matrix.copyToArray(buffer, index * 16);
  });
  cone.thinInstanceSetBuffer('matrix', buffer, 16, true);

  const material = new PBRMaterial(`${input.name}-material`, scene);
  material.albedoColor = Color3.FromHexString(input.colour);
  material.metallic = 0;
  material.roughness = ROUGHNESS;
  cone.material = material;

  return () => {
    material.dispose();
    cone.dispose();
  };
}
