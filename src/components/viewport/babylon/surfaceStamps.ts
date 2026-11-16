import { Color3, Mesh, StandardMaterial, VertexBuffer, VertexData, type Scene, type TransformNode } from '@babylonjs/core';
import type { TriangleMesh } from '@mixo-geocore/host/core/analysis/types';
import { FULL_TIER_MAX } from '@mixo-geocore/host/core/budget';
import { stampVertices, type ZoneStamp } from '@mixo-geocore/host/core/supports/zones';
import type { DentalAllowStamp } from '@mixo-geocore/host/dental/dentalPolicy';
import { zoneOverlay } from '../overlayMesh';
import { vertexNormals } from '../vertexNormals';

/*
 * Brush stamps painted on a model's surface: the no-support zones, and the dental support area and
 * its paint. The port of `SurfaceStampLayer` in `supportLayers.tsx`, which serves all three.
 *
 * ALMOST NONE OF THIS IS RENDERER WORK. The refined overlay mesh and its vertex grid come from
 * `overlayMesh.ts` (Rust `refine_for_overlay`), geocore's `stampVertices` lays each dab, and "the
 * last covering stamp wins" falls out of applying them in order. Only the draw is Babylon's.
 *
 * WHAT MAKES IT GENERAL. The engine underneath only understands paint and erase, so each caller
 * says which of ITS kinds counts as filled (`filledKind`) and the stamps are mapped onto that pair.
 * Domain policy -- what "allow" means, what the detected area is -- stays with the caller, which is
 * why one module can serve zones and dental without knowing anything about either.
 *
 * THE MASK IS ALPHA, NOT GEOMETRY. One uniform colour with each vertex's alpha at 255 or 0, and a
 * drawn index subset of the triangles that are touched at all. Nothing is rebuilt when the painted
 * area changes, and a small spot stays a small draw. `hasVertexAlpha` must therefore be TRUE here
 * -- the opposite of the support mesh, whose vertex colours are opaque and where letting Babylon
 * infer alpha blending would be slower and wrong. Same flag, opposite answers.
 */

/** Edges refined to 1 mm so a 2 mm brush dab shows on a face made of a few large triangles. */
const OVERLAY_MAX_EDGE = 1;
/** The refinement's triangle budget. */
const OVERLAY_MAX_TRIANGLES = 1_500_000;
/** Vertex grid cell (mm), about one brush dab. */
const ZONE_GRID_CELL = 2;
/** Pulls the overlay toward the camera so it does not z-fight the model (three: polygonOffset -2). */
const Z_OFFSET = -2;

export interface SurfaceStampsInput {
  /** Unique mesh name in the scene, so one layer's disposer cannot take another's mesh. */
  name: string;
  /** The unit's own mesh, NOT the refined one: the refinement is this module's job. */
  mesh: TriangleMesh;
  /** The unit's node. The overlay hangs off it at local identity, so it follows the model. */
  parent: TransformNode;
  /** Ordered stamps. Later ones cover earlier ones. */
  stamps: readonly (ZoneStamp | DentalAllowStamp)[];
  /** Which of the caller's kinds fills; every other kind erases. */
  filledKind: string;
  colour: string;
  opacity: number;
  /** A domain-owned mask applied BEFORE the brush stamps (the dental detected footprint). */
  baseline?: Uint8Array;
}

/** The triangles with at least one filled vertex. A small painted spot stays a small draw. */
export function filledTriangles(indices: ArrayLike<number>, filled: Uint8Array): Uint32Array {
  const out = new Uint32Array(indices.length);
  let used = 0;
  for (let t = 0; t + 2 < indices.length; t += 3) {
    const a = indices[t]!;
    const b = indices[t + 1]!;
    const c = indices[t + 2]!;
    if (filled[a] || filled[b] || filled[c]) {
      out[used] = a;
      out[used + 1] = b;
      out[used + 2] = c;
      used += 3;
    }
  }
  return out.subarray(0, used);
}

/** Draws the stamps and returns the disposer. Draws nothing when nothing is filled. */
export function drawSurfaceStamps(scene: Scene, input: SurfaceStampsInput): () => void {
  if (input.stamps.length === 0 && !input.baseline) return () => {};
  // Above the full tier the refinement is skipped: such a mesh has short enough edges already, and
  // the copy would cost more than it buys.
  const coarse = input.mesh.indices.length / 3 < FULL_TIER_MAX;
  const { mesh: refined, grid } = zoneOverlay(
    input.mesh,
    coarse ? OVERLAY_MAX_EDGE : Infinity,
    OVERLAY_MAX_TRIANGLES,
    ZONE_GRID_CELL,
  );
  const normals = vertexNormals(refined);
  const vertices = refined.positions.length / 3;

  // The engine underneath knows only paint and erase; `filledKind` is how a caller's own vocabulary
  // is mapped onto that pair without this module learning the caller's domain.
  const asZones = input.stamps.map((stamp): ZoneStamp => ({ ...stamp, kind: stamp.kind === input.filledKind ? 'paint' : 'erase' }));
  const filled = input.baseline?.length === vertices ? input.baseline.slice() : new Uint8Array(vertices);
  for (const stamp of asZones) stampVertices(stamp, refined.positions, normals, filled, grid);

  const indices = filledTriangles(refined.indices, filled);
  if (indices.length === 0) return () => {};

  const layer = new Mesh(input.name, scene);
  const data = new VertexData();
  data.positions = refined.positions;
  data.indices = indices;
  data.normals = normals;
  data.applyToMesh(layer);

  // White RGB so the material's colour is what shows; alpha is the mask.
  const colours = new Float32Array(vertices * 4);
  for (let v = 0; v < vertices; v += 1) {
    colours[v * 4] = 1;
    colours[v * 4 + 1] = 1;
    colours[v * 4 + 2] = 1;
    colours[v * 4 + 3] = filled[v] ? input.opacity : 0;
  }
  layer.setVerticesData(VertexBuffer.ColorKind, colours, false, 4);
  layer.hasVertexAlpha = true;
  layer.parent = input.parent;
  // Picking is the model's job; a click that landed here and selected nothing would feel dead.
  layer.isPickable = false;

  const material = new StandardMaterial(`${input.name}-material`, scene);
  // Unlit, like three's MeshBasicMaterial: this is an instrument over the work, and lighting it
  // would dim it exactly where the model is dark.
  material.disableLighting = true;
  material.diffuseColor = Color3.Black();
  material.emissiveColor = Color3.FromHexString(input.colour);
  material.backFaceCulling = false;
  material.disableDepthWrite = true;
  material.zOffset = Z_OFFSET;
  layer.material = material;

  return () => {
    material.dispose();
    layer.dispose();
  };
}
