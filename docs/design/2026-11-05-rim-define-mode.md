# Rim define mode — the operator draws the rim when detection cannot

When automatic rim detection fails, the aligner is a dead end today: Step 1 says it could not be oriented,
and `Next` declines because Step 2's support area is built from a rim nobody found. The owner's answer
(2026-11-05) is to give the operator the rim:

> If loaded model cannot detect rim, it will dive into rim define mode, and when done go straight to free
> transform mode, no auto detect. … Which means self defined rim disabled auto orientation detection.

So: failure **dives** into the mode (it is not an option on a notice), the operator draws a closed vector
curve whose points lie on the model surface, and Done hands straight to Free transform with **no**
re-detection and **no** print-angle scan.

This document is the design. **Nothing here is implemented yet.** Read the engine section first, because it
decides whether the rest can be built in this repo at all — it cannot.

## 1. What a rim has to be

`DentalRim` (`vendor/mixo-geocore/host/dental/dental.ts:6`) is the gate. Every `DentalPolicy` carries one
(`dentalPolicy.ts:23`), so there is no route into Step 2 without a complete rim:

| Field | Hand-drawn source |
| --- | --- |
| `points: Float32Array` | the drawn loop, unit-local, first point not repeated |
| `centroid: Vector` | mean of the points |
| `openingDirection: Vector` | the loop's plane normal, signed outward through the opening |
| `tangent`, `bitangent` | an orthonormal basis of that plane |
| `boundaryKind` | `'projection-fallback'` (see below) |
| `visibilityMask: Uint8Array` | **96 × 96 = 9216 bytes. This is the problem.** |
| `visibilityResolution`, `visibilityMin`, `visibilityMax` | the mask's grid and its 2D bounds in the rim frame |
| `front?: Vector` | omitted — it exists for pose estimation, which this flow switches off |

The first five are ordinary vector arithmetic over the drawn loop. `rimScalars()`
(`dentalEngine.ts:310`) already serialises exactly this layout, and `rimOf()` reads it back, so the host is
plainly allowed to *construct* a rim rather than only receive one.

### `boundaryKind` is not an authority gate — measured, not assumed

`dental.ts:7` says "Only a paired lower-edge loop may authorize automatic dental supports", which reads like
a hard gate on `boundaryKind`. It is not one in practice. Orienting the shipped reference aligner and
printing its rim gives:

```
RIM points 158  boundaryKind projection-fallback  visibilityResolution 96
mask bytes 9216  mask set 5089  front undefined
```

The reference aligner — the fixture the whole dental flow is built on — already runs on a
`projection-fallback` rim. The only code that treats the two kinds differently in this repo is
`src/components/viewport/dentalLayers.tsx:137`, which declines to draw the rim overlay for a fallback rim.
So a hand-drawn rim can honestly be `'projection-fallback'`: it claims no detection it did not earn, and it
is in the same class as what already ships. (That overlay line is worth revisiting separately — a hand-drawn
rim is the one case where the operator most wants to see the rim they drew.)

### The visibility mask cannot be produced here, and it is not optional

Two facts, the second measured.

**No engine entry point builds a mask.** Across the whole binding surface (`dentalEngine.ts:180`–`275`:
`GeometrySession`, `DentalEngine`, `DentalInternals`) the mask only ever comes *out* of orientation, via
`DentalOrientResultLike.take_visibility_mask()` (`dentalEngine.ts:22`). Every consumer —
`dental_legacy_fill` (`:215`), `dental_allowed_vertices` (`:250`) — takes it as an argument the host already
has. There is no `mask_from_rim(mesh, frame)`.

**And it is read even when the area is the operator's own paint.** The hope was that `manualArea` mode
ignores it, since a painted area "permits contacts only" and `manualAreaPolicy` starts empty. Calling
`dental_allowed_vertices` on the reference aligner with one allow stamp, varying only the mask:

| `manualArea` | mask | allowed vertices (of 186 976) |
| --- | --- | --- |
| true | the real mask | **1804** |
| true | all zero | **0** |
| true | all one | **2018** |
| false | any of the three | 0 |
| either | zero-length | throws `INVALID_LENGTH` |

The mask gates the paint. A blank mask means the operator paints and **nothing is ever permitted** — a
silent dead end with no error. An all-ones mask permits *more* than the real opening can reach, which is a
print-safety fault: supports admitted where the cavity opening does not see the surface. And the array
length is validated, so the field cannot be dodged.

### Therefore: this feature needs geocore

The mask is a 96 × 96 orthographic raster of projected mesh depth in the rim frame
(`docs/superpowers/plans/2026-10-24-dental-rework.md:28`: "formed from projected mesh depth wherever any
surface is visible, not an independently segmented trim footprint"). Three ways, and only one is sound:

1. **A new geocore call** — `dental_rim_from_points(positions, indices, points, profile)` returning the same
   `rim_scalars` + `take_rim_points` + `take_visibility_mask` shape an orient result already returns, built
   by the engine's own rasteriser. **Recommended.** One source of truth, the mask matches what every
   consumer expects by construction, and it stays correct across engine versions. The host side then becomes
   small: send the drawn loop, store the rim it gets back.
2. **Reimplement the raster in TypeScript.** A second source of truth for a safety-relevant mask, which must
   track the Rust rasteriser through every engine bump, with no test that can prove agreement beyond the
   fixtures we happen to have. The table above shows what being wrong costs in each direction: nothing
   works, or too much is allowed. Not worth it.
3. **Ship a blank or full mask.** Not viable — see the table. Listed only so nobody tries it.

**The UI is the smaller half of this feature.** Until the geocore call exists, rim define mode can be built
and demonstrated but cannot produce a usable aligner. That ordering is the main thing to decide.

## 2. The flow

Orientation fails → **rim define** (automatic, no notice to dismiss) → operator draws and closes the loop →
**Done** → **Free transform**, with auto-orientation off → `Next` → Step 2 as usual, on a
`manualAreaPolicy` whose rim is the drawn one.

What "no auto detect" switches off, concretely:

- No second `orientDentalAligner` call. The rim is the operator's, and re-running detection would either
  fail again or contradict them.
- No print-angle scan (`startScan`). The scan needs the aligner's own frame from a detected arch front; a
  hand-drawn rim has no `front`. So Step 1 for this aligner has no dial — Free transform only.
- No "Use detected" key: there is nothing detected to use. It must be hidden, not merely disabled, because a
  disabled primary with no explanation is the worse of the two.
- `detected.current.rotation` stays `undefined`, which the existing code already treats as "uncertain".

### Do not fabricate a proposal's diagnostics

`next()` refuses on `!proposal`, so the obvious shortcut is to send `dentalOriented` with a synthesised
`{ kind: 'proposal', rim: drawnRim, diagnostics }`. The trap is `DentalDiagnostics`
(`vendor/mixo-geocore/host/dental/dental.ts`): `confidence`, `floorOffsetRatio`, `axialVarianceRatio` and
`crossCheck` are **measurements**, and a hand-drawn rim has no honest value for any of them. They are read
and shown — `src/dental/orientationEvidence.ts:34` turns `crossCheck` and `floorOffsetRatio` into the
operator-facing evidence, and `src/state/project.ts:426` persists them. Filling them with zeros or ones
would put invented numbers in front of the operator in the "Why this angle" tool and into the saved project.

So the rim must reach `next()` without pretending to be a detection: either `dentalProposal` gains a shape
that says "operator-defined, no diagnostics" (diagnostics optional, and the evidence UI says the rim was
drawn), or the drawn rim lives in its own session field and `next()`'s guard accepts either source. The
second is smaller and keeps detection's type honest. Either way `next()`'s guard changes from "is there a
proposal" to "is there a rim", which is what it actually needs.

A consequence worth stating: the `u7` type row shipped in `f50fe73` becomes **unreachable on the failure
path** once this lands, because the failure notice is replaced by the mode. It stays reachable on the
mismatch notice, which is its other half. That is fine, but it should be a deliberate deletion rather than
dead code left behind.

## 3. The mode's UI

House style is `mixo-app-style`: this is a **tool mode**, so it gets a red hairline frame around the
viewport, a badge top-left naming the mode and the current tool *in words*, and one bar top-right ordered
tool control → options → contextual actions → **Done** as the single primary.

### Tools, and why not "Paint"

The style rule is explicit that two tools with similar gestures get different words, and that
Paint/Erase/Brush are reserved for marking a surface while Select/Drag over are for picking objects. Placing
rim anchors is neither. Two tools:

- **Place** — click on the model adds an anchor at the surface hit.
- **Adjust** — drag an existing anchor; it stays on the surface.

### Anchors, and the curve between them

An **anchor** is what the operator places and can move: a unit-local surface point plus its surface normal.
The rim's `points` array is **not** the anchors — it is the curve resampled along the surface between them,
because `DentalRim.points` is a dense closed loop (the reference rim has 158 points) and a dozen anchors
would make a polygon, not a rim.

Between two anchors the curve must follow the model, not cut through it. Two options:

- **Resample the chord and project each sample onto the surface** along the loop's current opening
  direction, falling back to nearest-surface. Cheap, predictable, and can drift on a strongly concave
  stretch — which the operator sees and fixes by adding an anchor. **Recommended**, with the sample spacing
  a profile constant so the point count lands near what detection produces.
- **A true geodesic along the mesh.** Correct everywhere and a great deal more work; worth revisiting only
  if projection proves visibly wrong in use.

Anchors are **content, not UI accent**, so they are red `#7f0019`: solid for a placed anchor, see-through for
the preview anchor under the pointer. The drawn curve is the same red hairline; the closed loop reads as one
shape.

### Closing the path

- **Close path** is a visible button in the bar, enabled from three anchors (fewer has no interior).
- Clicking the first anchor closes it too — the gesture is the shortcut, the button is the house requirement
  that every shortcut also has one.
- Closing **validates** before Done lights up, and each failure says so in plain words in the badge rather
  than leaving a dead button: at least three anchors; no self-intersection when projected into the loop's own
  plane (a figure-eight has no interior, so the mask would be meaningless); a non-degenerate enclosed area;
  anchors not collinear, or the plane — and so `openingDirection` — is ill-conditioned.
- The one genuinely ambiguous quantity is the **sign** of `openingDirection`: a plane normal has two
  directions and only one points out through the opening. Deciding it from the loop's winding as drawn would
  silently depend on which side the camera happened to be on. Better: choose the direction with less mesh in
  front of it (cast from the centroid both ways and compare hits), and *show* the choice as an arrow the
  operator can flip, with the flip as a visible button. This is the detail most likely to produce a
  confidently wrong rim, so it should not be inferred silently.

### Camera only — never the model

The owner's explicit concern, and the house rule already answers it: **where the drag starts decides.** On
the model, the drag is the tool; on empty space, it orbits the camera as always. No held key, no right-drag,
and the cursor shows which by drawing the anchor ring only over the model.

The model itself must not rotate in this mode: the **rotate gizmo is hidden** while defining the rim. The
operator is looking, not orienting — orienting is the next step, which is exactly why Done leads to Free
transform. Anchors are stored unit-local, so even an accidental model rotation would not corrupt them, but
allowing it would blur two steps the flow deliberately separates.

Drawing a lower rim means looking from underneath, so the standard view group (Fit view, Bottom view) stays
available at the viewport's top right, under the mode's own toggle, per the style rules.

### Undo

Every anchor placed, every anchor moved, the close, a delete and a clear must each be **one** step on the
app's existing history — not a private stack inside the mode. A private stack is the trap here: the app's
Undo key would then reach past the mode into the previous step's work while the mode's own button undid
something else, and the two would interleave unpredictably. One stroke of Adjust is one entry, not one per
pointer move, the same way a paint stroke is one entry.

Visible controls, since the house rule requires a button beside every shortcut: **Delete point**
(`.danger` outline, only when an anchor is selected — never a filled red), **Clear** (plain), and the app's
own Undo.

### Mechanics this builds on

Surveyed and spot-checked in the code, because three of the owner's four worries turn out to be answered by
machinery that already exists.

**Placing an anchor is the gesture the app already has.** Picking goes through `rustRaycast`
(`src/components/viewport/rustRaycast.ts:17`), installed as the `raycast` prop on the model mesh
(`UnitObject.tsx:304`), which calls the Rust engine's `session.pick` and pushes a `THREE.Intersection` with
`point` in **world** space and `face.normal` in **local**. A miss pushes nothing, so r3f fires
`onPointerMissed`. `clickModel` (`UnitObject.tsx:268`) and `paint` (`:195`) already do exactly what an anchor
needs — `paint` converts with `event.object.worldToLocal(event.point.clone())`, and `onAddContact`
(`App.tsx:919`) converts world → unit-local with `inverseTransformPoint`/`inverseTransformDirection`. An
anchor is one of those hits, kept.

The renderer-free `ViewportPort` seam (`vendor/mixo-geocore/editing/ViewportPort.ts:54`) has a `pick` that
returns exactly the `SurfacePick { point, normal, triangle, distance }` this mode wants, but in production
only `brushView()` is used and `useScreenBrush.ts:84` constructs the port with `mesh: () => undefined`, so
its `pick` always returns `undefined` there. Worth knowing before reaching for it: the port is the cleaner
seam and the one mixomesh would want, but it is not wired for picking today.

**Camera-only is already the house mechanism, not something to invent.** `OrbitControls` is drei's with
`makeDefault` and `enabled={!dragging}` (`ObjectViewport.tsx:127`). Three existing ways the camera is kept
from stealing a drag, and the mode should reuse the third:

1. The gizmo sets `dragging` from `'dragging-changed'` (`ObjectViewport.tsx:74`).
2. Paint sets `controls.enabled = false` in `beginStroke` (`UnitObject.tsx:152`) and restores it on a
   window-level `pointerup`/`pointercancel`/`blur` (`:153`).
3. **`DragOver.down(button, at, brush, onObject)` returns `false` for a press on empty space and leaves it
   to the camera** — `vendor/mixo-geocore/editing/dragOver.ts:49`: "A press on empty space belongs to the
   camera". Right and middle drags always orbit (`stroke.begin` only accepts button 0,
   `editing/stroke.ts:35`).

So "where the drag starts decides" is not a new rule to build — it is `onObject`, already written and in use.

**The model cannot rotate in this mode, for free.** `gizmoShown(gesture, gizmoMode, rotationGizmo)`
(`ObjectViewport.tsx:33`) returns a gizmo only when `rotationGizmo` is on, or when
`gesture.kind === 'none'`. A rim-define gesture is neither, so a new gesture kind hides the gizmo **with no
new flag**. `rotationGizmo` is `orienting && free.free` (`App.tsx:1434`) — Step 1 Free transform — which is
precisely the next step, so the gizmo appearing again *is* the handover.

**Undo already has the two things this needs.** History is snapshot-based:
`SceneHistory { past, present, future, open? }` (`src/state/history.ts:3`), `HISTORY_LIMIT = 100` (`:16`),
driven by `withSceneCommand(history, command, coalesce?)` (`:42`) through `dispatch(command, edit)`
(`App.tsx:184`). Two mechanisms matter here:

- **One gesture, one entry.** A paint stroke dispatches nothing while it runs: stamps pile up in refs
  (`UnitObject.tsx:104`) and are handed over once in `strokeEnded` (`:131`) as a single
  `dental/stamps/add` — `App.tsx:862`, commented "One stroke is one undo step". An Adjust drag follows the
  gizmo's shape instead: move the handle live, dispatch one `transform`-like command on release
  (`ObjectViewport.tsx:77`). Discrete bursts coalesce by `edit` key via `history.open`.
- **A per-step undo floor already exists.** `undoFloor` (`App.tsx:216`) is set when a dental step starts,
  `canUndo(history, floor)` (`history.ts:68`) stops undo escaping the step, and `restoreStep()`
  (`App.tsx:262`) puts the step back as one entry. So the mode gets step-scoped undo and a Restore step
  key without inventing anything — which is the whole reason not to keep a private anchor stack.

`offerUndo` (`App.tsx:275`) is **not** history: it shows a 6-second "Undo" toast for something already done
(`editing/toast.ts:4`). Clear and Delete point should use it, the way `clearManual` does.

**Drawing the curve: less exists than you would hope.** There is **no fat-line (`Line2`/`LineGeometry`)
usage anywhere, no `THREE.Points` overlay, and no draggable in-scene handle** — confirmed by grep. Two
consequences:

- The curve itself is nearly free: `DentalRimOutline` (`dentalLayers.tsx:128`) is already a rim-polyline
  renderer — two stacked `<lineLoop>` over a geometry whose `position` attribute is `rim.points.slice()`,
  nudged along `openingDirection * 0.035`, `renderOrder={17}`, `depthTest={false}`,
  `raycast={() => undefined}`. The live drawing overlay is that component with an open loop.
- The **anchor handles have no precedent**. The nearest things are `EditPreview`'s hover ring
  (`<torusGeometry>`, `supportLayers.tsx:34`), `CustomisedMarks` (an `<instancedMesh>` of torus,
  `:246`) and `UnresolvedBubbles` (drei `<Html>` buttons anchored at 3D points,
  `UnresolvedBubbles.tsx:46`) — which are click targets, not draggable. So anchors are an instanced torus or
  sphere picked by the same `rustRaycast` path, and **Adjust is the one genuinely new piece of interaction
  in this mode.** Plan for it accordingly.
- **Trap:** `<line>` in JSX is the **SVG** element. Every mark in this scene uses `lineSegments` or
  `lineLoop` for that reason — the comment is at `PrintAngleArc.tsx:73`. A `lineSegments` arc wants two
  points per segment, not a strip.

**Adding the stage is a well-trodden path.** `DentalStage = 'type' | 'aligner' | 'area' | 'review'`
(`editingMode.ts:20`), augmented onto `EditSession` by a module declaration (`:73`). A `'rim'` stage means:
the union, a `dental-rim` member of `DentalGesture` (`:60`) and `dentalGesture()` (`:220`), the transitions
in `reduceDental` (`:125`) — `dentalOrientFailed` leading to `'rim'` instead of a notice, a `rimDefined`
event leading to `'aligner'` with Free transform on, and `backDental` (`:189`) learning the way out — a
branch in `DentalBar.tsx` (its early returns, `:74`–`:114`) and the panel chain in `App.tsx:1488`, plus the
mode's own commands in `registerCommands` (`editingMode.ts:294`) and keys (`:258`). `send()` already clears
per-step notices on a stage change (`App.tsx:235`).

## 4. Modularity — the loop is not aligner-only

The owner's refinement, and it changed where this lives:

> Becuz this rim loop may need elsewhere too on other models or types … This time should be a close loop
> drawing function on model but if we modulize it it can be an open loop function to reuse elsewhere

So the drawing is **not** a dental feature with a reusable corner; it is a general capability whose first
consumer is the dental rim. A closed run of anchors on a surface and an open one differ only in whether the
last anchor leads back to the first, so they are one type with a `closed` flag — a rim loop, a measuring
line, a trim line or a marked run on any model are the same list.

**Built, tested and portable: `src/core/surfacePath/`.** `src/core` is the tree that must stay free of
React, three.js, the DOM and app state — `src/core/imports.test.ts` enforces it — which is also what makes
it the piece mixomesh can take. Four modules:

| Module | Role |
| --- | --- |
| `path.ts` | `SurfaceAnchor`, `SurfacePath { anchors, closed }`, `segments`, and the pure edits: append, insert, move, remove, close, open. Every edit returns a **new** path, so one edit is one undo step. |
| `frame.ts` | A closed path's fitted plane: centroid, normal, orthonormal basis, plane-projected area, perimeter — and `facingNormal`, which turns the normal to a side the **caller** names. |
| `validate.ts` | `TOO_FEW_POINTS`, `COLLINEAR`, `DEGENERATE_AREA`, `SELF_INTERSECTING` as codes, not sentences, because this tree carries no i18n. |
| `resample.ts` | The dense surface-following curve between anchors, projecting each sample through a callback the caller supplies. |

Three decisions in there worth knowing, because each was a trap:

- **The plane is not fitted by Newell's method**, the usual answer for a nearly planar polygon. Newell sums
  *signed* areas, so a loop that crosses itself cancels: a symmetric bowtie gives an exactly zero normal,
  the frame comes back undefined, and the loop gets reported `COLLINEAR` — the one diagnosis a reader
  cannot act on, for the one shape they most need told about. The plane is instead spanned by the anchors
  furthest apart, which no winding can cancel, and the area is measured separately in that plane. The
  bowtie now reports `SELF_INTERSECTING` **and** `DEGENERATE_AREA`, and never `COLLINEAR`.
- **An open path is asked only for its two ends.** It lies in no particular plane, encloses nothing, and
  may legitimately double back — so none of the loop refusals apply. That is what lets one module serve
  both shapes honestly rather than pretending a line is a degenerate loop.
- **Projection is injected, not imported.** Putting a sample back on the surface needs the mesh, which this
  tree cannot have. In the app the callback is the same pick the rest of the editor uses; in tests it is a
  function with a known answer, which is why the resampling is testable at all.

Removing an anchor from a closed path with three left is **refused** rather than silently reopening the
loop: the operator said "this is a loop", and discarding that as a side effect of a delete would leave no
sign it happened.

### The dental half

`src/dental/rim/` is then the consumer: it turns a closed `SurfacePath` into a `DentalRim` through the
engine call, and owns the stage, its panel and its viewport overlay. The dental-specific part is the rim and
its mask; the drawing is not.

## 5. Verification

- Pure unit tests on the geometry. **Done: 39 tests across `src/core/surfacePath/`**, covering the anchor
  edits and their refusals, the fitted plane and its area (including the bowtie that Newell's method gets
  wrong), every validation code, the sliver and near-line cases either side of both thresholds, and the
  resampling with a projection that succeeds, one that always fails, and a bounded silly spacing.
  `src/core/imports.test.ts` passes, so the module is portable.
- Still to write: the opening-direction sign against a fixture whose answer is known, and the serialised rim
  round-tripping through `rimScalars`/`rimOf` unchanged. Both need the engine call.
- A golden comparison once the geocore call exists: draw a loop along the reference aligner's *own* detected
  rim points and check the returned mask against the detected one. That fixture makes the hand-drawn path
  checkable against ground truth, which is the strongest test available here.
- A walk section for the mode: dive in on a model that fails, place anchors, close, Done, land in Free
  transform, reach Step 2. Checks lean on `data-ui` names, never prose.
- The real-scan gate, since this touches the dental engine path.

## 6. Open for the owner

1. **The geocore call is the blocker.** `dental_rim_from_points` has to exist before this flow can produce a
   usable aligner. Does that land first, or does the UI get built against a stub so the two can be reviewed
   separately? My recommendation: specify the call now, build the host-side geometry and the mode against
   it, and keep Done refusing with a plain sentence until the engine answers — the UI is reviewable on its
   own and the stub never pretends to work.
2. **Anchors to curve: projection or geodesic.** Recommended projection, as above.
3. **The opening-direction sign**: inferred with a visible, flippable arrow, as above — or asked outright
   ("which side is the opening?") as one step of the mode.
4. **The `u7` type row on the failure notice** becomes unreachable once the mode takes over that branch.
   Delete it then, or keep the notice as a fallback for when the mode itself cannot run?
5. **`dentalLayers.tsx:137`** hides the rim overlay for a `projection-fallback` rim, which would hide the
   operator's own drawn rim once they leave the mode. Show it for a hand-drawn rim?
6. **Where the drawn rim lives in the session** — an operator-defined variant of `dentalProposal`, or its
   own field. Recommended: its own field, so detection's diagnostics stay measurements.

## 7. What is already in place, and what is genuinely new

Worth stating plainly, because it sets the size of the job. Already there and reusable: surface picking
(`rustRaycast`), the press-on-empty-space-orbits rule (`dragOver.down`'s `onObject`), gizmo suppression by
gesture kind (`gizmoShown`), one-gesture-one-undo-entry plus a per-step undo floor, the rim polyline
renderer (`DentalRimOutline`), and the whole pattern for adding a dental stage with its panel and commands.

Genuinely new, and the state of each:

- **The anchors → surface-following curve geometry** — built and tested as `src/core/surfacePath/`, pure
  and portable, 39 tests.
- **Draggable in-scene anchor handles** — not started. Nothing in the app is draggable except the
  `TransformControls` gizmo, so this is the one genuinely new piece of interaction.
- **The stage, its panel and its overlay** — not started. A well-trodden path, per the mechanics above.
- **The opening-direction sign** — the geometry is in place (`facingNormal` turns the normal to a side the
  caller names and refuses to guess); the arrow and its flip are not built.
- **The geocore call for the visibility mask** — specified for the other repo in
  `docs/handoff/geocore-rim-from-points.md`. Still the one that gates a usable aligner.
