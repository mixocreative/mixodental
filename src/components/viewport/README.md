# `src/components/viewport` — the 3D view

This is the only folder that knows a renderer. Everything above it works in plain data, and the
seam between the two is the D22 `ViewportPort`.

**Two renderers live here while the app moves from three.js to Babylon.** The owner's decision
(2026-11-16) is one renderer across the Mixo line, Babylon, so that a human maintains one 3D
vocabulary instead of two. Until the drawing layers are rebuilt, both ports exist and
`viewportPort.test.ts` holds them to **identical** answers — that test is the contract, and a case
added to it is added to both. three.js leaves when the last layer is Babylon, not before.

## The seam

| file | its one job |
|---|---|
| `viewportPort.ts` | **the three.js implementation of the shared editing seam** (`vendor/mixo-geocore/editing/ViewportPort`, rule D22). geocore owns the editing logic in plain data; each app implements this port over its own renderer |
| `babylonViewportPort.ts` | **the Babylon implementation of the same seam**, the twin of the above. Needs `scene.useRightHandedSystem = true`: Babylon's default left-handed frame would need every value mirrored in Z (`src/core/handedness.ts`), and right-handed keeps the core, three.js and the Rust engine in one frame instead |
| `enginePick.ts` | the engine session's pick result decoded into a `SurfacePick`, renderer-free. **Both ports share it**, so the triangle-winding rule for the hit normal cannot be fixed in one renderer and left wrong in the other |
| `babylonTransform.ts` | a unit's `ModelTransform` placed on a Babylon mesh. It exists for one trap: the rotation is a three.js XYZ Euler and Babylon's `mesh.rotation` is yaw-pitch-roll, so copying the three numbers across is right for one axis and silently wrong for any compound rotation. Its test holds the result against three's own matrix |

`src/ui/renderer.ts` is the switch: `?renderer=babylon` in the address, three.js otherwise. It is
deliberately not remembered between visits — a half-migrated renderer that sticks produces bug
reports about the renderer nobody shipped. `src/components/BabylonObjectViewport.tsx` is the
Babylon view it reaches; App picks one component or the other at module load, and both take
`ObjectViewportProps`, so the switch is one line.

### What the Babylon view still owes

Drawn today: the models, the built supports and the floor grid, lit and framed as three.js frames
them, orbitable, clickable to select — verified against the three.js view on the same fixture,
landing at the same position, size and camera angle.

**A trap for anyone testing this by hand: supports take about 16 seconds to build on the knot
fixture, and the panel enables "Remove supports" within 2.** Wait on the data, not on the button —
the mesh is `0/0` for most of that time, and a shorter wait reads as "supports are not drawn" when
they simply are not built yet. That mistake cost a whole verification round here.

**Everything that asks what is under the pointer goes through `babylon/surfacePointer.ts`.** It
holds the frame rule in one place — `port.pick` works in the picked unit's OWN frame, drawing
happens in world space — and hands back both, so two layers cannot come to disagree about where the
same hit is.

**The Babylon view can be painted in.** `babylon/zoneBrush.ts` is the pointer path: a press reaches
the editing code and comes back as one stroke on the history, and the camera yields while a gesture
owns the pointer. Proved by one drag — the zones control read "Painted", the canvas went 350 → 597
distinct colours, and the background's share did not move, which is how an orbit would have shown.

**Not drawn yet**, and this list is the migration's to-do:

| Still three.js only | Where it lives today |
|---|---|
| ~~the edit preview, the selection highlight, the gizmo~~ | **DONE** — `babylon/editPreview.ts` (ring, cone, doomed marker), `babylon/selectionColours.ts`, `babylon/surfaceStamps.ts`, `babylon/transformGizmo.ts` |
| ~~the dental layers~~ | **DONE** — `babylon/surfaceStamps.ts` (area and paint), `babylon/dentalArea.ts` (face tint, trim lines), `babylon/dentalMarks.ts` (rim, risks), `babylon/tipMarkers.ts`. The tip markers' solid/ghost split still needs the tip selection plumbed |
| the rim being drawn | `RimDraftLayer.tsx` |
| the translate/rotate gizmo and its restyle | `UnitObject.tsx`, `gizmoStyle.ts` |
| unresolved bubbles, add flash, print-angle arc, thumbnail | `UnresolvedBubbles.tsx`, `AddFlash.tsx`, `PrintAngleArc.tsx`, `drawThumbnail.ts` |

**The support frame, and the wrong answer that sounded right.** Support bodies are drawn at
`unit.transform`, the same transform as the model: `UnitObject` puts ONE group at `unit.transform`
and draws the model and `SupportBodies` inside it, and `SupportBodies` applies no transform of its
own. The geometry is unit-local, so supports are rigidly attached and travel with the model.

`generationTransform(unit)` is **data, not a position** — the frame the supports were generated in,
handed to things like `UnresolvedBubbles` so they can reason about it. The Babylon view drew
supports there for several commits, with a confident comment explaining why, and the effect would
have been supports left behind whenever a model moved. Corrected once `SupportBodies` was read
rather than assumed.

**A defect that was real, and whose obvious cause was wrong.** An earlier draft showed about 1,100
dark speckles inside the model's silhouette. Winding was the convincing suspect — Babylon inverts
its culling convention when `useRightHandedSystem` is true, so an inverted mesh fitted the symptom.
It was not that. The speckles were `StandardMaterial` lit without tone mapping, blowing out and
clipping; PBR at `MeshStandardMaterial`'s own defaults plus ACES removed them, and the canvas now
measures **zero** pixels below luminance 90. Culling stays on and no `sideOrientation` is needed.
Kept here because the wrong answer was the plausible one, and the next renderer symptom will be too.
| `types.ts` | the view's own types |
| `sessionMesh.ts` | three.js geometries in the shared Rust session, by geometry: loaded on first use |
| `geometry.ts` | GPU geometry for a mesh, freed when the mesh changes or the view unmounts |
| `rustRaycast.ts` | picking through the Rust BVH rather than three.js' own raycaster |

## What is drawn

| file | what it draws |
|---|---|
| `UnitObject.tsx` | one unit: its model and its supports |
| `PlateOutline.tsx` | the printer's build plate, centred on the origin |
| `cameras.tsx` | the framed views — `bottom` looks straight up, and so on |
| `supportLayers.tsx` | Support Edit Mode's preview at the pointer: the ghost tip a click would add |
| `dentalLayers.tsx` | the dental step's own layers |
| `DebugLayerMeshes.tsx` | one mesh per engine debug layer, named and coloured by the engine |
| `faceMaskOverlay.ts`, `FaceTintLayer.tsx` | the approved-footprint overlay and its tint over the model |
| `RimDraftLayer.tsx` | the rim the operator is drawing, on the model |
| `UnresolvedBubbles.tsx` | one bubble per unresolved point, with a tail pointing at it |
| `AddFlash.tsx`, `flash.ts` | the ring where a support was just added, and how long it stays |
| `CirclePreview.tsx` | the brush circle while its slider is held |
| `PrintAngleArc.tsx` | the print-angle mark beside the model |
| `drawThumbnail.ts` | the saved project's thumbnail |

## Colour and material

| file | its one job |
|---|---|
| `sceneColours.ts` | **every colour of the 3D view, read from the CSS tokens** in `src/styles.css`. The scene takes its palette from the stylesheet, so a designer changes one place |
| `gizmoStyle.ts` | the rotate gizmo redrawn in the app's own language |
| `style.ts` | the no-support layer's opacity in zones mode and in Support Edit Mode |
| `overlayMesh.ts` | a finer copy of a mesh for display-only overlays |
| `warmMaterials.ts` | the materials of overlays that come and go with the pointer, created once |

## Why it is shaped this way

- **One folder owns the renderer.** The port is the whole reason: geocore can change how editing
  decides things without knowing three.js exists, and mixoMesh gets the same decisions over Babylon.
- **Colours come from the stylesheet, never from literals.** `sceneColours.ts` reads the CSS tokens,
  so the 3D view and the panels cannot drift apart — and a deleted custom property is a silent total
  failure, which is why `uiStylingDoc.test.ts` guards the token list.
- **Overlays are separate meshes, not material tricks** on the model, so the model's own appearance
  is never a side effect of an overlay being on.
- **Materials for things that flicker in and out are created once** (`warmMaterials.ts`). Creating a
  material per pointer move is a frame-rate bug that looks like a GPU problem.

## Rules for editing here

1. Nothing outside this folder imports three.js. If you need a new fact about the scene above this
   layer, add it to the port, not to a component's props.
2. A new colour is a token in `src/styles.css`, documented in `docs/ui-styling.md`, read through
   `sceneColours.ts`. Never a hex literal here.
3. Every GPU resource this folder creates is freed by the thing that created it. The leak nobody
   notices is a geometry replaced without disposing the old one.
4. Every element the operator can see or hit gets a stable `data-ui` name, so a designer can find it.
