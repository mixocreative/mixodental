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

The order is by what an operator loses without it, not by what is easy.

| # | Layer | three source | Geometry source | Notes |
|---|---|---|---|---|
| 1 | Zone stamps (no-support zones) | `supportLayers.tsx` | **renderer-free already**: `overlayMesh.ts` → Rust `refine_for_overlay` + `buildVertexGrid` | Needs per-vertex colours from the zone stamps; that evaluation is the real work, not the drawing |
| 2 | Ghost tip, remove ring, brush circle | `supportLayers.tsx`, `CirclePreview.tsx` | `warmMaterials.ts` cone geometry is three-specific and tiny to rebuild | This is what makes the view an editor rather than a viewer |
| 3 | Selection highlight / stale / tips-only | `supportLayers.tsx` | recolouring vertex ranges in place | mixoMesh's `supports/layers/supportMeshLayer.ts` does this job in Babylon already — read it first |
| 4 | Dental paint, face tint, region lines | `dentalLayers.tsx` | **renderer-free already**: `faceMaskOverlay.ts` → Rust `face_mask_overlay`, `face_mask_contour_segments` | No Babylon equivalent exists in mixoMesh; this is dental-only work |
| 5 | The rim being drawn | `RimDraftLayer.tsx` | `src/core/surfacePath/` is renderer-free | |
| 6 | The gizmo | `UnitObject.tsx`, `gizmoStyle.ts` | Babylon `GizmoManager` | `gizmoStyle.ts`'s token and constant tables survive; only the three drawing goes |
| 7 | Bubbles, add flash, print-angle arc, thumbnail | their own files | mixed | `UnresolvedBubbles` is HTML in a 3D group — Babylon needs a different approach (screen-space projection through `worldToScreen`, which the port already answers) |

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
