# Goldfish context — rim define mode

A reading list, not an argument. Each line says what the file holds so a reviewer can go
straight to what it needs instead of sweeping the repository. Nothing here is a finding.

**Read what you need from this list. Do not browse the tree.** `graphify-out/GRAPH_REPORT.md`
exists but is 72K and is only worth opening for a whole-architecture question.

## The feature under review

| File | What it holds |
| --- | --- |
| `src/dental/editingMode.ts` | The dental edit mode: session state, the event reducer, the command registry entries (`dental.rim.*`), the key ladder, and the gesture each stage produces. |
| `src/dental/rim/useRimDrawing.ts` | What rim define mode DOES: place an anchor, move one, pick one out, delete the picked one, and Done (the engine call). |
| `src/dental/rim/rimStepText.ts` | The mode's wording, pure: `rimProblemText`, `rimDoneReason`, `rimDeleteReason`, `rimToolText`, `rimLoopText`. |
| `src/dental/rim/DentalRimStep.tsx` | The mode's dock: tool switch, the two readouts, the action row, Cancel and Done. |
| `src/dental/rim/drawnRim.ts` | The drawn path becomes a `DentalRim` through the engine (`dental_rim_from_points`). |
| `src/dental/rim/rimDraftGeometry.ts` | Anchor lift, chords, `nearestAnchor`, `grabAnchor`, `closesLoop`, and the reach constants. |
| `src/dental/README.md` | The module map for `src/dental/`. |

## The geometry it builds on

| File | What it holds |
| --- | --- |
| `src/core/surfacePath/path.ts` | `SurfacePath`, `SurfaceAnchor`, and the edits: append, insert, move, remove, close, open, with their refusals. |
| `src/core/surfacePath/validate.ts` | `SurfacePathProblem` codes, `selfIntersects`, `pathProblems`. |
| `src/core/surfacePath/frame.ts` | Plane fit for the drawn loop, `toPlane`, `anchorsInPlane`, `facingNormal`, `pathLength`. |
| `src/core/surfacePath/resample.ts` | Resampling the anchors into a dense curve through an injected `ProjectToSurface`. |

## Where it meets the rest of the app

| File | What it holds |
| --- | --- |
| `src/components/viewport/UnitObject.tsx` | The pointer handling: what a press means per gesture, the anchor drag, and which overlays render. |
| `src/components/viewport/RimDraftLayer.tsx` | The drawing on the model: anchors, chord, the ring on the picked anchor. |
| `src/components/viewport/dentalLayers.tsx` | The dental overlays, `DentalRimOutline` and `DentalRegionLines` among them. |
| `src/components/SceneLegend.tsx` | The legend naming what each colour means. |
| `src/components/useDentalFlow.ts` | The dental flow: `next()`, the presets, and the handover into rim define mode. |
| `src/App.tsx` | Where commands are run and where `UiState` is assembled from session and scene. |
| `src/state/project.ts` | Scene commands, `rim/set` and `rim/clear` among them, and what is saved to a project file. |
| `src/styles.css` | The colour tokens, `--mark-area-permitted` and `--mark-area-edge` among them. |

## The engine side

| File | What it holds |
| --- | --- |
| `vendor/mixo-geocore/host/dental/dental.ts` | `DentalRim`, `boundaryKind`, `DentalDiagnostics`. |
| `vendor/mixo-geocore/host/dental/dentalEngine.ts` | The host side of the engine calls and the rim encoding. |
| `S:/ai/mixo-geocore/crates/geometry-core/src/dental/rim.rs` | Rust: `trace_rim` and `rim_from_points`, and how each boundary kind is produced. |
| `S:/ai/mixo-geocore/crates/geometry-core/src/surface/rim.rs` | Rust: the `Rim` type and `BoundaryKind`. |
| `S:/ai/mixo-geocore/crates/geometry-core/src/dental/legacy.rs` | Rust: where `boundary_kind` decides whether an area is authorised. |

## What checks it

| File | What it holds |
| --- | --- |
| `src/dental/editing/rimStage.test.ts` | The stage, its commands, its key ladder, and the pick. |
| `src/dental/rim/drawnRim.test.ts`, `rimDraftGeometry.test.ts` | The engine adapter and the draft geometry. |
| `src/core/surfacePath/*.test.ts` | The path edits, the plane fit, resampling, validation. |
| `scripts/walk.mjs` | The browser walk. Rim checks are `u5`–`u5j`; `canvasColour` is the pixel probe. |

## Sibling documents

- `docs/design/2026-11-05-back-out-one-level.md` — the Esc ladder and the "every step opens on Select" rule.
- `docs/handoff/geocore-rim-from-points.md` — the engine call as it was specified to the other repository.
