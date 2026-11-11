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
| `useSupportBuilds.ts` | **When supports get rebuilt**: the settling delay per unit, the build a slid denture keeps when it is only moved, the empty entry a unit with no supports still needs, and the pruning of work for a unit that has left the scene. |
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

## Where a refusal goes, and why it is said twice

**A refusal that reaches only the status line has not reached the operator.** The status line holds
one message and the next thing to happen replaces it, so "nothing was written" can be erased by a
cheerful sentence about something else before anyone reads it. Both halves of that defect were
reproduced by fault injection on 2026-11-09 (`docs/reviews/2026-11-09-wiring-walk-dental-flow.md`
§6, walk checks `q1`/`q2`): two files dropped together, the plate ledger correctly refused the
second, and the winner's own heavy-model sentence then took the line.

So a refusal is said **twice**: to the status line, which is where the operator is looking at that
instant, and to the **job activity list**, which is where it stays. That list never drops a failed
row (`JobActivity.view` deletes only rows whose outcome is not `failed`) and surfaces one that ended
inside its show delay, so it is the screen that remembers.

| file | its part in that |
|---|---|
| `useImportFiles.ts` | `listBudgetRefusal` — a triangle, memory or plate refusal can happen before any worker starts, so nothing was ever listed. A file the WORKER refuses was always safe, and that asymmetry is what hid it. (Each cap is also re-checked after the read — see below.) |
| `exportOutcomeText.ts` | what an export wrote, or did not: the four refusal sentences and the partial-write one, pure, read by **both** screens. They live here because the activity list builds its text from an error CODE, and the generic "the export failed" it would otherwise reach is a second, vaguer vocabulary for an event the status line describes exactly. |
| `useExport.ts` | `sayOutcome` — one call that says it to both; `refuse(reason, name)` and the write loop's partial report are its two callers. |
| `JobActivity.tsx` | `failureText` prefers `storedExportOutcome` over the generic text, so the two screens cannot drift. |

### The import budget is checked twice, and the second pass is the real one

`useImportFiles` refuses a file from the header's **estimate** before anything is parsed, and again
from the triangles actually **read**. The first pass is a guess: an STL header can lie, and a glTF's
estimate may not be readable at all. So a cap enforced only on the estimate is a cap the real file
walks past — and the 2026-11-11 audit found exactly that (`cia-audit-report.md` MIXO-01): the
triangle and plate caps were re-checked after the read, the **memory** cap was not.

The rule now has a guard rather than a habit. `importCapacity.test.ts` reads the source and fails if
any `assert*Capacity` in the estimate branch is missing from the counted pass, so a cap added to one
pass and forgotten in the other cannot ship. It also pins the memory cap to the **file's own** count:
handed the drop's running total it would refuse a legal file because an earlier one was large, which
is the plate cap's job and not memory's.

Neither re-check can prevent the read — by then the mesh is in memory. What they prevent is the scene
accepting the file, and every later pass over it.

### Two more of the same defect, found the same way on 2026-11-09 (§6b)

**A write that stopped part way (W-11).** The export hands each file to the browser in a loop of
`<a download>.click()`, so the first file is on disk before the second hand-over is attempted — the
one place this code commits more than once. A throw in that loop reached the generic catch, which
says *nothing was saved*: true of every export failure that happens before a byte is written, and
false here. The loop now records what it handed over. The trap is written where the mistake would be
made: **a browser that blocks quietly does not throw**, so this is the narrow claim that what the
loop MANAGED to hand over is what the operator is told about, not a guarantee that every file landed.

**The list was not on the deck at all (W-12), and then said the wrong thing (W-13).**
`JobActivityPanel` is rendered inside the viewport, and the viewport is not rendered while a start
screen is up — so the screen that remembers did not exist on the deck, which is where the longest
background work in the app runs. It is mounted there too now (`App.tsx`, two exclusive mount points,
one singleton registry). Fixing that put a sentence on screen that had been unreachable: every
dental analysis kind inherited the "support build" vocabulary, because `failureText` defaulted an
unknown context to `build`. `workers/analysisJobVocabulary.ts` maps each kind to a vocabulary that is
true of it, total by type.

**What this fix is not.** The activity list is dismissible and session-scoped: a project reopened
tomorrow does not know its last export was refused. A persistent mark on the unit is scene state
with save-file consequences, so it is written down as debt with its reason (the review's "what runs
next") rather than taken quietly.

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

**A module hands back LESS than it was given.** This is the test applied before every extraction
here, and it is why the support build MAP stayed in `App.tsx` while its scheduler and its derived
views left. Count the host fields in against the values out: `useImportFiles` is eleven in and two
out, `useSupportBuilds` nine in and nothing out, and both earn their place. A hook wrapped round
`built`/`failedBuilds` would be about twelve in and ten out, because thirty-odd sites in `App.tsx`
and three other hooks read those maps — that is a hub, and moving a hub is motion, not modularity.

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
- **`forgetUnit`** — one call that reaches the preview worker, the export worker, the analysis
  worker, `useRegenerate`'s `forgetPlacing` and `useSupportChecks`'s `forgetProblems`. The app has no
  single notion of "a unit left the scene", and that absence is the real debt here, not the length of
  the function. It is left visible in `App.tsx` on purpose: buried inside a hook it would look
  settled. (`useSupportBuilds` no longer adds to it — it clears its own timers, which is why that
  hook's one caller is also the only place a departure is noticed.)
- **`startItem`** — what a press from the deck does: which unit is opened, and (since E4) which tool
  the press may enter. It is wiring by definition — it reaches the scene, the session, the flow hook
  and the start screen. Its one rule is E4's: Rim on a row the detector flagged `no-rim` goes to rim
  drawing rather than back through a detection (`src/deck/README.md`). When the workspace replaces
  the deck, this is what `openTool(tool, unitId)` takes over
  (`docs/design/2026-11-07-import-and-items-flow.md` §10).
- **Two invariant effects about units leaving**, and they are here because they need the SCENE and
  the SESSION together, which is what the composition root has:
  - closing the last model returns to the start and leaves any step;
  - **the dental flow cannot be open on a unit that is not on the plate** (W-09). A guard in
    `startItem` cannot do this job: `sceneRef.current` is a render behind, so it cannot see a
    removal dispatched in the same tick as the press. The effect runs on rendered state, so it does
    not care which actor won or in what order, and it RECOVERS — the flow closes and the deck comes
    back — rather than refusing. Both effects are the same shape and should stay next to each
    other; a third would be the signal that "a unit left the scene" wants a notion of its own, which
    is the debt `forgetUnit` above already names.
- **`runCommand`** — the registry switch. It is flat and readable where it is; moving it out would
  need a dependency object of thirty-odd fields, which is not obviously an improvement.
- **The scene history and session reducers**, the keyboard effect, and the JSX.
