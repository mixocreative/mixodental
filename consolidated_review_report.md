# Consolidated review — `docs/design/2026-11-05-rim-define-mode.md`

**Date:** 2026-11-06 · **Range:** whole file (1–538) · **Preset:** consolidated, all five stages
**Stage reports:** `zoom_out_report.md`, `comprehension_report.md`, `critic_report.md`,
`intermediate_zoom_out_report.md`, `implementation_readiness_report.md`
**Reviewers:** 8, each in a fresh context with no conversation history, given a reading list
(`egm-goldfish-context.md`) rather than the repository tree.

> An earlier, smaller review of this document ran the same morning; its report is in git history at
> `9987118`. Its two findings are closed: the hand-drawn rim reaching Step 2 (`ded4521`) and the rim
> overlay rendering (`3e8f679`), and the Delete point it said was missing is built (`652537a`).

---

## The short version

The document's **mechanics** survive scrutiny. Its engine-versus-host argument, its geometry
reasoning, its undo account and its engine paragraph were checked line by line and hold up — the list
of what was confirmed true is longer than the list of what was wrong, and is kept below because a
record is only worth repairing if most of it is sound.

Two defects run through everything else.

**Defect A is documentary.** The document was turned from a proposal into a record by *appending*
corrections rather than restating claims, so **whether a sentence is still true depends on how far
down the subsection you read.** About 35 of the ~45 findings are this one defect in different clothes.

**Defect B is substantive, and no single stage saw it whole: rim define mode is a one-way door.** It
is entered only by `dentalRimNeeded`, accepted only while the aligner is still `loading`, sent from
exactly one place, with no `dental.rim.enter`. Four findings that arrived separately are all
consequences of that single fact. **So §7's "one thing is left — the flip control" names the wrong
gap.** One re-entry route answers three findings; a flip arrow answers one, and Stage 9 showed it
cannot even be built as described.

---

## Code defects — verified, ranked

These are bugs, not documentation. Each was confirmed by reading the code in this session.

### 1. 🔴 Cancel leaves an orphan drawing, and the comment licensing the overlay says it doesn't
`rim/clear` is dispatched from exactly two places: the Clear command (`App.tsx:1144`) and Done
(`useRimDrawing.ts:135`). Nothing clears `rimDraft` on Cancel, Esc, Exit or stage change. Meanwhile
`UnitObject.tsx:432` renders the draft "whenever the unit holds one — not only while the mode is
open", justified by a comment that reads *"Leaving the mode by Cancel clears the drawing, so a draft
that still exists is one the operator is in the middle of."* That invariant does not hold. The
abandoned loop follows the operator into Step 1 and Step 2; the only control that could remove it is
`visible: rim`, so unreachable; and the undo floor rose at the stage change, so Undo cannot reach it.

### 2. 🔴 `rimDraft` is written to the project file, unvalidated, and a code comment denies it
`project.ts:51` says it is "NOT saved to the project file". It is: `normalizeUnit` spreads `...unit`
with no omission, `sceneJsonReplacer` passes it through, and `encodeProject` serialises
`normalizeScene(scene)`. On load, `cloneSurfacePath` — which validates `closed`, every vector, and the
three-anchor floor — is called **only** from the `rim/set` reducer, never for a loaded file. Defect 1
makes it reachable: Cancel, Exit, Save.
*(One reviewer asserted the opposite by repeating the false comment; a later stage caught it.)*

### 3. 🟡 The Adjust drag never takes the camera out of the gesture
Paint calls `beginStroke()`, which sets `controls.enabled = false`; the rim-drag branch returns
before reaching it, and `<OrbitControls enabled={!dragging}>` is driven only by the gizmo's
`dragging-changed`. The repo proves the point against itself — `beginStroke` exists precisely because
`stopPropagation` does not stop OrbitControls, which listens on the canvas element. So the view
orbits while an anchor is dragged. `u5d`/`u5e` cannot see it: both stay true while the camera swings.
**Read-level conclusion; not executed.**

### 4. 🟡 Delete point can be lit over a stale index
`rimDeleteReason` checks only `dentalRimSelected !== undefined` and the anchor count; it never
bounds-checks. `onRimDeletePoint` returns silently on `!hasAnchor`. Pick the last anchor, press the
app's Undo, press Delete point: nothing happens and nothing is said — the exact outcome the Undo
section sets out to forbid.

### 5. 🟡 The Cancel hint is false, in three languages
*"Leave rim define mode without a rim. Step 1 keeps the notice that sent you here"* — but the
handover deliberately drops the `failed` notice (`useDentalFlow.ts:169`, with a comment explaining
why showing it would be wrong). There is no notice to keep. Translated into ja and zh-Hant.

### 6. 🟡 After Cancel, Step 1 is a dead end with no explanation
No rim, no proposal, no notice; `next()` answers *"No aligner opening was found… Go Back and choose
another file, or Exit."* And the door is bolted twice: the only event that could put Step 1 back into
`loading` is `switchDentalProfile` via the `u7` row, and `profilesWithoutOpening()` is empty today, so
that row renders a sentence and **no button at all**. **This is a strictly worse screen than the dead
end the feature was built to remove.**

---

## Document fixes — the smallest set that works

Stage 8 was asked for the *smallest* set rather than the longest list. Four edits, in order:

1. **One "As shipped" block under the banner**, replacing the banner's two-item reversal list, stating
   six facts in six sentences: the entry condition and why the other two failure paths keep the old
   notice; that Done is final; that Cancel loses the rim, re-creates the dead end and leaves the
   drawing on the model; that the drawing is `PrintUnit.rimDraft`; that the flip is a parameter with
   no control; and that the remaining gap is re-entry. Then **stamp §5 and §6 as pre-engine history
   in one line each** rather than rewriting them.
2. **Sentence-level corrections in place:** delete line 397 (`offerUndo`); correct the projection rule
   at 241–244 (interpolated anchor normals, 2 mm back-off, inward then outward, misses keep the chord
   position; spacing is a module constant); re-title line 53 to *"`boundaryKind` gates authority, not
   visibility"*; correct 225–226 on what Cancel costs. Add the four claims Stage 9 found false: the
   Free-transform handover, the entry event and the stage union, the live overlay being
   `RimDraftLayer`, and the anchor pick being `grabAnchor` on the model hit rather than pickable
   instanced handles.
3. **Strip the line numbers from the ~40 citations, keep the symbols and paths.** Refreshing them
   guarantees they rot again — two rotted *today*, by edits that made the document more accurate.
4. **Rewrite §7's "What is left" to name re-entry as the gap**, demote the flip arrow to a consequence
   of it, and list the code defects above as defects.

---

## Rejected, demoted and refuted — on the record

A review that only accumulates is worth less than one that also discards.

- **REFUTED.** "`rimDraft` is not written to the project file" — repeated from the false code comment.
  The opposite is true (defect 2).
- **DEMOTED.** "The drawn loop does not bound the permitted area." The facts hold —
  `rasterize_visible_surface` never receives the loop — but `make_rim` is the **same function the
  detected path uses**, so no rim has ever been loop-clipped, and the document says as much at line
  130. The proposed remedy, clipping the raster in the engine, would change detected-rim behaviour on
  a safety path to fix a legend-reading risk `DentalRegionLines` has always carried. **Remedy: one
  sentence in §1.** *(This also corrects something I told the owner mid-review: I framed a
  long-standing property as a regression introduced by this morning's colour change.)*
- **DEMOTED.** "~60 rotted citations" — real, but the remedy is deletion, not refreshing.
- **RUBRIC ARTEFACT.** "Done is the one edit Undo cannot reach" — that is the flow-wide rule, written
  at `flow.ts:37–42`. Rim define is not special.
- **REJECTED.** Splitting the document; adding Goals / Non-Goals / Risks headings; the ALL-CAPS,
  bold-saturation and "worth stating" items. These impose a proposal template on a record whose own
  banner says it is not one, and describe the repo's house voice. Acting on them is churn.

---

## Confirmed true, and worth keeping

Checked against code and found accurate: `rustRaycast`'s world point and local normal, and the miss
that lets r3f fire `onPointerMissed`. `ViewportPort`'s `SurfacePick` shape and its `pick` being dead in
production. `dragOver`'s "a press on empty space belongs to the camera" and `stroke.begin` accepting
only button 0. **The gizmo really is hidden for free, with no new flag.** The entire undo account.
`DentalRimOutline`'s every rendering detail. **§4's geometry reasoning in full** — the Newell refusal,
the bowtie reporting `SELF_INTERSECTING` and `DEGENERATE_AREA` but not `COLLINEAR`, the injected
`ProjectToSurface`, `removeAnchor` refusing below three with the dock answering in the exact quoted
sentence. `imports.test.ts` enforcing the no-React/three/DOM rule. **§3's engine paragraph in every
checkable particular**, including `floor_offset` being area-weighted at the 40% and 60% points. §3's
test and walk citations, including that `u5e5` requires the vacated spot OFF and an untouched corner ON.

And the document's own **best undocumented decision**: the shipped code distinguishes "detection ran
and found no rim" from "we could not look", with a good rationale at `useDentalFlow.ts:168–178`. One
reviewer flagged the contract as wrong; what is actually true is that the shipped distinction is
better than the design, and the record is poorer than the thing it records. Here the fix is to add
reasoning, not to correct a claim.

---

## Why the flip control cannot be built as written

`sideUncertain` is knowable only **after** the engine call, which happens only inside `onRimDone` —
the same batch that clears the draft and leaves the stage. And `sideUncertain`, `floorOffset` and
`flipped` are consumed **only** as a status sentence: no session field, no `UiState` field, nothing on
the stored policy. **After Done, no part of the application knows the side was ever in doubt.**

So "show the flip control" names neither a moment nor a state. A pre-Done toggle needs a speculative
second engine call the code argues against; a post-Done control needs a persisted fact that does not
exist and a way back into a mode that cannot be re-entered. The mask is rasterised in Rust, so turning
an arrow over is a re-call, not a sign flip — the most load-bearing fact for this work, and the
document never states it.

**And it cannot be verified:** the only test producing `sideUncertain` fakes the engine, the walk never
reaches an uncertain rim, and no fixture in the repo trips the threshold.

---

## What the owner is being asked

The six code defects are bugs and need no decision beyond "go". The real decision is **whether to build
a re-entry route into rim define mode.** It dissolves defects 1, 5 and 6 and makes the flip control
buildable at all; without it, the honest move is to record in §7 that a wrong opening side is
unrecoverable without re-importing the file.
