import { Color3, Mesh, PBRMaterial, VertexData, type Scene } from '@babylonjs/core';
import type { TriangleMesh } from '@mixo-geocore/host/core/analysis/types';
import { FULL_TIER_MAX } from '@mixo-geocore/host/core/budget';
import { zonedVertices, type ZoneStamp } from '@mixo-geocore/host/core/supports/zones';
import type { ModelTransform } from '@mixo-geocore/host/state/transform';
import { babylonPlacement } from '../babylonTransform';
import { zoneOverlay } from '../overlayMesh';
import { vertexNormals } from '../vertexNormals';

/*
 * The no-support zone layer for the Babylon view: the painted zones drawn see-through over the
 * model. Layer 1 of the port described in docs/design/2026-11-16-babylon-layer-port.md, and the
 * first module written to that file's contract -- plain data in, a disposer out, no React and no
 * knowledge of its neighbours.
 *
 * ALMOST NONE OF THIS IS RENDERER WORK, which is the point. The refined overlay mesh and its vertex
 * grid come from `overlayMesh.ts` (Rust `refine_for_overlay`), the stamps are laid into a
 * byte-per-vertex array by geocore's `zonedVertices`, and "the last covering stamp wins" falls out
 * of applying them in order rather than needing any logic here. Only the final draw is Babylon's.
 *
 * The numbers below are COPIED from `supportLayers.tsx`, not chosen again. Choosing them again by
 * eye is how the two renderers would come to disagree about which vertices a brush dab covers.
 */

/** Edges refined to 1 mm so a 2 mm brush dab shows on a face made of a few large triangles. */
const OVERLAY_MAX_EDGE = 1;
/** The refinement's triangle budget. */
const OVERLAY_MAX_TRIANGLES = 1_500_000;
/** Vertex grid cell (mm), about one brush dab. */
const ZONE_GRID_CELL = 2;
/** How much brighter than flat the overlay reads, matching the three.js material's emissive. */
const EMISSIVE = 0.35;
/** Pulls the overlay toward the camera so it does not z-fight the model it lies on (three uses
 *  polygonOffset -2/-2). Leave it out and the overlay shimmers like a driver fault. */
const Z_OFFSET = -2;

export interface ZoneLayerInput {
  /** Unique mesh name in the scene, so a disposer cannot take another layer's mesh with it. */
  name: string;
  /** The unit's own mesh, NOT the refined one: the refinement is this module's job. */
  mesh: TriangleMesh;
  /** The ordered stamps. Later ones cover earlier ones; `erase` clears. */
  zones: readonly ZoneStamp[];
  /** The unit's transform, so the overlay sits on the model wherever the model is. */
  transform: ModelTransform;
  /** `--mark-zone`, read from the tokens by the caller. */
  colour: string;
  /** `ZONE_OPACITY.full` in zones mode, `.faint` in Support Edit Mode (see `style.ts`). */
  opacity: number;
}

/**
 * The triangles with at least one zoned vertex, as an index list. A small painted spot on a large
 * model stays a small draw, which is the difference between this layer being free and being the
 * reason the viewport stutters.
 */
export function zonedTriangles(indices: ArrayLike<number>, zoned: Uint8Array): Uint32Array {
  const out = new Uint32Array(indices.length);
  let used = 0;
  for (let t = 0; t + 2 < indices.length; t += 3) {
    const a = indices[t]!;
    const b = indices[t + 1]!;
    const c = indices[t + 2]!;
    if (zoned[a] || zoned[b] || zoned[c]) {
      out[used] = a;
      out[used + 1] = b;
      out[used + 2] = c;
      used += 3;
    }
  }
  return out.subarray(0, used);
}

/** Draws the zone overlay and returns its disposer. Draws nothing when no zone is painted. */
export function drawZones(scene: Scene, input: ZoneLayerInput): () => void {
  if (input.zones.length === 0) return () => {};
  // A mesh already fine enough is returned as is; above the full tier the refinement is skipped
  // outright, because a mesh that large has edges short enough already and refining it costs for
  // nothing.
  const coarse = input.mesh.indices.length / 3 < FULL_TIER_MAX;
  const { mesh: refined, grid } = zoneOverlay(
    input.mesh,
    coarse ? OVERLAY_MAX_EDGE : Infinity,
    OVERLAY_MAX_TRIANGLES,
    ZONE_GRID_CELL,
  );
  const normals = vertexNormals(refined);
  const zoned = zonedVertices(input.zones, refined.positions, normals, undefined, grid);
  const indices = zonedTriangles(refined.indices, zoned);
  if (indices.length === 0) return () => {};

  const layer = new Mesh(input.name, scene);
  const data = new VertexData();
  // The full vertex set with a subset index list: the GPU holds the vertices once and draws only
  // the stamped triangles.
  data.positions = refined.positions;
  data.indices = indices;
  data.normals = normals;
  data.applyToMesh(layer);

  const { position, rotationQuaternion } = babylonPlacement(input.transform);
  layer.position = position;
  layer.rotationQuaternion = rotationQuaternion;
  // Picking is the model's job. A click that landed on the overlay and selected nothing would feel
  // like a dead spot on the model.
  layer.isPickable = false;

  const material = new PBRMaterial(`${input.name}-material`, scene);
  const colour = Color3.FromHexString(input.colour);
  material.albedoColor = colour;
  material.emissiveColor = colour;
  material.emissiveIntensity = EMISSIVE;
  material.metallic = 0;
  material.roughness = 0.8;
  material.alpha = input.opacity;
  material.zOffset = Z_OFFSET;
  // See-through surfaces must not write depth, or the ones behind them vanish.
  material.disableDepthWrite = input.opacity < 1;
  layer.material = material;

  return () => {
    material.dispose();
    layer.dispose();
  };
}
