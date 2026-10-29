import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { createThreeViewportPort } from './viewportPort';

function port(session?: { pick: () => Float64Array }) {
  const camera = new THREE.PerspectiveCamera(50, 2, 0.1, 1000);
  camera.position.set(0, 0, 10);
  camera.lookAt(0, 0, 0);
  camera.updateMatrixWorld();
  camera.updateProjectionMatrix();
  return createThreeViewportPort({
    camera,
    canvas: { clientWidth: 400, clientHeight: 200 },
    devicePixelRatio: () => 2,
    session: () => session,
    mesh: () => ({ positions: [0, 0, 0, 1, 0, 0, 0, 1, 0], indices: [0, 1, 2] }),
    brushView: () => ({ clip: new Array(16).fill(0), eye: [0, 0, 10], width: 400, height: 200 }),
  });
}

describe('three.js ViewportPort', () => {
  it('reports the canvas size and pixel ratio', () => {
    expect(port().size()).toEqual({ width: 400, height: 200, devicePixelRatio: 2 });
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
