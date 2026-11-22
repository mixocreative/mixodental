# src/items: the deck, and what a dropped file's card says

This folder is the deck: the page, its two kinds of card, the batch that orients them, and the
pictures on them. `rowState.ts` is pure: no React, no DOM, no strings. It returns a state and the
numbers that state needs; the UI picks the words.

Plan: `docs/design.md#2026-11-07-import-and-items-flow` (§3 for the states, §8 step 6 for this piece).

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
| `detectState.ts` | what a row shows about ITS OWN orientation, in ITS OWN job's words: `detectChip` for the line, `detectSentence` for the tooltip and the rail |
| `useBatchDetect.ts` | the batch itself: one detection per row, one at a time, each row's own result, under the case's answer or that row's own override |
| `thumbnail.ts` | WHICH row needs a picture and WHERE its camera goes — no GL in it |
| `useThumbnails.ts` | the cache, and drawing one row per task so the list paints between them |
| `orbit.ts` | pure: a framing and two angles in, a camera position out. Where turning a card's model is tested |
| `CardShot.tsx` | a card's picture: the cached still, the live canvas over it, and the busy overlay |
| `deckBudget.ts` | pure: what a whole case costs to hold and to generate, and how much room is left |
| `ItemRow.tsx` | ONE CARD per model: picture, name, size, a health mark, a status chip, the control that says what THIS one is, and Remove |
| `RefusedRow.tsx` | a file that never became a unit, as a row with the same columns |
| `ItemsPage.tsx` | LAYOUT ONLY: the grid of cards, which card's picture is live, the budget line and the tally underneath. It holds no state about a card except that |
| `rowPurpose.ts` | pure: what a card IS - the type its work was built with, else the operator's answer; which type a row opens with; whether it holds typed work (a type change on it asks first); the rows' common type, for Set all's type list |

`drawThumbnail.ts` is **not** in this folder: it lives in `src/components/viewport/` because
`threeBoundary.test.ts` keeps three.js in the view layer, and they are the three files of the feature that
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

So `components/viewport/deckRig.ts` keeps ONE renderer for the deck, made on first use. Not one per row: browsers
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
- **So the cache is keyed on the model AND the rotation**, and leaving the rotation out was a defect
  rather than an economy (found by the 2026-11-11 audit, `docs/reviews.md#2026-11-11-cia-audit` MIXO-16). The pictures
  are drawn in tens of milliseconds as soon as the deck is up; the batch then orients one row at a
  time, seconds each, writing a new `transform` to the SAME `source`. Keyed on the mesh alone, every
  row the batch turned kept its pre-orientation picture while the line beneath it said "Turned
  upright." The rotation is compared **by value**, not by identity: `transform/set` clones on every
  write, so an identity test would redraw a row on a write that changed nothing. Only the rotation
  is compared, because the camera centres on the model's own box — a move cannot change the picture,
  and `ModelTransform` carries no scale.

## What a CARD looks like, and the rules that decide it (2026-11-18)

The deck became a grid of cards the same day the rules below were written for rows. The owner's
reason is the trade itself: *"deck is cards, not rows. That way your preview 3d model can go larger
but show more compact cards on screen?"* A row spends the window's whole width on one model and
stacks the next below it, so a bigger picture costs scroll; a card spends ~230px and tiles, so the
picture gets three times the area AND more models fit on a screen.

**The markup did not change.** The same children in the same order, laid out by `grid-template-areas`
instead of seven columns - which is why the gate's 37 `.items-row` selectors and every
`data-ui="items-row-<id>"` still mean what they meant. The class name is now a lie about the layout
and it stays one on purpose: renaming it is ~70 mechanical edits across a gate script and the
designers' own naming contract, for no change a user can see. Debt, written down.

**The picture is live on the card being looked at.** `CardShot.tsx` holds both surfaces - the cached
still as an `<img>`, and a 2D `<canvas>` the deck's single renderer copies frames into. One model is
live at a time and `ItemsPage` owns which, because "only one" is a fact about the SET and a card
cannot know about its neighbours. Sixty live canvases would be sixty WebGL contexts against a cap
near sixteen. The maths of turning it is `orbit.ts`, pure and tested - including the property that
makes the handover invisible: the first live frame is framed exactly as the still it replaces.

**Three modules, three jobs:** `orbit.ts` (pure, no GL), `components/viewport/liveCardView.ts` (the
GL half), `CardShot.tsx` (the surfaces and the pointer). The GL lives under `viewport/` because
`threeBoundary.test.ts` keeps three.js in the view layer.

## The four rules the ROW had, which the card kept (2026-11-18)

The row is a **line in a worklist**, not a card. It was a three-row grid measuring 109px per row
until the owner looked at a real case: *"the deck looks awful, not compact enough."* A stage case is
10-30 models, so every pixel of row height is multiplied by thirty. Four rules hold it down, and each
one is here because breaking it produced a defect somebody had to find on screen rather than in a
file:

1. **Every text cell clips rather than wrapping.** `tile | name | size | health | status | category
   and type | keys`. A sentence that wraps is what made the row three tall, so every text cell gets
   `text-overflow: ellipsis` and carries its full wording in `title`. The keys share ONE cell
   (`.row-actions`): Retry exists only on a failed row, and as an eighth child it wrapped the row and
   overlapped the one below.
2. **A quiet row says nothing.** A sound mesh shows no verdict and an unqueued row shows no chip.
   Twenty-four rows reading "Ready to print." is how little is wrong, said twenty-four times.
3. **The tile is square, because the picture is.** `drawThumbnail` renders a 160px square of the real
   model as placed. A 36x44 frame stretched that render by a fifth, which is precisely what stops a
   3D render looking like one; it is square and fills the card's width at `object-fit: contain`.
4. **The type is shown, always.** The category control answers *what is this*; the type select beside
   it states *which profile the engine will run* — the pillar diameter, the contact size, the tilt
   rule. Each family ships one profile today, and the deck briefly drew no type control for that
   reason, on the argument that a one-option control is a question with a single answer. It is not a
   question, it is a READOUT, and hiding it meant the operator could not see what they were about to
   print with. Owner, 2026-11-18: *"deck fail to show type, only show category, dangerous gap it
   is."*

And the page around them is **three blocks that fill the window**: `.items-page` is a flex column
with `flex: 1`, which makes it a direct, growing child of `main` (`PanelBoundary` renders no wrapper
of its own). The body is the only block that scrolls; the footer carries `margin-top: auto` for a
short list and `position: sticky` for a long one. Before this the footer sat wherever the list
stopped - owner: *"footer need to stay bottom, shouldnt shrink up."*

## The card's keys, and which of them is the primary one

Five, and never all at once:

| Key | When | What it does |
|---|---|---|
| **Auto-gen** | the card may be generated unattended | Steps 1–3 without opening it (`src/autoGen/`) |
| **Open this model** / **Edit supports** | the card has been named | opens the flow — at Step 1, or at **Step 3** once it has supports |
| **Enlarge** | always | the model alone, full size, turnable, with its own way into the flow |
| **Retry** | the check failed | queues its detection again |
| **Remove** | always | takes the file off the list |

**Auto-gen is absent, not greyed, on a card that may not use it** — owner's ruling 4, and the whole
of what "may" means is one function (`src/autoGen/eligibility.ts`), which the queue asks as well. A
key that cannot appear on a card the queue would refuse needs no explanation for being dead.

**Open changes its words because it changes its destination.** A card that already has supports opens
at Step 3, because Step 1 is the orient step and entering a re-orient now DELETES the supports
(`src/state/rotation.ts`). Sending a generated card through the ordinary door would destroy exactly
the work it was pressed to show. The session gets there by its own event, `openDentalSupports`.

## Ready means ready now, and it did not

Until 2026-11-18 a row read **Ready** whenever the detector did not crash: `detectStateOf` mapped
every non-failed answer to `oriented`. Four things the engine had told us were dropped on the floor —
an absent rotation, an opening that contradicted the chosen type, two up/down rules that disagreed,
and a mesh that was not even closed — and the first of those was the worst, because an absent
rotation means **the engine could not decide which way is up** and the row said *"Already upright."*
The one row that needed the operator was the one reporting good news.

`OrientDoubt` records all five. The card shows **Check mesh** or **Check orientation**, and those are
two chips rather than one because they send the operator to different places: nothing in the flow
closes a mesh, so a mesh doubt reads as a fault and stands until the file itself is replaced, while
every other doubt is answered by opening the model and looking.

"Already upright" is now reachable only for an identity pose, which is what the words mean.

## Three independent answers on one card, still

The health mark, the orientation chip and the auto-gen line are three different questions and none of
them may stand for another:

- a **trimmed arch** is a healthy mesh with no rim — health fine, chip says draw one;
- a card can be **Ready** to the detector and stopped by the queue for want of a support area;
- a **mesh doubt** is both, and says so twice because the two instructions differ.

Collapsing any pair would lose whichever was shown second. `src/autoGen/autoGenText.ts` is deliberately
quiet for the two stops the chip already covers (`no-rim`, `needs-attention`): two lines saying one
thing on a card built to be read in a glance is worse than one.
