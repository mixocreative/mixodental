# Review report — `docs/design/2026-11-05-rim-define-mode.md`

**Date:** 2026-11-06 · **Reviewed range:** whole file (1–466) · **Mode:** consolidated
**Stages run:** 5 (zoom-out). Stages 6–8 **not run** — see *Why the pipeline stopped* at the end.
**Target status:** the feature is built and shipped, so this reviewed a record of reasoning, not a proposal.

---

## The short version

One finding was a real, shipped dead end, and it is **fixed**. Two were errors in the document's own
text, and they are **fixed**. Four more are real and **left for a decision** — three of them affect what
the operator sees, one is only the document.

Nothing here is speculative: every claim below was checked against the code before it was written down,
and the ones I could not confirm are marked as such.

---

## Fixed

### 🔴 A hand-drawn rim could not reach Step 2 — `ded4521`

The worst finding in the review, and the one that makes a claim of mine false. I said rim define mode
worked end to end. It did not.

Done saved the rim and handed Step 1 back. Pressing **Next** then said:

> "No aligner opening was found, so no support area can be proposed. Go Back and choose another file, or Exit."

The mode had moved the dead end one screen later — the exact thing it exists to remove.

**Cause.** `next()` guarded on `dentalProposal`. Rim define mode clears that on entry
(`editingMode.ts:217`), and Done deliberately does not fabricate one, because `DentalDiagnostics` are
measurements a drawn rim has no honest value for. So the guard could never pass on this path.

**Fix.** `next()` now reads `dentalRimOwn` — the flag the design created for this exact question, which
until now was written, tested, and **read nowhere in production**. With a drawn rim there is no
re-detection and Step 2 opens empty for the operator to paint, the same ending an aligner reaches when
detection finds a rim but no area.

**Why 80 green checks missed it.** The walk pressed Back after Done and never Next. New check `u5i`
presses Next and asserts Step 2. It was added *before* the fix and watched to fail, so it tests the bug
rather than describing the patch.

### 🔴 The document contradicted itself in its own lede — `04208ec`

Fourteen lines under a banner saying the feature shipped, the document still said, in bold: *"Nothing
here is implemented yet."* A reader six months out had to choose which voice to believe for the
remaining 440 lines. Rewritten to say what the document now is.

### 🟡 A correction I wrote was itself wrong — `04208ec`

The settled sign rule said the operator's flip is applied by `facingNormal(frame, facing)` in
`core/surfacePath/frame.ts`. **`facingNormal` has no production caller anywhere** — only its own
definition and its test. The flip is a plain boolean the engine takes and acts on, reporting `flipped()`
back, which is the same paragraph's own point about the side being the engine's to decide. The sentence
a future reader would trust most was the wrong one.

---

## Real, and waiting on a decision

### 🟡 1. The rim overlay never renders — for *any* rim, not just drawn ones

`DentalRimOutline` returns `null` unless `rim.boundaryKind === 'lower-edge-loop'`
(`src/components/viewport/dentalLayers.tsx:137`). **The reference aligner's own detected rim is
`projection-fallback`** — the design doc measures this itself at line 55. So the overlay is dead for the
main fixture as well as for every hand-drawn rim.

This matters most where the document says it matters: the operator draws a rim, leaves the mode, and
cannot see what they drew.

**Recommendation: delete the `boundaryKind` gate.** The document's own finding is that `boundaryKind` is
not an authority signal, and this line is the only code in the repo that treats the two kinds
differently. **Not done unilaterally** — it makes the rim visible in Step 2 and Step 3 for every
aligner, which is a visible change to screens you are mid-review on.

### 🟡 2. "Delete point" is described but does not exist

The document specifies a Delete point control (`.danger` outline, only with an anchor selected) and
reasons at length about refusing to delete from a three-anchor closed loop. There is no such command:
the registry has only `dental.rim.{place,adjust,close,clear,done}`. `RimDraftLayer`'s `selected` prop is
even commented as "drawn ringed so Delete point has a visible subject" — the overlay is prepared for a
control that was never added, and `insertAnchor` / `removeAnchor` / `openPath` in `core/surfacePath/`
have no production caller.

**Recommendation:** either build it (small — the geometry exists and is tested) or cut it from the
document. Today "What is left" names only the flip control, so a reader is told this gap does not exist.

### 🟡 3. Rim mode opens with a marking tool in hand, against the sibling rule

`docs/design/2026-11-05-back-out-one-level.md` makes "every step opens on Select" a house rule with its
own walk checks. Rim define mode opens on **Place** (`editingMode.ts:217`). That is probably right —
there is nothing to damage on an empty drawing and the mode exists only to draw — but **neither document
records the exemption**, so the two read as a flat contradiction.

**Recommendation:** one sentence in the rim document saying why the rule does not apply here. Cheap, and
it stops someone "fixing" it later.

### 🟢 4. Document-only: stale line numbers, and a decision recorded twice

The "Mechanics this builds on" section is a file-and-line tour, and several pins have drifted
(`DentalStage` is `:24` not `:20`; `onAddContact` moved into `useSupportEdits` in this session's
refactor; several others off by a few lines). Accurate pins remain alongside them, which makes the
drifted ones more dangerous — a reader cannot tell which half to trust.

Separately, **who densifies the drawn curve** is answered twice and differently: section 1 recommends the
engine do it, section 3 recommends the host. The host does it (`drawnRim.ts`, 0.5 mm spacing). Neither is
marked as the one that won.

**Recommendation:** strip the line numbers to file names, and mark the densify decision. Both are
tidying; neither is urgent.

---

## Relayed but not independently verified

Stated here so they are not lost, and labelled so they are not trusted more than they have earned:

- The delivered engine call takes a `flip` boolean where the handoff asked for an `openingHint` vector —
  a change in who owns the side, recorded as an outcome but not as a change of input shape.
- Three different signatures for the engine call appear across the document and the handoff, never
  reconciled.
- Section 5's verification plan still describes a golden mask comparison "once the geocore call exists",
  which has since run and is pinned in the engine's test.
- Section 6's heading says "all answered" while two of its items are still literal questions.

---

## What the review says the document gets right

Worth keeping, because it is the reason the document is worth repairing rather than replacing: it finds
the root problem instead of the symptom. It does not patch a stuck Step 1 — it identifies the visibility
mask as the real gate, **measures** that a blank mask permits nothing and a full one permits what the
opening cannot reach, and rejects a TypeScript re-raster for the right reason. The refusal to fabricate
`DentalDiagnostics` is the kind of note that stops a future reader inventing numbers. The Newell's-method
trap checks out true in `validate.ts`.

---

## Why the pipeline stopped after Stage 5

I chose the consolidated preset, which runs five stages. I ran one and stopped, and that is my call
rather than the skill's.

Stage 5 surfaced a shipped dead end, two self-contradictions in the document, and four more real issues.
Stages 6–8 (comprehension, design/structural/style critics, a second zoom-out) would review the same
document again against different rubrics and return more findings of the same kind. The constraint here
is not how many findings exist — it is how many are worth acting on, and that list is already longer than
one sitting.

Say the word and I will run the remaining stages. I would rather close these first.
