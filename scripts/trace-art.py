"""
Trace one item-type icon out of a reference sheet onto the Rule B grid.

    python scripts/trace-art.py <sheet.webp> <out.svg> <name> <x0,y0,x1,y1>

WHY TRACE RATHER THAN GENERATE. The rail's glyphs are abstract diagrams - a path with handles, a strip
with holes - and a generator draws those well because there is no correct look to miss. An item type has
to be RECOGNISED, and that needs per-pixel judgement a formula cannot reach: tooth cells that change
width from molar to incisor, real perspective, and tones where a swept band has one. Six rounds of
parametric drawing produced an archway every time; `scripts/pixel-icons.mjs` records what and why.

THE PIPELINE, and every step is here because the step before it was not enough:

  1. average down to the grid        - sampling instead speckles, because a block of source pixels
                                       usually spans a keyline and a fill and whichever one the sample
                                       lands on wins the cell
  2. despeckle                       - what is left still looks like a small photograph, not pixel art
  3. drop everything the outline     - the reference casts a shadow, and a shadow implies a light and a
     does not enclose                 ground plane an icon on a key does not have
  4. quantise the REMAINS to four    - quantising before step 3 lets the shadow win palette slots
  5. draw the outline last           - so nothing overwrites it

Four body colours plus the outline is five, which is the owner's limit and about what the grid can
carry: at this size near-duplicate tones read as noise rather than as shading.
"""
import sys

import numpy as np
from PIL import Image

SRC, OUT, NAME, BOX = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
box = tuple(int(v) for v in BOX.split(','))

N = 48            # the Rule B grid: 48 x 48 cells on a 480 artboard
CELL = 10         # a cell is ten units on every grid, so "a multiple of ten" is the on-grid test
BODY = 4          # body colours; the outline is the fifth
OUTLINE = 2       # how many cells thick the black outline is, grown inward
INK = (26, 26, 32)
BG = np.array([239, 236, 253])    # the reference sheet's card colour

# ---- 1. average down to the grid, keeping the artwork's aspect and a one-cell margin ----------------
im = Image.open(SRC).convert("RGB").crop(box)
w, h = im.size
scale = min((N - 2) / w, (N - 2) / h)
tw, th = max(1, round(w * scale)), max(1, round(h * scale))
rgb = np.asarray(im.resize((tw, th), Image.BOX)).astype(int)
art = np.abs(rgb - BG).sum(axis=2) > 60
if not art.any():
    raise SystemExit(f"{NAME}: nothing but background in that box")


def despeckle(mask, value):
    """
    A cell that disagrees with almost every neighbour is noise, not detail; a one-cell hole in the
    silhouette is an artefact of averaging a thin feature. Both are what separates pixel art from a
    small photograph, and both are fixed by looking only at the eight neighbours.
    """
    out = mask.copy()
    for _ in range(2):
        src = out.copy()
        for y in range(1, src.shape[0] - 1):
            for x in range(1, src.shape[1] - 1):
                ring = [src[y + dy][x + dx] for dy in (-1, 0, 1) for dx in (-1, 0, 1) if (dy or dx)]
                if sum(1 for v in ring if v == src[y][x]) <= 1:
                    out[y][x] = max(set(ring), key=ring.count)
    return out


art = despeckle(art, True)


# ---- 2 & 3. the object is what the outline encloses; the shadow is what it does not -----------------
def enclosed(mask, wall):
    """
    Flood from the border through everything that is not `wall`, and return what the flood cannot reach.

    Detecting a cast shadow by COLOUR is guesswork - a grey shadow and a grey highlight are the same
    grey. By TOPOLOGY it is exact: a shadow lies outside the outline, and the interior of a closed
    outline cannot be reached from the border. If the outline has a gap the flood leaks in and takes the
    object with it, which the caller checks for.
    """
    H, W = mask.shape
    seen = np.zeros_like(mask)
    stack = [(y, x) for y in range(H) for x in (0, W - 1)] + [(y, x) for x in range(W) for y in (0, H - 1)]
    while stack:
        y, x = stack.pop()
        if not (0 <= y < H and 0 <= x < W) or seen[y][x] or wall[y][x]:
            continue
        seen[y][x] = True
        stack.extend(((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)))
    # EVERYTHING THE FLOOD CANNOT REACH, not just the cells that looked like artwork. Inside the outline
    # there are no holes: a cell that averaged out to the card colour there is a highlight on the object,
    # not a window through it, and leaving it transparent punched the paper through the drawing. An
    # opening that really is open - the mouth of the U - connects to the border, so the flood still
    # reaches it and it stays clear.
    return ~seen


# WHICH tones count as the outline is not a constant: a denture's is heavy, a clear aligner's is a thin
# grey line the averaging breaks in places. One fixed threshold closed the first and leaked through the
# second. So take the THINNEST CLOSED outline - widen a step at a time, stop at the first one the flood
# cannot pass. The widest would also close, and would swallow real shading into the outline.
lum = rgb.sum(axis=2)
keep = None
for q in (0.22, 0.30, 0.38, 0.46, 0.54, 0.62):
    wall = art & (lum <= np.quantile(lum[art], q))
    candidate = enclosed(art, wall)
    if candidate.sum() >= art.sum() * 0.45:
        keep, chosen, keyline = candidate, q, wall
        break
if keep is None:
    raise SystemExit(f"{NAME}: no closed outline at any threshold - nothing written")
# Two different numbers, and subtracting the totals conflated them into a meaningless negative: artwork
# that fell OUTSIDE the outline is the shadow going, and cells inside it that did not look like artwork
# are holes being filled. Both are worth seeing when a new icon is traced.
shadow = int((art & ~keep).sum())
filled = int((keep & ~art).sum())

# ---- 4. quantise what is left, and only what is left -----------------------------------------------
# Quantising before the shadow went let it win palette slots, and picking the four most COMMON colours
# afterwards was worse: on a clear aligner the four commonest are all near-white, so the body vanished
# into the highlight. Re-quantising the kept cells asks for a spread across the range, which is what
# shading is.
# Quantise the KEPT PIXELS ALONE, as a flat strip, rather than the picture with the rest painted out.
# Painting the rest to the card colour hands that colour a palette slot of its own - which was harmless
# while near-background cells were skipped, and became a sixth colour the moment every enclosed cell had
# to be filled. A strip of only the pixels that matter cannot spend a slot on one that does not.
#
# ONE BLACK, NOT TWO. The reference's own keyline is dark, so quantising it along with the body spent a
# palette slot on a second near-black - and the outline came out as two shades, a hard edge with a softer
# one just inside it, which is exactly what an outline must not be. The cells the flood treated as the
# wall ARE the outline, so they take the ink directly and never reach the quantiser; what is quantised is
# the body alone, which also gives the four colours to the shading rather than to the edge.
body = keep & ~keyline
pixels = rgb[body]
strip = Image.fromarray(pixels.reshape(-1, 1, 3).astype(np.uint8))
palette = np.asarray(strip.quantize(colors=BODY, method=Image.MEDIANCUT).convert("RGB")).astype(int).reshape(-1, 3)
pal = np.zeros_like(rgb)
pal[body] = palette
pal[keyline & keep] = INK

grid = np.full((N, N), -1, dtype=int)
colours: dict[tuple[int, int, int], int] = {}
oy, ox = (N - th) // 2, (N - tw) // 2
for y in range(th):
    for x in range(tw):
        if not keep[y][x]:
            continue
        # EVERY enclosed cell gets a colour. There was a skip here for slots that landed on the card
        # colour, and inside the outline that is the one place it must not apply: it left see-through
        # cells in the middle of the object, so the key's paper showed through the drawing.
        grid[oy + y][ox + x] = colours.setdefault(tuple(int(v) for v in pal[y][x]), len(colours))

# ---- 5. the outline, drawn last so nothing overwrites it -------------------------------------------
# The reference's own keyline survives the averaging in places and breaks in others, wherever a cell
# straddled the outline and the fill. A broken outline is what makes pixel art read as a smudge rather
# than an object, so it is redrawn as one ring of one colour round everything that touches the outside.
#
# TWO CELLS THICK, INWARD. One cell is four real pixels at 128px and reads as a hairline next to art
# this chunky; two is what gives it the weight the reference has. It grows inward on purpose - growing
# outward would push the drawing past the margin and change its size, and the silhouette is already
# where it should be.
# THE SILHOUETTE ONLY. Growing from every ink cell also doubled the reference's own INTERIOR keylines -
# the lines between one tooth and the next - and those are two or three cells apart, so the thickening
# closed the gaps and the tooth row turned into a black band. Only the outer ring grows.
ink = colours.setdefault(INK, len(colours))
pad = np.pad(grid, 1, constant_values=-1)
ring = (grid >= 0) & ((pad[:-2, 1:-1] < 0) | (pad[2:, 1:-1] < 0) | (pad[1:-1, :-2] < 0) | (pad[1:-1, 2:] < 0))
for _ in range(OUTLINE - 1):
    pad = np.pad(ring, 1, constant_values=False)
    nextTo = pad[:-2, 1:-1] | pad[2:, 1:-1] | pad[1:-1, :-2] | pad[1:-1, 2:]
    ring = ring | ((grid >= 0) & nextTo)
grid = np.where(ring, ink, grid)

used = {int(v) for v in np.unique(grid) if v >= 0}
colours = {c: i for c, i in colours.items() if i in used}
if len(colours) > BODY + 1:
    raise SystemExit(f"{NAME}: {len(colours)} colours, which is more than the {BODY + 1} allowed")


def runs(index):
    out = []
    for y in range(N):
        run = 0
        for x in range(N + 1):
            if x < N and grid[y][x] == index:
                run += 1
                continue
            if run:
                out.append(f'<rect x="{(x - run) * CELL}" y="{y * CELL}" width="{run * CELL}" height="{CELL}"/>')
            run = 0
    return "".join(out)


# Darkest first, so the outline sits under the fills rather than over them.
layers = [f'<g fill="#{r:02x}{g:02x}{b:02x}">{runs(i)}</g>' for (r, g, b), i in sorted(colours.items(), key=lambda kv: sum(kv[0]))]
open(OUT, "w", encoding="utf-8", newline="\n").write(
    '<?xml version="1.0" encoding="UTF-8"?>\n'
    f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {N * CELL} {N * CELL}" shape-rendering="crispEdges">\n  '
    + "\n  ".join(layers)
    + "\n</svg>\n"
)
print(f"{NAME}: {tw}x{th} cells, {len(colours)} colours, outline at the {int(chosen * 100)}% darkest, "
      f"{shadow} shadow cells dropped, {filled} holes filled, {sum(l.count('<rect') for l in layers)} rects")
