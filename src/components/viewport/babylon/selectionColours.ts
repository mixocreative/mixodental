import { VertexBuffer, type Mesh } from '@babylonjs/core';
import type { GeneratedSupportMesh } from '@mixo-geocore/host/core/supports/mesh';
import { contactVertexRuns, selectionDelta } from '@mixo-geocore/editing/selectionHighlight';
import { linearRgb } from './linearColour';

/*
 * The selection highlight, as per-vertex colour on the support mesh itself.
 *
 * WHY NOT A SECOND MESH OF THE SELECTED BODIES. The supports are ONE mesh. Building a second mesh
 * of whichever bodies are selected would allocate and upload on every click, and a drag-select
 * across a crowded model is many clicks a second. `contactVertexRuns` maps each contact id to its
 * vertex ranges in that single mesh, so selecting is recolouring, not rebuilding.
 *
 * COLOURS GO IN LINEAR SPACE (`linearColour.ts`), not the token's bytes. Put sRGB bytes in a vertex
 * colour buffer and every selected support comes out a shade too bright, which reads as a palette
 * decision rather than a bug.
 *
 * shortcut: each change re-uploads the WHOLE colour buffer, where the three.js view uploads only
 * the vertex ranges that changed. `selectionDelta` is still used -- to decide whether anything
 * changed at all, so an unchanged selection costs nothing -- but not yet to narrow the upload.
 * Narrow it with `VertexBuffer.updateDirectly(data, offset)` if a crowded model ever stutters on
 * select; the ranges are already in hand.
 */
export interface SelectionColours {
  /** Recolours for this selection. Cheap and skipped outright when nothing has changed. */
  apply(selected: ReadonlySet<string>, base: string, picked: string): void;
}

export function createSelectionColours(mesh: Mesh, supports: GeneratedSupportMesh): SelectionColours {
  const runs = contactVertexRuns(supports);
  const vertices = supports.positions.length / 3;
  const data = new Float32Array(vertices * 4);
  // Opaque everywhere: Babylon turns on alpha blending for a mesh whose vertex alpha varies, and a
  // support mesh that blends is both slower and wrong.
  for (let v = 0; v < vertices; v += 1) data[v * 4 + 3] = 1;
  mesh.hasVertexAlpha = false;

  let uploaded = false;
  let applied: ReadonlySet<string> = new Set<string>();
  let lastBase = '';
  let lastPicked = '';

  const paint = (id: string, rgb: readonly [number, number, number]) => {
    for (const [start, end] of runs.get(id) ?? []) {
      for (let v = start; v < end; v += 1) {
        data[v * 4] = rgb[0];
        data[v * 4 + 1] = rgb[1];
        data[v * 4 + 2] = rgb[2];
      }
    }
  };

  return {
    apply(selected, base, picked) {
      const repaintAll = !uploaded || base !== lastBase || picked !== lastPicked;
      const delta = repaintAll ? undefined : selectionDelta(applied, selected);
      if (delta && delta.on.length === 0 && delta.off.length === 0) return;

      const baseRgb = linearRgb(base);
      const pickedRgb = linearRgb(picked);
      if (delta) {
        for (const id of delta.off) paint(id, baseRgb);
        for (const id of delta.on) paint(id, pickedRgb);
      } else {
        for (let v = 0; v < vertices; v += 1) {
          data[v * 4] = baseRgb[0];
          data[v * 4 + 1] = baseRgb[1];
          data[v * 4 + 2] = baseRgb[2];
        }
        for (const id of selected) paint(id, pickedRgb);
      }

      if (uploaded) mesh.updateVerticesData(VertexBuffer.ColorKind, data);
      else mesh.setVerticesData(VertexBuffer.ColorKind, data, true, 4);
      uploaded = true;
      applied = new Set(selected);
      lastBase = base;
      lastPicked = picked;
    },
  };
}
