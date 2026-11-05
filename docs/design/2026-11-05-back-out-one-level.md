# Going back goes out one level

**Owner's words:** *"in all edit mode the back button should go back to exit that mode not to last steps.
In step3 it should not go straight to paint mode, like photoshop, the tools are only active when selected."*

Both sentences are one idea. A drawing program has places inside places — a tool inside a mode inside a
document — and going back leaves the innermost one. The dental flow had the places but not the rule: one
press of Esc, from anywhere, left the whole flow.

## What was wrong

| Where the operator was | What one Esc did | What it should do |
| --- | --- | --- |
| Step 2, Paint in hand | **left the dental flow** | put the brush down |
| Step 3, Add in hand | **left the dental flow** | put the tool down |
| Rim define mode, 12 anchors drawn | **left the dental flow** | leave rim define mode |
| Step 2, nothing in hand | left the dental flow | left the dental flow ✔ |

The aligner kept its place on the plate, so nothing was destroyed — but the operator was thrown three
levels out by the key that, in every drawing program they have ever used, puts the brush down.

## The rule

**Going back goes out one level, never further.** From the inside out:

1. **A live selection** → clear it. (Already true; unchanged.)
2. **A tool in hand** → put it down. The step stays, the model goes inert, a drag turns the view.
3. **A mode** → leave the mode, landing where it was entered from.
4. **Nothing in hand, no mode** → leave the flow, which is what the dental lock note promises.

This is in `editingMode.ts`'s `keys`, read top to bottom in that order.

## Why Back is not the same control as Esc

Tempting, and wrong. The dock's Back arrow sits in `.step-nav`, welded to Next, and it means *the step
before this one*. Making it also mean "put the tool down" would make one icon-only button do two different
things depending on state the operator has to remember, and would tax the common path: in Step 2 a tool is
in hand nearly always, so leaving the step would cost two presses forever.

So the controls divide by what kind of place they leave:

- **Esc** leaves the innermost thing, whatever it is. It is the ladder.
- **Back**, in a **step**, is step navigation: the arrow beside Next.
- **Back**, in a **mode**, is the way out of the mode — and then it is not an arrow at all.

## In a mode, the way out wears a word

Rim define mode is the flow's one modal detour, and the only mode in it with a back control. Its footer was
the step dock's `.step-nav`: an anonymous arrow, welded to Done. That is a promise it cannot keep — the
arrow means "the step before", and this is not a step.

It is now `.mode-nav`: **Cancel** and **Done**, both worded, with a gap between them.

- Worded, because a mode's two ways out are *finish it* and *leave it*, and both deserve a verb.
- A gap, not a seam, because `.step-nav`'s seamless pair are the two ends of one journey, while Cancel and
  Done are opposites — and a seam between opposites invites the wrong one.
- `Cancel` carries **Esc** as its cap and says what leaving costs: *"Leave rim define mode without a rim.
  Step 1 keeps the notice that sent you here."*

Support Edit Mode and no-support zones already worked this way — one **Done**, no Back — which is the
evidence this was the house rule all along and the rim dock was the exception.

## Every key has a button

The house rule (`mixo-app-style`) is that a shortcut always has a visible twin. Esc's new first rung gets
one: **`dental.toolDown` — "Put it down"**, beside the switch, shown only while a tool is in hand. Hint:
*"Put the tool down. The model goes inert and a drag turns the view."*

### What the tool switch does NOT do, and what that cost to find out

The first build made the switch itself the twin: press the pressed tool to clear it. It was wrong twice
over, and the walk found it within one run.

- **It broke an idempotent key.** P/E/A/S run the same path as the switch, so "press A to put Add in hand"
  stopped being true and started depending on what was in hand before. The walk sets Click reach by
  pressing `a` first — and with Add already in hand that press put the tool *down*, took the Click reach
  field off the dock, and the fill timed out 30 seconds later. A keyboard shortcut that names a tool should
  mean *that tool*, every press.
- **It made a radio button behave like a checkbox.** A segment in a switch that unpresses on a second
  press is ambiguous by construction, and operators double-click buttons. A double-click would silently
  empty the hand.

So picking a tool now only ever arms it, and the way out of a tool is always explicit: Esc, or the key that
says what it does.

In Step 3 the tools are Support Edit Mode's own, reused inside the step. The key belongs to the **dental**
reading of them only: in Support Edit Mode proper the tool *is* the mode, and Done is how it ends.

## Checked by

- `rimStage.test.ts` — Cancel's words, cap and hint; the step arrow's words elsewhere; Esc leaves the mode
  and lands on Step 1.
- `dentalStep2.test.ts` — the switch's put-down and its round trip; `dropDentalTool`; where
  `dental.toolDown` is offered; the whole Esc ladder.
- `dentalStep3.test.ts` — Esc puts the tool down before it will leave the flow.
- `walk.mjs` `u10i`–`u10k` — in the running app: the key appears only with a tool in hand; Esc puts the
  tool down **and the Step 2 badge is still there**; pressing the pressed tool puts it down.

That badge assertion is the point of the whole case. If Esc took the flow with it, there would be no badge
left to read.
