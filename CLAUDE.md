## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- Reach for `graphify query "<question>"` when you need a **map**: an unfamiliar area, which files take part in something, or how two things connect (`graphify path "<A>" "<B>"`, `graphify explain "<concept>"`). It returns a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output. Put the same advice in subagent prompts that explore code.
- Go straight to the file when you already know where to look — a named symbol, a `file:line` from a handoff or a test failure, a string you can grep. The graph is a map, not a turnstile, and a map is no help when you have the address.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- **Run `graphify update .` before you finish a session in which you changed code** (AST-only, no API cost). Not after each edit: the rebuild walks the whole tree, and per-edit is a cost nobody pays, which is how the graph went 59 commits stale. If it has drifted a long way, `graphify label` refreshes community names, which `update` deliberately leaves alone because that step costs an LLM call.
- A committed graphify-out/graph.json is rewritten whole on every build, so a large diff to it in a pull request is expected. Do not flag it as churn or suggest skipping the graph rebuild or its hooks.

<!--
Revised 2026-11-06, with the owner's agreement, after the rules were measured against a long session
rather than assumed:

- "Run `graphify query` BEFORE your first grep, search or source-file read" was a mandate, and a
  mandate on a tool whose value varies. Used that way once here, on "what does Step 2's dock show", it
  returned 292 nodes truncated to 65 with a note to raise the budget; the answer came faster from
  docs/ROADMAP.md and the component itself. The graph earns its keep for maps, not for addresses, and
  the rule now says which is which.
- "After modifying code, run `graphify update .`" had left the graph **59 commits stale**, with no hook
  to catch it. A rule nobody keeps is worse than none, because the graph then looks current while it
  is not. Moved to once per session, which is a cost someone will actually pay.

If per-session also proves too easy to forget, the honest next step is a Stop hook rather than
stronger wording - structure keeps a rule that memory does not.
-->

## code principle

Every task's last step: the code is modular, human-readable and organised for maintainability, the
comments are written, every affected `.md` is updated, and the work is pushed. Part of the task, not
a later cleanup pass.

The test applied before any extraction in this repo: **a module is clean when its output is narrower
than its input.** Count the host fields handed in against the values handed back. A module that needs
nearly as much as it returns is a hub, not a job, and moving it is motion rather than modularity —
which is why `src/plate/buildViews.ts` and `src/components/useSupportBuilds.ts` exist while the
`built`/`failedBuilds` maps stayed in `App.tsx`. Pure rules go in a plain module and get a test;
`src/components/README.md` and `src/deck/README.md` carry the rest.

## two graphs, two jobs, one source of truth

Owner's rules, 2026-11-09. Two code graphs are installed and they are not interchangeable.

**Separate stores. Never write one into the other's directory or database.**

| | graphify | CodeGraphContext (CGC) |
|---|---|---|
| store | `graphify-out/` - committed, rewritten whole by `graphify update .` | `C:\Users\DCT\.local\cgc-db\mixodental` - OUTSIDE the repo, never committed |
| run as | the `graphify` CLI | the venv at `C:\Users\DCT\.local\venvs\codegraphcontext` - its own venv on purpose: installing it `--user` dragged `protobuf` down to 3.20.3 and broke `grpcio-status` in this machine's ML environment |

**Ask the right one, and ask only one.**

- **CGC first, for code RELATIONSHIPS:** callers, callees, call chains, class hierarchies, blast
  radius. That is what it models and graphify does not - graphify has no node for a prop or a
  parameter, which is why `onPick` being destructured and never called was invisible to it.
- **graphify when CGC is not enough, for ARCHITECTURAL context:** communities, god nodes, the wiki,
  and the doc-to-code edges. `graphify affected "X"` lists the `docs/` pages that reference a module,
  which is the fastest way to honour "update all the md". `explain`, `path` and `affected` are the
  cheap calls; a bare prose `query` returns noise at this size, so seed it (`--seed`) or cap it
  (`--budget`).
- Do not ask both the same question. Two answers to one question is not corroboration - it is twice
  the tokens and a tie-break nobody owns.

**Neither graph is authoritative.** The code and `docs/` are. A graph answer that disagrees with the
source means the index is stale: rebuild it, do not file a finding against the code.

**And neither is the first tool for an unused binding.** `tsconfig.json` sets `noUnusedLocals` and
`noUnusedParameters`, so a binding nothing reads fails the build. That is cheaper and more certain
than either graph, and it is what finally named the dead tool rail.
