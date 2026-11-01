# src/denture: the denture workflow

The dental flow's denture job (Round D): start card, Step 1 orientation, Step 2 supports, the denture
settings, the parts list and the raft default. The aligner flow stays in `src/components` and
`src/dental`; shared pieces (step nav, dial, unresolved bubble) are reused from there, never copied.
Engine calls go through `engine/` only.

| Module | Purpose |
|---|---|
| `jobKind.ts` | The job kind of a profile id (`denture` / `aligner`) and the reference denture profile id. |
| `steps/start/DentureChoice.tsx` | The start screen's "Denture supports" card. |
| `steps/start/startText.ts` | The file step's words per job kind. |
