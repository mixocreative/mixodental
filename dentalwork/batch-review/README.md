# Folder review

Check a whole folder of aligner STLs on your own computer, without the app and without AI. Every STL goes through the same steps the app runs in dental mode, and a viewer then shows each result in 3D next to its numbers.

**Review only.** Dental mode is not clinically validated. A result that looks right still needs a person to check it before printing.

## Run it

1. Once per computer: install Node.js 22 and run `npm ci` in the project folder. The geometry engine ships vendored in `vendor/mixo-geocore` (the Node build is `vendor/mixo-geocore/pkg-node`); if the window says it is missing, run `npm run vendor:geometry` once.
2. Double-click `run-batch-review.bat` and choose the folder in the window that opens, or drag one or more folders onto it in File Explorer. Subfolders are included. If you close the window without choosing, it asks for a folder path to paste instead.
3. The window prints one line per file. When it ends, the viewer opens in your browser. Keep the window open while you look; close it when you are done.

To look at an earlier run again, double-click `view-batch-review.bat` (it opens the newest run) or drop a `batch-...` folder from `dentalwork/output`, or any file in it, onto it. If there is no run yet, it opens an empty viewer.

Once the viewer is open you can switch runs without restarting it: drop a `batch-...` folder onto the page, or use **Open folder** / **Open files** in the header. Dropping the whole folder is best; `summary.json` with its `case-*.glb` files works too, and `.glb` files alone open without the numbers. When a drop holds several runs, the newest one opens. The files stay in your browser; nothing is uploaded. The viewer still needs the window `view-batch-review.bat` opened: double-clicking `viewer.html` by itself does not work.

Command line, from the project folder:

```powershell
npx vite-node --script dentalwork/batch-review/batch.ts --out dentalwork/output/batch-test "D:\aligners\week-42"
node dentalwork/batch-review/serve.mjs dentalwork/output/batch-test
```

## Turning the rules, not just looking at them

A folder review answers *what does the engine decide for these scans*. **`npm run benchwork`** answers
the next question: *what would it decide if this rule were different?* It is this same review with
named rule overrides applied, plus validation before a run is spent and a written record of what it
turned.

```powershell
npm run benchwork -- --list
npm run benchwork -- --kind denture --set overhangAngleDeg=55 "D:\dentures\week-42" --open
```

It writes its output here, into `dentalwork/output/`, so the viewer below opens it unchanged. The
tool, its thirteen rules and its limits live in [`benchwork/`](../../benchwork/README.md); only a
denture responds to a rule change, and a recompute is about 23 seconds.

## What you get

`dentalwork/output/batch-<date>-<time>/` holds:

- `case-001.glb`, `case-002.glb`, ...: one 3D review per file that could be built. The files are numbered, so a patient name in an STL file name never ends up in a GLB.
- `case-001-orientation.glb`, ...: the Step 1 evidence of each file that could be oriented (also for files that were not built), drawn in the same frame as its review.
- `summary.csv`: one row per file, for a spreadsheet. `summary.json`: the same rows for the viewer.

`dentalwork/output` is ignored by Git: the GLBs are patient geometry and the summary lists the original file paths. Do not commit or share them without the owner's approval.

## Reading the viewer

Turn the view below the floor (or press Bottom view) to see the aligner and its support tips only: the rest of the supports and the raft hide while the camera is under them.

The left list starts with **Needs a look**: every file that was not built, whose safety check is not `clear`, that has a low point with no support, or whose edge coverage has a gap to review. **All** shows every file. Arrow keys or Previous / Next step through them.

The right panel gives the numbers for the selected file:

| Line | Meaning |
|---|---|
| Result | `built`; `inconclusive` (the detector or the build could not decide, with the reason); `error` (the file could not be read). A file that was not built shows a card in the middle of the view with the reason in plain words and what to do next (`reasons.json`; also the `explanation` column of `summary.csv`), and the reason code underneath |
| Safety check | `clear`, `blocked` (a support cuts through the aligner) or `inconclusive` (could not decide) |
| Supports crossing the aligner | Places where a support cuts through: red markers |
| Crossings not judged | Crossings that had no face to judge against: amber markers |
| Low points with no support | Low points inside the support area that no support reaches: purple markers |
| Low points outside the area | Low points outside the support area, for information: blue-grey markers, off by default (see [open decisions](../open-decisions.md)) |
| Islands not resolved / Unresolved islands / Islands resolved / Islands outside the allowed area | Denture only, all from the engine's island report after the build: an island is the lowest point of a region that starts mid-air. Resolved = a built tip serves it (its own or one nearby); not resolved = no built tip does (tip left out, below min size, in the no-support zone, outside the allowed area). The list gives each unresolved island's height above the lowest vertex, size (mm²) and reason. Layers `Islands NOT resolved` (dark amber, on) and `Islands resolved` (green, off) mark the same islands |
| Print angle | The tilt the app's Step 1 picks (degrees), its stable band, and whether the confirm build at that tilt passed |
| Arch | How Step 1 read the scan: `open arch (trim decided)` - up is the plane fitted through the trim edge, the front comes from the two distal ends of the U; `ring (floor rule decided)` - a U bridged by a plate (the reference aligner), oriented by the older floor rule |
| Up/down cross-check | Whether the rule that did not decide agrees on which side is up: `agrees`, `inconclusive` (it leans too little to say) or `disagrees` (needs a look: the two rules point opposite ways; the explanation under the numbers says so) |
| Floor offset ratio | How far the floor (tooth side) leans toward one end along the up axis, 0 to 1; the cross-check's own strength |
| Structures left out | `brace-pruned` when only the cross-brace segments that crossed the aligner were left out (the other braces stay); `brace` or `tree` when the repair switched all of them off; joined with `+`; `none` otherwise. New aligners start with Brace on and Tree off |
| Tips placed / left out | Automatic tips built, and tips left out by the repair |
| Largest gap, outer edge / opening | The longest stretch of each rim without a tip, in mm |
| Edge coverage needs review | A gap longer than twice the normal spacing |

Layers you can switch on and off:

- **Support area** (teal): where tips may go. **Rest of the aligner** (white).
- **Outer edge, detected** (blue), **joining paths** (green), **Inner opening edge** (red): the edges the detector found. Check that they follow the real trim line and the opening.
- **Supports** (gold) and **Support tips** (orange).
- **Step 1** evidence from the companion `case-NNN-orientation.glb`: **trim chains detected** (red lines, the sharp
  trim edge the orientation fitted its trim plane through), **the two U ends** (green), the **back arrow**
  (orange, from the arch apex toward the open side of the U) and the **trim plane** outline (amber, on by default - the plane the rim search starts from).
  Check that the red lines follow the real trim, the green ends sit at the two distal ends, and the arrow points
  out of the back of the arch. A ring (the reference) has no arrow.
- **Markers** (red, amber, purple; blue-grey for low points outside the area, off by default), drawn on top of everything so they show through the supports.
- **Diagnostic** layers, off by default: the strips on each side of the detected edges and the sample points used to find them.

Views: **Fit view**, **Top view** (look down on the support area), **Bottom view** (the raft side) and **Side view**. Drag to turn, scroll to zoom, right-drag or Shift-drag to pan.

## What to record

For each file, write down whether the edges and the support area are right, wrong or unclear, and whether any marker is a real problem. Send the case numbers and your notes, not the STLs, unless the owner has approved sharing the files.

## Files

| File | Role |
|---|---|
| `run-batch-review.bat` | Runs a folder, then opens the viewer |
| `view-batch-review.bat` | Reopens a finished run, or opens an empty viewer to drop one into |
| `batch.ts` | Walks the folders, runs each STL through `reviewCase.ts`, writes the summary, and exits non-zero on any error |
| `reviewCase.ts` | One STL through `scripts/dental-region-review/build.ts` (the app's detector, placement and Rust `generate`) into a GLB and a summary row. Benchwork only, opt-in: `MIXO_DRAWN_RIM_DIR` gives a denture case the candidate rim in `<scan stem>.rim.json` (`{ closed, points }`, raw STL frame, made by geocore's `tests/rim_fitting_real.rs` with `MIXO_RIM_OUT`) as its drawn rim, so the review shows what the engine does with a rim a rule proposes |
| `src/dental/orientationEvidence.ts` (shared with the app, renderer-free) | Step 1 for the row (arch kind, up/down cross-check, floor offset ratio, note) and the evidence layers (Rust `diagnose_orientation`) |
| `orientationEvidenceGlb.ts` | Three.js builder that turns the evidence layers into the companion GLB |
| `reviewCase.test.ts` | Runs the reference aligner through the whole pipeline (about 20 s, part of `npm test`) so a broken import cannot go unnoticed |
| `serve.mjs` | Serves the viewer, three.js and the run's files (if a run folder is given) on 127.0.0.1 only; GET `/types` lists every type the workbench can open (`typeCatalogRun.ts`, read at start and after a Save); POST `/pick-folder` (the system folder dialog) and POST `/import` (a folder or file path, sorted by `scanSet.mjs`) take scans in where they are, refused under `--lan`; POST `/run` runs one scan with one WHOLE type file through `runQueue.mjs` (2 at once) into `dentalwork/output/review-cache/<key>/`, a result once `finished.json` is written, served at `/cache/` - a built-in only unchanged, as the plain built-in run; POST `/run-stop`, GET `/jobs`, GET `/cache-size` and POST `/cache-clear` go with it (about 88 MB per scan and type, so the size is shown); POST `/save-draft` saves the page's whole draft as a NEW dated file `types/<category>/<id>.<YYYYMMDD-HHMMSS>.type.json` with its proof (the kept runs' scans), refusing a draft that never ran and one that would hide a newer save (`typeSaves.mjs` saveRefusal); POST `/draft` and GET `/drafts` keep a type's unsaved edits in `dentalwork/output/review-drafts/` (a reload or restart keeps them); it listens on port 6705 (`--port N`; the next free one when taken), so the browser's per-viewer state survives a restart; POST `/rerun` runs Apply (a whole `type` file, or the older pieces), POST `/save-type` writes `types/<category>/<id>.type.json`, POST `/zone-preview` runs `zonePreviewRun.ts` for the Zones live preview and POST `/tilt-preview` runs `tiltPreviewRun.ts` for tabs 4 and 5 (one of each kind at a time, each run into its own temp folder served at `/preview/`; the tilt preview gets the same inputs `/rerun` gives benchwork, as env and files) |
| `saveType.mjs` (+ `saveType.test.ts`) | The rule Save type follows for a file already at its path: write, same bytes, or ask before replacing |
| `reviewSession.mjs` (+ test) | The scan session: the imported scans, and what each came to with each type AS IT STANDS (a result's id carries the type's run fingerprint, so another type or an edit never shows this one's picture); the case list's rows, the stage banner ("Scan 2 of 3 with Soft denture - current / running 12 s / not run yet / failed") and the totals |
| `compareRuns.mjs` (+ test) | Compare: which result fields of one scan's run differ between two types (the run's own names, files and times left out; numbers to 3 decimals), and a value in one short line - the facts' "Compared with" list and the case list's "N differ" |
| `scanSet.mjs` (+ test) | Which imported files are cases: every `.stl` but an owner's `-sup.stl` (a reference, never run); the rest counted as skipped, and one line saying so |
| `runQueue.mjs` (+ test) | The order runs happen in: at most N at once, one run per key (a second ask joins it), stop per key; `resultKey` = scan bytes + type run fingerprint + engine version |
| `typeCatalog.ts` (+ test), `typeCatalogRun.ts` | Every type the workbench can open: each category's built-in and the save in force of each saved type (the app's own `discoverTypes`), each as its whole type file, plus what could not load and why. The script writes it for GET `/types` |
| `typeDraft.mjs` (+ test) | A type file to the editors and back: `editsOfType` opens a type in the editors' form (the search and Rim numbers as edits against the built-in, rules and graphs whole - also the page's restore baseline, so Restore goes to the opened type's saved values), `typeOfEdits` makes the draft Apply runs and Save writes (keys no editor shows kept; a new id is a new type `basedOn` the opened one - a built-in's edit, Duplicate, an id rename), and `runPrint`, a run's fingerprint that ignores name and badge. A browser module: the server maps `/src/dentalTypes/` for its `typeText.mjs` import |
| `typeInForce.ts` (+ test) | The type a run is: the draft from the built-in, `type.json`, and `type-load.json` - whether the APP will load it (`appLoadVerdict`) |
| `viewer.html` | The viewer. With the server it is also the place pipelines are tested (docs/REVIEWER-OVERHAUL-PLAN.md): import scans, pick a type - its whole setup opens in the editors, and every restore mark puts back what THAT type saved - edit, Apply (the whole draft runs on the scan on screen), switch type on the same scans. A review folder from a batch still opens as before |
| `nodeGraph.mjs` (+ `nodeGraph.test.ts`) | The node graphs as plain data, tested without a browser: the denture zone graph (kinds, words, validation; `rimSide` off by default; the rim-strip outputs free since step 7.3; since plan D1 ONE `zone` output stacked from Mark support / Mark no-support nodes, and `upgradeGraph` turns a graph saved with the three old outputs into that stack), the aligner's locked graph, and the rim tab (`rimTabView`, with the rim-derived nodes greyed; `RIM_PLACEMENT` is the one list of profile numbers the tab may set - the strip widths and the rim line / rim strip spacings - read by the draft, the server and the page) |
| `sidePreview.mjs` (+ `sidePreview.test.ts`) | The live side names: what the six side labels in 3D say while the Orient canvas is edited - a flip renames, Plate side marks the side on the plate and the side that rises - against the choices that ran (summary `orientGraphRan`); and the turns the model makes - the live side turn (`turnFor`) and the Orient tab's rest pose (`restTurn`: the plate side straight down, no print-angle lean), composed by `composeTurns`. Pure; the viewer writes the text and turns the model |
| `zonePreview.mjs` (+ `zonePreview.test.ts`) | Plan D2's per-node preview, pure: a selected node's slice of the run's values (`<case>-zones.json` + `.bin`, written by `reviewCase.ts`), a Mark as its three states or a set of faces as one highlight, and the note under the canvas - including "has not run", "the canvas has changed since this run" and, for a rim belt shown with its rim line, which side is which. The viewer only draws the faces on the model; a selected face set glows and is outlined (`boundaryEdges`, `glowLevel`) |
| `zonePreviewRun.ts` | Plan D3: the Zones live preview - every zone node's value for the canvas's graph on one scan, loaded exactly as `reviewCase.ts` loads it, with no placement or build (engine `zone_nodes`), in about 5 s. With the Rim tab's belt widths it runs as a draft type (`typeOfRun` / `putInForce`), so the belts grow at the page's widths. Spawned by `serve.mjs` through vite-node; serves the Zones tab and 2 Rim |
| `tiltPreview.mjs` (+ `tiltPreview.test.ts`) | Plan D3, tabs 4 and 5, pure: what the live preview carries (the pick, why, the stable band, each angle's failed rules, the tips by path state) and every sentence the page says about it - always "preview", and that pillars come only with Apply |
| `tiltPreviewRun.ts` | Plan D3, tabs 4 and 5: the print-angle search with the page's settings and the tips at its pick, no build, in about 8 s. Reads the run's own inputs with the run's own code (`typeOfRun`, `putInForce`, `profileSelect.ts` `dentureScanSettings`), so it cannot search differently; puts the tips through the GLB's frame (`<case>-orient.json` `frame`) so they sit on the model on screen |
| `orientGraph.mjs` (+ `orientGraph.test.ts`) | Step 1 as an editable graph (docs/ORIENT-NODES.md U6): the Orient kinds (arch shape, front/back and top, upright pose, largest flat area, box-and-base frame, set as bottom), their words, today's default and the flat-base recipe, and the engine's refusals. The same library shape as `nodeGraph.mjs`, so the same canvas draws it on the "1 Orient" tab. Both libraries give the canvas its words (`TYPE_WORDS`, `OUTPUT_NODE`) and each parameter's standard value (`defaultOf`, through `nodeGraph.mjs` `defaultParam`) for the restore marks. The page has five tabs since 2026-11-23 (WORKBENCH-TABS-PLAN section 3): 1 Orient, 2 Rim, 3 Zones, 4 Support settings, 5 Print angle; a tab cuts the 3D layers to what it and the earlier tabs produce. Its test holds the canvas's verdict to the vendored engine's on a corpus. |
| `orientLayers.ts` (+ test) | What an EDITED Step 1's nodes made, as review layers: a flat region's faces and the pose's up line (drawn only when the Orient graph is not the default, so default reviews stay byte-identical). |
| `nodeEditor/` | The React Flow canvases: `ZoneEditor.tsx` (the editable zone graph), `RimCanvas.tsx` (the rim tab: the denture's Rim and belt widths, the aligner's locked chain; reports its selected node for the 3D preview, stacks its cards by their measured heights, and wires each line of the Rim output card from the node that gives it), `main.tsx` (the entry the viewer imports). Built by `npm run review:editor` into `node-editor/node-editor.js`; `bundle.test.ts` fails when the bundle is older than these sources |
| `tokens.css`, `base.css` | Mixo app style, copied unchanged from the `mixo-app-style` skill |

## Colours and rule numbers

Every colour of the viewer and of the GLB layers is a CSS token in `tokens.css` (`--layer-*`, `--scene-*`); `layerColours.ts` reads that file for the GLB writers, so a colour is changed in one place. The overhang numbers quoted in the viewer's texts (global and dental rim angle) are the rule defaults the run was made with: `batch.ts` writes them to `summary.json` (`ruleDefaults`, from `ruleDefaults.ts`) and the viewer fills them in. See `docs/ui-styling.md`.
