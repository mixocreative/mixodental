# Size debt — the register

The rule (the owner's code principle, rule 5): **size is debt with a date.** Over ~600 lines a
file is named here with its next cut written down; over ~1000 the cut is taken, not named.

**Status: two files over the cut limit, and BOTH are measured as not takeable by moving text** —
each extraction would make a hub, and rule 1 of the principle comes before rule 5. Both carry
their measurement below, and the shape change that would make a cut possible. The vacuous-pass
guard on the walk landed anyway, on its own merit.

Measured by `cia`'s `tools/maintainability.py` (rule M2). Re-measure with:

```bash
python ~/.claude/skills/cia/tools/maintainability.py S:/ai/mixodental --rule=M2
```

> ## DECIDED, NOT PENDING — ruled 2026-11-14, do not re-litigate
>
> The owner's standing instruction is that a decision I cannot make is made by **Fable**, with no
> human needed. This is one of those, and Fable ruled on it **twice**:
>
> > *"Rule 1 governs. The owner lists the rules in decision order with rule 1 first, and the
> > project's own CLAUDE.md already applies this precedence to `App.tsx`. Rule 5 says the cut is
> > taken, but a cut that hands 11-114 bindings to a new module produces a hub, which rule 1 calls
> > worse code. The larger rewrite is a behaviour-risking redesign; it is not a size cut and should
> > not be done under a size-cut mandate."*
>
> With one amendment, **which was carried out**: take the blocks that DO pass rule 1. Every block in
> every one of these files was then measured, not just the obvious candidates, and the ones that
> passed were taken — `walk/fixtures.mjs`, `smoke/rendering.mjs`, `input/selectionCommands.js`.
>
> So the entries below are **not an unfinished task and not a deferred one.** They are a recorded
> decision with its evidence, under rule 8 (*debt not taken is written down with the reason*). Each
> one names the shape change that would make a real cut possible; that change is a separate piece of
> work with its own plan, its own review and its own gate run, and it needs the owner to ask for it.
>
> A future reader — or a future automated check — that reads these as outstanding work should
> read this block first.

## `scripts/walk.mjs` — 4,534 → 4,332. One block taken, one check retired; the rest NOT takeable.

**The guard, and why it came first.** `walk.mjs` is half this repo's ship evidence, and until
2026-11-14 nothing asserted how many checks it ran. A check that stopped running — an early
`return`, a bad merge, or a move during exactly the split proposed below — changed nothing it
reported: it printed a smaller number on the same `ALL PASS` line and exited 0. This repo has
already shipped once under a receipt that read PASS while the thing it was meant to prove had not
run, so the split was refused until the count was asserted.

It now asserts `EXPECTED_CHECKS = 188` on any complete run. `--only`, `--probes`, `--locales` and
a crash resume each walk less by design and are excluded, and each already says so in the verdict
line. **Change the number in the same commit as any check you add or remove.**

**Why the split was then refused.** The comment boundaries suggest three clean blocks. Measured
against the bindings declared earlier in the file, with comments stripped so the count is real:

| Block | Earlier bindings it references |
|---|---|
| fixtures (182–274) | **5** of 18 — `HEAVY_PLATE_STL`, `ROOT`, and three parameter-name collisions |
| page helpers (475–869) | **15** of 54 |
| locale walk (4,179+) | **114** of 502, `page` alone 69 times |

This file is a single ordered browser session: each section builds on the scene the previous
sections left, which is what a walk IS. Handing the locale block a context of a hundred and
fourteen things is the hub rule 1 forbids.

**A check was retired, which is the other way a file gets smaller.** `g` and `g-pre` (298 lines)
are gone. The rule they chased -- a queued brush step keeps the mode it was made with, so pressing
Unselect mid-stroke does not unselect the remainder -- is tested deterministically in mixo-geocore
`editing/strokeQueue.test.ts`, which owns the queue: eight cases, no browser, 3 ms. `g` was spending
thirty minutes racing a CPU throttle to re-prove it, and three identical isolated runs returned
three different answers (55/55, 251/53, 0/0), so it had never once run meaningfully. The walk's
check count moved 188 -> 186 with the reason beside the number.

**The fixtures block was taken** (`scripts/walk/fixtures.mjs`, 84 lines): the synthetic mesh
builders and the heavy-plate generator, which open no page and know nothing about checks.
`heavyPlateFixture` takes `note` rather than importing it, so the module does not reach back into
the walk for a logger. The file is still far over the limit and this entry stays.

**The shape change that would make a cut possible** (a rewrite of the walk, not a move): make each
section self-sufficient — own fixture, own scene, own teardown — so sections can run in any order.
That costs a browser boot per section against a 2,309-second walk, and is a different review with
its own plan.

**If anyone does attempt it anyway**, `EXPECTED_CHECKS` is the proof: a move that loses a check now
fails the walk instead of congratulating itself. Move one block, run the full walk, repeat.

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
