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
| `jobSummary.ts` | how the whole drop is doing, counted from the rows' own verdicts |

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

**The order of the tests IS the rule:** unavailable, then busy, then stale, then ready.

- **Unavailable first.** An earlier version tested busy first, on the reasoning that a tool can only
  be busy once its prerequisite is met — and *nothing enforced that*. `busy` is a free field, so
  `{ oriented: false, busy: 'rim' }` rendered Rim as working, hid its own reason, and left the rail
  showing the **Area's** line: an instruction about a step two further on, for a model that was not
  even oriented. Testing the prerequisite first makes the invariant hold instead of assuming it.
- **Busy before stale**, because a tool rebuilding after a change is busy *and* stale, and what the
  operator needs to see is that the work is happening. Telling them it is out of date while it is
  being brought up to date is the confusion the second rule exists to prevent.
- **Stale last of the three**: a missing prerequisite and a running job are both stronger statements
  than "out of date".

All three orderings are mutation-checked — swapping any one of them fails the suite.

## Staleness: one counter, integers only

Re-orienting must not throw the rim, the area and the supports away. It must say they no longer
match. So each tool's accepted work carries a **revision** from one counter per unit, and a tool is
stale when its number is below **the newest revision anywhere above it in the chain**.

*Above it in the chain, not the adjacent link.* The first version walked one link and gave up when
that link had no work of its own, so `{ orient: 5, area: 1 }` reported nothing stale — Area read
ready although a re-orient had left it four revisions behind. `revisionsField` accepts gapped records
(it checks the key names and that each value is a positive integer, not that the chain is
contiguous), so that is a record a saved project can really hold.

**Rejected alternative: recording the rotation each stage was made at and comparing it.** Rotations
are floats, so the comparison needs an epsilon — and an epsilon that decides whether the operator is
told their supports are out of date is a number nobody can defend. Integers from one counter compare
exactly, survive JSON, and read the same a year later.

**The counter is per UNIT, not per tool.** Were it per tool, re-accepting Orient would give it `2`,
below the supports' `4`, and the supports would never go stale. A test pins this.

**Staleness cascades, and only downwards.** Re-orienting raises `orient` above all three below it,
so all three read stale — gaps included, since the comparison is against the newest thing above.
Re-painting the area raises `area` above `supports` only; the rim is left alone, because it was not
affected and saying otherwise is a lie the operator has to unpick.

A tool with *no* work is never stale. That is `unavailable` or `ready`, which `toolState` decides;
staleness is a statement about work that exists.

## The facts are read from the work, not from the record

**NOTHING IN THE APP WRITES `revisions` YET.** The field is saved and validated, and `staleTools` is
correct, but no flow stamps a revision when work is accepted — so in a live session **staleness never
fires**, and a stale rail state is reachable only from a project file that already carries the
numbers. Stamping it at the accept points is the next piece of this increment. Until then, do not
read the stale state as proof the cascade is wired.

That gap is also what made the first version of `oriented` wrong, and it is worth recording. It read
`revisions.orient`, `rimDraft` and `dental` only — so a unit the batch had *just oriented* reported
`oriented: false`, and the rail told the operator to turn a model that was already upright. The
inference meant to rescue legacy projects delivered that failure to every unit in a normal session.

So `oriented` now reads the **detection result the deck is already showing on the row**: a detector
that found a pose is an orientation, and that is a fact the deck has in hand. A closed rim or an
accepted area still counts, because neither can be reached without orienting first.

**A rim means a CLOSED rim.** `rim/set` is dispatched on *every anchor* (`useRimDrawing`, starting
from `emptyPath()`), so testing `rimDraft` for existence opened Area on a single unclosed point — and
an area cannot be measured from one point. That broke the rail's own promise in the direction that
matters: it let the operator into a tool that could not work.

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
underline, stale is pressable on a sunken band with a dashed rule. Tests assert a busy tool carries
no stale class, and — the case that actually matters — that a tool which is **both** busy and stale
renders busy with no stale mark left on it.

**Busy is reachable in the running app**: a row whose orientation detection is still running shows
Orient busy, which is the one busy state the deck can honestly report today.

**The open-tool ink fill is NOT reachable yet.** `ToolRail` takes a `current` prop and the CSS for it
exists, but the deck opens no tool in place, so nothing passes it. It belongs to the one workspace
and is exercised only by unit tests until then — said here rather than left to look like shipped
behaviour. The open tool is an **ink fill, never red**: red is the one primary action, and an active
tab is ink.

## The job-level line

The reference layout has a validation section — per-check warnings with a summary — and that is our
per-row verdict surface raised a level. A deck of eight asks "is anything wrong here?", and eight
separate sentences do not answer it.

**Every count comes from the rows' own `verdictOfDiagnosis` / `verdictOfRefusal`.** The panel cannot
disagree with the list it summarises, which is the failure worth designing out: a summary that
contradicts the rows destroys trust in both, and tests pin both halves.

The refusal half briefly did *not* keep that promise: the count was `refused.length`, which gave the
same number while bypassing the classifier the claim named. It goes through `verdictOfRefusal` now,
so a refusal state that ever stops being a problem stops being counted as one here too.

**It is silent when every row is sound.** A line reading "0 problems" on every drop trains the
operator to stop reading it, and then it says nothing on the drop that matters.

**A unit with no verdict is counted on its own, never as clean** — folding it in would have the panel
vouch for geometry nothing has looked at — and it is not reported as a problem either, because
"not checked" is not "found wrong".

## Where the rail is mounted today, and what that press does

The rail is on the deck, about the selected row (falling back to `nextItem`, which is where work
*resumes* — a returning operator should see the model they are about to pick up, not one they
finished). Pressing a tool **opens that model**, because the step flow still owns the tool work and
the rail is its entry point. A ready button's hint says exactly that rather than naming the tool, so
it is not a button that fails to do what it claims.

What a ready button still tells you truthfully is its **state** — available, stale, blocked — which
is the teaching the wizard used to carry. When the one workspace lands, that note becomes
tool-specific and nothing else here changes.
