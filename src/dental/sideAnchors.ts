import type { Vector } from '@mixo-geocore/host/core/vec3';

/*
 * ONE JOB: where the six named sides of an oriented part sit, for a label beside each (docs/WORKBENCH-TABS-PLAN.md
 * B3). Two users, so it lives here: the workbench's Orient tab (typelab/orientReadout.ts) and the
 * app's denture Step 1, where the labels show what Flip front / Flip teeth side turned.
 *
 * LEFT AND RIGHT are a viewer's convention, not anatomy (a denture's anatomical left depends on the jaw): seen from the
 * Front with the Teeth side up on screen. Looking along -front with teeth as screen-up, screen-right = (-front) x teeth
 * = -across, so Right = -across and Left = +across.
 */

/** The six names, in the order `sideAnchors` gives them. */
export type SideName = 'Front' | 'Back' | 'Teeth side' | 'Tissue side' | 'Left' | 'Right';

/** One named side: where its label goes, in the mesh frame. */
export interface SideAnchor { name: SideName; position: Vector }

/** How far past the part a side's label sits, mm, so it never hides inside the model. */
export const LABEL_GAP_MM = 3;

const dot = (a: Vector, b: Vector) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

/** The six named sides of `frame` (front = `up`, teeth side = `lean`), each just past the part along its direction. */
export function sideAnchors(positions: ArrayLike<number>, frame: { up: Vector; lean: Vector; across: Vector }): SideAnchor[] {
  const count = Math.floor(positions.length / 3);
  if (count === 0) return [];
  const centre: Vector = [0, 0, 0];
  for (let k = 0; k < count; k++) for (let i = 0; i < 3; i++) centre[i]! += positions[k * 3 + i]! / count;
  const sides: [SideName, Vector][] = [
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

/** True for Left and Right: the two sides that are a viewer's convention, so their label says from where. */
export const isAcross = (name: SideName): boolean => name === 'Left' || name === 'Right';

/**
 * The app's words for a side (the translation keys). "Back" alone is the Back button's key (戻る), so every side reads
 * "... side" in the app - the same six names with one word added, never a second set.
 */
export const SIDE_WORDS: Record<SideName, string> = {
  Front: 'Front side', Back: 'Back side', 'Teeth side': 'Teeth side', 'Tissue side': 'Tissue side', Left: 'Left side', Right: 'Right side',
};
