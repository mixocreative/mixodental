# Review UX refinement — 2026-11-20

The folder review (`dentalwork/batch-review/viewer.html`) with its three stage tabs (**1 Orient**,
**2 Zones**, **3 Support settings**) and the zone node canvas (`nodeEditor/ZoneEditor.tsx`, built with
React Flow), looked at whole at 1440x900. The owner asked for the benchwork node UI to be refined and
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
| 6 | Stage 3 shorthand ("low outside"), a 0/1/2 mode as a text box, "engir" | Every benchwork rule has a plain `label` with its unit; a mode is a dropdown of described choices (checked against `ruled_tips.rs` `low_reason`). | `rules.test.ts`: a rule without a label or unit, or a mode without choices, fails. |
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
