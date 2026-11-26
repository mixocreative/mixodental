# docs/ — the map

**Seventeen documents at this level, six of them records of everything this project has written, and
exactly one of them about the future.** On 2026-11-19 the owner's instruction was that dated files be
gathered into one record per kind, so a folder stops growing a file per day: 71 documents became 6
records, and four folders (`design/`, `reviews/`, `handoff/`, `superpowers/`) no longer exist. Later
the same day `PLAN.md` was added, because two reviews asked what came next and neither could find
out — the two documents this file had been sending them to were both finished.

The rule the folder works by has not changed: **a document says when it was written and what it
decided.** Dated writing is a record of a moment and is not edited to match later reality — it is
superseded by newer writing, or corrected in place with the correction marked, so a reader can tell
what was believed when. What changed is only where those records live.

## Living documents — a stale one is a defect

| where | what is in it | read it when |
|---|---|---|
| `HANDOFF.md` | the running engineering handoff: what landed, what it cost, what is open | picking the work back up |
| `PLAN.md` | **the only forward-looking document**: what is next in order, and the five decisions waiting on the owner | deciding what is next |
| `SHIP-PLAN.md` | the architecture rules (cited *by number* from the guard scripts), the authoritative ABI table, and the gate definition. Its progress table is a finished record | changing geometry, the ABI, or what a gate runs |
| `ROADMAP.md` | the owner's principles, the decision log (D1–), the verification tiers, and the deferred-until-evidence triggers | questioning a decision, or checking whether a deferral's trigger has been met |
| `size-debt.md` | every file over ~600 lines with its next cut named | before adding to a long file — add at the seam |
| `designer-guide.md` · `ui-styling.md` | the UI vocabulary and the styling rules | touching anything the operator sees |
| `BLENDER_PARITY.md` · `SLASG_NODE_LOGIC.md` | the external references the engine is checked against | changing geometry or placement |
| `dental-kinds-and-types.md` | what an item kind is, and which profile answers for it | adding or changing a dental type |
| `TYPE-PIPELINE.md` | **how a type made in the workbench reaches the app**: the type file, `register_profile` as the bridge, the build plan E1-E3 and five owner decisions | making a type editable, saving or loading one |
| `REVIEWER-OVERHAUL-PLAN.md` | **the reviewer as one place to test, compare and save pipelines** (BUILT 2026-11-25; its differences from the plan at the top): import scans in the reviewer, every type loaded, switch type on the same scans, dated append-only saves, restore to the saved value, duplicate and copy | changing how the reviewer runs, loads or saves types |
| `NODE-PLAN.md` · `REVIEWER-UI.md` · `REVIEW-UX-REFINE.md` | the node editor: the three stages, what a zone graph may and may not wire in this version, the review page layout, and the 2026-11-20 UX pass | touching the review page or its node editor |
| `dental-rework-handoff.md` | the dental rework's own handoff | working the dental steps |
| `dental/` | how dental support works, for a technician (`plain-language.md`) and an engineer (`technical-algorithm.md`, the wasm geometry notes); was `dentalwork/` until 2026-11-26 | explaining or rebuilding the dental pipeline |
| `audits/` | the full `cia` audit report (2026-11), moved from the root; its evidence is in `artefacts/` | checking what the audit found |
| `handoff/` | open requests to `mixo-geocore` (`geocore-<thing>.md`, typelab/CLI.md Stage 3): today the five aligner scans that do not build | asking the engine for something the host may not do |
| `translation/` | how the Japanese and Taiwan Chinese strings get written, and the two traps that cost a day | the i18n guards are red |
| `migration/glossary.md` | one term per concept per language, **checked by `src/glossary.test.ts`** | translating anything |
| `migration/ui-spec.md` · `migration/release-*-backlog.md` | the UI specification and what is still owed | planning a release |

## The records — copied whole, nothing reconciled

Each holds its documents in date order under an anchor that **is the old filename**, so a reference
in an old commit message, an audit log or another repo still finds its text by that name. Every one
opens with a table of what is in it.

| record | what it gathers | read it when |
|---|---|---|
| `design.md` | 11 design documents — one per decision, with the reasoning | before changing what a feature IS |
| `reviews.md` | 20 reviews, audits and wiring walks (`cia`, `egm`, and the first browser verification) | looking for what a review already found |
| `handoff-records.md` | 11 superseded handoffs, human-test notes, the operator and UI walkthroughs, and the packets handed to `mixo-geocore` | resuming, or preparing a hand-over |
| `superpowers.md` | 21 paired plans and specs from October 2026 | archaeology on an older plan |
| `dental-reference.md` | the clinical and print references the dental rules cite | questioning a dental number |
| `migration/records.md` | the three dated migration notes | moving data or formats |

`dental-reference/` survives as a folder of its own because it holds the images, the GLBs, the
reference aligner and `face-labels.json`, which `scripts/dental-face-labels.ts` reads by path.
`images/` holds the figures the documents above reference.

## Naming

A new record section is `YYYY-MM-DD` in the heading and the old-filename convention in its anchor:
kebab-case, `<date>-<subject>`. Review sections carry the tool that produced them (`cia`, `egm`,
`wiring-walk`) because which instrument found something is part of how much weight it carries.

**Adding to a record rather than making a file** is the point of the shape: append a section with
its own anchor, newest at the end of its record, and leave every section above it alone.

## The code's own maps

`docs/` is not the only map. Every folder past ~20 files carries its own README, closer to the code
than anything here: `src/` (the entry, the copy modules, and the eleven architectural guards),
`src/components/`, `src/components/viewport/` and `src/components/viewport/babylon/`, `src/supports/`,
`src/deck/`, `scripts/` (the gate's own steps) and `scripts/test-support/`. Start there for "where is
X"; come here for "why is X this way".
`python ~/.claude/skills/cia/tools/maintainability.py S:/ai/mixodental` checks that a folder past the
limit has one.

## One thing worth knowing before you trust a green run

The **gate** (`npm run gate`) proves the build and the engine's numbers; the **walk**
(`npm run walk`) proves the workflow in a browser, and it is the only thing that exercises generate
counts. The gate says so itself — its verdict reads `PASS (INCOMPLETE - the ship definition also
requires walk, not run here)` when the walk has not run. **Both receipts together are the ship
evidence; neither alone is.** On 2026-11-13 a vendor bump shipped and deployed with 92% of the
automatic supports gone, under a receipt that read `PASS` on the same line as `NOT run: walk`. The
first browser verification of the generic flow, from 2026-10-20, is a record now and lives in
`reviews.md`.
