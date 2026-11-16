import { Color3, Constants, Mesh, MeshBuilder, StandardMaterial, VertexData, type Scene, type TransformNode } from '@babylonjs/core';
import type { SupportProblem } from '@mixo-geocore/host/core/analysis/supportCheck';
import type { OrientationLayer } from '../../../dental/orientationEvidence';
import type { PreviewColours } from '../sceneColours';
import { hexString } from '../../../ui/tokenColour';

/*
 * Two display-only overlays: the support-check findings, and Step 1's orientation evidence layers.
 * Port `ProblemMarkers` from `supportLayers.tsx` and `DebugLayerMeshes`.
 *
 * Both are read by nobody -- not the supports, not the export. They exist so an operator can see
 * what the engine found, which is the only reason either is drawn.
 */

/** An unlit flat colour that reads over the model, as three's `depthTest: false` marks do. */
function overlayMaterial(name: string, scene: Scene, colour: string, alpha: number, overDepth: boolean): StandardMaterial {
  const material = new StandardMaterial(name, scene);
  material.disableLighting = true;
  material.diffuseColor = Color3.Black();
  material.emissiveColor = Color3.FromHexString(colour);
  material.alpha = alpha;
  material.backFaceCulling = false;
  material.disableDepthWrite = true;
  if (overDepth) material.depthFunction = Constants.ALWAYS;
  return material;
}

/*
 * A sphere on each support-check finding, sized by what it is.
 *
 * `unjudged` draws NOTHING, deliberately: a finding the check could not decide on is not a problem
 * to point at, and marking it would tell the operator there is something wrong where there may not
 * be. `outside` and `omitted` carry several points each and get a small sphere on every one; every
 * other kind is one sphere whose size grows with the area it covers, capped so a large region does
 * not swallow the model it sits on.
 */
export function drawProblemMarks(scene: Scene, input: {
  name: string;
  parent: TransformNode;
  problems: readonly SupportProblem[];
  colours: PreviewColours;
  opacity: number;
}): () => void {
  const made: Array<{ mesh: Mesh; material: StandardMaterial }> = [];
  const sphere = (at: readonly number[], radius: number, colour: string, index: number) => {
    const mesh = MeshBuilder.CreateSphere(`${input.name}-${index}`, { diameter: radius * 2, segments: 12 }, scene);
    mesh.position.set(at[0] ?? 0, at[1] ?? 0, at[2] ?? 0);
    mesh.parent = input.parent;
    mesh.isPickable = false;
    const material = overlayMaterial(`${input.name}-${index}-material`, scene, colour, input.opacity, true);
    mesh.material = material;
    mesh.renderingGroupId = 1;
    made.push({ mesh, material });
  };

  input.problems.forEach((problem, index) => {
    if (problem.kind === 'unjudged') return;
    if (problem.kind === 'outside' || problem.kind === 'omitted') {
      (problem.points ?? []).forEach((point, k) => sphere(point, 0.7, input.colours.outside, index * 1000 + k));
      return;
    }
    const radius = Math.min(2.5, 0.7 + Math.sqrt(problem.area) / 10);
    sphere(problem.position, radius, problem.kind === 'island' ? input.colours.island : input.colours.overhang, index);
  });

  return () => {
    for (const { mesh, material } of made) {
      material.dispose();
      mesh.dispose();
    }
  };
}

/**
 * Step 1's evidence layers, one mesh each, named and coloured by the engine. Drawn inside the
 * unit's node so they follow its transform, exactly as three draws them inside the model's group.
 */
export function drawDebugLayers(scene: Scene, input: {
  name: string;
  parent: TransformNode;
  layers: readonly OrientationLayer[];
}): () => void {
  const made: Array<{ mesh: Mesh; material: StandardMaterial }> = [];
  for (const layer of input.layers) {
    if (layer.positions.length === 0) continue;
    const mesh = new Mesh(`${input.name}-${layer.name}`, scene);
    const data = new VertexData();
    data.positions = layer.positions;
    // An unindexed layer is a triangle soup: the engine sends corners in order.
    data.indices = layer.indices.length > 0
      ? layer.indices
      : Uint32Array.from({ length: layer.positions.length / 3 }, (_, v) => v);
    VertexData.ComputeNormals(data.positions, data.indices, (data.normals = new Float32Array(layer.positions.length)));
    data.applyToMesh(mesh);
    mesh.parent = input.parent;
    mesh.isPickable = false;
    // The engine gives the layer's colour as a NUMBER; `hexString` is the repo's own conversion
    // rather than a second one written here.
    const material = overlayMaterial(`${input.name}-${layer.name}-material`, scene, hexString(layer.color), 1, false);
    mesh.material = material;
    made.push({ mesh, material });
  }
  return () => {
    for (const { mesh, material } of made) {
      material.dispose();
      mesh.dispose();
    }
  };
}
