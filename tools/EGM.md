# tools

## Overview

Offline developer tools that run inside Blender rather than in the web app. They produce committed data that the web code or its tests read: Blender parity oracles for the support generator, and the label font glyph data. Nothing here is bundled into the app or run by `npm test`; the tests only read the outputs.

## Subdirectories & Boundaries

- blender-parity: [./blender-parity/EGM.md](./blender-parity/EGM.md) - headless Blender scripts that record Resin UV (`mixo3d` add-on / SLASG) support, scatter, ridge and remesh output into JSON fixtures replayed by Vitest parity suites in `src/core/supports` and `src/supports`.
- fonts: [./fonts/EGM.md](./fonts/EGM.md) - the Inter Regular label font (shared with the add-on) and `export_label_font.py`, which writes `src/core/supports/labelFont.json`.

## Global Invariants

- Generated JSON is an oracle: regenerate it with the script, never hand-edit it, and rerun `npm test` afterwards.
- Scripts take their arguments after `--` on the Blender command line and need a local Blender install and, for parity scripts, a local `mixo3dtool` checkout.

## Verification

- Run: `npm test`
