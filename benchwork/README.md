# The bench

Where you change how the machine DECIDES — a detection rule, a profile's numbers, a whole new kind of
printed item — and prove it **before any of it touches the app.** Aligners and dentures were both built
this way after the fact; this is that route written down so the next one is a pipeline instead of an
archaeology project.

Two jobs, same loop: **adjust an existing rule**, or **add a new kind**. Change it, run it out of the
app on real files, look at the geometry, diff it against the baseline. Only then integrate.

**`npm run benchwork` is the tool. This file is its manual.**

```bash
npm run benchwork -- --list                                              the rules it offers
npm run benchwork -- --kind denture --set overhangAngleDeg=55 "<folder>" --open
```

It decides **what a type's rules are** — for orient, rim and the support zones. It turns thirteen
named engine rules (out of ~130), refuses a bad one before spending ~23 s of engine time, runs the
real engine on real scans through the folder review, writes `benchwork.json` beside the result so a
run can be repeated, and prints the numbers a rule change moves — tips placed and left out, islands,
verdicts, crossings — so two rule sets compare without opening the viewer. `--open` hands the result
to the review viewer. `cli.mjs` is the tool, `rules.mjs` holds the shortlist and the parsing, and
`rules.test.ts` guards both.

Three limits it states itself, because each one is a fact about the engine rather than a choice:
**only a denture responds** (the aligner's `dental_policy` takes no rules array, where
`denture_policy_ruled` does); it turns **named rules only**, because no ABI call accepts profile JSON
— a profile *number* needs a Rust rebuild; and **a recompute is ~23 s**, measured, so any panel over
this applies and waits rather than previewing live.

> *This paragraph used to read "No new tooling here. Every stage below runs an existing script."*
> That was true until 2026-11-20, and it is amended rather than deleted because the sentence was
> load-bearing: it is why the tool was nearly built in the wrong folder. What survives of it is the
> rule underneath — **benchwork adds no second engine and no second viewer.** The tool orchestrates
> the scripts the stages below already name; it does no geometry of its own, and if it ever needs a
> vector it is asking the engine the wrong question.

What this file adds beyond the tool is the order, what "done" means at each stage, and the
integration surface nobody had counted.

## First: are you adding a VARIANT or a KIND?

This decides whether the job is an afternoon or a fortnight, and it is the question people get wrong.

| | A variant | A kind |
|---|---|---|
| Example | another aligner brand | denture beside aligner |
| Lives in | a **profile data file** (`vendor/mixo-geocore/host/dental/alignerProfiles.ts`) | its own `src/<kind>/` folder, plus the surface below |
| Pipeline code | **none** | the integration checklist |
| Detection | the existing detector, retuned by profile numbers | usually a new engine entry point |

> *"Aligner types are data files (profiles). Adding a type does not need new pipeline code."*
> — `dentalwork/README.md`

**The procedure itself now lives with the data**, in the engine:
`mixo-geocore/crates/geometry-core/src/dental/ADDING-A-KIND-OR-TYPE.md` — what a kind and a type
each cost, how to add a detection or orientation rule, and **the Witness**, the detection reviewer
and its protocol. The app's side is `docs/dental-kinds-and-types.md`. This file stays what it has
always been: the loop you run to PROVE the change before any of it touches the app.

If a profile's numbers can describe it, stop here and add the profile. The rest of this document is for
a genuinely different item.

## Stage 1 — shape the detection with no app in the way

The app is the slowest place to learn what a detector does. Two existing tools run the real Rust core
against real files and give you geometry to look at, without the UI, without AI, locally:

```bash
npx vite-node --script scripts/dental-region-review/cli.ts --input <stl> --output <glb> --with-supports
```

One file in, one review GLB out — the detected edges, the region and the supports as coloured layers.
Fast enough to iterate on. **Aligners only**: this tool has no denture awareness, while `gate:real`
has a denture kind — so for a denture, reach for the folder review below.

**To TURN a rule rather than only look at one, that is `npm run benchwork` above** — the folder
review with named overrides, validation before a run is spent, and a written record of what it
turned. Stage 2 below is still what pins a tuned rule before it is trusted. Its design, limits and
what it deliberately does not do: [`docs/design.md`](../docs/design.md#2026-11-20-node-rule-authoring).

```bash
npx vite-node --script dentalwork/batch-review/batch.ts --out dentalwork/output/batch-test <folder>
node dentalwork/batch-review/serve.mjs dentalwork/output/batch-test
```

A whole folder, then a 3D viewer with the numbers beside each case. See
`dentalwork/batch-review/README.md`.

**Done when** you can state, in one sentence each: what the detector keys on, what it does on a shape it
cannot read, and which of your fixtures it fails. A detector with no known failure case has not been
tested, it has been demonstrated.

**Fixtures:** keep candidates in `dentalwork/fixtures/`. `dentalwork/output/` is git-ignored because a
GLB made from a patient STL is patient geometry — never commit one without the owner's say-so.

## Stage 2 — pin it before you tune it

```bash
npm run gate:real
```

Re-runs every local real scan and diffs against `dentalwork/baselines/real-scan-baseline.json`. Run it
**before** you start tuning, so you can tell your improvement from your regression, and after every
engine change or vendor bump.

## Stage 3 — what the engine has to give you

Geometry belongs in the Rust core; the host only hosts it. `vendor/mixo-geocore` is consumed **as
built** and hashed by `npm run vendor:check`, so a gap there is **a handoff document, never an edit**.

1. Write `docs/handoff/geocore-<thing>.md`. Use `docs/handoff-records.md#geocore-region-from-drawn-rim` as the
   model: state the gap as the operator meets it, why the host cannot close it, and the exact signature
   you want.
2. Add the symbol to `AWAITED` in `src/vendorCapabilities.test.ts`. That test **fails when the symbol
   appears** — deliberately inverted, because a workaround that keeps passing is exactly how a
   delivered capability goes unnoticed. Put the undo list in the message.
3. Meanwhile make the host honest, not broken: a control with nothing to act on is **shown-and-disabled
   with the reason beside it**, never live-and-inert. See the Step 2 strip sliders.

## Stage 4 — integrate, and this is the expensive half

A kind mostly lives in its own folder — about 70 of denture's files are under `src/denture/`, which is
the modular part working. What costs is the surface it leaks into. Regenerate the list rather than
trusting this paragraph:

```bash
grep -rl "denture" src/ --include=*.ts --include=*.tsx | grep -v "^src/denture/" | grep -v "\.test\."
```

38 files when this was written. Read that list before you estimate: it is the step machine (`src/state/stepKind.ts`, `src/dental/editingMode.ts`, `src/dental/flow.ts`), the docks
(`DentalBar`, `DentalSteps`, `DentalSupports`, `ReviewSummary`), the start and items screens, the
workers, the project format (`src/state/project.ts`) and **both locale files**.

Work it in that order — state machine, then flow, then docks, then screens — because each later layer
reads the one before it.

## Stage 5 — the gates it must pass

```bash
npx tsc --noEmit && npm test && npm run screens && npm run check:duplicates && npm run vendor:check
```

```bash
npm run walk
```

The walk is the release gate and is **non-parallel with anything else** — not the test suite, not a dev
server. Every renderer crash on record happened while something ran beside it. A walk FAIL is not
evidence until the machine was idle for it.

New UI strings need `ja` and `zh-Hant` (Taiwan wording), and `src/glossary.ts` will fail you if a string
uses a reserved tool word. That is the guard working.

## If you are an AI picking this up

Read, in this order: this file, then `dentalwork/README.md` (what the dental pipeline actually does),
then `dentalwork/support-module-boundaries.md` (where code belongs), then the Stage 4 list for the real
surface. `src/denture/` is the worked example of a kind — copy its shape, not its contents.

Three rules this repo will hold you to, which are not negotiable:

- **Geometry goes in the Rust core.** A guard script enforces it; `scripts/geometry-allowlist.json` is
  the record of every exception and its reason.
- **Nothing dies silently.** A control that cannot act says why. A check that cannot run reports that it
  could not, and never passes vacuously. Prove a new guard by breaking it on purpose before you trust it.
- **Docs move with the code, in the same commit** — this file included.
