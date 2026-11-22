# src/dental: the aligner workflow

The dental flow's aligner job: the edit mode and its command registry, the Step 1 orientation evidence,
the support area, and rim define mode. The denture job lives in `src/denture`; the docks and the
viewport live in `src/components`. Engine calls go through `@mixo-geocore/host`, never direct.

The flow is a state machine, not a set of screens. `editingMode.ts` owns the stages
(`aligner → area → review`, with `rim` as Step 1's detour) and every command, key and refusal
that belongs to them; everything else here is either a pure helper it reads or a piece of one stage.

There is **no `type` stage** — this line said there was until 2026-11-19. The appliance kind is
chosen per run on the Drop page, because detection takes the profile as an argument, so asking inside
the flow was always one screen too late (`editingMode.ts`'s own header says so).

| Module | Purpose |
|---|---|
| `editingMode.ts` | The dental edit mode: its stages, events, gestures, keys and the whole command registry. The one place a dental control's label, hint, shortcut and disabled reason are decided. |
| `editing/` | Its tests, by subject — one file per stage (`dentalStep2`, `dentalStep3`, `rimStage`), plus commands, keys, locks, status and the shared `uiFixture.ts`. |
| `stages.ts` | **The flow's stage decisions as plain functions** - the settings a new aligner starts with, what a detected area becomes, what the tilt scan is asked to try, the confirm order, the starting label, the turn-with-re-layout pairing. `useDentalFlow` and the deck's auto-gen pipeline both call these and neither restates one, which is what keeps auto-gen from quietly making different supports from the editor. |
| `flow.ts` | Which stage follows which for a profile, what a stage may do, and what Back out of Step 3 costs. |
| `diagnose.ts` | Turns an engine orientation result into what Step 1 shows. |
| `orientationEvidence.ts` | "Why this angle": the operator-facing evidence from the detection diagnostics. |
| `angleEvidence.ts` | The print-angle scan's evidence, as words and numbers. |
| `printAngle.ts` *(test only)* | The print-angle rules, exercised against the reference. |
| `confirmTilt.ts` | Accepting a scanned print angle, and what that settles. |
| `adjustMemory.ts` | Whether a supports panel's Adjust section is open, for the browser session. Nothing to do with steps: one key per job kind, in `sessionStorage`. |
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

Step 1's detour. The operator places handles on the model, drags them, closes the loop, and Done turns
the drawing into a real `DentalRim` through the engine (`dental_rim_from_points`, engine 61). Complete
and shipped.

**Dentures use it too, since 2026-11-23** (docs/ORIENT-NODES.md section 10, step 10). It is the same tool and dock, but
the seed comes from the engine's detected denture rim, and the line may stay OPEN (a lower denture's U; `rimDoneReason`
accepts two points). Done hands the drawing to `src/denture/steps/orient/useDentureRim.ts` (`useRimDrawing`'s
`dentureDone`), which stores it as the unit's `dentureRim`; it replaces the detected rim in every denture job.

**Two things changed on 2026-11-09 and the rest of this section assumes them.** It is no longer only
for shapes with no findable rim: **a DETECTED rim can be redrawn**, seeded from detection's own loop
(`seedFromDetected.ts`). And there is **one tool, not two** - the target under the press decides
(`rimTarget.ts`), so creating a rim and correcting one are the same interaction.

The geometry of the loop itself is **not here** — it is `src/core/surfacePath/` (anchors, segments,
the centripetal curve through them in `spline.ts`, resampling, validation, the plane fit), which knows
nothing about teeth and is reused by anything that draws on a surface. This folder is only the dental
reading of it.

| Module | Purpose |
|---|---|
| `DentalRimStep.tsx` | The mode's dock: the readouts, Delete point, Clear, Cancel and Done. No tool switch - there is one tool. Holds no wording of its own. |
| `rimTarget.ts` | **What a press MEANS**, and the whole grammar of the one tool: handle, line, close, append or nothing. Pure, so the rules are tested without a browser. `rimTapAt` is the same question for the click a release fires, which must not be read as a tap when the pointer travelled. |
| `seedFromDetected.ts` | A detected rim turned back into draggable handles: one every 12 mm of arc and one wherever the rim turns 45 degrees, capped at 48. A REPLACEMENT for the detected rim, not a lossless edit - the axis comes back about 5.6 degrees different - and the command says so. |
| `rimStepText.ts` | The mode's sentences: what is wrong with the loop, and why Done is off. |
| `rimDraftGeometry.ts` | Where the drawing sits for the viewport: the lift off the surface, the drawn line, and the two reach tests (pick up an anchor, close the loop). Pure. The line is the CURVE, sampled by the same `spanCurve` a press is measured against - drawn as chords it disagreed with the pick by over a millimetre at the seeded spacing, and a press on the visible line did nothing. |
| `useRimDrawing.ts` | What the mode DOES: place an anchor, store a drag, and Done. The two edits are scene commands, so the app history undoes them; Done builds the rim and hands Step 1 back. |
| `drawnRim.ts` | The drawn loop becoming a real `DentalRim`: resample along the surface, then `dental_rim_from_points` (engine 61) for the plane, the side and the 96×96 visibility mask. Our own refusals are answered here, in our own words, before the engine is troubled. |

The viewport half is `src/components/viewport/RimDraftLayer.tsx` (it draws the anchors and the chord)
and the pointer handling in `UnitObject.tsx`. The drawing itself is scene state — `rimDraft` on the
unit, set by the `rim/set` and `rim/clear` commands in `src/state/project.ts` — so the app's ordinary
history undoes each edit, and one drag is one entry.

Design notes: `docs/design.md#2026-11-05-rim-define-mode` and
`docs/design.md#2026-11-05-back-out-one-level`.
