# The type pipeline — from the workbench to the app

Written 2026-11-20 in answer to the owner's questions about the Orient node and `register_profile`.
Every "as read" fact below was opened in source on that day (engine 69, geocore `b193d71`, the commit
`vendor/mixo-geocore/SOURCE.json` pins). **Anything marked PLANNED does not exist yet.** Paths that
start `crates/` or `host/` are in the `mixo-geocore` repo; everything else is this repo.

Companion pages: `docs/NODE-PLAN.md` (the nodes), `benchwork/README.md` (the proving loop),
`docs/design.md` *WHO OWNS A NUMBER* (the ruling this page builds on), `docs/dental-kinds-and-types.md`.

---

> **AS BUILT, 2026-11-20 night - this box overrides the planning text below where they differ**
> (Fable's gap review found the text describing things as PLANNED that now exist):
> - **The door exists:** engine 70 has `register_denture_profile` and `register_aligner_profile`; each
>   returns the type's **id** (not a digest) and every call then accepts that id. Lookup by digest was
>   not built and is not needed: the type file keeps its own fingerprint.
> - **Start angle:** built as an OPTIONAL `pose.tiltStartDeg` under schema 1 (owner ruling 5: "a
>   fallback default") - absent means 0, upright. No schema 2.
> - **The type file:** `src/dentalTypes/typeFile.ts` (not `types/typeFile.ts`). Its fingerprint is its
>   own `typeDigest` over the one writers' text, so it never needs the engine.
> - **Parity:** both halves RUN - section 6's P1 row has the numbers.
> - **Aligner rules:** an aligner reads `overhangAngleDeg` (the shared supports layer); a type file may
>   pin exactly the rules `benchwork/rules.mjs` says its category reads, and no zone graph.
> - **The loop runs (2026-11-20, proved on the page):** the Orient node's start / end / step / margin and
>   a type name are fields; Apply drafts the type from the built-in (`dentalwork/batch-review/typeInForce.ts`),
>   registers it, runs it and writes `type.json` with its proof; **Save type** copies that into
>   `types/<category>/<id>.type.json` (`types/README.md`); `benchwork --type <file>` runs a saved one.
>   Proof: start 10 / end 20 gave a search of 10-20 (picked 10, where the built-in picked 8); the saved
>   file read back VALIDATED; `--type` on it reproduced 10 deg with the identical profile fingerprint.
> - **The zone graph is still ONE global engine slot.** Until it is registered with the profile (E3),
>   the app must refuse a type that carries a graph rather than run it on the default wiring.

## 1. The answer, in plain words

**`register_profile` is not replaced by what the workbench makes. It is the door the workbench's
output walks through.** Think of it as three things:

- **The type file** is the *thing you make*: one saved file per type, holding every number, every
  turned rule and the zone wiring. The workbench (the review page with the node editor, plus
  benchwork) is where you create it, edit it and prove it. This file is what you "set, save and export".
- **`register_profile`** is the *door*: the one engine call that lets the app hand the engine a
  type's numbers at run time. Today that door does not exist - the numbers are baked into the engine
  when it is compiled, which is exactly why the Orient node's start / end / step are greyed out.
- **The built-in profiles** (Generic denture, Generic aligner) stay inside the engine as the
  factory defaults and as the starting copy for any new type. They are not thrown away.

So yes: the print-angle search belongs in the Orient node, and yes, the app will run what the
workbench saved. The bridge is: **workbench saves a type file -> the file is committed into this
repo -> the app bundles it -> at start-up the app registers it with the engine -> the type appears
in the type picker and runs with exactly the numbers that were proved.** Nothing is retyped by hand
anywhere on that path, and a file the engine cannot honour is refused by name, never run "close enough".

---

## 2. The nouns

| Word | What it is, plainly | Mechanism (geocore) | Values (mixodental) | On disk today |
|---|---|---|---|---|
| **Category** | The kind of printed item: `denture` or `aligner`. A category is **code** - its own detection and placement chain. | All of it. `DentalKind` (`host/dental/dentalKind.ts`). | none - a category cannot be supplied as data (`NODE-PLAN.md` section 5) | engine source |
| **Type** | One named recipe inside a category ("Generic denture"). A type is **data**. | reads it | all of it | today: one profile JSON per type, inside the engine |
| **Profile** | The type's *numbers*: upright rule, print-angle search, tip spacing, support sizes. | the field names, units, strict parse, legal ranges | the numbers | `crates/geometry-core/src/dental/denture/profiles/reference-denture.json`; a generated copy for the host in `vendor/mixo-geocore/host/dental/dentureProfileFiles.ts` |
| **Rules** | ~130 named planner dials. A type may pin some; the operator may turn some per job. | names, defaults, what each does (`crates/geometry-core/src/supports/rules.rs`) | the pinned values | passed as an array with each run; benchwork turns 13 (`benchwork/rules.mjs`) |
| **Zone graph** | The wiring that decides which faces may carry tips (stage 2). | node kinds, the evaluator, what is refused (`crates/geometry-core/src/dental/denture/zone_graph.rs`) | the wiring | not saved as part of a type; `zone-graph.json` beside a review run |
| **Type file** | **PLANNED.** One file = one type: category + id + profile + pinned rules + zone graph + what proved it. | validates every part | the whole file | **PLANNED:** `types/<category>/<id>.type.json` in this repo |

Two things that are true today and that the type file exists to fix:

- **A type's three parts live in three places.** The numbers are compiled into the engine; the rules
  are in `benchwork.json` beside a run (`benchwork/cli.mjs:158-164`); the graph is in `zone-graph.json`
  beside a run. Nothing ties them together as "this is the type".
- **The app cannot run an edited graph at all.** Nothing under `src/` calls `setZoneGraph` (searched
  2026-11-20) - only the review batch does (`dentalwork/batch-review/batch.ts:41-48`). So today the
  app always runs the default wiring.

---

## 3. The lifecycle of a type

```
 CREATE / EDIT            PROVE                 SAVE              SHIP               RUN
 workbench, 3 stages  ->  benchwork on     ->   type file    ->   commit + app  ->   app registers it,
 (review page)            real scans, gate      written           build              operator picks it
```

**Create.** "New type" starts by choosing a category, then copies the nearest existing type
(`docs/REVIEWER-UI.md` section 3: a type cannot move between categories - the two profile shapes
share no fields). A new *category* is an engine project, not a workbench action.

**Edit - which stage edits which part of the file:**

| Stage in the editor | Edits | Part of the type file | State today |
|---|---|---|---|
| **1 Orient** | print-angle search (start, end, step, margin); later the upright numbers | `profile.pose`, `profile.upright` | read-only (`viewer.html:913`) - waits for the door |
| **2 Zones** | the node canvas | `zoneGraph` | **works** in the review (engine 69); 7 edits refused by name as "fixed" |
| **3 Support settings** | pinned rules; later tip spacing and support sizes | `rules`, `profile.placement`, `profile.supports` | 13 rules work; profile numbers wait for the door |

**Prove.** Apply runs the real engine on a folder of real scans (about 23 s a case, measured) and
shows the result. Before a type is trusted it must also pass `npm run gate:real`. The proof is
recorded *in the type file* (section 4, `validation`): which scans, which engine, which counts.

**Save / export.** PLANNED: a "Save type" action in the review page writes the type file. Until a
type has a passing proof recorded against its current contents it is labelled **UNVALIDATED**
everywhere it can be picked - allowed, but never unlabelled.

**Ship.** The file is committed to this repo and bundled into the app at build. Values are
mixodental's, so they live in mixodental's repo, under review like any other change.

**Run.** At start-up the app registers each bundled type with the engine and gets back a
**digest** - a fingerprint of the exact contents. The type then appears in the picker
(`src/components/purposes.ts:75` already lists whatever the engine side reports).

**Fingerprints and the cache.** The engine already caches by the profile's *content* fingerprint,
not its name (`crates/geometry-core/src/dental/cache.rs:31-44`, `denture/profile.rs:176-187`), and
the zone graph's fingerprint is already in the analysis cache key (`zone_graph.rs:334-339`). So an
edited type can never be handed the old type's result. That groundwork is done.

**When the engine changes under a saved type - refusal by name, never silent:**

| What changed | What happens at load | What the operator sees |
|---|---|---|
| Profile shape changed (a field added or removed) | the engine refuses: "denture profile schema 1 - this engine reads 2" (`profile.rs:209-214`, already built) | the type is listed as **needs update**, not selectable; nothing falls back to Generic |
| A zone node or wiring is no longer supported | `set_zone_graph` refuses, naming the node (already built) | same |
| A pinned rule name no longer exists | PLANNED: refused at load, naming the rule | same |
| Nothing structural, but the engine version is newer than the proof | loads and runs | label drops to **UNVALIDATED (proved on engine N)** until re-proved |

**The engine never migrates a file.** Updating an old type is the workbench's job: open it, the
editor fills each new field from the built-in explicitly and shows what it filled, you re-prove,
you save. A migrated type is UNVALIDATED until then. (`docs/design.md`, the mechanism paragraph.)

**Saved projects.** A project that uses a non-built-in type must carry a full copy of that type
inside the project file (PLANNED), because today an unknown profile id is refused at project load
(`src/state/project.ts:741-745`) and a project may be opened by an app build that lacks the type.

---

## 4. The bridge, concretely

### 4a. The type file (PLANNED)

```json
{
  "typeFile": 1,
  "category": "denture",
  "id": "mixo.denture.example",
  "basedOn": "reference-denture",
  "profile": { "schema": 1, "id": "mixo.denture.example", "name": {}, "pose": {}, "...": "every field" },
  "rules": { "overhangAngleDeg": 55 },
  "zoneGraph": null,
  "validation": {
    "engineVersion": 69,
    "profileDigest": "...", "zoneGraphDigest": "default",
    "scans": ["<mesh digest>", "..."],
    "counts": "tips placed / left out, islands, verdicts",
    "at": "2026-11-20T..."
  }
}
```

Rules of the format:

- **`profile` is the WHOLE profile, never a list of differences.** The engine's parse is strict -
  every key required, no unknown key (`profile.rs:167-168`, `host/dental/dentureProfiles.ts:117-123`) -
  and that strictness is the safety: a missing number must be an error, not a silent default.
  "What did I change from Generic" is something the editor *shows* using `basedOn`; it is not how
  the file is stored.
- **`rules` holds only pinned names**, each checked against the engine's own list (`rule_names()`,
  `crates/geometry-wasm/src/lib.rs:65-68`). An unknown name is an error at load. (`docs/design.md`
  records that the packing step silently drops unknown names today; I did not re-open that file.)
- **`zoneGraph` is `null` for "the default wiring"**, or the graph exactly as the canvas exports it.
- **An aligner type has only the rules an aligner reads (`overhangAngleDeg` today) and `zoneGraph: null`** - corrected 2026-11-20; the line it replaces said `rules: {}`, and anything else is refused, because
  the aligner chain reads neither (`benchwork/README.md`, "only a denture responds").
- **`validation` is never trusted by itself.** The loader recomputes both digests; a mismatch means
  the contents were edited after the proof, and the label becomes UNVALIDATED automatically.
- **One writer.** The digest is taken over the profile's JSON *text* (`profile.rs:225`), so two
  programs that format the same numbers differently would get two fingerprints. Exactly one function
  turns a profile into text, and everything uses it. **BUILT 2026-11-20:** `src/dentalTypes/typeFile.ts`
  (`profileText`, `typeFileText`, `readTypeFile`; 12 tests).
- **The zone graph needs the same one writer** - found by that module's test the night it was built.
  The engine digests the graph TEXT it is sent (`setZoneGraph` sends `JSON.stringify`, key order as
  built), so the canvas's order and a file's sorted order give ONE graph TWO digests, and a proved
  type would read back as edited. `graphText` is that writer; whatever proves or runs a type (P1,
  A3, benchwork `--type`) must send the engine `graphText(graph)`, never its own stringify.

### 4b. The engine calls

**BUILT (engine 70) as `register_denture_profile(text)` / `register_aligner_profile(text)` -> id** - see the box at the top. The plan as written:

1. parses with the same strict parser the built-ins use (`profile.rs:209`): unknown key, missing key
   or wrong schema is refused with the problem named;
2. checks each number against the engine's legal range (PLANNED - ranges do not exist today; start
   with the pose fields: step > 0, 0 <= start <= end, a cap on how many angles one search may try);
3. refuses an id that collides with a built-in;
4. returns the content digest, and from then on every existing entry point's `profile` argument
   accepts **either a built-in id or that digest**.

Why this is small: the denture entry points resolve their profile through one lookup,
`denture_profile_of` (`crates/geometry-wasm/src/denture.rs:27`, 6 call sites counted). The change is
that lookup plus a second store beside the compiled-in one (`profile.rs:217-229`) - not nine new
signatures. CANDIDATE: I counted call sites, I did not trace each one.

**Already built - `set_zone_graph(json) -> digest`** (`crates/geometry-wasm/src/lib.rs:77`).
**One trap to design around:** it is a single global slot (`zone_graph.rs:313-331`) - "the graph the
next analyses use" - not a per-type setting. Fine for the review page, which runs one type per
folder. In the app, a plate could hold two denture types. So:

- **First (app unit A3 below):** the app sets the type's graph in ONE place, immediately before each
  denture job, and every result already reports the digest that ran. Correct, because the engine is
  single-threaded and the digest is in the cache key.
- **Later (PLANNED engine unit E3):** the graph is registered *with* the type, so the engine picks
  it by the same digest as the profile and the global slot goes away. This is the proper end state:
  one handle means one type, and there is nothing to forget to set.

**Rules need no new call.** They already travel with each run (`denture_policy_ruled`,
`denture.rs:197`). The type's pinned rules become the starting values of the unit's rules; the
operator's per-job edits layer on top, as they do today.

### 4c. The host side (geocore's `host/`, PLANNED)

A second trap, and it is the one that would bite silently. The TypeScript host has its own list of
known profiles, built only from the bundled files. For an id it does not know:

- `kindOfProfile` returns nothing (`host/dental/dentalKind.ts:31-35`), and the app then **treats the
  job as an aligner** (`src/denture/jobKind.ts:15-17`: "the aligner flow is the default for an id
  neither family knows");
- `dentureProfileData(id)` throws, and the app reads the tilt range and step through it
  (`src/denture/steps/orient/useDentureOrient.ts:107`, `src/denture/jobKind.ts:23-24`).

So registering with the engine alone is not enough. The host needs a matching
`registerDentalProfile(kind, data)` that (1) runs its own strict parse, (2) calls the engine,
(3) adds the type to the host's lists so the kind, the picker and the readouts all know it. One
call, both halves, or neither - a type known to one half only is a split brain.

### 4d. Who reads the type file

| Reader | Today | PLANNED |
|---|---|---|
| **The app** (`src/`) | built-in ids only | bundles `types/**/*.type.json`, registers each at engine start (main thread and each worker that owns an engine), lists them in the picker with their validation label |
| **benchwork** (`benchwork/cli.mjs`) | `--kind`, `--set name=value`, `--zone-graph file`; writes `benchwork.json` | `--type <file>` runs a whole type; `--set` and `--zone-graph` remain as overrides on top; writes a *candidate* type file beside the run with `validation` filled in |
| **The review page** | reads the run folder; Apply sends rules + graph to `serve.mjs` | opens a type, edits all three stages, Apply runs it, **Save type** writes it to `types/` |
| **`gate:real`** | the two built-ins | also runs every shipped type file, each with its own baseline |

---

## 5. The Orient stage: making start / end / step / margin editable

**What the engine does today (as read).** The denture search always starts at 0 degrees and walks
up: `0, step, 2*step ... range` (`crates/geometry-core/src/dental/denture/tilt.rs:51-55`). The profile holds
**three** numbers for it (`profile.rs:36-55`): `tiltRangeDeg` (the end, 45), `tiltStepDeg` (2),
`tiltMarginDeg` (2). **"Start" is not a number anywhere - it is the literal 0 in the code.** The
node shows "start 0" as a fact, guarded by a test against the shipped profile
(`dentalwork/batch-review/nodeGraph.mjs:171-179`).

So the four fields are not equally far away:

| Field | Needs | Order |
|---|---|---|
| **end, step, margin** | only the door (`register_profile`) - the fields exist | first |
| **start** | a NEW profile field `tiltStartDeg`, which changes the profile's shape -> schema 1 becomes 2, in both halves | second, separately |

**Engine work, in order:**

1. **E1 - `register_profile`** (section 4b). After this and the host half, end / step / margin are
   live. No shape change, so `gate:real` must still say "No differences" for the built-ins.
2. **E2 - `tiltStartDeg`.** Add the field to `Pose`; `scan_tilts` starts from it; bump
   `PROFILE_SCHEMA` to 2 in Rust (`profile.rs:205`) and in the host
   (`host/dental/dentureProfiles.ts:105`, `POSE_KEYS` at `:109`); add `"tiltStartDeg": 0` to the
   reference JSON; regenerate the host copy. Built-in at 0 -> `gate:real` "No differences".
   Things that must move in the same unit, because they assume a start of 0:
   - the app computes the number of angles itself, as `floor(range / step) + 1`
     (`src/denture/steps/orient/useDentureOrient.ts:107-108`). With a start that is wrong. Better:
     the engine reports the count, and the app stops redoing the engine's arithmetic;
   - the "robust" test looks `margin` either side and clamps at the ends of the range (`tilt.rs:21`);
     the clamp must use the new start;
   - whether a **negative** start is legal (leaning the other way) is an engine-range decision, and
     the search's pick order was only ever exercised from 0 upward. Recommend: refuse below 0 in
     this unit, by name.
3. **The aligner is different and is not in this unit.** Its search runs `tilt ± range` around a
   centre (`crates/geometry-core/src/dental/profiles/mod.rs:110-127`), so it already has a start in
   effect. Its Orient node gets its own three fields (centre, range, step) when the aligner's
   editor stage is built.

**What the UI should show until then** - the same vocabulary the Zones canvas already uses:

| Stage of the work | start | end / step / margin |
|---|---|---|
| **Today** | shown, read-only, with the reason beside it (this is what `viewer.html:913` does; keep it) | same |
| **After E1 is vendored** | drawn as **fixed at 0° in this version** - not a greyed field, a stated fact | number fields, with the engine's legal range as the field limits; Apply runs it |
| **After E2 is vendored** | number field | number fields |

Two things the node must always show, editable or not: **how many angles the search will try**
(end, step and start decide the run time directly - each angle is a placement) and **what the case
picked and why** ("8°, stable 0-44"). A range edit that silently doubles the wait, or moves the
pick for a reason off screen, is the failure `NODE-PLAN.md` section 1 already warns about.

---

## 6. The build plan

Each unit is gated alone. "Gate" for an engine unit = geocore's own tests, then vendor, then this
repo's full local gate (`CLAUDE.md`: `vendor:check`, `test`, `screens`, `build`, `walk`) plus
`npm run gate:real` reading **"No differences"**.

| # | Unit | Where | Proof |
|---|---|---|---|
| **E1** | `register_profile(kind, json)`: strict parse, pose ranges, digest, lookup accepts id or digest. Denture and aligner. | geocore, Rust + wasm | register the built-in's own text -> identical results to the id path; then break it on purpose (drop a key, bump the schema, step 0, collide with a built-in id) -> each refused with its name; register range 10 -> the scan stops at 10 |
| | **Progress 2026-11-20:** the DENTURE half of E1 and E1h is built in geocore, committed and NOT pushed: `4edd262` core (`profile::register(text)`, strict parse, pose checks - step above 0, range 0-90 - built-in ids refused, digest from the text) and the engine-70 commit after it (`register_denture_profile` in wasm with `PROFILE_INVALID` + `detail`; `host/dental/registerProfile.ts` registering with the engine FIRST and only then with the host list, which `kindOfProfile`, `profileIdsOf` and `dentureProfileData` all read - so a registered denture is never routed as an aligner). Tests: Rust, range 10 stops the scan at 10 and five refusals by name; host, a registered id is a denture everywhere, a refused one is nowhere. The ALIGNER half followed in geocore `6a40a66` (still engine 70, never shipped): `profiles::register`, `register_aligner_profile`, `registerAlignerProfile`; the Step 0 cards stay built-in only until A1. Still open in E1: lookup by digest. "Identical results to the id path" is P1, proven at the engine level for both kinds - see P1. Not vendored: mixodental stays on engine 69 until the owner approves the push. | | |
| **E1h** | `registerDentalProfile` in `host/`: host parse + engine call + host lists updated together | geocore, TS | an id registered this way answers `kindOfProfile` = denture and `dentureProfileData`; a registration the engine refuses leaves the host list unchanged |
| **V1** | vendor E1 + E1h (`npm run vendor:geometry`) | mixodental | full local gate + `gate:real` "No differences" |
| **B1** | Type file: the format, one pure loader/validator (`src/dentalTypes/typeFile.ts`, BUILT) with tests, the single profile-to-text writer; `benchwork --type` | mixodental | a type file equal to the built-in gives a byte-identical review; a file with an unknown rule name, a bad graph or a stale digest is refused or relabelled, each by name |
| **R1** | Review page: Orient node's end / step / margin become fields; start drawn as fixed; **Save type** | mixodental | edit end to 20, Apply -> the facts show a search of 0-20 and the saved file carries 20; walk + screenshot |
| **A1** | App loads bundled type files at engine start and lists them, with the validation label | mixodental | a second denture type appears in the picker and runs its own numbers; guard test: **a registered denture type never runs the aligner flow** (the `jobKind.ts` trap) |
| **A2** | Project file embeds the snapshot of a non-built-in type | mixodental | save with type X, open in a build without X -> runs, or is refused by name; never Generic silently |
| **A3** | App sets the type's zone graph before each denture job, in one place | mixodental | two dentures of different types on one plate each report their own graph digest |
| **E2** | `tiltStartDeg`, schema 2, engine reports the angle count | geocore, then vendor | built-in at 0 -> "No differences"; a schema-1 file is refused by name; start 10 -> first scanned angle is 10 |
| **R2** | Orient node's start becomes a field; the editor's "update an old type" path (schema 1 -> 2) | mixodental | open a schema-1 type file -> shown as needs update -> updated, labelled UNVALIDATED |
| **E3** | Zone graph registered with the type; global slot removed | geocore, then vendor | A3's proof still passes with the per-job set deleted |
| **P1** | Parity round-trip (section 10): a script writes each built-in out as a type file; the gate runs both through the type-file path | mixodental, after B1 (denture) and the aligner half of E1 | `gate:real` "No differences" for denture, aligner and multipart, through the type file - then kept in the gate for good |
| | **Progress 2026-11-20 (denture, engine level):** with engine 70 vendored TEMPORARILY (not committed; restored to 69 after), every local denture scan was reviewed through `reference-denture` and through the same profile registered as `p1.reference` via `registerDentureProfile`: **6 of 6 IDENTICAL**, 1.2 to 5.6 million characters of review each, excluding only the profile id, the digest and the wall-clock `stageSeconds` (the first run showed timing was the only first difference). **Aligner and multipart, same night, engine 70 at `6a40a66` vendored temporarily again:** the three engine paths an aligner review reads its profile through (tilt scan, region proposal, orientation), with `reference-aligner` and with the same profile registered as `p1.aligner`: **10 of 10 IDENTICAL** (8 aligner, 2 multipart; two aligner scans are inconclusive results of ~370 characters, identical too but proving less). **Through a TYPE FILE, whole reviews, same night:** each built-in written by `typeFileText`, read back by `readTypeFile`, registered from `profileText` of the FILE's profile, then every scan's whole review compared - dentures through `buildDentureReview`, aligners through `pickPrintAngle` + `buildDentalReview`, which now take a `profileId` (default `REFERENCE_PROFILE`, so every existing caller is unchanged). **Dentures 6 of 6, aligners and multipart 10 of 10 IDENTICAL.** Six aligner reviews are full builds of 5.4-7.1 million characters; two aligner scans are inconclusive (186 characters) and the two multipart reviews are ~14 thousand characters, short of a full build, so those four prove less. The run also found a call left without the new argument (`appSettings()`) in `build.ts`, which tsc never read - the folder is now in `tsconfig.json`, proved by putting the bug back and watching tsc fail. **Still owed for P1:** `benchwork --type`, and the standing `gate:real` check, both after engine 70 is vendored for real. | | |
| **D1** | Discovery (section 8): one pure `types/index.ts` that globs `types/**/*.type.json`, validates each and returns loaded / refused lists | mixodental, with A1 | drop a new file in the folder -> it is in the picker after a reload with no other edit; a broken file is listed as refused with its reason; guard test: two files with one id fail the build |
| **D2** | Changed-type notice on an open project (needs A2) | mixodental | a project saved with type X v1, opened in a build carrying X v2 -> runs v1, shows "newer version available"; Update is an explicit action and marks the job for re-run |
| **M1** | MCP server, read-only tools (section 9): list nodes, list rules, read type, validate draft | mixodental `benchwork/mcp/` | each tool's answer equals what `nodeGraph.mjs` / `rules.mjs` / the engine return; a graph the engine refuses comes back with the engine's own sentence |
| **M2** | MCP `run_draft` and `write_draft` | mixodental | a draft runs on the local fixtures and returns benchwork's numbers; the written file lands in `types/drafts/`, is UNVALIDATED, and the app's release list does not include it; test: the server has no git, network or delete tool |
| later | Promote the ~38 policy constants to profile fields, one at a time (`NODE-PLAN.md` section 6 item 5) | geocore | "No differences" each. **Every promotion is a schema bump** - which is why shipping many customer types before this is mostly done makes each one a migration |

**FIRST, tomorrow:** commit the review-page work now sitting uncommitted in the tree, then start
**E1 in geocore, denture half only, core crate only**: a second profile store beside the compiled-in
registry, `register(json) -> digest`, and the lookup accepting a digest. Its proof needs no wasm, no
vendor and no app: one Rust test registering the embedded reference text and comparing against the
id path, and one test per refusal. It unblocks everything else on this page, and it cannot disturb
the app because nothing calls it yet.

---

## 7. Decisions for the owner

> **Owner rulings, 2026-11-20.** **1: the whole profile** ("if that is more secure and clear" - it is:
> a missing number is an error, never a silent default). **2: committed files.** **3: the print angle
> is set in the workbench as the type's default behaviour; the app keeps its dial for fine-tuning, or
> an override in free transform.** **4: proof is required, but a type file may carry `"proved": true` as a
> hand override**; the app shows it as "proved by hand", never as a measured proof. **5: the start
> angle is set per type in the workbench, with a fallback default** - a denture profile without
> `tiltStartDeg` starts at 0 deg upright, exactly as before (an aligner already carries its start, `tiltDeg`).
> Push approved the same day.
>
> **Superseded 2026-11-22 for the app (owner: "Do not need prove, make it easier"):** ruling 4 and
> recommendation 4 below no longer gate anything in the app - a type loads whether or not it was proved,
> and the picker shows no proof status (section 8a). The proof record is still written, as information.

1. **Is the type file the whole profile, or only what differs from Generic?**
   Recommend: **the whole profile.** The engine's safety is that a missing number is an error. A
   file of differences makes every future Generic retune silently change every type built on it.
   The editor can still *show* the differences.

2. **Where do saved types live: committed into the app's repo, or stored in the lab's browser?**
   Recommend: **committed files only, for now.** A type is a clinical recipe; it should be
   reviewed, gated by `gate:real`, and identical on every machine. Browser-stored, lab-made types
   are a later feature and need the project-snapshot unit (A2) first anyway.

3. **Who may change the print-angle search: the workbench only, or also the lab operator in the app?**
   Recommend: **workbench only.** In the app the range stays a readout and the operator keeps the
   dial to pick an angle by hand. The range is part of what was proved; an operator-widened search
   is an unproved type wearing a proved type's name.

4. **May an UNVALIDATED type be picked in the shipped app?**
   Recommend: **yes in the workbench, no in a release build** - a release lists only types whose
   proof matches their contents and the engine it ships with. This makes "prove it" a gate rather
   than a habit.

5. **Start angle: build E2 right after E1, or defer it?**
   Recommend: **defer until end / step / margin have been used on real cases.** Start costs a
   schema bump and touches the robust-band logic; end / step / margin cost nothing extra once the
   door exists. If real dentures never want to skip 0°, E2 is work nobody needed. Until then the
   node says "fixed at 0°" honestly.

---

## 8. Discovery and reload — a new type file shows up with no hand wiring (v1 BUILT 2026-11-22, section 8a)

**In plain words:** there is one folder. Put a type file in it and the app has the type. Nobody
edits a list.

- **Where.** `types/<category>/<id>.type.json` for shipped types; `types/drafts/` for unproved ones
  (workbench only, never in a release list).
- **How the app finds them.** A build-time glob (`import.meta.glob`, already used by this repo's
  guard tests, e.g. `src/browserFloor.test.ts:18`) inside one pure module, `types/index.ts`
  (unit D1). The folder IS the list.
- **On your machine.** The dev server watches the folder: saving a type from the workbench reloads
  the app page and the type is in the picker. (A reload resets the app's open session - that is
  today's behaviour for any file change, and why nothing is edited during a walk.)
- **"Pushed to live" - what it means in this repo.** The live site is GitHub Pages
  (`vite.config.ts:9`, base `/mixodental/`). By the owner's ruling CI is milestones-only: a plain
  push to `main` runs **nothing and deploys nothing** (`.github/workflows/ci.yml:5-11`); the deploy
  job runs only for a `milestone-<name>` tag or a run started by hand on `main` (`ci.yml:137`). So:
  **push = the type is in the repo and on every dev machine after a pull; milestone tag = the type
  is live.** That is the right gate for a clinical recipe and this page does not propose changing it.
- **What "changed" means.** Every file has a digest (section 4a). At start-up the loader compares,
  per id: new id -> new type; same id, new digest -> changed type; unchanged -> nothing. Each file
  is then registered, and anything the engine or loader refuses (schema, graph node, rule name,
  engine version the file's shape does not fit) goes on a **refused list shown in the app with the
  reason** - never dropped quietly, never replaced by Generic.
- **An open or saved project whose type changed.** The project carries its own copy of the type it
  was made with (unit A2), so it keeps running **those** numbers - a job must not change under the
  operator because a file moved. The app shows "a newer version of this type exists"; choosing
  Update is explicit, re-runs detection (the digest changed, so the cache cannot serve the old
  result) and is undoable until saved (unit D2).

### 8a. D1/A1 v1 - BUILT 2026-11-22 (planned with Fable, who agreed after two reviews)

Checked in source before writing. **What v1 does:** denture and aligner type files in `types/<category>/`
reach the app's type picker, with their own name and badge, in every engine realm; anything that cannot
load is listed with its reason. (Aligner types joined 2026-11-23: geocore's aligner card lookups
`profileById` / `profilesWithoutOpening` read registered profiles too (`alignerCards()`), and the vendored
mesh worker - which resolves an aligner job's profile by id in its own engine - waits on the app's
`typesReady` through `setMeshWorkerReady`, set at the top level of `src/workers/meshWorker.entry.ts`. Planned
with Fable, who agreed.)

- **Pure module** `src/dentalTypes/shippedTypes.ts`: `discoverTypes(files, deps, opts)` -> loaded and
  refused. Refused, with the reason shown: a path that is not `types/<category>/<id>.type.json` or
  disagrees with the file; anything `readTypeFile` refuses; a type with its own zone graph (one engine
  graph slot until E3 - an aligner type carrying the locked aligner graph too; the workbench never writes
  one, so this costs nothing today); a type
  that pins rules (the app's rules are each unit's settings today - a pinned rule would be silently
  ignored); an id equal to a built-in's or another file's; a name equal to another profile's in any
  language. Tested with in-memory files.
- **Every realm registers them.** `typesReady()` = `geometryReady()`, the eager raw glob of
  `/types/*/*.type.json`, `discoverTypes`, `registerDentureProfile` per type - once per realm.
  `main.tsx` and every worker entry in `src/workers/factories.ts` use it IN PLACE OF `geometryReady`;
  a guard test fails if one of them names `geometryReady` again. (The app runs the engine in four
  workers besides the main thread, each with its own engine and host profile list: a type registered
  only on the main thread would be listed in the picker and unknown where it runs.)
- **No silent misroute.** `jobKindOf(id)` throws naming the id when an id is given that no profile
  defines (it used to become 'aligner'); a test holds it.
- **Name and badge (owner, 2026-11-22: "icon can be up to 5 letters badge set by user, with full name
  in drop down. Category set by app to choose from").**
  - **Badge:** 1 to 5 characters, set by the user in the workbench, saved in the type file as an
    optional `"badge": "SOFT"` and read before the code table in `purposes.ts` (absent = `G`). Every
    saved type wears the `generic` badge style. `.purpose-badge` grows with its text (a minimum width
    and side padding instead of today's fixed 1.9em square), so 5 letters fit and 1 still reads as a
    mark. An empty badge or more than 5 characters is refused by name.
  - **Full name in the drop-down:** the type list shows the badge and the type's full name
    (`profile.name` in the operator's language) side by side; the badge alone is never the only label.
    The workbench sets the name on its New-type strip (built 2026-11-22: category from the app's list,
    full name, id following the name, badge, the steps marked from what happened); with no name typed,
    the id - in all three
    languages.
  - **Category from the app's list:** the user picks the category from the list the app defines
    (`DENTAL_KINDS` - today aligner, denture), never types one; a type file naming any other category is
    refused. A new category stays a code change (its engine pipeline, label and art), which is why it is
    a choice and not a field.
- **No proof gate (owner, 2026-11-22: "Do not need prove, make it easier").** This REPLACES ruling 4 and
  recommendation 4 for the app: every type that reads cleanly loads, proved or not, and the picker
  shows no proof status. The `validation` record stays in the file as information (benchwork and the
  workbench still write it), but nothing in the app reads it to allow or refuse a type.
- **Projects:** a project whose saved type was removed is still refused at load (unit A2 is the fix);
  v1 makes the denture message name the missing type file.
- **Order:** workbench name and badge; reader `badge` + pure module + tests; realm hook + guard + loud
  `jobKindOf`; picker badge + refused line; docs.
- **Verified in the running app (2026-11-22):** with a temporary `types/denture/check-soft.type.json` (badge
  `SOFT`) and a broken file beside it, the denture type list showed "G Generic denture" and "SOFT Check soft
  denture" (the badge box 42 px wide, G still a 25 px square), and the items page showed "1 saved type could not
  load" opening to the file and its reason. No console errors. The temporary files were deleted afterwards. A first
  try put that line inside the page head, a one-row strip that does not wrap: it was squeezed to 29 px off-screen,
  so it sits on its own line under the head.

### 8b. End-to-end audit fixes - BUILT 2026-11-23 (Fable audited, then agreed to the fixes)

With one type per category a row could never hold work built with another type; with saved types it could.

- **A row names the type its work was BUILT with** (`src/items/rowPurpose.ts` `purposeOfUnit`): a unit's
  `dental.profileId` or denture policy wins over the operator's chosen answer, and opening a row uses that row's own
  type (`profileToOpen`), not the session's last one.
- **Changing the type of a worked row asks first** (`App.tsx` `askOrApplyPurpose`): only when work the operator would
  miss goes (`exitNeedsConfirm`: supports, painted areas, moved sliders, hand edits). Confirming removes that work as
  ONE undo step (`exitCommands`, as Exit does) and offers an Undo toast on the items page, which has no Ctrl+Z. The
  toast region sits at the top on the deck (at the bottom it covered "Start with the first file"). Undo restores the
  work, puts the deck hint back on the status line, and re-detects the rows (the detector held the new type's verdict).
- **The done tick drops** when a row's work is gone (`ItemsPage.tsx`).
- **The workbench says whether the APP will load a draft** (`typeInForce.ts` `appLoadVerdict`, written by the run as
  `type-load.json`): the app's own `discoverTypes` over every `types/*/` file plus the draft, run with and without
  the draft, so a draft that would knock out an already saved type (the loader refuses the LATER of two clashing
  files) is caught too. The New-type strip shows the reason and Save says "Saved X, but the app will not load it yet:
  <reason>"; the server returns the verdict so it survives a reload. A draft the ENGINE refuses (a built-in id) now
  shows that reason instead of "exit 2" (`rerunReport.mjs` `refusalReason`).

**Debt, not taken (named so it stays known):**
1. **Save overwrites silently.** Saving a type whose file already exists replaces it without asking.
2. **Re-picking a category resets the type** in the row picker; the operator picks the type again.
3. **The deck toast lasts the standard 6 s** (`UNDO_TOAST_MS`), paused while hovered or focused - after reading a
   confirm, that is short. Raise it per host only if operators miss it.
4. **The type-change toast borrows the `regenerate` kind** (the one that carries its own message) rather than a
   `changeType` kind in geocore's `editing/toast.ts`; add the kind there when geocore is next touched.

## 9. An MCP server for the workbench — describe an idea, the AI composes it (PLANNED)

**In plain words:** an MCP server is a small local program that gives an AI a fixed set of buttons.
You say "sockets deeper than 2 mm should never get tips, and search only 0-30 degrees"; the AI
looks up which nodes and rules exist, wires a draft, has the real engine check it, runs it on your
local scans, and shows you the numbers. **It can only press the buttons below, and none of them is
"ship".**

| Tool | What it does | Reuses - no second copy |
|---|---|---|
| `list_nodes` | every node kind with its plain title, sentence, settings, dropdown values, and which parts are **fixed in this version** | `KINDS`, `KIND_WORDS`, `PARAM_WORDS`, `OUTPUT_WORDS`, `FIXED` in `dentalwork/batch-review/nodeGraph.mjs` (`:29-146`) |
| `list_rules` | the turnable rules with meaning and limits | `benchwork/rules.mjs` |
| `list_types` / `read_type` | what exists, and one type in full | `types/index.ts` (D1) |
| `validate_draft` | checks a draft type: model check, then the **engine's own** validation (`register_profile`, `set_zone_graph`) | the vendored engine; the answer is the engine's sentence, word for word |
| `run_draft` | runs the draft on a local fixture folder, returns tips placed / left out, islands, verdicts, print angle, seconds | `benchwork --type` (B1) |
| `diff_types` | what differs between two types, in plain words | the single writer from B1 |
| `write_draft` | saves to `types/drafts/` only | the single writer |

**Where it lives:** `benchwork/mcp/` in this repo (values and workbench are mixodental's; the
engine stays geocore's and is reached only through the vendored build). It is a thin shell: every
tool calls a function that already exists for the review page or benchwork. If a tool needs logic
the page does not have, that logic goes in the shared module and the page uses it too.

**Guardrails, each one a test, not a promise:**

- **Drafts are UNVALIDATED** and live in `drafts/`. Promoting one into `types/<category>/` and
  committing it is the owner's act; the server has no git, push, delete or network tool.
- **Patient scans never leave the machine.** Tools return numbers and file paths, never mesh data,
  and the server runs locally (stdio). Honest limit: the *numbers* the AI reads do go to whichever
  AI service is connected, so no case name or patient identifier may appear in a tool result -
  cases are reported by index.
- **Only what exists.** A draft using an unknown node, a fixed setting or an unknown rule is refused
  by the same checks as the canvas. When an idea needs something missing, the AI must answer
  "this needs a node that does not exist: <what it would do>" - `validate_draft` returns a
  `gaps` list for exactly this - rather than approximate it with the nearest node. An approximation
  that runs clean is the failure `NODE-PLAN.md` section 5b already records seven times.
- **Same engine, same answer.** The AI's draft and a hand-made one go through one validation; there
  is no "AI mode".

Order: M1 (read-only) is useful alone and needs only B1 and D1; M2 needs `benchwork --type`.

## 10. Parity — can today's workflow and nodes recreate what already ships?

**Short answer: recreate, yes - edit freely, not yet.** A type file holds a *whole copy* of the
profile, and the same engine code runs it, so both built-ins can be written out as type files and
must come back identical. But most of what makes each built-in behave as it does cannot yet be
*changed* from the workbench. Both halves have now been run (section 6, P1 row).

**Generic denture**

| Stage | Expressible today | Not expressible today | Closed by |
|---|---|---|---|
| **Orient** | all 5 upright numbers and end / step / margin are profile fields (`profile.rs:19-55`), so a type file carries them | nothing is editable (no door); start is a literal 0 | E1, R1; start: E2 |
| **Zones** | the default wiring is the canvas's default graph, node for node (`nodeGraph.test.ts:84-92`); casts and Either / Remove / Both / Invert into 3 outputs are free | 5 outputs fixed (`zone_graph.rs:82`), plus ray spacing, depth-map settings, band widths, smallest hole | later zone-graph versions (`NODE-PLAN.md` section 5b) |
| **Support settings** | 13 rules turnable; the 17 placement and the support numbers are profile fields | ~117 rules not offered by benchwork; ~38 policy numbers are constants in code - identical for every type | widen `rules.mjs` as needed; the "later" promotion row |

**Generic aligner** - checked against `NODE-PLAN.md` section 4, which holds up:

| Stage | Expressible today | Not expressible today | Closed by |
|---|---|---|---|
| **Orient** | its thresholds are profile fields; its search is centre ± range (`dental/profiles/mod.rs:110-127`) | no door; no Orient node for it in the editor | E1 aligner half; an aligner Orient node (not yet a unit) |
| **Zones** | nothing - it has no zone graph. Its chain (trim frame, opening, face cut, strip, contour sampler) is code | everything; five node kinds do not exist | `NODE-PLAN.md` section 6 item 6 |
| **Support settings** | the profile's support numbers; position / width / density defaults come from the profile | no rules channel - "only a denture responds" (`benchwork/README.md`) | an engine entry point that takes rules (not yet a unit) |

So an aligner type file is `profile` only (`rules: {}`, `zoneGraph: null`). Its parity claim is the
weaker one `NODE-PLAN.md` states: it passes because the same code runs, not because nodes rebuilt it.

**The proof (unit P1), and the three places it could fail:**

1. Built-in -> type file -> register -> `gate:real` **"No differences"**, for denture, aligner and
   multipart (the gate already has all three kinds, `scripts/real-scan-gate.mjs:25-26`).
2. **Default wiring sent explicitly.** Today "default" means *no graph set*. A type file that
   carries the default graph spelled out must give the same result. TRACED 2026-11-20: once a graph
   is set, its own R1b angle drives the zones and the rule `noSupportSteepDeg` is not read for them
   (`zone_graph.rs:342-343`: `current()` returns the override and only falls back to
   `default_graph(steep_deg)` when none is set). The rule still reaches its other readers (the policy
   and the review layer), so the two can disagree. The review page cannot do that - saving mirrors
   R1b's angle into the rule - and since 2026-11-20 `benchwork` refuses a `--zone-graph` whose R1b
   angle differs from `--set noSupportSteepDeg` (and notes it when the rule is left unset).
   The type file must hold ONE number: P1 makes the rule follow the graph (or refuses a mismatch by
   name), never two sources left to chance.
3. **Text identity.** The fingerprint is over text, so the round-trip must go through the single
   writer or the digest (and the validation label) changes while the numbers do not.

**Gaps, as one list:**

| Gap | Blocks | Unit |
|---|---|---|
| No door for profile numbers | every Orient and most Support edits, both categories | E1, E1h |
| Host treats an unknown id as an aligner | any second denture type | E1h, guard in A1 |
| App never sets a zone graph | running an edited denture type in the app | A3, then E3 |
| Start angle is a literal | Orient start | E2 |
| Steep-ray rule vs spelled-out graph precedence | parity proof 2 | settle inside P1; engine fix if they disagree |
| Aligner has no rules channel, no zone nodes, no editor stage | editing an aligner beyond profile numbers | not yet units - an engine project, to be planned after P1 passes |
| ~38 policy numbers are code constants | types that differ in them | the "later" row |

**What this means for "without issues":** the workflow is enough to *recreate* both built-ins once
B1 and E1 land, and P1 is the test that says so in numbers rather than in this paragraph. It is not
yet enough to *create a meaningfully different aligner*, and saying otherwise would be the claim the
engine does not support.

---

## Not verified, named rather than filled

- Sections 8-10: that Vite's dev server reloads on a NEW file matching a glob outside `src/` (it
  does for existing files; a new file is assumed, not tried); the aligner's `dental_policy`
  signature (taken from `benchwork/README.md`); the steep-ray precedence in section 10.

- That every denture entry point resolves its profile through `denture_profile_of` - 6 call sites
  counted, not traced.
- The aligner side of `register_profile` - only its `Pose` doc was opened
  (`dental/profiles/mod.rs:110-127`); its registry and entry points were not.
- `packRules` dropping unknown names - taken from `docs/design.md`, not re-opened.
- Which app workers own an engine instance (each needs the registrations) - not traced.
- Nothing on this page was run; it is a design, and every unit's proof column is what turns a line
  of it into a fact.
