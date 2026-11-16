import { Color3, Mesh, PBRMaterial, VertexData, type Scene, type TransformNode } from '@babylonjs/core';
import type { GeneratedSupportMesh } from '@mixo-geocore/host/core/supports/mesh';

/*
 * Whole support bodies (tip, pillar, foot) painted over the supports themselves: the doomed one a
 * remove click would take, the one under the pointer, and Drag over's ghost -- the supports the
 * circle would change. Ports `SupportBodies` from `supportLayers.tsx`.
 *
 * IT COPIES THE VERTICES IT NEEDS RATHER THAN SHARING THEM, which is the one place this differs
 * from the three.js layer, and deliberately. three attaches the FULL support mesh's position and
 * normal attributes to a sub-geometry with its own index buffer, so nothing is re-uploaded. Babylon
 * has no safe equivalent at this level: handing one `VertexBuffer` to two meshes makes their
 * disposal order decide whether the GPU buffer survives, and a double free here shows as a blank
 * viewport, not as an error.
 *
 * So the vertices are REMAPPED instead, and the cost is the opposite way round: this allocates only
 * what the overlay draws. These sets are small -- the supports under a circle, or the single one a
 * click would take -- where the full mesh is the whole build, so copying a few hundred vertices per
 * change is cheaper than three's approach, not dearer. It would not be, for an overlay over most of
 * the build; there is no such caller, and if one appears this is the note that says to look again.
 *
 * `zOffset` is Babylon's polygon offset, matching three's `polygonOffset -2/-2`: the body sits a
 * hair in front of the support it covers rather than fighting it for the same depth.
 */

/** three's `polygonOffsetFactor/Units -2`. */
const Z_OFFSET = -2;
/** `SupportBodies`' `emissiveIntensity`, so the overlay reads on a dark model as it does on a light one. */
const EMISSIVE = 0.35;

export interface SupportBodiesInput {
  name: string;
  supports: GeneratedSupportMesh;
  parent: TransformNode;
  /** The contacts whose whole bodies are painted. */
  ids: readonly string[];
  /** 1 draws solid and writes depth; below 1 draws see-through, as three does. */
  opacity: number;
  colour: string;
}

/** Draws the overlay and returns its disposer; draws nothing when no listed contact is in the mesh. */
export function drawSupportBodies(scene: Scene, input: SupportBodiesInput): () => void {
  const wanted = new Set(input.ids);
  if (wanted.size === 0) return () => {};
  const parts = input.supports.components.filter((part) => part.contactId && wanted.has(part.contactId));
  if (parts.length === 0) return () => {};

  const source = input.supports;
  const total = parts.reduce((sum, part) => sum + part.count, 0);
  const indices = new Uint32Array(total);
  // old vertex index -> new one, filled as the triangles are walked: only the vertices these
  // bodies actually use are copied.
  const moved = new Map<number, number>();
  const positions: number[] = [];
  const at = (old: number): number => {
    const found = moved.get(old);
    if (found !== undefined) return found;
    const fresh = moved.size;
    moved.set(old, fresh);
    positions.push(source.positions[old * 3]!, source.positions[old * 3 + 1]!, source.positions[old * 3 + 2]!);
    return fresh;
  };
  let write = 0;
  for (const part of parts) {
    for (let read = part.start; read < part.start + part.count; read += 1) {
      indices[write] = at(source.indices[read]!);
      write += 1;
    }
  }

  const body = new Mesh(input.name, scene);
  const data = new VertexData();
  const points = Float32Array.from(positions);
  data.positions = points;
  data.indices = indices;
  // Recomputed rather than copied across: the remap changed which vertices exist, and a normal
  // buffer indexed by the OLD numbering would light every face of the overlay wrongly.
  const normals = new Float32Array(points.length);
  VertexData.ComputeNormals(points, indices, normals);
  data.normals = normals;
  data.applyToMesh(body);
  body.parent = input.parent;
  body.isPickable = false;

  const seeThrough = input.opacity < 1;
  const material = new PBRMaterial(`${input.name}-material`, scene);
  const colour = Color3.FromHexString(input.colour);
  material.albedoColor = colour;
  material.emissiveColor = colour.scale(EMISSIVE);
  material.metallic = 0;
  material.roughness = 0.8;
  material.alpha = input.opacity;
  material.zOffset = Z_OFFSET;
  // three writes depth only for the solid overlay; a see-through one that wrote depth would hide
  // whatever is behind it instead of showing through to it.
  if (seeThrough) material.disableDepthWrite = true;
  body.material = material;

  return () => {
    material.dispose();
    body.dispose();
  };
}
