"""
Trace an icon out of the owner's reference sheet onto the Rule B grid, IN COLOUR.

The rail's glyphs stay one ink - they sit beside a word at text size and must take the colour of the
place they are in. The item types are pictures of objects, and the owner's call is that they are proper
pixel art, the way a game's inventory icons are: real hues, a keyline, and enough tones to read as a
solid thing. That needs a second asset path, because `scopeIcon` rewrites every colour by design.

Quantising is done in two steps on purpose: average down to the grid first (BOX), THEN pick a palette.
Picking the palette first and sampling after gives a speckled result, because a 4x4 block of source
pixels usually spans a keyline and a fill, and whichever one the sample lands on wins the cell.
"""
import sys
import numpy as np
from PIL import Image

SRC, OUT, NAME, BOX, NCOL = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4], int(sys.argv[5])
box = tuple(int(v) for v in BOX.split(','))
N, CELL = 64, 10
BG = np.array([239, 236, 253])

im = Image.open(SRC).convert("RGB").crop(box)
w, h = im.size
scale = min((N - 2) / w, (N - 2) / h)
tw, th = max(1, round(w * scale)), max(1, round(h * scale))
small = im.resize((tw, th), Image.BOX)
a = np.asarray(small).astype(int)
art = np.abs(a - BG).sum(axis=2) > 60

# Palette from the artwork only, so the card's lilac never steals a slot.
only = Image.fromarray(np.where(art[..., None], a, BG).astype(np.uint8))
pal = only.quantize(colors=NCOL + 1, method=Image.MEDIANCUT).convert("RGB")
q = np.asarray(pal).astype(int)

def clean(idx, bgval=-1):
    """
    Make a downsampled photograph into PIXEL ART.

    Averaging a drawing down to 64 cells leaves it looking like a small photograph: stray single cells
    where a highlight caught one block, palette slots a few units apart that read as noise rather than
    as shading, and a keyline that breaks wherever the average landed between the outline and the fill.
    Game pixel art is deliberate - every cell is a decision - so the trace is only the first half.

    Three passes, each fixing one of those, in the order that matters: speckles first (so they cannot
    vote in the next step), then the silhouette, then the keyline drawn last so nothing overwrites it.
    """
    out = idx.copy()
    H, W = idx.shape
    # 1. A cell that disagrees with almost all of its neighbours is noise, not detail.
    for _ in range(2):
        src = out.copy()
        for y in range(1, H - 1):
            for x in range(1, W - 1):
                here = src[y][x]
                ring = [src[y+dy][x+dx] for dy in (-1,0,1) for dx in (-1,0,1) if (dy or dx)]
                same = sum(1 for v in ring if v == here)
                if same <= 1:
                    vals = [v for v in ring if v != bgval] or ring
                    out[y][x] = max(set(vals), key=vals.count)
    # 2. Fill one-cell holes in the silhouette, which average down out of thin features.
    for y in range(1, H - 1):
        for x in range(1, W - 1):
            if out[y][x] != bgval:
                continue
            ring = [out[y-1][x], out[y+1][x], out[y][x-1], out[y][x+1]]
            if all(v != bgval for v in ring):
                out[y][x] = max(set(ring), key=ring.count)
    return out

cells = {}
grid = np.full((N, N), -1, dtype=int)
oy, ox = (N - th) // 2, (N - tw) // 2
for y in range(th):
    for x in range(tw):
        if not art[y][x]:
            continue
        rgb = tuple(q[y][x])
        if np.abs(np.array(rgb) - BG).sum() < 40:   # a palette slot that landed on the card colour
            continue
        cells.setdefault(rgb, len(cells))
        grid[oy + y][ox + x] = cells[rgb]

# Merge palette slots that are too close to tell apart: at this size they read as noise, not shading.
rgbs = [np.array(k, dtype=float) for k in cells]
remap = {}
keep = []
for i, c in enumerate(rgbs):
    hit = next((j for j in keep if np.abs(rgbs[j] - c).sum() < 22), None)
    remap[i] = hit if hit is not None else i
    if hit is None:
        keep.append(i)
idx_of = {v: i for i, v in enumerate(cells.values())}
grid = np.vectorize(lambda v: -1 if v < 0 else remap[v])(grid)
grid = clean(grid)

# NO FORCED KEYLINE. Darkening every cell that touches the background was tried and made a crust: this
# shape is nearly all edge, so the outline swallowed the drawing. The reference already has a keyline and
# it survives the averaging, which is the whole reason for tracing a drawing rather than computing one.
used = set(int(v) for v in np.unique(grid) if v >= 0)
cells = {rgb: i for rgb, i in cells.items() if remap[i] in used and remap[i] == i}
order = sorted(cells.items(), key=lambda kv: sum(kv[0]))      # darkest first, so the keyline is drawn under
layers = []
for rgb, idx in order:
    out, hexed = [], "#%02x%02x%02x" % rgb
    for yy in range(N):
        run = 0
        for xx in range(N + 1):
            if xx < N and grid[yy][xx] == idx:
                run += 1
                continue
            if run:
                out.append(f'<rect x="{(xx-run)*CELL}" y="{yy*CELL}" width="{run*CELL}" height="{CELL}"/>')
            run = 0
    if out:
        layers.append(f'<g fill="{hexed}">{"".join(out)}</g>')

svg = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {N*CELL} {N*CELL}" shape-rendering="crispEdges">
  {chr(10) + "  " if layers else ""}{(chr(10) + "  ").join(layers)}
</svg>
'''
open(OUT, "w", encoding="utf-8", newline="\n").write(svg)
print(f"{NAME}: {tw}x{th} cells, {len(cells)} colours, {sum(l.count('<rect') for l in layers)} rects")
