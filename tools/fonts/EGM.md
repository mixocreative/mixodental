# Label font

## Overview

Holds the single font used for raft label letters (Inter Regular 4.1, static, overlaps removed; SIL OFL 1.1) and the Blender script that exports its glyphs as triangle meshes for the web editor. The add-on (`mixo3d/assets/fonts/Inter-Regular.ttf` in mixo3dtool) and the web editor must use this same file so labels match. Provenance, hashes and the reasons for the static file are in [README.md](./README.md); licence in [LICENSE-Inter.txt](./LICENSE-Inter.txt).

## Interface

- `export_label_font.py` - run as `blender --background --factory-startup --python tools/fonts/export_label_font.py -- src/core/supports/labelFont.json`.
  - `CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-"`: the glyph set exported.
  - Per character: String to Curves (size 1, align Left / Top Baseline) -> Realize Instances -> Fill Curve (Triangles), giving vertices, triangles and the advance width (pen position of a following "H").
  - Output JSON: metadata including `capHeight` (top of "H" at size 1, 0.50871) plus `glyphs`.
- `Inter-Regular.ttf` - font asset loaded by the script from its own directory.
- Consumer: `src/core/supports/labelFont.ts` reads `src/core/supports/labelFont.json`.

## Invariants

- The TTF must stay byte-identical to the add-on copy and to the SHA-256 recorded in README.md; do not substitute Blender's bundled variable `Inter.woff2` (its overlapping contours punch holes under even-odd fill).
- Letter Size is the capital height: String to Curves gets `Size / capHeight`.
- Regenerate `labelFont.json` with this script whenever the font or `CHARS` changes; do not hand-edit it.

## Side Effects

- Overwrites the output JSON path given after `--` (normally `src/core/supports/labelFont.json`).
- Exits with an error if `Inter-Regular.ttf` is missing beside the script.
- Requires a local Blender (README records 5.2.0 LTS); no network access.

## Verification

- Run: `npm test` (Vitest; exercises `src/core/supports/labelFont.ts` and the raft label geometry).
