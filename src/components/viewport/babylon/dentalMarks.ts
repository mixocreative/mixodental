import { Color3, Mesh, MeshBuilder, StandardMaterial, TransformNode, Vector3, VertexData, type LinesMesh, type Scene } from '@babylonjs/core';
import { Constants } from '@babylonjs/core/Engines/constants';
import type { TriangleMesh } from '@mixo-geocore/host/core/analysis/types';
import type { DentalRim } from '@mixo-geocore/host/dental/dental';
import type { AreaRisk } from '../../../dental/areaRisk';

/*
 * Two display-only dental marks: the overhang risks outside the permitted area, and the rim loop.
 * Ports `DentalRiskLayer` and `DentalRimOutline` from `dentalLayers.tsx`.
 *
 * Neither is read by the supports or the export. They exist so an operator can SEE what the engine
 * decided, which is the only reason to draw either.
 */

/** three's `polygonOffset -3/-3`: further off the surface than the area tint at -2, so it reads over it. */
const RISK_Z_OFFSET = -3;
/** The rim sits this far along the opening direction, clear of the surface it traces. */
const RIM_LIFT = 0.035;
/** The outer, fainter loop: a soft edge so the line does not look like a one-pixel artefact. */
const RIM_GLOW = { scale: 1.001, alpha: 0.22 } as const;
const RIM_ALPHA = 0.9;

/** An unlit flat colour; Babylon's stand-in for three's MeshBasicMaterial. */
function flat(name: string, scene: Scene, colour: string, alpha: number): StandardMaterial {
  const material = new StandardMaterial(name, scene);
  material.disableLighting = true;
  material.diffuseColor = Color3.Black();
  material.emissiveColor = Color3.FromHexString(colour);
  material.alpha = alpha;
  material.disableDepthWrite = true;
  material.backFaceCulling = false;
  return material;
}

export interface DentalRiskInput {
  name: string;
  mesh: TriangleMesh;
  parent: TransformNode;
  risks: readonly AreaRisk[];
  /** `--mark-risk-outside`. */
  colour: string;
  opacity: number;
}

/** The overhang low points that fall outside the permitted area. Returns its disposer. */
export function drawDentalRisks(scene: Scene, input: DentalRiskInput): () => void {
  const faces = input.risks.reduce((sum, risk) => sum + risk.faces.length, 0);
  if (faces === 0) return () => {};

  // A triangle soup of the risk faces, copied corner by corner out of the model. Unindexed on
  // purpose, exactly as the three.js layer builds it: these faces are a selection of the model's,
  // not a mesh with its own topology, and sharing vertices with their neighbours would drag
  // unrelated faces into the patch.
  const positions = new Float32Array(faces * 9);
  let at = 0;
  for (const risk of input.risks) {
    for (const face of risk.faces) {
      for (let k = 0; k < 3; k += 1) {
        const vertex = input.mesh.indices[face * 3 + k]! * 3;
        positions[at] = input.mesh.positions[vertex]!;
        positions[at + 1] = input.mesh.positions[vertex + 1]!;
        positions[at + 2] = input.mesh.positions[vertex + 2]!;
        at += 3;
      }
    }
  }
  const indices = new Uint32Array(positions.length / 3);
  for (let v = 0; v < indices.length; v += 1) indices[v] = v;

  const layer = new Mesh(input.name, scene);
  const data = new VertexData();
  data.positions = positions;
  data.indices = indices;
  VertexData.ComputeNormals(positions, indices, (data.normals = new Float32Array(positions.length)));
  data.applyToMesh(layer);
  layer.parent = input.parent;
  layer.isPickable = false;

  const material = flat(`${input.name}-material`, scene, input.colour, input.opacity);
  material.zOffset = RISK_Z_OFFSET;
  layer.material = material;

  return () => {
    material.dispose();
    layer.dispose();
  };
}

export interface DentalRimInput {
  name: string;
  parent: TransformNode;
  rim: DentalRim;
  /** `--mark-area-edge`. See the note below -- it is NOT the area fill colour. */
  colour: string;
}

/*
 * The rim loop, held just clear of the model so the permitted area has a visible boundary.
 *
 * TWO RULES FROM THE THREE.JS LAYER, both of which cost something to learn and neither of which is
 * obvious from the code alone:
 *
 * 1. DRAWN AND DETECTED RIMS BOTH DRAW. The three.js version once returned null for anything but a
 *    `lower-edge-loop`, which made the overlay dead for the reference aligner (whose own detected
 *    rim is a `projection-fallback`) and for every rim an operator drew by hand -- so they could
 *    not see what they had drawn once they left the mode. Whether a loop may AUTHORISE an automatic
 *    area is a different question, decided in Rust where it belongs, and says nothing about whether
 *    the loop is worth looking at.
 * 2. IT WEARS THE EDGE COLOUR, NOT THE AREA FILL. The legend gives the fill to "supports may grow
 *    here" and the edge colour to "edge of that area", and this loop is that edge. In Step 2 the
 *    operator paints the area in the fill, so a boundary wearing the fill would vanish into their
 *    first stroke.
 */
export function drawDentalRim(scene: Scene, input: DentalRimInput): () => void {
  const flat3 = input.rim.points;
  const points: Vector3[] = [];
  for (let at = 0; at + 2 < flat3.length; at += 3) points.push(new Vector3(flat3[at]!, flat3[at + 1]!, flat3[at + 2]!));
  if (points.length < 2) return () => {};
  // Closed: a rim is a loop, and three draws it with `lineLoop`.
  points.push(points[0]!.clone());

  const lift = new TransformNode(`${input.name}-lift`, scene);
  lift.parent = input.parent;
  const [dx, dy, dz] = input.rim.openingDirection;
  lift.position = new Vector3(dx, dy, dz).scale(RIM_LIFT);

  const colour = Color3.FromHexString(input.colour);
  const built: LinesMesh[] = [];
  for (const [which, alpha, scale] of [['line', RIM_ALPHA, 1], ['glow', RIM_GLOW.alpha, RIM_GLOW.scale]] as const) {
    const loop = MeshBuilder.CreateLines(`${input.name}-${which}`, { points, updatable: false }, scene);
    loop.color = colour;
    loop.alpha = alpha;
    loop.scaling.setAll(scale);
    loop.parent = lift;
    loop.isPickable = false;
    // three draws the rim with depthTest off: a boundary hidden inside the model it bounds is read
    // as "there is no boundary here", which is the opposite of what it says.
    if (loop.material) loop.material.depthFunction = Constants.ALWAYS;
    loop.renderingGroupId = 1;
    built.push(loop);
  }

  return () => {
    for (const loop of built) {
      loop.material?.dispose();
      loop.dispose();
    }
    lift.dispose();
  };
}
