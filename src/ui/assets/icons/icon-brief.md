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

**`tool-rim.svg` — the trim edge, and the points that define it.**
The rim is the aligner's trim line: the edge that runs all the way round the shell. The app either
finds it or the operator draws it by placing points along it and dragging them. So: a horseshoe
**outline, one pixel thick**, with 4–6 small **square handles sitting on the line itself**. It is a
path with grab-points, not a shape. Nothing filled.

**`tool-area.svg` — the narrow strip where support tips are allowed.**
Not "a region on the model" — it is a **narrow band that runs ALONG the rim, just outside it**, and
the support tips sit on that band's **middle line**. The operator widens it, shifts it across the
edge, and paints extra onto it. So: a horseshoe **band of 2–3 pixels thickness** with a **row of
single-pixel dots running down its centre**. Those dots are the point of the icon — they are what
makes it "where supports may touch" rather than "a coloured area".

**`tool-supports.svg` — the pillars that hold the model off the plate.**
Tips touch the aligner, thin pillars run down from them to the build plate, and a raft sits at the
bottom. This is the **only icon in the set drawn from the SIDE**, which is most of what tells it from
the other three. So: a **flat shelf across the top**, 2–4 **thin vertical pillars** dropping from it,
standing on a **solid base line**. Think scaffolding under a bridge, not a tree.

| File | One-line test |
| --- | --- |
| `tool-rim.svg` | "a line with points I can move" — outline + handles, nothing filled |
| `tool-area.svg` | "a strip with tips on it" — band + a row of dots down its centre |
| `tool-supports.svg` | "props holding something up" — side view, shelf + pillars + base |

(`tool-orient.svg` exists: a box with a turn arrow.)

## Priority 2 — the rim-mode cursor

In rim define mode a press means three different things, and today all three show a plain crosshair.

| File | Subject | Must read as |
| --- | --- | --- |
**What a press does there:** on a point it grabs it, on the drawn line it inserts a new point, on bare
model it adds one at the end. All three today show a plain system crosshair, which says none of it.

| File | Subject | Must read as |
| --- | --- | --- |
| `cursor-rim.svg` | A fine crosshair with a **small open square at its centre** | "there is a point here, or there will be" |

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
