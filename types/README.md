# types/ - the dental types the workbench saved

One file per type: `types/<category>/<id>.type.json` (category `denture` or `aligner`). Committed on
purpose - a type is a clinical recipe, so it is reviewed, gated and identical on every machine (owner
ruling 2, `docs/TYPE-PIPELINE.md` section 7).

**How a file gets here - the New-type strip.** In the folder review (`dentalwork/batch-review`), the **Type**
strip above the stage tabs walks it: press **New type** (starts from the built-in), type its **name** (the
full name the app shows; the **id** follows it until you type one), an optional **badge**, and the
**category** is the app's list - the folder on screen decides which one runs. Then, if you want, edit
**1 Orient** (the print-angle search), **2 Zones** and **3 Settings**; press **Apply and run again**; then
**Save type**. The strip marks each step from what happened (named, run, saved). Save copies the type that
RAN - with the proof record of that run - never edits that did not run. A newly named type may be run with
no other edit: that is how a type keeping the built-in's numbers gets its own name and badge.

**What is in one.** The WHOLE profile (never differences from Generic), the rules it pins, its zone
graph (or `null` for the default wiring), and a `validation` record: engine version, fingerprints of
the profile and graph, and fingerprints of the scans it ran on - fingerprints of the bytes, never file
names, because those are patient scans. `"proved": true` is the owner's hand override: it counts as
proved, and is shown as "proved by hand".

**Who reads them.** `npm run benchwork -- --kind denture --type types/denture/<id>.type.json <folder>`
runs one on real scans. The one reader is `src/dentalTypes/typeFile.ts`: a missing or unknown key, a
rule the category does not read, or a graph that cannot run is refused by name.

**The app loads this folder** (docs/TYPE-PIPELINE.md section 8a). Every `types/<category>/<id>.type.json`
is read at build time (`src/dentalTypes/typesReady.ts`, a glob - the folder IS the list) and registered in
every engine realm, so a committed type appears in the app's type picker with no code change: its full name
(`profile.name` - the name typed on the strip, in all three languages until someone translates it; else the
id) and its badge. A file the app cannot use
is listed on the items page ("N saved types could not load") with the reason - never dropped quietly, never
replaced by Generic. Today it refuses, with that reason:
- an **aligner** type (the aligner side of the app knows built-in aligners only - the next step);
- a type with **its own zone graph** (one engine graph for everything until the graph is registered with
  its type) or that **pins rules** (each unit's settings are its rules in the app today);
- an id or a name (in any language) another profile already has.

**Proof is not required to load** (owner, 2026-11-22: "Do not need prove, make it easier"). The
`validation` record is still written, as information; the app never refuses a type for it.

**The badge.** Up to 5 characters, no spaces, typed on the New-type strip (`"badge": "SOFT"` in the file). Absent = `G`. It is not part of the profile, so it changes no fingerprint.

**The category** is chosen from the app's list (today denture or aligner), never typed: a new category is a
code change - see `src/components/README.md`, "Adding a category".
