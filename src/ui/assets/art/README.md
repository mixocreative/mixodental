# Art — the coloured pixel-art set

**This folder is the rule.** A file here keeps its own colours; a file in `../icons/` is rewritten to one
ink. Nothing else distinguishes them, which is why they are separate folders rather than a flag.

| | `assets/icons/` | `assets/art/` (here) |
| --- | --- | --- |
| Drawn by | `src/ui/Icon.tsx` | `src/ui/Art.tsx` |
| Colour | every fill and stroke becomes `currentColor`, so it takes the colour of the place it sits in | **its own**, kept exactly as drawn |
| Grid | 24 x 24 cells, 240 artboard | **48 x 48 cells**, 480 artboard — a cell is ten units on both |
| Shown at | 24px (1x) | **144px (3x)** — `--pixel-icon-key` |
| Used for | tool and cursor glyphs beside a word | the art on a choice key: an item type |

**Why two sets at all.** A glyph beside a word has to invert with its key and can never be off-palette, so
one ink is not a limitation there, it is the point. An item type is a PICTURE OF A THING, and six rounds of
one-ink drawing proved that a dental arch in a single colour is indistinguishable from an archway. Colour,
a keyline and a few tones are what make it read.

## Rules for a file here

Each is held by a test in `src/ui/art.test.ts`, and each was proved by breaking a file on purpose and
watching the test fail.

1. **48 x 48 grid, `viewBox="0 0 480 480"`, every rect coordinate a multiple of 10.** That is what keeps
   it crisp at 144px: three real pixels per cell, exactly.
2. **No `width` or `height` on the root.** The CSS sizes it.
3. **A clear black outline, TWO cells thick, and only ONE black.** One cell is three real pixels at 144px
   and reads as a hairline beside art this chunky (six at 144px on the 48 grid, which is why it reads). It grows INWARD - outward would push the drawing past
   the margin - and only the outer silhouette grows: thickening the interior keylines as well closed the
   two-cell gaps between one tooth and the next, and the tooth row became a black band. One black, not
   two: the reference's own keyline is dark, so quantising it with the body spent a slot on a second
   near-black and the edge came out as a hard line with a softer one just inside it.
4. **No shadow.** A cast shadow implies a light source and a ground plane that an icon on a key does not
   have, and it spends colours saying so. The tracer removes it by topology: flood in from the border,
   and anything the flood reaches is outside the outline, which is where a shadow is by definition.
5. **Everything inside the outline is a solid colour.** No see-through cells in the middle of the
   object - the key's paper must never show through the drawing. An opening that really IS open, like
   the mouth of a U, reaches the edge of the artboard and is not a hole.
6. **At most five colours**, one of them the outline. More does not survive the grid: at this size
   near-duplicate tones read as noise rather than as shading.
7. **It must read at 144px**, not only when you zoom in. Judge it in the style book, on a key, before it
   ships - that is the step that was skipped when an earlier set went in and had to come out again.

## Where these came from, and which tool to reach for

**Traced**, from the owner's reference sheet - `aligner`, `denture`, `dental-model`:

```
python scripts/trace-art.py <sheet.webp> src/ui/assets/art/<name>.svg <name> <x0,y0,x1,y1>
```

It averages down to the grid, despeckles, drops everything the outline does not enclose, takes the
outline's own cells as the ink so there is exactly ONE black, quantises the body alone to four colours,
and draws the outline last. The header of that script says why each step is there - every one of them is
a thing the step before it got wrong.

**Generated**, for a shape that is abstract - `generic`, the plain block for "Any model":

```
node scripts/art-block.mjs src/ui/assets/art/generic.svg
```

**Which to reach for.** Trace a thing that must be RECOGNISED - a denture, an aligner, a study model -
because a formula cannot reach the per-pixel judgement that makes it readable: six rounds of computing
a dental arch produced an archway every time, and `scripts/pixel-icons.mjs` records what and why.
Generate a shape that is abstract - a block, a path with handles, a strip with holes - because there is
no correct version to miss and a generator gets the angles exactly right where a hand would wobble.

Either way **the FILE is the source**. Both scripts can be re-run, and a file replaced by hand is just
as valid: the rules above are held by a test, not by whichever script happened to write it.
