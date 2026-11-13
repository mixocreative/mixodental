# Size debt — the register

The rule (the owner's code principle, rule 5): **size is debt with a date.** Over ~600 lines a
file is named here with its next cut written down; over ~1000 the cut is taken, not named.

**Status, honestly: two files are over the cut limit and neither cut has been taken.** A live
violation of rule 5, recorded here under rule 8 — *debt not taken is written down with the
reason*. Both reasons are specific and below, and neither is "no time".

Measured by `cia`'s `tools/maintainability.py` (rule M2). Re-measure with:

```bash
python ~/.claude/skills/cia/tools/maintainability.py S:/ai/mixodental --rule=M2
```

## Over the cut limit (~1000) — the cut is owed

### `scripts/walk.mjs` — 4,507 lines

**The next cut, concretely.** The file already has its boundaries marked by its own comments:

| Lines | Becomes | Why it is a clean cut |
|---|---|---|
| 62–274 | `scripts/walk/fixtures.mjs` | `faultLevers`, `heavyPlateFixture`, `asciiStl`, `cubeStl`, `openCubeStl`, `cupStl` — pure mesh builders, no page, no browser |
| 475–869 (`// ---- page helpers`) | `scripts/walk/page.mjs` | the Playwright-facing helpers. One job: driving a page |
| 4,179+ (`// ---- locale walk`) | `scripts/walk/locales.mjs` | already a separate run (`npm run walk:locales`) |
| the rest | `walk.mjs`, the runner plus the sections | section selection, `check()`, the report |

**The reason it is not taken yet, and it is the real one:** this file *is* half the ship evidence.
A check that silently stops running after a move is strictly worse than a 4,500-line file, and
nothing currently asserts the total. **So the cut's first commit is not a move — it is a count
assertion**: `walk.mjs` must fail if the number of checks it registers differs from the recorded
188. With that in place the moves are safe and can be made one at a time. Without it, the refactor
can delete coverage and still report `ALL PASS`, which is the exact failure mode this repo has
already paid for once.

### `src/App.tsx` — 1,635 lines

**The shape of the problem:** it is not 1,635 lines of many functions. It is one `App()` component
from line 178 to the end. So the cut is custom hooks, which this repo already does — `src/plate/
buildViews.ts` and `src/components/useSupportBuilds.ts` came out of here.

**The next cut, concretely:** the next hook out is the **export/command dispatch** around
`exportKindOf` and the command wiring — it has a narrow input (the command id and the current
scene) and a narrow output (what to run), which passes the hub test. After that, the history
reducer (`historyReducer` at line 140, already a standalone function) moves to `src/state/` beside
`project.ts` and gets its own test.

**What must NOT be extracted, with the reason** (this is the part worth reading before trying):
the `built` and `failedBuilds` maps stay in `App.tsx`. Pulling them into a module needs nearly as
many host fields handed in as it hands back — a hub, not a job — so moving them is motion that
looks like modularity and leaves the code worse. That judgement is also recorded in `CLAUDE.md`,
and it is the repo's worked example of the principle's first rule.

## Over the debt limit (~600), named, no cut owed yet

`src/state/project.ts` (730) · `scripts/probe-dental-edges.ts` (700) ·
`src/dental/editingMode.ts` (694) · `src/state/project.test.ts` (628).

## Not counted, and why

`src/locales/zh-Hant.ts` (1,091) and `src/locales/ja.ts` (1,086) are string tables: length is
content, not complexity, and splitting them would make a translator's job harder, not easier.
`vendor/mixo-geocore/**` is the engine, consumed as built and never edited here.
