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

### Still open

- **The translations.** 51 strings; Gemini's free tier is 20 requests a DAY and it resets around
  16:00 on 2026-11-19. The prompt is built and waiting (see the handoff memory). Nothing is
  hand-written, by the owner's standing rule. The prompt is committed at
  `docs/translation/2026-11-19-missing-strings.txt`, so one request finishes it.
- **Build-order item 7, a real `manual/move` for a support tip** - untouched. It is a new pointer
  gesture in the viewport, which is exactly the kind of change this session's evidence says needs a
  person looking at the screen while it is made, so it was not started at five in the morning.
- The four debts in `src/recipes/README.md`, with their reasons.
