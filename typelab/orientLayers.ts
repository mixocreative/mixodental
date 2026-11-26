import type { Vector } from '@mixo-geocore/host/core/vec3';
import type { OrientNodeValue } from '@mixo-geocore/host/dental/orientGraph';

/*
 * ONE JOB: what the Orient graph's nodes made (docs/ORIENT-NODES.md U6), as review layers - a flat region as its
 * tinted faces, a pose as its up line at tilt 0 - so the 3D view shows what the Orient canvas chose.
 *
 * Pure: the writer (`dentureReviewLayers.ts`) turns faces into lifted patches and segments into lines. Drawn only
 * when an EDITED Step 1 ran: the default graph's frame and pose are today's, already drawn by the layers beside it,
 * and drawing them again would change every default review the real-scan gate compares.
 */

/** A face layer (tinted faces) or a line layer (segments). */
export type OrientLayer =
  | { kind: 'faces'; name: string; faces: number[] }
  | { kind: 'lines'; name: string; segments: Array<[Vector, Vector]> };

/** How long the drawn up line is, mm. Long enough to read beside a denture, short of the plate. */
export const UP_LINE_MM = 20;

/** The layers for `nodes` (by id); `centre` anchors a pose's up line when no flat region gives a better place. */
export function orientLayers(nodes: Record<string, OrientNodeValue>, centre: Vector): OrientLayer[] {
  const layers: OrientLayer[] = [];
  const regions = Object.entries(nodes).filter((e): e is [string, Extract<OrientNodeValue, { type: 'region' }>] => e[1].type === 'region');
  for (const [id, region] of regions) {
    layers.push({ kind: 'faces', name: `Orient ${id}: flat area (${Math.round(region.areaMm2)} mm2, pokes out ${region.protrusionMm.toFixed(2)} mm)`, faces: region.faces });
  }
  const anchor = regions[0]?.[1].centroid ?? centre;
  for (const [id, value] of Object.entries(nodes)) {
    if (value.type !== 'pose') continue;
    const tip = anchor.map((c, k) => c + value.up[k]! * UP_LINE_MM) as Vector;
    layers.push({ kind: 'lines', name: `Orient ${id}: up at tilt 0 (away from the plate)`, segments: [[anchor, tip]] });
  }
  return layers;
}
