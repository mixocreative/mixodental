# src/denture: the denture workflow

The dental flow's denture job (Round D): start card, Step 1 orientation, Step 2 supports, the denture
settings, the parts list and the raft default. The aligner flow stays in `src/components` and
`src/dental`; shared pieces (step nav, dial, unresolved bubble) are reused from there, never copied.
Engine calls go through `engine/` only.

| Module | Purpose |
|---|---|
| `jobKind.ts` | The job kind of a profile id (`denture` / `aligner`) and the reference denture profile id. |
| `steps/start/DentureChoice.tsx` | The start screen's "Denture supports" card. |
| `steps/start/startText.ts` | The file step's words per job kind. |
| `engine/dentureCore.ts` | The denture pipeline on one thread: orient + tilt scan, lifted frame, placement, build with hand work, one-point model-landing check. |
| `engine/dentureProtocol.ts` | Messages between the denture client and worker. |
| `engine/dentureWorker.ts` | The denture worker: runs the core and keeps the live-tilt handles. |
| `engine/dentureClient.ts` | The only way the app reaches the denture engine (keyed, one job at a time). |
| `engine/keyedQueue.ts` | One-at-a-time queue where a newer job of a key replaces a queued one. |
| `engine/liveTilt.ts` | The live-tilt throttle: one engine call per animation frame, skip while busy, newest wins. |
| `state/dentureState.ts` | What a denture unit stores (`PrintUnit.denture`): the denture policy. |
| `state/dentureStages.ts` | Step order of a denture inside the dental mode (no support-area step). |
| `settings/dentureSupportSettings.ts` | The support settings a new denture starts with: profile preset plus the solid raft (2 mm floor, edge 40 degrees from the plate, no rim). |
| `steps/orient/useDentureOrient.ts` | Step 1: upright, tilt scan, live tips while tilting, Auto orient, Next (placement), handle freed on leave. |
| `steps/orient/acceptCommands.ts` | Step 1 Next as one undo step: settings, lifted pose, tips, policy. |
| `steps/orient/liveTipLayers.ts` | Live tips as coloured marks by path state. |
| `steps/orient/tipColours.ts` | The path-state colours from the CSS tokens. |
| `steps/orient/LiveTipSummary.tsx` | The legend under the dial: tips per path state. |
| `steps/orient/stepOneText.ts` | Step 1 badge words per job kind. |
| `useDentureJob.ts` | App entry: owns the client, wires each step's hook. |
| `engine/dentureExport.ts` | Export of a plate with dentures: builds every unit (dentures with their own pipeline) and writes the STL files. |
| `state/dentureCommands.ts` | The denture rows in the shared command registry ("Resolve all") and the undo hint of a denture change. |
| `settings/dentureRules.ts` | The engine rules every denture call reads (one place to map the denture settings onto). |
| `steps/supports/dentureBuildJob.ts` | A denture unit as a build job (frame, plate, policy, settings, rules, hand work). |
| `steps/supports/useDentureSupports.ts` | Step 2: builds and exports in the denture worker, click-to-resolve and Resolve all, the lattice switch. |
| `steps/supports/resolvePoint.ts` | Which points a click resolves and the undoable allow-list command. |
| `steps/supports/ResolveSection.tsx` | The panel block: unresolved points, islands, model-landed supports, Resolve all. |

Shared pieces used, not copied: `components/OrientationBar.tsx` (Step 1 bar, dial, Back / Next), `components/DentalSupports.tsx`
(Step 2 panel, `kind="denture"`), `components/viewport/UnresolvedBubbles.tsx` (bubble, `resolve` makes it a button).

| Module (Step 4) | Purpose |
|---|---|
| `settings/dentureOptions.ts` | The denture settings, their defaults and limits (stored in `PrintUnit.denture.options`). |
| `settings/dentureRules.ts` | Maps the denture settings onto engine rules (`dentalModelLanding`, `lowOutsideAllowed`, `lastResortClearanceMm`); only non-defaults are sent. |
| `settings/DentureSettingsSection.tsx` | The settings block: model-surface support default, low tips outside the area, clearance floor. |
| `steps/supports/DentureSupportsBlocks.tsx` | The denture blocks of the shared supports panel, in order. |
| `parts/partRoles.ts` | Orders the engine's part list (target, add-on, debris) and finds the add-on faces. |
| `parts/PartsList.tsx` | The parts list of a multi-part file (hidden for one part). |
| `parts/addOnTint.tsx` | The add-on tint of a unit's current build (shared `components/viewport/FaceTintLayer.tsx`, token `--part-addon`), or none. |
