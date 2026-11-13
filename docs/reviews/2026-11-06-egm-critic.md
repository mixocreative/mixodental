# Stage 7 — Critic review (design, structural, style)

**Target:** `docs/design/2026-11-05-rim-define-mode.md`, lines 1–538
**Standard:** `resources/document_standards/feature-spec-standard.md` (design, structural)
**Date:** 2026-11-06 · Three reviewers, run in parallel, no shared context.

---

## Design critic

**Verdict.** The mechanics are argued well and the Alternatives Rule is met better than most specs.
It fails the Risks & Limits bar, specifically on the three things that decide whether a drawn rim
is safe or recoverable: what the loop authorises, how a wrong opening side gets fixed, and what
Cancel and Done leave behind.

### 🔴 Blocker 1 — the drawn loop does not bound the permitted area

`rim_from_points` uses the points for four things only: the plane normal, the centroid, the
tangent basis, and `Rim.points` as a polyline (geocore `rim.rs:162–181`). The mask comes from
`rasterize_visible_surface(mesh, centroid, opening, tangent, bitangent)`, whose bounds are taken
over **every vertex of the mesh** and which depth-rasters **every face** (`rim.rs:334–379`). The
loop never clips it. `rim_contains` (`legacy.rs:33–48`) reads only the mask and the frame.

So the loop's shape and extent are, for authorisation, decorative — a sloppy loop with roughly the
right plane yields nearly the same mask as a careful one. The document's own measurement is the
evidence (5104 vs 5089 cells, differing only around the silhouette margin).

Yet the correction at lines 86–89 recolours the loop `--mark-area-edge`, the legend's "Edge of
that area". An operator reading the legend will believe paint outside the loop is refused. It is
not. **Either clip the raster to the loop interior in the engine, or stop giving the loop the
area-edge colour and the legend entry that implies containment.**

### 🔴 Blocker 2 — a side-uncertain rim cannot be corrected

`drawnRim(..., flip = false)` has a default and `useRimDrawing.ts:126` never passes it; no other
caller exists. Done clears the draft and moves the stage to `aligner`, and `dentalRimNeeded` is
accepted only from `aligner`/`loading` (`editingMode.ts:227–228`), so the mode cannot be reopened
for an aligner already read. When the engine reports `rim-side-uncertain` the host says "Check the
aligner is the right way up" and then offers no action that could change the answer: the drawing is
gone, the mode is shut, and `flip` has no route from the UI. The hazard is the one the code comment
names — every support on the fitting surface.

The document calls this "a refinement rather than a gap". That is its clearest misjudgment: it is
the missing recovery path for the one quantity the design admits it cannot determine, on the
safety-relevant axis. `drawnRim.test.ts:83` makes the plumbing look wired when the only production
caller hard-codes `false`.

### 🟡 Major 3 — Cancel leaves an orphan drawing, and the code asserts the opposite
`rim/clear` is dispatched in exactly two places: Clear (`App.tsx:1144`) and Done
(`useRimDrawing.ts:135`). Nothing clears `rimDraft` on Cancel, Esc, Exit or stage change.
`UnitObject.tsx:433–435` renders the draft in every step on the stated premise that "Leaving the
mode by Cancel clears the drawing" — false. The loop follows the operator into Step 1 and Step 2,
and the only control that could remove it is `visible: rim`, i.e. unreachable. Undo cannot reach it
either: the stage change raises the per-step undo floor, putting the draft below it.

### 🟡 Major 4 — Done is the one edit Undo cannot reach
`dentalRimDefined` changes the stage, so the floor is re-set *after* Done's batch lands. The mode's
cheap edits are all undoable and the one expensive, irreversible edit is not — the inverse of what
a reader of the Undo section would expect.

### 🟡 Major 5 — the Adjust drag never takes the camera out of the gesture
The Adjust branch calls `event.stopPropagation()` and sets local state; it never does what paint
does (`controls.enabled = false`) nor what the gizmo does (`dragging` → `OrbitControls enabled`).
r3f's `stopPropagation` governs r3f's object bubbling; drei's OrbitControls listens on the canvas
DOM element — which is why `beginStroke` disables it explicitly. Expect the view to orbit while an
anchor is dragged. In Place the same gap means a camera drag begun on the model drops an anchor,
since `clickModel` fires on release with no movement threshold. **Behavioural consequence inferred
from reading, not executed.** Walks `u5d`/`u5e` would not catch either symptom.

### 🟡 Major 6 — the resample's own quality signal is computed and discarded
`ResampledPath` carries `samples` and `projected` with the comment "so the caller can speak up";
`drawnRim` throws both away. A sample whose projection misses keeps its straight-line position, so
a loop spanning a hole or a deep concavity becomes a rim built partly from points off the mesh —
and those points then fix the plane, the centroid and the frame. No threshold, no warning.

### 🟡 Major 7 — validation runs on the anchors; the engine sees the resampled curve
`pathProblems` judges the anchor polygon in its fitted plane; the engine receives the dense curve
and only ever rejects `Collinear`. A simple polygon can resample into a self-crossing curve around
a shell. And the one reachable refusal is answered with "This rim could not be built from the
points as drawn" — the only message in the mode that says nothing specific, against the file's own
banner "EVERY REFUSAL SAYS SOMETHING".

### 🟡 Major 8 — Delete point can be enabled over a stale index
`rimDeleteReason` gates on `dentalRimSelected !== undefined` and the anchor count; it never
bounds-checks the index. Pick the last anchor, press the app's Undo, and Delete point stays lit
over an index that no longer exists — `onRimDeletePoint` bails on `!hasAnchor` with no message. A
button that does nothing when pressed, which the Undo section explicitly sets out to avoid.

### 🟡 Major 9 — "scene state, not project state" is load-bearing and its cost is unstated
A save/reload mid-drawing loses the work with no warning; the draft rides in every history
snapshot; and the placement is what lets the orphan in Major 3 survive below the undo floor. Also
unspecified: `onRimPoint` writes to the unit the pointer hit while Done reads
`session.dentalUnitId`, and the invariant that these are the same unit is never stated.

### 🟡 Major 10 — switching off the print-angle scan is a second decision wearing one quote
"No auto detect" in the owner's words is about re-detection. The document extends it to the
print-angle scan. The consequence — drawn-rim aligners are oriented entirely by hand with no angle
scan — is the largest safety difference from a detected one, and is recorded as a UI fact rather
than an accepted risk.

### 🟡 Major 11 — no Goals/Non-Goals, no consolidated Risks, no acceptance bar
No numeric acceptance criteria for a "good enough" rim: no anchor-count guidance, no mm tolerance,
no minimum fraction of the curve that must lie on the mesh.

### 🟢 Nits
Wording lives in two places despite the claim (`useRimDrawing.ts` holds four English sentences
inline). `RIM_SAMPLE_SPACING_MM = 0.5` is justified by an uncited claim about downstream consumers.
`closesLoop` uses `radius × 1.6` and `grabAnchor` `radius × 2`, so a click between the two reaches
stacks a second anchor instead of closing. In-repo tests exercise a stubbed engine only, so this
repo has no check that would fail if the engine contract changed.

### Where the design was judged sound
The host/engine split on the mask, and option 2's rejection ("a second source of truth for a safety
mask"). `src/core/surfacePath/` being framework-free with an injected projection. The Newell's-method
trap. Deciding the opening sign from `orient::floor_offset` — verified pose-free. Putting the pick
in the session rather than the scene. One command per edit.

---

## Structural critic

**Verdict: fails the standard as a feature-specification record.** The heading hierarchy is clean
and the numbering continuous; the failure is that **shipped status is carried by five different
non-hierarchical devices**, none visible in the outline, so currency depends on how far down a
paragraph the reader gets.

- 🔴 **Line 397 states a requirement line 318 already reversed, unmarked** — same section, 80 lines
  apart, opposite instructions, inside the subsection a fresh engineer is pointed at.
- 🔴 **The banner's inventory of reversals is incomplete** (lines 9–11 promise two; the body has at
  least five). Being the only global index of what is no longer true, its undercount licenses a
  reader to trust line 397.
- 🔴 **Section 6 is titled "all answered"** over an item ending in a question mark and a superseded
  recommendation; only items 1 and 5 are answered in the section's own idiom.
- 🔴 **Section 5 "Verification" is wholly stale** — "Still to write … both need the engine call",
  "once the geocore call exists" — while the banner says the call shipped. The section named
  Verification is the least current place in the document.
- 🟡 Five competing correction devices (H4 heading, H3 title suffix, bold sentence, bold lead-in
  paragraph, unmarked parenthetical). Only one appears in the outline.
- 🟡 Corrections sit *after* the text they correct, contradicting the document's own rule at line 27
  that divergence is marked "at the place the superseded claim appears".
- 🟡 The document should be split: section 7 plus the banner plus the corrections are an as-built
  record trying to escape seven scattered locations.
- 🟡 Section 3's scope is broken by an 84-line codebase survey (341–424) that is not UI, duplicates
  section 7, and is where the stale `offerUndo` claim hides.
- 🟡 Standard headings absent: Problem Statement is unheaded prose; no Goals/Non-Goals; Alternatives
  exist but are scattered across four sections with no index; no Risks & Mitigations.
- 🟢 No table of contents; bold-as-heading used ~10 times invisibly to the outline; ALL CAPS as a
  third emphasis level; one stray double blank line; one untagged code fence.

---

## Style critic

Compliance noted up front: no centred prose anywhere, plain English throughout, no marketing
register, and stable terminology for the main actors.

- 🔴 **Section 5 asks for work reported as done elsewhere, and for a test it elsewhere forbids** —
  "both need the engine call" against the banner's engine 61; the golden comparison it calls "the
  strongest test available here" is already measured with numbers at lines 151–162; and line 166
  says the bit-comparison "was never achievable and should not be asked for".
- 🔴 **Line 53's heading contradicts its own correction.** "`boundaryKind` is not an authority gate"
  versus line 80 ("says whether a loop may AUTHORISE") and line 502 ("is an authority signal and not
  a visibility one"). The heading is what a skimmer reads. It should say it gates authority, not
  visibility.
- 🔴 Line 397 versus 318–320, unmarked (as structural, independently).
- 🔴 Section 6's "all answered" over four unanswered items (as structural, independently).
- 🟡 Requirement-then-correction ordering means the first answer encountered is always the
  superseded one. Lead each subsection with what shipped; demote the original argument beneath it.
- 🟡 ALL CAPS as a third emphasis level on top of bold and italic; caps should be reserved for real
  identifiers, which are already in code spans.
- 🟡 Bold saturation, including on single function words inside sentences — the page has no quiet
  text for the bold to stand against.
- 🟡 Line 45 puts an argument inside a reference table ("9216 bytes. **This is the problem.**"), and
  the claim is now historical.
- 🟡 Line 445 still presents `facingNormal` as a working part of `frame.ts`, which lines 282–285 deny.
- 🟡 "key" means both button and keyboard shortcut, in a document that argues about both in the same
  paragraphs.
- 🟡 Anchor vs point: lines 235–237 insist the rim's `points` are not the anchors, while the shipped
  control is "Delete point" and the refusal says "at least three points", both meaning anchors.
- 🟡 Stale "today" in a dated record, and line 146 asks the reader to decide something decided.
- 🟢 "Worth stating / worth knowing / worth keeping" as a tic, nine times. Second person at line 399.
  Quoted owner typos with no stated convention. Several unmeasured superlatives.
