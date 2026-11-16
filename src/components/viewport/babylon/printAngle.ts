import { Color3, Constants, MeshBuilder, StandardMaterial, Vector3, type LinesMesh, type Mesh, type Scene, type TransformNode } from '@babylonjs/core';
import type { Vector } from '@mixo-geocore/host/core/vec3';
import type { DomAnchors } from './domAnchor';

/*
 * The print-angle mark: an arc on the build plate beside the model, with the plate's own line, the
 * line the model stands at, a pivot dot and the reading in degrees. Ports `PrintAngleArc`.
 *
 * IT STANDS UNDER THE MODEL'S OWN FOOTPRINT, not beyond its edge, and three's comment says why: a
 * mark set outside the model's extent falls outside whatever the camera framed and is never seen.
 * It draws over the shell (depth test off), which is what an annotation should do.
 *
 * The reading is real DOM through `domAnchor`, not text painted into the scene, so it takes the
 * app's font and colour and can be read aloud.
 */

/** `PrintAngleArc`'s own constants: the mark sits at the footprint centre, radius 0.3 of its width. */
const OFFSET = 0.0;
const RADIUS = 0.3;
const STEPS = 48;

export interface PrintAngleInput {
  name: string;
  scene: Scene;
  parent: TransformNode;
  anchors: DomAnchors;
  /** Where the reading is mounted; an element positioned over the canvas. */
  host: HTMLElement;
  /** The unit's world-space bounds, because the arc stands on the plate, not in the unit's frame. */
  bounds: { min: Vector3; max: Vector3 };
  deg: number;
  /** `--angle-mark`. */
  colour: string;
}

/** Draws the mark and returns its disposer. */
export function drawPrintAngle(input: PrintAngleInput): () => void {
  const { scene, bounds } = input;
  const size = bounds.max.subtract(bounds.min);
  const centre = bounds.min.add(size.scale(0.5));
  const width = Math.max(size.x, size.z, 1);
  const origin = new Vector3(centre.x, 0, centre.z + width * OFFSET);
  const radius = width * RADIUS;
  const turn = (input.deg * Math.PI) / 180;

  const at = (i: number) => new Vector3(
    origin.x,
    origin.y + Math.sin((turn * i) / STEPS) * radius,
    origin.z - Math.cos((turn * i) / STEPS) * radius,
  );
  const arc: Vector3[] = [];
  for (let i = 0; i <= STEPS; i += 1) arc.push(at(i));

  const colour = Color3.FromHexString(input.colour);
  const built: Array<LinesMesh | Mesh> = [];
  const lines = (which: string, points: Vector3[], alpha: number) => {
    const mesh = MeshBuilder.CreateLines(`${input.name}-${which}`, { points, updatable: false }, scene);
    mesh.color = colour;
    mesh.alpha = alpha;
    mesh.isPickable = false;
    if (mesh.material) mesh.material.depthFunction = Constants.ALWAYS;
    mesh.renderingGroupId = 1;
    built.push(mesh);
  };

  lines('arc', arc, 1);
  // The plate's own line, and the line the model stands at: fainter, because they are the frame
  // the angle is read against rather than the reading itself.
  lines('plate', [origin, new Vector3(origin.x, origin.y, origin.z - radius * 1.25)], 0.55);
  lines('tilt', [origin, new Vector3(
    origin.x,
    origin.y + Math.sin(turn) * radius * 1.25,
    origin.z - Math.cos(turn) * radius * 1.25,
  )], 0.55);

  const pivot = MeshBuilder.CreateSphere(`${input.name}-pivot`, { diameter: Math.max(size.x, 1) * 0.016, segments: 10 }, scene);
  pivot.position.copyFrom(origin);
  pivot.isPickable = false;
  const pivotMaterial = new StandardMaterial(`${input.name}-pivot-material`, scene);
  pivotMaterial.disableLighting = true;
  pivotMaterial.diffuseColor = Color3.Black();
  pivotMaterial.emissiveColor = colour;
  pivotMaterial.depthFunction = Constants.ALWAYS;
  pivotMaterial.disableDepthWrite = true;
  pivot.material = pivotMaterial;
  pivot.renderingGroupId = 1;
  built.push(pivot);

  // The reading, half way round the arc and a little outside it.
  const half = turn / 2;
  const labelAt: Vector = [
    origin.x,
    origin.y + Math.sin(half) * radius * 2.1,
    origin.z - Math.cos(half) * radius * 2.1,
  ];
  const reading = document.createElement('span');
  reading.className = 'angle-reading';
  reading.dataset.ui = 'scene-print-angle';
  reading.style.position = 'absolute';
  reading.style.left = '0';
  reading.style.top = '0';
  reading.style.pointerEvents = 'none';
  reading.textContent = input.deg.toFixed(1);
  const degreeMark = document.createElement('span');
  degreeMark.className = 'angle-reading-deg';
  degreeMark.textContent = '°';
  reading.append(degreeMark);
  input.host.append(reading);
  const unfollow = input.anchors.follow(reading, () => labelAt);

  return () => {
    unfollow();
    reading.remove();
    pivotMaterial.dispose();
    for (const mesh of built) {
      mesh.material?.dispose();
      mesh.dispose();
    }
  };
}
