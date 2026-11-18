# Human review walk — 2026-11-18

Everything below is on the branch `feat/babylon-viewport`, pushed. Review server:

**http://127.0.0.1:5280/mixodental/** — check the tab says **mixoDental**, not mixoMesh. mixoMesh
holds port 5173 and a `200` proves nothing, so go by the title.

If the server is not up: `npm run dev -- --port 5280 --strictPort --host 127.0.0.1`.

Walk the five sections in order; each says what to do, what you should see, and what is knowingly
still wrong. **Known-wrong is listed on purpose** — please don't spend time re-finding it.

---

## 0. The entry and the deck, rebuilt on your rulings (new — start here)

**Do:** look at the first screen, then drop **one** STL on it.

**Look for:**
- **A drop target, drawn.** The page is named `drop` and never used the word: the whole section was
  the target, announced by a 1px outline that only appears once you are already dragging.
- **"Or tell us what you are making"** under it, then the three keys. Two ways in, not two flows —
  answering first only **preselects** the category of the files you then pick.
- **One file lands on the DECK.** It used to skip the question entirely and assume *Aligner*, so a
  dropped denture went into the aligner flow and was told to draw a rim. One fork, four defects.
- **Nothing is offered before you name it** — no rail, no Start. The detector takes the category as
  an argument, so anything offered earlier would run on a guess. **Arrange is not gated**: moving
  objects so none overlaps is pure geometry.

**Do:** drop **eight** STLs.

**Look for:**
- **Rows at once, no question in the way.** The category is on each ROW, because a category and a
  type belong to a model and one drop can hold several kinds. **`Set all to`** at the end of the
  header is the one press that names a whole stage case; the footer counts what is still unnamed.
- **One line per file, about 28px.** It was a three-line grid measuring **109px** — 2,600px of
  scrolling for a stage case. A sound mesh now says nothing at all; the tally counts the ones that
  are not. Health is a warning mark, the orientation result a two-word chip — **hover either for the
  full sentence**, which is also what the rail states for the row you are on.
- **Back is in the deck's own header**, beside the heading. It was `position: absolute` to the
  window — written for the start screens, which have nothing above them — so it sat on the logo.
- **The page is 1100px wide**, not 560. A worklist is a table.
- **Remove is quiet until you reach for it.** Twenty-four red blocks were the loudest thing on a
  screen whose job is to show which rows need a person.
- **No type dropdown appears.** Each family ships exactly one profile, so it would be a question with
  a single answer — the reason the old Type screen was deleted. It appears by itself when a second
  profile file lands.

## 1. The badge, and the cursors (fixed)

**Do:** drop one STL on the first screen, then answer *Aligner* on the deck and press Start.

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

**Do:** drop **three or more** STLs, then press `Set all to` → Aligner.

**Look for:**
- **Arrange** and **Each object with model** in the footer. A case can now be finished without ever
  visiting the bench — previously those lived only there, and the bench is not rendered while a
  start screen is up. Export is off, **with its reason**, until something has supports.
- **"3 need you"** in red, and **"Checking 2 of 3"** while the robot runs. Rows that only wait say
  nothing: twenty-three lines of "Waiting its turn…" said how little was happening, not how far along
  it was. **Before a row is named it says nothing about detection at all** — it used to claim to be
  "waiting its turn" in a queue that cannot exist until the category is chosen.
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
| **A night guard and a retainer are neither Aligner nor Denture** | Open question 4 — and **it is not a design question for you, it is an engine work item.** The art is already drawn and waiting: `src/ui/iconCatalogue.ts` carries `retainer` and `night-guard`, marked `unwired`, with the note that `DentalKind` is `'aligner' \| 'denture'` in the vendored engine and the profiles come from Rust JSON that is not in this repo. `docs/handoff/geocore-item-kinds.md` says what each needs. The UI side is two rows in `src/components/purposes.ts`. |
| ~~The first screen still asks before you drop~~ | **Fixed 2026-11-18**, on your ruling. See section 0. |
| ~~A denture row is told to draw a rim~~ | **Fixed, and the map was wrong about it.** It claimed the case runs the *aligner's* detection whatever the purpose. Reading the code settled it: `useBatchDetect` passes each row's own queued profile to `dentalOrient`, so detection was always per-purpose. Only the SENTENCE was blind — it said "No rim found. Draw one to continue." on a denture, whose rail has no Rim button. One argument, not a new stage. |
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
