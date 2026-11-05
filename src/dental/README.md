# src/dental: the aligner workflow

The dental flow's aligner job: the edit mode and its command registry, the Step 1 orientation evidence,
the support area, and rim define mode. The denture job lives in `src/denture`; the docks and the
viewport live in `src/components`. Engine calls go through `@mixo-geocore/host`, never direct.

The flow is a state machine, not a set of screens. `editingMode.ts` owns the stages
(`type → aligner → area → review`, with `rim` as Step 1's detour) and every command, key and refusal
that belongs to them; everything else here is either a pure helper it reads or a piece of one stage.

| Module | Purpose |
|---|---|
| `editingMode.ts` | The dental edit mode: its stages, events, gestures, keys and the whole command registry. The one place a dental control's label, hint, shortcut and disabled reason are decided. |
| `editing/` | Its tests, by subject — one file per stage (`dentalStep2`, `dentalStep3`, `rimStage`), plus commands, keys, locks, status and the shared `uiFixture.ts`. |
| `flow.ts` | Which stage follows which for a profile, and what a stage may do. |
| `diagnose.ts` | Turns an engine orientation result into what Step 1 shows. |
| `orientationEvidence.ts` | "Why this angle": the operator-facing evidence from the detection diagnostics. |
| `angleEvidence.ts` | The print-angle scan's evidence, as words and numbers. |
| `printAngle.ts` *(test only)* | The print-angle rules, exercised against the reference. |
| `confirmTilt.ts` | Accepting a scanned print angle, and what that settles. |
| `adjustMemory.ts` | What a step remembers when the operator goes back to it. |
| `manualArea.ts` | The support-area policy built from a rim when detection found no area. |
| `paintedArea.ts` *(test only)* | Painting and erasing the area, over the policy. |
| `legacyArea.ts` *(test only)* | Reading an area policy saved by an older version. |
| `areaRisk.ts` | Low points that fall outside the support area, for Step 2's list. |
| `supportPreset.ts` | The support settings a profile starts a unit on. |
| `savedPolicy.ts` *(test only)* | The policy as it round-trips through a saved project. |
| `arrange.ts` *(test only)* | Laying several aligners out on the plate without overlap. |
| `step1View.ts` | What Step 1 shows for the current stage and notices. |
| `stepPanelInset.ts` | How far the dock insets the viewport, so the two never overlap. |
| `tuning.ts` *(test only)* | The area's width, position and density, against the profile's limits. |
| `rim/` | Rim define mode — see below. |

## `rim/`: drawing a rim by hand

Step 1's detour, entered when detection finds no rim. The operator clicks anchors on the model, the
loop closes, and the engine turns it into a real `DentalRim`.

The geometry of the loop itself is **not here** — it is `src/core/surfacePath/` (anchors, segments,
resampling, validation, the plane fit), which knows nothing about teeth and is reused by anything that
draws on a surface. This folder is only the dental reading of it.

| Module | Purpose |
|---|---|
| `DentalRimStep.tsx` | The mode's dock: the tool switch, the readouts, the keys, Cancel and Done. Holds no wording of its own. |
| `rimStepText.ts` | The mode's sentences: what is wrong with the loop, and why Done is off. |
| `rimDraftGeometry.ts` | Where the drawing sits for the viewport: the lift off the surface, the chord pairs, and the two reach tests (pick up an anchor, close the loop). Pure. |
| `useRimDrawing.ts` | What the viewport does to the drawing: place an anchor, and store a drag. Both are scene commands, so the app history undoes them. |
| `drawnRim.ts` | The drawn loop becoming a real `DentalRim`: resample along the surface, then `dental_rim_from_points` (engine 61) for the plane, the side and the 96×96 visibility mask. Our own refusals are answered here, in our own words, before the engine is troubled. |

The viewport half is `src/components/viewport/RimDraftLayer.tsx` (it draws the anchors and the chord)
and the pointer handling in `UnitObject.tsx`. The drawing itself is scene state — `rimDraft` on the
unit, set by the `rim/set` and `rim/clear` commands in `src/state/project.ts` — so the app's ordinary
history undoes each edit, and one drag is one entry.

Design notes: `docs/design/2026-11-05-rim-define-mode.md` and
`docs/design/2026-11-05-back-out-one-level.md`.
