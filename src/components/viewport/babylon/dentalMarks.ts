import { Color3, Mesh, MeshBuilder, StandardMaterial, TransformNode, Vector3, VertexData, type LinesMesh, type Scene } from '@babylonjs/core';
import { linearColour3 } from './linearColour';
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
/** The outer loop, a hair wider: it gives the rim weight so it does not read as a one-pixel artefact. */
const RIM_GLOW = { scale: 1.001, alpha: 1 } as const;
/*
 * BOTH LOOPS ARE OPAQUE HERE, WHERE three DRAWS THEM AT 0.9 AND 0.22, AND THE DIFFERENCE WAS
 * MEASURED RATHER THAN CHOSEN.
 *
 * A one-pixel Babylon line at 0.9 with a fainter copy over it came out 255/214/255 for
 * `--mark-area-edge` -- a near-white where a magenta line belongs. The walk's `u5j` looks for that
 * colour on the model: it found NONE of it here and 122 pixels of it in the three.js view. Forced
 * to a pure green, the line measured 177/255/183 -- lifted on the two channels that should
 * have been zero -- so the colour WAS reaching the shader and the blending was eating it. One
 * opaque pass measured 0/255/0 exactly.
 *
 * A one-pixel line is nearly all partial coverage, and Babylon resolves that coverage against
 * whatever is already there; two see-through passes over a light model leave almost no pixel at
 * full strength. Opaque passes do, and the second at 1.001 gives the line the weight three gets
 * from its own rasteriser: 105 pixels of the exact token colour against three's 122.
 *
 * So this is not a style change. It is the same line, drawn so that it is the colour it says it is.
 */
const RIM_ALPHA = 1;

/** An unlit flat colour; Babylon's stand-in for three's MeshBasicMaterial. */
function flat(name: string, scene: Scene, colour: string, alpha: number): StandardMaterial {
  const material = new StandardMaterial(name, scene);
  material.disableLighting = true;
  material.diffuseColor = Color3.Black();
  material.emissiveColor = linearColour3(colour);
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
  // The halo first, the solid core last: drawn the other way round, the faint copy lifts the line
  // it is meant to soften and the colour washes out (see RIM_ALPHA).
  for (const [which, alpha, scale] of [['glow', RIM_GLOW.alpha, RIM_GLOW.scale], ['line', RIM_ALPHA, 1]] as const) {
    const loop = MeshBuilder.CreateLines(`${input.name}-${which}`, { points, updatable: false }, scene);
    loop.color = colour;
    loop.alpha = alpha;
    loop.scaling.setAll(scale);
    loop.parent = lift;
    loop.isPickable = false;
    // three draws the rim with depthTest off: a boundary hidden inside the model it bounds is read
    // as "there is no boundary here", which is the opposite of what it says.
    if (loop.material) {
      loop.material.depthFunction = Constants.ALWAYS;
      // Stated rather than inherited: a line that blends ADDITIVELY over a light model clips two
      // channels and comes out near white, which is how `--mark-area-edge` rendered as
      // 255/186/255 instead of its magenta and why `u5j` found none of it.
      loop.material.alphaMode = Constants.ALPHA_COMBINE;
    }
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
