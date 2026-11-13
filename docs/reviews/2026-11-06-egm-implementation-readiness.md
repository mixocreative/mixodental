# Stage 9 — Implementation readiness and claim-level audit

**Target:** `docs/design/2026-11-05-rim-define-mode.md`, lines 205–538 (sections 3–7)
**Standard:** `resources/document_standards/implementation-readiness-standard.md`
**Date:** 2026-11-06 · Two reviewers. `egm-style` was **not** run: it reviewed the whole document in
Stage 7 and Stage 8 judged those findings house voice rather than defects, so a second pass over a
subrange would repeat work already assessed.

---

## Part A — Readiness: could someone be told "finish it" tomorrow?

**Verdict: no.** They could not start the named work without making three design decisions the
document leaves open. Section 7's "What is left" is a one-sentence wish, not an implementation item.

### 🔴 Blocker 1 — the flip control has no specified moment, and the two possible moments are different features

`sideUncertain` is only knowable **after** `dental_rim_from_points` runs, and that call happens only
inside `onRimDone` — the same batch that issues `rim/clear` and sends `dentalRimDefined`. **By the
time the operator learns the side is doubtful, the mode is closed and the drawing is deleted.**

So the implementer must choose:

- **(a) A pre-Done toggle in the rim dock.** The `flip` parameter already exists; `useRimDrawing`
  passes four arguments where `drawnRim` takes five. But pre-Done the operator has no reason to touch
  it — nothing has told them the side is uncertain. Making it meaningful needs a speculative engine
  call on every close, a second `withDentalMesh` mesh load, which the comment at
  `useRimDrawing.ts:106–109` explicitly argues against.
- **(b) A post-Done control in Step 1.** Feasible only because `unit.dental.rim.points` survives in
  the policy, so the dense curve can be re-submitted; the draft cannot, it was cleared. Nothing in
  the document says this is the route, or that `rim.points` is the input.

Either way the host cannot avoid the engine: the mask is rasterised in Rust and `drawnRim.ts:8–21`
says why a host-side raster is forbidden. **"Turning an arrow over" is necessarily a re-call, not a
sign flip** — the most load-bearing fact for this work, and the document never states it.

### 🔴 Blocker 2 — the state the control needs is thrown away

`sideUncertain`, `floorOffset` and `flipped` are consumed **only** as a transient status sentence
(`useRimDrawing.ts:143–145`). They are in no session field, no `UiState` field, and not in the stored
policy: `manualAreaPolicy` returns `{kind, origin, profileId, rim, stamps}`. `dentalRimDefined` also
clears `dentalNotices`. **After Done, no piece of application state knows the side was doubtful**, so
a post-Done control has no predicate for `visible`/`enabled`, and a reloaded project has none either.
The document treats this as presentation ("a sentence rather than an arrow"); it is a missing
persisted fact, and if it belongs on the policy it is a serialized-schema change the document never
acknowledges.

### 🔴 Blocker 3 — two live, contradictory designs for the same control

§6 item 3 still offers "a visible, flippable arrow … **or asked outright as one step of the mode**",
under a heading declaring §6 answered; §7 says an arrow. Neither is marked superseded, and these are
not cosmetic variants: "asked outright as one step of the mode" is route (a); the §7 arrow is route (b).

### 🟡 Major 4 — no change surface
Lines 417–424 are the right shape — the stage addition enumerated down to `reduceDental`,
`registerCommands` and the key table. "What is left" gives no equivalent, though one is derivable: a
new id in the `CommandIds` augmentation; a registry entry with `role`, `label`, `hint`, `visible`,
`enabled`, `disabledReason` — which means **authoring operator-facing wording and a refusal
sentence**, neither of which the document supplies; a `case` in the command runner; the key ladder if
it takes a shortcut (`P`, `A`, `Delete`, `Escape` are taken); and a render site.

### 🟡 Major 5 — the uncertain state cannot be reproduced, so the work cannot be verified
The only test producing `sideUncertain` fakes the engine. The walk drives the real engine but never
reaches an uncertain rim, and nothing in the repo names a fixture that does. The threshold lives in
geocore and the document gives neither its value nor a shape that trips it. **An engineer can build
the control and has no way to see it appear.** Minimum owed: a named fixture or profile override that
yields `rim-side-uncertain`, and a walk id.

### 🟡 Major 6 — what they would most likely break: a re-entry that silently does nothing
The natural first attempt at route (b) is to reopen the mode. `dentalRimNeeded` is accepted only when
`dentalStage === 'aligner' && dentalAligner === 'loading'`; after Done the stage is `aligner`/`ready`,
so the reducer returns `state` unchanged — no throw, no status, no log. A no-op button.

Second likely breakage: a post-Done re-call must re-wrap through `manualAreaPolicy`, which hard-codes
`stamps: []`. **Flipping after the operator has painted in Step 2 would discard their paint.**

### 🟢 Nits
"A refinement rather than a gap" sets the wrong priority. `flipped()` is read into the outcome and
then discarded by every caller, which matters for a toggle's pressed state. Rim `UiState` is assembled
from `activeUnit` while `useRimDrawing` reads `session.dentalUnitId`; any new flip state must pick one.

### What the document supplies adequately
The *shipped* mechanism's state ownership is documented and correct: the drawing as scene state, the
pick as session state and when it is cleared, the one-shot engine call, `flip` existing with a
passthrough test, and the registry/command/key pattern to copy. The gap is specifically the
*remaining* work — the existing mechanism is better described than it is specified forward.

---

## Part B — Claim-level audit: what the document says about the code

### FALSE

**Major 1 — "Done leads to Free transform" / "the gizmo appearing again *is* the handover".**
Lines 294, 378–379, 420. `dentalRimDefined` touches nothing related to Free transform;
`useFreeTransform` resets to `FREE_OFF` on every stage change and only `'confirm'` sets `free: true`.
After Done the operator lands in Step 1 with Free transform **off and no gizmo at all**. The handover
the document calls automatic requires two explicit operator actions.

**Major 2 — the stage transition is attributed to the wrong event, and the quoted union is the old one.**
Line 420 names `dentalOrientFailed` and `rimDefined`. `dentalOrientFailed` still exists and still does
what it always did; the **new** event `dentalRimNeeded` sets `dentalStage: 'rim'`, plus
`dentalRimTool: 'place'` and `dentalRimOwn: true`. The exit event is `dentalRimDefined`. The shipped
union is `'type' | 'aligner' | 'rim' | 'area' | 'review'`. A maintainer would hunt a transition that
does not exist and miss that both events are live with different meanings.

**Major 3 — "the live drawing overlay is that component with an open loop".** Line 406.
`DentalRimOutline` is not used for the draft at all; the drawing is `RimDraftLayer` — `lineSegments`
over chord pairs, one sphere per anchor, a 1.7× translucent sphere for the pick, a see-through one for
the preview. `DentalRimOutline` renders the **saved** rim only.

**Major 4 — the anchor-handle mechanism as described is not what shipped.** Lines 410–412 say
"instanced torus or sphere picked by the same `rustRaycast` path". The markers are individually
rendered spheres and are explicitly **not pickable** (`raycast={() => undefined}` on the group and
every mesh). An anchor is picked from the *model* hit via `grabAnchor`, nearest within
`RIM_GRAB_REACH_MM = 0.84 mm`. **This distance-based pick is the mode's central new mechanism — the
walk's own comments say the `u5e2`–`u5e5` layout exists because of its reach — and sections 3–7 never
mention it.**

**Major 5 — "it is `onObject`, already written and in use" is false for this mode.** The rim drag
never reaches `dragOver`/`stroke`: `startStroke` takes the rim branch and returns before
`brushStroke.begin`. "Where the drag starts decides" is re-implemented by `grabAnchor` returning
`undefined`. The sentence sends a maintainer to a seam the feature does not use.

### Nits, all verified
The refusals are in the dock, not the badge. §4 says `src/dental/rim/` owns the stage and the overlay;
the stage is in `editingMode.ts` and the overlay in `RimDraftLayer.tsx`, as §7 correctly says — §4
contradicts §7. `onAddContact` has moved to `useSupportEdits.ts` (a wrong file, not just a rotted
line). The rim dock renders from `DentalBar.tsx`, not the cited `App.tsx` panel chain. §5 claims
"checks lean on `data-ui` names, never prose", but the rim walk drives every control by visible label
and gates on badge prose. "No draggable in-scene handle — confirmed by grep" still reads present tense
in a record whose §7 says the handle is built.

### Checked and TRUE — worth keeping
`rustRaycast`'s world point and local normal, and the miss that lets r3f fire `onPointerMissed`.
`ViewportPort`'s `SurfacePick` shape and its `pick` being dead in production. `dragOver`'s "A press on
empty space belongs to the camera", `stroke.begin` accepting only button 0, and paint's
`controls.enabled` handling. **The gizmo really is hidden for free** — no new flag was needed (only
the "appears again on Done" half is wrong). The whole undo account: `SceneHistory`, `HISTORY_LIMIT`,
coalescing by `history.open`, `canUndo` against the floor, `undoFloor` per dental step,
`restoreStep` as one entry, and one dispatch per Adjust drag from a window-level handler.
`DentalRimOutline`'s every rendering detail. The three cited precedents and the `<line>`-is-SVG trap.
**§4's geometry reasoning in full**, including the Newell refusal, the bowtie reporting
`SELF_INTERSECTING` and `DEGENERATE_AREA` but not `COLLINEAR`, the injected `ProjectToSurface`, and
`removeAnchor` refusing below three with the dock answering in the exact quoted sentence.
`imports.test.ts` really does enforce the no-React/three/DOM rule for `src/core/**`. **§3's engine
paragraph in every checkable particular**, including `floor_offset` being area-weighted at the 40%
and 60% points, and the host signature verbatim in the generated `.d.ts`. §3's test and walk citations,
including that `u5e5` presses the vacated spot requiring OFF then an untouched corner requiring ON.

### Could not check
The reference rim's 158-point count (only source is the comment the document paraphrases). The geocore
commit id (no VCS access from that role; the engine-61 *behaviour* is present). "Watched to fail
against a deliberately wrong index" — a claim about a past run. Walk pass/fail — the file was read,
not executed. Whether 0.5 mm spacing yields ~158 points, which depends on the first item.
