/*
 * ONE JOB: what the six side labels in 3D say while the Orient canvas is being edited (owner 2026-11-23: "choosing
 * which side is clueless to human not seeing"; WORKBENCH-TABS-PLAN C1 for Orient). Pure, tested in
 * `sidePreview.test.ts`; the viewer only writes the text onto the labels.
 *
 * The labels sit where the RUN put the sides (`<case>-orient.json`). Changing a choice does not move the part until
 * Apply, but what each choice MEANS can be shown at once, because it is only a renaming or a mark:
 * - "front is the other end" turns the part round: Front and Back trade places, and so do Left and Right;
 * - "teeth side is the other side" turns it over: Teeth side and Tissue side trade, and so do Left and Right;
 *   (both at once leave Left and Right where they were - two mirror turns);
 * - Plate side names which side faces the plate and which side rises as it leans: those two labels say so.
 */

/** The engine's side keys (`orient_graph.rs` SIDES) and the label each side carries in 3D (`orientReadout.ts`). */
export const SIDE_LABELS = { back: 'Back', front: 'Front', teeth: 'Teeth side', tissue: 'Tissue side', left: 'Left', right: 'Right' };

/** Today's choices: what the standard Step 1 says, and what a graph without the choices means. */
export const STANDARD_CHOICES = { front: 'auto', teethSide: 'auto', plate: 'back', leanToward: 'teeth' };

/**
 * The side choices an Orient graph makes: the Name-the-sides node's two, and the pose node's plate and lean. Null
 * when the graph has no named sides to choose from (the flat-base recipe: its frame comes from a base, not an arch).
 */
export function sideChoices(graph) {
  const up = graph?.nodes?.find((n) => n.kind === 'upDecision');
  const pose = graph?.nodes?.find((n) => n.id === graph.outputs?.pose);
  if (!up || !pose) return null;
  const choices = { front: up.params?.front ?? 'auto', teethSide: up.params?.teethSide ?? 'auto' };
  if (pose.kind === 'uprightPose') return { ...choices, plate: 'back', leanToward: 'teeth' };
  if (pose.kind === 'plateSide') return { ...choices, plate: pose.params?.plate ?? 'back', leanToward: pose.params?.leanToward ?? 'teeth' };
  return null;
}

const swap = (a, b) => (name) => (name === a ? b : name === b ? a : name);

/**
 * The text of the label the run put at side `name` (one of SIDE_LABELS' values), under the choices `now` when `ran`
 * were the choices of the run. Unknown names pass through untouched.
 */
export function previewLabel(name, ran, now) {
  if (!ran || !now) return name;
  let shown = name;
  const frontTurned = ran.front !== now.front;
  const teethTurned = ran.teethSide !== now.teethSide;
  if (frontTurned) shown = swap('Front', 'Back')(shown);
  if (teethTurned) shown = swap('Teeth side', 'Tissue side')(shown);
  if (frontTurned !== teethTurned) shown = swap('Left', 'Right')(shown);
  const marks = [];
  if (SIDE_LABELS[now.plate] === shown) marks.push('on the plate');
  if (SIDE_LABELS[now.leanToward] === shown) marks.push('rises as it leans');
  return marks.length > 0 ? `${shown} · ${marks.join(' · ')}` : shown;
}

/** True when the labels now say something the run did not: the canvas's side choices differ from the run's. */
export function choicesChanged(ran, now) {
  if (!ran || !now) return false;
  return ran.front !== now.front || ran.teethSide !== now.teethSide || ran.plate !== now.plate || ran.leanToward !== now.leanToward;
}
