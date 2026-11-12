# `src/components/viewport` — the 3D view

34 files. This is the only folder that knows three.js. Everything above it works in plain data, and
the seam between the two is `viewportPort.ts`.

## The seam

| file | its one job |
|---|---|
| `viewportPort.ts` | **the three.js implementation of the shared editing seam** (`vendor/mixo-geocore/editing/ViewportPort`, rule D22). geocore owns the editing logic in plain data; each app implements this port over its own renderer. mixoMesh implements the same port over Babylon |
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
