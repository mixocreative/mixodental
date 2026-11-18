# The card deck — what is built, and the plan for what is not

Written 2026-11-18. The owner specified a card deck over several messages; this records the whole
ask, what shipped, and the reviewed plan for the rest, so the remaining work is a task list rather
than an archaeology project.

## The owner's ask, in full

1. The deck shows a **card per item**, not a row. *"That way your preview 3d model can go larger but
   show more compact cards on screen."*
2. The preview is a **live 3D render the operator can rotate**, large enough to look around — not an
   image.
3. A **loading percentage overlay** while a card's work runs.
4. The **category icon larger**.
5. The generic **G badge** is a **CSS class the owner designs**, not a drawing.
6. **Dimensions and file size** instead of the triangle count.
7. Clicking the name **opens the folder** the file came from.
8. The browser **remembers the deck** across sessions, *"unless the file is gone"*.
9. **Two buttons per card**: **Auto-gen** (generates everything, then redraws the preview from the
   generated model, with a loading bar) and **Edit** (into the step flow at Step 1).
10. A **safe cap** on how many models a deck may generate, with **models vs cap** and **memory used
    vs allowance** shown on the deck.

## Built

| Ask | What shipped |
|---|---|
| 1 | `.items-list` is a grid, `repeat(auto-fill, minmax(228px, 1fr))`. The markup is unchanged from the row it replaced, which is why the gate's 37 `.items-row` selectors and every `data-ui="items-row-<id>"` still resolve. The class name is debt, recorded in `styles.css`. |
| 2 | `CardShot.tsx` + `components/viewport/liveCardView.ts` + `items/orbit.ts`. One renderer (`deckRig.ts`) serves the whole deck; one card is live at a time and the page owns which. |
| 3 | The busy overlay exists on the card picture and takes a fraction. **Only the detection pass drives it today**, without a fraction — see below. |
| 4 | Square art, 28px on the case control, 32px in a framed row key. |
| 5 | `TYPE_BADGES` in `purposes.ts` carries `{ letter, style }`; the badge wears `.purpose-badge--<style>`. |
| 6 | `PrintUnit.file = { name, bytes, modified }`, captured at import, shown as `62 × 58 × 21 mm · 18.7 MB`. Triangles moved to the title. |
| 10 | `items/deckBudget.ts`, pure and tested. Cap derived from SIZE, with a practical ceiling of 200 so three test cubes cannot print "9,942,004 models". |
| 9 (half) | "Open this model" per card. |

## Not built, and why each is not a small job

### Auto-gen (ask 9, and the percentage in ask 3)

**There is no headless chain today.** `useDentalFlow.ts` is UI-driven: orient → tilt scan → region →
confirm → place are sequenced through the step screens, each stage building its options from
`alignerSettings`, `keptDentalWork`, `defaultDentalTuning` and `presetCommands`. `useRegenerate`'s
`generateDental` is only the LAST step — it takes a `DentalTipPreview` that already exists.

**The risk that makes this more than plumbing:** a headless chain that drifts from the step flow
produces **different supports for the same model**. On a dental print that is not a cosmetic bug.
The guard is a parity test — run the chain on the reference aligner and assert its `DentalPolicy`
and contact ids equal what the step flow produces for the same fixture
(`scripts/test-support/referenceStep3.ts`) — and that test is the work, not an afterthought.

**The queue is already specified and measured.** `scripts/perf/deck-scale.ts` proved the worker keeps
one wasm session per unit and never frees it: **+19.7 MB per item**, flat at −0.09 MB/item once
`sessions.forget(id)` is called after each. Cost of forgetting: 6.2 s → 8.6 s per item. Sixty models
is ~8.6 minutes. `useBatchDetect.ts` is the queue pattern to copy.

Open questions recorded rather than guessed: whether `landPlacements` re-keys hand work; whether
dentures have a headless path at all (the plan disables Auto-gen on them, with the reason shown);
and whether `built` releases support meshes while the deck is up.

**Hand edits must not be flattened.** Contact ids are position-derived (`auto-X_Y_Z`) and removals
are stored by id, so a re-orient can orphan every hand removal. Auto-gen-all skips hand-edited cards
and says how many it skipped.

### Remembering the deck (ask 8)

IndexedDB, database `mixodental-deck`: a `meshes` store keyed by unit id, a `units` store holding
the unit minus its source plus `{ file, handle?, engineVersion }`, and a `meta` row. Handles can
only live there, and typed arrays structured-clone without base64.

Four states a restored card can be in, each with its own words: **present**, **missing** (*"Original
file not found. This copy is kept on this device."*), **changed** (*"The file changed since it was
imported."*), **engine updated** (*"Supports were made by an older version."*). A card is never
removed silently — an unplugged drive looks exactly like a deleted file.

**One decision for the owner:** keeping this device's copy of a model whose original is gone leaves
patient data on the device after the original was deleted.

### Clicking the name (ask 7)

A browser cannot reveal a path — no API exposes one, deliberately. The reviewed answer is
`showOpenFilePicker({ startIn: handle })`: the system picker, opened **in that file's folder**,
which is the only surface a browser allows that shows a real folder — and it doubles as the repair
for the *missing* and *changed* states above.

### Export (not asked, found on the way)

`exportFiles` builds ALL supports and ALL file buffers and transfers them together: ~1.26 GB at 60
models. It must become one unit per task. The symptom is an export that dies at the very end of a
session, after all the work.

## The order to build the rest

1. The headless chain as a plain module, with the parity test. Nothing else is safe until this is.
2. Card progress model: stage weights × stage fraction, routed from the analysis client's
   `onProgress`. This is what makes the overlay a percentage rather than a bar.
3. The queue and the per-card Auto-gen button; `forget` after each item; opening a card pauses it.
4. The hand-edit guard, then Auto-gen all with its skipped tally.
5. The still redraws from the generated model (`Thumbnail.build` in the cache key).
6. The deck store, write side.
7. Restore on open, the file handles, the four states, the name click.
8. Export one unit per task.
