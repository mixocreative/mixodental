# Design records

One dated document per decision, with the reasoning that produced it. These say what a feature IS and why; read the newest that touches your area before changing what it does.

**11 documents, gathered into this one record on 2026-11-19.** Each is copied whole, nothing reconciled with later reality, under an anchor that is its old filename - so a reference anywhere in this repo, in an old commit message or in an audit log still finds it by that name.

| when | document | was |
|---|---|---|
| 2026-11-05 | [Going back goes out one level](#2026-11-05-back-out-one-level) | `docs/design/2026-11-05-back-out-one-level.md` |
| 2026-11-05 | [Rim define mode — the operator draws the rim when detection cannot](#2026-11-05-rim-define-mode) | `docs/design/2026-11-05-rim-define-mode.md` |
| 2026-11-05 | [A verdict that is out of date, and an orientation that failed](#2026-11-05-verdict-staleness-and-orient-ways) | `docs/design/2026-11-05-verdict-staleness-and-orient-ways.md` |
| 2026-11-07 | [Import, items and the end of the flow](#2026-11-07-import-and-items-flow) | `docs/design/2026-11-07-import-and-items-flow.md` |
| 2026-11-11 | [Where the spatial puck lives, and what to tidy here — 2026-11-11](#2026-11-11-repo-shape-and-the-spatial-puck) | `docs/design/2026-11-11-repo-shape-and-the-spatial-puck.md` |
| 2026-11-12 | [Three-repo refactor: decision record and fix list](#2026-11-12-three-repo-refactor-plan) | `docs/design/2026-11-12-three-repo-refactor-plan.md` |
| 2026-11-16 | [Porting the drawing layers to Babylon — the plan, 2026-11-16](#2026-11-16-babylon-layer-port) | `docs/design/2026-11-16-babylon-layer-port.md` |
| 2026-11-17 | [mixoDental — the whole flow, end to end](#2026-11-17-flow-map) | `docs/design/2026-11-17-flow-map.md` |
| 2026-11-18 | [The card deck — what is built, and the plan for what is not](#2026-11-18-card-deck-plan) | `docs/design/2026-11-18-card-deck-plan.md` |
| 2026-11-19 | [Support recipes, and what the review found — plan, 2026-11-19](#2026-11-19-recipes-and-review-fixes) | `docs/design/2026-11-19-recipes-and-review-fixes.md` |
| 2026-11-20 | [benchwork: deciding what a type's rules are](#2026-11-20-node-rule-authoring) | written here, not merged in |
| undated | [mixoDental UI structure](#ui-structure) | `docs/design/ui-structure.md` |

---

<a id="2026-11-05-back-out-one-level"></a>

## 2026-11-05 — Going back goes out one level

*Was `docs/design/2026-11-05-back-out-one-level.md`.*

**Owner's words:** *"in all edit mode the back button should go back to exit that mode not to last steps.
In step3 it should not go straight to paint mode, like photoshop, the tools are only active when selected."*

Then, on seeing it built: *"needing 'Put it down' seems wrong"*, and
**"maybe select tool should goes first as the default tool, like photoshop, becuz a mouse is the most
intuitive thing by defualt."*

Both rounds are one idea. A drawing program has places inside places — a tool inside a mode inside a
document — and going back leaves the innermost one. The dental flow had the places but not the rule: one
press of Esc, from anywhere, left the whole flow.

### What was wrong

| Where the operator was | What one Esc did | What it should do |
| --- | --- | --- |
| Step 2, Paint in hand | **left the dental flow** | put the brush down |
| Step 3, Add in hand | **left the dental flow** | put the tool down |
| Rim define mode, 12 anchors drawn | **left the dental flow** | leave rim define mode |
| Step 2, resting | left the dental flow | left the dental flow ✔ |

The aligner kept its place on the plate, so nothing was destroyed — but the operator was thrown three
levels out by the key that, in every drawing program they have ever used, puts the brush down.

### The rule

**Going back goes out one level, never further.** From the inside out:

1. **A live selection** → clear it.
2. **A tool that is not Select** → go back to Select. The step stays.
3. **A mode** → leave the mode, landing where it was entered from.
4. **Resting on Select, nothing picked** → leave the flow, which is what the dental lock note promises.

This is in `editingMode.ts`'s `keys`, read top to bottom in that order.

### Putting a tool down is picking Select up

The first build gave the second rung its own control: **"Put it down"**, a key beside the tool switch
that emptied the hand. The owner's instinct was that this was wrong, and it was, for a reason worth
writing down:

**Nothing is put down in a drawing program. You pick up something else.** Photoshop, Illustrator, Figma,
Blender — there is always something in your hand, and the way out of the brush is the arrow. An empty
hand is a state none of them has, so it needs a button to explain itself, and the button's hint had to
describe a state the operator had no name for.

It was also half-selling something already true. A tool in hand has never blocked the view: the rule in
Step 2 is *drag on the model to use the tool, drag empty space to turn the view*. So "the model goes
inert and a drag turns the view" promised a freedom the operator already had. The only thing the empty
hand genuinely bought was not marking the model by accident — and **Select buys that too, while being a
tool like any other**.

So:

- **Select is the first segment of the switch**, where the arrow is in every drawing program.
- **Every step opens on Select** — Step 2, Step 3, and Step 2 again when Back returns to it. A brush
  never carries across a step edge.
- **`dentalToolArmed` is gone.** There is no empty hand to represent, so the flag that represented it,
  the `dropDentalTool` event that reached it and the `dental.toolDown` command that ran it are all
  deleted. One state fewer, one event fewer, one command fewer, and one control off a crowded row.
- **Esc's visible twin is the Select segment**, which was always going to be on screen anyway. The house
  rule that every shortcut has a button is kept by removing a button, not adding one.

#### What the tool switch does NOT do, and what that cost to find out

An earlier build made the switch itself the way out: press the pressed tool to clear it. It was wrong
twice over, and the walk found it within one run.

- **It broke an idempotent key.** P/E/A/S run the same path as the switch, so "press A to put Add in hand"
  stopped being true and started depending on what was in hand before. The walk sets Click reach by
  pressing `a` first — and with Add already in hand that press put the tool *down*, took the Click reach
  field off the dock, and the fill timed out 30 seconds later.
- **It made a radio button behave like a checkbox.** A segment that unpresses on a second press is
  ambiguous by construction, and operators double-click.

Picking a tool therefore only ever picks it, however many times the same one is chosen. Select-first
keeps that intact: it is a segment with its own key, so pressing it always means the same thing.

### The cursor says what is in your hand

A switch is only half the answer, because the operator is looking at the model, not the dock. The
viewport already had a cursor system (`components/viewport/style.ts`) — a tinted brush icon for the
zone brushes, a crosshair where a click places something — but Step 2's branch was **one crosshair for
all four tools, and for no tool at all**, which invited a click that could do nothing.

Each tool now has its own pointer, and off the model every one of them is a grab hand, because there a
drag orbits whatever is in hand:

| Tool | Over the model | Off the model |
| --- | --- | --- |
| Select | arrow | arrow |
| Paint | brush icon, zone tint | grab |
| Erase | brush icon, grey tint | grab |
| Add | crosshair | grab |

Step 3's Add was a crosshair everywhere for the same reason and is now the same shape.

### In a mode, the way out wears a word

Rim define mode is the flow's one modal detour, and the only mode in it with a back control. Its footer
was the step dock's `.step-nav`: an anonymous arrow, welded to Done. That is a promise it cannot keep —
the arrow means "the step before", and this is not a step.

It is now `.mode-nav`: **Cancel** and **Done**, both worded, with a gap between them.

- Worded, because a mode's two ways out are *finish it* and *leave it*, and both deserve a verb.
- A gap, not a seam, because `.step-nav`'s seamless pair are the two ends of one journey, while Cancel and
  Done are opposites — and a seam between opposites invites the wrong one.
- `Cancel` carries **Esc** as its cap and says what leaving costs: *"Leave rim define mode without a rim.
  Step 1 keeps the notice that sent you here."*

Support Edit Mode and no-support zones already worked this way — one **Done**, no Back — which is the
evidence this was the house rule all along and the rim dock was the exception.

### Why Back is not the same control as Esc

Tempting, and wrong. The dock's Back arrow sits in `.step-nav`, welded to Next, and it means *the step
before this one*. Making it also mean "go back to Select" would make one icon-only button do two
different things depending on state the operator has to remember.

So the controls divide by what kind of place they leave:

- **Esc** leaves the innermost thing, whatever it is. It is the ladder.
- **Back**, in a **step**, is step navigation: the arrow beside Next.
- **Back**, in a **mode**, is the way out of the mode — and then it is not an arrow at all.

### One command enabled where it is not shown

`dental.tool.select` is **visible in Step 2 only** — Step 3 draws its own switch, carrying Add and
Select — but it is **enabled in both**, because Esc in Step 3 runs it and `keyAction` drops any command
that is not enabled. That is the honest shape rather than an oddity: a key with no button of its own in
Step 3, because the switch already there carries it.

### Checked by

- `rimStage.test.ts` — Cancel's words, cap and hint; the step arrow's words elsewhere; Esc leaves the mode
  and lands on Step 1.
- `dentalStep2.test.ts` — the step opens on Select; picking a tool is idempotent; a brush is put down by
  picking Select up; `dental.toolDown` no longer exists; the whole Esc ladder, including that Esc leaves
  the flow only from Select.
- `dentalStep3.test.ts` — Esc goes back to Select before it will leave the flow.
- `session.test.ts`, `dentureStages.test.ts` — every entry into a step rests on Select.
- `walk.mjs` `u10g`–`u10l` — in the running app: Step 2 opens on Select; a drag marks nothing there; Esc
  goes back to Select **and the Step 2 badge is still there**; the tool keys stay idempotent; Select is
  the first segment and one is always pressed.

Rim define mode's own ladder is checked by `u5`–`u5h`, which now draw a rim for real: place, adjust,
clear, close, and Done. Cancel takes its own pass, because a second aligner is laid out beside the
first and the drawing checks need a plate holding one object.

That badge assertion is the point of the whole case. If Esc took the flow with it, there would be no badge
left to read.

---

<a id="2026-11-05-rim-define-mode"></a>

## 2026-11-05 — Rim define mode — the operator draws the rim when detection cannot

*Was `docs/design/2026-11-05-rim-define-mode.md`.*

> **BUILT AND SHIPPED, 2026-11-06.** Rim define mode works end to end: a shape with no findable rim
> opens it, the operator places anchors, drags them, closes the loop and presses Done, and the drawing
> becomes the aligner's rim. The blocker this document was written around — no engine entry point could
> build a visibility mask from arbitrary points — was closed by **geocore engine 61**
> (`dental_rim_from_points`, geocore `8bd2430`).
>
> The sections below are kept as the reasoning that got there, not as a to-do list. **Read the block
> under this one first**: it is the shipped behaviour in one place, and where the sections disagree
> with it, it wins.

### As shipped

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

### 1. What a rim has to be

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

#### `boundaryKind` gates authority, not visibility — measured, not assumed

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

##### Correction: the overlay gate was real, and it is gone

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

#### The visibility mask cannot be produced here, and it is not optional

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

#### Therefore: this feature needs geocore

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

#### A drawn rim agrees with a detected one on the SIDE, not on the axis — measured

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

### 2. The flow

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

#### Do not fabricate a proposal's diagnostics

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

### 3. The mode's UI

House style is `mixo-app-style`: this is a **tool mode**, so it gets a red hairline frame around the
viewport, a badge top-left naming the mode and the current tool *in words*, and one bar top-right ordered
tool control → options → contextual actions → **Done** as the single primary.

#### Tools, and why not "Paint"

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

#### The two ways out: Cancel and Done

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

#### Anchors, and the curve between them

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

#### Closing the path

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

#### Camera only — never the model

The owner's explicit concern, and the house rule already answers it: **where the drag starts decides.** On
the model, the drag is the tool; on empty space, it orbits the camera as always. No held key, no right-drag,
and the cursor shows which by drawing the anchor ring only over the model.

The model itself must not rotate in this mode: the **rotate gizmo is hidden** while defining the rim. The
operator is looking, not orienting — orienting is the next step, which is exactly why Done leads to Free
transform. Anchors are stored unit-local, so even an accidental model rotation would not corrupt them, but
allowing it would blur two steps the flow deliberately separates.

Drawing a lower rim means looking from underneath, so the standard view group (Fit view, Bottom view) stays
available at the viewport's top right, under the mode's own toggle, per the style rules.

#### Undo

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

#### Mechanics this builds on

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

### 4. Modularity — the loop is not aligner-only

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

#### The dental half

`src/dental/rim/` is then the consumer: it turns a closed `SurfacePath` into a `DentalRim` through the
engine call, and owns the stage, its panel and its viewport overlay. The dental-specific part is the rim and
its mask; the drawing is not.

### 5. Verification

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

### 6. Open for the owner — answered, except where marked

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

### 7. What is already in place, and what is genuinely new

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

#### What is left

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

---

<a id="2026-11-05-verdict-staleness-and-orient-ways"></a>

## 2026-11-05 — A verdict that is out of date, and an orientation that failed

*Was `docs/design/2026-11-05-verdict-staleness-and-orient-ways.md`.*

Two things Step 1 and Step 3 got wrong, found by walk checks `x9b` and `u7`, and what this change does about
them. Both were product questions rather than broken tests, and both were answered by the owner on 2026-11-05
before any code moved.

Files this touches:

- `src/components/ReviewSummary.tsx` — the verdict line shared by the aligner's Step 3 and the denture's Step 2
- `src/components/DentalSupports.tsx` — the aligner's Step 3 panel
- `src/denture/steps/supports/DentureReviewPanel.tsx` — the denture's Step 2 panel
- `src/components/DentalReviewBlocks.tsx` — the `DentalReview` contract between the host and both panels
- `src/App.tsx` — where the verdict's state is computed
- `src/components/OrientationBar.tsx` — Step 1's keys and notices
- `src/styles.css`, `src/locales/ja.ts`, `src/locales/zh-Hant.ts`
- `scripts/walk.mjs` — the `u7` check

### 1. The verdict said nothing about being out of date

#### What a reader saw

Step 3 leads with one sentence — the verdict: "Supports ready. Every point is held.", or "2 things to look
at." — with the evidence behind Details. Change a support setting and that sentence describes supports that no
longer exist, until a rebuild and a re-check replace it.

Dragging a slider dimmed the sentence while the pointer was held. Pressing an arrow key on the same slider left
no sign at all. Walk check `x9b` watched for the dimming with a mutation observer that cannot miss a
transition, and recorded none for several controls.

#### Why

The panel asked for dimming correctly. `stale = adjusting || review.verdictPending`, and `verdictPending`
includes `verdictBehind`, which compares the verdict's stored object against the live one:

```ts
const verdictBehind = Boolean(activeUnit && verdictEntry
  && (verdictEntry.unit !== activeUnit || verdictEntry.mesh !== currentBuild(activeUnit, built.get(activeUnit.id))));
```

A settings change replaces the unit object, so `verdictEntry.unit !== activeUnit` the moment the setting
changes — synchronously, in the same render, for a key press exactly as for a drag. There was no gap. The
earlier reading of this bug, that `adjusting` "only fires while a slider is held", was wrong: `RangeField`
also sets it on `onChange`.

That reading is right **once a check has run**, and `x9b` runs before one ever has. `verdictEntry` is
`problems.get(activeUnit.id)` — the check's result — and at `x9b`'s point in the walk nobody has pressed Check
supports, so there is no entry. With no entry `verdictBehind` is `false` by its own first condition, and
`verdictPending` is left holding only `generating`, `regenQueued`, `dentalTuning.busy` and
`building(activeUnit)`. The verdict on screen at that moment, "Supports ready. Every point is held.", is not a
check result at all: it is what `reviewLine` returns for a landed build with no findings. A first attempt at
this change keyed the fix to a landed *verdict* and so did nothing here; `x9b` still reported `stale seen 0x`
for all six controls.

The dimming never reached the screen for two other reasons, both in the same render:

1. `dentalReviewReady` is `Boolean(activeUnit?.supports && built.get(activeUnit.id)?.unit === activeUnit)`, so
   it also went false the instant the setting changed. The panel passed `open`/`onToggle` only when it was
   true, and `ReviewSummary` gated the `is-stale` class on `stale && settled`, where `settled` means those two
   props are present. So the panel could not say it was stale at the one moment it was.
2. With `ready` false, `reviewLine({ built: ready, ... })` returned the `building` line. The verdict was not
   dimmed; it was **replaced** by "Building supports…", and the Details fold and its toggle left the DOM with
   it.

So the reader did not lose a visual cue. They lost the verdict and its evidence, and got a progress sentence
in its place, on every nudge of every Step 3 control.

#### What it does now

The owner's answer: the dimming is a fact about the data, not about the input device. A verdict is dimmed from
the moment a setting changes until a fresh verdict lands.

- `ReviewSummary` gates `is-stale` on `stale && tone !== 'building'`. What dims a verdict is the verdict being
  out of date, not the Details fold being on offer. A `building` line is still never dimmed: a first build has
  no previous verdict to dim.
- `DentalReview` gains `buildLanded: boolean` — "a support build has landed for this object at least once".
  `App` supplies `Boolean(activeUnit && built.get(activeUnit.id))`. The **build** map is the right signal, not
  the check map: `built` keeps its entry when a settings change makes that entry stale, which is exactly the
  window the panels need, and Step 3 shows a verdict before anyone presses Check. It is keyed by unit id, so a
  new aligner starts without one and needs no reset.
- Step 3 reads its line and its Details fold from `shown = ready || review.buildLanded`. The verdict the
  reader was reading stays on screen, dimmed, with its findings; those findings outlive the rebuild
  (`review.problems` keeps the last check's, and `ProblemList` already marks them "Out of date, check
  again."). "Building supports…" is now reached only by a first build.
- `stale` becomes `adjusting || review.verdictPending || (shown && !ready)`. That last term **is** the
  definition of out of date — a result is on screen and it is not the one the object would build now — so it
  needs no rebuild to have started, no pointer to be held, and no stored verdict to compare against. Both
  panels use it.

A build that **failed** outranks the verdict it was meant to replace, so `built` is `shown && !failed`.
Without that, `reviewLine` (which returns the failure line only when `failed && !built`) would keep showing a
previous "Supports ready." over a build that did not happen — a worse lie than the one this change set out to
fix. Both panels do this, and both have a test for it.

#### Where the denture's Step 2 differs, on purpose

The denture panel gets the same treatment for its **line** and not for its **Details**. Its evidence —
Resolve, the parts list — is read off `mesh`, and `currentBuild` returns `undefined` the instant the object
changes, so keeping the fold open through a rebuild would open it empty. The aligner's evidence is
`review.problems`, which survives. The two panels differ because their data differs, and the code says so.

#### What this does not do

- `adjusting` and `RangeField`'s `onAdjust` are now redundant for Step 3, since `verdictBehind` covers the
  whole window. They are left alone: `onPointerDown` still covers a slider held without being moved yet, and
  removing the machinery is a separate change.
- The denture's Details gap above.

### 2. An orientation that failed offered no way out

#### What a reader saw

Drop a model with no central opening on the reference aligner type and Step 1 says:

> The aligner could not be oriented automatically. It stays as dropped: rotate it with the gizmo, then press
> Next.

Nothing else. The one reader whose real mistake was picking the wrong aligner type had no way to say so. The
notice that exists for exactly that — "This looks like a different aligner type: no central opening was
found.", with its Switch and Keep keys — is reachable only when orientation **succeeds** and the opening
contradicts the profile (`!result.matchesProfile`). A failure is a different branch and had no keys.

#### What it does now

The owner's answer: the failure notice gains the way out the mismatch notice has. A wrong type and a failed
orientation have the same answer — another aligner type — so both notices now carry the same row, built from
`profilesWithoutOpening()`. A mismatch keeps its Keep key; a failure does not, because a failure is not an
opinion to disagree with.

#### The part that cannot be built here, and what it means for this change

`profilesWithoutOpening()` is **empty today**. The engine embeds exactly one profile,
`reference-aligner.json`, and its `opening` is `"yes"`, so no profile qualifies as one a model without a
central opening could be. The switch row therefore has nothing to switch to — on the mismatch notice either,
where it has been rendering a lone "Keep Reference aligner" with no alternative beside it.

Profile files live in the Rust core (`crates/geometry-core/src/dental/profiles/*.json`, copied here by
`scripts/gen-profile-files.mjs`), so a second type cannot be added from this repo.

Rather than render an empty row, the row says why: "{name} is the only aligner type so far." A reader
wondering whether they picked the wrong type learns that there is only one, which is the answer to their
question. The Switch keys come back on their own the day the engine embeds a second profile — no further
change here.

Translations for the new line came from Gemini in Taiwan wording and Japanese, matching the app's existing
terms (`牙套類型`, `アライナーの種類`), and the Japanese subset title face was cut again for `唯`.

#### Still upstream, and not attempted here

Saying **why** an orientation failed. `orientDentalAligner` already returns
`{ kind: 'failed'; reason: string }` and that `reason` already reaches `useDentalFlow`'s tilt state, so the
earlier note that surfacing it needs an upstream change was too broad — the string is here. What is upstream
is that `reason()` returns Rust **prose**. The app ships in English, Japanese and Taiwan Chinese, and a raw
engine sentence would be its only untranslated text, worded for whoever wrote the Rust. The ask for geocore is
a stable reason **code** the app can translate.

#### What letting the walk through uncovered: Next cannot work after a failure

With `u7` passing, the walk reached ground it had never covered — `Next` from a **failed** orientation — and
hung there. The cause is in `useDentalFlow`'s `next()`:

```ts
// Orientation failed: there is no opening to build the support area from.
if (!proposal || !profile) return setStatus('No aligner opening was found, so no support area can be proposed. Go Back and choose another file, or Exit.');
```

Refusing is correct: Step 2's support area is built from the orientation proposal's rim, and a failure has no
proposal. The problem is that the failure notice says:

> The aligner could not be oriented automatically. It stays as dropped: rotate it with the gizmo, then press
> Next.

So the notice asks the reader to press a key that will decline, and the only real ways on are Back and Exit —
which is what the status message says once they have pressed it. One of the two has to give.

This is **not changed in this pass**, because which one gives is a product decision, not a correctness
detail:

- **Reword the notice** to name Back and Exit, matching what the app does. Small, honest, ships immediately.
  It also means a model that only needed turning by hand has no way through, which is the weaker outcome for
  the reader.
- **Let a hand-turned aligner go on** with a hand-marked support area, so the notice's promise becomes true.
  Better for the reader, and a real piece of work: Step 2's empty-area path currently needs `proposal.rim`
  (`manualAreaPolicy(proposal.rim, …)`), so a rim-free manual area has to exist first.

My recommendation is the reword now and the second as its own task, because an instruction on screen that does
not work is the worse of the two faults and costs a sentence to remove.

The walk records this rather than asserting it: `u8`/`u8b` only apply to the oriented ending and now say they
are skipped on the failing one, and a `note` reports what `Next` did. No check encodes an undecided answer.
The block also no longer re-reports a `u7` that already passed as a failure when something downstream throws.

#### Prose in Step 1's notices

`.edit-note` is `text-align: right` globally and overridden to left inside `.dental-side`, which is the
supports dock — fixed in `d939c64`. Step 1's column is not `.dental-side`, so its notices were still ranged
right. A notice is a run of words, so this change ranges the notice prose left and lets its box fill the
column, with the keys under it staying right where every other row of keys puts them. This is a style change
beyond the two bugs and is called out so it can be reverted on its own.

### 3. The walk's `u7` check

`u7` waited for the mismatch wording and then clicked Keep. On this machine the cup fixture **fails** to
orient rather than mismatching, so the check read a working app as a broken one, and the wording it waited for
was prose rather than a stable name.

It now waits for either row by `data-ui` (`orient-ways-mismatch`, `orient-ways-failed`), asserts that the row
offers a way out (a Switch key, or the line that says there is only one type), and branches: Keep is clicked
and asserted gone on a mismatch, and asserted absent on a failure.

### Verification

- `tsc` clean.
- Unit tests: `ReviewSummary` (a verdict with no Details fold still dims), `DentalBar` (a landed verdict stays
  and dims instead of becoming "Building supports…"; a first build still says it), `DentureReviewPanel` (the
  same for its line, with Details still waiting for a build), `OrientationBar` (both notices carry the row;
  only the mismatch carries Keep).
- The full suite and the build.
- `npm run walk -- --only=x` for `x9b` against the running app, and `--only=u` for `u7`.
- No engine change (nothing under `vendor/mixo-geocore` was touched), so the real-scan gate is not implicated.

### Open for the owner

1. **The failure notice promises a Next that declines.** Reword it to name Back and Exit (recommended, ships
   now), or build the rim-free manual-area path so a hand-turned aligner can go on. See the section above.
2. A second aligner profile — a type that does not insist on a central opening. Until one exists, the type
   switch can only explain itself, and `u7`'s cup has no type to be.
3. The geocore ask: a stable reason code from `orient_dental`, so a failure can say why in all three
   languages.
4. The Step 1 prose alignment above, if it is not wanted in this change.

---

<a id="2026-11-07-import-and-items-flow"></a>

## 2026-11-07 — Import, items and the end of the flow

*Was `docs/design/2026-11-07-import-and-items-flow.md`.*

**Revision 5, after three rounds of seven-reviewer review**; `docs/reviews/2026-11-07-egm-goldfish-review.md` (repo root) records the findings
and their dispositions. The second round changed the shape of the feature, not just its claims: the
per-row Appliance column is **gone** from this release (§2), and the memory split §5 asked geocore for
is **already vendored** (§5).

Each section is marked **built / decided / unstarted**. §7 is the UI, §8 the sequence, §9 what is open.

---

### 0. The problem, the measure, and what is out of scope

**Today the app takes one file per run** — not because the import pipeline is single-file (it is not;
see §3) but because `StartScreen.tsx` keeps one `held` file and takes `files.find(isStl)`, and
`App.tsx` branches the dental flow on `added[0]!`. A technician with a case of several aligners runs
the app once per aligner: **same task, same type, same answers**, re-entered each time.

**So: accept a drop of several files, show each one's state, then walk them one at a time.**

**The measure**, stated as a bound rather than a parity claim: a case of N aligners takes one trip
through the start flow instead of N; peak memory stays inside the existing plate refusal limit
(`TRIANGLE_BUDGET × 4` = 6,000,000 imported triangles); and **no transient copy is added per file
beyond the one `repair_mesh` would return when the operator asks for it — **and in this release it is
never asked**, because repair is cut (see §8 step 9). The release holds no transient copy per file at
all.**

> Revision 2 claimed "no step holds more memory at once than the single-file flow does today". That is
> false twice over: the retained term grows with N by definition (the models stay on the plate), and
> the existing drop loop already accumulates — `App.tsx` builds `const imported: PreparedMesh[][]`
> across every file before adding any unit. Streaming each file into a unit before reading the next is
> a small local fix to that loop and is listed in §7.

**Not in scope:** per-row Appliance and Type (§2 — deferred, with the reason); per-row orientation
detection; per-row support settings; reordering rows; anything that slices or plans the plate.

---

### 0b. THE JOB DECK — the shape this document had wrong

**Revision 6 replaces the per-item wizard with a job deck.** Everything below §1 was written around
one model walking Orient → Area → Supports → Export, repeated N times. That is the wrong shape, and
the measurement in this very document says why: `samples/case-aligner` holds **8 models**,
and a real clear-aligner case is a series of stages per arch. Eight passes through a three-step wizard
for one patient is not a workflow.

**It also contradicted a standing rule of this project** — *one global setting inherited by all
streams; extras opt-in*. A per-item wizard asks the same questions once per model.

#### The sequence

1. **Drop** → a loading scene while the files are read and each preview is cached. Cancellable: quitting
   mid-import releases the hold (§5).
2. **Purpose, once.** Aligner / Denture / Any model. This cannot come later: `startAligner` calls
   `dentalOrient(…, unit.source, profile, …)`, so **detection takes the profile as an argument** and
   there is nothing to detect against until the purpose is known. The ordering is a correctness
   constraint, not a preference.
3. **The batch runs in the background**, per row, **queued one at a time** — orientation detection and
   the area proposal. N jobs in parallel would multiply peak memory by N and break §0's argument, which
   is the argument the whole release rests on.
4. **The job deck.** One row per model: name, size, verdict, **its own detected orientation**, a
   progress indicator while its jobs run, and a 3D thumbnail that updates when they finish.
5. **Inspect** opens one row. Not steps — **tools**, reachable in any order.
6. **Generate** the supports, then **Export**: per row on the deck, or all / selected.

#### Steps become tools

| was | becomes |
|---|---|
| Step 1 orient | **Orient** tool |
| rim define (already a detour, never a step) | **Rim** tool |
| Step 2 area | **Area** tool |
| Step 3 supports | **Supports** tool (the existing Support Edit Mode) |
| Step 3's export | moves to the deck |

**THE CASCADE IS THE RISK, and it is the reason they were steps.** Each fed the next: re-orienting
invalidates the rim, which invalidates the area, which invalidates the supports. Order enforced that
for free. As tools in any order it must be explicit — re-orient a row and its downstream work is marked
stale and re-run, or the row shows supports computed for an orientation it no longer has.
`dentalFlow.invalidate()` and the per-unit `dental` / `rimDraft` state are the machinery; what is new is
the dependency being tracked **per row** rather than implied by which screen is up. One test per edge
of that graph, because this is the part most likely to be got wrong.

#### The steps become TABS, not a dissolved sequence

The owner's reference: other software puts the steps as **section tabs along the top**, each tab owning
its own tools and isolating the workspace. Resin and FDM slicers do it for prepare/preview/device;
video and photo suites call them pages or modules. Three properties matter here:

- **Ordered but not gated.** Left to right communicates the dependency without forcing passage through it.
- **Each tab isolates its toolset**, so one tab's tool cannot be mistaken for another's.
- **A tab can be marked stale** when something upstream of it changed.

**The third property is what answers the cascade risk above.** Tabs do not restore the gate — they
*display* it. Re-orient a row and Rim, Area and Supports show a stale marker and re-run when opened.
The dependency becomes visible instead of enforced, which is what a technician who knows the job wants
and what would infuriate them if enforced.

**The app is already built this way underneath.** `DentalStage` already drives the viewport chrome per
stage (`VIEWPORT_CLASS` keyed by gesture kind: `dental-aligner`, `dental-rim`, `dental-area`,
`dental-review`) and `sectionLocked` already locks panel sections per mode. The stages **already**
isolate their workspaces; what makes them steps rather than tabs is only the Next/Back control flow.
So this is a change to navigation plus a stale marker, not a rewrite of the surfaces.

| level | destination | contains |
|---|---|---|
| top | **Job deck** | the rows, generate, export |
| top | **Inspect** (one row) | the tabs below |
| tab | Orient · Rim · Area · Supports | that tab's own tools, isolated |

*What tabs cost:* linear steps teach a first-time user the order and tabs do not. Mitigated by the
left-to-right order, the stale markers, and the deck flagging which rows need attention — a novice is
led by what is marked rather than railroaded.

#### ONE WORKSPACE, not a deck page and an inspect page

Revision 6 proposed a Deck page and an Inspect page with top tabs. **Closer study of a reference
print-preparation tool says otherwise, and the simpler answer is the right one.** That tool has no
top tabs at all. It has:

- a **model list** panel (left), with per-model visibility and grouping;
- a **tool rail** down the left edge — scale, orient, supports, layers, hollow, label;
- a **floating widget** per tool, holding only that tool's controls;
- a **job panel** (right): printer and material, job settings, a summary (time, volume, supports,
  layers), a **validation** section with per-check toggles and warnings, and the model list;
- the **plate itself** in the middle, all models at once.

**The insight worth more than the layout:** one of its tools is a trim tool whose widget carries
**1 → 2 → 3 inside it**, with its own Back and Next. The steps did not disappear — they moved *inside
a tool*. The application level is not a wizard, and a tool that is genuinely sequential keeps its
sequence, scoped to itself. The earlier revisions argued steps-versus-tabs as one choice for the whole
app; the answer is **both, at different levels**.

So there is **one workspace**, and "inspect" stops being a page:

| region | ours |
|---|---|
| model list | **the job deck** — a panel, not a page |
| tool rail | Orient · Rim · Area · Supports |
| tool widget | that tool's controls, with steps inside where it needs them |
| job panel (right) | purpose, support defaults, **validation**, model list |
| plate (centre) | every model at once |

Two things in that job panel transfer almost directly. Its **validation** section — per-check toggles
with a warning summary — is our per-row verdict surface, raised to job level. And its
**auto-generate-all** is the batch generate, stated as one job-level action.

**This is fewer screens than revision 6, not more**, and it fits the shell the app already has:
`.panel.left` and `.panel.right` exist with their sections, and dental is the only mode that hides
them (`App.tsx`: `{editMode !== 'dental' ? <aside className="panel left">`). Adopting this means
dental stops hiding the shell rather than new chrome being built.

*The caution carried forward:* that reference is dense and professional, and this project's standing
preference is minimal and game-like. Take the structure; keep each tool widget's content small.

#### WHEN A TOOL GETS STEPS, and when it just gets ordered controls

Steps did not die with the wizard; they moved inside the tools. Without a rule for which tools get
them, every tool acquires a wizard and nothing has been gained.

**The test: steps are needed only when the USER must make a decision that determines what the next
decision is.**

*An earlier version of this rule said "a later action is impossible until an earlier one completes",
and that was wrong.* It confuses **asynchronous state** with **sequence**. Something not ready yet is
a busy indicator or a disabled control, not a step. Under the wrong rule both Orient and Supports
appeared to need steps; under the right one, **none of the four tools does**:

| tool | steps | why not |
|---|---|---|
| **Orient** | no | it branches — rim found, or draw one — but **the detector decides that, not the operator**. A branch nobody chooses is a state, not a step. |
| **Supports** | no | supports that do not exist cannot be edited, but that is a tool showing *generating…*, not a gate the operator walks through. |
| **Area** | no | paint and erase are both live the moment the tool opens. |
| **Rim** | no | one continuous drawing action ending in Done. |

**What replaces them** (the owner's flow): open Orient, re-orient, accept → accepting starts the
generation and you leave the tool → the row shows its supports being built → open Supports to edit
them, or never, if they are fine. The sequencing is the MACHINE's, so the machine carries it instead
of marching the operator through it.

#### THE RAIL CARRIES THE ORDER, by enablement rather than by stepping

With no steps, the dependency is expressed by **what the operator can press**. A tool whose
prerequisite is not met is disabled; the order is visible on the rail, left to right, and nothing is
enforced beyond what is genuinely impossible.

| tool | enabled when | the line it shows when it is not |
|---|---|---|
| **Orient** | always | — |
| **Rim** | the model is oriented | *Orient first* |
| **Area** | a rim exists | *The area is measured from the rim* |
| **Supports** | an area is accepted | *Mark the support area first* |

**This answers the one real cost of dropping the wizard.** Linear steps teach a first-time operator
the order; enablement teaches it too, and only at the moment it matters.

**Two rules, because disabled controls are where this pattern usually fails:**

1. **Greyed must say why, and what to do.** A disabled control with no explanation is worse than a
   step — the operator sees grey and does not know the fix. The one-line reason is doing the teaching
   the wizard used to do, so it is not optional chrome.
2. **"Not yet possible" and "being made right now" must look different.** Greyed means *cannot yet —
   do this first*. A tool whose work is generating is **enterable and busy**, showing progress, not
   greyed; otherwise the operator presses it, sees grey, and concludes something failed. This is the
   same confusion §3 made about `fill-disabled`, which is worth not repeating.

**Three states per rail item, each with its own line:** *unavailable* (prerequisite missing), *stale*
(upstream changed, the work still exists), *ready*. Re-orienting does not grey the downstream tools —
their work is still there — it marks them stale.

**The cost to watch:** auto-generating on accept means re-orienting regenerates, and generation is the
heaviest job here. On a deck of eight, one adjusted row must not queue eight rebuilds, and repeated
adjustment must not stack jobs. `scheduleRegenerate`, the per-unit `buildTimers` debounce, and the
staleness guard that drops a build whose unit has changed are already in `App.tsx` — this is wiring,
not new engineering.

**And the property that makes internal steps safe: Back and Next live INSIDE the tool's widget.** The
steps are local — they do not change the screen, do not swap the panels, do not move the operator out
of the tool. That is the real difference from the app as it stands, where Step 1 → 2 → 3 replaces the
whole dock and hides both side panels (`App.tsx`: `{editMode !== 'dental' ? <aside className="panel
left">`). The same word costs very different things: leaving a step today means leaving the
workspace; leaving a step inside a widget means pressing Back in a small window.

**This also makes the cascade cheaper.** If Orient's internal flow is local, re-running it does not
tear the screen down — it marks Area and Supports stale on the rail and nothing else moves.

#### THE PLATE: a seam for later, but arrangement is load-bearing NOW

Exports are per-object, so the slicer packs the plate — which raises the fair question of why this app
carries `plateLayout`, `arrangeOnPlate` and footprint tracking at all.

**The owner's decision: the plate layout is a SEAM.** The door is deliberately left open to a future
where the app takes printed items and slices them itself. That is **not in this product's scope at
this stage**, and no work is justified by it.

**But "the plate" is TWO things, and only one of them is a seam.** Checked against the signatures
rather than assumed:

| | where it lives | this product |
|---|---|---|
| **gap-based layout** — `arrangeCommands(units, ids)`, which takes **no plate size**, only `ARRANGE_GAP` and a `startX` | core (`editing/arrange.ts`) | **used today** on three live paths: `App.tsx` when an aligner is finished, `useDentalFlow.ts` twice when an orientation is accepted. Several finished objects share the view and something must stop them colliding. |
| **plate-size packing** — `arrangeOnPlate` / `arrangePlateCases(…, plate: PlateSize)` | core | **not needed here.** Exports are per-object, so the slicer repacks; packing to a build volume this app does not own decides nothing. |
| **the drawn plate outline** (`PlateOutline.tsx`) and the **printer picker** that feeds it `widthMm`/`depthMm` | this app | exist only to serve the packer above. |

**Nothing is deleted and nothing moves.** The packing capability already lives in the core, where
**mixomesh may need it** — this product simply does not exercise the part that requires a build
volume. The dental flow's own layout keeps working untouched, because it never asked for a plate size
in the first place.

*One name misleads:* `assertPlateCapacity` refuses oversized imports on a **triangle budget**, not on
plate area. Import refusals are unaffected by any of this.

**And it qualifies a step 11 claim.** `releasedBuild.test.ts` asserts a released unit's footprint
still reads exactly as before, and the justification given for it — that the plate would otherwise fit
fewer — belongs to the **packer**, which this product does not use. Keeping `footprint` is therefore
cheap insurance for the core's packer rather than a present requirement of this app. Keep it: it costs
a few numbers, the packer is one product away, and the test is still worth having. But do not cite it
as something this release depends on.

*Read "seam only" as "do not extend it", never as "it is unused".*

#### WHAT WAS BUILT, 2026-11-08 — read this before the four increments below

All four increments are **built, gated and pushed**, except the part of D that needs the step machine
dissolved. The increment notes that follow are kept as the reasoning, not as a to-do list.

| | commit | what landed |
|---|---|---|
| A | `6dcc062` | several dropped files wait for the purpose, which the batch needs |
| B | `091046d` | one `dentalOrient` per row, each row keeping its OWN result |
| C | `42b1a58` | the row picture, drawn once and kept as a bitmap |
| D core | `75d86d6` | the enablement rule, the staleness model, the saved `revisions` |
| D rail | `1609589` | the rail's four states, kept visually distinct, and its one reason line |
| D mount | `88977a3` | the rail on the deck, the job-level tally, and two blockers a review found |
| D stamp | `b028d91` | revisions stamped in the reducer, so staleness actually fires |
| review | `3bbe431` | three EGM reviews acted on: `toolEntry` deleted, three stamping defects, `oriented` corrected, the state/deck cycle broken, and the walk's `m4d` which was passing BECAUSE of the bug. Ledger: `docs/reviews/2026-11-08-egm-deck-rail.md` |

**Three things this document got wrong, corrected in the code's own docs:**

1. **§C's renderer.** "Render once from the display copy that already exists" cannot use the app's
   renderer: the workspace, and so the only `<Canvas>`, is mounted **only when no start screen is up**
   — and the deck IS a start screen. There is one dedicated renderer instead, uploading and disposing
   one model at a time. `src/items/README.md` carries the detail.
2. **§"THE RAIL CARRIES THE ORDER" states three rail states and a busy one.** The order they are
   tested in turned out to be the whole rule, and the obvious order was wrong: testing *busy* first
   let a tool be marked busy without its prerequisite, which hid its own reason and left the rail
   instructing about a step two further on. It is unavailable → busy → stale → ready.
3. **Staleness needs a recorded revision, which §D does not mention.** It is one integer counter per
   unit, stamped in the reducer; `src/deck/README.md` explains why a recorded rotation would have
   needed an epsilon nobody could defend.

**Per-tool entry was built and withdrawn.** A `toolEntry` module walked `backDental` to the pressed
tool; review found it unreachable (the rail is on the deck, the deck is a start screen, and every
route to a start screen sends `exit` first), wrong for a denture (which skips `area`), and that it
bypassed the Step-3 confirmation and hand-work discard, because that guard lives in the command
handler rather than the reducer. It is deleted. `src/deck/README.md` keeps the three reasons.

**What is NOT built, and why.** The per-tool **widgets**, the rail as the workspace's own left edge,
and per-tool entry all need `dentalStage` dissolved: each stage owns the whole dock, which is what a
floating widget replaces, and a rail beside that dock would give two competing ideas of where the
operator is.

*A correction this document carried for a while:* it said the machine "guards every transition on the
current stage, so a tool's stage cannot be opened directly". That is true only FORWARD — `backDental`
walks review → area → aligner freely. Backwards entry was therefore expressible; it was the other
three faults above that made it wrong, not the guards.

#### BUILDING THE DECK: four increments, and two of them are smaller than this document assumed

**A — Purpose before the batch.** The Drop page **already has the three keys**, and a single dropped
file is **already held** until one is pressed (`StartScreen`'s `held`). A multi-file drop bypasses
them, which is the whole gap. So: hold ALL the files the same way, and let the purpose press release
them into the batch. No new screen, no new mechanism — `held` becomes `File[]` and `choose(id)` hands
the list on with its profile. The page says how many are waiting.

*Purpose must come first, and it is a correctness constraint rather than a preference:
`startAligner` calls `dentalOrient(…, unit.source, profile, …)`, so detection takes the profile as an
argument and there is nothing to detect against until the purpose is known.*

**B — The batch run. ALREADY QUEUED, by machinery that exists.** This document treats "queued, one at
a time, never N in parallel" as work to be done, on the grounds that N jobs would multiply peak memory
by N. It is already true: `AnalysisClient` is constructed with `HEAVY_JOBS`, a `TriangleGate`, and
`analysisClient.test.ts` states its behaviour — *"the second starts only when the first frees its
triangles"*. Firing one `dentalOrient` per row is therefore serialised **by triangle budget**, which
is a better rule than "one at a time": two small models may run together, two large ones may not.

So B is: fire one detection per row, record each row's own result, and show progress. The memory
protection is not built — it is inherited.

**C — Thumbnails.** New work: no offscreen render path exists. Render once from the display copy that
already exists and cache the **image**; see the paragraph below on why that is affordable.

**D — The tool rail and the inspect page.** The largest piece, and the one that replaces the step
navigation with tools plus enablement.

#### Why the thumbnail is affordable, reversing §7

§7 ruled the preview must be text, on the grounds that a 3D preview per row is the release's only new
per-row memory cost. **That objection applies to N live viewports, not to N cached images.** Rendered
once from the display copy that already exists and kept as a bitmap, a 160 px thumbnail is tens of
kilobytes against a 12.2 MB model. There is no offscreen render path in the app today, so it is new
work — but the memory argument does not forbid it, and the earlier text-only ruling was too
conservative.

#### What is already built, and what this costs

Built and still needed: the Drop page, the rows and their `data-ui` naming, the verdict pipeline
(`diagnose_mesh` → `ImportDiagnosis` → `rowState` → `rowText`), `nextItem` / `itemsLeft`, the per-job
export client, and — importantly — **`targets()` already returns every unit when nothing is selected**,
so "one setting inherited by all, overridden per row" is in the code rather than something to add.

Superseded: the per-item **add loop**. §8 7b's *Next item* press and its walk check are **withdrawn**,
not merely unbuilt — building them would build the thing this section argues against.

#### One open item this section cannot settle

The sequence calls for each row to be *"auto tuned, fixed, and generated"*. **Repair is cut** (§8 step
9), so nothing presses it: a row can *report* a defect and cannot mend it. Either repair returns —
reversing the cut — or "fixed" is out of scope and the deck reports only. **Recommendation: report
only.** Step 5 measured zero open rims across 18 scans, so the repair that matters here is non-manifold
splitting, and step 9's own brief shows it carrying a worker protocol message, a `SceneCommand` that
replaces `unit.source`, and a 4x import memory peak. That is a release of its own, not a line in this
one.

### 1. Scenes and pages — the vocabulary

**Scenes: built, committed** (`src/scenes/sceneMap.ts`, `src/bench/benchScene.ts`, `e5c5718`).
**Pages 1–2: unstarted.** The table is the target state.

A **scene** is a whole screen. A **page** is **any Back-able screen within a scene**, step or mode or
neither — which is why Rim is a page though it is not a step, and Support edit is a page though a mode
is not a scene.

| Section | Page | Name | Today? | What is on it |
|---|---|---|---|---|
| **Start** | 1 | **Drop** | **new** | Logo, title, drop zone, the *Aligner* / *Denture* / *Any model* keys, *Open a saved project*. |
| | 2 | **Items** | **new** | One row per file: preview, verdict, progress. |
| **Object** | 3 | **Orient** | yes (Step 1) | Orientation and print angle |
| | 4 | **Rim** | yes | The rim drawing — a detour off Orient, not a step |
| | 5 | **Area** | yes (Step 2) | The support area |
| | 6 | **Supports** | yes (Step 3) | The supports, and the export |
| **Bench** | 7 | **Bench** | yes | The workspace at rest |
| | 8 | **Support edit** | yes | Support Edit Mode |
| | 9 | **Zones** | yes | No-support zones |

***Any model* keeps its name.** Revision 2 renamed it *Open the workspace*; the review report's own
disposition said the key keeps its name and its job, and the rename was unpriced. The string is
asserted in `sceneMap.ts`'s `bench.doors`, pinned by `sceneMap.test.ts`, clicked by the walk's
`enterEditor` — whose **seven call sites all sit outside section `s`** — listed in
`walkLocale`'s `KEYS`, and translated in both dictionaries. It stays.

**Two screens go, and both need enumerating.** `StartScreenId` becomes `drop | items`, so **`task`
and `type` and `file` all go**:

- The **task** screen's three keys move to the Drop page (`StartScreen.tsx`, `DentureChoice`), with
  `jobKindOf` / `fileStepText` / `START_HINT` / `startKind` / `goStart` following them.
- The **type** screen goes with `dentalStage: 'type'`, whose real footprint is about fifteen sites, not
  the three revision 2 named: the `DentalStage` union, `initial.dentalStage`, `enterDental`'s only
  destination, `chooseDentalProfile`'s guard — `backDental`'s aligner→type case, the `dental-type` gesture and
  `gestureStatus`, `dental.back`'s visibility rule (literally `dentalStage !== 'type'`), the
  `Step 0 · Aligner type` badge and its two locale keys, the viewport class per gesture kind, and six
  test files.
- **Back at Orient is a decision, not a detail.** Today it leaves the dental session entirely
  (`exit` + `setStartScreen`), discarding `dentalFinished`. With a live Items list mid-case that would
  lose the case's progress, so Back at Orient must return to the Items page **without ending the
  session** — new behaviour, and it sits in the same region as the unexplained `s17` failure in §8.

#### How an item is started, and the trap in the obvious way

**This is the rule three review rounds said was missing.** §0 says "then walk them one at a time" and
nothing said who walks them.

**The entry already exists.** `useSelectedAligner` in `App.tsx` is documented as *"Step 1 with the
object already selected on the plate instead of a drop"*: it takes the active unit, checks
`acceptsDentalDrop`, refuses a heavy-tier mesh with a three-language message, and calls
`startDentalAligner(unit)`. **That is exactly what the Items page needs**, heavy refusal included, and
it is already wired to a button. The Items page selects the row's unit and takes this path.

**The trap: never enter an item through `startDental`.** It resets **`dentalFinished: []`**. Use it
per item and the finished tally §4 just built is wiped, so `exitCommands` strips the supports off
every aligner finished earlier in the case — silently undoing the Export-then-Exit fix for the whole
run. `startDental` is guarded on `mode === 'off'`, so it is the way *into* the flow and nothing else.

**And *Add another aligner* is wrong for this world.** `addAnotherDental` sets
`dentalAligner: 'prompt'`, whose words are *"Drop an aligner STL…"* — it asks for a **file**, when
the next item is already imported and on the plate. With an Items list it becomes **Next item**: pick
the next unstarted row's unit and take the entry above. The walk pins the old prompt (`u2`, `u11`,
`x14`), so those checks move with it.

**The invariant, and it is testable:** `dentalFinished` survives every item-to-item transition. A test
asserts that after finishing item 1 and starting item 2, item 1 is still in `dentalFinished` and
`exitCommands` returns `[]` for it.

**Start stays `scope: 'run'`.** One screen handles N items; the per-object loop runs after it.

> The stale `scope: 'object'` claim is in **two** places, both named: `src/scenes/README.md`'s
> multi-file section and the `SceneScope` doc comment in `sceneMap.ts`. (Revision 2 said "THREE
> places, not one" and listed two — the same defect it was correcting.) **Correcting it voids the
> field's justification**: the README keeps `scope` *because* multi-file would change it. If Start
> stays `run`, `scope` needs a new reason or retiring.

---

### 2. Appliance and Type — per run, not per row

**Decided, unbuilt. This is the change the second review round forced.**

| Level | Operator sees | Chosen | Represented by |
|---|---|---|---|
| 1 | **Appliance** | **once per drop**, on the Drop page | app-side; `DentalKind` where one applies |
| 2 | **Type** | **derived from Appliance** | `profile`, via `defaultProfileId(kind)` |

#### Why per-row was dropped

§0's problem is *"same task, same type, same answers, re-entered each time"* — **the answers are the
same.** One Appliance for the drop, with a per-row *verdict*, satisfies the measure in full. The
per-row column bought only the mixed-case drop, which §0 never claims as a goal, and:

- **It was the single blocking open item.** It required N kinds, N profiles, a serialisation into the
  project file, and a per-Appliance loop rule — three design decisions, and no step produced them
  while step 7 consumed them.
- **Type is not state at all.** `defaultProfileId(kind)` maps kind → profile, and each family holds
  exactly one profile, so per-row Type would have been a pure function of per-row Appliance.
- **There is no choice in the Type column anywhere today**: `PROFILE_FILES` holds one entry
  (`reference-aligner.json`), the denture family one, and walk `s2` asserts one card. A reserved,
  never-reflowing column for a column with no choice in it was solving a problem that does not exist.

**Add the per-row column when a mixed case is actually asked for.** It then costs what it always cost,
but it costs it against a real requirement.

#### What survives

`DentalKind` is vendored and is exactly `'aligner' | 'denture'`, with `defaultProfileId`,
`profileIdsOf` and `requireKind` total over the pair, and `profileData` throwing for an unknown id.

> Revisions 2 and 3 also said `isDentalKind` parses **saved files**. That came from its own doc
> comment; the only call site in the repo is CLI option parsing in `profileSelect.ts`. The save format
> stores no `DentalKind` **value** — a unit's appliance is recorded structurally by `unit.denture`
> being present or absent, and the `kind` the parser validates on the dental policy is
> `'two-contour' | 'legacy'`. (Revision 4 said the save format "never mentions `DentalKind`", which
> overstates it: `normalizeDentureState` calls `requireKind` on a saved `policy.profileId`, so a new
> kind bringing its own profile family *would* change what a saved file may legally name.) **So widening `DentalKind` would not change the
> on-disk shape**; the conclusion stands on totality alone. Reasoning from a comment instead of a call
> site is the failure this round was commissioned to catch, and it survived two revisions inside a
> passage labelled a correction.

So
**"Any model" is still not a kind — it is the absence of one** (`kind: undefined`, no object scene),
which is a run-level choice on the Drop page, exactly as `onAnyModel` is today. `profile` is an engine
identifier and is not renamed.

The visible labels must not be "Kind" and "Type": synonyms in English.

#### Icons and tooltips

- `ChoiceKey` takes `note`, but its comment says *"The start screen's keys do not have one"* — so
  Appliance tooltips are **words to write**, in three languages.
- `CARD_ICON` has **one** entry with the `generic` fallback at the call site, so every type but the
  reference aligner draws the same picture: the mechanism exists, the art does not.
- `ALIGNER_PROFILES` carries `description[lang]` in all three languages, and `DentalTypeStep` already
  renders it as a note. The words exist.

---

### 3. What happens to a file on import

**Engine COMPLETE, PUSHED and VENDORED: `6c37d20` (engine 62) and `b5a71ab` (engine 63);
`vendor/mixo-geocore/SOURCE.json` reads `engineVersion: 63`. App side PART BUILT: `diagnoseImported`,
`src/state/diagnosis.ts`, `src/items/rowState.ts` and `PrintUnit.diagnosis` are in and gated (§8
steps 4 and 6). What is left is the pages and the row's words, not the pipeline.**

*This header said "Not vendored — the tree is engine 61. App side unstarted." three rounds after both
became false. A status line that nobody re-reads is worse than none: §8 was the only honest record,
and a reader who trusted §3 would have rebuilt what already exists.*

#### The import pipeline is already multi-file

`App.tsx` accepts a drop of many files, loops them, estimates triangles per file, calls
`assertTriangleCapacity`, `assertMemoryCapacity` and `assertPlateCapacity` through `PlateLedger`,
places every imported unit, and only then branches the dental flow on `added[0]!`. The workers exist:
`importClient.ts` (`mode: 'per-job'`, so no worker heap survives a file), `importWorker.ts`,
`importProtocol.ts`, `prepareImport.ts`, `src/state/import.ts`.

**So there is no new `src/import/` pipeline to build.** The one-file assumption lives in two lines —
`StartScreen.tsx`'s `files.find(isStl)` and `App.tsx`'s `added[0]!` — and the work is a per-row
surface over a loop that already exists. That also answers an open question revision 2 carried: the
capacity assertions are **per file inside one per-drop reservation**, so a refusal is already per row.

#### Diagnose in the worker; repair on a press

**`diagnose_mesh` runs inside `importWorker`, not on the main thread.** The worker already owns the
full-resolution mesh and a progress channel; a host-side module would mean reading the full-res arrays
back across the boundary to diagnose them, N times, against the lowest-peak-memory rule, and blocking
the UI while a pacing bar it cannot update is on screen. Only the **verdict** crosses the boundary.

**`repair_mesh` runs only when the operator asks.** Three reasons:

1. The host's existing cleanup states the rule in its first line — *"Explicit repair, never implicit:
   … Nothing in the host calls this on its own"* (`removeDegenerate.ts`). Repair-on-press **complies**
   with it rather than departing from it.
2. `repair_mesh` returns a **new** mesh — a second full copy, per file. Automatic means importing that
   cost unasked.
3. The printed file would otherwise not be the file the operator supplied, with no consent point, and
   limit 1 below says a patch is never intersection-tested.

**The alternative, priced: diagnose only.** Ship the Items list with a verdict and a warning, and no
`repair_mesh` in the host at all. That deletes most of §8 step 9 — nine per-loop reasons
branched on in three languages, the `body-invariant` branch, the undo integration, the project-file
change recording that a file was repaired, and the verdict surface. **Repair earns its place in this
release because a holed aligner cannot be printed and the operator currently has no way to fix one
without leaving the app** — that is the whole reason the engine work was commissioned. If that turns
out to be rare in the 13 real scans (§8 step 5 measures it), diagnose-only is the better first ship
and repair moves to the next.

**Where the weld already happens.** Both import paths weld before anything else, but not in the same
place: the **glTF** path uses `prepareImport`'s `weld_positions_in_place` (its comment says *"Bulk
glTF position transform and first-seen weld"*), while the **STL** path — the only format the start
screen accepts, and the aligner path — welds inside the Rust STL session (`stlSession.ts`'s "Takes the
**welded** mesh out of the session"; the `'Welding vertices'` stage is posted by `importWorker.ts`,
not by the session). *Revision 2 cited the
glTF function for the STL path.* The conclusion stands either way: by the time diagnose sees the mesh
the weld's work is largely done, so **the repair's value here is winding, non-manifold splitting and
filling, not welding.**

#### Component-wise, and the trap

Repair never fuses two bodies. That rules out voxelise-and-isosurface, which guarantees watertightness
and destroys body identity.

**"Label components, then repair within each" does not work.** A cracked shell is already several
components *topologically* — two triangles meeting along a visible edge but carrying duplicate
vertices are not adjacent in the index buffer. So the engine carries two notions and treats them
oppositely: topological components, which welding is meant to reduce, and **physical bodies,
invariant**. The invariant is enforced at runtime: a step that would move a face between bodies
abandons the repair, `ok()` is false with `body-invariant:<step>`, and the file comes back
**unchanged** with its before-report filled.

Numbers, each derived: weld reuses `Tolerance::Weld`; the body gap is 0.005 mm, 100× that and a tenth
of the 0.05 mm the parts code already calls touching; a noise shell is < 0.001 mm³, reported, never
dropped.

#### Filling

```ts
repair_mesh(positions, indices, maxFillLoopMm)   // third argument REQUIRED, no engine default
```

Zero or non-finite fills nothing and reports `fill-disabled`, so no threshold is inherited by
accident. The engine patches a rim by one of three strategies and **refuses** a rim bending past **35%** of
its reach. Nine per-loop codes come back — `''` (filled), `fill-too-long`, `fill-non-planar`,
`fill-self-intersecting`, `fill-too-many-edges`, `fill-not-a-loop`, `fill-degenerate`,
`fill-spans-bodies`, `fill-disabled` — and **the host does not surface nine sentences.** Several name
engine-internal conditions an operator cannot act on, and `fill-disabled` is the one that is
**universal in this release**, not unreachable: the measured limit is 0, so every loop reports it.
(An earlier revision said "unreachable once step 5's constant exists" — exactly inverted, and
contradicted thirty-eight lines later by this section's own table.) The classifier maps them onto **three operator classes**: *filled*, *too long to fill
safely* (`fill-too-long`), and *shape refused* (everything else), with the raw code kept in the report
for diagnostics. **A loop left open always arrives with a reason**; nine codes do not mean 27
strings. (Method and thresholds are in geocore's `docs/mesh-repair.md`; they are engine altitude.)

#### Three limits the strip must not contradict

1. **A patch is never intersection-tested against the model.** Safety comes from refusing risky rim
   classes, not from checking the result.
2. **A rim bending past 35% of its reach is never filled.** (Earlier revisions said "a third", which
   does not match the engine's 35% cut-off, and this is the sentence the operator-facing text gets
   written from.)
3. `watertight` means *every* body closed, so one loop left open keeps it false.

#### The row's state — by which report, and exhaustive

Revision 2 had one four-row table keyed on `changed()`, a **repair** field, for rows describing a file
on which repair had not run. Two tables, each exhaustive over its own report:

**Before any press — from `diagnose_mesh`:**

| Condition | Says |
|---|---|
| could not be imported | **Could not be read** (`StlFormatError`, `StlEmptyError`, non-finite) — or **Too big for the plate**, naming the limit (`assertTriangleCapacity`, `assertMemoryCapacity`, `assertPlateCapacity`). Two different sentences: a capacity refusal read the file perfectly well. |
| `watertight` | Clean. Nothing to do. |
| `boundaryLoops > 0` | **Holes found.** Reports only — *Repair* is not in this release. |
| not watertight, no open loops | **Winding or non-manifold.** Reports only — *Repair* is not in this release. |

That last row is the one revision 2 had no state for — **and it is the expected case on this path**,
because the weld has already run, so what remains is exactly winding and non-manifold.

**After a press — from `repair_mesh`. NOT REACHABLE IN THIS RELEASE** (step 9 is cut), kept because
`rowState.ts` already implements and tests it and repair returns the day a holed scan exists. Nothing
in the shipped UI can produce any row below, so none of them needs text, `kit.html` markup or a
translation yet.

| Condition | Says |
|---|---|
| `ok() === false` | **Refused, file unchanged**, naming the step. Does not re-offer the same press. |
| `changed()` and `watertight` | Repaired. |
| `ok()` and **not** `changed()` | **Nothing to change.** Reached when the fill limit is zero (every loop reports `fill-disabled`, which is not a refusal) or when a pass finds nothing to move. Not "Repaired". |
| `changed()` and not watertight | Repaired; loops remain, **a reason per loop**. |

A pure function in **`src/items/rowState.ts`** maps a report to one of these, tested on its own; the
strip only renders it. Not `src/import/`, which does not exist, and not `src/core/import/`, which
`importOracleBoundary.test.ts` pins to exactly `estimate.ts` and `stlHeader.ts`.

#### Row progress — and which surface owns it

**`ledger`, pacing bar, leading label, stacked.** Revision 1 asked for a spinner inline, which is the
one combination the module refuses for `ledger` — and its reason applies here: *"paces rather than
spins so that a column of rows does not become a column of turning circles"*, and the Items list is a
column of rows.

**But the harder half is ownership, and that is the module's actual rule**: *"one piece of work
belongs to exactly one type."* Import today is a **`blocking`** job (`importClient.ts` passes
`blocking: true`) and already narrates itself as a `ledger` row in `JobActivity`, which also raises
`job-veil` over the screen for an import. So an Items page would show every import **twice** and veil
a page with no viewport behind it. **Decision: while the Start scene is up, the row owns the import** —
`JobActivity` suppresses import-context jobs and the veil is off on that scene. That is a behaviour
change, not styling, and it belongs in the step's exit criteria.

No Cancel on the row: one engine call has no mid-point to stop at. `ledger`'s `--red` tone is the
house progress fill and needs no change (§7).

**`data-ui` keyed to the import's id, never its position** — `items-row-<importId>` — because removing
a row re-indexes every row after it and the project rule is a *stable* name.

---

### 4. Where the flow ends

**Built, committed** (`FLOW_END`, `e5c5718`). Step 3's primary is **Export STL**
(`active-printable`) instead of OK. `reviewWayOn()` is the single decision; both review footers ask it.

#### The bug this introduced, and the fix

Removing OK removed the only thing that marked an aligner finished, and `exitCommands` strips the
supports and dental policy of any unit not in `dentalFinished`. So Export STL wrote a correct file and
**Exit emptied the plate behind it**; *Save project* then saved a bare model.

**Fixed** by a new session event `exportedDental`, sent by `dental.export` before the export, which
marks the unit finished without moving the stage. Session-only: finishing also *arranges* the plate,
and a moved unit drops the build the export is reading, which would make `runExport` refuse it as
stale. Four tests and walk check `x18b` hold it.

**x15–x18 all passed and none pressed Exit afterwards.** The project handoff already carried the
lesson from an identical miss — *when a step hands off to another step, walk the handover, not just
the step* — written down, and repeated anyway.

#### What that event does and does not mean

It fires **on the press, before the outcome is known**, and `runExport` has at least five paths that
write nothing (no active object, nothing to export, nothing came back, a refusal, a cancel). So:

- **It means "the operator declared this item done."** That is the right signal for *not stripping the
  plate* — a refused export must not cost the operator their supports.
- **It does not mean "a file was written."** So the finished *tally* and §5's eviction must not hang
  off it. They need a successful export, which requires giving `runExport` a result — and §4's
  no-navigate argument does not forbid a return value, only acting on it by navigating.

#### Export writes the file and stays on Step 3

`runExport` is `async` and reports every refusal only through the status line. Success and refusal are
indistinguishable to the caller today, so a press that navigated could walk the operator away from a
file that was never written.

#### Per item, not per plate

**This app does not slice.** Output goes to a slicer and the slicer arranges the plate.

`encodeStl` allocates one `ArrayBuffer(84 + triangles * 50)`. Revision 1 called that an unbounded
cliff; it is bounded by the plate limit **plus the generated supports**, which the plate guard does not
count — so no single figure is an upper bound, and revision 2's "~300 MB" overstated its own
precision.

And the buffer is not what distinguishes the two anyway: `useExport` awaits the **whole**
`outcome.files` array before looping the downloads, so `separate-*` already holds every buffer at once.
**What distinguishes per-item is one export task per item** — and the export client runs
`mode: 'per-job'`, *"a worker per job that ends with it, so nothing stays"*, so the whole worker heap
returns after each item.

**With one exception, which this work deliberately leaves alone.** `useExport` routes any export
holding a denture to `DentureClient`, built with **no `mode`**, so it defaults to `'persistent'` and
its heap does not return. Revision 4 proposed giving it `mode: 'per-job'`. **That would break the
denture flow**: the client is not an export client — it is *"the only way the app reaches the denture
engine"*, with nine job kinds and a **live-tilt handle held inside the worker across jobs**
(`liveOpen` once per model, then `liveAt` per tilt, then `liveClose`). Per-job would destroy that
handle between `live-open` and `live-at`, breaking Step 1 of the denture workflow, to reclaim a heap
after an export. The missing `mode` is deliberate, and `concurrency: 'serial'` is built on it.

So the per-item claim is stated for the paths it is true of — **Aligner and Any model** — and the
denture export heap, if it is ever worth reclaiming, is its own change with its own justification.
§0's problem is a case of several *aligners*.

**The plate seam stays**: `whole-printable` and `arrangeAlignerCommands` keep working.

---

### 5. Who frees the memory

**Mechanism built; the trigger and the widening are unstarted.**

**Tab closed** — nothing to do. `useProjectFile` already warns about unsaved work.

**Abandoned while running** — release is **driven by the scene**. `App.tsx` reconciles against
`scene.units`: an id no longer there gets `forgetUnit(id)`, and `built` / `failedBuilds` are pruned;
`BuildSessions.forget` frees that unit's session and every handle. Exit, delete, open-over and an Undo
that removes a unit all converge without being asked.

#### The seam is already vendored — no geocore change

```ts
export type BuiltSupports = Pick<GeneratedSupportMesh, 'dropped' | 'droppedByZones'>;
export interface UnitBuild<T extends BuiltSupports = GeneratedSupportMesh> { unit: PrintUnit; mesh: T }
```

Engine **61**, already in the tree, is generic over exactly the split revision 2 asked geocore for, and
`export.ts` already takes `ReadonlyMap<string, BuiltSupports>`. **No engine commit, no vendor round,
no second `gate:real`** — revision 2 scheduling one was unnecessary.

**But `BuiltSupports` is not the type to instantiate.** It is
`Pick<GeneratedSupportMesh, 'dropped' | 'droppedByZones'>` — **no `footprint`** — so
`UnitBuild<BuiltSupports>` would contradict step 11's own exit criterion and break `plateLayout.ts`,
which reads `entry.mesh.footprint`. The generic bound permits a wider app-side projection, so the plan
names one rather than leaving the implementer to invent it:

```ts
// src/supports/keptBuild.ts
export type KeptBuild = Pick<GeneratedSupportMesh,
  'dropped' | 'droppedByZones' | 'footprint' | 'unresolved' | 'dentalRimCoverage'>;
```

`unresolved` and `dentalRimCoverage` are there because of the two consumers below. The map becomes
`ReadonlyMap<string, UnitBuild<KeptBuild>>`: still app-side, still no engine change.

#### What eviction actually costs, stated rather than denied

Revision 1 deleted the whole `built` entry, which broke the export. Revision 2 said "the heavy `mesh`
is what gets dropped" and asserted the viewport still draws its supports. **Both cannot hold**:

- `supportMeshes` is `new Map([...built].map(([id, entry]) => [id, entry.mesh]))`, handed straight to
  the viewport, which also reads `mesh.unresolved` and `mesh.modelLanded` for its bubbles.
- `plateLayout.ts` reads `entry.mesh.footprint` to give `arrangeOnPlate` a real outline; without it the
  evicted unit is packed by its bounding box, degrading the arrange §4 keeps.
- `App.tsx` reads the build for the problems/verdict freshness comparison.
- **`App.tsx` passes `mesh.mesh.unresolved` to `denture.supports.resolveAll`** — so the *"Support every
  unresolved point from the model surface"* command silently becomes a no-op for an evicted unit.
- **`App.tsx` reads `activeMesh?.dentalRimCoverage?.needsReview`** and the outer/opening `maxGapMm`,
  which is the rim-gap disclosure walk `l4` pins.

Neither of those last two is in `BuiltSupports`, and neither was in revision 4's cost list — they
would have surfaced as test failures. **Either keep the fields in `KeptBuild` or name them as accepted
costs; do not discover them.**

**So an evicted unit stops drawing its support bodies and is packed by its box.** That is a visible
behaviour change and the price of the memory. `dropped`, `droppedByZones` and `footprint` stay; the
geometry (`positions` / `indices`) goes. If that price is too high, the answer is a cap on items, not a
pretence that eviction is free.

#### Two facts revision 2 stated and then dropped

- `forget()` on a **running** job clears the client's `sent` map, so every other unit re-uploads its
  model on its next build.
- `PlateLedger` holds an import **outside** `scene.units` until it settles, so a row removed before its
  unit exists is exactly the case the reconcile misses. Unreachable today; **reachable the moment
  removable rows ship**, so it belongs in that step's exit criteria.

---

### 6. What the reorder costs

- **Section `s` is `scripts/walk.mjs:2268–2424`** (`if (runs('s'))` at 2269; the block closes after
  `s19` at 2421 and a trailing mode-clearing Exit) **and holds 21 `check` calls**: s1–s19 plus
  `s2b` plus `u1a`. **`u1a` is a `u`-id living inside section `s`**, so an id-prefix rewrite walks past
  it, and it pins the exact heading *"What would you like to support?"* and footer *"Choose what to
  make supports for."* — both of which move. (Line numbers drift in a dirty tree; re-read them at
  rewrite time rather than trusting these.)
- **Section `s` selects by CSS class, not `data-ui`** — `.start-task`, `.start-screen .choice-keys`,
  `.start-screen .dental-drop`, and the drop is dispatched onto `.start-screen`. The rule "every new
  element gets a `data-ui`" says nothing about those, so the new pages must state their class names
  and the replacement heading and footer strings in three languages, or the rewrite is guesswork.
- **Section `u` tests the type screen directly** (`u0` the single card, `u1` Exit at Step 0, `u2` the
  card going to Step 1). Revision 2 counted only section `s`.
- **`walkLocale` cannot simply go "into the gate"** — but not for the reason earlier revisions gave.
  It runs *instead of* the English walk (`if (process.env.WALK_LOCALES) { … } else await walk(…)`), and
  **nothing ever runs it**: there is no `walk:locales` script in `package.json` and CI runs
  `npm run walk` with no `WALK_LOCALES`. That is the gap — a script and a CI job, not a restructure.

  > Revisions 3 and 4 said "the walk never exits non-zero". **False.** `scripts/walk.mjs` ends with
  > `process.exit(failed === 0 ? 0 : 1)`, and `check()` pushes into the same `results` array for the
  > locale pass too, so the exit code already covers both. The claim came from a reviewer report that
  > I adopted without checking, and it was consistent with what I had seen because **my own shell
  > pipeline masked it**: I ran `npm run walk > file; echo "exit $?"; grep …`, so the status I read
  > was the *grep's*. I then wrote "the exit code is meaningless" into a commit message as a property
  > of the tool. It is a property of how I invoked it.
- The Drop page must state its formats: the start screen accepts `.stl` only today while the bench
  advertises STL, GLB and glTF — **and `.stl` only would be a narrowing of the screen it replaces**,
  since the dental flow's own Step 1 input already accepts `.stl,.glb,.gltf` and the Drop page
  supersedes it. **Recommendations**, since the house rule is never to ask without one:
  a project file in a mixed drop wins and the rest are refused per row with a reason; an unreadable
  file fails its own row only; the Drop page accepts the bench's three formats so the two doors stop
  disagreeing.

#### The bug this measurement found, unrelated to the plan

`walkLocale`'s t1 expected a task key *"Aligner supports"* that is in no component and no dictionary,
and omitted Denture. It failed for every language including English and killed the locale pass at its
second step — invisibly, because `walkLocale` is outside the gate. **Fixed**, with the account left in
place. The stale label still appears in **five** files: `docs/ROADMAP.md`, `README.md`,
`docs/designer-guide.md`, `docs/dental/plain-language.md` and `docs/SHIP-PLAN.md`.

#### The alternative weighed

**Keep the current three-screen order and accept N files on the existing file screen.** No section-`s`
rewrite, no locale breakage, no badge renumbering. What it does not give: a per-file verdict before any
flow starts, and a single place to see a case. **The Items page wins on that, and only that** — which
with per-row Appliance now dropped (§2) is a much smaller claim than revision 2 made for it.

---

### 7. The UI, in house terms

**Decided, unbuilt.** The feature adds two pages, a row, a verdict and a set of refusal texts. This
section is what the project's own rules require of them, because four guards enforce those rules and
each has caught something in this session already.

#### Tokens — and the one this plan got wrong

**There is no app row-height token.** Earlier revisions said "use the documented `--row` token
(22px)". `--row` is declared only in `typelab/tokens.css`, under a heading in
`docs/ui-styling.md` whose own first line reads *"The tokens of `typelab/tokens.css`
**that the app does not have**."* So `var(--row)` in `src/styles.css` resolves to nothing and the
declaration is dropped **silently** — and `uiStylingDoc.test.ts` would not catch it, because the name
*is* documented, just in the wrong table.

**DONE.** `--row-height: 24px` is declared in `src/styles.css` and documented in the app's UI table.
**24px, not 22px:** that is what the app already uses — `.panel .unit` carried it as a literal, and the
token now replaces that literal rather than sitting unused beside it. The 22px of
`typelab/tokens.css` is a denser viewer's figure.

The names are kept **apart on purpose**. `uiStylingDoc.test.ts` asks only whether a token's name
appears *somewhere* in the page, so a second `--row` would have passed the guard while meaning a
different height in a different stylesheet — the exact failure this section was written to avoid.

**`ledger`'s `--red` tone is NOT a problem, and this document was wrong to call it one.** `--red` is
`#7f0019` in `src/styles.css:15` — the house **primary and progress** colour, what `.primary` is filled
with. The failure colour is `--danger` (`#b3261e`), used as an outline and never as a fill
(`styles.css:159`). So a `ledger` bar in `--red` is the progress fill doing exactly what the house
style says it does, and there is nothing to change.

*The error was reading the token's NAME instead of its value* — "red" sounded like an alert, and
`docs/ui-styling.md`'s own table (line 39) lists `--red` as an alias in the `--primary` row, which
reads that way too. One `grep` of `styles.css` settles it. The open item in §9 is withdrawn.

#### `data-ui`, and why the row is the hard case

Every new element gets a unique **stable** name. For the Items row that rules out the obvious choice:
`items-row-<index>` re-points every later row when one is removed. **Key it to the import's id.**

And `ProgressIndicator` carries no `data-ui` of its own — the name lives on the `Progress` wrapper and
is per *type*, not per instance. A row that borrows the indicator is therefore unnamed by
construction, so the row must name it: `items-progress-<importId>`.

This is not hypothetical. `src/progress/README.md` records a walk check that looked at the **first** of
a set of identically-named progress elements and reported the rest as missing — a false gap that cost
a round of investigation in this very session. N rows sharing a name would reproduce it exactly.

#### Classes the walk already depends on

Section `s` selects by **CSS class, not `data-ui`**: `.start-task`, `.start-screen .choice-keys`,
`.start-screen .dental-drop`, and the synthetic drop is dispatched onto `.start-screen`. So "every new
element gets a `data-ui`" is not sufficient for the rewrite — the new pages must also state their
**class names**, or the walk rewrite is guesswork. `u1a` additionally pins the exact heading *"What
would you like to support?"* and footer *"Choose what to make supports for."*, both of which move.

#### House style, and the three-language constraint

Rows are dense, radius 2px, hairlines rather than shadows, light theme only. The chosen state is an
**ink fill with paper text**, never the accent; red (`--red`, `#7f0019`) is the one primary action, the
progress fill, and the current-item marker, and **nothing else**. A destructive row action is a
`--danger` outline, never a filled red. `noColourLiterals.test.ts` fails on a colour literal **and**
on an inline `style={`.

**The sizes: 22px and 11.5px are the house-skill numbers, not this app's.** This app's body size is
`--body-size`, **12.5px** (`theme.css:102`, and `styles.css:1295` uses it with that literal as its
fallback); 11.5px is `--small-size`. And `--row: 22px` is declared **only** in
`typelab/tokens.css:44`, documented in that file's table at `docs/ui-styling.md:478`.
So the row must either size from an app token that exists or declare one — the remaining real task,
and the only one of the three token questions that survived checking.

Labels must fit at 11.5px in **en, ja and zh-Hant**; a long label wraps the value to its own line and
never clips. zh-Hant is Taiwan wording via Gemini, checked against the real locale entries.

**New concepts need glossary terms.** *Appliance* is a new concept, so `glossary.test.ts` wants a
per-language term for it — the same guard that caught a wrong translation earlier in this session
because zh-Hant needed 支撐柱/支撐頭 and ja 支柱/先端. New ja glyphs mean `npm run fonts` to re-cut the
subset, or `japaneseSubset.test.ts` fails.

#### The style book is where these get judged

`kit.html` (`src/kit/Catalogue.tsx`) is the only surface in this app that screenshots cleanly — the
running app lays out at 1685 CSS px and the browser pane captures the top-left corner only. The three
waiting types already appear there, built from `PROGRESS_TYPES` so a new one shows up on its own.

**The Items row and the five reachable row states belong in `kit.html`**, each rendered once, so the
operator wording and the dense layout can be reviewed without importing a file and waiting for a
verdict. That is also the only way to see "could not be read" and "too big" at all, since both need a
deliberately broken or oversized file to reach in the real app. (Five, not nine: the four repair
states are cut with step 9. Derive the list from `ROW_STATES`, never by hand.)

#### The two pages, specified

Round 4's loudest finding was that this section states the *rules* for the UI and never the UI. The
only layout line in the document was §1's "preview, verdict, progress". Below is the specification,
written so 7a and 7b can start. **Every name, string and token here is a proposal I am putting in
writing rather than a question held open** — correct any of it and the steps follow the correction.

##### Drop (page 1)

One column, centred as a block, ranged-left text inside it. Top to bottom:

| Region | `data-ui` | Class | Contents |
|---|---|---|---|
| Logo + title | — | `.start-head` | Unchanged from the task screen today. |
| Drop zone | `drop-zone` | `.start-screen .drop-zone` | The whole column is the drop target, as `.start-screen` is today, so the walk's synthetic drop keeps working. |
| Purpose keys | `drop-purpose-aligner`, `drop-purpose-denture`, `drop-purpose-any` | `.start-screen .choice-keys` | The three keys that are on the task screen today, class retained so section `s` keeps selecting them. |
| Open a saved project | `drop-open-project` | `.start-open` | Moved from the task screen. |

**Heading: "What are you making?"** Footer: **"Drop one or more files, or choose what to make."**
Both replace the strings `u1a` pins today (*"What would you like to support?"* / *"Choose what to make
supports for."*), so `u1a` is rewritten with them in 7d.

**The question is named *Purpose*, not *Appliance*.** §9 left this open and it blocks 7a, so: *Appliance*
is already the glossary term for **the object itself** — an aligner, a denture — and reusing it for the
*question about* that object makes one word mean two things in one view, in three languages. *Purpose*
names the question and collides with nothing. `Appliance` keeps its glossary entry for the object.

**Accept list:** `.stl` only, as today. A dropped file of any other type is refused per-file (`4718e21`),
so a mixed drop imports what it can and names what it could not — §6's rule, and walk `m1` already
proves it.

##### Items (page 2)

One row per dropped file, in drop order, in the same single column. The column has a heading
(**"Your files"**), the rows, and one primary at the foot.

| Row part | `data-ui` | Class | Contents |
|---|---|---|---|
| Name | — | `.items-row .name` | The file's name, truncated with the full name as `title`. |
| Preview | `items-preview-<importId>` | `.items-row .preview` | **Not rendered geometry** — see below. |
| Verdict | `items-verdict-<importId>` | `.items-row .verdict` | One of the five sentences. |
| Progress | `items-progress-<importId>` | `.items-row .progress` | The borrowed `ledger` indicator, named here because `ProgressIndicator` has none. |
| Remove | `items-remove-<importId>` | `.items-row .remove` | `--danger` **outline**, never a fill. Calls `reservation.release()` when the unit does not exist yet. |
| Foot | `items-start` | `.items-foot` | The one primary: **"Start with the first item"**. |

Keyed to `importId`, never to an index, for the reason this section already gives.

**The preview is a text summary, not a thumbnail, and this is a memory decision rather than a visual
one.** §0's whole argument is that the release adds no per-file transient copy; a rendered thumbnail
per row would add exactly that — the one new per-row cost in the feature — and at 12.2 MB a model and a
cap of 8 it is the largest thing on the page. So the preview region carries **triangle count and
bounding-box size in mm**, both already in hand (`diagnose_mesh` returns `triangles`; bounds come from
`meshBounds`, which `placeImportedUnits` already calls). A thumbnail becomes worth revisiting the day
a row needs to disambiguate two files with the same name, and not before.

**Icons and tooltips.** Each of the three Purpose keys and the Remove action takes an icon plus a
`title`. The icons are the app's existing set; the tooltips are the only new strings:

| Control | Tooltip (en) |
|---|---|
| Aligner | Clear aligners and retainers. |
| Denture | Dentures and try-ins. |
| Any model | Any other model, with no dental steps. |
| Remove | Take this file off the list. |

**The verdict sentences** — five, because repair is cut. Each is one sentence, ranged left, no period
on the count fragments:

| State | Sentence (en) |
|---|---|
| `clean` | Ready to print. |
| `holes` | Has {n} open edge loops. It can still be printed, but check the result. |
| `malformed` | Has {n} edges shared by more than two faces. It can still be printed, but check the result. |
| `unreadable` | Could not be read. |
| `too-big` | Too big for the plate: {n} triangles, limit {limit}. |

Two things these say on purpose. **Neither defect sentence tells the operator to fix it**, because
nothing in this release can — offering a fix with no press behind it is the worse lie. And `holes` and
`malformed` stay separate sentences even though both end the same way, because step 5 measured them as
genuinely different populations: zero files with open rims, 8 of 18 with non-manifold edges. One
merged sentence would hide which of the two the operator is looking at.

**The row keeps `ledger` as it is.** `--red` is the house progress fill, so the bar is already right;
the only token work is the row's **height**, which has no app token yet. Nothing about the row needs a
call-site override, which the progress module forbids anyway.

##### Memory on quit, restated for these pages

A row removed before its unit exists calls `reservation.release()` — **per row**, not the whole hold.
§9 left this open and L790/L802 contradicted each other; releasing the whole hold would drop the files
the operator kept, which is the opposite of what pressing Remove on one row means. The whole hold is
released only when every row is gone or the scene is abandoned.

### 8. Sequence

Each step names its files, its exit criterion and its tests. Every new element gets a `data-ui`; every
new string gets en / ja / zh-Hant, **zh-Hant in Taiwan wording via Gemini, checked against the real
locale entries, never invented ones**.

**0. Attribute walk `g` and `s17`. — `g` IS DONE: it is pre-existing.**

Checked out `1db2987` (the commit before any of this work), ran `node scripts/walk.mjs --only=a`, and
`g` failed there too — **identical output, `selected 0` on the unthrottled stroke and the same hash
`#811c9dc5`**, and the only failure in that section: `1 FAIL (29 checks) [only a]`. So `g` is **not**
caused by this session's changes.

Two consequences worth keeping. **The "94 checks 0 FAIL" gate recorded in the project handoff for that
commit cannot have been read correctly** — which is unsurprising now that the exit-code mistake above
is known. And **my `g` fix (pressing Select before the measured pair) was unnecessary**; it is
harmless and makes the check independent of what the previous one leaves the switch on, so it stays,
but it was not the cause.

**The criterion is now plain `ALL PASS`.** The full walk passed at `83a4998`: **ALL PASS, 153 checks,
2113 s**, `g` included. `s17` is fixed and passes 5/5, so the old clause "no new failures beside `g`
and `s17`" licensed a regression in a check that works — it is withdrawn.

**`g`'s cause is found, and it was never one question.** The check asserted two things on one line:
that a brush queue formed under CPU throttling (a precondition about the MACHINE) and that switching
Select to Unselect mid-queue leaves the same state as doing them in order (the assertion about the
APP). It failed whenever either gave way, and the text could not say which — which is why this
document called it flaky, then deterministic, then flaky again across three revisions.

The run that settled it: both hashes `#811c9dc5`, **identical**, so the app assertion held; and
`pendingAtSwitch` **0**, so no queue ever formed. The walk's own comment already described this case
— *"too slow and the pointer moves are dropped outright … which is how this failed on this machine at
4x, after already being lowered from 6x"* — and the machine was carrying an orphaned 11 GB dev server
at the time.

So it is split: **`g-pre`** owns the precondition and fails loudly when the machine cannot build a
queue, and **`g`** owns the app assertion and still has to pass. A check that could not run is not a
check that passed, so neither is silenced; they simply no longer share a verdict.

*Step 0 is now done.* The criterion stays plain `ALL PASS`.

**1. Done — `e5c5718`.** `src/scenes/`, `src/bench/`, `FLOW_END`, `reviewWayOn` and its four sites,
the `exportedDental` fix, `src/App.tsx`, `src/components/{ModeEntry,StartScreen,DentalSupports}.tsx`,
both `DentureReviewPanel` files, `DentalBar.test.tsx`, both locale files, the font subset,
`scripts/walk.mjs`, `docs/ui-styling.md`, `docs/design/ui-structure.md`, this doc and the review
artefacts. **Walk now: `1 FAIL (152 checks)`, and the one failure is `g`**, proven pre-existing at `1db2987`
(step 0). `s17` is fixed. So there are **no new failures** from any of this work.

**2. Run the locale pass. — DONE.** `walk:locales` is
`node scripts/walk.mjs --locales=en,ja,zh-Hant` — a **flag**, not the env var, because
`WALK_LOCALES=…` in an npm script is not portable to Windows and this needed no new dependency; it
matches the file's existing `--only=` convention. CI runs it as its own step, because `walkLocale`
*replaces* the English walk rather than adding to it.

**And CI was masking walk failures the same way I was.** The step read
`npm run walk 2>&1 | tee walk-out/walk.log`, and a pipeline's status is the **last** command's — so
CI has been reading `tee`'s. The walk itself exits 1 correctly. Both steps now `set -o pipefail`.
That is how the "Aligner supports" locale bug stayed invisible: nothing ran the pass, and nothing
would have failed if it had.

**3. Correct what earlier revisions got wrong, in code.** The `SceneScope` comment and
`src/scenes/README.md`'s multi-file section (two sites); `scope`'s justification, or retire the field;
`benchScene.ts`'s header and `BENCH_ARRIVALS` plus its test (the `finishDental` arrival is unreachable
under `FLOW_END`); `ledger`'s `place` in `progressTypes.ts`, `src/progress/README.md` **and**
`docs/ui-styling.md`; and `SCENES.start.purpose` / `owns` plus `sceneMap.test.ts`'s `'task'` / `'type'`
literals, **which go stale silently because `sceneOf` takes `string | null`** — the exact failure this
step exists to catch.
*Exit:* `npm test` green and no file asserting what another denies.

**4. Vendor engine 63 and gate it. — DONE.** `SOURCE.json` records
`b5a71abb69c3f4419a7b8f571c4dcb6a7b402ed2`, engine **63**; `vendor:check` 0, `tsc` 0, **1301 tests**,
build 0, and **`real-scan gate: PASS (13 scans)`** with *"No differences."* — the literal line, and no
skip. `host/core/repairMesh.ts` arrived with it, so `diagnose_mesh` and `repair_mesh` are now reachable
from the app. The procedure that worked, kept for the next engine bump: `git fetch`, `git checkout b5a71ab`, confirm
`git branch -r --contains b5a71ab`, a clean `crates`/`host`/`editing` tree, `npm run wasm:build`. Then
here: `npm run vendor:geometry`. The command has **no commit selector** — it vendors whatever the
engine checkout's HEAD is — so the checkout is the step.
*Exit:* `SOURCE.json.engineVersion === 63`; `npm run vendor:check`; `npx tsc --noEmit`; `npm test`;
`npm run build`; and the literal line **`real-scan gate: PASS (13 scans)`** — not exit 0, which
`real-scan-gate.mjs` also returns when it **skips** for want of local scans.

**5. Measure, and set the fill limit. — DONE, and it changed the scope.** `scripts/measure-rim-loops.mjs`
runs `diagnose_mesh` over all 18 local real scans. It prints a content hash per file, never a
filename, because `samples/case-*` is clinical data.

**The result:**

| | |
|---|---|
| Open boundary rims, 18 files | **0** |
| Files with a defect repair could fix | **8 of 18** |
| Worst non-manifold edge count | **5,547** (and one file reports **525 bodies**) |
| Largest model held | **12.2 MB** of positions + indices |

**So `MAX_FILL_LOOP_MM = 0.0`** — fill nothing. Not a cautious default: there is **no rim to measure**
in this corpus, so any non-zero limit would be a number nobody has evidence for, and §3's limit 1 says
a filled patch is never intersection-tested. With 0 the engine reports `fill-disabled` on every loop,
which is the honest state.

**Which retires engine 63's filling from this release.** §3 set the valve: *"if holes turn out to be
rare in the 13 real scans, diagnose-only is the better first ship."* Holes are not rare — they are
**absent**. Filling stays in the engine, unused behind a zero limit, until a holed scan exists.

**And it sharpens what repair is for.** §3 said the value here is "winding, non-manifold splitting and
filling, not welding". The measurement narrows it again: **non-manifold splitting**, on 8 of 18 files.
Several are `NOT watertight` with **zero** boundary loops — non-manifold edges break watertightness
without opening a rim, which is why the row states key on both and not on holes alone.

**The row cap follows from the same pass:** 12.2 MB × N for the models alone, before supports. A cap
of 8 is ~100 MB held, which is the number §9's recommendation now has instead of a guess.

*The procedure, for the next time:* Loop `diagnose_mesh` over the 13 scans (a new script under
`scripts/`), read `take_loops()`. **The rule: the limit is the 95th percentile of open-rim length
across the scans, rounded down to 0.1 mm** — p95 rather than the maximum so one pathological scan
cannot authorise filling a rim nobody has judged, and rounded down because §3 limit 1 means an
unverified patch. Lands as a named host-side constant with its derivation and the measured
distribution in its comment. Measure retained bytes per model in the same pass, for §9's cap.
**NO CONSTANT WAS INTRODUCED, and that is the right outcome — but this step's exit said otherwise.**
`MAX_FILL_LOOP_MM` appears nowhere in `src/` or `vendor/`: the only two occurrences in the tree are
`console.log` strings in `scripts/measure-rim-loops.mjs`. The step was marked DONE against an exit it
does not meet, and step 9 was left with nothing to pass to `repair_mesh`.

The honest position: at a measured limit of **0** a named constant would be a parameter with one
possible value and no caller, which §1's own argument against `scope` rejects. So **step 9 passes a
literal `0`** at its single call site, with a comment naming `scripts/measure-rim-loops.mjs` as the
derivation and the 0-rims-over-18-scans result as the reason. A constant is introduced the day a
holed scan exists and the limit becomes a real number — not before.

*Exit (corrected):* the measured distribution is recorded here, the measurement script is
committed.

**6. Diagnose in the worker. — DONE.**

`src/items/rowState.ts` + tests + README: **nine row states as three tested partitions**, pure, no
UI. A test asserts the declared list and the *reachable* set are equal, because this table was wrong
twice — once not exclusive (a holed file matched "Clean"), once not exhaustive (an untouched file fell
through to "Repaired").

**It is in `src/items/`, not `src/core/import/`.** It was written there first, on a reviewer's
suggestion, and `importOracleBoundary.test.ts` refused it: that folder is pinned to exactly
`estimate.ts` and `stlHeader.ts` so the TypeScript import geometry cannot creep back after being moved
to Rust. Widening the guard would have weakened a boundary doing its job — and the classifier belongs
with the Items page anyway, since the importer produces a report and this turns a report into a row.

Step 5's measurement shaped the code: `clean` tests `watertight` rather than counting loops, because
8 of 18 scans are not watertight **with no hole in them**; and `unchanged` is on the common path,
because at a fill limit of 0 every loop reports `fill-disabled`, which is not a refusal.

**And the wiring.** `diagnoseImported` in `prepareImport.ts` runs `diagnose_mesh` on the
**full-resolution** mesh — never the display copy, whose topology is a decimation's and not the
file's — and `importWorker.ts` calls it per prepared mesh after the weld. Only the **verdict**
crosses the boundary: `ImportDiagnosis` is seven plain fields, not the per-body report with
its rim arrays.

`ImportDiagnosis` is declared in **`src/state/diagnosis.ts`**, a leaf module holding that one type.
Five of its seven fields are `Pick`ed from the vendored `RepairReport`: declaring them again shared
57 % of the file's lines with `host/core/repairMesh.ts` and `noDuplicatePackages.test.ts` refused it,
and picking leaves the engine owning their meaning so a rename there breaks this build. An earlier revision of this plan put it on the worker protocol, so that `src/items`
imported it and the UI depended on the worker's output rather than the reverse. That stopped working
the moment the verdict became a saved field: `PrintUnit` would then import from `src/workers/`, and
`src/state/import.ts` — which carries the verdict onto the unit — already imports from
`src/state/project.ts`. Declaring it in `project.ts` drags the whole scene module into the worker
bundle; declaring it in `import.ts` makes `project.ts` import back from a module that imports it. A
leaf is the only home with neither problem, and all four readers now point at it.

`src/workers/diagnoseImported.test.ts` proves the mapping **against the real engine**: a closed
tetrahedron is watertight with no rim; one triangle has a single rim measuring **12 mm** for a 3-4-5
triangle, which is how we know `longestRimMm` carries millimetres and not a count; two tetrahedra
50 mm apart report **2 bodies**; and three triangles sharing an edge carry a non-manifold count — the
case all 8 of the affected real scans land in.

*Build:* `diagnose_mesh` after the weld in `importWorker.ts`, full-resolution
mesh, verdict only across the boundary. `src/items/` (new module, README, tests) holds the host-side
pure classifier — its input is a **union**, `DiagnoseReport | CodedError`, because half of §3's first
table comes from the capacity guards and the STL reader rather than from `diagnose_mesh` — mapping one
of those to a row state, and the three-language text for the **five reachable row sentences**
(`unreadable`, `too-big`, `clean`, `holes`, `malformed`) — derive them from `ROW_STATES` minus the four
that only a repair can produce, never a hand-copied count, which has been wrong at every revision —
the coded import
errors, and the three operator classes the nine `fill-*` codes collapse to.
*Exit:* one test per row state in both of §3's tables, on the classifier, with no UI.

**Persistence, done with this step rather than 7b.** The verdict is saved as `PrintUnit.diagnosis`
and carried over by `placeImportedUnits`. It describes the mesh as imported, so no command touches
it — a repair is the one thing that may replace it, because a repair is the one thing that replaces
`source`. `normalizeUnit` re-checks a saved verdict and **drops a malformed one rather than throwing**,
unlike `rimDraft` and `dental`, which stop the load: those reach the engine, while this is a label on
a row, and a sound project should not refuse to open because a label is corrupt. The gate takes
`diagnosis` out of the `...unit` spread before re-adding it, because `...(ok ? { x } : {})` adds
nothing on the reject branch and so cannot remove a bad value already copied in — the first version
of this gate had that bug and a test caught it.

The verdict also carries **`triangles`**, which no row displays. It is there so the gate can compare
a saved verdict against the mesh it is attached to and drop a mismatch. A stale verdict is the one
failure mode that does not look like corruption — every field parses, and the row states it as fact
about geometry the engine never saw. **Step 9 is the change that would cause it**, since repair is
what replaces `source`, so the check exists before the thing it guards against.

*Remaining for the row:* only the three-language sentences and the row component itself (step 6a,
landing with 7b). The verdict is stored, so a row can now read it.

**6a. The UI groundwork** (§7). Declare the app row-height token in `src/styles.css` and add it to
the app token table in `docs/ui-styling.md`; decide and document the neutral row tone so `ledger`'s
`--red` does not reach a routine row; add the glossary terms for *Appliance* in all three languages;
add the **five reachable** row states to `kit.html` as static markup (derived from `ROW_STATES`, not
listed by hand; the four repair states are cut with step 9) so the wording and density can be judged
without importing a file — **not the row component**, which is step 7b's, because a step must not
need the one after it.
*Exit:* `uiStylingDoc.test.ts`, `noColourLiterals.test.ts`, `glossary.test.ts`,
`japaneseSubset.test.ts` and `i18n.test.ts` all green, and every state visible in `kit.html`.

**7a. The Drop page and the drop loop. — THE LOOP HALF IS DONE; the page is not.**

**Per-file isolation landed.** The read loop sat inside one `try`, so any refusal — a damaged STL, a
triangle or memory cap, a full plate — aborted the whole drop and added **nothing**. Each file's read
now has its own `try`. A **cancel is still the whole drop**: one `AbortController` covers every file
and stopping means the operator wants nothing added, so an abort is re-thrown rather than collected.
The reservation self-corrects, because `adding` never rises for a refused file; with no successes at
all it releases and reports as before. **No new string**: when some files import and one does not, the
refusal wins the status line, because that is the actionable news and the successes are on the plate.

Walk **`m1`**, in its own section so it re-runs in **13 seconds** rather than thirty minutes:
three files, the middle one damaged → `units 2` and the status naming the refused file.

*Remaining:* the Drop page itself — `StartScreenId` gaining `drop`, the task keys moving onto it,
`StartScreen` taking `File[]`, and the reservation-grain decision for a row abandoned before its unit
exists.

**7a (original).** The Drop page and the drop loop. `StartScreenId` gains `drop`; the task screen's three keys
and *Open a saved project* move onto it; `StartScreen` takes `File[]` instead of `files.find(isStl)`;
and the loop restructures for **per-file isolation** — today one `try`, one `PLATE.open()` and one
`AbortController` wrap the whole drop, so a single refusal **aborts the entire drop and adds nothing**.
Per-file try/commit, and the reservation grain decided: `release()` drops the whole drop's hold, so an
abandoned row needs either a per-file `PLATE.open()` or a per-row handle — a `plateLedger.ts` API
change with its own tests. Decide which; do not leave it.
*Exit:* a drop of three files where one is corrupt imports the other two, and the tree is green with
the three-screen flow still working.

**7b. The Items page and the loop** — `src/items/` (new module, README, tests). `StartScreenId` becomes
`drop | items`; the task screen's three keys and *Open a saved project* move to Drop; `StartScreen`
takes `File[]`; the drop loop streams each file into a unit instead of accumulating (§0); the Items row
renders the `ledger` indicator and **owns the import while the Start scene is up**, with `JobActivity`
suppressing import jobs and the veil off; `data-ui` keyed to the import id, and `items-progress-<importId>` on the borrowed indicator since
`ProgressIndicator` has no name of its own. Section `s` **and** the section `u` type-screen checks
rewritten; the Drop page's formats and mixed-drop behaviour per §6. **Removing a row before its unit
exists must call `reservation.release()`** — `PlateLedger` holds that import outside `scene.units`, so
the scene reconcile never sees it, and no other step owns this.

**THE LOOP DOES NOT WORK AS WRITTEN, and this is the step's real design problem.** Earlier revisions
said only "use `useSelectedAligner` / `startDentalAligner`, never `startDental` (which resets
`dentalFinished: []`)". The second half is true and verified (`editingMode.ts:219`). The first half is
not enough, for three reasons read off the code:

- `useSelectedAligner` **returns silently** unless `acceptsDentalDrop(session)`, which requires
  `dentalStage === 'aligner'` (`editingMode.ts:353`, `App.tsx:818`). After item 1 the stage is
  `review`, so the press does nothing at all.
- `startDentalAligner` does not rescue it. It opens with `send({ type: 'dentalLoading' })`, and that
  reducer case is a **no-op outside stage `aligner`** (`editingMode.ts:230`). `startAligner`'s own
  `stale()` then sees `dentalAligner !== 'loading'` and aborts the orient job.
- Neither takes a unit id: `useSelectedAligner` reads `sceneRef.current.activeUnitId`, and
  `startAligner`'s `stale()` requires `activeUnitId === unit.id`. Nothing in the loop sets it.

**But NO new session event is needed, and an earlier revision of this line was wrong to ask for one.**
`addAnotherDental` already makes exactly that transition: stage `review` to stage `aligner`,
`dentalAligner` back to `prompt`, `dentalUnitId` cleared, and `dentalFinished` preserved through
`finished()`. `src/dental/editing/session.test.ts:317` has proven the preservation since before this
feature existed. Adding a second event beside it would have been a duplicate transition — two ways to
leave `review`, drifting apart.

What was genuinely missing is narrower: **which unit**, a question the old flow never had to ask
because it only ever had one. That is `src/items/nextItem.ts`.

So *Next item* is three ordinary calls, and **the order is the whole subtlety**:

1. `selection/set` with `activeUnitId` on the next unit. `startAligner`'s staleness check reads
   `sceneRef.current.activeUnitId` and abandons the orient job if it is not the unit it was handed, so
   the scene must point at the next item **before** the job starts.
2. `addAnotherDental` with the unit just finished — this is what returns the stage to `aligner`.
   `dentalLoading` is a no-op outside that stage, so a job started first would die silently.
3. `startDentalAligner(next)`.

**And item 1's entry is unstated.** `startDentalAligner` needs `mode === 'dental'`, which from `off`
is reachable only through the entry paths this step forbids. Name that path, or the loop has no first
iteration either.

**The multi-file drop is sliced to one file today.** `App.tsx:692` reads
`files.filter(acceptModelFile).slice(0, dentalDrop ? 1 : undefined)`, so while a dental session is
live a five-file drop silently becomes one — the exact case the Items page exists for. The slice
moves behind "is the Start scene up", not "is a dental session live", and a walk check asserts a
five-file drop yields five rows with a session already open.
*Exit:* **not** `ALL PASS` — step 7d owns the walk rewrite, and a step must not need the one after
it. 7b's exit is: `tsc`, the suite, the build, the new `src/items/` tests, a walk check that a
five-file drop with a live session yields five rows, and a walk check that *Next item* reaches item 2
with `dentalFinished` still holding item 1. The whole-walk `ALL PASS` is **7d's** exit, stated once.

*The superseded wording, kept because it was wrong in an instructive way:* `ALL PASS` on the whole walk — not section `s` alone, because `enterEditor`'s seven call sites
all sit outside it — plus `npm run walk:locales` green, and *Any model* still reaching the bench
asserted by a **walk** check, not by `sceneMap.test.ts`, which tests a frozen table and cannot assert
reachability.

**7c. Remove the type screen** — this was step 8, and it moves **before** the walk rewrite: the
section `u` checks (`u0`, `u1`, `u2`) exercise the in-flow type card, so rewriting them while the card
still exists leaves the walk red. Delete `dentalStage: 'type'` and its sites (§1), and make **Back at
Orient return to the Items page without ending the session** — today it sends `exit` and discards
`dentalFinished`, which with a live case loses every finished item.
*Exit:* `npm test` green, and a walk check that Back at Orient keeps `dentalFinished`.

**7d. The walk rewrite** — section `s` (**`s1` at 2331 through `s19` at 2486**, 21 checks including
`s2b` and `u1a`), the section `u` type-screen checks, and the *Add another aligner* → *Next item*
checks (**`x1` at 1940, `x1b` at 1935, `x14` at 2114**).

*This range has been wrong at four successive revisions — 2268–2424 cut off `s14` onward, which are
precisely the checks 7c changes, and `u2`/`u11` are unrelated checks. Re-grep the IDs when this step
starts; do not trust the numbers above either.*
*Exit:* `ALL PASS`, with the check count stated so a dropped check is visible.

**8. — moved to step 7c**, because the walk rewrite depends on it. (Was: remove the type screen.)

> Revisions 3 and 4 said `chooseDentalProfile` is the only writer of `dentalProfile`, so `startDental`
> must become it. **False, and phantom work**: `startDental` already writes
> `dentalProfile: event.profile`, and `switchDentalProfile` is a third writer. Another claim adopted
> from a reviewer report without checking the source.
*Exit:* `npm test` green, and a walk check that Back at Orient keeps `dentalFinished`.

**9. Repair on a press — CUT FROM THIS RELEASE.** Not deferred vaguely: cut, with the condition for
its return stated. **It comes back when a holed scan exists** — at a measured fill limit of 0 the only
thing repair can do here is non-manifold splitting, and a step whose whole purpose is one operation
should not also be the step that invents a worker protocol message, a `SceneCommand` that replaces
`unit.source`, and a 4×-import memory peak.

**What diagnose-only still delivers, which is why cutting costs little:** the operator is told the
truth about the 8 of 18 real scans that carry defects, before they print. That was always the larger
half — §3's own valve said *"if holes turn out to be rare … diagnose-only is the better first ship"*,
and step 5 measured holes as not merely rare but **absent**.

**What the cut takes with it:**

- `offersRepair()` stays in `rowState.ts`, unused and tested. No row renders a *Repair* press, so no
  row needs the press's words.
- **Four of the nine row states become unreachable** — `refused`, `unchanged`, `repaired`,
  `repaired-open`. Step 6a's `kit.html` markup and the three-language sentences are therefore **five
  states, not nine**: `unreadable`, `too-big`, `clean`, `holes`, `malformed`. The nine stay in
  `ROW_STATES` because the classifier is pure, proven and cheap to keep; what is cut is the UI's
  obligation to have words for states nothing can produce.
- The reload question disappears with it. `verdictOfRepair`'s `RepairResult` is unpersistable, and the
  four states it produces were the only ones that could not survive a reload — so nothing in this
  release can show a row the project file cannot rebuild.
- `PrintUnit.diagnosis` can no longer go stale **in this release**, because nothing replaces `source`.
  The `triangles` gate stays exactly as it is: it is the check that makes step 9 safe to write later,
  and it costs one comparison.

**When step 9 returns it owes all of this, which round 4 established and should not be re-derived:**
the *Repair* action on a row, the repaired mesh replacing the unit as **one**
undo step, and what else must follow it: the **display decimation re-run**, the **pick index rebuilt**
(`importWorker` builds it from `display ?? mesh`, so a repaired mesh leaves the viewport picking stale
geometry), and a **capacity re-check**, because filling adds triangles and `assertPlateCapacity` is
consulted only on the import path. **Centring does not re-run**: `prepareImport` centres on first
import and the unit's transform has been the operator's ever since, so re-centring a repaired mesh
would move a model they have already oriented.

**It must also replace `PrintUnit.diagnosis`, and this is not optional.** The saved verdict carries
`triangles`, and `normalizeUnit` drops a verdict whose count is not the attached mesh's — by design,
so a stale verdict can never be stated as fact. A repair that replaces `source` without re-running
`diagnose_mesh` therefore **silently loses the verdict on the next reload**, and the row falls back to
"not diagnosed" on the one file the operator just acted on. So repair returns a new verdict and the
same command writes both fields.

**What the row says after a reload is a narrower question, and the doc owes an answer.**
`verdictOfRepair` takes a `RepairResult`, which is not persistable, so `refused`, `unchanged`,
`repaired` and `repaired-open` — four of the nine states — cannot be reconstructed from a saved
project. Either the four collapse to the three `diagnose_mesh` states on reload (the cheap, honest
option: the file is re-judged on what it now is, not on what was done to it), or a small
`repairedAt`-style fact is saved alongside. **Recommendation: collapse.** A row that says what the
mesh is now cannot be stale; a row that says "repaired" is a claim about history that the project file
would have to keep true.

**The capacity re-check keeps its place, but not its stated reason.** "Filling adds triangles" is
impossible at limit 0. Non-manifold splitting duplicates vertices along split edges and can raise the
triangle count, which is reason enough — and `assertPlateCapacity` is consulted only on the import
path, so nothing else would catch it. A post-repair refusal must leave the original unit intact.

*Exit:* a refused repair leaves the unit untouched; a successful one leaves picking, display,
capacity **and the verdict** consistent, and a saved-and-reopened repaired unit still carries a
verdict that matches its mesh. Plus the standing per-step gate: module + tests + README, `tsc`, the
suite, the build, the walk, `walk:locales`, and — because this step is the first to run `repair_mesh`
on real geometry — `npm run gate:real`.

*None of the above is in this release's scope. It is the brief for the step's return.*

**10. Page names — NOT a step. Deleted, with the reason kept.** Revisions 3 and 4 scheduled a `PAGES`
table beside `SCENES`. It would be a **fourth** enumeration of screens next to `StartScreenId`,
`DentalStage` and `EditMode`, and no code would read it — each of those three is read by code that
needs exactly its own members, so none wants to migrate. That is precisely the rot §1 invokes against
`scope`: a structure holding an intention. **The page names are worth having; a data structure for
them is not.** §1's table and `src/scenes/README.md` carry the vocabulary.

**11. Finished-and-kept release** — hung off `addAnotherDental` and a **successful** export (§4),
never off the bare `exportedDental` press.

`UnitBuild<KeptBuild>` is the right shape for a released entry (**not** `UnitBuild<BuiltSupports>`,
which has no `footprint` — a reviewer claim this doc once carried and which is false).

**"Five consumers need full meshes" is ALSO false, and this document carried that too.** Traced
against the code rather than taken from the review:

| consumer | what it actually reads |
|---|---|
| `src/plate/plateLayout.ts` | `entry.mesh.footprint` only — nothing else |
| `src/components/usePlateArrange.ts` | forwards `built` to `plateFootprints`; reads no field itself |
| `src/components/useExport.ts` | passes through to `planExport`, whose parameter is `BuiltSupports`, and `unitContacts`, likewise |
| `src/components/useFixSpot.ts` | compares `entry.mesh !== currentBuild(...)` — identity, no field access |
| `src/viewport/types.ts` | **does not exist** |

Three of them **over-declare** their parameter as `GeneratedSupportMesh` while reading only small
fields; one was never a consumer at all. **The single real geometry reader is `activeMesh`**
(`App.tsx:340`) — `dentalRimCoverage`, `unresolved`, `dentalStructureFallback` — which is the unit
being looked at.

So the step is: narrow the three over-declared parameters to what they read, and make the map's value a
union of held and released, narrowed by a guard where geometry is genuinely needed. `UnitBuild` is
**already generic** (`UnitBuild<T extends BuiltSupports = GeneratedSupportMesh>`), so no new machinery
is required.

**It fits the job deck exactly** — and ONLY the job deck, which is why the mechanism ships without its
trigger. `ObjectViewport` draws `supportMeshes.get(unit.id)` for **every unit on the plate**, so
releasing a finished unit makes its supports vanish from the plate; after *Add another aligner* the
finished aligners sit there with supports visible, and that is the flow which ships today. Releasing
on `dentalFinished` while every unit is still drawn releases something still in use — a visible
regression, not a saving.

*The premise "one unit needs geometry because one inspect page is open at a time" is the DECK's
premise.* So `releaseFinished` is built, tested and not called. It turns on when a row's geometry
stops being drawn, and **two things must land with it**, both found by the code review:

1. **`problems` holds the full mesh per checked unit** (`setProblems(… { unit, mesh, items })`),
   pruned only when the unit leaves the scene. Releasing the build frees nothing while that entry
   still points at the mesh, so the problems entry is released in the same step. *Until then, step 11
   saves no memory and this document does not claim it does.*
2. **A released unit must be rebuildable.** `requested.current` refuses to rebuild an unchanged unit
   and `buildSettled` reports it settled, so returning to a released row would show no supports for
   ever. Its `requested` entry has to be cleared when the row is re-opened.

So the value type becomes a **discriminated union** of built-and-held versus released-and-measured,
and each of those five sites is migrated to narrow on the discriminator — a released entry must be a
type error wherever geometry is dereferenced, not an empty mesh at runtime. Name all five in the
commit; a silent `as` at any one of them defeats the step.

**Its stated prerequisite, the row cap, is owned by no step.** §9 called it "rather than guessing a
number now", which is stale: step 5 measured 12.2 MB per model and §9 already carries 8 (~100 MB).
Either step 11 adopts that number and says so, or a step owns choosing it. **Recommendation:** step 11
adopts 8 with step 5's measurement as the derivation; a cap nobody has measured against is the thing
worth avoiding, and 8 has been measured.
*Exit:* the geometry is gone, `dropped` / `droppedByZones` / `footprint` remain, `planExport` still
emits a supports part, and the known cost — the evicted unit no longer drawing its support bodies, and
being packed by its bounding box — is asserted rather than denied.

**But do the cap first, and consider not doing this at all.** §9 concedes the dominant term is the N
full models that stay in `scene.units` regardless; eviction buys the *secondary* term and pays a
user-visible regression for it. **Recommendation: ship step 5's measured row cap, and let eviction be
a later change justified by a measured ceiling** rather than spending a regression in the same release
that introduces the feature.

---

### 9. Still open

- **Host memory for N models.** The unit's mesh stays in `scene.units` by definition, so a 10-item run
  holds 10 full models, and §5's eviction only drops support geometry. **Recommendation: take the
  per-model figure from step 5's measurement and set a row cap from it**, with its refusal text in
  three languages, rather than guessing a number now.
- ~~**`ledger`'s `--red` tone on a routine row.**~~ **WITHDRAWN — it was never a problem.** `--red` is
  `#7f0019` (`styles.css:15`), the house primary and progress colour, not an alert; the failure colour
  is `--danger`, used as an outline only. The item existed because this document read a token's *name*
  instead of its value. What survives is the **row-height token**: `--row: 22px` exists only in
  `typelab/tokens.css`, so the app has none.
- **Whether the host should ever offer to drop a noise shell.** **Recommendation: no.** A shell under
  0.001 mm³ is reported and left; dropping geometry the operator did not ask to lose is the same class
  of act as silent repair, and §3 decided against that.
- ***Appliance* or *Purpose*** for level 1. **Recommendation:** Appliance, the dental word, accepting
  that "Any model" is not literally an appliance.
- **Walk `g` is FLAKY, and it is not this work's.** It failed at `1db2987`, before any of this work,
  so it is pre-existing. But it is **not deterministic**, and an earlier version of this line said it
  was, on the strength of a single baseline run. At HEAD it has both failed and passed, and the tell
  is in the numbers: when it passes the stroke selects **4**, when it fails it selects **0** — the
  stroke race its own comment warns about. **Three** of my explanations for `g` have now been wrong:
  machine load, the switch left on Unselect, and "deterministic". **Recommendation:** measure the
  rate first, the way `s17` was settled, and only then look for a cause.
- **Walk `s17` is FIXED** (`f4c3500`), and the cause is worth keeping because it is easy to repeat:
  s16 drops a **cube**, which has no findable rim, so orientation fails and **rim define mode opens
  asynchronously** after s16's check has already passed — swapping the dock under the Back click.
  Two weaker settles failed first: `atStep1()` + `quiet()` (which waits on the job list, not the
  dock), and waiting for "Step 1 **or** rim mode" (which matched the badge before the mode opened,
  skipped the Cancel, and left no Back at all). Waiting **for** rim mode and cancelling out of it
  passes five runs of five.

  The process lesson cost more than the bug: I bisected by reverting one file at a time and comparing
  **single runs**, and concluded my own harness change was the cause. For a check that fails 3 of 5
  at one commit, that comparison carries no information.

### 10. Dissolving the step machine

Approved by the owner 2026-11-08. The target shape is §0b's one workspace; this section is the
ordered route to it, the rulings that were missing, and the boundary that must not be crossed on the
way. Specified with Fable, with three corrections made against the code and recorded below.

#### The ruling that unblocked it: the guard belongs to Apply, not to navigation

The question that had stalled this was where the Step-3 confirm-and-discard guard lives once there is
no "back out of Step 3" direction. Both answers considered were wrong, because both assumed something
must be guarded when the operator *moves*.

**In a workspace that is ordered but not gated, moving is free. Only MUTATING destroys hand work.**
Today "Back out of supports" is a proxy for "I am about to re-run something upstream of supports".
So the proxy becomes explicit:

- **`openTool(tool, unitId)` changes focus and nothing else** — never clears the unit id, never
  cancels a job, never discards. Allowed while a job runs (the widget shows busy); refused only when
  the rail state is `unavailable`, which is a prerequisite output that physically does not exist yet
  rather than a workflow gate. Because it mutates nothing, **it has no guard to own or inherit.**
- **The guard moves to upstream Apply.** Its trigger becomes: *an Apply in tool T on unit U, when a
  tool downstream of T on U carries hand work.* Today's semantics are kept — confirm, then discard —
  because hand supports are surface-anchored and geometrically meaningless after a re-orient, so
  "stale but kept" would be a lie. One pure predicate, `handWorkAtRisk(state, unitId, tool)`, in the
  reducer module; the confirm stays in the command layer because it is async UI, but the DECISION is
  pure and single-sourced.
- **This closes the third withdrawal fault by construction rather than by discipline.** The deleted
  `toolEntry` bypassed a guard that lived in a command handler. Once the reducer stamps the revision
  and clears hand work in the same event, a direct reducer dispatch cannot bypass anything.
- **Next/Back are deleted at application level.** Each widget's primary is **Apply** — one accent
  colour, which is also the game-like affordance. After Apply the rail *focuses* the next tool that
  is stale or unavailable: a hint, ignorable by pressing anything else. Steps that are genuinely
  sequential stay INSIDE a widget and never touch session state.

#### Where this corrects Fable, against the code

1. **No `toolsFor(purpose)`, and no per-purpose order list.** The proposal was to make tool order
   profile data. `src/state/tools.ts` already declares `TOOL_ORDER` once with an explicit warning
   that three readers must not disagree about it, and the denture difference is **already handled in
   facts**, not in order: `hasRim: isDenture(unit) || hasRim(unit)` and
   `hasAcceptedArea = unit.dental !== undefined || isDenture(unit)` (`src/deck/unitFacts.ts`). A
   second list would be a second truth for the chain — the very duplication `tools.ts` was written to
   prevent. What actually remains of the hard-coded-order fault is the sequential hop pair
   `stageAfterOrientation` / `stageBeforeSupports`, and `openTool` addressing a tool DIRECTLY is what
   makes those unnecessary for entry.
2. **A denture has no rim step either.** The proposed denture order `[orient, rim, supports]` is
   wrong: `src/denture/state/dentureStages.ts` maps a denture to `aligner` then `review`, and rim is
   an aligner-only detour out of Step 1. Its rail satisfies rim by construction, which is why the
   rail needs no order of its own.
3. **The shell: keep the five generic sections HIDDEN.** §0b said adopting this means "dental stops
   hiding the shell". That is right about the two layout SLOTS and wrong about their contents.
   Unhiding import/objects/transform/supports/check with per-section locks produces a wall of
   disabled controls that restates the rail's four states in a second vocabulary — the opposite of
   minimal. Dental is not "the editor with panels hidden"; it is a **shell variant filling the same
   two slots**: left slot is the rail alone, right slot is the job panel (purpose read-only, support
   defaults, the silent validation tally, export, the model list). Every generic section has a dental
   home, so nothing needs locking: import to the model list's add row, objects to the model list,
   transform to Orient, supports to Supports, check to the tally. The Drop page survives as the
   workspace's empty state.

#### THE BOUNDARY: one unit at a time. A shared plate is a different project.

§0b's table says "plate (centre) — every model at once". **That is not in this work, and increment E8
must not quietly become it.** Every mechanism built so far is per unit — revisions, hand work, busy,
the orient job — and the workspace is single-unit. A genuinely shared plate forces four new problems
at once: which unit a widget acts on; hand supports in unit space versus plate space; the
memory-first rule, since loading every model at full resolution is exactly what that rule forbids;
and a job finishing on a unit that is no longer selected, stamping a revision the visible widget
never saw.

**Ruling: the current unit is the selection in the job panel's model list.** All tools act on the
selection; other models render as low-cost proxies (bounding box or decimated shell) if they render
at all. The true multi-model plate is a separate project, after E9.

#### The increments

Each leaves the app working, gated and pushed.

**E0. DONE** - `f4adde5`. Test the denture path through the rail. Found while checking the above: `grep denture` in
`src/deck/unitFacts.test.ts` and `toolState.test.ts` returns nothing, although three lines of
`unitFacts.ts` exist solely to fix a denture-specific rail lie that review caught. It is first
because every increment below leans on those facts being right.
*Exit, met:* each `isDenture` branch was deleted in turn and three tests went red each time, with
19 green once restored. Both halves of the recorded fault are covered — the greying AND the sentence
it showed, which were one bug. A fourth test guards the over-correction: a freshly imported denture
has no accepted policy and must still read as nothing done.

**E1 SPLIT IN TWO**, because its second half carries a risk its first half does not.

**E1a. Remove the in-flow type step** (was §8 7c). Delete `dentalStage: 'type'` and its sites. The
appliance kind is chosen per run on the Drop page; `supports.dentalAuto` is labelled "Aligner Support
Production", so it starts an aligner run directly, keeping the batch's profile when the operator chose
one and it is not a denture.
*Exit:* no `'type'` in `DentalStage`; the walk enters at Step 1 and `u0` asserts the ABSENCE of a type
card as well as the badge — a check that only read the badge would still pass with a card under it.

**E1b. Back at Orient steps out to the CASE, not out of the session.** It used to send `exit` and
show the Drop page, discarding `dentalFinished` — so in a case of eight, going back from the second
item lost the first item's finished mark, with no warning and no way to recover it. Now the session
stays and the Items page comes up over it. The reducer puts Step 1 back to waiting without moving the
stage, because Step 1 IS where the flow waits for an aligner; `dentalProfile` survives, since the next
row is the same kind of job.

*The canvas question, answered rather than assumed.* The workspace unmounts with the start screen and
the only `<Canvas>` is inside it, so the renderer is disposed and the models re-upload when a row is
opened — the same cost the workspace already pays on every mount, and nothing the SESSION holds lives
in the canvas. The jobs do not survive and must not: both flows are invalidated at the press, because
the orientation being computed belongs to the unit the operator is walking away from.

*Two things that needed no change, found by reading rather than guessing.* `startItem` already
re-enters a live session without exiting, so the way back was already built. And an EMPTY plate goes
to Drop instead of Items, because Items with no rows is a page about a case that does not exist yet.

*This is the increment that first makes "a live session and a start screen on screen together"
possible* — the shape E4 needs, and the one the withdrawn `toolEntry` could not have.

*Exit, met:* `u5l` asserts Back at Step 1 shows the rows and NOT the Drop page — the absence matters
as much as the presence, since the old behaviour landed on Drop and a check for "some start screen"
would have passed either way. A session test proves `dentalFinished` survives Back and still dies on
Exit, so Back is not Exit.

#### Two things E1a found in the code, against what was expected of it

1. **Back at Step 1 STAYS VISIBLE, and hiding it was the wrong instinct.** "The first step has nothing
   behind it" is true of the reducer and false of the app: `dental.back`'s *command handler* in
   `App.tsx` intercepts Step 1, invalidates the flows, sends `exit` and shows the Drop page. Back
   there is a real way OUT, not a step backwards, so removing the button would have removed a route
   the walk and the operator both use. `dental.back`'s visibility was `dentalStage !== 'type'`, which
   with the type step gone simply means "in dental mode".
2. **The reducer's `backDental` case for `aligner` is unreachable from the app**, for the same reason.
   It used to send the session to `type` while clearing the proposal and the unit id. It is now an
   explicit no-op with a comment saying why, and the test asserts identity rather than a shape — a
   stray `backDental` must not quietly throw away an orientation the operator still has.

**E2. DONE, and SMALLER than specified — the predicate already existed.** The plan called for
`handWorkAtRisk` to be made pure and tested. `src/dental/flow.ts`'s `backNeedsConfirm` already was
both, and both discard paths (`discardManualCommands`, `exitCommands`) already consulted it.

What was actually missing was the "exactly one place" half: `clearManual` in `App.tsx` re-expressed
the same question inline — `!unit.manual.length && !unit.deleted.length && !keys(contactSettings)` —
so there were two spellings of one rule, with the guard as the half that matters. It now consults the
predicate. The change is provably behaviour-identical, so it needed no walk.

*The tool dimension is deliberately NOT built yet.* Fable's ruling generalises the trigger to "an
Apply in tool T on unit U, when a tool downstream of T carries hand work". Today the only hand work
is supports-level, which is downstream of orient, rim and area alike, so a `tool` parameter would
have no caller that varies it until E6 gives each tool its own Apply. Machinery with no user is the
thing this plan's own test forbids; it lands with its first caller.

*One difference worth not "fixing".* The counts in the clear toast use `unitRemovedCount` (deletions
that actually hide a placed point — what the operator sees come back) while the predicate reads
`deleted.length` (whether any hand work is recorded at all). A deletion of a point that is not
currently placed hides nothing, so a unit can truthfully carry hand work and report 0 removed. Both
lines now say so.

**E3. NEEDS RESHAPING — and the reason is worth reading before anyone writes it.**

As specified it was: add an `activeTool` field beside `dentalStage` and derive the stage from it.
**That is duplication, not progress.** The two are the same thing under different names, 1:1:

| tool | stage |
|---|---|
| `orient` | `aligner` |
| `rim` | `rim` |
| `area` | `area` |
| `supports` | `review` |

So `dentalStage` IS the active tool, and E9 is a RENAME rather than a removal. What E3 actually owes
is one mapping and one command — `openTool(tool, unitId)` setting the stage — and no new field.

**But a bigger thing surfaced while checking that, and it blocks per-tool entry.** For a denture the
rail reports all four tools READY, including Rim and Area — a denture has neither
(`dentureStages.ts`: `aligner` → `review`). It is harmless today only because a rail press ignores
the tool and opens the model; the moment `openTool` honours the tool, pressing Area on a denture is
Fable's withdrawn fault #2 in a new costume.

The `isDenture` branches in `unitFacts.ts` are compensation for this: they report a rim and an area
as *present* so the rail does not instruct about steps the job lacks. The straighter answer is for
the rail not to LIST them.

*That is not Fable's `toolsFor(purpose)` after all, and the distinction matters:* a FILTER over
`TOOL_ORDER` is derived from the one order, where a parallel per-purpose list would compete with it.
`toolsFor(unit) = TOOL_ORDER.filter(…)` keeps one truth.

**The catch that makes this a decision rather than a tidy-up.** `PREREQUISITE` is hand-written per
tool, and `supports` requires `areaAccepted` — which for a denture is true only because
`hasAcceptedArea` includes `isDenture`. Filter `area` out and `supports` needs the prerequisite of
whatever is actually above it in THIS job's chain, which for a denture is `oriented`. So the
prerequisite stops being a per-tool constant and becomes "the output fact of the previous tool in
`toolsFor(unit)`".

That is a better model — it deletes the `isDenture` compensations and makes the chain one rule
instead of four constants. It also rewrites the module an EGM review recently hardened, including the
load-bearing unavailable → busy → stale → ready order. Hence: owner's call before it is written.

**E3a. DONE — the rail's chain is per job, and the prerequisite is derived from it.** Owner approved
reshaping rather than patching.

- `state/tools.ts` gains `toolsFor(denture)`: `TOOL_ORDER` **filtered**, never a list of its own. A
  filter cannot disagree with the order it filters, which is what a parallel per-job list would be
  free to do.
- `toolState.ts`'s hand-written `PREREQUISITE` (four constants, keyed by the tool that WAITS) became
  `OUTPUT` (keyed by the tool that PRODUCES) plus one rule: **a tool waits for whatever is
  immediately above it in its own chain.** A denture's Supports now waits on the ORIENTATION, which
  is true, instead of on an accepted area, which it never has.
- The three reason sentences did not change. Each already read as a statement about the producer —
  "draw the rim first" belongs to Rim, whoever is waiting on it — so no locale work.
- `unitFacts.ts` loses both `isDenture` compensations. They existed to claim a rim and an area were
  *present* so the rail would not instruct about steps the job lacks; with the chain short, the
  question does not arise and the facts can say what is true.

**The bug this found, which the earlier fix did not reach.** `unit.denture` is the ACCEPTED policy,
written by `denture/set` on acceptance — so for a denture that has been dropped and oriented but not
yet accepted it is empty, and reading only the unit treated it as an aligner for that whole window,
telling the operator to draw a rim on it. The run's profile knows the purpose from the drop, so it is
passed in (`ItemsPage` gains `denture`, from `session.dentalProfile ?? batchProfile`); the unit's own
policy still counts, so a reopened project with no run profile reads correctly.

*Which makes Fable right and my earlier objection half-wrong, worth recording in that order:* this IS
profile data, as the ruling said. What I was right about is that it must DERIVE from `TOOL_ORDER`
rather than sit beside it. Both halves were needed.

#### THE DECK IS THE QUEUE — the owner's conclusion, and it settles the multi-failure case

Asked what happens when several files in one drop come back with no rim, the answer turned out to be
that nothing needed inventing. During a batch there is no dental session at all, so the automatic
hand-over to rim drawing *cannot* fire — its guard needs a live session that is loading. Each row
records its own `DetectState`, and the deck already flags them:

| row says | means | the tool the deck points at |
|---|---|---|
| `no-rim` | oriented fine, no rim found | **Rim** — draw it by hand |
| `failed` | could not look at all | **Orient** — rotate it by hand |

So multiple failures are multiple flagged rows, handled one at a time by clicking. **The single-unit
session stops being a limitation and becomes the right shape**, and no batch rim mode is ever needed.

Two consequences for E4:

1. **It can ship for flagged rows alone.** Those rows have no orientation proposal, so Rim is
   legitimately their entry point — which means per-tool entry does not have to settle the harder
   question of redrawing a rim the detector got right. Smaller, and safer.
2. **Point "start next item" at the next FLAGGED row.** The deck already has that primary
   (`data-ui="items-start"`, `nextItem`); aimed at the next row needing attention it gives a
   press-draw-done-press path through a case of eight.

**Named debt found on the way, not taken here: detection runs twice per row.** `startAligner` always
re-runs `dentalOrient` when a row is opened rather than reusing the batch's result, so a case of
eight pays the expensive pass sixteen times. Wasteful rather than wrong — same mesh, same profile,
same answer — but front-loading detection was the batch's whole purpose, so it is defeating itself.

**E3b (was E3). `openTool(tool, unitId)` and the stage mapping.** No new field: the tool and the
stage are the same thing 1:1, so this is one mapping plus one command, and E9 is a rename.
*Exit:* every navigation goes through one command; behaviour unchanged.

**E4. Mount the rail in the workspace's left slot** during a live session, wired to `openTool`. This
is where the first withdrawal fault is cured — the rail leaves the deck.
*Exit:* three regression tests, one per recorded fault: reachable in a live session; a denture press
never lands on a cleared unit; a press never discards hand work.

**E5. The job panel in the right slot** — purpose, support defaults, the tally, export.
*Exit:* `DentalBar` no longer owns export; the right slot renders in dental mode.

**E6. Split `DentalBar` into per-tool widgets, one increment per tool, Orient first.** `DentalBar`
delegates for the tools that are done and renders its old content for the rest. (Its ~30 props are
themselves the hub smell this splits.)
*Exit, per tool:* the widget holds only that tool's controls, has an Apply, and Apply consults E2's
predicate.

**E7. Delete Next/Back; Apply focuses the next tool.** **Cannot be split from the last of E6** —
removing Next before every tool has its own Apply strands the operator in a widget with no way out.
*Exit:* no Next/Back in the DOM; tests navigate with `openTool`.

**E8. The deck becomes the model list panel**, and selecting a row switches unit without `exit`.
**Cannot be split internally** — removing the start screen while selection still routes through
`exit` leaves no way to switch units.
*Exit:* the start screen is gone; no route sends `exit` to change unit.

**E9. Delete `dentalStage`.**
*Exit:* the grep is empty; `activeTool` plus the revisions are the only truth.

---

<a id="2026-11-11-repo-shape-and-the-spatial-puck"></a>

## 2026-11-11 — Where the spatial puck lives, and what to tidy here — 2026-11-11

*Was `docs/design/2026-11-11-repo-shape-and-the-spatial-puck.md`.*

**UNAPPROVED.** A plan for the owner to amend or refuse. Nothing in it has been done. Written by the
lead with [Fable](#what-fable-said-and-where-it-was-wrong) consulted on the judgment calls, per the
standing rule; every number below was measured in this repo today, and the two places Fable's facts
were wrong are corrected in-line.

---

### The short version

1. **The puck is its own repo** — `mixospatial` — with the firmware and the browser half **together**
   in it, because they share a byte layout and must change in one commit.
2. **The contract is the product, not the client.** `PROTOCOL.md` plus a folder of golden packets
   that *both* test suites read. The TypeScript client is one dependency-free file; do not build
   geocore-style vendoring machinery for it.
3. **Nothing in mixodental moves** except the loose files at the root. Twelve top-level folders is
   not too many; the problem is that their names do not say what they hold, and a README table fixes
   that for nothing.
4. **Add a guard that fails when a tracked file appears at the repo root** that is not on a short
   allowlist. Thirteen review reports arrived at this root between 6 and 11 November because every
   review tool writes to the working directory. A rule in `CLAUDE.md` alone will not hold.
5. **The family rule: products, parts, tooling — and every repo is exactly one kind.** A product
   never takes code from another product; a part is created when the *second* consumer exists, not
   in anticipation.

---

### A — Where the puck lives

#### The decision

One new repo, `mixospatial`, holding the firmware and the web client side by side.

**Why not inside mixodental.** The toolchains share nothing: Zephyr, west, CMake, device trees and a
flash-and-debug loop against a board, versus Vite and Vitest. Every gate this repo has — `tsc`,
1590 tests, the 186-check browser walk, the vendored-WASM parity suite — says nothing about C. And
mixodental is mid-flight: `main` is five commits ahead of the deployed build with a human-test
checklist pending. A hardware project in its own repo costs this one nothing.

**Why not two repos.** The firmware and the client share a byte layout. One person should not need
two commits in two repositories to add a field to a packet.

**Why not mixomesh.** Same product-takes-code-from-product problem as everything else; see D.

#### The three things to settle on the bench before any of this structure matters

Fable raised these and they are the right order of work. None is a code question:

| Risk | Why it decides the project |
|---|---|
| **A CR2032 under BLE transmit peaks with a gyro running** | if the coin cell cannot hold it, the whole product changes shape (rechargeable, bigger cell, duty cycling). Measure first. |
| **Tap and double-tap from the IMU's own interrupt** | Zephyr's driver for the XIAO's IMU may not expose tap triggers, which would mean writing registers directly. That is the difference between a weekend and a fortnight. |
| **Yaw drift** | a 6-axis IMU has no heading reference, so yaw walks. The "set it flat and re-zero" button is not a convenience, it is the mitigation — and it should be in the first spike, not added later. |

*These three are from the auditor's and Fable's knowledge, not from a datasheet read today. Treat
them as the first bench session's agenda, not as facts.*

#### The first consumer — settled by the owner, 2026-11-11

**The puck is a desktop accessory: PC and Mac only.** The owner's reasoning: dentists work in an
office and send the print from a PC. That answers the open question and removes most of the
objection below, which is recorded because the part of it that survives is a UI rule.

The original objection was that **Web Bluetooth is Chromium-only and absent on iOS**, while
mixodental's README promises it "runs in the browser on Windows, macOS, Linux, ChromeOS, tablets and
phones" — and last night's audit already filed two findings about that promise (MIXO-03, MIXO-04).
A desktop-only accessory makes that a non-issue on mobile, because the feature is simply not offered
there. **What survives is narrower and still real: on the desktop, Web Bluetooth is Chromium —
Chrome, Edge, Opera, Brave. Safari does not have it on macOS either, and Firefox does not have it at
all.** So "Mac" means "a Mac running Chrome", and macOS additionally asks the browser for Bluetooth
permission on first use.

**The rule that follows, and it is the whole of it:** the Connect button exists only when
`navigator.bluetooth` does, and where it is absent the panel says *why* in one sentence rather than
not being there. That is capability detection — exactly the thing MIXO-04 found this app has nowhere
— so this feature should be the first place it is done properly, not another place it is skipped.

Two smaller consequences of "desk, office, PC":

- **The interaction is set-it-down, pick-it-up.** That makes "set it flat and re-zero" the central
  gesture rather than a calibration afterthought, and it is what the demo page should open on.
- **The battery profile is minutes of use and long idle**, not continuous streaming. Auto-sleep on
  inactivity is therefore worth more than transmit efficiency, which is good news for the CR2032
  question in the bench agenda above.

Still true regardless: **wire the puck into nothing until it drives its own demo page**, and when it
is wired in, the client emits plain `[x, y, z, w]` numbers while the consuming app owns the three.js
— which keeps this repo's "three.js only in `src/components/`" boundary intact.

---

### B — The shape of `mixospatial`

```
mixospatial/
  README.md              the map, the pinned SDK version, how to flash, how to run the demo
  PROTOCOL.md            THE CONTRACT: service and characteristic UUIDs, packet layout, byte
                         order, units, axis convention, the version byte
  protocol/fixtures/     golden packets — hex in, expected values out — read by BOTH test suites
  firmware/
    CMakeLists.txt  prj.conf
    boards/              one .overlay + .conf per board, and nothing else board-specific
    src/                 main · orientation (pure C fusion) · tap · ble_service · power · led
    tests/               ztest on native_sim: the fusion and the packet packing, no board needed
  web/
    src/puck.ts          framework-free: connect, reconnect, parse, calibrate, events
    tests/               decodes protocol/fixtures — the contract test
    demo/                the three.js page, battery panel, recalibrate button
  hardware/
    enclosure/<board>/   source CAD + STEP + exported STL/3MF + print notes
    electronics/         pinout, BOM, the KY-016 wiring
  docs/decisions/        why a coin cell, why this IMU, why a quaternion
```

**Three details that are the whole design:**

- **`PROTOCOL.md` and `protocol/fixtures/` sit above both halves** and belong to neither. Last
  night's audit of this repo found exactly this class: the exported STL was proved only by our own
  reader, which shows the two halves agree and nothing more. A puck whose firmware and client are
  tested only against each other has the same hole. Golden packets that both suites read is the
  cheapest fix there is, and it has to exist from the first commit.
- **Two boards, one `src/` — and no `LED_ON`/`LED_OFF` macros.** The sketch's `#if defined` is
  solving a problem Zephyr already solved: each board's devicetree declares its LEDs
  `GPIO_ACTIVE_LOW` or `GPIO_ACTIVE_HIGH`, the application calls `gpio_pin_set_dt(&led, 1)`, and the
  polarity never reaches the code. The nRF54L15 overlay declares the external KY-016 on D0–D2 under
  the same aliases (`led-r`, `led-g`, `led-b`, `imu0`) that the XIAO's internal LED uses.
  `GPIO_OUTPUT_INACTIVE` gives the safe-off state before deep sleep on both. Use the platform's
  mechanism, not a parallel one.
- **The enclosure is per board**, because the KY-016 module changes the cavity. Keep the CAD source
  *and* the exported printable next to each other; commit the STLs directly, since a puck is small
  enough that LFS is not worth it; version by git tag, never by filename.

Two smaller calls: **send a quaternion, never Euler** (4 × int16 is 8 bytes and fits a default
notification, and it has no gimbal problem), and **use the standard Battery Service** rather than a
custom characteristic.

---

### C — What to tidy in mixodental

#### Do not move any top-level folder

**212 files pin a literal path.** `docs/dental-reference/reference-aligner.stl` appears at 33 sites,
`../../scripts/test-support/*` at 50-odd, and `src/styles.css`, `samples/case-denture`
and `vendor/mixo-geocore/pkg-node/…` all appear in path literals and glob strings. Around 58 guard
tests read source text or enumerate files by path. Moving a top-level folder is a wide refactor that
would redden that suite in ways nobody can read, for no behaviour gained.

The names are the problem, not the layout:

| Folder | What it actually is |
|---|---|
| `scripts/` | **207 of its 284 tracked files are fixtures**, not scripts |
| `docs/` | 73 MB, because `docs/dental-reference/` holds test meshes |
| `artefacts/` | git-ignored, yet 12 files are tracked in it — deliberate, and invisible |
| `benchwork/` | one tracked file |

#### Do this instead, in this order

1. **A repo map in `README.md`.** One row per top-level folder: what it holds, tracked or generated,
   who writes it, whether it is safe to delete. The "For developers" section has no map today, and
   the project already does exactly this for `src/components`, `src/items` and `src/deck`.
2. **Move the thirteen loose reports** into `docs/reviews/`, renamed to the convention that folder
   already uses (`YYYY-MM-DD-<tool>-<topic>.md`). That is the twelve EGM/goldfish/zoom-out reports
   (223 KB, arrived 6–7 November) **and `docs/reviews/2026-11-11-cia-audit.md`, which the auditor added to the pile
   last night**. Checked: the only live document that cites any of them is
   `docs/design/2026-11-07-import-and-items-flow.md` — one link. The rest cite each other, so they
   travel together. *(Fable said `docs/HANDOFF.md` and `src/items/README.md` cite them too; grep says
   they do not.)*
3. **A root-allowlist guard test.** It fails when a tracked file appears at the repo root that is not
   on a short list. Without it this comes back: thirteen reports arrived in six days because review
   tools write to the working directory, and a sentence in `CLAUDE.md` does not stop a tool.
   Add the sentence as well, naming `docs/reviews/YYYY-MM-DD-<name>.md` as the only home for review
   output.
4. **Ask about `Aligner.stl`** before touching it. It is untracked, 18,697,884 bytes — *exactly* the
   size of `docs/dental-reference/reference-aligner.stl` — with a **different sha256**. Same triangle
   count, different coordinates: the same mesh re-oriented or re-saved. It is 18.7 MB sitting in the
   working directory and `docs/SHIP-PLAN.md` says it is not a gate, but it is not obviously
   disposable either.

---

### D — The family, as it grows

`S:\ai` holds about 28 entries across at least three unrelated families (`mixo*`, `senmori*`,
`komorebi`/`kitra`), including loose files (`docker-compose.yml`, `openclaw.json`, three
`mixoweb-*.md`), debris (`mixomesh-hotfix`, `mixoweb-suite-logs`, `gate0-data`, `script`) and a model
store (`ollama_models`). **"So many folders" describes that, better than it describes this repo.**

**Do not move project folders.** Claude's project memory is keyed on the path and the skill junctions
hardcode `S:\ai\skills`. Write one index file instead — folder, kind, repo, consumes, consumed-by,
active/parked/dead — put each loose file in its owning project, and retire the `-hotfix` clone.

#### The rule worth adopting

**Three kinds of repo, and every repo is exactly one kind.**

- **Products** — deployed to a user: `mixodental`, `mixomesh`, `mixosupports`, `mixo-ar`, the puck's
  demo.
- **Parts** — consumed as built: `mixo-geocore`, `mixo-app-style`, the puck's protocol and client.
- **Tooling** — the skills.

Two consequences: **a product never takes code from another product** (anything two products need
becomes a part first), and **a part is created when the second consumer exists, not in
anticipation**. The naming already nearly encodes this — no hyphen for products, `mixo-` for parts.
Make it the rule rather than a coincidence.

**The one thing to stop:** letting agent output count as documentation. A report is either cited by a
decision — in which case it is filed and dated — or it is deleted. That one habit produced the
thirteen root files here, the three loose files in `S:\ai`, and 223 KB of review prose nobody has
re-read.

---

### Open questions for the owner

1. **`Aligner.stl`** — same size as the reference aligner, different hash. Keep, replace the
   reference with it, or delete?
2. ~~**Who is the puck's first consumer?**~~ **Answered by the owner, 2026-11-11: the puck is a
   desktop accessory, PC and Mac only — dentists work in an office and send the print from a PC.**
   So mixodental is a fine first consumer, the mobile objection falls away, and what is left is the
   capability rule in A: the Connect button appears only where `navigator.bluetooth` does, and says
   why where it does not. Note for the day it is built: on the desktop that still means Chromium —
   a Mac user in Safari has no Web Bluetooth.
3. **Support generation lives in three places** — kept port-ready in mixodental, handed over by copy
   to `mixomesh/port/mixosupports`, and planned into mixomesh. By the rule in D that is
   product-to-product transfer, and one person now owns dental supports in three places. Either it
   becomes a part, or two of the three stop owning it. **This contradicts a recorded decision (the
   mixomesh port plan), so it is a question and not a finding** — but it is the biggest structural
   question in the family and it will only get more expensive.

---

### What Fable said, and where it was wrong

Fable was consulted with the measured facts and asked to attack the lead's candidate answer. It
agreed that the puck is its own repo and that mixodental's folders should not move, and it improved
the plan in four ways that are now the plan: the protocol rather than the client is the shared
artefact, the client is one file and needs no vendoring machinery, mixodental is a doubtful first
consumer because of Web Bluetooth, and the real clutter is `S:\ai` rather than this repo. The
devicetree-not-macros point was reached independently by both.

Two of its facts did not survive checking, and are corrected above: `docs/HANDOFF.md` and
`src/items/README.md` do **not** cite the root reports (only one design doc does), and its claim
about `Aligner.stl` needed the hashes to be run — they were, and it was right to say do not delete.
Its hardware risks are from memory and are listed as a bench agenda rather than as facts.

---

<a id="2026-11-12-three-repo-refactor-plan"></a>

## 2026-11-12 — Three-repo refactor: decision record and fix list

*Was `docs/design/2026-11-12-three-repo-refactor-plan.md`.*

> **DECIDED 2026-11-12: Phases 1 to 5 are gone.** This file was a phased plan; it is now a decision
> record plus seven fixes in order (section 3). Phase 0 is done and recorded in section 5.
> **The mixoMesh re-vendor (12 → 63) is not scheduled**; section 4 gives its trigger and its step zero.
> What that gives up, plainly: **mixoMesh stays 51 engine versions behind, and every geocore fix
> below reaches mixoDental only.** Section 1 lists the rest of the cost.

Decision delegated by the owner to this document's author after four EGM reviews (section 6b). No
code was changed in any repository by this file. The file keeps its name because other documents and
one test header cite it by path; the section numbers they cite (3, 5, 6, 6b) still hold the same subjects.

Sources: `S:\ai\mixodental\docs/reviews/2026-11-11-cia-audit.md`, `S:\ai\mixo-geocore\docs\cia-audit-2026-11-12.md`,
`S:\ai\mixomesh\docs\cia-audit-2026-11-12.md`, `S:\ai\mixomesh\docs\geocore-adherence-2026-11-12.md`,
`S:\ai\mixodental\docs\handoff\geocore-spatial-input.md`. Finding ids (`GEO-`, `MIXO-`, `MX-`) are
cited, not re-derived.

---

### 1. The decision, why, and what it gives up

**Why the phases go.** A phased plan earns its sequencing when later phases need earlier ones. Review
removed the need:

- The table held **two** cross-repo moves, not eight (section 6b's structural note). One of them (C1)
  needs no level ground, and the other (C2 with half of C3) waits on bench answers, not on a vendor step.
- The phase everything queued behind, Phase 4, had three contents: C1 (should never have been in it),
  C9 (must not be executed at all) and C10 (not a deletion). **Phase 4 was empty**, so Phase 2 was
  unblocking nothing, and Phase 3 was levelling two apps for work that does not exist.
- Phase 2 was estimated from signature diffs, which cannot see a new required field, and it would
  have overwritten the only tree its own before/after checks could be measured against.
- One owner, working alone. A week-shaped critical path in front of fixes that each already have a
  file, a line and a failing test is the wrong shape for that.

**What survives:** D22 as the one boundary pattern; the two defect classes (a "nothing happened"
that travels the success path; a boundary proved only against our own side), each closed by a test
at the named site and not by moving code; the rejections (section 2); and the old section 3's
ordering, which is now section 3's fix list.

**What this decision gives up.** Value lost, not work saved:

1. **mixoMesh stays on engine 12.** It does not get the 3.7× faster route (engine 46), hard tip rules
   (41), phase progress (60) or plate arrange (53). The gap is 51 today and becomes 52 the day
   engine 64 ships from this very list. Deferring makes the eventual re-vendor larger, never smaller.
2. **Every geocore fix in section 3 reaches one app.** GEO-002/003/005/006 are fixed in geocore and
   arrive in mixoDental at engine 64. mixoMesh keeps whatever engine 12's host does. Whether the
   weak decoders exist that far back was not checked (section 7); if they do, they stay.
3. **"Both apps, together, for the first time" does not happen.** No date exists on which the two
   apps run the same engine. Shared work stays theoretical for mixoMesh until section 4's trigger fires.
4. **mixoMesh keeps two live job layers and its own 1,644-line repair.** The second is not a loss
   (C9 was wrong). The first is: `JobActivity` stays a fork with nobody assigned to decide it.
5. **The spatial port has no slot.** C2 and `SpatialRecord` wait on the puck's bench answers with no
   phase to land in. They need none, but nothing will remind anyone either.
6. **A list has an order but no dates.** The phases, for all their faults, said "this week". Nothing
   in section 3 stops other work going ahead of it.
7. **Most of the audits stays untouched.** Section 3 closes six GEO findings and MIXO-13 at its
   source. The remaining findings (about 23 by an unverified tally) live in their own reports on
   their own schedule, and geocore holds roughly half of them.

**What the author changed his mind about.** (a) "Should the re-vendor come before any
centralisation? Yes." was answered to a question that assumed centralisation was coming. With one
move left that needs neither app, the re-vendor is a mixoMesh product decision, not a prerequisite.
(b) The second STL reader was filed as debt to be retired by C1. It is not debt: mixoMesh's copy
proves mixoMesh's own writer, and C1 proves geocore's. Two writers, two proofs. (c) The gap line was
Phase 5, last. It is now fix 1, because it is the only thing that makes this decision's cost visible.

---

### 2. The centralisation table, with its verdicts as decided

The test, applied to every row: count what the module must be handed against what it hands back.
Narrower out than in is a job. About the same is a hub, and moving a hub is motion. The test only
measures a **move**; rows that unify duplicates inside geocore or fix a defect in place are judged
by their invariant instead (section 6b).

#### Rows inside geocore

| # | Candidate | Verdict | Closes |
|---|---|---|---|
| C1 | **The STL proof with a reader that is not the writer** (mixoDental `src/supports/exportBytes.test.ts`, testing geocore's own `encodeStl`) | **Fix 2.** Move to geocore `host/supports/exportBytes.test.ts`, reader in `scripts/test-support/`, folding in the inline byte parse already in `host/supports/export.test.ts`. No handedness parameter: mixoMesh's `tests/export-bytes.test.mjs` is not retired by this | MIXO-13 at its source |
| C2 | **`host/core/quat.ts`** (`Quat`, `multiply`, `conjugate`, `normalize`, `fromAxisAngle`, `toPlacementRotation`) | **Waits**, on the puck's three bench answers. 4 numbers in, 3 out, pure: a clean job when its time comes | spatial handoff part 1 |
| C3 | **`editing/SpatialPort.ts`** | **Split.** `SpatialRecord` goes in with C2. The three `spatial.*` command rows and the capability fact **stay in mixoDental**, through `ExtraCommandIds` + `registerCommands()`, which exist for exactly this. `commands.ts` has one consumer; "both apps" was false | spatial handoff part 2; part 3 withdrawn |
| C4 | **One code-table lookup** with an explicit `'unknown'` member, replacing the nine sites that fall back to a neighbour's meaning | **Fix 6.** Widens about nine public string unions, so it is engine 64 and needs the owner's word for `'unknown'` | GEO-005 |
| C5 | ~~One strided reader~~ | **Rewritten as fix 7:** a length check in `decodeSteps` (a per-index silent zero, not a strided loop), plus the strided walks at `repairMesh.ts:211`, `:232`, `:283` and `dentureReview.ts:291`, `:321` | GEO-006 |
| C6 | **The ABI describing itself** | **Reduced to what fix 4's test reads:** the five strides, exported from the engine. Table lengths and phase names follow only if a test needs them | GEO-004 |
| C7 | **A not-judged outcome in the export gate** | **Fix 5.** Engine 64; needs the owner's sentence for `'nothing-built'` | GEO-002, GEO-003 |
| C8 | ~~The D22 banned-import list as one module~~ | **Not taken.** Two encodings (eslint globs, test regexes), not one datum; a shared constant is a hub by this file's own test. The drift that existed is closed (geocore `45c71f9`). Section 6 | GEO-010, in the part that mattered |

#### Rows where one app carries a second copy

| # | Candidate | Has it today | Verdict | Closes |
|---|---|---|---|---|
| C9 | **Mesh repair and diagnose** | mixomesh `src/core/repair/` — **1,644 lines across SIX files, measured**: `MeshRepair.js` 656, `GroupRepair.js` 346, `RepairSession.js` 342, `Weld.js` 153, `CapLoops.js` 95, `Diagnose.js` 52, plus the MeshFixLib WASM; geocore `host/core/repairMesh.ts` since engine 62/63 | **⚠ DO NOT EXECUTE THIS ROW. Its verdict was wrong and the error loses user data.** It read "Delete from mixomesh, do not move. Clean job: positions + indices + one limit in, mesh + report out." The line count is exact; **the job description is false.** geocore's `repairMesh` returns `positions: Float32Array; indices: Uint32Array` and **nothing else — no UVs, no uv2, no colour**. `MeshRepair.js:161-170` exists for exactly that reason, and says so: *"Every OTHER per-vertex attribute the mesh carries must end up at the new vertex count too. Real scans carry normals, often tangents and a second UV set… the old write-back left `normal` at the OLD length and Babylon threw 'Invalid typed array length' on the first createNormals / render (12 real scans, 2026-09-18)."* **So this deletion would re-pay a bill mixoMesh already paid once, on the same twelve scans.** Also app-only with no geocore counterpart: `REPAIR_TRIANGLE_CAP` 300k, `REPAIR_TIMEOUT_MS` 60s, the fresh-WASM-instance-per-run workaround for engine state carry-over, the `'no engine:'` unavailability class callers branch on, `repairGroup`/`toLeadMatrix` over multiple parts (which `npm run test:group` exercises today), and `replayGeometryFixes`/history recording. **The real gate is not the 12-scan comparison — it is "geocore can return UVs", which is an engine ask nobody has written.** And that comparison cannot be configured today: `maxFillLoopMm` has no default by design, and the twelve scans are named in no repo, with no path, manifest or harness. The cheap first step nobody proposed: port mixoDental's `scripts/real-scan-gate.mjs`, which already has the right shape including `--allow-no-scans` reporting NOT RUN rather than PASS | nothing, until the engine ask exists |
| C10 | **Worker job runner and activity list** | mixoMesh `src/core/workers/{WorkerTask,serveTask,JobActivity}.js` (216 / 47 / 193 lines) beside the vendored `host/workers/` (330 / 64 / 239). Both run: the app's serve its own workers, `src/support-engine/` uses the vendored ones | **Not a deletion, and not scheduled.** `serveTask` is effectively identical; the app's `WorkerTask` is a behavioural subset of the port; **`JobActivity` is a genuine fork** (signal-scoped steps and `blockingJob()` against `fractionOf` and lingering failures). Decide it at the re-vendor, when the vendored half changes anyway | the adherence report's "no app code re-implements a `host/` module", which was wrong |

#### Rows that stay per-app, and why

| # | Candidate | Why it does NOT move into geocore |
|---|---|---|
| S1 | **The start gate** (mixoMesh `engineGate` + `detectEngine` + `gpuGate`; mixoDental `hasWebGL2` + `Stopped`) | **Hub.** A shared gate would be handed the probed facts, the app's policy and the app's words, and hand back those same words. The policies differ: mixoMesh blocks gecko for its storage tiers; mixoDental's floor includes Firefox 114. The probes are DOM, UA and `window.electronAPI`, which D22 excludes |
| S2 | **Error boundaries** (`PanelErrorBoundary`, `PanelBoundary`, `AppBoundary`, `rescue.ts`) | React. Invariant I9 and `tests/d22.test.ts` ban it from `host/` and `editing/`; centralising would weaken a guard to move forty lines |
| S3 | **A shared `Outcome` / tri-state result type** | It buys zero behaviour change: geocore already ships the vocabulary in `editing/errors.ts`, and the class is closed by a test at each site. (The original reason, "a type is in = out", was wrong: a type is handed nothing, and that reasoning would disqualify `Placement` and `PointerRecord` too) |
| S4 | **The independent-consumer harness** (`tests/consumers.mjs` + `consumers.py`) | It drives mixoMesh's own pipeline in headless Chrome for five formats mixoDental does not write, with a hard-coded Windows PrusaSlicer path. What transfers is the habit of giving it a caller |
| S5 | **A shared "guard kit"** for source-reading guards | No asset to ship it in. (The original reason was wrong: the kit's real job would be the **staleness report**, allowances that matched nothing, which is the defect class of mixoDental's i18n guard and mixoMesh's MX-07. Each repo has now fixed its own) |
| S6 | Electron main process, `select-bluetooth-device`, `localStorage` keys, BLE transport and codec, everything drawn | App or device concerns. D22 draws the line for the renderer; the spatial handoff draws the same line for the device |

Also not taken across, unchanged: mixoDental does not take `engineGate` / `detectEngine` (it has no
wholly unsupported engine); mixoMesh does not take `rescue.ts` (it has autosave).

---

### 3. The fix list, in order

Seven fixes. Each is independent of the ones after it; the order is "make the gap visible, then
prove the release before adding to it". Each line is *change → invariant → the test that fails
without it*. GEO-001, which used to head this section, is done (geocore `92b9b74`).

**And GEO-001 was over-billed, which is worth recording because it was relayed to the owner as the
most urgent thing in the family.** The audit graded it P0, "stop the line". Checked afterwards:
**geocore has never cut a release through that assembler.** It requires `--tag v<N>`
(`assemble-release.mjs:23`, `/^v[1-9]\d*$/`) and **no `v<N>` tag has ever existed** — three
`milestone-*` tags, locally and on origin. Both apps' `SOURCE.json` carry `tag: null` and a bare
commit, so each vendored from a local checkout every time and the `--release` path has never run
either. GEO-001 is still right to have — a first release must not ship the two halves at different
versions — but it is cheap insurance on a door nobody has walked through, not a live hazard. What
actually protects the apps today is each app's own `vendor:check` and the engine's runtime refusal
when `engine_version()` and `HOST_GEOMETRY_VERSION` disagree.

1. **The gap line, in both apps.** The local gate reads `engineVersion` from the vendored
   `SOURCE.json` (mixoMesh: `public/vendor/`, not the stale `dist/` copy) and compares it with
   `HOST_GEOMETRY_VERSION` at the sibling geocore's **committed** `HEAD` (`git show`, never the
   working tree, so unfinished engine work cannot cry wolf). It prints `engine 12, geocore 63, behind
   by 51`, or `not compared` when no sibling exists. Print only, no threshold. → *The gap is a
   number on every gate run.* → A unit test over the pure compare: equal, behind, no sibling. Review
   said "compare against the newest released tag"; **no `v<N>` tag exists** (three `milestone-*`
   tags only, checked locally and on origin), so the committed head is the stand-in until the first
   release tag, and then the tag replaces it.
2. **C1: geocore owns the proof of its own STL writer.** As the C1 row. → *geocore's writer is proved
   by a reader that shares no code with it, in geocore's own `npm test`.* → The reflected-export
   negative control, which moves with the file. mixoDental deletes its copy at its next vendor step.
3. **GEO-009.** One vitest test asserting `nodeEngine.engine_version() === HOST_GEOMETRY_VERSION`,
   then delete the literal `63` at `geometry-wasm-smoke.mjs:16` and `dentureIslands.test.ts:100`.
   **Keep** `crates/geometry-core/src/lib.rs:27` (the only Rust-side assertion) and `:18` (the value
   itself). → *The tests are evidence about HEAD.* → Touch a `.rs` file without rebuilding; `npm test`
   must fail. The mechanism was never named and mtime cannot be it (git records none). Recommended:
   the build writes a content hash of `crates/` beside `pkg-node`, and the test recomputes it.
4. **GEO-004.** One test through the real `pkg-node` into `host/core/repairMesh.ts`, the five strides
   read from the engine (the reduced C6). → *I4: the decoder reads the layout the encoder writes.* →
   Change one TypeScript stride constant; the test goes red. Today nothing does.
5. **GEO-002 + GEO-003, one commit (C7).** Fixing 002 alone removes the accident holding 003 shut.
   → *I6 and I7: an unjudged model is never `clear`; a fresh result is never `stale`.* → The audit's
   probe, promoted: the knot fixture with zero contacts must not report islands `ok`, and its refusal
   must not be `stale`.
6. **GEO-005 (C4).** → *An engine code the host does not know is reported as unknown, never as a
   neighbour's meaning.* → Each decoder fed a code one past its table returns `'unknown'`. Add to
   AGENTS.md rule 2: a new value in an existing code table bumps the version. The guard scopes all of
   `host/` by what a line does (indexes a code table), not the nine sites the audit happened to list.
7. **GEO-006 (the rewritten C5).** → *A short or mis-strided array is an error, not zeros.* →
   `decodeSteps` handed an array one short must throw; `loopsLeftOpen: 0` from a short array is the
   case to pin. Same for the five strided walks named in the C5 row.

Fixes 5 and 6 change what the host tells an app, so they ship as **engine 64**, not as silent edits
under 63, and each carries a sentence a user reads. Those are the owner's. Recommended placeholders,
so the question is not half a question: `'unknown'`: "The engine reported something this version
does not recognise." `'nothing-built'`: "Nothing was built to check. Generate supports first."
mixoDental then vendors 64 as an ordinary vendor step, not a phase.

---

### 3b. The re-vendor of mixoDental to engine 64: deferred, with a trigger (decided 2026-11-12)

Section 1 predicted that "engine 64 ships from this very list". It has: geocore closed all 15 of its
remaining findings and `crates/geometry-core/src/lib.rs:27` now asserts `engine_version() == 64`.
mixoDental vendors commit `b5a71ab`, **engine 63**, 19 commits behind.

**Decision: do not re-vendor yet. The trigger is geocore `main` being pushed.** Its 13 commits are
local only, so vendoring now would stamp `SOURCE.json` with a commit absent from geocore's remote —
the traceability cost that GEO-001 was about. When that trigger fires, the re-vendor is mixoDental's
next change, on its own, in the order in the handoff.

**What the decision turned on, and the claim that did not survive checking.** The case for "now" was
a live defect: geocore reported GEO-002/003 as reachable from a user action — delete every support on
a unit, press Export, and engine 63's zero-contact branch returns `verdict: clear`, `islands: ok`
with no revision, which mixoDental's export gate reads as *stale* and reports as *"{name} changed
while it was being exported"*. A permanent refusal naming a cause that never occurred.

**It is not reachable, and the trace stopped one step short of the answer.** `planExport`
(`vendor/mixo-geocore/host/supports/export.ts:53`) only gives a unit a supports part when
`unitContacts(...)` is non-empty, and its own comment says so: a unit "without a live contact (all
deleted or zoned out) has no supports part, so no file is empty". `useExport.ts:108-109` builds the
gate's list from supports parts only, so a zero-contact unit never reaches the engine's `empty()`
branch during export. What the operator actually gets is `useExport.ts:71` — **"Nothing to export:
{name} has no supports left."** — truthful, naming the unit, and already translated in both locales.
`src/supports/export.test.ts:59` has guarded it all along ("never plans a supports part for a unit
whose contacts are all gone").

Two corrections worth keeping, because both were mine to make and neither was obvious:

- **The baseline row was not evidence.** `multipart-10f40a069c2f` records `tipsPlaced: 0`, which
  looked like the zero-contact route on real patient data. Its `reason` is
  `diagnostic-band-invalid-face-graph` — a failed diagnostic band, nothing to do with deleted
  supports. Reading the `reason` field, not just the tip count, is what settled it.
- **GEO-005, GEO-006 and GEO-008 are not reachable on 63 either.** `assertGeometryVersion` refuses
  any engine whose number is not the host's, so no code table can be narrower than its Rust enum
  and no array can be short or mis-strided today. For those three, "63 is fine, 64 is better
  hygiene" is the honest sentence. They bite on the *next* table value, which is why geocore's
  AGENTS.md now says adding one bumps the version.

**Engine output does not move**, so this is a contract change and not a geometry change: geocore's
goldens diff is empty, its 16 snapshots pass byte-for-byte on the rebuilt engine 64, and the whole
Rust diff is 66 insertions across 7 files with no geometry logic touched.

**What the re-vendor must carry when it happens.** Five mechanical compile errors —
`ExportUnitResult.triangles` (`src/denture/engine/dentureExport.ts:39`), `UiState.product`/`.ext`
(`src/App.tsx:1248`), `openFailure`'s third argument (`src/components/openProject.ts:40`),
`'unknown'` added to `PartRole` and `TipPathState` (`src/denture/parts/partRoles.ts`,
`src/denture/steps/orient/liveTipLayers.ts`, `LiveTipSummary.tsx`) and to `modelLanded[].tier`
(`src/supports/unresolved/unresolvedText.ts:59`) — plus **one silent change that `tsc` will not
catch**: `ExportRefusal['reason']` gains `'nothing-built'`, and `useExport.ts:112-115`'s
unconditional `return refuse('inconclusive', name)` would swallow it, trading one wrong sentence for
another. The fix is to return `refusal.reason` itself, which makes every future engine reason a
compile error, plus one new English string and its ja and zh-Hant translations.

**Left open, written down rather than closed.** Dentures are the one residual: `planExport` reads the
stored `unit.placement.points` while `buildDenture` recomputes candidates at export time
(`src/denture/engine/dentureCore.ts:129-130`). If those ever disagree, the 63 behaviour above *is*
reachable for a denture. No case was found and none was constructed; it is unproven either way.

#### DONE, 2026-11-12. What the plan above got wrong, and what the residual turned into

**The re-vendor is landed**: `vendor/mixo-geocore/SOURCE.json` stamps `f00fe23`, engine 64, and the
commit is on geocore's remote, which was the whole point of the trigger. Gate on the tree: **PASS** -
tsc 0, 1628 tests, duplicates, screens, build 941, wasm, nogl 14, **real 0 (13 scans, no
differences)**, tier 6. That real-scan line is the evidence for the claim above that engine output
does not move; it was a prediction when written and is a measurement now.

**Five compile errors was wrong; there were eight sites.** The six predicted ones were right. Two
were not on the list at all:

- **`JobRow.inline` became required** (GEO-012), which three hand-built row literals had to set -
  and, far more important, **nothing in the app read it**. The field exists to tell the operator that
  a job is running on the calling thread because no Web Worker could be created, so the window will
  freeze for about 8 s. Taking the field and dropping the sentence would have left a degraded
  environment indistinguishable from a slow machine. Fixed in `03ee898`, reported first in the meta
  line so truncation cannot eat it. **This is the one real UX gap the re-vendor turned up, and a
  type-error list could never have found it** - the compiler was satisfied by `inline: false` in
  three fixtures.
- **`modelLanded[].tier` needed its sentence in `UnresolvedBubbles.tsx:30`**, not only in
  `unresolvedText.ts:59` as written above.

**The one silent change was exactly as predicted**, which is worth saying because the rest of this
section is corrections: `ExportRefusal` gained `'nothing-built'` and `useExport`'s unconditional
`return refuse('inconclusive', name)` would have swallowed it. Fixed by passing `refusal.reason`
through (`6e6dc7c`), so the next reason upstream is a compile error here instead of a wrong sentence.

**The denture residual is closed, but not the way the paragraph above expected.** It was never
proven that `planExport`'s stored points and `buildDenture`'s recomputed candidates agree - that is
still unproven either way. What changed is the CONSEQUENCE of them disagreeing. On 63 a zero-contact
denture build reached the gate as `stale` and the operator was told the unit "changed while it was
being exported", a cause that had not happened. On 64, with the fall-through fixed, the same build is
refused as `nothing-built`: *"the build produced no support geometry for {name}, so there was nothing
to check and nothing was written. Generate supports, then export."* True, actionable, and translated.
So the residual no longer bites whether or not the two agree. Proving they agree is still worth
doing; it is no longer load-bearing.

**Three guards corrected machine output in this change**, which is the argument for having them:
`glossary.test.ts` caught the zh refusal using 生成 for Generate (this project's term is 產生; 生成
is the JA term), `japaneseSubset.test.ts` caught 名/識/答 falling outside the bundled face, and
`uiStylingDoc.test.ts` demanded `--tip-unknown` be documented. One fault no guard caught: the
translation came back with the **simplified 内** inside otherwise correct Taiwan wording, because the
mainland-term test matches whole words rather than characters.

---

### 3c. The next geocore change: one notion of "how many meshes", shared by both policies

**Decided by the owner, 2026-11-12, who also set the order: geocore first, before any further app
review.** Both apps vendor from geocore, so fixing it upstream costs one re-vendor each instead of
two app-side workarounds that then have to be unwound.

**The requirement, in the owner's terms:** faces where two meshes of one object intersect get no
supports. A dental main object keeps its special treatment (dental tips on the target), while the
other meshes on it DO get supports - on their exposed faces only. The same rule applies to generic
supports: a body and an arm as two meshes of one object get no support in the overlap, and the system
still knows which is the body and which is the arm.

**Most of this already exists, and it is locked inside `dental/`.**
`crates/geometry-core/src/dental/denture/parts.rs` has `hidden_faces(mesh, &split)` (`:281`) - "a
fused part's faces inside or touching another part are hidden: no tips there" - deciding by
`inside_other` (`:434`), a vertical-ray parity test against the other closed part. The roles already
encode the owner's split: `target` gets the dental tips, `fused` (overlaps or touches the target) is
printed with it and gets generic tips **on its exposed faces only**, `addOn` gets generic tips on its
own faces, `debris` gets none, and `genericTipParts` (`:203`) names which parts get generic tips.
`crates/geometry-core/src/generic/` is three files and has **no notion of parts, bodies or hidden
faces at all** - its only `parts` reference is `supports::parts::column::ContactKind`, which is
support geometry.

**One gap found while checking, and it matters precisely for the generic case.** `parts.rs:80`
computes the hidden mask **only if some part is `fused`**, i.e. only if something overlaps the
*target*. Two add-ons that overlap each other but not the target get no mask, so both would get tips
inside their shared volume. Rare in a dental file; the normal case for a body and two arms. That
condition has to go, so the promotion is not a pure move.

**In order:**

1. ~~Promote `surface::parts::split` out of `dental/`~~ - **wrong, corrected 2026-11-12 by Fable:
   it already lives in the shared path at `crates/geometry-core/src/surface/parts.rs:218`.** What is
   still inside `dental/` is `hidden_faces`, `inside_other` and the "any `Fused`" condition
   (`dental/denture/parts.rs:80`). So step 1 is only: give the generic policy access to the part
   list that already exists.
2. Promote `hidden_faces` / `inside_other` with it, and drop the "only when something is fused"
   condition.
3. Make the **generic** policy consume the part list and the hidden mask the way the dental policy
   does, so "outward-facing" means outward *per part* and buried faces get nothing.
4. Point **repair** at `parts::split` instead of `repair::bodies`. That is the same fix: `bodies`
   clusters by proximity at 0.005 mm and its header assumes bodies are at least 0.05 mm apart, so a
   touching hook is ONE body to repair while it is TWO parts to supports. See 3d.
5. Surface the part count and roles to the operator before generate and before repair.

Bumps the engine to 65; both apps re-vendor. mixoMesh needs this to have generic support generation
at all: its own notion of parts (`logicalObjectPartIds`) reads the scene graph - MultiMaterial split
or glTF multi-primitive sharing a `logicalObjectId` - which is file provenance, and **an STL carries
none**.

---

### 3d. Repair versus independent bodies: measured, and worse than assumed

**Fable ran engine 64's `repair_mesh` on synthetic denture-and-hook cases on 2026-11-12.** Two
claims that had been made in this session's discussion are wrong, and the wrong one was the
reassuring one.

- **Identical coordinates have no guard.** `weld_map` merges every bit-identical position
  unconditionally (`core/proximity.rs:219-220`); the edge / no-more-than-two-faces guard exists only
  in the NEAR pass (`:271-301`). geocore's own code says so: `surface/parts.rs:5` reads "the import
  weld merged their coincident corners, so an edge can carry three or more faces".
- **What saves closed shells is the later non-manifold split** (`repair/manifold.rs:55-72` with
  `repair/topology.rs:87-105`), which gives every fan of faces its own vertex copy - not the weld.
  It works for contact at a point or a line.
- **Two measured failures on exactly the denture-and-hook case:** a shared *patch* of identical
  triangulation makes every patch edge four-faced, so the patch is **torn off both shells** - two
  watertight solids became six open pieces, and with fill on, 8 triangles were invented and it
  reported watertight. And if either shell is **open** where they meet, the two **fuse into one
  closed shell, reported watertight, with no alarm**.
- `pair_around` (`surface/parts.rs:110`) resolves the shared-patch case correctly. The manifold step
  does not call it. So supports and repair disagree on the owner's exact case: two parts, one body.
- **A fill cannot span two bodies**, for three reasons, none of which is the body label: a rim is
  walked over shared vertex indices only (`topology.rs:178-235`), the manifold split runs first, and
  a patch names only its own rim's vertices (`fill.rs:14-17`). Two limits remain: the patch is never
  tested for intersection with anything (`fill.rs:46-47`), so a cap on the denture can pass through
  the hook; and if the weld already fused two open rims there is nothing left to protect.
- `merge_near` / `Tolerance::Repair` **has no callers**, confirmed. Leave it that way: it has no
  topology guard and would collapse real short edges.
- **The honest guarantee geocore can give today: closed shells are never fused.** An open hook
  seated on the denture, or a denture with a hole where the hook sits, becomes one body and nothing
  reports it. In a format with no provenance a crack and two open shells meeting rim-to-rim are the
  same data, and no tolerance can separate them.

**So repair stays an explicit operator action, never a step at load.** What runs at load is the
lossless half - weld at noise scale, split parts, diagnose, report - which is what mixoDental does
today (`src/workers/prepareImport.ts:78-79` diagnoses; nothing in `src` calls `repair_mesh`, so the
tear-off and fuse cases above are latent until a Repair button is wired). Repair itself belongs
behind an operator action, per part, with before/after counts and the option to decline.

---

### 4. The re-vendor of mixoMesh: not scheduled

**The trigger.** Do it when the first of these is true: mixoMesh gets a ship date; mixoMesh needs a
named engine feature it cannot have at 12 (the faster route, hard tip rules, phase progress, plate
arrange); or a geocore defect is found on a path mixoMesh's users actually reach. Until then the
gap line (fix 1) is what exists, and it is the whole of the "stay level" mechanism.

**When it fires, in this order.** These are the review's corrections to the dropped Phase 2, kept
because they are the part that would otherwise be relearned:

- **Step zero: capture and commit the engine-12 baseline** (tip sets and support output on the
  smoke fixtures) before touching `vendor/`. Every before/after check needs it.
- **Estimate with the type-checker and the smokes, not signature diffs.** `UiState` gained 27
  required fields; mixoMesh escapes only because it never imports `commands.ts`. That is luck.
- **`scatterAngle` 50 → 45:** saved records carry full settings, so existing projects do not change;
  new records and preset re-applies do, and pinning 50 flips `preset` to CUSTOM. Decide knowing that.
- **`minFromUpDeg` → `overhangAngleDeg`:** the four `minFromUpDeg: 0` sites become **180**, not 0.
- **Old `.mixo` saves:** the load path is `SupportsPersist.js:36-44`; `isSupportsRecord` does not
  enumerate keys, so an old save hands the engine two undefineds as required numbers. Default-fill
  `neckMaxShift` and `minClearance` there.
- `src/core/repair/` stays untouched (C9). Decide `JobActivity` (C10) in the same series.

---

### 5. Phase 0, done 2026-11-12

A record, not instructions. Item numbers are the ones other files cite.

**mixoMesh took from mixoDental (all five):** 5.1 a GPU probe before boot (`gpuGate`); 5.2 one
full-screen surface for every boot failure (MX-13); 5.3 the reader-that-is-not-the-writer test,
`tests/export-bytes.test.mjs` (MX-06c), whose header calls itself debt against this file's section
6 and is now wrong about that (section 6); 5.4 the "nothing built" path named in the export warning
(MX-08); 5.5 the smoke allowlist scoped by what the line is, reporting what matched (MX-07).

**mixoDental took from mixoMesh (all four):** a `PanelBoundary` per region, rendering a named
sentence and never `null`; a pre-React boot banner in `index.html`; `npm run gate` with a receipt
(MIXO-05); the print-angle confirm able to say no (MIXO-02). Gate PASS, full walk 185/186.

**geocore:** GEO-001 as `scripts/release-versions.mjs`, comparing three statements of the version
(tag, engine, host); `navigator` banned in both halves of the D22 guard pair.

**Outside this file's scope and also done:** mixoMesh's three HIGH findings, MX-01, MX-02, MX-03.

---

### 6. Debt deliberately not taken

| Debt | Why not | What would change the answer |
|---|---|---|
| **mixoMesh at engine 12, 51 behind** | Section 1 and section 4 | Section 4's trigger |
| An STL reader in each app's tests and one in geocore's | **Not debt.** Each proves a different writer and each is written from the format alone. The header of mixoMesh's `tests/export-bytes.test.mjs` still says it is retired by C1; correct that comment the next time the file is touched | A second writer of the same bytes appears |
| No shared start gate or boundary (S1, S2) | Hub, and React is banned from geocore by its own guard | A third app arrives with the same policy as one of the two |
| C9: mixoMesh keeps `src/core/repair/` and MeshFixLib | geocore's `repairMesh` returns positions and indices only | An engine ask "repair carries every per-vertex attribute" is written and delivered, and a real-scan gate exists in mixoMesh to compare with. Neither exists; nobody is asked to write them |
| C10: two job layers in mixoMesh | `JobActivity` is a real fork; any decision made against a vendored tree 51 versions old is made twice | The re-vendor |
| C8 / GEO-010: two D22 lists | Two encodings; the known drift is closed | They disagree again; then delete one list, do not add a module |
| The rest of C6: table lengths and phase names derived (GEO-015) | Fix 4 needs only the strides | A test needs them |
| GEO-007: the Blender parity dumps have no reader | Needs the owner's ruling: is Resin UV parity a promise or a goal? | The owner calls it a promise |
| GEO-008, GEO-011 to GEO-014, GEO-016, MIXO-06, and every other open finding | Real, each already specified in its audit, none reaching an app as wrong geometry | Any is found on a path a user reaches |
| C2 and `SpatialRecord` | The handoff's own word is "nothing yet" | The bench answers are written in `mixospatial/docs/decisions/` |
| A cross-repo CI job | Three repos, one owner, CI on tags only. Fix 1 is the cheap version | A second contributor |

---

### 6b. What four reviews changed, 2026-11-12

The reviews are not in this file; their findings that change a decision are. Ordered by how much.

| Row / section | What review found | Verdict now |
|---|---|---|
| **C9** | The deletion would lose per-vertex UVs, uv2 and colour on every repaired scan — see the row | **Do not execute.** Blocked on an engine ask that does not exist |
| **C3** | mixoMesh imports 17 `editing/` modules and **not `commands.ts`**, so "both apps" was false and nothing planned makes it true. `UiState` is 27 required fields, not one. The field is `disabledReason`, not "enabled-reason". `ExtraCommandIds` + `registerCommands()` already do this without touching core | **Split.** `SpatialRecord` and C2 go in; the three command rows and the capability fact stay in mixoDental. `docs/handoff/geocore-spatial-input.md` §3 is withdrawn |
| **C1** | Verified clean — three imports, nothing that parses. But it is gated behind Phase 4, which makes section 5 tell mixoMesh to write a copy now and delete it later: **creating duplication to defer a de-duplication.** It would also be the THIRD reader (geocore's own `host/supports/export.test.ts` already parses bytes inline), and retiring mixoMesh's needs a handedness parameter the moved file lacks | **Do it first, not in Phase 4.** Fold in geocore's inline parse while moving |
| **C5** | The three cited lines are wrong (really `:211`, `:232`, `:283`) and **a strided reader cannot fix the case item 6 says to pin**: `decodeSteps` is not a strided loop, it is a per-index silent zero. Under-scoped too — `dentureReview.ts:291,321` walk a stride-7 array by another idiom | **Rewrite.** A length check in `decodeSteps` is the actual fix |
| **C4** | The census is honest — exactly nine sites fall back to a neighbour's meaning. But `'unknown'` widens roughly nine public string unions, which the row prices at "2 in → 1 out", and nobody has written the word a user sees | **Keep, re-price.** Two undeclared owner decisions ride in engine 64: the sentences for `'unknown'` and for C7's `'nothing-built'` |
| **C8** | Not one datum in two places but **two encodings** — eslint takes globs, the test takes regexes. "0 in → 1 list out" is a constant, which is a hub by this plan's own test | **Delete one list, do not add a module.** The `navigator` half of the drift is closed (geocore `45c71f9`) |
| **C10** | Diffed. Three different answers: `serveTask` is effectively identical (a straight switch), `WorkerTask`'s vendored header says it IS a port of the app's file and the app's 216 lines are a behavioural subset, and **`JobActivity` is a genuine divergent fork** — the app has signal-scoped steps and `blockingJob()` for the overlay, the vendored one has `fractionOf` and lingering failures. Not free even for the easy two: the label type changes from `string` to `JobLabel` at every `run()` site, and two mixoMesh renderers read methods the vendored registry lacks | **Not a deletion.** One test that the two serve-protocols accept each other's messages, then decide `JobActivity` |
| **Phase 2** | **It destroys its own verification baseline.** Every before/after check needs a measurement at engine 12, and the first step replaces the vendored tree wholesale. Also: decision 1's premise is wrong (`scatterAngle` is a preset key; saved records carry full settings, so existing projects do NOT silently change — new records and preset re-applies do, and pinning 50 flips `preset` to CUSTOM); decision 2 never names the four `minFromUpDeg: 0` sites, which become **180**, not 0; decision 3 names the test file, not the load path (`SupportsPersist.js:36-44`), and `isSupportsRecord` does not enumerate keys, so an old save is restored with two undefineds flowing into the engine as required numbers | **Capture and commit the engine-12 baseline first.** The three decisions need re-stating |
| **Phase 5** | Comparing a release against a sibling **working tree** cries wolf whenever geocore has unreleased work — and a number that cries wolf is how a gap reaches 51 | **Compare against the newest released tag.** Promote to day one, print only, no threshold |
| **S3, S5** | Both rejections are right in conclusion and wrong in reason. A type is handed nothing, so "in = out" does not measure it — applied consistently it would disqualify `SpatialRecord`, `Placement`, `PointerRecord` and `StatusMessage`, which geocore already ships. And S5's real job is not the scope list but the **missing staleness report** — three fields in, violations and allowances-that-matched-nothing out, and the second output IS the defect class, the same bug as mixoDental's i18n guard and mixoMesh's MX-07 allowlist | Keep both out, for better reasons: S3 buys zero behaviour change (geocore already ships the vocabulary in `editing/errors.ts`); S5 has no asset to ship in |
| **Section 3 item 2** | `lib.rs:27` is mis-cited — it is a `test-abi` feature gate. The real literal is in `crates/geometry-core/src/lib.rs:27`, and **line 18 is a fourth site the plan never counts**: the number `engine_version()` returns, which cannot be deleted. Deleting `:27` as instructed removes the only Rust-side assertion. The staleness guard has **no mechanism** — mtime is wrong, because git records none | Re-state before executing |

**One structural note worth keeping.** The table mixes three operations under one test: move a file
(C1, C2), unify duplicates inside geocore (C4–C6, C8), and fix a defect in place (C7, whose Home
column reads "stays in `host/`"). The "In → out" column only means anything for the first kind, so
the true count of cross-repo moves is **two**, not eight.

**And the honest reading of all four together:** this document's value is its rejections and section
3's ordering. The phases are a week-shaped critical path in front of six fixes that each already
carry a file, a line, an invariant and a failing test in the audits — and in front of mixoMesh's
three HIGH findings, one of which destroys the user's unsaved work and appears nowhere here.

**Since those reviews:** mixoMesh's three HIGH findings are fixed (section 5). The rows above for
Phase 2 and Phase 5 describe text this file no longer contains; their corrections are carried in
section 4 and in fix 1. Where a row's "verdict now" and section 2 differ, section 2 is the decision.

### 7. Not checked

- **Nothing was run** for this decision: no test, typecheck, build or probe in any repository.
  Looked at directly on 2026-11-12: the three repos' logs, both apps' `SOURCE.json` (63 and 12),
  geocore's tags (no `v<N>`), `HOST_GEOMETRY_VERSION` (63), and that `tests/export-bytes.test.mjs`
  exists in mixoMesh. Everything else is the audits' or the reviews', taken as given.
- **The "about 29 of 46 findings still open" tally** is unverified and so is section 1's "about 23".
  The decision does not turn on it.
- Whether engine 12's host contains any of the weak decoders (GEO-005/006) that mixoMesh would
  therefore keep. `repairMesh.ts` arrived at 62/63, so GEO-004 cannot bite there; the code tables were not checked.
- Which geocore ref each app's `scripts/vendor-geometry.mjs` takes. Fix 1 assumes "the sibling's
  committed HEAD"; if the script takes something else, compare against that.
- Fix 3's content-hash mechanism is a recommendation, not something tried.
- The reviews' line references (`repairMesh.ts:211/232/283`, `dentureReview.ts:291/321`,
  `SupportsPersist.js:36-44`, `lib.rs:18/27`) were not re-resolved.
- Whether mixoDental's `exportBytes.test.ts` asserts anything mixoDental-specific that must stay behind when C1 moves it.
- C10's diff was the reviewer's; which engine version of the vendored files it was taken against is not recorded.
- Other files that cite this one as "the plan" (`docs/HANDOFF.md:29`, the mixoMesh test header) were not edited.

---

<a id="2026-11-16-babylon-layer-port"></a>

## 2026-11-16 — Porting the drawing layers to Babylon — the plan, 2026-11-16

*Was `docs/design/2026-11-16-babylon-layer-port.md`.*

The owner's decision, asked three times and reaffirmed: **one renderer across the Mixo line,
Babylon, so a human maintains one 3D vocabulary instead of two.** mixoMesh is already Babylon 9.6.2.
This is the plan for the part that remains after the seam, the switch and the scene.

Not a proposal. The decision is made; this is the order of work and the traps in it.

### What is already done, and proved

| | Proof |
|---|---|
| The D22 `ViewportPort` answered by both renderers | One test, `viewportPort.test.ts`, runs the SAME assertions against both. 12 pass. The Babylon port was forged (sign flipped) and watched to fail |
| three XYZ Euler → Babylon quaternion | Held against three's own matrix, 6 cases including a compound rotation |
| The scene: models, lit and framed as three frames them | Side-by-side screenshot: same position, same size, same camera angle |
| The floor grid | Canvas background measures `227,234,234` = `--scene-bg` exactly |
| The built supports | Canvas goes 365 → 995 distinct colours with supports built |

### The contract every layer module should meet

One job per module, and the shape that makes them independent (so they can be written in parallel
and reviewed one at a time):

```ts
// src/components/viewport/babylon/<layer>.ts
export function drawX(scene: Scene, input: XInput): () => void;   // returns its own disposer
```

- **Takes plain data and a scene. Returns a disposer.** No React, no props object, no knowledge of
  the other layers. The component calls it in an effect and returns the disposer.
- **Reads colours from `ViewportColours`**, never a literal — `src/ui/noColourLiterals.test.ts`
  enforces this and will catch it.
- **Disposes its own meshes and materials.** A Babylon mesh holds GPU buffers no garbage collector
  frees; the model path already does this and the leak is invisible until it is not.
- **Geometry comes from geocore where geocore has it.** Several layers are already renderer-free
  (below) — re-deriving that geometry in app code would be the mistake this whole seam exists to
  prevent.

### The layers, in the order to take them

**CORRECTED 2026-11-16, by trying it.** This list first put zone stamps at number 1. That order is
wrong, and the way it was found is worth keeping: the zone layer was written, unit-tested and wired,
and then **could not be exercised at all** — painting a zone in the Babylon view is impossible,
because the view has no pointer-to-editing path. The drag orbited the camera and the app recorded
`None`. So:

> **THE INPUT PATH COMES FIRST. Every visual layer below it is unreachable until it exists,**
> which means each one can only be unit-tested, never seen, and "it draws" stays an assumption.
> Two things it owns: routing pointer events through `BabylonViewportPort` into the editing code,
> and making the ArcRotateCamera YIELD during a gesture — `camera.attachControl` currently orbits
> through brush strokes, which in the three.js view it does not.

The rest of the order is by what an operator loses without it, not by what is easy.

| # | Layer | three source | Geometry source | Notes |
|---|---|---|---|---|
| 0 | **The pointer path + camera yielding** (do this first) | `ObjectViewport.tsx` `onPointerMissed`, `useScreenBrush.ts`, geocore `editing/gesture` | mixoMesh `live/supportInteraction.ts` (361 lines) does exactly this over `BabylonViewportPort` — read it | **Nothing below can be verified until this exists** |
| 1 | Zone stamps (no-support zones) — WRITTEN, unit-tested, unreachable until layer 0 | `supportLayers.tsx` | **renderer-free already** — see the exact path below | The evaluation is the real work; the drawing is a mesh like any other |
| 2 | Ghost tip, remove ring, brush circle | `supportLayers.tsx`, `CirclePreview.tsx` | `warmMaterials.ts` cone geometry is three-specific and tiny to rebuild | This is what makes the view an editor rather than a viewer |
| 3 | Selection highlight / stale / tips-only | `supportLayers.tsx` | recolouring vertex ranges in place | mixoMesh's `supports/layers/supportMeshLayer.ts` does this job in Babylon already — read it first |
| 4 | Dental paint, face tint, region lines | `dentalLayers.tsx` | **renderer-free already**: `faceMaskOverlay.ts` → Rust `face_mask_overlay`, `face_mask_contour_segments` | No Babylon equivalent exists in mixoMesh; this is dental-only work |
| 5 | The rim being drawn | `RimDraftLayer.tsx` | `src/core/surfacePath/` is renderer-free | |
| 6 | The gizmo | `UnitObject.tsx`, `gizmoStyle.ts` | Babylon `GizmoManager` | `gizmoStyle.ts`'s token and constant tables survive; only the three drawing goes |
| 7 | Bubbles, add flash, print-angle arc, thumbnail | their own files | mixed | `UnresolvedBubbles` is HTML in a 3D group — Babylon needs a different approach (screen-space projection through `worldToScreen`, which the port already answers) |

#### Layer 0's design, worked out and not yet built

Everything below was established by reading; none of it needs discovering again.

**The zone brush, end to end** — the smallest input path that proves the whole thing, because it is
the one that makes layer 1 visible:

1. `props.gesture.kind === 'zones'` carries `brush: { radius, kind }`. That is the only signal
   needed to know a drag paints rather than orbits.
2. On pointer down and move, `BabylonViewportPort.screenToRay([x, y])` then `pick(handle, ray)`
   gives a world-space point and surface normal.
3. `nextStamp(last, point, radius)` (geocore `editing/zones`) says whether the brush has moved far
   enough — half a radius — to lay a new dab. Do not invent this spacing.
4. Convert the point and normal to **unit-local** space (the inverse of the unit's transform) and
   build a `ZoneStamp { center, radius, normal, kind }`. The normal is load-bearing: it is what
   keeps the far side of a thin wall out of the zone.
5. On pointer up, call `props.onZoneStroke(unitId, stamps)` — one call per drag, so one drag is one
   step on the history.

**THREE obstacles, and the third is the one that will cost a day if it is met rather than read.**

- **`pick` works in the UNIT'S LOCAL FRAME, not world space, whatever `ViewportPort`'s comment
  says.** Its wording — "rays and hits are world space" — is true of `screenToRay` and false of
  `pick`: the session mesh is loaded from the unit's own positions, so the ray must be converted
  into that unit's frame first and the hit comes back in it. `useScreenBrush.ts:77` says it out
  loud, "support-local → world → model-local (a rigid placement: distances carry over)", and
  `rustRaycast.ts` does the same inverse-matrix step. Hand it a world ray and it returns a confident
  hit on the wrong triangle for every unit that is not at the origin — which reads as a picking bug
  and is a frame bug. Noted at the top of `babylonViewportPort.ts` as well.
- **`useScreenBrush.ts` is the three.js view's real consumer of the port**, not the editing package:
  `ViewportPort.ts` is the only file in geocore's `editing/` that mentions the interface at all, so
  the seam is a contract the apps honour rather than one the shared code calls. The Babylon layer 0
  is therefore the Babylon counterpart of `useScreenBrush`, and that file is the thing to read.

**The two obstacles already known:**

- **Picking needs an engine session handle, not `scene.pick`.** The port's contract is explicit:
  the app answers through the engine session "never through its renderer's own picking, so both
  apps pick identically". `sessionMesh.ts` does this for three.js and is tied to a three geometry's
  `dispose` event, so the Babylon view needs its own handle lifecycle — load the unit's mesh into
  the session, keep the handle, release it when the mesh goes. Using `scene.pick` instead would be
  quicker and would make the two renderers disagree about which triangle was hit, which is the one
  thing this seam exists to prevent.
- **The camera must yield.** `camera.attachControl(canvas, true)` currently keeps every drag. It has
  to stand down while a gesture owns the pointer, and take over again when it does not.

mixoMesh's `src/supports/live/supportInteraction.ts` (361 lines) is the same job over its own port
and should be read before writing this — bearing in mind it is unchecked JavaScript.

#### Layer 2 is NOT finished, and the Babylon marker is an approximation

Read `EditPreview` in `supportLayers.tsx` before touching this again. It draws **three** things, and
the Babylon `ghostTip.ts` matches none of them exactly — it draws a plausible marker, not that one.

| Element | When | Geometry | Material |
|---|---|---|---|
| **the ring** | always | torus at the hover point, radius = the brush radius or `settings.eraseRadius`, tube `max(0.03, radius * 0.025)`, 6 × 48. Its +Z is turned to the surface normal | `ringMaterial(colour)` — **basic, unlit**, `depthTest: false`, opacity 0.85, renderOrder 20 |
| **the add cone** | only when NOT removing and no brush | at `point + normal * (neckLength / 2)`, radius `settings.pillarDiameter / 2`, height `settings.neckLength`, 16 sides. Its +Y is turned to the **negated** normal, so it points INTO the surface | basic, `--mark-add`, opacity 0.55, `depthWrite: false`, renderOrder 19 |
| **the doomed marker** | when a click would remove a contact | sphere at that contact, radius `max(0.25, pillarDiameter * 0.45)`, 12 × 8 | basic, `--mark-remove`, `depthTest: false`, opacity 0.9, renderOrder 21 |

**What the current Babylon version gets wrong**, all of it honest debt rather than a mystery:

- it draws **no ring at all**, and the ring is the element that is always on screen;
- its cone is a fixed 1 mm × 2 mm instead of `pillarDiameter` × `neckLength` from the unit's
  resolved settings, which is why it needed enlarging to 20 mm before it could even be measured;
- it uses `--mark-support-tip`, where `EditPreview`'s cone uses **`--mark-add`** — a different
  token;
- it uses a lit PBR material where all three of these are **unlit basic** materials with their own
  depth and opacity rules, which is what keeps them readable on top of the model;
- it has no doomed marker, so nothing shows WHICH support a remove click would take.

`contactToRemove(contacts, point, radius)` is the renderer-free rule behind the doomed marker, and
`resolveSettings(unit.settings)` gives the sizes. Neither needs rewriting.

#### Layer 3, the selection highlight: recolour in place, do not rebuild

`useSelectionColors` in `supportLayers.tsx`. The support bodies are ONE mesh, and selecting a
support repaints its vertices rather than drawing anything new:

1. `contactVertexRuns(supports)` maps each contact id to its vertex ranges in that single mesh.
2. A `color` vertex attribute is written in place — `--support-picked` over the selected runs, the
   base colour over the rest.
3. `selectionDelta(previous, now)` repaints ONLY what changed. A full repaint happens on a fresh
   geometry, a base-colour change or a token revision, and otherwise never. On a mesh with hundreds
   of supports that difference is the whole budget.

**The trap: `linearBytes`.** Vertex colours go in LINEAR space, not sRGB. Write the token's bytes
straight in and every selected support comes out the wrong shade — close enough to look like a
palette choice rather than a bug. Babylon's vertex colours need the same treatment, so reuse that
helper rather than writing bytes by hand.

#### The gizmo: the conversion is done, the PARENTING is the open question

`eulerFromQuaternion` / `transformFromMesh` in `babylonTransform.ts` are written and tested, so
reading a dragged mesh back into a `ModelTransform` is solved — including the part that would have
been silently wrong, since Babylon's `toEulerAngles` returns yaw-pitch-roll, a different
decomposition of the same rotation. Feed that into a `ModelTransform` and the numbers look
reasonable, round-trip into a different rotation, and the model jumps when anything re-reads it.

**What is NOT solved, and must not be guessed at:** the three.js gizmo attaches to the unit's
GROUP (`UnitObject` reports it through `onGroup`, and `ObjectViewport` passes it to
`TransformControls`), not to a mesh. The Babylon view currently has no equivalent — the model mesh
and the support mesh are siblings with no parent — so building the gizmo means first giving each
unit a `TransformNode` and deciding what hangs off it.

That decision is **simpler than an earlier version of this file claimed**, and the correction is
worth keeping. `UnitObject` puts ONE group at `unit.transform` and draws the model AND
`SupportBodies` inside it, and `SupportBodies` applies no transform of its own — so both hang off
the same node, and a gizmo drag should move both. That is right: the support geometry is unit-local
and rigidly attached, so supports travel with the model.

`generationTransform(unit)` is **data, not a position** — the frame the supports were generated in,
handed to things like `UnresolvedBubbles` so they can reason about it. This file, the folder README
and `d6d3f9f`'s commit message all previously said supports were *drawn* there, with a confident
argument for it. They were wrong, and the effect in the Babylon view was supports left behind
whenever a model moved.

Also already in hand: `gizmoShown(gesture, gizmoMode, rotationGizmo)` is exported from
`ObjectViewport.tsx` and is renderer-free, so the visibility rule needs no porting; and the camera
must stand down during a gizmo drag exactly as it does during a brush stroke.

#### The drag-over brush: the last three props, and why it is its own job

`onPaint`, `onShift` and `onNoBodies` are one piece, not three, and it is the only remaining part
of the viewport that cannot be written by adapting a decision function in an afternoon. What is
established:

**The decisions are all renderer-free and ready:** `bodySegments` / `tipSegments` turn supports into
screen-space segments, `brushHits` answers what a swept circle covered, `createBrushScheduler`
paces the work across frames, and `createDragOver` owns the gesture (a press on empty space belongs
to the CAMERA and ends any open stroke; the mode is LATCHED at the press, so Shift changing
mid-stroke does not change what that stroke does).

**What is genuinely renderer-specific is small:** a `view` with `frame()` returning the hit test,
built from the port's `brushView` — the clip matrix of the SUPPORT GROUP (projection x view x the
unit's world matrix) and the eye in that group's space, because `brushHits` works in support-local
coordinates. `surfacePointer`'s `brushView` is NOT that and says so at the line.

**A finding that shrinks the job: occluders are dormant.** `screenBrushView` gathers meshes with
`userData.occluder`, and NOTHING in `src/` sets it — so `visibleOccluders()` always returns an
empty list. Passing `[]` is therefore faithful to what the three.js view actually does today, not a
simplification of it. Say so in a comment rather than quietly matching it.

**The obstacle, and the two honest routes.** `useScreenBrush` is a React hook bound to r3f through
`useThree` (gl, camera, scene), so it cannot simply be called from the Babylon view:

1. **Refactor it to take its view and its canvas injected**, so BOTH views use one hook. This is the
   only route that makes the brush identical *by construction*, which is the rule everything else
   here follows. It is a change to a 341-line shared file and must be walked.
2. **Reimplement the orchestration on the Babylon side**, reusing the scheduler, `createDragOver`
   and `brushHits`. Lower risk to the three.js path, but the two agree only while someone keeps
   them agreeing — the exact failure mode the rule exists to prevent.

**MEASURED, AND IT DOWNGRADES THE RISK I FIRST CLAIMED.** I described route 1 as "a 341-line
shared-file refactor", which overstates it. The r3f coupling in that hook is narrow and countable:

- **four** `useThree` calls (`gl`, `camera`, `scene`);
- `gl` is used ONLY as `gl.domElement`, i.e. as the canvas, in three places;
- `camera`, `scene` and `options.group` appear ONLY inside the single `screenBrushView(...)` call.

Everything else in the hook — the scheduler, the drag-over, the hover refresh, the resting point,
the Shift tracking, the no-bodies report — is already renderer-free and would not be touched.

**CORRECTED AGAIN, and the pattern matters more than the number.** There is a THIRD coupling I
missed on the first read: `objectAt` uses `createObjectTest()`, which is three.js to the bone — a
`THREE.Raycaster`, `traverseVisible`, and meshes marked `userData.strokeStart`. It answers "is this
canvas point on the object", counting the model, a support under the pointer, and a support the
circle reaches from nearby (a support BEHIND the model does not count).

I have now revised this estimate upward twice, each time after reading further into the same file.
That is the signal to stop estimating from partial reads — not a reason to hurry the change through.

**The complete, verified injection list is three points:**

| Inject | Replaces | Babylon's answer |
|---|---|---|
| `canvas` | `gl.domElement`, used in three places | its own canvas |
| `makeView(bodies)` | the single `screenBrushView(...)` call | a view over the support-group clip |
| `objectAt(at, radius)` | `createObjectTest()` + `group` + `camera` | `pointer.hitAll(x, y)` — a model or support hit counts — sampling the same `SUPPORT_REACH` shares at the same `AROUND_ANGLES`, where only a `'support'` answer counts away from the centre |

With those three passed in, the rest of the hook — scheduler, drag-over, hover probe, resting point,
Shift latching, the no-bodies report, the brush circle element — is renderer-free and moves whole
into a shared hook. `useScreenBrush` stays as the thin three.js wrapper that calls `useThree` and
supplies the three, which is also what keeps its path unchanged by construction.

So route 1 is really: **inject three things.** Replace `gl.domElement` with a `canvas` option, replace
the `screenBrushView(...)` call with a `makeView(bodies)` option, and leave `useScreenBrush`'s
three.js caller supplying both exactly as it does now. The Babylon view then supplies its own
canvas and a view built on the support-group clip. That is a small, reviewable change whose
three.js path is unchanged by construction — not the rewrite I implied.

Route 1 is correct. It is recorded here rather than attempted at the end of a long session because
a hasty refactor of the shared hook is how the three.js brush would acquire a subtle fault, and
that brush is what the walk's `g`-series checks exercise.

##### DONE, 2026-11-17 — and the estimate was wrong in the one way that mattered

Injection alone could **not** have worked, and nothing above spotted it: `useScreenBrush` calls
`useThree`, which THROWS outside an r3f `<Canvas>`. A Babylon component calling it would not have
been subtly wrong, it would not have rendered. So the hook had to come apart, and it did:
`useBrushOverlay.ts` holds everything renderer-free, `useScreenBrush.ts` is the three.js wrapper
(unchanged in behaviour by construction — it supplies the same three things it used to compute
inline), `babylon/brushBodies.ts` is the Babylon one.

The third injection point, `objectAt`, was found by reading rather than by estimating, and so was
the detail that makes it faithful: the three.js test raycasts from the brushed unit's OWN group, so
another unit in front does not block a stroke. `hitAll` answers for the whole scene, so the Babylon
version filters to that unit and takes its nearest hit.

**The one invisible risk, now tested.** Babylon multiplies matrices the opposite way round from
three.js, so the brush clip chain is `world.multiply(view).multiply(projection)`. Written the
three.js way it still produces a plausible matrix and a confident hit, wrong only once a unit leaves
the origin — exactly the class of bug that shipped the support frame. `brushBodies.test.ts` holds
both the clip and the eye against three.js' own matrices, and asserts the habitual order is NOT
what the code does.

**A performance fault found while wiring it, and fixed at the root.** The Babylon units effect
depended on `props.selection`, rebuilding every mesh in the scene when it changed. Drag over changes
its preview every frame, so a stroke would have rebuilt the whole scene at frame rate. The selection
handles are now kept in a ref and recoloured in place (`paintHighlights`), and `props.selection` is
off that effect's dependency list — which is what `useSelectionColors` already does for three.

**`unitOverlay` carried r3f elements**, so the INTERFACE was renderer-bound, not the implementation.
It is now `unitTint: { unitId, mask, colour }` — data — and each view draws it with its own geometry
(`FaceTintLayer` in three, `babylon/faceTint.ts` in Babylon). `dentureAddOnTint` returns the mask and
the colour instead of a node; it was the only caller.

#### Wiring the remaining 25 props, and the rule that makes the two views identical

**THE OWNER'S REQUIREMENT, 2026-11-16: the user flow, the UX, the UI and the tool modes must be
IDENTICAL, not merely equivalent.** That settles how this is written, not just how much:

> **Import the decision. Adapt only the input.** Every rule about what an interaction MEANS is
> already renderer-free — `pickAction` (`editing/pick`), `missAction`, `rimTapAt`, `gizmoShown`,
> `frameView` / `spotView` / `belowPlate` (`editing/view`), `brushHits`, `nextStamp`. The three.js
> handlers are ADAPTERS over those, not logic. Call the same functions with the same inputs and the
> two views agree by construction; reimplement any of them "to match" and they agree only until
> someone changes one.

The Babylon view uses **15 of the 40** `ObjectViewportProps`. That count, not the layer count, is
the honest measure of this migration: most of what remains is interaction, not pixels.

| Decision | Already renderer-free in | What Babylon must supply |
|---|---|---|
| what a click means (add / erase / select / pass) | `pickAction`, via `UnitObject`'s thin `pickFor` | hit kind (`model` or `support`), button, ctrl, shift, **travel**, mode, tool, active, contact |
| what a click on the rim means | `rimTapAt` | the tapped point in UNIT-LOCAL space, and travel |
| a click that hit nothing | `missAction` | button, and whether a gizmo is dragging |
| camera framing (fit / bottom / side / focus) | `frameView`, `spotView`, `boundsSphere`, `belowPlate` | bounds of the selected units, canvas size, right-hand inset |
| drag-over support selection | `brushHits` + the port's `brushView` | nothing new — the port already answers `brushView` |

**How a support hit becomes a contact, now read rather than guessed.** `contactAtTriangle(supports,
faceIndex)` is renderer-free, and the engine pick already returns a triangle index — so it is
`handleFor(supports)` then `contactAtTriangle(supports, hit.triangle)`, with the support mesh loaded
into the session like the model. **But a subtlety that is easy to miss and changes behaviour:**
braces, the raft and labels belong to NO contact, and in three the pick then *continues behind
them* to whatever is further back. r3f gets that from event propagation; Babylon's nearest-hit pick
does not, so a no-contact support hit has to fall through to the next candidate rather than being
swallowed. Swallow it and clicking a brace does nothing where it used to select the model.

**The rim drag, and the house rule it encodes.** `rimTargetAt` and `insertAnchor` are renderer-free:
the target UNDER THE PRESS decides, not an armed tool. A handle is picked up; bare line takes a new
handle and picks THAT up, so inserting and dragging are one gesture; anything else picks up nothing
and is left for the camera, because **where the drag starts decides**. An inserted handle goes on
the undo stack before the drag moves it. And the camera must be turned off BY HAND for the
duration — three's comment is explicit that `stopPropagation` is not enough, because OrbitControls
listens on the canvas, not the object tree. The Babylon zone brush already does exactly this.

**Three things Babylon must grow:**

1. **Support picking, and a hit to a CONTACT ID.** The support mesh is `isPickable: false` today and
   nothing maps a hit to a contact. `contactVertexRuns` (already used by the selection highlight)
   maps contact ids to vertex ranges, so triangle-to-contact is a lookup away.
2. **`travel` per press.** r3f hands `event.delta`; here it must be tracked from pointerdown. It is
   load-bearing, not cosmetic — it is what stops a view turn that began on the model from leaving a
   rim point behind (walk `u5d`).
3. **A DOM overlay anchored to a 3D point.** `UnresolvedBubbles` uses drei's `<Html>`; the port's
   `worldToScreen` is what drei does internally. It is the only mechanism here that is genuinely
   different, so do it EARLY rather than last.

**One prop could not be ported as it stood:** `unitOverlay.node` was typed `ReactNode` and mounted
inside a 3D group, carrying r3f elements — so the INTERFACE was renderer-bound, not just the
implementation. Settled 2026-11-17 by passing data: `unitTint: { unitId, mask, colour }`, drawn by
each view's own face-tint layer. It was the only one of the 40 with that problem.

#### The dental layers: SEVEN components — six built, one to wire

**Built:** the area and paint (`babylon/surfaceStamps.ts`, which generalised the zone layer and
serves all three stamp callers), the face tint and the region trim lines (`babylon/dentalArea.ts`),
the rim outline and the overhang risk patches (`babylon/dentalMarks.ts`). The tip markers
(`babylon/tipMarkers.ts`) are written and typecheck; only the wiring is left, and the
solid/ghost split needs the selection plumbed.

**None of the dental set is verified by eye.** They need a TWO-CONTOUR policy, which the knot
fixture does not produce — load `docs/dental-reference/reference-aligner.stl` or a case under
`samples/` and run the dental flow to Step 2.

#### The original reading, kept for the detail

#### The dental layers: SEVEN components, not one

`dentalLayers.tsx` is the biggest remaining piece and it is not a single layer. Take them
separately; two of them are nearly free because the Babylon port already has the path.

| Component | What it needs |
|---|---|
| `DentalStampLayer`, `DentalPaintLayer` | Both wrap `SurfaceStampLayer` — the SAME stamp-to-vertices path `babylon/zoneLayer.ts` already ports. Do these first; they should be a few lines each once the zone layer is generalised to take a colour and a stamp list |
| `DentalFaceLayer` | The real work. See below |
| `DentalRegionLines` | Rust `faceMaskContourSegments(mesh, pairs)` for `region.outerEdges` and `region.openingEdges`, drawn as two line sets: outer in `--mark-ring`, opening in `--mark-area-edge`, both `depthTest: false`, `depthWrite: false`. Its comment says why it matters: **exact mesh edges, not a planar proxy for a non-planar dental trim** |
| `DentalRiskLayer` | A disc on each overhang low point outside the permitted area. Display only — supports and export never read it |
| `DentalRimOutline` | The rim as drawn |
| `DentalTipMarkers` / `TipInstances` | Step 2's tip preview, INSTANCED cones. Babylon's equivalent is thin instances, not one mesh each |

**`DentalFaceLayer`, and the trick in it worth copying rather than reinventing.** The geometry comes
from Rust: `faceMaskOverlay(mesh, dentalContactMask(policy, triangleCount))` returns positions and
normals with a separate vertex per approved triangle corner. The layer is then masked **by ALPHA in
the vertex colours alone** — one uniform colour (`--mark-area-permitted`) with each vertex's alpha
set to 255 or 0 from a `Uint8Array` mask. No geometry is rebuilt when the painted area changes.

The mask is updated **incrementally**: if the new stamp list extends the applied one (same kinds,
`sameStamp` on each), only the new stamps are laid; anything else resets the mask to 1 and replays.
`stampVertices` is reused with `allow` mapped to `paint` and the other kind to `erase`.

Material: basic/unlit, vertex colours ON, **double-sided**, transparent at the given opacity,
`depthWrite: false`, `polygonOffset -2/-2` (Babylon: `zOffset = -2`), renderOrder 16.

**A Babylon-specific note, and it is the mirror of a trap already met.** This layer NEEDS
`hasVertexAlpha = true`, because its whole masking mechanism is vertex alpha. The support mesh in
`BabylonObjectViewport` sets `hasVertexAlpha = false` for the opposite reason — its vertex colours
are opaque and letting Babylon infer alpha blending there would be both slower and wrong. Same flag,
opposite answers, for reasons that are not interchangeable.

#### Layer 1's data path, so nobody re-derives it

Every step but the last is renderer-free and already written. The Babylon work is the final draw.

1. `zoneOverlay(mesh, maxEdge, maxTriangles, cellSize)` — `src/components/viewport/overlayMesh.ts`.
   Returns a **refined** copy of the mesh (Rust `refine_for_overlay`: long edges split at their
   midpoints, no cracks, winding kept) plus its `VertexGrid`. Cached per mesh object. The refinement
   is why a 2 mm brush dab shows on a face made of a few large triangles — **mixoMesh does not
   refine and says so (its P5), so its overlay is not the thing to copy here.**
2. `stampVertices(stamp, positions, normals, out, grid)` —
   `vendor/mixo-geocore/host/core/supports/zones.ts`. Lays each `ZoneStamp` into a `Uint8Array`,
   one byte per vertex; `kind: 'paint'` writes 1 and erase writes 0, so the **last covering stamp
   wins** simply by applying them in order.
3. Triangles with at least one zoned vertex become the draw list. mixoMesh's
   `zonedTriangles(indices, zoned)` in `src/supports/layers/zoneOverlay.ts` is exactly this and is
   worth reading, as is its `vertexNormals`.
4. Draw that index subset as its own Babylon mesh, see-through, in `--mark-zone`. A small painted
   spot stays a small draw.

**The numbers, all from `supportLayers.tsx` — copy them, do not re-choose them:**

| Constant | Value | Why it is that |
|---|---|---|
| `OVERLAY_MAX_EDGE` | `1` mm | So a 2 mm brush dab shows on coarse faces |
| `OVERLAY_MAX_TRIANGLES` | `1_500_000` | The refinement's budget |
| `ZONE_GRID_CELL` | `2` mm | About one brush dab |
| refinement cut-off | `maxEdge = Infinity` once the mesh has `FULL_TIER_MAX` triangles or more | A big enough mesh is already fine enough; refining it is cost for nothing |
| `ZONE_OPACITY` | `{ full: 0.7, faint: 0.3 }` — `src/components/viewport/style.ts` | Faint in Support Edit Mode, full in zones mode |

The three.js material to match is `meshStandardMaterial` with `emissive` the same colour at
`emissiveIntensity` 0.35, `metalness` 0, `roughness` 0.8, `polygonOffset` −2/−2, and `depthWrite`
off while see-through. The polygon offset is what stops the overlay z-fighting the model it sits on;
Babylon's equivalent is `zOffset` on the material, and leaving it out is the obvious way to get a
shimmering overlay that looks like a driver bug.

**What mixoMesh already has in Babylon** and should be read before writing 2 and 3:
`src/supports/layers/pointerLayers.ts`, `supportMeshLayer.ts`, `zoneOverlay.ts`,
`BabylonViewportPort.ts`, `live/supportInteraction.ts`, `live/supportCamera.ts`. It has **nothing**
for the dental layers, the gizmo restyle, the customised marks or the problem markers.

**A caution about sharing those files rather than reading them:** mixoMesh is 276 `.js` to 131 `.ts`
with `checkJs: false`, so its scene layer is unchecked JavaScript, while this app is strict
TypeScript with `noUnusedLocals`. Sharing Babylon *files* between the two apps needs that settled
first. This branch shares a vocabulary, not files.

### How to verify a layer

Pixels, not impressions — the browser pane is often too narrow for a useful screenshot.

```js
// in the page, against [data-ui="viewport-babylon-canvas"]
gl.readPixels(...)  // then: distinct colour count, modal (background) share, dark-pixel count
```

A layer that draws something moves the distinct-colour count and the background share. The model
path, the grid and the supports were each proved this way.

**THE CANVAS ALTERNATES BETWEEN TWO FRAMES, so pixel diffing has a floor.** With nothing moving
and the pointer parked off the model, consecutive reads of the Babylon canvas go `0, 605, 0, 605, 0`
— two states, 605 pixels apart, swapping. Frames of the same parity are byte-identical, and a
genuinely idle scene with no pointer events at all diffs to **0**, so the scene itself is stable.
It is the read that alternates. Consequences for anyone measuring a layer here:

- **only a difference well above ~605 pixels means anything**; a hairline ring does not clear it;
- take several frames and compare same-parity ones, or enlarge the thing you are testing until it
  is unmistakable (the ghost tip needed 20 mm to produce 5,384 unambiguous pixels);
- the app's OWN state is the better oracle where it exists — the zone brush was proved by the
  control reading "Painted", not by counting pixels.

**Two traps, both of which cost a verification round here:**

1. **Supports take about 16 seconds to build on the knot fixture, and the panel enables "Remove
   supports" within 2.** Wait on the data — the mesh lengths — never on the button. An empty mesh
   reads exactly like a layer that does not draw.
2. **r3f's `<Canvas>` does not set `preserveDrawingBuffer`**, so `readPixels` on the three.js canvas
   returns all black. The Babylon view can be measured and the three.js one cannot. Comparisons
   between the two are by screenshot in a wide pane, or by temporarily adding the flag to the three
   view.

### What finishing looks like

Not "Babylon draws everything". It is: **the 186-check walk passes with `?renderer=babylon`**, which
means rewriting the walk to drive whichever renderer it is pointed at. That is the acceptance test
for this whole migration, and until it is written the Babylon view is a preview however complete it
looks. Only then does three.js come out — `three`, `@react-three/fiber`, `@react-three/drei`, and
the 2,480 lines in `src/components/viewport/` that use them.

### 2026-11-17 — the walk drives either renderer, and what it found

`npm run walk -- --renderer=babylon` runs the same 186 checks against the Babylon view. **One file,
two runs**, because a second walk file would have drifted from this one within a week and would have
proved only that the two views agree about whatever somebody remembered to copy. Almost every check
is the app's behaviour — counts, status lines, what Undo brings back — and does not care which
library drew the pixels, so the flag only changes the base URL: the renderer switch is read from the
address on every load and deliberately not remembered, so every `page.goto(url)` carries it.

**The verdict line names the renderer whenever it is not the default.** A Babylon receipt must never
be readable as the three.js gate, which is what `npm run gate` and CLAUDE.md still mean.

#### Five faults, and not one of them was where it hurt

The first Babylon run died at check 73 with five rim failures. None of them was about the rim.

1. **The edit clicks ran in rim define mode.** three's `UnitObject` returns before `pickFor` while a
   rim is being drawn; this view had no such guard, so every click that placed an anchor also added
   a support. A probe counted fifteen. Fifteen supports grew the unit's bounding box fourfold; the
   camera fit framed the supports rather than the model; the walk aims at canvas FRACTIONS, so its
   clicks then missed the model altogether. One missing guard, five failing checks, none of them
   about the thing that was wrong. The rule is named once now (`clickOwner.ts`) and both views ask
   it.

2. **The camera fit was declared before the units effect**, so the fit that arrives with a freshly
   imported model found no node and did nothing. The same trap as the gizmo, in the same file.
   Proved by measurement: with Fit pressed by hand the two views' models covered exactly the same
   canvas cells, which said the arithmetic was never wrong and the ordering was.

3. **The area layers read only the PREVIEW**, never the accepted policy, so once Step 1 handed its
   policy over every one of them vanished — the drawing was saved and invisible. No check caught
   this directly; it fell out of chasing (4).

4. **A one-pixel line at 0.9 alpha renders near-white here.** `u5j` measures the area-edge token on
   the model: zero pixels in this view, 122 in three. Forced to a pure green the line measured
   177/255/183 — lifted on the two channels that should have been zero — so the colour reached the
   shader and the blending ate it. One opaque pass measured 0/255/0 exactly. Both loops are opaque
   now and the rim measures 105 pixels of the exact token.

5. **Babylon drew and picked the full mesh where three draws and picks the simplified DISPLAY copy.**
   `b3d` adds a support at one canvas point on the real aligner: three answered "Support added." and
   this view answered "This spot faces up, so a tip here may not hold." One spot, two answers,
   because they were not the same surface. The display copy is what is drawn, picked and used as a
   brush occluder now, and the surface overlays are gated on `shown === unit.source` exactly as
   `UnitObject` gates them.

#### The probes, which are worth more than the fixes

Three throwaway scripts did the work, and each asked the APP rather than the picture:

- **a canvas-fraction hit grid** — click a grid of points, watch the rim count, print where the
  model is. That is what turned "the rim is broken" into "the model is three times too small";
- **a React-props read** (the walk's own `readProps` trick) — both views reported the same policy
  kind, the same sixty rim points and the same opening direction, which said the drawing was
  reaching the screen and arriving the wrong colour;
- **a forced colour** — set the rim green and measure. The answer was lifted on exactly the channels
  that should have been zero, which is a blending fact, not a colour fact.

#### Still open, and quantified

The two views land the same click **0.19 mm apart** on the same face (`b3d`: tip at
-23.352/2.246/-0.952 against -23.299/2.122/-1.081). An `ArcRotateCamera` is placed through alpha,
beta and radius, so it cannot land on three's exact position. It is within a face everywhere the
walk looks. The zone brush also lands a stroke differently on the knot (three: one stroke, six
supports hidden; Babylon: two strokes, seven) — the check is relational and passes either way, and
the cause has not been chased.

### 2026-11-17, later — the two differences that were left open, closed

#### The zone brush had its own sampling, and that was the whole difference

The walk noted "zones painted over the model (2 strokes landed)" against three's 1, and the check
around it is relational, so it passed either way. It was not a measurement of the brushes: the
walk's helper HUNTS for a spot that registers, so its count depends on where each view framed the
model. A fixed stroke, painted at the same canvas points in both, is the measurement — and the
first one said 1 against 2.

`attachSurfaceBrush` had reimplemented the stroke instead of importing it. It recorded a hit on the
press and one every half radius, and turned the lot into stamps on release. `UnitObject` runs
geocore's `createStroke` with `zoneFill`, which remembers the last centre it laid, decides when the
next is due, and **fills the gap between two samples with `stampsAlong`** — so a fast drag paints a
continuous band where sampling alone paints a dotted line. The faster the drag, the more it looked
like a different tool.

It runs the same stroke object and the same fill rule now. One fixed stroke, both views:

```
0.36/0.42 -> 0.44/0.42:  +6 stamps (radius 2)   both
0.40/0.36 -> 0.60/0.36: +11 stamps              both
0.30/0.50 -> 0.70/0.50: +31 stamps              both
```

The in-flight stamps are reported to the view as they are laid, too (`onLive`), because
`UnitObject` draws `[...unit.zones, ...stroke]` and this view drew nothing until the release —
paint that arrives all at once at the end is a different tool to use. They are drawn from an
overlay slot rather than the units effect, for the reason that effect already carries: it rebuilds
every mesh in the scene.

#### The 0.19 mm click difference was a camera still moving

`b3d` clicks one canvas point on the aligner and reads where the tip landed. Three runs each:

```
three    -23.344/2.209/-0.987   -23.350/2.239/-0.959   -23.352/2.246/-0.952   spread 0.04 mm
babylon  -23.313/2.188/-1.016   -23.299/2.122/-1.081   -23.193/1.654/-1.604   spread 0.70 mm
```

Babylon's numbers drift steadily in one direction, which is not noise — it is a camera that has not
stopped. `ArcRotateCamera.inertia` defaults to 0.9: the camera keeps nine tenths of its last
movement **every frame** after the pointer lets go, and that decays per frame rather than per
second, so under SwiftShader it glides for seconds. One of the three runs drifted onto an
upward-facing face and the app said "This spot faces up, so a tip here may not hold." — a real
failure of a real rule, caused by the view moving after the operator aimed.

With `inertia` and `panningInertia` at zero the tip lands at -22.739/-0.870/3.355 run after run,
identical to three decimal places. Zero is the only setting whose answer does not depend on the
frame rate.

Chasing that also turned up the orbit speed: drei turns `2π · dx / clientHeight` and Babylon divides
by `angularSensibility` (1000), so the same drag turned the view about seven times further in the
three.js view. `angularSensibilityX/Y` is set from the canvas height now and reset on resize.
**Panning and zoom are still by eye** — `panningSensibility` 100 against OrbitControls' distance-and-
fov derivation — and that is debt, recorded rather than left silent.

#### And then panning and zoom, which were still by eye

Left as debt in the entry above, and it was the wrong call: "largely the same layout" has to include
how the view MOVES, because turning, panning and zooming are the gestures an operator makes a
thousand times a day and the ones a different feel is noticed in first.

All three now live in `babylon/orbit.ts`, every number read out of `three-stdlib`'s own source:

```
turn   2 * PI * dx / clientHeight radians            a whole turn per screen height
pan    2 * distance * tan(fov / 2) / clientHeight    world units per pixel
zoom   one notch multiplies the distance by 0.95     whatever size the delta reports
```

Babylon expresses the first two as SENSIBILITIES — pixels per radian, pixels per world unit — so
they are reciprocals of three's, and the panning one depends on the distance, so it is recomputed
every frame from the camera's radius. The zoom is not expressible through Babylon's wheel input at
all: that input scales by the raw event delta, which a mouse, a trackpad and a tilting wheel all
report differently, where OrbitControls reads only the SIGN. So the input is removed and the wheel
handled by hand.

`attachOrbit` also turns ctrl-panning OFF. OrbitControls has no ctrl gesture, and in this app
ctrl+click toggles a support's selection — a ctrl drag that panned would slide the view under that
click. Every place that hands the orbit back (the surface brush, a rim drag, the gizmo, the brush's
stroke end) goes through that one function now, so the terms cannot be re-decided in five places.

**Measured in a browser, against the camera's own numbers:** a 200-pixel pan drag moved the target
22.225 mm where three's formula wants 22.225, and three wheel notches took the radius to 0.8574 of
itself where three wants 0.857375.

**A warning about measuring this from pixels, because it cost an hour.** The first attempt compared
"how much of the canvas is not the background colour" and its centroid, and reported the two views
panning by 109 px against 53 and zooming by 1.26x against 1.03x — a factor of two, confidently
wrong. The two GRIDS are not the same object: three's is drei's infinite shader grid with a distance
fade and Babylon's is a 1000 mm ground, so any yardstick built on canvas coverage moves differently
in the two under identical camera motion. Ask the camera, not the picture.

Still different, and written down rather than left silent: **middle-drag** dollies in OrbitControls
and does nothing in Babylon. Nothing in the app or the walk uses it.

#### Middle-drag, and the last line of the human list a machine could answer

**Middle-drag** dollies in OrbitControls and did nothing in Babylon. It does now, by the same 0.95
step as the wheel and once per MOVE EVENT rather than by distance — three's own quirk, kept because
matching it is the point. Both it and the wheel live in `attachDolly`. Measured in a browser: ten
upward move events took the radius to 0.5987 of itself against three's `0.95^10` = 0.5987.

**And the human-test list's third rim bullet** — "paint an area, leave the step, come back" — turns
out to be answerable by machine only as far as the question goes, not as far as the verdict does.
Driving Step 2 to 108 tips, pressing Back then Next, and waiting three seconds for the preview to
settle, in BOTH renderers:

| | on leaving | on return |
|---|---|---|
| tips shown | 108 | 2 |
| area stamps stored | 104 | 104 |
| detected region (contact faces) | 15,943 | 14,110 |

The PAINT survives, so the old bug named on that line is still fixed. What changes is the detected
REGION, and with it the tips. Two readings fit those numbers — the re-detection after Next
legitimately moved the area away from the paint (and the operator wants a notice), or the preview is
stale — and a person can tell them apart in one look at the model. **That look is not something a
machine can do for them**, so the numbers went into `docs/handoff/human-test-2026-11-11.md` beside
the bullet rather than into a walk check: a gate must not bless behaviour nobody has ruled on.

The other three bullets on that line ARE machine-answerable and now run on both renderers
(`u5c`..`u5k3`), which the same file records, so what is left for a person there is the feel rather
than the fact.

##### The 108-to-2 drop, settled

The entry above left two readings open. Driving the question directly — one aligner, one change at a
time, nothing else touched — settles it, and the answer is neither of them:

```
paint one stroke, Back, Next     tips 104 -> 104   stamps 31 -> 31   region 14,110 -> 14,110
nudge Area width, Back, Next     tips 104 ->   0   stamps 31 -> 31   region 14,946 -> 14,110
```

**The paint survives.** The bullet in the human-test list that asked about it can be ticked.

**A TUNING change does not.** The stamps and the tuning VALUE are both carried over --
`keptDentalWork` in `src/dental/flow.ts` does exactly that, and its comment describes this class of
bug (W-01) from an earlier audit -- but the AREA the tuning produced is not: the region reverts to
its untuned detection and the tip preview comes back ABSENT. The count reads 0 because
`dentalPreview` is undefined, so it is the preview that never returns rather than a proposal that
returned empty. The walk's run showed 2 instead of 0 only because that run had two manual tips.

The line is `src/components/useDentalFlow.ts:380`: the policy is built with the freshly DETECTED
`region` and the operator's KEPT `tuning`, and a placement on a policy whose strip geometry and
tuning disagree finds nowhere to put a tip. `previewStatus` reads `ready` and `tuningError` is false
throughout -- the preview ran and placed nothing.

**Fixed.** `keptDentalWork` brings the REGION back with the tuning, and the accept path takes it
when the orientation did not move -- the fresh detection when the tilt confirm turned the aligner,
because a turn really does invalidate the area it was detected for. No product call was needed in
the end: the codebase had already made it, twice, in that function's own comment ("once set, the
operator's own choices are kept") and in audit W-01. Keeping the number and discarding the area it
drew was not a second policy; it was half of the first one.

Same drive, after: tips 104 -> 104 and region 14,946 -> 14,946, where it had been 104 -> 0 and
14,946 -> 14,110. Both walks green: ALL PASS 186 and ALL PASS 186 [renderer: babylon].

---

<a id="2026-11-17-flow-map"></a>

## 2026-11-17 — mixoDental — the whole flow, end to end

*Was `docs/design/2026-11-17-flow-map.md`.*

**Revision 13, 2026-11-18.** The entry rebuilt, on four rulings the owner made in one sitting —
**one destination** (a drop is a case and the case screen takes it, at every count), **choosing first
only preselects**, **the category belongs to each FILE**, and the deck must be **neat, compact and as
simple as a game interface**. States the invariant first (§3.0) with a test matrix behind it, because
its absence — not a reviewer's miss — is why the fork survived four Fable passes and an EGM round
(§11), and §11 now also records why none of those reviews could have caught the rest: they all read
prose, and a 109px row lives in pixels.

**Revision 11.** Fixes five self-contradictions that revision 10's own corrections
introduced, and re-orders §12 so the export fix precedes the entry rebuild.

**Revision 10.** Corrected after an EGM review found three items claimed as done that
were not, five false statements about the code, and the entry defect's own class alive in §2/§3.

**Revision 9.** Rewritten from the user's side after revisions 1–8 were found to be
organised around the code's screens rather than around what a person does. That ordering is how the
entry defect survived eight revisions and four reviews — see §11.

---

### 1. What this app is for

Third-party **support generation** for dental resin printing. An STL arrives from someone else's
system; this app orients it, decides where supports may touch, builds them, lets a human fix them,
and writes an STL for a slicer.

Not a scanner. Not CAD. Not a slicer. **No build plate** — exports are per object and the slicer
packs the plate (owner's ruling; any plan that says "one plate STL" is reversing a decision already
taken).

### 2. Who arrives, and with what

| | arrives with | expertise | wants |
|---|---|---|---|
| chairside dentist | 1–4 files, usually one night guard or retainer | low | "make it printable" |
| | **⚠ and neither is an Aligner or a Denture — see open question 4** | | |
| lab technician | a case folder: 10–30 aligner stages, doubled for upper and lower | high | not to repeat himself 24 times |

**⚠ §2 names two objects §3 cannot serve.** A night guard and a retainer are neither an aligner nor
a denture, so the commonest user meets §3.2's required question with no true answer, picks Aligner,
and gets aligner rim-and-area detection on a splint. Killing the silent default turned a silent
wrong assumption into a consensual one. This is the entry defect's own class — a fact stated in §2
that §3 never uses — and it **blocks the entry rebuild**. Open question 4.

**Both arrive holding files.** Neither arrives wanting to answer a question. That single fact is
what §3 is built on, and what revisions 1–8 got wrong.

### 3. The journey

What the person does, what the app does back, and what they see. Screens are derived from this —
not the other way round.

#### 3.0 The invariant: ONE DESTINATION

**Every import lands on the case screen. Nothing branches on how many files arrived.**

This is the rule the whole §3 rests on, and it is written first because its absence is why the entry
defect survived four Fable passes and an EGM round (§11). There was no stated rule for a review to
fail against — only a description, and the description called the fork a feature.

Built and guarded, 2026-11-18: `src/components/startDrop.test.ts` asserts it as a matrix over every
screen, every already-chosen answer and counts 1/2/5/24, and walk checks `m1b`, `m2` and `m11` assert
it in the browser. A future shortcut for "just one file" fails before it reaches a screen.

#### 3.1 They drop files

**The entry is a drop target, drawn as one. The purpose keys beside it are a preselect, not a second
route.**

Dropping is what the user came to do; they have the files in hand. A question before anything is on
screen is a cold start — and until 2026-11-18 the app asked *"What are you making?"* as the screen's
heading, drew no drop target at all (the whole section was the target, announced by a 1px outline
that appears only once you are already dragging), and on the commonest path never used the answer:
one dropped file skipped the question entirely and assumed *Aligner* silently, so a dropped denture
went through the aligner flow and was told to draw a rim.

Both ways in now reach the same place (§3.0). **Owner's ruling, 2026-11-18:** *"if user choose what
type first, it only preselect the file(s) for their category and type on deck."* So answering first
buys exactly one thing — the case screen opens with the answer already filled in — and it is not a
different flow with a different destination.

**Open a saved project** sits at the edge of this screen, deliberately apart: it replaces the scene
rather than adding to it, so it is not an answer to a question about files.

#### 3.2 The app asks one question, with the models visible

**"What are you making?" — once for the case, and any single row can be re-answered.**

It is asked *after* the drop because that is when the user can answer it: the models are on screen
and countable. It is asked at all because detection takes the purpose as an argument — nothing can
run until it is answered, and before 2026-11-18 the app resolved that by guessing.

**PER FILE, and the screen is never gated on it** (owner's ruling, 2026-11-18: *"each file has a
category and type, but it ask me what i am making for all files, which is wrong"*). A category and a
type are attributes of a MODEL — an upper aligner, a lower aligner and a denture base arrive in one
drop — so one answer imposed on the whole drop is wrong for part of it, the same reason each row
already keeps its own detection RESULT. Every row carries its own control from the moment it appears.

**`Set all to` is the convenience, not the question.** A stage case is 10–30 models of one kind, so
naming each would be twenty-four presses to say one word. It is an ACTION on the rows, stated as one,
and it sits at the end of the header rather than in the middle of the screen. The footer counts what
is still unnamed; it never demands an answer before anything can be seen.

Changing a row re-runs that row's detection under its new answer; the rest of the case is untouched.

**Two levels, because the engine has two** (owner, 2026-11-18: *"the icons be shown as category
dropdown, then each types"*). **Category** is `DentalKind` — aligner or denture, separate pipelines
and separate tool chains, and the thing the operator answers. **Type** is a profile within that
category. Each family ships exactly one type today, so the type control renders **only when there is
more than one** — otherwise it would be a question with a single answer, which is why the old Type
screen was deleted (§2). It appears by itself when a second profile file lands.

**Two renderings, one list.** The entry screen draws the big picture keys, because the operator has
nothing in front of them and is choosing with pictures. The deck draws a dense category dropdown —
the house's icon-with-an-invisible-select, as the language key already uses — because three pieces of
pixel art above a twenty-four-row list push the work off the screen. Both read
`src/components/purposes.ts`; question 4 changes the answers, and that is the one file it changes.

Before an answer the deck's control is a plainly readable dropdown saying *Choose…*, not a picture:
the first build of it fell back to the generic cube, which is the *Any model* art, so an unanswered
case looked exactly like one answered *Any model* — the silent-default defect rebuilt inside its own
fix.

Nothing is offered before the answer — no rail, no primary, no Arrange, and no row control (a
`<select>` must show one of its options, so an unanswered row would display a default nobody chose,
which is the same defect in miniature).

#### 3.3 The robot works; they watch

One card per file. The robot runs, per card, unattended — **intent, not built: only the orient stage runs today, for
either purpose** (§12 step 1):

- **Aligner:** orient → rim → area → supports → check
- **Denture:** orient → supports → check

*(These are different chains. Today the deck runs the aligner's detection whatever the purpose —
`src/items/useBatchDetect.ts`. Not yet fixed; §12 step 1.)*

A card that comes back clean is **done**; nobody opened it. A card the robot could not decide
**needs you** and sorts to the top.

What a case of 24 — and a real one is 20–60, see Q5 must show, and now does: the rail and footer **pinned**, needs-you rows **first**,
and **one aggregate line** — "Checking 7 of 24", "3 need you" — rather than one *Checking…* and 23
*Waiting its turn…*.

#### 3.4 They handle only what needs them

Press a card and it opens at the tool that needs a person — **intent, not built: every card opens
at the start of its flow today; the only per-tool entry is Rim on a `no-rim` row.** Fix it, press Done, and the next card
that needs you comes up. On a case of 20–60 that might be two or three cards.

A card whose detection **failed** carries **Retry**. `no-rim` does not: it is the ordinary answer
for a trimmed arch, not a failure, and its line already says to draw one.

#### 3.5 They finish the case

**Arrange** so nothing overlaps, **Check** once, **Export** — one file per object.

⚠ Three corrections to this paragraph. **There is no case-level Check key** — only Arrange and
Export were built; Check is work, not a fact. **Arrange's purpose needs stating**: with per-object
export and the slicer packing, inter-object overlap is not a defect this app can have, so either
Arrange serves a capacity preview or it does not belong here. And **export is the primary user's
last five minutes and is not in §12 at all**: the loop is ~48 `<a download>` calls, which browsers
throttle, over a comment in `useExport.ts` that reads *"A BROWSER THAT BLOCKS QUIETLY DOES NOT
THROW, and the page cannot tell."* `showDirectoryPicker()` once per case, or one zip, fixes it with
no new subsystem.

Arrange and Export live on the case screen, because that is the only screen that knows about more
than one model. **Check does not exist there yet** — it is work, in §12. Until 2026-11-18 they lived only on the bench, which is not rendered while a start screen is
up, so a case could not be finished from the screen that held it.

---

### 4. The screens this journey needs

| screen | the moment in §3 it serves | what it is |
|---|---|---|
| **Entry** | 3.1, 3.2 | a drop target; the purpose question appears here once files land |
| **Case** | 3.3, 3.5 | one card per file, the four-tool rail, and the case's own keys |
| **Model** | 3.4 | one model, one tool at a time |
| **Bench** | — | the non-dental half: free editing, zones, transform, the five exports. Reached by *Any model* or a saved project, never by being dumped there |

**Entry and Case are TWO screens with one destination** (settled 2026-11-18, §3.0). They are not one
screen in two states: the entry is a drop target plus a preselect, and the case screen is where the
work is. Every drop reaches the second one regardless.

**Dead (2026-11-18):** the one-file fast path and its silent *Aligner*; `DropAction`'s `hold`, `many`
and `start`; the Drop page's held batch and its "n files ready" line; the `freshStart` plate-wipe;
`DentureChoice`. The file-chooser screen SURVIVES, with its job changed — it is what the purpose keys
lead to when you answer first, and it hands its files to the same case screen.

**Still to die:** the Next/Back wizard chain; *Add another aligner* and its file prompt;
`dental.finish` (already invisible under `FLOW_END`); `supports.dentalAuto`.

---

### 5. Every tool mode, and how you get out

**Back always means one level out.** At the first tool it means the case.

#### Aligner — four tools

| tool | states an operator can be IN | leaves by |
|---|---|---|
| **Orient** | auto · hand-chosen tilt dial · scan busy · confirm busy (both lock Next) · free transform `off/asking/on` · the type-mismatch **Switch or Keep** prompt · Restore | Done |
| **Rim** | drawing (one tool: the target decides — drag a point, click the line to insert, click the first to close) · a picked anchor · Close loop · Clear · Delete point · **Done refused, with the reason** | Done accepts · Cancel keeps the drawing |
| **Area** | Paint · Erase · Add · Select (itself **Click** or **Drag over**) · tuning busy, which holds Next | Done |
| **Supports** | Add · Select · building · **build failed** · the Back question · exporting · the check | Done |

#### Denture — two tools

**No Rim, no Area.** It also has its own worker, orient hook, supports panel (Fix / click-to-resolve
/ Details / folded Adjust / auto-check) and export pipeline. It is a second flow sharing a mode, not
the aligner with steps hidden.

#### At every step

The **Exit** confirmation. The control was *Exit*, then *Use as any model* (2026-11-17: the word
promised navigation while the press silently removed the model's supports, hand edits and dental
policy), and is *Exit* again by the owner's call of 2026-11-21 - honest now because the press asks
first whenever it would remove anything, and the question names what goes. Not the step card's x,
which goes to Your files and keeps the dental work.

#### Two exits that need work — one unnamed, one unreachable by Esc

- **Free transform's way out is unnamed, not missing.** (Corrected: the bar renders `dental.next`
  as well as *Auto orientation*, and Next is live even when detection failed, keeping the hand pose.
  Only *Auto orientation* is greyed there.) **Decided:** label that exit **"Keep this turn"** - a
  rename for clarity, not a new control, and §12 step 4 is priced accordingly.
- **The Supports Back question cannot be cancelled with Esc.** It is an inline block, not a
  `<dialog>`, so rung 0 does not see it.

---

### 6. The Esc ladder

Out exactly one level, never further:

| rung | where | what it does |
|---|---|---|
| 0 | a modal, or a text field | that takes it |
| 1 | a selection in Area or Supports | clears the selection |
| 2 | a non-Select tool there | back to Select |
| 3 | rim mode | leaves it, keeping the drawing |
| 4 | anything else in a step | **back one level** |
| — | a start screen | the screen's own handler, never the workspace's |

Rung 4 used to be the destructive leave-the-flow command, so the last Esc of a sequence destroyed
work — and on the case screen it did so with nothing on screen changing.

---

### 7. Refusals — every one needs a screen

| raised by | refusals |
|---|---|
| import | `unreadable`, `too-big` (×3 limits) |
| geometry | `holes`, `malformed` |
| detection | `no-rim` (an answer, not an error), `failed` |
| orientation notices | `mismatch`, `uncertain`, `holes`, `no-area`, `angle-none-held`, `angle-check-failed` |
| tilt | scan failed |
| area | contour detection failed |
| denture | `denture-failed`, tips could not be placed |
| supports | build failed |
| export | `stale`, `failed`, `inconclusive`, `replant`, `nothing-built`, and the **partial** export where some files are already written |
| project | open refused while a mode is live; `not-project`, `damaged`, `newer`; too large to save; a save that fails |

Under review-by-exception the orientation notices are exactly the "robot could not decide" cases, so
each must light a card. **Nothing dies silently, and a refusal names the next thing to do.**

---

### 8. Undo

- Each step sets a floor: "the scene the step began with".
- ~~Orient has no Undo at all.~~ **False, and corrected:** `history.undo` is `visible: always`, its
  key is bound unconditionally, the header draws both keys whenever the workspace is up, and every
  hand turn dispatches an ordinary scene command - so Undo is live in Orient immediately. The undo
  rule must not be decided from the old claim.
- The case screen draws no Undo keys.

**The floor stops meaning anything once tools are entered out of order**, which is the whole point of
making them tools. This needs a rule before the map is built on, not after. **Unresolved.**

---

### 9. The owner's rulings

These outrank anything inferred from the code.

1. **A done mark informs; it never gates, and never triggers.** It may say a job was done before. It
   must not stop the operator doing it again — the model whose print failed, whose file was replaced,
   or whose supports were wrong is exactly the one they need. And completing one model is never a
   reason to move, or invalidate, another.
2. **The app does not track what it spat out.** A reopened project showing every card unfinished is
   correct, not a defect.
3. **The app never claims a disk path.** (Corrected: the original wording said no web API offers one.
   This repo already calls `window.showSaveFilePicker()` in `useProjectFile.ts` and reads the chosen
   name back. The true content of the ruling is the refusal of a FALSE affordance - never a link,
   never a claim the file is still there - not that a destination cannot be asked for.) Export today
   is an `<a download>` on a blob URL: the browser picks the folder, may rename, may block silently. The most an honest version says is "handed to the browser as ⟨name⟩ at ⟨time⟩", session-only
   — never a link, never a claim the file is there. A real path needs a desktop shell.
4. **No build plate IN THE DENTAL EXPORT PATH.** Export is per object; the slicer packs it.
   (Scoped: the bench ships `export.whole-printable` - "Whole plate in one file" - and
   `PlateOutline`, `PlatePanel`, `plateLedger` and a `plate` capacity refusal all exist. The ruling
   is about the dental flow, not a claim that the app has no plate concept.)
5. **Tab-close: warn only, until auto-accept lands — then the case saves as it goes.** Auto-accept is
   what creates the long unattended run. Until then the warning must say plainly that unfinished work
   is not kept: a crash costs mostly machine time, but a hand-drawn rim and a painted area are the
   operator's own work and go too.

---

### 10. Decided, and still open

**Decided:** files first (§3.1); **one destination — every import lands on the case screen** (§3.0,
owner's ruling 2026-11-18); **two screens, not one in two states** — the entry is a drop target and a
preselect, the case screen is where the work is (answers Q1); **one purpose question per case with a
per-row override** (answers Q3b's frequency half); the case is home; clean detections auto-accept
with review by exception; per-object export; "Keep this turn" for free transform; the tab-close rule.

**Open — and each must be settled before the step that needs it:**

| # | open question | blocks |
|---|---|---|
| 2 | The **undo rule** once tools are entered out of order (§8) | tools-not-steps |
| 3 | Does the needs-you queue **re-sort under the operator** while they are in a card? (The rest is already answered: the batch only runs while the case screen is mounted, so the robot already stops.) | auto-accept |
| 3b | **The purpose question's CONTENT** — its frequency is now settled (once per case, overridable per row, §3.2) and its timing was already settled (after the drop). What is still open is what the answers ARE, which is question 4. Q5 also asks whether a case is one drop or two. | the answers in `purposes.ts` |
| 4 | **A night guard and a retainer are neither Aligner nor Denture.** §2 says this is the commonest user's commonest object. **It is not a design question — it is an engine work item**, and the UI is already waiting for it: `src/ui/iconCatalogue.ts` carries `retainer` and `night-guard` art, hand-drawn and marked `unwired`, with the note that `DentalKind` is `'aligner' \| 'denture'` in the VENDORED engine and the profiles behind each kind are generated from Rust JSON that is not in this repo. `docs/handoff/geocore-item-kinds.md` records what each needs. So the UI side is two rows in `src/components/purposes.ts`; the blocker is in mixo-geocore. | **mixo-geocore**, then one file here |
| 5 | **Upper and lower doubles the case**: 20–60 files, not 24. One drop or two? Do the pair stay linked? At 60 files the one-at-a-time detector (10-minute per-job timeout) is hours. | the display, the export and the detection budget |

---

### 11. Why this took twelve revisions, recorded so it does not repeat

Revisions 1–8 were organised around **the code's screens and modes**. Every review I commissioned
asked "does this map match the code", and the answer kept being yes — because the map was a faithful
description of a flow whose first screen asked a question the user could not yet answer.

The entry defect was even written down, in revision 1's §2, as a note about **wording**. It is not
wording; it is ordering. A reviewer answers the question it is asked, and I kept asking the wrong
one. §3 is written from the user's side first, and the screens are derived from it.

**Revision 12 adds the part that mattered more, because the owner found the real defect in one
sentence after all of that.** On 2026-11-18, having read §3 as rewritten, they wrote: *"so either
user tell what they want, or just drag drop files and it shows deck"* — and the fork collapsed. Two
things had kept it invisible, and neither was a reviewer's fault:

1. **I had written the fork up as a feature, everywhere.** The code comment, this map and walk check
   `m1b` all said, in nearly these words, *"one file still goes straight in on the default aligner
   type — that is the fast path, and the ordinary single-aligner case."* A reviewer audits against
   the rationale you hand them. That one path was the parent of four defects I had filed separately:
   the silent aligner guess, the two non-equivalent orders, the deck having no door on the commonest
   run, and the file step bypassing the deck. One root, four faces.
2. **No invariant was written down.** Nothing said *every import lands on the case screen*, so there
   was nothing for a review to fail against — only prose to agree with. The project's own rule (*a
   rule worth keeping gets a test that fails when it is broken*) had been applied to code and not to
   the flow.

So §3.0 now states the invariant first, and it has a test matrix and three walk checks behind it. The
lesson for the next review brief: **ask what the rule is, not whether the description is accurate.**
An accurate description of a bad flow passes every review you can commission.

**And the second lesson, which cost the rest of the day.** After the invariant was written down and
guarded, the owner looked at the screen and found four more things in four sentences: the purpose was
asked at the wrong granularity, the back key sat on top of the app's logo, the rows were 109px tall,
and the whole deck was capped at 560px wide. **Not one of those could have been found by any review I
ran, because every one of them read prose.** Fable read the map; EGM read the map and the code. A
layout defect lives in pixels. The browser was open all night and was used to confirm checks that had
already been written, instead of to look at the screen as a user. The next review of a SCREEN starts
with a screenshot of it at the size the operator uses, or it is not a review of a screen.

---

### 12. Order of work

1. **The per-purpose ORIENT stage** — the case runs the aligner's detection whatever the purpose, so
   a denture row is told to draw a rim its rail has no button for. Bounded deliberately: do not
   harden the Aligner/Denture axis, which Q4 may replace.
2. **The export that actually writes every file.** One `showDirectoryPicker()` per case, or one zip,
   replacing ~48 `<a download>` calls that browsers throttle and block quietly. It is the primary
   user's last five minutes, it waits on no open question, and every upstream feature exists to save
   attention that this step currently spends back.
3. ~~**The entry rebuild**~~ — **DONE 2026-11-18**, and it did not need Q4 after all. Questions 1
   and 3b turned out to be about the entry's SHAPE (one destination, one question per case), which
   the owner settled directly; only the question's ANSWERS depend on Q4, and those are one file
   (`src/components/purposes.ts`). What shipped: the drop target drawn, every drop a case, the
   question moved onto the case screen, the per-row override, and the single-file shortcut deleted
   along with the silent plate-wipe it carried.
4. **Free transform's "Keep this turn"** (a rename) and an Esc rung for the Supports Back question —
   small, decided, and an operator can be stuck today.
5. **The undo rule**, once open question 2 is settled. It comes BEFORE auto-accept: auto-accept is
   what mutates four tools' worth of state unwatched.
6. **Auto-accept**, shipping with the case saving as it goes (ruling 5), once question 3 is settled.

**Already done (2026-11-18, the entry and the deck):** one destination with a test matrix and walk
checks `m1b`, `m2`, `m11`, `m11b`; the drop target drawn on the page named `drop`, which never used
the word; the category moved onto each ROW (`items-purpose-<unitId>`) with `Set all to` as the
convenience and an unnamed count in the footer; the answers extracted to one file; `DropAction`'s
`hold`, `many` and `start` collapsed to one `case`; the `freshStart` plate-wipe deleted (it fired only
on the single-file path and warned nobody); `DentureChoice` deleted as a component nothing drew but
its own test.

**And the deck made compact** (*"neat, compact, and as simple as a game interface"*): the row was a
three-line grid measuring 109px — 2,600px of scrolling for a stage case — and is now ONE line of
about 28px. A sound mesh says nothing at all (the footer's tally already counts the ones that are
not); health became a warning mark and the orientation result a two-word chip (`detectChip`), each
carrying its full sentence under the pointer; the page is header / body / footer as classed divs,
because `<header>`/`<footer>` inherited the app's own window-chrome rules and put the tally and the
case keys on one crushed line; the Back key moved into that header, having been absolutely positioned
to the window and landing on the logo; the page's 560px cap became 1100px, since a worklist is a
table; and Remove went quiet until the pointer reaches it.

**Already done (2026-11-17/18), corrected after review:** the tool cursor in both renderers; the rim
badge's blocker line; `npm run art`; the case screen's **Arrange and Export keys** (not Check — that
is work), Retry on a failed row, needs-you-first, the aggregate line **and the per-row lines it
replaces**, pinned layout; *Exit* (then *Use as any model*) and its confirmation; the Esc ladder rungs 0–4 **and
the deck's focus, without which Esc there reached no handler at all**; done marks made advisory.

**Claimed done and NOT done** — the three an engineer would have skipped:
- *"safe re-entry at any tool"*: re-entry is now safe FROM any tool, but `startItem` still opens
  every card at the start of its flow. The only per-tool entry is Rim on a `no-rim` row. §3.4's
  "opens at the tool that needs a person" is therefore intent, not fact.
- §3.3's five-stage robot: **only orient runs unattended**, for either purpose. Rim, Area, Supports
  and Check have never run in a batch. So **step 1 is the orient stage only** - the rest of §3.3's
  chain IS auto-accept, which is step 3.
- The denture chain is not a chain: `DentureClient.orient` takes a sixth argument (tilt-scan
  settings from the unit's resolved support settings) that the aligner path has no equivalent for
  and that a card nobody opened has no source for; and it returns `DentureOrientation`, which the
  row state machine cannot consume - it reads `DentalOrientation`. **Today a denture row is told
  "No rim found. Draw one to continue." and flagged needs-you, for a job whose rail has no Rim
  button.** That sentence is the sharpest statement of step 1.

### Revision 14 — the type is a readout, not a question (2026-11-18)

Deleting the Type step was right and the reasoning behind it was half wrong, which took a second
owner review to see.

The reasoning was: each family ships exactly one profile, so a type control asks a question with a
single answer, and a question with one answer is a press that teaches the operator their input does
not matter. That is sound **about a question**. It is not sound about the same control used as a
**statement**: the type IS the profile the engine runs with — pillar diameter, contact size, tilt
rule, every number that decides whether the print survives the plate. Removing the control removed
the only place the operator could read which of those was in force.

So the deck showed the category and nothing else, and the owner named it exactly: *"deck fail to show
type, only show category, dangerous gap it is."*

**The rule that comes out of it, and it generalises past this screen:** before removing a control
because its list has one entry, ask which of the two jobs it was doing. A control does two — it
takes a choice, and it states the current value. Only the first is pointless over a one-item list.
Where the value matters to the outcome, the readout stays and gains a choice later, for free, the day
the list grows.

`PurposeSelect` therefore draws the type whenever a category is chosen. `Set all` passes no value and
so stays a category control; "Any model" carries no profile and so has no type.

---

<a id="2026-11-18-card-deck-plan"></a>

## 2026-11-18 — The card deck — what is built, and the plan for what is not

*Was `docs/design/2026-11-18-card-deck-plan.md`.*

Written 2026-11-18. The owner specified a card deck over several messages; this records the whole
ask, what shipped, and the reviewed plan for the rest, so the remaining work is a task list rather
than an archaeology project.

### The owner's ask, in full

1. The deck shows a **card per item**, not a row. *"That way your preview 3d model can go larger but
   show more compact cards on screen."*
2. The preview is a **live 3D render the operator can rotate**, large enough to look around — not an
   image.
3. A **loading percentage overlay** while a card's work runs.
4. The **category icon larger**.
5. The generic **G badge** is a **CSS class the owner designs**, not a drawing.
6. **Dimensions and file size** instead of the triangle count.
7. Clicking the name **opens the folder** the file came from.
8. The browser **remembers the deck** across sessions, *"unless the file is gone"*.
9. **Two buttons per card**: **Auto-gen** (generates everything, then redraws the preview from the
   generated model, with a loading bar) and **Edit** (into the step flow at Step 1).
10. A **safe cap** on how many models a deck may generate, with **models vs cap** and **memory used
    vs allowance** shown on the deck.

### Built

| Ask | What shipped |
|---|---|
| 1 | `.items-list` is a grid, `repeat(auto-fill, minmax(228px, 1fr))`. The markup is unchanged from the row it replaced, which is why the gate's 37 `.items-row` selectors and every `data-ui="items-row-<id>"` still resolve. The class name is debt, recorded in `styles.css`. |
| 2 | `CardShot.tsx` + `components/viewport/liveCardView.ts` + `items/orbit.ts`. One renderer (`deckRig.ts`) serves the whole deck; one card is live at a time and the page owns which. |
| 3 | The busy overlay exists on the card picture and takes a fraction. **Only the detection pass drives it today**, without a fraction — see below. |
| 4 | Square art, 28px on the case control, 32px in a framed row key. |
| 5 | `TYPE_BADGES` in `purposes.ts` carries `{ letter, style }`; the badge wears `.purpose-badge--<style>`. |
| 6 | `PrintUnit.file = { name, bytes, modified }`, captured at import, shown as `62 × 58 × 21 mm · 18.7 MB`. Triangles moved to the title. |
| 10 | `items/deckBudget.ts`, pure and tested. Cap derived from SIZE, with a practical ceiling of 200 so three test cubes cannot print "9,942,004 models". |
| 9 (half) | "Open this model" per card. |

### Not built, and why each is not a small job

#### Auto-gen (ask 9, and the percentage in ask 3)

**There is no headless chain today.** `useDentalFlow.ts` is UI-driven: orient → tilt scan → region →
confirm → place are sequenced through the step screens, each stage building its options from
`alignerSettings`, `keptDentalWork`, `defaultDentalTuning` and `presetCommands`. `useRegenerate`'s
`generateDental` is only the LAST step — it takes a `DentalTipPreview` that already exists.

**The risk that makes this more than plumbing:** a headless chain that drifts from the step flow
produces **different supports for the same model**. On a dental print that is not a cosmetic bug.
The guard is a parity test — run the chain on the reference aligner and assert its `DentalPolicy`
and contact ids equal what the step flow produces for the same fixture
(`scripts/test-support/referenceStep3.ts`) — and that test is the work, not an afterthought.

**The queue is already specified and measured.** `scripts/perf/deck-scale.ts` proved the worker keeps
one wasm session per unit and never frees it: **+19.7 MB per item**, flat at −0.09 MB/item once
`sessions.forget(id)` is called after each. Cost of forgetting: 6.2 s → 8.6 s per item. Sixty models
is ~8.6 minutes. `useBatchDetect.ts` is the queue pattern to copy.

Open questions recorded rather than guessed: whether `landPlacements` re-keys hand work; whether
dentures have a headless path at all (the plan disables Auto-gen on them, with the reason shown);
and whether `built` releases support meshes while the deck is up.

**Hand edits must not be flattened.** Contact ids are position-derived (`auto-X_Y_Z`) and removals
are stored by id, so a re-orient can orphan every hand removal. Auto-gen-all skips hand-edited cards
and says how many it skipped.

#### Remembering the deck (ask 8)

IndexedDB, database `mixodental-deck`: a `meshes` store keyed by unit id, a `units` store holding
the unit minus its source plus `{ file, handle?, engineVersion }`, and a `meta` row. Handles can
only live there, and typed arrays structured-clone without base64.

Four states a restored card can be in, each with its own words: **present**, **missing** (*"Original
file not found. This copy is kept on this device."*), **changed** (*"The file changed since it was
imported."*), **engine updated** (*"Supports were made by an older version."*). A card is never
removed silently — an unplugged drive looks exactly like a deleted file.

**One decision for the owner:** keeping this device's copy of a model whose original is gone leaves
patient data on the device after the original was deleted.

#### Clicking the name (ask 7)

A browser cannot reveal a path — no API exposes one, deliberately. The reviewed answer is
`showOpenFilePicker({ startIn: handle })`: the system picker, opened **in that file's folder**,
which is the only surface a browser allows that shows a real folder — and it doubles as the repair
for the *missing* and *changed* states above.

#### Export (not asked, found on the way)

`exportFiles` builds ALL supports and ALL file buffers and transfers them together: ~1.26 GB at 60
models. It must become one unit per task. The symptom is an export that dies at the very end of a
session, after all the work.

### The order to build the rest

1. The headless chain as a plain module, with the parity test. Nothing else is safe until this is.
2. Card progress model: stage weights × stage fraction, routed from the analysis client's
   `onProgress`. This is what makes the overlay a percentage rather than a bar.
3. The queue and the per-card Auto-gen button; `forget` after each item; opening a card pauses it.
4. The hand-edit guard, then Auto-gen all with its skipped tally.
5. The still redraws from the generated model (`Thumbnail.build` in the cache key).
6. The deck store, write side.
7. Restore on open, the file handles, the four states, the name click.
8. Export one unit per task.

---

### Owner's rulings on the auto-gen pipeline (2026-11-18, late)

Settled in conversation after the plan above was written. Where these disagree with anything earlier
on this page, these win.

#### 1. Re-orienting ALWAYS clears the supports

> *"Yes reorient always clear supports it is industry standard."*

**This is not what the app does today.** Re-orienting stamps a revision, marks the supports **stale**
(`supportsNeedReplanting`), and only the EXPORT refuses (`useExport.ts`, `refuse('replant', name)`).
So an operator can sit looking at supports that belong to a previous orientation and find out at the
very end. Under the ruling they are gone at the moment of the decision instead.

It must be **warned before and undoable after** — the regenerate path already offers Undo.

**It also deletes a whole class of defect.** Automatic contact ids are position-derived
(`auto-X_Y_Z`) and manual removals are stored by id, so a re-orient could orphan hand work; the
re-key path was never proven on this route. If the supports go, their edits go with them,
deliberately and visibly. There is nothing left to silently re-key.

#### 2. Auto-gen must land the model in STEP 3'S OWN STATE

> *"the deck auto support pipeline allows and preserved the capability on what we did in step 3
> where there's supposed to be a support edit mode"*

**The acceptance criterion, in one sentence:** auto-gen leaves the model in exactly the state Step
3's accept leaves it in, so opening the card lands in Step 3 with Support Edit Mode live, and
nothing in the editor can tell whether a human or the queue got it there.

Support Edit Mode is real and gated on the stage (`src/dental/editing/dentalStep3.test.ts`):
`edit.add`, `edit.deleteSelection` over a tip selection, and the per-support shape overrides
(`contactSettings/set` takes a list of contact ids). Delete is also offered in Step 2; Step 1 has
none of it.

So the pipeline produces the accepted policy, the support plan and the revision stamps — never an
"auto" variant of any of them. Everything in Support Edit Mode then works with no new code, because
it already acts on exactly those fields. **The parity test is what proves it.**

**A consequence of ruling 1 that must be built with it:** an auto-generated card **opens at Step 3**,
not Step 1. Opening at Step 1 would walk the operator straight into the step that destroys the work
the queue just did. Reaching Step 1 becomes a deliberate act — *"Re-orient (this removes the
supports)"*.

#### 3. Auto-gen is an independent, modular pipeline — not code living in the deck

> *"differentiate auto gen function as an independent function wrapper that pipeline as a
> modularised function"*

Three jobs, three modules:

| Module | Job | Knows about |
|---|---|---|
| `autoGen/eligibility.ts` | **may** this card run, and if not why | a unit, its detect state, its health, its hand work. No engine, no React |
| `autoGen/pipeline.ts` | **how** one model goes from answered to supported: the stages in order, returning scene commands or a typed refusal | the engine client, injected. No React, no deck |
| `useAutoGen.ts` | **when**: the serial queue, `forget` after each item, pause on open | React and the deck. Knows nothing of how generation works |

**The parity test is only possible because of this.** A React hook cannot be run in `vite-node`
against the reference fixture; a plain function can, exactly as `scripts/perf/deck-scale.ts` already
drives `runSupportJob`. One pipeline then serves four callers: the per-card key, Auto-gen all, the
folder review, and any future batch tool.

**And the seam that actually prevents drift.** The risk is not which file the code sits in — it is
the pipeline RE-IMPLEMENTING what `useDentalFlow` does when it builds each stage's options (aligner
settings, kept dental work, tuning, preset commands). Two implementations of one decision diverge,
and that is how auto-gen ends up making different supports from the editor. So the stage builders
come OUT of the hook into a shared module that both call, which makes parity structural rather than
merely asserted.

#### 4. The key appears only on an ANSWERED card

> *"on deck, auto gen button happens only when user already set category and type"*

The same rule the Open key already follows: **absent** until answered, rather than greyed with a
complaint — a chain with no profile has nothing to run, and the card's own control is beside it.

Today choosing a category SETS the type (one profile per family, shown as a readout), so this is one
action; it becomes two the day a family ships a second profile, and the rule already covers it.

| Card state | Auto-gen key |
|---|---|
| no category | not drawn |
| answered, detection flagged it | drawn, refused, with the reason |
| answered, hand-edited | drawn, asks first |
| answered and strictly Ready | drawn and live |

#### 5. "Ready" is not currently a safety gate — tighten it first

`detectStateOf` (`src/items/detectState.ts`) is three lines and maps EVERY non-failed result to
`oriented` → **Ready**:

```ts
return { kind: 'oriented', turned: result.rotation !== undefined };
```

It never consults whether the rotation was actually found, whether the profile matched, whether the
central opening was ambiguous, whether the arch kind is unknown, or whether the two orientation
rules **disagreed** — all of which the step flow raises notices for and the deck drops.

So "auto-gen only on Ready" as first proposed would generate supports in the drop orientation, or for
the wrong arch type, on a card nobody opened. A strict state is needed — rotation present, profile
matched, cross-check not `disagrees` — and everything else gets a **"Check orientation"** chip.

#### 6. Ready must also mean the MESH is usable — but "watertight" is the wrong test

> *"maybe ready on cards also meant the mesh is safe and pass or need to run the fix holes model
> function?"*

Right instinct, and a hole in the first proposal: nothing in it consulted mesh health at all, so
auto-gen could have run on a non-manifold model and placed tips against phantom geometry.

**CORRECTION, 2026-11-18, after a code review of this very section.** Two claims below were wrong
and are struck through rather than deleted, because the reasoning that produced them is the thing to
avoid repeating:

- ~~"Repair already runs at import."~~ **It does not.** `src/deck/jobSummary.ts:37` states plainly
  that *"repair is cut from this release"*, and `verdictOfRepair` has no caller outside its own
  definition. So `repaired`, `repaired-open` and `unchanged` **cannot occur**. The reachable health
  states are `clean`, `holes`, `malformed`, plus the two import refusals.
- ~~"`meshOk` is the engine's own usability judgement, not a watertight test."~~ **It is exactly a
  watertight test.** `dentalOrient.ts` documents it as *"whether the mesh was usable (closed,
  non-degenerate)"*, and a test removing 40 triangles from the reference aligner asserts
  `meshOk === false`. Gating on it would refuse open-rimmed models — the very thing this ruling set
  out to avoid.

**The gate that actually fits the code:** orient returned `oriented` under strict Ready, AND health
is not `malformed`. An open-rimmed mesh either fails orient and already reads "Needs rim" (not
eligible), or orients with `meshOk: false`. That last case gets its own chip, **"Check mesh"** —
auto-gen refuses, Open stays, because Step 1 already warns "Detection may be unreliable" for it.

The original text follows, kept for the record:

**Repair already runs at import.** `rowState.ts` records what happened as one of:
`clean` (watertight) · `repaired` · `repaired-open` (repaired, loops remain, with the reasons the
filler left them) · `holes` (loops, with count and longest rim in mm) · `malformed`
(non-manifold edges, winding consistency) · `unchanged`. So there is nothing for a "fix holes"
button to do that has not been tried — re-running it with the same input gives the same answer.

**And a dental arch is LEGITIMATELY open.** A trimmed aligner is a shell with a rim; its boundary
loop is the feature the whole Step 1 rim stage exists to find. A naive "watertight only" gate would
refuse every trimmed aligner in the building, which is most of them. That is why `repaired-open`
carries its reasons rather than being an error.

**So the gate is the engine's own judgement, not a geometry purity test.** `detectStateOf` already
distinguishes `result.meshOk ? 'no-rim' : 'failed'` — `meshOk` is the engine saying whether it can
work with this mesh. The rule:

| Health | Auto-gen |
|---|---|
| `clean`, `repaired` | runs |
| `repaired-open` | runs — an open rim is an aligner's normal shape, and the reasons are recorded |
| `holes`, `malformed`, `unchanged` on an unusable mesh | **refuses**, naming what is wrong, from the sentence the card already carries |

The card keeps showing health and orientation as TWO marks, because they are two independent facts
(`src/items/README.md`) — a trimmed arch is a healthy mesh with no rim. What changes is that the
auto-gen GATE consults both, where the first proposal consulted only the orientation chip.

#### 7. An "enlarge" key: the card's model alone, full size

> *"when user inspect model preview maybe a button to enlarge 3d view in isolation for preview is
> possible?"*

Yes, and it is nearly free — which is a consequence of how the live preview was built rather than a
coincidence.

The deck already owns ONE renderer (`components/viewport/deckRig.ts`) and draws the focused card
through it, copying each frame into that card's own 2D canvas. Enlarging is the same pipeline
pointed at a bigger surface: an overlay with one large canvas, the same `openLiveCard` /
`turnLiveCard` / `closeLiveCard`, the same pure `orbit.ts` maths. **No second WebGL context, no
second model uploaded, no new camera code.**

What it adds, honestly:

- the overlay itself, and Escape / click-away to leave it;
- a size for the rig beyond a card's (`sizeRig` already resizes on demand and only when the size
  actually changed);
- the model's name on it, so an isolated view still says which model it is.

Why it is worth having: a 192px card tells you *which* model this is; it cannot tell you whether a
support will clash or whether an arch is seated the way you think. The step flow's full viewport can,
but reaching it means ENTERING the model — and under ruling 1 that is the route where a stray
re-orient destroys supports. An isolated look that changes nothing is the safe way to answer "is
this right?" before deciding to open it.

It should be a **look, not an editor**: turn and nothing else. The moment it grows selection or tip
editing it is a second implementation of Support Edit Mode, which is the drift ruling 3 exists to
prevent.

> **Ruling 4's table below is superseded.** It said a flagged card's key would be "drawn, refused,
> with the reason" and a hand-edited one "drawn, asks first". What shipped is simpler and safer: the
> key is **absent** in both cases, because a second run re-orients the model and destroys the
> supports and the hand edits with nothing asked. See R2 in
> [the 19th's plan](#2026-11-19-recipes-and-review-fixes).

### Build order, revised by every ruling above

1. **Extract the stage builders** out of `useDentalFlow.ts` into a shared module. Pure refactor, UI
   behaviour unchanged, suite green. Nothing else is safe until this is in.
2. **Re-orient clears supports**, warned before and undoable after.
3. **`autoGen/eligibility.ts`** with the strict Ready, the mesh gate, and the "Check orientation"
   chip.
4. **`autoGen/pipeline.ts`** and the parity test against the reference fixture.
5. **`useAutoGen.ts`**: the queue, the per-card key, Auto-gen all, opening at Step 3.
6. The **enlarge** overlay, which reuses the rig and the orbit maths.
7. A real **move** for a support tip - there is no `manual/move` today, only add and remove.

#### Carried into later increments (agreed with review, 2026-11-18)

- **D, the pipeline: two of the four landing checks are VERDICTS, not staleness.** Only `unit !==
  reviewed.unit` asks whether the scene moved. `points.length === 0` and `again.length > 0 ||
  landed.length === 0` are answers about the placement itself, and the pipeline must map each to its
  own typed refusal ("no tips", "landing refused"). Its test pins both, or a queue run with zero
  tips lands an empty plan and calls it done.
- **D: `dentalLabelCommands` must be given the PRE-LANDING unit**, the same one the caller used. It
  spreads that unit' whole settings object back and is dispatched after the landing, so a mismatch
  silently overwrites anything the landing changed. The parity walk check catches it if the two
  differ.
- **C, strict Ready: do not reuse the chip' `turned`.** `detectStateOf` derives it from `rotation
  !== undefined`, which is right for a chip and wrong for a gate - the orientation stage treats
  "turned" as a pose that was decided AND applied, and a unit removed between asking and answering
  has a pose with nowhere to put it.
- **Increment A is closed** with the label extraction; the build order is otherwise unchanged and B
  (re-orient clears supports) is next.

### What was built, 2026-11-18 night

Increments A to H of the build order above, in order, each with its own commit. What follows is the
record of what each one actually turned out to be - including the two places the plan was wrong.

#### A - the stage builders are out (`src/dental/stages.ts`)

Closed. Eleven decisions now live in one module that both `useDentalFlow` and the auto-gen pipeline
call: the aligner's Step 3 settings, the type presets, what the tilt scan is asked to try, what a
detected area becomes, the kept area, the accept batch, the manual-area batch, Step 1's orientation
outcome, the confirm order, the starting label, and the turn-with-re-layout pairing. Nothing in the
pipeline restates any of them, which is what "parity by construction" means in practice.

#### B - re-orient clears supports, and ONE EXCEPTION the plan did not know about

Ruling 1 said *re-orienting always clears supports*. Taken literally it would have **broken a proved
invariant**: `src/denture/steps/supports/rigidMove.ts` keeps a finished denture's build through a
slide and a **turn about the plate's vertical**, and `rigidMove.real.test.ts` proves that build is
bit-identical on a real scan to 1e-5 mm in every support position and exactly in the exported bytes.
A turn about the vertical does not change which way gravity pulls on the model; the supports go round
with it.

So the rule is: **the rotation changed AND the change is not a turn about the vertical.** It lives in
`src/state/rotation.ts` (`reorients`), the reducer applies it in `transform/set` - the one place every
door into a rotation goes through - and the hand edits keyed to those supports' positions go with
them, which deletes the silent re-keying defect class outright. The painted area stays: stamps are
marks on the MESH, and the mesh did not move.

Warned before it happens - **but not where this paragraph first said.** An ALIGNER's Back from Step
3 lands on Step 2, so nothing re-orients and the supports are not at stake; only a job with no area
step (a denture) reaches the orient stage, and there the build does go. The dialog says what this
Back actually costs, and walk `x12` asserts both halves: that it names the hand edits, and that it
does NOT claim a re-orient. See R1 in
[the 19th's plan](#2026-11-19-recipes-and-review-fixes).

#### C - Ready is a gate now (`src/items/detectState.ts`, `src/autoGen/eligibility.ts`)

Ruling 5 was right and understated. `detectStateOf` mapped every non-failed answer to `oriented`, so
five doubts were discarded - and the worst of them, **an absent rotation, was being reported as
"Already upright."** The engine returns no pose when it cannot decide; the one row that needed the
operator was the one saying everything was fine.

`OrientDoubt` now records all five (`mesh`, `pose`, `profile`, `up-down`, `opening`), the card shows
**Check mesh** or **Check orientation** - different chips, because they send the operator to
different places - and `autoGenEligibility` is their only reader for the queue. "Already upright" is
now reachable only for an identity pose, which is what the words mean.

#### D - the pipeline (`src/autoGen/pipeline.ts`)

Five engine calls in the flow's own order, no React, every decision from `stages.ts`. The turns all
happen before the supports, which under B is load-bearing rather than tidy.

`pipeline.real.test.ts` runs it under Node on `samples/case-001/aligner.stl` and asserts
the end state is Step 3's own - policy, placement, supports, label `X` - and that two runs agree to
the exact contact positions. **What it does not prove is parity with the editor**, and no node test
can: the editor's path is a hook driving screens.

#### H - the queue (`src/autoGen/useAutoGen.ts`) and the deck

One card at a time, because the analysis worker serves one job at a time - two pipelines would
interleave and finish no sooner while doubling the resident meshes. Per-card key (absent, not greyed,
per ruling 4), `Auto-gen N cards` on the case row with Stop in its place while it runs, and the run's
result on the card's foot.

Opening a built card goes to **Step 3** (ruling 2) through a new session event
`openDentalSupports`, carrying the print-angle check's notices so an auto-gen whose angle check held
nothing does not open a clean-looking screen. Walk `m12`/`m12b` drive the whole thing through the
front door on the real reference aligner.

#### E, F, G - the three that ran beside them

- **E** a per-job deadline. The analysis pool's ten minutes is right for a placement on a big model
  and wrong for a batch that drains one row at a time: one stalled orient held every row behind it
  for the full ten minutes. Two minutes for an orient, and the REASON is kept - a timeout says it
  timed out, where the batch used to `.catch(() => undefined)` and draw the same line as a job that
  failed on its first instruction.
- **F** the enlarge overlay (`src/items/CardEnlarge.tsx`). It is a `CardShot` in a bigger box: the
  deck's single renderer, the same orbit maths, the same drag and the same keyboard turn. A dozen
  lines of markup, which is what ruling 7's "nearly free" meant — plus the way into the editor the
  owner asked for on the 19th, which is the card's own Open handler so it cannot land anywhere the
  card would not.
- **G** the export builds and hands over **one file at a time** (`src/components/exportBatches.ts`).
  It was one call with the whole case in it - every unit's supports at full resolution and every STL
  buffer held at once, of the order of a gigabyte on a thirty-model case, at the very end of the work
  where a dead tab costs the most. Auto-gen is what made thirty-model cases ordinary.

#### Open, with reasons

- ~~**Editor-versus-auto-gen numeric parity in the walk.**~~ **CLOSED 2026-11-19.** Section `m`
  records what auto-gen built and section `x` compares it with its own hand walk of the same file -
  the sections run in order, so one value carries between them. Walk `x0p`: **by hand 94, auto-gen
  94.**
- **A folder for the export, through `showDirectoryPicker`.** It would also fix Chrome's refusal of
  several automatic downloads from one gesture, which an operator meets unbidden on a case of thirty.
  Not taken because the picker opens a NATIVE dialog no automation can answer and the walk drives
  that very button: a gate that hangs for ten minutes is worse than the fault being fixed.
- **The mesh worker's per-unit build session** (+19.7 MB/item measured) is still never freed during a
  case. `meshClient.forget(unitId)` is reachable - the earlier note that it was not was wrong - but
  calling it between queue items races the support build that the card's own picture needs. The
  deck's memory readout is the guard meanwhile, and it is on screen.
- **A real move for a support tip** (build-order item 7) is untouched: there is still no
  `manual/move`, only add and remove.
- **The new UI strings are English only.** Japanese and Taiwan Traditional Chinese are translated
  through Gemini by the owner's standing rule and never by hand; the free-tier daily quota was
  exhausted on the night this was built (the API answered `RESOURCE_EXHAUSTED`, retry in ~17 h), so
  `src/i18n.test.ts` and `detectState.test.ts` report the missing keys. The prompt is prepared at
  `docs/translation/2026-11-19-missing-strings.txt`; the list of keys is whatever those two tests print.

---

<a id="2026-11-19-recipes-and-review-fixes"></a>

## 2026-11-19 — Support recipes, and what the review found — plan, 2026-11-19

*Was `docs/design/2026-11-19-recipes-and-review-fixes.md`.*

Supersedes nothing: [the card deck plan](#2026-11-18-card-deck-plan) still holds, and its build
order items 1–6 shipped last night. This plan carries two things that arrived after it:

1. **the owner's new requirement** (2026-11-19) — an edit key on the enlarge overlay, and a system of
   named support settings that auto-gen uses, remembered on the device, switchable per card;
2. **Fable's review of the implementation**, which found eleven defects. Two of them say a premise
   of last night's increment B was wrong.

Both were taken to Fable. The design answers below are Fable's, with my amendments marked. The
findings are Fable's, triaged by me — **each one says whether I verified it and how**, because a
review is evidence, not a verdict.

---

### Part 1 — what the review found

Fable read the diff of `2c75c3f..HEAD` and traced eleven paths. It ran nothing, so I checked each.

#### Must fix — these destroy work or lie to the operator

| # | What | Verified how | Severity |
|---|---|---|---|
| **R1** | **Back from Step 3 does NOT re-orient an aligner**, so the new dialog's sentence is false and the supports are deleted for nothing | **Confirmed by the repo's own test**: `dentureStages.test.ts` asserts `stageBeforeSupports('reference-aligner') === 'area'`, so `backDental` from `review` lands on **Step 2** | **highest** |
| **R2** | Auto-gen on a card that already has supports **silently destroys hand edits** — the run's first turn is a re-orient, and nothing asks | Seen live last night: pressing Auto-gen all on a built card left `0 automatic, 0 manual, 0 removed` | high |
| **R3** | The pipeline **overwrites a hand-drawn rim** that the editor protects (`keepsManualArea`) | By inspection: `useDentalFlow.next` checks it, `pipeline.ts` has no such branch | high |
| **R4** | An export that throws after the first file says **"nothing was saved"** | By inspection: `saved` is declared inside the `try`, so the outer catch cannot see it | high |
| **R5** | A **vertical spin keeps the supports but the export then refuses them** — the status line says they are fine, `orient` is stamped anyway, and `supportsNeedReplanting` refuses | By inspection, and it is a contradiction I introduced: the old status line never claimed the supports were fine | high |

#### Should fix — wrong words, wrong step, or a race

| # | What | Verified how |
|---|---|---|
| **R6** | `live()` only asks whether the unit exists, so opening a card **while it generates** can land tips for a pose the operator changed | By inspection; needs the card's Open to be reachable mid-run, which it is |
| **R7** | **Stop then Auto-gen can run two pipelines at once** — `cancel` clears the running marker while the old drain is still awaiting | By inspection of the three lines; narrow but real |
| **R8** | A **gate refusal after a file was delivered** is reported as "refused by the browser" | By inspection: it reuses `exportPartialText`, whose words are about the browser |
| **R9** | **Back twice** from an auto-opened Step 3 strands the operator at a Step 1 with no proposal, which says "No aligner opening was found" | By inspection: `openDentalSupports` sets `dentalProposal: undefined`, and three readers need it |
| **R10** | A **rejected orient / scan / region job is reported as "supports failed"** — three awaits have no `.catch` where two others do | By inspection |
| **R11** | A batch that comes back with **no files is skipped silently** | By inspection; rare |

#### One I am not acting on

Fable notes that `dentalConfirmTilt` resolving `undefined` reads as `failed` in the pipeline and
`none-held` in the flow. **That is a real divergence and it is R10's fix, not a separate item** —
once the three awaits catch properly, the pipeline distinguishes "the job rejected" from "the job
answered, and no angle held", which is what the flow does.

---

### Part 2 — the recipe system (Fable's design)

#### The name, settled first

This repo has been burned by one word meaning two things (audit MIXO-14, where "Step 1" named two
screens). **"Profile" already means the aligner type** and **"preset" already means
LIGHT/MIDDLE/HEAVY**. So the third concept is a **recipe** — `SupportRecipe`, `recipeId`, in a new
`src/recipes/`. The word appears nowhere in the repo today, so a grep can keep it honest. The
built-in entry is **"Type default"**, which is what auto-gen uses now and cannot be deleted.

#### What a recipe pins, and what it must not

Not the whole settings object: `LiveSupportSettings` carries per-unit and UI state, and the worst
case is `labelText` — `dentalLabelCommands` keeps whatever label is in settings, so a pinned one
would be **stamped on every aligner in the case**. `eraseRadius`, `previewMode` and
`roofSeededModes` are the same kind of field.

Not "the keys the operator touched" either: nothing records which those are, and a diff against
today's defaults changes meaning the moment a default moves.

So: **complete values over an allowlist of build keys**, plus the Tree/Brace switches. Resolution is
type defaults first, recipe on top, through one parser that drops unknown keys and clamps — the
`parseShapeOverride` pattern already in the repo. An entry saved before a new engine setting existed
then fills that setting from the type. Where a recipe pins a value the type would have changed, **the
recipe wins, deliberately**: pillar, tip, lift, raft, Tree and Brace are exactly what a recipe is
for, and the card names which one ran.

#### The seam — and the flaw in my first proposal

I proposed threading an override through `alignerSettings(unit, profile, recipe?)`. Fable showed
that **alone it builds the wrong supports**: `presetCommands` independently writes
`dentalSupportSettings(profile, …)` at accept time, and the placement job reads `unit.settings`
afterwards — so the scan and the confirm would judge the recipe while the supports were built from
type defaults. Nobody would see it; the supports look plausible either way.

The seam is therefore:

- `alignerSettings(unit, profile, recipe?)` in `src/dental/stages.ts` stays the **only** resolver;
- **`presetCommands` emits its result** instead of calling `dentalSupportSettings` itself;
- `acceptCommands`, `acceptedPolicy` and `tiltScanSettings` thread the same argument;
- a passed recipe **beats the `own` branch**, or re-running a card with a different recipe keeps the
  old settings;
- **`useDentalFlow` passes the same per-card selection** — otherwise a card labelled "Thin" that is
  opened by hand gets type defaults, which is the editor and the queue diverging, the one thing
  `stages.ts` exists to prevent. `useRimDrawing.ts` calls `presetCommands` too and needs it.

#### Storage

One key, `mixodental.recipes`, following `src/plate/printerProfiles.ts` — the repo's existing
pattern: an injected `Pick<Storage>` and try/catch on every access. Shape
`{ version, defaultId, recipes: [{ id, name, settings, structure }] }`; the version and the stable
ids are what a migration needs. **Re-read before every write**, so a second tab's addition is not
clobbered. A parse failure leaves the raw string untouched, says *"saved recipes could not be read"*
and offers only Type default. Data from a newer version is read-only and never written back.

**Two things that must never happen**, both of which are this feature's silent deaths:

- a selected recipe that cannot be resolved falling back to defaults and generating supports the
  operator did not ask for — it is an `AutoGenStop` with a reason on the card;
- a failed read followed by a write, which destroys the operator's list.

#### Where it is created and edited

**Step 3's Adjust panel**, not a manager screen — the settings are already there and "remember
these" is the natural sentence. One row doing the whole job: a select (applying it to this unit),
**Save as new**, **Update**, **Delete**, **Use as default**. Editing is pick, adjust, Update. Type
default cannot be updated or deleted.

#### What the card shows

One truncated name chip beside the type control - the card's two answers together - full name in
`title`, its own `data-ui`. Before a
run it shows the selection or the default; **after a run it shows what the run actually used**, read
from the finished-run record — otherwise changing the default silently relabels finished cards.

*My amendment:* Fable also wants "Name, edited" when the unit's settings no longer equal the recipe.
That is right, and it is a new UI string, so it goes in the same batch as the rest — see "Still
blocked".

#### The defect most likely to go unnoticed for weeks

**The card naming one recipe while the supports were built from another.** Three readers (the scan,
the confirm, and the placement job reading `unit.settings`) plus the `own` branch on re-runs. The
guard is in `pipeline.real.test.ts`: run with a recipe whose pillar differs from the type's, assert
the settings handed to `dentalConfirmTilt` deep-equal `resolveSettings` of the finished unit and of
the resolved recipe, then re-run with a second recipe and assert they change. The walk's parity check
stays on Type default.

---

### Build order

Review fixes first: they destroy work today, and the recipe work lands on the same files.

1. **R1** — Back from Step 3 tells the truth. The supports-clearing half applies only where Back
   really reaches the orient step; the reducer rule stays the backstop. The walk check that asserted
   the false sentence is rewritten with it.
2. **R2, R3** — eligibility gains the two facts it was missing (`built`, `ownArea`), so the key is
   absent where a run would destroy work.
3. **R4, R8, R11** — the export reports what it actually did.
4. **R5** — a vertical spin stops stamping `orient`.
5. **R10, R7, R6, R9** — the stops say which step, the queue cannot double-drain, a running card
   cannot be opened under itself, and Back from an auto-opened Step 3 re-detects.
6. **The recipe system**, in Fable's order: the pure module and its storage, the `stages.ts` seam
   (with `presetCommands` fixed), the Step 3 row, the card chip, the queue and the editor both
   passing the selection, and the parity guard.
7. Then the items last night's plan already carried: the walk's numeric parity comparison, and a real
   `manual/move` for a support tip.

### Done already

The enlarge overlay's edit key (the owner's first sentence) — it is the card's own Open handler, so
where it lands is decided in one place, and it reads **Edit supports** on a built card. Verified on
screen.

### Still blocked

Every new string here is English only until Gemini's daily quota resets. Nothing is hand-translated.
`src/i18n.test.ts` and `src/items/detectState.test.ts` stay red until then and the full gate stops
at them; everything else is run separately and kept green.

---

### What happened, 2026-11-19 night

Everything in the build order above shipped, in order, each with its own commit. The part worth
recording is not the build - it is **how much three review rounds found, and what kind of thing it
was.**

| round | subject | found | the one that mattered most |
|---|---|---|---|
| 1 | the auto-gen implementation | **11** | Back from Step 3 does not re-orient an aligner, so the dialog was lying and supports were deleted for nothing |
| 2 | the recipe feature, against its own design | **10** | **Delete recipe never deleted** - the save merged the caller's list back over the stored one, so a deleted row looked exactly like another tab's addition. Proved by running it. |
| 3 | the fixes from round 2 | **7** | my fix had created **two resolvers again** - `presetCommands` wrote one answer while the print-angle scan asked another, so the angle could be judged for one set of numbers and the supports built from another |

**Twenty-eight defects, in code that had already passed tsc, 1700-odd unit tests and a 191-check
browser walk.** Not one of them was a type error or a crash. They were: a sentence that was false, a
control that recorded a choice and changed nothing, a key that could not appear, a merge that
defeated a deletion, a condition that was inverted, a default parameter evaluated outside its own
try, and twice over - **one decision implemented in two places.**

That last one is the pattern to carry forward. `src/dental/stages.ts` exists precisely to stop it,
and it was re-created one function along, three hours after being closed, by the fix for a different
defect. The guard that caught it was not a test; it was a reviewer asked to check an implementation
against its own design.

#### What the gate says now

```
npx tsc --noEmit    clean
npx vitest run src  1738 passed, 2 failed (both the i18n guards - strings are English-only)
npm run walk        ALL PASS (191 checks, 2136 s)
  x0p the step screens and auto-gen build the SAME supports | by hand 94, auto-gen 94
```

### Round 5 — the open question was a dead screen

The doc review left one question written at the change rather than answered: Step 3's door was
widened to accept any accepted dental policy, but `reviewStructure` still required `two-contour`, so
**could a painted-area card render Step 3 at all?** Asked properly, the answer was no, and it was
not a theoretical no.

**A painted or hand-drawn aligner does reach Step 3 with supports on the plate.** Done in
`rim/useRimDrawing.ts` stores `manualAreaPolicy(...)`; paint spreads the existing policy, so the
kind stays `legacy`; `analysisWorker` falls through to `runPlacementJob` for a legacy policy (which
`dental/paintedArea.test.ts` exists to pin); and `dental.generate` has no kind test at all. So the
supports land and the flow accepts the area.

**And Step 3 then drew its badge over an empty step.** `DentalBar` renders "Review the supports…
then press OK" and *then* `review ? … : null`. With `reviewStructure` undefined there were no tools,
no settings and no OK key — a step with nothing to do and no way on but Back.

The fix, in the order the decisions came:

| | |
|---|---|
| `reviewStructureOf(dental)` in `stages.ts` | The decision as a plain function: `undefined` means Step 3 has no panel, which is what the host builds the whole `DentalReview` around. Four unit tests. |
| `structureFixed` on `DentalReview` | A `legacy` policy has nowhere to store a structure, so `onDentalStructureChange` returns early and a live checkbox would be a dead control. The pair is shown **disabled with its reason** — the Step 3 twin of `dental-area-fixed`, which Step 2 already does for the strip sliders on a painted area. |
| `defaultDentalStructure`, not a guess | `makeDentalPolicy` hands Rust `(two-contour ? policy.structure : undefined) ?? defaultDentalStructure`, so Tree on and Brace on is what the build will really use. A readout that disagreed with the supports beside it would be worse than none. |
| walk `u8p` and `u8q` | The painted path carried to Step 3 for the first time in this file. `EXPECTED_CHECKS` 191 → 193. |

**Three comments asserted a gap that had already closed.** `flow.ts`, `autoGen/eligibility.ts` and
`editingMode.ts` all said a hand-DRAWN rim builds an ordinary `two-contour` policy that
`isManualArea` cannot tell from a detected one. It does not: `drawnRim` has one caller, Done stores
`{ kind: 'legacy', origin: 'manual-area' }`, and that is exactly what `isManualArea` tests. It was
true once, before a detected rim could be redrawn. **A debt paragraph is read as evidence and
outlives the bug it was waiting for** — so the drawn rim already reached `exitNeedsConfirm` and
already blocked auto-gen's `own-area`, while three files said it did not. Debt gets re-checked
against the code like any other claim.

Two English strings also turned out to be missing their apostrophes — "This model s settings", "this
recipe s settings". No UI string in `src/` contains an apostrophe, which is how they got mangled, so
both were reworded rather than escaped. Caught by rebuilding the translation prompt, and worth the
order: the committed prompt held 51 strings while the guard already wanted 58, so one Gemini request
— the daily allowance is 20 — would have come back and left the gate red anyway.

### Part 3 — item 7, a real move for a support tip (agreed with Fable, 2026-11-19)

The last unbuilt item of the card-deck plan. There is no `manual/move` today, only add and remove,
so "move this support" means delete it and add another — losing its own settings and costing two
undo steps.

**It goes in the THREE.js viewport first, and that is not a compromise.** `src/ui/renderer.ts` sets
`DEFAULT_RENDERER = 'three'`, commented "the renderer the walk proves", and `npm run walk` defaults
to three. A gesture written against the Babylon layers would be unreachable in the default app and
invisible to the gate — the two conditions under which a feature is indistinguishable from one that
was never written.

**And it is not built twice.** What is written once, renderer-free, is the part that decides
*meaning*; what is written per renderer is the part that decides *pixels*:

| Written once, in `src/supports/tipMove.ts` | Written per renderer |
|---|---|
| may this press begin a move (selected tip, contact, active object, Select + Click) | pointer listeners and the camera lock |
| what a release means: move, click, or cancel | the model-only raycast |
| the commands a move makes | drawing the held tip and the target ring |

This is the arrangement `pick.ts` already has with `editClicks.ts`, and the arrangement `rimTarget.ts`
has with `rimDraw.ts`. **The test of whether the seam held: if either renderer's adapter contains an
`if` about what the gesture MEANS — the tolerance, selected-only, off-model — the rule has leaked and
the seam failed.** Babylon follows as its own commit, checked by the same walk check with
`--renderer=babylon`.

#### The rules, and why each one is that way

- **Only a SELECTED tip can be dragged.** Step 3 looks at a forest of pillars and the whole body of
  a support maps to its contact, so without this every orbit that began on a pillar would move a
  tip. The cost is that a move is click-then-drag, and that an orbit cannot start on a selected
  support.
- **Arm on travel, not on press.** A press on a tip is already `toggle` in `pickAction`. The camera
  is detached on press, but it is only a move past `CLICK_TOLERANCE` (4 px) — the same line that
  already separates a click from an orbit everywhere else in this app.
- **Released off the model: CANCEL, and say so.** `rimDraw` commits its last valid point; a tip must
  not, because the last valid point on the way off a model is the silhouette edge — a grazing face
  and the worst place in the scene for a support. Esc cancels too. The target ring is hidden while
  the pointer is off the model, so the screen shows that nothing will happen.
- **One undo step**, by dispatching only on drop. Never per pointer move.
- **Nothing is re-run.** The move makes a new unit object, so `useSupportBuilds` rebuilds on identity
  and the verdict goes stale by the same identity. `scheduleRegenerate` must NOT be called: it
  re-places the automatic contacts, and `manual/add` does not call it either.

#### An automatic tip moves too, as a second commit

Most tips after Generate are automatic, and nothing on screen marks a manual one apart — a gesture
that did nothing on most of what the operator grabs would be a worse control than none. But an
automatic tip **cannot stay automatic**: automatic tips are the placement's output and are
re-derived on every regenerate, so a moved one has nowhere to live in `placement.points`. So it
moves as `deleteCommands(unit, [id])` plus `manual/add` in one batch — the shape `addTip` already
dispatches — carrying its `contactSettings` across, because `deletion/add` strips them.

Three consequences, all of them the kind that make a feature feel broken rather than look broken:

- **The selection must follow the new id.** The moved tip gets a fresh `manual-…` id; without
  re-selecting it, the selected-only rule demands a fresh click before every further nudge.
- **`clearManual` must be read first.** If it removes the moved tip without lifting the deletion,
  clearing hand-added supports leaves a HOLE where the automatic one used to be.
- **The guard's invariant is not "manual count unchanged".** It is: total tip count unchanged, the
  selected tip is at the new position, one Undo restores everything; and for the automatic case,
  manual +1 and deleted +1.

#### What building it actually cost, which was not the geometry

Three defects, none of which a unit test could have seen, and each found by a different instrument.

**The support stands in front of the model it grows from.** `hoverSupport` calls `stopPropagation`
for a contact hit, so with a pillar under the pointer the model never hears the move, the drop
target stays null and every drag cancels. Fable flagged this as the thing it could not verify from
reading; it was real. Three lines: mid-drag the model owns the move.

**The drop read its target from the effect's closure.** A pointer move followed closely by the
release fires `pointerup` before React has re-rendered and re-registered the listener, so the effect
still held `at: null` and cancelled a move that had a perfectly good target. The target lives in a
ref now; the state is only what the preview ring draws. Every quick flick would have hit this.

**The camera lock lasted until the first pointer move.** The release effect depended on `tipDrag`,
which the move handler replaces on every move — so the cleanup ran per move, and the cleanup is what
hands the orbit back. The effect body never takes it away again; only the press does. Found by
review, not by running, and **the walk cannot see it**: the tip still arrives where it was dropped,
so every count the guard checks is correct while the view turns under the drag. Written down at the
code as a trap rather than left to a test.

#### And the app's own preview pane cannot test a drag at all

This is worth more than the feature. Instrumented counters showed `hoverModel` and `hoverSupport`
called **zero** times across a complete drag in the desktop app's browser pane, while the press
armed correctly and window-level travel measured 193 px. Hand-dispatched `PointerEvent`s at the
canvas reach r3f not at all. So a pointer gesture in the 3D view is **invisible** to the pane and
provable only by Playwright, whose mouse moves are real — which is what the rim-anchor drag check
`u5d` has always depended on. The pane remains good for reading the DOM, panels and screenshots.

#### What the guard covers, and the one thing it does not

`a4m` and `a4n` in section `a`, plus unit tests on the reducer and on `moveCommands`.

`a4m` drags a selected automatic tip and asserts all three counts move together with the total
unchanged, and that the selection follows onto **the id the scene actually holds**. `a4n` asserts one
Undo restores it, because the move is one batch and two entries would leave an operator who pressed
Undo once with a hole in their supports.

**A third check was written and withdrawn after six runs.** It was to re-drag the now-manual tip, and
then to move a second tip as a position proof. Neither could be aimed: an already-manual tip's body
is about a millimetre wide among four hundred pillars, its tip sits at the contact under the model
surface (so a press at the drop point hits the model — in Tips only view too), and a hunt run
straight after a move finds nothing at all, because the support mesh is still rebuilding. **A flaky
check in a release gate is worse than a gap written down**, so it is written down, at the check and
here.

What holds those cases instead: `state/project.test.ts` pins the `manual/move` case (the tip keeps
its id and its `contactSettings`; an unknown id returns the same scene object) and `tipMove.test.ts`
pins `moveCommands`' manual branch — which is the part that could otherwise be deleted unnoticed.
What is untested is only the pointer path to that branch, which is the same press, ray and release
`a4m` exercises. The stored position's correspondence to the drop point rests on `moveCommands`
passing the target through unchanged and on `onMoveTip` converting with the same helper
`onAddContact` uses. Agreed with Fable rather than assumed.

One clause came out of that conversation and is worth more than the re-drag was: `a4m` and `a4p`
assert the selected id **equals the id the scene actually holds**, not merely that it looks manual.
A selection that followed a move onto an id the rebuilt mesh does not carry would satisfy every
count and quietly cost the operator a click before every further nudge.

#### The guard

One walk check in Step 3: drag a selected tip, assert the position changed, the total count and the
selection did not, and that a single Undo puts it back. The likeliest break is a release that counts
as both a move and a click, because two listeners hear the same pointerup — which a unit test of the
pure function cannot see, and which is the whole reason the walk check exists.

#### Both of these closed on 2026-11-19, and the open question answered itself

**The translations are in.** 61 strings, one Gemini request, nothing hand-written in zh-Hant. The
procedure is `docs/translation/README.md` and the insertion is `scripts/applyTranslations.py`, which
exists because the reply's only link to a key is a number in a separate file. The glossary guard
caught four terms the reply got wrong and a fifth was caught by reading the triples; both are written
up there, because the next batch will have the same two failure modes.

**Item 7 is built in BOTH renderers, which is the answer to the question this section posed.** The
worry was that writing the gesture for the Babylon layers would put it where neither the default app
nor the gate could reach it, while writing it twice would be the two-implementations defect this
whole document is about. Neither happened, because the gesture was split where the seam already was:
every rule is in `src/supports/tipMove.ts` (may this press begin a move, what did the release mean,
what commands does it make), every ending is in `src/components/viewport/dragSession.ts` (the orbit,
pointerup, pointercancel, blur, Escape), and each view holds only what that renderer knows - how to
pick a support and how to cast a ray at a model. three.js first, because it is the default and the
walk proves it; the Babylon adapter the same day, and `a4m` and `a4n` pass against
`--renderer=babylon` as well.

**And the split was worth more than the gesture.** Pulling the endings out turned up two live defects
in the RIM anchor drag - the orbit handed back on its first pointer move, and a quick flick
committing the anchor one move behind - and the review of the finished code turned up two more in the
shared rules: the renderers disagreed about which press may begin a move (r3f delivers one pointerdown
to everything underneath, so a press on the model armed a move on a tip behind it, where Babylon
orbited), and `moveRelease` tested `cancelled` before travel, so Escape on a press that never moved
told the operator a support had been left where it was. Not one of the four changes a count, which is
why the walk was blind to all of them; `u5r` and `u5s` now make the Escape half of it visible.

#### Still open

- **The Babylon tip drag has no preview.** three.js shows a ring where the tip would land; Babylon
  shows nothing until the release. `editPreview` is not the answer: its preview rides a CANVAS
  pointermove, so it would freeze the moment the drag left the canvas, and a frozen ring is worse than
  none. Named in `src/components/viewport/README.md`.
- **Both brush strokes are still outside `dragSession`**, deliberately: every brush ending COMMITS
  its stroke, so Escape through the shared module would commit a stroke the operator asked to
  abandon. They join when `createStroke` can discard one, which is a change in `@mixo-geocore`.
- The four debts in `src/recipes/README.md`, with their reasons.

---

<a id="ui-structure"></a>

## mixoDental UI structure

*Was `docs/design/ui-structure.md`.*

> **Read this first (2026-11-04).** This is the record of the 2026-10-22 design round, kept for the
> reasoning behind the screens, the mode state machine, the command registry and the copy rules — all of
> which still hold. It is **not** the current description of how the app looks. The theme, the typography
> and the two widgets were all replaced in the week of 2026-11-03:
>
> | What this document says | What the app does now |
> |---|---|
> | Paper `#f4f2ed`, Mixo Red `#7f0019`, Zone Navy `#1d3461`, 2px radius | The **instrument** theme is the default: Pot Grey `#eef2f2`, Indigo `#17334e`, Dyed Teal `#2a8c99`, Signal Red `#c8372d` **for alerts only**, square (`--radius: 0`). The paper set is still underneath as the second theme. |
> | Zen Kaku Gothic New, PingFang TC | **Atkinson Hyperlegible Next** and **Noto Serif** are the only bundled faces; all CJK comes from the reader's own machine. |
> | `<details>`/`<summary>` groups, `.field-row`, `.check`, `.number`, `.edit-size`, `.tool-option` | One `Panel` and one `Field`. None of those classes exist any more. |
> | A print-angle **slider** with a band on its track | A print-angle **dial** (`TiltDial`), an ARIA slider with a lit tick band. |
> | "Hide models" in the view controls | Removed in `f716eb4` (PD.11 S1). |
>
> Current and maintained: **`DESIGN.md`** (the design system), **`docs/ui-styling.md`** (every token, every
> `data-ui` name), **`docs/designer-guide.md`** (how to change something safely). Section 7 below is kept
> as written and is superseded by `DESIGN.md` section 2.

Date: 2026-10-22. Status: implemented at `05d42c4` (see the status section below). Written as a design,
with the owner decisions of 2026-10-22 encoded; revised after a four-model
review and a behaviour audit (sections 12 and 13). Code baseline for every
"today" statement in sections 2 to 11: commit `acd3f98` (branch `refactor/app-shell`, which contains
`refactor/selection-pipeline`); file:line references are in the appendix, refreshed for `05d42c4`. Behaviour details that
this document does not change (key table, pick table, strokes, colours of 3D marks, camera numbers)
stay in `docs/superpowers/specs/2026-10-21-support-editing-ui-spec.md` (the behaviour spec).
Terms: `docs/migration/glossary.md`. House style: skill `mixo-app-style` (`tokens.css`, `base.css`).

Contents

1. Purpose, audience, principles
2. Screen anatomy and wireframes (1366 × 768)
3. Left panel brush-up
4. Mode state machine
5. Command registry
6. Copy (en / zh-Hant / ja) and naming rules
7. Visual rules
8. Accessibility and keyboard
9. What changes vs today, and the Babylon port
10. Stitch
11. Prerequisite bugs, then the feature: context-sensitive right panel and per-support settings
12. Owner-confirmable rules and open questions
13. UI behaviour audit
14. Project files (Save and Open)
- Appendix A: verified against the code (file:line)

Markers used below: **[today]** = shipped at `acd3f98`; **[change]** = this document changes it;
**[new]** = new control or string; **[feature]** = section 11, built after the layout work;
**[confirm]** = rule the owner should confirm (listed again in section 12).

---

### Status at 05d42c4: implemented

Everything in sections 1 to 11 is built, with the deviations listed after the table. Sections 2 to 11
keep their design wording, and their "today" statements describe `acd3f98`. Sections 12 and 13 and
Appendix A carry the shipped state. Commit detail is in `git log --oneline 57f5eb0..HEAD`.

| Section | Shipped in |
|---|---|
| 11.0 a and b: exact right-click removal, unit-local ids, old removals kept through migration | `23627b4`, `002fc0d`, `069b320`, `ab99ed5` |
| Step 1 (2.x, 4, 5, 8): command registry (`src/editing/commands.ts`), Tab freed, Esc rules, one `mode.exit`, header Generate removed, file drop refused in modes, Modes group | `e01941f`, `a55d4ec`, `83b85e4`, `83ccbe1`, `434b239` |
| Step 1 (4.5, 7.2): per-section inert locks that fold to headings, lock-note click catcher | `83ccbe1`, `f3ebfe9`, `54be8c9` |
| Step 1 (2.6, 5.7): zones focus mode (red frame, "n supports hidden by zones"), Clear all zones with an Undo toast | `f7dc6d1`, `2b494b7`, `1ddc5de` |
| Step 1 (Q2): Check live in Edit, Fix in place, re-check wording, stale Check label, Generate in the edit bar | `e51fc50`, `258520b`, `d4549f7`, `dae2674`, `fb6bf27` |
| Step 1 (Q4): right panel split into Object and Support shape, placement waits for Generate in Edit, regeneration report | `fae0a4b`, `33dbd0a`, `ea0e4f9`, `fea3145`, `dae2674` |
| Step 1 (Q6): Add / Remove switch, Click reach, Drag over starts on a model or support and orbits elsewhere | `b8c8f34`, `807c7f7`, `02e6aa8` |
| Step 2: Select / Unselect switch, Shift read from the pointer event and latched at stroke start | `785c5a8`, `ae4570d`, `6ebcad7`, `d3cbc72`, `4c82c6f` |
| Step 3 (section 11): per-support settings (`contactSettings`, `SHAPE_KEYS`), count band, Select them, Reset, ring mark, coalesced undo, regeneration keeps or resets | `8fc7742`, `7ca03e1`, `2305c39`, `ff3b726`, `66c74a4`, `7dbaaf1`, `2e0cbe5`, `f1de455`, `7d2b612`, `4297fc7`, `49114f9`, `8cb45b4`, `cb48f21`, `7f4fe9b`, `808c6a2`, `1b1b46e` |
| Audit polish (section 13): toasts, export and cancel text, add flash, step-naming Undo and Redo hints, `disabledReason` on every disabled command, Delete always shown | `fd7e66c`, `1748ef5`, `e9ccce2`, `b44da0d`, `54be8c9`, `44315ae`, `f8d25fd`, `02630b7` |
| CIA-06 "Supports are still building", CIA-07 idle zone overlay (since refined in 12 ms idle slices: Open project's longest long task on the knot 328 ms to under 65 ms, output unchanged), Hide / Show models with Drag over, zh-Hant wording lint | `9b60d3e`, `6f7b554`, `9c4a670`, `a1e0f53`, `3cde47b` |
| Project files: Save project and Open project (section 14) | `05d42c4` |
| `npm run walk`: an AI-free browser walk, 24 checks with fixed baselines | `3c04a2a`, `4fd7537` |

#### Deviations from the spec

Each item was checked against the code at `05d42c4`.

- **Object region.** It is live while supports are selected (Q4, C9), as specified. The order changed.
  With supports selected, Support shape comes before Object so it is on screen (`cb48f21`,
  `SettingsPanel.tsx:219`). With none selected, Object comes first.
- **Select them.** The mode edits one object, so it selects the active object's customised
  supports. When the active object has none, it makes the first selected object (in list order)
  that has some active, enters Support Edit Mode there and selects them, and the status line says
  "{n} customised supports selected on {object}. {m} more on other objects." while others remain.
  When the active object has some and others also do, the hint gives their count (`commands.ts:261-275`,
  `App.tsx` `selectCustomised`). The walk checks the switch (k).
- **Shift hint.** While Shift is held the hint reads "Release Shift to select" or "Release Shift to
  unselect". At rest it reads "Hold Shift to unselect" or "Hold Shift to select" (`EditBar.tsx:66`).
  The copy table in 6.2 lists only the resting wording.
- **Fix.** It frames the spot and says "Click the framed spot to add a support." It draws no ghost
  marker. After the add, the re-check says "Spot covered." or "Still unsupported here."
  (`useFixSpot.ts:54,67,79`; `check.ts:89`).
- **Placement in Edit.** A placement change made in Support Edit Mode is deferred, not regenerated.
  The right panel says "Placement changed. Regenerate to apply." until Generate runs
  (`SettingsPanel.tsx:264`). Outside a mode the change still schedules a regeneration, announced as
  "Placement changed: regenerating {name}." (`regenerate.ts:46`).
- **Undo floor hint.** At the mode floor the Undo reason reads "Nothing to undo here: leave the mode
  to undo earlier steps." (`commands.ts:127`), not the audit's wording.
- **Tips only and Drag over.** Q7 assumed no interaction. Tips only does change what Drag over can
  pick (12.2, Q7).
- **Open audit rows.** The Click reach ring and Add with models hidden are not done (section 13).
- **Not in the design.** Save project and Open project were added after the document was written
  (section 14).

---

### 1. Purpose, audience, principles

**Purpose.** One reference for what is on screen, where, when, and why, for three readers: the
React implementer of the layout brush-up, the Babylon.js porter (mixomesh), and Stitch (UI mockups,
section 10). It defines the structure; the behaviour spec defines the gestures.

**Audience of the app.** Lay resin printers: they know "supports", "raft", "overhang" from their
resin slicer, not 3D-editor jargon. They print one or a few models, want automatic
supports, then fix a few spots by hand. They must never be unsure which mode they are in or how to
get out.

**Principles.**

| # | Principle | What it means here |
|---|---|---|
| P1 | One primary per view | Exactly one red-filled button visible at a time: the left-panel Generate outside a mode, the viewport Done inside a mode. Check findings' Fix stops being red **[change]**. |
| P2 | Progressive disclosure | Mode → Tool → Tool options → Actions. Each level is shown only while its parent is active (Click reach only under Add; Click / Drag over only under Select; Select / Unselect switch and Circle size only under Drag over; selection actions only with a selection). |
| P3 | No repeated controls | Every control exists once in the registry and is rendered in one place. Removed duplicates: header Generate **[change, confirm]**, viewport "Edit supports" button **[change]**, left-panel "Clear" zones button **[change]**, "Edit no-support zones →" **[change]**. One accepted exception: Click reach (section 3.3). |
| P4 | Layperson words | Printing words, one term per concept (glossary), the badge says in words what a click does. Paint / Erase / Brush only for zones; Select / Drag over / Circle size only for picking supports. |
| P5 | Modes are siblings and isolated | Support Edit Mode and No-support zones never nest: exit one before entering the other. A mode belongs to the active object. |
| P6 | Always a visible way out | Each mode has two visible exits (left-panel Exit button, viewport Done) plus Esc. Both buttons run the one command `mode.exit`, so they never disagree (4.4). No exit needs a key. |
| P7 | No required key + drag | Every drag works without a key held. Keys (Shift, Ctrl, Delete, Esc, G, R) are optional accelerators with a visible equivalent. |
| P8 | mixo-app-style tokens | Paper / surface / sunken, hairlines, 2 px radius, no shadows, ink fill for pressed, red for the one primary, `.danger` outline for destructive. Values are copied from `tokens.css`, never re-derived. |

---

### 2. Screen anatomy and wireframes

#### 2.1 Regions (desktop, 1366 × 768)

| Region | Size today | Content | Live in |
|---|---|---|---|
| Header | 56 px tall (`styles.css` header) | Wordmark + "Resin Support Studio"; language EN / 中文 / 日本語; Undo, Redo; Hide models / Show models; Wireframe as an icon toggle (pressed while wireframe; owner 2026-11-21), no longer a word that flips to Solid. In a dental step the "Your files" key is the step card's close instead. Header Generate removed **[change, confirm]**. | all states |
| Left panel | 268 px wide | Setup: Import, Objects, Transform, Supports, Modes, Check (section 3). | setup; in a mode only its Exit button |
| Viewport | 798 × 680 px | Canvas; object name (setup) or mode badge (mode); mode bar (mode); view toggles Tips only / Fit view / Bottom view; Circle size preview; job activity list; Undo toast; drop overlay; unit note. | all states |
| Right panel | 300 px wide | Support settings (inventory, unchanged layout) and Export STL. Context header **[feature]**. | setup, Support Edit Mode; locked in zones |
| Footer | 32 px tall | Object count, active object's triangles, contact counts (automatic / manual / removed), status line (live region). | all states |

Viewport overlay positions (today, kept): object name or badge top-left (16 px, 14 px); mode bar
top-right under the badge row (top 56 px, right 14 px); view toggles top-right outside a mode and
bottom-right inside a mode (`.viewport--editing .viewport-view`); job activity bottom-left; Undo toast
bottom centre; unit note bottom-right outside a mode. With the viewport "Edit supports" button removed
**[change]**, the view toggles move up to the top-right corner (top 12 px) outside a mode.

Below 1100 px (today, kept): viewport on top, panels below, the mode bar docks at the viewport
bottom, toast moves to the top. Focus-mode dimming applies to the panels wherever they sit.

#### 2.2 Wireframe legend

`[ Label ]` secondary button · `[* Label *]` primary (red fill) · `[! Label !]` destructive
(`.danger` outline) · `[= Label =]` pressed / chosen (ink fill, paper text) · `[a|=b=|c]` segmented
group, `b` chosen · `░` dimmed and locked (`inert`) · `#` red 1 px mode frame (both modes) ·
 `|A|` the active object's letter badge (red) · `v` / `>` open / closed group. Panel content is
abbreviated where 11.5 px text would not fit 22 ASCII columns; exact strings are in section 6.
English shown; zh-Hant and ja are longer and must fit the same rows (see 7.6).

#### 2.3 The bench — no mode ("setup" in this document)

Named **the bench** since `src/bench/benchScene.ts`; `mode: 'off'` in code. This document
calls it "setup" throughout, which is where you first meet it — but it is also where Exit, Done
and **OK at the end of dental Step 3** all land, so it is a resting state, not a first screen.
See `src/bench/README.md`.

```text
+--------------------------------------------------------------------------------------------------------------------+
| mixoDental  Resin Support Studio      [EN|ZH|JA]  [Undo][Redo] | [Hide models][Wireframe]                       |
+----------------------+-------------------------------------------------------------------+-------------------------+
| IMPORT MODELS        | bust.stl                        [Tips only][Fit view][Bottom view]| SUPPORT SETTINGS  bust  |
| [ Import models    ] |                                                                   | Preset [Lt|=Md=|Hv|Cu]  |
|  STL, GLB or glTF.   |                                                                   | Lift height    5.0 mm   |
| OBJECTS           3  |                                                                   | Roof/cage [=Off=|Rf|Cg] |
| |A| bust.stl    412  |                                                                   | v Auto placement        |
|  B  base.stl     88  |                         .----------.                              |   Support spacing  3.0  |
|  C  ring.stl      -  |                        (   model    )                             |   Overhang angle   50   |
| [Select all][Delete] |                         '--||-||--'                               |   [x] Downward faces    |
| TRANSFORM            |                            || ||   supports                       |   [x] Islands           |
| [Select|=Move=|Rot.] |                     ======================  build plate           | v Contact tip           |
| SUPPORTS FOR ALL 3   |                                                                   |   Shape [=None=|Sphere] |
| [*Regenerate      *] |                                                                   |   Point dia.  0.40 mm   |
| [Clear manual edits] |                                                                   | > Pillar                |
| [! Remove supports!] |                                                                   | > Foot                  |
| MODES                |                                                                   | > Bracing               |
| [ Edit supports    ] |                                                                   | > Raft                  |
| [ No-support zones ] |                                                                   | > Letter label          |
| CHECK SUPPORTS       |                                                                   | > Advanced              |
| [Check for unsupp. ] | +-----------------------------+                                   | EXPORT STL              |
|  o Island  A    [Fix]| | Placing contacts... 42% [x] |   (job activity, only while busy) | [Active obj + model ]   |
|  o Overhang A   [Fix]| +-----------------------------+                                   | [Active, supports   ]   |
|                      |            [ Manual edits cleared. . Undo ]   (toast, 6 s)        | [Each obj + model   ]   |
|                      |                                  Millimetres. Build plate at zero.| [Each, supports     ]   |
|                      |                                                                   | [Whole plate, 1 file]   |
+----------------------+-------------------------------------------------------------------+-------------------------+
| 3 objects   412,330 triangles   396 automatic, 16 manual, 2 removed          (status) Support added.               |
+--------------------------------------------------------------------------------------------------------------------+
```

Notes: one primary (left Generate, blue when it reads Regenerate). The view toggles take the
top-right corner. Job list and toast appear only while there is something to show.

#### 2.4 Support Edit Mode, Add tool

```text
+--------------------------------------------------------------------------------------------------------------------+
| mixoDental  Resin Support Studio      [EN|ZH|JA]  [Undo][Redo] | [Hide models][Wireframe]                       |
+----------------------+-------------------------------------------------------------------+-------------------------+
| Finish editing       |#=================================================================#| SUPPORT SETTINGS  bust  |
| supports first: press|#[SUPPORT EDIT MODE  bust.stl  Click the model to add supports]   #| Preset [Lt|=Md=|Hv|Cu]  |
| Esc or Done.         |#                                                                 #| Lift height    5.0 mm   |
|                      |#                    +------------------------------------------+ #| Roof/cage [=Off=|Rf|Cg] |
|░IMPORT MODELS        |#                    | [=Add supports=][ Select supports ]      | #| v Auto placement        |
|░[ Import models    ] |#                    | Click reach   [ 1.5 ] mm                 | #|   Support spacing  3.0  |
|░ STL, GLB or glTF.   |#                    | Right-click / Ctrl+Click remove  Ctrl+Z  | #|   Overhang angle   50   |
|░OBJECTS           3  |#                    |                          [* Done  Esc *] | #|   [x] Downward faces    |
|░|A| bust.stl    412  |#                    +------------------------------------------+ #|   [x] Islands           |
|░ B  base.stl     88  |#                         .----------.                            #| v Contact tip           |
|░ C  ring.stl      -  |#                        (   model  + )  + = ghost tip at cursor  #|   Shape [=None=|Sphere] |
|░[Select all][Delete] |#                         '--||-||--'                             #|   Point dia.  0.40 mm   |
|░TRANSFORM            |#                     ======================                      #| > Pillar                |
|░[Select|=Move=|Rot.] |#                                                                 #| > Foot                  |
|░SUPPORTS FOR ALL 3   |#                                                                 #| > Bracing               |
|░[*Regenerate      *] |#                                                                 #| > Raft                  |
|░[Clear manual edits] |#                                                                 #| > Letter label          |
|░[! Remove supports!] |#                                                                 #| > Advanced              |
| MODES                |#                                                                 #| EXPORT STL              |
| [=Exit Support Edit=]|#                                                                 #| [Active obj + model ]   |
|   (live, ink fill)   |#                                                                 #| [Active, supports   ]   |
|░[ No-support zones ] |#                                                                 #| [Each obj + model   ]   |
|░CHECK SUPPORTS       |#                                                                 #| [Each, supports     ]   |
|░[Check for unsupp. ] |#                                                                 #| [Whole plate, 1 file]   |
|░ o Island  A    [Fix]|#                               [Tips only][Fit view][Bottom view]#|                         |
|░ o Overhang A   [Fix]|#=================================================================#|                         |
+----------------------+-------------------------------------------------------------------+-------------------------+
| 3 objects   412,330 triangles   396 automatic, 17 manual, 2 removed    Support Edit Mode: click the model to add...|
+--------------------------------------------------------------------------------------------------------------------+
```

Notes: the left panel is dimmed and locked except its Exit button (4.4); the lock note sits at the
panel top at full opacity. The right panel stays live (today's content shown; the context header of
section 11 comes later). The bar reads top to bottom: tool, tool option (Click reach), key hints,
Done. No selection actions exist under Add.

#### 2.5 Support Edit Mode, Select → Drag over, 37 supports selected

```text
+--------------------------------------------------------------------------------------------------------------------+
| mixoDental  Resin Support Studio      [EN|ZH|JA]  [Undo][Redo] | [Hide models][Wireframe]                       |
+----------------------+-------------------------------------------------------------------+-------------------------+
| Finish editing       |#=================================================================#| SUPPORT SETTINGS  bust  |
| supports first: press|#[SUPPORT EDIT MODE  bust.stl  Drag over supports to select]      #| Settings for 37         |
| Esc or Done.         |#                                                                 #| selected  [Reset to     |
|                      |#      +---------------------------------------------------------+#|            defaults]    |
|░IMPORT MODELS        |#      | [ Add supports ][=Select supports=]                     |#| Changes apply to the    |
|░[ Import models    ] |#      | How to select:  [ > Click ] [= Drag over =]             |#| selected supports only. |
|░ STL, GLB or glTF.   |#      |                 [=Select=|Unselect]  Circle size  24 px |#|░Preset [Lt|Md|Hv|Cu]    |
|░OBJECTS           3  |#      |                 Hold Shift to unselect  [-----o-------] |#|░Lift height    5.0 mm   |
|░|A| bust.stl    412  |#      | Right-click remove   Ctrl+Z undo                        |#|░Roof/cage [Off|Rf|Cg]   |
|░ B  base.stl     88  |#      | 37 selected [Clear selection] [! Delete !] [*Done Esc*] |#|░> Auto placement        |
|░ C  ring.stl      -  |#      +---------------------------------------------------------+#|░> Tree supports         |
|░[Select all][Delete] |#                         .----------.                            #| v Contact tip           |
|░TRANSFORM            |#                        (   model    )      ( O ) = circle,      #|   Shape [None|Sphere]   |
|░[Select|=Move=|Rot.] |#                         '--##-##--'        red: Select          #|   Point dia.   --  mm   |
|░SUPPORTS FOR ALL 3   |#                     ======================  grey + "-": Unselect#|   Penetration 0.30 mm   |
|░[*Regenerate      *] |#                                                                 #| v Pillar                |
|░[Clear manual edits] |#                                                                 #|   Middle dia. 1.20 mm   |
|░[! Remove supports!] |#                                                                 #| v Foot                  |
| MODES                |#                                                                 #|   Bottom dia. 3.00 mm   |
| [=Exit Support Edit=]|#                                                                 #|░> Bracing               |
|   (live, ink fill)   |#                                                                 #|░> Raft                  |
|░[ No-support zones ] |#                                                                 #|░> Letter label          |
|░CHECK SUPPORTS       |#                                                                 #|░> Advanced              |
|░[Check for unsupp. ] |#                                                                 #| EXPORT STL              |
|░ o Island  A    [Fix]|#                                                                 #| [Active obj + model ]   |
|░ o Overhang A   [Fix]|#                                                                 #| [Active, supports   ]   |
|                      |#                                                                 #| [Each obj + model   ]   |
|                      |#                               [Tips only][Fit view][Bottom view]#| [Each, supports     ]   |
|                      |#=================================================================#| [Whole plate, 1 file]   |
+----------------------+-------------------------------------------------------------------+-------------------------+
| 3 objects   412,330 triangles   396 automatic, 16 manual, 2 removed    Support Edit Mode: drag the circle over...  |
+--------------------------------------------------------------------------------------------------------------------+
```

Notes: Click | Drag over are the big icon buttons (`.tool-choice`); directly under Drag over sit the
Select | Unselect switch and Circle size, with the hint "Hold Shift to unselect" **[new]**. The
selection row appears only with a selection: "{n} selected", Clear selection, Delete (danger), and
Done stays last and red. The right panel is drawn in its **[feature]** state B (section 11); until
that feature ships it looks as in 2.4.

#### 2.6 No-support zones (focus mode)

```text
+--------------------------------------------------------------------------------------------------------------------+
| mixoDental  Resin Support Studio      [EN|ZH|JA]  [Undo][Redo] | [Hide models][Wireframe]                       |
+----------------------+-------------------------------------------------------------------+-------------------------+
| Finish painting zones|#=================================================================#| Finish painting zones   |
| first: press Esc or  |#[PAINTING NO-SUPPORT ZONES  bust.stl]                            #| first: press Esc or     |
| Done.                |#                                                                 #| Done.                   |
|                      |#            +---------------------------------------------------+#|                         |
|░IMPORT MODELS        |#            | [=Paint=|Erase]  Brush size [-----o-----] 2.0 mm  |#|░SUPPORT SETTINGS  bust  |
|░[ Import models    ] |#            | Supports attach underneath: turn the view (Bottom |#|░Preset [Lt|=Md=|Hv|Cu]  |
|░ STL, GLB or glTF.   |#            | view) to paint where they are.          Ctrl+Z    |#|░Lift height    5.0 mm   |
|░OBJECTS           3  |#            |            [! Clear all zones !]  [* Done  Esc *] |#|░Roof/cage [=Off=|Rf|Cg] |
|░|A| bust.stl    412  |#            +---------------------------------------------------+#|░v Auto placement        |
|░ B  base.stl     88  |#                         .----------.                            #|░  Support spacing  3.0  |
|░ C  ring.stl      -  |#                        (  /////     )   //// = blue zone layer  #|░  Overhang angle   50   |
|░[Select all][Delete] |#                         '--..-..--'     (tips only, forced)     #|░  [x] Downward faces    |
|░TRANSFORM            |#                     ======================                      #|░  [x] Islands           |
|░[Select|=Move=|Rot.] |#                                                                 #|░v Contact tip           |
|░SUPPORTS FOR ALL 3   |#                                                                 #|░  Shape [=None=|Sphere] |
|░[*Regenerate      *] |#                                                                 #|░  Point dia.  0.40 mm   |
|░[Clear manual edits] |#                                                                 #|░> Pillar                |
|░[! Remove supports!] |#                                                                 #|░> Foot                  |
| MODES                |#                                                                 #|░> Bracing               |
| [=Exit no-support z=]|#                                                                 #|░> Raft                  |
|   (live, ink fill)   |#                                                                 #|░> Letter label          |
|░[ Edit supports    ] |#                                                                 #|░> Advanced              |
|░CHECK SUPPORTS       |#                                                                 #|░EXPORT STL              |
|░[Check for unsupp. ] |#                                                                 #|░[Active obj + model ]   |
|░ o Island  A    [Fix]|#                                                                 #|░[Active, supports   ]   |
|░ o Overhang A   [Fix]|#                                                                 #|░[Each obj + model   ]   |
|                      |#                             [=Tips only=][Fit view][Bottom view]#|░[Each, supports     ]   |
|                      |#=================================================================#|░[Whole plate, 1 file]   |
+----------------------+-------------------------------------------------------------------+-------------------------+
| 3 objects   412,330 triangles   396 automatic, 16 manual, 2 removed  Paint where supports must not grow; drag on...|
+--------------------------------------------------------------------------------------------------------------------+
```

Notes: both side panels are dimmed and locked; the only live panel control is the left Exit button
(4.4). Tips only shows pressed and does nothing (forced, today). Clear all zones lives only here
**[change]**, with an Undo toast. The frame is red like Support Edit Mode (mixo-app-style: a tool mode gets a
red hairline; blue is the zone layer on the model) **[change, confirm]**; the badge names the mode and
carries "{n} supports hidden by zones" **[new]**. The camera-above-plate note shows only while the camera is above the plate (today).

---

### 3. Left panel brush-up

#### 3.1 Proposed order and why

1. **Import models** — first step, always at the top.
   Under it, one row with **Open project** and **Save project** (the file counterpart of Import; same lock in a mode). The format is the scene JSON under a `{ app: 'mixodental', version: 1 }` header, gzip-compressed where the browser can; opening an older or plain file works.
2. **Objects** — what was imported; selection decides the scope of everything below.
3. **Transform** — orient before generating (rotation changes placement).
4. **Supports for {scope}** — Generate / Regenerate (the primary), Clear manual edits, Remove supports.
5. **Modes** — Edit supports, No-support zones: hand work on the supports just generated, so it sits
   right under Supports.
6. **Check supports** — the last step before export; its findings list grows (up to 12 rows + "and
   {n} more"), so at the bottom it never pushes the Mode buttons below the fold at 768 px.

Export STL stays where it is today: at the bottom of the right panel (owner: "Export placement as
today").

Why Modes moved below Supports: today the mode sections sit between Transform and Supports, so the
eye meets "Enter Support Edit Mode" before anything was generated, and the panel order does not
follow the work order.

#### 3.2 Before / after inventory

| # | Today (order, label) | After | Reason |
|---|---|---|---|
| 1 | Import models (drop / file picker), help "STL, GLB or glTF. Files stay on this device." | Same, position 1 | Unchanged. In a mode the panel is locked, so it cannot import mid-mode (4.5). |
| 2 | Objects: rows (letter, name, support count), Select all, Delete | Same, position 2; Delete restyled `.danger` **[change]** | Destructive role (P8). |
| 3 | Transform: Select / Move / Rotate (disabled in a mode) | Same, position 3 | Unchanged; the whole panel locks in a mode instead of this one control. |
| 4 | Section "Edit supports": button Enter Support Edit Mode / Exit Support Edit Mode, help "Add or remove supports by clicking the model. Tab toggles." (Tab no longer toggles, 8.2) | Moved into group **Modes** (position 5) as button **Edit supports** / **Exit Support Edit Mode** **[change]** | One group for both modes; label as owner named it. |
| 5 | Section "No-support zones" with count (Painted / None): button Paint zones / Exit no-support zones; **Clear** (danger, compact); help "Paint where supports must not grow. Manual supports stay." | Group **Modes**: button **No-support zones** / **Exit no-support zones**, with the muted state word Painted / None at the button's right end **[change]**. **Clear removed** (lives in the zones bar). | One button per mode, no other mode controls in the left panel. The state word is information, not a control: it tells the user zones exist (they change generation). |
| 6 | Supports for {scope}: Generate supports / Regenerate (red / blue), Clear manual edits, Remove supports | Same controls, position 4; Clear manual edits and Remove supports restyled `.danger` **[change]** | Work order; destructive role. |
| 7 | Check supports: Check for unsupported spots, findings (Show me, Fix in red), help line | Same, position 6; **Fix becomes secondary** **[change]** | P1: one primary per view (up to 12 red Fix buttons today). |
| 8 | Help lines under the two mode sections | One help line under the Modes group, shown only when both buttons are disabled: "Select an object first." or the heavy-model line | Says why, only when needed. |
| — | (viewport) "Edit supports" button top-right outside a mode | Removed **[change]** | Duplicate of the Modes button (P3); breaks sibling symmetry (zones has none). Tab is not a mode key any more (8.2). |
| — | (header) Generate supports for {scope} | Removed **[change, confirm]** | Duplicate of the Supports group button (P3) and a second red button (P1). |

#### 3.3 The Click reach exception

Owner: the removal option belongs to the Add tool. Today it is a per-object setting in the right
panel (Advanced → Remove radius, setting `eraseRadius`, 0.1–50 mm, default 1.5). After the right-click
fix (11.0 a) it no longer removes a radius of supports: it is only the **pick tolerance**, how far
from a support a right-click may land and still hit it. The field is renamed **Click reach**
**[change]** (key `rp.eraseRadius` stays) so the label does not promise a wider erase than it does. The right panel stays
as is (owner), so the field stays there too. Both places bind the **same registry control**
(`setting.eraseRadius` of the active object): one state, two renderings, never diverging. The Add bar
renders it as a number field (same clamping and keys as the right panel), not a slider, because its
range (0.1–50 mm) is too wide for a slider. Recommendation **[confirm]**: drop it from the right panel
once the Add bar has it.

---

### 4. Mode state machine

#### 4.1 States

```
UiState
  mode: 'setup' | 'edit' | 'zones'
  edit:  { tool: 'add' | 'select',
           method: 'click' | 'dragOver',          // under select
           dragAction: 'select' | 'unselect',      // under dragOver; the switch
           shiftHeld: boolean,                     // live key state, flips dragAction while held
           circleSize: 8..80 px (step 4, default 24),
           selection: Set<contactId> }
  zones: { tool: 'paint' | 'erase', brushSize: 0.5..10 mm (step 0.5, default 2) }
  guards: active (an active object), editable (active and not heavy)
```

Effective drag action = `shiftHeld ? flip(dragAction) : dragAction` **[new]**. The tool, method,
switch, sizes survive mode changes and object changes (today's rule); the selection empties on every
mode change and active-object change (today). `zonesReturn` is deleted **[change]**: zones always
returns to setup. (Code calls that state `off`; the app calls it the bench —
`src/bench/benchScene.ts`.)

#### 4.2 Diagram

```
                ENTER_EDIT  (Edit supports button, check finding Fix)        guard: editable
      ┌───────┐ ─────────────────────────────────────────────────────────▶ ┌──────────────┐
      │       │ ◀───────────────────────────────────────────────────────── │ edit         │
      │ setup │   EXIT = mode.exit (Done, Exit button, Esc*, Enter†)       │  add         │
      │       │                                                            │  select      │
      │       │ ENTER_ZONES (No-support zones button)   guard: editable    │   click      │
      │       │ ──────────────────────────────▶ ┌────────────┐             │   dragOver   │
      │       │ ◀────────────────────────────── │ zones      │             │    select    │
      └───────┘   EXIT (Done, Exit button,      │  paint     │             │    unselect  │
          ▲        Esc, Enter†)                 │  erase     │             └──────────────┘
          │                                     └────────────┘
          └── FORCE_LEAVE from any mode: the active object goes (Delete, Undo past its import).
   No edge edit ⇄ zones: exit first (P5). "Edit no-support zones →" is removed.
   * Esc in edit with a selection clears the selection first (Undo toast); the next Esc exits.
   Every EXIT edge is the one command `mode.exit`; Tab is not a mode key.
   † Enter exits only when focus is not on a button, link, summary or tabindex element (today).
```

#### 4.3 Transitions

| From | Event (sources) | Guard | To | Effects |
|---|---|---|---|---|
| setup | ENTER_EDIT (Modes → Edit supports; check Fix on a finding) | editable | edit | Undo floor = scene now; selection empty; status = tool line (6.4); focus → mode bar's pressed tool button (8.2). Fix selects the finding's object first, then enters (today). |
| setup | ENTER_EDIT / ENTER_ZONES | no active object | setup | Status "Select an object to edit its supports." / "Select an object first." (today). The buttons are disabled in this state, so no control reaches this row; it stays as a guard. |
| setup | ENTER_EDIT / ENTER_ZONES | heavy | setup | Status: the heavy-model line (today). |
| setup | ENTER_ZONES (Modes → No-support zones) | editable | zones | Undo floor; Tips only forced; focus → Paint / Erase group. |
| edit | EXIT = `mode.exit` (Done; left Exit Support Edit Mode; Esc with no selection; Enter†) | — | setup | Status "Support edits kept."; focus → left Modes button. |
| edit | Esc | selection > 0 | edit | Clear selection, Undo toast (today). |
| edit | Delete / Backspace | selection > 0 | edit | Delete selected, one undo step (today). |
| edit | ENTER_ZONES | — | — | Not reachable: the zones button is locked in edit (4.4), no shortcut exists. |
| zones | EXIT = `mode.exit` (Done; left Exit no-support zones; Esc; Enter†) | — | setup | Status "No-support zones kept."; Tips only returns to its previous state; focus → left Modes button. |
| edit, zones | click on another object in the viewport | — | same | Refused, status "Finish … first: press Esc or Done." (today). |
| edit, zones | file dropped on the viewport | — | same | Refused with the same busy line **[change, confirm]** (today an import ends the mode). |
| edit, zones | the active object leaves the scene | — | setup | Forced exit (today). |
| edit, zones | Esc or Enter typed in a text, number, select or textarea field | focus in the field | same | Affects only the field (revert, blur, commit); no mode event **[change]** (8.6). |
| edit, zones | click on a locked region of either panel | — | same | Status "Finish ... first: press Esc or Done." and the lock note pulses **[change]** (4.5). |
| edit (sub) | Tool Add ↔ Select; Click ↔ Drag over; switch Select ↔ Unselect | — | edit | Status line updates to the new tool line (today); badge text follows (6.4). |
| edit (sub) | Shift down / up during Drag over | method = dragOver | edit | `shiftHeld` flips the effective drag action; the circle, cursor badge and badge text follow at once; a running stroke applies it to later steps (stroke queue keeps per-step mode, today) **[new]**. |

Removed transitions **[change]**: edit → zones ("Edit no-support zones →", `openZones from: 'edit'`),
zones → edit (`closeZones` with `zonesReturn = 'edit'`), and "Remove supports ends the mode" (Remove
supports is in the locked left panel, so it cannot be pressed in a mode).

#### 4.4 What each region does per state

| Region | setup | edit (Support Edit Mode) | zones (No-support zones, focus mode) |
|---|---|---|---|
| Header | live | live. The lock blocks scene-changing commands only: Undo / Redo stay live down to the mode's floor, and the view toggles (Hide models, Wireframe, language) are never locked **[confirm]** | live (same rule) |
| Left panel | live | dimmed + locked; **Exit Support Edit Mode** stays live (pressed, ink) | dimmed + locked; **Exit no-support zones** stays live (pressed, ink) |
| Viewport | object name, view toggles top-right, unit note | red frame, red badge, edit bar top-right, view toggles bottom-right | red frame, red badge, zones bar top-right, view toggles bottom-right, Tips only forced |
| Right panel | live | **live** (owner ruling): settings and Export | dimmed + locked, no exception |
| Footer | live | live | live |
| Keyboard | Delete (objects), G, R, Ctrl+Z / Y | Esc, Enter, Delete / Backspace (supports), Shift (Drag over), Ctrl+Z / Y | Esc, Enter, Ctrl+Z / Y |

**Decision: the Exit button stays live inside the locked left panel, in both modes.** Reasons: (1)
the button that took the user in takes them out, in the same spot, as shipped; (2) a visible
"Exit …" label on a dead button would be a dead control (the user clicks, nothing happens); (3) one
rule for both modes, so the user learns it once; (4) focus mode exists to stop scene changes from the
panels while painting, and leaving the mode is not a scene change. The viewport Done and Esc remain;
in zones the viewport Done is the primary exit, the left Exit the secondary one. **Left Exit and
viewport Done dispatch the same command id, `mode.exit`**, with the same guard, the same effects and the
same status line, so they can never disagree; Esc and Enter† map to it too. Two of four reviewers
preferred a single Exit in the viewport bar; the choice is kept (C2). Implementation: put
`inert` on every left-panel section and on the other mode's button, not on the panel element
(an `inert` ancestor cannot have a live child).

#### 4.5 Lock behaviour details

- A locked region gets the lock note at its top, at full opacity, not inert: edit → "Finish editing
  supports first: press Esc or Done."; zones → "Finish painting zones first: press Esc or Done."
  (existing strings, today used as the busy status).
- A click on a locked region repeats the note in the status line and pulses the lock note (a
  transparent, non-focusable catcher over the inert sections; **required**, so a click never vanishes
  silently) **[change]**.
- The header lock blocks scene-changing commands only. View toggles (Hide models, Wireframe, language)
  stay live in every mode.
- Job activity Cancel / Dismiss and the Undo toast are inside the viewport, so they stay live in
  every state.
- Fix on a check finding and Remove supports cannot run in a mode (their panel is locked); today's
  code paths that end a mode for them (`send({ type: 'leave' })` at App.tsx:532, 567) stay as a guard.

#### 4.6 Framework-free shape

```ts
// src/editing/uiMachine.ts (proposed; replaces session.ts mode/tool fields, keeps selection rules)
type Mode = 'setup' | 'edit' | 'zones';
type UiEvent =
  | { type: 'enterEdit' } | { type: 'enterZones' } | { type: 'exit' } | { type: 'forceLeave' }
  | { type: 'setTool'; tool: 'add' | 'select' } | { type: 'setMethod'; method: 'click' | 'dragOver' }
  | { type: 'setDragAction'; action: 'select' | 'unselect' } | { type: 'shift'; held: boolean }
  | { type: 'setCircleSize'; px: number } | { type: 'setZoneTool'; tool: 'paint' | 'erase' }
  | { type: 'setBrushSize'; mm: number } | { type: 'escape' } /* … selection events as today */;
function reduce(state: UiState, event: UiEvent): UiState; // same object when nothing changes
```

---

### 5. Command registry

#### 5.1 Shape

Every control is defined once; panels, the mode bar, the badge, the status line and the keyboard
handler render or dispatch from these records. No component decides visibility or enabled state by
itself.

```ts
interface Command {
  id: string;                       // stable, e.g. 'edit.tool.add'
  label: string;                    // i18n key (English text), or a function of state for two-state buttons
  hint: string;                     // i18n key, shown as title + aria-description
  icon?: 'pointer' | 'brush';       // ToolIcons; most controls are words only
  shortcut?: string;                // display + keyAction binding
  surface: 'header' | 'left' | 'viewport' | 'editBar' | 'zonesBar' | 'right' | 'keyboard';
  role: 'primary' | 'secondary' | 'destructive' | 'toggle' | 'choice' | 'field' | 'info';
  visible(s: UiState): boolean;
  enabled(s: UiState): boolean;     // false → disabled (or inert when the region is locked)
  pressed?(s: UiState): boolean;
  run(ctx: AppContext, s: UiState): void; // a UiEvent or a scene command; never DOM
}
```

Region lock is applied by the renderer from 4.4, on top of `enabled`: a control in a locked region is
inert regardless of its own rule, except the commands marked "lock-exempt".
The two exit buttons and Esc / Enter† all run `mode.exit`; there is no second exit implementation.

State names used below: `mode`, `tool`, `method`, `dragAction`, `zoneTool`, `units` (objects on the
plate), `selObj` (selected objects), `active`, `editable`, `sel` (selected supports), `anySupports`,
`hasZones`, `exporting`, `canUndo`, `canRedo`, `findings`. Copy ids (column "Copy") point to 6.2.

#### 5.2 Header

| id | Label (copy) | Icon | Hint (copy) | Shortcut | Visible | Enabled | Role | Status |
|---|---|---|---|---|---|---|---|---|
| app.lang | EN / 中文 / 日本語 (language names, not translated) | — | language's own name | — | always | always | choice | today |
| history.undo | hdr.undo | — | hdr.undo.hint | Ctrl+Z | always | canUndo (stops at the mode floor) | secondary | today |
| history.redo | hdr.redo | — | hdr.redo.hint | Ctrl+Shift+Z, Ctrl+Y | always | canRedo | secondary | today |
| view.models | hdr.hideModels / hdr.showModels | — | hdr.hideModels.hint / hdr.showModels.hint | — | always | always | toggle | today |
| view.wireframe | hdr.wireframe / hdr.solid | — | hdr.wireframe.hint / hdr.solid.hint | — | always | always | toggle | today |
| supports.generate (header copy) | hdr.generateScope | — | sup.generate.hint | — | — | — | primary | **removed [confirm]** |

Header lock rule: in a mode the header blocks scene-changing commands only; `view.models`, `view.wireframe`
and `app.lang` are never locked, `history.*` stay live down to the mode's floor. (If C1 is declined and the
header Generate stays, it locks in modes.)

#### 5.3 Left panel

| id | Label (copy) | Icon | Hint (copy) | Shortcut | Visible | Enabled | Role | Status |
|---|---|---|---|---|---|---|---|---|
| import.files | imp.title, imp.help | — | imp.hint | drop on viewport | always | mode = setup | secondary (drop zone) | today; viewport drop refused in a mode **[change]** |
| project.open | Open project | — | Open a .mixodental project. It replaces the plate; Undo brings the previous plate back | drop a .mixodental file on the viewport | always | mode = setup (refused with the "Finish … first" line in a mode, like an import) | secondary | **[new]** |
| project.save | Save project | — | Save the plate, supports and hand edits as a .mixodental file | — | always | units > 0 ("Import a model first.") | secondary | **[new]** |
| objects.row[i] | object letter, name, support count | — | obj.row.hint | Shift / Ctrl+click adds or removes | units > 0 | mode = setup | choice | today |
| objects.selectAll | obj.selectAll | — | obj.selectAll.hint | — | always | units > 0 | secondary | today |
| objects.delete | obj.delete | — | obj.delete.hint | Delete (setup) | always | selObj > 0 | destructive | role **[change]** |
| transform.mode | tr.select / tr.move / tr.rotate | — | tr.*.hint | G (Move), R (Rotate) | always | mode = setup | choice | today |
| supports.generate | sup.generate / sup.regenerate | — | sup.generate.hint | — | always | units > 0 | primary (blue when Regenerate) | today |
| supports.clearManual | sup.clearManual | — | sup.clearManual.hint | — | always | units > 0 | destructive (Undo toast) | role **[change]** |
| supports.remove | sup.remove | — | sup.remove.hint | — | always | units > 0 | destructive | role **[change]** |
| mode.edit | mode.edit / mode.exitEdit | — | mode.edit.hint / mode.exitEdit.hint | — (Tab removed **[change]**) | always | setup: editable; edit: true (**lock-exempt**); zones: false | secondary; pressed (ink) in edit; runs `mode.exit` while pressed | label **[change]** |
| mode.zones | mode.zones (+ zones.state Painted / None) / mode.exitZones | — | mode.zones.hint / mode.exitZones.hint | — | always | setup: editable; zones: true (**lock-exempt**); edit: false | secondary; pressed (ink) in zones; runs `mode.exit` while pressed | label **[change]** |
| mode.exit | (the shared command behind both Exit buttons, both Done buttons, Esc and Enter†) | — | — | Esc, Enter† | mode ≠ setup | always | — | **[new]** |
| mode.help | sel.first / heavy line | — | — | — | setup and both mode buttons disabled | — | info | **[change]** |
| check.run | chk.run | — | chk.help | — | always | anySupports | secondary | today |
| check.showMe[i] | chk.showMe | — | chk.showMe.hint | — | findings > 0 | mode = setup | secondary | today |
| check.fix[i] | chk.fix | — | chk.fix.hint | — | findings > 0 | mode = setup | secondary | role **[change]** (was primary) |

#### 5.4 Right panel (summary; inventory only)

| id | Label (copy) | Hint | Visible | Enabled | Role | Status |
|---|---|---|---|---|---|---|
| right.header | rp.title + active object name (+ "and {n} more") | — | always | — | info | today; context header **[feature]** |
| right.help | rp.help | — | no active object | — | info | today |
| setting.preset | rp.preset: Light / Middle / Heavy, Custom (indicator, always disabled) | rp.preset.hint, per-preset hints | always | active | choice | today |
| setting.liftHeight | rp.lift (number, mm) | rp.lift.hint | always | active | field | today |
| setting.roofMode | rp.roof: Off / Roof / Cage | rp.roof.hint, per-mode hints | always | active | choice | today |
| setting.group[g] | 10 collapsible groups: Auto placement (open), Tree supports (when Tree supports on), Contact tip (open), Pillar, Foot, Bracing, Raft, Roof (when Roof), Cage (when Cage), Letter label, Advanced | per field | per group rule | active | field | today (field list: 6.3) |
| setting.eraseRadius | Advanced → Click reach | rp.eraseRadius.hint | always | active | field | today; also rendered in the Add bar (3.3) |
| export.kind[5] | exp.activePrintable, exp.activeSupports, exp.separatePrintable, exp.separateSupports, exp.wholePrintable | per kind | always | units > 0 and not exporting | secondary | today |
| right.lock | lock.zones | — | mode = zones | — | info | **[new]** placement of an existing string |

Right panel rule: live in setup and edit, locked in zones (4.4).

#### 5.5 Viewport (any state)

| id | Label (copy) | Icon | Hint (copy) | Shortcut | Visible | Enabled | Role | Status |
|---|---|---|---|---|---|---|---|---|
| vp.objectName | active object name / vp.nothing | — | — | — | mode = setup | — | info | today |
| view.tips | vp.tips | — | vp.tips.hint.off / .on / .forced | — | always | always; `aria-disabled` while zones (forced on) | toggle | today |
| view.fit | vp.fit | — | vp.fit.hint | — | always | units > 0 | secondary | today |
| view.bottom | vp.bottom | — | vp.bottom.hint | — | always | units > 0 | secondary | today |
| vp.editToggle | mode.edit | — | — | — | — | — | secondary | **removed [change]** |
| vp.note | vp.note | — | — | — | mode = setup | — | info | today |
| vp.dropOverlay | vp.drop | — | — | — | file dragged over, mode = setup | — | info | today; not in a mode **[change]** |
| jobs.cancel[i] | job.cancel | — | job.cancel aria-label | — | cancellable job running | always | secondary | today |
| jobs.dismiss[i] | job.dismiss | — | — | — | job failed | always | secondary | today |
| toast.undo | hdr.undo | — | toast.undo.hint | — | toast shown (6 s, paused on hover / focus) | always | secondary | today |
| vp.circlePreview | (circle at view centre) | — | — | — | method = dragOver and Circle size moving, + 800 ms | — | info | today |

#### 5.6 Support Edit Mode (edit bar, badge)

| id | Label (copy) | Icon | Hint (copy) | Shortcut | Visible | Enabled | Role | Status |
|---|---|---|---|---|---|---|---|---|
| edit.badge | badge.edit + object name + badge.add / badge.click / badge.drag / badge.dragUnselect | — | — | — | mode = edit | — | info (`role="status"`) | today; texts **[change]** |
| edit.tool | edit.add / edit.select (group label edit.tool) | — | edit.add.hint / edit.select.hint | — | mode = edit | always | choice | today |
| edit.removeRadius | rp.eraseRadius + "{n} mm" | — | rp.eraseRadius.hint | — | tool = add | active | field (number) | **[new]** placement (3.3) |
| edit.keys.add | kbd Right-click / Ctrl+Click "remove", Ctrl+Z "undo" | — | — | — | tool = add | — | info | today |
| edit.method | edit.click / edit.dragOver (group label edit.how) | pointer / brush | edit.click.hint **[change]** / edit.dragOver.hint | — | tool = select | always | choice (`.tool-choice`) | today |
| edit.dragAction | edit.dragSelect / edit.dragUnselect (group label edit.dragging) | — | edit.dragSelect.hint / edit.dragUnselect.hint; group hint edit.shift | hold **Shift** = the other one while held | method = dragOver | always | choice; shows the effective action while Shift is held | today; Shift **[new]** |
| edit.circleSize | edit.circle + "{n} px" (8–80, step 4) | — | edit.circle.hint | — | method = dragOver | always | field (slider) | today |
| edit.keys.select | kbd Right-click "remove", Ctrl+Z "undo" | — | — | — | tool = select | — | info | today |
| edit.selCount | sel.count "{n} selected" | — | — | — | sel > 0 | — | info | today |
| edit.clearSelection | sel.clear | — | sel.clear.hint | Esc (with a selection) | sel > 0 | always | secondary | today |
| edit.deleteSelection | obj.delete ("Delete") | — | sel.delete.hint | Delete, Backspace | sel > 0 | always | destructive | today |
| edit.adjust | — | — | — | — | — | — | — | not a button: becomes the right panel's "Settings for {n} selected" **[feature]** |
| edit.done | done + kbd Esc | — | edit.done.hint | Esc (no selection), Enter† | mode = edit | always | primary; runs `mode.exit` | today |
| edit.openZones | Edit no-support zones → | — | — | — | — | — | — | **removed [change]** |

#### 5.7 No-support zones (zones bar, badge)

| id | Label (copy) | Icon | Hint (copy) | Shortcut | Visible | Enabled | Role | Status |
|---|---|---|---|---|---|---|---|---|
| zones.badge | badge.zones + object name + zones.hidden "{n} supports hidden by zones" (from the shown build's `dropped` contacts, App.tsx:206) | — | — | — | mode = zones | — | info (`role="status"`) | today; count **[new]** |
| zones.tool | zones.paint / zones.erase (group label zones.brush) | — | zones.paint.hint / zones.erase.hint | — | mode = zones | always | choice | today |
| zones.brushSize | zones.size + "{n} mm" (0.5–10, step 0.5) | — | zones.size.hint | — | mode = zones | always | field (slider) | today |
| zones.keys | kbd Ctrl+Z "undo" | — | — | — | mode = zones | — | info | today |
| zones.note | zones.note | — | — | — | camera above the plate | — | info (`role="note"`) | today |
| zones.clearAll | zones.clearAll | — | zones.clearAll.hint | — | mode = zones | hasZones | destructive (Undo toast) | today; the only "Clear all zones" now **[change]** |
| zones.done | done + kbd Esc | — | zones.done.hint | Esc, Enter† | mode = zones | always | primary; runs `mode.exit` | today |
| zones.clearLeft | Clear (left panel, compact) | — | — | — | — | — | — | **removed [change]** |

#### 5.8 Keyboard-only bindings

| Key | State | Command | Visible equivalent |
|---|---|---|---|
| Ctrl+Z / Ctrl+Shift+Z / Ctrl+Y | any (not in a text field) | history.undo / history.redo | header Undo / Redo |
| Esc | edit with selection → edit.clearSelection; edit without → mode.exit; zones → mode.exit. Esc inside any text, number, select or textarea field only affects that field (open question Q1 on the order) | as named | Clear selection, Done |
| Enter† | edit, zones | mode.exit | Done |
| Delete, Backspace | edit with selection | edit.deleteSelection | Delete |
| Delete | setup | objects.delete | Objects → Delete |
| G / R | setup | transform.mode Move / Rotate | Transform group |
| Shift (held) | edit, method = dragOver | flips edit.dragAction while held **[new]** | the Select / Unselect switch |
| Click | edit, method = click | toggle one support; never clears the rest. Shift+click is not a separate action **[change]** | the click itself |
| Right-click, Ctrl+click | edit, tool = add | delete exactly the one support hit (pick tolerance: Click reach) **[change]** | Select → Delete |

#### 5.9 Status line and badge as registry output

The status line and badge are rendered from the state, not written by controls:
`badgeText(state)` and `statusFor(prev, next, event)` (today `editing/status.ts`). Section 6.4 lists
their strings per state.

---

### 6. Copy

#### 6.1 Naming rules

- **Paint / Erase / Brush** only for no-support zones (glossary `ZONE_ONLY_WORDS`, enforced by
  `glossary.test.ts`). **Select / Drag over / Circle size** only for picking supports. Never "brush"
  for Drag over.
- **Delete** = exactly the selected items. **Remove** = one support by right-click (exact), or all
  supports of an object. **Clear** = empty a list (selection, zones, manual edits) with an Undo toast.
- **Support Edit Mode** is the mode's name (badge, status, exit button); "Edit supports" is the verb
  on the entry button. **No-support zones** is the zone mode's name; "Paint" is its tool.
- One term per concept per language (glossary): 支撐 / サポート, 免支撐區 / サポート禁止エリア, 物件 /
  オブジェクト, 移除 vs 刪除 / 削除, 匯出 / 書き出し (never 輸出 / エクスポート).
- Labels fit one row at 11.5 px in all three languages; a long label wraps its value to its own line,
  never clips (mixo-app-style).
- New strings below are **proposed**: add each to `src/locales/zh-Hant.ts` and `src/locales/ja.ts`
  and let `glossary.test.ts` / `i18n.test.ts` check them; zh-Hant should get a native read (Gemini
  bridge "翻成台灣中文") before merge.

#### 6.2 Header, left panel, viewport, modes

Locale line numbers: `zh` = `src/locales/zh-Hant.ts`, `ja` = `src/locales/ja.ts`.

| Copy id | en (i18n key) | zh-Hant | ja | Status |
|---|---|---|---|---|
| hdr.subtitle | Resin Support Studio | 樹脂支撐工作室 (zh:6) | レジンサポートスタジオ (ja:5) | today |
| hdr.lang.label | Language | 語言 (zh:7) | 言語 (ja:6) | today |
| hdr.undo | Undo | 復原 (zh:8) | 元に戻す (ja:7) | today |
| hdr.redo | Redo | 重做 (zh:9) | やり直す (ja:8) | today |
| hdr.undo.hint | Undo (Ctrl+Z) | 復原（Ctrl+Z） (zh:10) | 元に戻す（Ctrl+Z） (ja:9) | today |
| hdr.redo.hint | Redo (Ctrl+Shift+Z) | 重做（Ctrl+Shift+Z） (zh:11) | やり直す（Ctrl+Shift+Z） (ja:10) | today |
| hdr.hideModels | Hide models | 隱藏模型 (zh:12) | モデルを隠す (ja:11) | today |
| hdr.showModels | Show models | 顯示模型 (zh:13) | モデルを表示 (ja:12) | today |
| hdr.hideModels.hint | Hide the models to see the supports alone. Export is not affected | 隱藏模型，只看支撐。不影響匯出 (zh:300) | モデルを隠してサポートだけを表示します。書き出しには影響しません (ja:296) | today |
| hdr.showModels.hint | Show the models again | 重新顯示模型 (zh:301) | モデルを再表示します (ja:297) | today |
| hdr.wireframe | Wireframe | 線框 (zh:15) | ワイヤーフレーム (ja:14) | today |
| hdr.solid | Solid | 實體 (zh:14) | ソリッド (ja:13) | today |
| hdr.wireframe.hint | Draw the models as wireframes to see supports behind them | 以線框顯示模型，看得到後方的支撐 (zh:303) | モデルをワイヤーフレームで表示し、奥のサポートを見えるようにします (ja:299) | today |
| hdr.solid.hint | Draw the models solid | 以實體顯示模型 (zh:302) | モデルをソリッドで表示します (ja:298) | today |
| hdr.generateScope | Generate supports for {scope} / Regenerate supports for {scope} / Generating supports | 為{scope}產生支撐 / 為{scope}重新產生支撐 / 正在產生支撐 (zh:17, 18, 16) | {scope}にサポートを生成 / {scope}のサポートを再生成 / サポートを生成中 (ja:16, 17, 15) | removed from the header **[confirm]**; keys stay for the scope wording |
| scope.selected | {n} selected | 已選取的 {n} 個 (zh:20) | 選択中の {n} 個 (ja:19) | today |
| scope.all | all {n} | 全部 {n} 個 (zh:21) | 全 {n} 個 (ja:20) | today |
| imp.title | Import models | 匯入模型 (zh:22) | モデルを読み込む (ja:21) | today |
| imp.help | STL, GLB or glTF. Files stay on this device. | STL、GLB 或 glTF。檔案只留在這台裝置上。 (zh:23) | STL・GLB・glTF に対応。ファイルはこの端末から外に出ません。 (ja:22) | today |
| imp.hint | Choose STL, GLB or glTF files, or drop them on the viewport | 選擇 STL、GLB 或 glTF 檔案，或直接拖放到視圖中 (zh:305) | STL・GLB・glTF ファイルを選ぶか、ビューポートにドロップします (ja:301) | today |
| obj.title | Objects | 物件 (zh:24) | オブジェクト (ja:23) | today |
| obj.empty | Each STL, and each mesh inside a glTF, becomes its own object. | 每個 STL，以及 glTF 裡的每個網格，都會成為獨立的物件。 (zh:25) | STL ごと、glTF 内のメッシュごとに個別のオブジェクトになります。 (ja:24) | today |
| obj.row.hint | Click to select; Shift+click or Ctrl+click adds it to the selection or takes it out | 點擊即可選取；Shift+點擊或 Ctrl+點擊可加入或移出選取 (zh:306) | クリックで選択。Shift+クリックまたは Ctrl+クリックで選択に追加・解除します (ja:302) | today |
| obj.count | 1 support / {n} supports / No supports yet | 1 個支撐 / {n} 個支撐 / 尚無支撐 (zh:27, 26, 28) | サポート 1 本 / サポート {n} 本 / サポートなし (ja:26, 25, 27) | today |
| obj.selectAll | Select all | 全選 (zh:29) | すべて選択 (ja:28) | today |
| obj.selectAll.hint | Select every object | 選取所有物件 (zh:307) | すべてのオブジェクトを選択します (ja:303) | today |
| obj.delete | Delete | 刪除 (zh:30) | 削除 (ja:29) | today |
| obj.delete.hint | Delete the selected objects (Delete key). Undo brings them back | 刪除選取的物件（Delete 鍵）。復原可找回 (zh:308) | 選択したオブジェクトを削除します（Delete キー）。「元に戻す」で復元できます (ja:304) | today |
| tr.title | Transform | 變換 (zh:31) | トランスフォーム (ja:30) | today |
| tr.select / tr.move / tr.rotate | Select / Move / Rotate | 選取 / 移動 / 旋轉 (zh:32–34) | 選択 / 移動 / 回転 (ja:31–33) | today |
| tr.select.hint | Select objects without a gizmo | 選取物件，不顯示操作把手 (zh:309) | ギズモなしでオブジェクトを選択します (ja:305) | today |
| tr.move.hint | Move the active object with the gizmo (G) | 用操作把手移動使用中的物件（G） (zh:310) | ギズモでアクティブなオブジェクトを移動します（G） (ja:306) | today |
| tr.rotate.hint | Rotate the active object with the gizmo (R) | 用操作把手旋轉使用中的物件（R） (zh:311) | ギズモでアクティブなオブジェクトを回転します（R） (ja:307) | today |
| sup.title | Supports for {scope} | {scope}的支撐 (zh:41) | {scope}のサポート (ja:40) | today |
| sup.generate | Generate supports | 產生支撐 (zh:19) | サポートを生成 (ja:18) | today |
| sup.regenerate | Regenerate | 重新產生 (zh:42) | 再生成 (ja:41) | today |
| sup.generate.hint | Place automatic supports on the selected objects, or on every object when none is selected | 為選取的物件自動配置支撐；沒有選取時套用到所有物件 (zh:304) | 選択したオブジェクトに自動でサポートを配置します。何も選択していないときはすべてのオブジェクトが対象です (ja:300) | today |
| sup.clearManual | Clear manual edits | 清除手動編輯 (zh:43) | 手動編集をクリア (ja:42) | today |
| sup.clearManual.hint | Remove manual supports and bring back removed automatic ones, at once. Undo brings the edits back | 立即移除手動支撐並恢復已移除的自動支撐。復原可找回這些編輯 (zh:316) | 手動サポートを削除し、削除した自動サポートをすぐに戻します。「元に戻す」で編集を復元できます (ja:312) | today |
| sup.remove | Remove supports | 移除支撐 (zh:44) | サポートを削除 (ja:43) | today |
| sup.remove.hint | Remove the supports of the selected objects. Models and manual edits are kept | 移除選取物件的支撐。模型與手動編輯會保留 (zh:317) | 選択したオブジェクトのサポートを削除します。モデルと手動編集は残ります (ja:313) | today |
| mode.title | Modes | 模式 | モード | **[new]** |
| mode.edit | Edit supports | 編輯支撐 (zh:35) | サポート編集 (ja:34) | today key, now the button label |
| mode.edit.hint | Add or remove supports by clicking | 點擊以新增或移除支撐 | クリックでサポートを追加・削除 | **[change]** drops "(Tab)" (zh:47, ja:46) |
| mode.exitEdit | Exit Support Edit Mode | 離開支撐編輯模式 (zh:37) | サポート編集モードを終了 (ja:36) | today |
| mode.exitEdit.hint | Finish editing supports (Esc) | 結束支撐編輯（Esc） | サポート編集を終了します（Esc） | **[change]** drops "or Tab" (zh:312, ja:308) |
| mode.zones | No-support zones | 免支撐區 (zh:276) | サポート禁止エリア (ja:272) | today key, now the button label |
| zones.state | Painted / None | 已塗刷 / 無 (zh:277, 160) | 塗装済み / なし (ja:273, 156) | today |
| mode.zones.hint | Paint areas of the model where automatic supports must not grow | 在模型上塗刷不要長出自動支撐的區域 (zh:314) | 自動サポートを付けたくないモデルの領域を塗ります (ja:310) | today |
| mode.exitZones | Exit no-support zones | 離開免支撐區 (zh:38) | サポート禁止エリアの塗装を終了 (ja:37) | today |
| mode.exitZones.hint | Finish painting zones (Esc or Enter) | 結束塗刷區域（Esc 或 Enter） (zh:324) | エリアの塗装を終了します（Esc または Enter） (ja:320) | today |
| sel.first | Select an object first. | 請先選取一個物件。 (zh:40) | 先にオブジェクトを選択してください。 (ja:39) | today |
| chk.title | Check supports | 檢查支撐 (zh:191) | サポートを確認 (ja:187) | today |
| chk.run | Check for unsupported spots | 檢查缺少支撐的地方 (zh:192) | サポートのない箇所を確認 (ja:188) | today |
| chk.help | Finds islands and overhangs no contact reaches, before you print. | 列印前找出接觸點覆蓋不到的孤島與懸空區域。 (zh:198) | 印刷前に、接触点が届かないアイランドとオーバーハングを見つけます。 (ja:194) | today |
| chk.kind | Island / Uncovered overhang | 孤島 / 未支撐的懸空 (zh:193, 194) | アイランド / サポートのないオーバーハング (ja:189, 190) | today |
| chk.inZone | in a no-support zone | 位於免支撐區 (zh:195) | サポート禁止エリア内 (ja:191) | today |
| chk.showMe | Show me | 查看位置 (zh:318) | 場所を表示 (ja:314) | today |
| chk.showMe.hint | Frame the camera on this spot | 把鏡頭對準這個位置 (zh:319) | この位置にカメラを合わせます (ja:315) | today |
| chk.fix | Fix | 修正 (zh:197) | 修正 (ja:193) | today |
| chk.fix.hint | Open Support Edit Mode on this object to add supports here | 在這個物件上開啟支撐編輯模式，於此處加支撐 (zh:320) | このオブジェクトでサポート編集モードを開き、ここにサポートを追加します (ja:316) | today |
| chk.more | and {n} more | 及另外 {n} 個 (zh:56) | ほか {n} 個 (ja:55) | today |
| lock.edit | Finish editing supports first: press Esc or Done. | 請先完成支撐編輯：按 Esc 或「完成」。 (zh:107) | 先にサポート編集を終了してください：Esc か「完了」を押します。 (ja:104) | today string, new use as lock note |
| lock.zones | Finish painting zones first: press Esc or Done. | 請先完成塗刷免支撐區：按 Esc 或「完成」。 (zh:293) | 先にエリアの塗装を終了してください：Esc か「完了」を押します。 (ja:289) | today string, new use as lock note |
| vp.view | View (group label) | 檢視 (zh:141) | 表示 (ja:137) | today |
| vp.tips | Tips only | 僅支撐頭 (zh:138) | 先端のみ (ja:134) | today |
| vp.tips.hint.off | Show only the contact tips: no pillars, braces or raft. Turns on by itself below the plate. Export stays full. | 只顯示接觸點的支撐頭：不顯示支撐柱、加強桿與底筏。鏡頭轉到底板下方時會自動開啟。匯出仍為完整支撐。 (zh:137) | 接触点の先端のみ表示：支柱・補強材・ラフトは非表示。プレートの下から見ると自動でオンになります。書き出しは常にフル。 (ja:133) | today |
| vp.tips.hint.on | Only contact tips show. Turns on by itself below the plate; click to switch off. Export stays full. | 目前只顯示接觸點的支撐頭。鏡頭轉到底板下方時會自動開啟；點一下即可關閉。匯出仍為完整支撐。 (zh:142) | 接触点の先端のみ表示中。プレートの下から見ると自動でオンになります。クリックでオフにできます。書き出しは常にフル。 (ja:138) | today |
| vp.tips.hint.forced | While painting no-support zones only the contact tips show, so the surface stays visible. | 塗刷免支撐區時只顯示接觸點的支撐頭，讓表面保持可見。 (zh:140) | サポート禁止エリアを塗る間は接触点の先端のみ表示し、表面が見えるようにします。 (ja:136) | today |
| vp.fit | Fit view | 符合視圖 (zh:135) | ビューに合わせる (ja:131) | today |
| vp.fit.hint | Frame the selection from the current angle | 以目前角度框住所選物件 (zh:136) | 現在の角度で選択をフレームに収める (ja:132) | today |
| vp.bottom | Bottom view | 底視圖 (zh:134) | 下面図 (ja:130) | today |
| vp.bottom.hint | Look straight up at the selection to check contact points | 從正下方往上看所選物件，檢查接觸點 (zh:143) | 選択したオブジェクトを真下から見上げて接触点を確認 (ja:139) | today |
| vp.nothing | Nothing selected | 未選取任何物件 (zh:46) | 未選択 (ja:45) | today |
| vp.note | Millimetres. Build plate at zero. | 單位為公釐，底板位於零點。 (zh:48) | 単位はミリ。ビルドプレートは高さ 0。 (ja:47) | today |
| vp.drop | Drop to import | 放開即可匯入 (zh:45) | ドロップして読み込む (ja:44) | today |
| job.title | Background work (region label) | 背景工作 (zh:430) | バックグラウンド処理 (ja:426) | today |
| job.cancel | Cancel | 取消 (zh:431) | キャンセル (ja:427) | today |
| job.dismiss | Dismiss | 關閉 (zh:432) | 閉じる (ja:428) | today |
| toast.undo.hint | Undo this action | 復原這個動作 (zh:336) | この操作を元に戻します (ja:332) | today |
| badge.edit | Support Edit Mode | 支撐編輯模式 (zh:49) | サポート編集モード (ja:48) | today |
| badge.add | Click the model to add supports | 點擊模型以新增支撐 (zh:210) | モデルをクリックしてサポートを追加 (ja:206) | today |
| badge.click | Click supports to select or unselect | 點選支撐以選取或取消選取 | サポートをクリックして選択・選択解除 | **[new]** replaces "Click supports to select" (zh:211, ja:207) |
| badge.drag | Drag over supports to select | 在支撐上拖曳以選取 (zh:212) | サポートをなぞって選択 (ja:208) | today |
| badge.dragUnselect | Drag over supports to unselect | 在支撐上拖曳以取消選取 | サポートをなぞって選択解除 | **[new]** (shown while Unselect is effective, switch or Shift) |
| edit.tool | Edit tool (group label) | 編輯工具 (zh:200) | 編集ツール (ja:196) | today |
| edit.add | Add supports | 新增支撐 (zh:201) | サポート追加 (ja:197) | today |
| edit.add.hint | Click the model to add a support; right-click or Ctrl+click a support to remove it | 點擊模型新增支撐；右鍵或 Ctrl+點擊支撐即可移除 (zh:325) | モデルをクリックでサポートを追加。サポートを右クリックまたは Ctrl+クリックで削除します (ja:321) | today |
| edit.select | Select supports | 選取支撐 (zh:202) | サポート選択 (ja:198) | today |
| edit.select.hint | Pick supports to delete several at once | 選取多個支撐，一次刪除 (zh:326) | 複数のサポートを選んで一度に削除します (ja:322) | today |
| rp.eraseRadius | Click reach (was Remove radius) | 點擊範圍 | クリック範囲 | today key, new label and placement **[change]**; zh:411, ja:407 retire |
| rp.eraseRadius.hint | How far from a support a right-click (or Ctrl+click in Add supports) may land and still pick it. Only that one support is removed | 右鍵點擊（或在「新增支撐」中按 Ctrl+點擊）離支撐多遠仍算選中。只會移除那一個支撐 | サポートからどれだけ離れて右クリック（「サポートを追加」では Ctrl+クリック）しても選べるかの距離です。削除されるのはそのサポートだけです | **[change]** (zh:412, ja:408 retire) |
| unit.mm | {n} mm | {n} mm (zh:208) | {n} mm (ja:204) | today |
| edit.how | How to select (group label) | 選取方式 (zh:203) | 選択方法 (ja:199) | today |
| edit.click | Click | 點選 (zh:50) | クリック (ja:49) | today |
| edit.click.hint | Click a support to select it; click it again to unselect | 點擊支撐即可選取，再點一次取消選取 | サポートをクリックで選択、もう一度クリックで選択解除 | **[new]** replaces "Click supports one at a time to select them" (zh:327, ja:323) |
| edit.dragOver | Drag over | 拖曳選取 (zh:204) | なぞって選択 (ja:200) | today |
| edit.dragOver.hint | Drag over supports to select many at once, starting anywhere in the view | 拖曳經過支撐，一次選取多個；可從檢視中任何位置開始 (zh:328) | サポートをなぞって、まとめて選択します。ビューのどこからでも始められます (ja:324) | today |
| edit.dragging | Dragging over supports (group label) | 拖曳經過支撐時 (zh:205) | サポートをなぞったとき (ja:201) | today |
| edit.dragSelect | Select | 選取 (zh:32) | 選択 (ja:31) | today |
| edit.dragSelect.hint | Dragging adds supports to the selection | 拖曳時把支撐加入選取 (zh:329) | なぞったサポートを選択に追加します (ja:325) | today |
| edit.dragUnselect | Unselect | 取消選取 (zh:206) | 選択解除 (ja:202) | today |
| edit.dragUnselect.hint | Dragging takes supports out of the selection | 拖曳時把支撐移出選取 (zh:330) | なぞったサポートを選択から外します (ja:326) | today |
| edit.shift | Hold Shift to unselect | 按住 Shift 可取消選取 | Shift を押している間は選択解除 | **[new]**; while Unselect is the switch value it reads "Hold Shift to select" / 按住 Shift 可選取 / Shift を押している間は選択 **[new]** |
| edit.circle | Circle size | 圓圈大小 (zh:207) | 円のサイズ (ja:203) | today |
| unit.px | {n} px | {n} px (zh:332) | {n} px (ja:328) | today |
| edit.circle.hint | Radius of the circle around the pointer, in screen pixels: supports it passes over are selected | 游標周圍圓圈的半徑（螢幕像素）：圓圈經過的支撐會被選取 (zh:331) | ポインター周りの円の半径（画面のピクセル）：円が通ったサポートが選択されます (ja:327) | today |
| kbd.rightClick | Right-click | 右鍵 (zh:51) | 右クリック (ja:50) | today |
| kbd.remove | remove | 移除 (zh:52) | 削除 (ja:51) | today |
| kbd.undo | undo | 復原 (zh:53) | 元に戻す (ja:52) | today |
| sel.count | {n} selected | 已選取的 {n} 個 (zh:20) | 選択中の {n} 個 (ja:19) | today |
| sel.clear | Clear selection | 清除選取 (zh:209) | 選択をクリア (ja:205) | today |
| sel.clear.hint | Unselect every support at once (Esc). Undo on the notice brings the selection back | 立即取消選取所有支撐（Esc）。按通知上的「復原」可找回選取 (zh:335) | すべてのサポートの選択をすぐに解除します（Esc）。通知の「元に戻す」で選択を復元できます (ja:331) | today |
| sel.delete.hint | Delete the selected supports (Delete key). Undo brings them back | 刪除選取的支撐（Delete 鍵）。復原可找回 (zh:334) | 選択したサポートを削除します（Delete キー）。「元に戻す」で復元できます (ja:330) | today |
| done | Done | 完成 (zh:54) | 完了 (ja:53) | today |
| edit.done.hint | Finish editing supports (Esc or Enter) | 結束支撐編輯（Esc 或 Enter） (zh:313) | サポート編集を終了します（Esc または Enter） (ja:309) | today |
| badge.zones | Painting no-support zones | 正在塗刷免支撐區 (zh:281) | サポート禁止エリアを塗装中 (ja:277) | today (frame and badge fill become red, 7.1) |
| zones.brush | Zone brush (group label) | 區域筆刷 (zh:282) | エリアブラシ (ja:278) | today |
| zones.paint | Paint | 塗刷 (zh:283) | 塗る (ja:279) | today |
| zones.paint.hint | Paint no-support zones on the model | 在模型上塗刷免支撐區 (zh:321) | モデルにサポート禁止エリアを塗ります (ja:317) | today |
| zones.erase | Erase | 擦除 (zh:284) | 消す (ja:280) | today |
| zones.erase.hint | Erase no-support zones from the model | 從模型上擦除免支撐區 (zh:322) | モデルからサポート禁止エリアを消します (ja:318) | today |
| zones.size | Brush size | 筆刷大小 (zh:285) | ブラシサイズ (ja:281) | today |
| zones.size.hint | Radius of the zone brush | 區域筆刷的半徑 (zh:323) | エリアブラシの半径 (ja:319) | today |
| zones.hidden | {n} supports hidden by zones | {n} 個支撐被免支撐區隱藏 | {n} 本のサポートがエリアにより非表示 | **[new]** |
| zones.note | Supports attach underneath: turn the view (Bottom view) to paint where they are. | 支撐多半接在下方：轉動檢視（底視圖）即可在支撐所在處塗刷。 (zh:139) | サポートは主に下側に付きます：ビューを回して（下面図）、サポートのある場所を塗ります。 (ja:135) | today |
| zones.clearAll | Clear all zones | 清除全部區域 (zh:286) | すべてのエリアを消去 (ja:282) | today |
| zones.clearAll.hint | Clear every no-support zone of this object at once. Undo brings them back | 立即清除此物件所有的免支撐區。復原可找回 (zh:315) | このオブジェクトのサポート禁止エリアをすべてすぐに消去します。「元に戻す」で復元できます (ja:311) | today |
| zones.done.hint | Finish painting zones (Esc or Enter) | 結束塗刷區域（Esc 或 Enter） (zh:324) | エリアの塗装を終了します（Esc または Enter） (ja:320) | today |

Strings retired by this document **[change]** (keys can be deleted once unused): the "(Tab)" and "or Tab" parts of the two mode hints, the old Click reach label and hint (zh:411, 412, ja:407, 408), "Enter Support Edit
Mode" (zh:36, ja:35), "Paint zones" (zh:278, ja:274), "Clear" (zh:279, ja:275; compact zones button),
"Add or remove supports by clicking the model. Tab toggles." (zh:39, ja:38), "Paint where supports
must not grow. Manual supports stay." (zh:280, ja:276), "Edit no-support zones →" (zh:287, ja:283),
"Switch to painting no-support zones; Done comes back here" (zh:333, ja:329), "Click supports to
select" (zh:211, ja:207), "Click supports one at a time to select them" (zh:327, ja:323). Glossary
`ZONE_TEXTS` must drop the retired zone strings.

#### 6.3 Right panel (inventory, unchanged)

| en | zh-Hant | ja | Source |
|---|---|---|---|
| Support settings | 支撐設定 (zh:55) | サポート設定 (ja:54) | App.tsx:902 |
| and {n} more | 及另外 {n} 個 (zh:56) | ほか {n} 個 (ja:55) | App.tsx:902 |
| Select an object to edit its settings. Changes apply to every selected object. | 選取物件以編輯設定。變更會套用到所有選取的物件。 (zh:57) | オブジェクトを選択すると設定を編集できます。変更は選択中のすべてのオブジェクトに適用されます。 (ja:56) | App.tsx:903 |
| Preset · Light · Middle · Heavy · Custom | 預設組合 · 輕型 · 中型 · 重型 · 自訂 | プリセット · ライト · ミドル · ヘビー · カスタム | SettingsPanel.tsx:152, 174–177 |
| Lift height | 抬升高度 | リフト高さ | SettingsPanel.tsx:180 |
| Roof / cage · Off · Roof · Cage | 屋頂／保護籠 · 關閉 · 屋頂 · 保護籠 | ルーフ／ケージ · オフ · ルーフ · ケージ | SettingsPanel.tsx:153, 182–184 |
| Auto placement: Support spacing, Overhang angle, Downward faces, Islands, Reinforce overhang edges, Ridge angle, Tree supports | 自動配置：支撐間距、懸空角度、朝下的面、孤島、加強懸空邊緣、稜線角度、樹狀支撐 | 自動配置：サポート間隔、オーバーハング角度、下向きの面、アイランド、オーバーハングの縁を補強、稜線角度、ツリーサポート | SettingsPanel.tsx:42–49 |
| Tree supports: Merge distance, Branch descent, Section increment, Safe distance | 樹狀支撐：合併距離、分支下降距離、截面遞增、安全距離 | ツリーサポート：結合距離、枝の下降距離、断面の増分、安全距離 | SettingsPanel.tsx:53–57 |
| Contact tip: Contact shape (None / Sphere), Tip section (Round / Square / Cross), Plate width, Tip profile (Tapered / Straight), Point Ø, Contact Ø, Penetration, Contact depth, Upper Ø, Connection length, Connection angle | 接觸頭：接觸形狀（無／球形）、支撐頭截面（圓形／方形／十字）、板寬、支撐頭外形（漸細／直筒）、尖端直徑、接觸點直徑、嵌入深度、接觸深度、上段直徑、連接長度、連接角度 | 接触先端：接触形状（なし／球）、先端の断面（丸／角／十字）、板の幅、先端の形（テーパー／ストレート）、先端径、接触径、食い込み深さ、接触深さ、上部径、接続長さ、接続角度 | SettingsPanel.tsx:61–72 |
| Pillar: Middle Ø | 支撐柱：中段直徑 | 支柱：中部径 | SettingsPanel.tsx:75 |
| Foot: Bottom Ø, Bottom thickness | 底座：底部直徑、底部厚度 | 基部：下部径、下部の厚さ | SettingsPanel.tsx:77–79 |
| Bracing: Bracing, Bracing Ø, Bracing angle, Bracing spacing, Start height, Top spacing, Distance limit | 加強桿：加強桿、加強桿直徑、加強桿角度、加強桿間距、起始高度、頂部間距、距離上限 | 補強材：補強材、補強材の径、補強材の角度、補強材の間隔、開始高さ、上端の間隔、距離の上限 | SettingsPanel.tsx:83–90 |
| Raft: Raft, Expand width, Floor thickness, Wall height, Wall thickness, Wall angle, Voxel resolution | 底筏：底筏、外擴寬度、底板厚度、圍牆高度、圍牆厚度、圍牆角度、體素解析度 | ラフト：ラフト、拡張幅、床の厚さ、壁の高さ、壁の厚さ、壁の角度、ボクセル解像度 | SettingsPanel.tsx:94–101 |
| Roof: Gap above model, Column count, Column Ø, Cross bars, Cross bar Ø, Roof braces, Brace Ø, Brace angle, Roof thickness, Solid roof | 屋頂：與模型頂部間距、立柱數量、立柱直徑、交叉斜撐、交叉斜撐直徑、屋頂加強桿、加強桿直徑、加強桿角度、屋頂厚度、實心屋頂 | ルーフ：モデル上方の隙間、柱の本数、柱の径、筋交い、筋交いの径、ルーフの補強材、補強材の径、補強材の角度、ルーフの厚さ、閉じたルーフ | SettingsPanel.tsx:105–115 |
| Cage: Gap to model, Height above model, Ring spacing, Ring Ø, Column count, Column Ø, Cross bars, Cross bar Ø | 保護籠：與模型間距、高出模型的高度、橫環間距、橫環直徑、立柱數量、立柱直徑、交叉斜撐、交叉斜撐直徑 | ケージ：モデルとの隙間、モデル上方の高さ、リングの間隔、リングの径、柱の本数、柱の径、筋交い、筋交いの径 | SettingsPanel.tsx:119–127 |
| Letter label: Letter label, Letter (placeholder "auto (A)"), Letter size, Emboss height, Pad margin, Offset X, Offset Y | 字母標籤：字母標籤、字母（自動）、字母大小、浮雕高度、底墊邊距、X 偏移、Y 偏移 | 文字ラベル：文字ラベル、文字（自動）、文字サイズ、浮き出し高さ、台座の余白、X オフセット、Y オフセット | SettingsPanel.tsx:131–138 |
| Advanced: Preview mode (Full / Only tip), Low poly mode, Resolution, Auto snap, Click reach (was Remove radius) | 進階：預覽模式（完整／僅支撐頭）、低面數模式、解析度、自動吸附、點擊範圍 | 詳細：プレビューモード（フル／先端のみ）、ローポリモード、解像度、自動スナップ、クリック範囲 | SettingsPanel.tsx:142–147, 203 |
| Export STL | 匯出 STL (zh:58) | STL を書き出す (ja:57) | App.tsx:913 |
| Active object with model · Active object, supports only · Each object with model · Each object, supports only · Whole plate in one file | 目前物件（含模型）· 目前物件（僅支撐）· 每個物件（含模型）· 每個物件（僅支撐）· 整個底板匯出為單一檔案 (zh:59–63) | アクティブなオブジェクト（モデル付き）· アクティブなオブジェクト（サポートのみ）· オブジェクトごと（モデル付き）· オブジェクトごと（サポートのみ）· プレート全体を 1 ファイルに (ja:58–62) | App.tsx:73–79 |
| Exports match the viewport at full resolution. Source models are never changed. | 匯出內容與檢視畫面一致並使用完整解析度。原始模型不會被修改。 (zh:64) | 書き出しはビューと同じ内容をフル解像度で出力します。元のモデルは変更されません。 (ja:63) | App.tsx:915 |

Field hints (one per field) are unchanged and live next to each field in SettingsPanel.tsx:43–147
(group hints at 173, 181; preset / roof hints at 155–160).

#### 6.4 Footer, status line and badge per state

| State | Badge (viewport) | Status line on entry / change | zh-Hant | ja |
|---|---|---|---|---|
| setup | — (object name) | Drop STL, GLB or glTF files to begin. Every mesh becomes an object. (start) | 拖放 STL、GLB 或 glTF 檔案即可開始。每個網格都會成為一個物件。 (zh:87) | STL・GLB・glTF ファイルをドロップして開始します。メッシュごとにオブジェクトになります。 (ja:84) |
| edit / add | Support Edit Mode · {object} · Click the model to add supports | Support Edit Mode: click the model to add, right-click a support to remove. | 支撐編輯模式：點擊模型新增，右鍵點擊支撐移除。 (zh:104) | サポート編集モード：モデルをクリックで追加、サポートを右クリックで削除。 (ja:101) |
| edit / select / click | … · Click supports to select or unselect **[new]** | Support Edit Mode: click supports to select them, right-click a support to remove. | 支撐編輯模式：點擊支撐即可選取，右鍵點擊支撐移除。 (zh:105) | サポート編集モード：サポートをクリックで選択、サポートを右クリックで削除。 (ja:102) |
| edit / select / dragOver | … · Drag over supports to select / to unselect **[new]** | Support Edit Mode: drag the circle over supports to select them. Supports hidden behind the model are skipped. | 支撐編輯模式：拖曳圓圈經過支撐即可選取。被模型擋住的支撐不會選到。 (zh:106) | サポート編集モード：円をサポートの上でなぞって選択。モデルに隠れたサポートは選ばれません。 (ja:103) |
| zones | Painting no-support zones · {object} · {n} supports hidden by zones **[new]** | Paint where supports must not grow; drag on the model. | 在不要長出支撐的地方塗刷：在模型上拖曳。 (zh:288) | サポートを付けたくない場所を塗ります：モデル上をドラッグします。 (ja:284) |
| edit → setup | — | Support edits kept. | 已保留支撐編輯。 (zh:102) | サポートの編集を保持しました。 (ja:99) |
| zones → setup | — | No-support zones kept. | 已保留免支撐區。 (zh:291) | サポート禁止エリアを保持しました。 (ja:287) |
| edit, object has no supports yet | as edit / add | No supports on {object} yet. Click the model to add one, or exit and Generate. **[new]** | {object} 還沒有支撐。點擊模型新增，或離開後按「產生支撐」。 | {object} にサポートはまだありません。モデルをクリックで追加するか、終了して生成してください。 |
| refused entry, no object | — | Select an object to edit its supports. / Select an object first. | 請選取一個物件來編輯它的支撐。 (zh:103) / 請先選取一個物件。 (zh:40) | サポートを編集するオブジェクトを選択してください。 (ja:100) / 先にオブジェクトを選択してください。 (ja:39) |
| refused entry, heavy | — | Too detailed to edit by hand ({n} triangles). Generate and export still use the full model. | 模型過於精細，無法手動編輯（{n} 個三角面）。產生與匯出仍使用完整模型。 (zh:443) | モデルが細かすぎるため手動では編集できません（三角形 {n} 個）。生成と書き出しは完全なモデルで行われます。 (ja:439) |

Footer counts: "1 object / {n} objects" (zh:65, 66; ja:64, 65), "{n} triangles" (zh:67, ja:66),
"{auto} automatic, {manual} manual, {removed} removed" (zh:68, ja:67). Other status lines (import,
placement, check, export, errors) are unchanged: `src/editing/status.ts`, `src/editing/errors.ts`,
App.tsx handlers.

---

### 7. Visual rules (mixo-app-style)

> **Superseded.** The roles below still describe *how many* of each thing a view may have (one primary per
> view, destructive never filled, one mode chrome) and that part holds. The *values* do not: the app's
> default theme is the instrument theme. See `DESIGN.md` section 2 for the colours in use and
> `docs/ui-styling.md` for the token table the tests enforce.

#### 7.1 Colours by role

| Role | Token / value | Used for |
|---|---|---|
| Primary | `--red #7f0019`, hover `--red-hover #96102b`, white text | Generate (setup), Done (edit and zones). One per view. |
| Primary, Regenerate | `--blue #1d3461`, hover `#284579` (app token, owner's call) | Generate once every object in scope has supports. |
| Pressed / chosen | ink fill `--ink #3b3631`, paper text | Segment chosen, Tips only on, left-panel Exit buttons, tool buttons. |
| Destructive | `--danger #b3261e` outline + text, transparent fill; hover sunken | Delete (objects, supports), Remove supports, Clear manual edits, Clear all zones. Never filled. |
| Secondary | surface `#fbfaf7`, 1 px `--line #dcd7cd`, hover `--line-strong` + white | Everything else. |
| Surfaces | paper `#f4f2ed`, surface `#fbfaf7`, sunken `#ebe8e1`, viewport `#e9e6df` | App and panels, raised controls, hover and group heading bands. |
| Text | ink `#3b3631`, muted `#8a847a` | Body; captions, counts, units, help lines. |
| Mode chrome (both modes) | frame 1 px `--red`; badge fill `--red`, text surface | Support Edit Mode and No-support zones. mixo-app-style gives every tool mode a red hairline frame; the badge text tells the modes apart, and blue stays the zone layer on the model **[change, confirm]**. |
| Altered-support mark | a ring around the tip marker (shape cue, readable in grey scale), never a new hue | Supports with an override, Support Edit Mode only (11.2 rule 7). |
| 3D marks | behaviour spec §6 (selected supports `#a8243c`, preview `#7f0019` @ 0.45, zone layer `#1d3461` @ 0.7 / 0.3, check markers `#b3261e` / `#d97706`) | Content, not UI accent. |
| Drag over circle | Select: 1.5 px `--red` border, red 8 % fill; Unselect: 1.5 px `--ink` border, ink 8 % fill, plus a "−" badge at the cursor **[new]** | Instant feedback when Shift flips the action. |

#### 7.2 Focus-mode dimming (locked regions)

| Property | Value | Why |
|---|---|---|
| `inert` | on each locked section (not on the panel when it holds the live Exit button) | Removes the subtree from tab order, pointer hits and the accessibility tree in one attribute. |
| `opacity` | `.45` on locked sections | Clearly weaker than a disabled button (`.55`), still readable to orient. |
| `transition` | `opacity var(--dur)` (0.15 s); none under `prefers-reduced-motion` | Matches the house duration. |
| `pointer-events` | implied by `inert`; the required click catcher is a transparent `div` with `aria-hidden="true"` | A click on a locked area repeats the lock note in the status line and pulses the note. |
| `aria-disabled` | not used for locked regions (only for Tips only while forced, today) | `inert` already hides them; `aria-disabled` is for a focusable control that explains itself. |
| Lock note | full opacity, `--fs-sm`/11.5 px muted ink, sticky at the panel top, not inert | Says why and how out. |
| Exit button in a locked left panel | full opacity, pressed (ink fill, paper text), never red | Red stays Done alone. |
| Cursor | default over locked regions (no `not-allowed` wall) | `inert` content takes no hover anyway. |

#### 7.3 Viewport chrome

- Frame: `position: absolute; inset: 0; border: 1px solid var(--red)`; `pointer-events: none` (both modes).
- Badge: top-left, same height and text size as the bar buttons (13 px, 8 × 12 px padding), red
  fill, `role="status"`; parts: mode name, object name (80 % opacity), what a click does (500).
- Bar: surface background, 1 px `--line-strong`, 2 px radius, no shadow, rows right-aligned:
  row 1 tool, row 2 tool options (stacked under their parent button where the parent owns them),
  row 3 key hints, row 4 actions + Done. Done is always last and right-most.
- Tool choice buttons (Click | Drag over): 40 px tall, 19 px icon, 13 px / 500 text, ink when pressed
  (behaviour spec §7).
- Hit areas ≥ 24 px (sliders 24 px; buttons ≥ 28 px); 40 px on coarse pointers.

#### 7.4 Typography and density

Today the app runs a roomier density than `tokens.css` (header 56 px vs 32, panels 268 / 300 vs
220 / 240, buttons 13 px vs 11.5). The brush-up keeps today's sizes (they are what the 1366 × 768
wireframes assume); moving to the Dense tokens is a separate decision.

#### 7.5 Group headings

`.panel h3`: ink, 700, tracked .06em, on a sunken band (today). The Modes group uses the same band.

#### 7.6 Fit in three languages

The longest labels at 268 px panel width: "Exit no-support zones" ja サポート禁止エリアの塗装を終了 (one
line, full-width button, today), "Check for unsupported spots" ja サポートのない箇所を確認. The edit bar
at 1366 px keeps its rows; the new Select / Unselect + Circle size row and "Hold Shift to unselect"
must be measured in ja before merge.

---

### 8. Accessibility and keyboard

#### 8.1 Focus order

Header (language, Undo, Redo, Hide models, Wireframe) → left panel (Import, objects, Select all,
Delete, Transform, Generate, Clear manual edits, Remove supports, Edit supports, No-support zones,
Check, findings) → viewport (view toggles; in a mode: the bar in reading order tool → options →
actions → Done; job list; toast) → right panel → footer has no focusable controls.

#### 8.2 Mode entry and exit

- Entering a mode moves focus to the bar's pressed tool button (Add supports / Paint), so a keyboard
  user lands where the next action is; the status line announces the tool line.
- Exiting returns focus to the left Modes button that entered (now reading its entry label again).
- Tab is not a mode key any more **[change]**: `keys.ts:53` calls `preventDefault` on every Tab, which breaks
  focus navigation. Tab and Shift+Tab move focus as the browser does, within live regions only, since
  locked sections are inert.

#### 8.3 Inert panels

- Locked sections carry `inert`; screen readers skip them. The lock note is outside the inert
  subtree and readable.
- The live Exit button keeps `aria-pressed="true"` and its hint as `aria-description`.
- Tips only while forced: focusable, `aria-pressed="true"`, `aria-disabled="true"`, hint says why
  (today).

#### 8.4 Live regions

| Region | Role | Announces |
|---|---|---|
| Footer status line | `role="status"`, `aria-live="polite"` | Every step result and error (today). |
| Mode badge | `role="status"` | Mode, object and tool wording when it changes (today). |
| Undo toast region | `role="status"`, `aria-live="polite"`, always present | "… cleared · Undo" (today). |
| Job activity | visually hidden polite region | Each job once, each failure once (today). |

#### 8.5 Keyboard summary

Key table: behaviour spec §2, plus Shift held in Drag over (5.8). Every key path has a visible
control (P7). Keys typed into text and number fields are ignored by the app (today).

#### 8.6 Keyboard rules revised

- Tab is never captured (8.2).
- Esc inside any input, slider, select or textarea only affects that control (revert, blur,
  commit); it never reaches the mode (4.3).
- Range and checkbox inputs do not swallow Delete and Esc: today every INPUT is exempt from the
  editor's keys (keys.ts:47), and a range keeps focus after pointerup (RangeField.tsx:24), so
  Delete and Esc do nothing until the user clicks elsewhere. Exempt only fields that take typed text
  (text, number, search, email, textarea); `KeyTarget` gains `type`. Blur a range after pointerup as well.

---

### 9. What changes vs today, and the Babylon port

#### 9.1 Diff list

| # | Change | Code today | Effort |
|---|---|---|---|
| D1 | Left panel order: Import, Objects, Transform, Supports, Modes, Check | App.tsx:815–850 | small |
| D2 | One group "Modes" with two buttons; labels "Edit supports" / "No-support zones"; Exit labels kept; Painted / None as muted state word | ModeEntry.tsx:13–36, modeButtons.ts:17–28 | small |
| D3 | Remove left-panel zones "Clear" | ModeEntry.tsx:32 | small |
| D4 | Remove "Edit no-support zones →"; delete `zonesReturn`, `openZones.from` | EditBar.tsx:66, session.ts:12–13, 56–57, 97–99; modeButtons.ts:28 | small |
| D5 | Remove the viewport "Edit supports" button; view toggles to top 12 px outside a mode | ModeEntry.tsx:39–45, App.tsx:895, styles.css:215–228 | small |
| D6 | Remove the header Generate **[confirm]** | App.tsx:811 | small |
| D7 | Region lock: edit → left locked except Exit; zones → both panels locked except left Exit; lock notes; inert; dimming | new (App.tsx shell + styles) | medium |
| D8 | Refuse file drops in a mode **[confirm]** | App.tsx:779–783, 497 | small |
| D9 | Add tool: Click reach number field (was Click reach) bound to `eraseRadius` | EditBar.tsx (new row), SettingsPanel.tsx:147 kept | small |
| D10 | Select tool: Select / Unselect switch moves directly under Drag over next to Circle size; Shift held flips it; circle and cursor badge follow; badge text per effective action | EditBar.tsx:44–60, CirclePreview.tsx, useScreenBrush.ts, styles.css:538–544 | medium |
| D11 | Click method copy: badge and hint say click toggles; the Shift+click clause is dropped (pick.ts:57 already toggles regardless of modifiers) | EditBar.tsx:15, 45; pick.ts:57 | small |
| D12 | Fix button secondary; Delete objects, Remove supports, Clear manual edits `.danger` | ProblemList.tsx:24, ObjectList.tsx:39, App.tsx:841–842 | small |
| D13 | Command registry + UI state machine as framework-free modules; components render from them | new `src/editing/commands.ts`, `uiMachine.ts` | large |
| D14 | Retire strings (6.2), add new strings (6.2, 11.7), update glossary `ZONE_TEXTS` | locales, glossary.ts:134–140 | small |
| D15 | Behaviour spec §1, §7 and ui-spec heuristics rows 3, 4 updated to the sibling modes | docs | small |
| D16 | Per-support settings and context-sensitive right panel **[feature]**; needs D17, D18 first | section 11.1 to 11.8 | large |
| D17 | Right-click is an exact deletion; retire `suppressed` with a one-time migration; Click reach is a pick tolerance | placement.ts:130-179, App.tsx:617-632, placement.test.ts:159 | medium |
| D18 | Remap automatic ids to unit-local once; drop runtime fuzzy matching | unitSupports.ts:169-193, placement.ts:162-178, jobRunner.ts:87 | medium |
| D19 | Keyboard: Tab no longer toggles a mode; Esc in an input only affects it; range and checkbox do not swallow Delete / Esc | keys.ts:47, 53; RangeField.tsx:24 | small |
| D20 | Zones frame and badge red (mixo-app-style); zones badge shows hidden count; locked-region click feedback required; header lock limited to scene commands; Clear all zones once, with Undo toast; settings edits coalesce | styles.css:215-228, App.tsx:557-559 | medium |

Unchanged: right panel layout and fields, Export STL placement, key and pick tables except the rows
above, stroke behaviour, 3D colours, camera numbers, job list, Undo toasts, number-field rules.

#### 9.2 Babylon port (mixomesh)

- **Framework-free core.** `uiMachine.ts` (state + reducer), `commands.ts` (registry records with
  pure `visible` / `enabled` / `pressed` and `run` returning an event or a scene command),
  `status.ts`, `keys.ts`, `pick.ts`, `selection.ts` import neither React nor three.js (the existing
  `core/imports.test.ts` rule extends to the new files).
- **Renderers.** React renders panels and bars from the registry today; mixomesh renders the same
  records with its own DOM panels or Babylon GUI. A renderer maps `surface` to a container and `role`
  to a class (`primary`, `danger`, pressed); it never contains a visibility rule.
- **Lock.** The renderer applies 4.4 per surface (`inert` + `.45` in DOM; in Babylon GUI,
  `isEnabled = false` + alpha `.45` on the panel containers, Exit kept enabled).
- **Pointer.** Shift state comes from the pointer event (`shiftKey`) on each move, so the effective
  drag action is known per stroke step without a global key listener.
- **Parity tests.** Port the registry table (section 5) as a data test: for each state in a fixed
  list, the set of visible and enabled command ids must match in both apps.

---

### 10. Stitch

#### 10.1 How this maps to Stitch

Stitch reads a design system from `DESIGN.md` at the repository root or `.stitch/DESIGN.md`
(six sections: visual theme, colours and roles, typography, components, layout, generation notes)
and uploads it with `stitch upload design DESIGN.md`. The root `DESIGN.md` in this repository is that
file, short and token-only, pointing here for structure. A pointer-only file would become the
project's design system, so the root file carries real tokens. Screen prompts below follow the
Stitch prompt shape (purpose, platform, numbered sections) and leave hex codes out, because a bound
design system governs styling; a tokens line is appended only when no design system is bound.

Workflow (owner approval first for binding and batch upload): `stitch status --flow=design --json`
→ owner confirms project → `stitch config set project <id>` → `stitch upload design DESIGN.md` →
`stitch generate screen --device DESKTOP --title "<title>" --prompt "<prompt>" --json` per screen.

#### 10.2 Screen prompts

**S1 — Setup (no mode)**

```text
Dense desktop editor for preparing resin 3D prints with support structures, for lay hobby printers. Flat, paper-like, hairline borders, no shadows, 2 px corners, one dark-red primary button per view.

PLATFORM: Web, desktop 1366 × 768.

PAGE STRUCTURE:
1. Header (56 px): wordmark "mixoDental" and caption "Resin Support Studio" on the left; on the right a three-segment language switch "EN | 中文 | 日本語", a button pair "Undo" "Redo", a divider, then "Hide models" and "Wireframe".
2. Left panel (268 px), sections each under a bold heading on a light grey band:
   - "Import models": dashed drop area with "Import models" and the caption "STL, GLB or glTF. Files stay on this device."
   - "Objects  3": three compact rows (letter badge, file name, support count); row A active with a small dark-red letter badge; buttons "Select all" and "Delete" (red outline).
   - "Transform": segmented "Select | Move | Rotate", Move chosen (dark fill).
   - "Supports for all 3": full-width primary "Generate supports", then "Clear manual edits" and "Remove supports" (both red outline).
   - "Modes": two full-width buttons "Edit supports" and "No-support zones" (muted word "None" at its right end).
   - "Check supports": button "Check for unsupported spots", a list of two findings (dot, "Island" / "Uncovered overhang", object name, buttons "Show me" and "Fix").
3. Viewport (centre, light warm grey): a 3D model on a gridded build plate with thin supports under it; object name "bust.stl" top left; three small word buttons "Tips only", "Fit view", "Bottom view" top right; caption "Millimetres. Build plate at zero." bottom right.
4. Right panel (300 px): title "Support settings  bust"; segmented "Preset: Light | Middle | Heavy | Custom"; number field "Lift height 5.0 mm"; segmented "Roof / cage: Off | Roof | Cage"; collapsible groups with left chevrons "Auto placement" (open, four fields), "Contact tip" (open), "Pillar", "Foot", "Bracing", "Raft", "Letter label", "Advanced"; section "Export STL" with five stacked buttons.
5. Footer (32 px): "3 objects", "412,330 triangles", "396 automatic, 16 manual, 2 removed", and a status message right-aligned.
```

**S2 — Support Edit Mode, Add tool**

```text
Same editor as S1 in Support Edit Mode for one object.

PAGE STRUCTURE:
1. Header: unchanged from S1.
2. Left panel: all sections faded to 45 % and not interactive, with a short note at the top "Finish editing supports first: press Esc or Done." In the "Modes" group the first button reads "Exit Support Edit Mode", shown pressed (dark fill, light text) and at full strength; "No-support zones" faded.
3. Viewport: a thin dark-red 1 px frame around the whole viewport; top-left a dark-red badge "SUPPORT EDIT MODE  bust.stl  Click the model to add supports"; top-right a light tool bar with hairline border: row 1 segmented "Add supports | Select supports" (Add chosen); row 2 a small number field "Click reach 1.5 mm"; row 3 key hints "Right-click / Ctrl+Click remove", "Ctrl+Z undo"; row 4 a dark-red primary "Done  Esc". View buttons "Tips only", "Fit view", "Bottom view" move to the bottom right. A translucent ghost support tip follows the cursor on the model.
4. Right panel: unchanged from S1 and fully usable.
5. Footer: status "Support Edit Mode: click the model to add, right-click a support to remove."
```

**S3 — Support Edit Mode, Select → Drag over with a selection**

```text
Same as S2 with the Select tool.

PAGE STRUCTURE:
1. Header and left panel: as S2.
2. Viewport: dark-red frame; badge "SUPPORT EDIT MODE  bust.stl  Drag over supports to select". Tool bar: row 1 "Add supports | Select supports" (Select chosen); row 2 label "How to select" and two large icon buttons "Click" (arrow icon) and "Drag over" (brush icon, chosen); directly under "Drag over" a small segmented "Select | Unselect" (Select chosen) beside a slider "Circle size 24 px", and a muted hint "Hold Shift to unselect"; row 3 "Right-click remove", "Ctrl+Z undo"; row 4 muted "37 selected", button "Clear selection", red-outline "Delete", dark-red primary "Done  Esc". On the model, selected supports are solid dark red; a thin red circle (8 % red fill) follows the pointer.
3. Right panel: title "Support settings  bust", a band "Settings for 37 selected" with a small "Reset to defaults" button and the line "Changes apply to the selected supports only."; object-wide fields (Preset, Lift height, Roof / cage, Auto placement, Tree supports, Bracing, Raft, Letter label, Advanced) faded; "Contact tip", "Pillar" and "Foot" open and usable, one field showing "—" for mixed values; "Export STL" usable.
4. Footer: status "Support Edit Mode: drag the circle over supports to select them. Supports hidden behind the model are skipped."
```

**S4 — No-support zones (focus mode)**

```text
Same editor in No-support zones mode, a focus mode.

PAGE STRUCTURE:
1. Header: unchanged.
2. Left panel: faded to 45 % with the note "Finish painting zones first: press Esc or Done." at the top; only the button "Exit no-support zones" (pressed, dark fill) is at full strength.
3. Right panel: entirely faded to 45 % with the same note at the top; nothing usable.
4. Viewport: thin dark-red 1 px frame; top-left a dark-red badge "PAINTING NO-SUPPORT ZONES  bust.stl  12 supports hidden by zones"; top-right tool bar: row 1 segmented "Paint | Erase" (Paint chosen) and a slider "Brush size 2.0 mm"; row 2 muted note "Supports attach underneath: turn the view (Bottom view) to paint where they are."; row 3 "Ctrl+Z undo", red-outline "Clear all zones", dark-red primary "Done  Esc". The model shows a translucent deep-navy painted patch; only the small support tips are drawn. Bottom right "Tips only" shown pressed, then "Fit view", "Bottom view".
5. Footer: status "Paint where supports must not grow; drag on the model."
```

Tokens line to append only when no design system is bound:
`Colours: paper #f4f2ed, surface #fbfaf7, sunken #ebe8e1, lines #dcd7cd / #c4bdb0, ink #3b3631, muted #8a847a, primary dark red #7f0019, zones deep navy #1d3461, destructive outline #b3261e. Font Zen Kaku Gothic New (zh-Hant: PingFang TC / Noto Sans TC). 2 px radius, no shadows, 1 px hairlines.`

> The prompt line above describes the paper theme. For a prompt against the app as it is, use the
> component prompts in `DESIGN.md` section 6, which carry the instrument palette and the two bundled faces.

#### 10.3 What must not be uploaded

- No project data: no STL / GLB / glTF files, no scene or settings JSON, no customer or owner models,
  no screenshots that show a real model (use the generic placeholder model of the prompts).
- No code, no `src/`, no locales files, no keys or tokens (`~/.config/gemini/api_key` and the like).
- UI only: `DESIGN.md`, generated or captured UI screens with placeholder content.
- Ask the owner before binding a Stitch project (`stitch config set project`) and before any batch
  upload (Stitch skill rule).

---

### 11. Prerequisite bugs, then the feature: context-sensitive right panel and per-support settings

**Status: 11.0 is built first; the feature (11.1 to 11.8) follows the layout work and needs
per-support override data in `PrintUnit` and `SupportJob`.** Owner and controller ruling of
2026-10-22, revised the same day after a four-model review and coordinator rulings (the earlier
"added supports freeze their settings" rule is dropped).

#### 11.0 Prerequisite bugs (fix before any per-support work)

Both are confirmed in code at `acd3f98`. Per-support settings hang on the identity of a support,
and today that identity is unreliable.

**(a) Right-click removal is radius-based and also erases manual supports added later.**

- Today: right-click calls `eraseNear`, which removes every contact within `eraseRadius` of the
  pick (App.tsx:624-632). An automatic contact becomes a `suppression/add` marker (App.tsx:617-621).
  `compose` then hides every contact within the radius of a marker, **manual contacts included**
  (placement.ts:139-179, the `manual.filter` at 179), and the test asserts it
  (placement.test.ts:159). So a support added at a removed spot vanishes while the status says
  "Support added." (App.tsx:613), and changing Click reach rewrites past removals.
- Fix: right-click is an exact deletion of the one hit support (the nearest contact within the pick
  tolerance; `manual/remove` for a manual one, a `deleted` id for an automatic one). `suppressed` is
  retired: `suppression/add` is no longer dispatched, and a one-time project migration turns each
  marker into the exact `deleted` ids of the automatic contacts it hides under the unit's saved
  radius, then empties `suppressed`. Manual supports that the old rule was hiding become visible
  again; the migration says so once ("{n} supports hidden by an old removal are back"). Click reach
  becomes the pick tolerance, renamed Click reach (3.3). `compose` loses the marker and radius
  branches; test 159 becomes "a manual support added at a removed spot stays".

**(b) Automatic ids encode turned-frame positions, but stored positions are unit-local.**

- Today: placement runs on the turned model (jobRunner.ts:87) and names each contact
  `auto-x_y_z` from that frame (placement.ts:183). `placementCommands` maps `position` and `normal`
  back to unit-local space but keeps the id (`...point`, unitSupports.ts:169-193). `compose`
  compares `positionFromId(id)` with unit-local positions (placement.ts:141, 166). On a rotated
  object the two frames differ, so radius matching and the nearest-deleted fuzzy match compare
  different frames. Not yet reproduced in the browser: do that first.
- Fix: in `placementCommands`, rewrite each id once from the unit-local position (same grammar) and
  store it exact. Drop the runtime fuzzy matching (the nearest-deleted loop, placement.ts:162-178):
  a stored id either names a contact or is stale. Old projects: `deleted` ids are remapped with the
  orientation of the last placement where it is stored, otherwise dropped and counted in the
  one-time notice. Test on a unit rotated 90 degrees.

Exact, unit-local ids are the key that overrides (11.4) and the Regenerate report (11.2 rule 8) use.

#### 11.1 Today (verified)

- One settings object per object: `PrintUnit.settings` (state/project.ts:29). A settings change
  writes `settings/set` to every target object (selected objects, else all) (App.tsx:521-525,
  515-519); placement keys schedule a regeneration (App.tsx:65-67, 432-440, 528).
- Every support of an object, automatic and manual, is built from that one object: `supportJobOf`
  passes `settings: resolveSettings(unit.settings)` and all contacts (`manual` included) in one job
  (unitSupports.ts:109-119, 74-76; `SupportJob.settings` core/jobs.ts:39). A manual contact stores
  only id, region, position, normal, source (core/analysis/types.ts:13-19).
- **So today: changing any right-panel value rebuilds every support of the object, manual supports
  included, from the object's settings.** Bracing is built across all columns of the object at once
  (core/supports/mesh.ts:225, `trussSegments` 456-480, which also reads `pillarDiameter`).
- The Check job reads only contact positions, the overhang angle and the spacing
  (`checkJobOf`, unitSupports.ts:127-136), so it needs no per-support settings.

#### 11.2 Rules

1. **One rule.** A support follows the object defaults unless the user explicitly edited it. Adding a
   support creates no override (any freeze-at-add idea is dropped). Editing a field on selected
   supports creates an override for that field.
2. **Sparse overrides.** Stored as a `Partial` of the shape keys, only the keys the user set.
   "Reset to defaults" drops the override. A later change of a default reaches every support that has
   no override for that key.
3. **Overridable keys** are the tip, contact, neck and foot shape keys: contact shape, tip section,
   plate width (Cross), tip profile, point Ø, contact Ø, penetration, contact depth, upper Ø,
   connection length, connection angle, bottom Ø, bottom thickness. **Pillar thickness stays
   object-wide** (trees, braces and raft share it).
4. **Tree merges.** A support with an override stays out of tree merges.
5. **Right panel header, live in every mode.** It always shows how far the defaults reach, for
   example **"Applies to 140 of 150 supports · 10 customised [Select them]"** (objects in scope: the
   selected objects, else the active one). With supports selected in Support Edit Mode it reads
   **"Settings for {n} selected"**, the number customised among them, and **Reset to defaults**.
   Changes then apply to the selected supports only, all get the same value, and a field whose values
   differ shows a dash placeholder until set. **Select them** selects the
   customised supports of the active object, or of the first selected object that has some when the
   active one has none; outside Support Edit Mode it enters the mode first **[confirm]**.
6. **Object-wide settings are disabled while supports are selected**, with a hint why: Preset, Lift
   height, Roof / cage, Auto placement, Tree supports, **Pillar** (middle Ø is shared), **Bracing**
   (object-wide in code: braces join neighbouring pillars, mesh.ts:225), Raft, Roof, Cage, Letter
   label, Advanced (preview mode, low poly, resolution, auto snap, Click reach).
7. **The altered mark is a shape cue, not a hue.** In Support Edit Mode a support with an override
   gets a small ring around its tip marker, visible in grey scale. Red stays "selected" and blue
   stays "no-support zone" (mixo-app-style: one meaning per colour).
8. **Regenerate never hides what it did to hand work.** After Regenerate the status line and an Undo
   toast say **"{n} customised kept, {m} reset"**. Kept: the override's contact id still names a
   contact. Reset: the id is gone, so the override is dropped (and counted). Nothing stays stored for
   an id that names no support. The same count covers exact removals whose id is gone.
9. **Export and project file carry overrides; Check does not need them.** Parity requirement: the
   preview and the export are built from the same contacts and the same overrides (`supportJobOf`
   differs between `'preview'` and `'export'` only in resolution). A data test builds both jobs for
   a unit with overrides and compares `contacts` and the resolved per-contact shapes.
10. **Locks.** Support Edit Mode: left panel locked, right panel live. Zones mode: both panels
    locked (4.4).
11. **One undo step per committed value** (11.5).

#### 11.3 Wireframes (right panel, 300 px)

```text
+-------------------------+   +-------------------------+
|A: nothing selected      |   |B: Edit, 37 selected     |
|SUPPORT SETTINGS  bust   |   |SUPPORT SETTINGS  bust   |
|Applies to 140 of 150    |   |Settings for 37 selected |
|supports . 10 customised |   |9 customised             |
|[Select them]            |   |[Reset to defaults]      |
|Preset [Lt|=Md=|Hv|Cu]   |   |Changes apply to the     |
|Lift height    5.0 mm    |   |selected supports only.  |
|Roof/cage [=Off=|Rf|Cg]  |   |░Preset [Lt|Md|Hv|Cu]    |
|v Auto placement         |   |░Lift height    5.0 mm   |
|  Support spacing  3.0   |   |░Roof/cage [Off|Rf|Cg]   |
|  Overhang angle   50    |   |░> Auto placement        |
|  [x] Downward faces     |   |░> Tree supports         |
|  [x] Islands            |   |v Contact tip            |
|v Contact tip            |   |  Shape [None|Sphere]    |
|  Shape [=None=|Sphere]  |   |  Point dia.   --  mm    |
|  Point dia.  0.40 mm    |   |  Penetration 0.30 mm    |
|> Pillar                 |   |░> Pillar                |
|> Foot                   |   |v Foot                   |
|> Bracing                |   |  Bottom dia. 3.00 mm    |
|> Raft                   |   |░> Bracing               |
|> Letter label           |   |░> Raft                  |
|> Advanced               |   |░> Letter label          |
|EXPORT STL               |   |░> Advanced              |
|[Active obj + model ]    |   |EXPORT STL               |
|[Active, supports   ]    |   |[Active obj + model ]    |
|[Each obj + model   ]    |   |[Active, supports   ]    |
|[Each, supports     ]    |   |[Each obj + model   ]    |
|[Whole plate, 1 file]    |   |[Each, supports     ]    |
|                         |   |[Whole plate, 1 file]    |
+-------------------------+   +-------------------------+
```

Notes: the header band is the first row under the title in both states and never scrolls away
(sticky). In B, disabled groups stay visible (faded, closed) so the panel does not jump; each carries
the hint "Applies to the whole object. Clear the selection to change it." Export stays live. Reset to
defaults lives in the header band (it acts on the selection, so it lives with the selection's
settings, not in the edit bar); it is disabled with a reason when none of the selected supports is
customised. "Adjust" from the owner's earlier list is this panel, not a button. Outside Support Edit
Mode the band shows state A with the count, so the user learns at once that some supports are not
following the defaults.

#### 11.4 Data shape (proposal)

```ts
/** The settings one support may own (11.2 rule 3). Pillar thickness is not here. */
type SupportShapeKey =
  | 'contactShape' | 'tipSection' | 'tipCrossWidth' | 'tipProfile'
  | 'pointDiameter' | 'touchDiameter' | 'pointDepth' | 'touchDepth' | 'neckDiameter'
  | 'neckLength' | 'maxNeckAngle' | 'baseDiameter' | 'baseHeight';
type SupportShapeSettings = Pick<LiveSupportSettings, SupportShapeKey>;

interface PrintUnit {                 // state/project.ts, saved in the project file
  // ...existing fields
  /** Per-support edits by exact contact id (automatic or manual); only the keys the user set. */
  overrides: Record<string, Partial<SupportShapeSettings>>;
}

type SceneCommand =
  | ...
  | { type: 'overrides/set'; unitId: string; contactIds: string[]; patch: Partial<SupportShapeSettings> }
  | { type: 'overrides/reset'; unitId: string; contactIds: string[] };
```

Effective shape of a contact = object defaults, then `overrides[id]`. Nothing is snapshotted at add
time. `SupportJob.contacts` gains `shapes: Record<id, SupportShapeSettings>` (resolved per contact by
`supportJobOf`, so the worker stays dumb, and resolved only for contacts that have an override);
`buildSupportMesh` reads each column's shape instead of `settings` for the shape keys, and the
builders take per-contact radii. `overrides/reset` deletes the entry. The export job and the project
file serialise `overrides`; `checkJobOf` ignores them.

Build rules to settle in the feature's own spec: braces use the object-wide pillar Ø, so unequal
pillars cannot occur; a column with an override stays out of tree merges (11.2 rule 4); the raft
footprint reads each column's own foot Ø.

#### 11.5 Undo

`overrides/set` and `overrides/reset` are scene commands, so they go through history like every
edit. **Settings edits coalesce: one undo step per committed value** (number field Enter or blur,
choice click, slider release), and one per Reset. A burst of typing or dragging commits once. This
holds for object-wide settings too, which today may push one step per keystroke. Inside Support Edit
Mode the undo floor applies (Undo stops at the scene the mode was entered with). Undoing a
`manual/add` removes the support and any override on it. Selection is view state and never in
history; ids that stop naming a support after Undo, Redo or Regenerate are pruned from the selection.

#### 11.6 Port

The data (`overrides`), commands and the resolve function (`effectiveShape(unit, contact)`) live in
`state/` and `core/`, framework-free; the mixed-value rule (`fieldValue(selection) ->
value | 'mixed'`), the live count (`customisedCount(unit)`) and the disabled-while-selected rule are
registry rules (`enabled` of each setting command reads `sel > 0` and the key's scope). Babylon
renders the same.

#### 11.7 Copy (proposed, all **[new]**)

| en | zh-Hant | ja |
|---|---|---|
| Applies to {n} of {m} supports | 套用到 {m} 個支撐中的 {n} 個 | サポート {m} 本中 {n} 本に適用 |
| {k} customised | {k} 個已自訂 | {k} 本は個別設定 |
| Select them | 選取這些支撐 | それらを選択 |
| Settings for {n} selected | 已選取 {n} 個支撐的設定 | 選択中のサポート {n} 本の設定 |
| Changes apply to the selected supports only. | 變更只會套用到選取的支撐。 | 変更は選択中のサポートにだけ適用されます。 |
| - (mixed values; field hint:) Selected supports have different values. Enter a value to set them all. | 選取的支撐數值不同。輸入數值即可全部設為相同。 | 選択中のサポートで値が異なります。値を入力するとすべてに適用されます。 |
| Applies to the whole object. Clear the selection to change it. | 這項設定套用到整個物件。清除選取後即可變更。 | この設定はオブジェクト全体に適用されます。選択をクリアすると変更できます。 |
| Reset to defaults | 恢復預設 | 既定に戻す |
| Give the selected supports the default settings again. Undo brings their own values back | 讓選取的支撐改回預設設定。復原可找回原本的數值 | 選択中のサポートを既定の設定に戻します。「元に戻す」で元の値を復元できます |
| Supports with their own settings carry a ring. (marker legend, edit bar row 3) | 有自訂設定的支撐會加上圓環標記。 | 個別の設定を持つサポートには輪の印が付きます。 |
| {n} customised kept, {m} reset | 保留 {n} 個自訂支撐，重設 {m} 個 | 個別設定 {n} 本を保持、{m} 本をリセット |
| {n} supports hidden by an old removal are back | 有 {n} 個因舊式移除而被隱藏的支撐已恢復顯示 | 旧方式の削除で隠れていたサポート {n} 本が表示に戻りました |

Glossary check: 支撐 / サポート (counted 本), 刪除 vs 移除 unaffected, 復原 / 元に戻す.

#### 11.8 Build order

1. 11.0 (b) then (a), each with its migration and test. 2. The `overrides` data, commands, save and
export (with the parity test). 3. Right panel header and count. 4. Per-support fields, Reset, the
ring mark. 5. The Regenerate report. Steps 1 and 2 ship without any UI change.

---

### 12. Owner-confirmable rules and open questions

#### 12.1 Rules to confirm

| # | Rule | Default in this document | Status at `05d42c4` |
|---|---|---|---|
| C1 | Remove the header Generate (duplicate, second red button) | removed | Implemented. The header has no Generate (`a55d4ec`). |
| C2 | Left Exit stays live inside the locked panel AND the viewport Done stays; both run `mode.exit` and never disagree (4.4). Two of four reviewers preferred one Exit in the viewport bar. | both, one command | Implemented. The left Exit and the viewport Done both run `mode.exit` (`e01941f`). |
| C3 | Header: the lock blocks scene-changing commands only. Language, Hide models, Wireframe stay live in every mode; Undo / Redo stay live down to the mode's floor | view toggles live | Implemented. Language, Hide models and Wireframe stay live; Undo and Redo stop at the mode floor (`83ccbe1`). |
| C4 | File drop on the viewport is refused while a mode is on (today it ends the mode and imports) | refused | Implemented. A file dropped in a mode is refused, the status line says why and the lock note pulses (`83b85e4`, `54be8c9`). A dropped `.mixodental` file follows the same rule. |
| C5 | Click reach (was Remove radius): drop the right-panel field once the Add bar has it | keep both for now (one registry control) | Implemented as the default. One registry command, `setting.clickReach`, renders in the Add bar and in the right panel Advanced group (`commands.ts:245`). |
| C6 | Viewport primary keeps the word "Done" (left button says "Exit ...") | "Done": says the work is kept | Implemented. The viewport button says "Done" and the left button says "Exit ..." (`EditBar.tsx:20`). |
| C7 | Supports follow defaults unless explicitly edited; Reset drops the override (replaces the earlier "freeze at add" and "re-snapshot" options) | decided by the coordinator, recorded | Implemented. `contactSettings` holds only edited values; Reset drops them (`8fc7742`). |
| C8 | A support with an override is kept out of tree merges | kept out (decided) | Implemented. A support with its own shape never joins an Auto Tree branch (`autotree.ts:58,62`). |
| C9 | Edit-mode right panel live (owner ruling of 2026-10-22) | live | Implemented, changed in order. The panel is live; Support shape sits first while supports are selected (`cb48f21`). |
| C10 | "Select them" outside Support Edit Mode enters the mode with the customised supports selected | enters | Implemented, with one limit. The mode edits one object, so "Select them" makes the first selected object with customised supports active when the active one has none, and the status line names the rest (`commands.ts:261-275`, `App.tsx` `selectCustomised`). |
| C11 | Zones frame and badge follow mixo-app-style (red hairline for every tool mode); blue stays the zone layer on the model and the Regenerate button | red frame, zone mode named in the badge | Implemented. Red hairline frame in both modes, the zone mode in the badge, blue kept for the zone layer (`f7dc6d1`). |
| C12 | Clear manual edits also drops per-support overrides (all hand work in one action, with an Undo toast that gives the counts) | drops them | Implemented. The toast reads "Cleared {a} added, {r} removed, {c} customised." with Undo (`toast.ts:44`, `App.tsx:540-551`). |
| C13 | Tab is no longer a mode key (it breaks focus navigation); modes are entered and left with the buttons, Done and Esc | no Tab | Implemented. The editor never takes Tab; it moves focus (`keys.ts:77-92` has no Tab rule; `a55d4ec`). |
| C14 | A click on a support toggles it; Shift+click is no longer documented as a separate action | toggle only | Implemented. A click on a support toggles it whatever Ctrl or Shift says (`pick.ts:58-62`). |

#### 12.2 Open questions for the owner

| # | Question | Options | Default until answered | Status at `05d42c4` |
|---|---|---|---|---|
| Q1 | Esc: always exit the mode, or first clear the selection and then exit? Reviewers split (one: Esc always exits; one: Esc cancels the gesture, then clears, and the button exits). | exit always / clear then exit | clear then exit (today) | Implemented, answer 12.5. Esc clears the selection, the next Esc exits. The status line says "Esc again to exit" (`keys.ts:83-84`, `status.ts:34`). |
| Q2 | Should Check findings stay live inside Support Edit Mode, so Fix adds a support without leaving the mode? Today Edit locks the left panel, which also blocks Check and object switching. Related: a Generate button reachable from the edit bar when the object has no supports. | keep locked / findings live in Edit / findings in the viewport | locked | Implemented, answer 12.5. Check is live in Edit, Fix works in place, the edit bar shows Generate when the object is empty (`e51fc50`). |
| Q3 | Strict mode isolation (exit one mode before entering the other, four clicks and no shared undo floor) or a "Switch to zones" button in the mode bar that keeps one undo floor for the whole editing session? | strict / Switch button | strict | Implemented, answer 12.5. Strict isolation, with no switch button (`e01941f`). |
| Q4 | Right panel split: "Object: {scope}" always live, plus a context region "Support shape: defaults or n selected". And in Edit mode, label placement settings "applies on next Generate". | split / one list | one list with the 11.2 header | Implemented, changed in order. Object and Support shape regions; Support shape first while supports are selected. Placement in Edit says "Applies on next Generate." and "Placement changed. Regenerate to apply." (`SettingsPanel.tsx:214,264`). |
| Q5 | Registry form: a typed descriptor table with tests and a `disabledReason` per command, no generic renderer. | table + tests / generic renderer | table + tests | Implemented. A typed table in `commands.ts`, tests in `commands.test.ts`, a `disabledReason` per command, no generic renderer. |
| Q6 | Touch: Add has no touch equivalent of right-click removal (Select, then Delete works). Add an Add / Remove switch to the Add tool? | switch / leave | leave | Implemented, answer 12.5. The Add tool has an Add | Remove switch (`commands.ts:240-241`). |
| Q7 | Does Tips only change what Drag over can pick? To verify in the browser before the Select work. | n/a | unchanged | Answered from the code: no. Tips only changes what Drag over can pick. Evidence below the table. |
| Q8 | Width of the new Drag over row in ja (7.6). | n/a | measure before merge | Verified by the implementer (12.5). Not re-measured for this update. |

**Q7 answer, from the code.** Tips only does change what Drag over can pick.

- `UnitObject.tsx:50-51` swaps the built supports for `tipsOf(props.supports)` while the tips view is on.
- `UnitObject.tsx:121-123` hands that same `supports` mesh to `useScreenBrush`.
- `useScreenBrush.ts:161` builds the pickable bodies with `bodySegments(options.supports)`, so the circle tests the mesh on screen.
- `screenBrush.ts:39-44` takes one segment per support from its components. In the tips view those are the tip and neck only.
- `meshQuery.ts:22-40` keeps tip and neck components with their `contactId`, and keeps a stub at the landing end of a landing pillar (line 27).
- `view.ts:117-123` sets when the view is on. Drag over takes no part in that decision.

Every support stays pickable, because its contact id is kept. The hit area shrinks to the tip and neck,
so a circle that only grazes a pillar selects nothing in the tips view. Tests are `mesh.test.ts:239`
(tips still pick their contact) and `mesh.test.ts:138` (a support's own shape).

#### 12.3 Gap list (14 gaps from the plan) and where each is answered

| # | Gap | Answer |
|---|---|---|
| 1 | Switching objects in Edit mode with the left panel locked | Refused with the busy line (4.3). Relaxing it is Q2 and Q3. |
| 2 | Empty state before Generate | Edit and Add stay available on an object without supports; entry status "No supports on {object} yet. Click the model to add one, or exit and Generate." (6.4). Generate from the edit bar is part of Q2. |
| 3 | Esc order | Today's order stays (clear selection, then exit). Q1. |
| 4 | Selection lifetime vs Undo | Selection is view state, empties on mode and object change, and is pruned of ids that no longer name a support (11.5). |
| 5 | Two removal paths, naming | Right-click removes exactly one support, Delete deletes the selection, both exact after 11.0 (6.1). |
| 6 | Tablets, no Shift | No drag needs a key (P7). Shift only flips Drag over; Click toggles (5.8). Touch removal in Add is Q6. |
| 7 | Overrides surviving Regenerate | Exact unit-local ids (11.0 b); kept or reset with a visible count (11.2 rule 8). |
| 8 | A zone removing selected supports | Dismissed: entering Zones empties the selection (4.1). |
| 9 | Mixed-selection undo granularity | One step per committed value for all selected supports (11.5). |
| 10 | "Select changed" action | "Select them" in the header count (11.2 rule 5). |
| 11 | Check and export use per-support settings | Export and the project file carry overrides; Check needs none (11.1, 11.2 rule 9). |
| 12 | Header controls locked in modes except Undo / Redo | Header lock blocks scene-changing commands only (4.4, C3). |
| 13 | Heavy model, disabled mode buttons with a reason | Help line under Modes (3.2 row 8) plus the button hint; `disabledReason` in the registry (Q5). |
| 14 | Tips only and Drag over interplay | Answered, Q7: Tips only changes what Drag over picks (12.2). |

#### 12.4 Review dissent kept on record

- Two reviewers (A, B) wanted one Exit, in the viewport bar only, with the left mode buttons showing
  state only. The coordinator kept the document's choice (a live left Exit) and the viewport Done,
  on one command (C2).
- Two reviewers (C, D) said Check must use per-support settings. Dismissed: `checkJobOf` reads
  positions, angle and spacing only (11.1).

#### 12.5 Owner answers (2026-10-22)

- C1 to C14: confirmed as written.
- Q1: Esc clears the selection first, then exits. While a selection exists the status line says "Esc again to exit".
- Q2: Check findings stay live inside Support Edit Mode. Fix frames the spot and adds a support without leaving the mode. The edit bar offers Generate when the object has no supports.
- Q3: strict isolation. No "Switch to zones" button. The owner prefers the peace of mind of separate modes.
- Q4: the right panel splits into "Object: {scope}" (always live) and "Support shape: defaults or n selected". In Edit mode placement settings say "applies on next Generate".
- Q5: the registry is a typed descriptor table with tests and a `disabledReason`; no generic renderer.
- Q6: the Add tool gets an Add | Remove switch.
- Q7, Q8: verified by the implementer in the browser.
- Audit item "Drag over on empty space": a drag that starts on the model or a support selects; a drag on empty space orbits.

---

### 13. UI behaviour audit

Method. Each control in the registry tables (5.2 to 5.8) is walked against the ten NN/g heuristics
(H1 visibility of status, H2 match with the real world, H3 user control and freedom, H4
consistency, H5 error prevention, H6 recognition over recall, H7 flexibility, H8 minimal design,
H9 error recovery, H10 help) and against a closed loop per action: **(1)** before the click, the scope
is explained; **(2)** immediate feedback; **(3)** progress for anything slow; **(4)** success or
failure is visible where the eye is; **(5)** a way to recheck or undo. Controls that pass every step
are left out (language, Select all, Transform, Fit view, Paint / Erase, Brush size, Circle size, tool
and method choices, view toggles in zones). Severity: high = hand work or trust can be lost silently;
medium = the user is unsure what happened; low = polish.

| Control | Problem | Fix | Severity | Status at `05d42c4` |
|---|---|---|---|---|
| check.run, check.showMe, check.fix | Findings go stale after any support edit and nothing says so; no recheck prompt (H1, step 5). A finding fixed in Edit mode stays listed. | Mark the list "Out of date, check again" after any support change; remove a finding when a support lands on its spot; Fix leaves a status naming the spot to click. | high | Done. The list is marked "Out of date, check again."; a finding goes when a support covers it (`dae2674`, `258520b`). |
| setting.* (placement keys) | A placement setting silently schedules a regeneration (App.tsx:432-440); the user cannot tell that hand work is touched (H5, steps 1 and 4). | Status "Placement changed: regenerating {scope}" while it runs, then the "{n} customised kept, {m} reset" report with Undo. | high | Done, changed. Outside a mode a regeneration is announced and reported; in Edit the change waits and the panel says "Placement changed. Regenerate to apply." (`33dbd0a`, `7d2b612`). |
| supports.generate (Regenerate) | The hint does not say what a regeneration keeps or replaces (H2, step 1). | Hint: "Replaces automatic supports. Your added supports and customised settings are kept where they still fit." | medium | Done. The hint names what is kept (`b44da0d`). |
| supports.clearManual | Scope unclear once overrides exist; Undo toast gives no counts (H5, H9). | Clear manual edits also drops overrides (C12); toast "Cleared {a} added, {r} removed, {c} customised. Undo". | medium | Done. It drops overrides; the toast gives the three counts (`toast.ts:44`). |
| supports.remove | Destructive, no Undo toast, hint silent about Undo (H3, H9). | Toast "Removed supports of {scope}. Undo". | medium | Done. Undo toast (`fd7e66c`). |
| check.fix | The loop does not finish: Fix enters Edit mode, the user must find the spot, and the Check list is locked away inside the mode (step 4, Q2). | Frame the spot, show a ghost marker, status "Click here to add a support"; on add, say "Spot covered". | medium | Done, changed. It frames the spot and says "Click the framed spot to add a support."; no ghost marker. The re-check says "Spot covered." (`e51fc50`). |
| edit.method (Drag over) | The hint says "starting anywhere in the view" but mixo-app-style says a drag on empty space orbits; the user cannot tell which one a drag will do (H4, step 1). | Follow the skill: a drag that starts on the object selects, on empty space orbits; show the ring only over the object. Or record the deviation as an owner decision. | medium | Done. A drag starts on the model or a support, else it orbits (`807c7f7`). |
| edit.add (click) | Feedback for "Support added." is only the footer line, 11.5 px, far from the click (H1, step 2). | Flash a ring at the new tip for 400 ms; keep the status line. | medium | Done. A ring flashes at the new tip for 400 ms (`44315ae`, `f8d25fd`). |
| edit.keys.add (right-click) | After 11.0 a right-click removes exactly one support, but the old hint still says "every support within this distance" (H2). | New copy for Click reach and for the Add hint (6.2). | medium | Done. New Click reach and Add / Remove copy (`b8c8f34`). |
| Footer status line | Every success and failure of every action lands in one small live line at the bottom (H1, step 4). Long actions (Generate, export, Check) finish out of sight. | Long actions also end with an Undo toast or a job-list entry that stays until dismissed; the status line keeps the text. | medium | Done. Undo toasts, and a job list entry that stays until dismissed (`fd7e66c`, `1748ef5`). |
| export.kind[5] | Success says little: no file name, count or size; a failed build can look like a slow one (H1, step 4). | Status "Exported {file} ({n} supports)"; on failure the job list shows the error until dismissed. | medium | Done. Names the file and support count; a failed job stays listed (`1748ef5`). |
| zones.badge, zones.* | Painting a zone gives no number for its effect (step 4). | Badge shows "{n} supports hidden by zones" from the shown build's `dropped` contacts (App.tsx:206). | medium | Done. "{n} supports hidden by zones" (`f7dc6d1`, `2b494b7`). |
| mode.edit, mode.zones | With several objects selected the button does not say which object the mode will edit (H2, step 1). | Hint "Edit supports of {object}"; the badge repeats the name. | low | Done. The hint names the active object (`b44da0d`). |
| Locked panels (4.5) | A click on a locked section does nothing visible if the catcher is optional (H1). | Make the catcher required: any click on a locked section repeats "Finish ... first" in the status line and pulses the lock note. | medium | Done. The click catcher repeats the lock note and pulses it (`83ccbe1`, `54be8c9`). |
| history.undo, history.redo | At the mode floor the buttons go grey with no reason (H1, H9). | Hint at the floor: "Nothing more to undo inside this mode. Exit to go further back." Hints name the last action. | low | Done, changed wording. Hints name the step (`e9ccce2`); the floor reason reads "Nothing to undo here: leave the mode to undo earlier steps." |
| view.models | With models hidden, an Add click has no surface to land on and does nothing (H5). To verify. | Disable Add with a note while models are hidden, or keep picking on the hidden mesh. | medium | Done, no change needed. A browser walk on f8d25fd showed an Add click with models hidden still lands on the hidden mesh, so Add keeps working. |
| Keyboard: Tab | Tab toggles the mode and calls preventDefault (keys.ts:53), so keyboard users cannot move focus (H7, accessibility). | Drop Tab as a mode key (C13). | high | Done. The editor never takes Tab (`a55d4ec`). |
| Keyboard: Esc in a field | Esc and Delete typed in a number field are ignored by the app (keys.ts:47), but a range or checkbox keeps focus after pointerup, so Esc and Delete then do nothing in the mode (H7). | Fields keep their own Esc (revert, blur). Range and checkbox inputs are exempt from the form-field rule, so Delete and Esc reach the mode after pointerup (8.6). | medium | Done. Only text-taking fields are exempt, so range and checkbox focus no longer blocks Esc and Delete (`a55d4ec`, `1b1b46e`). |
| objects.delete | Destructive with no toast; hint only mentions Undo (H3). | Toast "Deleted {n} objects. Undo". | low | Done. Undo toast (`fd7e66c`). |
| import.files | A drop refused in a mode is announced only in the status line (H1). | Pulse the lock note as well (C4). | low | Done. The refusal pulses the lock note (`54be8c9`). |
| jobs.cancel | After Cancel nothing says the old supports are untouched (H9, step 4). | Status "Cancelled. Supports unchanged." | low | Done. "{label}: cancelled. Supports unchanged." (`1748ef5`). |
| setting.preset | A preset overwrites many fields at once without listing them (H2). | Hint lists the fields it sets; one undo step. | low | Done in part. The hint lists the groups a preset sets and says Undo takes them back, not each field (`54be8c9`). |
| Footer counts | "removed" means nothing to a layperson (H2). | Hint on the count: "Automatic supports you removed. Clear manual edits brings them back." | low | Done. The hint explains "removed" (`54be8c9`). |
| edit.removeRadius (Click reach) | The field changes how a right-click lands but shows nothing (H1). | Show a hover ring of the reach in Add. | low | Done. `EditPreview` draws a ring of Click reach at the pointer in Add (`src/components/viewport/supportLayers.tsx:35-43`), and highlights the support a remove click would take. |
| zones.clearAll, edit.deleteSelection | Disabled or inert without saying why (H6). | `disabledReason` hint (Q5): "No zones painted", "Nothing selected". | low | Done. `disabledReason` on every disabled command; Delete is always shown (`b44da0d`). |

Top gaps to fix first: stale Check findings, silent regeneration of hand work, Tab focus trap,
the half-finished Fix loop, Drag over on empty space versus orbit. All five are done.

No audit rows are open at `05d42c4`.
No row is marked won't do.

### 14. Project files (Save and Open)

Not in the original design. Shipped in `05d42c4`.

Save project writes the plate as one `.mixodental` file. Open project reads it back.

- **Where.** An Open / Save row sits under Import models in the left panel (`App.tsx:867-870`). Both are registry commands, `project.open` and `project.save` (`commands.ts:168-175`).
- **Enabled.** Open needs no mode on, and in a mode its reason is the busy line. Save needs at least one object, and its reason is the no-model line. The row is inert with the Import section when a mode locks it.
- **Format.** Version 1. JSON with a header `{ app: "mixodental", version: 1, scene }`, gzip-compressed where the browser has `CompressionStream`, else plain JSON. Open reads both by the gzip magic bytes (`state/projectFile.ts:5-7,36-62`).
- **Contents.** The scene's units. Each holds its model mesh, transform, settings, manual supports, removals, per-support settings and zones. Selection and the active object are not saved.
- **File name.** The first object's name without its extension, plus `.mixodental`. Characters a file name cannot hold become `_`.
- **Saving.** A native save dialog opens where the browser offers one, else the file downloads. A cancelled dialog says "Save cancelled; no file was written." A failure says nothing was written.
- **Opening.** Open replaces the plate as one history step. When objects were on the plate, an Undo toast brings them back. Dropping a `.mixodental` file on the viewport opens it the same way (`App.tsx:785-791`).
- **Refusals.** Open waits while a mode is on, as an import does. It refuses a file with no header, a newer version, a damaged file, and a project over this device's triangle limit. Each message names the file, says what to do, and leaves the plate unchanged.
- **Progress.** A job entry shows "Opening {name}" or "Saving {name}".
- **Leave guard.** After a change since the last save or open, the page asks before it closes (`beforeunload`, `useProjectFile.ts:36-46`). A selection change alone does not arm it.
- **Port.** The format and the messages in `src/editing/project.ts` hold no React. `useProjectFile.ts` is the only React part.

---

### Appendix A. Verified against the code

Paths under `src/` unless noted. Re-checked at `05d42c4`. `App.tsx` is 987 lines and most of its
logic moved into hooks (`useExport`, `useFixSpot`, `useRegenerate`, `useProjectFile`). A row marked
"moved" kept its meaning and now points at the new place.

| Item | Location at `05d42c4` |
|---|---|
| Header: brand, subtitle | App.tsx:845-846 |
| Language switch | App.tsx:848; i18n.ts |
| Undo / Redo buttons and hints | App.tsx:849-852; commands.ts:123-135 |
| Hide / Show models, Wireframe / Solid | App.tsx:853-856 |
| Header Generate | removed (`a55d4ec`) |
| Left panel container | App.tsx:860 |
| Import drop zone, picker, help | App.tsx:862-866 |
| Open / Save project row | App.tsx:867-870; styles.css:117 |
| Objects list, rows, Select all, Delete | ObjectList.tsx:13; App.tsx:871 |
| Transform Select / Move / Rotate, disabled in a mode | App.tsx:881-887 |
| Supports group: Generate / Regenerate, Clear manual edits, Remove supports | App.tsx:888-893; commands.ts:176-190 |
| Modes group (Support Edit Mode, No-support zones), now after Supports | App.tsx:894; ModeEntry.tsx:11-24; commands.ts:197-216 |
| Mode button labels, hints, enabled rules | commands.ts:197-216 (`editing/modeButtons.ts` is gone) |
| Zones state label, Clear all zones | ModeEntry.tsx:23-24; ZonesBar.tsx:15; App.tsx:566 (`clearActiveZones`) |
| Remove supports and Clear manual edits, with Undo toasts | App.tsx:533-551 |
| Check supports, findings, help | App.tsx:895-899; ProblemList.tsx:9 |
| Stale Check label | ProblemList.tsx:20 |
| Fix: frames the spot, enters or stays in the mode; refused in zones | useFixSpot.ts:34-68 |
| Import in a mode | moved: refused instead of ending the mode (App.tsx:430-434; status.ts:82) |
| Viewport classes per gesture | App.tsx:90 (`VIEWPORT_CLASS`), 903 |
| View group Tips only / Fit view / Bottom view | App.tsx:935-940; editing/view.ts:81-136 |
| Circle size preview | App.tsx:941; viewport/CirclePreview.tsx |
| Drop overlay, job activity, toast region | App.tsx:942-946; JobActivity.tsx:46; UndoToast.tsx:10 |
| Setup overlays: object name, unit note | App.tsx:948-949 (the viewport Edit supports button is gone) |
| Zones bar | App.tsx:951; ZonesBar.tsx:15 |
| Edit bar | App.tsx:952; EditBar.tsx:38 (bar), 26 (badge texts), 20 (Done), 59-76 (tools, Shift hint), 86-89 (key hints), 101 (Select / Unselect switch), 108 (Click reach field) |
| Right panel: Object and Support shape regions, defer note, pending note | App.tsx:954-971; SettingsPanel.tsx:173 (region type), 214 (defer note), 219-275 (264 pending note) |
| Export section | App.tsx:972-978; App.tsx:86 (`EXPORT_IDS`); useExport.ts |
| Click reach setting (limits 0.1 to 50, default 1.5) | SettingsPanel.tsx:153; core/supports/settings.ts:251, 315 |
| Footer counts and status line | App.tsx:979-984 |
| Session state, events, reducer | editing/session.ts:10, 62, 99 |
| Command registry: ids, `resolve`, rows | editing/commands.ts:1-30 (ids), 123-275 (rows) |
| Keyboard rules | editing/keys.ts:69-92 (`keyAction` 69, Esc 77-84), `takesText` 20; App.tsx:823 (listener) |
| Range input keeps focus after pointerup | components/RangeField.tsx:27 |
| Gesture kinds | editing/gesture.ts:11-33 |
| Status lines per gesture, building, busy | editing/status.ts:9-31, 77-82 |
| "Esc again to exit" | editing/status.ts:33-44 |
| Pick: click toggles regardless of Ctrl / Shift | editing/pick.ts:49-62 |
| Undo toasts | editing/toast.ts:11-61 |
| Selection clear / delete handlers | App.tsx:667, 696 |
| Busy refusal on object click in a mode | App.tsx:578 |
| Right-click removal: eraseNear, removeContact | App.tsx:614-647 |
| "Support added." status | App.tsx:611 |
| Placement compose: exact-id removals, marker hide, remap, re-key | core/analysis/placement.ts:96 (`composeContacts`), 102 (`hidingRemovals`), 112 (`contactsHiddenByMarkers`), 126 (`remapDeleted`), 149 (`rekeyHandWork`), 212 (`positionFromId`) |
| Exact-removal tests | core/analysis/placement.test.ts:159 (exact), 170 (remap), 178 (no match), 217 (marker) |
| Placement runs in the turned frame | supports/unitSupports.ts:143-166 (`orientationOf`, `placementJobOf`); supports/jobRunner.ts:88-93 |
| Check job reads positions, angle, spacing only | supports/unitSupports.ts:167 (`checkJobOf`) |
| Zoned contacts of the shown build | supports/unitSupports.ts:100-114 (`hiddenByZones`); App.tsx:215 |
| Placement pending, regenerate hook | supports/unitSupports.ts:37; components/useRegenerate.ts:21; App.tsx:278, 804 |
| Regeneration report | editing/regenerate.ts:23-69 |
| Per-support settings: data, commands, keys | state/project.ts:43, 74-80; core/supports/settings.ts:112 (`SHAPE_KEYS`); editing/shapeEdit.ts:18-58 |
| Own-shape and manual supports kept out of tree merges | core/supports/autotree.ts:58, 62 |
| One settings object per unit; manual contacts | state/project.ts:25-43 |
| Support job: one settings object, all contacts | supports/unitSupports.ts:75-125; core/jobs.ts:75 |
| Bracing across all columns | core/supports/mesh.ts:227 (`addBraces`) |
| Tips view of a support mesh | core/supports/meshQuery.ts:22-40; components/viewport/UnitObject.tsx:50-51 |
| Drag over: bodies, circle, strokes | components/viewport/useScreenBrush.ts:161; editing/screenBrush.ts:39; editing/dragOver.ts:40 |
| Project file format, Save, Open | state/projectFile.ts:5-62; components/useProjectFile.ts:36-46; editing/project.ts |
| Browser walk | scripts/walk.mjs (`npm run walk`) |
| Glossary, zone-only words, zone texts | glossary.ts:19-55; docs/migration/glossary.md |
| Styles: primary, danger, regen | styles.css:54-57 |
| Styles: header, workspace 268 / 1fr / 300, footer | styles.css:60, 83, 406-419 |
| Styles: edit frame, badge, bar, view group move | styles.css:232-261, 461 |
| Styles: Tips only forced look | styles.css:454 |
| House tokens | `~/.claude/skills/mixo-app-style/tokens.css`, `base.css`, `SKILL.md` |
| Stitch DESIGN.md location and sections | `~/.claude/skills/stitch/references/design-md.md`, `flows/design.md` |

---

---

<a id="2026-11-20-node-rule-authoring"></a>

## 2026-11-20 — benchwork: deciding what a type's rules are

**REWRITTEN THE SAME DAY. The first version of this record was built on a six-stage engine model that
does not exist** — I took an analytical table from a design consult and wrote it up as engine fact. An
EGM review of six reviewers, two of them fact-checking against the engine source at
`S:\ai\mixo-geocore`, found the framework absent and three of the four premises under its central
claim false. The wrong version is not kept: it would mislead a builder on every row. What it got
right is kept below, and the error is named at the end, because the mistake is the reusable part.

### The owner's ask, in their words

> *"The idea is we can use procedural nodes like blender to determine a) orientation, b) rim and
> c) support areas, while the procedure nodes are options shown below with live detection above like
> blender UI. Then the dev tool has a way to export or save the entire thing into a file so it be
> read and integrated to types."*

> *"that part should be separate until it is mature enough to become part of the app."*

**Its name is `benchwork`**, the owner's choice on 2026-11-20: the tool that decides what a type's
rules are for orient, rim and the support zones. That makes `typelab/CLI.md` the written form
and `typelab/cli.mjs` the executable form of one thing, and it means that file's own line *"No new
tooling here"* had to be amended rather than quietly contradicted. (It was first named "benchwork",
after the workshop fixture that guides a repeated cut; the owner renamed it the same day.)

### The owner's rulings, 2026-11-20

Recorded after the first build. Where they disagree with anything earlier on this page, these win.

**1. One policy mechanism for both kinds.** *"all policy should be same… denture and aligner are
different but all must be same and call whatever needed from another repo or build into the geo core
if it's modules function"*, and *"they both use what they need from geocore"*. A **policy** here is
the engine's answer, as data, to where supports are allowed and where tips go — one struct per model,
a flag per triangle plus the candidate tips, with one producer per kind.

The file layout already obeys this: `dental/` and `dental/denture/` are separate and heavily modular,
one unit per step.

**CORRECTION, same day.** This paragraph first said the aligner was *"the only policy producer in the
engine with no rules channel"*, because a grep for `from_overrides` in
`crates/geometry-wasm/src/dental.rs` found nothing. **That was the wrong file and the wrong
conclusion.** `dental_policy` lives in `crates/geometry-wasm/src/dental_area.rs:55`, it **already
uses the shared module** — `let rules = PlacementRules::default();` at `:102` — and
`PlacementRules::default()` *is* `from_overrides(&[])`
(`crates/geometry-core/src/generic/placement/mod.rs:123-126`). `generic_policy` takes no rules
either, so "the only one" was false twice over. Checked in the source after an engine review.

**Where the aligner is really stuck, and it is in THIS repo, not the engine.** The aligner's
generation already takes rules for every kind — `host/supports/jobRunner.ts:46` passes
`rules: job.rules ?? GENERATE_RULES`. What drops them is the app's own review path:
`scripts/dental-region-review/build.ts:107` calls `runSupportJob` with no `rules`, and
`typelab/reviewCase.ts:18` goes through exactly that function. **So the first and
largest win is a one-line app change, not an engine change.**

What the engine change is still worth, honestly: `dental_policy` has exactly two rule-shaped
attachment points — the add-on placement closure (`dental_area.rs:101-106`) and the debris size
(`dental/aligner_parts.rs:53`) — and both run only for MULTI-PART aligner files. Ten rule names
would become live there, and only 2 of the 13 baseline scans exercise it. The denture overload
collapse is separately worth doing and is mechanical: the three unruled entries have no JS caller in
either repo. **`dental_tilt_scan` should NOT gain a rules parameter** — nothing would read it, and a
parameter the engine ignores is the "looks like an answer, tested nothing" failure this whole tool
exists to prevent.

**The one-line fix, done 2026-11-20 — and its honest negative result.**
`scripts/dental-region-review/build.ts` now threads named rules into `runSupportJob`, and
`typelab/reviewCase.ts` passes the aligner-readable subset. The plumbing is proved:
with `MIXO_RULES` set, the filter returns `{"overhangAngleDeg":10}` and drops the denture-only rule
beside it. **But nothing moved.** On the reference aligner, 94 tips with 0 left out at the engine
default, at 55°, and at an extreme 10°.

So: the rule arrives and the aligner's result does not depend on it — an aligner's tips come from the
dental contour policy, not from overhang scatter. **No rule benchwork currently offers has been seen
to change an aligner.** That is recorded rather than hidden: the rule carries `unprovenOn:
['aligner']`, the CLI says so before the run, and a test keeps the claim honest. An unchanged result
there is UNPROVEN, not evidence the rule does nothing — which is the reading that would be exactly
wrong, and the failure this tool exists to prevent.

The wiring was still right to fix: the engine has taken rules for every kind all along and only this
repo was dropping them. What it buys is a channel that works, not a capability that shows.

**2. The nodes must reproduce BOTH kinds, by chaining compounds in order.** *"the procedural nodes
should be able to reproduce both with combination and compounded nodes chained together in order"*.

This resolves the "never nodes" line below rather than contradicting it, and the distinction is the
whole design:

- **A node made of geometric primitives** (project, band, angle, combine) cannot express detection —
  eigen solvers, robust plane refits, graph walks, flood fills. That stands.
- **A node that IS an engine unit**, with compounds grouping units, reproduces both exactly, because
  the pipeline is already that chain. `crates/geometry-core/src/dental/trim/mod.rs`: *"One unit per
  step, each with its own tests; `trim_frame` only combines them."* The eigen solver lives inside a
  node instead of being built out of nodes.

So the vocabulary is the engine's own units, not a geometry algebra. **The acceptance test is parity:
chain the units as nodes and reproduce both kinds' output identically**, checked by `gate:real`,
which is how everything else here is proved. Anything that cannot be reproduced that way is a unit
nobody has exposed yet, not a reason to widen the primitives.

What it costs: the orchestrators (`dental/mod.rs`, `denture/mod.rs`) must declare their chain — each
step addressable, with typed inputs and outputs — instead of calling the next step inline.

### What the engine actually is

There is no single pipeline and no shared stage vocabulary. Each kind has its own call order:

| kind | call order | source |
|---|---|---|
| aligner | `orient` → `region` → `footprint` → `policy` → `tilt` | `crates/geometry-core/src/dental/README.md` |
| denture | `orient_denture` → `tilt::tilt_scan` → `policy::denture_policy`, over ~20 rule modules | `.../dental/denture/README.md` |

**Three facts that decide what benchwork can be**, each checked against the engine source:

1. **No ABI call accepts profile JSON.** Every dental entry point takes `profile: &str` and looks the
   profile up in a registry compiled into the wasm. So editing a profile *number* is not previewable
   at all: it needs `profiles:gen` → `wasm:build` → commit → `vendor:geometry`, a Rust rebuild per
   knob. The earlier version of this record treated liveness as a ray-count problem. It is an ABI
   problem.
2. **The live channel is named rule overrides, and it is already wired in this repo.**
   `RULE_NAMES` / `packRules` in `vendor/mixo-geocore/host/supports/generateRules.ts` feed the
   purpose-built `denture_policy_ruled`, `denture_review_ruled` and `denture_tilt_scan_ruled`, and
   `typelab/profileSelect.ts` already passes them through `MIXO_RULES` today.
   **The aligner has no `_ruled` variant**, so for aligners there is no live channel at all — which
   means benchwork begins as a denture tool, whatever the owner's ask says about all three.
3. **Most numbers benchwork would want are compile-time `const`s, not profile fields** —
   `denture/rim_lowpoints.rs`, `holes_axis.rs` (including the 5 mm hole band), `no_support.rs`,
   `oral_cavity_ray.rs` (the 45°), and every aligner `trim/` unit. Promoting one to profile schema is
   engine work, per number.

### Toggling exists. Reordering does not, and must not be offered

The first version's central affordance was an ordered combine the owner could reorder. **There is no
ordered rule list to reorder.** The combines are three hardcoded statements in
`denture/ruled_tips.rs` (allowed overrides no-support; the hole band is OR'd into allowed; the socket
cancel returns allowed), no single combined mask exists — precedence is re-derived per consumer — and
`allowed_cavity` is a snapshot taken mid-sequence, so moving one union earlier silently changes a
different rule's meaning. Worse, **placement is stateful**: a `Spacer` claims space in stream order
and drops whatever arrives later in a crowded spot, so reordering changes *which tips exist*.

A reorderable UI over that is a lie the tool would tell its operator. What the engine does offer is
**toggling and retuning by name**, plus integer modes that select among fixed clauses.
**Precedence-as-data is an engine handoff, not benchwork scope** — and it is the one rewiring anyone has
actually wanted, so it is worth asking for.

### What benchwork mechanically is

**A rules panel and a re-run route on the viewer that already exists**:
`typelab/viewer.html` + `serve.mjs`. That surface is already the owner's layout — live
detection above, numbers and toggleable layers below — with `dentureReviewLayers.ts`,
`layerColours.ts`, `rayLayers.ts` and `orientationEvidenceGlb.ts` drawing exactly the masks this
record calls node outputs, a per-case numbers panel, the real engine through `pkg-node`, and rule
override by name. Static, no build step, its own `tokens.css`.

So benchwork is one form plus one route in two existing files, not a new application. No graph library
is added; the surface is plain DOM rows in that viewer.

**Its home is `typelab/`, not `benchwork/`.** Benchwork's own first rule is *"No new
tooling here. Every stage below runs an existing script"* — an interactive tool breaks that on its
first commit. It is the same name as the folder on purpose. *(My call, not the owner's; say so if you
would rather it sat elsewhere.)*

### What it writes, and what reads it

**A JSON patch for a profile, and no new format: the export must be byte-identical to a
hand-written profile.** That keeps benchwork deletable at zero cost, and it means the reader is the
engine's existing loader rather than anything new. Three validations before a file leaves: an unknown
key is rejected, an out-of-range value is rejected, a rule name not in `RULE_NAMES` is rejected.

The burn sequence is the engine's own, and the first version of this record got it wrong three ways.
Correctly: drop the file in the right directory **for that kind** — `src/dental/profiles/` for an
aligner, `src/dental/denture/profiles/` for a denture, whose schemas differ and must never be copied
across — add the line to `ALL` for a denture, then `profiles:gen` → `wasm:build` → **`git commit`**
(`vendor:geometry` refuses a dirty checkout, by design) → `vendor:geometry`. The first two scripts
live in the engine repo, the second two here. And a runtime draft, if that ever exists, needs a
content-hash id, because detection caches on `{positions, indices, digest, profile}`.

### Done when

1. ~~One recompute is **measured** on a real scan before any UI is designed.~~ **DONE, 2026-11-20:
   22.2–22.7 s per case** on the reference denture, measured by benchwork itself, which prints the
   figure and its verdict every run. **So a live panel was never available.** Any future panel
   applies and waits, and that is a fact about the engine rather than a UI preference — which also
   retires the first version's open question 2, where this was treated as a ray-count problem.
2. The rules panel re-runs a selected case with named overrides and the viewer redraws its masks.
3. A round trip asserts it: author → export → read back → an engine run reproduces identical masks on
   one named fixture.
4. **No tuned rule leaves the bench without `npm run gate:real` green.**
5. What was reached for is logged each time — a number, a precedence change, or a new primitive. That
   log, not this record, decides whether anything further is built.

Input is one STL path as an argument through the existing `reviewCase.ts`; an absent fixture reports
and exits, counted, the way `gate:real` already handles owner-only scans. Every scan here is
git-ignored, so a fresh clone has no mesh and must say so rather than fail.

### What stays coded

**Never nodes: detection itself.** Not because of the "cannot decide" contract — that argument does
not discriminate, since a graph of nodes each returning a value or an inconclusive-with-evidence
would carry it identically — but because the leaf internals are eigen solvers, robust plane refits,
graph walks and flood fills. Those are not expressible in projections, bands, angles and combines.

And orientation is **already** a decomposed, separately tested graph in both kinds — the aligner's
`trim/` says *"One unit per step, each with its own tests; `trim_frame` only combines them"* — so
calling it a monolith understated the engine. benchwork exposes those units' numbers; it does not
replace their structure.

### What this does not solve

- **Night guard** is blocked on numbers nobody has, not on a tool.
- **Retainer** is blocked on what rim detection does with a wire.
- **Dental model** wants its own profile family and pipeline, as the denture has; it is not one
  missing primitive.
- **mixomesh portability**: benchwork is explicitly *not* portable. The app's edit UI remains the
  portable surface, and benchwork only writes numbers the engine already reads.
- Peak memory: one mesh, one session with a declared budget released on file change, one evidence
  layer resident at a time. Peak must stay flat in the number of rows.

### The error this record made

The first version asserted a six-stage engine model, a reorderable combine, thresholds that were
already profile fields, and a live preview — none of which exist. Every one came from writing up a
consult's analysis as if it were a reading of the source. **A synthesis is not a finding.** It is the
same mistake, in a document, that `feedback-run-it-before-you-write-it-down` records in code: the
tracing was coherent, and coherence is not evidence. The fix that generalises: a record that asserts
how the engine works cites the file that says so, per claim, or does not assert it.

### Status

**BUILT, 2026-11-20, `86c5e47`** — as a CLI rather than a panel, which is what the measurement above
made of it: `npm run benchwork -- --list`, `typelab/cli.mjs` with its rules and parsing in
`typelab/rules.mjs` and 13 tests. It turns the thirteen shortlisted rules, refuses before it spends
a run, writes `benchwork.json` beside the review, and prints the numbers a rule change moves. Output
goes to `typelab/output/`, which is git-ignored, so a review of patient scans cannot be staged by
accident. Proved end to end
on the reference denture: baseline 168 tips, `overhangAngleDeg=55` → 185 tips.

A panel in the viewer is the next increment and is **not** scheduled, because the measurement says it
would be an Apply button — worth having, worth nothing until the log below says which rules people
actually reach for. Specification corrected before any of it was built. It sits behind `PLAN.md` items 1 and 11, and behind the engine's own kinds-scheme
migration, whose doc says *"Do not invent a different one; finish this one."* **Admission to the app
is not automatic:** benchwork earns it when a profile authored in it has passed `gate:real` and shipped
as a type twice, authored by someone other than its builder. Until then it stays a bench tool, and
only its emitted profile ever reaches the product.

### WHO OWNS A NUMBER — the Fable consult of 2026-11-20, and what I verified of it

The owner's question, in their words: *"the values are default that can be edited inside dental,
mechanisms in detail can be mechanical and agnostic to be inside geocore, but the sequence should be
mixodental, and the values, default or not, be supplied by mixodental, as they should be configured
with the workbench when we create or edit a type?"* Per [[feedback-consult-fable]] this went to Fable
rather than to the owner's own adjudication. **Their model holds, with four corrections**, and the
load-bearing claims below were re-checked against the source before being written here.

**The rule for one constant, in order.** Ask: (1) does it describe the wire or the picture (stride,
sentinel, colour, tube radius, cache slot)? Engine const. (2) Can a synthetic unit test with no scan
prove it right, and does changing it alter only accuracy or speed (weld, epsilon, raster pitch,
iteration count, robust-fit trim)? Engine const. (3) Otherwise, **could two types legitimately
disagree on it?** Then it is a named profile field with its unit suffix: the app supplies the value,
and **the engine keeps the name, the unit and the legal RANGE but no production value.** The engine
owns the range because a policy number is meaningless without the engine's resolution -
`MIN_AREA_MM2 = 0.5` only means "speck" at `PITCH_MM = 0.3` (`holes_axis.rs:21-24`).

Within class 3 there is a third category the owner's two-way split misses: **what the machine SEES**
(thresholds, upright, `trim/`, `arch_slices`) is *calibration* - clinical, but workbench-only, and an
edit voids validation - while **what it then DOES** (pitch, bands, overhang, supports) is an operator
default, editable in the app. Of ~110 numeric consts in 34 non-test files: ~38 policy, ~26 tolerance
or sampling, 31 Witness colours and sizes, 6 ABI strides, 4 cache and budget, 5 fixtures.

**Where "supplied by mixodental" is too strong.** 73 engine test references across 27 files need
numbers to run, and `supports/rules.rs:1-3` records the owner's EARLIER rule that *Rust owns the
defaults* for the 128 named rules. The two rulings conflict, so they are split by layer: **generic
planner defaults stay in Rust; dental type values become the app's.**

**Verified against source (five claims, five confirmed).**

| Claim | Where | Consequence |
|---|---|---|
| The detection cache is keyed by profile **id**, not content | `dental/cache.rs:33-38` (`profile: String`) | Correct only while numbers cannot be edited. The moment a type's values are editable under a fixed id, a retune reuses the old verdict - which is house rule 6 of `ADDING-A-KIND-OR-TYPE.md` broken by its own cache. **This is why the digest key is step 1 and not step 4.** |
| A missing, NaN or infinite rule entry keeps the Rust default | `supports/rules.rs:179` (its own doc comment) | Lenient by design, and documented. Fine for an override channel, wrong for a type's own values: silence must not be a value. |
| `packRules` iterates `RULE_NAMES`, not the given keys | `vendor/mixo-geocore/host/supports/generateRules.ts:317-327` | **A rule passed under a name the engine does not know is silently ignored** - no throw, no warning, and the run looks successful. First law broken in live code. It has bitten once (`typelab/rules.mjs:14-18`). |
| `build.rs` embeds the aligner folder only; dentures use a hand-kept `ALL` | `build.rs:1-2`, `denture/profile.rs:15` | Doc said otherwise for both kinds; corrected in geocore `7e80728`. |
| The denture profile has no `fixture` field | `denture/profile.rs` | The shipped denture fails the doc's own re-validation test. Blocks authored types, which must be able to say they are UNVALIDATED. |

**The mechanism, so skew dies loudly.** One new ABI entry, not 25 changed signatures:
`register_profile(kind, json)` returns a content digest, and the existing `profile: &str` parameter
then accepts either a built-in id or that digest. The profile carries `schema: N`; the engine accepts
exactly its own N and throws `PROFILE_SCHEMA` with both numbers otherwise, `PROFILE_INVALID` with
serde's message for an unknown or missing key, and the two existing `#[serde(default)]` softeners go.
**The engine never migrates** - the app migrates with pure per-step functions, fills each new field
from the built-in explicitly, and marks the type UNVALIDATED. Engine-vs-host skew is already loud
(`geometry-wasm/src/lib.rs:47-51` refuses on a version mismatch); the NEW surface is *stored* types
and projects, and registration catches it at load rather than mid-job. **Profile values never travel
through the 128-rule array** - a type may pin a rule by name, and an unknown name is an error at type
load, not a shrug.

**The four tensions.** (a) Calibration values the tests were written against stay in the engine as
frozen fixtures (precedent: `profiles/testdata/second-aligner.json`); shipped values are validated by
`gate:real`, whose baselines already live in the app - the validation record lives with the value.
(b) Built-in ids stay reserved and grow-only; user types get a generated namespaced id, and **the
project file embeds the full snapshot** of any non-built-in type, because an unknown id is refused at
load today (`src/state/project.ts:741-745`) and browser storage does not travel with a file.
(c) The cache key becomes the content digest of the engine-read fields, computed at registration;
the cost is that every edit is a miss, about 23 s with two slots. (d) Types with no fixture are
**allowed and labelled**: validation is data on the type (scan-set mesh digests, engine version,
profile digest, the W4 count line), and a digest mismatch drops it to UNVALIDATED automatically,
shown wherever the type is selectable and on export.

**The order, and what must not be first.** 1. Cache keys by content digest (no ABI change; proof:
`gate:real` no-diff, plus a unit test that the same id with different numbers is a miss).
2. `schema` + `register_profile` (proof: register the embedded JSON text and get no diff against the
id path; then break it on purpose - drop a key, bump the schema, both must throw). 3. benchwork turns
profile numbers, removing its stated denture-only limit. 4. Promote policy consts to fields, one unit
at a time, at today's values, `gate:real` no-diff each - **while only two profile files exist.**
5. App type store, project snapshot, validation label, grow-only id test. 6. Last and optional: move
the built-in JSON to the app, which after step 2 saves only the vendor step.

**NOT first: moving the JSON files** - that creates the skew surface and the stale-cache hazard
before anything catches either. **And not shipping user types before step 4 is largely done**, since
every later promotion becomes a migration of customer data.

**Unverified, and named rather than filled.** Inline numeric literals that are not `const`
declarations are uncounted (`geometry-wasm/src/denture.rs:329,449` suggest some exist), so ~110 is a
floor. The const classes come from doc comments, not from tracing use. Where the denture profile id
is saved was not found - only the aligner path was read. And the argument for keeping Rust defaults
in the generic planner assumes at least one other app vendors it, which was not checked.
