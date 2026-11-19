# Support recipes, and what the review found — plan, 2026-11-19

Supersedes nothing: [the card deck plan](2026-11-18-card-deck-plan.md) still holds, and its build
order items 1–6 shipped last night. This plan carries two things that arrived after it:

1. **the owner's new requirement** (2026-11-19) — an edit key on the enlarge overlay, and a system of
   named support settings that auto-gen uses, remembered on the device, switchable per card;
2. **Fable's review of the implementation**, which found eleven defects. Two of them say a premise
   of last night's increment B was wrong.

Both were taken to Fable. The design answers below are Fable's, with my amendments marked. The
findings are Fable's, triaged by me — **each one says whether I verified it and how**, because a
review is evidence, not a verdict.

---

## Part 1 — what the review found

Fable read the diff of `2c75c3f..HEAD` and traced eleven paths. It ran nothing, so I checked each.

### Must fix — these destroy work or lie to the operator

| # | What | Verified how | Severity |
|---|---|---|---|
| **R1** | **Back from Step 3 does NOT re-orient an aligner**, so the new dialog's sentence is false and the supports are deleted for nothing | **Confirmed by the repo's own test**: `dentureStages.test.ts` asserts `stageBeforeSupports('reference-aligner') === 'area'`, so `backDental` from `review` lands on **Step 2** | **highest** |
| **R2** | Auto-gen on a card that already has supports **silently destroys hand edits** — the run's first turn is a re-orient, and nothing asks | Seen live last night: pressing Auto-gen all on a built card left `0 automatic, 0 manual, 0 removed` | high |
| **R3** | The pipeline **overwrites a hand-drawn rim** that the editor protects (`keepsManualArea`) | By inspection: `useDentalFlow.next` checks it, `pipeline.ts` has no such branch | high |
| **R4** | An export that throws after the first file says **"nothing was saved"** | By inspection: `saved` is declared inside the `try`, so the outer catch cannot see it | high |
| **R5** | A **vertical spin keeps the supports but the export then refuses them** — the status line says they are fine, `orient` is stamped anyway, and `supportsNeedReplanting` refuses | By inspection, and it is a contradiction I introduced: the old status line never claimed the supports were fine | high |

### Should fix — wrong words, wrong step, or a race

| # | What | Verified how |
|---|---|---|
| **R6** | `live()` only asks whether the unit exists, so opening a card **while it generates** can land tips for a pose the operator changed | By inspection; needs the card's Open to be reachable mid-run, which it is |
| **R7** | **Stop then Auto-gen can run two pipelines at once** — `cancel` clears the running marker while the old drain is still awaiting | By inspection of the three lines; narrow but real |
| **R8** | A **gate refusal after a file was delivered** is reported as "refused by the browser" | By inspection: it reuses `exportPartialText`, whose words are about the browser |
| **R9** | **Back twice** from an auto-opened Step 3 strands the operator at a Step 1 with no proposal, which says "No aligner opening was found" | By inspection: `openDentalSupports` sets `dentalProposal: undefined`, and three readers need it |
| **R10** | A **rejected orient / scan / region job is reported as "supports failed"** — three awaits have no `.catch` where two others do | By inspection |
| **R11** | A batch that comes back with **no files is skipped silently** | By inspection; rare |

### One I am not acting on

Fable notes that `dentalConfirmTilt` resolving `undefined` reads as `failed` in the pipeline and
`none-held` in the flow. **That is a real divergence and it is R10's fix, not a separate item** —
once the three awaits catch properly, the pipeline distinguishes "the job rejected" from "the job
answered, and no angle held", which is what the flow does.

---

## Part 2 — the recipe system (Fable's design)

### The name, settled first

This repo has been burned by one word meaning two things (audit MIXO-14, where "Step 1" named two
screens). **"Profile" already means the aligner type** and **"preset" already means
LIGHT/MIDDLE/HEAVY**. So the third concept is a **recipe** — `SupportRecipe`, `recipeId`, in a new
`src/recipes/`. The word appears nowhere in the repo today, so a grep can keep it honest. The
built-in entry is **"Type default"**, which is what auto-gen uses now and cannot be deleted.

### What a recipe pins, and what it must not

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

### The seam — and the flaw in my first proposal

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

### Storage

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

### Where it is created and edited

**Step 3's Adjust panel**, not a manager screen — the settings are already there and "remember
these" is the natural sentence. One row doing the whole job: a select (applying it to this unit),
**Save as new**, **Update**, **Delete**, **Use as default**. Editing is pick, adjust, Update. Type
default cannot be updated or deleted.

### What the card shows

One truncated name chip beside the type control - the card's two answers together - full name in
`title`, its own `data-ui`. Before a
run it shows the selection or the default; **after a run it shows what the run actually used**, read
from the finished-run record — otherwise changing the default silently relabels finished cards.

*My amendment:* Fable also wants "Name, edited" when the unit's settings no longer equal the recipe.
That is right, and it is a new UI string, so it goes in the same batch as the rest — see "Still
blocked".

### The defect most likely to go unnoticed for weeks

**The card naming one recipe while the supports were built from another.** Three readers (the scan,
the confirm, and the placement job reading `unit.settings`) plus the `own` branch on re-runs. The
guard is in `pipeline.real.test.ts`: run with a recipe whose pillar differs from the type's, assert
the settings handed to `dentalConfirmTilt` deep-equal `resolveSettings` of the finished unit and of
the resolved recipe, then re-run with a second recipe and assert they change. The walk's parity check
stays on Type default.

---

## Build order

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

## Done already

The enlarge overlay's edit key (the owner's first sentence) — it is the card's own Open handler, so
where it lands is decided in one place, and it reads **Edit supports** on a built card. Verified on
screen.

## Still blocked

Every new string here is English only until Gemini's daily quota resets. Nothing is hand-translated.
`src/i18n.test.ts` and `src/items/detectState.test.ts` stay red until then and the full gate stops
at them; everything else is run separately and kept green.

---

## What happened, 2026-11-19 night

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

### What the gate says now

```
npx tsc --noEmit    clean
npx vitest run src  1738 passed, 2 failed (both the i18n guards - strings are English-only)
npm run walk        ALL PASS (191 checks, 2136 s)
  x0p the step screens and auto-gen build the SAME supports | by hand 94, auto-gen 94
```

## Round 5 — the open question was a dead screen

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

## Part 3 — item 7, a real move for a support tip (agreed with Fable, 2026-11-19)

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

### The rules, and why each one is that way

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

### An automatic tip moves too, as a second commit

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

### What building it actually cost, which was not the geometry

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

### And the app's own preview pane cannot test a drag at all

This is worth more than the feature. Instrumented counters showed `hoverModel` and `hoverSupport`
called **zero** times across a complete drag in the desktop app's browser pane, while the press
armed correctly and window-level travel measured 193 px. Hand-dispatched `PointerEvent`s at the
canvas reach r3f not at all. So a pointer gesture in the 3D view is **invisible** to the pane and
provable only by Playwright, whose mouse moves are real — which is what the rim-anchor drag check
`u5d` has always depended on. The pane remains good for reading the DOM, panels and screenshots.

### What the guard covers, and the one thing it does not

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

### The guard

One walk check in Step 3: drag a selected tip, assert the position changed, the total count and the
selection did not, and that a single Undo puts it back. The likeliest break is a release that counts
as both a move and a click, because two listeners hear the same pointerup — which a unit test of the
pure function cannot see, and which is the whole reason the walk check exists.

### Still open

- **The translations.** The prompt at `docs/translation/2026-11-19-missing-strings.txt` is rebuilt
  from the guard's own output rather than kept by hand, because a hand-kept copy went stale within a
  day. Gemini's free tier is 20 requests a DAY and resets around 16:00 on 2026-11-19. Nothing is
  hand-written, by the owner's standing rule.
- **Build-order item 7, a real `manual/move` for a support tip** — designed with Fable, not built,
  and the reason is now a better one than the hour of the night. `src/ui/renderer.ts` sets
  `DEFAULT_RENDERER = 'three'` ("the renderer the walk proves") and the walk defaults to three, so a
  gesture written against the Babylon layers would be unreachable in the default app and invisible
  to the gate — while writing it for both renderers is the two-implementations defect this document
  is otherwise about. Which way that goes is the open question, and it is Fable's to answer.
- The four debts in `src/recipes/README.md`, with their reasons.
