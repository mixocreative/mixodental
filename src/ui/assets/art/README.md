# Art — the coloured pixel-art set

**This folder is the rule.** A file here keeps its own colours; a file in `../icons/` is rewritten to one
ink. Nothing else distinguishes them, which is why they are separate folders rather than a flag.

| | `assets/icons/` | `assets/art/` (here) |
| --- | --- | --- |
| Drawn by | `src/ui/Icon.tsx` | `src/ui/Art.tsx` |
| Colour | every fill and stroke becomes `currentColor`, so it takes the colour of the place it sits in | **its own**, kept exactly as drawn |
| Grid | 24 | **64**, on a 640 artboard — a fake pixel is ten units on both |
| Shown at | 24px (1x) | **128px (2x)** — `--pixel-icon-key` |
| Used for | tool and cursor glyphs beside a word | the art on a choice key: an item type |

**Why two sets at all.** A glyph beside a word has to invert with its key and can never be off-palette, so
one ink is not a limitation there, it is the point. An item type is a PICTURE OF A THING, and six rounds of
one-ink drawing proved that a dental arch in a single colour is indistinguishable from an archway. Colour,
a keyline and a few tones are what make it read.

## Rules for a file here

Each is held by a test in `src/ui/art.test.ts`, and each was proved by breaking a file on purpose and
watching the test fail.

1. **64 x 64 grid, `viewBox="0 0 640 640"`, every rect coordinate a multiple of 10.** That is what keeps
   it crisp at 128px: two real pixels per fake one, exactly.
2. **No `width` or `height` on the root.** The CSS sizes it.
3. **A clear black outline**, one cell thick, round everything. A broken or pale keyline is what makes
   pixel art read as a smudge rather than an object, and it is the first thing to go when a file is
   re-exported from a drawing tool.
4. **No shadow.** A cast shadow implies a light source and a ground plane that an icon on a key does not
   have, and it spends colours saying so. The tracer removes it by topology: flood in from the border,
   and anything the flood reaches is outside the outline, which is where a shadow is by definition.
5. **Everything inside the outline is a solid colour.** No see-through cells in the middle of the
   object - the key's paper must never show through the drawing. An opening that really IS open, like
   the mouth of a U, reaches the edge of the artboard and is not a hole.
6. **At most five colours**, one of them the outline. More does not survive the grid: at this size
   near-duplicate tones read as noise rather than as shading.
7. **It must read at 128px**, not only when you zoom in. Judge it in the style book, on a key, before it
   ships - that is the step that was skipped when an earlier set went in and had to come out again.

## Where these came from

Traced from the owner's own reference sheet:

```
python scripts/trace-art.py <sheet.webp> src/ui/assets/art/<name>.svg <name> <x0,y0,x1,y1>
```

It averages down to the grid, despeckles, drops everything the outline does not enclose, quantises what
is left to four colours, and draws the outline last. The header of that script says why each step is
there - every one of them is a thing the step before it got wrong. Tracing rather than generating is deliberate.
A generator draws the abstract rail glyphs well because there is no correct look to miss; an object that
has to be RECOGNISED needs per-pixel judgement, and `scripts/pixel-icons.mjs` records what six rounds of
trying to compute one produced instead.
