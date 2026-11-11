# Three-repo refactor plan: mixo-geocore, mixodental, mixomesh

**UNAPPROVED.** A plan only: no code was changed in any repository and nothing was committed.
Written 2026-11-12 from the three `/cia` reports of 2026-11-11 and 2026-11-12, the engine-gap
measurement and the spatial-input handoff. Finding ids (`GEO-`, `MIXO-`, `MX-`) are cited, not
re-derived; the evidence is in those reports.

Sources: `S:\ai\mixodental\cia-audit-report.md`, `S:\ai\mixo-geocore\docs\cia-audit-2026-11-12.md`,
`S:\ai\mixomesh\docs\cia-audit-2026-11-12.md`, `S:\ai\mixomesh\docs\geocore-adherence-2026-11-12.md`,
`S:\ai\mixodental\docs\handoff\geocore-spatial-input.md`.

---

## 1. The verdict in five lines

1. **What they share is already the right shape.** D22 (`editing/ViewportPort.ts`) draws the line:
   geocore owns what an action *means* in plain data, each app owns the renderer and the device.
   This plan adds no second pattern; every row below is judged against that one.
2. **What is wrong is not duplication, it is two defect classes present in all three repos:** a
   "nothing happened" outcome that travels the same path as a success (MX-08, MIXO-02, GEO-002/003),
   and a boundary proved only against our own side (GEO-004, GEO-007, MX-06, and MIXO-13 until last
   night). Neither is fixed by moving code; both are fixed by a test at the named site.
3. **Very little should move into geocore**: one test that is in the wrong repo, one quaternion,
   one port. Most candidates fail the owner's test (output no narrower than input) and stay put.
4. **The 51-version gap is the real constraint.** Nothing centralised reaches mixomesh until it
   re-vendors, so the re-vendor comes before any centralisation, and runs beside geocore's own fixes
   rather than after them.
5. **Do first: GEO-001.** One comparison in `scripts/assemble-release.mjs`. Every later phase ships
   through that script, and today it can publish an engine and a host that refuse each other.

---

## 2. The centralisation table

The test, applied to every row: count what the module must be handed against what it hands back.
Narrower out than in is a job. About the same is a hub, and moving a hub is motion.

### Rows that go into, or are unified inside, geocore

| # | Candidate | Has it today | Home | In → out | Closes |
|---|---|---|---|---|---|
| C1 | **The STL proof with a reader that is not the writer** (`src/supports/exportBytes.test.ts`: own binary-STL reader, signed volume, directed-edge winding, reflected-export negative control) | mixodental, testing geocore's own `encodeStl` | geocore `host/supports/exportBytes.test.ts`; the reader in `scripts/test-support/` so it is never shipped as product code | 0 app fields in; a whole file reduced to 5 numbers | MIXO-13 at its source; lifts the engine's writer above class (b); the first consumer-independent proof geocore owns |
| C2 | **`host/core/quat.ts`** (`Quat`, `multiply`, `conjugate`, `normalize`, `fromAxisAngle`, `toPlacementRotation`) | nobody: `vec3.ts` is `Vector` only | `host/core/` | 4 numbers in → 3 out, pure | spatial handoff part 1 |
| C3 | **`editing/SpatialPort.ts`** (`SpatialRecord`) + `spatial.connect / rezero / disconnect` rows in `COMMAND_IDS` + one capability fact on `UiState` | nobody | `editing/` | a 4-field record + `UiState` in → label, hint, role, enabled-reason out | spatial handoff parts 2 and 3; capability as an enabled-reason, the only form of capability gating that belongs in geocore |
| C4 | **One code-table lookup**, `codeOf(table, code)` falling back to an explicit `'unknown'` member | restated at 18 sites in `host/`, nine of them wrong | `host/core/`, replacing the 18 | 2 in → 1 out | GEO-005; GEO-015's dropped phase is the same shape |
| C5 | **One strided reader**, `records(values, stride)` that throws on a remainder or a short array | three loops in `host/core/repairMesh.ts` (`:207`, `:239`, `:275`) and `unpackFootprint` | `host/core/`, replacing them | 2 in → records, or a `RangeError` | GEO-006 |
| C6 | **The ABI describing itself**: strides, table lengths and phase names exported from Rust and compared in one vitest file | restated: 5 stride pairs, 9 tables, 2 phase lists, the number 63 in 5 places | `crates/geometry-wasm` → one test in `host/` | 0 in → one list out | GEO-004, GEO-015, and the *derive, never restate* half of GEO-001 |
| C7 | **A not-judged outcome in the export gate**: `revision` on the empty mesh, `inconclusive` instead of `clear`/`ok`, a `'nothing-built'` refusal | `host/supports/exportGate.ts`, `generateSupports.ts:226-231` | stays in `host/`, fixed there | result + request in → 1 reason out | GEO-002, GEO-003 |
| C8 | **The D22 banned-import list as one module** read by both `eslint.config.js` and `tests/d22.test.ts` | two hand lists that already disagree | geocore, one plain module | 0 in → 1 list out | GEO-010 |

### Rows where geocore already has the job and one app carries a second copy

| # | Candidate | Has it today | Verdict | Closes |
|---|---|---|---|---|
| C9 | **Mesh repair and diagnose** | mixomesh `src/core/repair/` (1,644 lines + the MeshFixLib WASM); geocore `host/core/repairMesh.ts` since engine 62/63 | **Delete from mixomesh, do not move.** Clean job: positions + indices + one limit in, mesh + report out. Gated on C4-C6 (the repair decoder is exactly where GEO-004/005/006 live) and on the 12-scan comparison the adherence report says was never run | the adherence report's "real drift"; *guess:* MX-01, if `diagnose_mesh` welds by position, which I did not read |
| C10 | **Worker job runner and activity list** | mixomesh `src/core/workers/{WorkerTask,serveTask,JobActivity}.js` — **216 / 47 / 193 lines** — beside the vendored `host/workers/{WorkerTask,serveTask,jobActivity}.ts` at **330 / 64 / 239** | **MEASURED 2026-11-12 and real: two live job layers in one app.** The app's own three serve its own workers (Boolean, MeshImport, StlEncode, MeshValidate…) while `src/support-engine/` imports the vendored `serveTask`, `geometryClient` and `meshWorker` for the support engine. So this is not a dead copy — both run. **This corrects the adherence report's "no app code re-implements a `host/` module", which was wrong.** Still not diffed line by line, so whether the app's 216 lines are a subset of the host's 330 or a divergence is open; that diff is the next step, not a deletion | the adherence report's own blind spot |

### Rows that stay per-app, and why

| # | Candidate | Why it should NOT move into geocore |
|---|---|---|
| S1 | **The start gate** (mixomesh `engineGate` + `detectEngine`, `capabilities.js:84-111`; mixodental `hasWebGL2` + `Stopped`, `src/main.tsx`) | **Hub.** A shared gate would be handed the probed facts, the app's policy and the app's words, and hand back those same words. The policies genuinely differ: mixomesh blocks gecko because of its storage tiers; mixodental's declared floor *includes* Firefox 114. The probes are DOM, UA and `window.electronAPI`, which D22 already excludes. Each app takes the other's half directly (section 5) |
| S2 | **Error boundaries** (`PanelErrorBoundary`, `AppBoundary`, `rescue.ts`) | React. Invariant I9 and `tests/d22.test.ts` ban it from `host/` and `editing/`; centralising would mean weakening a guard to move forty lines. `rescue.ts` also exists only because mixodental has no autosave; mixomesh does |
| S3 | **A shared `Outcome` / tri-state result type** for the mirror-operation class | **Hub of the purest kind:** a type with no behaviour, in = out. The class is closed by a test at each site (section 3 item 4, section 5), not by a wrapper three codebases must then agree to wear |
| S4 | **The independent-consumer harness** (`tests/consumers.mjs` + `consumers.py`) | It drives mixomesh's own pipeline in headless Chrome for five formats mixodental does not write, with a hard-coded Windows PrusaSlicer path. What transfers is the habit of giving it a caller, not the file |
| S5 | **A shared "guard kit"** for source-reading guards | A guard's whole content is its scope, and the scope is that repository's tree. The rule is shared (section 3 item 7); the code cannot be |
| S6 | Electron main process, `select-bluetooth-device`, `localStorage` keys, BLE transport and codec, everything drawn | App or device concerns. D22 draws the line for the renderer and the spatial handoff draws the same line for the device |

---

## 3. What geocore must fix in itself first

Both apps inherit all of this, and nothing in C1-C8 is worth having on top of a release that cannot
prove its two halves match. In order; each line is *change → invariant → the test that fails without it*.

1. **GEO-001 (P0).** `scripts/assemble-release.mjs` imports `HOST_GEOMETRY_VERSION` and throws when
   it differs from `engine_version()`. → *A release cannot ship host and engine at different ABI
   versions.* → A unit test feeds the assembler a mismatched pair and expects the throw.
2. **GEO-009.** One vitest test asserting `nodeEngine.engine_version() === HOST_GEOMETRY_VERSION`,
   and `npm test` refusing a `pkg-node` older than any `.rs` under `crates/`. → *The 785 tests are
   evidence about HEAD.* → Touch a `.rs` file without rebuilding; `npm test` must fail, not pass.
   Then delete the three literal `63`s (`lib.rs:27`, `geometry-wasm-smoke.mjs:16`,
   `dentureIslands.test.ts:100`) in favour of that one comparison. Deleting beats adding here.
3. **GEO-004 with C6.** One test through the real `pkg-node` into `host/core/repairMesh.ts`, the
   five strides read from the engine. → *I4: the decoder reads the layout the encoder writes.* →
   Change one TypeScript stride constant; the test goes red. Today nothing does.
4. **GEO-002 + GEO-003, one commit (C7).** The audit is explicit that fixing 002 alone removes the
   accident holding 003 shut. → *I6 and I7: an unjudged model is never `clear`; a fresh result is
   never `stale`.* → The audit's own probe, promoted: the knot fixture with zero contacts must not
   report islands `ok`, and its refusal must not be `stale`.
5. **GEO-005 (C4).** → *An engine code the host does not know is reported as unknown, never as a
   neighbour's meaning.* → Each decoder fed a code one past its table returns `'unknown'`. Add the
   sentence to AGENTS.md rule 2: a new value in an existing code table bumps the version.
6. **GEO-006 (C5).** → *A mis-strided array is an error, not zeros.* → Each decoder handed an array
   one short and one long must throw. `loopsLeftOpen: 0` from a short array is the case to pin.
7. **GEO-015 and GEO-010, as one guard-scope rule.** The mixodental i18n guard was wrong five times
   for one reason, in its own words: its scope was "a list of the places UI text had been FOUND,
   never of the places it could BE". Apply that here: the phase list is derived (C6), the D22 list
   has one source (C8), and the new GEO-005/006 guards scope **all of `host/`** by what a line does
   (indexes a code table, walks a `take_*` array), not the nine and four sites the audit happened to
   list. **Checked 2026-11-12, and the guess was wrong in its premise and right in its conclusion.**
   `tests/d22.test.ts` *does* scan globals, not only imports: `it('uses neither document nor window')`
   strips comments and string literals and then scans every line of `host/` and `editing/`, and it
   passes (exit 0). The three files that "mention" globals mention them only in prose —
   `budget.ts:113,117` describe `navigator.deviceMemory` while taking the value as a parameter,
   `generateRules.ts:105` uses the English word "window", and `loadGeometry.js:16` is a comment
   saying it *cannot* read `document.baseURI`, which is the rule being honoured rather than broken.
   **But the guard covers `document` and `window` and NOT `navigator`** — so
   `navigator.bluetooth` in `editing/` would indeed pass it today. Add `navigator` to that pattern
   before C3, which is three characters and closes the one hole C3 could have walked through.

Items 4 and 5 change what the host tells an app, so they ship as **engine 64**, not as silent
edits under 63. GEO-007, GEO-008, GEO-011 to GEO-014 and GEO-016 are not part of this plan (section 6).

---

## 4. The sequencing, facing the 51-version gap

### Should mixomesh's re-vendor come before any centralisation? Yes.

- **For.** It is the only door anything shared reaches mixomesh through. Its cost is fixed at about
  a day whenever it is paid (5 `overhangAngleDeg` sites, the `neckMaxShift`/`minClearance`
  default-fill, the `scatterAngle` decision) and no geocore fix in section 3 makes it cheaper.
  Engine 63 at `b5a71ab` is the build mixodental has run its gate, 13 real scans and a 186-check
  walk against; it is the best-proved target available.
- **Against, and why it loses.** Vendoring 63 "inherits known-weak decoders". But GEO-004/005/006
  bite in `repairMesh.ts`, which mixomesh will not call until C9, and C9 is gated on those fixes
  anyway. The other cost is running the ~10 support smokes twice (once at 63, once at 64). That is
  cheaper than one diff that mixes 51 versions of drift with behaviour changes, where a moved
  support could not be attributed to either.
- **So:** re-vendor to **63 now, in parallel with section 3**, then take 64 as a small second step.
  It does not wait for geocore, and geocore does not wait for it. Only GEO-001 goes ahead of it,
  and only because it is ten minutes.

### The phases

| Phase | What | Who benefits, when | Depends on |
|---|---|---|---|
| **0. Today, three repos in parallel** | geocore: GEO-001. Both apps: the cross-takes in section 5 | geocore: immediately. Each app: the same day, with no vendor step | nothing |
| **1. geocore proves itself → engine 64** | section 3 items 2-7 | mixodental on its next vendor (hours). **mixomesh: nothing yet**, said plainly | Phase 0's GEO-001 |
| **2. mixomesh re-vendors 12 → 63** — *the phase that unblocks the rest* | the adherence report's sequence, as its own reviewable commit series; `src/core/repair/` untouched | mixomesh: a 3.7× faster route (engine 46), hard tip rules (41), phase progress (60), plate arrange available (53). Nobody else, directly | nothing in Phase 1; runs beside it |
| **3. Level at 64** | both apps vendor 64 | both, together, for the first time | 1 and 2 |
| **4. Centralise on level ground** | C1 first (it is a file move); C9's 12-scan comparison, then the deletion; C10 measured; C2 and C3 only when the puck's three bench answers are in, as the handoff itself says | both apps at once, which is the point of doing 2 before 4 | 3 |
| **5. Stay level** | each app's local gate compares its `SOURCE.json` `engineVersion` with a sibling `../mixo-geocore/host/geometryVersion.js` when one exists, and prints `behind by N`; when no sibling exists it prints `not compared`, never silence (MIXO-07's lesson) | the owner, as a number instead of a surprise | 3 |

Phase 2 needs three owner decisions. My recommendation for each, since a question without one is
half a question:

- **`scatterAngle` 50 → 45:** pin 50 in mixomesh explicitly at the re-vendor. A silent output change
  on existing projects is the very class this plan exists to remove; move to 45 later, on purpose,
  with a line in the release notes.
- **`minFromUpDeg: 10` → `overhangAngleDeg: 170`:** accept the inversion as the same physical rule,
  and pin it with one test asserting an identical tip set before and after on a fixture.
- **Old `.mixo` saves:** default-fill `neckMaxShift: 6`, `minClearance: 2` on load, guarded by
  `src/supports/persist.test.ts` opening a pre-22 record.

Phase 5's threshold is a guess (fail at more than two ABI versions behind); the owner may prefer a
warning. The mechanism matters more than the number: the gap reached 51 because nothing printed it.

---

## 5. What each app should take from the other now, without waiting for geocore

All of this is Phase 0. None of it touches `vendor/`, so the gap is irrelevant to it.

### mixomesh takes from mixodental

1. **Feature-detect the GPU before boot.** `gateStorage()` (`src/app/main.ts:64-70`) asks "which
   engine is this"; it never asks "can this device draw". Add mixodental's probe (`hasWebGL2`,
   `src/main.tsx`, including the `try` for hardened browsers and the `loseContext` hand-back) beside
   `engineGate`, feeding the existing `renderBlockingMessage`. *Invariant:* no route reaches
   `bootstrap()` without a drawing context. *Test:* port `scripts/no-webgl-gate.mjs`: `getContext`
   returns null, the page must show the blocking title and must not show the shell. *Guess:* which
   context Babylon 9.6 requires here; `boot.ts` and `SceneManager.js` decide it and I did not read them.
2. **One surface for every boot failure (MX-13).** The `bootstrap()` catch at `main.ts:230-239`
   paints an overlay on the viewport only and leaves the panels live. Route it through the same
   full-screen `renderBlockingMessage`. mixodental's rule is the one to copy: three ways in, one
   surface out. *Test:* make one `.init()` throw; assert the outliner is not interactive.
3. **A reader-that-is-not-the-writer test that runs on every change (MX-06c).** Copy the 40-line
   reader and the four property checks from `exportBytes.test.ts` into `tests/` against the real STL
   writer, and round-trip one 3MF through the real `jszip` rather than `tests/jszip-stub.mjs`.
   Keep the negative control: a reflected export must fail it. This copy is debt (section 6) and is
   retired by C1.
4. **Make the "nothing built" path as loud as its mirror (MX-08).** `PrintPipeline.js:779`
   `if (!built) continue;` becomes a push onto `ctx.repairSkipped`, so the existing
   `toast.exportedWithWarnings` names the object. *Invariant:* a unit with built supports either has
   them in the file or is named in the outcome. *Test:* stub `buildSupportsForExport` to return
   `null`; assert the warning carries the object's name.
5. **Scope the smoke's allowlist by what the line is (MX-07).** `/Babylon\.js/` is a list of where
   noise was once seen. Replace it with the exact strings and their reasons, and report when none matched.

### mixodental takes from mixomesh

1. **A boundary per panel, not only one at the root.** `PanelErrorBoundary` (`src/react/mountPanel.tsx:8-17`)
   is why a mixomesh panel crash cannot take the shell. Wrap the deck, the settings panel,
   `JobActivity` and the viewport each in a small boundary that renders a face (not `null`:
   mixodental's own rule is that every failure has one) and leave `AppBoundary` + `rescue.ts` as the
   last resort. *Invariant:* a render throw inside one panel leaves the others, and the real Save
   command, mounted. *Test:* a throwing child in each wrapped region; assert the siblings and the
   `data-ui` of the panel's own fallback are present, and that `stopped-screen` is not.
2. **A last resort that does not need React.** mixomesh has two (`src/app/entry.js:23` and `:25`):
   a `window` `error` listener and a `.catch` on the boot import, both writing into static markup.
   If `main.tsx` itself fails to load or parse, which is what a below-floor browser (MIXO-03) does,
   neither `hasWebGL2` nor `AppBoundary` ever runs. *Invariant:* a failure before React mounts still
   says something. *Test:* extend `gate:nogl` with a pass that blocks the entry chunk; `#root` must
   not be empty. *Not checked:* whether last night's fix already put fallback text in `index.html`.
3. **Give the strong export instrument a caller.** mixodental has `verify-exported-stl.py` (trimesh)
   and mixomesh has `consumers.mjs`; both run only when someone remembers. The shared fix is
   MIXO-05's: one `npm run gate` per app that runs the heavy set and writes HEAD's sha, counts and
   exit codes to a file the handoff quotes. mixomesh's equivalent is `test:consumers` + `test:export`
   in `scripts/build-installer.mjs`'s gate (MX-06b). Same shape, two files, no shared code.
4. **Make the confirm able to say no (MIXO-02).** Same class as MX-08 and GEO-002/003.
   `useDentalFlow.ts:398-410` sends *holds*, *no angle holds* and *the check threw* through one
   `accept()`. Three outcomes, three values, using the notice channel `acceptDentalOrientation`
   already has. *Test:* the `settled`/`accept` pair given the three inputs produces three distinct
   states. The wording is the owner's; recommended placeholder: "No print angle passed the check.
   Supports on this model need a close look."

### Deliberately not taken across

- mixodental does **not** take `engineGate` / `detectEngine`. UA sniffing answers "is this engine
  unsupported as a whole", and mixodental has no such engine; its floor is expressed in features
  and build target. Revisit only if a whole engine becomes unsupported.
- mixomesh does **not** take `rescue.ts`. It has autosave; its gap is that autosave can fail to
  start (MX-13), which is fixed by starting it earlier, not by a second save path.

---

## 6. Debt deliberately not taken

| Debt | Why not now | What would change the answer |
|---|---|---|
| The STL reader exists twice (mixodental, and mixomesh after 5.3) until C1 | C1 needs level ground to benefit both; forty lines of test code for a few weeks is cheaper than blocking a CI proof on Phase 3 | Phase 4 lands C1; or a third copy is about to be written |
| No shared start gate or boundary (S1, S2) | Hub, and React is banned from geocore by its own guard | A third app arrives with the same policy as one of the two |
| mixomesh keeps `src/core/repair/` and MeshFixLib through Phases 2 and 3 | The adherence report's own caveat: geocore's repair was never compared with MeshFixLib on the 12 photogrammetry scans. Bundling it with the re-vendor makes both un-reviewable | The comparison is run and geocore is no worse on all 12 |
| C10, the duplicated worker runner | Now measured as real (two live layers, 456 app lines against 633 vendored), but still undiffed. Planning a deletion from line counts is how a plan becomes fiction | A line-by-line diff of the two `WorkerTask` files, and whether the app's own workers could be served by the vendored `serveTask` |
| GEO-007: the Blender parity dumps have no reader in geocore | It needs the owner ruling the audit asked for: is Resin UV parity a promise or a goal? Until then the honest act is the gap-register row (GEO-013), not a test | The owner calls it a promise; then the replay test is Phase 1 work |
| GEO-008, GEO-011, GEO-012, GEO-014, GEO-016 | Real, LOW or MEDIUM, and none reaches either app as wrong geometry. GEO-011 (strings naming mixoDental in `editing/`) could become visible to mixomesh users at Phase 2; whether those strings are reachable there I did not check | Any of them is found on a path mixomesh renders |
| MX-01, MX-02, MX-03 (mixomesh's three HIGHs) and MIXO-06 | Not refactoring. Each is a fix in one repo, already specified in its audit, and nothing here blocks or is blocked by it. MX-01 should **not** wait for C9 | Nothing; they run on their own schedule |
| C2 and C3, the spatial port | The handoff's own word is "nothing yet": three bench answers about the puck come first. The boundary is settled; the code waits | The bench answers are written in `mixospatial/docs/decisions/` |
| One combined ABI export (C6) versus the audit's two (`repair_strides()`, `phase_names()`) | A Rust API shape I am guessing at from the TypeScript side. Either satisfies the invariant | Whoever writes it picks; the test in section 3 item 3 is what matters |
| A cross-repo CI job checking the two apps against geocore HEAD | Three repos, one owner, CI that fires on tags only (MIXO-05). The Phase 5 local line is the cheap version | A second contributor, or the gap passes two versions again |

---

## 7. Not checked

- **Nothing was run.** No test, typecheck, build or probe in any of the three repositories. Every
  claim about behaviour is the audits' or the brief's; the nine observations were taken as given.
- Read in part only: the three audit reports past their finding sections (sweeps, verified-controls
  tables), and of the code only `ViewportPort.ts`, the export list of `commands.ts`,
  `capabilities.js:60-135`, `entry.js`, `main.ts:60-72` and `:228-240`, `mountPanel.tsx`,
  `main.tsx`, `AppBoundary.tsx:1-60`, `rescue.ts`, the head of `exportBytes.test.ts`, the head of
  `tests/d22.test.ts`.
- **C9 closing MX-01** assumes geocore's `diagnose_mesh` welds by position; `crates/` was not read.
- Whether mixomesh calls `exportGate.exportRefusal` anywhere (one grep says only `spike.ts` touches
  the export module), so whether C7 reaches mixomesh's export at all after Phase 2 is open.
- Whether `tests/d22.test.ts` scans for DOM globals or only for imports (section 3 item 7).
- Whether mixodental's `index.html` now carries pre-React fallback text (section 5, item 2).
- Which GL context mixomesh's Babylon setup needs, and what it does today when one is refused.
- The two apps' `scripts/vendor-geometry.mjs` are separate files with different layouts; whether
  they have drifted, and whether geocore should ship one, was not looked at.
- The "about a day" re-vendor estimate is the adherence report's, from signature diffs and not from
  a compiler; this plan's Phase 2 inherits that uncertainty unchanged.
- Line and file references are the audits' and the brief's as of `a62d719` (mixodental), `b5a71ab`
  (geocore) and `8fadb46` (mixomesh); none was re-resolved against a later HEAD.
