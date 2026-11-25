# Dental comparison fixtures

**These are the test scans. Keep them.** Everything else under `dentalwork/output/` is a result made FROM them
and can be made again; these cannot. Nothing in the tooling copies, moves or changes them: the reviewer, the
batch and the gates all read them where they are.

| folder | what it holds | used by |
|---|---|---|
| `case-denture/` | 3 denture scans; each has an owner `-sup.stl` and its `-sup.contacts.json` beside it - a reference, never run as a case | `gate:real` (denture), benchwork, the reviewer |
| `case-aligner/` | 8 aligner and retainer scans | `gate:real` (aligner) |
| `case-emaaligner/` | 2 multi-part aligner scans | `gate:real` (multipart) |
| `case-001/` | the public reference aligner and its supported example | `compare_supported.py` below |

## Testing with them

- **The reviewer (try a type or an edit):** `npm run review`, open http://127.0.0.1:6705/, **Import folder** and
  pick `dentalwork/fixtures/case-denture` (or paste the path), pick a type, **Run all**. `-sup.stl` files are
  skipped as references. Results go to `dentalwork/output/review-cache/`; **Clear** empties only that folder.
- **The real-scan gate (after any engine change):** `npm run gate:real` - every case folder above against
  `dentalwork/baselines/real-scan-baseline.json`.
- **A rule override:** `npm run benchwork -- --kind denture --set overhangAngleDeg=55 dentalwork/fixtures/case-denture --open`
  writes a `bench-<date>` folder.
- **A plain batch:** `run-batch-review.bat` with one of these folders, or
  `npx vite-node --script dentalwork/batch-review/batch.ts --out dentalwork/output/batch-test dentalwork/fixtures/case-denture`
  writes a `batch-<date>` folder.

The `batch-*`, `bench-*`, `jig-*` and other folders in `dentalwork/output/` are those earlier results: the
supported GLBs, `summary.json` and the peel files, no scans. The viewer still opens one (drop it on the page,
or `view-batch-review.bat`), with the older Apply and Save. Deleting them loses only the record of that run.

Keep each unsupported aligner and its operator-approved supported example together under a neutral `case-###/` directory:

```text
case-001/
  aligner.stl
  ideal-supported.stl
```

The case directories are deliberately ignored by Git. STL geometry can identify a patient even when filenames and binary headers are neutralized. Do not publish a new case or derived geometry without the owner's explicit approval. The original, already approved public reference remains at `docs/dental-reference/reference-aligner.stl`; its local `case-001/aligner.stl` copy is for side-by-side comparison.

`case-001/ideal-supported.stl` is a local, header-neutralized copy of the owner-supplied ideal result. Its triangle records were preserved, and the source download was not changed. Reproduce aggregate measurements without exporting geometry:

```sh
python scripts/dental-reference/compare_supported.py --aligner dentalwork/fixtures/case-001/aligner.stl --supported dentalwork/fixtures/case-001/ideal-supported.stl
python -m unittest discover -s scripts/dental-reference -p 'test_*.py'
```

Current case-001 measurements: the supported shell is lifted 3.5 mm from the plate; 371,827 of 373,956 original shell triangles match after that translation. The comparison finds 90 simple plate-to-shell columns, most with a 1.5 mm shaft; median nearest-neighbor spacing among those columns is 2.545 mm (10th–90th percentile 1.892–3.366 mm). One inspected straight column has a terminal segment about 0.45 mm across. These dimensions describe the example **only**. The owner permits using its support diameter as a dental-specific starting point, but explicitly wants to **retain the app's existing raft design**. Shaft and contact-end diameters must be evaluated separately before selecting a preset. The comparator does not fully segment branch contacts or contact-to-shell penetration. A separate nearest-curve check found 88/90 column tops within 0.5 mm of the already detected outer or middle contour; this is approximate, not a guarantee that a particular adjacent face band is safe.

An additional local 3D triangle-distance check found 89/90 column tops within 0.4 mm of the diagnostic non-opening-side strips. Forty were distinctly closer to those strips, 45 were within 0.1 mm of both sides of a ridge, and five were distinctly closer to an opening-side strip. These are evidence for a narrow ridge-adjacent strategy, **not** proof that every contact or support body is safe.

For another case, create a new numbered directory, keep the source STL outside Git, and neutralize the first 80 bytes of each binary STL header with `scripts/prepare-dental-reference.mjs`. Record comparison measurements in the tracked handoff without names or original source paths. The paired supported model is evidence of intended contacts, spacing, and support direction; the raft need not match.

## Support contact files (`*-sup.contacts.json`)

For every `<name>-sup.stl` that has a bare partner `<name>.stl` beside it, `scripts/extract-sup-contacts.py` writes `<name>-sup.contacts.json` in the same (git-ignored) folder. Format `mixo-sup-contacts/1`: `bare` and `sup` file names, `frame` ("bare scan coordinates, mm"), `transform_bare_to_sup` (4x4), `registration` ("exact" or "icp"), `rms_mm` (plus `rms_flag_over_0.02_mm` when above 0.02 mm), `contacts` (`[x,y,z]` points where supports touch the bare surface), `normals` (bare surface normal at each contact), `touch_rule` ("tip-piece nearest point <= 1.0 mm": each non-denture support piece contributes its nearest point to the bare surface, accepted at 1.0 mm or less and projected onto the surface), `cluster_mm` (1.0) and `touch_mm` (1.0). Run it as `python -I scripts/extract-sup-contacts.py dentalwork/fixtures`. The scans are read in place and never modified; the JSON files stay local like the scans.
