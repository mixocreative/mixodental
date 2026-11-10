# Icons

Every icon in the app is one SVG file in this folder. To change an icon, replace its file. No code change is needed.

## The list is not here any more

`src/ui/iconCatalogue.ts` is the list: every file, the slot it draws in, where it came from, and where the
operator meets it. **The style book renders it** - `npm run dev` then `/mixodental/kit.html`, or
`npm run screens` for `.stitch/screens/icons.html` - with each icon shown at its real size, resting and
pressed, beside the path of the file to edit.

A table lived here instead and had already rotted: `drop-file`, `next` and `restore` were shipping and were
not in it, because a table in a README is checked by nobody. `src/ui/iconCatalogue.test.ts` fails when a file
has no entry or an entry has no file, so that cannot happen again.

## Two sets, and the folder is the rule

| | `assets/icons/` (here) | `assets/art/` |
| --- | --- | --- |
| Drawn by | `src/ui/Icon.tsx` | `src/ui/Art.tsx` |
| Colour | **one ink** - every fill and stroke becomes `currentColor` | **its own**, kept as drawn |
| Grid | 24 | 48, on a 480 artboard |
| Shown at | 24px (1x) - `--pixel-icon-inline` | 144px (3x) - `--pixel-icon-key` |
| For | tool and cursor glyphs beside a word | the art on a choice key: an item type |

One ink is not a limitation for a glyph beside a word, it is the point: it inverts with its key and can
never be off-palette. It IS a limitation for a picture of an object - six rounds of drawing the item
types in a single colour produced an archway every time, because the teeth, the keyline and the shading
are the whole of what makes a dental arch readable. Those moved to `../art/`; this folder is unchanged.

**A pixel-art file is shown at a whole multiple of ITS OWN grid or not at all.** At any other size each
fake pixel straddles a real one and the edges blur, which reads as a badly DRAWN icon when it is only a
badly SIZED one. The rail's three icons sat at the shared `.tool-icon` 18px for a while - 0.75 of a CSS
pixel each - and no redrawing would have fixed them. `src/ui/icons.test.ts` holds this folder's grid and
both tokens; `src/ui/art.test.ts` holds the other folder's. 24px is also Material's standard icon size
and the WCAG 2.5.8 minimum target, so the rule and the convention agree here.

**Four files here are generated, not drawn.** `tool-rim.svg`, `tool-area.svg`, `tool-supports.svg` and
`cursor-rim.svg` come out of `scripts/pixel-icons.mjs` - `node scripts/pixel-icons.mjs` writes the ones
that do not exist yet, `--preview` prints them as text and writes nothing, and `--force` overwrites.
**A hand edit to those four survives** unless someone passes `--force`: the files are the source.

## Where a new icon comes from

Do not draw one by hand. Lucide is 2313 icons already drawn to this app's house style - `0 0 24 24`,
`fill="none"`, `stroke="currentColor"`, round caps and joins - so take one from there:

```
npm run icons:add -- arrow-left back      # lucide's "arrow-left", saved here as back.svg
npm run icons:add -- trash-2              # keeps lucide's own name
```

Browse the set at <https://lucide.dev/icons>. The script copies the file in and puts it in house style on the
way: it takes `width` and `height` off the root (the size comes from the app's CSS) and sets the stroke to the
house 1.7, so a Lucide icon sits beside the hand-drawn dental ones without looking heavier.

`lucide-static` is a DEV dependency and nothing imports it, so the app ships only the icons it uses. The copy
keeps Lucide's licence line (ISC). The dental icons - the aligner and the denture - are the owner's own
drawings, because no icon set has those.

`src/ui/icons.test.ts` holds this folder to the rules below.

## Rules for a replacement

- Keep the same file name. The app finds the icon by name.
- Keep a square-ish `viewBox` (for example `0 0 24 24`).
- Draw with `stroke="currentColor"` and `fill="currentColor"` (or `fill="none"`). Never use a fixed colour. The app colours the icon from the text colour around it, so it turns paper-coloured on a pressed button.
- Draw in outline only. The set is line art in one colour, and a filled shape beside outlined ones reads as a different kind of thing, so a fill is never used to single an icon out.
- The choice-key icons share one `viewBox` (`0 0 300 300`) and one art size in the CSS (`.choice-key-art`), so every big choice looks like one set. A replacement keeps that box.
- Do not put `width` or `height` on the root `<svg>`. The size comes from the app's CSS.
- No embedded bitmaps (no `<image>`, no base64 PNG or JPEG). Vector paths only.
- One root `<svg>` per file. Comments are allowed.

## Drawing a new one

Most icons here come from [lucide](https://lucide.dev) (`lucide-static`, already a dependency), and the
table above names the lucide icon behind each. Reach for lucide first: it has the common concepts and
they already agree with each other. These rules are for the ones it cannot supply, which here means the
dental ones - an aligner, a denture, a print-orientation box.

- **Pick a keyline and fill it.** Decide whether the icon is a circle, a square, a wide rectangle or a
  tall one, and let the main body fill that shape in at least one direction. Without this a "document"
  and a "globe" end up looking like different sizes even though both are 24x24.
- **Organic shapes may overshoot by about a unit.** A cloud or a row of gear teeth reads smaller than a
  square of the same bounds, so let it break the keyline slightly rather than look shrunken.
- **Nothing smaller than about 2.4 units** (roughly 1.9px at 24px). A dot, a tick or a tiny marker below
  that turns to mush: enlarge it, or leave it out.
- **A gap is either zero or at least 2 units.** Anything in between reads as a rendering fault rather
  than a deliberate space.
- **The arrowhead is one solid triangle** over the end of its shaft, never several strokes meeting at a
  point, which blurs at small sizes.
- **Draw the object, not the idea.** A literal thing the eye recognises at once. No figurative metaphors
  - do not run a clock backwards to mean "history".
- **Check it beside its neighbours, at the size it is actually used.** Screenshot them together.

### Stroke weight follows the RENDERED size, not the file

The family is `stroke-width="1.7"` on a 24 grid, with round caps and joins. That is a rule about how
thick the line LOOKS, so an icon drawn at a different size or shown at a different size needs a
different number to match:

| Icon | Grid | `stroke-width` | Shown at | On screen |
| --- | --- | --- | --- | --- |
| the Lucide line glyphs | 24 | 1.7 | 14-20px | ~1.3px |
| `warning.svg` | 24 | **2** | 14px | ~1.2px |

So `warning.svg` is not an outlier to be tidied away: at 14px a 1.7 would come out near 1.0px and look
thin and broken beside everything else. **Before changing a weight to match the table, work out what it
renders at.** None of this binds the pixel-art icons, which have no strokes at all - they are whole fake
pixels and nothing else, which is what `src/ui/icons.test.ts` checks.

## See your change

1. Run `npm run dev` from the project folder.
2. Open the app in the browser. Save your SVG file. The app reloads and shows the new drawing.

## What is still missing

Gathered from the code on 2026-11-10, not from a wishlist: each row below is a control that exists and
has no drawing, or one the code says in a comment it is waiting for.

### Done: the deck rail, and the three item types (2026-11-10)

The rail's three icons and the three start-screen item types are drawn, and the rail uses them with the
word kept beside each - the rail is where the operator learns the four steps, and a bare glyph teaches
nobody. All seven are pixel art on the 24 grid; the item types are the isometric Rule B drawings and the
rail's are flat Rule A. `npm run screens` renders `deck-tool-rail.html`, the only way to see the rail in
all four states without importing a model.

### Item kinds

`aligner`, `denture` and `generic` exist (the three start-screen choices). A proposal on 2026-11-10
adds nine more, in two tiers: **retainer, surgical guide, night guard** (v2), then **crown & bridge,
custom abutment, wax-up, gingiva mask, bracket transfer tray, impression tray** (v3). None is needed
until the app can actually prepare that item — an icon for a kind the pipeline cannot build is a
promise the app does not keep.

When one is drawn it follows **Rule B** and the three that exist: pixel art on the 24 grid, isometric,
built around the ONE feature that tells it from its neighbours. In a single colour almost all of these
are the same horseshoe, so that feature is the whole icon — the aligner is thin, the denture has bulk
and a tooth row, the model has a plinth, and a retainer would be the one with a wire across the opening.
`scripts/pixel-icons.mjs` has the arch builder; `--preview` prints a drawing as text and writes nothing,
which is the only honest way to judge one before it ships.

### Actions that are words today

No icon, and most do not need one — listed so the choice is deliberate rather than forgotten. From the
two command registries (`src/dental/editingMode.ts`, `editing/commands.ts`):

- **Dental flow:** Auto orientation (has `orient`), Next (`next`), Back (`back`), Exit, OK, Export STL,
  Close loop, Clear, Delete point, Done
- **Editor:** Undo, Redo, Save, Open, Delete, Generate, Fit view, Bottom view, Wireframe, Check

### Cursors, which are icons too

`src/components/viewport/style.ts` draws four, coloured from tokens rather than drawn per theme:
**select**, **unselect**, **paint**, **erase**. The rest of the app uses a native cursor — `crosshair`
where a click places something, `grab` off the model where a drag orbits, `default` for Select.

**Rim define mode is the fifth, and the only one drawn as a file** - `cursor-rim.svg`, built into a
cursor by the same module. It exists because the press there means three different things (drag a
point, insert one on the line, add one at the end) and the system `crosshair` said none of them; the
open square at the centre says "a point lands here", and the hot spot is that square.

Being a file is what makes it replaceable by a designer, unlike the four above - the module writes the
theme's `--cursor-outline` into it and gives it a real pixel size, because a standalone SVG has no
`currentColor` to inherit and a data-URI cursor needs a size. A malformed one does NOT throw: the
browser falls back to the keyword after the comma, which is the plain crosshair this replaced, so the
failure would look exactly like the feature never shipping. `src/components/viewport/cursorStyle.test.ts`
is there for that.
