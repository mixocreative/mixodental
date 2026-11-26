# geocore: five aligner scans that do not build

Written 2026-11-27 from the owner's samples (`samples/aligner/g`, git-ignored patient data, named here by the first
8 hex of each scan's SHA-256 only; file names are arbitrary labels and say nothing about the item). **Rewritten the same
day** to the placement rules of `docs/GEOCORE-BOUNDARY.md` (agreed by Fable and Codex, awaiting the owner): the first
version asked geocore to fix all five, which over-asked - only generic mesh work and evidence belong to geocore; the
dental sequence and its numbers are mixodental's.

## What the operator meets

16 aligner scans, 8 with a `-sup` target. Each of the 5 below has a target that lines up with it, but the scan never
builds in the Type Lab, so it cannot be compared. The other 11 build clear.

| scan | stops at | reason | whose |
|---|---|---|---|
| `4d3c901b` | Step 1 | `non-manifold-or-degenerate-mesh` | geocore core (generic repair) |
| `b65c27bb` | Step 1 | `no-trim` | geocore: evidence first |
| `c4169915` | Step 1 | `no-trim` | geocore: evidence first |
| `10f40a06` | the Type Lab's review | `diagnostic-band-invalid-face-graph` | **mixodental** - FIXED, now builds |
| `dae3a95d` | after Step 1 | `surface-region-not-isolated` | geocore: evidence first |

## What is asked of geocore (and only this)

1. **`4d3c901b`, two pinch points (rule 1: generic, existing geometry first).** One piece, 343,730 faces; 2 edges each
   shared by 4 tiny faces. The owner confirms an ordinary aligner (clear rim, U, concave fitting side). The refusal is
   generic: `Context::build` needs exactly two faces per edge (`crates/geometry-core/src/surface/edge_topology.rs:95`).
   Wedge pairing already exists (`core/wedge.rs:29-73`, used by `repair/topology.rs:87-110`). **Ask:** run this scan
   through the existing pairing and repair; if it comes out closed and two-manifold, provide it as an analysis mesh
   with a face and vertex map. The imported model and its face ids stay untouched. No new "tolerate N edges" number.
2. **`b65c27bb`, `c4169915`, no trim (rules 2 and 7: evidence before a fix).** `outer_contour` returns a bare `Option`
   (`dental/contour.rs:61-69`) and `trim_frame` collapses two failures into `NoTrim` (`dental/trim/mod.rs:141-143`).
   The owner confirms the rim is plainly visible. Ruled out here: the 3 mm extra piece (removed, still `no-trim`) and a
   smooth trim (sharp-edge length 463/483 mm, inside the 342-581 mm of scans that build). **Ask:** a reason code and
   evidence layers saying which test rejects the trim. A threshold change, if the evidence names one, is a type value
   mixodental supplies - not an engine edit.
3. **`dae3a95d`, region not isolated (same).** `classify_faces` collapses several failures into one `None`
   (`dental/region.rs:65-69,109-122,178`). **Ask:** reason codes and evidence.

## Ours, not geocore's

**`10f40a06`, an aligner with attached hooks and an aid structure.** Five real parts plus about 530 stray single
triangles. The engine already takes the largest part as the aligner and fuses touching attachments
(`dental/aligner_parts.rs:1-12`), and the region IS found: the failure is raised by our own review script, which then
draws a diagnostic band over the whole file (`scripts/dental-region-review/build.ts:79-86`) and that band needs a
two-manifold face graph (`surface/side_bands.rs:70-79`). **Fixed in mixodental, 2026-11-27:** a band that cannot be drawn
no longer fails the review; the case records `diagnosticNote` ("diagnostic band not drawn: invalid-face-graph") and
builds - clear, 124 tips, target compared at 70.6% covered / 40.4% outside. Nothing is asked of the engine for it. Not
yet checked: the same scan through the app's own Step 1-3 in the browser.

## How to reproduce

`node typelab/cli.mjs --kind aligner samples/aligner/g` lists each failing case's reason; `sampleByContent`
(`scripts/samples.mjs`) finds a scan by its hash.
