# Wiring walk — the dental flow, 2026-11-09

Reference-guided walk of the deck → flow → deck journeys. This is the companion to
`2026-11-08-cia-deck-and-flow.md`, which swept for defect classes; this one asks whether every
connection is actually wired, and whether each lifecycle ends somewhere a person can account for.

**Tier: in progress.** §4 map and §5 connections below. Fault injection (§6, G1–G7) is NOT yet run —
every proof status is `READ` until it is, and a register where every row is `READ` is a code review.
Said here rather than left to be inferred.

**Reference:** no external reference system does this job, so the expected path comes from the design
doc (`docs/design/2026-11-07-import-and-items-flow.md`), the ADR-style decisions in the module
READMEs, and the owner's own words. Column headers say so.

## §1 — The question, written for this system

> **A case of eight arches is dropped. Three come back with no rim. The operator draws one of those
> rims and exports that row, re-arranges the plate, rotates a finished model, and a detection result
> lands for a row they have since removed. They close the browser and reopen the project tomorrow.**
>
> **Which supports does each row now have, planted at which orientation, and do the plate, the rail,
> the row's own sentence, the saved file and the exported STL all agree about it?**

That sentence is the audit. A feature list cannot answer it: every function in it works alone, and
four of the defects found yesterday lived in the gaps between them.

## §4 — The lifecycle state map

"Our path" is from the code and from this session's reading, never from the docs. `path:line` where
it is code; `UNVERIFIED` where I have not checked.

| Lifecycle | Expected path (design doc / owner) | Our path | Failure / retry path | Operator-visible result |
|---|---|---|---|---|
| **Intake — drop** | accept → refuse or place on plate | `components/useImportFiles.ts` (`importFiles`); budget refusals by triangle, memory and plate ledger | a refused file becomes a ROW (`RefusedRow`); a drop where every file fails keeps the Drop page | refusal row, and the status line |
| **Intake — purpose** | purpose per RUN, before detection | Drop page keys → `startDental`/`batchProfile` (`App.tsx`) | **GAP:** "Any model" and "Open a saved project" bypass `choose()`, so a held batch is discarded silently (ledger, relayed — not yet verified) | none — the workspace opens empty |
| **Detection** | one `dentalOrient` per row, serialised by triangle budget | `items/useBatchDetect.ts`; per-row `DetectState` | a row's job failing → `failed`; the next row still runs | the row's own sentence; **tone added 2026-11-08** so trouble no longer reads like success |
| **Flow — orient** | read → detect → review → accept | `components/useDentalFlow.ts` `startAligner`, `next` | no rim → hands over to rim mode; no result → `failed` notice | the dock, Step 1 |
| **Flow — rim (detour)** | enter → place/adjust → close → Done | `dental/rim/`, stage `rim` | Cancel keeps the drawing; `dental.rim.enter` returns to it | the mode's own `rim-why` line |
| **Flow — area** | paint/erase → accept | stage `area`; `dental/set` on accept | **GAP:** accept REPLACES the policy (`stamps: []`, default tuning), destroying painted work with no confirm | none — silent |
| **Build** | request → debounce → worker → mesh | `components/useSupportBuilds.ts` (120 ms settle; `requested` guards late arrivals) | rejection → `failedBuilds` + status | counts stop waiting; status line |
| **Check** | request → worker → findings | `components/useSupportChecks.ts`; findings tied to unit version AND build | 600 ms re-check on change; errors → status | the Problems list, greying while stale |
| **Export** | plan → full-resolution build → write | `components/useExport.ts` | refusals: `stale` (changed mid-export), `failed`, `inconclusive`, **`replant` (added 2026-11-09)** | status line only |
| **Retention — project file** | pack → write → read back | `components/useProjectFile.ts`; revisions and `rimDraft` validated on load | `saved.current` records what was packed | status line |
| **Reversal — undo/redo** | command → inverse | `state/history.ts`, scene history | undo floor is the step's start | the Undo toast |
| **Reversal — Back / Cancel / Exit** | step out, keep what was accepted | `dental.back` (Step 1 → the case, 2026-11-08), `dental.exit` → `exitCommands` | **GAP:** Exit strips supports of a unit not in `dentalFinished`; the list is session state and was resettable (fixed 2026-11-08) | none for Exit — no confirm |
| **Reversal — Remove a row** | row leaves, nothing else changes | `unit/remove`; selection guarded (fixed 2026-11-08) | **GAP:** no confirm and no undo offer, unlike `deleteUnits` | the row disappears |

## §5 — Seven questions, per connection on the primary flow

`Y` = evidence found this session. `n` = no. `?` = UNVERIFIED at this tier.

| Connection | Q1 invoked | Q2 persisted | Q3 retry-safe | Q4 one authority | Q5 can stop unseen | Q6 operator screen | Q7 connection test |
|---|---|---|---|---|---|---|---|
| Drop → import → plate | Y | Y | Y (ledger) | Y | n/a | Y (refused row) | Y (walk `m`) |
| Purpose → detection | Y | Y | ? | **n** — the batch keeps the profile captured when the loop started | ? | n | n |
| Batch → row state | Y | Y (states map) | Y (`started` set) | Y | **n** — a never-resolving job leaves later rows `waiting` for ever | Y (tone, 2026-11-08) | **n** |
| Row → rail facts | Y | n/a | n/a | Y (unit facts, 2026-11-08) | n/a | Y | Y (`unitFacts.test`) |
| **Rail button → open the tool** | **n — DEAD, no handler** | n/a | n/a | n/a | n/a | n | **n** |
| Start → open a row | Y (2026-11-09) | Y | ? | Y | n/a | Y | Y (walk `m4f`, `m5b`) |
| Orient accept → policy | Y | Y | **n** — replaces painted stamps and tuning | Y | n/a | **n** | n |
| Unit change → build | Y | Y | Y (`requested` identity) | Y | n | Y (counts, status) | Y (`useSupportBuilds` guards) |
| Build → check | Y | Y | Y (600 ms, map identity) | Y | n | Y (Problems) | Y (walk `x9b`) |
| Revisions → export gate | Y (2026-11-09) | n/a | n/a | Y | n/a | **n** — status line only, replaced by the next message | Y (`revisions.test`) |
| Export → STL | Y | Y | Y (refusals) | Y | n | Y (status) | ? |
| Scene → project file | Y | Y | Y (idempotent pack) | Y | n/a | Y (status) | Y (`projectFile.test`) |

## §9 — Gap register

Proof status is `READ` throughout: nothing below has been reproduced by fault injection in this run.

| ID | Layer | Lifecycle | Connection / rule | Location | What breaks | Proof | Severity |
|---|---|---|---|---|---|---|---|
| W-01 | L2 | Flow — area | Orient accept → policy | `components/useDentalFlow.ts:320` | Accepting an orientation replaces the dental policy with `stamps: []` and default tuning, destroying the painted support area and the Step 3 tuning with no confirmation. The hand-work guard (`backNeedsConfirm`) reads `manual`, `deleted` and `contactSettings` only, so it cannot see this. | READ | HIGH |
| W-02 | L2 | Rail | Rail button → open the tool | `deck/ToolRail.tsx:52` | The buttons have no `onClick` and `onPick` is never called. Four states are drawn and none is pressable. | READ | HIGH |
| W-03 | L3 | Detection | Batch → row state | `items/useBatchDetect.ts:58` | A job that never resolves blocks the queue; later rows stay `waiting`, which renders as the same blank as "queued". No timeout, no liveness check. | READ | MEDIUM |
| W-04 | L3 | Purpose → detection | one authority | `items/useBatchDetect.ts:68` | The loop uses the profile captured when it started, so rows queued after a second drop with a different purpose are detected under the first one. | READ | MEDIUM |
| W-05 | L2 | Export | Revisions → operator | `components/useExport.ts` | The replant refusal reaches a status line that the next message replaces; there is no persistent flag on the row or the unit. | READ | MEDIUM |
| W-06 | L2 | Reversal | Remove a row | `App.tsx` (`onRemove`) | No confirmation and no undo offer, unlike `deleteUnits` which offers both. A finished, exported row and its supports go in one click. | READ | MEDIUM |

## What runs next

1. **G2 and G4 at minimum** (replay, and two actors on one scarce resource) — Screen tier's floor, and
   neither has been run on this system.
2. **G1, G5, G7** against the batch and the workers: reject a build write mid-flow; time out a worker
   whose far side succeeded; stop the batch loop longer than its period.
3. Then the §8 rule matrix, with each row's proof from this run rather than from reading.
