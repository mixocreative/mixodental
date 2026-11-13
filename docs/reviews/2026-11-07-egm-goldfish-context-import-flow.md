# Goldfish context — review of `docs/design/2026-11-07-import-and-items-flow.md`

A reading list, not a summary. Each reviewer starts with no history of the conversation that produced
the doc, so this is the baseline needed to judge it. **Read the files; do not take this file's word
for what they contain.**

The doc is a **plan**, not a shipped feature. It marks each section built / decided / unstarted, and
some of what it describes is uncommitted in the working tree. Judge it as a plan: are the decisions
sound, are the claims about existing code true, is anything missing, is it modular.

## The single most useful question to ask of this doc

**It is dense with specific claims about existing code** — file paths, line numbers, function
behaviour, allocation sizes. Those claims carry the argument. The author got two comparable claims
wrong earlier in the same session, in both cases by reasoning from a type or a comment instead of
reading the call site. So: **verify the claims, do not accept them.** Any that is wrong probably
takes a decision with it.

## Files the doc makes claims about

| Read | For the claim that |
|---|---|
| `src/scenes/sceneMap.ts`, `src/scenes/README.md` | three scenes, `FLOW_END`, `doors`, `scope`; a disabled scene must name an enabled fallback |
| `src/scenes/sceneMap.test.ts` | the invariants above are actually tested |
| `src/bench/benchScene.ts`, `src/bench/README.md`, `src/bench/benchScene.test.ts` | the bench's three properties: nothing locked, canvas gesture `none`, every exit lands there |
| `src/progress/progressTypes.ts`, `src/progress/README.md` | three waiting types; no invented percentage; shape follows the measure; a row borrows `ProgressIndicator` rather than becoming a fourth type |
| `src/dental/editingMode.ts` | `reviewWayOn()` is the single decision; `dental.finish` vs `dental.export` visibility; `dental.exit` is NOT routed through `FLOW_END` |
| `src/components/DentalSupports.tsx`, `src/denture/steps/supports/DentureReviewPanel.tsx` | both review footers ask `reviewWayOn()` instead of naming a command |
| `src/components/StartScreen.tsx` | the three start screens and their order; `held` already carries a file dropped before the type is chosen; the *Any model* key |
| `src/ui/ChoiceKey.tsx`, `src/components/Segmented.tsx` | `note` exists but the start keys have none; `Segmented` has `disabled` |
| `vendor/mixo-geocore/host/dental/alignerProfiles.ts` | `ALIGNER_PROFILES` carries `name[lang]` and `description[lang]` |
| `vendor/mixo-geocore/host/supports/export.ts` | `planExport` reads only contacts from the build; `encodeStl` allocates ONE `ArrayBuffer(84 + triangles * 50)`; the five `ExportKind`s |
| `src/components/useExport.ts` | `runExport` returns void and reports refusals only through the status line |
| `vendor/mixo-geocore/host/workers/buildSessions.ts` | `forget(unitId)` frees the unit's session and every handle; `site()` re-creates when `sourceToken` differs |
| `vendor/mixo-geocore/host/workers/meshClient.ts` | a job whose unit was removed resolves undefined |
| `src/App.tsx` (around 480, and 1076–1115) | the reconcile against `scene.units` that drives release; the dental exit / finish / export command handlers |
| `src/components/useProjectFile.ts` | the `beforeunload` warning |
| `scripts/walk.mjs` | `enterEditor` (~219) clicks *Any model*; section `s` (~2238–2393) specifies the three-screen order; `walkLocale` (~2432+) runs only under `WALK_LOCALES` |
| `docs/design/ui-structure.md` §2.1, §2.3, §4.1 | the shell's regions; the bench as "No mode (setup)"; the rule that the tool, method, switch and sizes survive mode changes |
| `docs/ui-styling.md` | the token table, the bench section, the three waiting types |

## The engine side, which is NOT in this repository

Engine 62 is committed in a separate repo (`S:\ai\mixo-geocore`, commit `6c37d20`), **unpushed and
unvendored**, so `vendor/mixo-geocore` here is still **engine 61** and contains none of it. Do not
look for `diagnose_mesh`, `repair_mesh` or `repair/` in this checkout — their absence is expected and
is not a finding. Judge §3 of the doc on its reasoning, not on code you can read here.

What it provides, per the engine session's own report: `diagnose_mesh` (report only, allocates no
mesh) and `repair_mesh` (returns a new mesh, never mutates). Weld reuses the existing
`Tolerance::Weld`; a new `Tolerance::BodyGap` is 0.005 mm; noise shells under 0.001 mm³ are reported
and never dropped. The body invariant is enforced at runtime: a step that would move a face between
bodies abandons the repair and returns the file unchanged.

For comparison, the existing cleanup it builds on is real and readable here:
`vendor/mixo-geocore/host/core/removeDegenerate.ts`, whose comment says *"Explicit repair, never
implicit"* — the doc proposes departing from that rule, so whether it justifies the departure is fair
game.

## Project rules the doc must not violate

- **Lowest peak memory.** Print files are huge; the real aligner fixture is 373,956 triangles.
- **Every engine change runs the real-scan gate** (`npm run gate:real`, 13 local scans).
- **No third-party slicer names** anywhere. Neutral wording only.
- **zh-Hant is Taiwan wording**, never mainland terms; new UI strings need en / ja / zh-Hant.
- **Every step its own module**, with docs, tests, and the README map updated.
- **Every UI element gets a unique stable `data-ui`.**
- **Never ask the owner a question without a recommended answer.**
- Guards that will fire on sloppy work and are worth knowing exist: `uiStylingDoc.test.ts`
  (undocumented CSS tokens), `noColourLiterals.test.ts`, `glossary.test.ts` (per-language concept
  terms), `i18n.test.ts` (scrapes single-quoted literals — an apostrophe in a comment breaks it),
  `japaneseSubset.test.ts`, `geometryGuard.test.ts`, `commandWiring.test.ts`.

## Known-open items the doc already declares — not findings

The doc's §8 names these. Re-reporting them adds nothing:

1. `src/scenes/README.md` still says multi-file makes Start `scope: 'object'`. The doc says this is
   wrong and to fix the line. It is a known, declared inconsistency.
2. `ledger`'s `place` string in `progressTypes.ts` needs widening to cover the Items list.
3. Whether *Appliance* is the right word for level 1, given that a plain model is not an appliance.
4. Whether the host should ever offer to drop a noise shell.

## What would be genuinely useful to find

- A claim about existing code that is false.
- A step in §7's sequence that depends on something later in the list.
- A place where the two-level naming (Appliance / Type) collides with existing vocabulary.
- Anything in §5 (memory release) that the scene-driven reconcile does not actually cover.
- A module boundary that is drawn in the wrong place, or a step that should be its own module and is
  not — the owner's question when commissioning this review was literally "no gaps, and all well
  modularised?".

## Rubric items to leave alone

A previous review of a sibling doc in this project produced, and its own final stage then rejected, a
class of findings that were artefacts of the rubric rather than defects: *split the document*, *add
Goals / Risks / Non-goals headings*, voice and tone items. They were right to be rejected. Judge
structure only where it genuinely impedes a reader.

**And ask the last stage which earlier findings were wrong or overstated.** On the previous review
that question refuted one finding outright (a reviewer repeating a false code comment as fact),
demoted two, and rejected the class above. It is the highest-value question in the whole flow.
