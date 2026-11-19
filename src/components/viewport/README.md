# `src/components/viewport` — the 3D view

This is the only folder that knows a renderer. Everything above it works in plain data, and the
seam between the two is the D22 `ViewportPort`.

**Two renderers live here while the app moves from three.js to Babylon.** The owner's decision
(2026-11-16) is one renderer across the Mixo line, Babylon, so that a human maintains one 3D
vocabulary instead of two. Until the drawing layers are rebuilt, both ports exist and
`viewportPort.test.ts` holds them to **identical** answers — that test is the contract, and a case
added to it is added to both. three.js leaves when the last layer is Babylon, not before.

**The drag cut is taken: `dragSession.ts`.** It owns what ends a drag and the camera - take the
orbit on press, hear pointerup, pointercancel, blur and Escape, give the orbit back exactly once
however the drag ends - and nothing else. Four gestures used it immediately and it closed two live
defects on the way in: the tip drag's cleanup handed the orbit back on every pointer move, and the
rim anchor drag's did the same, unnoticed for longer, plus committing a path one move behind on a
quick flick. Neither was visible to the walk, because the thing being dragged still lands where it
was dropped. The rule it is built to is this repo's own: four callbacks in, one `end` out, and no
drag state - what is carried, where it is now and what to draw stay with the caller, because a
module holding those would need most of a viewport handed in to give two values back.

**What is deliberately still outside it: both brush strokes.** Every brush ending COMMITS its stroke
(`createStroke` has one `onEnd` and no discard), so Escape through the shared module would commit a
stroke the operator asked to abandon. They join when a stroke can be discarded, which is a change in
`@mixo-geocore`. Until then each brush keeps its own six lines of listener wiring, which is wiring
duplicated and not a rule duplicated - every brush ending already has one owner. Agreed with Fable,
2026-11-19.

**`UnitObject.tsx` is still past 700 lines**, and the part of that debt worth naming now is the two
drags' own halves: the ray each casts and what each does with its target. The next cut is NOT a hook
per drag - `useTipDrag` would take fourteen values in to hand back two, the hub this repo's rule
forbids - and the part that passed the test is already out, in `src/supports/tipMove.ts`.

**One gesture is three.js only today, named here rather than left to be discovered: moving a support
tip.** `onMoveTip` reaches both viewports and only `UnitObject.tsx` acts on it; press, drag and drop
a selected tip in the Babylon view and nothing happens. The rules are already shared — every
decision lives in `src/supports/tipMove.ts`, so the Babylon side is listeners, the camera lock, a
model-only hit and a preview, not a second copy of the behaviour. It was built against three first
because `src/ui/renderer.ts` makes three the default and `npm run walk` proves it: a Babylon-only
gesture would have been unreachable in the default app *and* invisible to the gate. The walk checks
`a4m`, `a4p` and `a4n` prove it in three; they run against `--renderer=babylon` too, so the day the
default flips they fail and this gap cannot go quiet.

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

**Both runs are green, 2026-11-17:**

```
ALL PASS (186 checks, 1774 s)
ALL PASS (186 checks, 1464 s) [renderer: babylon]
```

Every check runs against both views now, so the Babylon view is proved the way the shipping one is
proved. three.js can be removed when the owner says so, not because anything still needs it.

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
| the same check, flickering run to run | the camera was still gliding when the click landed — see the inertia note below |
| "zones painted over the model (2 strokes landed)" against three's 1 | the surface brush had its OWN sampling instead of `createStroke` + `zoneFill`: it stamped on a spacing rule of its own and never filled the gap between two samples, so a fast drag painted a dotted line. Same stroke object and same fill rule now, and one fixed stroke lays the same stamps in both: **+6, +11, +31** on three lines |

**Both see-through overlays are drawn.** `babylon/supportBodies.ts` ports `SupportBodies`, and it is
the one layer that deliberately differs in its mechanics: it REMAPS the vertices it needs rather
than sharing the support mesh's buffers, because Babylon has no safe way to hand one `VertexBuffer`
to two meshes. `splitTipMarks` in `tipMarkSplit.ts` decides the tips' three states for BOTH views.

**HOW THE VIEW MOVES IS `babylon/orbit.ts`'s, and every number in it is drei's OrbitControls read
out of `three-stdlib`'s source.** Turning, panning and zooming are the gestures an operator makes a
thousand times a day and the ones a different feel is noticed in first, so "largely the same layout"
has to include them:

```
turn   2 * PI * dx / clientHeight radians            a whole turn per screen height
pan    2 * distance * tan(fov / 2) / clientHeight    world units per pixel
zoom   one notch multiplies the distance by 0.95     whatever size the delta reports
```

Babylon expresses the first two as SENSIBILITIES — pixels per radian, pixels per world unit — so
they are reciprocals, and the panning one depends on the distance and is recomputed each frame. The
wheel is handled by hand and Babylon's own wheel input removed: it scales by the raw event delta,
which a mouse, a trackpad and a tilting wheel all report differently. `attachOrbit` also turns
ctrl-panning off, because OrbitControls has no ctrl gesture and ctrl+click here toggles a support's
selection. Every place that hands the orbit back goes through that one function.

**And NO INERTIA, which is a correctness matter rather than a feel one.** Babylon keeps nine tenths
of the last movement every FRAME, decaying per frame rather than per second, so on a slow renderer
the camera glides for seconds. `b3d` clicks one canvas point and reads where the tip landed: across
three three.js runs it landed within **0.04 mm**, across three Babylon ones it wandered **0.7 mm**,
drifting steadily one way until one run drifted onto an upward-facing face and the app — correctly —
warned about it. At zero inertia the tip lands identically run after run.

Measured against the camera's own numbers: a 200-pixel pan drag moved the target 22.225 mm where
three's formula wants 22.225, and three wheel notches took the radius to 0.8574 of itself where
three wants 0.857375.

**A warning about measuring any of this from pixels, because it cost an hour.** The two views' GRIDS
are not the same object — three's is drei's infinite shader grid with a distance fade, Babylon's is
a 1000 mm ground — so a yardstick built on "how much of the canvas is not background" moves
differently in the two under identical camera motion, and says they disagree when they do not. Ask
the camera, not the picture.

**Middle-drag dollies in both now**, by the same step as the wheel and once per move event, which is
three's own quirk and is kept because matching it is the point. Measured in a browser: ten upward
move events took the radius to 0.5987 of itself, against three's 0.95^10 = 0.5987.

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
| `deckRig.ts` | the deck's ONE WebGL renderer, shared by the two below. Browsers cap contexts near sixteen and a case is up to sixty cards, so its canvas never enters the document: callers copy out of it |
| `drawThumbnail.ts` | one card's still: upload, draw, dispose, read back as a PNG. The only caller is `items/useThumbnails.ts` |
| `liveCardView.ts` | the card the operator is pointing at, drawn on demand and copied into that card's own 2D canvas. The maths is `items/orbit.ts`, pure and tested |

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
