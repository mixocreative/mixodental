/*
 * The denture island report of the batch review, from the engine (host/dental/dentureIslands.ts): one source for the
 * island layers, the unresolved count and the facts line. An island is resolved when a planned tip serves it and the
 * build did not leave that tip out (`settleIslands`). Pure functions on the engine's islands; no geometry here.
 *
 *   (used by dentureReviewLayers.ts and reviewCase.ts; tested by islandReport.test.ts)
 */
import type { Vector } from '@mixo-geocore/host/core/vec3';
import { settleIslands, type DentureIsland } from '@mixo-geocore/host/dental/dentureIslands';

/** What the build adds to the plan: the policy's candidate ids in order, and the tips the build left out. */
export interface IslandSettle { candidateIds: readonly string[]; leftOut: readonly { id: string; reason: string }[] }

export interface IslandSummary {
  /** Every island with its final state (after the build). */
  islands: DentureIsland[];
  /** Islands no built tip serves: their lowest points float unless something else holds them. */
  unresolved: DentureIsland[];
  resolved: DentureIsland[];
  /** The unresolved ones whose lowest point is outside the allowed area (a subset of `unresolved`). */
  outsideAllowed: number;
}

/** The islands with the build's verdict added, split into resolved and not. */
export function summariseIslands(islands: readonly DentureIsland[], settle?: IslandSettle): IslandSummary {
  const settled = settle ? settleIslands(islands, settle.candidateIds, settle.leftOut) : [...islands];
  const unresolved = settled.filter((island) => !island.resolved);
  return { islands: settled, unresolved, resolved: settled.filter((island) => island.resolved), outsideAllowed: unresolved.filter((island) => island.state === 'outsideAllowed').length };
}

/** Lowest points to mark, one per island. */
export const islandPoints = (islands: readonly DentureIsland[]): Vector[] => islands.map((island) => island.position);

/** One island in words for the facts row: height above the lowest vertex, size, reason. */
export const describeIsland = (island: DentureIsland): string =>
  `${island.heightMm.toFixed(1)} mm high, ${island.areaMm2.toFixed(2)} mm², ${island.reason}`;

/** The facts row for the unresolved islands ('none' when there are none). */
export const describeUnresolved = (unresolved: readonly DentureIsland[]): string =>
  unresolved.length === 0 ? 'none' : unresolved.map((island, k) => `#${k + 1}: ${describeIsland(island)}`).join('; ');
