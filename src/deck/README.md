# The job deck — the rail, and what it is allowed to say

The wizard is gone. Four tools — **Orient · Rim · Area · Supports** — sit on a rail, and the
dependency between them is expressed by **what the operator can press** rather than by marching them
through steps. Nothing is enforced beyond what is genuinely impossible.

| file | what it decides |
|---|---|
| `toolState.ts` | each tool's state, and the line a greyed one shows. The rail's order lives here |
| `revisions.ts` | whose work is out of date, from one counter per unit |
| `unitFacts.ts` | the only place that reads the scene's fields and answers the four questions |
| `ToolRail.tsx` | how the four states LOOK, and the one line that says the next thing to do |

`toolState.ts` and `revisions.ts` are pure: no React, no scene, no strings of their own.

## Why a disabled button needs a module

Two things go wrong with disabled controls, and both are the reason the rule is a tested function
rather than a condition inside a button.

**Greyed must say why, and what to do.** A disabled control with no explanation is *worse* than a
step: the operator sees grey and does not know the fix. That one line is doing the teaching the
wizard used to do, so `unavailable` cannot exist without it — the type makes that impossible, and a
test asserts all three lines differ, because one generic sentence teaches nothing.

**"Not yet possible" and "being made right now" must not look alike.** Greyed means *cannot yet, do
this first*. A tool whose work is generating is **busy**: it opens and shows progress. Conflate them
and the operator presses a tool, sees grey, and concludes something failed.

## The four states, and the order they are tested in

*ready* · *busy* · *unavailable(because)* · *stale*.

**The order of the tests IS the rule:** busy, then unavailable, then stale, then ready.

- **Busy first**, because a tool rebuilding after a change is busy *and* stale, and what the operator
  needs to see is that the work is happening. Telling them it is out of date while it is being
  brought up to date is the confusion the second rule exists to prevent.
- **Unavailable before stale**, because a missing prerequisite is the stronger statement: there is
  nothing useful to open, so "out of date" would be beside the point.

Both orderings are mutation-checked — swapping either one fails the suite.

## Staleness: one counter, integers only

Re-orienting must not throw the rim, the area and the supports away. It must say they no longer
match. So each tool's accepted work carries a **revision** from one counter per unit, and a tool is
stale exactly when its number is below the number of the tool above it.

**Rejected alternative: recording the rotation each stage was made at and comparing it.** Rotations
are floats, so the comparison needs an epsilon — and an epsilon that decides whether the operator is
told their supports are out of date is a number nobody can defend. Integers from one counter compare
exactly, survive JSON, and read the same a year later.

**The counter is per UNIT, not per tool.** Were it per tool, re-accepting Orient would give it `2`,
below the supports' `4`, and the supports would never go stale. A test pins this.

**Staleness cascades, and only downwards.** Re-orienting raises `orient` above all three below it,
so all three read stale. Re-painting the area raises `area` above `supports` only — the rim is left
alone, because it was not affected and saying otherwise is a lie the operator has to unpick.

A tool with *no* work is never stale. That is `unavailable` or `ready`, which `toolState` decides;
staleness is a statement about work that exists.

## The facts are read from the work, not from the record

`unitFacts.ts` answers `oriented` / `hasRim` / `areaAccepted` from the scene's own fields —
`rimDraft`, `dental` — and uses the revisions **only** for staleness. Read the facts from the
revisions instead and nothing on the rail opens until the flow has stamped one, so every project
saved before the field existed reads as untouched.

**Orienting is inferred where it is not recorded**, and the inference is sound rather than generous:
a rim is drawn on a model the operator was looking at the right way up, and an area is measured from
a rim. You cannot reach either without having oriented. Without it, an older project returns with Rim
greyed and the operator told to redo work sitting in front of them — the exact failure the reason-line
rule exists to prevent, delivered by the thing meant to prevent it.

## What is saved

`PrintUnit.revisions`, validated by `normalizeUnit`. **Dropped whole on one bad entry**, never per
entry: the numbers mean nothing on their own, only relative to each other, so keeping the readable
half would have the rail compare a loaded number against a missing one and call sound work stale. An
absent record reads as "nothing accepted yet", which is what an unreadable one tells us anyway.

A record naming a tool this build's rail does not have is also dropped — it was written against a
different chain, so comparing against it would be meaningless.

## The rail, drawn

**Words, not icons.** `src/ui/assets/icons/` has `orient` and nothing for the other three, and that
system is file-driven precisely so a designer owns those drawings rather than code inventing them.
One icon beside three bare words looks broken, so all four are words; dropping the files in later
needs no change here. The house style allows plain word buttons for exactly this.

**One reason line, not four.** It belongs to the first unavailable tool, which *is* the next thing to
do — one instruction at a time, the one thing the wizard did well. It is text on the page rather than
a `title`, because a tooltip is invisible on a touch screen and easy to miss with a pointer. Every
greyed tool still carries its own reason as a `title`, since the line only covers the next one.

**Greyed, busy and stale must never look alike**, and the markup keeps them apart so CSS cannot
collapse them by accident: blocked is `disabled` and muted, busy is pressable with the red progress
underline, stale is pressable on a sunken band with a dashed rule. A test asserts a busy tool carries
no stale class and vice versa. The open tool is an **ink fill, never red** — red is the one primary
action, and an active tab is ink.
