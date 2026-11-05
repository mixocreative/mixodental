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
