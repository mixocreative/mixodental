# Rim define mode — the operator draws the rim when detection cannot

> **BUILT AND SHIPPED, 2026-11-06.** Rim define mode works end to end: a shape with no findable rim
> opens it, the operator places anchors, drags them, closes the loop and presses Done, and the drawing
> becomes the aligner's rim. The blocker this document was written around — no engine entry point could
> build a visibility mask from arbitrary points — was closed by **geocore engine 61**
> (`dental_rim_from_points`, geocore `8bd2430`).
>
> The sections below are kept as the reasoning that got there, not as a to-do list. **Read the block
> under this one first**: it is the shipped behaviour in one place, and where the sections disagree
> with it, it wins.

## As shipped

Everything a maintainer needs before reading anything else. A full review of this document on
2026-11-06 found that its corrections had been *appended* rather than folded in, so whether a
sentence was still true depended on how far down a subsection the reader got. This block is the fix
for that, and the sections below are history.

- **Entry.** Rim define mode opens on one condition only: orientation **ran and found no rim**
  (`result.kind === 'failed'`). The two other failures — no profile chosen, and no result at all from
  the worker — are "we could not look", not "this shape has no rim", so they keep the old notice and
  do not open a drawing mode. The event is `dentalRimNeeded`, not `dentalOrientFailed`, which still
  exists and still does what it always did.
- **The way back in.** Step 1 offers **Draw the rim** (`dental.rim.enter`, event `dentalRimReopen`)
  to any read aligner with no detected orientation. Before it existed the mode was a one-way door and
  three faults came of that: Cancel stranded the operator, the drawing it left behind could not be
  reached, and a rim whose side the engine could not settle could never be redrawn.
- **Cancel keeps the drawing.** It leaves the mode; it does not throw the work away. Draw the rim
  comes back to it. (This document used to say Step 1 kept "the notice that sent you here"; the
  handover deliberately drops that notice, so there was never one to keep.)
- **Done is final for the drawing.** It turns the draft into the unit's manual-area policy and clears
  the draft. What marks an aligner as hand-drawn from then on is that policy — `next` asks
  `isManualArea(unit.dental)`. There is no session flag; one existed, `dentalRimOwn`, and it was
  deleted when re-entry made it wrong.
- **The drawing is `PrintUnit.rimDraft`**, scene state, so the ordinary history undoes each anchor.
  It **is** saved with the project and validated on the way back in.
- **The opening side.** When the engine reports `rim-side-uncertain` the host says so in the status
  line. `flip` is a parameter on the engine call with no control wired to it, and nothing persists
  the uncertainty, so a wrong side is corrected by drawing the rim again rather than by a toggle.
- **ONE TOOL, AND THE TARGET UNDER THE PRESS DECIDES** (`dental/rim/rimTarget.ts`, 2026-11-09).
  Place and Adjust are **gone**, and so are the P and A keys, so section 6's two-tool reasoning below
  is history: a press on a handle drags it, a press on the drawn line inserts a handle there and drags
  it in the same gesture, a press on bare model extends an open loop, and a press on bare model with
  the loop closed turns the view. The protection the two tools gave by accident still has to be paid
  for explicitly: the browser fires a `click` on every release, judged against the path from *before*
  the press, so a drag used to drop a stray handle where it ended (walk `u5d`). `rimTapAt` refuses a
  click that travelled further than `CLICK_TOLERANCE`, which is the rule the rest of the app's clicks
  already use.
- **THE DRAWN LINE IS THE PRESSED LINE**, which took a second fix on the same day. The draft layer drew
  straight chords between the handles while a press was resolved against the curve, and the gap goes as
  `R*theta^2/8`: invisible at the 3 mm spacing anchors were first seeded at (0.046 mm), but **1.14 mm on
  a 15 mm radius at 12 mm spacing - past the 1 mm the pick allows, so a press on the line the operator
  could SEE turned the camera instead of inserting a handle.** Both now walk one sampler,
  `spanCurve` in `core/surfacePath/spline.ts`, so they cannot drift apart again; `rimTarget.test.ts`
  asserts no point of the drawn line is dead, across the curvatures an arch has.
- **A DETECTED RIM IS REDRAWABLE**, so this mode is no longer only for shapes with no findable rim.
  Draw the rim seeds the draft from the detected loop (`dental/rim/seedFromDetected.ts`): a handle
  every 12 mm of arc and one wherever the rim turns 45 degrees, joined by a centripetal Catmull-Rom
  curve, capped at 48. It is a REPLACEMENT, not a lossless edit - the drawn loop's axis came back
  5.60 degrees from detection's on the reference aligner - and the command says so before the operator
  commits.
- **AN UNTOUCHED SEED IS RE-TRACED ON ENTRY; A TOUCHED DRAFT NEVER IS.** Draw the rim seeds the draft
  and `rim/clear` runs on Clear and Done only, so a seed survives Cancel - and re-orienting to a
  DIFFERENT detected rim used to leave this mode opening on a loop that traced the rim it replaced.
  Fixed by recording the one fact that cannot be recovered later: `PrintUnit.rimDraftSeeded`, set by
  the `rim/set` that seeds and dropped by the first `rim/set` that does not, so the first operator
  edit makes the drawing theirs for good. Entry re-seeds only a draft still carrying the flag, which
  destroys nothing and is idempotent when detection has not moved.
  **Why not a comparison.** Working it out afterwards needs a threshold ("is this draft near enough to
  the new rim?"), and clearing it unasked would silently destroy hand work - the `f10b512` class, worse
  than the staleness. **Why not on `SurfacePath`.** That type is deliberately generic and knows nothing
  about teeth; "traced from a detected dental rim" is not a property of a surface path.
  The flag GRANTS PERMISSION TO REPLACE a drawing, so it is gated on load rather than trusted:
  `normalizeUnit` takes it out of its own spread and re-adds it only as exactly `true` beside a draft,
  because `...(ok ? { x } : {})` after a whole-unit spread rejects nothing - the trap that function's
  own header warns about. A saved file cannot claim it over a loop the operator drew.
- **What is left:** a flip control, and the state it would need. See "What is left" at the end.


When automatic rim detection fails, the aligner is a dead end today: Step 1 says it could not be oriented,
and `Next` declines because Step 2's support area is built from a rim nobody found. The owner's answer
(2026-11-05) is to give the operator the rim:

> If loaded model cannot detect rim, it will dive into rim define mode, and when done go straight to free
> transform mode, no auto detect. … Which means self defined rim disabled auto orientation detection.

So: failure **dives** into the mode (it is not an option on a notice), the operator draws a closed vector
curve whose points lie on the model surface, and Done hands straight to Free transform with **no**
re-detection and **no** print-angle scan.

This document was the design, written before any of it existed. **It is now a record of what was built
and why** — see the banner above. Where a section still reasons in the future tense it is preserved as
written, because the reasoning is the point; where what shipped went a different way, the divergence is
marked at the place the superseded claim appears.

The engine section is still the one to read first, but for the opposite reason to the original: it
explains why this could not be built in this repo at all, which is why there is a geocore call.

## 1. What a rim has to be

`DentalRim` (`vendor/mixo-geocore/host/dental/dental.ts`) is the gate. Every `DentalPolicy` carries one
(`dentalPolicy.ts`), so there is no route into Step 2 without a complete rim:

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

The first five are ordinary vector arithmetic over the drawn loop. `rimScalars`
(`dentalEngine.ts`) already serialises exactly this layout, and `rimOf` reads it back, so the host is
plainly allowed to *construct* a rim rather than only receive one.

### `boundaryKind` gates authority, not visibility — measured, not assumed

`dental.ts` says "Only a paired lower-edge loop may authorize automatic dental supports", which reads like
a hard gate on `boundaryKind`. It is not one in practice. Orienting the shipped reference aligner and
printing its rim gives:

```
RIM points 158 boundaryKind projection-fallback visibilityResolution 96
mask bytes 9216 mask set 5089 front undefined
```

The reference aligner — the fixture the whole dental flow is built on — already runs on a
`projection-fallback` rim. The only code that treated the two kinds differently in this repo was
`DentalRimOutline` in `src/components/viewport/dentalLayers.tsx`, which declined to draw the rim overlay
for a fallback rim. So a hand-drawn rim can honestly be `'projection-fallback'`: it claims no detection it
did not earn, and it is in the same class as what already ships.

**That line is now deleted** — see the correction below.

#### Correction: the overlay gate was real, and it is gone

The parenthetical here first said the line was "worth revisiting separately". It was worth more than that:
it meant **a drawn rim left no mark on the model once the mode closed**. The operator placed anchors,
pressed Done, was told "Rim saved", and then saw bare surface. The drawing was saved and invisible.

Two things were wrong, and both are fixed:

- **The gate is deleted.** `boundaryKind` says whether a loop may AUTHORISE an automatic area, which
  `dental::legacy` enforces in Rust where it belongs. It says nothing about whether the loop is worth
  looking at, and both kinds are ordered mesh vertices sitting on the surface — `ProjectionFallback` names
  how the loop was *selected* (the inner ring of vertices near the end of the opening axis), not that its
  points were flattened off the model.
- **The colour was wrong too, and nobody could see it.** The loop drew in `--mark-area-permitted`, the
  AREA FILL colour. The legend the operator reads gives that colour to "Supports may grow here" and
  `--mark-area-edge` to "Edge of that area" — and this loop is that edge, the same colour
  `DentalRegionLines` gives the opening edge on a detected area. In Step 2 the operator paints the area in
  the fill colour, so a boundary wearing it would have vanished into the first stroke.

One correction to the scope, because the first write-up of this overstated it: `DentalRimOutline` is only
reached when the area policy is a MANUAL area (`UnitObject.tsx`). An aligner whose detection succeeded
takes the `two-contour` branch and draws `DentalRegionLines` — the real mesh edges of both contours, a
better boundary than this loop. So the reference aligner was never missing a boundary on its ordinary path.
What the gate hid was the manual-area branch: every drawn rim, and a manual area over a fallback rim.

Checked by walk `u5j`, which measures the rim colour on the model in Step 2 against a control taken before
the rim exists, with the legend's own swatch of that colour masked out. It was watched to fail (0 px) with
the gate in place and to pass (130 px) without it.

### The visibility mask cannot be produced here, and it is not optional

Two facts, the second measured.

**No engine entry point builds a mask.** Across the whole binding surface (`dentalEngine.ts`–`275`:
`GeometrySession`, `DentalEngine`, `DentalInternals`) the mask only ever comes *out* of orientation, via
`DentalOrientResultLike.take_visibility_mask` (`dentalEngine.ts`). Every consumer —
`dental_legacy_fill`, `dental_allowed_vertices` — takes it as an argument the host already
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
(`docs/superpowers/plans/2026-10-24-dental-rework.md`: "formed from projected mesh depth wherever any
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

### A drawn rim agrees with a detected one on the SIDE, not on the axis — measured

Worth stating plainly, because the obvious acceptance test does not close and it is not a bug. Feeding the
reference aligner's **own detected rim loop** back through `dental_rim_from_points` does not reproduce
detection's opening axis: the two sit **5.60° apart**.

The reason is that detection's axis is not the plane of the loop it traced. It is the shell's
least-variance axis from the floor rule; the loop comes afterwards. A drawn rim has only the loop, so the
loop's plane is the only axis it can honestly claim — and its frame, its raster bounds and its mask are all
that plane's throughout, which makes it self-consistent rather than approximate.

What agrees is the part that decides safety: the **side**. On the reference, floor offset −0.2337, well past
the profile's minimum. The masks come out 5104 cells set against detection's 5089, agreeing in 8919 of 9216
and differing in 297 around the silhouette margin — exactly the 5.6° of projection tilt. Both numbers are
pinned in the engine's reference test, so a change to either shows up as a failure rather than as drift.

So the acceptance question is "does the drawn rim put supports on the right side of the shell", not "is it
bit-identical to detection". The first is answered; the second was never achievable and should not be
asked for.

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

`next` refuses on `!proposal`, so the obvious shortcut is to send `dentalOriented` with a synthesised
`{ kind: 'proposal', rim: drawnRim, diagnostics }`. The trap is `DentalDiagnostics`
(`vendor/mixo-geocore/host/dental/dental.ts`): `confidence`, `floorOffsetRatio`, `axialVarianceRatio` and
`crossCheck` are **measurements**, and a hand-drawn rim has no honest value for any of them. They are read
and shown — `src/dental/orientationEvidence.ts` turns `crossCheck` and `floorOffsetRatio` into the
operator-facing evidence, and `src/state/project.ts` persists them. Filling them with zeros or ones
would put invented numbers in front of the operator in the "Why this angle" tool and into the saved project.

So the rim must reach `next` without pretending to be a detection: either `dentalProposal` gains a shape
that says "operator-defined, no diagnostics" (diagnostics optional, and the evidence UI says the rim was
drawn), or the drawn rim lives in its own session field and `next`'s guard accepts either source. The
second is smaller and keeps detection's type honest. Either way `next`'s guard changes from "is there a
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

**SUPERSEDED, 2026-11-09. There is one tool and it has no name, because the operator never chooses
it.** Two tools meant the gesture depended on what was in hand rather than on what was under the
pointer, and the cost was a dead control: Place over a closed loop could not act, because
`appendAnchor` refuses a closed path. The target under the press decides instead
(`dental/rim/rimTarget.ts`) — see "ONE TOOL" in **As shipped**. The naming rule this section argues
from still holds; it simply has one fewer thing to name.

### The two ways out: Cancel and Done

This is a **mode**, not a step, so its footer is not the step dock's arrow-and-Next pair. The way out is
worded, the same as the way on: **Cancel | Done**, with a gap rather than a seam, because the two are
opposites and a seam between opposites invites the wrong press. Cancel carries **Esc**.

**CORRECTED. Cancel costs less than this section said, and the sentence it shipped with was false.**
It promised that "Step 1 keeps the notice that sent the operator here" — and the handover deliberately
drops that notice, with a written reason: a line saying detection failed, sitting over a dock asking the
operator to draw, would be telling them off for arriving. There was nothing to keep, and the hint said
so in three languages.

What Cancel does: it leaves the mode and **keeps the drawing**. Step 1 then offers **Draw the rim** to
come back to it. Before that control existed, Cancel left the operator on a screen with no rim, no
notice and a Next that told them to choose another file — a worse dead end than the one this feature
was built to remove, and the drawing stayed painted on the model with no way to reach or remove it.

Esc here leaves the **mode** and nothing more. See `docs/design/2026-11-05-back-out-one-level.md` for the
rule this follows (a tool goes down, then a mode is left, then the flow) and why the step arrow is a
different control from the mode's Cancel.

### Anchors, and the curve between them

An **anchor** is what the operator places and can move: a unit-local surface point plus its surface normal.
The rim's `points` array is **not** the anchors — it is the curve resampled along the surface between them,
because `DentalRim.points` is a dense closed loop (the reference rim has 158 points) and a dozen anchors
would make a polygon, not a rim.

Between two anchors the curve must follow the model, not cut through it. Two options:

- **Resample the chord and project each sample onto the surface.** Recommended, and taken — but **not
  the way this bullet described**, which is worth stating because the difference is visible on a rim's
  side walls. It proposed projecting along the loop's opening direction with a nearest-surface fallback.
  What shipped projects along the **interpolated surface normals of the two bracketing anchors**, by a
  ray cast from a 2 mm back-off, inward first and then outward, double-sided. The anchors themselves are
  kept exactly and never re-projected, and a sample whose cast misses keeps its straight-line position
  rather than failing the rim. The spacing is a **module** constant (`RIM_SAMPLE_SPACING_MM`), not a
  profile one: no profile has needed its own. Drift on a strongly concave stretch is still real, and the
  operator still fixes it by adding an anchor.
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
  silently depend on which side the camera happened to be on. This is the detail most likely to produce a
  confidently wrong rim, so it must not be inferred silently.

  **SETTLED, and not the way this section first proposed.** The original suggestion here was to cast from
  the centroid both ways and take the direction with less mesh in front of it. The engine work
  (`mixo-geocore`, engine 61) rejected that with a reason worth keeping: through an aligner's *thin shell*
  each direction hits one wall, so the two counts barely separate and the answer swings on wherever the
  centroid happens to land.

  What it does instead is reuse `orient::floor_offset` — the measure **detection already uses for this
  exact question**. The axis-facing floor area, area-weighted at the 40/60 quantiles, leans toward the
  closed end, and the cavity opens away from it. That is winding-free and camera-free, and it means a drawn
  rim agrees with a detected one *by construction* rather than by coincidence. Where the floor leans too
  little (below `profile.thresholds.floor_offset_ratio_min`) the engine still returns the rim, but with
  `reason = "rim-side-uncertain"` and the signed measure, so **the host shows the flip control instead of
  the engine guessing quietly**.

  The operator's flip is a **boolean parameter of the call** (`dental_rim_from_points(model, points,
  flip, profile)`), and the engine applies it and reports `flipped` back. An earlier draft of this
  correction said `facingNormal(frame, facing)` in `core/surfacePath/frame.ts` applies it; that is
  wrong, and `facingNormal` has no production caller at all — the side is the engine's to decide, which
  is the whole point of the paragraph above. The host's remaining part is to SHOW the flip, and today
  that is a sentence in the status line rather than a control.

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
(`.danger` outline — never a filled red), **Clear** (plain), and the app's own Undo.

**Built, with two deliberate departures from the paragraph above.**

- **Shown always, enabled only with an anchor picked**, rather than appearing and disappearing. Clear and
  Adjust sit on the same panel shown-and-disabled when they have nothing to act on, and a control that
  came and went as the operator touched anchors would make the row jump under the pointer. The
  `disabledReason` carries what the appearing-and-disappearing version would have taught silently.
- **No `offerUndo` toast.** This section asked for one, like `clearManual`. Clear does not have one either,
  and it is the destructive one: the drawing is scene state, so the app Undo already covers both, and a
  toast for taking one point out of a visible loop would be noise beside an edit the operator can see.

**How an anchor is picked.** Adjust picking an anchor up is also what picks it out — one gesture, two
uses, and no third tool in a mode whose whole job is a single loop. The pick lives in the SESSION, not the
scene, because selecting is not an edit and must not land on the history. It is let go of when the tool
changes (it belongs to Adjust) and on either way out of the mode, but **it survives a view turn**: a rim
runs all the way round a shell, so the operator turns the model constantly to reach the far side, and a
pick that fell off every time they looked from another angle would make Delete point unusable exactly
where it is needed most.

**The refusal is answered in words.** `removeAnchor` will not take the third anchor out of a closed loop —
opening the loop silently would throw away what the operator meant by closing it — so the button says
*"A closed rim needs at least three points. Press Clear to start this rim again."* rather than doing
nothing when pressed. There is no control that opens a loop back up, so Clear is the honest advice.

Checked by `rimStage.test.ts` (both refusals, the key, and the pick being let go of) and by walk
`u5e2`–`u5e5`. `u5e5` is the one that earns the claim: a point count reads the same whichever anchor went,
so it presses where the deleted anchor used to be and requires Delete point to stay OFF, then presses a
corner never touched and requires it back ON. It was watched to fail against a deliberately wrong index,
which `u5e4` (the count) passed.

### Mechanics this builds on

Surveyed and spot-checked in the code, because three of the owner's four worries turn out to be answered by
machinery that already exists.

**Placing an anchor is the gesture the app already has.** Picking goes through `rustRaycast`
(`src/components/viewport/rustRaycast.ts`), installed as the `raycast` prop on the model mesh
(`UnitObject.tsx`), which calls the Rust engine's `session.pick` and pushes a `THREE.Intersection` with
`point` in **world** space and `face.normal` in **local**. A miss pushes nothing, so r3f fires
`onPointerMissed`. `clickModel` (`UnitObject.tsx`) and `paint` already do exactly what an anchor
needs — `paint` converts with `event.object.worldToLocal(event.point.clone)`, and `onAddContact`
(`App.tsx`) converts world → unit-local with `inverseTransformPoint`/`inverseTransformDirection`. An
anchor is one of those hits, kept.

The renderer-free `ViewportPort` seam (`vendor/mixo-geocore/editing/ViewportPort.ts`) has a `pick` that
returns exactly the `SurfacePick { point, normal, triangle, distance }` this mode wants, but in production
only `brushView` is used and `useScreenBrush.ts` constructs the port with `mesh: => undefined`, so
its `pick` always returns `undefined` there. Worth knowing before reaching for it: the port is the cleaner
seam and the one mixomesh would want, but it is not wired for picking today.

**Camera-only is already the house mechanism, not something to invent.** `OrbitControls` is drei's with
`makeDefault` and `enabled={!dragging}` (`ObjectViewport.tsx`). Three existing ways the camera is kept
from stealing a drag, and the mode should reuse the third:

1. The gizmo sets `dragging` from `'dragging-changed'` (`ObjectViewport.tsx`).
2. Paint sets `controls.enabled = false` in `beginStroke` (`UnitObject.tsx`) and restores it on a
   window-level `pointerup`/`pointercancel`/`blur`.
3. **`DragOver.down(button, at, brush, onObject)` returns `false` for a press on empty space and leaves it
   to the camera** — `vendor/mixo-geocore/editing/dragOver.ts`: "A press on empty space belongs to the
   camera". Right and middle drags always orbit (`stroke.begin` only accepts button 0,
   `editing/stroke.ts`).

So "where the drag starts decides" is not a new rule to build — it is `onObject`, already written and in use.

**CORRECTED: the rim drag does not use any of it.** `startStroke` takes the rim branch and returns
before `brushStroke.begin`, so neither `DragOver.down` nor `createStroke` is involved and no button
number is latched. "Where the drag starts decides" is re-implemented by `grabAnchor` returning
`undefined` on bare surface. That is defensible, but it cost something: point 2 above is the mechanism
paint uses to take the camera out of its gesture, and **the rim drag did not do it**, so the view
orbited under every anchor drag until it was fixed. `stopPropagation` does not reach OrbitControls,
which listens on the canvas element — which is exactly why point 2 exists.

**The model cannot rotate in this mode, for free.** `gizmoShown(gesture, gizmoMode, rotationGizmo)`
(`ObjectViewport.tsx`) returns a gizmo only when `rotationGizmo` is on, or when
`gesture.kind === 'none'`. A rim-define gesture is neither, so a new gesture kind hides the gizmo **with no
new flag**. `rotationGizmo` is `orienting && free.free` (`App.tsx`) — Step 1 Free transform — which is
precisely the next step, so the gizmo appearing again *is* the handover.

**Undo already has the two things this needs.** History is snapshot-based:
`SceneHistory { past, present, future, open? }` (`src/state/history.ts`), `HISTORY_LIMIT = 100`,
driven by `withSceneCommand(history, command, coalesce?)` through `dispatch(command, edit)`
(`App.tsx`). Two mechanisms matter here:

- **One gesture, one entry.** A paint stroke dispatches nothing while it runs: stamps pile up in refs
  (`UnitObject.tsx`) and are handed over once in `strokeEnded` as a single
  `dental/stamps/add` — `App.tsx`, commented "One stroke is one undo step". An Adjust drag follows the
  gizmo's shape instead: move the handle live, dispatch one `transform`-like command on release
  (`ObjectViewport.tsx`). Discrete bursts coalesce by `edit` key via `history.open`.
- **A per-step undo floor already exists.** `undoFloor` (`App.tsx`) is set when a dental step starts,
  `canUndo(history, floor)` (`history.ts`) stops undo escaping the step, and `restoreStep`
  (`App.tsx`) puts the step back as one entry. So the mode gets step-scoped undo and a Restore step
  key without inventing anything — which is the whole reason not to keep a private anchor stack.

`offerUndo` is **not** history: it shows a 6-second "Undo" toast for something already done
(`editing/toast.ts`). Neither Clear nor Delete point uses it — see the Undo section above for why.

**Drawing the curve: less exists than you would hope.** There is **no fat-line (`Line2`/`LineGeometry`)
usage anywhere, no `THREE.Points` overlay, and no draggable in-scene handle** — confirmed by grep. Two
consequences:

- The curve itself is nearly free: `DentalRimOutline` (`dentalLayers.tsx`) is already a rim-polyline
  renderer — two stacked `<lineLoop>` over a geometry whose `position` attribute is `rim.points.slice`,
  nudged along `openingDirection * 0.035`, `renderOrder={17}`, `depthTest={false}`,
  `raycast={ => undefined}`. **CORRECTED: the live drawing is NOT that component.** It is a separate
  `RimDraftLayer` — a `lineSegments` over straight chord *pairs* plus one sphere per anchor, a larger
  translucent sphere on the picked one, and a see-through sphere for the preview. `DentalRimOutline`
  renders the **saved** rim only. The two differ in a way that matters: the chord layer draws the
  straight lines between anchors, not the resampled surface curve the engine is given.
- The **anchor handles have no precedent**. The nearest things are `EditPreview`'s hover ring
  (`<torusGeometry>`, `supportLayers.tsx`), `CustomisedMarks` (an `<instancedMesh>` of torus,
  ) and `UnresolvedBubbles` (drei `<Html>` buttons anchored at 3D points,
  `UnresolvedBubbles.tsx`) — which are click targets, not draggable. **Adjust is the one genuinely new
  piece of interaction in this mode.**

  **CORRECTED: the anchors are not picked at all.** They are individually rendered spheres with
  `raycast={ => undefined}` on the group and on every one of them, because a marker that caught
  clicks would steal them from the surface. An anchor is picked from the **model** hit: the local point
  goes to `grabAnchor`, which returns the nearest anchor within `RIM_GRAB_REACH_MM` and `undefined` on
  bare surface. `closesLoop` works the same way against the first anchor, at a shorter reach. This
  distance-based pick is the mode's central new mechanism and the original sections never named it.
- **Trap:** `<line>` in JSX is the **SVG** element. Every mark in this scene uses `lineSegments` or
  `lineLoop` for that reason — the comment is at `PrintAngleArc.tsx`. A `lineSegments` arc wants two
  points per segment, not a strip.

**Adding the stage is a well-trodden path.** `DentalStage` (`editingMode.ts`), augmented onto
`EditSession` by a module declaration. A `'rim'` stage means: the union, a `dental-rim` member of
`DentalGesture` and `dentalGesture`, the transitions in `reduceDental`, `backDental` learning the way
out, a branch in `DentalBar.tsx` (its early returns) and the dock it renders, plus the mode's own
commands in `registerCommands` and keys. `send` already clears per-step notices on a stage change.

**CORRECTED in three particulars, all of which would send a maintainer to the wrong place.**

- The shipped union is `'type' | 'aligner' | 'rim' | 'area' | 'review'`.
- The entry transition is **not** on `dentalOrientFailed`. That event still exists and still does what
  it always did: stay in `'aligner'`, ready, notices kept. A **new** event `dentalRimNeeded` sets the
  `'rim'` stage, and a third, `dentalRimReopen`, is Step 1's way back in. All three are live and mean
  different things, which is the distinction the "As shipped" block opens with.
- **Done does not turn Free transform on.** The exit event is `dentalRimDefined`, and it touches
  nothing to do with Free transform; `useFreeTransform` resets to off on every stage change and only an
  operator press turns it on. After Done the operator lands in Step 1 with the gizmo **off**. The
  owner's words were "when done go straight to free transform mode"; what shipped puts them one press
  away from it, and this document should not have claimed the press was automatic.

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

> **PRE-ENGINE HISTORY.** This section was written before `dental_rim_from_points` existed and still
> asks for work the engine landing made unnecessary or already did. The shipped coverage is listed in
> section 7 and in "As shipped" at the top: `rimStage.test.ts`, the four `surfacePath` test files,
> `drawnRim.test.ts`, `rimDraftGeometry.test.ts`, and walk `u5`–`u5k3`. One real gap survives and is
> named in "What is left": nothing in this repository produces a `rim-side-uncertain` rim against the
> real engine, so the side-uncertain path has no end-to-end check.

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

## 6. Open for the owner — answered, except where marked

> **PRE-ENGINE HISTORY.** This heading used to say "all answered" over items that were still
> questions. Two of them have since been answered by what shipped rather than by this section, and
> they are marked below.

1. **The geocore call was the blocker, and it landed.** ANSWERED as recommended: the mode was built
   against a Done that refused in a plain sentence, the engine followed, and the refusal was deleted
   rather than left as a flag set permanently true. The UI was reviewable on its own throughout and the
   stub never pretended to work, which is what that recommendation was for.
2. **Anchors to curve: projection or geodesic.** Recommended projection, as above.
3. **The opening-direction sign**: inferred with a visible, flippable arrow, as above — or asked outright
   ("which side is the opening?") as one step of the mode.
4. **The `u7` type row on the failure notice** becomes unreachable once the mode takes over that branch.
   Delete it then, or keep the notice as a fallback for when the mode itself cannot run?
5. **The rim overlay hid every `projection-fallback` rim** — ANSWERED, and more broadly than the question
   asked: it is shown for BOTH kinds, because `boundaryKind` is an authority signal and not a visibility
   one. The gate is deleted and the loop now draws in the edge colour the legend names. See the correction
   in section 1.
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
- **Draggable in-scene anchor handles** — **done.** `UnitObject` picks up the anchor under the press,
  moves it with the pointer and commits once on release, so one drag is one entry on the app history.
  A press on bare surface picks up nothing and orbits, which is the house rule with the anchor as what
  decides it. Walk `u5d`/`u5e` prove the drag moves an anchor rather than leaving a new one behind.
- **The stage, its panel and its overlay** — **done.** `src/dental/rim/` and
  `src/components/viewport/RimDraftLayer.tsx`.
- **The opening-direction sign** — **decided in the engine, not here, and not the way this document
  proposed.** See the correction in section 3. The host's part is to show the flip when the engine
  reports `rim-side-uncertain`; today that is a sentence in the status line rather than an arrow,
  which is honest but is the last piece of this feature still worth building.
- **The geocore call for the visibility mask** — **done**, geocore engine 61, commit `8bd2430`.
  `dental_rim_from_points(model, points, flip, profile)` returning a `DentalRimResult`.

### What is left

This section used to say one thing was left — a flip control — and called it "a refinement rather than
a gap". **Both halves were wrong.** The review of 2026-11-06 found the real gap was that the mode could
not be re-entered, which is now built (**Draw the rim**), and that the flip control cannot be built as
described until two other things exist.

**1. The flip control, and the state it needs.** `flip` is a parameter on `dental_rim_from_points` with
no control wired to it. Three things stand in the way, and an implementer should be given all three
before starting:

- **It has no moment.** `sideUncertain` is knowable only *after* the engine call, and that call happens
  inside Done — the same batch that clears the draft and leaves the mode. A pre-Done toggle would need
  a speculative second engine call on every close, which `useRimDrawing` argues against in writing; a
  post-Done control needs a way back into Step 1's drawing, which now exists.
- **It has no state.** `sideUncertain`, `floorOffset` and `flipped` are read once, into a status
  sentence, and then dropped. No session field, no `UiState` field, nothing on the stored policy. After
  Done, nothing in the application knows the side was ever in doubt, so a control has no predicate for
  `visible` or `enabled` and a reloaded project has none either. Deciding where that fact lives — and
  whether it belongs on the serialized policy — is the first decision, not the last.
- **Turning an arrow over is a re-call, not a sign flip.** The mask is rasterised in Rust in the rim
  frame; the host is forbidden from rastering its own. So a flip re-runs the engine, and a post-Done
  re-call must re-wrap through `manualAreaPolicy`, which hard-codes `stamps: []` — flipping after the
  operator has painted in Step 2 would discard their paint unless the stamps are merged by hand.

**2. A fixture that produces `rim-side-uncertain` against the real engine.** The only test that
produces it fakes the engine, and the walk never reaches it. Until one exists the control above can be
built and never seen to appear, so this comes first.

**3. The loop sets the frame, not the boundary.** Worth stating once, because the overlay invites the
opposite reading: `rasterize_visible_surface` is never given the drawn points. It takes its bounds over
every vertex of the mesh and rasters every face, in the frame the loop defines. This has always been
true of detected rims too — `make_rim` is one function — so it is not a drawn-rim defect and not worth
an engine change. It does mean the drawn loop is not the edge of the permitted area, whatever the
legend's colour suggests.

Everything else in this document is built, gated and shipped.
