# Final review - the night of 2026-11-27

For the owner, on waking. Everything below is built, tested and pushed to `main` (last commit `a0e938a9`). The full gate
passed on the final state: the walk **ALL PASS (199 checks)**, the test suite (2210 passed), the build, the screen checks
and the vendored-engine check. Decisions the owner delegated were made by **Fable and Codex agreeing**; where they did
not agree, nothing was changed.

## What to look at (about 15 minutes)

1. **Type Lab** - `npm run review` (or `node typelab/serve.mjs`), import `samples/denture/g`:
   - the page now follows the work: scans in (header) -> pick the type (Type strip) -> run (case list) -> compare (3D
     view) -> edit (stages) -> **Tune to targets** -> Save; a spinner shows every wait;
   - press **Compare with target** on a case; press **Tune to targets** (cached: about 10 s), then **Open the winner**.
2. **The app** - import a scan through the deck:
   - the deck card says **"Supports built - review needed"** after Auto-gen and **"Oriented"** after the orientation check;
   - Step 1: Next is the only primary key; Step 2: the proposed tips lead and the note follows the tool in hand;
   - Step 3: the line says **"Supports built, not checked yet"** until Check runs; Check sits beside it; the ID label is
     above Adjust; the status line shows two lines.
3. **Types** in `types/`: `denture-overhang-60`, `aligner-density-1-5`, `retainer` - and every new denture now starts at
   overhang 60 (from horizontal; higher = more supports).

## What changed, by area

| Area | Change | Where it is recorded |
|---|---|---|
| Fit | automatic pairing + line-up of `-sup` targets (14/14 pairs); the fit on whole types; per-pair + leave-one-out acceptance | `typelab/CLI.md` "Fitting a setup" |
| Fit results | dentures: overhang 60 (owner's call) + hole strip 3 mm; aligners: density 1.5; retainer: copy of the aligner | `types/`, commits |
| Node composer | evidence per tip source; candidates ranked by the engine re-score (calibrated on two known runs); greedy search under the agreed rule; gap report + calibrated probes | `typelab/CLI.md` "When the fit finds nothing" |
| Type Lab page | Fable's layout, icons with tooltips, the wait sign | `typelab/README.md` |
| App UX | the 8 changes Fable and Codex both agreed, plus round 2 (status line, "Oriented") | `docs/REVIEW-UX-REFINE.md` |
| Bug fixes | aligner types with another strip position/width placed no tips (review used the reference strip); the matcher took a multi-piece model for one piece | commits `fcd0d38f`, `2956e635` |
| Engine boundary | `docs/GEOCORE-BOUNDARY.md` agreed; three requests sent to mixo-geocore `docs/requests/` (documents only) | `docs/REVIEW-UX-REFINE.md` decisions tables |
| Real-scan gate | baseline re-recorded; every difference explained, none worse | commit `ea893b0f` |

## Decisions made for you (Fable and Codex both agreed)

- GEOCORE-BOUNDARY is the project's rule; the three geocore requests are sent.
- The dental status line wraps to two lines (hiding repeats by tone is a later step).
- DEBUG stays visible in release (your 2026-11-21 ruling).
- The deck's orientation chip says "Oriented".
- The height-band engine request was HELD and then not sent: the calibrated check showed it does not help.

To reverse any of these, say which; each is one small commit.

## The one open finding, and what it needs from you

On the 4 dentures that compare with a target, the **rim tips cause about 63% of our support area outside your targets**.
No arrangement of the existing zone nodes fixes it, and none of the four procedural probes (slope band, height band,
distance from the rim, sector around the arch) separates the rim parts your targets support from the ones they do not.
So no engine request was sent for it. **What would move it: more denture samples with `-sup` targets** - then the
composer can test two-factor rules (e.g. sector x distance), and a real separation would become an engine request.

**Added later on 2026-11-27, after the owner's idea of putting rim tips in the zone stack:** the probes above were
confounded. Every rim attempt also dropped area and hole tips, and turning the rule on also let NS drop rim tips. Re-run
on rim tips only, 80 rules (every band plus 18 ray casts), nothing helps every pair. Dropping all rim tips helps one pair
(+20.1) and hurts the other three, so the difference is per case. The print pose is ruled out. The structural fix (rim
and hole tips as Marks in the stack, a later Mark wins) is agreed by Fable and Codex and sent as an engine request:
`docs/handoff/geocore-zone-stack-edge-tip-marks.md`. Details: `typelab/CLI.md`, "When the fit finds nothing", item 6.

## Scope verdict (Fable and Codex, both)

Asked independently whether anything left must be built now: both answered **COMPLETE - pending only the owner's
sign-off and new samples**. Deferred by both: curvature / component-size / grow-shrink probes and two-descriptor probes
(4 pairs cannot confirm them; wait for more denture targets), an aligner composer (no zone graph; profile numbers
already fitted). Fable's one docs fix (the composer section's status words) is done (`d4c08b1f`).

## Not done, and why

- Retainers are not tuned: there are no retainer `-sup` targets yet.
- Curvature, patch-size and grow/shrink probes: written down, not built (they need surface neighbourhoods, and 4 pairs
  could not confirm them anyway).
- The composer is denture-only: aligners have no zone graph to arrange; their tuning is the fit's profile numbers.
- Four aligner scans still do not build: an engine request (sent).
