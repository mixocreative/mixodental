# Handoff to mixo-geocore: a job stuck at 100 % must stop looking finished

**For:** `mixocreative/mixo-geocore`, `host/workers/jobActivity.ts` (vendored here at engine 62,
`vendor/mixo-geocore/host/workers/jobActivity.ts:221`).
**From:** mixoDental, 2026-11-09. Found by fault injection: `npm run walk -- --only=r --probes=r4`,
G7 in `docs/reviews/2026-11-09-wiring-walk-dental-flow.md` §6b.
**Why it is here and not fixed in the host:** mixoDental consumes `host/` and `editing/` **as built**
and never edits them (`scripts/vendor-geometry.mjs`; every vendored file is hashed in `SOURCE.json`,
and `npm run vendor:check` fails on an edit). So this is written down rather than patched locally.

## What the injection did

The walk swallows every settling reply from the analysis worker (`window.__faultHold`), which is a
worker that finishes its work and whose answer never arrives — the shape of G7, a background job that
has stopped. A dental batch of two models was started and left for twenty seconds, far past the one
or two a row's orientation normally takes.

## What the operator saw

```
background work: ["Checking A r-cube · Aligner oriented 100% Cancel"]
deck rows:       ["Checking the orientation…", "Waiting its turn…"]
```

The deck rows are right: pending, and honestly pending. The **background-work row is not**. It reads
`Aligner oriented`, it shows a **full bar at 100 %**, and it will do so for as long as the job is
stuck. Nothing on it says how long it has been there. A job that has finished and a job that will
never finish draw the same row, which is the one thing the row exists to distinguish.

## Why the control that should catch this cannot fire

`JobActivity.view` already has the signal — and it is wired to the one state that does not need it:

```ts
showElapsed: state === 'indeterminate' && age >= LONG_JOB_MS,
```

A job only becomes `determinate` once it reports progress. So:

- a job that reports **no** progress and runs long → indeterminate → shows `{time} so far`. Good.
- a job that reports progress and then **stops** → determinate → never shows elapsed, and
  `remainingMs` is computed from the fraction, which is 1, so it has nothing to say either.

The second case is the one a stalled worker produces, and it is the one with no signal. This is a
control that is live, tested, and unable to fire for the failure it was written for.

## The ask

Make `showElapsed` depend on the job being STUCK rather than on it being indeterminate. The datum is
already recorded: `entry.firstProgress.at` and `entry.fraction` are kept, so a job's last movement is
known. Something of this shape, with the threshold geocore's own UX rules prefer:

```ts
// A determinate job that has not moved for this long is stuck, whatever fraction it stopped at.
showElapsed: age >= LONG_JOB_MS && (state === 'indeterminate' || now - lastProgressAt >= LONG_JOB_MS),
```

which needs one new field on the entry (`lastProgressAt`, set wherever `entry.fraction` is set).

**The secondary ask, if it is cheap:** a determinate bar should arguably not render 100 % until the
job settles — 100 % means done, and this job is not. Capping the drawn bar just under full until
`endedAt` is set would remove the stronger half of the wrong impression. The host has no opinion on
which of the two is the better fix; the measurable requirement is only that the two rows differ.

## What is NOT being asked

Nothing about cancellation: the row **does** offer Cancel (`AnalysisClient` passes a controller
signal, so `cancellable` is true), the operator is not trapped, and the walk asserts that the deck
stays usable throughout. This is about the row telling the truth, not about a way out.

## How to prove it fixed

`npm run walk -- --only=r --probes=r4` in mixoDental against the new vendor drop. The probe reads the
background-work rows while the detector is stopped; a fixed build shows an elapsed time on that row,
and `r4`'s check can then be tightened from "the deck still works" to "the stalled job says how long
it has been stalled".
