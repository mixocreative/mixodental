# Icon brief — hand this to whoever (or whatever) draws them

Copy this whole file to the generator. The rules are not style preferences: they are what this app's
icon loader does to every file, so artwork that ignores them cannot ship.

## Non-negotiable rules

1. **ONE COLOUR.** The loader (`scopeIcon`) rewrites every fill and stroke to `currentColor`, so the
   icon takes the colour of the place it sits in. No gradients, no shading, no second colour, no
   "white highlight". Draw it as a single-colour silhouette and judge it in black on white.
2. **Pixel-art look, vector output.** Everything lands on a **24 × 24 pixel grid**, every pixel the
   same size, no half pixels and no anti-aliased edges. Deliver SVG where each pixel is a `<rect>` on
   a 10-unit grid (`viewBox="0 0 240 240"`), or deliver a 24 × 24 PNG and we will trace it.
3. **Square canvas, nothing touching the edge.** Keep one pixel of margin all round.
4. **It must work as a silhouette.** No interior outlines that rely on a lighter fill behind them. A
   hole must be a real hole.
5. **Flat and front-on or simple isometric** — pick one and keep it across the whole set. Teenage
   Engineering, not product photography.
6. **Readable large.** These are shown big on a high-resolution screen; the pixel look is a STYLE, not
   a size constraint. Do not optimise for 16 px.

## Priority 1 — the deck tool rail (these unblock the app)

Four buttons sit in a row. They must be distinguishable **from each other at a glance**, which matters
more than any one of them being a perfect picture. `tool-orient` already exists — match its weight.

| File | Subject | Must read as | Keep it apart from |
| --- | --- | --- | --- |
| `tool-rim.svg` | The edge line around a dental arch — a horseshoe **outline** with small square handles on it | "the boundary, with points you can move" | `tool-area`: this is a LINE with handles, not a filled region |
| `tool-area.svg` | A horseshoe band **filled in**, a solid strip following the arch | "a painted region on the surface" | `tool-rim`: no handles, no open line — a solid band |
| `tool-supports.svg` | Two or three thin **pillars standing under a flat shelf**, like props under a ledge | "things holding the model up from below" | Everything else: this is the only vertical/side view |

(`tool-orient.svg` exists: a box with a turn arrow.)

## Priority 2 — the rim-mode cursor

In rim define mode a press means three different things, and today all three show a plain crosshair.

| File | Subject | Must read as |
| --- | --- | --- |
| `cursor-rim.svg` | A crosshair with a small square handle at its centre | "press here and you will grab or place a point" |

Draw it on the same 24 × 24 grid but keep it **light** — a cursor sits over artwork and must not blot
it out. Hotspot at the centre.

## Priority 3 — item kinds (only when the app can prepare that item)

Three exist and work (`aligner`, `denture`, `generic`). The rest are for later. **The trap: in one
colour, half of these are the same horseshoe.** Each one below names the single feature that tells it
from its neighbours — draw that feature clearly and the rest loosely, not the other way round.

| File | Subject | The one feature that distinguishes it |
| --- | --- | --- |
| `aligner.svg` | Clear tooth-shaped shell, top-down horseshoe | **Segmented** — a visible gap per tooth, thin walls, nothing inside |
| `retainer.svg` | Same shell | **A wire** running across the opening |
| `night-guard.svg` | Same shell | **Thick and unbroken** — one continuous piece, no segmentation |
| `denture.svg` | Full denture, arch of teeth on a gum | **Bulk** — a solid gum body behind the tooth row |
| `generic.svg` / `model.svg` | A dental study model | **A solid flat base** the arch stands on — the only one with a plinth |
| `surgical-guide.svg` | Arch with drill guides | **Round holes punched through** the band |
| `crown-bridge.svg` | Two or three joined crowns | **Small, free-standing** — no arch at all |
| `abutment.svg` | Implant abutment | **Tall and vertical**, a screw thread at the bottom |
| `wax-up.svg` | Planning model | An arch on a base with **one tooth clearly different** from its neighbours |
| `gingiva-mask.svg` | Soft tissue mask | A **scalloped** arch, wavy on top, with sockets |
| `bracket-tray.svg` | Bracket transfer tray | A thin arch with **small square brackets** evenly along it |
| `impression-tray.svg` | Impression tray | A **handle** sticking out, and perforation holes |

## How to check it before sending it back

Put the icons side by side at the same size, in black on white, and ask: **could someone name each one
without the caption?** If two are the same shape, the distinguishing feature is not drawn hard enough.
That is the only test that matters here, and it is the one the colourful 3D proposal fails.
