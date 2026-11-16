import * as THREE from 'three';
import { Matrix, Vector3 } from '@babylonjs/core/Maths/math.vector';
import { describe, expect, it } from 'vitest';
import type { ViewportPort } from '@mixo-geocore/editing/ViewportPort';
import { createBabylonViewportPort } from './babylonViewportPort';
import { createThreeViewportPort } from './viewportPort';

/*
 * One set of assertions, both renderers. The point of this file is not that either port works on
 * its own: it is that they answer IDENTICALLY, because the editing code behind the D22 seam cannot
 * tell which renderer it is talking to and must not need to. A case added here is added to both.
 */

const FOV = 50;
const ASPECT = 2;
const WIDTH = 400;
const HEIGHT = 200;
const EYE: [number, number, number] = [0, 0, 10];

type Session = { pick: () => Float64Array };

/** Everything that is not the camera, shared so only the renderer differs between the two ports. */
function rest(session?: Session) {
  return {
    canvas: { clientWidth: WIDTH, clientHeight: HEIGHT },
    devicePixelRatio: () => 2,
    session: () => session,
    mesh: () => ({ positions: [0, 0, 0, 1, 0, 0, 0, 1, 0], indices: [0, 1, 2] }),
    brushView: () => ({ clip: new Array(16).fill(0), eye: EYE, width: WIDTH, height: HEIGHT }),
  };
}

function threePort(session?: Session): ViewportPort {
  const camera = new THREE.PerspectiveCamera(FOV, ASPECT, 0.1, 1000);
  camera.position.set(...EYE);
  camera.lookAt(0, 0, 0);
  camera.updateMatrixWorld();
  camera.updateProjectionMatrix();
  return createThreeViewportPort({ camera, ...rest(session) });
}

/** Real Babylon matrices, built without an Engine or a Scene — the port needs nothing else. */
function babylonCamera(projection: Matrix) {
  const view = Matrix.LookAtRH(new Vector3(...EYE), Vector3.Zero(), Vector3.Up());
  return { getViewMatrix: () => view, getProjectionMatrix: () => projection, globalPosition: new Vector3(...EYE), mode: 0 };
}

function babylonPort(session?: Session): ViewportPort {
  const projection = Matrix.PerspectiveFovRH((FOV * Math.PI) / 180, ASPECT, 0.1, 1000);
  return createBabylonViewportPort({ camera: babylonCamera(projection), ...rest(session) });
}

const PORTS: Array<[string, (session?: Session) => ViewportPort]> = [
  ['three.js', threePort],
  ['Babylon', babylonPort],
];

describe.each(PORTS)('%s ViewportPort', (_name, port) => {
  it('reports the canvas size and pixel ratio', () => {
    expect(port().size()).toEqual({ width: WIDTH, height: HEIGHT, devicePixelRatio: 2 });
  });

  it('casts the centre ray down the view axis and projects points back to their pixel', () => {
    const p = port();
    const ray = p.screenToRay([200, 100])!;
    expect(ray.direction[2]).toBeCloseTo(-1, 6);
    expect(Math.hypot(...ray.direction)).toBeCloseTo(1, 6);
    const centre = p.worldToScreen([0, 0, 0])!;
    expect(centre[0]).toBeCloseTo(200, 4);
    expect(centre[1]).toBeCloseTo(100, 4);
    const off = p.screenToRay([300, 50])!;
    const hit: [number, number, number] = [off.origin[0] + off.direction[0] * 10, off.origin[1] + off.direction[1] * 10, off.origin[2] + off.direction[2] * 10];
    const back = p.worldToScreen(hit)!;
    expect(back[0]).toBeCloseTo(300, 3);
    expect(back[1]).toBeCloseTo(50, 3);
  });

  it('starts the ray at the eye', () => {
    expect(port().screenToRay([300, 50])!.origin).toEqual(EYE);
  });

  it('has no screen point behind the camera', () => {
    expect(port().worldToScreen([0, 0, 20])).toBeUndefined();
  });

  it('answers picks from the engine session, with the triangle normal', () => {
    const hit = port({ pick: () => Float64Array.of(0, 3.5, 0.25, 0.25, 0) }).pick(1, { origin: [0.25, 0.25, 5], direction: [0, 0, -1] });
    expect(hit).toEqual({ point: [0.25, 0.25, 0], normal: [0, 0, 1], triangle: 0, distance: 3.5 });
    expect(port({ pick: () => Float64Array.of(-1, 0, 0, 0, 0) }).pick(1, { origin: [0, 0, 5], direction: [0, 0, -1] })).toBeUndefined();
    expect(port().pick(1, { origin: [0, 0, 5], direction: [0, 0, -1] })).toBeUndefined();
  });
});

describe('Babylon ViewportPort, orthographic', () => {
  // The app has only a perspective camera today. This covers the other branch of the port, because
  // an untested branch is the one that is wrong when a Bottom-view orthographic camera arrives.
  const port = createBabylonViewportPort({
    // Babylon 9 has no centred `OrthoRH`, only the off-centre form: 20 wide by 10 high, centred.
    camera: { ...babylonCamera(Matrix.OrthoOffCenterRH(-10, 10, -5, 5, 0.1, 1000)), mode: 1 },
    ...rest(),
  });

  it('casts parallel rays from the screen point itself', () => {
    const centre = port.screenToRay([200, 100])!;
    expect(centre.origin[0]).toBeCloseTo(0, 6);
    expect(centre.origin[1]).toBeCloseTo(0, 6);
    expect(centre.direction[2]).toBeCloseTo(-1, 6);
    const off = port.screenToRay([300, 50])!;
    expect(off.origin[0]).toBeCloseTo(5, 6);
    expect(off.origin[1]).toBeCloseTo(2.5, 6);
    expect(off.direction[2]).toBeCloseTo(-1, 6);
  });

  it('projects a point back to the pixel its ray came from', () => {
    const back = port.worldToScreen([5, 2.5, 0])!;
    expect(back[0]).toBeCloseTo(300, 4);
    expect(back[1]).toBeCloseTo(50, 4);
  });
});
