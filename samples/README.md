# Samples

**These are the real scans. Keep them.** Everything under `typelab/output/` is a result made FROM them and can be
made again; these cannot. Nothing in the tooling copies, moves or changes them: the Type Lab, the batch and the gates
all read them where they are. Everything here but this README is git-ignored (patient data), whatever the folders
are called (`.gitignore`, guarded by `scripts/samples-ignored.test.mjs`).

## The layout: `<category>/<type>/<file>`

`category` is the kind of item (`aligner/`, `denture/`, `retainer/`); `type` is the sub-kind inside it (`g/` =
generic, until other types are found; a category may also hold its files directly). **The owner keeps adding,
moving and renaming samples**, so the code never relies on a folder's contents or a file's position:

- `scripts/samples.mjs` is the one place that knows this layout. It lists a category's scans at any depth, so a
  new type folder needs no code change, and a new category folder is a new `gate:real` kind on its own.
- A test that needs ONE particular scan pins it by its bytes (`scripts/samplePins.mjs`), so moving or
  renaming it breaks nothing; `node scripts/real-scan-tier.mjs` says which pinned scans this machine lacks.
  Removing a pinned scan from here means retiring or re-pinning its test in the same change.

## The naming rule - read this before using any file here

| file | what it is | run as a case? |
|---|---|---|
| `<name>.stl` (or `.glb`, `.gltf`) | a bare scan | **yes** |
| `<name>-sup.stl` | the SAME scan with supports made by the owner's professional dental software: **the target** | **never** |

**A `-sup` file is the target to work toward** (owner's rule, 2026-11-26). When asked to rebuild a result with our
nodes, to make a new type or to revise a setup, compare what we build on `<name>` with what `<name>-sup` shows -
contact places, spacing, directions - and work toward it. It is a target, not gospel: where it breaks one of our own
rules (every tip supported, clearance, plate-only for dental, peel safety), ours wins and the difference is said, not
copied. Never name the program that made it.

**A `-sup` file is NEVER run as a scan.** It is the bare scan PLUS hundreds of support pieces; read as a case, those
pieces look like "small parts of the denture" (this cost an afternoon of wrong rule work on 2026-11-21). The Type Lab
(`typelab/scanSet.mjs`) and the measuring scripts skip it by its name, which is why the suffix must be exactly `-sup`
on the same name as its bare scan.

To add a sample: put the bare scan and, when there is one, its supported version as `<same name>-sup.<ext>` in
`<category>/<type>/`. Nothing else is needed.

## What is here (2026-11-26 - this changes; `scripts/samples.mjs` reads whatever is present)

| folder | what it holds | used by |
|---|---|---|
| `denture/g/` | six scans, each with a `-sup.stl` target and `-sup.contacts.json`. Two of them (`#ec460f9b92`, `#c18ba9eb2e`) are not dentures: small solid pieces with no U-shaped arch (owner, 2026-11-27). The orientation step refuses them ("no-legs") | `gate:real` (denture), pinned denture tests, the Type Lab |
| `aligner/g/` | aligner scans, multi-part ones included, and the public reference copy with its `-sup` target and contacts | `gate:real` (aligner), one pinned open-arch scan |
| `retainer/` | retainer scans (each also in `aligner/g/` at present) | `gate:real` (retainer, run as an aligner), pinned open-arch and print-angle scans |

## Testing with them

- **The Type Lab (try a type or an edit):** `npm run review`, open http://127.0.0.1:6705/, **Import folder** and
  pick `samples/denture/g` (or **Import files** for single scans, or paste a path), pick a type, **Run all**.
  `-sup` files are kept aside as targets, never run. Results go to `typelab/output/review-cache/`; **Clear** empties
  only that folder.
- **The real-scan gate (after any engine change):** `npm run gate:real` - every category folder above against
  `scripts/baselines/real-scan-baseline.json`, keyed by category + the scan's hash. A scan added or moved to
  another category has no baseline under its new key, so the gate lists it as a difference: after a deliberate
  change, `npm run gate:real -- --kinds <category> --update`.
- **A rule override:** `node typelab/cli.mjs --kind denture --set overhangAngleDeg=55 samples/denture --open`
  writes a `bench-<date>` folder.
- **A plain batch:** `typelab/run-batch-review.bat` with one of these folders, or
  `npx vite-node --script typelab/batch.ts --out typelab/output/batch-test samples/denture`
  writes a `batch-<date>` folder.

The `batch-*`, `bench-*`, `jig-*` and other folders in `typelab/output/` are those earlier results: the supported
GLBs, `summary.json` and the peel files, no scans. The Type Lab still opens one (drop it on the page, or
`typelab/view-batch-review.bat`). Deleting them loses only the record of that run.

## The public reference aligner

STL geometry can identify a patient even when file names and binary headers are neutralized. Do not publish a new
case or derived geometry without the owner's explicit approval. The approved public reference remains at
`docs/dental-reference/reference-aligner.stl` - the walk and the pipeline test use THAT file, never a copy here.
Its local copy `aligner/g/aligner.stl` (byte-identical) is for side-by-side comparison with its target.

`aligner/g/aligner-sup.stl` is a local, header-neutralized copy of the owner-supplied supported result. Its triangle
records were preserved, and the source download was not changed. Reproduce aggregate measurements without exporting
geometry:

```sh
python scripts/dental-reference/compare_supported.py --aligner samples/aligner/g/aligner.stl --supported samples/aligner/g/aligner-sup.stl
python -m unittest discover -s scripts/dental-reference -p 'test_*.py'
```

Current measurements of the reference (case-001 in older notes): the supported shell is lifted 3.5 mm from the plate; 371,827 of 373,956 original shell triangles match after that translation. The comparison finds 90 simple plate-to-shell columns, most with a 1.5 mm shaft; median nearest-neighbor spacing among those columns is 2.545 mm (10th–90th percentile 1.892–3.366 mm). One inspected straight column has a terminal segment about 0.45 mm across. These dimensions describe the example **only**. The owner permits using its support diameter as a dental-specific starting point, but explicitly wants to **retain the app's existing raft design**. Shaft and contact-end diameters must be evaluated separately before selecting a preset. The comparator does not fully segment branch contacts or contact-to-shell penetration. A separate nearest-curve check found 88/90 column tops within 0.5 mm of the already detected outer or middle contour; this is approximate, not a guarantee that a particular adjacent face band is safe.

An additional local 3D triangle-distance check found 89/90 column tops within 0.4 mm of the diagnostic non-opening-side strips. Forty were distinctly closer to those strips, 45 were within 0.1 mm of both sides of a ridge, and five were distinctly closer to an opening-side strip. These are evidence for a narrow ridge-adjacent strategy, **not** proof that every contact or support body is safe.

For another case, put it under its `<category>/<type>/` folder, keep the source outside Git, and neutralize the first 80 bytes of each binary STL header with `scripts/prepare-dental-reference.mjs`. Record comparison measurements in the tracked handoff without names or original source paths.

## Where the supports touch (automatic since 2026-11-27)

Nothing is written into this folder any more. The first review or fit that needs a pair lines it up
(`typelab/targetMatch.mjs`, which runs `scripts/extract-sup-contacts.py` once per pair) and keeps the result in the
git-ignored `typelab/output/targets`, keyed by the CONTENT of the scan, the target and the matcher: a renamed file
finds its result, a replaced one is matched again. `node typelab/targetMatch.mjs samples` prints the ledger (every pair,
its line-up, or why not). Old `*-sup.contacts.json` files beside the scans are no longer read. Format
`mixo-sup-contacts/2`: `status` and `reason`, `transform_bare_to_sup`, `moved` (none / shifted / turned),
`registration`, `rms_mm`, `contacts` and `normals` in the bare scan's frame - no file names.

**A target may sit at any origin and orientation** relative to its scan - that is normal. **Its model may be several
pieces** (an aligner with hooks): they are found by matching the scan's own parts by surface area, else each of the three
biggest pieces is tried (a raft can be bigger than the model). The line-up tries the exact fit, then a pose from the
shapes alone, refined. It is refused WITH the reason when the gap stays above 0.5 mm, when the model is far bigger than
the scan (supports or a platform joined to it), or when no support touches it; a loose bit of the scan copied into the
target is debris, not a support. On 2026-11-27 all 14 pairs lined up. Tests: `python -I -m unittest discover -s scripts -p "test_extract_sup_contacts.py"` (not part of `npm test`). The scans are read in place and never modified; the JSON files stay local like the scans.
