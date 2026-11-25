# types/ - the dental types the workbench saved

**One file per SAVE, append-only** (owner, 2026-11-25): `types/<category>/<id>.<YYYYMMDD-HHMMSS>.type.json`
(category `denture` or `aligner`, the stamp in UTC so the names sort in time order). Committed on purpose - a type is
a clinical recipe, so it is reviewed, gated and identical on every machine (owner ruling 2, `docs/TYPE-PIPELINE.md`
section 7).

- **The newest save of a type is the one in force** - by its NAME, never the file's time (git keeps no file times).
  An old undated `<id>.type.json` still loads, as that type's oldest save.
- **Rollback = delete the newest file**: the save before it is in force again. **Retire a type = delete all its
  files** (projects that use it then refuse to open, naming it). Deleting is done here, on the files, never in the
  workbench; git keeps the history.
- **A broken newest save falls back** to the one before it, and the app's files page says which save stands in
  and why (`src/dentalTypes/shippedTypes.ts`, `typeSaves.mjs`). Only one save down is tried.
- **Never edit a file by hand**: its proof record would vouch for numbers it never saw. Open it in the workbench.

**How a file gets here - the review workbench** (`npm run review`, or `view-batch-review.bat`;
`docs/REVIEWER-OVERHAUL-PLAN.md`). **Import scans** (a folder or a path - read in place, never copied; an owner's
`-sup.stl` is a reference, never run), pick a **type**: its whole setup opens in the editors (both graphs, the Rim
numbers, the search, the rules, name, badge), and every restore mark puts back what THAT type saved. Edit, **Apply**
(the whole draft runs on the scan on screen; Run all runs the rest), compare with another type on the same scans
(**Compare with**, **Flip** / C), then **Save type**: a NEW dated file, with the proof of the scans it ran on. Save
refuses a draft that never ran, a new draft under an id already saved, a save that would hide a newer one than
you opened, and - before anything is written - a built-in's id or a name another listed type already has (the app
would refuse one of the two). A built-in is read-only: **Duplicate** it (a new id and name, based on it), or give it a
new id AND name in the Type strip. A file deleted or added here by hand shows in the workbench at the next import or
page load (the server watches this folder).
Renaming the name or badge is a new save of the same id; renaming the id is a new type (projects store the id, so
the old one keeps loading). Save does not commit or push - it names the file; commit and push it yourself, after the
local gate.

**What is in one.** The WHOLE profile (never differences from Generic), the rules it pins, its zone
graph (or `null` for the default wiring), and a `validation` record: engine version, fingerprints of
the profile and graph, and fingerprints of the scans it ran on - fingerprints of the bytes, never file
names, because those are patient scans. `"proved": true` is the owner's hand override: it counts as
proved, and is shown as "proved by hand".

**Who reads them.** `npm run benchwork -- --kind denture --type types/denture/<id>.type.json <folder>`
runs one on real scans. The one reader is `src/dentalTypes/typeFile.ts`: a missing or unknown key, a
rule the category does not read, or a graph that cannot run is refused by name.

**The app loads this folder** (docs/TYPE-PIPELINE.md section 8a). Every `types/<category>/*.type.json`
is read at build time (`src/dentalTypes/typesReady.ts`, a glob - the folder IS the list; every save is bundled, about
2.5 KB each, and a test fails past 1 MB) and the NEWEST save of each type is registered in every engine realm, so a committed type appears in the app's type picker with no code change: its full name
(`profile.name` - the name typed on the strip, in all three languages until someone translates it; else the
id) and its badge. A file the app cannot use
is listed on the items page ("N saved types could not load") with the reason - never dropped quietly, never
replaced by Generic. Today it refuses, with that reason:
- a pinned **denture option** whose value the unit's control cannot show (a model landing other than 0 / 1 / 2, a
  clearance floor outside 0.5 to 1.5 mm). Pinned rules otherwise load (`src/dentalTypes/typeRules.ts`): the four a
  unit sets with its own controls - the Overhang angle `overhangAngleDeg` and the denture options `dentalModelLanding`,
  `lowOutsideAllowed`, `lastResortClearanceMm` - become the starting values of a new unit's controls, which own them from
  there; every other pinned rule rides in each job on the type;
- a zone or Orient graph **the engine will not run** (checked by the engine itself when the type loads,
  `src/dentalTypes/typeGraphs.ts`), or a zone graph that turns the steep ray R1b on (the rule it needs
  cannot be pinned yet). A runnable graph loads since 2026-11-23 and is put in force before every
  denture job on its type (WORKBENCH-TABS-PLAN E1);
- an id or a name (in any language) another profile already has.

**Proof is not required to load** (owner, 2026-11-22: "Do not need prove, make it easier"). The
`validation` record is still written, as information; the app never refuses a type for it.

**The badge.** Up to 5 characters, no spaces, typed on the New-type strip (`"badge": "SOFT"` in the file). Absent = `G`. It is not part of the profile, so it changes no fingerprint.

**The category** is chosen from the app's list (today denture or aligner), never typed: a new category is a
code change - see `src/components/README.md`, "Adding a category".
