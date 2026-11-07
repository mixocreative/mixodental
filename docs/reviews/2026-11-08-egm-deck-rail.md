# EGM review — the job deck, the tool rail, and the revisions model

**Target:** the deck increments on `main` (`src/deck/`, `src/items/`, `src/state/project.ts`'s
`revisions`), reviewed before any of the review-fix work was committed.
**Lenses:** three EGM reviews run in parallel (design, codebase details, comprehension).
**Rule followed:** every finding was re-traced against the code here before it was acted on. Two
reviewer premises were wrong and were corrected rather than adopted — `prunedThumbnails` is live, and
the four rail states do match the design.

This file is a **ledger**, not a second account. Each row says where the answer lives, because the
reasoning belongs at the code it governs and one copy is the only copy that stays true.

## What was removed

| finding | where the answer lives |
|---|---|
| `toolEntry.ts` was unreachable, hard-coded the aligner stage order, and bypassed the Step-3 confirmation | deleted; `src/deck/README.md` → "Pressing a tool" keeps all three reasons so it is not rebuilt the same way |
| `accepted`, `stillToDetect`, and a `busy` override parameter had no caller | deleted with their tests |
| `nextRevision` was exported for nothing | un-exported in `src/state/revisions.ts` |
| `aria-pressed` on four buttons that are not toggles | removed; `docs/ui-styling.md` no longer claims an open-tool look |

## What was wrong in the rules

| finding | where the answer lives |
|---|---|
| A rim that EXISTS was never stamped, so Rim could not read stale while Area did | `src/state/project.ts` → `dental/set` stamps rim and area together; `src/deck/README.md` → "Staleness" |
| An abandoned rim drawing aged the area for ever — `rim/set` fires per anchor | `project.ts`: a draft stamps nothing. A rim is accepted when promoted into `unit.dental` |
| The Tree/Braces toggle marked supports stale over a change that never moves the footprint | the `settingsOnly` flag on `dental/set`. The reducer cannot detect this itself, because `cloneDentalPolicy` rebuilds the rim — a test pins that trap |
| `oriented` was inferred from a drawn rim, which is backwards: rim drawing is entered when detection found NO rim | `src/deck/unitFacts.ts` — the docstring carries both wrong readings, since the first fix introduced the second |
| A denture was told to "draw the rim first" on a job that never draws one | `unitFacts.ts` — `isDenture`, and why a denture has no area step |
| The thumbnail uploaded the full import mesh to make a 160 px picture | `src/items/useThumbnails.ts` — `displayMesh(unit.source)` |

## What was wrong in the structure

| finding | where the answer lives |
|---|---|
| `src/state/` imported from `src/deck/` while `src/deck/` imported back: a directory cycle | `ToolId`/`TOOL_ORDER` → `src/state/tools.ts`, staleness → `src/state/revisions.ts`; `src/deckBoundary.test.ts` keeps it one-way — checked by putting the import back and watching it fail, so it is not a test that passes whatever the code does |
| Two parallel maps (`NEEDS`, `BECAUSE`) bridged by a cast | one `PREREQUISITE` record per tool in `src/deck/toolState.ts` |
| `ToolFacts.busy` shared a word with `ToolState`'s `busy` kind | renamed `runningTool` |
| `thumbnailNeeded` returned a unit but read as a boolean; a row's `shown` prop meant "the rail acts on this one" | `nextThumbnailToDraw`, and `onRail` / `items-row--on-rail` |
| The deck README argued the same rules its modules argue, with five claims the code contradicted | rewritten: 236 → 149 lines, the README is the map and each module keeps its own history |

## The walk check that was passing because of the bug

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

## Open, and deliberately not done

- **Copyright headers are on 15 of 226 source files.** Which way to make that consistent is a
  licensing decision, not a refactor. Recommendation: drop the 15 rather than add 211 — the build
  already emits `dist/THIRD-PARTY-NOTICES.txt`, and a header 93% of files lack teaches nothing.
- **`App.tsx` is ~1700 lines.** The real organisational debt of this release, named rather than
  quietly refactored under a review pass.
- **`drawThumbnail`'s renderer is never disposed.** Deliberate: one GL context for the app's
  lifetime, because browsers cap contexts near sixteen. The module's docstring argues it.
