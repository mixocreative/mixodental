# Import, items and the end of the flow

**Revision 5, after three rounds of seven-reviewer review**; `goldfish_review_report.md` (repo root) records the findings
and their dispositions. The second round changed the shape of the feature, not just its claims: the
per-row Appliance column is **gone** from this release (§2), and the memory split §5 asked geocore for
is **already vendored** (§5).

Each section is marked **built / decided / unstarted**. §7 is the UI, §8 the sequence, §9 what is open.

---

## 0. The problem, the measure, and what is out of scope

**Today the app takes one file per run** — not because the import pipeline is single-file (it is not;
see §3) but because `StartScreen.tsx` keeps one `held` file and takes `files.find(isStl)`, and
`App.tsx` branches the dental flow on `added[0]!`. A technician with a case of several aligners runs
the app once per aligner: **same task, same type, same answers**, re-entered each time.

**So: accept a drop of several files, show each one's state, then walk them one at a time.**

**The measure**, stated as a bound rather than a parity claim: a case of N aligners takes one trip
through the start flow instead of N; peak memory stays inside the existing plate refusal limit
(`TRIANGLE_BUDGET × 4` = 6,000,000 imported triangles); and **no transient copy is added per file
beyond the one `repair_mesh` would return when the operator asks for it — **and in this release it is
never asked**, because repair is cut (see §8 step 9). The release holds no transient copy per file at
all.**

> Revision 2 claimed "no step holds more memory at once than the single-file flow does today". That is
> false twice over: the retained term grows with N by definition (the models stay on the plate), and
> the existing drop loop already accumulates — `App.tsx` builds `const imported: PreparedMesh[][]`
> across every file before adding any unit. Streaming each file into a unit before reading the next is
> a small local fix to that loop and is listed in §7.

**Not in scope:** per-row Appliance and Type (§2 — deferred, with the reason); per-row orientation
detection; per-row support settings; reordering rows; anything that slices or plans the plate.

---

## 0b. THE JOB DECK — the shape this document had wrong

**Revision 6 replaces the per-item wizard with a job deck.** Everything below §1 was written around
one model walking Orient → Area → Supports → Export, repeated N times. That is the wrong shape, and
the measurement in this very document says why: `dentalwork/fixtures/case-aligner` holds **8 models**,
and a real clear-aligner case is a series of stages per arch. Eight passes through a three-step wizard
for one patient is not a workflow.

**It also contradicted a standing rule of this project** — *one global setting inherited by all
streams; extras opt-in*. A per-item wizard asks the same questions once per model.

### The sequence

1. **Drop** → a loading scene while the files are read and each preview is cached. Cancellable: quitting
   mid-import releases the hold (§5).
2. **Purpose, once.** Aligner / Denture / Any model. This cannot come later: `startAligner` calls
   `dentalOrient(…, unit.source, profile, …)`, so **detection takes the profile as an argument** and
   there is nothing to detect against until the purpose is known. The ordering is a correctness
   constraint, not a preference.
3. **The batch runs in the background**, per row, **queued one at a time** — orientation detection and
   the area proposal. N jobs in parallel would multiply peak memory by N and break §0's argument, which
   is the argument the whole release rests on.
4. **The job deck.** One row per model: name, size, verdict, **its own detected orientation**, a
   progress indicator while its jobs run, and a 3D thumbnail that updates when they finish.
5. **Inspect** opens one row. Not steps — **tools**, reachable in any order.
6. **Generate** the supports, then **Export**: per row on the deck, or all / selected.

### Steps become tools

| was | becomes |
|---|---|
| Step 1 orient | **Orient** tool |
| rim define (already a detour, never a step) | **Rim** tool |
| Step 2 area | **Area** tool |
| Step 3 supports | **Supports** tool (the existing Support Edit Mode) |
| Step 3's export | moves to the deck |

**THE CASCADE IS THE RISK, and it is the reason they were steps.** Each fed the next: re-orienting
invalidates the rim, which invalidates the area, which invalidates the supports. Order enforced that
for free. As tools in any order it must be explicit — re-orient a row and its downstream work is marked
stale and re-run, or the row shows supports computed for an orientation it no longer has.
`dentalFlow.invalidate()` and the per-unit `dental` / `rimDraft` state are the machinery; what is new is
the dependency being tracked **per row** rather than implied by which screen is up. One test per edge
of that graph, because this is the part most likely to be got wrong.

### Why the thumbnail is affordable, reversing §7

§7 ruled the preview must be text, on the grounds that a 3D preview per row is the release's only new
per-row memory cost. **That objection applies to N live viewports, not to N cached images.** Rendered
once from the display copy that already exists and kept as a bitmap, a 160 px thumbnail is tens of
kilobytes against a 12.2 MB model. There is no offscreen render path in the app today, so it is new
work — but the memory argument does not forbid it, and the earlier text-only ruling was too
conservative.

### What is already built, and what this costs

Built and still needed: the Drop page, the rows and their `data-ui` naming, the verdict pipeline
(`diagnose_mesh` → `ImportDiagnosis` → `rowState` → `rowText`), `nextItem` / `itemsLeft`, the per-job
export client, and — importantly — **`targets()` already returns every unit when nothing is selected**,
so "one setting inherited by all, overridden per row" is in the code rather than something to add.

Superseded: the per-item **add loop**. §8 7b's *Next item* press and its walk check are **withdrawn**,
not merely unbuilt — building them would build the thing this section argues against.

### One open item this section cannot settle

The sequence calls for each row to be *"auto tuned, fixed, and generated"*. **Repair is cut** (§8 step
9), so nothing presses it: a row can *report* a defect and cannot mend it. Either repair returns —
reversing the cut — or "fixed" is out of scope and the deck reports only. **Recommendation: report
only.** Step 5 measured zero open rims across 18 scans, so the repair that matters here is non-manifold
splitting, and step 9's own brief shows it carrying a worker protocol message, a `SceneCommand` that
replaces `unit.source`, and a 4x import memory peak. That is a release of its own, not a line in this
one.

## 1. Scenes and pages — the vocabulary

**Scenes: built, committed** (`src/scenes/sceneMap.ts`, `src/bench/benchScene.ts`, `e5c5718`).
**Pages 1–2: unstarted.** The table is the target state.

A **scene** is a whole screen. A **page** is **any Back-able screen within a scene**, step or mode or
neither — which is why Rim is a page though it is not a step, and Support edit is a page though a mode
is not a scene.

| Section | Page | Name | Today? | What is on it |
|---|---|---|---|---|
| **Start** | 1 | **Drop** | **new** | Logo, title, drop zone, the *Aligner* / *Denture* / *Any model* keys, *Open a saved project*. |
| | 2 | **Items** | **new** | One row per file: preview, verdict, progress. |
| **Object** | 3 | **Orient** | yes (Step 1) | Orientation and print angle |
| | 4 | **Rim** | yes | The rim drawing — a detour off Orient, not a step |
| | 5 | **Area** | yes (Step 2) | The support area |
| | 6 | **Supports** | yes (Step 3) | The supports, and the export |
| **Bench** | 7 | **Bench** | yes | The workspace at rest |
| | 8 | **Support edit** | yes | Support Edit Mode |
| | 9 | **Zones** | yes | No-support zones |

***Any model* keeps its name.** Revision 2 renamed it *Open the workspace*; the review report's own
disposition said the key keeps its name and its job, and the rename was unpriced. The string is
asserted in `sceneMap.ts`'s `bench.doors`, pinned by `sceneMap.test.ts`, clicked by the walk's
`enterEditor` — whose **seven call sites all sit outside section `s`** — listed in
`walkLocale`'s `KEYS`, and translated in both dictionaries. It stays.

**Two screens go, and both need enumerating.** `StartScreenId` becomes `drop | items`, so **`task`
and `type` and `file` all go**:

- The **task** screen's three keys move to the Drop page (`StartScreen.tsx`, `DentureChoice`), with
  `jobKindOf` / `fileStepText` / `START_HINT` / `startKind` / `goStart` following them.
- The **type** screen goes with `dentalStage: 'type'`, whose real footprint is about fifteen sites, not
  the three revision 2 named: the `DentalStage` union, `initial.dentalStage`, `enterDental`'s only
  destination, `chooseDentalProfile`'s guard — `backDental`'s aligner→type case, the `dental-type` gesture and
  `gestureStatus`, `dental.back`'s visibility rule (literally `dentalStage !== 'type'`), the
  `Step 0 · Aligner type` badge and its two locale keys, the viewport class per gesture kind, and six
  test files.
- **Back at Orient is a decision, not a detail.** Today it leaves the dental session entirely
  (`exit` + `setStartScreen`), discarding `dentalFinished`. With a live Items list mid-case that would
  lose the case's progress, so Back at Orient must return to the Items page **without ending the
  session** — new behaviour, and it sits in the same region as the unexplained `s17` failure in §8.

### How an item is started, and the trap in the obvious way

**This is the rule three review rounds said was missing.** §0 says "then walk them one at a time" and
nothing said who walks them.

**The entry already exists.** `useSelectedAligner` in `App.tsx` is documented as *"Step 1 with the
object already selected on the plate instead of a drop"*: it takes the active unit, checks
`acceptsDentalDrop`, refuses a heavy-tier mesh with a three-language message, and calls
`startDentalAligner(unit)`. **That is exactly what the Items page needs**, heavy refusal included, and
it is already wired to a button. The Items page selects the row's unit and takes this path.

**The trap: never enter an item through `startDental`.** It resets **`dentalFinished: []`**. Use it
per item and the finished tally §4 just built is wiped, so `exitCommands` strips the supports off
every aligner finished earlier in the case — silently undoing the Export-then-Exit fix for the whole
run. `startDental` is guarded on `mode === 'off'`, so it is the way *into* the flow and nothing else.

**And *Add another aligner* is wrong for this world.** `addAnotherDental` sets
`dentalAligner: 'prompt'`, whose words are *"Drop an aligner STL…"* — it asks for a **file**, when
the next item is already imported and on the plate. With an Items list it becomes **Next item**: pick
the next unstarted row's unit and take the entry above. The walk pins the old prompt (`u2`, `u11`,
`x14`), so those checks move with it.

**The invariant, and it is testable:** `dentalFinished` survives every item-to-item transition. A test
asserts that after finishing item 1 and starting item 2, item 1 is still in `dentalFinished` and
`exitCommands` returns `[]` for it.

**Start stays `scope: 'run'`.** One screen handles N items; the per-object loop runs after it.

> The stale `scope: 'object'` claim is in **two** places, both named: `src/scenes/README.md`'s
> multi-file section and the `SceneScope` doc comment in `sceneMap.ts`. (Revision 2 said "THREE
> places, not one" and listed two — the same defect it was correcting.) **Correcting it voids the
> field's justification**: the README keeps `scope` *because* multi-file would change it. If Start
> stays `run`, `scope` needs a new reason or retiring.

---

## 2. Appliance and Type — per run, not per row

**Decided, unbuilt. This is the change the second review round forced.**

| Level | Operator sees | Chosen | Represented by |
|---|---|---|---|
| 1 | **Appliance** | **once per drop**, on the Drop page | app-side; `DentalKind` where one applies |
| 2 | **Type** | **derived from Appliance** | `profile`, via `defaultProfileId(kind)` |

### Why per-row was dropped

§0's problem is *"same task, same type, same answers, re-entered each time"* — **the answers are the
same.** One Appliance for the drop, with a per-row *verdict*, satisfies the measure in full. The
per-row column bought only the mixed-case drop, which §0 never claims as a goal, and:

- **It was the single blocking open item.** It required N kinds, N profiles, a serialisation into the
  project file, and a per-Appliance loop rule — three design decisions, and no step produced them
  while step 7 consumed them.
- **Type is not state at all.** `defaultProfileId(kind)` maps kind → profile, and each family holds
  exactly one profile, so per-row Type would have been a pure function of per-row Appliance.
- **There is no choice in the Type column anywhere today**: `PROFILE_FILES` holds one entry
  (`reference-aligner.json`), the denture family one, and walk `s2` asserts one card. A reserved,
  never-reflowing column for a column with no choice in it was solving a problem that does not exist.

**Add the per-row column when a mixed case is actually asked for.** It then costs what it always cost,
but it costs it against a real requirement.

### What survives

`DentalKind` is vendored and is exactly `'aligner' | 'denture'`, with `defaultProfileId`,
`profileIdsOf` and `requireKind` total over the pair, and `profileData` throwing for an unknown id.

> Revisions 2 and 3 also said `isDentalKind` parses **saved files**. That came from its own doc
> comment; the only call site in the repo is CLI option parsing in `profileSelect.ts`. The save format
> stores no `DentalKind` **value** — a unit's appliance is recorded structurally by `unit.denture`
> being present or absent, and the `kind` the parser validates on the dental policy is
> `'two-contour' | 'legacy'`. (Revision 4 said the save format "never mentions `DentalKind`", which
> overstates it: `normalizeDentureState` calls `requireKind` on a saved `policy.profileId`, so a new
> kind bringing its own profile family *would* change what a saved file may legally name.) **So widening `DentalKind` would not change the
> on-disk shape**; the conclusion stands on totality alone. Reasoning from a comment instead of a call
> site is the failure this round was commissioned to catch, and it survived two revisions inside a
> passage labelled a correction.

So
**"Any model" is still not a kind — it is the absence of one** (`kind: undefined`, no object scene),
which is a run-level choice on the Drop page, exactly as `onAnyModel` is today. `profile` is an engine
identifier and is not renamed.

The visible labels must not be "Kind" and "Type": synonyms in English.

### Icons and tooltips

- `ChoiceKey` takes `note`, but its comment says *"The start screen's keys do not have one"* — so
  Appliance tooltips are **words to write**, in three languages.
- `CARD_ICON` has **one** entry with the `generic` fallback at the call site, so every type but the
  reference aligner draws the same picture: the mechanism exists, the art does not.
- `ALIGNER_PROFILES` carries `description[lang]` in all three languages, and `DentalTypeStep` already
  renders it as a note. The words exist.

---

## 3. What happens to a file on import

**Engine COMPLETE, PUSHED and VENDORED: `6c37d20` (engine 62) and `b5a71ab` (engine 63);
`vendor/mixo-geocore/SOURCE.json` reads `engineVersion: 63`. App side PART BUILT: `diagnoseImported`,
`src/state/diagnosis.ts`, `src/items/rowState.ts` and `PrintUnit.diagnosis` are in and gated (§8
steps 4 and 6). What is left is the pages and the row's words, not the pipeline.**

*This header said "Not vendored — the tree is engine 61. App side unstarted." three rounds after both
became false. A status line that nobody re-reads is worse than none: §8 was the only honest record,
and a reader who trusted §3 would have rebuilt what already exists.*

### The import pipeline is already multi-file

`App.tsx` accepts a drop of many files, loops them, estimates triangles per file, calls
`assertTriangleCapacity`, `assertMemoryCapacity` and `assertPlateCapacity` through `PlateLedger`,
places every imported unit, and only then branches the dental flow on `added[0]!`. The workers exist:
`importClient.ts` (`mode: 'per-job'`, so no worker heap survives a file), `importWorker.ts`,
`importProtocol.ts`, `prepareImport.ts`, `src/state/import.ts`.

**So there is no new `src/import/` pipeline to build.** The one-file assumption lives in two lines —
`StartScreen.tsx`'s `files.find(isStl)` and `App.tsx`'s `added[0]!` — and the work is a per-row
surface over a loop that already exists. That also answers an open question revision 2 carried: the
capacity assertions are **per file inside one per-drop reservation**, so a refusal is already per row.

### Diagnose in the worker; repair on a press

**`diagnose_mesh` runs inside `importWorker`, not on the main thread.** The worker already owns the
full-resolution mesh and a progress channel; a host-side module would mean reading the full-res arrays
back across the boundary to diagnose them, N times, against the lowest-peak-memory rule, and blocking
the UI while a pacing bar it cannot update is on screen. Only the **verdict** crosses the boundary.

**`repair_mesh` runs only when the operator asks.** Three reasons:

1. The host's existing cleanup states the rule in its first line — *"Explicit repair, never implicit:
   … Nothing in the host calls this on its own"* (`removeDegenerate.ts`). Repair-on-press **complies**
   with it rather than departing from it.
2. `repair_mesh` returns a **new** mesh — a second full copy, per file. Automatic means importing that
   cost unasked.
3. The printed file would otherwise not be the file the operator supplied, with no consent point, and
   limit 1 below says a patch is never intersection-tested.

**The alternative, priced: diagnose only.** Ship the Items list with a verdict and a warning, and no
`repair_mesh` in the host at all. That deletes most of §8 step 9 — nine per-loop reasons
branched on in three languages, the `body-invariant` branch, the undo integration, the project-file
change recording that a file was repaired, and the verdict surface. **Repair earns its place in this
release because a holed aligner cannot be printed and the operator currently has no way to fix one
without leaving the app** — that is the whole reason the engine work was commissioned. If that turns
out to be rare in the 13 real scans (§8 step 5 measures it), diagnose-only is the better first ship
and repair moves to the next.

**Where the weld already happens.** Both import paths weld before anything else, but not in the same
place: the **glTF** path uses `prepareImport`'s `weld_positions_in_place` (its comment says *"Bulk
glTF position transform and first-seen weld"*), while the **STL** path — the only format the start
screen accepts, and the aligner path — welds inside the Rust STL session (`stlSession.ts`'s "Takes the
**welded** mesh out of the session"; the `'Welding vertices'` stage is posted by `importWorker.ts`,
not by the session). *Revision 2 cited the
glTF function for the STL path.* The conclusion stands either way: by the time diagnose sees the mesh
the weld's work is largely done, so **the repair's value here is winding, non-manifold splitting and
filling, not welding.**

### Component-wise, and the trap

Repair never fuses two bodies. That rules out voxelise-and-isosurface, which guarantees watertightness
and destroys body identity.

**"Label components, then repair within each" does not work.** A cracked shell is already several
components *topologically* — two triangles meeting along a visible edge but carrying duplicate
vertices are not adjacent in the index buffer. So the engine carries two notions and treats them
oppositely: topological components, which welding is meant to reduce, and **physical bodies,
invariant**. The invariant is enforced at runtime: a step that would move a face between bodies
abandons the repair, `ok()` is false with `body-invariant:<step>`, and the file comes back
**unchanged** with its before-report filled.

Numbers, each derived: weld reuses `Tolerance::Weld`; the body gap is 0.005 mm, 100× that and a tenth
of the 0.05 mm the parts code already calls touching; a noise shell is < 0.001 mm³, reported, never
dropped.

### Filling

```ts
repair_mesh(positions, indices, maxFillLoopMm)   // third argument REQUIRED, no engine default
```

Zero or non-finite fills nothing and reports `fill-disabled`, so no threshold is inherited by
accident. The engine patches a rim by one of three strategies and **refuses** a rim bending past **35%** of
its reach. Nine per-loop codes come back — `''` (filled), `fill-too-long`, `fill-non-planar`,
`fill-self-intersecting`, `fill-too-many-edges`, `fill-not-a-loop`, `fill-degenerate`,
`fill-spans-bodies`, `fill-disabled` — and **the host does not surface nine sentences.** Several name
engine-internal conditions an operator cannot act on, and `fill-disabled` is the one that is
**universal in this release**, not unreachable: the measured limit is 0, so every loop reports it.
(An earlier revision said "unreachable once step 5's constant exists" — exactly inverted, and
contradicted thirty-eight lines later by this section's own table.) The classifier maps them onto **three operator classes**: *filled*, *too long to fill
safely* (`fill-too-long`), and *shape refused* (everything else), with the raw code kept in the report
for diagnostics. **A loop left open always arrives with a reason**; nine codes do not mean 27
strings. (Method and thresholds are in geocore's `docs/mesh-repair.md`; they are engine altitude.)

### Three limits the strip must not contradict

1. **A patch is never intersection-tested against the model.** Safety comes from refusing risky rim
   classes, not from checking the result.
2. **A rim bending past 35% of its reach is never filled.** (Earlier revisions said "a third", which
   does not match the engine's 35% cut-off, and this is the sentence the operator-facing text gets
   written from.)
3. `watertight` means *every* body closed, so one loop left open keeps it false.

### The row's state — by which report, and exhaustive

Revision 2 had one four-row table keyed on `changed()`, a **repair** field, for rows describing a file
on which repair had not run. Two tables, each exhaustive over its own report:

**Before any press — from `diagnose_mesh`:**

| Condition | Says |
|---|---|
| could not be imported | **Could not be read** (`StlFormatError`, `StlEmptyError`, non-finite) — or **Too big for the plate**, naming the limit (`assertTriangleCapacity`, `assertMemoryCapacity`, `assertPlateCapacity`). Two different sentences: a capacity refusal read the file perfectly well. |
| `watertight` | Clean. Nothing to do. |
| `boundaryLoops > 0` | **Holes found.** Reports only — *Repair* is not in this release. |
| not watertight, no open loops | **Winding or non-manifold.** Reports only — *Repair* is not in this release. |

That last row is the one revision 2 had no state for — **and it is the expected case on this path**,
because the weld has already run, so what remains is exactly winding and non-manifold.

**After a press — from `repair_mesh`. NOT REACHABLE IN THIS RELEASE** (step 9 is cut), kept because
`rowState.ts` already implements and tests it and repair returns the day a holed scan exists. Nothing
in the shipped UI can produce any row below, so none of them needs text, `kit.html` markup or a
translation yet.

| Condition | Says |
|---|---|
| `ok() === false` | **Refused, file unchanged**, naming the step. Does not re-offer the same press. |
| `changed()` and `watertight` | Repaired. |
| `ok()` and **not** `changed()` | **Nothing to change.** Reached when the fill limit is zero (every loop reports `fill-disabled`, which is not a refusal) or when a pass finds nothing to move. Not "Repaired". |
| `changed()` and not watertight | Repaired; loops remain, **a reason per loop**. |

A pure function in **`src/items/rowState.ts`** maps a report to one of these, tested on its own; the
strip only renders it. Not `src/import/`, which does not exist, and not `src/core/import/`, which
`importOracleBoundary.test.ts` pins to exactly `estimate.ts` and `stlHeader.ts`.

### Row progress — and which surface owns it

**`ledger`, pacing bar, leading label, stacked.** Revision 1 asked for a spinner inline, which is the
one combination the module refuses for `ledger` — and its reason applies here: *"paces rather than
spins so that a column of rows does not become a column of turning circles"*, and the Items list is a
column of rows.

**But the harder half is ownership, and that is the module's actual rule**: *"one piece of work
belongs to exactly one type."* Import today is a **`blocking`** job (`importClient.ts` passes
`blocking: true`) and already narrates itself as a `ledger` row in `JobActivity`, which also raises
`job-veil` over the screen for an import. So an Items page would show every import **twice** and veil
a page with no viewport behind it. **Decision: while the Start scene is up, the row owns the import** —
`JobActivity` suppresses import-context jobs and the veil is off on that scene. That is a behaviour
change, not styling, and it belongs in the step's exit criteria.

No Cancel on the row: one engine call has no mid-point to stop at. `ledger`'s `--red` tone is the
house progress fill and needs no change (§7).

**`data-ui` keyed to the import's id, never its position** — `items-row-<importId>` — because removing
a row re-indexes every row after it and the project rule is a *stable* name.

---

## 4. Where the flow ends

**Built, committed** (`FLOW_END`, `e5c5718`). Step 3's primary is **Export STL**
(`active-printable`) instead of OK. `reviewWayOn()` is the single decision; both review footers ask it.

### The bug this introduced, and the fix

Removing OK removed the only thing that marked an aligner finished, and `exitCommands` strips the
supports and dental policy of any unit not in `dentalFinished`. So Export STL wrote a correct file and
**Exit emptied the plate behind it**; *Save project* then saved a bare model.

**Fixed** by a new session event `exportedDental`, sent by `dental.export` before the export, which
marks the unit finished without moving the stage. Session-only: finishing also *arranges* the plate,
and a moved unit drops the build the export is reading, which would make `runExport` refuse it as
stale. Four tests and walk check `x18b` hold it.

**x15–x18 all passed and none pressed Exit afterwards.** The project handoff already carried the
lesson from an identical miss — *when a step hands off to another step, walk the handover, not just
the step* — written down, and repeated anyway.

### What that event does and does not mean

It fires **on the press, before the outcome is known**, and `runExport` has at least five paths that
write nothing (no active object, nothing to export, nothing came back, a refusal, a cancel). So:

- **It means "the operator declared this item done."** That is the right signal for *not stripping the
  plate* — a refused export must not cost the operator their supports.
- **It does not mean "a file was written."** So the finished *tally* and §5's eviction must not hang
  off it. They need a successful export, which requires giving `runExport` a result — and §4's
  no-navigate argument does not forbid a return value, only acting on it by navigating.

### Export writes the file and stays on Step 3

`runExport` is `async` and reports every refusal only through the status line. Success and refusal are
indistinguishable to the caller today, so a press that navigated could walk the operator away from a
file that was never written.

### Per item, not per plate

**This app does not slice.** Output goes to a slicer and the slicer arranges the plate.

`encodeStl` allocates one `ArrayBuffer(84 + triangles * 50)`. Revision 1 called that an unbounded
cliff; it is bounded by the plate limit **plus the generated supports**, which the plate guard does not
count — so no single figure is an upper bound, and revision 2's "~300 MB" overstated its own
precision.

And the buffer is not what distinguishes the two anyway: `useExport` awaits the **whole**
`outcome.files` array before looping the downloads, so `separate-*` already holds every buffer at once.
**What distinguishes per-item is one export task per item** — and the export client runs
`mode: 'per-job'`, *"a worker per job that ends with it, so nothing stays"*, so the whole worker heap
returns after each item.

**With one exception, which this work deliberately leaves alone.** `useExport` routes any export
holding a denture to `DentureClient`, built with **no `mode`**, so it defaults to `'persistent'` and
its heap does not return. Revision 4 proposed giving it `mode: 'per-job'`. **That would break the
denture flow**: the client is not an export client — it is *"the only way the app reaches the denture
engine"*, with nine job kinds and a **live-tilt handle held inside the worker across jobs**
(`liveOpen` once per model, then `liveAt` per tilt, then `liveClose`). Per-job would destroy that
handle between `live-open` and `live-at`, breaking Step 1 of the denture workflow, to reclaim a heap
after an export. The missing `mode` is deliberate, and `concurrency: 'serial'` is built on it.

So the per-item claim is stated for the paths it is true of — **Aligner and Any model** — and the
denture export heap, if it is ever worth reclaiming, is its own change with its own justification.
§0's problem is a case of several *aligners*.

**The plate seam stays**: `whole-printable` and `arrangeAlignerCommands` keep working.

---

## 5. Who frees the memory

**Mechanism built; the trigger and the widening are unstarted.**

**Tab closed** — nothing to do. `useProjectFile` already warns about unsaved work.

**Abandoned while running** — release is **driven by the scene**. `App.tsx` reconciles against
`scene.units`: an id no longer there gets `forgetUnit(id)`, and `built` / `failedBuilds` are pruned;
`BuildSessions.forget` frees that unit's session and every handle. Exit, delete, open-over and an Undo
that removes a unit all converge without being asked.

### The seam is already vendored — no geocore change

```ts
export type BuiltSupports = Pick<GeneratedSupportMesh, 'dropped' | 'droppedByZones'>;
export interface UnitBuild<T extends BuiltSupports = GeneratedSupportMesh> { unit: PrintUnit; mesh: T }
```

Engine **61**, already in the tree, is generic over exactly the split revision 2 asked geocore for, and
`export.ts` already takes `ReadonlyMap<string, BuiltSupports>`. **No engine commit, no vendor round,
no second `gate:real`** — revision 2 scheduling one was unnecessary.

**But `BuiltSupports` is not the type to instantiate.** It is
`Pick<GeneratedSupportMesh, 'dropped' | 'droppedByZones'>` — **no `footprint`** — so
`UnitBuild<BuiltSupports>` would contradict step 11's own exit criterion and break `plateLayout.ts`,
which reads `entry.mesh.footprint`. The generic bound permits a wider app-side projection, so the plan
names one rather than leaving the implementer to invent it:

```ts
// src/supports/keptBuild.ts
export type KeptBuild = Pick<GeneratedSupportMesh,
  'dropped' | 'droppedByZones' | 'footprint' | 'unresolved' | 'dentalRimCoverage'>;
```

`unresolved` and `dentalRimCoverage` are there because of the two consumers below. The map becomes
`ReadonlyMap<string, UnitBuild<KeptBuild>>`: still app-side, still no engine change.

### What eviction actually costs, stated rather than denied

Revision 1 deleted the whole `built` entry, which broke the export. Revision 2 said "the heavy `mesh`
is what gets dropped" and asserted the viewport still draws its supports. **Both cannot hold**:

- `supportMeshes` is `new Map([...built].map(([id, entry]) => [id, entry.mesh]))`, handed straight to
  the viewport, which also reads `mesh.unresolved` and `mesh.modelLanded` for its bubbles.
- `plateLayout.ts` reads `entry.mesh.footprint` to give `arrangeOnPlate` a real outline; without it the
  evicted unit is packed by its bounding box, degrading the arrange §4 keeps.
- `App.tsx` reads the build for the problems/verdict freshness comparison.
- **`App.tsx` passes `mesh.mesh.unresolved` to `denture.supports.resolveAll`** — so the *"Support every
  unresolved point from the model surface"* command silently becomes a no-op for an evicted unit.
- **`App.tsx` reads `activeMesh?.dentalRimCoverage?.needsReview`** and the outer/opening `maxGapMm`,
  which is the rim-gap disclosure walk `l4` pins.

Neither of those last two is in `BuiltSupports`, and neither was in revision 4's cost list — they
would have surfaced as test failures. **Either keep the fields in `KeptBuild` or name them as accepted
costs; do not discover them.**

**So an evicted unit stops drawing its support bodies and is packed by its box.** That is a visible
behaviour change and the price of the memory. `dropped`, `droppedByZones` and `footprint` stay; the
geometry (`positions` / `indices`) goes. If that price is too high, the answer is a cap on items, not a
pretence that eviction is free.

### Two facts revision 2 stated and then dropped

- `forget()` on a **running** job clears the client's `sent` map, so every other unit re-uploads its
  model on its next build.
- `PlateLedger` holds an import **outside** `scene.units` until it settles, so a row removed before its
  unit exists is exactly the case the reconcile misses. Unreachable today; **reachable the moment
  removable rows ship**, so it belongs in that step's exit criteria.

---

## 6. What the reorder costs

- **Section `s` is `scripts/walk.mjs:2268–2424`** (`if (runs('s'))` at 2269; the block closes after
  `s19` at 2421 and a trailing mode-clearing Exit) **and holds 21 `check` calls**: s1–s19 plus
  `s2b` plus `u1a`. **`u1a` is a `u`-id living inside section `s`**, so an id-prefix rewrite walks past
  it, and it pins the exact heading *"What would you like to support?"* and footer *"Choose what to
  make supports for."* — both of which move. (Line numbers drift in a dirty tree; re-read them at
  rewrite time rather than trusting these.)
- **Section `s` selects by CSS class, not `data-ui`** — `.start-task`, `.start-screen .choice-keys`,
  `.start-screen .dental-drop`, and the drop is dispatched onto `.start-screen`. The rule "every new
  element gets a `data-ui`" says nothing about those, so the new pages must state their class names
  and the replacement heading and footer strings in three languages, or the rewrite is guesswork.
- **Section `u` tests the type screen directly** (`u0` the single card, `u1` Exit at Step 0, `u2` the
  card going to Step 1). Revision 2 counted only section `s`.
- **`walkLocale` cannot simply go "into the gate"** — but not for the reason earlier revisions gave.
  It runs *instead of* the English walk (`if (process.env.WALK_LOCALES) { … } else await walk(…)`), and
  **nothing ever runs it**: there is no `walk:locales` script in `package.json` and CI runs
  `npm run walk` with no `WALK_LOCALES`. That is the gap — a script and a CI job, not a restructure.

  > Revisions 3 and 4 said "the walk never exits non-zero". **False.** `scripts/walk.mjs` ends with
  > `process.exit(failed === 0 ? 0 : 1)`, and `check()` pushes into the same `results` array for the
  > locale pass too, so the exit code already covers both. The claim came from a reviewer report that
  > I adopted without checking, and it was consistent with what I had seen because **my own shell
  > pipeline masked it**: I ran `npm run walk > file; echo "exit $?"; grep …`, so the status I read
  > was the *grep's*. I then wrote "the exit code is meaningless" into a commit message as a property
  > of the tool. It is a property of how I invoked it.
- The Drop page must state its formats: the start screen accepts `.stl` only today while the bench
  advertises STL, GLB and glTF — **and `.stl` only would be a narrowing of the screen it replaces**,
  since the dental flow's own Step 1 input already accepts `.stl,.glb,.gltf` and the Drop page
  supersedes it. **Recommendations**, since the house rule is never to ask without one:
  a project file in a mixed drop wins and the rest are refused per row with a reason; an unreadable
  file fails its own row only; the Drop page accepts the bench's three formats so the two doors stop
  disagreeing.

### The bug this measurement found, unrelated to the plan

`walkLocale`'s t1 expected a task key *"Aligner supports"* that is in no component and no dictionary,
and omitted Denture. It failed for every language including English and killed the locale pass at its
second step — invisibly, because `walkLocale` is outside the gate. **Fixed**, with the account left in
place. The stale label still appears in **five** files: `docs/ROADMAP.md`, `README.md`,
`docs/designer-guide.md`, `dentalwork/plain-language.md` and `docs/SHIP-PLAN.md`.

### The alternative weighed

**Keep the current three-screen order and accept N files on the existing file screen.** No section-`s`
rewrite, no locale breakage, no badge renumbering. What it does not give: a per-file verdict before any
flow starts, and a single place to see a case. **The Items page wins on that, and only that** — which
with per-row Appliance now dropped (§2) is a much smaller claim than revision 2 made for it.

---

## 7. The UI, in house terms

**Decided, unbuilt.** The feature adds two pages, a row, a verdict and a set of refusal texts. This
section is what the project's own rules require of them, because four guards enforce those rules and
each has caught something in this session already.

### Tokens — and the one this plan got wrong

**There is no app row-height token.** Earlier revisions said "use the documented `--row` token
(22px)". `--row` is declared only in `dentalwork/batch-review/tokens.css`, under a heading in
`docs/ui-styling.md` whose own first line reads *"The tokens of `dentalwork/batch-review/tokens.css`
**that the app does not have**."* So `var(--row)` in `src/styles.css` resolves to nothing and the
declaration is dropped **silently** — and `uiStylingDoc.test.ts` would not catch it, because the name
*is* documented, just in the wrong table.

**DONE.** `--row-height: 24px` is declared in `src/styles.css` and documented in the app's UI table.
**24px, not 22px:** that is what the app already uses — `.panel .unit` carried it as a literal, and the
token now replaces that literal rather than sitting unused beside it. The 22px of
`dentalwork/batch-review/tokens.css` is a denser viewer's figure.

The names are kept **apart on purpose**. `uiStylingDoc.test.ts` asks only whether a token's name
appears *somewhere* in the page, so a second `--row` would have passed the guard while meaning a
different height in a different stylesheet — the exact failure this section was written to avoid.

**`ledger`'s `--red` tone is NOT a problem, and this document was wrong to call it one.** `--red` is
`#7f0019` in `src/styles.css:15` — the house **primary and progress** colour, what `.primary` is filled
with. The failure colour is `--danger` (`#b3261e`), used as an outline and never as a fill
(`styles.css:159`). So a `ledger` bar in `--red` is the progress fill doing exactly what the house
style says it does, and there is nothing to change.

*The error was reading the token's NAME instead of its value* — "red" sounded like an alert, and
`docs/ui-styling.md`'s own table (line 39) lists `--red` as an alias in the `--primary` row, which
reads that way too. One `grep` of `styles.css` settles it. The open item in §9 is withdrawn.

### `data-ui`, and why the row is the hard case

Every new element gets a unique **stable** name. For the Items row that rules out the obvious choice:
`items-row-<index>` re-points every later row when one is removed. **Key it to the import's id.**

And `ProgressIndicator` carries no `data-ui` of its own — the name lives on the `Progress` wrapper and
is per *type*, not per instance. A row that borrows the indicator is therefore unnamed by
construction, so the row must name it: `items-progress-<importId>`.

This is not hypothetical. `src/progress/README.md` records a walk check that looked at the **first** of
a set of identically-named progress elements and reported the rest as missing — a false gap that cost
a round of investigation in this very session. N rows sharing a name would reproduce it exactly.

### Classes the walk already depends on

Section `s` selects by **CSS class, not `data-ui`**: `.start-task`, `.start-screen .choice-keys`,
`.start-screen .dental-drop`, and the synthetic drop is dispatched onto `.start-screen`. So "every new
element gets a `data-ui`" is not sufficient for the rewrite — the new pages must also state their
**class names**, or the walk rewrite is guesswork. `u1a` additionally pins the exact heading *"What
would you like to support?"* and footer *"Choose what to make supports for."*, both of which move.

### House style, and the three-language constraint

Rows are dense, radius 2px, hairlines rather than shadows, light theme only. The chosen state is an
**ink fill with paper text**, never the accent; red (`--red`, `#7f0019`) is the one primary action, the
progress fill, and the current-item marker, and **nothing else**. A destructive row action is a
`--danger` outline, never a filled red. `noColourLiterals.test.ts` fails on a colour literal **and**
on an inline `style={`.

**The sizes: 22px and 11.5px are the house-skill numbers, not this app's.** This app's body size is
`--body-size`, **12.5px** (`theme.css:102`, and `styles.css:1295` uses it with that literal as its
fallback); 11.5px is `--small-size`. And `--row: 22px` is declared **only** in
`dentalwork/batch-review/tokens.css:44`, documented in that file's table at `docs/ui-styling.md:478`.
So the row must either size from an app token that exists or declare one — the remaining real task,
and the only one of the three token questions that survived checking.

Labels must fit at 11.5px in **en, ja and zh-Hant**; a long label wraps the value to its own line and
never clips. zh-Hant is Taiwan wording via Gemini, checked against the real locale entries.

**New concepts need glossary terms.** *Appliance* is a new concept, so `glossary.test.ts` wants a
per-language term for it — the same guard that caught a wrong translation earlier in this session
because zh-Hant needed 支撐柱/支撐頭 and ja 支柱/先端. New ja glyphs mean `npm run fonts` to re-cut the
subset, or `japaneseSubset.test.ts` fails.

### The style book is where these get judged

`kit.html` (`src/kit/Catalogue.tsx`) is the only surface in this app that screenshots cleanly — the
running app lays out at 1685 CSS px and the browser pane captures the top-left corner only. The three
waiting types already appear there, built from `PROGRESS_TYPES` so a new one shows up on its own.

**The Items row and the five reachable row states belong in `kit.html`**, each rendered once, so the
operator wording and the dense layout can be reviewed without importing a file and waiting for a
verdict. That is also the only way to see "could not be read" and "too big" at all, since both need a
deliberately broken or oversized file to reach in the real app. (Five, not nine: the four repair
states are cut with step 9. Derive the list from `ROW_STATES`, never by hand.)

### The two pages, specified

Round 4's loudest finding was that this section states the *rules* for the UI and never the UI. The
only layout line in the document was §1's "preview, verdict, progress". Below is the specification,
written so 7a and 7b can start. **Every name, string and token here is a proposal I am putting in
writing rather than a question held open** — correct any of it and the steps follow the correction.

#### Drop (page 1)

One column, centred as a block, ranged-left text inside it. Top to bottom:

| Region | `data-ui` | Class | Contents |
|---|---|---|---|
| Logo + title | — | `.start-head` | Unchanged from the task screen today. |
| Drop zone | `drop-zone` | `.start-screen .drop-zone` | The whole column is the drop target, as `.start-screen` is today, so the walk's synthetic drop keeps working. |
| Purpose keys | `drop-purpose-aligner`, `drop-purpose-denture`, `drop-purpose-any` | `.start-screen .choice-keys` | The three keys that are on the task screen today, class retained so section `s` keeps selecting them. |
| Open a saved project | `drop-open-project` | `.start-open` | Moved from the task screen. |

**Heading: "What are you making?"** Footer: **"Drop one or more files, or choose what to make."**
Both replace the strings `u1a` pins today (*"What would you like to support?"* / *"Choose what to make
supports for."*), so `u1a` is rewritten with them in 7d.

**The question is named *Purpose*, not *Appliance*.** §9 left this open and it blocks 7a, so: *Appliance*
is already the glossary term for **the object itself** — an aligner, a denture — and reusing it for the
*question about* that object makes one word mean two things in one view, in three languages. *Purpose*
names the question and collides with nothing. `Appliance` keeps its glossary entry for the object.

**Accept list:** `.stl` only, as today. A dropped file of any other type is refused per-file (`4718e21`),
so a mixed drop imports what it can and names what it could not — §6's rule, and walk `m1` already
proves it.

#### Items (page 2)

One row per dropped file, in drop order, in the same single column. The column has a heading
(**"Your files"**), the rows, and one primary at the foot.

| Row part | `data-ui` | Class | Contents |
|---|---|---|---|
| Name | — | `.items-row .name` | The file's name, truncated with the full name as `title`. |
| Preview | `items-preview-<importId>` | `.items-row .preview` | **Not rendered geometry** — see below. |
| Verdict | `items-verdict-<importId>` | `.items-row .verdict` | One of the five sentences. |
| Progress | `items-progress-<importId>` | `.items-row .progress` | The borrowed `ledger` indicator, named here because `ProgressIndicator` has none. |
| Remove | `items-remove-<importId>` | `.items-row .remove` | `--danger` **outline**, never a fill. Calls `reservation.release()` when the unit does not exist yet. |
| Foot | `items-start` | `.items-foot` | The one primary: **"Start with the first item"**. |

Keyed to `importId`, never to an index, for the reason this section already gives.

**The preview is a text summary, not a thumbnail, and this is a memory decision rather than a visual
one.** §0's whole argument is that the release adds no per-file transient copy; a rendered thumbnail
per row would add exactly that — the one new per-row cost in the feature — and at 12.2 MB a model and a
cap of 8 it is the largest thing on the page. So the preview region carries **triangle count and
bounding-box size in mm**, both already in hand (`diagnose_mesh` returns `triangles`; bounds come from
`meshBounds`, which `placeImportedUnits` already calls). A thumbnail becomes worth revisiting the day
a row needs to disambiguate two files with the same name, and not before.

**Icons and tooltips.** Each of the three Purpose keys and the Remove action takes an icon plus a
`title`. The icons are the app's existing set; the tooltips are the only new strings:

| Control | Tooltip (en) |
|---|---|
| Aligner | Clear aligners and retainers. |
| Denture | Dentures and try-ins. |
| Any model | Any other model, with no dental steps. |
| Remove | Take this file off the list. |

**The verdict sentences** — five, because repair is cut. Each is one sentence, ranged left, no period
on the count fragments:

| State | Sentence (en) |
|---|---|
| `clean` | Ready to print. |
| `holes` | Has {n} open edge loops. It can still be printed, but check the result. |
| `malformed` | Has {n} edges shared by more than two faces. It can still be printed, but check the result. |
| `unreadable` | Could not be read. |
| `too-big` | Too big for the plate: {n} triangles, limit {limit}. |

Two things these say on purpose. **Neither defect sentence tells the operator to fix it**, because
nothing in this release can — offering a fix with no press behind it is the worse lie. And `holes` and
`malformed` stay separate sentences even though both end the same way, because step 5 measured them as
genuinely different populations: zero files with open rims, 8 of 18 with non-manifold edges. One
merged sentence would hide which of the two the operator is looking at.

**The row keeps `ledger` as it is.** `--red` is the house progress fill, so the bar is already right;
the only token work is the row's **height**, which has no app token yet. Nothing about the row needs a
call-site override, which the progress module forbids anyway.

#### Memory on quit, restated for these pages

A row removed before its unit exists calls `reservation.release()` — **per row**, not the whole hold.
§9 left this open and L790/L802 contradicted each other; releasing the whole hold would drop the files
the operator kept, which is the opposite of what pressing Remove on one row means. The whole hold is
released only when every row is gone or the scene is abandoned.

## 8. Sequence

Each step names its files, its exit criterion and its tests. Every new element gets a `data-ui`; every
new string gets en / ja / zh-Hant, **zh-Hant in Taiwan wording via Gemini, checked against the real
locale entries, never invented ones**.

**0. Attribute walk `g` and `s17`. — `g` IS DONE: it is pre-existing.**

Checked out `1db2987` (the commit before any of this work), ran `node scripts/walk.mjs --only=a`, and
`g` failed there too — **identical output, `selected 0` on the unthrottled stroke and the same hash
`#811c9dc5`**, and the only failure in that section: `1 FAIL (29 checks) [only a]`. So `g` is **not**
caused by this session's changes.

Two consequences worth keeping. **The "94 checks 0 FAIL" gate recorded in the project handoff for that
commit cannot have been read correctly** — which is unsurprising now that the exit-code mistake above
is known. And **my `g` fix (pressing Select before the measured pair) was unnecessary**; it is
harmless and makes the check independent of what the previous one leaves the switch on, so it stays,
but it was not the cause.

**The criterion is now plain `ALL PASS`.** The full walk passed at `83a4998`: **ALL PASS, 153 checks,
2113 s**, `g` included. `s17` is fixed and passes 5/5, so the old clause "no new failures beside `g`
and `s17`" licensed a regression in a check that works — it is withdrawn.

**`g`'s cause is found, and it was never one question.** The check asserted two things on one line:
that a brush queue formed under CPU throttling (a precondition about the MACHINE) and that switching
Select to Unselect mid-queue leaves the same state as doing them in order (the assertion about the
APP). It failed whenever either gave way, and the text could not say which — which is why this
document called it flaky, then deterministic, then flaky again across three revisions.

The run that settled it: both hashes `#811c9dc5`, **identical**, so the app assertion held; and
`pendingAtSwitch` **0**, so no queue ever formed. The walk's own comment already described this case
— *"too slow and the pointer moves are dropped outright … which is how this failed on this machine at
4x, after already being lowered from 6x"* — and the machine was carrying an orphaned 11 GB dev server
at the time.

So it is split: **`g-pre`** owns the precondition and fails loudly when the machine cannot build a
queue, and **`g`** owns the app assertion and still has to pass. A check that could not run is not a
check that passed, so neither is silenced; they simply no longer share a verdict.

*Step 0 is now done.* The criterion stays plain `ALL PASS`.

**1. Done — `e5c5718`.** `src/scenes/`, `src/bench/`, `FLOW_END`, `reviewWayOn` and its four sites,
the `exportedDental` fix, `src/App.tsx`, `src/components/{ModeEntry,StartScreen,DentalSupports}.tsx`,
both `DentureReviewPanel` files, `DentalBar.test.tsx`, both locale files, the font subset,
`scripts/walk.mjs`, `docs/ui-styling.md`, `docs/design/ui-structure.md`, this doc and the review
artefacts. **Walk now: `1 FAIL (152 checks)`, and the one failure is `g`**, proven pre-existing at `1db2987`
(step 0). `s17` is fixed. So there are **no new failures** from any of this work.

**2. Run the locale pass. — DONE.** `walk:locales` is
`node scripts/walk.mjs --locales=en,ja,zh-Hant` — a **flag**, not the env var, because
`WALK_LOCALES=…` in an npm script is not portable to Windows and this needed no new dependency; it
matches the file's existing `--only=` convention. CI runs it as its own step, because `walkLocale`
*replaces* the English walk rather than adding to it.

**And CI was masking walk failures the same way I was.** The step read
`npm run walk 2>&1 | tee walk-out/walk.log`, and a pipeline's status is the **last** command's — so
CI has been reading `tee`'s. The walk itself exits 1 correctly. Both steps now `set -o pipefail`.
That is how the "Aligner supports" locale bug stayed invisible: nothing ran the pass, and nothing
would have failed if it had.

**3. Correct what earlier revisions got wrong, in code.** The `SceneScope` comment and
`src/scenes/README.md`'s multi-file section (two sites); `scope`'s justification, or retire the field;
`benchScene.ts`'s header and `BENCH_ARRIVALS` plus its test (the `finishDental` arrival is unreachable
under `FLOW_END`); `ledger`'s `place` in `progressTypes.ts`, `src/progress/README.md` **and**
`docs/ui-styling.md`; and `SCENES.start.purpose` / `owns` plus `sceneMap.test.ts`'s `'task'` / `'type'`
literals, **which go stale silently because `sceneOf` takes `string | null`** — the exact failure this
step exists to catch.
*Exit:* `npm test` green and no file asserting what another denies.

**4. Vendor engine 63 and gate it. — DONE.** `SOURCE.json` records
`b5a71abb69c3f4419a7b8f571c4dcb6a7b402ed2`, engine **63**; `vendor:check` 0, `tsc` 0, **1301 tests**,
build 0, and **`real-scan gate: PASS (13 scans)`** with *"No differences."* — the literal line, and no
skip. `host/core/repairMesh.ts` arrived with it, so `diagnose_mesh` and `repair_mesh` are now reachable
from the app. The procedure that worked, kept for the next engine bump: `git fetch`, `git checkout b5a71ab`, confirm
`git branch -r --contains b5a71ab`, a clean `crates`/`host`/`editing` tree, `npm run wasm:build`. Then
here: `npm run vendor:geometry`. The command has **no commit selector** — it vendors whatever the
engine checkout's HEAD is — so the checkout is the step.
*Exit:* `SOURCE.json.engineVersion === 63`; `npm run vendor:check`; `npx tsc --noEmit`; `npm test`;
`npm run build`; and the literal line **`real-scan gate: PASS (13 scans)`** — not exit 0, which
`real-scan-gate.mjs` also returns when it **skips** for want of local scans.

**5. Measure, and set the fill limit. — DONE, and it changed the scope.** `scripts/measure-rim-loops.mjs`
runs `diagnose_mesh` over all 18 local real scans. It prints a content hash per file, never a
filename, because `dentalwork/fixtures/case-*` is clinical data.

**The result:**

| | |
|---|---|
| Open boundary rims, 18 files | **0** |
| Files with a defect repair could fix | **8 of 18** |
| Worst non-manifold edge count | **5,547** (and one file reports **525 bodies**) |
| Largest model held | **12.2 MB** of positions + indices |

**So `MAX_FILL_LOOP_MM = 0.0`** — fill nothing. Not a cautious default: there is **no rim to measure**
in this corpus, so any non-zero limit would be a number nobody has evidence for, and §3's limit 1 says
a filled patch is never intersection-tested. With 0 the engine reports `fill-disabled` on every loop,
which is the honest state.

**Which retires engine 63's filling from this release.** §3 set the valve: *"if holes turn out to be
rare in the 13 real scans, diagnose-only is the better first ship."* Holes are not rare — they are
**absent**. Filling stays in the engine, unused behind a zero limit, until a holed scan exists.

**And it sharpens what repair is for.** §3 said the value here is "winding, non-manifold splitting and
filling, not welding". The measurement narrows it again: **non-manifold splitting**, on 8 of 18 files.
Several are `NOT watertight` with **zero** boundary loops — non-manifold edges break watertightness
without opening a rim, which is why the row states key on both and not on holes alone.

**The row cap follows from the same pass:** 12.2 MB × N for the models alone, before supports. A cap
of 8 is ~100 MB held, which is the number §9's recommendation now has instead of a guess.

*The procedure, for the next time:* Loop `diagnose_mesh` over the 13 scans (a new script under
`scripts/`), read `take_loops()`. **The rule: the limit is the 95th percentile of open-rim length
across the scans, rounded down to 0.1 mm** — p95 rather than the maximum so one pathological scan
cannot authorise filling a rim nobody has judged, and rounded down because §3 limit 1 means an
unverified patch. Lands as a named host-side constant with its derivation and the measured
distribution in its comment. Measure retained bytes per model in the same pass, for §9's cap.
**NO CONSTANT WAS INTRODUCED, and that is the right outcome — but this step's exit said otherwise.**
`MAX_FILL_LOOP_MM` appears nowhere in `src/` or `vendor/`: the only two occurrences in the tree are
`console.log` strings in `scripts/measure-rim-loops.mjs`. The step was marked DONE against an exit it
does not meet, and step 9 was left with nothing to pass to `repair_mesh`.

The honest position: at a measured limit of **0** a named constant would be a parameter with one
possible value and no caller, which §1's own argument against `scope` rejects. So **step 9 passes a
literal `0`** at its single call site, with a comment naming `scripts/measure-rim-loops.mjs` as the
derivation and the 0-rims-over-18-scans result as the reason. A constant is introduced the day a
holed scan exists and the limit becomes a real number — not before.

*Exit (corrected):* the measured distribution is recorded here, the measurement script is
committed.

**6. Diagnose in the worker. — DONE.**

`src/items/rowState.ts` + tests + README: **nine row states as three tested partitions**, pure, no
UI. A test asserts the declared list and the *reachable* set are equal, because this table was wrong
twice — once not exclusive (a holed file matched "Clean"), once not exhaustive (an untouched file fell
through to "Repaired").

**It is in `src/items/`, not `src/core/import/`.** It was written there first, on a reviewer's
suggestion, and `importOracleBoundary.test.ts` refused it: that folder is pinned to exactly
`estimate.ts` and `stlHeader.ts` so the TypeScript import geometry cannot creep back after being moved
to Rust. Widening the guard would have weakened a boundary doing its job — and the classifier belongs
with the Items page anyway, since the importer produces a report and this turns a report into a row.

Step 5's measurement shaped the code: `clean` tests `watertight` rather than counting loops, because
8 of 18 scans are not watertight **with no hole in them**; and `unchanged` is on the common path,
because at a fill limit of 0 every loop reports `fill-disabled`, which is not a refusal.

**And the wiring.** `diagnoseImported` in `prepareImport.ts` runs `diagnose_mesh` on the
**full-resolution** mesh — never the display copy, whose topology is a decimation's and not the
file's — and `importWorker.ts` calls it per prepared mesh after the weld. Only the **verdict**
crosses the boundary: `ImportDiagnosis` is seven plain fields, not the per-body report with
its rim arrays.

`ImportDiagnosis` is declared in **`src/state/diagnosis.ts`**, a leaf module holding that one type.
Five of its seven fields are `Pick`ed from the vendored `RepairReport`: declaring them again shared
57 % of the file's lines with `host/core/repairMesh.ts` and `noDuplicatePackages.test.ts` refused it,
and picking leaves the engine owning their meaning so a rename there breaks this build. An earlier revision of this plan put it on the worker protocol, so that `src/items`
imported it and the UI depended on the worker's output rather than the reverse. That stopped working
the moment the verdict became a saved field: `PrintUnit` would then import from `src/workers/`, and
`src/state/import.ts` — which carries the verdict onto the unit — already imports from
`src/state/project.ts`. Declaring it in `project.ts` drags the whole scene module into the worker
bundle; declaring it in `import.ts` makes `project.ts` import back from a module that imports it. A
leaf is the only home with neither problem, and all four readers now point at it.

`src/workers/diagnoseImported.test.ts` proves the mapping **against the real engine**: a closed
tetrahedron is watertight with no rim; one triangle has a single rim measuring **12 mm** for a 3-4-5
triangle, which is how we know `longestRimMm` carries millimetres and not a count; two tetrahedra
50 mm apart report **2 bodies**; and three triangles sharing an edge carry a non-manifold count — the
case all 8 of the affected real scans land in.

*Build:* `diagnose_mesh` after the weld in `importWorker.ts`, full-resolution
mesh, verdict only across the boundary. `src/items/` (new module, README, tests) holds the host-side
pure classifier — its input is a **union**, `DiagnoseReport | CodedError`, because half of §3's first
table comes from the capacity guards and the STL reader rather than from `diagnose_mesh` — mapping one
of those to a row state, and the three-language text for the **five reachable row sentences**
(`unreadable`, `too-big`, `clean`, `holes`, `malformed`) — derive them from `ROW_STATES` minus the four
that only a repair can produce, never a hand-copied count, which has been wrong at every revision —
the coded import
errors, and the three operator classes the nine `fill-*` codes collapse to.
*Exit:* one test per row state in both of §3's tables, on the classifier, with no UI.

**Persistence, done with this step rather than 7b.** The verdict is saved as `PrintUnit.diagnosis`
and carried over by `placeImportedUnits`. It describes the mesh as imported, so no command touches
it — a repair is the one thing that may replace it, because a repair is the one thing that replaces
`source`. `normalizeUnit` re-checks a saved verdict and **drops a malformed one rather than throwing**,
unlike `rimDraft` and `dental`, which stop the load: those reach the engine, while this is a label on
a row, and a sound project should not refuse to open because a label is corrupt. The gate takes
`diagnosis` out of the `...unit` spread before re-adding it, because `...(ok ? { x } : {})` adds
nothing on the reject branch and so cannot remove a bad value already copied in — the first version
of this gate had that bug and a test caught it.

The verdict also carries **`triangles`**, which no row displays. It is there so the gate can compare
a saved verdict against the mesh it is attached to and drop a mismatch. A stale verdict is the one
failure mode that does not look like corruption — every field parses, and the row states it as fact
about geometry the engine never saw. **Step 9 is the change that would cause it**, since repair is
what replaces `source`, so the check exists before the thing it guards against.

*Remaining for the row:* only the three-language sentences and the row component itself (step 6a,
landing with 7b). The verdict is stored, so a row can now read it.

**6a. The UI groundwork** (§7). Declare the app row-height token in `src/styles.css` and add it to
the app token table in `docs/ui-styling.md`; decide and document the neutral row tone so `ledger`'s
`--red` does not reach a routine row; add the glossary terms for *Appliance* in all three languages;
add the **five reachable** row states to `kit.html` as static markup (derived from `ROW_STATES`, not
listed by hand; the four repair states are cut with step 9) so the wording and density can be judged
without importing a file — **not the row component**, which is step 7b's, because a step must not
need the one after it.
*Exit:* `uiStylingDoc.test.ts`, `noColourLiterals.test.ts`, `glossary.test.ts`,
`japaneseSubset.test.ts` and `i18n.test.ts` all green, and every state visible in `kit.html`.

**7a. The Drop page and the drop loop. — THE LOOP HALF IS DONE; the page is not.**

**Per-file isolation landed.** The read loop sat inside one `try`, so any refusal — a damaged STL, a
triangle or memory cap, a full plate — aborted the whole drop and added **nothing**. Each file's read
now has its own `try`. A **cancel is still the whole drop**: one `AbortController` covers every file
and stopping means the operator wants nothing added, so an abort is re-thrown rather than collected.
The reservation self-corrects, because `adding` never rises for a refused file; with no successes at
all it releases and reports as before. **No new string**: when some files import and one does not, the
refusal wins the status line, because that is the actionable news and the successes are on the plate.

Walk **`m1`**, in its own section so it re-runs in **13 seconds** rather than thirty minutes:
three files, the middle one damaged → `units 2` and the status naming the refused file.

*Remaining:* the Drop page itself — `StartScreenId` gaining `drop`, the task keys moving onto it,
`StartScreen` taking `File[]`, and the reservation-grain decision for a row abandoned before its unit
exists.

**7a (original).** The Drop page and the drop loop. `StartScreenId` gains `drop`; the task screen's three keys
and *Open a saved project* move onto it; `StartScreen` takes `File[]` instead of `files.find(isStl)`;
and the loop restructures for **per-file isolation** — today one `try`, one `PLATE.open()` and one
`AbortController` wrap the whole drop, so a single refusal **aborts the entire drop and adds nothing**.
Per-file try/commit, and the reservation grain decided: `release()` drops the whole drop's hold, so an
abandoned row needs either a per-file `PLATE.open()` or a per-row handle — a `plateLedger.ts` API
change with its own tests. Decide which; do not leave it.
*Exit:* a drop of three files where one is corrupt imports the other two, and the tree is green with
the three-screen flow still working.

**7b. The Items page and the loop** — `src/items/` (new module, README, tests). `StartScreenId` becomes
`drop | items`; the task screen's three keys and *Open a saved project* move to Drop; `StartScreen`
takes `File[]`; the drop loop streams each file into a unit instead of accumulating (§0); the Items row
renders the `ledger` indicator and **owns the import while the Start scene is up**, with `JobActivity`
suppressing import jobs and the veil off; `data-ui` keyed to the import id, and `items-progress-<importId>` on the borrowed indicator since
`ProgressIndicator` has no name of its own. Section `s` **and** the section `u` type-screen checks
rewritten; the Drop page's formats and mixed-drop behaviour per §6. **Removing a row before its unit
exists must call `reservation.release()`** — `PlateLedger` holds that import outside `scene.units`, so
the scene reconcile never sees it, and no other step owns this.

**THE LOOP DOES NOT WORK AS WRITTEN, and this is the step's real design problem.** Earlier revisions
said only "use `useSelectedAligner` / `startDentalAligner`, never `startDental` (which resets
`dentalFinished: []`)". The second half is true and verified (`editingMode.ts:219`). The first half is
not enough, for three reasons read off the code:

- `useSelectedAligner` **returns silently** unless `acceptsDentalDrop(session)`, which requires
  `dentalStage === 'aligner'` (`editingMode.ts:353`, `App.tsx:818`). After item 1 the stage is
  `review`, so the press does nothing at all.
- `startDentalAligner` does not rescue it. It opens with `send({ type: 'dentalLoading' })`, and that
  reducer case is a **no-op outside stage `aligner`** (`editingMode.ts:230`). `startAligner`'s own
  `stale()` then sees `dentalAligner !== 'loading'` and aborts the orient job.
- Neither takes a unit id: `useSelectedAligner` reads `sceneRef.current.activeUnitId`, and
  `startAligner`'s `stale()` requires `activeUnitId === unit.id`. Nothing in the loop sets it.

**But NO new session event is needed, and an earlier revision of this line was wrong to ask for one.**
`addAnotherDental` already makes exactly that transition: stage `review` to stage `aligner`,
`dentalAligner` back to `prompt`, `dentalUnitId` cleared, and `dentalFinished` preserved through
`finished()`. `src/dental/editing/session.test.ts:317` has proven the preservation since before this
feature existed. Adding a second event beside it would have been a duplicate transition — two ways to
leave `review`, drifting apart.

What was genuinely missing is narrower: **which unit**, a question the old flow never had to ask
because it only ever had one. That is `src/items/nextItem.ts`.

So *Next item* is three ordinary calls, and **the order is the whole subtlety**:

1. `selection/set` with `activeUnitId` on the next unit. `startAligner`'s staleness check reads
   `sceneRef.current.activeUnitId` and abandons the orient job if it is not the unit it was handed, so
   the scene must point at the next item **before** the job starts.
2. `addAnotherDental` with the unit just finished — this is what returns the stage to `aligner`.
   `dentalLoading` is a no-op outside that stage, so a job started first would die silently.
3. `startDentalAligner(next)`.

**And item 1's entry is unstated.** `startDentalAligner` needs `mode === 'dental'`, which from `off`
is reachable only through the entry paths this step forbids. Name that path, or the loop has no first
iteration either.

**The multi-file drop is sliced to one file today.** `App.tsx:692` reads
`files.filter(acceptModelFile).slice(0, dentalDrop ? 1 : undefined)`, so while a dental session is
live a five-file drop silently becomes one — the exact case the Items page exists for. The slice
moves behind "is the Start scene up", not "is a dental session live", and a walk check asserts a
five-file drop yields five rows with a session already open.
*Exit:* **not** `ALL PASS` — step 7d owns the walk rewrite, and a step must not need the one after
it. 7b's exit is: `tsc`, the suite, the build, the new `src/items/` tests, a walk check that a
five-file drop with a live session yields five rows, and a walk check that *Next item* reaches item 2
with `dentalFinished` still holding item 1. The whole-walk `ALL PASS` is **7d's** exit, stated once.

*The superseded wording, kept because it was wrong in an instructive way:* `ALL PASS` on the whole walk — not section `s` alone, because `enterEditor`'s seven call sites
all sit outside it — plus `npm run walk:locales` green, and *Any model* still reaching the bench
asserted by a **walk** check, not by `sceneMap.test.ts`, which tests a frozen table and cannot assert
reachability.

**7c. Remove the type screen** — this was step 8, and it moves **before** the walk rewrite: the
section `u` checks (`u0`, `u1`, `u2`) exercise the in-flow type card, so rewriting them while the card
still exists leaves the walk red. Delete `dentalStage: 'type'` and its sites (§1), and make **Back at
Orient return to the Items page without ending the session** — today it sends `exit` and discards
`dentalFinished`, which with a live case loses every finished item.
*Exit:* `npm test` green, and a walk check that Back at Orient keeps `dentalFinished`.

**7d. The walk rewrite** — section `s` (**`s1` at 2331 through `s19` at 2486**, 21 checks including
`s2b` and `u1a`), the section `u` type-screen checks, and the *Add another aligner* → *Next item*
checks (**`x1` at 1940, `x1b` at 1935, `x14` at 2114**).

*This range has been wrong at four successive revisions — 2268–2424 cut off `s14` onward, which are
precisely the checks 7c changes, and `u2`/`u11` are unrelated checks. Re-grep the IDs when this step
starts; do not trust the numbers above either.*
*Exit:* `ALL PASS`, with the check count stated so a dropped check is visible.

**8. — moved to step 7c**, because the walk rewrite depends on it. (Was: remove the type screen.)

> Revisions 3 and 4 said `chooseDentalProfile` is the only writer of `dentalProfile`, so `startDental`
> must become it. **False, and phantom work**: `startDental` already writes
> `dentalProfile: event.profile`, and `switchDentalProfile` is a third writer. Another claim adopted
> from a reviewer report without checking the source.
*Exit:* `npm test` green, and a walk check that Back at Orient keeps `dentalFinished`.

**9. Repair on a press — CUT FROM THIS RELEASE.** Not deferred vaguely: cut, with the condition for
its return stated. **It comes back when a holed scan exists** — at a measured fill limit of 0 the only
thing repair can do here is non-manifold splitting, and a step whose whole purpose is one operation
should not also be the step that invents a worker protocol message, a `SceneCommand` that replaces
`unit.source`, and a 4×-import memory peak.

**What diagnose-only still delivers, which is why cutting costs little:** the operator is told the
truth about the 8 of 18 real scans that carry defects, before they print. That was always the larger
half — §3's own valve said *"if holes turn out to be rare … diagnose-only is the better first ship"*,
and step 5 measured holes as not merely rare but **absent**.

**What the cut takes with it:**

- `offersRepair()` stays in `rowState.ts`, unused and tested. No row renders a *Repair* press, so no
  row needs the press's words.
- **Four of the nine row states become unreachable** — `refused`, `unchanged`, `repaired`,
  `repaired-open`. Step 6a's `kit.html` markup and the three-language sentences are therefore **five
  states, not nine**: `unreadable`, `too-big`, `clean`, `holes`, `malformed`. The nine stay in
  `ROW_STATES` because the classifier is pure, proven and cheap to keep; what is cut is the UI's
  obligation to have words for states nothing can produce.
- The reload question disappears with it. `verdictOfRepair`'s `RepairResult` is unpersistable, and the
  four states it produces were the only ones that could not survive a reload — so nothing in this
  release can show a row the project file cannot rebuild.
- `PrintUnit.diagnosis` can no longer go stale **in this release**, because nothing replaces `source`.
  The `triangles` gate stays exactly as it is: it is the check that makes step 9 safe to write later,
  and it costs one comparison.

**When step 9 returns it owes all of this, which round 4 established and should not be re-derived:**
the *Repair* action on a row, the repaired mesh replacing the unit as **one**
undo step, and what else must follow it: the **display decimation re-run**, the **pick index rebuilt**
(`importWorker` builds it from `display ?? mesh`, so a repaired mesh leaves the viewport picking stale
geometry), and a **capacity re-check**, because filling adds triangles and `assertPlateCapacity` is
consulted only on the import path. **Centring does not re-run**: `prepareImport` centres on first
import and the unit's transform has been the operator's ever since, so re-centring a repaired mesh
would move a model they have already oriented.

**It must also replace `PrintUnit.diagnosis`, and this is not optional.** The saved verdict carries
`triangles`, and `normalizeUnit` drops a verdict whose count is not the attached mesh's — by design,
so a stale verdict can never be stated as fact. A repair that replaces `source` without re-running
`diagnose_mesh` therefore **silently loses the verdict on the next reload**, and the row falls back to
"not diagnosed" on the one file the operator just acted on. So repair returns a new verdict and the
same command writes both fields.

**What the row says after a reload is a narrower question, and the doc owes an answer.**
`verdictOfRepair` takes a `RepairResult`, which is not persistable, so `refused`, `unchanged`,
`repaired` and `repaired-open` — four of the nine states — cannot be reconstructed from a saved
project. Either the four collapse to the three `diagnose_mesh` states on reload (the cheap, honest
option: the file is re-judged on what it now is, not on what was done to it), or a small
`repairedAt`-style fact is saved alongside. **Recommendation: collapse.** A row that says what the
mesh is now cannot be stale; a row that says "repaired" is a claim about history that the project file
would have to keep true.

**The capacity re-check keeps its place, but not its stated reason.** "Filling adds triangles" is
impossible at limit 0. Non-manifold splitting duplicates vertices along split edges and can raise the
triangle count, which is reason enough — and `assertPlateCapacity` is consulted only on the import
path, so nothing else would catch it. A post-repair refusal must leave the original unit intact.

*Exit:* a refused repair leaves the unit untouched; a successful one leaves picking, display,
capacity **and the verdict** consistent, and a saved-and-reopened repaired unit still carries a
verdict that matches its mesh. Plus the standing per-step gate: module + tests + README, `tsc`, the
suite, the build, the walk, `walk:locales`, and — because this step is the first to run `repair_mesh`
on real geometry — `npm run gate:real`.

*None of the above is in this release's scope. It is the brief for the step's return.*

**10. Page names — NOT a step. Deleted, with the reason kept.** Revisions 3 and 4 scheduled a `PAGES`
table beside `SCENES`. It would be a **fourth** enumeration of screens next to `StartScreenId`,
`DentalStage` and `EditMode`, and no code would read it — each of those three is read by code that
needs exactly its own members, so none wants to migrate. That is precisely the rot §1 invokes against
`scope`: a structure holding an intention. **The page names are worth having; a data structure for
them is not.** §1's table and `src/scenes/README.md` carry the vocabulary.

**11. Finished-and-kept release** — hung off `addAnotherDental` and a **successful** export (§4),
never off the bare `exportedDental` press.

`UnitBuild<KeptBuild>` is the right shape for a released entry (**not** `UnitBuild<BuiltSupports>`,
which has no `footprint` — a reviewer claim this doc once carried and which is false). But a
**uniform widening of the map does not compile**, and that is the work this step is actually made of.
The map's consumers need full geometry and say so in their own types: `src/plate/plateLayout.ts`
(`Builds`, read at `plateFootprints`), `src/components/usePlateArrange.ts:16`
(`ReadonlyMap<string, { unit; mesh: GeneratedSupportMesh }>`), `src/components/useExport.ts:26`
(`ReadonlyMap<string, UnitBuild>`), plus `useFixSpot.ts` and `viewport/types.ts`. A live unit still
needs its mesh; only a *released* one does not.

So the value type becomes a **discriminated union** of built-and-held versus released-and-measured,
and each of those five sites is migrated to narrow on the discriminator — a released entry must be a
type error wherever geometry is dereferenced, not an empty mesh at runtime. Name all five in the
commit; a silent `as` at any one of them defeats the step.

**Its stated prerequisite, the row cap, is owned by no step.** §9 called it "rather than guessing a
number now", which is stale: step 5 measured 12.2 MB per model and §9 already carries 8 (~100 MB).
Either step 11 adopts that number and says so, or a step owns choosing it. **Recommendation:** step 11
adopts 8 with step 5's measurement as the derivation; a cap nobody has measured against is the thing
worth avoiding, and 8 has been measured.
*Exit:* the geometry is gone, `dropped` / `droppedByZones` / `footprint` remain, `planExport` still
emits a supports part, and the known cost — the evicted unit no longer drawing its support bodies, and
being packed by its bounding box — is asserted rather than denied.

**But do the cap first, and consider not doing this at all.** §9 concedes the dominant term is the N
full models that stay in `scene.units` regardless; eviction buys the *secondary* term and pays a
user-visible regression for it. **Recommendation: ship step 5's measured row cap, and let eviction be
a later change justified by a measured ceiling** rather than spending a regression in the same release
that introduces the feature.

---

## 9. Still open

- **Host memory for N models.** The unit's mesh stays in `scene.units` by definition, so a 10-item run
  holds 10 full models, and §5's eviction only drops support geometry. **Recommendation: take the
  per-model figure from step 5's measurement and set a row cap from it**, with its refusal text in
  three languages, rather than guessing a number now.
- ~~**`ledger`'s `--red` tone on a routine row.**~~ **WITHDRAWN — it was never a problem.** `--red` is
  `#7f0019` (`styles.css:15`), the house primary and progress colour, not an alert; the failure colour
  is `--danger`, used as an outline only. The item existed because this document read a token's *name*
  instead of its value. What survives is the **row-height token**: `--row: 22px` exists only in
  `dentalwork/batch-review/tokens.css`, so the app has none.
- **Whether the host should ever offer to drop a noise shell.** **Recommendation: no.** A shell under
  0.001 mm³ is reported and left; dropping geometry the operator did not ask to lose is the same class
  of act as silent repair, and §3 decided against that.
- ***Appliance* or *Purpose*** for level 1. **Recommendation:** Appliance, the dental word, accepting
  that "Any model" is not literally an appliance.
- **Walk `g` is FLAKY, and it is not this work's.** It failed at `1db2987`, before any of this work,
  so it is pre-existing. But it is **not deterministic**, and an earlier version of this line said it
  was, on the strength of a single baseline run. At HEAD it has both failed and passed, and the tell
  is in the numbers: when it passes the stroke selects **4**, when it fails it selects **0** — the
  stroke race its own comment warns about. **Three** of my explanations for `g` have now been wrong:
  machine load, the switch left on Unselect, and "deterministic". **Recommendation:** measure the
  rate first, the way `s17` was settled, and only then look for a cause.
- **Walk `s17` is FIXED** (`f4c3500`), and the cause is worth keeping because it is easy to repeat:
  s16 drops a **cube**, which has no findable rim, so orientation fails and **rim define mode opens
  asynchronously** after s16's check has already passed — swapping the dock under the Back click.
  Two weaker settles failed first: `atStep1()` + `quiet()` (which waits on the job list, not the
  dock), and waiting for "Step 1 **or** rim mode" (which matched the badge before the mode opened,
  skipped the Cancel, and left no Back at all). Waiting **for** rim mode and cancelling out of it
  passes five runs of five.

  The process lesson cost more than the bug: I bisected by reverting one file at a time and comparing
  **single runs**, and concluded my own harness change was the cause. For a check that fails 3 of 5
  at one commit, that comparison carries no information.
