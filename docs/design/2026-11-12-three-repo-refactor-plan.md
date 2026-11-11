# Three-repo refactor: decision record and fix list

> **DECIDED 2026-11-12: Phases 1 to 5 are gone.** This file was a phased plan; it is now a decision
> record plus seven fixes in order (section 3). Phase 0 is done and recorded in section 5.
> **The mixoMesh re-vendor (12 → 63) is not scheduled**; section 4 gives its trigger and its step zero.
> What that gives up, plainly: **mixoMesh stays 51 engine versions behind, and every geocore fix
> below reaches mixoDental only.** Section 1 lists the rest of the cost.

Decision delegated by the owner to this document's author after four EGM reviews (section 6b). No
code was changed in any repository by this file. The file keeps its name because other documents and
one test header cite it by path; the section numbers they cite (3, 5, 6, 6b) still hold the same subjects.

Sources: `S:\ai\mixodental\cia-audit-report.md`, `S:\ai\mixo-geocore\docs\cia-audit-2026-11-12.md`,
`S:\ai\mixomesh\docs\cia-audit-2026-11-12.md`, `S:\ai\mixomesh\docs\geocore-adherence-2026-11-12.md`,
`S:\ai\mixodental\docs\handoff\geocore-spatial-input.md`. Finding ids (`GEO-`, `MIXO-`, `MX-`) are
cited, not re-derived.

---

## 1. The decision, why, and what it gives up

**Why the phases go.** A phased plan earns its sequencing when later phases need earlier ones. Review
removed the need:

- The table held **two** cross-repo moves, not eight (section 6b's structural note). One of them (C1)
  needs no level ground, and the other (C2 with half of C3) waits on bench answers, not on a vendor step.
- The phase everything queued behind, Phase 4, had three contents: C1 (should never have been in it),
  C9 (must not be executed at all) and C10 (not a deletion). **Phase 4 was empty**, so Phase 2 was
  unblocking nothing, and Phase 3 was levelling two apps for work that does not exist.
- Phase 2 was estimated from signature diffs, which cannot see a new required field, and it would
  have overwritten the only tree its own before/after checks could be measured against.
- One owner, working alone. A week-shaped critical path in front of fixes that each already have a
  file, a line and a failing test is the wrong shape for that.

**What survives:** D22 as the one boundary pattern; the two defect classes (a "nothing happened"
that travels the success path; a boundary proved only against our own side), each closed by a test
at the named site and not by moving code; the rejections (section 2); and the old section 3's
ordering, which is now section 3's fix list.

**What this decision gives up.** Value lost, not work saved:

1. **mixoMesh stays on engine 12.** It does not get the 3.7× faster route (engine 46), hard tip rules
   (41), phase progress (60) or plate arrange (53). The gap is 51 today and becomes 52 the day
   engine 64 ships from this very list. Deferring makes the eventual re-vendor larger, never smaller.
2. **Every geocore fix in section 3 reaches one app.** GEO-002/003/005/006 are fixed in geocore and
   arrive in mixoDental at engine 64. mixoMesh keeps whatever engine 12's host does. Whether the
   weak decoders exist that far back was not checked (section 7); if they do, they stay.
3. **"Both apps, together, for the first time" does not happen.** No date exists on which the two
   apps run the same engine. Shared work stays theoretical for mixoMesh until section 4's trigger fires.
4. **mixoMesh keeps two live job layers and its own 1,644-line repair.** The second is not a loss
   (C9 was wrong). The first is: `JobActivity` stays a fork with nobody assigned to decide it.
5. **The spatial port has no slot.** C2 and `SpatialRecord` wait on the puck's bench answers with no
   phase to land in. They need none, but nothing will remind anyone either.
6. **A list has an order but no dates.** The phases, for all their faults, said "this week". Nothing
   in section 3 stops other work going ahead of it.
7. **Most of the audits stays untouched.** Section 3 closes six GEO findings and MIXO-13 at its
   source. The remaining findings (about 23 by an unverified tally) live in their own reports on
   their own schedule, and geocore holds roughly half of them.

**What the author changed his mind about.** (a) "Should the re-vendor come before any
centralisation? Yes." was answered to a question that assumed centralisation was coming. With one
move left that needs neither app, the re-vendor is a mixoMesh product decision, not a prerequisite.
(b) The second STL reader was filed as debt to be retired by C1. It is not debt: mixoMesh's copy
proves mixoMesh's own writer, and C1 proves geocore's. Two writers, two proofs. (c) The gap line was
Phase 5, last. It is now fix 1, because it is the only thing that makes this decision's cost visible.

---

## 2. The centralisation table, with its verdicts as decided

The test, applied to every row: count what the module must be handed against what it hands back.
Narrower out than in is a job. About the same is a hub, and moving a hub is motion. The test only
measures a **move**; rows that unify duplicates inside geocore or fix a defect in place are judged
by their invariant instead (section 6b).

### Rows inside geocore

| # | Candidate | Verdict | Closes |
|---|---|---|---|
| C1 | **The STL proof with a reader that is not the writer** (mixoDental `src/supports/exportBytes.test.ts`, testing geocore's own `encodeStl`) | **Fix 2.** Move to geocore `host/supports/exportBytes.test.ts`, reader in `scripts/test-support/`, folding in the inline byte parse already in `host/supports/export.test.ts`. No handedness parameter: mixoMesh's `tests/export-bytes.test.mjs` is not retired by this | MIXO-13 at its source |
| C2 | **`host/core/quat.ts`** (`Quat`, `multiply`, `conjugate`, `normalize`, `fromAxisAngle`, `toPlacementRotation`) | **Waits**, on the puck's three bench answers. 4 numbers in, 3 out, pure: a clean job when its time comes | spatial handoff part 1 |
| C3 | **`editing/SpatialPort.ts`** | **Split.** `SpatialRecord` goes in with C2. The three `spatial.*` command rows and the capability fact **stay in mixoDental**, through `ExtraCommandIds` + `registerCommands()`, which exist for exactly this. `commands.ts` has one consumer; "both apps" was false | spatial handoff part 2; part 3 withdrawn |
| C4 | **One code-table lookup** with an explicit `'unknown'` member, replacing the nine sites that fall back to a neighbour's meaning | **Fix 6.** Widens about nine public string unions, so it is engine 64 and needs the owner's word for `'unknown'` | GEO-005 |
| C5 | ~~One strided reader~~ | **Rewritten as fix 7:** a length check in `decodeSteps` (a per-index silent zero, not a strided loop), plus the strided walks at `repairMesh.ts:211`, `:232`, `:283` and `dentureReview.ts:291`, `:321` | GEO-006 |
| C6 | **The ABI describing itself** | **Reduced to what fix 4's test reads:** the five strides, exported from the engine. Table lengths and phase names follow only if a test needs them | GEO-004 |
| C7 | **A not-judged outcome in the export gate** | **Fix 5.** Engine 64; needs the owner's sentence for `'nothing-built'` | GEO-002, GEO-003 |
| C8 | ~~The D22 banned-import list as one module~~ | **Not taken.** Two encodings (eslint globs, test regexes), not one datum; a shared constant is a hub by this file's own test. The drift that existed is closed (geocore `45c71f9`). Section 6 | GEO-010, in the part that mattered |

### Rows where one app carries a second copy

| # | Candidate | Has it today | Verdict | Closes |
|---|---|---|---|---|
| C9 | **Mesh repair and diagnose** | mixomesh `src/core/repair/` — **1,644 lines across SIX files, measured**: `MeshRepair.js` 656, `GroupRepair.js` 346, `RepairSession.js` 342, `Weld.js` 153, `CapLoops.js` 95, `Diagnose.js` 52, plus the MeshFixLib WASM; geocore `host/core/repairMesh.ts` since engine 62/63 | **⚠ DO NOT EXECUTE THIS ROW. Its verdict was wrong and the error loses user data.** It read "Delete from mixomesh, do not move. Clean job: positions + indices + one limit in, mesh + report out." The line count is exact; **the job description is false.** geocore's `repairMesh` returns `positions: Float32Array; indices: Uint32Array` and **nothing else — no UVs, no uv2, no colour**. `MeshRepair.js:161-170` exists for exactly that reason, and says so: *"Every OTHER per-vertex attribute the mesh carries must end up at the new vertex count too. Real scans carry normals, often tangents and a second UV set… the old write-back left `normal` at the OLD length and Babylon threw 'Invalid typed array length' on the first createNormals / render (12 real scans, 2026-09-18)."* **So this deletion would re-pay a bill mixoMesh already paid once, on the same twelve scans.** Also app-only with no geocore counterpart: `REPAIR_TRIANGLE_CAP` 300k, `REPAIR_TIMEOUT_MS` 60s, the fresh-WASM-instance-per-run workaround for engine state carry-over, the `'no engine:'` unavailability class callers branch on, `repairGroup`/`toLeadMatrix` over multiple parts (which `npm run test:group` exercises today), and `replayGeometryFixes`/history recording. **The real gate is not the 12-scan comparison — it is "geocore can return UVs", which is an engine ask nobody has written.** And that comparison cannot be configured today: `maxFillLoopMm` has no default by design, and the twelve scans are named in no repo, with no path, manifest or harness. The cheap first step nobody proposed: port mixoDental's `scripts/real-scan-gate.mjs`, which already has the right shape including `--allow-no-scans` reporting NOT RUN rather than PASS | nothing, until the engine ask exists |
| C10 | **Worker job runner and activity list** | mixoMesh `src/core/workers/{WorkerTask,serveTask,JobActivity}.js` (216 / 47 / 193 lines) beside the vendored `host/workers/` (330 / 64 / 239). Both run: the app's serve its own workers, `src/support-engine/` uses the vendored ones | **Not a deletion, and not scheduled.** `serveTask` is effectively identical; the app's `WorkerTask` is a behavioural subset of the port; **`JobActivity` is a genuine fork** (signal-scoped steps and `blockingJob()` against `fractionOf` and lingering failures). Decide it at the re-vendor, when the vendored half changes anyway | the adherence report's "no app code re-implements a `host/` module", which was wrong |

### Rows that stay per-app, and why

| # | Candidate | Why it does NOT move into geocore |
|---|---|---|
| S1 | **The start gate** (mixoMesh `engineGate` + `detectEngine` + `gpuGate`; mixoDental `hasWebGL2` + `Stopped`) | **Hub.** A shared gate would be handed the probed facts, the app's policy and the app's words, and hand back those same words. The policies differ: mixoMesh blocks gecko for its storage tiers; mixoDental's floor includes Firefox 114. The probes are DOM, UA and `window.electronAPI`, which D22 excludes |
| S2 | **Error boundaries** (`PanelErrorBoundary`, `PanelBoundary`, `AppBoundary`, `rescue.ts`) | React. Invariant I9 and `tests/d22.test.ts` ban it from `host/` and `editing/`; centralising would weaken a guard to move forty lines |
| S3 | **A shared `Outcome` / tri-state result type** | It buys zero behaviour change: geocore already ships the vocabulary in `editing/errors.ts`, and the class is closed by a test at each site. (The original reason, "a type is in = out", was wrong: a type is handed nothing, and that reasoning would disqualify `Placement` and `PointerRecord` too) |
| S4 | **The independent-consumer harness** (`tests/consumers.mjs` + `consumers.py`) | It drives mixoMesh's own pipeline in headless Chrome for five formats mixoDental does not write, with a hard-coded Windows PrusaSlicer path. What transfers is the habit of giving it a caller |
| S5 | **A shared "guard kit"** for source-reading guards | No asset to ship it in. (The original reason was wrong: the kit's real job would be the **staleness report**, allowances that matched nothing, which is the defect class of mixoDental's i18n guard and mixoMesh's MX-07. Each repo has now fixed its own) |
| S6 | Electron main process, `select-bluetooth-device`, `localStorage` keys, BLE transport and codec, everything drawn | App or device concerns. D22 draws the line for the renderer; the spatial handoff draws the same line for the device |

Also not taken across, unchanged: mixoDental does not take `engineGate` / `detectEngine` (it has no
wholly unsupported engine); mixoMesh does not take `rescue.ts` (it has autosave).

---

## 3. The fix list, in order

Seven fixes. Each is independent of the ones after it; the order is "make the gap visible, then
prove the release before adding to it". Each line is *change → invariant → the test that fails
without it*. GEO-001, which used to head this section, is done (geocore `92b9b74`).

**And GEO-001 was over-billed, which is worth recording because it was relayed to the owner as the
most urgent thing in the family.** The audit graded it P0, "stop the line". Checked afterwards:
**geocore has never cut a release through that assembler.** It requires `--tag v<N>`
(`assemble-release.mjs:23`, `/^v[1-9]\d*$/`) and **no `v<N>` tag has ever existed** — three
`milestone-*` tags, locally and on origin. Both apps' `SOURCE.json` carry `tag: null` and a bare
commit, so each vendored from a local checkout every time and the `--release` path has never run
either. GEO-001 is still right to have — a first release must not ship the two halves at different
versions — but it is cheap insurance on a door nobody has walked through, not a live hazard. What
actually protects the apps today is each app's own `vendor:check` and the engine's runtime refusal
when `engine_version()` and `HOST_GEOMETRY_VERSION` disagree.

1. **The gap line, in both apps.** The local gate reads `engineVersion` from the vendored
   `SOURCE.json` (mixoMesh: `public/vendor/`, not the stale `dist/` copy) and compares it with
   `HOST_GEOMETRY_VERSION` at the sibling geocore's **committed** `HEAD` (`git show`, never the
   working tree, so unfinished engine work cannot cry wolf). It prints `engine 12, geocore 63, behind
   by 51`, or `not compared` when no sibling exists. Print only, no threshold. → *The gap is a
   number on every gate run.* → A unit test over the pure compare: equal, behind, no sibling. Review
   said "compare against the newest released tag"; **no `v<N>` tag exists** (three `milestone-*`
   tags only, checked locally and on origin), so the committed head is the stand-in until the first
   release tag, and then the tag replaces it.
2. **C1: geocore owns the proof of its own STL writer.** As the C1 row. → *geocore's writer is proved
   by a reader that shares no code with it, in geocore's own `npm test`.* → The reflected-export
   negative control, which moves with the file. mixoDental deletes its copy at its next vendor step.
3. **GEO-009.** One vitest test asserting `nodeEngine.engine_version() === HOST_GEOMETRY_VERSION`,
   then delete the literal `63` at `geometry-wasm-smoke.mjs:16` and `dentureIslands.test.ts:100`.
   **Keep** `crates/geometry-core/src/lib.rs:27` (the only Rust-side assertion) and `:18` (the value
   itself). → *The tests are evidence about HEAD.* → Touch a `.rs` file without rebuilding; `npm test`
   must fail. The mechanism was never named and mtime cannot be it (git records none). Recommended:
   the build writes a content hash of `crates/` beside `pkg-node`, and the test recomputes it.
4. **GEO-004.** One test through the real `pkg-node` into `host/core/repairMesh.ts`, the five strides
   read from the engine (the reduced C6). → *I4: the decoder reads the layout the encoder writes.* →
   Change one TypeScript stride constant; the test goes red. Today nothing does.
5. **GEO-002 + GEO-003, one commit (C7).** Fixing 002 alone removes the accident holding 003 shut.
   → *I6 and I7: an unjudged model is never `clear`; a fresh result is never `stale`.* → The audit's
   probe, promoted: the knot fixture with zero contacts must not report islands `ok`, and its refusal
   must not be `stale`.
6. **GEO-005 (C4).** → *An engine code the host does not know is reported as unknown, never as a
   neighbour's meaning.* → Each decoder fed a code one past its table returns `'unknown'`. Add to
   AGENTS.md rule 2: a new value in an existing code table bumps the version. The guard scopes all of
   `host/` by what a line does (indexes a code table), not the nine sites the audit happened to list.
7. **GEO-006 (the rewritten C5).** → *A short or mis-strided array is an error, not zeros.* →
   `decodeSteps` handed an array one short must throw; `loopsLeftOpen: 0` from a short array is the
   case to pin. Same for the five strided walks named in the C5 row.

Fixes 5 and 6 change what the host tells an app, so they ship as **engine 64**, not as silent edits
under 63, and each carries a sentence a user reads. Those are the owner's. Recommended placeholders,
so the question is not half a question: `'unknown'`: "The engine reported something this version
does not recognise." `'nothing-built'`: "Nothing was built to check. Generate supports first."
mixoDental then vendors 64 as an ordinary vendor step, not a phase.

---

## 4. The re-vendor of mixoMesh: not scheduled

**The trigger.** Do it when the first of these is true: mixoMesh gets a ship date; mixoMesh needs a
named engine feature it cannot have at 12 (the faster route, hard tip rules, phase progress, plate
arrange); or a geocore defect is found on a path mixoMesh's users actually reach. Until then the
gap line (fix 1) is what exists, and it is the whole of the "stay level" mechanism.

**When it fires, in this order.** These are the review's corrections to the dropped Phase 2, kept
because they are the part that would otherwise be relearned:

- **Step zero: capture and commit the engine-12 baseline** (tip sets and support output on the
  smoke fixtures) before touching `vendor/`. Every before/after check needs it.
- **Estimate with the type-checker and the smokes, not signature diffs.** `UiState` gained 27
  required fields; mixoMesh escapes only because it never imports `commands.ts`. That is luck.
- **`scatterAngle` 50 → 45:** saved records carry full settings, so existing projects do not change;
  new records and preset re-applies do, and pinning 50 flips `preset` to CUSTOM. Decide knowing that.
- **`minFromUpDeg` → `overhangAngleDeg`:** the four `minFromUpDeg: 0` sites become **180**, not 0.
- **Old `.mixo` saves:** the load path is `SupportsPersist.js:36-44`; `isSupportsRecord` does not
  enumerate keys, so an old save hands the engine two undefineds as required numbers. Default-fill
  `neckMaxShift` and `minClearance` there.
- `src/core/repair/` stays untouched (C9). Decide `JobActivity` (C10) in the same series.

---

## 5. Phase 0, done 2026-11-12

A record, not instructions. Item numbers are the ones other files cite.

**mixoMesh took from mixoDental (all five):** 5.1 a GPU probe before boot (`gpuGate`); 5.2 one
full-screen surface for every boot failure (MX-13); 5.3 the reader-that-is-not-the-writer test,
`tests/export-bytes.test.mjs` (MX-06c), whose header calls itself debt against this file's section
6 and is now wrong about that (section 6); 5.4 the "nothing built" path named in the export warning
(MX-08); 5.5 the smoke allowlist scoped by what the line is, reporting what matched (MX-07).

**mixoDental took from mixoMesh (all four):** a `PanelBoundary` per region, rendering a named
sentence and never `null`; a pre-React boot banner in `index.html`; `npm run gate` with a receipt
(MIXO-05); the print-angle confirm able to say no (MIXO-02). Gate PASS, full walk 185/186.

**geocore:** GEO-001 as `scripts/release-versions.mjs`, comparing three statements of the version
(tag, engine, host); `navigator` banned in both halves of the D22 guard pair.

**Outside this file's scope and also done:** mixoMesh's three HIGH findings, MX-01, MX-02, MX-03.

---

## 6. Debt deliberately not taken

| Debt | Why not | What would change the answer |
|---|---|---|
| **mixoMesh at engine 12, 51 behind** | Section 1 and section 4 | Section 4's trigger |
| An STL reader in each app's tests and one in geocore's | **Not debt.** Each proves a different writer and each is written from the format alone. The header of mixoMesh's `tests/export-bytes.test.mjs` still says it is retired by C1; correct that comment the next time the file is touched | A second writer of the same bytes appears |
| No shared start gate or boundary (S1, S2) | Hub, and React is banned from geocore by its own guard | A third app arrives with the same policy as one of the two |
| C9: mixoMesh keeps `src/core/repair/` and MeshFixLib | geocore's `repairMesh` returns positions and indices only | An engine ask "repair carries every per-vertex attribute" is written and delivered, and a real-scan gate exists in mixoMesh to compare with. Neither exists; nobody is asked to write them |
| C10: two job layers in mixoMesh | `JobActivity` is a real fork; any decision made against a vendored tree 51 versions old is made twice | The re-vendor |
| C8 / GEO-010: two D22 lists | Two encodings; the known drift is closed | They disagree again; then delete one list, do not add a module |
| The rest of C6: table lengths and phase names derived (GEO-015) | Fix 4 needs only the strides | A test needs them |
| GEO-007: the Blender parity dumps have no reader | Needs the owner's ruling: is Resin UV parity a promise or a goal? | The owner calls it a promise |
| GEO-008, GEO-011 to GEO-014, GEO-016, MIXO-06, and every other open finding | Real, each already specified in its audit, none reaching an app as wrong geometry | Any is found on a path a user reaches |
| C2 and `SpatialRecord` | The handoff's own word is "nothing yet" | The bench answers are written in `mixospatial/docs/decisions/` |
| A cross-repo CI job | Three repos, one owner, CI on tags only. Fix 1 is the cheap version | A second contributor |

---

## 6b. What four reviews changed, 2026-11-12

The reviews are not in this file; their findings that change a decision are. Ordered by how much.

| Row / section | What review found | Verdict now |
|---|---|---|
| **C9** | The deletion would lose per-vertex UVs, uv2 and colour on every repaired scan — see the row | **Do not execute.** Blocked on an engine ask that does not exist |
| **C3** | mixoMesh imports 17 `editing/` modules and **not `commands.ts`**, so "both apps" was false and nothing planned makes it true. `UiState` is 27 required fields, not one. The field is `disabledReason`, not "enabled-reason". `ExtraCommandIds` + `registerCommands()` already do this without touching core | **Split.** `SpatialRecord` and C2 go in; the three command rows and the capability fact stay in mixoDental. `docs/handoff/geocore-spatial-input.md` §3 is withdrawn |
| **C1** | Verified clean — three imports, nothing that parses. But it is gated behind Phase 4, which makes section 5 tell mixoMesh to write a copy now and delete it later: **creating duplication to defer a de-duplication.** It would also be the THIRD reader (geocore's own `host/supports/export.test.ts` already parses bytes inline), and retiring mixoMesh's needs a handedness parameter the moved file lacks | **Do it first, not in Phase 4.** Fold in geocore's inline parse while moving |
| **C5** | The three cited lines are wrong (really `:211`, `:232`, `:283`) and **a strided reader cannot fix the case item 6 says to pin**: `decodeSteps` is not a strided loop, it is a per-index silent zero. Under-scoped too — `dentureReview.ts:291,321` walk a stride-7 array by another idiom | **Rewrite.** A length check in `decodeSteps` is the actual fix |
| **C4** | The census is honest — exactly nine sites fall back to a neighbour's meaning. But `'unknown'` widens roughly nine public string unions, which the row prices at "2 in → 1 out", and nobody has written the word a user sees | **Keep, re-price.** Two undeclared owner decisions ride in engine 64: the sentences for `'unknown'` and for C7's `'nothing-built'` |
| **C8** | Not one datum in two places but **two encodings** — eslint takes globs, the test takes regexes. "0 in → 1 list out" is a constant, which is a hub by this plan's own test | **Delete one list, do not add a module.** The `navigator` half of the drift is closed (geocore `45c71f9`) |
| **C10** | Diffed. Three different answers: `serveTask` is effectively identical (a straight switch), `WorkerTask`'s vendored header says it IS a port of the app's file and the app's 216 lines are a behavioural subset, and **`JobActivity` is a genuine divergent fork** — the app has signal-scoped steps and `blockingJob()` for the overlay, the vendored one has `fractionOf` and lingering failures. Not free even for the easy two: the label type changes from `string` to `JobLabel` at every `run()` site, and two mixoMesh renderers read methods the vendored registry lacks | **Not a deletion.** One test that the two serve-protocols accept each other's messages, then decide `JobActivity` |
| **Phase 2** | **It destroys its own verification baseline.** Every before/after check needs a measurement at engine 12, and the first step replaces the vendored tree wholesale. Also: decision 1's premise is wrong (`scatterAngle` is a preset key; saved records carry full settings, so existing projects do NOT silently change — new records and preset re-applies do, and pinning 50 flips `preset` to CUSTOM); decision 2 never names the four `minFromUpDeg: 0` sites, which become **180**, not 0; decision 3 names the test file, not the load path (`SupportsPersist.js:36-44`), and `isSupportsRecord` does not enumerate keys, so an old save is restored with two undefineds flowing into the engine as required numbers | **Capture and commit the engine-12 baseline first.** The three decisions need re-stating |
| **Phase 5** | Comparing a release against a sibling **working tree** cries wolf whenever geocore has unreleased work — and a number that cries wolf is how a gap reaches 51 | **Compare against the newest released tag.** Promote to day one, print only, no threshold |
| **S3, S5** | Both rejections are right in conclusion and wrong in reason. A type is handed nothing, so "in = out" does not measure it — applied consistently it would disqualify `SpatialRecord`, `Placement`, `PointerRecord` and `StatusMessage`, which geocore already ships. And S5's real job is not the scope list but the **missing staleness report** — three fields in, violations and allowances-that-matched-nothing out, and the second output IS the defect class, the same bug as mixoDental's i18n guard and mixoMesh's MX-07 allowlist | Keep both out, for better reasons: S3 buys zero behaviour change (geocore already ships the vocabulary in `editing/errors.ts`); S5 has no asset to ship in |
| **Section 3 item 2** | `lib.rs:27` is mis-cited — it is a `test-abi` feature gate. The real literal is in `crates/geometry-core/src/lib.rs:27`, and **line 18 is a fourth site the plan never counts**: the number `engine_version()` returns, which cannot be deleted. Deleting `:27` as instructed removes the only Rust-side assertion. The staleness guard has **no mechanism** — mtime is wrong, because git records none | Re-state before executing |

**One structural note worth keeping.** The table mixes three operations under one test: move a file
(C1, C2), unify duplicates inside geocore (C4–C6, C8), and fix a defect in place (C7, whose Home
column reads "stays in `host/`"). The "In → out" column only means anything for the first kind, so
the true count of cross-repo moves is **two**, not eight.

**And the honest reading of all four together:** this document's value is its rejections and section
3's ordering. The phases are a week-shaped critical path in front of six fixes that each already
carry a file, a line, an invariant and a failing test in the audits — and in front of mixoMesh's
three HIGH findings, one of which destroys the user's unsaved work and appears nowhere here.

**Since those reviews:** mixoMesh's three HIGH findings are fixed (section 5). The rows above for
Phase 2 and Phase 5 describe text this file no longer contains; their corrections are carried in
section 4 and in fix 1. Where a row's "verdict now" and section 2 differ, section 2 is the decision.

## 7. Not checked

- **Nothing was run** for this decision: no test, typecheck, build or probe in any repository.
  Looked at directly on 2026-11-12: the three repos' logs, both apps' `SOURCE.json` (63 and 12),
  geocore's tags (no `v<N>`), `HOST_GEOMETRY_VERSION` (63), and that `tests/export-bytes.test.mjs`
  exists in mixoMesh. Everything else is the audits' or the reviews', taken as given.
- **The "about 29 of 46 findings still open" tally** is unverified and so is section 1's "about 23".
  The decision does not turn on it.
- Whether engine 12's host contains any of the weak decoders (GEO-005/006) that mixoMesh would
  therefore keep. `repairMesh.ts` arrived at 62/63, so GEO-004 cannot bite there; the code tables were not checked.
- Which geocore ref each app's `scripts/vendor-geometry.mjs` takes. Fix 1 assumes "the sibling's
  committed HEAD"; if the script takes something else, compare against that.
- Fix 3's content-hash mechanism is a recommendation, not something tried.
- The reviews' line references (`repairMesh.ts:211/232/283`, `dentureReview.ts:291/321`,
  `SupportsPersist.js:36-44`, `lib.rs:18/27`) were not re-resolved.
- Whether mixoDental's `exportBytes.test.ts` asserts anything mixoDental-specific that must stay behind when C1 moves it.
- C10's diff was the reviewer's; which engine version of the vendored files it was taken against is not recorded.
- Other files that cite this one as "the plan" (`docs/HANDOFF.md:29`, the mixoMesh test header) were not edited.
