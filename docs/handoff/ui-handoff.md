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

## (g) The build progress bar follows the engine's phases

The staged bar (`src/denture/progress/`) eases inside the long "Routing supports" stage (35 to 50 s) because the engine did not report its phases. The owner is bringing engine 60 (in progress when this was written; `vendor/mixo-geocore/VERSION` was 60 in the working tree, not yet committed) so that the engine posts routing, raft and checking.
To do once engine 60 is committed: add the new stage names to `src/denture/progress/stagePlans.ts`, check weights and typical times, update the stage tests (`stageModel.test.ts`), and add the stage words to `ja.ts` and `zh-Hant.ts`. Check `git log -20` for a `chore(vendor): mixo-geocore engine 60` commit first. Never edit `vendor/` yourself.

## (h) Redesign the tilt dial (agent builds it first, you may finish or tweak)

Current dial: `src/ui/parts/TiltDial.tsx`, used by `PrintAngleField` in `src/components/DentalSteps.tsx` inside Step 1's bar (`src/components/OrientationBar.tsx`). Its CSS is the `.tilt-dial*` block in `src/styles.css` (about line 593): a plain arc track, a kraft stable band and a red knob.

The owner wants a soft, neumorphic knob. The owner holds the reference image (a light-grey volume knob with tick marks and LIGHT/DARK end labels); ask them for it. In words:

- A raised round disc, as if pressed out of the paper: a soft light shadow on the upper left and a soft dark shadow on the lower right, no hard outline.
- One small indicator dot on the disc near its rim; it moves round to show the current angle.
- A ring of short tick marks around the disc, evenly spaced along the arc the dial can turn through. Ticks that fall inside the stable (allowed) range are highlighted; the others stay quiet.
- Small text labels at both ends of the arc (the lowest and highest angle).
- Keep what works today: drag and keyboard use, `aria` labels, `touch-action: none`, the focus ring, and the "Stable a-b degrees" line above.

Rules for the build:

- All colours and sizes are CSS tokens in `src/styles.css`; no hex in the TSX, no inline `style=` (section 5 of the guide). The shadows are CSS (`box-shadow` or SVG filter) using tokens, so the disc is two shadow tokens plus the surface colour.
- One size token, `--dial-size`, scales the whole dial (disc, ticks, labels, indicator by ratio, for example with `em` or `calc(var(--dial-size) * ratio)`). Change it once and the dial grows or shrinks.
- Suggested tokens: `--dial-size`, `--dial-disc` (surface), `--dial-shadow-light`, `--dial-shadow-dark`, `--dial-dot`, `--dial-tick`, `--dial-tick-on` (stable range), `--dial-label`. Document each in `docs/ui-styling.md`.
- New data-ui names for the parts: for example `tilt-dial`, `tilt-dial-disc`, `tilt-dial-dot`, `tilt-dial-ticks`, `tilt-dial-label-min`, `tilt-dial-label-max`. Add them to the data-ui table.
- End labels go through `t()` if they hold words; plain numbers with the degree sign do not need translation.
- Check at 900 x 700 and 1280 x 800 and in all three languages. Step 1's bar must not grow past the viewport; `src/ui/narrowDentalLayout.test.ts` must still pass. The dial and `TiltReadout` (the big number) must agree after Undo (`dialSync.ts`).

## (i) One joint style with mixomesh, after both apps are published

Decision of 2026-11-02 by the owner. mixoDental and mixomesh (github.com/mixocreative/mixomesh)
each keep their own style for now. There is no shared kit repo, no sync step and no outside UI
kit. A designer works only in this repo: `src/styles.css`, plus the catalogue page once it exists.
Once both apps are published, compare the two styles side by side and merge them into one final,
organised style that both apps share. Decide at that point where the shared tokens live.
