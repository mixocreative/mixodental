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
  const shown = renamed(name, ran, now);
  const marks = [];
  if (SIDE_LABELS[now.plate] === shown) marks.push('on the plate');
  if (SIDE_LABELS[now.leanToward] === shown) marks.push('rises as it leans');
  return marks.length > 0 ? `${shown} · ${marks.join(' · ')}` : shown;
}

/** The name the side the run called `name` carries under the choices `now` (a flip renames; Plate side does not). */
function renamed(name, ran, now) {
  let shown = name;
  const frontTurned = ran.front !== now.front;
  const teethTurned = ran.teethSide !== now.teethSide;
  if (frontTurned) shown = swap('Front', 'Back')(shown);
  if (teethTurned) shown = swap('Teeth side', 'Tissue side')(shown);
  if (frontTurned !== teethTurned) shown = swap('Left', 'Right')(shown);
  return shown;
}

const OPPOSITE = { Front: 'Back', Back: 'Front', 'Teeth side': 'Tissue side', 'Tissue side': 'Teeth side', Left: 'Right', Right: 'Left' };
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const unit = (v) => { const n = Math.hypot(...v) || 1; return v.map((c) => c / n); };
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

/**
 * THE LIVE TURN (owner: "choosing which side is clueless ... not seeing"): how the part would turn if the choices
 * `now` ran instead of `ran`, from where the run put its six labels (`sides`: `{ name, position }` in display space).
 * A flip renames the sides AND, because the part still stands on the side called the plate side, turns it; a new
 * Plate side turns it. The answer is the rotation, row-major 3x3, taking the newly chosen plate and lean sides to
 * where the run's are, plus the point it turns about - or null when nothing turns, or when a side is missing.
 *
 * Each direction is exact without the engine: a side's label sits on the line through the part's centre along its
 * frame axis, opposite its twin, so (Front - Back) is the front direction (`src/dental/sideAnchors.ts`).
 * The lean ANGLE is not previewed: it adds to the print-angle search's own tilt, which only a run decides.
 */
export function turnFor(sides, ran, now) {
  if (!ran || !now || !Array.isArray(sides)) return null;
  const at = Object.fromEntries(sides.map((s) => [s.name, s.position]));
  if (Object.keys(OPPOSITE).some((name) => !at[name])) return null;
  const direction = (name) => unit(sub(at[name], at[OPPOSITE[name]]));
  // The run's label whose side is called `key` under `now` (after a flip, "back" is where the run said Front).
  const ranNameOf = (key) => Object.keys(OPPOSITE).find((name) => renamed(name, ran, now) === SIDE_LABELS[key]);
  const from = [direction(ranNameOf(now.plate)), direction(ranNameOf(now.leanToward))];
  const to = [direction(SIDE_LABELS[ran.plate]), direction(SIDE_LABELS[ran.leanToward])];
  const basis = ([a, b]) => [a, b, cross(a, b)];
  const [f, t] = [basis(from), basis(to)];
  // R = T * F^T: columns of F go to columns of T (both orthonormal: a frame's axes, or their negatives).
  const rotation = [0, 1, 2].flatMap((i) => [0, 1, 2].map((j) => t[0][i] * f[0][j] + t[1][i] * f[1][j] + t[2][i] * f[2][j]));
  const identity = rotation.every((v, k) => Math.abs(v - (k % 4 === 0 ? 1 : 0)) < 1e-9);
  if (identity) return null;
  return { rotation, centre: centreOf(at) };
}

/** True when the labels now say something the run did not: the canvas's side choices differ from the run's. */
export function choicesChanged(ran, now) {
  if (!ran || !now) return false;
  return ran.front !== now.front || ran.teethSide !== now.teethSide || ran.plate !== now.plate || ran.leanToward !== now.leanToward;
}

/**
 * THE REST POSE ON THE ORIENT TAB (owner 2026-11-24: "in orient tab, it should not tilt or rotate to print angle becuz i
 * fail to know plate side preview in orient. print angle should base 0 degree on the orient rest position"). The run's
 * file is in the PRINT pose: the part stands on its plate side, then leans by the print angle. The angle is already
 * measured from the rest pose (case-001 of the 2026-11-23 bench run: Front 10.00 deg off vertical at a 10 deg print
 * angle), so only the view needs undoing: the smallest turn taking the plate side's direction (`plateName`, one of
 * SIDE_LABELS' values) to `down`, about the part's centre. Same shape as `turnFor`'s answer; null when there is nothing
 * to undo - no lean, a missing label, or no plate side (the flat-base recipe).
 */
export function restTurn(sides, plateName, down = [0, -1, 0]) {
  if (!plateName || !OPPOSITE[plateName] || !Array.isArray(sides)) return null;
  const at = Object.fromEntries(sides.map((s) => [s.name, s.position]));
  if (Object.keys(OPPOSITE).some((name) => !at[name])) return null;
  const a = unit(sub(at[plateName], at[OPPOSITE[plateName]]));
  const c = a[0] * down[0] + a[1] * down[1] + a[2] * down[2];
  // Already down: nothing to undo. Straight up cannot happen (the print-angle search stops at 45 deg) and has no
  // single smallest turn, so it is refused rather than guessed.
  if (c > 1 - 1e-9 || c < -1 + 1e-6) return null;
  // Rodrigues for unit a -> unit b: R = I + [v]x + [v]x^2 / (1 + c), v = a x b.
  const v = cross(a, down);
  const k = [[0, -v[2], v[1]], [v[2], 0, -v[0]], [-v[1], v[0], 0]];
  const rotation = [0, 1, 2].flatMap((i) => [0, 1, 2].map((j) =>
    (i === j ? 1 : 0) + k[i][j] + (k[i][0] * k[0][j] + k[i][1] * k[1][j] + k[i][2] * k[2][j]) / (1 + c)));
  return { rotation, centre: centreOf(at) };
}

/** `first` then `then` as one turn (row-major 3x3s about the same centre: both come from the same six labels); either may be null. */
export function composeTurns(first, then) {
  if (!first || !then) return first ?? then ?? null;
  const [f, t] = [first.rotation, then.rotation];
  const rotation = [0, 1, 2].flatMap((i) => [0, 1, 2].map((j) => t[i * 3] * f[j] + t[i * 3 + 1] * f[3 + j] + t[i * 3 + 2] * f[6 + j]));
  return { rotation, centre: first.centre };
}

/** The point the part turns about: the middle of its six side labels. */
function centreOf(at) {
  return [0, 1, 2].map((i) => (at.Front[i] + at.Back[i] + at['Teeth side'][i] + at['Tissue side'][i] + at.Left[i] + at.Right[i]) / 6);
}
