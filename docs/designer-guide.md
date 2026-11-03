# Designer guide: run and keep working on mixoDental

For a front-end designer who is comfortable with HTML, CSS and React and is new to this repo. The commands here were run on 2026-11-02 (Windows 11, Node 22.15.1). No AI is needed to follow it.

## 1. What the app is

- mixoDental builds resin 3D-print supports in the browser. Nothing is uploaded; all work runs on the user's computer.
- Two dental flows sit beside the generic "Any model" mode: aligner supports and denture supports. Both are previews, not clinically validated.
- Aligner steps: 0 aligner type, 1 file and orientation (the tilt / print-angle step), 2 support area (paint where tips may stand), 3 supports (build, check, settings, finish).
- Denture steps: start card, 1 orientation (same bar and dial as the aligner), 2 supports (one status line, Details, Adjust, Back | OK). A denture has no support-area step.
- The 3D engine is not in this repo's source: it is a vendored WebAssembly build (see section 7).

## 2. Setup

Needed: Node 22 (CI uses 22; the repo has no `.nvmrc` and no `engines` field; v22.15.1 was used for this guide), npm, git.

```bash
git clone https://github.com/mixocreative/mixodental.git
cd mixodental
npm install
npm run dev
```

- Open **http://localhost:5173/mixodental/** (the `/mixodental/` part matters: it is `base` in `vite.config.ts`). The bare `http://localhost:5173/` only redirects.
- Stop with Ctrl+C in the terminal. Verified: the server is ready in under a second and answers HTTP 200.
- If port 5173 is busy, Vite takes the next free one; read the "Local:" line it prints. On Windows a dev server whose terminal was closed can keep running. Find it with `netstat -ano | findstr 5173` and stop that one process by its PID (`taskkill /PID <pid> /F`). Never stop processes by name: other tools also run `node`.
- Edits to `src/styles.css` and components hot-update in the page; no reload is needed.
- The engine and the tests are heavy on memory. Close other dev servers before running the test suite.

## 3. Getting models to load

Customer scans are private. They are not in the repo and must never be: `dentalwork/fixtures/case-*/` is git-ignored on purpose, because an STL can identify a patient even without a name. The repo is public.

What you can load without the owner:

| File | Use it for |
|---|---|
| `docs/dental-reference/reference-aligner.stl` | The owner-approved public aligner. Choose Aligner supports, an aligner type, then drop this file. Covers aligner steps 1 to 3. |
| `scripts/fixtures/knot.stl` | A generic test model for the "Any model" mode (plate panel, settings panel, edit mode). |
| `scripts/fixtures/stl-corpus/` | Many tiny STLs for import edge cases (bad files, ASCII and binary). Useful for error messages. |

There is no public denture file in the repo. To work on the denture steps, ask the owner to hand you a scan privately. Rules for any private scan:

- Keep it outside the repo folder, or in a git-ignored place (`dentalwork/fixtures/case-*/` and `dentalwork/output/` are ignored).
- Never commit it. Never put its file name or a patient name in a commit message, an issue or a screenshot. The browser tab, the object list and the header can show the file name; crop or rename first.
- A screenshot of a private scan is private too.

## 4. Where each screen lives

`src/App.tsx` only wires things together. The screens are in `src/components/` (aligner and shared) and `src/denture/` (denture). Module map of the denture flow: `src/denture/README.md`. Data-ui names by screen: `docs/ui-styling.md`.

| Screen or step | Files | Main data-ui names |
|---|---|---|
| Start screens (task, aligner type, file) | `src/components/StartScreen.tsx`, `src/components/DentalSteps.tsx` (type step, file drop, `PrintAngleField`), `src/denture/steps/start/DentureChoice.tsx` | `start-denture` |
| Aligner Step 1 and denture Step 1: orientation, the tilt step | `src/components/OrientationBar.tsx` (bar, Back / Next), `src/ui/parts/TiltDial.tsx` (the dial, with the big angle number in its middle), `src/components/DentalBar.tsx` (picks the bar per step), denture extras in `src/denture/steps/orient/` | `tilt-dial`, `tilt-dial-value`, `orient-extra`, `denture-live-tips`, `denture-live-tips-path`, `denture-live-tips-fallback`, `denture-live-tips-none`, `restore-step-1` |
| Aligner Step 2: support area | `src/components/DentalBar.tsx` (tools Paint, Erase, Add, Select), `src/components/SurfaceBrushBar.tsx` | `restore-step-area` |
| Aligner Step 3: supports | `src/components/DentalSupports.tsx`, blocks in `src/components/DentalReviewBlocks.tsx` | `dental-supports-panel`, `aligner-support-settings`, `aligner-edit-supports`, `aligner-problems`, `aligner-check-run`, `aligner-id-label`, `restore-step-2` |
| Denture Step 2: supports | `src/denture/steps/supports/DentureReviewPanel.tsx`; status sentence `reviewLineText.ts`; automatic check `useAutoCheck.ts` | `denture-supports-panel`, `denture-review-summary`, `denture-review-line`, `denture-resolve-all`, `denture-review-footer`, `denture-review-nav`, `denture-review-back`, `denture-review-ok`, `denture-add-another`, `denture-finished-count` |
| Denture Step 2: Details | `src/denture/steps/supports/ResolveSection.tsx`, `src/components/ProblemList.tsx` | `denture-review-details`, `denture-review-details-toggle`, `denture-resolve`, `denture-problems`, `denture-check-run` |
| Denture Step 2: Adjust (a collapsible panel) | `src/components/Panel.tsx`, `adjustMemory.ts`, `src/denture/settings/DentureSettingsSection.tsx` | `denture-adjust`, `denture-adjust-title`, `denture-adjust-body`, `denture-support-settings`, `denture-edit-supports`, `denture-id-label`, `denture-settings` |
| Progress bar (denture scan and build) | `src/denture/progress/StagedProgress.tsx`; model `stageModel.ts`; stage list `stagePlans.ts` | `staged-progress`, `staged-progress-fill`, `staged-progress-track`, `staged-progress-head`, `staged-progress-stage`, `staged-progress-step`, `staged-progress-time` |
| Restore step button (Step 1, area step, supports step) | `src/components/RestoreStepButton.tsx` | `restore-step-1`, `restore-step-area`, `restore-step-2` |
| Parts list (multi-part files) | `src/denture/parts/PartsList.tsx` | `{kind}-parts`, `{kind}-part-row` |
| Plate | `src/components/PlatePanel.tsx` | `plate-panel`, `plate-printer`, `plate-arrange` |
| Viewport and 3D marks | `src/components/ObjectViewport.tsx`, `src/components/viewport/` (colours in `sceneColours.ts`) | `unresolved-bubble`, `landing-mark` |
| All CSS | `src/styles.css` (tokens in `:root`); `src/fonts.css` is generated | |

The aligner tilt step (Step 1) is the owner's reference style for every step: minimal, game-like, easy for a dentist who is not technical. One bar, one big number, one dial, Back | Next. New or changed steps should feel like it. The denture Step 2 was just rebuilt in that spirit.

## 5. Style rules

Token tables and how to change a colour, size, font or icon are in `docs/ui-styling.md`. Read it first; it is not repeated here. The rules:

- **mixo-app-style.** The look is the owner's `mixo-app-style` (paper, ink, hairlines, one red). Its `tokens.css` and `base.css` are copied into the app, never re-derived from memory. Source: https://github.com/mixocreative/mixo-app-style. Ask the owner before changing a value that comes from it.
- **Tokens only.** Every colour, size and font is a CSS custom property in `src/styles.css`. No `#hex`, `rgb()` or `rgba()` in any `.tsx` file or viewport source, and no inline `style=`. The few run-time exceptions are listed with their reasons in `src/ui/noColourLiterals.test.ts`.
- **Every token is documented.** A new token needs a row in `docs/ui-styling.md`; `src/ui/uiStylingDoc.test.ts` fails otherwise.
- **Two widgets, no third way.** A group of controls is a `Panel` (`src/components/Panel.tsx`) and a labelled control is a `Field` (`src/components/Field.tsx`); `NumberField` and `RangeField` are fields already. There is no other markup for either, so a style change reaches the whole app from one place. If a control does not fit, extend the widget rather than hand-rolling a row beside it.
- **Unique names.** Every element you add or touch gets a class and a stable `data-ui="name"` (a `CommandButton` takes it from its `uiName` prop). Add the name to the data-ui table in `docs/ui-styling.md`.
- **Every word through `t()`.** Write `t('English text')`; the English text is the key. Add the Japanese line to `src/locales/ja.ts` and the Traditional Chinese line to `src/locales/zh-Hant.ts`. Use natural Japanese and natural Taiwan Chinese, not word-for-word translation.
- **One module, one responsibility.** Small files with a test beside them (`Name.tsx`, `Name.test.tsx`). `App.tsx` only wires; logic goes to a hook or a module.
- **Keep the module maps current.** A new denture module gets a row in `src/denture/README.md`. A new data-ui name or token goes into `docs/ui-styling.md`.
- Icons are single SVG files in `src/ui/assets/icons/`, drawn with `currentColor`; see the README there.

## Catalogue page

- With `npm run dev` running, open **http://localhost:5173/mixodental/kit.html**. No model and no engine are needed.
- It shows every shared control in its states, built from the real components and `src/styles.css`: buttons (primary, quiet, danger, disabled), the step bar buttons (Free transform, Restore step on and off, Back | Next), sliders (`RangeField`, with and without a band), the segmented toggle, checkboxes, number fields, the print-angle dial (in and out of the stable range, at an end, disabled, and at two `--dial-size` values), the status line with its dot in every state, the staged progress bar (running, done, failed, cancelled), Details, the panel widget in its four shapes (does not collapse / collapsible open / collapsible closed / an Adjust the step owns), and a side panel.
- The switch at the top right changes the language (EN, 中文, 日本語), so you can check how Japanese and Chinese wrap.
- To restyle: edit `src/styles.css` (tokens in `:root`, see `docs/ui-styling.md`), save, and the page updates; refresh if it does not. The dials are live: drag them or use the arrow keys.
- Files: `kit.html` (repo root), `src/kit/Catalogue.tsx` (the page), `src/kit/kit.css` (page layout only). The page is served by the dev server only; `npm run build` does not include it, so it adds nothing to the app bundle. `src/kit/Catalogue.test.tsx` checks that it renders.
- When you add or change a shared control, add it to the catalogue in all its states.

## 6. How to check your work

Run these from the repo root before every commit. Timings are from this machine.

| Command | What it proves | Time |
|---|---|---|
| `npx tsc --noEmit` | Types are right. | about 6 s |
| `npx vitest run` (same as `npm test`) | All tests pass, including the no-colour-literal, token-doc, translation and narrow-layout tests. Last run: 162 files, 1083 passed, 1 skipped. | about 2 min |
| `npm run build` | Type-check plus the production bundle in `dist/` (git-ignored) and the third-party notices. | about 10 s |
| `npm run check:duplicates` | No `src` module copies a vendored engine module. | about 1 s |
| `npm run gate:real` | Real-scan gate: runs every local private scan through the engine and compares with `dentalwork/baselines/real-scan-baseline.json` (tips, print angle, verdict, file hashes). About 5 minutes. Needed only for engine or build-path changes (a vendor bump, `src/denture/engine/`, support-build code), not for CSS or layout. Without the private scans it prints "skipped" and exits 0. Never pass `-- --update` unless the owner says so. Not run for this guide. | about 5 min |

`npm run walk` is the owner's full browser walk (about 3.5 minutes; needs a Chromium that Playwright installed). Do not run or edit it as part of UI work (section 7).

Screenshots: the repo has no designer screenshot script; for single controls use the catalogue page above. `playwright-core` is a dev dependency, but only `scripts/walk.mjs` uses it. Use Chrome devtools: open the device toolbar and set a responsive size.

Window sizes to check every layout at: 900 x 700 (small laptop: panels and bars must not cover the viewport or the Back button) and 1280 x 800. Also check 721 px wide, where the Step 2 panel starts docking on the right (`src/dental/stepPanelInset.ts`). Check all three languages: Japanese and Chinese strings wrap differently. `src/ui/narrowDentalLayout.test.ts` pins the narrow-window rules.

## 7. Things not to touch

- `vendor/`: generated from the private engine repo `mixo-geocore` by `npm run vendor:geometry` (`npm run vendor:check` verifies it). Never hand-edit. The engine number is in `vendor/mixo-geocore/VERSION`. Only the owner bumps it.
- `scripts/walk.mjs`: owner only. If your UI change breaks one of its checks, say so in the commit message and tell the owner (see `docs/handoff/ui-handoff.md`, item a).
- The engine rules (overhang angle, sockets, support routing, what `src/denture/settings/dentureRules.ts` sends to the engine, `src/core/`). They change on print evidence only, by the owner.
- `src/fonts.css`: generated by `scripts/gen-fonts-css.mjs`; do not edit by hand.
- `dentalwork/baselines/` and the scans in `dentalwork/fixtures/`.

## 8. Git workflow

- The repo is public (https://github.com/mixocreative/mixodental) and has one developer: commit straight to `main`, no feature branches.
- Small commits, one idea each. Message style from `git log`: `type(scope): short sentence`, for example `feat(denture): Step 2 laid out like the aligner tilt step`, `fix(ui): Step 2 panel docks right from 721 px`, `test(ui): ...`, `docs(...)`, `chore(vendor): ...`.
- Before committing run `git status`, then `git diff --staged`, and read it for customer or patient names, scan file names and local paths. Stage files by name, not with `git add -A`; the working tree can hold private output.
- Then `git push`. CI runs only on `milestone-*` tags or by hand (Actions > CI > Run workflow). Day to day you are the CI: run section 6 yourself.

## 9. Troubleshooting

- **Blank page or 404.** Use `/mixodental/` after the port.
- **Port 5173 already used.** Vite moves to 5174 and up; use the URL it prints, and stop old servers by PID (section 2).
- **Fonts do not load in a copied tree.** `src/fonts.css` points at files in `node_modules/@fontsource/` (Atkinson Hyperlegible Next and Instrument Serif, the only two bundled; kana, kanji and Chinese characters come from your own machine). A copy of the folder without `node_modules` (or before `npm install`) shows a fallback font. Run `npm install`. If `fonts.css` itself is stale, `npm run fonts` regenerates it.
- **Headless browser freezes when closing.** The app asks "leave this page?" (`beforeunload`) whenever the scene has unsaved work, and that prompt can freeze headless Chromium (noted in `docs/reviews/2026-11-02-cia-denture-flow.md`). In scripted runs, answer or avoid the dialog.
- **Tests slow, or "RPC timeout".** The suite loads WebAssembly and is heavy. Run it alone with other dev servers closed. `vite.config.ts` already uses forks and a 60 s test timeout.
- **`npm run build` leaves files in `dist/`.** Ignored by git; safe.
- **"LF will be replaced by CRLF" warnings from git.** Windows line-ending notice; harmless.
- **A test fails on colour literals or inline style.** You wrote `#hex` or `style=` in a `.tsx`; move it to a token in `src/styles.css`.
- **A test fails on an undocumented token.** Add its row to `docs/ui-styling.md`.
- **A word shows only in English.** The key in `t('...')` does not match the key in `ja.ts` or `zh-Hant.ts` character for character.

## 10. More reading

`docs/ui-styling.md` (tokens, icons), `src/denture/README.md` (module map), `dentalwork/README.md` (how dental mode works and what is validated), `dentalwork/plain-language.md` (what the colours and warnings mean to a dentist), `dentalwork/fixtures/README.md` (private fixtures), `docs/reviews/2026-11-02-cia-denture-flow.md` (latest audit), `docs/handoff/ui-handoff.md` (open UI work).
