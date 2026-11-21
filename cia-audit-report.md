# cia — Code Integrity Audit of mixoDental, 2026-11-21 (cold reviewer, X6)

**Tier: Screen. Mode: audit. Scope: the whole repository at `7e8ae9f` (working tree clean at start).** Runtime evidence is the
launcher's full local gate on this HEAD (`gate26.log`: 1971 tests passed, 1 skipped; walk ALL PASS 198 + 2 skipped by design of
EXPECTED_CHECKS 200), read line by line, plus two unit files I ran myself. I took **no screen captures, ran no state-delta ladder
of my own and fired no concurrency probe of my own**: those are UNVERIFIED for this run where the gate does not hold an artefact.
So the first line, honestly: **a Screen-tier reading audit with the gate's runtime artefacts as evidence, not a Screen walk of my own.**

**Primary quantity:** the printed model and its supports as the export writes them to STL, plus the `.mixodental` project file
a user saves. Observers: the viewport, the deck card, the status line, the background-work list, the stored `PrintUnit`, the file
on disk read back.

**The wiring question for this system** (`wiring-walk.md` §1): *the operator saves the case, the browser does not write the file,
the app says "Saved", the leave prompt disarms, and the operator closes the tab — who finds out, and when?* Answer from the code:
nobody, until the next session opens an empty plate (MD-01).

## For the owner — five lines

1. **Your exported STLs are still the best-defended path in the app.** The gate on today's code proves a part-way export says
   which files landed, and the export refuses supports planted before a turn.
2. **One thing is not safe: saving a project on Firefox or Safari.** There the app cannot know whether the file was written, yet
   it says "Saved" and switches off the "leave this page?" warning — so a cancelled or blocked download can lose the whole case
   when the tab is closed (MD-01, HIGH).
3. Two smaller things: a denture export whose build came back empty says "Nothing to export for this mode" instead of what went
   wrong, and only once (MD-02); the "nothing leaves your computer" check has never been shown it can catch a request (MD-04).
4. **Do first:** make the fallback save say "handed to your browser — check your downloads" and keep the leave prompt armed (MD-01).
5. After the read: MD-01 and MD-04 fixed by the main session (see line 5 below); MD-02 and MD-03 written down. CI is milestones-only by your decision and was not filed.

---

## ROUTE and LEADS (X0, pasted verbatim from the launcher's run)

```
ROUTE tools/route.py 1 · root S:/ai/mixodental · 722 source files / 88862 lines · 8.5 s · skipped dirs: .git, __pycache__, dist, graphify-out, node_modules, vendor
SURFACE page=26 (index.html:1 `template file` , kit.html:1 `template file`) · cli=4 (artefacts/2026-11-11-screen/verify-exported-stl.py:52 `sys.argv` , scripts/extract-sup-contacts.py:316 `sys.argv`) · http routes=0, form targets=8 (dentalwork/batch-review/viewer.html:1534 `fetch('/reasons.json'` — no handler in tree) · server=package.json:10 `scripts.dev`
  → load surface-map.md §3, journey-map.md §2; browser-walks.md §12 by CLI/API observers (rendering walk possible)
STATE enums=28 (benchwork/rules.test.ts:41 deg|mm|mm2|flag|mode) · renderers for 0 of 5 (none found)  → design-tools.md §4; S16/S22 lead, not a finding
GRAPH files=722 lines=88862 packages=6 cross-imports=4 (benchwork<->dentalwork benchwork/cli.mjs:38) · signals held 2 of 2 scanned, 4 judged by hand (code-graph-tools.md §1: any 2 of 6) → code graph · if a graph (§2, one graph per question): code relationships → graphify explain/path (cgc not on PATH; §3.1: probe it by full path or its MCP tools first, and it comes first if it answers); architecture → graphify · graphify-out/: fresh · graphify: PATH · cgc: not on PATH
DESIGN top-level modules=6 · ui framework=package-lock.json:13 `react`  → design-tools.md §1–§3
COMMERCE none (criteria 1–4 of SKILL §0.3: payment dep no · orders/cart/products schema no · /checkout|/cart route no · commerce framework no)
MEDICAL DESIGN.md:1 `# Design System: mixoDental`  → companion-skills.md meddev row · AI none (§0.10 off: no LLM dep, no prompt dir)
BINDINGS tests=256 files (benchwork/rules.test.ts, unittest, vitest) · runner config=none · ci=.github/workflows/ci.yml · lockfile=package-lock.json · linter config=none · .env=none .env.example=none · docs: none · handoff=none · gap-register=none · contract files=AGENTS.md, CLAUDE.md, README.md  → §0.5 resolves the commands from these
COMPANIONS installed: impeccable, mixo-app-style, kubai-icons, stitch, meddev-iec-62366-usability, meddev-iso-14971, meddev-state-machines, meddev-traceability, fmea-analysis, rcca-master, five-whys-analysis, fishbone-diagram, fault-tree-analysis, trade-study-analysis, kepner-tregoe-analysis, egm:egm-draft, egm:egm-review, token-economy-delegation, pstack:thermo-nuclear-code-quality-review, security-review, gemini, skills-hub · other skills 166 · CLIs: graphify, gh, docker, npx, playwright, stitch, codex, claude · missing: design:accessibility-review, design:ux-copy  → companion-skills.md §3
UNKNOWN not scanned: callers outside the tree (cron, systemd, CI of another repo), dynamic route registration, templates outside *.html/*.jinja/*.twig/*.tpl/*.vue/*.svelte  (evidence.md §E5 boundary)
```

```
LEADS (tools/sweep_leads.py, X0) - leads, never verdicts; each gets a finding or a reason on its sweep line
S13 no caller in tree: none
S21 process-wide state written in a test, no restore seen: none
boundary: Python by syntax tree, JS/TS by pattern; callers outside the tree, decorator or entry-point registration, and restores in shared fixtures are not seen (evidence.md §E5)
```

Overrides against the block, each with its evidence: `viewer.html:1534`'s `fetch('/reasons.json')` is served by the review
viewer's own `serve.mjs` (recorded in `docs/reviews.md`, 2026-11-11) — not a finding. MEDICAL fires on a design-system title; the
product says it is not clinically validated (README) — meddev row noted, not imported. **Discovery binding corrected:** the
launcher called it "React + Babylon"; the shipping renderer is three.js and Babylon is opt-in —
`src/App.tsx:193` `const Viewport = readRenderer() === 'babylon' ? BabylonObjectViewport : ObjectViewport;`.

**Discovery.** Project: mixoDental. Handoff context: `docs/reviews.md` (five earlier cia runs, last 2026-11-11 with MIXO-01…15),
`docs/REVIEW-UX-REFINE.md` (today, owner decisions). Test runner: the project's unit suite (vitest). Full gate: the five commands
CLAUDE.md names (vendor check, unit suite, screens, build, browser walk). Analyser: `tsc` with `noUnusedLocals` inside the build.
Commerce evidence: none. Known open gaps loaded: MIXO-02/04/06 (handoff), the Export-all disabled-reason debt and F6 single
`/out/` (REVIEW-UX-REFINE). Project overrides: CLAUDE.md — CI milestones-only by owner decision, the local gate is the gate.

---

## 2b — VSM map (31 components, 16 channels)

| Component (path) | System | Channels (producer → consumer) |
|---|---|---|
| `src/components/useImportFiles.ts`, `src/workers/importWorker.ts`, `src/workers/stlSession.ts` | 1 | file (4) → import worker (1) → scene (3) |
| `src/core/import/estimate.ts`, `src/core/import/stlHeader.ts` | 4 | file bytes → budget (5) |
| `src/components/useDentalFlow.ts`, `src/dental/**`, `src/dental/flow.ts` | 1 | Step 1 → 2 → 3 → `dental/set` (3) |
| `src/denture/**` (own worker, `dentureExport.ts`) | 1 | denture flow → its worker → export |
| `src/autoGen/pipeline.ts`, `src/autoGen/useAutoGen.ts` | 1 / 2 | deck card → orient → scan → area → confirm → place → scene |
| `src/recipes/recipeBook.ts` | 3 | localStorage → auto-gen recipe |
| `src/components/useRegenerate.ts`, `useSupportBuilds.ts` | 1 / 2 | unit change → settled build request |
| `src/components/useSupportChecks.ts`, `useFixSpot.ts` | 3* | build → findings → Problems list |
| `src/components/useExport.ts`, `src/components/exportBatches.ts`, vendor `host/supports/exportGate` | 1 / 5 | scene → per-file build → gate → browser download → STL on disk |
| `src/components/useProjectFile.ts`, `src/state/projectFile.ts`, `src/workers/projectClient.ts` | 1 / 4 | scene ↔ `.mixodental` (picker or anchor download; worker parse) |
| `src/state/project.ts`, `src/state/history.ts` | 3 / 2 | the authoritative scene; one undo step per command |
| `src/core/plateLedger.ts` | 2 | in-flight imports against one plate quota |
| `src/components/JobActivity.tsx` + vendor `jobActivity` | 1 → operator | every job → the list that keeps failures |
| `src/items/**`, `src/deck/**` | 1 / 3 | per-file rows, detect state, thumbnails |
| `src/components/ObjectViewport.tsx` / `BabylonObjectViewport.tsx` | 1 | two implementations of one viewport contract |
| `src/main.tsx` `hasWebGL2` | 5 | capability gate → first screen |
| `src/i18n.ts`, `src/locales/*`, `src/ui/theme.ts` | 3 | per-user settings |
| `src/config/printers.json`, `src/plate/printerProfiles.ts` | 3 | declared, unwired seam (prior run) |
| `vendor/mixo-geocore` (engine 70, `5319c86`) | 4 | consumed as built, hash-checked |
| the browser (downloads, File System Access, WebGL2, workers) | 4 | the target environment |
| `benchwork/`, `dentalwork/batch-review/` | 1 (offline tools) | engine bench and review viewer, not shipped |
| unit suite (259 files), source-reading guards | 3* | code → its rules |
| `scripts/walk.mjs` (EXPECTED_CHECKS 200) | 3* | built app in Chromium |
| `scripts/step-screens.mjs` (18 screens) | 3* | components on fake data |
| `scripts/vendor-geometry.mjs` (check mode) | 3* | vendored engine hash |
| `.github/workflows/ci.yml` | 3* | milestone tags only (owner decision) |
| GitHub Pages | 4 | static host |
| `README.md` promises | 5 | "Your files never leave your computer" |
| `beforeunload` guard in `useProjectFile.ts` | 5 | dirty scene → leave prompt |
| `scripts/real-scan-gate.mjs` | 3* | real scans → baseline |
| `tools/blender-parity/` | 4 | independent producer |

## 2a — Sweeps S1–S24

**S1** — swept, 0 findings, sites: `src/components/useExport.ts:65`, `src/components/useExport.ts:116`, `src/autoGen/useAutoGen.ts:179`,
`src/autoGen/useAutoGen.ts:196`, `src/autoGen/pipeline.ts:155`, `src/components/useProjectFile.ts:72`. Quoted:
`let working = sceneRef.current;` (`useAutoGen.ts:179`) — a private copy, but the operator's own edit of the running card is
cancelled first (`src/App.tsx:1366` `autoGen.cancelIfRunning(unit.id);`). S1.1: `useExport.ts:222` reads `builtRef.current`
after the awaits for the status's support count while the files came from the start snapshot — does not reach LOW (a status
number; the files and the `unchanged` gate at `:116` are unaffected).

**S2** — swept, 0 findings, sites: `src/core/plateLedger.ts`, `src/autoGen/useAutoGen.ts:253`, `src/autoGen/useAutoGen.ts:281`,
`src/components/useProjectFile.ts:57`, `src/components/useProjectFile.ts:73`, `src/dental/editingMode.ts:658`. Quoted:
`if (!eligible(unitId).ready || pending.current.includes(unitId) || running.current === unitId) return;` (`useAutoGen.ts:253`).
Runtime: the highest-value site (plate quota) was fired twice in this gate — `PASS q1 G4 two drops in flight on one plate quota
admit exactly one, and the loser is refused in words` (gate26.log:190).

**S3** — 66 catch sites in 39 non-test files enumerated; the 14 on primary paths read; 1 finding (MD-02, closed but mis-worded),
plus MD-01's success-on-unknown (filed under S16/S22). Sites read: `src/components/useProjectFile.ts:99`,
`src/components/useExport.ts:140`, `src/components/useExport.ts:224`, `src/autoGen/pipeline.ts:149`, `src/autoGen/pipeline.ts:168`,
`src/autoGen/pipeline.ts:179`, `src/autoGen/pipeline.ts:217`, `src/autoGen/pipeline.ts:246`, `src/autoGen/useAutoGen.ts:198`,
`src/state/projectFile.ts:30`, `src/state/projectFile.ts:87`, `src/workers/projectClient.ts:27`, `src/recipes/recipeBook.ts:100`,
`src/main.tsx:65`. Quoted: `setStatusMessage(isAbort(error) ? SAVE_CANCELLED : saveFailure(error, name));`
(`useProjectFile.ts:101`). No debug-level swallow in the new files.

**S4** — swept, 0 findings, 3 boundaries: binary/ASCII STL (`src/core/import/stlHeader.ts`, walk `r6`/`r6b` PASS today), glTF
(cell UNVERIFIED as on 2026-11-11, no spec fetched), the project file (our own format). Quoted:
`if (file.version > PROJECT_VERSION) throw new ProjectFileError('newer', ...` (`src/state/projectFile.ts:36`). glTF field
semantics unverified.

**S5** — swept, 0 findings, sites: `src/dental/editingMode.ts:658`, `src/App.tsx:1292`, `src/App.tsx:1366`,
`src/autoGen/useAutoGen.ts:252`, `src/components/useProjectFile.ts:108`. Quoted: `enabled: (s) => Boolean(s.dentalReviewReady) &&
!s.generating && !s.exporting,` (`editingMode.ts:658`). S5.1: the package scripts CLAUDE.md names all have a caller (the gate).

**S6** — swept, 0 findings; TODO/FIXME/XXX/HACK over `src/` and `scripts/`: 1 hit, `src/components/BrandLogo.tsx:5`
(cosmetic, named). The `shortcut:` F6 in `dentalwork/batch-review/serve.mjs` is recorded debt (REVIEW-UX-REFINE F6), not re-flagged.

**S7** — swept, 0 findings; unit: 1 skipped (gate26.log:15, the known fixture skip). Walk: 2 skipped by design, `u8`/`u8b`, which
never run on this machine's fixture — `skippedByDesign += 2;` (`scripts/walk.mjs:3564`). Reported as 2 unverified; the
surface they guard has an A1 render test, `src/components/DentalBar.test.tsx:45` — below LOW, INFORMATIONAL.

**S8** — no test was added or changed this run. Run lines I produced: `src/dental/flow.test.ts` and `src/components/DentalBar.test.tsx`
gave `Test Files 2 passed (2)` and `Tests 34 passed (34)` (x6-vitest.log:5-6).

**S9** — swept, 0 findings, renames: deck "item" to "file" (REVIEW-UX-REFINE #5), `exitNeedsConfirm` (today). Grep for
`items left` and `Start this item` in `src/locales`, `src/items`, `src/deck`: 0 hits. Quoted:
`|| (unit.dental !== undefined && (isManualArea(unit.dental) || policyHoldsWork(unit.dental)));` (`src/dental/flow.ts:189`).

**S10** — probes before claims: `git rev-parse HEAD` gave `7e8ae9f5…`, clean; `gh run list --commit 7e8ae9f…` gave `[]`; the walk's
renderer read from `scripts/walk.mjs:203` (default three) before claiming which view the gate drove.

**S11** — swept, 0 new findings, boundaries: STL (`stlHeader.ts`), glTF (`src/state/import.ts`), project file
(`src/state/projectFile.ts:26-59`), worker replies (`src/workers/projectClient.ts:27`), recipe storage (`src/recipes/recipeBook.ts:100`).
Quoted: `if (!mesh || !(mesh.positions instanceof Float32Array) || !(mesh.indices instanceof Uint32Array)) throw damaged('no mesh arrays');`
(`projectFile.ts:52`). S11.1: precondition met (three locales); no byte-oriented text operation in the new files.

**S12** — swept, 0 findings, sites: `src/components/useExport.ts:231` (what landed is said first), `src/autoGen/useAutoGen.ts:221`
(a stale drain re-drains), per-job timeouts (walk `r5` PASS today). Quoted: `if (generation.current !== mine && pending.current.length >
0) void drain();` (`useAutoGen.ts:221`). S12.2: no cache in front of a store.

**S13** — swept, 0 findings. LEADS line "S13 no caller in tree: none" confirmed, nothing to answer. Recorded orphans (printer seam
`src/plate/printerProfiles.ts`, MIXO-10/11) re-read as recorded, not re-filed; `src/config/printers.json` is read by
`parsePrinterProfiles` only (declared owner).

**S14** — whole repository, Screen depth. Not walked by me: the denture screens, the Babylon renderer at HEAD (the gate drove three
only), `benchwork/`, `dentalwork/batch-review/` beyond reading, vendor internals.

**S15** — four-corner table below. 2 flows × 8 states; 1 disagreement (MD-01), 0 unanswerable, 0 reachability findings.

**S16** — 2 flows × 4 non-terminal states; 1 silent death (MD-01), 1 notice that reaches only a replaceable line (MD-02). Quoted:
`saved.current = current;` (`src/components/useProjectFile.ts:96`). Unattended table below.

**S17** — swept, 1 off-system decision point that bears on MD-01: the browser's download. Quoted (`useProjectFile.ts:17`):
`const savePicker = (): SavePicker | undefined => (typeof window !== 'undefined' && !navigator.webdriver ? ... showSaveFilePicker : undefined);`.
Export narrows its claim to what was handed over (`useExport.ts:125-130`); save does not (MD-01).

**S18** — Blender parity corpus (`tools/blender-parity/`) left as prior runs proved it; glTF cell UNVERIFIED; re-walks triggered this
run: 1 (MD-01's class, every "it was written" claim on a browser download: `useExport.ts:131-146` narrowed correctly,
`useProjectFile.ts:88-97` not).

**S19** — the browser floor declared at `README.md:20` (Chrome/Edge 93, Firefox 114, Safari 15.4), crossed against MD-01: two of
three declared engines have no `showSaveFilePicker` (INFERRED from platform knowledge, not fetched this run), so the fallback is
their only save path. Line 2c.

**S20** — 8 detectors (unit suite, build/tsc, walk, screens, vendor check, real-scan gate, CI, walk `h`); the walk asserts its own
count: `if (complete && results.length + skippedByDesign !== EXPECTED_CHECKS) {` (`scripts/walk.mjs:5244`). 1 finding: MD-04 (walk
`h` has no proof it can see). Outermost check: CI on milestone tags (owner decision).

**S21** — 1971 tests, assertions not separately counted by the runner; V vacuous-pass risks, each with its sibling or finding:
`scripts/walk.mjs:4888` (`outside.length === 0`) has no sibling proving the listener at `scripts/walk.mjs:1043` can record a request,
so **MD-04**; `scripts/walk.mjs:3564` (u8/u8b never run) has the sibling `src/components/DentalBar.test.tsx:45`; `PASS h no console
errors` (gate26.log:349) has the sibling collector that records page crashes (`scripts/walk.mjs:1041`). LEADS line "S21 … no restore
seen: none" confirmed. 0 secrets in failure output (no `.env`). External protocols pinned to a counterpart vector in the suite: 0 of 1
(STL, MIXO-13 recorded). Textual guards with written limits: recorded fixed by MIXO-12.

**S22** — 2 flows; findings MD-01 (save's unknown outcome shown as success), MD-02 (denture empty export), MD-03 (silent busy save).
Censuses on lines 2e and 2f. Quoted: `if (outcome.files.length === 0) return setStatus('Nothing to export for this mode.');`
(`src/components/useExport.ts:172`). S22.9: `data-action` is not a convention here (0 hits).

**S23** — table below; no new finding beyond MD-01's UNHANDLED cell.

**S24** — table below; no new finding; MIXO-13 (no external contract test for STL in the suite) still recorded.

### S15 — four-corner table

| Flow / state | Requester sees | Operator sees / can do | Executor believes | External record |
|---|---|---|---|---|
| Export: supports built, not exported | viewport supports | card, Problems | `builtRef` holds the build | nothing |
| Export: refused, planted before a turn | status + activity row | regenerate | `supportsNeedReplanting` (`useExport.ts:93`) | nothing written |
| Export: written | status names the files | activity row | `names` | the STL (read with trimesh on 2026-11-11) |
| Export: written part way | "Export incomplete ..." | same, kept in activity | `saved` | the files that landed (walk `r1` PASS today) |
| Export: denture build empty | "Nothing to export for this mode." (`useExport.ts:172`) | status only, not kept | gate never consulted | nothing written (MD-02) |
| Save: picker path | "Saved {name}." | activity row | `saved.current = current` | file written by `createWritable` (`useProjectFile.ts:84-86`) |
| Save: anchor fallback, download not written | "Saved {name}." | leave prompt disarmed | `saved.current = current` (`:96`) | no file (MD-01) |
| Open | "Opened {name}." | Undo toast | `markSaved(opened)` | file read (walk `i3`/`i4` PASS) |

S15 — walked 2 flows × 8 states; four-corner table above; 1 disagreement, 0 unanswerable states, 0 reachability findings. · runtime:
0 ladders run by me; the gate's i1-to-i3 save/reopen round trip (auto 364 / manual 1 / removed 57 / customised 50 / zones 1, before
and after) stands as one ladder; 3 of 9 adversarial rows from the gate (r1 failure of the outside step, q3-q5 duplicate, r2 out of
order); 5 of 8 corner cells proved by artefact.

### S16 — unattended set

| State | Should advance it | Operator would see | How they would ever find out |
|---|---|---|---|
| Fallback save, file not written | a real write or a read-back | "Saved {name}.", no leave prompt | next session: an empty plate (MD-01) |
| Denture export, every file empty | the gate's `nothing-built` refusal | one status line, replaced by the next | only if read at once (MD-02) |

### S23 — arrivals × perturbations

Sequence (export): operator → `useExport.runExport` [scene snapshot] → export worker `exportFiles(batch)` → `exportRefusal(one, ..., unchanged)`
→ `deliver` → browser download → status + jobActivity. Sequence (save): operator → `saveProject` → picker, if any → `packProject` (gzip)
→ `createWritable` or `anchor.click` → `saved.current = current` → status.

| Arrival | Duplicate | Out of order | Late | Early | Missing | Malformed |
|---|---|---|---|---|---|---|
| analysis worker reply | q5 PASS (gate26.log:194) | r2 PASS (:197) | r5 PASS (:202) | n/a, keyed by job id | r4 PASS (:200) | `codedJobError` (`useExport.ts:233`) |
| export worker reply | one await per file (`useExport.ts:181`) | n/a, sequential | `unchanged` gate (`:116`) | n/a | empty means failed (`:192`) | UNVERIFIED |
| browser download outcome | n/a | n/a | n/a | n/a | UNHANDLED for save (`useProjectFile.ts:88-97`, MD-01); export says so (`useExport.ts:125-130`) | n/a |
| file drop / project open | q3/q4 PASS | n/a | `busy` (`useProjectFile.ts:57`) | n/a | n/a | r6b PASS; `assertSoundMeshes` (`projectFile.ts:48`) |
| auto-gen step answer | `running.current` guard (`useAutoGen.ts:253`) | n/a, awaited in order | `live()` (`useAutoGen.ts:196`) | n/a | catch to a named stop (`pipeline.ts:149`) | `detectStateOf` (`pipeline.ts:154`) |

S23 — 2 primary flows diagrammed (of 4 on the map); 5 arrivals × 6 = 30 cells; handled 21, UNHANDLED 1 (MD-01), UNVERIFIED or n/a 8;
interleaving pairs 2 (auto-gen vs operator open, `cancelIfRunning`; two drops, q1), order-independent 2, order-dependent 0.

### S24 — boundaries × test class

| Boundary | Inbound class | Outbound class |
|---|---|---|
| STL import (binary/ASCII) | c/d: 24-file corpus, real scans | n/a |
| STL export | n/a | b in the suite (own reader); e on 2026-11-11 (trimesh), MIXO-13 |
| project file save/open | b (own writer and reader; walk i2-i4) | b |
| browser download (save) | a: no test of a refused fallback download | a |
| worker protocols | b (`jobContract.test.ts`, prior) | b |

S24 — 5 boundaries (2 inbound, 2 outbound, 1 internal); producer × consumer matrices: 1 (STL to slicers), independent fixtures C/D/E
1/1/0 this run; primary-path boundaries below c: 2 (STL export, MIXO-13 recorded; save download, MD-01's test gap); internal at a on a
state-writing path: 1; fixtures without version: not checked.

---

## Findings

### MD-01 — HIGH — the fallback save says "Saved" and disarms the leave prompt without knowing a file was written
- Confidence: HIGH-CONFIDENCE · VSM: 1 → 5 (the algedonic channel) · Domain: Persistence · Class: unrendered outcome / dead
  control (S16, S22, S17) · Layer L2 · Boundary: `useProjectFile.saveProject` (anchor download) → browser download (System 4) →
  `saved.current` and the `beforeunload` guard (System 5).
- Invariant 2 (register below): the leave prompt is armed while the work on the plate is in no file.
- Evidence (OBSERVED in source): `src/components/useProjectFile.ts:17` takes the fallback whenever `showSaveFilePicker` is absent;
  `src/components/useProjectFile.ts:93` `anchor.click();` cannot observe a refused or cancelled download — the repo's own export
  path says so at `src/components/useExport.ts:125-127` ("a browser that blocks quietly does not throw, and the page cannot tell");
  then `src/components/useProjectFile.ts:96` `saved.current = current;` and `:97` `setStatusMessage(savedStatus(name));` ("Saved
  {name}."), which makes `dirty` false (`:42`) and removes the `beforeunload` guard (`:44-52`). INFERRED: Firefox 114 and Safari 15.4,
  both on the declared floor (`README.md:20`), have no `showSaveFilePicker`, so this is their only save path. No autosave exists
  (`docs/PLAN.md:256`).
- Failure scenario: Firefox with "always ask where to save" → Save project → the operator cancels the dialog (or Safari's "allow
  downloads" prompt is refused) → status "Saved case.mixodental." → close the tab → no prompt → the case is gone.
- Graded HIGH, not CRITICAL: a person who cancelled the dialog has their own notice; the silent-block variant is CRITICAL-shaped and
  UNPROVEN here (no Firefox or Safari run).
- Fix: on the fallback, say "{name} handed to your browser — check that it is in your downloads" and leave `saved.current` unchanged
  so the leave prompt stays armed (or ask "Did the file save?" once). Verification: a unit test with `showSaveFilePicker` undefined
  asserting `dirty` stays true and the status is not `savedStatus`; walk `i2` keeps covering the download itself.

### MD-02 — MEDIUM — a denture export whose files all came back empty is reported as "nothing to export", once
- Confidence: HIGH-CONFIDENCE · VSM 1 → operator · Domain: UI/UX · Class: fail-closed but mis-worded (S3, S22) · Layer L2 ·
  Boundary: `dentureExport` (worker, System 1) → the `useExport` refusal surface.
- Invariant 4: every export refusal says its true reason on the status line and in the activity list.
- Evidence: `src/components/useExport.ts:172` `if (outcome.files.length === 0) return setStatus('Nothing to export for this mode.');`
  returns before `exportRefusal` (`:173`) can name `nothing-built`, and through `setStatus` only, against the file's own rule at
  `:44-45` ("A REFUSAL IS SAID TWICE"). `src/denture/engine/dentureExport.ts:50` drops a file whose parts are all empty. The per-file
  path fixed this exact shape at `useExport.ts:186-192`.
- Fix: remove the early return and let the gate at `:173` refuse, or call `refuse('nothing-built', name)`. Verification: a test whose
  denture client answers `{ files: [], units: [{ triangles: 0 }] }` asserting the activity row carries the refusal code.

### MD-03 — LOW — Save project pressed while an open is in flight does nothing and says nothing
- Confidence: CONFIRMED (source) · S22 action loop · Layer L1 · `src/components/useProjectFile.ts:73`
  `if (current.units.length === 0 || busy.current) return;` — a good click and a dead click look the same. Invariant 4. Fix: one status
  line ("wait for the open to finish").

### MD-04 — MEDIUM — "Your files never leave your computer" is guarded by an emptiness check nothing has shown can fire
- Confidence: POSSIBLE · VSM 3* · Domain: Security / privacy · Class: vacuous pass (S21 shape 1, S20) · Layer L3 ·
  Boundary: the app's network traffic → walk check `h`.
- Invariant 5: no request carrying the user's data leaves localhost (`README.md:6`).
- Evidence: `scripts/walk.mjs:4888` `check('h no request leaves localhost', outside.length === 0, ...)`; the collector at
  `scripts/walk.mjs:1043-1045` counts only http(s) page requests, so `ws:`/`wss:` and anything Playwright does not surface on the page
  are outside it, and no step plants an outside request to prove the list can be non-empty.
- Fix: one walk step that requests an external URL from the page and asserts `outside` grows (then clears it), and widen the protocol
  filter to ws/wss. Verification: the planted request turns `h` red.

Re-read and not re-filed (cited): MIXO-02/04/06 and the printer seam (`docs/reviews.md`, 2026-11-11, with handoff status), the
Export-all disabled reason shown only as a hover title (`docs/REVIEW-UX-REFINE.md`, debt), F6 single `/out/` (same), MIXO-13.

### Verified controls
- ✓ Export refuses supports planted before a turn, before any work (`useExport.ts:91-94`).
- ✓ A part-way export names what landed — walk `r1` PASS on HEAD (gate26.log:196).
- ✓ Plate quota: two drops at once admit one — walk `q1` PASS (gate26.log:190).
- ✓ Save, reload, open restores every kind of edit — walk `i1`-`i4` PASS (gate26.log:160-165).
- ✓ Step screens and auto-gen build the same supports — walk `x0p` PASS (gate26.log:285), a two-implementation check.
- ✓ Project file ingress validates mesh shape and version (`projectFile.ts:26-59`).
- ✓ Exit asks before dropping Step 2 strokes or moved sliders (`flow.ts:189`, `flow.ts:198`; unit tests green, x6-vitest.log).

### Invariant register (doctrine §8.0)
I1. The STL the export writes is the scene the operator saw, with supports planted for the current pose.
I2. The leave prompt is armed whenever the plate holds work no file holds.
I3. A saved project reopens to the same work.
I4. Every refusal on a primary path is said in its true words, on the status line and in the activity list.
I5. No request carrying the user's data leaves localhost.
I6. An auto-gen answer never lands on a unit the operator has since changed.

---

## Step 6 report

1. Fast lint + scope tests: ✅ the launcher's gate on `7e8ae9f` (unit suite 259 files / 1971 passed, 1 skipped; `tsc` inside the build
   green, gate26.log:110); my own run: 2 files / 34 tests (x6-vitest.log). Dependency audit not run this session.
2. /cia universal integrity: ❌ 4 findings — 0 CRITICAL, 1 HIGH (MD-01), 2 MEDIUM (MD-02, MD-04), 1 LOW (MD-03). No commerce.
2b. VSM map: 31 components → Systems 1–5 / 3*, 16 channels (table above).
2a. S1–S24: one line each above; S15, S23 and S24 carry tables.
2c. S19 host capability: 3 requirements (WebGL2 + module workers; File System Access for a confirmed save; downloads) × 3 declared
    engines; satisfied/not-satisfied/unknown = 6/2/1 — File System Access not satisfied on Firefox 114 and Safari 15.4 (INFERRED),
    feeding MD-01; Safari's download-prompt behaviour unknown.
2d. S20 detectors: D 8; C 3 report coverage separately (walk count, real-scan "ran N", vendor hash); H 1 watched for liveness (CI
    history, milestones only); E 0 escalate beyond the person running them; outermost check: CI on milestone tags (owner decision).
2e. S22.10 redraw census: T 4 re-render triggers (`src/components/JobActivity.tsx:87` interval, the activity subscription,
    `src/components/viewport/useBrushOverlay.ts:118` rAF, `src/denture/engine/liveTilt.ts:15` rAF) × S 3 in-flight states (job progress,
    auto-gen card running, export busy) = P 12 pairs; K 12 drawn from a live source (the activity store, the `cards` map, the
    `exporting` state), F 0; Step 4 (g): C 0 long-running controls activated by me, H 0 — the gate's `m12` holds an auto-gen card through
    completion; two-cycle hold UNVERIFIED.
2f. S22.11 vocabulary: N 6 nouns (file, model, object, case, project, plate) across S 3 surfaces (deck, steps, header); T 6; D 0 with
    more than one name after today's file/item change; C 0; M 0.
2g. S19.3 parity: 2 environments (this workstation; CI) × 3 suites (unit, build, walk); RAN 3 / NOT RUN 3 (CI not run on this commit by
    owner decision); engines run: Chromium, of Chromium/Firefox/Safari declared; restricted-account run n/a; secrets-absent run n/a (no
    secrets).
2h. S19.4: no host or engine move stated — n/a.
2i. MAINTAINABILITY: M1 0 / M2 0 / M3 0 / M4 0 gaps (tools/maintainability.py, 1050 files via git ls-files), hubs + comment intent judged
    by hand on 5 files: `src/components/useExport.ts` (7 host fields in, 2 out: a job), `src/components/useProjectFile.ts` (8 in, 3 out: a
    job), `src/autoGen/pipeline.ts` (a pure host interface: a job), `src/autoGen/useAutoGen.ts` (a job; comments name the traps),
    `src/dental/flow.ts` (`policyHoldsWork` pure and tested). Comments say why throughout; some are long enough to bury the line they
    guard (`useExport.ts:150-169`), not graded.
3. Full test suite: ✅ 1971/1972 green (1 skipped, unverified) on HEAD `7e8ae9f` — the launcher's run, gate26.log:14-15; not re-run by me.
4. Runtime walk: ✅ the gate's walk ALL PASS, 198 checks + 2 skipped by design of 200 (gate26.log:350), three.js renderer only; Babylon
   not walked at HEAD (UNVERIFIED); no captures (UNVERIFIED); closed-loop actions not walked by me.
5. Fixes applied autonomously: 0 by the read-only auditor; applied afterwards by the main session, after checking each in the code:
   - MD-01 `src/components/useProjectFile.ts` `saveOutcome`: only a write through the save dialog marks the project saved;
     the download fallback keeps the leave warning on and says "Sent {name} to your browser's downloads. Check that it
     arrived before you close the page." (ja / zh-Hant via Gemini). Test `src/components/useProjectFile.test.ts`.
   - MD-04 `scripts/walk.mjs` `leavesMachine`: the outside-request detector covers http(s) and ws(s) and watches websockets;
     new walk check `h0` proves it flags an outside address and passes a local one (EXPECTED_CHECKS 200 -> 201).
   Written down, not fixed: MD-02 (why a denture export can come back with every file empty is not known from reading;
   a message would have to guess the cause) and MD-03 (LOW: Save pressed while a project opens does nothing and says
   nothing). Guards: S22.10 - no new long-running control; S22.11 - the item-to-file rename has no retired-name test
   yet (debt).
6. Tier: Screen — elapsed: about 95 minutes (tier budget: 2–4 h).
7. Skill score: not run (harness fence).
8. Runtime walk receipt: routes fetched 1 app route by the gate / assets not fetched by me · error-log delta: 0 console messages, per the gate's check `h no console errors or warnings` (gate26.log:349) · preview rows walked: 18 step screens written (gate26.log:23-43), none rendered by me ·
   closed-loop actions: 0 walked by me; the gate's i2, r1, m12 closed · state-delta ladders: 1 (the gate's save/reopen, i1 to i3) ·
   concurrency probes: 1 (the gate's q1). Not my own walk: the first line says so.
   SCREEN CAPTURES, added after the read by the main session (browser-walks.md §9a): a full walk with WALK_OUT kept
   18 captures (ALL PASS 199 + 2 skipped) in `artefacts/2026-11-21-screen/run-b41bJ5/` (git-ignored, local; test
   fixtures only). Looked at: `ux-c-step3-1280x720.png` (Adjust leads with the edit tools, all on screen at 1280x720),
   `ux-a-step1-print-angle.png` (card "Print angle · 1 / 3", header Exit), `r3-deck-activity.png` ("2 files left",
   "Start with the first file", Export all STL disabled with its reason on hover only - the debt in line 5).
9. Evidence ledger (§11a): 16 capabilities — 5 PASS / 0 FAIL / 11 UNVERIFIED (6 of them PARTIAL) / 0 UNPROVEN (table below).
10. Obligations (§E3): 6 from the invariant register — 0 CLOSED / 6 OPEN / 0 FAILED / 0 BLOCKED / 0 OUT-OF-SCOPE; no owner 0, two
    owners 0, no verifier 2 (I2 fallback case, I5 positive case), verifier below authority 1 (I1, STL read only by our own reader);
    unowned behaviours 1 (`useProjectFile.ts:17` turns the picker off under `navigator.webdriver`, so the walk never drives the picker
    path — listed for the owner).
11. Unknowns and contradictions: 4 unknowns (register below); 1 contradiction (export says a download cannot be confirmed,
    `useExport.ts:125`; save says "Saved", `useProjectFile.ts:97`), blocking obligation I2; 0 truncated outputs (none truncated).
12. Wiring walk: question stated (top) · 4 lifecycles mapped (intake, processing, external call = the download, retention = the project
    file) against spec only · 9 connections, 3 with a no/UNVERIFIED on Q1–Q7 (save download Q2/Q6/Q7, denture export Q6, walk `h` Q7) ·
    faults G1–G7: 6 run of 7 applicable, by the gate (G1 r1, G2 q3-q5, G3 r2, G4 q1/q6, G5 r3/r5, G7 r4; G6 not run) — 6 recovered, 6
    visible, 0 silent · findings by layer L1/L2/L3: 1/2/1 · rule rows 6: covered 3 / gap 2 / unverified 1 · gap register: this file.
13. CI (S20.6): run none on 7e8ae9f: not run on this commit — milestones-only by owner decision (CLAUDE.md); latest run 43603544738 on
    a5c9f1d, success; the local gate on HEAD is the gate. Not filed.
14. SURFACE — 9 capabilities (0 orphan, declared-owned 1: the printer seam); 12 surfaces (1 dead-on-busy MD-03, 0 audience-gap); cells
    ● 7, ○ 1, ✕ 2 (MD-01 save fallback M4, MD-02 M4), unswept 0 on the primary rows; state branches rendered 9 of 14; round trips
    checked 1 (save then open, walk i3); reachability checked 0 of 12 by me. Quoted handler: `return void runExport(exportKindOf(id));`
    (`src/App.tsx:1292`). · JOURNEY — 2 critical journeys (export, save/reopen) of 5 found; 9 steps; grid cells 24: ● 14 (read 6), ✕ 2,
    U 1, ○ 7; traps checked 8 of 8, fired 1 (T2 confirmation that lies, MD-01); exits without owner decision 1 (MD-01); reduction:
    classes 6, decision rows 4, pairs 0. Quoted copy with its write: "Saved {name}." beside `anchor.click()` (`useProjectFile.ts:93,97`).
    · DESIGN — n/a beyond the two-renderer note (design-tools.md not read). · GRAPH — not queried: every site was reached by address
    (CLAUDE.md: go straight to the file when you know where to look); CGC MCP present, unused. · EXECUTORS — phase all: X0 grep, the
    skill's tools and the gate log, X5 main model for judgement; no delegation; TRUNCATED 0. · TESTS — n/a, no change made. ·
    COMPANIONS — none handed off; meddev row noted only (the product is not certified; a hazard pass on MD-01 would be the
    `meddev-iso-14971` job if the owner wants one); missing: design:accessibility-review, design:ux-copy.

### Evidence ledger (authority required / reached)

| Capability | Verdict | Evidence | What it shows |
|---|---|---|---|
| Import + plate budget | PASS | gate26.log:169,190,203,204 (A3/A3) | OBSERVED: a damaged file refuses alone; two drops admit one; a lying header; a truncated STL |
| Orient detect (deck) | PARTIAL | gate26.log:174 | OBSERVED: per-row result; the mismatch ending never driven (u8) |
| Dental Steps 1–3 | PARTIAL | gate26.log, walk s and u series | OBSERVED: happy path; u8/u8b skipped |
| Auto-gen queue | PARTIAL | gate26.log:185,186,285 | OBSERVED: builds, opens at Step 3, matches the step screens; stop paths UNVERIFIED |
| Export STL | PARTIAL | gate26.log:196 | OBSERVED: a partial write is named; the denture empty path (MD-02) UNVERIFIED |
| Save project | PARTIAL | gate26.log:162 (A3/A3) | OBSERVED: the download path writes the header and disarms the prompt; a refused download UNVERIFIED (MD-01) |
| Open project | PASS | gate26.log:164,165 (A3/A3) | OBSERVED: identical counts after reload; nothing unsaved after open |
| Job failure surface | PASS | gate26.log:199 | OBSERVED: a crashed check reads in its own words |
| Stopped detector | PASS | gate26.log:200 | OBSERVED: reads as pending |
| Plate quota race (S2 probe) | PASS | gate26.log:190 (A3/A3) | OBSERVED: exactly one of two drops admitted |
| No external request | PARTIAL | gate26.log:348 | OBSERVED: 0 recorded; the instrument unproven (MD-04) |
| Exit keeps Step 2 work | UNVERIFIED | x6-vitest.log:6 (A3 required / A1 reached) | OBSERVED: unit test only |
| Babylon renderer | UNVERIFIED | none | not walked on HEAD |
| Denture flow | UNVERIFIED | none | not read against the walk this run |
| Screen captures | UNVERIFIED | none | no capture taken this run |
| Leave prompt on Firefox/Safari | UNVERIFIED | none | no such browser run |

### Unknown register (§E4)

| Question | Authority | Next evidence | Who | Blocks |
|---|---|---|---|---|
| Does a cancelled Firefox save leave "Saved" and no prompt? | A3 | Firefox with ask-where-to-save on: Save, cancel, read the status and the leave prompt | agent (rung 2: install the Playwright Firefox) | MD-01 confirmation, I2 |
| Does walk check h see a planted external request? | A3 | add one external request step, expect the outside list to grow | agent | MD-04, I5 |
| Does a denture build produce zero triangles at export resolution in practice? | A2 | a real denture case through exportFiles | agent with the owner's fixtures | MD-02 reach |
| Do all 200 walk checks pass with the babylon renderer flag on HEAD? | A3 | the walk with the babylon renderer flag, output to a log | agent | Babylon ledger row |

### Expected and observed
I expected the auto-gen private scene copy (`useAutoGen.ts:179`) to let a pipeline land tips on a model the operator was editing; the
code cancels that card first (`App.tsx:1366`) and re-drains the queue (`useAutoGen.ts:221`). I expected u8/u8b to be a vacuous gap; a
render test covers the surface (`DentalBar.test.tsx:45`). Both readings withdrawn, not filed.

Reference receipts: theory.md "a codebase has five systems whether or not anyone named them" | sweeps/ "the channel is the finding" |
wiring-walk.md "ten tested classes are not nine tested connections" | doctrine.md "an invariant is a sentence that can be false" |
reporting.md "the ledger is harsher on purpose" | evidence.md "a promise needs one owner and a witness" | browser-walks.md "three
observers, one subtraction" | surface-map.md "every blank cell is a cell nobody swept" | journey-map.md "the author walked one path and
called it the journey" | maintainability.md "a hub wearing a smaller line count" | agent-deployment.md "the brief is the only context
the delegate has" | companion-skills.md "a companion takes a job, never the verdict" | plain-language.md "the doctrine keeps its words
and the user gets plain ones" | context-templates.md: §4a only read, receipt not quoted | code-graph-tools.md, test-tools.md,
design-tools.md, build-standard.md, build-orchestration.md, paired-run.md: not read (not owed at this tier and mode).
