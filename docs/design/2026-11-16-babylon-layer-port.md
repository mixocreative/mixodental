# Porting the drawing layers to Babylon — the plan, 2026-11-16

The owner's decision, asked three times and reaffirmed: **one renderer across the Mixo line,
Babylon, so a human maintains one 3D vocabulary instead of two.** mixoMesh is already Babylon 9.6.2.
This is the plan for the part that remains after the seam, the switch and the scene.

Not a proposal. The decision is made; this is the order of work and the traps in it.

## What is already done, and proved

| | Proof |
|---|---|
| The D22 `ViewportPort` answered by both renderers | One test, `viewportPort.test.ts`, runs the SAME assertions against both. 12 pass. The Babylon port was forged (sign flipped) and watched to fail |
| three XYZ Euler → Babylon quaternion | Held against three's own matrix, 6 cases including a compound rotation |
| The scene: models, lit and framed as three frames them | Side-by-side screenshot: same position, same size, same camera angle |
| The floor grid | Canvas background measures `227,234,234` = `--scene-bg` exactly |
| The built supports | Canvas goes 365 → 995 distinct colours with supports built |

## The contract every layer module should meet

One job per module, and the shape that makes them independent (so they can be written in parallel
and reviewed one at a time):

```ts
// src/components/viewport/babylon/<layer>.ts
export function drawX(scene: Scene, input: XInput): () => void;   // returns its own disposer
```

- **Takes plain data and a scene. Returns a disposer.** No React, no props object, no knowledge of
  the other layers. The component calls it in an effect and returns the disposer.
- **Reads colours from `ViewportColours`**, never a literal — `src/ui/noColourLiterals.test.ts`
  enforces this and will catch it.
- **Disposes its own meshes and materials.** A Babylon mesh holds GPU buffers no garbage collector
  frees; the model path already does this and the leak is invisible until it is not.
- **Geometry comes from geocore where geocore has it.** Several layers are already renderer-free
  (below) — re-deriving that geometry in app code would be the mistake this whole seam exists to
  prevent.

## The layers, in the order to take them

**CORRECTED 2026-11-16, by trying it.** This list first put zone stamps at number 1. That order is
wrong, and the way it was found is worth keeping: the zone layer was written, unit-tested and wired,
and then **could not be exercised at all** — painting a zone in the Babylon view is impossible,
because the view has no pointer-to-editing path. The drag orbited the camera and the app recorded
`None`. So:

> **THE INPUT PATH COMES FIRST. Every visual layer below it is unreachable until it exists,**
> which means each one can only be unit-tested, never seen, and "it draws" stays an assumption.
> Two things it owns: routing pointer events through `BabylonViewportPort` into the editing code,
> and making the ArcRotateCamera YIELD during a gesture — `camera.attachControl` currently orbits
> through brush strokes, which in the three.js view it does not.

The rest of the order is by what an operator loses without it, not by what is easy.

| # | Layer | three source | Geometry source | Notes |
|---|---|---|---|---|
| 0 | **The pointer path + camera yielding** (do this first) | `ObjectViewport.tsx` `onPointerMissed`, `useScreenBrush.ts`, geocore `editing/gesture` | mixoMesh `live/supportInteraction.ts` (361 lines) does exactly this over `BabylonViewportPort` — read it | **Nothing below can be verified until this exists** |
| 1 | Zone stamps (no-support zones) — WRITTEN, unit-tested, unreachable until layer 0 | `supportLayers.tsx` | **renderer-free already** — see the exact path below | The evaluation is the real work; the drawing is a mesh like any other |
| 2 | Ghost tip, remove ring, brush circle | `supportLayers.tsx`, `CirclePreview.tsx` | `warmMaterials.ts` cone geometry is three-specific and tiny to rebuild | This is what makes the view an editor rather than a viewer |
| 3 | Selection highlight / stale / tips-only | `supportLayers.tsx` | recolouring vertex ranges in place | mixoMesh's `supports/layers/supportMeshLayer.ts` does this job in Babylon already — read it first |
| 4 | Dental paint, face tint, region lines | `dentalLayers.tsx` | **renderer-free already**: `faceMaskOverlay.ts` → Rust `face_mask_overlay`, `face_mask_contour_segments` | No Babylon equivalent exists in mixoMesh; this is dental-only work |
| 5 | The rim being drawn | `RimDraftLayer.tsx` | `src/core/surfacePath/` is renderer-free | |
| 6 | The gizmo | `UnitObject.tsx`, `gizmoStyle.ts` | Babylon `GizmoManager` | `gizmoStyle.ts`'s token and constant tables survive; only the three drawing goes |
| 7 | Bubbles, add flash, print-angle arc, thumbnail | their own files | mixed | `UnresolvedBubbles` is HTML in a 3D group — Babylon needs a different approach (screen-space projection through `worldToScreen`, which the port already answers) |

### Layer 0's design, worked out and not yet built

Everything below was established by reading; none of it needs discovering again.

**The zone brush, end to end** — the smallest input path that proves the whole thing, because it is
the one that makes layer 1 visible:

1. `props.gesture.kind === 'zones'` carries `brush: { radius, kind }`. That is the only signal
   needed to know a drag paints rather than orbits.
2. On pointer down and move, `BabylonViewportPort.screenToRay([x, y])` then `pick(handle, ray)`
   gives a world-space point and surface normal.
3. `nextStamp(last, point, radius)` (geocore `editing/zones`) says whether the brush has moved far
   enough — half a radius — to lay a new dab. Do not invent this spacing.
4. Convert the point and normal to **unit-local** space (the inverse of the unit's transform) and
   build a `ZoneStamp { center, radius, normal, kind }`. The normal is load-bearing: it is what
   keeps the far side of a thin wall out of the zone.
5. On pointer up, call `props.onZoneStroke(unitId, stamps)` — one call per drag, so one drag is one
   step on the history.

**THREE obstacles, and the third is the one that will cost a day if it is met rather than read.**

- **`pick` works in the UNIT'S LOCAL FRAME, not world space, whatever `ViewportPort`'s comment
  says.** Its wording — "rays and hits are world space" — is true of `screenToRay` and false of
  `pick`: the session mesh is loaded from the unit's own positions, so the ray must be converted
  into that unit's frame first and the hit comes back in it. `useScreenBrush.ts:77` says it out
  loud, "support-local → world → model-local (a rigid placement: distances carry over)", and
  `rustRaycast.ts` does the same inverse-matrix step. Hand it a world ray and it returns a confident
  hit on the wrong triangle for every unit that is not at the origin — which reads as a picking bug
  and is a frame bug. Noted at the top of `babylonViewportPort.ts` as well.
- **`useScreenBrush.ts` is the three.js view's real consumer of the port**, not the editing package:
  `ViewportPort.ts` is the only file in geocore's `editing/` that mentions the interface at all, so
  the seam is a contract the apps honour rather than one the shared code calls. The Babylon layer 0
  is therefore the Babylon counterpart of `useScreenBrush`, and that file is the thing to read.

**The two obstacles already known:**

- **Picking needs an engine session handle, not `scene.pick`.** The port's contract is explicit:
  the app answers through the engine session "never through its renderer's own picking, so both
  apps pick identically". `sessionMesh.ts` does this for three.js and is tied to a three geometry's
  `dispose` event, so the Babylon view needs its own handle lifecycle — load the unit's mesh into
  the session, keep the handle, release it when the mesh goes. Using `scene.pick` instead would be
  quicker and would make the two renderers disagree about which triangle was hit, which is the one
  thing this seam exists to prevent.
- **The camera must yield.** `camera.attachControl(canvas, true)` currently keeps every drag. It has
  to stand down while a gesture owns the pointer, and take over again when it does not.

mixoMesh's `src/supports/live/supportInteraction.ts` (361 lines) is the same job over its own port
and should be read before writing this — bearing in mind it is unchecked JavaScript.

### Layer 2 is NOT finished, and the Babylon marker is an approximation

Read `EditPreview` in `supportLayers.tsx` before touching this again. It draws **three** things, and
the Babylon `ghostTip.ts` matches none of them exactly — it draws a plausible marker, not that one.

| Element | When | Geometry | Material |
|---|---|---|---|
| **the ring** | always | torus at the hover point, radius = the brush radius or `settings.eraseRadius`, tube `max(0.03, radius * 0.025)`, 6 × 48. Its +Z is turned to the surface normal | `ringMaterial(colour)` — **basic, unlit**, `depthTest: false`, opacity 0.85, renderOrder 20 |
| **the add cone** | only when NOT removing and no brush | at `point + normal * (neckLength / 2)`, radius `settings.pillarDiameter / 2`, height `settings.neckLength`, 16 sides. Its +Y is turned to the **negated** normal, so it points INTO the surface | basic, `--mark-add`, opacity 0.55, `depthWrite: false`, renderOrder 19 |
| **the doomed marker** | when a click would remove a contact | sphere at that contact, radius `max(0.25, pillarDiameter * 0.45)`, 12 × 8 | basic, `--mark-remove`, `depthTest: false`, opacity 0.9, renderOrder 21 |

**What the current Babylon version gets wrong**, all of it honest debt rather than a mystery:

- it draws **no ring at all**, and the ring is the element that is always on screen;
- its cone is a fixed 1 mm × 2 mm instead of `pillarDiameter` × `neckLength` from the unit's
  resolved settings, which is why it needed enlarging to 20 mm before it could even be measured;
- it uses `--mark-support-tip`, where `EditPreview`'s cone uses **`--mark-add`** — a different
  token;
- it uses a lit PBR material where all three of these are **unlit basic** materials with their own
  depth and opacity rules, which is what keeps them readable on top of the model;
- it has no doomed marker, so nothing shows WHICH support a remove click would take.

`contactToRemove(contacts, point, radius)` is the renderer-free rule behind the doomed marker, and
`resolveSettings(unit.settings)` gives the sizes. Neither needs rewriting.

### Layer 3, the selection highlight: recolour in place, do not rebuild

`useSelectionColors` in `supportLayers.tsx`. The support bodies are ONE mesh, and selecting a
support repaints its vertices rather than drawing anything new:

1. `contactVertexRuns(supports)` maps each contact id to its vertex ranges in that single mesh.
2. A `color` vertex attribute is written in place — `--support-picked` over the selected runs, the
   base colour over the rest.
3. `selectionDelta(previous, now)` repaints ONLY what changed. A full repaint happens on a fresh
   geometry, a base-colour change or a token revision, and otherwise never. On a mesh with hundreds
   of supports that difference is the whole budget.

**The trap: `linearBytes`.** Vertex colours go in LINEAR space, not sRGB. Write the token's bytes
straight in and every selected support comes out the wrong shade — close enough to look like a
palette choice rather than a bug. Babylon's vertex colours need the same treatment, so reuse that
helper rather than writing bytes by hand.

### The gizmo: the conversion is done, the PARENTING is the open question

`eulerFromQuaternion` / `transformFromMesh` in `babylonTransform.ts` are written and tested, so
reading a dragged mesh back into a `ModelTransform` is solved — including the part that would have
been silently wrong, since Babylon's `toEulerAngles` returns yaw-pitch-roll, a different
decomposition of the same rotation. Feed that into a `ModelTransform` and the numbers look
reasonable, round-trip into a different rotation, and the model jumps when anything re-reads it.

**What is NOT solved, and must not be guessed at:** the three.js gizmo attaches to the unit's
GROUP (`UnitObject` reports it through `onGroup`, and `ObjectViewport` passes it to
`TransformControls`), not to a mesh. The Babylon view currently has no equivalent — the model mesh
and the support mesh are siblings with no parent — so building the gizmo means first giving each
unit a `TransformNode` and deciding what hangs off it.

That decision is **simpler than an earlier version of this file claimed**, and the correction is
worth keeping. `UnitObject` puts ONE group at `unit.transform` and draws the model AND
`SupportBodies` inside it, and `SupportBodies` applies no transform of its own — so both hang off
the same node, and a gizmo drag should move both. That is right: the support geometry is unit-local
and rigidly attached, so supports travel with the model.

`generationTransform(unit)` is **data, not a position** — the frame the supports were generated in,
handed to things like `UnresolvedBubbles` so they can reason about it. This file, the folder README
and `d6d3f9f`'s commit message all previously said supports were *drawn* there, with a confident
argument for it. They were wrong, and the effect in the Babylon view was supports left behind
whenever a model moved.

Also already in hand: `gizmoShown(gesture, gizmoMode, rotationGizmo)` is exported from
`ObjectViewport.tsx` and is renderer-free, so the visibility rule needs no porting; and the camera
must stand down during a gizmo drag exactly as it does during a brush stroke.

### The drag-over brush: the last three props, and why it is its own job

`onPaint`, `onShift` and `onNoBodies` are one piece, not three, and it is the only remaining part
of the viewport that cannot be written by adapting a decision function in an afternoon. What is
established:

**The decisions are all renderer-free and ready:** `bodySegments` / `tipSegments` turn supports into
screen-space segments, `brushHits` answers what a swept circle covered, `createBrushScheduler`
paces the work across frames, and `createDragOver` owns the gesture (a press on empty space belongs
to the CAMERA and ends any open stroke; the mode is LATCHED at the press, so Shift changing
mid-stroke does not change what that stroke does).

**What is genuinely renderer-specific is small:** a `view` with `frame()` returning the hit test,
built from the port's `brushView` — the clip matrix of the SUPPORT GROUP (projection x view x the
unit's world matrix) and the eye in that group's space, because `brushHits` works in support-local
coordinates. `surfacePointer`'s `brushView` is NOT that and says so at the line.

**A finding that shrinks the job: occluders are dormant.** `screenBrushView` gathers meshes with
`userData.occluder`, and NOTHING in `src/` sets it — so `visibleOccluders()` always returns an
empty list. Passing `[]` is therefore faithful to what the three.js view actually does today, not a
simplification of it. Say so in a comment rather than quietly matching it.

**The obstacle, and the two honest routes.** `useScreenBrush` is a React hook bound to r3f through
`useThree` (gl, camera, scene), so it cannot simply be called from the Babylon view:

1. **Refactor it to take its view and its canvas injected**, so BOTH views use one hook. This is the
   only route that makes the brush identical *by construction*, which is the rule everything else
   here follows. It is a change to a 341-line shared file and must be walked.
2. **Reimplement the orchestration on the Babylon side**, reusing the scheduler, `createDragOver`
   and `brushHits`. Lower risk to the three.js path, but the two agree only while someone keeps
   them agreeing — the exact failure mode the rule exists to prevent.

**MEASURED, AND IT DOWNGRADES THE RISK I FIRST CLAIMED.** I described route 1 as "a 341-line
shared-file refactor", which overstates it. The r3f coupling in that hook is narrow and countable:

- **four** `useThree` calls (`gl`, `camera`, `scene`);
- `gl` is used ONLY as `gl.domElement`, i.e. as the canvas, in three places;
- `camera`, `scene` and `options.group` appear ONLY inside the single `screenBrushView(...)` call.

Everything else in the hook — the scheduler, the drag-over, the hover refresh, the resting point,
the Shift tracking, the no-bodies report — is already renderer-free and would not be touched.

**CORRECTED AGAIN, and the pattern matters more than the number.** There is a THIRD coupling I
missed on the first read: `objectAt` uses `createObjectTest()`, which is three.js to the bone — a
`THREE.Raycaster`, `traverseVisible`, and meshes marked `userData.strokeStart`. It answers "is this
canvas point on the object", counting the model, a support under the pointer, and a support the
circle reaches from nearby (a support BEHIND the model does not count).

I have now revised this estimate upward twice, each time after reading further into the same file.
That is the signal to stop estimating from partial reads — not a reason to hurry the change through.

**The complete, verified injection list is three points:**

| Inject | Replaces | Babylon's answer |
|---|---|---|
| `canvas` | `gl.domElement`, used in three places | its own canvas |
| `makeView(bodies)` | the single `screenBrushView(...)` call | a view over the support-group clip |
| `objectAt(at, radius)` | `createObjectTest()` + `group` + `camera` | `pointer.hitAll(x, y)` — a model or support hit counts — sampling the same `SUPPORT_REACH` shares at the same `AROUND_ANGLES`, where only a `'support'` answer counts away from the centre |

With those three passed in, the rest of the hook — scheduler, drag-over, hover probe, resting point,
Shift latching, the no-bodies report, the brush circle element — is renderer-free and moves whole
into a shared hook. `useScreenBrush` stays as the thin three.js wrapper that calls `useThree` and
supplies the three, which is also what keeps its path unchanged by construction.

So route 1 is really: **inject three things.** Replace `gl.domElement` with a `canvas` option, replace
the `screenBrushView(...)` call with a `makeView(bodies)` option, and leave `useScreenBrush`'s
three.js caller supplying both exactly as it does now. The Babylon view then supplies its own
canvas and a view built on the support-group clip. That is a small, reviewable change whose
three.js path is unchanged by construction — not the rewrite I implied.

Route 1 is correct. It is recorded here rather than attempted at the end of a long session because
a hasty refactor of the shared hook is how the three.js brush would acquire a subtle fault, and
that brush is what the walk's `g`-series checks exercise.

#### DONE, 2026-11-17 — and the estimate was wrong in the one way that mattered

Injection alone could **not** have worked, and nothing above spotted it: `useScreenBrush` calls
`useThree`, which THROWS outside an r3f `<Canvas>`. A Babylon component calling it would not have
been subtly wrong, it would not have rendered. So the hook had to come apart, and it did:
`useBrushOverlay.ts` holds everything renderer-free, `useScreenBrush.ts` is the three.js wrapper
(unchanged in behaviour by construction — it supplies the same three things it used to compute
inline), `babylon/brushBodies.ts` is the Babylon one.

The third injection point, `objectAt`, was found by reading rather than by estimating, and so was
the detail that makes it faithful: the three.js test raycasts from the brushed unit's OWN group, so
another unit in front does not block a stroke. `hitAll` answers for the whole scene, so the Babylon
version filters to that unit and takes its nearest hit.

**The one invisible risk, now tested.** Babylon multiplies matrices the opposite way round from
three.js, so the brush clip chain is `world.multiply(view).multiply(projection)`. Written the
three.js way it still produces a plausible matrix and a confident hit, wrong only once a unit leaves
the origin — exactly the class of bug that shipped the support frame. `brushBodies.test.ts` holds
both the clip and the eye against three.js' own matrices, and asserts the habitual order is NOT
what the code does.

**A performance fault found while wiring it, and fixed at the root.** The Babylon units effect
depended on `props.selection`, rebuilding every mesh in the scene when it changed. Drag over changes
its preview every frame, so a stroke would have rebuilt the whole scene at frame rate. The selection
handles are now kept in a ref and recoloured in place (`paintHighlights`), and `props.selection` is
off that effect's dependency list — which is what `useSelectionColors` already does for three.

**`unitOverlay` carried r3f elements**, so the INTERFACE was renderer-bound, not the implementation.
It is now `unitTint: { unitId, mask, colour }` — data — and each view draws it with its own geometry
(`FaceTintLayer` in three, `babylon/faceTint.ts` in Babylon). `dentureAddOnTint` returns the mask and
the colour instead of a node; it was the only caller.

### Wiring the remaining 25 props, and the rule that makes the two views identical

**THE OWNER'S REQUIREMENT, 2026-11-16: the user flow, the UX, the UI and the tool modes must be
IDENTICAL, not merely equivalent.** That settles how this is written, not just how much:

> **Import the decision. Adapt only the input.** Every rule about what an interaction MEANS is
> already renderer-free — `pickAction` (`editing/pick`), `missAction`, `rimTapAt`, `gizmoShown`,
> `frameView` / `spotView` / `belowPlate` (`editing/view`), `brushHits`, `nextStamp`. The three.js
> handlers are ADAPTERS over those, not logic. Call the same functions with the same inputs and the
> two views agree by construction; reimplement any of them "to match" and they agree only until
> someone changes one.

The Babylon view uses **15 of the 40** `ObjectViewportProps`. That count, not the layer count, is
the honest measure of this migration: most of what remains is interaction, not pixels.

| Decision | Already renderer-free in | What Babylon must supply |
|---|---|---|
| what a click means (add / erase / select / pass) | `pickAction`, via `UnitObject`'s thin `pickFor` | hit kind (`model` or `support`), button, ctrl, shift, **travel**, mode, tool, active, contact |
| what a click on the rim means | `rimTapAt` | the tapped point in UNIT-LOCAL space, and travel |
| a click that hit nothing | `missAction` | button, and whether a gizmo is dragging |
| camera framing (fit / bottom / side / focus) | `frameView`, `spotView`, `boundsSphere`, `belowPlate` | bounds of the selected units, canvas size, right-hand inset |
| drag-over support selection | `brushHits` + the port's `brushView` | nothing new — the port already answers `brushView` |

**How a support hit becomes a contact, now read rather than guessed.** `contactAtTriangle(supports,
faceIndex)` is renderer-free, and the engine pick already returns a triangle index — so it is
`handleFor(supports)` then `contactAtTriangle(supports, hit.triangle)`, with the support mesh loaded
into the session like the model. **But a subtlety that is easy to miss and changes behaviour:**
braces, the raft and labels belong to NO contact, and in three the pick then *continues behind
them* to whatever is further back. r3f gets that from event propagation; Babylon's nearest-hit pick
does not, so a no-contact support hit has to fall through to the next candidate rather than being
swallowed. Swallow it and clicking a brace does nothing where it used to select the model.

**The rim drag, and the house rule it encodes.** `rimTargetAt` and `insertAnchor` are renderer-free:
the target UNDER THE PRESS decides, not an armed tool. A handle is picked up; bare line takes a new
handle and picks THAT up, so inserting and dragging are one gesture; anything else picks up nothing
and is left for the camera, because **where the drag starts decides**. An inserted handle goes on
the undo stack before the drag moves it. And the camera must be turned off BY HAND for the
duration — three's comment is explicit that `stopPropagation` is not enough, because OrbitControls
listens on the canvas, not the object tree. The Babylon zone brush already does exactly this.

**Three things Babylon must grow:**

1. **Support picking, and a hit to a CONTACT ID.** The support mesh is `isPickable: false` today and
   nothing maps a hit to a contact. `contactVertexRuns` (already used by the selection highlight)
   maps contact ids to vertex ranges, so triangle-to-contact is a lookup away.
2. **`travel` per press.** r3f hands `event.delta`; here it must be tracked from pointerdown. It is
   load-bearing, not cosmetic — it is what stops a view turn that began on the model from leaving a
   rim point behind (walk `u5d`).
3. **A DOM overlay anchored to a 3D point.** `UnresolvedBubbles` uses drei's `<Html>`; the port's
   `worldToScreen` is what drei does internally. It is the only mechanism here that is genuinely
   different, so do it EARLY rather than last.

**One prop could not be ported as it stood:** `unitOverlay.node` was typed `ReactNode` and mounted
inside a 3D group, carrying r3f elements — so the INTERFACE was renderer-bound, not just the
implementation. Settled 2026-11-17 by passing data: `unitTint: { unitId, mask, colour }`, drawn by
each view's own face-tint layer. It was the only one of the 40 with that problem.

### The dental layers: SEVEN components — six built, one to wire

**Built:** the area and paint (`babylon/surfaceStamps.ts`, which generalised the zone layer and
serves all three stamp callers), the face tint and the region trim lines (`babylon/dentalArea.ts`),
the rim outline and the overhang risk patches (`babylon/dentalMarks.ts`). The tip markers
(`babylon/tipMarkers.ts`) are written and typecheck; only the wiring is left, and the
solid/ghost split needs the selection plumbed.

**None of the dental set is verified by eye.** They need a TWO-CONTOUR policy, which the knot
fixture does not produce — load `docs/dental-reference/reference-aligner.stl` or a case under
`dentalwork/fixtures/` and run the dental flow to Step 2.

### The original reading, kept for the detail

### The dental layers: SEVEN components, not one

`dentalLayers.tsx` is the biggest remaining piece and it is not a single layer. Take them
separately; two of them are nearly free because the Babylon port already has the path.

| Component | What it needs |
|---|---|
| `DentalStampLayer`, `DentalPaintLayer` | Both wrap `SurfaceStampLayer` — the SAME stamp-to-vertices path `babylon/zoneLayer.ts` already ports. Do these first; they should be a few lines each once the zone layer is generalised to take a colour and a stamp list |
| `DentalFaceLayer` | The real work. See below |
| `DentalRegionLines` | Rust `faceMaskContourSegments(mesh, pairs)` for `region.outerEdges` and `region.openingEdges`, drawn as two line sets: outer in `--mark-ring`, opening in `--mark-area-edge`, both `depthTest: false`, `depthWrite: false`. Its comment says why it matters: **exact mesh edges, not a planar proxy for a non-planar dental trim** |
| `DentalRiskLayer` | A disc on each overhang low point outside the permitted area. Display only — supports and export never read it |
| `DentalRimOutline` | The rim as drawn |
| `DentalTipMarkers` / `TipInstances` | Step 2's tip preview, INSTANCED cones. Babylon's equivalent is thin instances, not one mesh each |

**`DentalFaceLayer`, and the trick in it worth copying rather than reinventing.** The geometry comes
from Rust: `faceMaskOverlay(mesh, dentalContactMask(policy, triangleCount))` returns positions and
normals with a separate vertex per approved triangle corner. The layer is then masked **by ALPHA in
the vertex colours alone** — one uniform colour (`--mark-area-permitted`) with each vertex's alpha
set to 255 or 0 from a `Uint8Array` mask. No geometry is rebuilt when the painted area changes.

The mask is updated **incrementally**: if the new stamp list extends the applied one (same kinds,
`sameStamp` on each), only the new stamps are laid; anything else resets the mask to 1 and replays.
`stampVertices` is reused with `allow` mapped to `paint` and the other kind to `erase`.

Material: basic/unlit, vertex colours ON, **double-sided**, transparent at the given opacity,
`depthWrite: false`, `polygonOffset -2/-2` (Babylon: `zOffset = -2`), renderOrder 16.

**A Babylon-specific note, and it is the mirror of a trap already met.** This layer NEEDS
`hasVertexAlpha = true`, because its whole masking mechanism is vertex alpha. The support mesh in
`BabylonObjectViewport` sets `hasVertexAlpha = false` for the opposite reason — its vertex colours
are opaque and letting Babylon infer alpha blending there would be both slower and wrong. Same flag,
opposite answers, for reasons that are not interchangeable.

### Layer 1's data path, so nobody re-derives it

Every step but the last is renderer-free and already written. The Babylon work is the final draw.

1. `zoneOverlay(mesh, maxEdge, maxTriangles, cellSize)` — `src/components/viewport/overlayMesh.ts`.
   Returns a **refined** copy of the mesh (Rust `refine_for_overlay`: long edges split at their
   midpoints, no cracks, winding kept) plus its `VertexGrid`. Cached per mesh object. The refinement
   is why a 2 mm brush dab shows on a face made of a few large triangles — **mixoMesh does not
   refine and says so (its P5), so its overlay is not the thing to copy here.**
2. `stampVertices(stamp, positions, normals, out, grid)` —
   `vendor/mixo-geocore/host/core/supports/zones.ts`. Lays each `ZoneStamp` into a `Uint8Array`,
   one byte per vertex; `kind: 'paint'` writes 1 and erase writes 0, so the **last covering stamp
   wins** simply by applying them in order.
3. Triangles with at least one zoned vertex become the draw list. mixoMesh's
   `zonedTriangles(indices, zoned)` in `src/supports/layers/zoneOverlay.ts` is exactly this and is
   worth reading, as is its `vertexNormals`.
4. Draw that index subset as its own Babylon mesh, see-through, in `--mark-zone`. A small painted
   spot stays a small draw.

**The numbers, all from `supportLayers.tsx` — copy them, do not re-choose them:**

| Constant | Value | Why it is that |
|---|---|---|
| `OVERLAY_MAX_EDGE` | `1` mm | So a 2 mm brush dab shows on coarse faces |
| `OVERLAY_MAX_TRIANGLES` | `1_500_000` | The refinement's budget |
| `ZONE_GRID_CELL` | `2` mm | About one brush dab |
| refinement cut-off | `maxEdge = Infinity` once the mesh has `FULL_TIER_MAX` triangles or more | A big enough mesh is already fine enough; refining it is cost for nothing |
| `ZONE_OPACITY` | `{ full: 0.7, faint: 0.3 }` — `src/components/viewport/style.ts` | Faint in Support Edit Mode, full in zones mode |

The three.js material to match is `meshStandardMaterial` with `emissive` the same colour at
`emissiveIntensity` 0.35, `metalness` 0, `roughness` 0.8, `polygonOffset` −2/−2, and `depthWrite`
off while see-through. The polygon offset is what stops the overlay z-fighting the model it sits on;
Babylon's equivalent is `zOffset` on the material, and leaving it out is the obvious way to get a
shimmering overlay that looks like a driver bug.

**What mixoMesh already has in Babylon** and should be read before writing 2 and 3:
`src/supports/layers/pointerLayers.ts`, `supportMeshLayer.ts`, `zoneOverlay.ts`,
`BabylonViewportPort.ts`, `live/supportInteraction.ts`, `live/supportCamera.ts`. It has **nothing**
for the dental layers, the gizmo restyle, the customised marks or the problem markers.

**A caution about sharing those files rather than reading them:** mixoMesh is 276 `.js` to 131 `.ts`
with `checkJs: false`, so its scene layer is unchecked JavaScript, while this app is strict
TypeScript with `noUnusedLocals`. Sharing Babylon *files* between the two apps needs that settled
first. This branch shares a vocabulary, not files.

## How to verify a layer

Pixels, not impressions — the browser pane is often too narrow for a useful screenshot.

```js
// in the page, against [data-ui="viewport-babylon-canvas"]
gl.readPixels(...)  // then: distinct colour count, modal (background) share, dark-pixel count
```

A layer that draws something moves the distinct-colour count and the background share. The model
path, the grid and the supports were each proved this way.

**THE CANVAS ALTERNATES BETWEEN TWO FRAMES, so pixel diffing has a floor.** With nothing moving
and the pointer parked off the model, consecutive reads of the Babylon canvas go `0, 605, 0, 605, 0`
— two states, 605 pixels apart, swapping. Frames of the same parity are byte-identical, and a
genuinely idle scene with no pointer events at all diffs to **0**, so the scene itself is stable.
It is the read that alternates. Consequences for anyone measuring a layer here:

- **only a difference well above ~605 pixels means anything**; a hairline ring does not clear it;
- take several frames and compare same-parity ones, or enlarge the thing you are testing until it
  is unmistakable (the ghost tip needed 20 mm to produce 5,384 unambiguous pixels);
- the app's OWN state is the better oracle where it exists — the zone brush was proved by the
  control reading "Painted", not by counting pixels.

**Two traps, both of which cost a verification round here:**

1. **Supports take about 16 seconds to build on the knot fixture, and the panel enables "Remove
   supports" within 2.** Wait on the data — the mesh lengths — never on the button. An empty mesh
   reads exactly like a layer that does not draw.
2. **r3f's `<Canvas>` does not set `preserveDrawingBuffer`**, so `readPixels` on the three.js canvas
   returns all black. The Babylon view can be measured and the three.js one cannot. Comparisons
   between the two are by screenshot in a wide pane, or by temporarily adding the flag to the three
   view.

## What finishing looks like

Not "Babylon draws everything". It is: **the 186-check walk passes with `?renderer=babylon`**, which
means rewriting the walk to drive whichever renderer it is pointed at. That is the acceptance test
for this whole migration, and until it is written the Babylon view is a preview however complete it
looks. Only then does three.js come out — `three`, `@react-three/fiber`, `@react-three/drei`, and
the 2,480 lines in `src/components/viewport/` that use them.

## 2026-11-17 — the walk drives either renderer, and what it found

`npm run walk -- --renderer=babylon` runs the same 186 checks against the Babylon view. **One file,
two runs**, because a second walk file would have drifted from this one within a week and would have
proved only that the two views agree about whatever somebody remembered to copy. Almost every check
is the app's behaviour — counts, status lines, what Undo brings back — and does not care which
library drew the pixels, so the flag only changes the base URL: the renderer switch is read from the
address on every load and deliberately not remembered, so every `page.goto(url)` carries it.

**The verdict line names the renderer whenever it is not the default.** A Babylon receipt must never
be readable as the three.js gate, which is what `npm run gate` and CLAUDE.md still mean.

### Five faults, and not one of them was where it hurt

The first Babylon run died at check 73 with five rim failures. None of them was about the rim.

1. **The edit clicks ran in rim define mode.** three's `UnitObject` returns before `pickFor` while a
   rim is being drawn; this view had no such guard, so every click that placed an anchor also added
   a support. A probe counted fifteen. Fifteen supports grew the unit's bounding box fourfold; the
   camera fit framed the supports rather than the model; the walk aims at canvas FRACTIONS, so its
   clicks then missed the model altogether. One missing guard, five failing checks, none of them
   about the thing that was wrong. The rule is named once now (`clickOwner.ts`) and both views ask
   it.

2. **The camera fit was declared before the units effect**, so the fit that arrives with a freshly
   imported model found no node and did nothing. The same trap as the gizmo, in the same file.
   Proved by measurement: with Fit pressed by hand the two views' models covered exactly the same
   canvas cells, which said the arithmetic was never wrong and the ordering was.

3. **The area layers read only the PREVIEW**, never the accepted policy, so once Step 1 handed its
   policy over every one of them vanished — the drawing was saved and invisible. No check caught
   this directly; it fell out of chasing (4).

4. **A one-pixel line at 0.9 alpha renders near-white here.** `u5j` measures the area-edge token on
   the model: zero pixels in this view, 122 in three. Forced to a pure green the line measured
   177/255/183 — lifted on the two channels that should have been zero — so the colour reached the
   shader and the blending ate it. One opaque pass measured 0/255/0 exactly. Both loops are opaque
   now and the rim measures 105 pixels of the exact token.

5. **Babylon drew and picked the full mesh where three draws and picks the simplified DISPLAY copy.**
   `b3d` adds a support at one canvas point on the real aligner: three answered "Support added." and
   this view answered "This spot faces up, so a tip here may not hold." One spot, two answers,
   because they were not the same surface. The display copy is what is drawn, picked and used as a
   brush occluder now, and the surface overlays are gated on `shown === unit.source` exactly as
   `UnitObject` gates them.

### The probes, which are worth more than the fixes

Three throwaway scripts did the work, and each asked the APP rather than the picture:

- **a canvas-fraction hit grid** — click a grid of points, watch the rim count, print where the
  model is. That is what turned "the rim is broken" into "the model is three times too small";
- **a React-props read** (the walk's own `readProps` trick) — both views reported the same policy
  kind, the same sixty rim points and the same opening direction, which said the drawing was
  reaching the screen and arriving the wrong colour;
- **a forced colour** — set the rim green and measure. The answer was lifted on exactly the channels
  that should have been zero, which is a blending fact, not a colour fact.

### Still open, and quantified

The two views land the same click **0.19 mm apart** on the same face (`b3d`: tip at
-23.352/2.246/-0.952 against -23.299/2.122/-1.081). An `ArcRotateCamera` is placed through alpha,
beta and radius, so it cannot land on three's exact position. It is within a face everywhere the
walk looks. The zone brush also lands a stroke differently on the knot (three: one stroke, six
supports hidden; Babylon: two strokes, seven) — the check is relational and passes either way, and
the cause has not been chased.

## 2026-11-17, later — the two differences that were left open, closed

### The zone brush had its own sampling, and that was the whole difference

The walk noted "zones painted over the model (2 strokes landed)" against three's 1, and the check
around it is relational, so it passed either way. It was not a measurement of the brushes: the
walk's helper HUNTS for a spot that registers, so its count depends on where each view framed the
model. A fixed stroke, painted at the same canvas points in both, is the measurement — and the
first one said 1 against 2.

`attachSurfaceBrush` had reimplemented the stroke instead of importing it. It recorded a hit on the
press and one every half radius, and turned the lot into stamps on release. `UnitObject` runs
geocore's `createStroke` with `zoneFill`, which remembers the last centre it laid, decides when the
next is due, and **fills the gap between two samples with `stampsAlong`** — so a fast drag paints a
continuous band where sampling alone paints a dotted line. The faster the drag, the more it looked
like a different tool.

It runs the same stroke object and the same fill rule now. One fixed stroke, both views:

```
0.36/0.42 -> 0.44/0.42:  +6 stamps (radius 2)   both
0.40/0.36 -> 0.60/0.36: +11 stamps              both
0.30/0.50 -> 0.70/0.50: +31 stamps              both
```

The in-flight stamps are reported to the view as they are laid, too (`onLive`), because
`UnitObject` draws `[...unit.zones, ...stroke]` and this view drew nothing until the release —
paint that arrives all at once at the end is a different tool to use. They are drawn from an
overlay slot rather than the units effect, for the reason that effect already carries: it rebuilds
every mesh in the scene.

### The 0.19 mm click difference was a camera still moving

`b3d` clicks one canvas point on the aligner and reads where the tip landed. Three runs each:

```
three    -23.344/2.209/-0.987   -23.350/2.239/-0.959   -23.352/2.246/-0.952   spread 0.04 mm
babylon  -23.313/2.188/-1.016   -23.299/2.122/-1.081   -23.193/1.654/-1.604   spread 0.70 mm
```

Babylon's numbers drift steadily in one direction, which is not noise — it is a camera that has not
stopped. `ArcRotateCamera.inertia` defaults to 0.9: the camera keeps nine tenths of its last
movement **every frame** after the pointer lets go, and that decays per frame rather than per
second, so under SwiftShader it glides for seconds. One of the three runs drifted onto an
upward-facing face and the app said "This spot faces up, so a tip here may not hold." — a real
failure of a real rule, caused by the view moving after the operator aimed.

With `inertia` and `panningInertia` at zero the tip lands at -22.739/-0.870/3.355 run after run,
identical to three decimal places. Zero is the only setting whose answer does not depend on the
frame rate.

Chasing that also turned up the orbit speed: drei turns `2π · dx / clientHeight` and Babylon divides
by `angularSensibility` (1000), so the same drag turned the view about seven times further in the
three.js view. `angularSensibilityX/Y` is set from the canvas height now and reset on resize.
**Panning and zoom are still by eye** — `panningSensibility` 100 against OrbitControls' distance-and-
fov derivation — and that is debt, recorded rather than left silent.

### And then panning and zoom, which were still by eye

Left as debt in the entry above, and it was the wrong call: "largely the same layout" has to include
how the view MOVES, because turning, panning and zooming are the gestures an operator makes a
thousand times a day and the ones a different feel is noticed in first.

All three now live in `babylon/orbit.ts`, every number read out of `three-stdlib`'s own source:

```
turn   2 * PI * dx / clientHeight radians            a whole turn per screen height
pan    2 * distance * tan(fov / 2) / clientHeight    world units per pixel
zoom   one notch multiplies the distance by 0.95     whatever size the delta reports
```

Babylon expresses the first two as SENSIBILITIES — pixels per radian, pixels per world unit — so
they are reciprocals of three's, and the panning one depends on the distance, so it is recomputed
every frame from the camera's radius. The zoom is not expressible through Babylon's wheel input at
all: that input scales by the raw event delta, which a mouse, a trackpad and a tilting wheel all
report differently, where OrbitControls reads only the SIGN. So the input is removed and the wheel
handled by hand.

`attachOrbit` also turns ctrl-panning OFF. OrbitControls has no ctrl gesture, and in this app
ctrl+click toggles a support's selection — a ctrl drag that panned would slide the view under that
click. Every place that hands the orbit back (the surface brush, a rim drag, the gizmo, the brush's
stroke end) goes through that one function now, so the terms cannot be re-decided in five places.

**Measured in a browser, against the camera's own numbers:** a 200-pixel pan drag moved the target
22.225 mm where three's formula wants 22.225, and three wheel notches took the radius to 0.8574 of
itself where three wants 0.857375.

**A warning about measuring this from pixels, because it cost an hour.** The first attempt compared
"how much of the canvas is not the background colour" and its centroid, and reported the two views
panning by 109 px against 53 and zooming by 1.26x against 1.03x — a factor of two, confidently
wrong. The two GRIDS are not the same object: three's is drei's infinite shader grid with a distance
fade and Babylon's is a 1000 mm ground, so any yardstick built on canvas coverage moves differently
in the two under identical camera motion. Ask the camera, not the picture.

Still different, and written down rather than left silent: **middle-drag** dollies in OrbitControls
and does nothing in Babylon. Nothing in the app or the walk uses it.

### Middle-drag, and the last line of the human list a machine could answer

**Middle-drag** dollies in OrbitControls and did nothing in Babylon. It does now, by the same 0.95
step as the wheel and once per MOVE EVENT rather than by distance — three's own quirk, kept because
matching it is the point. Both it and the wheel live in `attachDolly`. Measured in a browser: ten
upward move events took the radius to 0.5987 of itself against three's `0.95^10` = 0.5987.

**And the human-test list's third rim bullet** — "paint an area, leave the step, come back" — turns
out to be answerable by machine only as far as the question goes, not as far as the verdict does.
Driving Step 2 to 108 tips, pressing Back then Next, and waiting three seconds for the preview to
settle, in BOTH renderers:

| | on leaving | on return |
|---|---|---|
| tips shown | 108 | 2 |
| area stamps stored | 104 | 104 |
| detected region (contact faces) | 15,943 | 14,110 |

The PAINT survives, so the old bug named on that line is still fixed. What changes is the detected
REGION, and with it the tips. Two readings fit those numbers — the re-detection after Next
legitimately moved the area away from the paint (and the operator wants a notice), or the preview is
stale — and a person can tell them apart in one look at the model. **That look is not something a
machine can do for them**, so the numbers went into `docs/handoff/human-test-2026-11-11.md` beside
the bullet rather than into a walk check: a gate must not bless behaviour nobody has ruled on.

The other three bullets on that line ARE machine-answerable and now run on both renderers
(`u5c`..`u5k3`), which the same file records, so what is left for a person there is the feel rather
than the fact.

#### The 108-to-2 drop, settled

The entry above left two readings open. Driving the question directly — one aligner, one change at a
time, nothing else touched — settles it, and the answer is neither of them:

```
paint one stroke, Back, Next     tips 104 -> 104   stamps 31 -> 31   region 14,110 -> 14,110
nudge Area width, Back, Next     tips 104 ->   0   stamps 31 -> 31   region 14,946 -> 14,110
```

**The paint survives.** The bullet in the human-test list that asked about it can be ticked.

**A TUNING change does not.** The stamps and the tuning VALUE are both carried over --
`keptDentalWork` in `src/dental/flow.ts` does exactly that, and its comment describes this class of
bug (W-01) from an earlier audit -- but the AREA the tuning produced is not: the region reverts to
its untuned detection and the tip preview comes back ABSENT. The count reads 0 because
`dentalPreview` is undefined, so it is the preview that never returns rather than a proposal that
returned empty. The walk's run showed 2 instead of 0 only because that run had two manual tips.

The line is `src/components/useDentalFlow.ts:380`: the policy is built with the freshly DETECTED
`region` and the operator's KEPT `tuning`, and a placement on a policy whose strip geometry and
tuning disagree finds nowhere to put a tip. `previewStatus` reads `ready` and `tuningError` is false
throughout -- the preview ran and placed nothing.

**Fixed.** `keptDentalWork` brings the REGION back with the tuning, and the accept path takes it
when the orientation did not move -- the fresh detection when the tilt confirm turned the aligner,
because a turn really does invalidate the area it was detected for. No product call was needed in
the end: the codebase had already made it, twice, in that function's own comment ("once set, the
operator's own choices are kept") and in audit W-01. Keeping the number and discarding the area it
drew was not a second policy; it was half of the first one.

Same drive, after: tips 104 -> 104 and region 14,946 -> 14,946, where it had been 104 -> 0 and
14,946 -> 14,110. Both walks green: ALL PASS 186 and ALL PASS 186 [renderer: babylon].
