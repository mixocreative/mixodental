# Size debt — the register

The rule (the owner's code principle, rule 5): **size is debt with a date.** Over ~600 lines a
file is named here with its next cut written down; over ~1000 the cut is taken, not named.

**Status: two files over the cut limit. The guard that makes the first one safe to cut has landed;
the second is measured as not takeable** — the extraction would make a hub, and rule 1 comes
before rule 5.

Measured by `cia`'s `tools/maintainability.py` (rule M2). Re-measure with:

```bash
python ~/.claude/skills/cia/tools/maintainability.py S:/ai/mixodental --rule=M2
```

## `scripts/walk.mjs` — 4,534 lines. Guard landed 2026-11-14; split owed.

**The guard, and why it came first.** `walk.mjs` is half this repo's ship evidence, and until
2026-11-14 nothing asserted how many checks it ran. A check that stopped running — an early
`return`, a bad merge, or a move during exactly the split proposed below — changed nothing it
reported: it printed a smaller number on the same `ALL PASS` line and exited 0. This repo has
already shipped once under a receipt that read PASS while the thing it was meant to prove had not
run, so the split was refused until the count was asserted.

It now asserts `EXPECTED_CHECKS = 188` on any complete run. `--only`, `--probes`, `--locales` and
a crash resume each walk less by design and are excluded, and each already says so in the verdict
line. **Change the number in the same commit as any check you add or remove.**

**The next cut**, now safe to make, at the file's own comment boundaries:

| Lines | Becomes | Why it is a clean cut |
|---|---|---|
| 182–274 | `scripts/walk/fixtures.mjs` | `heavyPlateFixture`, `asciiStl`, `cubeStl`, `openCubeStl`, `cupStl` — mesh builders, no page, no browser |
| the `// ---- page helpers` block | `scripts/walk/page.mjs` | the Playwright-facing helpers. One job: driving a page |
| the `// ---- locale walk` block | `scripts/walk/locales.mjs` | already a separate run (`npm run walk:locales`) |
| the rest | `walk.mjs`, the runner plus the sections | section selection, `check()`, the verdict |

**Do it one block at a time, running the full walk after each**, and let `EXPECTED_CHECKS` be the
proof: if a move loses a check, the walk now fails instead of congratulating itself. The boundaries
above are a reading of the comments, not a measurement — several of these blocks reference `check`,
`note` and `walk` in their own comments, so measure each one before moving it.

## `src/App.tsx` — 1,635 lines. NOT takeable; the measurement is the reason.

Rule 1 of the principle: *a module is clean when its output is narrower than its input; a module
that needs nearly as much handed in as it hands back is a hub, not a job.* Rule 1 comes before
rule 5.

**The shape of the problem:** this is not 1,635 lines of many functions. It is one `App()`
component from line 178 to the end, and **twenty hooks have already been extracted out of it** —
`useImportFiles`, `useSupportChecks`, `useExport`, `useRegenerate`, `useDentalPreview`,
`useDentalFlow`, `useDentureJob`, `useFreeTransform`, `useProjectFile`, `useRimDrawing`,
`useSupportEdits`, `useThumbnails`, `useBatchDetect` and the rest. What remains is the wiring that
holds them together, which is what an application shell is.

**What must NOT be extracted, with the reason** — this is the repo's worked example of rule 1, and
it is also recorded in `CLAUDE.md`: the `built` and `failedBuilds` maps stay here. A module for
them needs nearly as many host fields handed in as it hands back (~12 in, ~10 out, with 32 read
sites in `App.tsx`), so moving them is motion that looks like modularity and leaves the code worse.
`src/plate/buildViews.ts` and `src/components/useSupportBuilds.ts` are what came out of that area
*instead*, and they passed the test.

**The one clean extraction left, and it is not a cut:** `historyReducer` (line 140) is already a
top-level pure function. It belongs in `src/state/` beside `project.ts`, with its own test — a
pure reducer nothing tests today. Worth doing for the test, not for the line count.

**The shape change that would make a real cut possible** (a redesign, not a refactor, and its own
plan): one reducer per area instead of one component holding every area's wiring. That is a
different review from this register.

## In the debt band (~600–1000), named, no cut owed

`src/state/project.ts` (730) · `scripts/probe-dental-edges.ts` (700) ·
`src/dental/editingMode.ts` (694) · `src/state/project.test.ts` (628).

## Not counted, and why

`src/locales/zh-Hant.ts` (1,091) and `src/locales/ja.ts` (1,086) are string tables: length is
content, not complexity, and splitting them would make a translator's job harder, not easier.
`vendor/mixo-geocore/**` is the engine, consumed as built and never edited here.
