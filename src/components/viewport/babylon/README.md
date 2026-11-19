# `babylon/` — the Babylon view's layers

Thirty-one files and one importer: **`src/components/BabylonObjectViewport.tsx` calls every one of
them and nothing else outside this folder does.** That is the shape to keep. A file here draws a
layer or handles a pointer; it does not decide what a gesture MEANS, because the parent folder's
README explains why the two renderers must share their decisions rather than match them.

**Everything here is an adapter over a renderer-free rule.** Four seams carry the real load, and each
one is a module outside this folder that both views ask:

| this file | adapts | the rule it must never re-implement |
|---|---|---|
| `editClicks.ts` | a click in edit mode | `@mixo-geocore/editing/pick` — `pickAction`, and `CLICK_TOLERANCE` telling a click from an orbit |
| `rimDraw.ts` | placing, inserting and dragging rim anchors | `src/dental/rim/rimTarget.ts` — the target under the press decides |
| `tipMove.ts` | dragging a selected support tip | `src/supports/tipMove.ts` — may this press begin a move, what the release meant, what commands it makes |
| `paintStroke.ts` | a brush stroke on the surface | `@mixo-geocore/editing/stroke` + `surfaceBrush` — spacing, and filling the gap between two samples |

**The test of whether a seam held:** if a file here grows an `if` about what a gesture means — a
tolerance, a selected-only rule, which button — the rule has leaked and the two views have begun to
drift. That is not hypothetical: the renderers disagreed about which press may begin a tip move until
the condition moved into `movePress` on 2026-11-19, and the one that was wrong was the one holding the
rule locally.

## The files

**Pointer handling** (each `attach*` returns its own detacher, and the viewport collects them):

| file | its one job |
|---|---|
| `editClicks.ts` | add, erase, remove, select or report a miss — the click adapter over `pickAction` |
| `rimDraw.ts` | rim define mode: place an anchor, pick one up, insert one into the line, drag it |
| `tipMove.ts` | drag a selected support tip to a new spot |
| `paintStroke.ts` | one brush stroke: no-support zones, or the dental support area |
| `transformGizmo.ts` | move and turn a unit with Babylon's `GizmoManager`, acting on its transform node |
| `orbit.ts` | how the camera answers the pointer — **every number in it is drei's OrbitControls, read out of `three-stdlib`** |
| `surfacePointer.ts` | what is under a screen point, returned in BOTH world and unit-local frames |
| `brushBodies.ts` | the hit test over a unit's support bodies, and which object lies under a screen point |

**Drawing** (each `draw*` is called with the props it needs and reconciles its own meshes):

| file | its one job |
|---|---|
| `supportBodies.ts` | whole support bodies over the supports: the doomed one, the hovered one, Drag over's ghost |
| `tipMarkers.ts` | Step 2's reviewed contacts as cone markers, by thin instances, building no support body |
| `selectionColours.ts` | the selection highlight as per-vertex colour, recoloured rather than rebuilt per click |
| `editPreview.ts` | the ring under the pointer, and the cone when a click would add |
| `sceneMarks.ts` | the build plate's outline, and the ring that opens at a newly added support |
| `surfaceStamps.ts` | brush stamps on the model: zones, and the dental area and its paint |
| `dentalArea.ts` · `dentalMarks.ts` | the approved face tint and the region's exact edges; the risks outside it and the rim loop |
| `rimLayer.ts` | the rim being drawn: its anchors, its line, and the hover anchor not yet placed |
| `faceTint.ts` | a subtle tint over chosen faces (today the denture's add-on parts) |
| `checkMarks.ts` | support-check findings, and Step 1's orientation evidence |
| `printAngle.ts` | the print-angle arc under the model, with its plate line, model line, pivot and reading |
| `bubblePoints.ts` | where a unit's unresolved points and model-landed supports sit, in its own frame |
| `cameraViews.ts` | Fit, Bottom and the side views, "Show me", and the report that the camera crossed the plate |

**The small shared pieces, and the one rule each exists to hold in a single place:**

| file | why it is not inline |
|---|---|
| `surfacePointer.ts` | `port.pick` works in the PICKED UNIT'S own frame, so the world ray is converted per unit. Two layers converting for themselves is how the frames come to disagree |
| `sessionHandles.ts` | one engine handle per mesh object, so a model is not loaded into the Rust session twice |
| `domAnchor.ts` | projects a 3D point to the screen, because Babylon has no drei `<Html>`; `AnchoredDom.tsx` and `printAngle.ts` both need it |
| `linearColour.ts` | **used by eight files here and imported by nothing outside.** Babylon's own conversion is a 2.2 power curve and three's `Color` is sRGB, so a colour converted the Babylon way is visibly wrong beside the three.js view |
| `AnchoredDom.tsx` | the DOM overlays, rendered with the SAME components as the three.js view rather than a second set |

## The tests, and what each refuses

| file | what it will not let happen |
|---|---|
| `orbit.test.ts` | the camera answering the pointer differently from drei's arithmetic |
| `linearColour.test.ts` | a colour converted Babylon's way instead of three's |
| `brushBodies.test.ts` | the brush clip-chain matrices multiplied in the wrong order |
| `surfaceStamps.test.ts` | a small painted spot on a large model becoming a large draw |
| `supportFrame.test.ts` | `BabylonObjectViewport.tsx` drawing supports at `generationTransform` — which put them in the wrong frame, so it is forbidden by name |

The parent folder's `README.md` holds the rest: the port seam, the handedness rule, what this view
still owes, and the table of faults the first Babylon walk found.
