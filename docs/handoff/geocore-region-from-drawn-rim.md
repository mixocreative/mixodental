# Handoff to mixo-geocore: propose a support region from a rim the operator DREW

**For:** `mixocreative/mixo-geocore` (vendored here at engine 63, `b5a71ab`).
**From:** mixoDental, 2026-11-09. Follows `geocore-rim-from-points.md` (delivered, engine 61).
**Why now:** the owner approved letting a DETECTED rim be redrawn by hand (2026-11-09), and that
turned a latent gap into one the operator meets in the first five minutes.

## The gap, stated as the operator meets it

Step 2 has three sliders on `DentalTuning` — **Area width** (`stripWidthMm`), **Area position**
(`positionMm`, "higher moves the support area farther onto the outer surface; lower moves it toward
and across the edge") and **Support density**. They are the right controls and they work.

They work **only for a detected rim**. `useDentalTuning` reads tuning from a `two-contour` policy and
returns early for anything else; a hand-drawn rim lands a `manualAreaPolicy` instead —
`kind: 'legacy'`, `origin: 'manual-area'`, `stamps: []` — because, in `useRimDrawing.onRimDone`'s own
words, *"the rim is the operator's, and there is no detected area to go with it."* So Step 2 opens
empty to be painted, and the two sliders still **render, still move, and steer nothing**: they fall
back to the profile's defaults and no effect consumes them.

That is a dead control in the exact sense this project's audit doctrine uses, and the host cannot fix
it alone — it has no band to control, because nothing proposes a region from a given rim.

## Why the host cannot do it

- `propose_dental_region` **re-detects** the rim; it does not take one.
- `dental_rim_from_points` (engine 61) returns the plane, the side and the 96×96 visibility mask —
  and deliberately nothing else. `geocore-rim-from-points.md` records the reason the mask is the
  engine's and not the host's: *"a blank mask permits nothing at all (painting stops working), a full
  one permits supports where the opening cannot reach"*, and a TypeScript raster would be a second
  source of truth tracking the Rust one through every engine bump with no test that could prove they
  agree. Every word of that applies here, and more strongly: a region is what decides where supports
  are allowed to land.

## The ask

One call, the region counterpart of `dental_rim_from_points`:

```
dental_region_from_rim(model, points, flip, profile, tuning) -> DentalRegionResult
```

- `points` — the same dense curve the host already resamples for `dental_rim_from_points`
  (`RIM_SAMPLE_SPACING_MM = 0.5`), so the two calls take the same input and cannot disagree about
  which rim they were given.
- `tuning` — `stripWidthMm`, `positionMm`, `density`, exactly the three the sliders already own.
- Result — whatever `propose_dental_region` returns for a detected rim, so the host can store a
  `two-contour` policy and every consumer downstream is unchanged.

Taking the rim's own plane (the one `dental_rim_from_points` fitted) rather than re-deriving it is
the point: the operator drew that loop, and the band has to hang off what they drew.

## What the host will do with it

`useRimDrawing.onRimDone` stops storing `manualAreaPolicy` and stores the `two-contour` policy this
call makes possible, with the profile's default tuning. From there nothing else changes: the sliders
already read `policy.tuning`, `useDentalTuning`'s retune path already exists, and Step 2 stops opening
empty for a rim the operator took the trouble to draw.

**Until it lands**, the honest host-side behaviour is the one shipping today — Step 2 opens empty and
is painted by hand — and the two sliders should arguably be hidden rather than shown inert for a
drawn rim. That is a host decision and is recorded as debt in `docs/HANDOFF.md`, not done here,
because hiding a control the operator has learned to look for deserves the owner's say.

## How to prove it

`npm run walk -- --only=u` in mixoDental against the new vendor drop: redraw the rim on the reference
aligner (`u9b` already gets there), press Done, and Step 2 must open with a band rather than empty,
with Area width moving it. The check to add is the mirror of `u10c`, which already proves exactly that
for a detected rim — *"Area width widens the area and moves the tip preview onto its middle line"*.
