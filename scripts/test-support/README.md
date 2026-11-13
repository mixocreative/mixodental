# scripts/test-support/ — the map

Twenty-four files, and **none of them is a test.** They are what the vitest suite imports so that
a test can say what it means in one line instead of twenty. Two of them (`legacyDecimate.test.ts`,
`matrix.test.ts`) test the harness itself, because a harness with a bug makes every test that uses
it lie.

`EGM.md` records the review this folder has had.

**The warning this folder exists to carry:** a stub or a helper that quietly returns a neutral
value makes a probe report OK without measuring anything. A stubbed `Matrix.Scaling` here once had
no `.m`, so every bake recorded ×1 and the check passed vacuously. When a test built on one of
these goes green, the question is not "did it pass" but "what number did it actually see".

## Running the engine from a test

| File | Job |
|---|---|
| `useNodeEngine.ts` | the engine, loaded for node. The entry point most harnesses start from |
| `rustImport.ts` | `importStl`, `weldRawMesh`, `weldPositions` — getting a mesh in the way the app gets it |
| `rustSupports.ts` + `rustSupportsCases.ts` | `buildSupportMesh` and the standard cases (boxes, painted regions) |
| `supportBuildCall.ts` | `buildSupportsWasm`: the wasm call with its options, so a test does not assemble them by hand |
| `supportParityHarness.ts` | **the host-vs-wasm comparison.** Scenarios, structures, and the inputs both sides get. This is what proves the two paths agree, which is the only reason a host-side change can be trusted |
| `tolerateRpcAckTimeout.ts` | the one known-flaky RPC ack, tolerated explicitly and named — not swallowed |

## Golden comparison

| File | Job |
|---|---|
| `golden.ts` | `hashArray`, `exactArray`, `approxArray`. **The tolerance is the test's decision, written at the call site** — an `approxArray` with a tolerance nobody chose is a test that cannot fail |
| `buildSnapshot.ts` | `buildSnapshot` and its stride: the compact form a build is recorded as |
| `dentalSnapshots.ts` | `regionSnapshot`, `positionId`, `idsHash` — the dental equivalents |
| `recordedKnot.ts` + `knotRays.ts` | `knot.stl` as recorded, and seeded rays over it. **`knot.stl` is not one solid**: 588 connected components, 8,666 non-manifold edges, its two biggest shells interleaving. Any reasoning that treats it as a single part is wrong, and treating it as one cost 92% of a build's supports once |

## Dental expectations

| File | Job |
|---|---|
| `dentalPolicyOf.ts` | the policy a case resolves to |
| `dentalExpect.ts` | `rotationToPlateDown` — the assertion a dental orientation test actually wants |
| `dentalFaceLabels.ts` | face labels, built and run |
| `referenceProfile.ts` | `REFERENCE_PROFILE`, `referenceTuning`, `footprintSettings` — the numbers the dental rules are checked against |
| `referenceStep3.ts` | one worked case: mesh, dental settings, placed result |

## Geometry and policy helpers

| File | Job |
|---|---|
| `matrix.ts` (+ its test) | `quaternionFromEuler`, `placementMatrix`, `invertMatrix`. Tested because a transform helper that is subtly wrong makes every downstream number wrong by the same amount, which looks like agreement |
| `legacyDecimate.ts` (+ its test) | the old decimation, kept so a comparison against it is possible |
| `handWork.ts` | the hand-placed reference work a test compares against |
| `testPolicy.ts` | `testPolicy` — the settings a test runs under, in one place rather than per file |
