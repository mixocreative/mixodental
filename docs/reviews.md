# Review and audit records

Every review, audit and wiring walk this project has run, with what it found. `cia` is the code integrity auditor, `egm` the documentation review swarm; a wiring walk reads a flow end to end. Read before filing a finding: it may already be here, with its verdict.

**20 documents, gathered into this one record on 2026-11-19.** Each is copied whole, nothing reconciled with later reality, under an anchor that is its old filename - so a reference anywhere in this repo, in an old commit message or in an audit log still finds it by that name.

| when | document | was |
|---|---|---|
| 2026-11-02 | [CIA integrity audit: the denture flow (2026-11-02)](#2026-11-02-cia-denture-flow) | `docs/reviews/2026-11-02-cia-denture-flow.md` |
| 2026-11-06 | [Stage 6 — Comprehension / re-implementation audit](#2026-11-06-egm-comprehension) | `docs/reviews/2026-11-06-egm-comprehension.md` |
| 2026-11-06 | [Consolidated review — `docs/design/2026-11-05-rim-define-mode.md`](#2026-11-06-egm-consolidated-review) | `docs/reviews/2026-11-06-egm-consolidated-review.md` |
| 2026-11-06 | [Stage 7 — Critic review (design, structural, style)](#2026-11-06-egm-critic) | `docs/reviews/2026-11-06-egm-critic.md` |
| 2026-11-06 | [Goldfish context — rim define mode](#2026-11-06-egm-goldfish-context) | `docs/reviews/2026-11-06-egm-goldfish-context.md` |
| 2026-11-06 | [Stage 9 — Implementation readiness and claim-level audit](#2026-11-06-egm-implementation-readiness) | `docs/reviews/2026-11-06-egm-implementation-readiness.md` |
| 2026-11-06 | [Stage 5 — Initial zoom-out review](#2026-11-06-egm-zoom-out) | `docs/reviews/2026-11-06-egm-zoom-out.md` |
| 2026-11-06 | [Stage 8 — Intermediate zoom-out (whole-shape)](#2026-11-06-egm-zoom-out-intermediate) | `docs/reviews/2026-11-06-egm-zoom-out-intermediate.md` |
| 2026-11-07 | [Goldfish context — review of `docs/design/2026-11-07-import-and-items-flow.md`](#2026-11-07-egm-goldfish-context-import-flow) | `docs/reviews/2026-11-07-egm-goldfish-context-import-flow.md` |
| 2026-11-07 | [Resolution — review of `docs/design/2026-11-07-import-and-items-flow.md`](#2026-11-07-egm-goldfish-review) | `docs/reviews/2026-11-07-egm-goldfish-review.md` |
| 2026-11-07 | [Goldfish Review Report — Round 4, feature spec](#2026-11-07-egm-round4-feature) | `docs/reviews/2026-11-07-egm-round4-feature.md` |
| 2026-11-07 | [Goldfish Review Report — Round 4](#2026-11-07-egm-round4-implementation) | `docs/reviews/2026-11-07-egm-round4-implementation.md` |
| 2026-11-07 | [EGM round 4 — resolution](#2026-11-07-egm-round4-resolution) | `docs/reviews/2026-11-07-egm-round4-resolution.md` |
| 2026-11-08 | [CIA audit — the deck and the dental flow, 2026-11-08](#2026-11-08-cia-deck-and-flow) | `docs/reviews/2026-11-08-cia-deck-and-flow.md` |
| 2026-11-08 | [EGM review — the job deck, the tool rail, and the revisions model](#2026-11-08-egm-deck-rail) | `docs/reviews/2026-11-08-egm-deck-rail.md` |
| 2026-11-08 | [EGM Code Review — import, Items page, and the release mechanism](#2026-11-08-egm-import-and-items) | `docs/reviews/2026-11-08-egm-import-and-items.md` |
| 2026-11-09 | [Wiring walk — the dental flow, 2026-11-09](#2026-11-09-wiring-walk-dental-flow) | `docs/reviews/2026-11-09-wiring-walk-dental-flow.md` |
| 2026-11-11 | [cia — Code Integrity Audit of mixoDental, 2026-11-11](#2026-11-11-cia-audit) | `docs/reviews/2026-11-11-cia-audit.md` |
| 2026-11-18 | [Human review walk - the deck's auto-gen, 2026-11-18](#2026-11-18-human-review-walk) | `docs/reviews/2026-11-18-human-review-walk.md` |
| undated | [Verification — 2026-10-20](#VERIFICATION) | `docs/VERIFICATION.md` |

---

<a id="2026-11-02-cia-denture-flow"></a>

## 2026-11-02 — CIA integrity audit: the denture flow (2026-11-02)

*Was `docs/reviews/2026-11-02-cia-denture-flow.md`.*

Tier: Screen, scoped by the owner to the denture flow (start card, Step 1 orientation, Step 2 supports, OK, export).
Primary state: a correct, printable supported denture and the STL file that leaves the app. Irreversible steps:
the export (a file leaves), and anything that throws away the operator's step work.

Evidence came from the code and from scripted browser walks (Playwright, headless Chromium, swiftshader) on one
local denture scan, called scan #1 here. Walks ran at 900 x 700 and 1280 x 800. Faults were injected by wrapping
the page's `Worker`: a crash (the worker's `error` event), an engine error (an empty mesh sent to the engine) and a
hang (a job the worker never receives). The walk scripts live outside the repository.

### Findings

| # | Severity | Finding | Fixed |
|---|---|---|---|
| 1 | HIGH | In Step 2 one Ctrl+Z took back the accepted pose, the supports and the denture policy while the screen stayed on Step 2 (OK and Back gone). A second Ctrl+Z removed the imported denture and dropped the app to the start screen, where Redo cannot be reached: the operator's work was lost. | yes, 61bf2d6 |
| 2 | MEDIUM | A Step 1 scan that was rejected (worker crash, timeout, engine error) showed "could not be stood upright… use Free transform, then press Next" but left the step "scanning": Next stayed off ("Wait until the print angles are checked") with nothing running. | yes, ed44bd4 |
| 3 | MEDIUM | Denture jobs had no Cancel, so a stuck job ran to the 10-minute timeout. Back, Exit or a new file left it running, and every later denture job (the next file's scan, an export) waited behind it. An export crash was worded as a build crash ("rebuild the supports"). A failure of an outdated build still set the status line. | yes, 9a4dded |
| 4 | MEDIUM | After a failed, crashed or cancelled build, OK and Add another said "Wait until the supports are built." although no build was coming until a change. | yes, b643cc3 |
| 5 | MEDIUM | At 900 x 700 the dental viewport stopped at 58 % of the window (160 px blank under it), Step 1's bar covered the whole viewport (the denture and the step badge were hidden), and the background-work list lay over the bar's Back button, so Back could not be clicked while a scan ran. | yes, 31cd0fc |
| 6 | LOW | After the denture worker restarts in Step 1 (a crash, a timeout, a cancelled job), the live-tilt handle is gone: the tips stop showing as the dial moves, with no message. Next still works. | no |
| 7 | LOW | After a failed orientation the status line reads "Drop a denture STL, or choose one…" although the denture is loaded (shared step wording). | no |
| 8 | LOW | OK re-arranges the plate, which moves the denture and starts a full support rebuild (about 4 s on scan #1). An export or check started in that window reports "the support check did not finish for 1 object". The exported file is right (export builds its own). | no |
| 9 | LOW | A whole-plate export of an unnamed project is named `scene-printable.stl`, not after the denture. | no |
| 10 | LOW | Undo inside Step 1 turns the denture back but not the dial, so dial and pose disagree until the dial moves. Next accepts the pose shown. | no |
| 11 | LOW | Undo's disabled reason inside a dental step says "leave the mode to undo earlier steps"; in the dental flow the way back is Back (shared text). | no |

### What each fix does

- #1: a dental step sets the undo floor when it begins (stage, object or loading state changed), after the
  step's opening commands landed. Undo inside a step still takes back that step's edits (walked: a denture
  setting change, its Undo and Redo, each with its rebuild). Test: `src/dental/flow.test.ts` plays the flow
  through the real session reducer and history, with and without the floor.
- #2: `src/denture/steps/orient/scanOutcome.ts` maps every ending of the scan to the step's state; none stays
  "scanning". Walked: a crash during the scan now leaves Next on. Test: `scanOutcome.test.ts`.
- #3: the denture client offers Cancel on its long jobs, words each failure in its own context, and
  `cancel(prefix)` stops a left step's jobs quietly. Walked: Cancel of a hung rebuild, Exit during a hung
  build, Back during a hung scan followed by the same file again (stood upright after 7.9 s instead of waiting
  behind the hung job). Tests: `dentureClient.test.ts`, `keyedQueue.test.ts`.
- #4: `dentalBuildFailed` in the command state; OK's reason says what to do. Test: `dentalStep3.test.ts`.
- #5: the dental viewport takes the window height at 1100 px and below, Step 1's bar stays on the right below
  the badge from 721 to 1100 px, and the background-work list sits above the docked edit bar. Walked at
  900 x 700 (screens measured, Back clickable during a scan). Test: `src/ui/narrowDentalLayout.test.ts`.

### Checked and clean

- Export of the finished plate: the file holds the model and the supports at full resolution in the pose shown
  (scan #1: 187,684 triangles = 157,772 model + 29,912 supports, plate at z = 0, default label). The export
  rebuilds from the scene at click time, and a unit changed during the export is refused ("changed while it
  was being exported"). An export while the worker hangs showed no Cancel for 10 minutes; it now offers Cancel (#3; covered by the
  client test, not walked again).
- Two builds of one unit: a queued build is replaced by a newer one; a running build finishes, and App drops
  its result when the unit changed meanwhile. The resolve status line waits for the build of the unit as it
  is after the resolve (`rebuildStatus.ts`).
- Engine error during a rebuild: the status names the failure, the last good build stays drawn, OK is off.
- Leaving the page: `beforeunload` asks whenever the scene differs from the last save, which covers a running
  build. Not walked (a `beforeunload` prompt can freeze headless Chromium): UNVERIFIED at runtime.

### Owner questions

1. Undo now stops at the start of the current dental step (#1). Should Undo instead cross into the previous
   step and take the screen back with it? That needs the step to follow the scene, a larger change.
2. OK's plate re-arrange moves the denture and rebuilds its supports in full (#8). Should a move that only
   translates keep the build (the supports move with the model)? That is in the build path.
3. "Check for unsupported spots" on a finished denture of scan #1 lists 5 spots that the denture build's own
   report does not. Should the check read the denture policy (low points left to the denture shape are
   informational), as it already does for points outside the aligner area?
4. Step 2 at 900 x 700 still docks its panel at the bottom over about half the viewport. Docking it on the
   right on tablet-wide windows also needs the fit-view inset changed. Wanted?

### Not walked at this tier

Real worker out-of-memory (simulated by the `error` event only), the 10-minute timeout itself (simulated by a
hang and Cancel), every locale at 900 x 700 (English only), and a second denture through Add another.

---

<a id="2026-11-06-egm-comprehension"></a>

## 2026-11-06 — Stage 6 — Comprehension / re-implementation audit

*Was `docs/reviews/2026-11-06-egm-comprehension.md`.*

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

### 🔴 Blockers

#### 1. "Done hands straight to Free transform" is not what shipped
Lines 22–23, 170–171, 296, 378–379, 420 ("the gizmo appearing again *is* the handover").
Verified: `dentalRimDefined` (`editingMode.ts:254–257`) sets only stage, aligner, notices and the
pick. Free transform is keyed `${dentalStage}:${dentalUnitId}` (`App.tsx:359`) and **resets to
`FREE_OFF` on every stage-key change** (`useFreeTransform.ts:32–35`); `free.confirm()` is reached
only from the operator's own press (`App.tsx:623–624`), and `rotationGizmo={orienting && free.free}`
(`App.tsx:1387`). After Done the gizmo is **off**. A re-implementer would wire an automatic entry
the shipped flow does not have.

#### 2. The entry contract is wrong and under-specified
Line 420 says the transition is "`dentalOrientFailed` leading to `'rim'`". Shipped is a separate
event `dentalRimNeeded` (`editingMode.ts:56, 226–229`), accepted only while
`dentalStage === 'aligner' && dentalAligner === 'loading'`, and sent only when the worker returned
`result.kind === 'failed'` (`useDentalFlow.ts:179–184`). The two other `failed(...)` paths — no
profile chosen, no worker result — **deliberately keep the old notice**, because "we could not
look" is not "this shape has no rim". The document never draws that distinction, so a
re-implementer would open the drawing mode on worker failures too. Also undocumented:
`requestView('fit')` before entry, and that `{kind:'failed'}` is dropped while `{kind:'holes'}` is
carried in.

#### 3. `dentalRimOwn` is named but never specified
Mentioned once (line 226) only as "cleared by Cancel". Verified: set `true` on **entry**
(`editingMode.ts:228`) so detection cannot land on a half-drawn rim
(`rimStage.test.ts:41–47`), stays true through Done, cleared by `backDental` (`:303`), and is the
**single reader-gate** in `next()` (`useDentalFlow.ts:263, 278`) that sends a drawn-rim aligner
into Step 2 without area detection. It implements the whole "no auto detect" promise of section 2,
and the document does not say so.

#### 4. No behaviourally significant constant is documented, and the one described is wrong
Zero-Assumption Rule. A re-implementer must invent: `RIM_SAMPLE_SPACING_MM = 0.5`
(`drawnRim.ts:30`), `PROJECT_BACKOFF_MM = 2` (`:39`), `maxPerSegment = 512` (`resample.ts:49`),
`RIM_DRAFT_LIFT_MM = 0.06`, `RIM_ANCHOR_RADIUS_MM = 0.42`, `RIM_GRAB_REACH_MM = radius × 2`,
close-loop reach `radius × 1.6`, selection ring `radius × 1.7`, `MIN_SHAPE_RATIO = 0.002`
(`validate.ts:25`), and the hard "never fewer than 6 points or the ABI throws `INVALID_LENGTH`"
guard (`drawnRim.ts:110–111`). Line 244 says the spacing should be "a profile constant"; shipped
it is a module constant with a comment saying no profile has needed otherwise. Nothing marks that
line superseded.

#### 5. The surface-following projection rule is documented wrongly
Lines 241–244 say samples project "along the loop's current opening direction, falling back to
nearest-surface", flagged **Recommended**, uncorrected. Verified shipped: samples project along the
**interpolated surface normals of the two bracketing anchors** (`resample.ts:69`), via a 2 mm
back-off ray cast **inward first, then outward**, double-sided (`drawnRim.ts:84–90`); anchors are
kept exactly and never re-projected (`resample.ts:60–61`); a miss keeps the **straight-line**
position and is counted rather than failing (`resample.ts:71–73`). Projecting along the opening
direction would visibly mis-place samples on a rim's side walls.

---

### 🟡 Major

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

### 🟢 Nits

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

---

<a id="2026-11-06-egm-consolidated-review"></a>

## 2026-11-06 — Consolidated review — `docs/design/2026-11-05-rim-define-mode.md`

*Was `docs/reviews/2026-11-06-egm-consolidated-review.md`.*

**Date:** 2026-11-06 · **Range:** whole file (1–538) · **Preset:** consolidated, all five stages
**Stage reports:** `docs/reviews/2026-11-06-egm-zoom-out.md`, `docs/reviews/2026-11-06-egm-comprehension.md`, `docs/reviews/2026-11-06-egm-critic.md`,
`docs/reviews/2026-11-06-egm-zoom-out-intermediate.md`, `docs/reviews/2026-11-06-egm-implementation-readiness.md`
**Reviewers:** 8, each in a fresh context with no conversation history, given a reading list
(`docs/reviews/2026-11-06-2026-11-06-egm-goldfish-context.md`) rather than the repository tree.

> An earlier, smaller review of this document ran the same morning; its report is in git history at
> `9987118`. Its two findings are closed: the hand-drawn rim reaching Step 2 (`ded4521`) and the rim
> overlay rendering (`3e8f679`), and the Delete point it said was missing is built (`652537a`).

---

### The short version

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

### Code defects — verified, ranked

These are bugs, not documentation. Each was confirmed by reading the code in this session.

#### 1. 🔴 Cancel leaves an orphan drawing, and the comment licensing the overlay says it doesn't
`rim/clear` is dispatched from exactly two places: the Clear command (`App.tsx:1144`) and Done
(`useRimDrawing.ts:135`). Nothing clears `rimDraft` on Cancel, Esc, Exit or stage change. Meanwhile
`UnitObject.tsx:432` renders the draft "whenever the unit holds one — not only while the mode is
open", justified by a comment that reads *"Leaving the mode by Cancel clears the drawing, so a draft
that still exists is one the operator is in the middle of."* That invariant does not hold. The
abandoned loop follows the operator into Step 1 and Step 2; the only control that could remove it is
`visible: rim`, so unreachable; and the undo floor rose at the stage change, so Undo cannot reach it.

#### 2. 🔴 `rimDraft` is written to the project file, unvalidated, and a code comment denies it
`project.ts:51` says it is "NOT saved to the project file". It is: `normalizeUnit` spreads `...unit`
with no omission, `sceneJsonReplacer` passes it through, and `encodeProject` serialises
`normalizeScene(scene)`. On load, `cloneSurfacePath` — which validates `closed`, every vector, and the
three-anchor floor — is called **only** from the `rim/set` reducer, never for a loaded file. Defect 1
makes it reachable: Cancel, Exit, Save.
*(One reviewer asserted the opposite by repeating the false comment; a later stage caught it.)*

#### 3. 🟡 The Adjust drag never takes the camera out of the gesture
Paint calls `beginStroke()`, which sets `controls.enabled = false`; the rim-drag branch returns
before reaching it, and `<OrbitControls enabled={!dragging}>` is driven only by the gizmo's
`dragging-changed`. The repo proves the point against itself — `beginStroke` exists precisely because
`stopPropagation` does not stop OrbitControls, which listens on the canvas element. So the view
orbits while an anchor is dragged. `u5d`/`u5e` cannot see it: both stay true while the camera swings.
**Read-level conclusion; not executed.**

#### 4. 🟡 Delete point can be lit over a stale index
`rimDeleteReason` checks only `dentalRimSelected !== undefined` and the anchor count; it never
bounds-checks. `onRimDeletePoint` returns silently on `!hasAnchor`. Pick the last anchor, press the
app's Undo, press Delete point: nothing happens and nothing is said — the exact outcome the Undo
section sets out to forbid.

#### 5. 🟡 The Cancel hint is false, in three languages
*"Leave rim define mode without a rim. Step 1 keeps the notice that sent you here"* — but the
handover deliberately drops the `failed` notice (`useDentalFlow.ts:169`, with a comment explaining
why showing it would be wrong). There is no notice to keep. Translated into ja and zh-Hant.

#### 6. 🟡 After Cancel, Step 1 is a dead end with no explanation
No rim, no proposal, no notice; `next()` answers *"No aligner opening was found… Go Back and choose
another file, or Exit."* And the door is bolted twice: the only event that could put Step 1 back into
`loading` is `switchDentalProfile` via the `u7` row, and `profilesWithoutOpening()` is empty today, so
that row renders a sentence and **no button at all**. **This is a strictly worse screen than the dead
end the feature was built to remove.**

---

### Document fixes — the smallest set that works

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

### Rejected, demoted and refuted — on the record

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

### Confirmed true, and worth keeping

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

### Why the flip control cannot be built as written

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

### What the owner is being asked

The six code defects are bugs and need no decision beyond "go". The real decision is **whether to build
a re-entry route into rim define mode.** It dissolves defects 1, 5 and 6 and makes the flip control
buildable at all; without it, the honest move is to record in §7 that a wrong opening side is
unrecoverable without re-importing the file.

---

<a id="2026-11-06-egm-critic"></a>

## 2026-11-06 — Stage 7 — Critic review (design, structural, style)

*Was `docs/reviews/2026-11-06-egm-critic.md`.*

**Target:** `docs/design/2026-11-05-rim-define-mode.md`, lines 1–538
**Standard:** `resources/document_standards/feature-spec-standard.md` (design, structural)
**Date:** 2026-11-06 · Three reviewers, run in parallel, no shared context.

---

### Design critic

**Verdict.** The mechanics are argued well and the Alternatives Rule is met better than most specs.
It fails the Risks & Limits bar, specifically on the three things that decide whether a drawn rim
is safe or recoverable: what the loop authorises, how a wrong opening side gets fixed, and what
Cancel and Done leave behind.

#### 🔴 Blocker 1 — the drawn loop does not bound the permitted area

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

#### 🔴 Blocker 2 — a side-uncertain rim cannot be corrected

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

#### 🟡 Major 3 — Cancel leaves an orphan drawing, and the code asserts the opposite
`rim/clear` is dispatched in exactly two places: Clear (`App.tsx:1144`) and Done
(`useRimDrawing.ts:135`). Nothing clears `rimDraft` on Cancel, Esc, Exit or stage change.
`UnitObject.tsx:433–435` renders the draft in every step on the stated premise that "Leaving the
mode by Cancel clears the drawing" — false. The loop follows the operator into Step 1 and Step 2,
and the only control that could remove it is `visible: rim`, i.e. unreachable. Undo cannot reach it
either: the stage change raises the per-step undo floor, putting the draft below it.

#### 🟡 Major 4 — Done is the one edit Undo cannot reach
`dentalRimDefined` changes the stage, so the floor is re-set *after* Done's batch lands. The mode's
cheap edits are all undoable and the one expensive, irreversible edit is not — the inverse of what
a reader of the Undo section would expect.

#### 🟡 Major 5 — the Adjust drag never takes the camera out of the gesture
The Adjust branch calls `event.stopPropagation()` and sets local state; it never does what paint
does (`controls.enabled = false`) nor what the gizmo does (`dragging` → `OrbitControls enabled`).
r3f's `stopPropagation` governs r3f's object bubbling; drei's OrbitControls listens on the canvas
DOM element — which is why `beginStroke` disables it explicitly. Expect the view to orbit while an
anchor is dragged. In Place the same gap means a camera drag begun on the model drops an anchor,
since `clickModel` fires on release with no movement threshold. **Behavioural consequence inferred
from reading, not executed.** Walks `u5d`/`u5e` would not catch either symptom.

#### 🟡 Major 6 — the resample's own quality signal is computed and discarded
`ResampledPath` carries `samples` and `projected` with the comment "so the caller can speak up";
`drawnRim` throws both away. A sample whose projection misses keeps its straight-line position, so
a loop spanning a hole or a deep concavity becomes a rim built partly from points off the mesh —
and those points then fix the plane, the centroid and the frame. No threshold, no warning.

#### 🟡 Major 7 — validation runs on the anchors; the engine sees the resampled curve
`pathProblems` judges the anchor polygon in its fitted plane; the engine receives the dense curve
and only ever rejects `Collinear`. A simple polygon can resample into a self-crossing curve around
a shell. And the one reachable refusal is answered with "This rim could not be built from the
points as drawn" — the only message in the mode that says nothing specific, against the file's own
banner "EVERY REFUSAL SAYS SOMETHING".

#### 🟡 Major 8 — Delete point can be enabled over a stale index
`rimDeleteReason` gates on `dentalRimSelected !== undefined` and the anchor count; it never
bounds-checks the index. Pick the last anchor, press the app's Undo, and Delete point stays lit
over an index that no longer exists — `onRimDeletePoint` bails on `!hasAnchor` with no message. A
button that does nothing when pressed, which the Undo section explicitly sets out to avoid.

#### 🟡 Major 9 — "scene state, not project state" is load-bearing and its cost is unstated
A save/reload mid-drawing loses the work with no warning; the draft rides in every history
snapshot; and the placement is what lets the orphan in Major 3 survive below the undo floor. Also
unspecified: `onRimPoint` writes to the unit the pointer hit while Done reads
`session.dentalUnitId`, and the invariant that these are the same unit is never stated.

#### 🟡 Major 10 — switching off the print-angle scan is a second decision wearing one quote
"No auto detect" in the owner's words is about re-detection. The document extends it to the
print-angle scan. The consequence — drawn-rim aligners are oriented entirely by hand with no angle
scan — is the largest safety difference from a detected one, and is recorded as a UI fact rather
than an accepted risk.

#### 🟡 Major 11 — no Goals/Non-Goals, no consolidated Risks, no acceptance bar
No numeric acceptance criteria for a "good enough" rim: no anchor-count guidance, no mm tolerance,
no minimum fraction of the curve that must lie on the mesh.

#### 🟢 Nits
Wording lives in two places despite the claim (`useRimDrawing.ts` holds four English sentences
inline). `RIM_SAMPLE_SPACING_MM = 0.5` is justified by an uncited claim about downstream consumers.
`closesLoop` uses `radius × 1.6` and `grabAnchor` `radius × 2`, so a click between the two reaches
stacks a second anchor instead of closing. In-repo tests exercise a stubbed engine only, so this
repo has no check that would fail if the engine contract changed.

#### Where the design was judged sound
The host/engine split on the mask, and option 2's rejection ("a second source of truth for a safety
mask"). `src/core/surfacePath/` being framework-free with an injected projection. The Newell's-method
trap. Deciding the opening sign from `orient::floor_offset` — verified pose-free. Putting the pick
in the session rather than the scene. One command per edit.

---

### Structural critic

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

### Style critic

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

---

<a id="2026-11-06-egm-goldfish-context"></a>

## 2026-11-06 — Goldfish context — rim define mode

*Was `docs/reviews/2026-11-06-egm-goldfish-context.md`.*

A reading list, not an argument. Each line says what the file holds so a reviewer can go
straight to what it needs instead of sweeping the repository. Nothing here is a finding.

**Read what you need from this list. Do not browse the tree.** `graphify-out/GRAPH_REPORT.md`
exists but is 72K and is only worth opening for a whole-architecture question.

### The feature under review

| File | What it holds |
| --- | --- |
| `src/dental/editingMode.ts` | The dental edit mode: session state, the event reducer, the command registry entries (`dental.rim.*`), the key ladder, and the gesture each stage produces. |
| `src/dental/rim/useRimDrawing.ts` | What rim define mode DOES: place an anchor, move one, pick one out, delete the picked one, and Done (the engine call). |
| `src/dental/rim/rimStepText.ts` | The mode's wording, pure: `rimProblemText`, `rimDoneReason`, `rimDeleteReason`, `rimToolText`, `rimLoopText`. |
| `src/dental/rim/DentalRimStep.tsx` | The mode's dock: tool switch, the two readouts, the action row, Cancel and Done. |
| `src/dental/rim/drawnRim.ts` | The drawn path becomes a `DentalRim` through the engine (`dental_rim_from_points`). |
| `src/dental/rim/rimDraftGeometry.ts` | Anchor lift, chords, `nearestAnchor`, `grabAnchor`, `closesLoop`, and the reach constants. |
| `src/dental/README.md` | The module map for `src/dental/`. |

### The geometry it builds on

| File | What it holds |
| --- | --- |
| `src/core/surfacePath/path.ts` | `SurfacePath`, `SurfaceAnchor`, and the edits: append, insert, move, remove, close, open, with their refusals. |
| `src/core/surfacePath/validate.ts` | `SurfacePathProblem` codes, `selfIntersects`, `pathProblems`. |
| `src/core/surfacePath/frame.ts` | Plane fit for the drawn loop, `toPlane`, `anchorsInPlane`, `facingNormal`, `pathLength`. |
| `src/core/surfacePath/resample.ts` | Resampling the anchors into a dense curve through an injected `ProjectToSurface`. |

### Where it meets the rest of the app

| File | What it holds |
| --- | --- |
| `src/components/viewport/UnitObject.tsx` | The pointer handling: what a press means per gesture, the anchor drag, and which overlays render. |
| `src/components/viewport/RimDraftLayer.tsx` | The drawing on the model: anchors, chord, the ring on the picked anchor. |
| `src/components/viewport/dentalLayers.tsx` | The dental overlays, `DentalRimOutline` and `DentalRegionLines` among them. |
| `src/components/SceneLegend.tsx` | The legend naming what each colour means. |
| `src/components/useDentalFlow.ts` | The dental flow: `next()`, the presets, and the handover into rim define mode. |
| `src/App.tsx` | Where commands are run and where `UiState` is assembled from session and scene. |
| `src/state/project.ts` | Scene commands, `rim/set` and `rim/clear` among them, and what is saved to a project file. |
| `src/styles.css` | The colour tokens, `--mark-area-permitted` and `--mark-area-edge` among them. |

### The engine side

| File | What it holds |
| --- | --- |
| `vendor/mixo-geocore/host/dental/dental.ts` | `DentalRim`, `boundaryKind`, `DentalDiagnostics`. |
| `vendor/mixo-geocore/host/dental/dentalEngine.ts` | The host side of the engine calls and the rim encoding. |
| `S:/ai/mixo-geocore/crates/geometry-core/src/dental/rim.rs` | Rust: `trace_rim` and `rim_from_points`, and how each boundary kind is produced. |
| `S:/ai/mixo-geocore/crates/geometry-core/src/surface/rim.rs` | Rust: the `Rim` type and `BoundaryKind`. |
| `S:/ai/mixo-geocore/crates/geometry-core/src/dental/legacy.rs` | Rust: where `boundary_kind` decides whether an area is authorised. |

### What checks it

| File | What it holds |
| --- | --- |
| `src/dental/editing/rimStage.test.ts` | The stage, its commands, its key ladder, and the pick. |
| `src/dental/rim/drawnRim.test.ts`, `rimDraftGeometry.test.ts` | The engine adapter and the draft geometry. |
| `src/core/surfacePath/*.test.ts` | The path edits, the plane fit, resampling, validation. |
| `scripts/walk.mjs` | The browser walk. Rim checks are `u5`–`u5j`; `canvasColour` is the pixel probe. |

### Sibling documents

- `docs/design/2026-11-05-back-out-one-level.md` — the Esc ladder and the "every step opens on Select" rule.
- `docs/handoff/geocore-rim-from-points.md` — the engine call as it was specified to the other repository.

---

<a id="2026-11-06-egm-implementation-readiness"></a>

## 2026-11-06 — Stage 9 — Implementation readiness and claim-level audit

*Was `docs/reviews/2026-11-06-egm-implementation-readiness.md`.*

**Target:** `docs/design/2026-11-05-rim-define-mode.md`, lines 205–538 (sections 3–7)
**Standard:** `resources/document_standards/implementation-readiness-standard.md`
**Date:** 2026-11-06 · Two reviewers. `egm-style` was **not** run: it reviewed the whole document in
Stage 7 and Stage 8 judged those findings house voice rather than defects, so a second pass over a
subrange would repeat work already assessed.

---

### Part A — Readiness: could someone be told "finish it" tomorrow?

**Verdict: no.** They could not start the named work without making three design decisions the
document leaves open. Section 7's "What is left" is a one-sentence wish, not an implementation item.

#### 🔴 Blocker 1 — the flip control has no specified moment, and the two possible moments are different features

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

#### 🔴 Blocker 2 — the state the control needs is thrown away

`sideUncertain`, `floorOffset` and `flipped` are consumed **only** as a transient status sentence
(`useRimDrawing.ts:143–145`). They are in no session field, no `UiState` field, and not in the stored
policy: `manualAreaPolicy` returns `{kind, origin, profileId, rim, stamps}`. `dentalRimDefined` also
clears `dentalNotices`. **After Done, no piece of application state knows the side was doubtful**, so
a post-Done control has no predicate for `visible`/`enabled`, and a reloaded project has none either.
The document treats this as presentation ("a sentence rather than an arrow"); it is a missing
persisted fact, and if it belongs on the policy it is a serialized-schema change the document never
acknowledges.

#### 🔴 Blocker 3 — two live, contradictory designs for the same control

§6 item 3 still offers "a visible, flippable arrow … **or asked outright as one step of the mode**",
under a heading declaring §6 answered; §7 says an arrow. Neither is marked superseded, and these are
not cosmetic variants: "asked outright as one step of the mode" is route (a); the §7 arrow is route (b).

#### 🟡 Major 4 — no change surface
Lines 417–424 are the right shape — the stage addition enumerated down to `reduceDental`,
`registerCommands` and the key table. "What is left" gives no equivalent, though one is derivable: a
new id in the `CommandIds` augmentation; a registry entry with `role`, `label`, `hint`, `visible`,
`enabled`, `disabledReason` — which means **authoring operator-facing wording and a refusal
sentence**, neither of which the document supplies; a `case` in the command runner; the key ladder if
it takes a shortcut (`P`, `A`, `Delete`, `Escape` are taken); and a render site.

#### 🟡 Major 5 — the uncertain state cannot be reproduced, so the work cannot be verified
The only test producing `sideUncertain` fakes the engine. The walk drives the real engine but never
reaches an uncertain rim, and nothing in the repo names a fixture that does. The threshold lives in
geocore and the document gives neither its value nor a shape that trips it. **An engineer can build
the control and has no way to see it appear.** Minimum owed: a named fixture or profile override that
yields `rim-side-uncertain`, and a walk id.

#### 🟡 Major 6 — what they would most likely break: a re-entry that silently does nothing
The natural first attempt at route (b) is to reopen the mode. `dentalRimNeeded` is accepted only when
`dentalStage === 'aligner' && dentalAligner === 'loading'`; after Done the stage is `aligner`/`ready`,
so the reducer returns `state` unchanged — no throw, no status, no log. A no-op button.

Second likely breakage: a post-Done re-call must re-wrap through `manualAreaPolicy`, which hard-codes
`stamps: []`. **Flipping after the operator has painted in Step 2 would discard their paint.**

#### 🟢 Nits
"A refinement rather than a gap" sets the wrong priority. `flipped()` is read into the outcome and
then discarded by every caller, which matters for a toggle's pressed state. Rim `UiState` is assembled
from `activeUnit` while `useRimDrawing` reads `session.dentalUnitId`; any new flip state must pick one.

#### What the document supplies adequately
The *shipped* mechanism's state ownership is documented and correct: the drawing as scene state, the
pick as session state and when it is cleared, the one-shot engine call, `flip` existing with a
passthrough test, and the registry/command/key pattern to copy. The gap is specifically the
*remaining* work — the existing mechanism is better described than it is specified forward.

---

### Part B — Claim-level audit: what the document says about the code

#### FALSE

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

#### Nits, all verified
The refusals are in the dock, not the badge. §4 says `src/dental/rim/` owns the stage and the overlay;
the stage is in `editingMode.ts` and the overlay in `RimDraftLayer.tsx`, as §7 correctly says — §4
contradicts §7. `onAddContact` has moved to `useSupportEdits.ts` (a wrong file, not just a rotted
line). The rim dock renders from `DentalBar.tsx`, not the cited `App.tsx` panel chain. §5 claims
"checks lean on `data-ui` names, never prose", but the rim walk drives every control by visible label
and gates on badge prose. "No draggable in-scene handle — confirmed by grep" still reads present tense
in a record whose §7 says the handle is built.

#### Checked and TRUE — worth keeping
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

#### Could not check
The reference rim's 158-point count (only source is the comment the document paraphrases). The geocore
commit id (no VCS access from that role; the engine-61 *behaviour* is present). "Watched to fail
against a deliberately wrong index" — a claim about a past run. Walk pass/fail — the file was read,
not executed. Whether 0.5 mm spacing yields ~158 points, which depends on the first item.

---

<a id="2026-11-06-egm-zoom-out"></a>

## 2026-11-06 — Stage 5 — Initial zoom-out review

*Was `docs/reviews/2026-11-06-egm-zoom-out.md`.*

**Target:** `docs/design/2026-11-05-rim-define-mode.md`, lines 1–538
**Standard:** `resources/document_standards/zoom-out-standard.md`
**Date:** 2026-11-06

**Headline.** Context sufficiency (§0) and root-problem focus (§1) pass comfortably. The
engine-vs-host argument in section 1 is the strongest part of the document and holds up in the
code: a maintainer would understand why `dental_rim_from_points` exists and would not be tempted
to re-raster the mask in TypeScript. The problems are all of one species — the *as-shipped* half
has drifted from the *as-reasoned* half, and in three places the document states something the
code contradicts.

---

### 🔴 Blocker

#### 1. Cancel is described wrongly, and what shipped is the dead end the feature exists to remove

Sections 3 (lines 220–230) and 6 item 4 (499–500).

The document says Cancel means "Step 1 keeps the notice that sent the operator here". The notice
is deliberately *not* carried: `useDentalFlow.ts:168–183` suppress the `failed` notice on the
hand-over, passing only `holes` if present. `backDental` for the `rim` stage
(`editingMode.ts:303`) returns to stage `aligner` with `dentalRimOwn: false` and adds no notice.

So after Cancel the operator sits in Step 1 with no proposal, no rim and usually no notice, and
`next()` answers *"No aligner opening was found, so no support area can be proposed. Go Back and
choose another file, or Exit."* (`useDentalFlow.ts:284`). Re-entry is impossible: `dentalRimNeeded`
is accepted only while the aligner is still `loading` (`editingMode.ts:228`, asserted by
`rimStage.test.ts:49–53`), and there is no `dental.rim.enter` command.

The feature's purpose was to remove a dead end, and Cancel re-creates it with *less* explanation
than before. Either the document records this honestly (Cancel means re-import the file) or the
fix — carry a notice, or allow re-entry — is named as remaining work.

---

### 🟡 Major

#### 2. Section 6 claims "all answered" over two items that are still questions

Line 490. Item 3 (497–498) ends "or asked outright … as one step of the mode", which the
correction at 266–285 has overtaken. Item 4 (499–500) ends with a literal question mark.

Verified: the `u7` type row still renders for `notice.kind === 'failed'`
(`OrientationBar.tsx:81–90`), and that notice is still produced for the "could not look" cases
(`useDentalFlow.ts:162, 166, 202`). So section 2's prediction at 200–203 — that the row "becomes
unreachable on the failure path once this lands" — is false as shipped, and item 4 is undecided.

#### 3. The routing question is never closed, and what shipped was neither option offered

Section 2 (194–198) and section 6 item 6 (505–506) offer "a new `dentalProposal` shape" or "its
own session field", recommending the latter. What shipped is a third thing: the finished rim goes
into the unit's scene `dental` policy (`useRimDrawing.ts:132–136`), the session carries only the
boolean `dentalRimOwn` (`editingMode.ts:136`), and `next()`'s guard became
`if (!proposal && dentalRimOwn && profile && unit.dental)` (`useDentalFlow.ts:278`).

That is simpler than the recommendation, but leaving the recommendation standing as advice invites
a maintainer to "finish" it by adding a session field that is not needed.

#### 4. YAGNI: three exports with no production caller, one advertised as a role

Verified by grep across `src`: `facingNormal` (`frame.ts:138`), `openPath` and `insertAnchor`
(`path.ts:95, 62`) are referenced only from their own tests, `src/core/README.md` and the design
docs. The document is half-aware — the correction at 282–285 says `facingNormal` has no production
caller — but the section 4 table at line 445 still lists it as part of what `frame.ts` is *for*,
with no cross-reference. The document should say which exports are live and which are speculative,
so nobody maintains dead code as load-bearing.

#### 5. Line-number citations have rotted, and the document is built on them

Verified samples: `DentalRimOutline` cited at `dentalLayers.tsx:128` (lines 128, 406) is at 144;
`clickModel` cited at `UnitObject.tsx:268` (line 350) is at 332; the `raycast` prop cited at
`UnitObject.tsx:304` (line 348) is at 387 and 448; `offerUndo` cited at `App.tsx:275` (line 397)
is at 280. Roughly sixty such citations appear in sections 1–3 and 7. Symbol names alone carry the
argument; the numbers are the part that lies.

#### 6. A superseded recommendation left unmarked — the one contradiction not flagged

Line 397 says "`offerUndo` … Clear and Delete point should use it, the way `clearManual` does",
while 318–320 say the opposite and explain why. Verified: no rim-related `offerUndo` kind exists
(`App.tsx:839–992`). Every other overturned claim carries its correction at the point it appears;
this one does not, and the stale version sits in the more authoritative-looking "Mechanics this
builds on" subsection.

#### 7. The drawing is scene state, and the document never asks what a save does

`rimDraft` lives on `PrintUnit` (`project.ts:55`), whose own comment says "what gets saved is the
`dental` policy the finished rim goes into" — but `normalizeUnit` (299) spreads `...unit` and
`migrateRemovals` (284) strips only `suppressed`, so `rimDraft` passes through `serializeScene`
(254) into a saved project file and back through `deserializeScene` (258) with no validation of
its shape. The pass-through is verified by reading; whether the UI permits saving while rim mode
is open is **inferred, not executed**.

---

### 🟢 Nit

**8.** Stale framing at line 45 ("96 × 96 = 9216 bytes. This is the problem.") without the marking
used elsewhere. `boundaryKind` itself is verified correct: `rim_from_points` returns
`ProjectionFallback` (geocore `rim.rs:176`) and `front` is `None`.

**9.** Lines 313–317 rule that controls must be shown-and-disabled rather than appear and
disappear, but Close loop does exactly that (`rimStage.test.ts:133`). Probably right — a closed
loop cannot be closed again — but the rule is stated absolutely and broken one control along.

**10.** The "39 tests" claim (476–480, 517) counts 32 `it(`/`test(` blocks across the four
`surfacePath` test files. Likely a counting convention, but a bare number is worth stating as
"32 test blocks" or dropping.

**11.** `flip` is plumbed and never non-default: `drawnRim(..., flip = false)` (`drawnRim.ts:102`)
is called without it (`useRimDrawing.ts:126`) and the engine echoes it back. Consistent with "the
flip control is the last piece still worth building", flagged so a reader of section 7 knows the
parameter is wiring, not a working feature.

---

### What the reviewer checked, and how

Verified against code: 1, 2, 3, 4, 5, 6, 8, 9, 10, 11, and the `rimDraft` pass-through in 7.
Inferred from reading rather than executing: whether a project can be saved while rim mode is
open (finding 7).

Looked for and did not find: reinvention of existing utilities (the reuse inventory in section 7
is accurate on the symbols checked — `rustRaycast`, `dragOver.down`'s `onObject`, `gizmoShown`,
the snapshot history with `undoFloor`), premature optimization, speculative configuration, or an
architectural dead-end in the engine boundary.

---

<a id="2026-11-06-egm-zoom-out-intermediate"></a>

## 2026-11-06 — Stage 8 — Intermediate zoom-out (whole-shape)

*Was `docs/reviews/2026-11-06-egm-zoom-out-intermediate.md`.*

**Target:** `docs/design/2026-11-05-rim-define-mode.md`, lines 1–538
**Read first:** `docs/reviews/2026-11-06-egm-zoom-out.md`, `docs/reviews/2026-11-06-egm-comprehension.md`, `docs/reviews/2026-11-06-egm-critic.md`
**Date:** 2026-11-06

This pass was asked four questions the earlier stages could not answer, because each saw only its
own rubric: whether the findings point at one defect or several, which findings are **wrong or
overstated**, what everything missed, and what the *smallest* fix set is.

---

### 1. Two defects, and each stage saw half of each

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

### 2. Findings that are wrong, overstated, or rubric artefacts

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

### 3. What every stage missed

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

### 4. The smallest set of changes that fixes the document

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

### Findings by priority

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

### What this pass checked, and how

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

---

<a id="2026-11-07-egm-goldfish-context-import-flow"></a>

## 2026-11-07 — Goldfish context — review of `docs/design/2026-11-07-import-and-items-flow.md`

*Was `docs/reviews/2026-11-07-egm-goldfish-context-import-flow.md`.*

A reading list, not a summary. Each reviewer starts with no history of the conversation that produced
the doc, so this is the baseline needed to judge it. **Read the files; do not take this file's word
for what they contain.**

The doc is a **plan**, not a shipped feature. It marks each section built / decided / unstarted, and
some of what it describes is uncommitted in the working tree. Judge it as a plan: are the decisions
sound, are the claims about existing code true, is anything missing, is it modular.

### The single most useful question to ask of this doc

**It is dense with specific claims about existing code** — file paths, line numbers, function
behaviour, allocation sizes. Those claims carry the argument. The author got two comparable claims
wrong earlier in the same session, in both cases by reasoning from a type or a comment instead of
reading the call site. So: **verify the claims, do not accept them.** Any that is wrong probably
takes a decision with it.

### Files the doc makes claims about

| Read | For the claim that |
|---|---|
| `src/scenes/sceneMap.ts`, `src/scenes/README.md` | three scenes, `FLOW_END`, `doors`, `scope`; a disabled scene must name an enabled fallback |
| `src/scenes/sceneMap.test.ts` | the invariants above are actually tested |
| `src/bench/benchScene.ts`, `src/bench/README.md`, `src/bench/benchScene.test.ts` | the bench's three properties: nothing locked, canvas gesture `none`, every exit lands there |
| `src/progress/progressTypes.ts`, `src/progress/README.md` | three waiting types; no invented percentage; shape follows the measure; a row borrows `ProgressIndicator` rather than becoming a fourth type |
| `src/dental/editingMode.ts` | `reviewWayOn()` is the single decision; `dental.finish` vs `dental.export` visibility; `dental.exit` is NOT routed through `FLOW_END` |
| `src/components/DentalSupports.tsx`, `src/denture/steps/supports/DentureReviewPanel.tsx` | both review footers ask `reviewWayOn()` instead of naming a command |
| `src/components/StartScreen.tsx` | the three start screens and their order; `held` already carries a file dropped before the type is chosen; the *Any model* key |
| `src/ui/ChoiceKey.tsx`, `src/components/Segmented.tsx` | `note` exists but the start keys have none; `Segmented` has `disabled` |
| `vendor/mixo-geocore/host/dental/alignerProfiles.ts` | `ALIGNER_PROFILES` carries `name[lang]` and `description[lang]` |
| `vendor/mixo-geocore/host/supports/export.ts` | `planExport` reads only contacts from the build; `encodeStl` allocates ONE `ArrayBuffer(84 + triangles * 50)`; the five `ExportKind`s |
| `src/components/useExport.ts` | `runExport` returns void and reports refusals only through the status line |
| `vendor/mixo-geocore/host/workers/buildSessions.ts` | `forget(unitId)` frees the unit's session and every handle; `site()` re-creates when `sourceToken` differs |
| `vendor/mixo-geocore/host/workers/meshClient.ts` | a job whose unit was removed resolves undefined |
| `src/App.tsx` (around 480, and 1076–1115) | the reconcile against `scene.units` that drives release; the dental exit / finish / export command handlers |
| `src/components/useProjectFile.ts` | the `beforeunload` warning |
| `scripts/walk.mjs` | `enterEditor` (~219) clicks *Any model*; section `s` (~2238–2393) specifies the three-screen order; `walkLocale` (~2432+) runs only under `WALK_LOCALES` |
| `docs/design/ui-structure.md` §2.1, §2.3, §4.1 | the shell's regions; the bench as "No mode (setup)"; the rule that the tool, method, switch and sizes survive mode changes |
| `docs/ui-styling.md` | the token table, the bench section, the three waiting types |

### The engine side, which is NOT in this repository

Engine 62 is committed in a separate repo (`S:\ai\mixo-geocore`, commit `6c37d20`), **unpushed and
unvendored**, so `vendor/mixo-geocore` here is still **engine 61** and contains none of it. Do not
look for `diagnose_mesh`, `repair_mesh` or `repair/` in this checkout — their absence is expected and
is not a finding. Judge §3 of the doc on its reasoning, not on code you can read here.

What it provides, per the engine session's own report: `diagnose_mesh` (report only, allocates no
mesh) and `repair_mesh` (returns a new mesh, never mutates). Weld reuses the existing
`Tolerance::Weld`; a new `Tolerance::BodyGap` is 0.005 mm; noise shells under 0.001 mm³ are reported
and never dropped. The body invariant is enforced at runtime: a step that would move a face between
bodies abandons the repair and returns the file unchanged.

For comparison, the existing cleanup it builds on is real and readable here:
`vendor/mixo-geocore/host/core/removeDegenerate.ts`, whose comment says *"Explicit repair, never
implicit"* — the doc proposes departing from that rule, so whether it justifies the departure is fair
game.

### Project rules the doc must not violate

- **Lowest peak memory.** Print files are huge; the real aligner fixture is 373,956 triangles.
- **Every engine change runs the real-scan gate** (`npm run gate:real`, 13 local scans).
- **No third-party slicer names** anywhere. Neutral wording only.
- **zh-Hant is Taiwan wording**, never mainland terms; new UI strings need en / ja / zh-Hant.
- **Every step its own module**, with docs, tests, and the README map updated.
- **Every UI element gets a unique stable `data-ui`.**
- **Never ask the owner a question without a recommended answer.**
- Guards that will fire on sloppy work and are worth knowing exist: `uiStylingDoc.test.ts`
  (undocumented CSS tokens), `noColourLiterals.test.ts`, `glossary.test.ts` (per-language concept
  terms), `i18n.test.ts` (scrapes single-quoted literals — an apostrophe in a comment breaks it),
  `japaneseSubset.test.ts`, `geometryGuard.test.ts`, `commandWiring.test.ts`.

### Known-open items the doc already declares — not findings

The doc's §8 names these. Re-reporting them adds nothing:

1. `src/scenes/README.md` still says multi-file makes Start `scope: 'object'`. The doc says this is
   wrong and to fix the line. It is a known, declared inconsistency.
2. `ledger`'s `place` string in `progressTypes.ts` needs widening to cover the Items list.
3. Whether *Appliance* is the right word for level 1, given that a plain model is not an appliance.
4. Whether the host should ever offer to drop a noise shell.

### What would be genuinely useful to find

- A claim about existing code that is false.
- A step in §7's sequence that depends on something later in the list.
- A place where the two-level naming (Appliance / Type) collides with existing vocabulary.
- Anything in §5 (memory release) that the scene-driven reconcile does not actually cover.
- A module boundary that is drawn in the wrong place, or a step that should be its own module and is
  not — the owner's question when commissioning this review was literally "no gaps, and all well
  modularised?".

### Rubric items to leave alone

A previous review of a sibling doc in this project produced, and its own final stage then rejected, a
class of findings that were artefacts of the rubric rather than defects: *split the document*, *add
Goals / Risks / Non-goals headings*, voice and tone items. They were right to be rejected. Judge
structure only where it genuinely impedes a reader.

**And ask the last stage which earlier findings were wrong or overstated.** On the previous review
that question refuted one finding outright (a reviewer repeating a false code comment as fact),
demoted two, and rejected the class above. It is the highest-value question in the whole flow.

---

<a id="2026-11-07-egm-goldfish-review"></a>

## 2026-11-07 — Resolution — review of `docs/design/2026-11-07-import-and-items-flow.md`

*Was `docs/reviews/2026-11-07-egm-goldfish-review.md`.*

Seven Goldfish reviewers (zoom-out, design, structural, style, comprehension, implementation-readiness,
codebase-details) on the full file, with `docs/reviews/2026-11-07-2026-11-07-2026-11-06-egm-goldfish-context-import-flow.md` as the reading list.

Each finding below is **PROPOSE FIX** or **CONTEST**. Contests carry my reasoning; they are not
dismissals. Convergence is noted where several reviewers found the same thing independently, because
that is the strongest signal in the set.

**One finding was a live bug, not a documentation defect, and it is already fixed in code.** See F2.

---

### The four that change the design

#### F1 — `ledger` cannot draw what §3 specifies · PROPOSE FIX · **7 of 7 reviewers**

`PROGRESS_DELTA.ledger` is `waiting: 'bar'`; `progressShape('ledger', undefined)` returns `'bar'`;
`progressLayout` grants `inline` only when `waiting === 'spinner'`; `progressTypes.test.ts:86,117`
pins both. So "no percentage, a spinner — spinner left, short text right, one row" is precisely the
layout the module refuses for `ledger`, and `progressTypes.ts:149` forbids a call-site override.

**Decision: the Items row is a pacing bar with a leading label, stacked. §3's sketch is wrong, not
the module.** The module's reason is sound and applies here exactly — *"paces rather than spins so
that a column of rows does not become a column of turning circles"* — and the Items list **is** a
column of rows. Changing `ledger.waiting` would restyle every `JobActivity` row to get a cosmetic
preference on a new screen.

**This overrides an earlier instinct of the owner's** ("for small detail loads, a spinner on left and
a short text on right would save spaces"). That instinct is right for a *detail* load, which is what
`PROGRESS_BASE` and `step` already do — spinner, inline. It is wrong for a list, and the module had
already reasoned it through. Flagging it rather than burying it, because it is the owner's call to
overrule.

Two consequences §3 never mentioned, both now to be written down: `ledger` is `tone: '--red'`, so a
routine import row would inherit the failure colour; and `ledger`'s contract promises "the time,
Cancel and failures", which for one engine call means deciding whether the row offers a Cancel at all.

#### F2 — Export wrote the file and Exit destroyed the work · **FIXED IN CODE** · design critic

Not a documentation defect. Under `FLOW_END = 'export'`, `dental.finish` is invisible, so the only
ways out of Step 3 are *Add another aligner* and *Exit*. `exitCommands` (`src/dental/flow.ts:24-32`)
removes the supports and the dental policy of every unit **not** in `dentalFinished` — and OK was the
only thing that ever added one. So: Export STL wrote a correct file, then Exit stripped the plate.
*Save project* afterwards saved a bare model.

**Fixed:** new session event `exportedDental` marks the unit finished without moving the stage;
`dental.export` sends it before exporting. Session-only on purpose — finishing also arranges the
plate, arranging moves the unit, and a moved unit drops the build the export is reading, which would
make `runExport` refuse it as stale.

Pinned by four tests in `src/dental/editing/dentalStep3.test.ts` and new walk check **x18b**, which
presses Exit after Export and asserts both aligners keep their supports and policy.

**Why nothing caught it: x15–x18 all passed, and not one of them pressed Exit after Export.** This
project's own handoff already records the lesson — *"When a step hands off to another step, walk the
handover, not just the step"* — from an identical miss. I wrote that down and repeated it.

#### F3 — Import repair was never decided, and would have departed silently from a stated rule · PROPOSE FIX · 4 reviewers

§3 is titled "What happens to a file on import" and its row progress covers "a file being read **and
repaired**", but §7 contains no step that calls `repair_mesh`. Meanwhile
`vendor/mixo-geocore/host/core/removeDegenerate.ts:2` states the house rule in its first line:
*"Explicit repair, never implicit: … Nothing in the host calls this on its own."*

**Decision: diagnose automatically on import, repair only on an explicit press.** This is better than
what I had, and the review forced it:

- `diagnose_mesh` allocates no mesh, so it is free to run on every file and is exactly what the strip
  needs.
- `repair_mesh` returns a **new** mesh — a second full copy of a 373,956-triangle model, per file,
  for "files, plural". Making it automatic imports that cost unasked, against the project's
  lowest-peak-memory rule.
- The operator's printed file would otherwise not be the file they supplied, with no consent point —
  and §3's own limit 1 says a patch is never intersection-tested against the model.

So the house rule stands rather than being broken quietly. The strip reports; a press repairs.

#### F4 — The reorder deletes the bench's only doors · PROPOSE FIX · zoom-out

§1's new Start is *Drop* + *Items*, neither holding a task key. But *Any model* and *Open a saved
project* are drawn on the task screen (`StartScreen.tsx:87,89`) and recorded as the bench's only
non-flow entries in `SCENES.bench.doors`, asserted by `sceneMap.test.ts`. §4 spends a subsection
arguing the bench must stay reachable **because of Any model** — and the reorder removes the screen
it lives on.

**This is the same mistake I already reverted once today, by a different route.** The first time I
switched the scene off; this time the reorder deletes its door while §4 argues the door must stay.

**Decision: both doors move to the Drop page** — *Open a saved project* as the link it already is,
and a plain "Open the workspace" affordance for the no-flow path. *Any model* does **not** become an
Appliance value: `onAnyModel` never enters dental mode at all, so folding it into a per-row Appliance
column would conflate "no flow" with "a kind of appliance". F5 is the same error in the other field.

---

### Accepted, with the decision each forces

#### F5 — `DentalKind` is vendored, has two values, and "Model only" has no representation · PROPOSE FIX · 4 reviewers

`vendor/.../dental/dentalKind.ts:12` — `'aligner' | 'denture'`, header comment *"the two dental
product kinds the engine has a profile family for"*. `defaultProfileId`, `profileIdsOf` and
`requireKind` are total over the pair (`requireKind` throws), and `isDentalKind` parses **saved
files**. So a third value means widening a vendored type and changing the save format.

I spent a paragraph defending why `profile` must not be renamed because it is a vendored identifier —
and missed that `kind` is vendored too, and is where the risk is structural rather than cosmetic.

**Decision: "Model only" is not a kind. It is the absence of one** — `kind: undefined`, the existing
`onAnyModel` path, no object scene. Level 1 is therefore "which flow, if any", represented app-side,
and the vendored union is untouched.

#### F6 — §5's release would break the viewport and the export · PROPOSE FIX · zoom-out, comprehension

`planExport` gives a unit a supports part only when `unitContacts(unit, built.get(id))` is non-empty
(`export.ts:53`), and `supportMeshes` is derived from `built` and handed to the viewport
(`App.tsx:326`). So my proposed test — *"assert `built` has no entry for it"* — specifies a finished
aligner that **draws no supports and exports as a bare model**, breaking §4's "the plate seam stays"
in the same document.

**Decision: Option 1 is withdrawn.** The split I described first and then abandoned is the right one:
`UnitBuild` keeps `unit` and the contact bookkeeping, and the heavy `mesh` is what gets dropped. Also
to be written down: `forgetUnit` already forgets in *both* workers, and `forget()` on a running job
clears `sent` so every other unit re-uploads — so "removing a row gets this for free" is false.

And the trigger has no site: with OK gone, "finished and moved on" is not a single moment in the
code. `exportedDental` (F2) is now that moment, which is a second reason F2's fix was the right shape.

#### F7 — Engine 63 unpushed, unvendored, and a breaking signature change · PROPOSE FIX · 6 reviewers

Push is **done** (`8bd2430..b5a71ab`). §7 step 3 still vendors only engine 62, while step 7 calls
engine 63's three-argument `repair_mesh`. And `maxFillLoopMm` is **required with no default**, so the
two-argument form in §3 stops compiling the moment 63 lands.

**Decision: one step vendors `b5a71ab` (engine 63, which contains 62) and runs `gate:real` once.**
Vendoring 62 separately would be a pointless intermediate state with a signature that is about to
change.

#### F8 — The verdict table's three states are not disjoint · PROPOSE FIX · style

A file with a real hole but no duplicate vertices satisfies row 1 (`changed() === false` → *"Clean.
Nothing done."*) **and** row 3. An implementer reading top-down tells the operator a holed mesh is
clean, about a file they are about to print.

**Decision: row 1 gains `watertight === true`.** Precedence-by-ordering would work but a table whose
correctness depends on reading order is the wrong artefact for operator-facing text.

#### F9 — There is exactly one aligner type · PROPOSE FIX · comprehension, design

`PROFILE_FILES` holds a single entry, `reference-aligner.json`; the denture family likewise; walk `s2`
asserts one card. So the reserved Type column has one option for Aligner, one fixed for Denture, and
none for Model only — a column with no choice in it anywhere.

**Decision: say so, and keep the reserve rule as explicitly forward-looking.** §2 currently argues for
a never-reflowing column from variability that does not exist. The rule is still right for when a
second profile lands; the justification has to be honest about today.

#### F10 — Import already welds · PROPOSE FIX · codebase-details

`src/workers/prepareImport.ts:13` — `engine.weld_positions_in_place`, comment *"first-seen weld"*, on
every import. So engine 62's weld step may be closing cracks the host already closed, which undercuts
§3's "welding closes most apparent holes" premise **for this app's import path**. §3 must place
`diagnose_mesh`/`repair_mesh` in the existing chain (weld → centre → capacity → decimate for display,
full-resolution kept as the support/export source) and say which mesh they see.

#### F11 — The export cliff is bounded · PROPOSE FIX · codebase-details

`assertPlateCapacity` refuses any import past `TRIANGLE_BUDGET × 4` = 6,000,000 triangles, so
`whole-printable` is capped near ~300 MB rather than unbounded. Still a large single allocation, and
`new Blob([file.buffer])` copies, so peak at download is ~2×. But I overstated it as unbounded growth.

Also accepted: "one buffer per file, released after each download" is not true of the code —
`useExport.ts` awaits the whole `outcome.files` array before looping the downloads, so `separate-*`
holds every buffer at once. What actually distinguishes per-item is **one export task per item**, and
the export client runs `mode: 'per-job'`, so the whole worker heap returns after each one. That is a
stronger argument than the one I made, and it replaces it.

#### F12 — "Model only" / "Any model" contradiction · PROPOSE FIX · 3 reviewers
§2 renames it; §1's table and §4 keep *Any model*; the walk asserts the live string in `s1`, `s11`,
`s12`, `enterEditor` and `walkLocale`'s `KEYS`. Resolved by F4: the key keeps its name and its job.

#### F13 — The wrong `scope` claim is in three places, and `SceneScope`'s justification is now void · PROPOSE FIX · 3 reviewers
Not just `src/scenes/README.md`: the same statement is the body of the `SceneScope` doc comment
(`sceneMap.ts:30-38`) — the one a code reader meets first — and a whole section of the README.
**And the deeper point:** the README justifies keeping `scope` *because* multi-file would change it.
If Start stays `run` permanently, that justification is gone, so the field needs a new reason or
retiring. By its own rule: *"A field holding a future intention rots."*

#### F14 — `benchScene.ts` still tells the old story · PROPOSE FIX · zoom-out, codebase-details
Its header calls the end of the flow one of three arrivals and says *"this is the fact the name exists
to make sayable"*; `BENCH_ARRIVALS` repeats it and a test holds it there. With `FLOW_END = 'export'`
that arrival is unreachable. The README says "not in this build"; the module does not.

#### F15 — §7 is not executable · PROPOSE FIX · 4 reviewers
No file lists, no module names for the Items page / row / strip, no `data-ui` names, no locale keys,
one test case in the whole plan, and no exit criterion for five of seven steps. Against the project's
own rule that every step is its own module with docs, tests and the README map updated — which
`src/scenes` and `src/bench` got and this work is not scheduled to get.

Accepted in full. Includes: `data-ui` uniqueness for N rows (the borrowed `ProgressIndicator` carries
no name of its own, so N rows are unnamed by construction — and `src/progress/README.md` records a
walk check that looked at the first of a set and called the rest missing); the unscheduled
`glossary.test.ts`, `japaneseSubset.test.ts` and `uiStylingDoc.test.ts` work; and the Taiwan-wording
rule being stated in §6 where no implementer of §2 will read it.

#### F16 — Per-row state has no home · PROPOSE FIX · 3 reviewers
`dentalProfile` is one `string | undefined`; `startKind` is one `useState`; `held` is one `File` and
the drop handler takes `files.find(isStl)`, discarding the rest. `src/scenes/README.md:81` says in as
many words that there is deliberately no per-object type field. N rows need N kinds and N profiles
somewhere, plus serialisation, plus a rule for what the per-object loop does per Appliance (a denture
skips Step 2; Model only skips the scene). None of it is in the doc.

#### F17 — The plate's refusal limit is unmentioned · PROPOSE FIX · codebase-details
A screen whose premise is N files must say what a row shows when `PlateFullError` refuses it, whether
the rest of the drop still loads, and whether refusal is per row or per drop. Also: `PlateLedger`
holds imports *outside* `scene.units`, so a row removed before its unit exists is exactly the case the
reconcile misses — which answers the question the context asked and §5 answered by assertion.

#### F18 — Accepted nits
`runExport` returns `Promise<void>`; "four `WAY_ON` sites" does not grep (`reviewWayOn`, two
production + two test); `CARD_ICON` has one entry with the fallback at the call site, so per-type art
does not exist; `description[lang]` is already rendered as a `ChoiceKey` note on Step 0, so "unused"
holds only for a row; `--row` is the documented 22px token and should be named instead of the literal;
`Segmented`'s `disabled` is group-level and an empty options array renders a zero-width div, so it
cannot reserve the column — the placeholder is still work; §6's line range and the 20→21 count
(s1–s19 **plus s2b plus u1a**, and `u1a` is a `u`-id inside section `s`, so an id-prefix rewrite walks
past it); `site()` re-creates because the entry is gone, not because the token differs; the preamble
says one engine slice where §3 says two; §8 asks about noise shells with no recommendation, against
this project's own rule.

---

### Contested

#### C1 — "No problem statement, goals, non-goals or success measure" · CONTEST IN PART · design

**Accepted in part.** The reviewer's real point is sound: §6 prices the reorder and nothing in the doc
says what operator problem multi-file solves, so the price cannot be weighed. A short problem
statement will be added, and the non-goals that matter (per-row orientation detection, per-row
settings, row reordering).

**Contested:** the full Goals / Non-goals / success-measure scaffolding. This is a working plan
consolidating one session's decisions for the people who will execute them, not a product spec, and a
previous review in this project produced exactly that class of finding and its own final stage
rejected it as a rubric artefact. Adding the motivation is substance; adding the headings is not.

#### C2 — "The Alternatives Rule is not met for the Items row and upload-first" · ACCEPTED, recorded as a contest only because I first wanted to argue it · design

I was going to contest this on the grounds that the owner specified both. Checking the standard, the
reviewer is right and the objection is weak: the doc argues alternatives for voxelisation, plate
export and the release options, and then presents its two most expensive decisions as settled. The
cheaper option — keep the current screen order and accept N files on the existing file screen — is
never weighed against §6's price. **Accepted; I will add it.**

#### C3 — "Engine-implementation altitude in an app-flow plan" · CONTEST · zoom-out (self-flagged as weak)

The fill strategies and the nine reason strings are not decoration: the verdict table and the strip's
wording depend on which refusals exist, and the three limits depend on where filling stops. I will
trim the triangulation detail to its consequence and keep the reason set, which the host must branch
on. The reviewer said it would not defend this hard.

#### C4 — "`data-ui` per row may be implementation detail" · CONTEST REJECTED — accepted instead
The reviewer offered this as possibly demotable. It is not: this project's rule is explicit, and its
own README records a walk check that mistook the first of a set for the whole. Accepted at Major.

---

### Not re-reported

The four items §8 already declares open. The rubric class all seven reviewers correctly declined to
raise. And the absence of `diagnose_mesh` / `repair_mesh` from this checkout, which is expected.

### What the review bought

One live bug that would have destroyed an operator's work after a successful export, found by nobody
else and missable by every green test; two false claims of mine (`ledger`, and the vendored field I
defended being the wrong one); one premise undermined (import already welds); one argument I had
overstated (the export cliff is bounded) replaced with a stronger one (one worker task per item); and
a design decision I had left implicit now made explicitly and better (diagnose on import, repair on a
press, so the house rule stands).

---

<a id="2026-11-07-egm-round4-feature"></a>

## 2026-11-07 — Goldfish Review Report — Round 4, feature spec

*Was `docs/reviews/2026-11-07-egm-round4-feature.md`.*

**Target:** `docs/design/2026-11-07-import-and-items-flow.md` (lines 1–587, §0–§7)
**Out of scope here:** §8 (588–860) and §9 — reviewed concurrently by a second synthesizer.
**Reviewers:** `egm-design`, `egm-structural`, `egm-style`, `egm-zoom-out`, `egm-comprehension`
**Standards:** feature-spec (design, structural), zoom-out, re-implementation (comprehension)
**Artifact:** `S:/ai/mixodental/docs/reviews/2026-11-07-egm-round4-feature.md`

**Counts after deduplication: 11 🔴 Blocker · 26 🟡 Major · 15 🟢 Nit.**

Round 1–3 dispositions were honoured: no reviewer re-raised the non-exclusive/non-exhaustive verdict
table, the stale "a third", the `--row` app-token claim, "THREE places", the step 6/7 order, or the
dropped per-row Appliance/Type. Three claims were re-verified by the synthesizer directly:
`vendor/mixo-geocore/SOURCE.json:5` = `"engineVersion": 63`; `package.json:19` =
`"walk:locales": "node scripts/walk.mjs --locales=en,ja,zh-Hant"`; `src/items/rowState.ts:65-66`
`ROW_STATES` has nine members.

**Headline.** The document's *argument* is in good shape. Its *facts* have drifted behind the tree:
the whole of §3's status header, its fill-reason premise and its module path are false, and the
measurement §3 defers to has already reported the opposite of what §3 assumes. Separately, §7 — the
section the owner asked to have looked at hardest — does not specify the UI it is the section for.
No page layout, no operator sentence in any of the three languages, no preview definition, two
`data-ui` names out of a page's worth, and a token the section says to declare but never names.

---

### Prioritized Findings

#### 🔴 Blockers

##### BL-1. §3's status header is false on all three of its claims
* **Reviewer Lens:** all five (independent)
* **Affected Scope:** lines 179–180
* **Quote:** "**Engine COMPLETE and PUSHED: `6c37d20` (engine 62) and `b5a71ab` (engine 63), on `origin/main` in geocore. Not vendored — the tree is engine 61. App side unstarted.**"
* **Discrepancy:** `vendor/mixo-geocore/SOURCE.json:3,5` records commit `b5a71ab…` and
  `"engineVersion": 63`; `host/core/repairMesh.ts:2` opens "Mesh repair on import (engine 63)" and is
  in the vendored hash list. "App side unstarted" is false in five places: `src/items/rowState.ts`
  (whole classifier), `src/state/diagnosis.ts`, `diagnoseImported` at `src/workers/prepareImport.ts:78`,
  its call site `src/workers/importWorker.ts:65`, and `PrintUnit.diagnosis` at
  `src/state/project.ts:71` with `diagnosisField` at `:350`. §8 step 4 (line 641) and step 6 (line 692)
  already say DONE, so §3's own header contradicts §8.
* **Recommendation:** "Engine 63 vendored (`SOURCE.json`). App side: worker diagnosis, the verdict
  type, the row-state classifier and persistence are built (plan step 6); repair-on-a-press and the
  row component are unstarted (plan step 9)." This is the first line an implementer reads to decide
  what to pick up, so as written it schedules a vendor round that has happened and re-writes modules
  that exist.

##### BL-2. `fill-disabled` is called unreachable; it is now the universal case
* **Reviewer Lens:** all five
* **Affected Scope:** line 258–260, against line 297
* **Quote:** "`fill-disabled` is unreachable once step 5's constant exists." — against, 38 lines later,
  "Reached when the fill limit is zero (every loop reports `fill-disabled`, which is not a refusal)".
* **Discrepancy:** exactly inverted. Step 5 set `MAX_FILL_LOOP_MM = 0.0`
  (`scripts/measure-rim-loops.mjs:124-129`, §8 line 666), which is precisely the condition that makes
  `fill-disabled` the *only* reachable reason. `src/items/rowState.ts:30-33` and
  `src/items/README.md:40-42` both rely on this to make `unchanged` a common-path state, not a
  curiosity. It is `fill-too-long` and the other seven codes that are currently unreachable. Line 258
  is the premise for folding nine codes into three operator classes, so the premise is backwards.
* **Recommendation:** delete the clause. State that at the shipped limit of 0, `fill-disabled` is the
  expected code and `unchanged` the expected post-press state, that the other eight codes are retained
  for a future non-zero limit, and that therefore *too long to fill safely* and *shape refused* have
  **no reachable copy in this release**.

##### BL-3. "all eight row states" — there are nine
* **Reviewer Lens:** all five
* **Affected Scope:** line 583–584
* **Quote:** "**The Items row and all eight row states belong in `kit.html`**, each rendered once"
* **Discrepancy:** `src/items/rowState.ts:65-66` declares nine: `unreadable, too-big, clean, holes,
  malformed, refused, unchanged, repaired, repaired-open`. `src/items/README.md:9` is headed "The nine
  states, and why there are nine", and a test asserts the declared list equals the reachable set.
  §8 step 6 (line 694) says nine while §8 lines 736 and 762 repeat "eight", so the undercount is
  systemic. The "eight" traces to §3's two tables (4 + 4), whose first row merges `unreadable` and
  `too-big` — states the code deliberately splits. Because `kit.html` is step 6a's exit criterion, an
  eight-card catalogue passes review with a state missing: the exact non-exhaustiveness failure rounds
  1–2 were spent removing.
* **Recommendation:** nine everywhere, named by their `RowState` members. State the exit criterion as
  "the catalogue iterates `ROW_STATES`", not a literal count, so a tenth state appears on its own.
  Note `too-big` carries `limit: 'triangles' | 'memory' | 'plate'` (`rowState.ts:40`), so the
  catalogue needs eleven cards to show every sentence.

##### BL-4. §3 puts the classifier in the one folder a guard refuses
* **Reviewer Lens:** design, structural, zoom-out, comprehension, style
* **Affected Scope:** line 300–301
* **Quote:** "A pure function in `src/import/` maps a report to one of these, tested on its own"
* **Discrepancy:** it is `src/items/rowState.ts`. `src/items/README.md:44-51` records that
  `src/core/import/` was **refused** for it by `importOracleBoundary.test.ts`, which pins that folder
  to exactly `estimate.ts` and `stlHeader.ts`; §8 step 6 (line 699) says so in bold. §3 also
  contradicts itself — line 190 says "there is no new `src/import/` pipeline to build". §3 is the
  normative section for the states, so it sends the implementer straight into a guard failure.
* **Recommendation:** name `src/items/rowState.ts` and its four entry points —
  `verdictOfRefusal`, `verdictOfDiagnosis`, `verdictOfRepair`, `offersRepair` — with one line of the
  guard's reason.

##### BL-5. The repair-vs-diagnose-only valve has already fired, and §3 still argues the old way
* **Reviewer Lens:** design, zoom-out (Blocker); comprehension, style (Major)
* **Affected Scope:** lines 212–219
* **Quote:** "**Repair earns its place in this release because a holed aligner cannot be printed** …
  If that turns out to be rare in the 13 real scans (§8 step 5 measures it), diagnose-only is the
  better first ship and repair moves to the next."
* **Discrepancy:** the step this sentence defers to has reported, and reported against its premise.
  Over **18** files (not 13 — that is the real-scan gate's corpus) there were **zero** open boundary
  rims (`measure-rim-loops.mjs:124-129` prints "NO FILE HERE HAS AN OPEN BOUNDARY RIM"; §8 lines
  654/661/672). Holes are not rare on the measured corpus, they are absent. What survives is
  non-manifold on 8 of 18 files, up to 5,547 non-manifold edges. So the *stated* justification for
  shipping repair does not hold, while a different and probably sufficient one does — and §3 never
  says so, never names who decides, and never records the decision as taken. The tense is also wrong
  throughout ("measures it" for a step marked DONE). Consequence for scope: at a zero fill limit the
  only reachable post-press states are `refused`, `unchanged`, `repaired`; `repaired-open` with its
  per-loop reasons — the expensive three-language part of step 9 — is unreachable.
* **Recommendation:** either (a) ship diagnose-only, deleting step 9, the `repaired-open` copy and the
  fill-reason classes, or (b) rewrite the justification as "non-manifold splitting on 8 of 18 measured
  scans", name the decider and the date, and scope step 9 to the three reachable states. Fix 13 → 18
  and say which number means what.

##### BL-6. Not one operator sentence is supplied, in any of the three languages
* **Reviewer Lens:** comprehension, style (Blocker); design (Major)
* **Affected Scope:** §3 lines 279–298; §7 lines 561–576, 584
* **Quote:** line 584, "so the operator wording and the dense layout can be reviewed" — and there is
  no wording in the document to review.
* **Discrepancy:** §3's two "Says" columns mix final copy, paraphrase and instructions-to-invent with
  no marking. Bolded cells read as shippable text ("Could not be read", "Holes found.", "Too big for
  the plate", "Refused, file unchanged", "Nothing to change."); unbolded cells read as gloss
  ("Clean. Nothing to do.", "Repaired."); three cells are instructions, not text ("naming the limit",
  "naming the step", "a reason per loop"). Grepping `src/locales/ja.ts` and `src/locales/zh-Hant.ts`
  for "Holes found", "Nothing to change", "Could not be read", "Too big for the plate", "file
  unchanged", "Winding or non-manifold", "Next item" and "Appliance" returns **zero hits in either
  dictionary**. Every state also carries numbers the sentence must place, and no template says how:
  `holes{loops, longestMm}`, `malformed{nonManifoldEdges, windingConsistent}`, `refused{step}`,
  `repaired-open{loops, reasons}`, `too-big{limit}`, `unreadable{code}`. §8 step 6a gates on
  `i18n.test.ts` / `glossary.test.ts` / `japaneseSubset.test.ts`, which cannot be met from this text.
* **Strings an implementer must invent** (each user-visible, each absent):
  1. Three capacity sentences, one per `CapacityLimit` value. Line 283's "Too big for the plate" is
     the *plate* case only and silently mislabels `triangles` and `memory`.
  2. The refusal sentence with the repair step interpolated. `rowState.ts:92` strips the
     `body-invariant:` prefix, so the slot receives a bare engine identifier — say whether that is
     shown to an operator, and if not, give the mapping.
  3. The three fill classes' sentences (*filled*, *too long to fill safely*, *shape refused*) — named
     as classes at line 261, never written. (And see BL-2: two of the three are unreachable.)
  4. The per-loop line for `repaired-open`, and whether it pluralises. `rowState.ts:95`
     **deduplicates** reasons, so the row shows *which*, not *how many* — "a reason per loop"
     (line 298) contradicts the built behaviour and reads as N lines for N loops.
  5. Whether `unreadable`'s three causes (`StlFormatError`, `StlEmptyError`, non-finite) share one
     sentence or get three, and whether `code` is shown.
  6. Appliance tooltips for the three keys (line 169 admits this: "words to write, in three languages").
  7. The Drop page's per-row refusal reason for a non-accepted format (lines 494–497).
  8. The replacement heading and footer for the two strings `u1a` pins — *"What would you like to
     support?"* / *"Choose what to make supports for."* — which §6 line 471 and §7 line 558 both say
     must move.
  9. *Next item* (line 98).
  10. The row cap's refusal text (§9's cap, never mentioned in §5 or §7).
* **Recommendation:** one table, `key · slots · en · ja · zh-Hant`, covering all nine states, the
  reachable fill classes, the three capacity refusals, the three key tooltips and the moved
  heading/footer. Nothing in a copy column that is not literal shippable text. If three-language copy
  is genuinely plan step 7b's deliverable, say that plainly, mark every English fragment in §3 as a
  gloss, and name who signs off the Taiwan wording — but do not leave the two readings available.

##### BL-7. Neither new page's layout is specified
* **Reviewer Lens:** comprehension (Blocker); design, structural (Major)
* **Affected Scope:** §7 lines 516–587; §1 line 49
* **Quote:** the only layout statement in the document is line 49, "One row per file: preview, verdict, progress."
* **Discrepancy:** §7 never states the row's column order or widths; where the *Repair* press sits and
  whether it is in-row; where *Next item* sits and what it says when no unstarted row remains; the
  Items page heading and footer; the Drop page's arrangement of logo / title / drop zone / three keys /
  *Open a saved project*; the empty state; what a finished row looks like. Line 565 reserves red for a
  "**current-item marker**" that is never defined, placed or named anywhere in the document.
* **Named guesses:** page chrome, row anatomy, action placement, the finished-row state, the
  empty-list state, the current-item marker.
* **Recommendation:** §7 owes a row anatomy (left-to-right, with which token sizes each cell) and a
  page skeleton for both pages, or an explicit statement that step 6a's `kit.html` card *is* the
  specification and the layout is decided there — in which case §7 must say what the card must show.

##### BL-8. "Preview" is used once and defined nowhere — and it is a peak-memory decision
* **Reviewer Lens:** comprehension, design
* **Affected Scope:** line 49 ("preview, verdict, progress"); §7 never mentions it
* **Discrepancy:** the word occurs exactly once in 891 lines. A thumbnail? A format icon? The file
  name? If it is rendered geometry it is the only new per-row CPU/GPU cost the feature introduces, and
  it collides head-on with the lowest-peak-memory rule §3 itself uses to justify diagnosing in the
  worker — N previews from which copy, at what raster size, kept or drawn once, released when?
* **Recommendation:** define it in §7 — source (`display ?? mesh`), raster size, lifetime, bytes added
  to §0's measure — or delete the word from line 49.

##### BL-9. `data-ui` and class-name coverage is two names for a feature that adds two pages
* **Reviewer Lens:** comprehension (Blocker); design, structural, style (Major)
* **Affected Scope:** §7 lines 540–559; §6 lines 473–476
* **Quote:** lines 556–559, "the new pages must also state their **class names**, or the walk rewrite
  is guesswork" — and then they are not stated.
* **Discrepancy:** only `items-row-<importId>` and `items-progress-<importId>` are given. Both are
  correct and the `ProgressIndicator` reasoning verifies (`src/progress/Progress.tsx:61` names the
  wrapper `progress-${type}`, per type not per instance). Nothing is named for: the Items page root,
  the Drop page root and drop zone, the three Appliance keys, *Open a saved project*, the logo/title
  block, the per-row *Repair* press, *Next item*, the verdict text node, the preview, the per-row
  refusal text, or the removable-row control §5 lines 459–461 and §8 lines 801–803 both assume. Under
  the project's own rule every one of those must have a unique stable name, so the implementer invents
  all of them. The same self-admitted gap is stated twice — §6 lines 473–476 and §7 lines 555–559 —
  and discharged neither time; section `s` of the walk selects by **CSS class**, not `data-ui`
  (`.start-task`, `.start-screen .choice-keys`, `.start-screen .dental-drop`, drop dispatched on
  `.start-screen`), so the class names are load-bearing for the rewrite.
* **Recommendation:** a table of every new element with its `data-ui` **and** its CSS class, plus the
  two replacement strings `u1a` pins. Alternatively make "name them" an explicit exit criterion of
  step 6a rather than a complaint stated twice.

##### BL-10. The row-height token has no name and no value, and §7 then quotes the forbidden table
* **Reviewer Lens:** comprehension (Blocker); design, style, structural (Major)
* **Affected Scope:** lines 524–534 against line 563
* **Quote:** line 531, "**declare the row height as an app token in `src/styles.css` and add it to the
  app token table**" — then line 563, "Rows are dense (22px, body 11.5px), radius 2px".
* **Discrepancy:** the `--row` diagnosis is right and verified (declared only at
  `typelab/tokens.css:44`, tabled at `docs/ui-styling.md:478` under the line 466
  heading "The tokens of `typelab/tokens.css` **that the app does not have**"). But the
  fix is stated as a job, not a spec: no token name, no value, no table row. Then line 563 specifies
  the row with the two numbers from that same forbidden table (`--row` 22px, `--fs-md` 11.5px). Worse,
  "body 11.5px" names the wrong app token class: in this app 11.5px is `--small-size`
  ("Small print", `docs/ui-styling.md:106`) while `--body-size` is **12.5px** (`:104`), so anyone
  reaching for a token implements `--body-size` and gets 12.5px. (`--radius: 2px` does exist,
  `src/styles.css:31`.)
* **Named guesses:** the token identifier, its value, and which existing token supplies the text size.
* **Recommendation:** give the new token a name and a value once (e.g. `--items-row: 22px`), add the
  table row, and say the row text is `--small-size`. Delete the borrowed figures. Step 6a's
  `uiStylingDoc.test.ts` exit criterion is unmeetable until this is concrete.

##### BL-11. §1's "the entry already exists" describes a flow whose entry predicate is never satisfied
* **Reviewer Lens:** design, zoom-out, comprehension
* **Affected Scope:** lines 84–90, 94, 96–99
* **Quote:** "**That is exactly what the Items page needs**, heavy refusal included … The Items page
  selects the row's unit and takes this path." / "`startDental` … is the way *into* the flow and
  nothing else."
* **Discrepancy:** three defects in one seam, and the first fails silently.
  1. `useSelectedAligner` (`src/App.tsx:816-825`) returns with **no message** unless
     `acceptsDentalDrop`, which is `mode === 'dental' && dentalStage === 'aligner' && dentalAligner
     !== 'loading'` (`src/dental/editingMode.ts:353-355`). On the Items page after a drop the session
     is `mode: 'off'`, so this path is a no-op for the **first** item.
  2. Replacing `addAnotherDental` with *Next item* (lines 96–99) removes the only event that returns
     the session to `dentalStage: 'aligner', dentalAligner: 'prompt'` — which is what makes
     `acceptsDentalDrop` true for items 2..N.
  3. `useSelectedAligner` takes **no argument**: it reads `sceneRef.current.activeUnitId`. "Selects the
     row's unit and takes this path" is therefore a dispatch-then-call across a ref the dispatch has
     not yet updated, and the document never names the mechanism by which a row makes its unit active.
  Also unstated: `startDentalAligner` (`App.tsx:627`) routes a denture job to `denture.orient.start`,
  not `dentalFlow.startAligner` — live the moment the Drop page's Appliance can be Denture.
* **Named guesses:** who sends `startDental`, when, and with which profile for item 1; whether
  *Next item* still dispatches `addAnotherDental` and merely relabels it; whether Denture and
  *Any model* drops show the Items page at all; whether a row can be started while another imports.
* **Recommendation:** state the entry explicitly — `startDental` once per run at the Drop→Items
  transition (it is guarded on `mode === 'off'`, so once is safe), `addAnotherDental` retained as the
  state transition behind the relabelled *Next item*, then `useSelectedAligner` per row — change the
  entry to take a `unitId`, and require the silent `return` to become a message, since a row press
  that does nothing is unreportable. The verified parts of this passage (the heavy-tier refusal at
  `App.tsx:819-822`, the `acceptsDentalDrop` guard, and the `dentalFinished: []` trap at
  `editingMode.ts:215,219,387`) stand.

---

#### 🟡 Major

##### MA-1. "Two tables, each exhaustive over its own report" — there are three sources
* **Lens:** all five · **Lines:** 276–298
* `src/items/rowState.ts:17-19` is explicit ("THREE SOURCES, NOT ONE") and `README.md:11-17` splits
  them: *refusal* (`verdictOfRefusal` → `unreadable` / `too-big`), *diagnosis* (`verdictOfDiagnosis` →
  `clean` / `holes` / `malformed`), *repair* (`verdictOfRepair` → four). §3's first table is titled
  "from `diagnose_mesh`" yet its first row never reaches `diagnose_mesh`, and the cell admits inside
  itself that it holds "two different sentences". §8 line 735 already knows §3's heading is wrong.
  Rows 2–4 **are** a correct partition (`watertight`, then `boundaryLoops > 0`, then else — matches
  `rowState.ts:81-83`), and the second table **is** a correct partition of a repair result
  (`:91-96`), so the fix is structural only.
* **Fix:** three tables matching the three entry points, non-mesh group first, nine rows, each row
  naming its `RowState` member and the fields it carries, with `CapacityLimit`'s three values
  enumerated.

##### MA-2. §0's measure states a memory bound in units of triangles, and §4 contradicts it
* **Lens:** design, structural, style, zoom-out · **Lines:** 22–24 against 366–369
* The arithmetic is right (`vendor/mixo-geocore/host/core/budget.ts:17,20,41-44`: 1,500,000 ×
  `REFUSE_FACTOR` 4 = 6,000,000), but a triangle ceiling is not a memory measure, and §4 says so
  itself: "bounded by the plate limit **plus the generated supports**, which the plate guard does not
  count — so no single figure is an upper bound." The code has a separate memory guard the measure
  ignores (`assertMemoryCapacity` / `memoryCapBytes`, `App.tsx:728`). At 12.2 MB per model the
  triangle limit permits ~24 models / ~290 MB, i.e. §0's bound is *looser* than §9's cap of 8
  (~100 MB) — so §0 claims as satisfied the thing §9 lists as open.
* **Fix:** two bounds with their own units: imported triangles ≤ 6,000,000 (cite `assertPlateCapacity`),
  and retained host bytes ≈ N × measured per-model bytes (12.2 MB worst case) + supports, with
  `assertMemoryCapacity` named as the enforcing guard and the §9 row cap as the N bound.

##### MA-3. §0's "no transient copy is added per file" is unverified and probably false
* **Lens:** zoom-out · **Line:** 24
* The plan adds `diagnose_mesh(positions: Float32Array, indices: Uint32Array)` per imported mesh
  (`repairMesh.ts:165`, via `diagnoseImported`). Those are slice arguments across the wasm boundary —
  a full copy of positions+indices into the wasm heap (12.2 MB for the largest measured model) plus
  engine adjacency, live alongside the host arrays. `prepareImport.ts` only claims `diagnose_mesh`
  "allocates no mesh of its own", which is a claim about its *return*.
* **Fix:** measure it, or restate as "one transient full-res copy inside the per-job import worker,
  released with the worker".

##### MA-4. §6's walk-locale paragraph is false about the current tree
* **Lens:** structural (Blocker), zoom-out (Major) — re-verified by the synthesizer · **Lines:** 479–482
* Quote: "there is no `walk:locales` script in `package.json` and CI runs `npm run walk` with no
  `WALK_LOCALES`." `package.json:19` has `"walk:locales": "node scripts/walk.mjs
  --locales=en,ja,zh-Hant"`, and `scripts/walk.mjs:133-134` reads `--locales=` first with the env var
  as fallback. §8 step 2 (lines 620–624) says DONE and that CI runs it as its own step. §6 is the only
  place a reader of 0–7 learns about the locale gate.
* **Fix:** past tense ("was env-var only and unrun; step 2 added the flag, the script and the CI
  step"), or cut and point at §8 step 2. The round-3 correction inside this bullet — that
  `walk.mjs:2717` does `process.exit(failed === 0 ? 0 : 1)` — is verified and should stay.

##### MA-5. §1 calls `s17` unexplained; §8 and the commit log say it is fixed
* **Lens:** structural, zoom-out · **Line:** 78
* "it sits in the same region as the unexplained `s17` failure in §8" — §8 step 1 line 618: "**`s17` is
  fixed.**" The cross-reference points at nothing and inflates the perceived risk of the
  Back-at-Orient change, which is the one genuinely new behaviour in §1.
* **Fix:** "the region `s17` regressed in, now fixed (§8 step 1)", or drop the clause.

##### MA-6. "Engine 61, already in the tree" — the tree is 63
* **Lens:** structural, design, comprehension, style · **Line:** 411
* Same staleness as BL-1; fix together. The substantive claim survives and was verified:
  `vendor/mixo-geocore/host/supports/unitSupports.ts:56,59` carry `BuiltSupports` and the generic
  `UnitBuild<T extends BuiltSupports>` exactly as quoted, `BuiltSupports` genuinely lacks `footprint`,
  and `host/supports/export.ts:48` takes `ReadonlyMap<string, BuiltSupports>` — so "no engine change"
  stands. Only the number is wrong.

##### MA-7. The nine→three fill-reason collapse is attributed to a classifier that does not do it
* **Lens:** design, zoom-out, comprehension, style · **Lines:** 258–263
* "The classifier maps them onto **three operator classes**" — the shipped `verdictOfRepair`
  (`rowState.ts:95-96`) returns a **deduplicated** `readonly FillReason[]` and nothing maps anything.
  No module, function or home is named, unlike `offersRepair()` (`:100`), which is. Also unstated that
  the dedup means a row shows *which* reasons, not *how many*.
* **Fix:** name the function and its home, or say the mapping lives in the string layer. See BL-2: at
  the shipped limit two of the three classes are unreachable, so this may simply be deleted.

##### MA-8. `ok()` / `changed()` are written as calls; the host type has plain booleans
* **Lens:** style, structural, design, comprehension · **Lines:** 241–242, 276, 295–298
* `RepairResult.ok` / `.changed` are properties (`vendor/mixo-geocore/host/core/repairMesh.ts:126-129`),
  read as `result.ok` / `result.changed` at `rowState.ts:92-93`. `ok()`/`changed()` are methods of the
  raw wasm `RepairObject` (`repairMesh.ts:147-149`), an altitude the host never touches. An implementer
  copying the table writes a call on a boolean.
* **Fix:** `ok === false`, `changed`, `after.watertight` throughout, plus one sentence saying
  `host/core/repairMesh.ts` is the boundary where the handle becomes an object. Line 251's
  `repair_mesh(positions, indices, maxFillLoopMm)` is the raw ABI; the host entry points the app calls
  are `repairMesh(engine, positions, indices, maxFillLoopMm)` and `diagnoseMesh(engine, positions,
  indices)` — four arguments, engine first — and the document never names that file or says which
  layer the host uses.

##### MA-9. The `watertight` definition given is incomplete, and it contradicts §3's own table
* **Lens:** design · **Line:** 272
* "`watertight` means *every* body closed, so one loop left open keeps it false." The vendored
  definition is `repairMesh.ts:56-57`: "Closed, manifold and consistently wound: what a slicer needs."
  Closure is one of three conditions — which is exactly why §3's own line 286 row ("not watertight, no
  open loops → **Winding or non-manifold**") can exist. The doc says limit 2's operator text is written
  from this sentence.
* **Fix:** quote the three-part vendored definition; keep "one open loop is enough" as a consequence.

##### MA-10. The verdict's schema is never given, in the section that introduces it
* **Lens:** comprehension, design, style · **Line:** 200
* "Only the **verdict** crosses the boundary" and stop. Missing: the type name and home
  (`ImportDiagnosis`, `src/state/diagnosis.ts`); its fields (`triangles`, `watertight`,
  `boundaryLoops`, `nonManifoldEdges`, `windingConsistent` Picked from the vendored `RepairReport`,
  plus own `longestRimMm` and `bodyCount`); that it is all plain numbers and booleans so it
  structured-clones with no transfer list; that it is **saved** as `PrintUnit.diagnosis`
  (`project.ts:71`) and carried by `placeImportedUnits`; and that `normalizeUnit` / `diagnosisField`
  (`project.ts:350-369`) re-validates a saved verdict and **drops** a malformed one rather than
  throwing, including the staleness check `found.triangles !== source.indices.length / 3`. An
  implementer working from §3 builds a transient, unvalidated, unsaved verdict.
* **Fix:** add the shape, the persistence and the staleness rule to §3.

##### MA-11. A saved verdict now outlives the session, and no surface reads it
* **Lens:** design · **Scope:** §0 lines 32–34, §1 line 48, §3
* The verdict is persisted, but the Items page exists only after a **drop**, and §1's *Open a saved
  project* goes nowhere near it. On reopening a project there is no surface that shows a stored
  verdict, and §0's out-of-scope list does not mention it either way.
* **Fix:** §0 either puts "reading a saved verdict on project open" out of scope explicitly, or names
  the surface that shows it.

##### MA-12. §5's eviction is disproportionate, and the doc's own cheaper answer is left untaken
* **Lens:** zoom-out · **Scope:** §5 lines 406–453, esp. 452–453
* §5 spends a new `KeptBuild` type, a generic widening through several call sites, and an admitted
  **visible regression** (an evicted unit stops drawing its support bodies and is packed by its
  bounding box) to reclaim what §9 itself calls the *secondary* term. The dominant term is the N full
  models in `scene.units`, which eviction does not touch. Line 452 already concedes the alternative —
  "the answer is a cap on items, not a pretence that eviction is free" — and §8 step 11 recommends not
  doing it.
* **Fix:** cut eviction from this release. §5 shrinks to scene-driven release (built, and accurately
  described — `forgetUnit` / `BuildSessions.forget`, verified at `App.tsx:458,482`), the measured row
  cap, and the two retained facts at lines 456–461. The `KeptBuild` analysis becomes a future-work
  note.

##### MA-13. §5's "do not discover them" cost list omits two consumers
* **Lens:** zoom-out · **Lines:** 428–429
* `src/components/useExport.ts:26` and `src/components/useFixSpot.ts:27` both declare
  `ReadonlyMap<string, UnitBuild>` and must take the generic. Mechanical — neither reads geometry —
  but §5's own stated rule is that the cost list must be complete. Moot if MA-12 is taken.

##### MA-14. "While the Start scene is up, the row owns the import" is a cross-cutting change the measure does not require
* **Lens:** zoom-out · **Lines:** 303–316
* Suppressing import-context jobs in `JobActivity` and switching the blocking veil off for one scene
  is a change to the app's only progress-narration surface, taken to avoid showing an import twice.
  §0 asks to "show each one's state" — a verdict per row — not per-row *progress*, and the existing
  surface already narrates per-file imports correctly. The analysis is correct
  (`importClient.ts:21,25,30` is `mode: 'per-job'`, `blocking: true`, `context: 'import'`;
  `JobActivity.tsx:79` hangs the veil off `blocking`); it is the conclusion that is expensive.
* **Fix:** weigh the zero-cost option — rows show verdict/state only, progress stays where it lives.
  That also deletes `items-progress-<importId>` and the `ledger --red` token question outright.

##### MA-15. The Drop page accepting GLB/glTF is scope creep against §0
* **Lens:** zoom-out · **Lines:** 491–497
* §0's case is "a case of several *aligners*"; the start screen is `.stl` only
  (`StartScreen.tsx:96`), the aligner path is the Rust STL session, and the glTF path welds elsewhere.
  Three formats doubles the weld/diagnose matrix and the per-row refusal copy for a goal — "so the two
  doors stop disagreeing" — the measure never states. (The underlying claim is correct:
  `DentalSteps.tsx:110` accepts `.stl,.glb,.gltf`.)
* **Fix:** keep `.stl`; move the door disagreement to §9. If the three formats stay, §0's non-goals
  list must say so, because a narrowing/widening of an input surface is a scope statement.

##### MA-16. §2's icon paragraph answers a deleted question, and the art it says is missing exists
* **Lens:** design; with comprehension and zoom-out on the unwritten half · **Lines:** 166–174
* "`CARD_ICON` has **one** entry … the mechanism exists, the art does not" is true of the *type-card*
  map (`src/components/DentalSteps.tsx:46,73`) — but that map belongs to the screen this release
  deletes, and per-row Type is dropped, so the paragraph answers a question the release no longer
  asks. Meanwhile the art for the three Drop-page selections **does** exist:
  `src/ui/icons.test.ts:21` pins `aligner.svg`, `denture.svg`, `generic.svg`, `back.svg`. The question
  the release does ask — which icon each of the three keys draws, and what its `note` says in three
  languages — is unanswered.
* **Fix:** state the icon each key passes to `ChoiceKey`, and supply the three tooltips in en/ja/zh-Hant.
  The `ChoiceKey` finding verifies (`src/ui/ChoiceKey.tsx:22-23`, "The start screen's keys do not have one").

##### MA-17. The level-1 visible label is forbidden but never stated, and the one new glossary term is left unwritten
* **Lens:** comprehension, style, zoom-out · **Lines:** 164–165, 572–575
* Line 165 forbids "Kind" and "Type" as visible labels and never says what the label *is*. Line 572
  then demands a per-language glossary term for *Appliance* from `glossary.test.ts` (the guard exists,
  `src/glossary.test.ts`) and supplies none — while in the same sentence quoting the full ja/zh-Hant
  terms for an earlier case (支撐柱/支撐頭, 支柱/先端) as the model of what is needed. Taiwan wording is
  a hard constraint and this is the single term the feature introduces.
* **Fix:** give the en/ja/zh-Hant glossary entries for *Appliance* and the Drop page's actual heading
  words, so they are reviewable rather than invented. Zoom-out's counter-proposal is worth pricing:
  move the three existing keys with their current translated wording, no notes, no new icons, and keep
  "Appliance" a document word — which avoids the `glossary` / `japaneseSubset` / `npm run fonts` chain
  for a rename the measure does not need.

##### MA-18. The Drop page's order of operations is unstated
* **Lens:** comprehension · **Scope:** line 48, line 122, §7
* The Drop page holds both the drop zone and the three keys, and Appliance is chosen "once per drop".
  Must the operator press a key *before* dropping? May they drop first and be asked after? What
  happens on a drop with no key pressed? What navigates to Items — the drop, or a press? Four
  behavioural branches, all invented by the reader.

##### MA-19. The neutral row tone is simultaneously "the answer" and an open question
* **Lens:** comprehension · **Lines:** 536–538 against §9 line 867
* §7 says "the answer is a documented token for a neutral background row" without naming the token or
  its value; §9 lists it as still open with that same sentence as a *recommendation*; §8 step 6a
  requires it decided and documented. A reader cannot tell which.
* **Fix:** decide it in §7 with a name and a value, or say plainly that step 6a is blocked on §9.

##### MA-20. §6's section-`s` line numbers are wrong by 30–65 lines
* **Lens:** structural, design · **Lines:** 467–468
* `if (runs('s'))` is at `scripts/walk.mjs:2300`, not 2269; `s19` is at `:2486`, not 2421. The
  self-caveat at lines 471–472 mitigates, but §8 line 816 repeats the stale range with no caveat. The
  "21 `check` calls" count **is** correct (s1–s19 = 19, plus `s2b` at 2355 and `u1a` at 2333), and
  `u1a`'s two pinned strings verify verbatim at `walk.mjs:2335`.
* **Fix:** drop the numbers, keep the anchors (`runs('s')` … `s19`) and the check count, in both places.

##### MA-21. `enterEditor` has eight call sites, not seven
* **Lens:** structural · **Line:** 61 (repeated at line 805)
* `scripts/walk.mjs` calls it at 541, 961, 979, 1028, 1070, 1078, 1893, 2184 (definition at 226). The
  "all outside section `s`" half is correct (section `s` opens at 2300). The count is load-bearing
  because step 7b's exit criterion is argued from it.
* **Fix:** "its call sites (currently eight) all sit outside section `s`", so a new one does not
  falsify the sentence.

##### MA-22. §6 and §7 duplicate the same paragraph near-verbatim
* **Lens:** structural, design, style · **Lines:** 473–476 against 553–559
* Both list the four selectors, the "`data-ui` is not sufficient" conclusion and `u1a`'s heading and
  footer, including the same closing clause "both of which move". §3 lines 320–321 and §7 lines
  542–547 likewise state the `items-row-<importId>` rule twice. Two copies drift; these two already
  differ in emphasis.
* **Fix:** normative copy in §7 (where the naming rules live); one-line cross-reference from §6.

##### MA-23. Engine thresholds are cited to a document that does not exist in this repo, and "reach" is never defined
* **Lens:** style, structural · **Lines:** 246, 253, 263, 270
* `vendor/mixo-geocore` contains no `docs/mesh-repair.md`, so "Method and thresholds are in geocore's
  `docs/mesh-repair.md`" is unreachable from here. Neither the 35% cut-off nor the 0.001 mm³ noise
  threshold appears in the vendored header: `repairMesh.ts:120` exposes `noiseVolumeThresholdMm3` as a
  *reported field with no value*, and no `35`/`0.35` appears at all. "the body gap is 0.005 mm, 100×
  that" has an unresolvable referent — the weld tolerance's value is never given, so the arithmetic
  cannot be checked. And "reach", used twice as the denominator of the only ratio an operator-facing
  refusal is written from, is never defined; the engine's own definition is `LoopFill.flatness`,
  "How far the rim bends out of its best-fit plane, over its own reach" (`repairMesh.ts:85`).
* **Fix:** state the rule as "`flatness > 0.35` — the rim's deviation from its best-fit plane over its
  own span — is never filled", define span once, give the weld tolerance's value before the ratio, and
  either read the thresholds off the report at runtime (`steps.noiseVolumeThresholdMm3`,
  `fills[].flatness`) or cite a geocore commit and path a reader can open. The paragraph is headed
  "Numbers, each derived".

##### MA-24. Terminology: three names for three types, and the mapping is never stated
* **Lens:** style · **Lines:** 200, 263, 279, 301, 440, 518
* "verdict", "report" and "diagnosis" are used interchangeably for three distinct things with three
  jobs: `RepairReport` (engine, per body, never crosses the worker boundary), `ImportDiagnosis` (the
  facts that do cross, stored as `PrintUnit.diagnosis`), and `RowState` (what the row says).
* **Fix:** define all three on first use in §3 and use **diagnosis** for the stored verdict, since that
  is the field name.

##### MA-25. Terminology: row / item / unit / file, and three referents for "step"
* **Lens:** style · **Scope:** §1 lines 43–55, and throughout
* §1 defines *scene* and *page* carefully and never defines the four nouns the rest of the document
  runs on (line 52 "One row per file", line 89 "the row's unit", line 106 "N items", line 453 "a cap
  on items", line 461 "a row removed before its unit exists"). "Step" has three unqualified referents:
  an operator-facing flow step ("Step 1", "Step 3"), a §8 plan step ("step 6", "step 5's constant"),
  and a *repair* step inside the engine ("naming the step", `body-invariant:<step>`).
* **Fix:** one line in §1 — "A **file** becomes one **row** on the Items page and one **unit** on the
  plate; an **item** is a unit being walked." Qualify "plan step N" and "repair step" everywhere.

##### MA-26. About a fifth of §0–§7 argues with text the implementer cannot read
* **Lens:** style · **Scope:** lines 26–30, 58–62, 69–70, 99, 108–112, 150–157, 226–227, 256, 269–271, 276–278, 288–289, 304–307, 366–370, 377–384, 412–414, 432–434, 445–448, 456–461, 478, 484–490, 512
* Line 3 already names `docs/reviews/2026-11-07-egm-goldfish-review.md` as the record of findings and dispositions.
  Proposed rule, applied uniformly: **a revision reference survives only where it changes what to
  build; everything else moves to the review report.** By that rule:
  * Lines 26–30: the only live content is one clause — stream each file into a unit before reading the
    next. Keep the clause; move the rest. (See also MI-1: the pointer is wrong.)
  * Lines 150–157 (seven lines on `isDentalKind`): live content is two sentences — widening
    `DentalKind` would not change the on-disk shape, and `normalizeDentureState` calls `requireKind`
    on a saved `policy.profileId`. The closing sentence about "the failure this round was commissioned
    to catch" is commentary on the review process.
  * Lines 484–490: a pure incident report, and the only first-person passage in an otherwise
    impersonal document. Live content is one line (the missing script and CI job — and see MA-4, now
    stale too).
  * Lines 276–278, 288–289, 304–307: superseded. `rowState.ts:72-78` and `src/items/README.md:22-26`
    now record this same history *at the code*, where a test checks it. Delete and cross-reference.
  * Lines 366–370, 377–384, 432–434, 445–448, 456–461: each opens by naming a revision before stating
    the rule, so the reader meets the refutation before the instruction. Invert every one.
  * Lines 499–505: the live content is the last sentence (the stale label survives in five named
    files), which is a task. Promote it; demote the narrative.

---

#### 🟢 Nits

* **MI-1.** Line 30 — "Streaming each file into a unit … **is listed in §7**." It is not; the item is
  §8 step 7b (line 797), and line 8 says "§7 is the UI, §8 the sequence". Repoint. *(lens: comprehension)*
* **MI-2.** Line 3 — "**Revision 5, after three rounds of seven-reviewer review**" is already stale: the
  body cites "Revision 4" claims (152, 377, 445) and "Revisions 3 and 4" (484), and a fourth round is
  in progress. Drop the count or make it a line the round bumps. *(style)*
* **MI-3.** §6 carries no built/decided/unstarted label, contrary to §0 line 8; §0 has none either.
  Given MA-4, §6 is precisely the section whose status a reader needs. *(structural)*
* **MI-4.** No `---` between §7 and §8 (line 586/588); every other boundary has one (10, 35, 114, 175,
  323, 392, 463, 514, 859). Heading levels are otherwise clean — one H1, H2 per section, H3
  subsections, no skipped level in 1–587. *(structural)*
* **MI-5.** Line 520 — "**four** guards" vs the five §8 step 6a lists (adds `i18n.test.ts`); the code
  brings two more into the same argument (`importOracleBoundary`, `noDuplicatePackages`, both cited in
  `src/items/README.md`). And "each has caught something in this session" is unfalsifiable from the
  document. Name the guards and what each fails on; drop the anecdote. *(structural, style)*
* **MI-6.** Lines 59–62 — "The string is asserted in `sceneMap.ts`'s `bench.doors`". `bench.doors`
  holds a prose sentence (`sceneMap.ts:95-96`), not the UI string; the string lives in
  `src/locales/ja.ts:698` and `zh-Hant.ts:702`. Change "asserted in" to "described in". *(style)*
* **MI-7.** Line 61 — "whose **seven call sites**" is not checkable from the document; cite the file the
  count comes from (and see MA-21: it is eight). *(style)*
* **MI-8.** Lines 72–74 — "about **fifteen** sites, not the three revision 2 named", followed by ten
  items plus "six test files". The hedge "about" sits in the sentence whose whole point is a count, and
  the list does not reconcile. Give the exact count or lead with "the sites are:". *(style)*
* **MI-9.** Lines 131–133 — "N kinds, N profiles, a serialisation into the project file, and a
  per-Appliance loop rule — **three** design decisions". Four items, three decisions. *(style)*
* **MI-10.** Lines 122–123 against 145 — the table says Appliance is "app-side; `DentalKind` where one
  applies", then "`DentalKind` is vendored". Say where it lives once. *(style)*
* **MI-11.** Line 239 — "treats them **oppositely**" is imprecise: one is *reduced* (topological
  components, by welding), the other *preserved* as an invariant (physical bodies). Say that. *(style)*
* **MI-12.** Lines 306, 310–311, 537 — "the module" has no antecedent; `src/progress` /
  `ProgressIndicator` is first named 240 lines later at 545. Name it at first mention. Likewise lines
  316 and 461, "the step's exit criteria" / "that step's exit criteria" — neither "step" has an
  antecedent; name the §8 step number. Lines 459–461's pre-unit reservation case is claimed by both
  §8 7a and 7b; give it one owner. *(style, zoom-out)*
* **MI-13.** Lines 549–551 and 570 — session narrative ("a false gap that cost a round of investigation
  in this very session") and a tool name standing in for a process ("Taiwan wording via Gemini, checked
  against the real locale entries"). Name `src/locales/zh-Hant.ts` and who signs off. *(style)*
* **MI-14.** Lines 504–505 — "The stale label still appears in **five** files" is correct for documents,
  but `scripts/walk.mjs:2338` still carries it in `s2`'s check *description*, so it is six places.
  Harmless (not an assertion) and worth one clause so the next grep does not look like a regression.
  *(structural)*
* **MI-15.** Lines 106–112 — `scope` is diagnosed as rot and left undecided, while §8 step 10 deleted
  the `PAGES` table on the identical argument. Be consistent: retire `SceneScope` in step 3. Related:
  §1's page table has no `data-ui`/class column though §7 makes stable names a hard rule for exactly
  these two new pages; and §3 never states that diagnose now runs on **every** import app-wide
  (`importWorker.ts:65` loops all prepared meshes on both paths, so bench drops, dentures and
  multi-mesh glTF files pay the pass and store a verdict no row shows) — state as accepted or gate it
  to Start-scene imports. Finally, line 423's `// src/supports/keptBuild.ts` collides with an existing
  `keptBuild` function imported into `App.tsx:105` from
  `src/denture/steps/supports/rigidMove.ts`; rename the module or the type. *(zoom-out, structural, design)*

---

### Named guesses, collected

A competent implementer who has not seen this codebase must invent each of these:

1. Who sends `startDental`, when, and with which profile for item 1 (BL-11).
2. The mechanism by which a row makes its unit active, given `useSelectedAligner` takes no argument (BL-11).
3. Whether *Next item* still dispatches `addAnotherDental`, and what it says/does when no unstarted row remains (BL-11, BL-6).
4. Whether Denture and *Any model* drops show the Items page at all; whether Repair is offered on non-aligner kinds.
5. Whether a row can be started while another is still importing.
6. Both pages' layouts, the row's anatomy, the empty state, the finished-row state, the current-item marker (BL-7).
7. What "preview" is, from which copy, at what size, with what lifetime (BL-8).
8. Every `data-ui` name but two, and every CSS class name (BL-9).
9. The row-height token's identifier and value, and which token supplies the text size (BL-10).
10. The neutral-row-tone token's name and value (MA-19).
11. All operator copy: nine states × three languages, three capacity sentences, the refusal sentence's step slot, the per-loop line, three key tooltips, the moved heading and footer, *Next item*, the row-cap refusal (BL-6).
12. The visible label for level 1, and *Appliance*'s glossary entries in three languages (MA-17).
13. The Drop page's order of operations (MA-18).
14. The row cap's number (§9 defers to step 5; step 5 suggests 8; §5 and §7 never mention a cap).
15. Whether Back at Orient re-renders the row from the saved verdict or re-diagnoses — now that the verdict is persisted.
16. The reservation grain for a row removed before its unit exists.

### Cross-scope note for the §8/§9 synthesizer

`src/state/diagnosis.ts:37-46` declares **seven** fields and `Pick`s **five** from `RepairReport`
(`triangles, watertight, boundaryLoops, nonManifoldEdges, windingConsistent`, plus own `longestRimMm,
bodyCount`). §8 line 712 ("five facts and a body count") and line 717 ("Four of its six fields are
`Pick`ed") are both off by one — and so are `src/state/diagnosis.ts:16` ("six facts"),
`src/items/README.md:57,69` and `src/workers/diagnoseImported.test.ts:7`. The prose was not updated
when `triangles` was added; `diagnosisField` handles all seven, so only the counts are wrong. The
"eight row states" undercount also recurs at §8 lines 736 and 762, and the stale section-`s` line
range at §8 line 816.

### Verified correct — do not re-litigate

`TRIANGLE_BUDGET × 4 = 6,000,000` (`budget.ts:17,20,41`); the per-file loop with
`const imported: PreparedMesh[][]` and the three capacity asserts (`App.tsx:704,727-746,779-783`);
`held` and `files.find(isStl)` (`StartScreen.tsx:38,64`); `added[0]!` (`App.tsx:779,783`);
`StartScreenId = 'task' | 'type' | 'file'`; `sceneMap.ts:82 scope: 'run'` and the stale
`scope: 'object'` claim being in exactly the two named places (`src/scenes/README.md:78`,
`sceneMap.ts:33-37`); the `dentalFinished: []` reset trap (`editingMode.ts:215,219,387`) and
"Drop an aligner STL…" (`:400`); `DentalKind = 'aligner' | 'denture'` and `isDentalKind`'s only call
site being CLI parsing in `typelab/profileSelect.ts:64`; walk `s2` asserting one card;
the weld-path correction (glTF via `prepareImport.ts:15`'s `weld_positions_in_place`, STL inside the
Rust session, `'Welding vertices'` posted by `importWorker.ts:21,49`); diagnose-in-the-worker with only
the verdict crossing (`importWorker.ts:65`, `prepareImport.ts:63-66,78`); the nine `FillReason` codes
including `''` (`repairMesh.ts:63-73`) and the required third argument with no engine default
(`:164,318-324`); the body-invariant/unchanged-mesh contract (`repairMesh.ts:14-16`);
`importClient.ts:21,25,30` (`mode: 'per-job'`, `blocking: true`, `context: 'import'`) and the veil
hanging off `blocking` (`JobActivity.tsx:79`); `ledger`'s shape and `--red` tone
(`progressTypes.ts:84`); `Progress` carrying `data-ui={progress-${type}}` per type
(`Progress.tsx:61`) and the first-of-many false gap (`src/progress/README.md:109`); `PROGRESS_TYPES`
driving the catalogue; `--row` existing only in `typelab/tokens.css:44` and tabled
under "the tokens the app does not have" (`docs/ui-styling.md:466,478`); `--radius: 2px`
(`src/styles.css:31`); `CARD_ICON` one entry with a `generic` fallback (`DentalSteps.tsx:46,73`);
`ALIGNER_PROFILES` carrying `description[lang]`; the five guard tests named in §7 all existing;
§4 in full (`exportedDental`, `dentalFinished` preserved by `addAnotherDental`, export client
`mode: 'per-job'`, `DentureClient` with no mode and `concurrency: 'serial'`); §5's eviction cost list
(`App.tsx:340-342, 1090, 458, 482`) and the vendored `BuiltSupports` / `UnitBuild<T>` seam;
`walk.mjs:2717 process.exit(failed === 0 ? 0 : 1)`; the 21 `check` calls in section `s`; `u1a`'s two
pinned strings (`walk.mjs:2335`).

### Project-rule compliance

* **No third-party product names:** clean. Line 364's "Output goes to a slicer and the slicer arranges
  the plate" is correctly neutral.
* **Patient data:** clean. No scan filename appears; the corpus is referred to only by counts, and
  `measure-rim-loops.mjs:12-14,45` confirms the hash-only contract. The only defect is that one count
  is wrong (13 vs 18 — BL-5).
* **Three languages:** the rule is stated at lines 561–576; compliance is BL-6.
* **Unique stable `data-ui`:** the rule is well stated and justified (lines 320, 540–551); coverage is BL-9.
* **Prose ranged left:** clean, no centred runs.
* **Lowest peak memory:** stated as first-class, but §0's measure is in the wrong units (MA-2) and the
  one new transient copy is unaccounted (MA-3).

### Suggested order for revision 6

1. Re-derive every status banner and every number in §3 against the tree (BL-1, BL-2, BL-5, BL-4,
   BL-3, MA-6, MA-4, MA-5, MA-20, MA-21).
2. Replace §3's two tables with three keyed on `ROW_STATES`, nine rows, each naming its payload (MA-1).
3. Write §7 as a specification rather than a list of rules it must obey: the string table, the
   `data-ui`/class table, the row anatomy, the token name and value, the preview (BL-6 through BL-10).
4. Close the §1 entry seam with named events and a `unitId` argument (BL-11).
5. Decide eviction in or out (MA-12), and re-state §0's measure in bytes (MA-2, MA-3).
6. Define verdict/diagnosis/report and row/item/unit on first use; qualify "step" (MA-24, MA-25).
7. Apply the one-rule purge of revision commentary (MA-26).

---

<a id="2026-11-07-egm-round4-implementation"></a>

## 2026-11-07 — Goldfish Review Report — Round 4

*Was `docs/reviews/2026-11-07-egm-round4-implementation.md`.*

**Target:** `S:/ai/mixodental/docs/design/2026-11-07-import-and-items-flow.md`
**Scope:** `## 8. Sequence` (line 588) through line 891, including `## 9. Still open` (line 861). Sections 0–7 (lines 1–587) were reviewed concurrently by a separate synthesizer and are out of scope here.

**Swarm:** `egm-implementation-readiness` ×2 (A, B), `egm-codebase-details` ×2 (A, B), `egm-style` ×1. All four technical instances read the full reading list and verified citations against the tree.

**Verdict: the bar "watertight enough to implement" is NOT met.** Of the seven unstarted steps, **zero** can be started from the text alone. 7d is closest (its scope is nameable) but its line range is wrong for the fourth time and its replacement assertions do not exist. Step 9 is the weakest step in the document.

**Counts after deduplication: 24 🔴 Blockers, 23 🟡 Majors, 12 🟢 Nits.**

---

### Blockers

#### B1 — Section `s` line range is wrong for the FOURTH time — Severity: 🔴
* **Lens:** `codebase-details` A+B, `implementation-readiness` A+B (unanimous)
* **Scope:** line 816
* **Quote:** "section `s` (2268–2424, 21 checks including `s2b` and `u1a`)"
* **Ground truth:** `scripts/walk.mjs:2299` is the section comment, `:2300` is `if (runs('s')) {`, and the block closes at `:2489` (`s19` at 2486, trailing `Exit` click at 2488). Line 2268 is inside section `l` (`l3` at :2264); 2424 is mid-section (`await d.idle(500)` before `s14`).
* **Effect:** the published range starts 32 lines early and **cuts off `s14`–`s19`** — the six checks that exercise held files, the type screen and Back, i.e. exactly what 7c changes.
* **Fix:** `2299–2489`. Better: stop citing absolute lines, which have now been wrong in three consecutive rounds — cite "the whole `if (runs('s'))` block, 21 checks: `s1`–`s19` plus `s2b` and `u1a`". The **check count 21 is VERIFIED correct** (enumerated: s1 2331, u1a 2333, s2 2338, s2b 2355, s3 2361, s4 2366, s5 2368, s6 2379, s7 2386, s8 2391, s9 2398, s10 2401, s11 2406, s12 2413, s13 2418, s14 2425, s15 2428, s16 2431, s17 2472, s18 2479, s19 2486).

#### B2 — The *Add another aligner* check IDs are wrong (two of three) — Severity: 🔴
* **Lens:** all four technical instances
* **Scope:** line 816–817
* **Quote:** "the *Add another aligner* → *Next item* checks (`u2`, `u11`, `x14`)."
* **Ground truth:** the only checks asserting that control are in section `x`: `x1b` (`walk.mjs:1935`), `x1` (`:1940`), `x14` (`:2114`); helper option `another: 'Add another aligner'` at `:1924`. `u2` (`:1092`) is "one click on the card goes to Step 1, which asks for the aligner file"; `u11` (`:1856`) is "Back from Step 2 returns to Step 1 with the oriented aligner kept". Neither mentions the control.
* **Effect:** the rename would miss `x1`/`x1b`, which assert the literal string, and would churn two unrelated checks. `u2` is also double-booked between 7c and 7d.
* **Fix:** `x1`, `x1b`, `x14`. Add `src/locales/{ja,zh-Hant}.ts` and `src/denture/kindText.ts:20`, which carry the string. Note `WAY_ON`/`reviewWayOn` is interpolated into two of those labels.

#### B3 — `MAX_FILL_LOOP_MM` does not exist; step 5 is marked DONE with an unmet exit, and step 9 depends on it — Severity: 🔴
* **Lens:** all four technical instances
* **Scope:** lines 666, 689–690
* **Quote:** "**So `MAX_FILL_LOOP_MM = 0.0`**" / "*Exit:* the constant exists, its comment states the distribution, and the measurement script is committed."
* **Ground truth:** a repo-wide search finds `MAX_FILL_LOOP_MM` only as two `console.log` strings in `scripts/measure-rim-loops.mjs:129` and `:137`, and in this doc. **There is no named host-side constant in `src/` or `vendor/`.** Nothing in `src/` calls `repairMesh` at all. The engine parameter is `maxFillLoopMm`, required with no default (`vendor/mixo-geocore/host/core/repairMesh.ts:113, 164, 318–323`). The measurement script *is* committed, so two of three exit clauses hold.
* **Effect:** step 9 has no constant to pass to `repair_mesh`, and the doc says step 5 shipped one.
* **Fix:** either declare the constant with its derivation comment now, or move that clause into step 9 (the first step with a caller) and change step 5's status to "DONE except the constant".

#### B4 — "eight row states" / "eight row sentences" against the nine that shipped — Severity: 🔴
* **Lens:** all four technical instances
* **Scope:** lines 736–737, 762–763
* **Quote:** "the three-language text for **all eight row sentences**" / "add all eight row **states** to `kit.html` as static markup"
* **Ground truth:** `src/items/rowState.ts:65-66` — `ROW_STATES = ['unreadable','too-big','clean','holes','malformed','refused','unchanged','repaired','repaired-open']` = **nine**; `RowState` has nine members (`:53-62`); `src/items/README.md:9` is headed "The nine states, and why there are nine"; and **the doc's own line 694 says "nine row states as three tested partitions"**.
* **Effect:** the implementer must guess which state gets no `kit.html` markup and no three-language sentence (probably `too-big`, folded into §3's table). 6a's exit ("every state visible in `kit.html`") is satisfiable with eight of nine.
* **Fix:** nine in both places, and have the catalogue **iterate the exported `ROW_STATES` array** rather than hand-list — the same pattern `src/kit/Catalogue.tsx` already uses for `PROGRESS_TYPES`. That makes this class of bug impossible.

#### B5 — Step 9 names no file, no worker side, no protocol message and no scene command — Severity: 🔴
* **Lens:** `implementation-readiness` A+B, `codebase-details` B
* **Scope:** lines 828–837 (against line 590, "Each step names its files, its exit criterion and its tests")
* **Quote:** "**9. Repair on a press** — the *Repair* action on a row, the repaired mesh replacing the unit as **one** undo step"
* **Ground truth:** `src/workers/importProtocol.ts:6-10` — `ImportTask` is `{kind:'stl'} | {kind:'weld'}` only, served as `serveTask<ImportTask, PreparedMesh[]>` (`importWorker.ts:30`). A repair needs a **third task kind**, a response carrying `positions`/`indices`/`RepairResult`/a fresh `ImportDiagnosis`, and a widened transfer list (`buffers()` in `prepareImport.ts`). Separately, `src/state/project.ts:92-126` has `unit/add`, `unit/remove`, `supports/*`, `transform/set` — **and no command that replaces a unit's `source`**. The host entry point `repairMesh(engine, positions, indices, maxFillLoopMm)` (`repairMesh.ts:318`) is never named in the step.
* **Guesses forced:** worker or main thread; the task-kind name and payload; the new `SceneCommand` name and reducer behaviour (`source/set`? remove+add, which changes the unit id and drops selection, supports, policy and zones); whether the mesh arrives `owned: true` as on the import path (`App.tsx:778`); how the single undo batch is formed.
* **Fix:** name the file (e.g. `src/workers/repairImported.ts`), the protocol variant, the command and its reducer, and the undo owner. Reuse the existing `dispatch({ type: 'batch', commands: [...] })` form (`App.tsx:774`).

#### B6 — Step 9 never replaces `PrintUnit.diagnosis`, so every repaired unit silently loses its verdict on reload; and "records that it was repaired" names no field — Severity: 🔴
* **Lens:** `codebase-details` A+B, `implementation-readiness` A+B
* **Scope:** lines 834–835
* **Quote:** "The project file stores the repaired mesh and records that it was repaired."
* **Ground truth:** `src/state/project.ts:360` — `diagnosisField` does `if (found.triangles !== source.indices.length / 3) return {};`, i.e. it **drops** the saved verdict. Step 6 (doc line 750–754) says `triangles` exists *because* step 9 is the change that makes a verdict stale — but step 9 only observes it and never requires a replacement. And `PrintUnit` (`project.ts:63-71`) has **no "was repaired" field**; `ImportDiagnosis` has none either; `RepairResult.changed` (`repairMesh.ts:129`) is persisted nowhere.
* **Second-order:** `verdictOfRepair` takes a `RepairResult`, which is **not persistable**, so after a reload nothing can produce `repaired` / `repaired-open` / `unchanged` / `refused` — **four of the nine row states are unreachable for a reopened project**. The doc does not say whether the row falls back to `verdictOfDiagnosis`.
* **Also:** at fill limit 0 a repair that leaves the triangle count unchanged leaves a **stale verdict that passes the gate** — the one case `triangles` cannot catch.
* **Fix:** step 9 must (a) re-run `diagnoseImported` (`prepareImport.ts:78` — the only producer of a valid seven-key `ImportDiagnosis`) on the repaired full-resolution mesh and replace `diagnosis` **in the same batch as the mesh swap**, (b) name the new persisted "repaired" field, its type, its `normalizeUnit` gate branch and its migration, and (c) say which function the row uses after a reload.

#### B7 — Step 9's capacity re-check is justified by a mechanism that cannot fire, and has no refusal path — Severity: 🔴
* **Lens:** `codebase-details` A+B, `implementation-readiness` A+B
* **Scope:** line 831
* **Quote:** "and a **capacity re-check**, because filling adds triangles and `assertPlateCapacity` is consulted only on the import path."
* **Ground truth:** with `maxFillLoopMm = 0` every loop reports `fill-disabled` (`repairMesh.ts:73, :188`), so `RepairSteps.loopsFilled` and `patchTrianglesAdded` (`:115, :117`) are 0 — **filling adds nothing**. The remaining movers are `degenerateTrianglesRemoved` (`:102`, reduces) and the non-manifold split's `verticesAdded` (`:105`, duplicates vertices, adds no faces). Repair cannot grow the triangle count this release. (`assertPlateCapacity` being import-only is **VERIFIED**: `vendor/.../core/budget.ts:128`, called only at `src/App.tsx:729` and `:746`, both through `reservation.hold`.)
* **Missing besides:** which guard (`assertTriangleCapacity` / `assertMemoryCapacity` / `assertPlateCapacity` — the last needs a `PlateScene` and a `PLATE.open()` reservation a repair has no analogue of); whether the repair path re-enters `PlateLedger`; and **what happens when the check refuses after the repair has already run** (discard? keep and warn? remove the unit?). The exit at 836 ("a refused repair leaves the unit untouched") does not disambiguate an engine refusal (`ok: false`) from a capacity refusal.
* **Fix:** re-justify on `verticesAdded` / vertex-count memory or as explicitly defensive against a future non-zero limit; name the guard, the call site and the post-hoc refusal behaviour.

#### B8 — Step 11's `UnitBuild<KeptBuild>` is the right *type* but breaks five unnamed consumers — Severity: 🔴
* **Lens:** all four technical instances
* **Scope:** lines 846–848
* **Quote:** "widen `App.tsx`'s `built` map to `UnitBuild<KeptBuild>` (§5 — **not** `UnitBuild<BuiltSupports>`, which has no `footprint`)"
* **Adjudication (requested):** the doc's correction is **CORRECT and the earlier reviewer's `UnitBuild<BuiltSupports>` claim is confirmed FALSE.** `vendor/mixo-geocore/host/supports/unitSupports.ts:56` — `BuiltSupports = Pick<GeneratedSupportMesh,'dropped'|'droppedByZones'>`, no `footprint`; `footprint` is on `GeneratedSupportMesh` (`host/core/supports/mesh.ts:168`); `src/plate/plateLayout.ts:24` reads `entry?.mesh.footprint`. `UnitBuild<T extends BuiltSupports = GeneratedSupportMesh>` (`:59-62`) accepts `KeptBuild` as §5 line 425 defines it. `currentBuild` / `currentBuilds` / `unitContacts` are generic and survive (`:68, :73, :88`), and `planExport(scene, kind, built: ReadonlyMap<string, BuiltSupports>)` (`host/supports/export.ts:48`) is already generic enough.
* **BUT it does not type-check.** Five non-generic sites break and **none is named in step 11**:
  - `src/plate/plateLayout.ts:12` — declares its own `type Builds = ReadonlyMap<string, { unit: PrintUnit; mesh: GeneratedSupportMesh }>`; it does **not** use `UnitBuild`, so the generic bound buys nothing and `plateFootprints` (`:20`) stops compiling regardless of `footprint`.
  - `src/components/usePlateArrange.ts:16` — same restated shape, calls `plateFootprints` at `:40` and `:53`; fed from `App.tsx:337`.
  - `src/components/useFixSpot.ts:27` — `built: ReadonlyMap<string, UnitBuild>` (default generic = full mesh).
  - `src/components/useExport.ts:26` — `builtRef: MutableRefObject<ReadonlyMap<string, UnitBuild>>`.
  - `src/components/viewport/types.ts:23` — `supportMeshes: ReadonlyMap<string, GeneratedSupportMesh>`, fed from `App.tsx:326`. **A live unit still has to be drawn**, so the map cannot be uniformly `UnitBuild<KeptBuild>`; it needs a union plus a discriminator.
* **Also:** `KeptBuild` (§5 line 424–425) omits `modelLanded`, which the viewport reads (`ObjectViewport.tsx:169`) and §5 line 437 flags but does not carry in. `src/plate/plateLayout.test.ts:25-30` builds a full-mesh fixture.
* **Fix:** give the real value type and discriminator, list all five files (converting them to the generic `UnitBuild<T>` form rather than restating `{ unit; mesh }` a fifth time), decide `modelLanded`, and name a projection (`keepOnly(mesh: GeneratedSupportMesh): KeptBuild`).

#### B9 — The row cap is a prerequisite of step 11 and is owned by no step — Severity: 🔴
* **Lens:** `implementation-readiness` A+B, `style`
* **Scope:** lines 853–857, with 680–681 and 863–866
* **Quote:** "**But do the cap first, and consider not doing this at all.**" / §9: "**Recommendation: take the per-model figure from step 5's measurement and set a row cap from it** … rather than guessing a number now."
* **Ground truth:** the number already exists — line 681, "A cap of 8 is ~100 MB held, which is the number §9's recommendation now has instead of a guess" — so §9's "rather than guessing a number now" is **stale**. But no step in §8 implements it: no constant name, no file, no three-language refusal string, no test, no exit. 7b's drop loop is where a 9th file must be refused, and the refusal is a **fourth** capacity sentence the `too-big` state must map — `CapacityLimit` is `'triangles' | 'memory' | 'plate'` (`rowState.ts:40`), and a row cap is none of those.
* **Fix:** make the cap its own numbered step before 11 (constant + home, three-language refusal, a new `CapacityLimit` member, and a check that the 9th file is refused by name), and delete the stale §9 bullet.

#### B10 — 7a-remaining has no exit criterion; the one it inherits already passes and asserts the opposite flow — Severity: 🔴
* **Lens:** `implementation-readiness` A+B
* **Scope:** lines 781–783 with 792
* **Quote:** "*Exit:* a drop of three files where one is corrupt imports the other two, and the tree is green with the three-screen flow still working."
* **Ground truth:** that is exactly walk `m1` (`scripts/walk.mjs:1035`), which landed with the loop half at `4718e21`. The criterion is green **today, with no Drop page at all**, and it asserts the **three**-screen flow when the step adds a fourth screen.
* **Missing:** no walk check, no test file, no `data-ui` list, no new strings for the half that is left.
* **Fix:** give 7a-remaining its own exit — the Drop page's class name(s), the new checks replacing `s1`/`u1a` (which select `.start-task` and pin "What would you like to support?" / "Choose what to make supports for.", `walk.mjs:2302, 2333-2335`), the three-language strings present in both locale files, `StartScreenId` containing `drop`, and a multi-file drop plus a non-model refusal through the existing `onUnsupported` path.

#### B11 — Line 791 delegates a design decision, and line 802 contradicts line 790 — Severity: 🔴
* **Lens:** `implementation-readiness` A+B
* **Scope:** lines 790–791, 802–803
* **Quote:** "`release()` drops the whole drop's hold, so an abandoned row needs either a per-file `PLATE.open()` or a per-row handle — a `plateLedger.ts` API change with its own tests. **Decide which; do not leave it.**" against "**Removing a row before its unit exists must call `reservation.release()`** … no other step owns this."
* **Ground truth:** one `reservation = PLATE.open()` per drop (`src/App.tsx:701`), `release()` at `:758`/`:805`, `commit(added…)` at `:781`. As written, **removing one row releases every other row's hold.**
* **Fix:** pick the grain and give the signature. Note that the per-file grain needs **no API change at all** — a second `PLATE.open()` per file, with `settle(sceneIds)` (`src/core/plateLedger.ts:45-47`) already ending a committed hold when the units appear, which is the reconcile 7b worries about. Name the test file.

#### B12 — 7a-remaining and 7b own the same three edits, and the union literal after each step is never stated — Severity: 🔴
* **Lens:** all four technical instances
* **Scope:** lines 781–783 against 795–797
* **Quote:** 7a: "`StartScreenId` gaining `drop`, the task keys moving onto it, `StartScreen` taking `File[]`" / 7b: "`StartScreenId` becomes `drop | items`; the task screen's three keys and *Open a saved project* move to Drop; `StartScreen` takes `File[]`"
* **Ground truth:** one declaration — `src/components/StartScreen.tsx:14`, `export type StartScreenId = 'task' | 'type' | 'file'` — and one move. Whichever step runs second has an unsatisfiable diff. 7c then deletes `'type'`, and the doc never states the member set after 7a, after 7b or after 7c, nor what becomes of the `'file'` screen that `s3`–`s19` and `onScreen('file')` drive. Both steps also claim the drop-loop restructure (788–790 against 798).
* **Fix:** one owner per edit, and the exact union literal at the end of each of 7a/7b/7c.

#### B13 — 7b's exit is unreachable in the doc's own order, and 7b and 7d both claim the walk rewrite — Severity: 🔴
* **Lens:** all four technical instances + `style`
* **Scope:** line 800 and 804 against 809–811 and 816
* **Quote:** 7b line 800: "Section `s` **and** the section `u` type-screen checks rewritten"; line 804: "*Exit:* `ALL PASS` on the whole walk"; line 816: "**7d. The walk rewrite** — section `s` …, the section `u` type-screen checks"
* **Ground truth:** 7b changes `StartScreenId` to `drop | items`, which breaks `s1`…`s19` (they wait on `.start-task` and `.start-screen .choice-keys`, `walk.mjs:2302`). So `ALL PASS` cannot hold at the end of 7b unless 7b **is** the rewrite, in which case 7d is empty. 7c (809–811) separately insists it must land **before** the walk rewrite. And line 607 forbids any `ALL PASS` at all while `g` has no cause.
* **Fix:** assign the section-`s`/`u` rewrite to exactly one step; give 7b an exit it can reach (`--only=s,u` green with the rewritten checks, or "no failure other than `g`" scoped to named checks); state the order once as 7a, 7b, 7c, 7d.

#### B14 — "streams each file into a unit instead of accumulating" is a one-clause rewrite with five unstated consequences — Severity: 🔴
* **Lens:** `implementation-readiness` B
* **Scope:** line 798
* **Quote:** "the drop loop streams each file into a unit instead of accumulating (§0)"
* **Ground truth:** today the loop accumulates `imported: PreparedMesh[][]` and places everything in one batch with a single `selection/set` (`App.tsx:704, 765–781`). Streaming changes: (1) where `placeImportedUnits` is called — per file, so `existing` grows per file and `ARRANGE_GAP` placement changes; (2) the `adding` / `reservation.hold` accounting (`:746`); (3) the undo grain (one undo per drop becomes one per file?); (4) the final `selection/set`; (5) the "refusal wins the status line" rule (`:797-800`) and the `heaviest`/`plate` status. Every one is a guess.
* **Note:** this is the step that buys the peak-memory win, and its exit says nothing about memory.
* **Fix:** name the new loop shape and each of those five consequences explicitly.

#### B15 — The `JobActivity` suppression mechanism does not exist and is unspecified — Severity: 🔴
* **Lens:** `implementation-readiness` A+B, `codebase-details` A
* **Scope:** line 799
* **Quote:** "with `JobActivity` suppressing import jobs and the veil off"
* **Ground truth:** `src/components/JobActivity.tsx:55` is `JobActivityPanel({ activity = jobActivity, stagedBar })` — **no filter prop and no scene input**. Rows come from the vendored singleton (`vendor/mixo-geocore/host/workers/jobActivity.ts:123`, whose `begin({label, cancel, blocking, context})` is the only place a job could be tagged), and the veil is derived from `rows.some(row => row.blocking)` (`JobActivity.tsx:65, :79`). "Suppressing import jobs" could mean a new host-side filter prop, or using `context`, or flipping `blocking` at the import call site — three changes with different blast radii, one of which touches vendored code and therefore `vendor:check`.
* **Fix:** name the mechanism, the file and the prop/field — e.g. "pass `scene`; when `'start'`, drop rows with `context === 'import'` from the list **and** from the `blocking` reduction". Note the bare symbol `JobActivity` is also ambiguous: the vendored class is `@mixo-geocore/host/workers/jobActivity` (`src/workers/projectClient.ts:4`), the panel is imported as `JobActivityPanel` (`App.tsx:12`).

#### B16 — Removing the type screen breaks four sites 7c never names, including `walk:locales` — Severity: 🔴
* **Lens:** `codebase-details` B
* **Scope:** line 810, 812
* **Quote:** "section `u` checks (`u0`, `u1`, `u2`) exercise the in-flow type card"
* **Ground truth:** `u0`/`u1`/`u2` (`walk.mjs:1082/1087/1092`) are correctly identified, but the literal `'Step 0 · Aligner type'` is awaited at **four** places, three of them outside those checks:
  - `:1072`, inside helper `backToTypeScreen()` (`:1068-1074`), called at `:1361` and `:1442` — so the `u5b*` and `u7`/`u8` recovery scenarios die too.
  - `:1895`, in **section `x`** (`if (runs('x'))` at `:1864`).
  - `:2624`, in **`walkLocale`** — i.e. `npm run walk:locales`.
* **Effect:** 7c's exit (line 814, "`npm test` green, and a walk check that Back at Orient keeps `dentalFinished`") requires neither `npm run walk` nor `npm run walk:locales`, **both of which this step breaks**.
* **Also:** line 812's "Delete `dentalStage: 'type'` and its sites (§1)" is not a list — §1 (70–74) says "about fifteen sites", names ~twelve, and ends "and six test files" unnamed.
* **Fix:** enumerate the sites and test files by path, name `backToTypeScreen` and its two call sites, section `x`'s `:1893-1895` entry and `walkLocale`'s `:2624`, and put the walk and walk:locales in 7c's exit.

#### B17 — "Start screen up with a live dental session" is a new state with undefined consequences — Severity: 🔴
* **Lens:** `implementation-readiness` A
* **Scope:** lines 811–813
* **Quote:** "make **Back at Orient return to the Items page without ending the session**"
* **Ground truth:** `sceneOf` permits it ("A start screen wins", `src/scenes/sceneMap.ts:141-145`), but with `mode === 'dental' && dentalStage === 'aligner'` still set, `acceptsDentalDrop()` is **true** (`editingMode.ts:353-355`), so `importFiles` takes the `dentalDrop` branch and does `files.slice(0, dentalDrop ? 1 : undefined)` (`App.tsx:692`) — **a drop of five files on the Items page silently imports one** and routes it into the flow. It also leaves `dentalAligner: 'prompt'`, whose dock asks for a file.
* **Fix:** state which session fields Back writes, what `importFiles` does while a Start screen is up with a live session, and whether `acceptsDentalDrop` gains a "no start screen" clause.

#### B18 — 6a hands two design decisions to the implementer, one phrased as "decide" — Severity: 🔴
* **Lens:** `implementation-readiness` A+B
* **Scope:** lines 759–761, with §9 867–868
* **Quote:** "Declare the app row-height token in `src/styles.css` … **decide and document** the neutral row tone so `ledger`'s `--red` does not reach a routine row"
* **Ground truth:** neither token is named and neither value given (22px is prose at line 563). §9 (867–868) only offers "**Recommendation:** a documented token" — a recommendation is not a decision. `noColourLiterals.test.ts` fails on a literal, so the implementer cannot even prototype. Verified: no `--row` token is declared in `src/styles.css`, `src/styles/theme.css` or `src/styles/layout.css`, **while `docs/ui-styling.md:478` already carries `| --row | 22px | Control and list row height |`** — the doc half is done and the code half is not.
* **Fix:** name both tokens and values (e.g. `--row: 22px`, plus a `--row-quiet`-style tone token), the `docs/ui-styling.md` table row each belongs in, and whether `ledger`'s `--red` is re-pointed or the row opts out. Strike the §9 bullet once decided.

#### B19 — 7b never says how the session enters dental mode for the FIRST item, and the rule it gives is unusable there — Severity: 🔴
* **Lens:** `implementation-readiness` A
* **Scope:** line 795
* **Quote:** §1 line 92, binding on 7b: "**The trap: never enter an item through `startDental`.**"
* **Ground truth:** `startDentalAligner` / `useSelectedAligner` only work when `acceptsDentalDrop()` is true — `mode === 'dental' && dentalStage === 'aligner'` (`editingMode.ts:353-355`) — and the only events reaching that from `off` are `startDental` and `enterDental`+`chooseDentalProfile`. **So for item 1 the plan forbids the only door and names no replacement.**
* **Fix:** state it — e.g. "the Appliance key on Drop sends `startDental(profile)` once per drop (`dentalFinished` is empty there anyway); every subsequent item goes through `startDentalAligner`, never `startDental`."

#### B20 — The Drop page's own copy and `accept` list are undecided — Severity: 🔴
* **Lens:** `implementation-readiness` A
* **Scope:** line 781, with §9 line 872
* **Quote:** §9: "***Appliance* or *Purpose*** for level 1. **Recommendation:** Appliance"
* **Ground truth:** level 1 lives on the Drop page (§2 line 121), so 7a cannot write its copy while the word is a recommendation. Unstated: the chosen label, the key labels, the tooltip words §2 line 169 calls "**words to write**, in three languages", the heading, the footer sentence, and the `accept` list — §6's three-format answer (494–497) is also only a "**Recommendation**", while today's input is `accept=".stl"` (`src/components/StartScreen.tsx:96`).
* **Note:** *Appliance* is already **used** by 6a (line 761, "glossary terms for *Appliance*"), so the open question is answered by use but not by decision.
* **Fix:** write the decided strings (en / ja / zh-Hant in Taiwan wording) and the decided `accept` list into 7a; strike the §9 bullet.

#### B21 — Step 9 is silent on memory, in a project whose first-class constraint is lowest peak — Severity: 🔴
* **Lens:** `implementation-readiness` B
* **Scope:** lines 828–835
* **Quote:** "the **display decimation re-run**, the **pick index rebuilt**"
* **Ground truth:** at the peak this step holds the original `source` (retained by the undo stack, since the repair is "**one** undo step"), the engine's `RepairResult.positions`/`indices` (a second full copy — `repair_mesh` allocates, as `prepareImport.ts:65-66` notes), the old display copy (`displays` is a `WeakMap` keyed on the old mesh, so it dies only when the undo entry does), the new display copy, and **both** pick indexes. On a 12.2 MB model that is roughly 4× the import peak, and the step says nothing about what is freed or when.
* **Fix:** state the retention explicitly (undo keeps the pre-repair mesh; the measured cost; whether the repair may transfer rather than copy), or say the undo entry is dropped.

#### B22 — Step 9's exit omits every project gate, in the step that first runs `repair_mesh` on real geometry — Severity: 🔴
* **Lens:** `implementation-readiness` B
* **Scope:** lines 836–837
* **Quote:** "*Exit:* a refused repair leaves the unit untouched; a successful one leaves picking, display and capacity consistent."
* **Ground truth:** the project bar (each step its own module with docs + tests, README map updated; DONE only when `tsc`, the full vitest suite, the build **and** the walk pass; `npm run gate:real` for any engine change) is met by steps 4, 5, 6 and 6a and abandoned from 7c onward. Step 9 is the worst case: no test file, no README, no `npx tsc --noEmit`, no `npm test`, no `npm run build`, no walk check, no `walk:locales` (the four repair row sentences are new UI text), **and no `gate:real`** — in the step that newly runs the engine's repair on real scans. "Leaves picking, display and capacity consistent" names no assertion, and "a refused repair leaves the unit untouched" passes if *Repair* is never wired at all.
* **Fix:** spell out the same exit block steps 4 and 5 use, plus `gate:real` and `walk:locales`.

#### B23 — The "7a (original)" block is stale, reads as current instruction, and holds the only exit — Severity: 🔴
* **Lens:** `style`, `codebase-details` A, `implementation-readiness` A
* **Scope:** lines 785–793
* **Quote:** "today one `try`, one `PLATE.open()` and one `AbortController` wrap the whole drop, so a single refusal **aborts the entire drop and adds nothing**."
* **Ground truth:** false since `4718e21`. `src/App.tsx:703-751` — the outer `try` is at 703, but **each file now has its own `try` at 723** with `catch` at 747 collecting into `refused` (aborts re-thrown at 748); `:757-761` release and report when nothing survived; `:797-800` let a refusal win the status line. (The single `PLATE.open()` at `:701` and single `AbortController` at `:698` remain true.)
* **Effect:** a fresh reader will redo work that is done. The block is also not marked non-normative — unlike the retained-and-refuted passage at 822 — yet it contradicts the live text above it and contains 7a's only `*Exit:*` and its only statement of the reservation-grain decision.
* **Fix:** delete 785–793, folding the still-live content upward, or quote-block it and mark it "as it was before `4718e21`".

#### B24 — Step 0's `g` record contradicts §9's, and the stale `s17` allowance licenses a real regression — Severity: 🔴
* **Lens:** all four technical instances
* **Scope:** lines 594–599, 607–611, 617 against 874–887
* **Quote:** line 594: "**`g` IS DONE: it is pre-existing.**" / 597: "**identical output, `selected 0` on the unthrottled stroke and the same hash `#811c9dc5`**" / 617: "**Walk now: `1 FAIL (152 checks)`**" against 875–877: "it is **not** deterministic … At HEAD it has both failed and passed"
* **Adjudication:** **§9 is the honest one and the owner's position is CONFIRMED by the code.** `g` is in section `a` (`if (runs('a'))` at `walk.mjs:649`, check at `:884-886`), so `--only=a` and the `[only a]` suffix (`:2714-2715`) are right. The flake mechanism is in the check's own comment (`:862-865`): "Too slow and the pointer moves are dropped outright and **the stroke selects nothing** — which is how this failed on this machine at 4x" with `const throttle = 4` at `:872`. That is exactly the "selects 4 when it passes, 0 when it fails" tell. So: **pre-existing AND non-deterministic, by construction.** Step 0 presents a single sample as the state, on exactly the one baseline run §9 disowns at 874–876 and whose process lesson it spells out at 889–891.
* **`s17`:** §9 (881–887) correctly records it **FIXED**, and the fix is in the tree as described — `walk.mjs:2443-2466`: wait for `[data-ui="rim-why"]`, Cancel, `waitForFunction(/Step 1/)`, `d.quiet()`, `d.idle(300)`, then Back. But **line 611 still schedules a baseline of a fixed bug** ("*Remaining exit:* `s17` baselined the same way (`--only=s` at `1db2987`), then a cause for each"), and **line 609's allowance "no new failures beside `g` and `s17`" licenses a real regression.**
* **Fix:** restate step 0's numbers as one observed run; delete the `s17` half of 611 and of 609; replace every downstream `ALL PASS` (804, 818) with "no failure other than `g`, with `g`'s measured rate recorded". Also note `walk.mjs:2432-2442` still carries the **superseded** `s17` explanation immediately above the comment that replaces it — two comments, two causes, which is what step 3 exists to remove.

---

### Majors

#### M1 — `enterEditor`'s call-site count is wrong — 🟡
Line 804, "because `enterEditor`'s seven call sites all sit outside it". Declared `walk.mjs:226`; called at 541, 961, 979, 1028, 1070, 1078, 1893, 2184 = **eight**. The argument the sentence makes is sound either way, and "all outside section `s` (2299–2489)" is VERIFIED. (Same wrong count at line 61, out of scope.)

#### M2 — `ImportDiagnosis`'s field count is wrong twice — 🟡
Lines 712–713 and 716–717: "`ImportDiagnosis` is five facts and a body count" / "Four of its six fields are `Pick`ed from the vendored `RepairReport`". `src/state/diagnosis.ts:37-46` picks **five** (`triangles`, `watertight`, `boundaryLoops`, `nonManifoldEdges`, `windingConsistent`) and declares two (`longestRimMm`, `bodyCount`) = **seven**; `project.ts:353-354` validates seven; `prepareImport.ts:81-89` returns seven; `rowState.test.ts:7-11` constructs seven. `triangles` was added by `83a4998` and the counts were never updated. **The same miscount survives in `diagnosis.ts:16` and `:20`, `src/items/README.md:57,69` and `diagnoseImported.test.ts:7`** — step 3's "no file asserting what another denies" rule applies, so fixing the doc alone leaves four stale comments. Correct wording: "six facts and a body count; five of its seven fields are `Pick`ed".

#### M3 — `noDuplicatePackages.test.ts` does not exist — 🟡
Line 717. The guard is **`src/noDuplicates.test.ts`** (plus `scripts/check-no-duplicates.mjs`). The same wrong name is already baked into `src/state/diagnosis.ts:21` and `src/items/README.md:70`, so the plan is propagating a name that greps to nothing.

#### M4 — `DiagnoseReport | CodedError` is not the classifier's input type — 🟡
Line 734. There is no type named `DiagnoseReport` anywhere in the tree (the engine type is `RepairReport`), and `CodedError` is not referenced by `rowState.ts`. The declared input is **`ImportRefusal`** (`src/items/rowState.ts:43-47`), with three entry points: `verdictOfRefusal` (`:69`), `verdictOfDiagnosis` (`:80`), `verdictOfRepair` (`:91`).

#### M5 — 13 scans against 18 scans inside the same step, and a stale parenthetical — 🟡
Line 683, "Loop `diagnose_mesh` over the 13 scans (a new script under `scripts/`)" against line 654, "all 18 local real scans". 18 is corroborated by `src/items/README.md:30`, `rowState.ts:25-27`, `diagnosis.ts:34` and `rowState.test.ts:60`; 13 is step 4's real-scan-gate corpus. And the script is not new — `scripts/measure-rim-loops.mjs` is committed.

#### M6 — 7c's stated cause is false, so the fix would be written in the wrong place — 🟡
Lines 812–813, "today it sends `exit` and discards `dentalFinished`". Back at `dentalStage === 'aligner'` does send `{type:'exit'}` (`App.tsx:1110-1116`), but `exit` only does `withMode(state,'off')` (`vendor/mixo-geocore/editing/session.ts:129-131`), and `withMode` (`:105-108`) touches `mode`, `shiftHeld`, `selection`, `tool` — **it does not clear `dentalFinished`** (`src/bench/benchScene.test.ts:56` relies on the list surviving into `mode: 'off'`). The loss happens one event later, on re-entry: `startDental` (`editingMode.ts:217-219`) and `enterDental` (`:212-215`) both set `dentalFinished: []`, guarded on `mode === 'off'` — which `exit` has just made true. Restate the cause, so the implementer does not hunt for a reset inside `exit`, and so the fix lands where it belongs: the Items-page re-entry must go through `startDentalAligner`/`useSelectedAligner`.

#### M7 — The non-manifold fixture is not the case the 8 real scans land in — 🟡
Line 730, "the case all 8 of the affected real scans land in". `src/workers/diagnoseImported.test.ts:51-55` — the fixture's own comment says three triangles on a shared edge make that edge non-manifold "**while leaving rims open too**", whereas the 8 scans are non-manifold with **zero** open rims. The test asserts only `watertight === false` and `nonManifoldEdges > 0` (`:62-63`); it never asserts `boundaryLoops === 0`. The measured case is covered in `src/items/rowState.test.ts:64-68` (`boundaryLoops: 0, nonManifoldEdges: 447`), not here. Either soften the claim or add a closed-but-non-manifold fixture.

#### M8 — Selection-then-entry ordering is unstated, and the obvious code is broken — 🟡
Line 795 with §1 line 90 ("The Items page selects the row's unit and takes this path"). `useSelectedAligner` reads `sceneRef.current.activeUnitId` (`App.tsx:817`), and `sceneRef.current` is assigned only during render (`App.tsx:188`) — so dispatching `selection/set` and then calling it in the same handler reads the **previous** active unit. `startAligner`'s `stale()` also requires `activeUnitId === unit.id` when the orient result lands (`src/components/useDentalFlow.ts:161`). Say the row passes its unit directly (`startDentalAligner(unit)` plus `selection/set` in one batch) and name the new call site — `onUseSelected` today only reaches `DentalBar` (`App.tsx:1518`).

#### M9 — `src/scenes/` is never updated by 7a/7b/7c, and the doc itself says why that is dangerous — 🟡
`sceneMap.ts:84` spells out `owns: 'A \`StartScreenId\` is set (\`task\`, \`type\` or \`file\`)…'`; `sceneMap.test.ts:56-57` asserts the `'task'` and `'type'` literals; `src/scenes/README.md:8,13` repeats them. Steps 7a/7b/7c change exactly those literals and none lists the three files — while step 3 (636–638) warns these "go stale silently because `sceneOf` takes `string | null`" (`sceneMap.ts:142`).

#### M10 — Step 3 has no status marker, is in fact unstarted, and its exit is unfalsifiable — 🟡
Line 632 carries no DONE/UNSTARTED marker while 1, 2, 4, 5, 6 do. The code shows it has not run: `sceneMap.ts:84` still reads "(`task`, `type` or `file`)", `SceneScope` is still unjustified (`:39, :62, :82`), and `BENCH_ARRIVALS` still carries the `finishDental` arrival (`src/bench/benchScene.ts:94-98`, still asserted at `benchScene.test.ts:56,64`). Its exit (639), "no file asserting what another denies", would pass with all six listed contradictions in place. Mark its status and give per-site assertions.

#### M11 — Step 11's exit omits two of `KeptBuild`'s five fields — 🟡
Lines 849–851 name "`dropped` / `droppedByZones` / `footprint` remain" — but §5 line 425 defines `KeptBuild` as `Pick<GeneratedSupportMesh, 'dropped' | 'droppedByZones' | 'footprint' | 'unresolved' | 'dentalRimCoverage'>`, and §5 441–448 record that `App.tsx` passes `mesh.mesh.unresolved` to `denture.supports.resolveAll` and reads `activeMesh?.dentalRimCoverage?.needsReview` (walk `l4`, `walk.mjs:2292`). All five exist on `GeneratedSupportMesh` (`host/core/supports/mesh.ts:155,157,167,169,177`). **A green exit would therefore pass with `resolveAll` silently a no-op and `l4` red.** Add both fields to the exit or record them as accepted costs there.

#### M12 — "a **successful** export" names a hook that does not exist — 🟡
Line 848. `src/App.tsx:1223-1232` — `exportedDental` is sent **unconditionally and before** the export (the comment says so deliberately) and `runExport`'s result is discarded by `void`. The policy is right; the mechanism is missing. Step 11 must say that `runExport` is awaited and its outcome surfaced, and name the success site (`useExport`'s resolution? a new callback?).

#### M13 — Step 9's display re-run has an unstated tier branch and no key cleanup — 🟡
Lines 829–831. A display copy exists only for the heavy tier (`prepareImport.ts:52-56`), and `setDisplayMesh` is keyed main-thread (`App.tsx:763`; `src/state/meshExtras.ts:12`), with the pick index registered via `setPickIndex((display ?? mesh).positions, …)` (`src/workers/importClient.ts:37`). Unstated: what happens if the repair changes the tier, and who un-registers the old display and pick keys.

#### M14 — Step 9 cannot reuse `prepare()`, and the doc does not say what replaces it — 🟡
Lines 832–835. `prepareImport.ts:47-58` — `prepare()` does `assertTriangleCapacity` → `center(item)` → `if (meshTier(triangles, runtime) === 'heavy') display = simplify(centred.mesh, Math.floor(TRIANGLE_BUDGET[runtime] / 2))`. **Centring and decimation are coupled inside one function and the heavy-tier threshold is inline at `:53-55`.** So centring is separable only by not calling `prepare` — which means step 9 either duplicates the heavy-tier predicate at a second site that will drift, or `prepare` is split into `centre` and `displayFor(mesh, runtime)`. The doc must say which. (Reusable as-is: `decimateWithWasm` `:37`, `meshTier`/`TRIANGLE_BUDGET` `:2`, `buildPickIndexData` `importWorker.ts:53`, `diagnoseImported` `:78`.)

#### M15 — The Drop/Items failure matrix stops at "one bad file" — 🟡
Lines 772–776 cover the corrupt-file and whole-drop-cancel cases and nothing else. Unaddressed anywhere in §8/§9: (a) **a second drop while one is in flight** — `importFiles` refuses only on `importRefusal(mode)` (`App.tsx:686`), so two concurrent drops open two `PLATE.open()` reservations and both call `placeImportedUnits`, and 7b's "Items page owns the import while the Start scene is up" gives no rule for append-vs-refuse; (b) **a worker crash or termination mid-drop** (does the row read "could not be read", or spin forever?); (c) **a drop of only unsupported files** — today `accepted.length === 0` yields the `file-type` coded error (`App.tsx:693`), and the Drop page must preserve the existing `onUnsupported` prop, which 7a-remaining never mentions. Add one short failure table.

#### M16 — Per-row abandonment contradicts the whole-drop cancel, and the arrives-after-removal race is undefined — 🟡
Lines 802–803 against 772–773. 7a locks in one `AbortController` for the whole drop, so removing a single row cannot stop that file's read; the doc never says whether the row's remove aborts the file (which needs a per-file controller nobody adds), nor **what happens when the worker returns a mesh for a row the operator already removed** — the current loop would place it as a unit (`App.tsx:762-781`). State the per-file controller, or the discard rule and where the discard happens.

#### M17 — The Items page after a project reload is unspecified — 🟡
7b puts in-flight rows in `PlateLedger`, "outside `scene.units`" (802–803). Units arriving from `project.open` have a saved `diagnosis` (or none, after the staleness drop at `project.ts:360`) and no row history. Whether the Items page lists them, what a unit with no verdict shows, and whether *Repair* is offered for a reopened project are all unstated — and `offersRepair()` (`rowState.ts:100`) answers only `holes`/`malformed`. See also B6, which makes four of the nine states unreachable after a reload.

#### M18 — 6a's exit cannot fail for the thing it guards — 🟡
Lines 765–766. `src/ui/uiStylingDoc.test.ts:35,43-46` is **one-directional**: it fails only on a token the code declares or reads that the doc does not name, so a **documented-but-undeclared** token passes — and `docs/ui-styling.md:478` already documents `--row: 22px` while nothing declares it. This is exactly the trap the doc itself diagnoses at 528–534 and then adopts as its exit. "Every state visible in `kit.html`" is eyeball-only though `src/kit/Catalogue.test.tsx` exists. Add "`Catalogue.test.tsx` asserts one entry per `ROW_STATES` member", an assertion that the token sits in the **app** table, and "`--row` is declared in `src/styles.css` and read by the row rule".

#### M19 — 7d has no replacement assertions — 🟡
Lines 816–818, "*Exit:* `ALL PASS`, with the check count stated so a dropped check is visible." A count is a dropped-check guard, not a correctness guard; the exit passes if the checks are rewritten into tautologies as long as the count matches. §6/§7 (474–476, 555–559) say the rewrite needs class names and the replacement heading/footer strings, which exist nowhere in the doc. List the new check ids with selectors and expected strings (Drop heading, footer, key labels, `items-row-<importId>`, `items-progress-<importId>`).

#### M20 — The three-language row sentences are assigned to 6a in one line and absent from 6a's body — 🟡
Line 756, "*Remaining for the row:* only the three-language sentences and the row component itself (step 6a, landing with 7b)". 6a's body (759–764) lists the row-height token, the tone, the *Appliance* glossary terms and the `kit.html` markup — **not** the sentences — though its exit names `i18n.test.ts` and `japaneseSubset.test.ts`. 7b (795–807) never mentions them either. So nine sentences × three languages are owned by nobody. Put them in one step, with the locale files named and the Taiwan-wording rule restated per string.

#### M21 — 7a-remaining omits four compile-breaking `StartScreenId` / `File[]` sites — 🟡
- `src/App.tsx:137` — `const START_HINT: Record<Exclude<StartScreenId, 'file'>, string>` is an **exhaustive `Record`**, so adding `drop` is a type error until a hint string and its three translations exist.
- `File[]` is more than `files.find(isStl)`: `StartScreen` holds `const [held, setHeld] = useState<File>()` (`StartScreen.tsx:38`), passes one file through `onStart: (profile: string, file?: File)` (`:33`), and the picker reads `event.target.files?.[0]` (`:97`).
- That ripples into the session event union: `onStart` → `App.tsx:1243 startDental(profile, file?)` → `send({type:'startDental', profile, …})`, whose event type is `{ type: 'startDental'; profile: string; file?: File }` at **`src/dental/editingMode.ts:48`**.
- `DentureChoice` (`StartScreen.tsx:83`) calls `choose(DENTURE_PROFILE_ID)` and goes straight from the task keys to the **file** screen, bypassing `type` — moving "the task screen's three keys" onto Drop has to decide what the denture key does there.
(Also `App.tsx:207, 1240, 1242, 1367, 1384, 1548` read `StartScreenId`.) The doc's "three keys" **is** correct: `ChoiceKey icon="aligner"` (`:82`), `DentureChoice` (`:83`), `ChoiceKey icon="generic"` "Any model" (`:87`), plus the `link-button` "Open a saved project" (`:89`). There is exactly one component file — `src/components/StartScreen.tsx`.

#### M22 — `KeptBuild` collides with an existing exported symbol — 🟡
§5 proposes a new `src/supports/keptBuild.ts` exporting type `KeptBuild`; `src/denture/steps/supports/rigidMove.ts:77` already exports `keptBuild<M>(previous, unit, built: { unit: PrintUnit; mesh: M } | undefined)`, imported at `App.tsx:105` — a generic helper over exactly the same `{ unit; mesh }` shape. Rename the new module/type, or put the type beside the existing helper. (Incidentally, that helper is the existing "does this build still describe this unit" primitive, which step 9 should reuse to invalidate a build when `source` is replaced.)

#### M23 — Step 11's exit does not assert that any geometry was actually released — 🟡
Lines 849–851 name real assertions, but storing an unmodified `GeneratedSupportMesh` into `UnitBuild<KeptBuild>` is structurally legal and frees **nothing**, so every listed assertion passes on a map that still holds full meshes. No projection function is named. Add a retained-bytes or `positions.length === 0` assertion, and name the projection.

---

### Nits

- **N1 — line 637:** "`sceneOf` takes `string | null`" paraphrases loosely. `sceneMap.ts:142` — it takes an object whose `startScreen` is `string | null`. The point (no compile-time check on the literal) holds.
- **N2 — line 798:** bare `JobActivity` is ambiguous and resolves to the wrong thing: the vendored class is `@mixo-geocore/host/workers/jobActivity` (`src/workers/projectClient.ts:4`), the UI panel is `src/components/JobActivity.tsx`, imported as `JobActivityPanel` (`App.tsx:12`). Name the file.
- **N3 — line 621:** "a **flag**, not the env var" overstates. `walk.mjs:133-134` still accepts `process.env.WALK_LOCALES`, and `:2513`/`:2554` still document it. The Windows-portability point is right. (`package.json:19` and `.github/workflows/ci.yml:61,66` with `set -o pipefail` on both walk steps are VERIFIED exactly as described.)
- **N4 — line 763:** "static markup" ignores an export written for it. `rowState.ts:64-66` carries the comment "The state names, for a catalogue page that must show every one of them", and `src/kit/` does not import it. See B4.
- **N5 — line 757:** "(step 6a, landing with 7b)" — 6a is numbered before 7a, said to land with 7b, and its own text (763) argues "a step must not need the one after it". Rename it "7-pre" or "6a (prerequisite of 7b)".
- **N6 — line 826:** an orphaned `*Exit:*` under the tombstoned "**8. — moved to step 7c**", duplicating 7c's own exit (814) and sitting beneath a historical blockquote. Delete it. The step-8 tombstone plus the deleted step 10 leave two gaps in a 0–11 sequence; either renumber or note the gaps.
- **N7 — lines 822–825:** the retained revision history ("Revisions 3 and 4 said…", "Another claim adopted from a reviewer report without checking the source") contains no instruction and could be read either way. The retraction itself is **correct**: `startDental` already writes `dentalProfile: event.profile` (`editingMode.ts:219`) and `switchDentalProfile` (`:225`) is a further writer. Replace with a one-line statement of fact and move the history to a changelog.
- **N8 — `g`'s cheapest fix is not among §9's options.** `walk.mjs:882-883` claims "A queue that never formed cannot answer the question, and saying so is better than a red line" — but `:884-885` folds `pendingAtSwitch > 0` into the **assertion**, so a queue that never forms is reported as FAIL, not as a note. `note()` exists in the harness and is used elsewhere. §9 should adopt it or record why a red line is wanted.
- **N9 — step voice and format.** Steps 0–6 are written as a first-person status log rather than instructions ("my `g` fix … was unnecessary", "I bisected…", "The process lesson cost more than the bug"). Of sixteen step entries, only 7d matches the intended what/where/how/check shape; step 6 is the only one with a `*Build:*` block, and carries a `*Remaining*` under a DONE heading. Status markers are inconsistent ("— DONE.", "Done —", "THE LOOP HALF IS DONE", "IS DONE") and the project's 🟡/⛔ status lines are not used. Standardise to "**N. Title.** Status: DONE / 🟡 partial / ⛔ blocked" with four labelled parts, and move rationale and history to an appendix.
- **N10 — `data-ui` gaps.** Steps 6a (759), 7b (795), 9 (828) and 11 (846) describe UI and name almost no `data-ui` values. 7b gives only the pattern `items-progress-<importId>` (799) plus a vague "`data-ui` keyed to the import id"; 9's *Repair* button has none; 6a's `kit.html` states have none. Add a "UI names" line per step. (VERIFIED: `ProgressIndicator` (`src/progress/Progress.tsx:27-38`) emits no `data-ui` of its own — the wrapper `Progress` does at `:61` — so the name must go on the row's wrapper, as 7b says.)
- **N11 — line 817, UI copy in one language.** 7d renames *Add another aligner* to *Next item* and gives no ja or zh-Hant text; 6a covers only the *Appliance* glossary. Add the locale entries in Taiwan wording. (No third-party slicer names, no centred text, no ✅/🎉 misuse and no mainland-Chinese terms appear in 588–891.)
- **N12 — numeric and reference hygiene.** Line 603 "the exit-code mistake above" points **downward**, to step 2 (626–628). Check counts are never reconciled across "152 checks" (617), "29 checks [only a]" (598) and "21 checks" (816), though 818 demands the count be stated. Line 666–667's "Not a cautious default: there is **no rim to measure**" and the sentence-initial bold "And …" lead-ins (668, 672, 706) are rhetorical; use "Decision:", "Effect:", "Wiring:". Line 645–648's engine-bump procedure is a comma chain; make it a numbered list.

---

### Answers to the five questions

#### 1. Can each unstarted step be started from the text alone?

| Step | Startable? | The guesses forced |
|---|---|---|
| **7a-remaining** | **NO** | the reservation grain, explicitly delegated (B11); the Drop page's class names, heading, footer, key labels and tooltips in three languages (B20); the `accept` format list (B20); the new `StartScreen` prop shape for `File[]` and the four sites it ripples into (M21); *Appliance* vs *Purpose* (B20); whether `onUnsupported` and the `accepted.length === 0` path survive (M15); `src/scenes/` updates (M9); and its own exit criterion (B10) |
| **7b** | **NO** | how the session enters dental mode for item 1 (B19); selection-vs-entry ordering (M8); the `JobActivity` prop and predicate (B15); which of 7a/7b lands `StartScreenId`/`StartScreen` (B12); what `release()` means for one row (B11); the streaming loop's five consequences (B14); eight vs nine sentences and who writes them (B4, M20); second drop, worker crash, removed-row race, project reload (M15, M16, M17); the row component's props and full `data-ui` set; an achievable definition of done (B13) |
| **7c** | **NO** | the full site list for `dentalStage: 'type'`, including `backToTypeScreen`, section `x` and `walkLocale` (B16); the entire behaviour of "Start screen + live dental session", including the one-file `slice` on drop (B17); where the `dentalFinished` reset actually is (M6); the `StartScreenId` member set that remains |
| **7d** | **PARTLY** | scope is nameable and every check id tested exists, but the line range is wrong for the fourth time (B1), the Add-another list is wrong (B2), and the replacement assertions and strings do not exist (M19) |
| **9** | **NO — the weakest step in the document** | worker vs main thread, task kind, protocol message, scene command, undo batch (B5); whether and how `diagnosis` is replaced, and the "repaired" field with its `normalizeUnit` gate (B6); which capacity guard, and what happens if it refuses after the repair ran (B7); where `MAX_FILL_LOOP_MM` lives — it does not exist (B3); the tier branch and old display/pick key cleanup (M13); whether `prepare()` is split or its threshold duplicated (M14); what is freed and when (B21); its module, README, tests and tooling gates (B22) |
| **11** | **NO** | the real value type of `built` and the five consumer files that break (B8); `modelLanded`'s fate and the projection function (B8, M23); the successful-export hook (M12); two missing exit fields (M11); the name collision (M22); and **whether it should ship at all**, since the step's own text recommends deferring it while the cap it depends on is owned by nobody (B9) |
| **6a** | **NEARLY — one real blocker** | both token names and values (B18); eight vs nine states (B4); whether the three-language sentences are its job (M20) |

#### 2. Ordering

**Step 9's four requirements: the doc names all four, and the order is achievable.**
- display decimation re-run — line 830 ✓
- pick index rebuilt — line 830 ✓, and the cited reason is **VERIFIED**: `importWorker.ts:53` builds it from `display ?? mesh`, so decimate-before-index is both stated and necessary
- capacity re-check — line 831 ✓ (but its justification is dead and it has no refusal path — B7)
- "**Centring does not re-run**" — lines 832–834 ✓, and the reasoning is **VERIFIED CORRECT**: `prepareImport.ts:30-34` centres once in place, `placeImportedUnits` then trusts `item.centred` (`src/state/import.ts:91-100`), so a repaired mesh is already in the operator's frame

**Feasibility:** yes, with the caveat in M14 — centring is separable from decimation **only by not calling `prepare()`**, which couples them. Two follow-ups are **missing** from the list: replacing the saved `diagnosis` (B6) and re-registering the display copy in `meshExtras` / the index in `setPickIndex` (M13).

**Cross-step inversions (four real ones):**
1. 7b's exit (`ALL PASS`, line 804) depends on 7d's rewrite (line 816) — B13
2. 7b's row-removal instruction (802) depends on an API 7a was told to "decide" (791) — B11
3. step 11 depends on a row cap **no step owns** — B9
4. step 9 depends on step 5's constant, which does not exist — B3

Plus: 6a is numbered before 7a but said to land with 7b while arguing it must not depend on 7b (N5).

#### 3. Exit criteria

- **Missing entirely:** 7a-remaining (B10).
- **Vacuous — cannot fail if the step is wrong:** 7a line 792 (already green, and asserts the *old* flow); step 3 line 639 ("no file asserting what another denies" is not executable); 6a line 765–766 (`uiStylingDoc.test.ts` is one-directional, and "every state visible in `kit.html`" passes with eight of nine, eyeball-only); 7d line 818 ("with the check count stated" passes on tautological rewrites); step 9 line 836 ("a refused repair leaves the unit untouched" passes if *Repair* is never wired); step 11 lines 849–851 (pass on a map still holding full meshes).
- **Unachievable as written:** 7b line 804 and 7d line 818 — literal `ALL PASS` against a known-flaky `g` and against line 607's own prohibition.
- **Incomplete:** step 9 (no module, tests, README, `tsc`, build, walk, `walk:locales` or `gate:real` — B22; silent on the verdict and on memory); step 11 (names real assertions against files it does not list; omits two `KeptBuild` fields); 7c (requires neither the walk nor `walk:locales`, both of which it breaks).
- **The model to copy — specific and genuinely falsifiable:** 7c line 814 ("a walk check that Back at Orient keeps `dentalFinished`") and step 4's literal-line criterion (649–651).

#### 4. Section 9 "Still open"

**No §9 bullet is a real blocker on starting 7a-remaining** — except the *Appliance*/*Purpose* bullet (872), which **is** one, because level 1 lives on the Drop page and 7a cannot write copy for a word that is still a recommendation (B20). The one other genuine blocker on 7a is **inside 7a itself**: the reservation grain at line 791 (B11).

Bullet-by-bullet: the row-tone bullet (867–868) blocks **6a**, not 7a (B18). The host-memory row-cap bullet (863–866) blocks **7b and 11**, not 7a — and its "rather than guessing a number now" is stale, since step 5 already produced the figure (B9). The noise-shell bullet (869–871) blocks nothing; it touches only step 9's wording.

**Honesty of the `g` / `s17` record: §9 is correct on both, and the dishonesty is upstream in step 0.**
- `g` (874–880) is recorded as **flaky and not this work's**, which the code confirms: a 4× CPU-throttled stroke race by construction, with the mechanism in the check's own comment (`walk.mjs:859-886`, `const throttle = 4` at `:872`). §9 also explicitly disowns the earlier determinism claim. **Step 0 (594–599, 617) was never updated** and still presents one baseline run as the state (B24).
- `s17` (881–887) is recorded as **FIXED**, and the fix is in the tree exactly as described (`walk.mjs:2443-2466`). But **line 611 still schedules a baseline of it** and **line 609 still licenses "no new failures beside `g` and `s17`"**, which would hide a real regression (B24). Note also that §9 hosts a *resolved* item under a heading that reads "Still open".

#### 5. The two specific claims

**(a) `startDentalAligner` / `useSelectedAligner` rather than `startDental` — VERIFIED TRUE by all four technical instances.**
`src/dental/editingMode.ts:217-220` — `case 'startDental'` is guarded on `state.mode === 'off'` and sets `dentalProfile`, `dentalStage: 'aligner'`, `dentalAligner: 'prompt'`, `dentalNotices: []`, `dentalProposal: undefined`, **`dentalFinished: []`** and `dentalUnitId: undefined`. `enterDental` (`:212-215`) resets the tally too. `exportedDental` (`:319-322`) and `addAnotherDental` (`:324-326`) preserve it via `finished()` (`:208`). The alternatives exist: `App.tsx:627` `startDentalAligner` routes to `denture.orient.start(unit)` or `dentalFlow.startAligner(unit)` with no session reset (used at `:789`, `:824`); `App.tsx:816-825` `useSelectedAligner` checks `acceptsDentalDrop`, refuses the heavy tier with a three-language message, and calls it.
**Two caveats the doc must absorb:** it is unusable for the *first* item, because `acceptsDentalDrop()` requires `mode === 'dental' && dentalStage === 'aligner'`, reachable from `off` only through the forbidden doors (B19); and `useSelectedAligner` reads `activeUnitId` from a render-time ref, so the obvious select-then-enter handler reads the previous unit (M8).

**(b) `UnitBuild<KeptBuild>` in step 11 — the doc's correction is CORRECT; the earlier reviewer's `UnitBuild<BuiltSupports>` claim is CONFIRMED FALSE; but the widening is still not type-safe as written.**
`vendor/mixo-geocore/host/supports/unitSupports.ts:56` — `BuiltSupports = Pick<GeneratedSupportMesh,'dropped'|'droppedByZones'>`, **no `footprint`**; `footprint` is on `GeneratedSupportMesh` (`host/core/supports/mesh.ts:168`); `src/plate/plateLayout.ts:24` reads `entry?.mesh.footprint`. So the refutation stands. `UnitBuild<T extends BuiltSupports = GeneratedSupportMesh>` (`:59-62`) accepts `KeptBuild` as §5 defines it, and `currentBuild`/`currentBuilds`/`unitContacts` (`:68, :73, :88`) and `planExport` (`host/supports/export.ts:48`) are already generic enough.
**But it will not compile against five consumers, none of them named in step 11** — `src/plate/plateLayout.ts:12` (which declares its own `{ unit; mesh: GeneratedSupportMesh }` shape and does not use `UnitBuild` at all, so the generic bound buys nothing), `src/components/usePlateArrange.ts:16`, `src/components/useFixSpot.ts:27`, `src/components/useExport.ts:26`, and `src/components/viewport/types.ts:23` (`supportMeshes` needs the full mesh, because a live unit still has to be drawn, so the map needs a union plus a discriminator rather than a uniform widening). See B8.

---

### Verified correct — do not re-raise

- Section `s`'s **check count of 21**, including `s2b` and the `u`-prefixed `u1a` inside it (`walk.mjs:2331-2486`). Only the line range is wrong.
- Line 830, "`importWorker` builds it from `display ?? mesh`" — `importWorker.ts:53`; host side `setPickIndex((display ?? mesh).positions, …)` at `importClient.ts:37`.
- Lines 832–834, centring must not re-run, and why — `prepareImport.ts:30`, `src/state/import.ts:91-100`.
- Line 831, `assertPlateCapacity` is consulted only on the import path — `vendor/.../core/budget.ts:128`, called only at `App.tsx:729` and `:746`.
- Line 847, `UnitBuild<BuiltSupports>` has no `footprint` — `unitSupports.ts:56` against `plateLayout.ts:24`.
- Line 848, `exportedDental` fires on the press, before the export — `App.tsx:1223-1232`.
- Lines 709–713 and 726–730, `diagnoseImported` runs on `item.mesh` after the weld and only the verdict crosses the boundary (`prepareImport.ts:78`, `importWorker.ts:57,65`); the four test facts (tetrahedron watertight with no rim, 12 mm rim on a 3-4-5 triangle, two bodies 50 mm apart, a non-manifold count) all match `diagnoseImported.test.ts:21-63`.
- Lines 715–724 and 740–754, `ImportDiagnosis` in `src/state/diagnosis.ts` as a true leaf (its sole import is the vendored `RepairReport`); `PrintUnit.diagnosis` (`project.ts:71`); carried by `placeImportedUnits` (`import.ts:112`); `normalizeUnit` destructures `diagnosis` out of the spread (`project.ts:320`) and `diagnosisField` drops a malformed **or stale** verdict (`:350-360`). Body-count field is `bodyCount` (`diagnosis.ts:45`).
- Lines 768–780, per-file isolation and whole-drop abort exactly as described (`App.tsx:698, 721-751, 757-761, 797-800`); walk `m1` in its own section (`walk.mjs:1016`, check at `:1035`) asserting `units 2` and the refused file's name.
- Lines 694–707, nine row states as three tested partitions, the `src/items/` placement argument, and the equality test (`rowState.ts:65, 69, 80, 91`; `rowState.test.ts:31`; `src/importOracleBoundary.test.ts:10`).
- Lines 822–825's retraction: `startDental` already writes `dentalProfile: event.profile` (`editingMode.ts:219`) and `switchDentalProfile` (`:225`) is a further writer.
- Lines 881–887, `s17`'s cause and fix (`walk.mjs:2443-2472`); lines 874–880, `g`'s flakiness (`walk.mjs:859-886`).
- Every test file 6a names exists: `src/ui/uiStylingDoc.test.ts`, `src/ui/noColourLiterals.test.ts`, `src/glossary.test.ts`, `src/ui/japaneseSubset.test.ts`, `src/i18n.test.ts`.
- Every vendored field named in 588–891 exists on `repairMesh.ts`: `take_loops()` `:142`, `fill-disabled` `:73/:188`, `RepairReport.{triangles,boundaryLoops,nonManifoldEdges,windingConsistent,watertight}` `:47-57`, `RepairBody.loopLengthsMm` `:42`, `RepairResult.{ok,reason,changed,after,steps,fills}` `:126-136`, `LoopFill.reason` `:89`, `RepairSteps.{maxFillLoopMm,loopsFilled,patchTrianglesAdded,degenerateTrianglesRemoved,verticesAdded}`, `body-invariant:<step>` `:15-16`. `repair_mesh`'s third argument is required with no engine default (`:164, :318`). (`longestRimMm` is **not** vendored — it is derived at `prepareImport.ts:84`.)
- Line 621, the locale pass command, and line 628, `set -o pipefail` on both CI walk steps — `package.json:19`, `.github/workflows/ci.yml:61,66`.
- The four items rounds 1–3 fixed are **still fixed**: step 6 precedes step 7; "THREE places" is gone; per-row Appliance/Type is carried. None is re-raised here.

### Code reuse the plan should name

1. **`ROW_STATES`** (`rowState.ts:65`) — iterate it in the catalogue, as `src/kit/Catalogue.tsx` already does with `PROGRESS_TYPES`. Kills B4 permanently.
2. **`offersRepair(row)`** (`rowState.ts:100`) already encodes "a refusal must never re-offer the press" — step 9 should name it rather than re-deciding.
3. **`verdictOfRepair(result)`** (`rowState.ts:91`) already maps a repair outcome to `refused | unchanged | repaired | repaired-open`, with `body-invariant:` stripping, tested at `rowState.test.ts:70-107`. Step 9 only has to feed it a `RepairResult` — but it must separately go through `diagnoseImported` for the persisted shape (B6).
4. **`decimateWithWasm`** (`prepareImport.ts:37`) + `meshTier` / `TRIANGLE_BUDGET` (`:2`) for the re-decimation; **`buildPickIndexData`** (`src/workers/pickIndexes.ts`) for the index; **`diagnoseImported`** (`prepareImport.ts:78`) for the fresh verdict. `prepare()` is **not** reusable — it centres (M14).
5. **`dispatch({ type: 'batch', commands: [...] })`** (`App.tsx:774`) for step 9's one-undo-step requirement.
6. **`keptBuild<M>()`** (`src/denture/steps/supports/rigidMove.ts:77`) is the existing "does this build still describe this unit" helper — step 9 should use it to invalidate a build when `source` is replaced (and step 11 should stop colliding with its name — M22).
7. **`PlateLedger.open()` / `hold|commit|release` / `settle(sceneIds)`** (`src/core/plateLedger.ts:15-25, 45-63`) — the per-file grain needs no API change at all (B11).
8. **`acceptModelFile`, `estimateTriangles`, `estimateHeadBytes`, `src/core/import/stlHeader.ts`** (used `App.tsx:692, 725`) — the Drop page must not re-sniff formats.
9. **`errorStatus('import', codedJobError(err), { name })`** (`App.tsx:760, 799`) and **`START_HINT` / `fileStepText`** (`App.tsx:137`, `src/denture/steps/start/startText.ts`) — the existing status/hint mechanisms the Drop page extends rather than invents.
10. **`ImportedMesh.diagnosis`** (`src/state/import.ts:26`) — the worker protocol **already** carries the verdict (`PreparedMesh extends ImportedMesh`, `importProtocol.ts:13`), so 7b needs no protocol change and the doc correctly does not ask for one. Step 9 **does** need `ImportTask` extended, and the doc does not say so (B5).
11. **Walk section `s`'s existing local helpers** — `onScreen`, `unitsOnPlate`, `plateHas`, `dropOnStart`, `atStep1`, `supports` (`walk.mjs:2302-2312`), plus `d.quiet()`, `d.idle()`, `d.status()`, `d.props()`, `note()` and `leaveRimIfOpen` (`:1121`). The Items page should get **one** shared entry helper, as `enterEditor` is for the editor, rather than inlining the navigation eight times.
12. **`CapacityLimit`** (`rowState.ts:40`) already maps `'triangles' | 'memory' | 'plate'` to the three guards — a row cap needs a fourth member (B9).

### Unverified — stated, not guessed

- `npm run gate:real`, `vendor:check`, the "1301 tests" count, "`real-scan gate: PASS (13 scans)`" and "`1 FAIL (152 checks)`" (617, 641–651) — read-only tools; nothing was run.
- All commit hashes (`e5c5718`, `1db2987`, `4718e21`, `f4c3500`, `b5a71ab`) — no git access from the reviewers.
- Whether walk section `m` really re-runs in "13 seconds" (778) — its own waits allow up to 180 s.
- The clinical numbers at 659–664 (0 rims, 8 of 18, 5,547 non-manifold edges, 525 bodies, 12.2 MB) — fixtures not readable; corroborated by `src/items/README.md:34-35` and `rowState.test.ts:55`, and the script computes each (`measure-rim-loops.mjs:110-142`).
- zh-Hant / ja wording quality, and whether the locale files already carry any new keys.
- Whether `glossary.test.ts` would actually demand an *Appliance* term.

### Aside — not a document finding

One reviewer found `S:/ai/mixodental/.claude/worktrees/agent-a781311f7148b36f9/` on disk, containing copies of `src/glossary.test.ts`, `src/i18n.test.ts` and `src/importOracleBoundary.test.ts`. The project rule is **NO git worktrees, ever** (a `worktree remove --force` has twice deleted real `node_modules`). Worth checking whether that is a live worktree left behind by tooling before anyone runs a cleanup command near it.

---

<a id="2026-11-07-egm-round4-resolution"></a>

## 2026-11-07 — EGM round 4 — resolution

*Was `docs/reviews/2026-11-07-egm-round4-resolution.md`.*

Two swarms, split at the plan's real boundary. Feature spec (§0–§7): 11 🔴 / 26 🟡 / 15 🟢, five
reviewers. Implementation plan (§8–§9): 24 🔴 / 23 🟡 / 12 🟢, five reviewers. Reports:
`docs/reviews/2026-11-07-egm-round4-feature.md`, `docs/reviews/2026-11-07-egm-round4-implementation.md`.

**The bar is not met and this round proves it, so the honest headline is: zero of the seven unstarted
steps were startable from the text alone.** Round 4 was not a polish round.

### Verified against the tree before adopting

This session has already paid for adopting reviewer claims unverified — four false statements in an
earlier round. Every finding below was checked against code, not prose.

| Claim | Verdict | Evidence |
|---|---|---|
| `diagnosis.ts` has 7 fields and Picks 5; prose says 6 and 4 | **CONFIRMED (mine)** | `src/state/diagnosis.ts:38` lists five in the `Pick`, plus `longestRimMm` and `bodyCount` |
| Engine 63 is vendored; §3 said not | **CONFIRMED** | `vendor/mixo-geocore/SOURCE.json` `engineVersion: 63` |
| `ROW_STATES` is nine; plan said eight, twice | **CONFIRMED** | `src/items/rowState.ts:65-66` |
| `MAX_FILL_LOOP_MM` exists nowhere in `src/` or `vendor/` | **CONFIRMED** | only two `console.log` strings, `measure-rim-loops.mjs:129,137` |
| Section `s` range wrong a 4th time | **CONFIRMED** | `s1` at `walk.mjs:2331`, `s19` at `2486`; doc said 2268–2424, cutting off `s14` at `2425` |
| A live dental session slices a drop to one file | **CONFIRMED** | `App.tsx:692` `.slice(0, dentalDrop ? 1 : undefined)` |
| The Items loop cannot reach item 2 | **CONFIRMED** | `acceptsDentalDrop` needs stage `aligner` (`editingMode.ts:353`); `dentalLoading` is a no-op outside it (`:230`); `startAligner`'s `stale()` needs `activeUnitId === unit.id` |
| `startDental` resets `dentalFinished: []` | **CONFIRMED** | `editingMode.ts:219` |
| `UnitBuild<KeptBuild>` right but a uniform widening won't compile | **CONFIRMED** | `usePlateArrange.ts:16` wants `mesh: GeneratedSupportMesh`; `useExport.ts:26` wants `UnitBuild`; `plateLayout.ts` `Builds` read at `plateFootprints` |
| `UnitBuild<BuiltSupports>` has no `footprint` | **CONFIRMED FALSE in an earlier round** | the doc already carries the correction |
| Step 0 still calls `g` deterministic | **CONTEST** | L875 says "it is **not deterministic**"; L879 lists "deterministic" among corrected errors (`19531de`) |

### Applied

1. **§3's status header** — said "Not vendored — the tree is engine 61. App side unstarted." three
   rounds after both became false. Rewritten, with a line on why a status nobody re-reads is worse
   than none.
2. **`fill-disabled` inverted** — "unreachable once step 5's constant exists" is backwards: at limit 0
   it is universal, and §3's own table said so 38 lines later.
3. **The classifier's home** — `src/import/` → `src/items/rowState.ts`, with the `importOracleBoundary`
   reason.
4. **Eight → nine row states**, both places, and both now say *iterate `ROW_STATES`* rather than carry
   a count that has been wrong at every revision.
5. **Walk ranges and check IDs** corrected, with an instruction not to trust the new numbers either.
6. **The gate** — "no new failures beside `g` and `s17`" is withdrawn. `s17` is fixed and the full walk
   is `ALL PASS` (153 checks at `83a4998`). The criterion is plain `ALL PASS`; a run where `g` alone
   fails is re-run, not accepted.
7. **Step 5's exit was false.** No constant exists. Recorded that none should: at a measured 0 it would
   be a parameter with one value and no caller. Step 9 passes a literal `0` citing the measurement.
8. **Step 9 must replace `PrintUnit.diagnosis`** — otherwise the `triangles` gate drops the verdict on
   the next reload, on the one file the operator just acted on. Also: `verdictOfRepair`'s
   `RepairResult` is unpersistable, so four of nine states cannot survive a reload —
   **recommendation: collapse to the three `diagnose_mesh` states**, because a row saying what the mesh
   *is* cannot go stale. And the capacity re-check keeps its place but loses its reason: "filling adds
   triangles" is impossible at limit 0; non-manifold splitting is the real one.
9. **Step 11** — the union-with-discriminator work, all five consumers named, and it adopts the
   measured cap of 8 instead of leaving it ownerless.
10. **Step 7b** — the loop blocker written out with its mechanism, the needed session event named as
    the `exportedDental` analogue, item 1's entry flagged as unstated, the one-file slice recorded, and
    its exit corrected: whole-walk `ALL PASS` is **7d's**, not 7b's.

### Settled by the owner after this round

**Step 9 (repair on a press) is CUT from this release**, with the condition for its return stated:
a holed scan has to exist. At a measured fill limit of 0 the only operation repair can perform here
is non-manifold splitting, and that is not worth a step that must also invent a worker protocol
message, a `SceneCommand` replacing `unit.source`, and a 4x-import memory peak.

Followed through rather than deleted:

- §0's memory claim now says the release holds **no** transient copy per file, because nothing asks
  for one.
- §3's pre-press table reports instead of offering a press; its post-press table is marked not
  reachable and kept, because `rowState.ts` already implements and tests it.
- **Step 6a drops from nine row sentences to five** (`unreadable`, `too-big`, `clean`, `holes`,
  `malformed`), derived from `ROW_STATES` minus the four only a repair can produce — not listed by
  hand, which is how the count went wrong at every revision.
- The reload question disappears: the four unpersistable states were the only rows the project file
  could not rebuild.
- `PrintUnit.diagnosis` cannot go stale this release, since nothing replaces `source`. The `triangles`
  gate stays anyway — one comparison, and it is what makes repair safe to write later.
- Step 9's full brief is kept in place, labelled as the brief for its return, so round 4's findings
  are not re-derived when it comes back.

### Still open — judgment, not fact

- **§7 does not specify the UI it exists to specify.** Ten user-visible strings have zero locale
  entries, neither new page has a layout, and "preview" appears once and is defined nowhere. If it is
  rendered geometry it is the feature's only new per-row memory cost, against §3's own argument.
- **Step 9 is the weakest step in the doc** — no file, no worker side, no protocol message
  (`ImportTask` is `stl|weld` only), and no `SceneCommand` replaces `unit.source`. Its memory cost is
  roughly 4× the import peak.
- **Appliance vs Purpose** on the Drop page is still a §9 "Recommendation", and it is the one open
  item that genuinely blocks starting 7a.
- **The reservation grain** is still delegated ("Decide which; do not leave it"), and L802 contradicts
  L790.

---

<a id="2026-11-08-cia-deck-and-flow"></a>

## 2026-11-08 — CIA audit — the deck and the dental flow, 2026-11-08

*Was `docs/reviews/2026-11-08-cia-deck-and-flow.md`.*

**Tier: Screen. Scoped subset of the sweeps, not all twenty-four.** Run with the `cia` skill on the
deck → flow → deck journeys after two EGM document reviews missed this class. What EGM audits is a
*document* against document standards, and only one of its seven reviewers reads code, for accuracy
and reuse rather than journeys — so "three of eight rows come back with no rim, now what" had no home
in it. That question came from the owner.

### Honest limits of this run

- **Sweeps run:** S1, S2, S3, S5, S12, S13, S15, S16/S16.1, S22 (incl. S22.6, S22.9, S22.10), S23.
- **UNVERIFIED, not omitted:** S4, S6–S11, S14, S17–S21, S24. S22.11 (the vocabulary census) not run.
- **Doctrine not read whole.** The reference files total ~300 KB; reading them entire risked losing
  the findings to context compaction, so the sweeps that bear on journeys were read and the rest were
  not. By the skill's own rule that makes this a **scoped review rather than a full audit**, and the
  reference receipts cannot be quoted.
- **No live rail press.** Which is exactly why F1 survived: `scripts/walk.mjs` read the rail's
  disabled states and never pressed a tool. `items-start` and `items-remove` appeared nowhere in the
  harness at all.
- Findings were produced by two subagents and then **each one re-verified against the code** before
  being recorded here. Anything they reported that is not below either failed verification or was not
  checked, and is marked as such.

### FIXED in this pass

#### F1 — The tool rail had no click handler at all. HIGH, CONFIRMED
`ToolRail` destructured `onPick` and never called it; the buttons carried no `onClick`
(`src/deck/ToolRail.tsx`). Four buttons with four visual states, pressable and greyed looks, and
nothing happened on a press — no message, no busy state. `ItemsPage` passed
`onPick={() => onStart(railUnit)}` into a prop that was never read, and `src/deck/README.md` stated
that pressing a tool works, so the docs disagreed with the code.

**Consequence, and it is the one that mattered:** the only working entry was the Start button, which
opened the first *unfinished* row in list order whatever was highlighted. So **rows were reachable
only in order** — a flagged row in the middle of a case could not be opened until every row above it
was finished or destroyed with Remove. For a drop where three of eight find no rim, that is the
ordinary case.

*Fixed, partly:* Start now honours a selected unfinished row and says which it will open
(`Start this item` vs `Start with the first item`). The rail's own buttons remain inert — wiring them
is per-tool entry, E4 in the design doc §10, and is the owner's next decision.

#### F2 — Remove also selected the row it had removed. HIGH, CONFIRMED
The Remove button sat inside the row's own `onClick` with no `stopPropagation`
(`src/items/ItemRow.tsx`), so a press removed the unit and then dispatched a selection naming the id
that had just gone. A wrong highlight would be cosmetic; this was not — `activeUnitChanged` with no
id switches the edit session off, which on a live dental case fed straight into F3.

*Fixed in two places on purpose:* `stopPropagation` for that press, and `selection/set` now drops ids
for units that are not in the scene, so the invariant holds whatever the next caller does.

#### F3 — Opening the next item of a case wiped the case. HIGH, CONFIRMED
`startItem`'s mode-`off` branch sent `startDental`, whose reducer cleared `dentalFinished`. The
premise was stated in a comment — *"on the first item the session is still `off`, so resetting
`dentalFinished` is correct there"* — and it is false: `finishDental` leaves the mode **off** and
keeps the finished list (`editingMode.ts`), so that branch is also how the second and later items of
a case are opened.

Finished rows lost their mark, "N items left" went back up, Start offered a finished row again — and
`exitCommands(unit, finished)` stopped sparing them, so **Exit on a reopened row removed supports
that had already been exported.**

*Fixed:* `startDental` takes `resume`, which keeps the list. The Drop page starting a new run does
not pass it, because there a reset is right.

#### F4 — Starting a row did not read it. MEDIUM, CONFIRMED
The same branch `return`ed before `startDentalAligner`, and nothing else starts the read: the
auto-start effect in `useDentalFlow` fires only on a profile **change** while already loading. So the
press landed on Step 1's "choose a file" prompt with the row's model already on the plate.

*Fixed:* the branch calls `startDentalAligner`. The walk check asserts the **absence** of the prompt,
because the badge read "Step 1" in both the broken and the fixed app.

### OUTSTANDING — verified, not yet fixed

#### F5 — Export never checks that the supports match the current orientation. HIGH
`exportRefusal`'s `unchanged(unitId)` asks only whether the unit changed *during* the export
(`vendor/mixo-geocore/host/supports/exportGate.ts`). Rotate a model after generating supports and the
supports move rigidly with it, still planted for the old down-direction; the export writes them with
no refusal. The only warning is a status line — *"Object moved with its supports. Regenerate to
re-plant supports after a rotation."* — which the next status message replaces.

The data to enforce it exists: `revisions` already stamps `orient` above `supports`, and the rail
already draws Supports as **stale**. That mark has no consumer outside the rail's display (S5), and
the rail is on the deck, where nothing is exported.

**Recommendation: refuse the export, or require a confirmation, when a unit's `supports` revision is
behind its `orient` revision.** This is the worst outcome the system can produce — a print whose
supports were planted for an orientation the operator never approved — and it is one predicate away.

#### F6 — Detection failures look exactly like success, and are absent from the tally. MEDIUM
Every row's detect sentence renders in the same muted grey, so "Already upright." and "Could not
check the orientation." are indistinguishable at a glance, and `jobSummary`'s trouble count takes no
detection input. With eight rows the operator must read all eight sentences. The underlying error
cause is also dropped (`useBatchDetect`'s `.catch(() => undefined)`).

#### F7 — A row's detect sentence never refreshes from the unit. MEDIUM
It is read from the batch map only, so a row whose rim the operator has since drawn by hand still
reads "No rim found. Draw one to continue." The rail, which reads unit facts, disagrees with the row
text beside it.

### RELAYED, NOT VERIFIED HERE

Recorded so they are not lost, each needing its own check before it is believed:

- Re-entering a worked unit re-detects and dispatches `transform/set`, discarding a hand-picked
  orientation; and Next then dispatches `dental/set` with `stamps: []`, discarding the painted area
  and the Step 3 tuning. If true this is HIGH and it feeds F5.
- "Any model" and "Open a saved project" discard a held multi-file drop silently.
- The print-angle confirm fails open: `confirmPick` returning "no tilt works" is treated the same as
  "first pick confirmed".
- The batch loop applies the profile captured when the loop started to every row queued later.
- The batch queue is not stopped by a row leaving the scene or by the deck closing.
- The row thumbnail is keyed on mesh identity only, so it never redraws after the flow rotates a unit.

### What this changes about the plan

E4 (mount the rail in the workspace, wired to `openTool`) is **not an enhancement** — it is the fix
for a dead control that the docs claim already works. And the deck now has runtime coverage for the
first time: `m4f` (Start's scope) and `m5b` (Start reads the row).

---

<a id="2026-11-08-egm-deck-rail"></a>

## 2026-11-08 — EGM review — the job deck, the tool rail, and the revisions model

*Was `docs/reviews/2026-11-08-egm-deck-rail.md`.*

**Target:** the deck increments on `main` (`src/deck/`, `src/items/`, `src/state/project.ts`'s
`revisions`), reviewed before any of the review-fix work was committed.
**Lenses:** three EGM reviews run in parallel (design, codebase details, comprehension).
**Rule followed:** every finding was re-traced against the code here before it was acted on. Two
reviewer premises were wrong and were corrected rather than adopted — `prunedThumbnails` is live, and
the four rail states do match the design.

This file is a **ledger**, not a second account. Each row says where the answer lives, because the
reasoning belongs at the code it governs and one copy is the only copy that stays true.

### What was removed

| finding | where the answer lives |
|---|---|
| `toolEntry.ts` was unreachable, hard-coded the aligner stage order, and bypassed the Step-3 confirmation | deleted; `src/deck/README.md` → "Pressing a tool" keeps all three reasons so it is not rebuilt the same way |
| `accepted`, `stillToDetect`, and a `busy` override parameter had no caller | deleted with their tests |
| `nextRevision` was exported for nothing | un-exported in `src/state/revisions.ts` |
| `aria-pressed` on four buttons that are not toggles | removed; `docs/ui-styling.md` no longer claims an open-tool look |

### What was wrong in the rules

| finding | where the answer lives |
|---|---|
| A rim that EXISTS was never stamped, so Rim could not read stale while Area did | `src/state/project.ts` → `dental/set` stamps rim and area together; `src/deck/README.md` → "Staleness" |
| An abandoned rim drawing aged the area for ever — `rim/set` fires per anchor | `project.ts`: a draft stamps nothing. A rim is accepted when promoted into `unit.dental` |
| The Tree/Braces toggle marked supports stale over a change that never moves the footprint | the `settingsOnly` flag on `dental/set`. The reducer cannot detect this itself, because `cloneDentalPolicy` rebuilds the rim — a test pins that trap |
| `oriented` was inferred from a drawn rim, which is backwards: rim drawing is entered when detection found NO rim | `src/deck/unitFacts.ts` — the docstring carries both wrong readings, since the first fix introduced the second |
| A denture was told to "draw the rim first" on a job that never draws one | `unitFacts.ts` — `isDenture`, and why a denture has no area step |
| The thumbnail uploaded the full import mesh to make a 160 px picture | `src/items/useThumbnails.ts` — `displayMesh(unit.source)` |

### What was wrong in the structure

| finding | where the answer lives |
|---|---|
| `src/state/` imported from `src/deck/` while `src/deck/` imported back: a directory cycle | `ToolId`/`TOOL_ORDER` → `src/state/tools.ts`, staleness → `src/state/revisions.ts`; `src/deckBoundary.test.ts` keeps it one-way — checked by putting the import back and watching it fail, so it is not a test that passes whatever the code does |
| Two parallel maps (`NEEDS`, `BECAUSE`) bridged by a cast | one `PREREQUISITE` record per tool in `src/deck/toolState.ts` |
| `ToolFacts.busy` shared a word with `ToolState`'s `busy` kind | renamed `runningTool` |
| `thumbnailNeeded` returned a unit but read as a boolean; a row's `shown` prop meant "the rail acts on this one" | `nextThumbnailToDraw`, and `onRail` / `items-row--on-rail` |
| The deck README argued the same rules its modules argue, with five claims the code contradicted | rewritten: 236 → 149 lines, the README is the map and each module keeps its own history |

### The walk check that was passing because of the bug

`m4d` asserted "three fresh cubes: nothing is oriented, so Orient is the only tool open and the other
three are greyed". It runs AFTER `m4b`, which waits for the batch to finish all three rows — so the
cubes had been detected and came back "No rim found". **Nothing was fresh.** The check passed only
because `oriented` was read off `revisions.orient`, which the batch never writes.

Fixing `oriented` therefore turned `m4d` red, which is the test doing its job for the first time. The
honest expectation after the batch is Orient open, **Rim open too** — the flow's answer to "no rim
found" is to hand over to rim drawing, so greying Rim would withhold the tool the operator is being
sent to — Area and Supports greyed, and the reason line the AREA's. That last assertion was
`/\w+\s+\w+/`, which only said the line had two words in it; it now names the sentence, because the
property worth pinning is WHICH tool is the next thing to do.

This is the sixth test in this release found to pass regardless of the code.

### Open, and deliberately not done

- **Copyright headers are on 15 of 226 source files.** Which way to make that consistent is a
  licensing decision, not a refactor. Recommendation: drop the 15 rather than add 211 — the build
  already emits `dist/THIRD-PARTY-NOTICES.txt`, and a header 93% of files lack teaches nothing.
- **`App.tsx` is ~1700 lines.** The real organisational debt of this release, named rather than
  quietly refactored under a review pass.
- **`drawThumbnail`'s renderer is never disposed.** Deliberate: one GL context for the app's
  lifetime, because browsers cap contexts near sixteen. The module's docstring argues it.

---

<a id="2026-11-08-egm-import-and-items"></a>

## 2026-11-08 — EGM Code Review — import, Items page, and the release mechanism

*Was `docs/reviews/2026-11-08-egm-import-and-items.md`.*

**Target:** commits `83a4998~1..c4bb62f` on `main` (12 commits, 36 files, +1520/−159)
**Reviewers:** `egm-codebase-details`, `egm-design`, `egm-implementation-readiness`, `egm-comprehension` (4 parallel lenses, deduplicated)
**Synthesizer verification:** every 🔴 below was re-traced against the code by the synthesizer, not taken on a reviewer's word.

**Counts:** 6 🔴 Blocker · 18 🟡 Major · 14 🟢 Nit

**Verdict: NOT READY.** Four blockers are behavioural and all four live in the release mechanism and the Items page — the two things this change exists to add. One is a permanent per-unit worker loop; one makes a finished unit's supports vanish irreversibly in the *ordinary single-aligner flow*, not just in a deck. Separately, the step's headline memory claim is not achieved, and the gate is substantially weaker than its numbers imply: the single most important new pipeline in the change (worker verdict → unit → row sentence) survives deleting its joining line with all 1352 tests still green.

A note on the gate evidence, which held up: `tsc 0`, `vitest 1352`, `build 0` are consistent with what we read. Two caveats. `walk 157 of 158` has a machine-dependent denominator (Nit 30). `walk:locales ALL PASS 39 checks` is true and says nothing about this release — the locale pass never visits the Items page (Major 23).

---

### Prioritized Findings

#### 🔴 BLOCKER 1 — Every released unit enters a permanent 600 ms re-check loop

* **Reviewer Lens:** `egm-design`, `egm-implementation-readiness` (found independently, identical mechanism) — **verified by synthesizer**
* **Affected Scope:** `S:/ai/mixodental/src/App.tsx:639`, with `:584`, `:601`, `:650`

```ts
// App.tsx:639 — the staleness test
return unit.supports && entry && buildSettled(unit) && (entry.unit !== unit || entry.mesh !== currentBuild(unit, built.get(unit.id)));
```
```ts
// App.tsx:584 — runCheck narrows a released build to undefined
const mesh = hasGeometry(current) ? current : undefined;
```
```ts
// App.tsx:601 — and stores that undefined on the problems entry
setProblems((current) => new Map(current).set(unit.id, { unit, mesh, items }));
```

**Discrepancy.** The two sides of line 639 can never agree once a build is released. `currentBuild(unit, built.get(unit.id))` is `latest?.unit === unit ? latest.mesh : undefined` (`vendor/mixo-geocore/host/supports/unitSupports.ts:69`); `releaseBuild` deliberately preserves the `unit` reference (`releasedBuild.ts:58`), so it returns the **truthy `KeptBuild`**. Meanwhile `runCheck` forces `entry.mesh` to `undefined`. So `undefined !== KeptBuild` is permanently true, `buildSettled(unit)` is true (a released build counts as settled, `:333`), and `unit.supports` is set. The unit is permanently `stale` → the effect schedules `runCheck` after 600 ms → `runCheck` calls `setProblems` with a **new Map** → `problems` is in the effect's own dependency list (`:650`) → the effect re-fires and schedules again. `joinRun` deletes its entry on settle, so each cycle dispatches a **new analysis-worker `check:<id>` job over the full source mesh**.

Before this change the loop converged because both sides became `undefined` together. The release path is precisely what breaks the fixed point.

**Consequence.** On a case of eight, seven finished units each dispatch a worker check every 600 ms for the rest of the session, plus a render loop — the exact opposite of the step's stated purpose. `listedProblems` (`:620-633`) is also stuck in the `uncovered(...)` branch, so `outOfDate` is permanently true.

**Second site, same defect** — `S:/ai/mixodental/src/components/useFixSpot.ts:81`:
```ts
if (!entry || entry.unit !== unit || entry.mesh !== currentBuild(unit, built.get(unit.id))) return;
```
Here the mismatch never resolves, so a pending Fix re-check never clears: `setRechecking(undefined)` is unreachable and the finding stays marked "Re-checking…" forever.

**Recommendation.** Make the two sides agree. Either store the released build as the `problems` mesh (`mesh: current`), or apply the same narrowing on line 639 (`entry.mesh !== (hasGeometry(m) ? m : undefined)`). Better: record on the `problems` entry *which build entry* was checked (`built.get(id)` — the `UnitBuild`, whose identity release does not change) rather than the mesh. Add a test that a released unit does not re-enter `stale`. Note that fixing this and Major 7 are coupled — see Major 7.

---

#### 🔴 BLOCKER 2 — Release is irreversible: a released build is never rebuilt, and reports itself as settled

* **Reviewer Lens:** `egm-design`, `egm-implementation-readiness`, `egm-comprehension` (3 of 4) — **verified by synthesizer**
* **Affected Scope:** `src/App.tsx:534`, `:333`, `:368`, `:378`; `src/plate/releasedBuild.ts:67-70`

```ts
// releasedBuild.ts:67-70 — the promised invariant
/**
 * Release every build whose unit is finished, keeping the one named by `keep` — the unit being looked
 * at, which still needs its geometry drawn. Returns the same map when nothing changed.
 */
```
```ts
// App.tsx:534 — the rebuild effect refuses an unchanged unit
if (previous && previous.unit === unit && previous.index === index) return;
```

**Discrepancy.** "The unit being looked at has its geometry" is enforced only at release time, and there is no restore path. Releasing does not change the `PrintUnit` object, so (a) `requested.current` still matches and the build effect returns early — no rebuild is ever requested; and (b) `buildSettled` is true, so `building()` is false (`:368`) — no spinner, no status, no "building" state. The sequence *finish unit 1 → inspect unit 2 → return to unit 1* leaves unit 1 permanently geometry-less **while it is the active, inspected unit**: `activeMesh` is `undefined` (`:378`), its supports are absent from `supportMeshes` (`:342-345`), `dentalRimGap` reads `'unavailable'` (`:379-383`), `runCheck` takes the "no current build" path so the check can never report clean (`:584`), and `denture.resolveAll` silently no-ops.

The commit acknowledges that releasing stops a finished unit's supports being drawn ("a visible change rather than a no-op") but not that it is **irreversible**. For a flow whose premise is "inspect one row out of eight", returning to row 3 is the common case, and the only escape is editing the unit (which makes a new object) or re-importing.

**Recommendation.** Make a released build not count as settled, so selecting the unit re-requests its build (with a visible "rebuilding supports" state); or make `keep` reactive in both directions. Then test "select a released unit → its build is requested again". If irreversibility is in fact the intent, the doc comment must stop claiming an invariant the code does not maintain, and the deck must gate re-opening a released row.

---

#### 🔴 BLOCKER 3 — Deselecting releases the unit you are *currently reviewing*, in the ordinary one-aligner flow

* **Reviewer Lens:** `egm-codebase-details` — **verified by synthesizer**
* **Affected Scope:** `src/App.tsx:357-359`, `:977`; `src/state/project.ts:146-148`; `src/dental/editingMode.ts:319-322`

```ts
// App.tsx:357-359 — keep is the CURRENT selection, which is legitimately undefined
useEffect(() => {
  setBuilt((current) => releaseFinished(current, session.dentalFinished, scene.activeUnitId));
}, [session.dentalFinished, scene.activeUnitId]);
```
```ts
// editingMode.ts:319-322 — export finishes the unit WITHOUT leaving review
case 'exportedDental':
  // The stage does NOT move: the operator is still on Step 3 and may Add another or Exit from it.
  return state.mode === 'dental' && state.dentalStage === 'review'
    ? { ...state, dentalFinished: finished(state, event.unitId) }
```

**Discrepancy.** This is the reachable-today instance of Blocker 2, and it needs no deck at all. `exportedDental` adds the unit to `dentalFinished` while the operator **stays on Step 3 reviewing it**. `scene.activeUnitId` becomes `undefined` on a plain left-click on empty space — `App.tsx:977` `if (unitId === null) return dispatch({ type: 'selection/set', unitIds: [] });` → `project.ts:146-148` `withoutActiveUnit(scene)`, driven by `vendor/mixo-geocore/editing/pick.ts:79`. The effect then runs with `keep === undefined`, and `releaseFinished` releases **every** finished unit including the one on screen. `heldBuilds`/`supportMeshes` drop it, `UnitObject` gets `supports === undefined`, `useGeometry` disposes — the supports vanish from the plate, permanently, per Blocker 2. `finishDental` has the same exposure via `withMode(..., 'off')`, which preserves `dentalFinished` (`vendor/mixo-geocore/editing/session.ts:107`).

**Consequence.** Export your one aligner, click the background to deselect, and its supports disappear for the session. The commit's acknowledgement covers *switching to another unit*; it does not cover *deselecting*, where there is no other unit to look at and nothing to free for.

**Recommendation.** `keep` must be the *last* unit looked at, not the current selection: `scene.activeUnitId ?? lastActiveRef.current`. Additionally gate the effect on a non-empty `keep` and on `session.dentalStage !== 'review'`.

---

#### 🔴 BLOCKER 4 — An all-refused drop lands on a blank Items page with no way out

* **Reviewer Lens:** `egm-design`, `egm-implementation-readiness`, `egm-comprehension` (3 of 4) — **verified by synthesizer**
* **Affected Scope:** `src/App.tsx:1467`, `:1328-1333`, `:1319`; `src/items/ItemsPage.tsx:36-71`

```tsx
// App.tsx:1467 — switches to 'items' unconditionally
onFiles={(files) => { void importFiles(files).then(() => setStartScreen('items')); }}
```
```ts
// App.tsx:1328-1333 — the only automatic escape, guarded on a non-zero previous count
if (lastUnitCount.current > 0 && unitCount === 0) {
  send({ type: 'exit' });
  setStartScreen('drop');
}
```

**Discrepancy.** `importFiles` swallows its own failures (`:854-860`), so the `.then` always runs. If every dropped file was refused, `imported.length === 0` returns early after `badFile(...)` and **no unit is added** — but the screen still switches to `'items'`. `ItemsPage` renders no Back control, installs no `onKeyDown`, and renders no primary when `next` is `undefined`; the automatic escape at `:1328` does not fire because the count was 0 all along. The operator is left on a blank page whose only working control is the language select. The refusal message is clobbered too: `:1319` rewrites the status to `START_HINT['items']` as soon as `startScreen` changes, so the one sentence naming the bad file is gone.

This also contradicts commit `198e5e3`'s claim that "every Back or Escape returns to Drop" — on this page neither does. Even in the success case the page is a dead end: `'items'` is set at exactly one place (`:1467`) and `startItem` does `setStartScreen(null)` (`:1311`/`:1314`) with nothing anywhere setting it back.

**Recommendation.** Only switch to `'items'` when the import actually added units (have `importFiles` resolve with what it added), and give `ItemsPage` the same `start-back` control and Escape handler every other start surface has.

---

#### 🔴 BLOCKER 5 — zh-Hant uses Japanese character forms, violating the Taiwan-wording rule

* **Reviewer Lens:** all four reviewers (unanimous) — **verified by synthesizer**
* **Affected Scope:** `src/locales/zh-Hant.ts:719-720`, `:723`

```ts
'Has one open edge loop.': '有 1 個開放邊縁。',
'Has {n} open edge loops.': '有 {n} 個開放邊縁。',
...
'Some faces point inwards.': '部分網格面朝内。',
```

**Discrepancy.** `縁` (U+7E01) is the Japanese *shinjitai*; Traditional Chinese is `緣`. `内` (U+5185) is the Japanese/simplified form; Traditional is `內`. The file is otherwise consistent against itself: `邊緣` appears at `:86`, `:188`, `:439`, `:470` and 30+ more; `內` at `:71`, `:148`, `:154`, `:337`. These three lines are the **only** occurrences of `縁` and bare `内` in the whole dictionary. Lines `:721-722` of the same new block even use the correct `邊` (`'有 1 個多面共用邊。'`), so the block disagrees with itself about "edge". The likely cause is a copy across from `ja.ts:714`, where `縁` is correct.

No guard catches it: `src/i18n.test.ts:132` blocklists whole mainland *words* (`MAINLAND = ['文件', '默認', …]`), never character forms, and `walk:locales`'s 39 checks never read these strings (Major 23).

**Recommendation.** `開放邊緣` and `部分網格面朝內`. Then add a character-form check beside the `MAINLAND` list rejecting `縁|内|緑|沢|増` in `zh-Hant.ts` — this class of defect will recur every time a string is copied from `ja.ts`.

---

#### 🔴 BLOCKER 6 — `src/items/README.md` says the shipped page does not exist (hard rule violation)

* **Reviewer Lens:** all four reviewers (unanimous) — **verified by synthesizer**
* **Affected Scope:** `src/items/README.md:107-111`, `:3-4`; `docs/ui-styling.md:429-458`

```md
## Not here yet

The page, the row component, its `data-ui` names and the three-language sentences — §8 steps 6a and
7b. Storing the verdict was the other half of 7b and is done.
```

**Discrepancy.** All four of those things landed in this change (`ItemsPage.tsx`, `rowText.ts`, the `items-*` names, 20 keys in ja + zh-Hant). The README was touched in this same diff without updating the section. It also never mentions `ItemsPage.tsx`, `rowText.ts`, `itemSummary.ts` or `nextItem.ts` — the four files that are now most of the directory — and `:3-4` still says the module decides "what that row says — and nothing else yet". This violates the project rule "each module has docs + tests **and the README map is updated**", and it is the single most misleading artefact in the change: a fresh reader concludes `src/items/` is a classifier only and goes looking for the page elsewhere, or builds a second one.

Two companion violations of the same rule family:
* The five new `data-ui` names (`items-row-<id>`, `items-preview-<id>`, `items-verdict-<id>`, `items-remove-<id>`, `items-start`) are **not** in the data-ui table — `docs/ui-styling.md:429` is still `| Start | start-denture |`. `docs/designer-guide.md:78` makes this mandatory: "Every element you add or touch gets a class and a stable `data-ui="name"` … **Add the name to the data-ui table in `docs/ui-styling.md`**". Neither Items nor Drop appears in `designer-guide.md` at all. Not caught by CI: `src/ui/uiStylingDoc.test.ts:49` only checks the doc *contains* the literal `'data-ui'`.
* `releasedBuild.ts` and `startDrop.ts` are new modules in `src/plate/` and `src/components/`, neither of which has a README, and neither module is named in any `.md`.

**Recommendation.** Replace "Not here yet" with the module map (one line per file), rewrite `:3-4` to say the directory owns the page, state what genuinely remains (repair's four states), add the five names to `docs/ui-styling.md`, and add `src/items/README.md` to the README map at `docs/ui-styling.md:458`.

---

### 🟡 Major

#### 7 — The memory claim the step exists for is defeated: `problems` holds the full mesh per unit

* **Lens:** `egm-design`, `egm-implementation-readiness`
* **Scope:** `src/App.tsx:487`, `:601`, `:507-512`

```ts
const [problems, setProblems] = useState<ReadonlyMap<string, { unit: PrintUnit; mesh: GeneratedSupportMesh | undefined; items: UnitProblem[] }>>(new Map());
```

`runCheck` is called by **export** (`useExport.ts:58`), and export is what makes a unit finished — so **by construction every finished unit has a `problems` entry holding its full mesh**. Entries are pruned only when the unit leaves the scene (`:507-512`). Releasing `built` frees the `built` reference only; the mesh stays reachable from React state. The commit claim "A case of eight would otherwise carry eight support meshes for the whole session; now it carries one" is therefore **not established**.

This is coupled to Blocker 1: today the accidental re-check loop happens to overwrite the entry with `undefined`, so the retention is masked. Fix the loop alone and the retention becomes permanent. **Both must be addressed together** — storing the checked *build entry* identity rather than the mesh on the `problems` entry fixes both at once.

**Answering the memory question directly:** nothing would catch release stopping to free. `buildBytes` (`releasedBuild.ts:88`) measures only the object handed to it, and `releasedBuild.test.ts:108-119` sums over the `built` map alone — any other retained reference is invisible to it.

**Cleared, for the record:** three.js *is* disposed (`src/components/viewport/geometry.ts:31` `return () => next.geometry.dispose();`; `sessionMesh.ts:23-27` releases on dispose; `displays` in meshExtras is a WeakMap). `builtRef.current = built` (`:328-329`) is a mirror of the same map, not a second retention. No worker-side copy is retained (`forgetUnit`, `:498-513`). `problems` is the one remaining holder.

#### 8 — The release condition is not maintained: `built` is missing from the effect's dependencies

* **Lens:** `egm-codebase-details`, `egm-design`, `egm-implementation-readiness`, `egm-comprehension` (all four)
* **Scope:** `src/App.tsx:351-359`

```
 * Declarative, not hung off a particular press. … every such hook is a path that can be missed, and
 * two of them are two chances to miss it. The condition is simply "finished, and not the one being
 * looked at", so it is written as that condition.
```

The effect depends only on `[session.dentalFinished, scene.activeUnitId]`. It is a one-shot reaction to two inputs, not a maintained condition. Any build that *arrives after* those last changed re-holds full geometry for a finished, non-active unit — `setBuilt((current) => new Map(current).set(unit.id, { unit, mesh }))` at `:545` and `:555` — and the effect never re-runs to release it. That path is live: a plate re-arrange, an undo, or any transform produces a new `PrintUnit`, making `previous.unit !== unit` at `:534` and scheduling a build. `usePlateArrange`'s incremental re-pack (`usePlateArrange.ts:54-68`) dispatches move commands for edited cases, which is exactly such a path. After one re-pack, a case of eight can be holding eight full support meshes again with no condition left that will release them. So the comment's "a path that can be missed" is what this design *is*, not what it avoids.

**Recommendation.** Add `built` to the deps — safe precisely because `releaseFinished` is reference-equal on a no-op, so `setBuilt` bails and there is no feedback edge — or release at the point a build lands.

#### 9 — FALSE CLAIM: "the largest thing the app holds per unit" / "makes a deck of N affordable"

* **Lens:** `egm-codebase-details`
* **Scope:** `src/plate/releasedBuild.ts:9-16`

```
 * A generated support mesh is the largest thing the app holds per unit: positions, indices, parts and
 * components. …
 * THIS IS WHAT MAKES A DECK OF N ROWS AFFORDABLE.
```

The project's own measurement contradicts the premise: `docs/design/2026-11-07-import-and-items-flow.md:1039` — "12.2 MB × N for the models alone, before supports. A cap of 8 is ~100 MB held". `unit.source` is never released; nothing in this change touches it, `src/state/project.ts:323` keeps cloning it, and undo history holds earlier scenes too. So a deck of 8 still holds ~100 MB of models. No measurement of support-mesh bytes per unit exists anywhere in the repo, so "the largest thing held per unit" is asserted, not measured — and against 12.2 MB it is very likely false. The test offered as proof measures its own 16.8 KB fixture (`releasedBuild.test.ts:42`).

**Recommendation.** State what is actually freed ("the support build, the only thing the deck adds per finished unit"), or measure a real support mesh and quote the number. Do not claim the deck is affordable until the model copies are addressed.

#### 10 — FALSE CLAIM: "the five reachable row states". Only three can reach a row

* **Lens:** `egm-codebase-details`, `egm-comprehension`
* **Scope:** `src/items/rowText.ts:71-72`, `:9-10`; `src/items/ItemsPage.tsx:49`

```ts
/** Whether this release can show the row at all — the five reachable states (§8 step 9). */
export const rowIsReachable = (row: RowState): boolean => rowSentence(row) !== undefined;
```

The only production consumer of a row state is `ItemsPage.tsx:49` `unit.diagnosis ? rowSentence(verdictOfDiagnosis(unit.diagnosis)) : undefined`, and `verdictOfDiagnosis` can return only `clean | holes | malformed`. `verdictOfRefusal`, `verdictOfRepair` and `offersRepair` have **no caller outside tests** (grepped all of `src/`: only `rowState.ts`, `rowState.test.ts`, `rowText.test.ts`, `README.md`). Structurally they cannot be reached: a row is rendered per `PrintUnit`, and a file that fails to parse or is refused by a capacity guard never becomes a unit (`App.tsx:797-800` collects it into `refused` and reports it on the status line).

So `'Could not be read.'`, `'Too many triangles for the plate.'`, `'Too large to hold in memory.'` and `'Too big for the plate.'` are **four strings translated into two languages for rows that cannot exist** — precisely what commit `b3d013a` says it refused to do for the four repair states ("giving them sentences would mean translating four strings into three languages for rows that cannot exist"). The same commit's reasoning is thus applied to one set and violated for another.

**Recommendation.** Either wire the refusal path into the page (a row per *dropped file*, not per unit — which is what the design doc's `items-row-<importId>` assumes), or say plainly that three states are reachable today, that the refusal sentences are pre-work, and name where a refusal *is* reported.

#### 11 — `malformed` asserts inward faces without consulting `windingConsistent`

* **Lens:** `egm-design`
* **Scope:** `src/items/rowText.ts:50-57`; `src/items/rowState.ts:58`

```ts
return row.nonManifoldEdges > 0
  ? { key: 'Has one edge shared by more than two faces.', … }
  : { key: 'Some faces point inwards.', then: { key: CHECK_IT } };
```

`RowState['malformed']` carries `windingConsistent` (`rowState.ts:58`) and **no one reads it**; the else-branch is an unguarded claim about the cause. `RepairReport.watertight` is "Closed, manifold and consistently wound" (`vendor/mixo-geocore/host/core/repairMesh.ts:56-57`), and `ImportDiagnosis` deliberately drops `nonManifoldVertices`. So a mesh that is closed, consistently wound, and non-manifold only at a **vertex** (the classic bowtie) arrives as `watertight:false, boundaryLoops:0, nonManifoldEdges:0, windingConsistent:true`, and the row tells the operator "Some faces point inwards." about a file whose winding is fine — the same class of absurd sentence `b3d013a` claims to have eliminated. The state machine carries the discriminating field and the text ignores it: the mapping is total but **misleading**, which is the hole in it.

The engine's exact `closed`/`watertight` semantics for vertex-only non-manifoldness is **UNVERIFIED** (the Rust source is not vendored). The code-level defect is not.

**Recommendation.** Branch on `windingConsistent` and add a third sentence, or carry `nonManifoldVertices` into the verdict, rather than inferring winding from an edge count of zero.

#### 12 — FALSE CLAIM (partly): the four narrowings. Three are sound; `useFixSpot` is not

* **Lens:** `egm-codebase-details`, `egm-design`, `egm-implementation-readiness` (converging)
* **Scope:** `src/components/useFixSpot.ts:81`

**Three of the four claims verified TRUE, field by field** — `plateLayout.ts:28-37` reads `footprint` only; `usePlateArrange.ts:44`/`:57` forwards without reading; `useExport.ts` touches the map only at `:45`/`:84`, both passing through to `planExport`/`unitContacts`, whose own parameters are `BuiltSupports` (`vendor/.../unitSupports.ts:73`, `:88`). `KeptBuild` is a superset of `BuiltSupports`, and release preserves `footprint`/`dropped`/`droppedByZones` **by reference**. Also TRUE: "`UnitBuild` was already generic" (`unitSupports.ts:59`). These are real seams, not cosmetic type changes, and each carries a comment stating *why* it was narrowed — the clearest work in the change.

**The fourth is the error.** `useFixSpot.ts:81`'s comment says the parameter is "compared by identity only … so a released build is a valid entry". Identity comparison against a *released* value is exactly what is not valid: it compares a `problems` entry's full mesh against a possibly-released build, so the recheck silently bails and "Re-checking…" never resolves (Blocker 1, second site). The safety argument is incomplete precisely where it is stated most confidently.

#### 13 — FALSE CLAIM: `releasedBuild.ts`'s header asserts a consumer map the same commit retracts

* **Lens:** `egm-design`
* **Scope:** `src/plate/releasedBuild.ts:24-25`

```
 * `BuiltSupports`, — one compares identity, and the fifth, `src/viewport/types.ts`, does not exist.
 * The single real geometry reader is the active unit's mesh in `App.tsx`.
```

The commit message for this very change states the opposite: "my own claim was wrong too, and the compiler said so: I said activeMesh was the only real geometry reader. The union named FIVE, including supportMeshes". And the file that "does not exist" exists under a different path and is a genuine full-geometry consumer — `src/components/viewport/types.ts:23` `supportMeshes: ReadonlyMap<string, GeneratedSupportMesh>;`. A module header that confidently states a false consumer map is worse than none: the next reader narrowing a parameter will trust it. The corrected list is the most useful artefact of this step and currently exists only in a commit message.

**Recommendation.** Replace lines 18-29 with the corrected list: `activeMesh`, `supportMeshes`, `problems`, and the two identity comparisons.

#### 14 — `takesOne: false` is not an arity option: it flips the drop out of the dental path and refuses it outright

* **Lens:** all four reviewers
* **Scope:** `src/App.tsx:721-744`, `:823`, `:1463`

```ts
const dentalDrop = acceptsDentalDrop(sessionRef.current) && (options?.takesOne ?? true);
```

The JSDoc claims only that "`takesOne` overrides the Step 1 rule that a drop is ONE aligner." But `dentalDrop` gates five further behaviours in the same function: `replacesPlate` (`:729`), whether a bad file reaches `dentalBadFile` (`:733`), **whether the import is refused outright** (`:736` `const refusal = dentalDrop ? undefined : importRefusal(sessionRef.current.mode);`, and `importRefusal` returns a refusal for any mode other than `'off'` — `vendor/mixo-geocore/editing/status.ts:92`), whether `dentalLoading` is sent (`:744`), and `:823` `if (!dentalDrop) send({ type: 'leave' })` — which **leaves the open mode**.

So with `takesOne: false` while a dental session is live, the drop imports **nothing**: it only pulses the panel and prints "Finish editing supports first". The stated "mid-loop" case the option exists for is not fixed; it is refused. It is currently masked only because the Items page is unreachable mid-loop (Blocker 4 / Major 15). The name says arity; the flag means "this is not a dental drop".

**Recommendation.** Rename to what it switches (`dentalDrop: false`), and separate the slice from the dental-drop decision: `const dentalDrop = acceptsDentalDrop(...) && takesOne; const refusal = acceptsDentalDrop(...) ? undefined : importRefusal(mode);`.

#### 15 — The five-file fix is applied at one of the two `importFiles` call sites

* **Lens:** `egm-design`
* **Scope:** `src/App.tsx:1463` vs `:1467`

`:1463` passes `{ takesOne: false }`; `:1467` (the StartScreen path, which handles `dropAction`'s `'many'`) passes nothing and so takes the Step-1 default, slicing to one file at `:742`. The StartScreen `'many'` action therefore still becomes a one-file import whenever `acceptsDentalDrop` is true (`src/dental/editingMode.ts:353-355`) at the moment of the drop — the exact regression commit `f6fece5` says it ended. Reachability of "start screen open while stage is `aligner`" is **UNVERIFIED**, but the asymmetry is a latent hole: the option exists to make the rule explicit and one of the two callers forgets it.

#### 16 — The verdict→row pipeline is tested link by link and never joined: deleting the carry-over breaks nothing

* **Lens:** `egm-implementation-readiness`
* **Scope:** `src/state/import.ts:112`

```ts
...(item.diagnosis ? { diagnosis: item.diagnosis } : {}),
```

**Mutation: delete this line entirely. All 1352 tests still pass.** `src/state/import.test.ts` does not mention `diagnosis` at all (grepped); `project.test.ts` hand-builds `{ ...unitA, diagnosis: verdict }`; `ItemsPage.test.tsx` hand-builds `unit('u-a','upper.stl', verdict())`; `rowState`/`rowText` are pure fixtures; and walk m2–m5 assert rows, names, size and count but **never the verdict sentence** (`Grep "items-verdict|\.verdict" scripts/walk.mjs` → nothing). The row would silently say nothing about mesh health forever and the gate would be green. This is the most important new pipeline in the change and it has no joining test.

**Recommendation.** One test over `placeImportedUnits` asserting the diagnosis reaches the unit *and* that `diagnosis.triangles === unit.source.indices.length / 3` — that identity is the premise of the staleness gate and is currently assumed, not asserted. Plus one walk assertion on `.items-row .verdict` text.

#### 17 — `takesOne` has no test and no walk check at all

* **Lens:** `egm-implementation-readiness`
* **Scope:** `src/App.tsx:728`, `:1463`

`Grep takesOne` across `*.{ts,tsx,mjs}` returns four hits, **all in `src/App.tsx`** — zero in any test, zero in the walk. The flag the whole "a five-file drop must not collapse to one file" argument rests on is entirely unexercised, and per Major 14 its real behaviour is not what its doc says. Walk m2 does not cover it: `:1467` passes no options, and on the Drop page `acceptsDentalDrop` is false anyway, so the slice never engages there.

#### 18 — The load gate is shape-deep, and both it and its docs overstate what it catches

* **Lens:** `egm-design`, `egm-comprehension`
* **Scope:** `src/state/project.ts:355-360`; `src/items/README.md:103-105`; `src/state/diagnosis.ts:28-31`

```ts
// THE STALENESS CHECK, and the reason `triangles` is in the verdict at all: a verdict describing a
// different mesh than the one it is attached to is worse than none, because the row states it as
// fact. Dropped, not thrown on, for the same reason as the rest of this gate.
if (found.triangles !== source.indices.length / 3) return {};
```

**Answering the owner's direct question first: no, a valid verdict is not wrongly dropped.** Verified: the verdict is computed on `item.mesh` at full resolution (`importWorker.ts:65`) and `placeImportedUnits` sets `source = item.mesh` (`import.ts:93`), never the decimated `display`. The `triangles` gate does **not** spuriously drop verdicts for heavy meshes. The destructure-before-spread fix at `project.ts:320`/`:338` is correct and its comment's reasoning is right. Validation-on-load is the right layer and dropping rather than throwing is well argued. `project.test.ts:370` and `:387` are genuine positive controls.

Three real gaps:
* **It is a triangle-*count* comparison, not a staleness check.** A repair that fixes winding only — `windingConsistent`, exactly the `malformed` sub-case `rowText.ts:48-57` exists for — preserves the count exactly, so the stale verdict passes the gate and the row keeps saying "Some faces point inwards." about a mesh that no longer does. Both the README ("it is what will make repair safe to write") and `diagnosis.ts:28-31` ("compare the verdict against the mesh it is attached to and drop a mismatch") overstate this. The step-9 author will trust the gate and not replace `PrintUnit.diagnosis` on repair.
* **The only non-shape check is a value the file's author also controls.** A hand-edited project writing `watertight: true` plus the correct triangle count gets a believed `clean` verdict and the row says "Ready to print." about a mesh the engine never diagnosed. Nothing re-diagnoses on load. Tolerable while the verdict only renders, but nothing records "never gate on a loaded verdict" — and step 9's repair is planned to act on it.
* **The invariant lives only in this `if`.** `ImportDiagnosis` is structurally seven independent numbers and booleans; nothing stops a future caller constructing one with a mismatched count. This project has already been bitten twice by counts that lived only in prose (commit `25a3520`).

**Recommendation.** Say what the gate does and does not catch, in all three places. Record the pairing as a constructor (`diagnosisFor(mesh, report)`) so the only way to obtain an `ImportDiagnosis` is through it, and note at the read site that a loaded verdict is self-reported.

#### 19 — A second drop handler on the Items page, diverging from the module written to prevent exactly that

* **Lens:** `egm-design`, `egm-comprehension`
* **Scope:** `src/items/ItemsPage.tsx:38-42`

```tsx
onDrop={(event) => {
  event.preventDefault();
  const models = [...event.dataTransfer.files].filter(isModelFile);
  if (models.length > 0) onFiles(models);
}}>
```

`src/components/startDrop.ts` was created precisely so "deciding what a drop MEANS" lives in one tested place, and `ChooserScreen = Exclude<StartScreenId, 'items'>` is justified at `StartScreen.tsx:21-25` as keeping "`dropAction`'s screen argument honest, since the Items page has no drop behaviour of its own". It has drop behaviour, written inline, and it diverges: a `.mixodental` project file wins over models in `dropAction` (`startDrop.ts:50-51`) and is **silently discarded** here; and a drop of non-models produces no `onUnsupported` message at all — the user gets nothing, not even an error. That is the same silent-discard class this change exists to end.

**Recommendation.** Move the accept rule (`isModelFile`) down into a leaf both can import and give `ItemsPage` the same `onProjectFile`/`onUnsupported` callbacks. Note that calling `dropAction` directly would deepen an existing backwards edge — `ItemsPage.tsx:9` already imports `isModelFile` from `../components/startDrop`, which drags component-layer drop policy into `src/items/` and works against the mixomesh extraction.

#### 20 — `isModelFile`'s doc comment is false twice, and a `.glb` is silently discarded

* **Lens:** `egm-comprehension`
* **Scope:** `src/components/startDrop.ts:37-38`

```ts
/** The models this app accepts. Binary STL only, as the file input's `accept` says. */
export const isModelFile = (file: File): boolean => /\.stl$/i.test(file.name);
```

Not binary only: the test is extension-based and ASCII STLs pass and import fine (`walk.mjs:1085-1086` drops three ASCII `cubeStl()` files on this handler and asserts three rows). Not "the models this app accepts": `acceptModelFile` (`ObjectViewport.tsx:20-22`) is `/\.(stl|glb|gltf)$/i`, and `App.tsx:1473`'s own input advertises `accept=".stl,.glb,.gltf"`. Two predicates, near-identical names, different sets, neither comment mentioning the other. Live consequence: a `.glb` dropped on the Drop page is reported unsupported, and a `.glb` dropped on the Items page is silently discarded (Major 19).

#### 21 — The Items page's `finished`-dependent code and its tests are unreachable

* **Lens:** `egm-implementation-readiness`, `egm-comprehension`
* **Scope:** `src/items/nextItem.ts:5-25`, `:36-41`; `src/items/ItemsPage.tsx:33`, `:66-68`

`'items'` is set at exactly one place (`App.tsx:1467`) and `startItem` clears it with nothing setting it back, so `finished` is always `[]` in the shipped path. Consequently `items-row--done`, `'1 item left'`/`'0 items left'`, the dropped primary and the Items-page drop are all unreachable. `nextItem`'s third parameter `justDone` is always `undefined` at its only production call site (`ItemsPage.tsx:33`), and its 20-line header documents "a *Next item* press is three ordinary calls in this order" for a press no UI offers. `ItemsPage.test.tsx:64-75` and the `finished` arms of `nextItem.test.ts` are green tests of code no operator can reach. `App.tsx:1315`'s `addAnotherDental` review branch is dead for the same reason.

Commit `1c43174` withdraws the per-item loop as superseded, so the gap is known — the finding is that the shipped modules still document the loop as working. One honest sentence closes it: "nothing returns to this page today; `justDone` is for the loop when it exists."

#### 22 — `sizeSummary` recomputes `meshBounds` per row on every render, contradicting its own doc

* **Lens:** `egm-design`, `egm-codebase-details`
* **Scope:** `src/items/itemSummary.ts:21-25`; `src/items/ItemsPage.tsx:53-55`

```ts
export function sizeSummary(mesh: TriangleMesh): Message {
  const bounds = meshBounds(mesh);
```

The module's rationale at `:15-17` — "the bounding box comes from `meshBounds`, which `placeImportedUnits` already calls for every unit it places. Nothing is computed here that the import did not compute" — is about *availability*, not reuse. The bounds are never stored: `src/state/import.ts:77` computes them locally and discards them. So this is a fresh full pass over the positions of up to 8 models at 12.2 MB, unmemoised, on the main thread, repeated on every re-render of the page (`finished` changing, language change, any parent render). The memory argument against thumbnails was honoured; the CPU cost of its replacement was not measured, and the doc says the cost isn't there.

**Recommendation.** Persist the bounds on the unit at import (already computed there) or memoise per mesh in a WeakMap, as `meshExtras` does.

#### 23 — The i18n guard does not look at the Items page, and `walk:locales` never visits it

* **Lens:** `egm-codebase-details`, `egm-implementation-readiness`
* **Scope:** `src/i18n.test.ts:21`; `src/items/rowText.test.ts:84`; `scripts/walk.mjs` locale pass

Three independent gaps around the same twenty strings:
* `UI_FILES` in `i18n.test.ts:21` does not include `./items/ItemsPage.tsx`, and the globs above it auto-include only `./denture/**` and `./dental/**`. None of the page's six plain literals (`'Your files'`, `'Remove'`, `'Take this file off the list.'`, `'1 item left'`, `'{n} items left'`, `'Start with the first item'`) is scraped. They are all present in both dictionaries today (verified by hand), but commit `b3d013a` gets the division of labour wrong: plain literals are exactly what the guard would have caught, and it is not looking at the file. **Fix: add `'./items/ItemsPage.tsx'` to `UI_FILES`, or glob `./items/*.tsx`.**
* `rowText.test.ts:84` `expect([...keys].filter((key) => !(key in dictionary)), lang).toEqual([]);` checks **key presence only**. A value that is the English string, the empty string, or carries the wrong placeholder (`'開いた縁が {count} 個あります。'`) passes. This is the only guard on eleven keys × two languages. **Fix: assert each value is non-empty, differs from the key, and that its `{...}` placeholder set equals the English one.**
* The `walk:locales` pass goes Drop → file screen → Any model. None of the twenty new keys — the whole Items page plus the new Drop footer — is read in any language by any of the 39 checks. So "walk:locales ALL PASS 39 checks" is true and says nothing about this release's strings.

#### 24 — `LIMIT_TEXT` names the wrong cause, and both translators faithfully translated the error

* **Lens:** `egm-comprehension`
* **Scope:** `src/items/rowText.ts:29-33`; `src/locales/zh-Hant.ts:726`, `:728`; `src/locales/ja.ts:723`

```ts
const LIMIT_TEXT: Record<CapacityLimit, string> = {
  triangles: 'Too many triangles for the plate.',
  memory: 'Too large to hold in memory.',
  plate: 'Too big for the plate.',
};
```

Against `vendor/mixo-geocore/host/core/budget.ts`: `triangles` is `assertTriangleCapacity` (`:67`), the *editor/runtime* refusal limit — nothing to do with the plate, and its own message says "Simplify or split the model." `plate` is `assertPlateCapacity` (`:128`), "more triangles **on the plate** than the refusal limit" — a triangle **total**, not a size. "Too big for the plate" reads as physical dimensions, and both translators read it that way: `zh-Hant.ts:728 '尺寸超出底板範圍'` ("dimensions exceed the plate area") and `ja.ts:723 'サイズがプレートを超えています'` ("the size exceeds the plate") are both factually wrong, as is `zh-Hant.ts:726 '三角面數超出底板限制'`. An operator would scale or re-orient a model that was refused for triangle count. All three also state a fact with no action, where the engine's own messages carry one.

Impact is bounded by Major 10 (unreachable today), which is why this is Major and not a Blocker — but it must be fixed *before* the refusal path is wired, not after.

---

### 🟢 Nits

**25 — `bodyCount` is persisted, validated, and never read.** `src/state/diagnosis.ts:45` documents it as the fragment detector ("a plate of fragments reports many"); `verdictOfDiagnosis` (`rowState.ts:80-84`) never consults it. A file of 525 welded-apart shells — the README's own measurement at `src/items/README.md:34-35` — reports `clean` → "Ready to print." Either give it a state or drop it from the verdict.

**26 — `'1 triangles'`, pinned by two tests.** `src/items/itemSummary.ts:31-32` `({ key: '{n} triangles', vars: { n: mesh.indices.length / 3 } })` has no singular and no `toLocaleString`, while `App.tsx:1631` does both for the same quantity (`2,412,345 triangles` in the footer vs `2412345 triangles` on the row). The sibling module in this same change does plurals properly (`rowText.ts:42-44`). The defect is frozen by `itemSummary.test.ts:17` and `ItemsPage.test.tsx:44`, so fixing it will read as a test regression. Use `{ key: '1 triangle', other: '{n} triangles', vars: { n } }`.

**27 — `rowText.test.ts:49` truthiness stands in for the strings.** `for (const text of limits) expect(text).toBeTruthy();` with `:48` asserting only `new Set(limits).size === 3` — **swapping the `memory` and `plate` sentences passes.** Assert the three expected strings.

**28 — `startDrop.test.ts:39` asserts only `kind`, so the filtering is untested.** `expect(act(['notes.txt', 'a.stl', 'b.stl'])).toMatchObject({ kind: 'many' });` — mutating `startDrop.ts:54` to `return { kind: 'many', files };` fails nothing, and `notes.txt` would then reach `importFiles`. Use `toEqual` with the expected two files by name. Also untested: two project files in one drop (which wins), and duplicate names. Zero files, mixed extensions and unsupported type *are* covered (`:36-37`).

**29 — Walk s3/s4/s8 restate their own wait and cannot fail.** `scripts/walk.mjs` does `await onScreen('drop')` — which is `page.waitForSelector('.start-task')` — then `check('s3 …', await page.locator('.start-task').isVisible())`. The predicate is a restatement of the preceding await. These were `check(..., true)` before, so the commit's "rewritten to assert the new truth instead of being loosened" overstates it for s3/s4/s8: the attribution improved, the assertive power did not. (s7 and s10 *are* genuinely stronger — they add `.dental-drop` count 0 and `unitsOnPlate() === 1`.) Assert what the previous screen must no longer be true of, as s7 does.

**30 — Walk m4's name promises per-row behaviour its body never exercises.** `scripts/walk.mjs:1095-1097` reads `.locator('.items-row .preview').first()` only, so "each row carries its own size" is unproven — and with three identical cubes it would be indistinguishable anyway. The regex `/\d+ × \d+ × \d+ mm/` never asserts the triangle count, so `triangleSummary` is unasserted anywhere in the walk, contradicting the commit's "each row's own size **with the count**". Mutation that passes: return row 1's size for every row. (m2, m3 and m5 are accurate and genuinely strong.)

**31 — The walk's denominator is now machine-dependent.** `scripts/walk.mjs:911-917` skips `g` entirely when `pendingAtSwitch === 0`, so a quiet machine reports a different count than a loaded one, and "157 of 158" cannot both be true and include `g` in the denominator. `d1` acquired the same shape. **Splitting `g` did not weaken it** — `g-pre` still fails loudly, `g` still asserts hash equality, and the vacuous-pass fix is real; the residue is that "ALL PASS (N checks)" no longer pins N, so a check that stops being emitted is indistinguishable from a clean run. Print an expected-check-count assertion.

**32 — `data-ui`: the claim holds, the test does not.** Claimed: "keyed to the UNIT, never the index, **and a test rejects any index-shaped name**." The claim is true — grepping all `src/**/*.tsx` for index-interpolated `data-ui` finds none, and the five new names are unit-keyed and unique. The test is `ItemsPage.test.tsx:34` `expect(html).not.toMatch(/data-ui="items-[a-z]+-\d"/)`, which rejects names ending in a single digit; the fixtures use ids `u-a`, `u-b`, `a`, `b`, `c`, so **the regex never fires either way**, and a real unit id ending in a digit would trip it. It would catch `items-row-${index}` and miss `items-row-row${index}`. Separately, the names are unique but not *pinnable*: `ItemsPage.tsx:50` keys on `unit.id`, which is `unit-${crypto.randomUUID()}` (`App.tsx:818`) — a name no check or doc can state, only discover.

**33 — `ItemsPage`'s name cell has no `data-ui`.** `src/items/ItemsPage.tsx:51` `<span className="name" title={unit.name}>{unit.name}</span>` — every sibling cell is named and walk m3 selects by those, but the file name, the one cell an operator identifies a row by, is selectable only by class.

**34 — `StartScreen`'s JSDoc describes the screen this change deleted.** `src/components/StartScreen.tsx:28-32`: "choose the task, then the aligner type, then the file. A file dropped on the first or second screen is held until the type is chosen". `ChooserScreen` is `'drop' | 'file'` (`:26`), and `:69` in the same file says `// THE TYPE SCREEN IS GONE (plan §8 7c)`. The first doc a reader hits contradicts the body 40 lines later. (Raised as a Blocker by `egm-comprehension`; downgraded here because it is a doc defect with no behavioural consequence, unlike Blocker 6 which violates an explicit project rule.)

**35 — `'hold'` survives the screen that could ask, leaving a dead-but-live state.** `src/components/StartScreen.tsx:88-91`: `setHeld(action.file)` then `screen === 'drop' ? onStart(...)`. On `screen === 'file'` with `chosen === undefined` the file is stored in `held` and nothing consumes it; `held` is cleared only by `go('drop')` (`:63`), which this path does not call. If the screen survives the `onStart` (e.g. the aligner is refused as too heavy, `App.tsx:834-837`), pressing the Aligner card re-starts the file the operator was just told to replace (`:75` `if (held) onStart(id, held)`). Neither reviewer could construct a live route into `screen === 'file'` with `chosen` unset, so this is **UNVERIFIED as a live defect** — the dead-but-live state is not. Also: `dropAction` should return `'start'` for `screen: 'drop'` so the tested rule is the executed rule; `startDrop.test.ts` currently asserts a `'hold'` the app does not honour.

**36 — `heldBuilds` allocates a fresh wrapper per entry.** `src/App.tsx:342` `out.set(id, { unit: entry.unit, mesh: entry.mesh })`. `built.get(id)` used to return a stable entry object; `heldBuilds.get(id)` returns a new one whenever any unit's build lands. Nothing downstream appears to memoise on `UnitBuild` identity, so this is allocation only — but it is new identity-instability in a hot path. Answering the question directly: **`heldBuilds` is not recomputed too often** — it depends on `built` alone, which is necessary. Reuse `entry` behind the `hasGeometry` guard.

**37 — Assertions that cannot fail.** `rowState.test.ts:67` `expect(verdictOfDiagnosis(measured).state).not.toBe('clean');` is implied by `:66`'s `toBe('malformed')`. `itemSummary.test.ts:25-27`'s `not.toContain('-')` / `not.toContain('Infinity')` are implied by the exact-equality assertion above them. `rowText.test.ts:60` `expect(ROW_STATES.length - reachable.length).toBe(4);` is arithmetic over `:58`'s exact 5-element `toEqual` and a 9-constant literal. Harmless, but they inflate the count without adding a catchable mutation.

**38 — Two stale comments and one vestigial function.** `scripts/walk.mjs:1126` leaves a stale doc comment sitting directly above the one that replaced it, asserting the opposite ("Back from Step 1 lands on the start screen's aligner type"). Two walk check *names* still describe the deleted screen: `'s1 the app opens on the task screen'` and `'s14 a non-STL dropped on the task screen is refused'` — a reader triaging a red s1 is sent to a screen that does not exist. `src/items/rowState.ts:64` `/** The state names, for a catalogue page that must show every one of them. */` names a consumer that does not exist (`src/kit/Catalogue.tsx` does not import `ROW_STATES`). `rowState.ts:99-100` `offersRepair` reads as live policy in a release where no press exists. `StartScreen.tsx:72` `const back = (): ChooserScreen => 'drop';` is a zero-argument function returning a constant.

**39 — `--small-size` duplicated as a fallback literal.** `src/styles.css:1537`, `:1540`, `:1543` use `var(--small-size, 11.5px)`. Commit `b01bbe4` spent a paragraph establishing that 11.5px *is* `--small-size`; the fallback re-states the literal the token exists to own.

**40 — `diagnosisField`'s non-object branch is untested and partly redundant.** `src/state/project.ts:351` `if (value === null || typeof value !== 'object' || Array.isArray(value)) return {};` — `project.test.ts:359-370` covers only object-shaped malformations, and deleting `|| Array.isArray(value)` changes nothing observable (an array fails the `flags` check anyway). Add cases for `null`, `[]`, `'x'`.

**41 — UNVERIFIED: the staleness gate trusts that the engine's `triangles` equals `indices.length / 3`.** `src/state/project.ts:360` compares a WASM-reported count (`prepareImport.ts:87`, decoded at `vendor/.../repairMesh.ts:236`) against a host-computed one. The Rust source is not vendored, so neither reviewer could confirm `diagnose_mesh` reports the *input* face count rather than a count after discarding degenerate or duplicate faces. If it ever differs, a perfectly valid verdict is dropped on every project reload, silently — and the affected population is exactly the defective one. `diagnoseImported.test.ts:29` pins `triangles === 4` for a clean tetrahedron only; the non-manifold fixture at `:57-64` never checks `triangles`. Cheap insurance: add `expect(found.triangles).toBe(3)` there plus one fixture with a collapsed triangle.

**42 — Minor locale wording.** `zh-Hant.ts:716` `'從清單中移除此檔案'` drops the full stop its English key carries, where neighbours `:718-728` all keep `。`. `ja.ts:707` `'ファイルを1つずつ処理してください。'` uses an unspaced ASCII `1` where every other new ja string spaces the numeral (`残り 1 件`, `三角形 {n} 枚`). `ja.ts:713` `'Ready to print.': 'プリント準備完了。'` keeps the 準備 framing that `b3d013a` explicitly rejected for zh ("reads as a progress state… rather than a verdict about the file", hence `可列印`); if that objection was real it applies here too (`印刷可能。`). `rowText.ts:42-43`'s "open edge loop" is CAD jargon where a dental technician reads "hole".

---

### Verified Sound — do not re-spend review effort here

These were checked by two or more lenses and found correct:

* **`dropAction`, every branch** — zero files, mixed extensions, project-file-wins, case-insensitive `.stl`; `models.length > 1` cannot collide with the single path.
* **`nextItem` / `itemsLeft`** — no off-by-one; empty and all-done both return `undefined`; both draw from one shared predicate, so the "3 left vs where the press goes" drift is genuinely impossible.
* **`takesOne` does stop the one-file slice** (`.slice(0, dentalDrop ? 1 : undefined)`), and `send()` mutates `sessionRef.current` synchronously, so `startItem`'s documented three-call order really does work.
* **`releaseBuild`** — idempotent, and the key-omission reasoning for `footprint`/`droppedByZones` is right. `releaseFinished` is genuinely identity-preserving on a no-op (`:76-84`), which is the property that makes the Major 8 fix safe. `hasGeometry` keyed on `'positions' in mesh` rather than a flag is the right call.
* **Three of the four narrowings are real seams**, each with a comment stating why — see Major 12. `UnitBuild` was already generic.
* **three.js resources are disposed**, not merely dereferenced (`viewport/geometry.ts:31`, `sessionMesh.ts:23-27`); `displays` is a WeakMap; `builtRef` is a mirror, not a second retention; no worker-side copy is retained.
* **`verdictOfDiagnosis` is a true partition** (`watertight`, then `boundaryLoops`, then else), and `watertight` really is closed-and-manifold-and-wound, so the "clean ≠ no holes" reasoning holds.
* **A valid verdict is not wrongly dropped by the load gate** — the verdict is computed on the full-resolution `item.mesh`, which is what `source` becomes; the decimated `display` never reaches it. `diagnosis` survives JSON save/load, nothing in `src/` ever replaces `unit.source`, and the destructure-before-spread ordering at `project.ts:320` really is required.
* **`src/items/` holds no App state** — every input is a prop (`ItemsPage.tsx:22-34`), which keeps the mixomesh extraction viable (one backwards edge to watch: Major 19).
* **Japanese glyph coverage is intact.** Two reviewers independently enumerated every new kanji and katakana (追加始最初残件外準備完了縁個複数面共有部内側向可能結果確認読込三角形多配置大超処理対象選何作 + kana + 、。·×) against `src/assets/fonts/japanese-subset.txt`: **all present. No `npm run fonts` is owed.**
* **All twenty new keys are in both `ja.ts` and `zh-Hant.ts` with matching placeholders.** Note `src/locales/en.ts` does not exist — English is the key itself via `?? key` — so "all three dictionaries" means two files plus the keys.
* **Prose is ranged left.** No `text-align: center` on any run of words in the new CSS; `.items-page` (`styles.css:1535-1555`) and `.screen-heading` (`:1422 text-align: left`) are clean.
* **No third-party slicer name and no scan filename is added by this change.** Every file name the diff introduces is synthetic (`one.stl`, `a.stl`, `upper.stl`, `cube`).
* **The `g`/`g-pre` split is a genuine fix**, as is the `translator()` both-quote-styles fix and the `?? key` silent-fallback diagnosis. The `onTypeScreen` → `backToDrop`/`enterAlignerAgain` retarget fixes a real weakness: `.start-screen .choice-keys` is matched by the Drop page too, so the old wait was satisfied by the preceding page.

---

### Pre-existing rule violations (NOT owned by this change)

Surfaced because the constraints are repo-wide; this change does not touch these files.

* **Third-party slicer product names:** `typelab/viewer.html:149` — `<span class="peel-key owner">owner (Chitubox)</span>`; `PrusaSlicer` at `docs/superpowers/specs/2026-10-21-support-selection-design.md:42` and `docs/superpowers/plans/2026-10-21-support-selection.md:96`.
* **A named scan file**, against "content hashes only": `typelab/reviewCase.test.ts:117` — `resolve('samples/case-002/aligner002.stl')`.

---

### Smallest set that would change the verdict

1. Make `entry.mesh` and `currentBuild(...)` agree at `App.tsx:639` — store the checked *build entry* identity, not the mesh — which closes Blocker 1, its `useFixSpot` twin, and Major 7's retention together. Add a test that a released unit does not re-enter `stale`.
2. Make a released build not count as settled, so re-selecting re-requests its build (Blocker 2).
3. `keep = scene.activeUnitId ?? lastActiveRef.current`, and gate the effect on a non-empty `keep` (Blocker 3).
4. Switch to `'items'` only when units were added, and give `ItemsPage` a Back and an Escape (Blocker 4).
5. `邊縁` → `邊緣`, `面朝内` → `面朝內`, plus a character-form guard (Blocker 5).
6. Rewrite `src/items/README.md`'s "Not here yet" as the module map; add the five `data-ui` names to `docs/ui-styling.md` (Blocker 6).
7. Add `built` to the release effect's deps (Major 8).
8. One `placeImportedUnits` test for the diagnosis carry-over, one walk assertion on `.items-row .verdict`, and one end-to-end test of `takesOne: false` (Majors 16, 17).

---

<a id="2026-11-09-wiring-walk-dental-flow"></a>

## 2026-11-09 — Wiring walk — the dental flow, 2026-11-09

*Was `docs/reviews/2026-11-09-wiring-walk-dental-flow.md`.*

Reference-guided walk of the deck → flow → deck journeys. This is the companion to
`2026-11-08-cia-deck-and-flow.md`, which swept for defect classes; this one asks whether every
connection is actually wired, and whether each lifecycle ends somewhere a person can account for.

**Tier: Screen.** §4 map and §5 connections were read on 2026-11-08. **Every applicable fault class
has now been injected through the front door**, in two passes on 2026-11-09:

- **§6 — G2 and G4.** Six probes, three verified controls, three reproduced defects (W-07, W-08,
  W-09), all fixed.
- **§6b — G1, G3, G5 and G7**, once the levers those four needed existed. Five checks in 44 seconds,
  two verified controls, five defects (W-11 … W-15), four fixed here and one handed to geocore.
- **G6 is `N/A`** with the map row that proves it. Nothing is left `UNPROVEN`: G5's *timeout*, the
  last one, was retired by `__longTimerFloorMs` (§6b, `r5`).
- **§8**, the rule matrix, is now written off those runs: **ten rules `covered`** by a probe or by a
  test watched to fail, and one `N/A` with the map row that proves it. No row is left on reading.

Said plainly because the distinction is the whole point: until §6 ran, every row of §9 said `READ`,
and a register where every row is `READ` is a code review wearing an audit's clothes.

**Reference:** no external reference system does this job, so the expected path comes from the design
doc (`docs/design/2026-11-07-import-and-items-flow.md`), the ADR-style decisions in the module
READMEs, and the owner's own words. Column headers say so.

### §1 — The question, written for this system

> **A case of eight arches is dropped. Three come back with no rim. The operator draws one of those
> rims and exports that row, re-arranges the plate, rotates a finished model, and a detection result
> lands for a row they have since removed. They close the browser and reopen the project tomorrow.**
>
> **Which supports does each row now have, planted at which orientation, and do the plate, the rail,
> the row's own sentence, the saved file and the exported STL all agree about it?**

That sentence is the audit. A feature list cannot answer it: every function in it works alone, and
four of the defects found yesterday lived in the gaps between them.

### §4 — The lifecycle state map

"Our path" is from the code and from this session's reading, never from the docs. `path:line` where
it is code; `UNVERIFIED` where I have not checked.

| Lifecycle | Expected path (design doc / owner) | Our path | Failure / retry path | Operator-visible result |
|---|---|---|---|---|
| **Intake — drop** | accept → refuse or place on plate | `components/useImportFiles.ts` (`importFiles`); budget refusals by triangle, memory and plate ledger | a refused file becomes a ROW (`RefusedRow`); a drop where every file fails keeps the Drop page | refusal row, and the status line |
| **Intake — purpose** | purpose per RUN, before detection | Drop page keys → `startDental`/`batchProfile` (`App.tsx`) | **GAP:** "Any model" and "Open a saved project" bypass `choose()`, so a held batch is discarded silently (ledger, relayed — not yet verified) | none — the workspace opens empty |
| **Detection** | one `dentalOrient` per row, serialised by triangle budget | `items/useBatchDetect.ts`; per-row `DetectState` | a row's job failing → `failed`; the next row still runs | the row's own sentence; **tone added 2026-11-08** so trouble no longer reads like success |
| **Flow — orient** | read → detect → review → accept | `components/useDentalFlow.ts` `startAligner`, `next` | no rim → hands over to rim mode; no result → `failed` notice | the dock, Step 1 |
| **Flow — rim (detour)** | enter → place/adjust → close → Done | `dental/rim/`, stage `rim` | Cancel keeps the drawing; `dental.rim.enter` returns to it | the mode's own `rim-why` line |
| **Flow — area** | paint/erase → accept | stage `area`; `dental/set` on accept | **GAP:** accept REPLACES the policy (`stamps: []`, default tuning), destroying painted work with no confirm | none — silent |
| **Build** | request → debounce → worker → mesh | `components/useSupportBuilds.ts` (120 ms settle; `requested` guards late arrivals) | rejection → `failedBuilds` + status | counts stop waiting; status line |
| **Check** | request → worker → findings | `components/useSupportChecks.ts`; findings tied to unit version AND build | 600 ms re-check on change; errors → status | the Problems list, greying while stale |
| **Export** | plan → full-resolution build → write | `components/useExport.ts` | refusals: `stale` (changed mid-export), `failed`, `inconclusive`, **`replant` (added 2026-11-09)** | status line only |
| **Retention — project file** | pack → write → read back | `components/useProjectFile.ts`; revisions and `rimDraft` validated on load | `saved.current` records what was packed | status line |
| **Reversal — undo/redo** | command → inverse | `state/history.ts`, scene history | undo floor is the step's start | the Undo toast |
| **Reversal — Back / Cancel / Exit** | step out, keep what was accepted | `dental.back` (Step 1 → the case, 2026-11-08), `dental.exit` → `exitCommands` | **GAP:** Exit strips supports of a unit not in `dentalFinished`; the list is session state and was resettable (fixed 2026-11-08) | none for Exit — no confirm |
| **Reversal — Remove a row** | row leaves, nothing else changes | `unit/remove`; selection guarded (fixed 2026-11-08) | **GAP:** no confirm and no undo offer, unlike `deleteUnits` | the row disappears |

### §5 — Seven questions, per connection on the primary flow

`Y` = evidence found this session. `n` = no. `?` = UNVERIFIED at this tier.

| Connection | Q1 invoked | Q2 persisted | Q3 retry-safe | Q4 one authority | Q5 can stop unseen | Q6 operator screen | Q7 connection test |
|---|---|---|---|---|---|---|---|
| Drop → import → plate | Y | Y | Y (ledger) | Y | n/a | Y (refused row) | Y (walk `m`) |
| Purpose → detection | Y | Y | ? | **n** — the batch keeps the profile captured when the loop started | ? | n | n |
| Batch → row state | Y | Y (states map) | Y (`started` set) | Y | **n** — a never-resolving job leaves later rows `waiting` for ever | Y (tone, 2026-11-08) | **n** |
| Row → rail facts | Y | n/a | n/a | Y (unit facts, 2026-11-08) | n/a | Y | Y (`unitFacts.test`) |
| **Rail button → open the tool** | **n — DEAD, no handler** | n/a | n/a | n/a | n/a | n | **n** |
| Start → open a row | Y (2026-11-09) | Y | ? | Y | n/a | Y | Y (walk `m4f`, `m5b`) |
| Orient accept → policy | Y | Y | **n** — replaces painted stamps and tuning | Y | n/a | **n** | n |
| Unit change → build | Y | Y | Y (`requested` identity) | Y | n | Y (counts, status) | Y (`useSupportBuilds` guards) |
| Build → check | Y | Y | Y (600 ms, map identity) | Y | n | Y (Problems) | Y (walk `x9b`) |
| Revisions → export gate | Y (2026-11-09) | n/a | n/a | Y | n/a | **n** — status line only, replaced by the next message | Y (`revisions.test`) |
| Export → STL | Y | Y | Y (refusals) | Y | n | Y (status) | ? |
| Scene → project file | Y | Y | Y (idempotent pack) | Y | n/a | Y (status) | Y (`projectFile.test`) |

### §6 — Fault injection: G2 (replay) and G4 (two actors on one scarce resource)

Run 2026-11-09 on `0119849`, Screen tier, through the **front door** — the file input, the purpose
key, the row's own controls — in headless Chromium against the real app. The harness is
`npm run walk -- --only=q` (`scripts/walk.mjs`, section `q`); the logs are
`artefacts/2026-11-09-screen/walk-q-fault-injection{,-2}.txt` and the run's identity (HEAD, node,
playwright, the fixture's sha256 and triangle count) is `artefacts/2026-11-09-screen/identity.txt`.
**Those files are committed**, along with `walk-full-2.txt` — the full walk that ran after the fixes
and is the evidence they hold — because a table that cites evidence nobody can open is the defect
this audit is about. The suite and build logs of the same runs are not: they are reproducible from
the commit, and 47 kB of test output is not evidence of anything a count does not say.

**Two runs, and the second is the one to read.** The first (`…-fault-injection.txt`) failed `q3` on
the check rather than the app (`presses 0` - it hunted for a button whose textContent was exactly
"Aligner" and found none) and passed `q6` on an outcome worse than the one it was looking for. Both
are kept rather than replaced: the counts a check returns about its own injection are what let a run
say "this proved nothing" instead of "this passed".

**The only two acceptable outcomes**, applied to every row: the system recovers by itself to a state
every observer agrees on, or the problem is on the operator's screen in words they can act on.
A silent wrong state passes neither, and **a status line the next message replaces is not a screen**.

| # | Fault | Site | Injection | What happened | Verdict |
|---|---|---|---|---|---|
| **G4** `q1` | Two actors on the last of a scarce quota | the plate's 6M-triangle refusal limit, `src/core/plateLedger.ts` through `useImportFiles.ts` | two drops of one 3,193,368-triangle binary STL started in the same tick (two `setInputFiles` calls, so two reservations) | exactly one admitted; the other refused with *"The plate would hold 6,386,736 triangles with heavy-3_2m.stl; the limit is 6,000,000."* Plate: 1 object. | **PASS** — verified control |
| **G4** `q2` | …and is the loser still accountable? | the same | read the whole page again once the winner's 3.19M read finished | the winner's own heavy-model sentence had **replaced** the refusal. One object, a cheerful status line, no alert, no flag, nothing on screen about the refused file. | **FAIL → W-07** |
| **G2** `q3` | Replay a request | the purpose key, `StartScreen.choose` | three files held on the Drop page, "Aligner" clicked **twice in one tick** | **six rows** — `["r-one","r-two","r-three","r-one","r-two","r-three"]`. The whole case imported twice. | **FAIL → W-08** |
| **G2** `q4` | Replay a destructive command | the row's Remove, `App.tsx` `onRemove` | Remove clicked twice in one tick on row 2 of three | one row removed, and the right one: `["q-one","q-two","q-three"] → ["q-one","q-three"]`. The press is keyed by unit id, as `m3` requires of the row. | **PASS** — verified control |
| **G2** `q5` | Replay a message | every reply of the analysis worker | a page-level `Worker` wrapper re-dispatched **every** reply a second time without swallowing the first (`window.__replayWorker`); **6 replies redelivered** | every row settled once, with its own sentence; no console error, no page error. Mechanism: `WorkerTask.wire` looks the reply's job up in `this.jobs`, and a settled job is no longer in that map — idempotence by job-id registry, with `'stale'` already a named reply code. | **PASS** — verified control |
| **G4** `q6` | Two actors on one unit | the row, between the deck's list and the flow | Remove and Start aimed at the same row in one tick | `rows 0, deck pages 0, badge ""` with the GENERIC editor panels on screen, two models on the plate, nothing selected — and the status line still reading *"Drop an aligner STL… then press Next."* The dental mode was on underneath with nothing drawn to leave it by. | **FAIL → W-09** |

**G1, G3, G5, G7: `UNPROVEN` at this tier**, with the condition each needs, never "skipped" —
G1 reject the support-build write after the first commit; G3 deliver a build result before its
request; G5 time out a worker whose far side succeeded; G7 stop the batch loop longer than its
period. Each needs a fault lever the walk does not have yet (`window.__meshDelay` delays, it does
not fail or reorder). G6 is `N/A` on these journeys: no finished record points at an artefact outside
the scene — the project file packs the meshes it refers to (`useProjectFile.ts`).

#### What I expected, and what the system did

The doctrine asks for this plainly, because an audit that reports only what the runtime confirmed
has quietly deleted the evidence that its reading is fallible.

- **I expected `q1` to fail.** Reading `useImportFiles.ts` I had the hold being taken late — only
  inside `if (estimate.exact)`, and otherwise not until after the whole file was read. It is late for
  a file whose header does not say how big it is, but a binary STL's does, so on the primary path the
  ledger is reached before anything is parsed and it holds. The reading was wrong; the finding was
  never filed, and it is recorded here instead.
- **I expected `q5` to be a problem** and had `useBatchDetect`'s `.catch(() => undefined)` picked out
  as the place a duplicate would land as a `failed` row. It never gets there: the duplicate is
  dropped a layer lower, in `WorkerTask`. Named in the verified controls above rather than quietly
  dropped.
- **`q6` passed on its first run and should not have.** The check looked for one named bad outcome —
  Step 1 with the "choose a file" prompt — and came back green on `rows 0, badge ""`, which is a
  worse one. The assertion is now the positive one: after the contest the operator is on the deck or
  in a step. **A check that enumerates the bad states can only find the bad states its author
  imagined**, and this one is in the walk as a standing guard against that.
- **And then my first FIX for `q6` was wrong, which the check caught on the next run.** I guarded
  `startItem` by looking the unit up in `sceneRef.current` and refusing if it had gone. That guard
  **can never fire**: the ref is updated on RENDER, so in the same tick as the removal it still holds
  the unit. `useImportFiles` carries that exact warning about that exact ref, I had read it earlier
  in this session, and I wrote the bug anyway. Two things followed. The guard was deleted rather than
  kept, because a guard that cannot fire is a dead control wearing safety's clothes. And the real
  invariant moved to an effect on RENDERED state, which does not care which actor won or in what
  order, and which recovers from every other way a unit can leave under the flow.
- **The diagnosis itself was guessed at once and then probed.** The first reading of `rows 0,
  badge ""` was "stranded in a broken Step 1". The probe said otherwise: the GENERIC editor panels
  were on screen with the dental mode still on and no dental bar to leave it by, which is a different
  defect with a different fix. That probe cost eight minutes, which is why `--probes=q6` now exists
  and costs seven seconds — **a diagnosis that costs eight minutes a question gets guessed at instead
  of asked.**

### §6b — Fault injection, second pass: G1, G3, G5 and G7

Run 2026-11-09, Screen tier, through the front door in headless Chromium.
`npm run walk -- --only=r` (`scripts/walk.mjs`, section `r`), **59 seconds for all eight checks**;
`--probes=rN` runs one.

These four were `UNPROVEN` in §6 for a single reason, and it is worth stating because it is the
shape of most "we could not test that": **the only lever the walk had could DELAY a reply, and none
of these four faults is a delay.** Two levers were built, and then all four ran the same afternoon.

| Lever | What it does | Serves |
|---|---|---|
| `window.__faultHold` + `__faultRelease(order)` | every SETTLING reply from the named worker is swallowed and kept; the walk says when each is delivered, and in which order | G3 (newest first), G5 (with the crash below), G7 (never released) |
| `window.__faultCrash()` | the worker errors on THIS side, which is what `WorkerTask.wire`'s `onerror` sees | G5's local half |
| `window.__faultDownload = n` | the n-th `<a download>.click()` is refused | G1 |
| `window.__longTimerFloorMs = ms` | any timer of a minute or more fires after `ms` instead | G5's **timeout**, which is ten minutes in the app |

`__faultDownload` is not a worker lever and that is the finding behind it: the export's reply has
long settled by the time the first file commits, so **no worker lever can reach the write that
follows a write**. A fault class with no lever is not a fault class with no site.

| # | Fault | Site | Injection | What happened | Verdict |
|---|---|---|---|---|---|
| **G1** `r1` | A write rejected after an earlier one committed | the export's file loop, `useExport.ts` | two objects, "Each object with model", the second download refused | the first file was in the operator's downloads and the app said *"Export failed (…). **Nothing was saved**; try again, or export one object at a time."* — false, and the advice would have written the landed file twice | **FAIL → W-11** |
| **G3** `r2` | A reply before its predecessor | the analysis pool, the batch's orient against the flow's | both settling replies held, the NEWER released first | every observer kept its own answer: the flow's screen and the model's rotation matched the clean run exactly, down to the holes notice | **PASS** — verified control |
| **G5** `r3` | The far side succeeded, this side gave up | `AnalysisClient` + `WorkerTask.restart` | the worker crashed on this side with its answer still held, then the answer released into a client that had given up | the row settled once and stayed settled; the late answer landed nowhere; the batch drained past it and the second row got its own verdict; nothing thrown | **PASS** — verified control |
| **G5** `r3b` | …and can the operator read it? | the background-work list | the same run, reading the screen | **two defects.** The list is inside the viewport, which is not rendered while a start screen is up — so on the deck it did not exist. Mounted, it then explained an orientation check as a support build | **FAIL → W-12, W-13** |
| **G7** `r4` | The background job stops | the batch loop, `useBatchDetect` | every orient answer swallowed, twenty seconds (a cube's check takes one or two) | the rows read as pending, never as a verdict; Start and Remove both still worked; a Cancel was offered. But the background-work row read `Aligner oriented · 100%` and goes on reading it for ever | **PASS**, with a gap handed to geocore (W-14) |
| **G5** `r5` | …and now the TIMEOUT itself | `WorkerTask.timeout` → `restart`, the path the ten minutes really take | the answer held, and the job's own ten-minute timer brought forward to 1.5 s | both rows failed and **stayed** failed when their answers arrived afterwards; the activity list said *"Checking this model took too long and was stopped. The model is unchanged; open it to run the check again."* — the detection vocabulary W-13 bought, not a support build | **PASS** — verified control |
| **—** `r6` | External input acted on unverified | `binaryStlTriangles`, `core/import/stlHeader.ts` | a 184-byte binary STL whose header claims **four million** triangles | the header is ignored and the file's own size decides: **2 triangles counted**, four million never mentioned, the plate budget never consulted | **PASS** — verified control |
| **—** `r6b` | …and the shape that really is damaged | the same | 185 bytes, so the body is not a whole number of 50-byte facets | refused as *"a damaged STL file: its size does not match its triangles. Export it again"*, nothing landed, and no budget vocabulary | **PASS** — verified control |

**G5's timeout was `UNPROVEN` for about an hour, and then it was not.** The app's real form is
`ANALYSIS_TIMEOUT_MS` — ten minutes — so `r3` injected the local half as a crash and the swap was
named rather than hidden. The condition that was missing turned out to be four lines:
`__longTimerFloorMs` clamps the DELAY of any timer of a minute or more, never which callback runs, so
`r5` exercises the same `WorkerTask.timeout` → `restart` path the ten minutes would. **Nothing in
this app waits a minute on a timer except the job timeouts**, which is what makes the clamp precise
enough to be honest.

**G6 remains `N/A`** with its map row: no finished record points at an artefact outside the scene —
the project file packs the meshes it refers to (`useProjectFile.ts`). Recheck if that ever changes.

#### What I expected, and what the system did

- **I expected `r1` to find a vague sentence. It found a false one.** My prediction was that the
  generic "the export failed" would be unhelpful beside a partial write. It was worse than that: it
  states that nothing was saved while a file is on disk, and offers an action that would duplicate
  it. A finding that is worse than the reading that motivated the probe is the argument for probes.
- **`r2` passed on its first run and proved nothing, which is the third time in two days.** The
  helper that decided "both rows have settled" asked only for non-empty text — so with every answer
  held, the baseline read `["Checking the orientation…", "Waiting its turn…"]`, and the probe's
  anti-vacuity guard ("the two answers must differ") was satisfied by two sentences that both mean
  *I do not know yet*. A pending sentence must never satisfy a check about what was decided. The
  reader now refuses one, and `openCubeStl` exists so the two models give genuinely different
  verdicts.
- **Fixing W-12 created W-13, and that is why they are one commit.** Mounting the list on the deck
  put a sentence on screen that had been unreachable: every dental analysis kind inherited the
  "support build" vocabulary, because `failureText` defaulted an unknown context to `build`. A defect
  that only a fix can expose is an argument for fixing in the same pass that found it.
- **`r4` corrected me twice.** I had written in the probe that the batch offers no Cancel, because
  `useBatchDetect` passes no signal; `AnalysisClient` passes one of its own, so it does. And I had
  not predicted the stuck row at `100%` at all.
- **The gate for the increment this pass was meant to confirm was itself broken.** `npm run wasm:test`
  asserted `engineVersion() === 14` against an engine at 63, so it had been failing on its first line
  since engine 15 and nobody had run it. The vendor bump the owner approved had already landed in
  `cb575b6`; what had not landed was a gate that could have said so.

### §8 — The rule traceability matrix

One row per rule, not per function. **`Proof` is a run from this audit** — a walk probe, or a unit
test that was watched to fail — and `Outcome` is `covered` only where that proof ran and passed.
Where a rule is real and the proof is not, the row says so and names the missing condition. This one
has no such rows left — but it did when it was first written, and both were retired the same day by
building what they asked for rather than by lowering the bar: `__longTimerFloorMs` for the timeout,
a 184-byte fixture for the lying header. **A matrix with no `UNVERIFIED` rows is only worth reading
if the rows got there by being run.**

| Rule | Code that enforces it | Connected systems | Proof (this audit) | Outcome |
|---|---|---|---|---|
| One accepted request leads to exactly one unit of work | `StartScreen.claimHeld` (a ref read-and-emptied in one statement); `WorkerTask.wire` resolves a reply out of `this.jobs`; `ItemRow`'s Remove keyed by unit id | start screen, import, analysis pool, deck | walk `q3` (purpose pressed twice → 3 rows, not 6), `q4` (Remove replayed), `q5` (6 replies redelivered) | **covered** |
| Two actors on the last of a scarce quota: one wins, the loser is told | `PlateLedger.hold` checks scene + every other hold + its own in one synchronous step; `useImportFiles.listBudgetRefusal` | import, plate ledger, status line, activity list, deck rows | walk `q1` (3.19M × 2 against a 6M plate), `q2` (the loser still accountable) | **covered** |
| A reply's ORDER never decides which observer gets it | `WorkerTask.wire`'s job-id registry; `AnalysisClient`'s keyed slots; `useDentalFlow`'s `stale()` token and `activeUnitId` check | analysis pool, deck, flow | walk `r2` (two orients in flight, newer released first) | **covered** |
| Every accepted item reaches a terminal state or a visible queue | `useBatchDetect`'s serial drain; `detectState` (`waiting` says so, W-03); `ANALYSIS_TIMEOUT_MS` behind it | deck rows, analysis pool | walk `r3` (the queue drained past a failed row), `r4` (pending reads as pending) | **covered** |
| Every unresolved state reaches an operator, on a screen that keeps it | the row's own sentence; `JobActivity` (never drops a failed row) — now mounted on the deck | deck, background-work list, status line | walk `r3b`; `q2` and `r1` are the same rule from the import and export sides | **covered**, with W-14 handed to geocore |
| A failure is explained in ITS OWN vocabulary, not a neighbour's | `analysisJobVocabulary` (total by type); `exportOutcomeText`; `JobActivity.failureText` | activity list, status line | walk `r3b`; `analysisJobVocabulary.test.ts` and `exportOutcomeText.test.ts`, both watched to fail first | **covered** |
| What the operator is told about a WRITE is true | `useExport`'s write loop records what it handed over; `exportPartialText` | export worker, browser, status line, activity list | walk `r1` | **covered** |
| A reversal never exceeds what was done, and never strands the operator | `onRemove` + the undo offer (W-06); the invariant effect "the flow cannot be open on a unit that is not on the plate" (W-09) | deck, scene, session, flow | walk `q4`, `q6` | **covered** |
| External input is never acted on unverified | `binaryStlTriangles` ignores a header whose records do not fit and lets the FILE'S SIZE decide, so a claimed count can never inflate the budget; a size that is not whole facets is refused as damaged | import worker, plate budget, status line | walk `r6` (a header claiming 4,000,000 triangles counted **2**, four million never mentioned) and `r6b` (185 bytes → *"a damaged STL file"*, nothing landed) | **covered** |
| A dependency that times out while the far side succeeded is reconciled, never doubled | `WorkerTask.timeout` → `restart`; `settle`'s `job.done` guard; `restart` nulls the worker's `onmessage` | analysis pool, deck, background-work list | walk `r5` — the real timeout, brought forward by `__longTimerFloorMs`: both rows failed, STAYED failed when their answers arrived, and said they had timed out. `r3` is the same disagreement reached by a crash | **covered** |
| A delivered artefact stays retrievable | — | — | **`N/A`** with the map row: no finished record points outside the scene; the project file packs the meshes it refers to (`useProjectFile.ts`) | `N/A` |
| A detector is proved to be LOOKING (S20) | `i18n.test.ts` (scope widened to `src/components`, W-10); `geometry-wasm-smoke.mjs` (now compares against `HOST_GEOMETRY_VERSION`) | the guards themselves | W-10 and W-16: an untranslated sentence planted in a new module, twice, and the widened guard named it both times. W-15: the smoke gate was asserting `=== 14` against engine 63, so it had been failing on its first line since engine 15 | **covered** |

### §9 — Gap register

**Proof status is now evidence, not reading.** `REPRODUCED` means a fault injection in §6 produced
the behaviour; `READ` means the code was read and nothing has yet reproduced it; `FIXED` names the
commit. A register where every row says `READ` is a code review, which is what this one was until
§6 ran.

| ID | Layer | Lifecycle | Connection / rule | Location | What breaks | Proof | Severity |
|---|---|---|---|---|---|---|---|
| W-01 | L2 | Flow — area | Orient accept → policy | `components/useDentalFlow.ts:320` | Accepting an orientation replaced the dental policy with `stamps: []` and default tuning, destroying the painted support area and the Step 3 tuning with no confirmation. | **FIXED** `5dc3376` | HIGH |
| W-02 | L2 | Rail | Rail button → open the tool | `deck/ToolRail.tsx`, `items/ItemsPage.tsx:120` | Two halves. The buttons had no `onClick` at all (fixed `a9b52b0`); and `onPick` then **discarded its tool argument**, so all four buttons did the one thing — open the model at the start of its flow. | **FIXED** (both halves; E4 below) | HIGH |
| W-03 | L3 | Detection | Batch → row state | `items/detectState.ts` | A queued row drew the **same blank** as a row the batch had never heard of, so "waiting its turn" and "nothing is happening to this row" were one picture. *Corrected from the first reading:* the queue cannot block for ever — the analysis worker's own per-job timeout (10 min, `analysisClient.ts`) fails a stalled job and the loop moves on. The blank was the whole defect. | **FIXED** | MEDIUM |
| W-04 | L3 | Purpose → detection | one authority | `items/useBatchDetect.ts` | A row queued after a second drop was detected under the first drop's purpose. | **FIXED** `5824f4d` | MEDIUM |
| W-05 | L2 | Export | Revisions → operator | `components/useExport.ts` | All four export refusals reached only a status line the next message replaced, with no persistent record that nothing had been written. | **FIXED** | MEDIUM |
| W-06 | L2 | Reversal | Remove a row | `App.tsx` (`onRemove`) | No confirmation and no undo offer, unlike `deleteUnits`. | **FIXED** `5824f4d` | MEDIUM |
| **W-07** | L2 | Intake | Budget refusal → operator | `components/useImportFiles.ts` | **W-05's class on the import side.** A file refused by the **budget** — triangles, memory, a full plate — is refused before any worker starts, so no activity row was ever opened and the refusal lived only in the status line. Walk `q2`: two files dropped, one admitted, and the winner's own sentence erased the other's refusal. A file refused by the **worker** was always safe, because its failed activity row is never dropped — which is the asymmetry that hid this. | **REPRODUCED** `q2` → **FIXED** | HIGH |
| **W-08** | L2 | Intake — purpose | Purpose press → import | `components/StartScreen.tsx` | `choose` read `held` out of its render's closure and cleared it with `setHeld([])`. A state setter schedules a re-render; it takes nothing away from a handler that has already closed over the old value — so two presses in one tick both released the same batch. Walk `q3`: three files, one double-click, **six rows**, each file imported twice and each duplicate counting against the plate and memory budgets. | **REPRODUCED** `q3` → **FIXED** | HIGH |
| **W-09** | L2 | Reversal / Flow entry | Row → flow, against Remove | `App.tsx` (the flow invariant effect) | Remove and Start reach one unit in one tick easily — both controls are on screen, both aimed at the row the rail shows — and `onStart` closed over a unit **object** rather than a live lookup. Every guard downstream then worked exactly as written and the operator still landed where no screen describes: the selection reducer drops an id the scene has not got, so `activeUnitId` is empty; `startAligner` abandons its orient job; `setStartScreen(null)` had already shut the deck; and the gesture that draws the dental bar needs an active unit, so no step drew either. Probe: deck gone, no badge, the **generic** editor panels up, the mode still on underneath, and the status line talking about an aligner step. Fixed by an invariant on RENDERED state — the flow closes and the deck comes back — **not** by a guard in `startItem`, which cannot see a same-tick removal through a ref that updates on render. | **REPRODUCED** `q6` → **FIXED** | HIGH |

| **W-10** | L3 | The audit's own instruments | UI string → translation guard | `src/i18n.test.ts` | **S20: the detector had a blind spot, and this audit walked into it.** The guard's scope has now been wrong three times; the file records the first two, both modules inside folders it already globbed. The third was a folder it never globbed at all — `src/components/` had a hand-written list, so a new module there owning user-facing sentences sat outside the instrument. Found because **this pass added such a module**: `exportRefusalText.ts` (now `exportOutcomeText.ts`), four refusal sentences, invisible to the guard, its name even matching `SPEAKS`. Closing it cost three `NOT_UI` entries (two font families and a modifier key) and nothing else under `src/components/` was untranslated — the shadow was in the instrument, not in the work. **Proved by planting** an untranslated sentence there: the widened guard fails on it by name, the old one passed. | **FIXED**, with a blind-case test | MEDIUM |
| **W-11** | L2 | Export — the write | Files written → operator | `components/useExport.ts` (the file loop) | **The one place the export commits more than once, and it denied doing so.** Each file is handed to the browser by its own `<a download>.click()`, so the first file is in the operator's downloads before the second hand-over is attempted. A throw in that loop went to the generic catch: *"Export failed (…). Nothing was saved; try again, or export one object at a time."* Nothing was saved was false, and "try again" would have written the landed file a second time. Every other export failure happens before a byte is written, which is why every other sentence can promise that — the loop inherited a promise it cannot keep. Chrome refuses multiple automatic downloads from one gesture, so this arrives without an auditor. | **REPRODUCED** `r1` → **FIXED** `f6daa93` | HIGH |
| **W-12** | L2 | The deck | Background failure → operator | `App.tsx` (the start-screen branch) | **The screen that remembers failures did not exist on the deck.** `JobActivityPanel` is rendered inside the viewport, and the viewport is not rendered while a start screen is up — so on the deck, where the longest background work in the app runs (one orientation check per row, minutes on a full case), a crashed analysis worker left its mark on one row's sentence and nowhere else. W-05 and W-07 were both fixed onto that list on the argument that a status line the next message replaces is not a screen; on this screen there was no list to be fixed onto. | **REPRODUCED** `r3b` → **FIXED** `873b923` | MEDIUM |
| **W-13** | L3 | The deck | Job context → failure text | `components/JobActivity.tsx` (`failureText`) | **An analysis job was explained as a support build.** `AnalysisClient` reports each job with `context: task.kind` (`dental-orient`, `dental-tilt-scan`, …); none of those is one of the five shared error contexts, and `failureText` defaulted an unknown context to `build` — so a failed orientation check on a deck row with no supports read *"The support worker stopped unexpectedly. Change a setting or generate again to rebuild the supports."* Only visible once W-12 was fixed, which is why both are one commit. | **REPRODUCED** `r3b` → **FIXED** `873b923` | MEDIUM |
| **W-14** | L3 | Background work | Stalled job → its own row | `vendor/mixo-geocore/host/workers/jobActivity.ts:221` | **A job stuck for ever reads `Aligner oriented · 100%`,** with no elapsed time: a finished job and a job that will never finish draw the same row. The signal for this exists — `showElapsed` — and is wired to `state === 'indeterminate'`, the one state a job that reported progress and then stopped cannot be in. A live control that cannot fire for the failure it was written for. **Vendored geocore, which this repo consumes as built**, so it is handed over, not patched. | **REPRODUCED** `r4` → **HANDED OVER** `docs/handoff/geocore-stuck-job-elapsed.md` | LOW |
| **W-15** | L3 | The audit's own instruments | Vendored engine → its gate | `scripts/geometry-wasm-smoke.mjs` | **S20 again, and in the gate the owner named for the geocore increment.** Its first assertion was `engineVersion() === 14` against an engine at 63, so `npm run wasm:test` had been exiting on line one since engine 15 — the ABI smoke test below it has not run in forty-eight engine versions, and nothing said so. A constant frozen into a detector ages into a detector nobody runs. It now compares against `HOST_GEOMETRY_VERSION`, which is what its own message always claimed, and prints what it verified. | **REPRODUCED** (ran it) → **FIXED** `c715de8` | MEDIUM |
| **W-16** | L3 | The audit's own instruments | UI string → translation guard, again | `src/i18n.test.ts` | **The FOURTH blind spot in this guard, found on the pass that closed the third, and walked into by the person closing it.** `workers/analysisJobVocabulary.ts` was added an hour earlier to fix W-13; it owns three user-facing sentences and sits in a folder the guard had never globbed, so its translations were added by hand and nothing would have noticed a fourth sentence beside them. The pattern across all four misses is one: **the scope was always a list of the places UI text had been FOUND, never of the places it could BE** — while `speaks()` has answered the second question all along. Every folder under `src/` that could hold a `Message` is globbed now; the bill was zero `NOT_UI` entries. **Proved to be looking**, as W-10 was: a sentence planted in that module, the guard fails on it by name, the module restored byte-for-byte. | **REPRODUCED** (planted) → **FIXED** `b9297a2` | MEDIUM |
| **W-17** | L1 | The browser under the editor | — | Chromium's GPU stack, not this repo | **THE RELEASE GATE COULD NOT FINISH: the tab died.** Chromium's GPU command buffer goes invalid under SwiftShader — `GPU state invalid after WaitForGetOffsetInRange` — and takes the renderer with it, in section `a`. **Not from this pass, and not the machine:** it reproduces at `48b062d` with that commit's own `walk.mjs`, on Chromium 1243 and 1248 alike, with the JS heap at **36 MB of 3586**, four Workers made, and the browser's biggest process at **719 MB** of 61 GB. `--in-process-gpu` made it crash sooner and `--disable-gpu-watchdog` changed nothing. **The pattern that did show is LOAD:** every crash happened while a test suite, `gate:real` or another walk ran beside it, and the run on an otherwise idle machine walked straight through `a`. A software rasteriser is CPU-bound, and starving it is the one thing all five crashes had in common — so the walk is non-parallel with any other suite, the way this project already treats the test suite. The cause is narrowed, not closed. What is fixed is the gate's RESPONSE: one dead tab used to take 170 other checks with it, so a crash in the first section hid every answer the walk had. The run now retries the dead section once in a fresh browser and then carries on from the next, as often as it must — and **never turns green for it**: the crash is already a FAIL, the exit code stays 1, and the summary names the sections left unfinished. Recovering the COVERAGE is the point; recovering the VERDICT would be the defect this doctrine exists to catch. | **REPRODUCED** (5 runs) → **CONTAINED**, cause open | needs triage |

#### Verified controls — named, so the next audit does not re-derive them

A control is listed here only once a fault injection failed to break it, with the mechanism named.

| Control | Mechanism | Proof |
|---|---|---|
| Two imports in flight cannot both pass the plate quota | `PlateLedger.open().hold()` checks `scene + every other hold + mine` and takes its own hold in the **same synchronous step**, and `useImportFiles` holds off the binary STL's 84-byte header before anything is parsed | walk `q1` |
| A replayed Remove takes one row, and the right one | the press is keyed by unit id, not by row index (`onRemove={() => onRemove(unit)}`) | walk `q4` |
| A duplicated worker reply has no second effect | `WorkerTask.wire` resolves the reply's job out of `this.jobs`; a settled job has left that map, and `'stale'` is already a named reply code | walk `q5`, 6 replies redelivered |
| A failed job's row is never dropped from the activity list | `JobActivity.view` deletes only `outcome !== 'failed'` rows, and surfaces a failure that ended inside the show delay | the mechanism W-05 and W-07 were both fixed onto |
| Two orients in flight cannot cross: every observer keeps its own answer | `WorkerTask.wire` matches a reply to its job by id, `AnalysisClient` keys its slots, and `useDentalFlow`'s `stale()` token refuses an answer for a job it has moved on from | walk `r2`, newer released first |
| A dependency that fails does not take the queue with it, and its late answer lands nowhere | `WorkerTask.settle` guards on `job.done` and `restart` nulls the worker's `onmessage`, so a reply that arrives after the client gave up reaches nothing | walk `r3`, crash then release |

#### A note on the harness, because it changed what the audit could ask

`--probes=<list>` filters section `q` to one fault injection: seven seconds instead of eight minutes,
almost all of the saving being q1's 3.19M-triangle read. It was added mid-diagnosis and it changed
the work immediately — the W-09 account above has a probed answer rather than a plausible one
because asking became cheap. Same lesson as `--only` saving a day, one level down; and the same
danger, so a filtered run says `SOME PASS` and names what ran.

**And then the harness decided which fault classes this audit could have at all.** G1, G3, G5 and G7
were `UNPROVEN` for an afternoon and then all four ran in 44 seconds, and nothing about the app
changed in between — what changed is that the walk learned to hold a reply, release it in an order
of the walk's choosing, crash a worker on this side, and refuse a download. Three of those are one
lever. The lesson is not "build levers"; it is that **`UNPROVEN` is a statement about the harness,
and it is usually cheaper to retire than it looks** — four fault classes had been reported as
untestable at this tier, and the missing condition was a page script of forty lines.

The corollary the pass also earned: **a lever no probe uses is a dead control.** The first design of
`__faultHold` had `fail` and `reorder` modes as well. Holding expresses both, no probe needed either,
and they were cut before they were written — a week after deleting a guard in `startItem` that could
never fire.

**And the same thing happened twice more before the day was out.** The last two rows of §8 were the
`UNPROVEN` timeout and the `UNVERIFIED` lying header, both written up as things a future pass would
do. The timeout needed four lines (`__longTimerFloorMs`) and the header needed a 184-byte fixture.
Neither was a day's work; both had been described as one, because **an unrun row is easier to write
than to cost.**

**AND W-03 BROKE A CHECK, WHICH ONLY A FULL RUN COULD SHOW.** `m4b` waits for every deck row to
carry text and then asserts what that text says. "Carries text" meant "has decided" for exactly as
long as a queued row drew a BLANK — and W-03, this audit's own fix, gave it words ("Waiting its
turn…"). So the wait began returning at once and the check read the rows mid-flight. It passed on
`--only=m`, because with nothing before it the batch beat the read by milliseconds, and failed in a
full walk, where it did not. Three checks shared the flaw — `m4b`, `q5`, and section `r`'s own
reader, which I had already fixed there after `r2` passed vacuously for the same reason. **The same
mistake, three times in one day, and the third time in a check I had personally corrected.** There
is one `rowsSettled` now, and the pending sentences are named in one place.

The cost of that lesson is worth stating plainly: **a fix to what the screen SAYS can silently
invalidate a test that reads the screen**, and a check that reads a surface is coupled to that
surface's vocabulary whether or not anyone wrote that down.

**THE TIMEOUT LEVER BROKE A CHECK IN ANOTHER SECTION, and the walk caught it.** `__longTimerFloorMs`
was first installed by replacing `window.setTimeout` in the init script, at page load. Walk `m4b`
went red: the batch's first orient never settled, with **no console error** — it simply stopped. A
*pure pass-through* wrapper did it too, so the clamp's logic was innocent; something at load time
needs `setTimeout` to be the native function. The lever is installed on demand now and removed after,
and `m4b` is green.

Two things are worth keeping from that. **The harness is code, and it gets the same treatment as the
code it tests** — it was found by the gate, bisected against `48b062d`'s own `walk.mjs` to prove the
app was innocent, and fixed, not worked around. And **a lever that changes global behaviour for the
whole run will be paid for by a check that has nothing to do with it**, which is the cost model for
every lever in §6b: hold, crash and download all touch one object each, and this one touched the
page.

**A lever armed before a navigation is not armed.** `r5` failed its first run because it set the
timer floor and then called a helper that begins with `page.goto` — which re-runs the init script and
resets every lever. That trap was already written down two comments above the line that fell into it,
by the same author, an hour earlier. It is now a parameter of the helper instead of a thing to
remember.

### What runs next

1. **W-17, the tab crash, is contained but not cured.** Chromium's GPU command buffer goes invalid
   under SwiftShader (`GPU state invalid after WaitForGetOffsetInRange`) and takes the renderer with
   it, in section `a`. Not this repo: it reproduces at `48b062d` with that commit's own `walk.mjs`,
   on two Chromium builds, with the JS heap at 36 MB of 3586 and the browser's biggest process at
   719 MB. `--in-process-gpu` made it worse and `--disable-gpu-watchdog` did nothing. **What did
   show is load:** all five crashes happened with a test suite, `gate:real` or another walk running
   beside it, and an idle machine walked straight through `a` — a software rasteriser is CPU-bound,
   and starving it is the one thing they had in common. So: run the walk alone. If it returns on an
   idle machine, try a smaller viewport, `--disable-gpu-compositing`, and a build with hardware GL.
   What is already fixed is the gate's response: it retries the section once in a fresh browser and
   then carries on, and never turns green for it.

2. **W-14 is with geocore** (`docs/handoff/geocore-stuck-job-elapsed.md`): a job stuck for ever reads
   `100%` with no elapsed time, because `showElapsed` is wired to the one state it cannot be in. When
   a new vendor drop lands, `r4`'s check tightens from "the deck still works" to "the stalled job
   says how long it has been stalled".
3. **W-12 was fixed with a second mount point, and the proper fix is named as debt.** The
   background-work list belongs at the app root, not inside the viewport; moving it there means
   re-homing three CSS rules that position it by viewport state, which is a layout change with its
   own visual check and must not ride along with an audit.
4. **W-05 and W-07 took the activity list, not a flag on the unit.** That is the minimal honest fix
   and it uses the screen the operator already watches, but it is dismissible and session-scoped: a
   project reopened tomorrow does not know its last export was refused. A persistent mark on the unit
   is scene state with save-file consequences, so it is written down here as debt with its reason
   rather than taken quietly.
5. **E4 shipped for flagged rows only, and the question it left is now ANSWERED.** Pressing Rim on a
   row the detector flagged `no-rim` enters rim drawing directly instead of re-running a detection to
   be told what the row already says. *May a detected rim be redrawn?* The owner's answer, 2026-11-09:
   **yes.** `dental.rim.enter` no longer hides itself behind `!dentalProposed`; it reads "Redraw the
   rim" on a detected aligner and seeds the drawing with detection's own loop
   (`dental/rim/seedFromDetected.ts`, ~15 anchors on the reference aligner, spaced by arc length).
   The cost is named in the hint rather than discovered: a drawn rim sets its own plane, measured at
   5.60° from detection's axis, so the support area shifts slightly. Proved in the browser: `u9b`
   (the press opens the drawing already populated) and `u9c` (backing out leaves the detected rim
   exactly as it was). **`u9c` caught a false claim of mine on its first run** — I had written that
   the seeding was one ordinary undo step, and the history is scoped to the mode, so it is not; the
   comment was corrected rather than the check loosened.
6. **The repair rail is built and unreachable.** `rowState.verdictOfRepair` and `offersRepair` have
   no caller outside their tests, and nothing in the app calls `repairMesh` — so the engine's hole
   filling (new at 63, `max_fill_loop_mm`) is off because nobody asks for it, not because a number is
   zero. Not a defect today; named here so that "fill 0" is not later read as a setting that was
   tuned. `noUnusedLocals` cannot see an unused EXPORT, which is why a grep found it and the compiler
   did not.

---

<a id="2026-11-11-cia-audit"></a>

## 2026-11-11 — cia — Code Integrity Audit of mixoDental, 2026-11-11

*Was `docs/reviews/2026-11-11-cia-audit.md`.*

**Tier: Screen. Mode: audit.** Run overnight and unattended on `41f8d7f`, working tree clean at the
start and clean at the end apart from the two fixes committed below. Scope: the whole repository.

**The primary quantity:** the operator's work — the units on the plate, their orientation, rim, area
and supports, what the saved `.mixodental` holds, and **the exported STL**, which is the one artefact
that leaves the app and the one a printer obeys. Its observers (`browser-walks.md` §12): the
viewport, the deck row (picture + two sentences), the tool rail, the stored `PrintUnit`, the
background-work list, and the written file read back **by a parser that is not ours**.

**Where this run went, and why.** Three audits already cover this tree
(`docs/reviews/2026-11-02-cia-denture-flow.md`, `2026-11-08-cia-deck-and-flow.md`, and the
fault-injected `2026-11-09-wiring-walk-dental-flow.md` with its W-01 … W-17 register). The
2026-11-08 run names its own limits in writing: *"UNVERIFIED, not omitted: S4, S6–S11, S14,
S17–S21, S24. S22.11 (the vocabulary census) not run."* **Those are the sweeps this run went to**,
plus the two things no earlier run could have covered: the surfaces built in the last two days (the
two icon sets, the coloured art, the style book), and **the browser the product actually runs in**.
What the earlier runs closed is re-read and reported as covered, not re-derived.

---

### For the owner — five lines

1. **Nothing found tonight threatens a file you have already exported.** The export path is the
   best-defended thing in the repo, and for the first time it is proved against a parser that is
   not ours: tonight's own Step-3 export, 408,308 triangles, reads correctly in **trimesh** —
   Z-up, on the plate, outward normals.
2. **Two things need your decision before anyone outside this room uses the app**: a browser with
   no WebGL2 gets a **blank white page** with nothing said (proved, screenshot below), and the
   print-angle confirm **cannot say no** — "no angle holds" and "the check crashed" both open
   Step 2 looking exactly like "confirmed".
3. **Two small things are fixed and committed** (not pushed): the deck row's picture now follows a
   rotation, so a turned row stops showing its pre-orientation photo beside the words "Turned
   upright."; and a stranded comment that had swallowed a function's own description.
4. **The gate is green on `41f8d7f`** — and this is the first commit since `1b3b178` to have the
   *whole* local set run on it, not the usual four commands: tsc, tests, duplicates, screens,
   build, wasm smoke, the 13 real scans, and the full browser walk (**185 PASS, 1 FAIL**, the FAIL
   being the known `g-pre` machine-speed precondition, not the app).
5. **Tomorrow's human test is unaffected** by the two fixes, and one line of it gets easier: the
   row pictures will now agree with the row's own sentence.

---

### ROUTE (`python tools/route.py S:/ai/mixodental`, verbatim)

```
ROUTE tools/route.py 1 · root S:/ai/mixodental · 592 source files / 56447 lines · 9.1 s · skipped dirs: .git, __pycache__, dist, graphify-out, node_modules, vendor
SURFACE page=26 (index.html:1 `template file` , kit.html:1 `template file`) · cli=2 (scripts/extract-sup-contacts.py:316 `sys.argv` , scripts/dental-reference/compare_supported.py:7 `import argparse`) · http routes=0, form targets=5 (typelab/viewer.html:663 `fetch('/reasons.json'` — no handler in tree) · server=package.json:8 `scripts.dev`
  → load surface-map.md §3, journey-map.md §2; browser-walks.md §12 by CLI/API observers (rendering walk possible)
STATE enums=24 (scripts/check-no-duplicates.mjs:66 supports|workers|state|dental) · renderers for 0 of 4 (none found)  → design-tools.md §4; S16/S22 lead, not a finding
GRAPH files=592 lines=56447 packages=4 cross-imports=1 (scripts<->src scripts/export-hashes.ts:11) · signals held 2 of 2 scanned, 4 judged by hand (code-graph-tools.md §1: any 2 of 6) → code graph · if a graph (§2, one graph per question): code relationships → graphify explain/path (cgc not on PATH; §3.1: probe it by full path or its MCP tools first, and it comes first if it answers); architecture → graphify · graphify-out/: fresh · graphify: PATH · cgc: not on PATH
DESIGN top-level modules=4 · ui framework=package-lock.json:11 `react`  → design-tools.md §1–§3
COMMERCE none (criteria 1–4 of SKILL §0.3: payment dep no · orders/cart/products schema no · /checkout|/cart route no · commerce framework no)
MEDICAL DESIGN.md:1 `# Design System: mixoDental`  → companion-skills.md meddev row · AI none (§0.10 off: no LLM dep, no prompt dir)
BINDINGS tests=216 files (typelab/islandReport.test.ts, unittest, vitest) · runner config=none · ci=.github/workflows/ci.yml · lockfile=package-lock.json · linter config=none · .env=none .env.example=none · docs: none · handoff=docs/handoff/ · gap-register=none · contract files=AGENTS.md, CLAUDE.md, README.md  → §0.5 resolves the commands from these
COMPANIONS installed: impeccable, mixo-app-style, kubai-icons, stitch, meddev-iec-62366-usability, meddev-iso-14971, meddev-state-machines, meddev-traceability, fmea-analysis, rcca-master, five-whys-analysis, fishbone-diagram, fault-tree-analysis, trade-study-analysis, kepner-tregoe-analysis, egm:egm-draft, egm:egm-review, token-economy-delegation, pstack:thermo-nuclear-code-quality-review, security-review, gemini, skills-hub · other skills 166 · CLIs: graphify, gh, docker, npx, playwright, stitch, codex, claude · missing: design:accessibility-review, design:ux-copy  → companion-skills.md §3
UNKNOWN not scanned: callers outside the tree (cron, systemd, CI of another repo), dynamic route registration, templates outside *.html/*.jinja/*.twig/*.tpl/*.vue/*.svelte  (evidence.md §E5 boundary)
```

Overrides taken against the block, each with the evidence that outweighs it:

- **`typelab/viewer.html:663`'s `fetch('/reasons.json')` is not a handler-less form
  target**: it is a local review viewer served by `typelab/serve.mjs`, which serves
  that file. Checked, not a finding.
- **MEDICAL** fires on `DESIGN.md`'s title, which is a design-system document. The product's own
  words are *"Not clinically validated: check every result before printing"* (`README.md`). No
  meddev doctrine was imported.
- **COMMERCE none** → `/ecommerce-cia` does not apply and is not suggested.
- **`cgc` is not on PATH**, so code-relationship questions were answered by reading and by grep,
  with `graphify` available for architecture. No graph query was needed: the project's module
  READMEs are the architecture document and they are current.

### LEADS (`python tools/sweep_leads.py S:/ai/mixodental`, verbatim)

```
LEADS (tools/sweep_leads.py, X0) - leads, never verdicts; each gets a finding or a reason on its sweep line
S13 no caller in tree: scripts/test-support/dentalExpect.ts:43 `rimContainsPoint`
S13 no caller in tree: scripts/test-support/genericCases.ts:59 `bookkeepingSnapshot`
S13 no caller in tree: src/components/viewport/viewportPort.ts:89 `pointerRecord`
S21 process-wide state written in a test, no restore seen: none
boundary: Python by syntax tree, JS/TS by pattern; callers outside the tree, decorator or entry-point registration, and restores in shared fixtures are not seen (evidence.md §E5)
```

**All three leads answered**, each re-grepped across the whole tree including tests, fixtures and
`dentalwork/` (`grep -rn <name> --include='*.ts' --include='*.tsx' . --exclude-dir=node_modules`),
each with **zero** callers: `rimContainsPoint` → **MIXO-09**, `pointerRecord` → **MIXO-10**,
`bookkeepingSnapshot` → **MIXO-11**. The S21 lead ("none") was independently checked: no test in
`src/` writes `process.env`, a global or storage without a restore; `src/ui/theme.test.ts` stands up
its own `document` and `localStorage` and is the only one that comes close.

---

### 2b — The VSM map

40 components, 14 channels. Sweep sites below are enumerated from this map's channels.

| Component (path) | System | Channels (`producer → consumer`) |
|---|---|---|
| `components/useImportFiles.ts`, `workers/importWorker.ts`, `workers/stlSession.ts`, `workers/prepareImport.ts` | **1** | file → import worker → `PreparedMesh` → scene (1→4→1→3) |
| `core/import/estimate.ts`, `core/import/stlHeader.ts` | **4** | the file's own bytes → the budget (4→5) |
| `components/useRegenerate.ts`, `supports/jobRunner.ts`, `workers/meshWorker.entry.ts` | **1** | scene → placement → support mesh (1→1) |
| `components/useSupportBuilds.ts` | **2** | a unit change → a settled, de-duplicated build request (2) |
| `components/useSupportChecks.ts`, `useFixSpot.ts` | **3\*** | build → findings → the Problems list (1→3\*→operator) |
| `components/useDentalFlow.ts`, `dental/**`, `workers/analysisWorker.ts` | **1** | Step 1 → orient / tilt-scan / **confirm** / region → `dental/set` (1→4→3) |
| `denture/**` | **1** | the denture flow, its own client and queue |
| `items/useBatchDetect.ts`, `items/detectState.ts`, `items/rowState.ts` | **1 / 3** | purpose → one `dentalOrient` per row → the row's own sentence |
| `items/useThumbnails.ts`, `items/thumbnail.ts`, `viewport/drawThumbnail.ts` | **1** | unit → one renderer → a 160 px picture on the row |
| `components/useExport.ts`, `vendor/.../supports/export.ts`, `exportGate.ts` | **1 / 5** | scene → full-resolution build → `encodeStl` → the browser → **a file a slicer reads** |
| `components/useProjectFile.ts`, `state/projectFile.ts`, `workers/projectWorker.ts` | **1 / 4** | scene ↔ `.mixodental` |
| `core/plateLedger.ts` | **2** | every in-flight import counts every other one |
| `vendor/.../workers/WorkerTask`, `workers/analysisClient.ts`, `denture/engine/keyedQueue.ts` | **2** | job registry, per-job timeout, restart, keyed slots |
| `state/history.ts`, `dental/flow.ts` | **2** | one undo step per command; the step's undo floor |
| `state/project.ts` (the reducer), `editing/session.ts` | **3** | the authoritative scene and the mode |
| `host/core/budget.ts` | **5** | triangle / memory / plate caps and the tier |
| `config/printers.json`, `plate/printerProfiles.ts` | **3** | **a declared, unwired seam** (`usePlateArrange.ts:21`) |
| `i18n.ts` + `locales/*`, `ui/theme.ts`, `dental/adjustMemory.ts` | **3** | per-user settings in storage |
| `ui/iconCatalogue.ts`, `ui/Icon.tsx`, `ui/Art.tsx`, `kit/` + `kit.html` | **3** | icon and art files → the style book and the app |
| `styles.css`, `styles/theme.css`, `ui/tokenColour.ts` | **3** | design tokens → the DOM **and** the 3D scene |
| `components/JobActivity.tsx` + `host/workers/jobActivity` | **1→operator** | every background job → the one list that remembers failures |
| the vitest suite (217 files), the 58 source-reading guards | **3\*** | the code → its own rules |
| `scripts/walk.mjs` (186 checks) | **3\*** | the built app in a real browser |
| `scripts/real-scan-gate.mjs` + `scripts/baselines/` | **3\*** | 13 real scans → a committed baseline |
| `scripts/geometry-wasm-smoke.mjs`, `vendor-geometry.mjs --check`, `check-no-duplicates.mjs`, `geometry-guard.mjs` | **3\*** | the vendored engine and the TS/Rust boundary |
| `.github/workflows/ci.yml` | **3\*** | a `milestone-*` tag or a dispatch → tests, screens, build, two walk shards, the Pages deploy |
| `vendor/mixo-geocore` (engine 63, `b5a71ab`) | **4** | consumed as built; never edited here |
| Blender SLASG + `tools/blender-parity/` (19 cases) | **4** | an independent producer this app is measured against |
| the browser: WebGL2, module workers, WASM, storage, downloads | **4** | **the real target environment** — see 2c |
| GitHub Pages | **4** | static host, no headers, no server |

Two map rows carry the sweeps' `no sites` answers: there is **no cache in front of a store** (S12.2)
and **no `data-action` convention** (S22.9's second half).

---

### 2a — The twenty-four sweeps

Each line names its sites; `covered by <review>` means an earlier audit enumerated that sweep and
this run re-read the fix rather than re-deriving it.

**S1 — snapshot vs live reread.** Swept, 0 new findings, 6 sites: `components/useImportFiles.ts:173`
(`memoryCap` read once at the top of a drop and carried — **S1.1 satisfied**), `:157` (`plateNow()`
deliberately live), `components/useDentalFlow.ts:376-385` (the policy snapshot at accept, with
`keptDentalWork` preserving the operator's own work — W-01's fix), `items/useBatchDetect.ts` (the
batch profile — W-04's fix), `components/useExport.ts:64` (the scene read once as `current` and
carried through plan, gate and write), `state/project.ts:217` (`transform/set` clones).
Quoted: `const memoryCap = memoryCapBytes(memoryInfo());` — `useImportFiles.ts:173`.

**S2 — select-then-act.** Swept, 0 new findings, 5 sites: `core/plateLedger.ts` (hold + scene +
every other hold in one synchronous step; walk `q1`), `components/StartScreen.tsx:84` (`claimHeld`
reads and empties in one statement; W-08), `WorkerTask.wire`'s job registry (walk `q5`),
`items/useThumbnails.ts:26` (one draw per task), `state/history.ts`.
Quoted: `const claimHeld = (): readonly File[] => { const files = heldRef.current; heldRef.current = []; return files; };`
Runtime: no new S2 site appeared this run, so no new probe was owed; the highest-value site's
two-at-once artefact is `q1` from 2026-11-09.

**S3 — catch-block posture.** **21 catch sites in `src/` outside tests, every one read; 1 finding
(MIXO-01).** Fail-closed: `state/projectFile.ts:21,33,78` (each throws a named `ProjectFileError`),
`plate/printerProfiles.ts` `parsePrinterProfiles` (throws on the first bad row rather than inventing
a size), `workers/stlSession.ts:33,40,56`. Fail-open **on a display path with the degradation
visible**, which is the allowed case: `components/useExport.ts:99` (a failed support check becomes
`incomplete: N` and is reported in the export status). Per-user preferences, each saying so in its
own comment: `i18n.ts:27,46`, `ui/theme.ts:36,52`, `dental/adjustMemory.ts:13,21`,
`useDebugLayers.ts:28,90`, `printerProfiles.ts:61,70`. Reported twice (status line **and** the
activity list): `useImportFiles.ts:202,272`, `useExport.ts:142,152`. Also read:
`items/useBatchDetect.ts:78`, `denture/check/dentureSpots.ts:21`, `viewport/sessionMesh.ts:25,35`,
`viewport/drawThumbnail.ts:49`, `dental/manualArea.ts:52`, `core/import/estimate.ts:23`.
**No catch logs at `debug`/`trace` and continues** — 0 hits for `console.debug` or `log.debug` in
`src/`, so this sweep's 2026-09-24 shape has no site here.
Quoted: `} catch { /* storage blocked: the choice lasts this visit */ }` — `useDebugLayers.ts:28`.

**S4 — external field semantics.** Swept, 0 findings, 3 boundaries, **1 cell UNVERIFIED**: the
binary-STL header (`core/import/stlHeader.ts` — the header's count is ignored and the file's own
size decides; walk `r6` proved a header claiming 4,000,000 counts 2); ASCII STL (`estimate.ts:29`,
sampled, `exact: false`, margin in `budget.ts:23`); **glTF 2.0 accessors and `primitive.mode`**
(`estimate.ts:58-78`) — correct to the auditor's knowledge of the specification, **no citation
fetched this run, so the cell is UNVERIFIED**, with the consequence named: a wrong mode mapping
moves the pre-parse estimate only, and `useImportFiles.ts:196` re-asserts the triangle cap after the
parse.

**S5 — control to consumer.** Swept, 0 new findings, 9 controls: the four rail tools
(`deck/ToolRail.tsx:75` → `onPick` → `App.startItem`; W-02's fix), `Tips only` (`App.tsx:1504`),
the language switch, the theme switch, **the printer profile** (`plate/printerProfiles.ts` — a
declared, unwired seam, said in writing at `usePlateArrange.ts:21` and `PlateOutline.tsx:13`, so an
`○ declared owner` cell and not an orphan), the Debug layers, Remove (`items/ItemRow.tsx:92`), the
export kinds, Cancel/Dismiss on `JobActivity`.
Quoted: `onClick={() => onPick(tool)}` — `deck/ToolRail.tsx:75`, the press the component used to
destructure and never call.
**S5.1:** 40 scripts under `scripts/`; nine have a `package.json` caller, the rest are operator
tools whose exact commands are printed where they are used (`samples/README.md`). None
writes state the product reads at runtime. No dead maintenance control.

**S6 — deferred-work residue.** Swept, 0 findings. `TODO|FIXME|XXX|HACK` over `src/`, `scripts/`,
`dentalwork/`, `tools/`: **one hit**, `components/BrandLogo.tsx:5` (`TODO: outline it like "mixo"`),
cosmetic and named. Every "for now" / "until then" hit was read: all are explanations of a decision
already taken.

**S7 — skipped tests are unverified.** **1 finding (MIXO-08).** On this machine: `1588 passed |
1 skipped`; the skip is `typelab/reviewCase.test.ts:118` (`CASE_002`, a fixture this
machine does not hold). The sweep's real result is the other six `describe.skipIf` gates:
`src/denture/check/ruleSpots.real.test.ts:22`, `src/denture/engine/dentureCore.test.ts:31`,
`src/denture/steps/supports/rigidMove.real.test.ts:39`,
`scripts/dental-region-review/openArch.test.ts:14`,
`typelab/profileSelect.test.ts:52`, `reviewCase.test.ts:144`.

**S8 — a written test is not a run test.** One test was added this run
(`src/items/thumbnail.test.ts`, "is a row the flow has TURNED"). It was **watched to fail first** —
`expected undefined to be 'a'` — and its run line after the fix is
`Test Files 1 passed (1) · Tests 10 passed (10)`, `npx vitest run src/items/thumbnail.test.ts`,
exit 0. A second test was added beside it ("is NOT a row that only MOVED") which passed before and
after, on purpose: it is the guard against over-fixing.

**S9 — rename residue.** Swept, 0 findings, 3 renames: `mixosupports` → `mixodental` (0 hits in
`src/`, `scripts/`, `index.html`, `kit.html`, `docs/`; the only survivor is a file in the
git-ignored `walk-out/` from an October run), `exportRefusalText` → `exportOutcomeText`, and
`generic` → `dental-model` in the art set — both directions grepped.

**S10 — environment truth before diagnosis.** Two of my own readings were probed before they were
written, and **both were wrong**. Recorded in full under "what I expected and what the system did".

**S11 — boundary contract / schema drift.** Swept, **1 finding (MIXO-01)**, 6 boundaries: binary
and ASCII STL (`core/import/stlHeader.ts`, with a 24-file adversarial corpus at
`scripts/fixtures/stl-corpus/`), glTF/GLB (`state/import.ts` + the post-parse backstop), **the
project file** (`state/projectFile.ts` — the strongest ingress in the tree; see the verified
controls), the worker protocols (`workers/*Protocol.ts`, guarded by `jobContract.test.ts`),
`src/config/printers.json`, the locale files.
**S11.1 — precondition met** (the app serves `en`, `ja`, `zh-Hant`) **and no site**: 0 hits for
`substr` or `replaceAll` in `src/`; the one subset tool (`scripts/gen-fonts-css.mjs`, guarded by
`ui/japaneseSubset.test.ts`) works on code points; a JS codebase has no byte-mode regex.

**S12 — cascade, partial failure, retry storm.** Swept, 0 new findings; covered by the 2026-11-09
walk §6b (G1, G5) and re-read here: per-job timeouts (`ANALYSIS_TIMEOUT_MS` 10 min,
`IMPORT_TIMEOUT_MS`, `DENTURE_TIMEOUT_MS`), `WorkerTask.restart` nulls `onmessage` so a late reply
lands nowhere (walk `r3`), the export's partial-write record (walk `r1`), one `AbortController` per
drop. **S12.2: `no sites on the map`** — there is no cache in front of a store; the only caches are
the thumbnail bitmaps (pruned with the scene) and the worker's remesh, both per-session.

**S13 — orphan capability.** **3 findings (MIXO-09, MIXO-10, MIXO-11)**, one per orphan. Previously
recorded orphans re-read and still recorded, so not re-filed: `items/rowState.ts`
`verdictOfRepair` / `offersRepair` and the repair rail (named in `src/items/README.md` and the
2026-11-09 review), and the printer-profile seam.
**S13.1:** `scripts/real-scan-gate.mjs:21` `SETS` is a hand-written map of three fixture folders
beside a `samples/` that holds four. The fourth, `case-001`, is a copy of the public
reference aligner already covered by the suite (`samples/README.md` says so) —
**checked, not a finding**, and named as LOW debt because nothing would notice a fifth.

**S14 — scope shadow.** This run is whole-repository at Screen depth. **Not walked this run**, named
rather than omitted: the denture flow's own screens (last walked 2026-11-02), the three locales at
narrow widths, the Blender-parity corpus (`tools/blender-parity/`, left as prior runs proved it),
`typelab/` beyond the real-scan gate, and `vendor/mixo-geocore`'s internals, which
this repo consumes as built.

**S15 — the four-corner end-to-end walk.** Covered for the dental flow by the 2026-11-09 walk §4–§6b
and re-read, not re-derived. **This run reached the corner no earlier run did** — the external
record of truth. Table below.

**S16 — terminal-state accountability.** Covered by the 2026-11-09 walk §4 and its rule matrix;
re-read here (`JobActivity.view` still drops only rows whose outcome is not `failed`). **1 new
finding (MIXO-02)**: the print-angle confirm has a third outcome — *no angle held* — that reaches no
state and no screen.

**S17 — controls whose enforcement point is outside the system.** Swept, 0 findings, 3 off-system
decision points: **the browser's download** (`useExport.ts:131-139` — where the file lands, and
whether a second automatic download is allowed, is Chrome's decision; the code's claim is narrowed
to what it "managed to hand over", with the trap written at the line); **the slicer** (what the STL
means — see S24); **the OS file picker**. No local setting claims to constrain any of them, which is
this sweep's "and that is fine" branch.

**S18 — enumeration against the authority.** Two authorities on disk, one enumerated: **Blender
SLASG** (`docs/BLENDER_PARITY.md`; 19 recorded cases in `tools/blender-parity/` replayed by
`src/supports/blenderCases.test.ts`) — a genuine independent-producer authority, read and left as
prior runs proved it; **the glTF 2.0 specification** — one cell `UNVERIFIED`, see S4. STL has no
vendor manual: its authority here is the 24-file corpus plus an independent parser (S24).
Re-walks triggered by findings this run: 1 (MIXO-10/11's class — every `export` with no caller was
re-grepped across the whole tree, not only the three the scanner named).

**S19 — environment-constraint reconciliation.** **2 findings (MIXO-03, and MIXO-02's sibling
MIXO-04).** Table on line 2c.

**S20 — liveness of the safety net.** **2 findings (MIXO-05, MIXO-07).** Table on line 2d.

**S21 — the suite is an instrument too.** Swept, **1 finding (MIXO-12)**, and **one reading of mine
disproved by its own forgery**. Line below.

**S22 — surface completeness.** **2 findings (MIXO-04, MIXO-06).** Censuses on lines 2e and 2f.
**S22.9:** all **56** `<button>` sites in non-test `.tsx` read; 10 carry no handler in their open
tag and every one is accounted for — 9 are the style book's deliberately inert sample rows
(`kit/Catalogue.tsx:107-119`) and 1 is a disabled label with a hint (`SettingsPanel.tsx:300`,
`Custom`). `data-action` is not a convention here (0 hits): `no sites on the map`.

**S23 — sequence and event flow.** Covered by the 2026-11-09 walk §6/§6b: every external arrival is
a worker reply or a file, and duplicate (`q5`, six replies redelivered), out-of-order (`r2`, the
newer released first), late (`r3`, `r5`), missing (`r4`) and malformed (`r6`, `r6b`) each have an
artefact. Re-read; no new arrival kind has appeared since.

**S24 — contract tests at every boundary.** **1 finding (MIXO-13)**, and **one boundary upgraded
from class (b) to class (e) by this run**. Line below.

#### S15 — the four-corner table for the export, the flow this run added

| State | The requester sees | The operator sees and can do | The executor believes | The external record |
|---|---|---|---|---|
| supports built, not exported | the viewport's supports; the rail's Supports tile | the row, the Problems list | `built` holds the mesh for this unit **and this revision** | nothing yet |
| export refused — supports planted before a turn | the status line **and** the activity row: *"the supports on {name} were planted before the model was turned…"* | the same two surfaces; regenerate | `supportsNeedReplanting(unit.revisions)` is true | **nothing written** — refused before the job starts (`useExport.ts:90-93`) |
| export written | the status line names the files and the support count | the activity row | `outcome.files` | **the file on disk**: 408,308 triangles, z −0.000001 … 43.192, winding consistent, signed volume +8202.3 mm³ — read by **trimesh**, not by us |
| export written part way | *"{saved} was saved; {refused} was not"* | the same, on both surfaces | `saved` names what was handed over | the files that landed (W-11's fix) |

`S15 — walked 1 flow × 4 states; 0 disagreements, 0 unanswerable states, 0 reachability findings.
· runtime: 1 ladder run (the export, through the app's own button in a real browser), 1 of 9
adversarial rows (the partial write, from the prior run's `r1`); 4 of 4 corner cells proved by
artefact for the written state.`

#### S21 — the suite as an instrument

`S21 — 1589 tests / assertions not separately counted by this runner; 1 vacuous-pass risk found
(MIXO-12); 0 tests mutate the runner environment without restoring it (checked by hand, the
scanner agreed); 0 secrets reachable in failure output (the repo holds no secret: no `.env`, no
`.env.example`, and the real scans are git-ignored patient data named only by a truncated hash);
1 of 1 external protocols pinned to a counterpart-published vector (Blender, 19 cases) — **and
from tonight a second: the exported STL against trimesh**; 0 assertions found that pin a defect;
fault-injection tests proving the fault arrived: 11 of 11 (every walk probe reports the counts of
its own injection — `q5` "6 replies redelivered", `r4` "every orient answer swallowed"); claims
checked against their assertions: 6, 0 drifting; textual guards with written limits: 2 of 58
(`art.test.ts` and `icons.test.ts` write theirs down; the other 56 do not — MIXO-12);
1 unfalsifiable-assertion/default risk examined and cleared (`nextThumbnailToDraw`'s cache lookup,
now fixed); shared mechanisms quoted as call sites over population: the 58 guards are each their
own call site.`

**The reading this run got wrong, recorded because the doctrine asks for it.** I expected the
~20 guards that read source through `import.meta.glob(..., '?raw')` to be able to pass on stale
text, because this repo has that exact failure written down — `src/ui/art.test.ts:14` says the
mechanism *"served a forged file's previous contents while the real one was broken"*, and only
`art.test.ts` and `icons.test.ts` were moved to `readFileSync`. I was about to file it as a HIGH
class finding across `threeBoundary`, `importOracleBoundary`, `noBrandNames`, `cssTokens`, `i18n`
and the rest. **The forgery disproved it**: a colour literal planted in `src/ui/theme.ts` was
caught immediately and by name —
`src/ui/theme.ts:66: export const FORGED_COLOUR = "#ff00aa"` — in an ordinary `vitest run` after a
previous full run. So the stale read needs a narrower condition than "the guard uses the glob", and
the finding is **withdrawn**; what is left is MIXO-12, which is about written limits, not staleness.

**And the trap this project already knows bit the auditor.** My first probe command ended
`… | tail -25; echo "vitest exit: $?"` and printed `vitest exit: 0` over a run that had failed —
`tail`'s status, exactly the trap `docs/HANDOFF.md` and the project memory warn about. Every gate
result in this report was taken from a file, with `$?` read on the line that produced it.

#### S24 — contract tests at the boundaries

`S24 — 8 boundaries (4 inbound, 2 outbound, 2 internal); primary-path boundaries below class c: 1
before tonight, 0 after; internal at (a) on a state-writing path: 0; fixtures without version or
citation: the STL corpus (hand-written, no external authority exists for STL).`

| Boundary | Direction | Class before | Class now |
|---|---|---|---|
| binary / ASCII STL in | inbound | **c** — a 24-file adversarial corpus, plus walk `r6`/`r6b` | c |
| glTF / GLB in | inbound | b — our loader against three.js's | b (UNVERIFIED cell, S4) |
| `.mixodental` in | inbound | b — our writer against our reader | b, and correctly so: the format is ours alone |
| worker protocols | internal | c — `jobContract.test.ts` pins the shapes | c |
| the vendored engine ABI | internal | c — `geometry-wasm-smoke.mjs` against `HOST_GEOMETRY_VERSION` | c |
| support geometry | outbound | **d** — 19 recorded Blender cases replayed | d |
| **the exported STL** | **outbound** | **b** — `export.test.ts` *"writes STL Z-up and reads it back Y-up unchanged"*: our writer against our reader, S21's self-consistent codec | **e** — tonight's own export read by **trimesh 4.8.1** |
| the `.stl` a slicer opens | outbound | b | **e**, with the caveat that trimesh is a library and not a slicer |

**MIXO-13** is that the project's own suite still has no such test: the upgrade above is this
audit's artefact, not a guard the repo will run again tomorrow.

---

### 2c — S19 host-capability table

The product has no server, so the host is GitHub Pages (static files) and **the browser is the real
target environment**.

| # | Requirement (who imposes it) | GitHub Pages | Chrome/Edge ≥ 92, Firefox ≥ 95 | Safari/iOS ≥ 15.4 | Safari/iOS ≤ 15.3, or no WebGL2 |
|---|---|---|---|---|---|
| R1 | **WebGL2** — three.js r173 via `@react-three/fiber`, `components/ObjectViewport.tsx:107` | n/a | satisfied | satisfied | **NOT SATISFIED → MIXO-04, proved** |
| R2 | **WebAssembly, no threads** — `pkg-browser/mixo_geometry_wasm_bg.wasm`, 2.81 MB | satisfied | satisfied | satisfied | satisfied |
| R3 | **Cross-origin isolation (COOP/COEP)** — *not required*: 0 hits for `SharedArrayBuffer`, `Atomics`, `crossOriginIsolated` in the glue, and no `shared` memory in the binary | **satisfied by not being needed — the row that would otherwise have blocked a Pages launch**, since Pages cannot set headers | satisfied | satisfied | satisfied |
| R4 | **Module workers** (`workers/factories.ts:12-16`) | n/a | satisfied | satisfied | not satisfied below Safari 15 |
| R5 | **`crypto.randomUUID`** — `useImportFiles.ts:228`, `useSupportEdits.ts:67,79`, no fallback | n/a | satisfied | satisfied (15.4) | **NOT SATISFIED → MIXO-03** |
| R6 | **`Object.hasOwn`** (1 site), **`Array.prototype.at`** (6, incl. `App.tsx:228` on the render path) | n/a | satisfied | satisfied (15.4) | **NOT SATISFIED → MIXO-03** |
| R7 | **`requestIdleCallback`** — `viewport/supportLayers.tsx:123` | n/a | satisfied | not satisfied, **guarded**: `idle ? requestIdleCallback(…) : setTimeout(slice, 20)` | guarded |
| R8 | **`performance.memory` / `navigator.deviceMemory`** — the import memory cap | n/a | satisfied (Chrome) | not satisfied → a declared 1 GiB fallback (`budget.ts:99`) | same |
| R9 | **`CompressionStream`** — project save/open, `state/projectFile.ts:52` | n/a | satisfied | satisfied | not satisfied, **guarded**: `canGzip` writes plain JSON and refuses a gzipped file by name |
| R10 | **Several automatic downloads from one gesture** — `useExport.ts:131` | n/a | **not satisfied** (Chrome refuses) — handled by the partial-write report | unknown | unknown |
| R11 | **A secure context** (R5 needs one) | satisfied (https) | satisfied | satisfied | satisfied |

`2c — 11 dependency requirements × 4 target environments = 44 cells; satisfied/not-satisfied/unknown
= 31 / 8 / 2 (3 n/a by design).`
Citations: `crypto.randomUUID` and `Object.hasOwn` first ship in Safari 15.4 (MDN and caniuse, read
2026-11-11). `Array.prototype.at`'s Safari figure was not returned by that search and is the
auditor's knowledge — marked INFERRED.

### 2d — S20 detector table

| # | Detector | Reports coverage? | Liveness signal something reads | Reaches a human surface | Verdict |
|---|---|---|---|---|---|
| D1 | `npm test` (217 files / 1589 tests) | yes — counts and skips | none | the person running it | MIXO-05 |
| D2 | `npm run build` | exit code | none | the person running it | MIXO-05 |
| D3 | `npm run walk` (186 checks) | yes — per check, and it names unfinished sections | none | the person running it | MIXO-05 |
| D4 | `npm run gate:real` (13 scans) | yes — `ran N scan(s)`; a baseline case that did not run **is a difference** | **none, and it exits 0 when it finds no scans** | the person running it | **MIXO-07** |
| D5 | `npm run wasm:test` | yes — prints what it verified (since `c715de8`) | none | the person running it | MIXO-05 |
| D6 | `npm run check:duplicates` | yes — `440 src against 110 vendored` | none | the person running it | MIXO-05 |
| D7 | `npm run screens` | yes — the count | none | the person running it | MIXO-05 |
| D8 | the 58 source-reading guards | each names its own sites on failure | they ride on D1 | D1's runner | MIXO-12 |
| D9 | `.github/workflows/ci.yml` | yes, per job | **GitHub's own run history — the only liveness record here** | the owner's mail, the Actions page | **MIXO-05: no run on the audited commit** |
| D10 | the product's own detectors: the support check, the export gate (4 refusals), the plate ledger, the import diagnosis | yes — per unit, tied to the unit version **and** the build | n/a (synchronous) | the Problems list, the status line, the activity list | **covered** |
| D11 | the background-work list (`JobActivity`) | it never drops a failed row | n/a | mounted on both the deck and the workspace since `873b923` | **covered** |

`2d — 11 detectors; 9 report coverage separately from findings; 1 has a liveness signal something
reads; 3 escalate to a human surface; outermost check: NONE.`

### 2e — S22.10 redraw census

`2e — 12 re-render triggers (1 `setInterval` in `JobActivity.tsx:83` at 250 ms, 2 `requestAnimationFrame`
loops in `viewport/useScreenBrush.ts` and `denture/engine/liveTilt.ts`, 1 idle slicer in
`viewport/supportLayers.tsx:123`, and 8 debounce timers) × 6 in-flight states the redrawn regions
can hold (job percent, stage, cancelling, the Cancel/Dismiss buttons, the live announcement, a
paint stroke) = 72 pairs; **drawn from a live source: all of them**, 0 findings. `JobActivity`
re-renders through `useReducer` and reads every row from `activity.view()` — the registry that
holds the in-flight state — with rows keyed by `row.id`, and the two refs that must survive
(`announced`, `lastAnnouncement`) are refs. Step 4 (g): **0 long-running controls activated this
run**; the 2026-11-09 walk's `r4` held one across ~80 ticks of that 250 ms interval, which is the
≥2-cycle test, and tonight's full walk re-ran it.`

### 2f — S22.11 vocabulary census

`2f — ~17 user-visible nouns across 3 surfaces (the deck's rail, the step badge, the status line)
for 4 things; 3 things carry more than one name; **2 names cover more than one thing**; 0 messages
point at a name no screen shows.`

The two to decide on, both LOW (**MIXO-14**): **"Step 1"** is both the orientation stage and the
rim-define mode (`DentalBar.tsx:114` draws `Step 1 · Define the rim`), while the rail lists Rim as
the *second* of four tools; and **"Supports"** is a rail tool, `Step 3 · Supports` for an aligner,
`Step 2 · Supports` for a denture (`DentalBar.tsx:124`) and the support meshes themselves. The rail's
own comment says *"the rail is where the operator learns the four steps"* while the badge counts
three. Numbering the rail, or dropping the numbers from the badge, is a design decision and is
reported rather than taken.

### 2g — S19.3 parity matrix

| Environment | Engine / runtime | Privileges | Secrets | Suites RAN |
|---|---|---|---|---|
| this machine (Windows 11, node 22.15.1) | the vendored WASM engine 63 + Chromium (SwiftShader) | full | none exist | **tsc, vitest (1588/1 skipped), duplicates, screens, build, wasm:test, gate:real (13), walk (185/1)** — every count in this report |
| GitHub Actions `ubuntu-24.04` | node 22, Chromium via `playwright-core` | CI default | none needed | **NOT RUN on `41f8d7f`** (CI fires on a `milestone-*` tag or a dispatch) |
| the user's browser | WebGL2 + WASM, per 2c | n/a | n/a | the walk's own Chromium only — **no Safari, no Firefox, no mobile: NOT RUN** |

`2g — 3 environments × 8 suites; RAN 8 / NOT RUN 16; engines run: the vendored WASM engine on
Chromium, of the engines the deploy target names (every browser engine); restricted-account run:
n/a (no database, no account); secrets-absent run: n/a (the repo holds no secret).`
**The third row is MIXO-03's other half**: every count in this report is evidence about Chromium.

### 2h — S19.4 migration drill

`2h — move stated: none. The product has no server and no database; the only stated move is the
mixomesh port, which is a code move and not a data migration. N/A with the map row that proves it:
the only persistence is the user's own `.mixodental` file, written and read by the same version.`

---

### Findings

#### MIXO-01 — the memory cap is checked on the guess and never on the answer
**Severity: MEDIUM · Confidence: CONFIRMED (code) · VSM 5 (policy default) · Domain: Persistence &
Recovery · Class: boundary schema drift (S11) / fail-open (S3) · Boundary: `core/import/estimate.ts`
(pre-parse estimate) → `components/useImportFiles.ts:181-201` (the three capacity asserts)**

**Invariant.** No import may plan for more memory than the device can give the editor
(`budget.ts`'s whole purpose, and the owner's own rule: *plan for lowest peak memory; print files
are huge*).

**Evidence.** `assertMemoryCapacity` has exactly **one** call site, `useImportFiles.ts:183`, inside
`if (estimate)`. After the file is read, line 200 counts the triangles for real and line 201
re-asserts **plate** capacity only; line 196 re-asserts **triangle** capacity for glTF. Memory is
the one of the three that is never re-asserted. And `estimate` is null for a `.gltf` over 16 MB
(`GLTF_ESTIMATE_BYTES`), a `.glb` whose JSON chunk is over 64 MB, or a damaged header — in which
case the glTF branch does `await file.arrayBuffer()` and `new GLTFLoader().parse(data)` on the main
thread **before any capacity check at all**. The project file has the same gap from the other side:
`state/projectFile.ts:88` caps by bytes (`triangleLimit × 100` = 600 MB) and consults no memory
budget.

**Observed.** Three capacity rules, two re-asserted after the read and one not; nothing says why.

**Failure scenario.** On a device where the cap binds — `memoryCapBytes` returns 1 GiB when the
browser reports nothing, or half of `navigator.deviceMemory` on a small phone — an ASCII STL whose
head sampled short, or a 20 MB `.gltf`, is admitted past a memory limit that was never re-checked
against its true size. The next Generate is the step `budget.ts`'s own comment says *"stopped the
tab at about 6.5 GB"*, and a stopped tab takes the unsaved scene.

**Impact.** Narrow but real: it needs a device whose cap binds below the 6M triangle cap (a heap
limit under ~403 MB) **and** a file with no exact estimate. The loss is the session's work.

**Fix.** One line beside the plate hold at `useImportFiles.ts:201`:
`assertMemoryCapacity(file.name, adding, RUNTIME, memoryCap);` — and, for the glTF branch, assert a
size-derived bound before `file.arrayBuffer()`.
**Verification.** A unit test over the three asserts with an estimate of `null`, asserting the
memory refusal still fires from the counted triangles.

#### MIXO-02 — the print-angle confirm cannot say no
**Severity: HIGH · Confidence: CONFIRMED (code; no runtime artefact) · VSM 1 → 3 · Domain: State
Management · Class: fail-open default (S3), silent death of the work (S16), unrendered surface
(S22) · Boundary: `workers/analysisWorker.ts:40` (`confirmPick`) → `components/useDentalFlow.ts:398-409`**

**Invariant.** A step that exists to *prove* the chosen print angle builds supports that hold must
not report the same thing when it proves the opposite.

**Evidence.** `dental/confirmTilt.ts:66-72` returns `{ confirmed: undefined }` when **no** rotation
in the tried set produces a build that holds (`confirmHolds`: not blocked, no unresolved island, no
rim gap needing review). In `useDentalFlow.ts`: `settled(undefined)` returns `true` (line 398);
`moved` is then `undefined` (line 408); and `accept(undefined)` (line 409) is **byte-for-byte the
call made when `confirmed === 0`**, i.e. when the first pick was confirmed. The rejected-promise
path is the same: `() => { if (settled(undefined)) accept(); }` (line 410).

**Observed.** Three outcomes — *the pick holds*, *no angle holds*, *the check crashed* — produce one
screen: the status line's *"Checking the print angle…"* is replaced and Step 2 opens.

**Failure scenario.** An operator orients an arch whose every scanned tilt leaves an unresolved
island. Step 1 says nothing, Step 2 opens, they paint an area and build supports on an angle the app
privately judged unusable. The news arrives later, if at all, from the Step 3 check or an export
refusal — after the work.

**Impact.** The print angle is what the product claims to get right (*"a scan of tilts picks a print
angle with no resin traps, no long gaps and no support crossing the aligner"* — README). This is the
one place the app knows that claim failed for this model and does not say so. Not CRITICAL: the
later support check and the export gate would notice, so it is detectable downstream.

**Fix.** Give `accept()` a third case. `acceptDentalOrientation` already carries an optional
`angleMovedDeg` and Step 2 already renders a moved-angle notice, so the channel exists; it needs a
value for *unconfirmed* and one sentence in three locales.
**Verification.** A walk probe with a lever that forces `confirmPick` to answer `undefined`,
asserting Step 2 opens carrying the notice; plus a unit test on the `settled`/`accept` pair.

#### MIXO-03 — the browser floor is neither declared nor crossed
**Severity: MEDIUM · Confidence: CONFIRMED (code) + cited (MDN/caniuse) · VSM 4 · Domain: API
contracts · Class: environment constraint never crossed (S19)**

**Invariant.** What the code needs from a browser and what the build says it supports are the same
set.

**Evidence.** No `browserslist`, no `.browserslistrc`, no `build.target` in `vite.config.ts`, so
Vite's default `'modules'` target applies — Chrome 87 / Safari 14. The source needs Safari **15.4**:
`crypto.randomUUID` (`useImportFiles.ts:228`, `useSupportEdits.ts:67,79`), `Object.hasOwn` (1 site)
and `Array.prototype.at` (6, including `App.tsx:228` on the render path). esbuild lowers *syntax*,
never these APIs.

**Failure scenario.** On iOS 15.0–15.3 the start screen draws, the operator drops a file, and
`crypto.randomUUID` throws inside `importFiles` — caught, so they get "import failed" and can do
nothing else, for a reason the app never names. Below Safari 15 the module workers do not load
either.

**Impact.** Against a README that says *"It runs in the browser on Windows, macOS, Linux, ChromeOS,
tablets and phones. Open the link and start."*

**Fix.** Decide the floor, then say it twice: `build.target` (or a `browserslist`) set to what the
code needs, and one line in the README. A two-line `randomUUID` fallback would lower it again if the
owner wants those devices.
**Verification.** A test that the three APIs are either absent from `src/` or polyfilled; `vite
build` with the declared target.

#### MIXO-04 — a browser with no WebGL2 empties the page
**Severity: HIGH · Confidence: CONFIRMED (artefact) · VSM 1 → operator · Domain: UI/UX · Class:
unrendered / undesigned surface (S22) · Boundary: `components/ObjectViewport.tsx:107` (`<Canvas>`) →
the operator's screen**

**Invariant.** Every way the app can fail has a face (S22's own sentence).

**Evidence.** `grep -rniE "componentDidCatch|ErrorBoundary|window.onerror|addEventListener\('error'|unhandledrejection"`
over `src/`, `index.html` and `kit.html`: **zero hits**. `index.html` is a bare `<div id="root">`
with no `<noscript>` and no fallback. There is no WebGL capability check anywhere (0 hits for
`webgl2`, `isWebGL2Available`, `webglcontextlost`).

**Observed (proved).** `artefacts/2026-11-11-screen/probe-nogl.mjs` loads the real app twice through
a real browser, once with `getContext('webgl*')` returning null. Control pass: start screen renders,
"Any model" pressed, cube dropped, **1 canvas, 0 console errors, 0 page errors**, the editor on
screen. Blocked pass: the start screen renders, "Any model" is pressed, and the page becomes
**`rootChildren: 0`, `canvases: 0`, `text: ""`** — a blank white screen — with two uncaught
`Error creating WebGL context.` and React's *"The above error occurred in the
`<ForwardRef(Canvas)>` component"* in a console no user opens.
Artefacts: `probe-nogl.json`, `nogl-blocked.png` (blank), `nogl-control.png`.

**Failure scenario.** Any device without a usable WebGL2 context — an old tablet, a blacklisted
driver, a hardened browser — reaches a dead white page on the first button, having been told the app
"runs on tablets and phones".

**Impact (INFERRED beyond the artefact).** The same mechanism applies mid-session: React unmounts
the tree on any uncaught render error, so a lost GPU context or a render-time throw takes the
operator's unsaved scene with no message and no save prompt (`beforeunload` fires on navigation, not
on this).

**Fix.** Two small pieces, both needing copy the owner should choose: a root error boundary that
keeps the shell, says what happened and offers Save project; and a capability check before the
workspace mounts, so an unsupported device is told on the start screen rather than after a click.
**Verification.** `probe-nogl.mjs` becomes a walk check: the blocked pass must find a heading and a
sentence, never an empty `#root`.

#### MIXO-05 — nothing outside the person running it can tell a gated revision from an ungated one
**Severity: MEDIUM · Confidence: CONFIRMED · VSM 3\* · Class: dead watchdog / unread CI (S20, S20.6)**

**Invariant.** A green report means an instrument looked.

**Evidence.** `gh run list --commit 41f8d7f` → `[]`: **no CI run on the audited commit.** The
workflow fires only on a `milestone-*` tag or a dispatch, which is a recorded owner decision
(`ci.yml`, 2026-11-02) whose premise is *"Every day-to-day push is checked locally with the full
test set instead."* There are **no git hooks at all** (`.git/hooks` is empty), nothing records which
commands ran on a commit, and the project's own record — the handoff — lists for `41f8d7f` only
`tsc / vitest / build / duplicates`, not the walk, `gate:real`, `screens` or `wasm:test`. Two CI
runs on 2026-11-09 are red (`ec8fad3`, `5ff7450`) and were superseded by green dispatched runs the
same day.

**Why this is filed and the decision is not.** The decision is the owner's and its premise is
sound; what is missing is that the premise is unenforced and unrecorded, so the gap between "the
full local set" and "the four commands that get typed" is invisible. **This run closed it for this
commit**: every command in 2g ran on `41f8d7f`, with its exit code.

**Fix.** The cheapest honest version: one script (`npm run gate`) that runs the set `SHIP-PLAN.md`
§Ship names and writes its results, counts and the HEAD sha to a file the handoff quotes. Then "the
gate ran" is a fact, not a memory.

#### MIXO-06 — "Any model" and "Open a saved project" throw away the files the screen just counted
**Severity: MEDIUM · Confidence: CONFIRMED (code) · VSM 3 → 1 · Class: dead control (S5),
confirmation that lies (journey-map T2) · Boundary: `components/StartScreen.tsx:152-163` → `App.tsx:1385`**

**Invariant.** A screen that says files are ready does not discard them unannounced.

**Evidence.** Drop several models on the Drop page and `StartScreen.tsx:152` renders
*"{n} files ready. Choose what you are making."* Of the four choices beneath it, `Aligner` and
`Denture` call `choose(id)`, which calls `claimHeld()` and imports the batch. **`Any model`
(`:161`) calls `onAnyModel` → `App.tsx:1385` `setStartScreen(null)`, and `Open a saved project`
(`:163`) calls `runCommand('project.open')` — neither touches `claimHeld`.** The start screen
unmounts and the held files go with it.

**Failure scenario.** An operator drops a case of eight, reads "8 files ready", presses "Any model"
because these are not aligners, and lands in an empty workspace: 0 objects, no message, nothing to
undo. They cannot tell whether the drop failed or the button did.

**Impact.** Nothing is destroyed on disk; the cost is a silent no-op at the app's front door, at the
moment the operator has just selected a case. The 2026-11-09 map lists this as a GAP marked
*"relayed — not yet verified"*; it is verified here.

**Fix.** An owner decision about behaviour, so it is proposed rather than taken: "Any model" should
claim the batch and import it as plain models (it is the one purpose that needs no detection), and
"Open a saved project" should either refuse while files are held or say it is dropping them.
**Verification.** A walk check: hold three files, press Any model, assert 3 objects on the plate.

#### MIXO-07 — `gate:real` exits 0 when it has nothing to verify
**Severity: MEDIUM · Confidence: CONFIRMED · VSM 3\* · Class: blind instrument (S20)**

**Invariant.** A check that examined nothing does not report like a check that examined everything.

**Evidence.** `scripts/real-scan-gate.mjs:44`:
`if (scans.length === 0) { console.log('real-scan gate: skipped, no local scans (samples/case-*).'); process.exit(0); }` —
before the baseline is read. The committed baseline names **13 cases**, and `compareRuns` treats a
baseline case that did not run as a difference (line 46) — but that code is never reached on the
blind path. So on CI, on a fresh clone, or on a machine whose git-ignored patient fixtures are
missing, the owner's engine-change gate prints one line and exits **0**.

**Impact.** The owner's standing rule is *"every engine change runs all local real scans"*. On every
machine but this one that rule is satisfied by a gate that ran nothing. The text does say "skipped",
so a human reading the output can tell; the exit code — which is what a chain reads — cannot.

**Fix.** Move the early exit below the baseline read, and exit 1 (or print `0 of 13 baseline cases
ran`) when a baseline with cases in scope exists and no scan was found.

#### MIXO-08 — the deepest verification tier is absent everywhere but one laptop, and nothing says how much *(FIXED)*
**Severity: MEDIUM · Confidence: CONFIRMED · VSM 3\* · Class: vacuous pass (S7)**

**Evidence.** Seven `describe.skipIf` gates (sites on the S7 line) plus `gate:real` all stand on
`samples/`, which is git-ignored patient data. On CI they all skip and `npm test` prints
a green line; nothing compares the skip count against an expected number, which is this sweep's
whole rule (`Skipped: N` is reported as *N unverified*).

**Fix.** One assertion: given the fixtures present, the number of real-scan suites that ran is the
number that should have. Even a printed line — *"real-scan tier: 0 of 8 ran (fixtures absent)"* —
would make the absence visible where it currently is not.

#### MIXO-09 — the ship plan names production code that is a test helper, and one symbol that does not exist *(FIXED)*
**Severity: LOW · Confidence: CONFIRMED · VSM 3 → 1 · Class: designed-but-unbuilt (S13c), the plan
as a scope claim (S14.1) · Site: `docs/SHIP-PLAN.md:191`**

**Evidence.** The U6a row, marked `done`, says: *"production TS left: adapters, `DentalRim` /
`rimContainsPoint` / `DentalOpeningRaycaster`, stamp face gate (U7/U8)"*. Across the whole tree:
`DentalOpeningRaycaster` **does not exist**; `rimContainsPoint` exists once, at
`scripts/test-support/dentalExpect.ts:43`, in test support, **with no caller anywhere**.

**Impact.** The document the project steers by tells the next reader that a dental rim predicate is
still carried in TypeScript production code. It is not. Cheap to correct, and the owner's own rule
is that every affected `.md` moves with the code.

#### MIXO-10 — `pointerRecord` has no caller
**Severity: LOW · Confidence: CONFIRMED · VSM 1 ↔ 1 · Class: orphan capability (S13) · Site:
`src/components/viewport/viewportPort.ts:89`**

The file is the declared three.js implementation of the shared editing seam
(`editing/ViewportPort`, D22) — the seam the mixomesh port depends on. `pointerRecord` converts a
DOM `PointerEvent` into the shared `PointerRecord`, and **nothing calls it**: the app's own pointer
handling does not go through the shared record, only picking does. Half a seam, and `noUnusedLocals`
cannot see an unused `export`, which is why the compiler is silent. Either wire the pointer path
through it or delete it with a line in the folder's README; both are the owner's call because the
seam is a stated goal.

#### MIXO-11 — `bookkeepingSnapshot` has no caller
**Severity: LOW · Confidence: CONFIRMED · VSM 3\* · Class: orphan capability (S13) · Site:
`scripts/test-support/genericCases.ts:59`**

A parity snapshot of the ID and manual-edit bookkeeping *"for the fixed inputs above (one
implementation at a time)"* — the shape of a TS-against-Rust parity check. Nothing calls it, so the
parity it was written for is not being checked by anything. A proof with no obligation behind it
(`evidence.md` §E3).

#### MIXO-12 — 56 of 58 source-reading guards have no written limits *(FIXED)*
**Severity: MEDIUM · Confidence: CONFIRMED · VSM 3\* · Class: a textual guard with no written limits
(S21 shape 11)**

**Evidence.** The repo leans hard on guards that match source text — `threeBoundary.test.ts`,
`importOracleBoundary.test.ts`, `deckBoundary.test.ts`, `noBrandNames.test.ts`,
`noColourLiterals.test.ts`, `cssTokens.test.ts`, `i18n.test.ts`, `uiStylingDoc.test.ts`,
`core/imports.test.ts`, `commandWiring.test.ts` and ~48 more. Two of them —
`src/ui/art.test.ts:14` and `src/ui/icons.test.ts:13` — write down why they read from disk rather
than through the glob. The rest write down nothing about what they cannot see.
Worked example: `threeBoundary.test.ts:17`'s `THREE_IMPORT` matches only a static
`import … from 'three…'`. A dynamic `await import('three')`, a `require`, or a re-export through
another module passes it — and the thing it guards is the portability boundary the mixomesh port
rests on, which nothing else checks. It does carry the anti-vacuity test this sweep asks for
("scans the app sources"), which is why this is MEDIUM and not higher.

**Fix.** Per guard, one comment naming the evasions it does not catch, and for the boundary guards a
data-provider case per evasion marked caught-with-proof or knowingly-not-caught-with-reason.
**Note:** my stronger hypothesis about these guards — that they can pass on stale text — was
**disproved by forgery** and is withdrawn; see the S21 line.

#### MIXO-13 — the product's one deliverable has no contract test against anything outside itself
**Severity: MEDIUM · Confidence: CONFIRMED · VSM 3\* → 4 · Class: self-agreeing fake (S24, S21
shape 5) · Site: `src/supports/export.test.ts:102`**

The test is named *"writes STL Z-up and reads it back Y-up unchanged"* — our writer against our
reader. It cannot see the one thing that matters at that boundary: whether the file means to a
slicer what it means to us. The swap at `vendor/.../supports/export.ts:77`, `(x, y, z) → (x, -z, y)`,
is a rotation and not a reflection, so the winding survives — **and this run proved it from outside**
(see S24). What is missing is that the proof lives in this audit and not in the suite.
**Fix.** `artefacts/2026-11-11-screen/verify-exported-stl.py` is eight assertions long; pointed at a
checked-in exported fixture it becomes a guard the project runs.

#### MIXO-14 — two names cover two things each *(FIXED)*
**Severity: LOW · Confidence: CONFIRMED · Class: one thing, one name (S22.11)**
See line 2f. `DentalBar.tsx:114,124`, `deck/ToolRail.tsx:50-55`.

#### MIXO-15 — four dependency advisories, all dev-only *(FIXED)*
**Severity: LOW · Confidence: CONFIRMED · Class: environment**
`npm audit`: 2 critical (`tinypool` prototype pollution → RCE), 2 moderate (`@vitest/mocker` path
traversal and code injection; `vite` `server.fs.deny` bypass). **All four are devDependencies**;
none reaches the shipped bundle, which is static files plus the WASM engine. `npm audit fix` takes
the `vite` one without a breaking change; the other three want `vitest@5`, a major bump.
**Not applied**: a bundler change the night before a human test is the owner's call.

---

### Fixed after the report, in the `/goal` sweep (2026-11-12, committed, not pushed)

The owner's standing goal: no defect left unfixed, no UX workflow gap, and any decision I could not
make taken by Fable rather than put to a human. Five findings closed, one new finding found and
closed on the way, and **two of the five were smaller or different than I filed them** — recorded
here because an audit that quietly corrects its own over-billing teaches nothing.

#### MIXO-15 — taken, and it cleared all four *(FIXED, `b587bda`)*
vite 6 + vitest 5. `npm audit` went **4 → 0**, both criticals included. I had called the major bump
the owner's call the night before a human test; with the standing goal in force it is mine, and the
measurement said it was cheap: **2 failures out of 1627**, one cause. vite-node's CLI moved from the
package root to `dist/cli.mjs` between majors and two tests held the old literal path. vite-node is
now a direct devDependency (vitest 5 stopped pulling it in, and `npm run screens` needs it) and
`typelab/viteNodeCli.ts` resolves it through the package's own `exports`, so the next
major cannot move it again. One test also now checks `run.error` before its stderr regex: the real
fault was "cannot find module" and it surfaced as a regex mismatch.

**And I got this one wrong the first time, which the gate caught *(`ff508fa`)*.** The old literal was
in **three** places, not two. I fixed the two tests, declared the bump clean, and `npm run gate` then
failed on `real` in **one second**: all 13 real scans died with MODULE_NOT_FOUND, because
`scripts/real-scan-gate.mjs:97` held the same path. **1628 unit tests passed while the real-scan gate
was dead** - which is the whole argument for a gate that runs the heavy checks rather than a suite
that reports green. The resolver is now one module, `scripts/viteNodeCli.mjs`, plain `.mjs` so the
bare-node gate and the TS tests can share it, and the duplicate is deleted. `gate:real` afterwards:
**PASS, 13 scans, no differences, 249 s.**

#### Engine 64 exists, and mixoDental stays on 63 *(DECIDED, not a finding)*
geocore closed all 15 of its findings and is now engine 64; mixoDental vendors 63. The re-vendor is
**deferred, triggered by geocore `main` being pushed** (its 13 commits are local, so vendoring now
would stamp a commit absent from the remote - the GEO-001 cost). `docs/design/2026-11-12-three-repo-
refactor-plan.md` section 3b carries the decision, the five compile fixes, the one silent change
`tsc` will not catch, and the denture residual left open.

**A claim of geocore's that did not survive checking, recorded because believing it would have forced
an engine swap the day before a human test.** GEO-002/003 was reported as a live defect reachable by
deleting every support and pressing Export. It is not: `planExport`
(`vendor/mixo-geocore/host/supports/export.ts:53`) gives a unit a supports part only when
`unitContacts(...)` is non-empty, so the zero-contact branch is never reached during export, and the
operator gets `useExport.ts:71` - "Nothing to export: {name} has no supports left." - truthful,
naming the unit, translated in both locales, and guarded by `src/supports/export.test.ts:59` all
along. My own supporting evidence was also wrong: `multipart-10f40a069c2f`'s `tipsPlaced: 0` looked
like the route on real patient data, but its `reason` is `diagnostic-band-invalid-face-graph`. **Two
agents disagreed and the code settled it** - which is §0's rule that neither graph nor any report is
authoritative, applied to a report rather than a graph.

#### MIXO-08 — `npm run gate:tier` *(FIXED, `1f11fb3`)*
**Seven** `describe.skipIf` blocks, not eight as filed. They hold the only proofs that run on real
patient scans, and they vanish silently on a machine without the fixtures — vitest prints a bare "N
skipped" and the receipt captures `Tests N passed` and nothing else. `scripts/real-scan-tier.mjs` is
a gate step, so the count reaches both the receipt and the handoff line that travels: **6 of 7**
here. Absence does not fail it; DRIFT does, proved by forging an eighth block. Also corrected a
README line still claiming `gate:real` "prints skipped and exits 0", which MIXO-07 changed the day
before.

#### MIXO-09 — the row named two things that exist nowhere *(FIXED, `7ae2cf0`)*
Verified rather than assumed: **`DentalOpeningRaycaster` and `stampFaceGate` appear in no `.ts`,
`.tsx` or `.rs` file under any spelling** — only in docs and stale graphify reports. U8 ported both
to Rust `dental/legacy.rs` and the SHIP-PLAN U6a row was never updated. `rimContainsPoint` existed
once, in test-support, with zero callers; deleted, and `tsc` then named `subtract` and the
`DentalRim` import as unused, which is why the deletion is safe. The dated entry in
`docs/dental-rework-handoff.md` keeps its old wording on purpose: it is a log of that day, not a
status table.

#### MIXO-14 — one rename, and four declines with reasons *(FIXED, `3e73eca`)*
Fable decided, as the goal directs. The rim badge is now `Define the rim` with no number: it is a
detour off Step 1, not a step of its own, which `src/bench/README.md` had said all along while the
badge disagreed. It cost nothing — `Define the rim` was already a key in both locales and every
walk assertion already matches `/Define the rim/`. "Supports" naming the rail tool, the step and the
meshes was **declined**: it is ordinary English, and splitting it would cost two locales and five
walk assertions to fix a word nobody misreads. `Step 3 · Supports` against `Step 2 · Supports` was
declined too — the name is the identity, the number is only the position in that job's sequence.
Five written rules now sit in `src/components/README.md` so the next screen needs no new decision.

#### MIXO-12 — five sites, not fifty-six *(FIXED, `34b5e0f`)*
I filed "56 of 58 have no written limits" from a count of guards that lacked a numeric floor.
Measured properly: **31** source-reading guards, of which **16** carry an explicit floor
(membership or exact list, not just a number) and **13** fail on an empty read because they index
`[0]!` or `JSON.parse` the result. **Five** genuinely passed on nothing, and those five now have a
floor. The finding was real; its size was not, and D8's "58 source-reading guards" row in §2d is
over-counted for the same reason.

Proved rather than asserted: collapsing `ScreenHeading.test.tsx`'s glob to zero matches now fails
the new floor **while two tests still pass** — and one of those two is the `offenders.toEqual([])`
guard that was supposed to catch it.

**And one guard was scanning a tree deleted in June.** `core/imports.test.ts` globbed
`../editing/**` as well as `./**`, but `src/editing/` was deleted at PE.5b (`806aaee`) when every
local copy moved into the shared engine. The arm matched zero files, its test was still titled
"scans the support core **and the editing rules**", and a blank line sat where its third assertion
used to be. This is the sharpest instance of the class in the repo: not a guard that *could* go
blind, but one that *was*, silently, for months.

#### NEW — `SettingsPanel`'s dental variant could not render *(FIXED, `cc03973`)*
Found while settling the vocabulary, so it is an S22 finding the census missed. `SettingsPanel` took
a `dentalMode` prop with four branches: it hid five setting groups, dropped Preset and Roof/cage,
and showed "Dental contact area is set in Step 2… set in Step 3". `App.tsx:1572` renders the panel
inside `editMode !== 'dental'` and never passed the prop — so dental mode hides the whole panel and
that variant was unreachable **by construction**, along with a UI string carried in three languages
that no user could ever see. Its one test was titled "during dental review" and proved a
configuration the app cannot reach: green forever, guarding nothing. Deleted rather than wired up,
because hiding the panel is the workflow that ships and `DentalBar` owns those controls. Nothing can
pass `dentalMode` now, which is why no new guard was added for a rule that was never broken.

---

### Fixed this run (committed, not pushed)

#### MIXO-16 — the deck row's picture did not follow a rotation *(FIXED)*
**Severity: MEDIUM · Confidence: CONFIRMED · VSM 1 → operator · Class: stale snapshot (S1), UI
mismatch with backend state · Site: `src/items/thumbnail.ts:63`**

`nextThumbnailToDraw` compared `cache.get(unit.id)?.mesh !== unit.source` — **mesh identity alone** —
while `drawThumbnail(displayMesh(unit.source), unit.transform)` draws the model *as placed*, and the
module's own docstring says it must: *"A model the flow turned upright should look upright on its
row; framing the mesh in its own frame would undo exactly the work the row is reporting."* The deck
draws its pictures in tens of milliseconds as soon as it is on screen; the batch then orients one
row at a time, seconds each, writing a new `transform` to the same `source`. So on an ordinary case
of eight, **every row the batch turned kept its pre-orientation picture** while the line beneath it
read "Turned upright." and the rail called the orient step done.
**Fixed** by recording the rotation a picture was drawn at and comparing it by value (not by
identity: `transform/set` clones, so identity would redraw on a write that changed nothing; and only
rotation can change the picture, since the camera centres on the model's own box). Test written
first and watched to fail (`expected undefined to be 'a'`), plus a second test proving a row that
only *moved* is **not** redrawn.

#### MIXO-17 — a stranded, unterminated docblock *(FIXED)*
**Severity: LOW · Confidence: CONFIRMED · Class: a docblock stranded above the wrong function (S21,
2026-10-13) · Site: `scripts/test-support/dentalExpect.ts:38-40`**

`/** Experimental aligner preset calibrated to the owner-approved, already-correct reference
pose.` was never closed, so it swallowed `rimContainsPoint`'s own description and ended up
documenting a preset that is no longer in the file — residue from a deletion. **Fixed** by removing
the stranded comment.
A tree-wide scan for the class found **1 real site and 10 false positives**, all ten being `/**`
inside the glob strings of the guard tests. The ratchet this class recommends is therefore
**proposed, not added**: a guard with a ten-to-one false-positive rate is S21 shape 14, the vacuous
failure that teaches an operator to ignore the instrument.

---

### Verified controls

Proved, so the next audit does not re-derive them.

| Control | Mechanism | Proof |
|---|---|---|
| **The exported STL is what a slicer expects** | `(x, y, z) → (x, -z, y)` is a rotation, not a reflection, so Z-up arrives with the winding intact | **trimesh 4.8.1** on tonight's own 408,308-triangle Step-3 export: header count matches, z −0.000001 … 43.192, winding consistent, signed volume **+8202.3 mm³**. `artefacts/2026-11-11-screen/verify-exported-stl.txt`; the file's sha256 and how to reproduce it are in `identity.txt` |
| **GitHub Pages cannot block this app** | no `SharedArrayBuffer`, no `Atomics`, no shared memory in the WASM binary, so no COOP/COEP headers are needed | grep over the glue + a byte scan of `mixo_geometry_wasm_bg.wasm` |
| **The project file cannot be used to hand the engine garbage** | header, integer version, forward-version refusal, structural check, **and `assertSoundMeshes`**: whole triangles, finite coordinates, every index inside the vertex count — plus a byte cap applied *before* parsing and a streaming inflate that stops at the ceiling, so a compressed bomb is refused before it is inflated | `state/projectFile.ts:16-96`, read in full |
| **A row's instruction cannot go stale** | `superseded` drops "No rim found. Draw one to continue." and the failure line once the unit has a closed rim draft, a dental or a denture policy | `items/ItemRow.tsx:47-48` — the 2026-11-08 F7 is closed |
| **Supports planted before a turn cannot be exported** | `supportsNeedReplanting(unit.revisions)` refuses **before** the job starts, with its own sentence on both surfaces | `components/useExport.ts:90-93`, `exportOutcomeText.ts:48` — the 2026-11-08 F5 is closed |
| **A device with no WebGL still gets a usable deck** | `drawThumbnail`'s rig is built once, `null` on failure, and a pictureless row is still recorded so the draw loop settles | `viewport/drawThumbnail.ts:35-50` |
| **The user's own Tips-only choice is never taken away** | below the plate the view turns tips on by itself and `belowChoice` still wins; while painting zones the button is `aria-disabled` **with a hint that says why** | `editing/view.ts` `tipsButton`, `App.tsx:1504` — the 2026-10-22 mixosupports class, applied |
| **A missing real scan fails the gate** | `compareRuns` files a baseline case that did not run as a difference | `scripts/real-scan-gate-lib.mjs:46` |
| **`npm run screens` is a gate, not a by-product** | it renders every designer-facing screen from fake data in seconds and CI runs it | 19 screens, exit 0 |

---

### Evidence ledger (§11a)

Reading never produces PASS. Authority is written `required / reached` on the ladder in
`evidence.md` §E2.

| Capability | Verdict | Authority | Evidence (artefact) | What it shows |
|---|---|---|---|---|
| Import an STL and place it | **PASS** | A3 / A3 | the walk, sections a/m/x | OBSERVED: files land, budgets refuse, refusals reach two surfaces |
| Import a glTF/GLB | **UNVERIFIED** | A3 / A0 | — | tier: not walked; the code path was read only |
| Detect orientation per row (the batch) | **PASS** | A3 / A3 | walk section m | OBSERVED |
| Draw / redraw a rim | **PASS** | A3 / A3 | walk section u (`u9b`, `u9c`) | OBSERVED |
| Paint and accept a support area | **PASS** | A3 / A3 | walk sections a (`c`, `d`), x | OBSERVED |
| **Confirm the print angle** | **FAIL** | A3 / A0 | MIXO-02 | the "no angle holds" branch is unreachable to the operator |
| Build supports | **PASS** | A3 / A3 | walk sections a, x; `gate:real` 13 scans | OBSERVED |
| Check supports | **PASS** | A2 / A3 | walk `x9b`; the suite | OBSERVED |
| **Export an STL** | **PASS** | A5 / **A5** | `artefacts/2026-11-11-screen/verify-exported-stl.txt`, with the file's sha256 and provenance in `identity.txt` | OBSERVED: a parser that is not ours agrees — the only A5 row in this report |
| Save and reopen a project | **PARTIAL** | A3 / A3 | walk section a (`knot.mixodental`, header and bytes read back) | happy path only; a damaged file's refusal is A1 (unit tests), not walked |
| Undo / redo across a step | **PASS** | A3 / A3 | walk sections a (`d2`, `f4`), u | OBSERVED |
| Arrange the plate | **PASS** | A3 / A3 | the walk | OBSERVED |
| Switch locale | **UNVERIFIED** | A3 / A0 | — | tier: `walk:locales` not run this session |
| Open the style book (`kit.html`) | **UNVERIFIED** | A3 / A0 | — | not walked; and it is **not in the production build** (dev server or `.stitch/screens` only, as `docs/handoff/human-test-2026-11-11.md` §4 already says) |
| **Run on a browser without WebGL2** | **FAIL** | A3 / A3 | `probe-nogl.json`, `nogl-blocked.png` | OBSERVED: blank page |
| Run on Safari / Firefox / mobile | **UNVERIFIED** | A3 / A0 | — | no engine but Chromium was exercised (2g) |

`9 — 16 capabilities: PASS 9 / FAIL 2 / PARTIAL 1 / UNVERIFIED 4 / UNPROVEN 0; every PASS cites an
artefact.`

---

### Obligations (§E3)

| ID | Statement | Source | Owner | Verifier | Status |
|---|---|---|---|---|---|
| `export.stl.slicer-readable@1` | The exported STL opens in a slicer in print position | README | `supports/export.ts` `encodeStl` | **this run's trimesh check** | **CLOSED** |
| `import.budget.no-oom@1` | No import plans for more memory than the device can give | owner ("memory first") | `useImportFiles.ts:181-201` | none for the counted-triangle case | **OPEN** (MIXO-01) |
| `dental.angle.confirmed@1` | The print angle Step 2 opens on is one whose supports hold | README, the flow's own design | `useDentalFlow.ts:398-409` | none | **FAILED** (MIXO-02) |
| `app.browser.says-no@1` | A device that cannot run the app is told so | README ("tablets and phones") | **no owner** | — | **OPEN, no owner** (MIXO-04) |
| `deck.row.three-statements-agree@1` | A row's picture, sentence and rail tile describe one orientation | `items/README.md`, `thumbnail.ts` | `thumbnail.ts` `nextThumbnailToDraw` | `thumbnail.test.ts` | **CLOSED this run** (MIXO-16) |
| `gate.real-scans.every-change@1` | Every engine change runs all local real scans | owner rule | `scripts/real-scan-gate.mjs` | the person who types it | **OPEN** (MIXO-05, MIXO-07) |
| `start.held-files.not-lost@1` | A drop the screen has counted is not discarded in silence | the screen's own sentence | `StartScreen.choose` **and** `onAnyModel` — **two owners** | none | **OPEN, two owners** (MIXO-06) |
| `port.mixomesh.seam-complete@1` | The editing seam carries everything a second host needs | owner rule | `viewportPort.ts` | `babylonContract.test.ts` | **OPEN** (MIXO-10) |

`10 — 8 obligations: CLOSED 2 / OPEN 5 / FAILED 1 / BLOCKED 0 / OUT-OF-SCOPE 0; no owner 1, two
owners 1, no verifier 4, below required authority 0; unowned behaviours 0.`

---

### Unknowns, contradictions, and what I expected

`11 — 4 unknowns, 1 contradiction, 0 truncated outputs re-run.`

| Unknown | Authority needed | Next evidence | Who |
|---|---|---|---|
| Does the app work on Safari 15.4+ at all? | A3 | open the deployed site in Safari and drop one STL | the owner (rung 5: no Safari here) |
| What does `Array.prototype.at` need in Safari? | A5 | caniuse's Safari column | the agent, next run |
| Is the glTF mode/accessor reading right per the spec? | A5 | the glTF 2.0 specification, §3.7.2 | the agent, next run |
| Does `kit.html` render correctly in the dev server today? | A3 | `npm run dev` + a walk of `/mixodental/kit.html` | the agent, next run |

**Contradiction (§E7).** `README.md:105` states *"CI runs on every push and pull request: Rust
tests, app tests, the production build and the browser walk. A push to `main` is deployed to GitHub
Pages only after the tests and the walk pass."* `.github/workflows/ci.yml` triggers on
`milestone-*` tags and `workflow_dispatch` only, and runs no Rust tests (*"The engine is vendored …
no Rust toolchain here"*). The workflow is the higher authority for its own behaviour, so the README
is a stale copy. It blocks no obligation, and it is the public document a contributor reads first.

**What I expected, and what the system did** — both of my wrong readings:

1. **I expected the glob-reading guards to be able to pass on stale text**, because this repo has
   that failure written down. A forgery planted in `src/ui/theme.ts` was caught instantly and by
   name. Finding withdrawn; the probe is why it never reached the list.
2. **I expected `case-001` to be a real-scan the gate silently omits.** It is a copy of the public
   reference aligner that the suite already covers, and `samples/README.md` says so.
   Checked before filing; not a finding.

**And one thing I changed by accident, reported because it is a change.** The forgery probe required
editing and restoring `src/ui/theme.ts`. `git checkout --` restores it in git's own worktree form,
which is CRLF here (`core.autocrlf=true`, the repo stores LF), while the copy I took before editing
was LF. The file's tracked content is identical to `HEAD` (`git diff` empty, sha matches the blob)
and the tree is clean; only the on-disk line endings of that one file differ from before I touched
it. No test depends on them (`noColourLiterals` is green on it). Worth knowing: in this clone, a
`git checkout --` of any source file rewrites its line endings, which is why
`src/goldens/__snapshots__/*.json` already carries an `eol=lf` pin.

---

### 12 — the wiring walk

`Wiring walk (wiring-walk.md): wiring question stated for this system: yes (the 2026-11-09 review's
§1, re-used unchanged — it is still the right sentence) · lifecycles mapped 12 (reference: spec and
the module READMEs only) · connections 12, gaps on Q1–Q7: 2 (the print-angle confirm has no Q6
operator screen and no Q7 connection test; the held-files control has no Q1 invocation from two of
its four callers) · faults G1–G7: 0 run this run of 7 applicable — all seven were injected on
2026-11-09 and re-read here, 6 recovered or visible, 1 handed to geocore (W-14) · findings by layer
L1/L2/L3: 1 / 6 / 3 · rule rows 12: covered 10 / gap 1 / n-a 1 · gap register:
docs/reviews/2026-11-09-wiring-walk-dental-flow.md §9, and this file's findings list.`

---

### Step 6 lines

1. **Fast lint + scope tests:** ✅ `npx tsc --noEmit` 0 · `npm run vendor:check` 0 · `npx vitest run`
   0 — **1588 passed, 1 skipped (1589), 217 files** · `npm run check:duplicates` 0 (440 src modules
   against 110 vendored). No linter is configured (`route.py`: `linter config=none`); `tsc` with
   `noUnusedLocals`/`noUnusedParameters` is the analyser, and its blind spot for unused **exports**
   is MIXO-10/11.
2. **/cia universal integrity:** ❌ **17 findings** — 2 HIGH, 9 MEDIUM, 6 LOW; 2 of them (1 MEDIUM,
   1 LOW) fixed and committed here. Commerce not detected, so `/ecommerce-cia` does not apply.
2b. **VSM map:** 40 components → Systems 1–5 / 3\*, 14 channels (table above).
2a. **Sweeps S1–S24:** all 24 lines above, each with its sites and a quoted line.
2c. **S19 host capability:** 11 requirements × 4 environments; satisfied/not/unknown = 31/8/2.
2d. **S20 detectors:** 11 detectors; 9 report coverage; 1 has a liveness signal something reads;
   3 reach a human surface; **outermost check: NONE.**
2e. **S22.10 redraw census:** 12 triggers × 6 in-flight states = 72 pairs; all drawn from a live
   source; 0 findings. Step 4 (g): 0 controls activated this run (prior artefact `r4`, ~80 cycles).
2f. **S22.11 vocabulary:** ~17 nouns across 3 surfaces; 4 things; 3 with >1 name; **2 names on >1
   thing**; 0 dangling pointers.
2g. **S19.3 parity:** 3 environments × 8 suites; RAN 8 / NOT RUN 16; one engine only (Chromium);
   restricted-account and secrets-absent runs n/a (no accounts, no secrets).
2h. **S19.4 migration:** no move stated — N/A with its map row.
3. **Full test suite in the canonical environment:** ✅ on HEAD `41f8d7f` — every command in 2g,
   each with its own exit code read from its own line. Plus `npm run screens` 0 (19 screens),
   `npm run build` 0, `npm run wasm:test` 0, `npm run gate:real` **PASS (13 scans, no differences)**,
   and the **full browser walk: 185 PASS, 1 FAIL (186 checks, 1863 s), exit 1** — the FAIL is
   `g-pre`, which names itself *"(precondition, not the app)"*. Its message this run:
   *"the UNTHROTTLED A stroke itself selected 0 of 423 on screen, so no throttle was ever the
   problem"*, which is a **fourth** distinct value for that baseline (0, 56, 4, 0 across four runs)
   and confirms the non-determinism `walk.mjs`'s comment now records. No tab crash: the walk ran
   with nothing beside it.
4. **Runtime walk:** ✅ the full walk above, plus 1 state-delta ladder (the export, front door),
   1 purpose-built fault probe (no WebGL2) with its control pass, and 1 independent-parser read of
   the product's output. 4 artefacts.
5. **Fixes applied autonomously: 2** — `src/items/thumbnail.ts` + `useThumbnails.ts` +
   `thumbnail.test.ts` (MIXO-16, the row picture, with a test watched to fail first) and
   `scripts/test-support/dentalExpect.ts` (MIXO-17, the stranded docblock). Each is its own commit,
   by explicit path, on `main`, **not pushed**. **Escalated: 15** — everything else in the findings
   list. The boundary that blocked each of the big ones: MIXO-02, MIXO-03, MIXO-04 and MIXO-06 all
   need **new user-facing copy in three locales or a change to the app's entry behaviour**, which is
   a design decision; MIXO-15 is a dependency bump before a human test; MIXO-09 edits the owner's
   own plan. **Guards the project should keep** (SKILL Step 5): the no-WebGL probe should become a
   walk check, and `verify-exported-stl.py` should become a suite test over a checked-in export.
6. **Tier: Screen — elapsed ~2 h 20 m (tier budget 2–4 h).**
7. **Skill score:** `cheap model: 2026-11-10 [fixture-editor / claude-sonnet-5-5] scored 9`.
8. **Runtime-walk receipt:** routes fetched — the app's single route, twice, plus the full 186-check
   walk · assets: all served by the dev server, 0 console errors and 0 warnings on the walk's own
   check, **0 external requests** · error-log delta: n/a (no server log; the browser console is the
   log, and it is clean on the control pass and carries exactly the two WebGL errors on the blocked
   one) · preview rows walked: none (the style book is not in the build — UNVERIFIED) · closed-loop
   actions: 2 walked (Any model → drop → workspace; export → file on disk), 0 ambiguous ·
   state-delta ladders: **1** (the export, read at the viewport, the status line and the file) ·
   concurrency probes: 0 new (the prior run's `q1`/`q4`/`q5` stand).
9. **Evidence ledger:** 16 capabilities — PASS 9 / FAIL 2 / PARTIAL 1 / UNVERIFIED 4 / UNPROVEN 0.
10. **Obligations:** 8 — CLOSED 2 / OPEN 5 / FAILED 1; no owner 1, two owners 1, no verifier 4.
11. **Unknowns and contradictions:** 4 unknowns each with its next evidence; 1 contradiction
    (README vs `ci.yml`), blocking 0 obligations; 0 truncated outputs re-run.
12. **Wiring walk:** the line above.
13. **CI (S20.6):** `gh run list --commit 41f8d7f` → **no run on this commit**. The latest run is
    `42834464910` on `50e25f8`, 2026-11-10 14:28, **success**, `workflow_dispatch` — which is the
    deployed build. Two red runs on 2026-11-09 (`ec8fad3`, `5ff7450`, both walk fixes for a slow
    runner) were superseded by green dispatched runs the same day. Filed as MIXO-05.
14. **Build and design lines.**
    **SURFACE** — 20 capabilities × 6 surfaces; ● 18, ○ 2 declared (the printer-profile seam, the
    repair rail), ✕ 2 (MIXO-04's missing failure surface, MIXO-06's discarded batch), unswept 0;
    state branches rendered: the nine row states are a tested partition, four unreachable by design;
    round trips checked 2 (import→row, export→file), 0 dropped fields; reachability checked 1 of 6
    (the app has one route).
    **JOURNEY** — 3 critical journeys (drop a case → orient → rim → area → supports → export; open
    and save a project; the denture flow); steps 14; grid cells: ● 11 (read 3), ✕ 2, U 1, unswept 0;
    traps checked 8 of 8, fired 2 (T2 the confirmation that lies — MIXO-06; T1 a state with no exit
    — MIXO-04); exits without an owner decision 1 (MIXO-02's third outcome); reduction: classes 6,
    decision rows 9, pairs 0.
    **DESIGN** — the module READMEs are the architecture document and they are current; the one
    dependency rule with a guard is three.js-in-the-view-layer (MIXO-12 is about that guard's
    limits).
    **GRAPH** — `graphify-out/` is fresh; no query was needed, because the READMEs answered every
    structural question. `cgc` is not on PATH.
    **EXECUTORS** — X0 only (`route.py`, `sweep_leads.py`, greps, the probes). Nothing was
    delegated: the findings needed the doctrine in one head, and the token budget allowed it.
    **TESTS** — the one test added was chosen by blast radius: `thumbnail.ts` is pure, so the guard
    is a unit test and costs a millisecond.
    **COMPANIONS** — none engaged. `/ecommerce-cia` does not apply (no commerce). The meddev row the
    router raised was checked and declined.

**Reference receipts:** theory.md "a codebase has five systems whether or not anyone named them" |
sweeps/ "the channel is the finding" | wiring-walk.md "ten tested classes are not nine tested
connections" | doctrine.md "an invariant is a sentence that can be false" | reporting.md "the ledger
is harsher on purpose" | evidence.md "a promise needs one owner and a witness" | browser-walks.md
"three observers, one subtraction" | surface-map.md "every blank cell is a cell nobody swept" |
journey-map.md "the author walked one path and called it the journey" | context-templates.md "the
profile picks the template, never the other way round"

---

### The final cybernetic question, for an editor

> If the viewport, the in-memory scene, the undo stack, background workers, GPU buffers and the file
> on disk disagree, does the tool know which is authoritative, and can it save, undo and recover
> without losing the user's work?

**Yes for the file, the scene and the workers** — the scene reducer is the single authority, every
worker reply is matched to its job by id, a late answer lands nowhere, and the export rebuilds from
the scene at click time and refuses rather than writing a stale one. **No for the GPU**: there is no
answer at all for a lost context or a device that never had one, because there is no code that asks.
That is MIXO-04, and it is the one gap in this system's viability.

---

*Sources for the external facts in 2c:
[MDN, `Crypto.randomUUID()`](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/randomUUID) ·
[caniuse, `crypto.randomUUID`](https://caniuse.com/mdn-api_crypto_randomuuid) ·
[MDN, `Object.hasOwn()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwn) ·
[caniuse, `Object.hasOwn`](https://caniuse.com/mdn-javascript_builtins_object_hasown), all read 2026-11-11.*

---

<a id="2026-11-18-human-review-walk"></a>

## 2026-11-18 — Human review walk - the deck's auto-gen, 2026-11-18

*Was `docs/reviews/2026-11-18-human-review-walk.md`.*

Ten minutes, in order. Each step says what to press and **what you should see**, so a difference is
a finding rather than a question. The dev server is on **5280** (`http://127.0.0.1:5280/mixodental/`
- check the browser tab says *mixoDental*, because 5173 is mixomesh).

Everything here was built tonight as increments B to H of
[the card deck plan](design.md#2026-11-18-card-deck-plan), whose "What was built" section is the
long version. **The app is English only for now** - see "The one thing that is not done" at the end.

---

### 1. The card, before anything is named

Drop `docs/dental-reference/reference-aligner.stl` on the Drop page.

- One card, with a **3D render** of the model, its size and file size.
- Keys: **Enlarge** and **Remove**, and nothing else.
- No chip, no "Open": nothing has been named yet, so nothing has been checked yet.

> *Why no Open:* the flow is job-specific, so opening a model nobody has named would have to invent
> which chain to walk.

### 2. Naming it starts the work

Choose **Aligner** on the card.

- The chip reads **Checking…**, then **Ready** after twenty or thirty seconds.
- Hover the chip: *"Turned upright."*
- An **Auto-gen** key appears, in the accent colour.

> **Ready now means ready.** Until tonight a row read Ready whenever the detector did not crash -
> and a model whose pose the engine **could not decide** was reported as *"Already upright."* Four
> doubts were being dropped. If you ever see **Check orientation** or **Check mesh** instead, that
> is one of them, and the hover says which.

### 3. Auto-gen

Press **Auto-gen**.

- The card's picture shows **Generating supports…**
- The **Auto-gen key disappears** while it runs (a control that cannot act must not look as if it can).
- After about forty seconds: **"94 supports placed"** on the card, and the footer reads
  *94 automatic, 0 manual, 0 removed*.
- The Open key has become **Edit supports**.

### 4. It opens at Step 3, not Step 1

Press **Edit supports**.

- The badge reads **Step 3 · Supports**, with the 94 supports on screen.
- Support Edit Mode works on them exactly as it does on a model you walked by hand.

> **This is the ruling that matters most.** Step 1 is the orient step, and re-orienting now deletes
> supports - so opening a generated card the ordinary way would destroy the work you pressed Open to
> look at.

### 5. Back costs what it actually costs, and says so

Still in Step 3, press **Back**.

- **Nothing is asked**, you land on **Step 2**, and the 94 supports are still there.
- Now add a support by hand (Add supports, click the model), press **Back** again: *"Going back
  discards your manual support edits (1 added, 0 removed, 0 with own settings). Continue?"*
- **Stay** keeps everything.

> I had this wrong and built on it. An aligner's Back goes to **Step 2**, not Step 1 — the repo's
> own `dentureStages.test.ts` says so in one line — so nothing re-orients and the supports are not
> at stake. The dialog used to claim otherwise and `backCommands` deleted them for nothing. A
> denture's Back *does* reach the orient step, and there the build does go.
>
> What protects the supports everywhere is the reducer: whenever a re-orient actually happens,
> through any door, they go with it. A vertical spin on the plate is the one exception, proved on a
> real denture scan to 1e-5 mm.

### 6. The case row, and the budget

Back on the deck (**Your files**), look at the footer.

- **1 of 200 models** and **324 MB of 2.0 GB memory**. Both readouts turn amber when passed — the
  model cap is **not enforced** by anything, so the least it owes you is to look different.
- **Auto-gen N cards** appears only while some card is still eligible. The one you just generated is
  not: a built card has no Auto-gen key, because a second run would re-orient it and destroy the
  supports and any hand edits with nothing asked.

To see it, **drop a second copy of the file and name it**. Then:

- **Auto-gen 2 cards**… (or 1) beside Arrange and Export. Press it and it becomes **Stop**; press
  Stop and it goes back.
- If the case ever goes over its memory allowance, every Auto-gen key disappears — correctly, because
  generating more is how the tab dies — and the footer now says so in words instead of just turning
  a number red.

### 7. Enlarge

Press **Enlarge** on the card.

- The model alone, large, on a dimmed page. Drag it to turn it; arrow keys turn it too.
- **Edit supports** (or **Open this model** on a card with none) takes you straight into the flow —
  that was your first request, and it is the card's own Open handler, so it lands in the same place.
- **Close**, click away, or Escape.
- Nothing else: a look and a way on, never an editor.

### 8. Support recipes — the new one

Still on the deck, each card has a small **recipe chip** beside its type. It starts at **Type
default**, which is what auto-gen has always used.

Open a card at Step 3 and expand **Adjust**. Under the sliders there is a **Support recipe** row:

- Move **Pillar size**, type a name, press **Save as new**. The chip on the card takes that name.
- Choose a different recipe in that row and **the sliders move at once**: picking **Type default**
  puts the type's own numbers back. (Measured: 2.4 mm back to 1.4 mm.)
- **Update recipe** / **Delete recipe** / **Use as default** do what they say. Type default cannot be
  changed or removed.

Back on the deck, take the **second card** you dropped in §6, switch its chip to your recipe and
press **Auto-gen**: the supports are built with it, and afterwards that chip is a **readout** naming
the recipe the run actually used — not whatever the default happens to be later. A card that has
already run has no select, because switching it could not change anything.

**Then reload the page.** The recipe list is still there — that is the "remembered across sessions"
half. The deck is not: dropped files do not survive a reload (deck persistence is scoped in the card
deck plan and not built), so do this last.

> **If a card's settings drift from the recipe it names, the chip says "…, edited".** That matters
> because auto-gen uses the *recipe*, not your changes — so either Update the recipe or save a new
> one.

### 9. The one number that proves the whole thing

The gate now walks the same reference aligner **twice**: once through these step screens by hand,
once through the deck's Auto-gen. It then compares what they built.

```
x0p the step screens and auto-gen build the SAME supports for the same model
    by hand {"auto":94,"manual":0,"removed":0}, auto-gen {"auto":94,"manual":0,"removed":0}
```

That is the claim auto-gen rests on — that it is not quietly making different supports from the
editor — and it is now checked on every full walk rather than argued for.

**What it compares is the three counts, not the positions**, because the deck reports counts and
nothing on screen exposes a tip's coordinates. The position-level agreement is proved separately
and under Node, on a real customer scan: running the same model twice gives byte-identical contact
positions, and every settings key the print-angle confirm was judged with equals what the finished
unit carries.

---

### What else changed that you will not see

- **The export** builds and hands over **one file at a time** instead of building the whole case
  first. On a thirty-model case that was of the order of a gigabyte held at once, at the very end of
  the work. A refusal part way through now reports a partial export rather than throwing away the
  files that were good.
- **The orientation check has a two-minute deadline** instead of the pool's ten, and a job that runs
  out of time now says it timed out. One stalled model used to hold every row behind it for ten
  minutes.

### The one thing that is not done

**The new strings have no Japanese or Taiwan Chinese.** Your rule is that zh-Hant comes from Gemini
and is never hand-written - and Gemini's free tier is **20 requests a day**, which ran out. It next
resets **around 16:00 on 2026-11-19**. The prompt is written and committed at
`docs/translation/2026-11-19-missing-strings.txt`; one request finishes it. So two tests are red:
`src/i18n.test.ts` and `src/items/detectState.test.ts`, which demand an entry in both languages for
every UI string. Nothing was hand-translated.

The prompt is written and the handoff memory has the four steps. Everything else is green:

```
npm run walk        ALL PASS (191 checks)
npx vitest run src  1740 passed, 2 failed (the two above)
npx tsc --noEmit    clean
```

---

<a id="VERIFICATION"></a>

## Verification — 2026-10-20

*Was `docs/VERIFICATION.md`.*

> **A DATED RECORD, NOT THE LIVING ANSWER.** This is the generic flow's first browser smoke test,
> run by hand before the dental work existed, and the numbers in it are history: the suite was 69
> tests and is now about 1,700, and nothing here knows about the gate, the walk, or either
> renderer. It is kept because the issues at the bottom were found by this run and the reasoning is
> still useful.
>
> **What proves the app today:** `npm run gate` (every check but the walk, with a receipt under
> `artefacts/gate/`), then `npm run walk` — 188 browser checks, and
> `npm run walk -- --renderer=babylon` for the same checks on the other renderer. `README.md` and
> `scripts/README.md` describe both. `docs/HANDOFF.md` carries the last run's counts.

### Automated

| Command | Result |
|---|---|
| `npm test` | 12 files, 69 tests passed |
| `npm run build` (`tsc --noEmit && vite build`) | passed. Vite warns only about chunk size (three.js bundle > 500 kB) |
| `git diff --check` | clean |

### Browser smoke test

Environment: `npx vite --port 5179`, Playwright Chromium at 1500×900. Fixtures were generated by a script: `mushroom.stl` (20×4×20 cap on a 4 mm stem), `table.stl` (top on four legs), and `pair.gltf` (two named meshes, `Slab` and `Mushroom`).

| Step | Observed |
|---|---|
| Import the 2 STLs and the glTF in one pick | 4 units (A mushroom, B table, C Slab, D Mushroom); the glTF split into 2 units. STL welded to 24 triangles. |
| Select all → Generate | 178 / 145 / 73 / 52 automatic contacts. Supports, braces, raft, rim and letter pads rendered. No console errors. |
| Edit mode Add → click model | 1 manual contact added |
| Right-click a support | 177 automatic, 1 removed |
| Ctrl+Z, Ctrl+Z, Ctrl+Y | 178/1/0 → 178/0/0 → 178/1/0 |
| Gizmo move of unit A | model, supports and raft moved together (screenshot) |
| Remove one, move, regenerate | still 177 automatic and 1 removed (suppression kept at the same spot) |
| Heavy preset, Tree supports, Roof | updated live; roof slab, columns and braces rendered |
| Support spacing 2 → 3 | regenerated automatically after 350 ms (58 contacts) |
| Cage | columns, rings and cross bars around the model; raft enlarged |
| Remove supports → Generate → Clear manual edits | after removal the list shows "no supports" and manual edits are kept. Regenerate restores supports. Clear restores all automatic contacts. |
| Gizmo rotate, then regenerate | supports stayed rigid during the rotation; regenerate re-planted 70 contacts on the plate at the lift height |
| Export: active printable | `mushroom-printable.stl`, 64,960 triangles, valid size |
| Export: active supports | `mushroom-supports.stl`, 64,936 triangles (difference = 24 model triangles) |
| Export: each unit printable / supports | 4 files each (`mushroom`, `table`, `Slab`, `Mushroom`), all valid |
| Export: whole scene | `scene-printable.stl`, 169,776 triangles; bounds min y = 0.00 (plate) |

Issues found and fixed during the smoke test:
- Footer showed "−1 automatic" after removal.
- Moving a unit shifted the world-aligned sampling lattice, so suppressions remapped. Fixed by analysing the rotated but untranslated mesh.
- Index-based automatic IDs remapped suppressions when settings changed. Fixed with position-based IDs.
