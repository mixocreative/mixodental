import { Color3, Mesh, StandardMaterial, VertexData, type Scene, type TransformNode } from '@babylonjs/core';
import type { TriangleMesh } from '@mixo-geocore/host/core/analysis/types';
import { faceMaskOverlay } from '../faceMaskOverlay';
import { FACE_TINT_OPACITY } from '../FaceTintLayer';

/*
 * A subtle tint over some faces of a model -- today the denture's add-on parts. Ports
 * `FaceTintLayer`, and like it the geometry is the engine's (`face_mask_overlay`): one vertex per
 * tinted corner, so the tint cannot bleed across a shared vertex onto a face nobody approved.
 *
 * NO VERTEX ALPHA HERE, unlike `dentalArea.ts`: every drawn face is tinted, so the opacity is the
 * material's and the mask is already spent on choosing the geometry. `hasVertexAlpha` on a mesh
 * whose alpha never varies makes Babylon blend per vertex for nothing.
 *
 * `zOffset` is Babylon's polygon offset, and it is what the three.js layer's `polygonOffset -1/-1`
 * does: the tint sits a hair in front of the surface it describes rather than fighting it for the
 * same depth, which on a curved scan shows as a flicker that looks like a geometry fault.
 */

/** three's `polygonOffsetFactor/Units -1`. */
const Z_OFFSET = -1;

export interface FaceTintInput {
  name: string;
  /** The unit's model, whose triangle order `mask` indexes. */
  mesh: TriangleMesh;
  /** 1 per tinted face. */
  mask: Uint8Array;
  parent: TransformNode;
  /** `#rrggbb`. */
  colour: string;
}

/** Draws the tint and returns its disposer; draws nothing when no face is tinted. */
export function drawFaceTint(scene: Scene, input: FaceTintInput): () => void {
  const { positions, normals } = faceMaskOverlay(input.mesh, input.mask);
  const vertices = positions.length / 3;
  if (vertices === 0) return () => {};

  // One vertex per tinted corner, so the triangle list is simply 0,1,2,3,...
  const indices = new Uint32Array(vertices);
  for (let v = 0; v < vertices; v += 1) indices[v] = v;

  const layer = new Mesh(input.name, scene);
  const data = new VertexData();
  data.positions = positions;
  data.indices = indices;
  data.normals = normals;
  data.applyToMesh(layer);
  layer.parent = input.parent;
  layer.isPickable = false;

  const material = new StandardMaterial(`${input.name}-material`, scene);
  material.disableLighting = true;
  material.diffuseColor = Color3.Black();
  material.emissiveColor = Color3.FromHexString(input.colour);
  material.alpha = FACE_TINT_OPACITY;
  // Double-sided, as three's is: a denture is looked into as well as at.
  material.backFaceCulling = false;
  material.disableDepthWrite = true;
  material.zOffset = Z_OFFSET;
  layer.material = material;

  return () => {
    material.dispose();
    layer.dispose();
  };
}
