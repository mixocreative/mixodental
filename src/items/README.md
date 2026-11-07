# src/items: the deck, and what a dropped file's row says

This folder is the deck: the page, its two kinds of row, the batch that orients them, and the
pictures on them. `rowState.ts` is pure: no React, no DOM, no strings. It returns a state and the
numbers that state needs; the UI picks the words.

Plan: `docs/design/2026-11-07-import-and-items-flow.md` (§3 for the states, §8 step 6 for this piece).

## The nine states, and why there are nine

Three sources, because half of what a row can say never reaches the engine at all:

| From | States |
|---|---|
| **A file that never became a mesh** | `unreadable`, `too-big` |
| **`diagnose_mesh`**, before any press | `clean`, `holes`, `malformed` |
| **`repair_mesh`**, after a press | `refused`, `unchanged`, `repaired`, `repaired-open` |

Each group is a **partition** — the conditions cannot overlap and cannot all miss — and a test proves
every state is reachable and that the declared list and the reachable set are equal.

That matters because an earlier revision of the plan got it wrong twice. Its first table was not
mutually exclusive, so a holed file matched the row reading *"Clean. Nothing to do."*; the fix made
the rows exclusive but not exhaustive, so an untouched file fell through to *"Repaired."* Both are
false statements about a file the operator is about to print, which is why the set is tested rather
than described.

## Two states the measured scans actually produce

`scripts/measure-rim-loops.mjs` ran `diagnose_mesh` over all 18 local real scans:

- **Zero open boundary rims.** So `holes` is the state this corpus never reaches, and the fill limit
  is **0** — fill nothing — because no rim exists to justify any other number.
- **8 of 18 files have non-manifold geometry**, up to 5,547 non-manifold edges and one file reporting
  525 bodies. Several are **not watertight with no hole in them**.

So `malformed` is the common case, and `watertight` is *not* a synonym for "no holes" — which is the
whole reason `clean` checks `watertight` rather than counting loops.

`unchanged` is on the common path too, not a curiosity: with the fill limit at 0 every loop reports
`fill-disabled`, and `fill-disabled` is **not** a refusal, so a repair can legitimately run, succeed
and change nothing. Calling that "repaired" would be the same class of lie as the two above.

## Why it is not under `core/import/`

It was written there first, on a reviewer's suggestion, and `importOracleBoundary.test.ts` refused
it: that folder is pinned to exactly `estimate.ts` and `stlHeader.ts`, because the TypeScript import
geometry was deliberately moved to Rust and the guard stops it creeping back. Widening the guard's
list would have weakened a boundary that is doing its job.

It belongs here regardless. The importer produces a report; this turns a report into a row.

## Where the verdict comes from, and where it lives

`diagnose_mesh` runs once, in the import worker, on the full-resolution mesh — never the display
copy. The engine's per-body report does not cross the worker boundary: `diagnoseImported` reduces it
to the seven fields of `ImportDiagnosis`, which are plain numbers and booleans and so structured-clone
with no transfer list.

`ImportDiagnosis` is declared in `src/state/diagnosis.ts`, a leaf with no imports of its own. It has
to be reachable from the worker, from `PrintUnit`, and from here, and `src/state/import.ts` already
imports from `src/state/project.ts` — so either of those two as its home would mean a cycle one way
or the whole scene module dragged into the worker bundle the other.

From there it is **saved on the unit** as `PrintUnit.diagnosis`, carried over by
`placeImportedUnits`. It describes the mesh as imported, so no command touches it; a repair is the
one thing that may replace it, because a repair is the one thing that replaces `source`.

`ImportDiagnosis` **picks five of its seven fields from the vendored `RepairReport`** rather than
re-declaring them. The first version spelled them out again and `noDuplicatePackages.test.ts` refused
it — 57 % of its lines matched `host/core/repairMesh.ts`. Picking leaves the engine owning those
fields' meaning, so a rename on that side breaks this build instead of leaving a stale second
definition behind.

It also carries `triangles`, which no row displays. That field is what makes a **saved** verdict
self-checking: one that outlived the mesh it describes is worse than none, because the row states it
as fact. Nothing replaces a unit's `source` in the build as it stands, so staleness cannot happen
yet — step 9's repair is the change that would cause it, and `normalizeUnit` compares the count
against the attached mesh and drops a mismatch, so the invariant is checked rather than remembered.

A saved verdict is re-checked by `normalizeUnit`, and a malformed one is **dropped rather than
thrown on** — the opposite of `rimDraft` and `dental`, which stop the load. Those reach the engine;
this is a label on a row, and a project with sound geometry should not refuse to open because a
label is corrupt. An absent verdict reads as "not diagnosed", which is honest where a half-parsed
one is not.

That gate takes `diagnosis` out of `normalizeUnit`'s `...unit` spread before re-adding it. Every
other optional field there uses `...(unit.x ? { x } : {})`, which is safe only because its empty
branch means the key was absent anyway. This gate can reject a value that is *present*, and spreading
`{}` adds nothing — it does not remove what the earlier spread already copied in.

## Four of the nine are not reachable in this release

**Repair is cut** (plan §8 step 9), so nothing presses it: `refused`, `unchanged`, `repaired` and
`repaired-open` cannot occur, and only `unreadable`, `too-big`, `clean`, `holes` and `malformed` need
words, `kit.html` markup or translations.

The nine stay here anyway. The classifier is pure, proven and costs nothing to keep, and
`verdictOfRepair` plus `offersRepair` are the brief for the step's return — the day a holed scan
exists and the fill limit stops being 0. What was cut is the UI's obligation to have sentences for
states nothing can produce, not the knowledge of what those states are.

One thing follows for the verdict: nothing in this release replaces a unit's `source`, so a saved
verdict cannot go stale. The `triangles` gate below stays regardless — it costs one comparison and it
is what will make repair safe to write.

## What is here

| file | what it decides |
|---|---|
| `rowState.ts` | the nine states, as three partitions |
| `rowText.ts` | what a row SAYS, as a `Message` so it re-translates |
| `nextItem.ts` | which item the loop goes to next, and how many are left |
| `itemSummary.ts` | the row's text preview: triangle count and size in mm |
| `dropGrain.ts` | whether a drop is one file or many, and which of its files are importable |
| `refusalOf.ts` | which refusal an import error is, so a refused file can be a row |
| `detectState.ts` | what a row shows about ITS OWN orientation, and how many are still to look at |
| `useBatchDetect.ts` | the batch itself: one detection per row, one at a time, each row's own result |
| `thumbnail.ts` | WHICH row needs a picture and WHERE its camera goes — no GL in it |
| `useThumbnails.ts` | the cache, and drawing one row per task so the list paints between them |
| `ItemRow.tsx` | one model's row: its picture, its name, its size, and its two independent answers |
| `RefusedRow.tsx` | a file that never became a unit, as a row with the same columns |
| `ItemsPage.tsx` | LAYOUT ONLY: the rail down the left, the rows beside it, the tally underneath |

`drawThumbnail.ts` is **not** in this folder: it lives in `src/components/viewport/` because
`threeBoundary.test.ts` keeps three.js in the view layer, and it is the one file of the feature that
touches a renderer. The section below says more.

**`ItemsPage.tsx` is layout and nothing else**, and it is worth saying why it was split. It used to
render both kinds of row inline and ran to three times its present length, which made the page the
place you had to read to learn what a row says. A row is the thing that knows what a row says, so
each kind owns its own module and works out its own sentences; the page is left holding the
arrangement. Nothing about the rendered markup changed — the page's own tests passed untouched
across the split, which is what made it a safe refactor rather than a rewrite.

Its `data-ui` names are **keyed to the unit and never to a row index**, and the whole list — the
unit rows, the refused rows, the rail and `items-tally` — is in the app's one table in
`docs/ui-styling.md`. A partial copy stood here and had fallen four names behind it; a list in two
places only tells you which copy you happened to read.

## All five sentences are reachable now

`refusalOf.ts` turns the error that refused a file into an `ImportRefusal`, `verdictOfRefusal` turns
that into a row state, and `RefusedRow` renders it — so `unreadable` and `too-big` can occur.

**They could not before.** `verdictOfRefusal` had no production caller at all: a refused file was
reported on the status line and vanished, so two of the five sentences were text for rows that could
not exist — the same fault this module refused to commit for the repair states.

The status line can say only one thing, which is the operator-facing reason this matters: a drop of
eight with two bad files named one of them and **lost the other**. Rows can say which.

The four repair states stay unreachable, and deliberately: repair is cut (plan §8 step 9), so nothing
can press it.

## Repair is cut, and the row states for it are not reachable

`offersRepair()` is the one piece of policy already decided: a refusal never re-offers the press
that just failed.

## Two things on a row, kept apart

A row carries two independent answers and they must not grow into each other.

`rowState.ts` answers **is this mesh healthy** — from the verdict, which `diagnose_mesh` produced
once at import. `detectState.ts` answers **which way up is it** — from `dentalOrient`, which runs
per row after the purpose is pressed. A trimmed arch is a perfectly healthy mesh with no rim, so one
can be fine while the other has nothing to offer; collapsing them into a single "row status" would
have to pick which of those two facts to drop.

Both are pure and neither owns its words: the page picks the sentence, so a row re-translates with the
language switch like everything else.

**The batch runs one row at a time, which `useBatchDetect.ts` argues for at length and is worth
repeating here:** `AnalysisClient`'s `TriangleGate` would queue these more cleverly by triangle
budget, and it still stands underneath as the memory guarantee. Sequential submission buys something
the gate cannot — a row reads `running` only when it IS running. Submitting all at once would show
"Checking the orientation…" on every row while most sat in a queue, which is one lie told N times.

## The row picture, and the renderer it is NOT drawn with

The design doc's §7 ruled this preview must be text, because a 3D preview per row would be the
release's only new per-row memory cost. §0b reverses that on a distinction worth keeping straight:
**N live viewports is not N cached images.** A 160 px PNG is tens of kilobytes beside a 12.2 MB mesh,
and it is drawn once.

The first attempt drew it with the app's own renderer, from a component inside the one `<Canvas>`
— the `PlateSide` pattern. **That cannot work here, and the reason is worth recording so nobody
tries it again:** the workspace, and so the Canvas, is mounted only when `startScreen === null`
(`App.tsx`), and the deck IS a start screen. There is no renderer to borrow at the moment the
pictures are wanted. Mounting the workspace behind every start screen would be a wide behaviour
change that walk checks `u1a` and `l2g` rest on — the start screens have no panels — which is far
more than a row picture should cost.

So `drawThumbnail.ts` keeps ONE renderer for the app, made on first use. Not one per row: browsers
cap GL contexts near sixteen and a drop of twenty would start losing them. Each model is uploaded,
drawn and disposed in turn, so the peak is one model's geometry rather than the deck's.

Two details that are easy to get wrong:

- **An entry with no `url` still counts as drawn.** A device with no WebGL returns no picture, and if
  a pictureless row stayed out of the cache `nextThumbnailToDraw` would hand it back on every pass — a
  draw loop that never settles. This release has already paid for that shape of bug once, in a 600 ms
  re-check that ran for ever.
- **The camera frames the model AS PLACED**, from the box of the mesh with the unit's transform
  applied. Framing the file's own frame would undo the orientation work the row is reporting in words
  on the line below.
