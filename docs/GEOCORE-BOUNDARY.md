# How mixo-geocore and mixodental divide the work

> **STATUS: AGREED - the project's rule (2026-11-27).** Agreed by Fable and Codex in three rounds (every cited path checked by both), then approved by both again under the owner's delegation the same day ("make those decisions with 2 consultants"). It carries out the owner's ruling in `docs/design.md` *WHO OWNS A NUMBER*. Migration steps 6-7 (the sequence rewrite and the crate split) still get their own go-ahead when reached; requests to geocore follow the placement rules below and go to its `docs/requests/`.

Fable + Codex, 2026-11-27. Source review only: neither reviewer ran a scan or a build. Paths starting `crates/` or
`host/` are in the mixo-geocore repo; all others are in mixodental. CANDIDATE = read, not run.

## 1. Target architecture - a dental crate in the geocore repo, split LATE

| Layer | Owns | Lives |
|---|---|---|
| Engine core | math, mesh, repair, surface analyses, the support engine, the generic policy. Knows no dental word. | `geometry-core`: `core`, `repair`, `surface`, `supports`, `generic` (`crates/geometry-core/src/lib.rs:1-5`) |
| Dental mechanisms | a category's detection units (trim, contour, region, denture zones), the graph EVALUATORS, field names, units, legal ranges. No production value. | new crate `geometry-dental` in the geocore repo, depending on `geometry-core`; `geometry-wasm` depends on both (it already depends on core, `crates/geometry-wasm/Cargo.toml:13-14`) |
| Sequence | which units run, in what order: the type's graphs and the app's steps. | mixodental (`types/`, `src/dentalTypes/typeGraphs.ts:69-74`, `src/dental/flow.ts`, `src/denture/engine/dentureCore.ts:82-149`) |
| Values | every profile number, pinned rule, default. | mixodental type files, through the doors that exist: `register_denture_profile`, `register_aligner_profile` (`crates/geometry-wasm/src/lib.rs:143-160`) |

Why not the others:
- **Leave as is** - the only wall is a text scan (`crates/geometry-core/tests/layers.rs:19-35`); dental sits beside
  the generic modules in one crate (`crates/geometry-core/src/lib.rs:7-12`), and mixomesh carries 89 dental files /
  19,023 of 59,286 Rust lines while importing only `host/core`, `host/supports`, `host/workers`.
- **A dental crate in the mixodental repo** - mixodental has no `Cargo.toml` and consumes the engine as built
  (`typelab/CLI.md:118-119`). The app would own a Rust toolchain and a second ABI version.
- **Dental logic in TypeScript** - a category is code (`docs/NODE-PLAN.md:413`) and heavy geometry. The owner's
  rule needs the sequence to be DATA the app owns and the engine evaluates. The denture works that way
  (`crates/geometry-core/src/dental/denture/zone_graph.rs:1-16`). The aligner does not yet: its graph is declared
  and "nothing evaluates this graph" (`crates/geometry-core/src/dental/aligner_graph.rs:1-12`), and the Rust module
  fixes the order orient -> region -> footprint -> policy -> tilt (`crates/geometry-core/src/dental/mod.rs:5-11`).
  **Moving sequence ownership means replacing those fixed paths, not moving files or declaring a graph.**

## 2. Placement rules (top to bottom, stop at the first yes)

1. **Could mixomesh want it on a bracket or a figurine?** (pair a pinch, drop debris, find parts, sharp chains, a
   band along a loop) -> `geometry-core`. Name it by what it does to a mesh. Precedent: PE.7
   (`crates/geometry-core/src/dental/README.md`, "Moved out in PE.7"). **Look for the existing primitive first.**
2. **Does it know what an aligner, denture, rim, trim or arch is, and is it geometry?** -> the dental crate: one
   unit, one job, its own test, a reason code and evidence on failure (never a bare `None`).
3. **Is it an ORDER - a "then", a retry, a choice between units?** -> mixodental: the type's graph when the engine
   can evaluate it, else the app's step code. Written exception: an inner loop the engine needs for speed (the
   tilt scan re-running region and footprint per angle) stays a mechanism; its bounds are values.
4. **Is it a number?** The three classes of `docs/design.md:7590-7608`, unchanged: wire or picture -> engine
   const; provable by a synthetic test and affecting only accuracy or speed -> engine const; two types could
   disagree -> named profile field, engine keeps name, unit and range, mixodental supplies the value. What the
   machine SEES is calibration (workbench only); what it DOES is an operator default.
5. **Is it TS that packs or decodes the ABI?** -> geocore `host/`, versioned with the wasm (`host/README.md:27-32`).
   **Does it carry a value, a label or a UI default?** -> mixodental.
6. **Is it review or diagnostic only?** -> mixodental (`typelab/`, `scripts/`); the engine only exposes evidence.
7. **A failing scan gets evidence before a fix.** No retune and no new algorithm until a reason code names the
   test that failed.
8. Still unsure -> the handoff asks for the *generic primitive*, not the dental fix.

## 3. The five aligner scans, placed

- **`4d3c901b` pinch points - rule 1, geocore core, existing geometry first.** The refusal is generic:
  `Context::build` returns `None` unless every edge has exactly two faces
  (`crates/geometry-core/src/surface/edge_topology.rs:95-97`), surfaced at
  `crates/geometry-core/src/dental/trim/mod.rs:141`. The pairing already exists: `pair_around`
  (`crates/geometry-core/src/core/wedge.rs:29-73`), used by `corner_fans`
  (`crates/geometry-core/src/repair/topology.rs:87-110`) so the splitter gives each SOLID its own vertex copy
  (`crates/geometry-core/src/repair/manifold.rs:35-82`). Task: run this scan through the existing pairing and
  repair; if it comes out closed and two-manifold, deliver it as an **analysis mesh with a face and vertex map**.
  No promise for every pinch: `pair_around` returns `None` when the wedges do not alternate (`wedge.rs:63-73`).
  The imported model and its saved face ids stay untouched (the app only diagnoses on import,
  `src/workers/prepareImport.ts:6,65`). Whether aligners use the analysis mesh is sequence: mixodental's call.
- **`10f40a06` hooks - not yet evidence of a production failure. CANDIDATE.** Engine 56 already takes the largest
  part as the aligner and fuses attachments (`crates/geometry-core/src/dental/aligner_parts.rs:1-12`). The
  reported reason is minted in mixodental's review script after the region succeeded
  (`scripts/dental-region-review/build.ts:79-86`): it runs a diagnostic band on the whole file, and the band
  needs a two-manifold face graph (`crates/geometry-core/src/surface/side_bands.rs:70-79`). Rule 6: fix or bypass
  that call for the target part in mixodental, then check the production path and the scan's actual target part
  (the split pairs wedges and settles tangled edges, `crates/geometry-core/src/surface/parts.rs:194-224`) before
  asking the engine for anything.
- **`b65c27bb`, `c4169915` no-trim - rules 2 and 7.** `outer_contour` returns a bare `Option`
  (`crates/geometry-core/src/dental/contour.rs:61-69`) and `trim_frame` collapses two failures into `NoTrim`
  (`crates/geometry-core/src/dental/trim/mod.rs:141-143`). Ask geocore for a reason code and evidence layers.
  Change a type's calibration only if that evidence names a threshold.
- **`dae3a95d` region not isolated - same.** `classify_faces` collapses several distinct failures into one `None`
  (`crates/geometry-core/src/dental/region.rs:65-69,109-122,178`). Reason codes and evidence first.

Net for geocore: reason codes with evidence for two units, and a test of one scan against existing repair. Net
for mixodental: one review-script fix. The first handoff over-asked.

## 4. Migration - small steps, the app never breaks

Already done, do not plan twice: both registration calls (`crates/geometry-wasm/src/lib.rs:143-160`) and caches
keyed by content digest (`crates/geometry-core/src/dental/profiles/mod.rs:232-246`,
`crates/geometry-core/src/dental/region.rs:153-155`); `docs/design.md` still describes both as future.

1. Docs only: section 2 into geocore `AGENTS.md` and mixodental `docs/design.md`; rewrite the handoff to match.
2. mixodental: fix the review band (scan 3); re-run it on the production path.
3. geocore: reason codes and evidence for `outer_contour` and `classify_faces`.
4. geocore: scan 1 against existing pairing and repair; the mapped analysis mesh if feasible.
5. Promote remaining policy consts to profile fields, one unit at a time, `gate:real` no-diff each.
6. Replace the aligner's fixed orchestration with an evaluated graph, one node at a time, same proof.
7. LAST: move the dental folder into crate `geometry-dental`; `geometry-wasm` gains a `dental` cargo feature and
   mixomesh builds without it. Rust callers migrate explicitly; any compatibility names live at the wasm or host
   boundary. The crate boundary replaces the text scan. To complete the stated value boundary, move the built-in
   dental profile JSON to mixodental after registration, cache, and profile-field migrations are verified; until
   then, document the embedded profiles as a temporary exception (`crates/geometry-core/src/dental/profiles/mod.rs:1-5`).

Every ABI change is paired with its host version bump (`crates/geometry-core/src/lib.rs:14-18`,
`host/README.md:27-32`).

**Do not:** re-export dental from `geometry-core` after the split (core cannot depend on the crate that depends on
it); move the built-in profile JSON first (`docs/design.md:7644-7653`: last and optional); rewrite geometry in TS; put a host-side
stand-in for detection in the app; split the crate before steps 3-6; retune a threshold before the evidence names
it; add a "tolerate N non-manifold edges" number; rename or move `host/` files (apps import by path).

## 5. Open questions for the owner, each with our answer

1. *Is the crate split worth it?* Yes, last, and only with the mixomesh feature flag; without it, it is motion.
2. *Do `host/dental` value files (`alignerProfiles.ts`, `tuning.ts`, `label.ts`) move to mixodental?* Yes, after
   step 5, one file per commit; ABI decoders stay.
3. *Repair on import for dental?* No. Analysis mesh only; the file and its face ids stay as imported.
4. *Does scan 3 build in the app today?* Unknown. Step 2 answers it.
5. *Is freeing the aligner sequence (step 6) wanted now?* Recommend after the five scans are settled: it is the
   largest item here and the only one that changes how every aligner runs.

## Points still in dispute

None.

## What changed from v1

- Dropped the `geometry-core::dental` compatibility re-export: impossible with the dependency direction (Codex).
- Scan 1: no new fan-pairing algorithm assumed. v1 said the existing splitter could not fix it; that read the
  module doc and missed `pair_around` in `corner_fans`. Now: test existing repair first, promise nothing general.
- Withdrew v1's claim that `parts::split` joins only across two-face edges; it also pairs wedges.
- Scans 2, 4, 5: "retune in the Type Lab" removed as a conclusion; evidence first (new rule 7).
- Migration lists what is already built, and step 6 says the fixed Rust orchestration must be replaced.
- ABI change + host bump stated as one rule. v1's stale-README aside dropped for length.
- Codex round 2: the embedded built-in profiles named as a temporary exception that moves to mixodental last; the
  "not first" citation corrected to `docs/design.md:7644-7653`.
