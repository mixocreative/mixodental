# Going back goes out one level

**Owner's words:** *"in all edit mode the back button should go back to exit that mode not to last steps.
In step3 it should not go straight to paint mode, like photoshop, the tools are only active when selected."*

Then, on seeing it built: *"needing 'Put it down' seems wrong"*, and
**"maybe select tool should goes first as the default tool, like photoshop, becuz a mouse is the most
intuitive thing by defualt."*

Both rounds are one idea. A drawing program has places inside places — a tool inside a mode inside a
document — and going back leaves the innermost one. The dental flow had the places but not the rule: one
press of Esc, from anywhere, left the whole flow.

## What was wrong

| Where the operator was | What one Esc did | What it should do |
| --- | --- | --- |
| Step 2, Paint in hand | **left the dental flow** | put the brush down |
| Step 3, Add in hand | **left the dental flow** | put the tool down |
| Rim define mode, 12 anchors drawn | **left the dental flow** | leave rim define mode |
| Step 2, resting | left the dental flow | left the dental flow ✔ |

The aligner kept its place on the plate, so nothing was destroyed — but the operator was thrown three
levels out by the key that, in every drawing program they have ever used, puts the brush down.

## The rule

**Going back goes out one level, never further.** From the inside out:

1. **A live selection** → clear it.
2. **A tool that is not Select** → go back to Select. The step stays.
3. **A mode** → leave the mode, landing where it was entered from.
4. **Resting on Select, nothing picked** → leave the flow, which is what the dental lock note promises.

This is in `editingMode.ts`'s `keys`, read top to bottom in that order.

## Putting a tool down is picking Select up

The first build gave the second rung its own control: **"Put it down"**, a key beside the tool switch
that emptied the hand. The owner's instinct was that this was wrong, and it was, for a reason worth
writing down:

**Nothing is put down in a drawing program. You pick up something else.** Photoshop, Illustrator, Figma,
Blender — there is always something in your hand, and the way out of the brush is the arrow. An empty
hand is a state none of them has, so it needs a button to explain itself, and the button's hint had to
describe a state the operator had no name for.

It was also half-selling something already true. A tool in hand has never blocked the view: the rule in
Step 2 is *drag on the model to use the tool, drag empty space to turn the view*. So "the model goes
inert and a drag turns the view" promised a freedom the operator already had. The only thing the empty
hand genuinely bought was not marking the model by accident — and **Select buys that too, while being a
tool like any other**.

So:

- **Select is the first segment of the switch**, where the arrow is in every drawing program.
- **Every step opens on Select** — Step 2, Step 3, and Step 2 again when Back returns to it. A brush
  never carries across a step edge.
- **`dentalToolArmed` is gone.** There is no empty hand to represent, so the flag that represented it,
  the `dropDentalTool` event that reached it and the `dental.toolDown` command that ran it are all
  deleted. One state fewer, one event fewer, one command fewer, and one control off a crowded row.
- **Esc's visible twin is the Select segment**, which was always going to be on screen anyway. The house
  rule that every shortcut has a button is kept by removing a button, not adding one.

### What the tool switch does NOT do, and what that cost to find out

An earlier build made the switch itself the way out: press the pressed tool to clear it. It was wrong
twice over, and the walk found it within one run.

- **It broke an idempotent key.** P/E/A/S run the same path as the switch, so "press A to put Add in hand"
  stopped being true and started depending on what was in hand before. The walk sets Click reach by
  pressing `a` first — and with Add already in hand that press put the tool *down*, took the Click reach
  field off the dock, and the fill timed out 30 seconds later.
- **It made a radio button behave like a checkbox.** A segment that unpresses on a second press is
  ambiguous by construction, and operators double-click.

Picking a tool therefore only ever picks it, however many times the same one is chosen. Select-first
keeps that intact: it is a segment with its own key, so pressing it always means the same thing.

## The cursor says what is in your hand

A switch is only half the answer, because the operator is looking at the model, not the dock. The
viewport already had a cursor system (`components/viewport/style.ts`) — a tinted brush icon for the
zone brushes, a crosshair where a click places something — but Step 2's branch was **one crosshair for
all four tools, and for no tool at all**, which invited a click that could do nothing.

Each tool now has its own pointer, and off the model every one of them is a grab hand, because there a
drag orbits whatever is in hand:

| Tool | Over the model | Off the model |
| --- | --- | --- |
| Select | arrow | arrow |
| Paint | brush icon, zone tint | grab |
| Erase | brush icon, grey tint | grab |
| Add | crosshair | grab |

Step 3's Add was a crosshair everywhere for the same reason and is now the same shape.

## In a mode, the way out wears a word

Rim define mode is the flow's one modal detour, and the only mode in it with a back control. Its footer
was the step dock's `.step-nav`: an anonymous arrow, welded to Done. That is a promise it cannot keep —
the arrow means "the step before", and this is not a step.

It is now `.mode-nav`: **Cancel** and **Done**, both worded, with a gap between them.

- Worded, because a mode's two ways out are *finish it* and *leave it*, and both deserve a verb.
- A gap, not a seam, because `.step-nav`'s seamless pair are the two ends of one journey, while Cancel and
  Done are opposites — and a seam between opposites invites the wrong one.
- `Cancel` carries **Esc** as its cap and says what leaving costs: *"Leave rim define mode without a rim.
  Step 1 keeps the notice that sent you here."*

Support Edit Mode and no-support zones already worked this way — one **Done**, no Back — which is the
evidence this was the house rule all along and the rim dock was the exception.

## Why Back is not the same control as Esc

Tempting, and wrong. The dock's Back arrow sits in `.step-nav`, welded to Next, and it means *the step
before this one*. Making it also mean "go back to Select" would make one icon-only button do two
different things depending on state the operator has to remember.

So the controls divide by what kind of place they leave:

- **Esc** leaves the innermost thing, whatever it is. It is the ladder.
- **Back**, in a **step**, is step navigation: the arrow beside Next.
- **Back**, in a **mode**, is the way out of the mode — and then it is not an arrow at all.

## One command enabled where it is not shown

`dental.tool.select` is **visible in Step 2 only** — Step 3 draws its own switch, carrying Add and
Select — but it is **enabled in both**, because Esc in Step 3 runs it and `keyAction` drops any command
that is not enabled. That is the honest shape rather than an oddity: a key with no button of its own in
Step 3, because the switch already there carries it.

## Checked by

- `rimStage.test.ts` — Cancel's words, cap and hint; the step arrow's words elsewhere; Esc leaves the mode
  and lands on Step 1.
- `dentalStep2.test.ts` — the step opens on Select; picking a tool is idempotent; a brush is put down by
  picking Select up; `dental.toolDown` no longer exists; the whole Esc ladder, including that Esc leaves
  the flow only from Select.
- `dentalStep3.test.ts` — Esc goes back to Select before it will leave the flow.
- `session.test.ts`, `dentureStages.test.ts` — every entry into a step rests on Select.
- `walk.mjs` `u10g`–`u10l` — in the running app: Step 2 opens on Select; a drag marks nothing there; Esc
  goes back to Select **and the Step 2 badge is still there**; the tool keys stay idempotent; Select is
  the first segment and one is always pressed.

Rim define mode's own ladder is checked by `u5`–`u5h`, which now draw a rim for real: place, adjust,
clear, close, and Done. Cancel takes its own pass, because a second aligner is laid out beside the
first and the drawing checks need a plate holding one object.

That badge assertion is the point of the whole case. If Esc took the flow with it, there would be no badge
left to read.
