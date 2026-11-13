# Goldfish Review Report — Round 4, feature spec

**Target:** `docs/design/2026-11-07-import-and-items-flow.md` (lines 1–587, §0–§7)
**Out of scope here:** §8 (588–860) and §9 — reviewed concurrently by a second synthesizer.
**Reviewers:** `egm-design`, `egm-structural`, `egm-style`, `egm-zoom-out`, `egm-comprehension`
**Standards:** feature-spec (design, structural), zoom-out, re-implementation (comprehension)
**Artifact:** `S:/ai/mixodental/docs/reviews/2026-11-07-egm-round4-feature.md`

**Counts after deduplication: 11 🔴 Blocker · 26 🟡 Major · 15 🟢 Nit.**

Round 1–3 dispositions were honoured: no reviewer re-raised the non-exclusive/non-exhaustive verdict
table, the stale "a third", the `--row` app-token claim, "THREE places", the step 6/7 order, or the
dropped per-row Appliance/Type. Three claims were re-verified by the synthesizer directly:
`vendor/mixo-geocore/SOURCE.json:5` = `"engineVersion": 63`; `package.json:19` =
`"walk:locales": "node scripts/walk.mjs --locales=en,ja,zh-Hant"`; `src/items/rowState.ts:65-66`
`ROW_STATES` has nine members.

**Headline.** The document's *argument* is in good shape. Its *facts* have drifted behind the tree:
the whole of §3's status header, its fill-reason premise and its module path are false, and the
measurement §3 defers to has already reported the opposite of what §3 assumes. Separately, §7 — the
section the owner asked to have looked at hardest — does not specify the UI it is the section for.
No page layout, no operator sentence in any of the three languages, no preview definition, two
`data-ui` names out of a page's worth, and a token the section says to declare but never names.

---

## Prioritized Findings

### 🔴 Blockers

#### BL-1. §3's status header is false on all three of its claims
* **Reviewer Lens:** all five (independent)
* **Affected Scope:** lines 179–180
* **Quote:** "**Engine COMPLETE and PUSHED: `6c37d20` (engine 62) and `b5a71ab` (engine 63), on `origin/main` in geocore. Not vendored — the tree is engine 61. App side unstarted.**"
* **Discrepancy:** `vendor/mixo-geocore/SOURCE.json:3,5` records commit `b5a71ab…` and
  `"engineVersion": 63`; `host/core/repairMesh.ts:2` opens "Mesh repair on import (engine 63)" and is
  in the vendored hash list. "App side unstarted" is false in five places: `src/items/rowState.ts`
  (whole classifier), `src/state/diagnosis.ts`, `diagnoseImported` at `src/workers/prepareImport.ts:78`,
  its call site `src/workers/importWorker.ts:65`, and `PrintUnit.diagnosis` at
  `src/state/project.ts:71` with `diagnosisField` at `:350`. §8 step 4 (line 641) and step 6 (line 692)
  already say DONE, so §3's own header contradicts §8.
* **Recommendation:** "Engine 63 vendored (`SOURCE.json`). App side: worker diagnosis, the verdict
  type, the row-state classifier and persistence are built (plan step 6); repair-on-a-press and the
  row component are unstarted (plan step 9)." This is the first line an implementer reads to decide
  what to pick up, so as written it schedules a vendor round that has happened and re-writes modules
  that exist.

#### BL-2. `fill-disabled` is called unreachable; it is now the universal case
* **Reviewer Lens:** all five
* **Affected Scope:** line 258–260, against line 297
* **Quote:** "`fill-disabled` is unreachable once step 5's constant exists." — against, 38 lines later,
  "Reached when the fill limit is zero (every loop reports `fill-disabled`, which is not a refusal)".
* **Discrepancy:** exactly inverted. Step 5 set `MAX_FILL_LOOP_MM = 0.0`
  (`scripts/measure-rim-loops.mjs:124-129`, §8 line 666), which is precisely the condition that makes
  `fill-disabled` the *only* reachable reason. `src/items/rowState.ts:30-33` and
  `src/items/README.md:40-42` both rely on this to make `unchanged` a common-path state, not a
  curiosity. It is `fill-too-long` and the other seven codes that are currently unreachable. Line 258
  is the premise for folding nine codes into three operator classes, so the premise is backwards.
* **Recommendation:** delete the clause. State that at the shipped limit of 0, `fill-disabled` is the
  expected code and `unchanged` the expected post-press state, that the other eight codes are retained
  for a future non-zero limit, and that therefore *too long to fill safely* and *shape refused* have
  **no reachable copy in this release**.

#### BL-3. "all eight row states" — there are nine
* **Reviewer Lens:** all five
* **Affected Scope:** line 583–584
* **Quote:** "**The Items row and all eight row states belong in `kit.html`**, each rendered once"
* **Discrepancy:** `src/items/rowState.ts:65-66` declares nine: `unreadable, too-big, clean, holes,
  malformed, refused, unchanged, repaired, repaired-open`. `src/items/README.md:9` is headed "The nine
  states, and why there are nine", and a test asserts the declared list equals the reachable set.
  §8 step 6 (line 694) says nine while §8 lines 736 and 762 repeat "eight", so the undercount is
  systemic. The "eight" traces to §3's two tables (4 + 4), whose first row merges `unreadable` and
  `too-big` — states the code deliberately splits. Because `kit.html` is step 6a's exit criterion, an
  eight-card catalogue passes review with a state missing: the exact non-exhaustiveness failure rounds
  1–2 were spent removing.
* **Recommendation:** nine everywhere, named by their `RowState` members. State the exit criterion as
  "the catalogue iterates `ROW_STATES`", not a literal count, so a tenth state appears on its own.
  Note `too-big` carries `limit: 'triangles' | 'memory' | 'plate'` (`rowState.ts:40`), so the
  catalogue needs eleven cards to show every sentence.

#### BL-4. §3 puts the classifier in the one folder a guard refuses
* **Reviewer Lens:** design, structural, zoom-out, comprehension, style
* **Affected Scope:** line 300–301
* **Quote:** "A pure function in `src/import/` maps a report to one of these, tested on its own"
* **Discrepancy:** it is `src/items/rowState.ts`. `src/items/README.md:44-51` records that
  `src/core/import/` was **refused** for it by `importOracleBoundary.test.ts`, which pins that folder
  to exactly `estimate.ts` and `stlHeader.ts`; §8 step 6 (line 699) says so in bold. §3 also
  contradicts itself — line 190 says "there is no new `src/import/` pipeline to build". §3 is the
  normative section for the states, so it sends the implementer straight into a guard failure.
* **Recommendation:** name `src/items/rowState.ts` and its four entry points —
  `verdictOfRefusal`, `verdictOfDiagnosis`, `verdictOfRepair`, `offersRepair` — with one line of the
  guard's reason.

#### BL-5. The repair-vs-diagnose-only valve has already fired, and §3 still argues the old way
* **Reviewer Lens:** design, zoom-out (Blocker); comprehension, style (Major)
* **Affected Scope:** lines 212–219
* **Quote:** "**Repair earns its place in this release because a holed aligner cannot be printed** …
  If that turns out to be rare in the 13 real scans (§8 step 5 measures it), diagnose-only is the
  better first ship and repair moves to the next."
* **Discrepancy:** the step this sentence defers to has reported, and reported against its premise.
  Over **18** files (not 13 — that is the real-scan gate's corpus) there were **zero** open boundary
  rims (`measure-rim-loops.mjs:124-129` prints "NO FILE HERE HAS AN OPEN BOUNDARY RIM"; §8 lines
  654/661/672). Holes are not rare on the measured corpus, they are absent. What survives is
  non-manifold on 8 of 18 files, up to 5,547 non-manifold edges. So the *stated* justification for
  shipping repair does not hold, while a different and probably sufficient one does — and §3 never
  says so, never names who decides, and never records the decision as taken. The tense is also wrong
  throughout ("measures it" for a step marked DONE). Consequence for scope: at a zero fill limit the
  only reachable post-press states are `refused`, `unchanged`, `repaired`; `repaired-open` with its
  per-loop reasons — the expensive three-language part of step 9 — is unreachable.
* **Recommendation:** either (a) ship diagnose-only, deleting step 9, the `repaired-open` copy and the
  fill-reason classes, or (b) rewrite the justification as "non-manifold splitting on 8 of 18 measured
  scans", name the decider and the date, and scope step 9 to the three reachable states. Fix 13 → 18
  and say which number means what.

#### BL-6. Not one operator sentence is supplied, in any of the three languages
* **Reviewer Lens:** comprehension, style (Blocker); design (Major)
* **Affected Scope:** §3 lines 279–298; §7 lines 561–576, 584
* **Quote:** line 584, "so the operator wording and the dense layout can be reviewed" — and there is
  no wording in the document to review.
* **Discrepancy:** §3's two "Says" columns mix final copy, paraphrase and instructions-to-invent with
  no marking. Bolded cells read as shippable text ("Could not be read", "Holes found.", "Too big for
  the plate", "Refused, file unchanged", "Nothing to change."); unbolded cells read as gloss
  ("Clean. Nothing to do.", "Repaired."); three cells are instructions, not text ("naming the limit",
  "naming the step", "a reason per loop"). Grepping `src/locales/ja.ts` and `src/locales/zh-Hant.ts`
  for "Holes found", "Nothing to change", "Could not be read", "Too big for the plate", "file
  unchanged", "Winding or non-manifold", "Next item" and "Appliance" returns **zero hits in either
  dictionary**. Every state also carries numbers the sentence must place, and no template says how:
  `holes{loops, longestMm}`, `malformed{nonManifoldEdges, windingConsistent}`, `refused{step}`,
  `repaired-open{loops, reasons}`, `too-big{limit}`, `unreadable{code}`. §8 step 6a gates on
  `i18n.test.ts` / `glossary.test.ts` / `japaneseSubset.test.ts`, which cannot be met from this text.
* **Strings an implementer must invent** (each user-visible, each absent):
  1. Three capacity sentences, one per `CapacityLimit` value. Line 283's "Too big for the plate" is
     the *plate* case only and silently mislabels `triangles` and `memory`.
  2. The refusal sentence with the repair step interpolated. `rowState.ts:92` strips the
     `body-invariant:` prefix, so the slot receives a bare engine identifier — say whether that is
     shown to an operator, and if not, give the mapping.
  3. The three fill classes' sentences (*filled*, *too long to fill safely*, *shape refused*) — named
     as classes at line 261, never written. (And see BL-2: two of the three are unreachable.)
  4. The per-loop line for `repaired-open`, and whether it pluralises. `rowState.ts:95`
     **deduplicates** reasons, so the row shows *which*, not *how many* — "a reason per loop"
     (line 298) contradicts the built behaviour and reads as N lines for N loops.
  5. Whether `unreadable`'s three causes (`StlFormatError`, `StlEmptyError`, non-finite) share one
     sentence or get three, and whether `code` is shown.
  6. Appliance tooltips for the three keys (line 169 admits this: "words to write, in three languages").
  7. The Drop page's per-row refusal reason for a non-accepted format (lines 494–497).
  8. The replacement heading and footer for the two strings `u1a` pins — *"What would you like to
     support?"* / *"Choose what to make supports for."* — which §6 line 471 and §7 line 558 both say
     must move.
  9. *Next item* (line 98).
  10. The row cap's refusal text (§9's cap, never mentioned in §5 or §7).
* **Recommendation:** one table, `key · slots · en · ja · zh-Hant`, covering all nine states, the
  reachable fill classes, the three capacity refusals, the three key tooltips and the moved
  heading/footer. Nothing in a copy column that is not literal shippable text. If three-language copy
  is genuinely plan step 7b's deliverable, say that plainly, mark every English fragment in §3 as a
  gloss, and name who signs off the Taiwan wording — but do not leave the two readings available.

#### BL-7. Neither new page's layout is specified
* **Reviewer Lens:** comprehension (Blocker); design, structural (Major)
* **Affected Scope:** §7 lines 516–587; §1 line 49
* **Quote:** the only layout statement in the document is line 49, "One row per file: preview, verdict, progress."
* **Discrepancy:** §7 never states the row's column order or widths; where the *Repair* press sits and
  whether it is in-row; where *Next item* sits and what it says when no unstarted row remains; the
  Items page heading and footer; the Drop page's arrangement of logo / title / drop zone / three keys /
  *Open a saved project*; the empty state; what a finished row looks like. Line 565 reserves red for a
  "**current-item marker**" that is never defined, placed or named anywhere in the document.
* **Named guesses:** page chrome, row anatomy, action placement, the finished-row state, the
  empty-list state, the current-item marker.
* **Recommendation:** §7 owes a row anatomy (left-to-right, with which token sizes each cell) and a
  page skeleton for both pages, or an explicit statement that step 6a's `kit.html` card *is* the
  specification and the layout is decided there — in which case §7 must say what the card must show.

#### BL-8. "Preview" is used once and defined nowhere — and it is a peak-memory decision
* **Reviewer Lens:** comprehension, design
* **Affected Scope:** line 49 ("preview, verdict, progress"); §7 never mentions it
* **Discrepancy:** the word occurs exactly once in 891 lines. A thumbnail? A format icon? The file
  name? If it is rendered geometry it is the only new per-row CPU/GPU cost the feature introduces, and
  it collides head-on with the lowest-peak-memory rule §3 itself uses to justify diagnosing in the
  worker — N previews from which copy, at what raster size, kept or drawn once, released when?
* **Recommendation:** define it in §7 — source (`display ?? mesh`), raster size, lifetime, bytes added
  to §0's measure — or delete the word from line 49.

#### BL-9. `data-ui` and class-name coverage is two names for a feature that adds two pages
* **Reviewer Lens:** comprehension (Blocker); design, structural, style (Major)
* **Affected Scope:** §7 lines 540–559; §6 lines 473–476
* **Quote:** lines 556–559, "the new pages must also state their **class names**, or the walk rewrite
  is guesswork" — and then they are not stated.
* **Discrepancy:** only `items-row-<importId>` and `items-progress-<importId>` are given. Both are
  correct and the `ProgressIndicator` reasoning verifies (`src/progress/Progress.tsx:61` names the
  wrapper `progress-${type}`, per type not per instance). Nothing is named for: the Items page root,
  the Drop page root and drop zone, the three Appliance keys, *Open a saved project*, the logo/title
  block, the per-row *Repair* press, *Next item*, the verdict text node, the preview, the per-row
  refusal text, or the removable-row control §5 lines 459–461 and §8 lines 801–803 both assume. Under
  the project's own rule every one of those must have a unique stable name, so the implementer invents
  all of them. The same self-admitted gap is stated twice — §6 lines 473–476 and §7 lines 555–559 —
  and discharged neither time; section `s` of the walk selects by **CSS class**, not `data-ui`
  (`.start-task`, `.start-screen .choice-keys`, `.start-screen .dental-drop`, drop dispatched on
  `.start-screen`), so the class names are load-bearing for the rewrite.
* **Recommendation:** a table of every new element with its `data-ui` **and** its CSS class, plus the
  two replacement strings `u1a` pins. Alternatively make "name them" an explicit exit criterion of
  step 6a rather than a complaint stated twice.

#### BL-10. The row-height token has no name and no value, and §7 then quotes the forbidden table
* **Reviewer Lens:** comprehension (Blocker); design, style, structural (Major)
* **Affected Scope:** lines 524–534 against line 563
* **Quote:** line 531, "**declare the row height as an app token in `src/styles.css` and add it to the
  app token table**" — then line 563, "Rows are dense (22px, body 11.5px), radius 2px".
* **Discrepancy:** the `--row` diagnosis is right and verified (declared only at
  `dentalwork/batch-review/tokens.css:44`, tabled at `docs/ui-styling.md:478` under the line 466
  heading "The tokens of `dentalwork/batch-review/tokens.css` **that the app does not have**"). But the
  fix is stated as a job, not a spec: no token name, no value, no table row. Then line 563 specifies
  the row with the two numbers from that same forbidden table (`--row` 22px, `--fs-md` 11.5px). Worse,
  "body 11.5px" names the wrong app token class: in this app 11.5px is `--small-size`
  ("Small print", `docs/ui-styling.md:106`) while `--body-size` is **12.5px** (`:104`), so anyone
  reaching for a token implements `--body-size` and gets 12.5px. (`--radius: 2px` does exist,
  `src/styles.css:31`.)
* **Named guesses:** the token identifier, its value, and which existing token supplies the text size.
* **Recommendation:** give the new token a name and a value once (e.g. `--items-row: 22px`), add the
  table row, and say the row text is `--small-size`. Delete the borrowed figures. Step 6a's
  `uiStylingDoc.test.ts` exit criterion is unmeetable until this is concrete.

#### BL-11. §1's "the entry already exists" describes a flow whose entry predicate is never satisfied
* **Reviewer Lens:** design, zoom-out, comprehension
* **Affected Scope:** lines 84–90, 94, 96–99
* **Quote:** "**That is exactly what the Items page needs**, heavy refusal included … The Items page
  selects the row's unit and takes this path." / "`startDental` … is the way *into* the flow and
  nothing else."
* **Discrepancy:** three defects in one seam, and the first fails silently.
  1. `useSelectedAligner` (`src/App.tsx:816-825`) returns with **no message** unless
     `acceptsDentalDrop`, which is `mode === 'dental' && dentalStage === 'aligner' && dentalAligner
     !== 'loading'` (`src/dental/editingMode.ts:353-355`). On the Items page after a drop the session
     is `mode: 'off'`, so this path is a no-op for the **first** item.
  2. Replacing `addAnotherDental` with *Next item* (lines 96–99) removes the only event that returns
     the session to `dentalStage: 'aligner', dentalAligner: 'prompt'` — which is what makes
     `acceptsDentalDrop` true for items 2..N.
  3. `useSelectedAligner` takes **no argument**: it reads `sceneRef.current.activeUnitId`. "Selects the
     row's unit and takes this path" is therefore a dispatch-then-call across a ref the dispatch has
     not yet updated, and the document never names the mechanism by which a row makes its unit active.
  Also unstated: `startDentalAligner` (`App.tsx:627`) routes a denture job to `denture.orient.start`,
  not `dentalFlow.startAligner` — live the moment the Drop page's Appliance can be Denture.
* **Named guesses:** who sends `startDental`, when, and with which profile for item 1; whether
  *Next item* still dispatches `addAnotherDental` and merely relabels it; whether Denture and
  *Any model* drops show the Items page at all; whether a row can be started while another imports.
* **Recommendation:** state the entry explicitly — `startDental` once per run at the Drop→Items
  transition (it is guarded on `mode === 'off'`, so once is safe), `addAnotherDental` retained as the
  state transition behind the relabelled *Next item*, then `useSelectedAligner` per row — change the
  entry to take a `unitId`, and require the silent `return` to become a message, since a row press
  that does nothing is unreportable. The verified parts of this passage (the heavy-tier refusal at
  `App.tsx:819-822`, the `acceptsDentalDrop` guard, and the `dentalFinished: []` trap at
  `editingMode.ts:215,219,387`) stand.

---

### 🟡 Major

#### MA-1. "Two tables, each exhaustive over its own report" — there are three sources
* **Lens:** all five · **Lines:** 276–298
* `src/items/rowState.ts:17-19` is explicit ("THREE SOURCES, NOT ONE") and `README.md:11-17` splits
  them: *refusal* (`verdictOfRefusal` → `unreadable` / `too-big`), *diagnosis* (`verdictOfDiagnosis` →
  `clean` / `holes` / `malformed`), *repair* (`verdictOfRepair` → four). §3's first table is titled
  "from `diagnose_mesh`" yet its first row never reaches `diagnose_mesh`, and the cell admits inside
  itself that it holds "two different sentences". §8 line 735 already knows §3's heading is wrong.
  Rows 2–4 **are** a correct partition (`watertight`, then `boundaryLoops > 0`, then else — matches
  `rowState.ts:81-83`), and the second table **is** a correct partition of a repair result
  (`:91-96`), so the fix is structural only.
* **Fix:** three tables matching the three entry points, non-mesh group first, nine rows, each row
  naming its `RowState` member and the fields it carries, with `CapacityLimit`'s three values
  enumerated.

#### MA-2. §0's measure states a memory bound in units of triangles, and §4 contradicts it
* **Lens:** design, structural, style, zoom-out · **Lines:** 22–24 against 366–369
* The arithmetic is right (`vendor/mixo-geocore/host/core/budget.ts:17,20,41-44`: 1,500,000 ×
  `REFUSE_FACTOR` 4 = 6,000,000), but a triangle ceiling is not a memory measure, and §4 says so
  itself: "bounded by the plate limit **plus the generated supports**, which the plate guard does not
  count — so no single figure is an upper bound." The code has a separate memory guard the measure
  ignores (`assertMemoryCapacity` / `memoryCapBytes`, `App.tsx:728`). At 12.2 MB per model the
  triangle limit permits ~24 models / ~290 MB, i.e. §0's bound is *looser* than §9's cap of 8
  (~100 MB) — so §0 claims as satisfied the thing §9 lists as open.
* **Fix:** two bounds with their own units: imported triangles ≤ 6,000,000 (cite `assertPlateCapacity`),
  and retained host bytes ≈ N × measured per-model bytes (12.2 MB worst case) + supports, with
  `assertMemoryCapacity` named as the enforcing guard and the §9 row cap as the N bound.

#### MA-3. §0's "no transient copy is added per file" is unverified and probably false
* **Lens:** zoom-out · **Line:** 24
* The plan adds `diagnose_mesh(positions: Float32Array, indices: Uint32Array)` per imported mesh
  (`repairMesh.ts:165`, via `diagnoseImported`). Those are slice arguments across the wasm boundary —
  a full copy of positions+indices into the wasm heap (12.2 MB for the largest measured model) plus
  engine adjacency, live alongside the host arrays. `prepareImport.ts` only claims `diagnose_mesh`
  "allocates no mesh of its own", which is a claim about its *return*.
* **Fix:** measure it, or restate as "one transient full-res copy inside the per-job import worker,
  released with the worker".

#### MA-4. §6's walk-locale paragraph is false about the current tree
* **Lens:** structural (Blocker), zoom-out (Major) — re-verified by the synthesizer · **Lines:** 479–482
* Quote: "there is no `walk:locales` script in `package.json` and CI runs `npm run walk` with no
  `WALK_LOCALES`." `package.json:19` has `"walk:locales": "node scripts/walk.mjs
  --locales=en,ja,zh-Hant"`, and `scripts/walk.mjs:133-134` reads `--locales=` first with the env var
  as fallback. §8 step 2 (lines 620–624) says DONE and that CI runs it as its own step. §6 is the only
  place a reader of 0–7 learns about the locale gate.
* **Fix:** past tense ("was env-var only and unrun; step 2 added the flag, the script and the CI
  step"), or cut and point at §8 step 2. The round-3 correction inside this bullet — that
  `walk.mjs:2717` does `process.exit(failed === 0 ? 0 : 1)` — is verified and should stay.

#### MA-5. §1 calls `s17` unexplained; §8 and the commit log say it is fixed
* **Lens:** structural, zoom-out · **Line:** 78
* "it sits in the same region as the unexplained `s17` failure in §8" — §8 step 1 line 618: "**`s17` is
  fixed.**" The cross-reference points at nothing and inflates the perceived risk of the
  Back-at-Orient change, which is the one genuinely new behaviour in §1.
* **Fix:** "the region `s17` regressed in, now fixed (§8 step 1)", or drop the clause.

#### MA-6. "Engine 61, already in the tree" — the tree is 63
* **Lens:** structural, design, comprehension, style · **Line:** 411
* Same staleness as BL-1; fix together. The substantive claim survives and was verified:
  `vendor/mixo-geocore/host/supports/unitSupports.ts:56,59` carry `BuiltSupports` and the generic
  `UnitBuild<T extends BuiltSupports>` exactly as quoted, `BuiltSupports` genuinely lacks `footprint`,
  and `host/supports/export.ts:48` takes `ReadonlyMap<string, BuiltSupports>` — so "no engine change"
  stands. Only the number is wrong.

#### MA-7. The nine→three fill-reason collapse is attributed to a classifier that does not do it
* **Lens:** design, zoom-out, comprehension, style · **Lines:** 258–263
* "The classifier maps them onto **three operator classes**" — the shipped `verdictOfRepair`
  (`rowState.ts:95-96`) returns a **deduplicated** `readonly FillReason[]` and nothing maps anything.
  No module, function or home is named, unlike `offersRepair()` (`:100`), which is. Also unstated that
  the dedup means a row shows *which* reasons, not *how many*.
* **Fix:** name the function and its home, or say the mapping lives in the string layer. See BL-2: at
  the shipped limit two of the three classes are unreachable, so this may simply be deleted.

#### MA-8. `ok()` / `changed()` are written as calls; the host type has plain booleans
* **Lens:** style, structural, design, comprehension · **Lines:** 241–242, 276, 295–298
* `RepairResult.ok` / `.changed` are properties (`vendor/mixo-geocore/host/core/repairMesh.ts:126-129`),
  read as `result.ok` / `result.changed` at `rowState.ts:92-93`. `ok()`/`changed()` are methods of the
  raw wasm `RepairObject` (`repairMesh.ts:147-149`), an altitude the host never touches. An implementer
  copying the table writes a call on a boolean.
* **Fix:** `ok === false`, `changed`, `after.watertight` throughout, plus one sentence saying
  `host/core/repairMesh.ts` is the boundary where the handle becomes an object. Line 251's
  `repair_mesh(positions, indices, maxFillLoopMm)` is the raw ABI; the host entry points the app calls
  are `repairMesh(engine, positions, indices, maxFillLoopMm)` and `diagnoseMesh(engine, positions,
  indices)` — four arguments, engine first — and the document never names that file or says which
  layer the host uses.

#### MA-9. The `watertight` definition given is incomplete, and it contradicts §3's own table
* **Lens:** design · **Line:** 272
* "`watertight` means *every* body closed, so one loop left open keeps it false." The vendored
  definition is `repairMesh.ts:56-57`: "Closed, manifold and consistently wound: what a slicer needs."
  Closure is one of three conditions — which is exactly why §3's own line 286 row ("not watertight, no
  open loops → **Winding or non-manifold**") can exist. The doc says limit 2's operator text is written
  from this sentence.
* **Fix:** quote the three-part vendored definition; keep "one open loop is enough" as a consequence.

#### MA-10. The verdict's schema is never given, in the section that introduces it
* **Lens:** comprehension, design, style · **Line:** 200
* "Only the **verdict** crosses the boundary" and stop. Missing: the type name and home
  (`ImportDiagnosis`, `src/state/diagnosis.ts`); its fields (`triangles`, `watertight`,
  `boundaryLoops`, `nonManifoldEdges`, `windingConsistent` Picked from the vendored `RepairReport`,
  plus own `longestRimMm` and `bodyCount`); that it is all plain numbers and booleans so it
  structured-clones with no transfer list; that it is **saved** as `PrintUnit.diagnosis`
  (`project.ts:71`) and carried by `placeImportedUnits`; and that `normalizeUnit` / `diagnosisField`
  (`project.ts:350-369`) re-validates a saved verdict and **drops** a malformed one rather than
  throwing, including the staleness check `found.triangles !== source.indices.length / 3`. An
  implementer working from §3 builds a transient, unvalidated, unsaved verdict.
* **Fix:** add the shape, the persistence and the staleness rule to §3.

#### MA-11. A saved verdict now outlives the session, and no surface reads it
* **Lens:** design · **Scope:** §0 lines 32–34, §1 line 48, §3
* The verdict is persisted, but the Items page exists only after a **drop**, and §1's *Open a saved
  project* goes nowhere near it. On reopening a project there is no surface that shows a stored
  verdict, and §0's out-of-scope list does not mention it either way.
* **Fix:** §0 either puts "reading a saved verdict on project open" out of scope explicitly, or names
  the surface that shows it.

#### MA-12. §5's eviction is disproportionate, and the doc's own cheaper answer is left untaken
* **Lens:** zoom-out · **Scope:** §5 lines 406–453, esp. 452–453
* §5 spends a new `KeptBuild` type, a generic widening through several call sites, and an admitted
  **visible regression** (an evicted unit stops drawing its support bodies and is packed by its
  bounding box) to reclaim what §9 itself calls the *secondary* term. The dominant term is the N full
  models in `scene.units`, which eviction does not touch. Line 452 already concedes the alternative —
  "the answer is a cap on items, not a pretence that eviction is free" — and §8 step 11 recommends not
  doing it.
* **Fix:** cut eviction from this release. §5 shrinks to scene-driven release (built, and accurately
  described — `forgetUnit` / `BuildSessions.forget`, verified at `App.tsx:458,482`), the measured row
  cap, and the two retained facts at lines 456–461. The `KeptBuild` analysis becomes a future-work
  note.

#### MA-13. §5's "do not discover them" cost list omits two consumers
* **Lens:** zoom-out · **Lines:** 428–429
* `src/components/useExport.ts:26` and `src/components/useFixSpot.ts:27` both declare
  `ReadonlyMap<string, UnitBuild>` and must take the generic. Mechanical — neither reads geometry —
  but §5's own stated rule is that the cost list must be complete. Moot if MA-12 is taken.

#### MA-14. "While the Start scene is up, the row owns the import" is a cross-cutting change the measure does not require
* **Lens:** zoom-out · **Lines:** 303–316
* Suppressing import-context jobs in `JobActivity` and switching the blocking veil off for one scene
  is a change to the app's only progress-narration surface, taken to avoid showing an import twice.
  §0 asks to "show each one's state" — a verdict per row — not per-row *progress*, and the existing
  surface already narrates per-file imports correctly. The analysis is correct
  (`importClient.ts:21,25,30` is `mode: 'per-job'`, `blocking: true`, `context: 'import'`;
  `JobActivity.tsx:79` hangs the veil off `blocking`); it is the conclusion that is expensive.
* **Fix:** weigh the zero-cost option — rows show verdict/state only, progress stays where it lives.
  That also deletes `items-progress-<importId>` and the `ledger --red` token question outright.

#### MA-15. The Drop page accepting GLB/glTF is scope creep against §0
* **Lens:** zoom-out · **Lines:** 491–497
* §0's case is "a case of several *aligners*"; the start screen is `.stl` only
  (`StartScreen.tsx:96`), the aligner path is the Rust STL session, and the glTF path welds elsewhere.
  Three formats doubles the weld/diagnose matrix and the per-row refusal copy for a goal — "so the two
  doors stop disagreeing" — the measure never states. (The underlying claim is correct:
  `DentalSteps.tsx:110` accepts `.stl,.glb,.gltf`.)
* **Fix:** keep `.stl`; move the door disagreement to §9. If the three formats stay, §0's non-goals
  list must say so, because a narrowing/widening of an input surface is a scope statement.

#### MA-16. §2's icon paragraph answers a deleted question, and the art it says is missing exists
* **Lens:** design; with comprehension and zoom-out on the unwritten half · **Lines:** 166–174
* "`CARD_ICON` has **one** entry … the mechanism exists, the art does not" is true of the *type-card*
  map (`src/components/DentalSteps.tsx:46,73`) — but that map belongs to the screen this release
  deletes, and per-row Type is dropped, so the paragraph answers a question the release no longer
  asks. Meanwhile the art for the three Drop-page selections **does** exist:
  `src/ui/icons.test.ts:21` pins `aligner.svg`, `denture.svg`, `generic.svg`, `back.svg`. The question
  the release does ask — which icon each of the three keys draws, and what its `note` says in three
  languages — is unanswered.
* **Fix:** state the icon each key passes to `ChoiceKey`, and supply the three tooltips in en/ja/zh-Hant.
  The `ChoiceKey` finding verifies (`src/ui/ChoiceKey.tsx:22-23`, "The start screen's keys do not have one").

#### MA-17. The level-1 visible label is forbidden but never stated, and the one new glossary term is left unwritten
* **Lens:** comprehension, style, zoom-out · **Lines:** 164–165, 572–575
* Line 165 forbids "Kind" and "Type" as visible labels and never says what the label *is*. Line 572
  then demands a per-language glossary term for *Appliance* from `glossary.test.ts` (the guard exists,
  `src/glossary.test.ts`) and supplies none — while in the same sentence quoting the full ja/zh-Hant
  terms for an earlier case (支撐柱/支撐頭, 支柱/先端) as the model of what is needed. Taiwan wording is
  a hard constraint and this is the single term the feature introduces.
* **Fix:** give the en/ja/zh-Hant glossary entries for *Appliance* and the Drop page's actual heading
  words, so they are reviewable rather than invented. Zoom-out's counter-proposal is worth pricing:
  move the three existing keys with their current translated wording, no notes, no new icons, and keep
  "Appliance" a document word — which avoids the `glossary` / `japaneseSubset` / `npm run fonts` chain
  for a rename the measure does not need.

#### MA-18. The Drop page's order of operations is unstated
* **Lens:** comprehension · **Scope:** line 48, line 122, §7
* The Drop page holds both the drop zone and the three keys, and Appliance is chosen "once per drop".
  Must the operator press a key *before* dropping? May they drop first and be asked after? What
  happens on a drop with no key pressed? What navigates to Items — the drop, or a press? Four
  behavioural branches, all invented by the reader.

#### MA-19. The neutral row tone is simultaneously "the answer" and an open question
* **Lens:** comprehension · **Lines:** 536–538 against §9 line 867
* §7 says "the answer is a documented token for a neutral background row" without naming the token or
  its value; §9 lists it as still open with that same sentence as a *recommendation*; §8 step 6a
  requires it decided and documented. A reader cannot tell which.
* **Fix:** decide it in §7 with a name and a value, or say plainly that step 6a is blocked on §9.

#### MA-20. §6's section-`s` line numbers are wrong by 30–65 lines
* **Lens:** structural, design · **Lines:** 467–468
* `if (runs('s'))` is at `scripts/walk.mjs:2300`, not 2269; `s19` is at `:2486`, not 2421. The
  self-caveat at lines 471–472 mitigates, but §8 line 816 repeats the stale range with no caveat. The
  "21 `check` calls" count **is** correct (s1–s19 = 19, plus `s2b` at 2355 and `u1a` at 2333), and
  `u1a`'s two pinned strings verify verbatim at `walk.mjs:2335`.
* **Fix:** drop the numbers, keep the anchors (`runs('s')` … `s19`) and the check count, in both places.

#### MA-21. `enterEditor` has eight call sites, not seven
* **Lens:** structural · **Line:** 61 (repeated at line 805)
* `scripts/walk.mjs` calls it at 541, 961, 979, 1028, 1070, 1078, 1893, 2184 (definition at 226). The
  "all outside section `s`" half is correct (section `s` opens at 2300). The count is load-bearing
  because step 7b's exit criterion is argued from it.
* **Fix:** "its call sites (currently eight) all sit outside section `s`", so a new one does not
  falsify the sentence.

#### MA-22. §6 and §7 duplicate the same paragraph near-verbatim
* **Lens:** structural, design, style · **Lines:** 473–476 against 553–559
* Both list the four selectors, the "`data-ui` is not sufficient" conclusion and `u1a`'s heading and
  footer, including the same closing clause "both of which move". §3 lines 320–321 and §7 lines
  542–547 likewise state the `items-row-<importId>` rule twice. Two copies drift; these two already
  differ in emphasis.
* **Fix:** normative copy in §7 (where the naming rules live); one-line cross-reference from §6.

#### MA-23. Engine thresholds are cited to a document that does not exist in this repo, and "reach" is never defined
* **Lens:** style, structural · **Lines:** 246, 253, 263, 270
* `vendor/mixo-geocore` contains no `docs/mesh-repair.md`, so "Method and thresholds are in geocore's
  `docs/mesh-repair.md`" is unreachable from here. Neither the 35% cut-off nor the 0.001 mm³ noise
  threshold appears in the vendored header: `repairMesh.ts:120` exposes `noiseVolumeThresholdMm3` as a
  *reported field with no value*, and no `35`/`0.35` appears at all. "the body gap is 0.005 mm, 100×
  that" has an unresolvable referent — the weld tolerance's value is never given, so the arithmetic
  cannot be checked. And "reach", used twice as the denominator of the only ratio an operator-facing
  refusal is written from, is never defined; the engine's own definition is `LoopFill.flatness`,
  "How far the rim bends out of its best-fit plane, over its own reach" (`repairMesh.ts:85`).
* **Fix:** state the rule as "`flatness > 0.35` — the rim's deviation from its best-fit plane over its
  own span — is never filled", define span once, give the weld tolerance's value before the ratio, and
  either read the thresholds off the report at runtime (`steps.noiseVolumeThresholdMm3`,
  `fills[].flatness`) or cite a geocore commit and path a reader can open. The paragraph is headed
  "Numbers, each derived".

#### MA-24. Terminology: three names for three types, and the mapping is never stated
* **Lens:** style · **Lines:** 200, 263, 279, 301, 440, 518
* "verdict", "report" and "diagnosis" are used interchangeably for three distinct things with three
  jobs: `RepairReport` (engine, per body, never crosses the worker boundary), `ImportDiagnosis` (the
  facts that do cross, stored as `PrintUnit.diagnosis`), and `RowState` (what the row says).
* **Fix:** define all three on first use in §3 and use **diagnosis** for the stored verdict, since that
  is the field name.

#### MA-25. Terminology: row / item / unit / file, and three referents for "step"
* **Lens:** style · **Scope:** §1 lines 43–55, and throughout
* §1 defines *scene* and *page* carefully and never defines the four nouns the rest of the document
  runs on (line 52 "One row per file", line 89 "the row's unit", line 106 "N items", line 453 "a cap
  on items", line 461 "a row removed before its unit exists"). "Step" has three unqualified referents:
  an operator-facing flow step ("Step 1", "Step 3"), a §8 plan step ("step 6", "step 5's constant"),
  and a *repair* step inside the engine ("naming the step", `body-invariant:<step>`).
* **Fix:** one line in §1 — "A **file** becomes one **row** on the Items page and one **unit** on the
  plate; an **item** is a unit being walked." Qualify "plan step N" and "repair step" everywhere.

#### MA-26. About a fifth of §0–§7 argues with text the implementer cannot read
* **Lens:** style · **Scope:** lines 26–30, 58–62, 69–70, 99, 108–112, 150–157, 226–227, 256, 269–271, 276–278, 288–289, 304–307, 366–370, 377–384, 412–414, 432–434, 445–448, 456–461, 478, 484–490, 512
* Line 3 already names `docs/reviews/2026-11-07-egm-goldfish-review.md` as the record of findings and dispositions.
  Proposed rule, applied uniformly: **a revision reference survives only where it changes what to
  build; everything else moves to the review report.** By that rule:
  * Lines 26–30: the only live content is one clause — stream each file into a unit before reading the
    next. Keep the clause; move the rest. (See also MI-1: the pointer is wrong.)
  * Lines 150–157 (seven lines on `isDentalKind`): live content is two sentences — widening
    `DentalKind` would not change the on-disk shape, and `normalizeDentureState` calls `requireKind`
    on a saved `policy.profileId`. The closing sentence about "the failure this round was commissioned
    to catch" is commentary on the review process.
  * Lines 484–490: a pure incident report, and the only first-person passage in an otherwise
    impersonal document. Live content is one line (the missing script and CI job — and see MA-4, now
    stale too).
  * Lines 276–278, 288–289, 304–307: superseded. `rowState.ts:72-78` and `src/items/README.md:22-26`
    now record this same history *at the code*, where a test checks it. Delete and cross-reference.
  * Lines 366–370, 377–384, 432–434, 445–448, 456–461: each opens by naming a revision before stating
    the rule, so the reader meets the refutation before the instruction. Invert every one.
  * Lines 499–505: the live content is the last sentence (the stale label survives in five named
    files), which is a task. Promote it; demote the narrative.

---

### 🟢 Nits

* **MI-1.** Line 30 — "Streaming each file into a unit … **is listed in §7**." It is not; the item is
  §8 step 7b (line 797), and line 8 says "§7 is the UI, §8 the sequence". Repoint. *(lens: comprehension)*
* **MI-2.** Line 3 — "**Revision 5, after three rounds of seven-reviewer review**" is already stale: the
  body cites "Revision 4" claims (152, 377, 445) and "Revisions 3 and 4" (484), and a fourth round is
  in progress. Drop the count or make it a line the round bumps. *(style)*
* **MI-3.** §6 carries no built/decided/unstarted label, contrary to §0 line 8; §0 has none either.
  Given MA-4, §6 is precisely the section whose status a reader needs. *(structural)*
* **MI-4.** No `---` between §7 and §8 (line 586/588); every other boundary has one (10, 35, 114, 175,
  323, 392, 463, 514, 859). Heading levels are otherwise clean — one H1, H2 per section, H3
  subsections, no skipped level in 1–587. *(structural)*
* **MI-5.** Line 520 — "**four** guards" vs the five §8 step 6a lists (adds `i18n.test.ts`); the code
  brings two more into the same argument (`importOracleBoundary`, `noDuplicatePackages`, both cited in
  `src/items/README.md`). And "each has caught something in this session" is unfalsifiable from the
  document. Name the guards and what each fails on; drop the anecdote. *(structural, style)*
* **MI-6.** Lines 59–62 — "The string is asserted in `sceneMap.ts`'s `bench.doors`". `bench.doors`
  holds a prose sentence (`sceneMap.ts:95-96`), not the UI string; the string lives in
  `src/locales/ja.ts:698` and `zh-Hant.ts:702`. Change "asserted in" to "described in". *(style)*
* **MI-7.** Line 61 — "whose **seven call sites**" is not checkable from the document; cite the file the
  count comes from (and see MA-21: it is eight). *(style)*
* **MI-8.** Lines 72–74 — "about **fifteen** sites, not the three revision 2 named", followed by ten
  items plus "six test files". The hedge "about" sits in the sentence whose whole point is a count, and
  the list does not reconcile. Give the exact count or lead with "the sites are:". *(style)*
* **MI-9.** Lines 131–133 — "N kinds, N profiles, a serialisation into the project file, and a
  per-Appliance loop rule — **three** design decisions". Four items, three decisions. *(style)*
* **MI-10.** Lines 122–123 against 145 — the table says Appliance is "app-side; `DentalKind` where one
  applies", then "`DentalKind` is vendored". Say where it lives once. *(style)*
* **MI-11.** Line 239 — "treats them **oppositely**" is imprecise: one is *reduced* (topological
  components, by welding), the other *preserved* as an invariant (physical bodies). Say that. *(style)*
* **MI-12.** Lines 306, 310–311, 537 — "the module" has no antecedent; `src/progress` /
  `ProgressIndicator` is first named 240 lines later at 545. Name it at first mention. Likewise lines
  316 and 461, "the step's exit criteria" / "that step's exit criteria" — neither "step" has an
  antecedent; name the §8 step number. Lines 459–461's pre-unit reservation case is claimed by both
  §8 7a and 7b; give it one owner. *(style, zoom-out)*
* **MI-13.** Lines 549–551 and 570 — session narrative ("a false gap that cost a round of investigation
  in this very session") and a tool name standing in for a process ("Taiwan wording via Gemini, checked
  against the real locale entries"). Name `src/locales/zh-Hant.ts` and who signs off. *(style)*
* **MI-14.** Lines 504–505 — "The stale label still appears in **five** files" is correct for documents,
  but `scripts/walk.mjs:2338` still carries it in `s2`'s check *description*, so it is six places.
  Harmless (not an assertion) and worth one clause so the next grep does not look like a regression.
  *(structural)*
* **MI-15.** Lines 106–112 — `scope` is diagnosed as rot and left undecided, while §8 step 10 deleted
  the `PAGES` table on the identical argument. Be consistent: retire `SceneScope` in step 3. Related:
  §1's page table has no `data-ui`/class column though §7 makes stable names a hard rule for exactly
  these two new pages; and §3 never states that diagnose now runs on **every** import app-wide
  (`importWorker.ts:65` loops all prepared meshes on both paths, so bench drops, dentures and
  multi-mesh glTF files pay the pass and store a verdict no row shows) — state as accepted or gate it
  to Start-scene imports. Finally, line 423's `// src/supports/keptBuild.ts` collides with an existing
  `keptBuild` function imported into `App.tsx:105` from
  `src/denture/steps/supports/rigidMove.ts`; rename the module or the type. *(zoom-out, structural, design)*

---

## Named guesses, collected

A competent implementer who has not seen this codebase must invent each of these:

1. Who sends `startDental`, when, and with which profile for item 1 (BL-11).
2. The mechanism by which a row makes its unit active, given `useSelectedAligner` takes no argument (BL-11).
3. Whether *Next item* still dispatches `addAnotherDental`, and what it says/does when no unstarted row remains (BL-11, BL-6).
4. Whether Denture and *Any model* drops show the Items page at all; whether Repair is offered on non-aligner kinds.
5. Whether a row can be started while another is still importing.
6. Both pages' layouts, the row's anatomy, the empty state, the finished-row state, the current-item marker (BL-7).
7. What "preview" is, from which copy, at what size, with what lifetime (BL-8).
8. Every `data-ui` name but two, and every CSS class name (BL-9).
9. The row-height token's identifier and value, and which token supplies the text size (BL-10).
10. The neutral-row-tone token's name and value (MA-19).
11. All operator copy: nine states × three languages, three capacity sentences, the refusal sentence's step slot, the per-loop line, three key tooltips, the moved heading and footer, *Next item*, the row-cap refusal (BL-6).
12. The visible label for level 1, and *Appliance*'s glossary entries in three languages (MA-17).
13. The Drop page's order of operations (MA-18).
14. The row cap's number (§9 defers to step 5; step 5 suggests 8; §5 and §7 never mention a cap).
15. Whether Back at Orient re-renders the row from the saved verdict or re-diagnoses — now that the verdict is persisted.
16. The reservation grain for a row removed before its unit exists.

## Cross-scope note for the §8/§9 synthesizer

`src/state/diagnosis.ts:37-46` declares **seven** fields and `Pick`s **five** from `RepairReport`
(`triangles, watertight, boundaryLoops, nonManifoldEdges, windingConsistent`, plus own `longestRimMm,
bodyCount`). §8 line 712 ("five facts and a body count") and line 717 ("Four of its six fields are
`Pick`ed") are both off by one — and so are `src/state/diagnosis.ts:16` ("six facts"),
`src/items/README.md:57,69` and `src/workers/diagnoseImported.test.ts:7`. The prose was not updated
when `triangles` was added; `diagnosisField` handles all seven, so only the counts are wrong. The
"eight row states" undercount also recurs at §8 lines 736 and 762, and the stale section-`s` line
range at §8 line 816.

## Verified correct — do not re-litigate

`TRIANGLE_BUDGET × 4 = 6,000,000` (`budget.ts:17,20,41`); the per-file loop with
`const imported: PreparedMesh[][]` and the three capacity asserts (`App.tsx:704,727-746,779-783`);
`held` and `files.find(isStl)` (`StartScreen.tsx:38,64`); `added[0]!` (`App.tsx:779,783`);
`StartScreenId = 'task' | 'type' | 'file'`; `sceneMap.ts:82 scope: 'run'` and the stale
`scope: 'object'` claim being in exactly the two named places (`src/scenes/README.md:78`,
`sceneMap.ts:33-37`); the `dentalFinished: []` reset trap (`editingMode.ts:215,219,387`) and
"Drop an aligner STL…" (`:400`); `DentalKind = 'aligner' | 'denture'` and `isDentalKind`'s only call
site being CLI parsing in `dentalwork/batch-review/profileSelect.ts:64`; walk `s2` asserting one card;
the weld-path correction (glTF via `prepareImport.ts:15`'s `weld_positions_in_place`, STL inside the
Rust session, `'Welding vertices'` posted by `importWorker.ts:21,49`); diagnose-in-the-worker with only
the verdict crossing (`importWorker.ts:65`, `prepareImport.ts:63-66,78`); the nine `FillReason` codes
including `''` (`repairMesh.ts:63-73`) and the required third argument with no engine default
(`:164,318-324`); the body-invariant/unchanged-mesh contract (`repairMesh.ts:14-16`);
`importClient.ts:21,25,30` (`mode: 'per-job'`, `blocking: true`, `context: 'import'`) and the veil
hanging off `blocking` (`JobActivity.tsx:79`); `ledger`'s shape and `--red` tone
(`progressTypes.ts:84`); `Progress` carrying `data-ui={progress-${type}}` per type
(`Progress.tsx:61`) and the first-of-many false gap (`src/progress/README.md:109`); `PROGRESS_TYPES`
driving the catalogue; `--row` existing only in `dentalwork/batch-review/tokens.css:44` and tabled
under "the tokens the app does not have" (`docs/ui-styling.md:466,478`); `--radius: 2px`
(`src/styles.css:31`); `CARD_ICON` one entry with a `generic` fallback (`DentalSteps.tsx:46,73`);
`ALIGNER_PROFILES` carrying `description[lang]`; the five guard tests named in §7 all existing;
§4 in full (`exportedDental`, `dentalFinished` preserved by `addAnotherDental`, export client
`mode: 'per-job'`, `DentureClient` with no mode and `concurrency: 'serial'`); §5's eviction cost list
(`App.tsx:340-342, 1090, 458, 482`) and the vendored `BuiltSupports` / `UnitBuild<T>` seam;
`walk.mjs:2717 process.exit(failed === 0 ? 0 : 1)`; the 21 `check` calls in section `s`; `u1a`'s two
pinned strings (`walk.mjs:2335`).

## Project-rule compliance

* **No third-party product names:** clean. Line 364's "Output goes to a slicer and the slicer arranges
  the plate" is correctly neutral.
* **Patient data:** clean. No scan filename appears; the corpus is referred to only by counts, and
  `measure-rim-loops.mjs:12-14,45` confirms the hash-only contract. The only defect is that one count
  is wrong (13 vs 18 — BL-5).
* **Three languages:** the rule is stated at lines 561–576; compliance is BL-6.
* **Unique stable `data-ui`:** the rule is well stated and justified (lines 320, 540–551); coverage is BL-9.
* **Prose ranged left:** clean, no centred runs.
* **Lowest peak memory:** stated as first-class, but §0's measure is in the wrong units (MA-2) and the
  one new transient copy is unaccounted (MA-3).

## Suggested order for revision 6

1. Re-derive every status banner and every number in §3 against the tree (BL-1, BL-2, BL-5, BL-4,
   BL-3, MA-6, MA-4, MA-5, MA-20, MA-21).
2. Replace §3's two tables with three keyed on `ROW_STATES`, nine rows, each naming its payload (MA-1).
3. Write §7 as a specification rather than a list of rules it must obey: the string table, the
   `data-ui`/class table, the row anatomy, the token name and value, the preview (BL-6 through BL-10).
4. Close the §1 entry seam with named events and a `unitId` argument (BL-11).
5. Decide eviction in or out (MA-12), and re-state §0's measure in bytes (MA-2, MA-3).
6. Define verdict/diagnosis/report and row/item/unit on first use; qualify "step" (MA-24, MA-25).
7. Apply the one-rule purge of revision commentary (MA-26).
