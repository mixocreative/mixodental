// ONE JOB: copy, paste and duplicate nodes of a node graph, for any graph library that says which kinds may be copied
// and how a fresh id is made - the zone graph (`nodeGraph.mjs`) and the Orient graph (`orientGraph.mjs`) each build
// their own three functions from it, so both canvases copy by the same rules (reviewer overhaul step 13; several nodes
// at once and the Orient canvas, 2026-11-26).
//
// A copy is a CLIP: `{ category, nodes, left }`. Pasting gives every copied node a fresh id, keeps the wires INSIDE
// the clip, and leaves a wire to a node NOT in the clip EMPTY and named in `cut` - never quietly re-routed to some node
// that happens to share an id in the other graph (the removeNode rule). Duplicating is copying into the same graph,
// where those outside wires still point at real nodes, so they are kept.
//
// THE TRAP with several nodes: a box selection on the canvas easily takes in a node that may not be copied (a fixed
// node from an earlier tab). Refusing the whole copy for it would make box-select useless, and dropping it silently
// would be a gap - so it is left out and NAMED in `left`, and only a selection with nothing copyable is refused.

const byId = (graph, id) => graph.nodes.find((n) => n.id === id);
const clone = (node) => JSON.parse(JSON.stringify(node));

/**
 * The copy functions for one graph library.
 * @param {{ refusal(kind: string): string | null, freshId(graph: object, kind: string): string,
 *           locked?(graph: object, verb: 'copy' | 'paste'): string | null }} rules
 *   `refusal` says why a kind may not be copied (null: it may); `locked` says why a whole graph takes no copy or paste.
 */
export function clipTools({ refusal, freshId, locked = () => null }) {
  /** Every node id `id` reads from, transitively, that may be copied (a refused kind stops the walk). */
  function upstream(graph, id, seen) {
    const node = byId(graph, id);
    if (!node || seen.has(id)) return seen;
    seen.add(id);
    for (const from of Object.values(node.inputs)) {
      const source = from && byId(graph, from);
      if (source && !refusal(source.kind)) upstream(graph, from, seen);
    }
    return seen;
  }

  /**
   * The clip for `ids` (one id or several) and, with `withInputs`, every node feeding them, from a graph of `category`.
   * A node that may not be copied is left out and named in `left` ("RIM: found on an earlier tab ..."); when NOTHING
   * asked for may be copied, the copy is refused with the reason.
   * @returns {{ category: string, nodes: object[], left: string[] }}
   */
  function copyNodes(graph, ids, { category, withInputs = false }) {
    const why = locked(graph, 'copy');
    if (why) throw new Error(why);
    const asked = [ids].flat();
    if (asked.length === 0) throw new Error('select a node on the canvas first');
    const take = new Set();
    const left = [];
    for (const id of asked) {
      const node = byId(graph, id);
      const no = !node ? `no node ${id}` : refusal(node.kind);
      if (no) left.push({ id, no });
      else if (withInputs) upstream(graph, id, take);
      else take.add(id);
    }
    if (take.size === 0) throw new Error(left.length === 1 ? left[0].no : `nothing copied: ${left.map((l) => `${l.id} - ${l.no}`).join('; ')}`);
    return { category, nodes: graph.nodes.filter((n) => take.has(n.id)).map(clone), left: left.map((l) => `${l.id}: ${l.no}`) };
  }

  /**
   * `clip` pasted into `graph` (of `category`): `{ graph, ids, cut }` - the new ids by old id, and every wire left empty
   * because its source was not in the clip, as "NODE.input (was SOURCE)". `keepOutside` keeps such wires instead (a
   * duplicate in the same graph, where those sources exist).
   */
  function pasteNodes(graph, clip, { category, keepOutside = false }) {
    const why = locked(graph, 'paste');
    if (why) throw new Error(why);
    if (clip.category !== category) throw new Error(`these nodes were copied from a ${clip.category} type - a ${category} graph cannot take them`);
    for (const n of clip.nodes) { const no = refusal(n.kind); if (no) throw new Error(no); }
    let next = graph;
    const ids = {};
    for (const n of clip.nodes) {
      const fresh = freshId(next, n.kind);
      ids[n.id] = fresh;
      next = { ...next, nodes: [...next.nodes, { ...clone(n), id: fresh, inputs: {} }] };
    }
    const cut = [];
    const nodes = next.nodes.map((n) => {
      const from = clip.nodes.find((c) => ids[c.id] === n.id);
      if (!from) return n;
      const inputs = Object.fromEntries(Object.entries(from.inputs).map(([input, source]) => {
        if (source === null) return [input, null];
        if (source in ids) return [input, ids[source]];
        if (keepOutside && byId(graph, source)) return [input, source];
        cut.push(`${n.id}.${input} (was ${source})`);
        return [input, null];
      }));
      return { ...n, inputs };
    });
    return { graph: { ...next, nodes }, ids, cut };
  }

  /** Duplicate `ids` (with `withInputs`, their feeding nodes too) in their own graph: the copies read what they read. */
  function duplicateNodes(graph, ids, { category, withInputs = false }) {
    const clip = copyNodes(graph, ids, { category, withInputs });
    return { ...pasteNodes(graph, clip, { category, keepOutside: true }), left: clip.left };
  }

  return { copyNodes, pasteNodes, duplicateNodes };
}
