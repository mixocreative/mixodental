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
| `steps/orient/dialSync.ts` | The dial follows the pose after Undo, Redo or Restore step turned the denture (the row whose rotation is shown; a hand pose marks the dial as by hand). |
| `steps/orient/liveTipLayers.ts` | Live tips as coloured marks by path state. |
| `steps/orient/tipColours.ts` | The path-state colours from the CSS tokens. |
| `steps/orient/LiveTipSummary.tsx` | The legend under the dial: tips per path state. |
| `steps/orient/stepOneText.ts` | Step 1 badge words per job kind. |
| `progress/stagePlans.ts` | The stages of the Step 1 scan and the support build: stage strings the worker posts, names, weights, typical times. |
| `progress/phaseStages.ts` | Folds the engine's build phases into the build stages (routing's done/total is its fraction); a repair round posts the repair string. |
| `progress/stageModel.ts` | The pure staged-progress model: advance by stage, ease inside it, never pass the next boundary, monotonic, finish / fail / cancel / reset. |
| `progress/StagedProgress.tsx` | The staged bar in a job's row of the background-work list: "Step n of N", stage name, elapsed time, bar (Cancel stays the row's). |
| `useDentureJob.ts` | App entry: owns the client, wires each step's hook. |
| `engine/dentureExport.ts` | Export of a plate with dentures: builds every unit (dentures with their own pipeline) and writes the STL files. |
| `state/dentureCommands.ts` | The denture rows in the shared command registry ("Resolve all") and the undo hint of a denture change. |
| `settings/dentureRules.ts` | Maps the denture settings onto engine rules (`dentalModelLanding`, `lowOutsideAllowed`, `lastResortClearanceMm`) and the unit's one Overhang angle (`scatterAngle`) onto `overhangAngleDeg`; only non-defaults are sent. |
| `steps/supports/dentureBuildJob.ts` | A denture unit as a build job (frame, plate, policy, settings, rules, hand work). |
| `steps/supports/useDentureSupports.ts` | Step 2: builds and exports in the denture worker, click-to-resolve and Fix (resolve all), the lattice switch; Exit stops the unit's builds (`leave`). |
| `steps/supports/rigidMove.ts` | Whether a scene change only slides the denture over the plate or turns it about the vertical (OK's arrangement): then its finished build is kept and moved with it, not rebuilt. Proved on the real scan by `rigidMove.real.test.ts`. |
| `steps/supports/resolvePoint.ts` | Which points a click resolves (tips, lowest points, bare islands) and the undoable allow-list command. |
| `steps/supports/ResolveSection.tsx` | The Details block: unresolved points (islands included), islands that face sideways, model-landed supports; `unresolvedCounts` for the status line. |
| `steps/supports/DentureReviewPanel.tsx` | Step 2's side panel (P7c), laid out like the aligner's tilt step: one status line with Fix and Details, one folded Adjust (support settings, denture settings, edit tools, ID label), Restore step and Add another denture, Back \| OK. |
| `steps/supports/reviewLineText.ts` | The status line's sentence: building, failed, "n spots need a support" (with Fix), "n things to look at", or "Supports ready". Spots accepted by rule never count. |
| `steps/supports/adjustMemory.ts` | Whether Adjust is open, remembered for the browser session (closed by default). |
| `steps/supports/useAutoCheck.ts` | Runs the support check once per finished build, so the status line counts the problems without a Check press. |
| `check/ruleSpots.ts` | The denture rules' verdict on the support check's spots (worker): a spot on a face the engine's review masks leave unsupported on purpose has a reason (outside the allowed area, no-support side, rim), else it is a real problem. |
| `check/acceptedSpots.ts` | Groups the accepted spots, one row per reason, and keeps the real problems. |
| `check/dentureSpots.ts` | Asks the denture worker for the verdict; a failed or cancelled question leaves every spot a problem. |
| `check/ruleText.ts` | The plain-words reason of each rule. |
| `settings/dentureOptions.ts` | The denture settings, their defaults and limits (stored in `PrintUnit.denture.options`). |
| `settings/DentureSettingsSection.tsx` | The settings block (under Adjust): "Supports may touch the denture" (model-surface support default), low tips outside the area, clearance floor. |
| `parts/partRoles.ts` | Orders the engine's part list (target, add-on, debris) and finds the add-on faces. |
| `parts/PartsList.tsx` | The parts list of a multi-part file (hidden for one part). |
| `parts/addOnTint.tsx` | The add-on tint of a unit's current build (shared `components/viewport/FaceTintLayer.tsx`, token `--part-addon`), or none. |

Restore step (P7b): `components/RestoreStepButton.tsx` (the quiet secondary button of Step 1, Step 2 and the aligner's area step) runs App's `restoreStep`, which puts the scene the step began with (App's undo floor) back as one undo step (`state/history.restoreScene`). The Step 2 panel docks right from 721 px (`dental/stepPanelInset.ts`).

Shared pieces used, not copied: `components/OrientationBar.tsx` (Step 1 bar, dial, Back / Next), `components/DentalReviewBlocks.tsx`
(the supports step's blocks: settings, edit tools, problems, ID label, Back question; the aligner's Step 3 shows them all open in
`components/DentalSupports.tsx`), `components/Panel.tsx` (Adjust), `components/viewport/UnresolvedBubbles.tsx` (bubble, `resolve` makes it a button).

Step 2 words (P7c): the denture's plain labels come from `kindText.ts` (Pillar size: "Support thickness", Lift height: "Lift from
plate", Cross-braces: "Extra bracing", the one-sentence status line), so the aligner keeps its own.

Staged progress (P8, engine 60): the engine's generate call reports its phases (`onPhase`, `GENERATE_PHASES`), and
`progress/phaseStages.ts` folds them into the build plan's five stages (`progress/stagePlans.ts`, weights = the measured shares of
a build on case #1): Placing tips (app side, before generate, 3), Preparing the model (preparing, 6), Routing supports (routing,
counted done/total is the stage's real fraction, 50), Bracing and raft (placing + bracing + raft, 7), Checking the supports
(checking + judging + finishing + writing, 34). A repair round re-enters routing..checking: the mapper then posts the repair string,
the stage model sets `repairing` (a "Repairing" sub-label in the row, bar neither moves back nor fills), and `judging` ends it.
The scan's tilt fraction is still posted by `orientAndScan`. Unknown phases and stage strings change nothing.
