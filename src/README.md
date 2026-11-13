# src/ — the map

Twenty-seven files at this level, and they are two very different things: **the application's
entry and shell** (six files) and **the repo's architectural guards** (eleven test files, each one
an allowlist with a reason). Everything else is in a subfolder with its own map.

The guards are the part worth knowing about before you change anything. They are how this repo
keeps rules that would otherwise rot into comments nobody reads.

## Entry and shell

| File | Job |
|---|---|
| `main.tsx` | the entry point |
| `App.tsx` | the application shell: which step is showing, which objects are built, the per-object build and failure maps. **1,635 lines, over the cut limit** — named as debt in `../docs/size-debt.md`, where the reason the `built` / `failedBuilds` maps stayed here is written down (moving them produced a hub, not a job) |
| `AppBoundary.tsx` | the error boundary and its `Stopped` surface: what the operator sees when the app cannot continue. A crash with no screen is a crash nobody can act on |
| `rescue.ts` | `sceneSave` / `publishSceneSave` — getting the scene out when the normal path is the thing that failed |
| `styles.css` · `fonts.css` | the stylesheet and the generated font faces (`scripts/gen-fonts-css.mjs` writes the latter; do not hand-edit) |
| `vite-env.d.ts` · `testFs.d.ts` | ambient types |

## Copy and language

| File | Job |
|---|---|
| `i18n.ts` | the string table and `t()`. Every operator-facing string comes from here |
| `glossary.ts` | the terms the UI is allowed to use, so one concept has one name |
| `termsText.ts` | the terms-of-use copy |
| `productNaming.ts` | `PRODUCT_NAMING` — the product's own names, in one place |

**zh-Hant copy uses Taiwan wording**, translated through the Gemini bridge, never mainland terms.
The guard below is `noBrandNames`; the wording rule is in the project memory, not enforceable by a
test.

## The guards — eleven allowlists, each with a reason

These are `*.test.ts` files at the top level on purpose: they are not about one module, they are
about the repo. Each one fails the build when a rule is broken, which is the repo's answer to
"guard tests, not good intentions". `tsconfig.json`'s `noUnusedLocals` / `noUnusedParameters` is
the twelfth guard and the cheapest one — an unread binding fails the build before any test runs.

| Guard | The rule it keeps | Why it exists |
|---|---|---|
| `threeBoundary.test.ts` | three.js stays in the view layer (`src/components`) | so the rules and the core can be ported to a Babylon app — which is what mixoMesh is |
| `deckBoundary.test.ts` | the deck sits above the state layer | one direction of dependency, so the deck cannot become a second store |
| `noDuplicates.test.ts` | one copy of every shared module, in mixo-geocore (PE.5b) | `src/` holds no copy of a vendored one; two copies of a rule is two rules |
| `geometryGuard.test.ts` | geometry calls go through the allowed surface | with `scripts/geometry-allowlist.json` as the list, so an exception is a reviewed entry and not a quiet import |
| `importOracleBoundary.test.ts` | the TS import geometry is gone; the oracle is golden files (U1, SHIP-PLAN rule 6) | the oracle used to be code that could drift from the engine |
| `vendorCapabilities.test.ts` | what the host is still waiting on from the vendored engine | so a capability the app assumes but the engine lacks is a failing test, not a runtime surprise |
| `commandWiring.test.ts` | every command is wired, and the background-work list is complete | a command with no wiring is a dead button; background work with no row is work the user cannot see |
| `importErrors.test.ts` | job errors reach the status line **as codes** | an error that reaches a log and not the status line has died silently |
| `browserFloor.test.ts` | the minimum browser the app claims to support | so the floor is a measured claim |
| `noBrandNames.test.ts` | no third-party slicer brand names anywhere | those files were research only; the shipped wording is neutral |
| `glossary.test.ts` · `i18n.test.ts` · `termsText.test.ts` · `hints.test.ts` | every string is in the table, every term is in the glossary, every hover hint exists | a literal in a component is a missed locale |

**Adding a rule to this repo means adding a guard here.** A rule written only in a doc or a review
comment is a rule the next change breaks without noticing — which is the whole reason this folder
looks the way it does.

## Subfolders

Each has its own map: `components/` (and `components/viewport/`), `core/`, `dental/`, `denture/`,
`deck/`, `items/`, `progress/`, `scenes/`, `state/`, `ui/`, `workers/`, `bench/`, plus `locales/`
(string tables — a data folder, no map).

## The two receipts that mean "shipped"

`npm run gate` proves the build and the engine's numbers. `npm run walk` proves the workflow in a
browser, and it is the only thing that exercises generate counts, because CI runs the walk in two
shards that leave section `a` out. **Both together are the ship evidence; neither alone is** —
`../docs/VERIFICATION.md` has the detail and it is worth the two minutes.
