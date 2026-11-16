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

**Every one of the 40 `ObjectViewportProps` is wired.** That count is the honest measure of this
migration, not a list of layers: a layer can be "drawn" and still be unreachable because the prop
that feeds it was never read. Keep it honest the same way — count the props.

**The walk drives either renderer.** `npm run walk -- --renderer=babylon` runs the same 186 checks
against the Babylon view. The flag only changes the base URL, because the checks are the app's
behaviour and not the pixels, and the verdict line names the renderer whenever it is not the
default — a Babylon receipt can never be read as the three.js gate. `npm run gate` and CLAUDE.md's
local gate still mean the three.js run until three.js is gone.

**What the first Babylon walk found, and not one of them was where it hurt.** Read this table
before adding a layer to this view; every row is a fault that only a second renderer could expose,
and every one was measured rather than reasoned out:

| What the walk said | What was wrong |
|---|---|
| five rim checks failing with "points 1" | the edit clicks ran in rim define mode, so every click that placed an anchor **also added a support**. Fifteen supports grew the unit's bounds fourfold, the camera framed those instead of the model, and the walk's canvas-fraction clicks then missed it. The rule is shared now: `clickOwner.ts` |
| the same, and the model three times too small | the camera effect was declared BEFORE the units effect, so the fit that arrives with a fresh model found no node and did nothing. Second time in this file; the gizmo had it too |
| "the drawn rim is visible … 0 px of the colour" | a one-pixel line at 0.9 alpha with a fainter copy over it leaves almost no pixel at full strength here. Both loops are opaque now, and the rim measures 105 px of the exact token against three's 122 |
| nothing — no check caught it | this view read only the dental area PREVIEW, so once Step 1 handed its policy over every area layer vanished. It reads the accepted policy first now |
| "Add … says so": three said "Support added.", Babylon said "This spot faces up" | a heavy import gets a simplified DISPLAY copy, and `UnitObject` draws and picks that one. This view drew and picked the full mesh, so the same pixel met a different triangle |

**Both see-through overlays are drawn.** `babylon/supportBodies.ts` ports `SupportBodies`, and it is
the one layer that deliberately differs in its mechanics: it REMAPS the vertices it needs rather
than sharing the support mesh's buffers, because Babylon has no safe way to hand one `VertexBuffer`
to two meshes. `splitTipMarks` in `tipMarkSplit.ts` decides the tips' three states for BOTH views.

**The one difference still measured, and it is not a defect yet:** the two views land a click
0.19 mm apart on the same face (`b3d`, tip at -23.352/2.246/-0.952 against -23.299/2.122/-1.081).
An `ArcRotateCamera` is placed through alpha, beta and radius, so `place()` cannot land the camera
on three's exact position. It is within a face everywhere the walk looks; if a check ever starts
flickering near a boundary, this is why.

**A trap for anyone testing this by hand: supports take about 16 seconds to build on the knot
fixture, and the panel enables "Remove supports" within 2.** Wait on the data, not on the button —
the mesh is `0/0` for most of that time, and a shorter wait reads as "supports are not drawn" when
they simply are not built yet. That mistake cost a whole verification round here.

**Everything that asks what is under the pointer goes through `babylon/surfacePointer.ts`.** It
holds the frame rule in one place — `port.pick` works in the picked unit's OWN frame, drawing
happens in world space — and hands back both, so two layers cannot come to disagree about where the
same hit is. It answers from the geometry the view actually DREW (`drawnSupports`), not from
`supportMeshes`: in tips view the bodies come off, and a pointer answering from the full build would
let a click land on a strut nobody can see.

**The Babylon view can be painted in.** `babylon/paintStroke.ts` is the surface-brush pointer path:
a press reaches the editing code and comes back as one stroke on the history, and the camera yields
while a gesture owns the pointer. Proved by one drag — the zones control read "Painted", the canvas
went 350 → 597 distinct colours, and the background's share did not move, which is how an orbit
would have shown.

**Drag over is SHARED, not ported.** `useBrushOverlay.ts` holds the circle, the listeners, the hover
probe and the resting point with no renderer in it; `useScreenBrush.ts` is the three.js wrapper and
`babylon/brushBodies.ts` the Babylon one. Each supplies exactly three things — the canvas, a view
over the support bodies, and "is the object under this point" — so the two views cannot disagree
about what a sweep selects. The split was necessary rather than tidy: the hook called `useThree`,
which throws outside an r3f `<Canvas>`, so injection alone could not have worked.

**The clip chain is the one thing in that port you cannot see.** Babylon multiplies the opposite way
round from three.js, so the brush's `projection x view x world` is written
`world.multiply(view).multiply(projection)`. The wrong order still yields a plausible matrix and a
confident hit — wrong only once a unit is off the origin. `babylon/brushBodies.test.ts` holds it
against three.js' own matrices.

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
