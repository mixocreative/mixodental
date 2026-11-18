# `src/recipes` — the operator's own support settings, kept on their device

A **recipe** is a named set of build settings. Auto-gen builds with it, the step screens build with
it, and it is remembered between sittings. Owner, 2026-11-19: *"Autogen also need a profile system
to set default support settings and shall be remembered across sessions on user browser cache. Use
be able to add new support setting profile so auto gen use it and can be switched for each item auto
gen (show which is in-use)."*

## Why it is a "recipe" and not a "profile"

Because **profile already means the aligner type** in this app (`reference-aligner`,
`reference-denture`) — it decides geometry rules and is chosen per card on the deck — and **preset
already means LIGHT / MIDDLE / HEAVY**. A third concept wearing either word would be audit MIXO-14
again, where "Step 1" named two different screens.

`recipe` appears nowhere else in this repo, and a grep can keep it that way.

## The map

| file | job |
|---|---|
| `supportRecipe.ts` | What a recipe is, which settings it pins, and how it is applied. Pure. |
| `recipeBook.ts` | The stored list: parse, load, save. Pure, with an injected `Pick<Storage>`. |
| `useRecipes.ts` | The React layer: the book, which card is set to which, and the five edits. |

## What it pins — and the field that must never be in it

**`labelText` is not pinned.** `dentalLabelCommands` keeps whatever label the settings carry, so a
pinned one would be embossed on **every aligner in the case**. That single field is why "pin the
whole settings object" is the wrong answer, and it is the first thing to check if this list is ever
widened.

Also never pinned: `preset`, `roofSeededModes`, `previewMode`, `eraseRadius`, `autoSnap`,
`lowPolyMode` — one operator's view of a model, not a property of the supports.

Everything else is a build key, so `RECIPE_KEYS` is written as *everything except* that short list.
**`supportRecipe.test.ts` pins the resulting count**, so the next engine release that adds a setting
fails the test and a person has to say which kind it is. A new build key silently left out is the
quiet version of this feature not working.

## The seam, and the trap it was built around

`alignerSettings(unit, profile, recipe?)` in [`src/dental/stages.ts`](../dental/stages.ts) is the
**only** resolver, and `presetCommands` emits *its* answer rather than resolving the type's numbers
itself.

That second half is not tidiness. The placement job reads `unit.settings`, which `presetCommands`
writes at accept time — so while it resolved its own numbers, the print-angle scan and the confirm
would have judged the **recipe** while the supports were built from **type defaults**. Both look
plausible on screen, and nothing would ever have said so. It is guarded in `pipeline.real.test.ts`:
on a real scan, every recipe key the confirm was judged with must equal what the finished unit
carries, and a second recipe must move both.

**The editor passes the same selection as the queue.** A card labelled "Thin" that is opened by hand
must get "Thin", or the two paths have diverged — which is what `stages.ts` exists to prevent.
`useDentalFlow` and `useRimDrawing` both take `recipeFor`.

## Debt, written down rather than implied

- **A hand-drawn rim or a painted area does not carry the recipe's Tree and Brace switches.** Those
  two live on a `two-contour` policy; `manualAreaPolicy` builds a `legacy` one, which has no field
  for them. So between drawing a rim and accepting an area, the row names a recipe whose switches
  are not on the policy. Fixing it means giving the legacy policy a structure, which is a change to
  saved project data.
- **`roofMode` is pinned while `roofSeededModes` is not** (see `supportRecipe.ts`): toggling the
  roof off and on can re-seed the engine's defaults over a recipe's roof numbers. Reachable only
  from the bench's settings panel, not from the dental steps.
- **A recipe can lose a key quietly and keep its name.** `parseRecipe` drops a stored value that is
  the wrong type or out of `settingLimits` and keeps the row, so a release that tightens a limit -
  or a hand edit - makes "Thin" build with the type's value for that key, and `matchesApplied`
  compares against the *parsed* recipe so the card never says "edited". The same is true of a stored
  `defaultId` that no longer resolves: it becomes Type default with no `problem`.

  Both are this module's own "silent death 1" in miniature, and both are **deliberate for now**:
  the alternative is a book-level `problem`, which stops EVERY card in the case because one key in
  one recipe was dropped. The honest fix is a per-recipe mark on the chip, which is UI work and a
  new string. Written down rather than smoothed over.
- **A second tab's deletion is not observed** until this one reloads. Nothing re-reads storage
  mid-session; writes are safe (each is applied to a freshly read book), reads are a snapshot.

## Where each layer is tested, and where it is not

| layer | tested by |
|---|---|
| `supportRecipe.ts` | `supportRecipe.test.ts` - what it pins, what it must never pin, how it applies |
| `recipeBook.ts` | `recipeBook.test.ts` - both silent deaths, a hand-edited value, a second tab |
| `pipeline.ts` with a recipe | `pipeline.real.test.ts` - agreement across every reader, on a real scan |
| `useRecipes.ts`, `RecipeRow.tsx`, `RecipeChip.tsx` | **nothing automated** |

The last row is a decision. Every rule those three could get wrong lives in the two pure modules
above them, which are tested in milliseconds; what is left is React plumbing, and this repo has no
hook-rendering harness. They were instead **driven in a browser on the real reference aligner**:
a recipe saved at Step 3 with pillar 2.4, the card switched to it, auto-gen run, and Step 3 reopened
showing 2.4 - then Type default chosen, and the pillar measured back at 1.4. Two dead controls were
found that way and are fixed; neither would have shown in a unit test of the modules.

## Storage, and the two silent deaths it is written against

One key, `mixodental.recipes`, following `src/plate/printerProfiles.ts`.

1. **A selection that cannot be resolved must never quietly become "the defaults".** An operator who
   chose "Thin" and silently got type defaults has supports they did not ask for on a model they are
   about to print. An unreadable book reports `problem`; a card whose recipe has gone **stops**
   (`AutoGenStop` `recipe/missing`) and says so.
2. **A failed read must never be followed by a write**, which would replace the operator's list with
   whatever this session happens to hold. `saveRecipes` re-reads first, refuses after a parse
   failure, refuses to write over a newer version, and keeps rows another tab added.

The **selection is per sitting**; the **default is remembered**. Selection is keyed by unit id, and
unit ids do not survive a reload, so storing them would be a growing list of keys matching nothing.
"Use this one from now on" is the part an operator actually means to keep.
