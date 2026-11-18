# src/deck: what the whole drop is doing

One module now. This folder held the deck's tool rail — `ToolRail.tsx` and the two pure modules
behind it, `toolState.ts` and `unitFacts.ts` — until 2026-11-18, when the owner asked the question
that ended it: *"i dont know why the need to show orient, rim, area, supports, and explain."*

There was no good answer. The deck's job is three things — see the files, say what each one is,
start — and the rail was a fourth door into the flow for whichever row happened to be highlighted,
duplicating the row's own click and the footer's Start key. Its explainer taught the dependency order
of a step nobody had entered yet, on a screen whose reader is deciding *what* to work on rather than
*how*. It also took 104px off every row of a worklist.

**It was handed over, not deleted** — `mixomesh/port/mixosupports/toolrail/`, with its tests, its CSS
and the whole of this folder's old README (`RAIL-RULES.md`: the greyed/busy/stale rule, the
dependency order, and the recorded faults, including the one where the buttons had no handler at all
and two document reviews missed it). Inside a flow, where the tools act and where *"the area is
measured from the rim, so draw the rim first"* is the sentence the operator needs, the rail is right.
It was only wrong here.

| File | Job |
|---|---|
| `jobSummary.ts` | the aggregate line under the rows: how many are sound, how many need a look, how many were refused — from the SAME verdicts the rows show, so the two cannot disagree |

`jobSummary.ts` is **pure**: no React, no scene, no strings of its own. It returns a `Message`, so the
page translates it and the tally re-translates when the language changes.

## What still lives next door

- `src/items/` — the page, the rows, the batch detector, the row pictures, and `README.md`'s four
  rules for what a row LOOKS like (one line, quiet when there is nothing to say, a square tile, and
  the type always shown).
- `src/state/tools.ts` — `ToolId`, `TOOL_ORDER` and `toolsFor(job)`. The dental flow itself still
  walks that order; it was never the rail's property.
