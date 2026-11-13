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
- **In the style book, the five item drawings together.** The retainer and the night guard are now YOUR
  Illustrator drawings, not traces, and both read as their own objects - the night guard is smooth where
  the aligner is segmented, and the retainer's wire shows. Judge the set as a set: five pictures, one
  style? That is the question a test cannot ask.

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
- ~~**`g-pre` fails on the local walk** and passes on CI. It is the harness being unable to slow
  this machine enough for a brush queue to form.~~ **That explanation was wrong, and `g-pre` is now
  FIXED (2026-11-13, `58ee6ca`).** It was never about machine speed: `g` swept a hard-coded line
  that section `c` had emptied of supports, in the Bottom view section `f` switches to, so the
  stroke selected 0 of 423 while the tool sat armed and engaged. `g` now finds a line that actually
  crosses supports, the way `a5` already did in that same view. The local walk is ALL PASS, 188/188.

  **CORRECTED AGAIN, 2026-11-14: that fix was real but only half the story, and `g` is now RETIRED.**
  Finding the line fixed the stroke -- it lands on supports, 53-56 of them, the same as `a5` on the
  same screen -- but it did not make a mid-queue state reachable. Three identical isolated runs at
  one rate on one idle machine gave three different answers: pending 55 against an unthrottled 55
  (the stroke had already finished, so the earlier 188/188 above included a VACUOUS pass), pending
  251 where that line reaches about 56, and pending 0 with the stroke selecting nothing. At 2x no
  queue formed at all. An instrumented run cleared the harness of distorting input -- the page
  received 33 moves on a dead-straight line, bbox [530,546,896,546] -- so there is simply no
  reliable mid-queue moment to catch from outside the app. The rule is now tested where it can be
  tested deterministically: mixo-geocore `editing/strokeQueue.test.ts`, eight cases, no browser,
  3 ms. The walk is ALL PASS at **186** checks, and `EXPECTED_CHECKS` carries the reason.

## If something looks wrong

The style book is the fastest way to tell a drawing problem from a wiring problem: if an icon looks
right there and wrong in the app, it is wiring; if it looks wrong in both, it is the drawing, and the
file to replace is named on its card.
