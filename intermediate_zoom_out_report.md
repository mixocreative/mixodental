# Stage 8 — Intermediate zoom-out (whole-shape)

**Target:** `docs/design/2026-11-05-rim-define-mode.md`, lines 1–538
**Read first:** `zoom_out_report.md`, `comprehension_report.md`, `critic_report.md`
**Date:** 2026-11-06

This pass was asked four questions the earlier stages could not answer, because each saw only its
own rubric: whether the findings point at one defect or several, which findings are **wrong or
overstated**, what everything missed, and what the *smallest* fix set is.

---

## 1. Two defects, and each stage saw half of each

**Defect A — documentary. It explains roughly 35 of the ~45 findings.** The document was converted
from proposal to record by **appending** corrections rather than restating the claim, so currency
is *positional*: whether a sentence is still true depends on how far down the subsection the reader
got. The unmarked `offerUndo` reversal, the stale §5, §6's "all answered", line 53's heading, line
45's "This is the problem", the projection rule, "a profile constant", "Use detected must be
hidden", the entry contract, `facingNormal` in the §4 table, the rotted line numbers, the banner's
undercount — all one defect wearing different rubrics. The structural critic named the mechanism;
the others reported its symptoms one at a time.

**Defect B — substantive, and no stage named it as one thing: rim define mode is a one-way door.**
The mode is entered only by `dentalRimNeeded`, accepted only while
`dentalStage === 'aligner' && dentalAligner === 'loading'` (`editingMode.ts:226–228`), sent from
exactly one place (`useDentalFlow.ts:179–183`). There is no `dental.rim.enter`. Four separately
reported findings are consequences of this one fact:

- Cancel returns to Step 1 with no rim, no proposal and no notice, so `next()` dead-ends.
- The drawing is not cleared on Cancel, so the orphan loop follows the operator forward.
- Done crosses a stage boundary, so the undo floor is re-set after its batch lands.
- A `rim-side-uncertain` rim cannot be corrected, because `flip` has no UI route and the mode
  cannot be reopened.

**So §7's "one thing is left … the flip control" is the wrong diagnosis of the wrong gap. The
missing piece is a way back in.** One re-entry route answers Cancel's dead end, the orphan drawing
and side-uncertain recovery at once. A flip arrow answers only the third.

---

## 2. Findings that are wrong, overstated, or rubric artefacts

**WRONG — do not act on it.** Comprehension #12's claim that "`rimDraft` is explicitly not written
to the project file" repeats a code comment that is itself false. See Blocker 2 below.

**OVERSTATED — true facts, wrong conclusion.** The design critic's Blocker 1 ("the drawn loop does
not bound the permitted area"). The facts check out, but `make_rim` is the **same function the
detected path uses**, so no rim has ever been loop-clipped, and the document already says so at
lines 130–132 ("wherever any surface is visible, not an independently segmented trim footprint").
The proposed remedy — clip the raster in the engine — would change detected-rim behaviour on a
safety path to fix a legend-reading risk that `DentalRegionLines` already carries. **Demote to a
one-sentence clarification: the loop sets the frame, not the boundary.**

**OVERSTATED REMEDY.** The ~60 rotted line citations are real, but refreshing sixty numbers in a
dated record guarantees they rot again. **Delete the numbers, keep the symbols** — which the
finding's own reasoning supports.

**RUBRIC ARTEFACT.** The critic's "Done is the one edit Undo cannot reach" is the flow-wide rule,
documented at `flow.ts:37–42`: "Undo never takes back the pose Next accepted; Back is the way to an
earlier step." Rim define is not special. One sentence at most; not a defect.

**RUBRIC ARTEFACTS — REJECT.** "The document should be split"; adding Goals / Non-Goals / Risks
headings; the ALL-CAPS, bold-saturation and "worth stating" items. Applying a feature-spec template
to a shipped record means rewriting a historical document to satisfy a form its own banner declares
it is not, and the voice findings describe the repo's house register, which appears in every source
comment. Acting on them is churn.

**PARTLY RUBRIC-DRIVEN.** "Every behavioural constant must be documented" — a record does not need
to re-list constants that live beside their own comments. The part that matters is narrow: the
spacing is a module constant, not "a profile constant", and the projection rule is simply wrong.

---

## 3. What every stage missed

1. **The dead end is sealed twice over.** The only event that can put Step 1 back into `loading` is
   `switchDentalProfile` via the `u7` row — and `profilesWithoutOpening()` is empty today, so that
   row renders a sentence and **no switch button at all** (`OrientationBar.tsx:90–94`). There is no
   reachable re-entry whatsoever. This also gives §6 item 4 a third answer nobody offered: the row
   is the natural re-entry point, and should be kept and extended, not deleted.
2. **Cancel's three faults land on one screen.** After Cancel the operator sees their drawing still
   on the model (with a code comment asserting the opposite in writing), no notice explaining
   anything, and a Next telling them to choose another file. That is a strictly worse screen than
   the dead end the feature was built to remove — the sharpest possible statement of the document's
   own thesis failing, and absent from all three reports.
3. **The document is missing its own best decision.** The shipped code distinguishes "detection ran
   and found no rim" from "we could not look", with a good written rationale at
   `useDentalFlow.ts:168–178`. Comprehension flagged the contract as *wrong*; nobody said the
   shipped distinction is **better than the design**, and that the document is poorer than the thing
   it records. Here the fix is to add reasoning, not correct a claim.
4. **"39 tests" is simply wrong, not a counting convention.** 32 blocks across the four files, and
   no `.each` anywhere to explain a gap.

---

## 4. The smallest set of changes that fixes the document

Four edits, in order. Together they discharge every Blocker and Major across the three prior
reports except the code bugs, which belong on a different list.

1. **One "As shipped" block directly under the banner**, replacing the banner's two-item reversal
   list, stating six facts in six sentences: the entry condition and why the other two failures keep
   the notice; that Done is final and leaves no way back; that Cancel loses the rim, re-creates the
   dead end and leaves the drawing on the model; that the drawing is `PrintUnit.rimDraft`, scene
   state; that the flip is a parameter with no control; and that the remaining gap is re-entry. Then
   **stamp §5 and §6 as pre-engine history in one line each** instead of rewriting them.
2. **Four sentence-level corrections in place:** line 397 (delete it), 241–244 (the real projection
   rule), line 53's heading ("gates authority, not visibility"), 225–226 (what Cancel actually costs).
3. **Strip the line numbers from the ~60 citations, keep the symbols and paths.**
4. **Rewrite §7's "What is left" to name re-entry as the gap**, demote the flip arrow to a
   consequence of it, and list the two known code defects as defects.

**Explicitly not worth doing:** splitting the document; Goals/Non-Goals/Risks headings; refreshing
line numbers; documenting every module constant; clipping the raster in the engine; the voice items.

---

## Findings by priority

**🔴 Blocker 1 — the one-way door (defect B).** The document presents the mode as a detour and the
flip control as the last piece. Shipped, the mode cannot be re-entered, Cancel is unrecoverable and
leaves a visible orphan drawing, and a side-uncertain rim has no correction path.

**🔴 Blocker 2 — `rimDraft` reaches the project file, unvalidated, and a code comment denies it.**
`project.ts:51–53` versus `projectFile.ts:12–14` and `project.ts:299–303`. Either strip `rimDraft`
in `normalizeUnit` or validate it on load; either way the comment is false, and one prior report
repeated it as fact.

**🟡 Major 3 — defect A, as four wrong sentences and two stale sections.** Fix items 1 and 2.

**🟡 Major 4 — the Adjust drag never takes the camera out of the gesture (code).** `controls.enabled
= false` happens solely in `beginStroke`; `OrbitControls enabled={!dragging}` is driven only by the
gizmo. Nothing suppresses orbit for a rim drag, while the document asserts the house rule is
satisfied for free. Behaviour inferred from reading, not executed.

**🟡 Major 5 — Delete point can be lit over a stale index (code).** `rimDeleteReason` never
bounds-checks, and `onRimDeletePoint` returns silently on `!hasAnchor`. Pick the last anchor, press
app Undo, press Delete point: nothing happens and nothing is said — the exact outcome the Undo
section sets out to forbid.

**🟢 Nit 6** — one sentence in §1: the loop fixes the frame and centroid; the mask is the whole-mesh
silhouette in that frame, unclipped, for drawn and detected rims alike.
**🟢 Nit 7** — "39 tests" is 32.
**🟢 Nit 8** — §4's table still presents `facingNormal` as part of `frame.ts`'s role.
**🟢 Nit 9** — Close loop is `visible: !closed`, which breaks the shown-and-disabled rule stated
absolutely at 312–316. Correct behaviour, over-absolute rule.

---

## What this pass checked, and how

**Verified by reading source:** the entry gate and its single sender; `backDental` case `'rim'`; the
dropped `failed` notice and `next()`'s refusal; `dentalRimOwn` as the single reader-gate; the absence
of `rim/clear` on Cancel and the false comment at `UnitObject.tsx:432–435`; the undo-floor reset
across a stage change; `flip` having no production caller; `rim_from_points`,
`rasterize_visible_surface`, `rim_contains` and `support_allowed_at` in geocore; the `u7` row's
condition and the empty `profilesWithoutOpening()`; `rimDraft` persistence through
`encodeProject`/`normalizeScene` and `cloneSurfacePath` being bypassed on load; no `controls.enabled`
handling for the rim drag; `rimDeleteReason`'s missing bounds check; the 32-test count.

**Relayed, not verified:** the walk outcomes; the measured numbers in §1; the engine's reference
test; the rotted line numbers beyond four spot checks.

**Not executed:** whether the orbit visibly steals the Adjust drag, and whether the UI permits
saving while the mode is open.
