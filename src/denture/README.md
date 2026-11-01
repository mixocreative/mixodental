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
| `settings/dentureSupportSettings.ts` | The support settings a new denture starts with (profile preset). |
| `steps/orient/useDentureOrient.ts` | Step 1: upright, tilt scan, live tips while tilting, Auto orient, Next (placement), handle freed on leave. |
| `steps/orient/acceptCommands.ts` | Step 1 Next as one undo step: settings, lifted pose, tips, policy. |
| `steps/orient/liveTipLayers.ts` | Live tips as coloured marks by path state. |
| `steps/orient/tipColours.ts` | The path-state colours from the CSS tokens. |
| `steps/orient/LiveTipSummary.tsx` | The legend under the dial: tips per path state. |
| `steps/orient/stepOneText.ts` | Step 1 badge words per job kind. |
| `useDentureJob.ts` | App entry: owns the client, wires each step's hook. |
