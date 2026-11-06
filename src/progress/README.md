# src/progress: the three kinds of waiting

Every bar, spinner and loading word in the app. One module, one table, one component, so that where a
piece of work announces itself is decided once rather than at each call site.

## Why it exists

One load of an aligner used to show three different progress displays, and a single piece of work
could announce itself in **four** places at once — the dock note, the box on the scene, the job label
and the worker stage. "Scanning print angles" existed as three separate strings needing six dictionary
entries between them. Nothing said which surface owned which kind of news, so each new job was told
wherever somebody happened to need it.

## The three types

There are three, because there are exactly three things an operator can do while waiting: **nothing**,
**watch**, or **ignore**.

| Type | Means | Where it goes on screen | Label | Cancel |
|---|---|---|---|---|
| `blocking` | You cannot act yet | **Middle of the view**, over a veil that dims everything behind | Large, uppercase, above | Never |
| `step` | Your model is being worked on | **Top left of the 3D view**, under the step badge, over the scene | Small, above | Never |
| `ledger` | These jobs exist | **Bottom left**, one row of the background-work list | Small, leading | Where the job allows |

**The rule that makes it hold: one piece of work belongs to exactly one type.** A job that blocks is
not also narrated in the ledger; a step job is not also a row. Breaking that rule is how the four-way
announcement happened in the first place.

## The two rules a type may not override

Both answer the same question — *does this job report a real fraction?*

**The number.** With a fraction, a percentage. With none, nothing. A job that is one call into the core
reports a start and an end and nothing between; a bar sitting at a number nobody measured teaches a
reader to stop believing the next one. No type may ask for a number it does not have.

**The shape.** With a fraction it is always a bar, because only a bar can show a measure. With none it
is the type's `waiting` shape — a spinner that claims nothing, or a pacing bar. So no type can draw a
bar that looks like a measure it lacks.

A third rule falls out of the second: **inline is for spinners.** A spinner is a fixed square and sits
beside a line of text; a bar has no width of its own and collapses to nothing next to one, which is
exactly what it did the first time it was drawn. A type that waits as a bar stays stacked.

## Inheritance, and what can be overridden

`PROGRESS_BASE` is what every type is before it is anything in particular — ink, a spinner when it
cannot count, label above, compact when waiting, normal size, no veil. Each type then states only what
it **changes**, so the table reads as the differences between them rather than three descriptions.
`step` changes nothing but its place, which is what makes the base a real thing rather than an average;
a test holds it to that.

- **Colour and size cascade.** `--progress-tone`, `--progress-label-size`, `--progress-track-height`
  and `--progress-spinner-size` are declared on the type class, so any ancestor can set one and the
  instances inside follow — the same bargain a theme makes with `tokens.css`.
- **Structure does not.** Label placement, the veil, and whether waiting spins or paces are different
  markup, not different values.
- **No call site overrides a type.** That is the hole this module closes, and a per-instance override
  would re-open it one call at a time. A site chooses its *type*; the type decides the rest.

## The modules

| Module | Purpose |
|---|---|
| `progressTypes.ts` | The three types, the base they inherit from, what each changes, and the rules above. Pure — no React, no DOM — so the rules can be tested without a browser and read without running the app. |
| `Progress.tsx` | One component that renders any type. It decides nothing about colour, shape, size or placement; it reads the table. |
| `progressTypes.test.ts` | The rules as tests: three types, inheritance, a percentage never invented, the shape following the measure, and the bar-beside-text refusal. |

The styling is in `src/styles.css` under *"The three kinds of waiting"*, with the designer's account —
where each goes, how to restyle one, what cascades — in `docs/ui-styling.md`.

## Seeing them

They never appear together in the running app: one blocks, one sits on the scene, one is a row in a
list. Judging them used to mean loading a model and catching each as it went past.

**`kit.html`, sections *Waiting 1 of 3 — blocking*, *2 of 3 — step*, *3 of 3 — ledger*.** Each group
names where that type goes, straight from the table, and shows it with a measure and without.

## Adding a type

Think twice: three is a claim about what an operator can do, not a convenient number, and a fourth type
needs a fourth answer to "what can they do about it". If there is one:

1. Add it to `ProgressType` and `PROGRESS_TYPES`, then give it a row in `PROGRESS_DELTA` saying only
   what it changes from the base, including a `place` a designer can read.
2. Declare its tone in `src/styles.css` on `.progress--<type>` — `progressTypes.test.ts` fails until
   the token there matches the one the table names, so the entry cannot become decoration.
3. Document it in `docs/ui-styling.md` — `uiStylingDoc.test.ts` fails on any undocumented token.
4. It appears in `kit.html` on its own, because the catalogue builds its groups from `PROGRESS_TYPES`.

## Where each type is used

| Type | Call site | What it waits on |
|---|---|---|
| `blocking` | `components/DentalSteps.tsx` | Reading and orienting a dropped file. The one word, the sentence under it, a spinner. |
| `step` | `App.tsx` ×2, `components/OrientationBar.tsx` | Detecting the support area, placing the supports an angle needs, the print-angle scan. |
| `ledger` | `components/JobActivity.tsx` | Every background job, through `ProgressIndicator` — the row keeps its own label, time and Cancel and borrows only the indicator. |

`SceneProgress.tsx` is deleted; the hand-rolled bar inside `JobActivity` is gone with it, and so is the
`.progress-track--indeterminate` rule that only it used. The denture's `StagedProgress` is not a fourth
type: it renders *inside* a ledger row and is the one piece that composed correctly all along.

## A gap that was reported and did not exist

This README briefly said the print-angle scan's `step` indicator never appeared. **It was wrong, and
the mistake is worth keeping because it is an easy one to repeat.**

Walk `u8e` watched the page with `document.querySelector('[data-ui="progress-step"]')` — the FIRST
match. Two step waits can be on screen at once: the area detector spinning while the scan counts. The
check only ever looked at one of them, found the detector, and concluded the scan was missing.

Driving the real app settled it in a minute: "Scanning print angles" runs 0% → 2% → 7% → 11% → 16%,
measured, bar filling, exactly as designed. `u8e` now reads **every** step wait and asserts the rule
in both directions — the job that cannot count shows no number and spins; the job that counts shows a
percentage and a bar.

**The lesson: a check that looks at one of a set will report the rest as missing.** When a walk check
says something is not there, confirm it is not there before writing it down as a gap.
