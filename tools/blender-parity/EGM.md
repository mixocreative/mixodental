# Blender parity harness

## Overview

Blender-side recorders for the parity goal: the same settings must give the same supports in Resin UV (the `mixo3d` Blender add-on, repo `mixo3dtool`) and in the web editor. Each Python script runs headless inside Blender, builds a fixed fixture model, runs the add-on or one of its bundled SLASG Geometry Nodes groups, and writes the numbers to a committed JSON fixture. Vitest suites under `src/` replay those fixtures through the web generator without needing Blender. See [README.md](./README.md) for the human guide and the support/raft rules the probe confirmed.

None of these scripts are imported by the web app; they are offline generators of test oracles.

## Interface

Every script is run as `blender --background --factory-startup --python tools/blender-parity/<script> -- <args>`; arguments after `--` are read from `sys.argv`.

| Script | Arguments after `--` | Output (committed as) | Consumed by |
|---|---|---|---|
| `probe.py` | `<mixo3dtool repo> <out.json>` | `reference.json` (+ `reference.blend` beside it) - contacts, touch spheres, support pieces, raft profile per settings case (`CASES`) on a 6x6x3 apex-down pyramid | `src/core/supports/blenderCases.test.ts`, `blenderNecks.test.ts`, `blenderRoof.test.ts`, `blenderTree.test.ts`, `src/core/imports.test.ts` |
| `probe_safe.py` | `<mixo3dtool repo> <out.json>` | `reference_safe.json` - Auto Tree contacts and scatter graph on a C-profile ledge for several Safe Distance values | `src/core/supports/blenderSafe.test.ts` |
| `minima_dump.py` | `<slasg.blend> <out.json>` | `minima_stages.json` - SLASG_VertexScatter island-minima stages on the mushroom fixture | `src/supports/blenderMinima.test.ts` (also cited in `src/core/analysis/placement.ts`) |
| `ridge_dump.py` | `<mixo3dtool root> <out.json>` | `ridge_stages.json` - legacy SDF ridge branch stages on the v-ridge keel for Ridge Angle 30/45/60 | `src/core/supports/blenderRidges.test.ts` |
| `edge_order_dump.py` | `<mixo3dtool root> <out.json>` | `edge_order_stages.json` - Grid to Mesh face/edge order on a 1.25x v-ridge (base64 Uint16 arrays) | `src/core/supports/blenderRidges.test.ts` |
| `remesh_dump.py` | `<out.json> <voxel> <adaptivity>` | `remesh_spike.json` (voxel 0.8, adaptivity 0) - SLASG_Line SDF remesh vertices of the probe spike | `src/core/supports/remesh.test.ts` (target of `src/core/supports/remesh.ts`) |
| `dump_nodes.py` | `<mixo3dtool repo> <out dir>` | `<group>.txt` per Geometry Nodes group, `index.txt`, `dump.blend` (not committed here) | Manual inspection |

Other committed data: `mushroom_contacts.json` (read by `src/supports/blenderParity.test.ts`; no generator script in this folder), `reference.blend` / `reference.blend1` (Blender save of the probe scene).

## Invariants

- Fixture geometry in each script must match its replaying test: the pyramid in `probe.py`/`remesh_dump.py`, the mushroom (20x20x4 cap over 4x4x10 stem) in `minima_dump.py` and `blenderParity.test.ts`, the v-ridge keel of `src/goldens/fixtures.ts` in `ridge_dump.py`/`edge_order_dump.py` (web `(x, y, z)` is Blender `(x, -z, y)`).
- Coordinates in stage dumps are Blender's (Z up) exact float32 values; the web tests convert axes, not the dumps.
- `slasg.blend` from the add-on is read only, never saved (`ridge_dump.py`, `edge_order_dump.py`, `minima_dump.py`).
- After changing the add-on, regenerate the affected JSON and run `npm test`; the JSON files are the oracle, so do not hand-edit them.
- Known gap (from README): SLASG's pillar-repulsion step is not replicated; the cases test counts those supports instead of comparing them.

## Side Effects

- Writes the output JSON path given on the command line (overwrites).
- `probe.py` also saves a `.blend` next to the output (`OUT.with_suffix(".blend")`); `dump_nodes.py` writes `dump.blend` and text files into its output directory (created if missing).
- `probe.py`, `probe_safe.py`, `dump_nodes.py` import `bootstrap.setup()` from `<mixo3dtool repo>/tests/blender` and enable the `mixo3d` add-on in the Blender session; `ridge_dump.py` puts the add-on root on `sys.path`.
- Requires a local Blender 5.x install; no network access.

## Verification

- Replay (no Blender needed): `npm test` (Vitest; covers every consumer listed above).
- Regenerate example: `& "C:\Program Files\Blender Foundation\Blender 5.2\blender.exe" --background --factory-startup --python tools/blender-parity/probe.py -- S:/ai/mixo3dtool tools/blender-parity/reference.json`, then `npm test`.
