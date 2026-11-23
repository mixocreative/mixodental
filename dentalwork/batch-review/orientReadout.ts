import type { Vector } from '@mixo-geocore/host/core/vec3';
import type { OrientNodeValue } from '@mixo-geocore/host/dental/orientGraph';

/*
 * ONE JOB: what the Orient tab SAYS about a case (docs/WORKBENCH-TABS-PLAN.md B3) - where the six named sides of
 * the final orientation sit, and the readout lines each Orient node shows ("how sure was it").
 *
 * Pure: the batch (`reviewCase.ts`) feeds it the mesh and the engine's node values and writes the result next to the
 * review file; the page draws it. LEFT AND RIGHT are a viewer's convention, not anatomy (a denture's anatomical left
 * depends on the jaw): seen from the Front with the Teeth side up on screen. Looking along -front with teeth as
 * screen-up, screen-right = (-front) x teeth = -across, so Right = -across and Left = +across.
 */

/** One named side: where its label goes, in the mesh frame. */
export interface SideAnchor { name: string; position: Vector }

/** How far past the part a side's label sits, mm, so it never hides inside the model. */
export const LABEL_GAP_MM = 3;

const dot = (a: Vector, b: Vector) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

/** The six named sides of `frame` (front = `up`, teeth side = `lean`), each just past the part along its direction. */
export function sideAnchors(positions: ArrayLike<number>, frame: { up: Vector; lean: Vector; across: Vector }): SideAnchor[] {
  const count = Math.floor(positions.length / 3);
  if (count === 0) return [];
  const centre: Vector = [0, 0, 0];
  for (let k = 0; k < count; k++) for (let i = 0; i < 3; i++) centre[i]! += positions[k * 3 + i]! / count;
  const sides: [string, Vector][] = [
    ['Front', frame.up], ['Back', frame.up.map((c) => -c) as Vector],
    ['Teeth side', frame.lean], ['Tissue side', frame.lean.map((c) => -c) as Vector],
    ['Left', frame.across], ['Right', frame.across.map((c) => -c) as Vector],
  ];
  return sides.map(([name, dir]) => {
    let reach = -Infinity;
    for (let k = 0; k < count; k++) reach = Math.max(reach, dot([positions[k * 3]! - centre[0], positions[k * 3 + 1]! - centre[1], positions[k * 3 + 2]! - centre[2]], dir));
    const at = reach + LABEL_GAP_MM;
    return { name, position: centre.map((c, i) => c + dir[i]! * at) as Vector };
  });
}

/** The lines a node shows under its title: what its step measured or decided. Empty for a node with nothing to say. */
export function readoutLines(value: OrientNodeValue | undefined): string[] {
  if (!value) return [];
  if (value.type === 'region') return [`area ${Math.round(value.areaMm2)} mm2`, `pokes out ${value.protrusionMm.toFixed(2)} mm past it`];
  if (value.type === 'pose') return [];
  const lines: string[] = [];
  if (!value.sides) {
    const a = value.arch;
    if (a.flatness === 0 && a.legsGapRatio === 0) return ['a frame from the base: no arch was measured'];
    lines.push(`flatness ${a.flatness.toFixed(3)} (lower = flatter)`, `legs gap ratio ${a.legsGapRatio.toFixed(2)}`,
      `teeth side guess: ${a.teethGuessSure ? 'sure' : 'not sure'} (offset ${a.teethOffsetMm.toFixed(1)} mm)`);
    return lines;
  }
  const s = value.sides;
  // widthMm is [front, back] (arch_slices.rs FrontBack): the wider end is the back.
  if (s.frontBack) lines.push(`back is the wider end: back ${s.frontBack.widthMm[1].toFixed(1)} mm, front ${s.frontBack.widthMm[0].toFixed(1)} mm${s.frontBack.crossCheckAgrees ? '' : ' (cross-check DISAGREES)'}`);
  else lines.push('no arch footprint: front/back from the first guess');
  const v = s.sliceVotes;
  lines.push(`teeth side: ${v.forTeethSide} of ${v.forTeethSide + v.against} voting slices agree (${Math.round(s.confidence * 100)}%), ${v.notVoting} not voting`);
  const turned = [s.frontTurnedRound && 'front', s.teethSideTurnedRound && 'teeth side'].filter(Boolean);
  lines.push(turned.length ? `turned round from the first guess: ${turned.join(' and ')}` : 'first guesses kept');
  return lines;
}
