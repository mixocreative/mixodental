# Import, items and the end of the flow

**Revision 2, after a seven-reviewer review.** `goldfish_review_report.md` carries every finding and
its disposition. Four findings changed the design; two were false claims of mine; one was a live bug,
now fixed in code. Where this revision contradicts revision 1, revision 1 was wrong.

Each section says **built / decided / unstarted**. §7 is the sequence; §8 is what is still open.

---

## 0. The problem, and what is out of scope

**Today the app takes one file per run.** The start flow asks for a task, a type, then a single file,
and the dental flow walks that one object to its supports. A technician with a case of several
aligners runs the whole app once per aligner: same task, same type, same answers, re-entered each
time. The plate already holds several objects — only the way in assumes one.

**So: accept a drop of several files, let the operator say per file what it is, then walk each one.**

Success is that a case of N aligners takes one trip through the start flow instead of N, and that no
step holds more memory at once than the single-file flow does today.

**Not in scope**, named so nobody has to guess: per-row orientation detection (the flow still detects
per object, inside Step 1); per-row support settings; reordering rows; anything that slices or plans
the plate; a second aligner type (see §2 — there is currently exactly one).

---

## 1. Scenes and pages — the vocabulary

**Scenes: built, uncommitted** (`src/scenes/sceneMap.ts`, `src/bench/benchScene.ts`).
**Pages 1–2: unstarted.** The table is the target state, not today's.

A **scene** is a whole screen. A **page** is one screen within a scene: a screen the operator
navigates *to*. Modes and steps get pages because the operator arrives at them by a Back-able
transition; that is the test for whether a screen is a page.

| Section | Page | Name | Today? | What is on it |
|---|---|---|---|---|
| **Start** | 1 | **Drop** | **new** | Logo, title, drop zone, *Open a saved project*, *Open the workspace*. |
| | 2 | **Items** | **new** | One row per file: preview, verdict, Appliance, Type. |
| **Object** | 3 | **Orient** | yes (Step 1) | Orientation and print angle |
| | 4 | **Rim** | yes | The rim drawing. A detour off Orient, not a step. |
| | 5 | **Area** | yes (Step 2) | The support area |
| | 6 | **Supports** | yes (Step 3) | The supports, and the export |
| **Bench** | 7 | **Bench** | yes | The workspace at rest |
| | 8 | **Support edit** | yes | Support Edit Mode |
| | 9 | **Zones** | yes | No-support zones |

**The type screen (Step 0) goes, and its stage with it.** `DentalStage` includes `'type'` with a
reducer branch, a status line and a Back target; `App.tsx` sends the operator back to it from Step 1;
and the bench's *Aligner Support Production* button enters the flow at it. All three are handled in
§7 step 7 — that button opens the Start scene instead.

**Start stays `scope: 'run'`.** One screen handles N items; the per-object loop runs after it.

> **The stale `scope: 'object'` claim is in THREE places, not one**: `src/scenes/README.md`'s
> multi-file section, and — the one a code reader meets first — the `SceneScope` doc comment at
> `sceneMap.ts:30-38`. **And correcting it voids the field's own justification**: the README keeps
> `scope` on the grounds that multi-file will change it. If Start stays `run` for good, `scope` needs
> a new reason or retiring, by the README's own rule that *"a field holding a future intention rots"*.

---

## 2. The two levels — Appliance and Type

**Decided, unbuilt.**

| Level | Operator sees | Represented by | Options |
|---|---|---|---|
| 1 | **Appliance** | app-side; `DentalKind` where one applies | Aligner · Denture · Model only |
| 2 | **Type** | `profile` (an engine id) | the aligner type; a denture's is fixed; Model only has none |

**"Model only" is not a kind — it is the absence of one.** `DentalKind` is vendored and is exactly
`'aligner' | 'denture'`, with `defaultProfileId`, `profileIdsOf` and `requireKind` total over the
pair (`requireKind` throws), and `isDentalKind` parsing **saved files**. A third enum value would
widen a vendored type and change the save format. So level 1 is "which flow, if any": Model only
means `kind: undefined` and no object scene, which is what `onAnyModel` already does.

Revision 1 defended `profile` as a vendored identifier — true, and it does not get renamed — while
missing that `kind` is vendored too, and is where the cost was structural rather than cosmetic.

**The visible labels must not be "Kind" and "Type"**: synonyms in English, and two adjacent columns
an operator has to tell apart.

### There is exactly one aligner Type today

`PROFILE_FILES` holds a single entry, `reference-aligner.json`; the denture family likewise; walk `s2`
asserts one card on the type screen. **So the Type column has one option for Aligner, one fixed value
for Denture, and none for Model only — no choice in it anywhere.**

The reserve rule below is therefore **forward-looking on purpose**, for when a second profile lands.
Revision 1 argued for it from variability that does not exist.

### Layout

**Reserve the Type column and never reflow it** — contents vary by Appliance, so a collapsing column
makes every row jump. Rows use the documented `--row` token (22px), not a literal.

`Segmented` takes a group-level `disabled` and renders only its `options`, so an **empty** options
array is a zero-width div: it cannot reserve the column by itself. **The dimmed placeholder is work**,
not a prop.

### Icons and tooltips, corrected

- `ChoiceKey` takes `note`, but its comment says *"The start screen's keys do not have one"* — so
  **Appliance tooltips are words to write**, in three languages.
- `CARD_ICON` has **one** entry and the `generic` fallback is at the call site, so every type but the
  reference aligner draws the same picture. The mechanism exists; **the art does not.**
- `ALIGNER_PROFILES` carries `name[lang]` and `description[lang]` in all three languages — and
  `DentalTypeStep` **already renders** `description[lang]` as a `ChoiceKey` note. The words exist;
  "unused" was true only of a row.

---

## 3. What happens to a file on import

**Engine COMPLETE and PUSHED: `6c37d20` (engine 62, diagnose + safe repairs) and `b5a71ab`
(engine 63, hole filling), both on `origin/main` in geocore. Not vendored. App side unstarted.**

### The decision revision 1 left implicit: diagnose automatically, repair on a press

`diagnose_mesh` allocates no mesh, so it runs on every file and is what the strip reads.
**`repair_mesh` runs only when the operator asks.** Three reasons, and the review forced all three:

1. The host's existing cleanup states the rule in its first line — *"Explicit repair, never implicit:
   … Nothing in the host calls this on its own"* (`removeDegenerate.ts:2`). Automatic repair would
   break that silently. It now stands.
2. `repair_mesh` returns a **new** mesh: a second full copy of a 373,956-triangle model, per file, for
   files plural. Automatic means importing that cost unasked, against lowest peak memory.
3. The printed file would otherwise not be the file the operator supplied, with no consent point —
   and limit 1 below says a patch is never intersection-tested against the model.

**Where it sits in the existing chain.** `prepareImport.ts` already welds (`weld_positions_in_place`,
"first-seen weld"), centres, enforces capacity, and decimates a heavy mesh to a *display* copy while
the full-resolution mesh stays the support and export source. So **diagnose runs on the
full-resolution mesh after that weld** — which means engine 62's weld step largely finds its work
already done on this path. Revision 1's "welding closes most apparent holes" is true of raw scan data
and **not** of a file that has been through this importer. The repair's value here is winding,
non-manifold splitting and filling, not welding.

### Component-wise, and the trap that makes it so

Repair never fuses two bodies — the owner's constraint. That rules out voxelise-and-isosurface, which
guarantees watertightness and destroys body identity.

**"Label components, then repair within each" does not work.** A cracked shell is already several
components *topologically*: two triangles meeting along a visible edge but carrying duplicate vertices
are not adjacent in the index buffer. So the engine carries two notions and treats them oppositely —
topological components, which welding is meant to reduce, and **physical bodies, invariant**.

The invariant is enforced **at runtime**: a step that would move a face between bodies abandons the
repair, `ok()` is false with `body-invariant:<step>`, and the file comes back **unchanged** with its
before-report filled. It compares a partition of original face ids, not a body count, because a count
misses a face moving between two bodies.

Numbers, each derived rather than chosen: weld reuses the existing `Tolerance::Weld`
(`max(1e-7 mm, 1e-6 × box diagonal)`); the body gap is **0.005 mm**, 100× that and a tenth of the
0.05 mm the parts code already calls touching; a noise shell is **< 0.001 mm³**, reported, never
dropped.

### Filling, and what it refuses

```ts
repair_mesh(positions, indices, maxFillLoopMm)   // third argument REQUIRED, no engine default
```

Zero or non-finite fills nothing and reports `fill-disabled` on every loop, so no threshold is ever
inherited by accident. A rim is patched by one triangle (3 edges), by ear clipping in the best-fit
plane (bend ≤ 10% of the rim's reach), or by minimum-area triangulation (≤ 35%); past that it
**refuses** with the measured flatness, because a patch of the rim's own vertices would pass through
the model.

Nine per-loop reasons the host branches on: `''` (filled), `fill-too-long`, `fill-non-planar`,
`fill-self-intersecting`, `fill-too-many-edges`, `fill-not-a-loop`, `fill-degenerate`,
`fill-spans-bodies`, `fill-disabled`. **A loop left open always arrives with a reason**, which is what
the strip shows.

### Three limits, stated because the strip must not imply otherwise

1. **A patch is never intersection-tested against the model.** Safety comes from refusing risky rim
   classes, not from checking the result. The strip must not imply a filled hole is verified.
2. **A rim bending past a third of its reach is never filled.** The answer is not a bigger threshold;
   it is new vertices placed against the surrounding surface.
3. `watertight` means *every* body closed, so **one loop left open keeps it false** however many were
   filled.

### The strip's verdict — four states, mutually exclusive

| Condition | Says |
|---|---|
| `changed() === false` **and** `watertight` | Clean. Nothing to do. |
| `changed() === false` **and** `boundaryLoops > 0` | **Holes found.** Offers *Repair*. |
| `changed()` and `watertight` | Repaired. |
| `changed()` and `watertight === false` | Repaired, **holes remain**, with the per-loop reason. |

Revision 1 had three states and they were **not disjoint**: a file with a real hole but no duplicate
vertices satisfied both "Clean. Nothing done." and "Holes remain". An implementer reading top-down
would have told the operator a holed mesh was clean, about a file they were about to print.

### Row progress — a pacing bar, not a spinner

**Revision 1 was wrong here and the module was right.** `ledger` declares `waiting: 'bar'`;
`progressLayout` grants `inline` only to spinners; a test pins both; and no call site may override a
type. So "spinner left, short text right, one row" is the exact combination the module refuses.

Its reason applies here precisely — *"paces rather than spins so that a column of rows does not become
a column of turning circles"* — and the Items list **is** a column of rows. So: **`ledger`, pacing
bar, leading label, stacked.** The row borrows `ProgressIndicator`, as `JobActivity`'s rows do. No
fourth type.

Two consequences revision 1 missed. `ledger` is `tone: '--red'`, so a routine read must not simply
inherit the failure colour (§8). And `ledger`'s contract promises "the time, Cancel and failures", so
the row must decide whether one engine call offers a Cancel: **it does not** — there is no mid-point
to stop at.

**`data-ui` for N rows**: `ProgressIndicator` carries no name of its own, so N rows would be unnamed.
Each row gets `items-row-<index>`, its indicator `items-progress-<index>`.

---

## 4. Where the flow ends

**Built, uncommitted** (`FLOW_END` in `src/scenes/sceneMap.ts`). Step 3's primary is **Export STL**
(`active-printable`) instead of OK. `reviewWayOn()` is the single decision; both review footers ask
it.

### The bug this introduced, and the fix

**Removing OK removed the only thing that marked an aligner finished.** `exitCommands` strips the
supports and the dental policy of any unit not in `dentalFinished`. So Export STL wrote a correct file
and **Exit then emptied the plate behind it**; a *Save project* afterwards saved a bare model.

**Fixed:** a new session event `exportedDental` marks the unit finished without moving the stage, sent
by `dental.export` before the export. Session-only on purpose — finishing also *arranges* the plate,
arranging moves the unit, and a moved unit drops the build the export is reading, which would make
`runExport` refuse the export as stale. Four tests in `dentalStep3.test.ts` and walk check **x18b**
hold it.

**x15–x18 all passed and none of them pressed Exit afterwards.** The handoff already carried the
lesson — *walk the handover, not just the step* — from an identical miss.

### Export writes the file and stays on Step 3

`runExport` is `async` (`Promise<void>`) and reports every refusal — stale model, failed build,
inconclusive check — only through the status line. Success and refusal are indistinguishable to the
caller, so a press that navigated could walk the operator away from a file that was never written.

### Per item, not per plate

**This app does not slice.** Output goes to a slicer and the slicer arranges the plate, so arranging
here is a convenience rather than the artefact that matters.

**The memory argument, corrected.** Revision 1 called `encodeStl`'s single
`ArrayBuffer(84 + triangles * 50)` an unbounded cliff. It is bounded: `assertPlateCapacity` refuses
any import past `TRIANGLE_BUDGET × 4` = 6,000,000 triangles, so the worst whole-plate buffer is near
~300 MB — large, and `new Blob([file.buffer])` copies it again, but bounded.

And the buffer is not what distinguishes the two. `useExport` awaits the **whole** `outcome.files`
array before looping the downloads, so `separate-*` already holds every buffer at once, and the worker
holds every source and support mesh for the task. **What distinguishes per-item is one export task per
item** — and the export client runs `mode: 'per-job'`, *"a worker per job that ends with it, so
nothing stays"*, so the entire worker heap returns after each item. That is the real argument and it
replaces revision 1's.

**The plate seam stays.** `whole-printable` and `arrangeAlignerCommands` keep working; per-item is
simply the default.

---

## 5. Who frees the memory

**Mechanism built; the trigger and the split are unstarted.**

**Tab closed** — nothing to do. The process takes the WASM heap, the workers and every buffer with it.
`useProjectFile.ts:50` already warns about unsaved work.

**Abandoned while running** — release is **driven by the scene**. `App.tsx:475-491` reconciles against
`scene.units`: an id no longer there gets `forgetUnit(id)`, and `built` / `failedBuilds` are pruned.
`BuildSessions.forget` frees that unit's session and every handle. So Exit, delete, open-over and an
Undo that removes a unit all converge without any of them being asked.

### Three corrections to revision 1

**`built` is not spare capacity.** `planExport` emits a supports part only when
`unitContacts(unit, built.get(id))` is non-empty, and `supportMeshes` is derived from `built` and
handed to the viewport. Revision 1's test — *"assert `built` has no entry for it"* — specified a
finished aligner that **draws no supports and exports as a bare model**.

**So Option 1 is withdrawn.** The right split is the one revision 1 described and then abandoned:
`UnitBuild` keeps `unit` and the contact bookkeeping; the heavy `mesh` is what gets dropped. A geocore
host-layer change.

**"Removing a row gets this for free" is false.** `forget()` on a *running* job clears the client's
`sent` map, so every other unit re-uploads its model on its next build. And `PlateLedger` holds an
import **outside** `scene.units` until it settles, so a row removed before its unit exists is exactly
the case the reconcile misses.

### The trigger, which now has a site

"Finished and moved on" was not a single moment in the code once OK was gone. **`exportedDental` is
that moment** — a second reason §4's fix was the right shape. The eviction hangs off it and off
`addAnotherDental`.

**Still unbounded, and named rather than hidden:** the unit's own mesh stays in `scene.units` because
that is what "stays on the plate" means, so a 10-item run holds 10 full models in host memory. §5 does
not solve that, and the Items list makes it the dominant term. §8 carries it.

**Tests:** after `exportedDental`, the unit's build *mesh* is gone while its contacts remain, the
viewport still draws its supports, and `planExport` still emits a supports part.

---

## 6. What the reorder costs

Measured against the tree, and corrected.

- **Section `s` is `scripts/walk.mjs` ~2249–2403 and holds 21 `check` calls**: s1–s19 **plus `s2b`**
  (the heading-box geometry) **plus `u1a`** (the task screen's header, heading and footer). Revision 1
  said "s1–s19, 20 calls". **`u1a` is a `u`-id living inside section `s`**, so anyone rewriting "that
  section" by id prefix walks straight past it.
- Almost all of section `s` is a specification of the current three-screen order — every Back
  destination, every Escape, which screen each drop lands on. It is rewritten, not patched.
- **`walkLocale` drives all three start screens and is NOT in the gate** — it runs only under
  `WALK_LOCALES`. A reorder breaks it silently. **It goes into the gate as part of this work.**
- **One assertion already tests the new order**: `s16 choosing the type with a held file goes straight
  to Step 1`. Upload-first promotes it from side case to main path.
- The file page's wording becomes generic. The start screen accepts `.stl` only today while the bench
  advertises STL, GLB and glTF, so the Drop page must say which it takes — and what a drop mixing a
  project file with models does (today the project file wins and the models are discarded).
- Screenshot names and the `Step 0 · Aligner type` / `Step 1 · Aligner` badge strings move.

### A bug this measurement found, unrelated to the plan

`walkLocale`'s t1 expected task keys `['Aligner supports', 'Any model', 'Open a saved project']`.
`StartScreen.tsx` draws `t('Aligner')`; **"Aligner supports" is in no component and no dictionary**;
and Denture was omitted. t1 failed for every language including English, and the click under it looked
for a button that does not exist — killing the locale pass at its second step, invisibly, because it
is outside the gate. **Fixed**, with the account left in place. (The stale label still appears in
`docs/ROADMAP.md`, `README.md` and `docs/designer-guide.md`.)

### The alternative revision 1 never weighed

**Keep the current three-screen order and accept N files on the existing file screen.** It costs no
section-`s` rewrite, no locale-pass breakage, no badge renumbering — the price this section spends its
length measuring. What it does not give: a per-file verdict and a per-file Appliance before any flow
starts, which is the whole point of the Items page, and a way to tell a mixed case apart. **The row
list wins on that, and only that.** Said plainly, so the price is a choice rather than a consequence.

---

## 7. Sequence

Each step names its files, its exit criterion and its tests. Every new UI element gets a `data-ui`;
every new string gets en / ja / zh-Hant, **zh-Hant in Taiwan wording via Gemini, checked against the
real locale entries, never invented ones**.

**1. Commit what is written.** `src/scenes/`, `src/bench/`, `FLOW_END`, `reviewWayOn()` and its four
sites (`DentalSupports.tsx`, `DentureReviewPanel.tsx`, and two tests — the symbol is `reviewWayOn`,
not `WAY_ON`), the `exportedDental` fix, the walk's `WAY_ON` constant, `x18b`, the `walkLocale` fix.
`graphify update .` first. **By explicit path, never `git add -A`.**
*Exit:* `tsc` 0, suite green, build 0, and the walk's `N FAIL (M checks)` line **read** — not its exit
code, which is 0 regardless. §8 carries `g` and `s17`.

**2. Correct what revision 1 got wrong, in code.** The `SceneScope` comment (`sceneMap.ts:30-38`) and
`src/scenes/README.md`'s multi-file section; `scope`'s justification, or retire the field;
`benchScene.ts`'s header and `BENCH_ARRIVALS` (the `finishDental` arrival is unreachable under
`FLOW_END`) and its test; `ledger`'s `place` in `progressTypes.ts`, `src/progress/README.md:23` **and**
`docs/ui-styling.md:221` — three copies, one guarded by `uiStylingDoc.test.ts`.
*Exit:* no file asserts something another file denies.

**3. Vendor engine 63 and gate it.** One step: `npm run vendor:geometry` brings `b5a71ab` (which
contains 62) and `SOURCE.json` records a pushed commit. **Then `npm run gate:real`, 13 scans.**
Vendoring 62 alone would be a pointless intermediate state whose `repair_mesh` signature is about to
gain a required argument.
*Exit:* `gate:real` PASS, `engineVersion` 63, no golden differences.

**4. Measure the fill limit, and the per-model memory.** Loop `diagnose_mesh` over the 13 scans, read
`take_loops()` (body id, rim length mm), and pick the limit from the distribution by a rule written
down — not the maximum observed. Measure retained bytes per model while there, for §8's row cap.
*Exit:* the constant exists and its comment states the distribution it came from.

**5. The import pipeline** — `src/import/` (new module, README, tests). Diagnose on import after
`prepareImport`'s weld, on the full-resolution mesh; `repair_mesh` behind an explicit press; the
repaired mesh replaces the unit as **one** undo step; the project file stores the repaired mesh and
records that it was repaired. Host branches for the nine per-loop reasons and for
`body-invariant:<step>` (file unchanged), each with operator text in three languages.
*Exit:* a refused repair leaves the unit untouched; each of the four verdict states has a test.

**6. Page names** — `PAGES` beside `SCENES` in `src/scenes/`, with its test and the README map.
**After step 7**, not before: pages 1–2 do not exist until then, and a table of intentions rots.

**7. Upload-first and the Items list** — `src/items/` (new module, README, tests).
`StartScreenId` becomes `upload | items`; `StartScreen.tsx` takes `File[]`, not `files.find(isStl)`;
per-row Appliance and Type need a home and a serialisation (§8); the type screen and
`dentalStage: 'type'` go, and *Aligner Support Production* opens the Start scene; *Open a saved
project* and *Open the workspace* move to the Drop page, keeping both of the bench's doors; the Items
row renders the `ledger` indicator; `PlateFullError` gets a per-row surface. Section `s` rewritten
including `s2b` and `u1a`; `walkLocale` into the gate.
*Exit:* section `s` green, the locale pass green **in the gate**, both bench doors reachable and
asserted in `sceneMap.test.ts`.

**8. The preview strip** — four verdict states, no promise that a filled hole is verified.
*Exit:* one test per state.

**9. Finished-and-kept release** — the `UnitBuild` split (geocore), hung off `exportedDental` and
`addAnotherDental`.
*Exit:* the mesh is gone, the contacts remain, the viewport still draws supports, `planExport` still
emits a supports part.

---

## 8. Still open

- **Per-row Appliance and Type have no home.** `dentalProfile` is one `string | undefined`, `startKind`
  one `useState`, and `src/scenes/README.md` says in as many words that there is deliberately no
  per-object type field. N rows need N of each, plus serialisation into the project file, plus a rule
  for what the per-object loop does per Appliance — a denture skips Step 2 and runs in its own worker;
  Model only skips the object scene. **This is the largest undecided piece, and step 7 depends on it.**
- **Host memory for N models is unbounded.** The unit's mesh stays in `scene.units` by definition, so a
  10-item run holds 10 full models. Neither §5 nor a cap addresses it. **Recommendation: measure it on
  the real scans during step 4 and set a row cap from that number**, rather than guessing one now.
- **`ledger`'s `--red` tone on a routine row.** Recommendation: a token for a neutral background row,
  documented in `docs/ui-styling.md`, rather than an override at the call site.
- **Whether the host should ever offer to drop a noise shell.** Recommendation: **no.** A shell under
  0.001 mm³ is reported and left. Dropping geometry the operator did not ask to lose is the same class
  of act as silent repair, and §3 has just decided against that.
- ***Appliance* or *Purpose*** for level 1. Recommendation: Appliance, the dental word, accepting that
  "Model only" is not literally an appliance.
- **Walk `g`** ("Select to Unselect mid-queue") fails reproducibly, `selected 0` on the **unthrottled**
  stroke. My diagnosis — that `a2` left the switch on Unselect — was **wrong**: pressing Select before
  the measured pair changed nothing. Unattributed; settle it by stash-and-bisect on a quiet machine.
- **Walk `s17`** (Back at Step 1 after s16) times out with the button detaching from the DOM for 30 s,
  which is a re-render loop. `App.tsx`'s diff is semantics-preserving renames plus one new `case`, so
  no mechanism is identified, and no earlier run in this session reached section `s` to give a
  baseline.
