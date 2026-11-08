# Wiring walk — the dental flow, 2026-11-09

Reference-guided walk of the deck → flow → deck journeys. This is the companion to
`2026-11-08-cia-deck-and-flow.md`, which swept for defect classes; this one asks whether every
connection is actually wired, and whether each lifecycle ends somewhere a person can account for.

**Tier: Screen.** §4 map and §5 connections were read on 2026-11-08; **§6 fault injection ran on
2026-11-09** — G2 and G4 through the front door in a real browser, G1/G3/G5/G7 `UNPROVEN` with the
lever each needs, G6 `N/A` with the map row that proves it. Six probes: three verified controls,
three reproduced defects (W-07, W-08, W-09), all three fixed in this pass.

Said plainly because the distinction is the whole point: until §6 ran, every row of §9 said `READ`,
and a register where every row is `READ` is a code review wearing an audit's clothes.

**Reference:** no external reference system does this job, so the expected path comes from the design
doc (`docs/design/2026-11-07-import-and-items-flow.md`), the ADR-style decisions in the module
READMEs, and the owner's own words. Column headers say so.

## §1 — The question, written for this system

> **A case of eight arches is dropped. Three come back with no rim. The operator draws one of those
> rims and exports that row, re-arranges the plate, rotates a finished model, and a detection result
> lands for a row they have since removed. They close the browser and reopen the project tomorrow.**
>
> **Which supports does each row now have, planted at which orientation, and do the plate, the rail,
> the row's own sentence, the saved file and the exported STL all agree about it?**

That sentence is the audit. A feature list cannot answer it: every function in it works alone, and
four of the defects found yesterday lived in the gaps between them.

## §4 — The lifecycle state map

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

## §5 — Seven questions, per connection on the primary flow

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

## §6 — Fault injection: G2 (replay) and G4 (two actors on one scarce resource)

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

### What I expected, and what the system did

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

## §9 — Gap register

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

| **W-10** | L3 | The audit's own instruments | UI string → translation guard | `src/i18n.test.ts` | **S20: the detector had a blind spot, and this audit walked into it.** The guard's scope has now been wrong three times; the file records the first two, both modules inside folders it already globbed. The third was a folder it never globbed at all — `src/components/` had a hand-written list, so a new module there owning user-facing sentences sat outside the instrument. Found because **this pass added such a module**: `exportRefusalText.ts`, four refusal sentences, invisible to the guard, its name even matching `SPEAKS`. Closing it cost three `NOT_UI` entries (two font families and a modifier key) and nothing else under `src/components/` was untranslated — the shadow was in the instrument, not in the work. **Proved by planting** an untranslated sentence there: the widened guard fails on it by name, the old one passed. | **FIXED**, with a blind-case test | MEDIUM |

### Verified controls — named, so the next audit does not re-derive them

A control is listed here only once a fault injection failed to break it, with the mechanism named.

| Control | Mechanism | Proof |
|---|---|---|
| Two imports in flight cannot both pass the plate quota | `PlateLedger.open().hold()` checks `scene + every other hold + mine` and takes its own hold in the **same synchronous step**, and `useImportFiles` holds off the binary STL's 84-byte header before anything is parsed | walk `q1` |
| A replayed Remove takes one row, and the right one | the press is keyed by unit id, not by row index (`onRemove={() => onRemove(unit)}`) | walk `q4` |
| A duplicated worker reply has no second effect | `WorkerTask.wire` resolves the reply's job out of `this.jobs`; a settled job has left that map, and `'stale'` is already a named reply code | walk `q5`, 6 replies redelivered |
| A failed job's row is never dropped from the activity list | `JobActivity.view` deletes only `outcome !== 'failed'` rows, and surfaces a failure that ended inside the show delay | the mechanism W-05 and W-07 were both fixed onto |

### A note on the harness, because it changed what the audit could ask

`--probes=<list>` filters section `q` to one fault injection: seven seconds instead of eight minutes,
almost all of the saving being q1's 3.19M-triangle read. It was added mid-diagnosis and it changed
the work immediately — the W-09 account above has a probed answer rather than a plausible one
because asking became cheap. Same lesson as `--only` saving a day, one level down; and the same
danger, so a filtered run says `SOME PASS` and names what ran.

## What runs next

1. **G1, G5 and G7 need a fault lever the walk has not got.** `window.__meshDelay` delays a reply;
   none of these three can be injected until it can also **fail** one, **reorder** two, and **stop**
   a worker. One page-level lever (`window.__faultWorker = { fail, reorder, stop }`) covers all
   three, and it is the cheapest thing on this list.
2. **G3 (out-of-order arrival)** then follows from the same lever: a build result delivered before
   its request, against `useSupportBuilds`'s `requested` identity guard — which §5 marks `Y` on
   reading alone.
3. **The §8 rule matrix**, with each row's proof from a run rather than from reading. §6 is the
   method; the matrix is the coverage.
4. **W-05 and W-07 took the activity list, not a flag on the unit.** That is the minimal honest fix
   and it uses the screen the operator already watches, but it is dismissible and session-scoped: a
   project reopened tomorrow does not know its last export was refused. A persistent mark on the unit
   is scene state with save-file consequences, so it is written down here as debt with its reason
   rather than taken quietly.
5. **E4 shipped for flagged rows only.** Pressing Rim on a row the detector flagged `no-rim` now
   enters rim drawing directly instead of re-running a detection to be told what the row already
   says. Any other row keeps today's behaviour, which leaves *may a detected rim be redrawn* with the
   owner — deliberately, since answering it is not needed to ship this half.
