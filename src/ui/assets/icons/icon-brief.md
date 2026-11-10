# Icon brief — hand this to whoever (or whatever) draws them

Copy this whole file to the generator. The rules are not style preferences: they are what this app's
icon loader does to every file, so artwork that ignores them cannot ship.

## Non-negotiable rules

1. **ONE COLOUR — FOR SET A ONLY (see rule 5).** The loader (`scopeIcon`) rewrites every colour you write — hex, `rgb()`, `hsl()` —
   to `currentColor`, so the icon takes the colour of the place it sits in. No gradients, no shading,
   no second colour, no "white highlight". Draw it as a single-colour silhouette and judge it in black
   on white. (A paint written as `fill="var(--accent)"` is left alone, so a second TONE from the app's
   own palette is possible later — but do not use it unless you were asked for it by name: hand in one
   ink.)
2. **PIXEL ART IS SET B ONLY** (rule 5). Set B lands on a **48 × 48 cell grid**, every cell the same
   size, no half cells and no anti-aliased edges: deliver SVG where each cell is a `<rect>` on a
   10-unit grid (`viewBox="0 0 480 480"`), or a 48 × 48 PNG and we will trace it. The app shows it at a
   **whole multiple** of that grid and never between, because a cell landing on two-thirds of a real
   pixel blurs — which looks like a bad drawing, not a bad size. **Set A is not pixel art**: it is
   smooth line work on `viewBox="0 0 24 24"`, matching the Lucide icons it sits beside.
3. **Square canvas, nothing touching the edge.** Keep one pixel of margin all round.
4. **It must work as a silhouette.** No interior outlines that rely on a lighter fill behind them. A
   hole must be a real hole.
5. **TWO SETS, and they are different jobs.** Do not mix them.

   | | Set A — one-ink glyphs | Set B — coloured art |
   | --- | --- | --- |
   | Folder | `src/ui/assets/icons/` | `src/ui/assets/art/` |
   | What | a tool or cursor glyph beside a word | the art on a choice key: an item type |
   | Canvas | `0 0 24 24`, **smooth**, no grid | **48 × 48 cells**, artboard 480 |
   | Shown at | 14–24 px, wherever it is used | **144 px = 3×** |
   | Colour | one — rule 1 above applies | **its own**, with a keyline and a few tones |
   | Style | line work: `fill="none"`, `stroke="currentColor"`, width 1.7, round caps | a picture of the object, from above and in front |

   Rule 1 (one colour) binds **Set A only**. Set B keeps what it was drawn with, because six rounds of
   drawing a dental arch in a single colour produced an archway every time: the teeth, the keyline and
   the shading are the whole of what makes it readable. And the finer grid is arithmetic, not taste —
   fourteen tooth cells need about 50 cells of arch perimeter and 24 gives about 27. Set A was pixel art
   for a while and it was the wrong call: it read as a different set beside the Lucide line icons in the
   same bars, and at that size the pixel look costs detail without buying chunkiness.

   Everything in "the deck tool rail" and "the rim-mode cursor" below is **Set A**. Everything under
   "item kinds" is **Set B**.
6. **Readable large.** These are shown big on a high-resolution screen; the pixel look is a STYLE, not
   a size constraint. Do not optimise for 16 px.

## Already drawn — this is what a REPLACEMENT must keep

Everything in the next two sections exists and is in the app. They are kept here because each one
names the single idea its drawing has to carry: a replacement that loses that idea is worse than no
replacement, however much better it looks. The style book shows all of them at their real sizes with
the path of each file — `npm run dev`, then `/mixodental/kit.html`.

## The deck tool rail — Rule A, drawn

Four buttons sit in a row. They must be distinguishable **from each other at a glance**, which matters
more than any one of them being a perfect picture. `orient.svg` already exists — match its weight.

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

(`orient.svg` exists: a box with a turn arrow.)

## The rim-mode cursor — Rule A, drawn and wired

**What a press does there:** on a point it grabs it, on the drawn line it inserts a new point, on bare
model it adds one at the end. All three used to show the plain system crosshair, which says none of it.

| File | Subject | Must read as |
| --- | --- | --- |
| `cursor-rim.svg` | A fine crosshair with a **small open square at its centre** | "there is a point here, or there will be" |

Draw it as line work like the rest of Set A, and keep it **light** — a cursor sits over the operator's
own artwork and must not blot it out. Hot spot at the centre of the square.

## Still to draw — item kinds, Rule B (only when the app can prepare that item)

The three that exist (`aligner`, `denture`, `generic`) are drawn isometric on the 24 grid and shown at
144px. Match them: `scripts/trace-art.py` traces one from the reference sheet, and the style book is
where you judge it — at its real size, beside the four that exist. The rest below are for later. **The trap: in one
colour, half of these are the same horseshoe.** Each one below names the single feature that tells it
from its neighbours — draw that feature clearly and the rest loosely, not the other way round.

| File | Subject | The one feature that distinguishes it |
| --- | --- | --- |
| ~~`aligner.svg`~~ drawn | Isometric shell | **THIN** — a narrow band, a tall wall, nothing inside |
| `retainer.svg` | Same shell | **A wire** running across the opening |
| `night-guard.svg` | Same shell | **Thick and unbroken** — one continuous piece, no segmentation |
| ~~`denture.svg`~~ drawn | Isometric denture | **BULK** — a gum body nearly twice the aligner's band, with a tooth row standing on it |
| ~~`dental-model.svg`~~ drawn | Isometric study model | **THE PLINTH** — the only one standing on a slab. (`generic.svg` is a plain block, deliberately NOT a dental object: it is the "any STL" choice.) |
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
