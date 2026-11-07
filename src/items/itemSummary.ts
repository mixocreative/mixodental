// Copyright (c) Mixo Creative.

import { meshBounds } from '@mixo-geocore/host/core/supports/meshQuery';
import type { TriangleMesh } from '@mixo-geocore/host/core/analysis/types';
import type { Message } from '../i18n';

/**
 * THE ROW'S PREVIEW, AND WHY IT IS TEXT.
 *
 * §7 specifies the preview as a text summary rather than a thumbnail, and that is a memory decision
 * rather than a visual one. §0's whole argument is that this release adds **no** transient copy per
 * file; a rendered thumbnail per row would be exactly that, and at 12.2 MB a model (step 5's
 * measurement) with a row cap of 8 it would be the largest thing on the page.
 *
 * Both numbers are already in hand, which is the other half of the argument: the triangle count is
 * on the import verdict, and the bounding box comes from `meshBounds`, which `placeImportedUnits`
 * already calls for every unit it places. Nothing is computed here that the import did not compute.
 */

/** Size of the model in mm, rounded to whole millimetres: a lab reads 31 x 62 x 18, not 31.4172. */
export function sizeSummary(mesh: TriangleMesh): Message {
  const bounds = meshBounds(mesh);
  const span = (axis: number) => Math.max(0, Math.round(bounds.max[axis]! - bounds.min[axis]!));
  return { key: '{x} × {y} × {z} mm', vars: { x: span(0), y: span(1), z: span(2) } };
}

/**
 * Triangle count. Taken from the mesh rather than the verdict so a row still has it when no verdict
 * was stored — a unit imported before the verdict existed, or one that never went through the worker.
 */
export const triangleSummary = (mesh: TriangleMesh): Message =>
  ({ key: '{n} triangles', vars: { n: mesh.indices.length / 3 } });
