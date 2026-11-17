# Walking the app from the deck — the rail, and the rim loop

Written 2026-11-17, for the walk-through that got stuck twice: **how the four tools work**, and
**how a rim gets detected, edited or added**. Everything here is the code's own rule, with the file
that enforces it beside it, so a disagreement between this page and the screen means this page is
stale — fix it here.

Walk it on `npm run dev` → <http://localhost:5173/mixodental/>. **Not the live site**: that is still
the 14 Nov build (`index-s1NJwrCR.js`) and has none of this week's fixes.

---

## 1. The rail is the order. There is no wizard.

Four tools down the left of the deck — **Orient · Rim · Area · Supports** — with the models beside
them. The dependency between them is shown by **what you can press**, not by marching you through
screens. Nothing is enforced beyond what is genuinely impossible.

`src/deck/toolState.ts` decides each tool's state and is pure: no React, no scene, no strings of its
own. `src/deck/ToolRail.tsx` decides how the states look.

### The four states, in the order they are tested

The order **is** the rule: **unavailable → busy → stale → ready**, and all three pairs are
mutation-checked.

| state | what you see | what it means |
|---|---|---|
| **unavailable** | greyed, **with a line telling you what to do first** | the prerequisite is missing |
| **busy** | *not* greyed — it opens and shows progress | its own job is running right now |
| **stale** | still opens, marked | upstream changed; the work is still there but no longer matches |
| **ready** | pressable | nothing outstanding |

Two rules are the reason this is a module and not a condition inside a button:

1. **Greyed must say why, and what to do.** The type forbids an `unavailable` without its sentence,
   and a test asserts the three sentences differ — one generic line teaches nothing. A disabled
   control with no explanation is *worse* than a wizard step: you see grey and don't know the fix.
2. **"Not yet possible" and "being made right now" must not look alike.** Conflate them and you
   press a tool, see grey, and conclude something failed.

### The lines you will actually hit

Each sentence belongs to the tool that **produces** the thing you're waiting on, whoever is waiting:

| waiting on | the line |
|---|---|
| Orient | *Turn the model the right way up first.* |
| Rim | *The area is measured from the rim, so draw the rim first.* |
| Area | *Mark the support area first.* |

**A tool waits for whatever is immediately above it in its own chain** — one rule, not four
constants. That matters because the chain is job-specific: a **denture** goes Orient → Supports, no
rim and no area, so its Supports waits on the *orientation*. Supports produces nothing, so nothing
ever waits on it; it is last in every chain.

### Why re-orienting does not grey everything downstream

Because the work still exists. It says **stale** instead.

- One revision counter **per unit**, not per tool. (Per-tool, re-accepting Orient would score below
  the supports and nothing would ever go stale.)
- A tool is stale when its number is below **the newest revision anywhere above it in the chain**.
- **The rim and the area take one revision together**, because accepting the policy accepts both. A
  *detected* rim arrives inside that policy and never passes through `rim/set` at all.
- **A draft is not accepted work.** Drawing a rim stamps nothing — the rim is stamped when it is
  promoted into `unit.dental`.

The facts the rail reads come from the scene's own fields (`src/deck/unitFacts.ts`), never from the
revisions; revisions are used **only** for staleness. Read the facts from the revisions instead and
nothing on the rail opens until something has stamped one.

---

## 2. The rim loop: three ways in, one tool

This is the part that was confusing, and the confusion was in the code's history rather than in you
— **it used to have two tools whose meaning flipped on whether the loop was closed.** That is gone.

### Three ways a rim comes to exist

| | how it happens | what you do |
|---|---|---|
| **detected** | detection finds the rim; it arrives inside the policy | nothing — it never passes through `rim/set` |
| **drawn** | detection finds none, so Step 1 detours to the `rim` stage | place handles, close the loop, Done |
| **redrawn** | you choose to redraw a rim that *was* detected | the loop is seeded from detection's own curve, then you edit it |

A redraw is seeded by `src/dental/rim/seedFromDetected.ts`: one handle every 12 mm of arc, plus one
wherever the rim turns 45°, capped at 48. **It is a replacement, not a lossless edit** — the axis
comes back about 5.6° different, and the command says so before you commit to it.

### One tool, and what's under the press decides the act

`src/dental/rim/rimTarget.ts` is the whole grammar. It is pure — a path and a point in, a verdict
out — so every rule below is tested without a browser.

| what is under the press | what happens |
|---|---|
| a **handle** | pick it up and drag it |
| the **drawn line** | put a new handle in there, and pick *it* up |
| the **first handle**, loop open, 3+ points | close the loop |
| **bare model**, loop open | add a point at the end |
| **bare model**, loop closed | nothing to do here — so the press turns the view instead |

**Every press that lands something picks it up in the same press.** Append-and-drag,
insert-and-drag and grab-and-drag are one gesture, not two.

**The resolution order matters:** a handle always wins, because a press that nearly hits one must
become a drag of it rather than a new handle beside it. Closing is tested *before* grabbing on an
open loop, since the first handle is the closing target while the loop is open and only becomes
draggable once it is joined.

Three distances, and the middle one is the one that would otherwise bite:

| | mm | why |
|---|---|---|
| handle grab reach | 0.84 | how near a handle counts as grabbing it |
| line reach | 1 | a line is thinner to hit than a marker, and missing it only falls through to the camera |
| **insert clearance** | **2** | a press this near an existing handle **grabs it** instead of inserting a new one |

Without that last rule, a press that just misses a handle is still within reach of the line running
through it — so it would silently drop a new handle a fraction of a millimetre from the one you
meant to drag, and you would not see it until the shape went wrong. The reverse miss (an intended
insert becomes a drag) is visible as it happens and undone with one key.

### Two traps that were found the hard way

- **The drawn line is the curve, not the chords.** It is sampled by the same `spanCurve` a press is
  measured against. Drawn as chords, the two disagreed by over a millimetre at the seeded spacing,
  and a press on the visible line did nothing.
- **A click that ends a drag is not a tap**, and it cannot be told from one by looking at the path.
  The browser fires `click` on every release, *before* React has rendered the drag's result — so the
  path the handler sees still has the dragged handle at its old spot, and the release point reads as
  bare surface. `rimTapAt` is that guard. Walk check `u5d` is how the gap was found.

### What the pointer looks like

Rim define mode uses `cursor-rim.svg` (`src/components/viewport/style.ts`): a crosshair with a small
open square, and **the square's centre is where the point lands**. Off the model it is the `grab`
hand, because a drag there orbits. A CSS cursor never appears in a screenshot, which is why nobody
saw it until `npm run look` composited it — `.stitch/look/rim-cursor.png`.

Rim define mode shows **only what it owns**: anchors, the line between them, and the cursor. Support
Edit Mode's furniture used to be drawn here too — a ring the size of the erase reach and a cone
where a support would be added, in a mode whose only gesture is placing anchors. That was a dead
affordance and it was removed on 2026-11-17.

### Done

`src/dental/rim/drawnRim.ts` resamples the loop along the surface, then calls
`dental_rim_from_points` (engine 61) for the plane, the side and the 96×96 visibility mask. **Our
own refusals are answered first, in our own words, before the engine is troubled.**

The drawing itself is scene state — `rimDraft` on the unit, set by `rim/set` and `rim/clear` in
`src/state/project.ts` — so the app's ordinary history undoes each edit, and **one drag is one undo
entry**.

---

## 3. Where to look when something is wrong

| the question | the file |
|---|---|
| why is this tool greyed / stale / busy | `src/deck/toolState.ts` |
| where does the rail get its facts | `src/deck/unitFacts.ts` |
| what does a press on the rim mean | `src/dental/rim/rimTarget.ts` |
| why is Done off, what's wrong with my loop | `src/dental/rim/rimStepText.ts` |
| where does the drawing sit in the viewport | `src/dental/rim/rimDraftGeometry.ts`, `src/components/viewport/RimDraftLayer.tsx` |
| the loop geometry itself (knows nothing about teeth) | `src/core/surfacePath/` |
| which stage follows which | `src/dental/flow.ts`, `src/dental/editingMode.ts` |

Design notes: `docs/design/2026-11-05-rim-define-mode.md`,
`docs/design/2026-11-05-back-out-one-level.md`. Folder maps: `src/deck/README.md`,
`src/dental/README.md`.
