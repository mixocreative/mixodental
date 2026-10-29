# Icons

Every icon in the app is one SVG file in this folder. To change an icon, replace its file. No code change is needed.

## The icons

| File name | Where it appears |
| --- | --- |
| `aligner-standard.svg` | Step 0 "Choose the aligner type" card for the standard (reference) aligner: the U-shaped outline with its central opening |
| `tool-pointer.svg` | Edit bar, "How to select" switch: **Click** (pick one support at a time) |
| `tool-brush.svg` | Edit bar, "How to select" switch: **Drag over** (paint many supports at once) |

## Rules for a replacement

- Keep the same file name. The app finds the icon by name.
- Keep a square-ish `viewBox` (for example `0 0 24 24`). The aligner card uses a wide `0 0 120 90` box, so keep its proportions too.
- Draw with `stroke="currentColor"` and `fill="currentColor"` (or `fill="none"`). Never use a fixed colour. The app colours the icon from the text colour around it, so it turns paper-coloured on a pressed button.
- Do not put `width` or `height` on the root `<svg>`. The size comes from the app's CSS.
- No embedded bitmaps (no `<image>`, no base64 PNG or JPEG). Vector paths only.
- One root `<svg>` per file. Comments are allowed.

## See your change

1. Run `npm run dev` from the project folder.
2. Open the app in the browser. Save your SVG file. The app reloads and shows the new drawing.
