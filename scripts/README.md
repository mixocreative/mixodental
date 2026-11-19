# scripts/ — the map

Most of these are not run by hand: they are the steps `npm run gate` and `npm run walk` are made
of, and a handful are one-off probes kept because re-deriving them cost a day. (No file count here
on purpose - it said "forty" at forty-eight, the same way a row below said 186 at 199.)

**The rule for this folder: never pipe one of these through `tail` or `head`.** The exit code
becomes the pipe's, and the failing check's name is the one line you needed. A 35-minute walk was
repeated for exactly that mistake. **Since 2026-11-20 `shell-guard.mjs` refuses it** rather than
asking you to remember it.

## The gate — what `npm run gate` runs

`gate.mjs` is the orchestrator; these are its ten steps.

| File | Step |
|---|---|
| `gate.mjs` | the orchestrator and the verdict. **It names what it did NOT run**: `SHIP_REQUIRES_NOT_RUN` makes the verdict read `PASS (INCOMPLETE - the ship definition also requires walk, not run here)` when the walk has not run. A `PASS` on the same line as `NOT run: walk` once shipped a 92% support loss |
| `check-no-duplicates.mjs` | one copy of every shared module (`npm run check:duplicates`) |
| `geometry-guard.mjs` + `geometry-allowlist.json` | geometry calls go through the allowed surface; the JSON is the reviewed list of exceptions |
| `no-webgl-gate.mjs` | the app's rules work with no GPU (`npm run gate:nogl`) |
| `real-scan-gate.mjs` + `real-scan-gate-lib.mjs` + `real-scan-gate.test.mjs` | **every engine change runs against all local real patient scans** (`npm run gate:real`). The scans themselves are git-ignored under `dentalwork/fixtures/case-*` and are never committed |
| `real-scan-tier.mjs` | the tier check over those scans (`npm run gate:tier`) |
| `step-screens.mjs` | captures a screen per step (`npm run screens`) |
| `third-party-notices.mjs` + `.test.mjs` + `rust-notices.json` | the notices file, generated after every build; the test keeps it honest |

## The walk — the browser proof

| File | Job |
|---|---|
| `walk.mjs` | the browser checks — the count is `EXPECTED_CHECKS` in the file itself and is not repeated here, because this row said 186 while the code asserted 199 (asserted — a check that silently stops running fails the run rather than printing a smaller number), ~35 minutes, sections `a`–`x`. **4,447 lines, far over the cut limit** — named as debt in `../docs/size-debt.md`. It is the only thing that exercises generate counts, because CI runs it in two shards (`m,q` and `r,u,x,l,s`) that **leave section `a` out**. `npm run walk:locales` runs it across en/ja/zh-Hant, and `npm run walk -- --renderer=babylon` drives the same checks against the Babylon viewport instead of the three.js one |

## The mistake guards — rules that act instead of being remembered

Neither of these is a gate step. They exist because four mistakes on 2026-11-19/20 were each already
written down, in full, with the exact remedy, in notes that were loaded in context at the time. A
rule that must be recalled at the instant a command is typed is not a rule, so these two decide
instead.

| File | Job |
|---|---|
| `shell-guard.mjs` + `.test.mjs` | a **PreToolUse hook** on `Bash`/`PowerShell` that refuses five measured shell traps: a doubled backslash (the Bash tool eats one level **command-wide**, even inside single quotes), a backslash inside interpreter source (`python -c '…"S:\ai"'` writes a BEL - that, not the heredoc, is what corrupted a committed path), a PowerShell backtick escape from the set nobody intends, prose in `-m`/`--body` for git and gh (markdown backticks are command substitution, and have committed three messages with empty spans), and a pipe or `;` **after** a gate. `judge(command, tool)` is pure, so the test drives the rules with no process. **The wiring lives in `.claude/settings.json`, which is untracked here** - this script is the tracked half, and other repos get none of it |
| `control-chars.test.mjs` | refuses a control byte in any tracked text file, which is the **backstop** for the above: the guard sees only shell commands, while the Write tool can put the same byte in a file with no shell involved. It found a 0x08 inside a live regex in `../src/ui/art.test.ts` that had been silently disabling that test. It cannot see a `\r?\n` that became a real line break - that is a legal newline |

## The engine — vendoring and smoke

| File | Job |
|---|---|
| `vendor-geometry.mjs` | brings the built engine in from mixo-geocore (`npm run vendor:geometry`, `--check`). **Writes `SOURCE.json`**: the engine commit, its version, and a sha256 per file. Its freshness guard refuses a package older than the last engine commit |
| `geometry-wasm-smoke.mjs` | the wasm answers at all (`npm run wasm:test`) |
| `geometry-wasm-bench.mjs` · `measure-heavy.mjs` · `perf-baseline.mjs` · `perf/` | timing, and the baseline it is compared against |
| `geometry_wasm_browser_smoke.py` · `geometry_wasm_full_import.py` · `geometry_wasm_heavy_import.py` | the same questions asked from Python, for when a browser result and a node result disagree |
| `node-engine.ts` · `viteNodeCli.mjs` · `host-example.mjs` | running the engine outside the app: the node harness, the vite-node CLI, and a worked host example |

**The vendored engine is consumed as built and never edited here.** A change to it is a change in
mixo-geocore, then a re-vendor.

## Golden files and fixtures

`update-goldens.ts` regenerates `fixtures/golden/` — the recorded oracle that replaced the old
TypeScript import geometry (U1 / SHIP-PLAN rule 6, guarded by `src/importOracleBoundary.test.ts`).
Read a diff row by row before taking a re-record; a golden updated to match a bug is a bug with a
receipt. `make-heavy-meshes.ts` builds the large inputs, `fixtures/stl-corpus/` holds the small
ones.

## Dental probes and references

| File | Job |
|---|---|
| `prepare-dental-reference.mjs` | builds `../docs/dental-reference/` from the source material |
| `dental-face-labels.ts` · `probe-dental-edges.ts` · `probe-dental-orientation.ts` · `measure-rim-loops.mjs` | the one-off measurements the dental rules cite. Kept because each cost a day to derive |
| `dental-region-review/` · `dental-reference/` | the region-review tool (own README) and its comparison scripts |
| `extract-sup-contacts.py` | reads contacts out of reference slicer files. **Those files are reference only, never targets** |
| `render-dental-diagnostic.py` · `brush_perf.py` · `trace-art.py` · `art-block.mjs` · `flatten-art.py` | diagnostics and the art pipeline |
| `export-hashes.ts` | hashes of exported output, for comparing runs |

## Test support

`test-support/` (own README) holds the harnesses the vitest suite imports — not tests themselves.

## Assets

`icons.mjs` (`npm run icons:add`) and `gen-fonts-css.mjs` (`npm run fonts`, writes
`src/fonts.css` — do not hand-edit the output).

`flatten-art.py` (`npm run art`, `npm run art -- --check`) is the step AFTER the owner re-exports an
item-type drawing from Illustrator: it flattens polygons and rotated rects back onto the 48x48 grid
`src/ui/assets/art/README.md` promises, refuses to write unless the result paints identical cells, and
leaves an already-plain file untouched.
