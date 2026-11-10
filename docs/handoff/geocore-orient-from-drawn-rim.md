# Handoff to mixo-geocore: orient and scan print angles from a rim the operator DREW

**For:** `mixocreative/mixo-geocore` (vendored here at engine 63, `b5a71ab`).
**From:** mixoDental, 2026-11-10. Companion to `geocore-region-from-drawn-rim.md`; follows
`geocore-rim-from-points.md` (delivered, engine 61).
**Why now:** the owner asked whether auto-orientation can be derived once the operator has drawn the
rim. It can — the maths is already in the engine — but not from the browser build, and not with the
scan that needs it.

## The gap, stated as the operator meets it

Detection that fails takes the operator into rim define mode. They draw the rim, press Done, and the
aligner goes to Step 2 **at whatever orientation the file happened to arrive in**. No print-angle
scan, no dial, no "Auto orientation" — all of which a detected aligner gets. The host cannot offer
them, because every entry point that would produce them re-runs the detection that already failed.

Measured on this engine (`pkg-node`, engine 63, a shape with no findable trim):

| Call | Result |
|---|---|
| `orient_dental` | `failed`, reason `no-trim` |
| `dental_tilt_scan` | `failed`, reason `orientation-no-trim` |
| `propose_dental_region` | `inconclusive`, reason `orientation-no-trim` |

`scanDentalTilts` takes mesh + profile + support settings and no rim
(`host/dental/dentalTilt.ts:120-124`), so there is no way to hand it the rim the operator just drew.

## What already exists, and is the reason this is a small ask

`dental_pose(positions, indices, rim_scalars, profile)` is declared in
`pkg-node/mixo_geometry_wasm.d.ts` and **absent from `pkg-browser`**; the host treats it as test-ABI
only (`host/dental/dentalEngine.ts:288-295`, `host/dental/dental.ts:76-83`).

Probed on the reference aligner, pre-rotated by an arbitrary Euler: feeding its own detected loop
through `dental_rim_from_points` and then `dental_pose` returns a rotation **5.60 degrees** from
`orient_dental`'s. That is the same figure `geocore-rim-from-points.md` records for the axis, and it
is the expected difference — detection uses the shell's least-variance axis, a drawn rim uses the
plane of the loop.

Two findings that shape the asks:

- On an ambiguous arch, `dental_rim_from_points` succeeded and `dental_pose` returned **empty**. So a
  pose from a rim can legitimately say "don't know", and the host must keep manual orientation as the
  fallback. Please give a stable reason code rather than an empty return alone.
- The scan's own pick sat **10 degrees** from `orient_dental`'s rotation (start 46.46, pick 36.46).
  A pose is only the scan's starting point, so ask 2 matters more than ask 1.

## The asks

**1. Pose on the drawn-rim result.** Add `rotation(): Float64Array` to `DentalRimResult`, mirroring
`DentalOrientResult.rotation()` (Euler XYZ, empty when ambiguous, with a reason code) — or promote
`dental_pose` to the production session ABI.

> This **reverses point 5 of `geocore-rim-from-points.md`**, which says `front` must be absent because
> "this flow switches auto-orientation off entirely". That was the owner's 2026-11-05 decision, taken
> when a drawn rim could not produce a frame. The owner reopened it on 2026-11-10.

**Open question we could not test:** the only profile here is a `ring` arch, where the reference works
with `front` absent. An open (non-ring) arch presumably needs a `front` — does the engine derive it
from the loop's U parameter, or does it want a hint from the host?

**2. Scan the print angles from a given rim.**

```
dental_tilt_scan_from_rim(model, points, flip, profile,
                          neck_length_mm, pillar_diameter_mm, lift_mm, braced, on_tilt?)
    -> DentalTiltScanResult
```

Same `points` as `dental_rim_from_points`, and the same result type, so the host reuses
`decodeTiltScan` unchanged.

**Open question:** the scan's rules (`rim-gap`, fitting-side tip counts) look as though they need a
region internally. If so this depends on ask 3. We have no Rust source vendored and cannot check.

**3. `dental_region_from_rim`** — already asked for in `geocore-region-from-drawn-rim.md`. It becomes
a prerequisite here too, because the print-angle confirm only accepts a two-contour policy
(`src/dental/confirmTilt.ts`).

## How the host will know these landed

`src/vendorCapabilities.test.ts` watches for each symbol and **fails when it appears**, carrying the
undo list in the message. A workaround that keeps passing is exactly how a delivered capability goes
unnoticed, so the check is inverted on purpose.

## What the host does until then

Nothing is stubbed and no seam is built for this — the watch announces arrival, and a placeholder
would be code with no caller. The honest interim behaviour is already in place: a drawn-rim aligner
goes to Step 2 at its drop orientation, and the controls that cannot act are shown-and-disabled with
the reason beside them rather than live-and-inert.

**Proof to run when they land:** a `u5`-style walk on a shape with no findable rim — draw, Done, and
Step 1 must show the tilt dial with a pick and an Auto orientation button, instead of asking the
operator to turn the aligner by hand.
