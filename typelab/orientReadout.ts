import type { OrientNodeValue } from '@mixo-geocore/host/dental/orientGraph';

/*
 * ONE JOB: what the Orient tab SAYS about a case (docs/WORKBENCH-TABS-PLAN.md B3) - where the six named sides of
 * the final orientation sit (`src/dental/sideAnchors.ts`, which also says how Left and Right are decided), and the
 * readout lines each Orient node shows ("how sure was it").
 *
 * Pure: the batch (`reviewCase.ts`) feeds it the mesh and the engine's node values and writes the result next to the
 * review file; the page draws it.
 */

// Where the six sides sit moved to src/dental/sideAnchors.ts when the app's Step 1 became its second user.
export { LABEL_GAP_MM, sideAnchors, type SideAnchor } from '../src/dental/sideAnchors';

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
