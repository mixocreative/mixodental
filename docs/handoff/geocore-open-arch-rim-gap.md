# geocore: a rim-gap measure for one contour loop (open-arch aligners get none)

STATUS: agreed by Fable and Codex 2026-11-27 under the owner's delegation; sent to mixo-geocore docs/requests/.
CANDIDATE: written from the app's behaviour and the walk; the engine source of the missing figure was not traced.

**As the operator meets it.** An aligner with a central opening gets a rim-gap review in Step 3 (the largest gap
between supported points along the outer rim and along the opening). An OPEN-ARCH aligner (no opening contour) gets
none at all - the review reports no figure, and an absent review reads like "no gaps". Since 2026-11-27 open arches
build through the app's Steps 1-3 (mixodental 6c1282aa), so this is now a real case, not an edge.

**Why the host cannot close it.** The gap figures come from the engine's dental review (the `outer` / `opening`
`maxGapMm` the app reads); for an open arch the opening is empty and the outer figure is not produced either
(the walk's l3 check sees the opening review gap as -1). Measuring gaps along a contour is geometry, and geometry
belongs in the engine (docs/GEOCORE-BOUNDARY.md, rule 1 - a generic primitive, rule 8).

**The ask (generic).** A primitive that measures, for ONE closed or open contour loop and a set of support contact
points, the largest gap along the loop between consecutive supported points (and where it is), with a reason code
when it cannot measure ("not measured: <why>"). The dental review then calls it for the outer rim of every aligner,
open arch included, and for the opening when there is one. Host side (mixodental) will show "rim gaps not measured"
with the reason until the figure exists, so an absent review never reads as a clean one.

**Evidence to attach when picked up.** The open-arch samples in samples/aligner/g (named by hash only) and the
walk's section l fixture.
