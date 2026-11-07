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
| `toolEntry.ts` | which session events open a tool from where the operator stands |

`toolState.ts`, `revisions.ts` and `toolEntry.ts` are **pure**: no React, no scene, no strings of
their own. `toolEntry.ts` names the flow's stages, but only as a `import type` — so it stays pure,
pulls no dental code into the bundle, and a rename on that side breaks the build here rather than
drifting quietly.

`jobSummary.ts` is pure too, and is the one module here that imports a *value* from `../items/` —
deliberately, because its whole promise is that it cannot disagree with the rows, and it keeps that
promise by calling the rows' own classifier rather than reimplementing it.

`ToolRail.tsx` is the only component.

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

**The revisions are stamped in the REDUCER** (`src/state/project.ts`), not at the call sites that
accept work. Three reasons, in order of weight:

1. The work is recorded there, so it is the one place that cannot be forgotten when a new call site
   appears.
2. The stamp rides inside the same command, so accepting something stays **one undoable step**.
   `withSceneCommand` makes each command one step, so a separate dispatch would have cost the
   operator two undos per accept.
3. The reducer can see the *previous* state, which is what the orientation rule needs.

| command | stamps | when |
|---|---|---|
| `transform/set` | `orient` | only when the **rotation** changed — a move is not an orientation, and stamping it would age the rim every time a model was nudged across the view. Exact equality on the three numbers, no epsilon to defend |
| `rim/set` | `rim` | only when the path is **closed**; the drawing dispatches on every anchor |
| `rim/clear` | drops `rim` | a number left behind would claim work that is gone, and the area would be aged against a ghost |
| `dental/set`, `dental/stamps/add` | `area` | painting the area **is** changing it, so supports built from the old one are out of date |
| `dental/clear` | drops `area` | |
| `supports/set` | `supports`, or drops it | the same command carries a build and a clear, so which it is depends on what arrived |
| `supports/remove` | drops `supports` | |

An earlier version of this file said nothing stamped at all, which was true and is no longer.

That gap is what made the first version of `oriented` wrong, and it is worth recording. It read
`revisions.orient`, `rimDraft` and `dental` only — so a unit the batch had *just oriented* reported
`oriented: false`, and the rail told the operator to turn a model that was already upright. The
inference meant to rescue legacy projects delivered that failure to every unit in a normal session.

So `oriented` now reads the **detection result the deck is already showing on the row**: a detector
that found a pose is an orientation, and that is a fact the deck has in hand. A closed rim or an
accepted area still counts, because neither can be reached without orienting first — and a stamped
`revisions.orient` counts too, which is the path a reopened project takes.

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

The rail is **down the left of the deck with the models beside it**, which is where the design puts
it — one flex row in `ItemsPage`, and the one workspace's own left edge when that exists, with the
same component either way. The walk checks that as GEOMETRY (`m4e`: the rail's right edge clear of
the list's left edge, both sharing a top band), not by class name, because a stray `display: block`
would undo it silently and a class assertion would never notice. Below 520px it stacks, since the
labels are words in three languages and must not clip.

It is about the selected row — falling back to `nextItem`, which is where work *resumes*, because a
returning operator should see the model they are about to pick up rather than one they finished; and
behind that to the **last** row, because `nextItem` is undefined once everything is finished and a
rail that vanishes from a page which still has rows reads as a fault. ## Pressing a tool

`toolEntry.ts` maps the tool to the events that reach it, and the rule has one shape worth stating:
**backwards only.**

Going forward is an **accept** — the area is measured from a rim the operator approved, the supports
are built from an area they approved. Those approvals do real work and are the tool's own primary
action, so a rail press must not perform them on the operator's behalf. Going *back* is what the rail
is for: a tool that reads **stale** is precisely one whose work is out of date and must be revisited,
and before this the operator had to press Back the right number of times to get there.

It needs **no new transitions and loosens no guard**. `backDental` already walks the stages
(review → area → aligner) and `dentalRimReopen` already reopens the drawing from `aligner`, both with
their own conditions intact. A "jump to this stage" event would have meant writing prerequisite
checks a second time, beside the ones `toolState` already makes.

`rim` is a **detour off `aligner`**, not a stage on the spine — which is where the first version of
this went wrong. It counted depth along the spine, where `rim` and `aligner` sit level, so opening
Orient from inside the rim drawing came out as zero steps and read as *cannot get there*, when one
Back does exactly that. A test pins it.

**WHEN THIS ACTUALLY FIRES, stated plainly.** The rail is on the deck, and the deck is a start
screen, which the dental flow hides. So the back-walking path is reached only when the session is
mid-flow on that unit *and* the operator is looking at the deck — real (drop more files while a flow
is live and the deck returns) but narrow. Every other press opens the model, as before.

Putting the rail in the dental workspace as well would make it fully reachable, and it was considered
and **rejected for now**: beside the existing step dock it would give two competing ideas of where
the operator is, which is the confusion this whole redesign exists to remove. It belongs with the
dissolve, where the dock becomes a widget.

Pressing a tool that is forward of the operator **opens that model**, because the step flow still owns the tool work and
the rail is its entry point. A ready button's hint says exactly that rather than naming the tool, so
it is not a button that fails to do what it claims.

What a ready button still tells you truthfully is its **state** — available, stale, blocked — which
is the teaching the wizard used to carry. When the one workspace lands, that note becomes
tool-specific and nothing else here changes.
