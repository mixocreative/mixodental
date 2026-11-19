# The plan — what is next, in order

**This is the only forward-looking document in the project.** Written 2026-11-19, after two reviews
asked what was next and neither could find out: `SHIP-PLAN.md` and `ROADMAP.md` both read as plans
whose every row is done, and `HANDOFF.md` describes a decision from before the deck, auto-gen,
recipes and the Babylon port existed. The plan was real, but it was spread across three sections of
`design.md` that had each finished their own build order — so what got built next was decided by
whichever section was read last. That is how a conclusion reached on 2026-11-07 (the Next/Back wizard
chain has to die) sat unexecuted for twelve days.

**Keep this file current or delete it.** A forward plan that lags is worse than none, because it is
believed. When an item lands, move it out of the list and into `HANDOFF.md`; when a decision below is
made, replace the recommendation with the ruling and its date.

## What this app is

A browser app for preparing dental resin prints. A folder of scans is dropped in; each becomes a card
on a deck; each card is named by kind and type, then either generated unattended or walked through
orientation, rim, support area and supports by hand; the result is exported per object. No server.
Every 3D calculation is in one Rust/wasm core (`mixo-geocore`, vendored) behind workers, with dental
supplied as policy data — that is architecture rule 1 and it has not changed. React and TypeScript
host only. Three languages: English, Japanese, Taiwan Traditional Chinese.

The generic "bench" half is still present and is deliberately kept (`src/scenes/sceneMap.ts`). Which
is the first decision below.

## Decisions waiting on the owner

Each carries my recommendation and the reason, so none of them has to block. If a recommendation is
taken, write the ruling and the date in its place.

### 1. Is mixoDental still becoming dental-only? (D16)

`ROADMAP.md` §"After H" plans A0–A7: package the engine, spike it in mixomesh, move the support UX
there, then **A6, remove the generic UI from mixoDental**. Nothing records it as reversed. But every
hour since has gone the other way: `sceneMap.ts:108` keeps the bench as "a whole half of the app" on
purpose, and the Babylon port wired all 40 viewport props including it.

**Recommendation: mark D16 superseded, keep the bench.** Two reasons. mixomesh is 51 engine versions
behind with no re-vendor scheduled (`design.md:3206`), so A6 would strand generic users with nowhere
to go. And the Babylon port's own justification is a shared vocabulary with mixomesh — a convergence
no plan schedules, which means the port is currently paying for a benefit nothing will collect.
Deciding this also decides whether the bench's Babylon work was investment or waste, which no
document can currently say.

### 2. When does three.js come out?

The acceptance test was written down and met: *the walk passes with `?renderer=babylon`; only then
does three.js come out*. It passed in full on 2026-11-17 at 186 checks. The walk is now 199, three.js
is still the default (`src/ui/renderer.ts`), and the only Babylon run since is 30 checks.

**Recommendation: set the flip condition as the full 199-check walk green under
`--renderer=babylon`, twice on different days; then flip the default in one change and delete the
three.js viewport in the next.** The reason is cost, not taste: every new gesture now costs two
adapters, and last night's support-tip drag paid that toll on a bridge nobody has scheduled closing.

### 3. Auto-accept, or the auto-gen key?

Two designs exist for the unattended run. The flow map §3.3 describes a robot that runs the whole
chain per card unprompted, finishing clean cards unopened. What shipped is a key the operator presses
(`src/autoGen/`). The flow map still lists auto-accept as future, gated behind the undo rule — and
still says "only the orient stage runs today", which stopped being true the night it was written.

**Recommendation: the pressed key is the answer; mark §3.3's robot superseded, and keep "clean cards
finish unopened" as a later option that stays gated on the undo rule.** Unattended mutation with no
reachable Undo is exactly the shape of the two data-loss defects at the top of the list below.

### 4. May the deck keep a copy of a model whose original is gone?

The deck store design (`design.md`, card-deck ask 8) keeps this device's copy so a card survives an
unplugged drive. It flags its own question and leaves it open: that leaves patient geometry on the
device after the original was deleted.

**Recommendation: do not keep the mesh.** Keep the card, show the *missing* state, and offer re-link
through the file picker — which the design already needs for the *changed* state. A lab deleting a
file is the nearest thing to a retention instruction the app will ever get, and an app that quietly
overrides it cannot explain itself to the patient it belongs to.

### 5. Who checks the "deferred until evidence" triggers?

`ROADMAP.md` §"Deferred until evidence" is eight items, each with a written trigger (a measurement, a
real file that defeats a detector, a maintenance window). Nobody owns checking them, and at least two
look plausibly met now — C2's legacy fill, and E3's one-second Step 3 change.

**Recommendation: check all eight once, at the next milestone, and write the date of the check beside
each.** A trigger nobody reads is a deferral that has quietly become a decision.

## The order

Ranked by consequence, not by size. Each item says what proves it done.

### Now — the app loses work, and makes a claim it cannot support

1. **The denture flow has no browser coverage at all.** The walk's sections are `a, m, q, r, u, x,
   l, s` and every one of them drives an **aligner** (`PUBLIC_ALIGNER`, or case-001's aligner;
   `answerCase` defaults to `reference-aligner`). Nothing anywhere drives a denture through orient →
   supports. Half the declared product is unexercised, there is no shipped denture model for a fresh
   clone to walk, and the local `case-denture` fixture is git-ignored like every case directory.
   **This is the item that lets the rest of the denture gaps hide.** **Done when** a denture reaches
   built supports under a check, with the fixture's absence skipped by design and counted, the way
   `gate:real` already handles owner-only scans.

   *A retraction and its reversal, both on the record because the sequence is the lesson. This slot
   first said a built denture loses its supports on reopen, traced but unrun. One browser run did not
   reproduce it, so I retracted it. **Three further runs reproduce it every time**, and the defect is
   now item 1a below, confirmed. The non-reproducing run was a flake in which the reopen left the
   unit unbound — Step 1 drew "Add the denture STL" over a loaded model — so no scan ran and nothing
   was destroyed. **One run refutes nothing; a flaky repro needs repetition before a verdict in
   either direction.** The unbound state is itself unexplained and is listed below.*

1a. **~~Reopening a built denture destroys its supports AND discards the operator's print angle.~~
   FIXED 2026-11-20, `956a697`.** `opensAtSupports(unit, profile)` in `src/dental/flow.ts` is now a
   pure rule with six tests, asking each kind's own field, and the reopen lands on Step 2 with the
   supports and the pose intact — re-confirmed in the browser 2 of 2. The record of the defect
   follows, because the dead guard is the thing to recognise again.

   Confirmed in a real browser, 3 of 3 runs with the dial moved. Built at the operator's chosen 16°,
   rotation `[3.036, 0.038, -3.112]`, `supports: true`. Reopened: rotation back to the automatic
   pick's `[-3.108, 0.038, -3.112]`, `supports: false`. The chain is the one first traced:
   `App.tsx:1391`'s `built` tests `unit.dental`, which a denture never sets (it writes
   `unit.denture`), so a denture cannot take the open-at-supports door; the ordinary door runs
   `start`, which scans and calls `turnTo(unit.id, scan.rows[index].rotation)`
   (`useDentureOrient.ts:127`); `turnTo` dispatches `transform/set`, which deletes `supports`,
   `manual`, `deleted` and `contactSettings` on any non-vertical turn (`project.ts:258-287`).
   **It needs the pose to differ from a fresh scan's pick** — press Next on the automatic pick and
   `reorients()` correctly spares everything, which is why the first run looked clean. Choosing the
   print angle is the whole purpose of Step 1, so the ordinary case is the broken one. **The lost
   pose may matter more than the lost supports: it is the clinical decision.** Card-deck ruling 2 was
   applied to aligners only. **Done when** a built denture reopens on its supports with the pose
   intact, under a check. Fixing it needs two decisions Fable already named: make `built` job-aware,
   and give orient an entry that does not re-detect and turn.

1b. **Unexplained:** in one run the reopen left the unit unbound — Step 1 showed the profile name and
   "Add the denture STL" while the model sat loaded with its supports. Seen once in four runs. **Do
   not make it a check until it is understood.**

2. **The app carries no "not clinically validated" label.** `README.md:33` says it — *not clinically
   validated: check every result before printing* — and `SHIP-PLAN.md` §External validation requires
   the app to ship labelled. Nothing in the shipped strings says it. **Done when** the operator sees
   it where a print decision is made, in all three languages. Batch the strings into one Gemini
   request (20 a day, `docs/translation/README.md`).

3. **The undo rule.** The flow map gates auto-accept behind it because "auto-accept is what mutates
   four tools' worth of state unwatched" — and auto-gen shipped without it. A stopped run leaves a
   turned model, and Undo is unreachable from the deck (`src/autoGen/README.md`). The undo floor is
   currently per *step* (`flow.ts`, `App.tsx`), which is also the piece every item in the next
   section rests on. **Done when** an auto-gen run, finished or stopped, is undoable in one step from
   the deck, and the floor is per mode rather than per step.

### The engine change the owner ruled for — prepared, deliberately not executed

**Ruling (2026-11-20): one policy mechanism for both kinds.** The app-side half is **done and gated**
(`4a27bcc`): the aligner review was dropping the engine's named rules, and now threads them, proved
by `gate:real` PASS over all 13 scans with "No differences". What remains is in the engine repo
(`S:/ai/mixo-geocore`), in two steps, and it is **written down rather than done**:

- **B — collapse the denture overloads.** Delete `denture_policy`, `denture_review` and
  `denture_tilt_scan`, rename the three `_ruled` variants to those names, so every entry takes
  `rules`. Mechanical: the three being removed have **no JS caller in either repo**; the only
  references are their declarations in `host/dental/dentalEngine.ts`, plus two type-key strings in
  this repo (`src/denture/engine/dentureCore.ts`, `dentalwork/batch-review/profileSelect.ts`).
- **C — give `dental_policy` a `rules` parameter.** It has exactly two attachment points: the add-on
  placement closure (`crates/geometry-wasm/src/dental_area.rs:101-106`) and the debris size
  (`crates/geometry-core/src/dental/aligner_parts.rs:53`). **Both run only for MULTI-PART aligner
  files.** `dental_tilt_scan` must NOT gain one — nothing would read it.

**Why it is not done.** Three reasons, and the first is the one that decides it:

1. **B alone does not satisfy the ruling** (the aligner policy still takes no rules) and **C's whole
   reach is multi-part aligner files**, which 2 of the 13 baseline scans cover. The capability the
   ruling was *for* — turning a rule and seeing an aligner change — is already delivered by the app
   fix, and separately shown to move nothing on the reference aligner.
2. **C is the one step a reviewer called risky**, with named hazards: the parts cache is keyed by
   debris bits (`supports/file_parts.rs:82`), so an override adds a second cached split per model;
   and preview and build must receive identical rules or `filterDentalPlacement` makes them disagree
   about add-on tips. Those want a clear head, not 02:30.
3. It is a **clinical engine**, and the change costs a version bump, a wasm build, a vendor bump and
   a full cross-repo gate. A wrong change there is worse than a late one.

**Everything needed to execute it is ready:** the toolchain is present (cargo 1.99.1,
`wasm32-unknown-unknown`, `wasm-pack` in the engine's `node_modules`), the call sites are enumerated
above, and the parity proof is `gate:real` on all three kinds plus the full local gate. **Done when**
every dental and denture entry takes `rules`, an empty array provably equals the default
(`PlacementRules::default()` already *is* `from_overrides(&[])`), and `gate:real` reports no
differences.

### Next — one decision, one place

4. **One reader for the orientation result.** The card reads five doubts
   (`src/items/detectState.ts`), the editor reads three notices (`src/dental/stages.ts`), and
   `opening === 'ambiguous'` is read **only** on the card — so a card can say "Check orientation" for
   a reason Step 1 will never show. This is the defect class `stages.ts` was created to delete, one
   level up. **Done when** both read one function and a test fixture with an ambiguous opening
   reaches both surfaces.

5. **The tool rail comes back and the step rung goes.** The conclusion is already recorded
   (`design.md:1282`: steps are needed only when the user must make a decision that determines what
   the next decision is — *none of the four tools does*), and the replacement design was removed from
   the deck and handed to `mixomesh/port/mixosupports/toolrail/` with its own `RAIL-RULES.md`;
   `src/deck/README.md` says "inside a flow… the rail is right. It was only wrong here." So: bring
   those rules back as the flow's panel, move the undo floor and "every step opens on Select" from
   step to mode, and keep the `dentalStage` stale-answer guard that every reducer case depends on.
   **The constraint that binds the order:** walk `x0p` compares the editor against auto-gen and needs
   a hand-walkable route, so Next/Back cannot go until the walk is re-expressed as mode entries, in
   the same increments. **Done when** the walk drives modes instead of steps at no fewer checks, and
   `backEntersOrient`, `backLosesWork`, `backCommands` and `dental.finish` are deleted.

### Then — the operator's last five minutes, and the scale they were promised

6. **Folder export** through `showDirectoryPicker`. It was step 2 of the flow map and waits on no
   open question; it is deferred because the walk cannot answer a native dialog. A test limitation is
   deciding a product gap on the primary user's last five minutes. **Done when** 30 objects export to
   a chosen folder without 30 prompts, with the picker path covered by a note saying why no walk
   check guards it.

7. **Export one unit per task.** `exportFiles` builds every support and every file buffer and
   transfers them together: about 1.26 GB at 60 models. The symptom is an export that dies at the end
   of a session, after all the work. **Done when** peak memory is flat in the number of objects.

8. **Free the mesh worker's per-unit session.** `scripts/perf/deck-scale.ts` measured +19.7 MB per
   item, flat at −0.09 MB once `sessions.forget(id)` is called, costing 6.2 s → 8.6 s per item. The
   on-screen readout is currently the only guard. **Done when** the measurement is flat and the
   script is the test.

9. **Denture parity.** No denture `stages.ts` (its decisions sit inline in the orient hook), no batch
   detection, no auto-gen pipeline, no recipes. Dentures are half the declared product and
   second-class at case scale. **Done when** a denture card auto-gens and the parity test covers it.

10. **The deck store** — gated on decision 4 above.

### In parallel, because it is owner- and engine-gated and it decides whether the rest matters

11. **Validation evidence.** Every profile number traces to one reference aligner and one
    owner-supplied ideal. No physical print is recorded anywhere in this repo. `gate:real` over 13
    scans asserts *no differences*, which is regression, not correctness. **Done when** the folder
    review has run on all 13 local scans with a few printed and the outcomes written down — at which
    point item 2's label can say something more specific than a warning.

12. **Night guard and retainer.** The art is drawn and marked `unwired`, and the engine handoff is
    written, but `DentalKind` is still `aligner | denture`. The review's blunt finding: the commonest
    user arrives with an object the app cannot name. **Done when** the kinds exist in the engine and a
    card can be named one.

13. **The licence audit (A0).** Per-file provenance of `supports/`, `core/` and `generic/` — several
    files cite Blender nodes or follow OpenVDB — then set `license` in `Cargo.toml` and rewrite or
    gate what cannot ship. It needs a ruling on derived versus re-implemented, possibly counsel. It
    has been the first row of the "After H" plan since October and appears in no handoff since.

## Not scheduled, and named so the silence does not un-know them

- Aligners with no central opening (deferred, D17).
- A case cannot survive a tab close: there is a `beforeunload` handler, no autosave.
- No case-level Check; Arrange has no stated purpose now the build plate is retired.
- Both brush strokes stay outside `dragSession` (every brush ending commits, so Escape through it
  would commit a stroke the operator asked to abandon); so does the transform gizmo, which takes the
  camera through Babylon observables rather than window listeners.
- The Babylon tip drag has no landing preview, deliberately — `editPreview` is driven by a canvas
  pointermove and would freeze the moment the drag left the canvas.
- Tree and Brace are not on a hand-drawn or painted area's policy (`src/recipes/README.md`).
- The unexplained walk note after `a4m`: no support pickable right after a move. Sound by hand, and
  each of the mesh, the camera and the probe's own Escape is ruled out by measurement. **Do not make
  it a check until it is understood.**

## The documents this one replaces, and the ones it does not

| document | what it is now |
|---|---|
| `SHIP-PLAN.md` | **live rulebook, not a plan.** Architecture rules 1–9 (cited by number in `scripts/geometry-guard.mjs` and `scripts/test-support/supportParityHarness.ts`), the authoritative ABI table, the gate definition, the validation track. Its progress table is a record of a finished branch. |
| `ROADMAP.md` | **live principles and decision log** (D1–, cited as "ROADMAP F" by `scripts/perf/tilt-scan.ts`), the verification tiers, the deferred-until-evidence triggers and the cross-cutting rules. Its step list is a record; its "After H" section is decision 1 above. |
| `HANDOFF.md` | the running engineering handoff: what landed and what it cost. Not a plan. |
| `design.md` | the dated records of what was decided and why. Their build orders are finished and are not the plan. |
