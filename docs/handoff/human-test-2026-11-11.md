# Human test, 2026-11-11 — what a machine could not check

Written the night before, after the icon and style-book session. Everything below is here for one
reason: **a test already covers it, or it needs eyes.** Nothing is listed twice.

The app is deployed at <https://mixocreative.github.io/mixodental/>. Give it a moment on first load —
the bundle is 1.9 MB and the page is blank while it parses.

> **The commit was `50e25f8` when this was written, and that line went stale twice without anyone
> noticing — which is the trap worth naming at the top of a review list, because a review of the
> wrong build is worse than no review.** The live site is now **`a5c9f1d`**, published by CI run
> `43603544738` on 2026-11-14, and verified by content rather than by a green job: CI built
> `assets/index-s1NJwrCR.js` and `assets/index-DooE4DA2.css`, and those are the two files the live
> page asks for. **Check it before you review** — `curl -s https://mixocreative.github.io/mixodental/
> | grep -o 'assets/index-[^"]*'` against the hashes your own `npm run build` prints. The alternative
> is `npm run dev` and <http://localhost:5173/mixodental/>, which is always the code in front of you.

---

## A second pair of eyes went first, 2026-11-17 — `npm run look`

**`npm run look` makes the three pictures this list asks a person to look at**, into `.stitch/look/`
(ignored, like the style book — re-run it, never edit what it writes):

| | what it shows | the question it is for |
|---|---|---|
| `keys-unlabelled.png` | the three start-screen keys with their WORDS COVERED | §1, "name each" |
| `art-set.png` | every item drawing at the size a key draws it | §1, "five pictures, one style?" |
| `rim-cursor.png` | the rim cursor over a model at 24 px and at 6× | §2, "is it too heavy?" |

The cursor one exists because **a CSS cursor never appears in a screenshot** — which is why nobody
had seen it. It is composited from the same `cursor-rim.svg` the app loads, at the same 24 px, with
its hot spot where it claims to be.

**What this pair of eyes found. None of it replaces yours; all of it narrows where yours are
needed.**

- **§1, the keys.** Words covered, all three named without hesitation: a pale blue segmented
  horseshoe shell (aligner), pink gums with white teeth in two arches (denture), a plain grey block
  (any model). **The pair this list said to watch — aligner against denture — is not close any more:
  they differ in colour, in form and in whether they read as transparent.**
- **§1, the set.** Six drawings, and five of them are one style — heavy black keyline, three-quarter
  view, pixel shading, muted palette. `generic` sits apart, which looks deliberate: it is the one
  that must NOT read as a dental object. **The pair at risk is not the one on the list: `aligner`,
  `retainer` and `night-guard` are three pale-blue horseshoes, and at 144 px the wire that tells a
  retainer from an aligner is subtle.** Neither of those two is wired to a screen yet, so it costs
  nothing today and will cost something the day one is.
- **§2, the cursor. It is not heavy — it is lighter than everything it sits among**, four short
  strokes and a hollow square against anchor dots several times its size. **And looking at it found
  something else, which is the whole argument for making a thing lookable.**

  I first read the picture as "the cursor's ink and the drawn rim line's ink are the same dark
  navy". **That was wrong — the rim line is RED.** What shared the cursor's navy was a ring that had
  no business being there: `EditPreview`, Support Edit Mode's furniture — a ring the size of the
  erase reach and a teal cone where a support would be ADDED — was drawn in rim define mode, a mode
  whose only gesture is placing anchors. A dead affordance under the pointer, offering a gesture the
  mode does not have.

  The Babylon port never drew it (its preview is gated on `gesture.kind === 'add'`), so this was the
  older renderer catching up to the newer one. Fixed; re-run `npm run look` and rim mode now shows
  what it owns — anchors, the line between them, and the cursor.
- **§4, the style book. It passes, and I am the stranger it is written for.** Picking an icon to
  change, the card names `src/ui/assets/art/aligner.svg` and then goes further than the test asked:
  it says *how* the file was made ("traced from the reference by `scripts/trace-art.py` — re-run it,
  or replace the file"), which is the difference between editing a file and editing a file a
  generator will overwrite. The front page pre-empts the stranger's likeliest mistake too: "Edit the
  file this page names, not this page."
- **§5, the placeholder wording.** Still yours. Read as a stranger they already do the job the
  audits asked of them: the two print-angle notices DO say different things ("No print angle passed
  the check" is about this model; "The print-angle check could not finish" is about the run), and
  the stopped screen's crash sentence leads with what the operator can still save. **What is left
  is voice, not clarity** — so the drafts below are a menu, not a recommendation, and nothing here
  is in the code.

### Drafts for §5, so it is a pick rather than a blank page (2026-11-17)

**None of these shipped.** Each line is the current placeholder, then two alternates that say the
same fact in a different register. The register is the choice: A keeps the app's habit of leading
with what the operator can DO; B leads with what happened. Pick one, edit it, or keep what is there
— all three are already true.

**`AppBoundary.tsx` — the stopped screen.**

| | now | A — act first | B — state first |
|---|---|---|---|
| `crash` title | The workspace stopped | Your models are still here | The workspace stopped |
| `crash` sentence | Your models are still in this page. Save them before reloading - a reload does not keep them. | Save them now — reloading this page will not keep them. | The workspace stopped, but nothing is lost yet: your models are still in this page, and a reload will not keep them. |
| `engine` title | The 3D engine did not load | The 3D engine did not load | The 3D engine did not load |
| `engine` sentence | Reload the page to try again. If it keeps happening, your browser may be blocking WebAssembly. | Reload to try again. If it keeps happening, your browser is probably blocking WebAssembly. | The 3D engine could not start. Reloading usually fixes it; if it does not, your browser may be blocking WebAssembly. |
| `no-webgl2` title | mixoDental cannot start on this device | mixoDental cannot start on this device | This device cannot run mixoDental |
| `no-webgl2` sentence | This browser could not start WebGL2 3D graphics, which mixoDental needs to show and prepare models. Try Chrome or Edge on a desktop computer. | Open mixoDental in Chrome or Edge on a desktop computer: this browser cannot start the 3D graphics it needs. | This browser could not start WebGL2, the 3D graphics mixoDental needs to show and prepare models. A desktop Chrome or Edge will. |

**`DentalSteps.tsx` — the two print-angle outcomes (MIXO-02).** The distinction the audit asked for
is THIS MODEL against THE RUN, and all three columns keep it.

| | now | A — act first | B — state first |
|---|---|---|---|
| `angle-none-held` | No print angle passed the check. Supports on this model need a close look before you export. | Look at the supports before exporting: no print angle passed the check on this model. | No print angle passed the check for this model. Its supports need a close look before you export. |
| `angle-check-failed` | The print-angle check could not finish, so this angle is unproven. Check the supports before you export. | Check the supports before exporting: the angle check did not finish, so this angle is unproven. | The print-angle check did not finish. This angle is unproven, not rejected — check the supports before you export. |

**MIXO-06 — the files a start screen counted, dropped by Open a saved project.** The CODE is done
(`App.tsx`, `StartScreen.tsx`: both now honour the held batch, and this notice is for the one case
that cannot survive). Only the sentence is open.

| now | A — act first | B — state first |
|---|---|---|
| {n} dropped files were not imported: opening a project replaces everything on the plate. | Drop them again after the project opens: opening one replaces everything on the plate, so {n} files were not imported. | Opening a project replaces everything on the plate, so {n} dropped files were not imported. |

**The one thing a stranger would change regardless of register:** the crash sentence is the only
place in the set where the operator can lose something, and it currently says what happened before
it says what to do. Both alternates lead with the save. That is the line to decide first.

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

**All four are now answered by machine, 2026-11-17.** Three are driven by `npm run walk` on BOTH
renderers (`u5c`..`u5k3`, `npm run walk -- --renderer=babylon`): drawing a rim where detection
fails, Done then editing it, redrawing a confirmed rim, and dragging a point along the line all
pass, 186 checks, zero failures. The fourth — the painted area surviving the step — was driven
directly and also passes. **What is left for a person on this section is the FEEL, not the fact.**

One real fault turned up beside the fourth while proving it, and it is written out under that
bullet: a TUNING change does not survive leaving and returning to Step 2.

- Draw a rim by hand on a model the detector fails on, then **press Done, then go back and edit it**.
  The edit used to be refused.
- **Redraw a rim you have already confirmed**, then press Next. The redraw used to be discarded.
- **Paint an area, leave the step, come back.** The paint used to be lost on re-accept.
  **ANSWERED BY MACHINE, 2026-11-17, and it needs no human after all: the paint survives.** Driven
  on `dentalwork/fixtures/case-001/aligner.stl` with nothing else touched — paint one stroke, press
  Back, press Next:

  | | before | after Back + Next |
  |---|---|---|
  | tips shown | 104 | **104** |
  | area stamps | 31 | 31 |
  | detected region (contact faces) | 14,110 | 14,110 |

  **But the same drive found a different fault beside it, and this one is real.** Change a TUNING
  slider (Area width, two presses) and then leave and come back:

  | | before | after tuning | after Back + Next |
  |---|---|---|---|
  | tips shown | 104 | 104 | **0** |
  | area stamps | 31 | 31 | 31 |
  | detected region (contact faces) | 14,110 | 14,946 | **14,110** |

  **FIXED, 2026-11-17.** The line was `src/components/useDentalFlow.ts`, where a re-accepted
  orientation rebuilt the policy with the freshly DETECTED `region` and the operator's KEPT
  `tuning`. Those two only mean anything together — a tuning number is not a setting read later, it
  is the shape of the strip that was drawn for it — so the policy disagreed with itself and a
  placement on it put a tip nowhere. The preview was never missing or failing: `previewStatus` read
  `ready` and `tuningError` was false throughout. It ran and placed nothing.

  `keptDentalWork` brings the REGION back with the tuning now, and the accept path takes it when the
  orientation did not move. It takes the fresh detection when the tilt confirm turned the aligner,
  because a turn really does invalidate the area it was detected for — and the tilt CHECK still runs
  against the detected region, so the checker is never handed an area from before a turn.

  Measured on case-001, the same drive that found it:

  | | before | after tuning | after Back + Next |
  |---|---|---|---|
  | tips shown | 104 | 104 | **104** (was 0) |
  | area stamps | 31 | 31 | 31 |
  | detected region (contact faces) | 14,110 | 14,946 | **14,946** (was 14,110) |

  It was a fault on the shipping three.js renderer, nothing to do with the Babylon work, and both
  walks are green after it: ALL PASS 186 and ALL PASS 186 [renderer: babylon].

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
