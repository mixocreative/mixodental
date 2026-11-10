# Handoff to mixo-geocore: build a `DentalRim` from operator-drawn points

> **DELIVERED, 2026-11-06 — geocore engine 61, commit `8bd2430`.** This ask is answered and the host is
> wired to it (`src/dental/rim/drawnRim.ts`). Kept as the record of what was asked and why.
>
> **What came back differed from this document in two ways, both measured rather than argued:**
> 1. **The opening sign** is decided by `orient::floor_offset`, the measure detection already uses —
>    not by the two-way centroid raycast suggested here, which barely separates through a thin shell.
>    Below the profile's threshold the engine returns `rim-side-uncertain` and leaves the flip to the host.
> 2. **A drawn rim does not reproduce a detected one.** Feeding the reference aligner's own detected
>    loop back gives an axis **5.60°** from detection's, because detection's axis is the shell's
>    least-variance axis, not the plane of the loop it traced. The side agrees; the axis does not, and
>    cannot. Masks 5104 cells against 5089, agreeing in 8919 of 9216 — all pinned in the engine's test.
>
> The delivered signature is
> `dental_rim_from_points(model, points, flip, profile) -> DentalRimResult`, and the complete
> `reason()` set the host branches on is `"rim-collinear"` (failure) and `"rim-side-uncertain"`
> (success, side undecided). `"rim-too-few-points"` exists in the Rust enum but is unreachable through
> the ABI; everything else throws.


**For:** `mixocreative/mixo-geocore` (vendored here at engine 60, commit `d2754369`).
**From:** mixoDental, 2026-11-05. Design: `docs/design/2026-11-05-rim-define-mode.md`.
**Why:** mixoDental is adding a mode where the operator draws the rim by hand when detection cannot find
one. The host can do all of it except the one part only the engine can do.

## The ask

One call. Same shape as an orientation result's rim, built from points the operator drew instead of from
detection:

```
dental_rim_from_points(
  positions: Float32Array,   // unit-local mesh, as every other dental call takes it
  indices: Uint32Array,
  anchors: Float64Array,     // the operator's ordered anchor points, xyz each, unit-local, ON the surface
  openingHint: Float64Array, // xyz unit vector: which side the operator says the opening faces (see below)
  profile: string,           // aligner profile id, for the same thresholds detection uses
) -> DentalRimFromPointsResult
```

Result, mirroring `DentalOrientResultLike` so the host decoder is the one it already has
(`host/dental/dentalEngine.ts:310` `rimScalars` / `:321` `rimOf`):

```
status(): number            // 0 built, 1 refused
reason(): string            // a stable CODE, not prose - see "Reasons" below
rim_scalars(): Float64Array // the existing 22-number layout, unchanged
take_rim_points(): Float32Array
take_visibility_mask(): Uint8Array
free(): void
```

## The input is a general surface loop, not an aligner thing

Worth saying because it may shape where you put this. On the mixoDental side the drawing is **not** a dental
feature: a closed run of points on a model's surface is a general capability (`src/core/surfacePath/`,
portable and engine-free), and the same list with the join removed is an open path reused elsewhere. The
dental rim is its first consumer.

So `anchors` is just an ordered loop of surface points. If geocore would rather expose the general shape —
"fit a frame and rasterise a visibility mask for this loop on this mesh" — with `DentalRim` assembled from
it on the dental side, that suits this caller equally well and would serve a denture or a future aligner
type without a second call. The dental-specific parts are only `profile` and the `DentalRim` packaging.

## What the host sends, and guarantees

- **`anchors` are already on the surface.** Each one is a raycast hit against this same mesh
  (`src/components/viewport/rustRaycast.ts`, i.e. the engine's own `session.pick`), converted to unit-local.
  The host does not send points floating in space. If a tolerance check is wanted anyway, refuse rather
  than snap silently.
- **Ordered, and closed implicitly.** Anchor *n* joins anchor *0*. The last point is not a repeat of the
  first, matching `DentalRim.points`' own rule.
- **At least 3**, validated host-side first; the refusal is here as a backstop.
- The host has already refused a loop that self-intersects when projected into its own plane, has a
  degenerate enclosed area, or whose anchors are collinear — `src/core/surfacePath/validate.ts`, with the
  same codes this document asks for. Again: backstop, not primary.

  One warning from writing that validator, in case the engine does the same checks: do **not** fit the
  loop's plane with Newell's method. It sums signed areas, so a self-crossing loop cancels — a symmetric
  bowtie gives an exactly zero normal, and the loop then looks collinear rather than self-crossing. Fit the
  plane from the anchors furthest apart and measure the area separately in it.

## What only the engine can do, and why this call exists

`DentalRim.visibilityMask` is a 96 × 96 orthographic raster of projected mesh depth in the rim frame. The
host cannot produce it:

- Nothing in the binding surface builds a mask. Across `GeometrySession`, `DentalEngine` and
  `DentalInternals` it only ever comes *out* of orientation, via `take_visibility_mask()`
  (`dentalEngine.ts:22`). There is no `mask_from_rim(mesh, frame)`.
- It is **not optional**, and not ignorable even for a hand-painted area. Measured on the shipped reference
  aligner, calling `dental_allowed_vertices` with one allow stamp and varying only the mask:

  | `manualArea` | mask | allowed vertices (of 186 976) |
  | --- | --- | --- |
  | true | the real mask | **1804** |
  | true | all zero | **0** |
  | true | all one | **2018** |
  | either | zero-length | throws `INVALID_LENGTH` |

  So a blank mask is a silent dead end — the operator paints and nothing is ever permitted, with no error —
  and an all-ones mask admits supports where the cavity opening cannot reach, which is a print-safety
  fault.

A TypeScript reimplementation of that raster was considered and rejected: it would be a second source of
truth for a safety-relevant mask, needing to track the Rust rasteriser through every engine bump, with no
test able to prove agreement beyond the fixtures that happen to exist.

## What the engine should do with the anchors

1. **Densify along the surface** between consecutive anchors, so `take_rim_points()` returns a dense loop
   comparable to a detected one (the reference aligner's detected rim has 158 points). The engine has the
   mesh and the raycaster; doing it here keeps one definition of "the curve follows the model". If the
   engine would rather receive the dense loop, say so and the host will send it instead — but then the two
   repos each own half of the curve, which is worse.
2. **Compute the frame** — `centroid`, `openingDirection`, `tangent`, `bitangent` — from the loop, the same
   way detection does once it has a boundary.
3. **Rasterise the visibility mask** with the existing code path, and fill `visibilityResolution`,
   `visibilityMin`, `visibilityMax` to match.
4. **`boundaryKind` must come back as `projection-fallback`** (scalar 0 = `1`). A hand-drawn rim has not
   earned `lower-edge-loop`, which certifies two sharp terminal loops were found. `projection-fallback` is
   already what the shipped reference aligner's own rim reports, so it is not a lesser class in practice.
   If a distinct third kind (`operator-defined`) is wanted so consumers can tell them apart, that is a
   `DentalRim` type change and a separate decision — say which you prefer.
5. **`front` must be absent.** It exists for pose estimation, and this flow switches auto-orientation off
   entirely: a self-defined rim means no re-detection and no print-angle scan.

   > **SUPERSEDED, 2026-11-10.** The owner reversed the decision this rests on. "Auto-orientation off
   > entirely" was right when a drawn rim could not produce a frame; engine 61 made it one, and a probe
   > on this engine shows `dental_rim_from_points` + `dental_pose` returning a rotation 5.60 degrees
   > from `orient_dental`'s on the reference aligner. What a drawn rim should get is the same dial and
   > scan a detected one gets. The asks are in
   > [`geocore-orient-from-drawn-rim.md`](geocore-orient-from-drawn-rim.md), including the open
   > question this point raises: whether an OPEN (non-ring) arch needs a `front`, and whether the
   > engine derives it from the loop or wants a hint.

### `openingHint`, and why the host sends it

A plane normal has two directions and only one points out through the opening. Deciding it from the drawn
winding would silently depend on which side the operator's camera happened to be on, so the host asks the
operator and shows the answer as a flippable arrow.

Treat `openingHint` as authoritative for the **sign** only: compute the plane normal, then flip it to the
hemisphere `openingHint` points into. Do not re-derive the side. If `openingHint` is not a finite unit
vector, refuse with `BAD_OPENING_HINT` rather than guessing.

## Reasons (stable codes, not prose)

Please return codes, not sentences. mixoDental ships in English, Japanese and Taiwan Chinese, and a Rust
sentence would be the only untranslated text in the app:

`TOO_FEW_POINTS`, `SELF_INTERSECTING`, `DEGENERATE_AREA`, `COLLINEAR`, `POINT_OFF_SURFACE`,
`BAD_OPENING_HINT`, `MASK_FAILED`.

This is the same ask as the one already outstanding for `orient_dental`'s own failure `reason()`, which
returns prose today and so cannot be shown to an operator in their language. Both would be fixed by the
same convention.

## How to verify it

The reference aligner makes this checkable against ground truth, which is unusual and worth using:

1. Orient `docs/dental-reference/reference-aligner.stl` normally. Keep its detected rim — 158 points,
   `projection-fallback`, mask 5089 of 9216 bytes set, `visibilityResolution` 96.
2. Feed a subsample of those same rim points back in as `anchors`, with `openingHint` set to the detected
   `openingDirection`.
3. The returned frame should match the detected one closely, and the returned mask should match the
   detected mask closely. Exact equality is not expected from a subsampled boundary; a large divergence
   means the frame or the raster is being derived differently.
4. Then `dental_allowed_vertices` with one allow stamp should admit a count near the detected rim's **1804**
   — not 0, and not the 2018 an all-ones mask gives.

## What mixoDental does meanwhile

The mode is being built against this call. Until it exists, the mode's **Done** refuses with a plain
sentence rather than pretending: the operator can draw, adjust, close and validate a rim, and the handover
to Free transform is blocked at the last step. Nothing ships a blank or full mask as a stand-in.
