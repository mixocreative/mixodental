# Handoff

## Current decision

Approved scope is Web Resin Support Parity: a local, multi-object browser editor that reproduces Blender's live Resin UV support workflow. Every imported mesh is a print unit with a derived support group that moves and rotates together with its model. The browser must support generation, settings/presets, manual editing, removal/regeneration, undo/redo, and separate or whole-scene export.

## Explicitly deferred

Bake Supports, hidden original/proxy copies, Blender collection/datablock semantics, and vertex-for-vertex Geometry Nodes output are excluded. Tree supports, multi-model support units, undo/redo, and extended test fixtures are in scope.

## Token-economy notes

The required router probe was attempted at session start but returned no provider status. A read-only repository inventory was delegated to a subagent and independently confirmed: the workspace was empty and not a Git repository. Future bulky mechanical inspection should be delegated after a live provider probe; implementation decisions remain in the main agent.

## Continuity protocol

After every implementation task, record: the completed requirement; changed files; exact commands and results; `git status --short`; adopted Blender behavior; risks or failures; and exactly one next executable step. A successor must first read this file, `docs/superpowers/specs/2026-10-20-web-resin-support-parity-design.md`, the active implementation plan, and current Git status.

## Completed task log
- Task 2 models the complete live Blender support settings and Light/Middle/Heavy presets (Task 1 third-review follow-up committed separately as `a00e520`).
- Task 3 preserves placement edits across regeneration and adds deterministic tree topology.
- Task 4 builds print-ready live support geometry shared by viewport and export.
- Task 5 converts import and transforms to multi-object print units (pure layer). The `ObjectViewport`/`App` rendering rewrite is coupled to the Task 6 command UI and lands there.
- Tasks 6-8 complete the Web Resin Support Parity plan: live support editing UI, export modes, Blender parity checklist, browser verification, deployment.
- raft reported upside down; output now compared with real Blender (Resin UV, Blender 5.2) and corrected.

## Latest completed step (the deploy that had been dead for eight days - 2026-11-09)

> **THE SITE WAS 242 COMMITS BEHIND, AND NOTHING SAID SO.** The last real GitHub Pages deployment is
> `5e4c7a6`, 2026-11-01 15:34. On 2026-11-02 the CI triggers were narrowed to `milestone-*` tags plus
> `workflow_dispatch`, and **two** copies of the same condition were left behind - the `deploy` job
> and the `upload-pages-artifact` step - both reading
> `github.event_name == 'push' && github.ref == 'refs/heads/main'`. A tag push carries `refs/tags/…`
> and a dispatch is not a `push`, so from that day no run could publish. The only symptom was the
> site's age. Fixing one copy was worse than fixing none: the run went green and the site did not
> move.
>
> So the owner's hand-testing of the edge-rim review ran against a build in which **the tool rail had
> no click handler at all** (`a9b52b0`), **accepting an orientation destroyed the painted support area
> and the Step 3 tuning** (`4fe4efa`), and **supports planted before the model was turned were
> exported anyway** (`c643f3c`). The review was not going wrong; the build was.
>
> **Where each gate runs is now written down in `docs/SHIP-PLAN.md` §Ship.** CI keeps the walk
> blocking the deploy, sharded `m,q` and `r,u,x,l,s`; section `a` runs in the full local walk only,
> because it is where every environmental failure came from and a gate that reddens for the runner
> gets routed around. The owner's rule: a milestone tag goes on a revision whose full local walk
> passed - `ALL PASS (185 checks)` on the app code at `a341a28`.

## Previous completed step (the last two §8 rows, and the gate that could not finish - 2026-11-09)

> **GATE GREEN at `5ed58d4`: the full browser walk is `ALL PASS (185 checks, 2103 s)`, exit 0** - no
> tab crash, the resume never needed, and `g-pre` passed on an idle machine so `g` was answered too.
> With tsc 0, 1539 tests, build 0, `gate:real` PASS (13 scans, no differences) and `wasm:test` PASS,
> every gate this project has is green at the same commit.

**§8 has no unrun rows left: ten covered, one `N/A`.** The two that were written up as future work
were retired the same day, and neither was a day's work:

- **G5's TIMEOUT, for real (`r5`).** `ANALYSIS_TIMEOUT_MS` is ten minutes, so `r3` had injected the
  same disagreement as a crash. `window.__longTimerFloorMs` clamps the DELAY of any timer of a minute
  or more - never which callback runs - so `r5` takes the real `WorkerTask.timeout` -> `restart`
  path. Both rows failed, **stayed** failed when their held answers arrived afterwards, and the
  activity list said *"Checking this model took too long and was stopped. The model is unchanged;
  open it to run the check again."* - the detection vocabulary W-13 bought, not a support build.
  Four lines of lever. Nothing else in this app waits a minute on a timer, which is what makes the
  clamp precise enough to be honest.
- **External input acted on unverified (`r6`, `r6b`).** A 184-byte binary STL whose header claims
  **four million** triangles: the header is ignored, the file's own size decides, **2 triangles are
  counted** and four million is never mentioned. One byte more (185, so the body is not whole
  50-byte facets) and it is refused as *"a damaged STL file"* with nothing landing.
  **I had written this rule down wrong** - the old handoff said a 200-byte liar is "refused as
  damaged"; it is not, it imports as the two triangles it holds. The probe is how I know.

**W-17: the gate could not finish, and now it can.** Chromium's GPU command buffer goes invalid under
SwiftShader (`GPU state invalid after WaitForGetOffsetInRange`) and takes the renderer with it in
section `a`. **Not this repo and not the machine:** it reproduces at `48b062d` with that commit's own
`walk.mjs`, on Chromium 1243 and 1248, with the JS heap at **36 MB of 3586**, four Workers made, and
the browser's biggest process at **719 MB** of 61 GB free. `--in-process-gpu` made it crash sooner;
`--disable-gpu-watchdog` changed nothing. **The cause is open and is not guessed at.**

What is fixed is the gate's response. One dead tab used to take 170 other checks with it, so a crash
in the FIRST section hid every answer the walk had. The run now **retries the dead section once in a
fresh browser** and then carries on from the next one, as often as it must. It **never turns green
for it**: the crash is already a FAIL, the exit code stays 1, and the summary names the sections left
unfinished. Recovering the COVERAGE is the point; recovering the VERDICT would be the defect this
doctrine exists to catch.

Also: `page.on('crash')` names the crash once as itself. The first run had reported it as
`locator.click: Timeout 30000ms exceeded` on a perfectly healthy button, which sends the reader after
the button.

## Previous completed step (G1/G3/G5/G7, the geocore increment, and the §8 matrix - 2026-11-09)

**Every applicable fault class has now been injected.** G1, G3, G5 and G7 had stood `UNPROVEN`
because the walk's only worker lever could DELAY a reply and none of those four is a delay. Two
levers closed that, and all four then ran in **44 seconds** (`npm run walk -- --only=r`).

- `window.__faultHold` / `__faultRelease(order)` / `__faultCrash()` — a settling reply is swallowed
  and kept, then delivered when and in what order the walk says. Newest first is G3; crashing this
  side with the answer still held is G5; never releasing is G7.
- `window.__faultDownload = n` — the n-th download is refused. Not a worker lever, and that is the
  point: the export's reply has long settled by the time the first file commits, so no worker lever
  can reach the write that follows a write. Chrome refuses several automatic downloads from one
  gesture by itself, so this fault arrives without an auditor.

**Five defects, four fixed here:**

| | |
|---|---|
| **W-11** HIGH | The export's file loop is the one place it commits more than once, and it denied doing so: the first file was in the operator's downloads while the app said *"Nothing was saved; try again"* - which would have written that file a second time. `exportRefusalText.ts` became `exportOutcomeText.ts`, because a refusal is decided before anything is written and a partial write is the opposite event. `f6daa93` |
| **W-12** MEDIUM | The background-work list is rendered inside the viewport, which is not rendered while a start screen is up - so on the DECK, where the longest background work in the app runs, the screen that remembers failures did not exist. W-05 and W-07 were both fixed onto that list. `873b923` |
| **W-13** MEDIUM | Which W-12's fix then revealed: `failureText` defaulted an unknown context to `build`, so a failed orientation check read *"generate again to rebuild the supports"* for a deck row with no supports. `analysisJobVocabulary.ts`, total by type. `873b923` |
| **W-14** LOW | A job stuck for ever reads `Aligner oriented · 100%` with no elapsed time. `showElapsed` exists and is wired to `state === 'indeterminate'`, the one state such a job cannot be in - a live control that cannot fire for its own failure. **Vendored geocore**, handed over: `docs/handoff/geocore-stuck-job-elapsed.md` |
| **W-15** MEDIUM | `npm run wasm:test` asserted `engineVersion() === 14` against an engine at 63, so the gate named for every vendor bump had been exiting on line one since engine 15. It compares against `HOST_GEOMETRY_VERSION` now and prints what it verified. `c715de8` |

**Two new verified controls:** two orients in flight cannot cross (job-id registry, keyed slots, the
flow's `stale()` token), and a dependency that fails does not take the queue with it nor accept its
own late answer.

**The geocore 62/63 increment was already done.** Engine 63 at `b5a71ab` is vendored and
`vendor:check` verifies it; it landed in `cb575b6`. `max_fill_loop_mm` is unused because **nothing
in the app calls `repairMesh`** - the fill is off because nobody asks for it, not because a number
is zero. `rowState.verdictOfRepair` and `offersRepair` have no caller outside their tests: the
repair rail is built and unreachable, named in the review so "fill 0" is never read later as a
tuned setting.

**W-16, the FOURTH blind spot in the i18n guard, and I walked into it myself** on the pass that
closed the third: the new `workers/analysisJobVocabulary.ts` owns three user-facing sentences in a
folder the guard had never globbed. The pattern across all four is one thing - the scope was a list
of where UI text had been FOUND, never of where it could BE. Every folder under `src/` that could
hold a `Message` is globbed now; the bill was zero `NOT_UI` entries; proved by planting a sentence
and watching the guard name it. `b9297a2`

**W-17 IS OPEN AND IT IS THE GATE.** The full walk cannot finish: the browser tab's renderer dies in
section `e`'s spot search (up to 49 click/undo/right-click cycles, each a rebuild). Three runs in a
row. **Not from this pass** - it reproduces identically at `48b062d` with that commit's own
`walk.mjs`, with 29 GB of 61 GB free, so it is neither this work nor system memory. Either an
operator can lose an unsaved scene while editing, or only this input rate provokes it, and those are
very different severities. Unknown, and said to be unknown. `page.on('crash')` now names it once as
itself: the first run had reported it as a `locator.click` timeout on a perfectly healthy button.

**§8, the rule matrix, is written off runs**: eight rules `covered` by a probe or by a test watched
to fail, one `UNVERIFIED` (external input acted on unverified - the fixture exists, no probe drops
it), one `UNPROVEN` (a G5 *timeout* specifically; `r3` injected a crash instead and says so), one
`N/A` (G6, with the map row).

**The lesson of the pass:** `UNPROVEN` is a statement about the HARNESS, and it is usually cheaper to
retire than it looks. Four fault classes had been reported untestable at this tier; the missing
condition was a page script of forty lines. The corollary, a week after deleting a guard that could
never fire: the first design of `__faultHold` had `fail` and `reorder` modes, no probe needed
either, and they were cut before they were written.

## Previous completed step (G2/G4 fault injection, and what it caught - 2026-11-09)

The wiring walk's gap register was all `READ`, which by that doctrine's own rule made it a code
review rather than an audit. **G2 (replay) and G4 (two actors on one scarce resource) now RUN** -
through the front door, in headless Chromium, against the real app. Ledger:
`docs/reviews/2026-11-09-wiring-walk-dental-flow.md` §6. Logs and the run's identity (HEAD, node,
playwright, the fixture's sha256 and triangle count): `artefacts/2026-11-09-screen/`.

- **Harness:** `scripts/walk.mjs` section `q`, six probes, `npm run walk -- --only=q`, ~8 min. The
  plate-quota fixture is one 3,193,368-triangle binary STL made on demand by
  `scripts/make-heavy-meshes.ts 3200000` (152 MiB, git-ignored): two of them cross the 6M plate limit
  while either alone fits, and the refusal is decided off the 84-byte header, so only the winner pays
  for a read. That is what makes a 6M-triangle fault injection cost twenty seconds.
  `window.__replayWorker` was added beside `window.__meshDelay`: it re-dispatches every reply of a
  named worker a second time **without** swallowing the first, and counts them, so a replay test can
  prove the fault arrived rather than assume it.

- **Verified controls, with the mechanism named** (a control is only listed once an injection failed
  to break it): `q1` two drops in flight cannot both pass the plate quota - `PlateLedger.hold`
  checks scene + every other hold + its own and takes its hold in the same synchronous step, and the
  refusal names the arithmetic ("would hold 6,386,736; the limit is 6,000,000"). `q4` a replayed
  Remove takes one row and the right one, because the press is keyed by unit id. `q5` six
  redelivered analysis replies had no second effect, because `WorkerTask.wire` resolves a reply's job
  out of `this.jobs` and a settled job has left that map.

- **Reproduced, and fixed:**
  - **W-08 (HIGH)** the purpose key pressed twice imported the held batch twice - three files, six
    rows. `choose` read `held` out of its render's closure and cleared it with `setHeld([])`; a state
    setter schedules a re-render, it takes nothing away from a handler that already closed over the
    old value. `StartScreen` now claims the batch from a ref, read and emptied in one statement.
  - **W-09 (HIGH)** Remove and Start on one unit in one tick left the operator where no screen
    describes: deck shut, no step drawn, the GENERIC editor panels up, two models on the plate,
    nothing selected - and the dental mode still on underneath with no dental bar to leave it by,
    while the status line said "Drop an aligner STL... then press Next". Every guard downstream had
    worked exactly as written: the selection reducer drops an id the scene has not got so
    `activeUnitId` is empty, `startAligner` abandons its orient job, `setStartScreen(null)` had
    already closed the deck, and the gesture that draws the dental bar needs an active unit.
    Fixed by an INVARIANT EFFECT on rendered state - the flow cannot be open on a unit that is not on
    the plate, so it closes and the deck comes back. **Not** by a guard in `startItem`: that was the
    first fix and it could never fire, because `sceneRef.current` is updated on render and so still
    holds the unit in the tick the removal was dispatched. `useImportFiles` carries that warning
    about that ref; it was read earlier in the same session and the bug was written anyway. The guard
    was deleted rather than kept - one that cannot fire is a dead control wearing safety's clothes.
  - **W-07 (HIGH)** a budget refusal (triangles, memory, a full plate) is decided before any worker
    starts, so no activity row was ever opened and the refusal lived only in the status line - which
    the winning file's own heavy-model sentence then replaced. A file refused by the WORKER was
    always safe, because a failed activity row is never dropped; that asymmetry is what hid it.
    `useImportFiles.listBudgetRefusal` puts both kinds of refusal on the same screen.

- **UNPROVEN, not skipped:** G1, G3, G5, G7 each need a page lever that can FAIL, REORDER or STOP a
  reply; `window.__meshDelay` only delays. One lever (`window.__faultWorker = { fail, reorder, stop }`)
  covers all four and is the cheapest audit work left. G6 is `N/A` with its map row: no finished
  record points at an artefact outside the scene.

- **Also in this pass**, from the register's own next-steps list: **W-03** a queued row says "Waiting
  its turn…" instead of drawing the same blank as a row the batch has never heard of (and the
  register was wrong about the mechanism - the analysis worker's 10-minute per-job timeout means the
  queue cannot block for ever; the blank was the whole defect). **W-05** the four export refusals
  moved to a pure `src/components/exportOutcomeText.ts` (so named since W-11) read by both the status line and the activity
  list, with a test asserting as a property that every one of them names the model, says nothing was
  written, and ends with the next step - which caught the `replant` sentence never saying it.
  **E4** the rail press now carries its tool (`ItemsPage` discarded it, which was W-02's unnoticed
  second half), and Rim on a row the detector flagged `no-rim` enters rim drawing directly instead of
  re-running `dentalOrient` to be told what the row already says.

- **The lessons, and they are one lesson three times:** walk `q6` PASSED on its first run and should
  not have, because it looked for one named bad outcome and came back green on a worse one - **a
  check that enumerates the bad states can only find the bad states its author imagined**, so assert
  what must be true. Then the first FIX for it was wrong in the same way, guarding against a race
  with a ref that is a render behind. And the first DIAGNOSIS was a guess, because the probe that
  would have settled it cost eight minutes - so `--probes=<list>` was added to filter section `q` to
  one injection (seven seconds, almost all of the saving being q1's 3.19M-triangle read) and it
  changed the work in the same turn. **A diagnosis that costs eight minutes a question gets guessed
  at instead of asked.** Same family as the previous day's `noUnusedLocals` lesson: the cheap,
  certain instrument beats the careful reading.

- **Deliberate debt, with its reason:** W-05 and W-07 took the activity list, which is the screen the
  operator already watches but is dismissible and session-scoped - a project reopened tomorrow does
  not know its last export was refused. A persistent mark on the unit is scene state with save-file
  consequences, so it is written down rather than taken quietly.

- **Results:** tsc 0 - 1532 tests passed, 1 skipped (was 1527) - build 0 - full walk run and read;
  all six fault injections pass against the fixed app. `g-pre` fails as it usually does (a
  machine-load precondition, not the app), which leaves `g` unanswered - never a green claim.

## Previous completed step (the CIA audit and its fixes - 2026-11-09)

A scoped Screen-tier `cia` audit of the deck -> flow -> deck journeys, after two EGM document reviews
missed the class. Ledgers: `docs/reviews/2026-11-08-cia-deck-and-flow.md` (sweeps) and
`docs/reviews/2026-11-09-wiring-walk-dental-flow.md` (the wiring walk).

| commit | what landed |
|---|---|
| `99bfdbc` | Remove no longer selects the row it removed; opening the next item keeps the case; Start says and honours which row it opens; starting a row reads it |
| `c643f3c` | export refuses supports planted before the model was turned; the row's detect line stops lying and shows trouble in its own tone |
| `a9b52b0` | the dead tool rail is WIRED, and `noUnusedLocals` / `noUnusedParameters` are on |
| `5dc3376` | a re-accepted orientation keeps the painted area and the tuning (W-01) |

**The lesson that outranks the findings.** The dead rail - `onPick` destructured and never called,
four tools drawn in four states and none pressable - survived two EGM reviews, two readings of that
file and a 250k-token subagent audit. `tsconfig.json` had `strict: true` and no `noUnusedLocals`.
One flag, already paid for, named it in a line. **Before reaching for a graph or an audit, check
whether the compiler was asked.** Sixteen bindings were unused; one was a dead function of mine from
the same afternoon.

**Two code graphs now**, with the owner's rules in `CLAUDE.md` and the `feedback-two-graphs` memory:
CodeGraphContext for code relationships (31,988 CALLS edges, a Kuzu store OUTSIDE the repo under the
user profile, its own venv, registered as a user-scope MCP server), graphify for architectural
context and the doc-to-code edges. Separate stores, never the same question twice, neither
authoritative over the code. **CGC's queries are MCP-only, so they come online in a NEW session.**

### Open, in the order I would take them

1. **E4 / W-02 - per-tool entry.** The rail press opens the MODEL; opening the pressed TOOL is not
   built. Can ship for FLAGGED ROWS alone, so it need not settle whether a detected rim may be
   redrawn. The deck-is-the-queue ruling makes this the operator's path through a case.
2. **W-03 to W-06**, read-only findings not yet reproduced: a never-resolving detection blocks the
   batch queue; the batch uses the profile captured when its loop started; the replant refusal reaches
   only a status line the next message replaces; Remove has no confirm and no undo offer.
3. **G1-G7 fault injection has NEVER run.** Every row of the wiring walk's gap register says `READ`,
   which by that doctrine's own rule makes it a code review. G2 (replay) and G4 (two actors on one
   scarce resource) are the floor.
4. **Vendor geocore engines 62/63** (`b5a71ab` on that repo's main). The peer session finished and
   ended. `max_fill_loop_mm` is a required argument with no default; 0 fills nothing and is correct
   until the loop histogram is measured by `gate:real`. A rim bending more than 35% of its reach is
   never filled by design and a patch is not intersection-tested - if the real scans hold many such
   rims that is a slice 3, not a threshold change.

### Walk knowledge worth keeping

- **`npm run walk -- --only=m` runs one section in ~22 s.** A day of 30-minute full runs went by
  before I noticed the flag.
- `g-pre` is a machine-load precondition, not the app. It fails on most runs and leaves `g`
  unanswered; it passed once, at 167 checks ALL PASS. Never report a `g-pre` failure as a regression,
  and never call a run green without saying `g` went unanswered.
- **A check whose own cleanup can fail is worse than no check.** A mid-sequence check that returned
  via `Back` timed out and took the twelve checks below it with it.
- **One check per claim.** A check that borrows another's claim can pass while the thing it implies is
  broken.

## Previous completed step (E0-E3a of dissolving the step machine - 2026-11-08)

Route: `docs/design/2026-11-07-import-and-items-flow.md` §10. Pushed, each gated:

| step | commit | what landed |
|---|---|---|
| E0 | `f4adde5` | the denture path through the rail, which had no test |
| E1a | `2877a7d` | the in-flow type step is gone; the flow opens at Step 1 |
| E1b | `547004f` | Back at Step 1 steps out to the CASE, keeping `dentalFinished` |
| E2 | `430a37c` | one predicate decides whether a unit carries hand work |
| E3a | `08abeea` | the rail's chain is per job; the prerequisite derives from it |

**The ruling that unblocked the whole thing:** the Step-3 confirm-and-discard guard does not belong
to navigation. Moving is free in a workspace that is ordered but not gated; only MUTATING destroys
hand work. So `openTool` has no guard to own, and the guard becomes a condition on upstream Apply.

**The owner's conclusion that settled the multi-item case: THE DECK IS THE QUEUE.** Several files
dropped with several rims undetected needs nothing new — during a batch there is no dental session,
so the hand-over to rim drawing cannot fire; each row records its own result and the deck already
flags which tool it needs (`no-rim` → Rim, `failed` → Orient). Multiple failures are multiple
flagged rows, handled one at a time by clicking. The single-unit session is the right shape, not a
limitation.

**Next: run `/cia` on the deck-and-flow BEFORE building E4.** Two rounds of EGM review missed the
multi-item journey gaps because EGM audits a DOCUMENT against document standards — only one of its
seven reviewers reads code, for accuracy and reuse, not journeys. `cia` is scoped at runtime UX
journeys, dead controls and ambiguous steps, which is this class exactly. Then E4 (mount the rail in
the workspace, wired to `openTool`), which can ship for FLAGGED ROWS ALONE and so need not settle
whether a detected rim may be redrawn.

**Named debt found and not taken: detection runs twice per row.** `startAligner` always re-runs
`dentalOrient` on opening a row instead of reusing the batch result, so a case of eight pays the
expensive pass sixteen times. Wasteful, not wrong — but front-loading detection was the batch's
whole purpose.

## Previous completed step (E0 of dissolving the step machine — 2026-11-08)

The owner approved dissolving `dentalStage`. The route is `docs/design/2026-11-07-import-and-items-flow.md`
§10: ten increments E0–E9, each leaving the app working, with the two that cannot be split named.

**The ruling that unblocked it:** the Step-3 confirm-and-discard guard does not belong to navigation
at all. In a workspace that is ordered but not gated, moving is free — only MUTATING destroys hand
work. `openTool(tool, unitId)` changes focus and nothing else, so it has no guard to own; the guard
becomes a condition on upstream Apply, decided by one pure predicate. That closes the third
withdrawal fault by construction rather than by discipline.

**E0 is done:** the denture path through the rail had no test, although three lines of
`src/deck/unitFacts.ts` exist solely to fix a denture-specific rail lie review caught. Four tests
now cover both `isDenture` branches; each was deleted in turn to prove three tests go red.

**Next: E1** — remove the in-flow type step, and make Back at Orient return to the Items page
without ending the session (today it sends `exit` and discards `dentalFinished`).

## Previous completed step (the support build cycle, split by one test — 2026-11-08)

`App.tsx` 1430 → 1379 lines, in two commits so each reads on its own.

**1. `src/plate/buildViews.ts`** — everything the app READS off a support build, as pure functions:
`isSettled`, `isBuilding`, `withGeometry`, `meshesOf`, `rimGap`. They were inline `useMemo`s and a
nested ternary, so none of them could be tested. Ten tests now cover them, and the one that matters
is `rimGap`: its three-outcome verdict (a measured gap / nothing to say / `'unavailable'`) decides
whether the operator is told to look at the rim, and it had **no coverage at all**. `'unavailable'`
means the coverage was never computed — a released build, or a mesh built before the rim pass — and
must not read as "measured and fine", because silence and "I could not check" are different
sentences. The two paths that genuinely both mean silence are documented as deliberate.

**2. `src/components/useSupportBuilds.ts`** — WHEN a build is asked for: the 120 ms settling delay,
the build a slid denture keeps, the empty entry a unit with no supports still needs, and the pruning
of a unit that has left. Nine host fields in, nothing out.

**What deliberately did NOT move: the `built`/`failedBuilds` maps.** Thirty-odd read sites in
`App.tsx` and three hooks already take them as input, so a hook around them would hand back nearly
everything it was handed. The test used throughout: *a module is clean when its output is narrower
than its input.* A hub fails it; a job passes it.

### What this step found that nobody asked for

- **`src/plate/releaseTrigger.test.ts` was pinned to `App.tsx`** and failed when `requested` moved
  out of it. The tripwire's job is to fail when a debt is *paid*, so reading an ordinary refactor as
  payment is the one mistake it must not make. It now scans the whole tree for the mechanism rather
  than one file — strictly more robust, and it caught this itself.
- **The build effect listed `setStatus` as a dependency and has never called it**, while the
  `setStatusMessage` it does call was missing from the list. Harmless (both setters are stable),
  fixed in the move, and named in the hook's own comment. Same class of drift as `runCommand`'s stale
  `analysis`/`unitName` deps found in the previous step.
- `GeneratedSupportMesh`, `keptBuild`, `unitSupportMesh`, `supportJobOf`, `codedJobError`, `isAbort`
  and `BUILD_DELAY_MS` all became unused in `App.tsx` and were removed. `tsconfig` has no
  `noUnusedLocals`, so these have to be found by counting occurrences — a count of 1 means only the
  import line is left.

### The rule this step added to `src/components/README.md`

A module hands back LESS than it was given. Count host fields in against values out before
extracting; if the counts are close, it is a hub and moving it is motion rather than modularity.

## Previous completed step (App.tsx broken into modules — 2026-11-08)

- **Requirement:** the owner's standing last step — "code well organized, broken into reasonably
  modules, maintainable and readable by human, with comments well written". `App.tsx` at 1733 lines
  was the debt the previous step named and did not take.
- **Changed:** two whole jobs left `App.tsx` as hooks, each with a documented `host` field per
  dependency, and **no behaviour change intended anywhere**.
  - `src/components/useImportFiles.ts` — import: reading the files, the triangle/memory/plate
    refusals, placement, and what the status line says came of it. It took the import plate ledger,
    the pre-parse head estimate and the glTF parse with it.
  - `src/components/useSupportChecks.ts` — the support check: the findings by unit, the list the
    panel may show, the re-check of an edited unit, and Fix. It calls `useFixSpot` from the inside
    rather than beside it, because Fix both reads `problems` and reports whether a finding is being
    re-checked; keeping them apart was a cycle through `App.tsx`.
  - `src/components/README.md` is new. That folder had 69 files and no map, which is the single
    biggest navigation gap left in the tree; it is now the table of which hook owns which job.
- **Result:** `App.tsx` 1733 → 1431 lines. `tsc` 0 · tests 1497 pass, 1 skipped · `npm run build` 0.
- **Three things the guards and the reading caught, none of them planned:**
  - `threeBoundary.test.ts` failed, correctly. `App.tsx` was a listed exception for parsing glTF on
    the main thread; the parse moved into `src/components/`, which is INSIDE the view layer, so the
    exception did not move — **it stopped being needed**. Its third test, "lists only exceptions that
    still import three.js", is what caught it. One exception is left.
  - `runCommand` listed `analysis` and `unitName` as dependencies and its body reads neither. Both
    are stable callbacks, so nothing misbehaved; it was stale drift and the array now says what the
    function actually reads.
  - `applyTransform` had been imported by `App.tsx` and unused since before this change (confirmed
    against `HEAD`). Gone with the rest of the trim.
- **One decision worth carrying:** `useSupportChecks` takes `built` and `failedBuilds` rather than a
  `buildSettled` callback. A callback recreated every render is never equal twice, so putting one in
  the re-check effect's dependencies would tear down and rebuild its 600 ms timer on every render and
  could defer the re-check for as long as the app kept rendering. The maps compare by identity, which
  is the question actually being asked. The hook's docstring argues this where it would be changed.
- **Named, not fixed (deliberately, to keep the commit reviewable):**
  - **The support build cycle is the next extraction** — `built`, `failedBuilds`, the per-unit
    debounce, and the effect that schedules a build or keeps the one a slid denture already had. It
    is the most tangled piece left: one `forgetUnit` reaches the preview worker, the denture worker,
    `useRegenerate`'s `forgetPlacing` and `useSupportChecks`'s `forgetProblems`.
  - `runCommand` stays in `App.tsx`. It is a flat, readable switch; moving it out needs a dependency
    object of thirty-odd fields, which is not obviously an improvement.
  - Copyright headers on 15 of 226 source files — still the owner's call (recommendation: drop the
    15, since the build already emits `dist/THIRD-PARTY-NOTICES.txt`).
- **Next executable step:** extract the support build cycle, then **dissolve `dentalStage` into the
  one workspace — still the owner's decision, not taken.** The per-tool widgets and the rail as the
  workspace's own left edge depend on that second one: each stage owns the whole dock today, and a
  rail beside that dock would give two competing ideas of where the operator is.

## Previous completed step (the job deck — 2026-11-08)

- **Requirement:** replace the per-item step wizard with a job deck — one workspace carrying the model
  list, a tool rail, and per-row state — and build it in increments, each gated before it ships.
- **Changed:** `src/items/` (the deck's rows, the batch detection, the row pictures, split so each row
  owns what it says) and the new `src/deck/` (the enablement rule, the rail, the job-level tally).
  The two pieces both layers need sit one layer DOWN — `src/state/tools.ts` (`ToolId`, `TOOL_ORDER`)
  and `src/state/revisions.ts` (staleness) — because `src/state/project.ts` stamps revisions and must
  not import the view; `src/deckBoundary.test.ts` keeps that one-way. Full reasoning lives in
  `src/items/README.md` and `src/deck/README.md`; the design and what it got wrong are in
  `docs/design/2026-11-07-import-and-items-flow.md`.
- **Commits:** `6dcc062` (A), `091046d` (B), `42b1a58` (C), `75d86d6` (D core), `1609589` (D rail),
  `88977a3` (D mount + review fixes), `b028d91` (D stamp), `b2a9f9b` (graph).
- **Results:** `tsc` 0 · 1492 tests · `npm run build` 0 · **real-scan gate PASS (13 scans, no
  differences)** · walk 163/164, the single failure being `g-pre`, the machine-load precondition. One
  earlier walk in the same session returned ALL PASS on 165 checks.
- **Adopted behaviour worth carrying forward:** the rail expresses order by ENABLEMENT, not by steps,
  and a greyed tool must say what to do about it — a disabled control with no explanation is worse
  than a step. "Not yet possible" and "being made right now" must never look alike.
- **Risks and failures, stated rather than buried:**
  - A review found two blockers in code written the same day: nothing wrote `revisions`, so every unit
    the batch had just oriented read as unoriented; and one unclosed rim anchor counted as a rim,
    opening a tool that could not work. Both fixed and mutation-pinned.
  - Stamping revisions broke the denture's rigid-move optimisation — `keepsBuild` compares every unit
    key by identity, so a turn looked like a different build and valid supports would have been
    rebuilt. Caught by `rigidMove.real.test.ts`, now also pinned by a cheap unit test.
  - SIX tests that did not test surfaced across the release, the sixth being the walk's own `m4d`:
    it asserted "nothing is oriented" on rows the batch had already detected, and passed only because
    `oriented` was read off a field the batch never writes. Fixing the rule turned it red, which is
    the check working for the first time. Every fix in the deck work was verified by reverting it and
    watching the suite fail; that is the only reason none of them survived.
- **Per-tool entry was built and withdrawn.** `src/deck/toolEntry.ts` walked `backDental` to the
  pressed tool. Review found three faults: it was unreachable (the rail is on the deck, the deck is a
  start screen, and every route to one sends `exit` first), it hard-coded the aligner stage order so a
  denture would have been ejected from the flow with a job still live, and it bypassed the Step-3
  confirmation and hand-work discard, which live in the command handler rather than the reducer.
  Deleted; `src/deck/README.md` keeps the reasons so nobody rebuilds it the same way.
- **Reviewed, then repaired (2026-11-08).** Three EGM reviews ran in parallel on the deck work before
  any of it was committed; `docs/reviews/2026-11-08-egm-deck-rail.md` is the ledger of every finding
  and where its answer lives. The headline: `toolEntry.ts` was deleted outright (unreachable, wrong
  for a denture, and it bypassed the Step-3 guard), three stamping defects were fixed, `oriented` was
  reading backwards off a drawn rim, and the directory cycle between `src/state/` and `src/deck/` was
  broken. Two reviewer premises were wrong and were corrected rather than adopted.
- **Organisation pass (the standing last step).** `PREREQUISITE` replaced two parallel maps bridged by
  a cast; `ToolFacts.busy` became `runningTool` so the fact and the verdict stop sharing a word;
  `thumbnailNeeded` became `nextThumbnailToDraw` and a row's `shown` became `onRail`
  (`items-row--on-rail`). `src/deck/README.md` went 236 → 149 lines by becoming the map and leaving
  each rule's history at the code; `docs/ui-styling.md` lost a false claim about an open-tool look and
  gained `items-tally`; `src/items/README.md` now points at that one table instead of keeping a
  partial copy four names out of date.
- **Named, not fixed:** `App.tsx` is ~1700 lines — the release's real organisational debt. Copyright
  headers are on 15 of 226 source files; which way to make that consistent is the owner's call
  (recommendation in the review ledger: drop the 15).
- **Next executable step:** dissolve `dentalStage` into the one workspace — **owner's decision, not
  taken**. The per-tool widgets and the rail as the workspace's own left edge depend on it: each
  stage owns the whole dock, and a rail beside that dock would give two competing ideas of where the
  operator is.

## Previous completed step

- Requirement: same settings in Blender and web must produce the same supports.
- Harness: `tools/blender-parity/probe.py` (headless Blender 5.2 + mixo3d) records 19 settings cases on a downward pyramid into `tools/blender-parity/reference.json`; `src/supports/blenderCases.test.ts` replays each case (same contacts, true surface normals, same settings) and compares foot radius/centre, column top, touch sphere, neck tilt, and raft profile. Runs in `npm test`.
- Fixes found by the harness: neck is a cone Middle Ø -> Upper Ø along the clamped normal ending at the contact (no transition cone); feet on the plate with top at Bottom Thickness; Contact Depth sinks only the tip end; edge anchors inset Contact Ø/2 + 0.05; raft follows the model outline grown by Expand Width, floor and rim edges flare outward at Wall Angle; Roof/Cage raise Expand Width to Gap To Model + column radius; the model is now always passed for the raft footprint.
- Results: `npm test` 14 files, 132 tests pass. All 19 cases match on every compared dimension; 3-6 of 17 supports per 45-degree case are turned/shortened by SLASG pillar repulsion (0 at 30 degrees) and are counted, not compared.
- Next step: read SLASG's neck/pillar node group in Blender to replicate pillar repulsion, then tighten the test to compare every support.

## Previous step (island minima bit for bit)

`tools/blender-parity/minima_dump.py` runs the stock SLASG_VertexScatter on the mushroom (SDF
ridges off, as Resin UV runs it) and dumps every minima stage; `blenderMinima.test.ts` checks ours
stage by stage, bit for bit. Fixes found: the KD-tree must get Blender axes (web (x, y, z) =
Blender (x, -z, y)); merged positions mix in single precision (member × 1/n summed in index order);
snap and normal sample use a port of Blender's point BVH (`analysis/blenderBvh.ts`, BLI_kdopbvh
build + nearest, leaves padded by FLT_EPSILON, the snap returns the closest point on the padded
box); vertex normals are Blender's single-precision `normals_calc_verts` (bit-exact on all 1071
vertices). Placement time unchanged (knot 77k tris: 4.3 s, in the analysis worker).
Superseded by Release 2 Task 10 (licence-clean core): the BVH, KD-tree, legacy ridges and the
polynomial arccos were replaced by independent code (`analysis/nearestPoint.ts`,
`mergeByDistance.ts`, `legacyRidges.ts`, `core/acosf.ts`) with defined tie rules; the stage
tests are now tie-aware (src/core/README.md "Defined tie rules").
Not done, by decision: OpenVDB's concave-corner sign tracing (MeshToVolume.h sweeps, seed fills,
ComputeIntersectingVoxelSign; ~1.5k lines) for <= 0.05 mm at inner corners.

## Previous step (worker structure, support check, edit preview, responsive)

Workers by role (`src/workers/`), each reporting progress to the viewport bar:
- `meshClient` + `meshWorker`: two instances, preview and export. Keeps each unit's model (by
  token) so remesh/raft caches (WeakMaps on the model) stay warm; `forget(unitId)` frees them when
  a unit is deleted. A replaced build that has run > 800 ms is stopped by restarting the worker
  (other jobs re-sent, models re-sent on `need-source`). Export = one worker job: full-resolution
  supports + STL encoding (`encodeStl(parts)` in `supports/export.ts`, three-free), files returned
  as transferred buffers. Preview builds wait 120 ms (typing bursts).
- `analysisClient` + `analysisWorker`: pool of 1-3 workers (cores / 2), one job and one model per
  worker; keyed jobs (`place:<unit>`, `check:<unit>`), a replaced running job's worker is replaced.
- `importClient` + `importWorker`: STL parse + Z-up + weld; glTF parsed on the main thread
  (GLTFLoader may decode images) and only welded in the worker. Lives only during an import.
Support check (`analysis/supportCheck.ts`): plateau-aware downward local minima without a contact
within Support spacing, and overhang samples beyond 1.5 x spacing; touching cells merge into one
finding. UI: "Check supports" list (Show = focus camera, Fix = select + Support Edit Mode), markers
drawn through the model, auto re-check 600 ms after a checked unit changes, check alongside every
export with a warning. Edit preview: ghost tip (add) or Erase radius ring + doomed contacts (remove);
Add/Remove click action for touch. Raycasts use three-mesh-bvh (models always, supports only while
edited; supports take no pointer events otherwise). Layout: one grid row on desktop (canvas cannot
grow the page); tablet viewport on top + two panel columns; phone one column. Cross plate width
`tipCrossWidth` (% of tip Ø).

## Previous step (UI languages)

`src/i18n.ts` (API) with `src/locales/zh-Hant.ts` and `src/locales/ja.ts`: English, Traditional Chinese (Taiwan) and Japanese. English text is the key;
`t(key, vars)`, `plural(n, one, other)`; status lines are stored as `Message` (key + vars) so they
re-translate on switch; worker progress stages are keys (`STAGE_KEYS`) translated in the job activity list
(`components/JobActivity.tsx`; ProgressBar was removed in Release 2).
Language = saved choice (localStorage `mixodental.lang`), else browser language, else English;
switch in the header. Chinese terms follow the Blender add-on's zh_HANT dictionary. `i18n.test.ts`
fails when a UI literal, setting label or stage lacks a translation or a placeholder differs.

## Contact tip shapes (web and Blender add-on done; add-on b82ad6b, not pushed)

Settings `contactShape` (NONE default / SPHERE), `pointDiameter` (0.2 mm, the tip end at the model
when NONE), `tipSection` (ROUND / SQUARE / CROSS tip types) and `tipProfile` (TAPERED /
STRAIGHT). Defaults = a round cone whose 0.2 mm end touches the model, no sphere (owner's choice).
`tipRadius()` = Upper Ø/2 with a sphere, else Point Ø/2. Round + Tapered keeps SLASG's exact neck;
other shapes split the tapered ends (`addTip`, also landings and tree tips) and swap the tube
profile (`TIP_PROFILES`: square of side Ø, cross of plates Ø long and 0.4 x Ø/2 half-wide).
Blender parity tests pin `contactShape: 'SPHERE'` (their references were generated with spheres).
Fusion: a bare tip sinks `pointDepth` (Penetration, 0.2 mm, min 0.05) into the model: contact tips
along the surface normal (`tipDepth()`, SLASG's Touch Depth), landings on the model below past the
hit point along their own axis (`sinkInto`). Edge anchors inset by `contactRadius()` + 0.05 (the
0.2 mm point by default, the Contact Ø sphere with Sphere). Add-on: same rules (realizer v2,
generator patch v4, `point_depth`).

## Previous step (Support Edit Mode)

Port of Blender `mixo.support_place`: one toggle (viewport "Edit supports" button, sidebar
button, Tab); Esc / Enter / Done exit. Red frame, "Support Edit Mode · unit" badge and key bar
in the viewport; crosshair cursor. Click model = add; right-click or Ctrl+click a support or the
model = remove every contact within Erase Radius (Blender `remove_manual_near`); braces and raft
pass the pick through. Selection, gizmo and G/R/Delete are locked; undo stops at the scene the
mode was entered with. The mode ends when the active unit goes, on import and on Remove supports.

## Previous step (STL axis)

STL is Z-up; the editor is Y-up. `importStlUnit` rotates -90° about X (web = STL (x, z, -y)) and
`encodeStl` writes STL (x, -z, y), so files open upright in slicers and round-trip unchanged
(test in `export.test.ts`). glTF stays as-is (already Y-up).

## Previous step (placement on the remesh)

- Requirement: "Everything reasonably differ is fine. Fix all": the interior Poisson contacts and island minima came from the exact model while Blender scatters on its remesh.
- Changed: `RemeshTarget.fullMesh` (whole remesh in Blender's vertex and face order, verified identical on the probe pyramid and the mushroom), `SurfaceQuery` (BVH nearest surface point), `src/analysis/kdtree.ts` (Blender Merge by Distance via its KD-tree; replaced in Release 2 Task 10 by `core/analysis/mergeByDistance.ts`), `placement.ts` (Poisson and minima on the remesh, ManualPoints snap, exact-mesh fallback for open meshes; the old plateau emulation is gone), `blenderParity.test.ts` (point-for-point Poisson against `tools/blender-parity/mushroom_contacts.json`).
- Results: Poisson 22/22 on the mushroom match Blender within 0.01 mm; minima merge clusters identical to Blender (99/99); final minima differ only by float-rounding ties on grid-aligned geometry (every Blender minimum within 1 mm). `npm test` 18 files / 299 tests and `npm run build` pass; production build checked in the browser (77k triangles: about 5 s total, longest frame 17 ms, no console errors).
- Next step: optional, emulate Blender's float32 vertex normals and BVH tie order if exact minima on grid-aligned models ever matter.

## Previous step (background building and progress bar)

- Requirement: "Fix all. Add progress bar so freezes are manageable and user knows it's still working."
- Changed: `src/workers/meshWorker.ts`, `meshClient.ts`, `meshProtocol.ts` (support meshes built in a worker; the model is sent once per unit so the worker's remesh caches stay warm; newer requests for a unit replace queued ones); `src/components/ProgressBar.tsx` + styles (hairline bar and caption over the viewport, `role=progressbar`, reduced-motion aware); progress callbacks in `generatePlacement`, `buildSupportMesh`, `autoTreeLayout`, `unitSupportMesh`; placement worker posts progress; `App.tsx` keeps the previous mesh visible until the new one arrives; export builds export-mode meshes in the worker (`buildExportJobs` accepts prebuilt meshes).
- Verified in the browser (77k-triangle torus knot): longest main-thread frame gap 17 ms during placement, support building and Tree + Safe Distance 1.5 mm; the bar shows stages ("Placing contacts", "Sampling surface normals", "Laying out trees") with percentages; export downloads a valid STL (60,688 triangles); no console errors. `npm test` 18 files / 298 tests, `npm run build` pass.
- Next step: optional, cancel a running build when a newer request arrives (today a running build finishes before the newest queued one starts).

## Previous step (OpenVDB adaptive remesh, Safe Distance)

- Requirement: keep working until shippable; port the remaining parity gaps (adaptivity 0.1 remesh, Safe Distance).
- Changed: `src/supports/remesh.ts` rewritten as a port of OpenVDB VolumeToMesh in Blender index space (edge groups, ambiguous-face correction, 8³ leaf region merging, adaptive triangle collapse, disoriented-triangle relaxation, inverted orientation, BVH signed distance); `src/supports/openvdbTables.ts` (OpenVDB tables); `src/supports/autotree.ts` (Safe Distance against R's moved non-overhang faces, Spacing/16 junction weld); tests `remesh.test.ts`, `blenderNecks.test.ts`, `blenderSafe.test.ts`, stricter `blenderTree.test.ts`; tools `probe_safe.py`, `reference_safe.json`, `remesh_spike.json` (adaptive vertices added).
- Results: `npm test` 18 files, 298 tests pass; `npm run build` passes. Remesh matches Blender face for face on the probe pyramid at adaptivity 0 and 0.1; necks 461/476 within 0.02 mm (total 3.2 mm, was 180.7 with exact normals); all tree branch curves within 0.005 mm.
- Follow-up in the same session: grid values now follow meshToVolume (index-space float distances, 3-voxel band, 0.8-voxel renormalization). Necks 472/476 within 0.02 mm, total error 0.10 mm.
- Remaining: on a ledge shifted off the grid, 41 of 754 remesh vertices differ (up to ~0.05 mm), all at concave corners where OpenVDB's sign tracing (traceExteriorBoundaries, ComputeIntersectingVoxelSign) leaves wrong-signed voxels that renormalization then smears. Reproducing that needs a port of meshToVolume's voxelization and sign passes (MeshToVolume.h, v12). First generation +2.5 s on 77k triangles.
- Performance: allocation-free BVH signed distance with a band cap and numeric node keys; first build on 77k triangles ~1.5 s (was 2.8), cached rebuilds unchanged. The Safe Distance scatter remesh is now cached per unit source too.
- Deferred deliberately: the concave-corner sign tracing above. OpenVDB's sweep/flood semantics could not be confirmed from source alone and the effect is <= ~0.05 mm at inner corners.
- Next step: port `traceExteriorBoundaries` and `ComputeIntersectingVoxelSign` (OpenVDB v12 MeshToVolume.h lines 1368-1555 and 3049-3140) for the leaves the remesh touches, and check the shifted ledge against `ledge_dump.py` output.

## Previous step (Auto Tree and remesh normals)

- Requirement: "should do all": port Auto Tree and Blender's remesh-blended neck normals.
- Changed: `src/supports/autotree.ts` (eligibility ray, greedy clusters, descent, ManualPoints snap), `src/supports/remesh.ts` (Mesh to SDF Grid + Grid to Mesh emulated around queried points), `src/supports/mesh.ts` (`LineTarget`: remesh normals by contact class and remesh landings; `treeGeometry`; Blender's Limit Radius rule in `filletPolyline`), `src/supports/unitSupports.ts` (contact class from placement source, cached remesh), tests `remesh.test.ts`, `blenderTree.test.ts`, tool `tools/blender-parity/remesh_dump.py` + `remesh_spike.json`.
- Adopted Blender behaviour: nodes on the surface count as inside; quad vertex order as OpenVDB; edge normal = mean of the two angle-weighted vertex normals; Fillet Limit Radius shares each segment by displacement; voxel size in single precision. The "pillar repulsion" seen earlier is this normal blending.
- Results: `npm test` 16 files, 290 tests pass; `npm run build` passes. Neck directions now match Blender for 365 of 516 probe contacts (216 with exact normals). First build on a 77k-triangle model costs about 1.1 s more; cached rebuilds cost the same as before.
- Remaining: adaptivity 0.1 region merging (a few necks up to 0.6 mm off), Safe Distance for tree eligibility.
- Next step: emulate OpenVDB adaptive region merging in `remesh.ts`, checked against `remesh_dump.py` output at adaptivity 0.1.
