# src/components: the view layer, and what `App.tsx` hands to it

This folder is the view layer. `threeBoundary.test.ts` draws the line here: **three.js is allowed in
`src/components/` and almost nowhere else**, so the rules and the core can be ported to another
renderer. Everything outside this folder that touches three.js is a listed exception with a reason.

Two kinds of file live here, and the distinction is worth keeping straight:

- **Components** (`*.tsx`) — the panels, bars, screens and viewport. They render and report presses.
- **Hooks** (`use*.ts`) — one job of the app each, lifted out of `App.tsx`. They hold state, talk to
  the workers, and write the status line. They render nothing.

## The hooks: one job each

`App.tsx` is the composition root. Nearly everything it still does is wiring these together, which
is why the table below is the fastest way to find where a behaviour lives.

| hook | what it owns |
|---|---|
| `useImportFiles.ts` | **Import**: files to units on the plate — reading, the triangle, memory and plate refusals, placement, and what the status line says came of it. Owns the import plate ledger. |
| `useSupportChecks.ts` | **The support check**: running it, the findings by unit, the list the panel may show, the re-check of an edited unit, and Fix (through `useFixSpot`). |
| `useFixSpot.ts` | Fix on one check finding: frames the spot, opens Support Edit Mode with Add waiting, and follows the support added through to the re-check. Called from `useSupportChecks`, not beside it. |
| `useRegenerate.ts` | Placement of automatic contacts: Generate and Regenerate, and the placement settings that regenerate by themselves outside a mode. |
| `useExport.ts` | Export: plans the files, builds them at full resolution in the export worker, hands them to the browser, and says what came out. |
| `useProjectFile.ts` | Save project and Open project: the scene as a `.mixodental` file and back. |
| `usePlateArrange.ts` | Laying the objects out so they do not overlap. There is no build plate — see the file's own header for what was retired and what seam is kept. |
| `useDentalFlow.ts` | Dental Steps 1 and 2 for an aligner: the print-angle scan, the detected rim, and the area. |
| `useDentalPreview.ts` | The debounced tip preview, with the exact unit and policy version it was placed on. |
| `useDentalTuning.ts` | The debounced worker retune behind Step 3's review controls. |
| `useAreaRisks.ts` | Step 2's overhang low points that fall outside the permitted area. |
| `useFreeTransform.ts` | Step 1's Free transform: off, asking, or on. Pure, so its transitions are tested without React. |
| `useDebugLayers.ts` | The Debug section's layers for the active model, computed only while it is open. |

`appShared.ts` holds what nearly all of them need: the runtime tier for the budgets, `triangleCount`,
`isAbort`, and the `SetStatus` type.

## Why a hook and not a module function

Each of these is a closure over the app's refs and setters — `sceneRef`, `sessionRef`, `send`,
`dispatch`, `setStatus`. A plain function would take all of that as arguments on every call, so the
hook is the honest shape. What is *not* a closure over app state goes in a plain module beside it
and is tested without React: `startDrop.ts`, `openProject.ts`, `hint.ts`, `dentalPlacementSeed.ts`,
and the pure parts of `useFreeTransform.ts`.

Each hook takes ONE `host` object with a documented field per dependency, rather than a long
positional list. Adding a dependency then shows up as a named field at the call site in `App.tsx`
instead of a new argument in the right slot.

## Two rules these hooks are built around

**A fact and a verdict must not share a word.** `useSupportChecks` keeps a finding tied to the
particular unit version and the particular build it was found on; when either moves on, the finding
is out of date and the list says so. This is the same discipline the deck's rail follows
(`src/deck/README.md`) and the reason `src/items/rowState.ts` has nine states rather than one
"status".

**Pass the maps, not a callback over them.** `useSupportChecks` takes `built` and `failedBuilds`
rather than a `buildSettled` function. A callback recreated on every render is never equal twice, so
putting one in an effect's dependencies would rebuild the re-check timer on every render and defer
the re-check for as long as the app kept rendering. The maps compare by identity, which is the
question actually being asked. The hook's own docstring says this where it would be changed.

## What is still in `App.tsx`

Not everything that should be here is. `App.tsx` still holds, as named debt:

- **The support build map** — `built` and `failedBuilds` themselves. These stay, and that is a
  decision rather than a leftover: the map has thirty-odd read sites in `App.tsx` and three hooks
  already take it as input, so a hook around it would hand back nearly everything it was handed. A
  module is worth making when its output is NARROWER than its input, and this one's would not be.
  What *was* pure has already left: everything the app reads off a build now lives in
  `src/plate/buildViews.ts` and is tested without React.
- **The build scheduler** — the per-unit debounce and the effect that asks for a build, or keeps the
  one a slid denture already had. A real mechanism with a narrow contract, so it is the next
  extraction. The tangle to watch is `forgetUnit`, which reaches the preview worker, the denture
  worker, `useRegenerate`'s `forgetPlacing` and `useSupportChecks`'s `forgetProblems` in one call —
  the app has no single notion of "a unit left the scene", and that absence is the actual smell.
- **`runCommand`** — the registry switch. It is flat and readable where it is; moving it out would
  need a dependency object of thirty-odd fields, which is not obviously an improvement.
- **The scene history and session reducers**, the keyboard effect, and the JSX.
