"""
Flatten the item-type art to plain grid rects, keeping exactly how it looks.

    npm run art                                      # every drawing in the art folder
    npm run art -- --check                           # say what would change, write nothing
    python scripts/flatten-art.py path/to/one.svg    # just this one

RE-EXPORT FROM ILLUSTRATOR, THEN RUN IT. That is the whole workflow: the owner edits the drawings
as they please and the export is made to fit the folder's contract afterwards, rather than the
owner being asked to draw inside it. With no path it takes the art folder, so there is nothing to
remember and nothing to leave out - the one file you forget is the one the guard fails on.

WHY THIS EXISTS. The art folder's contract is Rule B: every drawing is axis-aligned rectangles on a
48x48 grid of 10 units, `shape-rendering="crispEdges"`. `scripts/trace-art.py` produces that from a
reference sheet. But the owner edits these in Illustrator and re-exports - which is the point of the
folder, and must stay true - and Illustrator exports what it likes: `<polygon>` for a shape it reads
as angled, and `transform="translate(...) rotate(90)"` for a rect it drew on its side.

Those are not wrong and they look identical in a browser. They are invisible to `src/ui/art.test.ts`,
which reads `x/y/width/height` off `<rect>` and nothing else - so on 2026-11-17 a redrawn night guard
failed "leaves no hole inside the outline" with 58 unreachable cells, 57 of them sitting inside
polygons the guard could not see. The drawing was fine. The reader was narrow.

Two ways to answer that, and this is the better one:

  * widen the guard to understand polygons, transforms, and whatever Illustrator emits next - a
    renderer, written here, maintained forever, and wrong in a new way each export; or
  * FLATTEN the export back onto the grid the folder already promises, once, so every reader -
    the guard, the style book, the tracer, a future one - sees the same plain rects.

The second keeps the owner's edits AND their appearance, because the drawing is already quantised to
that grid: a cell is either covered or it is not, and `crispEdges` means the browser draws no
in-between. Flattening is therefore lossless HERE in a way it would not be for smooth vector art.

WHAT IT DOES NOT DO: re-colour, despeckle, or quantise the palette. Those are `trace-art.py`'s job on
the way IN from a reference. This only changes the shapes that carry colours the file already chose.
"""
import glob
import os
import re
import sys

GRID, CELL = 48, 10
SIDE = GRID * CELL


def shapes(svg):
    """Every drawn shape in DOCUMENT ORDER, as (class, kind, geometry). Order is paint order."""
    out = []
    for m in re.finditer(r"<(rect|polygon)\b([^>]*)/?>", svg):
        kind, attrs = m.group(1), m.group(2)
        cls = re.search(r'class="([^"]*)"', attrs)
        if kind == "rect":
            def num(a):
                hit = re.search(r'[ ]%s="([^"]*)"' % a, attrs)
                return float(hit.group(1)) if hit else 0.0
            x, y, w, h = num("x"), num("y"), num("width"), num("height")
            t = re.search(r'transform="translate\(([-\d.]+)[ ,]+([-\d.]+)\)\s*rotate\(90\)"', attrs)
            if t:
                # rotate(90) maps (x, y) -> (-y, x); then translate. The rect stays axis-aligned,
                # so it is still a rect - it is only written down in a way the guard cannot read.
                tx, ty = float(t.group(1)), float(t.group(2))
                x, y, w, h = tx - y - h, ty + x, h, w
            elif "transform=" in attrs:
                raise SystemExit("unhandled transform, refusing to guess:\n  " + m.group(0)[:120])
            out.append((cls.group(1) if cls else None, "rect", (x, y, w, h)))
        else:
            pts = [float(v) for v in re.findall(r"-?\d+(?:\.\d+)?", re.search(r'points="([^"]*)"', attrs).group(1))]
            out.append((cls.group(1) if cls else None, "poly", list(zip(pts[0::2], pts[1::2]))))
    return out


def inside(px, py, poly):
    """Even-odd ray cast, the same rule a browser fills a polygon with by default."""
    hit = False
    for i in range(len(poly)):
        x1, y1 = poly[i]
        x2, y2 = poly[(i + 1) % len(poly)]
        if (y1 > py) != (y2 > py) and px < x1 + (py - y1) * (x2 - x1) / (y2 - y1):
            hit = not hit
    return hit


def paint(svg):
    """The grid as the browser draws it: one class per cell, later shapes winning."""
    cells = [[None] * GRID for _ in range(GRID)]
    for cls, kind, geo in shapes(svg):
        if kind == "rect":
            x, y, w, h = (int(round(v / CELL)) for v in geo)
            for dy in range(h):
                for dx in range(w):
                    if 0 <= y + dy < GRID and 0 <= x + dx < GRID:
                        cells[y + dy][x + dx] = cls
        else:
            # Cell CENTRES, which is what `crispEdges` resolves a part-covered cell to anyway.
            for gy in range(GRID):
                for gx in range(GRID):
                    if inside((gx + 0.5) * CELL, (gy + 0.5) * CELL, geo):
                        cells[gy][gx] = cls
    return cells


def runs(cells):
    """Horizontal runs of one class, so the output is not 2,304 one-cell rects."""
    for y in range(GRID):
        x = 0
        while x < GRID:
            cls = cells[y][x]
            if cls is None:
                x += 1
                continue
            end = x
            while end + 1 < GRID and cells[y][end + 1] == cls:
                end += 1
            yield cls, x * CELL, y * CELL, (end - x + 1) * CELL, CELL
            x = end + 1


def rebuild(svg, cells):
    """The original head (defs, style, palette) with one flat layer of rects in place of the body."""
    head = svg[:svg.index("</defs>") + len("</defs>")]
    body = "\n".join(
        '    <rect class="%s" x="%g" y="%g" width="%g" height="%g"/>' % r for r in runs(cells))
    return ('%s\n  <g shape-rendering="crispEdges">\n%s\n  </g>\n</svg>\n' % (head, body))


ART = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "src", "ui", "assets", "art")


def targets(argv):
    """The files to flatten: the ones named, every `.svg` in a named folder, or the whole art folder."""
    named = [a for a in argv if not a.startswith("--")]
    out = []
    for path in named or [ART]:
        out += sorted(glob.glob(os.path.join(path, "*.svg"))) if os.path.isdir(path) else [path]
    return out


def flatten(path, check):
    """One file. Returns True when it was already flat, so the caller can say nothing happened."""
    svg = open(path, encoding="utf-8").read()
    before = shapes(svg)
    name = os.path.basename(path)
    polys = sum(1 for s in before if s[1] == "poly")
    turned = sum(1 for s in before if s[1] == "rect") - len(re.findall(r"<rect\b(?![^>]*transform)", svg))
    offgrid = sum(1 for cls, kind, geo in before if kind == "rect"
                  and any(abs(v / CELL - round(v / CELL)) > 1e-6 for v in geo))
    # A FILE THAT IS ALREADY PLAIN IS LEFT EXACTLY AS IT IS - not rebuilt into something equivalent.
    # `scripts/trace-art.py` writes its drawings as one `<g fill="...">` holding bare rects, with no
    # classes and no `<defs>`; rebuilding one of those would mean inventing a palette for it and
    # rewriting four files nobody edited, to no visible effect. Flattening is for an export that
    # carries shapes the folder's contract does not allow, and nothing else.
    if not polys and not turned and not offgrid:
        print("  %-20s already plain grid rects - left alone" % name)
        return True
    if "</defs>" not in svg:
        raise SystemExit("%s has shapes to flatten but no <defs> to keep its palette in - "
                         "re-export it from Illustrator, which writes one." % name)
    cells = paint(svg)
    out = rebuild(svg, cells)
    flat = sum(1 for _ in runs(cells))
    print("  %-20s %d shapes in (%d polygons, %d rotated, %d off-grid) -> %d flat rects"
          % (name, len(before), polys, max(turned, 0), offgrid, flat))
    # The drawing must still cover the same cells. A flatten that loses or gains ink is not a flatten.
    if paint(out) != cells:
        raise SystemExit("REFUSING TO WRITE %s: the flattened file does not paint the same cells" % name)
    print("  %-20s verified: paints exactly the same %d cells"
          % ("", sum(c is not None for row in cells for c in row)))
    if not check:
        open(path, "w", encoding="utf-8").write(out)
    return False


def main(argv):
    check = "--check" in argv
    files = targets(argv)
    if not files:
        raise SystemExit(__doc__)
    print("flattening %d drawing(s)%s" % (len(files), " (--check: nothing will be written)" if check else ""))
    changed = [f for f in files if not flatten(f, check)]
    if not changed:
        print("nothing to do - every drawing is already plain grid rects.")
        return 0
    """
    EXIT 1 ON --check WHEN SOMETHING WOULD CHANGE, so this can stand in a gate without a second
    script reading its output. A run that writes exits 0: it fixed what it found, which is success.
    """
    print(("%d would be rewritten. Run `npm run art`." if check else
           "%d rewritten. Re-run `npx vitest run src/ui/art.test.ts`.") % len(changed))
    return 1 if check else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
