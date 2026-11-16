import { Color3, Constants, MeshBuilder, StandardMaterial, Vector3, type LinesMesh, type Mesh, type Scene, type TransformNode } from '@babylonjs/core';
import type { SurfaceAnchor, SurfacePath } from '../../../core/surfacePath/path';
import { RIM_ANCHOR_RADIUS_MM, anchorCentre, anchorCentres, linePositions } from '../../../dental/rim/rimDraftGeometry';
import { SEE_THROUGH } from '../style';

/*
 * THE RIM THE OPERATOR IS DRAWING, on the model. Ports `RimDraftLayer`.
 *
 * Three decisions are carried over whole, because each is about meaning rather than drawing:
 *
 * ANCHORS ARE CONTENT, not UI accent, so they wear the same red a selected support does -- solid
 * where one is placed, see-through for the one under the pointer that is not placed yet. The line
 * between them is that red too, so the drawing reads as one shape rather than beads on a string.
 *
 * THE SELECTED ANCHOR WEARS A RING, not a different colour. Colour here already means "placed or
 * not", and a third red would make the operator learn a second meaning for one hue.
 *
 * EVERYTHING IGNORES DEPTH. A rim runs all the way round a shell, so half of it always faces away,
 * and a drawing that vanished as it went round the back would be impossible to judge.
 *
 * Nothing here is pickable. The model underneath is what the pointer talks to -- the mode decides
 * what a hit MEANS from the path alone -- so a marker that caught clicks would steal them from the
 * surface.
 */

/** The curve through the handles, as `linePositions` samples it: pairs, not a chord run. */
function segments(flat: Float32Array): Vector3[][] {
  const out: Vector3[][] = [];
  for (let at = 0; at + 5 < flat.length; at += 6) {
    out.push([
      new Vector3(flat[at]!, flat[at + 1]!, flat[at + 2]!),
      new Vector3(flat[at + 3]!, flat[at + 4]!, flat[at + 5]!),
    ]);
  }
  return out;
}

export interface RimLayerInput {
  name: string;
  parent: TransformNode;
  path: SurfacePath;
  /** The anchor a click would place now; absent when the pointer is off the model. */
  preview?: SurfaceAnchor | undefined;
  /** The anchor being moved or picked out, ringed so Delete point has a visible subject. */
  selected?: number | undefined;
  /** `--mark-remove`. */
  colour: string;
}

/** Draws the rim being drawn and returns its disposer. */
export function drawRimDraft(scene: Scene, input: RimLayerInput): () => void {
  const centres = anchorCentres(input.path);
  const previewCentre = input.preview ? anchorCentre(input.preview) : undefined;
  if (centres.length === 0 && previewCentre === undefined) return () => {};

  const colour = Color3.FromHexString(input.colour);
  const made: Array<{ mesh: Mesh | LinesMesh; material?: StandardMaterial }> = [];

  const flat = (name: string, alpha: number) => {
    const material = new StandardMaterial(name, scene);
    material.disableLighting = true;
    material.diffuseColor = Color3.Black();
    material.emissiveColor = colour;
    material.alpha = alpha;
    material.disableDepthWrite = true;
    material.depthFunction = Constants.ALWAYS;
    return material;
  };

  const ball = (which: string, at: readonly number[], radius: number, alpha: number) => {
    const mesh = MeshBuilder.CreateSphere(`${input.name}-${which}`, { diameter: radius * 2, segments: 12 }, scene);
    mesh.position.set(at[0] ?? 0, at[1] ?? 0, at[2] ?? 0);
    mesh.parent = input.parent;
    mesh.isPickable = false;
    const material = flat(`${input.name}-${which}-material`, alpha);
    mesh.material = material;
    mesh.renderingGroupId = 1;
    made.push({ mesh, material });
  };

  if (centres.length > 1) {
    const lines = segments(linePositions(input.path));
    if (lines.length > 0) {
      const line = MeshBuilder.CreateLineSystem(`${input.name}-line`, { lines, updatable: false }, scene);
      line.color = colour;
      line.alpha = 0.9;
      line.parent = input.parent;
      line.isPickable = false;
      if (line.material) line.material.depthFunction = Constants.ALWAYS;
      line.renderingGroupId = 1;
      made.push({ mesh: line });
    }
  }

  centres.forEach((centre, at) => ball(`anchor-${at}`, centre, RIM_ANCHOR_RADIUS_MM, 1));
  if (input.selected !== undefined && centres[input.selected] !== undefined) {
    ball('selected', centres[input.selected]!, RIM_ANCHOR_RADIUS_MM * 1.7, 0.3);
  }
  if (previewCentre !== undefined) ball('preview', previewCentre, RIM_ANCHOR_RADIUS_MM, SEE_THROUGH);

  return () => {
    for (const { mesh, material } of made) {
      material?.dispose();
      mesh.material?.dispose();
      mesh.dispose();
    }
  };
}
