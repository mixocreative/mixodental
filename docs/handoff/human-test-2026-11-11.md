# Human test, 2026-11-11 — what a machine could not check

Written the night before, after the icon and style-book session. Everything below is here for one
reason: **a test already covers it, or it needs eyes.** Nothing is listed twice.

The app is deployed at <https://mixocreative.github.io/mixodental/> (commit `50e25f8`). Give it a
moment on first load — the bundle is 1.8 MB and the page is blank while it parses.

---

## Already proved by machine — do not spend time here

| Checked | How |
| --- | --- |
| Every icon file is on its grid, has an artboard, no fixed size | `src/ui/art.test.ts`, `src/ui/icons.test.ts` |
| The coloured art has one near-black, at most five colours, no hole inside the outline | `src/ui/art.test.ts` |
| Every icon in the folder has a catalogue entry, and the reverse | `src/ui/iconCatalogue.test.ts` |
| The style book draws one card per icon, with the path of the right folder | `src/kit/Catalogue.test.tsx` |
| Every `var(--x)` the CSS reads is declared somewhere | `src/ui/cssTokens.test.ts` |
| The rim cursor is a real data URI with the hot spot at its centre | `src/components/viewport/cursorStyle.test.ts` |
| The whole flow, end to end, in a browser | `npm run walk` — passed on CI at the deployed commit |

Each of those was proved by breaking a file on purpose and watching the test fail. They are not
decoration.

---

## 1. Do the icons read? (the only question that matters here)

A test can check that an icon is on its grid. It cannot check that it looks like a denture.

- **Start screen, three keys.** Cover the words. Can you name each one? The model and the block are
  easy; **aligner against denture is the pair to watch** — they were the two closest at every earlier
  attempt.
- **In the style book, the five item drawings together.** Three of them are now pale shells — aligner,
  retainer, night guard — and that is the cluster to judge. The retainer's wire does survive the grid
  (a dark line across the opening). **Aligner against night guard is the close one:** the difference is
  "segmented" against "thick and unbroken", and at 144px that is subtle. If it does not read, the
  night guard needs a feature drawn harder, not a better trace.
- **The same three on a pressed key.** Click one and look before the screen changes. They are coloured
  art, so they do NOT invert — only the one-ink glyphs do. Decide whether that is right.
- **The deck rail**, with a model loaded. Four buttons in a row: can you tell them apart at a glance?
  That matters more than any one being a good picture.
- **Rim against Area, side by side.** Area is deliberately the Rim arch given a width, because the
  step's own control is "Area width". Does that relationship read, or does it just look like two
  similar arches?

## 2. The rim-mode cursor — never seen by a human

`cursor-rim.svg` is wired into rim define mode (`src/components/viewport/style.ts`). The browser
decodes it and the string is tested, but **nobody has yet looked at it over the model.**

- Enter rim define mode and move over the model. The cursor should be a crosshair with a small open
  square at its centre, and the square's centre is where the point lands.
- Is it too heavy over the artwork? A cursor sits on top of the operator's own work.
- Off the model it should still be the `grab` hand, because a drag there orbits.

## 3. The rim flow — fixed earlier in the session, not hand-tested since

These were found and fixed by machine. They want a human once.

- Draw a rim by hand on a model the detector fails on, then **press Done, then go back and edit it**.
  The edit used to be refused.
- **Redraw a rim you have already confirmed**, then press Next. The redraw used to be discarded.
- **Paint an area, leave the step, come back.** The paint used to be lost on re-accept.
- Drag a point along the drawn line. Every point on the visible line should be grabbable — the line
  the app draws and the line it measures a press against are now the same curve.

## 4. The style book — is it usable by someone who is not you?

Live: `npm run dev`, then <http://localhost:5173/mixodental/kit.html>.
Static, no Node needed: `npm run screens`, then open `.stitch/screens/index.html`.

- Pick an icon you want changed. **Does the page tell you which file to edit, without asking anyone?**
  That is the whole point of it.
- Is the front page's grouping the way you would group it?
- The icon cards show each glyph resting and pressed. Is that the comparison you want, or would
  something else be more useful?

---

## Known, and deliberately not fixed

- **`dental-model` is drawn but not wired.** No screen offers that choice. The art exists so that when
  a Dental Model item kind appears it does not need drawing; until then the style book marks it unused.
  **This is a product decision, not a drawing one.**
- **Three more types are drawn and WAITING ON THE ENGINE** — dental model, retainer, night guard. The
  art is in `src/ui/assets/art/` and marked unused in the style book. `DentalKind` is `'aligner' |
  'denture'` in the vendored engine and the profiles are generated from Rust JSON that is not in this
  repo, so no item type can be added from here at all. `docs/handoff/geocore-item-kinds.md` says what
  each of the three needs, and they are not the same size: two are probably one profile file each, the
  dental model is a new kind with its own pipeline.
- **The six other item kinds are not drawn** — surgical guide, crown & bridge, abutment, wax-up,
  gingiva mask, bracket tray, impression tray. They are all on the reference sheet
  and each is one `scripts/trace-art.py` command. They are deliberately left: the folder's own rule is
  that an icon for a kind the pipeline cannot build is a promise the app does not keep.
- **`g-pre` fails on the local walk** and passes on CI. It is the harness being unable to slow this
  machine enough for a brush queue to form, not a defect — the same run reports the app selecting 56
  supports with the throttle off. CI's slower runners meet the precondition.

## If something looks wrong

The style book is the fastest way to tell a drawing problem from a wiring problem: if an icon looks
right there and wrong in the app, it is wiring; if it looks wrong in both, it is the drawing, and the
file to replace is named on its card.
