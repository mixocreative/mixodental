# Review UX refinement — 2026-11-20

The folder review (`typelab/viewer.html`) with its three stage tabs (**1 Orient**,
**2 Zones**, **3 Support settings**) and the zone node canvas (`nodeEditor/ZoneEditor.tsx`, built with
React Flow), looked at whole at 1440x900. The owner asked for the typelab node UI to be refined and
the whole UX reassessed. Two EGM reviews (a naive reader, a scope reviewer) read the plan; **Fable**
(the senior reviewing model this project consults on design decisions) decided the open questions.
The owner added four requests while it was being built; they are marked **owner**.

## What changed, and how each was checked

| # | Defect or request | Change | Checked by |
|---|---|---|---|
| 1 | **owner:** no room for the editor | A divider between the 3D view and the stages: drag, arrow keys, double-click to fit; remembered per viewer. The canvas grows with it. | Real mouse in Playwright: canvas 360 to 450 px on a 75 px drag; the 3D view never under 160 px; survives a reload; double-click resets. |
| 2 | Output node centred, double border | Its node type was named `output`, which React Flow styles itself; renamed `zoneOutput`. | Screenshot. |
| 3 | **owner:** the outputs Orient sets were drawn as nodes | Nodes only fixed outputs need (rim line, both rim strips, sockets) are not drawn; their sockets show ✓ "already set in Orient" / "already set by the engine". They stay in the graph, because the engine checks those outputs by name. | Screenshot. |
| 4 | Text unreadable at fit-to-view | Fit (on load and the fit button) covers only what is drawn; each explanation is two lines, whole on hover or when selected; a dropdown gets its own line so its words are not cut. | Screenshot: sentences legible at 1440 px. |
| 5 | Problems listed by engine id, node not marked | A message naming a node (`R1: ...`) shows on that node; a problem turns its border red, a warning is amber text. | Screenshot (R1b's "tilt is 0° - this ray is off"). |
| 6 | Stage 3 shorthand ("low outside"), a 0/1/2 mode as a text box, "engir" | Every typelab rule has a plain `label` with its unit; a mode is a dropdown of described choices (checked against `ruled_tips.rs` `low_reason`). | `rules.test.ts`: a rule without a label or unit, or a mode without choices, fails. |
| 7 | Print-angle figure about 6 px text, no picked angle, and a WRONG help text ("teeth end DOWN") | Drawn from the numbers: plate, upright 0°, arc to the search end, the picked angle in red, and one sentence. | Engine read by Fable and re-read here: `denture/upright.rs:25` (plate normal from the legs end to the apex), `pose.rs:13-17` (a positive degree turns the teeth side up). |
| 8 | **owner:** a selected card's title went unreadable | `base.css` paints a pressed button's text in `--paper` for its dark fill; the card drops the fill. The card title now keeps `--ink`. | Measured: pressed button text rgb(244,242,237) before, card title rgb(59,54,49) after. |
| 9 | Colours that were never drawn | Fourteen reads of `--accent` and `--panel`, which this page does not load, drew the canvas, the figure and the divider with no colour. Replaced with `--red`, `--surface`, `--sunken`. | `src/ui/cssTokens.test.ts` now checks the review page against the stylesheets IT loads; it failed on both tokens before the fix. |
| 10 | No first-run hint | "Edit, then Apply and run again. Reset to today undoes every edit." under the status line (Fable's wording). | Screenshot. |
| 11 | A node added from the toolbar landed off-screen | It lands in the middle of the current view. | Code path; not yet driven by a walk. |

## Decided against, with the reason

- **Shift+A / right-click "add node here"** (Blender): cut. Nobody asked, and a shortcut does not help a
  first-time operator; item 11 solves the real problem (Fable, EGM).
- **A "Fixed in this version" band on the canvas**: built, then replaced by item 3 on the owner's call.
- **A minimum zoom of 0.75**: cut; it fought fit-to-view (EGM, Fable).

## Not in this pass, with the reason

- **Editable print-angle start / end / step in Orient** (owner asked). The tilt range is a profile
  field, not a rule (`denture/profile.rs:42`), and no call accepts a profile at run time yet. How a
  type made in the workbench reaches the app is the architecture question in `docs/TYPE-PIPELINE.md`.
- Per-node face counts and click-a-node-to-see-its-mask: the engine computes each node's mask
  (`ZoneOutputs.nodes`), but nothing carries it to the GLB. That is an ABI and writer change.

## The `/cia` audit of the edited-graph channel (same night)

A cold auditor (`cia`, Screen tier, read-only) walked Apply → `serve.mjs` → `typelab` → `batch.ts` →
the engine → `summary.json` → the status line, asking where an edited graph could fail while the
operator saw success. Each finding was opened in source before it was fixed.

| # | Finding | Fixed by | Proved |
|---|---|---|---|
| F1 | A refused run showed "typelab exited 2"; the reason sat in a log the page never read. Apply did not check the graph first. | The page shows the refusal line from the run's log (the header and the problem under it), and Apply refuses a graph with problems before any run. | On the page: a 30° steep ray now reads "...outside 45-90 (exclusive) as OFF..."; a loose input reads `Fix the zone graph first (2 Zones): NS: input "b" is not connected`, with no run started. |
| F2 | "Done" was built from the request, so it could claim an edited graph ran when the summary said default. | "Done" reads the summary; an edited request answered with `default` says the graph was NOT applied. | A real 2-minute run on case-001 (R1b 60°): "Done ... (graph d7dc809c)", the digest from the run's own summary. The NOT-applied branch: `rerunReport.test.ts`. |
| F3 | No handler for a spawn error or a hung run: "Running..." forever, or a crashed server. | One answer per request: exit, spawn error, or a 15-minute limit. | `rerunReport.test.ts` with a stand-in process: a run past its limit is killed and answered once; a spawn error then an exit is answered once; an exit in time never fires the limit. |
| F4 | The steep angle in a restored graph did not reach the rule field; the CLI only printed a note. | Mirrored at load; the CLI refuses a graph R1b angle with no rule. | On the page: the restored 30° appeared in the rule field. |
| F5 | The status never said whether the canvas still was the graph that ran. | After an Apply on this page: "The canvas matches that run" / "has changed since that run". | After that run: "matches"; one dropdown changed: "has changed since that run"; changed back: "matches". |
| F6 | One `/out/` for the whole server: two tabs re-running at once see whichever finished last. | **Not fixed**, marked `shortcut:` in `serve.mjs`: one operator, one tab today. | - |
| F7 | A summary without `zoneGraph` read as "the default graph". | Reads as "a graph this folder does not record". | Code path. |
| F8 | A `MIXO_ZONE_GRAPH_FILE` left in the shell would run a graph nobody asked for. | `typelab` passes it on only from `--zone-graph`. | Code path. |

Also named by the audit and left as debt: `isDefault` compares JSON text, so it depends on key order.
Every graph here is written by the same code, so the order is stable; a graph from elsewhere (the
planned type file, the MCP drafts) must go through the same writer, which `docs/TYPE-PIPELINE.md`
already requires.

## Second pass, same night (owner: "a holistic UX/UI review before you can say done")

Fable reviewed six fresh screenshots plus the code; every finding below was fixed and re-shot.

| Finding | Fix |
|---|---|
| Zones canvas unreadable: ~7 rows of chrome, controls below the fold | One status line, one toolbar (completeness, colour key, add, back to standard); with the divider dragged the canvas fills the stage area so its controls stay in view; minimap 120x80, hidden under 1100 px. |
| Settings clipped inside cards (`.chain-sets` max-height 96 px) | No max-height; a dropdown takes its own line under its label; number boxes 84 px. |
| Yes/no rules were checkboxes; empty numbers read "default" | Yes/no dropdowns ("no (standard)" / "yes"); empty numbers say "auto (45)" with the engine's value. |
| No visible way to remove a node | A "×" on the selected node (Delete still works); the Add button's hover says how. |
| Group colours had no key | A colour key in the toolbar, matching the stripes and the grouped Add list. |
| Three numbering systems | Only the stage tabs are numbered; cards drop their step numerals. |
| Programmer wording | "Standard zone setup - nothing changed", "All connections are complete", "Either A or B", "A without B", "Both A and B", "Everything but A"; engine ids only on hover. |
| Contradictory case result | A plain **Verdict** line first ("Built - needs a look: ..."); "Reason code" is "Why it needs a look". |
| Ambiguous buttons | "Discard my changes" (resets the search, the zone setup and the settings), "Back to standard setup". |
| "fixed" read as "repaired" | "locked", with the reason on hover. |
| Clipped side panels | Panels scroll; long case names end in "...". |
| "Compare with owner" | "Compare with your own supports file". |
| **Found while re-shooting:** the pressed stage tab went blank under the mouse | `base.css` whitens every hovered button while the pressed state paints its text paper-white; a pressed tab (and the segmented switch) now keeps its dark fill on hover. |
| **Found while testing:** a duplicate `const` blanked the whole page | `viewerScript.test.ts` parses the page's inline module script with esbuild; proved by planting the duplicate. |

## The whole app, journey by journey (same night)

Owner: "keep refining ... the entire app holistically, and every UI element end to end" and "also the
holistic UX work flow". Evidence: a full walk run with `WALK_SHOTS` (70 screenshots, one per numbered
step) reviewed by Fable against the design docs. Caveat it named: the screenshot hook does not wait, so
some stills lag their step; findings from a still alone are marked UNVERIFIED there.

| # | Finding | Status |
|---|---|---|
| 1 | A "DEBUG" panel (trim lines, U ends, bottom plane) shows in every dental step | **Owner decision.** The walk tests it by name (`debug-layers-title`, `debug-angle`), so it is a deliberate diagnostics panel, not a leak. Proposal: keep it for the workbench, hide it in a release build. |
| 2 | The status line is stale ("Drop an aligner STL ..." with a model loaded) and cut off on dental steps | **Traced, engine-side.** The line is chosen per gesture KIND (`editing/modes.ts:71`, a fixed string per kind) and Step 1 is one kind, `dental-aligner`, before AND after a file is loaded (`src/dental/editingMode.ts:467`), so it can only say one sentence. Fix: let a mode give a status per phase (a function of the gesture) in geocore `editing/`, then two sentences in three languages. The cut-off is a deliberate one-line overlay (styles.css comment). **Fixed 2026-11-21:** geocore a27efd4 (pushed with the owner's yes) lets `gestureStatus` be a function of the gesture; a loaded Step 1 now shows the badge's own instruction (denture via `kindText`), `src/dental/editing/dentalStep1Status.test.ts`. |
| 3 | Check markers from Step 3 stay on the model at Step 1 and on the next aligner | **Fixed.** Reproduced in the browser: Check at Step 3 found 2, and Back still handed those 2 to the viewport at Step 2 and Step 1, where no support is drawn. `shownProblems` (`src/dental/step1View.ts`, tested) draws findings in a dental session only at Step 3; measured after the fix: 2 at Step 3, 0 after Back, 2 again on returning. |
| 4 | The status overlay is drawn over the left panel ("Check for unsupported spots") | **Fixed:** the overlay spans the scene column only (`--workspace-left/right`, one place for the panel widths). |
| 5 | The deck uses four nouns (file, model, item, object) | **Fixed 2026-11-21 (owner: "you can decide"):** a deck row is a **file** - the page is Your files and the Japanese and Chinese already said ファイル / 檔案, only the English said item (`3 files left`, `Start this file`). **Model** stays for the shape drawn and turned on a card, **object** for the plate (Arrange objects, the export), as the glossary keeps them. |
| 6 | "Each object with model" does not say it exports | **Fixed 2026-11-21:** `Export all STL` (ja すべての STL を書き出す, zh 匯出全部 STL - the glossary's Export). |
| 7 | A card says "Generating supports..." while its chip says "Ready" | **Fixed.** Confirmed in walk shot m11: "Ready" was the orientation's verdict, shown beside the run's own picture. The chip now steps aside while the card's run is queued or running and comes back after (`ItemRow.tsx`; test in `ItemsPage.test.tsx`, which fails on the old line). |
| 8 | The deck's progress toast covers the footer | **Fixed.** Confirmed in shot m2: the background-work panel kept the viewport's absolute bottom-left place on the deck and covered the counts line. It is now a block in the deck footer's flow, above the case keys (`ItemsPage` `activity`). Measured in the browser during a scan: panel 701-765 px, counts line from 868 px. |
| 9 | An import error stays up while the next model is worked on | **Checked, by design** (walk shot u5): it is a failed job's row in the background-work list, naming its file, with Dismiss. A failure stays until a person dismisses it so that it cannot vanish unseen. **Owner decision** only if it should also clear when the next file is opened - which would let a failure go unread. |
| 10 | "Left the aligner on the plate without supports" after Exit with nothing on the plate | **Fixed 2026-11-21:** geocore 5319c86 (pushed, owner: "push when you think done") says no exit line when no object was active - nothing was left, so nothing is said, and no new sentence was needed. `src/dental/editing/dentalExitStatus.test.ts` fails on the old vendored resolver. |
| 11 | The scene legend lists layers Step 3 does not show, and shows with no model | **Fixed.** Step 3 draws neither the area nor its edge and its supports are teal bodies, not the orange tip cones the swatch shows; the legend now lists only what the step draws (`legendRows` in `SceneLegend.tsx`, tested) and Step 3 has none. Seen in the browser: Step 1 and 2 three rows, Step 3 no legend. The start-screen file prompt never showed one. |
| 12 | Step 3's panel is crowded; edit tools cut at the fold | **Fixed 2026-11-21.** Measured in the browser: with Adjust folded the panel ends at 357 px of 900, nothing cut; with Adjust OPEN at 1280x720, Add / Select / Click / Drag over / Delete were all below the fold behind the settings. Adjust now leads with the tools, then the settings, on both supports steps (`DentalSupports.tsx`, `DentureReviewPanel.tsx`); measured after: all five tools on screen at 1280x720, only the recipe row and ID label scroll; the way back and on was already pinned (`.dental-footer`). `DentalBar.test.tsx` fails on the old order. |
| 13 | "Automatic dental rim gaps: outer 42.2 mm ... omitted contacts were not forced" | **Fixed 2026-11-21 (owner: "you can decide"):** "The supports leave gaps along the rim: up to {outer} mm on the outer edge and {opening} mm at the opening. Look along the rim and add supports where a gap is too wide." The numbers stay (the largest gap on each edge, `coverage.*.maxGapMm`); ja/zh via Gemini, checked against the glossary. Walk `l4` matches the new words. **Seen in the running app, 2026-11-21:** the reference aligner with part of its Step 2 area erased (94 to 87 tips) builds with rim gaps of 6.0 mm outer and 15.7 mm at the opening, and Step 3 shows "1 thing to look at" with the sentence, Show me and Fix inside Details. TRAP met: Details is folded by default, so a check for VISIBLE text finds nothing until it is opened - two earlier tries reported "never drawn" for that reason. Words also pinned by `DentalReviewBlocks.test.tsx`. |
| 14 | A problem row's text squeezed into a 60 px column beside its buttons | **Fixed:** the dental layout (buttons on their own row) is now the one rule for every problem list. |
| 15 | "Step 1 - Aligner" names the product, Steps 2-3 the job; Reset vs "Restore step" | **Fixed (titles),** owner: "is 'STEP 1' still relevant?" then "Good for what u think best". Every badge leads with the job, then its place: `Print angle · 1 / 3`, `Support area · 2 / 3`, `Supports · 3 / 3` (a denture counts to 2). The header's "Your files" key moved onto the card as its `×`. Walk check u5t. **Reset vs Restore, decided 2026-11-21 (owner: "you can decide"): both stay.** *Reset to defaults* puts the selected supports back to the default settings; *Restore step* puts the whole step back the way it was on entry. Each names what it returns to; one word for both would hide that they return to different things. |

**cia screen sweep of the day's controls (S22, 2026-11-21):** close, Exit, export, rim note, Adjust order and the
Step 1 findings checked site by site. Fixed: **Exit dropped Step 2 paint strokes and moved sliders without asking**
(`exitNeedsConfirm` now counts them, `src/dental/flow.ts` `policyHoldsWork`; `flow.test.ts` fails on the old rule).
**Debt, not taken:** the deck's *Export all STL*, disabled while nothing has supports, gives its reason only as a
hover title - not beside the key as the house rule wants. Older than today (only the label changed); the cut is a
one-line reason under the case keys when `anySupports` is false.

**Owner, 2026-11-21:** the debug panel ships in release builds for now.

**Found while checking 7:** the deck card's busy ring was a 164 px flat ellipse sweeping across "Generating supports..." (shots m5, m11) - `ProgressIndicator` used outside `.progress` read undefined size variables. **Fixed** with fallbacks; measured 164 x 69 before, 22 x 22 after.

Journeys, most finished first (Fable): aligner Steps 1-3; Drop page to deck to auto-generate; the
any-model editor. Single most helpful change: finding 2, the status line.

## The canvas status said "Apply" after an Apply (2026-11-23)

Owner: "apply and run is not working ... the part i print screen should combine with the bottom canvas so there's more
space. so does Rim".

| Finding | Fix |
|---|---|
| Apply ran the edited Orient graph (the run turned 8° to 0°, 168 tips to 122), but the Orient status still said "changed - Apply and run again", and so did the Zones status after an edited zone run: both compared the canvas to the STANDARD graph, never to the graph that ran. It read as a dead button. | Each status compares the canvas to the graph the run's summary records (`zoneGraphRan` / `orientGraphRan`) with `nodeGraph.mjs` `sameGraph`, which ignores key order - the summary writes its keys sorted, so plain JSON text would still have said "changed". It now says "... - the review on screen ran this." until the canvas is edited again. |
| The colour key took a row of its own above the Orient and Rim canvases | It rides in the canvas's toolbar row (Orient: beside "All connections are complete."; Rim: beside the tab's note). |

Then, owner: "Yes, auto-run". **An Orient edit now runs on its own** (`viewer.html` `autoRunOrient`): edits are gathered
for 1.2 s, an edit undone before its run starts runs nothing, and an edit made during a run waits and runs once after it
- never two runs at once (the server has one `/out/`). The status line says "it runs on its own in a moment" only while
a run is really queued; a canvas edited before a reload starts nothing until it is edited again. Each run is about 27 s
and a new folder of about 70 MB in `typelab/output/`, so a long session of edits leaves folders to clear. Going back
to the standard Step 1 after an edited run is now a change Apply runs (it said "Nothing is changed yet" and left the
edited run on screen). Proved in the browser: an edit ran (8°, 106 tips); a second edit during it waited and ran once.

# App UX-flow review - 2026-11-27 (Fable and Codex, both must agree)

The owner, asleep, with full control: "refine it by user UX flow with Fable and Codex, both must agree." Both reviewed
the app independently from the walk's screenshots (one per step, `WALK_SHOTS`) and the code, then voted on every item of
the other's list. Only items BOTH agreed on were built; each change carries "(Fable + Codex review, 2026-11-27)" in a
comment where it lives.

| # | Agreed change | Where |
|---|---|---|
| 1 | Step 3 says what it KNOWS: "Supports built, not checked yet" until the support check has run on this build; "Every point is held" only after. The Check key sits beside the line (it was behind Details). Same for the denture. | `reviewLineText.ts` (`checked`), `ReviewSummary` action, `CheckKey` in `DentalReviewBlocks.tsx`, `App.tsx` (`checked` = a check verdict exists and is not behind the build) |
| 2 | A grey key says why in the open: Export all STL (its existing sentence), Restore step (new). | `ItemsPage.tsx`, `RestoreStepButton.tsx`, `.help.key-reason` |
| 3 | The deck says where each file stands: "N files left" leads the footer, larger; a card whose supports Auto-gen built says "Supports built - review needed" until the operator has been through it; while Auto-gen runs, Start stays enabled but is no longer the primary. | `ItemsPage.tsx`, `ItemRow.tsx` (`reviewed`) |
| 4 | Step 2 leads with its result (the proposed tips), and its note is the hint of the tool in hand - it used to say "Drag on the model to paint" under Select. The build caveat is its own short line. | `DentalBar.tsx` |
| 5 | The ID label is one compact row above Adjust (it was the last thing inside the fold). | `IdLabelBlock`, `DentalSupports.tsx`, `DentureReviewPanel.tsx` |
| 6 | Step 1: Next is the one primary; Auto orientation is secondary. | `editingMode.ts` `dental.useDetected` |
| 7 | The deck's type key shows the type's name after its badge, ellipsed on a narrow card. "Type default" kept. | `PurposeMenu.tsx` |
| 8 | "Aligner Support Production" moved from the generic Supports keys to Modes. | `ModeEntry.tsx`, `App.tsx` |

Agreed but NOT built, with the reason:
- **Editor reds** (Clear manual edits / Remove supports neutral, red only on Delete): their `role: 'destructive'` lives in
  `vendor/mixo-geocore/editing/commands.ts`, which this repo never edits - a geocore request
  (`docs/handoff/geocore-editor-destructive-roles.md`), not sent.
- **Hide the dental-step status line**: the same line carries error and refusal messages; hiding it visually would
  silence them ("nothing dies silently", the brief's hard rule). Left visible; re-decide with a way to tell a repeat
  from a new message.
- **A line after Export**: its own condition ("only if not already said") holds - Step 3 already shows "Aligners
  finished so far: N" beside Add another aligner, and the status line names the saved file.

Dropped because the reviewers disagreed: the card action grid (Codex: cards are ~208 px and wrap on purpose), which
scan-progress indicator survives in Step 1, and the empty Step 1 dock (hide it vs name the STL). Owner questions both
raised: should DEBUG stay in release builds; should "Ready" on the deck mean ready to review or ready to export.

Settled the same morning (owner gave full control): **DEBUG stays in release** - the owner's ruling of 2026-11-21, which
the walk tests by name; a reversal is the owner's. **"Ready" on the deck** means the orientation check passed, nothing
more: since item 3 above, a card whose supports Auto-gen built says "Supports built - review needed" until the
operator has been through it, so "Ready" no longer stands in for "ready to export". **The dental status line stays
visible**: a status message carries no tone, so the app cannot tell a repeated instruction from an error; hiding it
needs a tone on every message first (recorded here as the next step for that item).

## Delegated decisions - 2026-11-27 (owner: "make those decisions with 2 consultants")

Each decided by Fable and Codex independently; acted on only where both agreed.

| Item | Fable | Codex | Done |
|---|---|---|---|
| D1 approve docs/GEOCORE-BOUNDARY.md | approve | approve | STATUS set to agreed |
| D2 send the geocore requests | send (new docs/requests/, fix wording) | send | sent: mixo-geocore 5882c80, docs/requests/ |
| D3 dental status line | wrap to two lines | tone on Message, hide routine | NO AGREEMENT - stays as is |
| D4 open-arch rim-gap review | engine request | engine request | docs/handoff/geocore-open-arch-rim-gap.md, sent |
| D5 the dropped UX items | none | none | stay dropped |
