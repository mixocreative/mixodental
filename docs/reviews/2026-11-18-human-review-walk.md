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

## 5. Back costs what it actually costs, and says so

Still in Step 3, press **Back**.

- **Nothing is asked**, you land on **Step 2**, and the 94 supports are still there.
- Now add a support by hand (Add supports, click the model), press **Back** again: *"Going back
  discards your manual support edits (1 added, 0 removed, 0 with own settings). Continue?"*
- **Stay** keeps everything.

> I had this wrong and built on it. An aligner's Back goes to **Step 2**, not Step 1 — the repo's
> own `dentureStages.test.ts` says so in one line — so nothing re-orients and the supports are not
> at stake. The dialog used to claim otherwise and `backCommands` deleted them for nothing. A
> denture's Back *does* reach the orient step, and there the build does go.
>
> What protects the supports everywhere is the reducer: whenever a re-orient actually happens,
> through any door, they go with it. A vertical spin on the plate is the one exception, proved on a
> real denture scan to 1e-5 mm.

## 6. The case row, and the budget

Back on the deck (**Your files**), look at the footer.

- **1 of 200 models** and **324 MB of 2.0 GB memory**. Both readouts turn amber when passed — the
  model cap is **not enforced** by anything, so the least it owes you is to look different.
- **Auto-gen N cards** appears only while some card is still eligible. The one you just generated is
  not: a built card has no Auto-gen key, because a second run would re-orient it and destroy the
  supports and any hand edits with nothing asked.

To see it, **drop a second copy of the file and name it**. Then:

- **Auto-gen 2 cards**… (or 1) beside Arrange and Export. Press it and it becomes **Stop**; press
  Stop and it goes back.
- If the case ever goes over its memory allowance, every Auto-gen key disappears — correctly, because
  generating more is how the tab dies — and the footer now says so in words instead of just turning
  a number red.

## 7. Enlarge

Press **Enlarge** on the card.

- The model alone, large, on a dimmed page. Drag it to turn it; arrow keys turn it too.
- **Edit supports** (or **Open this model** on a card with none) takes you straight into the flow —
  that was your first request, and it is the card's own Open handler, so it lands in the same place.
- **Close**, click away, or Escape.
- Nothing else: a look and a way on, never an editor.

## 8. Support recipes — the new one

Still on the deck, each card has a small **recipe chip** beside its type. It starts at **Type
default**, which is what auto-gen has always used.

Open a card at Step 3 and expand **Adjust**. Under the sliders there is a **Support recipe** row:

- Move **Pillar size**, type a name, press **Save as new**. The chip on the card takes that name.
- Choose a different recipe in that row and **the sliders move at once**: picking **Type default**
  puts the type's own numbers back. (Measured: 2.4 mm back to 1.4 mm.)
- **Update recipe** / **Delete recipe** / **Use as default** do what they say. Type default cannot be
  changed or removed.

Back on the deck, take the **second card** you dropped in §6, switch its chip to your recipe and
press **Auto-gen**: the supports are built with it, and afterwards that chip is a **readout** naming
the recipe the run actually used — not whatever the default happens to be later. A card that has
already run has no select, because switching it could not change anything.

**Then reload the page.** The recipe list is still there — that is the "remembered across sessions"
half. The deck is not: dropped files do not survive a reload (deck persistence is scoped in the card
deck plan and not built), so do this last.

> **If a card's settings drift from the recipe it names, the chip says "…, edited".** That matters
> because auto-gen uses the *recipe*, not your changes — so either Update the recipe or save a new
> one.

## 9. The one number that proves the whole thing

The gate now walks the same reference aligner **twice**: once through these step screens by hand,
once through the deck's Auto-gen. It then compares what they built.

```
x0p the step screens and auto-gen build the SAME supports for the same model
    by hand {"auto":94,"manual":0,"removed":0}, auto-gen {"auto":94,"manual":0,"removed":0}
```

That is the claim auto-gen rests on — that it is not quietly making different supports from the
editor — and it is now checked on every full walk rather than argued for.

**What it compares is the three counts, not the positions**, because the deck reports counts and
nothing on screen exposes a tip's coordinates. The position-level agreement is proved separately
and under Node, on a real customer scan: running the same model twice gives byte-identical contact
positions, and every settings key the print-angle confirm was judged with equals what the finished
unit carries.

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
and is never hand-written - and Gemini's free tier is **20 requests a day**, which ran out. It next
resets **around 16:00 on 2026-11-19**. The prompt is written and committed at
`docs/translation/2026-11-19-missing-strings.txt`; one request finishes it. So two tests are red:
`src/i18n.test.ts` and `src/items/detectState.test.ts`, which demand an entry in both languages for
every UI string. Nothing was hand-translated.

The prompt is written and the handoff memory has the four steps. Everything else is green:

```
npm run walk        ALL PASS (191 checks)
npx vitest run src  1740 passed, 2 failed (the two above)
npx tsc --noEmit    clean
```
