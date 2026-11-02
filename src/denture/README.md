# src/denture: the denture workflow

The dental flow's denture job (Round D): start card, Step 1 orientation, Step 2 supports, the denture
settings, the parts list and the raft default. The aligner flow stays in `src/components` and
`src/dental`; shared pieces (step nav, dial, unresolved bubble) are reused from there, never copied.
Engine calls go through `engine/` only.

| Module | Purpose |
|---|---|
| `jobKind.ts` | The job kind of a profile id (`denture` / `aligner`) and the reference denture profile id. |
| `kindText.ts` | The dental lines that name the job's object: the denture line of every aligner sentence, once (status, commands, hints). |
| `steps/start/DentureChoice.tsx` | The start screen's "Denture supports" card. |
| `steps/start/startText.ts` | The file step's words per job kind. |
| `engine/dentureCore.ts` | The denture pipeline on one thread: orient + tilt scan, lifted frame, placement, build with hand work, one-point model-landing check. |
| `engine/dentureProtocol.ts` | Messages between the denture client and worker. |
| `engine/dentureWorker.ts` | The denture worker: runs the core and keeps the live-tilt handles. |
| `engine/dentureClient.ts` | The only way the app reaches the denture engine (keyed, one job at a time); long jobs offer Cancel, and `cancel(prefix)` stops a left step's jobs. |
| `engine/keyedQueue.ts` | One-at-a-time queue where a newer job of a key replaces a queued one; `drop(prefix)` removes waiting jobs. |
| `engine/liveTilt.ts` | The live-tilt throttle: one engine call per animation frame, skip while busy, newest wins. |
| `state/dentureState.ts` | What a denture unit stores (`PrintUnit.denture`): the denture policy. |
| `state/dentureStages.ts` | Step order of a denture inside the dental mode (no support-area step). |
| `settings/dentureSupportSettings.ts` | The support settings a new denture starts with: profile preset plus the solid raft (2 mm floor, edge 40 degrees from the plate, no rim). |
| `steps/orient/useDentureOrient.ts` | Step 1: upright, tilt scan, live tips while tilting, Auto orient, Next (placement), handle freed on leave. |
| `steps/orient/scanOutcome.ts` | How Step 1's scan ended (pick, no pick, failure, crash, cancel): every ending leaves "scanning". |
| `steps/orient/acceptCommands.ts` | Step 1 Next as one undo step: settings, lifted pose, tips, policy. |
| `steps/orient/liveTipLayers.ts` | Live tips as coloured marks by path state. |
| `steps/orient/tipColours.ts` | The path-state colours from the CSS tokens. |
| `steps/orient/LiveTipSummary.tsx` | The legend under the dial: tips per path state. |
| `steps/orient/stepOneText.ts` | Step 1 badge words per job kind. |
| `progress/stagePlans.ts` | The stages of the Step 1 scan and the support build: stage strings the worker posts, names, weights, typical times. |
| `progress/stageModel.ts` | The pure staged-progress model: advance by stage, ease inside it, never pass the next boundary, monotonic, finish / fail / cancel / reset. |
| `progress/StagedProgress.tsx` | The staged bar in a job's row of the background-work list: "Step n of N", stage name, elapsed time, bar (Cancel stays the row's). |
| `useDentureJob.ts` | App entry: owns the client, wires each step's hook. |
| `engine/dentureExport.ts` | Export of a plate with dentures: builds every unit (dentures with their own pipeline) and writes the STL files. |
| `state/dentureCommands.ts` | The denture rows in the shared command registry ("Resolve all") and the undo hint of a denture change. |
| `settings/dentureRules.ts` | Maps the denture settings onto engine rules (`dentalModelLanding`, `lowOutsideAllowed`, `lastResortClearanceMm`) and the unit's one Overhang angle (`scatterAngle`) onto `overhangAngleDeg`; only non-defaults are sent. |
| `steps/supports/dentureBuildJob.ts` | A denture unit as a build job (frame, plate, policy, settings, rules, hand work). |
| `steps/supports/useDentureSupports.ts` | Step 2: builds and exports in the denture worker, click-to-resolve and Resolve all, the lattice switch; Exit stops the unit's builds (`leave`). |
| `steps/supports/resolvePoint.ts` | Which points a click resolves (tips, lowest points, bare islands) and the undoable allow-list command. |
| `steps/supports/ResolveSection.tsx` | The panel block: unresolved points (islands included), islands that face sideways, model-landed supports, Resolve all. |
| `settings/dentureOptions.ts` | The denture settings, their defaults and limits (stored in `PrintUnit.denture.options`). |
| `settings/DentureSettingsSection.tsx` | The settings block: model-surface support default, low tips outside the area, clearance floor. |
| `steps/supports/DentureSupportsBlocks.tsx` | The denture blocks of the shared supports panel, in order. |
| `parts/partRoles.ts` | Orders the engine's part list (target, add-on, debris) and finds the add-on faces. |
| `parts/PartsList.tsx` | The parts list of a multi-part file (hidden for one part). |
| `parts/addOnTint.tsx` | The add-on tint of a unit's current build (shared `components/viewport/FaceTintLayer.tsx`, token `--part-addon`), or none. |

Shared pieces used, not copied: `components/OrientationBar.tsx` (Step 1 bar, dial, Back / Next), `components/DentalSupports.tsx`
(Step 2 panel, `kind="denture"`), `components/viewport/UnresolvedBubbles.tsx` (bubble, `resolve` makes it a button).

Staged progress (P8): the engine posts one stage in a build (`samplingNormals`, as its single generate call begins) and the
scan's tilt fraction; the worker code around the engine calls posts the others (`dentureCore.buildDenture`, `orientAndScan`).
To split the long "Routing supports" stage (35 to 50 s) the engine's generate call would have to post its phases
(routing, raft, checking); until it does, the bar eases inside that stage.
