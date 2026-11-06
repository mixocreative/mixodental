# src/scenes: which scenes exist, and which are switched on

A **scene** is a whole screen the operator is looking at. There are three. Modes and steps are not
scenes: steps belong to a scene, and Support Edit Mode and no-support zones are modes *of* the bench.

| Scene | What they are doing | What puts you there | Scope | On |
|---|---|---|---|---|
| **Start** | Choosing what is going to get supports: the task, then the aligner type, then the file. | A `StartScreenId` is set. Renders full screen, instead of the workspace. | per run | yes |
| **Object** | One object, detected and then supported: Step 1 orientation and print angle, Step 2 the support area, Step 3 the supports. | `mode: 'dental'`; `dentalStage` says which step. | **per object** | yes |
| **Bench** | The workspace: plate, object list, settings, the five export buttons. Modes: resting, Support Edit Mode, no-support zones. | `mode` is `off`, `edit` or `zones` with no start screen. | per run | yes |

All three already existed. What did not exist was anywhere saying so: the start screens lived as a
`StartScreenId` inside a component, the steps as a `DentalStage` in the session, and the workspace as
`mode: 'off'`, which is not a name. "Which scenes are there?" could only be answered by reading three
unrelated files, and "switch that one off" had nowhere to do it.

## Why the table is data, not a comment

Switching a scene off has consequences nobody can hold in their head. Close the bench and its right
panel goes with it — including the five Export buttons, which is why Step 3 had to grow an export of
its own. A table can carry those consequences next to the flag. A test can refuse a flag that leaves
the operator nowhere to go. A comment can do neither.

So every switched-off scene must declare a `fallback`: where control goes instead, **why** there, what
it `carries` away, and what still reaches it `except`ionally. `sceneMap.test.ts` fails if a disabled
scene has no fallback, if its fallback points at another disabled scene, or if it claims to carry
nothing.

## What changed: where the flow ends

Pressing OK at the end of Step 3 used to hand back a workspace whose only relevant control was
Export — and the status line said so in as many words: *"Export STL or Save project to keep it."* The
flow ended by sending the operator somewhere else to finish. It now ends where the work ends.

`FLOW_END` is the flag, and it is a **route**, not a switch on a scene:

| Call site | `FLOW_END: 'bench'` (as it was) | `FLOW_END: 'export'` (now) |
|---|---|---|
| Step 3's way on | `dental.finish` — **OK** | `dental.export` — **Export STL** |


Both review footers (aligner and denture) ask `reviewWayOn()` rather than naming a command, so one
flag moves them together and neither is left behind. Set `FLOW_END = 'bench'` to put OK back.

**`dental.exit` is deliberately NOT on that list.** Routing it to the start screen too was built and
the walk caught it: Exit's own hint promises *"the aligner stays on the plate without supports"*,
which is a promise about the workspace, and landing on the start screen hides the object it just
mentioned. `FLOW_END` is about where the last step **ends**, not about the escape hatch.

**Export writes the file and stays on Step 3. It does not also navigate**, and that is deliberate:
`runExport` reports a refusal — the model changed, the supports did not build, the safety check could
not reach a verdict — through the status line and returns exactly as it does on success. A press that
navigated would walk the operator away from a file that was never written. *Add another aligner* and
*Exit* remain the two ways on, and both are already honest about where they go.

### Why this is a route and not "the bench is off"

Switching the bench scene off outright was built first, and reverted. The brief was about the end of
the dental flow; the bench is also **the whole non-dental half of the app**, reached from the start
screen's *Any model* key: Support Edit Mode, no-support zones, the plate panel, Save project and all
five export buttons. Hiding that key closed the only door to every one of them — and to about thirty
walk checks that cover them. None of it has anything to do with the dental flow.

So `SceneSpec.doors` now records the ways into a scene that do not come through the flow. A scene with
its own doors keeps working when the flow stops visiting it; a scene without them is the thing to be
careful about, and the field exists so that is visible before the flag moves rather than after.

The `enabled` / `fallback` machinery stays, tested, for a scene that genuinely should go: a disabled
scene must name where control goes instead, and that destination must itself be enabled.

## The planned multi-object workflow

Not in scope, and nothing here is built for it. One field is shaped for it: **`scope`**.

Today `start` is a `run` scene — one task, one type, chosen once, and everything after is one object
at a time. When the app grows to several imported files, previewed, each told what supports it gets
and whether to detect its orientation, **`start` becomes an `object` scene** and the loop widens by
one. That is the edit: one word in one row. `object` is already `scope: 'object'` and `repeats: true`,
so the per-object loop is a fact the code states rather than something the dental flow happens to do.

What deliberately is *not* here: no multi-file state, no preview scene, no per-object type field. A
field holding a future intention rots; a field that is already load-bearing does not.

## The modules

| Module | Purpose |
|---|---|
| `sceneMap.ts` | The three scenes, their flags, fallbacks and scopes. `sceneOf`, `sceneEnabled`, `sceneOrFallback`. Pure — no React, no DOM. |
| `sceneMap.test.ts` | No dead ends, one-hop fallbacks, the per-object scene being the only one that repeats, the flow ending at its export, and the bench keeping its own doors. |

The bench itself — what the scene *is*, region by region — is `src/bench/README.md`.
