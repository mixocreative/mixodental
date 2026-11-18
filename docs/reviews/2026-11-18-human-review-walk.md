# Human review walk - the deck's auto-gen, 2026-11-18

Ten minutes, in order. Each step says what to press and **what you should see**, so a difference is
a finding rather than a question. The dev server is on **5280** (`http://127.0.0.1:5280/mixodental/`
- check the browser tab says *mixoDental*, because 5173 is mixomesh).

Everything here was built tonight as increments B to H of
[the card deck plan](../design/2026-11-18-card-deck-plan.md), whose "What was built" section is the
long version. **The app is English only for now** - see "The one thing that is not done" at the end.

---

## 1. The card, before anything is named

Drop `docs/dental-reference/reference-aligner.stl` on the Drop page.

- One card, with a **3D render** of the model, its size and file size.
- Keys: **Enlarge** and **Remove**, and nothing else.
- No chip, no "Open": nothing has been named yet, so nothing has been checked yet.

> *Why no Open:* the flow is job-specific, so opening a model nobody has named would have to invent
> which chain to walk.

## 2. Naming it starts the work

Choose **Aligner** on the card.

- The chip reads **Checking…**, then **Ready** after twenty or thirty seconds.
- Hover the chip: *"Turned upright."*
- An **Auto-gen** key appears, in the accent colour.

> **Ready now means ready.** Until tonight a row read Ready whenever the detector did not crash -
> and a model whose pose the engine **could not decide** was reported as *"Already upright."* Four
> doubts were being dropped. If you ever see **Check orientation** or **Check mesh** instead, that
> is one of them, and the hover says which.

## 3. Auto-gen

Press **Auto-gen**.

- The card's picture shows **Generating supports…**
- The **Auto-gen key disappears** while it runs (a control that cannot act must not look as if it can).
- After about forty seconds: **"94 supports placed"** on the card, and the footer reads
  *94 automatic, 0 manual, 0 removed*.
- The Open key has become **Edit supports**.

## 4. It opens at Step 3, not Step 1

Press **Edit supports**.

- The badge reads **Step 3 · Supports**, with the 94 supports on screen.
- Support Edit Mode works on them exactly as it does on a model you walked by hand.

> **This is the ruling that matters most.** Step 1 is the orient step, and re-orienting now deletes
> supports - so opening a generated card the ordinary way would destroy the work you pressed Open to
> look at.

## 5. Re-orienting warns first

Still in Step 3, press **Back**.

- A dialog: *"Going back re-orients this model, which removes its supports and any manual edits.
  Undo brings them back. Continue?"*
- **Stay** keeps everything.

> It used to ask only when you had hand edits, so an operator with a freshly built aligner and no
> edits was asked nothing and lost the build. A vertical spin on the plate still keeps the supports -
> that exception is proved on a real denture scan and the reducer honours it.

## 6. The case row, and the budget

Back on the deck (**Your files**), look at the footer.

- **Auto-gen 1 card** beside Arrange and Export. Press it and it becomes **Stop**; press Stop and it
  goes back.
- **1 of 200 models** and **324 MB of 2.0 GB memory**.

> **Known, and your call:** pressing Stop on a card that already had supports leaves it with none -
> the run's first step re-oriented it, which cleared them, and the cancelled run never replaced them.
> **Undo brings them back.** Saying so on the card needs a new string, which needs translation.

## 7. Enlarge

Press **Enlarge** on the card.

- The model alone, large, on a dimmed page. Drag it to turn it; arrow keys turn it too.
- **Close**, click away, or Escape.
- There is nothing else to press, deliberately: a look, never an editor.

## 8. Support recipes — the new one

Still on the deck, each card has a small **recipe chip** beside its type. It starts at **Type
default**, which is what auto-gen has always used.

Open a card at Step 3 and expand **Adjust**. Under the sliders there is a **Support recipe** row:

- Move **Pillar size**, type a name, press **Save as new**. The chip on the card takes that name.
- The list is kept **on this device** — reload the page and it is still there.
- Choose a different recipe in that row and **the sliders move at once**: picking **Type default**
  puts the type's own numbers back. (Measured: 2.4 mm back to 1.4 mm.)
- **Update recipe** / **Delete recipe** / **Use as default** do what they say. Type default cannot be
  changed or removed.

Back on the deck, switch a card's chip to your recipe and press **Auto-gen**: the supports are built
with it, and afterwards the chip is a **readout** naming the recipe that run actually used — not
whatever the default happens to be later.

> **If a card's settings drift from the recipe it names, the chip says "…, edited".** That matters
> because auto-gen uses the *recipe*, not your changes — so either Update the recipe or save a new
> one.

## 9. The one number that proves the whole thing

The gate now walks the same reference aligner **twice**: once through these step screens by hand,
once through the deck's Auto-gen. It then compares what they built.

```
x0p the step screens and auto-gen build the SAME supports for the same model | by hand 94, auto-gen 94
```

That is the claim auto-gen rests on — that it is not quietly making different supports from the
editor — and it is now checked on every full walk rather than argued for.

---

## What else changed that you will not see

- **The export** builds and hands over **one file at a time** instead of building the whole case
  first. On a thirty-model case that was of the order of a gigabyte held at once, at the very end of
  the work. A refusal part way through now reports a partial export rather than throwing away the
  files that were good.
- **The orientation check has a two-minute deadline** instead of the pool's ten, and a job that runs
  out of time now says it timed out. One stalled model used to hold every row behind it for ten
  minutes.

## The one thing that is not done

**The new strings have no Japanese or Taiwan Chinese.** Your rule is that zh-Hant comes from Gemini
and is never hand-written - and Gemini's free-tier **daily** quota ran out mid-session
(`RESOURCE_EXHAUSTED`, "retry in 17h20m"), on both models. So two tests are red:
`src/i18n.test.ts` and `src/items/detectState.test.ts`, which demand an entry in both languages for
every UI string. Nothing was hand-translated.

The prompt is written and the handoff memory has the four steps. Everything else is green:

```
npm run walk        ALL PASS (190 checks, 1810 s)
npx vitest run src  1675 passed, 2 failed (the two above)
npx tsc --noEmit    clean
```
