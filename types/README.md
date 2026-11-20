# types/ - the dental types the workbench saved

One file per type: `types/<category>/<id>.type.json` (category `denture` or `aligner`). Committed on
purpose - a type is a clinical recipe, so it is reviewed, gated and identical on every machine (owner
ruling 2, `docs/TYPE-PIPELINE.md` section 7).

**How a file gets here.** In the folder review (`dentalwork/batch-review`), set the type's name and
print-angle search in **1 Orient**, edit **2 Zones** and **3 Support settings**, press **Apply and run
again**, then **Save type**. Save copies the type that RAN - with the proof record of that run - never
edits that did not run.

**What is in one.** The WHOLE profile (never differences from Generic), the rules it pins, its zone
graph (or `null` for the default wiring), and a `validation` record: engine version, fingerprints of
the profile and graph, and fingerprints of the scans it ran on - fingerprints of the bytes, never file
names, because those are patient scans. `"proved": true` is the owner's hand override: it counts as
proved, and is shown as "proved by hand".

**Who reads them.** `npm run benchwork -- --kind denture --type types/denture/<id>.type.json <folder>`
runs one on real scans. The one reader is `src/dentalTypes/typeFile.ts`: a missing or unknown key, a
rule the category does not read, or a graph that cannot run is refused by name. The app does not load
this folder yet - that is unit D1/A1 in `docs/TYPE-PIPELINE.md`, and until the zone graph is registered
with its type (E3) a type that carries a graph must be refused there, not run on the default wiring.
