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

## See your change

1. Run `npm run dev` from the project folder.
2. Open the app in the browser. Save your SVG file. The app reloads and shows the new drawing.
