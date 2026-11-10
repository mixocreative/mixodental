# cia — Code Integrity Audit of mixoDental, 2026-11-11

**Tier: Screen. Mode: audit.** Run overnight and unattended on `41f8d7f`, working tree clean at the
start and clean at the end apart from the two fixes committed below. Scope: the whole repository.

**The primary quantity:** the operator's work — the units on the plate, their orientation, rim, area
and supports, what the saved `.mixodental` holds, and **the exported STL**, which is the one artefact
that leaves the app and the one a printer obeys. Its observers (`browser-walks.md` §12): the
viewport, the deck row (picture + two sentences), the tool rail, the stored `PrintUnit`, the
background-work list, and the written file read back **by a parser that is not ours**.

**Where this run went, and why.** Three audits already cover this tree
(`docs/reviews/2026-11-02-cia-denture-flow.md`, `2026-11-08-cia-deck-and-flow.md`, and the
fault-injected `2026-11-09-wiring-walk-dental-flow.md` with its W-01 … W-17 register). The
2026-11-08 run names its own limits in writing: *"UNVERIFIED, not omitted: S4, S6–S11, S14,
S17–S21, S24. S22.11 (the vocabulary census) not run."* **Those are the sweeps this run went to**,
plus the two things no earlier run could have covered: the surfaces built in the last two days (the
two icon sets, the coloured art, the style book), and **the browser the product actually runs in**.
What the earlier runs closed is re-read and reported as covered, not re-derived.

---

## For the owner — five lines

1. **Nothing found tonight threatens a file you have already exported.** The export path is the
   best-defended thing in the repo, and for the first time it is proved against a parser that is
   not ours: tonight's own Step-3 export, 408,308 triangles, reads correctly in **trimesh** —
   Z-up, on the plate, outward normals.
2. **Two things need your decision before anyone outside this room uses the app**: a browser with
   no WebGL2 gets a **blank white page** with nothing said (proved, screenshot below), and the
   print-angle confirm **cannot say no** — "no angle holds" and "the check crashed" both open
   Step 2 looking exactly like "confirmed".
3. **Two small things are fixed and committed** (not pushed): the deck row's picture now follows a
   rotation, so a turned row stops showing its pre-orientation photo beside the words "Turned
   upright."; and a stranded comment that had swallowed a function's own description.
4. **The gate is green on `41f8d7f`** — and this is the first commit since `1b3b178` to have the
   *whole* local set run on it, not the usual four commands: tsc, tests, duplicates, screens,
   build, wasm smoke, the 13 real scans, and the full browser walk (**185 PASS, 1 FAIL**, the FAIL
   being the known `g-pre` machine-speed precondition, not the app).
5. **Tomorrow's human test is unaffected** by the two fixes, and one line of it gets easier: the
   row pictures will now agree with the row's own sentence.

---

## ROUTE (`python tools/route.py S:/ai/mixodental`, verbatim)

```
ROUTE tools/route.py 1 · root S:/ai/mixodental · 592 source files / 56447 lines · 9.1 s · skipped dirs: .git, __pycache__, dist, graphify-out, node_modules, vendor
SURFACE page=26 (index.html:1 `template file` , kit.html:1 `template file`) · cli=2 (scripts/extract-sup-contacts.py:316 `sys.argv` , scripts/dental-reference/compare_supported.py:7 `import argparse`) · http routes=0, form targets=5 (dentalwork/batch-review/viewer.html:663 `fetch('/reasons.json'` — no handler in tree) · server=package.json:8 `scripts.dev`
  → load surface-map.md §3, journey-map.md §2; browser-walks.md §12 by CLI/API observers (rendering walk possible)
STATE enums=24 (scripts/check-no-duplicates.mjs:66 supports|workers|state|dental) · renderers for 0 of 4 (none found)  → design-tools.md §4; S16/S22 lead, not a finding
GRAPH files=592 lines=56447 packages=4 cross-imports=1 (scripts<->src scripts/export-hashes.ts:11) · signals held 2 of 2 scanned, 4 judged by hand (code-graph-tools.md §1: any 2 of 6) → code graph · if a graph (§2, one graph per question): code relationships → graphify explain/path (cgc not on PATH; §3.1: probe it by full path or its MCP tools first, and it comes first if it answers); architecture → graphify · graphify-out/: fresh · graphify: PATH · cgc: not on PATH
DESIGN top-level modules=4 · ui framework=package-lock.json:11 `react`  → design-tools.md §1–§3
COMMERCE none (criteria 1–4 of SKILL §0.3: payment dep no · orders/cart/products schema no · /checkout|/cart route no · commerce framework no)
MEDICAL DESIGN.md:1 `# Design System: mixoDental`  → companion-skills.md meddev row · AI none (§0.10 off: no LLM dep, no prompt dir)
BINDINGS tests=216 files (dentalwork/batch-review/islandReport.test.ts, unittest, vitest) · runner config=none · ci=.github/workflows/ci.yml · lockfile=package-lock.json · linter config=none · .env=none .env.example=none · docs: none · handoff=docs/handoff/ · gap-register=none · contract files=AGENTS.md, CLAUDE.md, README.md  → §0.5 resolves the commands from these
COMPANIONS installed: impeccable, mixo-app-style, kubai-icons, stitch, meddev-iec-62366-usability, meddev-iso-14971, meddev-state-machines, meddev-traceability, fmea-analysis, rcca-master, five-whys-analysis, fishbone-diagram, fault-tree-analysis, trade-study-analysis, kepner-tregoe-analysis, egm:egm-draft, egm:egm-review, token-economy-delegation, pstack:thermo-nuclear-code-quality-review, security-review, gemini, skills-hub · other skills 166 · CLIs: graphify, gh, docker, npx, playwright, stitch, codex, claude · missing: design:accessibility-review, design:ux-copy  → companion-skills.md §3
UNKNOWN not scanned: callers outside the tree (cron, systemd, CI of another repo), dynamic route registration, templates outside *.html/*.jinja/*.twig/*.tpl/*.vue/*.svelte  (evidence.md §E5 boundary)
```

Overrides taken against the block, each with the evidence that outweighs it:

- **`dentalwork/batch-review/viewer.html:663`'s `fetch('/reasons.json')` is not a handler-less form
  target**: it is a local review viewer served by `dentalwork/batch-review/serve.mjs`, which serves
  that file. Checked, not a finding.
- **MEDICAL** fires on `DESIGN.md`'s title, which is a design-system document. The product's own
  words are *"Not clinically validated: check every result before printing"* (`README.md`). No
  meddev doctrine was imported.
- **COMMERCE none** → `/ecommerce-cia` does not apply and is not suggested.
- **`cgc` is not on PATH**, so code-relationship questions were answered by reading and by grep,
  with `graphify` available for architecture. No graph query was needed: the project's module
  READMEs are the architecture document and they are current.

## LEADS (`python tools/sweep_leads.py S:/ai/mixodental`, verbatim)

```
LEADS (tools/sweep_leads.py, X0) - leads, never verdicts; each gets a finding or a reason on its sweep line
S13 no caller in tree: scripts/test-support/dentalExpect.ts:43 `rimContainsPoint`
S13 no caller in tree: scripts/test-support/genericCases.ts:59 `bookkeepingSnapshot`
S13 no caller in tree: src/components/viewport/viewportPort.ts:89 `pointerRecord`
S21 process-wide state written in a test, no restore seen: none
boundary: Python by syntax tree, JS/TS by pattern; callers outside the tree, decorator or entry-point registration, and restores in shared fixtures are not seen (evidence.md §E5)
```

**All three leads answered**, each re-grepped across the whole tree including tests, fixtures and
`dentalwork/` (`grep -rn <name> --include='*.ts' --include='*.tsx' . --exclude-dir=node_modules`),
each with **zero** callers: `rimContainsPoint` → **MIXO-09**, `pointerRecord` → **MIXO-10**,
`bookkeepingSnapshot` → **MIXO-11**. The S21 lead ("none") was independently checked: no test in
`src/` writes `process.env`, a global or storage without a restore; `src/ui/theme.test.ts` stands up
its own `document` and `localStorage` and is the only one that comes close.

---

## 2b — The VSM map

40 components, 14 channels. Sweep sites below are enumerated from this map's channels.

| Component (path) | System | Channels (`producer → consumer`) |
|---|---|---|
| `components/useImportFiles.ts`, `workers/importWorker.ts`, `workers/stlSession.ts`, `workers/prepareImport.ts` | **1** | file → import worker → `PreparedMesh` → scene (1→4→1→3) |
| `core/import/estimate.ts`, `core/import/stlHeader.ts` | **4** | the file's own bytes → the budget (4→5) |
| `components/useRegenerate.ts`, `supports/jobRunner.ts`, `workers/meshWorker.entry.ts` | **1** | scene → placement → support mesh (1→1) |
| `components/useSupportBuilds.ts` | **2** | a unit change → a settled, de-duplicated build request (2) |
| `components/useSupportChecks.ts`, `useFixSpot.ts` | **3\*** | build → findings → the Problems list (1→3\*→operator) |
| `components/useDentalFlow.ts`, `dental/**`, `workers/analysisWorker.ts` | **1** | Step 1 → orient / tilt-scan / **confirm** / region → `dental/set` (1→4→3) |
| `denture/**` | **1** | the denture flow, its own client and queue |
| `items/useBatchDetect.ts`, `items/detectState.ts`, `items/rowState.ts` | **1 / 3** | purpose → one `dentalOrient` per row → the row's own sentence |
| `items/useThumbnails.ts`, `items/thumbnail.ts`, `viewport/drawThumbnail.ts` | **1** | unit → one renderer → a 160 px picture on the row |
| `components/useExport.ts`, `vendor/.../supports/export.ts`, `exportGate.ts` | **1 / 5** | scene → full-resolution build → `encodeStl` → the browser → **a file a slicer reads** |
| `components/useProjectFile.ts`, `state/projectFile.ts`, `workers/projectWorker.ts` | **1 / 4** | scene ↔ `.mixodental` |
| `core/plateLedger.ts` | **2** | every in-flight import counts every other one |
| `vendor/.../workers/WorkerTask`, `workers/analysisClient.ts`, `denture/engine/keyedQueue.ts` | **2** | job registry, per-job timeout, restart, keyed slots |
| `state/history.ts`, `dental/flow.ts` | **2** | one undo step per command; the step's undo floor |
| `state/project.ts` (the reducer), `editing/session.ts` | **3** | the authoritative scene and the mode |
| `host/core/budget.ts` | **5** | triangle / memory / plate caps and the tier |
| `config/printers.json`, `plate/printerProfiles.ts` | **3** | **a declared, unwired seam** (`usePlateArrange.ts:21`) |
| `i18n.ts` + `locales/*`, `ui/theme.ts`, `dental/adjustMemory.ts` | **3** | per-user settings in storage |
| `ui/iconCatalogue.ts`, `ui/Icon.tsx`, `ui/Art.tsx`, `kit/` + `kit.html` | **3** | icon and art files → the style book and the app |
| `styles.css`, `styles/theme.css`, `ui/tokenColour.ts` | **3** | design tokens → the DOM **and** the 3D scene |
| `components/JobActivity.tsx` + `host/workers/jobActivity` | **1→operator** | every background job → the one list that remembers failures |
| the vitest suite (217 files), the 58 source-reading guards | **3\*** | the code → its own rules |
| `scripts/walk.mjs` (186 checks) | **3\*** | the built app in a real browser |
| `scripts/real-scan-gate.mjs` + `dentalwork/baselines/` | **3\*** | 13 real scans → a committed baseline |
| `scripts/geometry-wasm-smoke.mjs`, `vendor-geometry.mjs --check`, `check-no-duplicates.mjs`, `geometry-guard.mjs` | **3\*** | the vendored engine and the TS/Rust boundary |
| `.github/workflows/ci.yml` | **3\*** | a `milestone-*` tag or a dispatch → tests, screens, build, two walk shards, the Pages deploy |
| `vendor/mixo-geocore` (engine 63, `b5a71ab`) | **4** | consumed as built; never edited here |
| Blender SLASG + `tools/blender-parity/` (19 cases) | **4** | an independent producer this app is measured against |
| the browser: WebGL2, module workers, WASM, storage, downloads | **4** | **the real target environment** — see 2c |
| GitHub Pages | **4** | static host, no headers, no server |

Two map rows carry the sweeps' `no sites` answers: there is **no cache in front of a store** (S12.2)
and **no `data-action` convention** (S22.9's second half).

---

## 2a — The twenty-four sweeps

Each line names its sites; `covered by <review>` means an earlier audit enumerated that sweep and
this run re-read the fix rather than re-deriving it.

**S1 — snapshot vs live reread.** Swept, 0 new findings, 6 sites: `components/useImportFiles.ts:173`
(`memoryCap` read once at the top of a drop and carried — **S1.1 satisfied**), `:157` (`plateNow()`
deliberately live), `components/useDentalFlow.ts:376-385` (the policy snapshot at accept, with
`keptDentalWork` preserving the operator's own work — W-01's fix), `items/useBatchDetect.ts` (the
batch profile — W-04's fix), `components/useExport.ts:64` (the scene read once as `current` and
carried through plan, gate and write), `state/project.ts:217` (`transform/set` clones).
Quoted: `const memoryCap = memoryCapBytes(memoryInfo());` — `useImportFiles.ts:173`.

**S2 — select-then-act.** Swept, 0 new findings, 5 sites: `core/plateLedger.ts` (hold + scene +
every other hold in one synchronous step; walk `q1`), `components/StartScreen.tsx:84` (`claimHeld`
reads and empties in one statement; W-08), `WorkerTask.wire`'s job registry (walk `q5`),
`items/useThumbnails.ts:26` (one draw per task), `state/history.ts`.
Quoted: `const claimHeld = (): readonly File[] => { const files = heldRef.current; heldRef.current = []; return files; };`
Runtime: no new S2 site appeared this run, so no new probe was owed; the highest-value site's
two-at-once artefact is `q1` from 2026-11-09.

**S3 — catch-block posture.** **21 catch sites in `src/` outside tests, every one read; 1 finding
(MIXO-01).** Fail-closed: `state/projectFile.ts:21,33,78` (each throws a named `ProjectFileError`),
`plate/printerProfiles.ts` `parsePrinterProfiles` (throws on the first bad row rather than inventing
a size), `workers/stlSession.ts:33,40,56`. Fail-open **on a display path with the degradation
visible**, which is the allowed case: `components/useExport.ts:99` (a failed support check becomes
`incomplete: N` and is reported in the export status). Per-user preferences, each saying so in its
own comment: `i18n.ts:27,46`, `ui/theme.ts:36,52`, `dental/adjustMemory.ts:13,21`,
`useDebugLayers.ts:28,90`, `printerProfiles.ts:61,70`. Reported twice (status line **and** the
activity list): `useImportFiles.ts:202,272`, `useExport.ts:142,152`. Also read:
`items/useBatchDetect.ts:78`, `denture/check/dentureSpots.ts:21`, `viewport/sessionMesh.ts:25,35`,
`viewport/drawThumbnail.ts:49`, `dental/manualArea.ts:52`, `core/import/estimate.ts:23`.
**No catch logs at `debug`/`trace` and continues** — 0 hits for `console.debug` or `log.debug` in
`src/`, so this sweep's 2026-09-24 shape has no site here.
Quoted: `} catch { /* storage blocked: the choice lasts this visit */ }` — `useDebugLayers.ts:28`.

**S4 — external field semantics.** Swept, 0 findings, 3 boundaries, **1 cell UNVERIFIED**: the
binary-STL header (`core/import/stlHeader.ts` — the header's count is ignored and the file's own
size decides; walk `r6` proved a header claiming 4,000,000 counts 2); ASCII STL (`estimate.ts:29`,
sampled, `exact: false`, margin in `budget.ts:23`); **glTF 2.0 accessors and `primitive.mode`**
(`estimate.ts:58-78`) — correct to the auditor's knowledge of the specification, **no citation
fetched this run, so the cell is UNVERIFIED**, with the consequence named: a wrong mode mapping
moves the pre-parse estimate only, and `useImportFiles.ts:196` re-asserts the triangle cap after the
parse.

**S5 — control to consumer.** Swept, 0 new findings, 9 controls: the four rail tools
(`deck/ToolRail.tsx:75` → `onPick` → `App.startItem`; W-02's fix), `Tips only` (`App.tsx:1504`),
the language switch, the theme switch, **the printer profile** (`plate/printerProfiles.ts` — a
declared, unwired seam, said in writing at `usePlateArrange.ts:21` and `PlateOutline.tsx:13`, so an
`○ declared owner` cell and not an orphan), the Debug layers, Remove (`items/ItemRow.tsx:92`), the
export kinds, Cancel/Dismiss on `JobActivity`.
Quoted: `onClick={() => onPick(tool)}` — `deck/ToolRail.tsx:75`, the press the component used to
destructure and never call.
**S5.1:** 40 scripts under `scripts/`; nine have a `package.json` caller, the rest are operator
tools whose exact commands are printed where they are used (`dentalwork/fixtures/README.md`). None
writes state the product reads at runtime. No dead maintenance control.

**S6 — deferred-work residue.** Swept, 0 findings. `TODO|FIXME|XXX|HACK` over `src/`, `scripts/`,
`dentalwork/`, `tools/`: **one hit**, `components/BrandLogo.tsx:5` (`TODO: outline it like "mixo"`),
cosmetic and named. Every "for now" / "until then" hit was read: all are explanations of a decision
already taken.

**S7 — skipped tests are unverified.** **1 finding (MIXO-08).** On this machine: `1588 passed |
1 skipped`; the skip is `dentalwork/batch-review/reviewCase.test.ts:118` (`CASE_002`, a fixture this
machine does not hold). The sweep's real result is the other six `describe.skipIf` gates:
`src/denture/check/ruleSpots.real.test.ts:22`, `src/denture/engine/dentureCore.test.ts:31`,
`src/denture/steps/supports/rigidMove.real.test.ts:39`,
`scripts/dental-region-review/openArch.test.ts:14`,
`dentalwork/batch-review/profileSelect.test.ts:52`, `reviewCase.test.ts:144`.

**S8 — a written test is not a run test.** One test was added this run
(`src/items/thumbnail.test.ts`, "is a row the flow has TURNED"). It was **watched to fail first** —
`expected undefined to be 'a'` — and its run line after the fix is
`Test Files 1 passed (1) · Tests 10 passed (10)`, `npx vitest run src/items/thumbnail.test.ts`,
exit 0. A second test was added beside it ("is NOT a row that only MOVED") which passed before and
after, on purpose: it is the guard against over-fixing.

**S9 — rename residue.** Swept, 0 findings, 3 renames: `mixosupports` → `mixodental` (0 hits in
`src/`, `scripts/`, `index.html`, `kit.html`, `docs/`; the only survivor is a file in the
git-ignored `walk-out/` from an October run), `exportRefusalText` → `exportOutcomeText`, and
`generic` → `dental-model` in the art set — both directions grepped.

**S10 — environment truth before diagnosis.** Two of my own readings were probed before they were
written, and **both were wrong**. Recorded in full under "what I expected and what the system did".

**S11 — boundary contract / schema drift.** Swept, **1 finding (MIXO-01)**, 6 boundaries: binary
and ASCII STL (`core/import/stlHeader.ts`, with a 24-file adversarial corpus at
`scripts/fixtures/stl-corpus/`), glTF/GLB (`state/import.ts` + the post-parse backstop), **the
project file** (`state/projectFile.ts` — the strongest ingress in the tree; see the verified
controls), the worker protocols (`workers/*Protocol.ts`, guarded by `jobContract.test.ts`),
`src/config/printers.json`, the locale files.
**S11.1 — precondition met** (the app serves `en`, `ja`, `zh-Hant`) **and no site**: 0 hits for
`substr` or `replaceAll` in `src/`; the one subset tool (`scripts/gen-fonts-css.mjs`, guarded by
`ui/japaneseSubset.test.ts`) works on code points; a JS codebase has no byte-mode regex.

**S12 — cascade, partial failure, retry storm.** Swept, 0 new findings; covered by the 2026-11-09
walk §6b (G1, G5) and re-read here: per-job timeouts (`ANALYSIS_TIMEOUT_MS` 10 min,
`IMPORT_TIMEOUT_MS`, `DENTURE_TIMEOUT_MS`), `WorkerTask.restart` nulls `onmessage` so a late reply
lands nowhere (walk `r3`), the export's partial-write record (walk `r1`), one `AbortController` per
drop. **S12.2: `no sites on the map`** — there is no cache in front of a store; the only caches are
the thumbnail bitmaps (pruned with the scene) and the worker's remesh, both per-session.

**S13 — orphan capability.** **3 findings (MIXO-09, MIXO-10, MIXO-11)**, one per orphan. Previously
recorded orphans re-read and still recorded, so not re-filed: `items/rowState.ts`
`verdictOfRepair` / `offersRepair` and the repair rail (named in `src/items/README.md` and the
2026-11-09 review), and the printer-profile seam.
**S13.1:** `scripts/real-scan-gate.mjs:21` `SETS` is a hand-written map of three fixture folders
beside a `dentalwork/fixtures/` that holds four. The fourth, `case-001`, is a copy of the public
reference aligner already covered by the suite (`dentalwork/fixtures/README.md` says so) —
**checked, not a finding**, and named as LOW debt because nothing would notice a fifth.

**S14 — scope shadow.** This run is whole-repository at Screen depth. **Not walked this run**, named
rather than omitted: the denture flow's own screens (last walked 2026-11-02), the three locales at
narrow widths, the Blender-parity corpus (`tools/blender-parity/`, left as prior runs proved it),
`dentalwork/batch-review/` beyond the real-scan gate, and `vendor/mixo-geocore`'s internals, which
this repo consumes as built.

**S15 — the four-corner end-to-end walk.** Covered for the dental flow by the 2026-11-09 walk §4–§6b
and re-read, not re-derived. **This run reached the corner no earlier run did** — the external
record of truth. Table below.

**S16 — terminal-state accountability.** Covered by the 2026-11-09 walk §4 and its rule matrix;
re-read here (`JobActivity.view` still drops only rows whose outcome is not `failed`). **1 new
finding (MIXO-02)**: the print-angle confirm has a third outcome — *no angle held* — that reaches no
state and no screen.

**S17 — controls whose enforcement point is outside the system.** Swept, 0 findings, 3 off-system
decision points: **the browser's download** (`useExport.ts:131-139` — where the file lands, and
whether a second automatic download is allowed, is Chrome's decision; the code's claim is narrowed
to what it "managed to hand over", with the trap written at the line); **the slicer** (what the STL
means — see S24); **the OS file picker**. No local setting claims to constrain any of them, which is
this sweep's "and that is fine" branch.

**S18 — enumeration against the authority.** Two authorities on disk, one enumerated: **Blender
SLASG** (`docs/BLENDER_PARITY.md`; 19 recorded cases in `tools/blender-parity/` replayed by
`src/supports/blenderCases.test.ts`) — a genuine independent-producer authority, read and left as
prior runs proved it; **the glTF 2.0 specification** — one cell `UNVERIFIED`, see S4. STL has no
vendor manual: its authority here is the 24-file corpus plus an independent parser (S24).
Re-walks triggered by findings this run: 1 (MIXO-10/11's class — every `export` with no caller was
re-grepped across the whole tree, not only the three the scanner named).

**S19 — environment-constraint reconciliation.** **2 findings (MIXO-03, and MIXO-02's sibling
MIXO-04).** Table on line 2c.

**S20 — liveness of the safety net.** **2 findings (MIXO-05, MIXO-07).** Table on line 2d.

**S21 — the suite is an instrument too.** Swept, **1 finding (MIXO-12)**, and **one reading of mine
disproved by its own forgery**. Line below.

**S22 — surface completeness.** **2 findings (MIXO-04, MIXO-06).** Censuses on lines 2e and 2f.
**S22.9:** all **56** `<button>` sites in non-test `.tsx` read; 10 carry no handler in their open
tag and every one is accounted for — 9 are the style book's deliberately inert sample rows
(`kit/Catalogue.tsx:107-119`) and 1 is a disabled label with a hint (`SettingsPanel.tsx:300`,
`Custom`). `data-action` is not a convention here (0 hits): `no sites on the map`.

**S23 — sequence and event flow.** Covered by the 2026-11-09 walk §6/§6b: every external arrival is
a worker reply or a file, and duplicate (`q5`, six replies redelivered), out-of-order (`r2`, the
newer released first), late (`r3`, `r5`), missing (`r4`) and malformed (`r6`, `r6b`) each have an
artefact. Re-read; no new arrival kind has appeared since.

**S24 — contract tests at every boundary.** **1 finding (MIXO-13)**, and **one boundary upgraded
from class (b) to class (e) by this run**. Line below.

### S15 — the four-corner table for the export, the flow this run added

| State | The requester sees | The operator sees and can do | The executor believes | The external record |
|---|---|---|---|---|
| supports built, not exported | the viewport's supports; the rail's Supports tile | the row, the Problems list | `built` holds the mesh for this unit **and this revision** | nothing yet |
| export refused — supports planted before a turn | the status line **and** the activity row: *"the supports on {name} were planted before the model was turned…"* | the same two surfaces; regenerate | `supportsNeedReplanting(unit.revisions)` is true | **nothing written** — refused before the job starts (`useExport.ts:90-93`) |
| export written | the status line names the files and the support count | the activity row | `outcome.files` | **the file on disk**: 408,308 triangles, z −0.000001 … 43.192, winding consistent, signed volume +8202.3 mm³ — read by **trimesh**, not by us |
| export written part way | *"{saved} was saved; {refused} was not"* | the same, on both surfaces | `saved` names what was handed over | the files that landed (W-11's fix) |

`S15 — walked 1 flow × 4 states; 0 disagreements, 0 unanswerable states, 0 reachability findings.
· runtime: 1 ladder run (the export, through the app's own button in a real browser), 1 of 9
adversarial rows (the partial write, from the prior run's `r1`); 4 of 4 corner cells proved by
artefact for the written state.`

### S21 — the suite as an instrument

`S21 — 1589 tests / assertions not separately counted by this runner; 1 vacuous-pass risk found
(MIXO-12); 0 tests mutate the runner environment without restoring it (checked by hand, the
scanner agreed); 0 secrets reachable in failure output (the repo holds no secret: no `.env`, no
`.env.example`, and the real scans are git-ignored patient data named only by a truncated hash);
1 of 1 external protocols pinned to a counterpart-published vector (Blender, 19 cases) — **and
from tonight a second: the exported STL against trimesh**; 0 assertions found that pin a defect;
fault-injection tests proving the fault arrived: 11 of 11 (every walk probe reports the counts of
its own injection — `q5` "6 replies redelivered", `r4` "every orient answer swallowed"); claims
checked against their assertions: 6, 0 drifting; textual guards with written limits: 2 of 58
(`art.test.ts` and `icons.test.ts` write theirs down; the other 56 do not — MIXO-12);
1 unfalsifiable-assertion/default risk examined and cleared (`nextThumbnailToDraw`'s cache lookup,
now fixed); shared mechanisms quoted as call sites over population: the 58 guards are each their
own call site.`

**The reading this run got wrong, recorded because the doctrine asks for it.** I expected the
~20 guards that read source through `import.meta.glob(..., '?raw')` to be able to pass on stale
text, because this repo has that exact failure written down — `src/ui/art.test.ts:14` says the
mechanism *"served a forged file's previous contents while the real one was broken"*, and only
`art.test.ts` and `icons.test.ts` were moved to `readFileSync`. I was about to file it as a HIGH
class finding across `threeBoundary`, `importOracleBoundary`, `noBrandNames`, `cssTokens`, `i18n`
and the rest. **The forgery disproved it**: a colour literal planted in `src/ui/theme.ts` was
caught immediately and by name —
`src/ui/theme.ts:66: export const FORGED_COLOUR = "#ff00aa"` — in an ordinary `vitest run` after a
previous full run. So the stale read needs a narrower condition than "the guard uses the glob", and
the finding is **withdrawn**; what is left is MIXO-12, which is about written limits, not staleness.

**And the trap this project already knows bit the auditor.** My first probe command ended
`… | tail -25; echo "vitest exit: $?"` and printed `vitest exit: 0` over a run that had failed —
`tail`'s status, exactly the trap `docs/HANDOFF.md` and the project memory warn about. Every gate
result in this report was taken from a file, with `$?` read on the line that produced it.

### S24 — contract tests at the boundaries

`S24 — 8 boundaries (4 inbound, 2 outbound, 2 internal); primary-path boundaries below class c: 1
before tonight, 0 after; internal at (a) on a state-writing path: 0; fixtures without version or
citation: the STL corpus (hand-written, no external authority exists for STL).`

| Boundary | Direction | Class before | Class now |
|---|---|---|---|
| binary / ASCII STL in | inbound | **c** — a 24-file adversarial corpus, plus walk `r6`/`r6b` | c |
| glTF / GLB in | inbound | b — our loader against three.js's | b (UNVERIFIED cell, S4) |
| `.mixodental` in | inbound | b — our writer against our reader | b, and correctly so: the format is ours alone |
| worker protocols | internal | c — `jobContract.test.ts` pins the shapes | c |
| the vendored engine ABI | internal | c — `geometry-wasm-smoke.mjs` against `HOST_GEOMETRY_VERSION` | c |
| support geometry | outbound | **d** — 19 recorded Blender cases replayed | d |
| **the exported STL** | **outbound** | **b** — `export.test.ts` *"writes STL Z-up and reads it back Y-up unchanged"*: our writer against our reader, S21's self-consistent codec | **e** — tonight's own export read by **trimesh 4.8.1** |
| the `.stl` a slicer opens | outbound | b | **e**, with the caveat that trimesh is a library and not a slicer |

**MIXO-13** is that the project's own suite still has no such test: the upgrade above is this
audit's artefact, not a guard the repo will run again tomorrow.

---

## 2c — S19 host-capability table

The product has no server, so the host is GitHub Pages (static files) and **the browser is the real
target environment**.

| # | Requirement (who imposes it) | GitHub Pages | Chrome/Edge ≥ 92, Firefox ≥ 95 | Safari/iOS ≥ 15.4 | Safari/iOS ≤ 15.3, or no WebGL2 |
|---|---|---|---|---|---|
| R1 | **WebGL2** — three.js r173 via `@react-three/fiber`, `components/ObjectViewport.tsx:107` | n/a | satisfied | satisfied | **NOT SATISFIED → MIXO-04, proved** |
| R2 | **WebAssembly, no threads** — `pkg-browser/mixo_geometry_wasm_bg.wasm`, 2.81 MB | satisfied | satisfied | satisfied | satisfied |
| R3 | **Cross-origin isolation (COOP/COEP)** — *not required*: 0 hits for `SharedArrayBuffer`, `Atomics`, `crossOriginIsolated` in the glue, and no `shared` memory in the binary | **satisfied by not being needed — the row that would otherwise have blocked a Pages launch**, since Pages cannot set headers | satisfied | satisfied | satisfied |
| R4 | **Module workers** (`workers/factories.ts:12-16`) | n/a | satisfied | satisfied | not satisfied below Safari 15 |
| R5 | **`crypto.randomUUID`** — `useImportFiles.ts:228`, `useSupportEdits.ts:67,79`, no fallback | n/a | satisfied | satisfied (15.4) | **NOT SATISFIED → MIXO-03** |
| R6 | **`Object.hasOwn`** (1 site), **`Array.prototype.at`** (6, incl. `App.tsx:228` on the render path) | n/a | satisfied | satisfied (15.4) | **NOT SATISFIED → MIXO-03** |
| R7 | **`requestIdleCallback`** — `viewport/supportLayers.tsx:123` | n/a | satisfied | not satisfied, **guarded**: `idle ? requestIdleCallback(…) : setTimeout(slice, 20)` | guarded |
| R8 | **`performance.memory` / `navigator.deviceMemory`** — the import memory cap | n/a | satisfied (Chrome) | not satisfied → a declared 1 GiB fallback (`budget.ts:99`) | same |
| R9 | **`CompressionStream`** — project save/open, `state/projectFile.ts:52` | n/a | satisfied | satisfied | not satisfied, **guarded**: `canGzip` writes plain JSON and refuses a gzipped file by name |
| R10 | **Several automatic downloads from one gesture** — `useExport.ts:131` | n/a | **not satisfied** (Chrome refuses) — handled by the partial-write report | unknown | unknown |
| R11 | **A secure context** (R5 needs one) | satisfied (https) | satisfied | satisfied | satisfied |

`2c — 11 dependency requirements × 4 target environments = 44 cells; satisfied/not-satisfied/unknown
= 31 / 8 / 2 (3 n/a by design).`
Citations: `crypto.randomUUID` and `Object.hasOwn` first ship in Safari 15.4 (MDN and caniuse, read
2026-11-11). `Array.prototype.at`'s Safari figure was not returned by that search and is the
auditor's knowledge — marked INFERRED.

## 2d — S20 detector table

| # | Detector | Reports coverage? | Liveness signal something reads | Reaches a human surface | Verdict |
|---|---|---|---|---|---|
| D1 | `npm test` (217 files / 1589 tests) | yes — counts and skips | none | the person running it | MIXO-05 |
| D2 | `npm run build` | exit code | none | the person running it | MIXO-05 |
| D3 | `npm run walk` (186 checks) | yes — per check, and it names unfinished sections | none | the person running it | MIXO-05 |
| D4 | `npm run gate:real` (13 scans) | yes — `ran N scan(s)`; a baseline case that did not run **is a difference** | **none, and it exits 0 when it finds no scans** | the person running it | **MIXO-07** |
| D5 | `npm run wasm:test` | yes — prints what it verified (since `c715de8`) | none | the person running it | MIXO-05 |
| D6 | `npm run check:duplicates` | yes — `440 src against 110 vendored` | none | the person running it | MIXO-05 |
| D7 | `npm run screens` | yes — the count | none | the person running it | MIXO-05 |
| D8 | the 58 source-reading guards | each names its own sites on failure | they ride on D1 | D1's runner | MIXO-12 |
| D9 | `.github/workflows/ci.yml` | yes, per job | **GitHub's own run history — the only liveness record here** | the owner's mail, the Actions page | **MIXO-05: no run on the audited commit** |
| D10 | the product's own detectors: the support check, the export gate (4 refusals), the plate ledger, the import diagnosis | yes — per unit, tied to the unit version **and** the build | n/a (synchronous) | the Problems list, the status line, the activity list | **covered** |
| D11 | the background-work list (`JobActivity`) | it never drops a failed row | n/a | mounted on both the deck and the workspace since `873b923` | **covered** |

`2d — 11 detectors; 9 report coverage separately from findings; 1 has a liveness signal something
reads; 3 escalate to a human surface; outermost check: NONE.`

## 2e — S22.10 redraw census

`2e — 12 re-render triggers (1 `setInterval` in `JobActivity.tsx:83` at 250 ms, 2 `requestAnimationFrame`
loops in `viewport/useScreenBrush.ts` and `denture/engine/liveTilt.ts`, 1 idle slicer in
`viewport/supportLayers.tsx:123`, and 8 debounce timers) × 6 in-flight states the redrawn regions
can hold (job percent, stage, cancelling, the Cancel/Dismiss buttons, the live announcement, a
paint stroke) = 72 pairs; **drawn from a live source: all of them**, 0 findings. `JobActivity`
re-renders through `useReducer` and reads every row from `activity.view()` — the registry that
holds the in-flight state — with rows keyed by `row.id`, and the two refs that must survive
(`announced`, `lastAnnouncement`) are refs. Step 4 (g): **0 long-running controls activated this
run**; the 2026-11-09 walk's `r4` held one across ~80 ticks of that 250 ms interval, which is the
≥2-cycle test, and tonight's full walk re-ran it.`

## 2f — S22.11 vocabulary census

`2f — ~17 user-visible nouns across 3 surfaces (the deck's rail, the step badge, the status line)
for 4 things; 3 things carry more than one name; **2 names cover more than one thing**; 0 messages
point at a name no screen shows.`

The two to decide on, both LOW (**MIXO-14**): **"Step 1"** is both the orientation stage and the
rim-define mode (`DentalBar.tsx:114` draws `Step 1 · Define the rim`), while the rail lists Rim as
the *second* of four tools; and **"Supports"** is a rail tool, `Step 3 · Supports` for an aligner,
`Step 2 · Supports` for a denture (`DentalBar.tsx:124`) and the support meshes themselves. The rail's
own comment says *"the rail is where the operator learns the four steps"* while the badge counts
three. Numbering the rail, or dropping the numbers from the badge, is a design decision and is
reported rather than taken.

## 2g — S19.3 parity matrix

| Environment | Engine / runtime | Privileges | Secrets | Suites RAN |
|---|---|---|---|---|
| this machine (Windows 11, node 22.15.1) | the vendored WASM engine 63 + Chromium (SwiftShader) | full | none exist | **tsc, vitest (1588/1 skipped), duplicates, screens, build, wasm:test, gate:real (13), walk (185/1)** — every count in this report |
| GitHub Actions `ubuntu-24.04` | node 22, Chromium via `playwright-core` | CI default | none needed | **NOT RUN on `41f8d7f`** (CI fires on a `milestone-*` tag or a dispatch) |
| the user's browser | WebGL2 + WASM, per 2c | n/a | n/a | the walk's own Chromium only — **no Safari, no Firefox, no mobile: NOT RUN** |

`2g — 3 environments × 8 suites; RAN 8 / NOT RUN 16; engines run: the vendored WASM engine on
Chromium, of the engines the deploy target names (every browser engine); restricted-account run:
n/a (no database, no account); secrets-absent run: n/a (the repo holds no secret).`
**The third row is MIXO-03's other half**: every count in this report is evidence about Chromium.

## 2h — S19.4 migration drill

`2h — move stated: none. The product has no server and no database; the only stated move is the
mixomesh port, which is a code move and not a data migration. N/A with the map row that proves it:
the only persistence is the user's own `.mixodental` file, written and read by the same version.`

---

## Findings

### MIXO-01 — the memory cap is checked on the guess and never on the answer
**Severity: MEDIUM · Confidence: CONFIRMED (code) · VSM 5 (policy default) · Domain: Persistence &
Recovery · Class: boundary schema drift (S11) / fail-open (S3) · Boundary: `core/import/estimate.ts`
(pre-parse estimate) → `components/useImportFiles.ts:181-201` (the three capacity asserts)**

**Invariant.** No import may plan for more memory than the device can give the editor
(`budget.ts`'s whole purpose, and the owner's own rule: *plan for lowest peak memory; print files
are huge*).

**Evidence.** `assertMemoryCapacity` has exactly **one** call site, `useImportFiles.ts:183`, inside
`if (estimate)`. After the file is read, line 200 counts the triangles for real and line 201
re-asserts **plate** capacity only; line 196 re-asserts **triangle** capacity for glTF. Memory is
the one of the three that is never re-asserted. And `estimate` is null for a `.gltf` over 16 MB
(`GLTF_ESTIMATE_BYTES`), a `.glb` whose JSON chunk is over 64 MB, or a damaged header — in which
case the glTF branch does `await file.arrayBuffer()` and `new GLTFLoader().parse(data)` on the main
thread **before any capacity check at all**. The project file has the same gap from the other side:
`state/projectFile.ts:88` caps by bytes (`triangleLimit × 100` = 600 MB) and consults no memory
budget.

**Observed.** Three capacity rules, two re-asserted after the read and one not; nothing says why.

**Failure scenario.** On a device where the cap binds — `memoryCapBytes` returns 1 GiB when the
browser reports nothing, or half of `navigator.deviceMemory` on a small phone — an ASCII STL whose
head sampled short, or a 20 MB `.gltf`, is admitted past a memory limit that was never re-checked
against its true size. The next Generate is the step `budget.ts`'s own comment says *"stopped the
tab at about 6.5 GB"*, and a stopped tab takes the unsaved scene.

**Impact.** Narrow but real: it needs a device whose cap binds below the 6M triangle cap (a heap
limit under ~403 MB) **and** a file with no exact estimate. The loss is the session's work.

**Fix.** One line beside the plate hold at `useImportFiles.ts:201`:
`assertMemoryCapacity(file.name, adding, RUNTIME, memoryCap);` — and, for the glTF branch, assert a
size-derived bound before `file.arrayBuffer()`.
**Verification.** A unit test over the three asserts with an estimate of `null`, asserting the
memory refusal still fires from the counted triangles.

### MIXO-02 — the print-angle confirm cannot say no
**Severity: HIGH · Confidence: CONFIRMED (code; no runtime artefact) · VSM 1 → 3 · Domain: State
Management · Class: fail-open default (S3), silent death of the work (S16), unrendered surface
(S22) · Boundary: `workers/analysisWorker.ts:40` (`confirmPick`) → `components/useDentalFlow.ts:398-409`**

**Invariant.** A step that exists to *prove* the chosen print angle builds supports that hold must
not report the same thing when it proves the opposite.

**Evidence.** `dental/confirmTilt.ts:66-72` returns `{ confirmed: undefined }` when **no** rotation
in the tried set produces a build that holds (`confirmHolds`: not blocked, no unresolved island, no
rim gap needing review). In `useDentalFlow.ts`: `settled(undefined)` returns `true` (line 398);
`moved` is then `undefined` (line 408); and `accept(undefined)` (line 409) is **byte-for-byte the
call made when `confirmed === 0`**, i.e. when the first pick was confirmed. The rejected-promise
path is the same: `() => { if (settled(undefined)) accept(); }` (line 410).

**Observed.** Three outcomes — *the pick holds*, *no angle holds*, *the check crashed* — produce one
screen: the status line's *"Checking the print angle…"* is replaced and Step 2 opens.

**Failure scenario.** An operator orients an arch whose every scanned tilt leaves an unresolved
island. Step 1 says nothing, Step 2 opens, they paint an area and build supports on an angle the app
privately judged unusable. The news arrives later, if at all, from the Step 3 check or an export
refusal — after the work.

**Impact.** The print angle is what the product claims to get right (*"a scan of tilts picks a print
angle with no resin traps, no long gaps and no support crossing the aligner"* — README). This is the
one place the app knows that claim failed for this model and does not say so. Not CRITICAL: the
later support check and the export gate would notice, so it is detectable downstream.

**Fix.** Give `accept()` a third case. `acceptDentalOrientation` already carries an optional
`angleMovedDeg` and Step 2 already renders a moved-angle notice, so the channel exists; it needs a
value for *unconfirmed* and one sentence in three locales.
**Verification.** A walk probe with a lever that forces `confirmPick` to answer `undefined`,
asserting Step 2 opens carrying the notice; plus a unit test on the `settled`/`accept` pair.

### MIXO-03 — the browser floor is neither declared nor crossed
**Severity: MEDIUM · Confidence: CONFIRMED (code) + cited (MDN/caniuse) · VSM 4 · Domain: API
contracts · Class: environment constraint never crossed (S19)**

**Invariant.** What the code needs from a browser and what the build says it supports are the same
set.

**Evidence.** No `browserslist`, no `.browserslistrc`, no `build.target` in `vite.config.ts`, so
Vite's default `'modules'` target applies — Chrome 87 / Safari 14. The source needs Safari **15.4**:
`crypto.randomUUID` (`useImportFiles.ts:228`, `useSupportEdits.ts:67,79`), `Object.hasOwn` (1 site)
and `Array.prototype.at` (6, including `App.tsx:228` on the render path). esbuild lowers *syntax*,
never these APIs.

**Failure scenario.** On iOS 15.0–15.3 the start screen draws, the operator drops a file, and
`crypto.randomUUID` throws inside `importFiles` — caught, so they get "import failed" and can do
nothing else, for a reason the app never names. Below Safari 15 the module workers do not load
either.

**Impact.** Against a README that says *"It runs in the browser on Windows, macOS, Linux, ChromeOS,
tablets and phones. Open the link and start."*

**Fix.** Decide the floor, then say it twice: `build.target` (or a `browserslist`) set to what the
code needs, and one line in the README. A two-line `randomUUID` fallback would lower it again if the
owner wants those devices.
**Verification.** A test that the three APIs are either absent from `src/` or polyfilled; `vite
build` with the declared target.

### MIXO-04 — a browser with no WebGL2 empties the page
**Severity: HIGH · Confidence: CONFIRMED (artefact) · VSM 1 → operator · Domain: UI/UX · Class:
unrendered / undesigned surface (S22) · Boundary: `components/ObjectViewport.tsx:107` (`<Canvas>`) →
the operator's screen**

**Invariant.** Every way the app can fail has a face (S22's own sentence).

**Evidence.** `grep -rniE "componentDidCatch|ErrorBoundary|window.onerror|addEventListener\('error'|unhandledrejection"`
over `src/`, `index.html` and `kit.html`: **zero hits**. `index.html` is a bare `<div id="root">`
with no `<noscript>` and no fallback. There is no WebGL capability check anywhere (0 hits for
`webgl2`, `isWebGL2Available`, `webglcontextlost`).

**Observed (proved).** `artefacts/2026-11-11-screen/probe-nogl.mjs` loads the real app twice through
a real browser, once with `getContext('webgl*')` returning null. Control pass: start screen renders,
"Any model" pressed, cube dropped, **1 canvas, 0 console errors, 0 page errors**, the editor on
screen. Blocked pass: the start screen renders, "Any model" is pressed, and the page becomes
**`rootChildren: 0`, `canvases: 0`, `text: ""`** — a blank white screen — with two uncaught
`Error creating WebGL context.` and React's *"The above error occurred in the
`<ForwardRef(Canvas)>` component"* in a console no user opens.
Artefacts: `probe-nogl.json`, `nogl-blocked.png` (blank), `nogl-control.png`.

**Failure scenario.** Any device without a usable WebGL2 context — an old tablet, a blacklisted
driver, a hardened browser — reaches a dead white page on the first button, having been told the app
"runs on tablets and phones".

**Impact (INFERRED beyond the artefact).** The same mechanism applies mid-session: React unmounts
the tree on any uncaught render error, so a lost GPU context or a render-time throw takes the
operator's unsaved scene with no message and no save prompt (`beforeunload` fires on navigation, not
on this).

**Fix.** Two small pieces, both needing copy the owner should choose: a root error boundary that
keeps the shell, says what happened and offers Save project; and a capability check before the
workspace mounts, so an unsupported device is told on the start screen rather than after a click.
**Verification.** `probe-nogl.mjs` becomes a walk check: the blocked pass must find a heading and a
sentence, never an empty `#root`.

### MIXO-05 — nothing outside the person running it can tell a gated revision from an ungated one
**Severity: MEDIUM · Confidence: CONFIRMED · VSM 3\* · Class: dead watchdog / unread CI (S20, S20.6)**

**Invariant.** A green report means an instrument looked.

**Evidence.** `gh run list --commit 41f8d7f` → `[]`: **no CI run on the audited commit.** The
workflow fires only on a `milestone-*` tag or a dispatch, which is a recorded owner decision
(`ci.yml`, 2026-11-02) whose premise is *"Every day-to-day push is checked locally with the full
test set instead."* There are **no git hooks at all** (`.git/hooks` is empty), nothing records which
commands ran on a commit, and the project's own record — the handoff — lists for `41f8d7f` only
`tsc / vitest / build / duplicates`, not the walk, `gate:real`, `screens` or `wasm:test`. Two CI
runs on 2026-11-09 are red (`ec8fad3`, `5ff7450`) and were superseded by green dispatched runs the
same day.

**Why this is filed and the decision is not.** The decision is the owner's and its premise is
sound; what is missing is that the premise is unenforced and unrecorded, so the gap between "the
full local set" and "the four commands that get typed" is invisible. **This run closed it for this
commit**: every command in 2g ran on `41f8d7f`, with its exit code.

**Fix.** The cheapest honest version: one script (`npm run gate`) that runs the set `SHIP-PLAN.md`
§Ship names and writes its results, counts and the HEAD sha to a file the handoff quotes. Then "the
gate ran" is a fact, not a memory.

### MIXO-06 — "Any model" and "Open a saved project" throw away the files the screen just counted
**Severity: MEDIUM · Confidence: CONFIRMED (code) · VSM 3 → 1 · Class: dead control (S5),
confirmation that lies (journey-map T2) · Boundary: `components/StartScreen.tsx:152-163` → `App.tsx:1385`**

**Invariant.** A screen that says files are ready does not discard them unannounced.

**Evidence.** Drop several models on the Drop page and `StartScreen.tsx:152` renders
*"{n} files ready. Choose what you are making."* Of the four choices beneath it, `Aligner` and
`Denture` call `choose(id)`, which calls `claimHeld()` and imports the batch. **`Any model`
(`:161`) calls `onAnyModel` → `App.tsx:1385` `setStartScreen(null)`, and `Open a saved project`
(`:163`) calls `runCommand('project.open')` — neither touches `claimHeld`.** The start screen
unmounts and the held files go with it.

**Failure scenario.** An operator drops a case of eight, reads "8 files ready", presses "Any model"
because these are not aligners, and lands in an empty workspace: 0 objects, no message, nothing to
undo. They cannot tell whether the drop failed or the button did.

**Impact.** Nothing is destroyed on disk; the cost is a silent no-op at the app's front door, at the
moment the operator has just selected a case. The 2026-11-09 map lists this as a GAP marked
*"relayed — not yet verified"*; it is verified here.

**Fix.** An owner decision about behaviour, so it is proposed rather than taken: "Any model" should
claim the batch and import it as plain models (it is the one purpose that needs no detection), and
"Open a saved project" should either refuse while files are held or say it is dropping them.
**Verification.** A walk check: hold three files, press Any model, assert 3 objects on the plate.

### MIXO-07 — `gate:real` exits 0 when it has nothing to verify
**Severity: MEDIUM · Confidence: CONFIRMED · VSM 3\* · Class: blind instrument (S20)**

**Invariant.** A check that examined nothing does not report like a check that examined everything.

**Evidence.** `scripts/real-scan-gate.mjs:44`:
`if (scans.length === 0) { console.log('real-scan gate: skipped, no local scans (dentalwork/fixtures/case-*).'); process.exit(0); }` —
before the baseline is read. The committed baseline names **13 cases**, and `compareRuns` treats a
baseline case that did not run as a difference (line 46) — but that code is never reached on the
blind path. So on CI, on a fresh clone, or on a machine whose git-ignored patient fixtures are
missing, the owner's engine-change gate prints one line and exits **0**.

**Impact.** The owner's standing rule is *"every engine change runs all local real scans"*. On every
machine but this one that rule is satisfied by a gate that ran nothing. The text does say "skipped",
so a human reading the output can tell; the exit code — which is what a chain reads — cannot.

**Fix.** Move the early exit below the baseline read, and exit 1 (or print `0 of 13 baseline cases
ran`) when a baseline with cases in scope exists and no scan was found.

### MIXO-08 — the deepest verification tier is absent everywhere but one laptop, and nothing says how much
**Severity: MEDIUM · Confidence: CONFIRMED · VSM 3\* · Class: vacuous pass (S7)**

**Evidence.** Seven `describe.skipIf` gates (sites on the S7 line) plus `gate:real` all stand on
`dentalwork/fixtures/`, which is git-ignored patient data. On CI they all skip and `npm test` prints
a green line; nothing compares the skip count against an expected number, which is this sweep's
whole rule (`Skipped: N` is reported as *N unverified*).

**Fix.** One assertion: given the fixtures present, the number of real-scan suites that ran is the
number that should have. Even a printed line — *"real-scan tier: 0 of 8 ran (fixtures absent)"* —
would make the absence visible where it currently is not.

### MIXO-09 — the ship plan names production code that is a test helper, and one symbol that does not exist
**Severity: LOW · Confidence: CONFIRMED · VSM 3 → 1 · Class: designed-but-unbuilt (S13c), the plan
as a scope claim (S14.1) · Site: `docs/SHIP-PLAN.md:191`**

**Evidence.** The U6a row, marked `done`, says: *"production TS left: adapters, `DentalRim` /
`rimContainsPoint` / `DentalOpeningRaycaster`, stamp face gate (U7/U8)"*. Across the whole tree:
`DentalOpeningRaycaster` **does not exist**; `rimContainsPoint` exists once, at
`scripts/test-support/dentalExpect.ts:43`, in test support, **with no caller anywhere**.

**Impact.** The document the project steers by tells the next reader that a dental rim predicate is
still carried in TypeScript production code. It is not. Cheap to correct, and the owner's own rule
is that every affected `.md` moves with the code.

### MIXO-10 — `pointerRecord` has no caller
**Severity: LOW · Confidence: CONFIRMED · VSM 1 ↔ 1 · Class: orphan capability (S13) · Site:
`src/components/viewport/viewportPort.ts:89`**

The file is the declared three.js implementation of the shared editing seam
(`editing/ViewportPort`, D22) — the seam the mixomesh port depends on. `pointerRecord` converts a
DOM `PointerEvent` into the shared `PointerRecord`, and **nothing calls it**: the app's own pointer
handling does not go through the shared record, only picking does. Half a seam, and `noUnusedLocals`
cannot see an unused `export`, which is why the compiler is silent. Either wire the pointer path
through it or delete it with a line in the folder's README; both are the owner's call because the
seam is a stated goal.

### MIXO-11 — `bookkeepingSnapshot` has no caller
**Severity: LOW · Confidence: CONFIRMED · VSM 3\* · Class: orphan capability (S13) · Site:
`scripts/test-support/genericCases.ts:59`**

A parity snapshot of the ID and manual-edit bookkeeping *"for the fixed inputs above (one
implementation at a time)"* — the shape of a TS-against-Rust parity check. Nothing calls it, so the
parity it was written for is not being checked by anything. A proof with no obligation behind it
(`evidence.md` §E3).

### MIXO-12 — 56 of 58 source-reading guards have no written limits
**Severity: MEDIUM · Confidence: CONFIRMED · VSM 3\* · Class: a textual guard with no written limits
(S21 shape 11)**

**Evidence.** The repo leans hard on guards that match source text — `threeBoundary.test.ts`,
`importOracleBoundary.test.ts`, `deckBoundary.test.ts`, `noBrandNames.test.ts`,
`noColourLiterals.test.ts`, `cssTokens.test.ts`, `i18n.test.ts`, `uiStylingDoc.test.ts`,
`core/imports.test.ts`, `commandWiring.test.ts` and ~48 more. Two of them —
`src/ui/art.test.ts:14` and `src/ui/icons.test.ts:13` — write down why they read from disk rather
than through the glob. The rest write down nothing about what they cannot see.
Worked example: `threeBoundary.test.ts:17`'s `THREE_IMPORT` matches only a static
`import … from 'three…'`. A dynamic `await import('three')`, a `require`, or a re-export through
another module passes it — and the thing it guards is the portability boundary the mixomesh port
rests on, which nothing else checks. It does carry the anti-vacuity test this sweep asks for
("scans the app sources"), which is why this is MEDIUM and not higher.

**Fix.** Per guard, one comment naming the evasions it does not catch, and for the boundary guards a
data-provider case per evasion marked caught-with-proof or knowingly-not-caught-with-reason.
**Note:** my stronger hypothesis about these guards — that they can pass on stale text — was
**disproved by forgery** and is withdrawn; see the S21 line.

### MIXO-13 — the product's one deliverable has no contract test against anything outside itself
**Severity: MEDIUM · Confidence: CONFIRMED · VSM 3\* → 4 · Class: self-agreeing fake (S24, S21
shape 5) · Site: `src/supports/export.test.ts:102`**

The test is named *"writes STL Z-up and reads it back Y-up unchanged"* — our writer against our
reader. It cannot see the one thing that matters at that boundary: whether the file means to a
slicer what it means to us. The swap at `vendor/.../supports/export.ts:77`, `(x, y, z) → (x, -z, y)`,
is a rotation and not a reflection, so the winding survives — **and this run proved it from outside**
(see S24). What is missing is that the proof lives in this audit and not in the suite.
**Fix.** `artefacts/2026-11-11-screen/verify-exported-stl.py` is eight assertions long; pointed at a
checked-in exported fixture it becomes a guard the project runs.

### MIXO-14 — two names cover two things each
**Severity: LOW · Confidence: CONFIRMED · Class: one thing, one name (S22.11)**
See line 2f. `DentalBar.tsx:114,124`, `deck/ToolRail.tsx:50-55`.

### MIXO-15 — four dependency advisories, all dev-only
**Severity: LOW · Confidence: CONFIRMED · Class: environment**
`npm audit`: 2 critical (`tinypool` prototype pollution → RCE), 2 moderate (`@vitest/mocker` path
traversal and code injection; `vite` `server.fs.deny` bypass). **All four are devDependencies**;
none reaches the shipped bundle, which is static files plus the WASM engine. `npm audit fix` takes
the `vite` one without a breaking change; the other three want `vitest@5`, a major bump.
**Not applied**: a bundler change the night before a human test is the owner's call.

---

## Fixed this run (committed, not pushed)

### MIXO-16 — the deck row's picture did not follow a rotation *(FIXED)*
**Severity: MEDIUM · Confidence: CONFIRMED · VSM 1 → operator · Class: stale snapshot (S1), UI
mismatch with backend state · Site: `src/items/thumbnail.ts:63`**

`nextThumbnailToDraw` compared `cache.get(unit.id)?.mesh !== unit.source` — **mesh identity alone** —
while `drawThumbnail(displayMesh(unit.source), unit.transform)` draws the model *as placed*, and the
module's own docstring says it must: *"A model the flow turned upright should look upright on its
row; framing the mesh in its own frame would undo exactly the work the row is reporting."* The deck
draws its pictures in tens of milliseconds as soon as it is on screen; the batch then orients one
row at a time, seconds each, writing a new `transform` to the same `source`. So on an ordinary case
of eight, **every row the batch turned kept its pre-orientation picture** while the line beneath it
read "Turned upright." and the rail called the orient step done.
**Fixed** by recording the rotation a picture was drawn at and comparing it by value (not by
identity: `transform/set` clones, so identity would redraw on a write that changed nothing; and only
rotation can change the picture, since the camera centres on the model's own box). Test written
first and watched to fail (`expected undefined to be 'a'`), plus a second test proving a row that
only *moved* is **not** redrawn.

### MIXO-17 — a stranded, unterminated docblock *(FIXED)*
**Severity: LOW · Confidence: CONFIRMED · Class: a docblock stranded above the wrong function (S21,
2026-10-13) · Site: `scripts/test-support/dentalExpect.ts:38-40`**

`/** Experimental aligner preset calibrated to the owner-approved, already-correct reference
pose.` was never closed, so it swallowed `rimContainsPoint`'s own description and ended up
documenting a preset that is no longer in the file — residue from a deletion. **Fixed** by removing
the stranded comment.
A tree-wide scan for the class found **1 real site and 10 false positives**, all ten being `/**`
inside the glob strings of the guard tests. The ratchet this class recommends is therefore
**proposed, not added**: a guard with a ten-to-one false-positive rate is S21 shape 14, the vacuous
failure that teaches an operator to ignore the instrument.

---

## Verified controls

Proved, so the next audit does not re-derive them.

| Control | Mechanism | Proof |
|---|---|---|
| **The exported STL is what a slicer expects** | `(x, y, z) → (x, -z, y)` is a rotation, not a reflection, so Z-up arrives with the winding intact | **trimesh 4.8.1** on tonight's own 408,308-triangle Step-3 export: header count matches, z −0.000001 … 43.192, winding consistent, signed volume **+8202.3 mm³**. `artefacts/2026-11-11-screen/verify-exported-stl.txt`; the file's sha256 and how to reproduce it are in `identity.txt` |
| **GitHub Pages cannot block this app** | no `SharedArrayBuffer`, no `Atomics`, no shared memory in the WASM binary, so no COOP/COEP headers are needed | grep over the glue + a byte scan of `mixo_geometry_wasm_bg.wasm` |
| **The project file cannot be used to hand the engine garbage** | header, integer version, forward-version refusal, structural check, **and `assertSoundMeshes`**: whole triangles, finite coordinates, every index inside the vertex count — plus a byte cap applied *before* parsing and a streaming inflate that stops at the ceiling, so a compressed bomb is refused before it is inflated | `state/projectFile.ts:16-96`, read in full |
| **A row's instruction cannot go stale** | `superseded` drops "No rim found. Draw one to continue." and the failure line once the unit has a closed rim draft, a dental or a denture policy | `items/ItemRow.tsx:47-48` — the 2026-11-08 F7 is closed |
| **Supports planted before a turn cannot be exported** | `supportsNeedReplanting(unit.revisions)` refuses **before** the job starts, with its own sentence on both surfaces | `components/useExport.ts:90-93`, `exportOutcomeText.ts:48` — the 2026-11-08 F5 is closed |
| **A device with no WebGL still gets a usable deck** | `drawThumbnail`'s rig is built once, `null` on failure, and a pictureless row is still recorded so the draw loop settles | `viewport/drawThumbnail.ts:35-50` |
| **The user's own Tips-only choice is never taken away** | below the plate the view turns tips on by itself and `belowChoice` still wins; while painting zones the button is `aria-disabled` **with a hint that says why** | `editing/view.ts` `tipsButton`, `App.tsx:1504` — the 2026-10-22 mixosupports class, applied |
| **A missing real scan fails the gate** | `compareRuns` files a baseline case that did not run as a difference | `scripts/real-scan-gate-lib.mjs:46` |
| **`npm run screens` is a gate, not a by-product** | it renders every designer-facing screen from fake data in seconds and CI runs it | 19 screens, exit 0 |

---

## Evidence ledger (§11a)

Reading never produces PASS. Authority is written `required / reached` on the ladder in
`evidence.md` §E2.

| Capability | Verdict | Authority | Evidence (artefact) | What it shows |
|---|---|---|---|---|
| Import an STL and place it | **PASS** | A3 / A3 | the walk, sections a/m/x | OBSERVED: files land, budgets refuse, refusals reach two surfaces |
| Import a glTF/GLB | **UNVERIFIED** | A3 / A0 | — | tier: not walked; the code path was read only |
| Detect orientation per row (the batch) | **PASS** | A3 / A3 | walk section m | OBSERVED |
| Draw / redraw a rim | **PASS** | A3 / A3 | walk section u (`u9b`, `u9c`) | OBSERVED |
| Paint and accept a support area | **PASS** | A3 / A3 | walk sections a (`c`, `d`), x | OBSERVED |
| **Confirm the print angle** | **FAIL** | A3 / A0 | MIXO-02 | the "no angle holds" branch is unreachable to the operator |
| Build supports | **PASS** | A3 / A3 | walk sections a, x; `gate:real` 13 scans | OBSERVED |
| Check supports | **PASS** | A2 / A3 | walk `x9b`; the suite | OBSERVED |
| **Export an STL** | **PASS** | A5 / **A5** | `artefacts/2026-11-11-screen/verify-exported-stl.txt`, with the file's sha256 and provenance in `identity.txt` | OBSERVED: a parser that is not ours agrees — the only A5 row in this report |
| Save and reopen a project | **PARTIAL** | A3 / A3 | walk section a (`knot.mixodental`, header and bytes read back) | happy path only; a damaged file's refusal is A1 (unit tests), not walked |
| Undo / redo across a step | **PASS** | A3 / A3 | walk sections a (`d2`, `f4`), u | OBSERVED |
| Arrange the plate | **PASS** | A3 / A3 | the walk | OBSERVED |
| Switch locale | **UNVERIFIED** | A3 / A0 | — | tier: `walk:locales` not run this session |
| Open the style book (`kit.html`) | **UNVERIFIED** | A3 / A0 | — | not walked; and it is **not in the production build** (dev server or `.stitch/screens` only, as `docs/handoff/human-test-2026-11-11.md` §4 already says) |
| **Run on a browser without WebGL2** | **FAIL** | A3 / A3 | `probe-nogl.json`, `nogl-blocked.png` | OBSERVED: blank page |
| Run on Safari / Firefox / mobile | **UNVERIFIED** | A3 / A0 | — | no engine but Chromium was exercised (2g) |

`9 — 16 capabilities: PASS 9 / FAIL 2 / PARTIAL 1 / UNVERIFIED 4 / UNPROVEN 0; every PASS cites an
artefact.`

---

## Obligations (§E3)

| ID | Statement | Source | Owner | Verifier | Status |
|---|---|---|---|---|---|
| `export.stl.slicer-readable@1` | The exported STL opens in a slicer in print position | README | `supports/export.ts` `encodeStl` | **this run's trimesh check** | **CLOSED** |
| `import.budget.no-oom@1` | No import plans for more memory than the device can give | owner ("memory first") | `useImportFiles.ts:181-201` | none for the counted-triangle case | **OPEN** (MIXO-01) |
| `dental.angle.confirmed@1` | The print angle Step 2 opens on is one whose supports hold | README, the flow's own design | `useDentalFlow.ts:398-409` | none | **FAILED** (MIXO-02) |
| `app.browser.says-no@1` | A device that cannot run the app is told so | README ("tablets and phones") | **no owner** | — | **OPEN, no owner** (MIXO-04) |
| `deck.row.three-statements-agree@1` | A row's picture, sentence and rail tile describe one orientation | `items/README.md`, `thumbnail.ts` | `thumbnail.ts` `nextThumbnailToDraw` | `thumbnail.test.ts` | **CLOSED this run** (MIXO-16) |
| `gate.real-scans.every-change@1` | Every engine change runs all local real scans | owner rule | `scripts/real-scan-gate.mjs` | the person who types it | **OPEN** (MIXO-05, MIXO-07) |
| `start.held-files.not-lost@1` | A drop the screen has counted is not discarded in silence | the screen's own sentence | `StartScreen.choose` **and** `onAnyModel` — **two owners** | none | **OPEN, two owners** (MIXO-06) |
| `port.mixomesh.seam-complete@1` | The editing seam carries everything a second host needs | owner rule | `viewportPort.ts` | `babylonContract.test.ts` | **OPEN** (MIXO-10) |

`10 — 8 obligations: CLOSED 2 / OPEN 5 / FAILED 1 / BLOCKED 0 / OUT-OF-SCOPE 0; no owner 1, two
owners 1, no verifier 4, below required authority 0; unowned behaviours 0.`

---

## Unknowns, contradictions, and what I expected

`11 — 4 unknowns, 1 contradiction, 0 truncated outputs re-run.`

| Unknown | Authority needed | Next evidence | Who |
|---|---|---|---|
| Does the app work on Safari 15.4+ at all? | A3 | open the deployed site in Safari and drop one STL | the owner (rung 5: no Safari here) |
| What does `Array.prototype.at` need in Safari? | A5 | caniuse's Safari column | the agent, next run |
| Is the glTF mode/accessor reading right per the spec? | A5 | the glTF 2.0 specification, §3.7.2 | the agent, next run |
| Does `kit.html` render correctly in the dev server today? | A3 | `npm run dev` + a walk of `/mixodental/kit.html` | the agent, next run |

**Contradiction (§E7).** `README.md:105` states *"CI runs on every push and pull request: Rust
tests, app tests, the production build and the browser walk. A push to `main` is deployed to GitHub
Pages only after the tests and the walk pass."* `.github/workflows/ci.yml` triggers on
`milestone-*` tags and `workflow_dispatch` only, and runs no Rust tests (*"The engine is vendored …
no Rust toolchain here"*). The workflow is the higher authority for its own behaviour, so the README
is a stale copy. It blocks no obligation, and it is the public document a contributor reads first.

**What I expected, and what the system did** — both of my wrong readings:

1. **I expected the glob-reading guards to be able to pass on stale text**, because this repo has
   that failure written down. A forgery planted in `src/ui/theme.ts` was caught instantly and by
   name. Finding withdrawn; the probe is why it never reached the list.
2. **I expected `case-001` to be a real-scan the gate silently omits.** It is a copy of the public
   reference aligner that the suite already covers, and `dentalwork/fixtures/README.md` says so.
   Checked before filing; not a finding.

**And one thing I changed by accident, reported because it is a change.** The forgery probe required
editing and restoring `src/ui/theme.ts`. `git checkout --` restores it in git's own worktree form,
which is CRLF here (`core.autocrlf=true`, the repo stores LF), while the copy I took before editing
was LF. The file's tracked content is identical to `HEAD` (`git diff` empty, sha matches the blob)
and the tree is clean; only the on-disk line endings of that one file differ from before I touched
it. No test depends on them (`noColourLiterals` is green on it). Worth knowing: in this clone, a
`git checkout --` of any source file rewrites its line endings, which is why
`src/goldens/__snapshots__/*.json` already carries an `eol=lf` pin.

---

## 12 — the wiring walk

`Wiring walk (wiring-walk.md): wiring question stated for this system: yes (the 2026-11-09 review's
§1, re-used unchanged — it is still the right sentence) · lifecycles mapped 12 (reference: spec and
the module READMEs only) · connections 12, gaps on Q1–Q7: 2 (the print-angle confirm has no Q6
operator screen and no Q7 connection test; the held-files control has no Q1 invocation from two of
its four callers) · faults G1–G7: 0 run this run of 7 applicable — all seven were injected on
2026-11-09 and re-read here, 6 recovered or visible, 1 handed to geocore (W-14) · findings by layer
L1/L2/L3: 1 / 6 / 3 · rule rows 12: covered 10 / gap 1 / n-a 1 · gap register:
docs/reviews/2026-11-09-wiring-walk-dental-flow.md §9, and this file's findings list.`

---

## Step 6 lines

1. **Fast lint + scope tests:** ✅ `npx tsc --noEmit` 0 · `npm run vendor:check` 0 · `npx vitest run`
   0 — **1588 passed, 1 skipped (1589), 217 files** · `npm run check:duplicates` 0 (440 src modules
   against 110 vendored). No linter is configured (`route.py`: `linter config=none`); `tsc` with
   `noUnusedLocals`/`noUnusedParameters` is the analyser, and its blind spot for unused **exports**
   is MIXO-10/11.
2. **/cia universal integrity:** ❌ **17 findings** — 2 HIGH, 9 MEDIUM, 6 LOW; 2 of them (1 MEDIUM,
   1 LOW) fixed and committed here. Commerce not detected, so `/ecommerce-cia` does not apply.
2b. **VSM map:** 40 components → Systems 1–5 / 3\*, 14 channels (table above).
2a. **Sweeps S1–S24:** all 24 lines above, each with its sites and a quoted line.
2c. **S19 host capability:** 11 requirements × 4 environments; satisfied/not/unknown = 31/8/2.
2d. **S20 detectors:** 11 detectors; 9 report coverage; 1 has a liveness signal something reads;
   3 reach a human surface; **outermost check: NONE.**
2e. **S22.10 redraw census:** 12 triggers × 6 in-flight states = 72 pairs; all drawn from a live
   source; 0 findings. Step 4 (g): 0 controls activated this run (prior artefact `r4`, ~80 cycles).
2f. **S22.11 vocabulary:** ~17 nouns across 3 surfaces; 4 things; 3 with >1 name; **2 names on >1
   thing**; 0 dangling pointers.
2g. **S19.3 parity:** 3 environments × 8 suites; RAN 8 / NOT RUN 16; one engine only (Chromium);
   restricted-account and secrets-absent runs n/a (no accounts, no secrets).
2h. **S19.4 migration:** no move stated — N/A with its map row.
3. **Full test suite in the canonical environment:** ✅ on HEAD `41f8d7f` — every command in 2g,
   each with its own exit code read from its own line. Plus `npm run screens` 0 (19 screens),
   `npm run build` 0, `npm run wasm:test` 0, `npm run gate:real` **PASS (13 scans, no differences)**,
   and the **full browser walk: 185 PASS, 1 FAIL (186 checks, 1863 s), exit 1** — the FAIL is
   `g-pre`, which names itself *"(precondition, not the app)"*. Its message this run:
   *"the UNTHROTTLED A stroke itself selected 0 of 423 on screen, so no throttle was ever the
   problem"*, which is a **fourth** distinct value for that baseline (0, 56, 4, 0 across four runs)
   and confirms the non-determinism `walk.mjs`'s comment now records. No tab crash: the walk ran
   with nothing beside it.
4. **Runtime walk:** ✅ the full walk above, plus 1 state-delta ladder (the export, front door),
   1 purpose-built fault probe (no WebGL2) with its control pass, and 1 independent-parser read of
   the product's output. 4 artefacts.
5. **Fixes applied autonomously: 2** — `src/items/thumbnail.ts` + `useThumbnails.ts` +
   `thumbnail.test.ts` (MIXO-16, the row picture, with a test watched to fail first) and
   `scripts/test-support/dentalExpect.ts` (MIXO-17, the stranded docblock). Each is its own commit,
   by explicit path, on `main`, **not pushed**. **Escalated: 15** — everything else in the findings
   list. The boundary that blocked each of the big ones: MIXO-02, MIXO-03, MIXO-04 and MIXO-06 all
   need **new user-facing copy in three locales or a change to the app's entry behaviour**, which is
   a design decision; MIXO-15 is a dependency bump before a human test; MIXO-09 edits the owner's
   own plan. **Guards the project should keep** (SKILL Step 5): the no-WebGL probe should become a
   walk check, and `verify-exported-stl.py` should become a suite test over a checked-in export.
6. **Tier: Screen — elapsed ~2 h 20 m (tier budget 2–4 h).**
7. **Skill score:** `cheap model: 2026-11-10 [fixture-editor / claude-sonnet-5-5] scored 9`.
8. **Runtime-walk receipt:** routes fetched — the app's single route, twice, plus the full 186-check
   walk · assets: all served by the dev server, 0 console errors and 0 warnings on the walk's own
   check, **0 external requests** · error-log delta: n/a (no server log; the browser console is the
   log, and it is clean on the control pass and carries exactly the two WebGL errors on the blocked
   one) · preview rows walked: none (the style book is not in the build — UNVERIFIED) · closed-loop
   actions: 2 walked (Any model → drop → workspace; export → file on disk), 0 ambiguous ·
   state-delta ladders: **1** (the export, read at the viewport, the status line and the file) ·
   concurrency probes: 0 new (the prior run's `q1`/`q4`/`q5` stand).
9. **Evidence ledger:** 16 capabilities — PASS 9 / FAIL 2 / PARTIAL 1 / UNVERIFIED 4 / UNPROVEN 0.
10. **Obligations:** 8 — CLOSED 2 / OPEN 5 / FAILED 1; no owner 1, two owners 1, no verifier 4.
11. **Unknowns and contradictions:** 4 unknowns each with its next evidence; 1 contradiction
    (README vs `ci.yml`), blocking 0 obligations; 0 truncated outputs re-run.
12. **Wiring walk:** the line above.
13. **CI (S20.6):** `gh run list --commit 41f8d7f` → **no run on this commit**. The latest run is
    `42834464910` on `50e25f8`, 2026-11-10 14:28, **success**, `workflow_dispatch` — which is the
    deployed build. Two red runs on 2026-11-09 (`ec8fad3`, `5ff7450`, both walk fixes for a slow
    runner) were superseded by green dispatched runs the same day. Filed as MIXO-05.
14. **Build and design lines.**
    **SURFACE** — 20 capabilities × 6 surfaces; ● 18, ○ 2 declared (the printer-profile seam, the
    repair rail), ✕ 2 (MIXO-04's missing failure surface, MIXO-06's discarded batch), unswept 0;
    state branches rendered: the nine row states are a tested partition, four unreachable by design;
    round trips checked 2 (import→row, export→file), 0 dropped fields; reachability checked 1 of 6
    (the app has one route).
    **JOURNEY** — 3 critical journeys (drop a case → orient → rim → area → supports → export; open
    and save a project; the denture flow); steps 14; grid cells: ● 11 (read 3), ✕ 2, U 1, unswept 0;
    traps checked 8 of 8, fired 2 (T2 the confirmation that lies — MIXO-06; T1 a state with no exit
    — MIXO-04); exits without an owner decision 1 (MIXO-02's third outcome); reduction: classes 6,
    decision rows 9, pairs 0.
    **DESIGN** — the module READMEs are the architecture document and they are current; the one
    dependency rule with a guard is three.js-in-the-view-layer (MIXO-12 is about that guard's
    limits).
    **GRAPH** — `graphify-out/` is fresh; no query was needed, because the READMEs answered every
    structural question. `cgc` is not on PATH.
    **EXECUTORS** — X0 only (`route.py`, `sweep_leads.py`, greps, the probes). Nothing was
    delegated: the findings needed the doctrine in one head, and the token budget allowed it.
    **TESTS** — the one test added was chosen by blast radius: `thumbnail.ts` is pure, so the guard
    is a unit test and costs a millisecond.
    **COMPANIONS** — none engaged. `/ecommerce-cia` does not apply (no commerce). The meddev row the
    router raised was checked and declined.

**Reference receipts:** theory.md "a codebase has five systems whether or not anyone named them" |
sweeps/ "the channel is the finding" | wiring-walk.md "ten tested classes are not nine tested
connections" | doctrine.md "an invariant is a sentence that can be false" | reporting.md "the ledger
is harsher on purpose" | evidence.md "a promise needs one owner and a witness" | browser-walks.md
"three observers, one subtraction" | surface-map.md "every blank cell is a cell nobody swept" |
journey-map.md "the author walked one path and called it the journey" | context-templates.md "the
profile picks the template, never the other way round"

---

## The final cybernetic question, for an editor

> If the viewport, the in-memory scene, the undo stack, background workers, GPU buffers and the file
> on disk disagree, does the tool know which is authoritative, and can it save, undo and recover
> without losing the user's work?

**Yes for the file, the scene and the workers** — the scene reducer is the single authority, every
worker reply is matched to its job by id, a late answer lands nowhere, and the export rebuilds from
the scene at click time and refuses rather than writing a stale one. **No for the GPU**: there is no
answer at all for a lost context or a device that never had one, because there is no code that asks.
That is MIXO-04, and it is the one gap in this system's viability.

---

*Sources for the external facts in 2c:
[MDN, `Crypto.randomUUID()`](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/randomUUID) ·
[caniuse, `crypto.randomUUID`](https://caniuse.com/mdn-api_crypto_randomuuid) ·
[MDN, `Object.hasOwn()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwn) ·
[caniuse, `Object.hasOwn`](https://caniuse.com/mdn-javascript_builtins_object_hasown), all read 2026-11-11.*
