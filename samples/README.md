# Samples

**These are the real scans. Keep them.** Everything under `typelab/output/` is a result made FROM them and can be
made again; these cannot. Nothing in the tooling copies, moves or changes them: the Type Lab, the batch and the gates
all read them where they are. The case folders are git-ignored (patient data); only this README is tracked.

## The naming rule - read this before using any file here

| file | what it is | run as a case? |
|---|---|---|
| `<name>.stl` (or `.glb`, `.gltf`) | a bare scan | **yes** |
| `<name>-sup.stl` | the SAME scan with supports made by the owner's professional dental software: **the target** | **never** |
| `<name>-sup.contacts.json` | where those supports touch the bare scan, in the bare scan's frame (format below) | no - data |

**A `-sup` file is the target to work toward** (owner's rule, 2026-11-26). When asked to rebuild a result with our
nodes, to make a new type or to revise a setup, compare what we build on `<name>` with what `<name>-sup` shows -
contact places, spacing, directions - and work toward it. It is a target, not gospel: where it breaks one of our own
rules (every tip supported, clearance, plate-only for dental, peel safety), ours wins and the difference is said, not
copied. Never name the program that made it.

**A `-sup` file is NEVER run as a scan.** It is the bare scan PLUS hundreds of support pieces; read as a case, those
pieces look like "small parts of the denture" (this cost an afternoon of wrong rule work on 2026-11-21). The Type Lab
(`typelab/scanSet.mjs`) and the measuring scripts skip it by its name, which is why the suffix must be exactly `-sup`
on the same name as its bare scan.

To add a sample: put the bare scan and, when there is one, its supported version as `<same name>-sup.<ext>` in a
`case-*` folder.

## What is here

| folder | what it holds | used by |
|---|---|---|
| `case-denture/` | 3 denture scans, each with its `-sup.stl` target and `-sup.contacts.json` | `gate:real` (denture), the Type Lab |
| `case-aligner/` | 8 aligner and retainer scans | `gate:real` (aligner) |
| `case-emaaligner/` | 2 multi-part aligner scans | `gate:real` (multipart) |
| `case-loose/` | one aligner scan that sat at the project root until 2026-11-26; in no gate | import it by hand |
| `case-001/` | the public reference aligner (`aligner.stl`), its supported target (`aligner-sup.stl`) and contacts | `compare_supported.py` below |

## Testing with them

- **The Type Lab (try a type or an edit):** `npm run review`, open http://127.0.0.1:6705/, **Import folder** and
  pick `samples/case-denture` (or **Import files** for single scans, or paste a path), pick a type, **Run all**.
  `-sup` files are kept aside as targets, never run. Results go to `typelab/output/review-cache/`; **Clear** empties
  only that folder.
- **The real-scan gate (after any engine change):** `npm run gate:real` - every case folder above against
  `scripts/baselines/real-scan-baseline.json`.
- **A rule override:** `npm run typelab -- --kind denture --set overhangAngleDeg=55 samples/case-denture --open`
  writes a `bench-<date>` folder.
- **A plain batch:** `typelab/run-batch-review.bat` with one of these folders, or
  `npx vite-node --script typelab/batch.ts --out typelab/output/batch-test samples/case-denture`
  writes a `batch-<date>` folder.

The `batch-*`, `bench-*`, `jig-*` and other folders in `typelab/output/` are those earlier results: the supported
GLBs, `summary.json` and the peel files, no scans. The Type Lab still opens one (drop it on the page, or
`typelab/view-batch-review.bat`). Deleting them loses only the record of that run.

## case-001, the public reference

STL geometry can identify a patient even when file names and binary headers are neutralized. Do not publish a new
case or derived geometry without the owner's explicit approval. The approved public reference remains at
`docs/dental-reference/reference-aligner.stl`; its local `case-001/aligner.stl` copy is for side-by-side comparison.

`case-001/aligner-sup.stl` is a local, header-neutralized copy of the owner-supplied supported result. Its triangle
records were preserved, and the source download was not changed. Reproduce aggregate measurements without exporting
geometry:

```sh
python scripts/dental-reference/compare_supported.py --aligner samples/case-001/aligner.stl --supported samples/case-001/aligner-sup.stl
python -m unittest discover -s scripts/dental-reference -p 'test_*.py'
```

Current case-001 measurements: the supported shell is lifted 3.5 mm from the plate; 371,827 of 373,956 original shell triangles match after that translation. The comparison finds 90 simple plate-to-shell columns, most with a 1.5 mm shaft; median nearest-neighbor spacing among those columns is 2.545 mm (10th–90th percentile 1.892–3.366 mm). One inspected straight column has a terminal segment about 0.45 mm across. These dimensions describe the example **only**. The owner permits using its support diameter as a dental-specific starting point, but explicitly wants to **retain the app's existing raft design**. Shaft and contact-end diameters must be evaluated separately before selecting a preset. The comparator does not fully segment branch contacts or contact-to-shell penetration. A separate nearest-curve check found 88/90 column tops within 0.5 mm of the already detected outer or middle contour; this is approximate, not a guarantee that a particular adjacent face band is safe.

An additional local 3D triangle-distance check found 89/90 column tops within 0.4 mm of the diagnostic non-opening-side strips. Forty were distinctly closer to those strips, 45 were within 0.1 mm of both sides of a ridge, and five were distinctly closer to an opening-side strip. These are evidence for a narrow ridge-adjacent strategy, **not** proof that every contact or support body is safe.

For another case, create a new `case-*` directory, keep the source outside Git, and neutralize the first 80 bytes of each binary STL header with `scripts/prepare-dental-reference.mjs`. Record comparison measurements in the tracked handoff without names or original source paths.

## Support contact files (`*-sup.contacts.json`)

For every `<name>-sup.stl` that has a bare partner `<name>.stl` beside it, `scripts/extract-sup-contacts.py` writes `<name>-sup.contacts.json` in the same (git-ignored) folder. Format `mixo-sup-contacts/1`: `bare` and `sup` file names, `frame` ("bare scan coordinates, mm"), `transform_bare_to_sup` (4x4), `registration` ("exact" or "icp"), `rms_mm` (plus `rms_flag_over_0.02_mm` when above 0.02 mm), `contacts` (`[x,y,z]` points where supports touch the bare surface), `normals` (bare surface normal at each contact), `touch_rule` ("tip-piece nearest point <= 1.0 mm": each non-denture support piece contributes its nearest point to the bare surface, accepted at 1.0 mm or less and projected onto the surface), `cluster_mm` (1.0) and `touch_mm` (1.0). Run it as `python -I scripts/extract-sup-contacts.py samples`. The scans are read in place and never modified; the JSON files stay local like the scans.
