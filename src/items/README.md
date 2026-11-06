# src/items: what a dropped file's row says

The Items page shows one row per dropped file. This module decides **what that row says** — and
nothing else yet. `rowState.ts` is pure: no React, no DOM, no strings. It returns a state and the
numbers that state needs; the UI picks the words.

Plan: `docs/design/2026-11-07-import-and-items-flow.md` (§3 for the states, §8 step 6 for this piece).

## The nine states, and why there are nine

Three sources, because half of what a row can say never reaches the engine at all:

| From | States |
|---|---|
| **A file that never became a mesh** | `unreadable`, `too-big` |
| **`diagnose_mesh`**, before any press | `clean`, `holes`, `malformed` |
| **`repair_mesh`**, after a press | `refused`, `unchanged`, `repaired`, `repaired-open` |

Each group is a **partition** — the conditions cannot overlap and cannot all miss — and a test proves
every state is reachable and that the declared list and the reachable set are equal.

That matters because an earlier revision of the plan got it wrong twice. Its first table was not
mutually exclusive, so a holed file matched the row reading *"Clean. Nothing to do."*; the fix made
the rows exclusive but not exhaustive, so an untouched file fell through to *"Repaired."* Both are
false statements about a file the operator is about to print, which is why the set is tested rather
than described.

## Two states the measured scans actually produce

`scripts/measure-rim-loops.mjs` ran `diagnose_mesh` over all 18 local real scans:

- **Zero open boundary rims.** So `holes` is the state this corpus never reaches, and the fill limit
  is **0** — fill nothing — because no rim exists to justify any other number.
- **8 of 18 files have non-manifold geometry**, up to 5,547 non-manifold edges and one file reporting
  525 bodies. Several are **not watertight with no hole in them**.

So `malformed` is the common case, and `watertight` is *not* a synonym for "no holes" — which is the
whole reason `clean` checks `watertight` rather than counting loops.

`unchanged` is on the common path too, not a curiosity: with the fill limit at 0 every loop reports
`fill-disabled`, and `fill-disabled` is **not** a refusal, so a repair can legitimately run, succeed
and change nothing. Calling that "repaired" would be the same class of lie as the two above.

## Why it is not under `core/import/`

It was written there first, on a reviewer's suggestion, and `importOracleBoundary.test.ts` refused
it: that folder is pinned to exactly `estimate.ts` and `stlHeader.ts`, because the TypeScript import
geometry was deliberately moved to Rust and the guard stops it creeping back. Widening the guard's
list would have weakened a boundary that is doing its job.

It belongs here regardless. The importer produces a report; this turns a report into a row.

## Not here yet

The page, the row component, its `data-ui` names and the three-language sentences — §8 steps 6a and
7b. `offersRepair()` is the one piece of policy already decided: a refusal never re-offers the press
that just failed.
