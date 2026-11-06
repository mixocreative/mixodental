# src/bench: the scene with no mode in hand

**The bench** is the app at rest: the plate, the panels, nothing in hand. It is the scene an operator
sees most, and until this module it was the only one with no name.

> **The step flow no longer ends here.** Step 3 writes its own STL and returns to the start screen
> (`FLOW_END` in `src/scenes/sceneMap.ts`). The scene itself is unchanged and fully reachable — by
> *Any model* on the start screen, and by opening a saved project. It is where Support Edit Mode,
> no-support zones, the plate panel, Save project and the five exports live.

## Why it needed a name

It could only be referred to by negation. In code it is `mode: 'off'` — what it is *not*. In
`docs/design/ui-structure.md` it was "No mode (setup)", which describes arriving there the first time
and implies you never come back. So the question **"what do you call the screen after the last
step?"** had no answer, and the honest answer — *the same screen you started on* — was not sayable.

It is called the bench, after the surface a technician's work sits on. Every other state in the app is
something you are **doing**: Support Edit Mode, no-support zones, a dental step. The bench is where
the work rests while you are doing none of them.

## One place, reached four ways

| Arrival | What the operator did |
|---|---|
| `start` | Opened the app, or imported a model and started nothing. The old "setup". |
| `exit` | Exit or Escape out of a mode or a dental step. |
| `leave` | Done out of a mode that finished its own work. |
| `finishDental` | OK in dental Step 3 — **not in this build**: the flow ends at its own export instead (`FLOW_END`). |
| `activeUnitChanged` | The active object went away (deleted, undone), which ends the mode that belonged to it. |

**`finishDental` is the arrival this module exists to make sayable: there is no Step 4.** The dental
flow runs Step 0 → 1 → 2 → 3 and then stops being a flow. `rim` is a fifth stage but it is a detour
off Step 1, not a step of its own.

## The three things that make it the bench

All three were already true in the code. None was written down, and none was tested, so nothing
stopped a future mode from quietly breaking one. `benchScene.test.ts` now holds the app to each.

**Nothing is locked.** `sectionLocked(section, 'off')` is false for every section and `lockNote` is
undefined for both panels. Every other mode dims at least one region and posts a note saying why; the
bench dims none. Every control on screen works. This is most of what makes it *read* as a resting
state rather than a mode that happens to be blank — and the test also checks that each other mode
locks something, or the claim would say nothing about the bench in particular.

**The canvas is quiet.** `gesture()` is `{ kind: 'none' }`. A press orbits, a drag orbits; nothing is
painted, added, picked or drawn. No tool is in hand because no mode is.

**Every way out ends here.** There is no mode you can leave that leaves you in another mode.

## The scene, region by region

`BENCH_REGIONS` carries this as data, each entry with a `place` a designer can read — the same shape
`src/progress` uses for its three types, and for the same reason: "where does this go" should be
answerable without running the app.

| Region | Holds |
|---|---|
| Header | Wordmark, language, Undo / Redo, model view toggles. The header every state has. |
| Left panel | Import, objects, Transform, the supports actions (Regenerate is the one primary), the mode buttons, Check. |
| Viewport | The plate and the models. The **active object name** sits top left, where a mode puts its step badge. |
| Right panel | Support settings for the active object, and Export STL. |
| Footer | Object count, triangles, contact counts, status line. |

There is no overlay, badge, veil or bar that belongs to the bench alone. That is the whole scene.

## The modules

| Module | Purpose |
|---|---|
| `benchScene.ts` | The name, `onBench`, the arrivals, the regions, and the three properties. Pure — no React, no DOM. |
| `benchScene.test.ts` | The three properties as tests, plus every arrival landing where it claims to. |

## Known gap, not fixed here

**The bench announces nothing.** Step 0 through Step 3 each name themselves in a badge; arrive at the
bench off the end of Step 3 and the badge is simply replaced by the object's filename. Whether that
reads as finishing or as falling off the end is a judgement about the screen, not about this module,
so it was recorded here and left for the UI review. It bites less now that the flow ends at its own
export and no longer arrives here off the end of a step, and it returns in full if `FLOW_END` goes
back to `'bench'`. The fix, if it is wanted, is a line in the badge area, not a fourth step.

## Using the name

`onBench(state)` is the positive form of `state.mode === 'off'`. Prefer it wherever the code means
"resting on the bench" rather than "guarding against being in a mode"; an inverted guard
(`mode !== 'off'`) reads better as it stands and was deliberately left alone.
