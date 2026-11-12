# `src/state` — the scene, the file, and the history

21 files. The scene is plain data: a `PrintScene` of `PrintUnit`s, each with its source mesh,
transform, settings and hand work. Nothing here renders, and nothing here talks to a worker.

## The contract

| file | its one job |
|---|---|
| `project.ts` | **the scene's types.** `PrintScene`, `PrintUnit`, `ModelTransform`, the settings contract. Read this first; the rest of the folder serves it |
| `projectFile.ts` | the saved file: the scene's JSON under a header naming the app and the format version |
| `revisions.ts` | the per-unit revision counters that tell a stale result from a current one |
| `stepKind.ts` | what a unit's change *was*, by the first field that differs — `undefined` when only view state moved |

## Getting geometry in

| file | its one job |
|---|---|
| `import.ts` | import as pure `TriangleMesh` results, plus the plate-placement host logic. three.js appears only at the edge, for glTF's scene graph |
| `meshExtras.ts` | what the import worker prepares for the viewport beside a unit's mesh |
| `diagnosis.ts` | the worker's health verdict for the full-resolution mesh |

## History

| file | its one job |
|---|---|
| `history.ts` | snapshot undo/redo and the depth retained; older snapshots are dropped |

## Migration

| file | its one job |
|---|---|
| `overhangMigration.ts` | one Overhang angle since engine 58; a unit saved before it carries the old generic `scatterAngle` |
| `runtime.ts` | which runtime tier the memory budgets apply to — `desktop` in an Electron-like shell |

## Why it is shaped this way

- **The scene is data, not objects with behaviour.** Undo is a snapshot of it, saving is a
  serialisation of it, and a worker result is merged into it. Give a unit a method and all three
  stop being simple.
- **A migration is a file with a date and a reason**, never a conditional sprinkled through the
  readers. When a saved field changes meaning, the old meaning goes here with the engine version
  that changed it.
- **Revisions are how staleness is decided**, not timestamps and not deep equality. A result that
  answers an older revision is refused rather than merged.

## Rules for editing here

1. A new field on `PrintUnit` needs: a default for a scene that predates it, a line in
   `normalizeUnit`, and a decision about whether it belongs in `stepKind`'s comparison.
2. Nothing in this folder imports from `src/components` or `src/workers`. The dependency runs the
   other way, and `src/core/imports.test.ts` enforces it.
3. If a change alters what a saved file means, it needs a migration here and a test that opens a
   file written before it.
