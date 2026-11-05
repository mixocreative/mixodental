# A verdict that is out of date, and an orientation that failed

Two things Step 1 and Step 3 got wrong, found by walk checks `x9b` and `u7`, and what this change does about
them. Both were product questions rather than broken tests, and both were answered by the owner on 2026-11-05
before any code moved.

Files this touches:

- `src/components/ReviewSummary.tsx` — the verdict line shared by the aligner's Step 3 and the denture's Step 2
- `src/components/DentalSupports.tsx` — the aligner's Step 3 panel
- `src/denture/steps/supports/DentureReviewPanel.tsx` — the denture's Step 2 panel
- `src/components/DentalReviewBlocks.tsx` — the `DentalReview` contract between the host and both panels
- `src/App.tsx` — where the verdict's state is computed
- `src/components/OrientationBar.tsx` — Step 1's keys and notices
- `src/styles.css`, `src/locales/ja.ts`, `src/locales/zh-Hant.ts`
- `scripts/walk.mjs` — the `u7` check

## 1. The verdict said nothing about being out of date

### What a reader saw

Step 3 leads with one sentence — the verdict: "Supports ready. Every point is held.", or "2 things to look
at." — with the evidence behind Details. Change a support setting and that sentence describes supports that no
longer exist, until a rebuild and a re-check replace it.

Dragging a slider dimmed the sentence while the pointer was held. Pressing an arrow key on the same slider left
no sign at all. Walk check `x9b` watched for the dimming with a mutation observer that cannot miss a
transition, and recorded none for several controls.

### Why

The panel asked for dimming correctly. `stale = adjusting || review.verdictPending`, and `verdictPending`
includes `verdictBehind`, which compares the verdict's stored object against the live one:

```ts
const verdictBehind = Boolean(activeUnit && verdictEntry
  && (verdictEntry.unit !== activeUnit || verdictEntry.mesh !== currentBuild(activeUnit, built.get(activeUnit.id))));
```

A settings change replaces the unit object, so `verdictEntry.unit !== activeUnit` the moment the setting
changes — synchronously, in the same render, for a key press exactly as for a drag. There was no gap. The
earlier reading of this bug, that `adjusting` "only fires while a slider is held", was wrong: `RangeField`
also sets it on `onChange`.

That reading is right **once a check has run**, and `x9b` runs before one ever has. `verdictEntry` is
`problems.get(activeUnit.id)` — the check's result — and at `x9b`'s point in the walk nobody has pressed Check
supports, so there is no entry. With no entry `verdictBehind` is `false` by its own first condition, and
`verdictPending` is left holding only `generating`, `regenQueued`, `dentalTuning.busy` and
`building(activeUnit)`. The verdict on screen at that moment, "Supports ready. Every point is held.", is not a
check result at all: it is what `reviewLine` returns for a landed build with no findings. A first attempt at
this change keyed the fix to a landed *verdict* and so did nothing here; `x9b` still reported `stale seen 0x`
for all six controls.

The dimming never reached the screen for two other reasons, both in the same render:

1. `dentalReviewReady` is `Boolean(activeUnit?.supports && built.get(activeUnit.id)?.unit === activeUnit)`, so
   it also went false the instant the setting changed. The panel passed `open`/`onToggle` only when it was
   true, and `ReviewSummary` gated the `is-stale` class on `stale && settled`, where `settled` means those two
   props are present. So the panel could not say it was stale at the one moment it was.
2. With `ready` false, `reviewLine({ built: ready, ... })` returned the `building` line. The verdict was not
   dimmed; it was **replaced** by "Building supports…", and the Details fold and its toggle left the DOM with
   it.

So the reader did not lose a visual cue. They lost the verdict and its evidence, and got a progress sentence
in its place, on every nudge of every Step 3 control.

### What it does now

The owner's answer: the dimming is a fact about the data, not about the input device. A verdict is dimmed from
the moment a setting changes until a fresh verdict lands.

- `ReviewSummary` gates `is-stale` on `stale && tone !== 'building'`. What dims a verdict is the verdict being
  out of date, not the Details fold being on offer. A `building` line is still never dimmed: a first build has
  no previous verdict to dim.
- `DentalReview` gains `buildLanded: boolean` — "a support build has landed for this object at least once".
  `App` supplies `Boolean(activeUnit && built.get(activeUnit.id))`. The **build** map is the right signal, not
  the check map: `built` keeps its entry when a settings change makes that entry stale, which is exactly the
  window the panels need, and Step 3 shows a verdict before anyone presses Check. It is keyed by unit id, so a
  new aligner starts without one and needs no reset.
- Step 3 reads its line and its Details fold from `shown = ready || review.buildLanded`. The verdict the
  reader was reading stays on screen, dimmed, with its findings; those findings outlive the rebuild
  (`review.problems` keeps the last check's, and `ProblemList` already marks them "Out of date, check
  again."). "Building supports…" is now reached only by a first build.
- `stale` becomes `adjusting || review.verdictPending || (shown && !ready)`. That last term **is** the
  definition of out of date — a result is on screen and it is not the one the object would build now — so it
  needs no rebuild to have started, no pointer to be held, and no stored verdict to compare against. Both
  panels use it.

A build that **failed** outranks the verdict it was meant to replace, so `built` is `shown && !failed`.
Without that, `reviewLine` (which returns the failure line only when `failed && !built`) would keep showing a
previous "Supports ready." over a build that did not happen — a worse lie than the one this change set out to
fix. Both panels do this, and both have a test for it.

### Where the denture's Step 2 differs, on purpose

The denture panel gets the same treatment for its **line** and not for its **Details**. Its evidence —
Resolve, the parts list — is read off `mesh`, and `currentBuild` returns `undefined` the instant the object
changes, so keeping the fold open through a rebuild would open it empty. The aligner's evidence is
`review.problems`, which survives. The two panels differ because their data differs, and the code says so.

### What this does not do

- `adjusting` and `RangeField`'s `onAdjust` are now redundant for Step 3, since `verdictBehind` covers the
  whole window. They are left alone: `onPointerDown` still covers a slider held without being moved yet, and
  removing the machinery is a separate change.
- The denture's Details gap above.

## 2. An orientation that failed offered no way out

### What a reader saw

Drop a model with no central opening on the reference aligner type and Step 1 says:

> The aligner could not be oriented automatically. It stays as dropped: rotate it with the gizmo, then press
> Next.

Nothing else. The one reader whose real mistake was picking the wrong aligner type had no way to say so. The
notice that exists for exactly that — "This looks like a different aligner type: no central opening was
found.", with its Switch and Keep keys — is reachable only when orientation **succeeds** and the opening
contradicts the profile (`!result.matchesProfile`). A failure is a different branch and had no keys.

### What it does now

The owner's answer: the failure notice gains the way out the mismatch notice has. A wrong type and a failed
orientation have the same answer — another aligner type — so both notices now carry the same row, built from
`profilesWithoutOpening()`. A mismatch keeps its Keep key; a failure does not, because a failure is not an
opinion to disagree with.

### The part that cannot be built here, and what it means for this change

`profilesWithoutOpening()` is **empty today**. The engine embeds exactly one profile,
`reference-aligner.json`, and its `opening` is `"yes"`, so no profile qualifies as one a model without a
central opening could be. The switch row therefore has nothing to switch to — on the mismatch notice either,
where it has been rendering a lone "Keep Reference aligner" with no alternative beside it.

Profile files live in the Rust core (`crates/geometry-core/src/dental/profiles/*.json`, copied here by
`scripts/gen-profile-files.mjs`), so a second type cannot be added from this repo.

Rather than render an empty row, the row says why: "{name} is the only aligner type so far." A reader
wondering whether they picked the wrong type learns that there is only one, which is the answer to their
question. The Switch keys come back on their own the day the engine embeds a second profile — no further
change here.

Translations for the new line came from Gemini in Taiwan wording and Japanese, matching the app's existing
terms (`牙套類型`, `アライナーの種類`), and the Japanese subset title face was cut again for `唯`.

### Still upstream, and not attempted here

Saying **why** an orientation failed. `orientDentalAligner` already returns
`{ kind: 'failed'; reason: string }` and that `reason` already reaches `useDentalFlow`'s tilt state, so the
earlier note that surfacing it needs an upstream change was too broad — the string is here. What is upstream
is that `reason()` returns Rust **prose**. The app ships in English, Japanese and Taiwan Chinese, and a raw
engine sentence would be its only untranslated text, worded for whoever wrote the Rust. The ask for geocore is
a stable reason **code** the app can translate.

### What letting the walk through uncovered: Next cannot work after a failure

With `u7` passing, the walk reached ground it had never covered — `Next` from a **failed** orientation — and
hung there. The cause is in `useDentalFlow`'s `next()`:

```ts
// Orientation failed: there is no opening to build the support area from.
if (!proposal || !profile) return setStatus('No aligner opening was found, so no support area can be proposed. Go Back and choose another file, or Exit.');
```

Refusing is correct: Step 2's support area is built from the orientation proposal's rim, and a failure has no
proposal. The problem is that the failure notice says:

> The aligner could not be oriented automatically. It stays as dropped: rotate it with the gizmo, then press
> Next.

So the notice asks the reader to press a key that will decline, and the only real ways on are Back and Exit —
which is what the status message says once they have pressed it. One of the two has to give.

This is **not changed in this pass**, because which one gives is a product decision, not a correctness
detail:

- **Reword the notice** to name Back and Exit, matching what the app does. Small, honest, ships immediately.
  It also means a model that only needed turning by hand has no way through, which is the weaker outcome for
  the reader.
- **Let a hand-turned aligner go on** with a hand-marked support area, so the notice's promise becomes true.
  Better for the reader, and a real piece of work: Step 2's empty-area path currently needs `proposal.rim`
  (`manualAreaPolicy(proposal.rim, …)`), so a rim-free manual area has to exist first.

My recommendation is the reword now and the second as its own task, because an instruction on screen that does
not work is the worse of the two faults and costs a sentence to remove.

The walk records this rather than asserting it: `u8`/`u8b` only apply to the oriented ending and now say they
are skipped on the failing one, and a `note` reports what `Next` did. No check encodes an undecided answer.
The block also no longer re-reports a `u7` that already passed as a failure when something downstream throws.

### Prose in Step 1's notices

`.edit-note` is `text-align: right` globally and overridden to left inside `.dental-side`, which is the
supports dock — fixed in `d939c64`. Step 1's column is not `.dental-side`, so its notices were still ranged
right. A notice is a run of words, so this change ranges the notice prose left and lets its box fill the
column, with the keys under it staying right where every other row of keys puts them. This is a style change
beyond the two bugs and is called out so it can be reverted on its own.

## 3. The walk's `u7` check

`u7` waited for the mismatch wording and then clicked Keep. On this machine the cup fixture **fails** to
orient rather than mismatching, so the check read a working app as a broken one, and the wording it waited for
was prose rather than a stable name.

It now waits for either row by `data-ui` (`orient-ways-mismatch`, `orient-ways-failed`), asserts that the row
offers a way out (a Switch key, or the line that says there is only one type), and branches: Keep is clicked
and asserted gone on a mismatch, and asserted absent on a failure.

## Verification

- `tsc` clean.
- Unit tests: `ReviewSummary` (a verdict with no Details fold still dims), `DentalBar` (a landed verdict stays
  and dims instead of becoming "Building supports…"; a first build still says it), `DentureReviewPanel` (the
  same for its line, with Details still waiting for a build), `OrientationBar` (both notices carry the row;
  only the mismatch carries Keep).
- The full suite and the build.
- `npm run walk -- --only=x` for `x9b` against the running app, and `--only=u` for `u7`.
- No engine change (nothing under `vendor/mixo-geocore` was touched), so the real-scan gate is not implicated.

## Open for the owner

1. **The failure notice promises a Next that declines.** Reword it to name Back and Exit (recommended, ships
   now), or build the rim-free manual-area path so a hand-turned aligner can go on. See the section above.
2. A second aligner profile — a type that does not insist on a central opening. Until one exists, the type
   switch can only explain itself, and `u7`'s cup has no type to be.
3. The geocore ask: a stable reason code from `orient_dental`, so a failure can say why in all three
   languages.
4. The Step 1 prose alignment above, if it is not wanted in this change.
