# docs/ — the map

Seventy-odd files, so this is the map rather than a list to read through. The rule the folder works
by: **a document says when it was written and what it decided.** Dated files are a record of a
moment and are not edited to match later reality — they are superseded by a newer dated file, or
corrected in place with the correction marked, so a reader can tell what was believed when.

| where | what is in it | read it when |
|---|---|---|
| `HANDOFF.md` | the running engineering handoff: what landed, what it cost, what is open | picking the work back up |
| `SHIP-PLAN.md` · `ROADMAP.md` | the ordered plan, and the longer arc | deciding what is next |
| `VERIFICATION.md` | what the gate and the walk each prove, and what neither does | before claiming something is verified |
| `designer-guide.md` · `ui-styling.md` | the UI vocabulary and the styling rules | touching anything the operator sees |
| `BLENDER_PARITY.md` · `SLASG_NODE_LOGIC.md` | the external references the engine is checked against | changing geometry or placement |
| `dental-rework-handoff.md` | the dental rework's own handoff | working the dental steps |
| `design/` | dated design documents — one per decision, with the reasoning | before changing what a feature IS |
| `handoff/` | dated handoffs and human-test notes | resuming, or preparing a hand-over |
| `reviews/` | dated review and audit reports (`cia`, `egm`, wiring walks) | looking for what a review already found |
| `migration/` | dated migration notes | moving data or formats |
| `dental-reference/` | the clinical and print references the dental rules cite | questioning a dental number |
| `superpowers/` | plans and specs from the superpowers workflow | archaeology on an older plan |
| `images/` | figures the documents above reference | — |

## Naming

Dated documents are `YYYY-MM-DD-<subject>.md`, kebab-case, in the folder that matches their kind —
`design/2026-11-12-three-repo-refactor-plan.md`, `reviews/2026-11-11-cia-audit.md`. Review reports
carry the tool that produced them in the name (`cia`, `egm`, `wiring-walk`) because which instrument
found something is part of how much weight it carries.

Undated files at the top level are **living** documents: they are kept current, and a stale one is a
defect. The dated ones are the opposite, and correcting them in place without marking the correction
is how a record stops being a record.

## One thing worth knowing before you trust a green run

`VERIFICATION.md` has the detail, and it is worth the two minutes. The short version: the **gate**
(`npm run gate`) proves the build and the engine's numbers; the **walk** (`npm run walk`) proves the
workflow in a browser, and it is the only thing that exercises generate counts, because CI runs the
walk in two shards that leave section `a` out. The gate now says so itself — its verdict reads
`PASS (INCOMPLETE - the ship definition also requires walk, not run here)` when the walk has not
run. **Both receipts together are the ship evidence; neither alone is.** On 2026-11-13 a vendor bump
shipped and deployed with 92% of the automatic supports gone, under a receipt that read `PASS` on
the same line as `NOT run: walk`.
