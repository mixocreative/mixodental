# Icons

Every icon in the app is one SVG file in this folder. To change an icon, replace its file. No code change is needed.

## The icons

| File name | Where it appears |
| --- | --- |
| `aligner.svg` | Start screen, first big choice: **Aligner** |
| `denture.svg` | Start screen, middle big choice: **Denture** |
| `generic.svg` | Start screen, third big choice: **Any model** |
| `back.svg` | Start screens, the way back: the arrow in the top-left corner |
| `tool-paint.svg` | Step 2 area tools: **Paint** (lucide `paintbrush`) |
| `tool-erase.svg` | Step 2 area tools: **Erase** (lucide `eraser`) |
| `tool-add.svg` | Step 2 area tools: **Add** (lucide `circle-plus`) |
| `tool-select.svg` | Step 2 area tools: **Select** (lucide `lasso-select`) |
| `tool-pointer.svg` | Edit bar, "How to select" switch: **Click** (pick one support at a time) |
| `tool-brush.svg` | Edit bar, "How to select" switch: **Drag over** (paint many supports at once) |
| `orient.svg` | Orientation bar, Auto orientation button (the box with a turn arrow) |
| `warning.svg` | Viewport, unresolved-point bubble: a support tip, lowest point or island that still has no support (the warning triangle) |

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
| the tool icons | 24 | 1.7 | 18-19px | ~1.3px |
| `warning.svg` | 24 | **2** | 14px | ~1.2px |
| `aligner`, `denture`, `generic` | 300 | **10** | `.choice-key-art` | ~1.3px |

So `warning.svg` is not an outlier to be tidied away: at 14px a 1.7 would come out near 1.0px and look
thin and broken beside everything else. Same for the 300-grid choice icons. **Before changing a weight
to match the table, work out what it renders at.**

## See your change

1. Run `npm run dev` from the project folder.
2. Open the app in the browser. Save your SVG file. The app reloads and shows the new drawing.

## What is still missing

Gathered from the code on 2026-11-10, not from a wishlist: each row below is a control that exists and
has no drawing, or one the code says in a comment it is waiting for.

### Blocked on a file, and already decided

`src/deck/ToolRail.tsx` says it plainly: *"`src/ui/assets/icons/` has `orient` and nothing for the
other three, and the icon system is file-driven precisely so a designer owns those drawings rather
than code inventing them. One icon beside three bare words looks broken, so all four are words until
the files exist."*

| Needed | For |
| --- | --- |
| `tool-rim.svg` | Deck rail: **Rim** |
| `tool-area.svg` | Deck rail: **Area** |
| `tool-supports.svg` | Deck rail: **Supports** |

Three files turn the deck rail from words into the icon rail it was designed as. Nothing else in the
app is waiting on an icon this directly.

### Item kinds

`aligner`, `denture` and `generic` exist (the three start-screen choices). A proposal on 2026-11-10
adds nine more, in two tiers: **retainer, surgical guide, night guard** (v2), then **crown & bridge,
custom abutment, wax-up, gingiva mask, bracket transfer tray, impression tray** (v3). None is needed
until the app can actually prepare that item — an icon for a kind the pipeline cannot build is a
promise the app does not keep.

### Actions that are words today

No icon, and most do not need one — listed so the choice is deliberate rather than forgotten. From the
two command registries (`src/dental/editingMode.ts`, `editing/commands.ts`):

- **Dental flow:** Auto orientation (has `orient`), Next (`next`), Back (`back`), Exit, OK, Export STL,
  Close loop, Clear, Delete point, Done
- **Editor:** Undo, Redo, Save, Open, Delete, Generate, Fit view, Bottom view, Wireframe, Check

### Cursors, which are icons too

`src/components/viewport/style.ts` draws four, coloured from tokens rather than drawn per theme:
**select**, **unselect**, **paint**, **erase**. Everything else uses a native cursor — `crosshair`
where a click places something, `grab` off the model where a drag orbits, `default` for Select.

The gap: **rim define mode borrows `crosshair`** for every press, though the press means three
different things there (drag a point, insert one on the line, add one at the end). If any cursor is
worth drawing next after the rail, it is that one.
