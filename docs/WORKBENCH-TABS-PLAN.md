# Workbench tabs - the owner's feedback of 2026-11-23, checked against the code and planned

**Status, 2026-11-23: A1, B1, B2, B3, C1 (side names), C2, C3, D1 and D2 BUILT** (the goal: "fix everything according to UX flow and Fable's agreement"; built on Fable's recommendations D1, D4 and D6 while the owner's answers are open):
- **A1:** the names of section 2 on the canvases (Arch shape, Name the sides, Stand on the back, Final orientation, Part frame; Combine / Subtract / Overlap / Invert; Support zone). The two wrong ray explanations and the Undefined text are corrected. Every node shows a Takes / Gives line generated from its kind.
- **B1:** five tabs, Print angle last; picking a tab cuts the 3D layers through the step walk.
- **B2:** a restore mark on every node parameter (`defaultParam`, tested on R1b), the search fields and the rule fields.
- **B3:** the Orient nodes show what they measured (arch flatness, the front/back widths, the slice votes), and the review's 3D view names the six sides.
- **C2:** Name the sides takes `front` and `teethSide` (auto / the other one) for a kind of part the detector reads the wrong way round; the Plate side node (`plateSide`: which side faces the plate, which side leans, the angle) replaces Stand on the back in the workbench's standard Step 1, bit-equal at its defaults (a Rust test; the engine's own default keeps the old node; geocore `2693b1a`). A denture's Step 1 has Flip front and Flip teeth side, which turn ONE scan round (`PrintUnit.dentureFlip`, `src/denture/state/caseFlip.ts`): every denture job carries the flip, the engine XORs it with the type's choice, and the print angles are checked again.
- **D1:** ONE zone output. The engine (geocore `8c2aeeb`) takes a graph whose output is `zone`, stacked from `markSupport` (with its `seen` switch, decision D5 (b)) and `markNoSupport` - a later Mark wins - and derives the three masks placement reads: allowed = Support, no_support = every face a No-support Mark touched, allowed_cavity = Support and seen. No reader changed. Today's graph in that form is bit-equal on the synthetic shell and the local scans, steep ray off and on (geocore `tests/denture_rules.rs`). The canvas offers the two Marks (group "Mark the zone"), its standard setup is the stack, and a graph saved with the three old outputs loads as a stack (`upgradeGraph`: exact when the allowed area contains the cavity's view, as it does in every graph built from the standard one). Host and engine agree on every corpus graph, old form included.
- **C3:** the Rim tab is editable. Engine: the Rim node carries the finder's numbers (`binDeg`, `shellMm`, `openGapDeg`; geocore `cb725bd`) and its source (`finder` or `flatEdge`, `5a8924a`). Host: the Rim node shows those four settings, each strip its width (the type's profile `rimBandMm` / `lowRimBandMm`, sent with Apply as `--placement` and made into the draft's profile by `typeInForce.ts`), every field with a restore mark and a range check; Arch frame is gone (it was Orient's Arch shape under a second name) and the Rim says it takes tab 1's final orientation; a Rim output card lists what 3 Zones receives. A value put back to its standard leaves the graph, so an undone edit leaves the standard graph standard. On the Zones canvas the fixed Rim node shows its settings as text, "set on 2 Rim". Not built: the strips' Side choice (inner / outer), which waits on the owner's look at the rim-side pictures.
- **Owner's cone test** (geocore `95909c0`): Largest flat area finds a cone's base and Stand on the flat area puts it on the plate; on a slender cone a side wedge wins and the base must be asked for by rank. It found the flat-area finder giving different regions on different runs, fixed (`48f4de3`).
- **The flat area's edge as the rim, engine half** (geocore `5a8924a`, the cone test's second half): the Rim node takes `source: flatEdge`, and the rim becomes the outer loop of the faces the part stands on (`flat_edge_rim.rs`). On the cone it is one closed loop the length of the base polygon, on the base plane. Without a Stand on the flat area it falls back to the found rim and says why. The Rim tab's choice for it comes with C3's host half.
- **D2:** select a node on the Zones canvas and the 3D view shows its value from the run: a Mark as the zone as it stands at that node, in the three colours (Support, No-support, Undefined), a ray, strip or combine as its faces; the empty canvas brings back the final zone (the three zone layers). The engine keeps every evaluated node's value per face (geocore `e819c78`) and its default IS the one-zone stack since `1321692`, so a standard run carries the Marks too. reviewCase.ts writes `<case>-zones.json` + `.bin`; summary.json records `zoneGraphRan`. The note under the canvas says when a node did not run, and when the canvas has changed since the run - the preview shows what RAN, never an un-run edit (that is D3, live previews). Checked headless on a real case: the cavity Mark shows Support 52,826 / No-support 55,733 / Undefined 408,211 faces, the parallel rays 69,532.
- **C1, the side names (owner 2026-11-23: choosing a side "is clueless to human not seeing"):** the six side labels in 3D follow the Orient canvas at once, before Apply. A front flip swaps Front/Back and Left/Right, a teeth flip swaps Teeth/Tissue and Left/Right, and Plate side marks the side "on the plate" and the side that "rises as it leans" (`sidePreview.mjs`, tested; summary.json records `orientGraphRan`). A note says the part itself turns only after Apply and run. Checked headless on a real case.
- **The side labels in the app:** a denture's Step 1 names its six sides beside the part (Front side, Back side, Teeth side, Tissue side, Left side, Right side - "side" added because "Back" is the Back button's word), in both renderers, from the engine's own frame. After Flip front the part turns round and the labels stay with their sides. Checked headless on the local denture scan. The check also found the aligner's area preview running on a denture and failing on screen ("unknown aligner profile") once per scan; it now skips dentures.
- **Fable reviewed all of the above (2026-11-23) and agreed after fixes 1-3**, all taken, with 4-9 too: the flat edge now reaches an engine that reads it and every unknown Rim setting is refused on both sides (parity cases added); the flat edge's fallback says why (case facts, and a warning on the Rim node before the run); the zone preview compares graphs key-sorted; the tab's 3D cut applies on load; honest notes for nodes without faces; overlay races; the strip widths that ran are recorded; the flat edge's open outline keeps its last edge and its outer loop is chosen by area; the case flip has a synthetic test that always runs. Proved end to end: a cone stood on its base builds with its rim from the base outline ("1 line, 1 closed"), and the denture with the standard Step 1 falls back with its reason.
- **C1, the live turn:** a change to the side choices turns the part in 3D at once - a flip stands the other end on the plate, a new Plate side turns that side down - computed from the axes the run's own six labels give (`sidePreview.mjs` turnFor, tested on hand-worked axes). The supports hide while it is turned (they belong to the run's pose), and the run that the Orient edit starts puts the model back square with new supports. The lean angle is not previewed: it adds to the print-angle search's tilt, which only a run decides. Checked headless: Plate side Tissue, lean Front turned the Tissue side to the bottom.
- **D3, the Zones live preview:** a Zones edit is previewed on the model about 5 seconds later, before Apply: the server's POST /zone-preview runs `zonePreviewRun.ts` (the scan loaded exactly as the review loads it, the zone graph evaluated by the engine's `zone_nodes` - no placement, no build) and the viewer tints the final zone, or the selected node, from it. One preview at a time, a newer edit stops the older one, and each writes to its own folder outside the review. The note says it is a preview, that nothing is built until Apply, and that it uses the standard profile's strip widths. Checked in the page on the real scan: an extra 30 degree no-support ray, previewed 5.7 s after load (Support 81,577 / No-support 108,285 / Undefined 326,908 faces).
- **D3, tabs 4 and 5 (the rest of the row):** a changed setting on 4 Support settings, a search number on 5 Print angle (or the strip widths, or a canvas) is previewed about 8 s later: the server's POST /tilt-preview runs `tiltPreviewRun.ts` - the engine's print-angle search with the page's settings, then the tips at the angle it picks (the live-tilt paths), no build. Tab 4 draws those tips on the model coloured by their path to the plate (with a path, only at the last-resort clearance, none) and hides the run's own tips and pillars; tab 5 shows the pick, its stable band and every angle tried with what it fails. Only while the page differs from what the run on screen used: Apply resets that, so a preview never hides supports the run built from the same settings. The preview reads the run's inputs with the run's own code (`typeOfRun`, `putInForce`, `dentureScanSettings` - extracted from `buildDentureReview` so the two cannot drift), and its tips go through the GLB's frame, now written in `<case>-orient.json`. Checked in the page on the local denture scan: overhang angle 55 gave 182 tips at the run's 8°; search start 10 picked 10° (the run had 8°), then Apply picked 10° too and the preview cleared; overhang 55 with start 10 gave 181 tips (139 / 17 / 25), the same as the script run from the command line. A run made before this change has no frame, so tab 4 says to Apply once instead of drawing tips in the wrong place.
- **E1, the graphs half:** a saved type's own zone and Orient graphs load and run in the app. The engine checks them when the type loads (`src/dentalTypes/typeGraphs.ts`: set, catch the engine's refusal with the node named, clear) - the app imports no workbench validator - plus a zone graph that turns the steep ray R1b on is refused, since the rule it needs cannot be pinned by a type yet. Every denture job puts its type's graphs in force first, with the drawn rim and the flip, through one helper (`setCaseSlots`, dentureCore.ts); a type without graphs sets the defaults back, so two types in one project keep their own graphs. Not an engine slot per profile id as this row first said: the per-job set gives the same result without an engine change, and the digest is in both cache keys (TYPE-PIPELINE A3; E3 there is the engine end state). A type whose Orient graph has no `upDecision` (the flat-base recipe) greys the Flip buttons with "This type stands on a flat base: it has no front or teeth side to turn round." instead of leaving them silently dead. Tested: `typesReady.test.ts` on the real engine (a refused graph gives the engine's reason and leaves the slots default; a runnable pair is in force for its type and gone for the next), a source guard that no job sets the rim or flip without the graphs, and `caseFlip.test.ts` for the buttons.
- **The rim strip's tips, split (owner 2026-11-23, "Glow + spacing split"):** the rim strip used to be filled with rim tips at the rim spacing over its whole area, allowed or not. Its node on 2 Rim now sets the spacing ALONG THE RIM LINE (`dentalRimPitchMm`, standard 2 mm) and what the REST OF THE STRIP gets: the same grid as before (standard), a grid of its own, or "like the supported area" - no grid of its own, the strip's faces left to the area pass, so outside the allowed area they get no tip. Engine: profile key `rimStripPitchMm` (absent = as before, 0 = left to the area, else a spacing; refused under 0.2 mm), geocore `profile.rs` / `ruled_tips.rs`. The Rim tab's profile numbers are now ONE list (`nodeGraph.mjs` `RIM_PLACEMENT`) that the draft, the server and the page all read. The Rim output card says what the line and the strip get.
- **The selected strip glows:** selecting a face-set node on 3 Zones (a strip, a ray, a combine) breathes its tint and draws its outline (`zonePreview.mjs` `boundaryEdges`, `glowLevel`, tested); the final zone and a Mark keep their steady colours.
- **The hole strip's width:** its Grow a strip node on 3 Zones now sets it (0 to 20 mm, standard 5). The engine keeps the hole edges the strip grows from (`holes_axis.rs` `seeds`), regrows it at the node's width, and the hole tips use the GRAPH's strip - at 5 mm the very band found with the holes, so the standard is bit-equal (tested face for face on a frame with a hole; `gate:real`). A rim strip's own `mm` stays fixed - its width is the profile's, set on 2 Rim (`nodeGraph.mjs` `fixedParam`).
- **E1, the rules half:** a saved type's pinned rules run in the app. Every job on the type carries them (`src/dentalTypes/typeRules.ts`, before the unit's own). The four rules a unit sets itself never ride in from a type (its control would show the standard while the type's number ran): they SEED the unit's controls instead - the Overhang angle a new unit's Overhang control, the three denture options its option controls (`startingOptionsOf`, stored at Step 1's accept) - and the unit owns them from there; a seeded value no control can show is refused at load. A steep-ray zone graph now loads when the type pins `noSupportSteepDeg` to the same angle. Step 1 scans with the settings and options the unit will start from, so the scan and the build agree. Note: the workbench's type reader takes only its 13 bench rules, so a type made there can pin the Overhang angle and `lowOutsideAllowed` of these four, not model landing or the clearance floor.
- **The strips' Side choice (built overnight 2026-11-23, then REPLACED by the Rim belt below - the owner's better design; the table's "inner" and "outer" rows were measured with it):** the Rim strip and Low rim strip nodes on 2 Rim each chose both sides (standard), inner (the fitting surface) or outer (the visible outside). No engine change: the choice wires the engine's Rim side node behind the strip and an Overlap into the strip's output (`nodeGraph.mjs` `withStripSide`; outputs free since step 7.3), and "both" gives back the standard graph exactly. It is a zone-graph edit, so it previews, runs on Apply and is saved with the type. Proved: the engine accepts both side graphs (parity), and on the local denture scan inner-only gave 95 rim tips where both give 102, islands all served, verdict clear. **Every new setting on every denture scan the real-scan gate uses** (2026-11-24, benchwork, scans read in place; cases numbered, no file names):

  | Setting | Case 1 tips (rim / hole / area) | Case 2 | Case 3 |
  |---|---|---|---|
  | standard | 168 (102 / 36 / 12) | 99 (87 / - / -) | 76 (62 / - / 7) |
  | strip like the supported area | 141 (73 / 36 / 14) | 59 (37 / - / 10) | 51 (33 / - / 11) |
  | strip 3 mm grid | 155 (87 / 36 / 14) | 77 (57 / - / 8) | 61 (45 / - / 9) |
  | hole strip 3 mm | 165 (113 / 22 / 12) | 99 - no holes, unchanged | 76 - no holes, unchanged |
  | rim strip inner | 163 (95 / 36 / 14) | 87 (66 / - / 9) | 67 (50 / - / 10) |
  | rim strip outer | 146 (80 / 36 / 12) | 71 (58 / - / 1) | 60 (45 / - / 8) |

  All 18 runs built with the safety check clear, no tip left out and no island unsupported; each case kept its print angle. A setting moves tips only where it should. **Your condition stands:** the field's help says to look at the rim-side pictures (`dentalwork/output/rimside-pictures`) before relying on one side, and the standard stays both.
- **The Rim belt (owner, 2026-11-24: "rim strip is one node, then rim strip belt is another. The belt turns the rim strip line into a width area, setting inner and outer width from the line into a zone"):** on 2 Rim the Rim node is the LINE, and the Rim belt and Low rim belt nodes widen it into an area with two widths, inner (the fitting surface) and outer (the visible outside); 0 = nothing on that side, both 0 is refused. They replace the strip width and the side dropdown. Engine (geocore, profile keys `rimBandInnerMm` / `rimBandOuterMm` / `lowRimBandInnerMm` / `lowRimBandOuterMm`, `Placement::rim_belt`): with neither side set the strip grows exactly as before (`gate:real`); with a side set the belt is the engine's own Rim side growth on the inner side joined with it on the outer. One list of the tab's profile numbers (`RIM_PLACEMENT`) carries the four keys to the draft, the server and the page; the output card says "inner 3 mm, outer 0 mm from the rim line". **Proved on every denture scan the real-scan gate uses** (2026-11-24, scans read in place):

  | Rim belt (inner / outer) | Case 1 tips (rim) | Case 2 (rim) | Case 3 (rim) |
  |---|---|---|---|
  | not set (standard) | 168 (102) | 99 (87) | 76 (62) |
  | 2 / 2 set explicitly | 168 (102) - identical | 99 (87) - identical | 76 (62) - identical |
  | 2 / 0 (fitting side only) | 163 (95) | 87 (66) | 67 (50) |
  | 0 / 2 (visible side only) | 146 (80) | 71 (58) | 60 (45) |
  | 3 / 1 | 180 (113) | 104 (86) | 76 (61) |

  All 15 built with the safety check clear, nothing left out, every island supported, the print angle unchanged. A 2 / 2 belt equals the standard strip on all three, so joining the two sides loses nothing; 2 / 0 and 0 / 2 match the overnight side choice tip for tip, so the belt covers it with one design. Your look at the rim-side pictures is still the check that "inner" lands on the fitting surface on your cases.
- **The belts named by their job, and the 3D view follows the selection (owner, 2026-11-24, after looking at the page: "i cant read it ... rim tab needed to have live preview in 3d ... when a node is selected, only those selected nodes got shown on 3d space ... in orient tab, it should not tilt or rotate to print angle"; each item agreed with changes by Fable first):**
  - **Why two belts.** They do two different jobs in the engine (`ruled_tips.rs`): the first PLACES tips - a grid on its overhanging faces, even where support is not allowed, which holds the rim edge up; the second places none and is only an exception - a lowest point or island inside it keeps its tip on No-support faces (`low_reason`, clause 2). Merging them would change what is built, and a fourth Zone state was rejected (it is a placement rule about lowest points, not a face state). So they stay two, renamed by job: **Rim tips belt** and **Low-point belt**, one name each on 2 Rim, on the Zones canvas and on the output sockets (`nodeGraph.mjs` `RIM_BELTS`). On the Zones canvas a rim strip `band` node is named by the output it fills (`wordsOf`), so "Grow a strip" now means only the hole strip; one not wired to its output reads "Rim belt". Display only: no engine, type-file or saved-graph change.
  - **2 Rim previews in 3D.** Selecting the Rim, the Rim tips belt or the Low-point belt shows it on the model (the belt by the node its output is wired to, `rimTabTarget`; the Rim line by the run's line layer). A belt width edit previews by itself in about 7 s: `/zone-preview` takes the tab's widths as a draft type, as `/tilt-preview` does, and the preview is keyed on graph AND widths (`beltEdits` / `sameBelts`), so an old width's values never pass for the edit. Checked in the page on case 1: outer 0 gives 42,781 rim tips belt faces (100,945 standard, 76,436 at 1 mm), the same count as the runner from the command line. A Rim line setting is not previewed - the line is found in the run - and the note says so. The run's summary now records the belts' inner and outer widths too (`placementRan`); it recorded only the symmetric ones, so a one-sided run read as standard.
  - **The selection alone.** While a node is selected on Zones or 2 Rim, only the model and that node show; tips, pillars, the owner's supports, strips and zone layers hide, and come back on deselect (`isolatedKeys`). One node at a time: several masks would share one colour and fight for the surface.
  - **1 Orient at rest.** The tab shows the part standing on its plate side with no lean; the print angle leans it on tab 5. The angle's definition did not change: it was already 0 at the rest pose (case 1: Front 10.00 deg off vertical at a 10 deg print angle). `sidePreview.mjs` `restTurn` takes the plate side's direction to straight down, composed after any live side turn; the supports and the build plate drawn at the print angle hide while at rest. The pose is worked out on every stage change, so it cannot leak onto tabs 2-5.
  - **5 Print angle** names the side on top and the side on the plate in its diagram, from the run's own Orient choices (owner: "should also mark front and back just so we are clear").
  - **2 Rim's cards no longer overlap:** the canvas stacks each column by the cards' measured heights (`layoutRimTab`); the four-field rim tips belt (351 px) ran into the low-point belt at a fixed 190 px row. React Flow's own `measured` stayed empty on this canvas, so the heights are read from the page.
  - **The selected card is ringed** (owner, 2026-11-25: "the selected nodes also get a highlight on the node's border ... so i know what node(s) is selected"): on Orient, 2 Rim and Zones a selected card gets the red ring the chain cards already use, so the page has one sign for selected. A ring, not a border colour, so the left stripe keeps showing the node's group. CSS only (`viewer.html`, `.zone-canvas .react-flow__node.selected`); every selected card is ringed, though the 3D view still shows only one.
  - **Every line of the Rim output card is wired** (owner, 2026-11-25: "even low point belt should output to the gives to 3 zones, i wonder why currently only rim tips belt is wired"): the card had ONE socket and one wire, from the rim line, which ran behind the rim tips belt card and read as that belt's. Now each line is its own socket (the Zones output card's pattern) and the node that gives it is wired in: Rim line, Rim tips belt, Low-point belt, Rim plane, Rim crossing (`rimOutputLines` gives `{ from, text }`, `RimCanvas.tsx` draws one wire per line). A belt the zone graph no longer takes (its output rewired on Zones) keeps its line with no wire. Display only: the engine always received both belts.
  - **A selected belt is shown with its rim line** (owner, 2026-11-25, to judge whether "inner" is the fitting surface: "the preview should show the rim line and the rim area in slightly different color so i know which side it is leaning to"): selecting the Rim tips belt or the Low-point belt, on 2 Rim or on Zones, now keeps the run's rim line layer visible beside the belt (`isolatedKeys` adds `Dental rim (continuous`). The belt glows in `--node-marks` (dark red), the line is `--layer-rim-edge` (bright pink); the note names the line and says the inner width lies on the fitting-surface side (`previewNote` `rimLine`). The line is the RUN's: a changed Rim setting moves it only after Apply and run.
  - **A belt's side is where a face lies** (engine, owner 2026-11-25 after that view showed it wrong: "why there's gap between rim and area, and even when inner is 0, the outer width 3, why some places, both sides got highlighted"; Fable's design): the engine judged each face by which way it pointed, so the border's underside next to the line counted as inner (a white gap under an outer-only belt) and fitting-side facets tilted outward counted as outer (patches on the other side). geocore `rim_sides.rs` now splits the strip at the rim line's own edges and floods each side without crossing it; one vote per line names the outer side. Measured on the three local denture scans at 3 mm a side (`tests/rim_sides_real.rs`): faces touching the line on the wrong side 3,025 / 956 / 679 under the old rule; one piece per side now, against 50 to 145. It also fixes the Zones "Rim side" node, which shares the rule. A type with no belt widths never calls it, so the standard output is unchanged (`gate:real`).
  - **The found rim no longer breaks at a stray point** (engine, owner 2026-11-25, drawing the missing stretch on a lower denture: "keep today's rim ... only that part of the first image fail to connect"): a join the finder refused as a detour (two picks 3.9 mm apart, 59 mm along the mesh) cut the rim in two. It now first skips up to 2 points to the next one it can reach (geocore `rim_lowpoints.rs` `DETOUR_SKIP`). That case becomes one closed 438 mm loop round its bay; the other two local dentures are unchanged. A benchwork round found it: the rim from a rim-free fitting surface was tried first (plain basins, crest walls - 0 of 3 agreed, Fable's candidates, geocore `tests/rim_fitting_real.rs`) and the owner chose to keep the found rim.
  - **Fable's two UI reviews, the small fixes** (owner, 2026-11-25: "Yes, build 1–7"; the workbench is English only, owner's ruling the same day - "not owner only, mostly owner makes changes"):
    - Rim plane and Rim crossing show in 3D when selected: they have no zone-graph node, so `RIM_TAB_LAYERS` (nodeGraph.mjs) names the run's own layers they isolate (the crossing adds the symmetry plane and the `Oral cavity ray` origin, drawn even though its step is 4). A test fails if a denture Rim-tab node is shown by nothing.
    - The Add-node lists no longer offer what cannot run (`NOT_IN_PALETTE`: Point on a plane, Find sockets on Zones; Stand on the back on Orient, which is Plate side's old name). They stay kinds, so an old saved graph still loads; a test holds every "Not runnable" kind back.
    - The words no longer say the rim is found on Orient: it is found on 2 Rim from Orient's rest pose; "arch frame" reads "the arch shape found on 1 Orient".
    - A filter that matches no case clears the stage and says "Nothing needs a look"; the case, the facts, the tilt chip and the peel chart had stayed on the last case. The arrow keys leave the case list alone while focus is in a field or on the node canvas.
    - In the app (Fable's whole-UI review): the status overlay's hover text is the whole message, so a refusal cut by the ellipsis can be read; a deck drop with a file the deck does not take says so (it was dropped in silence); the card tooltip says "Open the Supports step", not "Step 3" (a denture's supports step is 2 / 2).
  - **Not done, written down:** several nodes selected at once (needs one colour per node and a change to how the canvases report selection); the part rotates about its centre at rest, so its lowest point may dip below the plate drawn in 3D.
- **Debt, written down (Fable's minor items):** the review copies every zone node's values across the wasm boundary on each review, including the app's detected-rim job, though only the workbench reads them - make the getter lazy before a large scan shows it; `useDentureRim` stringifies the whole drawn rim each render to key its re-scan - a reference compare would do; the case flip acts inside `upDecision` - since E1 a flat-base type greys the Flip buttons with the reason, but a type-wide side override still has to go on the Orient graph's own node; a type file whose zone graph still uses the old kind name `rimCurve` (now `rim`, `OLD_KINDS` in nodeGraph.mjs) is renamed by the workbench before it runs but checked as written by the app's engine check, which does not know the old name and refuses it with the node named - no such file exists, the workbench saves the upgraded canvas (the three old outputs are fine: the engine reads that form itself); the walk has no denture fixture, so the flip, the drawn rim, the Step 1 side labels and the aligner-preview guard are proved by headless runs on the local scan, not by the walk.

**Original status: PLANNED. Nothing on this page was built when it was written.** Engine and host facts were opened in source on
2026-11-23 (mixodental `a7a2e2ba`, geocore engine 71). Nothing was run for this page. A line marked
CANDIDATE is something I read but did not prove, or did not measure. Paths starting `denture/` are
under `mixo-geocore/crates/geometry-core/src/dental/denture/`; `viewer.html`, `nodeGraph.mjs`,
`orientGraph.mjs` and `nodeEditor/` are under `dentalwork/batch-review/`.

Companion pages: `docs/ORIENT-NODES.md` (the Orient graph, the two frames, the rim nodes),
`docs/NODE-PLAN.md` (zones as a graph), `docs/TYPE-PIPELINE.md` (the type file).

---

## 0. The feedback in ten lines, and my verdict on each

| # | The owner said | Verdict |
|---|---|---|
| 1 | Split the Orient tab: Orient, Rim detection, Print angle, Zones, Support settings | **Agree with five tabs. Disagree with the order:** Print angle goes LAST (section 3). |
| 2 | Every editable value gets a restore button | Agree. One rule for "default", one pure function (section 4). |
| 3 | Everything is type-specific except the print-angle search | Agree in aim. Two facts change what it means (section 5): the search IS per type today by your own ruling of 2026-11-20, and the APP refuses a type's own graphs. |
| 4 | Every tab has a live 3D preview of what it and the earlier tabs produce | Agree. "Live" is cheap for Orient and Rim, seconds for Zones, and not possible for a full support build (section 6). |
| 5 | Orient nodes are incomplete: no confidence, no slice count, no choice of top or front, the pose ignores what it is given | Agree, and two of today's explanations are factually wrong (section 1). Redesign in section 7. |
| 6 | The final Orient output should name the sides, in 3D, and later tabs should use those names | Agree. One name per side (section 2). |
| 7 | Arch shape vs arch frame: the same thing? | Yes, the same thing shown twice under two names. Fixed by removing one (section 8). |
| 8 | Rim nodes show no input, no output, no setting | Agree. Real settings exist and are listed. A thing with no setting stops being a node (section 8). |
| 9 | Zones: ONE area output; mark support / mark no-support stacked in order; subtract and combine; three colours; select a node to see the stack up to it | Agree, and it fits the engine better than today's three masks. One opt-in rule needs a ruling (section 9). |
| 10 | "Either A or B" should not exist | It is the combine node you ask for, under a name that reads like a switch. Renamed, not removed (section 9). |

---

## 1. The direct questions, answered from the code

**Are "Arch shape" and "Arch frame" the same thing?**
Yes. "Arch shape" on the Orient canvas is `denture/upright.rs` `arch_frame`. "Arch frame" on the rim
canvas (`nodeGraph.mjs` `RIM_TAB_KINDS.archFrame`) is the same frame after the front/back and top
decision, drawn a second time so the rim has something to start from. Two names, one thing. Worse,
the code has a third: `dental/arch_slices.rs` `arch_frame`, a separate footprint reading used only
inside the front/back and top decision.

**Does it detect the arch only, or the teeth side too?**
Both, as a first guess. `upright.rs` `arch_frame` fits the flattest plane through all vertices (the
arch plane), finds the end where the vertices split into two groups (the two legs = the back), and
guesses the teeth side as the side the lowest band leans to (`teeth_offset_mm`, `teeth_decided`).
The next node then overrules both guesses with a stronger test. So Arch shape gives "three axes and
a first guess at their signs", not a final answer.

**How does "Front/back and top" decide? Two sentences.**
Front/back: the arch is looked at flat, and the end that is wider across (the two legs of the U) is
the back (`arch_slices.rs` `arch_frame`; a second check, the emptier centre strip, must agree or is
reported). Top: the arch is cut into 11 cross-sections, each one shaped like an "n" votes that its
dome is the teeth side, and more than half of the voting slices decide (`arch_slices.rs`
`slice_vote`, `denture/up_decision.rs` `DENTURE_SLICES`).

**Two explanations on screen today are wrong, not just unclear.** `orientGraph.mjs`
`KIND_WORDS.upDecision` says "Rays decide which end is the top", and `viewer.html` `DENTURE_STEPS[0]`
says "back-face rays: the side whose rays reach farther is the teeth top". That ray test (T1b) has
been a diagnostic only since engine 23 (`up_decision.rs` header). It decides only for a part with no
arch footprint.

**Why does the upright pose not "choose a side for the plate"?**
Because it has no choice to make. `denture/pose.rs` `PrintPose::from(&ArchFrame)` is three
assignments: plate normal = the frame's back-to-front axis, lean side = the teeth side, turning axis
= across. A denture always stands on its back end (the legs). The node has no parameter and the
frame it receives carries no "this side is the bottom" field. The only way to choose a bottom today
is a different node (`setBottom`), which needs a flat area as input. You read it correctly.

**What do the rim nodes take in and give out?**

| Node (denture) | Takes in | Gives out | Settings today |
|---|---|---|---|
| Rim line (`denture/rim_lowpoints.rs` `find_rim`) | the final orientation (as the canonical frame) and the welded surface | one or more lines along mesh edges, each open or closed, plus the largest empty stretch | none editable. Seven constants in the file (bin 3 deg, shell 2 mm, open gap 20 deg ...) |
| Rim strip (`rim_graph.rs` `EdgeGraph::band`) | the rim line's vertices | faces within the width, along the surface | width = profile `rimBandMm` (2 mm). Real, per type, but not shown as a field |
| Low rim strip | the same | the same, wider | width = profile `lowRimBandMm` (5 mm). Same |
| Rim plane (`rim_plane.rs` `fit`) | the finished rim line | a plane | none |
| Rim crossing (`oral_cavity_ray.rs` `origin`) | rim plane, symmetry plane, the box's back face | one point (where the cavity rays start) | fixed in this version (`zone_graph.rs` `fixed_params`) |

A drawn rim (`denture/drawn_rim.rs`) replaces the detected line for one model. It is per case, not
per type.

---

## 2. One name per thing

The muddle comes from "up", "top" and "bottom" each meaning two things: a side of the PART and a
direction of the MACHINE. The rule: **part sides never use up / down / top / bottom.**

| Thing | The one name | Retired words |
|---|---|---|
| The six sides of the part (the object frame of ORIENT-NODES section 7) | **Front** (closed end of the arch), **Back** (open end, the legs), **Teeth side**, **Tissue side**, **Left**, **Right** | top, up, `up0`, across, -across (as labels; the engine keys stay) |
| The part's sides taken together | **Part frame** | arch frame (as an output name), frame |
| How the part stands at print angle 0 | **Plate side** (the side facing the build plate), **Lean side** (the side that rises as the angle grows) | bottom, upright pose, lean/teeth |
| The machine's directions | **Up / Down** (away from / toward the plate) only | - |
| What tab 1 hands on | **Final orientation** = Part frame + Plate side + Lean side | Orient output, frame + pose |
| Node: reads the arch plane and legs | **Arch shape** | arch frame (node) |
| Node: decides the signs | **Name the sides** | Front/back and top |
| Node: chooses how it stands | **Plate side** | Upright from frame, Set as bottom |
| Zone states | **Support zone**, **No-support zone**, **Undefined** | allowed area, allowed |
| Mask nodes | **Combine (A + B)**, **Subtract (A - B)**, **Overlap (A and B)**, **Invert** | Either A or B, A without B, Both A and B, Everything but A |
| The lean in degrees | **Print angle** | tilt (in UI text) |

Left and Right need a definition before they are drawn. Proposed: as seen from the Front with the
Teeth side toward the viewer's top. CANDIDATE: which sign of `across` that is was not checked on a
scan; step B3 checks it before any label ships. Rim words (rim line, rim strip, low rim strip, rim
plane, rim crossing) keep the names settled in ORIENT-NODES section 10.

All three languages get the same table (`zh-Hant` through `gemini_chat.py`, Taiwan wording).

---

## 3. The five tabs

### The order I recommend, and why it differs from yours

You listed: 1 Orient, 2 Rim detection, 3 Print angle, 4 Zones, 5 Support settings.
I recommend: **1 Orient, 2 Rim, 3 Zones, 4 Support settings, 5 Print angle.**

Reasons, all from the code:

- The angle is picked USING the zones and the support rules. `denture/tilt.rs` `row_with` places
  real tips at every candidate angle with the zones and the rules, then ranks the angles. Edit a
  zone and the pick can move.
- This was your own point on 2026-11-20: "why can the auto tilt tab be completed before support
  zones are set up?" (ORIENT-NODES section 8, which already recommends Print angle last).
- Your preview rule ("a tab shows only what the earlier tabs and itself produce") cannot hold with
  Print angle third: the picked angle needs tabs 4 and 5, so tab 3 could show no pick.
- It is the only tab whose settings you want shared. A shared tab reads better standing apart at the
  end than in the middle of four type-specific ones.

If you still want it third: tab 3 then holds ONLY the search range (start, end, step, margin) with a
slider that leans the part through the range, and the pick is reported on tab 5. That works, but the
range and its result end up on different tabs.

### What lives where, and what each tab hands on

| Tab | What you edit | What it shows in 3D | Hands to the next tab |
|---|---|---|---|
| **1 Orient** | Arch shape, Name the sides, Plate side (or the flat-base nodes) | the part at print angle 0 on the plate, the tight box, six side labels, the plate side marked | **Final orientation**: Part frame + Plate side + Lean side |
| **2 Rim** | Rim line (finder numbers, or the drawn rim), Rim strip, Low rim strip | tab 1 + the rim line, the two strips, the rim plane | **Rim output**: rim line, rim strip, low rim strip, rim plane, rim crossing |
| **3 Zones** | rays, strips, combine / subtract, Mark support / Mark no-support in order | tab 2 + the zone in three colours | **Zone**: one value, three states per face |
| **4 Support settings** | the rules and the tip / pillar numbers | tab 3 + overhangs, low points, tips (live); pillars after Apply | tips and supports |
| **5 Print angle** | start, end, step, margin | everything, leaned to the picked angle; the table of every angle | the picked angle |

Nothing flows backwards. Tabs 1 to 3 never depend on an angle (the object frame rule, ORIENT-NODES
section 7). Tab 4 shows tips at print angle 0 until tab 5 has a pick.

**Host change.** `viewer.html` `STAGES` grows from three entries to five. `drawChain` routes: Orient
-> `drawOrientEditor` only; Rim -> `drawRimCanvas` (made editable, section 8); Zones ->
`drawZoneEditor`; Support -> today's cards; Print angle -> `searchCard` plus the per-angle table
(`drawTilt`). No engine change for the split itself.

**The aligner** gets the same five tabs. Its graph is locked (`dental/aligner_graph.rs`), so its
tabs are read-only cards that still say what each step takes and gives. That replaces today's single
rail of seven cards.

---

## 4. Restore to default, on every editable value

**One rule for what "default" means:** the standard value of the type this draft started from. For
a new type that is the built-in. The button is a small "restore" mark beside the field. It shows
only when the value differs, and its hover text says the value it restores to.

| Value | Where the default comes from | Today |
|---|---|---|
| A node parameter | the default graph's node with the same id, else the kind's own default | canvas has none; only whole-canvas "Back to standard" |
| A profile number (search, rim widths, upright numbers) | the built-in profile | `searchCard` shows "Built-in: 45" in a tooltip, no button |
| A rule | empty = the engine's own value | field placeholder "auto (45)", no button |
| A wire | not per wire: the tab's "Back to standard" | exists for Orient and Zones |

The trap: a kind's default is not always the default graph's value. `KINDS.parallelCast.params.deg`
is 45, but the default graph's `R1b` is 0 (off). Restoring R1b to 45 would switch the steep ray on.
So the lookup is one pure function, `defaultOf(lib, node, key)` in `nodeGraph.mjs` (default graph
first, kind second), with a test that names R1b.

**Host:** `defaultOf` + test; `nodeEditor/ZoneEditor.tsx` draws the mark on each parameter row;
`viewer.html` `settingsBox` and `searchCard` use one shared `restoreMark` helper. Each tab also keeps
one "Restore this tab". **Engine:** none.

---

## 5. Type-specific versus shared - what it means concretely

There are three scopes, not two. The third is the one nobody named.

| Scope | Meaning | Examples |
|---|---|---|
| **Type** | saved in `types/<category>/<id>.type.json`, the same for every scan of that type | graphs, profile numbers, pinned rules |
| **Shared** | one value for every type | (today: nothing a user can edit; only engine constants) |
| **This case** | belongs to one scan, never to a type | the drawn rim (`PrintUnit.dentureRim`), a hand-flipped side (section 7), the angle dialled by hand in the app |

Where each tab's settings live today (`src/dentalTypes/typeFile.ts`, `denture/profile.rs`):

| Tab | Setting | Stored in | Per type today? |
|---|---|---|---|
| Orient | the Orient graph | type file `orientGraph` | yes, in the workbench and (since E1, 2026-11-23) the app |
| Orient | the five Arch shape numbers | type file `profile.upright` | yes |
| Rim | rim strip widths | `profile.placement.rimBandMm`, `lowRimBandMm` | yes |
| Rim | the finder's numbers | constants in `rim_lowpoints.rs` | no: shared by every type, not editable |
| Zones | the zone graph | type file `zoneGraph` | yes, in the workbench and (since E1) the app |
| Support | pinned rules | type file `rules` | yes, in the workbench and (since E1) the app - the unit's own four (Overhang angle, the three denture options) seed its controls |
| Support | tip and pillar numbers | `profile.placement`, `profile.supports`, `profile.stability` | yes |
| Print angle | start, end, step, margin | `profile.pose` | **yes, per type** |

Two consequences:

1. **"Type-specific" is only true in the workbench today.** The engine holds ONE Orient graph and
   ONE zone graph for everything (`orient_graph.rs` `OVERRIDE`, `zone_graph.rs` `OVERRIDE`), so the
   app refuses any type that carries its own graph or pins a rule
   (`src/dentalTypes/shippedTypes.ts`, the reasons at lines 39-40). Until graphs are registered WITH
   their type (unit E3 in TYPE-PIPELINE), a type you build on tabs 1 to 3 cannot run in the app.
   That is step E1 below, and it is what makes your sentence true. **BUILT 2026-11-23** - see
   E1 in section 11.
2. **The print-angle search is per type today, by your ruling.** TYPE-PIPELINE section 7, rulings 3
   and 5 (2026-11-20): "the print angle is set in the workbench as the type's default behaviour" and
   "the start angle is set per type". Today's feedback says the opposite. Both cannot hold; see
   decision D2. The whole profile is also one strict block (no missing key, no unknown key), so
   taking four numbers out of it is a schema change in both engine halves.

---

## 6. Live 3D preview per tab

**Today nothing is live.** The 3D view shows a GLB the batch wrote. An edit shows only after "Apply
and run again", which runs the whole chain including the support build (about 23 s a case).

**What "only this tab and the earlier ones" needs: almost nothing new.** The viewer already has a
step cut-off: `stepShows(key)` hides every layer after step N (`viewer.html`, "Walk steps"). Each tab
maps to a cut-off. That is a table, and it works on the GLB already on screen.

**What "live" needs: a preview that stops early.** The engine can already stop early:

| Tab | Engine call that is enough | Builds supports? | Expected cost |
|---|---|---|---|
| Orient | `denture_orient_nodes` (each node's value as JSON) | no | CANDIDATE: under a second |
| Rim | `denture_review_ruled` (rim, strips, masks, tips at an angle) | no | CANDIDATE: about a second |
| Zones | the same; the ray casts dominate (up to 1.5 million rays each) | no | CANDIDATE: seconds |
| Support settings | the same for tips; the real build for pillars | tips no, pillars yes | tips: seconds. Pillars: Apply |
| Print angle | `denture_tilt_scan_ruled` | no | CANDIDATE: seconds |

None of those costs was measured. **Step A2 measures them before anything is built on them.**

**Mechanism (recommended, the smallest):** `serve.mjs` gains `POST /preview`. It keeps one warm
engine process with the case on screen loaded, sets the graphs, makes the call for the tab, and
returns a small GLB of that tab's layers using the layer writers that already exist
(`dentureReviewLayers.ts`, `maskLayers.ts`, `orientLayers.ts`). The viewer swaps the layers in. Edits
are debounced; a stale reply is dropped. No layer code is rewritten in the browser.

**What stays honest:** the status line keeps its two facts (what the canvas holds, what made the
picture). A preview is marked "preview, not yet applied". Save type still saves only what RAN.

**Where I disagree with "all tabs live":** the support build cannot be live (23 s here, 111 s per
angle measured in ORIENT-NODES section 9). Tab 4 previews TIPS live and pillars on Apply. Saying
otherwise would be a preview that lies.

**Named sides in 3D.** The Final orientation is drawn on every tab: the tight box with a label on
each of its six faces (Front, Back, Teeth side, Tissue side, Left, Right), and the plate under the
Plate side. The data exists (`denture_orient_nodes` gives the frame's axes; the box is the existing
TIGHT BOX layer). Later tabs use the same six names: the zone ray directions (`nodeGraph.mjs`
`DIRECTIONS`) already use back / front / teeth / tissue, and across / -across become Left / Right.

---

## 7. Orient, redesigned

### The rule for what is a node (used in sections 7, 8 and 9)

**A thing is a node only if it has a setting, or can be swapped for another node. Anything else is a
row on the tab's Output card.** A canvas of boxes with nothing to set is a diagram, and you were
right to call it meaningless.

### The three nodes of a denture

| Node | Takes in | Gives out | Settings (default, all with restore) | Readouts on the node |
|---|---|---|---|---|
| **Arch shape** `archFrame` | the scan | the three axes, with a first guess at their signs | the five `profile.upright` numbers: end band 25 %, legs gap ratio, teeth band, teeth offset mm, flatness max | flatness, legs gap ratio, teeth offset mm, "teeth side guessed / not sure" |
| **Name the sides** `upDecision` | Arch shape | the Part frame: six named sides | **Front is:** auto / the other end. **Teeth side is:** auto / the other side. Slices: 11 | front/back: widths at each end, margin, "cross-check agrees"; teeth side: slices for / against / not voting out of 11, confidence %; whether each guess was turned round |
| **Plate side** `plateSide` | the Part frame (and a flat area, only when chosen) | Plate side + Lean side | **Plate side:** Back (default) / Front / Teeth side / Tissue side / Left / Right / the flat area. **Lean toward:** Teeth side (default) / any other side. **Lean** 0 deg | which side faces the plate, which rises |

The **Final orientation** card (the output) says it in one line and draws it: "Stands on: Back.
Facing up: Front. Leans toward: Teeth side. Left / Right as labelled." That is the new default every
later tab starts from.

### What changes

**Engine (geocore):**

- `orient_graph.rs` `node_values`: add the readouts. The numbers already exist in `ArchFrame`
  (`flatness`, `legs_gap_ratio`, `teeth_offset_mm`, `teeth_decided`) and `UpDecision` (`front_back`,
  `slice_votes`, `confidence`, `flipped`, `teeth_flipped`); today only the axes are sent. No
  behaviour change.
- `upDecision` gets two parameters, `front` and `teethSide` (`auto` | `other`), applied after
  `decide_up`. Default `auto` = today, bit for bit.
- New kind `plateSide {plate, leanToward, angleDeg}`. With `plate: back, leanToward: teeth, 0` it
  takes today's path (`PrintPose::from(&ArchFrame)`) so the default stays bit-equal; any other
  choice uses `set_bottom`'s arithmetic with the chosen side's direction as the normal.
  `uprightPose` and `setBottom` stay readable as old names for it (the `OLD_KINDS` pattern).
- Slices as a parameter (odd, 5 to 31, default 11): optional, last. `DENTURE_SLICES` was measured on
  real scans; exposing it is cheap, but it is the first detector threshold to become a dial.

**Host:** `orientGraph.mjs` `KINDS`, `KIND_WORDS` (corrected words from section 1), `PARAM_WORDS`,
`LIMITS`; the upright numbers edit `profile.upright` through the profile door the search fields
already use (`register_denture_profile`). **UI:** readouts on the node; the Final orientation card.

### The override you asked for has two homes, and you need both

- **In the type** (`front: other` on the node): for a kind of part where the detector's idea of
  front is always the wrong way round. Rare.
- **For this case** ("flip front" / "flip teeth side" on the 3D view): for the one scan where the
  slice vote was wrong. This is the common need, and it cannot live in a type, because a type runs on
  every scan. It needs one engine slot set per job, the same pattern as the drawn rim
  (`drawn_rim.rs`: one slot, set by the host before each job, its digest in the cache key).

What stays the same: a detector that says "I cannot tell" (`no-legs`, `both-ends-split`,
`no-arch-plane`) is still a hard stop. An override turns a decision round; it never invents one.

---

## 8. The Rim tab, redesigned

Apply the node rule:

| Today's rim-tab node | Node or row? | Settings (all with restore) |
|---|---|---|
| Arch frame | **Neither. Removed.** It becomes the read-only chip "Final orientation, from tab 1" | - |
| Rim line | **Node** | Source: detected / drawn for this case. Finder: bin (3 deg), shell (2 mm), open gap (20 deg) |
| Rim tips belt (was Rim strip, then Rim belt) | **Node** | Inner and outer width from the rim line (profile `rimBandInnerMm` / `rimBandOuterMm`, standard 2 mm each = `rimBandMm`) |
| Low-point belt (was Low rim strip, then Low rim belt) | **Node** | Inner and outer width (profile `lowRimBandInnerMm` / `lowRimBandOuterMm`, standard 5 mm each = `lowRimBandMm`) |
| Rim plane | **Row** on the Rim output card | none exist |
| Rim crossing | **Row** on the Rim output card | fixed today; stays a row until the engine reads an edit |

Every node shows two lines under its title: **Takes:** and **Gives:**, generated from the kind
table (`inputs`, `out`), so they cannot drift from the wiring. The **Rim output** card lists what tab
3 receives: rim line (lines, open or closed, detected or drawn), rim strip, low rim strip, rim plane,
rim crossing.

**Which settings are real, and what each costs:**

| Setting | Real today? | Change needed |
|---|---|---|
| Strip widths | yes, in the profile; the engine grows the strips at the profile's width (`zone_graph.rs` `rim_strip`) | host only: the node's field edits the profile number. One truth, shown on the node |
| Strip side | yes, built today as `rimSide` (step 9, off by default, not yet shown to you on real scans) | host: a Side choice wires `rimSide` behind the strip. Shown with pictures on real scans first |
| Drawn rim | yes, per case (step 10) | host: the workbench has no rim drawing tool; the app has. Workbench shows the source only |
| Finder numbers | no: constants | engine: three parameters on the RIM node, read by `find_rim`; the zone-graph digest already joins the analysis cache key |

**One engine graph, two canvases.** The engine keeps ONE zone graph file. The host draws its rim
nodes on tab 2 and the rest on tab 3 (each kind already carries a `stage` in `nodeGraph.mjs`). Tab 3
shows the rim results in a read-only "From the Rim tab" group. So the type file's shape does not
change for this.

**Moved here from Zones:** the two rim-strip OUTPUTS that were freed today (step 7.3) belong to the
Rim output, not the Zone output. "The rim strip on the inner side only" becomes the strip's Side
setting instead of a rewired zone output. Same capability, in the tab it belongs to.

---

## 9. Zones, redesigned - one output, three states

### Your model, stated exactly

- Rays, strips and finds each give a set of faces.
- **Combine** and **Subtract** shape sets of faces before they are marked.
- **Mark support** and **Mark no-support** each take "the zone so far" and a set of faces, and give
  a new zone. Chained in order. **A later mark wins over an earlier one.**
- The output is ONE value, the **Zone**: each face is Support, No-support, or Undefined (no mark
  ever touched it).

Today's denture in that form, and it is the default:

```
NS   = Combine(R1, R1b)              # the two parallel rays
AL   = Combine(SIGHT, BAND)          # cavity rays + the strip round the holes
Z1   = Mark no-support(faces NS)     # layer 1
ZONE = Mark support(Z1, faces AL)    # layer 2 wins where both -> "allowed overrides no-support"
zone = ZONE
```

### Does one output lose anything? Checked against every reader

Today the engine reads three masks: allowed (A), no_support (N, before the override) and
allowed_cavity (C). Every reader, and what it needs:

| Reader | Reads today | With one Zone |
|---|---|---|
| Area tips (`ruled_tips.rs` `place_ruled_given`) | only on A | Support. **Same** |
| Lowest points and islands (`ruled_tips.rs` `low_reason`) | A: yes. Not N: yes (default mode). Else only in the low rim strip | Support: yes. Undefined: yes. No-support: only in the low rim strip. **Same** |
| Why an island was refused (`denial`) | N or not | No-support or Undefined. **Same** |
| Pillars landing on the model (`model_landing.rs` `policy_of`) | A, and N without A | Support, No-support. **Same** (it already computes exactly the three states) |
| Sockets cancel (`Analysis::socket_cancel`) | A | Support. **Same** |
| Review counts (`review.rs`) | A, else N, else neither | the three states. **Same** |
| Angle ranking, "unwanted tips" (`tilt.rs` `row_with`) | not A, **or N even when A** | needs N before the override. **Kept:** the engine derives "every face any Mark no-support touched" from the stack. Same |
| Rule `rimRespectsNoSupport` (off by default; `ruled_tips.rs` `consider`) | N and not C | **the one real gap**, below |

So the three states are already what the engine works in. `model_landing.rs` builds them by hand.
The one-output model is the engine's real model, made visible. I agree with it fully.

**Undefined is a real third state, not a display trick.** With the default rules a lowest point on
an Undefined face still gets a tip; on a No-support face it does not. CANDIDATE: the viewer's
Undefined layer text says "They get no tips, same as the no-support zone" (`viewer.html`, the layer
table), which `low_reason` contradicts for lowest points. Corrected in step B1.

**The one gap.** With "rim obeys no-support" ON, a rim or hole tip is dropped on a face the 45-degree
rays hit unless the CAVITY rays see it. The hole strip does not count as "seen". In the one-Zone
model the hole strip is simply marked Support, so those tips would stay. Two ways out:

- (a) the rule reads the final Zone: drop rim and hole tips on No-support faces. Simpler. Changes
  results only with that rule on, only on faces that are in the hole strip, hit by the 45-degree
  rays and not seen by the cavity rays.
- (b) Mark support gets one checkbox, "rim and hole tips treat this as seen" (on for the cavity
  rays, off for the hole strip). Exact, one more thing to explain.

Recommendation: measure (a) on the real scans with the rule on. No tip differs -> take (a). Any tip
differs -> take (b). Decision D5.

**What is NOT part of the Zone, and where it goes.** Three things on today's Zone output are not
zones. They say where a KIND of tip is placed, and placement samples them directly:

| Today's output | What it really is | New home |
|---|---|---|
| `rim_band`, `low_rim_band` | where rim tips go; where a low point is rescued | Rim output (tab 2) |
| `hole_band` | where hole tips go. Fixed in the engine today | a read-only row on the Zone card: "hole tips go on the strip round the holes" |
| `rim` | the rim line | Rim output (tab 2) |
| `sockets` | computed inside placement, by rule `socketNoSupport` | Support settings (tab 4), as that rule |

So the Zone output node has exactly ONE socket.

### "Either A or B"

It is the union: the faces in A, or in B, or in both. That is your combine node. The name reads like
a switch that picks one, which is why it looked wrong. It becomes **Combine (A + B)**. The other
three keep their job under plainer names (section 2). None is removed: saved graphs use them, and
Overlap is what "this strip, but only on that side" needs.

### Preview

- Three colours, always: Support, No-support, Undefined. All three layers exist today
  (`maskLayers.ts` `facesInNone` made the Undefined one); they become one legend with three fixed
  tokens.
- Select a **Mark** node: the 3D view shows the Zone exactly as it stands at that node, nothing
  later.
- Select a ray, strip or combine node: its faces alone, in one highlight colour.
- Nothing selected: the final Zone.

### What changes

**Engine (`denture/zone_graph.rs`):**

- A second value kind beside the face mask: `zone` (one small number per face). Kinds `markSupport`
  and `markNoSupport` (`under`: zone, optional; `faces`: mask). One free output, `zone`.
- `evaluate` derives the masks placement reads: allowed = Support; no_support = every face a Mark
  no-support touched; allowed_cavity per decision D5. **No reader in `ruled_tips.rs`, `tilt.rs`,
  `model_landing.rs` or `review.rs` changes.** That is what keeps the risk small.
- The old three-output graph keeps running unchanged for one version, so no saved graph breaks. It
  goes away with the next type-file version.
- Per-node results for the preview: the evaluator already keeps every node's mask
  (`ZoneOutputs.nodes`); a new call hands them out. The review does not export them today.

**Host:** `nodeGraph.mjs` `TYPES` gains `zone`; the two Mark kinds; `REQUIRED_OUTPUTS` becomes
`{ zone }`; `upgradeGraph` rewrites an old graph into the new form; `zoneGraphParity.test.ts` gains
the new corpus. **UI:** `ZoneEditor.tsx` reports the selected node; the viewer asks for that node's
layer.

**The proof that nothing moved:** a Rust test that the new default and the old default give
bit-equal allowed / no_support masks on the test shells and the local scans; then `npm run
gate:real`, "No differences".

---

## 10. The build order

Small steps. Each proves one thing before the next starts. A and B need no engine change.

| Step | What | Where | What it proves | Needs you |
|---|---|---|---|---|
| **A1** | Words: the corrected explanations (section 1), the name table (section 2), Takes / Gives lines on every node, the four combine names | host: `orientGraph.mjs`, `nodeGraph.mjs`, `viewer.html` `DENTURE_STEPS`, `RimCanvas.tsx`, `ZoneEditor.tsx` | `nodeGraph.test.ts` / `orientGraph.test.ts`: every kind has words, Takes and Gives come from the kind table | D6 (names) |
| **A2** | Measure the preview costs of section 6 on the real scans | a script | the table of real numbers; decides how live each tab can be | no |
| **B1** | The five tabs; layers cut off per tab; Undefined text corrected | host: `viewer.html` `STAGES`, `drawChain`, a pure tab-to-layers table | a test of the table; a look in the browser at 1440 x 900 on a denture and an aligner run | D1 (order) |
| **B2** | Restore marks | host: `defaultOf` + test, `ZoneEditor.tsx`, `settingsBox`, `searchCard` | the R1b test; restoring every field gives `isDefault` | no |
| **B3** | Orient readouts and the six side labels in 3D | engine: `node_values` only; host: labels layer | readouts equal the review's `upDecision` numbers; Left / Right checked on a real scan | vendoring approval |
| **C1** | `/preview` for Orient and Rim | host: `serve.mjs`, existing layer writers | an edit shows without Apply; a stale reply is dropped; Save type still saves only what ran | no |
| **C2** | Orient redesign: side overrides, the Plate side node, the per-case flip | engine `orient_graph.rs` + one per-job slot; host | default bit-equal; `gate:real` no differences; a flipped case orients the other way and says so | D3 |
| **C3** | Rim tab editable: widths, side, finder numbers, the Rim output card | engine: three RIM parameters; host | defaults bit-equal; `gate:real`; pictures of inner / outer on real scans | your look at the pictures |
| **D1** | Zones: the Zone value, the Mark nodes, old graphs upgraded | engine `zone_graph.rs`; host `nodeGraph.mjs` | the bit-equal test of section 9; `gate:real`; the parity corpus | D5 |
| **D2** | Zones preview: three colours, select a node | engine: per-node results; host | selecting each node of the default graph shows the expected faces on a real scan | no |
| **D3** | `/preview` for Zones, tips on tab 4, the scan on tab 5. **BUILT 2026-11-23** (two routes, /zone-preview and /tilt-preview; measured ~5 s and ~8 s on the local scan in place of A2's table) | host | costs match A2 | no |
| **E1** | Graphs and pinned rules registered WITH their type, so the app runs them (TYPE-PIPELINE E3). **BUILT 2026-11-23** - graphs per job, pinned rules in every job (see the status at the top) | engine: a slot per profile id instead of one global; app: `shippedTypes.ts` stops refusing | a type with its own graphs loads and runs in the app; two types in one project keep their own graphs | no, but it is the largest step |
| **E2** | Print-angle search as decided in D2 | depends on D2 | - | D2 |

Order: A1 and A2 at once. Then B1, B2, B3. Then C and D in order. E1 can start any time after A1
and is independent of the UI work. Every step ends with its tests, the affected docs
(`ORIENT-NODES.md`, `NODE-PLAN.md`, `TYPE-PIPELINE.md`, `batch-review/README.md`, `types/README.md`)
and the local gate before a push.

**What stays the same throughout:** the default denture and the aligner give the same results
(`gate:real` after every engine step); the hard print checks, the safety engine and refusal reasons
are never nodes (ORIENT-NODES section 2); a type file written today still loads; Save type saves
only what ran.

---

## 11. Where I disagree, in one place

1. **Tab order.** Print angle last, not third (section 3).
2. **"All tabs live."** Pillars cannot be live. Tips can (section 6).
3. **"Nodes without settings are meaningless" - agreed, but the fix is not to invent settings.**
   Some things have none (rim plane, rim crossing). They become rows on an output card.
4. **Detector thresholds as dials.** I would expose the five upright numbers and the three rim
   finder numbers, each with restore, and hold the slice count for last. Every one of them was
   measured on your scans; a restore button makes the experiment safe, it does not make the new
   value proved.
5. **"Either A or B shouldn't exist."** It should, under another name. It is the combine node.
6. **Top and front "chosen by the user".** Keep automatic as the default with an override, in two
   places (type and this case). Asking on every scan would undo the detector, which is right on the
   scans measured so far.

## 12. Gaps you did not mention

1. ~~A type's own graphs do not run in the app at all yet (section 5).~~ Closed by E1 (2026-11-23):
   they run, and so do its pinned rules (the unit keeps its own four).
2. Per-case overrides are a third scope beside type and shared (sections 5 and 7).
3. Two on-screen explanations describe a ray test that stopped deciding at engine 23 (section 1).
4. The rule `rimRespectsNoSupport` is the one reader the one-Zone model cannot serve as is
   (section 9).
5. CANDIDATE: the angle ranking counts a tip as "unwanted" on a face that is allowed but was also hit
   by the 45-degree rays (`tilt.rs` `row_with`: `!allowed || no_support`). The file's header says
   "outside the allowed area". The plan keeps the code's behaviour exactly; whether it is intended is
   worth one look.
6. The workbench cannot draw a rim; only the app can. Tab 2 can show a drawn rim's source but not
   make one.
7. Left and Right have no definition yet (section 2).
8. The aligner's tabs are read-only until an aligner node is freed. The dental-model kind (flat
   base) still waits for your sample file and ruling 4 of ORIENT-NODES section 6.
9. Every new name needs Japanese and Taiwan Chinese wording.

## 13. Decisions for you

| # | Question | Recommendation | Why |
|---|---|---|---|
| **D1** | Tab order: Print angle third, or last? | **Last.** | The pick depends on zones and support rules; third breaks your own preview rule. |
| **D2** | Print-angle search: shared by all types, or per type (your ruling of 2026-11-20)? | **One shared standard per category that every new type starts with and can restore to; the numbers stay in the type file.** | A type stays a complete, proved recipe, and a later change to the standard does not silently change every saved type. Truly shared (out of the type file) is a schema change in both engine halves and makes every type's result depend on a file outside it. |
| **D3** | Top / front override: in the type, per case, or both? | **Both. Per case first.** | The case flip is the real need; the type setting is for a kind that is always the other way round. |
| **D4** | Restore goes back to what? | **The type this draft started from (the built-in for a new type).** | One meaning everywhere; the hover text shows the value. |
| **D5** | "Rim obeys no-support" under one Zone: (a) read the final Zone, or (b) a checkbox on Mark support? | **Measure (a) on the real scans; take it if no tip differs, else (b).** | (a) is simpler; (b) is exact. The measurement decides. |
| **D6** | The names of section 2, especially Front / Back / Teeth side / Tissue side / Left / Right, Plate side, Support zone? | **Accept as listed.** | Part sides never say up or top; the machine keeps Up and Down. |
| **D7** | Which detector numbers become dials now? | **The five upright numbers and the three rim finder numbers. Slice count later.** | Real settings without inventing any; each has a restore. |
| **D8** | Is a "clear mark" node (back to Undefined) wanted? | **No, not until a real zone needs it.** | Subtracting before marking covers it; one less node. |
