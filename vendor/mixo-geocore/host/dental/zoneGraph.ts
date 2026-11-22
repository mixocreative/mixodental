/*
 * ONE JOB: hand the engine the zone graph the node editor composed, and say plainly what happened.
 *
 * The graph is the editor's own JSON (mixoDental `dentalwork/batch-review/nodeGraph.mjs`), so the graph
 * an operator draws is the graph that runs. The engine validates it when it is SET - a graph that
 * would not run is refused with the node named, and the previous graph stays in force - so a run can
 * never fail halfway, and never silently ignore an edit.
 *
 * The digest that comes back is what the run reports. It is how anyone reading a result can tell an
 * edited graph ran from the default running, which otherwise look exactly alike on screen.
 */
import { dentalEngine } from './dentalEngine';

/** A graph the engine refused, with the node and reason in `detail`. */
export class ZoneGraphRefused extends Error {
  constructor(readonly detail: string) {
    super(`The engine refused the zone graph: ${detail}`);
    this.name = 'ZoneGraphRefused';
  }
}

/**
 * Make `graph` the zone graph the next denture analyses evaluate, or pass `null` for today's default.
 * A graph with `kind: 'aligner'` goes to the aligner's locked graph instead: only its default is accepted,
 * it returns "default", and it never clears the denture's graph (build step 4.4).
 * Returns the digest now in force ("default" when cleared). Throws `ZoneGraphRefused` naming the node
 * when the engine will not run it - and then the previous graph is still the one in force.
 */
export function setZoneGraph(graph: unknown): string {
  try {
    return dentalEngine().set_zone_graph(graph === null ? '' : JSON.stringify(graph));
  } catch (error) {
    const detail = (error as { detail?: unknown })?.detail;
    if ((error as Error)?.message === 'ZONE_GRAPH_INVALID' && typeof detail === 'string') throw new ZoneGraphRefused(detail);
    throw error;
  }
}

/** The digest of the zone graph in force, or "default". */
export function zoneGraphDigest(): string {
  return dentalEngine().zone_graph_digest();
}
