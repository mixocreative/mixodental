import type { Vector } from '@mixo-geocore/host/core/vec3';
import type { SurfacePick, ViewRay } from '@mixo-geocore/editing/ViewportPort';

/*
 * One job: turn the engine session's raw pick result into a `SurfacePick`.
 *
 * Renderer-free on purpose. Both viewport ports (three.js and Babylon) answer `pick` through the
 * Rust BVH rather than their own raycaster, so both must decode the result and derive the hit
 * normal the same way. Holding that in one module is what stops the two ports drifting apart — the
 * winding rule below is the kind of detail that would otherwise be fixed in one port and not the
 * other.
 */

/** What the port needs of the engine session. */
export interface PickSession {
  pick(handle: number, rays: Float64Array, near: number, far: number, side: number): Float64Array;
}

/** A session mesh's triangles, unit-local, as the engine holds them. */
export interface PickMesh {
  positions: ArrayLike<number>;
  indices: ArrayLike<number>;
}

/** 0 front, 1 back, 2 double sided. */
export const DEFAULT_SIDE = 2;

export interface EnginePickOptions {
  session: () => PickSession | undefined;
  mesh: (handle: number) => PickMesh | undefined;
  side?: number;
}

/**
 * The nearest hit of `ray` against the session mesh behind `handle`, with the triangle's own
 * normal. `undefined` when the engine is not ready, the ray misses, or the mesh has gone.
 */
export function enginePick(options: EnginePickOptions, handle: number, ray: ViewRay): SurfacePick | undefined {
  const session = options.session();
  if (!session) return undefined;
  const out = session.pick(handle, Float64Array.of(...ray.origin, ...ray.direction), 0, Infinity, options.side ?? DEFAULT_SIDE);
  const face = out[0]!;
  if (face < 0) return undefined;
  const mesh = options.mesh(handle);
  if (!mesh) return undefined;
  const corner = (k: number): Vector => {
    const at = mesh.indices[face * 3 + k]! * 3;
    return [mesh.positions[at]!, mesh.positions[at + 1]!, mesh.positions[at + 2]!];
  };
  const [a, b, c] = [corner(0), corner(1), corner(2)];
  // Normal of (c - b) x (a - b): the winding the viewport renders and the exports write. Flipping
  // the operands here turns every picked normal inside out, which reads as supports growing into
  // the model rather than out of it.
  const u = [c[0] - b[0], c[1] - b[1], c[2] - b[2]];
  const v = [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const n = [u[1]! * v[2]! - u[2]! * v[1]!, u[2]! * v[0]! - u[0]! * v[2]!, u[0]! * v[1]! - u[1]! * v[0]!];
  const length = Math.hypot(n[0]!, n[1]!, n[2]!) || 1;
  // `+ 0` normalises -0 to 0, so a hit on an axis-aligned face compares equal across the two ports.
  return {
    point: [out[2]!, out[3]!, out[4]!],
    normal: [n[0]! / length + 0, n[1]! / length + 0, n[2]! / length + 0],
    triangle: face,
    distance: out[1]!,
  };
}
