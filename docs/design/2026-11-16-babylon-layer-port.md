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

That decision is the whole job, because **the supports are drawn in `generationTransform(unit)`,
not `unit.transform`**. Parent them to the same node as the model and a gizmo drag moves supports
that have not been regenerated, which is a lie about where they will print — the exact rule
`d6d3f9f` exists to protect. Read how `UnitObject` arranges its group before writing any of this.

Also already in hand: `gizmoShown(gesture, gizmoMode, rotationGizmo)` is exported from
`ObjectViewport.tsx` and is renderer-free, so the visibility rule needs no porting; and the camera
must stand down during a gizmo drag exactly as it does during a brush stroke.

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
