/*
 * ONE JOB: what the 3D view shows when a zone-graph node is selected (docs/WORKBENCH-TABS-PLAN.md section 9, plan D2;
 * owner 2026-11-23: "when a node is selected, it should show the combined zones up to that point at that node only").
 * Pure - no DOM, no three.js - so the rules are tested in `zonePreview.test.ts`; the viewer only draws the faces.
 *
 * The values come from the RUN (`<case>-zones.json` + `.bin`, written by reviewCase.ts from the engine's per-node
 * values), not from the canvas. So the note says when the canvas has moved on since that run, and a node the run never
 * evaluated says so instead of showing something: a preview of the wrong graph would be worse than none.
 */

/** A Mark's three states, the engine's `zone_graph` UNDEFINED / SUPPORT / NO_SUPPORT, each with its layer colour. */
export const ZONE_STATES = [
  { value: 1, label: 'Support', token: '--layer-allowed' },
  { value: 2, label: 'No-support', token: '--layer-no-support' },
  { value: 0, label: 'Undefined', token: '--layer-undefined' },
];

/** The colour a plain set of faces (a ray, a strip, a combine) is shown in: the Mark group's accent. */
export const SET_TOKEN = '--node-marks';

/** `read` is `{ ids, faces, values }`; the values of node `id`, or null when the run did not evaluate it. */
export function nodeValues(read, id) {
  const k = read?.ids?.indexOf(id) ?? -1;
  if (k < 0) return null;
  return read.values.subarray(k * read.faces, (k + 1) * read.faces);
}

/** The faces holding `value`, as a Uint32Array (two passes: count, then fill - no growing arrays on 500k faces). */
function facesWith(values, value) {
  let count = 0;
  for (let f = 0; f < values.length; f += 1) if (values[f] === value) count += 1;
  const out = new Uint32Array(count);
  for (let f = 0, k = 0; f < values.length; f += 1) if (values[f] === value) out[k++] = f;
  return out;
}

/**
 * What to draw for one node's values: a Mark (a zone) as its three states, a set of faces as one highlight. Groups
 * with no faces are kept, so the note can say "0" rather than leave a state out.
 */
export function previewGroups(values, isZone) {
  if (isZone) return ZONE_STATES.map((state) => ({ ...state, faces: facesWith(values, state.value) }));
  return [{ value: 1, label: 'In this set', token: SET_TOKEN, faces: facesWith(values, 1) }];
}

/**
 * The line under the canvas while a node is selected. `title` is the node's plain name; `groups` is what
 * `previewGroups` gave, or null when there is nothing to show; `hasRead` says whether this case has per-node values at
 * all; `canvasChanged` says the canvas differs from the graph that ran.
 */
export function previewNote({ title, groups, hasRead, canvasChanged, gives, drawn = true }) {
  // A node that gives a point, a depth map or a rim line ran, but has no faces to tint: re-running would not help, so
  // the note must not say it would (Fable's review, 2026-11-23).
  if (gives && gives !== 'mask' && gives !== 'zone') return `${title} gives ${gives === 'position' ? 'a point' : gives === 'depthMap' ? 'a depth map' : 'a rim line'}, not faces - nothing to show on the model. Select a ray, strip, combine or Mark node.`;
  if (!hasRead) return `${title}: this case has no per-node values - run it again (Apply and run) to see each node in 3D.`;
  if (!groups) return `${title} has not run on this case - Apply and run again to see it in 3D.`;
  // The values exist but could not be laid on this model (its face count differs): say so, never "Showing".
  if (!drawn) return `${title} ran, but its values do not fit the model on screen, so nothing is drawn. Run the case again.`;
  const counts = groups.map((g) => `${g.label} ${g.faces.length.toLocaleString('en')}`).join(', ');
  const shown = groups.length > 1 ? `the zone as it stands at ${title}: ${counts} faces` : `${title}: ${counts} faces`;
  const stale = canvasChanged ? ' The canvas has changed since this run, so this is what RAN, not your edit - Apply to see the edit.' : '';
  return `Showing ${shown}. Click the empty canvas to see the final zone again.${stale}`;
}

/**
 * True when two graphs say the same thing whatever order their keys were written in. The graph that RAN comes back
 * through the type file's writer, which sorts keys, while the canvas keeps the order it was built in - so comparing
 * their JSON text called every applied edit "changed since this run" (Fable's review, 2026-11-23).
 */
export function sameGraph(a, b) {
  const sorted = (value) => (Array.isArray(value) ? value.map(sorted)
    : value && typeof value === 'object' ? Object.fromEntries(Object.keys(value).sort().map((key) => [key, sorted(value[key])])) : value);
  return JSON.stringify(sorted(a)) === JSON.stringify(sorted(b));
}
