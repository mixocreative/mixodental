# Stage 6 — Comprehension / re-implementation audit

**Target:** `docs/design/2026-11-05-rim-define-mode.md`, lines 1–538
**Standard:** `resources/document_standards/re-implementation-standard.md`
**Date:** 2026-11-06

**Verdict.** A competent stranger could rebuild roughly the right *shape* of this feature from the
document, but would get the handover, the entry condition, the projection rule and every tuning
constant wrong, and would ship no keyboard shortcuts. Several pre-build recommendations that
measurement or the build overturned read as current spec with no correction marker, so the
"history vs shipped" separation the banner promises does not hold throughout.

Not read by this reviewer: the Rust side and `scripts/walk.mjs`, so engine-internal and walk
claims in the document are unverified here.

---

## 🔴 Blockers

### 1. "Done hands straight to Free transform" is not what shipped
Lines 22–23, 170–171, 296, 378–379, 420 ("the gizmo appearing again *is* the handover").
Verified: `dentalRimDefined` (`editingMode.ts:254–257`) sets only stage, aligner, notices and the
pick. Free transform is keyed `${dentalStage}:${dentalUnitId}` (`App.tsx:359`) and **resets to
`FREE_OFF` on every stage-key change** (`useFreeTransform.ts:32–35`); `free.confirm()` is reached
only from the operator's own press (`App.tsx:623–624`), and `rotationGizmo={orienting && free.free}`
(`App.tsx:1387`). After Done the gizmo is **off**. A re-implementer would wire an automatic entry
the shipped flow does not have.

### 2. The entry contract is wrong and under-specified
Line 420 says the transition is "`dentalOrientFailed` leading to `'rim'`". Shipped is a separate
event `dentalRimNeeded` (`editingMode.ts:56, 226–229`), accepted only while
`dentalStage === 'aligner' && dentalAligner === 'loading'`, and sent only when the worker returned
`result.kind === 'failed'` (`useDentalFlow.ts:179–184`). The two other `failed(...)` paths — no
profile chosen, no worker result — **deliberately keep the old notice**, because "we could not
look" is not "this shape has no rim". The document never draws that distinction, so a
re-implementer would open the drawing mode on worker failures too. Also undocumented:
`requestView('fit')` before entry, and that `{kind:'failed'}` is dropped while `{kind:'holes'}` is
carried in.

### 3. `dentalRimOwn` is named but never specified
Mentioned once (line 226) only as "cleared by Cancel". Verified: set `true` on **entry**
(`editingMode.ts:228`) so detection cannot land on a half-drawn rim
(`rimStage.test.ts:41–47`), stays true through Done, cleared by `backDental` (`:303`), and is the
**single reader-gate** in `next()` (`useDentalFlow.ts:263, 278`) that sends a drawn-rim aligner
into Step 2 without area detection. It implements the whole "no auto detect" promise of section 2,
and the document does not say so.

### 4. No behaviourally significant constant is documented, and the one described is wrong
Zero-Assumption Rule. A re-implementer must invent: `RIM_SAMPLE_SPACING_MM = 0.5`
(`drawnRim.ts:30`), `PROJECT_BACKOFF_MM = 2` (`:39`), `maxPerSegment = 512` (`resample.ts:49`),
`RIM_DRAFT_LIFT_MM = 0.06`, `RIM_ANCHOR_RADIUS_MM = 0.42`, `RIM_GRAB_REACH_MM = radius × 2`,
close-loop reach `radius × 1.6`, selection ring `radius × 1.7`, `MIN_SHAPE_RATIO = 0.002`
(`validate.ts:25`), and the hard "never fewer than 6 points or the ABI throws `INVALID_LENGTH`"
guard (`drawnRim.ts:110–111`). Line 244 says the spacing should be "a profile constant"; shipped
it is a module constant with a comment saying no profile has needed otherwise. Nothing marks that
line superseded.

### 5. The surface-following projection rule is documented wrongly
Lines 241–244 say samples project "along the loop's current opening direction, falling back to
nearest-surface", flagged **Recommended**, uncorrected. Verified shipped: samples project along the
**interpolated surface normals of the two bracketing anchors** (`resample.ts:69`), via a 2 mm
back-off ray cast **inward first, then outward**, double-sided (`drawnRim.ts:84–90`); anchors are
kept exactly and never re-projected (`resample.ts:60–61`); a miss keeps the **straight-line**
position and is counted rather than failing (`resample.ts:71–73`). Projecting along the opening
direction would visibly mis-place samples on a rim's side walls.

---

## 🟡 Major

**6. What Cancel costs is stated and is not true — and the repo contradicts itself.**
Lines 225–226 and the shipped hint: "Step 1 keeps the notice that sent the operator here". The
`failed` notice is never carried in (`useDentalFlow.ts:167–183`) and `backDental` case `'rim'` does
not re-add it. Separately, the document never says what becomes of the drawing on Cancel: there is
**no `rim/clear` on back** (only `App.tsx:1144` Clear and `useRimDrawing.ts:135` Done), so
`rimDraft` survives Cancel — while `UnitObject.tsx:433–435`'s own comment asserts "Leaving the mode
by Cancel clears the drawing". A re-implementer has no ground truth here.

**7. "Use detected must be hidden, not merely disabled" (180–181) is not what shipped.**
`dental.useDetected` (`editingMode.ts:437–441`) is visible for the whole aligner stage and merely
`enabled: Boolean(s.dentalProposed)`. The document argues the disabled-primary case is "the worse
of the two" and is not marked as overturned.

**8. Internal contradiction about `offerUndo`.** Line 398 ("Clear and Delete point should use it")
sits in "Mechanics this builds on", which carries no historical marker; lines 318–320 say the
opposite. The superseding note is 80 lines earlier in a different subsection. The same paragraph
(309–310) lists "the app's own Undo" as a visible control of the mode; the shipped action row is
exactly `close`, `deletePoint`, `clear` (`DentalRimStep.tsx:82`).

**9. The engine contract is inconsistent and incomplete.** Section 1 (line 133) gives
`dental_rim_from_points(positions, indices, points, profile)`; sections 3 and 7 give
`(model, points, flip, profile)`. Shipped is the latter, returning
`RimCarrier & { ok(); reason(); floor_offset(); flipped() }`. Undocumented and not inferable: the
four host outcomes `rim | unusable | refused | empty`, `reason() === 'rim-side-uncertain'` →
`sideUncertain`, `'rim-collinear'` as the only refusal reason, that our own `pathProblems` run
*before* the engine so refusals come back as codes the dock has words for, the one-shot
`withDentalMesh` session and its rationale, and the single-handle rule.

**10. The whole dock, its wording and its key ladder are missing.** The document describes "one bar
top-right" (209) and failures "in the badge" (257). Shipped: the badge holds the step, unit name
and `rimToolText(tool)` (`DentalBar.tsx:113–119`); everything else is a side dock with a `rim-why`
line, notices, a Tool segmented control, two readouts, the action row and a `rim-blocked` note. Not
in the document at all: the shortcuts `P` / `A` / `Delete`-or-`Backspace` / `Esc`
(`editingMode.ts:375–398`), though the document insists every shortcut gets a button; the label is
"Close loop", not "Close path"; Close loop is **hidden** once closed while Delete point is
shown-always, which the "shown always" correction (312–316) does not cover; the five operator
sentences in `rimStepText.ts`; and the two Done status strings.

**11. Where validation lives is misdescribed.** Lines 256–260: "Closing validates before Done
lights up". Verified: `dental.rim.close` checks only `anchors >= 3` (`editingMode.ts:499–504`) — a
figure-eight *can* be closed — and `dentalRimProblem` is recomputed from `pathProblems` on **every
render** (`App.tsx:1215`), with `rimDoneReason` ordering the refusals. A re-implementer would gate
Close on validation and lose the shipped message path.

**12. The scene-state schema and its persistence rule are absent.** The document says only "the
drawing is scene state". Verified contract: `PrintUnit.rimDraft?: SurfacePath` (`project.ts:55`),
`rim/set` and `rim/clear` (`:102–103`), `rim/set` with zero anchors **folds into `rim/clear`**
(`:179–184`), `cloneSurfacePath` deep-copies and **throws** on a non-boolean `closed`, a bad vector
or a closed path under three anchors (`:463–472`), and `rimDraft` is **explicitly not written to
the project file** (`:50–54`). Also, "one edit is one undo step with nothing to coalesce"
(`:98–101`) contradicts the document's suggestion that bursts "coalesce by `edit` key via
`history.open`" (line 390).

**13. Done's other side effects, and what Step 2 opens as.** Done dispatches one batch of
`presetCommands` + `dental/set` with `manualAreaPolicy` + `rim/clear`, then `dentalRimDefined`,
then a status line (`useRimDrawing.ts:132–145`); the presets and the draft clearing are
undocumented. And `next()` for a drawn rim sends `acceptDentalOrientation({ noArea: true })` and
`requestView('bottom')` — Step 2 opens **empty for painting**, not "as usual".

**14. Sections 5–7 leave built and pending indistinguishable (document-only).** Section 6 says "all
answered" while item 3 still offers a choice and promises an arrow section 7 says does not exist,
and item 4 ends in a question mark. Section 5 lists tests "still to write … both need the engine
call"; the engine call landed, so the reader cannot tell whether they exist. Section 7 then closes
with "Everything else in this document is built, gated and shipped".

---

## 🟢 Nits

- **Draft colour vs finished colour.** Lines 248–250 give the draft one red; section 1's correction
  gives the saved rim `--mark-area-edge`. Verified: draft uses `--mark-remove` (`var(--red)`),
  finished overlay uses `--mark-area-edge` (`#cc1f93`). The document never says the drawing changes
  colour when it becomes a rim, which looks like a bug to a re-implementer.
- **The live overlay is not `DentalRimOutline`.** Lines 404–406 say it is "that component with an
  open loop". Shipped is a separate `RimDraftLayer`: chord `lineSegments` plus sphere markers, lift
  along each anchor's own normal, `depthTest={false}`, `renderOrder={18}`, nothing pickable, and the
  chord is explicitly the straight chord, **not** the surface curve.
- **Pick lifecycle is only half stated.** The document covers survival across a view turn. It is
  also cleared on tool change, on entry, on Done, on Cancel and after a successful delete, and
  mid-drag the ring follows `rimDrag.at` rather than the session.
- **`insert` is advertised with no consumer.** Section 4's table lists it among the path edits; no
  UI reaches it, so a reader may build an insert tool the mode does not have.
- `facingNormal` having no production caller is stated honestly (283–285) and matches the code. The
  39-test count was not verified here.
