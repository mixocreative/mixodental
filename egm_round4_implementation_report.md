# Goldfish Review Report — Round 4

**Target:** `S:/ai/mixodental/docs/design/2026-11-07-import-and-items-flow.md`
**Scope:** `## 8. Sequence` (line 588) through line 891, including `## 9. Still open` (line 861). Sections 0–7 (lines 1–587) were reviewed concurrently by a separate synthesizer and are out of scope here.

**Swarm:** `egm-implementation-readiness` ×2 (A, B), `egm-codebase-details` ×2 (A, B), `egm-style` ×1. All four technical instances read the full reading list and verified citations against the tree.

**Verdict: the bar "watertight enough to implement" is NOT met.** Of the seven unstarted steps, **zero** can be started from the text alone. 7d is closest (its scope is nameable) but its line range is wrong for the fourth time and its replacement assertions do not exist. Step 9 is the weakest step in the document.

**Counts after deduplication: 24 🔴 Blockers, 23 🟡 Majors, 12 🟢 Nits.**

---

## Blockers

### B1 — Section `s` line range is wrong for the FOURTH time — Severity: 🔴
* **Lens:** `codebase-details` A+B, `implementation-readiness` A+B (unanimous)
* **Scope:** line 816
* **Quote:** "section `s` (2268–2424, 21 checks including `s2b` and `u1a`)"
* **Ground truth:** `scripts/walk.mjs:2299` is the section comment, `:2300` is `if (runs('s')) {`, and the block closes at `:2489` (`s19` at 2486, trailing `Exit` click at 2488). Line 2268 is inside section `l` (`l3` at :2264); 2424 is mid-section (`await d.idle(500)` before `s14`).
* **Effect:** the published range starts 32 lines early and **cuts off `s14`–`s19`** — the six checks that exercise held files, the type screen and Back, i.e. exactly what 7c changes.
* **Fix:** `2299–2489`. Better: stop citing absolute lines, which have now been wrong in three consecutive rounds — cite "the whole `if (runs('s'))` block, 21 checks: `s1`–`s19` plus `s2b` and `u1a`". The **check count 21 is VERIFIED correct** (enumerated: s1 2331, u1a 2333, s2 2338, s2b 2355, s3 2361, s4 2366, s5 2368, s6 2379, s7 2386, s8 2391, s9 2398, s10 2401, s11 2406, s12 2413, s13 2418, s14 2425, s15 2428, s16 2431, s17 2472, s18 2479, s19 2486).

### B2 — The *Add another aligner* check IDs are wrong (two of three) — Severity: 🔴
* **Lens:** all four technical instances
* **Scope:** line 816–817
* **Quote:** "the *Add another aligner* → *Next item* checks (`u2`, `u11`, `x14`)."
* **Ground truth:** the only checks asserting that control are in section `x`: `x1b` (`walk.mjs:1935`), `x1` (`:1940`), `x14` (`:2114`); helper option `another: 'Add another aligner'` at `:1924`. `u2` (`:1092`) is "one click on the card goes to Step 1, which asks for the aligner file"; `u11` (`:1856`) is "Back from Step 2 returns to Step 1 with the oriented aligner kept". Neither mentions the control.
* **Effect:** the rename would miss `x1`/`x1b`, which assert the literal string, and would churn two unrelated checks. `u2` is also double-booked between 7c and 7d.
* **Fix:** `x1`, `x1b`, `x14`. Add `src/locales/{ja,zh-Hant}.ts` and `src/denture/kindText.ts:20`, which carry the string. Note `WAY_ON`/`reviewWayOn` is interpolated into two of those labels.

### B3 — `MAX_FILL_LOOP_MM` does not exist; step 5 is marked DONE with an unmet exit, and step 9 depends on it — Severity: 🔴
* **Lens:** all four technical instances
* **Scope:** lines 666, 689–690
* **Quote:** "**So `MAX_FILL_LOOP_MM = 0.0`**" / "*Exit:* the constant exists, its comment states the distribution, and the measurement script is committed."
* **Ground truth:** a repo-wide search finds `MAX_FILL_LOOP_MM` only as two `console.log` strings in `scripts/measure-rim-loops.mjs:129` and `:137`, and in this doc. **There is no named host-side constant in `src/` or `vendor/`.** Nothing in `src/` calls `repairMesh` at all. The engine parameter is `maxFillLoopMm`, required with no default (`vendor/mixo-geocore/host/core/repairMesh.ts:113, 164, 318–323`). The measurement script *is* committed, so two of three exit clauses hold.
* **Effect:** step 9 has no constant to pass to `repair_mesh`, and the doc says step 5 shipped one.
* **Fix:** either declare the constant with its derivation comment now, or move that clause into step 9 (the first step with a caller) and change step 5's status to "DONE except the constant".

### B4 — "eight row states" / "eight row sentences" against the nine that shipped — Severity: 🔴
* **Lens:** all four technical instances
* **Scope:** lines 736–737, 762–763
* **Quote:** "the three-language text for **all eight row sentences**" / "add all eight row **states** to `kit.html` as static markup"
* **Ground truth:** `src/items/rowState.ts:65-66` — `ROW_STATES = ['unreadable','too-big','clean','holes','malformed','refused','unchanged','repaired','repaired-open']` = **nine**; `RowState` has nine members (`:53-62`); `src/items/README.md:9` is headed "The nine states, and why there are nine"; and **the doc's own line 694 says "nine row states as three tested partitions"**.
* **Effect:** the implementer must guess which state gets no `kit.html` markup and no three-language sentence (probably `too-big`, folded into §3's table). 6a's exit ("every state visible in `kit.html`") is satisfiable with eight of nine.
* **Fix:** nine in both places, and have the catalogue **iterate the exported `ROW_STATES` array** rather than hand-list — the same pattern `src/kit/Catalogue.tsx` already uses for `PROGRESS_TYPES`. That makes this class of bug impossible.

### B5 — Step 9 names no file, no worker side, no protocol message and no scene command — Severity: 🔴
* **Lens:** `implementation-readiness` A+B, `codebase-details` B
* **Scope:** lines 828–837 (against line 590, "Each step names its files, its exit criterion and its tests")
* **Quote:** "**9. Repair on a press** — the *Repair* action on a row, the repaired mesh replacing the unit as **one** undo step"
* **Ground truth:** `src/workers/importProtocol.ts:6-10` — `ImportTask` is `{kind:'stl'} | {kind:'weld'}` only, served as `serveTask<ImportTask, PreparedMesh[]>` (`importWorker.ts:30`). A repair needs a **third task kind**, a response carrying `positions`/`indices`/`RepairResult`/a fresh `ImportDiagnosis`, and a widened transfer list (`buffers()` in `prepareImport.ts`). Separately, `src/state/project.ts:92-126` has `unit/add`, `unit/remove`, `supports/*`, `transform/set` — **and no command that replaces a unit's `source`**. The host entry point `repairMesh(engine, positions, indices, maxFillLoopMm)` (`repairMesh.ts:318`) is never named in the step.
* **Guesses forced:** worker or main thread; the task-kind name and payload; the new `SceneCommand` name and reducer behaviour (`source/set`? remove+add, which changes the unit id and drops selection, supports, policy and zones); whether the mesh arrives `owned: true` as on the import path (`App.tsx:778`); how the single undo batch is formed.
* **Fix:** name the file (e.g. `src/workers/repairImported.ts`), the protocol variant, the command and its reducer, and the undo owner. Reuse the existing `dispatch({ type: 'batch', commands: [...] })` form (`App.tsx:774`).

### B6 — Step 9 never replaces `PrintUnit.diagnosis`, so every repaired unit silently loses its verdict on reload; and "records that it was repaired" names no field — Severity: 🔴
* **Lens:** `codebase-details` A+B, `implementation-readiness` A+B
* **Scope:** lines 834–835
* **Quote:** "The project file stores the repaired mesh and records that it was repaired."
* **Ground truth:** `src/state/project.ts:360` — `diagnosisField` does `if (found.triangles !== source.indices.length / 3) return {};`, i.e. it **drops** the saved verdict. Step 6 (doc line 750–754) says `triangles` exists *because* step 9 is the change that makes a verdict stale — but step 9 only observes it and never requires a replacement. And `PrintUnit` (`project.ts:63-71`) has **no "was repaired" field**; `ImportDiagnosis` has none either; `RepairResult.changed` (`repairMesh.ts:129`) is persisted nowhere.
* **Second-order:** `verdictOfRepair` takes a `RepairResult`, which is **not persistable**, so after a reload nothing can produce `repaired` / `repaired-open` / `unchanged` / `refused` — **four of the nine row states are unreachable for a reopened project**. The doc does not say whether the row falls back to `verdictOfDiagnosis`.
* **Also:** at fill limit 0 a repair that leaves the triangle count unchanged leaves a **stale verdict that passes the gate** — the one case `triangles` cannot catch.
* **Fix:** step 9 must (a) re-run `diagnoseImported` (`prepareImport.ts:78` — the only producer of a valid seven-key `ImportDiagnosis`) on the repaired full-resolution mesh and replace `diagnosis` **in the same batch as the mesh swap**, (b) name the new persisted "repaired" field, its type, its `normalizeUnit` gate branch and its migration, and (c) say which function the row uses after a reload.

### B7 — Step 9's capacity re-check is justified by a mechanism that cannot fire, and has no refusal path — Severity: 🔴
* **Lens:** `codebase-details` A+B, `implementation-readiness` A+B
* **Scope:** line 831
* **Quote:** "and a **capacity re-check**, because filling adds triangles and `assertPlateCapacity` is consulted only on the import path."
* **Ground truth:** with `maxFillLoopMm = 0` every loop reports `fill-disabled` (`repairMesh.ts:73, :188`), so `RepairSteps.loopsFilled` and `patchTrianglesAdded` (`:115, :117`) are 0 — **filling adds nothing**. The remaining movers are `degenerateTrianglesRemoved` (`:102`, reduces) and the non-manifold split's `verticesAdded` (`:105`, duplicates vertices, adds no faces). Repair cannot grow the triangle count this release. (`assertPlateCapacity` being import-only is **VERIFIED**: `vendor/.../core/budget.ts:128`, called only at `src/App.tsx:729` and `:746`, both through `reservation.hold`.)
* **Missing besides:** which guard (`assertTriangleCapacity` / `assertMemoryCapacity` / `assertPlateCapacity` — the last needs a `PlateScene` and a `PLATE.open()` reservation a repair has no analogue of); whether the repair path re-enters `PlateLedger`; and **what happens when the check refuses after the repair has already run** (discard? keep and warn? remove the unit?). The exit at 836 ("a refused repair leaves the unit untouched") does not disambiguate an engine refusal (`ok: false`) from a capacity refusal.
* **Fix:** re-justify on `verticesAdded` / vertex-count memory or as explicitly defensive against a future non-zero limit; name the guard, the call site and the post-hoc refusal behaviour.

### B8 — Step 11's `UnitBuild<KeptBuild>` is the right *type* but breaks five unnamed consumers — Severity: 🔴
* **Lens:** all four technical instances
* **Scope:** lines 846–848
* **Quote:** "widen `App.tsx`'s `built` map to `UnitBuild<KeptBuild>` (§5 — **not** `UnitBuild<BuiltSupports>`, which has no `footprint`)"
* **Adjudication (requested):** the doc's correction is **CORRECT and the earlier reviewer's `UnitBuild<BuiltSupports>` claim is confirmed FALSE.** `vendor/mixo-geocore/host/supports/unitSupports.ts:56` — `BuiltSupports = Pick<GeneratedSupportMesh,'dropped'|'droppedByZones'>`, no `footprint`; `footprint` is on `GeneratedSupportMesh` (`host/core/supports/mesh.ts:168`); `src/plate/plateLayout.ts:24` reads `entry?.mesh.footprint`. `UnitBuild<T extends BuiltSupports = GeneratedSupportMesh>` (`:59-62`) accepts `KeptBuild` as §5 line 425 defines it. `currentBuild` / `currentBuilds` / `unitContacts` are generic and survive (`:68, :73, :88`), and `planExport(scene, kind, built: ReadonlyMap<string, BuiltSupports>)` (`host/supports/export.ts:48`) is already generic enough.
* **BUT it does not type-check.** Five non-generic sites break and **none is named in step 11**:
  - `src/plate/plateLayout.ts:12` — declares its own `type Builds = ReadonlyMap<string, { unit: PrintUnit; mesh: GeneratedSupportMesh }>`; it does **not** use `UnitBuild`, so the generic bound buys nothing and `plateFootprints` (`:20`) stops compiling regardless of `footprint`.
  - `src/components/usePlateArrange.ts:16` — same restated shape, calls `plateFootprints` at `:40` and `:53`; fed from `App.tsx:337`.
  - `src/components/useFixSpot.ts:27` — `built: ReadonlyMap<string, UnitBuild>` (default generic = full mesh).
  - `src/components/useExport.ts:26` — `builtRef: MutableRefObject<ReadonlyMap<string, UnitBuild>>`.
  - `src/components/viewport/types.ts:23` — `supportMeshes: ReadonlyMap<string, GeneratedSupportMesh>`, fed from `App.tsx:326`. **A live unit still has to be drawn**, so the map cannot be uniformly `UnitBuild<KeptBuild>`; it needs a union plus a discriminator.
* **Also:** `KeptBuild` (§5 line 424–425) omits `modelLanded`, which the viewport reads (`ObjectViewport.tsx:169`) and §5 line 437 flags but does not carry in. `src/plate/plateLayout.test.ts:25-30` builds a full-mesh fixture.
* **Fix:** give the real value type and discriminator, list all five files (converting them to the generic `UnitBuild<T>` form rather than restating `{ unit; mesh }` a fifth time), decide `modelLanded`, and name a projection (`keepOnly(mesh: GeneratedSupportMesh): KeptBuild`).

### B9 — The row cap is a prerequisite of step 11 and is owned by no step — Severity: 🔴
* **Lens:** `implementation-readiness` A+B, `style`
* **Scope:** lines 853–857, with 680–681 and 863–866
* **Quote:** "**But do the cap first, and consider not doing this at all.**" / §9: "**Recommendation: take the per-model figure from step 5's measurement and set a row cap from it** … rather than guessing a number now."
* **Ground truth:** the number already exists — line 681, "A cap of 8 is ~100 MB held, which is the number §9's recommendation now has instead of a guess" — so §9's "rather than guessing a number now" is **stale**. But no step in §8 implements it: no constant name, no file, no three-language refusal string, no test, no exit. 7b's drop loop is where a 9th file must be refused, and the refusal is a **fourth** capacity sentence the `too-big` state must map — `CapacityLimit` is `'triangles' | 'memory' | 'plate'` (`rowState.ts:40`), and a row cap is none of those.
* **Fix:** make the cap its own numbered step before 11 (constant + home, three-language refusal, a new `CapacityLimit` member, and a check that the 9th file is refused by name), and delete the stale §9 bullet.

### B10 — 7a-remaining has no exit criterion; the one it inherits already passes and asserts the opposite flow — Severity: 🔴
* **Lens:** `implementation-readiness` A+B
* **Scope:** lines 781–783 with 792
* **Quote:** "*Exit:* a drop of three files where one is corrupt imports the other two, and the tree is green with the three-screen flow still working."
* **Ground truth:** that is exactly walk `m1` (`scripts/walk.mjs:1035`), which landed with the loop half at `4718e21`. The criterion is green **today, with no Drop page at all**, and it asserts the **three**-screen flow when the step adds a fourth screen.
* **Missing:** no walk check, no test file, no `data-ui` list, no new strings for the half that is left.
* **Fix:** give 7a-remaining its own exit — the Drop page's class name(s), the new checks replacing `s1`/`u1a` (which select `.start-task` and pin "What would you like to support?" / "Choose what to make supports for.", `walk.mjs:2302, 2333-2335`), the three-language strings present in both locale files, `StartScreenId` containing `drop`, and a multi-file drop plus a non-model refusal through the existing `onUnsupported` path.

### B11 — Line 791 delegates a design decision, and line 802 contradicts line 790 — Severity: 🔴
* **Lens:** `implementation-readiness` A+B
* **Scope:** lines 790–791, 802–803
* **Quote:** "`release()` drops the whole drop's hold, so an abandoned row needs either a per-file `PLATE.open()` or a per-row handle — a `plateLedger.ts` API change with its own tests. **Decide which; do not leave it.**" against "**Removing a row before its unit exists must call `reservation.release()`** … no other step owns this."
* **Ground truth:** one `reservation = PLATE.open()` per drop (`src/App.tsx:701`), `release()` at `:758`/`:805`, `commit(added…)` at `:781`. As written, **removing one row releases every other row's hold.**
* **Fix:** pick the grain and give the signature. Note that the per-file grain needs **no API change at all** — a second `PLATE.open()` per file, with `settle(sceneIds)` (`src/core/plateLedger.ts:45-47`) already ending a committed hold when the units appear, which is the reconcile 7b worries about. Name the test file.

### B12 — 7a-remaining and 7b own the same three edits, and the union literal after each step is never stated — Severity: 🔴
* **Lens:** all four technical instances
* **Scope:** lines 781–783 against 795–797
* **Quote:** 7a: "`StartScreenId` gaining `drop`, the task keys moving onto it, `StartScreen` taking `File[]`" / 7b: "`StartScreenId` becomes `drop | items`; the task screen's three keys and *Open a saved project* move to Drop; `StartScreen` takes `File[]`"
* **Ground truth:** one declaration — `src/components/StartScreen.tsx:14`, `export type StartScreenId = 'task' | 'type' | 'file'` — and one move. Whichever step runs second has an unsatisfiable diff. 7c then deletes `'type'`, and the doc never states the member set after 7a, after 7b or after 7c, nor what becomes of the `'file'` screen that `s3`–`s19` and `onScreen('file')` drive. Both steps also claim the drop-loop restructure (788–790 against 798).
* **Fix:** one owner per edit, and the exact union literal at the end of each of 7a/7b/7c.

### B13 — 7b's exit is unreachable in the doc's own order, and 7b and 7d both claim the walk rewrite — Severity: 🔴
* **Lens:** all four technical instances + `style`
* **Scope:** line 800 and 804 against 809–811 and 816
* **Quote:** 7b line 800: "Section `s` **and** the section `u` type-screen checks rewritten"; line 804: "*Exit:* `ALL PASS` on the whole walk"; line 816: "**7d. The walk rewrite** — section `s` …, the section `u` type-screen checks"
* **Ground truth:** 7b changes `StartScreenId` to `drop | items`, which breaks `s1`…`s19` (they wait on `.start-task` and `.start-screen .choice-keys`, `walk.mjs:2302`). So `ALL PASS` cannot hold at the end of 7b unless 7b **is** the rewrite, in which case 7d is empty. 7c (809–811) separately insists it must land **before** the walk rewrite. And line 607 forbids any `ALL PASS` at all while `g` has no cause.
* **Fix:** assign the section-`s`/`u` rewrite to exactly one step; give 7b an exit it can reach (`--only=s,u` green with the rewritten checks, or "no failure other than `g`" scoped to named checks); state the order once as 7a, 7b, 7c, 7d.

### B14 — "streams each file into a unit instead of accumulating" is a one-clause rewrite with five unstated consequences — Severity: 🔴
* **Lens:** `implementation-readiness` B
* **Scope:** line 798
* **Quote:** "the drop loop streams each file into a unit instead of accumulating (§0)"
* **Ground truth:** today the loop accumulates `imported: PreparedMesh[][]` and places everything in one batch with a single `selection/set` (`App.tsx:704, 765–781`). Streaming changes: (1) where `placeImportedUnits` is called — per file, so `existing` grows per file and `ARRANGE_GAP` placement changes; (2) the `adding` / `reservation.hold` accounting (`:746`); (3) the undo grain (one undo per drop becomes one per file?); (4) the final `selection/set`; (5) the "refusal wins the status line" rule (`:797-800`) and the `heaviest`/`plate` status. Every one is a guess.
* **Note:** this is the step that buys the peak-memory win, and its exit says nothing about memory.
* **Fix:** name the new loop shape and each of those five consequences explicitly.

### B15 — The `JobActivity` suppression mechanism does not exist and is unspecified — Severity: 🔴
* **Lens:** `implementation-readiness` A+B, `codebase-details` A
* **Scope:** line 799
* **Quote:** "with `JobActivity` suppressing import jobs and the veil off"
* **Ground truth:** `src/components/JobActivity.tsx:55` is `JobActivityPanel({ activity = jobActivity, stagedBar })` — **no filter prop and no scene input**. Rows come from the vendored singleton (`vendor/mixo-geocore/host/workers/jobActivity.ts:123`, whose `begin({label, cancel, blocking, context})` is the only place a job could be tagged), and the veil is derived from `rows.some(row => row.blocking)` (`JobActivity.tsx:65, :79`). "Suppressing import jobs" could mean a new host-side filter prop, or using `context`, or flipping `blocking` at the import call site — three changes with different blast radii, one of which touches vendored code and therefore `vendor:check`.
* **Fix:** name the mechanism, the file and the prop/field — e.g. "pass `scene`; when `'start'`, drop rows with `context === 'import'` from the list **and** from the `blocking` reduction". Note the bare symbol `JobActivity` is also ambiguous: the vendored class is `@mixo-geocore/host/workers/jobActivity` (`src/workers/projectClient.ts:4`), the panel is imported as `JobActivityPanel` (`App.tsx:12`).

### B16 — Removing the type screen breaks four sites 7c never names, including `walk:locales` — Severity: 🔴
* **Lens:** `codebase-details` B
* **Scope:** line 810, 812
* **Quote:** "section `u` checks (`u0`, `u1`, `u2`) exercise the in-flow type card"
* **Ground truth:** `u0`/`u1`/`u2` (`walk.mjs:1082/1087/1092`) are correctly identified, but the literal `'Step 0 · Aligner type'` is awaited at **four** places, three of them outside those checks:
  - `:1072`, inside helper `backToTypeScreen()` (`:1068-1074`), called at `:1361` and `:1442` — so the `u5b*` and `u7`/`u8` recovery scenarios die too.
  - `:1895`, in **section `x`** (`if (runs('x'))` at `:1864`).
  - `:2624`, in **`walkLocale`** — i.e. `npm run walk:locales`.
* **Effect:** 7c's exit (line 814, "`npm test` green, and a walk check that Back at Orient keeps `dentalFinished`") requires neither `npm run walk` nor `npm run walk:locales`, **both of which this step breaks**.
* **Also:** line 812's "Delete `dentalStage: 'type'` and its sites (§1)" is not a list — §1 (70–74) says "about fifteen sites", names ~twelve, and ends "and six test files" unnamed.
* **Fix:** enumerate the sites and test files by path, name `backToTypeScreen` and its two call sites, section `x`'s `:1893-1895` entry and `walkLocale`'s `:2624`, and put the walk and walk:locales in 7c's exit.

### B17 — "Start screen up with a live dental session" is a new state with undefined consequences — Severity: 🔴
* **Lens:** `implementation-readiness` A
* **Scope:** lines 811–813
* **Quote:** "make **Back at Orient return to the Items page without ending the session**"
* **Ground truth:** `sceneOf` permits it ("A start screen wins", `src/scenes/sceneMap.ts:141-145`), but with `mode === 'dental' && dentalStage === 'aligner'` still set, `acceptsDentalDrop()` is **true** (`editingMode.ts:353-355`), so `importFiles` takes the `dentalDrop` branch and does `files.slice(0, dentalDrop ? 1 : undefined)` (`App.tsx:692`) — **a drop of five files on the Items page silently imports one** and routes it into the flow. It also leaves `dentalAligner: 'prompt'`, whose dock asks for a file.
* **Fix:** state which session fields Back writes, what `importFiles` does while a Start screen is up with a live session, and whether `acceptsDentalDrop` gains a "no start screen" clause.

### B18 — 6a hands two design decisions to the implementer, one phrased as "decide" — Severity: 🔴
* **Lens:** `implementation-readiness` A+B
* **Scope:** lines 759–761, with §9 867–868
* **Quote:** "Declare the app row-height token in `src/styles.css` … **decide and document** the neutral row tone so `ledger`'s `--red` does not reach a routine row"
* **Ground truth:** neither token is named and neither value given (22px is prose at line 563). §9 (867–868) only offers "**Recommendation:** a documented token" — a recommendation is not a decision. `noColourLiterals.test.ts` fails on a literal, so the implementer cannot even prototype. Verified: no `--row` token is declared in `src/styles.css`, `src/styles/theme.css` or `src/styles/layout.css`, **while `docs/ui-styling.md:478` already carries `| --row | 22px | Control and list row height |`** — the doc half is done and the code half is not.
* **Fix:** name both tokens and values (e.g. `--row: 22px`, plus a `--row-quiet`-style tone token), the `docs/ui-styling.md` table row each belongs in, and whether `ledger`'s `--red` is re-pointed or the row opts out. Strike the §9 bullet once decided.

### B19 — 7b never says how the session enters dental mode for the FIRST item, and the rule it gives is unusable there — Severity: 🔴
* **Lens:** `implementation-readiness` A
* **Scope:** line 795
* **Quote:** §1 line 92, binding on 7b: "**The trap: never enter an item through `startDental`.**"
* **Ground truth:** `startDentalAligner` / `useSelectedAligner` only work when `acceptsDentalDrop()` is true — `mode === 'dental' && dentalStage === 'aligner'` (`editingMode.ts:353-355`) — and the only events reaching that from `off` are `startDental` and `enterDental`+`chooseDentalProfile`. **So for item 1 the plan forbids the only door and names no replacement.**
* **Fix:** state it — e.g. "the Appliance key on Drop sends `startDental(profile)` once per drop (`dentalFinished` is empty there anyway); every subsequent item goes through `startDentalAligner`, never `startDental`."

### B20 — The Drop page's own copy and `accept` list are undecided — Severity: 🔴
* **Lens:** `implementation-readiness` A
* **Scope:** line 781, with §9 line 872
* **Quote:** §9: "***Appliance* or *Purpose*** for level 1. **Recommendation:** Appliance"
* **Ground truth:** level 1 lives on the Drop page (§2 line 121), so 7a cannot write its copy while the word is a recommendation. Unstated: the chosen label, the key labels, the tooltip words §2 line 169 calls "**words to write**, in three languages", the heading, the footer sentence, and the `accept` list — §6's three-format answer (494–497) is also only a "**Recommendation**", while today's input is `accept=".stl"` (`src/components/StartScreen.tsx:96`).
* **Note:** *Appliance* is already **used** by 6a (line 761, "glossary terms for *Appliance*"), so the open question is answered by use but not by decision.
* **Fix:** write the decided strings (en / ja / zh-Hant in Taiwan wording) and the decided `accept` list into 7a; strike the §9 bullet.

### B21 — Step 9 is silent on memory, in a project whose first-class constraint is lowest peak — Severity: 🔴
* **Lens:** `implementation-readiness` B
* **Scope:** lines 828–835
* **Quote:** "the **display decimation re-run**, the **pick index rebuilt**"
* **Ground truth:** at the peak this step holds the original `source` (retained by the undo stack, since the repair is "**one** undo step"), the engine's `RepairResult.positions`/`indices` (a second full copy — `repair_mesh` allocates, as `prepareImport.ts:65-66` notes), the old display copy (`displays` is a `WeakMap` keyed on the old mesh, so it dies only when the undo entry does), the new display copy, and **both** pick indexes. On a 12.2 MB model that is roughly 4× the import peak, and the step says nothing about what is freed or when.
* **Fix:** state the retention explicitly (undo keeps the pre-repair mesh; the measured cost; whether the repair may transfer rather than copy), or say the undo entry is dropped.

### B22 — Step 9's exit omits every project gate, in the step that first runs `repair_mesh` on real geometry — Severity: 🔴
* **Lens:** `implementation-readiness` B
* **Scope:** lines 836–837
* **Quote:** "*Exit:* a refused repair leaves the unit untouched; a successful one leaves picking, display and capacity consistent."
* **Ground truth:** the project bar (each step its own module with docs + tests, README map updated; DONE only when `tsc`, the full vitest suite, the build **and** the walk pass; `npm run gate:real` for any engine change) is met by steps 4, 5, 6 and 6a and abandoned from 7c onward. Step 9 is the worst case: no test file, no README, no `npx tsc --noEmit`, no `npm test`, no `npm run build`, no walk check, no `walk:locales` (the four repair row sentences are new UI text), **and no `gate:real`** — in the step that newly runs the engine's repair on real scans. "Leaves picking, display and capacity consistent" names no assertion, and "a refused repair leaves the unit untouched" passes if *Repair* is never wired at all.
* **Fix:** spell out the same exit block steps 4 and 5 use, plus `gate:real` and `walk:locales`.

### B23 — The "7a (original)" block is stale, reads as current instruction, and holds the only exit — Severity: 🔴
* **Lens:** `style`, `codebase-details` A, `implementation-readiness` A
* **Scope:** lines 785–793
* **Quote:** "today one `try`, one `PLATE.open()` and one `AbortController` wrap the whole drop, so a single refusal **aborts the entire drop and adds nothing**."
* **Ground truth:** false since `4718e21`. `src/App.tsx:703-751` — the outer `try` is at 703, but **each file now has its own `try` at 723** with `catch` at 747 collecting into `refused` (aborts re-thrown at 748); `:757-761` release and report when nothing survived; `:797-800` let a refusal win the status line. (The single `PLATE.open()` at `:701` and single `AbortController` at `:698` remain true.)
* **Effect:** a fresh reader will redo work that is done. The block is also not marked non-normative — unlike the retained-and-refuted passage at 822 — yet it contradicts the live text above it and contains 7a's only `*Exit:*` and its only statement of the reservation-grain decision.
* **Fix:** delete 785–793, folding the still-live content upward, or quote-block it and mark it "as it was before `4718e21`".

### B24 — Step 0's `g` record contradicts §9's, and the stale `s17` allowance licenses a real regression — Severity: 🔴
* **Lens:** all four technical instances
* **Scope:** lines 594–599, 607–611, 617 against 874–887
* **Quote:** line 594: "**`g` IS DONE: it is pre-existing.**" / 597: "**identical output, `selected 0` on the unthrottled stroke and the same hash `#811c9dc5`**" / 617: "**Walk now: `1 FAIL (152 checks)`**" against 875–877: "it is **not** deterministic … At HEAD it has both failed and passed"
* **Adjudication:** **§9 is the honest one and the owner's position is CONFIRMED by the code.** `g` is in section `a` (`if (runs('a'))` at `walk.mjs:649`, check at `:884-886`), so `--only=a` and the `[only a]` suffix (`:2714-2715`) are right. The flake mechanism is in the check's own comment (`:862-865`): "Too slow and the pointer moves are dropped outright and **the stroke selects nothing** — which is how this failed on this machine at 4x" with `const throttle = 4` at `:872`. That is exactly the "selects 4 when it passes, 0 when it fails" tell. So: **pre-existing AND non-deterministic, by construction.** Step 0 presents a single sample as the state, on exactly the one baseline run §9 disowns at 874–876 and whose process lesson it spells out at 889–891.
* **`s17`:** §9 (881–887) correctly records it **FIXED**, and the fix is in the tree as described — `walk.mjs:2443-2466`: wait for `[data-ui="rim-why"]`, Cancel, `waitForFunction(/Step 1/)`, `d.quiet()`, `d.idle(300)`, then Back. But **line 611 still schedules a baseline of a fixed bug** ("*Remaining exit:* `s17` baselined the same way (`--only=s` at `1db2987`), then a cause for each"), and **line 609's allowance "no new failures beside `g` and `s17`" licenses a real regression.**
* **Fix:** restate step 0's numbers as one observed run; delete the `s17` half of 611 and of 609; replace every downstream `ALL PASS` (804, 818) with "no failure other than `g`, with `g`'s measured rate recorded". Also note `walk.mjs:2432-2442` still carries the **superseded** `s17` explanation immediately above the comment that replaces it — two comments, two causes, which is what step 3 exists to remove.

---

## Majors

### M1 — `enterEditor`'s call-site count is wrong — 🟡
Line 804, "because `enterEditor`'s seven call sites all sit outside it". Declared `walk.mjs:226`; called at 541, 961, 979, 1028, 1070, 1078, 1893, 2184 = **eight**. The argument the sentence makes is sound either way, and "all outside section `s` (2299–2489)" is VERIFIED. (Same wrong count at line 61, out of scope.)

### M2 — `ImportDiagnosis`'s field count is wrong twice — 🟡
Lines 712–713 and 716–717: "`ImportDiagnosis` is five facts and a body count" / "Four of its six fields are `Pick`ed from the vendored `RepairReport`". `src/state/diagnosis.ts:37-46` picks **five** (`triangles`, `watertight`, `boundaryLoops`, `nonManifoldEdges`, `windingConsistent`) and declares two (`longestRimMm`, `bodyCount`) = **seven**; `project.ts:353-354` validates seven; `prepareImport.ts:81-89` returns seven; `rowState.test.ts:7-11` constructs seven. `triangles` was added by `83a4998` and the counts were never updated. **The same miscount survives in `diagnosis.ts:16` and `:20`, `src/items/README.md:57,69` and `diagnoseImported.test.ts:7`** — step 3's "no file asserting what another denies" rule applies, so fixing the doc alone leaves four stale comments. Correct wording: "six facts and a body count; five of its seven fields are `Pick`ed".

### M3 — `noDuplicatePackages.test.ts` does not exist — 🟡
Line 717. The guard is **`src/noDuplicates.test.ts`** (plus `scripts/check-no-duplicates.mjs`). The same wrong name is already baked into `src/state/diagnosis.ts:21` and `src/items/README.md:70`, so the plan is propagating a name that greps to nothing.

### M4 — `DiagnoseReport | CodedError` is not the classifier's input type — 🟡
Line 734. There is no type named `DiagnoseReport` anywhere in the tree (the engine type is `RepairReport`), and `CodedError` is not referenced by `rowState.ts`. The declared input is **`ImportRefusal`** (`src/items/rowState.ts:43-47`), with three entry points: `verdictOfRefusal` (`:69`), `verdictOfDiagnosis` (`:80`), `verdictOfRepair` (`:91`).

### M5 — 13 scans against 18 scans inside the same step, and a stale parenthetical — 🟡
Line 683, "Loop `diagnose_mesh` over the 13 scans (a new script under `scripts/`)" against line 654, "all 18 local real scans". 18 is corroborated by `src/items/README.md:30`, `rowState.ts:25-27`, `diagnosis.ts:34` and `rowState.test.ts:60`; 13 is step 4's real-scan-gate corpus. And the script is not new — `scripts/measure-rim-loops.mjs` is committed.

### M6 — 7c's stated cause is false, so the fix would be written in the wrong place — 🟡
Lines 812–813, "today it sends `exit` and discards `dentalFinished`". Back at `dentalStage === 'aligner'` does send `{type:'exit'}` (`App.tsx:1110-1116`), but `exit` only does `withMode(state,'off')` (`vendor/mixo-geocore/editing/session.ts:129-131`), and `withMode` (`:105-108`) touches `mode`, `shiftHeld`, `selection`, `tool` — **it does not clear `dentalFinished`** (`src/bench/benchScene.test.ts:56` relies on the list surviving into `mode: 'off'`). The loss happens one event later, on re-entry: `startDental` (`editingMode.ts:217-219`) and `enterDental` (`:212-215`) both set `dentalFinished: []`, guarded on `mode === 'off'` — which `exit` has just made true. Restate the cause, so the implementer does not hunt for a reset inside `exit`, and so the fix lands where it belongs: the Items-page re-entry must go through `startDentalAligner`/`useSelectedAligner`.

### M7 — The non-manifold fixture is not the case the 8 real scans land in — 🟡
Line 730, "the case all 8 of the affected real scans land in". `src/workers/diagnoseImported.test.ts:51-55` — the fixture's own comment says three triangles on a shared edge make that edge non-manifold "**while leaving rims open too**", whereas the 8 scans are non-manifold with **zero** open rims. The test asserts only `watertight === false` and `nonManifoldEdges > 0` (`:62-63`); it never asserts `boundaryLoops === 0`. The measured case is covered in `src/items/rowState.test.ts:64-68` (`boundaryLoops: 0, nonManifoldEdges: 447`), not here. Either soften the claim or add a closed-but-non-manifold fixture.

### M8 — Selection-then-entry ordering is unstated, and the obvious code is broken — 🟡
Line 795 with §1 line 90 ("The Items page selects the row's unit and takes this path"). `useSelectedAligner` reads `sceneRef.current.activeUnitId` (`App.tsx:817`), and `sceneRef.current` is assigned only during render (`App.tsx:188`) — so dispatching `selection/set` and then calling it in the same handler reads the **previous** active unit. `startAligner`'s `stale()` also requires `activeUnitId === unit.id` when the orient result lands (`src/components/useDentalFlow.ts:161`). Say the row passes its unit directly (`startDentalAligner(unit)` plus `selection/set` in one batch) and name the new call site — `onUseSelected` today only reaches `DentalBar` (`App.tsx:1518`).

### M9 — `src/scenes/` is never updated by 7a/7b/7c, and the doc itself says why that is dangerous — 🟡
`sceneMap.ts:84` spells out `owns: 'A \`StartScreenId\` is set (\`task\`, \`type\` or \`file\`)…'`; `sceneMap.test.ts:56-57` asserts the `'task'` and `'type'` literals; `src/scenes/README.md:8,13` repeats them. Steps 7a/7b/7c change exactly those literals and none lists the three files — while step 3 (636–638) warns these "go stale silently because `sceneOf` takes `string | null`" (`sceneMap.ts:142`).

### M10 — Step 3 has no status marker, is in fact unstarted, and its exit is unfalsifiable — 🟡
Line 632 carries no DONE/UNSTARTED marker while 1, 2, 4, 5, 6 do. The code shows it has not run: `sceneMap.ts:84` still reads "(`task`, `type` or `file`)", `SceneScope` is still unjustified (`:39, :62, :82`), and `BENCH_ARRIVALS` still carries the `finishDental` arrival (`src/bench/benchScene.ts:94-98`, still asserted at `benchScene.test.ts:56,64`). Its exit (639), "no file asserting what another denies", would pass with all six listed contradictions in place. Mark its status and give per-site assertions.

### M11 — Step 11's exit omits two of `KeptBuild`'s five fields — 🟡
Lines 849–851 name "`dropped` / `droppedByZones` / `footprint` remain" — but §5 line 425 defines `KeptBuild` as `Pick<GeneratedSupportMesh, 'dropped' | 'droppedByZones' | 'footprint' | 'unresolved' | 'dentalRimCoverage'>`, and §5 441–448 record that `App.tsx` passes `mesh.mesh.unresolved` to `denture.supports.resolveAll` and reads `activeMesh?.dentalRimCoverage?.needsReview` (walk `l4`, `walk.mjs:2292`). All five exist on `GeneratedSupportMesh` (`host/core/supports/mesh.ts:155,157,167,169,177`). **A green exit would therefore pass with `resolveAll` silently a no-op and `l4` red.** Add both fields to the exit or record them as accepted costs there.

### M12 — "a **successful** export" names a hook that does not exist — 🟡
Line 848. `src/App.tsx:1223-1232` — `exportedDental` is sent **unconditionally and before** the export (the comment says so deliberately) and `runExport`'s result is discarded by `void`. The policy is right; the mechanism is missing. Step 11 must say that `runExport` is awaited and its outcome surfaced, and name the success site (`useExport`'s resolution? a new callback?).

### M13 — Step 9's display re-run has an unstated tier branch and no key cleanup — 🟡
Lines 829–831. A display copy exists only for the heavy tier (`prepareImport.ts:52-56`), and `setDisplayMesh` is keyed main-thread (`App.tsx:763`; `src/state/meshExtras.ts:12`), with the pick index registered via `setPickIndex((display ?? mesh).positions, …)` (`src/workers/importClient.ts:37`). Unstated: what happens if the repair changes the tier, and who un-registers the old display and pick keys.

### M14 — Step 9 cannot reuse `prepare()`, and the doc does not say what replaces it — 🟡
Lines 832–835. `prepareImport.ts:47-58` — `prepare()` does `assertTriangleCapacity` → `center(item)` → `if (meshTier(triangles, runtime) === 'heavy') display = simplify(centred.mesh, Math.floor(TRIANGLE_BUDGET[runtime] / 2))`. **Centring and decimation are coupled inside one function and the heavy-tier threshold is inline at `:53-55`.** So centring is separable only by not calling `prepare` — which means step 9 either duplicates the heavy-tier predicate at a second site that will drift, or `prepare` is split into `centre` and `displayFor(mesh, runtime)`. The doc must say which. (Reusable as-is: `decimateWithWasm` `:37`, `meshTier`/`TRIANGLE_BUDGET` `:2`, `buildPickIndexData` `importWorker.ts:53`, `diagnoseImported` `:78`.)

### M15 — The Drop/Items failure matrix stops at "one bad file" — 🟡
Lines 772–776 cover the corrupt-file and whole-drop-cancel cases and nothing else. Unaddressed anywhere in §8/§9: (a) **a second drop while one is in flight** — `importFiles` refuses only on `importRefusal(mode)` (`App.tsx:686`), so two concurrent drops open two `PLATE.open()` reservations and both call `placeImportedUnits`, and 7b's "Items page owns the import while the Start scene is up" gives no rule for append-vs-refuse; (b) **a worker crash or termination mid-drop** (does the row read "could not be read", or spin forever?); (c) **a drop of only unsupported files** — today `accepted.length === 0` yields the `file-type` coded error (`App.tsx:693`), and the Drop page must preserve the existing `onUnsupported` prop, which 7a-remaining never mentions. Add one short failure table.

### M16 — Per-row abandonment contradicts the whole-drop cancel, and the arrives-after-removal race is undefined — 🟡
Lines 802–803 against 772–773. 7a locks in one `AbortController` for the whole drop, so removing a single row cannot stop that file's read; the doc never says whether the row's remove aborts the file (which needs a per-file controller nobody adds), nor **what happens when the worker returns a mesh for a row the operator already removed** — the current loop would place it as a unit (`App.tsx:762-781`). State the per-file controller, or the discard rule and where the discard happens.

### M17 — The Items page after a project reload is unspecified — 🟡
7b puts in-flight rows in `PlateLedger`, "outside `scene.units`" (802–803). Units arriving from `project.open` have a saved `diagnosis` (or none, after the staleness drop at `project.ts:360`) and no row history. Whether the Items page lists them, what a unit with no verdict shows, and whether *Repair* is offered for a reopened project are all unstated — and `offersRepair()` (`rowState.ts:100`) answers only `holes`/`malformed`. See also B6, which makes four of the nine states unreachable after a reload.

### M18 — 6a's exit cannot fail for the thing it guards — 🟡
Lines 765–766. `src/ui/uiStylingDoc.test.ts:35,43-46` is **one-directional**: it fails only on a token the code declares or reads that the doc does not name, so a **documented-but-undeclared** token passes — and `docs/ui-styling.md:478` already documents `--row: 22px` while nothing declares it. This is exactly the trap the doc itself diagnoses at 528–534 and then adopts as its exit. "Every state visible in `kit.html`" is eyeball-only though `src/kit/Catalogue.test.tsx` exists. Add "`Catalogue.test.tsx` asserts one entry per `ROW_STATES` member", an assertion that the token sits in the **app** table, and "`--row` is declared in `src/styles.css` and read by the row rule".

### M19 — 7d has no replacement assertions — 🟡
Lines 816–818, "*Exit:* `ALL PASS`, with the check count stated so a dropped check is visible." A count is a dropped-check guard, not a correctness guard; the exit passes if the checks are rewritten into tautologies as long as the count matches. §6/§7 (474–476, 555–559) say the rewrite needs class names and the replacement heading/footer strings, which exist nowhere in the doc. List the new check ids with selectors and expected strings (Drop heading, footer, key labels, `items-row-<importId>`, `items-progress-<importId>`).

### M20 — The three-language row sentences are assigned to 6a in one line and absent from 6a's body — 🟡
Line 756, "*Remaining for the row:* only the three-language sentences and the row component itself (step 6a, landing with 7b)". 6a's body (759–764) lists the row-height token, the tone, the *Appliance* glossary terms and the `kit.html` markup — **not** the sentences — though its exit names `i18n.test.ts` and `japaneseSubset.test.ts`. 7b (795–807) never mentions them either. So nine sentences × three languages are owned by nobody. Put them in one step, with the locale files named and the Taiwan-wording rule restated per string.

### M21 — 7a-remaining omits four compile-breaking `StartScreenId` / `File[]` sites — 🟡
- `src/App.tsx:137` — `const START_HINT: Record<Exclude<StartScreenId, 'file'>, string>` is an **exhaustive `Record`**, so adding `drop` is a type error until a hint string and its three translations exist.
- `File[]` is more than `files.find(isStl)`: `StartScreen` holds `const [held, setHeld] = useState<File>()` (`StartScreen.tsx:38`), passes one file through `onStart: (profile: string, file?: File)` (`:33`), and the picker reads `event.target.files?.[0]` (`:97`).
- That ripples into the session event union: `onStart` → `App.tsx:1243 startDental(profile, file?)` → `send({type:'startDental', profile, …})`, whose event type is `{ type: 'startDental'; profile: string; file?: File }` at **`src/dental/editingMode.ts:48`**.
- `DentureChoice` (`StartScreen.tsx:83`) calls `choose(DENTURE_PROFILE_ID)` and goes straight from the task keys to the **file** screen, bypassing `type` — moving "the task screen's three keys" onto Drop has to decide what the denture key does there.
(Also `App.tsx:207, 1240, 1242, 1367, 1384, 1548` read `StartScreenId`.) The doc's "three keys" **is** correct: `ChoiceKey icon="aligner"` (`:82`), `DentureChoice` (`:83`), `ChoiceKey icon="generic"` "Any model" (`:87`), plus the `link-button` "Open a saved project" (`:89`). There is exactly one component file — `src/components/StartScreen.tsx`.

### M22 — `KeptBuild` collides with an existing exported symbol — 🟡
§5 proposes a new `src/supports/keptBuild.ts` exporting type `KeptBuild`; `src/denture/steps/supports/rigidMove.ts:77` already exports `keptBuild<M>(previous, unit, built: { unit: PrintUnit; mesh: M } | undefined)`, imported at `App.tsx:105` — a generic helper over exactly the same `{ unit; mesh }` shape. Rename the new module/type, or put the type beside the existing helper. (Incidentally, that helper is the existing "does this build still describe this unit" primitive, which step 9 should reuse to invalidate a build when `source` is replaced.)

### M23 — Step 11's exit does not assert that any geometry was actually released — 🟡
Lines 849–851 name real assertions, but storing an unmodified `GeneratedSupportMesh` into `UnitBuild<KeptBuild>` is structurally legal and frees **nothing**, so every listed assertion passes on a map that still holds full meshes. No projection function is named. Add a retained-bytes or `positions.length === 0` assertion, and name the projection.

---

## Nits

- **N1 — line 637:** "`sceneOf` takes `string | null`" paraphrases loosely. `sceneMap.ts:142` — it takes an object whose `startScreen` is `string | null`. The point (no compile-time check on the literal) holds.
- **N2 — line 798:** bare `JobActivity` is ambiguous and resolves to the wrong thing: the vendored class is `@mixo-geocore/host/workers/jobActivity` (`src/workers/projectClient.ts:4`), the UI panel is `src/components/JobActivity.tsx`, imported as `JobActivityPanel` (`App.tsx:12`). Name the file.
- **N3 — line 621:** "a **flag**, not the env var" overstates. `walk.mjs:133-134` still accepts `process.env.WALK_LOCALES`, and `:2513`/`:2554` still document it. The Windows-portability point is right. (`package.json:19` and `.github/workflows/ci.yml:61,66` with `set -o pipefail` on both walk steps are VERIFIED exactly as described.)
- **N4 — line 763:** "static markup" ignores an export written for it. `rowState.ts:64-66` carries the comment "The state names, for a catalogue page that must show every one of them", and `src/kit/` does not import it. See B4.
- **N5 — line 757:** "(step 6a, landing with 7b)" — 6a is numbered before 7a, said to land with 7b, and its own text (763) argues "a step must not need the one after it". Rename it "7-pre" or "6a (prerequisite of 7b)".
- **N6 — line 826:** an orphaned `*Exit:*` under the tombstoned "**8. — moved to step 7c**", duplicating 7c's own exit (814) and sitting beneath a historical blockquote. Delete it. The step-8 tombstone plus the deleted step 10 leave two gaps in a 0–11 sequence; either renumber or note the gaps.
- **N7 — lines 822–825:** the retained revision history ("Revisions 3 and 4 said…", "Another claim adopted from a reviewer report without checking the source") contains no instruction and could be read either way. The retraction itself is **correct**: `startDental` already writes `dentalProfile: event.profile` (`editingMode.ts:219`) and `switchDentalProfile` (`:225`) is a further writer. Replace with a one-line statement of fact and move the history to a changelog.
- **N8 — `g`'s cheapest fix is not among §9's options.** `walk.mjs:882-883` claims "A queue that never formed cannot answer the question, and saying so is better than a red line" — but `:884-885` folds `pendingAtSwitch > 0` into the **assertion**, so a queue that never forms is reported as FAIL, not as a note. `note()` exists in the harness and is used elsewhere. §9 should adopt it or record why a red line is wanted.
- **N9 — step voice and format.** Steps 0–6 are written as a first-person status log rather than instructions ("my `g` fix … was unnecessary", "I bisected…", "The process lesson cost more than the bug"). Of sixteen step entries, only 7d matches the intended what/where/how/check shape; step 6 is the only one with a `*Build:*` block, and carries a `*Remaining*` under a DONE heading. Status markers are inconsistent ("— DONE.", "Done —", "THE LOOP HALF IS DONE", "IS DONE") and the project's 🟡/⛔ status lines are not used. Standardise to "**N. Title.** Status: DONE / 🟡 partial / ⛔ blocked" with four labelled parts, and move rationale and history to an appendix.
- **N10 — `data-ui` gaps.** Steps 6a (759), 7b (795), 9 (828) and 11 (846) describe UI and name almost no `data-ui` values. 7b gives only the pattern `items-progress-<importId>` (799) plus a vague "`data-ui` keyed to the import id"; 9's *Repair* button has none; 6a's `kit.html` states have none. Add a "UI names" line per step. (VERIFIED: `ProgressIndicator` (`src/progress/Progress.tsx:27-38`) emits no `data-ui` of its own — the wrapper `Progress` does at `:61` — so the name must go on the row's wrapper, as 7b says.)
- **N11 — line 817, UI copy in one language.** 7d renames *Add another aligner* to *Next item* and gives no ja or zh-Hant text; 6a covers only the *Appliance* glossary. Add the locale entries in Taiwan wording. (No third-party slicer names, no centred text, no ✅/🎉 misuse and no mainland-Chinese terms appear in 588–891.)
- **N12 — numeric and reference hygiene.** Line 603 "the exit-code mistake above" points **downward**, to step 2 (626–628). Check counts are never reconciled across "152 checks" (617), "29 checks [only a]" (598) and "21 checks" (816), though 818 demands the count be stated. Line 666–667's "Not a cautious default: there is **no rim to measure**" and the sentence-initial bold "And …" lead-ins (668, 672, 706) are rhetorical; use "Decision:", "Effect:", "Wiring:". Line 645–648's engine-bump procedure is a comma chain; make it a numbered list.

---

## Answers to the five questions

### 1. Can each unstarted step be started from the text alone?

| Step | Startable? | The guesses forced |
|---|---|---|
| **7a-remaining** | **NO** | the reservation grain, explicitly delegated (B11); the Drop page's class names, heading, footer, key labels and tooltips in three languages (B20); the `accept` format list (B20); the new `StartScreen` prop shape for `File[]` and the four sites it ripples into (M21); *Appliance* vs *Purpose* (B20); whether `onUnsupported` and the `accepted.length === 0` path survive (M15); `src/scenes/` updates (M9); and its own exit criterion (B10) |
| **7b** | **NO** | how the session enters dental mode for item 1 (B19); selection-vs-entry ordering (M8); the `JobActivity` prop and predicate (B15); which of 7a/7b lands `StartScreenId`/`StartScreen` (B12); what `release()` means for one row (B11); the streaming loop's five consequences (B14); eight vs nine sentences and who writes them (B4, M20); second drop, worker crash, removed-row race, project reload (M15, M16, M17); the row component's props and full `data-ui` set; an achievable definition of done (B13) |
| **7c** | **NO** | the full site list for `dentalStage: 'type'`, including `backToTypeScreen`, section `x` and `walkLocale` (B16); the entire behaviour of "Start screen + live dental session", including the one-file `slice` on drop (B17); where the `dentalFinished` reset actually is (M6); the `StartScreenId` member set that remains |
| **7d** | **PARTLY** | scope is nameable and every check id tested exists, but the line range is wrong for the fourth time (B1), the Add-another list is wrong (B2), and the replacement assertions and strings do not exist (M19) |
| **9** | **NO — the weakest step in the document** | worker vs main thread, task kind, protocol message, scene command, undo batch (B5); whether and how `diagnosis` is replaced, and the "repaired" field with its `normalizeUnit` gate (B6); which capacity guard, and what happens if it refuses after the repair ran (B7); where `MAX_FILL_LOOP_MM` lives — it does not exist (B3); the tier branch and old display/pick key cleanup (M13); whether `prepare()` is split or its threshold duplicated (M14); what is freed and when (B21); its module, README, tests and tooling gates (B22) |
| **11** | **NO** | the real value type of `built` and the five consumer files that break (B8); `modelLanded`'s fate and the projection function (B8, M23); the successful-export hook (M12); two missing exit fields (M11); the name collision (M22); and **whether it should ship at all**, since the step's own text recommends deferring it while the cap it depends on is owned by nobody (B9) |
| **6a** | **NEARLY — one real blocker** | both token names and values (B18); eight vs nine states (B4); whether the three-language sentences are its job (M20) |

### 2. Ordering

**Step 9's four requirements: the doc names all four, and the order is achievable.**
- display decimation re-run — line 830 ✓
- pick index rebuilt — line 830 ✓, and the cited reason is **VERIFIED**: `importWorker.ts:53` builds it from `display ?? mesh`, so decimate-before-index is both stated and necessary
- capacity re-check — line 831 ✓ (but its justification is dead and it has no refusal path — B7)
- "**Centring does not re-run**" — lines 832–834 ✓, and the reasoning is **VERIFIED CORRECT**: `prepareImport.ts:30-34` centres once in place, `placeImportedUnits` then trusts `item.centred` (`src/state/import.ts:91-100`), so a repaired mesh is already in the operator's frame

**Feasibility:** yes, with the caveat in M14 — centring is separable from decimation **only by not calling `prepare()`**, which couples them. Two follow-ups are **missing** from the list: replacing the saved `diagnosis` (B6) and re-registering the display copy in `meshExtras` / the index in `setPickIndex` (M13).

**Cross-step inversions (four real ones):**
1. 7b's exit (`ALL PASS`, line 804) depends on 7d's rewrite (line 816) — B13
2. 7b's row-removal instruction (802) depends on an API 7a was told to "decide" (791) — B11
3. step 11 depends on a row cap **no step owns** — B9
4. step 9 depends on step 5's constant, which does not exist — B3

Plus: 6a is numbered before 7a but said to land with 7b while arguing it must not depend on 7b (N5).

### 3. Exit criteria

- **Missing entirely:** 7a-remaining (B10).
- **Vacuous — cannot fail if the step is wrong:** 7a line 792 (already green, and asserts the *old* flow); step 3 line 639 ("no file asserting what another denies" is not executable); 6a line 765–766 (`uiStylingDoc.test.ts` is one-directional, and "every state visible in `kit.html`" passes with eight of nine, eyeball-only); 7d line 818 ("with the check count stated" passes on tautological rewrites); step 9 line 836 ("a refused repair leaves the unit untouched" passes if *Repair* is never wired); step 11 lines 849–851 (pass on a map still holding full meshes).
- **Unachievable as written:** 7b line 804 and 7d line 818 — literal `ALL PASS` against a known-flaky `g` and against line 607's own prohibition.
- **Incomplete:** step 9 (no module, tests, README, `tsc`, build, walk, `walk:locales` or `gate:real` — B22; silent on the verdict and on memory); step 11 (names real assertions against files it does not list; omits two `KeptBuild` fields); 7c (requires neither the walk nor `walk:locales`, both of which it breaks).
- **The model to copy — specific and genuinely falsifiable:** 7c line 814 ("a walk check that Back at Orient keeps `dentalFinished`") and step 4's literal-line criterion (649–651).

### 4. Section 9 "Still open"

**No §9 bullet is a real blocker on starting 7a-remaining** — except the *Appliance*/*Purpose* bullet (872), which **is** one, because level 1 lives on the Drop page and 7a cannot write copy for a word that is still a recommendation (B20). The one other genuine blocker on 7a is **inside 7a itself**: the reservation grain at line 791 (B11).

Bullet-by-bullet: the row-tone bullet (867–868) blocks **6a**, not 7a (B18). The host-memory row-cap bullet (863–866) blocks **7b and 11**, not 7a — and its "rather than guessing a number now" is stale, since step 5 already produced the figure (B9). The noise-shell bullet (869–871) blocks nothing; it touches only step 9's wording.

**Honesty of the `g` / `s17` record: §9 is correct on both, and the dishonesty is upstream in step 0.**
- `g` (874–880) is recorded as **flaky and not this work's**, which the code confirms: a 4× CPU-throttled stroke race by construction, with the mechanism in the check's own comment (`walk.mjs:859-886`, `const throttle = 4` at `:872`). §9 also explicitly disowns the earlier determinism claim. **Step 0 (594–599, 617) was never updated** and still presents one baseline run as the state (B24).
- `s17` (881–887) is recorded as **FIXED**, and the fix is in the tree exactly as described (`walk.mjs:2443-2466`). But **line 611 still schedules a baseline of it** and **line 609 still licenses "no new failures beside `g` and `s17`"**, which would hide a real regression (B24). Note also that §9 hosts a *resolved* item under a heading that reads "Still open".

### 5. The two specific claims

**(a) `startDentalAligner` / `useSelectedAligner` rather than `startDental` — VERIFIED TRUE by all four technical instances.**
`src/dental/editingMode.ts:217-220` — `case 'startDental'` is guarded on `state.mode === 'off'` and sets `dentalProfile`, `dentalStage: 'aligner'`, `dentalAligner: 'prompt'`, `dentalNotices: []`, `dentalProposal: undefined`, **`dentalFinished: []`** and `dentalUnitId: undefined`. `enterDental` (`:212-215`) resets the tally too. `exportedDental` (`:319-322`) and `addAnotherDental` (`:324-326`) preserve it via `finished()` (`:208`). The alternatives exist: `App.tsx:627` `startDentalAligner` routes to `denture.orient.start(unit)` or `dentalFlow.startAligner(unit)` with no session reset (used at `:789`, `:824`); `App.tsx:816-825` `useSelectedAligner` checks `acceptsDentalDrop`, refuses the heavy tier with a three-language message, and calls it.
**Two caveats the doc must absorb:** it is unusable for the *first* item, because `acceptsDentalDrop()` requires `mode === 'dental' && dentalStage === 'aligner'`, reachable from `off` only through the forbidden doors (B19); and `useSelectedAligner` reads `activeUnitId` from a render-time ref, so the obvious select-then-enter handler reads the previous unit (M8).

**(b) `UnitBuild<KeptBuild>` in step 11 — the doc's correction is CORRECT; the earlier reviewer's `UnitBuild<BuiltSupports>` claim is CONFIRMED FALSE; but the widening is still not type-safe as written.**
`vendor/mixo-geocore/host/supports/unitSupports.ts:56` — `BuiltSupports = Pick<GeneratedSupportMesh,'dropped'|'droppedByZones'>`, **no `footprint`**; `footprint` is on `GeneratedSupportMesh` (`host/core/supports/mesh.ts:168`); `src/plate/plateLayout.ts:24` reads `entry?.mesh.footprint`. So the refutation stands. `UnitBuild<T extends BuiltSupports = GeneratedSupportMesh>` (`:59-62`) accepts `KeptBuild` as §5 defines it, and `currentBuild`/`currentBuilds`/`unitContacts` (`:68, :73, :88`) and `planExport` (`host/supports/export.ts:48`) are already generic enough.
**But it will not compile against five consumers, none of them named in step 11** — `src/plate/plateLayout.ts:12` (which declares its own `{ unit; mesh: GeneratedSupportMesh }` shape and does not use `UnitBuild` at all, so the generic bound buys nothing), `src/components/usePlateArrange.ts:16`, `src/components/useFixSpot.ts:27`, `src/components/useExport.ts:26`, and `src/components/viewport/types.ts:23` (`supportMeshes` needs the full mesh, because a live unit still has to be drawn, so the map needs a union plus a discriminator rather than a uniform widening). See B8.

---

## Verified correct — do not re-raise

- Section `s`'s **check count of 21**, including `s2b` and the `u`-prefixed `u1a` inside it (`walk.mjs:2331-2486`). Only the line range is wrong.
- Line 830, "`importWorker` builds it from `display ?? mesh`" — `importWorker.ts:53`; host side `setPickIndex((display ?? mesh).positions, …)` at `importClient.ts:37`.
- Lines 832–834, centring must not re-run, and why — `prepareImport.ts:30`, `src/state/import.ts:91-100`.
- Line 831, `assertPlateCapacity` is consulted only on the import path — `vendor/.../core/budget.ts:128`, called only at `App.tsx:729` and `:746`.
- Line 847, `UnitBuild<BuiltSupports>` has no `footprint` — `unitSupports.ts:56` against `plateLayout.ts:24`.
- Line 848, `exportedDental` fires on the press, before the export — `App.tsx:1223-1232`.
- Lines 709–713 and 726–730, `diagnoseImported` runs on `item.mesh` after the weld and only the verdict crosses the boundary (`prepareImport.ts:78`, `importWorker.ts:57,65`); the four test facts (tetrahedron watertight with no rim, 12 mm rim on a 3-4-5 triangle, two bodies 50 mm apart, a non-manifold count) all match `diagnoseImported.test.ts:21-63`.
- Lines 715–724 and 740–754, `ImportDiagnosis` in `src/state/diagnosis.ts` as a true leaf (its sole import is the vendored `RepairReport`); `PrintUnit.diagnosis` (`project.ts:71`); carried by `placeImportedUnits` (`import.ts:112`); `normalizeUnit` destructures `diagnosis` out of the spread (`project.ts:320`) and `diagnosisField` drops a malformed **or stale** verdict (`:350-360`). Body-count field is `bodyCount` (`diagnosis.ts:45`).
- Lines 768–780, per-file isolation and whole-drop abort exactly as described (`App.tsx:698, 721-751, 757-761, 797-800`); walk `m1` in its own section (`walk.mjs:1016`, check at `:1035`) asserting `units 2` and the refused file's name.
- Lines 694–707, nine row states as three tested partitions, the `src/items/` placement argument, and the equality test (`rowState.ts:65, 69, 80, 91`; `rowState.test.ts:31`; `src/importOracleBoundary.test.ts:10`).
- Lines 822–825's retraction: `startDental` already writes `dentalProfile: event.profile` (`editingMode.ts:219`) and `switchDentalProfile` (`:225`) is a further writer.
- Lines 881–887, `s17`'s cause and fix (`walk.mjs:2443-2472`); lines 874–880, `g`'s flakiness (`walk.mjs:859-886`).
- Every test file 6a names exists: `src/ui/uiStylingDoc.test.ts`, `src/ui/noColourLiterals.test.ts`, `src/glossary.test.ts`, `src/ui/japaneseSubset.test.ts`, `src/i18n.test.ts`.
- Every vendored field named in 588–891 exists on `repairMesh.ts`: `take_loops()` `:142`, `fill-disabled` `:73/:188`, `RepairReport.{triangles,boundaryLoops,nonManifoldEdges,windingConsistent,watertight}` `:47-57`, `RepairBody.loopLengthsMm` `:42`, `RepairResult.{ok,reason,changed,after,steps,fills}` `:126-136`, `LoopFill.reason` `:89`, `RepairSteps.{maxFillLoopMm,loopsFilled,patchTrianglesAdded,degenerateTrianglesRemoved,verticesAdded}`, `body-invariant:<step>` `:15-16`. `repair_mesh`'s third argument is required with no engine default (`:164, :318`). (`longestRimMm` is **not** vendored — it is derived at `prepareImport.ts:84`.)
- Line 621, the locale pass command, and line 628, `set -o pipefail` on both CI walk steps — `package.json:19`, `.github/workflows/ci.yml:61,66`.
- The four items rounds 1–3 fixed are **still fixed**: step 6 precedes step 7; "THREE places" is gone; per-row Appliance/Type is carried. None is re-raised here.

## Code reuse the plan should name

1. **`ROW_STATES`** (`rowState.ts:65`) — iterate it in the catalogue, as `src/kit/Catalogue.tsx` already does with `PROGRESS_TYPES`. Kills B4 permanently.
2. **`offersRepair(row)`** (`rowState.ts:100`) already encodes "a refusal must never re-offer the press" — step 9 should name it rather than re-deciding.
3. **`verdictOfRepair(result)`** (`rowState.ts:91`) already maps a repair outcome to `refused | unchanged | repaired | repaired-open`, with `body-invariant:` stripping, tested at `rowState.test.ts:70-107`. Step 9 only has to feed it a `RepairResult` — but it must separately go through `diagnoseImported` for the persisted shape (B6).
4. **`decimateWithWasm`** (`prepareImport.ts:37`) + `meshTier` / `TRIANGLE_BUDGET` (`:2`) for the re-decimation; **`buildPickIndexData`** (`src/workers/pickIndexes.ts`) for the index; **`diagnoseImported`** (`prepareImport.ts:78`) for the fresh verdict. `prepare()` is **not** reusable — it centres (M14).
5. **`dispatch({ type: 'batch', commands: [...] })`** (`App.tsx:774`) for step 9's one-undo-step requirement.
6. **`keptBuild<M>()`** (`src/denture/steps/supports/rigidMove.ts:77`) is the existing "does this build still describe this unit" helper — step 9 should use it to invalidate a build when `source` is replaced (and step 11 should stop colliding with its name — M22).
7. **`PlateLedger.open()` / `hold|commit|release` / `settle(sceneIds)`** (`src/core/plateLedger.ts:15-25, 45-63`) — the per-file grain needs no API change at all (B11).
8. **`acceptModelFile`, `estimateTriangles`, `estimateHeadBytes`, `src/core/import/stlHeader.ts`** (used `App.tsx:692, 725`) — the Drop page must not re-sniff formats.
9. **`errorStatus('import', codedJobError(err), { name })`** (`App.tsx:760, 799`) and **`START_HINT` / `fileStepText`** (`App.tsx:137`, `src/denture/steps/start/startText.ts`) — the existing status/hint mechanisms the Drop page extends rather than invents.
10. **`ImportedMesh.diagnosis`** (`src/state/import.ts:26`) — the worker protocol **already** carries the verdict (`PreparedMesh extends ImportedMesh`, `importProtocol.ts:13`), so 7b needs no protocol change and the doc correctly does not ask for one. Step 9 **does** need `ImportTask` extended, and the doc does not say so (B5).
11. **Walk section `s`'s existing local helpers** — `onScreen`, `unitsOnPlate`, `plateHas`, `dropOnStart`, `atStep1`, `supports` (`walk.mjs:2302-2312`), plus `d.quiet()`, `d.idle()`, `d.status()`, `d.props()`, `note()` and `leaveRimIfOpen` (`:1121`). The Items page should get **one** shared entry helper, as `enterEditor` is for the editor, rather than inlining the navigation eight times.
12. **`CapacityLimit`** (`rowState.ts:40`) already maps `'triangles' | 'memory' | 'plate'` to the three guards — a row cap needs a fourth member (B9).

## Unverified — stated, not guessed

- `npm run gate:real`, `vendor:check`, the "1301 tests" count, "`real-scan gate: PASS (13 scans)`" and "`1 FAIL (152 checks)`" (617, 641–651) — read-only tools; nothing was run.
- All commit hashes (`e5c5718`, `1db2987`, `4718e21`, `f4c3500`, `b5a71ab`) — no git access from the reviewers.
- Whether walk section `m` really re-runs in "13 seconds" (778) — its own waits allow up to 180 s.
- The clinical numbers at 659–664 (0 rims, 8 of 18, 5,547 non-manifold edges, 525 bodies, 12.2 MB) — fixtures not readable; corroborated by `src/items/README.md:34-35` and `rowState.test.ts:55`, and the script computes each (`measure-rim-loops.mjs:110-142`).
- zh-Hant / ja wording quality, and whether the locale files already carry any new keys.
- Whether `glossary.test.ts` would actually demand an *Appliance* term.

## Aside — not a document finding

One reviewer found `S:/ai/mixodental/.claude/worktrees/agent-a781311f7148b36f9/` on disk, containing copies of `src/glossary.test.ts`, `src/i18n.test.ts` and `src/importOracleBoundary.test.ts`. The project rule is **NO git worktrees, ever** (a `worktree remove --force` has twice deleted real `node_modules`). Worth checking whether that is a live worktree left behind by tooling before anyone runs a cleanup command near it.
