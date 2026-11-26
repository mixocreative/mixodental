# geocore: five aligner scans that do not build

Written 2026-11-27 from the owner's samples (`samples/aligner/g`, git-ignored patient data, named here by the first
8 hex of each scan's SHA-256 only). For the geocore repository: every failure below is decided in the engine, which
this repo consumes as built (`vendor/mixo-geocore`, engine 71) and never edits.

## What the operator meets

16 aligner scans, 8 with a supported `-sup` target. Each of the 5 below has a target that now lines up with it
(`scripts/extract-sup-contacts.py`, 2026-11-27), so it could be compared - but the scan itself never builds, and the
Type Lab can only say why. The other 11 build clear.

| scan | stops at | engine reason |
|---|---|---|
| `4d3c901b` | Step 1, orientation | `non-manifold-or-degenerate-mesh` |
| `b65c27bb` | Step 1, orientation | `no-trim` |
| `c4169915` | Step 1, orientation | `no-trim` |
| `10f40a06` | after Step 1 (open arch, up/down agrees) | `diagnostic-band-invalid-face-graph` (aligner with attached parts) |
| `dae3a95d` | after Step 1 (open arch, up/down agrees) | `surface-region-not-isolated` |

## What was measured (trimesh, welded; full table in the session's handoff)

Every one of the 16 scans is closed: **no open edges**.

1. **`4d3c901b` - two pinch points in an otherwise normal aligner.** One piece, 343,730 faces, no duplicate
   triangles, 2 non-manifold edges - each shared by 4 tiny faces (0.02-0.06 mm2), a pinch a fraction of a millimetre
   across. The owner confirms the shape is an ordinary aligner: a clear rim, a U, one side concave as the fitting side.
   Three scans that BUILD (`76ec63fb`, `53830873`, `6969105a`) carry 2 non-manifold edges too, but in a separate 2-face
   scrap the debris rule drops. So Step 1 refuses a whole scan for two pinch points.
   **Ask:** split the fan at each non-manifold edge in the orientation input (or ignore them below a count), instead of
   refusing.
2. **`b65c27bb`, `c4169915` - no trim edge found.** Both carry an extra watertight piece of 1,628 faces (about 3 mm,
   inside the aligner's box), but **that is not the cause**: with only the largest piece kept, both still return
   `no-trim` (Type Lab run, 2026-11-27). Nor is the trim simply smooth: their edge length sharper than 60 degrees is
   463 and 483 mm, inside the range of scans that build (342-581 mm).
   The owner confirms the rim is plainly visible on them, so the detector misses a real trim, not a missing one.
   **Ask:** run the trim detector on these two with its debug layers and say which test rejects the trim chain.
3. **`10f40a06` - an aligner with attached parts (NOT a broken file; corrected 2026-11-27).** Five real parts: the
   aligner (325,322 faces) and four of 41-47k faces - the owner's hooks and aid structure - plus about 530 stray single
   triangles (532 faces in all) and 263 duplicated triangles. The 447 non-manifold edges are where the attached parts
   meet the aligner. Step 1 orients it as an open arch; the band's face graph then fails. A first reading called it
   "broken, 534 pieces" by counting the stray triangles as pieces - wrong.
   **Ask:** handle an aligner that carries attached parts: find the aligner body and keep the hooks and structures out
   of the band and region graph (drop stray single triangles and duplicates as debris), instead of failing.
4. **`dae3a95d` - region not isolated.** Its mesh is like the scans that build (one piece plus a 2-face scrap, 2
   non-manifold edges in the scrap); it orients as an open arch. The region detector cannot separate the support
   region.
   **Ask:** the debug layers for this case and which boundary leaks.

Scans are identified by hash and judged by their geometry only; their file names are arbitrary labels and say nothing
about the item (owner, 2026-11-27).

## Why the host cannot close it

Detection, orientation and mesh repair are geometry; `typelab/CLI.md` Stage 3 keeps them in the Rust core, and a
host-side stand-in would make the app and the engine disagree. The host already names each reason in plain words
(`typelab/reasons.json`), so nothing here dies silently.

## How to reproduce

`node typelab/cli.mjs --kind aligner samples/aligner/g` (each failing case lists its reason); the scan with a given hash
is found with `sampleByContent` (`scripts/samples.mjs`).
