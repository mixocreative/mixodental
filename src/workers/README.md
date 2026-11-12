# `src/workers` — everything that runs off the main thread

32 files, and they are not 32 independent things: **every job is a client / protocol / worker
triple.** Read the protocol first — it is the contract, it is the shortest file, and it names what
crosses the thread boundary and whether it is copied or transferred.

| job | client (main thread) | protocol (the contract) | worker (the body) |
|---|---|---|---|
| **analysis** — automatic placement, support checks | `analysisClient.ts` | `analysisProtocol.ts` | `analysisWorker.ts` |
| **import** — STL / glTF to a welded, centred mesh | `importClient.ts` | `importProtocol.ts` | `importWorker.ts` |
| **project** — open a `.mixodental` file | `projectClient.ts` | `projectProtocol.ts` | `projectWorker.ts` |
| **mesh** — support build and export | (geocore's `host/workers/meshClient`) | (geocore's `meshProtocol`) | `meshWorker.entry.ts` over geocore's body |

The mesh job is the odd one out on purpose: its client, protocol and body live in the **vendored
engine** (`vendor/mixo-geocore/host/workers/`), and `meshWorker.entry.ts` is only the Vite entry that
wraps it. If you are looking for support-build logic, it is not in this folder.

## The shared plumbing

| file | its one job |
|---|---|
| `factories.ts` | **the only place a `Worker` is constructed.** Start here when a worker will not start |
| `engineSource.ts` | where this realm's engine comes from — the vendored `pkg-browser`, bundled by Vite |
| `jobErrors.ts` | a worker's typed error turned into a sentence, with numbers in the reader's locale |
| `analysisJobVocabulary.ts` | which words an analysis job's progress and failures use |
| `prepareImport.ts` | the bulk glTF transform and first-seen weld, before the mesh crosses back |
| `stlSession.ts` | the streaming STL read, and the Rust error codes mapped back to typed errors |
| `pickIndexes.ts` | the Rust BVH pick indexes the import worker built, handed to the main thread |

## Why it is shaped this way

- **A protocol is a file, not a convention.** Both sides import the same types, so a message that
  changes shape is a compile error on both ends rather than a runtime surprise.
- **Transfer, don't copy.** A print mesh is tens of megabytes; the protocols say per message whether
  a buffer is transferred (ownership moves, the sender must not touch it again) or copied.
- **A worker's lifetime is part of its job.** The project worker lives only while a file is read;
  the analysis worker takes one job at a time and the client never sends a second before the first
  lands. Both facts are in the protocol's doc comment, not in folklore.
- **Memory first.** Several files exist only to keep peak memory down — slice reads, display copies
  for heavy meshes, counted triangles. Do not "simplify" one of those into a whole-file read.

## Rules for editing here

1. Change the protocol first, then the two sides. If you only change one side, say which.
2. Never construct a `Worker` outside `factories.ts`.
3. Never import a worker body from the main thread — it pulls the engine into the main bundle.
4. The vendored engine is consumed as built. Nothing in this folder edits `vendor/`.
