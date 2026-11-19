# Dental kinds and types — the app's side

**The source of truth is in the engine**, not here:
`mixo-geocore/crates/geometry-core/src/dental/ADDING-A-KIND-OR-TYPE.md`. It covers what a kind and a
type each are, the exact procedure for adding either, how to add a detection or orientation rule,
and **the Witness** — the detection reviewer and its protocol.

This page is only what mixoDental has to do once the engine change has been vendored. Read the
engine page first; this one will not make sense on its own.

## The two words, as the app uses them

- **Category** = the engine's `DentalKind`: aligner or denture. The operator answers this per file.
- **Type** = a profile id within a category. The app shows it as a **readout** of which numbers the
  engine will run with — pillar diameter, contact size, tilt rule.

Both are drawn by one control, `src/components/PurposeSelect.tsx`, on the deck and on `Set all`.

## The single UI list

`src/components/purposes.ts` is the only place the app names either, and it **derives** rather than
repeats:

| What | Where it comes from |
|---|---|
| the categories | `DENTAL_KINDS` from the engine |
| each category's default profile | `defaultProfileId(kind)` |
| the types in a category | `profileIdsOf(kind)` |
| a type's name | the profile's own `name` in the reader's language — **not an i18n key** |
| a category's picture | `LABELS` in `purposes.ts` → an art name |
| a type's picture | `TYPE_ICONS` in `purposes.ts` → an art name |

**Only the two picture tables are the app's own.** Everything else arrives with the vendored engine,
so a new type appears in the UI with no code change except its drawing.

## After vendoring a new TYPE

1. **Draw it, or reuse the letter G.** Both profiles today are the general-purpose one and share
   `generic-type`, because a drawing of a product would overclaim what a generic profile is.
2. Add the file to `src/ui/assets/art/` and an entry to `src/ui/iconCatalogue.ts` — a drawing with
   no catalogue entry fails `iconCatalogue.test.ts`.
3. Map the profile id in `TYPE_ICONS` (`src/components/purposes.ts`).
4. Check nothing hard-codes the old name. `ItemsPage.test.tsx`, `DentalBar.test.tsx`,
   `OrientationBar.test.tsx`, `stepOneText.test.ts` and `ChoiceKey.test.tsx` have all carried a
   profile's display name in an expectation at some point; renaming "Reference aligner" to "Generic
   aligner" broke four of them, which is the suite doing its job.

## After vendoring a new CATEGORY

Everything above, plus: the step flows, the tool order and the denture-specific steps each read the
kind directly — roughly thirteen files. `docs/handoff-records.md#geocore-item-kinds` holds the standing
request for **dental model**, **night guard** and **retainer**, with what each one needs; the art for
the last two is already drawn and marked `unwired` in `iconCatalogue.ts`.

The engine page's "scheme this is meant to become" is what makes a category that reuses an existing
pipeline a data change. Until that lands, a new category is an engine project.

## The guards that will catch you

| Test | What it fails on |
|---|---|
| `src/ui/iconCatalogue.test.ts` | an art file with no catalogue entry, or an entry with no file |
| `src/i18n.test.ts` | an English string with no zh-Hant or ja |
| `src/ui/japaneseSubset.test.ts` | a Japanese character outside the built font subset — run `npm run fonts` |
| `src/items/ItemsPage.test.tsx` | a repeated `data-ui`, and the deck's answered/unanswered states |
| `src/ui/cssSelectorLists.test.ts` | a selector list that runs into the next rule |
| `npm run gate:real` | **every engine change**: all the local real scans, the owner's standing rule |

## Wording

zh-Hant is **Taiwan** wording, produced through `~/.config/gemini/gemini_chat.py`, never hand-written
and never a mainland term. The two profiles were translated this way on 2026-11-18: 通用牙套 /
汎用アライナー and 通用假牙 / 汎用義歯 — both reading as *general-purpose*, not *standard*.
