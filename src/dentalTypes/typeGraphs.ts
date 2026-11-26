/*
 * ONE JOB: a saved type's own zone graph and Orient graph (WORKBENCH-TABS-PLAN E1) - checked with the engine's own
 * refusals when the type loads, and put in force before every denture job on that type.
 *
 * WHY PER JOB. The engine holds ONE zone graph and ONE Orient graph per realm, like the drawn rim and the case flip.
 * A job that did not set them would run on whatever the previous job's type left in force - so the denture core sets
 * all four slots together (`setCaseSlots` in dentureCore.ts), and a type without a graph sets the default back.
 *
 * WHY THE ENGINE CHECKS. `src/` imports nothing from `typelab/`, so the Type Lab's validators are not here. The
 * engine validates a graph when it is SET and refuses with the node named, leaving the previous graph in force; the
 * check sets, catches that reason, and clears the slot again. Both digests are in the engine's cache keys, so setting
 * the same graph again before a job costs a parse, not a rerun.
 */
import { ZoneGraphRefused, setZoneGraph } from '@mixo-geocore/host/dental/zoneGraph';
import { OrientGraphRefused, setOrientGraph } from '@mixo-geocore/host/dental/orientGraph';

interface TypeGraphs { zone: Record<string, unknown> | null; orient: Record<string, unknown> | null }

/** This realm's denture types that carry a graph, by profile id. Every realm registers the types itself (typesReady). */
const byProfile = new Map<string, TypeGraphs>();

/**
 * Why the engine will not run `graph` as a zone graph under the type's pinned `rules`, or nothing. The slot is left at
 * the default either way.
 */
export function zoneGraphProblems(graph: Record<string, unknown>, rules: Readonly<Record<string, unknown>> = {}): string[] {
  // The steep ray is read by the zones only when the graph sets it, but by the policy and the report through the rule
  // noSupportSteepDeg, so the two must agree - the workbench's steepAngleProblem, which the app cannot import.
  const steep = (graph.nodes as { id?: string; params?: { deg?: unknown } }[] | undefined)?.find?.((n) => n.id === 'R1b')?.params?.deg;
  const rule = rules.noSupportSteepDeg;
  if (steep !== undefined && rule !== undefined && Number(steep) !== Number(rule)) return [`the zone graph sets the steep ray R1b to ${String(steep)} deg but the type pins noSupportSteepDeg ${String(rule)}: the zones would use one and the report the other`];
  if (Number(steep) > 0 && rule === undefined) return [`the zone graph turns the steep ray R1b on (${String(steep)} deg) but the type does not pin noSupportSteepDeg to it, so the policy and the report would treat it as off`];
  return engineProblems(() => setZoneGraph(graph), () => setZoneGraph(null), ZoneGraphRefused);
}

/** Why the engine will not run `graph` as an Orient graph, or nothing. The slot is left at the default either way. */
export function orientGraphProblems(graph: Record<string, unknown>): string[] {
  return engineProblems(() => setOrientGraph(graph), () => setOrientGraph(null), OrientGraphRefused);
}

function engineProblems(set: () => unknown, clear: () => unknown, Refused: typeof ZoneGraphRefused | typeof OrientGraphRefused): string[] {
  try {
    set();
    return [];
  } catch (error) {
    if (error instanceof Refused) return [error.detail];
    throw error;
  } finally {
    clear();
  }
}

/** Remember a loaded denture type's graphs for its jobs (none: its jobs run the defaults). */
export function rememberTypeGraphs(profileId: string, zone: Record<string, unknown> | null, orient: Record<string, unknown> | undefined): void {
  if (zone || orient) byProfile.set(profileId, { zone, orient: orient ?? null });
  else byProfile.delete(profileId);
}

/**
 * Whether a case on `profileId` has a front and a teeth side the Flip buttons can turn round. The case flip acts
 * inside the Orient graph's `upDecision` node, so a type whose Orient graph has none (the flat-base recipe) would
 * leave the buttons doing nothing - silently - without this.
 */
export function typeHasSides(profileId: string | undefined): boolean {
  const orient = profileId === undefined ? undefined : byProfile.get(profileId)?.orient;
  return !orient || ((orient.nodes ?? []) as { kind?: string }[]).some((n) => n.kind === 'upDecision');
}

/** Put `profileId`'s graphs in force - or the defaults, for a type without them. Call before EVERY denture job. */
export function applyTypeGraphs(profileId: string): void {
  const graphs = byProfile.get(profileId);
  setZoneGraph(graphs?.zone ?? null);
  setOrientGraph(graphs?.orient ?? null);
}
