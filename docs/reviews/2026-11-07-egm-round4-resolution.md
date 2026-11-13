# EGM round 4 — resolution

Two swarms, split at the plan's real boundary. Feature spec (§0–§7): 11 🔴 / 26 🟡 / 15 🟢, five
reviewers. Implementation plan (§8–§9): 24 🔴 / 23 🟡 / 12 🟢, five reviewers. Reports:
`docs/reviews/2026-11-07-egm-round4-feature.md`, `docs/reviews/2026-11-07-egm-round4-implementation.md`.

**The bar is not met and this round proves it, so the honest headline is: zero of the seven unstarted
steps were startable from the text alone.** Round 4 was not a polish round.

## Verified against the tree before adopting

This session has already paid for adopting reviewer claims unverified — four false statements in an
earlier round. Every finding below was checked against code, not prose.

| Claim | Verdict | Evidence |
|---|---|---|
| `diagnosis.ts` has 7 fields and Picks 5; prose says 6 and 4 | **CONFIRMED (mine)** | `src/state/diagnosis.ts:38` lists five in the `Pick`, plus `longestRimMm` and `bodyCount` |
| Engine 63 is vendored; §3 said not | **CONFIRMED** | `vendor/mixo-geocore/SOURCE.json` `engineVersion: 63` |
| `ROW_STATES` is nine; plan said eight, twice | **CONFIRMED** | `src/items/rowState.ts:65-66` |
| `MAX_FILL_LOOP_MM` exists nowhere in `src/` or `vendor/` | **CONFIRMED** | only two `console.log` strings, `measure-rim-loops.mjs:129,137` |
| Section `s` range wrong a 4th time | **CONFIRMED** | `s1` at `walk.mjs:2331`, `s19` at `2486`; doc said 2268–2424, cutting off `s14` at `2425` |
| A live dental session slices a drop to one file | **CONFIRMED** | `App.tsx:692` `.slice(0, dentalDrop ? 1 : undefined)` |
| The Items loop cannot reach item 2 | **CONFIRMED** | `acceptsDentalDrop` needs stage `aligner` (`editingMode.ts:353`); `dentalLoading` is a no-op outside it (`:230`); `startAligner`'s `stale()` needs `activeUnitId === unit.id` |
| `startDental` resets `dentalFinished: []` | **CONFIRMED** | `editingMode.ts:219` |
| `UnitBuild<KeptBuild>` right but a uniform widening won't compile | **CONFIRMED** | `usePlateArrange.ts:16` wants `mesh: GeneratedSupportMesh`; `useExport.ts:26` wants `UnitBuild`; `plateLayout.ts` `Builds` read at `plateFootprints` |
| `UnitBuild<BuiltSupports>` has no `footprint` | **CONFIRMED FALSE in an earlier round** | the doc already carries the correction |
| Step 0 still calls `g` deterministic | **CONTEST** | L875 says "it is **not deterministic**"; L879 lists "deterministic" among corrected errors (`19531de`) |

## Applied

1. **§3's status header** — said "Not vendored — the tree is engine 61. App side unstarted." three
   rounds after both became false. Rewritten, with a line on why a status nobody re-reads is worse
   than none.
2. **`fill-disabled` inverted** — "unreachable once step 5's constant exists" is backwards: at limit 0
   it is universal, and §3's own table said so 38 lines later.
3. **The classifier's home** — `src/import/` → `src/items/rowState.ts`, with the `importOracleBoundary`
   reason.
4. **Eight → nine row states**, both places, and both now say *iterate `ROW_STATES`* rather than carry
   a count that has been wrong at every revision.
5. **Walk ranges and check IDs** corrected, with an instruction not to trust the new numbers either.
6. **The gate** — "no new failures beside `g` and `s17`" is withdrawn. `s17` is fixed and the full walk
   is `ALL PASS` (153 checks at `83a4998`). The criterion is plain `ALL PASS`; a run where `g` alone
   fails is re-run, not accepted.
7. **Step 5's exit was false.** No constant exists. Recorded that none should: at a measured 0 it would
   be a parameter with one value and no caller. Step 9 passes a literal `0` citing the measurement.
8. **Step 9 must replace `PrintUnit.diagnosis`** — otherwise the `triangles` gate drops the verdict on
   the next reload, on the one file the operator just acted on. Also: `verdictOfRepair`'s
   `RepairResult` is unpersistable, so four of nine states cannot survive a reload —
   **recommendation: collapse to the three `diagnose_mesh` states**, because a row saying what the mesh
   *is* cannot go stale. And the capacity re-check keeps its place but loses its reason: "filling adds
   triangles" is impossible at limit 0; non-manifold splitting is the real one.
9. **Step 11** — the union-with-discriminator work, all five consumers named, and it adopts the
   measured cap of 8 instead of leaving it ownerless.
10. **Step 7b** — the loop blocker written out with its mechanism, the needed session event named as
    the `exportedDental` analogue, item 1's entry flagged as unstated, the one-file slice recorded, and
    its exit corrected: whole-walk `ALL PASS` is **7d's**, not 7b's.

## Settled by the owner after this round

**Step 9 (repair on a press) is CUT from this release**, with the condition for its return stated:
a holed scan has to exist. At a measured fill limit of 0 the only operation repair can perform here
is non-manifold splitting, and that is not worth a step that must also invent a worker protocol
message, a `SceneCommand` replacing `unit.source`, and a 4x-import memory peak.

Followed through rather than deleted:

- §0's memory claim now says the release holds **no** transient copy per file, because nothing asks
  for one.
- §3's pre-press table reports instead of offering a press; its post-press table is marked not
  reachable and kept, because `rowState.ts` already implements and tests it.
- **Step 6a drops from nine row sentences to five** (`unreadable`, `too-big`, `clean`, `holes`,
  `malformed`), derived from `ROW_STATES` minus the four only a repair can produce — not listed by
  hand, which is how the count went wrong at every revision.
- The reload question disappears: the four unpersistable states were the only rows the project file
  could not rebuild.
- `PrintUnit.diagnosis` cannot go stale this release, since nothing replaces `source`. The `triangles`
  gate stays anyway — one comparison, and it is what makes repair safe to write later.
- Step 9's full brief is kept in place, labelled as the brief for its return, so round 4's findings
  are not re-derived when it comes back.

## Still open — judgment, not fact

- **§7 does not specify the UI it exists to specify.** Ten user-visible strings have zero locale
  entries, neither new page has a layout, and "preview" appears once and is defined nowhere. If it is
  rendered geometry it is the feature's only new per-row memory cost, against §3's own argument.
- **Step 9 is the weakest step in the doc** — no file, no worker side, no protocol message
  (`ImportTask` is `stl|weld` only), and no `SceneCommand` replaces `unit.source`. Its memory cost is
  roughly 4× the import peak.
- **Appliance vs Purpose** on the Drop page is still a §9 "Recommendation", and it is the one open
  item that genuinely blocks starting 7a.
- **The reservation grain** is still delegated ("Decide which; do not leave it"), and L802 contradicts
  L790.
