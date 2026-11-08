# The job deck — the rail, and what it is allowed to say

The application level is no longer a wizard. Four tools — **Orient · Rim · Area · Supports** — sit on
a rail down the left of the deck with the models beside it, and the dependency between them is
expressed by **what the operator can press** rather than by marching them through steps. Nothing is
enforced beyond what is genuinely impossible.

| file | what it decides |
|---|---|
| `toolState.ts` | each tool's state, the line a greyed one shows, and `railReason` |
| `unitFacts.ts` | the only place that reads the scene's fields and answers the rule's questions |
| `jobSummary.ts` | how the whole drop is doing, counted from the rows' own verdicts |
| `ToolRail.tsx` | how the four states LOOK; it renders the reason line `toolState` picks, and names what each press opens |

**Two pieces live one layer down**, because the reducer needs them too and the deck must not be
imported from below it: `src/state/tools.ts` holds `ToolId` and `TOOL_ORDER` — the four tools and the
order they depend on — and `src/state/revisions.ts` holds whose work is out of date. They were here
once, which made a cycle: `state/project.ts` reached up for `TOOL_ORDER` and `stamped` while
`unitFacts.ts` reached down for `PrintUnit`. `src/deckBoundary.test.ts` keeps the direction one-way.

`toolState.ts` is **pure**: no React, no scene, no strings of its own. `jobSummary.ts` is pure too
and is the one module here that imports a *value* from `../items/` — deliberately, because its whole
promise is that it cannot disagree with the rows, and it keeps that promise by calling the rows' own
classifier rather than reimplementing it. `ToolRail.tsx` is the only component.

**Each module's docstring carries its own history.** Where a rule was got wrong once and fixed, the
account sits at the code it governs rather than here, so there is one copy to keep true. This file is
the map: what the rules ARE, and where to go for why.

## Two rules about disabled controls

1. **Greyed must say why, and what to do** — the type forbids an `unavailable` without its line, and
   a test asserts the three lines differ, because one generic sentence teaches nothing.
2. **"Not yet possible" and "being made right now" must not look alike** — greyed means *cannot yet,
   do this first*; a running tool is **busy**, still pressable, marked, not dimmed.

Both are the reason this is a module rather than a condition inside a button, and `toolState.ts`
argues them where they are enforced.

## The four states, and the order they are tested in

*ready* · *busy* · *unavailable(because)* · *stale*. The order **is** the rule:
**unavailable → busy → stale → ready**, and all three pairs are mutation-checked. Each tool's
prerequisite and the line it shows meanwhile are **one record** (`PREREQUISITE`), so a fifth tool
cannot be given one without the other. `toolState.ts` holds the reasoning for the order.

## Staleness

Re-orienting must not throw the rim, the area and the supports away — it must say they no longer
match. Each tool's accepted work carries a **revision** from one counter per unit, and a tool is
stale when its number is below **the newest revision anywhere above it in the chain**.

Three properties worth knowing, with the reasoning in `src/state/revisions.ts` and
`src/state/project.ts`:

- **The counter is per unit, not per tool.** Per-tool, re-accepting Orient would score below the
  supports and nothing would ever go stale.
- **The rim and the area take one revision together**, because accepting the policy accepts both. A
  detected rim arrives inside that policy and never passes through `rim/set` at all.
- **A draft is not accepted work.** Drawing a rim stamps nothing; the rim is stamped when it is
  promoted into `unit.dental`.

**Where it is stamped:** in the reducer (`src/state/project.ts`), not at the call sites — the work is
recorded there, the stamp rides inside the same command so an accept stays one undoable step, and the
reducer can see the previous state, which the orientation rule needs. `dental/set` carries a
`settingsOnly` flag for the dispatches that replace only policy settings and do not move the
footprint.

## The facts come from the work, not from the record

`unitFacts.ts` answers the rule's questions from the scene's own fields and the row's detection
result, and uses the revisions **only** for staleness. Read the facts from the revisions instead and
nothing on the rail opens until something has stamped one.

It is also the only module that knows a **denture** is a different job: its accepted policy is
`unit.denture` and it has no area step, so reading `unit.dental` alone had the rail instruct about a
rim on a job that never draws one.

## What is saved

`PrintUnit.revisions`, validated by `normalizeUnit`. **Dropped whole on one bad entry**: the numbers
mean nothing alone, only relative to each other, so half a record would have the rail compare a
loaded number against a missing one and call sound work stale. A record naming a tool this build's
rail does not have is dropped too — it was written against a different chain.

## The rail, drawn

**Words, not icons.** `src/ui/assets/icons/` has `orient` and nothing for the other three, and that
system is file-driven so a designer owns the drawings. One icon beside three bare words looks broken.

**One reason line, not four** — the first unavailable tool's, which *is* the next thing to do. It is
text on the page rather than a `title`, because a tooltip is invisible on a touch screen. Every
greyed tool still carries its own reason as a `title`.

**The three looks are kept apart in the markup** so CSS cannot collapse them: blocked is `disabled`
and muted, busy is pressable with the red progress underline, stale is pressable on a sunken band
with a dashed rule. A test covers the case that matters — a tool which is *both* busy and stale
renders busy, with no stale mark left on it. There is no open-tool state: the deck opens no tool in
place.

**Layout.** One flex row in `ItemsPage`, and the one workspace's own left edge when that exists. The
walk checks it as geometry (`m4e`: the rail's right edge clear of the list's left, both sharing a top
band), not by class name, because a stray `display: block` would undo it silently. Below 520px it
stacks: the labels are words in three languages and must not clip.

## The job-level line

The reference layout has a validation section; this is our per-row verdict surface raised a level. A
deck of eight asks "is anything wrong here?", and eight separate sentences do not answer it.

Every count comes from the rows' own `verdictOfDiagnosis` / `verdictOfRefusal`, so the panel cannot
disagree with the list it summarises. It is **silent when every row is sound** — a line reading
"0 problems" on every drop trains the operator to stop reading it. A unit with no verdict is counted
on its own, never as clean, and never reported as a problem: "not checked" is not "found wrong".

## Pressing a tool

It opens the **model**, at the start of its flow. Not the tool.

A `toolEntry` module that walked `backDental` to the pressed tool was built and then deleted. Review
found three independent faults, worth knowing before anyone writes it again:

- **It was unreachable.** The rail lives on the deck; the deck renders only while
  `startScreen === 'items'`; every route to a start screen sends `exit` first. A live dental session
  and the deck on screen cannot both be true, so the branch never ran.
- **It hard-coded the aligner stage order.** A denture skips `area` (`stageBeforeSupports`), so one
  press too many would have landed on the type screen with `dentalUnitId` cleared and an orient job
  still running.
- **It bypassed a guard it claimed to respect.** Back out of Step 3 asks for confirmation and
  discards hand work, and that guard lives in the *command handler*, not the reducer — so sending
  `backDental` straight at the reducer skipped both.

Per-tool entry belongs with the one workspace, where the rail is on screen during the flow and a
press can go through the same command the operator's own Back does.

## Adding a fifth tool

1. `src/state/tools.ts` — `ToolId` and its place in `TOOL_ORDER`. The chain's order is the
   dependency, so this is the decision; everything below follows from it.
2. `toolState.ts` — its `PREREQUISITE` entry (the test and the line together), and `ToolFacts` if it
   needs a new fact.
3. `unitFacts.ts` — produce that fact from the scene.
4. `ToolRail.tsx` — `LABEL`.
5. The three locale files — the label and the reason line.
6. `styles.css` (`.tool-rail`) only if the tool needs a look of its own.

`src/state/project.ts` needs nothing: `revisionsField` validates against `TOOL_ORDER`, so a new tool
is accepted in a saved record automatically — but the reducer will not STAMP it until a command says
so. Tests to extend: `toolState.test.ts`, `unitFacts.test.ts`, `src/state/revisions.test.ts`.

## The press carries the tool (increment E4)

W-02 had two halves and only the first was obvious. The buttons had no `onClick` at all, so four
states were drawn and none was pressable; that was fixed on 2026-11-08. The second half survived it:
`ItemsPage` passed `onPick={() => onStart(railUnit)}` and **threw the tool argument away**, so all
four buttons did the one thing — open the model at the start of its flow — and the rail's own `ready`
note, "Open this model.", was the truthful description of that.

The press now carries the tool, and `App.tsx` decides what each one may enter. **One row of the
rail actually goes somewhere different, and only one:** pressing **Rim** on a row whose batch
detection came back `no-rim` enters rim drawing directly (`useDentalFlow.startRimDrawing`). That row
is the one case where the evidence is already in hand — the detector ran, judged the mesh usable and
found nothing to measure from, which is exactly the state Step 1 answers with `dentalRimNeeded` —
so opening it at Step 1 meant running `dentalOrient` again to be told what the row already said.

Every other press keeps today's behaviour. On a row whose rim **was** detected the question becomes
*may a detected rim be redrawn*, and that is the owner's to settle; this increment does not need the
answer, which is why it is scoped this way. A denture has no Rim button at all (`toolsFor`), so the
branch cannot be reached on one.

**Why this is not the deleted `toolEntry` coming back.** That module walked `backDental` to the
pressed tool, and `App.tsx`'s rail-press comment records its three faults: it was unreachable, it
hard-coded the aligner stage spine, and it bypassed a confirm-and-discard guard that lives in the
command layer. This goes FORWARD into the flow through the same events the detected path uses,
discards nothing and walks nothing back, and the per-tool entry §10 of
`docs/design/2026-11-07-import-and-items-flow.md` describes — `openTool(tool, unitId)`, free because
it mutates nothing — still belongs with the workspace, where the rail is on screen during the flow.