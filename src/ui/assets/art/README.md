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

1. **64 x 64 grid, `viewBox="0 0 640 640"`, every number a multiple of 10.** `src/ui/art.test.ts` fails
   otherwise. That is what keeps it crisp at 128px: two real pixels per fake one, exactly.
2. **No `width` or `height` on the root.** The CSS sizes it.
3. **A keyline.** A dark outline round the silhouette is most of why pixel art reads on a pale key.
4. **Few colours.** Ten or so. More does not survive the grid and makes the file large for nothing.
5. **It must read at 128px**, not only when you zoom in. Judge it in the style book, on a key, before
   it ships — that is the step that was skipped when an earlier set went in and had to come out again.

## Where these came from

Traced from the owner's own reference sheet with `scripts/trace-art.py`: crop, average down to the grid,
quantise to a small palette, emit one `<g>` per colour. Tracing rather than generating is deliberate.
A generator draws the abstract rail glyphs well because there is no correct look to miss; an object that
has to be RECOGNISED needs per-pixel judgement, and `scripts/pixel-icons.mjs` records what six rounds of
trying to compute one produced instead.
