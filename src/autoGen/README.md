# `src/autoGen` — generating supports with nobody watching

The deck's Auto-gen: one aligner taken through Steps 1 to 3 without the step screens, so a case of
thirty files does not have to be walked one at a time.

The owner's rulings this folder exists to obey are recorded in
[`docs/design/2026-11-18-card-deck-plan.md`](../../docs/design/2026-11-18-card-deck-plan.md). Two of
them shape every file here:

- **Ruling 2 — the model must land in Step 3's own state**, so Support Edit Mode works on it
  unchanged and nothing in the editor can tell who got it there. A consequence worth stating: an
  auto-generated card opens at **Step 3, never Step 1**, because Step 1 is the orient step and
  re-orienting deletes supports.
- **Ruling 3 — three layers, on purpose.** Eligibility is pure, the pipeline has no React, the queue
  has React. The middle layer can therefore be run under Node against a real customer scan, which is
  the only reason the parity proof is possible at all.

## The map

| file | job |
|---|---|
| `eligibility.ts` | **May** this card be generated unattended, and if not, why. Three facts in, one verdict out. |
| `pipeline.ts` | One aligner through Steps 1–3: five engine calls, every decision taken by `src/dental/stages.ts`. No React. |
| `pipeline.real.test.ts` | The pipeline on a real scan under Node: it finishes, it lands Step 3's state, it is deterministic. Skipped when `dentalwork/fixtures` is absent. |
| `useAutoGen.ts` | The queue: one job at a time, per-card state, Auto-gen all, Stop. React. |
| `autoGenText.ts` | What a card says about its own run. Pure: a state in, a message out. |

## What keeps auto-gen from making different supports from the editor

Not this folder. [`src/dental/stages.ts`](../dental/stages.ts) — the stage decisions were lifted out
of `useDentalFlow` so that **both** paths call one implementation. The pipeline restates not one
rule: the settings a new aligner starts with, what a detected area becomes, what the tilt scan is
asked to try, which angles the confirm tries, whether the kept area comes back, the starting label,
and the turn-with-re-layout pairing all come from there.

That is parity by construction. The tests guard the seam rather than carry it:

- `pipeline.real.test.ts` (here) proves the pipeline runs and repeats itself exactly.
- the walk's auto-gen parity check proves the end state equals the editor's, in a real browser, by
  dropping the same aligner twice and taking one through the screens.

A node test cannot do the second one — the editor's path is a hook driving screens — and saying so
is cheaper than a test that looks like parity and is not.

## What `Ready` means now, and what it used to mean

Before 2026-11-18 a deck row read **Ready** whenever the detector did not crash: `detectStateOf`
mapped every non-failed answer to `oriented`. A model whose pose could not be decided, whose opening
contradicted the chosen type, whose two up/down rules disagreed, or whose mesh was not even closed,
all read Ready — and the first of those read *"Already upright."*, which is the worst of the four,
because an absent pose was being told as good news.

Those doubts are now recorded on the detect state (`src/items/detectState.ts`, `OrientDoubt`) and
this folder's `eligibility.ts` is their only reader for the queue. The card shows **Check
orientation** or **Check mesh** instead, and those are different chips because they send the
operator to different places.

## The trap this folder cost a round on

`sceneRef.current = scene` happens during **render**, and `dispatch` goes through a reducer - so
`sceneRef.current` is **one render behind a dispatch**. The queue's first version read it back as
"the scene after this commit", which returned the scene *before* it, so every step after the first
computed from a stale unit: the accepted policy was invisible to the placement step,
`dentalPlacementJobOf` answered `undefined`, and the card said *"Generating supports failed"* on a
model the same pipeline finishes in twelve seconds under Node.

`useAutoGen` now reduces each batch into its **own copy** with the app's own reducer and hands that
to the pipeline. The dispatches still land in order, so the real scene ends in the same state; the
copy exists only so the next step reads what the last one wrote.

`App.tsx` warns about this ref twice and `useImportFiles` carries the same warning. It was read and
walked into anyway, and what caught it was pressing the key and watching the card - not reasoning,
not a type, not a test. That is this project's standing lesson and this is one more entry for it.

## Where each layer is tested, and where the queue is not

| layer | tested by |
|---|---|
| `eligibility.ts` | `eligibility.test.ts` - every doubt, through `detectStateOf` on a real engine answer shape |
| `pipeline.ts` | `pipeline.real.test.ts` - a real customer scan under Node, end state and determinism |
| `useAutoGen.ts` | **the walk** (`m12`, `m12b`), and nothing else |

The third row is a decision, not an oversight. The hook is a queue and a state map; every rule it
could get wrong lives in the two layers above it, which are pure and tested in milliseconds. This
repo has no hook-rendering harness - `ItemsPage.test.tsx` renders to static markup - so a unit test
for it would mean introducing one for a file whose own logic is "run the next id". The walk drives
it through the front door on the real reference aligner instead, which is the only place its one
genuine risk (the React scene being a render behind) can show.

## What Stop costs, measured

Pressing **Stop** mid-run on a card that ALREADY had supports leaves it with none. That is not a
bug in the queue: the pipeline's first step is the orientation, re-orienting clears supports
(`src/state/rotation.ts`), and a run abandoned after that step has cleared them without replacing
them. **Undo brings them back** - the commits are in the scene history like any others - and it is
exactly what entering Step 1 by hand and walking away does.

It is still a surprise, and it is written down rather than smoothed over because the honest fix needs
words on the card ("the supports this card had were cleared"), which is a new UI string, and new
strings need Japanese and Taiwan Chinese before they can ship. Owner's call.

## What it does on the real reference aligner

Measured 2026-11-18 on `docs/dental-reference/reference-aligner.stl` (374k triangles), in the app:
**94 supports placed**, about forty seconds from the press, and the card's Open key becomes **Edit
supports**, which lands at Step 3 with the 94 still there. The footer agrees: *94 automatic, 0
manual, 0 removed*.
