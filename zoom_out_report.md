# Stage 5 — Initial zoom-out review

**Target:** `docs/design/2026-11-05-rim-define-mode.md`, lines 1–538
**Standard:** `resources/document_standards/zoom-out-standard.md`
**Date:** 2026-11-06

**Headline.** Context sufficiency (§0) and root-problem focus (§1) pass comfortably. The
engine-vs-host argument in section 1 is the strongest part of the document and holds up in the
code: a maintainer would understand why `dental_rim_from_points` exists and would not be tempted
to re-raster the mask in TypeScript. The problems are all of one species — the *as-shipped* half
has drifted from the *as-reasoned* half, and in three places the document states something the
code contradicts.

---

## 🔴 Blocker

### 1. Cancel is described wrongly, and what shipped is the dead end the feature exists to remove

Sections 3 (lines 220–230) and 6 item 4 (499–500).

The document says Cancel means "Step 1 keeps the notice that sent the operator here". The notice
is deliberately *not* carried: `useDentalFlow.ts:168–183` suppress the `failed` notice on the
hand-over, passing only `holes` if present. `backDental` for the `rim` stage
(`editingMode.ts:303`) returns to stage `aligner` with `dentalRimOwn: false` and adds no notice.

So after Cancel the operator sits in Step 1 with no proposal, no rim and usually no notice, and
`next()` answers *"No aligner opening was found, so no support area can be proposed. Go Back and
choose another file, or Exit."* (`useDentalFlow.ts:284`). Re-entry is impossible: `dentalRimNeeded`
is accepted only while the aligner is still `loading` (`editingMode.ts:228`, asserted by
`rimStage.test.ts:49–53`), and there is no `dental.rim.enter` command.

The feature's purpose was to remove a dead end, and Cancel re-creates it with *less* explanation
than before. Either the document records this honestly (Cancel means re-import the file) or the
fix — carry a notice, or allow re-entry — is named as remaining work.

---

## 🟡 Major

### 2. Section 6 claims "all answered" over two items that are still questions

Line 490. Item 3 (497–498) ends "or asked outright … as one step of the mode", which the
correction at 266–285 has overtaken. Item 4 (499–500) ends with a literal question mark.

Verified: the `u7` type row still renders for `notice.kind === 'failed'`
(`OrientationBar.tsx:81–90`), and that notice is still produced for the "could not look" cases
(`useDentalFlow.ts:162, 166, 202`). So section 2's prediction at 200–203 — that the row "becomes
unreachable on the failure path once this lands" — is false as shipped, and item 4 is undecided.

### 3. The routing question is never closed, and what shipped was neither option offered

Section 2 (194–198) and section 6 item 6 (505–506) offer "a new `dentalProposal` shape" or "its
own session field", recommending the latter. What shipped is a third thing: the finished rim goes
into the unit's scene `dental` policy (`useRimDrawing.ts:132–136`), the session carries only the
boolean `dentalRimOwn` (`editingMode.ts:136`), and `next()`'s guard became
`if (!proposal && dentalRimOwn && profile && unit.dental)` (`useDentalFlow.ts:278`).

That is simpler than the recommendation, but leaving the recommendation standing as advice invites
a maintainer to "finish" it by adding a session field that is not needed.

### 4. YAGNI: three exports with no production caller, one advertised as a role

Verified by grep across `src`: `facingNormal` (`frame.ts:138`), `openPath` and `insertAnchor`
(`path.ts:95, 62`) are referenced only from their own tests, `src/core/README.md` and the design
docs. The document is half-aware — the correction at 282–285 says `facingNormal` has no production
caller — but the section 4 table at line 445 still lists it as part of what `frame.ts` is *for*,
with no cross-reference. The document should say which exports are live and which are speculative,
so nobody maintains dead code as load-bearing.

### 5. Line-number citations have rotted, and the document is built on them

Verified samples: `DentalRimOutline` cited at `dentalLayers.tsx:128` (lines 128, 406) is at 144;
`clickModel` cited at `UnitObject.tsx:268` (line 350) is at 332; the `raycast` prop cited at
`UnitObject.tsx:304` (line 348) is at 387 and 448; `offerUndo` cited at `App.tsx:275` (line 397)
is at 280. Roughly sixty such citations appear in sections 1–3 and 7. Symbol names alone carry the
argument; the numbers are the part that lies.

### 6. A superseded recommendation left unmarked — the one contradiction not flagged

Line 397 says "`offerUndo` … Clear and Delete point should use it, the way `clearManual` does",
while 318–320 say the opposite and explain why. Verified: no rim-related `offerUndo` kind exists
(`App.tsx:839–992`). Every other overturned claim carries its correction at the point it appears;
this one does not, and the stale version sits in the more authoritative-looking "Mechanics this
builds on" subsection.

### 7. The drawing is scene state, and the document never asks what a save does

`rimDraft` lives on `PrintUnit` (`project.ts:55`), whose own comment says "what gets saved is the
`dental` policy the finished rim goes into" — but `normalizeUnit` (299) spreads `...unit` and
`migrateRemovals` (284) strips only `suppressed`, so `rimDraft` passes through `serializeScene`
(254) into a saved project file and back through `deserializeScene` (258) with no validation of
its shape. The pass-through is verified by reading; whether the UI permits saving while rim mode
is open is **inferred, not executed**.

---

## 🟢 Nit

**8.** Stale framing at line 45 ("96 × 96 = 9216 bytes. This is the problem.") without the marking
used elsewhere. `boundaryKind` itself is verified correct: `rim_from_points` returns
`ProjectionFallback` (geocore `rim.rs:176`) and `front` is `None`.

**9.** Lines 313–317 rule that controls must be shown-and-disabled rather than appear and
disappear, but Close loop does exactly that (`rimStage.test.ts:133`). Probably right — a closed
loop cannot be closed again — but the rule is stated absolutely and broken one control along.

**10.** The "39 tests" claim (476–480, 517) counts 32 `it(`/`test(` blocks across the four
`surfacePath` test files. Likely a counting convention, but a bare number is worth stating as
"32 test blocks" or dropping.

**11.** `flip` is plumbed and never non-default: `drawnRim(..., flip = false)` (`drawnRim.ts:102`)
is called without it (`useRimDrawing.ts:126`) and the engine echoes it back. Consistent with "the
flip control is the last piece still worth building", flagged so a reader of section 7 knows the
parameter is wiring, not a working feature.

---

## What the reviewer checked, and how

Verified against code: 1, 2, 3, 4, 5, 6, 8, 9, 10, 11, and the `rimDraft` pass-through in 7.
Inferred from reading rather than executing: whether a project can be saved while rim mode is
open (finding 7).

Looked for and did not find: reinvention of existing utilities (the reuse inventory in section 7
is accurate on the symbols checked — `rustRaycast`, `dragOver.down`'s `onObject`, `gizmoShown`,
the snapshot history with `undoFloor`), premature optimization, speculative configuration, or an
architectural dead-end in the engine boundary.
