import { Color3, Constants, Mesh, MeshBuilder, StandardMaterial, VertexBuffer, VertexData, Vector3, type LinesMesh, type Scene, type TransformNode } from '@babylonjs/core';
import { linearColour3 } from './linearColour';
import type { TriangleMesh } from '@mixo-geocore/host/core/analysis/types';
import { buildVertexGrid, stampVertices } from '@mixo-geocore/host/core/supports/zones';
import { dentalContactMask, type DentalAllowStamp, type DentalPolicy } from '@mixo-geocore/host/dental/dentalPolicy';
import { faceMaskContourSegments, faceMaskOverlay } from '../faceMaskOverlay';

/*
 * The dental two-contour area: the approved face tint, and the exact edges of the detected region.
 * Ports `DentalFaceLayer` and `DentalRegionLines` from `dentalLayers.tsx`.
 *
 * BOTH GEOMETRIES COME FROM RUST and neither is re-derived here. `faceMaskOverlay` returns a
 * separate vertex per APPROVED triangle corner -- which is the point: shared vertices would bleed
 * the tint onto neighbouring tooth faces. `faceMaskContourSegments` returns real mesh edges, not a
 * planar proxy, because a dental trim is not planar and a proxy would cut across the surface.
 *
 * THE TINT IS MASKED BY ALPHA, not by rebuilding geometry: one uniform colour with each vertex's
 * alpha at full or zero. A brush stroke changes the mask, never the mesh. So `hasVertexAlpha` is
 * TRUE here, as it is for `surfaceStamps.ts` and as it is NOT for the support mesh, where opaque
 * vertex colours make inferred alpha blending both slower and wrong.
 */

/** three's `polygonOffset -2/-2`: keeps the tint off the model's own surface. */
const Z_OFFSET = -2;

export interface DentalFaceInput {
  name: string;
  mesh: TriangleMesh;
  parent: TransformNode;
  policy: Extract<DentalPolicy, { kind: 'two-contour' }>;
  /** `--mark-area-permitted`. */
  colour: string;
  opacity: number;
}

export interface DentalRegionLinesInput {
  name: string;
  mesh: TriangleMesh;
  parent: TransformNode;
  policy: Extract<DentalPolicy, { kind: 'two-contour' }>;
  /** `--mark-ring` for the outer trim, `--mark-area-edge` for the opening. */
  outerColour: string;
  openingColour: string;
}

/** The approved-face tint. Returns its disposer; draws nothing when the mask is empty. */
export function drawDentalFace(scene: Scene, input: DentalFaceInput): () => void {
  const triangles = input.mesh.indices.length / 3;
  const { positions, normals } = faceMaskOverlay(input.mesh, dentalContactMask(input.policy, triangles));
  const vertices = positions.length / 3;
  if (vertices === 0) return () => {};

  // One vertex per approved corner, so the triangle list is simply 0,1,2,3,... There is no sharing
  // to exploit and sharing is exactly what this overlay must not do.
  const indices = new Uint32Array(vertices);
  for (let v = 0; v < vertices; v += 1) indices[v] = v;

  const mask = new Uint8Array(vertices).fill(1);
  const grid = buildVertexGrid(positions);
  // Brush edits ride on top of the detected area: `allow` fills, anything else erases, in order.
  for (const stamp of input.policy.stamps as readonly DentalAllowStamp[]) {
    stampVertices({ ...stamp, kind: stamp.kind === 'allow' ? 'paint' : 'erase' }, positions, normals, mask, grid);
  }

  const layer = new Mesh(input.name, scene);
  const data = new VertexData();
  data.positions = positions;
  data.indices = indices;
  data.normals = normals;
  data.applyToMesh(layer);

  const colours = new Float32Array(vertices * 4);
  for (let v = 0; v < vertices; v += 1) {
    colours[v * 4] = 1;
    colours[v * 4 + 1] = 1;
    colours[v * 4 + 2] = 1;
    colours[v * 4 + 3] = mask[v] ? input.opacity : 0;
  }
  layer.setVerticesData(VertexBuffer.ColorKind, colours, false, 4);
  layer.hasVertexAlpha = true;
  layer.parent = input.parent;
  layer.isPickable = false;

  const material = new StandardMaterial(`${input.name}-material`, scene);
  material.disableLighting = true;
  material.diffuseColor = Color3.Black();
  material.emissiveColor = linearColour3(input.colour);
  // Double-sided, as three's is: the operator looks into the aligner from underneath.
  material.backFaceCulling = false;
  material.disableDepthWrite = true;
  material.zOffset = Z_OFFSET;
  layer.material = material;

  return () => {
    material.dispose();
    layer.dispose();
  };
}

/** A segment list as Babylon wants it: pairs of points, straight from the Rust buffer. */
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

/** The detected region's outer trim and its opening, as exact mesh edges. */
export function drawDentalRegionLines(scene: Scene, input: DentalRegionLinesInput): () => void {
  const built: LinesMesh[] = [];
  const pairs: Array<[string, Uint32Array, string]> = [
    ['outer', input.policy.region.outerEdges, input.outerColour],
    ['opening', input.policy.region.openingEdges, input.openingColour],
  ];
  for (const [which, edges, colour] of pairs) {
    const lines = segments(faceMaskContourSegments(input.mesh, edges));
    if (lines.length === 0) continue;
    const mesh = MeshBuilder.CreateLineSystem(`${input.name}-${which}`, { lines, updatable: false }, scene);
    mesh.color = Color3.FromHexString(colour);
    mesh.parent = input.parent;
    mesh.isPickable = false;
    // three draws these with depthTest off: a trim line hidden inside the model it describes is
    // worse than useless, because the operator reads its absence as "no edge detected here".
    if (mesh.material) mesh.material.depthFunction = Constants.ALWAYS;
    mesh.renderingGroupId = 1;
    built.push(mesh);
  }
  return () => {
    for (const mesh of built) {
      mesh.material?.dispose();
      mesh.dispose();
    }
  };
}
