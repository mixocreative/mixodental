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

---

## Owner's rulings on the auto-gen pipeline (2026-11-18, late)

Settled in conversation after the plan above was written. Where these disagree with anything earlier
on this page, these win.

### 1. Re-orienting ALWAYS clears the supports

> *"Yes reorient always clear supports it is industry standard."*

**This is not what the app does today.** Re-orienting stamps a revision, marks the supports **stale**
(`supportsNeedReplanting`), and only the EXPORT refuses (`useExport.ts`, `refuse('replant', name)`).
So an operator can sit looking at supports that belong to a previous orientation and find out at the
very end. Under the ruling they are gone at the moment of the decision instead.

It must be **warned before and undoable after** — the regenerate path already offers Undo.

**It also deletes a whole class of defect.** Automatic contact ids are position-derived
(`auto-X_Y_Z`) and manual removals are stored by id, so a re-orient could orphan hand work; the
re-key path was never proven on this route. If the supports go, their edits go with them,
deliberately and visibly. There is nothing left to silently re-key.

### 2. Auto-gen must land the model in STEP 3'S OWN STATE

> *"the deck auto support pipeline allows and preserved the capability on what we did in step 3
> where there's supposed to be a support edit mode"*

**The acceptance criterion, in one sentence:** auto-gen leaves the model in exactly the state Step
3's accept leaves it in, so opening the card lands in Step 3 with Support Edit Mode live, and
nothing in the editor can tell whether a human or the queue got it there.

Support Edit Mode is real and gated on the stage (`src/dental/editing/dentalStep3.test.ts`):
`edit.add`, `edit.deleteSelection` over a tip selection, and the per-support shape overrides
(`contactSettings/set` takes a list of contact ids). Delete is also offered in Step 2; Step 1 has
none of it.

So the pipeline produces the accepted policy, the support plan and the revision stamps — never an
"auto" variant of any of them. Everything in Support Edit Mode then works with no new code, because
it already acts on exactly those fields. **The parity test is what proves it.**

**A consequence of ruling 1 that must be built with it:** an auto-generated card **opens at Step 3**,
not Step 1. Opening at Step 1 would walk the operator straight into the step that destroys the work
the queue just did. Reaching Step 1 becomes a deliberate act — *"Re-orient (this removes the
supports)"*.

### 3. Auto-gen is an independent, modular pipeline — not code living in the deck

> *"differentiate auto gen function as an independent function wrapper that pipeline as a
> modularised function"*

Three jobs, three modules:

| Module | Job | Knows about |
|---|---|---|
| `autoGen/eligibility.ts` | **may** this card run, and if not why | a unit, its detect state, its health, its hand work. No engine, no React |
| `autoGen/pipeline.ts` | **how** one model goes from answered to supported: the stages in order, returning scene commands or a typed refusal | the engine client, injected. No React, no deck |
| `useAutoGen.ts` | **when**: the serial queue, `forget` after each item, pause on open | React and the deck. Knows nothing of how generation works |

**The parity test is only possible because of this.** A React hook cannot be run in `vite-node`
against the reference fixture; a plain function can, exactly as `scripts/perf/deck-scale.ts` already
drives `runSupportJob`. One pipeline then serves four callers: the per-card key, Auto-gen all, the
folder review, and any future batch tool.

**And the seam that actually prevents drift.** The risk is not which file the code sits in — it is
the pipeline RE-IMPLEMENTING what `useDentalFlow` does when it builds each stage's options (aligner
settings, kept dental work, tuning, preset commands). Two implementations of one decision diverge,
and that is how auto-gen ends up making different supports from the editor. So the stage builders
come OUT of the hook into a shared module that both call, which makes parity structural rather than
merely asserted.

### 4. The key appears only on an ANSWERED card

> *"on deck, auto gen button happens only when user already set category and type"*

The same rule the Open key already follows: **absent** until answered, rather than greyed with a
complaint — a chain with no profile has nothing to run, and the card's own control is beside it.

Today choosing a category SETS the type (one profile per family, shown as a readout), so this is one
action; it becomes two the day a family ships a second profile, and the rule already covers it.

| Card state | Auto-gen key |
|---|---|
| no category | not drawn |
| answered, detection flagged it | drawn, refused, with the reason |
| answered, hand-edited | drawn, asks first |
| answered and strictly Ready | drawn and live |

### 5. "Ready" is not currently a safety gate — tighten it first

`detectStateOf` (`src/items/detectState.ts`) is three lines and maps EVERY non-failed result to
`oriented` → **Ready**:

```ts
return { kind: 'oriented', turned: result.rotation !== undefined };
```

It never consults whether the rotation was actually found, whether the profile matched, whether the
central opening was ambiguous, whether the arch kind is unknown, or whether the two orientation
rules **disagreed** — all of which the step flow raises notices for and the deck drops.

So "auto-gen only on Ready" as first proposed would generate supports in the drop orientation, or for
the wrong arch type, on a card nobody opened. A strict state is needed — rotation present, profile
matched, cross-check not `disagrees` — and everything else gets a **"Check orientation"** chip.

### 6. Ready must also mean the MESH is usable — but "watertight" is the wrong test

> *"maybe ready on cards also meant the mesh is safe and pass or need to run the fix holes model
> function?"*

Right instinct, and a hole in the first proposal: nothing in it consulted mesh health at all, so
auto-gen could have run on a non-manifold model and placed tips against phantom geometry.

**CORRECTION, 2026-11-18, after a code review of this very section.** Two claims below were wrong
and are struck through rather than deleted, because the reasoning that produced them is the thing to
avoid repeating:

- ~~"Repair already runs at import."~~ **It does not.** `src/deck/jobSummary.ts:37` states plainly
  that *"repair is cut from this release"*, and `verdictOfRepair` has no caller outside its own
  definition. So `repaired`, `repaired-open` and `unchanged` **cannot occur**. The reachable health
  states are `clean`, `holes`, `malformed`, plus the two import refusals.
- ~~"`meshOk` is the engine's own usability judgement, not a watertight test."~~ **It is exactly a
  watertight test.** `dentalOrient.ts` documents it as *"whether the mesh was usable (closed,
  non-degenerate)"*, and a test removing 40 triangles from the reference aligner asserts
  `meshOk === false`. Gating on it would refuse open-rimmed models — the very thing this ruling set
  out to avoid.

**The gate that actually fits the code:** orient returned `oriented` under strict Ready, AND health
is not `malformed`. An open-rimmed mesh either fails orient and already reads "Needs rim" (not
eligible), or orients with `meshOk: false`. That last case gets its own chip, **"Check mesh"** —
auto-gen refuses, Open stays, because Step 1 already warns "Detection may be unreliable" for it.

The original text follows, kept for the record:

**Repair already runs at import.** `rowState.ts` records what happened as one of:
`clean` (watertight) · `repaired` · `repaired-open` (repaired, loops remain, with the reasons the
filler left them) · `holes` (loops, with count and longest rim in mm) · `malformed`
(non-manifold edges, winding consistency) · `unchanged`. So there is nothing for a "fix holes"
button to do that has not been tried — re-running it with the same input gives the same answer.

**And a dental arch is LEGITIMATELY open.** A trimmed aligner is a shell with a rim; its boundary
loop is the feature the whole Step 1 rim stage exists to find. A naive "watertight only" gate would
refuse every trimmed aligner in the building, which is most of them. That is why `repaired-open`
carries its reasons rather than being an error.

**So the gate is the engine's own judgement, not a geometry purity test.** `detectStateOf` already
distinguishes `result.meshOk ? 'no-rim' : 'failed'` — `meshOk` is the engine saying whether it can
work with this mesh. The rule:

| Health | Auto-gen |
|---|---|
| `clean`, `repaired` | runs |
| `repaired-open` | runs — an open rim is an aligner's normal shape, and the reasons are recorded |
| `holes`, `malformed`, `unchanged` on an unusable mesh | **refuses**, naming what is wrong, from the sentence the card already carries |

The card keeps showing health and orientation as TWO marks, because they are two independent facts
(`src/items/README.md`) — a trimmed arch is a healthy mesh with no rim. What changes is that the
auto-gen GATE consults both, where the first proposal consulted only the orientation chip.

### 7. An "enlarge" key: the card's model alone, full size

> *"when user inspect model preview maybe a button to enlarge 3d view in isolation for preview is
> possible?"*

Yes, and it is nearly free — which is a consequence of how the live preview was built rather than a
coincidence.

The deck already owns ONE renderer (`components/viewport/deckRig.ts`) and draws the focused card
through it, copying each frame into that card's own 2D canvas. Enlarging is the same pipeline
pointed at a bigger surface: an overlay with one large canvas, the same `openLiveCard` /
`turnLiveCard` / `closeLiveCard`, the same pure `orbit.ts` maths. **No second WebGL context, no
second model uploaded, no new camera code.**

What it adds, honestly:

- the overlay itself, and Escape / click-away to leave it;
- a size for the rig beyond a card's (`sizeRig` already resizes on demand and only when the size
  actually changed);
- the model's name on it, so an isolated view still says which model it is.

Why it is worth having: a 192px card tells you *which* model this is; it cannot tell you whether a
support will clash or whether an arch is seated the way you think. The step flow's full viewport can,
but reaching it means ENTERING the model — and under ruling 1 that is the route where a stray
re-orient destroys supports. An isolated look that changes nothing is the safe way to answer "is
this right?" before deciding to open it.

It should be a **look, not an editor**: turn and nothing else. The moment it grows selection or tip
editing it is a second implementation of Support Edit Mode, which is the drift ruling 3 exists to
prevent.

## Build order, revised by every ruling above

1. **Extract the stage builders** out of `useDentalFlow.ts` into a shared module. Pure refactor, UI
   behaviour unchanged, suite green. Nothing else is safe until this is in.
2. **Re-orient clears supports**, warned before and undoable after.
3. **`autoGen/eligibility.ts`** with the strict Ready, the mesh gate, and the "Check orientation"
   chip.
4. **`autoGen/pipeline.ts`** and the parity test against the reference fixture.
5. **`useAutoGen.ts`**: the queue, the per-card key, Auto-gen all, opening at Step 3.
6. The **enlarge** overlay, which reuses the rig and the orbit maths.
7. A real **move** for a support tip - there is no `manual/move` today, only add and remove.
