# Resolution — review of `docs/design/2026-11-07-import-and-items-flow.md`

Seven Goldfish reviewers (zoom-out, design, structural, style, comprehension, implementation-readiness,
codebase-details) on the full file, with `egm-goldfish-context-import-flow.md` as the reading list.

Each finding below is **PROPOSE FIX** or **CONTEST**. Contests carry my reasoning; they are not
dismissals. Convergence is noted where several reviewers found the same thing independently, because
that is the strongest signal in the set.

**One finding was a live bug, not a documentation defect, and it is already fixed in code.** See F2.

---

## The four that change the design

### F1 — `ledger` cannot draw what §3 specifies · PROPOSE FIX · **7 of 7 reviewers**

`PROGRESS_DELTA.ledger` is `waiting: 'bar'`; `progressShape('ledger', undefined)` returns `'bar'`;
`progressLayout` grants `inline` only when `waiting === 'spinner'`; `progressTypes.test.ts:86,117`
pins both. So "no percentage, a spinner — spinner left, short text right, one row" is precisely the
layout the module refuses for `ledger`, and `progressTypes.ts:149` forbids a call-site override.

**Decision: the Items row is a pacing bar with a leading label, stacked. §3's sketch is wrong, not
the module.** The module's reason is sound and applies here exactly — *"paces rather than spins so
that a column of rows does not become a column of turning circles"* — and the Items list **is** a
column of rows. Changing `ledger.waiting` would restyle every `JobActivity` row to get a cosmetic
preference on a new screen.

**This overrides an earlier instinct of the owner's** ("for small detail loads, a spinner on left and
a short text on right would save spaces"). That instinct is right for a *detail* load, which is what
`PROGRESS_BASE` and `step` already do — spinner, inline. It is wrong for a list, and the module had
already reasoned it through. Flagging it rather than burying it, because it is the owner's call to
overrule.

Two consequences §3 never mentioned, both now to be written down: `ledger` is `tone: '--red'`, so a
routine import row would inherit the failure colour; and `ledger`'s contract promises "the time,
Cancel and failures", which for one engine call means deciding whether the row offers a Cancel at all.

### F2 — Export wrote the file and Exit destroyed the work · **FIXED IN CODE** · design critic

Not a documentation defect. Under `FLOW_END = 'export'`, `dental.finish` is invisible, so the only
ways out of Step 3 are *Add another aligner* and *Exit*. `exitCommands` (`src/dental/flow.ts:24-32`)
removes the supports and the dental policy of every unit **not** in `dentalFinished` — and OK was the
only thing that ever added one. So: Export STL wrote a correct file, then Exit stripped the plate.
*Save project* afterwards saved a bare model.

**Fixed:** new session event `exportedDental` marks the unit finished without moving the stage;
`dental.export` sends it before exporting. Session-only on purpose — finishing also arranges the
plate, arranging moves the unit, and a moved unit drops the build the export is reading, which would
make `runExport` refuse it as stale.

Pinned by four tests in `src/dental/editing/dentalStep3.test.ts` and new walk check **x18b**, which
presses Exit after Export and asserts both aligners keep their supports and policy.

**Why nothing caught it: x15–x18 all passed, and not one of them pressed Exit after Export.** This
project's own handoff already records the lesson — *"When a step hands off to another step, walk the
handover, not just the step"* — from an identical miss. I wrote that down and repeated it.

### F3 — Import repair was never decided, and would have departed silently from a stated rule · PROPOSE FIX · 4 reviewers

§3 is titled "What happens to a file on import" and its row progress covers "a file being read **and
repaired**", but §7 contains no step that calls `repair_mesh`. Meanwhile
`vendor/mixo-geocore/host/core/removeDegenerate.ts:2` states the house rule in its first line:
*"Explicit repair, never implicit: … Nothing in the host calls this on its own."*

**Decision: diagnose automatically on import, repair only on an explicit press.** This is better than
what I had, and the review forced it:

- `diagnose_mesh` allocates no mesh, so it is free to run on every file and is exactly what the strip
  needs.
- `repair_mesh` returns a **new** mesh — a second full copy of a 373,956-triangle model, per file,
  for "files, plural". Making it automatic imports that cost unasked, against the project's
  lowest-peak-memory rule.
- The operator's printed file would otherwise not be the file they supplied, with no consent point —
  and §3's own limit 1 says a patch is never intersection-tested against the model.

So the house rule stands rather than being broken quietly. The strip reports; a press repairs.

### F4 — The reorder deletes the bench's only doors · PROPOSE FIX · zoom-out

§1's new Start is *Drop* + *Items*, neither holding a task key. But *Any model* and *Open a saved
project* are drawn on the task screen (`StartScreen.tsx:87,89`) and recorded as the bench's only
non-flow entries in `SCENES.bench.doors`, asserted by `sceneMap.test.ts`. §4 spends a subsection
arguing the bench must stay reachable **because of Any model** — and the reorder removes the screen
it lives on.

**This is the same mistake I already reverted once today, by a different route.** The first time I
switched the scene off; this time the reorder deletes its door while §4 argues the door must stay.

**Decision: both doors move to the Drop page** — *Open a saved project* as the link it already is,
and a plain "Open the workspace" affordance for the no-flow path. *Any model* does **not** become an
Appliance value: `onAnyModel` never enters dental mode at all, so folding it into a per-row Appliance
column would conflate "no flow" with "a kind of appliance". F5 is the same error in the other field.

---

## Accepted, with the decision each forces

### F5 — `DentalKind` is vendored, has two values, and "Model only" has no representation · PROPOSE FIX · 4 reviewers

`vendor/.../dental/dentalKind.ts:12` — `'aligner' | 'denture'`, header comment *"the two dental
product kinds the engine has a profile family for"*. `defaultProfileId`, `profileIdsOf` and
`requireKind` are total over the pair (`requireKind` throws), and `isDentalKind` parses **saved
files**. So a third value means widening a vendored type and changing the save format.

I spent a paragraph defending why `profile` must not be renamed because it is a vendored identifier —
and missed that `kind` is vendored too, and is where the risk is structural rather than cosmetic.

**Decision: "Model only" is not a kind. It is the absence of one** — `kind: undefined`, the existing
`onAnyModel` path, no object scene. Level 1 is therefore "which flow, if any", represented app-side,
and the vendored union is untouched.

### F6 — §5's release would break the viewport and the export · PROPOSE FIX · zoom-out, comprehension

`planExport` gives a unit a supports part only when `unitContacts(unit, built.get(id))` is non-empty
(`export.ts:53`), and `supportMeshes` is derived from `built` and handed to the viewport
(`App.tsx:326`). So my proposed test — *"assert `built` has no entry for it"* — specifies a finished
aligner that **draws no supports and exports as a bare model**, breaking §4's "the plate seam stays"
in the same document.

**Decision: Option 1 is withdrawn.** The split I described first and then abandoned is the right one:
`UnitBuild` keeps `unit` and the contact bookkeeping, and the heavy `mesh` is what gets dropped. Also
to be written down: `forgetUnit` already forgets in *both* workers, and `forget()` on a running job
clears `sent` so every other unit re-uploads — so "removing a row gets this for free" is false.

And the trigger has no site: with OK gone, "finished and moved on" is not a single moment in the
code. `exportedDental` (F2) is now that moment, which is a second reason F2's fix was the right shape.

### F7 — Engine 63 unpushed, unvendored, and a breaking signature change · PROPOSE FIX · 6 reviewers

Push is **done** (`8bd2430..b5a71ab`). §7 step 3 still vendors only engine 62, while step 7 calls
engine 63's three-argument `repair_mesh`. And `maxFillLoopMm` is **required with no default**, so the
two-argument form in §3 stops compiling the moment 63 lands.

**Decision: one step vendors `b5a71ab` (engine 63, which contains 62) and runs `gate:real` once.**
Vendoring 62 separately would be a pointless intermediate state with a signature that is about to
change.

### F8 — The verdict table's three states are not disjoint · PROPOSE FIX · style

A file with a real hole but no duplicate vertices satisfies row 1 (`changed() === false` → *"Clean.
Nothing done."*) **and** row 3. An implementer reading top-down tells the operator a holed mesh is
clean, about a file they are about to print.

**Decision: row 1 gains `watertight === true`.** Precedence-by-ordering would work but a table whose
correctness depends on reading order is the wrong artefact for operator-facing text.

### F9 — There is exactly one aligner type · PROPOSE FIX · comprehension, design

`PROFILE_FILES` holds a single entry, `reference-aligner.json`; the denture family likewise; walk `s2`
asserts one card. So the reserved Type column has one option for Aligner, one fixed for Denture, and
none for Model only — a column with no choice in it anywhere.

**Decision: say so, and keep the reserve rule as explicitly forward-looking.** §2 currently argues for
a never-reflowing column from variability that does not exist. The rule is still right for when a
second profile lands; the justification has to be honest about today.

### F10 — Import already welds · PROPOSE FIX · codebase-details

`src/workers/prepareImport.ts:13` — `engine.weld_positions_in_place`, comment *"first-seen weld"*, on
every import. So engine 62's weld step may be closing cracks the host already closed, which undercuts
§3's "welding closes most apparent holes" premise **for this app's import path**. §3 must place
`diagnose_mesh`/`repair_mesh` in the existing chain (weld → centre → capacity → decimate for display,
full-resolution kept as the support/export source) and say which mesh they see.

### F11 — The export cliff is bounded · PROPOSE FIX · codebase-details

`assertPlateCapacity` refuses any import past `TRIANGLE_BUDGET × 4` = 6,000,000 triangles, so
`whole-printable` is capped near ~300 MB rather than unbounded. Still a large single allocation, and
`new Blob([file.buffer])` copies, so peak at download is ~2×. But I overstated it as unbounded growth.

Also accepted: "one buffer per file, released after each download" is not true of the code —
`useExport.ts` awaits the whole `outcome.files` array before looping the downloads, so `separate-*`
holds every buffer at once. What actually distinguishes per-item is **one export task per item**, and
the export client runs `mode: 'per-job'`, so the whole worker heap returns after each one. That is a
stronger argument than the one I made, and it replaces it.

### F12 — "Model only" / "Any model" contradiction · PROPOSE FIX · 3 reviewers
§2 renames it; §1's table and §4 keep *Any model*; the walk asserts the live string in `s1`, `s11`,
`s12`, `enterEditor` and `walkLocale`'s `KEYS`. Resolved by F4: the key keeps its name and its job.

### F13 — The wrong `scope` claim is in three places, and `SceneScope`'s justification is now void · PROPOSE FIX · 3 reviewers
Not just `src/scenes/README.md`: the same statement is the body of the `SceneScope` doc comment
(`sceneMap.ts:30-38`) — the one a code reader meets first — and a whole section of the README.
**And the deeper point:** the README justifies keeping `scope` *because* multi-file would change it.
If Start stays `run` permanently, that justification is gone, so the field needs a new reason or
retiring. By its own rule: *"A field holding a future intention rots."*

### F14 — `benchScene.ts` still tells the old story · PROPOSE FIX · zoom-out, codebase-details
Its header calls the end of the flow one of three arrivals and says *"this is the fact the name exists
to make sayable"*; `BENCH_ARRIVALS` repeats it and a test holds it there. With `FLOW_END = 'export'`
that arrival is unreachable. The README says "not in this build"; the module does not.

### F15 — §7 is not executable · PROPOSE FIX · 4 reviewers
No file lists, no module names for the Items page / row / strip, no `data-ui` names, no locale keys,
one test case in the whole plan, and no exit criterion for five of seven steps. Against the project's
own rule that every step is its own module with docs, tests and the README map updated — which
`src/scenes` and `src/bench` got and this work is not scheduled to get.

Accepted in full. Includes: `data-ui` uniqueness for N rows (the borrowed `ProgressIndicator` carries
no name of its own, so N rows are unnamed by construction — and `src/progress/README.md` records a
walk check that looked at the first of a set and called the rest missing); the unscheduled
`glossary.test.ts`, `japaneseSubset.test.ts` and `uiStylingDoc.test.ts` work; and the Taiwan-wording
rule being stated in §6 where no implementer of §2 will read it.

### F16 — Per-row state has no home · PROPOSE FIX · 3 reviewers
`dentalProfile` is one `string | undefined`; `startKind` is one `useState`; `held` is one `File` and
the drop handler takes `files.find(isStl)`, discarding the rest. `src/scenes/README.md:81` says in as
many words that there is deliberately no per-object type field. N rows need N kinds and N profiles
somewhere, plus serialisation, plus a rule for what the per-object loop does per Appliance (a denture
skips Step 2; Model only skips the scene). None of it is in the doc.

### F17 — The plate's refusal limit is unmentioned · PROPOSE FIX · codebase-details
A screen whose premise is N files must say what a row shows when `PlateFullError` refuses it, whether
the rest of the drop still loads, and whether refusal is per row or per drop. Also: `PlateLedger`
holds imports *outside* `scene.units`, so a row removed before its unit exists is exactly the case the
reconcile misses — which answers the question the context asked and §5 answered by assertion.

### F18 — Accepted nits
`runExport` returns `Promise<void>`; "four `WAY_ON` sites" does not grep (`reviewWayOn`, two
production + two test); `CARD_ICON` has one entry with the fallback at the call site, so per-type art
does not exist; `description[lang]` is already rendered as a `ChoiceKey` note on Step 0, so "unused"
holds only for a row; `--row` is the documented 22px token and should be named instead of the literal;
`Segmented`'s `disabled` is group-level and an empty options array renders a zero-width div, so it
cannot reserve the column — the placeholder is still work; §6's line range and the 20→21 count
(s1–s19 **plus s2b plus u1a**, and `u1a` is a `u`-id inside section `s`, so an id-prefix rewrite walks
past it); `site()` re-creates because the entry is gone, not because the token differs; the preamble
says one engine slice where §3 says two; §8 asks about noise shells with no recommendation, against
this project's own rule.

---

## Contested

### C1 — "No problem statement, goals, non-goals or success measure" · CONTEST IN PART · design

**Accepted in part.** The reviewer's real point is sound: §6 prices the reorder and nothing in the doc
says what operator problem multi-file solves, so the price cannot be weighed. A short problem
statement will be added, and the non-goals that matter (per-row orientation detection, per-row
settings, row reordering).

**Contested:** the full Goals / Non-goals / success-measure scaffolding. This is a working plan
consolidating one session's decisions for the people who will execute them, not a product spec, and a
previous review in this project produced exactly that class of finding and its own final stage
rejected it as a rubric artefact. Adding the motivation is substance; adding the headings is not.

### C2 — "The Alternatives Rule is not met for the Items row and upload-first" · ACCEPTED, recorded as a contest only because I first wanted to argue it · design

I was going to contest this on the grounds that the owner specified both. Checking the standard, the
reviewer is right and the objection is weak: the doc argues alternatives for voxelisation, plate
export and the release options, and then presents its two most expensive decisions as settled. The
cheaper option — keep the current screen order and accept N files on the existing file screen — is
never weighed against §6's price. **Accepted; I will add it.**

### C3 — "Engine-implementation altitude in an app-flow plan" · CONTEST · zoom-out (self-flagged as weak)

The fill strategies and the nine reason strings are not decoration: the verdict table and the strip's
wording depend on which refusals exist, and the three limits depend on where filling stops. I will
trim the triangulation detail to its consequence and keep the reason set, which the host must branch
on. The reviewer said it would not defend this hard.

### C4 — "`data-ui` per row may be implementation detail" · CONTEST REJECTED — accepted instead
The reviewer offered this as possibly demotable. It is not: this project's rule is explicit, and its
own README records a walk check that mistook the first of a set for the whole. Accepted at Major.

---

## Not re-reported

The four items §8 already declares open. The rubric class all seven reviewers correctly declined to
raise. And the absence of `diagnose_mesh` / `repair_mesh` from this checkout, which is expected.

## What the review bought

One live bug that would have destroyed an operator's work after a successful export, found by nobody
else and missable by every green test; two false claims of mine (`ledger`, and the vendored field I
defended being the wrong one); one premise undermined (import already welds); one argument I had
overstated (the export cliff is bounded) replaced with a stronger one (one worker task per item); and
a design decision I had left implicit now made explicitly and better (diagnose on import, repair on a
press, so the house rule stands).
