# UI handoff: open work as of 2026-11-02

Each item has a RECOMMENDED answer so a designer can continue without asking. Items (a) to (d) and (h) change what the user sees; items marked "owner" need the owner's sign-off before they are committed.

## How to resume

1. Read this file.
2. Read `docs/designer-guide.md` (setup, where things live, checks, git).
3. Read `docs/ui-styling.md` (tokens, data-ui names, icons).
4. Run the app (`npm run dev`, open http://localhost:5173/mixodental/) and click through an aligner (reference file `docs/dental-reference/reference-aligner.stl`) and, if the owner gave you a private scan, a denture.
5. Run `git log -20 --format='%h %s'` to see what changed since this file was written.

## (a) Simplify the aligner Step 3 to the layout of the new denture Step 2

Today the aligner Step 3 (`src/components/DentalSupports.tsx`) shows every block open. The denture Step 2 (`src/denture/steps/supports/DentureReviewPanel.tsx`) shows one status line with Fix and Details, a folded Adjust, Restore step, Back | OK.

Recommended: yes, do it. Reuse the shared blocks in `src/components/DentalReviewBlocks.tsx` (both flows already use them); fold them the same way with `src/components/Fold.tsx`.
Cost: it breaks the owner's browser-walk checks x0, x1, x1b, x9b, x10 and x13 in `scripts/walk.mjs`, which look for the aligner Step 3 blocks. The owner must sign off, and the owner (not you) updates `walk.mjs`. Say which checks break in the commit message.

## (b) "Add another denture"

Recommended: it stays in Step 2 as a quiet (secondary) button, `denture-add-another`. Pressing OK closes the mode. Do not move it to the plate panel.

## (c) "Some bracing was left out"

Recommended: yes, this note counts as "a thing to look at". It raises the status line's "n things to look at" count (`src/denture/steps/supports/reviewLineText.ts`) and appears in Details. It is not a "spot that needs a support", so it never blocks OK.

## (d) The automatic check's result and the bottom status line

Step 2 now runs the support check once per finished build by itself (`src/denture/steps/supports/useAutoCheck.ts`), and its result replaces the old bottom status line.
Recommended: keep it. The user should see one status line, not two.

## (e) Six LOW findings from `docs/reviews/2026-11-02-cia-denture-flow.md` (not fixed)

| # | Finding | Suggested fix |
|---|---|---|
| 6 | After the denture worker restarts in Step 1 (crash, timeout, cancel), the live tips stop following the dial with no message. Next still works. | Show a quiet note "Live tips stopped" under the dial and re-arm the live-tilt handle on the next dial move (`src/denture/engine/liveTilt.ts`, `useDentureOrient.ts`). |
| 7 | After a failed orientation the status line reads "Drop a denture STL, or choose one" although the denture is loaded. | Give the failed state its own sentence in `src/denture/steps/start/startText.ts` or `stepOneText.ts`, for example "The denture could not be stood up. Use Free transform, then Next." |
| 8 | OK re-arranges the plate, which moves the denture and rebuilds the supports (about 4 s); a check or export started in that window says "the support check did not finish for 1 object". Export itself is right. | Engine-side partly (commit bf1972d already keeps the build when the denture only slides). UI part: while the rebuild runs, disable Check and show the staged progress instead of the error. |
| 9 | A whole-plate export of an unnamed project is called `scene-printable.stl`. | Name it after the first object when the project has no name (export naming in `src/components/useExport.ts`). |
| 10 | Undo inside Step 1 turns the denture back but not the dial. | Commit 4bcb1f1 added `src/denture/steps/orient/dialSync.ts` for this; re-check by hand in the app and close the finding if the dial now follows. |
| 11 | Undo's disabled reason inside a dental step says "leave the mode to undo earlier steps". | In a dental step say "Use Back to go to the previous step" (shared text; add the ja and zh-Hant lines). |

Also open from the same audit, for the owner to decide: should Undo cross into the previous step (a larger change), and should Step 2 dock its panel on the right at 900 x 700 (commit 98be857 did this from 721 px; confirm it is wanted).

## (f) About 10 literal colours left in `src/styles.css` outside `:root`

A count on 2026-11-02 found 13 lines with `#hex`, `rgb()` or `rgba()` outside the `:root` block, for example `#fff` (button hover, `.primary` text, `.dental-card:hover`), `#e9e6df` (`.viewport` background; the same colour as the token `--scene-bg`), the problem-kind dots (`#b3261e`, `#d97706`, `#6b7280`, `#1E50A2`; these equal `--danger`, `--mark-overhang`, `--mark-outside`, `--mark-risk-outside`) and the `rgba(...)` backdrops.
Recommended: tokenise them. Replace each with the existing token where one has the same value; otherwise add a token to `:root` (for example `--on-red: #fff`, `--backdrop: rgba(0, 0, 0, .35)`, `--paper-veil: rgba(244, 242, 237, .86)`) and add its row to `docs/ui-styling.md`. Test `src/ui/uiStylingDoc.test.ts` will fail until the table is updated. Look at the result in the app after each change; the values must stay identical.

## (g) The build progress bar follows the engine's phases: DONE

Engine 60 shipped (vendor bump c62aaf7) and the staged bar (`src/denture/progress/`) now follows the phases the engine posts (routing, raft, checking) instead of easing through one long "Routing supports" stage: commit eda8261. Nothing left to do. If a later engine posts new phase names, add them to `src/denture/progress/stagePlans.ts`, `stageModel.test.ts`, `ja.ts` and `zh-Hant.ts`; never edit `vendor/` yourself.

## (h) Redesign the tilt dial: DONE (P7d), tweak by tokens

The dial (`src/ui/parts/TiltDial.tsx`, in aligner Step 1 and denture Step 1) is a knob with a pointer at the angle, 25 ticks over the 240-degree arc (the ticks inside the stable range in the accent colour), the range ends as small labels at both arc ends, and the angle itself as a large number in the middle of the knob (P7e; the separate big number that stood under the badge is gone, since it said the same thing twice). In the app's instrument theme the knob is flat indigo and the pointer a white triangle; the paper set keeps the soft raised knob and its recessed dot. The "Stable a–b°" line is unchanged; so are drag, the arrow keys, `aria`, snapping, Auto orientation, Restore and the live tilt.

It is plain HTML + CSS (no SVG): each tick is a `<span>`, the knob a `<div>` with a `box-shadow`. What a designer tweaks, all in `src/styles.css` and listed in `docs/ui-styling.md` ("Print-angle dial"):

- `--dial-size` (168px): the one size; knob, ticks, dot, labels and shadows follow it.
- Colours in `:root`: `--dial-face`, `--dial-face-shade` (the knob's gradient), `--dial-shadow-dark`, `--dial-shadow-light`, `--dial-tick`, `--dial-tick-on` (stable range), `--dial-dot`, `--dial-dot-shadow`, `--dial-label`.
- Proportions in the `.tilt-dial` rule, as fractions of `--dial-size`: `--dial-knob-size`, `--dial-tick-radius`, `--dial-tick-length`, `--dial-tick-width`, `--dial-dot-size`, `--dial-dot-radius`, `--dial-shadow-offset`, `--dial-shadow-blur`, `--dial-label-size`.
- The number of ticks is the `ticks` prop (default 25, one every 10 degrees of the arc).
- data-ui names: `tilt-dial`, `tilt-dial-ticks` (ticks `.tilt-dial-tick`, `.is-on` in range), `tilt-dial-knob`, `tilt-dial-dot`, `tilt-dial-label-min`, `tilt-dial-label-max`.
- Try changes on the catalogue page (`/mixodental/kit.html`), which shows the dial in and out of range, disabled and at two sizes.

Open for the owner: the shadows go against mixo-app-style's "no shadows" rule (the owner asked for this look); the arc stays 240 degrees (the reference is about 270) so the drag mapping is unchanged. `scripts/walk.mjs` checks f1 to f5 still look for the slider the dial replaced in PD.11 S5 (`.print-angle input[type=range]`, `.range-band`, `.print-angle .edit-hint`); the owner updates them.

## (i) One joint style with mixomesh, after both apps are published

Decision of 2026-11-02 by the owner. mixoDental and mixomesh (github.com/mixocreative/mixomesh)
each keep their own style for now. There is no shared kit repo, no sync step and no outside UI
kit. A designer works only in this repo: `src/styles.css`, plus the catalogue page once it exists.
Once both apps are published, compare the two styles side by side and merge them into one final,
organised style that both apps share. Decide at that point where the shared tokens live.
