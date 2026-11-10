# Open decisions for the owner

Five questions the code cannot answer by itself (the first is now decided and done). Each section says what the app does now, how professional dental print-preparation software usually handles the same thing, what I recommend, and what you would do. "Professional software" here means the dedicated dental and resin print-preparation tools in common lab use; the descriptions are of general practice, not of any one product.

Where a decision needs evidence, the [folder review](batch-review/README.md) gives it: run it on your aligner files and look.

## 1. When is a result "blocked"?

**Now (fixed 2026-10-28).** Before, every build was `blocked`, so the word meant nothing. The cause was the reach rule, the part of the safety check that tells a tip touching its own surface from a support cutting through the aligner. It only accepted the exact face the tip was placed on and its direct neighbours. On a fine aligner mesh (faces of about 0.1 to 0.2 mm) a tip covers several rings of faces, and at the thin rim it sits over the edge onto the other side. It also compared against the neck's direction, which comes from a smoothed copy of the model and can be 50 to 80 degrees off the real surface at the rim. Now the check follows the real surface the tip was placed on and accepts a tip seated over a thin edge, within the tip's own depth. A separate wall is still never accepted. Details: [technical algorithm, safety verdict](technical-algorithm.md#safety-verdict).

Result: on the reference aligner, 102 issues became 14. On the built-in test models, 9 of 16 builds are now `clear`. What remains are real crossings: on the aligner, 14 tips whose neck runs back into the shell (11 of them by more than 1.3 mm).

**Professional software** checks every support against the model and does not leave a crossing in place: it re-aims the tip (shortens or tilts the neck), moves the contact a little, or deletes that support and shows it as unsupported. A crossing is shown as a warning on the model, and the user decides.

**Recommendation.** One more step, a code change of about one work unit: when a tip's neck crosses the aligner, the repair first re-aims the neck along the real surface normal, and if it still crosses, leaves that tip out and lists it under "Supports left out", as it already does for a crossing shaft. Keep `blocked` a warning, not a refusal; once crossings are this rare, show a "Support crosses the aligner" entry in the problem list with Fix and Show buttons.

**You:** ~~say yes or no to the re-aim step.~~ Approved.

**Status: done (unit C, 2026-10-28).** The repair now re-aims a crossing tip's neck (first along the real face normal, then straight down) and leaves the tip out, listed under "Supports left out", if it still crosses; hand-placed supports are never moved or removed, only reported. Generic models are unchanged (their budget is 0: report only). On the reference aligner nothing crosses any more (verdict `clear`). The cost: 13 of 94 tips are left out at the new Step 3 defaults, all on one stretch of the central opening where the strip faces up or sideways in the print pose (no support from below can reach those faces without passing through the aligner). The opening gap there is 56 mm (14 mm before), shown for review in Step 3. If prints need support there, add supports by hand or paint area on the down-facing side. Still open: showing a "Support crosses the aligner" entry with Fix and Show for crossings that remain on other aligners (for example a hand-placed one).

## 2. Low points outside the support area

**Now.** The island check finds low points of the aligner that nothing holds up. In dental mode, those outside the support area (on the tooth-facing side, which must stay smooth) are grouped as one information line, not a problem. The reference aligner has 20 of these and 0 inside the area. This was a lead decision on 2026-10-28 and can be reversed.

**Professional software** keeps supports off the fitting surface by design, using no-support zones on the tooth-facing side, and relies on the print angle and the shell's stiffness to hold those regions. It shows overhangs and unsupported regions as a colour map for the user to judge, rather than as errors.

**Recommendation.** Keep it as information. In the folder review, switch on "Low point outside the support area" (blue-grey markers) on your real aligners. If those points print fine, nothing changes. If some print badly (sagging, layer marks on the inside), the fix is a better print angle or a wider support area for that aligner type, not supports on the fitting surface.

**You:** check a few prints against the markers; tell me only if one prints badly.

## 3. Damaged meshes (the knot test model)

**Now.** The mesh check is strict. A file whose edges are shared by more than two triangles (`knot.stl` has 4,011 such edges, because the tube touches itself) still gets supports, but the island check says "inconclusive" instead of guessing.

**Professional software** runs a mesh check on import and offers a one-click repair (close holes, fix flipped faces, remove duplicate or self-touching parts) before placing supports. The check stays strict; the repair is a separate, visible step the user chooses.

**Recommendation.** Keep the check strict; never loosen it silently. Aligner files exported from dental CAD are almost always clean, and the knot is a test model. If damaged files turn up in real use, add an explicit "Repair mesh" step at Step 1 (and in generic mode), which is a separate piece of work.

**You:** nothing now. If the folder review shows `non-manifold-or-degenerate-mesh` on real aligner files, send me the case numbers.

## 4. The 120-second time limit

**Now.** Generate gives up after 120 s and the result counts as "can't decide", which export refuses. The reference aligner takes about 3 to 5 s, so the limit is about 25 times the normal time. It exists so a broken file cannot freeze the app.

**Professional software** shows progress and a Cancel button instead of a fixed limit, because lab files vary widely in size.

**Recommendation.** Keep 120 s. The app already has Cancel. The folder review records the time of every file (`Time (s)`, and `seconds` in `summary.csv`); if a real aligner takes more than 30 s, raise the limit or speed up that step.

**You:** glance at the times in `summary.csv` after a folder run.

## 5. Testing on more aligners (U6b)

**Now.** Everything was tuned and tested on one reference aligner. That is the main reason dental mode is labelled "preview, not clinically validated".

**Professional software** is validated by the maker on many cases and on specific printer and resin combinations, and then by each lab on its own workflow: print, fit check, and records.

**Recommendation.** Run the folder review on 10 to 20 real aligner files that differ from each other: upper and lower, with and without a central opening, with attachments, different trim-line styles, and files from different design software. For each case write right / wrong / unclear for the edges, the support area and any markers. Then print 3 to 5 of them and check the fit. Send the case numbers and notes (not the STLs, unless you approve sharing them). I will tune the detector with those cases and add them as tests.

**You:** collect the files and run `batch-review/run-batch-review.bat` on the folder.

## 6. Auto-orientation after a hand-drawn rim (reopened 2026-11-10)

**Decided 2026-11-05, in the owner's words:** *"self defined rim disabled auto orientation detection."*
A drawn rim meant no re-detection and no print-angle scan, and the aligner went to Step 2 at whatever
orientation its file arrived in.

**Reopened by the owner 2026-11-10:** *"wouldn't it be great with auto orientation, it should be able
to [be] determined after user defined the edge rim?"*

**Now.** The original decision was right for its moment: a drawn rim could not produce a frame. Engine
61 changed that — `dental_rim_from_points` returns the plane and the opening side. A probe against
engine 63 confirms a pose derived that way sits **5.60 degrees** from `orient_dental`'s on the
reference aligner, which is the expected difference between a least-variance axis and the plane of a
traced loop.

**What it cannot do today.** Every entry point that would deliver it re-runs the detection that
already failed: `dental_tilt_scan` → `orientation-no-trim`, `propose_dental_region` →
`orientation-no-trim`. And the pose maths, `dental_pose`, exists only in the test build — it is absent
from the browser build the app runs. So this is an engine ask, not a host change:
[`docs/handoff/geocore-orient-from-drawn-rim.md`](../docs/handoff/geocore-orient-from-drawn-rim.md).

**Recommendation — and a correction to the owner's framing.** The owner suggested the rim should come
FIRST for everyone, then auto-detect, then manual. I recommend against reordering: detection already
runs free and batched on the Items page, dentures have no rim at all, and the local baseline is 8 of 8
aligners detecting cleanly — so making everyone draw would replace a good automatic answer with a
hand-traced one 5.6 degrees off, and slow the common path. The owner's sequence is exactly right for
the **failure branch**, which is the only place it is needed: detection fails → draw → auto-orient
from that rim → manual only if the operator disagrees.

**You:** nothing to do until geocore answers. `src/vendorCapabilities.test.ts` fails the day the
symbols arrive and carries the undo list, so this cannot be forgotten.
