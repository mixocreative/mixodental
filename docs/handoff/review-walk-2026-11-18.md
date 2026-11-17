# Human review walk — 2026-11-18

Everything below is on the branch `feat/babylon-viewport`, pushed. Review server:

**http://127.0.0.1:5280/mixodental/** — check the tab says **mixoDental**, not mixoMesh. mixoMesh
holds port 5173 and a `200` proves nothing, so go by the title.

If the server is not up: `npm run dev -- --port 5280 --strictPort --host 127.0.0.1`.

Walk the five sections in order; each says what to do, what you should see, and what is knowingly
still wrong. **Known-wrong is listed on purpose** — please don't spend time re-finding it.

---

## 1. The badge, and the cursors (fixed)

**Do:** drop one STL on the first screen. You land in rim define mode.

**Look for:**
- The **step name reads before the filename**. It was the other way round — a `:first-child` rule
  was landing on the wrong element.
- Both blocks are the **same width** (one 420px cap) and flush on all three edges.
- **Move the pointer over the model.** The rim crosshair appears. It never did before, in either
  renderer: the viewport asked "is a brush armed" where it meant "is the pointer on the model", so
  Step 2's Add and Support Edit's Add were dark too.
- The badge **says what is in the way** — "Place at least three points, then close the loop." That
  sentence was being computed all along and hidden on a disabled button's hover tip.

## 2. The way out of the flow (changed, and this is the one to argue with)

**Do:** look at the header while in a step.

**Look for:**
- **"Use as any model"** where *Exit* used to be. The word Exit promised navigation; the press
  removes the model's supports, hand edits and dental settings. The capability is right and stays —
  it is the only route from a dental-started model to free work on the bench — only the name was
  wrong. It binds to *Any model*, the first screen's third purpose, so the app has one name for the
  idea.
- **Press it on a model with supports built.** It asks first, naming what goes. On a fresh model at
  Step 1 it does not ask, because the cost is a redetect and a prompt there teaches you to dismiss
  prompts unread.
- **Press Escape** in a step. It goes **back one level** — out of rim mode keeping the drawing, out
  of a step to the one before, out of Step 1 to the case. Its last rung used to be the destructive
  command, so the last Escape of a sequence destroyed work.

## 3. The case screen (most of tonight's work)

**Do:** drop **three or more** STLs and press Aligner.

**Look for:**
- **Arrange** and **Each object with model** in the footer. A case can now be finished without ever
  visiting the bench — previously those lived only there, and the bench is not rendered while a
  start screen is up. Export is off, **with its reason**, until something has supports.
- **"3 need you"** in red, and **"Checking 2 of 3"** while the robot runs. Rows that only wait now
  say nothing: twenty-three lines of "Waiting its turn…" said how little was happening, not how far
  along it was.
- **Rows that need you sort to the top.** The rest keep the order you dropped them in.
- **The rail and the footer stay put** as the list scrolls.
- **Pick a finished row and press Start.** It opens *that* row. It used to open a different one
  silently, and once every row was finished the key vanished — which is the state a case ends in.
- **Press Escape.** It goes back to the drop page. On the deck it previously reached no handler at
  all: nothing focused the page on arrival.
- **Your files** in the header, from anywhere. It was gated to Step 1 for a day as scaffolding; the
  re-entry bug under it is fixed, so the gate is off.

## 4. The art pipeline (new command)

**Do:** edit any drawing in `src/ui/assets/art/` in Illustrator, export over it, then:

```bash
npm run art
```

It flattens polygons and rotated rects onto the 48×48 grid the folder promises, and **refuses to
write unless the result paints exactly the same cells**. `npm run art -- --check` says what would
change without writing. Edit however you like; run this after.

## 5. What is knowingly still wrong

Please don't re-find these — they are written up in `docs/design/2026-11-17-flow-map.md`.

| | |
|---|---|
| **A night guard and a retainer are neither Aligner nor Denture** | The commonest chairside object has no true answer to the purpose question. Open question 4, and it blocks the entry rebuild. The code may be branching on the wrong axis — shell-with-a-trim-line vs solid body, not product. |
| **The first screen still asks before you drop** | "What are you making?" before a file exists. The fix is planned (files first, question after, one question per drop) but **not built**: question 4 must settle first, or it builds the wrong question. |
| **A denture row is told to draw a rim** | The case runs the *aligner's* detection whatever the purpose, and a denture's rail has no Rim button. This is step 1 of the work. |
| **Only orientation runs unattended** | The "robot" is one stage, not five. Rim, Area, Supports and Check have never run in a batch — that is auto-accept, which is step 3. |
| **Export is ~48 `<a download>` calls** | Browsers throttle those and block quietly. `showDirectoryPicker()` once per case, or one zip, fixes it. Not in the plan yet; it is the primary user's last five minutes. |
| **Upper and lower doubles everything** | A case is 20–60 files, not 24. The plan reasons about 24 throughout. Open question 5. |

---

## The state of the gate

- **Suite:** 1730 passing, 1 skipped.
- **Walk:** 189 checks, ALL PASS, on the push before this one; re-running on the last two fixes.
- `npx tsc --noEmit` clean.

## If you want the reasoning

- `docs/design/2026-11-17-flow-map.md` — the whole flow, end to end. §9 holds your rulings; §10
  separates decided from open; §11 records why it took ten revisions, so the failure mode does not
  repeat.
- `src/deck/README.md` — the case screen's rules and the three doors to it.
- `src/scenes/README.md` — the scenes, and why *Use as any model* is not navigation.
