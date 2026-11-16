import type { TriangleMesh } from '@mixo-geocore/host/core/analysis/types';
import { sharedSession } from '@mixo-geocore/host/workers/geometryClient';

/*
 * One job: a core mesh's handle in the shared Rust session, for the Babylon view.
 *
 * `sessionMesh.ts` does this for three.js, but it is keyed on a `THREE.BufferGeometry` and releases
 * on that geometry's `dispose` event, so it cannot serve here. This keys on the core
 * `TriangleMesh` itself, which the scene treats as immutable -- `PrintUnit.source` is "a private
 * copy that commands never mutate" -- so one mesh object means one handle for as long as it exists.
 *
 * WHY THE ENGINE AND NOT `scene.pick`. The D22 contract says the app answers picks "through the
 * engine session, never through its renderer's own picking, so both apps pick identically". Babylon
 * has a perfectly good picker; using it would make the two renderers disagree about which triangle
 * a click hit, which is the one failure this seam exists to prevent.
 */

const handles = new WeakMap<TriangleMesh, number>();

/** The session handle for `mesh`, or undefined before the engine is ready or for an empty mesh. */
export function handleFor(mesh: TriangleMesh): number | undefined {
  const known = handles.get(mesh);
  if (known !== undefined) return known;
  const session = sharedSession();
  if (!session || mesh.indices.length === 0) return undefined;
  const handle = session.load_mesh(mesh.positions, Uint32Array.from(mesh.indices));
  handles.set(mesh, handle);
  return handle;
}

/**
 * Gives a mesh's handle back to the engine. Called when the view drops the mesh, so a scene that
 * churns through imports does not leave every one of them loaded in the engine for the session.
 */
export function releaseHandle(mesh: TriangleMesh): void {
  const handle = handles.get(mesh);
  if (handle === undefined) return;
  handles.delete(mesh);
  try {
    sharedSession()?.release_mesh(handle);
  } catch {
    // Already released, or the engine has gone: either way there is nothing left to give back.
  }
}
