# `src/supports/` — what a support edit MEANS

Eighteen files, and fourteen of them are tests. That ratio is the point of the folder: **this is where
the rules that need no renderer live, so they can be proved without one.** The engine builds supports
in Rust and the viewports draw them; what is decided here is what an operator's edit does to the
scene.

| file | its one job |
|---|---|
| `tipMove.ts` | what a drag on a support tip means: may this press begin one, what the release meant, what commands it makes |
| `selection.ts` | a list of selected contact ids into commands — manual ones removed outright, automatic ones recorded as `deleted` |
| `useSupportEdits.ts` | the pointer's effect on supports (add, remove, pick, move), lifted out of `App.tsx` as one hook |
| `buriedCache.ts` | a runtime-only record, per unit, of the contacts the overlap rule dropped, kept in the unit frame |

**`tipMove.ts` and `selection.ts` are pure and both viewports ask them.** That is not tidiness: the
owner's requirement is that the two renderers behave identically, and the way to get that is to share
the decision rather than to match behaviour. `src/components/viewport/UnitObject.tsx` and
`src/components/viewport/babylon/tipMove.ts` are both adapters over `tipMove.ts`, and the day a rule
moves into one of them the two views start to drift — which happened, and is written up at
`movePress`'s `nearest` field.

**`useSupportEdits.ts` is the stateful one**, and it is a hook rather than a module because it needs
the scene, the dispatcher, the selection and the status line. It converts world coordinates into the
unit's own frame (`inverseTransformPoint`) in exactly one place, so a viewport that handed over a
local point would be converted twice and land somewhere else entirely — a fixture at the origin
cannot tell those two frames apart, which is why the types are kept apart by NAME (`TipTarget` is
unit-local, `TipDrop` is world) rather than by structure.

## What the tests hold to account

The heavy ones are parity and export, and they are here because a support that is wrong on disk is
the only defect in this app that reaches a printer:

| file | what it refuses |
|---|---|
| `rustSupports.test.ts` · `safetyParity.test.ts` | the Rust build drifting from the recorded results of the TS builder it replaced, permit / build / body-check / repair included |
| `exportBytes.test.ts` | an STL that only our own writer can read — it is read back by something else, so the codec cannot agree with itself |
| `export.test.ts` | the Z-up / Y-up conversion changing anything on the round trip, and the wrong things being exported |
| `liftPlate.test.ts` | a lift as a plate offset differing from a fresh generate at that lift |
| `jobRunner.test.ts` · `jobRunnerDentalAlternates.test.ts` | zones read in the wrong frame, landings cast in the wrong one, and gap alternates becoming extra primary tips |
| `knotIslands.test.ts` | an island verdict turning confident on a non-manifold mesh, where it must stay inconclusive |
| `landing.test.ts` | objects regenerated together landing as separate steps |
| `tipMove.test.ts` · `selection.test.ts` · `zones.test.ts` · `unitSupports.test.ts` | the four pure rules above, each without a viewport |

`src/components/README.md` maps the hooks that call these; `src/deck/README.md` maps the deck's own
build queue, which asks the same rules for a card nobody has opened.
