# Wiring walk — the dental flow, 2026-11-09

Reference-guided walk of the deck → flow → deck journeys. This is the companion to
`2026-11-08-cia-deck-and-flow.md`, which swept for defect classes; this one asks whether every
connection is actually wired, and whether each lifecycle ends somewhere a person can account for.

**Tier: Screen.** §4 map and §5 connections were read on 2026-11-08. **Every applicable fault class
has now been injected through the front door**, in two passes on 2026-11-09:

- **§6 — G2 and G4.** Six probes, three verified controls, three reproduced defects (W-07, W-08,
  W-09), all fixed.
- **§6b — G1, G3, G5 and G7**, once the levers those four needed existed. Five checks in 44 seconds,
  two verified controls, five defects (W-11 … W-15), four fixed here and one handed to geocore.
- **G6 is `N/A`** with the map row that proves it. Nothing is left `UNPROVEN`: G5's *timeout*, the
  last one, was retired by `__longTimerFloorMs` (§6b, `r5`).
- **§8**, the rule matrix, is now written off those runs: **ten rules `covered`** by a probe or by a
  test watched to fail, and one `N/A` with the map row that proves it. No row is left on reading.

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

## §6b — Fault injection, second pass: G1, G3, G5 and G7

Run 2026-11-09, Screen tier, through the front door in headless Chromium.
`npm run walk -- --only=r` (`scripts/walk.mjs`, section `r`), **59 seconds for all eight checks**;
`--probes=rN` runs one.

These four were `UNPROVEN` in §6 for a single reason, and it is worth stating because it is the
shape of most "we could not test that": **the only lever the walk had could DELAY a reply, and none
of these four faults is a delay.** Two levers were built, and then all four ran the same afternoon.

| Lever | What it does | Serves |
|---|---|---|
| `window.__faultHold` + `__faultRelease(order)` | every SETTLING reply from the named worker is swallowed and kept; the walk says when each is delivered, and in which order | G3 (newest first), G5 (with the crash below), G7 (never released) |
| `window.__faultCrash()` | the worker errors on THIS side, which is what `WorkerTask.wire`'s `onerror` sees | G5's local half |
| `window.__faultDownload = n` | the n-th `<a download>.click()` is refused | G1 |
| `window.__longTimerFloorMs = ms` | any timer of a minute or more fires after `ms` instead | G5's **timeout**, which is ten minutes in the app |

`__faultDownload` is not a worker lever and that is the finding behind it: the export's reply has
long settled by the time the first file commits, so **no worker lever can reach the write that
follows a write**. A fault class with no lever is not a fault class with no site.

| # | Fault | Site | Injection | What happened | Verdict |
|---|---|---|---|---|---|
| **G1** `r1` | A write rejected after an earlier one committed | the export's file loop, `useExport.ts` | two objects, "Each object with model", the second download refused | the first file was in the operator's downloads and the app said *"Export failed (…). **Nothing was saved**; try again, or export one object at a time."* — false, and the advice would have written the landed file twice | **FAIL → W-11** |
| **G3** `r2` | A reply before its predecessor | the analysis pool, the batch's orient against the flow's | both settling replies held, the NEWER released first | every observer kept its own answer: the flow's screen and the model's rotation matched the clean run exactly, down to the holes notice | **PASS** — verified control |
| **G5** `r3` | The far side succeeded, this side gave up | `AnalysisClient` + `WorkerTask.restart` | the worker crashed on this side with its answer still held, then the answer released into a client that had given up | the row settled once and stayed settled; the late answer landed nowhere; the batch drained past it and the second row got its own verdict; nothing thrown | **PASS** — verified control |
| **G5** `r3b` | …and can the operator read it? | the background-work list | the same run, reading the screen | **two defects.** The list is inside the viewport, which is not rendered while a start screen is up — so on the deck it did not exist. Mounted, it then explained an orientation check as a support build | **FAIL → W-12, W-13** |
| **G7** `r4` | The background job stops | the batch loop, `useBatchDetect` | every orient answer swallowed, twenty seconds (a cube's check takes one or two) | the rows read as pending, never as a verdict; Start and Remove both still worked; a Cancel was offered. But the background-work row read `Aligner oriented · 100%` and goes on reading it for ever | **PASS**, with a gap handed to geocore (W-14) |
| **G5** `r5` | …and now the TIMEOUT itself | `WorkerTask.timeout` → `restart`, the path the ten minutes really take | the answer held, and the job's own ten-minute timer brought forward to 1.5 s | both rows failed and **stayed** failed when their answers arrived afterwards; the activity list said *"Checking this model took too long and was stopped. The model is unchanged; open it to run the check again."* — the detection vocabulary W-13 bought, not a support build | **PASS** — verified control |
| **—** `r6` | External input acted on unverified | `binaryStlTriangles`, `core/import/stlHeader.ts` | a 184-byte binary STL whose header claims **four million** triangles | the header is ignored and the file's own size decides: **2 triangles counted**, four million never mentioned, the plate budget never consulted | **PASS** — verified control |
| **—** `r6b` | …and the shape that really is damaged | the same | 185 bytes, so the body is not a whole number of 50-byte facets | refused as *"a damaged STL file: its size does not match its triangles. Export it again"*, nothing landed, and no budget vocabulary | **PASS** — verified control |

**G5's timeout was `UNPROVEN` for about an hour, and then it was not.** The app's real form is
`ANALYSIS_TIMEOUT_MS` — ten minutes — so `r3` injected the local half as a crash and the swap was
named rather than hidden. The condition that was missing turned out to be four lines:
`__longTimerFloorMs` clamps the DELAY of any timer of a minute or more, never which callback runs, so
`r5` exercises the same `WorkerTask.timeout` → `restart` path the ten minutes would. **Nothing in
this app waits a minute on a timer except the job timeouts**, which is what makes the clamp precise
enough to be honest.

**G6 remains `N/A`** with its map row: no finished record points at an artefact outside the scene —
the project file packs the meshes it refers to (`useProjectFile.ts`). Recheck if that ever changes.

### What I expected, and what the system did

- **I expected `r1` to find a vague sentence. It found a false one.** My prediction was that the
  generic "the export failed" would be unhelpful beside a partial write. It was worse than that: it
  states that nothing was saved while a file is on disk, and offers an action that would duplicate
  it. A finding that is worse than the reading that motivated the probe is the argument for probes.
- **`r2` passed on its first run and proved nothing, which is the third time in two days.** The
  helper that decided "both rows have settled" asked only for non-empty text — so with every answer
  held, the baseline read `["Checking the orientation…", "Waiting its turn…"]`, and the probe's
  anti-vacuity guard ("the two answers must differ") was satisfied by two sentences that both mean
  *I do not know yet*. A pending sentence must never satisfy a check about what was decided. The
  reader now refuses one, and `openCubeStl` exists so the two models give genuinely different
  verdicts.
- **Fixing W-12 created W-13, and that is why they are one commit.** Mounting the list on the deck
  put a sentence on screen that had been unreachable: every dental analysis kind inherited the
  "support build" vocabulary, because `failureText` defaulted an unknown context to `build`. A defect
  that only a fix can expose is an argument for fixing in the same pass that found it.
- **`r4` corrected me twice.** I had written in the probe that the batch offers no Cancel, because
  `useBatchDetect` passes no signal; `AnalysisClient` passes one of its own, so it does. And I had
  not predicted the stuck row at `100%` at all.
- **The gate for the increment this pass was meant to confirm was itself broken.** `npm run wasm:test`
  asserted `engineVersion() === 14` against an engine at 63, so it had been failing on its first line
  since engine 15 and nobody had run it. The vendor bump the owner approved had already landed in
  `cb575b6`; what had not landed was a gate that could have said so.

## §8 — The rule traceability matrix

One row per rule, not per function. **`Proof` is a run from this audit** — a walk probe, or a unit
test that was watched to fail — and `Outcome` is `covered` only where that proof ran and passed.
Where a rule is real and the proof is not, the row says so and names the missing condition. This one
has no such rows left — but it did when it was first written, and both were retired the same day by
building what they asked for rather than by lowering the bar: `__longTimerFloorMs` for the timeout,
a 184-byte fixture for the lying header. **A matrix with no `UNVERIFIED` rows is only worth reading
if the rows got there by being run.**

| Rule | Code that enforces it | Connected systems | Proof (this audit) | Outcome |
|---|---|---|---|---|
| One accepted request leads to exactly one unit of work | `StartScreen.claimHeld` (a ref read-and-emptied in one statement); `WorkerTask.wire` resolves a reply out of `this.jobs`; `ItemRow`'s Remove keyed by unit id | start screen, import, analysis pool, deck | walk `q3` (purpose pressed twice → 3 rows, not 6), `q4` (Remove replayed), `q5` (6 replies redelivered) | **covered** |
| Two actors on the last of a scarce quota: one wins, the loser is told | `PlateLedger.hold` checks scene + every other hold + its own in one synchronous step; `useImportFiles.listBudgetRefusal` | import, plate ledger, status line, activity list, deck rows | walk `q1` (3.19M × 2 against a 6M plate), `q2` (the loser still accountable) | **covered** |
| A reply's ORDER never decides which observer gets it | `WorkerTask.wire`'s job-id registry; `AnalysisClient`'s keyed slots; `useDentalFlow`'s `stale()` token and `activeUnitId` check | analysis pool, deck, flow | walk `r2` (two orients in flight, newer released first) | **covered** |
| Every accepted item reaches a terminal state or a visible queue | `useBatchDetect`'s serial drain; `detectState` (`waiting` says so, W-03); `ANALYSIS_TIMEOUT_MS` behind it | deck rows, analysis pool | walk `r3` (the queue drained past a failed row), `r4` (pending reads as pending) | **covered** |
| Every unresolved state reaches an operator, on a screen that keeps it | the row's own sentence; `JobActivity` (never drops a failed row) — now mounted on the deck | deck, background-work list, status line | walk `r3b`; `q2` and `r1` are the same rule from the import and export sides | **covered**, with W-14 handed to geocore |
| A failure is explained in ITS OWN vocabulary, not a neighbour's | `analysisJobVocabulary` (total by type); `exportOutcomeText`; `JobActivity.failureText` | activity list, status line | walk `r3b`; `analysisJobVocabulary.test.ts` and `exportOutcomeText.test.ts`, both watched to fail first | **covered** |
| What the operator is told about a WRITE is true | `useExport`'s write loop records what it handed over; `exportPartialText` | export worker, browser, status line, activity list | walk `r1` | **covered** |
| A reversal never exceeds what was done, and never strands the operator | `onRemove` + the undo offer (W-06); the invariant effect "the flow cannot be open on a unit that is not on the plate" (W-09) | deck, scene, session, flow | walk `q4`, `q6` | **covered** |
| External input is never acted on unverified | `binaryStlTriangles` ignores a header whose records do not fit and lets the FILE'S SIZE decide, so a claimed count can never inflate the budget; a size that is not whole facets is refused as damaged | import worker, plate budget, status line | walk `r6` (a header claiming 4,000,000 triangles counted **2**, four million never mentioned) and `r6b` (185 bytes → *"a damaged STL file"*, nothing landed) | **covered** |
| A dependency that times out while the far side succeeded is reconciled, never doubled | `WorkerTask.timeout` → `restart`; `settle`'s `job.done` guard; `restart` nulls the worker's `onmessage` | analysis pool, deck, background-work list | walk `r5` — the real timeout, brought forward by `__longTimerFloorMs`: both rows failed, STAYED failed when their answers arrived, and said they had timed out. `r3` is the same disagreement reached by a crash | **covered** |
| A delivered artefact stays retrievable | — | — | **`N/A`** with the map row: no finished record points outside the scene; the project file packs the meshes it refers to (`useProjectFile.ts`) | `N/A` |
| A detector is proved to be LOOKING (S20) | `i18n.test.ts` (scope widened to `src/components`, W-10); `geometry-wasm-smoke.mjs` (now compares against `HOST_GEOMETRY_VERSION`) | the guards themselves | W-10 and W-16: an untranslated sentence planted in a new module, twice, and the widened guard named it both times. W-15: the smoke gate was asserting `=== 14` against engine 63, so it had been failing on its first line since engine 15 | **covered** |

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

| **W-10** | L3 | The audit's own instruments | UI string → translation guard | `src/i18n.test.ts` | **S20: the detector had a blind spot, and this audit walked into it.** The guard's scope has now been wrong three times; the file records the first two, both modules inside folders it already globbed. The third was a folder it never globbed at all — `src/components/` had a hand-written list, so a new module there owning user-facing sentences sat outside the instrument. Found because **this pass added such a module**: `exportRefusalText.ts` (now `exportOutcomeText.ts`), four refusal sentences, invisible to the guard, its name even matching `SPEAKS`. Closing it cost three `NOT_UI` entries (two font families and a modifier key) and nothing else under `src/components/` was untranslated — the shadow was in the instrument, not in the work. **Proved by planting** an untranslated sentence there: the widened guard fails on it by name, the old one passed. | **FIXED**, with a blind-case test | MEDIUM |
| **W-11** | L2 | Export — the write | Files written → operator | `components/useExport.ts` (the file loop) | **The one place the export commits more than once, and it denied doing so.** Each file is handed to the browser by its own `<a download>.click()`, so the first file is in the operator's downloads before the second hand-over is attempted. A throw in that loop went to the generic catch: *"Export failed (…). Nothing was saved; try again, or export one object at a time."* Nothing was saved was false, and "try again" would have written the landed file a second time. Every other export failure happens before a byte is written, which is why every other sentence can promise that — the loop inherited a promise it cannot keep. Chrome refuses multiple automatic downloads from one gesture, so this arrives without an auditor. | **REPRODUCED** `r1` → **FIXED** `f6daa93` | HIGH |
| **W-12** | L2 | The deck | Background failure → operator | `App.tsx` (the start-screen branch) | **The screen that remembers failures did not exist on the deck.** `JobActivityPanel` is rendered inside the viewport, and the viewport is not rendered while a start screen is up — so on the deck, where the longest background work in the app runs (one orientation check per row, minutes on a full case), a crashed analysis worker left its mark on one row's sentence and nowhere else. W-05 and W-07 were both fixed onto that list on the argument that a status line the next message replaces is not a screen; on this screen there was no list to be fixed onto. | **REPRODUCED** `r3b` → **FIXED** `873b923` | MEDIUM |
| **W-13** | L3 | The deck | Job context → failure text | `components/JobActivity.tsx` (`failureText`) | **An analysis job was explained as a support build.** `AnalysisClient` reports each job with `context: task.kind` (`dental-orient`, `dental-tilt-scan`, …); none of those is one of the five shared error contexts, and `failureText` defaulted an unknown context to `build` — so a failed orientation check on a deck row with no supports read *"The support worker stopped unexpectedly. Change a setting or generate again to rebuild the supports."* Only visible once W-12 was fixed, which is why both are one commit. | **REPRODUCED** `r3b` → **FIXED** `873b923` | MEDIUM |
| **W-14** | L3 | Background work | Stalled job → its own row | `vendor/mixo-geocore/host/workers/jobActivity.ts:221` | **A job stuck for ever reads `Aligner oriented · 100%`,** with no elapsed time: a finished job and a job that will never finish draw the same row. The signal for this exists — `showElapsed` — and is wired to `state === 'indeterminate'`, the one state a job that reported progress and then stopped cannot be in. A live control that cannot fire for the failure it was written for. **Vendored geocore, which this repo consumes as built**, so it is handed over, not patched. | **REPRODUCED** `r4` → **HANDED OVER** `docs/handoff/geocore-stuck-job-elapsed.md` | LOW |
| **W-15** | L3 | The audit's own instruments | Vendored engine → its gate | `scripts/geometry-wasm-smoke.mjs` | **S20 again, and in the gate the owner named for the geocore increment.** Its first assertion was `engineVersion() === 14` against an engine at 63, so `npm run wasm:test` had been exiting on line one since engine 15 — the ABI smoke test below it has not run in forty-eight engine versions, and nothing said so. A constant frozen into a detector ages into a detector nobody runs. It now compares against `HOST_GEOMETRY_VERSION`, which is what its own message always claimed, and prints what it verified. | **REPRODUCED** (ran it) → **FIXED** `c715de8` | MEDIUM |
| **W-16** | L3 | The audit's own instruments | UI string → translation guard, again | `src/i18n.test.ts` | **The FOURTH blind spot in this guard, found on the pass that closed the third, and walked into by the person closing it.** `workers/analysisJobVocabulary.ts` was added an hour earlier to fix W-13; it owns three user-facing sentences and sits in a folder the guard had never globbed, so its translations were added by hand and nothing would have noticed a fourth sentence beside them. The pattern across all four misses is one: **the scope was always a list of the places UI text had been FOUND, never of the places it could BE** — while `speaks()` has answered the second question all along. Every folder under `src/` that could hold a `Message` is globbed now; the bill was zero `NOT_UI` entries. **Proved to be looking**, as W-10 was: a sentence planted in that module, the guard fails on it by name, the module restored byte-for-byte. | **REPRODUCED** (planted) → **FIXED** `b9297a2` | MEDIUM |
| **W-17** | L1 | The browser under the editor | — | Chromium's GPU stack, not this repo | **THE RELEASE GATE COULD NOT FINISH: the tab died.** Chromium's GPU command buffer goes invalid under SwiftShader — `GPU state invalid after WaitForGetOffsetInRange` — and takes the renderer with it, in section `a`. **Not from this pass, and not the machine:** it reproduces at `48b062d` with that commit's own `walk.mjs`, on Chromium 1243 and 1248 alike, with the JS heap at **36 MB of 3586**, four Workers made, and the browser's biggest process at **719 MB** of 61 GB. `--in-process-gpu` made it crash sooner and `--disable-gpu-watchdog` changed nothing, so **the cause is open and is not guessed at here.** What is fixed is the gate's RESPONSE: one dead tab used to take 170 other checks with it, so a crash in the first section hid every answer the walk had. The run now retries the dead section once in a fresh browser and then carries on from the next, as often as it must — and **never turns green for it**: the crash is already a FAIL, the exit code stays 1, and the summary names the sections left unfinished. Recovering the COVERAGE is the point; recovering the VERDICT would be the defect this doctrine exists to catch. | **REPRODUCED** (5 runs) → **CONTAINED**, cause open | needs triage |

### Verified controls — named, so the next audit does not re-derive them

A control is listed here only once a fault injection failed to break it, with the mechanism named.

| Control | Mechanism | Proof |
|---|---|---|
| Two imports in flight cannot both pass the plate quota | `PlateLedger.open().hold()` checks `scene + every other hold + mine` and takes its own hold in the **same synchronous step**, and `useImportFiles` holds off the binary STL's 84-byte header before anything is parsed | walk `q1` |
| A replayed Remove takes one row, and the right one | the press is keyed by unit id, not by row index (`onRemove={() => onRemove(unit)}`) | walk `q4` |
| A duplicated worker reply has no second effect | `WorkerTask.wire` resolves the reply's job out of `this.jobs`; a settled job has left that map, and `'stale'` is already a named reply code | walk `q5`, 6 replies redelivered |
| A failed job's row is never dropped from the activity list | `JobActivity.view` deletes only `outcome !== 'failed'` rows, and surfaces a failure that ended inside the show delay | the mechanism W-05 and W-07 were both fixed onto |
| Two orients in flight cannot cross: every observer keeps its own answer | `WorkerTask.wire` matches a reply to its job by id, `AnalysisClient` keys its slots, and `useDentalFlow`'s `stale()` token refuses an answer for a job it has moved on from | walk `r2`, newer released first |
| A dependency that fails does not take the queue with it, and its late answer lands nowhere | `WorkerTask.settle` guards on `job.done` and `restart` nulls the worker's `onmessage`, so a reply that arrives after the client gave up reaches nothing | walk `r3`, crash then release |

### A note on the harness, because it changed what the audit could ask

`--probes=<list>` filters section `q` to one fault injection: seven seconds instead of eight minutes,
almost all of the saving being q1's 3.19M-triangle read. It was added mid-diagnosis and it changed
the work immediately — the W-09 account above has a probed answer rather than a plausible one
because asking became cheap. Same lesson as `--only` saving a day, one level down; and the same
danger, so a filtered run says `SOME PASS` and names what ran.

**And then the harness decided which fault classes this audit could have at all.** G1, G3, G5 and G7
were `UNPROVEN` for an afternoon and then all four ran in 44 seconds, and nothing about the app
changed in between — what changed is that the walk learned to hold a reply, release it in an order
of the walk's choosing, crash a worker on this side, and refuse a download. Three of those are one
lever. The lesson is not "build levers"; it is that **`UNPROVEN` is a statement about the harness,
and it is usually cheaper to retire than it looks** — four fault classes had been reported as
untestable at this tier, and the missing condition was a page script of forty lines.

The corollary the pass also earned: **a lever no probe uses is a dead control.** The first design of
`__faultHold` had `fail` and `reorder` modes as well. Holding expresses both, no probe needed either,
and they were cut before they were written — a week after deleting a guard in `startItem` that could
never fire.

**And the same thing happened twice more before the day was out.** The last two rows of §8 were the
`UNPROVEN` timeout and the `UNVERIFIED` lying header, both written up as things a future pass would
do. The timeout needed four lines (`__longTimerFloorMs`) and the header needed a 184-byte fixture.
Neither was a day's work; both had been described as one, because **an unrun row is easier to write
than to cost.**

**A lever armed before a navigation is not armed.** `r5` failed its first run because it set the
timer floor and then called a helper that begins with `page.goto` — which re-runs the init script and
resets every lever. That trap was already written down two comments above the line that fell into it,
by the same author, an hour earlier. It is now a parameter of the helper instead of a thing to
remember.

## What runs next

1. **W-17, the tab crash, is contained but not cured.** Chromium's GPU command buffer goes invalid
   under SwiftShader (`GPU state invalid after WaitForGetOffsetInRange`) and takes the renderer with
   it, in section `a`. Not this repo: it reproduces at `48b062d` with that commit's own `walk.mjs`,
   on two Chromium builds, with the JS heap at 36 MB of 3586 and the browser's biggest process at
   719 MB. `--in-process-gpu` made it worse and `--disable-gpu-watchdog` did nothing, so **the cause
   is still open** — the next things to try are a smaller viewport, `--disable-gpu-compositing`, and
   a build with hardware GL. What is fixed is the gate's response: it retries the section once in a
   fresh browser and then carries on, and never turns green for it.

2. **W-14 is with geocore** (`docs/handoff/geocore-stuck-job-elapsed.md`): a job stuck for ever reads
   `100%` with no elapsed time, because `showElapsed` is wired to the one state it cannot be in. When
   a new vendor drop lands, `r4`'s check tightens from "the deck still works" to "the stalled job
   says how long it has been stalled".
3. **W-12 was fixed with a second mount point, and the proper fix is named as debt.** The
   background-work list belongs at the app root, not inside the viewport; moving it there means
   re-homing three CSS rules that position it by viewport state, which is a layout change with its
   own visual check and must not ride along with an audit.
4. **W-05 and W-07 took the activity list, not a flag on the unit.** That is the minimal honest fix
   and it uses the screen the operator already watches, but it is dismissible and session-scoped: a
   project reopened tomorrow does not know its last export was refused. A persistent mark on the unit
   is scene state with save-file consequences, so it is written down here as debt with its reason
   rather than taken quietly.
5. **E4 shipped for flagged rows only.** Pressing Rim on a row the detector flagged `no-rim` now
   enters rim drawing directly instead of re-running a detection to be told what the row already
   says. Any other row keeps today's behaviour, which leaves *may a detected rim be redrawn* with the
   owner — deliberately, since answering it is not needed to ship this half.
6. **The repair rail is built and unreachable.** `rowState.verdictOfRepair` and `offersRepair` have
   no caller outside their tests, and nothing in the app calls `repairMesh` — so the engine's hole
   filling (new at 63, `max_fill_loop_mm`) is off because nobody asks for it, not because a number is
   zero. Not a defect today; named here so that "fill 0" is not later read as a setting that was
   tuned. `noUnusedLocals` cannot see an unused EXPORT, which is why a grep found it and the compiler
   did not.
