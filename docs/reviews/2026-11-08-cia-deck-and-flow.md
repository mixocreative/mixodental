# CIA audit — the deck and the dental flow, 2026-11-08

**Tier: Screen. Scoped subset of the sweeps, not all twenty-four.** Run with the `cia` skill on the
deck → flow → deck journeys after two EGM document reviews missed this class. What EGM audits is a
*document* against document standards, and only one of its seven reviewers reads code, for accuracy
and reuse rather than journeys — so "three of eight rows come back with no rim, now what" had no home
in it. That question came from the owner.

## Honest limits of this run

- **Sweeps run:** S1, S2, S3, S5, S12, S13, S15, S16/S16.1, S22 (incl. S22.6, S22.9, S22.10), S23.
- **UNVERIFIED, not omitted:** S4, S6–S11, S14, S17–S21, S24. S22.11 (the vocabulary census) not run.
- **Doctrine not read whole.** The reference files total ~300 KB; reading them entire risked losing
  the findings to context compaction, so the sweeps that bear on journeys were read and the rest were
  not. By the skill's own rule that makes this a **scoped review rather than a full audit**, and the
  reference receipts cannot be quoted.
- **No live rail press.** Which is exactly why F1 survived: `scripts/walk.mjs` read the rail's
  disabled states and never pressed a tool. `items-start` and `items-remove` appeared nowhere in the
  harness at all.
- Findings were produced by two subagents and then **each one re-verified against the code** before
  being recorded here. Anything they reported that is not below either failed verification or was not
  checked, and is marked as such.

## FIXED in this pass

### F1 — The tool rail had no click handler at all. HIGH, CONFIRMED
`ToolRail` destructured `onPick` and never called it; the buttons carried no `onClick`
(`src/deck/ToolRail.tsx`). Four buttons with four visual states, pressable and greyed looks, and
nothing happened on a press — no message, no busy state. `ItemsPage` passed
`onPick={() => onStart(railUnit)}` into a prop that was never read, and `src/deck/README.md` stated
that pressing a tool works, so the docs disagreed with the code.

**Consequence, and it is the one that mattered:** the only working entry was the Start button, which
opened the first *unfinished* row in list order whatever was highlighted. So **rows were reachable
only in order** — a flagged row in the middle of a case could not be opened until every row above it
was finished or destroyed with Remove. For a drop where three of eight find no rim, that is the
ordinary case.

*Fixed, partly:* Start now honours a selected unfinished row and says which it will open
(`Start this item` vs `Start with the first item`). The rail's own buttons remain inert — wiring them
is per-tool entry, E4 in the design doc §10, and is the owner's next decision.

### F2 — Remove also selected the row it had removed. HIGH, CONFIRMED
The Remove button sat inside the row's own `onClick` with no `stopPropagation`
(`src/items/ItemRow.tsx`), so a press removed the unit and then dispatched a selection naming the id
that had just gone. A wrong highlight would be cosmetic; this was not — `activeUnitChanged` with no
id switches the edit session off, which on a live dental case fed straight into F3.

*Fixed in two places on purpose:* `stopPropagation` for that press, and `selection/set` now drops ids
for units that are not in the scene, so the invariant holds whatever the next caller does.

### F3 — Opening the next item of a case wiped the case. HIGH, CONFIRMED
`startItem`'s mode-`off` branch sent `startDental`, whose reducer cleared `dentalFinished`. The
premise was stated in a comment — *"on the first item the session is still `off`, so resetting
`dentalFinished` is correct there"* — and it is false: `finishDental` leaves the mode **off** and
keeps the finished list (`editingMode.ts`), so that branch is also how the second and later items of
a case are opened.

Finished rows lost their mark, "N items left" went back up, Start offered a finished row again — and
`exitCommands(unit, finished)` stopped sparing them, so **Exit on a reopened row removed supports
that had already been exported.**

*Fixed:* `startDental` takes `resume`, which keeps the list. The Drop page starting a new run does
not pass it, because there a reset is right.

### F4 — Starting a row did not read it. MEDIUM, CONFIRMED
The same branch `return`ed before `startDentalAligner`, and nothing else starts the read: the
auto-start effect in `useDentalFlow` fires only on a profile **change** while already loading. So the
press landed on Step 1's "choose a file" prompt with the row's model already on the plate.

*Fixed:* the branch calls `startDentalAligner`. The walk check asserts the **absence** of the prompt,
because the badge read "Step 1" in both the broken and the fixed app.

## OUTSTANDING — verified, not yet fixed

### F5 — Export never checks that the supports match the current orientation. HIGH
`exportRefusal`'s `unchanged(unitId)` asks only whether the unit changed *during* the export
(`vendor/mixo-geocore/host/supports/exportGate.ts`). Rotate a model after generating supports and the
supports move rigidly with it, still planted for the old down-direction; the export writes them with
no refusal. The only warning is a status line — *"Object moved with its supports. Regenerate to
re-plant supports after a rotation."* — which the next status message replaces.

The data to enforce it exists: `revisions` already stamps `orient` above `supports`, and the rail
already draws Supports as **stale**. That mark has no consumer outside the rail's display (S5), and
the rail is on the deck, where nothing is exported.

**Recommendation: refuse the export, or require a confirmation, when a unit's `supports` revision is
behind its `orient` revision.** This is the worst outcome the system can produce — a print whose
supports were planted for an orientation the operator never approved — and it is one predicate away.

### F6 — Detection failures look exactly like success, and are absent from the tally. MEDIUM
Every row's detect sentence renders in the same muted grey, so "Already upright." and "Could not
check the orientation." are indistinguishable at a glance, and `jobSummary`'s trouble count takes no
detection input. With eight rows the operator must read all eight sentences. The underlying error
cause is also dropped (`useBatchDetect`'s `.catch(() => undefined)`).

### F7 — A row's detect sentence never refreshes from the unit. MEDIUM
It is read from the batch map only, so a row whose rim the operator has since drawn by hand still
reads "No rim found. Draw one to continue." The rail, which reads unit facts, disagrees with the row
text beside it.

## RELAYED, NOT VERIFIED HERE

Recorded so they are not lost, each needing its own check before it is believed:

- Re-entering a worked unit re-detects and dispatches `transform/set`, discarding a hand-picked
  orientation; and Next then dispatches `dental/set` with `stamps: []`, discarding the painted area
  and the Step 3 tuning. If true this is HIGH and it feeds F5.
- "Any model" and "Open a saved project" discard a held multi-file drop silently.
- The print-angle confirm fails open: `confirmPick` returning "no tilt works" is treated the same as
  "first pick confirmed".
- The batch loop applies the profile captured when the loop started to every row queued later.
- The batch queue is not stopped by a row leaving the scene or by the deck closing.
- The row thumbnail is keyed on mesh identity only, so it never redraws after the flow rotates a unit.

## What this changes about the plan

E4 (mount the rail in the workspace, wired to `openTool`) is **not an enhancement** — it is the fix
for a dead control that the docs claim already works. And the deck now has runtime coverage for the
first time: `m4f` (Start's scope) and `m5b` (Start reads the row).
